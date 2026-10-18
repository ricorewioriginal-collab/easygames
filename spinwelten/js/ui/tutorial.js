/* Spinwelten 3D – Interaktives Tutorial (ca. 5–8 Minuten), jederzeit überspringbar.
 * Ablauf: Story → Drehen → Belohnung nutzen (Bauen) → Schutzorb → Sturm auf einen Computer-Spieler → Reparieren → Truhe/erste Karte
 * → Schatzexpedition → erste Insel fertig. Einzelne Spin-Ergebnisse sind vorbereitet und im Protokoll als „Tutorial“ markiert. */
(function (SW) {
  'use strict';
  const L = (de, en) => SW.L(de, en);
  const A = () => SW.App, G = () => SW.App.g, UI = () => SW.UI;
  const STEPS = [
    { id: 'story' },
    { id: 'spin1', q: ['three:sun'], view: 'machine', hl: '#spinBtn', say: () => L('Zieh am Hebel! Tippe auf „Drehen“ (Leertaste oder A am Controller). Ein Spin kostet 1 Energie ⚡.', 'Pull the lever! Tap “Spin” (Space or A on a controller). A spin costs 1 energy ⚡.'), on: 'spinDone' },
    { id: 'village', view: 'machine', hl: '[data-tab=village]', say: () => L('Drei Sonnen – Münzen! Damit bauen wir. Wechsle ins Dorf.', 'Three suns – coins! We build with those. Switch to the village.'), on: 'view:village' },
    { id: 'build', view: 'village', hl: '.bcard', say: () => L('Tippe auf ein Bauwerk, um es auszubauen. Jedes hat fünf Stufen.', 'Tap a building to upgrade it. Each one has five stages.'), on: 'build' },
    { id: 'spin2', q: ['three:orb'], view: 'village', hl: '[data-tab=machine]', say: () => L('Klasse! Zurück zur Maschine und noch einmal drehen.', 'Great! Back to the machine and spin again.'), on: 'spinDone', also: 'view:machine' },
    { id: 'spin3', q: ['three:storm'], view: 'machine', hl: '#spinBtn', say: () => L('Ein Schutzorb 🛡️! Er wehrt einen Sturm auf deine Insel ab. Dreh weiter – ich spüre Sturmrunen …', 'A shield orb 🛡️! It blocks one storm on your island. Keep spinning – I sense storm runes …'), on: 'attack' },
    { id: 'repair', view: 'village', hl: '.bcard.dmg', say: () => L('Oh! Pip 🤖 hat zurückgepustet und ein Bauwerk beschädigt. Tippe es an, um es zu reparieren.', 'Oh! Pip 🤖 blew back and damaged a building. Tap it to repair.'), on: 'repair' },
    { id: 'chest', q: ['three:relic'], view: 'machine', hl: '#spinBtn', say: () => L('Repariert! Drei Relikte bringen eine Truhe mit Sammelkarten. Dreh noch mal!', 'Repaired! Three relics bring a chest with collectible cards. Spin again!'), on: 'chest' },
    { id: 'raid', q: ['three:compass'], view: 'machine', hl: '#spinBtn', say: () => L('Deine erste Karte! Jetzt der Kompass: Dreh, und wir suchen einen Schatz.', 'Your first card! Now the compass: spin, and we go treasure hunting.'), on: 'raid' },
    { id: 'island', view: 'village', hl: '.bcard', say: () => L('Fast geschafft! Baue alle fünf Bauwerke auf Stufe 5 – dann reisen wir zur nächsten Insel. Energie lädt sich von selbst auf.', 'Almost there! Upgrade all five buildings to stage 5 – then we travel to the next island. Energy recharges by itself.'), on: 'island' }
  ];
  const T = {
    active() { const t = G().s.tutorial; return t && !t.done; },
    step() { return STEPS[G().s.tutorial.step] || null; },
    start() {
      const g = G(); if (!g.s.tutorial || g.s.tutorial.done) return;
      if (g.s.tutorial.step === 0) { SW.Flows.story(SW.STORY.intro, () => T.go(1)); return; }
      T.enter();
    },
    go(n) {
      const g = G(), t = g.s.tutorial; t.step = n;
      if (n >= STEPS.length) { T.finish(); return; }
      const st = STEPS[n]; t.queue = (st.q || []).slice();
      A().save(); T.enter();
    },
    enter() {
      const st = T.step(); if (!st) return;
      if (st.id === 'repair') T.prepRepair();
      if (st.view && A().view !== st.view && st.view === 'machine' && st.id !== 'spin2') A().go(st.view);
      T.coach(st.say ? st.say() : '');
      setTimeout(() => T.mark(), 60);
    },
    mark() { const st = T.step(); if (!st || !T.active()) { UI().hl(null); return; } const el = st.hl ? document.querySelector(st.hl) : null; UI().hl(el); },
    // Pip richtet echten (reparierbaren) Schaden an – nur hier im Tutorial, sonst gelten die Schutzregeln
    prepRepair() {
      const g = G(), s = g.s;
      if (s.damaged.some(x => x)) return;
      let b = s.stages.findIndex(x => x > 0); if (b < 0) { s.stages[0] = 1; b = 0; }
      s.damaged[b] = true; g.hist({ kind: 'attack', by: 'pip', bot: true, w: s.island, b, blocked: false, res: 'damaged', tut: true });
      A().go('village'); A().after();
    },
    after(ev) {
      if (!T.active()) return;
      const st = T.step(); if (!st) return;
      if (ev === st.on || ev === st.also) {
        if (st.id === 'spin2' && ev === 'view:machine') { T.coach(L('Und jetzt: Drehen!', 'And now: spin!')); UI().hl(document.querySelector('#spinBtn')); return; }
        setTimeout(() => T.go(G().s.tutorial.step + 1), 400);
      }
      if (ev.startsWith('view:')) setTimeout(() => T.mark(), 60);
    },
    coach(text) {
      let c = document.getElementById('coach');
      if (!text) { if (c) c.remove(); return; }
      if (!c) { c = SW.UI.h('div', { id: 'coach' }); document.getElementById('ui').appendChild(c); }
      c.innerHTML = '';
      const p = SW.UI.h('p', null, text);
      const skip = SW.UI.btn(L('Tutorial überspringen', 'Skip tutorial'), () => T.skip(), 'ghost small');
      c.appendChild(SW.UI.h('div', { cls: 'bub', role: 'status' }, [SW.UI.h('img', { src: A().kiviImg(), alt: 'Kivi' }), SW.UI.h('div', null, [p, SW.UI.h('div', { cls: 'row' }, skip)])]));
    },
    skip() {
      UI().dialog({ title: L('Tutorial überspringen?', 'Skip tutorial?'), text: L('Du kannst es später in den Einstellungen neu starten.', 'You can restart it later in the settings.'),
        buttons: [{ label: L('Überspringen', 'Skip'), cls: 'gold', fn: () => T.finish(true) }, { label: L('Weiter lernen', 'Keep learning') }] });
    },
    finish(skipped) {
      const g = G(), t = g.s.tutorial; t.done = true; t.queue = []; t.step = STEPS.length;
      T.coach(''); UI().hl(null); A().save();
      if (!skipped) UI().toast(L('Tutorial geschafft! Ab jetzt bist du Weltenhüter.', 'Tutorial complete! You are a World Keeper now.'));
      g.stat('tutorial');
    },
    restart() { const g = G(); g.s.tutorial = { step: 1, done: false, queue: [] }; T.go(1); },
    // Darf die UI das gerade? (z. B. Dorf nicht vor dem ersten Spin, damit niemand hängen bleibt, ist alles erlaubt)
    STEPS
  };
  SW.Tutorial = T;
})(globalThis.SW = globalThis.SW || {});
