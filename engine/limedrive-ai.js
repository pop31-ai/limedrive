window.LD = window.LD || {};

(function () {
  'use strict';

  LD.AI = LD.AI || {};

  // ── Difficulty Presets ────────────────────────────────────────────
  const DIFFICULTY = {
    easy: { depth: 0, randomize: true, label: 'Easy' },
    medium: { depth: 2, randomize: false, label: 'Medium' },
    hard: { depth: 4, randomize: false, label: 'Hard' },
    expert: { depth: 6, randomize: false, label: 'Expert' }
  };

  // ── Personality Presets ───────────────────────────────────────────
  const PERSONALITY = {
    aggressive: { aggression: 0.9, defense: 0.2, intelligence: 0.5, label: 'Aggressive' },
    defensive: { aggression: 0.2, defense: 0.9, intelligence: 0.5, label: 'Defensive' },
    balanced: { aggression: 0.5, defense: 0.5, intelligence: 0.5, label: 'Balanced' },
    trickster: { aggression: 0.6, defense: 0.3, intelligence: 0.9, label: 'Trickster' }
  };

  // ── Minimax with Alpha-Beta Pruning ──────────────────────────────
  function _cloneState(state) {
    if (state === null || typeof state !== 'object') return state;
    if (Array.isArray(state)) return state.map(_cloneState);
    const out = {};
    for (const k in state) {
      if (state.hasOwnProperty(k)) out[k] = _cloneState(state[k]);
    }
    return out;
  }

  LD.AI.Minimax = function (state, depth, alpha, beta, maximizingPlayer, evaluator, moveGen, maxDepth) {
    maxDepth = maxDepth || depth;

    if (depth === 0 || !moveGen(state).length) {
      return { score: evaluator(state, maximizingPlayer ? 'max' : 'min'), move: null };
    }

    const moves = moveGen(state);

    if (maximizingPlayer) {
      let bestScore = -Infinity;
      let bestMove = moves[0] || null;
      for (let i = 0; i < moves.length; i++) {
        const child = _applyMove(state, moves[i]);
        const result = LD.AI.Minimax(child, depth - 1, alpha, beta, false, evaluator, moveGen, maxDepth);
        if (result.score > bestScore) {
          bestScore = result.score;
          bestMove = moves[i];
        }
        alpha = Math.max(alpha, bestScore);
        if (beta <= alpha) break;
      }
      return { score: bestScore, move: bestMove };
    } else {
      let bestScore = Infinity;
      let bestMove = moves[0] || null;
      for (let i = 0; i < moves.length; i++) {
        const child = _applyMove(state, moves[i]);
        const result = LD.AI.Minimax(child, depth - 1, alpha, beta, true, evaluator, moveGen, maxDepth);
        if (result.score < bestScore) {
          bestScore = result.score;
          bestMove = moves[i];
        }
        beta = Math.min(beta, bestScore);
        if (beta <= alpha) break;
      }
      return { score: bestScore, move: bestMove };
    }
  };

  function _applyMove(state, move) {
    const s = _cloneState(state);
    if (move && typeof move.apply === 'function') {
      move.apply(s);
    } else if (move && move.target !== undefined && move.value !== undefined) {
      s[move.target] = move.value;
    }
    return s;
  }

  // ── Board Evaluation ─────────────────────────────────────────────
  LD.AI.evaluate = function (state, player) {
    if (!state) return 0;
    let score = 0;

    if (state.health !== undefined && state.maxHealth !== undefined) {
      score += (state.health / state.maxHealth) * 100;
    }

    if (state.entities) {
      for (let i = 0; i < state.entities.length; i++) {
        const e = state.entities[i];
        if (e.isEnemy) {
          score += e.health || 0;
        } else if (e.isPlayer) {
          score -= e.health || 0;
        }
      }
    }

    if (state.threatLevel !== undefined) {
      score -= state.threatLevel * 30;
    }

    if (state.aggression !== undefined) {
      score += state.aggression * 10;
    }

    return player === 'max' ? score : -score;
  };

  // ── Move Generation ──────────────────────────────────────────────
  LD.AI.generateMoves = function (state) {
    const moves = [];
    if (!state || !state.enemies) return moves;

    state.enemies.forEach(function (enemy) {
      moves.push({ type: 'move', entityId: enemy.id, dx: 1, dy: 0, apply: function (s) { enemy.x = (enemy.x || 0) + 1; } });
      moves.push({ type: 'move', entityId: enemy.id, dx: -1, dy: 0, apply: function (s) { enemy.x = (enemy.x || 0) - 1; } });
      moves.push({ type: 'move', entityId: enemy.id, dx: 0, dy: 1, apply: function (s) { enemy.y = (enemy.y || 0) + 1; } });
      moves.push({ type: 'move', entityId: enemy.id, dx: 0, dy: -1, apply: function (s) { enemy.y = (enemy.y || 0) - 1; } });

      if (enemy.canAttack) {
        moves.push({ type: 'attack', entityId: enemy.id, apply: function (s) { /* attack logic */ } });
      }
      if (enemy.canSpecial) {
        moves.push({ type: 'special', entityId: enemy.id, apply: function (s) { /* special logic */ } });
      }
      moves.push({ type: 'defend', entityId: enemy.id, apply: function (s) { /* defend logic */ } });
      moves.push({ type: 'wait', entityId: enemy.id, apply: function (s) { /* wait */ } });
    });

    return moves;
  };

  // ── Get Best Move ────────────────────────────────────────────────
  LD.AI.getBestMove = function (state, difficulty) {
    const diff = DIFFICULTY[difficulty] || DIFFICULTY.medium;

    if (diff.randomize || diff.depth === 0) {
      const moves = LD.AI.generateMoves(state);
      if (!moves.length) return null;
      return moves[Math.floor(Math.random() * moves.length)];
    }

    const result = LD.AI.Minimax(
      state, diff.depth, -Infinity, Infinity, true,
      LD.AI.evaluate, LD.AI.generateMoves, diff.depth
    );
    return result.move;
  };

  // ── Enemy Controller ─────────────────────────────────────────────
  class EnemyController {
    constructor(opts) {
      opts = opts || {};
      this.entity = null;
      this.difficulty = opts.difficulty || 'medium';
      this.personality = PERSONALITY[opts.personality] || PERSONALITY.balanced;
      this.aggression = this.personality.aggression;
      this.defense = this.personality.defense;
      this.intelligence = this.personality.intelligence;
      this.patrolPath = opts.patrolPath || null;
      this.patrolIndex = 0;
      this.patrolWait = 0;
      this.state = 'idle';
      this.stateTimer = 0;
      this.thinkInterval = opts.thinkInterval || 0.5;
      this._thinkTimer = 0;
      this.target = null;
      this.sightRange = opts.sightRange || 300;
      this.attackRange = opts.attackRange || 50;
      this.fleeHealthThreshold = 0.2;
      this._playerPatterns = { moveLeft: 0, moveRight: 0, jump: 0, attack: 0, totalActions: 0 };
      this._lastPlayerPos = null;
    }

    setPersonality(type) {
      const p = PERSONALITY[type] || PERSONALITY.balanced;
      this.aggression = p.aggression;
      this.defense = p.defense;
      this.intelligence = p.intelligence;
    }

    setDifficulty(level) {
      this.difficulty = level;
    }

    trackPlayerAction(action) {
      if (action.type === 'move') {
        if (action.dx < 0) this._playerPatterns.moveLeft++;
        if (action.dx > 0) this._playerPatterns.moveRight++;
      }
      if (action.type === 'jump') this._playerPatterns.jump++;
      if (action.type === 'attack') this._playerPatterns.attack++;
      this._playerPatterns.totalActions++;
    }

    getPlayerTendency() {
      const p = this._playerPatterns;
      if (p.totalActions < 5) return 'unknown';
      const leftRatio = p.moveLeft / p.totalActions;
      const rightRatio = p.moveRight / p.totalActions;
      const jumpRatio = p.jump / p.totalActions;
      const attackRatio = p.attack / p.totalActions;

      if (attackRatio > 0.4) return 'aggressive';
      if (jumpRatio > 0.3) return 'mobile';
      if (leftRatio > 0.4) return 'retreating';
      if (rightRatio > 0.4) return 'advancing';
      return 'balanced';
    }

    _counterStrategy(playerTendency) {
      switch (playerTendency) {
        case 'aggressive':
          return { action: 'defend', boost: this.defense };
        case 'retreating':
          return { action: 'chase', boost: this.aggression };
        case 'advancing':
          return { action: 'ambush', boost: this.intelligence };
        case 'mobile':
          return { action: 'predict', boost: this.intelligence };
        default:
          return { action: 'balanced', boost: 0.5 };
      }
    }

    _decide(playerPos, myState) {
      const dx = playerPos ? playerPos.x - (this.entity.x || 0) : 0;
      const dy = playerPos ? playerPos.y - (this.entity.y || 0) : 0;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const healthRatio = (myState.health || 100) / (myState.maxHealth || 100);

      if (healthRatio < this.fleeHealthThreshold) {
        return { type: 'flee', dx: -dx, dy: -dy };
      }

      if (dist < this.attackRange && Math.random() < this.aggression) {
        return { type: 'attack', dx: dx, dy: dy };
      }

      if (dist > this.sightRange) {
        if (this.patrolPath && this.patrolPath.length > 0) {
          return this._patrolStep();
        }
        return { type: 'idle' };
      }

      const tendency = this.getPlayerTendency();
      const counter = this._counterStrategy(tendency);

      switch (counter.action) {
        case 'chase':
          return { type: 'move', dx: dx > 0 ? 1 : -1, dy: dy > 0 ? 1 : -1 };
        case 'defend':
          return { type: 'defend' };
        case 'ambush':
          return { type: 'position', dx: -Math.sign(dx) * 0.5, dy: 0 };
        case 'predict':
          if (this._lastPlayerPos) {
            const pdx = playerPos.x - this._lastPlayerPos.x;
            return { type: 'move', dx: Math.sign(pdx), dy: 0 };
          }
          return { type: 'move', dx: dx > 0 ? 1 : -1, dy: 0 };
        default:
          return { type: 'move', dx: dx > 0 ? 1 : -1, dy: 0 };
      }
    }

    _patrolStep() {
      if (!this.patrolPath || !this.patrolPath.length) return { type: 'idle' };
      const target = this.patrolPath[this.patrolIndex];
      const dx = target.x - (this.entity.x || 0);
      const dy = target.y - (this.entity.y || 0);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 5) {
        this.patrolWait += 1 / 60;
        if (this.patrolWait > (target.wait || 1)) {
          this.patrolIndex = (this.patrolIndex + 1) % this.patrolPath.length;
          this.patrolWait = 0;
        }
        return { type: 'idle' };
      }

      return { type: 'move', dx: Math.sign(dx), dy: Math.sign(dy) };
    }

    tick(dt, playerPos, myState) {
      this._thinkTimer += dt;
      this.stateTimer += dt;

      if (this._lastPlayerPos && playerPos) {
        this.trackPlayerAction({
          type: 'move',
          dx: playerPos.x - this._lastPlayerPos.x,
          dy: playerPos.y - this._lastPlayerPos.y
        });
      }
      this._lastPlayerPos = playerPos ? { x: playerPos.x, y: playerPos.y } : null;

      if (this._thinkTimer < this.thinkInterval) return null;
      this._thinkTimer = 0;

      const decision = this._decide(playerPos, myState || {});
      this.state = decision.type || 'idle';
      this.emit('ai:decision', { entity: this.entity, decision: decision });
      return decision;
    }
  }

  // Make EnemyController emit events
  const _ecEvents = {};
  EnemyController.prototype.on = function (ev, fn) {
    (_ecEvents[ev] = _ecEvents[ev] || []).push(fn);
  };
  EnemyController.prototype.emit = function (ev, data) {
    const arr = _ecEvents[ev];
    if (arr) arr.forEach(function (fn) { fn(data); });
  };

  // ── AI State Builder (for minimax) ───────────────────────────────
  LD.AI.buildState = function (entities) {
    const state = { enemies: [], player: null, threatLevel: 0 };
    entities.forEach(function (e) {
      if (e.hasTag && e.hasTag('enemy')) {
        const hp = e.getComponent ? e.getComponent(LD.Components.Health) : null;
        const tf = e.getComponent ? e.getComponent(LD.Components.Transform) : null;
        state.enemies.push({
          id: e.id,
          x: tf ? tf.x : 0,
          y: tf ? tf.y : 0,
          health: hp ? hp.current : 100,
          maxHealth: hp ? hp.max : 100,
          canAttack: true,
          canSpecial: false
        });
      }
      if (e.hasTag && e.hasTag('player')) {
        const hp = e.getComponent ? e.getComponent(LD.Components.Health) : null;
        const tf = e.getComponent ? e.getComponent(LD.Components.Transform) : null;
        state.player = {
          x: tf ? tf.x : 0,
          y: tf ? tf.y : 0,
          health: hp ? hp.current : 100,
          maxHealth: hp ? hp.max : 100
        };
      }
    });

    if (state.player && state.enemies.length) {
      state.enemies.forEach(function (e) {
        const dx = state.player.x - e.x;
        const dy = state.player.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) state.threatLevel += (150 - dist) / 150;
      });
    }

    return state;
  };

  // ── AI Tick (global) ─────────────────────────────────────────────
  const _aiControllers = [];

  LD.AI.register = function (controller) {
    if (controller instanceof EnemyController) _aiControllers.push(controller);
  };

  LD.AI.unregister = function (controller) {
    const idx = _aiControllers.indexOf(controller);
    if (idx >= 0) _aiControllers.splice(idx, 1);
  };

  LD.AI.tick = function (dt) {
    const decisions = [];
    for (let i = 0; i < _aiControllers.length; i++) {
      const ctrl = _aiControllers[i];
      const ent = ctrl.entity;
      let playerPos = null;
      let myState = {};

      if (ent && LD.getWorld) {
        const world = LD.getWorld();
        if (world) {
          const players = world.findByTag('player');
          if (players.length) {
            const pt = players[0].getComponent(LD.Components.Transform);
            if (pt) playerPos = { x: pt.x, y: pt.y };
          }
          if (ent.getComponent) {
            const hp = ent.getComponent(LD.Components.Health);
            const tf = ent.getComponent(LD.Components.Transform);
            if (hp) { myState.health = hp.current; myState.maxHealth = hp.max; }
            if (tf) { myState.x = tf.x; myState.y = tf.y; }
          }
        }
      }

      const d = ctrl.tick(dt, playerPos, myState);
      if (d) decisions.push({ controller: ctrl, decision: d });
    }
    return decisions;
  };

  // ── Exports ──────────────────────────────────────────────────────
  LD.AI.EnemyController = EnemyController;
  LD.AI.DIFFICULTY = DIFFICULTY;
  LD.AI.PERSONALITY = PERSONALITY;

})();
