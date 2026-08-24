# LimeDrive Desktop (Electron, пробная обёртка)

Движок — чистый JavaScript + HTML5 Canvas без зависимостей, поэтому десктоп
— это просто окно с `index.html`.

## Запуск в разработке

```
cd platforms/electron
npm install
npm start
```

## Сборка дистрибутивов (позже)

Добавить `electron-builder` и цель под ОС: NSIS (Windows), dmg (macOS),
AppImage/deb (Linux). Конфиг не включён намеренно — сначала проверка запуска.

## Другие платформы (план)

| Платформа | Способ | Статус |
|---|---|---|
| Браузеры + Android PWA | Уже работает (`manifest.json` + `sw.js`) | Готово |
| iOS PWA | apple-meta добавлены в `index.html`; тестировать на устройстве | Пробно |
| Windows / macOS / Linux | Electron здесь | Пробно |
| Tauri | Легче Electron (~10 МБ), тот же `index.html` | План |
| Магазины (Capacitor) | Обёртка WebView для App Store/Google Play | План |
