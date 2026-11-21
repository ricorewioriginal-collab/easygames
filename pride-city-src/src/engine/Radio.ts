/* Autoradio: die 13 echten RicoReWi-/AnMaCha-Sender live über laut.fm (Stream + „Jetzt läuft“ über api.laut.fm),
   dazu die vier Stadt-Sender aus dem Synthesizer (laufen auch offline). Nichts wird kopiert, gespielt wird immer das Original. */
import { music, vol, onVolume, SONGS } from './Audio';

export interface Station { id: string; name: string; sub: string; icon: string; color: string; slug?: string; song?: keyof typeof SONGS }

export const STATIONS: Station[] = [
  { id: 'ricorewi', slug: 'ricorewi', name: 'RicoReWi Radio', sub: 'Der Sender der Stadt', icon: '📻', color: '#ff3fb0' },
  { id: 'yourtime', slug: 'yourtime-fm', name: 'YourTime FM', sub: 'Deine Zeit, deine Musik', icon: '⏰', color: '#5ce1ff' },
  { id: 'chart', slug: 'chartradio24', name: 'Chartradio 24', sub: 'Die Hits von heute', icon: '🏆', color: '#ffd23b' },
  { id: 'club', slug: 'clubradio24', name: 'Clubradio 24', sub: 'Die Nacht gehört dir', icon: '🪩', color: '#b06bff' },
  { id: 'rap', slug: 'rapradio24', name: 'Rapradio 24', sub: 'Beats und Reime', icon: '🎤', color: '#ff7a3d' },
  { id: 'rock', slug: 'rockradio24', name: 'Rockradio 24', sub: 'Laut und ehrlich', icon: '🎸', color: '#ff4b5c' },
  { id: 'schlager', slug: 'schlagerpop24', name: 'Schlagerpop 24', sub: 'Zum Mitsingen', icon: '💃', color: '#ff8ad1' },
  { id: 'kult', slug: 'kultradio24', name: 'Kultradio 24', sub: 'Klassiker, die bleiben', icon: '📼', color: '#3ddc97' },
  { id: 'anmacha', slug: 'anmacha24', name: 'AnMaCha 24', sub: 'Talk, Spaß und Musik', icon: '🎙️', color: '#7ad7ff' },
  { id: 'zocker', slug: 'zockerfm', name: 'Zocker FM', sub: 'Musik für Spielkinder', icon: '🎮', color: '#8cff5c' },
  { id: 'floh', slug: 'radiofloh', name: 'Radiofloh', sub: 'Für die ganze Familie', icon: '🐞', color: '#ffb347' },
  { id: 'xmas', slug: 'christmasradio24', name: 'Christmasradio 24', sub: 'Weihnachten das ganze Jahr', icon: '🎄', color: '#e23b3b' },
  { id: 'special', slug: 'special-radio', name: 'Special Radio', sub: 'Das Besondere', icon: '✨', color: '#c9a2ff' },
  { id: 'pridefm', song: 'show', name: 'Pride FM 88,8', sub: 'Queeres Radio: Talk, Anrufe, Wissen', icon: '🎙️', color: '#5ce1ff' },
  { id: 'regenbogen', song: 'title', name: 'Regenbogen FM', sub: 'Pop für die ganze Stadt', icon: '🌈', color: '#ff6fb5' },
  { id: 'neon', song: 'neon', name: 'Neon 88', sub: 'Synthwave für Nachtfahrten', icon: '🌴', color: '#ff3fb0' },
  { id: 'prisma', song: 'club', name: 'Prisma Radio', sub: 'Clubsound live aus dem Prisma', icon: '💎', color: '#9b6bff' },
  { id: 'hafen', song: 'lounge', name: 'Hafen Lounge', sub: 'Ruhige Töne vom Kai', icon: '🌊', color: '#3db8ff' },
  { id: 'off', name: 'Radio aus', sub: '', icon: '🔇', color: '#8a8a9a' },
];
/** alte Speicherstände: Senderplatz 0–4 der ersten Fassung */
const LEGACY = ['regenbogen', 'neon', 'prisma', 'hafen', 'off'];
export const stationOf = (v: unknown): Station => STATIONS.find((s) => s.id === v) || STATIONS.find((s) => s.id === LEGACY[Number(v)]) || STATIONS[0];

