"use strict";

const { sha256Hex } = require("./hash");

const DEFAULT_KEY = "limedrive-patent-registry";

function memoryStorage() {
  let data = [];
  return {
    load: () => data.slice(),
    save: records => { data = records; }
  };
}

function localStorageStorage(key) {
  return {
    load: () => {
      const raw = globalThis.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    },
    save: records => { globalThis.localStorage.setItem(key, JSON.stringify(records)); }
  };
}

class Registry {
  constructor(opts = {}) {
    this._storage = opts.storage || (
      typeof globalThis.localStorage !== "undefined"
        ? localStorageStorage(opts.key || DEFAULT_KEY)
        : memoryStorage()
    );
    this._records = this._storage.load();
  }

  _persist() {
    this._storage.save(this._records);
  }

  fix(entry) {
    const record = {
      seq: this._records.length,
      sha256: entry.sha256,
      title: entry.title || "",
      author: entry.author || "",
      engineVersion: entry.engineVersion || "",
      fixedAt: entry.fixedAt || new Date().toISOString()
    };
    this._records.push(record);
    this._persist();
    return record;
  }

  findByHash(hash) {
    return this._records.filter(r => r.sha256 === hash);
  }

  all() {
    return this._records.slice();
  }

  resolvePriority(hash) {
    const found = this.findByHash(hash);
    if (!found.length) return null;
    return found
      .slice()
      .sort((a, b) => String(a.fixedAt).localeCompare(String(b.fixedAt)) || a.seq - b.seq)[0];
  }

  seal() {
    return sha256Hex(JSON.stringify(this._records));
  }

  exportState() {
    return {
      exportedAt: new Date().toISOString(),
      records: this._records.slice(),
      seal: this.seal()
    };
  }

  static verify(state) {
    if (!state || !Array.isArray(state.records)) return false;
    return sha256Hex(JSON.stringify(state.records)) === state.seal;
  }

  importState(state) {
    if (!Registry.verify(state)) throw new Error("seal mismatch");
    this._records = state.records.slice();
    this._persist();
  }
}

module.exports = { Registry, DEFAULT_KEY };
