# Концепт-аудит игр LimeDrive

_2026-08-22. Основано на tools/analyze-games.js и docs/ENGINE-COVERAGE.md._

## Диагноз

Из 15 игр **7 — клоны одного платформер-скелета** (сходство 56–87%):
01, 03, 06, 07, 11, 12, 13. Различается только тема (лес/призраки/океан/финансы/кибер/квант),
но не механика. Причина найдена: движок читает уникальные свойства только в шахматах,
остальные жанры исполняются общим кодом без своих механик.

Плюс `14-tower-defense.json` — вообще не tower defense, а пере-скин
`15-dungeon-crawl` (тип platformer, те же `static/direction/healAmount`).

## Жанровые столпы (7)

| # | Столп | Игра | Ядро механики | Статус ядра |
|---|-------|------|----------------|-------------|
| 1 | Platformer | 01-lime-platformer | прыжки, патруль, пикапы, босс | ✅ работает |
| 2 | Shooter | 02-space-invaders | формации, волны, паверапы | ⚠️ частично: формации/паттерны пуль объявлены, но движок их не читает |
| 3 | Puzzle | 04-puzzle-cubes | толкание блоков, рубильники→двери, лимит ходов | ❌ свойства (`pushable`, `activatesDoor`, `moveLimit`) не читаются |
| 4 | Racing | 05-race-lime | автофизика, ИИ-соперники, круги | ❌ `acceleration/turnSpeed/skill/lapsRequired` не читаются |
| 5 | Tower Defense | 08-tower-defense | волны, слоты башен, золото/lives | ❌ `wave/enemies/gold/lives/towerTypes` не читаются |
| 6 | Runner | 09-neon-runner | автоскролл, скор-зоны, дэш | ⚠️ движение героя есть; `speedMultiplier/pattern/dashDistance` не читаются |
| 7 | Turn-Based | 10-chess-battle | шахматные правила + контратака | ✅ полностью работает |

## Вердикты по всем 15 играм

| Игра | Вердикт | Действие |
|------|---------|----------|
| 01 lime-platformer | **keep** | эталон платформера |
| 02 space-invaders | **keep+добить** | реализовать формации и bullet-patterns |
| 03 dungeon-crawler | **rework** | top-down RPG: атака по кнопке, ключи→двери (`keyId/requiredKey`) |
| 04 puzzle-cubes | **keep+добить** | толкание блоков и рубильники — приоритет №1 |
| 05 race-lime | **keep+добить** | CarPhysics + RacerAI + круги |
| 06 ghost-mansion | **rework** | ядро «свет/тьма»: фонарь (`lanternRadius`) открывает призраков (`phaseInWalls`) |
| 07 ocean-diver | **rework** | ядро «кислород»: вертикальное плавание + `oxygenDrain`, всплытие за воздухом |
| 08 tower-defense | **keep+добить** | волны/башни/золото — приоритет №2 |
| 09 neon-runner | **keep+добить** | автоскролл мира, спавн впереди, дэш |
| 10 chess-battle | **keep** | единственный ТБС, работает |
| 11 finance-tycoon | **rework** | ядро «капитал»: пикапы=доход, hazard=расход, цель=`capitalGoal`; HUD-баланс |
| 12 cyber-heist | **rework** | ядро «стелс»: конусы зрения (`visionRange/Angle`), тревога, терминалы (`hackTime`) |
| 13 quantum-puzzle | **rework** | ядро «гравитация-плейграунд»: поля `gravityField`, порталы `linkId/exitId`, инверсия гравитации |
| 14 tower-defense | **merge/delete** | дубль 15; удалить после реворков |
| 15 dungeon-crawl | **absorb** | после реворков 03/06 слить лучшее и удалить |

## Принцип реворков

Каждый реворк = **одна новая системная механика** в player.html, привязанная
к уже существующим свойствам JSON. Не новые сущности — а чтение того,
что игры уже объявляют. Тогда:

1. существующие JSON сразу оживают;
2. ИИ-генерация получает осмысленные параметры (Фаза 5);
3. жанры перестают быть темами и становятся режимами.

## Порядок работ (Фаза 4)

1. Puzzle: PushableBlock/Switch/Door/moveLimit → игра 04
2. TD: WaveSpawner/TowerSlot/gold/lives → игра 08
3. Runner: автоскролл + speedMultiplier → игра 09
4. Stealth (12): vision cones + hack
5. Oxygen (07), Light/Dark (06), Capital (11), Gravity (13), RPG-keys (03)
6. Shooter-формации (02)
7. Racing (05)
