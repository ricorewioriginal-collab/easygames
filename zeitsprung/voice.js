// ZEITSPRUNG – Vito, eine einheitliche Moderationsstimme für alle Ausgaben.
// 1. Vorproduzierte Sätze mit Microsoft Edge TTS (neuronale Stimme, siehe tools/zeitsprung-voice/), Datei vo/<schlüssel>.mp3
// 2. Was nicht vorproduziert ist (z. B. eigene Spielernamen): dieselbe Edge-Neural-Stimme über die Sprachausgabe,
//    wenn der Browser sie anbietet (Microsoft Edge, Windows-App/WebView2), sonst die beste männliche deutsche Systemstimme.
// Alle Ausgaben sprechen über diese Datei (zeitsprung/embed.js leitet speechSynthesis aus dem iframe hierher).

export const VOICE_NAME = 'en-US-BrianMultilingualNeural';
const PREFER = [/Brian.*Multilingual.*(Online|Natural|Neural)/i, /Florian.*(Online|Natural|Neural)/i, /Conrad.*(Online|Natural|Neural)/i, /Killian.*(Online|Natural|Neural)/i, /(Online|Natural|Neural).*Deutsch|German.*(Online|Natural)/i];
const MALE = /\b(florian|conrad|killian|stefan|markus|yannick|viktor|martin|jonas|ralf|klaus|hans|male|männlich)\b/i;
const FEMALE = /female|weiblich|seraphina|katja|amala|hedda|petra|anna|helena|vicki|marlene|louisa|elke|tanja|leni/i;

// FNV-1a über UTF-16-Einheiten, Basis 36 – identisch zu tools/zeitsprung-voice/gen-edge.py
export function voKey(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h.toString(36);
}
// Gleiche Zerlegung wie beim Vorproduzieren: Sätze, notfalls Satzteile (Name, Antwortbuchstabe, Nebensatz).
export const norm = t => String(t || '').replace(/[„“”"«»]/g, '').replace(/\s+/g, ' ').trim();
export const sentences = t => norm(t).split(/(?<=[.!?…])\s+(?=[A-ZÄÖÜ0-9„"(])/).map(s => s.trim()).filter(Boolean);
export const clauses = s => s.split(/(?<=[,:;])\s+/).map(c => c.trim()).filter(Boolean);

export function createVoice({ base = './vo/', onLine = () => {}, onState = () => {} } = {}) {
  let index = null, enabled = true, volume = 1, ctx = null, gain = null, queue = [], playing = false, token = 0, current = null, unlocked = false;
  const cache = new Map();
  const synth = typeof speechSynthesis !== 'undefined' ? speechSynthesis : null;
  let sysVoice = null;
  const loadIndex = fetch(base + 'index.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(j => { index = j && Array.isArray(j.keys) ? new Set(j.keys) : new Set(); }).catch(() => { index = new Set(); });

  function pickVoice() {
    if (!synth) return null;
    const all = synth.getVoices().filter(v => /^de([-_]|$)/i.test(v.lang));
    for (const re of PREFER) { const v = all.find(x => re.test(x.name)); if (v) return v; }
    return all.find(v => MALE.test(v.name) && !FEMALE.test(v.name)) || all.find(v => !FEMALE.test(v.name)) || all[0] || null;
  }
  synth?.addEventListener?.('voiceschanged', () => { sysVoice = pickVoice(); });
  sysVoice = pickVoice();

  function audio() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); gain = ctx.createGain(); gain.gain.value = volume; gain.connect(ctx.destination); } catch (_) { ctx = null; } }
    if (ctx?.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }
  function unlock() {
    if (unlocked) return; unlocked = true; audio();
    try { if (synth) { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; synth.speak(u); } } catch (_) {}
  }
  ['pointerdown', 'keydown', 'touchend'].forEach(t => addEventListener(t, unlock, { capture: true, passive: true }));

  async function clip(text) {
    const key = voKey(text);
    if (!index?.has(key)) return null;
    if (!cache.has(key)) cache.set(key, fetch(base + key + '.mp3').then(r => r.ok ? r.arrayBuffer() : Promise.reject()).then(b => new Promise((ok, no) => audio().decodeAudioData(b, ok, no))).catch(() => null));
    return cache.get(key);
  }
  // Plan: Liste aus {buf} (vorproduziert) oder {say} (Sprachausgabe), mit Pausen wie ein Moderator.
  async function plan(text) {
    await loadIndex;
    const parts = [];
    for (const s of sentences(text)) {
      const whole = await clip(s);
      if (whole) { parts.push({ buf: whole, gap: .16 }); continue; }
      for (const c of clauses(s)) {
        const b = await clip(c);
        const last = parts[parts.length - 1];
        if (b) parts.push({ buf: b, gap: /[:]$/.test(c) ? .05 : .09 });
        else if (last?.say !== undefined) last.say += ' ' + c; else parts.push({ say: c, gap: .1 });
      }
      if (parts.length) parts[parts.length - 1].gap = .18;
    }
    return parts;
  }
  function playBuf(buf, my) {
    return new Promise(done => {
      if (my !== token || !audio()) return done();
      const src = ctx.createBufferSource(); src.buffer = buf; src.connect(gain);
      current = { stop: () => { try { src.stop(); } catch (_) {} done(); } };
      src.onended = () => done(); src.start();
    });
  }
  function playSay(text, my) {
    return new Promise(done => {
      if (my !== token || !synth) return done();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'de-DE'; sysVoice ||= pickVoice(); if (sysVoice) u.voice = sysVoice;
      const neural = sysVoice && /online|natural|neural/i.test(sysVoice.name);
      u.rate = neural ? 1.04 : 1.02; u.pitch = neural ? 1 : (MALE.test(sysVoice?.name || '') ? .95 : .82); u.volume = volume;
      let finished = false; const end = () => { if (!finished) { finished = true; done(); } };
      u.onend = end; u.onerror = end; current = { stop: () => { try { synth.cancel(); } catch (_) {} end(); } };
      setTimeout(end, 1500 + text.length * 110); // Sicherheitsnetz, falls ein Browser onend verschluckt
      try { synth.speak(u); } catch (_) { end(); }
    });
  }
  const wait = (s, my) => new Promise(r => setTimeout(r, my === token ? s * 1000 : 0));
  async function pump() {
    if (playing) return; playing = true; onState(true);
    while (queue.length) {
      const { text, my } = queue.shift();
      if (my !== token) continue;
      onLine(text);
      const parts = await plan(text);
      for (const p of parts) {
        if (my !== token) break;
        if (p.buf) await playBuf(p.buf, my); else await playSay(p.say, my);
        await wait(p.gap, my);
      }
    }
    playing = false; current = null; onState(false);
  }
  return {
    say(text, { interrupt = false } = {}) {
      const t = norm(text); if (!t || !enabled) return;
      if (interrupt) this.stop();
      queue.push({ text: t, my: token }); pump();
    },
    stop() { token++; queue = []; current?.stop(); current = null; try { synth?.cancel(); } catch (_) {} },
    speaking: () => playing,
    pending: () => queue.length > 0,
    setEnabled(on) { enabled = !!on; if (!enabled) this.stop(); },
    enabled: () => enabled,
    setVolume(v) { volume = Math.max(0, Math.min(1, v)); if (gain) gain.gain.value = volume; },
    info() { return { clips: index ? index.size : 0, system: sysVoice?.name || '', neural: !!(sysVoice && /online|natural|neural/i.test(sysVoice.name)) }; },
    preload(texts) { loadIndex.then(() => texts.forEach(t => sentences(t).forEach(s => clip(s)))); }
  };
}
