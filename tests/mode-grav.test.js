"use strict";
/* Gravity fields test: low/high multipliers detected, flip launches to ceiling. */
const puppeteer = require("C:\\Users\\e\\Documents\\Projects\\limedrive\\node_modules\\puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = "C:\\Users\\e\\Documents\\Projects\\limedrive";
const GAME = process.argv[2] || "_fixture-grav.json";

const srv = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split("?")[0]);
  if (u === "/favicon.ico") { res.writeHead(204); res.end(); return; }
  fs.readFile(path.join(ROOT, u.slice(1)), (e, d) => {
    if (e) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "Content-Type": u.endsWith(".json") ? "application/json" : "text/html" });
    res.end(d);
  });
});
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
let failed = 0;
function check(name, cond) { console.log((cond ? "PASS" : "FAIL") + " " + name); if (!cond) failed++; }

async function walkTo(page, targetX) {
  const key = targetX > (await page.evaluate(() => LimeDriveDebug())).heroPos.x ? "ArrowRight" : "ArrowLeft";
  await page.keyboard.down(key);
  for (let i = 0; i < 40; i++) {
    await sleep(80);
    const d = await page.evaluate(() => LimeDriveDebug());
    if (key === "ArrowRight" ? d.heroPos.x >= targetX : d.heroPos.x <= targetX) break;
  }
  await page.keyboard.up(key);
  await sleep(250);
}

srv.listen(0, "127.0.0.1", async () => {
  const port = srv.address().port;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on("pageerror", e => { console.log("[pageerror]", e.message); failed++; });
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`http://127.0.0.1:${port}/examples/player.html?game=${encodeURIComponent(GAME)}`, { waitUntil: "networkidle2" });
  await sleep(1300);

  // low pad
  await walkTo(page, 210);
  let dbg = await page.evaluate(() => LimeDriveDebug());
  check("low field detected", dbg.grav === "low");

  // high pad
  await walkTo(page, 410);
  dbg = await page.evaluate(() => LimeDriveDebug());
  check("high field detected", dbg.grav === "high");

  // flip pad -> hero rises to ceiling underside
  await walkTo(page, 630);
  let onCeiling = false;
  for (let i = 0; i < 25; i++) {
    await sleep(200);
    dbg = await page.evaluate(() => LimeDriveDebug());
    if (dbg.heroPos.y < 120 && dbg.heroPos.y > -10) { onCeiling = true; break; }
  }
  check("flip launches hero to ceiling", onCeiling);
  check("flip field active at ceiling", dbg.grav === "flip");

  // jump off ceiling (inverted jump pushes down) — just verify alive & stable
  await page.keyboard.down("Space");
  await sleep(120);
  await page.keyboard.up("Space");
  await sleep(600);
  dbg = await page.evaluate(() => LimeDriveDebug());
  check("stable on ceiling after inverted jump", dbg.gameState === "playing");

  await browser.close();
  srv.close();
  console.log(failed ? "\nFAILED" : "\nALL PASS");
  process.exit(failed ? 1 : 0);
});
