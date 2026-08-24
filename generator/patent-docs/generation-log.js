"use strict";

const { sha256Hex } = require("./hash");

class GenerationLog {
  constructor() {
    this._entries = [];
  }

  addPrompt(text, iteration) {
    this._push("prompt", text, iteration);
  }

  addEdit(text) {
    this._push("edit", text);
  }

  _push(type, text, iteration) {
    const entry = { ts: new Date().toISOString(), type, text: String(text) };
    if (iteration !== undefined) entry.iteration = iteration;
    this._entries.push(entry);
  }

  dump() {
    return {
      createdAt: new Date().toISOString(),
      entries: this._entries.slice(),
      seal: sha256Hex(JSON.stringify(this._entries))
    };
  }

  static verify(dump) {
    return !!dump && Array.isArray(dump.entries) && sha256Hex(JSON.stringify(dump.entries)) === dump.seal;
  }
}

module.exports = { GenerationLog };
