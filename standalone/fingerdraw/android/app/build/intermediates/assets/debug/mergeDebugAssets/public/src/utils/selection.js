export class SelectionManager {
  constructor() {
    this.mode = 'none';
    this.startX = 0;
    this.startY = 0;
    this.endX = 0;
    this.endY = 0;
    this.active = false;
    this.marquee = false;
    this.touching = false;
  }

  get rect() {
    if (!this.active) return null;
    return {
      x: Math.min(this.startX, this.endX),
      y: Math.min(this.startY, this.endY),
      w: Math.abs(this.endX - this.startX),
      h: Math.abs(this.endY - this.startY)
    };
  }

  get points() {
    if (!this.active) return [];
    return [
      { x: this.startX, y: this.startY },
      { x: this.endX, y: this.startY },
      { x: this.endX, y: this.endY },
      { x: this.startX, y: this.endY }
    ];
  }

  start(x, y) {
    this.mode = 'rect';
    this.startX = x;
    this.startY = y;
    this.endX = x;
    this.endY = y;
    this.active = true;
    this.marquee = true;
    this.touching = true;
  }

  move(x, y) {
    if (!this.touching) return;
    this.endX = x;
    this.endY = y;
  }

  end() {
    this.touching = false;
    if (this.active && this.rect && (this.rect.w < 5 || this.rect.h < 5)) {
      this.clear();
    }
  }

  clear() {
    this.active = false;
    this.marquee = false;
    this.mode = 'none';
    this.touching = false;
  }

  contains(x, y) {
    if (!this.active) return false;
    const r = this.rect;
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  }

  drawMarquee(ctx) {
    if (!this.marquee) return;
    const r = this.rect;
    if (!r || r.w < 1 || r.h < 1) return;
    ctx.save();
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(233, 69, 96, 0.08)';
    ctx.fillRect(r.x, r.y, r.w, r.h);
    const sz = 6;
    for (let p of this.points) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(p.x - sz/2, p.y - sz/2, sz, sz);
      ctx.strokeStyle = '#e94560';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(p.x - sz/2, p.y - sz/2, sz, sz);
    }
    ctx.restore();
  }

  getInfo() {
    if (!this.active) return 'No selection';
    const r = this.rect;
    return `Selection: ${Math.round(r.w)}×${Math.round(r.h)} @ (${Math.round(r.x)}, ${Math.round(r.y)})`;
  }
}
