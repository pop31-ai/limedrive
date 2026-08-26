import { LayerManager } from './layerManager.js';
import { HistoryManager } from '../utils/history.js';
import { SelectionManager } from '../utils/selection.js';

export class MainCanvas {
  constructor(canvasEl) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.resize();
    this.layers = new LayerManager(this.canvas.width, this.canvas.height);
    this.history = new HistoryManager(30);
    this.selection = new SelectionManager();
    this.tool = {
      type: 'pen',
      color: '#e94560',
      size: 8,
      opacity: 1,
      blendMode: 'source-over'
    };
    this.mode = 'precise';
    this.dirty = true;
    this.zoom = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.fingerX = 0;
    this.fingerY = 0;
    this.showFingerPos = false;
    this.showMarquee = false;
    this.marqueeStart = null;
    this.marqueeEnd = null;
    this.touching = false;
    this.saveOnEnd = true;
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width;
    const h = rect.height;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    if (this.canvas.width !== w * dpr || this.canvas.height !== h * dpr) {
      this.canvas.width = w * dpr;
      this.canvas.height = h * dpr;
      this.dirty = true;
    }
  }

  getLogicalPos(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (this.canvas.width / rect.width),
      y: (clientY - rect.top) * (this.canvas.height / rect.height)
    };
  }

  startStroke(x, y) {
    const ctx = this.layers.getActiveContext();
    if (!ctx) return;
    ctx.save();
    ctx.globalCompositeOperation = this.tool.blendMode;
    ctx.globalAlpha = this.tool.opacity;
    ctx.strokeStyle = this.tool.color;
    ctx.fillStyle = this.tool.color;
    ctx.lineWidth = this.tool.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    this._ctx = ctx;
    this.touching = true;
    this.saveOnEnd = true;
  }

  drawTo(x1, y1, x2, y2) {
    if (!this._ctx) return;
    this._ctx.lineTo(x2, y2);
    this._ctx.stroke();
    this.dirty = true;
  }

  endStroke() {
    if (this._ctx) {
      this._ctx.restore();
      this._ctx = null;
    }
    this.touching = false;
    if (this.saveOnEnd) {
      this.history.saveState(this.layers.active.canvas);
    }
  }

  setTool(type, color, size, opacity) {
    if (type) this.tool.type = type;
    if (color !== undefined) this.tool.color = color;
    if (size !== undefined) this.tool.size = size;
    if (opacity !== undefined) this.tool.opacity = opacity;
  }

  setMode(mode) {
    this.mode = mode;
    this.dirty = true;
  }

  render() {
    this.layers.compositeTo(this.ctx);
    if (this.selection.active) {
      this.selection.drawMarquee(this.ctx);
    }
    if (this.showMarquee && this.marqueeStart && this.marqueeEnd) {
      this.drawMarqueeRect();
    }
    this.dirty = false;
  }

  drawMarqueeRect() {
    if (!this.marqueeStart || !this.marqueeEnd) return;
    const ctx = this.ctx;
    const x = Math.min(this.marqueeStart.x, this.marqueeEnd.x);
    const y = Math.min(this.marqueeStart.y, this.marqueeEnd.y);
    const w = Math.abs(this.marqueeEnd.x - this.marqueeStart.x);
    const h = Math.abs(this.marqueeEnd.y - this.marqueeStart.y);
    ctx.save();
    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(79, 195, 247, 0.08)';
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  setMarquee(start, end) {
    this.marqueeStart = start;
    this.marqueeEnd = end;
    this.showMarquee = !!(start && end);
  }

  clearMarquee() {
    this.marqueeStart = null;
    this.marqueeEnd = null;
    this.showMarquee = false;
  }

  getImageData(x, y, w, h) {
    return this.ctx.getImageData(x, y, w, h);
  }

  undo() {
    if (this.history.undo(this.layers.active.canvas)) {
      this.dirty = true;
    }
  }

  redo() {
    if (this.history.redo(this.layers.active.canvas)) {
      this.dirty = true;
    }
  }

  clearCanvas() {
    for (let layer of this.layers.layers) {
      layer.clear();
    }
    this.history.clear();
    this.dirty = true;
  }

  exportPNG() {
    return this.layers.toDataURL();
  }
}
