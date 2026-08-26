import { MainCanvas } from './canvas/mainCanvas.js';
import { PreviewCanvas } from './canvas/previewCanvas.js';
import { ZoomCanvas } from './canvas/zoomCanvas.js';
import { PreciseMode } from './modes/preciseMode.js';
import { VisibleMode } from './modes/visibleMode.js';
import { TouchHandler } from './utils/touch.js';

class FingerDrawApp {
  constructor() {
    this.mainCanvasEl = document.getElementById('mainCanvas');
    this.previewContainer = document.getElementById('previewContainer');
    this.zoomContainer = document.getElementById('zoomContainer');
    this.modeIndicator = document.getElementById('modeIndicator');
    this.selectionInfo = document.getElementById('selectionInfo');
    this.statusCoords = document.getElementById('statusCoords');
    this.statusSize = document.getElementById('statusSize');
    this.statusLayer = document.getElementById('statusLayer');
    this.layerPanel = document.getElementById('layerPanel');

    this.main = new MainCanvas(this.mainCanvasEl);
    this.preview = new PreviewCanvas(this.previewContainer, this.main);
    this.zoom = new ZoomCanvas(this.zoomContainer, this.main);
    this.preciseMode = new PreciseMode(this.main);
    this.visibleMode = new VisibleMode(this.main);

    this.currentMode = 'precise';
    this.fingerX = -1;
    this.fingerY = -1;
    this.activeTool = 'pen';
    this.setupToolbar();
    this.setupTouch();
    this.setupResize();
    this.updateUI();
    this.renderLoop();
    this.main.history.saveState(this.main.layers.active.canvas);
  }

