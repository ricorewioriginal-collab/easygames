/* Lieder für die Drag-Show: Club-Beat (live erzeugt), die Buch-Hymne „Ich bin das Licht“ als offizielles YouTube-Video
   (erst nach Zustimmung, sonst Beat im Takt) und Klaviersongs aus Klavierlicht (gemeinfrei, Noten aus ../klavierlicht/). */

export interface ChartNote { t: number; lane: number }
export type ShowSong = { kind: 'club' } | { kind: 'yt' } | { kind: 'beat' } | { kind: 'piano'; id: string; title: string; artist?: string; lic?: string };
export interface PianoParts { notes: ChartNote[]; mel: Array<[number, number, number]>; acc: Array<[number, number, number, number]>; bpm: number; dur: number }
export interface KlSong { id: string; title: string; artist?: string; cat?: string; lic?: string; diff?: number; dur?: number; builtin?: boolean }

/** Offizielles Video zum Buch (wie im alten Roman-Spiel) */
export const HYMN = { id: '5ZFsCy3vqLI', title: 'Ich bin das Licht', artist: 'Leon Sommer & Lady Luma', bpm: 120, len: 214 };

interface KLLib { list(): Promise<KlSong[]>; chart(s: KlSong): Promise<unknown>; parts(c: unknown, level: string, lanes: number): PianoParts }
declare global { interface Window { KLSongLib?: KLLib; YT?: { Player: new (el: HTMLElement | string, o: object) => YTPlayer }; onYouTubeIframeAPIReady?: () => void } }
export interface YTPlayer { getCurrentTime(): number; playVideo(): void; stopVideo(): void; destroy(): void }

const script = (src: string) => new Promise<void>((res, rej) => {
  if (document.querySelector(`script[data-src="${src}"]`)) return res();
  const s = document.createElement('script'); s.src = src; s.dataset.src = src; s.onload = () => res(); s.onerror = () => rej(new Error(src)); document.head.appendChild(s);
});
let lib: Promise<KLLib> | null = null;
/** Klavierlicht-Bibliothek nachladen (liegt als Nachbarordner im easygames-Repo und in der App) */
export function klavier(): Promise<KLLib> {
  if (!lib) lib = (async () => {
    for (const f of ['core.js', 'songs.js', 'songlib.js']) await script(`../klavierlicht/js/${f}`);
    if (!window.KLSongLib) throw new Error('Klavierlicht fehlt');
    return window.KLSongLib;
  })().catch((e) => { lib = null; throw e; });
  return lib;
}
export async function pianoSongs(): Promise<KlSong[]> {
  const all = await (await klavier()).list();
  return all.filter((s) => s.cat !== 'choral');
}
export async function pianoParts(s: KlSong): Promise<PianoParts> {
  const L = await klavier();
  const list = await L.list();
  const song = list.find((x) => x.id === s.id) || s;
  return L.parts(await L.chart(song), 'normal', 4);
}

/** Noten im Takt (Strophe ruhiger, Refrain dichter) – wie im alten Roman-Spiel */
export function beatChart(bpm: number, len: number, seed = 7, lead = 4): ChartNote[] {
  let s = seed >>> 0 || 1; const r = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  const beat = 60 / bpm, out: ChartNote[] = []; let lane = 1;
  for (let t = lead; t < len - 3; t += beat) {
    const bar = Math.floor((t - lead) / (beat * 16)), chorus = bar % 4 === 2 || bar % 4 === 3;
    if (!chorus && r() < .18) continue;
    const mv = r(); lane = mv < .4 ? (lane + 1) % 4 : mv < .8 ? (lane + 3) % 4 : Math.floor(r() * 4);
    out.push({ t: +t.toFixed(3), lane });
    if (chorus && r() < .12) out.push({ t: +t.toFixed(3), lane: (lane + 2) % 4 });
  }
  return out;
}

/* ---------- YouTube (youtube-nocookie, erst nach Zustimmung) ---------- */
let api: Promise<NonNullable<Window['YT']>> | null = null;
function ytApi() {
  if (!api) api = new Promise<NonNullable<Window['YT']>>((res, rej) => {
    if (window.YT?.Player) return res(window.YT);
    const prev = window.onYouTubeIframeAPIReady; window.onYouTubeIframeAPIReady = () => { prev?.(); res(window.YT!); };
    script('https://www.youtube.com/iframe_api').catch(rej);
    setTimeout(() => rej(new Error('YouTube antwortet nicht')), 12000);
  }).catch((e) => { api = null; throw e; });
  return api;
}
/** Spielt das Video in `box`; liefert eine Uhr (Sekunden im Video, null solange es nicht läuft) */
export async function ytStart(box: HTMLElement, onEnd: () => void) {
  const YT = await ytApi();
  let t0 = 0, playing = false, last = 0, ready = false;
  const host = document.createElement('div'); box.appendChild(host);
  const player: YTPlayer = await new Promise((res, rej) => {
    const p = new YT.Player(host, {
      host: 'https://www.youtube-nocookie.com', videoId: HYMN.id, width: 320, height: 180,
      playerVars: { playsinline: 1, rel: 0, modestbranding: 1, controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3, autoplay: 1, origin: location.origin },
      events: {
        onReady: () => { ready = true; p.playVideo(); res(p); },
        onStateChange: (e: { data: number }) => { playing = e.data === 1; if (playing) t0 = performance.now() / 1000 - p.getCurrentTime(); if (e.data === 0) onEnd(); },
        onError: () => rej(new Error('Video nicht abspielbar')),
      },
    }) as YTPlayer;
    setTimeout(() => { if (!ready) rej(new Error('Video lädt nicht')); }, 15000);
  });
  const clock = () => {
    if (!playing) return null;
    const now = performance.now() / 1000;
    if (now - last > .5) { last = now; const d = player.getCurrentTime() - (now - t0); t0 -= Math.abs(d) > .25 ? d : d * .2; }
    return now - t0;
  };
  return { clock, stop: () => { try { player.stopVideo(); player.destroy(); } catch { /* egal */ } box.innerHTML = ''; } };
}
