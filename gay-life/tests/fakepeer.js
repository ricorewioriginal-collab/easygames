/* Test-Ersatz für PeerJS: gleiche Schnittstelle (Peer, connect, on('open'|'data'|'close'|'error'), send, close, destroy), aber die Nachrichten laufen
   über einen BroadcastChannel zwischen Seiten desselben Browsers. So lässt sich der echte Mehrspieler-Code ohne Vermittlungsserver mit mehreren Seiten prüfen. */
(function () {
  var bc = new BroadcastChannel('gl-fakepeer'), mine = {}, cnt = 0, SELF = Math.random().toString(36).slice(2);
  function Em() { this.h = {}; }
  Em.prototype.on = function (e, f) { (this.h[e] = this.h[e] || []).push(f); return this; };
  Em.prototype.emit = function (e, a) { (this.h[e] || []).slice().forEach(function (f) { try { f(a); } catch (x) { console.error(x); } }); };
  function Conn(peer, other, cid) { Em.call(this); this.peerObj = peer; this.peer = other; this.cid = cid; this.open = false; this.dead = false; }
  Conn.prototype = Object.create(Em.prototype);
  Conn.prototype.send = function (d) { if (!this.open) return; bc.postMessage({ k: 'data', to: this.peer, from: this.peerObj.id, cid: this.cid, d: JSON.parse(JSON.stringify(d)) }); };
  Conn.prototype.close = function () { if (this.dead) return; this.dead = true; this.open = false; bc.postMessage({ k: 'close', to: this.peer, from: this.peerObj.id, cid: this.cid }); this.emit('close'); };
  function Peer(id) {
    Em.call(this); var me = this; this.id = id || 'g' + Math.random().toString(36).slice(2, 8); this.conns = {}; this.destroyed = false; this.claiming = !!id;
    if (id) {
      this.onTaken = function (ev) { var m = ev.data; if (m.k === 'taken' && m.id === id && me.claiming) { me.claiming = false; me.destroyed = true; bc.removeEventListener('message', me.onTaken); me.emit('error', { type: 'unavailable-id' }); } };
      bc.addEventListener('message', this.onTaken);
    }
    setTimeout(function () {
      if (me.destroyed) return;
      if (id) { bc.postMessage({ k: 'claim', id: id }); setTimeout(function () { if (me.claiming && !me.destroyed) { me.claiming = false; mine[me.id] = me; me.emit('open', me.id); } }, 150); }
      else { mine[me.id] = me; me.emit('open', me.id); }
    }, 5);
  }
  Peer.prototype = Object.create(Em.prototype);
  Peer.prototype.connect = function (target) {
    var me = this, cid = SELF + (++cnt), c = new Conn(me, target, cid); me.conns[cid] = c;
    bc.postMessage({ k: 'conn', to: target, from: me.id, cid: cid });
    setTimeout(function () { if (!c.open && !c.dead) { c.dead = true; me.emit('error', { type: 'peer-unavailable' }); } }, 600);
    return c;
  };
  Peer.prototype.reconnect = function () {};
  Peer.prototype.destroy = function () { var me = this; me.destroyed = true; Object.keys(me.conns).forEach(function (k) { me.conns[k].close(); }); delete mine[me.id]; };
  bc.addEventListener('message', function (ev) {
    var m = ev.data, p;
    if (m.k === 'claim') { if (mine[m.id]) bc.postMessage({ k: 'taken', id: m.id }); return; }
    p = mine[m.to]; if (!p) return;
    if (m.k === 'conn') { var c = new Conn(p, m.from, m.cid); c.open = true; p.conns[m.cid] = c; bc.postMessage({ k: 'ack', to: m.from, from: p.id, cid: m.cid }); p.emit('connection', c); setTimeout(function () { c.emit('open'); }, 0); }
    else if (m.k === 'ack') { var c2 = p.conns[m.cid]; if (c2 && !c2.dead) { c2.open = true; c2.emit('open'); } }
    else if (m.k === 'data') { var c3 = p.conns[m.cid]; if (c3 && c3.open) c3.emit('data', m.d); }
    else if (m.k === 'close') { var c4 = p.conns[m.cid]; if (c4 && !c4.dead) { c4.dead = true; c4.open = false; c4.emit('close'); } }
  });
  window.Peer = Peer;
})();
