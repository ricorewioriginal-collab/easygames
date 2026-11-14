/* Forscherzeichen: Die Forscher, die den Weltenkern teilten (Chronik Kapitel 10), haben in jeder Welt fünf Zeichen hinterlassen.
   Vier liegen versteckt im Gelände, das fünfte („Echo“) ist nur durch die Erinnerungslinse (Fotomodus, Kapitel 2) zu sehen und wird fotografiert.
   Je Zeichen: Splitter und Erfahrung. Alle fünf einer Welt: Kernsplitter, Phönixtrank und Splitter. Stand: S.emb[Welt] (Bitmaske, 5 Bit). */

export const EMB_PER = 5;
const SYM = { 2: '🍄', 3: '⚙️', 4: '☀️', 5: '🐚', 6: '❄️', 7: '🔥', 8: '🌙', 9: '⭐', 10: '🔮' };
const SYM_MW = ['🍎', '🐺', '🪄', '🔔', '🧞', '🏮', '⚔️', '🌊', '🪞', '🧵', '🎭', '🌸', '📻'];
const COL = { 2: 0x8aff9a, 3: 0xffc860, 4: 0xffe07a, 5: 0x5ad8ff, 6: 0xcfeaff, 7: 0xff8a4a, 8: 0xb08aff, 9: 0xfff2a0, 10: 0xd8c0ff };
export const embWorlds = (mwFirst, mwLast) => { const l = []; for (let n = 2; n <= 10; n++) l.push(n); for (let n = mwFirst; n <= mwLast; n++) l.push(n); return l };
export const embSym = n => SYM[n] || SYM_MW[(n - 21) % SYM_MW.length] || '🏵️';
const bits = v => { let k = 0; for (let i = 0; i < EMB_PER; i++) if (v & (1 << i)) k++; return k };
export const embTotal = s => Object.values(s.emb || {}).reduce((a, v) => a + bits(v | 0), 0);

