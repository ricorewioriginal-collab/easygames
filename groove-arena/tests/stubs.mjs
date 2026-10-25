// Groove Arena – Test-Attrappen: YouTube-IFrame-API, iTunes, Piped/Invidious, lrclib (kein Internet nötig)
export const YT_STUB = `(function(){var Y=window.__yt={players:[]};function P(el,o){var self=this,d=typeof el==='string'?document.getElementById(el):el;var f=document.createElement('div');f.style.cssText='width:100%;height:100%;background:linear-gradient(135deg,#202040,#5a2a8a);color:#fff;display:flex;align-items:center;justify-content:center;font:700 22px sans-serif';f.textContent='▶ YouTube '+o.videoId;d.replaceWith(f);this.t=0;this.state=-1;this.id=o.videoId;this.dur=window.__ytDur||200;this.at=0;Y.players.push(this);this.__set=function(t){self.t=t;self.at=performance.now();};
 if((window.__ytBlock||[]).indexOf(o.videoId)>=0){setTimeout(function(){o.events.onError&&o.events.onError({data:150})},50);return;}
 setTimeout(function(){o.events.onReady&&o.events.onReady({target:self})},60);
 this.playVideo=function(){self.state=1;self.at=performance.now();o.events.onStateChange&&o.events.onStateChange({data:1})};this.pauseVideo=function(){self.t=self.getCurrentTime();self.state=2;o.events.onStateChange&&o.events.onStateChange({data:2})};
 this.seekTo=function(s){self.t=s;self.at=performance.now()};this.getCurrentTime=function(){return self.state===1?self.t+(performance.now()-self.at)/1000*(window.__ytRate||1):self.t};this.getDuration=function(){return self.dur};this.setVolume=function(){};this.destroy=function(){};}
 window.YT={Player:P};setTimeout(function(){window.onYouTubeIframeAPIReady&&window.onYouTubeIframeAPIReady()},10);})();`;
export const ITUNES = { results: [
  { trackName: 'Tanz die Nacht', artistName: 'Test Band', trackTimeMillis: 198000, primaryGenreName: 'Pop', artworkUrl100: '', releaseDate: '2025-01-01' },
  { trackName: 'Disco Rakete', artistName: 'Die Glitzer', trackTimeMillis: 214000, primaryGenreName: 'Disco', artworkUrl100: '', releaseDate: '1979-01-01' },
  { trackName: 'Salsa Sol', artistName: 'Luz y Ritmo', trackTimeMillis: 187000, primaryGenreName: 'Latin', artworkUrl100: '', releaseDate: '2024-01-01' } ] };
export const PIPED = { items: [ { url: '/watch?v=AAAAAAAAAAA', title: 'Test Band - Tanz die Nacht (Official Video)', duration: 200, uploaderName: 'Test Band' }, { url: '/watch?v=BBBBBBBBBBB', title: 'Tanz die Nacht (Live)', duration: 260, uploaderName: 'Fan' } ] };
export function lrc() { let s = '', t = 10; const v = ['eins', 'zwei', 'drei', 'vier'], c = ['tanz mit mir', 'die ganze nacht', 'tanz mit mir', 'bis zum morgen']; for (let r = 0; r < 3; r++) { for (const x of v) { s += `[${String(Math.floor(t / 60)).padStart(2, '0')}:${(t % 60).toFixed(2).padStart(5, '0')}] ${x} ${r}\n`; t += 4; } for (const x of c) { s += `[${String(Math.floor(t / 60)).padStart(2, '0')}:${(t % 60).toFixed(2).padStart(5, '0')}] ${x}\n`; t += 4; } } return s; }
// laut.fm: Sender, aktueller Titel (umschaltbar über RADIO.now) und ein Klick-Stream mit 120 BPM (WAV, CORS frei)
export const RADIO = { now: { title: 'Kleiner Prinz', artist: 'Pashanim', len: 150 } };
function clickWav(sec, bpm, b0) { const sr = 8000, n = sr * sec, buf = Buffer.alloc(44 + n * 2); buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  const P = 60 / bpm; for (let i = 0; i < n; i++) { const t = i / sr, ph = ((t - b0) % P + P) % P, env = ph < .06 ? Math.exp(-ph * 60) : 0, v = env * (Math.sin(2 * Math.PI * 90 * t) * .7 + (Math.random() - .5) * .3); buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 30000))), 44 + i * 2); } return buf; }
let WAV = null;
export async function stub(ctx) {
  const cors = { 'access-control-allow-origin': '*' };
  await ctx.route(/api\.laut\.fm\/station\/[^/]+\/current_song/, r => { const n = RADIO.now, now = Date.now(), f = d => new Date(d).toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' +0000'); r.fulfill({ body: JSON.stringify({ type: 'song', title: n.title, artist: { name: n.artist }, length: n.len, started_at: f(now - 20000), ends_at: f(now + (n.len - 20) * 1000) }), contentType: 'application/json', headers: cors }); });
  await ctx.route(/api\.laut\.fm\/station\/[^/]+$/, r => { const id = r.request().url().split('/').pop(); r.fulfill({ body: JSON.stringify({ name: id, display_name: id.replace(/24$/, ' 24'), page_url: 'https://laut.fm/' + id, genres: ['Pop'], images: { station_120x120: 'https://assets.laut.fm/' + id + '?t=_120x120' } }), contentType: 'application/json', headers: cors }); });
  await ctx.route(/assets\.laut\.fm/, r => r.fulfill({ body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="20" fill="#8645e0"/><circle cx="60" cy="60" r="34" fill="#ffd23a"/><text x="60" y="72" font-size="34" text-anchor="middle" font-family="sans-serif" font-weight="700" fill="#1a0838">FM</text></svg>', contentType: 'image/svg+xml', headers: cors }));
  await ctx.route(/stream\.laut\.fm/, r => { WAV = WAV || clickWav(90, 120, .25); r.fulfill({ body: WAV, contentType: 'audio/wav', headers: cors }); });
  await ctx.route(/youtube\.com\/iframe_api/, r => r.fulfill({ body: YT_STUB, contentType: 'text/javascript' }));
  await ctx.route(/itunes\.apple\.com\/search/, r => r.fulfill({ body: JSON.stringify(ITUNES), contentType: 'application/json', headers: { 'access-control-allow-origin': '*' } }));
  await ctx.route(/\/search\?filter=videos/, r => r.fulfill({ body: JSON.stringify(PIPED), contentType: 'application/json', headers: { 'access-control-allow-origin': '*' } }));
  await ctx.route(/\/api\/v1\/search|instances\.json|piped-instances/, r => r.fulfill({ status: 503, body: '' }));
  await ctx.route(/lrclib\.net/, r => r.fulfill({ body: JSON.stringify({ syncedLyrics: lrc() }), contentType: 'application/json', headers: { 'access-control-allow-origin': '*' } }));
  await ctx.route(/i\.ytimg\.com|mzstatic/, r => r.fulfill({ status: 404, body: '' }));
}
