/* Mimori household, relationships and room economy (save inside existing pet key for Google sync). */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;root.MimoriHome=api})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
const looks=['Männlich','Weiblich','Divers / androgyn'];
const rooms=[
 ['Wohnzimmer','🛋️',0],['Schlafzimmer','🛏️',0],['Badezimmer','🛁',0],['Küche','🍲',0],
 ['Garten','🌳',0],['Partyraum','🎉',70],['Musikstudio','🎹',90],['Sternwarte','🔭',110],
 ['Winterhütte','❄️',125],['Wolkeninsel','☁️',145],['Zauberlabor','🧪',165],['Spielzimmer','🎮',185]];
const decorations=[
 ['Pflanzen & Blumen','🌼',25],['Wandbilder','🖼️',35],['Lichterkette','✨',45],
 ['Teppich','🧶',55],['Aquarium','🐠',70],['Kamin','🔥',85],['Sternenmobile','🌟',100],['Sitzgruppe','🪑',115]];
const idString=(x)=>String(x||'').slice(0,30).replace(/[^a-z0-9_-]/gi,'');
const rawPet=p=>{const o={...p};delete o.household;return o};
const pairKey=(a,b)=>[a,b].sort().join(':');
function restore(source,current,model,now=Date.now()){
 const raw=source?.household;
 const pets=Array.isArray(raw?.members)?raw.members.slice(0,4).filter(x=>x&&typeof x==='object'):[];
 const members=pets.map((item,i)=>{const p=model.load(item,now);p.memberId=idString(item.memberId)||'m'+(i+1);return rawPet(p)});
 if(!members.length){current.memberId=idString(current.memberId)||'m1';members.push(rawPet(current))}
 let active=Number.isInteger(raw?.active)?raw.active:0;active=Math.max(0,Math.min(members.length-1,active));
 // Top-level pet is the authoritative active pet: preserve older Google save edits.
 if(raw?.members?.length){const top=model.load(source,now);members[active]={...rawPet(top),memberId:members[active].memberId}}
 const unlocked=Array.from(new Set([0,1,2,3,4,...(raw?.rooms||[]).map(Number).filter(x=>Number.isInteger(x)&&x>=0&&x<rooms.length)]));
 const upgrades={};for(const [key,values] of Object.entries(raw?.decor||{})){
  const idx=Number(key);if(Number.isInteger(idx)&&idx>=0&&idx<rooms.length&&Array.isArray(values)){
    upgrades[idx]=Array.from(new Set(values.filter(x=>Number.isInteger(x)&&x>=0&&x<decorations.length)));
  }
 }
 const bonds={};for(const [key,val] of Object.entries(raw?.bonds||{})){
  if(/^[\w-]+:[\w-]+$/.test(key))bonds[key]=Math.max(0,Math.min(100,Math.floor(Number(val)||0)));
 }
 const weddings=(Array.isArray(raw?.weddings)?raw.weddings:[]).slice(0,4).map(w=>({
  ids:Array.isArray(w.ids)?Array.from(new Set(w.ids.filter(x=>members.some(m=>m.memberId===x)))).slice(0,4):[],
  date:Number(w.date)||now
 })).filter(w=>w.ids.length>=2);
 const room=unlocked.includes(raw?.room)?raw.room:0;
 const personalRooms={};for(const [id,selected] of Object.entries(raw?.personalRooms||{})){
 if(members.some(m=>m.memberId===id)&&unlocked.includes(selected))personalRooms[id]=selected;
}
return {members,active,room,rooms:unlocked,personalRooms,decor:upgrades,bonds,weddings,nextId:Math.max(Number(raw?.nextId)||members.length+1,members.length+1)};
}
function select(house,index,current,model,now=Date.now()){
 if(!Number.isInteger(index)||index<0||index>=house.members.length)return null;
 house.members[house.active]=rawPet({...current,memberId:house.members[house.active].memberId});
 house.personalRooms=house.personalRooms||{};
 house.personalRooms[house.members[house.active].memberId]=house.room;
 house.active=index;
 house.room=house.rooms.includes(house.personalRooms[house.members[index].memberId])?house.personalRooms[house.members[index].memberId]:house.room;
 return model.load(house.members[index],now);
}
function persist(house,activePet){
 house.members[house.active]=rawPet({...activePet,memberId:house.members[house.active].memberId});
 house.personalRooms=house.personalRooms||{};
 house.personalRooms[house.members[house.active].memberId]=house.room;
 return {...rawPet(activePet),household:house};
}
function create(house,model,name,species,look,now=Date.now()){
 if(house.members.length>=4)return {ok:false,reason:'Maximal vier Mimoris im Haushalt.'};
 const p=model.fresh(now),id='m'+house.nextId++;
 p.memberId=id;p.name=String(name||'Mimori').replace(/[<>]/g,'').trim().slice(0,18)||'Mimori';
 p.species=Math.max(0,Math.min(3,Math.floor(Number(species)||0)));
 p.appearance=Math.max(0,Math.min(2,Math.floor(Number(look)||0)));
 house.members.push(rawPet(p));
 return {ok:true,index:house.members.length-1,pet:p};
}
function addBond(house,a,b,points=30){
 if(a===b||!house.members.some(m=>m.memberId===a)||!house.members.some(m=>m.memberId===b))return 0;
 const key=pairKey(a,b);house.bonds[key]=Math.min(100,(house.bonds[key]||0)+points);return house.bonds[key];
}
function marry(house,anchor,partners,now=Date.now()){
 const ids=Array.from(new Set([anchor,...partners]));
 if(ids.length<2||ids.length>4||ids.some(id=>!house.members.some(p=>p.memberId===id)))return {ok:false,reason:'Wähle ein bis drei andere Mimoris aus.'};
 if(ids.slice(1).some(id=>(house.bonds[pairKey(anchor,id)]||0)<60))
   return {ok:false,reason:'Für eine Hochzeit braucht ihr erst mindestens 60 Herzen pro Beziehung.'};
 if(house.weddings.some(w=>ids.every(id=>w.ids.includes(id))))return {ok:false,reason:'Ihr seid schon verheiratet!'};
 house.weddings.push({ids,date:now});
 return {ok:true,ids};
}
function buyRoom(house,pet,id){
 const r=rooms[id];if(!r)return {ok:false,reason:'Raum nicht gefunden.'};
 if(house.rooms.includes(id)){house.room=id;return {ok:true,purchased:false}}
 if(pet.coins<r[2])return {ok:false,reason:'Für diesen Raum fehlen Sterne.'};
 pet.coins-=r[2];house.rooms.push(id);house.room=id;return {ok:true,purchased:true};
}
function buyDecor(house,pet,id){
 const d=decorations[id];if(!d)return {ok:false,reason:'Dekoration nicht vorhanden.'};
 const owned=house.decor[house.room]||[];
 if(owned.includes(id))return {ok:false,reason:'Dieses Möbelstück ist bereits aufgestellt.'};
 if(pet.coins<d[2])return {ok:false,reason:'Dafür fehlen Sterne.'};
 pet.coins-=d[2];house.decor[house.room]=[...owned,id];return {ok:true,purchased:true};
}
function careAll(house,current,model,kind,now=Date.now()){
 house.members[house.active]=rawPet(current);
 let helped=0;
 house.members=house.members.map(item=>{
  const result=model.act(model.load(item,now),kind,now);
  if(result.ok){helped++;return {...rawPet(result.pet),memberId:item.memberId}}
  return item;
 });
 return {helped,total:house.members.length,pet:house.members[house.active]};
}
return {looks,rooms,decorations,restore,select,persist,create,addBond,marry,buyRoom,buyDecor,careAll,pairKey,rawPet};
});
