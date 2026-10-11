/* AERU – datengetriebene Quest-Engine und Spielstand-Migration.
   Reine Logik ohne DOM und ohne Three.js: dieselbe Engine läuft im 3D-Spiel, im Canvas-2D-Modus und in den Node-Tests.
   Die Welt (game.js) meldet Ereignisse (emit/talk) und stellt Abfragen bereit; die Engine entscheidet über Fortschritt. */
'use strict';
(function (root) {
const SAVE_VERSION = 3, LEVELS = 6, GEMS_PER_LEVEL = 24;
// Sichtbare Questzustände (Masterprompt §4). Gespeichert werden nur available/active/done; die übrigen sind abgeleitet.
const STATE = {LOCKED: 'locked', AVAILABLE: 'available', ACTIVE: 'active', PARTIAL: 'partial', READY: 'ready', DONE: 'done'};
const STATE_LABEL = {locked: 'Noch nicht verfügbar', available: 'Verfügbar', active: 'Aktiv', partial: 'Teilziel erfüllt', ready: 'Bereit zum Abschluss', done: 'Abgeschlossen'};
// Weltzustände (Laternen, Ringe, Splitter) zählen nur rückwirkend, wenn der Schritt es ausdrücklich vorsieht (retro)
// oder sie nur innerhalb des Schritts entstehen können (Rätselreihenfolge). Zähler und Objekte laufen erst ab Aktivierung.
const passive = g => ['arrive', 'boss', 'enemy', 'item'].includes(g.type) || (['lantern', 'ring', 'gem'].includes(g.type) && (g.retro || g.order));

const grid = (fill) => Array.from({length: LEVELS}, fill);
function freshSave() {
  return {version: SAVE_VERSION, level: 0, checkpoint: null,
    collected: grid(() => []), lit: grid(() => []), rings: grid(() => []), cores: Array(LEVELS).fill(false),
    quests: {}, flags: {}, seen: {}, boss: {vesper: 6, stille: 9}, elapsed: 0, migration: null};
}
const uniqueInts = (list, max) => Array.isArray(list) ? [...new Set(list.filter(v => Number.isInteger(v) && v >= 0 && v < max))] : [];
function copyWorld(target, source) {
  for (const [key, max] of [['collected', GEMS_PER_LEVEL], ['lit', 3], ['rings', 3]])
    for (let i = 0; i < LEVELS; i++) target[key][i] = uniqueInts(source?.[key]?.[i], max);
}

// ───────── Bedingungen ─────────
function makeCondition(save) {
  function one(text) {
    if (!text) return true;
    if (text[0] === '!') return !one(text.slice(1));
    const [kind, id, n] = text.split(':'), rec = save.quests[id];
    if (kind === 'done') return rec?.s === 'done';
    if (kind === 'step') return rec?.s === 'done' || ((rec?.s === 'active') && rec.step >= Number(n));
    if (kind === 'flag') return save.flags[id] === true;
    if (kind === 'core') return save.cores[Number(id)] === true;
    throw new Error('Unbekannte Bedingung ' + text);
  }
  return (cond) => Array.isArray(cond) ? cond.every(one) : one(cond);
}

// ───────── Engine ─────────
function create(story, save, world) {
  const quests = story.quests, byId = new Map(quests.map(q => [q.id, q]));
  const cond = makeCondition(save);
  const pending = new Set(); // Quest-IDs, deren Schritt-Dialog gerade läuft (verhindert Doppelstart).
  const rec = id => save.quests[id];

  function speaker(id) {
    const npc = story.npcs[id] || {name: id, role: ''};
    let role = npc.role;
    for (const [c, r] of npc.roles || []) if (cond(c)) role = r;
    return {name: npc.name, role, portrait: npc.portrait || (npc.kind === 'dragon' ? '✺' : '❖')};
  }
  function lines(dialogId) {
    const d = story.dialogs[dialogId];
    if (!d) throw new Error('Dialog fehlt: ' + dialogId);
    return d.map(([who, text]) => ({...speaker(who), who, text}));
  }

  function status(id) {
    const r = rec(id), q = byId.get(id);
    if (!r) return STATE.LOCKED;
    if (r.s === 'done') return STATE.DONE;
    if (r.s === 'available') return STATE.AVAILABLE;
    const step = q.steps[r.step];
    if (r.step === q.steps.length - 1 && step.goal.type === 'talk' && r.step > 0) return STATE.READY;
    return r.step > 0 || r.n > 0 || r.items?.length ? STATE.PARTIAL : STATE.ACTIVE;
  }

  function stepSatisfied(q, r) {
    const step = q.steps[r.step], g = step.goal, level = q.level;
    switch (g.type) {
      case 'talk': return false; // Nur durch ein echtes Gespräch.
      case 'arrive': return world.level() === g.level && world.playing();
      case 'lantern': return world.count('lantern', level) >= g.count;
      case 'ring': return world.count('ring', level) >= g.count;
      case 'gem': return g.ids.every(id => world.hasGem(level, id));
      case 'enemy': return r.n >= g.count;
      case 'item': return g.ids.every(id => r.items.includes(id));
      case 'boss': return save.flags['boss:' + g.id] === true;
      default: throw new Error('Unbekannter Zieltyp ' + g.type);
    }
  }

  function advance(q, r) {
    r.step++; r.n = 0; r.items = [];
    if (r.step >= q.steps.length) {
      r.s = 'done'; r.step = q.steps.length;
      const reward = q.reward || {};
      if (Number.isInteger(reward.core)) world.grantCore(reward.core, q);
      if (reward.heal) world.heal(q);
      world.questDone(q);
      if (reward.ending) world.ending(q);
    }
    world.changed();
  }

  // Schließt einen Schritt ab. Hat er einen Dialog, zählt der Schritt erst nach dem letzten Satz.
  function finishStep(q, r, dialogId) {
    const index = r.step;
    if (!dialogId) { advance(q, r); return; }
    if (pending.has(q.id)) return;
    pending.add(q.id);
    world.dialog(dialogId, lines(dialogId), () => {
      pending.delete(q.id);
      save.seen[dialogId] = 1;
      if (rec(q.id) === r && r.s === 'active' && r.step === index) { advance(q, r); refresh(); }
    });
  }

  // Prüft passive Bedingungen (Ankunft, rückwirkend zählende Weltzustände, Zähler) und schaltet Quests frei.
  function refresh() {
    let changed = true, guard = 0;
    while (changed && guard++ < 50) {
      changed = false;
      for (const q of quests) {
        let r = rec(q.id);
        if (!r) {
          if (!cond(q.when)) continue;
          r = save.quests[q.id] = {s: q.kind === 'side' ? 'available' : 'active', step: 0, n: 0, items: []};
          changed = true; world.changed();
        }
        if (r.s !== 'active' || pending.has(q.id)) continue;
        const step = q.steps[r.step];
        if (!step || !stepSatisfied(q, r)) continue;
        if (!passive(step.goal)) continue;
        finishStep(q, r, step.dialog || step.after);
        changed = true;
      }
    }
  }

  // Ereignisse aus der Welt. Zähler laufen nur für den gerade aktiven Schritt der passenden Insel.
  function emit(ev) {
    for (const q of quests) {
      const r = rec(q.id);
      if (r?.s !== 'active' || pending.has(q.id)) continue;
      const g = q.steps[r.step].goal;
      if (g.type !== ev.type || (ev.level !== undefined && ev.level !== q.level) || (g.kind && g.kind !== ev.kind)) continue;
      if (g.type === 'enemy') r.n++;
      if (g.type === 'item' && g.ids.includes(ev.id) && !r.items.includes(ev.id)) r.items.push(ev.id);
    }
    refresh();
    world.changed();
  }

  // Gespräch mit einer Figur: Questschritt > Nebenauftrag > Reaktion auf den Fortschritt.
  function talk(npc) {
    const ordered = [...quests].sort((a, b) => (a.kind === 'main' ? 0 : 1) - (b.kind === 'main' ? 0 : 1));
    for (const q of ordered) {
      const r = rec(q.id);
      if (!r || pending.has(q.id)) continue;
      const step = q.steps[r.step];
      if (r.s === 'available' && q.giver === npc && step.goal.type === 'talk' && step.goal.npc === npc) {
        r.s = 'active'; world.changed();
        finishStep(q, r, step.dialog);
        return true;
      }
      if (r.s === 'active' && step.goal.type === 'talk' && step.goal.npc === npc) {
        finishStep(q, r, step.dialog);
        return true;
      }
    }
    // Erinnerung bei laufendem Nebenauftrag, sonst Fortschrittsreaktion.
    let text = null;
    for (const [c, t] of story.reactions[npc] || []) if (cond(c)) text = t;
    const side = quests.find(q => q.giver === npc && rec(q.id)?.s === 'active');
    if (side) text = 'Denk an meine Bitte: ' + side.steps[rec(side.id).step].text + '.';
    if (!text) return false;
    world.dialog('react:' + npc, [{...speaker(npc), who: npc, text}], () => {});
    return true;
  }

  // ───────── Abfragen für Welt, HUD und Tagebuch ─────────
  const activeSteps = () => quests.filter(q => rec(q.id)?.s === 'active').map(q => ({quest: q, index: rec(q.id).step, step: q.steps[rec(q.id).step], record: rec(q.id)}));
  function wants(type, id, level) {
    return activeSteps().some(a => a.step.goal.type === type && (level === undefined || a.quest.level === level) && (id === undefined || a.step.goal.id === id || a.step.goal.ids?.includes(id) || a.step.goal.npc === id));
  }
  function wantedItems(level) {
    const out = new Set();
    for (const a of activeSteps()) if (a.step.goal.type === 'item' && a.quest.level === level) for (const id of a.step.goal.ids) if (!a.record.items.includes(id)) out.add(id);
    return out;
  }
  // Laternenregel für Rätselinseln: stumm bis zum Rätselschritt, dann feste Reihenfolge.
  function lanternRule(level) {
    for (const q of quests) {
      if (q.level !== level) continue;
      const index = q.steps.findIndex(s => s.goal.type === 'lantern' && s.goal.order);
      if (index < 0) continue;
      const r = rec(q.id);
      if (r?.s === 'done') return {mute: false, order: null};
      if (r?.s === 'active' && r.step === index) return {mute: false, order: q.steps[index].goal.order};
      return {mute: true, order: null};
    }
    return {mute: false, order: null};
  }
  function mainObjective() {
    const a = activeSteps().filter(x => x.quest.kind === 'main').sort((x, y) => x.quest.chapter - y.quest.chapter)[0];
    if (!a) return null;
    return {...describe(a), kind: 'main'};
  }
  function describe(a) {
    const g = a.step.goal, level = a.quest.level;
    let have = null, need = null;
    if (g.type === 'lantern' || g.type === 'ring') { have = Math.min(g.count, world.count(g.type, level)); need = g.count; }
    if (g.type === 'enemy') { have = a.record.n; need = g.count; }
    if (g.type === 'item') { have = a.record.items.length; need = g.ids.length; }
    if (g.type === 'gem') { have = g.ids.filter(id => world.hasGem(level, id)).length; need = g.ids.length; }
    return {quest: a.quest, step: a.step, index: a.index, level, goal: g, have, need, status: status(a.quest.id)};
  }
  function sideObjectives(level) { return activeSteps().filter(a => a.quest.kind === 'side' && a.quest.level === level).map(describe); }
  function journal() {
    return quests.map(q => {
      const r = rec(q.id);
      return {id: q.id, title: q.title, kind: q.kind, chapter: q.chapter, why: q.why, status: status(q.id), label: STATE_LABEL[status(q.id)],
        steps: q.steps.map((s, i) => ({text: s.text, done: r ? (r.s === 'done' || (r.s === 'active' && i < r.step)) : false, current: r?.s === 'active' && i === r.step}))};
    });
  }
  const chapterDone = c => quests.filter(q => q.chapter === c && q.kind === 'main').every(q => rec(q.id)?.s === 'done');
  const storyComplete = () => quests.filter(q => q.kind === 'main').every(q => rec(q.id)?.s === 'done');
  const npcPlacement = (npc, level) => {
    const def = story.npcs[npc];
    for (const a of def.appear || []) if (a.level === level && cond(a.when) && !(a.unless && cond(a.unless))) return a;
    return def.level === level && def.slot ? {slot: def.slot} : null;
  };
  return {talk, emit, refresh, status, wants, wantedItems, lanternRule, mainObjective, sideObjectives, journal, chapterDone, storyComplete,
    lines, speaker, cond, npcPlacement, cancel: () => pending.clear(), hasPending: () => pending.size > 0, STATE_LABEL};
}

// ───────── Speichern und Migration ─────────
// v1/v2 (sechs Inseln mit Laternen-/Splitterquoten) → v3 (Kapitel und Quests). Gibt null zurück, wenn nichts Lesbares vorliegt.
function migrate(raw, story) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  if (raw.version === SAVE_VERSION) return sanitize(raw, story);
  if (raw.version !== 1 && raw.version !== 2) return null;
  const save = freshSave(), notes = [];
  copyWorld(save, raw);
  save.elapsed = Number.isFinite(raw.elapsed) ? Math.max(0, raw.elapsed) : 0;
  const oldCores = Array.from({length: LEVELS}, (_, i) => raw.cores?.[i] === true);
  // Das alte Vesper-Finale (won) setzte die ersten drei Kerne voraus.
  if (raw.won === true) for (let i = 0; i < 3; i++) oldCores[i] = true;
  let completed = 0;
  while (completed < LEVELS && oldCores[completed]) completed++;
  if (oldCores.slice(completed).some(Boolean)) notes.push('Leuchtkerne außerhalb der Reihenfolge wurden nicht übernommen. Ihre Splitter, Laternen und Ringe bleiben erhalten.');
  const mains = story.quests.filter(q => q.kind === 'main');
  const finishedChapters = Math.min(completed, LEVELS - 1);
  for (const q of mains) if (q.chapter < finishedChapters) save.quests[q.id] = {s: 'done', step: q.steps.length, n: 0, items: []};
  for (let c = 0; c < finishedChapters; c++) save.cores[c] = true;
  if (finishedChapters > 2) save.flags['boss:vesper'] = true;
  if (completed === LEVELS) {
    // Alte Erweiterung abgeschlossen: Hafenaufgaben gelten als erledigt, das neue Gesamtfinale wartet noch.
    const harbor = mains.find(q => q.chapter === LEVELS - 1 && !q.steps.some(s => s.goal.type === 'boss'));
    if (harbor) save.quests[harbor.id] = {s: 'done', step: harbor.steps.length, n: 0, items: []};
    notes.push('Dein Spielstand hatte alle sechs alten Inseln abgeschlossen. Die neue Geschichte endet mit einem neuen Finale in den Morgenruinen – es wartet auf dich. Alle Inseln bleiben über die Inselwahl erreichbar.');
  } else if (completed > 0) {
    notes.push(`Die ersten ${completed} Kapitel wurden aus deinem Spielstand übernommen. Das Tagebuch im Pausenmenü fasst die bisherige Geschichte zusammen.`);
  }
  if (raw.won === true && completed >= 3) notes.push('Den Kampf gegen Vesper hattest du bereits gewonnen. In der neuen Geschichte geht es danach nahtlos weiter.');
  for (const q of story.quests.filter(q => q.kind === 'side'))
    if (raw.side?.[q.chapter] === true && q.chapter <= Math.max(finishedChapters, completed === LEVELS ? LEVELS - 1 : finishedChapters))
      save.quests[q.id] = {s: 'done', step: q.steps.length, n: 0, items: []};
  // Rätselinseln: halb entzündete Laternen müssen in neuer Reihenfolge geweckt werden.
  for (const q of mains) if (q.steps.some(s => s.goal.order) && save.quests[q.id]?.s !== 'done' && save.lit[q.level].length) {
    save.lit[q.level] = [];
    notes.push('Die Laternen im Bernsteinhain folgen jetzt einem Lied und wurden dafür wieder gelöscht.');
  }
  const maxLevel = completed === LEVELS ? LEVELS - 1 : finishedChapters;
  save.level = Number.isInteger(raw.level) ? Math.max(0, Math.min(raw.level, maxLevel)) : 0;
  save.migration = {from: raw.version, notes};
  return save;
}

function sanitize(raw, story) {
  const save = freshSave();
  copyWorld(save, raw);
  save.elapsed = Number.isFinite(raw.elapsed) ? Math.max(0, raw.elapsed) : 0;
  for (const key of ['vesper', 'stille']) if (Number.isFinite(raw.boss?.[key])) save.boss[key] = Math.max(0, Math.min(save.boss[key], Math.round(raw.boss[key])));
  if (raw.flags && typeof raw.flags === 'object') for (const [k, v] of Object.entries(raw.flags)) if (v === true) save.flags[k] = true;
  if (raw.seen && typeof raw.seen === 'object') for (const k of Object.keys(raw.seen)) if (story.dialogs[k]) save.seen[k] = 1;
  const byId = new Map(story.quests.map(q => [q.id, q]));
  if (raw.quests && typeof raw.quests === 'object') for (const [id, r] of Object.entries(raw.quests)) {
    const q = byId.get(id);
    if (!q || !r || !['available', 'active', 'done'].includes(r.s)) continue;
    const step = r.s === 'done' ? q.steps.length : (Number.isInteger(r.step) ? Math.max(0, Math.min(r.step, q.steps.length - 1)) : 0);
    const ids = new Set(q.steps.flatMap(s => s.goal.ids || []));
    save.quests[id] = {s: r.s, step, n: Number.isInteger(r.n) && r.n > 0 ? r.n : 0, items: Array.isArray(r.items) ? [...new Set(r.items.filter(i => ids.has(i)))] : []};
  }
  // Widersprüche reparieren: Eine Hauptquest gilt nur als erledigt, wenn ihre Vorgänger erledigt sind.
  const cond = makeCondition(save);
  for (const q of story.quests) if (save.quests[q.id] && !cond(q.when)) delete save.quests[q.id];
  for (const q of story.quests) if (q.reward && Number.isInteger(q.reward.core)) save.cores[q.reward.core] = save.quests[q.id]?.s === 'done';
  let unlocked = 0;
  while (unlocked < LEVELS - 1 && save.cores[unlocked]) unlocked++;
  save.level = Number.isInteger(raw.level) ? Math.max(0, Math.min(raw.level, unlocked)) : 0;
  if (raw.checkpoint && Number.isFinite(raw.checkpoint.x) && Number.isFinite(raw.checkpoint.y) && Number.isFinite(raw.checkpoint.z) && raw.checkpoint.level === save.level)
    save.checkpoint = {level: save.level, x: raw.checkpoint.x, y: raw.checkpoint.y, z: raw.checkpoint.z};
  save.migration = raw.migration && Array.isArray(raw.migration.notes) && raw.migration.shown !== true ? {from: raw.migration.from, notes: raw.migration.notes.filter(n => typeof n === 'string')} : null;
  return save;
}

// Statische Prüfung der Storydaten (für Tests): IDs, Dialoge, Figuren, Reihenfolge.
function validate(story) {
  const errors = [], ids = new Set();
  for (const q of story.quests) {
    if (ids.has(q.id)) errors.push('Doppelte Quest ' + q.id);
    ids.add(q.id);
    if (!story.chapters[q.chapter]) errors.push(q.id + ': Kapitel fehlt');
    q.steps.forEach((s, i) => {
      if (!s.text) errors.push(`${q.id}[${i}]: Text fehlt`);
      for (const d of [s.dialog, s.after]) if (d && !story.dialogs[d]) errors.push(`${q.id}[${i}]: Dialog ${d} fehlt`);
      if (s.goal.type === 'talk' && !story.npcs[s.goal.npc]) errors.push(`${q.id}[${i}]: Figur ${s.goal.npc} fehlt`);
      if (s.goal.type === 'talk' && !s.dialog) errors.push(`${q.id}[${i}]: Gespräch ohne Dialog`);
      if (s.goal.type === 'item') for (const id of s.goal.ids) if (!story.items.some(it => it.id === id && it.level === q.level)) errors.push(`${q.id}[${i}]: Objekt ${id} fehlt auf Insel ${q.level}`);
    });
    for (const c of [].concat(q.when || [])) { const ref = c.replace('!', '').split(':')[1]; if (/^(done|step)/.test(c.replace('!', '')) && !story.quests.some(x => x.id === ref)) errors.push(q.id + ': Bedingung verweist auf ' + ref); }
  }
  for (const [d, list] of Object.entries(story.dialogs)) for (const [who] of list) if (!story.npcs[who]) errors.push(`Dialog ${d}: Sprecher ${who} fehlt`);
  for (const [npc, list] of Object.entries(story.reactions)) if (!story.npcs[npc]) errors.push('Reaktion für unbekannte Figur ' + npc); else for (const [c] of list) if (c && !/^!?(done|step|flag|core):/.test(c)) errors.push('Ungültige Bedingung ' + c);
  return errors;
}

root.AERU_QUESTS = {create, migrate, sanitize, validate, freshSave, STATE, STATE_LABEL, SAVE_VERSION};
})(typeof window !== 'undefined' ? window : globalThis);
