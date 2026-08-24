"use strict";
/* Stealth test: sneak avoids cone, walking in front triggers alert, hack opens door. */
const puppeteer = require("C:\\Users\\e\\Documents\\Projects\\limedrive\\node_modules\\puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = "C:\\Users\\e\\Documents\\Projects\\limedrive";
const GAME = process.argv[2] || "_fixture-stealth.json";

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
  await sleep(1400);

  let dbg = await page.evaluate(() => LimeDriveDebug());
  check("stealth mode on, 1 cone", dbg.stealth && dbg.stealth.cones === 1);

  // sneak right, stop BEHIND guard (x~330, guard faces right) — no alert
  await page.keyboard.down("ShiftLeft");
  await page.keyboard.down("ArrowRight");
  for (let i = 0; i < 40; i++) {
    await sleep(150);
    dbg = await page.evaluate(() => LimeDriveDebug());
    if (dbg.heroPos.x >= 320) break;
  }
  await page.keyboard.up("ArrowRight");
  await sleep(400);
  check("sneaking behind guard: no alert", dbg.stealth.alerted === 0);

  // step in front (right of guard) without sneak -> detected
  await page.keyboard.up("ShiftLeft");
  await page.keyboard.down("ArrowRight");
  let spotted = false;
  for (let i = 0; i < 40; i++) {
    await sleep(150);
    dbg = await page.evaluate(() => LimeDriveDebug());
    if (dbg.heroPos.x >= 520) break;
    if (dbg.stealth.alerted >= 1) { spotted = true; }
  }
  await page.keyboard.up("ArrowRight");
  check("alert triggered in cone", dbg.stealth.alerted >= 1 || spotted);

  // hack terminal at 620: stand on it 1.2s
  await page.keyboard.down("ArrowRight");
  for (let i = 0; i < 30; i++) {
    await sleep(150);
    dbg = await page.evaluate(() => LimeDriveDebug());
    if (dbg.heroPos.x >= 590) break;
  }
  await page.keyboard.up("ArrowRight");
  let hacked = false;
  for (let i = 0; i < 20; i++) {
    await sleep(200);
    dbg = await page.evaluate(() => LimeDriveDebug());
    if (dbg.stealth.hacksDone >= 1) { hacked = true; break; }
  }
  check("terminal hacked, door removed", hacked);

  // through open doorway to finish (stop at doorway, don't overshoot)
  let victorySeen = false;
  for (let i = 0; i < 40 && !victorySeen; i++) {
    await page.keyboard.down("ArrowRight");
    await sleep(90);
    await page.keyboard.up("ArrowRight");
    dbg = await page.evaluate(() => LimeDriveDebug());
    if (dbg.gameState === "victory") victorySeen = true;
    if (dbg.heroPos.x >= 780) {
      // nudge carefully
      await page.keyboard.down("ArrowRight");
      await sleep(40);
      await page.keyboard.up("ArrowRight");
      dbg = await page.evaluate(() => LimeDriveDebug());
      if (dbg.gameState === "victory") victorySeen = true;
    }
  }
  check("victory through opened door", victorySeen);
  if (!victorySeen) {
    console.log("DEBUG final:", JSON.stringify(dbg.heroPos), dbg.gameState,
      "hacks=", dbg.stealth.hacksDone, "entities=", dbg.entityCount);
  }

  await browser.close();
  srv.close();
  console.log(failed ? "\nFAILED" : "\nALL PASS");
  process.exit(failed ? 1 : 0);
});
