#!/usr/bin/env node
"use strict";
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "examples");
const files = fs.readdirSync(dir).filter(f => f.endsWith(".json") && !f.startsWith("_")).sort();

const stats = [];
for (const f of files) {
  let g;
  try { g = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); }
  catch (e) { console.log(`${f}: PARSE ERROR ${e.message}`); continue; }
  const typeCount = {};
  const compCount = {};
  const propKeys = {};
  const mech = new Set();
  let levels = (g.levels || []).length;
  for (const lvl of (g.levels || [])) {
    for (const e of (lvl.entities || [])) {
      typeCount[e.type] = (typeCount[e.type] || 0) + 1;
      for (const c of (e.components || [])) compCount[c] = (compCount[c] || 0) + 1;
      const p = e.properties || {};
      for (const k of Object.keys(p)) propKeys[k] = (propKeys[k] || 0) + 1;
      if (p.patrolRange !== undefined) mech.add("patrol");
      if (p.axis !== undefined && e.type === "moving_platform") mech.add("moving_platform");
      if (e.type === "hazard" || (e.damage || 0) > 0) mech.add("damage");
      if (e.type === "pickup" || e.type === "collectible") mech.add("pickup");
      if (p.pickupType !== undefined) mech.add(`pickup:${p.pickupType}`);
      if (e.type === "finish") mech.add("finish");
      if (e.type === "checkpoint") mech.add("checkpoint");
      if (e.type === "projectile") mech.add("projectile");
      if ((e.components || []).includes("Weapon")) mech.add("weapon");
      if ((e.components || []).includes("Dialogue")) mech.add("dialogue");
      if ((e.components || []).includes("Inventory")) mech.add("inventory");
      if ((e.components || []).includes("ParticleEmitter")) mech.add("particles");
      if ((e.components || []).includes("Trail")) mech.add("trail");
    }
  }
  stats.push({ file: f, name: g.name, type: g.type, levels, typeCount, compCount, propKeys, mech });
}

// Print per-game summary
for (const s of stats) {
  console.log("=".repeat(80));
  console.log(`${s.file}  "${s.name}" [${s.type}] levels=${s.levels}`);
  console.log(`  entities: ${Object.entries(s.typeCount).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k}:${v}`).join(", ")}`);
  console.log(`  components: ${Object.entries(s.compCount).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k}:${v}`).join(", ")}`);
  const topProps = Object.entries(s.propKeys).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([k,v])=>`${k}:${v}`).join(", ");
  console.log(`  props(top): ${topProps}`);
}

// Similarity matrix: Jaccard on entity-type distributions + genre
console.log("\n" + "=".repeat(80));
console.log("SIMILARITY (Jaccard over entity-type profiles)");
function profile(s) {
  const total = Object.values(s.typeCount).reduce((a,b)=>a+b,0);
  const p = {};
  for (const [k,v] of Object.entries(s.typeCount)) p[k] = v/total;
  return p;
}
const profs = stats.map(profile);
for (let i=0;i<stats.length;i++){
  for (let j=i+1;j<stats.length;j++){
    const keys = new Set([...Object.keys(profs[i]), ...Object.keys(profs[j])]);
    let inter=0, uni=0;
    for (const k of keys){
      const a=profs[i][k]||0, b=profs[j][k]||0;
      inter += Math.min(a,b); uni += Math.max(a,b);
    }
    const sim = inter/uni;
    if (sim > 0.55) console.log(`${Math.round(sim*100)}%  ${stats[i].file} <-> ${stats[j].file}`);
  }
}
