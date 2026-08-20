# LimeDrive v1.0.0

HTML5 2D/3D game engine with ECS architecture, AI, and visual level generator.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   LIMEDRIVE                          │
├──────────────┬──────────────┬───────────────────────┤
│    Core      │   Renderer   │    AI                 │
│  (ECS)       │   (Canvas2D  │  (Minimax +           │
│              │    + Isometric)│   Counterattack)     │
├──────────────┴──────────────┴───────────────────────┤
│  Components │   Systems    │   UI    │  State Machine│
└─────────────────────────────────────────────────────┘
```

| Module | File | Lines | Purpose |
|--------|------|-------|---------|
| Core | `limedrive-core.js` | ~630 | ECS, events, physics, input, collision, JSON loader |
| Renderer | `limedrive-3d.js` | ~430 | Isometric 3D renderer, camera, mesh, particles, lighting |
| AI | `limedrive-ai.js` | ~360 | Minimax, counterattack, personalities, difficulty |
| Components | `limedrive-components.js` | ~480 | 15 built-in components |
| Systems | `limedrive-systems.js` | ~500 | 12 built-in systems |
| UI | `limedrive-ui.js` | ~640 | Canvas-based UI widgets |

## Quick Start

```html
<!DOCTYPE html>
<html>
<head><title>LimeDrive Game</title></head>
<body style="margin:0; background:#000;">
<script src="../engine/limedrive-core.js"></script>
<script src="../engine/limedrive-components.js"></script>
<script src="../engine/limedrive-systems.js"></script>
<script src="../engine/limedrive-3d.js"></script>
<script src="../engine/limedrive-ai.js"></script>
<script src="../engine/limedrive-ui.js"></script>
<script>
const game = new LimeDrive.Game({
  title: 'My Game',
  canvas: document.body,
  width: 800,
  height: 600
});

const player = game.createEntity({
  components: {
    Transform: { x: 100, y: 100 },
    Sprite: { color: '#00ff00', width: 32, height: 32 },
    PlayerInput: { speed: 200 },
    PhysicsBody: { gravity: true, jumpForce: 300 }
  }
});

game.start();
</script>
</body>
</html>
```

## Controls

| Key | Action |
|-----|--------|
| Arrow keys / WASD | Move |
| Space | Jump |
| Enter | Confirm / Shoot |
| P | Pause |
| 1–4 | Attack types |
| Shift | Dash (if enabled) |

## Entity Component System

Entities are created via JSON or code:

```javascript
game.createEntity({
  name: 'enemy',
  components: {
    Transform: { x: 300, y: 200 },
    Sprite: { color: '#ff0000', width: 24, height: 24 },
    PhysicsBody: { gravity: true },
    AIEnemy: { personality: 'chaser', difficulty: 2 }
  }
});
```

### Built-in Components

| Component | Key Properties | Description |
|-----------|---------------|-------------|
| `Transform` | x, y, z, scaleX, scaleY, angle | Position and transform |
| `Sprite` | color, width, height, image, visible, opacity, layer | Visual representation |
| `Animation` | frames, speed, currentFrame | Sprite animation |
| `PhysicsBody` | velocityX, velocityY, gravity, jumpForce, grounded | Physics simulation |
| `Collider` | width, height, solid, trigger | Collision detection |
| `Platform` | moving, speed, rangeX, rangeY | Moving platform |
| `Health` | hp, maxHp, invincible | Health system |
| `PlayerInput` | speed, jumpForce | Player keyboard input |
| `AIEnemy` | personality, sightRange, attackRange | AI enemy behavior |
| `Item` | type, value, collected | Collectible items |
| `Projectile` | speed, damage, lifetime, piercing | Projectile behavior |
| `TriggerZone` | action, payload | Event trigger |
| `Checkpoint` | x, y, activated | Spawn point |
| `Parallax` | speedX, speedY, layer | Scrolling background |
| `LightSource` | color, intensity, radius, flickers | Dynamic lighting |

### Built-in Systems

| System | Priority | Purpose |
|--------|----------|---------|
| `InputSystem` | 1 | Handles keyboard/mouse/touch |
| `PhysicsSystem` | 2 | Gravity, velocity, movement |
| `CollisionSystem` | 3 | AABB collision detection |
| `PlatformSystem` | 4 | Moving platform logic |
| `PlayerSystem` | 5 | Player input processing |
| `AISystem` | 6 | Enemy AI behavior |
| `HealthSystem` | 7 | Damage and death handling |
| `ProjectileSystem` | 8 | Projectile movement and collision |
| `AnimationSystem` | 9 | Frame animation |
| `RenderSystem` | 10 | 2D canvas rendering |
| `Render3DSystem` | 11 | 3D isometric rendering |
| `TriggerSystem` | 12 | Trigger zone activation |

## API Reference

### Game

```javascript
const game = new LimeDrive.Game({
  title: 'string',       // Window title
  canvas: HTMLElement,    // Container element
  width: 800,             // Canvas width
  height: 600,            // Canvas height
  renderer: '2d'          // '2d' or '3d' for isometric
});
```

| Method | Description |
|--------|-------------|
| `game.start()` | Start game loop |
| `game.stop()` | Pause game loop |
| `game.createEntity(json)` | Create entity from JSON |
| `game.removeEntity(id)` | Remove entity by ID |
| `game.getEntitiesByComponent(name)` | Get all entities with component |
| `game.on(event, callback)` | Register event listener |
| `game.emit(event, data)` | Emit event |
| `game.setState(name)` | Switch game state |
| `game.setDifficulty(level)` | Set AI difficulty (1–5) |
| `game.loadGame(url)` | Load game from JSON URL |
| `game.setLanguage(lang)` | Set UI language |
| `game.registerComponent(name, schema)` | Register custom component |
| `game.registerSystem(name, fn, priority)` | Register custom system |

### Input

```javascript
LimeDrive.Input.isDown('left')    // Arrow left / A
LimeDrive.Input.isDown('right')   // Arrow right / D
LimeDrive.Input.isDown('up')      // Arrow up / W
LimeDrive.Input.isDown('down')    // Arrow down / S
LimeDrive.Input.isDown('jump')    // Space
LimeDrive.Input.isDown('confirm') // Enter
LimeDrive.Input.isDown('pause')   // P
LimeDrive.Input.isDown('attack1') // 1
LimeDrive.Input.isDown('attack2') // 2
LimeDrive.Input.isDown('attack3') // 3
LimeDrive.Input.isDown('attack4') // 4
LimeDrive.Input.isDown('shift')   // Shift
```

### Vector Math

```javascript
LimeDrive.Vector2.add(v1, v2)
LimeDrive.Vector2.subtract(v1, v2)
LimeDrive.Vector2.multiply(v1, scalar)
LimeDrive.Vector2.magnitude(v)
LimeDrive.Vector2.normalize(v)
LimeDrive.Vector2.distance(v1, v2)
LimeDrive.Vector2.angle(v1, v2)
```

### Utilities

```javascript
LimeDrive.Utils.clamp(value, min, max)
LimeDrive.Utils.lerp(a, b, t)
LimeDrive.Utils.randomRange(min, max)
LimeDrive.Utils.randomInt(min, max)
LimeDrive.Utils.choose(array)
LimeDrive.Utils.shuffle(array)
LimeDrive.Utils.deepClone(obj)
LimeDrive.Utils.loadJSON(url)
```

### Canvas

```javascript
const canvas = new LimeDrive.Canvas({
  parent: document.body,
  width: 800,
  height: 600,
  background: '#1a1a2e'
});

