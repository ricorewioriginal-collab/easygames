export function nextObjective(game){
 const {view,player}=game,l=view.level,en=game.save.data.settings.language==='en',crystal=view.crystals.find(c=>!c.got),pending=l.puzzle==='boss'?null:l.puzzle==='sequence'?view.switches[game.puzzle]:view.switches.find(s=>!s.active);
 const key=(game.save.data.keys?.interact||'KeyE').replace('Key',''),action=`${key} / X / ${en?'ACTION':'AKTION'}`;
 let target,title,detail,goalIndex=0,kind;
 if(pending&&(!crystal||pending.pathIndex<crystal.pathIndex)){
  target=pending.mesh.position;goalIndex=pending.pathIndex;kind=l.puzzle;
  const names={sequence:en?`Lightstone ${game.puzzle+1}`:`Lichtstein ${game.puzzle+1}`,key:en?'Find the golden key':'Goldenen Schlüssel finden',bridge:en?'Activate the bridge switch':'Brückenschalter aktivieren',dual:en?'Activate both sky switches':'Beide Himmelsschalter aktivieren',beacons:en?`Light beacon ${game.puzzle+1}`:`Leuchtfeuer ${game.puzzle+1} entzünden`,plates:en?`Charge plate ${game.puzzle+1}`:`Sternenplatte ${game.puzzle+1} laden`,timed:en?'Start the clock switch':'Uhrschalter starten'};
  title=names[l.puzzle];detail=l.puzzle==='plates'?(en?'Stand on the plate for a moment.':'Bleibe kurz auf der Platte stehen.'):l.puzzle==='beacons'?(en?`Use your star pulse nearby: ${action}`:`Nutze den Sternenpuls in der Nähe: ${action}`):(en?`Approach and press ${action}`:`Hingehen und ${action} drücken`)
 }else if(crystal){target=crystal.mesh.position;goalIndex=crystal.pathIndex;kind='crystal';title=en?`Collect blue crystals · ${game.count}/5`:`Blaue Kristalle sammeln · ${game.count}/5`;detail=en?'Walk into the blue crystal. Gold stars are optional.':'Laufe in den blauen Kristall. Goldene Sterne sind freiwillig.'}
 else if(!game.puzzleDone()){target=view.switches[0]?.mesh.position;goalIndex=view.switches[0]?.pathIndex||0;kind='boss';title=en?`Star heart · phase ${Math.min(3,game.bossHits+1)}/3`:`Sternenherz · Phase ${Math.min(3,game.bossHits+1)}/3`;detail=en?`When blue: ${action}. Dodge purple attacks.`:`Bei Blau ${action} drücken. Violetten Angriffen ausweichen.`}
 else{target=view.portal.position;goalIndex=(l.path?.length||1)-1;kind='portal';title=en?'Enter the glowing portal':'Ins leuchtende Portal gehen';detail=en?'All pieces found. Reconnect this island!':'Alle Splitter gefunden. Verbinde diese Insel wieder!'}
 const goalTarget=target,floor=view.platforms.find(f=>f.active&&Math.abs(player.pos.x-f.x)<f.w/2-.1&&Math.abs(player.pos.z-f.z)<f.d/2-.1&&Math.abs(player.pos.y-f.y)<.18);
 if(floor)game.routeIndex=floor.index;
 const current=game.routeIndex||0;
 if(goalIndex!==current&&view.platforms.length){const next=view.platforms[current+Math.sign(goalIndex-current)];if(next){target=next;title=(en?'Route: ':'Weg: ')+title;detail=!next.active?(en?'Wait for the next island to become solid.':'Warte, bis die nächste Insel wieder fest ist.'):(en?'Follow the islands. Jump near the edge of a gap.':'Folge den Inseln. Springe an der Kante über Lücken.')}}
 if(floor&&floor.crumble&&floor.collapseAt!==null)detail=en?'This island is crumbling. Keep moving!':'Diese Insel bröckelt. Laufe rasch weiter!';
 const lesson=game.lesson;if(lesson&&!lesson.moved)detail=en?'Tip 1/3: move with the left stick or WASD.':'Tipp 1/3: Bewege dich mit dem linken Joystick oder WASD.';else if(lesson&&!lesson.collected)detail=en?'Tip 2/3: follow the arrow into the blue crystal.':'Tipp 2/3: Folge dem Pfeil in den blauen Kristall.';else if(lesson&&!lesson.jumped)detail=en?'Tip 3/3: move and tap JUMP at a gap or rock.':'Tipp 3/3: Laufe weiter und tippe an einer Lücke oder einem Felsen auf SPRUNG.';
 const dx=(target?.x||0)-player.pos.x,dz=(target?.z||0)-player.pos.z,angle=game.yaw-Math.atan2(dx,dz),arrow=['↑','↗','→','↘','↓','↙','←','↖'][((Math.round(angle/(Math.PI/4))%8)+8)%8];
 return {target,goalTarget,goalIndex,kind,title,detail,arrow,distance:Math.round(Math.hypot(dx,dz))}
}
