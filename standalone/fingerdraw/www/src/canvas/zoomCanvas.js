export class ZoomCanvas {
  constructor(containerEl, mainCanvas) {
    this.container = containerEl;
    this.main = mainCanvas;
    this.canvas = document.createElement('canvas');
    this.canvas.width = 200;
    this.canvas.height = 200;
    this.ctx = this.canvas.getContext('2d');
    containerEl.appendChild(this.canvas);
  }

  update(fingerX, fingerY) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, w, h);

    const zoom = 4;
    const region = Math.min(this.main.canvas.width, this.main.canvas.height) / zoom / 2;
    const regionSize = Math.min(region, 40);

    if (fingerX > 0 && fingerY > 0) {
      const sx = Math.max(0, Math.min(this.main.canvas.width - regionSize * 2, fingerX - regionSize));
      const sy = Math.max(0, Math.min(this.main.canvas.height - regionSize * 2, fingerY - regionSize));
      try {
        const imgData = this.main.ctx.getImageData(sx, sy, regionSize * 2, regionSize * 2);
        const temp = document.createElement('canvas');
        temp.width = regionSize * 2;
        temp.height = regionSize * 2;
        temp.getContext('2d').putImageData(imgData, 0, 0);
        ctx.drawImage(temp, 0, 0, w, h);
      } catch (e) {}
      ctx.save();
      ctx.strokeStyle = '#e94560';
      ctx.lineWidth = 2;
      ctx.strokeRect(w / 2 - 1, h / 2 - 1, 2, 2);
      ctx.strokeStyle = 'rgba(233, 69, 96, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, w, h);
      ctx.restore();
    } else {
      ctx.fillStyle = '#555';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Zoom view', w / 2, h / 2);
    }
  }
}
