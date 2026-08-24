# LimeDrive

Движок браузерных игр на JSON: опиши уровни сущностями — получи платформер,
сокобан, шутер, гонки, RPG, раннер, Tower Defense или пошаговую стратегию
(шахматы, шашки, дуэль на ци). Работает офлайн как PWA, игры создаются
промптами к LLM или визуальным генератором.

## Быстрый старт

```bash
cd limedrive
python -m http.server 8080
```

- Каталог игр: `http://localhost:8080/examples/`
- Конкретная игра: `examples/player.html?game=01-lime-platformer.json`
- Лендинг: `http://localhost:8080/`

Управление: стрелки/WASD — движение, Space — прыжок/огонь, Enter — атака
(RPG), Shift — подкрадывание (стелс), R — рестарт, Esc — пауза. На тачскринах
автоматически появляется экранный D-pad.

## Создание своей игры

1. Скопируй промпт из [`PROMPT.md`](PROMPT.md) в любой LLM-чат;
2. Сохрани ответ как `.json` в `examples/`;
3. Открой через `player.html?game=файл.json`;
4. Проверь: `node tools/validate.js examples/файл.json`.

Формат описан в [`docs/GAME-FORMAT.md`](docs/GAME-FORMAT.md), архитектура и
режимы — в [`docs/README.md`](docs/README.md).

## Скрипты

| Команда | Что делает |
|---------|-----------|
| `npm test` | puppeteer-тесты всех режимов + юнит-тесты патентного пакета |
| `npm run validate` | схема-валидация игр |
| `npm run check` / `check:all` | headless-плейтест игр + repair-отчёты |

Требуется один раз `npm install` (puppeteer).

## Структура

```
index.html      лендинг (14+ игр, офлайн)
PROMPT.md       промпты для создания игр + спецификация режимов
examples/       player.html (рантайм) + игры + тестовые фикстуры _fixture-*
engine/         reference-библиотека ECS (LD.*)
generator/      визуальный генератор уровней + патентные пакеты
games/          пользовательская коллекция (game.json + meta.json)
tests/, tools/  QA: тесты режимов, валидатор, плейтесты, анализаторы
docs/           документация + юридический контур
articles/       альманах «Деловая этика в играх»
```

## Лицензии

Три редакции: базовая (коммерческие игры разрешены), NC (некоммерческая),
EDU (учебная) — см. `LICENSE.md`, `LICENSE-NC.md`, `LICENSE-EDU.md`.
Условие общее: атрибуция «Создано на движке LimeDrive». Регистрация и
фиксация авторства — `node tools/patent-package.js <игра.json> --author "Имя"`.
