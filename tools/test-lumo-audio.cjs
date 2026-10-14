const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../lumo/audio.js'),'utf8');
let contexts=0,voices=0,disconnected=0,started=[],stopped=[];
const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){}});
class AudioContext{
constructor(){contexts++;this.currentTime=10;this.state='running';this.destination={};}
createGain(){return{gain:param(),connect(){},disconnect(){disconnected++;}};}
createOscillator(){voices++;return{frequency:param(),connect(){},disconnect(){disconnected++;},start(t){started.push(t);},stop(t){stopped.push(t);Promise.resolve().then(()=>this.onended?.());}};}
resume(){this.state='running';return Promise.resolve();}
}
const memory=new Map(),c={window:{AudioContext},localStorage:{getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)}};
vm.createContext(c);vm.runInContext(source,c);assert.equal(contexts,0,'no autoplay context');const A=c.window.LumoAudio;
A.play('jump');assert.equal(voices,0);A.unlock();assert.equal(contexts,1);
for(const name of ['jump','coin','block','bump','stomp','death','finish','start','shield','tick'])A.play(name);
assert(voices>20);assert.equal(started.length,stopped.length);assert(started.every((t,i)=>t>=10&&stopped[i]>t));
const before=voices;A.toggle();assert(A.isMuted());A.play('death');A.tick(true,2);assert.equal(voices,before);assert.equal(memory.get('easygames.lumo.v1.sound'),'off');
A.toggle();assert(!A.isMuted());A.tick(true,2);assert(voices>before);assert.equal(contexts,1);
let next=voices;A.tick(false,0);assert.equal(voices,next);
const unsupported={window:{},localStorage:{getItem(){throw Error()},setItem(){throw Error()}}};vm.createContext(unsupported);vm.runInContext(source,unsupported);unsupported.window.LumoAudio.unlock();unsupported.window.LumoAudio.play('death');unsupported.window.LumoAudio.toggle();
Promise.resolve().then(()=>{assert.equal(disconnected,voices*2);console.log('PASS: Web Audio gesture gating, all cues, bounded voices/cleanup, music, mute persistence and unsupported fallback.');});
