/* Typdeklarationen für Three.js r128 (global als THREE, aus public/vendor/three.min.js).
   Enthält genau die Teile, die Bunte Insel 2 benutzt. Hintergrund: Die npm-Pakete three/@types/three waren in der
   Entwicklungsumgebung nicht erreichbar; EasyGames nutzt repo-weit dieselbe lokale r128-Kopie. */
/* eslint-disable */
declare namespace THREE {
  const REVISION: string;
  const DoubleSide: number, FrontSide: number, BackSide: number;
  const AdditiveBlending: number, NormalBlending: number, MultiplyBlending: number;
  const RepeatWrapping: number, ClampToEdgeWrapping: number, MirroredRepeatWrapping: number;
  const LinearFilter: number, NearestFilter: number, LinearMipmapLinearFilter: number;
  const sRGBEncoding: number, LinearEncoding: number;
  const ACESFilmicToneMapping: number, NoToneMapping: number, ReinhardToneMapping: number;
  const PCFSoftShadowMap: number, PCFShadowMap: number, BasicShadowMap: number;
  const DynamicDrawUsage: number, StaticDrawUsage: number;
  const RGBAFormat: number, UnsignedByteType: number, FloatType: number;

  namespace MathUtils {
    function clamp(v: number, a: number, b: number): number;
    function lerp(a: number, b: number, t: number): number;
    function degToRad(d: number): number;
    function radToDeg(r: number): number;
    function smoothstep(x: number, a: number, b: number): number;
    function generateUUID(): string;
  }

