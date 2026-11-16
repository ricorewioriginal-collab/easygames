/* GayLife – Wetter: ein Wetter pro Spieltag (aus der Tageszahl berechnet, also ohne Speicherstand und auf jedem Gerät gleich).
   Draußen verändert es Licht, Nebel, Himmel, Regentropfen, Ton und die Laune (Sonne +2, Regen −3); in Wohnungen spürt man nichts.
   Handy-App „Wetter“ zeigt heute und die nächsten drei Tage. */
(function () {
  'use strict';
  var S = GL.S, Wx = GL.weather = {}, forced = null;
  var K = {
    sun: { n: 'Sonnig', e: '☀️', lum: 1, fn: 1, ff: 1, gray: 0, mood: 2 },
    cloud: { n: 'Bewölkt', e: '☁️', lum: .85, fn: .8, ff: .85, gray: .35, mood: 0 },
    rain: { n: 'Regen', e: '🌧️', lum: .65, fn: .5, ff: .65, gray: .6, mood: -3 },
    fog: { n: 'Nebel', e: '🌫️', lum: .75, fn: .15, ff: .3, gray: .7, mood: 0 }
  };
  function hash(d) { var h = Math.imul(d + 7, 2654435761) >>> 0; h = Math.imul(h ^ h >>> 15, 2246822519) >>> 0; return (h ^ h >>> 13) >>> 0; }
  Wx.kind = function (day) { if (forced && day === GL.S.life.day) return forced; var r = hash(day) % 100; return r < 48 ? 'sun' : r < 72 ? 'cloud' : r < 92 ? 'rain' : 'fog'; };
  Wx.today = function () { return Wx.kind(GL.S.life.day); };
  Wx.info = function (k) { return K[k]; };
  Wx.force = function (k) { forced = K[k] ? k : null; };   /* nur für Tests */
  function outside() { var W = GL.W; return !!(W && W.on && !W.inside); }
  Wx.bonus = function () { return outside() ? K[Wx.today()].mood : 0; };

  var rainM = null, drops = null, cur = '', DR = 260, BX = 26, BY = 16;
  function mkRain(W) {
    var g = new THREE.BufferGeometry(), p = new Float32Array(DR * 6), i; drops = new Float32Array(DR * 3);
    for (i = 0; i < DR; i++) { drops[i * 3] = (Math.random() - .5) * BX; drops[i * 3 + 1] = Math.random() * BY; drops[i * 3 + 2] = (Math.random() - .5) * BX; }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    rainM = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xaec6e8, transparent: true, opacity: .5, fog: false }));
    rainM.frustumCulled = false; rainM.visible = false; W.scene.add(rainM);
  }
  GL.on('skyAfter', function (W) {
    var k = Wx.today(), c = K[k], t = S.world.t, dayF = Math.max(0, Math.min(1, Math.sin(t * 6.2832) * 1.6 + .35));
    W.hemi.intensity *= c.lum; W.sun.intensity *= c.lum;
    if (c.gray) { var g = new THREE.Color(0x8e96a3).multiplyScalar(.25 + .75 * dayF); W.scene.background.lerp(g, c.gray); W.scene.fog.color.copy(W.scene.background); }
    W.scene.fog.near = (W.fogN || 70) * c.fn; W.scene.fog.far = (W.fogF || 230) * c.ff;
    if (k === 'rain' || k === 'fog') W.sunM.visible = W.moonM.visible = false;
    if (k !== cur) { cur = k; var col = k === 'rain' ? 0x7d8794 : k === 'fog' ? 0xb7bcc6 : k === 'cloud' ? 0xe6e9ef : 0xffffff; W.clouds.forEach(function (m) { m.material.color.setHex(col); m.material.opacity = k === 'sun' ? .85 : .95; }); }
  });
  var lastIn = 0;
  GL.on('tick', function (dt, W) {
    var k = Wx.today(), out = !W.inside, raining = k === 'rain' && out;
    if (!rainM && raining) mkRain(W);
    if (W.inside && !lastIn) { var f = W.scene.fog; f.near = W.fogN || f.near; f.far = W.fogF || f.far; }
    lastIn = W.inside ? 1 : 0;
    if (GL.audio) GL.audio.rain(raining);
    if (!rainM) return;
    rainM.visible = raining; if (!raining) return;
    var P = rainM.geometry.attributes.position.array, p = W.player, i, x, y, z;
    for (i = 0; i < DR; i++) {
      drops[i * 3 + 1] -= dt * 24; if (drops[i * 3 + 1] < 0) { drops[i * 3 + 1] += BY; drops[i * 3] = (Math.random() - .5) * BX; drops[i * 3 + 2] = (Math.random() - .5) * BX; }
      x = p.x + drops[i * 3]; y = drops[i * 3 + 1]; z = p.z + drops[i * 3 + 2];
      P[i * 6] = x; P[i * 6 + 1] = y; P[i * 6 + 2] = z; P[i * 6 + 3] = x - .05; P[i * 6 + 4] = y + .55; P[i * 6 + 5] = z;
    }
    rainM.geometry.attributes.position.needsUpdate = true;
  });
  function say(prefix) { var k = Wx.today(); GL.core.toast(prefix + K[k].e + ' ' + K[k].n + (K[k].mood > 0 ? ' · draußen gute Laune' : K[k].mood < 0 ? ' · draußen etwas trüb' : '')); }
  GL.on('newDay', function () { setTimeout(function () { if (GL.W && GL.W.on) say('Heute: '); }, 1500); });
  GL.phone.register('weather', 'Wetter', '🌦️', function () {
    var d = GL.S.life.day, names = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'], h = '', k = Wx.kind(d), c = K[k];
    h += '<div class="pcard" style="text-align:center"><div style="font-size:44px">' + c.e + '</div><b>' + c.n + '</b><br><small class="sub">Heute · ' + (c.mood > 0 ? 'draußen +2 Laune' : c.mood < 0 ? 'draußen −3 Laune' : 'kein Einfluss auf die Laune') + '</small></div>';
    for (var i = 1; i <= 3; i++) { var kk = Wx.kind(d + i); h += '<div class="pcard">' + K[kk].e + ' <b>' + names[(d + i - 1) % 7] + '</b> · ' + K[kk].n + '</div>'; }
    return h + '<p class="sub">Das Wetter wirkt nur draußen. In der Wohnung bleibt es gemütlich.</p>';
  });
})();
