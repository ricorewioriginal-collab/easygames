'use strict';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d'),panel=document.getElementById('panel'),hud=document.getElementById('hud');
const TOTAL_LEVELS=20, SAVE_KEY='easygames.lumo.v1';
const names=['Sonnenwiese','Bernsteinhöhen','Abendwind','Sternengipfel'],skies=['#83d4e1','#efbb91','#9c9bda','#425b91'];
let level=0,score=0,deaths=0,active=false,done=false,platforms=[],gems=[],enemies=[],p,cam=0,t=0,coyote=0,buffer=0,checkpoint=40,shield=0;
let obstacles=[],blocks=[],coins=0,bonus=null,bonusClock=0,effects=[];
const keys={left:false,right:false,jump:false};
function load(){bonus=null;obstacles=[];blocks=[];effects=[];platforms=[];gems=[];enemies=[];checkpoint=40;cam=0;let x=0;
const difficulty=level/19, count=9+Math.floor(level/5);
for(let i=0;i<count;i++){
const w=i===0?340:Math.round(240-difficulty*66);
const wave=(i+Math.floor(level/4))%3;
const y=i===0?300:300-(wave===1?Math.round(25+difficulty*24):0);
platforms.push({x,y,w,h:360-y});
if(i>0){for(let j=0;j<3;j++)gems.push({x:x+45+j*40,y:y-46,w:12,h:16});
if(i%2===0||level>=10)enemies.push({x:x+w*.6,y:y-20,w:24,h:20,min:x+20,max:x+w-44,v:35+difficulty*36});}
x+=w+Math.round(45+difficulty*48);}
// Wide start platform teaches head bumps; alternate islands carry solid tunnel stumps.
blocks.push({x:170,y:204,w:28,h:28,used:false,kind:'coin'});
platforms.forEach((q,i)=>{
if(i>0&&i<platforms.length-1&&i%2===1){
const h=34+Math.floor(level/5)*5;obstacles.push({x:q.x+Math.floor(q.w/2)-18,y:q.y-h,w:36,h});
}else if(i>0&&i<platforms.length-1){
blocks.push({x:q.x+65,y:q.y-96,w:28,h:28,used:false,kind:i%4===0?'shield':'coin'});
}
});
// Keep patrols away from solid tunnels and checkpoint spawn positions.
for(const e of enemies){const q=platforms.find(q=>e.min>=q.x&&e.max<q.x+q.w),o=obstacles.find(o=>o.x>q.x&&o.x<q.x+q.w);
if(o){e.min=o.x+o.w+8;e.max=q.x+q.w-26;e.x=(e.min+e.max)/2;}}
respawn();done=false;}
function checkpointPlatform(){return platforms[Math.floor(platforms.length/2)];}
function save(){
try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:1,level,score,deaths,done,coins,blocks:blocks.map(b=>!!b.used),bonus:bonus?{remaining:bonus.remaining,collected:gems.map(g=>!!g.got)}:null,checkpoint:checkpoint>40,gems:gems.map(g=>!!g.got),enemies:enemies.map(e=>!!e.dead)}));
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
coins=Number.isSafeInteger(s.coins)&&s.coins>=0?s.coins:0;
blocks.forEach((b,i)=>b.used=Array.isArray(s.blocks)&&s.blocks[i]===true);
if(s.bonus&&[4,9,14,19].includes(level)&&Number.isFinite(s.bonus.remaining)&&s.bonus.remaining>0&&s.bonus.remaining<=20){
makeBonus();bonus.remaining=s.bonus.remaining;gems.forEach((g,i)=>g.got=Array.isArray(s.bonus.collected)&&s.bonus.collected[i]===true);
}
done=s.done===true&&level===TOTAL_LEVELS-1;respawn();cam=Math.max(0,p.x-180);
show(done?'Wolkenpfad geschafft!':'Willkommen zurück!',done?'Alle 20 Tore sind offen. '+score+' Kristalle gesammelt.':bonus?'Dein Münzgarten wartet: noch '+Math.ceil(bonus.remaining)+' Sekunden.':'Weiter bei Level '+(level+1)+' – '+names[Math.floor(level/5)]+'. Dein Checkpoint und deine Kristalle sind gespeichert.',done?'Noch einmal spielen':'Weiterspielen →');
}catch(e){}
}
function respawn(){let s=platforms.find(q=>checkpoint>=q.x&&checkpoint<q.x+q.w)||platforms[0];p={x:checkpoint,y:s.y-32,w:22,h:30,vx:0,vy:0,face:1};coyote=0;buffer=0;shield=1.5;}
function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function clear(){Object.keys(keys).forEach(k=>keys[k]=false);buffer=0;}
function show(title,message,label){active=false;clear();document.body.classList.add('menu-open');panel.style.display='grid';document.getElementById('title').textContent=title;document.getElementById('message').textContent=message;document.getElementById('start').textContent=label;}
document.getElementById('start').onclick=()=>{if(done){level=0;score=0;deaths=0;coins=0;load();save();}active=true;document.body.classList.remove('menu-open');panel.style.display='none';};
function pause(){if(active){save();show('Hauptmenü',bonus?'Bonus pausiert – deine verbleibende Zeit bleibt erhalten.':'Fortschritt gespeichert. Laufen: ← → / A D · Springen: Leertaste / W / ↑. Goldblöcke von unten treffen, über Tunnel springen.','Weiterspielen →');}}
document.getElementById('menu').onclick=()=>{if(active)pause();else show('Hauptmenü','20 Level, vier Bonusrunden und dein gespeicherter Fortschritt.',done?'Noch einmal spielen':'Weiterspielen →');};
document.getElementById('fullscreen').onclick=async()=>{
try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else throw Error();}
catch(e){document.getElementById('screenStatus').textContent='Bildschirmfüllende Ansicht aktiv. Dieser Browser erlaubt hier keinen echten Vollbildmodus.';}
};
document.getElementById('pause').onclick=pause;
addEventListener('blur',()=>{clear();pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden){clear();pause();}});
const map={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',KeyW:'jump',Space:'jump'};
addEventListener('keydown',e=>{if(map[e.code]&&active){e.preventDefault();if(map[e.code]==='jump'&&!keys.jump)buffer=.13;keys[map[e.code]]=true;}if(e.code==='Escape')pause();});
addEventListener('keyup',e=>{if(map[e.code]){e.preventDefault();keys[map[e.code]]=false;}});
document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();if(!active)return;b.setPointerCapture(e.pointerId);keys[b.dataset.key]=true;if(b.dataset.key==='jump')buffer=.13;});for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>keys[b.dataset.key]=false);});
function makeBonus(){
bonus={remaining:20};bonusClock=0;checkpoint=40;cam=0;blocks=[];obstacles=[];enemies=[];effects=[];
platforms=[{x:0,y:300,w:640,h:60}];gems=[];
for(let row=0;row<3;row++)for(let i=0;i<8;i++)gems.push({x:90+i*62,y:264-row*30,w:12,h:16});
respawn();
}
function enterBonus(){makeBonus();save();show('Bonus: Sonnenmünzen!','20 Sekunden, 24 Münzen! Laufe und springe durch den Münzgarten. Jede Münze zählt – es gibt keine Gegner.','Bonusrunde starten →');}
function advance(){
if(level===TOTAL_LEVELS-1){bonus=null;done=true;save();show('Wolkenpfad geschafft!','20 Level und vier Bonusrunden geschafft! '+score+' Kristalle · '+coins+' Münzen.','Noch einmal spielen');}
else{level++;load();save();}
}
function hitBlock(b){
if(b.used)return;b.used=true;
if(b.kind==='shield'){shield=8;effects.push({x:b.x,y:b.y-8,text:'SCHUTZ',life:1});}
else{coins++;effects.push({x:b.x,y:b.y-8,text:'+1',life:1});}
save();
}
function movePlayer(dt){
const solids=platforms.concat(obstacles,blocks);
p.vx=((keys.right?1:0)-(keys.left?1:0))*185;if(p.vx)p.face=Math.sign(p.vx);
if(buffer>0&&coyote>0){p.vy=-430;buffer=0;coyote=0;}
p.x+=p.vx*dt;
for(const q of solids)if(overlap(p,q)){if(p.vx>0)p.x=q.x-p.w;else if(p.vx<0)p.x=q.x+q.w;}
p.x=Math.max(0,p.x);if(bonus)p.x=Math.min(640-p.w,p.x);
const old=p.y;p.vy+=1050*dt;p.y+=p.vy*dt;
for(const q of solids){
if(p.x+p.w<=q.x||p.x>=q.x+q.w)continue;
if(p.vy>=0&&old+p.h<=q.y+.1&&p.y+p.h>=q.y){
p.y=q.y-p.h;p.vy=0;coyote=.1;
if(!bonus&&q===checkpointPlatform()&&checkpoint===40){checkpoint=q.x+25;save();}
}else if(p.vy<0&&old>=q.y+q.h-.1&&p.y<=q.y+q.h){
p.y=q.y+q.h;p.vy=0;if(blocks.includes(q))hitBlock(q);
}
}
}
function update(dt){
if(!active)return;t+=dt;shield=Math.max(0,shield-dt);buffer-=dt;coyote-=dt;
effects.forEach(e=>{e.life-=dt;e.y-=22*dt;});effects=effects.filter(e=>e.life>0);
const old=p.y;movePlayer(dt);
for(const g of gems)if(!g.got&&overlap(p,g)){g.got=true;if(bonus)coins++;else score++;save();}
if(bonus){
bonus.remaining=Math.max(0,bonus.remaining-dt);bonusClock+=dt;
if(bonus.remaining===0||gems.every(g=>g.got)){
const won=gems.filter(g=>g.got).length;advance();
if(!done)show('Bonus geschafft!','Du hast '+won+' Sonnenmünzen gesammelt. Weiter geht es mit Level '+(level+1)+'.','Weiter →');
return;
}
if(bonusClock>=1){bonusClock=0;save();}return;
}
for(const e of enemies){if(e.dead)continue;e.x+=e.v*dt;if(e.x<e.min||e.x>e.max){e.x=Math.max(e.min,Math.min(e.max,e.x));e.v=-e.v;}
if(overlap(p,e)){if(p.vy>0&&old+p.h<=e.y+8){e.dead=true;p.vy=-300;save();}else if(shield===0){deaths++;respawn();save();return;}}}
if(p.y>400){deaths++;respawn();save();return;}
const last=platforms[platforms.length-1];
if(p.x>last.x+last.w-65){if((level+1)%5===0)enterBonus();else advance();return;}
cam=Math.max(0,Math.min(p.x-180,last.x+last.w-640));
}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
function draw(){rect(0,0,640,360,skies[Math.floor(level/5)]);rect(480,35,42,42,'#fff0bc');for(let i=0;i<8;i++){let x=((i*155-cam*.2)%850+850)%850-100;rect(x,65+i%3*22,66,14,'#e8f7ed');rect(x+12,55+i%3*22,38,14,'#e8f7ed');}
for(let i=0;i<12;i++){let x=i*100-cam*.35%100;ctx.fillStyle=level>=10?'#707eac':'#65b7ae';ctx.beginPath();ctx.moveTo(x-100,310);ctx.lineTo(x,155+i%3*20);ctx.lineTo(x+110,310);ctx.fill();}
ctx.save();ctx.translate(-Math.round(cam),0);
for(const q of platforms){rect(q.x,q.y,q.w,q.h,'#795c68');rect(q.x,q.y,q.w,10,'#64c698');rect(q.x,q.y,q.w,4,'#b7ed97');for(let x=q.x+8;x<q.x+q.w-8;x+=24)rect(x,q.y+24,10,6,'#a37b7b');}
for(const o of obstacles){
rect(o.x,o.y,o.w,o.h,'#286d74');rect(o.x+5,o.y,7,o.h,'#7ac9ae');rect(o.x-3,o.y,o.w+6,10,'#9ae1bc');rect(o.x+2,o.y+2,o.w-4,4,'#254c61');rect(o.x+o.w-7,o.y+13,4,o.h-13,'#1e505e');
}
for(const b of blocks){rect(b.x,b.y,b.w,b.h,b.used?'#776a74':b.kind==='shield'?'#63b8d1':'#ffc86a');rect(b.x+3,b.y+3,b.w-6,3,b.used?'#91868c':'#fff1af');ctx.fillStyle=b.used?'#493e51':'#72502c';ctx.font='bold 19px monospace';ctx.fillText(b.used?'·':b.kind==='shield'?'+':'◆',b.x+6,b.y+22);}
for(const e of effects){ctx.fillStyle='#fff2ac';ctx.font='bold 12px monospace';ctx.fillText(e.text,e.x,e.y);}
for(const g of gems)if(!g.got){let y=g.y+Math.sin(t*4+g.x)*3;if(bonus){rect(g.x+2,y,8,16,'#ffe380');rect(g.x,y+3,12,10,'#ffc45c');rect(g.x+4,y+3,3,10,'#fff5b7');continue;}ctx.fillStyle='#ffec8b';ctx.beginPath();ctx.moveTo(g.x+6,y);ctx.lineTo(g.x+12,y+8);ctx.lineTo(g.x+6,y+16);ctx.lineTo(g.x,y+8);ctx.fill();rect(g.x+4,y+4,3,7,'#fffde3');}
for(const e of enemies)if(!e.dead){rect(e.x,e.y+7,24,13,'#623d72');rect(e.x+3,e.y,18,15,'#ba76a5');rect(e.x+4,e.y+5,5,5,'#fff0dd');rect(e.x+15,e.y+5,5,5,'#fff0dd');rect(e.x+6,e.y+7,2,3,'#26304b');rect(e.x+16,e.y+7,2,3,'#26304b');}
if(!bonus){const cp=checkpointPlatform();rect(cp.x+25,cp.y-48,3,48,'#fff2d5');rect(cp.x+28,cp.y-48,23,15,checkpoint>40?'#ffdf83':'#92ccde');
const last=platforms[platforms.length-1],gx=last.x+last.w-55;rect(gx,last.y-65,38,65,'#f8e1a6');rect(gx+7,last.y-56,24,56,'#527a9d');rect(gx+13,last.y-49,12,49,'#a2f0d5');
}
// Original Lumo sprite: turquoise hood, amber scarf, dark boots.
let x=Math.round(p.x-3),y=Math.round(p.y-4),step=p.vx&&p.vy===0?Math.sin(t*18)*2:0;
if(shield>1.5){ctx.strokeStyle='#b7f8ed';ctx.lineWidth=2;ctx.strokeRect(x-2,y-3,34,43);}
rect(x+5,y,20,5,'#254a61');rect(x+2,y+5,26,17,'#287c83');rect(x+5,y+4,18,5,'#63cfba');rect(x+8,y+10,16,12,'#ffe0b1');rect(x+(p.face>0?19:10),y+12,3,5,'#243449');rect(x+11,y+20,15,5,'#ffc96a');rect(x+(p.face>0?-4:23),y+22,11,4,'#ecaa54');rect(x+7,y+25,17,7,'#388d91');rect(x+4,y+25,5,7,'#ffe0b1');rect(x+7,y+32+step,7,4,'#263d56');rect(x+18,y+32-step,8,4,'#263d56');
ctx.restore();hud.textContent=bonus?'BONUS · '+Math.ceil(bonus.remaining)+' s · ● '+coins:(level+1)+'/20 · ◆ '+score+' · ● '+coins;
}
let prev=0,acc=0;function frame(now){acc+=Math.min((now-prev)/1000,.05);prev=now;while(acc>=1/120){update(1/120);acc-=1/120;}draw();requestAnimationFrame(frame);}load();restore();requestAnimationFrame(frame);

document.getElementById('cloudDetails').addEventListener('toggle',function(){if(this.open)pause();});
