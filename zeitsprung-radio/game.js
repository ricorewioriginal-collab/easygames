import { COLLECTIONS, TRACKS, VIDEOS, questionFor, youtubeSearch } from './tracks.js';
import { IS_CONTROLLER, startController, startHost } from './pair.js';

const $ = id => document.getElementById(id);
const ui = Object.fromEntries(['setup','game','players','addPlayer','category','start','soundToggle','tvToggle','pairToggle','pairPanel','pairClose','pairDone','turnName','roundLabel','deckLabel','catLabel','playerBox','playMusic','openYoutube','mediaState','hostText','timelineCount','timeline','result','next','scoreboard'].map(id => [id, $(id)]));
const palette = ['#ff4c93','#77e7ff','#ffcb61','#ae92ff'];
const state = { players: [], active: 0, rounds: 0, deck: [], current: null, starter: null, solved: false, voice: true, playing: false, pair: null, result: '' };
let audioContext;

function shuffle(items) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function playerInputs() {
  ui.players.replaceChildren();
  state.players.forEach((p, i) => {
    const wrap = document.createElement('label'); wrap.className = 'player-input';
    const number = document.createElement('span'); number.textContent = i + 1; number.style.background = palette[i];
    const input = document.createElement('input'); input.maxLength = 22; input.value = p.name; input.placeholder = `Spieler ${i + 1}`; input.setAttribute('aria-label', `Name Spieler ${i + 1}`);
    input.addEventListener('input', () => p.name = input.value);
    wrap.append(number, input); ui.players.append(wrap);
  });
  ui.addPlayer.hidden = state.players.length >= 4;
}

function setup() {
  if (IS_CONTROLLER) { startController(); return; }
  state.players = [{ name: 'Spieler 1', score: 0, timeline: [] }];
  playerInputs();
  for (const [category, block] of Object.entries(COLLECTIONS)) {
    const option = document.createElement('option'); option.value = category; option.textContent = `${category} · ${block.trim().split('\n').length} Fragen`; ui.category.append(option);
  }
  ui.addPlayer.addEventListener('click', () => { if (state.players.length < 4) { state.players.push({ name: `Spieler ${state.players.length + 1}`, score: 0, timeline: [] }); playerInputs(); } });
  ui.start.addEventListener('click', start);
  ui.playMusic.addEventListener('click', playMusic);
  ui.tvToggle.addEventListener('click', () => {
    const enabled = !document.body.classList.contains('tv-mode');
    document.body.classList.toggle('tv-mode', enabled);
    ui.tvToggle.setAttribute('aria-pressed', String(enabled));
    ui.tvToggle.textContent = enabled ? '📺 TV-Modus an' : '📺 TV-Modus';
    if (enabled) openPair();
    else { state.pair?.destroy(); state.pair = null; ui.pairPanel.classList.add('hidden'); }
  });
  ui.pairToggle.addEventListener('click', () => {
    if (!document.body.classList.contains('tv-mode')) { document.body.classList.add('tv-mode'); ui.tvToggle.setAttribute('aria-pressed', 'true'); ui.tvToggle.textContent = '📺 TV-Modus an'; }
    openPair();
  });
  ui.pairClose.addEventListener('click', () => ui.pairPanel.classList.add('hidden'));
  ui.pairDone.addEventListener('click', () => ui.pairPanel.classList.add('hidden'));
  ui.soundToggle.addEventListener('click', () => {
    state.voice = !state.voice;
    if (!state.voice && 'speechSynthesis' in window) speechSynthesis.cancel();
    ui.soundToggle.textContent = state.voice ? '🔊 Vito an' : '🔇 Vito aus';
    ui.soundToggle.setAttribute('aria-pressed', String(state.voice));
    if (state.voice) say('Vito ist wieder am Mikrofon.');
  });
  window.addEventListener('keydown', event => {
    if (ui.game.classList.contains('hidden') || state.solved) return;
    const n = Number(event.key);
    if (n >= 1 && n <= 9) ui.timeline.querySelectorAll('.slot')[n - 1]?.click();
  });
  initStage();
}

