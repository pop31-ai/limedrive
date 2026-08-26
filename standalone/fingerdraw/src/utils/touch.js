export class TouchHandler {
  constructor(canvas, opts) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onDraw = opts.onDraw || (() => {});
    this.onStart = opts.onStart || (() => {});
    this.onEnd = opts.onEnd || (() => {});
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.pinchStartDist = 0;
    this.onPinch = opts.onPinch || (() => {});
    this.setup();
  }

  setup() {
    const el = this.canvas;
    el.addEventListener('touchstart', (e) => this.touchStart(e), { passive: false });
    el.addEventListener('touchmove', (e) => this.touchMove(e), { passive: false });
    el.addEventListener('touchend', (e) => this.touchEnd(e), { passive: false });
    el.addEventListener('touchcancel', (e) => this.touchEnd(e), { passive: false });
    el.addEventListener('mousedown', (e) => this.mouseDown(e));
    el.addEventListener('mousemove', (e) => this.mouseMove(e));
    el.addEventListener('mouseup', (e) => this.mouseUp(e));
    el.addEventListener('mouseleave', (e) => this.mouseUp(e));
  }

  getPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return {
      x: (touch.clientX - rect.left) * (this.canvas.width / rect.width),
      y: (touch.clientY - rect.top) * (this.canvas.height / rect.height),
      clientX: touch.clientX,
      clientY: touch.clientY
    };
  }

  getTouchById(e, id) {
    for (let t of e.touches) {
      if (t.identifier === id) return t;
    }
    return null;
  }

  touchStart(e) {
    e.preventDefault();
    if (e.touches.length === 2) {
      const t0 = e.touches[0], t1 = e.touches[1];
      this.pinchStartDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      return;
    }
    const pos = this.getPos(e);
    this.isDrawing = true;
    this.lastX = pos.x;
    this.lastY = pos.y;
    this.onStart(pos.x, pos.y);
  }

  touchMove(e) {
    e.preventDefault();
    if (e.touches.length === 2 && this.pinchStartDist > 0) {
      const t0 = e.touches[0], t1 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      const scale = dist / this.pinchStartDist;
      this.onPinch(scale);
      this.pinchStartDist = dist;
      return;
    }
    if (!this.isDrawing) return;
    const pos = this.getPos(e);
    this.onDraw(this.lastX, this.lastY, pos.x, pos.y);
    this.lastX = pos.x;
    this.lastY = pos.y;
  }

  touchEnd(e) {
    e.preventDefault();
    if (e.touches.length === 0) {
      this.isDrawing = false;
      this.pinchStartDist = 0;
      this.onEnd();
    }
  }

  mouseDown(e) {
    const pos = this.getPos(e);
    this.isDrawing = true;
    this.lastX = pos.x;
    this.lastY = pos.y;
    this.onStart(pos.x, pos.y);
  }

  mouseMove(e) {
    if (!this.isDrawing) return;
    const pos = this.getPos(e);
    this.onDraw(this.lastX, this.lastY, pos.x, pos.y);
    this.lastX = pos.x;
    this.lastY = pos.y;
  }

  mouseUp(e) {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.onEnd();
  }
}
