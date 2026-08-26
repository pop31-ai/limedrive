"use strict";
/* Standalone smoke QA: load each catalog game, 5s, collect pageerrors -> catalog qa field. */
const puppeteer = require("C:\\Users\\e\\Documents\\Projects\\limedrive\\node_modules\\puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = "C:\\Users\\e\\Documents\\Projects\\limedrive";
const CATALOG = path.join(ROOT, "standalone", "catalog.json");

const srv = http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split("?")[0]);
  if (u === "/favicon.ico") { res.writeHead(204); res.end(); return; }
  if (u.endsWith("/")) u += "index.html";
  const fp = path.join(ROOT, u.slice(1));
  if (fs.existsSync(fp) && fs.statSync(fp).isDirectory()) {
    const idx = path.join(fp, "index.html");
    if (fs.existsSync(idx)) { res.writeHead(200, { "Content-Type": "text/html" }); res.end(fs.readFileSync(idx)); return; }
  }
  fs.readFile(fp, (e, d) => {
    if (e) { res.writeHead(404); res.end("nf"); return; }
    const ext = path.extname(fp).toLowerCase();
    res.writeHead(200, { "Content-Type": { ".html": "text/html; charset=utf-8", ".json": "application/json", ".js": "text/javascript", ".css": "text/css" }[ext] || "application/octet-stream" });
    res.end(d);
  });
});

const sleep = ms => new Promise(r => setTimeout(r, ms));

srv.listen(0, "127.0.0.1", async () => {
  const port = srv.address().port;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  const cat = JSON.parse(fs.readFileSync(CATALOG, "utf8"));
  let ok = 0;
  for (const g of cat) {
    const errs = [];
    const onErr = e => errs.push(String(e.message).slice(0, 120));
    const onCon = m => { if (m.type() === "error") errs.push(m.text().slice(0, 120)); };
    page.on("pageerror", onErr);
    page.on("console", onCon);
    try {
      await page.goto(`http://127.0.0.1:${port}/${g.file}`, { waitUntil: "load", timeout: 15000 });
      await sleep(4000);
    } catch (e) {
      errs.push("load: " + String(e.message).slice(0, 100));
    }
    page.off("pageerror", onErr);
    page.off("console", onCon);
    g.qa = errs.length ? "ERR: " + errs.slice(0, 2).join(" | ") : "ok";
    if (errs.length) {
      console.log("[ERR] " + g.title + " — " + g.qa);
    } else {
      ok++;
      console.log("[ok ] " + g.title);
    }
  }
  fs.writeFileSync(CATALOG, JSON.stringify(cat, null, 2), "utf8");
  await browser.close();
  srv.close();
  console.log(`\nStandalone QA: ${ok}/${cat.length} ok`);
  process.exit(0);
});
