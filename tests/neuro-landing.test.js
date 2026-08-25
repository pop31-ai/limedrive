"use strict";
const puppeteer = require("C:\\Users\\e\\Documents\\Projects\\limedrive\\node_modules\\puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = "C:\\Users\\e\\Documents\\Projects\\limedrive";
const sl = ms => new Promise(r => setTimeout(r, ms));
let failed = 0;
function check(name, cond) { console.log((cond ? "PASS" : "FAIL") + " " + name); if (!cond) failed++; }

const srv = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split("?")[0]);
  if (u === "/favicon.ico") { res.writeHead(204); res.end(); return; }
  fs.readFile(path.join(ROOT, u === "/" ? "index.html" : u.slice(1)), (e, d) => {
    if (e) { res.writeHead(404); res.end(); return; }
    const ext = path.extname(u).toLowerCase();
    const mime = { ".html": "text/html; charset=utf-8", ".json": "application/json", ".js": "text/javascript" }[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": mime });
    res.end(d);
  });
});

srv.listen(0, "127.0.0.1", async () => {
  const port = srv.address().port;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on("pageerror", e => { console.log("[pageerror]", e.message); failed++; });
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "networkidle2" });
  await sl(800);
  check("landing has standalone section", (await page.evaluate(() => document.body.innerHTML.includes("Автономные игры"))));
  check("neuro card present", await page.evaluate(() => !!document.getElementById("neuroCard")));

  await page.evaluate(() => document.getElementById("neuroCard").click());
  await sl(1500);
  const url = page.url();
  check("navigated to player", url.includes("player.html"));
  let d = null;
  for (let i = 0; i < 15; i++) {
    d = await page.evaluate(() => window.LimeDriveDebug ? LimeDriveDebug() : null);
    if (d && d.gameState === "playing" && d.entityCount > 10) break;
    await sl(500);
  }
  check("draft game running", !!d && d.entityCount > 10 && d.gameState === "playing");
  check("valid mode", !!d && ["platformer", "runner", "shooter", "racing", "puzzle", "rpg", "chess", "td"].includes(d.mode));
  if (d) console.log("   draft: mode=" + d.mode + " entities=" + d.entityCount + " state=" + d.gameState);

  // standalone link sanity: fetch catalog with absolute path
  const st = await page.evaluate(async () => {
    const r = await fetch("/standalone/catalog.json");
    const c = await r.json();
    return c.length;
  });
  check("standalone catalog served", st >= 19);

  await browser.close();
  srv.close();
  console.log(failed ? "\nFAILED" : "\nALL PASS");
  process.exit(failed ? 1 : 0);
});
