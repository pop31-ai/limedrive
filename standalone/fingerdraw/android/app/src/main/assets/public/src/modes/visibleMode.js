export class VisibleMode {
  constructor(mainCanvas) {
    this.main = mainCanvas;
    this.offsetX = 0;
    this.offsetY = -100;
    this.showOffsetPreview = true;
  }

  getOffset() {
    return { x: this.offsetX, y: this.offsetY };
  }

  getDrawCoordinates(clientX, clientY) {
    const rect = this.main.canvas.getBoundingClientRect();
    const rawX = (clientX - rect.left) * (this.main.canvas.width / rect.width);
    const rawY = (clientY - rect.top) * (this.main.canvas.height / rect.height);
    return {
      drawX: rawX + this.offsetX,
      drawY: rawY + this.offsetY,
      fingerX: rawX,
      fingerY: rawY
    };
  }

  getFingerPosition(clientX, clientY) {
    const rect = this.main.canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (this.main.canvas.width / rect.width),
      y: (clientY - rect.top) * (this.main.canvas.height / rect.height)
    };
  }

  drawOverlay(ctx, fingerX, fingerY, drawX, drawY, tool) {
    ctx.save();
    ctx.strokeStyle = 'rgba(233, 69, 96, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(fingerX, fingerY);
    ctx.lineTo(drawX, drawY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(233, 69, 96, 0.15)';
    ctx.beginPath();
    ctx.arc(fingerX, fingerY, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(233, 69, 96, 0.05)';
    ctx.beginPath();
    ctx.arc(fingerX, fingerY, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(79, 195, 247, 0.3)';
    ctx.beginPath();
    ctx.arc(drawX, drawY, tool.size / 2 + 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = tool.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(drawX, drawY, tool.size / 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✎', drawX, drawY + 3);
    ctx.fillText('●', fingerX, fingerY + 3);

    ctx.restore();
  }
}
