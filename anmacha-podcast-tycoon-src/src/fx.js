/* Babylon-Partikel für Höhepunkte (Konfetti nach Medien-Aufträgen). Eine Textur, Systeme werden nach dem Abbrennen freigegeben. */
import { ParticleSystem, DynamicTexture, Vector3, Color4 } from './babylon.js';

const cache = new WeakMap();
export function fx(R) {
  const scene = R && R.bjsScene; if (!scene) return null;
  let f = cache.get(R); if (f) return f;
  let tex = null;
  const flake = () => {
    if (tex) return tex;
    tex = new DynamicTexture('amc-flake', { width: 32, height: 32 }, scene, false);
    const g = tex.getContext(); g.fillStyle = '#fff'; g.fillRect(6, 10, 20, 12); tex.hasAlpha = true; tex.update();
    return tex;
  };
  const col = (hex, k = 1) => new Color4(((hex >> 16) & 255) / 255 * k, ((hex >> 8) & 255) / 255 * k, (hex & 255) / 255 * k, 1);
  f = {
    confetti(x, y, z, color = 0xff8a1e) {
      const q = window.AMC && AMC.World ? AMC.World.quality : 2; if (q < 1) return null;
      const ps = new ParticleSystem('confetti', q > 1 ? 420 : 220, scene);
      ps.particleTexture = flake();
      ps.emitter = new Vector3(x, y, z);
      ps.createSphereEmitter(0.6, 1);
      ps.color1 = col(color); ps.color2 = col(0xffd23f); ps.colorDead = new Color4(1, 1, 1, 0);
      ps.minSize = 0.12; ps.maxSize = 0.26; ps.minLifeTime = 1.2; ps.maxLifeTime = 2.4;
      ps.minEmitPower = 5; ps.maxEmitPower = 10; ps.gravity = new Vector3(0, -9, 0);
      ps.minAngularSpeed = -6; ps.maxAngularSpeed = 6; ps.emitRate = 0; ps.manualEmitCount = ps.getCapacity();
      ps.blendMode = ParticleSystem.BLENDMODE_STANDARD; ps.targetStopDuration = 0.2; ps.disposeOnStop = true;
      ps.start();
      return ps;
    },
  };
  cache.set(R, f);
  return f;
}
