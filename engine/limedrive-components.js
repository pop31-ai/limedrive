window.LD = window.LD || {};
LD.Components = LD.Components || {};

(function () {
  'use strict';

  // ── Helper ───────────────────────────────────────────────────────
  function _register(name, cls) {
    cls._type = name;
    return cls;
  }

  // ── Transform ────────────────────────────────────────────────────
  LD.Components.Transform = _register('Transform', class Transform extends LD.Component {
    constructor(data) {
      super(data);
      this.x = data.x || 0;
      this.y = data.y || 0;
      this.z = data.z || 0;
      this.rotation = data.rotation || 0;
      this.scaleX = data.scaleX !== undefined ? data.scaleX : 1;
      this.scaleY = data.scaleY !== undefined ? data.scaleY : 1;
      this.width = data.width || 32;
      this.height = data.height || 32;
    }
  });

  // ── Sprite ───────────────────────────────────────────────────────
  LD.Components.Sprite = _register('Sprite', class Sprite extends LD.Component {
    constructor(data) {
      super(data);
      this.image = data.image || null;
      this.width = data.width || 32;
      this.height = data.height || 32;
      this.color = data.color || '#ffffff';
      this.flipX = data.flipX || false;
      this.flipY = data.flipY || false;
      this.opacity = data.opacity !== undefined ? data.opacity : 1;
      this.offsetX = data.offsetX || 0;
      this.offsetY = data.offsetY || 0;
      this.layer = data.layer || 0;
    }
    draw(ctx, x, y) {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      const drawX = x + this.offsetX;
      const drawY = y + this.offsetY;
      if (this.flipX || this.flipY) {
        ctx.translate(drawX + this.width / 2, drawY + this.height / 2);
        ctx.scale(this.flipX ? -1 : 1, this.flipY ? -1 : 1);
        if (typeof this.image === 'object' && this.image && this.image.src) {
          ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
          ctx.fillStyle = this.color;
          ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }
      } else {
        if (typeof this.image === 'object' && this.image && this.image.src) {
          ctx.drawImage(this.image, drawX, drawY, this.width, this.height);
        } else {
          ctx.fillStyle = this.color;
          ctx.fillRect(drawX, drawY, this.width, this.height);
        }
      }
      ctx.restore();
    }
  });

  // ── PhysicsBody ──────────────────────────────────────────────────
  LD.Components.PhysicsBody = _register('PhysicsBody', class PhysicsBody extends LD.Component {
    constructor(data) {
      super(data);
      this.vx = data.vx || 0;
      this.vy = data.vy || 0;
      this.vz = data.vz || 0;
      this.ax = data.ax || 0;
      this.ay = data.ay || 0;
      this.mass = data.mass || 1;
      this.friction = data.friction !== undefined ? data.friction : 0.85;
      this.bounce = data.bounce !== undefined ? data.bounce : 0;
      this.isStatic = data.isStatic || false;
      this.gravityScale = data.gravityScale !== undefined ? data.gravityScale : 1;
      this.maxVelocity = data.maxVelocity || 1000;
    }
    applyForce(fx, fy) {
      if (this.isStatic) return;
      this.ax += fx / this.mass;
      this.ay += fy / this.mass;
    }
    integrate(dt) {
      if (this.isStatic) return;
      this.vx += this.ax * dt;
      this.vy += this.ay * dt;
      this.vx = Math.max(-this.maxVelocity, Math.min(this.maxVelocity, this.vx));
      this.vy = Math.max(-this.maxVelocity, Math.min(this.maxVelocity, this.vy));
      this.ax = 0;
      this.ay = 0;
    }
  });

  // ── Collider ─────────────────────────────────────────────────────
  LD.Components.Collider = _register('Collider', class Collider extends LD.Component {
    constructor(data) {
      super(data);
      this.type = data.type || 'box';
      this.width = data.width || 32;
      this.height = data.height || 32;
      this.radius = data.radius || 16;
      this.isTrigger = data.isTrigger || false;
      this.offsetX = data.offsetX || 0;
      this.offsetY = data.offsetY || 0;
      this.layer = data.layer || 'default';
      this.mask = data.mask || ['default'];
      this.colliding = false;
    }
    getBounds(tf) {
      if (!tf) return { x: 0, y: 0, w: this.width, h: this.height };
      return {
        x: tf.x + this.offsetX,
        y: tf.y + this.offsetY,
        w: this.width,
        h: this.height
      };
    }
  });

  // ── Health ───────────────────────────────────────────────────────
  LD.Components.Health = _register('Health', class Health extends LD.Component {
    constructor(data) {
      super(data);
      this.current = data.current || 100;
      this.max = data.max || 100;
      this.invulnerable = data.invulnerable || false;
      this.invulnerableTimer = 0;
      this.invulnerableDuration = data.invulnerableDuration || 1;
      this.regenRate = data.regenRate || 0;
      this.regenTimer = 0;
      this.alive = true;
      this.onDamage = data.onDamage || null;
      this.onDeath = data.onDeath || null;
      this.onHeal = data.onHeal || null;
    }
    takeDamage(amount) {
      if (this.invulnerable || !this.alive) return false;
      this.current = Math.max(0, this.current - amount);
      this.invulnerable = true;
      this.invulnerableTimer = this.invulnerableDuration;
      if (this.onDamage) this.onDamage(amount);
      if (this.current <= 0) {
        this.alive = false;
        if (this.onDeath) this.onDeath();
      }
      return true;
    }
    heal(amount) {
      if (!this.alive) return false;
      const prev = this.current;
      this.current = Math.min(this.max, this.current + amount);
      if (this.onHeal) this.onHeal(this.current - prev);
      return true;
    }
    update(dt) {
      if (this.invulnerable) {
        this.invulnerableTimer -= dt;
        if (this.invulnerableTimer <= 0) {
          this.invulnerable = false;
          this.invulnerableTimer = 0;
        }
      }
      if (this.regenRate > 0 && this.alive && this.current < this.max) {
        this.regenTimer += dt;
        if (this.regenTimer >= 1) {
          this.regenTimer = 0;
          this.heal(this.regenRate);
        }
      }
    }
    getRatio() { return this.current / this.max; }
    reset() { this.current = this.max; this.alive = true; this.invulnerable = false; }
  });

  // ── PlayerControl ────────────────────────────────────────────────
  LD.Components.PlayerControl = _register('PlayerControl', class PlayerControl extends LD.Component {
    constructor(data) {
      super(data);
      this.speed = data.speed || 200;
      this.jumpForce = data.jumpForce || -400;
      this.moveLeft = data.moveLeft || 'a';
      this.moveRight = data.moveRight || 'd';
      this.jumpKey = data.jumpKey || 'w';
      this.downKey = data.downKey || 's';
      this.attackKey = data.attackKey || ' ';
      this.specialKey = data.specialKey || 'e';
      this.active = true;
      this.inputEnabled = true;
    }
  });

  // ── AIControl ────────────────────────────────────────────────────
  LD.Components.AIControl = _register('AIControl', class AIControl extends LD.Component {
    constructor(data) {
      super(data);
      this.personality = data.personality || 'balanced';
      this.difficulty = data.difficulty || 'medium';
      this.patrolPath = data.patrolPath || null;
      this.sightRange = data.sightRange || 300;
      this.attackRange = data.attackRange || 50;
      this.thinkInterval = data.thinkInterval || 0.5;
      this.controller = null;
    }
  });

  // ── Platformer ───────────────────────────────────────────────────
  LD.Components.Platformer = _register('Platformer', class Platformer extends LD.Component {
    constructor(data) {
      super(data);
      this.onGround = false;
      this.coyoteTime = data.coyoteTime || 0.1;
      this.coyoteTimer = 0;
      this.jumpBuffer = data.jumpBuffer || 0.1;
      this.jumpBufferTimer = 0;
      this.maxJumps = data.maxJumps || 1;
      this.jumpsRemaining = data.maxJumps || 1;
      this.wallSlide = data.wallSlide || false;
      this.wallJumpForce = data.wallJumpForce || { x: 300, y: -350 };
      this.oneWayPlatform = data.oneWayPlatform || false;
    }
    canJump() {
      return this.onGround || this.coyoteTimer > 0 || this.jumpsRemaining > 0;
    }
    consumeJump() {
      if (this.onGround || this.coyoteTimer > 0) {
        this.jumpsRemaining = this.maxJumps - 1;
      } else {
        this.jumpsRemaining--;
      }
    }
  });

  // ── Animator ─────────────────────────────────────────────────────
  LD.Components.Animator = _register('Animator', class Animator extends LD.Component {
    constructor(data) {
      super(data);
      this.animations = data.animations || {};
      this.currentAnim = data.currentAnim || null;
      this.frame = 0;
      this.fps = data.fps || 12;
      this.timer = 0;
      this.playing = true;
      this.loop = data.loop !== undefined ? data.loop : true;
      this.onComplete = data.onComplete || null;
      this.flipX = false;
    }
    play(name, reset) {
      if (this.currentAnim === name && !reset) return;
      this.currentAnim = name;
      this.frame = 0;
      this.timer = 0;
      this.playing = true;
    }
    stop() { this.playing = false; }
    getCurrentFrames() {
      if (!this.currentAnim || !this.animations[this.currentAnim]) return null;
      return this.animations[this.currentAnim];
    }
    update(dt) {
      if (!this.playing || !this.currentAnim) return;
      const anim = this.animations[this.currentAnim];
      if (!anim || !anim.frames || !anim.frames.length) return;

      this.timer += dt;
      const interval = 1 / (anim.fps || this.fps);
      if (this.timer >= interval) {
        this.timer -= interval;
        this.frame++;
        if (this.frame >= anim.frames.length) {
          if (this.loop) {
            this.frame = 0;
          } else {
            this.frame = anim.frames.length - 1;
            this.playing = false;
            if (this.onComplete) this.onComplete(this.currentAnim);
          }
        }
      }
    }
    getCurrentFrame() {
      const frames = this.getCurrentFrames();
      if (!frames) return null;
      return frames[this.frame % frames.length];
    }
  });

  // ── ParticleEmitter ──────────────────────────────────────────────
  LD.Components.ParticleEmitter = _register('ParticleEmitter', class ParticleEmitter extends LD.Component {
    constructor(data) {
      super(data);
      this.particles = [];
      this.rate = data.rate || 10;
      this.lifetime = data.lifetime || 1;
      this.speed = data.speed || 100;
      this.color = data.color || '#ffffff';
      this.endColor = data.endColor || null;
      this.size = data.size || 4;
      this.shape = data.shape || 'point';
      this.spread = data.spread !== undefined ? data.spread : Math.PI * 2;
      this.gravity = data.gravity || 0;
      this.maxParticles = data.maxParticles || 200;
      this.active = true;
      this.burst = data.burst || false;
      this.burstDone = false;
    }
    emit(count) {
      count = count || 1;
      for (let i = 0; i < count && this.particles.length < this.maxParticles; i++) {
        const angle = (Math.random() - 0.5) * this.spread - Math.PI / 2;
        const spd = this.speed * (0.5 + Math.random() * 0.5);
        this.particles.push({
          x: 0, y: 0,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          life: this.lifetime,
          maxLife: this.lifetime,
          size: this.size * (0.5 + Math.random() * 0.5),
          color: this.color
        });
      }
    }
    update(dt) {
      if (this.active && !this.burst) {
        this.emit(Math.ceil(this.rate * dt));
      }
      if (this.burst && !this.burstDone) {
        this.emit(this.rate);
        this.burstDone = true;
      }
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life -= dt;
        if (p.life <= 0) { this.particles.splice(i, 1); continue; }
        p.vy += this.gravity * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
    }
  });

  // ── AudioEmitter ─────────────────────────────────────────────────
  LD.Components.AudioEmitter = _register('AudioEmitter', class AudioEmitter extends LD.Component {
    constructor(data) {
      super(data);
      this.sounds = data.sounds || {};
      this.volume = data.volume || 1;
      this.loop = data.loop || false;
      this._active = {};
    }
    play(name, loop) {
      if (LD.Assets && LD.Assets.get) {
        const audio = LD.Assets.get('sounds', name);
        if (audio) {
          audio.volume = this.volume;
          audio.loop = loop || this.loop;
          audio.currentTime = 0;
          audio.play().catch(function () {});
          this._active[name] = audio;
        }
      }
    }
    stop(name) {
      if (this._active[name]) {
        this._active[name].pause();
        this._active[name].currentTime = 0;
        delete this._active[name];
      }
    }
    stopAll() {
      for (const k in this._active) {
        if (this._active.hasOwnProperty(k)) this.stop(k);
      }
    }
    setVolume(v) { this.volume = v; }
  });

  // ── HealthPickup ─────────────────────────────────────────────────
  LD.Components.HealthPickup = _register('HealthPickup', class HealthPickup extends LD.Component {
    constructor(data) {
      super(data);
      this.healAmount = data.healAmount || 25;
      this.destroyOnPickup = data.destroyOnPickup !== undefined ? data.destroyOnPickup : true;
      this.pickedUp = false;
    }
  });

  // ── Weapon ───────────────────────────────────────────────────────
  LD.Components.Weapon = _register('Weapon', class Weapon extends LD.Component {
    constructor(data) {
      super(data);
      this.damage = data.damage || 10;
      this.range = data.range || 50;
      this.cooldown = data.cooldown || 0.5;
      this.type = data.type || 'melee';
      this.cooldownTimer = 0;
      this.attacking = false;
      this.attackDuration = data.attackDuration || 0.2;
      this.attackTimer = 0;
      this.projectileSpeed = data.projectileSpeed || 400;
      this.projectileCount = data.projectileCount || 1;
      this.spread = data.spread || 0;
    }
    canAttack() { return this.cooldownTimer <= 0; }
    attack() {
      if (!this.canAttack()) return false;
      this.cooldownTimer = this.cooldown;
      this.attacking = true;
      this.attackTimer = this.attackDuration;
      return true;
    }
    update(dt) {
      if (this.cooldownTimer > 0) this.cooldownTimer -= dt;
      if (this.attacking) {
        this.attackTimer -= dt;
        if (this.attackTimer <= 0) this.attacking = false;
      }
    }
  });

  // ── Inventory ────────────────────────────────────────────────────
  LD.Components.Inventory = _register('Inventory', class Inventory extends LD.Component {
    constructor(data) {
      super(data);
      this.items = data.items || [];
      this.maxSlots = data.maxSlots || 10;
      this.gold = data.gold || 0;
    }
    addItem(item) {
      if (this.items.length >= this.maxSlots) return false;
      this.items.push(item);
      return true;
    }
    removeItem(index) {
      if (index < 0 || index >= this.items.length) return null;
      return this.items.splice(index, 1)[0];
    }
    hasItem(name) {
      return this.items.some(function (item) { return item.name === name; });
    }
    useItem(index) {
      const item = this.items[index];
      if (item && item.usable) {
        item.usable = false;
        return item;
      }
      return null;
    }
    getCount() { return this.items.length; }
    isFull() { return this.items.length >= this.maxSlots; }
  });

  // ── Cooldown ─────────────────────────────────────────────────────
  LD.Components.Cooldown = _register('Cooldown', class Cooldown extends LD.Component {
    constructor(data) {
      super(data);
      this.abilities = data.abilities || {};
      this._timers = {};
    }
    start(abilityId, duration) {
      this._timers[abilityId] = duration;
    }
    isReady(abilityId) {
      return !this._timers[abilityId] || this._timers[abilityId] <= 0;
    }
    getRemaining(abilityId) {
      return Math.max(0, this._timers[abilityId] || 0);
    }
    getRatio(abilityId) {
      const dur = this.abilities[abilityId] || 1;
      return this.getRemaining(abilityId) / dur;
    }
    cancel(abilityId) {
      delete this._timers[abilityId];
    }
    update(dt) {
      for (const k in this._timers) {
        if (!this._timers.hasOwnProperty(k)) continue;
        this._timers[k] -= dt;
        if (this._timers[k] <= 0) {
          delete this._timers[k];
          LD.emit('cooldown:ready', { ability: k, entity: this.entity });
        }
      }
    }
  });

  // ── Trail ────────────────────────────────────────────────────────
  LD.Components.Trail = _register('Trail', class Trail extends LD.Component {
    constructor(data) {
      super(data);
      this.points = [];
      this.maxPoints = data.maxPoints || 20;
      this.interval = data.interval || 0.03;
      this.timer = 0;
      this.lifeTime = data.lifeTime || 0.5;
      this.width = data.width || 8;
      this.color = data.color || null;
      this.endColor = data.endColor || null;
      this.opacity = data.opacity !== undefined ? data.opacity : 0.6;
      this.active = true;
      this._lastX = 0;
      this._lastY = 0;
    }
    update(dt, x, y) {
      this.timer += dt;
      if (this.timer >= this.interval) {
        this.timer = 0;
        this.points.push({ x: x, y: y, life: this.lifeTime, maxLife: this.lifeTime });
        if (this.points.length > this.maxPoints) this.points.shift();
      }
      for (let i = this.points.length - 1; i >= 0; i--) {
        this.points[i].life -= dt;
        if (this.points[i].life <= 0) this.points.splice(i, 1);
      }
    }
  });

  // ── DelayedAction ────────────────────────────────────────────────
  LD.Components.DelayedAction = _register('DelayedAction', class DelayedAction extends LD.Component {
    constructor(data) {
      super(data);
      this.actions = data.actions || [];
      this._queue = [];
    }
    add(delay, callback) {
      this._queue.push({ delay: delay, elapsed: 0, fn: callback, fired: false });
    }
    addEvent(delay, eventName, eventData) {
      const self = this;
      this.add(delay, function () {
        LD.emit(eventName, Object.assign({ entity: self.entity }, eventData || {}));
      });
    }
    delaySeconds(sec, fn) {
      this.add(sec, fn);
    }
    clear() {
      this._queue = [];
    }
    update(dt) {
      for (let i = this._queue.length - 1; i >= 0; i--) {
        const a = this._queue[i];
        if (a.fired) { this._queue.splice(i, 1); continue; }
        a.elapsed += dt;
        if (a.elapsed >= a.delay) {
          a.fired = true;
          if (a.fn) a.fn();
        }
      }
    }
  });

  // ── Dialogue ─────────────────────────────────────────────────────
  LD.Components.Dialogue = _register('Dialogue', class Dialogue extends LD.Component {
    constructor(data) {
      super(data);
      this.lines = data.lines || [];
      this.currentIndex = 0;
      this.active = false;
      this.portrait = data.portrait || null;
      this.speaker = data.speaker || '';
      this.autoAdvance = data.autoAdvance || false;
      this.autoAdvanceDelay = data.autoAdvanceDelay || 3;
      this._autoTimer = 0;
    }
    start() {
      this.currentIndex = 0;
      this.active = true;
      this._autoTimer = 0;
    }
    next() {
      this.currentIndex++;
      this._autoTimer = 0;
      if (this.currentIndex >= this.lines.length) {
        this.active = false;
        return false;
      }
      return true;
    }
    getCurrent() {
      if (!this.active || this.currentIndex >= this.lines.length) return null;
      return this.lines[this.currentIndex];
    }
    skip() {
      this.currentIndex = this.lines.length;
      this.active = false;
    }
    update(dt) {
      if (!this.active) return;
      if (this.autoAdvance) {
        this._autoTimer += dt;
        if (this._autoTimer >= this.autoAdvanceDelay) this.next();
      }
    }
  });

})();
