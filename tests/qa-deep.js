"use strict";
/* Deep QA: long chaotic-input sessions per game, collect JS errors. */
const puppeteer = require("C:\\Users\\e\\Documents\\Projects\\limedrive\\node_modules\\puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = "C:\\Users\\e\\Documents\\Projects\\limedrive";
const DIR = path.join(ROOT, "examples");
const SECONDS = Number(process.argv[2]) || 20;

const srv = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split("?")[0]);
  if (u === "/favicon.ico") { res.writeHead(204); res.end(); return; }
  fs.readFile(path.join(ROOT, u.slice(1)), (e, d) => {
    if (e) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "Content-Type": u.endsWith(".json") ? "application/json" : "text/html" });
    res.end(d);
  });
});
const sleep = ms => new Promise(r => setTimeout(r, ms));

srv.listen(0, "127.0.0.1", async () => {
  const port = srv.address().port;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  const games = fs.readdirSync(DIR).filter(f => f.endsWith(".json") && !f.startsWith("_")).sort();
  const report = [];

  for (const f of games) {
    const errs = [];
    const onErr = e => errs.push("pageerror: " + e.message);
    const onCon = m => { if (m.type() === "error") errs.push("console: " + m.text()); };
    page.on("pageerror", onErr);
    page.on("console", onCon);
    try {
      await page.goto(`http://127.0.0.1:${port}/examples/player.html?game=${encodeURIComponent(f)}&_r=${Math.random()}`, { waitUntil: "networkidle2" });
      await sleep(1200);
      const t0 = Date.now();
      const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space", "Enter", "ShiftLeft", "KeyR"];
      let i = 0;
      while (Date.now() - t0 < SECONDS * 1000) {
        const k = keys[i % keys.length];
        await page.keyboard.down(k);
        await sleep(120);
        await page.keyboard.up(k);
        if (i % 3 === 0) await page.mouse.click(300 + (i * 137) % 600, 200 + (i * 211) % 400);
        await sleep(180);
        i++;
      }
      const d = await page.evaluate(() => LimeDriveDebug());
      report.push({ f, ok: errs.length === 0, errs, state: d.gameState, mode: d.mode });
    } catch (e) {
      report.push({ f, ok: false, errs: ["harness: " + e.message] });
    }
    page.off("pageerror", onErr);
    page.off("console", onCon);
    console.log(`[${report[report.length - 1].ok ? "OK " : "ERR"}] ${f} ${report[report.length - 1].errs.length ? "— " + report[report.length - 1].errs.slice(0, 2).join(" | ") : ""}`);
  }

  await browser.close();
  srv.close();
  const bad = report.filter(r => !r.ok);
  console.log(`\nDeep QA: ${games.length} games, ${bad.length} with errors`);
  fs.writeFileSync(path.join(ROOT, "reports", "deep-qa.json"), JSON.stringify(report, null, 2), "utf8");
  process.exit(bad.length ? 1 : 0);
});
