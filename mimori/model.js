(function(root,make){const api=make();if(typeof module!=='undefined'&&module.exports)module.exports=api;root.MimoriModel=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const VERSION=1,DAY=86400000,stages=['Baby','Jungtier','Freund','Sternenwesen'];
const species=['Fluffi','Nubbi','Foxi','Drachi'];
const bound=(x,lo=0,hi=100)=>Math.max(lo,Math.min(hi,Number.isFinite(x)?x:lo));
function fresh(now=Date.now()){
 return {version:VERSION,name:'Mimori',born:now,updated:now,hunger:82,joy:82,energy:82,clean:88,health:92,xp:0,care:0,color:0,species:0,coins:0,records:{},lastDaily:'',accessory:0,theme:0,owns:{accessory:[0],theme:[0]},lastAction:'Willkommen zu Hause!',inventory:{berry:7,soap:5}};
}
function evolve(p){
const age=Math.max(0,(p.updated-p.born)/DAY);
return p.xp>=390&&age>=2?3:p.xp>=145&&age>=.5?2:p.xp>=35?1:0;
}
function advance(raw,now=Date.now()){
const p={...raw};const hours=Math.max(0,Math.min(14*24,(now-p.updated)/3600000));
p.hunger=bound(p.hunger-hours*8);p.joy=bound(p.joy-hours*4.5);
p.energy=bound(p.energy-hours*5.5);p.clean=bound(p.clean-hours*5);
const distressed=[p.hunger,p.joy,p.energy,p.clean].filter(v=>v<20).length;
p.health=bound(p.health+hours*(distressed?-1.4*distressed:.3),10,100);
p.updated=now;return p;
}
function load(raw,now=Date.now()){
if(!raw||raw.version!==VERSION||typeof raw!=='object')return fresh(now);
const p=fresh(now);
p.name=String(raw.name||'Mimori').replace(/[<>]/g,'').trim().slice(0,18)||'Mimori';
p.born=bound(Number(raw.born),0,now)||now;
p.updated=bound(Number(raw.updated),0,now)||now;
for(const k of ['hunger','joy','energy','clean','health'])p[k]=bound(Number(raw[k]),0,100);
p.xp=bound(Number(raw.xp),0,100000);p.care=bound(Number(raw.care),0,100000);
p.color=Math.floor(bound(Number(raw.color),0,3));
p.species=Math.floor(bound(Number(raw.species??0),0,3));
p.coins=Math.floor(bound(Number(raw.coins??0),0,1000000));
p.records={};for(const id of ['catch','memory','rhythm','runner','bubbles'])p.records[id]=Math.floor(bound(Number(raw.records?.[id]??0),0,1000000));
p.lastDaily=typeof raw.lastDaily==='string'?raw.lastDaily.slice(0,12):'';
p.accessory=Math.floor(bound(Number(raw.accessory??0),0,3));
p.theme=Math.floor(bound(Number(raw.theme??0),0,2));
p.owns={accessory:[0],theme:[0]};
for(const kind of ['accessory','theme'])for(const value of raw.owns?.[kind]||[]){
 const id=Math.floor(Number(value));
 if(Number.isFinite(id)&&id>=0&&id<=(kind==='accessory'?3:2)&&!p.owns[kind].includes(id))p.owns[kind].push(id);
}
if(!p.owns.accessory.includes(p.accessory))p.accessory=0;
if(!p.owns.theme.includes(p.theme))p.theme=0;
p.lastAction=String(raw.lastAction||p.lastAction).slice(0,100);
p.inventory={berry:Math.floor(bound(Number(raw.inventory?.berry),0,999)),soap:Math.floor(bound(Number(raw.inventory?.soap),0,999))};
return advance(p,now);
}
function act(raw,kind,now=Date.now()){
const p=advance(raw,now),old=evolve(p);let reward=0,message='';
const boost=(k,d)=>p[k]=bound(p[k]+d);
switch(kind){
case 'feed':
 if(p.inventory.berry<1)return {ok:false,pet:p,reason:'Keine Beeren mehr! Gewinne beim Spielen neue.'};
 p.inventory={...p.inventory,berry:p.inventory.berry-1};boost('hunger',30);boost('joy',5);boost('clean',-5);reward=8;message='Mmmh! Das schmeckt!';break;
case 'play':
 if(p.energy<9)return {ok:false,pet:p,reason:'Zu müde zum Spielen!'};
 boost('joy',25);boost('energy',-15);boost('hunger',-7);reward=10;message='Juhu! Noch eine Runde!';break;
case 'wash':
 if(p.inventory.soap<1)return {ok:false,pet:p,reason:'Keine Seife! Spiele, um neue zu bekommen.'};
 p.inventory={...p.inventory,soap:p.inventory.soap-1};boost('clean',38);boost('joy',4);reward=7;message='Frisch gebadet!';break;
case 'sleep':
 boost('energy',45);boost('health',5);boost('hunger',-6);reward=5;message='Ein schönes Nickerchen!';break;
case 'cuddle':
 boost('joy',14);boost('health',3);reward=4;message='Ich hab dich lieb!';break;
case 'minigame':
 boost('joy',13);boost('energy',-10);boost('hunger',-4);
 p.inventory={berry:Math.min(999,p.inventory.berry+2),soap:Math.min(999,p.inventory.soap+1)};
 reward=18;message='Spiel gewonnen – neue Vorräte!';break;
default:return {ok:false,pet:p,reason:'Unbekannte Aktion'};
}
p.xp+=reward;p.care++;p.lastAction=message;return {ok:true,pet:p,reward,evolved:evolve(p)>old};
}
const prices={accessory:[0,60,110,180],theme:[0,80,140]};
function rewardMini(raw,id,score,won,now=Date.now()){
 if(!['catch','memory','rhythm','runner','bubbles'].includes(id))return {ok:false,pet:raw};
 const p=advance(raw,now),old=evolve(p);
 const points=Math.floor(bound(Number(score),0,5000)),win=won===true;
 const coinReward=Math.min(65,Math.floor(points/25)+(win?14:0));
 const xpReward=Math.min(35,Math.floor(points/40)+(win?12:0));
 p.coins=Math.floor(bound(p.coins+coinReward,0,1000000));
 p.xp=bound(p.xp+xpReward,0,100000);
 p.joy=bound(p.joy+(win?15:5),0,100);
 p.energy=bound(p.energy-6,0,100);
 p.records={...p.records,[id]:Math.max(p.records?.[id]||0,points)};
 p.lastAction='Minispiel: '+coinReward+' Sterne gesammelt!';
 return {ok:true,pet:p,coins:coinReward,xp:xpReward,record:p.records[id],evolved:evolve(p)>old};
}
function claimDaily(raw,now=Date.now()){
 const p=advance(raw,now),date=new Date(now).toISOString().slice(0,10);
 if(p.lastDaily===date)return {ok:false,pet:p,reason:'Den Tagesbonus hast du bereits abgeholt.'};
 p.lastDaily=date;p.coins=Math.floor(bound(p.coins+25,0,1000000));
 p.inventory={...p.inventory,berry:Math.min(999,p.inventory.berry+3),soap:Math.min(999,p.inventory.soap+2)};
 p.lastAction='Dein tägliches Geschenk: 25 Sterne, 3 Beeren und 2 Seifen!';
 return {ok:true,pet:p};
}
function shop(raw,kind,id){
 const p={...raw};
 if(!Object.hasOwn(prices,kind))return {ok:false,pet:p,reason:'Unbekannter Artikel'};
 const n=Math.floor(Number(id)),cost=prices[kind][n];
 if(!Number.isFinite(n)||cost===undefined)return {ok:false,pet:p,reason:'Artikel nicht vorhanden'};
 const owns={accessory:[...(p.owns?.accessory||[0])],theme:[...(p.owns?.theme||[0])]};
 const owned=owns[kind].includes(n);
 if(!owned&&p.coins<cost)return {ok:false,pet:p,reason:'Dafür fehlen dir noch Sterne.'};
 if(!owned){p.coins-=cost;owns[kind].push(n)}
 p.owns=owns;p[kind]=n;return {ok:true,pet:p,purchased:!owned};
}
function mood(p){
const min=Math.min(p.hunger,p.joy,p.clean,p.energy);
return p.health<25||min<25?'Braucht dich':p.energy<35?'Schläfrig':p.joy>75&&min>55?'Überglücklich':'Zufrieden';
}
function needs(p,threshold=35){return ['hunger','joy','energy','clean'].filter(k=>p[k]<=threshold)}
function changeSpecies(p,id){const next=Math.floor(Number(id));if(!Number.isInteger(next)||next<0||next>=species.length)return p;return {...p,species:next}}
function rename(p,name){const safe=String(name||'').replace(/[<>]/g,'').trim().slice(0,18);return {...p,name:safe||p.name}}
return {VERSION,DAY,stages,species,fresh,load,advance,act,evolve,mood,needs,rename,changeSpecies,rewardMini,claimDaily,shop,prices};
});