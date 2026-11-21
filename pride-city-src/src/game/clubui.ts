/* Menüs zum Club: im Club mit den Besitzer*innen verhandeln und kaufen, den eigenen Club führen (DJ, Preise, Tür, Deko,
   Awareness) und die Clubnacht live spielen – drei Entscheidungen, dann die Abrechnung. Regeln in club.ts. */
import type { Game } from './Game';
import type { InteriorScene } from './InteriorScene';
import type { Item } from '../ui/ui';
import { hints, toast } from '../ui/ui';
import { sfx } from '../engine/Audio';
import { hour } from './life';
import { owns, buy, priceOf, haggle, SELLERS, type Business } from './empire';
import { popOf, setPop, daily } from './manage';
import { DJS, PRICES, DOORS, DECOS, QEVENTS, AWARE_COST, clubOf, setDj, setPrice, setDoor, setDeco, setAware, upcoming, anniversary, momentsFor, runNight, bookNight, nightDone, nightOpen, nightsOf, bestOf, type QEvent } from './club';

const panel = (t: string, body: string) => `<div class="col"><div class="panel"><h3>${t}</h3>${body}<div class="slot"></div></div></div>`;

/** Gespräch mit den Besitzer*innen: kaufen, verhandeln oder später */
export function clubDeal(g: Game, b: Business, sc?: InteriorScene) {
  const s = g.save.data, who = SELLERS[b.poi] || { who: b.name, color: '#ffd23b', hello: b.pitch };
  const close = () => { g.closeMenu(); g.touch.show(true); };
  const offer = () => {
    const price = priceOf(s, b), deal = Number(s.flags['deal_' + b.id]) || 0;
    g.touch.show(false);
    g.openMenu(panel(`${b.icon} ${b.name} kaufen`, `<p>${b.pitch}</p><p>💶 Preis: <b>${price} €</b>${price < b.price ? ` <small>(statt ${b.price} €${deal ? ', Angebot aus der Geschichte' : ''})</small>` : ''}<br>📈 Grundertrag: +${b.daily} € am Tag · 🌈 +${b.rep} Ruf<br>⭐ Nötiger Ruf: ${b.need} (du hast ${s.rep}) · 💰 Du hast ${s.money} €</p>`), [
      { icon: '✍️', label: 'Kaufvertrag unterschreiben', sub: s.rep < b.need ? `erst ab ${b.need} Ruf` : s.money < price ? `es fehlen ${price - s.money} €` : `${price} € · gehört sofort dir`, disabled: s.rep < b.need || s.money < price, fn: () => {
        const why = buy(s, b); if (why) { sfx('miss'); toast(why); return; }
        close(); sfx('win'); g.save.write(); g.city.refreshHud(); sc?.refreshClub();
        g.hud.banner(`${b.icon} ${b.name} gehört jetzt dir!`, `+${b.daily} € jeden Tag · +${b.rep} Ruf · führen am 📋 im Club`, 'good', 4500);
        g.dialog.say([{ who: who.who, color: who.color, text: 'Hier sind die Schlüssel. Pass gut auf die Leute auf, die hier zum ersten Mal ganz sie selbst sind.' },
          { who: who.who, color: who.color, text: 'Am Klemmbrett 📋 stellst du alles ein: DJ, Preise, Tür, Deko. Und abends machst du die Türen auf.' }]);
      } },
      { icon: '🗣️', label: 'Verhandeln', sub: s.flags['haggle_' + b.id] === 'ok' ? 'schon geeinigt' : 'mit genug Ruf geht’s 15 % billiger · einmal am Tag', disabled: s.flags['haggle_' + b.id] === 'ok', fn: () => {
        const r = haggle(s, b); g.save.write();
        if (typeof r === 'string') { sfx('miss'); toast(r); return; }
        g.closeMenu();
        g.dialog.say([{ who: 'Du', color: '#ff4fa3', text: 'Ich habe Pläne für den Laden. Und die Szene kennt mich.' },
          { who: who.who, color: who.color, text: r ? `Stimmt, man redet über dich. Gut: ${priceOf(s, b)} €, Hand drauf.` : `Nett versucht. Komm wieder, wenn dich mehr Leute kennen (ab ${b.need + 5} Ruf).` }], offer);
        sfx(r ? 'coin' : 'miss');
      } },
      { icon: '←', label: 'Später', fn: close }], close, '');
    hints([['dpad', 'Wählen'], ['a', 'Bestätigen'], ['b', 'Zurück']]);
  };
  if (owns(s, b.id)) { clubManage(g, b, sc); return; }
  g.dialog.say([{ who: who.who, color: who.color, text: who.hello }], offer);
}

