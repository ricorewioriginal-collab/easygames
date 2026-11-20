/* AnMaCha – Der Podcast: Babylon.js zeichnet das ganze Spiel.
   Die Spielmodule beschreiben ihre Szenen weiter als Szenengraph (Gruppen, Meshes, Lichter, Kamera), gezeichnet wird ausschließlich mit Babylon:
   createRenderer() liefert ein Objekt mit derselben Schnittstelle wie bisher (render, setSize, shadowMap …). Pro Bild gleicht es den Szenengraph
   mit EINER Babylon-Szene ab: Geometrien und Materialien werden einmal hochgeladen und geteilt (Babylon-Instanzen), nur Geändertes wird nachgeführt.
   Babylon bringt dazu: Schatten mit weichen Kanten, Leuchten (GlowLayer), Bloom, Filmlook, MSAA – siehe look.js. */
import {
  Engine, Constants, Scene, Vector3, Matrix, Quaternion, Color3, Color4, Mesh, SubMesh, VertexBuffer, CreatePlane, PBRMaterial, ShaderMaterial,
  MultiMaterial, Material, Texture, DynamicTexture, RawTexture, FreeCamera, DirectionalLight, HemisphericLight, PointLight, SpotLight, Light,
  ShadowGenerator, Skeleton, Bone, ImageProcessingConfiguration
} from './babylon.js';
import { Look } from './look.js';

const tmpM = new Matrix(), tmpS = new Vector3(), tmpQ = new Quaternion(), tmpP = new Vector3();
const isCanvas = x => typeof HTMLCanvasElement !== 'undefined' && x instanceof HTMLCanvasElement;
const isImg = x => (typeof HTMLImageElement !== 'undefined' && x instanceof HTMLImageElement) || (typeof ImageBitmap !== 'undefined' && x instanceof ImageBitmap) || (typeof HTMLVideoElement !== 'undefined' && x instanceof HTMLVideoElement) || (typeof OffscreenCanvas !== 'undefined' && x instanceof OffscreenCanvas);

