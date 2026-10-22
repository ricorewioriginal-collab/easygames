import { EVENTS, WORLDS, formatYear } from './events.js';
import { speak, stop as stopVoice, readQuestion } from './vito.js';
import { KNOWLEDGE } from './knowledge.js';
import { CLIPS, SONGS, clipSource, introSource, songFor, songChoices } from './media.js';
import { VISUALS, visualChoices } from './visual.js';
import { resolveDeezer, musicSources } from './music.js';
import { yearChoices } from './year.js';
import { IS_CONTROLLER, startController, startHost } from './pair.js';

const $ = id => document.getElementById(id);
const ids = ['boot','loadBar','bootStatus','bootStart','setup','game','players','addPlayer','category','musicMode','start','resume','menuButton','soundToggle','tvToggle','pairToggle','pairPanel','pairClose','pairDone','turnName','roundLabel','deckLabel','modeBadge','catLabel','mysteryTitle','mysteryInfo','playerBox','playMusic','switchSource','swapTrailer','mediaState','hostText','questionCategory','questionTitle','questionHint','timelineWrap','timelineCount','timeline','quizOptions','result','next','scoreboard','musicInfo','statEvents','statQuiz','statMedia'];
const ui = Object.fromEntries(ids.map(id => [id, $(id)]));
const colors = ['#ff6aab','#70ebff','#ffce72','#aa91ff'];
const SAVE_KEY = 'zk-save-v1', WIN = 8;
const eventById = new Map(EVENTS.map(event => [event.id, event]));
const quizById = new Map(KNOWLEDGE.map(question => [question.id, question]));
const songById = new Map(SONGS.map(item => [item.id, item]));
const visualById = new Map(VISUALS.map(item => [item.id, item]));
const MEDIA_EVENTS = EVENTS.filter(event => CLIPS[event.title] || songFor(event));
const state = { players: [], active: 0, rounds: 0, eventDeck: [], quizDeck: [], songDeck: [], visualDeck: [], current: null, starter: null, solved: false, lastCorrect: false, voice: true, playing: false, pair: null, result: '', filter: 'all', musicMode: 'choice', finished: false, sourceList: [], sourceIndex: 0 };
let audioContext;