/** Club führen: Einstellungen wirken sofort im Raum, Clubnacht nur abends im Club */
export function clubManage(g: Game, b: Business, sc?: InteriorScene) {
  const s = g.save.data, id = b.id;
  const close = () => { g.closeMenu(); g.touch.show(true); };
  const again = () => clubManage(g, b, sc);
  const st = clubOf(s, id), d = daily(s, b), pop = popOf(s, id), h = hour(s);
  const live = () => { g.save.write(); sc?.refreshClub(); };
  const cyc = <T,>(list: T[], cur: number, dir: number) => (cur + dir + list.length) % list.length;
  const next = upcoming(new Date(), 3).map(({ e, days }) => `${e.name} (${e.d}.${e.m}.)${days === 0 ? ' · heute' : days < 0 ? ` · vor ${-days} T.` : ` · in ${days} T.`}`).join('<br>');
  const can = !!sc && nightOpen(h) && !nightDone(s, id);
  g.touch.show(false);
  const items: Item[] = [
    { icon: '🪩', label: 'Türen auf: Clubnacht starten', sub: !sc ? 'nur im Club selbst' : nightDone(s, id) ? 'heute schon gefeiert' : !nightOpen(h) ? 'ab 20 Uhr' : 'Themennacht wählen, live entscheiden, abrechnen', disabled: !can, big: can, fn: () => nightPick(g, b, sc!) },
    ...(g.city.friends.net.on && sc ? [{ icon: '🌐', label: 'Freund*innen in den Club einladen', sub: `${g.city.friends.list.length} online · sie sehen deinen DJ, deine Deko und tanzen mit`, fn: () => { invite(g, b); toast('🌐 Einladung verschickt.'); } } as Item] : []),
    { icon: '🎧', label: 'Resident-DJ', sub: `${st.dj.style}${st.dj.fee ? ` · Gage ${st.dj.fee} € am Abend` : ' · kostet nichts'}`, value: () => clubOf(s, id).dj.name,
      left: () => { setDj(s, id, DJS[cyc(DJS, DJS.indexOf(clubOf(s, id).dj), -1)].id); live(); }, right: () => { setDj(s, id, DJS[cyc(DJS, DJS.indexOf(clubOf(s, id).dj), 1)].id); live(); } },
    { icon: '🍹', label: 'Getränkepreise', sub: 'günstig = voller, Luxus = mehr Umsatz je Gast', value: () => PRICES[clubOf(s, id).price].name,
      left: () => { setPrice(s, id, Math.max(0, clubOf(s, id).price - 1)); live(); }, right: () => { setPrice(s, id, Math.min(PRICES.length - 1, clubOf(s, id).price + 1)); live(); } },
    { icon: '🚪', label: 'Türpolitik', sub: 'offen = mehr Gäste, Gästeliste = mehr Ruf und Umsatz je Gast', value: () => DOORS[clubOf(s, id).door].name,
      left: () => { setDoor(s, id, cyc(DOORS, clubOf(s, id).door, -1)); live(); }, right: () => { setDoor(s, id, cyc(DOORS, clubOf(s, id).door, 1)); live(); } },
    ...(st.decos.length ? [{ icon: '🎨', label: 'Deko aufhängen', sub: 'gekaufte Deko wechseln', value: () => DECOS.find((x) => x.id === clubOf(s, id).deco)?.name || 'ohne',
      left: () => { const l = ['', ...clubOf(s, id).decos], i = Math.max(0, l.indexOf(clubOf(s, id).deco)); setDeco(s, id, l[cyc(l, i, -1)]); live(); }, right: () => { const l = ['', ...clubOf(s, id).decos], i = Math.max(0, l.indexOf(clubOf(s, id).deco)); setDeco(s, id, l[cyc(l, i, 1)]); live(); } } as Item] : []),
    ...DECOS.filter((x) => !st.decos.includes(x.id)).map((x) => ({ icon: x.icon, label: `Deko kaufen: ${x.name}`, sub: `${x.cost} € · ${x.text} · +${Math.round(x.bonus * 100)} % Umsatz`, disabled: s.money < x.cost,
      fn: () => { const why = setDeco(s, id, x.id); if (why) { sfx('miss'); toast(why); return; } sfx('win'); toast(`${x.icon} ${x.name} hängt!`); live(); g.city.refreshHud(); again(); } })),
    { icon: '💜', label: st.aware ? 'Awareness-Team: im Einsatz' : 'Awareness-Team einstellen', sub: `${AWARE_COST} € am Abend · Ansprechpersonen für alle, die sich unwohl fühlen · +Beliebtheit, +Ruf`, fn: () => { setAware(s, id, !st.aware); sfx('ok'); toast(st.aware ? 'Awareness-Team pausiert.' : '💜 Das Awareness-Team ist ab heute da.'); live(); again(); } },
    { icon: '📊', label: 'Personal, Ausbau, Veranstaltung', sub: 'das Geschäft wie bisher führen', fn: () => g.phone('biz_' + id) },
    { icon: '←', label: 'Zurück', fn: close },
  ];
  g.openMenu(panel(`📋 ${b.name}`, `<p>💶 <b>${d.net} € Gewinn am Tag</b> <small>(Umsatz ${d.gross} €, Kosten ${d.wage} €)</small><br>💖 Beliebtheit ${pop} · 🪩 ${nightsOf(s, id)} Clubnächte · Rekord ${bestOf(s, id)} Gäste</p><p><small>🏳️‍🌈 Echte Jahrestage demnächst:<br>${next}</small></p>`), items, close, '');
  hints([['dpad', 'Wählen'], ['a', 'Bestätigen'], ['b', 'Zurück']]);
}

