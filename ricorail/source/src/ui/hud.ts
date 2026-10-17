// HUD: Tacho, Geschwindigkeitsbegrenzung, Signal, nächster Halt, Fahrplan, Ziele, Meldungen, Warnungen,
// Minikarte und Touch-Bedienung (Fahr-/Bremshebel, Knöpfe). DOM wird nur bei Änderungen neu geschrieben.
import type { Game } from '../app/game';
import type { Session } from '../modes/session';
import type { Settings } from '../save/store';
import type { Action } from '../input/input';
import { lookahead } from '../operations/lookahead';
import { Map2D } from './map2d';
import { h, btn, clear, hhmm } from './dom';

type Mode = 'drive' | 'box' | 'world';

export class Hud {
  private el: HTMLElement;
  private g: Game;
  private s: Session;
  private set: Settings;
  private mode: Mode;
  private acc = 0;
  private mini: Map2D | null = null;
  private miniAcc = 0;
  private parts: Record<string, HTMLElement> = {};
  private cache: Record<string, string> = {};
  private knob: HTMLElement | null = null;
  private leverEl: HTMLElement | null = null;
  private dragging = false;
  private ctxBtns: HTMLElement | null = null;
  private visible = true;
  private replayOn = false;
  private goalsOpen = true;

  constructor(root: HTMLElement, game: Game, s: Session, settings: Settings, mode: Mode) {
    this.g = game; this.s = s; this.set = settings; this.mode = mode;
    const P = (k: string, el: HTMLElement) => (this.parts[k] = el);
    const touch = matchMedia('(pointer: coarse)').matches;
    const minimal = settings.hud === 'minimal';
    const drive = mode === 'drive' && !!s.player;

    const tl = h('div', { class: 'tl' });
    if (drive) {
      tl.appendChild(h('div', { class: 'box' },
        h('div', { class: 'row', style: 'gap:10px;align-items:center' },
          P('speed', h('div', { class: 'speed', 'aria-live': 'off' }, '0')),
          P('lim', h('div', { class: 'lim', title: 'Zulässige Geschwindigkeit' }, '–')),
          P('nlim', h('div', { class: 'lim next', title: 'Nächste Geschwindigkeitsänderung' }, ''))),
        P('nlimd', h('div', { class: 'small muted' }, '')),
        h('div', { class: 'sig', style: 'margin-top:4px' }, P('lamp', h('span', { class: 'lamp' })), P('sigt', h('span', { class: 'small' }, ''))),
        P('info', h('div', { class: 'small muted', style: 'margin-top:4px' }, '')),
        P('ctl', h('div', { class: 'small', style: 'margin-top:2px' }, ''))));
    } else {
      tl.appendChild(h('div', { class: 'box' }, P('clock', h('div', { style: 'font-weight:700;font-size:1.3em' }, '')), P('info', h('div', { class: 'small muted' }, ''))));
    }
    if (!minimal || mode !== 'drive') tl.appendChild(P('msgs', h('div', { class: 'msgs', 'aria-live': 'polite' })));

    const tr = h('div', { class: 'tr' },
      h('div', { class: 'row', style: 'gap:6px' },
        btn('⏸', () => this.g.setPaused(true), 'tbtn', { title: 'Pause (Esc)', 'aria-label': 'Pause' }),
        btn('❓', () => this.g.showHelp(), 'tbtn', { title: 'Hilfe (F1)', 'aria-label': 'Hilfe' }),
        btn('🗺', () => this.act('map'), 'tbtn', { title: 'Karte (M)', 'aria-label': 'Karte' }),
        btn('🎥', () => this.act('camera'), 'tbtn', { title: 'Kamera (C)', 'aria-label': 'Kamera wechseln' }),
        P('warp', btn('×1', () => this.act('timewarp'), 'tbtn', { title: 'Zeitraffer (Tab)', 'aria-label': 'Zeitraffer' }))));
    if (drive) tr.appendChild(P('stop', h('div', { class: 'box small' }, '')));
    const narrow = innerWidth < 700;
    this.goalsOpen = !narrow;
    if (s.goals.length) tr.appendChild(P('goals', h('div', { class: 'box goals', role: 'button', tabindex: '0', title: 'Ziele ein-/ausklappen', onclick: () => { this.goalsOpen = !this.goalsOpen; this.cache.goals = ''; this.acc = 1; } })));
    if (drive && !minimal && !narrow) {
      const cv = h('canvas', { class: 'minimap', 'aria-label': 'Minikarte' });
      tr.appendChild(h('div', { class: 'box', style: 'padding:4px' }, cv));
      try { this.mini = new Map2D(cv, s.world, { interactive: false, compact: true, follow: () => this.s.player?.id ?? null }); } catch { this.mini = null; }
    }

    const warn = P('warn', h('div', { class: 'warnbig', role: 'alert' }, ''));
    const repl = P('replay', h('div', { class: 'warnbig', style: 'background:rgba(30,90,160,.85);animation:none' }, '⏪ Wiederholung – F8 beendet'));

    const kids: HTMLElement[] = [tl, tr, warn, repl];
    if (drive) {
      // Fahr-/Bremshebel: oben = Fahren, Mitte = 0, unten = Bremsen
      const knob = h('div', { class: 'knob' });
      const lever = h('div', { class: 'lever', role: 'slider', 'aria-label': 'Fahr- und Bremshebel', 'aria-valuemin': '-100', 'aria-valuemax': '100', tabindex: '0' },
        h('div', { class: 'lbl', style: 'top:4px' }, 'Fahren'), h('div', { class: 'mid', style: 'top:50%' }), h('div', { class: 'lbl', style: 'bottom:4px' }, 'Bremsen'), knob);
      this.knob = knob; this.leverEl = lever;
      lever.addEventListener('pointerdown', this.lpd); lever.addEventListener('pointermove', this.lpm);
      lever.addEventListener('pointerup', this.lpu); lever.addEventListener('pointercancel', this.lpu);
      const left = settings.touchLayout === 'left';
      const B = (label: string, a: Action, title: string, hold = false) => {
        const b = h('button', { class: 'tbtn', type: 'button', title, 'aria-label': title }, label);
        if (hold) {
          b.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); this.g.onAction(a, true); b.classList.add('on'); });
          const up = () => { if (b.classList.contains('on')) { this.g.onAction(a, false); b.classList.remove('on'); } };
          b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up);
        } else b.addEventListener('click', (e) => { e.stopPropagation(); this.act(a); });
        return b;
      };
      const btns = h('div', { style: 'display:grid;grid-template-columns:repeat(2,54px);gap:6px' },
        B('📯', 'horn', 'Signalhorn (H)', true), B('🛑', 'emergency', 'Schnellbremsung (Leertaste)'),
        B('⚠', 'pzb', 'Wachsam / Sifa (V)'), B('🚪', 'doors', 'Türen freigeben (T)'),
        B('⇅', 'reverser', 'Richtungswender vor (R)'), B('⇵', 'reverserBack', 'Richtungswender zurück (⇧R)'));
      if (!touch) btns.style.display = 'none';
      const side = h('div', { class: left ? 'bl' : 'br', style: 'display:flex;gap:8px;align-items:flex-end' + (left ? '' : ';flex-direction:row-reverse') }, lever, btns);
      const other = h('div', { class: left ? 'br' : 'bl' }, P('ctlinfo', h('div', { class: 'box small ctlinfo', style: 'min-width:130px' }, '')));
      kids.push(side, other);
    }
    this.ctxBtns = h('div', { class: 'bc' });
    kids.push(this.ctxBtns);
    this.el = h('div', { class: 'hud' }, ...kids);
    root.appendChild(this.el);
    this.update(1);
  }

  private act(a: Action) { this.g.onAction(a, true); this.g.onAction(a, false); }

  // ---------------------------------------------------- Hebel
  private leverFromY(e: PointerEvent) {
    const r = this.leverEl!.getBoundingClientRect();
    const f = 1 - (e.clientY - r.top - 20) / Math.max(1, r.height - 40); // 0 unten .. 1 oben
    let v = f * 2 - 1;
    if (Math.abs(v) < 0.06) v = 0;
    this.g.setLever(Math.max(-1, Math.min(1, v)));
  }
  private lpd = (e: PointerEvent) => { e.preventDefault(); e.stopPropagation(); this.dragging = true; this.leverEl!.setPointerCapture?.(e.pointerId); this.leverFromY(e); };
  private lpm = (e: PointerEvent) => { if (this.dragging) { e.stopPropagation(); this.leverFromY(e); } };
  private lpu = () => { this.dragging = false; };

  setVisible(v: boolean) { this.visible = v; this.el.style.display = v ? '' : 'none'; }
  setReplay(on: boolean) { this.replayOn = on; this.parts.replay?.classList.toggle('on', on); }

  /** Text nur setzen, wenn er sich geändert hat */
  private put(k: string, text: string) { const el = this.parts[k]; if (!el || this.cache[k] === text) return; this.cache[k] = text; el.textContent = text; }
  private html(k: string, key: string, build: () => (HTMLElement | string)[]) {
    const el = this.parts[k]; if (!el || this.cache[k] === key) return; this.cache[k] = key; clear(el); for (const c of build()) el.append(c);
  }

  update(dt: number) {
    if (!this.visible) return;
    // Hebelstellung jedes Bild (flüssig)
    if (this.knob && this.leverEl) {
      const L = this.g.getLever();
      const H = this.leverEl.clientHeight || 200;
      this.knob.style.top = `${(1 - (L + 1) / 2) * (H - 40)}px`;
      this.leverEl.setAttribute('aria-valuenow', String(Math.round(L * 100)));
    }
    this.miniAcc += dt;
    if (this.mini && this.miniAcc > 0.25) { this.miniAcc = 0; this.mini.draw(); }
    this.acc += dt;
    if (this.acc < 0.2) return;
    this.acc = 0;
    const s = this.s, w = s.world, t = s.player;
    this.put('warp', `×${this.g.warpFactor}`);
    this.put('clock', hhmm(w.time));
    // Meldungen der letzten 12 s
    const recent = s.messages.filter((m) => w.time - m.t < 12 * this.g.warpFactor).slice(-4);
    this.html('msgs', recent.map((m) => m.t + m.msg).join('|'), () => recent.map((m) => h('div', { class: m.sev }, m.msg)));
    // Ziele
    if (s.goals.length) this.html('goals', this.goalsOpen + s.goals.map((g) => `${g.text}${g.done}${g.failed}${g.value ?? ''}`).join('|'), () => [
      h('div', { style: 'font-weight:700;margin-bottom:2px' }, `${this.goalsOpen ? '▾' : '▸'} Ziele ${s.goals.filter((g) => g.done).length}/${s.goals.length}${s.goals.some((g) => g.failed) ? ' ✖' : ''}`),
      ...(!this.goalsOpen ? [] : s.goals).map((g) => h('div', { class: g.done ? 'ok' : g.failed ? 'bad' : '' }, `${g.done ? '✔' : g.failed ? '✖' : '○'} ${g.text}${g.value ? ` (${g.value})` : ''}`)),
    ]);
    if (!t || this.mode !== 'drive') {
      const n = w.trains.size;
      this.put('info', `${n} Züge · ${w.weather.kind === 'clear' ? 'klar' : w.weather.kind}${this.mode === 'box' ? ' · Stellwerk' : ''}`);
      this.ctxButtons([]);
      return;
    }
    const la = lookahead(w.net, w.il, t.head, 3000, { pass: t.meta.zs1 as string | undefined });
    const kmh = Math.abs(t.kmh);
    const lim = w.limitUnder(t);
    this.put('speed', String(Math.round(kmh)));
    this.put('lim', String(Math.round(lim)));
    this.parts.speed?.classList.toggle('bad', kmh > lim + 3);
    const nl = la.targets.find((x) => x.kind === 'limit' && x.v * 3.6 < lim - 1);
    const nlim = this.parts.nlim;
    if (nlim) nlim.style.visibility = nl ? 'visible' : 'hidden';
    this.put('nlim', nl ? String(Math.round(nl.v * 3.6)) : '');
    this.put('nlimd', nl ? `in ${fmtDist(nl.d)}` : '');
    const sig = la.targets.find((x) => x.kind === 'signal');
    const asp = sig?.sig?.aspect ?? 'none';
    const lamp = this.parts.lamp;
    if (lamp) lamp.className = `lamp ${asp === 'stop' ? 'stop' : asp === 'go' ? 'go' : asp === 'none' ? '' : 'caution'}`;
    const aspTxt: Record<string, string> = { stop: 'Halt', go: 'Fahrt', caution: 'Halt erwarten', slow: 'Langsamfahrt', none: '' };
    this.put('sigt', sig ? `${aspTxt[asp] ?? asp}${sig.sig?.speed ? ` ${sig.sig.speed} km/h` : ''} · ${fmtDist(sig.d)}` : 'kein Signal voraus');
    const grade = Math.round(w.net.gradeAt(t.head) * 1000);
    this.put('info', `${hhmm(w.time)} · ${grade > 0 ? '↗' : grade < 0 ? '↘' : '→'} ${Math.abs(grade)} ‰ · ${w.weather.kind === 'clear' ? 'trocken' : w.rail === 'dry' ? 'Regen' : 'Schiene nass/glatt'}`);
    const c = t.ctl;
    const rv = c.reverser === 1 ? 'V' : c.reverser === -1 ? 'R' : '0';
    this.put('ctl', `Wender ${rv} · Fahren ${Math.round(c.throttle * 100)} % · Bremse ${Math.round(Math.max(c.brake, this.g.getBrake()) * 100)} %`);
    const air = `HLL ${t.brake.pipe.toFixed(1)} bar · Bz ${(t.brake.cyl * 3.8).toFixed(1)} bar`;
    const extra = t.traction === 'steam' ? `Kessel ${t.boiler.toFixed(1)} bar · Wasser ${Math.round(t.glass * 100)} % · Feuer ${Math.round(t.fire * 100)} %` : t.traction === 'electric' ? `Stromabn. ${c.panto ? 'oben' : 'unten'} · HS ${c.mainSwitch ? 'ein' : 'aus'}` : `Motor ${c.engine ? 'an' : 'aus'} · ${Math.round(t.engineRpm * 100)} %`;
    this.html('ctlinfo', air + extra + t.ai, () => [h('div', null, air), h('div', { class: 'muted' }, extra), t.ai ? h('div', null, '🤖 Automatik fährt') : '']);
    // Warnungen
    const z = w.pzb;
    const warn = t.forcedBrake ? (t.forcedBrake === '!PZB' ? 'PZB-Zwangsbremsung' : t.forcedBrake.includes('SPAD') ? 'Halt zeigendes Signal überfahren!' : t.forcedBrake.replace(/^!/, '')) : z.need > 0 ? 'PZB 1000 Hz – Wachsam (V)!' : t.sifaWarn ? 'Sifa – bitte quittieren (V)!' : kmh > lim + 5 ? `Zu schnell! ${Math.round(lim)} km/h` : '';
    this.put('warn', warn);
    this.parts.warn?.classList.toggle('on', !!warn && !this.replayOn);
    // Nächster Halt + Fahrplan
    const plan = w.plans.get(t.id);
    if (plan?.svc) {
      const svc = plan.svc;
      const rows = svc.stops.map((st, i) => ({ i, name: w.stations.get(st.st)?.name ?? st.st, time: st.dep ?? st.arr, pass: !!st.pass }));
      const cur = plan.stopIdx;
      const delay = Math.round(plan.delay / 60);
      const key = `${cur}|${delay}|${plan.state}`;
      this.html('stop', key, () => {
        const here = plan.state === 'dwell' && cur > 0 ? cur - 1 : cur;
        const nx = rows[here];
        const list = rows.filter((r) => !r.pass && r.i >= cur - 1).slice(0, 6);
        return [
          h('div', { style: 'font-weight:700' }, nx ? `${plan.state === 'dwell' ? 'Halt' : 'Nächster Halt'}: ${nx.name}` : 'Endstation erreicht'),
          h('div', { class: 'muted' }, delay > 0 ? `+${delay} min Verspätung` : delay < 0 ? `${-delay} min zu früh` : 'pünktlich'),
          h('div', { class: 'tt' }, ...list.map((r) => h('div', { class: r.i < here ? 'done' : r.i === here ? 'cur' : '' }, `${r.time !== undefined ? hhmm(r.time) : '--:--'}  ${r.name}`))),
        ];
      });
    } else if (plan?.dest) this.put('stop', `Ziel: Gleis ${plan.dest}`);
    else this.put('stop', 'Freie Fahrt');
    // Kontextknöpfe
    const ctx: [string, Action][] = [];
    const still = Math.abs(t.v) < 0.1;
    if (sig && asp === 'stop' && sig.d < 250 && still && sig.ref && w.il.failedSignals.has(sig.ref)) ctx.push(['Ersatzsignal anfordern', 'zs1']);
    if (still && t.hasDoors && (c.releaseL || c.releaseR)) ctx.push(['Türen schließen', 'doorsClose']);
    if (still && s.opts.player.kind === 'free') { ctx.push(['Kuppeln', 'couple']); if (t.consist.length > 1) ctx.push(['Entkuppeln', 'uncouple']); }
    if (still && t.consist.some((v) => v.type.payload)) ctx.push(['Beladen', 'load'], ['Entladen', 'unload']);
    if (still && t.consist[t.consist.length - 1].type.cab && t.consist.length > 0) ctx.push(['Führerstand wechseln', 'cabChange']);
    if (t.traction === 'electric' && !c.panto) ctx.push(['Stromabnehmer heben', 'panto']);
    if (t.traction === 'electric' && c.panto && !c.mainSwitch) ctx.push(['Hauptschalter ein', 'mainSwitch']);
    if (t.traction === 'diesel' && !c.engine) ctx.push(['Motor starten', 'mainSwitch']);
    if (c.reverser === 0 && still) ctx.push(['Richtungswender vor', 'reverser']);
    if (c.parking) ctx.push(['Feststellbremse lösen', 'parking']);
    if (c.emergency && still) ctx.push(['Schnellbremsung lösen', 'emergency']);
    this.ctxButtons(ctx);
  }

  private ctxButtons(list: [string, Action][]) {
    const key = list.map((x) => x[1]).join(',');
    if (!this.ctxBtns || this.cache.ctx === key) return;
    this.cache.ctx = key; clear(this.ctxBtns);
    for (const [label, a] of list) this.ctxBtns.appendChild(btn(label, () => this.act(a), 'btn small'));
  }

  dispose() {
    this.mini?.dispose(); this.mini = null;
    this.el.remove();
  }
}

function fmtDist(d: number) { return d >= 1000 ? `${(d / 1000).toFixed(1)} km` : `${Math.round(d / 10) * 10} m`; }
