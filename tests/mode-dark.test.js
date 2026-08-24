"use strict";
/* Dark/lantern mechanics test: darkness on, ghost hidden far, revealed near. */
const puppeteer = require("C:\\Users\\e\\Documents\\Projects\\limedrive\\node_modules\\puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = "C:\\Users\\e\\Documents\\Projects\\limedrive";
const GAME = process.argv[2] || "_fixture-dark.json";

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
  check("dark mode detected, lantern r~150", dbg.dark && dbg.dark.r > 130 && dbg.dark.r < 175);
  check("ghost hidden in darkness (far)", dbg.dark.ghostsVisible === 0);

  // walk right toward ghost until lit
  await page.keyboard.down("ArrowRight");
  let revealed = false;
  for (let i = 0; i < 40; i++) {
    await sleep(150);
    dbg = await page.evaluate(() => LimeDriveDebug());
    if (dbg.dark.ghostsVisible >= 1) { revealed = true; break; }
  }
  await page.keyboard.up("ArrowRight");
  check("ghost revealed by lantern", revealed);

  await browser.close();
  srv.close();
  console.log(failed ? "\nFAILED" : "\nALL PASS");
  process.exit(failed ? 1 : 0);
});
