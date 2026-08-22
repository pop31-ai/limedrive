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

Смотри `examples/` — 15 готовых игр:
- `01-lime-platformer.json` — классический платформер
- `02-space-invaders.json` — космический шутер с формациями
- `03-dungeon-crawler.json` — подземелье
- `04-puzzle-cubes.json` — сокобан-головоломка (толкание блоков, рубильники)
- `05-race-lime.json` — гонки с ИИ-соперниками и кругами
- `06-ghost-mansion.json` — хоррор
- `07-ocean-diver.json` — подводное исследование
- `08-tower-defense.json` — башенная защита (волны, башни, золото)
- `09-neon-runner.json` — раннер с автобегом
- `10-chess-battle.json` — тактический бой (3 шахматные сцены)
- `11-finance-tycoon.json` — финансовый тайкун
- `12-cyber-heist.json` — кибер-ограбление
- `13-quantum-puzzle.json` — квантовая головоломка
- `14-tower-defense.json`, `15-dungeon-crawl.json` — платформеры (кандидаты на реворк)

---

# РЕЖИМЫ ДВИЖКА — что реально работает (v1.1)

Движок выбирает режим по `type`. Ниже — параметры, которые движок ЧИТАЕТ.
Всё, что не указано — игнорируется (рисуется, но не влияет).

## 1) Platformer (type: "platformer") — базовый режим
См. базовый промпт выше. Ключевое: hero/enemy/platform/pickup/hazard/
moving_platform/checkpoint/finish/boss; properties: patrolRange, direction,
axis, range, interval, duration, value, pickupType, nextLevel, jumps,
flyPattern, flyAmplitude, gravityMultiplier (zone).

## 2) Puzzle / Сокобан (type: "puzzle")
Герой ходит по сетке, толкает блоки, блоки активируют рубильники,
открытые двери освобождают путь к финишу.

| Entity | Обязательные поля | Properties движка |
|--------|-------------------|-------------------|
| hero | type=hero | gridSize (ячейка, напр. 64), moveLimit |
| блок | type=**enemy**, health>0 | pushable:true |
| рубильник | type=trigger | switchColor:"red", activated:false, activatesDoor:"door_id" |
| дверь | type=trigger | locked:true, requiredSwitches:["id1","id2"] |
| финиш | type=finish | nextLevel |

Правила: толчок только по одному блоку; блок на рубильнике держит его
активным; дверь открывается когда ВСЕ requiredSwitches активны.
Ходы кончились → авто-рестарт уровня. R — рестарт вручную.

```json
{
  "name": "[НАЗВАНИЕ]", "version": "1.0", "type": "puzzle",
  "settings": { "gravity": 0, "friction": 1, "airResistance": 0, "jumpForce": 0,
    "maxSpeed": 4, "worldWidth": "[cols*64+64]", "worldHeight": "[rows*64+64]", "theme": "neon" },
  "levels": [{
    "name": "[УРОВЕНЬ]", "timeLimit": [сек],
    "background": { "type": "solid", "colors": ["#0a0a2e"] },
    "entities": [
      { "id": "hero_1", "type": "hero", "x": "[64*k]", "y": "[64*m]", "width": 48, "height": 48,
        "color": "#8BC34A", "properties": { "gridSize": 64, "moveLimit": [20-60] } },
      { "id": "wall_N", "type": "platform", ... "properties": {} },
      { "id": "block_red_1", "type": "enemy", ..., "health": 9999, "color": "#e74c3c",
        "properties": { "pushable": true } },
      { "id": "switch_red_1", "type": "trigger", "properties": {
          "switchColor": "red", "activated": false, "activatesDoor": "door_1" } },
      { "id": "door_1", "type": "trigger", "properties": {
          "locked": true, "requiredSwitches": ["switch_red_1"] } },
      { "id": "finish_1", "type": "finish", "properties": { "nextLevel": [0..] } }
    ]
  }]
}
```

## 3) Tower Defense (type: "shooter" + компоненты)
Определяется наличием компонентов WaveSpawner/TowerPlacer.

| Entity | Роль | Properties движка |
|--------|------|-------------------|
| hero | TowerPlacer | gold, lives, towerTypes:["arrow","cannon","ice","laser"] |
| spawn_point | старт пути | spawnInterval (сек между спавнами) |
| trigger | waypoint | waypointIndex: 1,2,3... (цепочка к базе) |
| trigger | волна | wave:N, delay, enemies:[{type,count,hp,speed,reward}] |
| decoration | слот башни | components:["TowerSlot"], properties:{} |
| finish | БАЗА | прорыв врага = -1 жизнь (не переход уровня!) |

Цены башен: arrow 50g (дальняя, быстрая), cannon 100g (сплэш), ice 75g
(замедление 55%), laser 125g. Награда за убийство = reward → золото.
Клик по пустому слоту строит выбранную башню; 1–4 выбор типа; Space —
начать волну раньше. Все волны отбиты → victory; lives=0 → GAME OVER.

## 4) Endless Runner (type: "endless-runner")
Герой бежит вправо сам. Игрок управляет прыжком (Space), скорость меняют зоны.

| Entity | Properties движка |
|--------|-------------------|
| zone | speedMultiplier (0.5–2.5), gravityMultiplier |
| platform/hazard/pickup | как в платформере |

Трек = реальные x сущностей (может быть >> worldWidth). Скор = дистанция +
пикапы. Смерть → респавн на checkpoint, собранное сохраняется.

## 5) Shooter / Формации (type: "shooter", без TD-компонентов)
Топ-даун: герой стреляет вверх, враги летают формацией и отвечают огнём.

| Entity | Properties движка |
|--------|-------------------|
| hero | fireRate (выстр/сек), bulletSpeed (~9), bulletDamage |
| enemy | shootRate (перезарядка сек), scoreValue, formation:"grid", col, row |
| boss | health большой; убивается пулями |
| powerup | падает с врага если задан properties.powerupType у врага |

Зачистил уровень → следующий; последний → victory.

## 6) Racing (type: "racing")
Аркадные гонки вид сверху: газ/тормоз/поворот, круги по чекпоинтам.

| Entity | Properties движка |
|--------|-------------------|
| hero (машина) | acceleration (~0.3), topSpeed (~10), turnSpeed (~4 град/тик) |
| enemy (RacerAI) | те же + skill (0.5–0.9), racerName |
| checkpoint ×N | lapCheckpoint:true; порядок = число в id ("checkpoint_1"...) |
| finish | lapsRequired, nextLevel |
| pickup | pickupType:"boost" (+boostForce, boostDuration) или "repair" (+value) |
| hazard (точечный) | hazardType:"rock"/"cactus"/"snowman" — удар гасит скорость |
| hazard (зона) | effect:"slowdown"+reduction ИЛИ "slippery"+frictionReduction |

Круг засчитывается при прохождении всех чекпоинтов ПО ПОРЯДКУ id.
HUD: LAP, POS (позиция в гонке), спидбар, миникарта (components:["Minimap"],
trackScale ~0.07).

## 7) Turn-Based Strategy / Шахматы (type: "turn-based-strategy")
См. продвинутый промпт выше — полностью работает: сетка, фигуры, контратаки.

---

## Матрица «режим → какой промпт»

| Хочу игру про… | type | Секция |
|----------------|------|--------|
| прыжки/платформы | platformer | 1 |
| толкать блоки, двери | puzzle | 2 |
| защищать базу волнами | shooter + TD-компоненты | 3 |
| бесконечный бег | endless-runner | 4 |
| космическая стрельба | shooter | 5 |
| гонки | racing | 6 |
| пошаговая тактика | turn-based-strategy | 7 |
