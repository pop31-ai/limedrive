window.LD = window.LD || {};

(function () {
  'use strict';

  LD.Iso = LD.Iso || {};

  // ── Isometric Projection ─────────────────────────────────────────
  const ISO_ANGLE = Math.PI / 6;
  const COS_A = Math.cos(ISO_ANGLE);
  const SIN_A = Math.sin(ISO_ANGLE);

  let _projOriginX = 0;
  let _projOriginY = 0;

  LD.Iso.setOrigin = function (ox, oy) {
    _projOriginX = ox;
    _projOriginY = oy;
  };

  LD.Iso.project = function (x, y, z) {
    const sx = (x - z) * COS_A;
    const sy = (x + z) * SIN_A - y;
    return { x: sx + _projOriginX, y: sy + _projOriginY };
  };

  LD.Iso.unproject = function (screenX, screenY) {
    const sx = screenX - _projOriginX;
    const sy = screenY - _projOriginY;
    const x = (sx / COS_A + sy / SIN_A) / 2;
    const z = (sy / SIN_A - sx / COS_A) / 2;
    return { x: x, y: 0, z: z };
  };

  LD.Iso.projectScale = function (s) {
    return { w: s * COS_A * 2, h: s * SIN_A };
  };

  // ── Camera ───────────────────────────────────────────────────────
  class Camera3D {
    constructor() {
      this.x = 0;
      this.y = 200;
      this.z = 0;
      this.rotationX = 30;
      this.rotationY = 45;
      this.zoom = 1;
      this.target = null;
      this.smoothing = 4;
      this._shakeAmount = 0;
      this._shakeDuration = 0;
    }
    follow(target) { this.target = target; }
    shake(amount, duration) {
      this._shakeAmount = amount || 10;
      this._shakeDuration = duration || 0.3;
    }
    update(dt) {
      if (this.target) {
        const tx = this.target.x || 0;
        const ty = this.target.y || 0;
        const tz = this.target.z || 0;
        this.x += (tx - this.x) * this.smoothing * dt;
        this.y += (ty - this.y) * this.smoothing * dt;
        this.z += (tz - this.z) * this.smoothing * dt;
      }
      if (this._shakeDuration > 0) {
        this._shakeDuration -= dt;
      }
    }
    getShakeOffset() {
      if (this._shakeDuration <= 0) return { x: 0, y: 0 };
      return {
        x: (Math.random() - 0.5) * 2 * this._shakeAmount,
        y: (Math.random() - 0.5) * 2 * this._shakeAmount
      };
    }
    getProjectionOrigin(canvasW, canvasH) {
      const shake = this.getShakeOffset();
      return {
        x: canvasW / 2 + shake.x - this.x * this.zoom,
        y: canvasH / 2 + shake.y + this.y * this.zoom
      };
    }
  }

  // ── Material ─────────────────────────────────────────────────────
  class Material {
    constructor(opts) {
      opts = opts || {};
      this.color = opts.color || '#888888';
      this.texture = opts.texture || null;
      this.opacity = opts.opacity !== undefined ? opts.opacity : 1;
      this.wireframe = opts.wireframe || false;
      this.lineWidth = opts.lineWidth || 1;
    }
    apply(ctx) {
      ctx.globalAlpha = this.opacity;
      if (this.wireframe) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
      } else {
        ctx.fillStyle = this.color;
      }
    }
    restore(ctx) {
      ctx.globalAlpha = 1;
    }
  }

  // ── Scene Node ───────────────────────────────────────────────────
  class SceneNode {
    constructor(opts) {
      opts = opts || {};
      this.x = opts.x || 0;
      this.y = opts.y || 0;
      this.z = opts.z || 0;
      this.rotX = opts.rotX || 0;
      this.rotY = opts.rotY || 0;
      this.rotZ = opts.rotZ || 0;
      this.scaleX = opts.scaleX !== undefined ? opts.scaleX : 1;
      this.scaleY = opts.scaleY !== undefined ? opts.scaleY : 1;
      this.scaleZ = opts.scaleZ !== undefined ? opts.scaleZ : 1;
      this.mesh = opts.mesh || null;
      this.material = opts.material || new Material();
      this.children = [];
      this.parent = null;
      this.visible = true;
      this.billboard = opts.billboard || false;
      this.sprite = opts.sprite || null;
      this.spriteWidth = opts.spriteWidth || 32;
      this.spriteHeight = opts.spriteHeight || 32;
    }
    addChild(node) {
      node.parent = this;
      this.children.push(node);
      return node;
    }
    removeChild(node) {
      node.parent = null;
      this.children = this.children.filter(function (c) { return c !== node; });
    }
    getWorldPosition() {
      let wx = this.x, wy = this.y, wz = this.z;
      let p = this.parent;
      while (p) { wx += p.x; wy += p.y; wz += p.z; p = p.parent; }
      return { x: wx, y: wy, z: wz };
    }
    getDepth() {
      const wp = this.getWorldPosition();
      return wp.x + wp.z - wp.y;
    }
  }

  // ── Mesh Primitives ──────────────────────────────────────────────
  LD.Mesh = {
    cube: function (size) {
      const s = size || 1;
      return { type: 'cube', size: s, vertices: _cubeVertices(s) };
    },
    plane: function (w, h) {
      return { type: 'plane', width: w || 1, height: h || 1 };
    },
    sphere: function (radius, segments) {
      segments = segments || 12;
      return { type: 'sphere', radius: radius || 0.5, segments: segments };
    },
    grid: function (sizeX, sizeZ, cellSize) {
      return { type: 'grid', sizeX: sizeX || 10, sizeZ: sizeZ || 10, cellSize: cellSize || 1 };
    }
  };

  function _cubeVertices(s) {
    const h = s / 2;
    return [
      { x: -h, y: -h, z: -h }, { x: h, y: -h, z: -h },
      { x: h, y: h, z: -h }, { x: -h, y: h, z: -h },
      { x: -h, y: -h, z: h }, { x: h, y: -h, z: h },
      { x: h, y: h, z: h }, { x: -h, y: h, z: h }
    ];
  }

  function _shadeColor(hex, factor) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = Math.min(255, Math.max(0, Math.round(r * factor)));
    g = Math.min(255, Math.max(0, Math.round(g * factor)));
    b = Math.min(255, Math.max(0, Math.round(b * factor)));
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  // ── Lighting ─────────────────────────────────────────────────────
  class Lighting {
    constructor() {
      this.ambient = 0.4;
      this.direction = { x: 0.5, y: -0.7, z: 0.3 };
      this.intensity = 0.6;
    }
    getShading(normalY) {
      const dot = Math.abs(normalY);
      return this.ambient + this.intensity * dot;
    }
  }

  // ── 3D Renderer ──────────────────────────────────────────────────
  class Renderer3D {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.camera = new Camera3D();
      this.lighting = new Lighting();
      this.scene = [];
      this.skyTop = '#1a1a2e';
      this.skyBottom = '#16213e';
      this.clearColor = '#0f0f23';
    }
    init(canvas) {
      if (typeof canvas === 'string') canvas = document.getElementById(canvas);
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      return this;
    }
    setCamera(cam) {
      if (cam instanceof Camera3D) this.camera = cam;
    }
    addToScene(node) {
      this.scene.push(node);
      return node;
    }
    removeFromScene(node) {
      this.scene = this.scene.filter(function (n) { return n !== node; });
    }
    clearScene() { this.scene = []; }
    _depthSort(nodes) {
      return nodes.slice().sort(function (a, b) {
        return b.getDepth() - a.getDepth();
      });
    }
    _drawSky() {
      const ctx = this.ctx;
      const h = this.canvas.height;
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, this.skyTop);
      grad.addColorStop(1, this.skyBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.canvas.width, h);
    }
    _drawCube(node, origin) {
      const ctx = this.ctx;
      const mat = node.material;
      const mesh = node.mesh;
      const wp = node.getWorldPosition();
      const s = mesh.size;
      const h = s / 2;

      const faces = [
        { verts: [
          { x: wp.x - h, y: wp.y - h, z: wp.z - h },
          { x: wp.x + h, y: wp.y - h, z: wp.z - h },
          { x: wp.x + h, y: wp.y + h, z: wp.z - h },
          { x: wp.x - h, y: wp.y + h, z: wp.z - h }
        ], normalY: -1 },
        { verts: [
          { x: wp.x - h, y: wp.y - h, z: wp.z + h },
          { x: wp.x + h, y: wp.y - h, z: wp.z + h },
          { x: wp.x + h, y: wp.y + h, z: wp.z + h },
          { x: wp.x - h, y: wp.y + h, z: wp.z + h }
        ], normalY: 1 },
        { verts: [
          { x: wp.x - h, y: wp.y - h, z: wp.z - h },
          { x: wp.x - h, y: wp.y - h, z: wp.z + h },
          { x: wp.x - h, y: wp.y + h, z: wp.z + h },
          { x: wp.x - h, y: wp.y + h, z: wp.z - h }
        ], normalY: 0 },
        { verts: [
          { x: wp.x + h, y: wp.y - h, z: wp.z - h },
          { x: wp.x + h, y: wp.y - h, z: wp.z + h },
          { x: wp.x + h, y: wp.y + h, z: wp.z + h },
          { x: wp.x + h, y: wp.y + h, z: wp.z - h }
        ], normalY: 0 },
        { verts: [
          { x: wp.x - h, y: wp.y + h, z: wp.z - h },
          { x: wp.x + h, y: wp.y + h, z: wp.z - h },
          { x: wp.x + h, y: wp.y + h, z: wp.z + h },
          { x: wp.x - h, y: wp.y + h, z: wp.z + h }
        ], normalY: 1 },
        { verts: [
          { x: wp.x - h, y: wp.y - h, z: wp.z - h },
          { x: wp.x + h, y: wp.y - h, z: wp.z - h },
          { x: wp.x + h, y: wp.y - h, z: wp.z + h },
          { x: wp.x - h, y: wp.y - h, z: wp.z + h }
        ], normalY: -1 }
      ];

      faces.forEach(function (face) {
        const projected = face.verts.map(function (v) {
          return LD.Iso.project(v.x - origin.x, v.y, v.z - origin.y);
        });
        const shade = face.normalY >= 0 ? 1.0 : 0.7;
        const finalColor = _shadeColor(mat.color, shade);

        ctx.beginPath();
        ctx.moveTo(projected[0].x, projected[0].y);
        for (let i = 1; i < projected.length; i++) {
          ctx.lineTo(projected[i].x, projected[i].y);
        }
        ctx.closePath();

        if (mat.wireframe) {
          ctx.strokeStyle = finalColor;
          ctx.lineWidth = mat.lineWidth;
          ctx.stroke();
        } else {
          ctx.fillStyle = finalColor;
          ctx.fill();
          ctx.strokeStyle = _shadeColor(mat.color, shade * 0.7);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
    }
    _drawSphere(node, origin) {
      const ctx = this.ctx;
      const mesh = node.mesh;
      const mat = node.material;
      const wp = node.getWorldPosition();
      const segs = mesh.segments;
      const r = mesh.radius;
      const projected = LD.Iso.project(wp.x - origin.x, wp.y, wp.z - origin.y);
      const scaledR = r * 1.8 * this.camera.zoom;

      const grad = ctx.createRadialGradient(
        projected.x - scaledR * 0.3, projected.y - scaledR * 0.3, scaledR * 0.1,
        projected.x, projected.y, scaledR
      );
      const bright = _shadeColor(mat.color, 1.3);
      const dark = _shadeColor(mat.color, 0.4);
      grad.addColorStop(0, bright);
      grad.addColorStop(0.7, mat.color);
      grad.addColorStop(1, dark);

      ctx.beginPath();
      ctx.ellipse(projected.x, projected.y, scaledR, scaledR * 0.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = _shadeColor(mat.color, 0.5);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    _drawPlane(node, origin) {
      const ctx = this.ctx;
      const mesh = node.mesh;
      const mat = node.material;
      const wp = node.getWorldPosition();
      const hw = mesh.width / 2;
      const hh = mesh.height / 2;

      const corners = [
        LD.Iso.project(wp.x - hw - origin.x, wp.y, wp.z - hh - origin.y),
        LD.Iso.project(wp.x + hw - origin.x, wp.y, wp.z - hh - origin.y),
        LD.Iso.project(wp.x + hw - origin.x, wp.y, wp.z + hh - origin.y),
        LD.Iso.project(wp.x - hw - origin.x, wp.y, wp.z + hh - origin.y)
      ];

      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      for (let i = 1; i < corners.length; i++) ctx.lineTo(corners[i].x, corners[i].y);
      ctx.closePath();

      if (mat.wireframe) {
        ctx.strokeStyle = mat.color;
        ctx.lineWidth = mat.lineWidth;
        ctx.stroke();
      } else {
        ctx.fillStyle = mat.color;
        ctx.fill();
      }
    }
    _drawGrid(node, origin) {
      const ctx = this.ctx;
      const mat = node.material;
      const mesh = node.mesh;
      const wp = node.getWorldPosition();
      const cs = mesh.cellSize;

      ctx.strokeStyle = mat.color || 'rgba(255,255,255,0.15)';
      ctx.lineWidth = mat.lineWidth || 1;

      for (let x = 0; x <= mesh.sizeX; x++) {
        const p1 = LD.Iso.project(wp.x + x * cs - origin.x, wp.y, wp.z - origin.y);
        const p2 = LD.Iso.project(wp.x + x * cs - origin.x, wp.y, wp.z + mesh.sizeZ * cs - origin.y);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
      for (let z = 0; z <= mesh.sizeZ; z++) {
        const p1 = LD.Iso.project(wp.x - origin.x, wp.y, wp.z + z * cs - origin.y);
        const p2 = LD.Iso.project(wp.x + mesh.sizeX * cs - origin.x, wp.y, wp.z + z * cs - origin.y);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
    _drawBillboard(node, origin) {
      const ctx = this.ctx;
      const wp = node.getWorldPosition();
      const p = LD.Iso.project(wp.x - origin.x, wp.y, wp.z - origin.y);
      const img = node.sprite;
      if (!img) return;
      const sw = node.spriteWidth * this.camera.zoom;
      const sh = node.spriteHeight * this.camera.zoom;
      ctx.drawImage(img, p.x - sw / 2, p.y - sh, sw, sh);
    }
    _renderNode(node, origin) {
      if (!node.visible) return;
      if (node.billboard && node.sprite) {
        this._drawBillboard(node, origin);
      } else if (node.mesh) {
        switch (node.mesh.type) {
          case 'cube': this._drawCube(node, origin); break;
          case 'sphere': this._drawSphere(node, origin); break;
          case 'plane': this._drawPlane(node, origin); break;
          case 'grid': this._drawGrid(node, origin); break;
        }
      }
      for (let i = 0; i < node.children.length; i++) {
        this._renderNode(node.children[i], origin);
      }
    }
    render() {
      if (!this.ctx) return;
      const ctx = this.ctx;
      const cw = this.canvas.width;
      const ch = this.canvas.height;

      this.camera.update(1 / 60);
      LD.Iso.setOrigin(cw / 2, ch / 2);

      this._drawSky();

      const origin = this.camera.getProjectionOrigin(cw, ch);
      const sorted = this._depthSort(this.scene);

      for (let i = 0; i < sorted.length; i++) {
        this._renderNode(sorted[i], { x: this.camera.x, y: this.camera.z });
      }
    }
  }

  // ── Exports ──────────────────────────────────────────────────────
  LD.Camera3D = Camera3D;
  LD.Material = Material;
  LD.SceneNode = SceneNode;
  LD.Renderer3D = Renderer3D;
  LD.Lighting = Lighting;

})();
