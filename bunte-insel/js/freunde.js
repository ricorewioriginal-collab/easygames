'use strict';
/* Bunte Insel – Freundschaft 💞: Bewohner merken sich dich.
   Jeden Tag einmal reden = +1 Freundschaftspunkt, Blumenstrauß schenken = +3, ein Geschenk aus der Tasche (3 ⭐) = +2 (einmal am Tag je Bewohner).
   2 Punkte = 1 Herz, höchstens 5 Herzen. Neues Herz: Belohnung (Sterne), ab 3 Herzen persönliche Begrüßung und ein Dankeschön-Geschenk,
   5 Herzen = „Beste Freunde“. Spielstand: save.friends = { Name: { p: Punkte, d: Tag, g: Geschenk-Tag } } (nur ergänzt, alte Stände laden). */
BI.createFreunde = function (G) {
  const { save, persist, say, addStars, earn } = G, K = {};
  const day = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  const F = () => save.friends || (save.friends = {}), rec = n => F()[n] || (F()[n] = { p: 0 });
  K.hearts = n => Math.min(5, Math.floor(((F()[n] || {}).p || 0) / 2));
  K.heartText = n => { const h = K.hearts(n); return '❤️'.repeat(h) + '🤍'.repeat(5 - h); };
  const GIFTS = ['🍪 Keks', '🌸 Blume', '🐚 Muschel', '🍎 Apfel', '🎈 Luftballon', '⭐ Glitzerstein'];
  const THANKS = ['Für dich, mein Freund!', 'Ich hab was für dich aufgehoben!', 'Weil du so nett bist!'];
  const pn = () => (save.pname || '').trim() || 'du';
  function gain(n, k, why) {
    const r = rec(n), h0 = K.hearts(n); r.p = Math.min(10, (r.p || 0) + k); const h1 = K.hearts(n); persist();
    if (h1 > h0) {
      const st = h1 * 2; addStars(st);
      const extra = h1 >= 3 ? ' ' + n + ' schenkt dir ' + GIFTS[(n.length + h1) % GIFTS.length] + ': „' + THANKS[h1 % THANKS.length] + '“' : '';
      setTimeout(() => say('💞 ' + n + ': ' + '❤️'.repeat(h1) + ' Herz ' + h1 + ' von 5! +' + st + ' ⭐' + extra, 4600), why ? 3400 : 1600);
      if (h1 >= 3 && earn) earn('freund3'); if (h1 >= 5 && earn) earn('freund5');
    }
  }
  /* beim Reden: gibt eine persönliche Begrüßung zurück (oder null) und zählt den Tagespunkt */
  K.talk = function (n) {
    if (!n) return null; const r = rec(n), d = day(), first = r.d !== d, h = K.hearts(n);
    if (first) { r.d = d; gain(n, 1); }
    if (h >= 5) return 'Mein bester Freund ' + pn() + '! Mit dir ist jeder Tag ein Insel-Fest. 💖';
    if (h >= 3 && first) return 'Hallo ' + pn() + '! Schön, dass du mich wieder besuchst. 😊';
    if (h >= 1 && first && Math.random() < .5) return 'Ach, du schon wieder – wie schön! 🙂';
    return null;
  };
  K.bouquet = n => gain(n, 3, 1);
  /* Geschenk aus der Tasche: kostet 3 Sterne, +2 Punkte, einmal am Tag je Bewohner */
  K.canGift = n => (save.stars || 0) >= 3 && rec(n).g !== day() && K.hearts(n) < 5;
  K.gift = function (n) {
    if (!K.canGift(n)) { say(rec(n).g === day() ? '🎁 ' + n + ' hat heute schon ein Geschenk von dir bekommen.' : K.hearts(n) >= 5 ? '💖 Ihr seid schon beste Freunde!' : '🎁 Für ein Geschenk brauchst du 3 ⭐.', 3000); return false; }
    const r = rec(n); r.g = day(); addStars(-3); const g = GIFTS[(n.length + (r.p || 0)) % GIFTS.length];
    say('🎁 Du schenkst ' + n + ' ' + g + '. ' + n + ': „Oh, wie lieb von dir!“', 3200); gain(n, 2, 1); return true;
  };
  K.count = () => Object.keys(F()).filter(n => K.hearts(n) >= 1).length;
  K.log = function () {
    const L = Object.entries(F()).map(([n]) => ({ n, h: K.hearts(n) })).filter(q => q.h > 0).sort((a, b) => b.h - a.h).slice(0, 8);
    return { title: '💞 Freundschaften', count: L.filter(q => q.h >= 5).length + ' beste Freunde', rows: [
      { ok: L.length >= 1, icon: '💬', text: 'Rede jeden Tag mit Bewohnern – jedes Gespräch bringt Freundschaft' },
      { ok: L.some(q => q.h >= 3), icon: '💞', text: '3 Herzen mit einem Bewohner (schenk Blumen 💐 oder 🎁)' },
      { ok: L.some(q => q.h >= 5), icon: '💖', text: 'Beste Freunde: 5 Herzen' },
      ...L.map(q => ({ ok: q.h >= 5, icon: '❤️', text: q.n + ' ' + '❤️'.repeat(q.h) + '🤍'.repeat(5 - q.h) }))] };
  };
  return K;
};