function shuffle(items) { const a=[...items]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
function setBoot(percent, message) { ui.loadBar.style.width=`${percent}%`; ui.bootStatus.textContent=message; }
function finishBoot(auto = false) {
  setTimeout(()=>setBoot(52,'Serien und Figuren geladen …'),180);
  setTimeout(()=>setBoot(82,'Intros, Quiz und Spielmenü bereit …'),630);
  setTimeout(()=>{
    setBoot(100,'Bereit für die Zeitreise!');
    ui.bootStart.classList.remove('hidden');
    ui.bootStart.onclick=()=>{ui.boot.classList.add('done');setTimeout(()=>ui.boot.remove(),600);};
    if(auto)ui.bootStart.click();
    else ui.bootStart.focus();
  },1080);
}
function safeStorage(action) { try { return action(); } catch (_) { return null; } }
function currentPlayer() { return state.players[state.active]; }
function sortedTimeline(player=currentPlayer()) { return [...player.timeline].sort((a,b) => a.year-b.year || a.title.localeCompare(b.title)); }
const inFilter = (item, filter=state.filter) => filter === 'all' || item.world === filter;
function eventPool(filter=state.filter) { return EVENTS.filter(event => inFilter(event, filter)); }
function quizPool(filter=state.filter) { return KNOWLEDGE.filter(question => inFilter(question, filter)); }
function songPool(filter=state.filter) { return SONGS.filter(item => inFilter(item, filter)); }
function visualPool(filter=state.filter) { return VISUALS.filter(item => inFilter(item, filter)); }
function onTimeline(event) { return state.players.some(player => player.timeline.some(card => card.id === event.id)); }

function saveSession() {
  if (!state.current || state.finished) return;
  const c = state.current;
  const saved = { version: 1, savedAt: Date.now(), filter: state.filter, musicMode: state.musicMode, active: state.active, rounds: state.rounds, solved: state.solved, lastCorrect: state.lastCorrect, result: state.result, starter: state.starter?.id, current: { type: c.type, id: c.question?.id || c.event?.id || c.item?.id || '', events: c.events?.map(event => event.id), options: c.options }, players: state.players.map(p => ({ name: p.name, score: p.score, timeline: p.timeline.map(t => t.id) })), eventDeck: state.eventDeck.map(t => t.id), quizDeck: state.quizDeck.map(q => q.id), songDeck: state.songDeck.map(item => item.id), visualDeck: state.visualDeck.map(item => item.id) };
  safeStorage(() => localStorage.setItem(SAVE_KEY, JSON.stringify(saved)));
  ui.resume.classList.remove('hidden');
}
function loadSaved() {
  const raw = safeStorage(() => localStorage.getItem(SAVE_KEY)); if (!raw) return false;
  try {
    const saved=JSON.parse(raw); if (saved.version!==1 || !saved.current || !Array.isArray(saved.players) || !saved.players.length || saved.players.length>4) return false;
    const players=saved.players.map(p => ({ name:String(p.name).slice(0,22), score:Number(p.score)||0, timeline:(p.timeline||[]).map(id=>eventById.get(id)).filter(Boolean) }));
    const starter=eventById.get(saved.starter); if (!starter || players.some(p=>!p.timeline.length)) return false;
    const {type,id,options}=saved.current;
    let current=null;
    if (type==='quiz') current={type,question:quizById.get(id),options};
    else if (type==='audio'||type==='visual') current={type,item:(type==='audio'?songById:visualById).get(id),options};
    else if (type==='order') { const events=(saved.current.events||[]).map(e=>eventById.get(e)).filter(Boolean); current=events.length===4?orderRound(events,options):null; }
    else if (type==='year'||type==='timeline') current={type,event:eventById.get(id),options};
    if (!current || !(current.question||current.item||current.event||current.events) || (type!=='timeline'&&(!Array.isArray(current.options)||current.options.length!==4))) return false;
    Object.assign(state,{players,starter,current,active:Math.min(Math.max(0,Number(saved.active)||0),players.length-1),rounds:Number(saved.rounds)||1,solved:!!saved.solved,lastCorrect:!!saved.lastCorrect,result:String(saved.result||''),filter:saved.filter in WORLDS?saved.filter:'all',musicMode:saved.musicMode==='timeline'?'timeline':'choice',eventDeck:(saved.eventDeck||[]).map(id=>eventById.get(id)).filter(Boolean),quizDeck:(saved.quizDeck||[]).map(id=>quizById.get(id)).filter(Boolean),songDeck:(saved.songDeck||[]).map(id=>songById.get(id)).filter(Boolean),visualDeck:(saved.visualDeck||[]).map(id=>visualById.get(id)).filter(Boolean),playing:false,finished:false,sourceList:[],sourceIndex:0});
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
  setBoot(18,'Kinderserien werden auf den Zeitstrahl gelegt …');
  if (IS_CONTROLLER) { startController(); finishBoot(true); return; }
  state.players=[{name:'Spieler 1',score:0,timeline:[]}]; playerInputs();
  ui.category.options[0].textContent=`Große Mischung · ${EVENTS.length} Momente · ${KNOWLEDGE.length} Fragen`;
  for (const world of Object.keys(WORLDS)) { const option=document.createElement('option'); option.value=world; option.textContent=`${world} · ${eventPool(world).length} Momente · ${quizPool(world).length} Fragen`; ui.category.append(option); }
  ui.statEvents.textContent=EVENTS.length; ui.statQuiz.textContent=KNOWLEDGE.length; ui.statMedia.textContent=SONGS.length;
  ui.addPlayer.onclick=()=>{if(state.players.length<4){state.players.push({name:`Spieler ${state.players.length+1}`,score:0,timeline:[]});playerInputs();}};
  ui.start.onclick=startGame;
  ui.resume.onclick=()=>{if(loadSaved()){ui.category.value=state.filter;ui.musicMode.value=state.musicMode;playerInputs();showGame();renderRound();state.pair?.broadcast();say(`Willkommen zurück! ${currentPlayer().name}, deine Show geht weiter.`);readCurrent();}else{ui.resume.classList.add('hidden');}};
  ui.menuButton.onclick=showMenu;
  $('menuTv').onclick=()=>{document.body.classList.add('tv-mode');ui.tvToggle.setAttribute('aria-pressed','true');openPair();};
  ui.playMusic.onclick=()=>playMedia(state.playing?state.sourceIndex:0);
  ui.switchSource.onclick=switchSource;
  ui.swapTrailer.onclick=swapItem;
  ui.soundToggle.onclick=()=>{state.voice=!state.voice;ui.soundToggle.setAttribute('aria-pressed',String(state.voice));ui.soundToggle.textContent=state.voice?'♫':'♪';if(!state.voice)stopVoice();if(state.voice)say('Vito ist wieder live!');};
  ui.tvToggle.onclick=()=>{const enabled=!document.body.classList.contains('tv-mode');document.body.classList.toggle('tv-mode',enabled);ui.tvToggle.setAttribute('aria-pressed',String(enabled));if(enabled)openPair();else{state.pair?.destroy();state.pair=null;ui.pairPanel.classList.add('hidden');}};
  ui.pairToggle.onclick=()=>{document.body.classList.add('tv-mode');ui.tvToggle.setAttribute('aria-pressed','true');openPair();};
  ui.pairClose.onclick=ui.pairDone.onclick=()=>ui.pairPanel.classList.add('hidden');
  addEventListener('keydown',event=>{if(ui.game.classList.contains('hidden')||state.solved||!state.current||event.target.closest?.('input,select,textarea'))return;const key=event.key.toLowerCase();const index=state.current.type==='timeline'?'123456789'.indexOf(key):'abcd'.includes(key)?'abcd'.indexOf(key):'1234'.indexOf(key);if(index<0)return;if(state.current.type==='timeline')ui.timeline.querySelectorAll('.slot')[index]?.click();else ui.quizOptions.querySelectorAll('button')[index]?.click();});
  addEventListener('pagehide',saveSession);
  if (safeStorage(()=>localStorage.getItem(SAVE_KEY))) ui.resume.classList.remove('hidden');
  initStage(); finishBoot();
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(() => {});
}
function showMenu() { if(!ui.game.classList.contains('hidden'))saveSession();stopPlayer();ui.game.classList.add('hidden');ui.setup.classList.remove('hidden');playerInputs();scrollTo({top:0,behavior:'smooth'});state.pair?.broadcast(); }
function showGame() { ui.setup.classList.add('hidden');ui.game.classList.remove('hidden');scrollTo({top:0,behavior:'smooth'}); }
function tone(freq,duration,type='sine') { if(!state.voice)return;try{audioContext||=new(window.AudioContext||window.webkitAudioContext)();audioContext.resume();const o=audioContext.createOscillator(),g=audioContext.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.035,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+duration);o.connect(g).connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+duration);}catch(_){}}
function say(message,queue=false) { ui.hostText.textContent=message;if(state.voice)speak(message,{queue}); }
function readCurrent() { if(!state.voice||!state.current||state.solved)return;const options=ui.quizOptions.classList.contains('hidden')?[]:[...ui.quizOptions.querySelectorAll('button')].map(button=>button.lastChild.textContent);readQuestion(promptText(state.current),options); }
function slotLabels(timeline) { return Array.from({length:timeline.length+1},(_,i)=>i===0?`Vor ${formatYear(timeline[0].year)}`:i===timeline.length?`Nach ${formatYear(timeline[i-1].year)}`:`Zwischen ${formatYear(timeline[i-1].year)} und ${formatYear(timeline[i].year)}`); }
function promptText(c) {
  if (!c) return '';
  return c.type==='quiz'?c.question.prompt:c.type==='order'?'Welcher dieser Serienmomente war zuerst?':c.type==='audio'?'Zu welcher Kinderserie gehört dieses Intro?':c.type==='visual'?'Welche Kinderserie zeigen die Symbole?':c.type==='year'?`In welchem Jahr: ${c.event.title}?`:`Wann war: ${c.event.title}?`;
}
function openPair() {
  state.pair ||= startHost({
    allocate(name) {
      let slot=state.players.findIndex((_,i)=>!state.pair.has(i));
      if(slot<0&&state.players.length<4){slot=state.players.length;state.players.push({name,score:0,timeline:state.starter?[state.starter]:[]});}
      if(slot<0)return -1;state.players[slot].name=name;if(ui.game.classList.contains('hidden'))playerInputs();else{renderScores();if(slot===state.active)ui.turnName.textContent=name;}saveSession();return slot;
    },
    onLeave(){},
    onAnswer(slot,position){if(slot===state.active&&state.current?.type==='timeline'&&!state.solved&&!ui.game.classList.contains('hidden')){const timeline=sortedTimeline();if(position>=0&&position<=timeline.length)answerTimeline(position,timeline);}},
    onChoice(slot,choice){if(slot===state.active&&!state.solved&&!ui.game.classList.contains('hidden')&&choice>=0&&choice<4&&state.current&&state.current.type!=='timeline')answerChoice(choice);},
    onPlay(slot){if(slot===state.active&&mediaKinds().length&&!state.solved)playMedia(state.playing?state.sourceIndex:0);},
    onSource(slot){if(slot===state.active&&mediaKinds().length&&!state.solved)switchSource();},
    onNext(slot){if(slot===state.active&&state.solved&&!ui.next.classList.contains('hidden'))ui.next.click();},
    snapshot(){const c=state.current;const timeline=currentPlayer()?sortedTimeline():[];return{phase:ui.game.classList.contains('hidden')?'setup':'game',players:state.players.map(p=>({name:p.name,score:p.score})),active:state.active,round:state.rounds,solved:state.solved,playing:state.playing,slots:timeline.length?slotLabels(timeline):[],result:state.result,type:c?.type||'',prompt:promptText(c),options:c&&c.type!=='timeline'?c.options.map(o=>typeof o==='number'?formatYear(o):o):[],media:mediaKinds(),category:categoryOf(c),symbols:c?.type==='visual'?c.item.symbols:[],win:WIN};}
  });state.pair.open();
}
function categoryOf(c) { return c?.question?.category||c?.event?.category||c?.item?.category||(c?.type==='order'?'Was war zuerst?':''); }
function startGame() {
  state.players.forEach((p,i)=>{p.name=p.name.trim()||`Spieler ${i+1}`;p.score=0;p.timeline=[];});
  state.filter=ui.category.value;state.musicMode=ui.musicMode.value;state.active=0;state.rounds=0;state.finished=false;state.solved=false;state.result='';
  state.starter=shuffle(eventPool())[0];state.players.forEach(p=>p.timeline.push(state.starter));
  state.eventDeck=shuffle(eventPool().filter(event=>event.id!==state.starter.id));state.quizDeck=shuffle(quizPool());state.songDeck=shuffle(songPool());state.visualDeck=shuffle(visualPool());
  showGame();tone(523,.18);setTimeout(()=>tone(784,.3),130);
  say(`Willkommen bei Zeitsprung Kinderserien! Ich bin Vito, euer Moderator. Euer Startmoment: ${state.starter.title}, im Jahr ${formatYear(state.starter.year)}. ${state.musicMode==='timeline'?'Legt jeden neuen Moment an die richtige Stelle eures Zeitstrahls.':'Bei Serienmomenten wählt ihr das Jahr aus A bis D.'} ${WIN} Punkte bringen den Sieg!`);
  nextRound(false);
}
function orderRound(events, options) {
  return { type: 'order', events, options: options || shuffle(events.map(event => event.title)), answer: [...events].sort((a,b)=>a.year-b.year)[0].title };
}
function pickOrder() {
  const picked=[];
  for (const event of shuffle(eventPool())) { if (picked.every(other => other.year !== event.year && other.title !== event.title)) picked.push(event); if (picked.length===4) break; }
  return picked.length===4 ? orderRound(picked) : null;
}
function pickQuiz() {
  if(!state.quizDeck.length)state.quizDeck=shuffle(quizPool());
  const kind=shuffle(['k:','k:','k:','k:','order'])[0];
  if(kind==='order'){const round=pickOrder();if(round)return round;}
  let index=state.quizDeck.length-1;
  const matches=state.quizDeck.map((question,i)=>({question,i})).filter(({question})=>question.id.startsWith(kind));
  if(matches.length)index=matches[Math.floor(Math.random()*matches.length)].i;
  const [question]=state.quizDeck.splice(index,1);
  return question?{type:'quiz',question,options:shuffle(question.options)}:pickOrder();
}
function eventRound(event) { return state.musicMode==='choice'?{type:'year',event,options:yearChoices(event.year)}:{type:'timeline',event}; }
function pickEvent(preferMedia=false) {
  if(!state.eventDeck.length)state.eventDeck=shuffle(eventPool().filter(event=>!onTimeline(event)));
  let index=state.eventDeck.length-1;
  if(preferMedia){const found=state.eventDeck.findIndex(event=>MEDIA_EVENTS.includes(event));if(found>=0)index=found;}
  const [event]=state.eventDeck.splice(index,1);
  return event?eventRound(event):pickQuiz();
}
function pickFeature(type) {
  const key=type==='audio'?'songDeck':'visualDeck';
  if(!state[key].length)state[key]=shuffle(type==='audio'?songPool():visualPool());
  const item=state[key].pop();if(!item)return pickQuiz();
  const options=type==='audio'?songChoices(item,SONGS):visualChoices(item,VISUALS);
  return options.length===4?{type,item,options}:pickQuiz();
}
function nextRound(announce=true) {
  stopPlayer();state.playing=false;state.solved=false;state.lastCorrect=false;state.result='';state.sourceList=[];state.sourceIndex=0;state.rounds++;
  const kinds=['event','event','event','quiz','quiz','quiz'];if(songPool().length)kinds.push('audio','audio');if(visualPool().length)kinds.push('visual');
  const kind=state.rounds===1?'event':shuffle(kinds)[0];
  state.current=kind==='event'?pickEvent(state.rounds===1):kind==='quiz'?pickQuiz():pickFeature(kind);
  renderRound();
  if(announce){const t=state.current.type;say(`${currentPlayer().name}, du bist dran! ${t==='timeline'?'Lege den Moment an die richtige Stelle deines Zeitstrahls.':t==='year'?'In welchem Jahr war das? Wähle A bis D.':t==='audio'?'Hör genau hin: Zu welcher Serie gehört dieses Intro?':t==='visual'?'Schau auf die Symbole. Welche Serie ist gemeint?':t==='order'?'Was war zuerst? Finde den ältesten Moment.':'Hier kommt deine Serienfrage.'}`);}
  readCurrent();
  saveSession();state.pair?.broadcast();
}

