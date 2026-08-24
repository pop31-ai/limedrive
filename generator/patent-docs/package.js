"use strict";

const { canonicalize, sha256Hex } = require("./hash");
const { referat } = require("./referat");
const { description } = require("./description");
const { listing } = require("./listing");
const { fees } = require("./fees");
const { checklist } = require("./checklist");

function buildPackage(gameJson, meta = {}) {
  const engineVersion = meta.engineVersion || "1.0.0";
  const author = meta.author || "";
  return {
    title: gameJson.name || "Untitled",
    author,
    engineVersion,
    referat: referat(gameJson),
    description: description(gameJson, engineVersion),
    listing: listing(gameJson, engineVersion),
    checklist: checklist(),
    fees: fees(),
    deposit: {
      sha256: sha256Hex(canonicalize(gameJson)),
      fixedAt: new Date().toISOString(),
      algorithm: "sha256(canonical-json)"
    }
  };
}

module.exports = { buildPackage };
