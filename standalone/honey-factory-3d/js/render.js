window.Render = {
  cv: null, ctx: null, W: 0, H: 0,
  target: [0, 8, 0],
  yaw: 0.7, pitch: 0.5, dist: 120,
  eye: [0, 0, 0], f: [0, 0, 0], r: [0, 0, 0], u: [0, 0, 0], focal: 600, near: 0.5,
  items: [],
  picked: null,

  init: function (cv) {
    this.cv = cv;
    this.ctx = cv.getContext('2d');
    this.resize();
    var self = this;
    window.addEventListener('resize', function () { self.resize(); });
    cv.addEventListener('mousedown', function (e) { self.onDown(e); });
    window.addEventListener('mousemove', function (e) { self.onMove(e); });
    window.addEventListener('mouseup', function (e) { self.onUp(e); });
    cv.addEventListener('wheel', function (e) {
      e.preventDefault();
      self.dist = Math.max(40, Math.min(260, self.dist * (1 + e.deltaY * 0.001)));
    }, { passive: false });
  },

  resize: function () {
    this.W = this.cv.width = window.innerWidth;
    this.H = this.cv.height = window.innerHeight;
    this.focal = this.H * 0.85;
  },

  updateCam: function () {
    var cY = Math.cos(this.pitch), sY = Math.sin(this.pitch);
    this.eye = [
      this.target[0] + this.dist * cY * Math.sin(this.yaw),
      this.target[1] + this.dist * sY,
      this.target[2] + this.dist * cY * Math.cos(this.yaw)
    ];
    this.f = VEC.norm(VEC.sub(this.target, this.eye));
    this.r = VEC.norm(VEC.cross(this.f, [0, 1, 0]));
    this.u = VEC.cross(this.r, this.f);
  },

  project: function (p, out) {
    var dx = p[0] - this.eye[0], dy = p[1] - this.eye[1], dz = p[2] - this.eye[2];
    var z = dx * this.f[0] + dy * this.f[1] + dz * this.f[2];
    if (z < this.near) return null;
    var s = this.focal / z;
    out.x = this.W / 2 + (dx * this.r[0] + dy * this.r[1] + dz * this.r[2]) * s;
    out.y = this.H / 2 - (dx * this.u[0] + dy * this.u[1] + dz * this.u[2]) * s;
    out.s = s;
    out.z = z;
    return out;
  },

  begin: function () {
    this.items.length = 0;
    this.updateCam();
    var ctx = this.ctx;
    var g = ctx.createLinearGradient(0, 0, 0, this.H);
    g.addColorStop(0, '#0a1524');
    g.addColorStop(1, '#12304a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.W, this.H);
    this.drawHorizon();
  },

  drawHorizon: function () {
    var gh = [this.f[0], 0, this.f[2]];
    var l = Math.sqrt(gh[0] * gh[0] + gh[2] * gh[2]);
    if (l < 1e-6) return;
    gh = [gh[0] / l, 0, gh[2] / l];
    var far = [
      this.eye[0] + gh[0] * 1e6,
      this.eye[1],
      this.eye[2] + gh[2] * 1e6
    ];
    var out = {};
    if (!this.project(far, out)) return;
    var y = out.y;
    var ctx = this.ctx;
    var g = ctx.createLinearGradient(0, y, 0, this.H);
    g.addColorStop(0, '#1a4a2a');
    g.addColorStop(0.6, '#12351f');
    g.addColorStop(1, '#0a2414');
    ctx.fillStyle = g;
    ctx.fillRect(0, y, this.W, this.H - y);
  },

  add: function (depth, fn) { this.items.push([depth, fn]); },
  flush: function () {
    this.items.sort(function (a, b) { return b[0] - a[0]; });
    for (var i = 0; i < this.items.length; i++) this.items[i][1]();
  },

  quad: function (pts, color) {
    var ctx = this.ctx;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fill();
  },

  shade: function (hex, k) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.min(255, ((n >> 16) & 255) * k) | 0;
    var g = Math.min(255, ((n >> 8) & 255) * k) | 0;
    var b = Math.min(255, (n & 255) * k) | 0;
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  },

  box: function (c, s, color) {
    var hx = s[0] / 2, hy = s[1] / 2, hz = s[2] / 2;
    var cs = [
      [c[0] - hx, c[1] - hy, c[2] - hz], [c[0] + hx, c[1] - hy, c[2] - hz],
      [c[0] + hx, c[1] - hy, c[2] + hz], [c[0] - hx, c[1] - hy, c[2] + hz],
      [c[0] - hx, c[1] + hy, c[2] - hz], [c[0] + hx, c[1] + hy, c[2] - hz],
      [c[0] + hx, c[1] + hy, c[2] + hz], [c[0] - hx, c[1] + hy, c[2] + hz]
    ];
    var faces = [
      { i: [0, 1, 2, 3], k: 0.55 },
      { i: [4, 5, 6, 7], k: 0.95 },
      { i: [0, 1, 5, 4], k: 0.7 },
      { i: [2, 3, 7, 6], k: 0.8 },
      { i: [1, 2, 6, 5], k: 0.9 },
      { i: [0, 3, 7, 4], k: 0.65 }
    ];
    var self = this, out = {};
    var cdz = 0;
    for (var i = 0; i < 8; i++) {
      if (!this.project(cs[i], out)) return;
      cdz += out.z;
    }
    this.add(cdz / 8, function () {
      var faceOuts = {};
      for (var f = 0; f < faces.length; f++) {
        var fi = faces[f].i;
        var ok = true, pts = [], fz = 0;
        for (var j = 0; j < 4; j++) {
          if (!self.project(cs[fi[j]], faceOuts)) { ok = false; break; }
          pts.push({ x: faceOuts.x, y: faceOuts.y });
          fz += faceOuts.z;
        }
        if (!ok) continue;
        self.quad(pts, self.shade(color, faces[f].k));
      }
    });
  },

  cylinder: function (c, y0, y1, rad, color, seg) {
    var self = this, out = {};
    seg = seg || 10;
    var base = [], top = [];
    for (var i = 0; i < seg; i++) {
      var a = (i / seg) * Math.PI * 2;
      base.push([c[0] + Math.cos(a) * rad, y0, c[2] + Math.sin(a) * rad]);
      top.push([c[0] + Math.cos(a) * rad, y1, c[2] + Math.sin(a) * rad]);
    }
    var cdz = 0, n = 0;
    for (var i = 0; i < seg; i++) {
      if (this.project(base[i], out)) { cdz += out.z; n++; }
      if (this.project(top[i], out)) { cdz += out.z; n++; }
    }
    if (!n) return;
    this.add(cdz / n, function () {
      var pA = {}, pB = {}, pC = {}, pD = {};
      for (var i = 0; i < seg; i++) {
        var j = (i + 1) % seg;
        if (!self.project(base[i], pA) || !self.project(base[j], pB) ||
            !self.project(top[j], pC) || !self.project(top[i], pD)) continue;
        self.quad([{ x: pA.x, y: pA.y }, { x: pB.x, y: pB.y },
                   { x: pC.x, y: pC.y }, { x: pD.x, y: pD.y }], self.shade(color, 0.7 + 0.3 * Math.cos(i / seg * Math.PI * 2 + 1)));
      }
      var capA = {}, capB = {};
      for (var i = 0; i < seg; i++) {
        var j = (i + 1) % seg;
        if (!self.project(top[i], capA) || !self.project(top[j], capB)) continue;
        self.quad([{ x: capA.x, y: capA.y }, { x: capB.x, y: capB.y },
                   { x: capB.x, y: capB.y }, { x: capA.x, y: capA.y }], self.shade(color, 1));
      }
    });
  },

  disc: function (c, rad, color) {
    var self = this, out = {};
    if (this.u[1] < 0) return;
    var pts3 = [];
    for (var i = 0; i < 12; i++) {
      var a = (i / 12) * Math.PI * 2;
      pts3.push([c[0] + Math.cos(a) * rad, c[1], c[2] + Math.sin(a) * rad]);
    }
    var cdz = 0, n = 0, pp = {};
    for (var i = 0; i < 12; i++) {
      if (this.project(pts3[i], pp)) { cdz += pp.z; n++; }
    }
    if (!n) return;
    this.add(cdz / n, function () {
      var p = {};
      var pts = [];
      for (var i = 0; i < 12; i++) {
        if (!self.project(pts3[i], p)) return;
        pts.push({ x: p.x, y: p.y });
      }
      self.quad(pts, color);
    });
  },

  line: function (a, b, color, width) {
    var self = this, pa = {}, pb = {};
    if (!this.project(a, pa) || !this.project(b, pb)) return;
    this.add((pa.z + pb.z) / 2, function () {
      self.ctx.strokeStyle = color;
      self.ctx.lineWidth = width || 1;
      self.ctx.beginPath();
      self.ctx.moveTo(pa.x, pa.y);
      self.ctx.lineTo(pb.x, pb.y);
      self.ctx.stroke();
    });
  },

  dot: function (p, size, color, inner) {
    var self = this, o = {};
    if (!this.project(p, o)) return;
    this.add(o.z, function () {
      var s = Math.max(1, o.s * size);
      var ctx = self.ctx;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(o.x, o.y, s, 0, Math.PI * 2);
      ctx.fill();
      if (inner) {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(o.x, o.y, s * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  },

  grid: function (size, step) {
    var ctx = this.ctx;
    for (var i = -size; i <= size; i += step) {
      this.line([i, 0, -size], [i, 0, size], 'rgba(60,140,90,0.25)', 1);
      this.line([-size, 0, i], [size, 0, i], 'rgba(60,140,90,0.25)', 1);
    }
  },

  dome: function (rad) {
    var self = this;
    var pts = [];
    var ctx = this.ctx;
    for (var i = 0; i <= 64; i++) {
      var a = (i / 64) * Math.PI * 2;
      pts.push([Math.cos(a) * rad, 0, Math.sin(a) * rad]);
    }
    var p0 = {}, p1 = {};
    for (var i = 0; i < 64; i++) {
      if (!this.project(pts[i], p0) || !this.project(pts[i + 1], p1)) continue;
      this.add((p0.z + p1.z) / 2, (function (a, b) {
        return function () {
          ctx.strokeStyle = 'rgba(140,200,255,0.28)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        };
      })({ x: p0.x, y: p0.y }, { x: p1.x, y: p1.y }));
    }
    for (var m = 0; m < 8; m++) {
      var an = (m / 8) * Math.PI * 2;
      var arc = [];
      for (var s = 0; s <= 20; s++) {
        var t = (s / 20) * Math.PI / 2;
        arc.push([Math.cos(an) * Math.cos(t) * rad, Math.sin(t) * rad, Math.sin(an) * Math.cos(t) * rad]);
      }
      for (var s = 0; s < 20; s++) {
        var pa = {}, pb = {};
        if (!this.project(arc[s], pa) || !this.project(arc[s + 1], pb)) continue;
        this.add((pa.z + pb.z) / 2, (function (a, b) {
          return function () {
            ctx.strokeStyle = 'rgba(140,200,255,0.16)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          };
        })({ x: pa.x, y: pa.y }, { x: pb.x, y: pb.y }));
      }
    }
  },

  onDown: function (e) {
    this.drag = true;
    this.lx = e.clientX; this.ly = e.clientY;
    this.moved = 0;
  },
  onMove: function (e) {
    if (!this.drag) return;
    var dx = e.clientX - this.lx, dy = e.clientY - this.ly;
    this.lx = e.clientX; this.ly = e.clientY;
    this.moved += Math.abs(dx) + Math.abs(dy);
    this.yaw += dx * 0.005;
    this.pitch = Math.max(0.05, Math.min(1.25, this.pitch + dy * 0.005));
  },
  onUp: function (e) {
    this.drag = false;
    if (this.moved < 6) {
      var o = this.pick(e.clientX, e.clientY);
      if (this.picked && this.picked.pick) this.picked.pick(o);
    }
  },
  setPicker: function (p) { this.picked = p; }
};
