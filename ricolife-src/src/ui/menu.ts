// Hauptmenü, Spielstart-Auswahl (Geschichte, Familie, eigene Familie), Spielstände und Ladebildschirm.
import { STORIES } from '../data/stories';
import { HOUSEHOLDS } from '../data/people';
import { lotById, LOTS, DISTRICTS } from '../data/lots';
import { SLOTS, slotInfo, deleteSlot, SAVE_PREFIX } from '../sim/save';
import type { NewGameOpts } from '../sim/setup';
import { fmtMoney } from '../core/util';
import { h, modal, btn, clear, confirmDlg, toast } from './dom';

export interface MenuApi {
  newGame(o: NewGameOpts): void;
  load(slot: number, backup?: boolean): void;
  importFile(text: string, slot: number): void;
  exportSlot(slot: number): void;
  openCas(onDone: (custom: NonNullable<NewGameOpts['custom']>) => void, opts?: { minAdults?: number; title?: string }): void;
  openSettings(): void;
  openHelp(): void;
  openMultiplayer(): void;
  lastSlot(): number | null;
}

const LOGO = (): HTMLElement => h('div', { class: 'logo' }, 'Rico', h('em', null, 'Life'), ' 3D');

export class MainMenu {
  readonly el = h('div', { id: 'menu' });
  constructor(private api: MenuApi) {}

  show(): void {
    clear(this.el);
    const last = this.api.lastSlot();
    const lastInfo = last ? slotInfo(last) : null;
    const cloud = document.getElementById('cloudMount');
    const inner = h(
      'div',
      { class: 'inner' },
      LOGO(),
      h('div', { class: 'tagline' }, 'Dein Leben. Deine Regeln.'),
      h(
        'div',
        { class: 'mbtns' },
        lastInfo && !lastInfo.empty && !lastInfo.broken ? btn(h('span', null, '▶ Weiterspielen', h('small', { style: 'display:block;font-weight:400' }, `${lastInfo.name} · ${lastInfo.meta?.date ?? ''}`)), () => this.api.load(last!), 'primary', { id: 'mContinue' }) : null,
        btn('✨ Neues Leben', () => this.newGame(), lastInfo && !lastInfo.empty ? 'warm' : 'primary', { id: 'mNew' }),
        btn('📂 Spielstände', () => this.saves(), '', { id: 'mLoad' }),
        btn('🌐 Mehrspieler', () => this.api.openMultiplayer(), '', { id: 'mMulti' }),
        h('div', { class: 'row', style: 'justify-content:center' }, btn('⚙️ Einstellungen', () => this.api.openSettings(), 'small', { id: 'mSettings' }), btn('❓ Hilfe', () => this.api.openHelp(), 'small', { id: 'mHelp' })),
      ),
      h('div', { class: 'cloudBox', id: 'cloudSlot' }),
      h('div', { class: 'foot' }, h('a', { href: '../', class: 'btn small ghost', id: 'mBack' }, '← Zurück zur Spielebibliothek'), h('div', null, h('small', null, `Version ${__APP_VERSION__} · Offline spielbar · Speichern lokal & mit Google`))),
    );
    this.el.appendChild(inner);
    // Google-Speichern (anmacha-cloud) im Menü einblenden
    if (cloud) {
      inner.querySelector('#cloudSlot')!.appendChild(cloud);
      cloud.classList.remove('hidden');
    }
    if (!this.el.isConnected) document.body.appendChild(this.el);
    this.el.classList.remove('hidden');
  }
  hide(): void {
    const cloud = document.getElementById('cloudMount');
    if (cloud) {
      cloud.classList.add('hidden');
      document.getElementById('app')?.appendChild(cloud);
    }
    this.el.classList.add('hidden');
  }

