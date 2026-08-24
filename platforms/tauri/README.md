# LimeDrive Desktop (Tauri, каркас)

Обёртка на Tauri v2: вместо Electron (~200 МБ) получается бинарник ~10–15 МБ.
`frontendDist` указывает на корень LimeDrive — вся статика (движок, игры,
локали) подхватывается как есть.

## Статус: КАРКАС (не собран — в системе нет Rust)

Файлы готовы: `Cargo.toml`, `tauri.conf.json`, `src/main.rs`, `build.rs`.
Для первой сборки нужен Rust + Tauri CLI.

## Сборка

1. Установить Rust: https://rustup.ai (Windows: ещё `winget install Microsoft.VisualStudio.2022.BuildTools` с компонентом C++).
2. Установить Tauri CLI: `cargo install tauri-cli --version "^2"` (или npm: `npm i -g @tauri-apps/cli`).
3. Иконки бандла (генерирует .ico/.icns из PNG):
   ```
   cd platforms/tauri
   npx @tauri-apps/cli icon ../../icons/icon-512.png
   ```
4. Запуск в dev:
   ```
   npx @tauri-apps/cli dev
   ```
5. Дистрибутивы (NSIS/msi для Windows, dmg/app для macOS, AppImage/deb для Linux):
   ```
   npx @tauri-apps/cli build
   ```

## Замечания

- Service worker внутри Tauri не работает (протокол tauri://) — офлайн и так
  обеспечен тем, что все файлы локальны.
- Если захотите подпись/автообновление — добавить в `bundle` поля
  `windows.certificateThumbprint` / `createUpdaterArtifacts`.
- Альтернатива при проблемах с Rust: обёртка `platforms/electron` (уже рабочая).
