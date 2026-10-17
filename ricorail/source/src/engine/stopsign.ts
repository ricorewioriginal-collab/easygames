// Haltetafel „H“ am Bahnsteig: zeigt dem Spieler, wo die Zugspitze halten soll (ein einziges kleines Objekt).
import * as THREE from 'three';
import type { Network } from '../railway/network';

export interface StopTarget { t: string; s: number; d: 1 | -1; side: 'L' | 'R' | null }

export class StopSign {
  readonly group = new THREE.Group();
  private tex: THREE.CanvasTexture | null = null;
  private key = '';

  constructor(scene: THREE.Scene) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.4, 0.12), new THREE.MeshLambertMaterial({ color: 0x8a9096 }));
    post.position.y = 1.7;
    this.group.add(post);
    let mat: THREE.Material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    try {
      const c = document.createElement('canvas'); c.width = 64; c.height = 80;
      const g = c.getContext('2d')!;
      g.fillStyle = '#fff'; g.fillRect(0, 0, 64, 80);
      g.strokeStyle = '#111'; g.lineWidth = 6; g.strokeRect(3, 3, 58, 74);
      g.fillStyle = '#111'; g.font = 'bold 60px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('H', 32, 43);
      this.tex = new THREE.CanvasTexture(c); this.tex.colorSpace = THREE.SRGBColorSpace;
      mat = new THREE.MeshBasicMaterial({ map: this.tex, side: THREE.DoubleSide });
    } catch { /* ohne Canvas: weiße Tafel */ }
    const board = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.4), mat);
    board.position.y = 3.2;
    this.group.add(board);
    this.group.visible = false;
    scene.add(this.group);
  }

  /** Tafel an den Haltepunkt setzen (oder ausblenden) */
  update(net: Network, tg: StopTarget | null) {
    if (!tg || !tg.side) { this.group.visible = false; this.key = ''; return; }
    const key = `${tg.t}|${Math.round(tg.s)}|${tg.d}`;
    this.group.visible = true;
    if (key === this.key) return;
    this.key = key;
    const p = net.track(tg.t).point(tg.s), sg = tg.side === 'R' ? 1 : -1, l = 2.4;
    this.group.position.set(p.x - p.dz * sg * l, p.y + 0.76, p.z + p.dx * sg * l);
    // Tafel schaut dem ankommenden Zug entgegen
    this.group.rotation.set(0, Math.atan2(-p.dx * tg.d, -p.dz * tg.d), 0);
  }

  dispose() {
    this.group.removeFromParent();
    this.group.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.geometry.dispose(); (m.material as THREE.Material).dispose(); } });
    this.tex?.dispose();
  }
}
