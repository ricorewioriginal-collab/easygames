'use strict';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d'),panel=document.getElementById('panel'),hud=document.getElementById('hud');
const names=['Sonnenwiese','Bernsteinhöhen','Abendwind','Sternengipfel'],skies=['#83d4e1','#efbb91','#9c9bda','#425b91'];
let level=0,score=0,deaths=0,active=false,done=false,platforms=[],gems=[],enemies=[],p,cam=0,t=0,coyote=0,buffer=0,checkpoint=40;
const keys={left:false,right:false,jump:false};
function load(){platforms=[];gems=[];enemies=[];checkpoint=40;let x=0;
for(let i=0;i<9;i++){let w=i===0?340:240-level*22,y=300-(i%3===1?25+level*8:0);platforms.push({x,y,w,h:360-y});if(i>0){for(let j=0;j<3;j++)gems.push({x:x+45+j*40,y:y-46,w:12,h:16});if(i%2===0||level>1)enemies.push({x:x+w*.6,y:y-20,w:24,h:20,min:x+20,max:x+w-44,v:35+level*12});}x+=w+45+level*16;}
respawn();done=false;}
function respawn(){let s=platforms.find(q=>checkpoint>=q.x&&checkpoint<q.x+q.w)||platforms[0];p={x:checkpoint,y:s.y-32,w:22,h:30,vx:0,vy:0,face:1};coyote=0;buffer=0;}
function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function clear(){Object.keys(keys).forEach(k=>keys[k]=false);buffer=0;}
function show(title,message,label){active=false;clear();panel.style.display='grid';document.getElementById('title').textContent=title;document.getElementById('message').textContent=message;document.getElementById('start').textContent=label;}
document.getElementById('start').onclick=()=>{if(done){level=0;score=0;deaths=0;load();}active=true;panel.style.display='none';};
function pause(){if(active)show('Verschnaufpause','Dein Abenteuer wartet auf dich.','Weiter →');}
document.getElementById('pause').onclick=pause;
addEventListener('blur',()=>{clear();pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden){clear();pause();}});
const map={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',KeyW:'jump',Space:'jump'};
addEventListener('keydown',e=>{if(map[e.code]){e.preventDefault();if(map[e.code]==='jump'&&!keys.jump)buffer=.13;keys[map[e.code]]=true;}if(e.code==='Escape')pause();});
addEventListener('keyup',e=>{if(map[e.code]){e.preventDefault();keys[map[e.code]]=false;}});
document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys[b.dataset.key]=true;if(b.dataset.key==='jump')buffer=.13;});for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>keys[b.dataset.key]=false);});
function update(dt){if(!active)return;t+=dt;buffer-=dt;coyote-=dt;let old=p.y;
p.vx=((keys.right?1:0)-(keys.left?1:0))*185;if(p.vx)p.face=Math.sign(p.vx);
if(buffer>0&&coyote>0){p.vy=-430;buffer=0;coyote=0;}
p.vy+=1050*dt;p.x=Math.max(0,p.x+p.vx*dt);p.y+=p.vy*dt;
for(const q of platforms){if(p.x+p.w>q.x&&p.x<q.x+q.w&&old+p.h<=q.y+1&&p.y+p.h>=q.y&&p.vy>=0){p.y=q.y-p.h;p.vy=0;coyote=.1;if(q===platforms[4])checkpoint=q.x+25;}}
for(const g of gems)if(!g.got&&overlap(p,g)){g.got=true;score++;}
for(const e of enemies){if(e.dead)continue;e.x+=e.v*dt;if(e.x<e.min||e.x>e.max){e.x=Math.max(e.min,Math.min(e.max,e.x));e.v=-e.v;}
if(overlap(p,e)){if(p.vy>0&&old+p.h<=e.y+8){e.dead=true;p.vy=-300;}else{deaths++;respawn();return;}}}
if(p.y>400){deaths++;respawn();return;}
const last=platforms[8];if(p.x>last.x+last.w-65){if(level===3){done=true;show('Wolkenpfad geschafft!','Alle vier Tore sind offen. '+score+' Kristalle gesammelt · '+deaths+' Neustarts.','Noch einmal spielen');}else{level++;load();}}
cam=Math.max(0,Math.min(p.x-180,last.x+last.w-640));
}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
function draw(){rect(0,0,640,360,skies[level]);rect(480,35,42,42,'#fff0bc');for(let i=0;i<8;i++){let x=((i*155-cam*.2)%850+850)%850-100;rect(x,65+i%3*22,66,14,'#e8f7ed');rect(x+12,55+i%3*22,38,14,'#e8f7ed');}
for(let i=0;i<12;i++){let x=i*100-cam*.35%100;ctx.fillStyle=level>1?'#707eac':'#65b7ae';ctx.beginPath();ctx.moveTo(x-100,310);ctx.lineTo(x,155+i%3*20);ctx.lineTo(x+110,310);ctx.fill();}
ctx.save();ctx.translate(-Math.round(cam),0);
for(const q of platforms){rect(q.x,q.y,q.w,q.h,'#795c68');rect(q.x,q.y,q.w,10,'#64c698');rect(q.x,q.y,q.w,4,'#b7ed97');for(let x=q.x+8;x<q.x+q.w-8;x+=24)rect(x,q.y+24,10,6,'#a37b7b');}
for(const g of gems)if(!g.got){let y=g.y+Math.sin(t*4+g.x)*3;ctx.fillStyle='#ffec8b';ctx.beginPath();ctx.moveTo(g.x+6,y);ctx.lineTo(g.x+12,y+8);ctx.lineTo(g.x+6,y+16);ctx.lineTo(g.x,y+8);ctx.fill();rect(g.x+4,y+4,3,7,'#fffde3');}
for(const e of enemies)if(!e.dead){rect(e.x,e.y+7,24,13,'#623d72');rect(e.x+3,e.y,18,15,'#ba76a5');rect(e.x+4,e.y+5,5,5,'#fff0dd');rect(e.x+15,e.y+5,5,5,'#fff0dd');rect(e.x+6,e.y+7,2,3,'#26304b');rect(e.x+16,e.y+7,2,3,'#26304b');}
const cp=platforms[4];rect(cp.x+25,cp.y-48,3,48,'#fff2d5');rect(cp.x+28,cp.y-48,23,15,checkpoint>40?'#ffdf83':'#92ccde');
const last=platforms[8],gx=last.x+last.w-55;rect(gx,last.y-65,38,65,'#f8e1a6');rect(gx+7,last.y-56,24,56,'#527a9d');rect(gx+13,last.y-49,12,49,'#a2f0d5');
// Original Lumo sprite: turquoise hood, amber scarf, dark boots.
let x=Math.round(p.x-3),y=Math.round(p.y-4),step=p.vx&&p.vy===0?Math.sin(t*18)*2:0;
rect(x+5,y,20,5,'#254a61');rect(x+2,y+5,26,17,'#287c83');rect(x+5,y+4,18,5,'#63cfba');rect(x+8,y+10,16,12,'#ffe0b1');rect(x+(p.face>0?19:10),y+12,3,5,'#243449');rect(x+11,y+20,15,5,'#ffc96a');rect(x+(p.face>0?-4:23),y+22,11,4,'#ecaa54');rect(x+7,y+25,17,7,'#388d91');rect(x+4,y+25,5,7,'#ffe0b1');rect(x+7,y+32+step,7,4,'#263d56');rect(x+18,y+32-step,8,4,'#263d56');
ctx.restore();hud.textContent=(level+1)+'/4 '+names[level]+' · ◆ '+score;
}
let prev=0,acc=0;function frame(now){acc+=Math.min((now-prev)/1000,.05);prev=now;while(acc>=1/120){update(1/120);acc-=1/120;}draw();requestAnimationFrame(frame);}load();requestAnimationFrame(frame);
