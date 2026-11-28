/* Sonnen-Linsenreflexe wie bei einer echten Kamera: Hof um die Sonne und farbige Reflexe quer durchs Bild, wenn man
   in die Sonne schaut. Verdeckung: ein Strahl-Test gegen die Szene nur alle 0,15 s und nur, wenn die Sonne im Bild ist. */
import { LensFlareSystem, LensFlare, Color3, Ray, Vector3, type Scene, type DirectionalLight, type FreeCamera } from '../engine/bjs';

function sprite(soft: number, ring = false) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d')!, r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  if (ring) { r.addColorStop(0, 'rgba(255,255,255,0)'); r.addColorStop(.78, 'rgba(255,255,255,0)'); r.addColorStop(.88, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); }
  else { r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(soft, 'rgba(255,255,255,.22)'); r.addColorStop(.7, 'rgba(255,255,255,.05)'); r.addColorStop(1, 'rgba(255,255,255,0)'); }
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  return c.toDataURL('image/png');
}

export class SunFlare {
  private sys: LensFlareSystem;
  private flares: Array<{ f: LensFlare; base: Color3 }> = [];
  private t = 0;
  private seen = 0;
  on = true;
  private ray = new Ray(Vector3.Zero(), Vector3.Up(), 400);
  constructor(private sc: Scene, private sun: DirectionalLight) {
    this.sys = new LensFlareSystem('sunflare', sun, sc);
    this.sys._isVisible = () => true;   // kein Strahl-Picking pro Bild (bräuchte Ray), die Verdeckung prüft update()
    const glow = sprite(.12), dot = sprite(.6), ring = sprite(0, true);
    const add = (size: number, pos: number, hex: number, url: string) => { const base = Color3.FromHexString('#' + hex.toString(16).padStart(6, '0')); this.flares.push({ f: new LensFlare(size, pos, base.clone(), url, this.sys), base }); };
    add(.2, 0, 0xffe6b8, glow);
    add(.1, .25, 0xff8ad1, dot);
    add(.18, .45, 0x7ad7ff, ring);
    add(.08, .62, 0xffd23b, dot);
    add(.26, .9, 0xb06bff, ring);
  }
  /** strength: 0–1 (Tageslicht ohne Wolken) */
  update(dt: number, cam: FreeCamera, strength: number) {
    if ((this.t -= dt) <= 0) {
      this.t = .15;
      const p = cam.position, d = this.sun.direction;
      let free = strength > .05 && this.on;
      if (free) {
        // Sonne überhaupt im Bild? Sonst kein Strahl-Test
        const fwd = cam.getTarget().subtract(cam.position).normalize(), sx = -d.x, sy = -d.y, sz = -d.z;
        free = fwd.x * sx + fwd.y * sy + fwd.z * sz > .55;
        if (free) {
          this.ray.origin.copyFrom(p); this.ray.direction.set(sx, sy, sz); this.ray.length = 400;
          const hit = this.sc.pickWithRay(this.ray, (m) => m.isPickable && m.isVisible && m.isEnabled(), true);
          free = !hit?.hit;
        }
      }
      this.seen = free ? strength : 0;
    }
    const want = this.seen; let cur = this.flares[0].f.color.r / Math.max(.001, this.flares[0].base.r);
    cur += (want - cur) * Math.min(1, dt * 6);
    for (const { f, base } of this.flares) base.scaleToRef(cur, f.color);
    this.sys.isEnabled = cur > .02;
  }
}
