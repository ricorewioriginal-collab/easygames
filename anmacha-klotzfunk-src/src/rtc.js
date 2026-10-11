// WebRTC-Verbindung ohne eigenen Server: Einladung und Antwort werden als kurzer Text-Code ausgetauscht
// (kopieren und z. B. per Messenger schicken). Optional hilft ein öffentlicher STUN-Server beim Weg durch Router (NAT).
// Ohne STUN klappt die Verbindung meist nur im selben Netz (WLAN).
export const STUN = [{ urls: 'stun:stun.l.google.com:19302' }];
const PREFIX = 'KF1.';

// Kandidaten vollständig sammeln, damit ein einziger Code reicht (höchstens 5 s)
function gather(pc) {
  if (pc.iceGatheringState === 'complete') return Promise.resolve();
  return new Promise(res => {
    const t = setTimeout(res, 5000);
    pc.addEventListener('icegatheringstatechange', () => { if (pc.iceGatheringState === 'complete') { clearTimeout(t); res(); } });
  });
}

const b64 = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 8192) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64 = s => { const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/')); const out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out; };
async function through(bytes, stream) { return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer()); }

// Objekt → Code (gepackt, falls der Browser CompressionStream kann)
export async function pack(obj) {
  const raw = new TextEncoder().encode(JSON.stringify(obj));
  if (typeof CompressionStream !== 'undefined') return PREFIX + 'z' + b64(await through(raw, new CompressionStream('deflate-raw')));
  return PREFIX + 'j' + b64(raw);
}
export async function unpack(code) {
  const c = String(code || '').replace(/\s+/g, '');
  if (!c.startsWith(PREFIX)) throw new Error('Das ist kein KlotzFunk-Code');
  let bytes = unb64(c.slice(PREFIX.length + 1));
  if (c[PREFIX.length] === 'z') {
    if (typeof DecompressionStream === 'undefined') throw new Error('Dieser Browser kann den Code nicht entpacken');
    bytes = await through(bytes, new DecompressionStream('deflate-raw'));
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

// Gastgeber: Einladung erzeugen. accept(answerCode) verbindet; onChannel(dc) sobald der Kanal offen ist.
export async function createInvite(useStun, onChannel) {
  const pc = new RTCPeerConnection({ iceServers: useStun ? STUN : [] });
  const dc = pc.createDataChannel('klotzfunk', { ordered: true });
  dc.onopen = () => onChannel(dc, pc);
  await pc.setLocalDescription(await pc.createOffer());
  await gather(pc);
  const code = await pack({ t: 'o', sdp: pc.localDescription.sdp });
  return {
    pc, dc, code,
    async accept(answer) {
      const a = await unpack(answer);
      if (a.t !== 'a' || typeof a.sdp !== 'string') throw new Error('Das ist kein Antwort-Code');
      await pc.setRemoteDescription({ type: 'answer', sdp: a.sdp });
    }
  };
}

// Gast: Einladung lesen, Antwort-Code erzeugen; onChannel(dc) sobald verbunden
export async function answerInvite(invite, useStun, onChannel) {
  const o = await unpack(invite);
  if (o.t !== 'o' || typeof o.sdp !== 'string') throw new Error('Das ist kein Einladungs-Code');
  const pc = new RTCPeerConnection({ iceServers: useStun ? STUN : [] });
  pc.ondatachannel = e => { const dc = e.channel; if (dc.readyState === 'open') onChannel(dc, pc); else dc.onopen = () => onChannel(dc, pc); };
  await pc.setRemoteDescription({ type: 'offer', sdp: o.sdp });
  await pc.setLocalDescription(await pc.createAnswer());
  await gather(pc);
  return { pc, code: await pack({ t: 'a', sdp: pc.localDescription.sdp }) };
}
