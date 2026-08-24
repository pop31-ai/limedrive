# Game Format v1.2

Реальный JSON-формат игр LimeDrive — такой, его читает
`examples/player.html` и проверяет `tools/validate.js`.
Таблицы свойств по режимам — в [`../PROMPT.md`](../PROMPT.md) («Режимы
движка»); живые примеры — `examples/*.json`, минимальные —
`examples/_fixture-*.json`.

## Top-Level Structure

```json
{
  "name": "Название игры",
  "version": "1.0.0",
  "type": "platformer",
  "description": "Описание",
  "author": "Автор",
  "settings": { ... },
  "levels": [ { ... } ],
  "ai": { "globalDifficulty": "medium" }
}
```

| Поле | Тип | Обязательно | Примечание |
|------|-----|-------------|------------|
| `name` | string | да (error) | |
| `version` | string | warn | |
| `type` | enum | да (error) | `platformer` \| `puzzle` \| `shooter` \| `rpg` \| `racing` \| `turn-based-strategy` \| `endless-runner` |
| `description`, `author` | string | warn | |
| `settings` | object | да (error) | см. ниже |
| `levels` | array ≥1 | да (error) | <3 уровней — warn |
| `ai` | object | нет | декларативно |

## settings

```json
{
  "gravity": 1,
  "friction": 0.85,
  "airResistance": 0.05,
  "jumpForce": 15,
  "maxSpeed": 6,
  "worldWidth": 3840,
  "worldHeight": 1080,
  "theme": "forest"
}
```

**Важно про масштаб физики.** Движок интегрирует скорость покадрово:
`vy += gravity * dt * 60`, т.е. гравитация — это *пикселей за кадр²*, а не
px/s². Рабочая шкала существующих игр: `gravity` **0.5–1.5**, `jumpForce`
**12–16**, `maxSpeed` **3–8**, `friction` **0.8–0.96**. Значения «как в
учебнике» (9.8 м/с²) делают игру неиграбельной: герой не отрывается от земли
или тонет как камень (проверено на фикстурах тестов).

| Поле | Тип | Читается движком | По умолчанию |
|------|-----|------------------|--------------|
| `gravity` | number | да (warn если не число) | — |
| `friction` | number | да | — |
| `airResistance` | number | да | — |
| `jumpForce` | number | да | 16 |
| `maxSpeed` | number | да | зависит от режима |
| `worldWidth/worldHeight` | number >0 | да (**error** если ≤0) | 3840×1080 |
| `theme` | string | косметика фона | — |
| `capitalGoal` | number | да: все финишы требуют score ≥ goal | — |

Для `turn-based-strategy`: `attackMode` (classic/ranged), `friendlyFire`,
`regenPerTurn`, `critChance`, `critMultiplier`, `highlightMoves`,
`variant` (`"qi"` — дуэль на ци). Для TD: ничего сверху — режим включается
компонентами героя (см. ниже).

## level

```json
{
  "name": "Уровень 1",
  "timeLimit": 120,
  "par": 3,
  "background": { "type": "gradient", "colors": ["#0a0a2e", "#141452", "#1e1e6e"] },
  "entities": [ ... ],
  "cameras": [ { "type": "follow", "target": "hero", "smooth": 0.08 } ]
}
```

`background.type` должен быть `"gradient"` с массивом цветов (иначе warn).
Цвета — HEX `#rgb|#rgba|#rrggbb|#rrggbbaa` или CSS `hsl/rgb(a)`
(**error** при невалидном).

## entity — конверт

```json
{
  "id": "уникальный_id",
  "type": "enemy",
  "x": 200, "y": 400, "z": 0,
  "width": 36, "height": 28,
  "color": "#ff5252",
  "health": 30,
  "speed": 2,
  "damage": 10,
  "components": ["Transform", "Sprite", "Collider"],
  "properties": { "patrolRange": 120, "direction": 1 }
}
```

| Поле | Правило валидатора |
|------|--------------------|
| `id` | строка, уникальна в уровне (**error**) |
| `type` | из списка ниже (**error**) |
| `x`,`y` | числа (**error**); далеко вне мира — warn |
| `width`,`height` | >0 (**error**) |
| `color` | валидный цвет (**error**) |
| `health`,`damage` | числа, если заданы (**error**) |
| `components` | массив строк (**error** при не-массиве); отсутствие — warn. **Декларация**: рантайм читает только `WaveSpawner/TowerPlacer` (включение TD) и `TowerSlot`/`RacerAI` |
| `properties` | объект — **основная полезная нагрузка режима** |

Допустимые типы: `hero, player, enemy, platform, pickup, collectible,
powerup, decoration, trigger, spawn_point, boss, projectile, moving_platform,
checkpoint, finish, portal, hazard, grid, piece, boundary, effect, highlight,
ui, zone`.

Структурные правила уровня: ровно один `hero/player` (**error** при 0 или
нескольких); отсутствие `finish` — warn. Для шахмат: обязателен `grid`,
≥2 `piece`, среди них `PlayerControlled` и `AIControlled` (**errors**),
`piece.properties.pieceType ∈ {king,queen,rook,bishop,knight,pawn}`.

## properties по режимам

Ключевые свойства, которые рантайм реально читает (полные таблицы —
PROMPT.md):

| Режим | Примеры properties |
|-------|--------------------|
| platformer | `jumps`, `patrolRange`, `direction`, `axis`+`range`, `value`, `pickupType`, `nextLevel`, `flyPattern`, `gravityField`+`radius` (зоны) |
| puzzle | `gridSize`, `moveLimit`; блок = enemy c `pushable:true`; триггеры: `switchColor`/`requiredSwitches`/`locked`. Дверь открывается при всех активных рубильниках и удаляется (+100 очков) |
| shooter | `fireRate`, `bulletSpeed`, `bulletDamage`; враги: `shootRate`, `scoreValue`, `col`/`row` (формации) |
| tower defense | герой: `gold`, `lives`, `towerTypes`; слот = decoration c компонентом `TowerSlot`; триггеры: `waypointIndex`, `wave`+`enemies[]` |
| racing | машина: `acceleration`, `topSpeed`, `turnSpeed`; чекпоинты `lapCheckpoint:true` (порядок — число в id); финиш `lapsRequired`; пикапы `boost`/`repair`; зоны `effect: slowdown/slippery` |
| rpg | герой: `attackRange`, `attackDamage`, `attackCooldown`; ключи `pickupType:key`+`keyId`; дверь: trigger `locked`+`requiredKey` |
| runner | `doubleJump`; соперники — enemy c `rival:true` (генерируются сами, если нет) |
| модификаторы | `maxOxygen`+`oxygenDrain` (дайвинг), `lanternRadius` (темнота), `visionRange`+`visionAngle`+`sneakMultiplier` (стелс), `capitalGoal` (финиш-ворота), `hackTime`+`targetId` (терминалы) |

Семантика победы: `finish.properties.nextLevel` — индекс следующего уровня;
отсутствует/-1/вне диапазона → экран победы. В TD прорыв врага к базе
(`finish`) снимает жизнь, а не завершает уровень.

## Проверка формата

```bash
node tools/validate.js                # все examples/*.json (кроме _*)
node tools/validate.js path/to.json   # конкретный файл
node tools/validate.js --strict       # предупреждения как ошибки
```

Файлы с префиксом `_` (фикстуры, черновики) из автосканирования исключены.
