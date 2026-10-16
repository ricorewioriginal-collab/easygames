#!/usr/bin/env node
'use strict';
// Prüft Radio Maze 3D ohne Browser: Labyrinth, Original-Regeln, Geister-KI und komplette Level per Bot.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const L=require('../radio-maze/logic.js');
const repo=path.resolve(__dirname,'..');
const js=fs.readFileSync(path.join(repo,'radio-maze/game.js'),'utf8');
const html=fs.readFileSync(path.join(repo,'radio-maze/index.html'),'utf8');
const catalog=fs.readFileSync(path.join(repo,'games.js'),'utf8');
let seed=12345;const rand=()=>{seed=(Math.imul(seed,1103515245)+12345)>>>0;return seed/4294967296;};

// Labyrinth wie am Automaten
assert.equal(L.MAZE.length,31);for(const row of L.MAZE)assert.equal(row.length,28,'Zeilenlänge 28');
assert.equal(L.ALL_DOTS.length,240,'240 Frequenzpunkte');assert.equal(L.ALL_POWER.length,4,'4 Verstärker');
assert(L.walkable(-1,14)&&L.walkable(28,14),'Tunnel an beiden Seiten');
assert(!L.walkable(13,12)&&!L.walkable(14,12),'Tür ist für normale Wege gesperrt');
const seen=new Set(['13,23']),queue=[[13,23]];
while(queue.length){const [x,z]=queue.shift();for(const d of L.DIRS){let nx=x+d.x,nz=z+d.z;if(nx<-1)nx=28;if(nx>28)nx=-1;const k=nx+','+nz;if(!seen.has(k)&&L.walkable(nx,nz)){seen.add(k);queue.push([nx,nz]);}}}
for(const k of [...L.ALL_DOTS,...L.ALL_POWER])assert(seen.has(k),'Punkt erreichbar '+k);
for(const k of seen){const [x,z]=k.split(',').map(Number);assert(!L.inHouse(x,z),'Geisterhaus nur durch die Tür');}

// Schwierigkeit nach Original-Tabelle
for(let lv=1;lv<=60;lv++){const s=L.levelSpec(lv);for(const k of ['pac','ghost','tunnel','ghostFright'])assert(s[k]>0&&s[k]<=1,'Tempo '+k);assert(s.fright>=0&&s.modes.length===8);}
assert.equal(L.levelSpec(1).fright,6);assert.equal(L.levelSpec(17).fright,0);assert.equal(L.levelSpec(60).bonus,7);

// Zielverhalten der vier Störsender
{const g=L.createGame(1,{});g.modeIndex=1;g.pac.px=10;g.pac.pz=5;g.pac.dir=0;
 assert.deepEqual(L.ghostTarget(g,g.ghosts[0]),{x:10,z:5},'Rauschi jagt direkt');
 assert.deepEqual(L.ghostTarget(g,g.ghosts[1]),{x:6,z:1},'Pfeifi zielt 4 Felder voraus (mit Original-Versatz nach oben)');
 g.ghosts[0].px=12;g.ghosts[0].pz=5;
 assert.deepEqual(L.ghostTarget(g,g.ghosts[2]),{x:4,z:1},'Knacki spiegelt über Rauschi');
 g.ghosts[3].px=11;g.ghosts[3].pz=5;assert.deepEqual(L.ghostTarget(g,g.ghosts[3]),g.ghosts[3].scatter,'Brummi wird nah scheu');
 g.modeIndex=0;assert.deepEqual(L.ghostTarget(g,g.ghosts[1]),g.ghosts[1].scatter,'Streumodus');}

function sane(g){
 for(const e of [g.pac,...g.ghosts]){assert(Number.isFinite(e.px)&&Number.isFinite(e.pz),'Position gültig');}
 assert(L.walkable(Math.round(g.pac.px),Math.round(g.pac.pz)),'Spieler nie in der Wand');
 for(const gh of g.ghosts)if(gh.state==='active'||gh.state==='eaten')assert(L.walkable(Math.round(gh.px),Math.round(gh.pz))||Math.round(gh.pz)===11,'Geist nie in der Wand');
}
// Bot: folgt einem Abstandsfeld zu den restlichen Punkten, ohne mitten im Gang umzudrehen.
function botDir(g,brave){
 const wrap=x=>x<-1?28:x>28?-1:x, dist=new Map(), q=[];
 for(const k of [...g.dots,...g.power]){dist.set(k,0);q.push(k);}
 const danger=new Set();
 if(!brave)for(const gh of g.ghosts)if(gh.state==='active'&&!gh.fright){const x0=Math.round(gh.px),z0=Math.round(gh.pz);for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++)if(Math.abs(dx)+Math.abs(dz)<=2)danger.add((x0+dx)+','+(z0+dz));}
 for(let h=0;h<q.length;h++){const [x,z]=q[h].split(',').map(Number);for(const d of L.DIRS){const nx=wrap(x+d.x),nz=z+d.z,nk=nx+','+nz;if(!dist.has(nk)&&L.walkable(nx,nz)){dist.set(nk,dist.get(q[h])+1);q.push(nk);}}}
 const p=g.pac, x=p.moving?p.tx:Math.round(p.px), z=p.moving?p.tz:Math.round(p.pz);
 let best=p.dir,bestD=Infinity;
 L.DIRS.forEach((d,i)=>{
  if(p.moving&&i===L.OPP[p.dir])return;
  const nx=wrap(x+d.x),nz=z+d.z,nk=nx+','+nz;if(!L.walkable(nx,nz))return;
  const v=(dist.get(nk)??999)+(danger.has(nk)?500:0);if(v<bestD){bestD=v;best=i;}
 });
 // Gefahr direkt voraus: umdrehen.
 if(p.moving&&!brave&&danger.has(x+','+z))return L.OPP[p.dir];
 return best;
}
const stats=[];
for(const lv of [1,2,5,13,21,60]){
 const g=L.createGame(lv,{lives:3});let t=0,ev={};
 while(g.phase!=='done'&&g.phase!=='over'&&t<3000){
  if(g.phase==='play')L.steer(g,botDir(g,true));
  for(const e of L.step(g,1/60,rand))ev[e.type]=(ev[e.type]||0)+1;
  if(g.phase==='dying')g.phase='play'; // Bot ist unverwundbar; geprüft wird, dass jedes Level fertig wird
  t+=1/60;sane(g);
 }
 assert.equal(g.phase,'done','Level '+lv+' per Bot abschließbar');
 assert.equal(ev.dot,240,'alle Punkte gegessen');assert.equal(ev.power,4);
 assert.equal(g.ghosts.filter(x=>x.state==='house').length<4,true);
 stats.push('L'+lv+' '+Math.round(t)+'s');
}
// Normaler Ablauf: Treffer kosten Leben, danach Game Over.
{const g=L.createGame(1,{});let t=0,deaths=0;while(g.phase!=='over'&&t<600){if(rand()<.03)L.steer(g,Math.floor(rand()*4));for(const e of L.step(g,1/60,rand))if(e.type==='death')deaths++;t+=1/60;sane(g);}
 assert.equal(g.phase,'over','Game Over nach allen Leben');assert.equal(deaths,3);}
