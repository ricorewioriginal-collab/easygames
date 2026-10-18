/* Teams: Namen nur aus fester Vorschlagsliste (kein Freitext), max. 20 Mitglieder, Rollen leader/member,
 * Wochenziel = Summe der Ausbauschritte, Geschenke: 3 Spins, max. 5 je Sender und Tag, max. 1 je Empfänger und Tag */
'use strict';
const { fail, PID_RE, ID_RE, weekKey } = require('./util');

const NAMES = [
  'Sternenfänger', 'Windreiter', 'Inselhüter', 'Sonnenbauer', 'Wolkenseiler', 'Kompassfreunde', 'Glücksdreher', 'Runenrunde',
  'Leuchtturmcrew', 'Portalpioniere', 'Kristallsucher', 'Morgenrot', 'Abendstern', 'Wellenbrecher', 'Funkenflug', 'Zahnradzunft',
  'Himmelsbrücke', 'Sturmlichter', 'Ankerplatz', 'Mondscheinbande', 'Regenbogenteam', 'Schatzkarte', 'Kometenschweif', 'Gipfelstürmer',
  'Lagerfeuer', 'Blütenwind', 'Nordlichter', 'Südseegruppe', 'Wunderwerk', 'Reliktjäger', 'Brückenbauer', 'Sternwarte',
  'Wirbelwind', 'Goldene Möwen', 'Kleeblatt', 'Inselträumer', 'Spinmeister', 'Turmfalken', 'Zauberwald', 'Hafenfreunde'
];
const MAX_MEMBERS = 20, GIFT_SPINS = 3, GIFTS_PER_DAY = 5, GOAL_PER_MEMBER = 25;

module.exports = function teams(ctx) {
  const accs = () => ctx.store.data.accounts;

  function info(team, now) {
    const wk = weekKey(now);
    const members = team.members.map(uid => {
      const a = accs()[uid];
      return { pid: ctx.pid(uid), name: a ? a.name : '?', role: uid === team.leader ? 'leader' : 'member', weekBuilds: a && a.week && a.week.k === wk ? a.week.n : 0 };
    });
    const progress = members.reduce((s, m) => s + m.weekBuilds, 0);
    return { id: team.id, name: team.name, members, count: members.length, max: MAX_MEMBERS, goal: GOAL_PER_MEMBER * members.length, progress, created: team.created };
  }

  function names() { return { names: NAMES.slice() }; }

  function create({ t, me, input, now }) {
    if (me.team) fail(409, 'already_in_team');
    if (typeof input.name !== 'string' || !NAMES.includes(input.name)) fail(400, 'bad_team_name');
    const id = ctx.SW.rng.uid(10);
    const team = t.put('teams', id, { id, name: input.name, leader: me.uid, members: [me.uid], created: now });
    me.team = id;
    return { team: info(team, now) };
  }

  function join({ t, me, input, now }) {
    if (me.team) fail(409, 'already_in_team');
    if (typeof input.team !== 'string' || !ID_RE.test(input.team)) fail(400, 'bad_team');
    const team = t.get('teams', input.team);
    if (!team) fail(404, 'team_not_found');
    if (team.members.length >= MAX_MEMBERS) fail(409, 'team_full');
    team.members.push(me.uid); me.team = team.id;
    return { team: info(team, now) };
  }

  function removeMember(t, uid) {
    const acc = t.get('accounts', uid);
    if (!acc || !acc.team) return;
    const team = t.get('teams', acc.team);
    acc.team = null;
    if (!team) return;
    team.members = team.members.filter(u => u !== uid);
    if (!team.members.length) t.del('teams', team.id);
    else if (team.leader === uid) team.leader = team.members[0];   // dienstältestes Mitglied übernimmt
  }

  function leave({ t, me }) {
    if (!me.team) fail(409, 'not_in_team');
    removeMember(t, me.uid);
    return { left: true };
  }

  function mine({ me, now }) {
    const team = me.team && ctx.store.data.teams[me.team];
    return { team: team ? info(team, now) : null };
  }

  function list({ query }) {
    const open = query.get('open') === '1';
    const all = Object.values(ctx.store.data.teams).filter(tm => !open || tm.members.length < MAX_MEMBERS);
    all.sort((a, b) => b.members.length - a.members.length || a.created - b.created);
    return { ok: true, result: { teams: all.slice(0, 50).map(tm => ({ id: tm.id, name: tm.name, count: tm.members.length, max: MAX_MEMBERS })) } };
  }

  function gift({ t, me, input, now }) {
    if (!me.team) fail(409, 'not_in_team');
    if (typeof input.to !== 'string' || !PID_RE.test(input.to)) fail(400, 'bad_target');
    const uid = ctx.uidOfPid(input.to);
    if (!uid || uid === me.uid) fail(400, 'bad_target');
    const to = t.get('accounts', uid);
    if (!to || to.team !== me.team) fail(409, 'not_team_member');
    if (me.gifts.to.length >= GIFTS_PER_DAY) fail(429, 'gift_limit');
    if (me.gifts.to.includes(uid)) fail(429, 'gift_limit_recipient');
    ctx.econ.normalize(to, now);
    me.gifts.to.push(uid);
    to.energy = Math.min(100000, to.energy + GIFT_SPINS);
    me.stats.giftsSent += 1; to.stats.giftsGot += 1;
    ctx.econ.pushHistory(to, { id: ctx.SW.rng.uid(10), t: now, kind: 'gift', role: 'in', pid: ctx.pid(me.uid), name: me.name, spins: GIFT_SPINS });
    return { sent: GIFT_SPINS, giftsLeft: GIFTS_PER_DAY - me.gifts.to.length };
  }

  return { NAMES, MAX_MEMBERS, names, create, join, leave, mine, list, gift, removeMember, info };
};
