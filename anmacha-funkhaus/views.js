/* Funkhaus – Ansichten: was ein Mensch über das Haus wissen darf (für Gastgeber-Bildschirm und Handy gleich). */
import { alive, nomCandidates, heart, stars, isAlly, taskKind, SLOTS } from './engine.js';
const one = (G, me, o) => ({ i: o.i, heart: heart(o.sym[me]), stars: stars(o.pop), ally: isAlly(G, me, o.i), immune: o.immune, human: o.human >= 0 });
export const planView = (G, i) => ({ kind: 'plan', me: i, week: G.week, day: G.day + 1, slots: SLOTS, others: alive(G).filter(o => o.i !== i).map(o => one(G, i, o)), mood: Math.round(G.res[i].mood), stars: stars(G.res[i].pop) });
export const nomView = (G, i) => ({ kind: 'nom', me: i, week: G.week, others: nomCandidates(G, i).map(j => one(G, i, G.res[j])), immuneIds: alive(G).filter(o => o.immune).map(o => o.i) });
export const taskView = G => ({ kind: 'task', task: taskKind(G), seed: G.seed * 31 + G.week * 7 });
/** öffentlicher Zustand für Kopfzeile, Besetzungsleiste und Handys */
export const publicState = (G, info) => ({ week: G.week, day: Math.min(G.day + 1, 3), phase: G.phase, final: !!G.finalWeek, cast: G.res.map(r => ({ i: r.i, n: r.n, alive: r.alive, immune: r.immune, nom: G.nominees.includes(r.i), stars: stars(r.pop), human: r.human, traits: r.traits, mood: Math.round(r.mood), look: info[r.i].look, age: info[r.i].age, job: info[r.i].job, bio: info[r.i].bio })), allies: G.allies });