// Serienintros über YouTube und Deezer passend zum Moment.
function mediaKinds(c=state.current) {
  if(!c)return [];
  if(c.type==='audio')return ['song'];
  if(c.type==='year'||c.type==='timeline'){const kinds=[];if(CLIPS[c.event.title])kinds.push('clip');if(songFor(c.event))kinds.push('song');return kinds;}
  return [];
}
function stopPlayer() { ui.playerBox.replaceChildren(); ui.playerBox.classList.remove('is-audio'); }
function playerPlaceholder(symbol,message) { stopPlayer();ui.playerBox.dataset.provider='';const div=document.createElement('div');div.className='player-placeholder';div.textContent=symbol;const small=document.createElement('small');small.textContent=message;div.append(small);ui.playerBox.append(div); }
const mediaLabel = kind => kind==='clip'?'▶ Intro-Video abspielen':'♫ Intro anhören';
async function playMedia(index=0) {
  const current=state.current,kinds=mediaKinds(current);if(!kinds.length||state.solved)return;
  index=Math.min(Math.max(0,index),kinds.length-1);const kind=kinds[index];
  state.sourceIndex=index;
  if(kind==='clip'){renderSource(clipSource(current.event));return;}
  const song=current.type==='audio'?current.item:songFor(current.event);
  if (current.type==='audio' && song.youtubeId) { renderSource({ ...introSource(song), song }); return; }
  ui.playMusic.disabled=true;ui.mediaState.textContent='INTRO WIRD GESUCHT';
  const id=await resolveDeezer(song);
  if(state.current!==current||state.solved)return;
  ui.playMusic.disabled=false;
  const [source]=musicSources(id);
  if(!source){if(song.youtubeId){renderSource({...introSource(song),song});return;}playerPlaceholder('!','Intro gerade nicht verfügbar. Wähle ein anderes.');ui.mediaState.textContent='KEIN AUDIO';return;}
  renderSource({...source,song});
}
function renderSource(source) {
  if(!source)return;
  const clip=source.kind==='clip'||source.kind==='intro';stopPlayer();ui.playerBox.dataset.provider=clip?'youtube':'deezer';ui.playerBox.classList.toggle('is-audio',state.current?.type==='audio');
  const iframe=document.createElement('iframe');iframe.src=source.src;iframe.title=clip?'Serienintro auf YouTube':'Serienintro auf Deezer';iframe.allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';ui.playerBox.append(iframe);
  state.playing=true;ui.mediaState.textContent=clip?'INTRO LIVE':'DEEZER IM STUDIO';ui.playMusic.textContent=clip?'↻ Intro neu laden':'↻ Intro neu laden';
  const kinds=mediaKinds();ui.switchSource.classList.toggle('hidden',kinds.length<2);if(kinds.length>1)ui.switchSource.textContent=kinds[(state.sourceIndex+1)%kinds.length]==='clip'?'↔ Video zeigen':'↔ Intro anhören';
  ui.musicInfo.textContent=clip?'Das Intro läuft über YouTube. Falls es gesperrt ist, wähle ein anderes.':'Das Intro läuft über Deezer. Tippe im Player auf Play.';
  ui.hostText.textContent=clip?'Das Intro ist bereit. Tippe im Player auf Play.':'Das Intro ist bereit. Tippe im Player auf Play.';
  state.pair?.broadcast();
}
function switchSource() {
  const kinds=mediaKinds();if(state.solved||!kinds.length)return;
  playMedia(kinds.length>1?(state.sourceIndex+1)%kinds.length:0);
}
function swapItem() {
  if(state.solved||!state.current)return;
  const c=state.current;
  if(c.type==='audio'){const others=songPool().filter(item=>item.id!==c.item.id);if(!others.length)return;const item=shuffle(others)[0];state.current={type:'audio',item,options:songChoices(item,SONGS)};}
  else if(c.type==='year'||c.type==='timeline'){const others=eventPool().filter(event=>event.id!==c.event.id&&!onTimeline(event));if(!others.length)return;state.current=eventRound(shuffle(others)[0]);}
  else return;
  state.playing=false;state.sourceList=[];state.sourceIndex=0;renderRound();saveSession();state.pair?.broadcast();say(c.type==='audio'?'Neues Intro, neue Chance!':'Neuer Moment, neue Chance!');readCurrent();
}

