// Abenteurer-Radio: 13 echte Sender live über laut.fm. Läuft das Radio,
// schweigt die Spielmusik (Musik-Bus auf 0). Die Lautstärke ist bewusst
// gedeckelt und wird bei Dialogen und Sprachausgabe automatisch leiser.
// Der aktuelle Titel kommt aus der laut.fm-API und wird zum Songende neu geladen.
// Slugs geprüft gegen ricorewi-radio/Hörerbot/stations.json (wie mimori/radio.js).
export const STATIONS = [
  ['ricorewi', 'Lichterfunk', 'RicoReWi Radio'],
  ['yourtime-fm', 'Wanderwind FM', 'YourTime FM'],
  ['rapradio24', 'Arena-Beats', 'Rapradio 24'],
  ['schlagerpop24', 'Moostal-Melodien', 'Schlagerpop 24'],
  ['chartradio24', 'Siegel-Charts', 'Chartradio 24'],
  ['clubradio24', 'Sternennest-Club', 'Clubradio 24'],
  ['anmacha24', 'Taschi-Treff', 'AnMaCha 24'],
  ['radiofloh', 'Kleine Taschis', 'Radiofloh'],
  ['rockradio24', 'Glutland-Rock', 'Rockradio 24'],
  ['christmasradio24', 'Raureif-Weihnacht', 'Christmasradio 24'],
  ['kultradio24', 'Zeitkapsel-Kult', 'Kultradio 24'],
  ['zockerfm', 'Abenteuer-Zocker', 'Zocker FM'],
  ['special-radio', 'Himmelslicht Spezial', 'Special Radio']
].map(([slug, title, name]) => ({ slug, title, name, url: 'https://stream.laut.fm/' + slug }));
export const stationBy = (slug) => STATIONS.find(s => s.slug === slug) || null;

export const MAX_GAIN = 0.55;     // 100 % Regler = 55 % Pegel, damit Dialoge verständlich bleiben
export const DUCK = 0.35;         // bei Dialogen/Sprache auf 35 %

// "2026-11-12 18:03:21 +0100" → ms
export function parseLautTime(s) {
  if (!s) return NaN;
  const m = String(s).match(/^(\d{4}-\d\d-\d\d)[ T](\d\d:\d\d:\d\d)\s*([+-]\d\d):?(\d\d)$/);
  return m ? Date.parse(m[1] + 'T' + m[2] + m[3] + ':' + m[4]) : Date.parse(s);
}
export function songText(j) {
  if (!j || typeof j !== 'object') return '';
  const artist = typeof j.artist === 'string' ? j.artist : j.artist?.name;
  return [artist, j.title].filter(Boolean).join(' – ');
}

export class Radio {
  constructor(settings, audio) {
    this.settings = settings; this.audio = audio;
    this.el = null; this.live = false; this.status = ''; this.song = ''; this.nextPoll = 0; this.gain = 0; this.listeners = new Set();
    settings.on('change', (k) => { if (k === 'radio') this.sync(); });
  }
  get slug() { return this.settings.get('radio') || ''; }
  get station() { return stationBy(this.slug); }
  get on() { return !!this.station; }
  onChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit() { for (const fn of this.listeners) try { fn(this); } catch (e) { } }

  play(slug) { this.settings.set('radio', stationBy(slug) ? slug : ''); }
  stop() { this.settings.set('radio', ''); }
  // nach einer Nutzergeste aufrufen (Autoplay-Regeln der Browser)
  resume() { if (this.on && (!this.el || this.el.paused)) this.sync(); }

  sync() {
    const st = this.station;
    if (!st) {
      if (this.el) { this.el.pause(); this.el.removeAttribute('src'); try { this.el.load(); } catch (e) { } }
      this.live = false; this.song = ''; this.status = ''; this.audio.radioActive = false; this.audio.applyVolumes?.(); this.emit(); return;
    }
    if (typeof Audio === 'undefined') { this.status = 'Dieser Browser kann kein Live-Radio abspielen.'; this.emit(); return; }
    if (!this.el) {
      this.el = new Audio(); this.el.preload = 'none'; this.el.volume = 0;
      this.el.addEventListener('playing', () => { this.live = true; this.status = ''; this.emit(); });
      this.el.addEventListener('error', () => { if (!this.el.getAttribute('src')) return; this.live = false; this.status = 'Sender gerade nicht erreichbar – wähl einen anderen.'; this.audio.radioActive = false; this.audio.applyVolumes?.(); this.emit(); });
    }
    this.audio.radioActive = true; this.audio.applyVolumes?.();
    if (this.el.dataset.slug !== st.slug) { this.el.src = st.url; this.el.dataset.slug = st.slug; this.live = false; this.song = ''; this.nextPoll = 0; }
    this.status = this.live ? '' : 'Verbinde …';
    this.el.play().catch(() => { this.status = 'Tippe einmal ins Spiel, um das Radio zu starten.'; this.emit(); });
    this.emit();
  }

  async poll() {
    const st = this.station; if (!st) return;
    this.nextPoll = performance.now() + 20000;
    try {
      const r = await fetch('https://api.laut.fm/station/' + encodeURIComponent(st.slug) + '/current_song', { cache: 'no-store' });
      if (!r.ok) return;
      const j = await r.json();
      if (st !== this.station) return;
      const text = songText(j);
      if (text && text !== this.song) { this.song = text; this.emit(); }
      const end = parseLautTime(j.ends_at);
      if (Number.isFinite(end)) this.nextPoll = performance.now() + Math.max(4000, Math.min(60000, end - Date.now() + 2500));
    } catch (e) { }
  }

  // jedes Bild: Pegel nachführen (sanft), Titel zum Songende neu holen
  update(dt) {
    if (!this.on || !this.el) return;
    const s = this.settings;
    const duck = s.get('radioDuck') !== false && (!!document.getElementById('dialog') || !!window.speechSynthesis?.speaking);
    const target = s.get('muted') ? 0 : Math.max(0, Math.min(1, s.get('radioVolume') ?? 0.4)) * MAX_GAIN * (duck ? DUCK : 1);
    this.gain += (target - this.gain) * Math.min(1, dt * 4);
    const v = Math.max(0, Math.min(1, this.gain));
    if (Math.abs(this.el.volume - v) > 0.004) this.el.volume = v;
    if (this.live && performance.now() >= this.nextPoll) this.poll();
  }
}
