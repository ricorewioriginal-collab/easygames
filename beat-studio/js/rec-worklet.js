/* Beat-Studio · Recording-Suite – Aufnahme-Abgriff (AudioWorklet): reicht die Mikrofon-Samples verlustfrei mit genauer Zeitmarke
 * (Sample-Nummer des Audio-Kontexts) an die Seite weiter, in Paketen zu 4096 Samples. Nachricht 'stop' schickt den Rest und beendet. */
class BSTap extends AudioWorkletProcessor {
  constructor() { super(); this.buf = null; this.n = 0; this.f0 = 0; this.on = true; this.port.onmessage = e => { if (e.data === 'stop') { this.flush(); this.on = false; this.port.postMessage('end'); } }; }
  flush() { if (this.buf && this.n) this.port.postMessage({ f: this.f0, d: this.buf.map(b => b.slice(0, this.n)) }); this.buf = null; this.n = 0; }
  process(inputs) {
    if (!this.on) return false; const inp = inputs[0];
    if (inp && inp.length && inp[0].length) {
      const ch = Math.min(2, inp.length), len = inp[0].length;
      if (!this.buf || this.buf.length !== ch) { this.flush(); this.buf = Array.from({ length: ch }, () => new Float32Array(4096)); this.f0 = currentFrame; this.n = 0; }
      for (let c = 0; c < ch; c++) this.buf[c].set(inp[c], this.n); this.n += len; if (this.n + len > 4096) this.flush();
    }
    return true;
  }
}
registerProcessor('bs-tap', BSTap);
