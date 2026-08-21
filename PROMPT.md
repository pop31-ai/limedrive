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
  "type": "[platformer|puzzle|shooter|rpg|racing]",
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
- Боссы = [кий-的竞争者|финансовый кризис|аудиторская проверка]

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
type          — platformer / puzzle / shooter / rpg / racing
settings      — физика и мир
levels[]      — массив уровней
  entities[]  — сущности на уровне
    type      — тип сущности
    x,y,z     — позиция
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

## Типы сущностей

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

## Примеры игр для вдохновения

Смотри `examples/` — 10 готовых игр:
- `01-lime-platformer.json` — классический платформер
- `02-space-invaders.json` — космический шутер
- `03-dungeon-crawler.json` — подземелье
- `04-puzzle-cubes.json` — головоломка
- `05-race-lime.json` — гонки
- `06-ghost-mansion.json` — хоррор
- `07-ocean-diver.json` — подводное исследование
- `08-tower-defense.json` — башенная защита
- `09-neon-runner.json` — раннер
- `10-chess-battle.json` — тактический бой