  setupToolbar() {
    document.querySelectorAll('.toolbar-btn[data-tool]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tool = btn.dataset.tool;
        if (tool === 'undo') { this.main.undo(); return; }
        if (tool === 'redo') { this.main.redo(); return; }
        if (tool === 'clear') { if (confirm('Clear canvas?')) this.main.clearCanvas(); return; }
        if (tool === 'layers') { this.layerPanel.classList.toggle('open'); return; }
        if (tool === 'export') { this.exportImage(); return; }
        if (tool === 'selection') {
          this.main.selection.active ? this.main.selection.clear() : this.main.selection.start(0, 0);
          return;
        }
        this.activeTool = tool;
        this.main.setTool(tool);
        document.querySelectorAll('.toolbar-btn[data-tool]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.main.setTool(tool, null, parseInt(document.getElementById('sizeSlider').value), parseFloat(document.getElementById('opacitySlider').value));
      });
    });

    document.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.dataset.color;
        this.main.setTool(null, color);
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('colorPicker').value = color;
      });
    });

    document.getElementById('colorPicker').addEventListener('input', (e) => {
      const color = e.target.value;
      this.main.setTool(null, color);
      document.querySelectorAll('.color-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.color === color);
      });
    });

    document.getElementById('sizeSlider').addEventListener('input', (e) => {
      const size = parseInt(e.target.value);
      this.main.setTool(null, null, size);
      document.getElementById('sizeLabel').textContent = size;
    });

    document.getElementById('opacitySlider').addEventListener('input', (e) => {
      const opacity = parseFloat(e.target.value);
      this.main.setTool(null, null, null, opacity);
      document.getElementById('opacityLabel').textContent = Math.round(opacity * 100) + '%';
    });

    document.getElementById('modeToggle').addEventListener('click', () => {
      this.currentMode = this.currentMode === 'precise' ? 'visible' : 'precise';
      this.main.setMode(this.currentMode);
      document.getElementById('modeToggle').textContent =
        this.currentMode === 'precise' ? 'Precise Mode' : 'Visible Mode';
      document.getElementById('modeToggle').classList.toggle('active', this.currentMode === 'visible');
      this.updateUI();
    });
  }

  setupTouch() {
    this.touchHandler = new TouchHandler(this.mainCanvasEl, {
      onStart: (x, y) => {
        if (this.main.selection.mode === 'rect') {
          this.main.selection.start(x, y);
          return;
        }
        const coords = this.getDrawCoords(x, y);
        this.main.startStroke(coords.drawX, coords.drawY);
      },
      onDraw: (x1, y1, x2, y2) => {
        if (this.main.selection.touching) {
          this.main.selection.move(x2, y2);
          return;
        }
        const c1 = this.getDrawCoords(x1, y1);
        const c2 = this.getDrawCoords(x2, y2);
        this.main.drawTo(c1.drawX, c1.drawY, c2.drawX, c2.drawY);
      },
      onEnd: () => {
        if (this.main.selection.touching) {
          this.main.selection.end();
          this.updateSelectionInfo();
          return;
        }
        this.main.endStroke();
      },
      onPinch: (scale) => {
        this.main.zoom = Math.max(0.1, Math.min(10, this.main.zoom * scale));
      }
    });

    this.mainCanvasEl.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const rect = this.mainCanvasEl.getBoundingClientRect();
        const t = e.touches[0];
        this.fingerX = (t.clientX - rect.left) * (this.main.canvas.width / rect.width);
        this.fingerY = (t.clientY - rect.top) * (this.main.canvas.height / rect.height);
        this.updateStatusCoords();
      }
    });

    this.mainCanvasEl.addEventListener('mousemove', (e) => {
      const rect = this.mainCanvasEl.getBoundingClientRect();
      this.fingerX = (e.clientX - rect.left) * (this.main.canvas.width / rect.width);
      this.fingerY = (e.clientY - rect.top) * (this.main.canvas.height / rect.height);
      this.updateStatusCoords();
    });
  }

  getDrawCoords(clientX, clientY) {
    const rect = this.mainCanvasEl.getBoundingClientRect();
    const x = clientX;
    const y = clientY;
    if (this.currentMode === 'precise') {
      const coords = this.preciseMode.getCoordinates(
        rect.left + x * (rect.width / this.main.canvas.width),
        rect.top + y * (rect.height / this.main.canvas.height)
      );
      return { drawX: coords.x, drawY: coords.y, fingerX: x, fingerY: y };
    } else {
      const result = this.visibleMode.getDrawCoordinates(
        rect.left + x * (rect.width / this.main.canvas.width),
        rect.top + y * (rect.height / this.main.canvas.height)
      );
      return { drawX: result.drawX, drawY: result.drawY, fingerX: result.fingerX, fingerY: result.fingerY };
    }
  }

  setupResize() {
    const ro = new ResizeObserver(() => {
      this.main.resize();
      this.updateUI();
    });
    ro.observe(this.mainCanvasEl.parentElement);
    window.addEventListener('resize', () => {
      this.main.resize();
      this.updateUI();
    });
  }

  updateUI() {
    const activeLayer = this.main.layers.active;
    this.modeIndicator.textContent =
      this.currentMode === 'precise'
        ? 'Precise Under Finger'
        : 'Visible Drawing Area';
    this.statusSize.textContent = `${this.main.tool.size}px`;
    this.statusLayer.textContent = activeLayer ? activeLayer.name : 'No layer';
    this.updateSelectionInfo();
  }

  updateStatusCoords() {
    this.statusCoords.textContent =
      this.fingerX >= 0 && this.fingerY >= 0
        ? `${Math.round(this.fingerX)}, ${Math.round(this.fingerY)}`
        : '—';
  }

  updateSelectionInfo() {
    if (this.main.selection.active) {
      this.selectionInfo.textContent = this.main.selection.getInfo();
      this.selectionInfo.classList.add('visible');
    } else {
      this.selectionInfo.classList.remove('visible');
    }
  }

  exportImage() {
    const dataURL = this.main.exportPNG();
    const link = document.createElement('a');
    link.download = `fingerdraw_${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  }

  renderLoop() {
    const render = () => {
      this.main.render();
      const modeObj = this.currentMode === 'precise' ? this.preciseMode : this.visibleMode;
      const ctx = this.main.ctx;
      const tool = this.main.tool;

      if (this.fingerX > 0 && this.fingerY > 0) {
        if (this.currentMode === 'precise') {
          modeObj.drawOverlay(ctx, this.fingerX, this.fingerY, tool);
        } else {
          const coords = this.visibleMode.getDrawCoordinates(
            this.main.canvas.getBoundingClientRect().left + this.fingerX * (this.main.canvas.getBoundingClientRect().width / this.main.canvas.width),
            this.main.canvas.getBoundingClientRect().top + this.fingerY * (this.main.canvas.getBoundingClientRect().height / this.main.canvas.height)
          );
          modeObj.drawOverlay(ctx, coords.fingerX, coords.fingerY, coords.drawX, coords.drawY, tool);
        }
      }

      this.preview.update(this.fingerX, this.fingerY, tool);
      this.zoom.update(this.fingerX, this.fingerY);
      requestAnimationFrame(render);
    };
    render();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new FingerDrawApp();
});
