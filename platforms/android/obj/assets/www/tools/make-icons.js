#!/usr/bin/env node
"use strict";
/* Generates icons/icon-{192,512}.png without dependencies (pure zlib PNG). */
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function makePng(size) {
  const W = size, R = size * 0.18;
  const raw = Buffer.alloc(W * (W * 4 + 1));
  for (let y = 0; y < W; y++) {
    const row = y * (W * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < W; x++) {
      const o = row + 1 + x * 4;
      const dx = Math.min(x, W - 1 - x), dy = Math.min(y, W - 1 - y);
      const corner = dx < R && dy < R && (R - dx) * (R - dx) + (R - dy) * (R - dy) > R * R;
      let r = 0, g = 255, b = 136, a = 255;
      if (corner) a = 0;
      else {
        // slime face: two eyes
        const ex1 = W * 0.32, ex2 = W * 0.68, ey = W * 0.38, er = W * 0.07;
        const d1 = Math.hypot(x - ex1, y - ey), d2 = Math.hypot(x - ex2, y - ey);
        if (d1 < er || d2 < er) { r = 20; g = 30; b = 20; }
        else if (y > W * 0.8) { g = 200; }
      }
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(W, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}
const dir = path.join(__dirname, "..", "icons");
fs.mkdirSync(dir, { recursive: true });
for (const s of [192, 512]) {
  fs.writeFileSync(path.join(dir, `icon-${s}.png`), makePng(s));
  console.log(`icon-${s}.png written`);
}
