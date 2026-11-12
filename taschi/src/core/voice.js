// 🗣 Stimmen: Jede Figur hat ein eigenes Stimmprofil (Geschlecht, Alter,
// Klangfarbe, Tonhöhe, Tempo). Zwei Arten, beide kostenlos und ohne Dateien:
//  • „Sprache“: Web Speech API mit deutscher Stimme. Pro Figur wird – soweit
//    das Gerät mehrere deutsche Stimmen hat – eine passende Stimme (weiblich/
//    männlich) gewählt, dazu eigene Tonhöhe und eigenes Tempo, je Zeile mit
//    Stimmung (wütend, fröhlich, traurig …) leicht verändert.
//  • „Plappern“: prozedurale Silben per WebAudio (ein Oszillator + ein Filter
//    pro Silbe, sehr sparsam), Klang und Tonlage je Figur unterschiedlich.
// Hat der Browser keine Sprachausgabe, wird automatisch geplappert.
// Eingebettet spricht ../cloud/anmacha-cloud.js über die einbindende Seite.

const clean = (t) => String(t || '').replace(/[„“”"»«]/g, '').replace(/\p{Extended_Pictographic}|️/gu, '').replace(/[★✦◉]/g, '').replace(/\s+/g, ' ').trim();
function hash(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Feste Besetzung der wichtigen Figuren. sex: f/m, age: kid/teen/adult/old,
// tone: warm | bright | gruff | cool | sly | calm | robot | narrator
export const CAST = {
  'Ulme': { sex: 'm', age: 'old', tone: 'warm' },
  'Astra': { sex: 'f', age: 'adult', tone: 'calm' },
  'Marea': { sex: 'f', age: 'adult', tone: 'calm' },
  'Volt': { sex: 'm', age: 'adult', tone: 'bright' },
  'Rian': { sex: 'm', age: 'teen', tone: 'bright' },
  'Jo': { sex: 'm', age: 'teen', tone: 'bright' },
  'Brix': { sex: 'm', age: 'adult', tone: 'gruff' },
  'Varga': { sex: 'f', age: 'adult', tone: 'cool' },
  'Selma': { sex: 'f', age: 'adult', tone: 'sly' },
  'Kett': { sex: 'm', age: 'adult', tone: 'sly' },
  'Kora': { sex: 'f', age: 'teen', tone: 'sly' },
  'Vera': { sex: 'f', age: 'adult', tone: 'cool' },
  'Ilse': { sex: 'f', age: 'old', tone: 'warm' },
  'Hanna': { sex: 'f', age: 'adult', tone: 'warm' },
  'Lyra': { sex: 'f', age: 'adult', tone: 'calm' },
  'Mira': { sex: 'f', age: 'adult', tone: 'bright' },
  'Pia': { sex: 'f', age: 'kid', tone: 'bright' },
  'Torwächter': { sex: 'm', age: 'adult', tone: 'gruff' },
  'Fels-Fiete': { sex: 'm', age: 'adult', tone: 'gruff' },
  'Perla': { sex: 'f', age: 'adult', tone: 'bright' },
  'Käpt’n Volt': { sex: 'm', age: 'adult', tone: 'gruff' },
  'Blüte': { sex: 'f', age: 'teen', tone: 'warm' },
  'Nilo': { sex: 'm', age: 'adult', tone: 'calm' },
  'Jette': { sex: 'f', age: 'teen', tone: 'bright' },
  'Rumo': { sex: 'm', age: 'old', tone: 'gruff' },
  'Aurelia': { sex: 'f', age: 'adult', tone: 'cool' },
  'Kira': { sex: 'f', age: 'adult', tone: 'cool' },
  'Rokko': { sex: 'm', age: 'adult', tone: 'gruff' },
  'Taro': { sex: 'm', age: 'adult', tone: 'calm' },
  'Nona': { sex: 'f', age: 'old', tone: 'calm' },
  'Lio': { sex: 'm', age: 'teen', tone: 'bright' },
  'Sora': { sex: 'f', age: 'adult', tone: 'bright' },
  'Forschungscomputer': { sex: 'n', age: 'adult', tone: 'robot' },
  'Erzähler': { sex: 'n', age: 'adult', tone: 'narrator' }
};
const FEMALE_WORDS = /^(schwester|oma|frau|mutter|tante|königin|lady|madame|mama|großmutter|kräuterfrau|marktfrau)$/i;
const MALE_WORDS = /^(professor|opa|herr|vater|onkel|könig|kapitän|käpt’n|meister|großvater|papa|nomade|pilger|poet|astronom|fotograf|gärtner|händler|torwächter|assistent|forscher|fürst|hüter)$/i;
const NOT_FEMININE_IN = /^(valentin|kilian|benjamin|martin|merlin|kevin|erwin|edwin|konstantin|justin|quirin|robin|florin|marvin|elvin)$/i;
const FEMALE_NAMES = new Set('Bela Cora Elif Gesa Isa Kaja Mara Olga Rike Tamara Vera Xenia Zoe Anouk Carla Emma Greta Ilka Jule Lotta Nina Pia Selin Uta Wiebke Lina Merle Paula Tilda Juna Ronja Bea Kiki Lotte Suki Finja Nele Mila Ella Ines Oda Ylva Inka Sanne Mei Wilma Liv Sira Ida Noa Runa Frida Tamsin Leyla Marisol Sabah Edda Flora Sina Elin Ira Nova Auri Lin Iris Mia'.split(' '));
const KID = /^(kind|junge|mädchen|geschwister|kleine|kleiner|schüler|schülerin)$/i;
const OLD = /^(oma|opa|großmutter|großvater|ältester|älteste|großmeisterin|großmeister|pilger)$/i;

// Sprecher → stabiler Schlüssel (gleiche Figur = gleiche Stimme, egal ob mit Titel)
function words(who) { return String(who || '').replace(/\(.*?\)/g, '').split(/[\s&]+/).filter(Boolean); }
function castKey(who) {
  if (!who) return null;
  if (CAST[who]) return who;
  const w = words(who);
  for (let i = w.length - 1; i >= 0; i--) if (CAST[w[i]]) return w[i];
  return null;
}

// Stimmprofil einer Figur. Werte bleiben im gültigen Bereich der Web Speech API.
export function profileFor(who, extra = null) {
  if (!who) who = 'Erzähler';
  const key = castKey(who), base = key ? CAST[key] : {};
  const w = words(who), h = hash(key || w[w.length - 1] || who);
  let sex = extra?.sex || base.sex, age = base.age, tone = base.tone;
  if (!sex) {
    // Titel mit -in (Wanderin, Kommandantin …) oder bekannte Vornamen → weiblich
    if (w.some(x => FEMALE_WORDS.test(x) || (/in$/.test(x) && x.length >= 5 && !NOT_FEMININE_IN.test(x)) || FEMALE_NAMES.has(x))) sex = 'f';
    else if (w.some(x => MALE_WORDS.test(x) || /(er|or|mann|ant|ent|ist)$/.test(x))) sex = 'm';
    else { const n = w[w.length - 1] || ''; sex = /[aeiy]$/.test(n) && !/(fiete|ole|uwe|kalle|benno|bruno)$/i.test(n) ? 'f' : (h & 1 ? 'm' : 'f'); }
  }
  if (!age) age = w.some(x => KID.test(x)) ? 'kid' : w.some(x => OLD.test(x)) ? 'old' : (['teen', 'adult', 'adult', 'adult'][(h >>> 4) & 3]);
  if (!tone) tone = ['warm', 'bright', 'calm', 'gruff', 'sly', 'warm'][(h >>> 7) % 6];
  // Tonhöhe: Grundlage nach Geschlecht/Alter, kleine Streuung je Figur
  let pitch = sex === 'f' ? 1.18 : sex === 'm' ? 0.86 : 1;
  pitch += { kid: 0.32, teen: 0.1, adult: 0, old: -0.12 }[age];
  pitch += { gruff: -0.14, bright: 0.08, cool: -0.04, sly: 0.02, warm: 0, calm: -0.03, robot: -0.3, narrator: -0.06 }[tone] || 0;
  pitch += ((h >>> 10) % 15 - 7) / 100;
  let rate = 1 + ({ kid: 0.08, teen: 0.05, adult: 0, old: -0.1 }[age]);
  rate += { gruff: -0.04, bright: 0.06, cool: -0.02, sly: 0.03, calm: -0.06, robot: 0.02, narrator: -0.04 }[tone] || 0;
  rate += ((h >>> 14) % 9 - 4) / 100;
  // Plapper-Klang: Grundfrequenz, Wellenform, Tempo
  const hz = (sex === 'f' ? 230 : sex === 'm' ? 125 : 170) * Math.pow(2, (pitch - 1) * 1.2);
  const wave = tone === 'robot' ? 'square' : tone === 'gruff' ? 'sawtooth' : tone === 'bright' || age === 'kid' ? 'triangle' : (h >>> 18) & 1 ? 'triangle' : 'sawtooth';
  return { key: key || who, sex, age, tone, pitch: clamp(pitch, 0.5, 1.8), rate: clamp(rate, 0.8, 1.2), hz: clamp(hz, 70, 420), wave, slot: h };
}

// Stimmung einer Zeile verändert Tonhöhe/Tempo leicht
const MOOD = { angry: [-0.05, 0.08], happy: [0.06, 0.04], sad: [-0.07, -0.08], surprised: [0.12, 0.05], worried: [0.03, -0.03], talk: [0, 0] };

// Ältere Aufrufe (Tests) nutzen nur pitch/rate
export function voiceFor(who, mood) {
  const p = profileFor(who), m = MOOD[mood] || [0, 0];
  return { pitch: clamp(p.pitch + m[0], 0.5, 1.8), rate: clamp(p.rate + m[1], 0.8, 1.2) };
}

// Deutsche Systemstimmen grob nach Geschlecht einordnen (nur über den Namen)
const F_VOICE = /anna|petra|helena|hedda|katja|amala|seraphina|marlene|vicki|sandy|shelley|grandma|gisela|elke|ingrid|female|frau|weiblich|louisa|tanja|ludmilla|klara|maja|leni/i;
const M_VOICE = /markus|yannick|stefan|conrad|killian|hans|florian|eddy|reed|rocko|grandpa|jonas|daniel|klaus|male|mann|männlich|bernd|ralf|kasper|christoph/i;
export function sortVoices(list) {
  const de = (list || []).filter(v => /^de(-|_|$)/i.test(v.lang));
  const rank = (v) => (/natural|neural|online|premium|enhanced/i.test(v.name) ? 0 : /google/i.test(v.name) ? 1 : 2);
  de.sort((a, b) => rank(a) - rank(b));
  const f = de.filter(v => F_VOICE.test(v.name) && !M_VOICE.test(v.name)), m = de.filter(v => M_VOICE.test(v.name) && !F_VOICE.test(v.name));
  return { all: de, f, m };
}

export class Voice {
  constructor(settings, audio = null) {
    this.settings = settings; this.audio = audio; this.getPlayer = null;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = { all: [], f: [], m: [] }; this.lastBlip = 0; this.out = null;
    if (this.synth) {
      const pick = () => { this.voices = sortVoices(this.synth.getVoices()); };
      pick(); try { this.synth.addEventListener?.('voiceschanged', pick); } catch (e) { }
    }
  }
  get mode() { const v = this.settings.get('voice'); return v === false || this.settings.get('muted') ? 'off' : v === 'babble' ? 'babble' : 'speech'; }
  // Sprache, wenn möglich; sonst Plappern
  get speaking() { return this.mode === 'speech' && !!this.synth && (this.voices.all.length > 0 || !this.synth.getVoices?.().length); }
  get on() { return this.mode !== 'off'; }
  // Spielerfigur: Stimme nach gewähltem Geschlecht (m/f/divers)
  profile(who) { const pl = this.getPlayer?.(); return profileFor(who, pl?.name && who === pl.name ? { sex: pl.gender === 'f' ? 'f' : pl.gender === 'm' ? 'm' : 'n' } : null); }
  pickVoice(p) {
    const V = this.voices, group = p.sex === 'f' ? V.f : p.sex === 'm' ? V.m : [];
    const list = group.length ? group : V.all;
    return list.length ? list[p.slot % list.length] : null;
  }
  speak(text, who, mood) {
    if (!this.speaking) return;
    const t = clean(text); if (!t) return;
    try {
      this.synth.cancel();
      const p = this.profile(who), m = MOOD[mood] || [0, 0], v = this.pickVoice(p);
      const u = new SpeechSynthesisUtterance(t.slice(0, 600));
      u.lang = 'de-DE'; if (v) try { u.voice = v; } catch (e) { }
      // Gibt es keine passende Stimme fürs Geschlecht, gleicht die Tonhöhe stärker aus
      let pitch = p.pitch + m[0];
      if (v && p.sex !== 'n' && !(p.sex === 'f' ? this.voices.f : this.voices.m).includes(v)) pitch += p.sex === 'f' ? 0.12 : -0.12;
      u.pitch = clamp(pitch, 0.5, 1.8);
      u.rate = clamp((p.rate + m[1]) * (this.settings.get('voiceRate') || 1), 0.6, 1.5);
      u.volume = clamp(this.settings.get('voiceVolume') ?? 0.9, 0, 1);
      this.synth.speak(u);
    } catch (e) { }
  }
  stop() { try { if (this.synth?.speaking || this.synth?.pending) this.synth.cancel(); } catch (e) { } }

  // Schreibmaschinen-Laut beim Aufdecken eines Zeichens. Plappern: eine Silbe pro
  // Vokal (gedrosselt). Sonst das gewohnte Tippgeräusch. Gibt true zurück, wenn
  // geplappert wurde.
  tick(ch, who, mood) {
    if (this.mode === 'off' || this.speaking) return false;
    const a = this.audio, c = a?.ctx; if (!c || !a.master) return false;
    const p = this.profile(who), now = c.currentTime;
    const gap = 0.075 / (p.rate * (this.settings.get('voiceRate') || 1));
    const vowel = 'aeiouäöüy'.indexOf(String(ch).toLowerCase());
    if (vowel < 0 || now - this.lastBlip < gap) return true;
    this.lastBlip = now;
    if (!this.out) { this.out = c.createGain(); this.out.connect(a.master); }
    this.out.gain.value = clamp(this.settings.get('voiceVolume') ?? 0.9, 0, 1) * 0.55;
    // Vokal → Formant und kleine Tonhöhenänderung; Stimmung hebt/senkt
    const F = [850, 600, 330, 480, 360, 560, 500, 340, 330][vowel], step = [0, 2, 4, -1, -3, 1, 0, 3, 4][vowel];
    const m = MOOD[mood] || [0, 0], robot = p.tone === 'robot';
    const f0 = p.hz * Math.pow(2, (robot ? 0 : step + (Math.random() * 2 - 1)) / 12) * (1 + m[0] * 1.5);
    const dur = robot ? 0.05 : 0.07 + Math.random() * 0.02, t = now + 0.005;
    const o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
    o.type = p.wave; o.frequency.setValueAtTime(f0, t);
    if (!robot) o.frequency.exponentialRampToValueAtTime(f0 * (mood === 'surprised' ? 1.12 : 0.9), t + dur);
    f.type = 'bandpass'; f.frequency.value = F * (p.sex === 'f' ? 1.25 : 1) * (p.age === 'kid' ? 1.3 : 1); f.Q.value = robot ? 8 : 2.2;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(p.wave === 'triangle' ? 0.5 : 0.32, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f); f.connect(g); g.connect(this.out); o.start(t); o.stop(t + dur + 0.02);
    return true;
  }

  // Stimmprobe in den Optionen
  sample(i) {
    const list = [['Professor Ulme', 'Willkommen in meinem Labor! Bereit für dein erstes Taschi?', 'happy'], ['Rivale Rian', 'Ha! Diesmal schlage ich dich, wetten?', 'happy'], ['Kommandantin Varga', 'Die Schattengilde lässt sich nicht aufhalten.', 'angry'], ['Arenaleitung Perla', 'Zeig mir, wie stark deine Taschis sind!', 'talk'], ['Wirtin Ilse', 'Setz dich, Kind, die Suppe ist gleich fertig.', 'happy'], ['Pia', 'Guck mal, da hinten im Gras hat was geraschelt!', 'surprised'], ['Forschungscomputer', 'Daten gespeichert. Taschidex aktualisiert.', 'talk']];
    const [who, text, mood] = list[i % list.length];
    if (this.speaking) this.speak(text, who, mood);
    else if (this.on && this.audio?.ctx) { let k = 0; const step = () => { if (k < text.length) { this.tick(text[k++], who, mood); setTimeout(step, 28); } }; step(); }
    return who;
  }
}
