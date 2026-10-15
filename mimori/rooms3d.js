/* Three.js room dioramas – twelve distinct furnished scenes, all made locally from geometry. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;root.MimoriRooms3D=api})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
const palettes=[
 ['#6a507e','#c28fa4','#8d6f8d'],['#364d77','#9d94c3','#6e8bba'],['#37899b','#90cbd1','#4e9ba0'],
 ['#aa7756','#e3be8d','#ae8e67'],['#3e7b59','#9ac691','#568d67'],['#87528c','#d787af','#8854a0'],
 ['#425383','#817bd2','#5365b0'],['#282e66','#6665aa','#3e3d78'],['#6397b9','#d0e9ea','#86bfd7'],
 ['#66a5ad','#c4d7dc','#7ec9cd'],['#674080','#a69bcd','#986cc0'],['#9b6d69','#dfb4ad','#ac878f']];
function build(THREE,parent,id=0,decor=[]){
 while(parent.children.length){
  const n=parent.children[0];parent.remove(n);
  n.traverse?.(obj=>{if(obj.geometry?.dispose)obj.geometry.dispose();
   const mats=Array.isArray(obj.material)?obj.material:[obj.material];for(const mat of mats)mat?.dispose?.()});
 }
 id=Math.max(0,Math.min(11,id|0));
 const [floor,accent,wall]=palettes[id];
 const mat=(color)=>new THREE.MeshStandardMaterial({color,roughness:.81,metalness:0});
 const box=new THREE.BoxGeometry(1,1,1),sphere=new THREE.SphereGeometry(1,14,10),
 cyl=new THREE.CylinderGeometry(1,1,1,12),cone=new THREE.ConeGeometry(1,1,9);
 const add=(geo,color,x,y,z,sx=1,sy=1,sz=1)=>{
  const o=new THREE.Mesh(geo,mat(color));o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);return o;
 };
 const B=(c,x,y,z,w,h,d)=>add(box,c,x,y,z,w,h,d),S=(c,x,y,z,w,h,d)=>add(sphere,c,x,y,z,w,h,d),
 C=(c,x,y,z,w,h,d)=>add(cyl,c,x,y,z,w,h,d);
 B(floor,0,-.1,-1.4,6.9,.14,6.4);
 B(wall,0,2.35,-4.05,6.9,4.5,.17);
 B(accent,-3.3,2.0,-2.0,.12,3.8,4.0);
 B(accent,3.3,2.0,-2.0,.12,3.8,4.0);
 B('#d7cce7',0,4.45,-4.03,6.7,.11,.25);
 B('#352d55',0,2.9,-3.92,2.1,1.65,.12);
 B('#a9c9e1',0,2.9,-3.84,1.83,1.39,.08);
 B('#d8d5dd',0,2.9,-3.75,.10,1.45,.09);B('#d8d5dd',0,2.9,-3.75,1.86,.1,.09);
 function plant(x,z){B('#966e68',x,.3,z,.6,.55,.55);C('#64895c',x,.83,z,.09,.62,.09);
  for(let i=0;i<5;i++){const a=i*6.28/5;S(i%2?'#6aa878':'#91bd74',x+Math.cos(a)*.28,1.14+Math.sin(a)*.12,z+Math.sin(a)*.23,.26,.33,.17)}}
 function lamp(x,z){C('#e8c88c',x,.92,z,.10,1.8,.1);C('#fff0b7',x,1.98,z,.40,.45,.40)}
 function rug(color='#bda4d3'){const v=C(color,0,.015,.5,2.4,.045,1.5);v.rotation.y=.24}
 function bookshelf(x){B('#745974',x,1.43,-3.64,.78,2.25,.6);for(let j=0;j<4;j++){
  B('#bdadad',x, .72+j*.51,-3.30,.7,.09,.49);
  for(let i=0;i<5;i++)B(['#9bcbb6','#f2c3ae','#a5add7'][i%3],x-.25+i*.12,1.0+j*.48,-3.06,.09,.36,.20);
 }}
 function sofa(){B('#915f95',1.6,.58,-2.35,2.4,.73,.90);B('#a985ac',1.6,1.10,-2.66,2.5,.95,.33);
   B('#a985ac',.32,.85,-2.35,.25,.60,1.05);B('#a985ac',2.87,.85,-2.35,.25,.60,1.05);
   S('#e8b6c1',.95,.99,-2.1,.42,.28,.16);S('#b6c6e1',2.2,.99,-2.1,.42,.28,.16)}
 function bed(){B('#86679f',1.1,.40,-2.3,2.35,.5,1.95);B('#ad8bc4',1.1,.74,-2.3,2.25,.21,1.80);
   B('#ddcfec',1.1,.86,-2.65,2.09,.12,.9);B('#efe9eb',.36,1.0,-3.08,.79,.18,.42);B('#efe9eb',1.8,1.0,-3.08,.79,.18,.42)}
 function bath(){B('#dae5ea',1.1,.53,-2.25,2.2,.75,1.65);B('#84c3d4',1.1,.92,-2.25,1.83,.08,1.22);
   C('#dae7de',1.94,1.30,-3.12,.07,.6,.07);B('#dee5e9',1.75,1.6,-3.12,.50,.07,.15)}
 function counter(){B('#856156',.15,.65,-2.76,3.5,1.2,.9);B('#ecd3aa',.15,1.30,-2.76,3.65,.18,1);
   for(let i=0;i<3;i++)C(['#e8a57e','#6d9b80','#d0c978'][i],i*.8-.5,1.45,-2.62,.30,.16,.30)}
 function dance(){rug('#aa67bd');for(let i=0;i<5;i++){const x=-2+i;C(['#eebb72','#e589b6','#7fd6c5'][i%3],x,.018,-1.3,.46,.04,.46)}
  C('#755183',2.35,.75,-2.9,.60,1.5,.60);S('#efc8dc',2.35,1.55,-2.9,.40,.4,.4)}
 function consoleUnit(){B('#49436b',1.9,1.1,-3.1,1.7,1.6,.55);
   B('#a2bedb',1.9,1.28,-2.78,1.25,.83,.09);B('#d6a88b',1.9,.42,-2.8,1.4,.12,.7)}
 function telescope(){C('#b7b4d8',1.8,1.05,-2.4,.1,1.7,.1);
   const tube=C('#b8d8e5',1.8,1.95,-2.4,.27,1.5,.27);tube.rotation.z=.9;S('#8db5c3',2.5,1.95,-2.4,.28,.28,.28)}
 function snow(){for(let i=0;i<12;i++)S('#e8f7ff',-2.6+(i*29%50)/10,1.8+((i*11)%30)/10,-3.85,.055,.06,.055)}
 function clouds(){for(let i=0;i<9;i++)S(i%2?'#f3eafb':'#c3eff4',-3+i*.76,.5+(i%3)*.26,-3.27,.55,.29,.42)}
 function cauldron(){C('#4d526f',1.4,.73,-2.37,.74,.78,.74);S('#85ddb3',1.4,1.22,-2.37,.62,.17,.62);
   for(let i=0;i<4;i++)S('#b2f1ca',1.4+(i-2)*.3,1.55+i%2*.28,-2.37,.12,.12,.12)}
 function gameCab(){B('#524b82',1.5,1.3,-2.68,1.2,2.3,.75);B('#9bd0df',1.5,1.77,-2.24,.91,.85,.11);
   B('#e7a8c3',1.5,.85,-2.24,.9,.18,.14)}
 function fixedRadio(){ // Fixed physical radio in the living room, never a purchasable item.
   B('#44375c',-2.05,.70,-2.55,1.24,.8,.52);
   B('#bca8d4',-2.05,.71,-2.245,1.08,.59,.07);
   for(const dx of [-.34,.35]){const sp=C('#322945',-2.05+dx,.72,-2.18,.19,.06,.19);sp.rotation.x=Math.PI/2}
   B('#e3c8a3',-2.05,1.55,-2.55,.03,.95,.03);
   S('#f3dc91',-2.0,1.07,-2.18,.09,.09,.06);
 }
 switch(id){
 case 0:sofa();rug();plant(-2.6,-3.0);fixedRadio();break;
 case 1:bed();lamp(-2.45,-2.9);rug('#a3b0d5');break;
 case 2:bath();B('#e5d8d1',-2.3,1.6,-3.64,1.05,1.3,.35);B('#9ccfe0',-2.3,1.85,-3.38,.81,.89,.05);break;
 case 3:counter();B('#cbc9b9',2.12,1.3,-3.40,1.3,2.4,.93);plant(-2.6,-2.9);break;
 case 4:plant(-2.5,-2.6);plant(2.5,-2.6);C('#ac8c68',1.1,.48,-2.26,.53,.15,.53);clouds();break;
 case 5:dance();sofa();for(let i=0;i<5;i++)S('#f2c5dd',-2.7+i*1.3,3.9,-3.74,.13,.13,.13);break;
 case 6:consoleUnit();B('#6e5c88',-1.55,1.4,-3.45,1.5,1.5,.4);C('#a8aac9',-.4,.42,-2.4,.55,.15,.55);break;
 case 7:telescope();snow();B('#aaa0d3',-2.0,.65,-3.4,1.5,.45,.8);break;
 case 8:bed();snow();B('#9b786f',-2.6,.83,-3.44,.75,1.5,.54);break;
 case 9:clouds();plant(-2.6,-3.0);S('#fff3b3',1.8,3.0,-3.7,.48,.48,.18);break;
 case 10:cauldron();bookshelf(-2.5);S('#e4d2ea',1.6,2.35,-3.1,.18,.30,.16);break;
 case 11:gameCab();B('#ecb8b6',-2.0,.61,-3.2,1.6,.95,.6);C('#e7cc8c',-2.0,1.17,-3.2,.5,.1,.5);break;
 }
 const active=new Set(decor||[]);
 if(active.has(0))plant(-2.65,-.4);
 if(active.has(1))B('#f1d7ae',-2.2,2.62,-3.86,1.1,.85,.09);
 if(active.has(2))for(let i=0;i<9;i++)S(i%2?'#ffe2a0':'#c5b6ea',-2.75+i*.68,4.12,-3.78,.10,.11,.10);
 if(active.has(3))rug('#d5b2ba');
 if(active.has(4)){B('#62899b',2.55,.74,-2.28,.95,.8,.54);B('#80c3d9',2.55,.82,-1.99,.75,.52,.04)}
 if(active.has(5)){B('#7a5867',-2.65,.82,-3.13,.85,1.35,.45);B('#e5a083',-2.65,1.18,-2.83,.6,.55,.05)}
 if(active.has(6))for(let i=0;i<3;i++)S('#fff4a4',(i-1)*.68,3.6,-3.75,.22,.24,.15);
 if(active.has(7)){sofa();B('#a57c87',1.65,.45,-1.5,1.4,.28,.8)}
 return {id,meshes:parent.children.length,hasRadio:id===0};
}
function css(id){
 const [floor,accent,wall]=palettes[id]||palettes[0];
 return 'linear-gradient(165deg,'+wall+' 0%,'+accent+' 42%,'+floor+' 100%)';
}
return {palettes,build,css};
});