/** Online-Runde in den eigenen Club einladen (mit DJ, Deko, Tür und Themennacht) */
export function invite(g: Game, b: Business, ev?: QEvent) {
  const st = clubOf(g.save.data, b.id);
  if (g.city.friends.net.on) g.city.friends.invite({ p: b.poi, n: b.name, e: ev?.id || '', dj: st.dj.id, deco: st.deco, door: st.door, aw: st.aware });
}
/** Themennacht wählen: normale Nacht oder ein echter Tag der queeren Geschichte */
function nightPick(g: Game, b: Business, sc: InteriorScene) {
  const s = g.save.data, back = () => clubManage(g, b, sc);
  const list = [...QEVENTS].sort((a, c) => Number(anniversary(c)) - Number(anniversary(a)));
  g.openMenu(panel('🪩 Welche Nacht?', '<p>Themennächte erinnern an echte Tage der queeren Geschichte. Am echten Jahrestag (±3 Tage) kommen noch mehr Leute.</p>'), [
    { icon: '🎶', label: 'Ganz normale Clubnacht', sub: 'keine Extrakosten', fn: () => playNight(g, b, sc) },
    ...list.map((e) => ({ icon: anniversary(e) ? '⭐' : '🏳️‍🌈', label: e.name, sub: `${e.d}.${e.m}.${anniversary(e) ? ' · JAHRESTAG' : ''} · ${e.cost} € Deko und Show · +${e.rep} Ruf`, disabled: s.money < e.cost, fn: () => playNight(g, b, sc, e) })),
    { icon: '←', label: 'Zurück', fn: back }], back, '');
}

/** Die Nacht läuft im Raum: volle Tanzfläche, Banner, drei Entscheidungen, dann Abrechnung */
function playNight(g: Game, b: Business, sc: InteriorScene, ev?: QEvent) {
  const s = g.save.data;
  g.closeMenu(); g.touch.show(true);
  sc.party = ev?.night || 'CLUBNACHT'; sc.refreshClub(); invite(g, b, ev);
  sfx('cheer');
  g.hud.banner(`🪩 ${ev ? ev.name : 'Clubnacht'} im ${b.name}`, ev ? ev.fact : clubOf(s, b.id).dj.line, 'good', 5200);
  let mood = 0;
  const moments = momentsFor(s.day, b.id), aw = clubOf(s, b.id).aware;
  const step = (i: number) => {
    if (i >= moments.length) { finish(); return; }
    const m = moments[i];
    g.dialog.say([{ who: m.who, color: '#ffd23b', text: m.text, choices: m.choices.map((c) => ({ label: c.label, sub: c.sub, fn: () => {
      mood += c.mood + (aw && m.who === 'Awareness-Team' ? 3 : 0); if (c.cost) s.money -= c.cost; if (c.rep) s.rep = Math.max(0, s.rep + c.rep);
      sfx(c.mood >= 5 ? 'cheer' : c.mood < 0 ? 'miss' : 'ok');
    } })) }], () => setTimeout(() => step(i + 1), 1400));
  };
  const finish = () => {
    const pop = popOf(s, b.id), r = runNight(s, b, pop, mood, ev);
    g.fade(() => {
      bookNight(s, b, r, (v) => setPop(s, b.id, v), pop);
      g.pass(Math.max(60, ((27 - hour(s)) % 24) * 60));
      sc.party = ''; sc.refreshClub(); g.save.write(); g.city.refreshHud(); sfx('coin');
      g.dialog.say([...r.lines.map((text) => ({ who: b.name, color: '#ff6ad5', text })),
        { who: '📊 Abrechnung', color: '#3ee69a', text: `${r.guests} Gäste · Umsatz +${r.revenue} € · Kosten −${r.cost} € · Ruf +${r.rep}. Gewinn: ${r.revenue - r.cost} €.` }]);
    });
  };
  setTimeout(() => step(0), 2600);
}
