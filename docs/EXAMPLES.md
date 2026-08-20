# Examples

All example games included with LimeDrive v1.0.0.

## Game List

| # | Game | Genre | Difficulty | Features |
|---|------|-------|------------|----------|
| 01 | Lime Platformer | Platformer | Easy | Basic movement, platforms, items |
| 02 | Space Shooter | Shoot-em-up | Medium | Projectiles, enemies, scrolling |
| 03 | Dungeon Quest | Action RPG | Medium | Combat, health, exploration |
| 04 | Race Track | Racing | Easy | Checkpoints, timer, obstacles |
| 05 | Tower Defense | Strategy | Hard | Waves, towers, pathing |
| 06 | Kingdom RPG | RPG | Medium | Dialog, inventory, NPCs |
| 07 | Martial Arts | Fighting | Medium | Combos, health, counterattack |
| 08 | Timeline Quest | Puzzle | Hard | Time mechanics, triggers |
| 09 | Space Station | Simulation | Medium | 3D isometric, systems |
| 10 | Chess Battle | Strategy | Easy | Minimax AI, turns |

## 01 — Lime Platformer

**File**: `01-lime-platformer.json`

Standard platformer with jumping, coins, and enemies.

### Features

- Player movement and jumping
- Moving platforms
- Coin collection
- Enemy AI (chaser personality)
- Health system
- Score tracking
- Checkpoints
- Parallax background

### Entities

| Entity | Count | Purpose |
|--------|-------|---------|
| Player | 1 | Player character |
| Platform | 15 | Solid ground |
| Moving Platform | 3 | Dynamic platforms |
| Coin | 20 | Score pickups |
| Enemy | 5 | AI enemies |
| Checkpoint | 2 | Save points |
| Parallax BG | 2 | Background layers |

### Controls

- Arrow keys: Move
- Space: Jump
- Enter: Confirm

---

## 02 — Space Shooter

**File**: `02-space-shooter.json`

Top-down shooter with waves of enemies and power-ups.

### Features

- 8-directional shooting
- Multiple weapon types
- Enemy waves
- Score multiplier
- Power-ups
- Screen shake
- Particle effects

### Entities

| Entity | Count | Purpose |
|--------|-------|---------|
| Player | 1 | Ship |
| Enemy | 30 | Waves of enemies |
| Projectile | — | Player/enemy bullets |
| Power-up | 8 | Weapon upgrades |
| Asteroid | 15 | Obstacles |

### Controls

- Arrow keys: Move
- Space: Shoot
- 1–4: Switch weapons
- Shift: Dash

---

## 03 — Dungeon Quest

**File**: `03-dungeon-quest.json`

Action RPG with exploration, combat, and item collection.

### Features

- Room-based exploration
- Melee and ranged combat
- Item drops
- Health potions
- Boss enemy
- Minimap
- Inventory system

### Entities

| Entity | Count | Purpose |
|--------|-------|---------|
| Player | 1 | Hero |
| Enemy | 20 | Various types |
| Boss | 1 | Boss enemy |
| Item | 15 | Drops and pickups |
| Door | 5 | Room transitions |
| NPC | 3 | Merchants/quest givers |

### Controls

- Arrow keys: Move
- Space: Attack
- 1: Melee
- 2: Ranged
- E: Interact

---

## 04 — Race Track

**File**: `04-race-track.json`

Top-down racing with checkpoints and obstacles.

### Features

- Vehicle physics
- Checkpoint system
- Timer and best lap
- Obstacles
- Power-ups (speed boost)
- Multiple laps
- Track variations

### Entities

| Entity | Count | Purpose |
|--------|-------|---------|
| Player | 1 | Racer |
| Checkpoint | 10 | Lap markers |
| Obstacle | 15 | Hazards |
| Power-up | 5 | Speed boosts |

### Controls

- Arrow keys: Steer
- Space: Boost
- R: Reset position

---

## 05 — Tower Defense

**File**: `05-tower-defense.json`

Strategic tower placement to defend against enemy waves.

### Features

- Wave system
- Multiple tower types
- Enemy pathing
- Currency system
- Tower upgrades
- Health/lives
- Wave timer

### Entities

| Entity | Count | Purpose |
|--------|-------|---------|
| Tower | 10 | Defense towers |
| Enemy | 40 | Wave enemies |
| Spawn Point | 1 | Enemy spawn |
| Base | 1 | Defense target |
| Path Marker | 8 | Enemy waypoints |

### Tower Types

