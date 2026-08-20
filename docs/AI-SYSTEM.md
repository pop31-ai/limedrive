# AI System

LimeDrive uses a minimax algorithm with alpha-beta pruning and a counterattack system for enemy AI.

## Overview

```
┌─────────────────────────────────┐
│         AI System               │
├─────────┬───────────┬───────────┤
│ Minimax │Counteratk │Personality│
│ Engine  │ System    │ Traits    │
└─────────┴───────────┴───────────┘
```

## Minimax Algorithm

The AI uses a search tree to evaluate moves. Each node represents a game state, and the algorithm recursively explores possible futures.

### How It Works

1. **Generate moves**: Create all possible actions for the AI entity
2. **Evaluate board**: Score each resulting state using a heuristic function
3. **Minimize/Maximize**: AI tries to maximize its score; opponent minimizes it
4. **Alpha-beta pruning**: Skip branches that cannot affect the final decision

### Pseudocode

```
function minimax(node, depth, alpha, beta, maximizing):
    if depth == 0 or node is terminal:
        return evaluate(node)
    
    if maximizing:
        value = -infinity
        for each child of node:
            value = max(value, minimax(child, depth-1, alpha, beta, false))
            alpha = max(alpha, value)
            if alpha >= beta:
                break  // beta cutoff
        return value
    else:
        value = infinity
        for each child of node:
            value = min(value, minimax(child, depth-1, alpha, beta, true))
            beta = min(beta, value)
            if alpha >= beta:
                break  // alpha cutoff
        return value
```

### Configuration

```json
{
  "AIEnemy": {
    "minimaxDepth": 3,
    "evaluationWeights": {
      "health": 0.3,
      "distanceToPlayer": 0.2,
      "attackOpportunity": 0.4,
      "escapeRoute": 0.1
    }
  }
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `minimaxDepth` | number | 2 | Search depth (1–5) |
| `evaluationWeights` | object | auto | Heuristic weight distribution |

### Evaluation Heuristic

The AI scores each state using weighted factors:

| Factor | Weight | Description |
|--------|--------|-------------|
| Health | 0.3 | Remaining HP ratio |
| Distance | 0.2 | Proximity to player |
| Attack | 0.4 | Opportunity to deal damage |
| Escape | 0.1 | Availability of safe retreat |

## Counterattack System

Enemies can counter player attacks based on timing and personality.

### Counterattack Triggers

| Trigger | Condition | Damage |
|---------|-----------|--------|
| Parry | Player attacks within 0.5s window | 50% reflected |
| Dodge | AI dodges then immediately attacks | Full damage |
| Block | AI blocks attack, then retaliates | 25% reflected |

### Counterattack Types

```json
{
  "AIEnemy": {
    "counterattack": {
      "enabled": true,
      "types": ["parry", "dodge", "block"],
      "parryWindow": 0.5,
      "dodgeChance": 0.3,
      "blockChance": 0.4
    }
  }
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `enabled` | boolean | false | Enable counterattacks |
| `types` | string[] | [] | Allowed counter types |
| `parryWindow` | number | 0.5 | Parry timing window (s) |
| `dodgeChance` | number | 0.3 | Dodge success probability |
| `blockChance` | number | 0.4 | Block success probability |

### Counterattack Flow

```
Player Attack
    ↓
AI Detection (sightRange)
    ↓
Counter Decision (personality-based)
    ├─ Parry? → reflect 50% damage
    ├─ Dodge? → avoid + counter
    ├─ Block? → reduce damage + counter
    └─ None?  → take damage
```

## Personalities

Each AI enemy has a personality that determines behavior.

| Personality | Aggression | Counter Chance | Preferred Range | Special |
|-------------|------------|----------------|-----------------|---------|
| `chaser` | High | 20% | Melee | Pursues relentlessly |
| `patrol` | Medium | 30% | Melee | Follows waypoints |
| `shooter` | Medium | 40% | Ranged | Keeps distance |
| `tank` | Low | 60% | Melee | High HP, slow |
| `assassin` | High | 50% | Melee | Fast, flanks |
| `sniper` | Low | 35% | Long range | High damage, low HP |
| `healer` | Low | 25% | Ranged | Heals allies |
| `berserker` | Very High | 10% | Melee | Double damage, no block |
| `guardian` | Medium | 70% | Melee | Protects allies |
| `strategist` | Medium | 45% | Any | Adapts to situation |

### Personality Traits

```json
{
  "AIEnemy": {
    "personality": "chaser",
    "traits": {
      "aggression": 0.8,
      "caution": 0.2,
      "counterChance": 0.2,
      "preferenceRange": "melee",
      "flankChance": 0.1
    }
  }
}
```

| Trait | Range | Description |
|-------|-------|-------------|
| `aggression` | 0–1 | Likelihood of attacking |
| `caution` | 0–1 | Likelihood of retreating |
| `counterChance` | 0–1 | Probability of countering |
| `preferenceRange` | string | Preferred attack distance |
| `flankChance` | 0–1 | Probability of flanking |

## Difficulty Presets

Difficulty levels modify AI parameters globally.

| Level | HP Multiplier | Speed Multiplier | Damage Multiplier | Counter Multiplier | Sight Range |
|-------|---------------|------------------|-------------------|-------------------|-------------|
| 1 (Easy) | 0.5 | 0.6 | 0.5 | 0.1 | 150 |
| 2 (Normal) | 1.0 | 1.0 | 1.0 | 0.3 | 250 |
| 3 (Hard) | 1.5 | 1.2 | 1.5 | 0.5 | 350 |
| 4 (Expert) | 2.0 | 1.4 | 2.0 | 0.7 | 450 |
| 5 (Nightmare) | 3.0 | 1.6 | 3.0 | 0.9 | 600 |

### Setting Difficulty

```javascript
game.setDifficulty(3);  // Hard mode
```

```json
{
  "settings": {
    "difficulty": 3
  }
}
```

## AI State Machine

Each AI entity uses a state machine:

```
Idle → Patrol → Chase → Attack → Retreat → Idle
         ↑         ↑        ↑        │
         └─────────┴────────┴────────┘
```

### States

| State | Behavior |
|-------|----------|
| `idle` | Stand still, check for player |
| `patrol` | Follow waypoints |
| `chase` | Move toward player |
| `attack` | Execute attack when in range |
| `retreat` | Move away when low HP |
| `counter` | React to player attack |
| `dead` | Play death animation, remove |

## Behavior Trees

Complex AI behaviors use nested conditions:

```
Root Selector
├─ Sequence: Detect + Chase + Attack
├─ Sequence: Low HP + Retreat + Heal
├─ Sequence: Ally Nearby + Support
└─ Fallback: Patrol Waypoints
```

## Performance Notes

- Minimax depth > 5 may impact frame rate on complex enemies
- Use `minimaxDepth: 1` for simple enemies
- Counterattack calculations run only when player attacks are detected
- Sight range acts as an early-out to skip AI evaluation for distant entities