export function createEmbleme(C) {
  const { T, scene, G, M, glow } = C;
  const S = () => C.S();
  let W = null, hinted = false;
  const mask = n => ((S().emb || (S().emb = {}))[n] | 0);
  const count = n => bits(mask(n));
  function rnd(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
  function tex(sym, col, ghost) {
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), hex = '#' + col.toString(16).padStart(6, '0');
    x.fillStyle = ghost ? 'rgba(20,30,60,.55)' : 'rgba(20,16,36,.85)'; x.beginPath(); x.arc(64, 64, 52, 0, 7); x.fill();
    x.lineWidth = 8; x.strokeStyle = hex; x.globalAlpha = ghost ? .8 : 1; x.beginPath(); x.arc(64, 64, 52, 0, 7); x.stroke();
    x.lineWidth = 2; x.strokeStyle = '#fff'; x.beginPath(); x.arc(64, 64, 42, 0, 7); x.stroke(); x.globalAlpha = 1;
    x.font = '56px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(sym, 64, 68);
    const t = new T.CanvasTexture(c); return t;
  }
  function spots(n, path, h, blocked) {
    const R = rnd(9100 + n * 17), out = [], mw = n >= 21;
    for (let i = 0; i < EMB_PER; i++) {
      const echo = i === EMB_PER - 1; let best = null;
      for (let t = 0; t < 140 && !best; t++) {
        let x, z;
        if (mw) { x = -80 + R() * 160; z = 6 - R() * 106 } else { z = (echo ? -20 : -14) - R() * (echo ? 90 : 136); x = path(z) + (R() < .5 ? -1 : 1) * (4 + R() * (echo ? 10 : 22)) }
        if (blocked(x, z) || !C.colFree(x, z, 1.6)) continue;
        if (Math.abs(h(x + 1, z) - h(x - 1, z)) > 1.1 || Math.abs(h(x, z + 1) - h(x, z - 1)) > 1.1) continue;
        if (Math.hypot(x - (path(12) || 0), z - 12) < 14) continue;
        if (out.some(q => Math.hypot(q[0] - x, q[1] - z) < 16)) continue;
        best = [x, z];
      }
      out.push(best);
    }
    return out;
  }
  function make(n, i, x, z, h) {
    const echo = i === EMB_PER - 1, col = echo ? 0x8ae0ff : (COL[n] || 0xffd870), g = new T.Group();
    const sp = new T.Sprite(new T.SpriteMaterial({ map: tex(embSym(n), col, echo), transparent: true, depthWrite: false, opacity: echo ? .85 : 1 }));
    sp.scale.set(1.5, 1.5, 1); sp.position.y = 1.7; g.add(sp);
    g.add(glow(col, 3.2, 0, 1.7, 0, echo ? .4 : .55)); g.add(glow(col, 1.6, 0, .4, 0, .5)); if (!echo) g.add(glow(col, 2.2, 0, 4.2, 0, .3));
    g.position.set(x, h(x, z), z); scene.add(g); g.visible = !echo; return { i, x, z, m: g, sp, echo, col };
  }
  function build(n, WLD, h) {
    W = null; hinted = false; if (!WLD) return; const s = S(); s.emb = s.emb || {};
    const pts = spots(n, WLD.path, h, (x, z) => C.pBlocked(x, z)), w = W = { n, list: [] };
    pts.forEach((p, i) => { if (p) w.list.push(make(n, i, p[0], p[1], h)); });
    for (const o of w.list) if (mask(n) & (1 << o.i)) { scene.remove(o.m); o.got = true }
    C.anim((t, dt) => frame(t, dt, h));
  }
  function collect(o, quiet) {
    const n = W.n, s = S(); if (o.got) return false; o.got = true; scene.remove(o.m); s.emb[n] = mask(n) | (1 << o.i);
    const sh = 30 + n * 2 + (o.echo ? 40 : 0); s.shards += sh; C.gainXp(20 + n); C.sfx('chest'); C.emit(o.x, C.hgt(o.x, o.z) + 1.7, o.z, o.col, 18, 4, .8, .3, 2, 4);
    C.toast(embSym(n) + ' ' + C.names(n) + '-Zeichen ' + count(n) + '/' + EMB_PER + ' · 💎 +' + sh);
    if (count(n) === EMB_PER) {
      s.mat = s.mat || {}; s.mat.kern = (s.mat.kern || 0) + 1; s.shards += 200 + n * 10; s.items = s.items || {}; s.items.phoenix = (s.items.phoenix || 0) + 1;
      setTimeout(() => { C.banner(embSym(n) + ' ' + C.names(n) + ': alle Forscherzeichen', '💠 Kernsplitter +1 · 🔥 Phönixtrank +1 · 💎 +' + (200 + n * 10)); C.sfx('level') }, 700);
    }
    C.saveGame(true); return true;
  }
  function frame(t, dt, h) {
    if (!W || C.mode() !== 'play') return; const pl = C.pl, ph = C.photoOn(), lens = !!S().lens; let near = false;
    for (const o of W.list) {
      if (o.got) continue;
      if (o.echo) { o.m.visible = ph && lens; if (!ph && lens) { const d = Math.hypot(pl.x - o.x, pl.z - o.z); if (d < 24) { near = true; if (Math.random() < dt * 1.5) C.emit(o.x + (Math.random() - .5), h(o.x, o.z) + 1 + Math.random() * 2, o.z + (Math.random() - .5), o.col, 1, 1, 1.1, .3, -1, 1) } } continue }
      o.sp.position.y = 1.7 + Math.sin(t * 2 + o.i) * .18; o.sp.material.rotation = Math.sin(t + o.i) * .08;
      if (!ph && Math.hypot(pl.x - o.x, pl.z - o.z) < 1.8 && Math.abs(pl.y - h(o.x, o.z)) < 3) collect(o);
    }
    if (near && !hinted) { hinted = true; C.toast('✨ Hier flackert etwas, das man nur durch die Linse sieht (Menü → Linse)') }
  }
  /* Auslöser: Echo-Zeichen im Bild und nah genug → eingesammelt */
  function shot(cam) {
    if (!W || !S().lens) return 0; let k = 0; const p = new T.Vector3();
    for (const o of W.list) {
      if (!o.echo || o.got) continue; p.set(o.x, C.hgt(o.x, o.z) + 1.7, o.z); const d = p.distanceTo(cam.position); if (d > 40) continue;
      p.project(cam); if (p.z < 1 && Math.abs(p.x) < .92 && Math.abs(p.y) < .92 && collect(o)) k++;
    }
    return k;
  }
  function unlock() { const s = S(); if (!s.lens && C.chDone(2)) { s.lens = 1; setTimeout(() => C.banner('📷 Erinnerungslinse', 'Elaris schenkt dir die Linse: Menü → Linse. Sie zeigt Echos und hält Erinnerungen fest.'), 600); C.saveGame(true) } return !!s.lens }
  function html(worlds) {
    const s = S(); const ok = unlock(); let h = `<h3>📷 Erinnerungslinse</h3>`;
    if (!ok) return h + `<div class="row"><span>🔒 Die Linse bekommst du am Ende von Kapitel 2 (Elaris). Dann zeigt sie Echos der Forscher und hält Erinnerungen als Foto fest.</span></div>` + emblHtml(worlds);
    h += `<div class="row"><span>📸 Fotos aufgenommen</span><span>${s.foto | 0}</span></div><div class="row"><span>Freie Kamera, Filter, Posen, Rahmen. Speichern oder Teilen.</span><span><button class="cpb" id="fotoGo">Linse öffnen</button></span></div>`;
    return h + emblHtml(worlds);
  }
  function emblHtml(worlds) {
    const tot = worlds.length * EMB_PER; let h = `<h3>🏵️ Forscherzeichen ${embTotal(S())}/${tot}</h3><p style="color:var(--dim);font-size:13px">Die Forscher, die den Weltenkern teilten, ließen in jeder Welt fünf Zeichen zurück: vier liegen versteckt, das fünfte (Echo) erscheint nur durch die Linse. Alle fünf geben einen Kernsplitter und einen Phönixtrank.</p>`;
    for (const n of worlds) { const k = count(n); h += `<div class="row"><span>${k === EMB_PER ? '✅' : embSym(n)} ${C.names(n)}</span><span>${'◆'.repeat(k)}${'◇'.repeat(EMB_PER - k)}</span></div>` }
    return h;
  }
  return { build, shot, html, unlock, count, clear: () => { W = null }, get W() { return W } };
}
