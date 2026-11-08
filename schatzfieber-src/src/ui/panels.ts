/** Fenster: Handy (Tagebuch, Karte, Inventar, Kontakte, Galerie), Pause, Laden, Museum, Strandhaus, Symbolschloss, Einstellungen */
import type { App } from '../app';
import { esc } from './ui';
import { ITEMS, SHOP, ARTIFACTS, MUSEUM_REWARDS, RENOVATIONS, MAIN_QUESTS, SYMBOLS, item } from '../core/data';
import { NPCS } from '../core/npcs';
import { POIS, poi, WORLD_HALF } from '../world/island';
import * as S from '../core/state';
import { galleryEntries } from '../game/talk';

const hearts = (lvl: number) => `<span class="hearts">${'♥'.repeat(lvl)}${'♡'.repeat(5 - lvl)}</span>`;
const SLOT: Record<string, string> = { morning: 'morgens', day: 'tagsüber', evening: 'abends', night: 'nachts' };

export function confirm(app: App, text: string, yes: () => void) {
  app.ui.open(`<h2>Sicher?</h2><p>${esc(text)}</p><div class="row"><button class="btn coral" data-a="y">Ja</button><button class="btn pref" data-a="n" data-back>Nein</button></div>`);
  app.ui.bind({ y: () => (app.ui.close(), yes()), n: () => app.ui.close() });
}

