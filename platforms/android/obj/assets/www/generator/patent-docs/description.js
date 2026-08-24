"use strict";

function fmt(v) {
  if (v === undefined || v === null) return "не задано";
  return Array.isArray(v) ? v.join(", ") : String(v);
}

function description(gameJson, engineVersion) {
  const levels = gameJson.levels || [];
  let entities = 0;
  const types = new Set();
  const components = new Set();
  for (const lv of levels) {
    for (const en of lv.entities || []) {
      entities++;
      types.add(en.type);
      for (const c of en.components || []) components.add(c);
    }
  }
  const s = gameJson.settings || {};
  const ai = gameJson.ai || {};
  const lines = [
    "ОПИСАНИЕ ПРОГРАММЫ ДЛЯ ЭВМ",
    "",
    `1. Общие сведения. Название: «LimeDrive: ${gameJson.name || "Untitled"}», версия ${gameJson.version || "1.0.0"}.`,
    `Исполнение: игровой движок LimeDrive v${engineVersion}, язык JavaScript.`,
    "",
    `2. Назначение. Исполнение интерактивной игры жанра ${gameJson.type || "arcade"}: ${gameJson.description || "развлекательная игра"}.`,
    "",
    `3. Структура данных. Игра описана декларативно в формате JSON.`,
    `Уровней: ${levels.length}; игровых объектов: ${entities}.`,
    types.size ? `Типы объектов: ${Array.from(types).sort().join(", ")}.` : null,
    components.size ? `Компоненты ECS: ${Array.from(components).sort().join(", ")}.` : null,
    "",
    `4. Физическая модель. Гравитация: ${fmt(s.gravity)}; трение: ${fmt(s.friction)}; сопротивление среды: ${fmt(s.airResistance)};`,
    `сила прыжка: ${fmt(s.jumpForce)}; максимальная скорость: ${fmt(s.maxSpeed)}; мир: ${fmt(s.worldWidth)}x${fmt(s.worldHeight)}.`,
    "",
    `5. Игровой интеллект. Глобальная сложность: ${ai.globalDifficulty || "не задана"}; адаптация к игроку: ${ai.adaptToPlayer ? "включена" : "выключена"}.`,
    "",
    "6. Среда исполнения. Браузер с поддержкой HTML5 Canvas, внешние зависимости отсутствуют."
  ];
  return lines.filter(l => l !== null).join("\n");
}

module.exports = { description };
