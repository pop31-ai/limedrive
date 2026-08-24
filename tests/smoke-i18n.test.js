"use strict";

const puppeteer = require("C:\\Users\\e\\Documents\\Projects\\limedrive\\node_modules\\puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = "C:\\Users\\e\\Documents\\Projects\\limedrive";

const srv = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split("?")[0]);
  if (u === "/favicon.ico") { res.writeHead(204); res.end(); return; }
  fs.readFile(path.join(ROOT, u.slice(1)), (e, d) => {
    if (e) { res.writeHead(404); res.end(); return; }
    const ct = u.endsWith(".json") ? "application/json"
      : u.endsWith(".js") ? "application/javascript"
      : "text/html";
    res.writeHead(200, { "Content-Type": ct });
    res.end(d);
  });
});

let failed = 0;
function check(name, cond) {
  console.log((cond ? "PASS" : "FAIL") + " " + name);
  if (!cond) failed++;
}

srv.listen(0, "127.0.0.1", async () => {
  const port = srv.address().port;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.evaluateOnNewDocument("if (localStorage.getItem('limedrive-lang') === null) localStorage.setItem('limedrive-lang','en')");
  let pageErrors = 0;
  page.on("pageerror", e => { console.log("[pageerror]", e.message); pageErrors++; });

  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "networkidle2" });
  await page.waitForFunction("!!window.LimeI18n", { timeout: 5000 }).catch(() => {});

  check("i18n loaded on root page", await page.evaluate("!!window.LimeI18n"));
  check("forced locale is en", await page.evaluate("window.LimeI18n.locale") === "en");
  check("tagline translated", (await page.evaluate("document.querySelector('[data-i18n=\"sub.tagline\"]').textContent")) === "Playable offline · games from JSON");

  await page.evaluate("localStorage.setItem('limedrive-lang','ru')");
  await page.reload({ waitUntil: "networkidle2" });
  await page.waitForFunction("!!window.LimeI18n", { timeout: 5000 }).catch(() => {});
  check("ru locale applied after reload", await page.evaluate("window.LimeI18n.locale") === "ru");
  check("ru tagline rendered", (await page.evaluate("document.querySelector('[data-i18n=\"sub.tagline\"]').textContent")).indexOf("офлайн") >= 0);
  check("lang switcher populated", await page.evaluate("document.getElementById('langSwitch').options.length") === 4);
  check("root page no js errors", pageErrors === 0);

  pageErrors = 0;
  await page.goto(`http://127.0.0.1:${port}/examples/index.html`, { waitUntil: "networkidle2" });
  await page.waitForFunction("!!window.LimeI18n", { timeout: 5000 }).catch(() => {});
  await page.waitForFunction("document.body.innerHTML.indexOf('Играть') >= 0", { timeout: 5000 }).catch(() => {});
  check("games grid rendered after repair", await page.evaluate("document.getElementById('gamesGrid').children.length") > 0);
  check("i18n active on examples page", await page.evaluate("!!window.LimeI18n && window.LimeI18n.locale") === "ru");
  check("play buttons localized (ru)", await page.evaluate("document.body.innerHTML.indexOf('Играть')") >= 0);
  check("examples page no js errors", pageErrors === 0);

  await browser.close();
  srv.close();
  process.exit(failed ? 1 : 0);
});
