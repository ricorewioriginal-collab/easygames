'use strict';
/* Rounded, smooth-shaded character parts. World batches keep their existing art style.
   Geometry is merged into the same body/head/limb meshes: no per-eye draw calls. */
(function () {
  const T = THREE, cache = new Map(), matrix = new T.Matrix4(), normals = new T.Matrix3(),
    pos = new T.Vector3(), normal = new T.Vector3(), scale = new T.Vector3(), quat = new T.Quaternion(), euler = new T.Euler();
  function geometry(key, make) { if (!cache.has(key)) { const source = make(); const g = source.index ? source.toNonIndexed() : source; if (g !== source) source.dispose(); cache.set(key, g); } return cache.get(key); }
  BI.CharacterBatch = class extends BI.Batch {
    add(g, x, y, z, sx, sy, sz, color, rx = 0, ry = 0, rz = 0) {
      matrix.compose(pos.set(x, y, z), quat.setFromEuler(euler.set(rx, ry, rz, 'YXZ')), scale.set(sx, sy, sz)); normals.getNormalMatrix(matrix);
      const c = new T.Color(color), p = g.attributes.position, n = g.attributes.normal;
      for (let i = 0; i < p.count; i++) {
        pos.fromBufferAttribute(p, i).applyMatrix4(matrix); normal.fromBufferAttribute(n, i).applyMatrix3(normals).normalize();
        this.p.push(pos.x, pos.y, pos.z); this.n.push(normal.x, normal.y, normal.z); this.c.push(c.r, c.g, c.b);
      }
    }
    sph(x, y, z, r, c, detail = 1, sx = 1, sy = 1, sz = 1) {
      const small = detail === 0 || r < .08, w = small ? 8 : 16, h = small ? 6 : 10;
      this.add(geometry('sphere' + w, () => new T.SphereGeometry(1, w, h)), x, y, z, r * sx, r * sy, r * sz, c);
    }
    cyl(x, y, z, rt, rb, h, c, seg = 8, rx = 0, ry = 0, rz = 0) {
      seg = Math.max(10, seg); this.add(geometry(['c', rt, rb, seg].join(':'), () => new T.CylinderGeometry(rt, rb, 1, seg)), x, y + h / 2, z, 1, h, 1, c, rx, ry, rz);
    }
    box(x, y, z, w, h, d, c, ry = 0, rx = 0, rz = 0) {
      // Tiny badges stay flat. Major clothing forms get softened corners.
      const radius = Math.min(w, h, d) * .22;
      if (radius < .012) { super.box(x, y, z, w, h, d, c, ry, rx, rz); return; }
      const g = geometry(['round', w, h, d].join(':'), () => {
        const b = new T.BoxGeometry(w, h, d, 3, 3, 3), p = b.attributes.position, n = b.attributes.normal;
        const core = new T.Vector3(), v = new T.Vector3();
        for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); core.set(BI.clamp(v.x, -w/2+radius, w/2-radius), BI.clamp(v.y, -h/2+radius, h/2-radius), BI.clamp(v.z, -d/2+radius, d/2-radius)); v.sub(core).normalize(); n.setXYZ(i, v.x, v.y, v.z); v.multiplyScalar(radius).add(core); p.setXYZ(i, v.x, v.y, v.z); }
        return b;
      });
      this.add(g, x, y + h/2, z, 1, 1, 1, c, rx, ry, rz);
    }
    arc(cx, cy, cz, rx, ry, radius, color, start, end, segments = 10) {
      const points = []; for (let i = 0; i <= segments; i++) { const a = start + (end-start)*i/segments; points.push(new T.Vector3(cx+Math.cos(a)*rx, cy+Math.sin(a)*ry, cz)); }
      const g = new T.TubeGeometry(new T.CatmullRomCurve3(points), segments, radius, 5, false); const flat=g.toNonIndexed();this.add(flat,0,0,0,1,1,1,color);flat.dispose();g.dispose();
    }
    profile(x,y,z,points,depth,color){
      const key='profile:'+JSON.stringify(points);const g=geometry(key,()=>new T.LatheGeometry(points.map(p=>new T.Vector2(p[0],p[1])),16));this.add(g,x,y,z,1,1,depth,color);
    }
    scalp(x,y,z,rx,ry,rz,color) {
      // Upper hemisphere: hair never forms a solid ball in front of the face.
      this.add(geometry('scalp',()=>new T.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI*.52)),x,y,z,rx,ry,rz,color);
    }
  };
  BI.characterFace = function (b, o, skin, hair, faceScale, isJannis) {
    const color = (a,c,t)=>new T.Color(a).lerp(new T.Color(c),t).getHex();
    const surface=(x,y)=>.285*faceScale[2]*Math.sqrt(Math.max(.1,1-(x/(.285*faceScale[0]))**2-((y-1.42)/(.285*faceScale[1]))**2));
    const eye=o.eye==null?(isJannis?0x52759a:0x654b36):o.eye, expression=o.eyeS|0, lip=o.lip==null?color(skin,0x743c3a,.72):o.lip;
    const ey=1.458, ex=.105, eyeSize=expression===1?.058:.049;
    for(const sign of [-1,1]) {
      const x=sign*ex,z=surface(x,ey)+.008, sy=expression===2?.48:expression===3?.72:1.15;
      b.sph(x,ey,z,eyeSize,0xfffbef,0,1,sy,.37);
      b.sph(x,ey,z+.016,eyeSize*.67,eye,0,.9,sy,.32);
      b.sph(x,ey-.002,z+.024,eyeSize*.36,0x253449,0,.84,sy,.32);
      b.sph(x-.010,ey+.015,z+.031,.008,0xffffff,0,1,1,.45);
      if(expression===4)b.sph(x+.010,ey-.014,z+.030,.006,0xffffff,0,1,1,.5);
      const brow=o.brow==null?1:o.brow|0;
      if(brow)b.arc(x,1.502,surface(x,1.53)+.005,.058,.022,brow===2?.012:.008,color(hair,0x372c2d,.25),brow===3?.12:.15,Math.PI-.15,6);
      if(o.blush!==false)b.sph(sign*.161,1.369,surface(sign*.161,1.369)+.003,.045,color(skin,0xe8807d,.27),0,1,.53,.13);
      if(o.freckles)for(let j=0;j<3;j++){const fx=sign*(.13+j*.021),fy=1.39+(j%2)*.012;b.sph(fx,fy,surface(fx,fy)+.008,.006,color(skin,0x805238,.65),0,1,1,.45);}
    }
    const nose=[.029,.042,.031,.039][(o.nose|0)&3];b.sph(0,1.398,.288,nose,color(skin,0xd69a7b,.12),0,(o.nose|0)===3?1.3:1,.78,1);
    const mouth=o.mouth||'smile', mz=surface(0,1.326)+.01+((o.beard|0)>=5?.035:0);
    if(mouth==='smile'||mouth==='grin'||isJannis){b.arc(0,1.35,mz,mouth==='grin'?.081:.064,.032,.009,lip,Math.PI*1.08,Math.PI*1.92,10);if(mouth==='grin')b.sph(0,1.331,mz+.004,.05,0xfffbef,0,1,.20,.15);}
    else if(mouth==='open'||mouth==='tongue'){b.sph(0,1.328,mz,.043,0x763b3e,0,1,.8,.23);b.sph(.008,1.310,mz+.01,.024,0xe88e98,0,1,mouth==='tongue'?1:.45,.23);}
    else if(mouth==='pout')b.sph(0,1.326,mz,.027,lip,0,1,.6,.25);
    else if(mouth==='flat')b.box(0,1.322,mz,.095,.009,.008,lip);
    else if(mouth==='sad')b.arc(0,1.304,mz,.061,.024,.008,lip,.15,Math.PI-.15,8);
    if(o.wrink)for(const sign of [-1,1])b.arc(sign*.162,1.445,surface(sign*.162,1.445)+.004,.016,.02,.003,color(skin,0x8b6556,.25),Math.PI*1.1,Math.PI*1.8,4);
    if(o.scar)b.box(.166,1.39,surface(.166,1.42)+.01,.009,.055,.005,color(skin,0xa96664,.4),0,0,.35);
  };
  BI.characterHair = function(b,o,hair,isJannis){
    const st=isJannis?'bowl':o.style||'short', shade=new T.Color(hair).multiplyScalar(.85).getHex(), band=o.headband||o.clip||0xec8fa5;
    if(st==='bald'){for(const sign of [-1,1])b.sph(sign*.26,1.49,-.055,.07,hair,0,.5,1.4,1.8);return;}
    b.scalp(0,1.525,-.026,.302,.225,.29,hair);
    // Hair mass follows the back of the skull; the frontal eye region remains clear.
    b.sph(0,1.48,-.16,.235,hair,1,1.12,.86,.57);
    const lock=(x,y,z,r=.075,sx=1,sy=1,sz=1)=>b.sph(x,y,z,r,hair,0,sx,sy,sz);
    if(['long','wavy','bob','mullet'].includes(st)){
      b.box(0,st==='bob'?1.30:1.06,-.24,.49,st==='bob'?.33:.57,.11,hair);
      if(st!=='mullet')for(const sign of [-1,1]){lock(sign*.262,1.37,-.035,.087,.7,st==='bob'?1.9:3.3,1.5);if(st==='wavy')for(let j=0;j<3;j++)lock(sign*(.265+j*.006),1.32-j*.10,-.06,.073,.8,1.2,1.1);}
    }
    if(['bowl','fringe','short','bob','pixie','side','curtain','long','wavy'].includes(st)){
      for(let j=0;j<4;j++){const x=-.18+j*.12,y=(st==='side'||st==='pixie'?1.628-j*.015:1.605+Math.abs(x)*.05);lock(x,y,.166,.075,1.18,.6,.67);}
    }
    if(['curly','afro','shaggy'].includes(st)){const radius=st==='afro'?.325:.27;for(let j=0;j<10;j++){const a=j/10*Math.PI*2,x=Math.sin(a)*radius,z=Math.cos(a)*radius-.045;lock(x,z>.08?1.66:1.52+(j%2)*.065,z,.09,1,1,1);}if(st==='afro')for(let j=0;j<5;j++)lock((j-2)*.11,1.77,-.03,.09);}
    if(st==='spiky'||st==='mohawk')for(let j=0;j<5;j++){const x=st==='mohawk'?0:(j-2)*.075,z=st==='mohawk'?.15-j*.085:.02;b.cone(x,1.69,z,.07,.16+((j+1)%2)*.035,hair,6);}
    if(st==='bun'||st==='topknot')lock(0,st==='topknot'?1.82:1.72,st==='topknot'?-.05:-.19,.12,1,1,.95);
    if(st==='twinbuns')for(const sign of [-1,1]){lock(sign*.22,1.73,-.08,.115);b.sph(sign*.22,1.69,.013,.03,band,0);}
    if(st==='pig'||st==='braids')for(const sign of [-1,1]){const count=st==='braids'?5:3;for(let j=0;j<count;j++)lock(sign*(.30+.025*Math.sin(j*1.2)),1.51-j*.09,-.07,.077-j*.007,.85,1.2,1);b.sph(sign*.293,1.53,-.02,.035,band,0);}
    if(st==='ponytail'){lock(0,1.52,-.325,.095,.9,2,1);b.sph(0,1.67,-.30,.045,band,0);}
    if(st==='dreads')for(let j=0;j<8;j++){const a=.65+j/7*5.0,x=Math.sin(a)*.28,z=Math.cos(a)*-.27-.04;lock(x,1.43,z,.052,.85,3,1);}
    if(o.hair2!=null)for(const x of [-.1,.06])b.sph(x,1.721,.05,.027,o.hair2,0,.65,.4,3);
    // Subtle parting and separated locks add readability without a texture download.
    if(['short','side','pixie','bowl'].includes(st))b.arc(-.015,1.62,-.025,.11,.12,.008,shade,.15,Math.PI-.15,8);
  };
})();
