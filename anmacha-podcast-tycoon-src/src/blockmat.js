/* Babylon-Materialerweiterung für die festen Stadt-Blöcke: Leuchtfarbe, Metall und Rauheit kommen je Ecke aus dem Mesh
   (Attribute blkE = Leuchten rgb, blkR = Metall/Rauheit). So teilen sich hunderte unterschiedlich lackierte Häuser, Laternen und Schilder
   EIN Material und einen Zeichenaufruf je Gegend – statt eines Materials je Teil. */
import { MaterialPluginBase } from './babylon.js';

export class BlockVertexPlugin extends MaterialPluginBase {
  constructor(material) {
    super(material, 'AmcBlock', 200, { AMCBLK: false });
    this._enable(true);
  }
  getClassName() { return 'AmcBlockPlugin'; }
  isCompatible(lang) { return lang === 0; }   // GLSL (WebGL 1 und 2)
  prepareDefines(defines, scene, mesh) { defines.AMCBLK = !!(mesh && mesh.isVerticesDataPresent && mesh.isVerticesDataPresent('blkE')); }
  getAttributes(attributes, scene, mesh) { if (mesh && mesh.isVerticesDataPresent && mesh.isVerticesDataPresent('blkE')) attributes.push('blkE', 'blkR'); }
  getCustomCode(shaderType) {
    if (shaderType === 'vertex') return {
      CUSTOM_VERTEX_DEFINITIONS: '#ifdef AMCBLK\nattribute vec3 blkE;\nattribute vec2 blkR;\nvarying vec3 vBlkE;\nvarying vec2 vBlkR;\n#endif',
      CUSTOM_VERTEX_MAIN_END: '#ifdef AMCBLK\nvBlkE = blkE; vBlkR = blkR;\n#endif'
    };
    if (shaderType === 'fragment') return {
      // Nach den Deklarationen: die beiden Material-Uniforms durch die Werte der Ecke ersetzen (z/w der Reflexion bleiben vom Material)
      CUSTOM_FRAGMENT_DEFINITIONS: '#ifdef AMCBLK\nvarying vec3 vBlkE;\nvarying vec2 vBlkR;\n#define vReflectivityColor vec4(vBlkR, vReflectivityColor.zw)\n#define vEmissiveColor vBlkE\n#endif'
    };
    return null;
  }
}
