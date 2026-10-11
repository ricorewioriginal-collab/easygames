// Lädt das echte Spiel (content.js, story.js, quests.js, game.js) mit echter Three.js-Geometrie in eine
// simulierte Browserumgebung. Nur die Darstellung (WebGL-Zeichnen) und der DOM sind Attrappen;
// Spiellogik, Physik, Quests, Kampf und Speicherung laufen unverändert.
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const FILES = ['content.js', 'story.js', 'quests.js', 'game.js'];

function load({storage = {}, webgl = true, width = 1280, height = 800, coarse = false} = {}) {
  const renders = {count: 0, draw2d: 0};
  // Dieselbe Three.js-Version, die index.html lädt (r128).
  const T = require(path.join(root, 'vendor/three-compatible.min.js'));
  const THREE = Object.assign({}, T);
  class Element {
    constructor(id) { this.id = id; this.hidden = true; this.style = {}; this.dataset = {}; this.listeners = {}; this.textContent = ''; this.innerHTML = ''; this.disabled = false; this.classList = {set: new Set(), add: c => this.classList.set.add(c), remove: c => this.classList.set.delete(c), toggle: (c, on) => on === undefined ? (this.classList.set.has(c) ? this.classList.set.delete(c) : this.classList.set.add(c)) : on ? this.classList.set.add(c) : this.classList.set.delete(c), contains: c => this.classList.set.has(c)}; }
    addEventListener(k, fn) { (this.listeners[k] ??= []).push(fn); }
    fire(k, e = {}) { for (const fn of this.listeners[k] || []) fn({preventDefault() {}, stopPropagation() {}, pointerId: 1, clientX: 0, clientY: 0, target: this, ...e}); }
    focus() {} blur() {} setAttribute(k, v) { this[k] = v; } setPointerCapture() {} querySelectorAll() { return []; }
    getBoundingClientRect() { return {left: 0, top: 0, width: 115, height: 115}; }
    getContext(kind) { return webgl || kind === '2d' ? new Proxy({createLinearGradient: () => ({addColorStop() {}}), createRadialGradient: () => ({addColorStop() {}})}, {get: (o, k) => k in o ? o[k] : () => { renders.draw2d++; }}) : null; }
    cloneNode() { return new Element(this.id); } replaceWith() {}
    get offsetWidth() { return 1; } get offsetParent() { return this.hidden ? null : {}; }
  }
  const els = {}, events = {}, docEvents = {}, stored = storage;

  if (webgl) THREE.WebGLRenderer = class { constructor() { this.shadowMap = {}; this.info = {render: {calls: 0, triangles: 0}}; this.pr = 1; } setPixelRatio(p) { this.pr = p; } getPixelRatio() { return this.pr; } setSize() {} render() { renders.count++; } getContext() { return {isContextLost: () => false}; } };
  else THREE.WebGLRenderer = class { constructor() { throw new Error('WebGL ist deaktiviert'); } };
  let frame = null;
  const context = {THREE, console, Math, Map, Set, JSON, Date, Array, Object, Number, String, Error, Proxy, Promise, URLSearchParams,
    performance: {now: () => 0}, innerWidth: width, innerHeight: height, devicePixelRatio: 2, location: {search: '?test', reload() {}},
    document: {hidden: false, activeElement: null, documentElement: {}, body: new Element('body'), getElementById: id => els[id] ??= new Element(id), addEventListener: (k, f) => docEvents[k] = f},
    localStorage: {getItem: k => k in stored ? stored[k] : null, setItem: (k, v) => { stored[k] = String(v); }},
    matchMedia: q => ({matches: coarse && q.includes('coarse')}), requestAnimationFrame: f => { frame = f; }, setTimeout: () => 0, addEventListener: (k, f) => events[k] = f};
  context.window = context; vm.createContext(context);
  for (const file of FILES) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename: file});
  const api = context.aeruTest;
  const h = {api, els, events, docEvents, stored, renders, context, THREE: T,
    snap: () => api.snapshot(),
    tick(n = 1) { for (let i = 0; i < n; i++) api.step(1 / 60); },
    key(code) { events.keydown({code, preventDefault() {}, repeat: false}); },
    up(code) { events.keyup({code}); },
    press(code, n = 1) { h.key(code); h.tick(n); h.up(code); },
    finish() { api.finishDialog(); },
    frame: () => frame};
  return h;
}
module.exports = {load, root};
