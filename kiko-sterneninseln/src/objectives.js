// Required switches are visited on their island, before a later crystal behind a gate.
export function nextObjective(game){
 const {view,player}=game,l=view.level,en=game.save.data.settings.language==='en';
 const crystal=view.crystals.find(c=>!c.got);
 const pending=l.puzzle==='boss'?null:l.puzzle==='sequence'?view.switches[game.puzzle]:view.switches.find(s=>!s.active);
 let target,title,detail;
 const action=en?'E / X / ACTION':'E / X / AKTION';
 if(pending&&(!crystal||pending.pathIndex<crystal.pathIndex)){
  target=pending.mesh.position;
  title=l.puzzle==='sequence'?(en?`Lightstone ${game.puzzle+1} of 3`:`Lichtstein ${game.puzzle+1} von 3`):l.puzzle==='key'?(en?'Find the golden key':'Goldenen Schlüssel finden'):l.puzzle==='bridge'?(en?'Activate the bridge switch':'Brückenschalter aktivieren'):(en?'Activate both sky switches':'Beide Himmelsschalter aktivieren');
  detail=en?`Approach and press ${action}`:`Hingehen und ${action} drücken`;
 }else if(crystal){
  target=crystal.mesh.position;title=en?`Collect blue crystals · ${game.count}/5`:`Blaue Kristalle sammeln · ${game.count}/5`;
  detail=en?'Walk into the blue crystal. Gold stars are optional.':'Laufe in den blauen Kristall. Goldene Sterne sind freiwillig.';
 }else if(!game.puzzleDone()){
  target=view.switches[0]?.mesh.position;title=en?`Purify the star heart · ${game.bossHits}/3`:`Sternenherz reinigen · ${game.bossHits}/3`;
  detail=en?`When blue: press ${action}. When purple: move away!`:`Bei Blau ${action} drücken. Bei Violett Abstand halten!`;
 }else{target=view.portal.position;title=en?'Enter the glowing portal':'Ins leuchtende Portal gehen';detail=en?'All pieces found. This island can reconnect!':'Alle Splitter gefunden. Verbinde diese Insel wieder!'}
 if(target&&crystal&&target===crystal.mesh.position){const floor=view.platforms.find(p=>p.active&&Math.abs(player.pos.x-p.x)<p.w/2&&Math.abs(player.pos.z-p.z)<p.d/2&&Math.abs(player.pos.y-p.y)<.15);if(floor&&crystal.pathIndex>floor.index&&player.pos.z>floor.z+floor.d/2-1.4)detail=en?'Gap ahead: keep moving and press JUMP / Space / A.':'Lücke voraus: weiterlaufen und SPRUNG / Leertaste / A drücken.'}
 const dx=(target?.x||0)-player.pos.x,dz=(target?.z||0)-player.pos.z,angle=game.yaw-Math.atan2(dx,dz);
 const arrow=['↑','↗','→','↘','↓','↙','←','↖'][((Math.round(angle/(Math.PI/4))%8)+8)%8];
 return {target,title,detail,arrow,distance:Math.round(Math.hypot(dx,dz))}
}
