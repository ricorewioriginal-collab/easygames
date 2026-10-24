/* Radio: Sender (laut.fm, Webradios der AnMaCha-Radioproduktion, meinradio.com) und Radiosendungen im eigenen Radiostudio.
   Reine Spiellogik ohne DOM. Der Podcast bleibt das Herzstück: Radio bringt wenig Geld, aber Werbung für die nächste Folge
   (Reichweite + Radiohörer, die beim Veröffentlichen zu Podcast-Fans werden). Zustand: st.radio (fehlt in alten Spielständen → wird angelegt). */
(function (root) {
  'use strict';
  const PT = root.PT = root.PT || {};
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const R = PT.Radio = {};

  // Die 12 Sender von meinradio.com („12 Sender. Echte Menschen. Deine Musik.“), Stream über laut.fm
  R.STATIONS = [
    { slug: 'anmacha24', name: 'AnMaCha24', desc: 'Musik, die mich anmacht! Nachts die AnMaCha & Friends Podcastnacht.' },
    { slug: 'yourtime-fm', name: 'YourTime-FM', desc: 'Reisen, Freizeit und Feelgood.' },
    { slug: 'chartradio24', name: 'Chartradio24', desc: 'Die aktuellen Hits.' },
    { slug: 'clubradio24', name: 'Clubradio24', desc: 'Dance, House und Gastmixe („House Is A Feeling“).' },
    { slug: 'special-radio', name: 'Special-Radio', desc: 'Besondere Sendungen und Specials.' },
    { slug: 'kultradio24', name: 'Kultradio24', desc: 'Kult-Hits der 80er und 90er.' },
    { slug: 'rockradio24', name: 'Rockradio24', desc: 'Gitarren und Gas.' },
    { slug: 'zockerfm', name: 'Zocker-FM', desc: 'Musik zum Zocken.' },
    { slug: 'rapradio24', name: 'Rapradio24', desc: 'Rap, R&B und Groove.' },
    { slug: 'schlagerpop24', name: 'Schlagerpop24', desc: 'Schlager und Gefühl.' },
    { slug: 'christmasradio24', name: 'Christmasradio24', desc: 'Weihnachtsmusik.' },
    { slug: 'radiofloh', name: 'RadioFloh', desc: 'Das Kinderradio.' }
  ];

  // Sendungen im eigenen Radiostudio (laufen auf AnMaCha24). mult = Hörer, promo = Werbewirkung für den Podcast,
  // hours = beste Sendezeit [von, bis) in Stunden, mg = Minispiel für die Moderation.
  R.SHOWS = [
    { id: 'morning', name: 'AnMaCha Morningshow', icon: '🌅', mg: 'P01', mult: 1.0, promo: 1.0, hours: [6, 11], energy: 6,
      desc: 'Wach werden mit Marco und Andrew: Pegel halten, gute Laune verbreiten.' },
    { id: 'wunsch', name: 'Hörer-Wunschhits', icon: '💌', mg: 'F01', mult: 1.1, promo: 0.9, hours: [16, 20], energy: 6, fans: 2,
      desc: 'Grüße und Wünsche der Hörer – bringt direkt die meisten Fans.' },
    { id: 'nacht', name: 'AnMaCha & Friends Podcastnacht', icon: '🌙', mg: 'P02', mult: 0.9, promo: 1.3, hours: [22, 28], energy: 8, needEpisode: true,
      desc: 'Ab Mitternacht laufen eure Folgen auf AnMaCha24 – die beste Werbung für den Podcast.' },
    { id: 'festival', name: 'Live vom Podfluencer Festival', icon: '🎪', mg: 'Y02', mult: 1.8, promo: 1.2, hours: [12, 24], energy: 12, cost: 150, needDistrict: 'festival',
      desc: 'AnMaCha24 live aus München mit Andrew und Marco. Übertragungswagen 150 SC.' }
  ];
  R.showById = id => R.SHOWS.find(s => s.id === id) || null;
  R.PROMO_DAYS = 3; // so lange wartet die Radio-Werbung auf die nächste Folge

  R.state = function (st) {
    if (!st.radio || typeof st.radio !== 'object') st.radio = {};
    const r = st.radio;
    if (!Number.isFinite(r.shows)) r.shows = 0;
    if (!Number.isFinite(r.lastDay)) r.lastDay = 0;
    if (!Number.isFinite(r.listeners)) r.listeners = 0;
    if (!Number.isFinite(r.money)) r.money = 0;
    if (!Number.isFinite(r.convFans)) r.convFans = 0;
    if (!Array.isArray(r.log)) r.log = [];
    if (r.promo && (typeof r.promo !== 'object' || !Number.isFinite(r.promo.pct))) r.promo = null;
    if (r.promo === undefined) r.promo = null;
    return r;
  };
  const S = () => PT.Sim;
  const hasRoom = st => !!(S() && S().hasRoom(st, 'radio'));
  const roomValue = st => (S() ? S().roomValue(st, 'radio') : 0);
  /** Raumgüte 0,7 … 1,2 (Ausstattung des Radiostudios). */
  R.roomFactor = st => PT.round ? PT.round(0.7 + Math.min(0.5, roomValue(st) / 40), 2) : 0.7 + Math.min(0.5, roomValue(st) / 40);
  R.isPrime = (show, min) => { const h = Math.floor(min / 60), h2 = h + 24; return (h >= show.hours[0] && h < show.hours[1]) || (h2 >= show.hours[0] && h2 < show.hours[1]); };

  /** Kann die Sendung jetzt laufen? { ok, err } */
  R.canRun = function (st, id) {
    const r = R.state(st), show = R.showById(id);
    if (!show) return { ok: false, err: 'Unbekannte Sendung.' };
    if (st.mode === 'career' && st.missions && !st.missions.done.length) return { ok: false, err: 'Sprich zuerst mit Marco im Studio.' };
    if (!hasRoom(st)) return { ok: false, err: 'Ihr braucht ein fertiges Radiostudio (Sendepult, Mikrofon, ON-AIR-Licht, Wände rundum).' };
    if (r.lastDay === st.time.day) return { ok: false, err: 'Heute lief schon eine Sendung – morgen wieder!' };
    if (show.needEpisode && !st.episodes.length) return { ok: false, err: 'Erst eine Podcast-Folge veröffentlichen – die läuft dann nachts im Radio.' };
    if (show.needDistrict && !(st.unlocks && st.unlocks.districts && st.unlocks.districts[show.needDistrict])) return { ok: false, err: 'Das Festivalgelände ist noch nicht freigeschaltet.' };
    if (show.cost && S() && !S().canAfford(st, show.cost)) return { ok: false, err: 'Zu wenig Geld für den Übertragungswagen.' };
    const H = st.hosts; if (H && (H.marco.energy < show.energy + 4 || H.andrew.energy < show.energy + 4)) return { ok: false, err: 'Marco und Andrew sind zu müde. Erst Kaffee oder Feierabend.' };
    return { ok: true };
  };

  /** Erwartete Werte (für die Vorschau und für runShow). score 0..1 = Moderation (Minispiel). */
  R.preview = function (st, id, score) {
    const show = R.showById(id); if (!show) return null;
    const s = clamp(score == null ? 0.5 : +score || 0, 0, 1), dr = S() ? S().diffRules(st) : { money: 1, listeners: 1 };
    const prime = R.isPrime(show, st.time.min) ? 1.25 : 1, rf = R.roomFactor(st);
    let mult = show.mult; if (show.id === 'nacht') mult += Math.min(0.5, st.episodes.length * 0.04);
    const listeners = Math.max(10, Math.round((25 + 1.5 * Math.pow(Math.max(0, st.fans), 0.8) + st.rep * 2) * mult * (0.6 + 0.8 * s) * rf * prime * (dr.listeners || 1)));
    const money = Math.round(listeners * 0.1 * (dr.money || 1));
    const fans = Math.round(listeners * 0.01 * (show.fans || 1) * (0.5 + s));
    const pct = PT.round ? PT.round(Math.min(0.25, show.promo * (0.05 + 0.12 * s) * rf), 2) : Math.min(0.25, show.promo * (0.05 + 0.12 * s) * rf);
    const convFans = Math.round(listeners * 0.04 * show.promo * (0.5 + s));
    return { show, score: s, prime: prime > 1, roomFactor: rf, listeners, money, fans, promo: { pct, fans: convFans }, cost: show.cost || 0 };
  };

  /** Sendung ausführen: Geld, Fans, Werbung für die nächste Folge. */
  R.runShow = function (st, id, score) {
    const c = R.canRun(st, id); if (!c.ok) return c;
    const r = R.state(st), p = R.preview(st, id, score), show = p.show, Sim = S();
    if (p.cost && Sim) Sim.spend(st, p.cost, 'production');
    const money = Sim ? Sim.earn(st, p.money, 'radio') : p.money;
    st.fans = Math.max(0, st.fans + p.fans);
    // Werbung: die stärkere bleibt, Radiohörer sammeln sich bis zur nächsten Folge (gedeckelt)
    const old = R.promo(st);
    r.promo = { pct: Math.max(p.promo.pct, old ? old.pct : 0), fans: Math.min(5000, p.promo.fans + (old ? old.fans : 0)), show: show.id, day: st.time.day, until: st.time.day + R.PROMO_DAYS };
    r.shows++; r.lastDay = st.time.day; r.listeners += p.listeners; r.money += money;
    if (Sim) { Sim.hostSpend(st, show.energy, 2); Sim.advance(st, 60); }
    const entry = { day: r.lastDay, show: show.id, listeners: p.listeners, money, fans: p.fans, pct: p.promo.pct, score: Math.round(p.score * 100) };
    r.log.unshift(entry); if (r.log.length > 8) r.log.length = 8;
    return { ok: true, show, listeners: p.listeners, money, fans: p.fans, promo: r.promo, prime: p.prime, roomFactor: p.roomFactor, score: entry.score };
  };

  /** Laufende Werbung (oder null, wenn abgelaufen). */
  R.promo = function (st) { const r = R.state(st), pr = r.promo; return pr && st.time.day <= pr.until ? pr : null; };
  /** Reichweiten-Bonus für die nächste Folge (fließt in die Reichweite von prodPublish). */
  R.promoReach = st => { const pr = R.promo(st); return pr ? pr.pct : 0; };
  /** Beim Veröffentlichen: Radiohörer werden Podcast-Fans, Werbung ist verbraucht. Gibt Bericht-Daten zurück oder null. */
  R.consumePromo = function (st) {
    const r = R.state(st), pr = R.promo(st);
    r.promo = null; if (!pr) return null;
    st.fans = Math.max(0, st.fans + pr.fans); r.convFans += pr.fans;
    const show = R.showById(pr.show);
    return { pct: pr.pct, fans: pr.fans, show: pr.show, name: show ? show.name : 'Radio', icon: show ? show.icon : '📻' };
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = R;
})(typeof window !== 'undefined' ? window : globalThis);
