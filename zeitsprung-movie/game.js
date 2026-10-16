import { COLLECTIONS, TRACKS, VIDEOS, questionFor } from './tracks.js';
import { speak, stop as stopVoice, readQuestion } from './vito.js';
import { KNOWLEDGE, SPECIAL_CATEGORIES } from './knowledge.js';
import { sourcesFor } from './trailer.js';
import { SOUNDTRACKS, audioChoices } from './soundtracks.js';
import { VISUALS, visualChoices } from './visual.js';
import { resolveDeezer, musicSources } from './music.js';
import { yearChoices } from './year.js';
import { IS_CONTROLLER, startController, startHost } from './pair.js';

const $ = id => document.getElementById(id);
const ids = ['boot','loadBar','bootStatus','bootStart','setup','game','players','addPlayer','category','musicMode','start','resume','menuButton','soundToggle','tvToggle','pairToggle','pairPanel','pairClose','pairDone','turnName','roundLabel','deckLabel','modeBadge','catLabel','mysteryTitle','playerBox','playMusic','switchSource','swapTrailer','mediaState','hostText','questionCategory','questionTitle','questionHint','timelineWrap','timelineCount','timeline','quizOptions','result','next','scoreboard','musicInfo'];
const ui = Object.fromEntries(ids.map(id => [id, $(id)]));
const colors = ['#ff6aab','#70ebff','#ffce72','#aa91ff'];
const SAVE_KEY = 'zm-save-v1';
const trackById = new Map(TRACKS.map(track => [track.id, track]));
const playable = TRACKS.filter(track => VIDEOS[track.title]);
const studios = [...new Set(TRACKS.map(film=>film.studio))];
const studioQuestions = TRACKS.map((film, index) => {
  const others=studios.filter(studio=>studio!==film.studio);
  const wrong=[others[(index+3)%others.length],others[(index+7)%others.length],others[(index+11)%others.length]];
  return { id: `studio:${film.id}`, category: film.category, prompt: `Welches Studio steht hinter „${film.title}“?`, answer: film.studio, options: [film.studio, ...wrong] };
});
const filmQuestions = TRACKS.map((film, index) => {
  const others=TRACKS.filter(other=>other.studio!==film.studio).map(other=>other.title);
  const wrong=[others[(index+7)%others.length],others[(index+31)%others.length],others[(index+59)%others.length]];
  return { id: `film:${film.id}`, category: film.category, prompt: `Welcher dieser Filme stammt von ${film.studio}?`, answer: film.title, options: [film.title, ...wrong] };
});
const quizBank = [...KNOWLEDGE, ...studioQuestions, ...filmQuestions];
const quizById = new Map(quizBank.map(question => [question.id, question]));
const audioById = new Map(SOUNDTRACKS.map(item => [item.id, item]));
const visualById = new Map(VISUALS.map(item => [item.id, item]));
const state = { players: [], active: 0, rounds: 0, clipDeck: [], quizDeck: [], audioDeck: [], visualDeck: [], current: null, starter: null, solved: false, lastCorrect: false, voice: true, playing: false, pair: null, result: '', filter: 'all', musicMode: 'choice', finished: false, sourceList: [], sourceIndex: 0 };
let audioContext;

