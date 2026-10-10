'use strict';
/* Bunte Insel – Camp: Lagerfeuer mit flackernden Flammen, Gute-Nacht-Geschichten zum Vorlesen, Marshmallows. */
BI.createCamp = function (G) {
  const { scene, A, fx, P, say, addStars } = G, $ = id => document.getElementById(id), K = { open: false }, C = G.W.spots.camp;
  const STORIES = [
    ['🐻', 'Der müde Bär', ['Der kleine Bär Bruno konnte nicht einschlafen. Der Mond schien hell in seine Höhle.', 'Da kam die Eule Emma und sagte: „Zähl die Sterne, dann wirst du ganz müde.“', 'Bruno zählte eins, zwei, drei … bei zwölf fielen ihm die Augen zu. Gute Nacht, kleiner Bär!']],
    ['🐉', 'Der freundliche Drache', ['Hoch auf dem Berg wohnte ein kleiner Drache. Er hatte Angst, dass ihn jemand ärgert.', 'Aber als er einem Mädchen half, ihr Lagerfeuer anzuzünden, wurden sie beste Freunde.', 'Seitdem wärmt der Drache jeden Abend die ganze Insel. Wie schön!']],
    ['⭐', 'Der Stern im See', ['Ein Stern fiel eines Nachts in den See und wusste nicht, wie er nach Hause kommt.', 'Die Fische bauten eine Leiter aus Blasen, immer höher und höher.', 'Der Stern schwebte zurück an den Himmel und winkt seitdem jeden Abend: „Danke, ihr Lieben!“']],
    ['🚂', 'Die kleine Lok', ['Die kleine rote Lok Lotta hatte einen langen Weg um die ganze Insel.', 'Sie pfiff leise: „Ich glaub, ich schaff es, ich glaub, ich schaff es!“', 'Und tatsächlich: Sie kam an und alle Kinder winkten. Tut tuuut!']]
  ];
  const flames = [0xff4a1f, 0xff9a2e, 0xffe14a].map((c, i) => { const m = new THREE.Mesh(new THREE.ConeGeometry(.55 - i * .14, 1.5 - i * .3, 6), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .92 })); m.position.set(C.x, .8 + i * .05, C.z); scene.add(m); return m; });
  K.near = () => !G.P.veh && Math.hypot(P.x - C.x, P.z - C.z) < 4.2;
  let sel = -1, page = 0, marshT = 0;
  function show() { const l = $('storyList'); l.innerHTML = ''; STORIES.forEach((s, i) => { const b = document.createElement('button'); b.className = 'pill' + (i === sel ? ' sel' : ''); b.textContent = s[0] + ' ' + s[1]; b.onclick = () => { sel = i; page = 0; read(); A.pop(); show(); }; l.appendChild(b); }); }
  function read() { const s = STORIES[sel]; if (!s) { $('storyText').textContent = 'Setz dich ans Feuer und such dir eine Geschichte aus 🔥'; return; } const t = s[2][page]; $('storyText').textContent = s[0] + ' ' + t; if (A.speak) A.speak(t); if (page === s[2].length - 1) G.earn && G.earn('story'); }
  $('storyNext').addEventListener('click', () => { const s = STORIES[sel]; if (!s) return; page = (page + 1) % s[2].length; read(); });
  $('storyMarsh').addEventListener('click', () => { const n = performance.now(); if (n - marshT < 20000) { say('🍡 Noch etwas warten – sonst verbrennt es!', 2000); return; } marshT = n; addStars(1); A.buy && A.buy(); say('🍡 Lecker Marshmallow! +1 ⭐', 2200); });
  K.show = function () { if (K.open) return; K.open = true; G.setStick(0, 0); sel = -1; page = 0; show(); read(); $('storyPanel').hidden = false; };
  K.close = function () { K.open = false; $('storyPanel').hidden = true; if (window.speechSynthesis) { try { window.speechSynthesis.cancel(); } catch (e) { } } G.updateButtons(true); };
  $('storyClose').addEventListener('click', K.close);
  K.update = function (dt, t, night) {
    const near = Math.hypot(P.x - C.x, P.z - C.z) < 80; for (const f of flames) f.visible = near; if (!near) return;
    flames.forEach((f, i) => { f.scale.set(1 + Math.sin(t * 9 + i * 2) * .12, 1 + Math.sin(t * 13 + i) * .18, 1 + Math.sin(t * 11 + i * 3) * .12); f.rotation.y = t * 2 + i; });
    if (Math.random() < dt * 6) fx.emit(C.x + (Math.random() - .5) * .5, 1.6, C.z + (Math.random() - .5) * .5, (Math.random() - .5) * .5, 2.2, (Math.random() - .5) * .5, .8, 18, .9, .5, .1, 4, .5);
  };
  return K;
};
