export class PreciseMode {
  constructor(mainCanvas) {
    this.main = mainCanvas;
    this.magnifierSize = 120;
    this.zoomLevel = 3;
    this.offsetY = -80;
  }

  getOffset() {
    return { x: 0, y: this.offsetY };
  }

  getCoordinates(clientX, clientY) {
    const rect = this.main.canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (this.main.canvas.width / rect.width),
      y: (clientY - rect.top) * (this.main.canvas.height / rect.height)
    };
  }

  drawOverlay(ctx, fingerX, fingerY, tool) {
    const mSize = this.magnifierSize;
    const half = mSize / 2;
    const zoom = this.zoomLevel;
    const x = fingerX;
    const y = fingerY + this.offsetY;

    ctx.save();
    const sx = Math.max(0, Math.min(this.main.canvas.width - mSize / zoom, x - half / zoom));
    const sy = Math.max(0, Math.min(this.main.canvas.height - mSize / zoom, y - half / zoom));
    try {
      const imgData = this.main.ctx.getImageData(sx, sy, mSize / zoom, mSize / zoom);
      const temp = document.createElement('canvas');
      temp.width = mSize / zoom;
      temp.height = mSize / zoom;
      temp.getContext('2d').putImageData(imgData, 0, 0);
      ctx.drawImage(temp, x - half, y - half, mSize, mSize);
    } catch (e) {}
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - half, y - half, mSize, mSize);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y - half + 8);
    ctx.lineTo(x, y + half - 8);
    ctx.moveTo(x - half + 8, y);
    ctx.lineTo(x + half - 8, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, tool.size * zoom / 2, 0, Math.PI * 2);
    ctx.strokeStyle = tool.color;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
}
