const vm=require('vm'),fs=require('fs'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../lumo/game.js'),'utf8');
function boot(value){
 const storage=new Map(value?[['easygames.lumo.v1',value]]:[]),els={},sounds=[],classes=new Set();let writes=0;
 const el=()=>({style:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},addEventListener(){},getContext:()=>new Proxy({},{get:()=>()=>{}})});
 const c={window:{LumoAudio:{unlock(){},play:s=>sounds.push(s),tick(){},toggle(){},isMuted:()=>false}},document:{body:{classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)}},getElementById:id=>els[id]??=el(),querySelectorAll:()=>[],addEventListener(){}},addEventListener(){},requestAnimationFrame(){},Math,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>{writes++;storage.set(k,v)}}};
 vm.createContext(c);vm.runInContext(source,c);return{run:s=>vm.runInContext(s,c),storage,writes:()=>writes,els,sounds,classes};
}
let b=boot();assert.equal(b.writes(),0);assert(!b.run('active'));assert.match(b.els.title.textContent,/Level 1/);
b.els.start.onclick();b.run('for(let i=0;i<120;i++)update(1/120)');assert(Math.abs(b.run('elapsed')-1)<.001);
b.run('pause();update(1)');assert(Math.abs(b.run('elapsed')-1)<.001);b.els.start.onclick();
b.run('p.x=174;p.y=270;coyote=.1;buffer=.13;for(let i=0;i<45;i++)update(1/120)');assert.equal(b.run('coins'),1);assert(b.sounds.includes('block'));assert(b.run('particles.length>0'));
b.run('hitBlock(blocks[0])');assert.equal(b.run('coins'),1);assert(b.sounds.includes('bump'));
const layouts=new Set(),kinds=new Set(),hazards=new Set();
for(let l=0;l<20;l++){
 b.run('level='+l+';load();active=true;enemies=[];');
 layouts.add(b.run('JSON.stringify(platforms)'));JSON.parse(b.run('JSON.stringify(obstacles.map(o=>o.kind))')).forEach(k=>hazards.add(k));
 const count=b.run('platforms.length');
 for(let i=0;i<count-1;i++){
 b.run(`p.x=platforms[${i}].x+platforms[${i}].w-23;p.y=platforms[${i}].y-p.h;p.vy=0;coyote=.1;buffer=.13;keys.right=true;`);
 let landed=false;
 for(let t=0;t<120;t++){b.run(`if(p.x>=platforms[${i+1}].x+8)keys.right=false;update(1/120)`);if(b.run(`(coyote>0||p.vy===-510)&&p.x+p.w>platforms[${i+1}].x&&p.x<platforms[${i+1}].x+platforms[${i+1}].w`)){landed=true;break;}}
 assert(landed,'gap '+l+'/'+i);
 }
 b.run('keys.right=false');
 for(let i=0;i<b.run('obstacles.length');i++){
 b.run(`var o=obstacles[${i}];p.x=o.x-57;p.y=o.y+o.h-p.h;p.vy=0;keys.right=true;coyote=.1;buffer=.13;shield=0;`);
 for(let n=0;n<100;n++)b.run('update(1/120)');
 assert(b.run('p.x>=o.x+o.w&&deathTimer===0'),'obstacle '+l+'/'+i);
 }
 b.run('keys.right=false;elapsed=30;var q=platforms.at(-1);p.x=q.x+q.w-60;p.y=q.y-p.h;p.vy=0;active=true;update(1/120)');
 assert.equal(b.run('pending'),'level');assert(!b.run('active'));assert(b.run('bests[level]>30'));assert(b.classes.has('celebrate'));
 // Completed level survives reload without replaying rewards.
 const restored=boot(b.storage.get('easygames.lumo.v1'));assert.equal(restored.run('pending'),'level');
 b.els.start.onclick();
 if((l+1)%5===0){assert(b.run('!!bonus'));b.els.start.onclick();b.run('bonus.remaining=.001;update(1/120)');assert.equal(b.run('pending'),'bonus');assert(!b.run('active'));b.els.start.onclick();}
 assert.equal(b.run('level'),Math.min(l+1,19));assert.equal(b.run('done'),l===19);b.run('draw()');
 b.run('load()');JSON.parse(b.run('JSON.stringify(enemies.map(e=>e.kind))')).forEach(k=>kinds.add(k));
}
assert.equal(layouts.size,20);assert.equal(hazards.size,5);assert.equal(kinds.size,4);
// Game Over must reset the *entire* attempt, including items, enemies and position.
b=boot();assert.match(b.els.start.textContent,/START GAME/);b.els.start.onclick();
b.run('hitBlock(blocks[0]);gems[0].got=true;score++;enemies[0].dead=true;shield=0;die("Erwischt")');
assert.equal(b.run('deaths'),1);assert(b.sounds.includes('death'));assert.equal(b.run('coins'),0);assert.equal(b.run('score'),0);
b.run('for(let i=0;i<120;i++)update(1/120)');
assert.equal(b.run('pending'),'gameover');assert(!b.run('active'));assert.match(b.els.title.textContent,/GAME OVER/);
assert.equal(b.run('p.x'),40);assert(!b.run('gems[0].got'));assert(!b.run('blocks[0].used'));assert(!b.run('enemies[0].dead'));
let over=boot(b.storage.get('easygames.lumo.v1'));assert.equal(over.run('pending'),'gameover');assert.equal(over.run('coins'),0);
over.els.start.onclick();assert(over.run('active'));assert.equal(over.run('pending'),null);
over.run('p.y=450;update(1/120);for(let i=0;i<120;i++)update(1/120)');assert.equal(over.run('pending'),'gameover');assert.equal(over.run('deaths'),2);
over.els.start.onclick();over.run("level=3;load();active=true;shield=0;var o=obstacles.find(o=>o.kind==='spikes');p.x=o.x+3;p.y=o.y;p.vy=0;update(1/120)");
assert(over.run('deathTimer>0'));over.run('for(let i=0;i<120;i++)update(1/120)');assert.equal(over.run('pending'),'gameover');
over.els.start.onclick();over.run('bests[level]=22;elapsed=limit()-.001;update(1/120);for(let i=0;i<120;i++)update(1/120)');
assert.equal(over.run('elapsed'),0);assert.equal(over.run('bests[level]'),22);assert.equal(over.run('pending'),'gameover');
b=boot();b.els.start.onclick();b.run('hitBlock(blocks[0]);score=2;save();pause()');assert.equal(b.run('coins'),1);
b.els.retry.onclick();assert.equal(b.run('coins'),0);assert.equal(b.run('score'),0);
b.run('active=true;score=3;coins=4;elapsed=20;finishLevel()');assert.equal(b.run('pending'),'level');assert.equal(b.run('bests[level]'),20);
b.els.retry.onclick();assert.equal(b.run('score'),0);assert.equal(b.run('coins'),0);
b.run('level=9;load();enterBonus();active=true;gems[0].got=true;coins=11;bonus.remaining=12.5;save()');
let r=boot(b.storage.get('easygames.lumo.v1'));assert.equal(r.run('bonus.remaining'),12.5);assert.equal(r.run('coins'),11);assert(r.run('gems[0].got'));r.run('update(1)');assert.equal(r.run('bonus.remaining'),12.5);assert.equal(r.writes(),0);
b.run("bonus.remaining=0;pending='bonus';save()");r=boot(b.storage.get('easygames.lumo.v1'));assert.equal(r.run('pending'),'bonus');r.els.start.onclick();assert.equal(r.run('level'),10);
r=boot(JSON.stringify({version:1,level:8,score:45,coins:4,deaths:3,checkpoint:true,gems:[true],blocks:[true],enemies:[]}));
assert.equal(r.run('level'),8);assert.equal(r.run('checkpoint'),40);assert.equal(r.run('attemptBaseScore'),44);
console.log('PASS: all 20 layouts, bonuses, records; GAME OVER, full resets, timeouts and legacy saves.');