// ---------- Handy ----------
type Tab = 'quests' | 'map' | 'inv' | 'contacts' | 'gallery';
export function phone(app: App, tab: Tab = 'quests') {
  const tabs: [Tab, string][] = [['quests', '📔 Tagebuch'], ['map', '🗺️ Karte'], ['inv', '🎒 Inventar'], ['contacts', '💞 Kontakte'], ['gallery', '🖼️ Galerie']];
  const s = app.save;
  let body = '';
  if (tab === 'quests') {
    const q = MAIN_QUESTS.map((m) => ({ ...m, ok: !!s.flags[m.done] }));
    const cur = q.findIndex((m) => !m.ok);
    body = `<h3>Hauptgeschichte · Amulett ${S.pieces(s) + (s.flags.amulet_heart ? 1 : 0)}/4</h3><div class="list">${q
      .filter((_, i) => cur < 0 || i <= cur)
      .map((m) => `<div class="li ${m.ok ? 'done' : ''}"><span>${m.ok ? '✅' : '🧭'}</span><div class="grow"><b>${esc(m.title)}</b><small>${esc(m.text)}</small></div></div>`)
      .join('')}</div><h3>Herzensangelegenheiten</h3><div class="list">${NPCS.filter((n) => s.rel[n.id].met && s.rel[n.id].lvl < 5)
      .map((n) => {
        const st = S.nextStep(s, n)!,
          r = s.rel[n.id];
        const ready = S.stepUnlocked(s, n) ? (st.need.t === 'date' ? (r.dateDay >= s.day ? `📅 ${r.dateDay === s.day ? 'Heute' : 'Morgen'} ${st.need.from}–${st.need.to} Uhr, ${poi(st.need.poi).name}` : '📅 Verabreden') : S.needMet(s, st.need) ? '✨ Bereit – sprich mit ' + n.name : '') : `Zuneigung ${r.pts}/${S.THRESH[r.lvl]}`;
        return `<div class="li"><span>${hearts(r.lvl)}</span><div class="grow"><b>${n.name}: ${esc(st.goal)}</b><small>${esc(ready)}</small></div></div>`;
      })
      .join('') || '<small>Sprich mit den Leuten auf der Insel!</small>'}</div><h3>Strandhaus & Museum</h3><div class="kv"><span>Ausbaustufe</span><b>${s.renov}/4</b><span>Museum</span><b>${s.museum.length}/12</b><span>Ausgegraben · Getaucht</span><b>${s.stats.dug} · ${s.stats.dived}</b></div>`;
  } else if (tab === 'map') {
    const pin = (x: number, z: number, html: string, cls = '') => `<span class="pin ${cls}" style="left:${((x + 300) / 600) * 100}%;top:${((z + 300) / 600) * 100}%">${html}</span>`;
    const q = app.currentQuest();
    const goal = q ? ({ q_arrive: 'harbor', q_house: 'house', q_lea: 'museum', q_cave: s.inv.lamp ? 'cave' : 'shop', q_ruins: s.inv.machete ? 'ruins' : 'shop', q_light: s.inv.lighthouse_key ? 'lighthouse' : 'lighthouse', q_temple: s.inv.rope ? 'temple' : 'shop' } as Record<string, string>)[q.id] : '';
    const p = app.dungeon ? poi(app.puzzle!.def.poi) : { x: app.player.pos.x, z: app.player.pos.z };
    const known = NPCS.filter((n) => s.rel[n.id].met)
      .map((n) => app.world.npcs.find((a) => a.def.id === n.id)!)
      .filter((a) => a.present)
      .map((a) => pin(a.body.root.position.x, a.body.root.position.z, `<img src="${app.portraits[a.def.id]}" style="width:22px;height:22px;border-radius:50%;border:2px solid ${a.def.color}" alt="${a.def.name}" title="${a.def.name}">`))
      .join('');
    body = `<div class="map" id="mapBox">${POIS.filter((x) => x.id !== 'volcano' && (x.id !== 'cave' || s.flags.leaMap)).map((x) => pin(x.x, x.z, x.icon, x.id === goal ? 'goal' : '')).join('')}${known}${pin(p.x, p.z, '▲', 'me')}</div><p class="crHint">${POIS.filter((x) => x.id !== 'volcano').map((x) => `${x.icon} ${x.name}`).join(' · ')}${goal ? ` · <b>Ziel blinkt</b>` : ''}</p>`;
    void WORLD_HALF;
  } else if (tab === 'inv') {
    const groups: [string, string][] = [['tool', 'Werkzeuge'], ['quest', 'Besonderes'], ['gift', 'Geschenke'], ['find', 'Fundstücke'], ['artifact', 'Artefakte']];
    body = groups
      .map(([k, t]) => {
        const it = ITEMS.filter((i) => i.kind === k && (s.inv[i.id] || 0) > 0);
        return it.length ? `<h3>${t}</h3><div class="grid">${it.map((i) => `<div class="card"><span class="ic">${i.icon}</span> <b>${esc(i.name)}</b>${s.inv[i.id] > 1 ? ` ×${s.inv[i.id]}` : ''}<small>${esc(i.desc)}${i.value && k !== 'tool' && k !== 'quest' ? ` · Wert ${i.value} €` : ''}${k === 'artifact' && !s.museum.includes(i.id) ? ' · 🏛️ fehlt im Museum' : ''}</small></div>`).join('')}</div>` : '';
      })
      .join('') + `<p class="kv"><span>Geld</span><b>${s.money} €</b></p>`;
  } else if (tab === 'contacts') {
    body = `<div class="list">${NPCS.map((n) => {
      const r = s.rel[n.id];
      if (!r.met) return `<div class="li contact"><img src="${app.portraits[n.id]}" alt="" style="filter:blur(4px) grayscale(1)"><div><b>???</b><small>Noch nicht kennengelernt</small></div></div>`;
      const sp = n.schedule[S.slotOf(s.time)];
      const where = sp ? `${SLOT[S.slotOf(s.time)]}: ${poi(sp.poi).name}` : `${SLOT[S.slotOf(s.time)]}: zu Hause`;
      const status = S.romantic(s, n) ? (r.lvl >= 5 ? '💞 Liebe' + (r.open ? ' (offen)' : '') : '💕 Romanze') : r.lvl >= 5 ? '🤝 Beste Freundschaft' : r.lvl >= 2 ? '🙂 Freundschaft' : '👋 Bekanntschaft';
      const likes = r.known.length ? `Mag: ${r.known.filter((i) => n.loves.includes(i) || n.likesItems.includes(i)).map((i) => item(i).icon).join(' ')}${r.known.some((i) => n.dislikes.includes(i)) ? ` · Mag nicht: ${r.known.filter((i) => n.dislikes.includes(i)).map((i) => item(i).icon).join(' ')}` : ''}` : 'Vorlieben: noch unbekannt';
      return `<div class="li contact"><img src="${app.portraits[n.id]}" alt="${n.name}" style="border-color:${n.color}"><div><b>${n.name}, ${n.age}</b> ${hearts(r.lvl)} <small>${esc(n.job)} · ${status}${S.compatible(n, s.player) ? '' : ' · nur Freundschaft möglich'}</small><small>${esc(n.bio)}</small><small>📍 ${where} · ${likes}</small></div></div>`;
    }).join('')}</div>`;
  } else body = galleryHtml(app);
  const box = app.ui.open(`<div class="tabs">${tabs.map(([k, l]) => `<button class="btn ${k === tab ? 'on' : ''}" data-a="tab" data-t="${k}">${l}</button>`).join('')}<button class="btn" data-a="x" data-back style="margin-left:auto">✕</button></div>${body}`, undefined, 'wide');
  if (tab === 'map') {
    const c = app.mapCanvas();
    const cv = document.createElement('canvas');
    cv.width = cv.height = c.width;
    cv.getContext('2d')!.drawImage(c, 0, 0);
    box.querySelector('#mapBox')!.prepend(cv);
  }
  app.ui.bind({ tab: (el) => phone(app, el.dataset.t as Tab), x: () => app.ui.close(), scene: (el) => (app.ui.close(), app.playScene(el.dataset.id!, true)) });
  bindTabsKeys(app, tabs.map((t) => t[0]), tab);
}
function bindTabsKeys(app: App, tabs: Tab[], cur: Tab) {
  // Q/R bzw. LB/RB wechseln Reiter (in der Hauptschleife abgefragt)
  (app as unknown as { tabSwitch: (d: number) => void }).tabSwitch = (d: number) => phone(app, tabs[(tabs.indexOf(cur) + d + tabs.length) % tabs.length]);
}
function galleryHtml(app: App) {
  const e = galleryEntries(app);
  const n = e.filter((x) => x.unlocked).length;
  return `<h3>Erinnerungen ${n}/${e.length}</h3><p class="crHint">Freigeschaltete Szenen kannst du hier erneut ansehen.</p><div class="grid">${e
    .map((x) => (x.unlocked ? `<button class="card" data-a="scene" data-id="${x.id}"><img src="${app.portraits[x.npc!]}" alt="" style="width:100%;border-radius:10px"><b>${esc(x.label)}</b></button>` : `<div class="card dim"><span class="ic">🔒</span><small>${esc(x.label.split(':')[0])}: ???</small></div>`))
    .join('')}</div>${app.save?.gallery.filter((g) => g.startsWith('ending_')).length ? `<h3>Enden</h3><p>${app.save.gallery.filter((g) => g.startsWith('ending_')).map((g) => ({ ending_single: '🧭 Frei und allein', ending_couple: '💞 Zu zweit', ending_open: '🌈 Offene Liebe' })[g] || g).join(' · ')}</p>` : ''}`;
}
export function gallery(app: App, fromTitle: boolean) {
  if (fromTitle) {
    const s = app.readJSON<S.Save | null>('schatzfieber-save', null);
    if (!s) {
      app.ui.open('<h2>🖼️ Galerie</h2><p>Noch keine Erinnerungen. Beginne ein Spiel und verliebe dich!</p><p class="row"><button class="btn pref" data-a="x" data-back>OK</button></p>');
      app.ui.bind({ x: () => app.ui.close() });
      return;
    }
    const e = galleryEntries({ ...app, save: S.normalize(s), portraits: app.portraits } as unknown as App);
    app.ui.open(`<h2>🖼️ Galerie</h2><p>${e.filter((x) => x.unlocked).length}/${e.length} Erinnerungen freigeschaltet. Ansehen kannst du sie im Spiel über 📱 Handy → Galerie.</p><p class="row"><button class="btn pref" data-a="x" data-back>OK</button></p>`);
    app.ui.bind({ x: () => app.ui.close() });
  } else phone(app, 'gallery');
}