| Tower | Range | Damage | Cost | Special |
|-------|-------|--------|------|---------|
| Arrow | 150 | 1 | 50 | Fast fire |
| Cannon | 120 | 3 | 100 | Splash |
| Ice | 100 | 1 | 75 | Slow |
| Lightning | 180 | 2 | 125 | Chain |

### Controls

- Click: Place tower
- Right-click: Sell tower
- 1–4: Select tower type
- Space: Start wave

---

## 06 — Kingdom RPG

**File**: `06-kingdom-rpg.json`

RPG with dialog, NPCs, and quests.

### Features

- Dialog system
- NPC interactions
- Quest tracking
- Inventory management
- Multiple areas
- Story progression
- Save system

### Entities

| Entity | Count | Purpose |
|--------|-------|---------|
| Player | 1 | Character |
| NPC | 8 | Characters |
| Item | 12 | Collectibles |
| Trigger | 6 | Events |
| Dialog Zone | 5 | Story triggers |

### Controls

- Arrow keys: Move
- E: Interact
- I: Inventory
- Space: Confirm

---

## 07 — Martial Arts

**File**: `07-martial-arts.json`

Fighting game with combos and counterattack system.

### Features

- Combo system
- Counterattack mechanics
- Special moves
- Health/energy bars
- Round system
- Character selection
- AI opponents

### Entities

| Entity | Count | Purpose |
|--------|-------|---------|
| Player | 1 | Fighter |
| Enemy | 1 | Opponent |
| Health Bar | 2 | HP display |
| Energy Bar | 2 | Special meter |

### Combat Moves

| Input | Move | Damage | Energy |
|-------|------|--------|--------|
| Space | Punch | 1 | 0 |
| Enter | Kick | 2 | 10 |
| 1 | Special | 4 | 30 |
| Shift | Block | 0 | 5 |
| 2 | Counter | 3 | 20 |

### Controls

- Arrow keys: Move
- Space: Punch
- Enter: Kick
- 1: Special move
- 2: Counter
- Shift: Block

---

## 08 — Timeline Quest

**File**: `08-timeline-quest.json`

Puzzle game with time-based mechanics.

### Features

- Time manipulation
- Parallel timelines
- State switching
- Puzzle triggers
- Key/door system
- Pattern recognition
- Timer pressure

### Entities

| Entity | Count | Purpose |
|--------|-------|---------|
| Player | 1 | Character |
| Key | 5 | Unlock doors |
| Door | 5 | Barriers |
| Switch | 8 | Triggers |
| Trap | 6 | Hazards |
| Timeline Zone | 3 | Time portals |

### Controls

- Arrow keys: Move
- Space: Interact
- 1: Switch timeline
- E: Activate switch

---

## 09 — Space Station

**File**: `09-space-station.json`

3D isometric simulation game.

### Features

- 3D isometric rendering
- Dynamic lighting
- Multiple rooms
- System management
- Crew AI
- Resource tracking
- Day/night cycle

### Entities

| Entity | Count | Purpose |
|--------|-------|---------|
| Player | 1 | Commander |
| Crew | 8 | AI crew members |
| Room | 12 | Station sections |
| System | 6 | Life support, power |
| Light | 10 | Dynamic lights |

### Controls

- Arrow keys: Move
- Space: Interact
- Tab: Toggle UI
- 1–6: System management

---

## 10 — Chess Battle

**File**: `10-chess-battle.json`

Chess with AI opponent using minimax.

### Features

- Full chess rules
- Minimax AI
- Piece selection
- Move validation
- Check/checkmate detection
- Game history
- Difficulty levels

### AI Settings

| Level | Depth | Speed | Strength |
|-------|-------|-------|----------|
| 1 | 1 | Fast | Beginner |
| 2 | 2 | Medium | Intermediate |
| 3 | 3 | Slow | Advanced |
| 4 | 4 | Very Slow | Expert |
| 5 | 5 | Slow | Master |

### Controls

- Click: Select/move piece
- Space: Confirm move
- R: Restart game
- 1–5: Set AI difficulty

---

## Running Examples

1. Serve the project:
   ```bash
   cd limedrive
   python -m http.server 8080
   ```

2. Open `http://localhost:8080/examples/`

3. Click a game to play

### Direct Loading

```javascript
game.loadGame('examples/01-lime-platformer.json');
```

### From HTML

```html
<script src="../engine/limedrive-core.js"></script>
<script>
  const game = new LimeDrive.Game({
    canvas: document.body,
    width: 800,
    height: 600
  });
  game.loadGame('examples/03-dungeon-quest.json');
  game.start();
</script>
```
