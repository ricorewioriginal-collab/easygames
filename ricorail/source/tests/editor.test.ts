import { describe, it, expect } from 'vitest';
import { EditModel } from '../src/editor/model';
import { validate } from '../src/railway/validate';

/** Strecke West–Ost mit Kreuzungsgleis (Überholgleis) zwischen W1 und W2 */
function passingLoop() {
  const m = EditModel.empty('Testlinie');
  const A = m.addNode(0, 0, 50), W1 = m.addNode(1000, 0, 50), W2 = m.addNode(2000, 0, 50), B = m.addNode(3000, 0, 50);
  const tA = m.addTrack(A, W1, { vmax: 120 });
  const tMain = m.addTrack(W1, W2, { vmax: 120 });
  const tLoop = m.addTrack(W1, W2, { vmax: 60, ctrl: { x: 1500, z: -60 } });
  const tB = m.addTrack(W2, B, { vmax: 120 });
  const sw = m.autoSwitches();
  // Einfahrsignale an beiden Enden, Ausfahrsignale auf Haupt- und Kreuzungsgleis
  m.addSignal(tA, 1, 'main', 'E-West');
  m.addSignal(tB, -1, 'main', 'E-Ost');
  m.addSignal(tMain, 1, 'main'); m.addSignal(tMain, -1, 'main');
  m.addSignal(tLoop, 1, 'main'); m.addSignal(tLoop, -1, 'main');
  m.addPlatform(tMain, 350, 650, 'R', 'Mittelstadt');
  const loopLen = m.trackLen(tLoop);
  m.addPlatform(tLoop, loopLen / 2 - 150, loopLen / 2 + 150, 'L', 'Mittelstadt');
  return { m, ids: { A, W1, W2, B, tA, tMain, tLoop, tB }, sw };
}