// ---------- Pause ----------
export function pause(app: App) {
  const inD = !!app.dungeon;
  app.ui.open(
    `<h2>⏸ Pause</h2><div class="tmenu"><button class="btn gold pref" data-a="go" data-back>▶ Weiter</button><button class="btn" data-a="phone">📱 Handy</button>${inD ? '<button class="btn" data-a="reset">🔄 Rätsel zurücksetzen (Kisten & Hebel)</button><button class="btn" data-a="leave">🚪 Rätselort verlassen</button>' : ''}<button class="btn" data-a="save">💾 Speichern</button><button class="btn" data-a="set">⚙️ Einstellungen</button><button class="btn" data-a="help">❔ Steuerung</button><button class="btn" data-a="title">🏠 Zum Titel</button></div>`,
  );
  app.ui.bind({
    go: () => app.ui.close(),
    phone: () => phone(app),
    reset: () => {
      app.puzzle!.reset();
      app.dungeon!.resetCrates();
      app.dungeon!.resetLevers();
      app.save.dungeons[app.puzzle!.def.id] = app.puzzle!.save();
      app.ui.close();
      app.ui.toast('🔄 Kisten und Hebel stehen wieder am Anfang.');
    },
    leave: () => (app.ui.close(), app.leaveDungeon()),
    save: () => (app.saveGame(), app.ui.close(), app.ui.toast('💾 Gespeichert')),
    set: () => settings(app),
    help: () => help(app),
    title: () => (app.saveGame(), location.reload()),
  });
}
function help(app: App) {
  app.ui.open(
    `<h2>❔ Steuerung</h2><div class="kv"><span>Laufen / Rennen</span><b>WASD · Shift (Feststell: CapsLock) · linker Stick · Touch-Stick</b><span>Umsehen</span><b>Maus (Klick fängt Zeiger) · rechter Stick · rechts wischen</b><span>Springen</span><b>Leertaste · Ⓧ · ⤒</b><span>Aktion / Sprechen</span><b>E · Ⓐ · ✋</b><span>Handy</span><b>Tab · Ⓨ · 📱</b><span>Karte</span><b>M · Select</b><span>Zoom</span><b>Mausrad</b><span>Pause</span><b>Esc · Start · ☰</b></div><p>Graben mit der Schaufel an glitzernden Stellen, Tauchen mit Taucherbrille an sprudelnden Stellen im Meer, Klettern mit Seil an Lianenwänden. Schlafen im Strandhaus speichert und startet einen neuen Tag.</p><p class="row"><button class="btn pref" data-a="x" data-back>OK</button></p>`,
  );
  app.ui.bind({ x: () => pause(app) });
}

