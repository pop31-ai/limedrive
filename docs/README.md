# LimeDrive v1.0.0

Движок браузерных игр на JSON-описаниях: платформеры, сокобан, шутеры, гонки,
RPG, раннеры, Tower Defense и пошаговые стратегии (шахматы/шашки).

В проекте **два слоя**, и их важно не путать:

| Слой | Где | Статус |
|------|-----|--------|
| **Production runtime** | `examples/player.html` | Единственный исполняемый рантайм. Монолит ~4700 строк, покрыт puppeteer-тестами. Все 18 игр работают здесь. |
| **Reference library** | `engine/*.js` | Экспериментальная ECS-библиотека (6 файлов). **Ни одна страница её не подключает.** Годится как основа для будущего рефакторинга или для встраивания в свои страницы. |

## Production runtime — examples/player.html

### Запуск

```bash
cd limedrive
python -m http.server 8080
# http://localhost:8080/examples/player.html?game=01-lime-platformer.json
```

Параметр `?game=` — имя JSON-файла относительно `examples/`. Каталог игр:
`examples/index.html`, лендинг: корневой `index.html`.

### Режимы (автоопределение по JSON)

| Режим | Условие |
|-------|---------|
| chess (TBS) | `type: "turn-based-strategy"` |
| puzzle (сокобан) | `type: "puzzle"` |
| tower defense | `type: "shooter"` + компонент `WaveSpawner`/`TowerPlacer` у героя |
| runner | `type: "endless-runner"` |
| racing | `type: "racing"` |
| rpg (top-down) | `type: "rpg"` |
| shooter (формации) | `type: "shooter"` без TD-компонентов |
| platformer (базовый) | всё остальное |

Поверх базового режимов включаются модификаторы по свойствам сущностей:
`maxOxygen` → дайвинг, `lanternRadius` → темнота с фонарём, `visionRange`
(у любой сущности) → стелс-конусы, `capitalGoal` → финиш-ворота по капиталу,
`gravityField` → гравитационные пады low/high/flip.

Полная спецификация формата JSON — в [`PROMPT.md`](../PROMPT.md) (разделы
«Режимы движка») и [`GAME-FORMAT.md`](GAME-FORMAT.md).

### Управление

| Клавиша | Действие |
|---------|----------|
| Стрелки / WASD | движение (во всех режимах) |
| Space | прыжок / выстрел / пропуск отсчёта волны в TD |
| Enter | ближняя атака (RPG) |
| Shift | подкрадывание (стелс) |
| R | рестарт уровня (сокобан, экран поражения/победы) |
| Esc | пауза |
| 1–4 | выбор башни (TD); клик по слоту — построить |
| Мышь | ходы фигур (шахматы/шашки), строительство башен (TD) |

Touch-управление (D-pad + кнопки) включается автоматически на тачскринах.
Офлайн-режим — через service worker (`sw.js`, регистрируется только по HTTPS).

### Отладка

На странице доступна `window.LimeDriveDebug()` — снимок состояния:
`gameState`, `score`, `mode`, `heroPos`, `movesLeft`, `td`, `race`, `rpg`,
`diver`, `grav`, `dark`, `stealth`, `onFinish` и др. Её используют все тесты.

## Тестирование и QA

```bash
npm test          # все puppeteer-тесты режимов + патентные юнит-тесты
npm run validate  # схема-валидация всех examples/*.json
npm run check:all # валидация + headless-плейтест каждой игры + repair-отчёты
```

Механики каждого режима проверяются минимальными фикстурами
`examples/_fixture-*.json` (префикс `_` — служебный файл: валидатор и
генераторы каталогов их пропускают). Отчёты плейтеста пишутся в `reports/`.

## engine/ — reference library

Браузерная библиотека под глобалом `window.LD`. Не загружена ни одной
страницей проекта; API ниже описывает реальный код файлов.

```html
<script src="engine/limedrive-core.js"></script>
<script src="engine/limedrive-components.js"></script>
<script src="engine/limedrive-systems.js"></script>
```

