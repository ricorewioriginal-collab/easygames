/* easygames Windows-App: Aufnahme im Spiel – Clip der letzten Sekunden (F9) und Aufnahme Start/Stopp (F10).
 * Export: MP4 16:9, MP4 9:16 hochkant (Bild mittig, unscharfer Hintergrund) oder GIF (letzte 10 s, ohne Ton).
 * Quelle: das Spielfenster selbst (Tab-Aufnahme mit Ton, von der App ohne Rückfrage freigegeben); sonst die größte Zeichenfläche
 * des Spiels (ohne Ton). Gespeichert wird über einen Download – die App legt ihn unter Videos\easygames ab (GameWindow.cs).
 * Einstellungen: window.EG_REC = { clip: true|false (Clip-Puffer im Hintergrund), secs: 30, game: Titel }. */
(function () {
  'use strict';
  if (window !== window.top || window.__egRec) return;
  var C = window.EG_REC || {}, SECS = Math.max(10, Math.min(120, +C.secs || 30)), SEG = 10, GIF_SECS = 10;
  var stream = null, src = '', segs = [], cur = null, curChunks = [], segTimer = 0, manual = null, busy = false, ui = null;
  window.__egRec = { clip: clip, toggle: toggle, state: function () { return { src: src, segs: segs.length, secs: bufSecs(), rec: !!manual, busy: busy }; } };

  // ---------- Quelle ----------
  function mime(list) { for (var i = 0; i < list.length; i++) if (window.MediaRecorder && MediaRecorder.isTypeSupported(list[i])) return list[i]; return ''; }
  // H.264 zuerst: läuft über die Grafikkarte (flüssig, wenig CPU); VP9 nur als letzte Wahl (Software, ruckelt neben dem Spiel)
  var BUF = mime(['video/mp4;codecs=avc1,mp4a.40.2', 'video/webm;codecs=h264,opus', 'video/mp4;codecs=avc1', 'video/webm;codecs=vp8,opus', 'video/webm;codecs=vp9,opus', 'video/webm']);
  var MP4 = mime(['video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4;codecs=avc1', 'video/mp4']);
  function bigCanvas() {
    var best = null, area = 0;
    [].forEach.call(document.querySelectorAll('canvas'), function (c) { var r = c.getBoundingClientRect(), a = r.width * r.height; if (a > area) { area = a; best = c; } });
    return area > 40000 ? best : null;
  }
  function getStream() {
    if (stream && stream.getVideoTracks().some(function (t) { return t.readyState === 'live'; })) return Promise.resolve(stream);
    var md = navigator.mediaDevices;
    var tab = md && md.getDisplayMedia ? md.getDisplayMedia({ video: { frameRate: { ideal: 60, max: 60 }, width: { max: 1920 }, height: { max: 1080 } }, audio: true, preferCurrentTab: true, selfBrowserSurface: 'include', surfaceSwitching: 'exclude', systemAudio: 'exclude' })
      .then(function (s) { src = 'tab'; return s; }) : Promise.reject(new Error('keine Tab-Aufnahme'));
    return tab.catch(function () {
      var c = bigCanvas(); if (!c || !c.captureStream) throw new Error('Keine Bildquelle im Spiel gefunden');
      src = 'canvas'; return c.captureStream(30);
    }).then(function (s) { stream = s; s.getVideoTracks().forEach(function (t) { t.addEventListener('ended', function () { stream = null; }); }); return s; });
  }

  // ---------- Clip-Puffer: Abschnitte à 10 s, die letzten ≥ SECS bleiben ----------
  function bufSecs() { return segs.reduce(function (a, s) { return a + s.dur; }, 0) + (cur ? (performance.now() - cur.t0) / 1000 : 0); }
  function startSeg() {
    if (!stream || !BUF) return;
    var r; try { r = new MediaRecorder(stream, { mimeType: BUF, videoBitsPerSecond: 8e6 }); } catch (e) { return; }
    var chunks = [], t0 = performance.now(), me = { r: r, t0: t0 };
    r.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
    r.onstop = function () {
      if (me.drop) return;
      segs.push({ blob: new Blob(chunks, { type: BUF }), dur: (performance.now() - me.t0) / 1000 });
      while (segs.length > 1 && bufSecs() - segs[0].dur >= SECS) segs.shift();
      if (me.done) me.done();
    };
    r.start(1000); cur = me; curChunks = chunks;
    clearTimeout(segTimer); segTimer = setTimeout(rollSeg, SEG * 1000);
  }
  function rollSeg() { var c = cur; cur = null; if (c && c.r.state !== 'inactive') c.r.stop(); startSeg(); }
  function finishSeg() { return new Promise(function (res) { var c = cur; cur = null; clearTimeout(segTimer); if (!c || c.r.state === 'inactive') return res(); c.done = res; c.r.stop(); }); }
  // Während das Aufnahme-Fenster offen ist, pausiert der Puffer (sonst landet das Fenster im nächsten Clip)
  function bufPause() { if (cur && cur.r.state === 'recording') { cur.r.pause(); cur.paused = performance.now(); clearTimeout(segTimer); } }
  function bufResume() {
    if (cur && cur.r.state === 'paused') { cur.r.resume(); cur.t0 += performance.now() - cur.paused; segTimer = setTimeout(rollSeg, Math.max(1000, SEG * 1000 - (performance.now() - cur.t0))); }
    else if (C.clip !== false && !cur && stream) startSeg();
  }
  function bufferOn() { return getStream().then(function () { if (!cur) startSeg(); }); }

  // ---------- Bedienung ----------
  function clip() {
    if (busy) return;
    if (!cur && !segs.length) { toast('🎬 Clip-Aufnahme startet jetzt – in ein paar Sekunden noch einmal F9'); bufferOn().catch(fail); return; }
    busy = true;
    finishSeg().then(function () {
      var list = segs.slice(); segs = [];   // Puffer läuft nach dem Schließen des Fensters weiter
      if (!list.length) { busy = false; return; }
      dialog(list, 'Clip · letzte ' + Math.round(list.reduce(function (a, s) { return a + s.dur; }, 0)) + ' s');
    });
  }
  function toggle() {
    if (manual) { var m = manual; manual = null; rec(false); hostRec(false); m.r.onstop = function () { dialog([{ blob: new Blob(m.chunks, { type: BUF }), dur: (performance.now() - m.t0) / 1000 }], 'Aufnahme · ' + fmtDur((performance.now() - m.t0) / 1000)); }; m.r.stop(); return; }
    if (busy) return;
    getStream().then(function (s) {
      var r = new MediaRecorder(s, { mimeType: BUF, videoBitsPerSecond: 12e6 }), m = { r: r, chunks: [], t0: performance.now() };
      r.ondataavailable = function (e) { if (e.data && e.data.size) m.chunks.push(e.data); };
      r.start(1000); manual = m; rec(true); hostRec(true);
    }).catch(fail);
  }
  function hostRec(on) { try { if (window.chrome && chrome.webview) chrome.webview.postMessage({ type: 'egRec', on: !!on }); } catch (e) { } }   // „● REC“ im Fenstertitel (nicht im Video)
  function fail(e) { busy = false; toast('⚠ Aufnahme nicht möglich: ' + (e && e.message || e)); }
  addEventListener('keydown', function (e) {
    if (e.key === 'F9') { e.preventDefault(); e.stopImmediatePropagation(); clip(); }
    else if (e.key === 'F10' || e.key === 'F8' || (e.ctrlKey && e.shiftKey && /^r$/i.test(e.key))) { e.preventDefault(); e.stopImmediatePropagation(); toggle(); }
  }, true);
  // Controller: L3 + R3 (beide Sticks drücken) = Aufnahme starten/stoppen, Select + R3 = Clip
  (function () {
    var was = '';
    setInterval(function () {
      if (document.hidden) return;
      var N = window.EasyGamesPadNormal, l; try { l = N && N.physical ? N.physical() : navigator.getGamepads(); } catch (e) { return; }
      var b = [], i, k; for (i = 0; i < (l ? l.length : 0); i++) if (l[i] && l[i].buttons) for (k = 8; k <= 11; k++) if (l[i].buttons[k] && l[i].buttons[k].pressed) b[k] = 1;
      var now = b[10] && b[11] ? 'rec' : b[8] && b[11] ? 'clip' : '';
      if (now && now !== was) { if (now === 'rec') toggle(); else clip(); }
      was = now;
    }, 80);
  })();
  addEventListener('message', function (e) { var d = e.data; if (d && d.type === 'egRecSaved' && ui) saved(d.path); });
  if (window.chrome && chrome.webview) chrome.webview.addEventListener('message', function (e) { var d = e.data; if (d && d.type === 'egRecSaved') saved(d.path); });

  // ---------- Export: Abschnitte abspielen, neu zeichnen (Format), aufnehmen ----------
  function play(list, onFrame, fromEnd) {   // spielt die Abschnitte nacheinander; fromEnd: nur die letzten n Sekunden „zählen“ (davor schnell vorspulen)
    var total = list.reduce(function (a, s) { return a + s.dur; }, 0), skip = fromEnd ? Math.max(0, total - fromEnd) : 0, done = 0, i = 0;
    var v = document.createElement('video'); v.playsInline = true; v.muted = false;
    var ac = new (window.AudioContext || window.webkitAudioContext)(), dest = ac.createMediaStreamDestination();
    try { ac.createMediaElementSource(v).connect(dest); } catch (e) { }
    return {
      video: v, audio: dest.stream, total: total - skip,
      run: function (progress) {
        return new Promise(function (res, rej) {
          var raf = 0, url = '';
          // jedes dekodierte Bild genau einmal zeichnen (requestVideoFrameCallback) – gleichmäßig statt im Takt der Bildwiederholung
          var rvfc = typeof v.requestVideoFrameCallback === 'function';
          function frame(t0, meta) { var t = done + (meta && meta.mediaTime != null ? meta.mediaTime : v.currentTime || 0) - skip; if (t >= 0 && !v.paused) { onFrame(v, t); progress(Math.min(1, t / Math.max(1, total - skip))); } }
          function tick() { if (rvfc) { raf = v.requestVideoFrameCallback(function (n, m) { frame(n, m); tick(); }); return; } raf = requestAnimationFrame(tick); if (v.readyState >= 2) frame(); }
          function next() {
            if (url) URL.revokeObjectURL(url);
            if (i >= list.length) { if (rvfc) { try { v.cancelVideoFrameCallback(raf); } catch (e) { } } else cancelAnimationFrame(raf); ac.close(); return res(); }
            var s = list[i++]; url = URL.createObjectURL(s.blob); v.src = url;
            v.playbackRate = done + s.dur <= skip ? 16 : 1; v.muted = v.playbackRate !== 1;
            v.onended = function () { done += s.dur; next(); };
            v.onerror = function () { cancelAnimationFrame(raf); rej(new Error('Video nicht lesbar')); };
            v.play().catch(rej);
          }
          tick(); next();
        });
      }
    };
  }
  function draw(ctx, v, W, H, tall) {
    var vw = v.videoWidth || W, vh = v.videoHeight || H;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    if (tall) {   // 9:16: Hintergrund = Bild füllend, unscharf und dunkel; davor das ganze Bild in voller Breite
      // Hintergrund klein zeichnen und hochskalieren: wirkt unscharf, kostet aber nur einen Bruchteil eines echten Weichzeichners (kein Ruckeln)
      var sw = Math.round(W / 36), sh = Math.round(H / 36), sm = draw.small || (draw.small = document.createElement('canvas')), sx = sm.getContext('2d');
      if (sm.width !== sw) { sm.width = sw; sm.height = sh; }
      var k = Math.max(sw / vw, sh / vh); sx.filter = "blur(1.5px)"; sx.drawImage(v, (sw - vw * k) / 2, (sh - vh * k) / 2, vw * k, vh * k);
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'low'; ctx.drawImage(sm, 0, 0, W, H); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 0, W, H);
    }
    var f = Math.min(W / vw, H / vh); ctx.drawImage(v, (W - vw * f) / 2, (H - vh * f) / 2, vw * f, vh * f);
  }
  function toVideo(list, tall, progress) {
    var vt = null, p = play(list, function (v) { if (!cvs.width) size(v); draw(ctx, v, cvs.width, cvs.height, tall); if (vt && vt.requestFrame) vt.requestFrame(); }, 0), cvs = document.createElement('canvas'), ctx = cvs.getContext('2d');
    function size(v) { var vw = v.videoWidth || 1280, vh = v.videoHeight || 720; if (tall) { cvs.width = 1080; cvs.height = 1920; } else { var f = Math.min(1, 1920 / vw, 1080 / vh); cvs.width = Math.round(vw * f / 2) * 2; cvs.height = Math.round(vh * f / 2) * 2; } }
    cvs.width = 0;
    var type = MP4 || BUF, chunks = [], r = null;
    return new Promise(function (res, rej) {
      p.video.addEventListener('loadeddata', function once() {
        p.video.removeEventListener('loadeddata', once); size(p.video);
        var s = cvs.captureStream(0); vt = s.getVideoTracks()[0]; if (!vt || !vt.requestFrame) { s = cvs.captureStream(60); vt = null; }   // Bild genau dann, wenn eins gezeichnet wurde
        p.audio.getAudioTracks().forEach(function (t) { s.addTrack(t); });
        r = new MediaRecorder(s, { mimeType: type, videoBitsPerSecond: tall ? 8e6 : 10e6 });
        r.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
        r.onstop = function () { res({ blob: new Blob(chunks, { type: type.split(';')[0] }), ext: /mp4/.test(type) ? 'mp4' : 'webm' }); };
        r.start(1000);
      });
      p.run(progress).then(function () { setTimeout(function () { if (r) r.stop(); }, 150); }, rej);
    });
  }
  function toGif(list, progress) {
    var W = 480, fps = 12, frames = [], H = 0, next = 0, cvs = document.createElement('canvas'), ctx = cvs.getContext('2d', { willReadFrequently: true });
    var p = play(list, function (v, t) {
      if (!H) { H = Math.round(W * (v.videoHeight || 270) / (v.videoWidth || 480) / 2) * 2; cvs.width = W; cvs.height = H; }
      if (t < next) return; next += 1 / fps;
      ctx.drawImage(v, 0, 0, W, H); frames.push(ctx.getImageData(0, 0, W, H).data);
    }, GIF_SECS);
    return p.run(function (x) { progress(x * 0.85); }).then(function () {
      return new Promise(function (res) { setTimeout(function () { res({ blob: new Blob([gifEncode(W, H, frames, Math.round(100 / fps))], { type: 'image/gif' }), ext: 'gif' }); progress(1); }, 30); });
    });
  }

  // ---------- GIF (eigener kleiner Encoder: feste 6×7×6-Farbpalette mit geordnetem Dithering, LZW) ----------
  function gifEncode(w, h, frames, delay) {
    var out = [], pal = [], i, r, g, b;
    for (r = 0; r < 6; r++) for (g = 0; g < 7; g++) for (b = 0; b < 6; b++) pal.push(Math.round(r * 51), Math.round(g * 42.5), Math.round(b * 51));
    while (pal.length < 768) pal.push(0);
    function u16(v) { out.push(v & 255, (v >> 8) & 255); }
    function str(s) { for (var k = 0; k < s.length; k++) out.push(s.charCodeAt(k)); }
    str('GIF89a'); u16(w); u16(h); out.push(0xf7, 0, 0); for (i = 0; i < 768; i++) out.push(pal[i]);
    out.push(0x21, 0xff, 11); str('NETSCAPE2.0'); out.push(3, 1, 0, 0, 0);   // Endlosschleife
    var B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5], idx = new Uint8Array(w * h);
    frames.forEach(function (px) {
      for (var y = 0, p = 0; y < h; y++) for (var x = 0; x < w; x++, p++) {
        var d = (B[(y & 3) * 4 + (x & 3)] / 16 - 0.5), o = p * 4;
        var R = Math.max(0, Math.min(5, Math.round(px[o] / 51 + d))), G = Math.max(0, Math.min(6, Math.round(px[o + 1] / 42.5 + d))), Bl = Math.max(0, Math.min(5, Math.round(px[o + 2] / 51 + d)));
        idx[p] = R * 42 + G * 6 + Bl;
      }
      out.push(0x21, 0xf9, 4, 4); u16(delay); out.push(0, 0);
      out.push(0x2c); u16(0); u16(0); u16(w); u16(h); out.push(0);
      lzw(idx, 8, out);
    });
    out.push(0x3b);
    return new Uint8Array(out);
  }
  function lzw(data, minBits, out) {
    out.push(minBits);
    var clear = 1 << minBits, eoi = clear + 1, size = minBits + 1, next = eoi + 1, dict = new Map(), buf = 0, nb = 0, block = [];
    function emit(code) { buf |= code << nb; nb += size; while (nb >= 8) { block.push(buf & 255); buf >>= 8; nb -= 8; if (block.length === 255) { out.push(255); for (var k = 0; k < 255; k++) out.push(block[k]); block = []; } } }
    emit(clear);
    var prefix = data[0];
    for (var i = 1; i < data.length; i++) {
      var c = data[i], key = prefix * 256 + c, v = dict.get(key);
      if (v !== undefined) { prefix = v; continue; }
      emit(prefix);
      if (next < 4096) { dict.set(key, next++); if (next > (1 << size) && size < 12) size++; }
      else { emit(clear); dict.clear(); size = minBits + 1; next = eoi + 1; }
      prefix = c;
    }
    emit(prefix); emit(eoi);
    if (nb > 0) block.push(buf & 255);
    while (block.length) { var n = Math.min(255, block.length); out.push(n); for (var k = 0; k < n; k++) out.push(block[k]); block = block.slice(n); }
    out.push(0);
  }

  // ---------- Oberfläche ----------
  function el(tag, css, html) { var e = document.createElement(tag); if (css) e.style.cssText = css; if (html != null) e.innerHTML = html; return e; }
  var FONT = 'font:600 14px/1.4 system-ui,"Segoe UI",sans-serif;';
  var dot = null;
  function rec(on) {
    if (!dot) { dot = el('div', 'position:fixed;left:14px;top:12px;z-index:2147483646;padding:5px 11px;border-radius:99px;background:rgba(10,12,20,.82);color:#fff;pointer-events:none;' + FONT, '<span style="color:#ff3b4e">●</span> REC · F8/F10 oder L3+R3 stoppt'); document.documentElement.appendChild(dot); }
    dot.style.display = on ? '' : 'none'; clearTimeout(dot.t); if (on) dot.t = setTimeout(function () { dot.style.display = 'none'; }, 2500);   // nur kurz – sonst wäre es in der Aufnahme zu sehen
  }
  var toastEl = null, toastT = 0;
  function toast(t) {
    if (!toastEl) { toastEl = el('div', 'position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:2147483647;max-width:90vw;padding:9px 16px;border-radius:12px;background:rgba(10,12,20,.92);color:#fff;box-shadow:0 8px 30px rgba(0,0,0,.5);pointer-events:none;' + FONT); document.documentElement.appendChild(toastEl); }
    toastEl.textContent = t; toastEl.style.display = ''; clearTimeout(toastT); toastT = setTimeout(function () { toastEl.style.display = 'none'; }, 4200);
  }
  function fmtDur(s) { s = Math.round(s); return s < 60 ? s + ' s' : Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2) + ' min'; }
  function dialog(list, title) {
    close(); busy = true; bufPause();
    var url = URL.createObjectURL(list[list.length - 1].blob);
    ui = el('div', 'position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:rgba(4,6,12,.72);' + FONT);
    ui.innerHTML = '<div style="width:min(560px,94vw);padding:18px;border-radius:18px;background:#121726;color:#fff;box-shadow:0 20px 60px rgba(0,0,0,.6)">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><b style="font-size:16px">🎬 ' + title + '</b><button data-x style="all:unset;cursor:pointer;padding:4px 8px;opacity:.7">✕</button></div>' +
      '<video src="' + url + '" muted autoplay loop playsinline style="width:100%;border-radius:12px;background:#000;max-height:40vh"></video>' +
      '<div style="font-size:12px;opacity:.7;margin:8px 0 12px">Vorschau zeigt das Ende. Speichern unter Videos\\easygames.' + (src === 'canvas' ? ' Ohne Ton (nur Spielbild aufgenommen).' : '') + (MP4 ? '' : ' MP4 geht hier nicht – gespeichert wird WebM.') + '</div>' +
      '<div data-btns style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">' +
      [['wide', '🖥️ MP4 16:9'], ['tall', '📱 MP4 9:16'], ['gif', '🖼️ GIF (letzte ' + GIF_SECS + ' s)']].map(function (b) { return '<button data-f="' + b[0] + '" style="all:unset;cursor:pointer;text-align:center;padding:12px 6px;border-radius:12px;background:#262e48">' + b[1] + '</button>'; }).join('') + '</div>' +
      '<div data-prog style="display:none;margin-top:12px"><div style="height:8px;border-radius:99px;background:#262e48;overflow:hidden"><i style="display:block;height:100%;width:0;background:linear-gradient(90deg,#22d3ee,#e879f9)"></i></div><div data-pt style="font-size:12px;opacity:.75;margin-top:6px"></div></div>' +
      '<div data-done style="display:none;margin-top:12px;font-size:13px"></div></div>';
    document.documentElement.appendChild(ui);
    ui.querySelector('[data-x]').onclick = function () { URL.revokeObjectURL(url); close(); };
    ui.querySelectorAll('[data-f]').forEach(function (b) {
      b.onclick = function () {
        var f = b.getAttribute('data-f'), prog = ui.querySelector('[data-prog]'), bar = prog.querySelector('i'), pt = ui.querySelector('[data-pt]');
        ui.querySelector('[data-btns]').style.opacity = '.4'; ui.querySelector('[data-btns]').style.pointerEvents = 'none'; prog.style.display = '';
        pt.textContent = f === 'gif' ? 'GIF wird erstellt …' : 'Video wird erstellt (dauert so lange wie der Clip) …';
        // 16:9 aus einer einzigen MP4-Aufnahme: ohne Umwandlung speichern (sofort, keine Qualitätsverluste)
        var job = f === 'gif' ? toGif(list, upd) : f === 'wide' && list.length === 1 && /mp4/.test(BUF) ? Promise.resolve({ blob: list[0].blob, ext: 'mp4' }) : toVideo(list, f === 'tall', upd);
        function upd(x) { bar.style.width = Math.round(x * 100) + '%'; }
        job.then(function (r) {
          upd(1); var d = new Date(), stamp = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) + '_' + ('0' + d.getHours()).slice(-2) + '-' + ('0' + d.getMinutes()).slice(-2) + '-' + ('0' + d.getSeconds()).slice(-2);
          var name = 'easygames-' + String(C.game || document.title || 'spiel').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) + '-' + stamp + (f === 'tall' ? '-9x16' : '') + '.' + r.ext;
          var a = document.createElement('a'), u = URL.createObjectURL(r.blob); a.href = u; a.download = name; document.documentElement.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(u); }, 60000);
          pt.textContent = '✅ Gespeichert: ' + name + ' (' + (r.blob.size / 1048576).toFixed(1) + ' MB)';
          ui.querySelector('[data-btns]').style.opacity = ''; ui.querySelector('[data-btns]').style.pointerEvents = '';
          window.__egRecLast = { name: name, size: r.blob.size, type: r.blob.type };
        }).catch(function (e) { pt.textContent = '⚠ ' + (e && e.message || e); ui.querySelector('[data-btns]').style.opacity = ''; ui.querySelector('[data-btns]').style.pointerEvents = ''; });
      };
    });
  }
  function saved(path) {
    if (!ui) { toast('✅ Gespeichert: ' + path); return; }
    var d = ui.querySelector('[data-done]'); d.style.display = '';
    d.innerHTML = '📁 ' + String(path).replace(/[&<>]/g, '') + ' <button style="all:unset;cursor:pointer;color:#22d3ee;margin-left:6px">Ordner öffnen</button>';
    d.querySelector('button').onclick = function () { if (window.chrome && chrome.webview) chrome.webview.postMessage({ type: 'egRecOpen', path: path }); };
  }
  function close() { var was = !!ui; if (ui) { ui.remove(); ui = null; } busy = false; if (was) bufResume(); }

  // ---------- Start ----------
  function boot() {
    if (C.clip === false) return;
    var first = false; try { first = !sessionStorage.getItem('eg-rec-hint'); sessionStorage.setItem('eg-rec-hint', '1'); } catch (e) { }
    if (first) setTimeout(function () { toast('🎬 F9 = Clip der letzten ' + SECS + ' s · F8/F10 = Aufnahme starten/stoppen · 🎮 L3+R3 Aufnahme, Select+R3 Clip'); }, 800);
    setTimeout(function () { bufferOn().catch(function () { }); }, first ? 5200 : 1500);   // Puffer erst nach dem Hinweis (sonst steht er im Clip)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