  class Vector2 {
    constructor(x?: number, y?: number);
    x: number; y: number;
    set(x: number, y: number): this;
    copy(v: Vector2): this;
    clone(): Vector2;
    length(): number;
  }
  class Vector3 {
    constructor(x?: number, y?: number, z?: number);
    x: number; y: number; z: number;
    set(x: number, y: number, z: number): this;
    setScalar(s: number): this;
    copy(v: Vector3): this;
    clone(): Vector3;
    add(v: Vector3): this;
    addVectors(a: Vector3, b: Vector3): this;
    addScaledVector(v: Vector3, s: number): this;
    sub(v: Vector3): this;
    subVectors(a: Vector3, b: Vector3): this;
    multiplyScalar(s: number): this;
    divideScalar(s: number): this;
    multiply(v: Vector3): this;
    length(): number;
    lengthSq(): number;
    normalize(): this;
    setLength(l: number): this;
    distanceTo(v: Vector3): number;
    distanceToSquared(v: Vector3): number;
    lerp(v: Vector3, t: number): this;
    lerpVectors(a: Vector3, b: Vector3, t: number): this;
    dot(v: Vector3): number;
    cross(v: Vector3): this;
    crossVectors(a: Vector3, b: Vector3): this;
    applyQuaternion(q: Quaternion): this;
    applyMatrix4(m: Matrix4): this;
    applyEuler(e: Euler): this;
    applyAxisAngle(axis: Vector3, angle: number): this;
    setFromMatrixPosition(m: Matrix4): this;
    project(camera: Camera): this;
    unproject(camera: Camera): this;
    equals(v: Vector3): boolean;
  }
  class Euler {
    constructor(x?: number, y?: number, z?: number, order?: string);
    x: number; y: number; z: number; order: string;
    set(x: number, y: number, z: number, order?: string): this;
    copy(e: Euler): this;
  }
  class Quaternion {
    constructor(x?: number, y?: number, z?: number, w?: number);
    x: number; y: number; z: number; w: number;
    set(x: number, y: number, z: number, w: number): this;
    setFromEuler(e: Euler): this;
    setFromAxisAngle(axis: Vector3, angle: number): this;
    setFromUnitVectors(a: Vector3, b: Vector3): this;
    slerp(q: Quaternion, t: number): this;
    multiply(q: Quaternion): this;
    premultiply(q: Quaternion): this;
    copy(q: Quaternion): this;
    clone(): Quaternion;
    identity(): this;
    invert(): this;
  }
  class Matrix4 {
    constructor();
    elements: number[];
    identity(): this;
    copy(m: Matrix4): this;
    clone(): Matrix4;
    compose(p: Vector3, q: Quaternion, s: Vector3): this;
    decompose(p: Vector3, q: Quaternion, s: Vector3): this;
    makeRotationX(t: number): this;
    makeRotationY(t: number): this;
    makeRotationZ(t: number): this;
    makeRotationFromEuler(e: Euler): this;
    makeTranslation(x: number, y: number, z: number): this;
    makeScale(x: number, y: number, z: number): this;
    multiply(m: Matrix4): this;
    premultiply(m: Matrix4): this;
    multiplyMatrices(a: Matrix4, b: Matrix4): this;
    setPosition(x: number, y: number, z: number): this;
    invert(): this;
  }
  class Matrix3 {
    constructor();
    elements: number[];
    getNormalMatrix(m: Matrix4): this;
  }
  class Color {
    constructor(r?: number | string | Color, g?: number, b?: number);
    r: number; g: number; b: number;
    set(c: number | string | Color): this;
    setHex(h: number): this;
    setScalar(s: number): this;
    setRGB(r: number, g: number, b: number): this;
    setHSL(h: number, s: number, l: number): this;
    getHSL(t: { h: number; s: number; l: number }): { h: number; s: number; l: number };
    getHex(): number;
    getHexString(): string;
    getStyle(): string;
    copy(c: Color): this;
    clone(): Color;
    lerp(c: Color, t: number): this;
    lerpColors(a: Color, b: Color, t: number): this;
    multiplyScalar(s: number): this;
    multiply(c: Color): this;
    offsetHSL(h: number, s: number, l: number): this;
    convertSRGBToLinear(): this;
  }
  class Layers { set(n: number): void; enable(n: number): void; disable(n: number): void; }
  class EventDispatcher {
    addEventListener(type: string, fn: (e: any) => void): void;
    removeEventListener(type: string, fn: (e: any) => void): void;
  }
  class Object3D extends EventDispatcher {
    constructor();
    id: number; uuid: string; name: string; type: string;
    parent: Object3D | null;
    children: Object3D[];
    position: Vector3; rotation: Euler; quaternion: Quaternion; scale: Vector3; up: Vector3;
    matrix: Matrix4; matrixWorld: Matrix4;
    matrixAutoUpdate: boolean; matrixWorldNeedsUpdate: boolean;
    visible: boolean; castShadow: boolean; receiveShadow: boolean; frustumCulled: boolean;
    renderOrder: number;
    layers: Layers;
    userData: Record<string, any>;
    onBeforeRender: (...a: any[]) => void;
    add(...o: Object3D[]): this;
    remove(...o: Object3D[]): this;
    clear(): this;
    traverse(fn: (o: Object3D) => void): void;
    traverseVisible(fn: (o: Object3D) => void): void;
    lookAt(x: number | Vector3, y?: number, z?: number): void;
    updateMatrix(): void;
    updateMatrixWorld(force?: boolean): void;
    getWorldPosition(t: Vector3): Vector3;
    getWorldQuaternion(t: Quaternion): Quaternion;
    rotateX(a: number): this; rotateY(a: number): this; rotateZ(a: number): this;
    translateX(d: number): this; translateY(d: number): this; translateZ(d: number): this;
    localToWorld(v: Vector3): Vector3;
    clone(recursive?: boolean): this;
    worldToLocal(v: Vector3): Vector3;
  }
  class Group extends Object3D { constructor(); }
  class Scene extends Object3D {
    constructor();
    background: Color | Texture | null;
    fog: Fog | FogExp2 | null;
    environment: Texture | null;
    overrideMaterial: Material | null;
  }
  class Fog { constructor(color: number | Color, near?: number, far?: number); color: Color; near: number; far: number; }
  class FogExp2 { constructor(color: number | Color, density?: number); color: Color; density: number; }

  class Camera extends Object3D { constructor(); projectionMatrix: Matrix4; matrixWorldInverse: Matrix4; }
  class PerspectiveCamera extends Camera {
    constructor(fov?: number, aspect?: number, near?: number, far?: number);
    fov: number; aspect: number; near: number; far: number; zoom: number;
    updateProjectionMatrix(): void;
  }
  class OrthographicCamera extends Camera {
    constructor(l: number, r: number, t: number, b: number, near?: number, far?: number);
    left: number; right: number; top: number; bottom: number; near: number; far: number;
    updateProjectionMatrix(): void;
  }

