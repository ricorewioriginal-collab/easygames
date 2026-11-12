/* Abenteurer-Radio: die 13 RicoReWi-Sender (laut.fm) als Hintergrundmusik.
   Eigenes Fenster + Titelleiste, leiser unter Dialogen (Ducking), eigener Lautstärkeregler.
   Nur ein <audio>-Element und ein Abruf alle 15 s – keine Last für Render-Schleife und Handy. */
const ST = [
  ['ricorewi', 'Ricorewi', 'Lagerfeuer von Lunaris', '🔥'],
  ['yourtime-fm', 'YourTime-FM', 'Aufbruch ins Abenteuer', '🧭'],
  ['rapradio24', 'Rapradio 24', 'Gassen-Barden von Valdoria', '🎤'],
  ['schlagerpop24', 'Schlagerpop 24', 'Marktplatz-Herzschmerz', '💖'],
  ['chartradio24', 'Chartradio 24', 'Heldenhitparade', '🏆'],
  ['clubradio24', 'Clubradio 24', 'Mondlicht-Tanzsaal', '🌙'],
  ['anmacha24', 'Anmacha 24', 'Splitterfunke', '💎'],
  ['radiofloh', 'Radiofloh', 'Fellis Spielwiese', '🦊'],
  ['rockradio24', 'Rockradio 24', 'Mondwolf-Donner', '🐺'],
  ['christmasradio24', 'Christmasradio 24', 'Frosthain-Glocken', '❄️'],
  ['kultradio24', 'Kultradio 24', 'Legendenkammer', '📜'],
  ['zockerfm', 'Zocker FM', 'Pixelpforte-Funk', '🎮'],
  ['special-radio', 'Special-Radio', 'Wunderwinkel', '✨']
];
const KEY = 'zotik_radio';
const CSS = `
#radioNow{position:fixed;top:max(8px,env(safe-area-inset-top));left:50%;transform:translate(-50%,-14px);z-index:4;max-width:min(520px,calc(100% - 150px));padding:6px 14px 6px 10px;border-radius:999px;display:flex;align-items:center;gap:9px;font-size:12.5px;line-height:1.25;color:#eaf1ff;background:rgba(8,16,48,.72);border:1px solid rgba(140,180,255,.35);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);opacity:0;pointer-events:none;transition:opacity .35s,transform .35s}
#radioNow.on{opacity:1;transform:translate(-50%,0)}body.cut #radioNow{opacity:0}
#radioNow .eq{display:flex;gap:2px;align-items:flex-end;height:14px;flex:none}#radioNow .eq i{width:3px;height:30%;background:#ffd45a;border-radius:2px;animation:rEq .9s ease-in-out infinite}#radioNow .eq i:nth-child(2){animation-delay:.25s}#radioNow .eq i:nth-child(3){animation-delay:.5s}
@keyframes rEq{50%{height:100%}}
#radioNow .t{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}#radioNow b{font-weight:700}#radioNow small{opacity:.65;margin-left:6px}
#radioBox{position:fixed;inset:0;z-index:9;display:grid;place-items:center;background:rgba(2,4,20,.76)}#radioBox[hidden]{display:none}
#radioBox .rb{width:min(520px,calc(100% - 20px));max-height:calc(100% - 20px);overflow:auto;padding:14px 16px;color:#eaf1ff;text-align:left}
#radioBox h3{margin:0;font-size:20px;color:#ffd45a;display:flex;align-items:center;gap:8px}#radioBox .sub{margin:2px 0 10px;font-size:12.5px;opacity:.7}
#radioBox .rr{display:flex;align-items:center;gap:10px;margin:8px 0}#radioBox .rr input[type=range]{flex:1;accent-color:#ffd45a;min-width:0}
#radioBox .rsw{flex:none;padding:8px 14px;border-radius:999px;border:1px solid rgba(140,180,255,.4);background:rgba(120,170,255,.15);color:inherit;font-weight:600;font-size:14px}#radioBox .rsw.p{background:#ffd45a;color:#2a1700;border-color:#ffd45a}
#radioBox .rl{display:grid;gap:5px;margin:8px 0}
#radioBox .ri{display:flex;align-items:center;gap:10px;width:100%;padding:8px 10px;border-radius:12px;border:1px solid rgba(140,180,255,.22);background:rgba(120,170,255,.08);color:inherit;text-align:left;font-size:14px}
#radioBox .ri.on{border-color:#ffd45a;background:rgba(255,212,90,.14)}#radioBox .ri span:first-child{font-size:20px;flex:none}#radioBox .ri b{display:block;font-weight:700}#radioBox .ri small{opacity:.68;font-size:12px}
#radioBox .src{margin-top:10px;padding-top:8px;border-top:1px solid rgba(140,180,255,.22);font-size:12px;opacity:.8;display:flex;flex-wrap:wrap;gap:4px 12px;justify-content:space-between}#radioBox .src a{color:#9fc4ff}
#radioBox .hint{font-size:11.5px;opacity:.6;margin:4px 0 0}
`;