describe('EditModel', () => {
  it('baut ein Netz mit Kreuzungsgleis ohne Fehler', () => {
    const { m, ids, sw } = passingLoop();
    expect(sw).toEqual({ added: 2, removed: 0 });
    const w1 = m.def.switches.find((s) => s.node === ids.W1)!;
    expect(w1.trunk).toBe(ids.tA);
    expect(w1.legs).toEqual([ids.tMain, ids.tLoop]); // gerade zuerst
    const w2 = m.def.switches.find((s) => s.node === ids.W2)!;
    expect(w2.trunk).toBe(ids.tB);
    expect(m.def.stations.length).toBe(1);
    expect(m.def.stations[0].platforms.map((p) => p.nr)).toEqual(['1', '2']);
    const errs = m.validate().filter((i) => i.sev === 'error');
    expect(errs).toEqual([]);
    const res = validate(m.def);
    expect(res.il!.routes.length).toBeGreaterThan(0);
    // Punkte etwa alle 10 m, Höhe übernommen
    const t = m.track(ids.tMain);
    expect(t.pts.length / 3).toBe(101);
    expect(t.pts[1]).toBe(50);
    expect(m.ok()).toBe(true);
  });

  it('Rückgängig/Wiederholen stellt exaktes JSON wieder her', () => {
    const { m, ids } = passingLoop();
    const j0 = m.toJSON();
    m.setTrackProps(ids.tMain, { vmax: 80, elec: true, tunnel: true });
    const j1 = m.toJSON();
    expect(m.track(ids.tMain).vmax).toBe(80);
    m.moveNode(ids.B, 3100, 50);
    const j2 = m.toJSON();
    expect(m.undo()).toBe(true); expect(m.toJSON()).toBe(j1);
    expect(m.undo()).toBe(true); expect(m.toJSON()).toBe(j0);
    expect(m.canRedo).toBe(true);
    m.redo(); expect(m.toJSON()).toBe(j1);
    m.redo(); expect(m.toJSON()).toBe(j2);
    expect(m.canRedo).toBe(false);
    // neue Änderung löscht Wiederholen
    m.undo(); m.setTrackProps(ids.tA, { bridge: true }); expect(m.canRedo).toBe(false);
  });

  it('Transaktion = ein Schritt; Verlauf auf 100 begrenzt', () => {
    const { m, ids } = passingLoop();
    const j0 = m.toJSON();
    m.begin(); for (let i = 1; i <= 20; i++) m.moveNode(ids.B, 3000 + i, 0); m.end();
    m.undo(); expect(m.toJSON()).toBe(j0);
    for (let i = 0; i < 130; i++) m.setTrackProps(ids.tA, { vmax: 50 + (i % 50) });
    let n = 0; while (m.undo()) n++;
    expect(n).toBe(100);
  });

  it('toJSON/fromJSON Rundreise und Schemaprüfung', () => {
    const { m } = passingLoop();
    const m2 = EditModel.fromJSON(m.toJSON());
    expect(m2.toJSON()).toBe(m.toJSON());
    expect(() => EditModel.fromJSON('{kaputt')).toThrow(/kein gültiges JSON/);
    expect(() => EditModel.fromJSON('{"nodes":[]}')).toThrow(/schema/);
    expect(() => EditModel.fromJSON('{"schema":7,"nodes":[],"tracks":[]}')).toThrow(/nicht unterstützt/);
  });

  it('Streckenvorlage f4 ist eine fehlerfreie Kopie', () => {
    const m = EditModel.fromRoute('f4');
    expect(m.def.id.startsWith('custom-')).toBe(true);
    expect(m.def.world).toBe('custom');
    expect(m.validate().filter((i) => i.sev === 'error')).toEqual([]);
    // Weichenautomatik ändert ein gültiges Netz nicht
    const j = m.toJSON(); m.autoSwitches();
    expect(m.def.switches).toEqual(JSON.parse(j).switches);
  });

  it('Gleis löschen und rückgängig machen', () => {
    const { m, ids } = passingLoop();
    const j0 = m.toJSON();
    m.deleteTrack(ids.tLoop);
    expect(m.def.tracks.some((t) => t.id === ids.tLoop)).toBe(false);
    expect(m.def.signals.some((s) => s.track === ids.tLoop)).toBe(false);
    expect(m.def.stations[0].platforms.length).toBe(1);
    // Weichen an W1/W2 sind mit dem Gleis entfallen
    expect(m.def.switches).toEqual([]);
    expect(m.validate().filter((i) => i.sev === 'error')).toEqual([]);
    m.undo();
    expect(m.toJSON()).toBe(j0);
  });

  it('Gleis teilen verschiebt Signale, Bahnsteige und Weichenbezüge', () => {
    const { m, ids } = passingLoop();
    const n = m.splitTrack(ids.tMain, 800);
    const t1 = m.track(ids.tMain), t2 = m.def.tracks.find((t) => t.a === n)!;
    expect(t1.b).toBe(n); expect(t2.b).toBe(ids.W2);
    expect(Math.round(m.trackLen(ids.tMain))).toBe(800);
    expect(m.def.signals.filter((s) => s.track === t2.id).map((s) => s.dir)).toEqual([1]);
    expect(m.def.switches.find((s) => s.node === ids.W2)!.legs).toContain(t2.id);
    expect(m.def.stations[0].platforms[0].track).toBe(ids.tMain); // Bahnsteig liegt vor dem Teilungspunkt
    expect(m.validate().filter((i) => i.sev === 'error')).toEqual([]);
    m.undo(); expect(m.def.tracks.length).toBe(4);
  });

  it('Weichenautomatik entfernt ungültige Weichen', () => {
    const { m, ids } = passingLoop();
    m.def.switches[0].legs = ['gibtsnicht', ids.tLoop]; // ungültig machen (ohne Verlauf)
    expect(m.validate().some((i) => i.sev === 'error')).toBe(true);
    const r = m.autoSwitches();
    expect(r).toEqual({ added: 1, removed: 1 });
    expect(m.validate().filter((i) => i.sev === 'error')).toEqual([]);
  });

  it('Bahnübergang, Industrie, Knoten löschen', () => {
    const { m, ids } = passingLoop();
    m.addCrossing(ids.tA, 400);
    m.addIndustry('Sägewerk', ids.tB, 100, 300, ['wood'], 'load');
    expect(m.validate().filter((i) => i.sev === 'error')).toEqual([]);
    m.deleteNode(ids.B);
    expect(m.def.industries).toEqual([]);
    expect(m.def.nodes.some((x) => x.id === ids.B)).toBe(false);
    expect(() => m.addTrack(ids.A, ids.A)).toThrow();
  });
});
