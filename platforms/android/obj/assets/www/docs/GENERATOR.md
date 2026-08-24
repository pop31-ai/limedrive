# Generator

Visual level editor for LimeDrive games.

## Access

Open `generator/generator.html` in a browser.

## Interface

The generator has a tabbed interface with live preview.

### Tabs

| Tab | Purpose |
|-----|---------|
| Level Settings | Canvas size, gravity, theme |
| Terrain | Platforms, ground, obstacles |
| Entities | Enemies, items, NPCs |
| UI/HUD | Health bar, score, menus |
| 3D Preview | Isometric view toggle |

## Level Settings

### Controls

| Control | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| Width | Slider | 400–1920 | 800 | Canvas width (px) |
| Height | Slider | 300–1080 | 600 | Canvas height (px) |
| Gravity | Slider | 0–2000 | 980 | Gravity (px/s²) |
| Theme | Dropdown | — | — | Visual theme |

### Themes

| Theme | Background | Platforms | Entities |
|-------|------------|-----------|----------|
| `platformer` | Sky blue | Green | Colorful |
| `space` | Black | Grey | Sci-fi |
| `dungeon` | Dark brown | Stone | Muted |
| `forest` | Green | Wood | Nature |
| `industrial` | Grey | Metal | Dark |

## Terrain

### Platform Types

| Type | Shape | Color | Description |
|------|-------|-------|-------------|
| Ground | Rectangle | Green | Solid ground |
| Platform | Rectangle | Brown | Floating platform |
| Moving | Rectangle + arrows | Blue | Moves horizontally/vertically |
| Breakable | Cracked | Yellow | Breaks on contact |
| Spike | Triangle | Red | Damage zone |
| Checkpoint | Flag | White | Save point |

### Controls

| Control | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| Platform Count | Slider | 0–50 | 10 | Number of platforms |
| Moving Platforms | Slider | 0–20 | 3 | Moving platform count |
| Spike Count | Slider | 0–30 | 5 | Spike count |
| Platform Width | Slider | 40–200 | 80 | Default platform width |
| Platform Height | Slider | 20–80 | 30 | Default platform height |
| Breakable Platforms | Slider | 0–15 | 2 | Breakable platform count |

### Placement

- Click canvas to place platform
- Drag to resize
- Right-click to delete
- Arrow keys to move selected platform

## Entities

### Entity Types

| Type | Component | Description |
|------|-----------|-------------|
| Player | `PlayerInput`, `Health` | Player character |
| Enemy | `AIEnemy`, `Health` | AI enemy |
| Coin | `Item` | Score pickup |
| Health Pack | `Item`, `Health` | HP restore |
| NPC | — | Non-player character |
| Trigger | `TriggerZone` | Event zone |
| Decoration | `Sprite` | Visual only |

### Enemy Personalities

Select personality for each enemy:

| Personality | Behavior |
|-------------|----------|
| `chaser` | Runs toward player |
| `patrol` | Follows waypoints |
| `shooter` | Fires projectiles |
| `tank` | High HP, slow |
| `assassin` | Fast, flanks |
| `sniper` | Long range, high damage |
| `healer` | Heals allies |
| `berserker` | Double damage |
| `guardian` | Protects allies |
| `strategist` | Adapts to situation |

### Controls

| Control | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| Enemy Count | Slider | 0–30 | 5 | Number of enemies |
| Coin Count | Slider | 0–50 | 15 | Number of coins |
| Health Pack Count | Slider | 0–10 | 2 | Health pack count |
| Difficulty | Slider | 1–5 | 2 | Enemy difficulty |
| Sight Range | Slider | 100–600 | 250 | Enemy detection range |

### Placement

- Click canvas to place entity
- Drag to move
- Right-click to delete
- Select personality from dropdown

## UI/HUD

### UI Elements

| Element | Description |
|---------|-------------|
| Health Bar | Player HP display |
| Score Label | Score counter |
| Timer | Level timer |
| Pause Button | Pause toggle |
| Menu | Main menu |
| Dialog Box | Story/dialogue |

### Controls

| Control | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| Health Bar | Checkbox | — | On | Show health bar |
| Score | Checkbox | — | On | Show score |
| Timer | Checkbox | — | Off | Show timer |
| Pause Button | Checkbox | — | On | Show pause button |

### Health Bar Settings

| Control | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| Width | Slider | 100–400 | 200 | Bar width (px) |
| Height | Slider | 10–40 | 20 | Bar height (px) |
| X Position | Slider | 0–780 | 20 | X position |
| Y Position | Slider | 0–580 | 20 | Y position |
| Color | Color picker | — | #00ff00 | Fill color |
| Background | Color picker | — | #333333 | Background color |

## 3D Preview

### Controls

| Control | Type | Description |
|---------|------|-------------|
| Enable 3D | Checkbox | Toggle isometric view |
| Camera Angle | Slider | Camera rotation |
| Camera Height | Slider | Camera elevation |
| Lighting | Checkbox | Toggle dynamic lighting |

### 3D Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| Camera Angle | number | 30 | Camera rotation (degrees) |
| Camera Height | number | 200 | Camera Y position |
| Light Intensity | slider | 1.0 | Global light brightness |
| Shadow Opacity | slider | 0.3 | Shadow darkness |

## Export

### Export Options

| Button | Description |
|--------|-------------|
| Copy JSON | Copy game JSON to clipboard |
| Download JSON | Download as `.json` file |
| Open in Player | Load in game viewer |
| New Game | Clear and start fresh |

### Export Formats

| Format | Description |
|--------|-------------|
| `game` | Full game JSON with states |
| `level` | Level entities only |
| `config` | Settings and metadata only |

### Export Dialog

| Field | Description |
|-------|-------------|
| Title | Game title |
| Version | Version string |
| Format | Export format |
| Include UI | Include UI elements |
| Include Dialogs | Include dialog data |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Ctrl+S | Save/Export |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Delete | Delete selected |
| Arrow Keys | Move selected |
| Escape | Deselect |
| Tab | Switch tabs |

## Workflow

1. **Level Settings**: Set canvas size, gravity, theme
2. **Terrain**: Place platforms, ground, obstacles
3. **Entities**: Add enemies, items, triggers
4. **UI/HUD**: Configure interface elements
5. **3D Preview**: Check isometric view if using 3D mode
6. **Export**: Copy or download game JSON

## Tips

- Use the 3D Preview to check depth and spacing
- Test difficulty by adjusting enemy count and sight range
- Breakable platforms add variety without complexity
- Moving platforms require careful spacing
- Checkpoint placement affects difficulty curve
- Theme selection sets the visual tone
