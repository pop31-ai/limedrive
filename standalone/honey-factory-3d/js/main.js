window.Main = {
  render: null, selected: null, lastT: 0, acc: 0,
  drones: [],

  init: function () {
    SIM.build();
    SIM.pollenStock = 50;
    this.render = Render;
    Render.init(document.getElementById('cv'));
    Render.setPicker(this);
    this.buildDrones();
    this.fillZoneList();
    this.bindUI();
    var self = this;
    requestAnimationFrame(function (t) { self.loop(t); });
  },

  buildDrones: function () {
    this.drones = [];
    for (var zi = 0; zi < SIM.ZONES.length; zi++) {
      var z = SIM.ZONES[zi];
      for (var si = 0; si < z.world.length; si++) {
        var s = z.world[si];
        for (var i = 0; i < s.bees; i++) {
          this.drones.push({ s: s, i: i });
        }
      }
    }
  },

  bindUI: function () {
    document.getElementById('speed1').onclick = function () { SIM.scale = 1; };
    document.getElementById('speed4').onclick = function () { SIM.scale = 4; };
    document.getElementById('speed10').onclick = function () { SIM.scale = 10; };
  },

  fillZoneList: function () {
    var self = this;
    var list = document.getElementById('zonelist');
    list.innerHTML = '';
    for (var zi = 0; zi < SIM.ZONES.length; zi++) {
      var z = SIM.ZONES[zi];
      var d = document.createElement('div');
      d.className = 'zone-item';
      d.id = 'zi_' + zi;
      d.textContent = z.name;
      d.onclick = (function (idx) {
        return function () { self.selectZone(idx); };
      })(zi);
      list.appendChild(d);
    }
  },

  selectZone: function (idx) {
    this.selected = idx;
    var items = document.querySelectorAll('.zone-item');
    for (var i = 0; i < items.length; i++) items[i].classList.remove('sel');
    var el = document.getElementById('zi_' + idx);
    if (el) el.classList.add('sel');
    var z = SIM.ZONES[idx];
    document.getElementById('zoneName').textContent = z.name;
    document.getElementById('valve1').value = z.valve1;
    document.getElementById('valve1v').textContent = Math.round(z.valve1 * 100) + '%';
    document.getElementById('valve2').value = z.valve2;
    document.getElementById('valve2v').textContent = Math.round(z.valve2 * 100) + '%';
    document.getElementById('zoneDetail').style.display = 'block';
    document.getElementById('valve1').oninput = function () {
      z.valve1 = parseFloat(this.value);
      document.getElementById('valve1v').textContent = Math.round(z.valve1 * 100) + '%';
    };
    document.getElementById('valve2').oninput = function () {
      z.valve2 = parseFloat(this.value);
      document.getElementById('valve2v').textContent = Math.round(z.valve2 * 100) + '%';
    };
  },

  pick: function (zoneIdx) {
    if (zoneIdx !== undefined && zoneIdx !== null) this.selectZone(zoneIdx);
  },

  renderWorld: function () {
    var R = this.render;
    var ctx = R.ctx;
    var self = this;
    R.begin();
    R.grid(90, 15);
    R.dome(80);

    for (var zi = 0; zi < SIM.ZONES.length; zi++) {
      var z = SIM.ZONES[zi];
      var tp = z.pos;
      var sel = self.selected === zi;
      R.cylinder([tp[0], 0, tp[2]], 0, z.towerH, 6, sel ? '#3a5a48' : '#2e4a3a', 8);
      R.cylinder([tp[0], z.towerH, tp[2]], z.towerH, z.towerH + 1.2, 1.6, '#8b5a2b', 8);
      for (var f = 0; f < z.swarms.length; f++) {
        var s = z.swarms[f];
        var col = SIM.FLOWERS[s.flowers[0]].col;
        R.disc(s.flower, 2.2, col);
        R.disc([tp[0] + Math.cos(z.ang) * 2, 0.2, tp[2] + Math.sin(z.ang) * 2], 2.4, 'rgba(0,0,0,0.15)');
      }
    }

    R.cylinder([0, 4, 0], 0, 8, 5.5, '#3a4f63', 8);
    R.box([0, 8, 0], [18, 6, 18], '#5a6b78');
    R.cylinder([-7, 8, -7], 0, 12, 2, '#7a8a94', 8);
    R.cylinder([7, 8, 7], 0, 12, 2, '#7a8a94', 8);
    R.cylinder([-7, 8, 7], 0, 12, 2, '#7a8a94', 8);
    R.cylinder([7, 8, -7], 0, 12, 2, '#7a8a94', 8);

    var out = {};
    for (var di = 0; di < this.drones.length; di++) {
      var d = this.drones[di];
      var b = SIM.beePos(d.s, d.i, SIM.time);
      R.dot(b.pos, 0.15, b.returning ? '#ffb300' : '#ffd84d', b.returning);
      if (di % 15 === 0) {
        var sh = R.project([b.pos[0], 0.04, b.pos[2]], out);
        if (sh) {
          (function (x, y, s) {
            R.add(s, function () {
              ctx.fillStyle = 'rgba(0,0,0,0.18)';
              ctx.beginPath();
              ctx.arc(x, y, Math.max(1, s * 0.2), 0, Math.PI * 2);
              ctx.fill();
            });
          })(sh.x, sh.y, sh.z);
        }
      }
    }

    R.flush();
  },

  updateUI: function () {
    var S = SIM;
    this.els = this.els || {
      honey: document.getElementById('kHoney'),
      vit: document.getElementById('kVit'),
      sugar: document.getElementById('kSugar'),
      pollen: document.getElementById('kPollen'),
      bees: document.getElementById('kBees'),
      quality: document.getElementById('kQuality'),
      profit: document.getElementById('kProfit'),
      money: document.getElementById('kMoney'),
      time: document.getElementById('kTime')
    };
    var e = this.els;
    e.honey.textContent = fmt(S.honeyMade) + '/с';
    e.vit.textContent = fmt(S.vitaminMade) + '/с';
    e.sugar.textContent = fmt(S.sugarStock);
    e.pollen.textContent = fmt(S.pollenStock);
    e.bees.textContent = S.totalBees;
    e.quality.textContent = (S.qualityAvg * 100).toFixed(0) + '%';
    e.profit.textContent = (S.profitAcc >= 0 ? '+' : '') + fmt(S.profitAcc) + '$/с';
    e.money.textContent = fmt(S.money) + '$';
    e.time.textContent = formatTime(S.time);
  },

  loop: function (t) {
    var self = this;
    if (!this.lastT) this.lastT = t;
    var dt = Math.min(0.1, (t - this.lastT) / 1000);
    this.lastT = t;
    this.acc += dt;
    SIM.update(dt * SIM.scale);
    this.renderWorld();
    if (this.acc > 0.5) {
      this.updateUI();
      this.acc = 0;
    }
    requestAnimationFrame(function (t) { self.loop(t); });
  }
};

function fmt(v) {
  if (!isFinite(v)) return '—';
  if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  if (v >= 1e4) return (v / 1e3).toFixed(1) + 'k';
  return v.toFixed(1);
}
function formatTime(s) {
  var m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return m + ':' + (sec < 10 ? '0' : '') + sec;
}

window.addEventListener('load', function () { Main.init(); });
