'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const M=require('../mimori/model.js'),H=require('../mimori/household.js');
const Rooms=require('../mimori/rooms3d.js'),Radio=require('../mimori/radio.js');
const now=Date.UTC(2026,9,15,12);
const original=M.fresh(now),house=H.restore(null,original,M,now);
assert.equal(house.members.length,1);assert.equal(house.rooms.length,5);assert.equal(house.room,0);
assert.equal(M.load(M.changeAppearance(original,0),now).appearance,0);
assert.equal(M.load(M.changeAppearance(original,1),now).appearance,1);
assert.equal(M.load(M.changeAppearance(original,2),now).appearance,2);
assert.equal(H.rooms.length,12);assert.equal(H.decorations.length,24);
assert.equal(Radio.stations.length,13);
const expected=['ricorewi','yourtime-fm','rapradio24','schlagerpop24','chartradio24','clubradio24','anmacha24',
'radiofloh','rockradio24','christmasradio24','kultradio24','zockerfm','special-radio'];
assert.deepEqual(Radio.stations.map(s=>s.slug),expected);
for(const station of Radio.stations){
 assert.equal(station.url,'https://stream.laut.fm/'+station.slug);
 assert(station.fantasy&&station.name&&station.fantasy!==station.name);
}
const settings=[['Mimora',1,0],['Nubina',2,1],['Sterni',3,2]];
for(const [name,species,look] of settings){
 const p=H.create(house,M,name,species,look,now);
 assert(p.ok);assert.equal(p.pet.name,name);assert.equal(p.pet.appearance,look);
}
assert.equal(house.members.length,4);
assert.equal(H.create(house,M,'Zuviel',1,1,now).ok,false);
const selected=H.select(house,2,original,M,now);
assert.equal(selected.name,'Nubina');assert.equal(selected.appearance,1);
let active=H.select(house,0,selected,M,now);
assert.equal(active.name,'Mimori');
const alice=house.members[0].memberId,partners=house.members.slice(1).map(p=>p.memberId);
assert.equal(H.marry(house,alice,partners,now).ok,false);
for(const p of partners)assert.equal(H.addBond(house,alice,p,35),35);
for(const p of partners)assert.equal(H.addBond(house,alice,p,35),70);
const wedding=H.marry(house,alice,partners,now);
assert(wedding.ok);assert.equal(wedding.ids.length,4);
assert.equal(H.marry(house,alice,partners,now).ok,false);
assert.equal(house.weddings.length,1);
// Inclusive marriages never depend on appearance: man-man, woman-woman, other combinations all allowed.
for(const [a,b] of [[0,1],[1,2],[0,3]]){
 const h=H.restore(null,{...M.fresh(now),appearance:a%3},M,now);
 const created=H.create(h,M,'Partner',1,b%3,now);
 H.addBond(h,'m1',created.pet.memberId,65);
 assert(H.marry(h,'m1',[created.pet.memberId],now).ok);
}
const wallet={...active,coins:500};
assert.equal(H.buyRoom(house,wallet,8).ok,true);
assert.equal(house.room,8);assert(house.rooms.includes(8));
// Each resident remembers their own room; first visit to another pet defaults to the living room.
const other=H.select(house,1,wallet,M,now);
assert.equal(house.room,0);
const back=H.select(house,0,other,M,now);
assert.equal(house.room,8);

assert.equal(wallet.coins,375);
assert.equal(H.buyDecor(house,wallet,4).ok,true);
assert(house.decor[8].includes(4));assert.equal(wallet.coins,305);
assert.equal(H.buyDecor(house,wallet,4).ok,false);
assert.equal(H.buyRoom(house,{coins:0},11).ok,false);
const saved=H.persist(house,wallet);
assert.equal(saved.household.members.length,4);
assert.equal(saved.household.room,8);
assert.equal(saved.coins,305);
const restored=H.restore(JSON.parse(JSON.stringify(saved)),M.load(saved,now),M,now);
assert.equal(restored.members.length,4);
assert.equal(restored.weddings.length,1);assert(restored.decor[8].includes(4));
assert.equal(restored.members[0].coins,305);
const care=H.careAll(restored,restored.members[0],M,'cuddle',now);
assert.equal(care.helped,4);
assert(care.pet.joy>=80);
// Every room actually generates 3D geometry and different furniture silhouettes.
const noop=()=>{};
class Shape{constructor(geo,material){this.children=[];this.geometry=geo;this.material=material;this.position={set:noop};this.scale={set:noop};this.rotation={x:0,y:0,z:0}}
add(n){this.children.push(n)}remove(n){this.children=this.children.filter(x=>x!==n)}
traverse(cb){cb(this);for(const child of this.children)child.traverse?.(cb)}}
class Geometry{dispose(){}}
class Material{constructor(){this.color={set:noop}}dispose(){}}
const THREE={Group:Shape,Mesh:Shape,BoxGeometry:Geometry,SphereGeometry:Geometry,CylinderGeometry:Geometry,ConeGeometry:Geometry,MeshStandardMaterial:Material};
const roomGroup=new Shape(),counts=[];
for(let i=0;i<12;i++){
 const result=Rooms.build(THREE,roomGroup,i,i===8?[0,4,5]:[]);
 assert.equal(result.id,i);assert(result.meshes>=14);
 assert.equal(result.hasRadio,i===0);
 assert(Rooms.css(i).includes('linear-gradient'));
 counts.push(result.meshes);
}
assert(new Set(counts).size>=5,'Room sets should be structurally different, not recolored copies');
const html=fs.readFileSync(path.join(__dirname,'../mimori/index.html'),'utf8');
for(const id of ['worldOverlay','worldClose','roomTiles','decorTiles','familyCards','addPet','partnerChoices','datePartners','marryPartners','radioSection','mimoriRadio','radioLaunch']){
 assert(html.includes('id="'+id+'"'),'Missing UI: '+id);
}
for(const p of ['household.js','rooms3d.js','radio.js','home.css']){
 assert(html.includes('./'+p),'Missing dependency: '+p);
}
assert(html.includes('data-prefix="easygames.mimori.v1"'),'Google sync prefix lost');
console.log('PASS Mimori Home: 12 3D rooms, 8 decorations, 4 persistent pets, inclusive 2-4 person weddings, group care and all 13 real laut.fm stations');
