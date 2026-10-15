export function puzzleComplete(game){const l=game.view.level;if(l.puzzle==='none')return true;if(l.puzzle==='boss')return game.bossHits>=3;if(l.puzzle==='timed')return game.timerUntil>game.time;return game.puzzle>=l.switchStages.length}
export function activateLight(game,s){if(s.active)return false;s.active=true;game.puzzle++;s.mesh.children[1].material.color.set(0x78ffe2);game.view.burst(s.mesh.position,0x9fffe9);game.audio.tone(480+game.puzzle*100,.18);return true}
export function windAt(game){let force=0;const p=game.player.pos;for(const w of game.view.level.features.wind||[]){const f=game.view.platforms[w.index];if(Math.abs(p.x-f.x)<f.w/2+1&&Math.abs(p.z-f.z)<f.d/2+.5&&p.y>f.y-.2)force+=w.direction*(1.4+Math.sin(game.time*1.6)*1.2)}return force}
export function updateMechanics(game,dt){
 const l=game.view.level,p=game.player.pos;
 if(l.puzzle==='plates')for(const s of game.view.switches)if(!s.active){const on=game.player.ground&&game.near(p,s.mesh.position,1.05);s.hold=on?s.hold+dt:0;s.mesh.children[1].scale.setScalar(1+Math.min(1,s.hold/.65));if(s.hold>=.65){activateLight(game,s);game.ui.message(`Sternenplatte ${game.puzzle}/${l.switchStages.length} geladen`)}}
 if(l.puzzle==='timed'&&game.puzzle>0&&game.time>=game.timerUntil){game.puzzle=0;for(const s of game.view.switches){s.active=false;s.mesh.children[1].material.color.set(0xffe38d)}game.ui.message('Zeitfenster abgelaufen. Aktiviere den Uhrschalter erneut.')}
 for(const spring of game.view.springs)if(game.player.ground&&game.time>=spring.readyAt&&game.near(p,spring.mesh.position,.65)){spring.readyAt=game.time+.8;game.player.velocity.y=10.5;game.player.ground=false;game.player.coyote=0;game.kiko.react('collect');game.audio.tone(620,.2,'triangle');game.view.burst(spring.mesh.position,0xffd5ed)}
 for(const beam of game.view.hazards)if(Math.abs(p.x-beam.mesh.position.x)<.43&&Math.abs(p.z-beam.mesh.position.z)<beam.depth/2&&p.y<beam.y+.5&&p.y+1.15>beam.y&&game.player.invincible<=0){if(game.damage('beam'))return}
 game.view.setPuzzle(game.puzzleDone())
}
