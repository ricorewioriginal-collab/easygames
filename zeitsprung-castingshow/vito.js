// Vito, der Moderator der Zeitsprung-Shows: eine feste deutsche Männerstimme über die Sprachausgabe des Geräts.
// Die Stimme wird einmal gewählt und dann beibehalten, damit sie nicht zwischen männlich und weiblich wechselt.
const synth = typeof speechSynthesis !== 'undefined' ? speechSynthesis : null;
// Bekannte männliche deutsche Systemstimmen (Windows/Edge, macOS/iOS, Chrome OS, Android-Varianten).
const MALE = /\b(stefan|conrad|killian|florian|kasper|markus|yannick|viktor|martin|reed|grandpa|rocko|eddy|ralf|jonas|bernd|klaus|hans|male|männlich|mann)\b/i;
const FEMALE = /female|weiblich|\bfrau\b|anna|petra|helena|hedda|katja|amala|seraphina|marlene|vicki|sandy|shelley|flo\b|grandma|louisa|elke|ingrid|gisela|tanja|ilse|katharina|maja|sabine|leni|hanna/i;
let voice = null, male = false, ready = null, chain = Promise.resolve();

function pick() {
  if (!synth) return;
  const german = synth.getVoices().filter(v => /^de([-_]|$)/i.test(v.lang));
  if (!german.length) return;
  if (voice && german.includes(voice)) return; // einmal gewählt, bleibt sie
  const men = german.filter(v => MALE.test(v.name) && !FEMALE.test(v.name));
  const best = list => list.find(v => /natural|neural|online|premium|enhanced/i.test(v.name)) || list.find(v => v.localService) || list[0];
  male = men.length > 0;
  voice = male ? best(men) : (german.find(v => v.default) || best(german.filter(v => !FEMALE.test(v.name))) || best(german));
}
function whenReady() {
  if (!synth) return Promise.resolve();
  pick();
  if (voice) return Promise.resolve();
  // Stimmen laden in manchen Browsern erst nach dem ersten Zugriff: kurz warten statt mit Zufallsstimme zu starten.
  ready ||= new Promise(resolve => {
    const done = () => { pick(); resolve(); };
    synth.addEventListener?.('voiceschanged', done, { once: true });
    setTimeout(done, 1200);
  });
  return ready;
}
synth?.addEventListener?.('voiceschanged', pick);

// Handys (iOS Safari, Chrome für Android) geben die Sprachausgabe erst frei, wenn sie einmal direkt in einem
// Tipp gestartet wurde. Darum beim ersten Tipp eine stumme Ansage abspielen; danach darf Vito jederzeit sprechen.
function unlock() {
  ['pointerdown', 'touchend', 'click', 'keydown'].forEach(type => removeEventListener(type, unlock, true));
  if (!synth) return;
  pick();
  try { const silent = new SpeechSynthesisUtterance(' '); silent.volume = 0; silent.lang = 'de-DE'; synth.speak(silent); } catch (_) {}
}
if (synth && typeof addEventListener === 'function') ['pointerdown', 'touchend', 'click', 'keydown'].forEach(type => addEventListener(type, unlock, { capture: true, passive: true }));

const clean = text => String(text || '')
  .replace(/(\d+) v\. Chr\./g, '$1 vor Christus')
  .replace(/A[–-]D/g, 'A bis D')
  .replace(/[„“”"«»]/g, '')
  .replace(/\s+/g, ' ').trim();

export function stop() { try { synth?.cancel(); } catch (_) {} }

// queue=false unterbricht die laufende Ansage, queue=true hängt an (z. B. Frage nach der Begrüßung).
export function speak(text, { queue = false } = {}) {
  const message = clean(text);
  if (!synth || !message) return;
  // Chrome für Android verschluckt eine Ansage, die direkt nach dem Abbrechen startet: dann kurz warten.
  const busy = !queue && (synth.speaking || synth.pending);
  if (!queue) stop();
  // Eine Kette hält die Reihenfolge: eine angehängte Frage startet nie vor der Begrüßung davor.
  chain = chain.then(whenReady).then(() => new Promise(resolve => busy ? setTimeout(resolve, 120) : resolve())).then(() => {
    const line = new SpeechSynthesisUtterance(message);
    line.lang = 'de-DE'; line.rate = 1.02;
    // Ohne männliche Systemstimme klingt die Standardstimme mit tieferer Tonlage eher nach Vito.
    line.pitch = male ? .95 : .8;
    if (voice) line.voice = voice;
    try { if (synth.paused) synth.resume(); synth.speak(line); } catch (_) {}
  });
}

// Liest die Frage wie in einer Quizshow vor: Frage, dann „A: …, B: …“.
export function readQuestion(question, options = []) {
  const choices = options.map((option, index) => `${'ABCD'[index]}: ${option}.`).join(' ');
  speak(`${question} ${choices}`, { queue: true });
}