  class Light extends Object3D { constructor(color?: number | Color, intensity?: number); color: Color; intensity: number; }
  class AmbientLight extends Light { }
  class HemisphereLight extends Light { constructor(sky?: number | Color, ground?: number | Color, intensity?: number); groundColor: Color; }
  class LightShadow {
    camera: OrthographicCamera | PerspectiveCamera;
    mapSize: Vector2; bias: number; normalBias: number; radius: number;
    map: any; needsUpdate: boolean; autoUpdate: boolean;
  }
  class DirectionalLight extends Light { target: Object3D; shadow: LightShadow & { camera: OrthographicCamera }; }
  class PointLight extends Light { constructor(color?: number | Color, intensity?: number, distance?: number, decay?: number); distance: number; decay: number; }

  class BufferAttribute {
    constructor(array: ArrayLike<number>, itemSize: number, normalized?: boolean);
    array: Float32Array | Uint16Array | Uint32Array | any;
    itemSize: number; count: number; needsUpdate: boolean;
    setUsage(u: number): this;
    getX(i: number): number; getY(i: number): number; getZ(i: number): number;
    setX(i: number, v: number): this; setY(i: number, v: number): this; setZ(i: number, v: number): this;
    setXYZ(i: number, x: number, y: number, z: number): this;
    setXYZW(i: number, x: number, y: number, z: number, w: number): this;
  }
  class Float32BufferAttribute extends BufferAttribute { constructor(array: ArrayLike<number> | number, itemSize: number); }
  class Uint16BufferAttribute extends BufferAttribute { constructor(array: ArrayLike<number> | number, itemSize: number); }
  class Uint32BufferAttribute extends BufferAttribute { constructor(array: ArrayLike<number> | number, itemSize: number); }
  class InstancedBufferAttribute extends BufferAttribute { constructor(array: ArrayLike<number>, itemSize: number); }
  class Box3 { constructor(min?: Vector3, max?: Vector3); min: Vector3; max: Vector3; setFromObject(o: Object3D): this; getSize(t: Vector3): Vector3; getCenter(t: Vector3): Vector3; }
  class Sphere { constructor(c?: Vector3, r?: number); center: Vector3; radius: number; }
  class BufferGeometry extends EventDispatcher {
    constructor();
    attributes: Record<string, BufferAttribute>;
    index: BufferAttribute | null;
    boundingSphere: Sphere | null;
    boundingBox: Box3 | null;
    groups: { start: number; count: number; materialIndex?: number }[];
    drawRange: { start: number; count: number };
    userData: Record<string, any>;
    setAttribute(name: string, a: BufferAttribute): this;
    getAttribute(name: string): BufferAttribute;
    deleteAttribute(name: string): this;
    setIndex(i: BufferAttribute | number[] | null): this;
    setDrawRange(start: number, count: number): void;
    computeVertexNormals(): void;
    computeBoundingSphere(): void;
    computeBoundingBox(): void;
    translate(x: number, y: number, z: number): this;
    rotateX(a: number): this; rotateY(a: number): this; rotateZ(a: number): this;
    scale(x: number, y: number, z: number): this;
    applyMatrix4(m: Matrix4): this;
    toNonIndexed(): BufferGeometry;
    clone(): BufferGeometry;
    dispose(): void;
  }
  class InstancedBufferGeometry extends BufferGeometry { instanceCount: number; }
  class BoxGeometry extends BufferGeometry { constructor(w?: number, h?: number, d?: number, ws?: number, hs?: number, ds?: number); }
  class SphereGeometry extends BufferGeometry { constructor(r?: number, ws?: number, hs?: number, phiStart?: number, phiLen?: number, thetaStart?: number, thetaLen?: number); }
  class CylinderGeometry extends BufferGeometry { constructor(rt?: number, rb?: number, h?: number, rs?: number, hs?: number, open?: boolean, thetaStart?: number, thetaLen?: number); }
  class ConeGeometry extends BufferGeometry { constructor(r?: number, h?: number, rs?: number, hs?: number, open?: boolean); }
  class PlaneGeometry extends BufferGeometry { constructor(w?: number, h?: number, ws?: number, hs?: number); }
  class CircleGeometry extends BufferGeometry { constructor(r?: number, segs?: number, thetaStart?: number, thetaLen?: number); }
  class RingGeometry extends BufferGeometry { constructor(inner?: number, outer?: number, ts?: number, ps?: number, thetaStart?: number, thetaLen?: number); }
  class TorusGeometry extends BufferGeometry { constructor(r?: number, tube?: number, rs?: number, ts?: number, arc?: number); }
  class LatheGeometry extends BufferGeometry { constructor(points: Vector2[], segs?: number, phiStart?: number, phiLen?: number); }
  class IcosahedronGeometry extends BufferGeometry { constructor(r?: number, detail?: number); }
  class OctahedronGeometry extends BufferGeometry { constructor(r?: number, detail?: number); }
  class DodecahedronGeometry extends BufferGeometry { constructor(r?: number, detail?: number); }
  class TetrahedronGeometry extends BufferGeometry { constructor(r?: number, detail?: number); }

