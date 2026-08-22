# LIMEDRIVE — Промпт для создания игр

## Базовый промпт

Скопируй этот промпт и замени `[PLACEHOLDER]` на своё.

---

```
Создай JSON-игру для движка LimeDrive.

ФОРМАТ:
{
  "name": "[НАЗВАНИЕ ИГРЫ]",
  "version": "1.0.0",
  "type": "[platformer|puzzle|shooter|rpg|racing|turn-based-strategy]",
  "description": "[ОПИСАНИЕ]",
  "author": "[ТВОЁ ИМЯ]",
  "settings": {
    "gravity": [9.8],
    "friction": [0.8],
    "airResistance": [0.02],
    "jumpForce": [15],
    "maxSpeed": [8],
    "worldWidth": [3840],
    "worldHeight": [1080],
    "theme": "[forest|desert|ice|space|lava|underwater|city|haunted|jungle|volcano|candy|tech|ancient|cloud|crystal]"
  },
  "levels": [
    {
      "name": "[ИМЯ УРОВНЯ]",
      "timeLimit": [120],
      "par": [3],
      "background": { "type": "gradient", "colors": ["#цвет1", "#цвет2", "#цвет3"] },
      "entities": [
        {
          "id": "[уникальный_id]",
          "type": "[hero|enemy|platform|pickup|decoration|trigger|spawn_point|boss|projectile|moving_platform|checkpoint|finish|portal|hazard]",
          "x": [0], "y": [0], "z": [0],
          "width": [64], "height": [64],
          "color": "#HEX",
          "health": [100],
          "speed": [5],
          "damage": [0],
          "components": ["Transform", "Sprite", "PhysicsBody", "Collider"],
          "properties": {}
        }
      ],
      "cameras": [
        { "type": "follow", "target": "hero", "smooth": 0.08, "offset": { "x": 0, "y": -150 } }
      ]
    }
  ],
  "ai": {
    "globalDifficulty": "[easy|medium|hard|expert]",
    "adaptToPlayer": true
  }
}

ТРЕБОВАНИЯ:
1. Минимум 3 уровня, каждый с уникальным фоном
2. Герой: type="hero", компоненты ["Transform","Sprite","PhysicsBody","Collider","PlayerControl","Platformer","Health"]
3. Враги: type="enemy", компоненты ["Transform","Sprite","PhysicsBody","Collider","EnemyAI","Health","Patrol"], свойства patrolRange и direction
4. Платформы: type="platform", статичные, разного размера
5. Собирабельные предметы: type="pickup", свойства value
6. Финиш: type="finish", свойство nextLevel
7. Декорации: type="decoration", z=-1 или z=-2 для параллакса
8. Ловушки: type="hazard", damage > 0
9. Движущиеся платформы: type="moving_platform", свойства axis, range
10. Чекпоинты: type="checkpoint"
11. Боссы: type="boss", здоровье > 200, урон > 20
12. Камера следит за героем
13. Координаты x/y в пределах worldWidth/worldHeight
14. Земля на y = worldHeight - 100 (высота 100)
15. Герой стартует слева внизу, финиш справа внизу

ВЫВЕДИ ТОЛЬКО JSON БЕЗ ПОЯСНЕНИЙ.
```

---

## Продвинутый промпт — Шахматы / Стратегия

