/* Welt-Atmosphäre und Grafikprofil: ein einziger Punkte-Pool (eine Zeichnung) mit Partikelart je Welt.
   Nur Optik: keine Kollision, kein Gameplay. Anzahl skaliert mit dem Grafikprofil. */
import * as T from 'three';

/* Art je Welt: [Art, Farbe oder null = Leuchtfarbe der Welt, Stärke]. Arten: 0 Pollen/Staub schwebend, 1 Schnee fallend, 2 Glut steigend, 3 Sporen/Blüten treibend, 4 Blasen steigend */
const KIND = { 1: [0, 0xcfe2ff, .5], 2: [3, 0xb8ffa0, .8], 3: [0, 0xffe6b0, .5], 4: [0, 0xf0d29a, 1], 5: [2, 0xff8a40, 1], 6: [1, 0xffffff, 1], 7: [3, 0x9affc8, .9], 8: [0, 0xd8d0c0, .6], 9: [3, 0xffd0f0, .9], 10: [0, 0xfff4d0, .8], 11: [2, 0xffa860, .8], 21: [3, 0xffe9a0, .8], 22: [0, 0xe8c8ff, .8], 23: [4, 0xbfeaff, 1], 24: [0, 0xfff0d0, .7], 25: [3, 0xffc0e0, .8], 26: [3, 0xb0ffb8, .9], 27: [0, 0xe6f0ff, .7] };

export function createPolish({ scene, TOUCH, curCh, glow }) {
  const N = TOUCH ? 160 : 320, P = new Float32Array(N * 3), R = new Float32Array(N);
  for (let i = 0; i < N; i++) { P[i * 3] = (Math.random() - .5) * 60; P[i * 3 + 1] = Math.random() * 20; P[i * 3 + 2] = (Math.random() - .5) * 60; R[i] = Math.random(); }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(P, 3)); g.setAttribute('r', new T.BufferAttribute(R, 1));
  const m = new T.ShaderMaterial({
    transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false,
    uniforms: { t: { value: 0 }, cen: { value: new T.Vector3() }, k: { value: 400 }, col: { value: new T.Color(0xffffff) }, kind: { value: 0 }, amt: { value: 1 } },
    vertexShader: 'attribute float r;varying float a;uniform float t,k,kind,amt;uniform vec3 cen;void main(){vec3 w=vec3(60.,20.,60.);vec3 p=position;'
      + 'float s=.6+r*.8;if(kind<.5){p.x+=sin(t*.3*s+r*30.)*1.6;p.z+=cos(t*.27*s+r*20.)*1.6;p.y+=sin(t*.4*s+r*9.)*.8;}'
      + 'else if(kind<1.5){p.y-=t*(1.6+r*1.4);p.x+=sin(t*.5+r*40.)*.9+t*.4;p.z+=cos(t*.4+r*25.)*.7;}'
      + 'else if(kind<2.5){p.y+=t*(.9+r*1.2);p.x+=sin(t*.8+r*30.)*.7;p.z+=cos(t*.7+r*20.)*.7;}'
      + 'else if(kind<3.5){p.x+=sin(t*.35*s+r*50.)*3.;p.z+=cos(t*.3*s+r*33.)*3.;p.y+=sin(t*.5*s+r*12.)*1.1;}'
      + 'else{p.y+=t*(.7+r*.9);p.x+=sin(t*.9+r*40.)*.5;}'
      + 'p=mod(p-cen+w*.5,w)-w*.5+cen;p.y=cen.y-2.+mod(p.y-cen.y+2.,w.y);'
      + 'float on=step(r,amt);a=on*(.45+.55*sin(t*(1.2+r*2.)+r*40.))*smoothstep(0.,3.,length(p-cen));'
      + 'vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=on*(.35+r*.45)*k/-mv.z;gl_Position=projectionMatrix*mv;}',
    fragmentShader: 'varying float a;uniform vec3 col;void main(){float d=length(gl_PointCoord-.5)*2.;gl_FragColor=vec4(col*1.25,smoothstep(1.,0.,d)*a*.8);}'
  });
  const pts = new T.Points(g, m); pts.frustumCulled = false; pts.renderOrder = 5; scene.add(pts);
  let cur = -1;
  return {
    pts,
    /* Pro Bild aufrufen: Mitte (Kamerazielpunkt), Zeit, Skalierung der Menge (0..1) */
    update(t, cx, cy, cz, innerH, scale) {
      const n = curCh(), inside = n !== 12 && n !== 13 && n !== 14 && n !== 15;
      const d = KIND[n]; pts.visible = !!d && inside && scale > 0; if (!pts.visible) return;
      const u = m.uniforms;
      if (n !== cur) { cur = n; u.kind.value = d[0]; u.col.value.setHex(d[1]); }
      u.t.value = t; u.cen.value.set(cx, cy, cz); u.k.value = innerH * .55; u.amt.value = Math.min(1, d[2] * scale);
    }
  };
}

/* ---- Grafikprofil: Bereich der automatischen Qualitätsstufen (0 = beste, 3 = sparsamste) ---- */
export const PROFILES = {
  auto: { name: 'Auto', lo: 0, hi: 3, amb: -1 },
  hoch: { name: 'Hoch', lo: 0, hi: 0, amb: 1 },
  mittel: { name: 'Mittel', lo: 1, hi: 1, amb: .6 },
  niedrig: { name: 'Niedrig', lo: 2, hi: 2, amb: .25 }
};
export function loadProfile() { try { const v = localStorage.getItem('zotik_gfx'); return PROFILES[v] ? v : 'auto' } catch (e) { return 'auto' } }
export function saveProfile(v) { try { localStorage.setItem('zotik_gfx', v) } catch (e) { } }

/* ---- Umgebungsklang: ein Rauschbett (Wind, Rauschen, Glut) mit Filter je Welt-Art, läuft leise unter der Musik ---- */
const BED = { 0: [520, .5, .022, .08], 1: [380, .7, .05, .12], 2: [140, .8, .045, .2], 3: [900, .6, .018, .1], 4: [240, .6, .05, .15] };
export function createAmbient() {
  let ctx = null, g = null, f = null, lfo = null, lg = null, last = -2;
  function init(AC, master) {
    const b = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate), a = b.getChannelData(0); let y = 0;
    for (let i = 0; i < a.length; i++) { y = y * .96 + (Math.random() * 2 - 1) * .04; a[i] = y * 5 }
    const s = AC.createBufferSource(); s.buffer = b; s.loop = true;
    f = AC.createBiquadFilter(); f.type = 'bandpass'; g = AC.createGain(); g.gain.value = 0;
    lfo = AC.createOscillator(); lfo.frequency.value = .12; lg = AC.createGain(); lg.gain.value = 0; lfo.connect(lg); lg.connect(g.gain);
    s.connect(f); f.connect(g); g.connect(master); s.start(); lfo.start(); ctx = AC;
  }
  return function (AC, master, ch, on) {
    if (!AC) return; if (!ctx) init(AC, master);
    const d = on ? KIND[ch] : null, key = d ? d[0] : -1; if (key === last) return; last = key;
    const t = AC.currentTime, p = d ? BED[key] : null;
    if (!p) { g.gain.setTargetAtTime(0, t, .8); lg.gain.setTargetAtTime(0, t, .8); return }
    f.frequency.setTargetAtTime(p[0], t, .8); f.Q.value = p[1]; g.gain.setTargetAtTime(p[2], t, 1.2); lg.gain.setTargetAtTime(p[2] * .6, t, 1.2); lfo.frequency.value = p[3];
  };
}
