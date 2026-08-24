"use strict";

const PAGE = 60;

function listing(gameJson, engineVersion) {
  const body = JSON.stringify(gameJson, null, 2).split("\n");
  const digits = String(body.length).length;
  const out = [
    "ДЕПОНИРУЕМЫЙ ЛИСТИНГ",
    `Игра: ${gameJson.name || "Untitled"}; движок LimeDrive v${engineVersion}`,
    ""
  ];
  body.forEach((line, i) => {
    if (i > 0 && i % PAGE === 0) {
      out.push("", `=== страница ${Math.floor(i / PAGE) + 1} ===`, "");
    }
    out.push(`${String(i + 1).padStart(digits, " ")}. ${line}`);
  });
  return out.join("\n");
}

module.exports = { listing, PAGE };
