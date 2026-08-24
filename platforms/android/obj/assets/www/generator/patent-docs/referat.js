"use strict";

const LIMIT = 700;

function referat(gameJson) {
  const levels = gameJson.levels || [];
  let entities = 0;
  const types = new Set();
  for (const lv of levels) {
    for (const en of lv.entities || []) {
      entities++;
      types.add(en.type);
    }
  }
  const ai = gameJson.ai || {};
  const s = gameJson.settings || {};
  const name = gameJson.name || "Untitled";
  const desc = gameJson.description ? String(gameJson.description).trim().replace(/\s+/g, " ") : "";
  let text =
    `Программа для ЭВМ «LimeDrive: ${name}» исполняет игру жанра ${gameJson.type || "arcade"}. ` +
    `Назначение: развлекательный и образовательный геймдев на движке LimeDrive. ` +
    `Уровней: ${levels.length}; игровых объектов: ${entities}${types.size ? ` (${Array.from(types).slice(0, 8).join(", ")}${types.size > 8 ? " и др." : ""})` : ""}; ` +
    `тема: ${s.theme || "mixed"}. ` +
    (ai.globalDifficulty ? `Сложность ИИ: ${ai.globalDifficulty}${ai.adaptToPlayer ? ", адаптивная" : ""}. ` : "") +
    (desc ? `${desc}. ` : "") +
    `Реализовано на JavaScript, HTML5 Canvas; игра описывается декларативным JSON. ` +
    `Требуется браузер с поддержкой HTML5 Canvas.`;
  text = text.replace(/\s+/g, " ").trim();
  if (text.length > LIMIT) {
    text = text.slice(0, LIMIT - 1).replace(/[\s,.;:]+\S*$/, "") + ".";
  }
  return text;
}

module.exports = { referat, LIMIT };
