window.LD = window.LD || {};
LD.UI = LD.UI || {};

(function () {
  'use strict';

  // ── Base UI Element ──────────────────────────────────────────────
  class UIElement {
    constructor(opts) {
      opts = opts || {};
      this.name = opts.name || 'elem_' + Math.random().toString(36).slice(2, 8);
      this.x = opts.x || 0;
      this.y = opts.y || 0;
      this.width = opts.width || 100;
      this.height = opts.height || 30;
      this.visible = opts.visible !== undefined ? opts.visible : true;
      this.alpha = opts.alpha !== undefined ? opts.alpha : 1;
      this.children = [];
      this.parent = null;
      this.padding = opts.padding || 8;
    }
    addChild(child) {
      child.parent = this;
      this.children.push(child);
      return child;
    }
    removeChild(child) {
      child.parent = null;
      this.children = this.children.filter(function (c) { return c !== child; });
    }
    show() { this.visible = true; }
    hide() { this.visible = false; }
    update(dt) {}
    render(ctx) {
      if (!this.visible) return;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      this._draw(ctx);
      for (let i = 0; i < this.children.length; i++) {
        this.children[i].render(ctx);
      }
      ctx.restore();
    }
    _draw(ctx) {}
    getAbsolutePos() {
      let ax = this.x, ay = this.y;
      let p = this.parent;
      while (p) { ax += p.x; ay += p.y; p = p.parent; }
      return { x: ax, y: ay };
    }
    containsPoint(px, py) {
      const pos = this.getAbsolutePos();
      return px >= pos.x && px <= pos.x + this.width && py >= pos.y && py <= pos.y + this.height;
    }
  }

  // ── Button ───────────────────────────────────────────────────────
  class Button extends UIElement {
    constructor(opts) {
      super(opts);
      this.text = opts.text || 'Button';
      this.color = opts.color || '#4a90d9';
      this.hoverColor = opts.hoverColor || '#5aa0e9';
      this.textColor = opts.textColor || '#ffffff';
      this.fontSize = opts.fontSize || 16;
      this.font = opts.font || this.fontSize + 'px Arial';
      this.borderRadius = opts.borderRadius || 4;
      this._hovered = false;
      this._pressed = false;
      this.onClick = opts.onClick || null;
      this.onHover = opts.onHover || null;
    }
    _draw(ctx) {
      const pos = this.getAbsolutePos();
      const bg = this._pressed ? this._darken(this.color, 0.8) : (this._hovered ? this.hoverColor : this.color);

      ctx.fillStyle = bg;
      this._roundRect(ctx, pos.x, pos.y, this.width, this.height, this.borderRadius);
      ctx.fill();

      ctx.fillStyle = this.textColor;
      ctx.font = this.font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.text, pos.x + this.width / 2, pos.y + this.height / 2);
    }
    _roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }
    _darken(hex, factor) {
      let r = parseInt(hex.slice(1, 3), 16);
      let g = parseInt(hex.slice(3, 5), 16);
      let b = parseInt(hex.slice(5, 7), 16);
      r = Math.round(r * factor);
      g = Math.round(g * factor);
      b = Math.round(b * factor);
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    update(dt) {
      if (!LD.Input) return;
      const mp = LD.Input.getMousePosition();
      this._hovered = this.containsPoint(mp.x, mp.y);
      this._pressed = this._hovered && LD.Input.isMouseDown(0);
    }
  }

  // ── Label ────────────────────────────────────────────────────────
  class Label extends UIElement {
    constructor(opts) {
      super(opts);
      this.text = opts.text || '';
      this.color = opts.color || '#ffffff';
      this.fontSize = opts.fontSize || 16;
      this.font = opts.font || this.fontSize + 'px Arial';
      this.align = opts.align || 'left';
      this.baseline = opts.baseline || 'top';
      this.wrap = opts.wrap || false;
    }
    _draw(ctx) {
      const pos = this.getAbsolutePos();
      ctx.fillStyle = this.color;
      ctx.font = this.font;
      ctx.textAlign = this.align;
      ctx.textBaseline = this.baseline;

      if (this.wrap && this.width > 0) {
        this._drawWrapped(ctx, this.text, pos.x, pos.y, this.width);
      } else {
        ctx.fillText(this.text, pos.x, pos.y);
      }
    }
    _drawWrapped(ctx, text, x, y, maxW) {
      const words = text.split(' ');
      let line = '';
      let lineY = y;
      const lineHeight = this.fontSize * 1.2;

      for (let i = 0; i < words.length; i++) {
        const test = line + words[i] + ' ';
        if (ctx.measureText(test).width > maxW && line) {
          ctx.fillText(line.trim(), x, lineY);
          line = words[i] + ' ';
          lineY += lineHeight;
        } else {
          line = test;
        }
      }
      ctx.fillText(line.trim(), x, lineY);
    }
  }

  // ── Panel ────────────────────────────────────────────────────────
  class Panel extends UIElement {
    constructor(opts) {
      super(opts);
      this.backgroundColor = opts.backgroundColor || 'rgba(0,0,0,0.7)';
      this.borderColor = opts.borderColor || 'rgba(255,255,255,0.2)';
      this.borderWidth = opts.borderWidth || 1;
      this.borderRadius = opts.borderRadius || 6;
    }
    _draw(ctx) {
      const pos = this.getAbsolutePos();
      ctx.fillStyle = this.backgroundColor;
      ctx.strokeStyle = this.borderColor;
      ctx.lineWidth = this.borderWidth;

      ctx.beginPath();
      const r = this.borderRadius;
      ctx.moveTo(pos.x + r, pos.y);
      ctx.lineTo(pos.x + this.width - r, pos.y);
      ctx.quadraticCurveTo(pos.x + this.width, pos.y, pos.x + this.width, pos.y + r);
      ctx.lineTo(pos.x + this.width, pos.y + this.height - r);
      ctx.quadraticCurveTo(pos.x + this.width, pos.y + this.height, pos.x + this.width - r, pos.y + this.height);
      ctx.lineTo(pos.x + r, pos.y + this.height);
      ctx.quadraticCurveTo(pos.x, pos.y + this.height, pos.x, pos.y + this.height - r);
      ctx.lineTo(pos.x, pos.y + r);
      ctx.quadraticCurveTo(pos.x, pos.y, pos.x + r, pos.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  // ── ProgressBar ──────────────────────────────────────────────────
  class ProgressBar extends UIElement {
    constructor(opts) {
      super(opts);
      this.value = opts.value || 0.5;
      this.max = opts.max || 1;
      this.barColor = opts.barColor || '#4caf50';
      this.bgColor = opts.bgColor || '#333';
      this.borderColor = opts.borderColor || '#555';
      this.borderRadius = opts.borderRadius || 3;
      this.label = opts.label || '';
      this.labelColor = opts.labelColor || '#fff';
      this.showLabel = opts.showLabel !== undefined ? opts.showLabel : true;
    }
    setValue(v) { this.value = Math.max(0, Math.min(this.max, v)); }
    getRatio() { return this.max > 0 ? this.value / this.max : 0; }
    _draw(ctx) {
      const pos = this.getAbsolutePos();
      const ratio = this.getRatio();

      ctx.fillStyle = this.bgColor;
      this._roundRect(ctx, pos.x, pos.y, this.width, this.height, this.borderRadius);
      ctx.fill();
      ctx.strokeStyle = this.borderColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      if (ratio > 0) {
        ctx.fillStyle = this.barColor;
        this._roundRect(ctx, pos.x, pos.y, this.width * ratio, this.height, this.borderRadius);
        ctx.fill();
      }

      if (this.showLabel) {
        ctx.fillStyle = this.labelColor;
        ctx.font = Math.max(10, this.height - 8) + 'px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const text = this.label || (Math.round(ratio * 100) + '%');
        ctx.fillText(text, pos.x + this.width / 2, pos.y + this.height / 2);
      }
    }
    _roundRect(ctx, x, y, w, h, r) {
      if (w < 2 * r) r = w / 2;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }
  }

  // ── Slider ───────────────────────────────────────────────────────
  class Slider extends UIElement {
    constructor(opts) {
      super(opts);
      this.value = opts.value || 0.5;
      this.min = opts.min || 0;
      this.max = opts.max || 1;
      this.trackColor = opts.trackColor || '#555';
      this.fillColor = opts.fillColor || '#4a90d9';
      this.handleColor = opts.handleColor || '#fff';
      this.onChange = opts.onChange || null;
      this._dragging = false;
      this.height = opts.height || 20;
    }
    _draw(ctx) {
      const pos = this.getAbsolutePos();
      const ratio = (this.value - this.min) / (this.max - this.min);
      const trackY = pos.y + this.height / 2;
      const handleRadius = 8;

      ctx.fillStyle = this.trackColor;
      ctx.fillRect(pos.x, trackY - 3, this.width, 6);

      ctx.fillStyle = this.fillColor;
      ctx.fillRect(pos.x, trackY - 3, this.width * ratio, 6);

      ctx.fillStyle = this.handleColor;
      ctx.beginPath();
      ctx.arc(pos.x + this.width * ratio, trackY, handleRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#999';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    update(dt) {
      if (!LD.Input) return;
      const mp = LD.Input.getMousePosition();
      if (LD.Input.isMouseDown(0) && this.containsPoint(mp.x, mp.y)) {
        this._dragging = true;
      }
      if (!LD.Input.isMouseDown(0)) this._dragging = false;

      if (this._dragging) {
        const pos = this.getAbsolutePos();
        const ratio = Math.max(0, Math.min(1, (mp.x - pos.x) / this.width));
        const newVal = this.min + ratio * (this.max - this.min);
        if (newVal !== this.value) {
          this.value = newVal;
          if (this.onChange) this.onChange(this.value);
        }
      }
    }
  }

  // ── Dialog (full-screen overlay) ─────────────────────────────────
  class Dialog extends UIElement {
    constructor(opts) {
      super(opts);
      this.title = opts.title || '';
      this.message = opts.message || '';
      this.buttons = opts.buttons || [];
      this.overlayColor = opts.overlayColor || 'rgba(0,0,0,0.6)';
      this.panelColor = opts.panelColor || '#222';
      this.titleColor = opts.titleColor || '#fff';
      this.messageColor = opts.messageColor || '#ccc';
      this.titleFontSize = opts.titleFontSize || 24;
      this.messageFontSize = opts.messageFontSize || 16;
      this._btnElements = [];
      this.onClose = opts.onClose || null;
      this._buildButtons();
    }
    _buildButtons() {
      this._btnElements = [];
      const self = this;
      this.buttons.forEach(function (btn, idx) {
        self._btnElements.push(new Button({
          text: btn.text || 'OK',
          x: self.x + 20 + idx * 120,
          y: self.y + self.height - 60,
          width: 100,
          height: 36,
          color: btn.color || '#4a90d9',
          onClick: btn.onClick || function () { self.hide(); }
        }));
      });
    }
    setButtons(arr) {
      this.buttons = arr;
      this._buildButtons();
    }
    _draw(ctx) {
      const canvas = LD.getCanvas();
      const cw = canvas ? canvas.width : 800;
      const ch = canvas ? canvas.height : 600;

      ctx.fillStyle = this.overlayColor;
      ctx.fillRect(0, 0, cw, ch);

      const pw = Math.min(400, cw - 40);
      const ph = Math.min(250, ch - 40);
      const px = (cw - pw) / 2;
      const py = (ch - ph) / 2;
      this.x = px;
      this.y = py;
      this.width = pw;
      this.height = ph;

      ctx.fillStyle = this.panelColor;
      ctx.beginPath();
      const r = 8;
      ctx.moveTo(px + r, py);
      ctx.lineTo(px + pw - r, py);
      ctx.quadraticCurveTo(px + pw, py, px + pw, py + r);
      ctx.lineTo(px + pw, py + ph - r);
      ctx.quadraticCurveTo(px + pw, py + ph, px + pw - r, py + ph);
      ctx.lineTo(px + r, py + ph);
      ctx.quadraticCurveTo(px, py + ph, px, py + ph - r);
      ctx.lineTo(px, py + r);
      ctx.quadraticCurveTo(px, py, px + r, py);
      ctx.closePath();
      ctx.fill();

      if (this.title) {
        ctx.fillStyle = this.titleColor;
        ctx.font = 'bold ' + this.titleFontSize + 'px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(this.title, px + pw / 2, py + 20);
      }

      if (this.message) {
        ctx.fillStyle = this.messageColor;
        ctx.font = this.messageFontSize + 'px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const msgY = py + 20 + this.titleFontSize + 20;
        const maxW = pw - 40;
        const words = this.message.split(' ');
        let line = '';
        let lineY = msgY;
        for (let i = 0; i < words.length; i++) {
          const test = line + words[i] + ' ';
          if (ctx.measureText(test).width > maxW && line) {
            ctx.fillText(line.trim(), px + pw / 2, lineY);
            line = words[i] + ' ';
            lineY += 22;
          } else {
            line = test;
          }
        }
        ctx.fillText(line.trim(), px + pw / 2, lineY);
      }

      this._btnElements.forEach(function (btn) {
        btn.x = px + pw / 2 - 50;
        btn.y = py + ph - 55;
        btn.render(ctx);
      });
    }
    update(dt) {
      this._btnElements.forEach(function (btn) { btn.update(dt); });
    }
  }

  // ── HUD Elements ─────────────────────────────────────────────────
  class HUD {
    constructor() {
      this.healthBar = null;
      this.scoreLabel = null;
      this.livesLabel = null;
      this.timerLabel = null;
      this.panel = null;
      this._score = 0;
      this._lives = 3;
      this._timer = 0;
    }
    init() {
      this.panel = new Panel({ name: 'hud_panel', x: 10, y: 10, width: 200, height: 80 });
      this.healthBar = new ProgressBar({
        name: 'hud_health', x: 20, y: 20, width: 180, height: 20,
        barColor: '#e74c3c', label: 'HP', showLabel: true
      });
      this.scoreLabel = new Label({
        name: 'hud_score', x: 20, y: 48, text: 'Score: 0',
        fontSize: 14, color: '#fff'
      });
      this.livesLabel = new Label({
        name: 'hud_lives', x: 130, y: 48, text: 'Lives: 3',
        fontSize: 14, color: '#fff'
      });
      this.timerLabel = new Label({
        name: 'hud_timer', x: 20, y: 68, text: 'Time: 0:00',
        fontSize: 12, color: '#aaa'
      });
      this.panel.addChild(this.healthBar);
      this.panel.addChild(this.scoreLabel);
      this.panel.addChild(this.livesLabel);
      this.panel.addChild(this.timerLabel);
    }
    setHealth(val, max) {
      if (this.healthBar) {
        this.healthBar.max = max || 100;
        this.healthBar.setValue(val);
      }
    }
    setScore(s) {
      this._score = s;
      if (this.scoreLabel) this.scoreLabel.text = 'Score: ' + s;
    }
    setLives(l) {
      this._lives = l;
      if (this.livesLabel) this.livesLabel.text = 'Lives: ' + l;
    }
    setTimer(t) {
      this._timer = t;
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60);
      if (this.timerLabel) this.timerLabel.text = 'Time: ' + m + ':' + (s < 10 ? '0' : '') + s;
    }
    update(dt) {
      if (this.panel) this.panel.update(dt);
    }
    render(ctx) {
      if (this.panel) this.panel.render(ctx);
    }
  }

  // ── Menu System ──────────────────────────────────────────────────
  class MenuSystem {
    constructor() {
      this.menus = {};
      this.currentMenu = null;
    }
    create(name, opts) {
      opts = opts || {};
      const menu = new Panel({
        name: 'menu_' + name,
        x: opts.x || 0, y: opts.y || 0,
        width: opts.width || 300, height: opts.height || 400,
        backgroundColor: opts.backgroundColor || 'rgba(0,0,0,0.85)'
      });
      menu._menuTitle = opts.title || name;
      menu._menuButtons = [];

      const self = this;
      const items = opts.items || [];
      items.forEach(function (item, idx) {
        const btn = new Button({
          text: item.text,
          x: 0, y: 60 + idx * 50,
          width: opts.btnWidth || 200,
          height: opts.btnHeight || 40,
          color: item.color || '#4a90d9',
          onClick: item.onClick || null
        });
        menu._menuButtons.push(btn);
        menu.addChild(btn);
      });

      this.menus[name] = menu;
      return menu;
    }
    show(name) {
      this.currentMenu = this.menus[name] || null;
      if (this.currentMenu) {
        const canvas = LD.getCanvas();
        if (canvas) {
          const cx = canvas.width / 2;
          const cy = canvas.height / 2;
          this.currentMenu.x = cx - this.currentMenu.width / 2;
          this.currentMenu.y = cy - this.currentMenu.height / 2;
          this.currentMenu._menuButtons.forEach(function (btn, idx) {
            btn.x = cx - btn.width / 2;
            btn.y = cy - this.currentMenu.height / 2 + 60 + idx * 50;
          }.bind(this));
        }
        this.currentMenu.show();
      }
    }
    hide(name) {
      if (name && this.menus[name]) this.menus[name].hide();
      else if (this.currentMenu) this.currentMenu.hide();
    }
    hideAll() {
      for (const k in this.menus) {
        if (this.menus.hasOwnProperty(k)) this.menus[k].hide();
      }
      this.currentMenu = null;
    }
    update(dt) {
      if (this.currentMenu && this.currentMenu.visible) this.currentMenu.update(dt);
    }
    render(ctx) {
      if (this.currentMenu && this.currentMenu.visible) this.currentMenu.render(ctx);
    }
  }

  // ── Notification / Toast System ──────────────────────────────────
  const _toasts = [];

  function _addToast(opts) {
    opts = opts || {};
    _toasts.push({
      text: opts.text || '',
      color: opts.color || '#fff',
      bgColor: opts.bgColor || 'rgba(0,0,0,0.8)',
      duration: opts.duration || 3,
      elapsed: 0,
      x: opts.x || 0,
      y: opts.y || 0,
      width: opts.width || 300,
      height: opts.height || 36,
      alpha: 1
    });
  }

  function _updateToasts(dt) {
    for (let i = _toasts.length - 1; i >= 0; i--) {
      const t = _toasts[i];
      t.elapsed += dt;
      if (t.elapsed > t.duration - 0.5) {
        t.alpha = Math.max(0, (t.duration - t.elapsed) / 0.5);
      }
      if (t.elapsed >= t.duration) {
        _toasts.splice(i, 1);
      }
    }
  }

  function _renderToasts(ctx) {
    const canvas = LD.getCanvas();
    const cw = canvas ? canvas.width : 800;
    let offsetY = 60;

    for (let i = 0; i < _toasts.length; i++) {
      const t = _toasts[i];
      const tx = (t.x || cw / 2 - t.width / 2);
      const ty = offsetY;

      ctx.save();
      ctx.globalAlpha = t.alpha;
      ctx.fillStyle = t.bgColor;
      ctx.fillRect(tx, ty, t.width, t.height);
      ctx.fillStyle = t.color;
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.text, tx + t.width / 2, ty + t.height / 2);
      ctx.restore();

      offsetY += t.height + 6;
    }
  }

  // ── Public API ───────────────────────────────────────────────────
  const _elements = {};
  const _hud = new HUD();
  const _menus = new MenuSystem();

  LD.UI.Button = Button;
  LD.UI.Label = Label;
  LD.UI.Panel = Panel;
  LD.UI.ProgressBar = ProgressBar;
  LD.UI.Slider = Slider;
  LD.UI.Dialog = Dialog;
  LD.UI.HUD = HUD;
  LD.UI.MenuSystem = MenuSystem;
  LD.UIElement = UIElement;

  LD.UI.create = function (element) {
    if (element instanceof UIElement) {
      _elements[element.name] = element;
      return element;
    }
    return null;
  };

  LD.UI.get = function (name) { return _elements[name] || null; };
  LD.UI.show = function (name) { const e = _elements[name]; if (e) e.show(); };
  LD.UI.hide = function (name) { const e = _elements[name]; if (e) e.hide(); };
  LD.UI.remove = function (name) { delete _elements[name]; };

  LD.UI.initHUD = function () {
    _hud.init();
    return _hud;
  };

  LD.UI.getHUD = function () { return _hud; };

  LD.UI.createMenu = function (name, opts) {
    const menu = _menus.create(name, opts);
    _elements['menu_' + name] = menu;
    return menu;
  };

  LD.UI.showMenu = function (name) { _menus.show(name); };
  LD.UI.hideMenu = function (name) { _menus.hide(name); };
  LD.UI.hideAllMenus = function () { _menus.hideAll(); };
  LD.UI.getMenuSystem = function () { return _menus; };

  LD.UI.toast = function (text, opts) {
    _addToast(Object.assign({ text: text }, opts || {}));
  };

  LD.UI.dialog = function (title, message, buttons) {
    const d = new Dialog({ title: title, message: message, buttons: buttons || [] });
    _elements['dialog_' + Date.now()] = d;
    return d;
  };

  LD.UI.update = function (dt) {
    for (const k in _elements) {
      if (_elements.hasOwnProperty(k) && _elements[k].visible) {
        _elements[k].update(dt);
      }
    }
    _hud.update(dt);
    _menus.update(dt);
    _updateToasts(dt);
  };

  LD.UI.render = function () {
    const canvas = LD.getCanvas();
    const ctx = LD.getContext();
    if (!canvas || !ctx) return;

    _hud.render(ctx);
    _menus.render(ctx);

    for (const k in _elements) {
      if (_elements.hasOwnProperty(k) && _elements[k].visible) {
        _elements[k].render(ctx);
      }
    }

    _renderToasts(ctx);
  };

  LD.UI.clear = function () {
    for (const k in _elements) delete _elements[k];
    _toasts.length = 0;
  };

})();
