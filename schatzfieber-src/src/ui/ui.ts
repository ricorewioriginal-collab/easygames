/** Bildschirme, Fenster, Dialogbox mit Schreibmaschinen-Text, Auswahl, Hinweise, Überblendung und Fokus-Navigation (Tastatur/Controller) */
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
export const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export interface Choice { label: string; sub?: string; disabled?: boolean; cls?: string }

export class UI {
  private ovStack: { html: string; back?: () => void }[] = [];
  private sayResolve: ((i: number) => void) | null = null;
  private typing: { full: string; el: HTMLElement; i: number; timer: number } | null = null;
  textSpeed = 1;
  onClick: () => void = () => {};

  constructor() {
    document.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest('button');
      if (b) this.onClick();
    });
    $('dlg').addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('button')) return;
      this.advance();
    });
  }

  show(id: string) {
    document.querySelectorAll('.scr').forEach((s) => s.classList.toggle('on', s.id === id));
    requestAnimationFrame(() => this.focusFirst());
  }
  get screen() {
    return document.querySelector('.scr.on')?.id || '';
  }

  // ---------- Fenster ----------
  get overlayOpen() {
    return !$('ov').hidden;
  }
  get dialogOpen() {
    return $('dlg').classList.contains('on');
  }
  get busy() {
    return this.overlayOpen || this.dialogOpen;
  }
  /** Fenster öffnen; back = Aktion für Esc/Ⓑ (Standard: schließen) */
  open(html: string, back?: () => void, cls = '') {
    const ov = $('ov'),
      box = $('ovBox');
    box.className = 'panel ' + cls;
    box.innerHTML = html;
    ov.hidden = false;
    this.ovStack = [{ html, back }];
    requestAnimationFrame(() => this.focusFirst());
    return box;
  }
  close() {
    $('ov').hidden = true;
    $('ovBox').innerHTML = '';
    this.ovStack = [];
  }
  /** Knöpfe mit data-a="name" an Funktionen binden */
  bind(map: Record<string, (el: HTMLElement) => void>, root: HTMLElement = $('ovBox')) {
    root.querySelectorAll<HTMLElement>('[data-a]').forEach((el) => {
      const f = map[el.dataset.a!];
      if (f) el.addEventListener('click', () => f(el));
    });
  }

  // ---------- Dialog ----------
  /** Sprechblase: Name, Farbe, Porträt, Text; ohne Auswahl → Klick/Ⓐ weiter. Liefert gewählten Index. */
  say(name: string, color: string, portrait: string | null, text: string, choices: Choice[] = []): Promise<number> {
    const d = $('dlg');
    d.classList.add('on');
    d.classList.toggle('narr', !name);
    $('dlgName').textContent = name;
    $('dlgName').style.color = color;
    const pic = $('dlgPic') as HTMLImageElement;
    pic.hidden = !portrait;
    if (portrait) pic.src = portrait;
    pic.style.borderColor = color;
    const txt = $('dlgText');
    const ch = $('dlgChoices');
    ch.innerHTML = '';
    ch.hidden = true;
    $('dlgNext').hidden = true;
    if (this.typing) clearInterval(this.typing.timer);
    txt.textContent = '';
    const full = text;
    const done = () => {
      if (this.typing) clearInterval(this.typing.timer);
      this.typing = null;
      txt.textContent = full;
      if (choices.length) {
        ch.hidden = false;
        ch.innerHTML = choices.map((c, i) => `<button class="btn ch ${c.cls || ''}" data-i="${i}" ${c.disabled ? 'disabled' : ''}>${c.label}${c.sub ? `<small>${c.sub}</small>` : ''}</button>`).join('');
        ch.querySelectorAll<HTMLButtonElement>('button').forEach((b) => b.addEventListener('click', () => this.finishSay(+b.dataset.i!)));
        requestAnimationFrame(() => this.focusFirst());
      } else $('dlgNext').hidden = false;
    };
    const t = { full, el: txt, i: 0, timer: 0 };
    this.typing = t;
    const cps = 55 * this.textSpeed;
    t.timer = window.setInterval(() => {
      t.i += Math.max(1, Math.round(cps / 30));
      txt.textContent = full.slice(0, t.i);
      if (t.i >= full.length) done();
    }, 1000 / 30);
    (this as unknown as { _done: () => void })._done = done;
    return new Promise((res) => (this.sayResolve = (i) => res(i)));
  }
  private finishSay(i: number) {
    const r = this.sayResolve;
    this.sayResolve = null;
    r?.(i);
  }
  /** Klick/Ⓐ: Text sofort zeigen oder weiter */
  advance() {
    if (!this.dialogOpen) return;
    if (this.typing) {
      (this as unknown as { _done: () => void })._done();
      return;
    }
    if (!$('dlgChoices').hidden) return;
    this.finishSay(0);
  }
  endDialog() {
    $('dlg').classList.remove('on');
    if (this.typing) clearInterval(this.typing.timer);
    this.typing = null;
  }

  // ---------- Kino-Modus ----------
  cinema(on: boolean) {
    document.body.classList.toggle('cine', on);
  }
  fade(on: boolean, text = ''): Promise<void> {
    const f = $('fade');
    $('fadeText').textContent = text;
    f.classList.toggle('on', on);
    return new Promise((r) => setTimeout(r, 900));
  }

  toast(msg: string, ms = 2600) {
    const t = $('toast');
    t.innerHTML = msg;
    t.hidden = false;
    t.classList.remove('pop');
    void t.offsetWidth;
    t.classList.add('pop');
    clearTimeout((t as unknown as { _h: number })._h);
    (t as unknown as { _h: number })._h = window.setTimeout(() => (t.hidden = true), ms);
  }

  // ---------- Fokus-Navigation ----------
  private scope(): HTMLElement {
    if (this.overlayOpen) return $('ovBox');
    if (this.dialogOpen) return $('dlg');
    return (document.querySelector('.scr.on') as HTMLElement) || document.body;
  }
  private focusables(): HTMLElement[] {
    return Array.from(this.scope().querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input,select,[tabindex="0"]')).filter((e) => e.offsetParent !== null);
  }
  focusFirst() {
    const f = this.focusables();
    const pref = f.find((e) => e.classList.contains('pref')) || f[0];
    if (pref && !this.scope().contains(document.activeElement)) pref.focus({ preventScroll: false });
  }
  nav(dir: 'up' | 'down' | 'left' | 'right') {
    const f = this.focusables();
    if (!f.length) return;
    const cur = document.activeElement as HTMLElement;
    if (!f.includes(cur)) {
      f[0].focus();
      return;
    }
    const a = cur.getBoundingClientRect(),
      ax = a.left + a.width / 2,
      ay = a.top + a.height / 2;
    let best: HTMLElement | null = null,
      bd = 1e9;
    for (const e of f) {
      if (e === cur) continue;
      const b = e.getBoundingClientRect(),
        bx = b.left + b.width / 2,
        by = b.top + b.height / 2;
      const dx = bx - ax,
        dy = by - ay;
      const ok = dir === 'up' ? dy < -4 : dir === 'down' ? dy > 4 : dir === 'left' ? dx < -4 : dx > 4;
      if (!ok) continue;
      const main = dir === 'up' || dir === 'down' ? Math.abs(dy) : Math.abs(dx),
        side = dir === 'up' || dir === 'down' ? Math.abs(dx) : Math.abs(dy);
      const score = main + side * 2.2;
      if (score < bd) {
        bd = score;
        best = e;
      }
    }
    if (!best && (dir === 'down' || dir === 'right')) best = f[(f.indexOf(cur) + 1) % f.length];
    if (!best && (dir === 'up' || dir === 'left')) best = f[(f.indexOf(cur) - 1 + f.length) % f.length];
    best?.focus();
    best?.scrollIntoView({ block: 'nearest' });
  }
  /** Ⓐ am Controller */
  ok() {
    if (this.dialogOpen && !this.overlayOpen && $('dlgChoices').hidden) return this.advance();
    const el = document.activeElement as HTMLElement;
    if (el && this.scope().contains(el) && (el.tagName === 'BUTTON' || el.tagName === 'A')) el.click();
    else if (this.dialogOpen) this.advance();
  }
  /** Esc/Ⓑ */
  back(): boolean {
    if (this.overlayOpen) {
      const top = this.ovStack[this.ovStack.length - 1];
      if (top?.back) top.back();
      else this.close();
      return true;
    }
    const b = this.scope().querySelector<HTMLElement>('[data-back]');
    if (b) {
      b.click();
      return true;
    }
    return false;
  }
}
