'use strict';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d'),panel=document.getElementById('panel'),hud=document.getElementById('hud');
const TOTAL_LEVELS=20, SAVE_KEY='easygames.lumo.v1';
const names=['Sonnenwiese','Bernsteinhöhen','Abendwind','Sternengipfel'],skies=['#83d4e1','#efbb91','#9c9bda','#425b91'];
let level=0,score=0,deaths=0,active=false,done=false,platforms=[],gems=[],enemies=[],p,cam=0,t=0,coyote=0,buffer=0,checkpoint=40,shield=0;
let obstacles=[],blocks=[],coins=0,bonus=null,bonusClock=0,effects=[];
const Audio=window.LumoAudio||{unlock(){},play(){},tick(){},toggle(){},isMuted(){return true;}};
const levelNames=['Taufrischer Pfad','Blütenbrücken','Wurzelwald','Hüpfhügel','Waldtor','Kupferklippen','Sandsteinpass','Federfelsen','Dünenlauf','Sonnentor','Kristallufer','Frosttreppen','Polarlichter','Eiswind','Frosttor','Nebelzinnen','Schwebegarten','Sternenstaub','Mitternachtslauf','Himmelstor'];
const themes=[
{sky:'#85d9dc',far:'#5aa58e',soil:'#78594e',grass:'#65c788',light:'#c6ee91',detail:'#a37b60'},
{sky:'#efba87',far:'#c27c68',soil:'#a46150',grass:'#dfad66',light:'#ffe0a0',detail:'#c98460'},
{sky:'#adcfe7',far:'#7c9fca',soil:'#527fa4',grass:'#95e8e4',light:'#e5ffff',detail:'#76a6ca'},
{sky:'#292d55',far:'#555986',soil:'#565177',grass:'#a59cce',light:'#e1d2ff',detail:'#7e76a3'}
];
let elapsed=0,runClock=0,bests={},pending=null,particles=[],flash=0,deathTimer=0,visualTime=0,recordNotice=false;
const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function limit(){return 120+Math.floor(level/5)*20;}
function formatTime(seconds){return Math.max(0,seconds).toFixed(2)+' s';}
function burst(x,y,color,count=14){if(reduced)return;for(let i=0;i<count;i++){const a=i*2.399;particles.push({x,y,vx:Math.cos(a)*(35+i%4*20),vy:-30-Math.abs(Math.sin(a))*95,life:.45+i%4*.12,color});}if(particles.length>180)particles.splice(0,particles.length-180);}
function intro(){pending=null;document.body.classList.remove('celebrate');show('Level '+(level+1)+' · '+levelNames[level],names[Math.floor(level/5)]+' · '+limit()+' Sekunden. '+['Krabbler und Tunnel: Springe auf Gegner und über Hindernisse.','Hüpfer und Felsen: Achte auf den Sprungrhythmus.','Flatterer und Eiskristalle: Landungen gut planen.','Flitzer und Sternendornen: Timing zählt!'][Math.floor(level/5)]+' Bestzeit: '+(bests[level]?formatTime(bests[level]):'noch keine')+'.','Level starten →');}
function finishLevel(){
const previous=bests[level];recordNotice=!previous||elapsed<previous;
if(recordNotice)bests[level]=Math.max(.01,elapsed);
pending='level';save();Audio.play('finish');burst(p.x,p.y,'#ffe18b',48);
show('Level '+(level+1)+' geschafft!',formatTime(elapsed)+(recordNotice?' · Neuer persönlicher Rekord!':' · Bestzeit: '+formatTime(bests[level]))+' · '+Math.ceil(Math.max(0,limit()-elapsed))+' Sekunden übrig.',(level+1)%5===0?'Zum Bonusspiel →':'Zum nächsten Level →');
document.body.classList.add('celebrate');
}
function die(reason){
if(deathTimer>0)return;deaths++;elapsed+=5;deathTimer=.7;flash=.35;
burst(p.x+11,p.y+15,'#ff9c98',26);Audio.play('death');effects.push({x:p.x-20,y:p.y-12,text:reason+' · +5 s',life:1.3});clear();save();
}
const keys={left:false,right:false,jump:false};
function load(){elapsed=0;runClock=0;pending=null;deathTimer=0;particles=[];flash=0;bonus=null;obstacles=[];blocks=[];effects=[];platforms=[];gems=[];enemies=[];checkpoint=40;cam=0;let x=0;
const difficulty=level/19, count=9+Math.floor(level/5);
for(let i=0;i<count;i++){
const w=i===0?340:Math.round(240-difficulty*60+((i+level)%3-1)*14);
const wave=(i*(level%2+1)+level)%3;
const y=i===0?300:300-(wave===1?Math.round(25+difficulty*24):0);
platforms.push({x,y,w,h:360-y});
if(i>0){for(let j=0;j<3;j++)gems.push({x:x+45+j*40,y:y-46,w:12,h:16});
if(i%2===0||level>=10)enemies.push({x:x+w*.6,y:y-20,w:24,h:20,min:x+20,max:x+w-44,v:35+difficulty*36});}
x+=w+Math.round(42+difficulty*43+(i+level)%3*4);}
// Wide start platform teaches head bumps; alternate islands carry solid tunnel stumps.
blocks.push({x:170,y:204,w:28,h:28,used:false,kind:'coin'});
platforms.forEach((q,i)=>{
if(i>0&&i<platforms.length-1&&i%2===1){
const h=34+Math.floor(level/5)*5;const kind=level===0?'tunnel':['tunnel','rock','spring','spikes','crystal'][(i+level)%5];
const height=kind==='spikes'?18:kind==='spring'?16:h;
obstacles.push({x:q.x+Math.floor(q.w/2)-18,y:q.y-height,w:36,h:height,kind});
}else if(i>0&&i<platforms.length-1){
blocks.push({x:q.x+65,y:q.y-96,w:28,h:28,used:false,kind:i%4===0?'shield':'coin'});
}
});
// Keep patrols away from solid tunnels and checkpoint spawn positions.
for(const e of enemies){const q=platforms.find(q=>e.min>=q.x&&e.max<q.x+q.w),o=obstacles.find(o=>o.x>q.x&&o.x<q.x+q.w);
if(o){e.min=o.x+o.w+8;e.max=q.x+q.w-26;e.x=(e.min+e.max)/2;}
e.kind=level<2?'crawler':['crawler','hopper','flyer','dasher'][(Math.floor(level/5)+enemies.indexOf(e))%Math.min(4,2+Math.floor(level/5))];
e.baseY=e.y;e.phase=enemies.indexOf(e)*1.7;
}
respawn();done=false;}
function checkpointPlatform(){return platforms[Math.floor(platforms.length/2)];}
function save(){
try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:1,elapsed,bests,pending,level,score,deaths,done,coins,blocks:blocks.map(b=>!!b.used),bonus:bonus?{remaining:bonus.remaining,collected:gems.map(g=>!!g.got)}:null,checkpoint:checkpoint>40,gems:gems.map(g=>!!g.got),enemies:enemies.map(e=>!!e.dead)}));
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
elapsed=Number.isFinite(s.elapsed)&&s.elapsed>=0?Math.min(s.elapsed,limit()):0;
bests={};if(s.bests&&typeof s.bests==='object')for(let i=0;i<20;i++)if(Number.isFinite(s.bests[i])&&s.bests[i]>0&&s.bests[i]<=240)bests[i]=s.bests[i];
coins=Number.isSafeInteger(s.coins)&&s.coins>=0?s.coins:0;
blocks.forEach((b,i)=>b.used=Array.isArray(s.blocks)&&s.blocks[i]===true);
if(s.bonus&&[4,9,14,19].includes(level)&&Number.isFinite(s.bonus.remaining)&&s.bonus.remaining>=0&&s.bonus.remaining<=20){
makeBonus();bonus.remaining=s.bonus.remaining;gems.forEach((g,i)=>g.got=Array.isArray(s.bonus.collected)&&s.bonus.collected[i]===true);
}
pending=['level','bonus'].includes(s.pending)?s.pending:null;
done=s.done===true&&level===TOTAL_LEVELS-1;respawn();cam=Math.max(0,p.x-180);
show(done?'Wolkenpfad geschafft!':'Willkommen zurück!',done?'Alle 20 Tore sind offen. '+score+' Kristalle gesammelt.':bonus?'Dein Münzgarten wartet: noch '+Math.ceil(bonus.remaining)+' Sekunden.':'Weiter bei Level '+(level+1)+' – '+names[Math.floor(level/5)]+'. Dein Checkpoint und deine Kristalle sind gespeichert.',done?'Noch einmal spielen':'Weiterspielen →');
if(pending){show(pending==='level'?'Level abgeschlossen!':'Bonus abgeschlossen!','Dein Ergebnis ist gespeichert. Weiter zum nächsten Abschnitt.','Weiter →');document.body.classList.add('celebrate');}
}catch(e){}
}
function respawn(){let s=platforms.find(q=>checkpoint>=q.x&&checkpoint<q.x+q.w)||platforms[0];p={x:checkpoint,y:s.y-32,w:22,h:30,vx:0,vy:0,face:1};coyote=0;buffer=0;shield=1.5;}
function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function clear(){Object.keys(keys).forEach(k=>keys[k]=false);buffer=0;}
function show(title,message,label){active=false;clear();document.body.classList.add('menu-open');panel.style.display='grid';document.getElementById('title').textContent=title;document.getElementById('message').textContent=message;document.getElementById('start').textContent=label;document.getElementById('retry').disabled=!!bonus;}
document.getElementById('start').onclick=()=>{
Audio.unlock();document.body.classList.remove('celebrate');
if(pending==='level'){pending=null;if((level+1)%5===0)enterBonus();else{advance();intro();}return;}
if(pending==='bonus'){pending=null;advance();if(!done)intro();return;}
if(done){level=0;score=0;deaths=0;coins=0;load();save();intro();return;}
Audio.play('start');active=true;document.body.classList.remove('menu-open');panel.style.display='none';
};
document.getElementById('retry').onclick=()=>{if(bonus)return;Audio.unlock();load();save();intro();};
function updateSoundButtons(){for(const id of ['sound','soundMenu']){const b=document.getElementById(id);b.textContent=Audio.isMuted()?'♫ Aus':'♫ An';b.setAttribute('aria-pressed',String(!Audio.isMuted()));}}
for(const id of ['sound','soundMenu'])document.getElementById(id).onclick=()=>{Audio.toggle();updateSoundButtons();};
updateSoundButtons();
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
function advance(){pending=null;
if(level===TOTAL_LEVELS-1){bonus=null;done=true;save();Audio.play('finish');show('Wolkenpfad geschafft!','20 Level und vier Bonusrunden geschafft! '+score+' Kristalle · '+coins+' Münzen.','Noch einmal spielen');document.body.classList.add('celebrate');}
else{level++;load();save();}
}
function hitBlock(b){
if(b.used){Audio.play('bump');return;}b.used=true;b.bump=.18;Audio.play(b.kind==='shield'?'shield':'block');burst(b.x+14,b.y,'#ffe18b');
if(b.kind==='shield'){shield=8;effects.push({x:b.x,y:b.y-8,text:'SCHUTZ',life:1});}
else{coins++;effects.push({x:b.x,y:b.y-8,text:'+1',life:1});}
save();
}
function movePlayer(dt){
const solids=platforms.concat(obstacles.filter(o=>o.kind!=='spikes'),blocks);
p.vx=((keys.right?1:0)-(keys.left?1:0))*185;if(p.vx)p.face=Math.sign(p.vx);
if(buffer>0&&coyote>0){p.vy=-430;buffer=0;coyote=0;Audio.play('jump');burst(p.x+11,p.y+30,'#e5efda',5);}
p.x+=p.vx*dt;
for(const q of solids)if(overlap(p,q)){if(p.vx>0)p.x=q.x-p.w;else if(p.vx<0)p.x=q.x+q.w;}
p.x=Math.max(0,p.x);if(bonus)p.x=Math.min(640-p.w,p.x);
const old=p.y;p.vy+=1050*dt;p.y+=p.vy*dt;
for(const q of solids){
if(p.x+p.w<=q.x||p.x>=q.x+q.w)continue;
if(p.vy>=0&&old+p.h<=q.y+.1&&p.y+p.h>=q.y){
p.y=q.y-p.h;p.vy=0;coyote=.1;
if(q.kind==='spring'){p.vy=-510;coyote=0;Audio.play('jump');burst(p.x+11,q.y,'#a8fff0');}
if(!bonus&&q===checkpointPlatform()&&checkpoint===40){checkpoint=q.x+25;burst(q.x+25,q.y-40,'#a8fff0',22);Audio.play('shield');save();}
}else if(p.vy<0&&old>=q.y+q.h-.1&&p.y<=q.y+q.h){
p.y=q.y+q.h;p.vy=0;if(blocks.includes(q))hitBlock(q);
}
}
}
function update(dt){
if(!active)return;
if(deathTimer>0){deathTimer=Math.max(0,deathTimer-dt);if(deathTimer===0)respawn();return;}
if(!bonus){elapsed+=dt;runClock+=dt;if(runClock>=1){runClock=0;save();}if(elapsed>=limit()){Audio.play('death');load();save();show('Zeit abgelaufen!','Neuer Versuch ab Levelbeginn. Deine Bestzeiten bleiben erhalten.','Level neu starten →');return;}}
t+=dt;shield=Math.max(0,shield-dt);buffer-=dt;coyote-=dt;
effects.forEach(e=>{e.life-=dt;e.y-=22*dt;});effects=effects.filter(e=>e.life>0);
const old=p.y;movePlayer(dt);
for(const g of gems)if(!g.got&&overlap(p,g)){g.got=true;Audio.play('coin');burst(g.x+6,g.y+8,bonus?'#ffdf7a':'#e8ffff',10);if(bonus)coins++;else score++;save();}
if(bonus){
bonus.remaining=Math.max(0,bonus.remaining-dt);bonusClock+=dt;
if(bonus.remaining===0||gems.every(g=>g.got)){
const won=gems.filter(g=>g.got).length;pending='bonus';save();Audio.play('finish');
show('Bonus geschafft!',won+' Sonnenmünzen gesammelt!',level===19?'Zum großen Finale →':'Zum nächsten Level →');document.body.classList.add('celebrate');
return;
}
if(bonusClock>=1){bonusClock=0;save();}return;
}
for(const e of enemies){if(e.dead)continue;e.x+=e.v*dt*(e.kind==='dasher'?(Math.sin(t*3+e.phase)>0?1.7:.3):1);
if(e.kind==='hopper')e.y=e.baseY-Math.max(0,Math.sin(t*3+e.phase))*34;
if(e.kind==='flyer')e.y=e.baseY-32+Math.sin(t*2+e.phase)*12;if(e.x<e.min||e.x>e.max){e.x=Math.max(e.min,Math.min(e.max,e.x));e.v=-e.v;}
if(overlap(p,e)){if(p.vy>0&&old+p.h<=e.y+8){e.dead=true;p.vy=-300;Audio.play('stomp');burst(e.x+12,e.y+10,'#f4b9ea',18);save();}else if(shield===0){die('Erwischt');return;}}}
if(p.y>400){die('Abgestürzt');return;}
for(const o of obstacles)if(o.kind==='spikes'&&overlap(p,o)&&shield===0){die('Dornen');return;}
const last=platforms[platforms.length-1];
if(p.x>last.x+last.w-65){finishLevel();return;}
cam=Math.max(0,Math.min(p.x-180,last.x+last.w-640));
}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
function draw(){
const world=Math.floor(level/5),theme=themes[world];
rect(0,0,640,360,theme.sky);
rect(480,35,42,42,world===3?'#e2e4ff':'#fff0bc');
if(world===0){for(let i=0;i<9;i++){let x=i*110-(cam*.25)%110;rect(x+35,135+i%3*18,13,180,'#477d74');rect(x,115+i%3*18,80,70,i%2?'#7bc29b':'#65ad91');rect(x+15,95+i%3*18,50,40,'#95d3a6');}}
else if(world===1){for(let i=0;i<9;i++){const x=i*100-(cam*.28)%100;rect(x,170+i%3*20,65,150,'#ce8a6a');rect(x-8,164+i%3*20,80,12,'#efb57d');rect(x+20,190+i%3*20,7,100,'#b16e61');}}
else if(world===2){for(let i=0;i<8;i++){const x=i*120-(cam*.2)%120;ctx.fillStyle=i%2?'#c5f1f0':'#89b7d5';ctx.beginPath();ctx.moveTo(x-70,320);ctx.lineTo(x,115+i%3*20);ctx.lineTo(x+95,320);ctx.fill();}for(let i=0;i<35;i++)rect((i*97+visualTime*7)%640,(i*31+visualTime*13)%340,2,2,'#f1ffff');}
else{for(let i=0;i<48;i++)rect((i*83+11)%640,(i*37)%210,2,i%3===0?3:1,i%2?'#e0d4ff':'#849acb');for(let i=0;i<8;i++){const x=i*110-(cam*.22)%110;rect(x,190+i%3*15,70,20,'#62628d');rect(x+12,210+i%3*15,46,45,'#42496f');rect(x+25,255+i%3*15,20,15,'#353d62');}}
if(world<2)for(let i=0;i<6;i++){let x=((i*155-cam*.1)%850+850)%850-100;rect(x,65+i%3*22,66,14,'#fff0d9');rect(x+12,55+i%3*22,38,14,'#fff0d9');}
ctx.save();ctx.translate(-Math.round(cam),0);
for(const q of platforms){rect(q.x,q.y,q.w,q.h,theme.soil);rect(q.x,q.y,q.w,10,theme.grass);rect(q.x,q.y,q.w,4,theme.light);for(let x=q.x+8;x<q.x+q.w-8;x+=24)rect(x,q.y+24,10,6,theme.detail);}
for(const o of obstacles){
if(o.kind==='spikes'){for(let j=0;j<3;j++){ctx.fillStyle=world===3?'#f1a9d4':'#cae9ed';ctx.beginPath();ctx.moveTo(o.x+j*12,o.y+o.h);ctx.lineTo(o.x+j*12+6,o.y);ctx.lineTo(o.x+j*12+12,o.y+o.h);ctx.fill();}continue;}
if(o.kind==='spring'){rect(o.x,o.y+o.h-4,o.w,4,'#355c76');for(let j=0;j<3;j++)rect(o.x+8,o.y+j*5,20,2,'#d8fbef');rect(o.x,o.y,o.w,5,'#f7ae85');continue;}
if(o.kind==='rock'){rect(o.x+3,o.y,o.w-6,o.h,'#c18567');rect(o.x,o.y+8,o.w,o.h-8,'#aa6e5e');rect(o.x+5,o.y+4,22,5,'#e1b18a');rect(o.x+17,o.y+13,3,14,'#805765');continue;}
if(o.kind==='crystal'){rect(o.x+5,o.y,o.w-10,o.h,'#a1e5e3');rect(o.x,o.y+10,o.w,o.h-10,'#69b9cc');rect(o.x+8,o.y+3,6,o.h-6,'#e2ffec');rect(o.x+25,o.y+12,5,o.h-12,'#598cae');continue;}
rect(o.x,o.y,o.w,o.h,'#286d74');rect(o.x+5,o.y,7,o.h,'#7ac9ae');rect(o.x-3,o.y,o.w+6,10,'#9ae1bc');rect(o.x+2,o.y+2,o.w-4,4,'#254c61');rect(o.x+o.w-7,o.y+13,4,o.h-13,'#1e505e');
}
for(const b of blocks){ctx.save();ctx.translate(0,-Math.sin((b.bump||0)/.18*Math.PI)*5);rect(b.x,b.y,b.w,b.h,b.used?'#776a74':b.kind==='shield'?'#63b8d1':'#ffc86a');rect(b.x+3,b.y+3,b.w-6,3,b.used?'#91868c':'#fff1af');ctx.fillStyle=b.used?'#493e51':'#72502c';ctx.font='bold 19px monospace';ctx.fillText(b.used?'·':b.kind==='shield'?'+':'◆',b.x+6,b.y+22);ctx.restore();}
for(const e of effects){ctx.fillStyle='#fff2ac';ctx.font='bold 12px monospace';ctx.fillText(e.text,e.x,e.y);}
for(const g of gems)if(!g.got){let y=g.y+Math.sin(t*4+g.x)*3;if(bonus){rect(g.x+2,y,8,16,'#ffe380');rect(g.x,y+3,12,10,'#ffc45c');rect(g.x+4,y+3,3,10,'#fff5b7');continue;}ctx.fillStyle='#ffec8b';ctx.beginPath();ctx.moveTo(g.x+6,y);ctx.lineTo(g.x+12,y+8);ctx.lineTo(g.x+6,y+16);ctx.lineTo(g.x,y+8);ctx.fill();rect(g.x+4,y+4,3,7,'#fffde3');}
for(const e of enemies)if(!e.dead){
const color={crawler:'#ba76a5',hopper:'#e6ab57',flyer:'#8e9ded',dasher:'#ed8d7f'}[e.kind]||'#ba76a5';
if(e.kind==='flyer'){const flap=Math.sin(visualTime*15)*5;rect(e.x-9,e.y+4+flap,12,5,'#c6d6ff');rect(e.x+21,e.y+4-flap,12,5,'#c6d6ff');}
if(e.kind==='hopper'){rect(e.x+3,e.y-7,5,12,color);rect(e.x+16,e.y-7,5,12,color);}
if(e.kind==='dasher'){rect(e.x-6,e.y+10,10,4,'#ffd397');rect(e.x-10,e.y+16,12,3,'#ffd397');}
rect(e.x,e.y+7,24,13,'#483d65');rect(e.x+3,e.y,18,15,color);
rect(e.x+4,e.y+5,5,5,'#fff0dd');rect(e.x+15,e.y+5,5,5,'#fff0dd');rect(e.x+6,e.y+7,2,3,'#26304b');rect(e.x+16,e.y+7,2,3,'#26304b');
rect(e.x+2,e.y+19,6,3,color);rect(e.x+16,e.y+19,6,3,color);
}
if(!bonus){const cp=checkpointPlatform();rect(cp.x+25,cp.y-48,3,48,'#fff2d5');rect(cp.x+28,cp.y-48,23,15,checkpoint>40?'#ffdf83':'#92ccde');
const last=platforms[platforms.length-1],gx=last.x+last.w-55;rect(gx,last.y-65,38,65,'#f8e1a6');rect(gx+7,last.y-56,24,56,'#527a9d');rect(gx+13,last.y-49,12,49,'#a2f0d5');
}
// Original Lumo sprite: turquoise hood, amber scarf, dark boots.
let x=Math.round(p.x-3),y=Math.round(p.y-4-(deathTimer>0?Math.sin(deathTimer/.7*Math.PI)*25:0)),step=p.vx&&p.vy===0?Math.sin(t*18)*2:0;
if(shield>1.5){ctx.strokeStyle='#b7f8ed';ctx.lineWidth=2;ctx.strokeRect(x-2,y-3,34,43);}
rect(x+5,y,20,5,'#254a61');rect(x+2,y+5,26,17,'#287c83');rect(x+5,y+4,18,5,'#63cfba');rect(x+8,y+10,16,12,'#ffe0b1');rect(x+(p.face>0?19:10),y+12,3,5,'#243449');rect(x+11,y+20,15,5,'#ffc96a');rect(x+(p.face>0?-4:23),y+22,11,4,'#ecaa54');rect(x+7,y+25,17,7,'#388d91');rect(x+4,y+25,5,7,'#ffe0b1');rect(x+7,y+32+step,7,4,'#263d56');rect(x+18,y+32-step,8,4,'#263d56');
for(const q of particles)rect(q.x,q.y,3,3,q.color);
ctx.restore();if(flash>0){ctx.fillStyle='rgba(255,105,100,'+(flash*.55)+')';ctx.fillRect(0,0,640,360);}
const remaining=Math.max(0,limit()-elapsed);document.getElementById('timer').textContent=bonus?'BONUS '+Math.ceil(bonus.remaining)+' s':'⏱ '+Math.ceil(remaining)+' s';
document.getElementById('timer').classList.toggle('urgent',!bonus&&remaining<=20);
document.getElementById('best').textContent='BEST '+(bests[level]?formatTime(bests[level]):'—');
hud.textContent=bonus?'BONUS · '+Math.ceil(bonus.remaining)+' s · ● '+coins:(level+1)+'/20 · ◆ '+score+' · ● '+coins;
}
let prev=0,acc=0;function frame(now){const delta=Math.min((now-prev)/1000,.05);visualTime+=delta;flash=Math.max(0,flash-delta);for(const b of blocks)b.bump=Math.max(0,(b.bump||0)-delta);particles.forEach(q=>{q.life-=delta;q.x+=q.vx*delta;q.y+=q.vy*delta;q.vy+=180*delta;});particles=particles.filter(q=>q.life>0);Audio.tick(active&&deathTimer===0,Math.floor(level/5));acc+=delta;prev=now;while(acc>=1/120){update(1/120);acc-=1/120;}draw();requestAnimationFrame(frame);}load();intro();restore();requestAnimationFrame(frame);

document.getElementById('cloudDetails').addEventListener('toggle',function(){if(this.open)pause();});