// Gefangener Geist kehrt als Augenpaar zurück und startet neu.
{const g=L.createGame(1,{});g.phase='play';g.phaseTime=0;
 const gh=g.ghosts[0];gh.fright=true;g.frightTime=6;g.pac.px=gh.px=6;g.pac.pz=gh.pz=5;g.pac.tx=5;g.pac.tz=5;gh.tx=7;gh.tz=5;gh.dir=1;
 let ev=L.step(g,1/60,rand);assert(ev.some(e=>e.type==='ghost'&&e.points===200),'Geist gefangen: 200');
 let t=0,back=false;while(t<30){L.step(g,1/60,rand);t+=1/60;if(g.phase==='dying')g.phase='play';if(gh.state==='leaving')back=true;if(back&&gh.state==='active')break;}
 assert(back&&gh.state==='active','Augen kehren ins Haus zurück und der Geist kommt wieder');}
// Bonus-Senderlogo nach 70 Punkten, einsammelbar für die Punkte der Original-Tabelle.
{const g=L.createGame(3,{eaten:L.ALL_DOTS.slice(0,69)});g.phase='play';g.phaseTime=0;const k=L.ALL_DOTS[69],[x,z]=k.split(',').map(Number);
 g.pac.px=g.pac.tx=x;g.pac.pz=g.pac.tz=z;g.pac.moving=true;let ev=L.step(g,1/60,rand);
 assert(ev.some(e=>e.type==='fruitShow')&&g.fruit&&g.fruit.points===500,'Logo erscheint mit 500 Punkten in Level 3');
 Object.assign(g.pac,{px:11,pz:17,tx:12,tz:17,dir:1,want:1,moving:true});for(const gh of g.ghosts)gh.state='house';
 let got=false;for(let i=0;i<60&&!got;i++)got=L.step(g,1/60,rand).some(e=>e.type==='fruit');assert(got&&!g.fruit,'Logo eingesammelt');}
// Fortsetzen mit gespeicherten Punkten
{const g=L.createGame(3,{eaten:L.ALL_DOTS.slice(0,100),score:1234,lives:2});assert.equal(L.remaining(g),144);assert.equal(g.score,1234);assert.equal(g.fruitsSpawned,1);}
// Extraleben
{const g=L.createGame(1,{score:9995});g.phase='play';g.phaseTime=0;g.pac.px=g.pac.tx=1;g.pac.pz=g.pac.tz=5;g.pac.dir=1;g.pac.moving=false;g.pac.want=1;
 let t=0;while(g.score<10000&&t<3){L.step(g,1/60,rand);t+=1/60;}assert.equal(g.lives,4,'Extraleben bei 10.000');}

assert(catalog.includes("id: 'radio-maze'"),'Katalogeintrag fehlt');
assert(html.includes('data-game="radio-maze"') && html.includes('data-prefix="easygames.radio-maze.v1"'),'Cloud-Datenzuordnung fehlt');
for(const id of ['loading','menu','picker','cloudMount','hud','pad','pauseBtn','fullBtn','camBtn','ready','levelGrid'])assert(html.includes('id="'+id+'"'),'UI-Element '+id+' fehlt');
for(const m of js.matchAll(/\$\('([A-Za-z]+)'\)/g))assert(html.includes('id="'+m[1]+'"')||m[1]==='retry','game.js nutzt fehlendes Element #'+m[1]);
new Function(js); // überprüft JavaScript-Syntax ohne Browser-Abhängigkeit
console.log('Radio Maze OK: Original-Labyrinth (240+4), Geister-KI, Extraleben, Fortsetzen; Bot-Läufe '+stats.join(' · '));
