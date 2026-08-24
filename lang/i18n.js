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
})(typeof globalThis !== "undefined" ? globalThis : this);
