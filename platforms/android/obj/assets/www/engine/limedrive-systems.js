window.LD = window.LD || {};
LD.Systems = LD.Systems || {};

(function () {
  'use strict';

  function _register(name, cls) {
    cls._type = name;
    return cls;
  }

  // ── RenderSystem ─────────────────────────────────────────────────
  LD.Systems.RenderSystem = _register('RenderSystem', class RenderSystem extends LD.System {
    constructor() {
      super([LD.Components.Transform, LD.Components.Sprite]);
      this.priority = 90;
    }
    render(ctx, entities) {
      const visible = this.getEntities(entities).sort(function (a, b) {
        const sa = a.getComponent(LD.Components.Sprite);
        const sb = b.getComponent(LD.Components.Sprite);
        return (sa.layer || 0) - (sb.layer || 0);
      });

      for (let i = 0; i < visible.length; i++) {
        const e = visible[i];
        const tf = e.getComponent(LD.Components.Transform);
        const sp = e.getComponent(LD.Components.Sprite);

        const anim = e.getComponent(LD.Components.Animator);
        if (anim && anim.currentAnim) {
          const frame = anim.getCurrentFrame();
          if (frame) {
            ctx.save();
            if (anim.flipX) {
              ctx.translate(tf.x + sp.width / 2, tf.y);
              ctx.scale(-1, 1);
              ctx.translate(-sp.width / 2, 0);
            }
            if (frame.image) {
              ctx.drawImage(frame.image, tf.x, tf.y, sp.width, sp.height);
            } else {
              ctx.fillStyle = frame.color || sp.color;
              ctx.fillRect(tf.x, tf.y, sp.width, sp.height);
            }
            ctx.restore();
            continue;
          }
        }

        sp.draw(ctx, tf.x, tf.y);
      }
    }
  });

  // ── PhysicsSystem ────────────────────────────────────────────────
  LD.Systems.PhysicsSystem = _register('PhysicsSystem', class PhysicsSystem extends LD.System {
    constructor() {
      super([LD.Components.Transform, LD.Components.PhysicsBody]);
      this.priority = 10;
    }
    update(dt, entities) {
      const bodies = this.getEntities(entities);

      for (let i = 0; i < bodies.length; i++) {
        const e = bodies[i];
        const tf = e.getComponent(LD.Components.Transform);
        const pb = e.getComponent(LD.Components.PhysicsBody);

        if (pb.isStatic) continue;

        pb.vy += LD.Physics.GRAVITY * pb.gravityScale * dt;

        pb.vx += pb.ax * dt;
        pb.vy += pb.ay * dt;
        pb.vx = Math.max(-pb.maxVelocity, Math.min(pb.maxVelocity, pb.vx));
        pb.vy = Math.max(-pb.maxVelocity, Math.min(pb.maxVelocity, pb.vy));
        pb.ax = 0;
        pb.ay = 0;

        tf.x += pb.vx * dt;
        tf.y += pb.vy * dt;

        if (!pb.isStatic) {
          pb.vx *= Math.pow(pb.friction, dt * 60);
          if (Math.abs(pb.vx) < 0.5) pb.vx = 0;
        }
      }
    }
  });

  // ── CollisionSystem ──────────────────────────────────────────────
  LD.Systems.CollisionSystem = _register('CollisionSystem', class CollisionSystem extends LD.System {
    constructor() {
      super([LD.Components.Transform, LD.Components.Collider]);
      this.priority = 20;
      this._pairs = [];
    }
    update(dt, entities) {
      const colliders = this.getEntities(entities);
      this._pairs = [];

      for (let i = 0; i < colliders.length; i++) {
        for (let j = i + 1; j < colliders.length; j++) {
          const a = colliders[i];
          const b = colliders[j];
          const ca = a.getComponent(LD.Components.Collider);
          const cb = b.getComponent(LD.Components.Collider);

          const maskMatch = ca.mask.includes(cb.layer) || cb.mask.includes(ca.layer);
          if (!maskMatch && ca.layer !== cb.layer) continue;

          const ta = a.getComponent(LD.Components.Transform);
          const tb = b.getComponent(LD.Components.Transform);
          const abA = ca.getBounds(ta);
          const abB = cb.getBounds(tb);

          if (LD.Physics.aabbOverlap(abA, abB)) {
            this._pairs.push({ a: a, b: b, colliderA: ca, colliderB: cb });

            if (ca.isTrigger || cb.isTrigger) {
              LD.emit('collision:trigger', { a: a, b: b });
              if (a.hasTag('player') || b.hasTag('player')) {
                LD.emit('collision:trigger:player', { a: a, b: b });
              }
            } else {
              LD.emit('collision:hit', { a: a, b: b });
              const pa = a.getComponent(LD.Components.PhysicsBody);
              const pb = b.getComponent(LD.Components.PhysicsBody);
              if (pa && !pa.isStatic) {
                LD.Physics.resolveAABB(abA, abB);
                if (ca.colliding === false) {
                  LD.emit('collision:enter', { a: a, b: b });
                  ca.colliding = true;
                }
              } else if (pb && !pb.isStatic) {
                LD.Physics.resolveAABB(abB, abA);
                if (cb.colliding === false) {
                  LD.emit('collision:enter', { a: a, b: b });
                  cb.colliding = true;
                }
              }
            }
          } else {
            if (ca.colliding) {
              LD.emit('collision:exit', { a: a, b: b });
              ca.colliding = false;
            }
            if (cb.colliding) {
              cb.colliding = false;
            }
          }
        }
      }
    }
    getPairs() { return this._pairs; }
  });

  // ── PlayerInputSystem ────────────────────────────────────────────
  LD.Systems.PlayerInputSystem = _register('PlayerInputSystem', class PlayerInputSystem extends LD.System {
    constructor() {
      super([LD.Components.Transform, LD.Components.PlayerControl]);
      this.priority = 5;
    }
    update(dt, entities) {
      const players = this.getEntities(entities);
      const input = LD.Input;

      for (let i = 0; i < players.length; i++) {
        const e = players[i];
        const tf = e.getComponent(LD.Components.Transform);
        const pc = e.getComponent(LD.Components.PlayerControl);
        const pb = e.getComponent(LD.Components.PhysicsBody);
        const plat = e.getComponent(LD.Components.Platformer);

        if (!pc.active || !pc.inputEnabled) continue;

        let moveX = 0;
        if (input.isKeyDown(pc.moveLeft)) moveX -= 1;
        if (input.isKeyDown(pc.moveRight)) moveX += 1;

        if (pb) {
          pb.vx += moveX * pc.speed;
        } else {
          tf.x += moveX * pc.speed * dt;
        }

        if (input.isKeyPressed(pc.jumpKey)) {
          if (plat && plat.canJump()) {
            if (pb) {
              pb.vy = pc.jumpForce;
              plat.consumeJump();
              LD.emit('player:jump', { entity: e });
            }
          } else if (pb) {
            pb.vy = pc.jumpForce;
            LD.emit('player:jump', { entity: e });
          }
        }

        if (moveX !== 0) {
          LD.emit('player:move', { entity: e, dx: moveX });
        }
      }
    }
  });

  // ── AIControlSystem ──────────────────────────────────────────────
  LD.Systems.AIControlSystem = _register('AIControlSystem', class AIControlSystem extends LD.System {
    constructor() {
      super([LD.Components.Transform, LD.Components.AIControl]);
      this.priority = 6;
    }
    init() {
      LD.on('engine:init', function () {
        const world = LD.getWorld();
        if (!world) return;
      });
    }
    update(dt, entities) {
      const aiEntities = this.getEntities(entities);

      for (let i = 0; i < aiEntities.length; i++) {
        const e = aiEntities[i];
        const tf = e.getComponent(LD.Components.Transform);
        const aiComp = e.getComponent(LD.Components.AIControl);
        const pb = e.getComponent(LD.Components.PhysicsBody);

        if (!aiComp.controller) {
          aiComp.controller = new LD.AI.EnemyController({
            difficulty: aiComp.difficulty,
            personality: aiComp.personality,
            patrolPath: aiComp.patrolPath,
            sightRange: aiComp.sightRange,
            attackRange: aiComp.attackRange,
            thinkInterval: aiComp.thinkInterval
          });
          aiComp.controller.entity = e;
        }

        const decision = aiComp.controller.tick(dt, null, {});
        if (!decision) continue;

        switch (decision.type) {
          case 'move':
            if (pb) {
              pb.vx += (decision.dx || 0) * 150;
            } else {
              tf.x += (decision.dx || 0) * 100 * dt;
              tf.y += (decision.dy || 0) * 100 * dt;
            }
            break;
          case 'attack':
            LD.emit('ai:attack', { entity: e });
            break;
          case 'defend':
            break;
          case 'flee':
            if (pb) {
              const ndx = Math.sign(decision.dx);
              pb.vx += ndx * 200;
            }
            break;
          case 'idle':
          default:
            break;
        }
      }
    }
  });

  // ── AnimatorSystem ───────────────────────────────────────────────
  LD.Systems.AnimatorSystem = _register('AnimatorSystem', class AnimatorSystem extends LD.System {
    constructor() {
      super([LD.Components.Animator]);
      this.priority = 80;
    }
    update(dt, entities) {
      const animEntities = this.getEntities(entities);
      for (let i = 0; i < animEntities.length; i++) {
        const anim = animEntities[i].getComponent(LD.Components.Animator);
        anim.update(dt);
      }
    }
  });

  // ── ParticleSystem ───────────────────────────────────────────────
  LD.Systems.ParticleSystem = _register('ParticleSystem', class ParticleSystem extends LD.System {
    constructor() {
      super([LD.Components.Transform, LD.Components.ParticleEmitter]);
      this.priority = 85;
    }
    update(dt, entities) {
      const emitters = this.getEntities(entities);
      for (let i = 0; i < emitters.length; i++) {
        const e = emitters[i];
        const pe = e.getComponent(LD.Components.ParticleEmitter);
        pe.update(dt);
      }
    }
    render(ctx, entities) {
      const emitters = this.getEntities(entities);
      for (let i = 0; i < emitters.length; i++) {
        const e = emitters[i];
        const tf = e.getComponent(LD.Components.Transform);
        const pe = e.getComponent(LD.Components.ParticleEmitter);

        for (let j = 0; j < pe.particles.length; j++) {
          const p = pe.particles[j];
          const lifeRatio = p.life / p.maxLife;
          ctx.globalAlpha = lifeRatio;

          if (pe.endColor) {
            ctx.fillStyle = _lerpColor(pe.color, pe.endColor, 1 - lifeRatio);
          } else {
            ctx.fillStyle = p.color;
          }

          ctx.fillRect(tf.x + p.x - p.size / 2, tf.y + p.y - p.size / 2, p.size, p.size);
        }
        ctx.globalAlpha = 1;
      }
    }
  });

  function _lerpColor(c1, c2, t) {
    const r1 = parseInt(c1.slice(1, 3), 16);
    const g1 = parseInt(c1.slice(3, 5), 16);
    const b1 = parseInt(c1.slice(5, 7), 16);
    const r2 = parseInt(c2.slice(1, 3), 16);
    const g2 = parseInt(c2.slice(3, 5), 16);
    const b2 = parseInt(c2.slice(5, 7), 16);
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  // ── PlatformerSystem ─────────────────────────────────────────────
  LD.Systems.PlatformerSystem = _register('PlatformerSystem', class PlatformerSystem extends LD.System {
    constructor() {
      super([LD.Components.Transform, LD.Components.PhysicsBody, LD.Components.Platformer, LD.Components.Collider]);
      this.priority = 15;
    }
    update(dt, entities) {
      const platEntities = this.getEntities(entities);
      const allColliders = entities.filter(function (e) {
        return e.active && e.hasComponent(LD.Components.Collider) && e.hasComponent(LD.Components.Transform);
      });

      for (let i = 0; i < platEntities.length; i++) {
        const e = platEntities[i];
        const tf = e.getComponent(LD.Components.Transform);
        const pb = e.getComponent(LD.Components.PhysicsBody);
        const plat = e.getComponent(LD.Components.Platformer);
        const col = e.getComponent(LD.Components.Collider);

        const prevOnGround = plat.onGround;
        plat.onGround = false;

        const feetY = tf.y + col.height;
        const feetLeft = tf.x + col.offsetX + 4;
        const feetRight = tf.x + col.offsetX + col.width - 4;

        for (let j = 0; j < allColliders.length; j++) {
          const other = allColliders[j];
          if (other === e) continue;
          const ot = other.getComponent(LD.Components.Transform);
          const oc = other.getComponent(LD.Components.Collider);
          const opb = other.getComponent(LD.Components.PhysicsBody);

          const isPlatform = oc.isTrigger || plat.oneWayPlatform;
          const isStatic = opb && opb.isStatic;

          if (!isStatic && !isPlatform) continue;

          const platTop = ot.y + oc.offsetY;
          const platLeft = ot.x + oc.offsetX;
          const platRight = platLeft + oc.width;

          if (feetY >= platTop && feetY <= platTop + 12 &&
              feetRight > platLeft + 2 && feetLeft < platRight - 2) {
            if (pb.vy >= 0) {
              if (plat.oneWayPlatform && pb.vy < 50) continue;
              tf.y = platTop - col.height;
              pb.vy = 0;
              plat.onGround = true;
              plat.jumpsRemaining = plat.maxJumps;
            }
          }
        }

        if (plat.onGround) {
          plat.coyoteTimer = plat.coyoteTime;
        } else {
          if (prevOnGround) plat.coyoteTimer = plat.coyoteTime;
          else plat.coyoteTimer -= dt;
        }
      }
    }
  });

  // ── HealthSystem ─────────────────────────────────────────────────
  LD.Systems.HealthSystem = _register('HealthSystem', class HealthSystem extends LD.System {
    constructor() {
      super([LD.Components.Health]);
      this.priority = 25;
    }
    update(dt, entities) {
      const healthEntities = this.getEntities(entities);
      for (let i = 0; i < healthEntities.length; i++) {
        const e = healthEntities[i];
        const hp = e.getComponent(LD.Components.Health);
        hp.update(dt);
      }
    }
  });

  // ── CameraSystem ─────────────────────────────────────────────────
  LD.Systems.CameraSystem = _register('CameraSystem', class CameraSystem extends LD.System {
    constructor() {
      super([LD.Components.Transform]);
      this.priority = 1;
      this.target = null;
      this.smoothing = 4;
      this.offsetX = 0;
      this.offsetY = 0;
      this.bounds = null;
      this._canvas = null;
    }
    init() {
      this._canvas = LD.getCanvas();
    }
    follow(entity) { this.target = entity; }
    setBounds(x, y, w, h) { this.bounds = { x: x, y: y, w: w, h: h }; }
    update(dt, entities) {
      if (!this.target || !this._canvas) return;
      const tf = this.target.getComponent(LD.Components.Transform);
      if (!tf) return;

      const cw = this._canvas.width;
      const ch = this._canvas.height;
      let camX = tf.x - cw / 2 + this.offsetX;
      let camY = tf.y - ch / 2 + this.offsetY;

      if (this.bounds) {
        camX = Math.max(this.bounds.x, Math.min(this.bounds.x + this.bounds.w - cw, camX));
        camY = Math.max(this.bounds.y, Math.min(this.bounds.y + this.bounds.h - ch, camY));
      }

      LD.emit('camera:update', { x: camX, y: camY, target: this.target });
    }
  });

  // ── PickupSystem ─────────────────────────────────────────────────
  LD.Systems.PickupSystem = _register('PickupSystem', class PickupSystem extends LD.System {
    constructor() {
      super([LD.Components.Transform, LD.Components.Collider]);
      this.priority = 30;
    }
    update(dt, entities) {
      const players = entities.filter(function (e) {
        return e.active && e.hasTag('player') && e.hasComponent(LD.Components.Transform);
      });
      const pickups = entities.filter(function (e) {
        return e.active && e.hasTag('pickup') && e.hasComponent(LD.Components.Collider);
      });

      for (let i = 0; i < players.length; i++) {
        const p = players[i];
        const pt = p.getComponent(LD.Components.Transform);
        const pc = p.getComponent(LD.Components.Collider);
        if (!pt || !pc) continue;
        const pBounds = pc.getBounds(pt);

        for (let j = 0; j < pickups.length; j++) {
          const pick = pickups[j];
          const ktf = pick.getComponent(LD.Components.Transform);
          const kcol = pick.getComponent(LD.Components.Collider);
          const kBounds = kcol.getBounds(ktf);

          if (LD.Physics.aabbOverlap(pBounds, kBounds)) {
            const hp = pick.getComponent(LD.Components.HealthPickup);
            if (hp && !hp.pickedUp) {
              const ph = p.getComponent(LD.Components.Health);
              if (ph) ph.heal(hp.healAmount);
              hp.pickedUp = true;
              LD.emit('pickup:collected', { player: p, pickup: pick });
              if (hp.destroyOnPickup) {
                pick.active = false;
              }
            }

            const inv = pick.getComponent(LD.Components.Inventory);
            if (inv) {
              const pinv = p.getComponent(LD.Components.Inventory);
              if (pinv && !pinv.isFull()) {
                pinv.addItem(inv.items[0] || { name: 'item' });
                pick.active = false;
                LD.emit('pickup:collected', { player: p, pickup: pick });
              }
            }
          }
        }
      }
    }
  });

  // ── CooldownSystem ────────────────────────────────────────────────
  LD.Systems.CooldownSystem = _register('CooldownSystem', class CooldownSystem extends LD.System {
    constructor() {
      super([LD.Components.Cooldown]);
      this.priority = 7;
    }
    update(dt, entities) {
      const cooldownEntities = this.getEntities(entities);
      for (let i = 0; i < cooldownEntities.length; i++) {
        cooldownEntities[i].getComponent(LD.Components.Cooldown).update(dt);
      }
    }
  });

  // ── TrailSystem ──────────────────────────────────────────────────
  LD.Systems.TrailSystem = _register('TrailSystem', class TrailSystem extends LD.System {
    constructor() {
      super([LD.Components.Transform, LD.Components.Trail]);
      this.priority = 84;
    }
    update(dt, entities) {
      const trailEntities = this.getEntities(entities);
      for (let i = 0; i < trailEntities.length; i++) {
        const e = trailEntities[i];
        const tf = e.getComponent(LD.Components.Transform);
        const tr = e.getComponent(LD.Components.Trail);
        if (tr.active) {
          tr.update(dt, tf.x + tf.width / 2, tf.y + tf.height / 2);
        }
      }
    }
    render(ctx, entities) {
      const trailEntities = this.getEntities(entities);
      for (let i = 0; i < trailEntities.length; i++) {
        const e = trailEntities[i];
        const tr = e.getComponent(LD.Components.Trail);
        const points = tr.points;
        if (points.length < 2) continue;
        for (let j = 0; j < points.length; j++) {
          const p = points[j];
          const alpha = (p.life / p.maxLife) * tr.opacity;
          const sz = tr.width * (p.life / p.maxLife);
          if (tr.endColor) {
            ctx.fillStyle = _lerpColor(tr.color || '#ffffff', tr.endColor, 1 - p.life / p.maxLife);
          } else {
            ctx.fillStyle = tr.color || '#ffffff';
          }
          ctx.globalAlpha = alpha;
          ctx.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
        }
        ctx.globalAlpha = 1;
      }
    }
  });

  // ── DelayedActionSystem ──────────────────────────────────────────
  LD.Systems.DelayedActionSystem = _register('DelayedActionSystem', class DelayedActionSystem extends LD.System {
    constructor() {
      super([LD.Components.DelayedAction]);
      this.priority = 4;
    }
    update(dt, entities) {
      const actionEntities = this.getEntities(entities);
      for (let i = 0; i < actionEntities.length; i++) {
        actionEntities[i].getComponent(LD.Components.DelayedAction).update(dt);
      }
    }
  });

  // ── WeaponSystem ─────────────────────────────────────────────────
  LD.Systems.WeaponSystem = _register('WeaponSystem', class WeaponSystem extends LD.System {
    constructor() {
      super([LD.Components.Transform, LD.Components.Weapon]);
      this.priority = 28;
    }
    update(dt, entities) {
      const armed = this.getEntities(entities);

      for (let i = 0; i < armed.length; i++) {
        const e = armed[i];
        const wpn = e.getComponent(LD.Components.Weapon);
        wpn.update(dt);

        if (wpn.attacking) {
          const tf = e.getComponent(LD.Components.Transform);
          const targets = entities.filter(function (t) {
            if (t === e || !t.active) return false;
            const tc = t.getComponent(LD.Components.Collider);
            if (!tc) return false;
            const tt = t.getComponent(LD.Components.Transform);
            if (!tt) return false;

            if (e.hasTag('player') && t.hasTag('enemy')) return true;
            if (e.hasTag('enemy') && t.hasTag('player')) return true;
            return false;
          });

          for (let j = 0; j < targets.length; j++) {
            const target = targets[j];
            const ttf = target.getComponent(LD.Components.Transform);
            const dx = ttf.x - tf.x;
            const dy = ttf.y - tf.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= wpn.range) {
              const thp = target.getComponent(LD.Components.Health);
              if (thp && !thp.invulnerable) {
                const dealt = thp.takeDamage(wpn.damage);
                if (dealt) {
                  LD.emit('weapon:hit', { attacker: e, target: target, damage: wpn.damage });
                }
              }
            }
          }
        }
      }
    }
  });

})();
