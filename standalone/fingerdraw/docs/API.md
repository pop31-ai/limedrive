# FingerDraw API Reference

## 🇷🇺 Описание API | 🇬🇧 API Reference

---

### MainCanvas

Core drawing engine managing canvas, layers, history, and selection.

```js
const canvas = new MainCanvas(canvasElement)
```

| Method | Description |
|--------|-------------|
| `resize()` | Resize canvas to parent dimensions |
| `getLogicalPos(clientX, clientY)` | Convert screen coords to canvas coords |
| `startStroke(x, y)` | Begin a drawing stroke |
| `drawTo(x1, y1, x2, y2)` | Draw a line segment |
| `endStroke()` | End current stroke |
| `setTool(type, color?, size?, opacity?)` | Set active tool properties |
| `setMode(mode)` | Switch between 'precise' and 'visible' |
| `render()` | Composite all layers and draw overlays |
| `undo()` / `redo()` | History navigation |
| `clearCanvas()` | Clear all layers |
| `exportPNG()` | Return dataURL of composite image |
| `getImageData(x, y, w, h)` | Get pixel data for region |

### LayerManager

```js
const mgr = new LayerManager(width, height)
```

| Method | Description |
|--------|-------------|
| `addLayer(name)` | Add new layer |
| `removeLayer(index)` | Remove layer by index |
| `setActive(index)` | Set active layer |
| `moveLayer(from, to)` | Reorder layers |
| `compositeTo(ctx)` | Composite all layers to context |

### SelectionManager

```js
const sel = new SelectionManager()
```

| Method | Description |
|--------|-------------|
| `start(x, y)` | Begin selection |
| `move(x, y)` | Update selection endpoint |
| `end()` | Finalize selection |
| `clear()` | Clear selection |
| `contains(x, y)` | Check if point is in selection |
| `drawMarquee(ctx)` | Render selection overlay |
| `getInfo()` | Get selection dimensions string |

### PreciseMode / VisibleMode

```js
const precise = new PreciseMode(mainCanvas)
const visible = new VisibleMode(mainCanvas)
```

| Method | Description |
|--------|-------------|
| `getOffset()` | Get {x, y} drawing offset |
| `drawOverlay(ctx, ...)` | Draw mode-specific overlay on canvas |

### TouchHandler

```js
const touch = new TouchHandler(canvas, {
  onStart: (x, y) => {},
  onDraw: (x1, y1, x2, y2) => {},
  onEnd: () => {},
  onPinch: (scale) => {}
})
```

### Events

| Event | Fired on | Data |
|-------|----------|------|
| `touchstart` | Canvas | Touch position |
| `touchmove` | Canvas | Continuous position |
| `touchend` | Canvas | Stroke end |

### Configuration

| Setting | Default | Range | Description |
|---------|---------|-------|-------------|
| `tool.size` | 8 | 1-60 | Brush diameter in pixels |
| `tool.opacity` | 1 | 0.05-1 | Stroke opacity |
| `tool.color` | #e94560 | Any hex | Stroke color |
| `history.maxSteps` | 30 | 1-100 | Undo history depth |
| `zoom.level` | 4 | 1-10 | Magnifier zoom factor |
| `visible.offsetY` | -100 | any | Drawing offset from finger |
