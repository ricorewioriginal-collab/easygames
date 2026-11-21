/* Senderwahl als einfache Liste (ein Bedienkonzept für Handy, PC, TV und Controller): die 13 eigenen Sender,
   eine eigene Stream-Adresse und „Radio aus“. Öffnet sich über den Radio-Knopf oder das Senderfeld beim Fahren. */
import type { Game } from './Game';
import { STATIONS, stationOf } from '../engine/Radio';
import { hints, toast, type Item } from '../ui/ui';
import { sfx } from '../engine/Audio';

const panel = (body: string) => `<div class="col"><div class="panel"><h3>📻 Radio</h3>${body}<div class="slot"></div></div></div>`;
const okUrl = (u: string) => /^https?:\/\/[^\s]+$/i.test(u);

export function radioMenu(g: Game, pick: (i: number) => void) {
  const s = g.save.data, cur = stationOf(s.flags.radio).id, close = () => { g.closeMenu(); g.touch.show(true); };
  const choose = (i: number) => { close(); pick(i); };
  g.touch.show(false);
  g.openMenu(panel('<p>Sender wählen. Unterwegs wechselst du auch mit Q/R oder LB/RB.</p>'), STATIONS.map((st, i): Item => ({
    icon: st.icon, label: st.name + (st.id === cur ? ' ✓' : ''),
    sub: st.id === 'eigen' ? (s.flags.radioUrl ? String(s.flags.radioUrl) : 'Adresse eintragen') : st.sub,
    fn: () => { if (st.id === 'eigen' && !s.flags.radioUrl) { urlMenu(g, () => choose(i), () => radioMenu(g, pick)); return; } choose(i); },
  })).concat(<Item[]>[
    { icon: '✏️', label: 'Eigene Stream-Adresse ändern', sub: 'z. B. https://…/stream.mp3', fn: () => urlMenu(g, () => choose(STATIONS.findIndex((x) => x.id === 'eigen')), () => radioMenu(g, pick)) },
    { icon: '←', label: 'Schließen', fn: close },
  ]), close, '');
  const sel = STATIONS.findIndex((x) => x.id === cur); if (sel > 0) (g as unknown as { menu: { select(i: number, snd?: boolean): void } | null }).menu?.select(sel, false);
  hints([['dpad', 'Wählen'], ['a', 'Einschalten'], ['b', 'Zurück']]);
}

function urlMenu(g: Game, done: () => void, back: () => void) {
  const s = g.save.data;
  g.openMenu(panel(`<p>Adresse eines eigenen Webradio-Streams (MP3 oder AAC, beginnt mit https://).</p><input type="url" id="rUrl" class="oIn" style="width:100%;font-size:16px" autocomplete="off" spellcheck="false" placeholder="https://…" value="${String(s.flags.radioUrl || '').replace(/"/g, '&quot;')}" aria-label="Stream-Adresse">`), [
    { icon: '💾', label: 'Speichern und hören', fn: () => {
      const v = (document.getElementById('rUrl') as HTMLInputElement | null)?.value.trim() || '';
      if (!okUrl(v)) { sfx('miss'); toast('Bitte eine Adresse mit http:// oder https:// eintragen.'); return; }
      s.flags.radioUrl = v; g.save.write(); sfx('ok'); done();
    } },
    { icon: '🗑️', label: 'Adresse löschen', disabled: !s.flags.radioUrl, fn: () => { delete s.flags.radioUrl; g.save.write(); back(); } },
    { icon: '←', label: 'Zurück', fn: back },
  ], back, '');
  setTimeout(() => (document.getElementById('rUrl') as HTMLInputElement | null)?.focus(), 50);
}
