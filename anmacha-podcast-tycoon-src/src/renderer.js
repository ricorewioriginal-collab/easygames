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
import { BlockVertexPlugin } from './blockmat.js';

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
    tm: { mw: 0, walk: 0, clean: 0, batch: 0, draw: 0 },   // Zeiten je Bild (gleitender Mittelwert, ms): Matrizen, Abgleich, Aufräumen, Blöcke, Babylon zeichnet
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
  let frame = 0, now = 0;
  const ents = new Map();          // Szenengraph-Objekt → Eintrag
  const lastRender = new Map();    // Szene → Zeitpunkt (ms) des letzten Bildes
  const KEEP_MS = 20000;           // nicht gezeigte Szenen so lange behalten (schnelles Zurückwechseln), danach freigeben
  const masters = new Map();       // Geometrie+Material → Babylon-Vorlage (Instanzen teilen sie)
  const geoCache = new Map();      // Geometrie → { ver, data } (Vertexdaten einmal umgerechnet)
  const mats = new Map();          // Material → Babylon-Material
  const texs = new Map();          // Textur → Babylon-Textur
  const shadowLights = new Set();
  let curScene = null;
  const look = new Look(R, scene, cam);
  // Babylon prüft sonst jedes Bild ALLE Meshes (auch ausgeschaltete und die unsichtbaren Vorlagen der Instanzen): eigene, kurze Liste
  const cand = { data: [], length: 0 }; let candDirty = true;
  scene.getActiveMeshCandidates = () => {
    if (candDirty) { candDirty = false; const d = cand.data; d.length = 0; for (const m of scene.meshes) if (m.isVisible && m.isEnabled(false)) d.push(m); cand.length = d.length; }
    return cand;
  };
  scene.onNewMeshAddedObservable.add(() => { candDirty = true; });
  scene.onMeshRemovedObservable.add(() => { candDirty = true; });
  R.candidates = () => cand.length;
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
      if (!e.bt || e.src !== src || e.w !== src.width || e.h !== src.height) {   // nur bei neuer Leinwand/Größe neu anlegen (Babylon rundet intern auf Zweierpotenzen)
        if (e.bt) e.bt.dispose();
        e.bt = new DynamicTexture('t', src, scene, t.generateMipmaps !== false, Texture.TRILINEAR_SAMPLINGMODE);
        e.src = src; e.w = src.width; e.h = src.height;
        if (!e.bt.hasAlpha) e.bt.hasAlpha = true;
        e.bt.update(invertY, false, true);
      } else { e.bt.__pend = invertY; pendTex.add(e.bt); }   // neuer Inhalt: erst hochladen, wenn etwas mit dieser Textur wirklich im Bild ist
      if (!e.bt.hasAlpha) e.bt.hasAlpha = true;
    }
    const gs = t.encoding === 3001;   // sRGB-Bilder (Farbe) vs. lineare Daten – nur bei Änderung setzen (der Setter markiert sonst alle Materialien neu)
    if (e.bt.gammaSpace !== gs) e.bt.gammaSpace = gs;
  }
  // Leinwände/Video-Wände nur hochladen, wenn ein sichtbares Mesh sie nutzt (wie der frühere Renderer)
  const pendTex = new Set();
  const flushTex = bt => { if (bt && bt.__pend != null && !bt.isDisposed?.()) { const inv = bt.__pend; bt.__pend = null; pendTex.delete(bt); try { bt.update(inv, false, true); } catch (err) { /* weiter */ } } };
  scene.onAfterActiveMeshesEvaluationObservable.add(() => {
    if (!pendTex.size) return;
    const am = scene.getActiveMeshes();
    for (let i = 0; i < am.length; i++) { const m = am.data[i].material; if (!m) continue; if (m.subMaterials) { for (const x of m.subMaterials) if (x) { flushTex(x.albedoTexture); flushTex(x.emissiveTexture); } } else { flushTex(m.albedoTexture); flushTex(m.emissiveTexture); } }
    for (const bt of pendTex) if (bt.isDisposed && bt.isDisposed()) pendTex.delete(bt);
  });
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
  // Nebelart wechseln (Szenenwechsel): Babylon würde jedes Material einzeln durch alle Meshes markieren – hier ein Durchgang über die Meshes
  function setFogMode(fm) {
    scene._blockMaterialDirtyMechanism = true; scene.fogMode = fm; scene._blockMaterialDirtyMechanism = false;
    for (const ms of scene.meshes) if (ms.subMeshes) for (const sm of ms.subMeshes) { const d = sm.materialDefines; if (d && d.markAsMiscDirty) d.markAsMiscDirty(); }
  }
  function matFor(m, kind) {
    let e = mats.get(m);
    if (!e || e.kind !== kind) {
      if (e) e.bm.dispose();
      e = { kind, bm: null, f: -1, sig: '' };
      if (kind === 'sky') e.bm = skyMat(m);
      else if (kind === 'points') e.bm = pointsMat(m);
      mats.set(m, e);
      if (kind !== 'sky' && kind !== 'points') {
        // Neues Material hängt noch an keinem Mesh: Babylon würde bei jedem Setter alle Szenen-Meshes durchsuchen (beim Stadtwechsel tausende × tausende).
        // Daher die Erstbelegung ohne Dirty-Markierung; Meshes, die es danach bekommen, bauen ihre Shader-Defines ohnehin neu auf.
        scene._blockMaterialDirtyMechanism = true;
        try { e.bm = new PBRMaterial('m', scene); e.bm.maxSimultaneousLights = 8; e.bm.usePhysicalLightFalloff = false; e.bm.environmentIntensity = 0; e.bm.forceIrradianceInFragment = true; e.f = frame; syncMat(m, e); }
        finally { scene._blockMaterialDirtyMechanism = false; }
      }
    }
    if (e.f !== frame) {
      e.f = frame;
      if (kind !== 'std') syncMat(m, e);
      else if (mstate(m, e)) { if (e.bm.isFrozen) e.bm.unfreeze(); syncMat(m, e); e.chg = frame; e.chgT = now; }   // nur bei Änderung abgleichen
      else {
        if (m.map) texFor(m.map); if (m.emissiveMap) texFor(m.emissiveMap);   // Leinwände/Videos: neuer Inhalt
        if (!e.bm.isFrozen && frame - e.chg > 30 && now - e.chgT > 1000) e.bm.freeze();   // unverändert: Babylon prüft das Material nicht mehr jedes Bild
      }
    }
    return e.bm;
  }
  // Zustand eines Materials als Zahlen (Farbe, Leuchten, Deckkraft, Texturen …): ändert er sich, darf nichts damit in einem festen Block liegen
  const ST_N = 24;
  let stA = null, stI = 0, stC = false;
  const sv = x => { if (stA[stI] !== x) { stA[stI] = x; stC = true; } stI++; };
  function mstate(m, e) {
    if (!e.st) { e.st = new Float64Array(ST_N).fill(NaN); e.refs = [null, null, null]; e.chg = frame; e.chgT = now; }
    stA = e.st; stI = 0; stC = false;
    const c = m.color || WHITE, em = m.emissive || BLACK, t = m.map;
    sv(c.r); sv(c.g); sv(c.b); sv(em.r); sv(em.g); sv(em.b); sv(m.emissiveIntensity != null ? m.emissiveIntensity : 1); sv(m.opacity != null ? m.opacity : 1);
    sv(m.transparent ? 1 : 0); sv(m.visible === false ? 0 : 1); sv(m.metalness || 0); sv(m.roughness != null ? m.roughness : -1); sv(m.shininess || 0); sv(m.alphaTest || 0); sv(m.side || 0);
    sv(m.depthWrite === false ? 0 : 1); sv(m.depthTest === false ? 0 : 1); sv(m.fog === false ? 0 : 1); sv(m.polygonOffset ? (m.polygonOffsetFactor || -1) : 0); sv(m.wireframe ? 1 : 0); sv(m.blending || 0);
    sv(t && t.offset ? t.offset.x + t.repeat.x * 7 : 0); sv(t && t.offset ? t.offset.y + t.repeat.y * 7 : 0); sv(t && t.rotation || 0);
    const r = e.refs; if (r[0] !== m.map || r[1] !== m.emissiveMap || r[2] !== m.normalMap) { r[0] = m.map; r[1] = m.emissiveMap; r[2] = m.normalMap; stC = true; }
    return stC;
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
    // (Alpha der Textur steuert allein useAlphaFromAlbedoTexture – hasAlpha bleibt an: Umschalten würde alle Materialien neu markieren)
    // Durchsichtig bleibt durchsichtig (höchstens 0,999): ein Sprung auf genau 1 ließe Babylon den Shader neu aufbauen (Ein-/Ausblenden jedes Bild)
    const op = transp ? Math.min(0.999, m.opacity != null ? m.opacity : 1) : 1; if (b.alpha !== op) b.alpha = op;
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
    const av = {}; for (const k in g.attributes) av[k] = g.attributes[k].version;
    const d = { ver, av, iv: g.index ? g.index.version : -1, n, pos: attrArray(p, 3), nor: attrArray(g.attributes.normal, 3), uv: attrArray(g.attributes.uv, 2), uv2: attrArray(g.attributes.uv2, 2), col: null, si: null, sw: null, idx: null, groups: g.groups, refs: c ? c.refs : 0 };
    if (g.attributes.color) d.col = attrArray(g.attributes.color, 4);
    if (g.attributes.skinIndex) d.si = attrArray(g.attributes.skinIndex, 4);
    if (g.attributes.skinWeight) d.sw = attrArray(g.attributes.skinWeight, 4);
    if (g.index) { const a = g.index.array; d.idx = a instanceof Uint16Array || a instanceof Uint32Array ? a : Uint32Array.from(a); }
    else { d.idx = n > 65535 ? new Uint32Array(n) : new Uint16Array(n); for (let i = 0; i < n; i++) d.idx[i] = i; }
    if (!d.nor) d.nor = computeNormals(d.pos, d.idx);
    geoCache.set(g, d);
    return d;
  }
  function verOf(g) {
    if (g.__vf === frame) return g.__v;
    const a = g.attributes; let ks = g.__ak; if (!ks || ks.n !== a) { ks = g.__ak = Object.keys(a); ks.n = a; }
    let v = g.index ? g.index.version : 0; for (let i = 0; i < ks.length; i++) { const x = a[ks[i]]; if (x) v += x.version * 7 + 1; }
    if (frame % 30 === 0 && ks.length !== Object.keys(a).length) g.__ak = null;   // Attribute hinzugefügt
    g.__vf = frame; g.__v = v; return v;
  }
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
  function applyGeo(mesh, d, skinned, upd) {
    upd = !!upd;
    mesh.setVerticesData(VertexBuffer.PositionKind, d.pos, upd, 3);
    mesh.setVerticesData(VertexBuffer.NormalKind, d.nor, upd, 3);
    if (d.uv) mesh.setVerticesData(VertexBuffer.UVKind, d.uv, upd, 2); else if (mesh.isVerticesDataPresent(VertexBuffer.UVKind)) mesh.removeVerticesData(VertexBuffer.UVKind);
    if (d.uv2) mesh.setVerticesData(VertexBuffer.UV2Kind, d.uv2, upd, 2);
    if (d.col) mesh.setVerticesData(VertexBuffer.ColorKind, d.col, upd, 4);
    if (skinned && d.si) { mesh.setVerticesData(VertexBuffer.MatricesIndicesKind, d.si, false, 4); mesh.setVerticesData(VertexBuffer.MatricesWeightsKind, d.sw, false, 4); }
    mesh.setIndices(d.idx, d.n);
  }
  // Geometrie hat sich geändert (Mundbewegung, Wellen, Anzeigen …): nur die geänderten Puffer nachladen, ohne Babylon-Shader neu aufzubauen
  const KIND = { position: VertexBuffer.PositionKind, normal: VertexBuffer.NormalKind, uv: VertexBuffer.UVKind, color: VertexBuffer.ColorKind };
  function reGeo(mesh, g, skinned) {
    const old = geoCache.get(g), d = geoData(g); if (!d) return d;
    const same = old && mesh.__dyn && old.n === d.n && old.idx.length === d.idx.length && old.iv === d.iv && !!old.uv === !!d.uv && !!old.col === !!d.col && Object.keys(old.av).length === Object.keys(d.av).length;
    if (!same) { applyGeo(mesh, d, skinned, true); mesh.__dyn = true; return d; }
    for (const k in d.av) {
      if (old.av[k] === d.av[k] && !(k === 'position' && !g.attributes.normal)) continue;
      const kind = KIND[k]; if (!kind) continue;
      const arr = k === 'position' ? d.pos : k === 'normal' ? d.nor : k === 'uv' ? d.uv : d.col;
      mesh.updateVerticesData(kind, arr, false, false);
      if (k === 'position' && !g.attributes.normal) mesh.updateVerticesData(VertexBuffer.NormalKind, d.nor, false, false);
    }
    return d;
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
    e.o = o; e.f = frame; e.on = null; e.scn = null; e.still = 0;
    if (e.type !== 'none') { e.mw = new Float64Array(16); e.mw[0] = NaN; }
    ents.set(o, e); o.__be = e;
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
    // Eigenes Mesh, das die Vertexpuffer der Vorlage teilt (Babylon-Instanzen lohnen erst ab vielen gleichen Teilen – fast jedes Teil hier ist einzigartig)
    const inst = ms.mesh.clone('i', null, true, false);
    inst.isVisible = true; inst.isPickable = false; inst.material = ms.mesh.material; inst.receiveShadows = ms.mesh.receiveShadows;
    return { type: 'inst', mesh: inst, ms, key };
  }
  // Alle Teile einer Figur (Körper, Kleidung, Haare) teilen dieselben Knochen: ein Babylon-Skelett je Figur, einmal pro Bild berechnet.
  // Babylon fragt die Knochenmatrizen nur für sichtbare Figuren ab (eigene Box je Teil) – Figuren außerhalb des Bildes kosten nichts.
  const skels = new Map();   // erster Knochen → [geteilte Skelette]
  const SKM = new T.Matrix4(), SKN = new T.Matrix4();
  function sameArr(a, b) { if (a.length !== b.length) return false; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false; return true; }
  function skelFor(o) {
    const s3 = o.skeleton, bones = s3.bones, n = bones.length;
    const inv = new Float32Array(n * 16); s3.boneInverses.forEach((m, i) => inv.set(m.elements, i * 16));
    const bind = Float32Array.from(o.bindMatrix.elements);
    let list = skels.get(bones[0]); if (!list) skels.set(bones[0], list = []);
    for (const s of list) if (s.n === n && s.bones.every((b, i) => b === bones[i]) && sameArr(s.bind, bind) && sameArr(s.inv, inv)) { s.refs++; return s; }
    const sk = new Skeleton('sk', 'sk' + o.id, scene);
    for (let i = 0; i < n; i++) new Bone('b' + i, sk, null, Matrix.Identity(), Matrix.Identity(), Matrix.Identity(), i);
    sk.useTextureToStoreBoneMatrices = true;
    const s = { sk, bones: bones.slice(), n, bind, inv, refs: 1, f: -1, o, key: bones[0] };
    // Endmatrix je Knochen (Welt) = Objekt · Bindungsinverse · Knochen · Knocheninverse · Bindung; das Babylon-Mesh liegt im Ursprung
    sk._computeTransformMatrices = target => {
      const src = s.o; SKN.multiplyMatrices(src.matrixWorld, src.bindMatrixInverse);
      for (let i = 0; i < s.n; i++) { SKM.fromArray(s.inv, i * 16); SKM.premultiply(s.bones[i].matrixWorld); SKM.premultiply(SKN); SKM.multiply(src.bindMatrix); target.set(SKM.elements, i * 16); }
      target.set(IDENT, s.n * 16);
    };
    list.push(s);
    return s;
  }
  const IDENT = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  function releaseSkel(s) {
    if (--s.refs > 0) return;
    s.sk.dispose(); const list = skels.get(s.key); if (list) { list.splice(list.indexOf(s), 1); if (!list.length) skels.delete(s.key); }
  }
  function makeSkinned(o) {
    const d = geoData(o.geometry); if (!d || !d.si) return makeMesh(o);
    const mesh = new Mesh('skin', scene); applyGeo(mesh, d, true);
    const ms = { mesh, vc: !!d.col }; setMeshMaterial(ms, o);
    const sh = skelFor(o);
    mesh.skeleton = sh.sk; mesh.numBoneInfluencers = 4; mesh.isPickable = false;
    mesh.freezeWorldMatrix(); mesh.doNotSyncBoundingInfo = true;
    if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
    return { type: 'own', mesh, skin: { sh, bx: NaN, by: NaN, bz: NaN }, geo: o.geometry, ver: d.ver, mkey: matKey(o) };
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
    const inst = ms.mesh.clone('s', null, true, false); inst.isVisible = true; inst.material = ms.mesh.material; inst.billboardMode = Mesh.BILLBOARDMODE_ALL; inst.isPickable = false;
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
    else if (e.type === 'own') { if (e.skin) releaseSkel(e.skin.sh); e.mesh.dispose(false, false); }
    else if (e.type === 'light') { if (e.sg) { shadowLights.delete(e); look.sgs.delete(e.sg); e.sg.dispose(); } e.light.dispose(); }
    else if (e.type === 'batch') unbatch(e);
    ents.delete(e.o); if (e.o.__be === e) e.o.__be = undefined;
  }
  function setOn(e, on) {
    if (e.on === on) return; e.on = on; candDirty = true;
    if (e.type === 'light') e.light.setEnabled(on); else if (e.mesh) e.mesh.setEnabled(on);
  }

  // ------------------------------------------------------------------ Feste Blöcke: was sich nicht bewegt, zeichnet Babylon zusammengefasst
  // Die Stadt besteht aus ~2.000 Einzelteilen mit fast lauter eigenen Formen und Materialien. Steht ein Teil BATCH_K Bilder lang still
  // (Lage, Material, Form unverändert), wandert es in einen festen Babylon-Block: ein Mesh je Gegend (CELL Meter) und Materialart,
  // Farben als Vertexfarben, Lage fest eingerechnet, Weltmatrix eingefroren. Ändert sich das Teil doch (Auto fährt los, Schild geht aus),
  // wird es sofort aus dem Block genommen (Bereich ausgeblendet, später neu gepackt) und wieder einzeln gezeichnet.
  const BATCH = opts.batch !== false && !(typeof location !== 'undefined' && /[?&]batch=0/.test(location.search));
  const BATCH_K = 4, BATCH_MS = 500, CELL = 64, MAX_UNB = 2;   // still: mindestens 4 Bilder und eine halbe Sekunde
  const chunks = new Map();          // Schlüssel → Block
  const dirty = new Set();           // Blöcke zum Neupacken
  const cands = [];                  // Kandidaten dieses Bildes
  const bmats = new Map();           // Material im Block → { refs, members:Set }
  let rr = 0;                        // Rundlauf-Zeiger für die Material-/Formprüfung
  const BC = { built: 0, rel: 0, add: 0, hide: 0, why: {} };
  R.batch = { on: BATCH, chunks, ents, cnt: BC, sigs: () => { const r = {}; for (const c of chunks.values()) { const k = c.sig.replace(/[0-9a-f]{8}-[0-9a-f-]{27}/g, 'TEX'); r[k] = (r[k] || 0) + 1; } return Object.entries(r).sort((a, b) => b[1] - a[1]).slice(0, 25).concat([['distinct', Object.keys(r).length], ['cmats', cmats.size]]); }, sample: () => { const out = {}; for (const e of ents.values()) if (e.type === 'inst' && !e.sprite && batchable(e.o) && matsStill(e.o) && (e.still < BATCH_K || now - e.t0 < BATCH_MS)) { let p = e.o, ch = []; while (p && ch.length < 6) { ch.push((p.name || p.type) + (p.userData && Object.keys(p.userData).length ? '{' + Object.keys(p.userData).slice(0, 3) + '}' : '')); p = p.parent; } const k = ch.join('<') + ' g=' + (e.o.geometry.type) + ' m=' + (e.o.material.type) + ' y=' + e.o.matrixWorld.elements[13].toFixed(1); out[k] = (out[k] || 0) + 1; } return Object.entries(out).sort((a, b) => b[1] - a[1]).slice(0, 30); }, why: () => { const r = {}; const add = k => r[k] = (r[k] || 0) + 1;
    for (const e of ents.values()) { if (e.type !== 'inst' || e.sprite) { add(e.type + (e.sprite ? 'S' : '')); continue; } const o = e.o;
      if (!batchable(o)) { const m = Array.isArray(o.material) ? o.material[0] : o.material; add(o.__bjsDyn ? 'dyn' : !m ? 'nomat' : !(BASIC[m.type] || LIT[m.type]) ? 'type:' + m.type : m.transparent ? 'transp' : m.opacity < 1 ? 'opac' : m.visible === false ? 'mvis' : m.depthTest === false ? 'depth' : o.renderOrder ? 'order' : o.onBeforeRender !== OBR ? 'obr' : 'geo'); }
      else if (!matsStill(o)) add('matMoving'); else if (e.still < BATCH_K || now - e.t0 < BATCH_MS) add('moving'); else add('ready'); }
    return r; }, stats: () => { let m = 0, v = 0; for (const c of chunks.values()) { m += c.members.size; v += c.nv; } return { chunks: chunks.size, members: m, verts: v }; } };
  const BASIC = { MeshBasicMaterial: 1 }, LIT = { MeshStandardMaterial: 1, MeshPhysicalMaterial: 1, MeshLambertMaterial: 1, MeshPhongMaterial: 1, MeshToonMaterial: 1 };
  const OBR = T.Object3D.prototype.onBeforeRender;
  function matOk(m) { return m && (BASIC[m.type] || LIT[m.type]) && !m.transparent && m.depthTest !== false && !m.wireframe && m.blending !== 2 && m.visible !== false && m.opacity >= 1; }
  function batchable(o) {
    if (o.__bjsDyn >= MAX_UNB || !o.isMesh || o.isSkinnedMesh || o.isInstancedMesh || o.renderOrder || o.onBeforeRender !== OBR) return false;
    const g = o.geometry; if (!g || !g.attributes || !g.attributes.position || g.attributes.position.count > 60000) return false;
    if (g.morphAttributes && Object.keys(g.morphAttributes).length) return false;
    if (g.drawRange && (g.drawRange.start || g.drawRange.count !== Infinity)) return false;
    const m = o.material;
    if (Array.isArray(m)) { if (!g.groups || !g.groups.length) return false; for (const x of m) if (!matOk(x)) return false; return true; }
    return !!matOk(m);
  }
  const r2 = x => Math.round(x * 50) / 50, r3 = x => Math.round(x * 1000) / 1000;
  const texId = t => t ? t.uuid : '-';
  const roughOf = m => m.roughness != null ? m.roughness : m.type === 'MeshPhongMaterial' || m.type === 'MeshToonMaterial' ? Math.max(0.15, 1 - (m.shininess || 30) / 120) : m.type === 'MeshLambertMaterial' ? 0.95 : 1;
  // Leuchten, Metall und Rauheit je Ecke (BlockVertexPlugin) – außer bei kräftigem Leuchten (Neon): das braucht die Materialfarbe fürs Nachglühen am PC
  const perVertex = m => !BASIC[m.type] && !m.emissiveMap && (!m.emissive || Math.max(m.emissive.r, m.emissive.g, m.emissive.b) * (m.emissiveIntensity != null ? m.emissiveIntensity : 1) <= 0.6);
  function msig(m) {   // was die Babylon-Materialien eines Blocks gemeinsam haben müssen (Farbe kommt in die Vertexfarben)
    const basic = !!BASIC[m.type], em = m.emissive || BLACK, ei = m.emissiveIntensity != null ? m.emissiveIntensity : 1;
    return (basic ? 'B' : perVertex(m) ? 'V' + texId(m.normalMap) : 'L' + r2(m.metalness || 0) + ',' + r2(roughOf(m)) + ',' + r3(em.r * ei) + ',' + r3(em.g * ei) + ',' + r3(em.b * ei) + ',' + texId(m.emissiveMap) + ',' + texId(m.normalMap)) +
      '|' + texId(m.map) + '|' + (m.alphaTest || 0) + '|' + (m.side || 0) + '|' + (m.depthWrite === false ? 0 : 1) + '|' + (m.fog === false ? 0 : 1) + '|' + (m.polygonOffset ? (m.polygonOffsetFactor || -1) : 0);
  }
  const cmats = new Map();           // Signatur → { bm, refs, rep }
  function chunkMat(sig, rep) {
    let c = cmats.get(sig);
    if (!c) {
      scene._blockMaterialDirtyMechanism = true;
      try {
        const bm = new PBRMaterial('blk', scene); bm.maxSimultaneousLights = 8; bm.usePhysicalLightFalloff = false; bm.environmentIntensity = 0; bm.forceIrradianceInFragment = true;
        syncMat(rep, { kind: 'std', bm });
        bm.albedoColor.copyFromFloats(1, 1, 1);
        const pv = sig[0] === 'V';
        if (pv) { new BlockVertexPlugin(bm); bm.metallic = 0; bm.roughness = 1; bm.emissiveColor.copyFromFloats(0, 0, 0); }
        c = { bm, refs: 0, rep, pv, maps: [rep.map, rep.emissiveMap, rep.normalMap].filter(Boolean) };
      } finally { scene._blockMaterialDirtyMechanism = false; }
      cmats.set(sig, c);
    }
    c.refs++;
    return c;
  }
  function releaseChunkMat(c) { if (--c.refs <= 0) { c.bm.dispose(); for (const [k, v] of cmats) if (v === c) cmats.delete(k); } }
  function chunkFor(sc, sig, rep, o, cs, rs) {
    const mw = o.matrixWorld.elements, k = sc.uuid + '#' + sig + '#' + (cs ? 1 : 0) + (rs ? 1 : 0) + '#' + Math.floor(mw[12] / CELL) + ',' + Math.floor(mw[14] / CELL);
    let c = chunks.get(k);
    if (!c) { c = { key: k, scn: sc, sig, cm: chunkMat(sig, rep), cs, rs, members: new Set(), mesh: null, nv: 0, uv: !!(rep.map || rep.emissiveMap || rep.normalMap), pos: null, hidden: 0 }; chunks.set(k, c); }
    return c;
  }
  // Teil eines Objekts (ganze Form oder eine Materialgruppe) in einen Block
  function partsOf(o) {
    const m = o.material;
    if (Array.isArray(m)) return o.geometry.groups.map(g => ({ m: m[g.materialIndex || 0], start: g.start, count: g.count })).filter(p => p.m && p.count > 0);
    return [{ m, start: 0, count: Infinity }];
  }
  function batchEnt(e) {
    const o = e.o, sc = e.scn, parts = partsOf(o), cs = !!o.castShadow, rs = !!o.receiveShadow;
    disposeEnt(e);   // Einzel-Instanz weg
    const b = { type: 'batch', o, f: frame, on: true, scn: sc, mw: Float64Array.from(o.matrixWorld.elements), geo: o.geometry, mat: o.material, cs, rs, gver: verOf(o.geometry), parts: [] };
    for (const p of parts) {
      const c = chunkFor(sc, msig(p.m), p.m, o, cs, rs);
      const part = { b, m: p.m, start: p.start, count: p.count, c, off: -1, n: 0 };
      c.members.add(part); b.parts.push(part); dirty.add(c);
      let bm = bmats.get(p.m); if (!bm) bmats.set(p.m, bm = { members: new Set(), e: { kind: 'std' } }); bm.members.add(b);
      if (!bm.e.st) mstate(p.m, bm.e);
    }
    ents.set(o, b); o.__be = b;
    return b;
  }
  function unbatch(b) {
    for (const p of b.parts) {
      const c = p.c; c.members.delete(p);
      if (c.mesh && p.off >= 0 && c.pos) {   // sofort unsichtbar: Bereich auf einen Punkt zusammenziehen, neu gepackt wird später
        const a = c.pos, x = a[p.off * 3], y = a[p.off * 3 + 1], z = a[p.off * 3 + 2];
        for (let i = p.off; i < p.off + p.n; i++) { a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z; }
        c.posDirty = true; c.hidden += p.n; p.off = -1;
      }
      dirty.add(c);
      const bm = bmats.get(p.m); if (bm) { bm.members.delete(b); if (!bm.members.size) bmats.delete(p.m); }
    }
    b.parts = [];
  }
  // Block neu packen: alle Teile in Weltkoordinaten zusammenführen
  const NM = new T.Matrix3();
  function buildChunk(c) {
    BC.built++;
    if (!c.members.size) { if (c.mesh) { for (const l of shadowLights) l.sg.removeShadowCaster(c.mesh, false); c.mesh.dispose(false, false); } releaseChunkMat(c.cm); chunks.delete(c.key); return; }
    let nv = 0, ni = 0; const list = [];
    for (const p of c.members) {
      const d = geoData(p.b.geo); if (!d) continue;
      const s = Math.min(p.start, d.idx.length), cnt = Math.min(p.count, d.idx.length - s);
      if (cnt <= 0) continue;
      list.push([p, d, s, cnt]); nv += d.n; ni += cnt;
    }
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 4), uv = c.uv ? new Float32Array(nv * 2) : null;
    const pv = c.cm.pv, ve = pv ? new Float32Array(nv * 3) : null, vr = pv ? new Float32Array(nv * 2) : null;
    const idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
    let vo = 0, io = 0;
    for (const [p, d, s, cnt] of list) {
      const o = p.b.o, me = o.matrixWorld.elements, m = p.m, cc = m.color || WHITE, vc = m.vertexColors && d.col;
      NM.getNormalMatrix(o.matrixWorld); const ne = NM.elements;
      const det = me[0] * (me[5] * me[10] - me[6] * me[9]) - me[4] * (me[1] * me[10] - me[2] * me[9]) + me[8] * (me[1] * me[6] - me[2] * me[5]);
      const P = d.pos, N = d.nor, U = d.uv, C = d.col;
      if (pv) {
        const em = m.emissive || BLACK, ei = m.emissiveIntensity != null ? m.emissiveIntensity : 1, met = m.metalness || 0, ro = roughOf(m);
        for (let i = vo; i < vo + d.n; i++) { ve[i * 3] = em.r * ei; ve[i * 3 + 1] = em.g * ei; ve[i * 3 + 2] = em.b * ei; vr[i * 2] = met; vr[i * 2 + 1] = ro; }
      }
      for (let i = 0; i < d.n; i++) {
        const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2], j = (vo + i) * 3;
        pos[j] = me[0] * x + me[4] * y + me[8] * z + me[12]; pos[j + 1] = me[1] * x + me[5] * y + me[9] * z + me[13]; pos[j + 2] = me[2] * x + me[6] * y + me[10] * z + me[14];
        const a = N[i * 3], bb = N[i * 3 + 1], g = N[i * 3 + 2];
        let nx = ne[0] * a + ne[3] * bb + ne[6] * g, ny = ne[1] * a + ne[4] * bb + ne[7] * g, nz = ne[2] * a + ne[5] * bb + ne[8] * g; const l = Math.hypot(nx, ny, nz) || 1;
        nor[j] = nx / l; nor[j + 1] = ny / l; nor[j + 2] = nz / l;
        const k = (vo + i) * 4;
        if (vc) { col[k] = cc.r * C[i * 4]; col[k + 1] = cc.g * C[i * 4 + 1]; col[k + 2] = cc.b * C[i * 4 + 2]; } else { col[k] = cc.r; col[k + 1] = cc.g; col[k + 2] = cc.b; }
        col[k + 3] = 1;
        if (uv) { uv[(vo + i) * 2] = U ? U[i * 2] : 0; uv[(vo + i) * 2 + 1] = U ? U[i * 2 + 1] : 0; }
      }
      const I = d.idx;
      if (det < 0) for (let t = 0; t + 2 < cnt; t += 3) { idx[io + t] = I[s + t] + vo; idx[io + t + 1] = I[s + t + 2] + vo; idx[io + t + 2] = I[s + t + 1] + vo; }
      else for (let t = 0; t < cnt; t++) idx[io + t] = I[s + t] + vo;
      p.off = vo; p.n = d.n;
      vo += d.n; io += cnt;
    }
    let mesh = c.mesh;
    if (!mesh) {
      mesh = c.mesh = new Mesh('blk', scene); mesh.isPickable = false; mesh.material = c.cm.bm; mesh.useVertexColors = true; mesh.hasVertexAlpha = false;
      mesh.receiveShadows = c.rs; mesh.renderingGroupId = 1;
      if (c.cs) for (const l of shadowLights) l.sg.addShadowCaster(mesh, false);
    }
    mesh.setVerticesData(VertexBuffer.PositionKind, pos, true, 3);
    mesh.setVerticesData(VertexBuffer.NormalKind, nor, false, 3);
    mesh.setVerticesData(VertexBuffer.ColorKind, col, false, 4);
    if (uv) mesh.setVerticesData(VertexBuffer.UVKind, uv, false, 2);
    if (pv) { mesh.setVerticesData('blkE', ve, false, 3); mesh.setVerticesData('blkR', vr, false, 2); }
    mesh.setIndices(idx, nv);
    mesh.refreshBoundingInfo();
    mesh.freezeWorldMatrix();
    mesh.setEnabled(c.scn === curScene); candDirty = true;
    c.pos = pos; c.nv = nv; c.hidden = 0; c.posDirty = false;
  }
  // Pro Bild: neue Kandidaten einsortieren, Blöcke packen (begrenzt), einen Teil der Block-Materialien/-Formen auf Änderungen prüfen
  let shown = null;
  function batchStep() {
    if (shown !== curScene) { shown = curScene; candDirty = true; for (const c of chunks.values()) if (c.mesh) c.mesh.setEnabled(c.scn === curScene); }
    for (const c of chunks.values()) if (c.posDirty) { c.posDirty = false; if (c.mesh && !dirty.has(c)) c.mesh.updateVerticesData(VertexBuffer.PositionKind, c.pos, false, false); }
    if (cands.length) { for (const e of cands) if (e.o.__be === e && e.type === 'inst') { BC.add++; batchEnt(e); } cands.length = 0; }
    if (dirty.size) {
      const t0 = performance.now();
      for (const c of dirty) { dirty.delete(c); if (chunks.get(c.key) === c) buildChunk(c); if (performance.now() - t0 > 12) break; }
    }
    // Rundlauf: Material- oder Formänderung → aus dem Block nehmen
    if (bmats.size) {
      const arr = [...bmats.keys()], n = Math.min(arr.length, 120);
      for (let i = 0; i < n; i++) {
        const m = arr[(rr + i) % arr.length], bm = bmats.get(m); if (!bm) continue;
        if (mstate(m, bm.e)) for (const b of [...bm.members]) release(b, 'mat');
      }
      rr = (rr + n) % Math.max(1, arr.length);
    }
    // Texturen der Blöcke (Video-Wände, Leinwände) weiter aktualisieren
    for (const c of cmats.values()) for (const t of c.maps) texFor(t);
  }
  // Teil aus dem Block nehmen und wieder einzeln zeichnen (bei wiederholtem Wechsel bleibt es dauerhaft einzeln)
  function release(b, why) {
    BC.rel++; BC.why[why] = (BC.why[why] || 0) + 1;
    const o = b.o; o.__bjsDyn = (o.__bjsDyn || 0) + 1;
    const scn = b.scn; disposeEnt(b);
    const e = makeEnt(o); e.scn = scn;
    return e;
  }

  // ------------------------------------------------------------------ Abgleich pro Bild
  function setTRS(mesh, mw) {
    Matrix.FromArrayToRef(mw, 0, tmpM);
    if (!mesh.rotationQuaternion) mesh.rotationQuaternion = new Quaternion();
    tmpM.decompose(mesh.scaling, mesh.rotationQuaternion, mesh.position);
  }
  function sameM(a, b) { for (let i = 0; i < 16; i++) if (a[i] !== b[i]) return false; return true; }
  function syncEnt(e, o) {
    if (e.type === 'none') return e;
    if (e.type === 'light') { syncLight(e, o); return e; }
    if (e.type === 'batch') {   // im festen Block: nur prüfen, ob es still geblieben ist
      if (o.geometry === e.geo && o.material === e.mat && !!o.castShadow === e.cs && !!o.receiveShadow === e.rs && e.parts.length && e.parts[0].c.scn === curScene && sameM(o.matrixWorld.elements, e.mw)) return e;
      e = release(e, o.geometry !== e.geo ? 'geo' : o.material !== e.mat ? 'matswap' : !!o.castShadow !== e.cs || !!o.receiveShadow !== e.rs ? 'shadow' : !e.parts.length || e.parts[0].c.scn !== curScene ? 'scene' : 'move'); if (e.type === 'none') return e;
    }
    // Material oder Geometrie getauscht → neu anlegen
    if (e.type === 'inst' && !e.sprite && (e.ms.geo !== o.geometry || e.ms.mat !== o.material || e.ms.rs !== !!o.receiveShadow)) { disposeEnt(e); e = makeEnt(o); e.scn = curScene; if (e.type === 'none') return e; }
    if (e.type === 'inst' && e.sprite && e.ms.key !== 'sprite|' + (o.material ? o.material.uuid : '')) { disposeEnt(e); e = makeEnt(o); e.scn = curScene; }
    if (e.type === 'own' && !e.pts && !e.sky && (e.geo !== o.geometry || e.mkey !== matKey(o))) { disposeEnt(e); e = makeEnt(o); e.scn = curScene; if (e.type === 'none') return e; }
    const mesh = e.mesh, mw = o.matrixWorld.elements;
    if (e.type === 'inst') {
      const ms = e.ms;
      if (!e.sprite) {
        // Geometrie verändert → Vorlage neu befüllen
        const v = verOf(o.geometry); if (v !== ms.ver) { reGeo(ms.mesh, o.geometry, false); ms.ver = v; }
        matFor(o.material, 'std');
        if (Array.isArray(o.material)) o.material.forEach(x => matFor(x, 'std'));
        if (ms.mesh.isVisible) ms.mesh.isVisible = false;
      } else matFor(o.material, 'std');
    } else if (e.pts) { if (verOf(e.geo) !== e.ver) uploadPoints(e); matFor(o.material, 'points'); }
    else if (e.sky) { matFor(o.material, 'sky'); }
    else {
      const v = verOf(o.geometry); if (v !== e.ver) { reGeo(mesh, o.geometry, !!e.skin); e.ver = v; }
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
      if (e.frz) { e.frz = false; mesh.unfreezeWorldMatrix(); }
      setTRS(mesh, mw);
      e.still = 0; e.t0 = now;
    } else if (!e.frz && e.still > 30 && !mesh.billboardMode && (e.frz = true)) mesh.freezeWorldMatrix();   // steht still: Babylon rechnet Lage und Box nicht mehr nach
    else if (BATCH && e.type === 'inst' && !e.sprite && ++e.still >= BATCH_K && e.still % BATCH_K === 0 && now - e.t0 >= BATCH_MS && batchable(o) && matsStill(o)) cands.push(e);
    if (e.thin) syncThin(e, o);
    // Schatten, Reihenfolge
    const cs = !!o.castShadow;
    if (e.cs !== cs) { e.cs = cs; for (const l of shadowLights) { if (cs) l.sg.addShadowCaster(mesh, false); else l.sg.removeShadowCaster(mesh, false); } }
    if (e.type === 'own' && !e.pts && !e.sky) { const rs = !!o.receiveShadow; if (mesh.receiveShadows !== rs) mesh.receiveShadows = rs; }
    if (o.frustumCulled === false && !mesh.alwaysSelectAsActiveMesh) mesh.alwaysSelectAsActiveMesh = true;
    const mat = Array.isArray(o.material) ? o.material[0] : o.material;
    const grp = e.sky ? 0 : mat && mat.depthTest === false ? 2 : 1;
    if (mesh.renderingGroupId !== grp) mesh.renderingGroupId = grp;
    const ai = o.renderOrder || 0; if (mesh.alphaIndex !== ai && ai) mesh.alphaIndex = ai;
    return e;
  }
  function matsStill(o) {
    const ms = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of ms) { const me = mats.get(m); if (!me || me.chg == null || frame - me.chg < BATCH_K || now - me.chgT < BATCH_MS) return false; }
    return true;
  }
  function syncSkin(e, o) {
    const s = e.skin, sh = s.sh;
    if (sh.f !== frame) { sh.f = frame; sh.o = o; sh.sk._isDirty = true; }   // berechnet wird erst, wenn Babylon die Figur wirklich zeichnet
    // Sichtbarkeits-Box: Hülle der Bindungspose um die Figur (wie die Kugel, mit der bisher ausgeblendet wurde)
    const mw = o.matrixWorld.elements, bs = o.geometry.boundingSphere;
    if (mw[12] !== s.bx || mw[13] !== s.by || mw[14] !== s.bz) {
      s.bx = mw[12]; s.by = mw[13]; s.bz = mw[14];
      const sc = Math.max(Math.hypot(mw[0], mw[1], mw[2]), Math.hypot(mw[4], mw[5], mw[6]), Math.hypot(mw[8], mw[9], mw[10]));
      const c = bs.center, cx = mw[0] * c.x + mw[4] * c.y + mw[8] * c.z + mw[12], cy = mw[1] * c.x + mw[5] * c.y + mw[9] * c.z + mw[13], cz = mw[2] * c.x + mw[6] * c.y + mw[10] * c.z + mw[14];
      const r = bs.radius * sc * 1.6 + 0.5;
      tmpS.copyFromFloats(cx - r, cy - r, cz - r); tmpP.copyFromFloats(cx + r, cy + r, cz + r);
      e.mesh.getBoundingInfo().reConstruct(tmpS, tmpP, e.mesh.getWorldMatrix());
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
        for (const c of chunks.values()) if (c.cs && c.mesh) e.sg.addShadowCaster(c.mesh, false);
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
    let e = o.__be;
    const v = vis && o.visible !== false;
    if (!e) { if (!v) { for (let i = 0; i < o.children.length; i++) walk(o.children[i], false); return; } e = makeEnt(o); }
    e.f = frame; e.scn = curScene;
    if (v) e = syncEnt(e, o) || o.__be;
    else if (e.type === 'batch') { BC.hide++; o.__bjsDyn = (o.__bjsDyn || 0) + 1; disposeEnt(e); e = null; }   // ausgeblendet: aus dem Block
    if (e) setOn(e, v && e.type !== 'none');
    const ch = o.children;
    for (let i = 0; i < ch.length; i++) walk(ch[i], v);
  }
  function syncScene(sc, cam3) {
    // Nebel und Hintergrund
    const f = sc.fog;
    const fm = f && f.isFog ? Scene.FOGMODE_LINEAR : f && f.isFogExp2 ? Scene.FOGMODE_EXP2 : Scene.FOGMODE_NONE;
    if (scene.fogMode !== fm) setFogMode(fm);
    if (f && f.isFog) { scene.fogMode = Scene.FOGMODE_LINEAR; scene.fogStart = f.near; scene.fogEnd = f.far; setColor(scene.fogColor, f.color); }
    else if (f && f.isFogExp2) { scene.fogMode = Scene.FOGMODE_EXP2; scene.fogDensity = f.density; setColor(scene.fogColor, f.color); }
    else scene.fogMode = Scene.FOGMODE_NONE;
    const bg = sc.background;
    if (bg && bg.isColor) scene.clearColor.set(bg.r, bg.g, bg.b, 1); else scene.clearColor.set(0, 0, 0, 1);
    // Belichtung ist nur ein Uniform: direkt setzen, sonst markiert Babylon bei jeder Änderung (Tageszeit) alle Materialien × alle Meshes neu
    const ex = (R.toneMappingExposure || 1) * look.exposureK;
    if (ex !== 1 && ip._exposure !== 1) ip._exposure = ex; else ip.exposure = ex;
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
    const tA = performance.now();
    if (sc.autoUpdate !== false) sc.updateMatrixWorld();
    if (cam3.parent === null) cam3.updateMatrixWorld();
    now = performance.now(); curScene = sc; lastRender.set(sc, now);
    walk(sc, true);
    const tB = performance.now();
    // Aufräumen: aus der Szene entfernt → weg; gehört zu einer gerade nicht gezeigten Szene → aus
    for (const e of ents.values()) {
      if (e.f === frame) continue;
      if (e.scn === sc || !e.scn || now - (lastRender.get(e.scn) || 0) > KEEP_MS) disposeEnt(e);
      else if (e.on) setOn(e, false);
    }
    for (const [s, t] of lastRender) if (now - t > KEEP_MS) lastRender.delete(s);
    const tC = performance.now();
    if (BATCH) batchStep();
    syncScene(sc, cam3);
    look.beforeRender(sc, frame);
    const tD = performance.now();
    engine.beginFrame();
    scene.render();
    engine.endFrame();
    const tE = performance.now(), k = 0.05, tm = R.tm;
    tm.mw += ((now - tA) - tm.mw) * k; tm.walk += ((tB - now) - tm.walk) * k; tm.clean += ((tC - tB) - tm.clean) * k; tm.batch += ((tD - tC) - tm.batch) * k; tm.draw += ((tE - tD) - tm.draw) * k;
    R.info.render.calls = engine._drawCalls ? engine._drawCalls.current : 0;
    R.stats.objects = ents.size; R.stats.masters = masters.size; R.stats.mats = mats.size; R.stats.tex = texs.size;
  };

  // Aufräumen, wenn der Szenengraph Geometrien/Materialien wegwirft
  R.prune = function () {
    const usedM = new Set(); for (const ms of masters.values()) usedM.add(ms.mesh.material); for (const e of ents.values()) if (e.mesh && e.type === 'own') usedM.add(e.mesh.material);
    for (const [m, e] of mats) if (frame - e.f > 600 && !usedM.has(e.bm) && ![...usedM].some(x => x && x.subMaterials && x.subMaterials.includes(e.bm))) { e.bm.dispose(); mats.delete(m); }
    const bms = [...[...mats.values()].map(x => x.bm), ...[...cmats.values()].map(x => x.bm)];
    for (const [t, e] of texs) { let used = false; for (const b of bms) { if (b.albedoTexture === e.bt || b.emissiveTexture === e.bt || b.bumpTexture === e.bt) { used = true; break; } } if (!used && e.bt) { e.bt.dispose(); texs.delete(t); } }
    for (const [g, d] of geoCache) { let used = false; for (const ms of masters.values()) if (ms.geo === g) { used = true; break; } if (!used) for (const e of ents.values()) if (e.geo === g) { used = true; break; } if (!used) geoCache.delete(g); }
  };
  setInterval(() => { try { R.prune(); } catch (e) { /* weiter */ } }, 15000);
  return R;
}
