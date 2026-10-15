/* Low-power interactive pet and room fallback when WebGL is unavailable. */
(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;root.MimoriFallback=api})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
const fur=['#cf83ad','#79cbc1','#ae96d4','#d9b078'],light=['#f2d9e9','#d6eee6','#e5d6f2','#f7e5bc'];
const walls=['#bd9bb9','#aab1d2','#80c6d5','#ebbc94','#96bd8e','#bd8abd','#a2a1d5','#7173b9','#c4def0','#a4e8ed','#af99d6','#d7b3ba'];
const symbols=['🛋️','🛏️','🛁','🍲','🌳','🎉','🎹','🔭','❄️','☁️','🧪','🎮'];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function start({target,getPet,getHouse,onCuddle,onError}){
 if(!target||typeof document==='undefined')return null;
 target.querySelectorAll('canvas').forEach(c=>c.remove());
 const canvas=document.createElement('canvas');canvas.className='mimoriLowGraphics';
 canvas.setAttribute('aria-label','Mimori – interaktive energiesparende 2D-Darstellung');
 canvas.style.cssText='width:100%;height:100%;display:block;touch-action:none';
 target.appendChild(canvas);
 const c=canvas.getContext('2d',{alpha:false});
 if(!c){onError?.('Canvas-2D ist ebenfalls nicht verfügbar.');return null}
 let orbit=0,down=null,closed=false,frame=0;
 const ell=(x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()};
 const box=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h)};
 function render(ms){
  if(closed)return;
  const w=target.clientWidth||360,h=target.clientHeight||590,pix=clamp((typeof window!=='undefined'?window.devicePixelRatio:1)||1,1,1.5);
  if(canvas.width!==Math.floor(w*pix)||canvas.height!==Math.floor(h*pix)){canvas.width=Math.floor(w*pix);canvas.height=Math.floor(h*pix)}
  c.setTransform(pix,0,0,pix,0,0);
  const pet=getPet(),room=clamp(getHouse().room||0,0,11);
  const grad=c.createLinearGradient(0,0,0,h);
  grad.addColorStop(0,walls[room]);grad.addColorStop(1,'#3d365b');c.fillStyle=grad;c.fillRect(0,0,w,h);
  box(w*.12,h*.14,w*.76,h*.46,'#ffffff27');box(w*.22,h*.2,w*.56,h*.28,'#bcd8e2a3');
  c.fillStyle='#ffffff44';c.beginPath();c.moveTo(0,h*.66);c.lineTo(w*.25,h*.54);c.lineTo(w*.75,h*.54);c.lineTo(w,h*.66);c.lineTo(w,h);c.lineTo(0,h);c.fill();
  c.font=Math.round(clamp(w*.14,31,62))+'px system-ui';c.textAlign='right';c.fillText(symbols[room],w*.83,h*.54);
  const scale=clamp(Math.min(w/350,h/520),.65,1.8),f=fur[pet.color%4||0],b=light[pet.color%4||0];
  c.save();c.translate(w*.5,h*.59+Math.sin(ms/480)*2.5);c.scale(scale,scale);
  ell(0,142,99,16,'#30204e55');
  ell(-42,113,30,19,f);ell(43,113,30,19,f);
  const type=pet.species||0;
  if(type===0){
   ell(-55,-103,23,80,f);ell(55,-103,23,80,f);
   ell(-55,-105,11,59,b);ell(55,-105,11,59,b);
   ell(0,15,91,111,f);ell(0,57,61,64,b);
  }else if(type===1){
   ell(0,26,114,91,f);ell(-90,55,30,27,f);ell(90,55,30,27,f);
   ell(0,54,78,48,b);ell(0,70,31,18,'#d6e7ad');
  }else if(type===2){
   c.fillStyle=f;c.beginPath();c.moveTo(-72,-39);c.lineTo(-82,-155);c.lineTo(-12,-92);
   c.lineTo(12,-92);c.lineTo(82,-155);c.lineTo(72,-39);c.fill();
   ell(73,44,41,77,b);ell(0,14,79,111,f);ell(0,57,49,58,b);
  }else{
   c.fillStyle=f;c.beginPath();c.moveTo(-67,-33);c.lineTo(-132,-73);c.lineTo(-105,50);c.lineTo(-57,30);
   c.moveTo(67,-33);c.lineTo(132,-73);c.lineTo(105,50);c.lineTo(57,30);c.fill();
   c.fillStyle=b;c.beginPath();c.moveTo(-45,-65);c.lineTo(-25,-143);c.lineTo(0,-70);c.lineTo(25,-143);c.lineTo(45,-65);c.fill();
   ell(0,12,94,103,f);ell(0,55,60,64,b);
  }
  const ey=type===1?-7:-22,space=type===1?45:34;
  for(const sign of [-1,1]){
   ell(sign*space,ey,21,28,'#fff9ff');
   ell(sign*space+Math.sin(orbit)*8,ey+5,11,17,'#302743');
   ell(sign*space-4+Math.sin(orbit)*8,ey-4,5,6,'#fff');
   ell(sign*(space+23),ey+39,14,7,'#e89fbd');
  }
  ell(0,ey+48,12,9,'#905e76');
  if(pet.appearance===0){box(-62,ey-49,48,6,'#655071');box(14,ey-49,48,6,'#655071')}
  else if(pet.appearance===1){ell(78,-80,19,14,'#edb7d9');ell(99,-95,18,12,'#f3cee7')}
  else{ell(0,-134,23,14,b);ell(0,-141,8,9,'#ffefb5')}
  if(pet.sleeping){c.fillStyle='#36416b88';c.fillRect(-73,ey-12,146,34)}
  if(pet.accessory===1)ell(0,103,14,15,'#f0cf90');
  if(pet.accessory===2)ell(0,-152,22,12,'#f8b1cf');
  if(pet.accessory===3){box(-32,-157,64,14,'#f2dc87');ell(0,-174,12,18,'#f2dc87')}
  c.restore();
  if(pet.lightsOff)box(0,0,w,h,'#10173377');
  frame=requestAnimationFrame(render);
 }
 canvas.addEventListener('pointerdown',e=>{down={id:e.pointerId,x:e.clientX,moved:false};canvas.setPointerCapture?.(e.pointerId);e.preventDefault()});
 canvas.addEventListener('pointermove',e=>{if(!down||down.id!==e.pointerId)return;const d=e.clientX-down.x;orbit+=d*.016;down.x=e.clientX;if(Math.abs(d)>3)down.moved=true;e.preventDefault()});
 for(const kind of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(kind,e=>{
  if(!down||down.id!==e.pointerId)return;const tap=!down.moved&&kind==='pointerup';down=null;if(tap)onCuddle?.()
 });
 render(0);
 return {canvas,turn:rad=>{orbit+=rad},redraw:()=>{},dispose:()=>{closed=true;cancelAnimationFrame(frame);canvas.remove()}};
}
return {start};
});
