'use strict';
/* ZOTIK Mini-Spielhalle – unabhängig vom Abenteuer und dessen Spielständen. */
(function(){
  const games=[
    {id:'riss',icon:'⚡',name:'ZOTIK Run',type:'Geschick',desc:'Renne durch Lunaris, weiche Riftlingen aus und sammle Mondsplitter.',color:'#4be3c8'},
    {id:'felli',icon:'🐾',name:'Felli-Fang',type:'Arcade',desc:'Fange magische Sterne, bevor die Zeit abläuft.',color:'#ffce7d'},
    {id:'kristall',icon:'💎',name:'Kristallrausch',type:'Reaktion',desc:'Tippe die leuchtenden Kristalle, nicht die Schatten.',color:'#a4a0ff'},
    {id:'quiz',icon:'📜',name:'ZOTIK Quiz',type:'Wissen',desc:'Teste dein Wissen über Lunaris, Felli und die zehn Welten.',color:'#ffbd7e'},
    {id:'sterne',icon:'🌟',name:'Sternenpuzzle',type:'Gedächtnis',desc:'Merke dir die Sternfolge und wiederhole sie.',color:'#ff88c7'}
  ];
  const key='zotik_mini_records_v1';let records={};try{records=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(_){}
  const root=document.createElement('section');root.id='zMini';root.hidden=true;root.setAttribute('aria-label','ZOTIK Mini-Spiele');
  root.innerHTML='<div class="zmShell"><header class="zmTop"><div><small>✦ ZOTIK ARCADE ✦</small><h2>Mini-Spiele</h2><p>Magische Herausforderungen aus den Splitterwelten</p></div><button id="zmBack" type="button">✕ Schließen</button></header><div id="zmList" class="zmGrid"></div><section id="zmStage" hidden><div class="zmGameBar"><strong id="zmTitle"></strong><span id="zmScore"></span><button id="zmExit" type="button">↩ Übersicht</button></div><canvas id="zmCanvas" width="720" height="420" aria-label="Minispiel Spielfeld"></canvas><div id="zmQuiz" hidden></div><p id="zmHint"></p><div id="zmActions"><button id="zmLeft" type="button">◀ Links</button><button id="zmAction" type="button">▶ Starten</button><button id="zmRight" type="button">Rechts ▶</button></div></section></div>';
  document.body.appendChild(root);
  const css=document.createElement('style');css.textContent=`
  #zMini{position:fixed;inset:0;z-index:120000;background:radial-gradient(ellipse at 20% 0%,#233b75 0%,#0b102c 55%,#07091d 100%);color:#edf3ff;font-family:Fredoka,system-ui,sans-serif;overflow:auto;touch-action:pan-y}
  #zMini[hidden],#zmStage[hidden]{display:none!important}
  #zMini .zmShell{width:min(1060px,calc(100% - 28px));margin:auto;padding:clamp(16px,4vw,36px) 0 42px}
  #zMini button{cursor:pointer;font:700 15px Fredoka,system-ui,sans-serif;color:#fff;background:linear-gradient(135deg,#315da2,#27346d);border:1px solid #638bc4;border-radius:13px;padding:11px 16px}
  #zMini button:focus-visible{outline:3px solid #ffd16f;outline-offset:2px}
  #zMini button:active{transform:scale(.97)}
  .zmTop{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:23px}
  .zmTop small{letter-spacing:.28em;color:#ffc861;font-weight:800}
  .zmTop h2{font-size:clamp(33px,6vw,60px);line-height:1.06;margin:8px 0;color:#fff;text-shadow:0 3px 18px #4c72bd}
  .zmTop p{margin:0;color:#bdcce9}
  .zmGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr));gap:16px}
  .zmCard{text-align:left;min-height:230px;padding:22px!important;border-radius:22px!important;display:flex;flex-direction:column;align-items:flex-start;gap:10px;background:linear-gradient(150deg,#273968,#101733 75%)!important;box-shadow:0 12px 35px #0007}
  .zmCard:hover{transform:translateY(-3px);border-color:#ffd16f!important}
  .zmCard .zmIcon{font-size:54px;filter:drop-shadow(0 5px 16px #0008)}
  .zmCard b{font-size:22px;color:#fff}
  .zmCard .zmDesc{font-weight:500;color:#c6d3ed;font-size:14px;line-height:1.4}
  .zmCard .zmRecord{margin-top:auto;color:#ffc861;font-size:13px}
  #zmStage{border:1px solid #607caf;border-radius:24px;background:#111b40;padding:clamp(10px,3vw,22px);box-shadow:0 15px 40px #0008}
  .zmGameBar{display:flex;align-items:center;gap:12px;justify-content:space-between;flex-wrap:wrap;margin-bottom:12px}
  #zmTitle{font-size:clamp(19px,3vw,28px)}#zmScore{color:#ffc861;font-size:17px}
  #zmCanvas{display:block;width:100%;max-height:min(58vh,540px);aspect-ratio:12/7;border-radius:15px;background:#08122e;touch-action:none}
  #zmHint{text-align:center;color:#cedcf8;min-height:24px}
  #zmActions{display:flex;justify-content:center;gap:12px;flex-wrap:wrap}
  @media(max-width:540px){.zmTop{align-items:flex-start}.zmTop p{font-size:13px}#zMini button{padding:10px 12px}.zmGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.zmCard{min-height:203px;padding:13px!important}.zmCard b{font-size:17px}.zmCard .zmIcon{font-size:36px}.zmCard .zmDesc{font-size:12px}}

  #zMini #zmQuiz{position:absolute;inset:0;z-index:7;display:grid;place-items:center;background:radial-gradient(circle at 50% 0%,#314e7a,#0b1232 70%);overflow-y:auto;padding:100px 15px 85px}
  #zMini #zmQuiz[hidden],#zMini #zmCanvas[hidden],#zMini #zmLeft[hidden],#zMini #zmRight[hidden]{display:none!important}
  #zMini .zqPanel{width:min(760px,100%);padding:clamp(20px,4vw,42px);background:linear-gradient(145deg,#293d6d,#101a3a);border:1px solid #90b3e85e;border-radius:26px;box-shadow:0 18px 60px #000a}
  #zMini .zqPanel small{color:#ffc861;letter-spacing:.15em;font-weight:800}
  #zMini .zqPanel p{color:#bad1f4}
  #zMini .zqPanel h3{font-size:clamp(24px,4vw,40px);margin:10px 0 25px;line-height:1.2}
  #zMini .zqAnswers{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
  #zMini .zqAnswers button{padding:20px;text-align:left;border-radius:15px;background:linear-gradient(120deg,#304d7c,#1c2d50);border:1px solid #9cb5e77a}
  #zMini .zqAnswers button.zqCorrect{background:#167567!important;border-color:#81f8c4!important}
  #zMini .zqAnswers button.zqWrong{background:#813c56!important;border-color:#f59ab1!important}
  #zMini .zqFeedback{min-height:26px;color:#ffdc83!important;font-weight:700}
  @media(max-width:600px){#zMini .zqAnswers{grid-template-columns:1fr;gap:8px}#zMini .zqAnswers button{padding:12px 14px}#zMini #zmQuiz{padding-top:110px}}
  `;document.head.appendChild(css);
  const $=id=>document.getElementById(id),canvas=$('zmCanvas'),ctx=canvas.getContext('2d');
  let active=null,raf=0,last=0,score=0,time=0,running=false,items=[],seq=[],turn=0,phase='',phaseUntil=0,player=360,hold=0,spawn=0;
  // Canvas bleibt intern bei 720x420, wird aber proportional auf die komplette
  // verfügbare Spielfläche skaliert. Touch-Koordinaten nutzen dieselbe Abbildung.
  function fitStage(){
    const box=canvas.getBoundingClientRect();
    const sx=box.width/720,sy=box.height/420,scale=Math.min(sx,sy);
    canvas.style.setProperty('--game-scale',String(scale));
  }
  window.addEventListener('resize',fitStage);

  const questions=[
    ['Wie heißt die Startwelt?','Lunaris','Elaris','Ignara','Elyndra',0],
    ['Wer begleitet ZOTIK?','Mara','Felli','Orun','Elyon',1],
    ['Was soll ZOTIK für Mira sammeln?','Mondkräuter','Eiskristalle','Lavasteine','Sternenstaub',0],
    ['Welche Gegner bekämpft ZOTIK im Mondwald?','Pilzlinge','Spiegelspinnen','Riftlinge','Echokrieger',2],
    ['Welche Welt heißt „Der Weltenkern“?','Elyndra','Noctaris','Solmera','Valdoria',0],
    ['Welche Welt ist „Der Wald, der sich erinnert“?','Astralis','Elaris','Aqualis','Frosthain',1],
    ['Wie heißt der Wald der Startwelt?','Mondwald','Sonnenhain','Kristallwald','Nebelforst',0],
    ['Wer hat eine Werkstatt im Westen von Lunaris?','Mira','Orun','Felli','Professorium',3],
    ['Wer ist ein Boss des ersten Kapitels?','Elyon','Mondwolf-Alpha','Wurzelkönigin','Spiegelspinne',1],
    ['Wie viele Mondkräuter möchte Mira?','Vier','Fünf','Drei','Zwei',2],
    ['Welche Welt folgt auf Lunaris?','Ignara','Elaris','Aqualis','Noctaris',1],
    ['Welche Welt ist Kapitel 10?','Elyndra','Astralis','Frosthain','Valdoria',0]
  ];
  let quizOrder=[],quizIndex=0,quizLocked=false,runLives=3,runLane=1,runDistance=0;
  function quizNext(){
    if(!active||active.id!=='quiz'||!running)return;
    if(quizIndex>=quizOrder.length){end();return}
    const q=questions[quizOrder[quizIndex]],host=$('zmQuiz');
    quizLocked=false;
    host.innerHTML='<div class="zqPanel"><small>✦ CHRONIK DER SPLITTERWELTEN</small><p>Frage '+(quizIndex+1)+' / '+quizOrder.length+'</p><h3></h3><div class="zqAnswers"></div><p class="zqFeedback" aria-live="polite"></p></div>';
    host.querySelector('h3').textContent=q[0];
    const answers=host.querySelector('.zqAnswers');
    for(let n=0;n<4;n++){const b=document.createElement('button');b.textContent=String.fromCharCode(65+n)+' · '+q[n+1];b.onclick=()=>{
      if(quizLocked)return;quizLocked=true;
      if(n===q[5])point();
      b.classList.add(n===q[5]?'zqCorrect':'zqWrong');
      answers.children[q[5]].classList.add('zqCorrect');
      host.querySelector('.zqFeedback').textContent=n===q[5]?'Richtig! +1 Stern':'Richtig ist: '+q[q[5]+1];
      setTimeout(()=>{if(active&&active.id==='quiz'&&running){quizIndex++;quizNext()}},950);
    };answers.appendChild(b)}
  }
  function runDraw(dt){
    const h=420;
    ctx.fillStyle='#101f3e';ctx.fillRect(0,0,720,h);
    for(let k=0;k<65;k++)circle((k*173)%720,(k*79)%125,1.3,'#a9ceff');
    ctx.fillStyle='#23566b';ctx.fillRect(0,125,720,295);
    ctx.beginPath();ctx.moveTo(305,125);ctx.lineTo(415,125);ctx.lineTo(690,420);ctx.lineTo(30,420);ctx.fillStyle='#283353';ctx.fill();
    ctx.strokeStyle='#7da4e2';ctx.lineWidth=3;
    for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(360+side*20,125);ctx.lineTo(360+side*115,420);ctx.stroke()}
    for(let k=0;k<8;k++){let z=((k/8+time*.7)%1);ctx.fillStyle='#dceaff88';ctx.fillRect(359,125+z*z*295,3,4+z*12)}
    for(let k=items.length-1;k>=0;k--){
      const o=items[k];o.y+=(200+time*7)*dt;let depth=Math.min(1,Math.max(0,(o.y-125)/295)),x=360+(o.lane-1)*(35+depth*105);
      circle(x,o.y,11+depth*22,o.bad?'#f46b8e':'#67e3ce');text(o.bad?'✕':'✦',x,o.y+9,20+depth*20,o.bad?'#fff':'#fff6a7');
      if(o.y>333&&o.y<385&&o.lane===runLane){
        if(o.bad){runLives--;if(runLives<=0){end();return}}else point();
        items.splice(k,1);
      }else if(o.y>450)items.splice(k,1);
    }
    const px=[216,360,504][runLane];circle(px,342,26,'#ff9040');circle(px,309,19,'#ffbb6d');ctx.fillStyle='#152a51';ctx.fillRect(px-17,350,34,24);
    text('❤️ '+runLives,95,75,25);text('🌙 '+Math.ceil(Math.max(0,45-time))+'s',360,75,25);text('✦ '+score,628,75,25);
    if(time>=45)end();
  }
  const rnd=(a,b)=>a+Math.random()*(b-a);
  function ui(){ $('zmList').innerHTML='';games.forEach(g=>{const b=document.createElement('button');b.className='zmCard';b.style.setProperty('--accent',g.color);b.type='button';b.innerHTML='<span class="zmIcon">'+g.icon+'</span><b>'+g.name+'</b><span class="zmDesc">'+g.desc+'</span><span class="zmRecord">'+g.type+' · 🏆 Bestwert: '+(records[g.id]||0)+'</span><span class="zmPlay">Jetzt spielen →</span>';b.onclick=()=>choose(g);$('zmList').appendChild(b)})}
  function drawBase(){ctx.clearRect(0,0,720,420);let grad=ctx.createLinearGradient(0,0,720,420);grad.addColorStop(0,'#16285d');grad.addColorStop(1,'#080d2b');ctx.fillStyle=grad;ctx.fillRect(0,0,720,420);ctx.strokeStyle='#ffffff0b';for(let x=0;x<720;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,420);ctx.stroke()}}
  function circle(x,y,r,col){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=col;ctx.fill()}
  function text(t,x,y,size=30,col='#fff'){ctx.fillStyle=col;ctx.font='700 '+size+'px Fredoka,system-ui';ctx.textAlign='center';ctx.fillText(t,x,y)}
  function point(){score++;$('zmScore').textContent='⭐ '+score}
  function end(){if(!running)return;running=false;hold=0;if(active.id==='quiz'){$('zmQuiz').hidden=true;canvas.hidden=false;}if(score>(records[active.id]||0)){records[active.id]=score;try{localStorage.setItem(key,JSON.stringify(records))}catch(_){}}$('zmAction').textContent='↻ Noch einmal';$('zmHint').textContent='Runde beendet! ⭐ '+score+' Punkte · Bestwert '+records[active.id];drawBase();text('Runde geschafft!',360,177,42,'#ffc861');text(score+' Punkte',360,239,35);ui()}
  function start(){if(!active)return;running=true;score=0;time=0;spawn=0;player=360;hold=0;items=[];seq=[];turn=0;phase='';phaseUntil=0;runLives=3;runLane=1;quizIndex=0;$('zmQuiz').hidden=active.id!=='quiz';canvas.hidden=active.id==='quiz';$('zmScore').textContent='⭐ 0';$('zmAction').textContent='↻ Neustart';$('zmHint').textContent=active.id==='sterne'?'Merke dir die Farben!':active.id==='riss'?'Mit ◀ ▶ oder A/D ausweichen':'Tippe die Ziele auf dem Spielfeld';if(active.id==='sterne')nextSeq();if(active.id==='quiz'){quizOrder=questions.map((_,i)=>i).sort(()=>Math.random()-.5).slice(0,10);quizNext()}}
  function nextSeq(){seq.push(Math.floor(Math.random()*4));turn=0;phase='show';phaseUntil=time+1.3+seq.length*.62;$('zmHint').textContent='Merke: '+seq.map(n=>['🔴','🟡','🟢','🔵'][n]).join(' ')}
  function choose(g){active=g;running=false;cancelAnimationFrame(raf);root.classList.add('zmPlaying');$('zmList').hidden=true;$('zmStage').hidden=false;$('zmTitle').textContent=g.icon+' '+g.name;$('zmScore').textContent='⭐ 0';$('zmHint').textContent=g.desc;$('zmAction').textContent='▶ Starten';const move=g.id==='riss';$('zmQuiz').hidden=g.id!=='quiz';canvas.hidden=g.id==='quiz';$('zmLeft').hidden=!move;$('zmRight').hidden=!move;drawBase();text(g.icon,360,205,98);fitStage();last=performance.now();raf=requestAnimationFrame(frame)}
  function leave(){running=false;cancelAnimationFrame(raf);root.classList.remove('zmPlaying');active=null;$('zmQuiz').hidden=true;canvas.hidden=false;$('zmStage').hidden=true;$('zmList').hidden=false;ui()}
  function close(){leave();root.hidden=true;document.body.style.overflow=''}
  function frame(now){const dt=Math.min(.05,(now-last)/1000||0);last=now;raf=requestAnimationFrame(frame);if(!active)return;if(!running)return;time+=dt;drawBase();
    if(active.id==='riss'){spawn+=dt;if(spawn>.65){spawn=0;items.push({lane:Math.floor(Math.random()*3),y:125,bad:Math.random()<.62})}runDraw(dt)}
    else if(active.id==='quiz'){return}
    else if(active.id==='felli'||active.id==='kristall'){spawn+=dt;if(spawn>.65&&items.length<7){spawn=0;items.push({x:rnd(45,675),y:rnd(70,370),bad:Math.random()<.24,life:1.9})}for(let i=items.length-1;i>=0;i--){const o=items[i];o.life-=dt;text(active.id==='felli'?(o.bad?'🌀':'⭐'):(o.bad?'🌑':'💎'),o.x,o.y,40);if(o.life<=0)items.splice(i,1)}text('Zeit: '+Math.max(0,Math.ceil(30-time)),360,42,22);if(time>=30)end()}
    else{const colors=['#ff6484','#ffcf68','#6be7ab','#67adff'];for(let i=0;i<4;i++){ctx.fillStyle=colors[i];ctx.globalAlpha=phase==='show'&&time<phaseUntil&&i===seq[Math.min(seq.length-1,Math.floor((phaseUntil-time)/.62))]?1:.65;ctx.fillRect(90+i*142,145,115,115);ctx.globalAlpha=1}if(phase==='show'&&time>=phaseUntil){phase='input';$('zmHint').textContent='Jetzt die Farben in der richtigen Reihenfolge antippen!'}if(phase==='next'&&time>=phaseUntil)nextSeq();text('Runde '+seq.length,360,78,28);if(seq.length>=9){score=seq.length;end()}}
  }
  function hit(ev){if(!running)return;const rect=canvas.getBoundingClientRect(),x=(ev.clientX-rect.left)*720/rect.width,y=(ev.clientY-rect.top)*420/rect.height;
    if(active.id==='riss'){runLane=x<240?0:x>480?2:1;return}
    if(active.id==='sterne'){if(phase!=='input'||y<145||y>260)return;const n=Math.floor((x-90)/142);if(n<0||n>3)return;if(n!==seq[turn]){end();return}turn++;if(turn===seq.length){score=seq.length;$('zmScore').textContent='⭐ '+score;phase='next';phaseUntil=time+.7;$('zmHint').textContent='Richtig! ⭐'}return}
    for(let i=items.length-1;i>=0;i--){let o=items[i];if(Math.hypot(o.x-x,o.y-y)<35){if(o.bad){score=Math.max(0,score-2);$('zmScore').textContent='⭐ '+score}else point();items.splice(i,1);return}}
  }
  canvas.addEventListener('pointerdown',hit);
  $('zmAction').onclick=start;$('zmExit').onclick=leave;$('zmBack').onclick=close;
  const motion=(v)=>{if(active&&active.id==='riss'&&running)runLane=Math.max(0,Math.min(2,runLane+v))};$('zmLeft').addEventListener('pointerdown',()=>motion(-1));$('zmRight').addEventListener('pointerdown',()=>motion(1));for(let el of [$('zmLeft'),$('zmRight')])for(let ev of ['pointerup','pointercancel','pointerleave'])el.addEventListener(ev,()=>motion(0));
  window.addEventListener('keydown',e=>{if(root.hidden)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();active?leave():close()}else if(active&&active.id==='riss'){if(!e.repeat){if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')motion(-1);if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')motion(1)}e.stopImmediatePropagation()}},true);
  window.addEventListener('keyup',e=>{if(!root.hidden){hold=0;e.stopImmediatePropagation()}},true);
  window.ZotikMinigames={open(){root.hidden=false;ui();$('zmBack').focus()},close};
})();
