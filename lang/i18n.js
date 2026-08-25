"use strict";

(function (root) {
  var SUPPORTED = ["en", "ru", "es", "de"];
  var STORAGE_KEY = "limedrive-lang";

  function normalize(tag) {
    return String(tag || "").toLowerCase();
  }

  function pickLocale(available, requested) {
    var req = (requested || []).map(normalize);
    for (var i = 0; i < req.length; i++) {
      if (req[i] && available.indexOf(req[i]) >= 0) return req[i];
    }
    for (var j = 0; j < req.length; j++) {
      var base = req[j].split("-")[0];
      if (base && available.indexOf(base) >= 0) return base;
    }
    return available[0];
  }

  function detectLocale(available) {
    if (typeof localStorage !== "undefined") {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && available.indexOf(saved) >= 0) return saved;
    }
    if (typeof navigator !== "undefined") {
      var candidates = [navigator.language];
      if (navigator.languages) candidates = candidates.concat(Array.prototype.slice.call(navigator.languages));
      return pickLocale(available, candidates);
    }
    return available[0];
  }

  function init(opts) {
    opts = opts || {};
    var available = opts.available || SUPPORTED;
    var locale = opts.locale || detectLocale(available);
    var url = (opts.base || "lang/") + locale + ".json";

    return fetch(url)
      .then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; })
      .then(function (dict) {
        var api = {
          locale: locale,
          supported: available,
          t: function (key) { return dict[key] !== undefined ? dict[key] : key; },
          apply: function () {
            if (typeof document === "undefined") return;
            var nodes = document.querySelectorAll("[data-i18n]");
            for (var i = 0; i < nodes.length; i++) nodes[i].textContent = api.t(nodes[i].getAttribute("data-i18n"));
            var htmlNodes = document.querySelectorAll("[data-i18n-html]");
            for (var k = 0; k < htmlNodes.length; k++) htmlNodes[k].innerHTML = api.t(htmlNodes[k].getAttribute("data-i18n-html"));
            document.documentElement.setAttribute("lang", locale);
          },
          set: function (lang) {
            if (available.indexOf(lang) < 0) return;
            if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, lang);
            if (typeof location !== "undefined") location.reload();
          },
          buildSwitcher: function (selectEl) {
            if (typeof document === "undefined" || !selectEl) return;
            var labels = { en: "English", ru: "Русский", es: "Español", de: "Deutsch" };
            selectEl.innerHTML = "";
            available.forEach(function (l) {
              var o = document.createElement("option");
              o.value = l;
              o.textContent = labels[l] || l;
              if (l === locale) o.selected = true;
              selectEl.appendChild(o);
            });
            selectEl.addEventListener("change", function () { api.set(selectEl.value); });
          }
        };
        api.apply();
        root.LimeI18n = api;
        return api;
      });
  }

  var core = { SUPPORTED: SUPPORTED, pickLocale: pickLocale, detectLocale: detectLocale, init: init };

  if (typeof module !== "undefined" && module.exports) module.exports = core;
  root.LimeI18nCore = core;

  if (typeof document !== "undefined" && !root.LimeI18nNoAutoBoot) {
    var autoBoot = function () {
      if (root.LimeI18n) return;
      var base = "lang/";
      var scripts = document.getElementsByTagName("script");
      for (var i = 0; i < scripts.length; i++) {
        var s = scripts[i].getAttribute("src") || "";
        if (s.indexOf("i18n.js") >= 0) { base = s.slice(0, s.lastIndexOf("i18n.js")); break; }
      }
      init({ base: base }).then(function (api) {
        var sub = document.querySelector(".sub");
        if (sub && !sub.hasAttribute("data-i18n")) sub.textContent = api.t("sub.tagline");

        var MY_KEY = "limedrive_my_games";
        var esc = function (s) {
          return String(s).replace(/[&<>"]/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
          });
        };
        var myGames = function () {
          try { return JSON.parse(localStorage.getItem(MY_KEY) || "[]"); } catch (e) { return []; }
        };
        var saveMyGames = function (arr) {
          try { localStorage.setItem(MY_KEY, JSON.stringify(arr)); } catch (e) {}
        };

        var grid = document.querySelector(".grid");
        if (grid && !document.getElementById("impCard")) {
          var card = document.createElement("a");
          card.className = "card";
          card.id = "impCard";
          card.style.borderColor = "#00ff88";
          card.innerHTML = '<span class="t">' + api.t("imp.title") + '</span><span class="m">' + api.t("imp.hint") + '</span>';
          var inp = document.createElement("input");
          inp.type = "file";
          inp.accept = ".json,application/json";
          inp.style.display = "none";
          inp.id = "impInput";
          card.addEventListener("click", function () { inp.click(); });
          inp.addEventListener("change", function () {
            var f = inp.files && inp.files[0];
            if (!f) return;
            var r = new FileReader();
            r.onload = function () {
              try {
                var data = JSON.parse(r.result);
                if (!data || !Array.isArray(data.levels)) throw new Error("not a LimeDrive game JSON");
                var ask = api.t("imp.askPrompt");
                var pr = "";
                try { pr = prompt(ask, "") || ""; } catch (e2) {}
                var list = myGames();
                list.push({
                  id: (data.name || f.name) + "|" + data.levels.length + "|" + Date.now(),
                  title: data.name || f.name,
                  prompt: String(pr).trim(),
                  data: r.result
                });
                saveMyGames(list);
                try { localStorage.setItem("currentGame", r.result); } catch (e2) {}
                location.href = "examples/player.html";
              } catch (e) {
                alert((api.t("imp.error") || "Import error") + ": " + e.message);
              }
            };
            r.readAsText(f, "utf-8");
          });
          grid.insertBefore(card, grid.firstChild);

          var aiCard = document.createElement("a");
          aiCard.className = "card";
          aiCard.id = "aiPromptCard";
          aiCard.innerHTML = '<span class="t">🤖 ' + api.t("ai.title") + '</span><span class="m">' + api.t("ai.hint") + '</span>';
          aiCard.addEventListener("click", function () {
            var fallbackCopy = function (txt) {
              var ta = document.createElement("textarea");
              ta.value = txt;
              ta.style.position = "fixed";
              ta.style.opacity = "0";
              document.body.appendChild(ta);
              ta.select();
              try { document.execCommand("copy"); } catch (e3) {}
              document.body.removeChild(ta);
            };
            fetch(base + "../PROMPT.md").then(function (x) {
              if (!x.ok) throw new Error("HTTP " + x.status);
              return x.text();
            }).then(function (txt) {
              var done = function () { alert(api.t("imp.promptCopied")); };
              if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(txt).then(done).catch(function () { fallbackCopy(txt); done(); });
              } else {
                fallbackCopy(txt);
                done();
              }
            }).catch(function (e2) {
              alert(api.t("imp.error") + ": " + e2.message);
            });
          });
          var terminals = [
            { n: "ChatGPT", p: "com.openai.chatgpt", w: "https://chatgpt.com", e: "🟢" },
            { n: "Claude", p: "com.anthropic.claude", w: "https://claude.ai", e: "🟠" },
            { n: "DeepSeek", p: "com.deepseek.chat", w: "https://chat.deepseek.com", e: "🔵" },
            { n: "Gemini", p: "com.google.android.apps.bard", w: "https://gemini.google.com", e: "✨" },
            { n: "Copilot", p: "com.microsoft.copilot", w: "https://copilot.microsoft.com", e: "🟦" },
            { n: "Perplexity", p: "ai.perplexity.app", w: "https://www.perplexity.ai", e: "🔷" },
            { n: "GigaChat", p: "ru.sberbank.gigachat", w: "https://giga.chat", e: "🟩" },
            { n: "Алиса AI", p: "ru.yandex.searchplugin", w: "https://alice.yandex.ru", e: "🔴" }
          ];
          var termOverlay = document.createElement("div");
          termOverlay.id = "termOverlay";
          termOverlay.style.cssText = "display:none;position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:999;padding:16px;overflow:auto";
          var listHtml = terminals.map(function (t) {
            return '<div style="display:flex;align-items:center;gap:10px;background:#141424;border:1px solid #262640;border-radius:10px;padding:12px;margin-bottom:8px">'
              + '<span style="font-size:22px">' + t.e + '</span><b style="flex:1;color:#e8e8f0">' + t.n + '</b>'
              + '<button data-pkg="' + t.p + '" data-web="' + t.w + '" style="background:#00cc77;border:none;border-radius:6px;padding:6px 10px;font-family:monospace">app</button>'
              + '<button data-web="' + t.w + '" style="background:#262640;border:none;border-radius:6px;padding:6px 10px;color:#e8e8f0;font-family:monospace">web</button></div>';
          }).join("");
          termOverlay.innerHTML = '<h3 style="color:#00ff88;margin-bottom:8px">🤖 ' + api.t("term.title") + "</h3>"
            + '<p style="color:#889;font-size:11px;line-height:1.5">' + api.t("term.steps") + "</p>"
            + listHtml
            + '<button id="termClose" style="width:100%;padding:12px;background:#262640;border:none;border-radius:8px;color:#e8e8f0;font-family:monospace">' + api.t("term.close") + "</button>";
          aiCard.addEventListener("click", function () { termOverlay.style.display = "block"; });
          termOverlay.addEventListener("click", function (ev) {
            var b = ev.target.closest ? ev.target.closest("button") : null;
            if (!b) return;
            if (b.id === "termClose") { termOverlay.style.display = "none"; return; }
            var web = b.getAttribute("data-web");
            var pkg = b.hasAttribute("data-pkg") ? b.getAttribute("data-pkg") : null;
            if (window.LimeAndroid && window.LimeAndroid.launchApp) {
              window.LimeAndroid.launchApp(pkg || "", web);
              termOverlay.style.display = "none";
            } else if (window.LimeAndroid && window.LimeAndroid.openUrl) {
              window.LimeAndroid.openUrl(web);
            } else {
              window.open(web, "_blank");
            }
          });
          document.body.appendChild(termOverlay);
          grid.insertBefore(aiCard, card.nextSibling);
          document.body.appendChild(inp);

          var renderMine = function () {
            var stale = grid.querySelectorAll("[data-mine]");
            for (var s = 0; s < stale.length; s++) stale[s].parentNode.removeChild(stale[s]);
            var list = myGames();
            if (!list.length) return;
            var lbl = document.createElement("div");
            lbl.setAttribute("data-mine", "1");
            lbl.style.cssText = "grid-column:1/-1;color:#00cc77;font-size:12px;margin-top:8px";
            lbl.textContent = api.t("mine.section") + " (" + list.length + ")";
            grid.appendChild(lbl);
            list.forEach(function (g) {
              var c = document.createElement("a");
              c.className = "card";
              c.setAttribute("data-mine", "1");
              var snip = g.prompt ? g.prompt.slice(0, 42) : api.t("ex.play");
              c.innerHTML = '<span class="t">' + esc(g.title) + '</span><span class="m">' + esc(snip) + (g.prompt && g.prompt.length > 42 ? "…" : "") + '</span>';
              c.addEventListener("click", function () {
                localStorage.setItem("currentGame", g.data);
                location.href = "examples/player.html";
              });
              grid.appendChild(c);
            });
            var clr = document.createElement("a");
            clr.className = "card";
            clr.setAttribute("data-mine", "1");
            clr.style.borderColor = "#aa4444";
            clr.innerHTML = '<span class="t" style="color:#ff8888">🗑 ' + api.t("mine.clear") + '</span>';
            clr.addEventListener("click", function () {
              if (confirm(api.t("mine.clear") + "?")) { saveMyGames([]); renderMine(); }
            });
            grid.appendChild(clr);
          };
          renderMine();
        }

        if (!document.getElementById("langSwitch")) {
          var hint = document.querySelector(".hint") || document.body;
          var wrap = document.createElement("span");
          wrap.innerHTML = '<br><span>' + api.t("hint.licenses") + '</span> '
            + '<a href="LICENSE.md" style="color:#00cc77">' + api.t("hint.license.base") + '</a>'
            + ' · <a href="LICENSE-NC.md" style="color:#00cc77">NC</a>'
            + ' · <a href="LICENSE-EDU.md" style="color:#00cc77">EDU</a>'
            + ' · <select id="langSwitch" style="background:#141424;color:#e8e8f0;border:1px solid #262640;border-radius:6px;font-family:monospace"></select>';
          hint.appendChild(wrap);
          api.buildSwitcher(document.getElementById("langSwitch"));
        }
      });
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", autoBoot);
    else autoBoot();
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
