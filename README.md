# ◆ LimeDrive

Бесплатный вариативный игровой движок: HTML5 Canvas + ECS + игровой ИИ,
где игра — это декларативный JSON. Делай игры сам, генерируй с ИИ по промпту,
играй офлайн, владей своими творениями.

- **Ноль зависимостей** — чистый JavaScript, работает везде, где есть браузер
- **Игра = JSON** — читаемый формат, см. `PROMPT.md` и `docs/GAME-FORMAT.md`
- **Офлайн из коробки** — PWA: установка на главный экран Android/iOS
- **4 языка интерфейса** — en / ru / es / de, автоопределение
- **Serverless-философия** — живём в git-клоне, никаких своих серверов,
  пользовательские данные не храним (`docs/architecture/serverless-git.md`)

## Быстрый старт

```bash
cd limedrive
python -m http.server 8080     # любой статический сервер
# открыть http://localhost:8080
```

Каталог из 18 игр — на главной, плеер — `examples/player.html?game=…`.

## Лицензии (выбери свою)

| Редакция | Коммерческие игры | Кому |
|---|---|---|
| [Базовая](LICENSE.md) | Да | Игроделы, инди |
| [NC](LICENSE-NC.md) | Нет | Хобби, джемы, портфолио |
| [EDU](LICENSE-EDU.md) | Учебный процесс | Школы, вузы, кружки |

Общее для всех: атрибуция «Создано на движке LimeDrive»; совпадение результатов
генератора у разных пользователей не является нарушением; приоритет в каталоге —
по дате хеш-фиксации.

## Владение игрой (юридический контур)

1. Сделал игру в [генераторе](generator/generator.html) → **⚖ Fix** (фиксация
   приоритета в реестре) или **To collection** (game.json + meta.json).
2. CLI-пакеты:
   ```bash
   npm run patent -- examples/01-lime-platformer.json --author "Имя"
   node tools/add-to-collection.js examples/01-lime-platformer.json --author "Имя"
   ```
3. Регистрация как программы для ЭВМ в Роспатенте — пакет документов генерируется,
   процедура описана в `docs/legal/02-evm-registration-limedrive.md`.

Полная юридическая база: `docs/legal/00-master-ip-policy.md` (12 пунктов).

## Реестр приоритета без серверов

```
node tools/registry-export.js verify            # целостность цепочки печатей
node tools/registry-export.js add my-game.json  # зафиксировать свою игру
git commit && git push                          # коммит = доказательство даты
```

Цепочка хешей лежит в `registry/fixations.jsonl`; CI проверяет её на каждый PR.
Подделка ломает печати — арбитр автоматический.

## Платформы

| Платформа | Как | Статус |
|---|---|---|
| Браузеры, Android PWA | просто открой сайт | готово |
| iOS PWA | «На экран Домой» | пробно |
| Windows / macOS / Linux | `platforms/electron` | пробно |
| Лёгкий десктоп ~10 МБ | `platforms/tauri` | каркас |

## Разработка

```bash
npm test              # юнит-тесты (локали, цепочка, копилка, патентные модули)
npm run test:browser  # puppeteer smoke (главная, примеры, генератор)
npm run check:all     # валидация игр
```

Документация: `docs/README.md` (архитектура), `docs/legal/` (право),
`docs/architecture/serverless-git.md` (философия без серверов).