```
Создай JSON-игру для движка LimeDrive. Тип: turn-based-strategy.

ФОРМАТ TURN-BASED-STRATEGY:
{
  "name": "[НАЗВАНИЕ]",
  "version": "1.0.0",
  "type": "turn-based-strategy",
  "description": "[ОПИСАНИЕ]",
  "settings": {
    "gravity": 0,
    "friction": 1.0,
    "airResistance": 1.0,
    "jumpForce": 0,
    "maxSpeed": 1,
    "worldWidth": [gridSize * cellSize],
    "worldHeight": [gridSize * cellSize],
    "theme": "chess-board",
    "attackMode": "[classic|ranged]",
    "friendlyFire": false,
    "regenPerTurn": [0],
    "critChance": [0-100],
    "critMultiplier": [1.5],
    "highlightMoves": true
  },
  "levels": [
    {
      "id": "[level-id]",
      "name": "[СЦЕНА]",
      "worldWidth": 640,
      "worldHeight": 640,
      "entities": [
        {
          "id": "grid",
          "type": "grid",
          "x": 0, "y": 0, "z": 0,
          "width": 640, "height": 640,
          "components": ["Grid", "ChessBoard"],
          "properties": {
            "gridSize": 8,
            "cellSize": 80,
            "lightColor": "#f0d9b5",
            "darkColor": "#b58863"
          }
        },
        {
          "id": "[piece-id]",
          "type": "piece",
          "x": [gridX 0-7], "y": [gridY 0-7], "z": 1,
          "width": 70, "height": 70,
          "health": [HP],
          "damage": [урон при атаке],
          "components": ["Piece","[PieceType]","[PlayerControlled|AIControlled]","Counterattack"],
          "properties": {
            "pieceType": "[king|queen|rook|bishop|knight|pawn]",
            "movePattern": "[adjacent|straight|diagonal|any-direction|l-shape|forward]",
            "maxMoveDistance": [1-7],
            "counterattackChance": [0.0-1.0],
            "counterattackDamage": [0],
            "canCaptureDiagonal": [true|false]
          }
        }
      ]
    }
  ],
  "cameras": [{ "type": "fixed", "target": "grid" }],
  "ai": { "pattern": "chess-ai" }
}

ФИГУРЫ:
| Фигура   | movePattern    | Характеристики |
|----------|----------------|----------------|
| king     | adjacent       | HP:5, урон:0, мобильность:1 |
| queen    | any-direction  | HP:4, урон:3, дальность:7 |
| rook     | straight       | HP:3, урон:2, дальность:7 |
| bishop   | diagonal       | HP:2, урон:1, дальность:7 |
| knight   | l-shape        | HP:2, урон:1, дальность:1 |
| pawn     | forward        | HP:1, урон:1, дальность:1, canCaptureDiagonal |

ПРАВИЛА:
- Уровни — как сцены в театре (одно действие за уровень), без прогрессии сложности
- Attack mode: classic = фигура перемещается на клетку врага при захвате
- Counterattack: шанс ответного удара при атаке
- Camera: fixed, нацелена на grid entity

ВЫВЕДИ ТОЛЬКО JSON.
```

---

## Продвинутый промпт — Финансовая игра

```
Создай JSON-игру для движка LimeDrive. Тема: финансы и экономика.

Жанр: [platformer|puzzle|rpg]

Сюжет: Игрок управляет [заводом|банком|биржей|фабрикой|казначейством].
Цель: [накопить капитал|спасти компанию|победить конкурентов|выйти на IPO].

Механики:
- [опиши 2-3 ключевых механики]
- Враги = [мошенники|конкуренты|кризисы|налоговые инспекторы]
- Предметы = [монеты|акции|облигации|контракты|лицензии]
- Боссы = [конкурент|финансовый кризис|аудиторская проверка]

Уровни:
1. [название] — [описание]
2. [название] — [описание]
3. [название] — [описание]

Формат JSON LimeDrive: [вставь базовый форм выше]

ВЫВЕДИ ТОЛЬКО JSON.
```

---

## Промпт — Клонирование существующей игры

```
Вот JSON игры [НАЗВАНИЕ]:

[вставь JSON]

Создай вариацию:
- Новая тема: [тема]
- Сложность: [легче|сложнее|такая же]
- Добавь: [что изменить]
- Убери: [что убрать]

Выведи изменённый JSON.
```

---

## Как использовать

1. Открой `examples/player.html?game=твоя_игра.json`
2. Скопируй промпт выше
3. Вставь в любой ИИ-чат (ChatGPT, Claude, Gemini)
4. Замени плейсхолдеры на своё
5. Получи JSON
6. Сохрани как `.json` в папку `examples/`
7. Открой в браузере через player.html

