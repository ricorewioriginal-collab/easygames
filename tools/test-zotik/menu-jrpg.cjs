// JRPG-Menü: Waffen sichtbar nach Ausrüsten, Waffenbilder, Werte-Vergleich, Sternenkarte mit Inseln, Splitterschlüssel
const L = require('./lib.cjs');
(async () => { const b = await L.chromium.launch({ args: L.ARGS }); const p = await L.open(b, { render: true }); let ok = 0, bad = 0; const t = (n, c, x) => { if (c) ok++; else { bad++; console.log('FEHLER', n, x || ''); } };
  await p.evaluate(() => { const Z = __zotik; Z.startDbg(); const S = Z.S(); S.stage = 8; S.cd[2] = { fin: 1 }; S.fl.rb2 = 1; S.inv.w_glut = 1; S.inv.w_schl = 1; S.gear.w = ''; });
  await L.intro(p);
  const r = await p.evaluate(() => { const Z = __zotik, S = Z.S(), f = Z.fox, o = {};
    Z.step(1 / 30, 2); o.base = f.handSword.userData.wid; Z.equip('w_glut'); Z.step(1 / 30, 2); o.glut = f.handSword.userData.wid + '/' + f.backSword.userData.wid;
    o.keyAtk = Z.GEAR.w_schl.atk; S.fl.rb3 = 1; o.keyAtk2 = Z.GEAR.w_schl.atk;
    Z.toggleMenu(true, 'equip'); const c = document.getElementById('mcont'); o.slots = c.querySelectorAll('.eqslot').length; o.img = !!c.querySelector('.eqslot img[src^="data:image"]');
    c.querySelector('[data-pick="w_schl"]').click(); o.cmp = !!c.querySelector('.eqst .up'); c.querySelector('[data-eq="w_schl"]').click(); o.eq = S.gear.w;
    o.head = document.getElementById('mhead').textContent; o.chr = !!document.querySelector('#mchar .mc-b');
    Z.renderMenu('travel'); o.nodes = c.querySelectorAll('.wn').length; o.lit = c.querySelectorAll('line.lit').length; o.isl = !!c.querySelector('.wn img[src^="data:image"]');
    c.querySelector('[data-tw="2"]').click(); o.go = !!c.querySelector('.wsel .trv[data-n="2"]'); Z.toggleMenu(false); Z.step(1 / 30, 2); o.key = f.handSword.userData.wid; return o; });
  t('Grundklinge', r.base === '', r.base); t('Glutklinge sichtbar', r.glut === 'w_glut/w_glut', r.glut); t('Splitterschlüssel wächst', r.keyAtk2 > r.keyAtk, r.keyAtk + '>' + r.keyAtk2);
  t('drei Plätze', r.slots === 3); t('Waffenbild', r.img); t('Vergleich', r.cmp); t('ausgerüstet', r.eq === 'w_schl'); t('Kopfzeile', /MENÜ.*Lunaris/.test(r.head), r.head); t('Figurenkarte', r.chr);
  t('Inseln', r.nodes >= 20 && r.isl, r.nodes); t('Pfade', r.lit >= 1, r.lit); t('Reisen-Knopf', r.go); t('Schlüssel in der Hand', r.key === 'w_schl', r.key);
  t('keine Fehler', !p.errs.length, p.errs.join(' | ')); console.log(ok + '/' + (ok + bad) + ' bestanden'); await b.close(); process.exit(bad ? 1 : 0); })();
