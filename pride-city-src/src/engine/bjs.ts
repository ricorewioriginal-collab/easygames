/* Babylon.js an einer Stelle: nur die Teile, die Pride City braucht (hält das Paket klein), plus kleine Helfer.
   Koordinaten wie gehabt: rechtshändig, y oben, Figuren schauen nach +z. */
import '@babylonjs/core/Loading/loadingScreen';
import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent';
import '@babylonjs/core/Rendering/depthRendererSceneComponent';
import '@babylonjs/core/PostProcesses/RenderPipeline/postProcessRenderPipelineManagerSceneComponent';
import '@babylonjs/core/Animations/animatable';
import '@babylonjs/core/Meshes/thinInstanceMesh';
import '@babylonjs/core/Materials/Textures/Loaders/envTextureLoader';
import '@babylonjs/loaders/glTF/2.0';
import '@babylonjs/core/Particles/particleSystemComponent';
export { Engine } from '@babylonjs/core/Engines/engine';
export { Scene } from '@babylonjs/core/scene';
export { Vector3, Matrix, Quaternion, Vector2 } from '@babylonjs/core/Maths/math.vector';
export { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
export { Scalar } from '@babylonjs/core/Maths/math.scalar';
export { TransformNode } from '@babylonjs/core/Meshes/transformNode';
export { Mesh } from '@babylonjs/core/Meshes/mesh';
export { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
export { InstancedMesh } from '@babylonjs/core/Meshes/instancedMesh';
export { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
export { VertexBuffer } from '@babylonjs/core/Buffers/buffer';
export { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
export { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';
export { CreateGround } from '@babylonjs/core/Meshes/Builders/groundBuilder';
export { CreateCylinder } from '@babylonjs/core/Meshes/Builders/cylinderBuilder';
export { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
export { CreateTorus } from '@babylonjs/core/Meshes/Builders/torusBuilder';
export { CreateDisc } from '@babylonjs/core/Meshes/Builders/discBuilder';
export { CreateIcoSphere } from '@babylonjs/core/Meshes/Builders/icoSphereBuilder';
export { ExtrudePolygon } from '@babylonjs/core/Meshes/Builders/polygonBuilder';
export { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
export { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
export { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial';
export { Material } from '@babylonjs/core/Materials/material';
export { Effect } from '@babylonjs/core/Materials/effect';
export { Texture } from '@babylonjs/core/Materials/Textures/texture';
export { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
export { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture';
export { RenderTargetTexture } from '@babylonjs/core/Materials/Textures/renderTargetTexture';
export { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
export { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
export { PointLight } from '@babylonjs/core/Lights/pointLight';
export { SpotLight } from '@babylonjs/core/Lights/spotLight';
export { Light } from '@babylonjs/core/Lights/light';
export { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator';
export { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
export { DefaultRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline';
export { ImageProcessingConfiguration } from '@babylonjs/core/Materials/imageProcessingConfiguration';
export { ColorCurves } from '@babylonjs/core/Materials/colorCurves';
export { ReflectionProbe } from '@babylonjs/core/Probes/reflectionProbe';
export { HDRCubeTexture } from '@babylonjs/core/Materials/Textures/hdrCubeTexture';
export { LoadAssetContainerAsync } from '@babylonjs/core/Loading/sceneLoader';
export { AssetContainer } from '@babylonjs/core/assetContainer';
export { AnimationGroup } from '@babylonjs/core/Animations/animationGroup';
export { Node } from '@babylonjs/core/node';
export { Tools } from '@babylonjs/core/Misc/tools';
export { ParticleSystem } from '@babylonjs/core/Particles/particleSystem';

import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import type { Scene } from '@babylonjs/core/scene';

/** Knoten mit `visible` (wie früher), schaltet den ganzen Teilbaum an und aus */
export class Node3 extends TransformNode {
  constructor(name: string, scene: Scene) { super(name, scene); }
  get visible() { return this.isEnabled(false); }
  set visible(v: boolean) { if (this.isEnabled(false) !== v) this.setEnabled(v); }
}

/** Zahlenwert eines PBR-Materials ändern, ohne dass Babylon alle Meshes der Szene als „schmutzig“ markiert
    (der Setter läuft sonst bei jeder Änderung über sämtliche Meshes). Nur für Werte, die keinen Shader-Wechsel brauchen (Rauheit, Metall). */
export function setQuiet(m: object, key: 'roughness' | 'metallic', v: number) { (m as Record<string, number>)['_' + key] = v; }
export const v3 = (x = 0, y = 0, z = 0) => new Vector3(x, y, z);
/** Farbe aus Zahl (0xrrggbb) oder CSS-Hex-String, im linearen Farbraum (wie three mit sRGB-Ausgabe) */
export function col(c: number | string, k = 1) {
  const hex = typeof c === 'number' ? '#' + c.toString(16).padStart(6, '0') : c;
  return Color3.FromHexString(hex.length === 4 ? '#' + [...hex.slice(1)].map((x) => x + x).join('') : hex).toLinearSpace().scale(k);
}
export const dist = (a: { x: number; z: number }, b: { x: number; z: number }) => Math.hypot(a.x - b.x, a.z - b.z);
export const dist3 = (a: Vector3, b: Vector3) => Vector3.Distance(a, b);
export const smoothstep = (x: number, a: number, b: number) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
