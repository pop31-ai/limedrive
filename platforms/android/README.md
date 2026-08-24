# LimeDrive APK (WebView-обёртка, без Gradle)

Полностью офлайн-приложение: движок и все 17 игр лежат внутри APK
(`assets/www/`), разрешение INTERNET не запрашивается.

| Параметр | Значение |
|---|---|
| package | `com.limedrive.app` |
| minSdk | 26 (Android 8.0) |
| targetSdk | 34 (Android 14) |
| Подпись | self-signed `debug.keystore` (pass: android) |
| Выход | `dist/LimeDrive.apk` |

## Сборка

Требуется только Android SDK (`%LOCALAPPDATA%\Android\Sdk`) + JDK с `javac`/`jar`
в PATH. Android Studio целиком не нужна.

```bash
npm run apk
```

Скрипт сам находит свежие build-tools и платформу, копирует ассеты
(без node_modules/tests/reports/articles — у статей кириллица в именах,
aapt2 их не переваривает), компилирует MainActivity, пакует, выравнивает,
подписывает.

## Установка

```bash
adb install -r platforms/android/dist/LimeDrive.apk
```

или просто скопируйте файл на телефон и откройте (разрешите установку из
неизвестных источников).

## Известные ограничения пробной версии

- Service worker внутри WebView на `file://` не регистрируется — офлайн и так
  обеспечен локальными ассетами.
- Обновление контента = пересборка APK; «живой» клон через Termux/Syncthing —
  следующий шаг (см. `docs/architecture/serverless-git.md`).

## Живой контент без пересборки

При старте приложение проверяет каталог:

```
/storage/emulated/0/Android/data/com.limedrive.app/files/www/
```

Если там есть свой `index.html` — грузится он, а не встроенный. Так клон
LimeDrive можно обновлять без пересборки APK:

**Termux (ручной sync):**
```bash
pkg install git
git clone <URL репозитория> limedrive
mkdir -p /storage/emulated/0/Android/data/com.limedrive.app/files
cp -r limedrive /storage/emulated/0/Android/data/com.limedrive.app/files/www
```

**Syncthing (автосинк):** расшарьте папку клона на ПК и подключите как
папку `/storage/emulated/0/Android/data/com.limedrive.app/files/www`
(на Android 11+ доступ к этой папке сторонним файловым менеджерам ограничен —
надёжнее копировать из Termux, у которого есть доступ к своей data-папке).

Включены флаги `AllowFileAccessFromFileURLs` / `AllowUniversalAccessFromFileURLs`,
поэтому fetch() игровых JSON из override-каталога работает так же, как из ассетов.

