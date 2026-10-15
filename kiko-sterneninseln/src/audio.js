export class Audio{
 constructor(save){this.save=save;this.ctx=null;this.musicTime=0}
 tone(freq=440,duration=.12,type='sine',volume=.2){if(!this.save.data.settings.sfx)return;try{this.ctx||=new (window.AudioContext||window.webkitAudioContext)();this.ctx.resume();const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,this.ctx.currentTime);g.gain.setValueAtTime(.0001,this.ctx.currentTime);g.gain.exponentialRampToValueAtTime(Math.max(.0001,volume*this.save.data.settings.sfx),this.ctx.currentTime+.015);g.gain.exponentialRampToValueAtTime(.0001,this.ctx.currentTime+duration);o.connect(g).connect(this.ctx.destination);o.start();o.stop(this.ctx.currentTime+duration+.02)}catch{}}
 tick(dt,playing){if(!playing||!this.save.data.settings.music)return;this.musicTime-=dt;if(this.musicTime<=0){this.musicTime=.55;this.tone([262,330,392,523,440,392,330,294][Math.floor(performance.now()/550)%8],.22,'sine',.035*this.save.data.settings.music)}}
}
