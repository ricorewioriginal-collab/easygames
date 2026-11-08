/**
 * Moderator-Stimme: Web Speech (Browser) – in den Apps über die Android-Sprachausgabe (die App stellt speechSynthesis bereit).
 * Alle deutschen Stimmen des Geräts sind wählbar (Automatisch = beste männliche/natürliche Stimme), Tempo einstellbar.
 * say() liefert ein Promise, das endet, wenn der Satz gesprochen ist (mit Zeit-Sicherung, falls ein Gerät kein Ende meldet).
 */
const TTS = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
const MALE = /stefan|markus|conrad|killian|florian|jonas|hans|yannick|bernd|klaus|thomas|\bmale\b|männ|x-de[bd]\b|deb-|ded-|smtm/i;
const FEM = /anna|katja|hedda|petra|marlene|vicki|amala|seraphina|helena|female|frau|xxa|dea-|deg-/i;

export interface VoiceInfo {
  id: string;
  name: string;
}
export class Voice {
  on = true;
  rate = 1.05;
  pick = '';
  private voices: SpeechSynthesisVoice[] = [];
  private seq = 0;
  onSub: ((t: string) => void) | null = null;
  onTalk: ((on: boolean) => void) | null = null;
  constructor() {
    if (!TTS) return;
    const load = () => {
      try {
        this.voices = speechSynthesis.getVoices() || [];
      } catch {
        this.voices = [];
      }
    };
    load();
    try {
      speechSynthesis.addEventListener('voiceschanged', load);
    } catch {
      /* alt */
    }
    setTimeout(load, 800);
  }
  get available() {
    return TTS;
  }
  /** Deutsche Stimmen (oder alle, falls das Gerät keine deutsche hat) */
  list(): VoiceInfo[] {
    const de = this.voices.filter((v) => /^de([-_]|$)/i.test(v.lang));
    return (de.length ? de : this.voices).map((v) => ({ id: v.voiceURI || v.name, name: v.name + (v.localService === false ? ' (online)' : '') }));
  }
  private voice(): SpeechSynthesisVoice | null {
    if (this.pick) {
      const v = this.voices.find((x) => (x.voiceURI || x.name) === this.pick);
      if (v) return v;
    }
    const de = this.voices.filter((v) => /^de([-_]|$)/i.test(v.lang));
    if (!de.length) return null;
    return de.find((v) => MALE.test(v.name) && /natural|online|neural/i.test(v.name)) || de.find((v) => MALE.test(v.name)) || de.find((v) => !FEM.test(v.name)) || de[0];
  }
  stop() {
    this.seq++;
    if (TTS)
      try {
        speechSynthesis.cancel();
      } catch {
        /* egal */
      }
    this.onTalk?.(false);
  }
  /** Spricht und wartet bis zum Ende (höchstens so lange, wie der Text gesprochen etwa dauert) */
  say(text: string, opt: { cut?: boolean; max?: number } = {}): Promise<void> {
    this.onSub?.(text);
    const est = Math.min(opt.max ?? 9000, 900 + text.length * 62 / this.rate);
    if (!this.on || !TTS) return new Promise((r) => setTimeout(r, Math.min(est, 1800)));
    const my = ++this.seq;
    return new Promise((res) => {
      let done = false;
      const fin = () => {
        if (done) return;
        done = true;
        if (my === this.seq) this.onTalk?.(false);
        res();
      };
      try {
        if (opt.cut) speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text),
          v = this.voice();
        u.lang = v?.lang || 'de-DE';
        if (v) u.voice = v;
        const male = !!v && MALE.test(v.name);
        u.pitch = male ? 1 : 0.86;
        u.rate = this.rate;
        u.volume = 1;
        u.onstart = () => {
          if (my === this.seq) this.onTalk?.(true);
        };
        u.onend = fin;
        u.onerror = fin;
        speechSynthesis.speak(u);
        this.onTalk?.(true);
      } catch {
        fin();
      }
      setTimeout(fin, est + 2500);
    });
  }
  test() {
    return this.say('Hallo! Ich bin Rico, euer Moderator bei Radio-Bingo. So klinge ich.', { cut: true });
  }
}