// ---------- Einstellungen ----------
export function settings(app: App) {
  const st = app.settings,
    s = app.save;
  const prefRow = s ? `<div class="setting"><span>Ich date</span><select id="sPref">${(s.player.gender === 'd' ? [['all', 'Alle']] : [['w', 'Frauen'], ['m', 'Männer'], ['all', 'Alle']]).map(([v, l]) => `<option value="${v}" ${s.player.pref === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>` : '';
  app.ui.open(
    `<h2>⚙️ Einstellungen</h2><div class="setting"><span>Grafik</span><select id="sQ"><option value="0">Schnell (Handy)</option><option value="1">Ausgewogen</option><option value="2">Schön (starker PC)</option></select></div><div class="setting"><span>Musik</span><input type="range" id="sMu" min="0" max="1" step="0.05" value="${st.music}"></div><div class="setting"><span>Effekte & Natur</span><input type="range" id="sFx" min="0" max="1" step="0.05" value="${st.sfx}"></div><div class="setting"><span>Kamera-Empfindlichkeit</span><input type="range" id="sSe" min="0.3" max="2.5" step="0.1" value="${st.sens}"></div><div class="setting"><span>Kamera invertieren</span><select id="sIn"><option value="0">Nein</option><option value="1" ${st.invert ? 'selected' : ''}>Ja</option></select></div><div class="setting"><span>Textgeschwindigkeit</span><input type="range" id="sTx" min="0.5" max="3" step="0.25" value="${st.textSpeed}"></div>${prefRow}<p class="crHint" id="sNote">Die Grafikstufe wirkt nach dem Neuladen.</p><p class="row"><button class="btn gold pref" data-a="ok" data-back>Fertig</button></p>`,
  );
  const q = document.getElementById('sQ') as HTMLSelectElement;
  q.value = String(st.quality);
  const apply = () => {
    st.music = +(document.getElementById('sMu') as HTMLInputElement).value;
    st.sfx = +(document.getElementById('sFx') as HTMLInputElement).value;
    st.sens = +(document.getElementById('sSe') as HTMLInputElement).value;
    st.invert = (document.getElementById('sIn') as HTMLSelectElement).value === '1';
    st.textSpeed = +(document.getElementById('sTx') as HTMLInputElement).value;
    st.quality = +q.value;
    const pr = document.getElementById('sPref') as HTMLSelectElement | null;
    if (pr && s) s.player.pref = pr.value as S.PlayerCfg['pref'];
    app.saveSettings();
    if (s) app.saveGame();
  };
  document.querySelectorAll('#ovBox input, #ovBox select').forEach((el) => el.addEventListener('change', apply));
  app.ui.bind({
    ok: () => {
      apply();
      app.ui.close();
      if (st.quality !== app.quality) location.reload();
    },
  });
}

// ---------- Laden ----------
export function shop(app: App, sellTab = false) {
  const s = app.save,
    h = s.time / 60 % 24;
  if (h < 7 || h >= 22) return app.ui.toast('🔒 Der Kramladen hat von 7 bis 22 Uhr geöffnet.');
  const need = (id: string) => (id === 'lamp' ? !!s.flags.leaMap : id === 'machete' ? !!s.flags.amulet_sun || !!s.flags.leaMap : id === 'rope' ? !!s.flags.leaMap : true);
  const buyList = SHOP.filter(need)
    .map((id) => {
      const it = item(id),
        owned = it.kind === 'tool' && s.inv[id];
      return `<button class="card ${owned ? 'dim' : ''}" data-a="buy" data-id="${id}" ${owned || s.money < it.price! ? 'disabled' : ''}><span class="ic">${it.icon}</span> <b>${esc(it.name)}</b> <small>${it.price} € · ${esc(it.desc)}${owned ? ' · ✔ vorhanden' : ''}</small></button>`;
    })
    .join('');
  const sellable = Object.entries(s.inv).filter(([id, n]) => n > 0 && item(id).value && ['gift', 'find', 'artifact'].includes(item(id).kind));
  const sellList = sellable.length ? sellable.map(([id, n]) => `<button class="card" data-a="sell" data-id="${id}"><span class="ic">${item(id).icon}</span> <b>${esc(item(id).name)}</b> ×${n}<small>${item(id).value} €${item(id).kind === 'artifact' && !s.museum.includes(id) ? ' · 🏛️ Das Museum hätte es gern!' : ''}</small></button>`).join('') : '<p>Du hast nichts zu verkaufen. Graben und Tauchen bringen Fundstücke!</p>';
  app.ui.open(
    `<h2>🛍️ Valentinas Kramladen</h2><p>„${sellTab ? 'Zeig her, was du gefunden hast – ich zahle fair. Meistens.' : 'Was darf’s sein? Für Schatzsuche und fürs Herz habe ich alles!'}“ · <b class="money">${s.money} €</b></p><div class="tabs"><button class="btn ${!sellTab ? 'on' : ''}" data-a="t0">Kaufen</button><button class="btn ${sellTab ? 'on' : ''}" data-a="t1">Verkaufen</button><button class="btn" data-a="x" data-back style="margin-left:auto">✕</button></div><div class="grid">${sellTab ? sellList : buyList}</div>`,
    undefined,
    'wide',
  );
  app.ui.bind({
    t0: () => shop(app, false),
    t1: () => shop(app, true),
    x: () => app.ui.close(),
    buy: (el) => {
      if (S.buy(s, el.dataset.id!)) {
        app.sound.play('coin');
        app.ui.toast(`✔ ${item(el.dataset.id!).icon} ${item(el.dataset.id!).name} gekauft`);
        app.saveGame();
      } else app.sound.play('error');
      shop(app, false);
    },
    sell: (el) => {
      const v = S.sell(s, el.dataset.id!);
      if (v) app.sound.play('coin');
      shop(app, true);
    },
  });
}

// ---------- Museum ----------
export function museum(app: App) {
  const s = app.save,
    h = s.time / 60 % 24;
  if (h < 8 || h >= 20) return app.ui.toast('🔒 Das Museum hat von 8 bis 20 Uhr geöffnet.');
  const next = MUSEUM_REWARDS.find((r) => r.n > s.museum.length);
  app.ui.open(
    `<h2>🏛️ Inselmuseum – „Ysoldes Erbe“</h2><p>Spende Artefakte für die Ausstellung (Lea freut sich jedes Mal). ${next ? `Nächster Finderlohn bei ${next.n} Stücken: ${next.money} €.` : 'Die Sammlung ist vollständig!'}</p><div class="grid">${ARTIFACTS.map((id) => {
      const it = item(id),
        don = s.museum.includes(id),
        have = (s.inv[id] || 0) > 0;
      return don ? `<div class="card"><span class="ic">${it.icon}</span> <b>${esc(it.name)}</b><small>✔ ausgestellt</small></div>` : have ? `<button class="card" data-a="d" data-id="${id}"><span class="ic">${it.icon}</span> <b>${esc(it.name)}</b><small>Spenden (Wert ${it.value} €)</small></button>` : `<div class="card dim"><span class="ic">❔</span> <b>???</b><small>Noch nicht gefunden</small></div>`;
    }).join('')}</div><p class="row"><button class="btn pref" data-a="x" data-back>Schließen</button></p>`,
    undefined,
    'wide',
  );
  app.ui.bind({
    x: () => app.ui.close(),
    d: (el) => {
      const r = S.donate(s, el.dataset.id!);
      if (r.ok) {
        app.sound.play('chest');
        app.ui.toast(r.reward ? `🏛️ ${r.reward.text} +${r.reward.money} €` : `🏛️ ${item(el.dataset.id!).name} ausgestellt – Lea strahlt.`, 4000);
        app.saveGame();
      }
      museum(app);
    },
  });
}

// ---------- Strandhaus ----------
export async function house(app: App) {
  const s = app.save;
  if (!s.flags.journal) {
    S.addItem(s, 'journal');
    app.sound.play('chest');
    await app.ui.say('', '', null, 'Staub, Spinnweben, das Rauschen des Meeres. Auf dem Schreibtisch liegt ein dickes Notizbuch: „Für den Menschen, der nach mir kommt. Hedda.“');
    await app.ui.say('', '', null, 'Darin: Skizzen der Insel, vier Zeichen – Sonne, Mond, Stern, Herz – und immer wieder ein Name: Ysolde Marrow. „Lea im Museum kann die alten Zeichen lesen“, steht am Rand.');
    app.ui.endDialog();
    app.ui.toast('📔 Heddas Tagebuch erhalten! Zeig es Lea im Museum.');
    app.saveGame();
  }
  const next = RENOVATIONS[s.renov];
  const h = s.time / 60;
  app.ui.open(
    `<h2>🏠 Dein Strandhaus</h2><p>${['Eine charmante Bruchbude. Das Dach ist undicht, die Fenster vernagelt.', 'Dicht und gemütlich, mit türkisen Fensterläden.', 'Mit Terrasse, Sofa und Esstisch für zwei.', 'Abends leuchten die Lichterketten, die Hängematte schaukelt.', 'Ein Traumhaus mit Pool und Meerblick.'][s.renov]}</p><div class="tmenu"><button class="btn gold pref" data-a="sleep">🛏️ Schlafen bis morgen (speichert)</button>${h < 17 ? '<button class="btn" data-a="rest">🌅 Ausruhen bis zum Abend</button>' : ''}<button class="btn" data-a="wardrobe">👗 Kleiderschrank & Spiegel</button>${next ? `<button class="btn" data-a="renov" ${s.money < next.cost ? 'disabled' : ''}>🔨 Ausbau: ${esc(next.name)} – ${next.cost} €<small>${esc(next.desc)}</small></button>` : '<p>✨ Vollständig ausgebaut!</p>'}<button class="btn" data-a="journal">📔 Heddas Tagebuch lesen</button><button class="btn" data-a="x" data-back>Hinausgehen</button></div>`,
  );
  app.ui.bind({
    sleep: () => (app.ui.close(), app.sleepUntil(false)),
    rest: () => (app.ui.close(), app.sleepUntil(true)),
    wardrobe: () => (app.ui.close(), app.openCreator(true)),
    renov: () => {
      if (S.renovate(s)) {
        app.world.setHouse(s.renov);
        app.sound.play('coin');
        app.ui.toast(`🔨 ${RENOVATIONS[s.renov - 1].name} fertig!`);
        app.saveGame();
      }
      house(app);
    },
    journal: async () => {
      app.ui.close();
      await app.ui.say('', '', null, '„Ysolde versteckte ihr Herz in vier Teilen. Die Sonne schläft, wo die Flut kommt. Der Mond wacht im grünen Haus der Tiere. Der Stern ruht unter dem Licht, das Schiffe heimführt. Und das Herz schlägt im Feuerberg.“');
      app.ui.endDialog();
    },
    x: () => app.ui.close(),
  });
}

// ---------- Symbolschloss ----------
export function lock(app: App) {
  const pz = app.puzzle!,
    n = pz.def.code!.length;
  const cur: number[] = (app as unknown as { lockState?: number[] }).lockState?.length === n ? (app as unknown as { lockState: number[] }).lockState : new Array(n).fill(0);
  (app as unknown as { lockState: number[] }).lockState = cur;
  const draw = () => {
    app.ui.open(
      `<h2>🔐 Symbolschloss</h2><p>Dreh die Scheiben auf die richtigen Zeichen. (Die Inschrift im Raum gibt einen Hinweis.)</p><div class="dial">${cur.map((v, i) => `<div class="col"><button class="btn" data-a="u" data-i="${i}" aria-label="Scheibe ${i + 1} hoch">▲</button><div class="sym">${SYMBOLS[v]}</div><button class="btn" data-a="d" data-i="${i}" aria-label="Scheibe ${i + 1} runter">▼</button></div>`).join('')}</div><p class="row"><button class="btn gold pref" data-a="try">Öffnen</button><button class="btn" data-a="x" data-back>Abbrechen</button></p>`,
    );
    app.ui.bind({
      u: (el) => {
        const i = +el.dataset.i!;
        cur[i] = (cur[i] + 1) % SYMBOLS.length;
        draw();
        (document.querySelector(`[data-a="u"][data-i="${i}"]`) as HTMLElement)?.focus();
      },
      d: (el) => {
        const i = +el.dataset.i!;
        cur[i] = (cur[i] + SYMBOLS.length - 1) % SYMBOLS.length;
        draw();
        (document.querySelector(`[data-a="d"][data-i="${i}"]`) as HTMLElement)?.focus();
      },
      try: () => {
        if (pz.tryCode(cur)) {
          app.ui.close();
          app.sound.play('door');
          app.ui.toast('🔓 Klick! Die Steintür gleitet zur Seite.');
          app.save.dungeons[pz.def.id] = pz.save();
        } else {
          app.sound.play('error');
          app.ui.toast('❌ Nichts rührt sich.');
        }
      },
      x: () => app.ui.close(),
    });
  };
  draw();
}
