/* Titanparcours – Moderatoren-Szene nach der Steilwand: RicoReWi (Moderator) und Yukoo (Co-Kommentator) am Kommentatorenpult.
   Gezeichnet als SVG (eigene Figuren, keine fremden Logos), Mund bewegt sich zur Ansage, Untertitel unten.
   play({ final, say, len, fast }) → Promise, endet nach beiden Ansagen oder bei Tippen/Taste. */
import { TXT } from './assets/vo/vo.js';

const CSS = `
#host{position:absolute;inset:0;z-index:40;overflow:hidden;background:radial-gradient(120% 90% at 50% 8%,#1f2c7a 0%,#0b0f2c 45%,#04050c 100%);font-family:var(--fd,"Titan Display","Barlow Condensed",Arial,sans-serif);cursor:pointer;animation:hsIn .45s ease-out both}
#host[hidden]{display:none}
@keyframes hsIn{from{opacity:0;transform:scale(1.04)}to{opacity:1;transform:none}}
#host .hs-cam{position:absolute;inset:0;animation:hsCam 9s ease-in-out both}
@keyframes hsCam{from{transform:scale(1)}to{transform:scale(1.07) translateY(1.5%)}}
#host .hs-beam{position:absolute;top:-10%;width:22%;height:120%;background:linear-gradient(180deg,rgba(120,170,255,.38),rgba(120,170,255,0) 75%);filter:blur(6px);transform-origin:50% 0;mix-blend-mode:screen}
#host .hs-beam.b1{left:6%;animation:hsSw 5s ease-in-out infinite alternate}
#host .hs-beam.b2{right:6%;animation:hsSw 6s ease-in-out infinite alternate-reverse;background:linear-gradient(180deg,rgba(255,120,40,.34),rgba(255,120,40,0) 75%)}
#host .hs-beam.b3{left:40%;width:20%;animation:hsSw 7s ease-in-out infinite alternate;opacity:.6}
@keyframes hsSw{from{transform:rotate(-14deg)}to{transform:rotate(14deg)}}
#host .hs-wall{position:absolute;left:0;right:0;top:4%;height:58%;display:flex;justify-content:center;gap:1.2%;opacity:.55}
#host .hs-wall i{display:block;width:7%;background:repeating-linear-gradient(135deg,rgba(255,106,26,.0) 0 18px,rgba(255,106,26,.55) 18px 30px,rgba(69,212,255,.0) 30px 48px,rgba(69,212,255,.45) 48px 58px);border:1px solid rgba(255,255,255,.12);animation:hsLed 2.4s linear infinite}
#host .hs-wall i:nth-child(2n){animation-duration:3.1s}
@keyframes hsLed{from{background-position:0 0}to{background-position:0 116px}}
#host .hs-logo{position:absolute;left:50%;top:9%;transform:translateX(-50%);font-style:italic;font-weight:800;font-size:clamp(28px,6vw,72px);letter-spacing:.04em;color:#fff;text-shadow:0 0 18px rgba(255,106,26,.9),0 4px 0 #ff6a1a;white-space:nowrap}
#host .hs-logo b{color:#ffc93a}
#host .hs-people{position:absolute;left:0;right:0;bottom:24%;height:58%;display:flex;justify-content:center;align-items:flex-end;gap:2%}
#host .hs-p{position:relative;height:100%;aspect-ratio:400/460}
#host .hs-p svg{width:100%;height:100%;overflow:visible;transform-origin:50% 100%;animation:hsBob 3.2s ease-in-out infinite}
#host .hs-p.yk svg{animation-duration:3.7s;animation-delay:-1s}
@keyframes hsBob{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-1.2%) rotate(.6deg)}}
#host .mo{transform-box:fill-box;transform-origin:50% 0;transform:scaleY(.25);transition:transform .08s}
#host .talk .mo{animation:hsTalk .19s ease-in-out infinite alternate}
#host .talk .mo2{animation-duration:.27s}
@keyframes hsTalk{from{transform:scaleY(.2)}to{transform:scaleY(1)}}
#host .lid{transform-box:fill-box;transform-origin:50% 0;transform:scaleY(0);animation:hsBlink 4.6s infinite}
#host .yk .lid{animation-delay:-2.1s;animation-duration:5.3s}
@keyframes hsBlink{0%,93%,100%{transform:scaleY(0)}96%{transform:scaleY(1)}}
#host .arm{transform-box:fill-box;transform-origin:20% 90%;transition:transform .35s cubic-bezier(.3,1.6,.5,1)}
#host .talk .arm{transform:rotate(-26deg) translateY(-6%)}
#host .yk.talk .arm{transform:rotate(18deg) translateY(-4%)}
#host .head{transform-box:fill-box;transform-origin:50% 90%}
#host .talk .head{animation:hsNod .9s ease-in-out infinite}
@keyframes hsNod{0%,100%{transform:rotate(0)}30%{transform:rotate(-2.5deg)}70%{transform:rotate(2deg)}}
#host .hs-desk{position:absolute;left:8%;right:8%;bottom:0;height:27%;background:linear-gradient(180deg,#161a26,#07080d);border-top:4px solid #ff6a1a;box-shadow:0 -8px 40px rgba(255,106,26,.45),inset 0 10px 30px rgba(0,0,0,.6);border-radius:14px 14px 0 0}
#host .hs-desk::before{content:"";position:absolute;left:3%;right:3%;top:22%;height:4px;background:linear-gradient(90deg,#45d4ff,#2a7bff,#45d4ff);box-shadow:0 0 14px #45d4ff;opacity:.85}
#host .hs-tag{position:absolute;bottom:31%;padding:.35em .9em;background:#0b0d15;border-left:6px solid #ff6a1a;color:#fff;font-weight:800;font-style:italic;font-size:clamp(13px,2.2vw,24px);line-height:1.05;box-shadow:0 6px 18px rgba(0,0,0,.5);transform:skewX(-8deg);animation:hsTag .6s .3s cubic-bezier(.2,1.4,.4,1) both}
#host .hs-tag small{display:block;font-weight:600;font-style:normal;color:#ffc93a;font-size:.62em;letter-spacing:.06em;text-transform:uppercase}
#host .hs-tag.l{left:12%}#host .hs-tag.r{right:12%;border-left-color:#45d4ff;animation-delay:.55s}
@keyframes hsTag{from{opacity:0;transform:skewX(-8deg) translateX(-30px)}to{opacity:1;transform:skewX(-8deg)}}
#host .hs-sub{position:absolute;left:50%;bottom:4%;transform:translateX(-50%);width:min(92%,900px);text-align:center;color:#fff;font-size:clamp(15px,2.6vw,28px);font-weight:700;text-shadow:0 2px 6px #000;min-height:2.4em}
#host .hs-sub b{color:#ffc93a;margin-right:.35em}
#host .hs-skip{position:absolute;right:2%;top:3%;color:rgba(255,255,255,.75);font-size:clamp(11px,1.6vw,16px);background:rgba(0,0,0,.35);padding:.35em .8em;border-radius:99px;border:1px solid rgba(255,255,255,.2)}
#host .hs-live{position:absolute;left:2%;top:3%;color:#fff;font-weight:800;font-size:clamp(11px,1.6vw,16px);background:#e0202a;padding:.25em .7em;border-radius:4px;letter-spacing:.08em;animation:hsLive 1.2s steps(2) infinite}
@keyframes hsLive{50%{opacity:.55}}
@media (max-aspect-ratio:3/4){#host .hs-people{bottom:30%;height:40%}#host .hs-desk{height:32%}#host .hs-tag{bottom:36%}}
`;