export function createRadio({ ducking, muteMusic, getVolOk }) {
  let cfg = { on: false, st: 'ricorewi', vol: 0.5 };
  try { Object.assign(cfg, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* ohne Speicher weiter */ }
  if (!ST.some(s => s[0] === cfg.st)) cfg.st = ST[0][0];
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) { /* egal */ } };
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const st = () => ST.find(s => s[0] === cfg.st) || ST[0];

  const style = el('style'); style.textContent = CSS; document.head.appendChild(style);
  const now = el('div', '', '<span class="eq"><i></i><i></i><i></i></span><span class="t"></span>'); now.id = 'radioNow'; document.body.appendChild(now);
  const nowT = now.querySelector('.t');
  const box = el('div'); box.id = 'radioBox'; box.hidden = true;
  box.innerHTML = '<div class="rb glass"><h3>📻 Abenteurer-Radio</h3><p class="sub">Unsere 13 Radiosender statt der Hintergrundmusik – live aus dem Netz.</p>'
    + '<div class="rr"><button class="rsw p" id="rSw"></button><span>🔈</span><input type="range" id="rVol" min="0" max="100" aria-label="Radio-Lautstärke"><span id="rPct" style="width:3.2em;text-align:right"></span></div>'
    + '<p class="hint" id="rHint">Leiser unter Gesprächen. Der Regler gilt nur für das Radio.</p><div class="rl" id="rList"></div>'
    + '<div class="src"><span>Quelle: <a href="https://laut.fm" target="_blank" rel="noopener">laut.fm</a></span><span><a href="https://anmacha.de" target="_blank" rel="noopener">anmacha.de</a> · <a href="https://ricorewi-radio.de" target="_blank" rel="noopener">ricorewi-radio.de</a></span></div>'
    + '<div class="mb" style="margin-top:10px;display:flex"><button id="rClose" class="p" style="flex:1;padding:9px 12px;border-radius:999px;border:1px solid #ffd45a;background:#ffd45a;color:#2a1700;font-weight:600;font-size:14px">Zurück</button></div></div>';
  document.body.appendChild(box);
  const $ = id => box.querySelector('#' + id);

  let au = null, song = null, tm = 0, retry = 0, duck = 1, vol = 0;
  const playing = () => cfg.on && au && !au.paused;

  function draw() {
    const s = st();
    $('rSw').textContent = cfg.on ? '⏹ Radio aus' : '▶ Radio an';
    $('rVol').value = Math.round(cfg.vol * 100); $('rPct').textContent = Math.round(cfg.vol * 100) + ' %';
    $('rHint').textContent = getVolOk() ? 'Leiser unter Gesprächen. Der Regler gilt nur für das Radio.' : 'Auf diesem Gerät regelst du die Lautstärke mit den Tasten des Geräts.';
    $('rList').innerHTML = ST.map(x => `<button class="ri${x[0] === cfg.st ? ' on' : ''}" data-s="${x[0]}"><span>${x[3]}</span><span><b>${x[2]}</b><small>${x[1]}</small></span></button>`).join('');
    $('rList').querySelectorAll('.ri').forEach(b => b.onclick = () => pick(b.dataset.s));
    now.classList.toggle('on', !!cfg.on);
    const t = song ? `<b>${song.t}</b>${song.a ? ' – ' + song.a : ''}<small>${s[2]} · ${s[1]}</small>` : `<b>${s[2]}</b><small>${s[1]} · laut.fm</small>`;
    nowT.innerHTML = t;
  }

  function applyVol() {
    if (!au) return;
    const v = Math.max(0, Math.min(1, cfg.vol * duck));
    if (Math.abs(v - vol) > 0.002) { vol = v; try { au.volume = v; } catch (e) { /* iOS: fest */ } }
  }
  function load() {
    if (!au) { au = new Audio(); au.preload = 'none'; au.setAttribute('playsinline', ''); au.addEventListener('error', again); au.addEventListener('stalled', again); au.addEventListener('ended', again); }
    au.src = 'https://stream.laut.fm/' + cfg.st + '?t=' + Date.now(); vol = -1; applyVol();
    const p = au.play(); if (p && p.catch) p.catch(() => { /* wartet auf Fingertipp */ });
  }
  function again() { if (!cfg.on) return; clearTimeout(retry); retry = setTimeout(() => { if (cfg.on && au && (au.paused || au.error || au.readyState < 2)) load(); }, 3500); }
  async function poll() {
    if (!cfg.on || document.hidden) return;
    const id = cfg.st;
    try {
      const r = await fetch('https://api.laut.fm/station/' + id + '/current_song', { cache: 'no-store' }); const j = await r.json();
      if (id === cfg.st && j && j.title) { song = { t: j.title, a: j.artist && j.artist.name || '' }; draw(); }
    } catch (e) { /* offline: Sendername bleibt */ }
  }
  function set(on) {
    cfg.on = on; save(); song = null;
    if (on) { load(); poll(); clearInterval(tm); tm = setInterval(poll, 15000); }
    else { clearInterval(tm); clearTimeout(retry); if (au) { au.pause(); au.removeAttribute('src'); au.load(); } }
    muteMusic(on); draw();
  }
  function pick(id) { cfg.st = id; save(); song = null; if (!cfg.on) set(true); else { load(); poll(); } draw(); }

  $('rSw').onclick = () => set(!cfg.on);
  $('rVol').oninput = e => { cfg.vol = e.target.value / 100; save(); $('rPct').textContent = e.target.value + ' %'; applyVol(); };
  $('rClose').onclick = () => close();
  box.addEventListener('pointerdown', e => { if (e.target === box) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !box.hidden) { close(); e.stopPropagation(); } }, true);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) poll(); });
  function open() { draw(); box.hidden = false; }
  function close() { box.hidden = true; }

  /* Ducking + Musik stumm halten (läuft ruhig alle 250 ms, nur wenn das Radio an ist) */
  setInterval(() => {
    if (!cfg.on) return;
    const to = ducking() ? 0.3 : 1; duck += (to - duck) * 0.4; if (Math.abs(duck - to) < 0.02) duck = to;
    applyVol(); muteMusic(true);
  }, 250);

  if (cfg.on) { draw(); const resume = () => { removeEventListener('pointerdown', resume, true); if (cfg.on) set(true); }; addEventListener('pointerdown', resume, true); muteMusic(true); }
  else draw();
  return { open, close, set, get on() { return cfg.on; } };
}
