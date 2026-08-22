window.LD = window.LD || {};
LD.VERSION = '1.0.0';

(function () {
  'use strict';

  // ── Namespace Seeds ──────────────────────────────────────────────
  LD.Iso = LD.Iso || {};
  LD.AI = LD.AI || {};
  LD.Components = LD.Components || {};
  LD.Systems = LD.Systems || {};
  LD.UI = LD.UI || {};

  // ── Event System ─────────────────────────────────────────────────
  const _listeners = {};

  LD.on = function (event, fn) {
    (_listeners[event] = _listeners[event] || []).push(fn);
    return function off() { LD.off(event, fn); };
  };

  LD.off = function (event, fn) {
    const arr = _listeners[event];
    if (!arr) return;
    const i = arr.indexOf(fn);
    if (i !== -1) arr.splice(i, 1);
  };

  LD.emit = function (event, data) {
    const arr = _listeners[event];
    if (!arr) return;
    for (let i = 0; i < arr.length; i++) arr[i](data);
  };

  // ── Entity Component System ──────────────────────────────────────
  let _nextEntityId = 1;

  class Entity {
    constructor(name) {
      this.id = _nextEntityId++;
      this.name = name || ('entity_' + this.id);
      this.tags = [];
      this.components = {};
      this.active = true;
    }
    addComponent(component) {
      const type = component.constructor._type || component.constructor.name;
      this.components[type] = component;
      component.entity = this;
      LD.emit('entity:componentAdded', { entity: this, component });
      return this;
    }
    removeComponent(ComponentClass) {
      const type = ComponentClass._type || ComponentClass.name;
      delete this.components[type];
      LD.emit('entity:componentRemoved', { entity: this, type });
      return this;
    }
    getComponent(ComponentClass) {
      const type = ComponentClass._type || ComponentClass.name;
      return this.components[type] || null;
    }
    hasComponent(ComponentClass) {
      const type = ComponentClass._type || ComponentClass.name;
      return type in this.components;
    }
    addTag(tag) {
      if (!this.tags.includes(tag)) this.tags.push(tag);
      return this;
    }
    hasTag(tag) {
      return this.tags.includes(tag);
    }
    destroy() {
      this.active = false;
      LD.emit('entity:destroyed', { entity: this });
    }
  }

  class Component {
    constructor(data) {
      this.entity = null;
      if (data) Object.assign(this, data);
    }
  }

  class System {
    constructor(requiredComponents) {
      this.required = requiredComponents || [];
      this.priority = 0;
      this.enabled = true;
    }
    init() {}
    update(dt, entities) {}
    render(ctx, entities) {}
    getEntities(entities) {
      return entities.filter(e =>
        e.active && this.required.every(c => e.hasComponent(c))
      );
    }
  }

  // ── World (ECS container) ────────────────────────────────────────
  class World {
    constructor() {
      this.entities = [];
      this.systems = [];
    }
    createEntity(name) {
      const e = new Entity(name);
      this.entities.push(e);
      return e;
    }
    destroyEntity(entity) {
      entity.destroy();
      this.entities = this.entities.filter(e => e !== entity);
    }
    addSystem(system) {
      this.systems.push(system);
      this.systems.sort((a, b) => a.priority - b.priority);
      system.init();
      return system;
    }
    removeSystem(system) {
      this.systems = this.systems.filter(s => s !== system);
    }
    update(dt) {
      for (let i = 0; i < this.systems.length; i++) {
        const s = this.systems[i];
        if (s.enabled) s.update(dt, this.entities);
      }
    }
    render(ctx) {
      for (let i = 0; i < this.systems.length; i++) {
        const s = this.systems[i];
        if (s.enabled) s.render(ctx, this.entities);
      }
    }
    query() {
      return this.entities.filter(e => e.active);
    }
    findByTag(tag) {
      return this.entities.filter(e => e.active && e.hasTag(tag));
    }
    findByName(name) {
      return this.entities.find(e => e.active && e.name === name) || null;
    }
    clear() {
      this.entities = [];
      this.systems = [];
    }
  }

  // ── Timer System ─────────────────────────────────────────────────
  const _timers = [];
  let _timerId = 1;

  LD.Timer = {
    after: function (delay, fn) {
      const t = { id: _timerId++, elapsed: 0, duration: delay, fn: fn, repeat: false, active: true };
      _timers.push(t);
      return t.id;
    },
    every: function (interval, fn) {
      const t = { id: _timerId++, elapsed: 0, duration: interval, fn: fn, repeat: true, active: true };
      _timers.push(t);
      return t.id;
    },
    cancel: function (id) {
      const idx = _timers.findIndex(t => t.id === id);
      if (idx !== -1) _timers.splice(idx, 1);
    },
    pause: function (id) {
      const t = _timers.find(t => t.id === id);
      if (t) t.active = false;
    },
    resume: function (id) {
      const t = _timers.find(t => t.id === id);
      if (t) t.active = true;
    },
    update: function (dt) {
      for (let i = _timers.length - 1; i >= 0; i--) {
        const t = _timers[i];
        if (!t.active) continue;
        t.elapsed += dt;
        if (t.elapsed >= t.duration) {
          t.fn();
          if (t.repeat) {
            t.elapsed -= t.duration;
          } else {
            _timers.splice(i, 1);
          }
        }
      }
    },
    clear: function () { _timers.length = 0; }
  };

  // ── Input Manager ────────────────────────────────────────────────
  const _keys = {};
  const _mouse = { x: 0, y: 0, buttons: [false, false, false], wheel: 0, down: {}, up: {} };
  const _touch = { active: false, x: 0, y: 0, startX: 0, startY: 0, moved: false };
  const _mouseDownCallbacks = {};
  const _mouseUpCallbacks = {};

  LD.Input = {
    isKeyDown: function (key) { return !!_keys[key.toLowerCase()]; },
    isKeyPressed: function (key) {
      const k = key.toLowerCase();
      if (_keys[k]) { _keys[k] = false; return true; }
      return false;
    },
    getMousePosition: function () { return { x: _mouse.x, y: _mouse.y }; },
    isMouseDown: function (button) { return _mouse.buttons[button || 0]; },
    onMouseDown: function (button, fn) {
      const key = 'mouse_' + (button || 0);
      (_mouseDownCallbacks[key] = _mouseDownCallbacks[key] || []).push(fn);
    },
    onMouseUp: function (button, fn) {
      const key = 'mouse_' + (button || 0);
      (_mouseUpCallbacks[key] = _mouseUpCallbacks[key] || []).push(fn);
    },
    getTouch: function () { return Object.assign({}, _touch); },
    getKeys: function () { return Object.assign({}, _keys); },
    _resetFrame: function () { _mouse.wheel = 0; _touch.moved = false; },
    _bindCanvas: function (canvas) {
      window.addEventListener('keydown', function (e) {
        _keys[e.key.toLowerCase()] = true;
        LD.emit('input:keydown', { key: e.key, code: e.code });
      });
      window.addEventListener('keyup', function (e) {
        _keys[e.key.toLowerCase()] = false;
        LD.emit('input:keyup', { key: e.key, code: e.code });
      });
      canvas.addEventListener('mousemove', function (e) {
        const r = canvas.getBoundingClientRect();
        _mouse.x = e.clientX - r.left;
        _mouse.y = e.clientY - r.top;
      });
      canvas.addEventListener('mousedown', function (e) {
        _mouse.buttons[e.button] = true;
        const key = 'mouse_' + e.button;
        if (_mouseDownCallbacks[key]) {
          _mouseDownCallbacks[key].forEach(fn => fn({ x: _mouse.x, y: _mouse.y, button: e.button }));
        }
        LD.emit('input:mousedown', { x: _mouse.x, y: _mouse.y, button: e.button });
      });
      canvas.addEventListener('mouseup', function (e) {
        _mouse.buttons[e.button] = false;
        const key = 'mouse_' + e.button;
        if (_mouseUpCallbacks[key]) {
          _mouseUpCallbacks[key].forEach(fn => fn({ x: _mouse.x, y: _mouse.y, button: e.button }));
        }
        LD.emit('input:mouseup', { x: _mouse.x, y: _mouse.y, button: e.button });
      });
      canvas.addEventListener('wheel', function (e) {
        _mouse.wheel = e.deltaY > 0 ? 1 : -1;
        LD.emit('input:wheel', { delta: _mouse.wheel });
      });
      canvas.addEventListener('touchstart', function (e) {
        e.preventDefault();
        const t = e.touches[0];
        const r = canvas.getBoundingClientRect();
        _touch.active = true;
        _touch.x = _touch.startX = t.clientX - r.left;
        _touch.y = _touch.startY = t.clientY - r.top;
        _touch.moved = false;
        LD.emit('input:touchstart', { x: _touch.x, y: _touch.y });
      }, { passive: false });
      canvas.addEventListener('touchmove', function (e) {
        e.preventDefault();
        const t = e.touches[0];
        const r = canvas.getBoundingClientRect();
        _touch.x = t.clientX - r.left;
        _touch.y = t.clientY - r.top;
        _touch.moved = true;
        LD.emit('input:touchmove', { x: _touch.x, y: _touch.y });
      }, { passive: false });
      canvas.addEventListener('touchend', function (e) {
        _touch.active = false;
        LD.emit('input:touchend', { x: _touch.x, y: _touch.y });
      });
      canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    }
  };

  // ── Physics Helpers ──────────────────────────────────────────────
  LD.Physics = {
    GRAVITY: 980,
    aabbOverlap: function (a, b) {
      return a.x < b.x + b.w && a.x + a.w > b.x &&
             a.y < b.y + b.h && a.y + a.h > b.y;
    },
    circleOverlap: function (a, b) {
      const dx = a.cx - b.cx;
      const dy = a.cy - b.cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist < a.r + b.r;
    },
    sphereOverlap: function (a, b) {
      const dx = a.cx - b.cx;
      const dy = a.cy - b.cy;
      const dz = a.cz - b.cz;
      return Math.sqrt(dx * dx + dy * dy + dz * dz) < a.r + b.r;
    },
    resolveAABB: function (dynamic, staticBody) {
      if (!LD.Physics.aabbOverlap(dynamic, staticBody)) return null;
      const overlapX = Math.min(dynamic.x + dynamic.w - staticBody.x, staticBody.x + staticBody.w - dynamic.x);
      const overlapY = Math.min(dynamic.y + dynamic.h - staticBody.y, staticBody.y + staticBody.h - dynamic.y);
      if (overlapX < overlapY) {
        if (dynamic.x + dynamic.w / 2 < staticBody.x + staticBody.w / 2) dynamic.x -= overlapX;
        else dynamic.x += overlapX;
        return 'horizontal';
      } else {
        if (dynamic.y + dynamic.h / 2 < staticBody.y + staticBody.h / 2) dynamic.y -= overlapY;
        else dynamic.y += overlapY;
        return 'vertical';
      }
    },
    applyVelocity: function (body, dt) {
      body.x += body.vx * dt;
      body.y += body.vy * dt;
    },
    applyFriction: function (body, dt) {
      body.vx *= Math.pow(body.friction || 0.9, dt * 60);
      if (Math.abs(body.vx) < 0.5) body.vx = 0;
    },
    integrateBody: function (body, dt) {
      if (body.isStatic) return;
      body.vy += LD.Physics.GRAVITY * (body.gravityScale || 1) * dt;
      LD.Physics.applyVelocity(body, dt);
      LD.Physics.applyFriction(body, dt);
    }
  };

  // ── State Machine ────────────────────────────────────────────────
  const _states = {};
  let _currentState = null;
  let _prevState = null;

  LD.State = {
    add: function (name, handlers) {
      _states[name] = {
        enter: handlers.enter || function () {},
        update: handlers.update || function () {},
        render: handlers.render || function () {},
        exit: handlers.exit || function () {}
      };
    },
    go: function (name, data) {
      if (_currentState && _states[_currentState]) _states[_currentState].exit(data);
      _prevState = _currentState;
      _currentState = name;
      if (_states[_currentState]) _states[_currentState].enter(data);
      LD.emit('state:change', { from: _prevState, to: _currentState });
    },
    current: function () { return _currentState; },
    previous: function () { return _prevState; },
    update: function (dt) {
      if (_currentState && _states[_currentState]) _states[_currentState].update(dt);
    },
    render: function (ctx) {
      if (_currentState && _states[_currentState]) _states[_currentState].render(ctx);
    }
  };

  // ── Asset Loader ─────────────────────────────────────────────────
  const _assets = { images: {}, sounds: {}, data: {} };

  LD.Assets = {
    get: function (type, name) { return _assets[type] ? _assets[type][name] : undefined; },
    getAll: function () { return _assets; },
    loadImage: function (name, src) {
      return new Promise(function (resolve, reject) {
        const img = new Image();
        img.onload = function () { _assets.images[name] = img; resolve(img); };
        img.onerror = function () { reject(new Error('Failed to load image: ' + src)); };
        img.src = src;
      });
    },
    loadSound: function (name, src) {
      return new Promise(function (resolve, reject) {
        const audio = new Audio();
        audio.oncanplaythrough = function () { _assets.sounds[name] = audio; resolve(audio); };
        audio.onerror = function () { reject(new Error('Failed to load sound: ' + src)); };
        audio.src = src;
      });
    },
    loadData: function (name, json) {
      try {
        const data = typeof json === 'string' ? JSON.parse(json) : json;
        _assets.data[name] = data;
        return Promise.resolve(data);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    loadImageBatch: function (map) {
      const promises = [];
      for (const name in map) {
        if (map.hasOwnProperty(name)) promises.push(LD.Assets.loadImage(name, map[name]));
      }
      return Promise.all(promises);
    },
    loadJSON: function (name, url) {
      return fetch(url).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function (data) {
        _assets.data[name] = data;
        return data;
      });
    },
    clear: function () {
      _assets.images = {};
      _assets.sounds = {};
      _assets.data = {};
    }
  };

  // ── Main Engine Core ─────────────────────────────────────────────
  let _canvas = null;
  let _ctx = null;
  let _world = null;
  let _running = false;
  let _paused = false;
  let _rafId = null;
  let _lastTime = 0;
  let _showFps = false;
  let _fpsFrames = 0;
  let _fpsTime = 0;
  let _fps = 0;
  let _currentGameJson = null;

  LD.init = function (canvasId) {
    _canvas = document.getElementById(canvasId);
    if (!_canvas) throw new Error('Canvas not found: ' + canvasId);
    if (!_canvas.getContext) throw new Error('Canvas 2D context not supported');
    _ctx = _canvas.getContext('2d');
    if (!_canvas.width) _canvas.width = 800;
    if (!_canvas.height) _canvas.height = 600;

    _world = new World();

    LD.Input._bindCanvas(_canvas);

    LD.emit('engine:init', { canvas: _canvas, ctx: _ctx });

    return { canvas: _canvas, ctx: _ctx, world: _world };
  };

  LD.getCanvas = function () { return _canvas; };
  LD.getContext = function () { return _ctx; };
  LD.getWorld = function () { return _world; };
  LD.Entity = Entity;
  LD.Component = Component;
  LD.System = System;
  LD.World = World;

  function _gameLoop(timestamp) {
    if (!_running) return;
    _rafId = requestAnimationFrame(_gameLoop);

    const dt = Math.min((timestamp - _lastTime) / 1000, 0.05);
    _lastTime = timestamp;

    if (_showFps) {
      _fpsFrames++;
      _fpsTime += dt;
      if (_fpsTime >= 1.0) {
        _fps = Math.round(_fpsFrames / _fpsTime);
        _fpsFrames = 0;
        _fpsTime = 0;
      }
    }

    if (!_paused) {
      LD.Timer.update(dt);
      LD.State.update(dt);
      _world.update(dt);
      LD.emit('engine:update', { dt: dt });
    }

    _ctx.clearRect(0, 0, _canvas.width, _canvas.height);
    LD.State.render(_ctx);
    _world.render(_ctx);
    LD.UI.render();
    LD.emit('engine:render', { ctx: _ctx });

    if (_showFps) {
      _ctx.save();
      _ctx.fillStyle = '#000';
      _ctx.globalAlpha = 0.6;
      _ctx.fillRect(4, 4, 70, 22);
      _ctx.globalAlpha = 1;
      _ctx.fillStyle = '#0f0';
      _ctx.font = '14px monospace';
      _ctx.fillText('FPS: ' + _fps, 10, 20);
      _ctx.restore();
    }

    LD.Input._resetFrame();
  }

  LD.start = function (gameJson) {
    if (!_canvas) throw new Error('Call LD.init() first');
    if (gameJson) _currentGameJson = gameJson;
    _running = true;
    _paused = false;
    _lastTime = performance.now();
    _fpsFrames = 0;
    _fpsTime = 0;
    _fps = 0;
    LD.emit('engine:start', {});
    _gameLoop(_lastTime);
  };

  LD.stop = function () {
    _running = false;
    if (_rafId) cancelAnimationFrame(_rafId);
    _rafId = null;
    LD.emit('engine:stop', {});
  };

  LD.pause = function () {
    _paused = true;
    LD.emit('engine:pause', {});
  };

  LD.resume = function () {
    _paused = false;
    _lastTime = performance.now();
    LD.emit('engine:resume', {});
  };

  LD.isPaused = function () { return _paused; };
  LD.isRunning = function () { return _running; };

  LD.toggleFps = function (show) {
    _showFps = show !== undefined ? show : !_showFps;
  };

  LD.getFps = function () { return _fps; };

  // ── Game JSON Loader ─────────────────────────────────────────────
  function _applyGameJson(json) {
    _currentGameJson = json;
    _world.clear();
    LD.Timer.clear();

    if (json.background) {
      LD.State.add('background', {
        render: function (ctx) {
          ctx.fillStyle = json.background || '#000';
          ctx.fillRect(0, 0, _canvas.width, _canvas.height);
        }
      });
      LD.State.go('background');
    }

    if (json.entities) {
      json.entities.forEach(function (def) {
        const e = _world.createEntity(def.name);
        if (def.tags) def.tags.forEach(function (t) { e.addTag(t); });
        if (def.components) {
          for (const compName in def.components) {
            if (!def.components.hasOwnProperty(compName)) continue;
            const CompClass = LD.Components[compName];
            if (CompClass) {
              const c = new CompClass(def.components[compName]);
              e.addComponent(c);
            }
          }
        }
      });
    }

    if (json.systems) {
      json.systems.forEach(function (sysName) {
        const SysClass = LD.Systems[sysName];
        if (SysClass) _world.addSystem(new SysClass());
      });
    } else {
      const defaults = ['PhysicsSystem', 'CollisionSystem', 'PlayerInputSystem',
        'AIControlSystem', 'PlatformerSystem', 'AnimatorSystem', 'ParticleSystem',
        'HealthSystem', 'CameraSystem', 'PickupSystem', 'WeaponSystem',
        'CooldownSystem', 'TrailSystem', 'DelayedActionSystem', 'RenderSystem'];
      defaults.forEach(function (sysName) {
        const SysClass = LD.Systems[sysName];
        if (SysClass) _world.addSystem(new SysClass());
      });
    }

    if (json.states) {
      for (const sname in json.states) {
        if (json.states.hasOwnProperty(sname)) LD.State.add(sname, json.states[sname]);
      }
    }

    if (json.initialState) LD.State.go(json.initialState);

    LD.emit('engine:gameLoaded', { json: json });
  }

  LD.loadGame = function (jsonOrUrl) {
    if (typeof jsonOrUrl === 'object') {
      _applyGameJson(jsonOrUrl);
      return Promise.resolve(jsonOrUrl);
    }
    if (typeof jsonOrUrl === 'string') {
      if (jsonOrUrl.trim().startsWith('{')) {
        try {
          const json = JSON.parse(jsonOrUrl);
          _applyGameJson(json);
          return Promise.resolve(json);
        } catch (e) {
          return Promise.reject(e);
        }
      }
      return fetch(jsonOrUrl).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function (json) {
        _applyGameJson(json);
        return json;
      });
    }
    return Promise.reject(new Error('Invalid argument'));
  };

  // ── Save / Export ────────────────────────────────────────────────
  LD.saveGame = function () {
    const state = { version: LD.VERSION, entities: [], currentState: LD.State.current() };
    _world.entities.forEach(function (e) {
      const ent = { name: e.name, tags: e.tags, components: {} };
      for (const type in e.components) {
        if (!e.components.hasOwnProperty(type)) continue;
        const c = e.components[type];
        const data = {};
        for (const k in c) {
          if (!c.hasOwnProperty(k) || k === 'entity') continue;
          if (typeof c[k] !== 'function') data[k] = c[k];
        }
        ent.components[type] = data;
      }
      state.entities.push(ent);
    });
    return JSON.stringify(state, null, 2);
  };

  LD.loadSave = function (jsonStr) {
    try {
      const json = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
      _applyGameJson(json);
      return Promise.resolve(json);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  // ── Debug Helpers ────────────────────────────────────────────────
  LD.debug = {
    log: function () {
      const args = Array.prototype.slice.call(arguments);
      args.unshift('[LD ' + LD.VERSION + ']');
      console.log.apply(console, args);
    },
    warn: function () {
      const args = Array.prototype.slice.call(arguments);
      args.unshift('[LD ' + LD.VERSION + ']');
      console.warn.apply(console, args);
    },
    error: function () {
      const args = Array.prototype.slice.call(arguments);
      args.unshift('[LD ' + LD.VERSION + ']');
      console.error.apply(console, args);
    }
  };

  LD.log = LD.debug.log;

})();