  private pickSlot(onPick: (slot: number) => void): void {
    const m = modal({
      title: 'Speicherplatz wählen',
      icon: '💾',
      body: h('div', { class: 'col' }, SLOTS.map((sl) => {
        const i = slotInfo(sl);
        return btn(h('span', null, `Platz ${sl}: `, i.empty ? h('i', null, 'leer') : h('b', null, i.name ?? 'beschädigt')), () => {
          if (!i.empty) confirmDlg('Überschreiben?', `Platz ${sl} enthält „${i.name ?? 'Spielstand'}“. Wirklich überschreiben?`, 'Überschreiben', () => { m.close(); onPick(sl); });
          else {
            m.close();
            onPick(sl);
          }
        }, i.empty ? 'primary' : '');
      })),
    });
  }

  newGame(): void {
    const free = (slot: (s: number) => void): void => {
      const empty = SLOTS.find((s) => slotInfo(s).empty);
      if (empty) slot(empty);
      else this.pickSlot(slot);
    };
    const m = modal({
      title: 'Neues Leben beginnen',
      icon: '✨',
      wide: true,
      body: h(
        'div',
        { class: 'col' },
        h('h3', null, '📖 Geschichte spielen'),
        h('div', { class: 'grid2' }, STORIES.map((st) => h('div', { class: 'card col' }, h('b', null, `${st.icon} ${st.title}`), h('small', { class: 'muted' }, st.summary), h('small', null, `${st.household ? `Mit ${HOUSEHOLDS.find((x) => x.id === st.household)?.name}` : 'Mit deiner eigenen Figur'} · Start: ${lotById(st.start)?.name ?? ''} · ${fmtMoney(st.startFunds)}`), btn('Starten', () => {
          m.close();
          free((slot) => {
            if (st.household) this.api.newGame({ story: st.id, slot });
            else this.api.openCas((custom) => this.api.newGame({ story: st.id, custom, slot }), { title: st.title });
          });
        }, 'primary small', { 'data-story': st.id })))),
        h('h3', null, '🏡 Familie aus Lindenhafen'),
        h('div', { class: 'grid2' }, HOUSEHOLDS.map((hs) => h('div', { class: 'card col' }, h('b', null, hs.name), h('small', null, `${hs.members.map((x) => x.first).join(', ')}${hs.pets?.length ? ' + ' + hs.pets.map((p) => p.name).join(', ') : ''} · ${fmtMoney(hs.funds)}`), h('small', { class: 'muted' }, hs.story), btn('Spielen', () => {
          m.close();
          free((slot) => this.api.newGame({ household: hs.id, slot }));
        }, 'small', { 'data-hh': hs.id })))),
        h('h3', null, '🧑‍🎨 Eigene Familie'),
        h('p', { class: 'muted' }, 'Erstelle bis zu acht Figuren mit Aussehen, Merkmalen und Lebensziel und such dir ein Zuhause aus – das Haus ist inklusive, dazu gibt es 20.000 RT Startkapital.'),
        btn('Familie erstellen', () => {
          m.close();
          free((slot) => this.api.openCas((custom) => this.chooseLot((lot) => this.api.newGame({ custom, lot, slot }))));
        }, 'warm', { id: 'mCustom' }),
      ),
    });
  }

  chooseLot(onPick: (lot: string) => void): void {
    const opts = ['sh-6', 'sh-3', 'sh-4', 'as-2', 'hv-2'].map((id) => lotById(id)!).filter(Boolean);
    const m = modal({
      title: 'Zuhause wählen',
      icon: '🏡',
      locked: true,
      body: h('div', { class: 'col' }, opts.map((L) => h('div', { class: 'card col' }, h('b', null, L.name), h('small', { class: 'muted' }, `${DISTRICTS[L.district].name} · ${L.w}×${L.d} m · ${L.desc}`), btn('Hier einziehen', () => { m.close(); onPick(L.id); }, 'small primary', { 'data-lot': L.id })))),
    });
    void LOTS;
  }

