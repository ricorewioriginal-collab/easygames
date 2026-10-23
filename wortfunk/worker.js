/* Wortfunk – Computerzüge und Tipps im Hintergrund, damit die Oberfläche flüssig bleibt */
importScripts('js/logic.js');
let dict = null;
onmessage = e => {
  const d = e.data;
  if (d.init) { dict = WF.Dict(new Uint32Array(d.init)); postMessage({ ready: true }); return; }
  if (!dict) { postMessage({ id: d.id, move: null }); return; }
  postMessage({ id: d.id, move: WF.pick(d, dict) });
};
