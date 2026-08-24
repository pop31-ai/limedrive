"use strict";

const TEMPLATE_SETTINGS = ["gravity", "friction", "airResistance", "jumpForce", "maxSpeed"];

function stripTemplate(game) {
  const g = JSON.parse(JSON.stringify(game));
  if (g.settings) {
    for (const key of TEMPLATE_SETTINGS) delete g.settings[key];
  }
  if (Array.isArray(g.levels)) {
    for (const lv of g.levels) {
      if (Array.isArray(lv.entities)) {
        for (const en of lv.entities) delete en.id;
      }
    }
  }
  return g;
}

function signatures(game) {
  const sigs = new Set();
  for (const lv of game.levels || []) {
    for (const en of lv.entities || []) {
      sigs.add([lv.name || "", en.type, en.x | 0, en.y | 0, en.width | 0, en.height | 0].join("|"));
    }
  }
  return sigs;
}

function jaccard(a, b) {
  const union = new Set([...a, ...b]).size;
  if (union === 0) return 1;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / union;
}

function compare(gameA, gameB) {
  const sa = signatures(stripTemplate(gameA));
  const sb = signatures(stripTemplate(gameB));
  const score = jaccard(sa, sb);
  const shared = [];
  for (const x of sa) if (sb.has(x)) shared.push(x);
  return {
    score: Math.round(score * 1000) / 1000,
    sharedCount: shared.length,
    onlyACount: sa.size - shared.length,
    onlyBCount: sb.size - shared.length,
    verdict: score >= 0.95 ? "identical" : score >= 0.6 ? "similar" : score > 0 ? "distinct" : "independent"
  };
}

module.exports = { TEMPLATE_SETTINGS, stripTemplate, signatures, jaccard, compare };