function renderRound() {
  const c=state.current;if(!c)return;
  const type=c.type, event=type==='year'||type==='timeline', kinds=mediaKinds(c);
  ui.turnName.textContent=currentPlayer().name;ui.roundLabel.textContent=`RUNDE ${state.rounds}`;
  ui.deckLabel.textContent=`${EVENTS.length} MOMENTE · ${KNOWLEDGE.length} FRAGEN`;
  ui.modeBadge.textContent=type==='quiz'?'QUIZRUNDE':type==='order'?'WAS WAR ZUERST?':type==='audio'?'HÖRRUNDE':type==='visual'?'BILDRUNDE':'ZEITSTRAHLRUNDE';
  ui.catLabel.textContent=categoryOf(c).toUpperCase();ui.questionCategory.textContent=ui.catLabel.textContent;
  ui.mysteryTitle.textContent=event?c.event.title:type==='quiz'?'VITO HAT EINE FRAGE':type==='order'?'WAS WAR ZUERST?':type==='audio'?'WELCHE SERIE?':'ERKENNST DU DIE SYMBOLE?';
  ui.mysteryInfo.textContent=event?c.event.info:'';
  ui.timelineWrap.classList.toggle('hidden',type!=='timeline');ui.quizOptions.classList.toggle('hidden',type==='timeline');
  ui.playMusic.classList.toggle('hidden',!kinds.length);ui.playMusic.disabled=false;if(kinds.length)ui.playMusic.textContent=mediaLabel(kinds[0]);
  ui.switchSource.classList.add('hidden');
  ui.swapTrailer.classList.toggle('hidden',!(event||type==='audio'));ui.swapTrailer.textContent=type==='audio'?'↻ Anderes Intro':'↻ Anderer Moment';
  ui.musicInfo.classList.toggle('hidden',!kinds.length);
  ui.musicInfo.textContent=type==='audio'?'Starte das Intro im Player und wähle die passende Serie.':kinds.length===2?'Zu diesem Moment gibt es ein Video und ein Intro.':kinds[0]==='clip'?'Zu diesem Moment gibt es ein Video auf YouTube.':'Zu diesem Moment gibt es ein Intro.';
  ui.questionTitle.textContent=type==='year'?'In welchem Jahr war das?':type==='timeline'?'Wohin gehört dieser Moment auf deinem Zeitstrahl?':promptText(c);
  ui.questionHint.textContent=type==='quiz'?'Wähle eine der vier Antworten. Vito löst danach auf.':type==='order'?'Tippe auf den Moment, der als erstes war.':type==='audio'?'Starte das Intro und tippe auf A, B, C oder D.':type==='visual'?'Sieh dir die Symbole an und wähle A, B, C oder D.':type==='year'?`${c.event.title}. Wähle das Jahr mit A, B, C oder D.`:'Tippe auf die passende Lücke deines Zeitstrahls.';
  ui.result.className='result hidden';ui.result.replaceChildren();ui.next.classList.add('hidden');
  if(type==='visual'){renderVisual();ui.mediaState.textContent='BILDRÄTSEL';}
  else if(kinds.length){playerPlaceholder(kinds[0]==='clip'?'▶':'♫','SERIENINTRO');ui.mediaState.textContent='BEREIT';}
  else{playerPlaceholder(type==='order'?'⇅':event?'⌛':'★',type==='order'?'WAS WAR ZUERST?':event?'ZEITREISE':'DIE SERIENFRAGE IST LIVE');ui.mediaState.textContent=type==='quiz'?'QUIZRUNDE':'LIVE';}
  if(type==='timeline')renderTimeline();else renderChoices();
  if(state.solved)showSolvedState();renderScores();
}
function renderVisual() {
  stopPlayer();ui.playerBox.dataset.provider='visual';
  const panel=document.createElement('div');panel.className='visual-riddle';panel.setAttribute('role','img');panel.setAttribute('aria-label','Drei Bildsymbole als Kinderserien-Rätsel');
  for(const symbol of state.current.item.symbols){const tile=document.createElement('span');tile.textContent=symbol;panel.append(tile);}
  ui.playerBox.append(panel);
}
function renderChoices() {
  ui.quizOptions.replaceChildren();
  state.current.options.forEach((option,index)=>{const button=document.createElement('button');button.type='button';const badge=document.createElement('b');badge.textContent='ABCD'[index];button.append(badge,document.createTextNode(typeof option==='number'?formatYear(option):option));button.disabled=state.solved;button.onclick=()=>answerChoice(index);ui.quizOptions.append(button);});
}
function renderTimeline() {
  const timeline=sortedTimeline();ui.timelineCount.textContent=`${timeline.length} ${timeline.length===1?'MOMENT':'MOMENTE'}`;ui.timeline.replaceChildren();
  for(let i=0;i<=timeline.length;i++){
    const slot=document.createElement('button');slot.type='button';slot.className='slot';slot.textContent='+';slot.setAttribute('aria-label',`Moment an Position ${i+1} einordnen`);slot.disabled=state.solved;slot.onclick=()=>answerTimeline(i,timeline);ui.timeline.append(slot);
    if(i<timeline.length){const card=document.createElement('div');card.className='time-card';const year=document.createElement('span');year.className='year';year.textContent=formatYear(timeline[i].year);const title=document.createElement('strong');title.textContent=timeline[i].title;const info=document.createElement('small');info.textContent=timeline[i].info;card.append(year,title,info);ui.timeline.append(card);}
  }
}
function win(points=1) { currentPlayer().score+=points;tone(660,.22);setTimeout(()=>tone(880,.35),160); }
function answerTimeline(position,timeline=sortedTimeline()) {
  if(state.solved||state.current?.type!=='timeline')return;
  const event=state.current.event,previous=timeline[position-1],following=timeline[position];
  const correct=(!previous||previous.year<=event.year)&&(!following||event.year<=following.year);
  if(correct){currentPlayer().timeline.push(event);win();}else tone(230,.4,'triangle');
  completeRound(correct,`${correct?'Treffer!':'Nicht ganz.'} ${event.title}: ${formatYear(event.year)}.`,`${event.info}. Der Moment gehört ins Jahr ${formatYear(event.year)}.`);
}
function answerChoice(index) {
  const c=state.current;if(state.solved||!c||c.type==='timeline'||index<0||index>3)return;
  const answer=correctAnswer(c),correct=c.options[index]===answer;
  if(correct){if(c.type==='year')currentPlayer().timeline.push(c.event);win();}else tone(230,.4,'triangle');
  let message,detail;
  if(c.type==='year'){message=`${correct?'Richtig!':'Nicht ganz.'} ${c.event.title}: ${formatYear(c.event.year)}.`;detail=`${c.event.info}.`;}
  else if(c.type==='order'){message=`${correct?'Richtig!':'Leider falsch.'} Zuerst kam: ${answer}.`;detail=[...c.events].sort((a,b)=>a.year-b.year).map(e=>`${formatYear(e.year)}: ${e.title}`).join(' · ');}
  else if(c.type==='audio'){message=`${correct?'Richtig!':'Leider falsch.'} Gesucht war: ${answer}.`;detail=`„${c.item.title}“ von ${c.item.artist}: ${c.item.event.title} (${formatYear(c.item.event.year)}).`;}
  else if(c.type==='visual'){message=`${correct?'Richtig!':'Leider falsch.'} Gesucht war: ${answer}.`;detail=`Die Symbole stehen für einen Moment aus dem Jahr ${formatYear(c.item.event.year)}.`;}
  else{message=correct?`Richtig, ${currentPlayer().name}! ${answer} ist die Antwort.`:`Leider falsch. Die richtige Antwort lautet ${answer}.`;detail=c.question.prompt;}
  completeRound(correct,message,detail);
}
function correctAnswer(c) { return c.type==='year'?c.event.year:c.type==='order'?c.answer:c.type==='quiz'?c.question.answer:c.item.work; }
function nextButton() { ui.next.classList.remove('hidden');ui.next.textContent=state.players.length>1?`Weiter: ${state.players[(state.active+1)%state.players.length].name} →`:'Nächste Runde →';ui.next.onclick=()=>{state.active=(state.active+1)%state.players.length;nextRound();}; }
function completeRound(correct,message,detail) {
  state.solved=true;state.lastCorrect=correct;state.result=message;stopPlayer();ui.playMusic.classList.add('hidden');ui.switchSource.classList.add('hidden');ui.swapTrailer.classList.add('hidden');ui.musicInfo.classList.add('hidden');ui.mediaState.textContent='AUFGELÖST';say(message);
  ui.result.className=`result ${correct?'good':'bad'}`;const heading=document.createElement('h3');heading.textContent=correct?'✓ Punkt für dich!':'✕ Aufgelöst';const p=document.createElement('p');p.textContent=`${message} ${detail} ${correct?'+1 Punkt':'Kein Punkt in dieser Runde.'}`;ui.result.append(heading,p);
  if(state.current.type==='timeline')renderTimeline();else markAnswer();renderScores();
  if(currentPlayer().score>=WIN){finishGame();return;}
  nextButton();saveSession();state.pair?.broadcast();
}
function markAnswer(){const answer=correctAnswer(state.current);[...ui.quizOptions.querySelectorAll('button')].forEach((button,index)=>{button.disabled=true;if(state.current.options[index]===answer)button.classList.add('correct');});}
function showSolvedState() { ui.result.className=`result ${state.lastCorrect?'good':'bad'}`;const p=document.createElement('p');p.textContent=state.result;ui.result.append(p);ui.playMusic.classList.add('hidden');ui.swapTrailer.classList.add('hidden');ui.musicInfo.classList.add('hidden');if(state.current.type==='timeline')renderTimeline();else markAnswer();nextButton();ui.mediaState.textContent='AUFGELÖST'; }
function renderScores() { ui.scoreboard.replaceChildren();state.players.forEach((player,index)=>{const chip=document.createElement('div');chip.className=`score-chip${index===state.active?' active':''}`;chip.textContent=player.name;const score=document.createElement('b');score.textContent=`${player.score}/${WIN}`;chip.append(score);ui.scoreboard.append(chip);}); }
function finishGame() {state.finished=true;safeStorage(()=>localStorage.removeItem(SAVE_KEY));ui.resume.classList.add('hidden');ui.next.classList.remove('hidden');ui.next.textContent='Neues Spiel starten ↻';ui.next.onclick=()=>{showMenu();state.current=null;state.players.forEach(p=>{p.score=0;p.timeline=[];});playerInputs();};say(`${currentPlayer().name} gewinnt Zeitsprung Kinderserien! ${WIN} Punkte, du kennst die Serien aller Zeiten!`);state.pair?.broadcast();}

