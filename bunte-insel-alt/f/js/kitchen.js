'use strict';
/* Bunte Insel – Hofküche: aus Ernte, Eiern und Milch kochen, Waren an Bauer Heinz verkaufen. */
BI.createKitchen = function (G) {
  const { A, fx, P, say, addStars, persist } = G, $ = id => document.getElementById(id), K = { open: false }, F = G.W.spots.farm;
  const NAMES = { carrot: ['🥕', 'Möhre'], tomato: ['🍅', 'Tomate'], corn: ['🌽', 'Mais'], strawberry: ['🍓', 'Erdbeere'], pumpkin: ['🎃', 'Kürbis'], sunflower: ['🌻', 'Sonnenblume'], tulip: ['🌷', 'Tulpe'], egg: ['🥚', 'Ei'], milk: ['🥛', 'Milch'], jam: ['🍯', 'Marmelade'], cake: ['🍰', 'Kuchen'], soup: ['🥣', 'Kürbissuppe'], popcorn: ['🍿', 'Popcorn'], apple: ['🍎', 'Apfel'], banana: ['🍌', 'Banane'], bread: ['🍞', 'Brot'], cheese: ['🧀', 'Käse'], flour: ['🌾', 'Mehl'], juice: ['🧃', 'Saft'], choc: ['🍫', 'Schoko'], croissant: ['🥐', 'Croissant'], cookie: ['🍪', 'Keks'], bouquet: ['💐', 'Blumenstrauß'], potion_hp: ['❤️', 'Heiltrank'], potion_ep: ['⚡', 'Energietrank'], cocoa: ['☕', 'Kakao'], cakeslice: ['🍰', 'Kuchenstück'], icecream: ['🍦', 'Eis'], pancake: ['🥞', 'Pfannkuchen'], pizza: ['🍕', 'Pizza'], fruitsalad: ['🥗', 'Obstsalat'], sandwich: ['🥪', 'Sandwich'] };
  const REC = [
    { id: 'jam', need: { strawberry: 2 }, price: 3 }, { id: 'soup', need: { pumpkin: 1, carrot: 1 }, price: 3 },
    { id: 'cake', need: { egg: 2, milk: 1, strawberry: 1 }, price: 5 }, { id: 'popcorn', need: { corn: 1 }, price: 2 },
    { id: 'pancake', need: { egg: 1, milk: 1, flour: 1 }, price: 4 }, { id: 'pizza', need: { flour: 1, cheese: 1, tomato: 1 }, price: 5 }, { id: 'fruitsalad', need: { apple: 1, banana: 1 }, price: 3 }, { id: 'sandwich', need: { bread: 1, cheese: 1 }, price: 3 }
  ];
  const ico = k => (NAMES[k] || G.cropIcon && [G.cropIcon(k)] || ['•'])[0], nm = k => (NAMES[k] || [0, k])[1];
  K.near = () => !!F.stove && !G.P.veh && Math.hypot(P.x - F.stove.x, P.z - F.stove.z) < 2.6;
  const inv = () => G.inv();
  const have = r => Object.keys(r.need).every(k => (inv()[k] || 0) >= r.need[k]);
  function render() {
    const I = inv(), items = Object.keys(I).filter(k => I[k] > 0);
    $('kitInv').textContent = items.length ? 'Vorrat: ' + items.map(k => ico(k) + '×' + I[k]).join('  ') : 'Dein Korb ist leer – ernte im Garten, sammle Eier und melke die Kuh 🐮';
    const rb = $('kitRec'); rb.innerHTML = '';
    for (const r of REC) { const b = document.createElement('button'); b.disabled = !have(r); b.textContent = ico(r.id) + ' ' + nm(r.id) + '  ←  ' + Object.keys(r.need).map(k => r.need[k] + '× ' + ico(k)).join(' + '); b.onclick = () => cook(r); rb.appendChild(b); }
    const sb = $('kitSell'); sb.innerHTML = ''; let any = false;
    for (const r of REC.concat([{ id: 'milk', price: 1 }, { id: 'cakeslice', price: 1 }, { id: 'icecream', price: 1 }])) if ((I[r.id] || 0) > 0) { any = true; const b = document.createElement('button'); b.textContent = ico(r.id) + ' ×' + I[r.id] + ' → ' + r.price + ' ⭐'; b.onclick = () => sell(r); sb.appendChild(b); }
    if (!any) sb.textContent = 'Noch nichts zu verkaufen.';
  }
  function cook(r) {
    if (!have(r)) return; const I = inv(); for (const k in r.need) I[k] -= r.need[k]; I[r.id] = (I[r.id] || 0) + 1; persist(); A.star && A.star(); fx.burst(F.stove.x, 2, F.stove.z, 14, [BI.C.gold, BI.C.white, BI.C.orange || BI.C.gold], 3, 1.3, 28, 2);
    say(ico(r.id) + ' ' + nm(r.id) + ' ist fertig! Lecker!', 2200); G.earn && G.earn('cook'); render();
  }
  function sell(r) { const I = inv(); if (!(I[r.id] > 0)) return; I[r.id]--; addStars(r.price); persist(); A.buy && A.buy(); say('Bauer Heinz: „Danke!“ ' + ico(r.id) + ' +' + r.price + ' ⭐', 2200); render(); }
  K.show = function () { if (K.open) return; K.open = true; G.setStick(0, 0); render(); $('kitchenPanel').hidden = false; };
  K.close = function () { K.open = false; $('kitchenPanel').hidden = true; G.updateButtons(true); };
  $('kitClose').addEventListener('click', K.close);
  return K;
};
