/* Wobbel – gemeinsames 2D-Zeichnen der Figur (Bonusspiele, Laden-Vorschau). */
export function drawWobbel(g, cx, cy, r, look, blink) {
  look = look || {}; const c = look.color || '#ff6fb0', ink = '#1b2748';
  g.save(); g.lineWidth = Math.max(1.5, r / 9); g.strokeStyle = ink;
  g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(cx, cy + r * .66, r * .55, r * .17, 0, 0, 7); g.fill();
  g.fillStyle = c; g.beginPath(); g.ellipse(cx, cy + r * .08, r * .74, r * .66, 0, 0, 7); g.fill(); g.stroke();
  [-1, 1].forEach(k => { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(cx + k * r * .27, cy - r * .1, r * .17, blink ? r * .03 : r * .21, 0, 0, 7); g.fill(); g.stroke(); if (!blink) { g.fillStyle = ink; g.beginPath(); g.arc(cx + k * r * .27, cy - r * .05, r * .08, 0, 7); g.fill(); } });
  g.beginPath(); g.arc(cx, cy + r * .2, r * .17, .15 * Math.PI, .85 * Math.PI); g.stroke();
  const hat = look.hat, top = cy - r * .5;
  if (hat === 'crown') { g.fillStyle = '#ffd24a'; g.beginPath(); g.moveTo(cx - r * .4, top + r * .1); g.lineTo(cx - r * .45, top - r * .35); g.lineTo(cx - r * .2, top - r * .1); g.lineTo(cx, top - r * .42); g.lineTo(cx + r * .2, top - r * .1); g.lineTo(cx + r * .45, top - r * .35); g.lineTo(cx + r * .4, top + r * .1); g.closePath(); g.fill(); g.stroke(); }
  else if (hat === 'top') { g.fillStyle = '#2a2a3a'; g.fillRect(cx - r * .27, top - r * .6, r * .54, r * .6); g.strokeRect(cx - r * .27, top - r * .6, r * .54, r * .6); g.fillRect(cx - r * .45, top - r * .02, r * .9, r * .12); g.fillStyle = '#ff5a6a'; g.fillRect(cx - r * .27, top - r * .16, r * .54, r * .12); }
  else if (hat === 'bow') { g.fillStyle = '#ff4f7a'; [-1, 1].forEach(k => { g.beginPath(); g.moveTo(cx + r * .35, top + r * .05); g.lineTo(cx + r * .35 + k * r * .3, top - r * .15); g.lineTo(cx + r * .35 + k * r * .3, top + r * .25); g.closePath(); g.fill(); g.stroke(); }); g.beginPath(); g.arc(cx + r * .35, top + r * .05, r * .07, 0, 7); g.fillStyle = '#d63a64'; g.fill(); g.stroke(); }
  else if (hat === 'party') { g.fillStyle = '#4aa8ff'; g.beginPath(); g.moveTo(cx - r * .28, top + r * .08); g.lineTo(cx, top - r * .6); g.lineTo(cx + r * .28, top + r * .08); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#ff5a6a'; g.beginPath(); g.arc(cx, top - r * .6, r * .08, 0, 7); g.fill(); }
  else if (hat === 'prop') { g.fillStyle = '#4aa8ff'; g.beginPath(); g.ellipse(cx, top + r * .02, r * .25, r * .12, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#ff5a6a'; g.beginPath(); g.ellipse(cx, top - r * .2, r * .42, r * .07, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.moveTo(cx, top - r * .12); g.lineTo(cx, top); g.stroke(); }
  else { g.strokeStyle = '#2fa84a'; g.beginPath(); g.moveTo(cx, top + r * .1); g.lineTo(cx + r * .06, top - r * .2); g.stroke(); g.fillStyle = '#7bf06a'; g.strokeStyle = ink; g.beginPath(); g.ellipse(cx + r * .2, top - r * .22, r * .16, r * .08, -.4, 0, 7); g.fill(); g.stroke(); }
  g.restore();
}