// RicoReWi: hochgestylte braune Haare, Vollbart, Septum-Ring, schwarzer Kreuz-Ohrring, lila Shirt
const RICO = `<svg viewBox="0 0 400 460" aria-hidden="true">
 <defs>
  <linearGradient id="rkS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a3fb0"/><stop offset="1" stop-color="#4a2273"/></linearGradient>
  <radialGradient id="rkF" cx="45%" cy="38%" r="65%"><stop offset="0" stop-color="#f7d6bd"/><stop offset="1" stop-color="#e3b393"/></radialGradient>
  <linearGradient id="rkH" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9a7550"/><stop offset=".55" stop-color="#6b4a2e"/><stop offset="1" stop-color="#4d331e"/></linearGradient>
  <linearGradient id="rkB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a5434"/><stop offset="1" stop-color="#553820"/></linearGradient>
 </defs>
 <path d="M40 460 C42 380 80 338 150 322 L250 322 C320 338 358 380 360 460 Z" fill="url(#rkS)"/>
 <path d="M150 322 C170 352 230 352 250 322" fill="none" stroke="#3b1a5c" stroke-width="9"/>
 <path d="M170 338 C185 352 215 352 230 338" fill="#e3b393"/>
 <path d="M178 340 q6 6 10 2 M196 344 q5 6 9 1 M213 341 q4 5 8 0" stroke="#8a6040" stroke-width="2" fill="none" opacity=".7"/>
 <rect x="172" y="268" width="56" height="64" rx="18" fill="#e3b393"/>
 <g class="head">
  <path d="M102 196 C96 150 114 92 164 76 C190 68 226 70 250 82 C292 102 306 150 298 198 C306 252 286 300 250 322 C228 336 172 336 150 322 C114 300 96 252 102 196 Z" fill="url(#rkF)"/>
  <ellipse cx="104" cy="206" rx="15" ry="24" fill="#e6b796"/><ellipse cx="296" cy="206" rx="15" ry="24" fill="#e6b796"/>
  <circle cx="102" cy="230" r="5" fill="#111"/><path d="M102 234 v28 M93 244 h18" stroke="#111" stroke-width="5" stroke-linecap="round"/>
  <path d="M110 218 C114 270 136 312 168 326 C186 334 214 334 232 326 C264 312 286 270 290 218 C280 246 268 258 252 262 C238 250 222 246 200 246 C178 246 162 250 148 262 C132 258 120 246 110 218 Z" fill="url(#rkB)"/>
  <path d="M120 236 q4 30 22 52 M276 236 q-4 30 -22 52 M170 300 q30 14 60 0" stroke="#3f2915" stroke-width="3" fill="none" opacity=".45"/>
  <path d="M158 266 C176 254 224 254 242 266 C232 262 216 262 200 264 C184 262 168 262 158 266 Z" fill="#5a3b22"/>
  <g transform="translate(200 278)"><path d="M-26 0 Q0 10 26 0 Q0 30 -26 0 Z" class="mo" fill="#4a1a1a"/><path d="M-24 0 Q0 8 24 0" stroke="#b5655a" stroke-width="5" fill="none" stroke-linecap="round"/></g>
  <path d="M188 214 C186 232 180 242 184 248 C190 254 210 254 216 248 C220 242 214 232 212 214" fill="#e8b897" stroke="#c98f6e" stroke-width="2"/>
  <path d="M194 252 q6 9 12 0" stroke="#d8dbe2" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="160" cy="196" rx="16" ry="11" fill="#fff"/><ellipse cx="240" cy="196" rx="16" ry="11" fill="#fff"/>
  <circle cx="163" cy="197" r="8" fill="#3a2516"/><circle cx="243" cy="197" r="8" fill="#3a2516"/><circle cx="165" cy="194" r="2.6" fill="#fff"/><circle cx="245" cy="194" r="2.6" fill="#fff"/>
  <rect class="lid" x="142" y="184" width="36" height="24" rx="10" fill="#e9bf9f"/><rect class="lid" x="222" y="184" width="36" height="24" rx="10" fill="#e9bf9f"/>
  <path d="M136 176 C150 162 172 162 186 172" stroke="#4a3220" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M214 170 C230 160 252 162 266 176" stroke="#4a3220" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="M100 184 C86 120 108 60 170 44 C182 18 214 10 232 28 C252 14 290 22 300 54 C330 70 334 118 302 168 C304 136 292 112 270 102 C258 124 230 132 196 126 C176 140 140 140 122 132 C110 146 104 164 100 184 Z" fill="url(#rkH)"/>
  <path d="M150 60 C150 30 176 8 204 14 C214 -4 246 -6 262 12 C286 8 306 30 298 58 C312 66 312 84 300 96 C270 70 220 60 170 72 C158 70 150 66 150 60 Z" fill="url(#rkH)"/>
  <path d="M196 20 C206 4 230 0 246 10 C236 12 224 18 216 30 Z M252 20 C270 16 290 28 292 46 C282 38 270 34 258 34 Z" fill="#a8835c" opacity=".8"/>
  <path d="M150 70 q30 -30 70 -24 M196 60 q34 -26 74 -6 M128 100 q20 -18 48 -18 M232 86 q30 -6 52 16" stroke="#b08a60" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
 </g>
</svg>`;

