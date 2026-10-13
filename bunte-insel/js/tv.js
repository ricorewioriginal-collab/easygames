'use strict';
/* Bunte Insel – Fernseher-Modus: das Spiel läuft auf dem Fernseher/Computer, Handys und Tablets sind die Controller (controller.html).
   Verbindung direkt per WebRTC (PeerJS) mit 4-stelligem Code oder QR-Code. Bis zu 4 Spieler:
   Spieler 1 steuert die Hauptfigur (alles: Fahrzeuge, Aktionen, Menüs per Zeiger), Spieler 2–4 sind Mitspieler-Figuren (laufen, springen, winken, tanzen).
   Optional Splitscreen: jeder Spieler bekommt sein eigenes Bild (2 = nebeneinander, 3–4 = geviertelt). Der Controller zeigt nur das Nötigste. */
BI.createTv = function (G) {
  const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', PRE = 'bitv-', COL = ['#ffb400', '#4da3ff', '#ff7ab8', '#3fd07a'], COLN = ['Gelb', 'Blau', 'Rosa', 'Grün'];
  const T = { on: false, code: '', open: false, split: false, ptrOn: false, tv: false }, slots = [null, null, null, null], $ = id => document.getElementById(id);
  const { P, inp, cam, W, scene, camera, renderer, A, fx } = G, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), pi = Math.PI;
  let peer = null, hudT = 0, ptr = { x: innerWidth / 2, y: innerHeight / 2, sx: 0, sy: 0 }, camHoldT = 0, qrOk = false;
  const el = (tag, css, html) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (html != null) e.innerHTML = html; return e; };

  /* ---------- Oberfläche auf dem Fernseher ---------- */
  const st = el('style', null, `
  body.tv #keys,body.tv .abtn,body.tv #joy,body.tv #bMore,body.tv #bFun,body.tv #bTools{display:none!important}
  #tvPanel{position:fixed;inset:0;z-index:99990;display:flex;overflow:auto;background:radial-gradient(120% 120% at 50% 0%,rgba(40,50,120,.92),rgba(10,12,34,.96));color:#fff;font-family:Fredoka,system-ui,sans-serif}
  #tvPanel[hidden]{display:none}
  #tvPanel .box{margin:auto;display:grid;grid-template-columns:auto 1fr;gap:clamp(18px,4vw,56px);align-items:center;max-width:min(1100px,94vw);padding:clamp(16px,3vw,40px)}
  #tvPanel h1{margin:0 0 8px;font-size:clamp(28px,5vw,56px)}#tvPanel p{margin:6px 0;font-size:clamp(15px,2.2vw,26px);color:#c9cff5}
  #tvQr{background:#fff;border-radius:24px;padding:14px;width:clamp(180px,30vw,340px);aspect-ratio:1;display:flex;align-items:center;justify-content:center}#tvQr img{width:100%;height:100%;image-rendering:pixelated}
  #tvLink{text-decoration:none;cursor:pointer;display:inline-block;max-width:100%;word-break:break-all;background:rgba(255,255,255,.14);border:2px dashed rgba(255,255,255,.55);border-radius:14px;padding:8px 16px;font-weight:800;font-size:clamp(16px,2.6vw,32px);color:#ffe27a;margin:2px 0 8px}#tvLink:focus-visible{outline:4px solid #fff}
  #tvStat{font-weight:700;font-size:clamp(14px,2vw,22px);margin:2px 0 6px;padding:4px 12px;border-radius:12px;display:inline-block;background:rgba(255,255,255,.1)}#tvStat.ok{color:#7dffb0}#tvStat.wait{color:#ffe27a}#tvStat.err{color:#ff9a9a}
  #tvCode{font-size:clamp(44px,9vw,110px);font-weight:800;letter-spacing:.12em;line-height:1;margin:6px 0 10px}
  #tvPl{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0}
  .tvp{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:16px;background:rgba(255,255,255,.09);border:2px solid transparent;font-size:clamp(14px,2vw,22px)}
  .tvp i{width:16px;height:16px;border-radius:50%;flex:none}.tvp.on{border-color:currentColor;background:rgba(255,255,255,.16)}.tvp em{opacity:.6;font-style:normal}
  .tvb{font:inherit;font-weight:700;color:#fff;border:0;border-radius:18px;padding:12px 24px;font-size:clamp(16px,2.2vw,24px);background:linear-gradient(180deg,#5ab8ff,#2b7fe0);box-shadow:0 5px 0 #1a56a8;margin:6px 10px 0 0;cursor:pointer}
  .tvb.g{background:linear-gradient(180deg,#58e08f,#2aa35a);box-shadow:0 5px 0 #1b7a42}.tvb:focus-visible{outline:4px solid #fff}
  @media (max-width:760px){#tvPanel .box{grid-template-columns:1fr;justify-items:center;text-align:center}}
  #tvChip{position:fixed;left:12px;bottom:12px;z-index:9990;display:flex;gap:8px;align-items:center;padding:6px 14px;border-radius:999px;background:rgba(15,18,38,.72);color:#fff;font:700 15px Fredoka,system-ui,sans-serif;border:1px solid rgba(255,255,255,.25);cursor:pointer}
  #tvChip[hidden]{display:none}
  #tvPtr{position:fixed;left:0;top:0;z-index:99995;width:34px;height:34px;pointer-events:none;filter:drop-shadow(0 3px 4px rgba(0,0,0,.5));display:none}
  #tvSplit{position:fixed;inset:0;z-index:9980;pointer-events:none}#tvSplit[hidden]{display:none}
  #tvSplit .ln{position:absolute;background:#0b0d22}#tvSplit .tag{position:absolute;padding:4px 12px;border-radius:999px;font:800 clamp(12px,1.6vw,18px) Fredoka,system-ui,sans-serif;color:#10142e;box-shadow:0 2px 8px rgba(0,0,0,.4)}
  #tvSplit .emp{position:absolute;display:flex;align-items:center;justify-content:center;background:#10142e;color:#c9cff5;font:700 clamp(14px,2vw,24px) Fredoka,system-ui,sans-serif;text-align:center}`);
  document.head.appendChild(st);
  const panel = el('div'); panel.id = 'tvPanel'; panel.hidden = true;
  panel.innerHTML = '<div class="box"><div id="tvQr">…</div><div><h1>📺 Spiel am Fernseher</h1><p>1️⃣ Öffne <b>auf dem Handy</b> diesen Link:</p><a id="tvLink" target="_blank" rel="noopener"></a><p>2️⃣ Tippe dort diesen <b>Code</b> ein – oder scanne den QR-Code:</p><div id="tvCode">----</div><div id="tvStat" class="wait">…</div><div id="tvPl"></div><p id="tvMsg">Bis zu 4 Spieler. Spieler 1 steuert alles, die anderen laufen mit. 🎮 Oder einfach einen Controller (Xbox, PlayStation, Switch) am Fernseher anschließen und eine Taste drücken – wird automatisch erkannt.</p><button class="tvb g" id="tvOk">▶ OK – los geht’s</button><button class="tvb g" id="tvRetry" hidden>🔄 Nochmal verbinden</button><button class="tvb" id="tvSplitB">🪟 Splitscreen: aus</button><button class="tvb" id="tvOff">✖ TV-Modus beenden</button></div></div>';
  document.body.appendChild(panel);
  const chip = el('div'); chip.id = 'tvChip'; chip.hidden = true; chip.tabIndex = 0; document.body.appendChild(chip);
  const ptrEl = el('div'); ptrEl.id = 'tvPtr'; ptrEl.innerHTML = '<svg viewBox="0 0 24 24" width="34" height="34"><path d="M4 2l16 9-7 2-3 7z" fill="#fff" stroke="#10142e" stroke-width="1.6" stroke-linejoin="round"/></svg>'; document.body.appendChild(ptrEl);
  const splitEl = el('div'); splitEl.id = 'tvSplit'; splitEl.hidden = true; document.body.appendChild(splitEl);

  function players() { return slots.filter(Boolean); }
  function setStat(k, t) { const e = $('tvStat'); if (!e) return; T.stat = k === 'ok' ? '' : k; e.className = k; e.textContent = t; }
  const sleep = ms => new Promise(r => setTimeout(r, ms)), withTimeout = (pr, ms, err) => Promise.race([pr, new Promise((_, rej) => setTimeout(() => rej(new Error(err)), ms))]);
  function newPeer(id) { return new Promise((res, rej) => { let done = false, q = null; const to = setTimeout(() => { if (done) return; done = true; try { q && q.destroy(); } catch (e) { } rej(Object.assign(new Error('timeout'), { type: 'timeout' })); }, 9000); try { q = new Peer(id); } catch (e) { clearTimeout(to); rej(e); return; } q.on('open', () => { if (done) return; done = true; clearTimeout(to); res(q); }); q.on('error', e => { if (done) return; done = true; clearTimeout(to); try { q.destroy(); } catch (x) { } rej(e || new Error('err')); }); }); }
  function renderPanel() {
    $('tvCode').textContent = T.code || '----'; { const l = $('tvLink'), u = new URL('controller.html' + (T.code ? '?c=' + T.code : ''), location.href); l.textContent = location.host + location.pathname.replace(/[^/]*$/, '') + 'controller.html'; l.href = u.href; } if (T.on && !T.stat) setStat('ok', players().some(s => !s.away) ? '🟢 ' + players().filter(s => !s.away).length + ' Handy verbunden' : '🟢 Bereit – warte auf das Handy');
    const pl = $('tvPl'); pl.innerHTML = ''; for (let i = 0; i < 4; i++) { const s = slots[i], d = el('div', 'color:' + COL[i]); d.className = 'tvp' + (s ? ' on' : ''); d.innerHTML = '<i style="background:' + COL[i] + '"></i><span style="color:#fff">' + (s ? s.name : '<em>wartet …</em>') + '</span>'; pl.appendChild(d); }
    $('tvSplitB').textContent = '🪟 Splitscreen: ' + (T.split ? 'an' : 'aus'); chip.textContent = '📺 ' + T.code + ' · ' + players().length + ' Spieler';
  }
  function openPanel(on) { const was = T.open; T.open = on; panel.hidden = !on; if (on) { renderPanel(); try { $('tvOk').focus({ preventScroll: true }); } catch (e) { } } else if (was && G.state() === 'menu') { const m = document.getElementById('bStart'); try { m && m.offsetParent && m.focus({ preventScroll: true }); } catch (e) { } } }
  $('tvOk').onclick = () => { A.resume && A.resume(); openPanel(false); };
  $('tvSplitB').onclick = () => { setSplit(!T.split); };
  $('tvOff').onclick = () => { T.stop(); };
  chip.onclick = () => openPanel(!T.open);
  chip.addEventListener('keydown', e => { if (e.key === 'Enter') openPanel(!T.open); });
  /* Fernbedienung/Tastatur im Fenster: Pfeiltasten wählen Link und Knöpfe, OK/Enter drückt (vorher wanderte der Fokus ins Menü dahinter) */
  const panelBtns = () => [...panel.querySelectorAll('#tvLink,.tvb')].filter(b => !b.hidden && b.offsetParent);
  T.panelNav = d => { const l = panelBtns(); if (!l.length) return; const i = l.indexOf(document.activeElement); l[i < 0 ? 0 : (i + d + l.length) % l.length].focus({ preventScroll: false }); };
  T.panelPress = () => { const f = document.activeElement; if (f && panel.contains(f)) f.click(); else { const l = panelBtns(); if (l[0]) l[0].focus(); } };
  panel.addEventListener('keydown', e => {
    const d = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.code || e.key]; if (!d) return; const l = panelBtns(); if (!l.length) return;
    const i = l.indexOf(document.activeElement); l[i < 0 ? 0 : (i + d + l.length) % l.length].focus({ preventScroll: false }); e.preventDefault(); e.stopPropagation();
  });

  /* ---------- Verbindung ---------- */
  const lib = (src, ok) => new Promise((res, rej) => { if (ok()) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('lib')); document.head.appendChild(s); });
  const send = (s, d) => { if (s && s.conn && s.conn.open) { try { s.conn.send(d); } catch (e) { } } };
  const modeOf = () => G.state() === 'menu' ? 'title' : 'play';
  function welcome(s) { send(s, { t: 'w', slot: s.i, name: s.name, color: COL[s.i], split: T.split, m: s.i === 0 ? (modeOf() === 'title' && !T.ptrOn ? 'title' : T.menuMode ? 'menu' : 'play') : 'play' }); }
  /* Controller kommt dazu (oder kommt zurück): Der Controller schickt beim „hi“ eine feste Kennung (cid). Gleiche Kennung = gleicher Spieler, alter Platz wird wieder übernommen (Reconnect). */
  function addConn(conn) {
    let bound = null, tm = 0;
    const bind = cid => {
      if (bound) return; clearTimeout(tm);
      let s = cid ? slots.find(q => q && q.cid === cid) : null;
      if (s) { const old = s.conn; s.conn = conn; s.id = conn.peer; s.away = 0; s.rx = Date.now(); bound = s; try { if (old && old !== conn) old.close(); } catch (e) { } welcome(s); setStat('ok', ''); T.stat = ''; renderPanel(); G.say('📱 ' + s.name + ' ist wieder da!', 2000); A.pop && A.pop(); return; }
      let i = slots.findIndex(q => !q); if (i < 0) { try { conn.send({ t: 'full' }); } catch (e) { } setTimeout(() => { try { conn.close(); } catch (e) { } }, 300); bound = {}; return; }
      s = slots[i] = { i, conn, id: conn.peer, cid: cid || '', rx: Date.now(), away: 0, name: i === 0 ? G.heroName() : 'Spieler ' + (i + 1), stick: [0, 0], held: {}, jump: false, act: false, wave: 0, dance: false, mate: null, ct: 0 }; bound = s;
      if (i > 0) spawnMate(s);
      welcome(s); T.stat = ''; renderPanel(); chip.hidden = false; G.say('📱 ' + s.name + ' ist dabei!', 2200); A.pop && A.pop();
      if (T.split && players().length < 2) setSplit(false);
    };
    conn.on('open', () => { tm = setTimeout(() => bind(''), 2500); /* ältere Controller ohne Kennung */ });
    conn.on('data', d => { if (d && d.t === 'hi' && !bound) bind(String(d.cid || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 24)); const s = bound && bound.conn === conn ? bound : null; if (s) s.rx = Date.now(); onData(conn.peer, d); });
    const gone = () => { clearTimeout(tm); const s = slots.find(q => q && q.conn === conn); if (s) away(s); };
    conn.on('close', gone); conn.on('error', gone);
  }
  /* Verbindung weg: Platz bleibt 30 s reserviert (Figur bleibt stehen), Controller kann sich wieder verbinden */
  function away(s) {
    if (s.away) return; s.away = Date.now(); s.conn = null; s.stick = [0, 0]; s.held = {}; if (s.i === 0) { G.setStick(0, 0); releaseP1(); }
    G.say('📡 ' + s.name + ': Verbindung weg – wartet auf Rückkehr …', 2600); renderPanel();
  }
  setInterval(() => { /* Herzschlag: Ping an alle Controller; wer 10 s schweigt ist weg; nach 30 s Abwesenheit wird der Platz frei */
    if (!T.on) return; const now = Date.now();
    for (const s of slots) { if (!s) continue; if (s.away) { if (now - s.away > 30000) dropSlot(s, true); continue; } send(s, { t: 'p' }); if (now - s.rx > 10000) { try { s.conn && s.conn.close(); } catch (e) { } away(s); } }
    if (peer && peer.disconnected && !peer.destroyed) { setStat('wait', '🟡 Vermittler weg – verbinde neu …'); try { peer.reconnect(); } catch (e) { } }
  }, 2500);
  function dropSlot(s, say) {
    slots[s.i] = null; if (s.i === 0) { G.setStick(0, 0); releaseP1(); }
    if (s.mate) { s.mate.veh = null; scene.remove(s.mate.char.group); s.mate.char.dispose && s.mate.char.dispose(); }
    if (say) G.say('📱 ' + s.name + ' ist weg', 2000); renderPanel(); if (players().length < 2) { T.split = false; layout(); }
  }
  /* Fernseher-Modus starten: Panel (Link + Code + QR + Status) steht sofort da, Verbindung zum Vermittler mit Zeitgrenzen und Wiederholungen */
  T.start = async function () {
    if (T.on) { openPanel(true); return T.code; }
    if (T.busy) { openPanel(true); return null; }
    T.busy = true; $('tvRetry').hidden = true; $('tvCode').textContent = '----'; chip.hidden = false; openPanel(true); renderPanel(); setStat('wait', '🟡 Verbinde mit dem Vermittler …');
    try {
      await withTimeout(lib('https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.4/peerjs.min.js', () => !!window.Peer), 12000, 'lib');
      let code = '', p = null, last = null;
      for (let k = 0; k < 7 && !p; k++) {
        let sv = ''; try { sv = k === 0 ? (localStorage.getItem('bi-tv-mycode') || '') : ''; } catch (e) { } code = /^[A-Z2-9]{4}$/.test(sv) ? sv : ''; if (!code) for (let j = 0; j < 4; j++) code += ALPHA[(Math.random() * ALPHA.length) | 0]; /* gleicher Fernseher = gleicher Code */
        try { p = await newPeer(PRE + code); } catch (e) { last = e; if (!(e && e.type === 'unavailable-id')) { if (k >= 3) break; await sleep(900); } }
      }
      if (!p) throw last || new Error('code');
      peer = p; T.code = code; T.on = true; T.busy = false; T.stat = ''; try { localStorage.setItem('bi-tv-mycode', code); } catch (e) { }
      p.on('connection', addConn);
      p.on('disconnected', () => { if (peer !== p) return; setStat('wait', '🟡 Vermittler weg – verbinde neu …'); setTimeout(() => { try { if (peer === p && !p.destroyed) p.reconnect(); } catch (e) { } }, 800); });
      p.on('open', () => { if (peer === p) { T.stat = ''; renderPanel(); } });
      p.on('error', e => { if (peer !== p) return; if (e && (e.type === 'network' || e.type === 'server-error' || e.type === 'socket-error' || e.type === 'socket-closed')) { setStat('wait', '🟡 Verbindung wackelt – versuche neu …'); setTimeout(() => { try { if (peer === p && !p.destroyed) p.reconnect(); } catch (x) { } }, 1500); } });
      p.on('close', () => { if (peer !== p || !T.on) return; /* Vermittler hat uns verloren: gleichen Code neu belegen */ peer = null; T.on = false; setStat('wait', '🟡 Verbinde neu …'); T.start().catch(() => { }); });
      document.body.classList.add('tv'); chip.hidden = false; openPanel(true); renderPanel(); setStat('ok', '🟢 Bereit – warte auf das Handy');
      const u = new URL('controller.html?c=' + code, location.href).href;
      lib('https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js', () => !!window.qrcode).then(() => { const q = qrcode(0, 'M'); q.addData(u); q.make(); $('tvQr').innerHTML = '<img alt="QR-Code zum Controller" src="' + q.createDataURL(8, 0) + '">'; qrOk = true; }).catch(() => { $('tvQr').textContent = code; });
      return code;
    } catch (e) {
      T.busy = false; T.on = false; setStat('err', '🔴 Keine Verbindung zum Vermittler (Internet nötig).'); $('tvRetry').hidden = false; $('tvMsg').textContent = 'Prüfe das WLAN und tippe auf „Nochmal verbinden“.'; openPanel(true); chip.hidden = false; $('tvCode').textContent = '----'; $('tvQr').textContent = '📺'; return null;
    }
  };
  $('tvRetry').onclick = () => { T.start().catch(() => { }); };
  T.stop = function () {
    for (const s of slots) if (s) { send(s, { t: 'bye' }); dropSlot(s, false); }
    { const q = peer; peer = null; T.on = false; try { q && q.destroy(); } catch (e) { } } T.code = ''; T.split = false; T.ptrOn = false; layout(); openPanel(false); chip.hidden = true; ptrEl.style.display = 'none'; document.body.classList.remove('tv');
  };

  /* ---------- Eingaben ---------- */
  function releaseP1() { inp.horn = inp.turbo = inp.up = inp.down = false; if (G.dragHold) G.dragHold(false); }
  const keyEv = code => window.dispatchEvent(new KeyboardEvent('keydown', { code, key: code, bubbles: true }));
  function clickAt(x, y) {
    const e = document.elementFromPoint(x, y); if (!e) return; const o = { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 7, pointerType: 'mouse', isPrimary: true, button: 0, view: window };
    for (const ty of ['pointerover', 'pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) { try { e.dispatchEvent(ty.startsWith('pointer') ? new PointerEvent(ty, o) : new MouseEvent(ty, o)); } catch (x2) { } }
    try { e.focus && e.focus({ preventScroll: true }); } catch (x3) { }
  }
  function closeTopPanel() {
    if (T.open) { openPanel(false); return; }
    keyEv('Escape');
    setTimeout(() => { if (!T.menuMode) return; for (const b of document.querySelectorAll('.screen:not([hidden]) button, #funBar button, [class*=panel]:not([hidden]) button')) if (b.offsetParent && /^\W*(fertig|schlie(ß|ss)en|zurück|ok|los geht.s)\W*$/i.test(b.textContent.trim())) { b.click(); break; } }, 160);
  }
  function onData(id, d) {
    const s = slots.find(q => q && q.id === id); if (!s || !d || typeof d !== 'object') return;
    if (d.t === 'hi') { const n = String(d.name || '').replace(/[<>&]/g, '').trim().slice(0, 10); if (n && s.i > 0) { s.name = n; if (s.mate) s.mate.char.setName && s.mate.char.setName(n); renderPanel(); } welcome(s); }
    else if (d.t === 's') { const x = clamp(+d.x || 0, -1, 1), y = clamp(+d.y || 0, -1, 1); s.stick = [x, y]; if (s.i === 0 && !T.menuMode) G.setStick(x, y); }
    else if (d.t === 'c') {
      const dx = clamp(+d.dx || 0, -90, 90), dy = clamp(+d.dy || 0, -90, 90);
      if (s.i === 0) { if (T.menuMode) { scrollAt(dy); } else { cam.yaw -= dx * .006; cam.pitch = clamp(cam.pitch + dy * .004, .12, 1.3); cam.idle = 0; if (cam.ego && P.veh) cam.egoOff = clamp(cam.egoOff - dx * .006, -1.7, 1.7); camHoldT = .5; if (G.dragHold) G.dragHold(true); } }
      else if (s.mate) { s.mate.yaw -= dx * .006; s.mate.pitch = clamp(s.mate.pitch + dy * .004, .1, 1.2); s.mate.camIdle = 0; }
    }
    else if (d.t === 'b') onBtn(s, d.k, !!d.d);
    else if (d.t === 'k') onCmd(s, d.k);
  }
  function onBtn(s, k, down) {
    A.resume && A.resume();
    if (s.i > 0) { if (down) { if (k === 'B') s.jump = true; else if (k === 'A') mateAction(s); else if (k === 'H') { if (s.mate && s.mate.veh) honk(); else s.dance = !s.dance; } else if (k === 'X') s.wave = 1.4; } s.held[k] = down; return; }
    if (T.menuMode) {
      if (!down) return; if (k === 'A') clickAt(ptr.x, ptr.y); else if (k === 'B') closeTopPanel(); return;
    }
    if (k === 'A') { if (down) inp.act = true; }
    else if (k === 'B') { if (down) { if (P.veh) inp.turbo = true; inp.up = true; if (!P.veh) inp.jump = true; } else { inp.turbo = false; inp.up = false; } }
    else if (k === 'H') { if (down) { inp.horn = true; inp.hornEdge = true; } else inp.horn = false; }
    else if (k === 'X') { if (down) { inp.aux = true; inp.down = true; } else inp.down = false; }
  }
  function setSplit(on) { if (on && players().length < 2) { G.say('🪟 Splitscreen braucht mindestens 2 Handys', 2400); on = false; } T.split = on; layout(); renderPanel(); for (const s of slots) if (s) welcome(s); }
  function onCmd(s, k) {
    if (k === 'start') { if (G.state() === 'menu') G.startGame(); return; }
    if (k === 'split') { setSplit(!T.split); return; }
    if (k === 'leave') { dropSlot(s, true); return; }
    if (s.i > 0) return;
    if (k === 'ptr') { T.ptrOn = !T.ptrOn; return; }
    const click = id => { const b = $(id); if (b) b.click(); };
    if (k === 'fun') click('bFun'); else if (k === 'wohin') click('bGuide'); else if (k === 'pack') click('bPack'); else if (k === 'log') click('bLog'); else if (k === 'cam') click('bCam'); else if (k === 'pause') click('bPause');
  }
  function scrollAt(dy) { let e = document.elementFromPoint(ptr.x, ptr.y); while (e && e !== document.body) { if (e.scrollHeight > e.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(e).overflowY)) { e.scrollTop -= dy * 1.6; return; } e = e.parentElement; } }

  /* ---------- Mitspieler-Figuren (Spieler 2–4) ---------- */
  /* Mitfahren: Spieler 2–4 steigen beim Fahrer (Spieler 1) ein und sitzen auf dem Platz – gefahren wird nur vom Fahrer, alle bewegen sich gemeinsam */
  function boardable(s) { const v = P.veh, m = s.mate; if (!v || !m || m.veh || (v.spec && v.spec.remote)) return null; const d = Math.hypot(m.x - v.x, m.z - v.z) - (v.interactReach || v.r || 1); return d < 4.2 && Math.abs(m.y - (v.y || 0)) < 3 ? v : null; }
  function mateAction(s) {
    const m = s.mate; if (!m) return; if (m.veh) { leaveVeh(s); return; } const v = boardable(s);
    if (v) { m.veh = v; s.dance = false; m.pitch = .42; m.camIdle = 9; A.enter && A.enter(); G.say('🚗 ' + s.name + ' fährt mit!', 2200); } else { s.wave = 1.4; A.hello && A.hello(); }
  }
  function leaveVeh(s) {
    const m = s.mate, v = m && m.veh; if (!m) return; m.veh = null; m.char.group.visible = true; m.char.group.rotation.set(0, m.h, 0);
    if (v) { const lx = -Math.cos(v.h), lz = Math.sin(v.h), rad = (v.r || 1) + 1.3 + s.i * .5, q = W.resolve(v.x + lx * rad, v.z + lz * rad, .5, {}); m.x = q.x; m.z = q.z; m.h = v.h; m.y = G.groundAt(m.x, m.z, v.y || 0); }
    m.vy = 0; m.cx = m.cz = 0; A.leave && A.leave();
  }
  let honkT = 0; function honk() { const n = performance.now(); if (n - honkT < 500) return; honkT = n; A.horn && A.horn('car', true); setTimeout(() => A.horn && A.horn('car', false), 380); }
  function seatMate(s, v) {
    const m = s.mate, g = m.char.group; let k = 0; for (const o of slots) if (o && o.i > 0 && o.mate && o.mate.veh === v && o.i < s.i) k++;
    m.x = v.x; m.z = v.z; m.h = v.h; m.y = v.y || 0; m.spd = 0; m.vy = 0; const sd = v.seat;
    if (v.spec.open && sd) { const wide = v.r > 1, lx = wide ? (k % 2 ? -.6 : .6) : (k % 2 ? .35 : -.35) * (k > 0 ? 1 : 0), lz = wide ? sd[2] - .2 - (k >> 1) * .7 : sd[2] - .7 - k * .55, sn = Math.sin(v.h), cs = Math.cos(v.h);
      g.visible = true; g.position.set(v.x + sn * lz + cs * lx, (v.y || 0) + (v.tilt ? v.tilt.position.y : 0) + sd[1] - .42, v.z + cs * lz - sn * lx); g.rotation.set(0, v.h, 0); m.char.sit && m.char.sit(); } else g.visible = false;
    if (m.camIdle > 1.6) m.yaw += BI.angDiff(m.yaw, v.h + pi) * Math.min(1, T.dt * (Math.abs(v.v) > .5 ? 3.2 : 1.2));
  }
  function spawnMate(s) {
    const ch = G.makeMate(s.i, s.name), a = s.i * 2.1 + .6;
    s.mate = { char: ch, x: P.x + Math.sin(a) * 2.4, z: P.z + Math.cos(a) * 2.4, y: P.y, vy: 0, h: P.h, phase: 0, spd: 0, yaw: P.h + pi, pitch: .38, camIdle: 9, cx: 0, cy: 0, cz: 0, cam: new THREE.PerspectiveCamera(58, 1, camera.near, camera.far), run: false };
    s.mate.cam.position.set(s.mate.x, 6, s.mate.z + 8);
  }
  function stepMate(s, dt, t) {
    const m = s.mate; if (!m) return; m.camIdle += dt; if (m.veh) { if (P.veh !== m.veh) leaveVeh(s); else { seatMate(s, m.veh); return; } }
    const [sx, sy] = s.stick, l = Math.hypot(sx, sy);
    const run = l > .92, spd = run ? 8.8 : 4.6; let dx = 0, dz = 0;
    if (l > .12) { const fx_ = -Math.sin(m.yaw), fz_ = -Math.cos(m.yaw), rx = -fz_, rz = fx_; dx = fx_ * sy + rx * sx; dz = fz_ * sy + rz * sx; const n = Math.hypot(dx, dz) || 1, k = Math.min(1, l); m.h += BI.angDiff(m.h, Math.atan2(dx, dz)) * Math.min(1, dt * 14); dx = dx / n * spd * k; dz = dz / n * spd * k; s.dance = false; if (m.camIdle > 1.6) m.yaw += BI.angDiff(m.yaw, m.h + pi) * Math.min(1, dt * 1.3); }
    m.x += dx * dt; m.z += dz * dt; m.spd = Math.hypot(dx, dz); m.run = run && m.spd > 1;
    const q = W.resolve(m.x, m.z, .45, {}, m.y > .8 ? m.y : undefined, false, true); m.x = q.x; m.z = q.z;
    const gy = G.groundAt(m.x, m.z, m.y);
    if (m.y <= gy + .05) m.coy = .12; else if (m.coy > 0) m.coy -= dt;
    if (s.jump) { s.jump = false; if (m.coy > 0) { m.vy = 7; m.coy = 0; A.jump && A.jump(); } }
    m.vy = Math.max(m.vy - 20 * dt, -14); m.y += m.vy * dt; if (m.y < gy) { m.y = gy; m.vy = 0; }
    m.phase += dt * (6 + m.spd * 1.2); if (s.wave > 0) s.wave -= dt;
    const g = m.char.group; g.position.set(m.x, m.y, m.z); g.rotation.y = m.h; g.rotation.x = m.run && m.y < .1 ? .14 : 0;
    if (s.dance && m.spd < .3) { m.char.dance(t + s.i, s.i % 3); g.position.y += Math.abs(Math.sin((t + s.i) * 8)) * .12; } else m.char.pose(m.spd > .3 ? m.phase : t * 1.2 + s.i, m.spd > .3 ? .7 : 0, s.wave > 0);
    const lim = T.split ? 110 : 38, dd = Math.hypot(m.x - P.x, m.z - P.z);
    if (dd > lim) { const a = s.i * 2.1 + .6; m.x = P.x + Math.sin(a) * 2.6; m.z = P.z + Math.cos(a) * 2.6; m.y = P.y; m.vy = 0; fx.burst(m.x, 1, m.z, 8, [BI.C.gold, BI.C.white], 2, .8, 28, 1); }
  }
  function mateCam(s, dt, aspect) {
    const m = s.mate, c = m.cam, v = m.veh, tx = v ? v.x : m.x, ty = (v ? v.y || 0 : m.y) + 1.3, tz = v ? v.z : m.z, d = v ? (v.spec.cam || 9) : 7.2, cp = Math.cos(m.pitch);
    const gx = tx + Math.sin(m.yaw) * cp * d, gy = ty + Math.sin(m.pitch) * d, gz = tz + Math.cos(m.yaw) * cp * d;
    if (!m.cx && !m.cz) { m.cx = gx; m.cy = gy; m.cz = gz; }
    m.cx = BI.damp(m.cx, gx, 14, dt); m.cy = BI.damp(m.cy, gy, 14, dt); m.cz = BI.damp(m.cz, gz, 14, dt);
    c.position.set(m.cx, Math.max(.8, m.cy), m.cz); c.lookAt(tx, ty + .4, tz); c.aspect = aspect; c.fov = aspect < .8 ? 74 : aspect < 1.2 ? 66 : 58; c.near = camera.near; c.far = camera.far; c.updateProjectionMatrix();
  }

  /* ---------- Splitscreen ---------- */
  let views = [];
  function layout() {
    splitEl.innerHTML = ''; views = [];
    const act = players(); if (!T.split || act.length < 2) { splitEl.hidden = true; document.body.classList.remove('tvsplit'); return; }
    const n = act.length, rects = n === 2 ? [[0, 0, .5, 1], [.5, 0, .5, 1]] : [[0, 0, .5, .5], [.5, 0, .5, .5], [0, .5, .5, .5], [.5, .5, .5, .5]];
    act.forEach((s, k) => { views.push({ s, r: rects[k] }); });
    splitEl.hidden = false; document.body.classList.add('tvsplit');
    const add = (css) => { const e = el('div', css); e.className = 'ln'; splitEl.appendChild(e); };
    add('left:calc(50% - 2px);top:0;width:4px;height:100%'); if (n > 2) add('left:0;top:calc(50% - 2px);width:100%;height:4px');
    views.forEach((v, k) => { const r = v.r, e = el('div', 'left:' + (r[0] + r[2] / 2) * 100 + '%;transform:translateX(-50%);top:calc(' + r[1] * 100 + '% + 10px);background:' + COL[v.s.i], v.s.name); e.className = 'tag'; splitEl.appendChild(e); });
    if (n === 3) { const e = el('div', 'left:50%;top:50%;width:50%;height:50%', '📱 Platz 4 frei<br>Code ' + T.code); e.className = 'emp'; splitEl.appendChild(e); }
  }
  T.render = function () {
    if (!views.length) return false; const w = innerWidth, h = innerHeight, r = renderer;
    r.setScissorTest(true); const asp0 = camera.aspect;
    for (const v of views) {
      const x = v.r[0] * w, y = v.r[1] * h, vw = v.r[2] * w, vh = v.r[3] * h, yb = h - y - vh;
      r.setViewport(x, yb, vw, vh); r.setScissor(x, yb, vw, vh);
      if (v.s.i === 0) { camera.aspect = vw / vh; camera.updateProjectionMatrix(); r.render(scene, camera); camera.aspect = asp0; camera.updateProjectionMatrix(); }
      else if (v.s.mate) { mateCam(v.s, T.dt, vw / vh); r.render(scene, v.s.mate.cam); }
    }
    r.setScissorTest(false); r.setViewport(0, 0, w, h); return true;
  };

  /* ---------- Jedes Bild ---------- */
  const info = id => { const e = $(id); if (!e) return ['', '', 1, 0]; const b = e.querySelector('b'), s = e.querySelector('small'); return [b ? b.textContent : '', s ? s.textContent : '', e.hidden ? 1 : 0, e.classList.contains('idle') ? 1 : 0]; };
  const vis = id => { const e = $(id); return !!e && !e.hidden && e.offsetParent !== null; };
  T.update = function (dt, t) {
    if (!T.on) return; T.dt = dt;
    const play = G.state() === 'play';
    T.menuMode = (play && (T.ptrOn || G.uiBusy() || vis('funBar') || vis('toolPanel') || vis('leftExtra') || T.open)) || G.state() === 'pause' || (G.state() === 'menu' && T.ptrOn);
    if (camHoldT > 0) { camHoldT -= dt; if (camHoldT <= 0 && G.dragHold) G.dragHold(false); }
    const s0 = slots[0];
    if (s0) { if (T.menuMode) { G.setStick(0, 0); ptr.x = clamp(ptr.x + s0.stick[0] * dt * 950, 0, innerWidth - 2); ptr.y = clamp(ptr.y - s0.stick[1] * dt * 950, 0, innerHeight - 2); ptrEl.style.display = 'block'; ptrEl.style.transform = 'translate(' + ptr.x + 'px,' + ptr.y + 'px)'; } else { ptrEl.style.display = 'none'; G.setStick(s0.stick[0], s0.stick[1]); } }
    else ptrEl.style.display = 'none';
    for (const s of slots) if (s && s.i > 0) stepMate(s, dt, t);
    hudT -= dt; if (hudT <= 0) {
      hudT = .25; const m0 = modeOf() === 'title' && !T.ptrOn ? 'title' : T.menuMode ? 'menu' : 'play';
      for (const s of slots) { if (!s) continue; let h;
        if (s.i === 0) h = { t: 'h', m: m0, a: info('bAct'), j: info('bJump'), h: info('bHorn'), x: info('bAux'), st: G.stars(), nm: s.name, sp: T.split ? 1 : 0 };
        else { const rv = s.mate && s.mate.veh, bv = !rv && boardable(s); h = { t: 'h', m: m0 === 'title' ? 'title' : 'play', a: rv ? ['🚪', 'Aussteigen', 0, 0] : bv ? ['🚗', 'Mitfahren', 0, 0] : ['👋', 'Hallo!', 0, 0], j: ['⤒', 'Springen', rv ? 1 : 0, 0], h: rv ? ['📣', 'Hupe', 0, 0] : ['💃', s.dance ? 'Stopp' : 'Tanzen', 0, 0], x: ['', '', 1, 0], st: G.stars(), nm: s.name, sp: T.split ? 1 : 0 }; }
        const sig = JSON.stringify(h); if (sig !== s.sig) { s.sig = sig; send(s, h); } }
    }
  };
  T.isHost = () => T.on;
  T.count = () => players().length;
  T.dbg = { slots, ptr, views: () => views, onData, addConn };
  /* Am Fernseher (Smart-TV, ?tv=1, ?device=tv) startet der Fernseher-Modus von selbst */
  /* Handy/Tablet in der Hand (kein Fernseher): „Spiel am Fernseher öffnen“ öffnet direkt den Handy-Controller */
  T.isPhone = () => !T.isTvDevice() && (/iPhone|iPod|iPad|Android.*Mobile|Mobile.*Safari|Windows Phone/i.test(navigator.userAgent) || (!!(window.matchMedia && matchMedia('(pointer:coarse)').matches) && Math.min(screen.width, screen.height) < 900));
  T.openController = () => { let c = ''; try { c = localStorage.getItem('bi-tv-last') || ''; } catch (e) { } location.href = new URL('controller.html' + (c ? '?c=' + c : ''), location.href).href; };
  T.isTvDevice = () => /[?&](tv=1|device=tv)\b/.test(location.search) || /SmartTV|Smart-TV|Tizen|Web0S|WebOS|NetCast|HbbTV|AFTS|AFTM|AFTB|AFTT|AFTN|Android TV|GoogleTV|AppleTV|BRAVIA|CrKey|Viera|Roku|VIDAA|Fire TV|FireTV/i.test(navigator.userAgent);
  return T;
};
