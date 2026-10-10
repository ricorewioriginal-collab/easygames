/* Mach mich aus! – Eingabe-Oberflächen (Lampe entscheiden, Quiz, Talent, Joker, Wahl). Gleich am Gastgeber und am Handy.
   renderAsk(root, ask, send): send(v) liefert eine Zahlenliste. */
import { avatar } from './avatars.js';
import { TAGINFO, STYLEINFO } from './content.js';
import { mountTalent } from './games.js';
import { SFX } from './audio.js';
export const esc = s => String(s == null ? '' : s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
export const tagChip = (t, cls = '') => `<span class="chip tg ${cls}">${TAGINFO[t][0]} ${esc(TAGINFO[t][1])}</span>`;
export const styleChip = s => `<span class="chip tg">${STYLEINFO[s][0]} ${esc(STYLEINFO[s][1])}</span>`;
export const av = (p, s = 44) => `<img class="av" src="${avatar(p.look, s * 2)}" width="${s}" height="${s}" alt="">`;
const heartsOf = e => '♥'.repeat(Math.max(0, Math.min(5, Math.round(e / 20)))) + '♡'.repeat(5 - Math.max(0, Math.min(5, Math.round(e / 20))));
/** Kandidatenkarte mit allem, was bisher enthüllt wurde */
export function candCard(c, rev) {
  const r = rev || { style: null, likes: [], nogos: [], talent: 0, claims: [] }; const likes = [0, 1, 2].map(i => (r.likes[i] ? tagChip(r.likes[i]) : '<span class="chip q">❓</span>')).join('');
  return `<div class="cand"><div class="ct">${av(c, 54)}<div><b>${esc(c.n)}</b><small>${c.age ? c.age + ' · ' : ''}${esc(c.job || '')}</small></div><div class="talent" title="Talent">${r.talent ? '🎭 ' + r.talent + '/12' : ''}</div></div><div class="cr"><span class="cl">Stil</span>${r.style ? styleChip(r.style) : '<span class="chip q">❓</span>'}</div><div class="cr"><span class="cl">Mag</span>${likes}</div><div class="cr"><span class="cl">Mag nicht</span>${r.nogos.length ? r.nogos.map(t => tagChip(t, 'no')).join('') : '<span class="chip q">❓</span>'}</div></div>`;
}
export function renderAsk(root, ask, send) {
  let mount = null; const clear = () => { if (mount) { mount.destroy(); mount = null; } };
  if (ask.kind === 'lamp') {
    const ans = new Array(ask.items.length).fill(-1); const draw = () => {
      root.innerHTML = `<div class="ph"><b>💡 Deine Lampe</b><span>${esc(ask.phaseTxt)}</span></div>` + ask.items.map((it, i) => `<div class="lamprow ${ans[i] >= 0 ? 'done' : ''}"><div class="lh">${av(it.me, 38)}<b>${esc(it.me.n)}</b><span class="est" title="Wie gut passt er/sie zu dir?">${heartsOf(it.est)}</span></div><div class="typ"><span class="cl">Dein Typ</span>${it.me.styles.map(styleChip).join('')}${it.me.likes.map(t => tagChip(t)).join('')}${it.me.nogos.map(t => tagChip(t, 'no')).join('')}</div>${ans[i] < 0 ? `<div class="row2"><button class="btn green" data-i="${i}" data-v="1">💡 Bleibt AN</button><button class="btn red" data-i="${i}" data-v="0">🌑 AUS</button></div>` : `<div class="info">${ans[i] ? '💡 Licht bleibt an' : '🌑 Licht aus'} ✔</div>`}</div>`).join('');
      root.querySelectorAll('button[data-i]').forEach(b => b.onclick = () => { ans[+b.dataset.i] = +b.dataset.v; b.dataset.v === '0' ? SFX.swoosh() : SFX.click(); if (ans.every(x => x >= 0)) { send(ans.slice()); } draw(); });
    }; draw(); return { destroy: clear };
  }
  if (ask.kind === 'quiz') {
    const pick = []; const draw = () => { const q = pick.length; if (q >= ask.qs.length) return; const Q = ask.qs[q]; root.innerHTML = `<div class="ph"><b>🎤 Frage ${q + 1}/${ask.qs.length}</b><span>Du bist dran, ${esc(ask.me)}</span></div><div class="qq">${esc(Q.q)}</div><div class="qa">${Q.a.map((a, i) => { const truth = ask.likes.includes(a.tag); return `<button class="qb ${truth ? '' : 'lie'}" data-i="${i}"><b>${esc(a.t)}</b><small>${TAGINFO[a.tag][0]} ${esc(TAGINFO[a.tag][1])} · ${truth ? '✔ stimmt' : '⚠ geflunkert'}</small></button>`; }).join('')}</div><div class="hint">Flunkern kann Lampen anlassen – beim Date fliegt es aber auf (−12 %).</div>`; root.querySelectorAll('.qb').forEach(b => b.onclick = () => { SFX.click(); pick.push(+b.dataset.i); if (pick.length >= ask.qs.length) send(pick.slice()); else draw(); }); }; draw(); return { destroy: clear };
  }
  if (ask.kind === 'talent') { root.innerHTML = `<div class="ph"><b>🎭 Dein Talent</b><span>${esc(ask.me)}</span></div><div class="hint">Zeig dein Gefühl für den Takt – das beeindruckt die Pulte.</div><button class="btn green" id="tGo">Bühne frei!</button>`; root.querySelector('#tGo').onclick = () => { SFX.click(); root.innerHTML = '<div id="tkRoot"></div>'; mount = mountTalent(root.querySelector('#tkRoot'), sc => { clear(); root.innerHTML = `<div class="bigt">${sc} / 12</div><div class="hint">Beifall! Die Pulte denken nach …</div>`; send([sc]); }); }; return { destroy: clear }; }
  if (ask.kind === 'joker') {
    root.innerHTML = `<div class="ph"><b>🔌 Anmach-Joker</b><span>einmal pro Runde</span></div><div class="hint">Schalte eine ausgemachte Lampe wieder an – vielleicht war es ein Irrtum!</div><div class="pgrid">${ask.off.map(o => `<button class="pp" data-k="${o.k}">${av(o, 44)}<b>${esc(o.n)}</b><small>${esc(o.job)}</small></button>`).join('')}</div><button class="btn ghost" id="jNo">Kein Joker</button>`;
    root.querySelectorAll('.pp').forEach(b => b.onclick = () => { SFX.ding(); send([+b.dataset.k]); }); root.querySelector('#jNo').onclick = () => { SFX.click(); send([-1]); }; return { destroy: clear };
  }
  if (ask.kind === 'choose') {
    let sel = -1; const draw = () => { root.innerHTML = `<div class="ph"><b>💘 Wen nimmst du mit?</b><span>${ask.on.length} Lampen an</span></div><div class="pgrid">${ask.on.map(o => `<button class="pp ${sel === o.k ? 'sel' : ''}" data-k="${o.k}">${av(o, 46)}<b>${esc(o.n)}</b><small>${o.age} · ${esc(o.job)}</small><em>${TAGINFO[o.hint][0]} ${esc(TAGINFO[o.hint][1])}</em></button>`).join('')}</div><div class="row"><button class="btn ghost small" id="cAlone">Allein gehen</button><button class="btn green" id="cOk" ${sel < 0 ? 'disabled' : ''}>Das Date! ▶</button></div>`; root.querySelectorAll('.pp').forEach(b => b.onclick = () => { SFX.click(); sel = +b.dataset.k; draw(); }); root.querySelector('#cAlone').onclick = () => { send([-1]); }; root.querySelector('#cOk').onclick = () => { if (sel >= 0) { SFX.jingle(); send([sel]); } }; }; draw(); return { destroy: clear };
  }
  return { destroy: clear };
}
