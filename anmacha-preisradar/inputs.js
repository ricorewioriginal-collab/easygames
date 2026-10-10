/* Preisradar – Eingabe-Elemente für alle Rundenarten (Gastgeber UND Handy benutzen dieselben):
   mountInput(root, spec, {onSubmit(v), name}) baut Gebot-Feld, Skala-Regler, Teurer/Billiger-Tasten oder Einkaufswagen. */
export const eur = n => (typeof n === 'number' && isFinite(n) ? n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €' : '–');
const esc = s => String(s == null ? '' : s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
export const card = (it, price) => `<div class="prod"><div class="pe">${esc(it.e)}</div><div class="pn">${esc(it.n)}</div><small>${esc(it.c)}${it.u ? ' · ' + esc(it.u) : ''}</small>${price ? `<b class="pp">${eur(it.p)}</b>` : ''}</div>`;
const cents = x => Math.round(x * 100) / 100;

export function mountInput(root, spec, o) {
  let timer = 0, done = false; const submit = v => { if (done) return; done = true; clearInterval(timer); o.onSubmit(v); };
  const title = o.name ? `<div class="who">${esc(o.name)}</div>` : '';
  if (spec.kind === 'bid' || spec.kind === 'final') {
    const fin = spec.kind === 'final';
    root.innerHTML = `${title}<div class="ask">${fin ? 'Was kostet das <b>ganze Paket</b>? (Gesamtpreis)' : 'Was kostet das? Dein Gebot (so nah wie möglich, <b>nicht drüber</b>):'}</div><form class="bidf" autocomplete="off"><input id="bidInp" inputmode="decimal" placeholder="z. B. 12,50" maxlength="9" aria-label="Dein Gebot in Euro" autocomplete="off"><span>€</span><button class="btn green" type="submit">Bieten</button></form>`;
    const inp = root.querySelector('#bidInp'); setTimeout(() => inp.focus(), 40);
    root.querySelector('form').onsubmit = e => { e.preventDefault(); const x = parseFloat(inp.value.replace(',', '.').replace(/[^0-9.]/g, '')); if (!isFinite(x) || x < 0) { inp.classList.add('bad'); return; } submit(cents(x)); };
  } else if (spec.kind === 'dial') {
    const mid = cents((spec.min + spec.max) / 2);
    root.innerHTML = `${title}<div class="ask">Stelle die Frequenz auf den Preis ein:</div><div class="dialv" id="dv">${eur(mid)}</div><input id="rng" type="range" min="${spec.min}" max="${spec.max}" step="${spec.step || 1}" value="${mid}" aria-label="Preis einstellen"><div class="dials"><span>${eur(spec.min)}</span><span>${eur(spec.max)}</span></div><button class="btn green" id="dOk">Festlegen</button>`;
    const r = root.querySelector('#rng'), dv = root.querySelector('#dv'); r.oninput = () => { dv.textContent = eur(+r.value); o.onChange && o.onChange(+r.value); }; o.onChange && o.onChange(+r.value); root.querySelector('#dOk').onclick = () => submit(cents(+r.value));
  } else if (spec.kind === 'hilo') {
    const ch = [];
    const step = () => { const i = ch.length, prev = spec.items[i], next = spec.items[i + 1]; root.innerHTML = `${title}<div class="ask">Frage ${i + 1} von 3: Ist das rechte Produkt <b>teurer</b> oder <b>billiger</b> als das linke?</div><div class="vs">${card(prev, i === 0)}<div class="vsm">→</div>${card(next, false)}</div>${i > 0 ? '<div class="info">Der Preis des linken Produkts wird erst am Ende aufgedeckt – schätze selbst.</div>' : ''}<div class="row2"><button class="btn blue" data-v="1">⬆ teurer</button><button class="btn" data-v="0">⬇ billiger</button></div>`; root.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { ch.push(b.dataset.v === '1'); if (ch.length === 3) submit(ch); else step(); }); };
    step();
  } else if (spec.kind === 'cart') {
    const sel = new Set(), t0 = Date.now(); let left = spec.time;
    const draw = () => { const total = cents([...sel].reduce((a, i) => a + spec.items[i].p, 0)); const over = total > spec.target + 1e-9; root.querySelector('#cTot').textContent = eur(total); root.querySelector('#cTot').classList.toggle('over', over); root.querySelector('#cGap').textContent = over ? 'zu viel!' : eur(cents(spec.target - total)) + ' fehlen'; root.querySelectorAll('.ct').forEach(b => b.classList.toggle('on', sel.has(+b.dataset.i))); };
    root.innerHTML = `${title}<div class="ask">Packe den Wagen auf <b>genau ${eur(spec.target)}</b> – nicht drüber!</div><div class="cart">${spec.items.map((it, i) => `<button class="ct" data-i="${i}"><span>${esc(it.e)}</span><b>${esc(it.n)}</b><i>${eur(it.p)}</i></button>`).join('')}</div><div class="cbar"><div>Wagen: <b id="cTot">0,00 €</b> · <span id="cGap"></span></div><div class="tm"><i id="cTm"></i></div></div><button class="btn green" id="cOk">Fertig</button>`;
    root.querySelectorAll('.ct').forEach(b => b.onclick = () => { const i = +b.dataset.i; if (sel.has(i)) sel.delete(i); else sel.add(i); draw(); }); draw();
    root.querySelector('#cOk').onclick = () => submit([...sel].sort((a, b) => a - b));
    timer = setInterval(() => { left = spec.time - (Date.now() - t0) / 1000; const bar = root.querySelector('#cTm'); if (bar) bar.style.transform = `scaleX(${Math.max(0, left / spec.time)})`; if (left <= 0) submit([...sel].sort((a, b) => a - b)); }, 150);
  }
  return { destroy() { done = true; clearInterval(timer); root.innerHTML = ''; } };
}
