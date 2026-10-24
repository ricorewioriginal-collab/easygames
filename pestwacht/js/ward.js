/* Pestwacht – Lazarett: einzelne Patienten untersuchen, behandeln und entlassen; Personal; Kräuterbeete.
   Läuft ohne DOM (auch in den Node-Tests). Die Patienten sind Bewohner aus den Krankenzahlen in S.pop. */
(function (root) {
  'use strict';
  const PW = root.PW || (root.PW = {});
  const WD = PW.Ward = {};
  const C = () => PW.City;

  const NAMES = [['Agnes', 'Cilli', 'Edda', 'Gesa', 'Ilse', 'Kunigunde', 'Mechthild', 'Odilia', 'Rosalind', 'Trude', 'Walburga', 'Hedwig', 'Irmel', 'Liesel'],
    ['Bertold', 'Dietmar', 'Fridolin', 'Hagen', 'Jost', 'Lorenz', 'Notker', 'Pankraz', 'Severin', 'Ulrich', 'Veit', 'Wendelin', 'Gunther', 'Konrad']];
  const JOBS = [['Bäckerin', 'Wäscherin', 'Köhlerin', 'Weberin', 'Magd', 'Seilerin', 'Hebamme', 'Gerberin'],
    ['Gerber', 'Fuhrmann', 'Schreiber', 'Fischer', 'Hirte', 'Böttcher', 'Spielmann', 'Torwächter']];
  WD.SYM = {
    fieber: { name: 'Brennfieber', icon: '🌡️', cure: 'tee', hint: 'glüht und fantasiert' },
    beulen: { name: 'Graubeulen', icon: '🟣', cure: 'salbe', hint: 'dunkle Schwellungen am Hals' },
    husten: { name: 'Rasselhusten', icon: '💨', cure: 'dampf', hint: 'ringt nach Luft' },
    auszehrung: { name: 'Auszehrung', icon: '🥀', cure: 'brei', hint: 'zu schwach zum Stehen' },
    wunde: { name: 'Faulende Wunde', icon: '🩸', cure: 'verband', hint: 'Biss einer Pestratte' }
  };
  WD.CURES = {
    tee: { name: 'Weidenrindentee', icon: '🍵', cost: { herb: 4, water: 4 }, time: 20 },
    salbe: { name: 'Beulensalbe', icon: '🫙', cost: { herb: 3, med: 1 }, time: 30 },
    dampf: { name: 'Kräuterdampf', icon: '♨️', cost: { herb: 5, wood: 3 }, time: 24 },
    brei: { name: 'Kraftbrei', icon: '🥣', cost: { food: 8, herb: 1 }, time: 18 },
    verband: { name: 'Leinenverband', icon: '🩹', cost: { cloth: 2, med: 1 }, time: 22 }
  };
  WD.VIP = [
    { title: 'Ratsherr', g: 1, reward: { coin: 150, know: 30 } },
    { title: 'Händlerin aus dem Süden', g: 0, reward: { coin: 220 } },
    { title: 'Hauptmann der Torwache', g: 1, reward: { coin: 80, iron: 40 } },
    { title: 'Gelehrte vom Kloster', g: 0, reward: { know: 90 } },
    { title: 'Älteste der Bauern', g: 0, reward: { food: 160, herb: 40 } }
  ];
  WD.STAFF = {
    empfang: { name: 'Empfang', icon: '📋', lv: 1, desc: 'untersucht wartende Patienten von selbst' },
    pflege: { name: 'Pflegerin', icon: '🧑‍⚕️', lv: 2, desc: 'beginnt Behandlungen von selbst, jede Pflegerin +20 % Tempo' },
    trage: { name: 'Träger', icon: '🛏️', lv: 3, desc: 'entlässt Geheilte und erntet reife Beete' }
  };
  WD.SEEDS = {
    kraut: { name: 'Heilkraut', icon: '🌿', cost: { water: 6 }, time: 45, yield: { herb: 14 } },
    minze: { name: 'Bergminze', icon: '🍃', cost: { water: 10, herb: 4 }, time: 90, yield: { herb: 26, med: 3 } }
  };
  const DECAY = 100 / 360;            // Lebenskraft je Sekunde und Schweregrad ohne Behandlung (leicht: 6 min, schwer: 2 min)

  WD.state = function (S) {
    if (!S.ward) S.ward = { uid: 0, list: [], staff: { empfang: 0, pflege: 0, trage: 0 }, beds: [], next: S.time + 20 };
    return S.ward;
  };
  WD.level = S => C().lv(S, 'heilstube') + 2 * C().lv(S, 'lazarett');
  WD.cap = S => { const l = WD.level(S); return l ? Math.min(12, 2 + l) : 0; };
  WD.bedCount = S => { const k = C().lv(S, 'kraeuter'); return k ? Math.min(6, 1 + k) : 0; };
  WD.staffMax = (S, k) => Math.max(0, C().lv(S, 'heilstube') - WD.STAFF[k].lv + 1);
  WD.hireCost = (S, k) => ({ coin: 60 * (WD.state(S).staff[k] + 1) });
  WD.cureOf = c => WD.CURES[WD.SYM[c.sym].cure];
  WD.sickN = S => S.pop.i + S.pop.q + S.pop.t;

  function rng(S) { return PW.makeRng('ward' + S.seed + ':' + (WD.state(S).uid)); }
  function pick(r, a) { return a[Math.floor(r() * a.length) % a.length]; }

  WD.spawn = function (S, force) {
    const W = WD.state(S);
    if (!force && (W.list.length >= WD.cap(S) || WD.sickN(S) <= W.list.length)) return null;
    W.uid++;
    const r = rng(S), syms = Object.keys(WD.SYM);
    const vip = PW.dayNo(S) >= 2 && r() < 0.12 ? Math.floor(r() * WD.VIP.length) : null;
    const g = vip != null ? WD.VIP[vip].g : (r() < 0.5 ? 0 : 1);
    const c = { id: W.uid, name: pick(r, NAMES[g]), job: vip != null ? WD.VIP[vip].title : pick(r, JOBS[g]), sym: pick(r, syms),
      sev: 1 + Math.floor(r() * (PW.dayNo(S) >= 4 ? 3 : 2)), st: 'wartet', hp: 100, t: 0, vip };
    if (vip != null) c.sev = Math.max(2, c.sev);
    W.list.push(c);
    if (vip != null) PW.log(S, '🎩 Hoher Besuch im Lazarett: ' + c.name + ', ' + c.job + ' – gute Pflege wird reich belohnt', 'gut');
    return c;
  };

  // Ein Bewohner aus der Krankenzählung wechselt den Zustand (zuerst aus den Betten)
  function takeSick(S, to) {
    const p = S.pop;
    for (const k of ['t', 'q', 'i']) if (p[k] > 0) { p[k]--; p[to]++; return true; }
    return false;
  }

  WD.why = function (S, c, act) {
    if (!c) return 'Patient nicht gefunden';
    if (act === 'exam') return c.st === 'wartet' ? null : 'Schon untersucht';
    if (act === 'treat') {
      if (c.st !== 'untersucht') return c.st === 'wartet' ? 'Erst untersuchen' : 'Läuft schon';
      const cu = WD.cureOf(c);
      return PW.canPay(S.res, cu.cost) ? null : 'Es fehlt: ' + PW.costText(PW.missing ? PW.missing(S.res, cu.cost) : cu.cost);
    }
    if (act === 'out') return c.st === 'gesund' ? null : 'Noch nicht geheilt';
    return 'Unbekannt';
  };
  WD.exam = function (S, id) {
    const c = WD.state(S).list.find(x => x.id === id); if (WD.why(S, c, 'exam')) return false;
    c.st = 'untersucht'; return true;
  };
  WD.treat = function (S, id) {
    const c = WD.state(S).list.find(x => x.id === id); if (WD.why(S, c, 'treat')) return false;
    const cu = WD.cureOf(c); PW.pay(S.res, cu.cost);
    c.st = 'behandlung'; c.t = cu.time * (0.7 + 0.3 * c.sev); c.tot = c.t; return true;
  };
  WD.reward = function (S, c) {
    const r = { coin: 8 + 6 * c.sev, know: 2 * c.sev };
    if (c.vip != null) for (const k in WD.VIP[c.vip].reward) r[k] = (r[k] || 0) + WD.VIP[c.vip].reward[k];
    return r;
  };
  WD.discharge = function (S, id) {
    const W = WD.state(S), c = W.list.find(x => x.id === id); if (WD.why(S, c, 'out')) return null;
    W.list.splice(W.list.indexOf(c), 1);
    takeSick(S, 'rec');
    const r = WD.reward(S, c); PW.addRes(S.res, r, S._caps);
    S.pop.sat = Math.min(100, S.pop.sat + (c.vip != null ? 4 : 1.5));
    PW.stat(S, 'cured'); PW.stat(S, 'wardCured'); if (c.vip != null) PW.stat(S, 'vipCured');
    PW.log(S, '💚 ' + c.name + ' (' + c.job + ') ist genesen: ' + PW.costText(r), 'gut');
    return r;
  };
  WD.hire = function (S, k) {
    const W = WD.state(S);
    if (!WD.STAFF[k] || W.staff[k] >= WD.staffMax(S, k)) return false;
    const cost = WD.hireCost(S, k); if (!PW.canPay(S.res, cost)) return false;
    PW.pay(S.res, cost); W.staff[k]++; return true;
  };
  WD.plant = function (S, i, seed) {
    const W = WD.state(S), sd = WD.SEEDS[seed]; if (!sd || i < 0 || i >= WD.bedCount(S)) return false;
    const b = W.beds[i]; if (b && b.st !== 'leer') return false;
    if (!PW.canPay(S.res, sd.cost)) return false;
    PW.pay(S.res, sd.cost); W.beds[i] = { st: 'waechst', seed, t: sd.time, tot: sd.time }; return true;
  };
  WD.harvest = function (S, i) {
    const W = WD.state(S), b = W.beds[i]; if (!b || b.st !== 'reif') return null;
    const y = WD.SEEDS[b.seed].yield; PW.addRes(S.res, y, S._caps); W.beds[i] = { st: 'leer' };
    PW.stat(S, 'harvests'); return y;
  };

  WD.tick = function (S, dt) {
    const W = WD.state(S);
    if (!WD.level(S)) { W.list.length = 0; return; }
    // neue Patienten, häufiger bei vielen Kranken
    if (S.time >= W.next) {
      WD.spawn(S);
      const sick = WD.sickN(S) / Math.max(1, PW.Econ.popTotal(S.pop));
      W.next = S.time + (30 + 30 * rng(S)()) / (1 + 3 * sick);
    }
    // Abgleich mit der Bevölkerung: Wer inzwischen von selbst genesen (oder gestorben) ist, verlässt die Liste
    let extra = W.list.length - WD.sickN(S);
    if (extra > 0) {
      const order = W.list.slice().sort((x, y) => (x.st === 'wartet' ? 0 : x.st === 'untersucht' ? 1 : x.st === 'gesund' ? 3 : 2) - (y.st === 'wartet' ? 0 : y.st === 'untersucht' ? 1 : y.st === 'gesund' ? 3 : 2) || y.hp - x.hp);
      for (const c of order) { if (extra <= 0) break; W.list.splice(W.list.indexOf(c), 1); extra--; if (c.st !== 'gesund') PW.log(S, '🏠 ' + c.name + ' hat sich zu Hause erholt', 'info'); }
    }
    const speed = 1 + 0.2 * W.staff.pflege;
    for (let k = W.list.length - 1; k >= 0; k--) {
      const c = W.list[k];
      if (c.st === 'behandlung') { c.t -= dt * speed; c.hp = Math.min(100, c.hp + dt * 2); if (c.t <= 0) { c.st = 'gesund'; c.t = 0; } continue; }
      if (c.st === 'gesund') continue;
      c.hp -= DECAY * c.sev * dt;
      if (c.hp <= 0) {
        W.list.splice(k, 1);
        if (c.sev >= 3) {
          takeSick(S, 'dead'); S.pop.grief = (S.pop.grief || 0) + (c.vip != null ? 3 : 1); PW.stat(S, 'deaths');
          PW.log(S, '🕯️ ' + c.name + ' (' + c.job + ') ist im Lazarett gestorben – niemand kam rechtzeitig', 'warn');
        } else { S.pop.sat = Math.max(0, S.pop.sat - 2); PW.log(S, '🚪 ' + c.name + ' hat das Lazarett unbehandelt verlassen und liegt krank zu Hause', 'warn'); }
      }
    }
    // Personal arbeitet in festen Abständen
    W._acc = (W._acc || 0) + dt;
    if (W._acc >= 3) {
      W._acc = 0;
      let n = W.staff.empfang; W.list.forEach(c => { if (n > 0 && c.st === 'wartet') { c.st = 'untersucht'; n--; } });
      n = W.staff.pflege; W.list.slice().sort((a, b) => a.hp - b.hp).forEach(c => { if (n > 0 && c.st === 'untersucht' && WD.treat(S, c.id)) n--; });
      n = W.staff.trage; W.list.slice().forEach(c => { if (n > 0 && c.st === 'gesund') { WD.discharge(S, c.id); n--; } });
      for (let i = 0; i < W.beds.length && W.staff.trage; i++) WD.harvest(S, i);
    }
    W.beds.forEach(b => { if (b && b.st === 'waechst') { b.t -= dt; if (b.t <= 0) b.st = 'reif'; } });
    if (W.beds.length > WD.bedCount(S)) W.beds.length = WD.bedCount(S);
  };
  // Wie viele Dinge warten auf den Spieler (für Hinweise in der Leiste)
  WD.todo = function (S) {
    const W = S.ward; if (!W) return 0;
    return W.list.filter(c => c.st === 'wartet' || c.st === 'gesund' || (c.st === 'untersucht' && PW.canPay(S.res, WD.cureOf(c).cost))).length + W.beds.filter(b => b && b.st === 'reif').length;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = PW;
})(typeof window !== 'undefined' ? window : globalThis);
