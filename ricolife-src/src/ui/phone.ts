// Handy (Jobs, Kontakte, Feier, Familie, Wohnen, Konto, Laden) und Stadtkarte.
import { CAREERS } from '../data/careers';
import { LOTS, lotById, APARTMENTS, DISTRICTS } from '../data/lots';
import { HOUSEHOLDS } from '../data/people';
import { ROADS_H, ROADS_V, WATER_X } from '../world/map';
import { canJoin, joinCareer } from '../sim/career';
import { adopt } from '../sim/life';
import { throwParty, startVisit, isTownie } from '../sim/npcs';
import { payBills } from '../sim/interactions';
import { freeHomeLots, lotPrice, moveHousehold, setActiveHousehold } from '../sim/setup';
import { buyItem, call, SHOP_ITEMS } from '../sim/phone';
import { fmtMoney } from '../core/util';
import { fmtTime } from '../core/clock';
import type { AppApi } from './api';
import { h, modal, btn, toast, clear, confirmDlg } from './dom';

export function openPhone(app: AppApi, appId?: string): void {
  const g = app.g;
  const s = g.active;
  if (!s) return;
  const body = h('div', { class: 'phone' });
  const m = modal({ title: 'Handy', icon: '📱', body });
  const home = (): void => {
    clear(body);
    const apps: [string, string, string, boolean][] = [
      ['jobs', '💼', 'Jobs', !app.isGuest],
      ['contacts', '👥', 'Kontakte', true],
      ['party', '🎉', 'Feier', !app.isGuest],
      ['shop', '🛍️', 'Laden', true],
      ['family', '🧸', 'Familie', !app.isGuest],
      ['homes', '🏡', 'Wohnen', !app.isGuest],
      ['money', '💶', 'Konto', !app.isGuest],
      ['map', '🗺️', 'Karte', true],
    ];
    body.append(h('p', { class: 'muted', style: 'text-align:center' }, `${s.first} · ${g.clock.timeStr()}`), h('div', { class: 'applist' }, apps.filter((a) => a[3]).map(([id, ic, name]) => h('button', { class: 'app', onclick: () => open(id) }, h('span', null, ic), name))));
  };
  const back = (): HTMLElement => btn('← Zurück', home, 'small ghost');
  const open = (id: string): void => {
    clear(body);
    body.appendChild(back());
    if (id === 'map') {
      m.close();
      app.openMap();
      return;
    }
    if (id === 'jobs') {
      body.appendChild(h('h3', null, 'Stellenangebote in Lindenhafen'));
      for (const c of CAREERS) {
        const ok = canJoin(g, s, c.id);
        const lv = c.levels[0]!;
        body.appendChild(h('div', { class: 'card col', style: 'margin:6px 0' },
          h('b', null, `${c.icon} ${c.name}${c.active ? ' ⭐' : ''}`),
          h('small', { class: 'muted' }, c.desc),
          h('small', null, `Einstieg: ${lv.title} · ${lv.pay} RT/Std. · ab ${String(lv.start).padStart(2, '0')}:00 · ${g.lotName(c.lot)}${c.active ? ' · Schicht vor Ort spielbar' : ''}`),
          btn(ok === true ? 'Bewerben' : ok, () => {
            if (s.career) confirmDlg('Job wechseln?', `${s.first} kündigt den aktuellen Job.`, 'Wechseln', () => { joinCareer(g, s, c.id); home(); });
            else {
              joinCareer(g, s, c.id);
              home();
            }
          }, ok === true ? 'small primary' : 'small dis', ok === true ? {} : { disabled: true }),
        ));
      }
    } else if (id === 'contacts') {
      const known = g.known(s).filter((o) => o.hh !== s.hh).sort((a, b) => (g.peekRel(s.id, b.id)?.f ?? 0) - (g.peekRel(s.id, a.id)?.f ?? 0));
      if (!known.length) body.appendChild(h('p', { class: 'muted' }, 'Noch keine Kontakte. Lerne Leute in der Stadt kennen!'));
      const list = h('div', { class: 'list' });
      for (const o of known.slice(0, 40)) {
        const r = g.peekRel(s.id, o.id)!;
        list.appendChild(h('div', { class: 'li' }, h('div', { class: 'grow' }, h('b', null, `${o.first} ${o.last}`), h('div', null, h('small', { class: 'muted' }, `Freundschaft ${Math.round(r.f)}${r.r ? ` · Romantik ${Math.round(r.r)}` : ''}${o.away ? ' · gerade unterwegs' : ''}`))),
          btn('📞', () => { call(g, s, o.id); toast(`${s.first} ruft ${o.first} an.`, '📞'); m.close(); }, 'small icon', { 'aria-label': `${o.first} anrufen` }),
          !app.isGuest && g.hh?.lot ? btn('🚪', () => {
            const ok = isTownie(g, o) && startVisit(g, o, g.hh!.lot!, 180);
            toast(ok ? `${o.first} kommt vorbei.` : `${o.first} hat gerade keine Zeit.`, ok ? '🚪' : '🙁', ok ? 'good' : 'info');
            m.close();
          }, 'small icon', { 'aria-label': `${o.first} einladen` }) : null,
        ));
      }
      body.appendChild(list);
    } else if (id === 'party') {
      body.append(h('h3', null, '🎉 Feier geben'), h('p', null, 'Lade bis zu sechs Bekannte für drei Stunden zu dir ein. Kosten: 80 RT für Snacks und Deko.'), btn('Feier starten', () => {
        const r = throwParty(g);
        toast(r === true ? 'Die Gäste sind unterwegs!' : r, r === true ? '🎉' : '⚠️', r === true ? 'good' : 'warn');
        if (r === true) m.close();
      }, 'primary'));
    } else if (id === 'shop') {
      body.appendChild(h('h3', null, 'Lieferdienst „Hafenbote“'));
      for (const it of SHOP_ITEMS) body.appendChild(h('div', { class: 'card row', style: 'margin:4px 0' }, h('span', { style: 'font-size:1.5em' }, it.icon), h('div', { class: 'grow' }, h('b', null, it.name), h('div', null, h('small', { class: 'muted' }, fmtMoney(it.price)))), btn('Kaufen', () => {
        const r = buyItem(g, s, it.id);
        toast(r === true ? `${it.name} ist im Inventar.` : r, r === true ? it.icon : '⚠️', r === true ? 'good' : 'warn');
        if (r === true) app.sfx('coin');
      }, 'small')));
    } else if (id === 'family') {
      body.append(h('h3', null, '🧸 Adoption'), h('p', null, 'Ein Kind adoptieren kostet 1.000 RT. Der Haushalt darf höchstens 8 Personen haben.'));
      for (const [age, name] of [['baby', 'Baby'], ['toddler', 'Kleinkind'], ['child', 'Kind'], ['teen', 'Jugendliche:n']] as const)
        body.appendChild(btn(`${name} adoptieren`, () => {
          const r = adopt(g, g.activeHh!, age);
          if (r !== true) toast(r, '⚠️', 'warn');
          else m.close();
        }, 'small'));
      body.append(h('h3', { style: 'margin-top:12px' }, '👪 Haushalt wechseln'), h('p', { class: 'muted' }, 'Spiele eine andere Familie in Lindenhafen. Die bisherige lebt selbstständig weiter.'));
      for (const hh of g.hhs.values()) {
        if (hh.id === g.activeHh || !hh.members.length) continue;
        const premade = HOUSEHOLDS.some((x) => x.id === hh.id);
        body.appendChild(h('div', { class: 'card row', style: 'margin:4px 0' }, h('div', { class: 'grow' }, h('b', null, hh.name), h('div', null, h('small', { class: 'muted' }, `${g.members(hh.id).map((x) => x.first).join(', ')} · ${g.lotName(hh.lot ?? '')}${premade ? '' : ' · eigene Familie'}`))), btn('Spielen', () => {
          setActiveHousehold(g, hh.id);
          m.close();
          app.select(g.activeSim ?? '');
          toast(`Du spielst jetzt ${hh.name}.`, '👪', 'good');
        }, 'small')));
      }
    } else if (id === 'homes') {
      const hh = g.hh!;
      body.append(h('h3', null, '🏡 Umziehen'), h('p', { class: 'muted' }, `Aktuelles Zuhause: ${g.lotName(hh.lot ?? '')}${hh.lot ? ` (Wert ${fmtMoney(lotPrice(g, hh.lot))}, Verkauf zu 85 %)` : ''}`));
      for (const id2 of freeHomeLots(g)) {
        const L = lotById(id2)!;
        body.appendChild(h('div', { class: 'card col', style: 'margin:4px 0' }, h('b', null, L.name), h('small', { class: 'muted' }, `${DISTRICTS[L.district].name} · ${L.w}×${L.d} m · ${L.desc}`), h('div', { class: 'row' }, h('b', { class: 'grow' }, fmtMoney(lotPrice(g, id2))), btn('Ansehen', () => { m.close(); app.focusOn(L.x + L.w / 2, L.z + L.d / 2); }, 'small'), btn('Kaufen & einziehen', () => {
          confirmDlg('Umziehen?', `${hh.name} zieht nach ${L.name}. Das alte Zuhause wird verkauft.`, 'Umziehen', () => {
            const r = moveHousehold(g, hh.id, id2);
            toast(r === true ? `Willkommen im neuen Zuhause: ${L.name}!` : r, r === true ? '🏡' : '⚠️', r === true ? 'good' : 'warn');
            if (r === true) {
              m.close();
              app.focusOn(L.x + L.w / 2, L.z + L.d / 2, true);
            }
          });
        }, 'small primary'))));
      }
    } else if (id === 'money') {
      const hh = g.hh!;
      body.append(h('h3', null, `💶 Konto: ${fmtMoney(hh.funds)}`));
      if (hh.bills) body.appendChild(h('div', { class: 'card row' }, h('div', { class: 'grow' }, h('b', null, `Offene Rechnung: ${fmtMoney(hh.bills.amount)}`), h('div', null, h('small', { class: hh.powerOff ? '' : 'muted' }, hh.powerOff ? '⚠️ Strom ist abgestellt!' : `Fällig: Tag ${Math.floor(hh.bills.due / 1440) + 1}`))), btn('Bezahlen', () => {
        if (!payBills(g, hh.id)) toast('Nicht genug Geld.', '⚠️', 'warn');
        open('money');
      }, 'small primary')));
      body.appendChild(h('div', { class: 'list' }, hh.ledger.slice(0, 30).map((t) => h('div', { class: 'kv' }, h('span', null, h('small', { class: 'muted' }, `Tag ${Math.floor(t.m / 1440) + 1} ${fmtTime(t.m % 1440)} · `), t.t), h('b', { style: `color:${t.a >= 0 ? 'var(--good)' : 'var(--bad)'}` }, `${t.a >= 0 ? '+' : ''}${fmtMoney(t.a)}`)))));
    }
  };
  if (appId) open(appId);
  else home();
}

