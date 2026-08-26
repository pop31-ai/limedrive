export class PreviewCanvas {
  constructor(containerEl, mainCanvas) {
    this.container = containerEl;
    this.main = mainCanvas;
    this.canvas = document.createElement('canvas');
    this.canvas.width = 200;
    this.canvas.height = 150;
    this.ctx = this.canvas.getContext('2d');
    containerEl.appendChild(this.canvas);
    this.mode = 'tool';
  }

  update(fingerX, fingerY, tool) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);

    const previewSize = 60;
    const halfPs = previewSize / 2;

    if (fingerX > 0 && fingerY > 0) {
      const sx = Math.max(0, Math.min(this.main.canvas.width - previewSize, fingerX - halfPs));
      const sy = Math.max(0, Math.min(this.main.canvas.height - previewSize, fingerY - halfPs));
      try {
        const imgData = this.main.ctx.getImageData(sx, sy, previewSize, previewSize);
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = previewSize;
        tempCanvas.height = previewSize;
        tempCanvas.getContext('2d').putImageData(imgData, 0, 0);
        ctx.drawImage(tempCanvas, 0, 0, w, h);
      } catch (e) {}

      ctx.save();
      ctx.strokeStyle = 'rgba(233, 69, 96, 0.5)';
      ctx.lineWidth = 1;
      const cx = w / 2;
      const cy = h / 2;
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy);
      ctx.lineTo(cx + 8, cy);
      ctx.moveTo(cx, cy - 8);
      ctx.lineTo(cx, cy + 8);
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.fillStyle = '#555';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Touch to preview', w / 2, h / 2);
    }

    ctx.save();
    ctx.fillStyle = tool.color;
    ctx.beginPath();
    ctx.arc(w - 16, h - 16, Math.max(2, tool.size / 2), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#888';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${tool.type} ${tool.size}px`, w - 8, h - 26);
    ctx.restore();
  }
}