canvas.clear()
canvas.drawRect(x, y, w, h, color)
canvas.drawCircle(x, y, r, color)
canvas.drawText(text, x, y, { size, color, align })
canvas.drawImage(img, x, y, w, h)
```

### 3D / Isometric

```javascript
const camera = new LimeDrive.Camera3D();
camera.position = { x: 0, y: 200, z: 200 };
camera.lookAt = { x: 0, y: 0, z: 0 };

const mesh = new LimeDrive.Mesh([
  { x: -1, y: 0, z: -1 },
  { x: 1, y: 0, z: -1 },
  { x: 0, y: 1, z: 0 }
], [0, 1, 2]);

const lighting = new LimeDrive.Lighting3D();
lighting.addLight({ x: 0, y: 100, color: '#ffffff', intensity: 1 });
```

### State Machine

```javascript
game.registerState('menu', {
  enter: (data) => { /* setup */ },
  update: (dt) => { /* logic */ },
  exit: () => { /* cleanup */ }
});

game.registerState('playing', {
  enter: () => { game.loadGame('levels/1.json'); },
  update: (dt) => { /* game logic */ }
});

game.setState('menu');
```

### Localization

```javascript
game.setLanguage('en');  // or 'zh', 'ja', etc.
game.t('greeting');      // Returns localized string from lang/ folder
```

### Event System

```javascript
game.on('entityCreated', (entity) => { });
game.on('entityRemoved', (entity) => { });
game.on('collision', (e) => { e.a, e.b });
game.on('damage', (e) => { e.target, e.amount });
game.on('death', (entity) => { });
game.on('collect', (e) => { e.entity, e.item });
game.on('stateChange', (e) => { e.from, e.to });
```

## Game JSON Structure

```json
{
  "meta": { "title": "string", "version": "1.0" },
  "settings": {
    "gravity": 980,
    "width": 800,
    "height": 600,
    "language": "en"
  },
  "states": {
    "menu": { "entities": [...] },
    "game": { "entities": [...] },
    "win": { "entities": [...] }
  },
  "entities": [ ... ]
}
```

## Running

Serve the `limedrive` folder with any HTTP server:

```bash
cd limedrive
python -m http.server 8080
```

Open `http://localhost:8080/examples/` to play all example games.

## File Structure

```
limedrive/
├── engine/
│   ├── limedrive-core.js          # ECS core + utilities
│   ├── limedrive-3d.js            # 3D isometric renderer
│   ├── limedrive-ai.js            # AI system
│   ├── limedrive-components.js    # Built-in components
│   ├── limedrive-systems.js       # Built-in systems
│   └── limedrive-ui.js            # UI widgets
├── generator/
│   └── generator.html             # Visual level generator
├── examples/
│   ├── index.html                 # Game selector
│   ├── 01-lime-platformer.json    # Example games
│   ├── 02-space-shooter.json
│   ├── 03-dungeon-quest.json
│   ├── 04-race-track.json
│   ├── 05-tower-defense.json
│   ├── 06-kingdom-rpg.json
│   ├── 07-martial-arts.json
│   ├── 08-timeline-quest.json
│   ├── 09-space-station.json
│   └── 10-chess-battle.json
├── lang/                          # Localization files
└── docs/                          # Documentation
    ├── README.md
    ├── GAME-FORMAT.md
    ├── AI-SYSTEM.md
    ├── GENERATOR.md
    └── EXAMPLES.md
```
