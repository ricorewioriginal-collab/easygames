'use strict';
/* Bunte Insel – Fehler melden 🐞: sammelt Fehlermeldungen schon beim Laden und baut daraus einen Bericht (Gerät, Welt, Modus, Position, letzte Fehler).
   „Per Mail senden“ öffnet das Mailprogramm an ricorewioriginal@gmail.com, „Kopieren“ legt den Bericht in die Zwischenablage. Es wird nichts automatisch verschickt. */
BI.BUG_MAIL = 'ricorewioriginal@gmail.com';
BI.ERRLOG = BI.ERRLOG || [];
(function () {
  const push = (k, m) => { try { BI.ERRLOG.push(new Date().toISOString().slice(11, 19) + ' ' + k + ': ' + String(m).slice(0, 220)); if (BI.ERRLOG.length > 12) BI.ERRLOG.shift(); } catch (e) { } };
  addEventListener('error', e => push('Fehler', (e.message || '') + (e.filename ? ' @' + String(e.filename).split('/').pop() + ':' + e.lineno : '')));
  addEventListener('unhandledrejection', e => push('Promise', e.reason && e.reason.message || e.reason));
  const ce = console.error; console.error = function () { push('console', Array.from(arguments).join(' ')); return ce.apply(console, arguments); };
})();
BI.createBugs = function (G) {
  const { save, say } = G, K = { open: false }; let root = null;
  K.info = function () {
    const P = G.P, o = [];
    const build = ((document.querySelector('script[src*="js/main.js"]') || {}).src || '').split('?')[1] || '?';
    o.push('Version: ' + build); o.push('Modus: ' + (save.mode === 'story' ? 'Story' : 'Freie Welt') + ' · Spielstand-Welt: ' + (BI.worldAt ? BI.worldAt(P.x, P.z) : '?')); o.push('Position: x ' + Math.round(P.x) + ', z ' + Math.round(P.z) + ', y ' + Math.round(P.y * 10) / 10 + (P.veh ? ' (im Fahrzeug)' : ''));
    o.push('Sterne: ' + save.stars + ' · Sticker: ' + (save.stk || []).length + ' · Inselreise-Kapitel: ' + (save.story ? save.story.c : 0));
    o.push('Gerät: ' + (document.body.classList.contains('touch') ? 'Touch' : 'Maus/Tastatur') + (document.body.classList.contains('gamepad') ? ' + Controller' : '') + (document.body.classList.contains('tv') ? ' + TV-Modus' : '') + ' · Bildschirm ' + innerWidth + 'x' + innerHeight + ' @' + (window.devicePixelRatio || 1));
    o.push('Browser: ' + navigator.userAgent); if (BI.ERRLOG.length) o.push('Letzte Fehler:\n  ' + BI.ERRLOG.join('\n  ')); return o.join('\n');
  };
  K.report = function (type, text) { return 'Bunte Insel – ' + type + '\n\n' + (text || '(keine Beschreibung)') + '\n\n--- automatisch angehängt ---\n' + K.info(); };
  K.mailto = function (type, text) { let body = K.report(type, text); if (body.length > 1700) body = body.slice(0, 1700) + '\n… (gekürzt – bitte „Kopieren“ nutzen und einfügen)'; return 'mailto:' + BI.BUG_MAIL + '?subject=' + encodeURIComponent('Bunte Insel: ' + type) + '&body=' + encodeURIComponent(body); };
  K.show = function () {
    if (K.open) return; K.open = true; G.setStick && G.setStick(0, 0);
    root = document.createElement('div'); root.style.cssText = 'position:fixed;inset:0;z-index:99995;display:flex;align-items:center;justify-content:center;background:rgba(20,10,40,.62);font-family:Fredoka,system-ui,sans-serif';
    root.innerHTML = '<div style="background:#fffaf0;border:6px solid #e0452a;border-radius:24px;padding:16px;width:min(94vw,480px);max-height:94vh;overflow:auto;text-align:center"><div style="font-size:26px;font-weight:900;color:#a0301a">🐞 Fehler melden</div><div style="font-size:14px;color:#556;margin:4px 0 8px">Danke! Das hilft bei der Weiterentwicklung. Gerät, Welt und letzte Fehler werden automatisch angehängt.</div><select id="bgType" aria-label="Art" style="width:100%;font:700 16px inherit;padding:8px;border-radius:12px;border:3px solid #e0902a;margin-bottom:8px"><option>Fehler / etwas geht nicht</option><option>Hänger / ruckelt</option><option>Idee / Wunsch</option><option>Frage</option></select><textarea id="bgText" rows="5" placeholder="Was ist passiert? Wo (Welt/Ort)? Was hast du vorher gemacht?" aria-label="Beschreibung" style="width:100%;box-sizing:border-box;font:600 16px inherit;padding:8px;border-radius:12px;border:3px solid #e0902a"></textarea><details style="text-align:left;margin:8px 0;font-size:12px;color:#556"><summary style="cursor:pointer;font-weight:800">Was wird angehängt?</summary><pre id="bgInfo" style="white-space:pre-wrap;word-break:break-all;margin:6px 0 0"></pre></details><div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><button type="button" id="bgMail" style="border-radius:14px;border:3px solid #4cd07d;background:#fff;padding:8px 14px;font:900 16px inherit;cursor:pointer">📧 Per Mail senden</button><button type="button" id="bgCopy" style="border-radius:14px;border:3px solid #4da3ff;background:#fff;padding:8px 14px;font:900 16px inherit;cursor:pointer">📋 Kopieren</button><button type="button" id="bgX" style="border-radius:14px;border:3px solid #e0902a;background:#fff;padding:8px 14px;font:800 16px inherit;cursor:pointer">Schließen</button></div><div style="font-size:12px;color:#778;margin-top:8px">Mail an ' + BI.BUG_MAIL + '</div></div>';
    document.body.appendChild(root); const $ = id => root.querySelector('#' + id); $('bgInfo').textContent = K.info();
    const cur = () => [$('bgType').value, $('bgText').value];
    $('bgMail').onclick = () => { const [t, x] = cur(); const a = document.createElement('a'); a.href = K.mailto(t, x); document.body.appendChild(a); a.click(); a.remove(); say('📧 Dein Mailprogramm öffnet sich. Falls nicht: „Kopieren“ und selbst senden.', 4200); };
    $('bgCopy').onclick = async () => { const [t, x] = cur(), r = K.report(t, x); try { await navigator.clipboard.writeText(r); say('📋 Bericht kopiert – jetzt in eine Mail an ' + BI.BUG_MAIL + ' einfügen.', 4600); } catch (e) { const ta = $('bgText'); ta.value = r; ta.select(); say('📋 Bericht steht im Feld – markieren und kopieren.', 4200); } };
    $('bgX').onclick = K.close; root.addEventListener('click', e => { if (e.target === root) K.close(); }); root.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') K.close(); }); setTimeout(() => $('bgText').focus(), 50);
  };
  K.close = function () { if (!K.open) return; K.open = false; if (root) { root.remove(); root = null; } };
  return K;
};
