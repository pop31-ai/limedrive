# INTEGRITY — снимок ядра (2026-08-24 19:12)

Контроль дрейфа: перегенерируйте `node tools/integrity.js` и сравните diff.
Изменилась строка без соответствующего коммита — ядро тронули.

## Ядро

| Файл | Строки | Символы | sha256:12 |
|------|-------:|--------:|-----------|
| examples/player.html | 4516 | 152337 | `5caf714f2c66` |
| sw.js | 44 | 1273 | `03a5130309c3` |
| manifest.json | 16 | 440 | `b718f4b9d7c5` |
| index.html | 69 | 4175 | `575698e3d331` |
| engine/limedrive-3d.js | 461 | 14741 | `23b25473feea` |
| engine/limedrive-ai.js | 417 | 14451 | `034dd865a160` |
| engine/limedrive-components.js | 605 | 20157 | `b9dc5c7233da` |
| engine/limedrive-core.js | 683 | 21554 | `c7747fa95be3` |
| engine/limedrive-systems.js | 629 | 21908 | `5f5c6d5d017d` |
| engine/limedrive-ui.js | 696 | 21913 | `d3752d0a249b` |
| tools/validate.js | 272 | 10169 | `78e1b732396b` |
| tools/check-game.js | 204 | 8010 | `0a4d52c96e9e` |
| tests/run-all.js | 54 | 1651 | `e2e6be49f4c4` |
| README.md | 80 | 2911 | `45eab9ebdea1` |
| PROMPT.md | 523 | 18159 | `2192c991d212` |
| docs/README.md | 175 | 7651 | `58909a4ba8be` |
| docs/GAME-FORMAT.md | 156 | 6144 | `3997c314aa34` |

## Инвентарь

| Категория | Кол-во |
|-----------|-------:|
| Игры (examples/*.json) | 18 |
| Тестовые фикстуры (_fixture-*) | 10 |
| Тестовые файлы (tests/) | 23 |
| Скрипты QA/tools (tools/*.js) | 12 |

Правила: файлы с префиксом `_` не считаются играми; `reports/`, `node_modules/`
вне контроля. sha256 — первые 12 hex от байтового содержимого файла.