export function openMap(app: AppApi): void {
  const g = app.g;
  const map = h('div', { class: 'map', role: 'img', 'aria-label': 'Stadtkarte von Lindenhafen' });
  const pct = (v: number, total: number): string => `${(v / total) * 100}%`;
  for (const [a, b] of ROADS_H) map.appendChild(h('div', { class: 'road', style: `left:0;width:${pct(144, 160)};top:${pct(a, 100)};height:${pct(b - a, 100)}` }));
  for (const [a, b] of ROADS_V) map.appendChild(h('div', { class: 'road', style: `top:0;height:100%;left:${pct(a, 160)};width:${pct(b - a, 160)}` }));
  map.appendChild(h('div', { class: 'water', style: `top:0;bottom:0;left:${pct(WATER_X, 160)};right:0` }));
  const info = h('div', { class: 'card', style: 'margin-top:8px;min-height:60px' }, h('small', { class: 'muted' }, 'Tippe auf ein Grundstück.'));
  const color = (k: string, v: string): string => (k === 'home' ? '#e9d9b8' : v === 'park' || v === 'playground' ? '#8fc57a' : v === 'pier' ? '#c9a77a' : '#9fd0e0');
  const hhLot = g.hh?.lot;
  for (const L of LOTS) {
    const el = h('button', { class: 'lot', style: `left:${pct(L.x, 160)};top:${pct(L.z, 100)};width:${pct(L.w, 160)};height:${pct(L.d, 100)};background:${color(L.kind, L.venue)};${L.id === hhLot ? 'outline:3px solid #e5b16b;' : ''}`, 'aria-label': L.name }, L.name.length > 14 ? L.name.split(' ')[0] : L.name);
    el.addEventListener('click', () => {
      clear(info).append(
        h('b', null, L.name),
        h('div', null, h('small', { class: 'muted' }, `${DISTRICTS[L.district].name}${L.open ? ` · geöffnet ${L.open[0]}–${L.open[1] % 24} Uhr` : ''}`)),
        h('p', null, L.desc),
        h('div', { class: 'row' },
          btn('🎥 Ansehen', () => { mm.close(); app.focusOn(L.x + L.w / 2, L.z + L.d / 2); }, 'small'),
          g.active && !g.active.away ? btn('🚶 Hingehen', () => {
            mm.close();
            app.command(g.activeSim!, { kind: 'self' }, { def: 'goTo', label: '', icon: '', group: '', avail: true, data: { lot: L.id } });
          }, 'small primary') : null,
        ),
      );
    });
    map.appendChild(el);
  }
  for (const a of Object.values(APARTMENTS)) map.appendChild(h('div', { class: 'lot', style: `left:${pct(a.box[0], 160)};top:${pct(a.box[1], 100)};width:${pct(a.box[2], 160)};height:${pct(a.box[3], 100)};background:#c7b9a6;cursor:default` }, a.name));
  const me = g.active;
  if (me && !me.away) map.appendChild(h('div', { class: 'me', style: `left:${pct(me.x, 160)};top:${pct(me.z, 100)}` }));
  const mm = modal({ title: 'Lindenhafen', icon: '🗺️', body: h('div', null, map, info), wide: true });
}