  class Texture extends EventDispatcher {
    constructor(image?: any);
    image: any;
    wrapS: number; wrapT: number; magFilter: number; minFilter: number;
    anisotropy: number; encoding: number; flipY: boolean; generateMipmaps: boolean;
    repeat: Vector2; offset: Vector2; center: Vector2; rotation: number;
    needsUpdate: boolean;
    dispose(): void;
  }
  class CanvasTexture extends Texture { constructor(canvas: HTMLCanvasElement | OffscreenCanvas); }
  class DataTexture extends Texture { constructor(data: ArrayBufferView, w: number, h: number, format?: number, type?: number); }

  interface IUniform<T = any> { value: T; }
  interface Shader { uniforms: Record<string, IUniform>; vertexShader: string; fragmentShader: string; }
  class Material extends EventDispatcher {
    constructor();
    name: string;
    transparent: boolean; opacity: number;
    depthWrite: boolean; depthTest: boolean;
    side: number; blending: number;
    vertexColors: boolean; fog: boolean; toneMapped: boolean;
    alphaTest: number;
    polygonOffset: boolean; polygonOffsetFactor: number; polygonOffsetUnits: number;
    needsUpdate: boolean;
    visible: boolean;
    userData: Record<string, any>;
    onBeforeCompile: (shader: Shader, renderer: WebGLRenderer) => void;
    customProgramCacheKey: () => string;
    clone(): this;
    dispose(): void;
  }
  interface MaterialParams {
    color?: number | string | Color; emissive?: number | Color; emissiveIntensity?: number;
    map?: Texture | null; alphaMap?: Texture | null; emissiveMap?: Texture | null;
    transparent?: boolean; opacity?: number; side?: number; vertexColors?: boolean; fog?: boolean;
    depthWrite?: boolean; depthTest?: boolean; blending?: number; flatShading?: boolean;
    roughness?: number; metalness?: number; wireframe?: boolean; toneMapped?: boolean;
    size?: number; sizeAttenuation?: boolean; alphaTest?: number; linewidth?: number;
    polygonOffset?: boolean; polygonOffsetFactor?: number; polygonOffsetUnits?: number;
    shininess?: number; specular?: number | Color; rotation?: number;
  }
  class MeshBasicMaterial extends Material { constructor(p?: MaterialParams); color: Color; map: Texture | null; wireframe: boolean; }
  class MeshLambertMaterial extends Material { constructor(p?: MaterialParams); color: Color; emissive: Color; emissiveIntensity: number; map: Texture | null; }
  class MeshPhongMaterial extends Material { constructor(p?: MaterialParams); color: Color; emissive: Color; shininess: number; }
  class MeshStandardMaterial extends Material {
    constructor(p?: MaterialParams);
    color: Color; emissive: Color; emissiveIntensity: number;
    roughness: number; metalness: number; flatShading: boolean;
    map: Texture | null; emissiveMap: Texture | null;
  }
  class MeshToonMaterial extends Material { constructor(p?: MaterialParams); color: Color; }
  class PointsMaterial extends Material { constructor(p?: MaterialParams); color: Color; size: number; sizeAttenuation: boolean; map: Texture | null; }
  class SpriteMaterial extends Material { constructor(p?: MaterialParams); color: Color; map: Texture | null; rotation: number; }
  class LineBasicMaterial extends Material { constructor(p?: MaterialParams); color: Color; }
  class ShaderMaterial extends Material {
    constructor(p?: { uniforms?: Record<string, IUniform>; vertexShader?: string; fragmentShader?: string; transparent?: boolean; depthWrite?: boolean; side?: number; fog?: boolean; lights?: boolean; blending?: number; vertexColors?: boolean; extensions?: any });
    uniforms: Record<string, IUniform>;
    vertexShader: string; fragmentShader: string;
  }