function openPair() {
  state.pair ||= startHost({
    allocate(name) {
      let slot = state.players.findIndex((_, index) => !state.pair.has(index));
      if (slot < 0 && state.players.length < 4) {
        slot = state.players.length;
        state.players.push({ name, score: 0, timeline: state.starter ? [state.starter] : [] });
      }
      if (slot < 0) return -1;
      state.players[slot].name = name;
      if (ui.game.classList.contains('hidden')) playerInputs();
      else { renderScores(); if (slot === state.active) ui.turnName.textContent = name; }
      return slot;
    },
    onLeave() {},
    onAnswer(slot, position) {
      if (slot !== state.active || state.solved || ui.game.classList.contains('hidden')) return;
      const timeline = [...state.players[slot].timeline].sort((a,b) => a.year - b.year || a.title.localeCompare(b.title));
      if (position < 0 || position > timeline.length) return;
      answer(position, timeline);
    },
    onPlay(slot) { if (slot === state.active && !state.solved) playMusic(); },
    onNext(slot) { if (slot === state.active && state.solved && !ui.next.classList.contains('hidden')) ui.next.click(); },
    snapshot() {
      const active = state.players[state.active];
      const timeline = [...(active?.timeline || [])].sort((a,b) => a.year - b.year || a.title.localeCompare(b.title));
      const slots = Array.from({ length: timeline.length + 1 }, (_, i) => i === 0 ? `Vor ${timeline[0]?.year || 'allen Songs'}` : i === timeline.length ? `Nach ${timeline[i-1].year}` : `Zwischen ${timeline[i-1].year} und ${timeline[i].year}`);
      return { phase: ui.game.classList.contains('hidden') ? 'setup' : 'game', players: state.players.map(p => ({ name: p.name, score: p.score })), active: state.active, round: state.rounds, solved: state.solved, playing: state.playing, slots, result: state.result, songUrl: state.current ? youtubeSearch(state.current) : '' };
    }
  });
  state.pair.open();
}

function tone(frequency, duration, type = 'sine', gain = .04) {
  if (!state.voice) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();
    const oscillator = audioContext.createOscillator(), volume = audioContext.createGain();
    oscillator.type = type; oscillator.frequency.value = frequency;
    volume.gain.setValueAtTime(gain, audioContext.currentTime);
    volume.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
    oscillator.connect(volume).connect(audioContext.destination);
    oscillator.start(); oscillator.stop(audioContext.currentTime + duration);
  } catch (_) { /* Audio ist optional. */ }
}

