export function drawDot(ctx, x, y, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawLine(ctx, x1, y1, x2, y2, size, color, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

export function drawBrush(ctx, x1, y1, x2, y2, size, color, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity * 0.7;
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 1.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  const spread = size * 0.3;
  ctx.globalAlpha = opacity * 0.2;
  for (let i = 0; i < 5; i++) {
    const ox = (Math.random() - 0.5) * spread;
    const oy = (Math.random() - 0.5) * spread;
    ctx.lineWidth = size * (0.3 + Math.random() * 0.7);
    ctx.beginPath();
    ctx.moveTo(x1 + ox, y1 + oy);
    ctx.lineTo(x2 + ox, y2 + oy);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawEraser(ctx, x1, y1, x2, y2, size) {
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.strokeStyle = 'rgba(0,0,0,1)';
  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

export function getToolDrawFn(type) {
  switch (type) {
    case 'pen': return drawLine;
    case 'brush': return drawBrush;
    case 'eraser': return drawEraser;
    case 'marker': return (ctx, x1, y1, x2, y2, size, color, opacity) => {
      ctx.save();
      ctx.globalAlpha = opacity * 0.4;
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    };
    case 'airbrush': return (ctx, x1, y1, x2, y2, size, color, opacity) => {
      ctx.save();
      ctx.globalAlpha = opacity * 0.15;
      ctx.fillStyle = color;
      const dist = Math.hypot(x2 - x1, y2 - y1);
      const steps = Math.max(1, Math.floor(dist / 2));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = x1 + (x2 - x1) * t;
        const y = y1 + (y2 - y1) * t;
        for (let j = 0; j < 8; j++) {
          const ox = (Math.random() - 0.5) * size;
          const oy = (Math.random() - 0.5) * size;
          ctx.beginPath();
          ctx.arc(x + ox, y + oy, size * 0.15, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    };
    default: return drawLine;
  }
}