function shuffle(items) { const a=[...items]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
function setBoot(percent, message) { ui.loadBar.style.width=`${percent}%`; ui.bootStatus.textContent=message; }
function finishBoot(auto = false) {
  setTimeout(()=>setBoot(52,'Fragen und Filmdaten geladen …'),180);
  setTimeout(()=>setBoot(82,'3D-Studio und Spielmenü bereit …'),630);
  setTimeout(()=>{
    setBoot(100,'Bereit für deine Filmshow!');
    ui.bootStart.classList.remove('hidden');
    ui.bootStart.onclick=()=>{ui.boot.classList.add('done');setTimeout(()=>ui.boot.remove(),600);};
    if(auto)ui.bootStart.click();
    else ui.bootStart.focus();
  },1080);
}
function safeStorage(action) { try { return action(); } catch (_) { return null; } }
function currentPlayer() { return state.players[state.active]; }
function sortedTimeline(player=currentPlayer()) { return [...player.timeline].sort((a,b) => a.year-b.year || a.title.localeCompare(b.title)); }
function clipPool(filter=state.filter) { return SPECIAL_CATEGORIES.includes(filter) ? [] : filter === 'all' ? playable : playable.filter(track => track.category === filter); }
function quizPool(filter=state.filter) { return filter === 'all' ? quizBank : quizBank.filter(q => q.category === filter); }
function audioPool(filter=state.filter) { return filter === 'all' ? SOUNDTRACKS : SOUNDTRACKS.filter(item => item.category === filter); }
function visualPool(filter=state.filter) { return filter === 'all' ? VISUALS : VISUALS.filter(item => item.category === filter); }
function saveSession() {
  if (!state.current || state.finished) return;
  const saved = { version: 2, savedAt: Date.now(), filter: state.filter, musicMode: state.musicMode, active: state.active, rounds: state.rounds, solved: state.solved, lastCorrect: state.lastCorrect, result: state.result, starter: state.starter?.id, current: { type: state.current.type, id: state.current.question?.id || state.current.track?.id || state.current.item?.id, options: state.current.options }, players: state.players.map(p => ({ name: p.name, score: p.score, timeline: p.timeline.map(t => t.id) })), clipDeck: state.clipDeck.map(t => t.id), quizDeck: state.quizDeck.map(q => q.id), audioDeck: state.audioDeck.map(item => item.id), visualDeck: state.visualDeck.map(item => item.id) };
  safeStorage(() => localStorage.setItem(SAVE_KEY, JSON.stringify(saved)));
  ui.resume.classList.remove('hidden');
}
function loadSaved() {
  const raw = safeStorage(() => localStorage.getItem(SAVE_KEY)); if (!raw) return false;
  try {
    const saved=JSON.parse(raw); if (saved.version!==2 || !saved.current || !Array.isArray(saved.players) || !saved.players.length || saved.players.length>4) return false;
    const players=saved.players.map(p => ({ name:String(p.name).slice(0,22), score:Number(p.score)||0, timeline:p.timeline.map(id=>trackById.get(id)).filter(Boolean) }));
    const starter=trackById.get(saved.starter); if (!starter || players.some(p=>!p.timeline.length)) return false;
    const type=saved.current.type;
    const current=type==='quiz' ? {type,question:quizById.get(saved.current.id),options:saved.current.options} : type==='audio'||type==='visual' ? {type,item:(type==='audio'?audioById:visualById).get(saved.current.id),options:saved.current.options} : {type:type==='year'?'year':'timeline',track:trackById.get(saved.current.id),options:saved.current.options};
    if (!current.track && !current.question && !current.item) return false;
    Object.assign(state,{players,starter,current,active:Math.min(Math.max(0,Number(saved.active)||0),players.length-1),rounds:Number(saved.rounds)||1,solved:!!saved.solved,lastCorrect:!!saved.lastCorrect,result:String(saved.result||''),filter:saved.filter||'all',musicMode:saved.musicMode==='choice'?'choice':'timeline',clipDeck:(saved.clipDeck||[]).map(id=>trackById.get(id)).filter(Boolean),quizDeck:(saved.quizDeck||[]).map(id=>quizById.get(id)).filter(Boolean),audioDeck:(saved.audioDeck||[]).map(id=>audioById.get(id)).filter(Boolean),visualDeck:(saved.visualDeck||[]).map(id=>visualById.get(id)).filter(Boolean),playing:false,finished:false,sourceList:[],sourceIndex:0});
    return true;
  } catch (_) { return false; }
}
function playerInputs() {
  ui.players.replaceChildren();
  state.players.forEach((player,index) => {
    const label=document.createElement('label'); label.className='player-input';
    const dot=document.createElement('span'); dot.textContent=index+1; dot.style.background=colors[index];
    const input=document.createElement('input'); input.value=player.name; input.maxLength=22; input.placeholder=`Spieler ${index+1}`; input.setAttribute('aria-label',`Name Spieler ${index+1}`);
    input.oninput=()=>{player.name=input.value;}; label.append(dot,input); ui.players.append(label);
  });
  ui.addPlayer.hidden=state.players.length>=4;
}
function init() {
  setBoot(18,'Fragen und Trailer werden sortiert …');
  if (IS_CONTROLLER) { startController(); finishBoot(true); return; }
  state.players=[{name:'Spieler 1',score:0,timeline:[]}]; playerInputs();
  for (const category of [...Object.keys(COLLECTIONS),...SPECIAL_CATEGORIES]) { const option=document.createElement('option'); option.value=category; option.textContent=`${category} · ${quizPool(category).length+audioPool(category).length+visualPool(category).length} Fragen`; ui.category.append(option); }
  ui.addPlayer.onclick=()=>{if(state.players.length<4){state.players.push({name:`Spieler ${state.players.length+1}`,score:0,timeline:[]});playerInputs();}};
  ui.start.onclick=startGame;
  ui.resume.onclick=()=>{if(loadSaved()){ui.category.value=state.filter;ui.musicMode.value=state.musicMode;playerInputs();showGame();renderRound();state.pair?.broadcast();say(`Willkommen zurück! ${currentPlayer().name}, deine Show geht weiter.`);readCurrent();}else{ui.resume.classList.add('hidden');}};
  ui.menuButton.onclick=showMenu;
  $('menuTv').onclick=()=>{document.body.classList.add('tv-mode');ui.tvToggle.setAttribute('aria-pressed','true');openPair();};
  ui.playMusic.onclick=playMusic;
  ui.switchSource.onclick=switchSource;
  ui.swapTrailer.onclick=swapTrailer;
  ui.soundToggle.onclick=()=>{state.voice=!state.voice;ui.soundToggle.setAttribute('aria-pressed',String(state.voice));ui.soundToggle.textContent=state.voice?'♫':'♪';if(!state.voice)stopVoice();if(state.voice)say('Vito ist wieder live!');};
  ui.tvToggle.onclick=()=>{const enabled=!document.body.classList.contains('tv-mode');document.body.classList.toggle('tv-mode',enabled);ui.tvToggle.setAttribute('aria-pressed',String(enabled));if(enabled)openPair();else{state.pair?.destroy();state.pair=null;ui.pairPanel.classList.add('hidden');}};
  ui.pairToggle.onclick=()=>{document.body.classList.add('tv-mode');ui.tvToggle.setAttribute('aria-pressed','true');openPair();};
  ui.pairClose.onclick=ui.pairDone.onclick=()=>ui.pairPanel.classList.add('hidden');
  addEventListener('keydown',event=>{if(ui.game.classList.contains('hidden')||state.solved)return;const index=state.current.type==='timeline'?'123456789'.indexOf(event.key):'abcd'.indexOf(event.key.toLowerCase())>=0?'abcd'.indexOf(event.key.toLowerCase()):'1234'.indexOf(event.key);if(index<0)return;if(state.current.type==='timeline')ui.timeline.querySelectorAll('.slot')[index]?.click();else ui.quizOptions.querySelectorAll('button')[index]?.click();});
  addEventListener('pagehide',saveSession);
  if (safeStorage(()=>localStorage.getItem(SAVE_KEY))) ui.resume.classList.remove('hidden');
  initStage(); finishBoot();
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(() => {});
}
function showMenu() { if(!ui.game.classList.contains('hidden'))saveSession();stopPlayer();ui.game.classList.add('hidden');ui.setup.classList.remove('hidden');playerInputs();scrollTo({top:0,behavior:'smooth'});state.pair?.broadcast(); }
function showGame() { ui.setup.classList.add('hidden');ui.game.classList.remove('hidden');scrollTo({top:0,behavior:'smooth'}); }
function tone(freq,duration,type='sine') { if(!state.voice)return;try{audioContext||=new(window.AudioContext||window.webkitAudioContext)();audioContext.resume();const o=audioContext.createOscillator(),g=audioContext.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.035,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+duration);o.connect(g).connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+duration);}catch(_){}}
function say(message,queue=false) { ui.hostText.textContent=message;if(state.voice)speak(message,{queue}); }
function readCurrent() { if(!state.voice||!state.current||state.solved)return;const options=ui.quizOptions.classList.contains('hidden')?[]:[...ui.quizOptions.querySelectorAll('button')].map(button=>button.lastChild.textContent);readQuestion(ui.questionTitle.textContent,options); }
function openPair() {
  state.pair ||= startHost({
    allocate(name) {
      let slot=state.players.findIndex((_,i)=>!state.pair.has(i));
      if(slot<0&&state.players.length<4){slot=state.players.length;state.players.push({name,score:0,timeline:state.starter?[state.starter]:[]});}
      if(slot<0)return -1;state.players[slot].name=name;if(ui.game.classList.contains('hidden'))playerInputs();else{renderScores();if(slot===state.active)ui.turnName.textContent=name;}saveSession();return slot;
    },
    onLeave(){},
    onAnswer(slot,position){if(slot===state.active&&state.current?.type==='timeline'&&!state.solved&&!ui.game.classList.contains('hidden')){const timeline=sortedTimeline();if(position>=0&&position<=timeline.length)answerTimeline(position,timeline);}},
    onChoice(slot,choice){if(slot===state.active&&!state.solved&&!ui.game.classList.contains('hidden')&&choice>=0&&choice<4){if(state.current?.type==='quiz')answerQuiz(choice);else if(state.current?.type==='year')answerYear(choice);else if(['audio','visual'].includes(state.current?.type))answerFeature(choice);}},
    onPlay(slot){if(slot===state.active&&['timeline','year','audio'].includes(state.current?.type)&&!state.solved)playMusic();},
    onSource(slot){if(slot===state.active&&['timeline','year','audio'].includes(state.current?.type)&&!state.solved)switchSource();},
    onNext(slot){if(slot===state.active&&state.solved&&!ui.next.classList.contains('hidden'))ui.next.click();},
    snapshot(){const timeline=currentPlayer()?sortedTimeline():[];const slots=Array.from({length:timeline.length+1},(_,i)=>i===0?`Vor ${timeline[0]?.year||'allen Filmen'}`:i===timeline.length?`Nach ${timeline[i-1].year}`:`Zwischen ${timeline[i-1].year} und ${timeline[i].year}`);return{phase:ui.game.classList.contains('hidden')?'setup':'game',players:state.players.map(p=>({name:p.name,score:p.score})),active:state.active,round:state.rounds,solved:state.solved,playing:state.playing,slots,result:state.result,type:state.current?.type||'',prompt:state.current?.type==='quiz'?state.current.question.prompt:state.current?.type==='audio'?'Zu welchem Film oder welcher Serie gehört die Musik?':state.current?.type==='visual'?'Welcher Film oder welche Serie passt zu den Symbolen?':'Aus welchem Jahr stammt dieser Film?',options:['quiz','year','audio','visual'].includes(state.current?.type)?state.current.options:[],category:state.current?.question?.category||state.current?.track?.category||state.current?.item?.category||'',symbols:state.current?.type==='visual'?state.current.item.symbols:[]};}
  });state.pair.open();
}
function startGame() {
  state.players.forEach((p,i)=>{p.name=p.name.trim()||`Spieler ${i+1}`;p.score=0;p.timeline=[];});
  state.filter=ui.category.value;state.musicMode=ui.musicMode.value;state.active=0;state.rounds=0;state.finished=false;state.solved=false;state.result='';
  const starters=state.filter==='all'||SPECIAL_CATEGORIES.includes(state.filter)?TRACKS:TRACKS.filter(t=>t.category===state.filter);
  state.starter=shuffle(starters)[0];state.players.forEach(p=>p.timeline.push(state.starter));
  state.clipDeck=shuffle(clipPool().filter(track=>track.id!==state.starter.id));state.quizDeck=shuffle(quizPool());state.audioDeck=shuffle(audioPool());state.visualDeck=shuffle(visualPool());
  showGame();tone(523,.18);setTimeout(()=>tone(784,.3),130);
  say(state.musicMode==='timeline'
    ? `Willkommen bei Zeitsprung Movie! Ich bin Vito. Der Startfilm ist ${state.starter.title} von ${state.starter.studio}, aus ${state.starter.year}. Acht Punkte bringen den Sieg!`
    : 'Willkommen bei Zeitsprung Movie! Ich bin Vito. In Trailerrunden siehst du einen Trailer und wählst das Kinostartjahr aus A bis D. Acht Punkte bringen den Sieg!');
  nextRound(false);
}
function pickQuiz() {
  if(!state.quizDeck.length)state.quizDeck=shuffle(quizPool());
  let index=state.quizDeck.length-1;
  if(state.filter==='all') {
    const kind=shuffle(['studio:','film:','k:Kinderserien:','k:Serien & Figuren:','k:Streaming & Plattformen:','k:'])[0];
    const matches=state.quizDeck.map((question,i)=>({question,i})).filter(({question})=>question.id.startsWith(kind));
    if(matches.length)index=matches[Math.floor(Math.random()*matches.length)].i;
  }
  const [question]=state.quizDeck.splice(index,1);
  return{type:'quiz',question,options:shuffle(question.options)};
}
function musicRound(track) { return state.musicMode==='choice'?{type:'year',track,options:yearChoices(track.year)}:{type:'timeline',track}; }
function pickTrailer() { if(!state.clipDeck.length)state.clipDeck=shuffle(clipPool().filter(track=>!state.players.some(player=>player.timeline.some(card=>card.id===track.id))));const track=state.clipDeck.pop();return track?musicRound(track):pickQuiz(); }
function pickFeature(type) {
  const pool=type==='audio'?audioPool():visualPool();const key=type==='audio'?'audioDeck':'visualDeck';
  if(!state[key].length)state[key]=shuffle(pool);
  const item=state[key].pop();if(!item)return pickQuiz();
  const options=type==='audio'?audioChoices(item,SOUNDTRACKS):visualChoices(item,VISUALS);
  return options.length===4?{type,item,options}:pickQuiz();
}
function nextRound(announce=true) {
  stopPlayer();state.playing=false;state.solved=false;state.lastCorrect=false;state.result='';state.sourceList=[];state.sourceIndex=0;state.rounds++;
  const kinds=['quiz'];if(clipPool().length)kinds.push('trailer');if(audioPool().length)kinds.push('audio');if(visualPool().length)kinds.push('visual');
  const kind=state.rounds===1&&clipPool().length?'trailer':shuffle(kinds)[0];
  state.current=kind==='trailer'?pickTrailer():kind==='quiz'?pickQuiz():pickFeature(kind);
  renderRound();if(announce)say(`${currentPlayer().name}, du bist dran! ${state.current.type==='timeline'?'Schau den Trailer und setze den Film auf deine Zeitleiste.':state.current.type==='year'?'Schau den Trailer und wähle das richtige Jahr aus A bis D.':state.current.type==='audio'?'Hör genau hin: Zu welchem Film oder welcher Serie gehört dieser Song?':state.current.type==='visual'?'Schau auf die Symbole. Welcher Film oder welche Serie ist gemeint?':'Hier kommt deine Filmfrage.'}`);
  readCurrent();
  saveSession();state.pair?.broadcast();
}
function stopPlayer() { ui.playerBox.replaceChildren(); }
function playerPlaceholder(symbol,message) { stopPlayer();ui.playerBox.dataset.provider='';const div=document.createElement('div');div.className='player-placeholder';div.textContent=symbol;const small=document.createElement('small');small.textContent=message;div.append(small);ui.playerBox.append(div); }
function renderRound() {
  if(!state.current)return;
  const type=state.current.type, quiz=type==='quiz', year=type==='year', audio=type==='audio', visual=type==='visual', trailer=year||type==='timeline';
  ui.turnName.textContent=currentPlayer().name;ui.roundLabel.textContent=`RUNDE ${state.rounds}`;
  ui.deckLabel.textContent=`${quizBank.length+SOUNDTRACKS.length+VISUALS.length} FRAGEN · ${playable.length} TRAILER`;
  ui.modeBadge.textContent=quiz?'QUIZRUNDE':audio?'HÖRRUNDE':visual?'BILDRUNDE':'TRAILERRUNDE';
  ui.catLabel.textContent=(state.current.question?.category||state.current.track?.category||state.current.item?.category||'').toUpperCase();ui.questionCategory.textContent=ui.catLabel.textContent;
  ui.mysteryTitle.textContent=quiz?'VITO HAT EINE FRAGE':audio?'HÖRST DU DEN FILM?':visual?'ERKENNST DU DIE SYMBOLE?':'ERKENNST DU DIESEN FILM?';
  ui.timelineWrap.classList.toggle('hidden',type!=='timeline');ui.quizOptions.classList.toggle('hidden',type==='timeline');
  ui.playMusic.classList.toggle('hidden',quiz||visual);ui.switchSource.classList.add('hidden');ui.swapTrailer.classList.toggle('hidden',quiz||visual);
  ui.swapTrailer.textContent=audio?'↻ Anderer Song':'↻ Anderer Film';ui.musicInfo.classList.toggle('hidden',quiz||visual);
  ui.musicInfo.textContent=audio?'Musik läuft direkt hier über Deezer oder Spotify. Tippe im Player auf Play.':'Trailer läuft direkt hier im Studio. Wenn ein Video gesperrt ist, wähle einen anderen Film.';
  ui.questionTitle.textContent=quiz?state.current.question.prompt:audio?'Zu welchem Film oder welcher Serie gehört diese Musik?':visual?'Welcher Film oder welche Serie passt zu diesen Symbolen?':year?'In welchem Jahr startete dieser Film im Kino?':'In welche Zeit gehört dieser Film?';
  ui.questionHint.textContent=quiz?'Wähle eine der vier Antworten. Vito löst danach auf.':audio?'Starte den Song im Player und tippe auf A, B, C oder D.':visual?'Sieh dir die Symbole an und wähle A, B, C oder D.':year?'Starte den Trailer und wähle das Jahr mit A, B, C oder D.':'Schau den Trailer und tippe auf die passende Lücke deiner Zeitleiste.';
  ui.result.className='result hidden';ui.result.replaceChildren();ui.next.classList.add('hidden');
  if(quiz){playerPlaceholder('★','DIE QUIZFRAGE IST LIVE');ui.mediaState.textContent='QUIZRUNDE';renderQuiz();}
  else if(visual){renderVisual();ui.mediaState.textContent='BILDRÄTSEL';renderFeature();}
  else if(audio){playerPlaceholder('♫','FILMMUSIK UND SERIENINTROS');ui.mediaState.textContent='BEREIT';ui.playMusic.disabled=false;ui.playMusic.textContent='▶ Musik abspielen';renderFeature();}
  else if(trailer){playerPlaceholder('▶','TRAILER DIREKT IM STUDIO');ui.mediaState.textContent='BEREIT';ui.playMusic.disabled=false;ui.playMusic.textContent='▶ Trailer abspielen';if(year)renderYearChoices();else renderTimeline();}
  if(state.solved)showSolvedState();renderScores();
}
function renderVisual() {
  stopPlayer();ui.playerBox.dataset.provider='visual';
  const panel=document.createElement('div');panel.className='visual-riddle';panel.setAttribute('role','img');panel.setAttribute('aria-label','Drei Bildsymbole als Filmrätsel');
  for(const symbol of state.current.item.symbols){const tile=document.createElement('span');tile.textContent=symbol;panel.append(tile);}
  ui.playerBox.append(panel);
}
function renderFeature() {
  ui.quizOptions.replaceChildren();
  state.current.options.forEach((option,index)=>{const button=document.createElement('button');button.type='button';const badge=document.createElement('b');badge.textContent='ABCD'[index];button.append(badge,document.createTextNode(option));button.disabled=state.solved;button.onclick=()=>answerFeature(index);ui.quizOptions.append(button);});
}
function renderQuiz() {
  ui.quizOptions.replaceChildren();const current=state.current;
  current.options.forEach((option,index)=>{const button=document.createElement('button');button.type='button';const badge=document.createElement('b');badge.textContent='ABCD'[index];button.append(badge,document.createTextNode(option));button.disabled=state.solved;button.onclick=()=>answerQuiz(index);ui.quizOptions.append(button);});
}
function renderYearChoices() {
  ui.quizOptions.replaceChildren();
  state.current.options.forEach((year,index)=>{
    const button=document.createElement('button');button.type='button';
    const badge=document.createElement('b');badge.textContent='ABCD'[index];
    button.append(badge,document.createTextNode(String(year)));
    button.disabled=state.solved;button.onclick=()=>answerYear(index);ui.quizOptions.append(button);
  });
}
function renderTimeline() {
  const timeline=sortedTimeline();ui.timelineCount.textContent=`${timeline.length} ${timeline.length===1?'FILM':'FILME'}`;ui.timeline.replaceChildren();
  for(let i=0;i<=timeline.length;i++){
    const slot=document.createElement('button');slot.type='button';slot.className='slot';slot.textContent='+';slot.setAttribute('aria-label',`Film an Position ${i+1} einordnen`);slot.disabled=state.solved;slot.onclick=()=>answerTimeline(i,timeline);ui.timeline.append(slot);
    if(i<timeline.length){const card=document.createElement('div');card.className='time-card';const year=document.createElement('span');year.className='year';year.textContent=timeline[i].year;const title=document.createElement('strong');title.textContent=timeline[i].title;const studio=document.createElement('small');studio.textContent=timeline[i].studio;card.append(year,title,studio);ui.timeline.append(card);}
  }
}
async function playMusic() {
  const current=state.current;if(!['timeline','year','audio'].includes(current?.type)||state.solved)return;
  if(current.type==='audio'){
    ui.playMusic.disabled=true;ui.mediaState.textContent='MUSIK WIRD GESUCHT';
    const id=await resolveDeezer(current.item);
    if(state.current!==current||state.solved)return;
    state.sourceList=musicSources(current.item,id);
    if(!state.sourceList.length){playerPlaceholder('!', 'Musik gerade nicht verfügbar. Anderen Song wählen.');ui.mediaState.textContent='KEIN AUDIO';ui.playMusic.disabled=false;return;}
  }else state.sourceList=sourcesFor(current.track);
  if(!state.sourceList.length){playerPlaceholder('!', 'Dieser Trailer ist nicht verfügbar. Anderen Film wählen.');ui.mediaState.textContent='KEIN TRAILER';return;}
  state.sourceIndex=0;state.playing=true;ui.playMusic.disabled=false;renderSource();state.pair?.broadcast();
}
function renderSource() {
  const source=state.sourceList[state.sourceIndex];if(!source)return;
  const audio=state.current.type==='audio';stopPlayer();ui.playerBox.dataset.provider=source.name.toLowerCase();
  const iframe=document.createElement('iframe');iframe.src=source.src;iframe.title=`${source.name} ${audio?'Musikplayer':'Filmtrailer'}`;iframe.allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';ui.playerBox.append(iframe);
  ui.mediaState.textContent=audio?`${source.name.toUpperCase()} IM STUDIO`:'TRAILER LIVE';ui.playMusic.textContent=audio?'↻ Musik neu laden':'↻ Trailer neu laden';
  ui.switchSource.classList.toggle('hidden',state.sourceList.length<2);ui.switchSource.textContent=`↔ ${state.sourceList[(state.sourceIndex+1)%state.sourceList.length].name}`;
  ui.hostText.textContent=audio?'Die Musik ist im Studio bereit. Tippe im Player auf Play und rate mit A bis D.':'Der Trailer läuft direkt im Studio. Tippe im Video auf Play.';
}
function switchSource() {
  if(state.solved||!['timeline','year','audio'].includes(state.current?.type))return;
  if(state.sourceList.length>1){state.sourceIndex=(state.sourceIndex+1)%state.sourceList.length;renderSource();}
  else playMusic();
}
function swapTrailer() {
  if(state.solved)return;
  const audio=state.current?.type==='audio';if(!audio&&!['timeline','year'].includes(state.current?.type))return;
  const pool=audio?audioPool():clipPool();
  const alternatives=pool.filter(item=>item.id!==(audio?state.current.item.id:state.current.track.id)&& (audio||!state.players.some(player=>player.timeline.some(card=>card.id===item.id))));
  if(!alternatives.length)return;
  state.current=audio?{type:'audio',item:shuffle(alternatives)[0],options:[]} :musicRound(shuffle(alternatives)[0]);
  if(audio)state.current.options=audioChoices(state.current.item,SOUNDTRACKS);
  state.playing=false;state.sourceList=[];state.sourceIndex=0;renderRound();saveSession();state.pair?.broadcast();say(audio?'Neuer Song, neue Chance!':'Neuer Film, neue Chance!');readCurrent();
}
function answerTimeline(position,timeline=sortedTimeline()) { if(state.solved||state.current?.type!=='timeline')return;const track=state.current.track,previous=timeline[position-1],following=timeline[position];const correct=(!previous||previous.year<=track.year)&&(!following||track.year<=following.year);if(correct){currentPlayer().timeline.push(track);currentPlayer().score++;tone(660,.22);setTimeout(()=>tone(880,.35),160);}else tone(230,.4,'triangle');completeRound(correct,correct?`Treffer! ${track.title} von ${track.studio} erschien ${track.year}.`:`Nicht ganz. ${track.title} von ${track.studio} erschien ${track.year}.`,`${questionFor(track)} Antwort: ${track.year}.`); }
function answerYear(index) { if(state.solved||state.current?.type!=='year'||index<0||index>3)return;const track=state.current.track,correct=state.current.options[index]===track.year;if(correct){currentPlayer().timeline.push(track);currentPlayer().score++;tone(660,.22);setTimeout(()=>tone(880,.35),160);}else tone(230,.4,'triangle');completeRound(correct,correct?`Richtig! ${track.title} von ${track.studio} erschien ${track.year}.`:`Nicht ganz. ${track.title} von ${track.studio} erschien ${track.year}.`,`Gesucht war das Veröffentlichungsjahr ${track.year}.`); }
function answerQuiz(index) { if(state.solved||state.current?.type!=='quiz'||index<0||index>3)return;const {question,options}=state.current,correct=options[index]===question.answer;if(correct){currentPlayer().score++;tone(660,.22);setTimeout(()=>tone(880,.35),160);}else tone(230,.4,'triangle');completeRound(correct,correct?`Richtig, ${currentPlayer().name}! ${question.answer} ist die Antwort.`:`Leider falsch. Die richtige Antwort lautet ${question.answer}.`,question.prompt); }
function answerFeature(index) {
  if(state.solved||!['audio','visual'].includes(state.current?.type)||index<0||index>3)return;
  const {item,options,type}=state.current,correct=options[index]===item.work;
  if(correct){currentPlayer().score++;tone(660,.22);setTimeout(()=>tone(880,.35),160);}else tone(230,.4,'triangle');
  const intro=correct?'Richtig':'Leider falsch';
  completeRound(correct,`${intro}! ${item.work} ist die Antwort.`,type==='audio'?`${item.title} von ${item.artist} gehört zu ${item.work}.`:`Die Symbole stehen für ${item.work}.`);
}
function completeRound(correct,message,detail) {
  state.solved=true;state.lastCorrect=correct;state.result=message;stopPlayer();ui.mediaState.textContent='AUFGELÖST';say(message);
  ui.result.className=`result ${correct?'good':'bad'}`;const heading=document.createElement('h3');heading.textContent=correct?'✓ Punkt für dich!':'✕ Aufgelöst';const p=document.createElement('p');p.textContent=`${detail} ${correct?'+1 Punkt':'Kein Punkt in dieser Runde.'}`;ui.result.append(heading,p);
  if(state.current.type==='timeline')renderTimeline();else markQuizAnswer();renderScores();
  if(currentPlayer().score>=8){finishGame();return;}
  ui.next.classList.remove('hidden');ui.next.textContent=state.players.length>1?`Weiter: ${state.players[(state.active+1)%state.players.length].name} →`:'Nächste Runde →';ui.next.onclick=()=>{state.active=(state.active+1)%state.players.length;nextRound();};
  saveSession();state.pair?.broadcast();
}
function markQuizAnswer(){const buttons=[...ui.quizOptions.querySelectorAll('button')];buttons.forEach((button,index)=>{button.disabled=true;const correct=state.current.type==='year'?state.current.track.year:state.current.item?.work||state.current.question.answer;if(state.current.options[index]===correct)button.classList.add('correct');});}
function showSolvedState() { ui.result.className=`result ${state.lastCorrect?'good':'bad'}`;const p=document.createElement('p');p.textContent=state.result;ui.result.append(p);if(state.current.type==='timeline')renderTimeline();else markQuizAnswer();ui.next.classList.remove('hidden');ui.next.textContent=state.players.length>1?`Weiter: ${state.players[(state.active+1)%state.players.length].name} →`:'Nächste Runde →';ui.next.onclick=()=>{state.active=(state.active+1)%state.players.length;nextRound();};ui.mediaState.textContent='AUFGELÖST'; }
function renderScores() { ui.scoreboard.replaceChildren();state.players.forEach((player,index)=>{const chip=document.createElement('div');chip.className=`score-chip${index===state.active?' active':''}`;chip.textContent=player.name;const score=document.createElement('b');score.textContent=`${player.score}/8`;chip.append(score);ui.scoreboard.append(chip);}); }
function finishGame() {state.finished=true;safeStorage(()=>localStorage.removeItem(SAVE_KEY));ui.resume.classList.add('hidden');ui.next.classList.remove('hidden');ui.next.textContent='Neue Show starten ↻';ui.next.onclick=()=>{showMenu();state.current=null;state.players.forEach(p=>{p.score=0;p.timeline=[];});playerInputs();};say(`${currentPlayer().name} gewinnt Zeitsprung Movie! Acht Punkte, was für eine Show!`);state.pair?.broadcast();}