function initStage() {
  if(!window.THREE)return;
  try {
    const T=window.THREE,canvas=$('stage'),renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<650?1.15:1.6));
    const scene=new T.Scene(),camera=new T.PerspectiveCamera(47,1,.1,100);camera.position.set(0,3.2,15);camera.lookAt(0,1.8,-4);
    scene.add(new T.AmbientLight(0x8cb4ff,.9));const amber=new T.PointLight(0xffb347,2.6,25);amber.position.set(-5,7,2);scene.add(amber);const teal=new T.PointLight(0x4bffd2,2.4,25);teal.position.set(5,6,1);scene.add(teal);
    const mat=(color,metal=.15,rough=.55)=>new T.MeshStandardMaterial({color,metalness:metal,roughness:rough});
    const box=(w,h,d,color,x,y,z)=>{const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),mat(color));mesh.position.set(x,y,z);scene.add(mesh);return mesh;};
    box(22,.35,12,0x10213a,0,-.2,-4);box(17,.1,5,0x1d3b5c,0,.02,-5);box(14,.16,.15,0xffb347,0,.15,-2.5);
    // Bühnenrampe als leuchtende Schiene mit Scheinwerfer-Marken
    for(let i=-6;i<=6;i++){box(.08,.5,.08,i%2?0x4bffd2:0xffd679,i*1.2,.45,-2.5);}
    box(11.4,3.6,.22,0x0d1a33,0,3,-9.2);box(10.5,2.8,.08,0x1f3a63,0,3,-9.05);
    const led=document.createElement('canvas');led.width=1024;led.height=320;const ctx=led.getContext('2d');const texture=new T.CanvasTexture(led);
    const screen=new T.Mesh(new T.PlaneGeometry(10.3,2.65),new T.MeshBasicMaterial({map:texture,transparent:false}));screen.position.set(0,3.05,-8.95);scene.add(screen);
    box(4.5,.7,1.2,0x15284a,0,.5,-4.5);box(4.3,.18,1.3,0xffc36d,0,.89,-4.5);box(4.1,.13,.12,0x64ffd8,0,.54,-3.87);
    const globe=new T.Mesh(new T.SphereGeometry(1.15,24,18),new T.MeshStandardMaterial({color:0xff5fae,metalness:.2,roughness:.5,wireframe:true}));globe.position.set(3.4,2.2,-6);scene.add(globe);
    const host=new T.Group();host.position.set(-2.8,.96,-4.7);scene.add(host);
    const body=new T.Mesh(new T.CylinderGeometry(.43,.55,1.15,12),mat(0x2d6a8f));body.position.y=.66;host.add(body);
    const head=new T.Mesh(new T.SphereGeometry(.35,18,14),mat(0xe8a177));head.position.y=1.52;host.add(head);
    const hair=new T.Mesh(new T.SphereGeometry(.36,18,8,0,Math.PI*2,0,Math.PI*.46),mat(0x251630));hair.position.y=1.61;host.add(hair);
    const mic=new T.Mesh(new T.CylinderGeometry(.045,.05,.75,8),mat(0x9c9cb4,.7,.25));mic.position.set(.55,.91,.1);mic.rotation.z=-.45;host.add(mic);
    for(let row=0;row<3;row++)for(let col=-7;col<=7;col++){const audience=new T.Mesh(new T.SphereGeometry(.11,7,6),mat((row+col)%3?0x34537f:0xd9963f));audience.position.set(col*1.05,.15+row*.1,1.4+row*.65);scene.add(audience);}
    function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.x=w<650?2:0;camera.updateProjectionMatrix();}addEventListener('resize',resize);resize();
    let frame=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    function draw(){requestAnimationFrame(draw);if(document.hidden)return;frame++;
      if(frame%2&&!reduced)return; // halbe Bildrate spart Akku
      if(frame%8===0||reduced){const t=frame*.01;ctx.fillStyle='#0e1d3d';ctx.fillRect(0,0,1024,320);const gradient=ctx.createLinearGradient(0,0,1024,0);gradient.addColorStop(0,'#5fffd8');gradient.addColorStop(.5,'#ffd679');gradient.addColorStop(1,'#ff8f6b');ctx.fillStyle=gradient;ctx.font='900 110px Impact, Arial Black, sans-serif';ctx.textAlign='center';ctx.fillText('ZEITSPRUNG',512,145);ctx.font='900 72px Impact, Arial Black, sans-serif';ctx.fillText('KINDERSERIEN',512,243);ctx.fillRect(40,285,944,4);for(let i=0;i<12;i++){const x=40+((i*86+t*60)%944);ctx.fillRect(x,272,6,30);}texture.needsUpdate=true;}
      if(!reduced){host.rotation.y=Math.sin(frame*.012)*.08;globe.rotation.y=frame*.004;}renderer.render(scene,camera);}
    draw();
  } catch (error) { console.warn('3D-Studio nicht verfügbar:',error); }
}
init();

