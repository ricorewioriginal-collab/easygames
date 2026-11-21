// Effekte: Funken beim Grinden, Staub bei Landungen, Glitzern bei Spezialtricks.
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem';
import '@babylonjs/core/Particles/particleSystemComponent';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { Vector3, Color4 } from '@babylonjs/core/Maths/math';

function dot(scene) {
  const t = new DynamicTexture('fxdot', 64, scene, false), g = t.getContext();
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); t.update(); t.hasAlpha = true; return t;
}

export class FX {
  constructor(scene, low) {
    const tex = dot(scene);
    this.emit = new Vector3();
    const mk = (n, o) => {
      const p = new ParticleSystem('fx', low ? Math.ceil(n / 2) : n, scene);
      p.particleTexture = tex; p.emitter = this.emit; p.blendMode = o.add ? ParticleSystem.BLENDMODE_ADD : ParticleSystem.BLENDMODE_STANDARD;
      Object.assign(p, o.p); p.color1 = o.c1; p.color2 = o.c2; p.colorDead = o.cd;
      p.gravity = new Vector3(0, o.g || 0, 0); p.emitRate = 0; p.start(); return p;
    };
    this.sparks = mk(220, { add: true, g: -14, c1: new Color4(1, 0.85, 0.4, 1), c2: new Color4(1, 0.55, 0.15, 1), cd: new Color4(1, 0.2, 0, 0),
      p: { minSize: 0.02, maxSize: 0.06, minLifeTime: 0.15, maxLifeTime: 0.45, minEmitPower: 1.5, maxEmitPower: 4.5, updateSpeed: 0.016,
        direction1: new Vector3(-1, 0.6, -1), direction2: new Vector3(1, 2.2, 1), minEmitBox: new Vector3(-0.15, 0, -0.15), maxEmitBox: new Vector3(0.15, 0, 0.15) } });
    this.dust = mk(160, { g: 0.4, c1: new Color4(0.78, 0.76, 0.72, 0.5), c2: new Color4(0.68, 0.66, 0.62, 0.35), cd: new Color4(0.6, 0.6, 0.58, 0),
      p: { minSize: 0.18, maxSize: 0.5, minLifeTime: 0.4, maxLifeTime: 0.9, minEmitPower: 0.6, maxEmitPower: 2.2, updateSpeed: 0.016,
        direction1: new Vector3(-1, 0.1, -1), direction2: new Vector3(1, 0.5, 1), minEmitBox: new Vector3(-0.35, 0, -0.35), maxEmitBox: new Vector3(0.35, 0.05, 0.35),
        minAngularSpeed: -1, maxAngularSpeed: 1 } });
    this.glow = mk(140, { add: true, g: 0.5, c1: new Color4(1, 0.9, 0.3, 1), c2: new Color4(0.3, 0.9, 1, 1), cd: new Color4(1, 0.3, 0.8, 0),
      p: { minSize: 0.03, maxSize: 0.09, minLifeTime: 0.3, maxLifeTime: 0.7, minEmitPower: 0.2, maxEmitPower: 0.8, updateSpeed: 0.016,
        direction1: new Vector3(-1, -0.5, -1), direction2: new Vector3(1, 1, 1), minEmitBox: new Vector3(-0.3, 0, -0.3), maxEmitBox: new Vector3(0.3, 1.6, 0.3) } });
  }
  // jedes Bild: Funken/Glitzern je nach Zustand des Skaters
  update(sk) {
    const p = sk.holder.position; this.emit.set(p.x, p.y + 0.05, p.z);
    const sp = sk.speed || 0;
    this.sparks.emitRate = sk.mode === 'grind' && sk.grind && !sk.grind.lip && sp > 1.5 ? 60 + sp * 14 : 0;
    this.glow.emitRate = sk.special >= 1 ? 26 : 0;
  }
  land(power) { this.dust.manualEmitCount = Math.round(10 + power * 40); }
  dispose() { this.sparks.dispose(); this.dust.dispose(); this.glow.dispose(); }
}
