#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const L=require('../radio-maze/logic.js');
const repo=path.resolve(__dirname,'..');
const js=fs.readFileSync(path.join(repo,'radio-maze/game.js'),'utf8');
const html=fs.readFileSync(path.join(repo,'radio-maze/index.html'),'utf8');
const catalog=fs.readFileSync(path.join(repo,'games.js'),'utf8');
let min=Infinity,max=0;
for(let lv=1;lv<=60;lv++) {
 const level=L.createLevel(lv),repeat=L.createLevel(lv);
 const d=L.distanceMap(level.grid,1,1);
 assert.deepEqual(level.grid,repeat.grid,'Level '+lv+' muss reproduzierbar sein');
 assert.equal(level.size%2,1,'Ungerade Kartengröße');
 assert(L.walkable(level.grid,level.start.x,level.start.z),'Startweg begehbar');
 const all=[...level.pellets,...level.power,...level.logos,...level.ghosts];
 assert(all.length>100,'Mehr als 100 begehbare Sammel-/Gegnerfelder');
 assert.equal(new Set(all.map(x=>L.key(x.x,x.z))).size,all.length,'Keine überlappenden Sammelobjekte/Gegner');
 for(const p of all) assert(Number.isFinite(d[p.z][p.x]),'Level '+lv+' isolierte Position '+L.key(p.x,p.z));
 for(let z=0;z<level.size;z++)for(let x=0;x<level.size;x++)if(!level.grid[z][x]) {
   assert(Number.isFinite(d[z][x]),'Level '+lv+' unverbundener Weg '+x+'/'+z);
 }
 for(const g of level.ghosts){
  const dir=L.shortestDirection(level.grid,g.x,g.z,1,1);
  assert(dir>=0 && dir<=3,'Geist findet einen Pfad');
 }
 min=Math.min(min,level.pellets.length);max=Math.max(max,level.pellets.length);
}
assert(catalog.includes("id: 'radio-maze'"),'Katalogeintrag fehlt');
assert(html.includes('data-game="radio-maze"') && html.includes('data-prefix="easygames.radio-maze.v1"'),'Cloud-Datenzuordnung fehlt');
for(const id of ['loading','menu','picker','cloudMount','hud','pad','pauseBtn','fullBtn','levelGrid'])assert(html.includes('id="'+id+'"'),'UI-Element '+id+' fehlt');
new Function(js); // überprüft JavaScript-Syntax ohne Browser-Abhängigkeit
console.log('Radio Maze OK: 60 verbundene und reproduzierbare Level, '+min+'–'+max+' Frequenzpunkte, KI-Wege, Katalog und Cloud.');