// Yukoo: dunkle, zurückgekämmte Haare (Mittelscheitel, hinten zusammengebunden), Schnurrbart + Kinnbart, weißes Shirt
const YUKOO = `<svg viewBox="0 0 400 460" aria-hidden="true">
 <defs>
  <linearGradient id="ykS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfd6e6"/></linearGradient>
  <radialGradient id="ykF" cx="45%" cy="38%" r="65%"><stop offset="0" stop-color="#f0c39f"/><stop offset="1" stop-color="#cf9a74"/></radialGradient>
  <linearGradient id="ykH" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3d3029"/><stop offset="1" stop-color="#1c1512"/></linearGradient>
 </defs>
 <path d="M44 460 C46 384 84 344 152 328 L248 328 C316 344 354 384 356 460 Z" fill="url(#ykS)"/>
 <path d="M156 328 C176 354 224 354 244 328" fill="none" stroke="#b9c2d6" stroke-width="8"/>
 <rect x="174" y="270" width="52" height="66" rx="18" fill="#cf9a74"/>
 <g class="head">
  <path d="M118 186 C112 120 140 74 200 72 C260 74 288 120 282 186 C284 252 266 300 236 320 C220 332 180 332 164 320 C134 300 116 252 118 186 Z" fill="url(#ykF)"/>
  <ellipse cx="118" cy="200" rx="13" ry="22" fill="#d39f7a"/><ellipse cx="282" cy="200" rx="13" ry="22" fill="#d39f7a"/>
  <path d="M140 250 C150 290 170 316 200 320 C230 316 250 290 260 250 C254 286 236 306 200 310 C164 306 146 286 140 250 Z" fill="#5a4334" opacity=".28"/>
  <path d="M164 258 C176 246 192 246 200 252 C208 246 224 246 236 258 C238 266 230 266 224 262 C214 256 206 258 200 260 C194 258 186 256 176 262 C170 266 162 266 164 258 Z" fill="#2c2019"/>
  <g transform="translate(200 270)"><path d="M-20 0 Q0 8 20 0 Q0 26 -20 0 Z" class="mo mo2" fill="#4a1a1a"/><path d="M-19 0 Q0 6 19 0" stroke="#a65a50" stroke-width="4.5" fill="none" stroke-linecap="round"/></g>
  <path d="M190 292 C192 302 208 302 210 292 C206 312 194 312 190 292 Z" fill="#2c2019"/>
  <path d="M190 196 C188 222 178 236 184 244 C190 250 210 250 216 244 C222 236 212 222 210 196" fill="#d8a37d" stroke="#b47d58" stroke-width="2"/>
  <ellipse cx="164" cy="196" rx="15" ry="9.5" fill="#fff"/><ellipse cx="236" cy="196" rx="15" ry="9.5" fill="#fff"/>
  <circle cx="165" cy="197" r="7.5" fill="#4a2a14"/><circle cx="235" cy="197" r="7.5" fill="#4a2a14"/><circle cx="167" cy="194.5" r="2.4" fill="#fff"/><circle cx="237" cy="194.5" r="2.4" fill="#fff"/>
  <rect class="lid" x="148" y="185" width="33" height="22" rx="9" fill="#dca681"/><rect class="lid" x="219" y="185" width="33" height="22" rx="9" fill="#dca681"/>
  <path d="M142 178 C154 168 174 168 186 176" stroke="#241a14" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M214 176 C226 168 246 168 258 178" stroke="#241a14" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="M150 214 q14 6 30 2 M220 216 q16 4 30 -2" stroke="#b47d58" stroke-width="2" fill="none" opacity=".6"/>
  <path d="M114 196 C104 120 136 60 200 58 C264 60 296 120 286 196 C284 160 274 128 252 108 C236 98 216 94 202 96 C198 92 196 92 198 96 C184 94 164 98 148 108 C126 128 116 160 114 196 Z" fill="url(#ykH)"/>
  <path d="M200 64 L200 92" stroke="#0f0b09" stroke-width="2" opacity=".7"/>
  <path d="M150 96 C160 76 182 68 196 68 C178 78 164 92 156 112 Z M250 96 C240 76 218 68 204 68 C222 78 236 92 244 112 Z" fill="#6b5a50" opacity=".55"/>
  <path d="M284 168 C300 176 306 196 298 214 C294 196 290 186 282 184 Z" fill="url(#ykH)"/>
 </g>
</svg>`;

