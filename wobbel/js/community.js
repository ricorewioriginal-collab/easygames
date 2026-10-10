/* Wobbel – Community-Level: community/levels.json (Name, Autor, Code) laden, spielen oder im Editor öffnen. */
import { decode } from './editor/codec.js';
import { WORLDS } from './game/worlds.js';
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
export function initCommunity(ctx) {   // ctx: {toast, sfx, play(def, opts), edit(def), back(), home()}
  let cache = null;
  async function load() { if (cache) return cache; const r = await fetch('community/levels.json', { cache: 'no-cache' }); if (!r.ok) throw new Error('HTTP ' + r.status); const list = await r.json(); cache = (Array.isArray(list) ? list : []).flatMap(e => { try { const d = decode(e.code); return [{ id: String(e.id || e.name), name: String(e.name || d.name), author: String(e.author || 'unbekannt'), def: Object.assign({ hint: '' }, d, { name: String(e.name || d.name) }) }]; } catch (x) { return []; } }); return cache; }
  async function open() {
    $('cmDlg').hidden = false; const box = $('cmList'); box.innerHTML = '<p class="info">Lade …</p>';
    try { const list = await load(); box.innerHTML = list.length ? list.map((e, i) => `<div class="my-row"><div class="my-info"><b>${WORLDS[e.def.world] ? WORLDS[e.def.world].emoji : ''} ${esc(e.name)}</b><small>von ${esc(e.author)} · ${e.def.map[0].length}×${e.def.map.length}</small></div><div class="my-btns"><button data-a="play" data-i="${i}" title="Spielen">▶</button><button data-a="edit" data-i="${i}" title="Im Editor öffnen">✏️</button></div></div>`).join('') : '<p class="info">Noch keine Community-Level.</p>';
      box.querySelectorAll('button').forEach(b => b.onclick = () => { ctx.sfx('click'); const e = list[+b.dataset.i]; $('cmDlg').hidden = true; if (b.dataset.a === 'play') ctx.play(e.def, { community: true, onExit: () => { ctx.back(); open(); } }); else ctx.edit(e.def); });
    } catch (e) { box.innerHTML = '<p class="info bad">Die Community-Level konnten nicht geladen werden (offline?).</p>'; }
  }
  $('cmClose').onclick = () => { $('cmDlg').hidden = true; };
  return { open };
}
