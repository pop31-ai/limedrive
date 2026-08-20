# Game Format

JSON-based game definition for LimeDrive engine.

## Top-Level Structure

```json
{
  "meta": {},
  "settings": {},
  "states": {},
  "entities": [],
  "ui": {},
  "dialogs": {},
  "items": {},
  "interactions": {},
  "language": {}
}
```

## meta

```json
{
  "meta": {
    "title": "string",
    "version": "string"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Game title |
| `version` | string | Yes | Version string |

## settings

```json
{
  "settings": {
    "gravity": 980,
    "playerSpeed": 200,
    "jumpForce": 350,
    "enemySpeed": 120,
    "worldWidth": 4800,
    "worldHeight": 600,
    "width": 800,
    "height": 600,
    "language": "en"
  }
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `gravity` | number | 980 | Gravity acceleration (px/s²) |
| `playerSpeed` | number | 200 | Player movement speed (px/s) |
| `jumpForce` | number | 350 | Jump velocity (px/s) |
| `enemySpeed` | number | 120 | Default enemy speed (px/s) |
| `worldWidth` | number | 4800 | World width (px) |
| `worldHeight` | number | 600 | World height (px) |
| `width` | number | 800 | Canvas width (px) |
| `height` | number | 600 | Canvas height (px) |
| `language` | string | "en" | UI language code |

## states

States define game phases (menu, playing, win, etc.).

```json
{
  "states": {
    "menu": {
      "entities": [...]
    },
    "game": {
      "entities": [...]
    },
    "win": {
      "entities": [...]
    }
  }
}
```

## entities

Array of entity definitions.

```json
{
  "entities": [
    {
      "name": "player",
      "components": {
        "Transform": { "x": 100, "y": 100 },
        "Sprite": { "color": "#00ff00", "width": 32, "height": 32 },
        "PlayerInput": { "speed": 200, "jumpForce": 350 },
        "PhysicsBody": { "gravity": true, "jumpForce": 350 },
        "Collider": { "width": 32, "height": 32, "solid": true },
        "Health": { "hp": 5, "maxHp": 5, "invincible": true }
      }
    }
  ]
}
```

### entity Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Entity identifier |
| `components` | object | Yes | Component definitions |

## Components Reference

### Transform

```json
{
  "Transform": {
    "x": 0,
    "y": 0,
    "z": 0,
    "scaleX": 1.0,
    "scaleY": 1.0,
    "angle": 0
  }
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `x` | number | 0 | X position |
| `y` | number | 0 | Y position |
| `z` | number | 0 | Z position (for 3D) |
| `scaleX` | number | 1 | X scale |
| `scaleY` | number | 1 | Y scale |
| `angle` | number | 0 | Rotation angle (degrees) |

### Sprite

```json
{
  "Sprite": {
    "color": "#ff0000",
    "width": 32,
    "height": 32,
    "image": "path/to/sprite.png",
    "visible": true,
    "opacity": 1.0,
    "layer": 0
  }
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `color` | string | "#ffffff" | Fill color (if no image) |
| `width` | number | 32 | Width in pixels |
| `height` | number | 32 | Height in pixels |
| `image` | string | null | Image URL |
| `visible` | boolean | true | Render toggle |
| `opacity` | number | 1 | Alpha (0–1) |
| `layer` | number | 0 | Render layer (higher = on top) |

### Animation

```json
{
  "Animation": {
    "frames": ["frame1.png", "frame2.png", "frame3.png"],
    "speed": 0.15,
    "currentFrame": 0,
    "loop": true
  }
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `frames` | string[] | [] | Frame image URLs |
| `speed` | number | 0.1 | Seconds per frame |
| `currentFrame` | number | 0 | Starting frame |
| `loop` | boolean | true | Loop animation |

### PhysicsBody

```json
{
  "PhysicsBody": {
    "gravity": true,
    "jumpForce": 350,
    "velocityX": 0,
    "velocityY": 0,
    "friction": 0.9,
    "maxSpeed": 500
  }
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `gravity` | boolean | false | Apply gravity |
| `jumpForce` | number | 350 | Jump velocity |
| `velocityX` | number | 0 | Horizontal velocity |
| `velocityY` | number | 0 | Vertical velocity |
| `friction` | number | 0.9 | Velocity damping |
| `maxSpeed` | number | 500 | Max velocity magnitude |

### Collider

```json
{
  "Collider": {
    "width": 32,
    "height": 32,
    "solid": true,
    "trigger": false
  }
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `width` | number | 32 | Collision width |
| `height` | number | 32 | Collision height |
| `solid` | boolean | true | Blocks other entities |
| `trigger` | boolean | false | Fires events only, no blocking |

### Platform

```json
{
  "Platform": {
    "moving": true,
    "speed": 60,
    "rangeX": 200,
    "rangeY": 0
  }
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `moving` | boolean | false | Enable movement |
| `speed` | number | 60 | Movement speed (px/s) |
| `rangeX` | number | 0 | Horizontal travel range |
| `rangeY` | number | 0 | Vertical travel range |

### Health

```json
{
  "Health": {
    "hp": 3,
    "maxHp": 3,
    "invincible": true,
    "invincibleTime": 2.0
  }
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `hp` | number | 3 | Current health |
| `maxHp` | number | 3 | Maximum health |
| `invincible` | boolean | false | Can take damage |
| `invincibleTime` | number | 2 | Invincibility duration (s) |

### PlayerInput

```json
{
  "PlayerInput": {
    "speed": 200,
    "jumpForce": 350
  }
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `speed` | number | 200 | Movement speed (px/s) |
| `jumpForce` | number | 350 | Jump velocity |

### AIEnemy

```json
{
  "AIEnemy": {
    "personality": "chaser",
    "sightRange": 250,
    "attackRange": 40,
    "speed": 120,
    "damage": 1,
    "attackCooldown": 1.5
  }
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `personality` | string | "chaser" | AI personality type |
| `sightRange` | number | 250 | Detection range (px) |
| `attackRange` | number | 40 | Attack range (px) |
| `speed` | number | 120 | Movement speed (px/s) |
| `damage` | number | 1 | Damage dealt |
| `attackCooldown` | number | 1.5 | Time between attacks (s) |

### Item

```json
{
  "Item": {
    "type": "coin",
    "value": 10,
    "collected": false
  }
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `type` | string | "coin" | Item type identifier |
| `value` | number | 10 | Score/points value |
| `collected` | boolean | false | Whether collected |

### Projectile

```json
{
  "Projectile": {
    "speed": 400,
    "damage": 2,
    "lifetime": 3.0,
    "piercing": false
  }
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `speed` | number | 400 | Projectile speed (px/s) |
| `damage` | number | 2 | Damage dealt |
| `lifetime` | number | 3 | Seconds until despawn |
| `piercing` | boolean | false | Pass through enemies |

### TriggerZone

```json
{
  "TriggerZone": {
    "action": "loadState",
    "payload": { "state": "win" },
    "once": true
  }
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `action` | string | "" | Action type |
| `payload` | object | {} | Action parameters |
| `once` | boolean | false | Trigger only once |

### Checkpoint

```json
{
  "Checkpoint": {
    "x": 400,
    "y": 500,
    "activated": false
  }
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `x` | number | 0 | Respawn X position |
| `y` | number | 0 | Respawn Y position |
| `activated` | boolean | false | Whether activated |

### Parallax

```json
{
  "Parallax": {
    "speedX": 0.5,
    "speedY": 0.3,
    "layer": -1
  }
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `speedX` | number | 1 | Horizontal scroll multiplier |
| `speedY` | number | 1 | Vertical scroll multiplier |
| `layer` | number | 0 | Render layer |

### LightSource

```json
{
  "LightSource": {
    "color": "#ffdd00",
    "intensity": 1.0,
    "radius": 150,
    "flickers": true
  }
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `color` | string | "#ffffff" | Light color |
| `intensity` | number | 1 | Brightness (0–1) |
| `radius` | number | 100 | Light radius (px) |
| `flickers` | boolean | false | Random flicker effect |

## ui

Defines HUD and interface elements.

```json
{
  "ui": {
    "healthBar": {
      "type": "progressBar",
      "x": 20,
      "y": 20,
      "width": 200,
      "height": 20,
      "color": "#00ff00",
      "bgColor": "#333333",
      "linkedTo": "player",
      "component": "Health",
      "property": "hp",
      "maxProperty": "maxHp"
    },
    "score": {
      "type": "label",
      "x": 700,
      "y": 20,
      "text": "Score: 0",
      "color": "#ffffff",
      "size": 24
    },
    "pauseBtn": {
      "type": "button",
      "x": 700,
      "y": 560,
      "width": 80,
      "height": 30,
      "text": "Pause",
      "action": "togglePause"
    }
  }
}
```

### UI Element Types

| Type | Description |
|------|-------------|
| `label` | Text display |
| `button` | Clickable button |
| `progressBar` | Health/score bar |
| `slider` | Value slider |
| `hud` | Grouped HUD container |
| `menu` | Menu container |
| `dialog` | Dialog box |
| `tooltip` | Hover tooltip |

## dialogs

```json
{
  "dialogs": {
    "intro": {
      "speaker": "Narrator",
      "text": "Welcome to the dungeon!",
      "responses": [
        { "text": "Start", "action": "loadState", "payload": { "state": "game" } }
      ]
    }
  }
}
```

## items

```json
{
  "items": {
    "health_potion": {
      "type": "consumable",
      "effect": "heal",
      "value": 2,
      "color": "#ff0000",
      "label": "Health Potion"
    }
  }
}
```

## interactions

```json
{
  "interactions": {
    "door": {
      "type": "use",
      "condition": { "hasItem": "key" },
      "action": "loadState",
      "payload": { "state": "dungeon_2" }
    }
  }
}
```

## language

Inline localization overrides.

```json
{
  "language": {
    "en": { "greeting": "Hello!" },
    "zh": { "greeting": "你好！" }
  }
}
```