## Как запустить

```bash
# Локально
cd limedrive
python -m http.server 8080
# Открой http://localhost:8080/examples/player.html?game=твоя_игра.json

# Или просто открой examples/index.html в браузере
```

## Структура JSON

```
name          — название игры
type          — platformer / puzzle / shooter / rpg / racing / turn-based-strategy
settings      — физика и мир
levels[]      — массив уровней
  entities[]  — сущности на уровне
    type      — тип сущности
    x,y,z     —позиция
    width,h   — размер
    color     — цвет (HEX или HSL)
    health    — здоровье
    speed     — скорость
    damage    — урон
    components[] — компоненты движка
    properties{} — свойства сущности
cameras[]     — настройки камеры
ai{}          — настройки ИИ
```

## Типы сущностей (платформер)

| Тип | Описание | Ключевые свойства |
|-----|----------|-------------------|
| hero | Игрок | health, speed, PlayerControl |
| enemy | Враг | patrolRange, direction, EnemyAI |
| platform | Платформа | статичная, collision |
| pickup | Предмет | value, pickupType |
| boss | Босс | health>200, damage>20 |
| moving_platform | Движ. платформа | axis, range |
| hazard | Ловушка | damage>0 |
| checkpoint | Чекпоинт | respawn |
| finish | Финиш | nextLevel |
| decoration | Декорация | parallaxLayer |
| trigger | Триггер | action |
| portal | Портал | destination |
| projectile | Снаряд | velocity, lifetime |

## Типы сущностей (стратегия)

| Тип | Описание | Ключевые свойства |
|-----|----------|-------------------|
| grid | Шахматная доска | gridSize, cellSize, lightColor, darkColor |
| piece | Фигура | pieceType, movePattern, maxMoveDistance |

| Фигура | movePattern | HP | Урон | Дальность |
|--------|------------|-----|------|-----------|
| king | adjacent | 5 | 0 | 1 |
| queen | any-direction | 4 | 3 | 7 |
| rook | straight | 3 | 2 | 7 |
| bishop | diagonal | 2 | 1 | 7 |
| knight | l-shape | 2 | 1 | 1 |
| pawn | forward | 1 | 1 | 1 |

## Компоненты движка

| Компонент | Описание |
|-----------|----------|
| Transform | Позиция, поворот, масштаб |
| Sprite | Отрисовка спрайта/цвета |
| PhysicsBody | Физика: скорость, ускорение, масса |
| Collider | Коллизии: box/circle, layers |
| Health | Здоровье, урон, регенерация |
| PlayerControl | Управление игрока (WASD/стрелки) |
| AIControl | Параметры ИИ врагов |
| Platformer | Платформер: прыжки, койот-тайм |
| Animator | Покадровые анимации |
| ParticleEmitter | Частицы: эмиттер, скорость, цвет |
| AudioEmitter | Звуковые эффекты |
| HealthPickup | Подбор здоровья |
| Weapon | Оружие: урон, радиус, перезарядка |
| Inventory | Инвентарь: предметы, золото |
| Dialogue | Диалоги с портретами |
| Cooldown | Кулдауны способностей |
| Trail | Шлейф за сущностью |
| DelayedAction | Отложенные действия |

## Примеры игр для вдохновения

Смотри `examples/` — 13 готовых игр:
- `01-lime-platformer.json` — классический платформер
- `02-space-invaders.json` — космический шутер
- `03-dungeon-crawler.json` — подземелье
- `04-puzzle-cubes.json` — головоломка
- `05-race-lime.json` — гонки
- `06-ghost-mansion.json` — хоррор
- `07-ocean-diver.json` — подводное исследование
- `08-tower-defense.json` — башенная защита
- `09-neon-runner.json` — раннер
- `10-chess-battle.json` — тактический бой (3 шахматные сцены)
- `11-finance-tycoon.json` — финансовый тайкун
- `12-cyber-heist.json` — кибер-ограбление
- `13-quantum-puzzle.json` — квантовая головоломка