| Файл | Основные экспорты |
|------|-------------------|
| `limedrive-core.js` | события `LD.on/off/emit`; `LD.Timer`, `LD.Input`, `LD.Physics`, `LD.State`, `LD.Assets`; классы `Entity/Component/System/World`; цикл `LD.start(gameJson)/stop/pause/resume`, `LD.getFps()`; загрузка и сохранение: `LD.loadGame(jsonOrUrl)`, `LD.saveGame()`, `LD.loadSave(str)`; `LD.init(canvasId)` |
| `limedrive-components.js` | 18 компонентов: Transform, Sprite, PhysicsBody, Collider, Health, PlayerControl, AIControl, Platformer, Animator, ParticleEmitter, AudioEmitter, HealthPickup, Weapon, Inventory, Cooldown, Trail, DelayedAction, Dialogue — `LD.Components.*` |
| `limedrive-systems.js` | 15 систем: Render, Physics, Collision, PlayerInput, AIControl, Animator, Particle, Platformer, Health, Camera, Pickup, Cooldown, Trail, DelayedAction, Weapon — `LD.Systems.*` |
| `limedrive-ui.js` | Button, Label, Panel, ProgressBar, Slider, Dialog, HUD, MenuSystem + хелперы `LD.UI.toast/dialog/showMenu...` |
| `limedrive-ai.js` | минимакс с альфа-бета: `LD.AI.getBestMove(state, difficulty)`; `EnemyController` (patrol/flee/counter), пресеты `DIFFICULTY` и `PERSONALITY`; глобальный тик `LD.AI.register/unregister/tick` |
| `limedrive-3d.js` | изометрия: `LD.Iso`, `LD.Mesh`, `LD.Camera3D`, `LD.SceneNode`, `LD.Renderer3D`, `LD.Lighting` |

Минимальная страница на reference-библиотеке:

```html
<canvas id="game"></canvas>
<script src="engine/limedrive-core.js"></script>
<script>
  LD.init('game');
  const hero = LD.getWorld().createEntity('hero');
  hero.addComponent(new LD.Components.Transform({ x: 100, y: 100 }));
  LD.start(); // цикл: update -> render, dt зажат до 0.05 c
</script>
```

Замечание: массивы `components[]` в JSON играх
для player.html носят декларативный характер — актуальная матрица
«что движок реально читает» генерируется в
[`ENGINE-COVERAGE.md`](ENGINE-COVERAGE.md) командой
`node tools/engine-coverage.js`.

## Структура проекта

```
limedrive/
├── index.html               # лендинг-каталог игр (генерируется tools/make-landing.js)
├── PROMPT.md                # промпты для создания игр + спецификация режимов v1.2
├── manifest.json, sw.js     # PWA
├── engine/                  # reference-библиотека (см. выше)
├── examples/                # player.html + 18 игр + _fixture-* (14 тестовых фикстур)
├── games/                   # пользовательская коллекция (конвенция game.json+meta.json)
├── generator/               # generator.html + патентные генераторы
├── articles/                # альманах «Деловая этика в играх»
├── lang/                    # локализация интерфейса
├── tests/                   # run-all.js + тесты режимов + патентные юнит-тесты
├── tools/                   # validate.js, check-game.js, анализаторы, генераторы
├── reports/                 # QA-отчёты (не коммитятся)
└── docs/                    # эта документация + legal/
```

## Legal & Licensing

LimeDrive распространяется бесплатно по трём редакциям лицензии
(см. `LICENSE.md`, `LICENSE-NC.md`, `LICENSE-EDU.md` в корне):

| Редакция | Коммерческие игры | Для кого |
|---|---|---|
| Базовая | Да | Игроделы и инди |
| NC | Нет | Хобби, джемы, портфолио |
| EDU | Учебный процесс | Школы, вузы, кружки |

Общие правила всех редакций: атрибуция «Создано на движке LimeDrive» при
публикации; совпадение результатов генератора у разных пользователей не является
нарушением; приоритет в каталоге — по дате хеш-фиксации игры в реестре.

Юридический контур: `docs/legal/00-master-ip-policy.md` (мастер-документ),
там же — анализ авторских прав на ИИ-генерацию, механизм разрешения споров,
библиография первоисточников и пакет регистрации движка как программы для ЭВМ
(`docs/legal/engine-evm-package.txt`).

Генерация пакета регистрации для своей игры:

```bash
node tools/patent-package.js examples/01-lime-platformer.json --author "Имя"
```

Результат — `reports/<game>.patent.txt`: реферат, описание, чек-лист подачи,
пошлины, депонируемый листинг и sha256-фиксация приоритета.

## Roadmap

- [x] Звук: WebAudio-синтез событий, mute по M
- [x] Сохранение прогресса/рекордов (localStorage, `limedrive_progress_*`)
- [x] Авто-пауза по `visibilitychange`
- [x] Fullscreen API (клавиша F)
- [ ] Постепенный перенос проверенных кусков engine/ (save/UI/AI) в player.html
