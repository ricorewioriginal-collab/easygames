// Kleine DOM-Helfer ohne Framework.
type Child = Node | string | number | null | undefined | false | Child[];
type Attrs = Record<string, unknown> & { class?: string; style?: string };

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs | null = null, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v as EventListener);
    else if (k === 'class') el.className = String(v);
    else if (k === 'style') el.setAttribute('style', String(v));
    else if (k in el && typeof v !== 'string') (el as unknown as Record<string, unknown>)[k] = v;
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  add(el, children);
  return el;
}

function add(el: Node, c: Child) {
  if (c === null || c === undefined || c === false) return;
  if (Array.isArray(c)) { for (const x of c) add(el, x); return; }
  el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
}

export function clear(el: Element) { while (el.firstChild) el.removeChild(el.firstChild); }

export function btn(label: Child, onclick: () => void, cls = 'btn', extra: Attrs = {}) {
  return h('button', { class: cls, type: 'button', onclick: (e: Event) => { e.stopPropagation(); onclick(); }, ...extra }, label);
}

/** Uhrzeit HH:MM aus Sekunden */
export const hhmm = (t: number) => { const s = ((Math.floor(t) % 86400) + 86400) % 86400; return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}`; };
export const hhmmss = (t: number) => `${hhmm(t)}:${String(Math.floor(((t % 60) + 60) % 60)).padStart(2, '0')}`;

let toastHost: HTMLElement | null = null;
export function toast(msg: string, sev: 'info' | 'warn' | 'error' = 'info', ms = 3500) {
  if (!toastHost) { toastHost = h('div', { class: 'toasts', 'aria-live': 'polite' }); document.body.appendChild(toastHost); }
  const t = h('div', { class: `toast ${sev}` }, msg);
  toastHost.appendChild(t);
  while (toastHost.children.length > 4) toastHost.removeChild(toastHost.firstChild!);
  setTimeout(() => t.remove(), ms);
}

/** Modaler Dialog mit Knöpfen; liefert Index des gewählten Knopfs */
export function dialog(title: string, body: Child, buttons: string[]): Promise<number> {
  return new Promise((res) => {
    const close = (i: number) => { ov.remove(); res(i); };
    const ov = h('div', { class: 'overlay dlg', role: 'dialog', 'aria-modal': 'true' },
      h('div', { class: 'panel' }, h('h2', null, title), h('div', { class: 'dlg-body' }, body),
        h('div', { class: 'row end' }, buttons.map((b, i) => btn(b, () => close(i), i === 0 ? 'btn primary' : 'btn')))));
    document.body.appendChild(ov);
    (ov.querySelector('button') as HTMLButtonElement | null)?.focus();
  });
}

export const CSS = `
:root{--bg:#0d1726;--bg2:#13233a;--panel:rgba(16,30,50,.94);--line:#2a4466;--txt:#eef3f9;--muted:#9fb3c8;--acc:#f2a900;--acc2:#2ec4b6;--red:#e5484d;--green:#3ccf6e;--yellow:#f2c94c;--fs:1}
*{box-sizing:border-box}
html,body{margin:0;height:100%;background:var(--bg);color:var(--txt);font:calc(15px*var(--fs))/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;overflow:hidden;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;touch-action:none}
canvas#scene{position:fixed;inset:0;width:100%;height:100%;display:block}
#ui{position:fixed;inset:0;pointer-events:none}
#ui>*{pointer-events:auto}
.screen{position:fixed;inset:0;overflow:auto;padding:max(16px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));background:radial-gradient(1200px 600px at 70% -10%,#24456e 0,transparent 60%),linear-gradient(180deg,#0d1726,#0a1220);touch-action:pan-y}
.screen.clear{background:rgba(6,12,22,.55)}
.wrap{max-width:1100px;margin:0 auto}
h1{font-size:calc(30px*var(--fs));margin:.2em 0}
h2{font-size:calc(20px*var(--fs));margin:.3em 0 .5em}
h3{font-size:calc(16px*var(--fs));margin:.6em 0 .3em;color:var(--acc)}
.logo{font-weight:800;letter-spacing:.02em}
.logo b{color:var(--acc)}
.sub{color:var(--muted)}
.btn{appearance:none;border:1px solid var(--line);background:#1b3150;color:var(--txt);border-radius:12px;padding:12px 16px;font:inherit;font-weight:600;cursor:pointer;min-height:46px;touch-action:manipulation}
.btn:hover{background:#244068}.btn:active{transform:translateY(1px)}
.btn:focus-visible{outline:3px solid var(--acc);outline-offset:2px}
.btn.primary{background:var(--acc);color:#1a1300;border-color:#ffcb3a}
.btn.primary:hover{background:#ffbe1a}
.btn.ghost{background:transparent}
.btn.small{min-height:36px;padding:6px 10px;border-radius:9px;font-size:.9em}
.btn[disabled]{opacity:.45;cursor:not-allowed}
.menu{display:grid;gap:10px;max-width:420px}
.menu .btn{text-align:left;display:flex;gap:12px;align-items:center;font-size:1.05em}
.menu .btn small{display:block;font-weight:400;color:var(--muted);font-size:.8em}
.menu .btn.dis{opacity:.55}
.hero{border-radius:18px;padding:16px 18px 10px;margin-bottom:14px;background:linear-gradient(90deg,rgba(10,20,36,.92) 0,rgba(10,20,36,.55) 60%,rgba(10,20,36,.35)),url(card.svg) center 25%/cover;border:1px solid var(--line)}
.hero .logo{margin:0;font-size:calc(26px*var(--fs))}.hero .sub{margin:4px 0 2px;color:var(--txt);font-size:1.05em}.hero .small{margin:0}
.menu2{display:grid;gap:12px;max-width:760px}
.tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}
.btn.tile{display:flex;gap:12px;align-items:center;text-align:left;padding:12px 14px;min-height:64px;border-radius:14px}
.btn.tile b{display:block;font-size:1.05em}.btn.tile small{display:block;font-weight:400;color:var(--muted);font-size:.8em;line-height:1.25}
.btn.tile.primary small{color:#3a2a00}
.btn.tile .ti{font-size:1.6em;width:1.5em;text-align:center;flex:none}
.btn.tile.big{min-height:76px}.btn.tile.big b{font-size:1.25em}
.btn.tile.dis{opacity:.55}
.foot{margin-top:4px}
.tag{display:inline-block;font-size:.75em;padding:2px 8px;border-radius:99px;background:#24405f;color:var(--muted);margin-left:6px;font-weight:600}
.tag.real{background:#3a2a10;color:#ffcf70}.tag.fant{background:#10333a;color:#7ff3e6}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px;cursor:pointer;position:relative}
.card:hover{border-color:var(--acc)}
.card.sel{border-color:var(--acc);box-shadow:0 0 0 2px var(--acc) inset}
.card.locked{opacity:.5}
.card h3{margin-top:0}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.row.end{justify-content:flex-end}
.spacer{flex:1}
.panel{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:16px;max-width:640px;width:100%}
.overlay{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(3,8,16,.6);padding:16px;z-index:50}
.dlg-body{max-height:60vh;overflow:auto;margin-bottom:12px}
label.f{display:flex;flex-direction:column;gap:4px;margin:8px 0;color:var(--muted);font-size:.9em}
select,input[type=text],input[type=number]{font:inherit;background:#0f2034;color:var(--txt);border:1px solid var(--line);border-radius:10px;padding:10px;min-height:44px}
input[type=range]{width:100%}
.toasts{position:fixed;left:50%;top:max(10px,env(safe-area-inset-top));transform:translateX(-50%);display:flex;flex-direction:column;gap:6px;z-index:80;pointer-events:none;max-width:min(92vw,560px)}
.toast{background:rgba(14,28,46,.95);border:1px solid var(--line);border-left:4px solid var(--acc2);padding:8px 12px;border-radius:10px;font-size:.92em}
.toast.warn{border-left-color:var(--yellow)}.toast.error{border-left-color:var(--red)}
.stars{color:var(--acc);font-size:1.3em;letter-spacing:2px}
.muted{color:var(--muted)}
.bar{height:8px;background:#0a1626;border-radius:9px;overflow:hidden;border:1px solid var(--line)}
.bar i{display:block;height:100%;background:linear-gradient(90deg,var(--acc),#ffd36b);width:0}
.notice{font-size:.8em;color:var(--muted);margin-top:14px}
table.t{border-collapse:collapse;width:100%;font-size:.92em}
table.t td,table.t th{padding:5px 6px;border-bottom:1px solid #22395a;text-align:left}
.kbd{display:inline-block;border:1px solid var(--line);border-bottom-width:3px;border-radius:6px;padding:0 6px;font-family:ui-monospace,monospace;font-size:.85em;background:#0f2034}
/* HUD */
.hud{position:fixed;inset:0;pointer-events:none;font-variant-numeric:tabular-nums}
.hud .box{pointer-events:auto;background:rgba(10,20,34,.78);border:1px solid rgba(80,120,170,.45);border-radius:12px;padding:8px 10px;backdrop-filter:blur(4px)}
.hud .tl{position:absolute;left:max(8px,env(safe-area-inset-left));top:max(8px,env(safe-area-inset-top));display:flex;flex-direction:column;gap:6px;max-width:min(46vw,360px)}
.hud .tr{position:absolute;right:max(8px,env(safe-area-inset-right));top:max(8px,env(safe-area-inset-top));display:flex;flex-direction:column;gap:6px;align-items:flex-end;max-width:min(46vw,330px)}
.hud .speed{font-size:2.2em;font-weight:800;line-height:1}
.hud .speed small{font-size:.38em;color:var(--muted);font-weight:600}
.hud .lim{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;border:5px solid var(--red);background:#fff;color:#000;font-weight:800;font-size:1em}
.hud .lim.next{width:34px;height:34px;border-width:4px;font-size:.8em;opacity:.85}
.hud .sig{display:flex;gap:8px;align-items:center}
.hud .lamp{width:16px;height:16px;border-radius:50%;background:#333;border:2px solid #111}
.hud .lamp.stop{background:var(--red);box-shadow:0 0 10px var(--red)}.hud .lamp.go{background:var(--green);box-shadow:0 0 10px var(--green)}.hud .lamp.caution,.hud .lamp.slow{background:var(--yellow);box-shadow:0 0 10px var(--yellow)}
.hud .msgs{font-size:.88em;display:flex;flex-direction:column;gap:3px}
.hud .msgs div{background:rgba(10,20,34,.78);border-radius:8px;padding:4px 8px;border-left:3px solid var(--acc2)}
.hud .msgs .warn{border-left-color:var(--yellow)}.hud .msgs .error{border-left-color:var(--red)}
.hud .goals{font-size:.85em}
.hud .goals .ok{color:var(--green)}.hud .goals .bad{color:var(--red)}
.hud .warnbig{position:absolute;left:50%;top:22%;transform:translateX(-50%);font-weight:800;font-size:1.3em;padding:10px 18px;border-radius:12px;background:rgba(200,30,40,.85);display:none}
.hud .warnbig.on{display:block;animation:blink 1s infinite}
@keyframes blink{50%{opacity:.4}}
.hud .bl{position:absolute;left:max(8px,env(safe-area-inset-left));bottom:max(8px,env(safe-area-inset-bottom))}
.hud .br{position:absolute;right:max(8px,env(safe-area-inset-right));bottom:max(8px,env(safe-area-inset-bottom))}
.hud .bc{position:absolute;left:50%;bottom:max(8px,env(safe-area-inset-bottom));transform:translateX(-50%);display:flex;gap:6px;flex-wrap:wrap;justify-content:center;max-width:92vw}
.hud .btn{pointer-events:auto}
.hud .tbtns{display:grid;grid-template-columns:repeat(2,54px);gap:6px}
.tbtn{pointer-events:auto;width:54px;height:54px;border-radius:14px;border:1px solid rgba(120,160,210,.5);background:rgba(16,32,54,.82);color:#fff;font-size:1.25em;font-weight:700;display:inline-flex;align-items:center;justify-content:center;touch-action:none}
.tbtn.on{background:var(--acc);color:#1a1300}
.tbtn small{font-size:.5em}
.lever{pointer-events:auto;position:relative;width:64px;height:min(42vh,260px);border-radius:16px;background:rgba(16,32,54,.85);border:1px solid rgba(120,160,210,.5);touch-action:none}
.lever .knob{position:absolute;left:6px;right:6px;height:40px;border-radius:12px;background:var(--acc);box-shadow:0 2px 8px #0008}
.lever .mid{position:absolute;left:0;right:0;height:2px;background:#fff6}
.lever .lbl{position:absolute;left:0;right:0;text-align:center;font-size:.7em;color:var(--muted)}
.minimap{width:min(40vw,260px);height:min(28vw,170px);border-radius:12px}
.tt{font-size:.85em;max-height:30vh;overflow:auto}
.tt .cur{color:var(--acc);font-weight:700}
.tt .done{color:var(--muted);text-decoration:line-through}
.pausebtn{position:absolute;right:max(8px,env(safe-area-inset-right));top:max(8px,env(safe-area-inset-top))}
.loading{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:var(--bg);z-index:90}
.loading .bar{width:min(80vw,420px)}
.box2d{position:fixed;inset:0;background:#08111d;touch-action:none}
.box2d canvas{width:100%;height:100%;display:block}
.small{font-size:.85em}
@media (max-width:700px){.tiles{grid-template-columns:1fr 1fr}.btn.tile{flex-direction:column;align-items:flex-start;gap:4px;padding:10px}.btn.tile.big{flex-direction:row;align-items:center}.hud{font-size:.9em}.hud .speed{font-size:1.8em}.menu{max-width:none}.hud .ctlinfo{display:none}.hud .bc{left:max(8px,env(safe-area-inset-left));top:calc(max(8px,env(safe-area-inset-top)) + 150px);bottom:auto;transform:none;flex-direction:column;align-items:flex-start;max-width:46vw}.hud .tt{max-height:18vh}}
/* Hochformat (Handy): kompakter, nichts über dem Führerstandspult stapeln */
@media (orientation:portrait) and (max-width:700px){.toasts{top:24vh}.hero{background:linear-gradient(180deg,rgba(10,20,36,.6),rgba(10,20,36,.92)),url(card.svg) center 20%/cover}.hud .tl{max-width:56vw}.hud .tr{max-width:42vw}.hud .tr .tbtn{width:40px;height:40px;font-size:1em;border-radius:11px}.hud .inf{display:none}.hud .lim{width:38px;height:38px;border-width:4px}.hud .lim.next{width:30px;height:30px}.hud .tt{max-height:12vh}.hud .tbtns{grid-template-columns:48px}.hud .tbtns .tbtn{width:48px;height:48px}.lever{height:min(34vh,230px)}.hud .bc{top:auto;bottom:max(8px,env(safe-area-inset-bottom));left:max(8px,env(safe-area-inset-left));right:132px;max-width:none;flex-direction:row;flex-wrap:wrap;align-items:flex-end}.hud .bc .btn{padding:8px 10px;font-size:.9em}.hud .msgs{font-size:.8em}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
body.cb .lamp.go{background:#4aa3ff;box-shadow:0 0 10px #4aa3ff}
`;