  saves(): void {
    const body = h('div', { class: 'col' });
    const m = modal({ title: 'Spielstände', icon: '📂', body, wide: true });
    const render = (): void => {
      clear(body);
      for (const sl of SLOTS) {
        const i = slotInfo(sl);
        body.appendChild(
          h('div', { class: 'card col', 'data-slot': sl },
            h('div', { class: 'row' }, h('b', { class: 'grow' }, `Platz ${sl}`), i.saved ? h('small', { class: 'muted' }, new Date(i.saved).toLocaleString('de-DE')) : null),
            i.empty ? h('small', { class: 'muted' }, 'Leer') : i.broken ? h('small', { style: 'color:var(--bad)' }, 'Spielstand beschädigt') : h('small', null, `${i.name} · ${i.meta?.members.join(', ')} · ${i.meta?.date} · ${fmtMoney(i.meta?.funds ?? 0)}`),
            h('div', { class: 'row' },
              !i.empty && !i.broken ? btn('Laden', () => { m.close(); this.api.load(sl); }, 'small primary') : null,
              i.hasBackup ? btn('Sicherung laden', () => { m.close(); this.api.load(sl, true); }, 'small') : null,
              !i.empty && !i.broken ? btn('Exportieren', () => this.api.exportSlot(sl), 'small') : null,
              btn('Importieren', () => this.importTo(sl, () => m.close()), 'small'),
              !i.empty ? btn('Löschen', () => confirmDlg('Löschen?', `Platz ${sl} wirklich löschen? Das kann nicht rückgängig gemacht werden.`, 'Löschen', () => { deleteSlot(sl); render(); }), 'small danger') : null,
            ),
          ),
        );
      }
      body.appendChild(h('small', { class: 'muted' }, `Spielstände liegen im Browser (${SAVE_PREFIX}1–3) und werden mit Google gesichert, wenn du im Hauptmenü angemeldet bist. Export erzeugt eine JSON-Datei zum Sichern oder Übertragen.`));
    };
    render();
  }

  private importTo(slot: number, done: () => void): void {
    const inp = h('input', { type: 'file', accept: '.json,application/json', style: 'display:none' });
    inp.addEventListener('change', () => {
      const f = inp.files?.[0];
      if (!f) return;
      if (f.size > 8 * 1024 * 1024) return toast('Datei ist zu groß.', '⚠️', 'warn');
      f.text().then((t) => {
        done();
        this.api.importFile(t, slot);
      });
    });
    document.body.appendChild(inp);
    inp.click();
    setTimeout(() => inp.remove(), 60000);
  }
}

// ---------- Ladebildschirm ----------
export class Loading {
  readonly el: HTMLElement;
  private barI: HTMLElement;
  private list: HTMLElement;
  private msg: HTMLElement;
  private items: HTMLElement[] = [];
  constructor(phases: string[]) {
    this.barI = h('i');
    this.list = h('ul', { class: 'phases' }, phases.map((p) => h('li', null, p)));
    this.items = [...this.list.children] as HTMLElement[];
    this.msg = h('small', null, '');
    this.el = h('div', { id: 'loading', role: 'progressbar', 'aria-label': 'Lädt' }, h('div', null, LOGO(), h('div', { class: 'tagline' }, 'Dein Leben. Deine Regeln.'), h('div', { class: 'bar' }, this.barI), this.list, this.msg));
    document.body.appendChild(this.el);
  }
  phase(i: number, text = ''): void {
    this.items.forEach((li, j) => {
      li.classList.toggle('done', j < i);
      li.classList.toggle('on', j === i);
    });
    this.barI.style.width = `${Math.round((i / this.items.length) * 100)}%`;
    this.msg.textContent = text;
  }
  fail(text: string, retry: () => void, back: () => void): void {
    clear(this.msg).append(h('div', { style: 'color:#fff;margin:8px 0' }, text), h('div', { class: 'row', style: 'justify-content:center' }, btn('Erneut versuchen', retry, 'primary'), btn('Zum Menü', back)));
  }
  done(): void {
    this.barI.style.width = '100%';
    this.el.remove();
  }
}
