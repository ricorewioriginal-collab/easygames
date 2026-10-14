const vm=require('vm'),fs=require('fs'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../lumo/game.js'),'utf8');
function boot(value){
const storage=new Map(value?[['easygames.lumo.v1',value]]:[]),els={};let writes=0;
const c={document:{body:{classList:{add(){},remove(){}}},getElementById:id=>els[id]??={style:{},addEventListener(){},getContext:()=>new Proxy({},{get:()=>()=>{}})},querySelectorAll:()=>[],addEventListener(){}},addEventListener(){},requestAnimationFrame(){},Math,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>{writes++;storage.set(k,v)}}};vm.createContext(c);vm.runInContext(source,c);return{run:s=>vm.runInContext(s,c),storage,writes:()=>writes,els};
}
let b=boot();assert.equal(b.writes(),0);
b.run('active=true;for(let i=0;i<120;i++)update(1/120)');assert.equal(b.run('p.y'),270);
// Gold block underside, spent block, and shield.
b.run('p.x=174;p.y=270;coyote=.1;buffer=.13;for(let i=0;i<45;i++)update(1/120)');
assert.equal(b.run('coins'),1);assert(b.run('blocks[0].used'));
b.run('hitBlock(blocks[0])');assert.equal(b.run('coins'),1);
b.run("hitBlock(blocks.find(b=>b.kind==='shield'))");assert.equal(b.run('shield'),8);
for(let l=0;l<20;l++){
b.run('level='+l+';load();active=true;enemies=[];');
const count=b.run('platforms.length');
// Gap reachability using full collision system.
for(let i=0;i<count-1;i++){
b.run(`p.x=platforms[${i}].x+platforms[${i}].w-23;p.y=platforms[${i}].y-p.h;p.vy=0;coyote=.1;buffer=.13;keys.right=true;`);
let landed=false;
for(let t=0;t<120;t++){b.run('update(1/120)');if(b.run(`p.vy===0&&p.x+p.w>platforms[${i+1}].x&&p.y+p.h===platforms[${i+1}].y`)){landed=true;break;}}
assert(landed,'gap '+l+'/'+i);
}
b.run('keys.right=false');
// Jump from 35px before each tunnel; must reach its other side.
for(let i=0;i<b.run('obstacles.length');i++){
b.run(`var o=obstacles[${i}];p.x=o.x-57;p.y=o.y+o.h-p.h;p.vy=0;keys.right=true;coyote=.1;buffer=.13;`);
for(let n=0;n<100;n++)b.run('update(1/120)');
assert(b.run('p.x>=o.x+o.w'),'tunnel '+l+'/'+i);
}
b.run('keys.right=false;var q=platforms.at(-1);p.x=q.x+q.w-60;p.y=q.y-p.h;p.vy=0;active=true;update(1/120)');
if((l+1)%5===0){
assert(b.run('!!bonus'));assert(!b.run('active'));
b.els.start.onclick();assert(b.run('active'));b.run('bonus.remaining=.001;update(1/120)');
}
assert.equal(b.run('level'),Math.min(l+1,19));assert.equal(b.run('done'),l===19);
b.run('draw()');
}
// Save/restore bonus; paused clock; one-time coin collection.
b=boot();b.run('level=9;load();enterBonus();active=true;gems[0].got=true;coins=11;bonus.remaining=12.5;save()');
let r=boot(b.storage.get('easygames.lumo.v1'));assert.equal(r.run('bonus.remaining'),12.5);assert.equal(r.run('coins'),11);assert(r.run('gems[0].got'));r.run('update(1)');assert.equal(r.run('bonus.remaining'),12.5);assert.equal(r.writes(),0);
// Prior save compatibility.
r=boot(JSON.stringify({version:1,level:8,score:45,deaths:3,checkpoint:true,gems:[true],enemies:[]}));assert.equal(r.run('level'),8);assert.equal(r.run('coins'),0);assert(r.run('checkpoint>40'));
// Side collision and standing atop a tunnel.
b=boot();b.run('active=true;enemies=[];var o=obstacles[0];p.x=o.x-p.w-1;p.y=o.y+o.h-p.h;keys.right=true;for(let i=0;i<20;i++)update(1/120)');
assert.equal(b.run('p.x+p.w'),b.run('o.x'));
b.run('keys.right=false;p.x=o.x+3;p.y=o.y-p.h-4;p.vy=60;for(let i=0;i<15;i++)update(1/120)');assert.equal(b.run('p.y+p.h'),b.run('o.y'));
console.log('PASS: 20 level layouts, all gaps and tunnels, side/top/head collisions, one-time rewards, shield, four bonus transitions, pause/resume, bonus restore, old saves, rendering.');
