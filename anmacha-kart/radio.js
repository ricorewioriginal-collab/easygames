/* Kart-Radio: die 13 RicoReWi-Sender (laut.fm) statt der Rennmusik.
   Jeder Sender hat einen Namen im Spiel; angezeigt werden dazu Originalname, Logo und der aktuelle Titel mit Interpret.
   Nur ein <audio>-Element und ein Abruf alle 15 s – keine Last für die Render-Schleife. */
const RADIO = (() => {
  const ST = [
    ['ricorewi', 'Rush FM', 'RicoReWi Music & Media'], ['yourtime-fm', 'Zielgerade 101', 'YourTime-FM'], ['rapradio24', 'Drift Beats', 'RapRadio 24'],
    ['schlagerpop24', 'Kurvenschlager', 'SchlagerPop 24'], ['chartradio24', 'Podium Hits', 'ChartRadio 24'], ['clubradio24', 'Nitro Club', 'ClubRadio 24'],
    ['anmacha24', 'Weltentour Radio', 'AnMaCha 24'], ['radiofloh', 'Flohzirkus Funk', 'RadioFloh!'], ['rockradio24', 'Vollgas Rock', 'RockRadio 24'],
    ['christmasradio24', 'Schneeketten-Radio', 'ChristmasRadio 24'], ['kultradio24', 'Oldtimer-Welle', 'KultRadio 24'], ['zockerfm', 'Pixel-Piste FM', 'Zocker-FM'],
    ['special-radio', 'Joker-Kanal', 'Special-Radio']
  ].map((s, i) => ({ id: s[0], game: s[1], name: s[2], logo: 'logos/' + String(i + 1).padStart(2, '0') + '.png' }));
  const KEY = 'akRadio';
  let cfg = { on: false, i: 0, vol: 0.7 };
  try { Object.assign(cfg, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
  cfg.i = ((cfg.i | 0) % ST.length + ST.length) % ST.length;
  const keep = () => { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) {} };
  let au = null, song = null, tm = 0, pill = null, hideT = 0, subs = [];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const cur = () => ST[cfg.i];
  function ui() {
    if (pill) return pill;
    const st = document.createElement('style');
    st.textContent = '#radioNow{position:fixed;z-index:6;left:50%;top:calc(58px + env(safe-area-inset-top,0px));transform:translate(-50%,-8px);display:flex;align-items:center;gap:9px;max-width:min(460px,calc(100% - 24px));padding:5px 14px 5px 5px;border-radius:999px;background:rgba(12,14,30,.86);border:2px solid rgba(255,212,90,.7);box-shadow:0 6px 18px rgba(0,0,0,.4);color:#fff;font:600 12.5px/1.25 Inter,system-ui,sans-serif;opacity:0;pointer-events:none;transition:opacity .25s,transform .25s}'
      + '#radioNow.on{opacity:1;transform:translate(-50%,0)}#radioNow img{width:34px;height:34px;border-radius:50%;object-fit:cover;flex:none;background:#fff}#radioNow .t{min-width:0;overflow:hidden}#radioNow b{display:block;color:#ffd45a;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
      + '#radioNow small{opacity:.7;font-weight:600}#radioNow .s{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}body:not(.racing) #radioNow{top:calc(10px + env(safe-area-inset-top,0px))}@media (orientation:portrait){body.touch.racing #radioNow{top:calc(132px + env(safe-area-inset-top,0px));max-width:calc(100% - 84px);left:calc(50% - 30px)}}';
    document.head.appendChild(st);
    pill = document.createElement('div'); pill.id = 'radioNow'; pill.setAttribute('role', 'status'); pill.setAttribute('aria-live', 'polite'); document.body.appendChild(pill); return pill;
  }
  // Anzeige: kurz einblenden bei Senderwechsel/neuem Titel
  function show(sec) {
    const p = ui(), s = cur();
    p.innerHTML = `<img alt="" src="${s.logo}"><span class="t"><b>📻 ${esc(s.game)} <small>· ${esc(s.name)}</small></b><span class="s">${cfg.on ? (song ? '♪ ' + esc(song.t) + (song.a ? ' – ' + esc(song.a) : '') : 'Verbinde …') : 'Radio aus – Rennmusik'}</span></span>`;
    p.classList.add('on'); clearTimeout(hideT); hideT = setTimeout(() => p.classList.remove('on'), (sec || 4) * 1000);
    subs.forEach(f => { try { f(); } catch (e) {} });
  }
  async function poll() {
    clearTimeout(tm); if (!cfg.on) return; const id = cur().id;
    try { const r = await fetch('https://api.laut.fm/station/' + id + '/current_song', { cache: 'no-store' }), j = await r.json(); if (id === cur().id && j && j.title) { const n = { t: j.title, a: (j.artist && j.artist.name) || '' }; if (!song || n.t !== song.t) { song = n; show(4); } } } catch (e) {}
    tm = setTimeout(poll, 15000);
  }
  function play() {
    if (!au) { au = new Audio(); au.preload = 'none'; au.addEventListener('error', () => { if (cfg.on) setTimeout(() => cfg.on && play(), 4000); }); }
    au.volume = cfg.vol; au.muted = !!(window.AUD && AUD.muted); au.src = 'https://stream.laut.fm/' + cur().id + '?t=' + Date.now(); const pr = au.play(); if (pr && pr.catch) pr.catch(() => {});
  }
  function apply() {
    if (window.AUD && AUD.radio) AUD.radio(cfg.on);
    if (cfg.on) { song = null; play(); poll(); } else { clearTimeout(tm); song = null; if (au) { au.pause(); au.removeAttribute('src'); au.load(); } }
    keep(); show(cfg.on ? 5 : 2.5);
  }
  const R = {
    list: ST, get on() { return cfg.on; }, get idx() { return cfg.i; }, get song() { return song; }, get cur() { return cur(); },
    set(i) { cfg.i = ((i | 0) % ST.length + ST.length) % ST.length; cfg.on = true; apply(); },
    step(d) { if (!cfg.on) { cfg.on = true; apply(); return; } R.set(cfg.i + (d || 1)); },
    toggle(on) { cfg.on = on == null ? !cfg.on : !!on; apply(); },
    mute(m) { if (au) au.muted = !!m; },
    show, onChange(f) { subs.push(f); },
    // Beim Start gemerkter Zustand: Musik erst nach einer Nutzeraktion möglich (Autoplay-Sperre)
    resume() { if (cfg.on && (!au || au.paused)) apply(); }
  };
  return R;
})();
