window.ZONES = [];
window.SIM = {
  time: 0, scale: 1,
  ZONES: [],
  money: 0, profitAcc: 0,
  honeyStock: 0, vitaminStock: 0,
  sugarStock: 0, pollenStock: 0,
  nectarTotal: 0, honeyMade: 0, vitaminMade: 0, sugarMade: 0,
  honeySold: 0, vitaminSold: 0,
  beesInFlight: 0, beesHome: 0,
  qualityAvg: 0,
  costEnergy: 0, costCooling: 0, costRobots: 0,
  revenue: 0,
  totalBees: 0,

  FLOWERS: {
    lipa:      { name: 'липа',       q: 0.9,  col: '#d9e56b' },
    grechiha:  { name: 'гречиха',    q: 0.7,  col: '#c97bd9' },
    klever:    { name: 'клевер',     q: 0.8,  col: '#e56bc0' },
    raznotrav: { name: 'разнотравье',q: 0.6,  col: '#7bd97b' },
    malina:    { name: 'малина',     q: 0.85, col: '#e56b6b' }
  },

  P: {
    NECTAR_PER_TRIP: 1.0,
    POLLEN_PER_TRIP: 0.15,
    COLLECT_TIME: 1.2,
    FLOW_CAP: 40,
    TANK_CAP: 400,
    SUGAR_YIELD: 0.9,
    VITAMIN_YIELD: 0.4,
    SUGAR_PER_VIT: 0.5,
    POLLEN_PER_VIT: 0.3,
    PRICE_HONEY: 2.5,
    PRICE_VITAMIN: 8.0,
    MARGIN_HONEY: 1.35,
    MARGIN_VITAMIN: 1.5,
    COST_BEE: 0.04,
    COST_TOWER: 1.5,
    COST_FLOOR: 0.2,
    COST_ROBOT: 0.05,
    COOL_HONEY: 0.005,
    ROBOTS_PER_ZONE: 10
  },

  mkSwarm: function (floor, bees, speed, flowers) {
    return { floor: floor, bees: bees, speed: speed, flowers: flowers };
  },

  build: function () {
    var P = this.P;
    for (var zi = 0; zi < ZONES.length; zi++) {
      var z = ZONES[zi];
      z.valve1 = 0.3;
      z.valve2 = 0.3;
      z.nectarTank = 0;
      z.quality = 0;
      z.qsum = 0;
      z.honeyRate = 0;
      z.vitRate = 0;
      z.sugarRate = 0;
      z.tripRate = 0;
      z.nextReturn = 0;
      z.robots = P.ROBOTS_PER_ZONE;
      z.towerH = z.swarms.length * 3.2 + 3;
      var tpos = [Math.cos(z.ang) * 55, 0, Math.sin(z.ang) * 55];
      z.pos = tpos;
      z.world = [];
      for (var si = 0; si < z.swarms.length; si++) {
        var s = z.swarms[si];
        s.zone = zi;
        var a = z.ang + s.floor * 0.7;
        s.hive = [tpos[0] + Math.cos(a) * 4, 3 + s.floor * 3.2, tpos[2] + Math.sin(a) * 4];
        s.flower = [tpos[0] + Math.cos(a) * 13, 1.0, tpos[2] + Math.sin(a) * 13];
        s.dist = VEC.len(VEC.sub(s.hive, s.flower));
        s.cycle = 2 * s.dist / s.speed + P.COLLECT_TIME;
        var qsum = 0;
        for (var i = 0; i < s.flowers.length; i++) qsum += this.FLOWERS[s.flowers[i]].q;
        s.quality = qsum / s.flowers.length;
        s.tripRate = s.bees / s.cycle;
        s.nectarRate = s.tripRate * P.NECTAR_PER_TRIP;
        z.qsum += s.quality * s.bees;
        z.tripRate += s.tripRate;
        z.world.push(s);
      }
      z.quality = z.qsum / (z.tripRate * z.cycle / z.swarms.length * z.swarms.length) || 0;
      z.quality = 0;
      var nq = 0, nb = 0;
      for (var si = 0; si < z.swarms.length; si++) {
        nq += z.swarms[si].quality * z.swarms[si].bees;
        nb += z.swarms[si].bees;
      }
      z.quality = nb ? nq / nb : 0;
      this.totalBees += nb;
      this.ZONES.push(z);
    }
  },

  nextBeeReturn: function (swarm, t) {
    var u = (t * swarm.speed) % swarm.cycle;
    return swarm.cycle - u;
  },

  beePos: function (swarm, i, t) {
    var phase = (t * swarm.speed + i * swarm.cycle / swarm.bees) % swarm.cycle;
    var frac = phase / swarm.cycle;
    var p;
    if (frac < 0.5) {
      p = VEC.lerp(swarm.hive, swarm.flower, frac * 2);
    } else {
      p = VEC.lerp(swarm.flower, swarm.hive, (frac - 0.5) * 2);
    }
    return { pos: p, returning: frac >= 0.5 };
  },

  update: function (dt) {
    var P = this.P;
    this.time += dt;
    var nectarTotal = 0;
    var honeyPerS = 0, vitPerS = 0, sugarPerS = 0, revPerS = 0;

    for (var zi = 0; zi < this.ZONES.length; zi++) {
      var z = this.ZONES[zi];
      var nectarIn = z.tripRate * P.NECTAR_PER_TRIP;
      z.nectarTank = Math.min(P.TANK_CAP, z.nectarTank + nectarIn * dt);
      nectarTotal += z.nectarTank;

      var flow = Math.min(z.nectarTank, P.FLOW_CAP) * dt;
      z.nectarTank -= flow;
      var toSugar = flow * z.valve1;
      var toHoney = flow * (1 - z.valve1);

      var sugar = toSugar * P.SUGAR_YIELD;
      this.sugarStock += sugar;
      sugarPerS += sugar / (dt || 1);
      z.sugarRate = sugar / (dt || 1);

      var honey = toHoney * z.quality;
      this.honeyStock += honey;
      honeyPerS += honey / (dt || 1);
      z.honeyRate = honey / (dt || 1);

      var toVit = Math.min(this.honeyStock * z.valve2, this.sugarStock / P.SUGAR_PER_VIT, this.pollenStock / P.POLLEN_PER_VIT);
      var vit = toVit * P.VITAMIN_YIELD;
      this.honeyStock -= toVit;
      this.sugarStock -= toVit * P.SUGAR_PER_VIT;
      this.pollenStock -= toVit * P.POLLEN_PER_VIT;
      this.vitaminStock += vit;
      vitPerS += vit / (dt || 1);
      z.vitRate = vit / (dt || 1);

      var honeySell = this.honeyStock;
      this.honeyStock = 0;
      this.honeySold += honeySell;
      revPerS += honeySell / (dt || 1) * P.PRICE_HONEY;

      var vitSell = this.vitaminStock;
      this.vitaminStock = 0;
      this.vitaminSold += vitSell;
      revPerS += vitSell / (dt || 1) * P.PRICE_VITAMIN;

      this.pollenStock = Math.min(200, this.pollenStock + z.tripRate * P.POLLEN_PER_TRIP * dt);
      z.nextReturn = this.nextBeeReturn(z.world[0], this.time);
    }

    var floors = 0;
    for (var zi = 0; zi < this.ZONES.length; zi++) floors += this.ZONES[zi].swarms.length;
    var robots = this.ZONES.length * P.ROBOTS_PER_ZONE;
    this.costEnergy = this.totalBees * P.COST_BEE + this.ZONES.length * P.COST_TOWER + floors * P.COST_FLOOR + robots * P.COST_ROBOT;
    this.costCooling = honeyPerS * P.COOL_HONEY;
    this.costRobots = 0;

    var costPerS = this.costEnergy + this.costCooling;
    this.money += (revPerS - costPerS) * dt;

    this.revenue = revPerS;
    this.profitAcc = revPerS - costPerS;
    this.honeyMade = honeyPerS;
    this.vitaminMade = vitPerS;
    this.sugarMade = sugarPerS;
    this.nectarTotal = nectarTotal;
    this.beesInFlight = this.totalBees;
    this.beesHome = 0;

    var qw = 0, qt = 0;
    for (var zi = 0; zi < this.ZONES.length; zi++) {
      var z = this.ZONES[zi];
      for (var si = 0; si < z.world.length; si++) {
        var s = z.world[si];
        qw += s.quality * s.bees;
        qt += s.bees;
      }
    }
    this.qualityAvg = qt ? qw / qt : 0;
  },

  assertPrices: function () {
    var P = this.P;
    return {
      ok: P.PRICE_HONEY >= P.SUGAR_YIELD * P.MARGIN_HONEY && P.PRICE_VITAMIN >= P.PRICE_HONEY * P.MARGIN_VITAMIN,
      honey: P.PRICE_HONEY,
      vitamin: P.PRICE_VITAMIN
    };
  }
};

window.mkSwarm = function (floor, bees, speed, flowers) {
  return { floor: floor, bees: bees, speed: speed, flowers: flowers };
};
