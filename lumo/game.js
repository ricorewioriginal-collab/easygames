'use strict';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d'),panel=document.getElementById('panel'),hud=document.getElementById('hud');
const TOTAL_LEVELS=20, SAVE_KEY='easygames.lumo.v1';
const names=['Sonnenwiese','Bernsteinhöhen','Abendwind','Sternengipfel'],skies=['#83d4e1','#efbb91','#9c9bda','#425b91'];
let level=0,score=0,deaths=0,active=false,done=false,platforms=[],gems=[],enemies=[],p,cam=0,t=0,coyote=0,buffer=0,checkpoint=40,shield=0;
const keys={left:false,right:false,jump:false};
function load(){platforms=[];gems=[];enemies=[];checkpoint=40;cam=0;let x=0;
const difficulty=level/19, count=9+Math.floor(level/5);
for(let i=0;i<count;i++){
const w=i===0?340:Math.round(240-difficulty*66);
const wave=(i+Math.floor(level/4))%3;
const y=i===0?300:300-(wave===1?Math.round(25+difficulty*24):0);
platforms.push({x,y,w,h:360-y});
if(i>0){for(let j=0;j<3;j++)gems.push({x:x+45+j*40,y:y-46,w:12,h:16});
if(i%2===0||level>=10)enemies.push({x:x+w*.6,y:y-20,w:24,h:20,min:x+20,max:x+w-44,v:35+difficulty*36});}
x+=w+Math.round(45+difficulty*48);}
respawn();done=false;}
function checkpointPlatform(){return platforms[Math.floor(platforms.length/2)];}
function save(){
try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:1,level,score,deaths,done,checkpoint:checkpoint>40,gems:gems.map(g=>!!g.got),enemies:enemies.map(e=>!!e.dead)}));
document.getElementById('saveStatus').textContent='Fortschritt auf diesem Gerät gespeichert. Mit Google auch geräteübergreifend.';}
catch(e){document.getElementById('saveStatus').textContent='Speichern auf diesem Gerät nicht verfügbar.';}
}
function restore(){
try{
const s=JSON.parse(localStorage.getItem(SAVE_KEY));
if(!s||s.version!==1||!Number.isInteger(s.level)||s.level<0||s.level>=TOTAL_LEVELS||!Number.isSafeInteger(s.score)||s.score<0||!Number.isSafeInteger(s.deaths)||s.deaths<0)return;
level=s.level;score=s.score;deaths=s.deaths;load();
if(s.checkpoint===true)checkpoint=checkpointPlatform().x+25;
gems.forEach((g,i)=>g.got=Array.isArray(s.gems)&&s.gems[i]===true);
enemies.forEach((e,i)=>e.dead=Array.isArray(s.enemies)&&s.enemies[i]===true);
done=s.done===true&&level===TOTAL_LEVELS-1;respawn();cam=Math.max(0,p.x-180);
show(done?'Wolkenpfad geschafft!':'Willkommen zurück!',done?'Alle 20 Tore sind offen. '+score+' Kristalle gesammelt.':'Weiter bei Level '+(level+1)+' – '+names[Math.floor(level/5)]+'. Dein Checkpoint und deine Kristalle sind gespeichert.',done?'Noch einmal spielen':'Weiterspielen →');
}catch(e){}
}
function respawn(){let s=platforms.find(q=>checkpoint>=q.x&&checkpoint<q.x+q.w)||platforms[0];p={x:checkpoint,y:s.y-32,w:22,h:30,vx:0,vy:0,face:1};coyote=0;buffer=0;shield=1.5;}
function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function clear(){Object.keys(keys).forEach(k=>keys[k]=false);buffer=0;}
function show(title,message,label){active=false;clear();panel.style.display='grid';document.getElementById('title').textContent=title;document.getElementById('message').textContent=message;document.getElementById('start').textContent=label;}
document.getElementById('start').onclick=()=>{if(done){level=0;score=0;deaths=0;load();save();}active=true;panel.style.display='none';};
function pause(){if(active)show('Verschnaufpause','Dein Abenteuer wartet auf dich.','Weiter →');}
document.getElementById('pause').onclick=pause;
addEventListener('blur',()=>{clear();pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden){clear();pause();}});
const map={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',KeyW:'jump',Space:'jump'};
addEventListener('keydown',e=>{if(map[e.code]){e.preventDefault();if(map[e.code]==='jump'&&!keys.jump)buffer=.13;keys[map[e.code]]=true;}if(e.code==='Escape')pause();});
addEventListener('keyup',e=>{if(map[e.code]){e.preventDefault();keys[map[e.code]]=false;}});
document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys[b.dataset.key]=true;if(b.dataset.key==='jump')buffer=.13;});for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>keys[b.dataset.key]=false);});
function update(dt){if(!active)return;t+=dt;shield=Math.max(0,shield-dt);buffer-=dt;coyote-=dt;let old=p.y;
p.vx=((keys.right?1:0)-(keys.left?1:0))*185;if(p.vx)p.face=Math.sign(p.vx);
if(buffer>0&&coyote>0){p.vy=-430;buffer=0;coyote=0;}
p.vy+=1050*dt;p.x=Math.max(0,p.x+p.vx*dt);p.y+=p.vy*dt;
for(const q of platforms){if(p.x+p.w>q.x&&p.x<q.x+q.w&&old+p.h<=q.y+1&&p.y+p.h>=q.y&&p.vy>=0){p.y=q.y-p.h;p.vy=0;coyote=.1;if(q===checkpointPlatform()&&checkpoint===40){checkpoint=q.x+25;save();}}}
for(const g of gems)if(!g.got&&overlap(p,g)){g.got=true;score++;save();}
for(const e of enemies){if(e.dead)continue;e.x+=e.v*dt;if(e.x<e.min||e.x>e.max){e.x=Math.max(e.min,Math.min(e.max,e.x));e.v=-e.v;}
if(overlap(p,e)){if(p.vy>0&&old+p.h<=e.y+8){e.dead=true;p.vy=-300;save();}else if(shield===0){deaths++;respawn();save();return;}}}
if(p.y>400){deaths++;respawn();save();return;}
const last=platforms[platforms.length-1];if(p.x>last.x+last.w-65){if(level===TOTAL_LEVELS-1){done=true;save();show('Wolkenpfad geschafft!','Alle 20 Tore sind offen. '+score+' Kristalle gesammelt · '+deaths+' Neustarts.','Noch einmal spielen');}else{level++;load();save();return;}}
cam=Math.max(0,Math.min(p.x-180,last.x+last.w-640));
}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
function draw(){rect(0,0,640,360,skies[Math.floor(level/5)]);rect(480,35,42,42,'#fff0bc');for(let i=0;i<8;i++){let x=((i*155-cam*.2)%850+850)%850-100;rect(x,65+i%3*22,66,14,'#e8f7ed');rect(x+12,55+i%3*22,38,14,'#e8f7ed');}
for(let i=0;i<12;i++){let x=i*100-cam*.35%100;ctx.fillStyle=level>=10?'#707eac':'#65b7ae';ctx.beginPath();ctx.moveTo(x-100,310);ctx.lineTo(x,155+i%3*20);ctx.lineTo(x+110,310);ctx.fill();}
ctx.save();ctx.translate(-Math.round(cam),0);
for(const q of platforms){rect(q.x,q.y,q.w,q.h,'#795c68');rect(q.x,q.y,q.w,10,'#64c698');rect(q.x,q.y,q.w,4,'#b7ed97');for(let x=q.x+8;x<q.x+q.w-8;x+=24)rect(x,q.y+24,10,6,'#a37b7b');}
for(const g of gems)if(!g.got){let y=g.y+Math.sin(t*4+g.x)*3;ctx.fillStyle='#ffec8b';ctx.beginPath();ctx.moveTo(g.x+6,y);ctx.lineTo(g.x+12,y+8);ctx.lineTo(g.x+6,y+16);ctx.lineTo(g.x,y+8);ctx.fill();rect(g.x+4,y+4,3,7,'#fffde3');}
for(const e of enemies)if(!e.dead){rect(e.x,e.y+7,24,13,'#623d72');rect(e.x+3,e.y,18,15,'#ba76a5');rect(e.x+4,e.y+5,5,5,'#fff0dd');rect(e.x+15,e.y+5,5,5,'#fff0dd');rect(e.x+6,e.y+7,2,3,'#26304b');rect(e.x+16,e.y+7,2,3,'#26304b');}
const cp=checkpointPlatform();rect(cp.x+25,cp.y-48,3,48,'#fff2d5');rect(cp.x+28,cp.y-48,23,15,checkpoint>40?'#ffdf83':'#92ccde');
const last=platforms[platforms.length-1],gx=last.x+last.w-55;rect(gx,last.y-65,38,65,'#f8e1a6');rect(gx+7,last.y-56,24,56,'#527a9d');rect(gx+13,last.y-49,12,49,'#a2f0d5');
// Original Lumo sprite: turquoise hood, amber scarf, dark boots.
let x=Math.round(p.x-3),y=Math.round(p.y-4),step=p.vx&&p.vy===0?Math.sin(t*18)*2:0;
rect(x+5,y,20,5,'#254a61');rect(x+2,y+5,26,17,'#287c83');rect(x+5,y+4,18,5,'#63cfba');rect(x+8,y+10,16,12,'#ffe0b1');rect(x+(p.face>0?19:10),y+12,3,5,'#243449');rect(x+11,y+20,15,5,'#ffc96a');rect(x+(p.face>0?-4:23),y+22,11,4,'#ecaa54');rect(x+7,y+25,17,7,'#388d91');rect(x+4,y+25,5,7,'#ffe0b1');rect(x+7,y+32+step,7,4,'#263d56');rect(x+18,y+32-step,8,4,'#263d56');
ctx.restore();hud.textContent=(level+1)+'/20 '+names[Math.floor(level/5)]+' · ◆ '+score;
}
let prev=0,acc=0;function frame(now){acc+=Math.min((now-prev)/1000,.05);prev=now;while(acc>=1/120){update(1/120);acc-=1/120;}draw();requestAnimationFrame(frame);}load();restore();requestAnimationFrame(frame);

document.getElementById('cloudDetails').addEventListener('toggle',function(){if(this.open)pause();});
