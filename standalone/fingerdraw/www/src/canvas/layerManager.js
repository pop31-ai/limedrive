export class Layer {
  constructor(width, height, name = 'Layer', index = 0) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
    this.name = name;
    this.index = index;
    this.visible = true;
    this.opacity = 1;
    this.blendMode = 'source-over';
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  toDataURL() {
    return this.canvas.toDataURL();
  }

  fromImage(img) {
    this.clear();
    this.ctx.drawImage(img, 0, 0);
  }
}

export class LayerManager {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.layers = [];
    this.activeIndex = 0;
    this.addLayer('Background');
  }

  addLayer(name) {
    const layer = new Layer(this.width, this.height, name, this.layers.length);
    this.layers.push(layer);
    this.activeIndex = this.layers.length - 1;
    return layer;
  }

  removeLayer(index) {
    if (this.layers.length <= 1) return null;
    this.layers.splice(index, 1);
    if (this.activeIndex >= this.layers.length) {
      this.activeIndex = this.layers.length - 1;
    }
    return this.active;
  }

  get active() {
    return this.layers[this.activeIndex] || null;
  }

  setActive(index) {
    if (index >= 0 && index < this.layers.length) {
      this.activeIndex = index;
    }
  }

  moveLayer(from, to) {
    if (from === to) return;
    const layer = this.layers.splice(from, 1)[0];
    this.layers.splice(to, 0, layer);
    this.activeIndex = to;
  }

  compositeTo(ctx) {
    ctx.clearRect(0, 0, this.width, this.height);
    for (let layer of this.layers) {
      if (!layer.visible) continue;
      ctx.globalAlpha = layer.opacity;
      ctx.globalCompositeOperation = layer.blendMode;
      ctx.drawImage(layer.canvas, 0, 0);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  getActiveContext() {
    return this.active ? this.active.ctx : null;
  }

  toDataURL() {
    const c = document.createElement('canvas');
    c.width = this.width;
    c.height = this.height;
    this.compositeTo(c.getContext('2d'));
    return c.toDataURL();
  }
}
