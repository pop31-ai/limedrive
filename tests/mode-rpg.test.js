"use strict";
/* RPG mechanics test: key pickup, melee attack kills, door opens with key, finish. */
const puppeteer = require("C:\\Users\\e\\Documents\\Projects\\limedrive\\node_modules\\puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = "C:\\Users\\e\\Documents\\Projects\\limedrive";
const GAME = process.argv[2] || "_fixture-rpg.json";

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

srv.listen(0, "127.0.0.1", async () => {
  const port = srv.address().port;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on("pageerror", e => { console.log("[pageerror]", e.message); failed++; });
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`http://127.0.0.1:${port}/examples/player.html?game=${encodeURIComponent(GAME)}`, { waitUntil: "networkidle2" });
  await sleep(1200);

  let dbg = await page.evaluate(() => LimeDriveDebug());
  check("mode is rpg", dbg.mode === "rpg");

  // walk right to pick up the key (hero 80 -> key 190)
  await page.keyboard.down("ArrowRight");
  let gotKey = false;
  for (let i = 0; i < 20; i++) {
    await sleep(150);
    dbg = await page.evaluate(() => LimeDriveDebug());
    if (dbg.rpg.keys.includes("test")) { gotKey = true; break; }
    if (dbg.heroPos.x > 260) break;
  }
  await page.keyboard.up("ArrowRight");
  check("key picked up", gotKey);

  // approach skeleton (~330) and attack until dead
  const scoreBefore = dbg.score;
  await page.keyboard.down("ArrowRight");
  await sleep(400);
  await page.keyboard.up("ArrowRight");
  for (let i = 0; i < 10; i++) {
    await page.keyboard.down("Enter");
    await sleep(90);
    await page.keyboard.up("Enter");
    await sleep(180);
    dbg = await page.evaluate(() => LimeDriveDebug());
    if (dbg.rpg.enemiesAlive === 0) break;
  }
  check("skeleton killed by melee", dbg.rpg.enemiesAlive === 0 && dbg.score > scoreBefore);

  // continue right through opened door to finish
  await page.keyboard.down("ArrowRight");
  let victorySeen = false;
  for (let i = 0; i < 30; i++) {
    await sleep(200);
    dbg = await page.evaluate(() => LimeDriveDebug());
    if (dbg.gameState === "victory") { victorySeen = true; break; }
  }
  await page.keyboard.up("ArrowRight");
  check("door opened with key -> victory", victorySeen);

  await browser.close();
  srv.close();
  console.log(failed ? "\nFAILED" : "\nALL PASS");
  process.exit(failed ? 1 : 0);
});
