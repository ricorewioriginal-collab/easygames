/* Funkhaus – Eingabe-Oberflächen für Menschen (Tagesplan, Nominierung, Aufgabe). Gleiche Darstellung am Gastgeber und am Handy.
   renderAsk(root, ask, pub, send): ask aus views.js, pub = publicState, send(v) liefert die Antwort als Zahlenliste. */
import { avatar } from './avatars.js';
import { mountTask, TASK_INFO } from './games.js';
import { SFX } from './audio.js';
import { PAIR } from './engine.js';
export const ACT = { talk: ['💬', 'Plaudern', 'Sympathie aufbauen'], cook: ['🍳', 'Kochen', 'Gute Stimmung, Hörer mögen es'], alliance: ['🤝', 'Allianz', 'Bündnis – braucht Sympathie'], tease: ['😜', 'Sticheln', 'Schwächt das Ziel, riskant bei Hörern'], secret: ['🤫', 'Geheimnis', 'Starke Bindung – nur bei Sympathie'], rumor: ['🗣️', 'Gerücht', 'Ziel verliert Hörer – kann auffliegen'], show: ['🎤', 'Auftritt', 'Hörer gewinnen'], relax: ['🧘', 'Entspannen', 'Stimmung heben'] };
export const ACT_ORDER = ['talk', 'cook', 'alliance', 'tease', 'secret', 'rumor', 'show', 'relax'];
export const FACE = ['😡', '🙁', '😐', '🙂', '😍'];
const esc = s => String(s == null ? '' : s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
export const starsTxt = n => '★'.repeat(n) + '☆'.repeat(5 - n);
export const av = (c, s = 44) => `<img class="av" src="${avatar(c.look, s * 2)}" width="${s}" height="${s}" alt="">`;
const person = (pub, o, extra = '') => { const c = pub.cast[o.i]; return `<button class="pp" data-i="${o.i}" ${extra}>${av(c, 46)}<b>${esc(c.n)}</b><small>${FACE[o.heart]} ${o.ally ? '🤝' : ''}${o.immune ? '🛡️' : ''}</small><em>${starsTxt(o.stars)}</em></button>`; };

export function renderAsk(root, ask, pub, send) {
  let mount = null; const clear = () => { if (mount) { mount.destroy(); mount = null; } };
  if (ask.kind === 'plan') {
    const plan = []; let sel = null;
    const draw = () => {
      const s = plan.length;
      if (s >= ask.slots) { root.innerHTML = `<div class="ph"><b>Dein Tagesplan</b><span>Tag ${ask.day} · Woche ${ask.week}</span></div><div class="plist">${plan.map((p, k) => `<div class="pl"><i>${k + 1}</i><span>${ACT[p.a][0]} ${ACT[p.a][1]}${p.t >= 0 ? ' mit <b>' + esc(pub.cast[p.t].n) + '</b>' : ''}</span></div>`).join('')}</div><div class="row"><button class="btn ghost" id="pBack">↶ Ändern</button><button class="btn green" id="pOk">Los! ▶</button></div>`; root.querySelector('#pBack').onclick = () => { SFX.click(); plan.pop(); sel = null; draw(); }; root.querySelector('#pOk').onclick = () => { SFX.click(); send(plan.flatMap(p => [ACT_ORDER.indexOf(p.a), p.t])); }; return; }
      if (sel && PAIR[sel]) { root.innerHTML = `<div class="ph"><b>${ACT[sel][0]} ${ACT[sel][1]} – mit wem?</b><span>Aktion ${s + 1}/${ask.slots}</span></div><div class="pgrid">${ask.others.map(o => person(pub, o)).join('')}</div><button class="btn ghost small" id="pCancel">← andere Aktion</button>`; root.querySelectorAll('.pp').forEach(b => b.onclick = () => { SFX.click(); plan.push({ a: sel, t: +b.dataset.i }); sel = null; draw(); }); root.querySelector('#pCancel').onclick = () => { sel = null; draw(); }; return; }
      root.innerHTML = `<div class="ph"><b>Was tust du? Aktion ${s + 1}/${ask.slots}</b><span>Stimmung ${ask.mood}% · Hörer ${starsTxt(ask.stars)}</span></div><div class="agrid">${ACT_ORDER.map(a => `<button class="ab" data-a="${a}"><i>${ACT[a][0]}</i><b>${ACT[a][1]}</b><small>${ACT[a][2]}</small></button>`).join('')}</div>${plan.length ? '<button class="btn ghost small" id="pBack">↶ Zurück</button>' : ''}`;
      root.querySelectorAll('.ab').forEach(b => b.onclick = () => { SFX.click(); const a = b.dataset.a; if (PAIR[a]) { sel = a; draw(); } else { plan.push({ a, t: -1 }); draw(); } });
      const bk = root.querySelector('#pBack'); if (bk) bk.onclick = () => { plan.pop(); draw(); };
    };
    draw(); return { destroy: clear };
  }
  if (ask.kind === 'nom') {
    const picks = []; const draw = () => {
      root.innerHTML = `<div class="ph red"><b>🔴 Beichtstuhl – Wen nominierst du?</b><span>Geheim · ${picks.length}/2</span></div><div class="hint">1. Wahl = 2 Punkte, 2. Wahl = 1 Punkt.${ask.immuneIds.length ? ' 🛡️ Immune sind nicht wählbar.' : ''}</div><div class="pgrid">${ask.others.map(o => person(pub, o, picks.includes(o.i) ? 'class="pp sel"' : '')).join('')}</div><div class="row">${picks.length ? '<button class="btn ghost small" id="nBack">↶ Zurück</button>' : ''}<button class="btn red" id="nOk" ${picks.length < 2 ? 'disabled' : ''}>Abgeben</button></div>`;
      root.querySelectorAll('.pp').forEach(b => b.onclick = () => { const i = +b.dataset.i; SFX.click(); const k = picks.indexOf(i); if (k >= 0) picks.splice(k, 1); else if (picks.length < 2) picks.push(i); draw(); });
      const bk = root.querySelector('#nBack'); if (bk) bk.onclick = () => { picks.pop(); draw(); }; root.querySelector('#nOk').onclick = () => { if (picks.length === 2) { SFX.drum(); send(picks.slice()); } };
    }; draw(); return { destroy: clear };
  }
  if (ask.kind === 'task') {
    const I = TASK_INFO[ask.task]; root.innerHTML = `<div class="ph"><b>🏆 Wochenaufgabe</b><span>${I.t}</span></div><div class="hint">${I.d}</div><button class="btn green" id="tGo">Los geht's!</button>`;
    root.querySelector('#tGo').onclick = () => { SFX.click(); root.innerHTML = '<div id="tkRoot"></div>'; mount = mountTask(root.querySelector('#tkRoot'), ask.task, ask.seed, sc => { clear(); root.innerHTML = `<div class="ph"><b>Dein Ergebnis</b></div><div class="bigt">${sc} Punkte</div><div class="hint">Warte auf die anderen …</div>`; send([sc]); }); };
    return { destroy: clear };
  }
  return { destroy: clear };
}
