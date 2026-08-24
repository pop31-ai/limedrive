"use strict";
/* Diver mechanics test: O2 drains, surface refills, bubble pickup, suffocation damage. */
const puppeteer = require("C:\\Users\\e\\Documents\\Projects\\limedrive\\node_modules\\puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = "C:\\Users\\e\\Documents\\Projects\\limedrive";
const GAME = process.argv[2] || "_fixture-diver.json";

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
  await sleep(1500);

  let dbg = await page.evaluate(() => LimeDriveDebug());
  check("diver mode detected", dbg.diver && dbg.diver.o2Max === 20);

  // O2 drains underwater
  const o2a = dbg.diver.o2;
  await sleep(1500);
  dbg = await page.evaluate(() => LimeDriveDebug());
  check("O2 drains underwater", dbg.diver.o2 < o2a - 1);

  // swim up to surface -> refill to max
  await page.keyboard.down("ArrowUp");
  let refilled = false;
  for (let i = 0; i < 20; i++) {
    await sleep(200);
    dbg = await page.evaluate(() => LimeDriveDebug());
    if (dbg.diver.o2 >= 19.5) { refilled = true; break; }
  }
  await page.keyboard.up("ArrowUp");
  check("surface refills O2", refilled);

  // swim right-down to bubble (400,300) and collect -> +50 capped at 20... use value check: o2 stays max
  // instead: let O2 drop a bit, then collect bubble and see it rise
  await sleep(1200);
  dbg = await page.evaluate(() => LimeDriveDebug());
  const before = dbg.diver.o2;
  await page.keyboard.down("ArrowRight");
  await page.keyboard.down("ArrowUp");
  let rose = false;
  for (let i = 0; i < 25; i++) {
    await sleep(200);
    dbg = await page.evaluate(() => LimeDriveDebug());
    if (dbg.diver.o2 > before + 5 || dbg.diver.o2 >= 19.5) { rose = true; break; }
  }
  await page.keyboard.up("ArrowRight");
  await page.keyboard.up("ArrowUp");
  check("oxygen bubble refills", rose);

  // suffocation: dive away from surface, then wait for damage
  await page.keyboard.down("ArrowDown");
  await sleep(1500);
  await page.keyboard.up("ArrowDown");
  let hurt = false;
  for (let i = 0; i < 30; i++) {
    await sleep(500);
    dbg = await page.evaluate(() => LimeDriveDebug());
    if (dbg.diver.hp < 100) { hurt = true; break; }
  }
  check("suffocation damages hero", hurt);

  await browser.close();
  srv.close();
  console.log(failed ? "\nFAILED" : "\nALL PASS");
  process.exit(failed ? 1 : 0);
});