function say(message) {
  ui.hostText.textContent = message;
  if (!state.voice || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = 'de-DE'; utterance.rate = 1.04; utterance.pitch = .85; utterance.volume = .95;
  const voices = speechSynthesis.getVoices();
  const de = voices.filter(v => v.lang.toLowerCase().startsWith('de'));
  utterance.voice = de.find(v => /male|männ|daniel|markus|stefan|vito/i.test(v.name)) || de[0] || null;
  speechSynthesis.speak(utterance);
}

function start() {
  state.players.forEach((player, i) => { player.name = player.name.trim() || `Spieler ${i + 1}`; player.score = 0; player.timeline = []; });
  const category = ui.category.value;
  state.deck = shuffle(category === 'all' ? TRACKS : TRACKS.filter(track => track.category === category));
  state.active = 0; state.rounds = 0; state.solved = false;
  // Jede Person bekommt dieselbe Referenzkarte. Danach wird sie aus dem Deck entfernt.
  const starter = state.deck.pop(); state.starter = starter;
  state.players.forEach(player => player.timeline.push(starter));
  ui.setup.classList.add('hidden'); ui.game.classList.remove('hidden');
  tone(523,.18); setTimeout(() => tone(784,.3), 130);
  say(`Willkommen bei Zeitsprung Radio! Ich bin Vito. Euer Startsong ist ${starter.title} von ${starter.artist}, aus dem Jahr ${starter.year}. Wer zuerst acht Treffer hat, gewinnt!`);
  nextRound(false);
  state.pair?.broadcast();
  scrollTo({ top: 0, behavior: 'smooth' });
}

function nextRound(announce = true) {
  if (!state.deck.length) { state.deck = shuffle(TRACKS.filter(track => !state.players.some(p => p.timeline.some(t => t.id === track.id)))); }
  if (!state.deck.length) { finish(); return; }
  state.current = state.deck.pop(); state.solved = false; state.playing = false; state.result = ''; state.rounds++;
  ui.result.className = 'result hidden'; ui.result.replaceChildren(); ui.next.classList.add('hidden');
  ui.playerBox.replaceChildren();
  const placeholder = document.createElement('div'); placeholder.className = 'player-placeholder'; placeholder.innerHTML = '▶<small>Klicke auf „Musik starten“</small>'; ui.playerBox.append(placeholder);
  ui.playMusic.disabled = false; ui.playMusic.textContent = '▶ Musik starten'; ui.mediaState.textContent = 'BEREIT';
  ui.catLabel.textContent = state.current.category.toUpperCase();
  ui.openYoutube.href = youtubeSearch(state.current);
  ui.turnName.textContent = state.players[state.active].name;
  ui.roundLabel.textContent = `RUNDE ${state.rounds}`;
  ui.deckLabel.textContent = `${state.deck.length + 1} FRAGEN ÜBRIG`;
  renderTimeline(); renderScores();
  if (announce) say(`${state.players[state.active].name}, du bist dran! Hör dir den Song an und setze ihn in deine Zeitleiste.`);
  else ui.hostText.textContent = `${state.players[state.active].name}, du beginnst! Starte die Musik und wähle eine Lücke.`;
  state.pair?.broadcast();
}

function playMusic() {
  if (state.playing || state.solved) return;
  state.playing = true; ui.playMusic.disabled = true; ui.playMusic.textContent = '♫ Musik läuft';
  const video = VIDEOS[state.current.title];
  ui.playerBox.replaceChildren();
  if (video) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${video}?autoplay=1&playsinline=1&rel=0`;
    iframe.title = 'YouTube-Musikvideo zum aktuellen Song'; iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share'; iframe.allowFullscreen = true; iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    ui.playerBox.append(iframe); ui.mediaState.textContent = 'YOUTUBE NO COOKIE';
    say('Musik ab! Wenn das Video gesperrt ist, öffne den YouTube-Link darunter. Danach wähle deine Position.');
  } else {
    const msg = document.createElement('div'); msg.className = 'player-placeholder'; msg.innerHTML = '↗<small>Für diesen Song: YouTube-Suche öffnen</small>'; ui.playerBox.append(msg);
    ui.mediaState.textContent = 'EXTERNER SONG';
    say('Für diesen Song öffne bitte die YouTube-Suche. Spiele ihn dort ab und tippe anschließend auf die richtige Lücke.');
  }
  state.pair?.broadcast();
}

function renderTimeline() {
  const timeline = [...state.players[state.active].timeline].sort((a,b) => a.year - b.year || a.title.localeCompare(b.title));
  ui.timelineCount.textContent = `${timeline.length} ${timeline.length === 1 ? 'SONG' : 'SONGS'}`;
  ui.timeline.replaceChildren();
  for (let i = 0; i <= timeline.length; i++) {
    const slot = document.createElement('button'); slot.type = 'button'; slot.className = 'slot'; slot.textContent = '+'; slot.title = `Song an Position ${i + 1} einordnen`;
    slot.setAttribute('aria-label', `Vor ${timeline[i]?.title || 'dem Ende'} einordnen, Position ${i + 1}`);
    slot.disabled = state.solved; slot.addEventListener('click', () => answer(i, timeline)); ui.timeline.append(slot);
    if (i < timeline.length) {
      const card = document.createElement('div'); card.className = 'time-card';
      const year = document.createElement('span'); year.className = 'year'; year.textContent = timeline[i].year;
      const title = document.createElement('strong'); title.textContent = timeline[i].title;
      const artist = document.createElement('small'); artist.textContent = timeline[i].artist;
      card.append(year, title, artist); ui.timeline.append(card);
    }
  }
}

function answer(position, timeline) {
  if (state.solved) return;
  state.solved = true;
  const track = state.current;
  const previous = timeline[position - 1], following = timeline[position];
  const right = (!previous || previous.year <= track.year) && (!following || track.year <= following.year);
  const player = state.players[state.active];
  if (right) { player.timeline.push(track); player.score++; tone(660,.23); setTimeout(() => tone(880,.4), 170); }
  else { tone(240,.4,'triangle'); }
  // Der Embed wird entfernt, damit der Titel beim Auflösen nicht weiterspielt.
  ui.playerBox.replaceChildren();
  const done = document.createElement('div'); done.className = 'player-placeholder'; done.innerHTML = '♫<small>Runde beendet</small>'; ui.playerBox.append(done);
  ui.mediaState.textContent = 'AUFGELÖST';
  const message = right ? `Volltreffer, ${player.name}! ${track.title} erschien ${track.year}. Dein Punkt ist sicher.` : `Knapp daneben, ${player.name}! ${track.title} von ${track.artist} erschien ${track.year}.`;
  state.result = message;
  say(message);
  ui.result.className = `result ${right ? 'good' : 'bad'}`;
  const heading = document.createElement('h3'); heading.textContent = right ? '✓ Richtig eingeordnet!' : '✕ Nicht ganz!';
  const detail = document.createElement('p'); detail.textContent = `${questionFor(track)} Antwort: ${track.year}. ${right ? '+1 Punkt' : 'Kein Punkt in dieser Runde.'}`;
  ui.result.append(heading, detail);
  renderTimeline(); renderScores();
  if (player.score >= 8) { finish(player); state.pair?.broadcast(); return; }
  ui.next.classList.remove('hidden');
  ui.next.textContent = state.players.length > 1 ? `Weiter: ${state.players[(state.active + 1) % state.players.length].name} →` : 'Nächster Song →';
  ui.next.onclick = () => { state.active = (state.active + 1) % state.players.length; nextRound(); };
  state.pair?.broadcast();
}

function renderScores() {
  ui.scoreboard.replaceChildren();
  state.players.forEach((player, i) => {
    const chip = document.createElement('div'); chip.className = `score-chip${i === state.active ? ' active' : ''}`;
    chip.textContent = player.name; const score = document.createElement('b'); score.textContent = `${player.score}/8`; chip.append(score); ui.scoreboard.append(chip);
  });
}

function finish(winner) {
  ui.next.classList.remove('hidden'); ui.next.textContent = 'Noch einmal spielen ↻';
  ui.next.onclick = () => { ui.game.classList.add('hidden'); ui.setup.classList.remove('hidden'); ui.players.querySelectorAll('input').forEach((input, i) => state.players[i].name = input.value); playerInputs(); scrollTo({top:0,behavior:'smooth'}); };
  if (winner) say(`${winner.name} gewinnt Zeitsprung Radio mit acht richtigen Songs! Was für eine Zeitreise!`);
  else say('Das Songdeck ist leer. Danke fürs Mitspielen bei Zeitsprung Radio!');
}

function initStage() {
  if (!window.THREE) return;
  try {
    const canvas = $('stage');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 100); camera.position.set(0, 1.8, 10); camera.lookAt(0, 0, 0);
    scene.add(new THREE.AmbientLight(0xffffff, .65));
    const pink = new THREE.PointLight(0xff4c93, 2, 14); pink.position.set(-4, 3, 3); scene.add(pink);
    const blue = new THREE.PointLight(0x77e7ff, 2, 14); blue.position.set(4, -2, 3); scene.add(blue);
    const group = new THREE.Group(); group.position.set(2.9, .05, -1.5); scene.add(group);
    const vinyl = new THREE.Mesh(new THREE.TorusGeometry(2.3, .11, 16, 90), new THREE.MeshStandardMaterial({ color: 0x19142a, metalness: .7, roughness: .2 })); group.add(vinyl);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(2.28, 2.28, .055, 96), new THREE.MeshStandardMaterial({ color: 0x10101c, metalness: .65, roughness: .2 })); disc.rotation.x = Math.PI / 2; group.add(disc);
    for (let r = .56; r < 2.2; r += .17) { const groove = new THREE.Mesh(new THREE.TorusGeometry(r, .006, 5, 90), new THREE.MeshBasicMaterial({ color: r % .34 < .17 ? 0x66537d : 0x302642, transparent: true, opacity: .7 })); groove.position.z = .04; group.add(groove); }
    const label = new THREE.Mesh(new THREE.CircleGeometry(.5, 48), new THREE.MeshBasicMaterial({ color: 0xffcb61 })); label.position.z = .06; group.add(label);
    const center = new THREE.Mesh(new THREE.CircleGeometry(.08, 32), new THREE.MeshBasicMaterial({ color: 0x281526 })); center.position.z = .07; group.add(center);
    const particles = new THREE.BufferGeometry(); const positions = new Float32Array(240 * 3);
    for (let i=0;i<positions.length;i+=3) { positions[i] = (Math.random()-.5)*20; positions[i+1]=(Math.random()-.5)*12; positions[i+2]=(Math.random()-.5)*8-2; }
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3)); scene.add(new THREE.Points(particles, new THREE.PointsMaterial({ color: 0xffcb61, size: .025, transparent: true, opacity: .7 })));
    function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w,h,false); camera.aspect = w/h; camera.updateProjectionMatrix(); group.position.x = w < 850 ? 1.5 : 2.9; group.scale.setScalar(w < 600 ? .7 : 1); }
    addEventListener('resize', resize); resize();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    function frame() { if (!document.hidden) { if (!reduced) { group.rotation.z -= .0025; group.rotation.y = Math.sin(performance.now()*.00025)*.18; } renderer.render(scene,camera); } requestAnimationFrame(frame); }
    frame();
  } catch (error) { console.warn('3D-Bühne konnte nicht geladen werden.', error); }
}

setup();