export interface RadioState { st: Station; on: boolean; loading: boolean; title: string; artist: string; err: string }
const state: RadioState = { st: STATIONS[STATIONS.length - 1], on: false, loading: false, title: '', artist: '', err: '' };
const subs = new Set<(s: RadioState, what: 'station' | 'song' | 'error') => void>();
const emit = (what: 'station' | 'song' | 'error') => subs.forEach((f) => f(state, what));
let el: HTMLAudioElement | null = null, token = 0, songT = 0, startT = 0, ducked = false;
const GAIN = .6; // 100 % Musikregler = 60 % Pegel, damit Motor und Dialoge hörbar bleiben

function level() { if (el) el.volume = Math.max(0, Math.min(1, vol.music * GAIN * (ducked ? .3 : 1))); }
onVolume.push(level);

function release() {
  clearInterval(songT); clearTimeout(startT); songT = startT = 0;
  if (el) { try { el.pause(); el.removeAttribute('src'); el.load(); } catch { /* schon frei */ } }
}
function fetchSong(t: number) {
  const st = state.st; if (t !== token || !st.slug || document.hidden) return;
  const ac = new AbortController(), to = setTimeout(() => ac.abort(), 7000);
  fetch('https://api.laut.fm/station/' + st.slug + '/current_song', { cache: 'no-store', signal: ac.signal })
    .then((r) => (r.ok ? r.json() : null)).then((j) => {
      clearTimeout(to); if (t !== token || !j) return;
      const title = String(j.title || ''), artist = String(j.artist?.name || '');
      if (title === state.title && artist === state.artist) return;
      state.title = title; state.artist = artist; emit('song');
    }).catch(() => clearTimeout(to));
}
function fail(t: number, msg: string) {
  if (t !== token) return;
  release(); state.on = false; state.loading = false; state.err = msg;
  music('title'); // Ersatz aus dem Synthesizer, damit es im Auto nicht still wird
  emit('error');
}

export const radio = {
  state,
  subscribe(f: (s: RadioState, what: 'station' | 'song' | 'error') => void) { subs.add(f); return () => subs.delete(f); },
  /** Sender einschalten (aus einer Bedienhandlung heraus, sonst blockiert der Browser den Ton) */
  tune(st: Station) {
    release(); const t = ++token;
    Object.assign(state, { st, on: false, loading: false, title: '', artist: '', err: '' });
    if (!st.slug) { music(st.song || null); state.on = !!st.song; emit('station'); return; }
    music(null); state.loading = true; emit('station');
    if (!el) {
      el = new Audio(); el.preload = 'none'; el.setAttribute('playsinline', '');
      el.addEventListener('playing', () => { if (state.loading) { state.loading = false; state.on = true; clearTimeout(startT); fetchSong(token); clearInterval(songT); const k = token; songT = window.setInterval(() => fetchSong(k), 20000); } });
      el.addEventListener('error', () => { if (el!.getAttribute('src')) fail(token, 'Sender nicht erreichbar – Internet prüfen.'); });
    }
    level(); el.src = 'https://stream.laut.fm/' + st.slug + '?t=' + Date.now();
    startT = window.setTimeout(() => fail(t, 'Keine Antwort vom Sender.'), 15000);
    el.play().catch((e: Error) => { if (e?.name !== 'AbortError') fail(t, e?.name === 'NotAllowedError' ? 'Der Browser blockiert den Ton – bitte Sender neu wählen.' : 'Sender nicht erreichbar – Internet prüfen.'); });
  },
  /** Radio aus (Aussteigen, Minispiel). Die Spielmusik setzt der Aufrufer. */
  stop() { token++; release(); Object.assign(state, { on: false, loading: false, title: '', artist: '', err: '' }); },
  /** leiser bei Dialogen und Menüs */
  duck(on: boolean) { if (on !== ducked) { ducked = on; level(); } },
  /** läuft gerade ein echter Sender (oder lädt)? */
  get live() { return !!state.st.slug && (state.on || state.loading); },
};
if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (el && radio.live) { if (document.hidden) el.pause(); else el.play().catch(() => {}); } });
