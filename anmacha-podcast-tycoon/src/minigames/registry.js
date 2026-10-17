/* Minispiel-Register: jedes Minispiel ist ein Datenobjekt mit reiner Spiellogik (init/update/input/result/bot)
   und einer Darstellung (draw2d bzw. setup3d/draw3d). Die Logik läuft ohne DOM und wird in Node getestet. */
(function (root) {
  'use strict';
  const PT = root.PT = root.PT || {};
  const defs = {}, order = [];
  const GROUPS = {
    produktion: { name: 'Produktion', icon: '🎚️' },
    tec: { name: 'TEC Trouble', icon: '🔧' },
    quiz: { name: 'Die verrückte Quizshow', icon: '❓' },
    roadtrip: { name: 'Roadtrip', icon: '🚐' },
    party: { name: 'Party', icon: '🎉' },
    feelgood: { name: 'Fan & Feelgood', icon: '💛' }
  };
  const REQUIRED = ['id', 'group', 'name', 'icon', 'short', 'rules', 'controls', 'init', 'update', 'input', 'result', 'bot'];
  PT.MG = {
    GROUPS,
    DIFF: ['Locker', 'Standard', 'Profi'],
    W: 960, H: 540, // logische Spielfläche
    define(def) {
      REQUIRED.forEach(k => { if (def[k] == null) throw new Error('Minispiel ' + (def.id || '?') + ': Feld ' + k + ' fehlt'); });
      if (!GROUPS[def.group]) throw new Error('Minispiel ' + def.id + ': unbekannte Gruppe ' + def.group);
      if (defs[def.id]) throw new Error('Minispiel ' + def.id + ' doppelt');
      def.render = def.render || '2d';
      def.touch = def.touch || ['left', 'right', 'up', 'down', 'a'];
      defs[def.id] = def; order.push(def.id);
      return def;
    },
    get: id => defs[id],
    list: () => order.map(id => defs[id]),
    /** Status-Helfer für Spiele: beendet das Spiel genau einmal. */
    finish(st, won) { if (st.status === 'playing') { st.status = won ? 'won' : 'lost'; (st.fx = st.fx || []).push(won ? 'win' : 'lose'); } },
    fx(st, name) { (st.fx = st.fx || []).push(name); },
    /** Führt ein Spiel ohne Darstellung mit dem eingebauten Bot aus (Tests, Selbsttest). */
    simulate(id, opts, goal, maxSeconds) {
      const d = defs[id]; const st = d.init(Object.assign({ difficulty: 1, seed: 1234, players: [{ name: 'Test' }] }, opts || {}));
      const dt = 1 / 60, max = (maxSeconds || 900) * 60; let i = 0;
      while (st.status === 'playing' && i < max) {
        const acts = d.bot(st, goal) || [];
        for (const a of acts) { d.input(st, a); if (st.status !== 'playing') break; }
        if (st.status === 'playing') d.update(st, dt);
        st.fx && (st.fx.length = 0);
        i++;
      }
      return { state: st, result: d.result(st), steps: i };
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = PT.MG;
})(typeof window !== 'undefined' ? window : globalThis);
