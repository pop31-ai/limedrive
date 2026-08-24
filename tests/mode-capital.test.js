"use strict";
/* Capital goal test: finish locked until score reaches capitalGoal. */
const puppeteer = require("C:\\Users\\e\\Documents\\Projects\\limedrive\\node_modules\\puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = "C:\\Users\\e\\Documents\\Projects\\limedrive";
const GAME = process.argv[2] || "_fixture-capital.json";

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

  // stand on finish without capital -> level must NOT complete
  await page.keyboard.down("ArrowRight");
  let lockedSeen = false;
  for (let i = 0; i < 30; i++) {
    await sleep(200);
    const d = await page.evaluate(() => LimeDriveDebug());
    if (d.heroPos.x >= 130) { lockedSeen = d.gameState === "playing" && d.score < 100; break; }
  }
  check("finish locked below capital goal", lockedSeen);

  // keep right: collect 3 coins (120) past the finish, then return -> victory
  let rich = false;
  for (let i = 0; i < 30; i++) {
    await sleep(200);
    const d = await page.evaluate(() => LimeDriveDebug());
    if (d.score >= 120) { rich = true; break; }
  }
  await page.keyboard.up("ArrowRight");
  check("coins collected past gate", rich);

  await page.keyboard.down("ArrowLeft");
  let done = false;
  for (let i = 0; i < 40; i++) {
    await sleep(200);
    const d = await page.evaluate(() => LimeDriveDebug());
    if (d.gameState === "victory") { done = true; break; }
  }
  await page.keyboard.up("ArrowLeft");
  check("victory after reaching capital", done);

  await browser.close();
  srv.close();
  console.log(failed ? "\nFAILED" : "\nALL PASS");
  process.exit(failed ? 1 : 0);
});
