// 🗣 Sprachausgabe: Dialogzeilen werden vorgelesen (Web Speech API, deutsche
// Stimme). Jede Figur bekommt über ihren Namen eine eigene Tonhöhe und ein
// eigenes Tempo, Erzähltext eine ruhige Erzählstimme. Eingebettet spricht
// ../cloud/anmacha-cloud.js über die einbindende Seite. Ohne Sprachausgabe im
// Browser bleibt alles stumm, das Spiel läuft unverändert.

const clean = (t) => String(t || '').replace(/[„“”"»«]/g, '').replace(/[★✦◉🐾🌊🕊📷⚡🔥💧🌱🪨🪽👻❄️⛰️⭐]/gu, '').replace(/\s+/g, ' ').trim();
function hash(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

// Stimmlage je Sprecher: Kinder höher, Professoren/Ältere tiefer, Gilde etwas rauer
export function voiceFor(who) {
  if (!who) return { pitch: 1, rate: 1.02 };
  const h = hash(who), w = who.toLowerCase();
  let pitch = 0.85 + (h % 40) / 100, rate = 0.95 + ((h >> 8) % 16) / 100;
  if (/professor|oma|opa|ältest|wächter|meister/.test(w)) { pitch -= 0.15; rate -= 0.06; }
  if (/kind|pia|kleine|junge|mädchen/.test(w)) pitch += 0.25;
  if (/gilde|varga|selma|kett|kora|brix/.test(w)) { pitch -= 0.08; rate += 0.04; }
  return { pitch: Math.max(0.5, Math.min(1.8, pitch)), rate: Math.max(0.8, Math.min(1.2, rate)) };
}

export class Voice {
  constructor(settings) {
    this.settings = settings;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voice = null;
    if (this.synth) {
      const pick = () => { const vs = this.synth.getVoices() || []; this.voice = vs.find(v => /^de(-|_|$)/i.test(v.lang) && /google|natural|neural/i.test(v.name)) || vs.find(v => /^de(-|_|$)/i.test(v.lang)) || null; };
      pick(); try { this.synth.addEventListener?.('voiceschanged', pick); } catch (e) { }
    }
  }
  get on() { return !!this.synth && this.settings.get('voice') !== false && !this.settings.get('muted'); }
  speak(text, who) {
    if (!this.on) return;
    const t = clean(text); if (!t) return;
    try {
      this.synth.cancel();
      const u = new SpeechSynthesisUtterance(t.slice(0, 600));
      u.lang = 'de-DE'; if (this.voice) u.voice = this.voice;
      const v = voiceFor(who); u.pitch = v.pitch; u.rate = v.rate * (this.settings.get('voiceRate') || 1);
      u.volume = Math.max(0, Math.min(1, this.settings.get('voiceVolume') ?? 0.9));
      this.synth.speak(u);
    } catch (e) { }
  }
  stop() { try { if (this.synth?.speaking || this.synth?.pending) this.synth.cancel(); } catch (e) { } }
}
