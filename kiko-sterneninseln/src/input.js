const zero=()=>({x:0,z:0,jump:false,interact:false,pause:false,look:0});
export class Input{
 constructor(save,canvas,enabled=()=>true){this.save=save;this.canvas=canvas;this.enabled=enabled;this.down=new Set;this.joy={x:0,y:0};this.look=0;this.jump=false;this.interact=false;this.pause=false;this.lastPad=[];this.touch='ontouchstart'in window||navigator.maxTouchPoints>0;this.resetPointers=[];this.listen()}
 reset(){this.down.clear();this.joy={x:0,y:0};this.look=0;this.jump=false;this.interact=false;this.pause=false;this.lastPad=[];for(const reset of this.resetPointers)reset()}
 listen(){
  window.addEventListener('keydown',e=>{if(!this.enabled()||e.target?.matches?.('input,select,textarea'))return;const keys=Object.values(this.save.data.keys);if(keys.includes(e.code)||e.code.startsWith('Arrow')||e.code==='Escape')e.preventDefault();this.down.add(e.code);if(e.code==='Escape'&&!e.repeat)this.pause=true});
  window.addEventListener('keyup',e=>this.down.delete(e.code));window.addEventListener('blur',()=>this.reset());
  this.canvas.style.touchAction='none';this.canvas.tabIndex=0;
  let cameraPointer=null,lastX=0;
  this.resetPointers.push(()=>{cameraPointer=null});
  this.canvas.addEventListener('pointerdown',e=>{if(!this.enabled())return;this.canvas.focus({preventScroll:true});if(e.pointerType!=='mouse'&&e.clientX<innerWidth*.42)return;if(cameraPointer!==null)return;e.preventDefault();cameraPointer=e.pointerId;lastX=e.clientX;this.canvas.setPointerCapture(e.pointerId)});
  this.canvas.addEventListener('pointermove',e=>{if(cameraPointer===e.pointerId){this.look-=(e.clientX-lastX)*.004;lastX=e.clientX}});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])this.canvas.addEventListener(event,e=>{if(cameraPointer===e.pointerId)cameraPointer=null});
  const stick=document.querySelector('#stick'),knob=document.querySelector('#knob');let stickPointer=null;
  const clearStick=()=>{stickPointer=null;this.joy={x:0,y:0};knob.style.transform=''};this.resetPointers.push(clearStick);
  const move=e=>{if(stickPointer!==e.pointerId)return;e.preventDefault();const r=stick.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/(r.width*.34),y=(e.clientY-r.top-r.height/2)/(r.height*.34),m=Math.max(1,Math.hypot(x,y));this.joy={x:x/m,y:y/m};knob.style.transform=`translate(${this.joy.x*37}px,${this.joy.y*37}px)`};
  stick.addEventListener('pointerdown',e=>{if(!this.enabled()||stickPointer!==null)return;stickPointer=e.pointerId;stick.setPointerCapture(e.pointerId);move(e)});stick.addEventListener('pointermove',move);
  for(const event of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(event,e=>{if(e.pointerId===stickPointer)clearStick()});
  for(const [id,field] of [['jump','jump'],['interact','interact']]){const el=document.querySelector('#'+id);let pointer=null;this.resetPointers.push(()=>{pointer=null;this[field]=false});el.addEventListener('pointerdown',e=>{if(!this.enabled()||pointer!==null)return;e.preventDefault();pointer=e.pointerId;el.setPointerCapture(e.pointerId);this[field]=true});for(const event of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(event,e=>{if(pointer===e.pointerId){e.preventDefault();pointer=null;this[field]=false}})}
 }
 sample(dt=1/60){
  if(!this.enabled())return zero();
  let pads=[];try{pads=navigator.getGamepads?.()||[]}catch{}
  const k=this.save.data.keys,p=Array.from(pads).find(p=>p&&p.connected!==false),b=p?.buttons||[],axis=p?.axes||[];
  const analog=v=>Math.abs(v||0)>.15?v:0,edge=i=>!!b[i]?.pressed&&!this.lastPad[i];
  let x=(this.down.has(k.right)||this.down.has('ArrowRight')?1:0)-(this.down.has(k.left)||this.down.has('ArrowLeft')?1:0)+this.joy.x+analog(axis[0]);
  let z=(this.down.has(k.down)||this.down.has('ArrowDown')?1:0)-(this.down.has(k.up)||this.down.has('ArrowUp')?1:0)+this.joy.y+analog(axis[1]);
  const m=Math.max(1,Math.hypot(x,z));this.look-=analog(axis[2])*2.3*dt;
  const out={x:x/m,z:z/m,jump:this.jump||this.down.has(k.jump)||!!b[0]?.pressed,interact:this.interact||this.down.has(k.interact)||!!b[2]?.pressed,pause:this.pause||edge(9),look:this.look};
  this.pause=false;this.look=0;this.lastPad=b.map(v=>!!v.pressed);return out
 }
}