function initStage() {
  if(!window.THREE)return;
  try {
    const T=window.THREE,canvas=$('stage'),renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<650?1.15:1.6));
    const scene=new T.Scene(),camera=new T.PerspectiveCamera(47,1,.1,100);camera.position.set(0,3.2,15);camera.lookAt(0,1.8,-4);
    scene.add(new T.AmbientLight(0x8ca0ff,.9));const pink=new T.PointLight(0xff4b9b,2.6,25);pink.position.set(-5,7,2);scene.add(pink);const cyan=new T.PointLight(0x4befff,2.4,25);cyan.position.set(5,6,1);scene.add(cyan);
    const mat=(color,metal=.15,rough=.55)=>new T.MeshStandardMaterial({color,metalness:metal,roughness:rough});
    const box=(w,h,d,color,x,y,z)=>{const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),mat(color));mesh.position.set(x,y,z);scene.add(mesh);return mesh;};
    box(22,.35,12,0x141a36,0,-.2,-4);box(17,.1,5,0x362459,0,.02,-5);box(14,.16,.15,0xff649d,0,.15,-2.5);
    for(let i=-6;i<=6;i++){box(.05,4,.08,i%2?0x3a3d79:0x63418b,i*1.2,2.8,-9);box(1.05,.06,.12,0x7deeff,i*1.2,5.1,-9);}
    box(11.4,3.6,.22,0x111a3d,0,3,-9.2);box(10.5,2.8,.08,0x3e286c,0,3,-9.05);
    const led=document.createElement('canvas');led.width=1024;led.height=320;const ctx=led.getContext('2d');const texture=new T.CanvasTexture(led);
    const screen=new T.Mesh(new T.PlaneGeometry(10.3,2.65),new T.MeshBasicMaterial({map:texture,transparent:false}));screen.position.set(0,3.05,-8.95);scene.add(screen);
    const desk=box(4.5,.7,1.2,0x1b2148,0,.5,-4.5);box(4.3,.18,1.3,0xffc36d,0,.89,-4.5);box(4.1,.13,.12,0x64eeff,0,.54,-3.87);
    const host=new T.Group();host.position.set(-2.8,.96,-4.7);scene.add(host);
    const body=new T.Mesh(new T.CylinderGeometry(.43,.55,1.15,12),mat(0x5131a0));body.position.y=.66;host.add(body);
    const head=new T.Mesh(new T.SphereGeometry(.35,18,14),mat(0xe8a177));head.position.y=1.52;host.add(head);
    const hair=new T.Mesh(new T.SphereGeometry(.36,18,8,0,Math.PI*2,0,Math.PI*.46),mat(0x251630));hair.position.y=1.61;host.add(hair);
    const mic=new T.Mesh(new T.CylinderGeometry(.045,.05,.75,8),mat(0x9c9cb4,.7,.25));mic.position.set(.55,.91,.1);mic.rotation.z=-.45;host.add(mic);
    const neon=[];for(let i=0;i<10;i++){const bulb=new T.Mesh(new T.SphereGeometry(.06,8,8),new T.MeshBasicMaterial({color:i%2?0xff68ae:0x66eaff}));bulb.position.set((i-4.5)*1.6,.28,-1.2);scene.add(bulb);neon.push(bulb);}
    for(let row=0;row<3;row++)for(let col=-7;col<=7;col++){const audience=new T.Mesh(new T.SphereGeometry(.11,7,6),mat((row+col)%3?0x394681:0xc44b8b));audience.position.set(col*1.05,.15+row*.1,1.4+row*.65);scene.add(audience);}
    const beamMat=new T.MeshBasicMaterial({color:0x77e9ff,transparent:true,opacity:.065,depthWrite:false,side:T.DoubleSide});const beams=[];
    for(const x of [-5,5]){const cone=new T.Mesh(new T.ConeGeometry(1.8,7,20,1,true),beamMat.clone());cone.position.set(x,3.5,-4);cone.rotation.z=x<0?-.3:.3;scene.add(cone);beams.push(cone);}
    function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.x=w<650?2:0;camera.updateProjectionMatrix();}addEventListener('resize',resize);resize();
    let frame=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    function draw(){requestAnimationFrame(draw);if(document.hidden)return;frame++;if(frame%4===0||reduced){const t=frame*.015;ctx.fillStyle='#141b49';ctx.fillRect(0,0,1024,320);const gradient=ctx.createLinearGradient(0,0,1024,0);gradient.addColorStop(0,'#74efff');gradient.addColorStop(.5,'#ffd679');gradient.addColorStop(1,'#ff70aa');ctx.fillStyle=gradient;ctx.font='900 110px Impact, Arial Black, sans-serif';ctx.textAlign='center';ctx.fillText('ZEITSPRUNG',512,145);ctx.font='900 72px Impact, Arial Black, sans-serif';ctx.fillText('MOVIE  •  LIVE',512,243);for(let i=0;i<40;i++){const h=8+Math.abs(Math.sin(t+i*.62))*26;ctx.fillRect(i*27,294-h,10,h);}texture.needsUpdate=true;}
      if(!reduced){host.rotation.y=Math.sin(frame*.012)*.08;beams.forEach((b,i)=>b.rotation.z=(i?1:-1)*(.2+Math.sin(frame*.008+i)*.08));neon.forEach((b,i)=>b.scale.setScalar(.8+Math.sin(frame*.04+i)*.2));}renderer.render(scene,camera);}
    draw();
  } catch (error) { console.warn('3D-Studio nicht verfügbar:',error); }
}
init();