/** Babylon-Renderer mit der Schnittstelle des bisherigen Renderers. T = Szenengraph-Bibliothek (Klassen, Mathe). */
export function createRenderer(T, canvas, opts) {
  opts = opts || {};
  const engine = new Engine(canvas, opts.antialias !== false, { powerPreference: 'high-performance', stencil: true, preserveDrawingBuffer: false, premultipliedAlpha: false, audioEngine: false, doNotHandleContextLost: false }, false);
  engine.disableManifestCheck = true;
  engine.enableOfflineSupport = false;
  const scene = new Scene(engine);
  scene.useRightHandedSystem = true;
  scene.skipPointerMovePicking = true;
  scene.autoClear = true;
  scene.ambientColor = new Color3(0, 0, 0);
  scene.setRenderingAutoClearDepthStencil(1, false, false, false);   // Gruppe 0 = Himmel, 1 = Welt, 2 = immer oben (Symbole)
  scene.setRenderingAutoClearDepthStencil(2, false, false, false);
  const ip = scene.imageProcessingConfiguration;
  ip.toneMappingEnabled = true; ip.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES; ip.exposure = 1;
  const cam = new FreeCamera('cam', new Vector3(0, 2, 6), scene); cam.inputs.clear(); cam.rotationQuaternion = new Quaternion(); cam.updateUpVectorFromRotation = true;
  cam.fovMode = 0;   // vertikal fest, wie bisher
  scene.activeCamera = cam;

  const R = {
    isBabylon: true, engine, scene, camera: cam, domElement: canvas,
    shadowMap: { enabled: true, type: 1, autoUpdate: true, needsUpdate: false },
    outputEncoding: 3001, toneMapping: 4, toneMappingExposure: 1,
    capabilities: { getMaxAnisotropy: () => (engine.getCaps().maxAnisotropy || 4), isWebGL2: engine.webGLVersion > 1 },
    info: { render: { calls: 0, triangles: 0 }, memory: {} },
    stats: { objects: 0, meshes: 0, masters: 0, mats: 0, tex: 0 },
    _pr: 1, _target: null
  };
  let three = null;   // echter Renderer nur für Render-Targets (Porträts): klein, nur bei Bedarf
  const threeR = () => {
    if (!three) { const c = document.createElement('canvas'); c.width = c.height = 256; three = new T.WebGLRenderer({ canvas: c, antialias: true, alpha: true }); three.outputEncoding = T.sRGBEncoding; three.toneMapping = T.ACESFilmicToneMapping; three.toneMappingExposure = 1.08; }
    return three;
  };
  R.setPixelRatio = pr => { R._pr = pr || 1; engine.setHardwareScalingLevel(1 / R._pr); };
  R.getPixelRatio = () => R._pr;
  R.setSize = () => { engine.resize(); look.resize(); };
  R.getSize = v => { v = v || new T.Vector2(); v.set(canvas.clientWidth, canvas.clientHeight); return v; };
  R.setRenderTarget = rt => { R._target = rt; if (rt) threeR().setRenderTarget(rt); else if (three) three.setRenderTarget(null); };
  R.getRenderTarget = () => R._target;
  R.setClearColor = (c, a) => { if (R._target) threeR().setClearColor(c, a); };
  R.clear = () => { if (R._target) threeR().clear(); };
  R.readRenderTargetPixels = (...a) => threeR().readRenderTargetPixels(...a);
  R.compile = () => {};
  R.dispose = () => { engine.dispose(); if (three) three.dispose(); };
  R.forceContextLoss = () => {};

  // ------------------------------------------------------------------ Zustand
  let frame = 0;
  const ents = new Map();          // Szenengraph-Objekt → Eintrag
  const lastRender = new Map();    // Szene → Bildnummer
  const masters = new Map();       // Geometrie+Material → Babylon-Vorlage (Instanzen teilen sie)
  const geoCache = new Map();      // Geometrie → { ver, data } (Vertexdaten einmal umgerechnet)
  const mats = new Map();          // Material → Babylon-Material
  const texs = new Map();          // Textur → Babylon-Textur
  const shadowLights = new Set();
  let curScene = null;
  const look = new Look(R, scene, cam);
  R.look = look; R.bjsScene = scene;

  // ------------------------------------------------------------------ Texturen
  function texFor(t) {
    if (!t) return null;
    let e = texs.get(t);
    const img = t.image;
    if (!e) {
      if (!img || (isImg(img) && !(img.width || img.videoWidth))) return null;   // lädt noch
      e = { ver: -1, bt: null, refs: 0, canvas: null };
      texs.set(t, e);
    }
    if (e.ver !== t.version) {
      e.ver = t.version;
      try { uploadTex(t, e); } catch (err) { console.warn('Textur', err); }
    }
    if (e.bt) applySampler(t, e.bt);
    return e.bt;
  }
  function uploadTex(t, e) {
    const img = t.image, invertY = t.flipY !== false;
    if (img && img.data && img.width && !isCanvas(img)) {   // Datentextur
      const fmt = (img.data.length / (img.width * img.height)) >= 4 ? Constants.TEXTUREFORMAT_RGBA : Constants.TEXTUREFORMAT_RGB;
      if (e.bt) e.bt.dispose();
      e.bt = new RawTexture(img.data instanceof Uint8Array || img.data instanceof Uint8ClampedArray ? img.data : new Uint8Array(img.data), img.width, img.height, fmt, scene, false, invertY, Texture.BILINEAR_SAMPLINGMODE);
    } else {
      let src = img;
      if (!isCanvas(img)) {   // Bild/Bitmap → eigenes Canvas (einmal), Babylon lädt dann wie eine Leinwand hoch
        const w = img.width || img.videoWidth, h = img.height || img.videoHeight;
        if (!e.canvas) e.canvas = document.createElement('canvas');
        e.canvas.width = w; e.canvas.height = h;
        const g = e.canvas.getContext('2d'); g.clearRect(0, 0, w, h); g.drawImage(img, 0, 0);
        src = e.canvas;
      }
      if (!e.bt || e.src !== src || e.bt.getSize().width !== src.width || e.bt.getSize().height !== src.height) {
        if (e.bt) e.bt.dispose();
        e.bt = new DynamicTexture('t', src, scene, t.generateMipmaps !== false, Texture.TRILINEAR_SAMPLINGMODE);
        e.src = src;
      }
      e.bt.hasAlpha = true;
      e.bt.update(invertY, false, true);
    }
    e.bt.gammaSpace = t.encoding === 3001;   // sRGB-Bilder (Farbe) vs. lineare Daten
  }
  const WRAP = { 1000: Texture.WRAP_ADDRESSMODE, 1001: Texture.CLAMP_ADDRESSMODE, 1002: Texture.MIRROR_ADDRESSMODE };
  function applySampler(t, b) {
    const wu = WRAP[t.wrapS] ?? Texture.CLAMP_ADDRESSMODE, wv = WRAP[t.wrapT] ?? Texture.CLAMP_ADDRESSMODE;
    if (b.wrapU !== wu) b.wrapU = wu; if (b.wrapV !== wv) b.wrapV = wv;
    const r = t.repeat, o = t.offset;
    if (b.uScale !== r.x) b.uScale = r.x; if (b.vScale !== r.y) b.vScale = r.y;
    if (b.uOffset !== o.x) b.uOffset = o.x; if (b.vOffset !== o.y) b.vOffset = o.y;
    if (t.rotation && b.wAng !== -t.rotation) b.wAng = -t.rotation;
    const an = Math.max(1, t.anisotropy || 1); if (b.anisotropicFilteringLevel !== an) b.anisotropicFilteringLevel = an;
    if (t.magFilter === 1003 && b.samplingMode !== Texture.NEAREST_SAMPLINGMODE) b.updateSamplingMode(Texture.NEAREST_SAMPLINGMODE);
  }

  // ------------------------------------------------------------------ Materialien
  const PBR_OPAQUE = 0, PBR_TEST = 1, PBR_BLEND = 2;
  function matFor(m, kind) {
    let e = mats.get(m);
    if (!e || e.kind !== kind) {
      if (e) e.bm.dispose();
      e = { kind, bm: null, f: -1, sig: '' };
      if (kind === 'sky') e.bm = skyMat(m);
      else if (kind === 'points') e.bm = pointsMat(m);
      else { e.bm = new PBRMaterial('m', scene); e.bm.maxSimultaneousLights = 8; e.bm.usePhysicalLightFalloff = false; e.bm.environmentIntensity = 0; e.bm.forceIrradianceInFragment = true; }
      mats.set(m, e);
    }
    if (e.f !== frame) { e.f = frame; syncMat(m, e); }
    return e.bm;
  }
  const lin = c => c;   // Farben liegen im Szenengraph schon linear vor (wie bisher)
  function setColor(dst, c, k) { k = k == null ? 1 : k; const r = c.r * k, g = c.g * k, b = c.b * k; if (dst.r !== r || dst.g !== g || dst.b !== b) dst.copyFromFloats(r, g, b); }
  function syncMat(m, e) {
    const b = e.bm;
    if (e.kind === 'sky') { const u = m.uniforms; b.setColor3('top', c3(u.top.value)); b.setColor3('hor', c3(u.hor.value)); b.setColor3('bot', c3(u.bot.value)); b.setColor3('sunC', c3(u.sunC.value)); b.setVector3('sunDir', v3(u.sunDir.value)); b.setFloat('stars', u.stars.value); return; }
    if (e.kind === 'points') { syncPoints(m, b); return; }
    const t = m.type, basic = t === 'MeshBasicMaterial' || t === 'SpriteMaterial', lambert = t === 'MeshLambertMaterial', phong = t === 'MeshPhongMaterial' || t === 'MeshToonMaterial';
    if (b.unlit !== basic) b.unlit = basic;
    setColor(b.albedoColor, m.color || WHITE);
    const map = texFor(m.map);
    if (b.albedoTexture !== map) b.albedoTexture = map;
    if (!basic) {
      const met = m.metalness != null ? m.metalness : 0, rough = m.roughness != null ? m.roughness : phong ? Math.max(0.15, 1 - (m.shininess || 30) / 120) : lambert ? 0.95 : 1;
      if (b.metallic !== met) b.metallic = met; if (b.roughness !== rough) b.roughness = rough;
      const ei = m.emissiveIntensity != null ? m.emissiveIntensity : 1;
      if (m.emissive) setColor(b.emissiveColor, m.emissive, ei); else setColor(b.emissiveColor, BLACK);
      const em = texFor(m.emissiveMap); if (b.emissiveTexture !== em) b.emissiveTexture = em;
      const nm = texFor(m.normalMap); if (b.bumpTexture !== nm) { b.bumpTexture = nm; if (nm) { b.invertNormalMapY = true; } }
      if (m.userData && m.userData.selfLit != null) { /* Figuren: leichte Eigenhelligkeit */ }
    }
    const transp = !!m.transparent, aTest = m.alphaTest || 0;
    const mode = transp ? PBR_BLEND : aTest > 0 ? PBR_TEST : PBR_OPAQUE;
    if (b.transparencyMode !== mode) b.transparencyMode = mode;
    if (aTest > 0 && b.alphaCutOff !== aTest) b.alphaCutOff = aTest;
    const useA = !!map && (transp || aTest > 0);
    if (b.useAlphaFromAlbedoTexture !== useA) b.useAlphaFromAlbedoTexture = useA;
    if (map) map.hasAlpha = useA;
    const op = m.opacity != null ? m.opacity : 1; if (b.alpha !== op) b.alpha = transp ? op : 1;
    const add = m.blending === 2;
    const am = add ? Constants.ALPHA_ADD : Constants.ALPHA_COMBINE; if (b.alphaMode !== am) b.alphaMode = am;
    const side = m.side || 0;   // 0 vorne, 1 hinten, 2 beide
    if (b.sideOrientation !== Material.CounterClockWiseSideOrientation) b.sideOrientation = Material.CounterClockWiseSideOrientation;   // Szenengraph: Vorderseite gegen den Uhrzeigersinn
    const bfc = side !== 2; if (b.backFaceCulling !== bfc) b.backFaceCulling = bfc;
    const cbf = side !== 1; if (b.cullBackFaces !== cbf) b.cullBackFaces = cbf;
    const ndw = m.depthWrite === false; if (b.disableDepthWrite !== ndw) b.disableDepthWrite = ndw;
    const df = m.depthTest === false ? Constants.ALWAYS : 0; if (b.depthFunction !== df) b.depthFunction = df;
    const fog = m.fog !== false; if (b.fogEnabled !== fog) b.fogEnabled = fog;
    const zo = m.polygonOffset ? (m.polygonOffsetFactor || -1) : 0; if (b.zOffset !== zo) b.zOffset = zo;
    if (b.wireframe !== !!m.wireframe) b.wireframe = !!m.wireframe;
  }
  const WHITE = { r: 1, g: 1, b: 1 }, BLACK = { r: 0, g: 0, b: 0 };
  const c3 = c => new Color3(c.r, c.g, c.b), v3 = v => new Vector3(v.x, v.y, v.z);

  // Himmel (Farbverlauf, Sonne, Sterne) – derselbe Shader wie bisher
  function skyMat() {
    const sm = new ShaderMaterial('sky', scene, {
      vertexSource: 'precision highp float; attribute vec3 position; uniform mat4 worldViewProjection; varying vec3 vP; void main(){ vP = normalize(position); gl_Position = worldViewProjection * vec4(position,1.0); }',
      fragmentSource: 'precision highp float; uniform vec3 top,hor,bot,sunC,sunDir; uniform float stars; varying vec3 vP;' +
        'float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,45.164)))*43758.5453); }' +
        'void main(){ float y=vP.y; vec3 c = y>0.0 ? mix(hor, top, pow(clamp(y,0.0,1.0),0.55)) : mix(hor, bot, clamp(-y*4.0,0.0,1.0));' +
        ' float s = max(dot(vP, sunDir),0.0); c += sunC*pow(s,350.0)*1.4 + sunC*pow(s,8.0)*0.18;' +
        ' if(stars>0.0 && y>0.05){ vec3 q=floor(vP*320.0); float st=step(0.9975,h(q)); c += vec3(st)*stars*smoothstep(0.05,0.4,y); }' +
        ' gl_FragColor = vec4(c,1.0); }'
    }, { attributes: ['position'], uniforms: ['worldViewProjection', 'top', 'hor', 'bot', 'sunC', 'sunDir', 'stars'] });
    sm.backFaceCulling = false; sm.disableDepthWrite = true;
    return sm;
  }
  // Punkte (Funken, Regen, Schnee): Größe nach Entfernung, Farbe je Punkt, Leucht-Textur
  function pointsMat(m) {
    const sm = new ShaderMaterial('pts', scene, {
      vertexSource: 'precision highp float; attribute vec3 position; attribute vec4 pcol; attribute float psize; uniform mat4 worldView, projection; uniform float scale, size, useAttr; varying vec4 vC;' +
        'void main(){ vC = pcol; vec4 mv = worldView * vec4(position,1.0); float s = useAttr > 0.5 ? psize : size; gl_PointSize = max(1.0, s * scale / -mv.z); gl_Position = projection * mv; }',
      fragmentSource: 'precision highp float; uniform sampler2D map; uniform float useMap, glow, opacity; uniform vec3 color; varying vec4 vC;' +
        'void main(){ float a = useMap > 0.5 ? texture2D(map, vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y)).a : 1.0; vec3 c = vC.rgb * color;' +
        ' if (glow > 0.5) gl_FragColor = vec4(c * a * 1.6, a); else gl_FragColor = vec4(c, a * opacity); }'
    }, { attributes: ['position', 'pcol', 'psize'], uniforms: ['worldView', 'projection', 'scale', 'size', 'useAttr', 'useMap', 'glow', 'opacity', 'color'], samplers: ['map'], needAlphaBlending: true });
    sm.pointsCloud = true; sm.backFaceCulling = false; sm.disableDepthWrite = true;
    return sm;
  }
  function syncPoints(m, b) {
    const glow = m.type === 'ShaderMaterial';
    const map = glow ? texFor(m.uniforms.map && m.uniforms.map.value) : texFor(m.map);
    b.setFloat('glow', glow ? 1 : 0);
    b.setFloat('useMap', map ? 1 : 0); if (map) b.setTexture('map', map);
    b.setFloat('size', glow ? 1 : (m.size || 1));
    b.setFloat('scale', glow ? (m.uniforms.scale ? m.uniforms.scale.value : 420) : (m.sizeAttenuation === false ? 1 : engine.getRenderHeight() * 0.5));
    b.setFloat('opacity', m.opacity != null ? m.opacity : 1);
    b.setColor3('color', glow ? new Color3(1, 1, 1) : c3(m.color || WHITE));
    const am = glow || m.blending === 2 ? Constants.ALPHA_ADD : Constants.ALPHA_COMBINE; if (b.alphaMode !== am) b.alphaMode = am;
  }

  // ------------------------------------------------------------------ Geometrie
  function attrArray(a, comps) {
    if (!a) return null;
    const n = a.count, out = new Float32Array(n * comps), sz = a.itemSize;
    if (!a.isInterleavedBufferAttribute && !a.normalized && a.array instanceof Float32Array && sz === comps) return a.array;
    for (let i = 0; i < n; i++) {
      out[i * comps] = a.getX(i);
      if (comps > 1) out[i * comps + 1] = sz > 1 ? a.getY(i) : 0;
      if (comps > 2) out[i * comps + 2] = sz > 2 ? a.getZ(i) : 0;
      if (comps > 3) out[i * comps + 3] = sz > 3 ? a.getW(i) : 1;
    }
    return out;
  }
  function geoData(g) {
    let c = geoCache.get(g);
    const ver = verOf(g);
    if (c && c.ver === ver) return c;
    const p = g.attributes.position; if (!p) return null;
    const n = p.count;
    const d = { ver, n, pos: attrArray(p, 3), nor: attrArray(g.attributes.normal, 3), uv: attrArray(g.attributes.uv, 2), uv2: attrArray(g.attributes.uv2, 2), col: null, si: null, sw: null, idx: null, groups: g.groups, refs: c ? c.refs : 0 };
    if (g.attributes.color) d.col = attrArray(g.attributes.color, 4);
    if (g.attributes.skinIndex) d.si = attrArray(g.attributes.skinIndex, 4);
    if (g.attributes.skinWeight) d.sw = attrArray(g.attributes.skinWeight, 4);
    if (g.index) { const a = g.index.array; d.idx = a instanceof Uint16Array || a instanceof Uint32Array ? a : Uint32Array.from(a); }
    else { d.idx = n > 65535 ? new Uint32Array(n) : new Uint16Array(n); for (let i = 0; i < n; i++) d.idx[i] = i; }
    if (!d.nor) d.nor = computeNormals(d.pos, d.idx);
    geoCache.set(g, d);
    return d;
  }
  function verOf(g) { let v = g.index ? g.index.version : 0; for (const k in g.attributes) v += g.attributes[k].version * 7 + 1; return v; }
  function computeNormals(pos, idx) {
    const nor = new Float32Array(pos.length);
    for (let i = 0; i < idx.length; i += 3) {
      const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
      const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2], vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      for (const k of [a, b, c]) { nor[k] += nx; nor[k + 1] += ny; nor[k + 2] += nz; }
    }
    for (let i = 0; i < nor.length; i += 3) { const l = Math.hypot(nor[i], nor[i + 1], nor[i + 2]) || 1; nor[i] /= l; nor[i + 1] /= l; nor[i + 2] /= l; }
    return nor;
  }
  function applyGeo(mesh, d, skinned) {
    mesh.setVerticesData(VertexBuffer.PositionKind, d.pos, false, 3);
    mesh.setVerticesData(VertexBuffer.NormalKind, d.nor, false, 3);
    if (d.uv) mesh.setVerticesData(VertexBuffer.UVKind, d.uv, false, 2); else if (mesh.isVerticesDataPresent(VertexBuffer.UVKind)) mesh.removeVerticesData(VertexBuffer.UVKind);
    if (d.uv2) mesh.setVerticesData(VertexBuffer.UV2Kind, d.uv2, false, 2);
    if (d.col) mesh.setVerticesData(VertexBuffer.ColorKind, d.col, false, 4);
    if (skinned && d.si) { mesh.setVerticesData(VertexBuffer.MatricesIndicesKind, d.si, false, 4); mesh.setVerticesData(VertexBuffer.MatricesWeightsKind, d.sw, false, 4); }
    mesh.setIndices(d.idx, d.n);
  }

  // ------------------------------------------------------------------ Vorlagen (eine je Geometrie + Material), Instanzen je Objekt
  function matKey(o) { const m = o.material; return Array.isArray(m) ? m.map(x => x.uuid).join(',') : m ? m.uuid : 'none'; }
  function buildMaster(o, key, kind) {
    const g = o.geometry, d = geoData(g); if (!d) return null;
    const mesh = new Mesh('v', scene);
    applyGeo(mesh, d, false);
    mesh.isPickable = false; mesh.doNotSyncBoundingInfo = false;
    const ms = { key, mesh, refs: 0, geo: g, ver: d.ver, kind, mat: o.material, rs: !!o.receiveShadow, vc: !!d.col };
    setMeshMaterial(ms, o);
    mesh.isVisible = false;   // die Vorlage selbst zeichnet nichts, nur ihre Instanzen
    mesh.receiveShadows = ms.rs;
    masters.set(key, ms);
    return ms;
  }
  function setMeshMaterial(ms, o) {
    const m = o.material, mesh = ms.mesh;
    if (Array.isArray(m)) {
      const mm = new MultiMaterial('mm', scene);
      m.forEach(x => mm.subMaterials.push(matFor(x, 'std')));
      mesh.material = mm;
      const gs = o.geometry.groups;
      if (gs && gs.length) {
        mesh.subMeshes = [];
        const total = mesh.getTotalVertices();
        gs.forEach(gr => new SubMesh(gr.materialIndex || 0, 0, total, gr.start, Math.min(gr.count, (mesh.getTotalIndices() - gr.start)), mesh));
      }
    } else mesh.material = matFor(m, 'std');
    mesh.useVertexColors = !!(m && !Array.isArray(m) && m.vertexColors) && ms.vc;
    mesh.hasVertexAlpha = false;
  }
  function releaseMaster(ms) {
    if (--ms.refs > 0) return;
    ms.mesh.dispose(false, false);
    masters.delete(ms.key);
  }

  // ------------------------------------------------------------------ Einträge je Objekt
  function makeEnt(o) {
    let e = null;
    if (o.isSkinnedMesh) e = makeSkinned(o);
    else if (o.isInstancedMesh) e = makeThin(o);
    else if (o.isMesh) e = makeMesh(o);
    else if (o.isSprite) e = makeSprite(o);
    else if (o.isPoints) e = makePoints(o);
    else if (o.isLight) e = makeLight(o);
    if (!e) e = { type: 'none' };
    e.o = o; e.f = frame; e.on = null; e.scn = null; e.mw = new Float32Array(16); e.mw[0] = NaN;
    ents.set(o, e);
    return e;
  }
  function makeMesh(o) {
    if (!o.geometry || !o.geometry.attributes || !o.geometry.attributes.position) return null;
    const m = o.material;
    if (m && m.type === 'ShaderMaterial' && m.uniforms && m.uniforms.top && m.uniforms.sunDir) {   // Himmel
      const d = geoData(o.geometry), mesh = new Mesh('sky', scene); applyGeo(mesh, d, false); mesh.material = matFor(m, 'sky'); mesh.renderingGroupId = 0; mesh.alwaysSelectAsActiveMesh = true; mesh.infiniteDistance = false;
      return { type: 'own', mesh, sky: true, geo: o.geometry, ver: d.ver };
    }
    const key = o.geometry.uuid + '|' + matKey(o) + '|' + (o.receiveShadow ? 1 : 0);
    const ms = masters.get(key) || buildMaster(o, key, 'std'); if (!ms) return null;
    ms.refs++;
    const inst = ms.mesh.createInstance('i');
    inst.isPickable = false;
    return { type: 'inst', mesh: inst, ms, key };
  }
  function makeSkinned(o) {
    const d = geoData(o.geometry); if (!d || !d.si) return makeMesh(o);
    const mesh = new Mesh('skin', scene); applyGeo(mesh, d, true);
    const ms = { mesh, vc: !!d.col }; setMeshMaterial(ms, o);
    const bones = o.skeleton.bones, sk = new Skeleton('sk', 'sk' + o.id, scene);
    const list = bones.map((b, i) => new Bone('b' + i, sk, null, Matrix.Identity(), Matrix.Identity(), Matrix.Identity(), i));
    sk.useTextureToStoreBoneMatrices = true;
    mesh.skeleton = sk; mesh.numBoneInfluencers = 4; mesh.alwaysSelectAsActiveMesh = true; mesh.isPickable = false;
    return { type: 'own', mesh, skin: { sk, list, M: new T.Matrix4(), N: new T.Matrix4() }, geo: o.geometry, ver: d.ver, mkey: matKey(o) };
  }
  function makeThin(o) {
    const d = geoData(o.geometry); if (!d) return null;
    const mesh = new Mesh('thin', scene); applyGeo(mesh, d, false);
    const ms = { mesh, vc: !!d.col }; setMeshMaterial(ms, o);
    mesh.isPickable = false; mesh.alwaysSelectAsActiveMesh = true;
    return { type: 'own', mesh, thin: { ver: -1, cver: -1, count: -1 }, geo: o.geometry, ver: d.ver, mkey: matKey(o) };
  }
  let spriteQuad = null;
  function makeSprite(o) {
    if (!spriteQuad) { spriteQuad = CreatePlane('sq', { size: 1, sideOrientation: Mesh.DOUBLESIDE }, scene); spriteQuad.isVisible = false; spriteQuad.isPickable = false; }
    const mat = o.material;
    const key = 'sprite|' + (mat ? mat.uuid : '');
    let ms = masters.get(key);
    if (!ms) {
      const mesh = spriteQuad.clone('sp'); mesh.isVisible = false; mesh.material = matFor(mat, 'std'); mesh.billboardMode = Mesh.BILLBOARDMODE_ALL;
      ms = { key, mesh, refs: 0 }; masters.set(key, ms);
    }
    ms.refs++;
    const inst = ms.mesh.createInstance('s'); inst.billboardMode = Mesh.BILLBOARDMODE_ALL; inst.isPickable = false;
    return { type: 'inst', mesh: inst, ms, key, sprite: true };
  }
  function makePoints(o) {
    const g = o.geometry; if (!g || !g.attributes.position) return null;
    const mesh = new Mesh('pts', scene); mesh.isPickable = false; mesh.alwaysSelectAsActiveMesh = true;
    const e = { type: 'own', mesh, pts: true, geo: g, ver: -1 };
    uploadPoints(e);
    mesh.material = matFor(o.material, 'points');
    mesh.renderingGroupId = 1;
    return e;
  }
  function uploadPoints(e) {
    const g = e.geo, p = g.attributes.position, n = p.count;
    const pos = attrArray(p, 3), col = new Float32Array(n * 4), size = new Float32Array(n);
    const c = g.attributes.color, s = g.attributes.size;
    for (let i = 0; i < n; i++) { col[i * 4] = c ? c.getX(i) : 1; col[i * 4 + 1] = c ? c.getY(i) : 1; col[i * 4 + 2] = c ? c.getZ(i) : 1; col[i * 4 + 3] = 1; size[i] = s ? s.getX(i) : 1; }
    const m = e.mesh;
    if (m.isVerticesDataPresent(VertexBuffer.PositionKind) && m.getTotalVertices() === n) { m.updateVerticesData(VertexBuffer.PositionKind, pos); m.updateVerticesData('pcol', col); m.updateVerticesData('psize', size); }
    else { m.setVerticesData(VertexBuffer.PositionKind, pos, true, 3); m.setVerticesData('pcol', col, true, 4); m.setVerticesData('psize', size, true, 1); m.isUnIndexed = true; }
    e.ver = verOf(g);
    e.mesh.setBoundingInfo && e.mesh.refreshBoundingInfo();
  }
  function makeLight(o) {
    let l;
    if (o.isDirectionalLight) { l = new DirectionalLight('d', new Vector3(0, -1, 0), scene); l.autoUpdateExtends = false; l.shadowEnabled = true; }
    else if (o.isHemisphereLight) { l = new HemisphericLight('h', new Vector3(0, 1, 0), scene); l.specular = new Color3(0, 0, 0); }
    else if (o.isAmbientLight) { l = new HemisphericLight('a', new Vector3(0, 1, 0), scene); l.specular = new Color3(0, 0, 0); }
    else if (o.isSpotLight) { l = new SpotLight('s', new Vector3(), new Vector3(0, -1, 0), 1, 2, scene); }
    else if (o.isPointLight) { l = new PointLight('p', new Vector3(), scene); }
    else return null;
    l.falloffType = Light.FALLOFF_STANDARD;
    return { type: 'light', light: l, sg: null };
  }
  function disposeEnt(e) {
    if (e.cs && e.mesh) for (const l of shadowLights) l.sg.removeShadowCaster(e.mesh, false);
    if (e.type === 'inst') { e.mesh.dispose(); releaseMaster(e.ms); }
    else if (e.type === 'own') { if (e.skin) e.skin.sk.dispose(); e.mesh.dispose(false, false); }
    else if (e.type === 'light') { if (e.sg) { shadowLights.delete(e); look.sgs.delete(e.sg); e.sg.dispose(); } e.light.dispose(); }
    ents.delete(e.o);
  }
  function setOn(e, on) {
    if (e.on === on) return; e.on = on;
    if (e.type === 'light') e.light.setEnabled(on); else if (e.mesh) e.mesh.setEnabled(on);
  }

  // ------------------------------------------------------------------ Abgleich pro Bild
  function setTRS(mesh, mw) {
    Matrix.FromArrayToRef(mw, 0, tmpM);
    if (!mesh.rotationQuaternion) mesh.rotationQuaternion = new Quaternion();
    tmpM.decompose(mesh.scaling, mesh.rotationQuaternion, mesh.position);
  }
  function sameM(a, b) { for (let i = 0; i < 16; i++) if (a[i] !== b[i]) return false; return true; }
  function syncEnt(e, o) {
    if (e.type === 'none') return;
    if (e.type === 'light') return syncLight(e, o);
    // Material oder Geometrie getauscht → neu anlegen
    if (e.type === 'inst' && !e.sprite && (e.ms.geo !== o.geometry || e.ms.mat !== o.material || e.ms.rs !== !!o.receiveShadow)) { disposeEnt(e); e = makeEnt(o); e.scn = curScene; if (e.type === 'none') return; }
    if (e.type === 'inst' && e.sprite && e.ms.key !== 'sprite|' + (o.material ? o.material.uuid : '')) { disposeEnt(e); e = makeEnt(o); e.scn = curScene; }
    if (e.type === 'own' && !e.pts && !e.sky && (e.geo !== o.geometry || e.mkey !== matKey(o))) { disposeEnt(e); e = makeEnt(o); e.scn = curScene; if (e.type === 'none') return; }
    const mesh = e.mesh, mw = o.matrixWorld.elements;
    if (e.type === 'inst') {
      const ms = e.ms;
      if (!e.sprite) {
        // Geometrie verändert → Vorlage neu befüllen
        const v = verOf(o.geometry); if (v !== ms.ver) { const d = geoData(o.geometry); applyGeo(ms.mesh, d, false); ms.ver = v; }
        matFor(o.material, 'std');
        if (Array.isArray(o.material)) o.material.forEach(x => matFor(x, 'std'));
        if (ms.mesh.isVisible) ms.mesh.isVisible = false;
      } else matFor(o.material, 'std');
    } else if (e.pts) { if (verOf(e.geo) !== e.ver) uploadPoints(e); matFor(o.material, 'points'); }
    else if (e.sky) { matFor(o.material, 'sky'); }
    else {
      const v = verOf(o.geometry); if (v !== e.ver) { const d = geoData(o.geometry); applyGeo(mesh, d, !!e.skin); e.ver = v; }
      if (Array.isArray(o.material)) o.material.forEach(x => matFor(x, 'std')); else matFor(o.material, 'std');
    }
    // Lage
    if (e.sprite) {
      if (!sameM(mw, e.mw)) {
        e.mw.set(mw);
        tmpM.copyFrom(Matrix.FromArray(mw)); tmpM.decompose(tmpS, tmpQ, tmpP);
        mesh.position.copyFrom(tmpP); mesh.scaling.copyFromFloats(tmpS.x, tmpS.y, 1);
        const c = o.center; if (c && (c.x !== 0.5 || c.y !== 0.5)) { /* Mittelpunkt verschoben: grob über Position */ mesh.position.y += (0.5 - c.y) * tmpS.y; }
      }
      const rot = o.material && o.material.rotation || 0; if (mesh.rotation.z !== rot) mesh.rotation.z = rot;
    } else if (e.skin) {
      syncSkin(e, o);
    } else if (!sameM(mw, e.mw)) {
      e.mw.set(mw);
      setTRS(mesh, mw);
    }
    if (e.thin) syncThin(e, o);
    // Schatten, Reihenfolge
    const cs = !!o.castShadow;
    if (e.cs !== cs) { e.cs = cs; for (const l of shadowLights) { if (cs) l.sg.addShadowCaster(mesh, false); else l.sg.removeShadowCaster(mesh, false); } }
    if (e.type === 'own' && !e.pts && !e.sky) { const rs = !!o.receiveShadow; if (mesh.receiveShadows !== rs) mesh.receiveShadows = rs; }
    if (o.frustumCulled === false && !mesh.alwaysSelectAsActiveMesh) mesh.alwaysSelectAsActiveMesh = true;
    const mat = Array.isArray(o.material) ? o.material[0] : o.material;
    const grp = e.sky ? 0 : mat && mat.depthTest === false ? 2 : 1;
    if (e.type === 'inst') { if (e.ms.mesh.renderingGroupId !== grp) e.ms.mesh.renderingGroupId = grp; }
    else if (mesh.renderingGroupId !== grp) mesh.renderingGroupId = grp;
    const ai = o.renderOrder || 0; if (e.type !== 'inst' && mesh.alphaIndex !== ai && ai) mesh.alphaIndex = ai;
  }
  function syncSkin(e, o) {
    const sk = o.skeleton, s = e.skin;
    sk.update();
    const bm = sk.boneMatrices, bind = o.bindMatrix, bindInv = o.bindMatrixInverse, M = s.M, N = s.N;
    // Endmatrix je Knochen (Welt): Objekt · Bindungsinverse · Knochen · Bindung – Babylon-Mesh liegt im Ursprung
    N.multiplyMatrices(o.matrixWorld, bindInv);
    for (let i = 0; i < s.list.length; i++) {
      M.fromArray(bm, i * 16); M.premultiply(N); M.multiply(bind);
      const lm = s.list[i].getLocalMatrix(); Matrix.FromArrayToRef(M.elements, 0, lm); s.list[i]._markAsDirtyAndDecompose();
    }

  }
  function syncThin(e, o) {
    const t = e.thin, im = o.instanceMatrix, n = o.count;
    if (t.ver !== im.version || t.count !== n) {
      t.ver = im.version; t.count = n;
      const buf = im.array.slice(0, n * 16);
      e.mesh.thinInstanceSetBuffer('matrix', buf, 16, false);
      e.mesh.thinInstanceRefreshBoundingInfo && e.mesh.thinInstanceRefreshBoundingInfo(false);
    }
    const ic = o.instanceColor;
    if (ic && t.cver !== ic.version) {
      t.cver = ic.version; const c = new Float32Array(n * 4); for (let i = 0; i < n; i++) { c[i * 4] = ic.array[i * 3]; c[i * 4 + 1] = ic.array[i * 3 + 1]; c[i * 4 + 2] = ic.array[i * 3 + 2]; c[i * 4 + 3] = 1; }
      e.mesh.thinInstanceSetBuffer('color', c, 4, false);
    }
  }
  function syncLight(e, o) {
    const l = e.light, mw = o.matrixWorld.elements;
    const I = (o.intensity != null ? o.intensity : 1) * (o.isHemisphereLight || o.isAmbientLight ? look.hemiK : look.lightK);
    if (l.intensity !== I) l.intensity = I;
    setColor(l.diffuse, o.color);
    if (o.isHemisphereLight) { setColor(l.groundColor, o.groundColor); return; }
    if (o.isAmbientLight) { setColor(l.groundColor, o.color); return; }
    tmpP.copyFromFloats(mw[12], mw[13], mw[14]);
    if (o.isDirectionalLight || o.isSpotLight) {
      const t = o.target; t.updateMatrixWorld();
      const te = t.matrixWorld.elements, dx = te[12] - tmpP.x, dy = te[13] - tmpP.y, dz = te[14] - tmpP.z, dl = Math.hypot(dx, dy, dz) || 1;
      l.direction.copyFromFloats(dx / dl, dy / dl, dz / dl);
      l.position.copyFrom(tmpP);
    } else l.position.copyFrom(tmpP);
    if (o.isPointLight || o.isSpotLight) { const r = o.distance > 0 ? o.distance : 1e5; if (l.range !== r) l.range = r; }
    if (o.isSpotLight) { const a = o.angle * 2; if (l.angle !== a) l.angle = a; const ex = 1 + (o.penumbra || 0) * 6; if (l.exponent !== ex) l.exponent = ex; }
    // Schatten der Sonne
    if (o.isDirectionalLight) {
      const want = !!(o.castShadow && R.shadowMap.enabled);
      if (want && !e.sg) {
        const sz = (o.shadow && o.shadow.mapSize && o.shadow.mapSize.x) || 1024;
        e.sg = look.makeShadow(l, sz);
        shadowLights.add(e);
        for (const x of ents.values()) if (x.cs && x.mesh) e.sg.addShadowCaster(x.mesh, false);
      } else if (!want && e.sg) { shadowLights.delete(e); look.sgs.delete(e.sg); e.sg.dispose(); e.sg = null; }
      if (e.sg) {
        const c = o.shadow.camera;
        look.fitShadow(e.sg, l, c, o.shadow);
        if (!R.shadowMap.autoUpdate) { const rt = e.sg.getShadowMap(); if (rt) { rt.refreshRate = R.shadowMap.needsUpdate ? 1 : 0; if (R.shadowMap.needsUpdate) rt.resetRefreshCounter(); } }
        else { const rt = e.sg.getShadowMap(); if (rt && rt.refreshRate !== 1) rt.refreshRate = 1; }
      }
    }
  }

  // ------------------------------------------------------------------ Durchlauf
  function walk(o, vis) {
    let e = ents.get(o);
    const v = vis && o.visible !== false;
    if (!e) { if (!v) { for (let i = 0; i < o.children.length; i++) walk(o.children[i], false); return; } e = makeEnt(o); }
    e.f = frame; e.scn = curScene;
    if (v) syncEnt(ents.get(o) || e, o);
    const ee = ents.get(o); if (ee) setOn(ee, v && ee.type !== 'none');
    const ch = o.children;
    for (let i = 0; i < ch.length; i++) walk(ch[i], v);
  }
  function syncScene(sc, cam3) {
    // Nebel und Hintergrund
    const f = sc.fog;
    if (f && f.isFog) { scene.fogMode = Scene.FOGMODE_LINEAR; scene.fogStart = f.near; scene.fogEnd = f.far; setColor(scene.fogColor, f.color); }
    else if (f && f.isFogExp2) { scene.fogMode = Scene.FOGMODE_EXP2; scene.fogDensity = f.density; setColor(scene.fogColor, f.color); }
    else scene.fogMode = Scene.FOGMODE_NONE;
    const bg = sc.background;
    if (bg && bg.isColor) scene.clearColor.set(bg.r, bg.g, bg.b, 1); else scene.clearColor.set(0, 0, 0, 1);
    ip.exposure = (R.toneMappingExposure || 1) * look.exposureK;
    // Kamera
    const me = cam3.matrixWorld.elements;
    Matrix.FromArrayToRef(me, 0, tmpM); tmpM.decompose(tmpS, cam.rotationQuaternion, cam.position);
    if (cam3.isPerspectiveCamera) {
      const fov = cam3.fov * Math.PI / 180 / (cam3.zoom || 1);
      if (cam.fov !== fov) cam.fov = fov;
      cam.mode = 0;
    }
    if (cam.minZ !== cam3.near) cam.minZ = cam3.near;
    if (cam.maxZ !== cam3.far) cam.maxZ = cam3.far;
  }

  R.render = function (sc, cam3) {
    if (R._target) return threeR().render(sc, cam3);
    frame++;
    if (sc.autoUpdate !== false) sc.updateMatrixWorld();
    if (cam3.parent === null) cam3.updateMatrixWorld();
    curScene = sc; lastRender.set(sc, frame);
    walk(sc, true);
    // Aufräumen: aus der Szene entfernt → weg; gehört zu einer gerade nicht gezeigten Szene → aus
    for (const e of ents.values()) {
      if (e.f === frame) continue;
      if (e.scn === sc || !e.scn || (frame - (lastRender.get(e.scn) || 0)) > 1800) disposeEnt(e);
      else if (e.on) setOn(e, false);
    }
    for (const [s, f] of lastRender) if (frame - f > 1800) lastRender.delete(s);
    syncScene(sc, cam3);
    look.beforeRender(sc, frame);
    engine.beginFrame();
    scene.render();
    engine.endFrame();
    R.info.render.calls = engine._drawCalls ? engine._drawCalls.current : 0;
    R.stats.objects = ents.size; R.stats.masters = masters.size; R.stats.mats = mats.size; R.stats.tex = texs.size;
  };

  // Aufräumen, wenn der Szenengraph Geometrien/Materialien wegwirft
  R.prune = function () {
    const usedM = new Set(); for (const ms of masters.values()) usedM.add(ms.mesh.material); for (const e of ents.values()) if (e.mesh && e.type === 'own') usedM.add(e.mesh.material);
    for (const [m, e] of mats) if (frame - e.f > 600 && !usedM.has(e.bm) && ![...usedM].some(x => x && x.subMaterials && x.subMaterials.includes(e.bm))) { e.bm.dispose(); mats.delete(m); }
    for (const [t, e] of texs) { let used = false; for (const me of mats.values()) { const b = me.bm; if (b.albedoTexture === e.bt || b.emissiveTexture === e.bt || b.bumpTexture === e.bt) { used = true; break; } } if (!used && e.bt) { e.bt.dispose(); texs.delete(t); } }
    for (const [g, d] of geoCache) { let used = false; for (const ms of masters.values()) if (ms.geo === g) { used = true; break; } if (!used) for (const e of ents.values()) if (e.geo === g) { used = true; break; } if (!used) geoCache.delete(g); }
  };
  setInterval(() => { try { R.prune(); } catch (e) { /* weiter */ } }, 15000);
  return R;
}