  class Mesh<G extends BufferGeometry = BufferGeometry, M extends Material | Material[] = Material> extends Object3D {
    constructor(g?: G, m?: M);
    geometry: G; material: M;
  }
  class InstancedMesh<G extends BufferGeometry = BufferGeometry, M extends Material = Material> extends Mesh<G, M> {
    constructor(g: G, m: M, count: number);
    count: number;
    instanceMatrix: BufferAttribute;
    instanceColor: BufferAttribute | null;
    setMatrixAt(i: number, m: Matrix4): void;
    getMatrixAt(i: number, m: Matrix4): void;
    setColorAt(i: number, c: Color): void;
    dispose(): void;
  }
  class Points<G extends BufferGeometry = BufferGeometry, M extends Material = Material> extends Object3D { constructor(g?: G, m?: M); geometry: G; material: M; }
  class Line extends Object3D { constructor(g?: BufferGeometry, m?: Material); geometry: BufferGeometry; material: Material; }
  class LineSegments extends Line { }
  class Sprite extends Object3D { constructor(m?: SpriteMaterial); material: SpriteMaterial; center: Vector2; }

  class Ray { origin: Vector3; direction: Vector3; }
  interface Intersection { distance: number; point: Vector3; object: Object3D; instanceId?: number; face?: any; }
  class Raycaster {
    constructor(origin?: Vector3, dir?: Vector3, near?: number, far?: number);
    ray: Ray; near: number; far: number;
    set(origin: Vector3, dir: Vector3): void;
    setFromCamera(coords: Vector2, cam: Camera): void;
    intersectObject(o: Object3D, recursive?: boolean): Intersection[];
    intersectObjects(o: Object3D[], recursive?: boolean): Intersection[];
  }
  class Clock { constructor(autoStart?: boolean); getDelta(): number; getElapsedTime(): number; elapsedTime: number; }

  interface WebGLRendererParameters {
    canvas?: HTMLCanvasElement; antialias?: boolean; alpha?: boolean; powerPreference?: string;
    preserveDrawingBuffer?: boolean; stencil?: boolean; depth?: boolean; logarithmicDepthBuffer?: boolean;
    failIfMajorPerformanceCaveat?: boolean;
  }
  class WebGLRenderer {
    constructor(p?: WebGLRendererParameters);
    domElement: HTMLCanvasElement;
    shadowMap: { enabled: boolean; type: number; autoUpdate: boolean; needsUpdate: boolean };
    outputEncoding: number;
    toneMapping: number; toneMappingExposure: number;
    physicallyCorrectLights: boolean;
    info: { render: { calls: number; triangles: number; points: number }; memory: { geometries: number; textures: number }; programs: any[] | null };
    capabilities: { isWebGL2: boolean; maxTextureSize: number; precision: string; maxAnisotropy?: number; getMaxAnisotropy(): number };
    autoClear: boolean;
    setSize(w: number, h: number, updateStyle?: boolean): void;
    setPixelRatio(r: number): void;
    getPixelRatio(): number;
    setClearColor(c: number | Color, a?: number): void;
    setViewport(x: number, y: number, w: number, h: number): void;
    setScissor(x: number, y: number, w: number, h: number): void;
    setScissorTest(b: boolean): void;
    render(scene: Object3D, camera: Camera): void;
    clear(c?: boolean, d?: boolean, s?: boolean): void;
    compile(scene: Object3D, camera: Camera): void;
    getContext(): WebGLRenderingContext;
    dispose(): void;
    forceContextLoss(): void;
  }
}