export function makeHost(parent) {
  if (!document.getElementById('hostCss')) { const st = document.createElement('style'); st.id = 'hostCss'; st.textContent = CSS; document.head.appendChild(st); }
  const el = document.createElement('div'); el.id = 'host'; el.hidden = true; parent.appendChild(el);
  el.innerHTML = `<div class="hs-cam"><div class="hs-wall">${'<i></i>'.repeat(9)}</div><div class="hs-beam b1"></div><div class="hs-beam b2"></div><div class="hs-beam b3"></div>
    <div class="hs-logo">TITAN<b>LIVE</b></div>
    <div class="hs-people"><div class="hs-p rk">${RICO}</div><div class="hs-p yk">${YUKOO}</div></div>
    <div class="hs-desk"></div><div class="hs-tag l">RicoReWi<small>Moderator</small></div><div class="hs-tag r">Yukoo<small>Co-Kommentator</small></div></div>
    <div class="hs-live">● LIVE</div><div class="hs-skip">Weiter ▶</div><div class="hs-sub"></div>`;
  const rk = el.querySelector('.rk'), yk = el.querySelector('.yk'), sub = el.querySelector('.hs-sub');
  let busy = null;
  const pickTxt = (key, n) => { const l = TXT[key] || []; return l[n % Math.max(1, l.length)] || ''; };
  /** say(key) → [Sekunden, Index der Variante] */
  function play({ final = false, say, fast = 1 } = {}) {
    if (busy) return busy;
    const hk = final ? 'host_final' : 'host_fin', yk2 = final ? 'yuk_final' : 'yuk_fin', timers = [];
    el.hidden = false; el.querySelector('.hs-cam').style.animation = 'none'; void el.offsetWidth; el.querySelector('.hs-cam').style.animation = '';
    busy = new Promise(done => {
      const end = () => { timers.forEach(clearTimeout); rk.classList.remove('talk'); yk.classList.remove('talk'); el.hidden = true; removeEventListener('keydown', onKey, true); el.onclick = null; busy = null; done(); };
      const onKey = e => { if (/Space|Enter|Escape|KeyE|KeyX/.test(e.code)) { e.preventDefault(); e.stopPropagation(); end(); } };
      addEventListener('keydown', onKey, true); el.onclick = end;
      const T = (ms, f) => timers.push(setTimeout(f, ms / fast));
      const line = (who, key, at, then) => T(at, () => {
        const r = say ? say(key, { priority: who === rk }) : 0, d = r && r[0] ? r[0] : 2.6, txt = pickTxt(key, r && r[1] != null ? r[1] : Math.floor(Math.random() * 4));
        who.classList.add('talk'); sub.innerHTML = `<b>${who === rk ? 'RicoReWi' : 'Yukoo'}:</b>${txt}`;
        T(d * 1000, () => { who.classList.remove('talk'); then(); });
      });
      line(rk, hk, 700, () => line(yk, yk2, 180, () => T(900, end)));
    });
    return busy;
  }
  return { play, el, get busy() { return !!busy; } };
}
