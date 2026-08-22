# Examples — игры LimeDrive

_Автогенерация: `node tools/generate-examples-doc.js`. Не править руками._
_Запуск игр: `python -m http.server 8080` → `http://localhost:8080/examples/player.html?game=<файл>`_

| # | Файл | Название | Режим | Уровней | Сущностей |
|---|------|----------|-------|---------|-----------|
| 01 | `01-lime-platformer.json` | Lime Platformer | Платформер | 4 | 184 |
| 02 | `02-space-invaders.json` | Space Drift | Шутер / Tower Defense | 5 | 88 |
| 03 | `03-dungeon-crawler.json` | Lime Dungeon | RPG | 3 | 94 |
| 04 | `04-puzzle-cubes.json` | Cube Shift | Сокобан-головоломка | 5 | 136 |
| 05 | `05-race-lime.json` | Lime Circuit | Гонки | 3 | 78 |
| 06 | `06-ghost-mansion.json` | Ghost Mansion | Платформер | 3 | 79 |
| 07 | `07-ocean-diver.json` | Deep Lime | Платформер | 4 | 96 |
| 08 | `08-tower-defense.json` | Lime Towers | Шутер / Tower Defense | 4 | 98 |
| 09 | `09-neon-runner.json` | Neon Dash | Бесконечный раннер | 1 | 38 |
| 10 | `10-chess-battle.json` | Chess Clash | Пошаговая тактика | 3 | 64 |
| 11 | `11-finance-tycoon.json` | Финансовый Тайкун | Платформер | 3 | 215 |
| 12 | `12-cyber-heist.json` | Кибер-Грабёж | Платформер | 4 | 279 |
| 13 | `13-quantum-puzzle.json` | Квантовые Головоломки | Сокобан-головоломка | 3 | 169 |
| 14 | `14-tower-defense.json` | Tower Siege | Платформер | 3 | 75 |
| 15 | `15-dungeon-crawl.json` | Shadow Labyrinth | Платформер | 3 | 62 |

## Механики по режимам

- **Платформер** (`platformer`): Lime Platformer, Ghost Mansion, Deep Lime, Финансовый Тайкун, Кибер-Грабёж, Tower Siege, Shadow Labyrinth
- **Шутер / Tower Defense** (`shooter`): Space Drift, Lime Towers
- **RPG** (`rpg`): Lime Dungeon
- **Сокобан-головоломка** (`puzzle`): Cube Shift, Квантовые Головоломки
- **Гонки** (`racing`): Lime Circuit
- **Бесконечный раннер** (`endless-runner`): Neon Dash
- **Пошаговая тактика** (`turn-based-strategy`): Chess Clash

Подробные схемы параметров каждого режима — в корневом PROMPT.md,
раздел «РЕЖИМЫ ДВИЖКА».
