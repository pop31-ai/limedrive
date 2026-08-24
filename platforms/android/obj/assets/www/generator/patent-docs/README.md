# patent-docs

Автогенерация пакета документов для регистрации игры LimeDrive как программы
для ЭВМ (см. `docs/legal/03-patent-service-concept.md`). Без внешних зависимостей;
работает в Node и в браузере.

## CLI

```
node tools/patent-package.js examples/01-lime-platformer.json --author "Имя" --out reports
```

Создаёт `reports/<game>.patent.txt`: реферат, описание, чек-лист подачи,
пошлины, депонируемый листинг + sha256-фиксацию приоритета.

## Модули

| Файл | Экспорт | Назначение |
|---|---|---|
| `hash.js` | `canonicalize`, `sha256Hex` | Канонический JSON (сортировка ключей) и SHA-256 |
| `referat.js` | `referat` | Реферат до 700 знаков из game.json |
| `description.js` | `description` | Описание по структуре ФИПС (6 разделов) |
| `listing.js` | `listing` | Депонируемый листинг с нумерацией строк/страниц |
| `fees.js` | `fees` | Справочная таблица пошлин |
| `checklist.js` | `checklist` | Чек-лист подачи заявки |
| `package.js` | `buildPackage` | Всё сразу + фиксация приоритета |
| `registry.js` | `Registry` | Append-only реестр хеш-фиксаций; `resolvePriority()` решает споры по ранней дате (`docs/legal/04`) |
| `generation-log.js` | `GenerationLog` | Журнал промптов/правок с запечатанным дампом — доказательство творческого вклада (`docs/legal/01`) |
| `similarity.js` | `compare` | Сходство игр с исключением шаблонной зоны (`docs/legal/04`) |

## Тесты

```
node tests/patent-docs.test.js
```

10 проверок: тест-векторы SHA-256, независимость хеша от порядка ключей,
приоритет реестра, детект подделки печатей, сходство с учётом шаблонной зоны,
сквозная сборка пакета.
