import{k as at,l as et,m as K,n as Xt,V as Z,B as Bt,o as Yt,e as Ot,p as qt,C as A,U as Qt,q as Zt,r as Vt,s as ot,t as Pt,u as Jt,v as te,N as ee,A as Wt,w as se,g as vt,M as O,I as jt,x as dt,O as Kt,y as St,z as At,J as oe,K as ie,j as yt,d as Mt,L as Q,i as Gt,W as Tt,X as ne,Y as ae,Z as le,_ as re,$ as ce,a as he,a0 as ue,a1 as fe,a2 as me,a3 as pe,R as de,h as ve,a4 as ge,H as we,D as xe}from"./engine-BUX5TC5o.js";import{A as F,a as ye,S as be}from"./types-BwFz-Uy_.js";import{G as Ae}from"./sim-BldkZ09O.js";function Ft(c,t=!1){const i=c[0].index!==null,r=new Set(Object.keys(c[0].attributes)),e=new Set(Object.keys(c[0].morphAttributes)),n={},o={},l=c[0].morphTargetsRelative,s=new at;let h=0;for(let a=0;a<c.length;++a){const f=c[a];let v=0;if(i!==(f.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const u in f.attributes){if(!r.has(u))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+'. All geometries must have compatible attributes; make sure "'+u+'" attribute exists among all geometries, or in none of them.'),null;n[u]===void 0&&(n[u]=[]),n[u].push(f.attributes[u]),v++}if(v!==r.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". Make sure all geometries have the same number of attributes."),null;if(l!==f.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const u in f.morphAttributes){if(!e.has(u))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+".  .morphAttributes must be consistent throughout all geometries."),null;o[u]===void 0&&(o[u]=[]),o[u].push(f.morphAttributes[u])}if(t){let u;if(i)u=f.index.count;else if(f.attributes.position!==void 0)u=f.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". The geometry must have either an index or a position attribute"),null;s.addGroup(h,u,a),h+=u}}if(i){let a=0;const f=[];for(let v=0;v<c.length;++v){const u=c[v].index;for(let d=0;d<u.count;++d)f.push(u.getX(d)+a);a+=c[v].attributes.position.count}s.setIndex(f)}for(const a in n){const f=Dt(n[a]);if(!f)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+a+" attribute."),null;s.setAttribute(a,f)}for(const a in o){const f=o[a][0].length;if(f===0)break;s.morphAttributes=s.morphAttributes||{},s.morphAttributes[a]=[];for(let v=0;v<f;++v){const u=[];for(let w=0;w<o[a].length;++w)u.push(o[a][w][v]);const d=Dt(u);if(!d)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+a+" morphAttribute."),null;s.morphAttributes[a].push(d)}}return s}function Dt(c){let t,i,r,e=-1,n=0;for(let h=0;h<c.length;++h){const a=c[h];if(t===void 0&&(t=a.array.constructor),t!==a.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(i===void 0&&(i=a.itemSize),i!==a.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(r===void 0&&(r=a.normalized),r!==a.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(e===-1&&(e=a.gpuType),e!==a.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;n+=a.count*i}const o=new t(n),l=new et(o,i,r);let s=0;for(let h=0;h<c.length;++h){const a=c[h];if(a.isInterleavedBufferAttribute){const f=s/i;for(let v=0,u=a.count;v<u;v++)for(let d=0;d<i;d++){const w=a.getComponent(v,d);l.setComponent(v+f,d,w)}}else o.set(a.array,s);s+=a.count*i}return e!==void 0&&(l.gpuType=e),l}function ut(c,t,i,r,e,n){const o=[];for(let s=0;s<=r;s++)o.push(c+i-i*Math.tan(Math.PI/4*(1-s/r)));for(let s=0;s<=r;s++)o.push(t-i+i*Math.tan(Math.PI/4*(s/r)));for(let s=1;s<n;s++)o.push(c+i+(t-c-2*i)*s/n);for(const s of e)s>c&&s<t&&o.push(s);o.sort((s,h)=>s-h);const l=[];for(const s of o)(l.length===0||s-l[l.length-1]>1e-4)&&l.push(s);return l}function $t(c,t,i,r,e){const n=c.map(u=>u+i),o=t.map(u=>u-i),l=[],s=[],h=[],a={cx:0,cy:0,cz:0,minY:0,maxY:0},f=(u,d,w)=>{const D=l[u*3],E=l[u*3+1],L=l[u*3+2],U=l[d*3],k=l[d*3+1],_=l[d*3+2],x=l[w*3],M=l[w*3+1],B=l[w*3+2];if(a.cx=(D+U+x)/3,a.cy=(E+k+M)/3,a.cz=(L+_+B)/3,a.minY=Math.min(E,k,M),a.maxY=Math.max(E,k,M),e&&!e(a))return;const H=U-D,T=k-E,G=_-L,I=x-D,g=M-E,C=B-L,b=T*C-G*g,S=G*I-H*C,y=H*g-T*I;if(b*b+S*S+y*y<1e-12)return;const z=s[u*3]+s[d*3]+s[w*3],m=s[u*3+1]+s[d*3+1]+s[w*3+1],p=s[u*3+2]+s[d*3+2]+s[w*3+2];b*z+S*m+y*p>=0?h.push(u,d,w):h.push(u,w,d)};for(let u=0;u<3;u++)for(let d=0;d<2;d++){const w=(u+1)%3,D=(u+2)%3,E=r[w],L=r[D],U=l.length/3,k=[0,0,0];for(let x=0;x<E.length;x++)for(let M=0;M<L.length;M++){k[u]=d?t[u]:c[u],k[w]=E[x],k[D]=L[M];const B=Math.min(Math.max(k[0],n[0]),o[0]),H=Math.min(Math.max(k[1],n[1]),o[1]),T=Math.min(Math.max(k[2],n[2]),o[2]);let G=k[0]-B,I=k[1]-H,g=k[2]-T;const C=Math.hypot(G,I,g)||1;G/=C,I/=C,g/=C,l.push(B+G*i,H+I*i,T+g*i),s.push(-G,-I,-g)}const _=L.length;for(let x=0;x<E.length-1;x++)for(let M=0;M<_-1;M++){const B=U+x*_+M,H=B+1,T=B+_,G=T+1;f(B,T,G),f(B,G,H)}}const v=new at;return v.setAttribute("position",new K(l,3)),v.setAttribute("normal",new K(s,3)),v.setIndex(h),v}class j{constructor(){this.pos=[],this.nor=[],this.col=[],this.uv=[],this.idx=[],this.nm=new Xt,this.v=new Z,this.unitBox=new Bt(1,1,1),this.tmp=new Yt,this.q=new Ot,this.e=new qt,this.s=new Z,this.t=new Z,this.c=new A}add(t,i,r,e){this.c.set(r),this.nm.getNormalMatrix(i);const n=t.getAttribute("position"),o=t.getAttribute("normal"),l=t.getAttribute("uv"),s=this.pos.length/3;for(let a=0;a<n.count;a++)this.v.fromBufferAttribute(n,a).applyMatrix4(i),this.pos.push(this.v.x,this.v.y,this.v.z),this.v.fromBufferAttribute(o,a).applyMatrix3(this.nm).normalize(),this.nor.push(this.v.x,this.v.y,this.v.z),this.col.push(this.c.r,this.c.g,this.c.b),e?this.uv.push(e[0],e[1]):this.uv.push(l?l.getX(a):0,l?l.getY(a):0);const h=t.getIndex();if(h)for(let a=0;a<h.count;a++)this.idx.push(s+h.getX(a));else for(let a=0;a<n.count;a++)this.idx.push(s+a)}box(t,i,r,e,n,o,l,s,h=0){this.e.set(0,h,0),this.q.setFromEuler(this.e),this.tmp.compose(this.t.set(t,i,r),this.q,this.s.set(e,n,o)),this.add(this.unitBox,this.tmp,l,s)}place(t,i,r,e,n,o,l,s,h,a){this.e.set(n,o,l),this.q.setFromEuler(this.e),typeof s=="number"?this.s.set(s,s,s):this.s.set(s[0],s[1],s[2]),this.tmp.compose(this.t.set(i,r,e),this.q,this.s),this.add(t,this.tmp,h,a)}get empty(){return this.pos.length===0}build(){const t=new at;return t.setAttribute("position",new K(this.pos,3)),t.setAttribute("normal",new K(this.nor,3)),t.setAttribute("color",new K(this.col,3)),t.setAttribute("uv",new K(this.uv,2)),t.setIndex(this.idx.length>65535?new Qt(this.idx,1):new Zt(this.idx,1)),this.unitBox.dispose(),t}}const X=[16742938,2803967],Me=[{id:"neon",name:"Neon-Metropole",blurb:"Synthwave-Nacht über der Stadt: Neonlinien, Glasdach und ein Gitter bis zum Horizont.",skyTop:196621,skyBottom:6952048},{id:"eis",name:"Eis-Dom",blurb:"Kühle Kuppel aus Kristall und Schnee, Polarlicht über dem Spielfeld.",skyTop:399418,skyBottom:11131125},{id:"canyon",name:"Glutschlucht",blurb:"Wüsten-Canyon bei Sonnenuntergang: orange Felsen, Staub und Fackeln.",skyTop:1905730,skyBottom:16752714}];function Se(c){switch(c){case"eis":return{skyTop:399418,skyMid:2054805,skyBottom:11131125,ground:13624564,fog:10274530,fogDensity:.0031,skySunDir:[.55,.32,-.78],skySunSize:.045,skySunCol:15399167,lightDir:[.35,1,.3],lightCol:15004671,lightIntensity:1.5,hemiSky:12575743,hemiGround:3824252,hemiIntensity:1.25,floorA:1783122,floorB:2311267,floorLine:15268095,floorGrid:7321830,lineA:7330047,lineB:13496831,glass:731722,glassAlpha:.1,padBig:16767034,padSmall:12910418,padOff:859184,stand:4881064,standTop:10473712,shirts:[9418972,3760522,14478584,1914197,6267864],mast:2770790,lamp:15268095,beam:12577023,beamAlpha:.06};case"canyon":return{skyTop:1905730,skyMid:11553338,skyBottom:16752714,ground:13203514,fog:14715974,fogDensity:.0021,skySunDir:[-.45,.1,-.88],skySunSize:.075,skySunCol:16766602,lightDir:[-.55,.85,-.45],lightCol:16757611,lightIntensity:1.7,hemiSky:16757898,hemiGround:5909018,hemiIntensity:1,floorA:3809815,floorB:4532251,floorLine:16770744,floorGrid:11034668,lineA:16751150,lineB:16765802,glass:3806728,glassAlpha:.12,padBig:16769597,padSmall:11992906,padOff:1838858,stand:8010274,standTop:12874555,shirts:[14262374,9062956,15850676,4858904,12085818],mast:4860444,lamp:16767392,beam:16761466,beamAlpha:.05};default:return{skyTop:196621,skyMid:1837637,skyBottom:6952048,ground:721952,fog:5903206,fogDensity:.0034,skySunDir:[-.35,.16,-.92],skySunSize:.1,skySunCol:16761405,lightDir:[.3,1,.2],lightCol:14206207,lightIntensity:1.35,hemiSky:11046143,hemiGround:2756672,hemiIntensity:1.25,floorA:987688,floorB:1382968,floorLine:16777215,floorGrid:4866216,lineA:16727464,lineB:3335935,glass:1313334,glassAlpha:.09,padBig:16769850,padSmall:12123978,padOff:724252,stand:1709880,standTop:3812984,shirts:[2763352,4860522,1842234,6961802,3033722],mast:2104392,lamp:15920383,beam:11832575,beamAlpha:.055}}}function Ce(c){return{uTime:{value:0},uBall:{value:new Z(0,5,0)},uFlash:{value:new Vt(0,0)},uPulse:{value:0},uPulseCol:{value:new A(1,1,1)},uCheer:{value:0},uFogCol:{value:new A(c.fog)},uFogD:{value:c.fogDensity},uT0:{value:new A(X[0])},uT1:{value:new A(X[1])},uScale:{value:600}}}const N=c=>({value:new A(c)}),J=`
uniform float uTime;
uniform vec3 uBall;
uniform vec2 uFlash;
uniform float uPulse;
uniform vec3 uPulseCol;
uniform float uCheer;
uniform vec3 uFogCol;
uniform float uFogD;
uniform vec3 uT0;
uniform vec3 uT1;
float hash11(float p){ p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash21(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float hash31(vec3 p3){ p3 = fract(p3 * .1031); p3 += dot(p3, p3.zyx + 31.32); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y); }
float fbm(vec2 p){ float a = 0.5; float s = 0.0; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p *= 2.03; a *= 0.5; } return s; }
vec3 fogMix(vec3 c, vec3 wp){ float d = distance(wp, cameraPosition); float f = 1.0 - exp(-uFogD * uFogD * d * d); return mix(c, uFogCol, f); }
float fogKeep(vec3 wp){ float d = distance(wp, cameraPosition); return exp(-uFogD * uFogD * d * d); }
`,Lt=`
float aa(float d, float w){ return 1.0 - smoothstep(w, w + fwidth(d) * 1.1 + 0.0005, d); }
float gridLine(float c, float sp, float w){ float d = abs(fract(c / sp + 0.5) - 0.5) * sp; return aa(d, w); }
float sdBox(vec2 p, vec2 b){ vec2 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0); }
`;function it(c,t){return{...c,...t}}function ze(c,t,i){const r=new Z(...t.skySunDir).normalize();return new ot({uniforms:it(c,{uTop:N(t.skyTop),uMid:N(t.skyMid),uBot:N(t.skyBottom),uSunCol:N(t.skySunCol),uSunDir:{value:r},uSunSize:{value:t.skySunSize},uMode:{value:i}}),side:se,depthWrite:!1,vertexShader:`
      varying vec3 vDir;
      void main(){
        vDir = normalize(position);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_Position.z = gl_Position.w * 0.99995; // immer ganz hinten, unabhängig von der Kamera-Ferne
      }`,fragmentShader:`
      ${J}
      varying vec3 vDir;
      uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uBot; uniform vec3 uSunCol; uniform vec3 uSunDir;
      uniform float uSunSize; uniform float uMode;
      void main(){
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 c = mix(uBot, uMid, smoothstep(0.0, 0.3, h));
        c = mix(c, uTop, smoothstep(0.2, 0.9, h));
        c = mix(c, uBot * 0.6, smoothstep(0.0, -0.3, h));
        float ang = acos(clamp(dot(d, uSunDir), -1.0, 1.0));
        float halo = exp(-ang * ang / (2.0 * 0.2 * 0.2));
        float hs = uMode < 0.5 ? 0.45 : (uMode < 1.5 ? 0.18 : 0.7);
        c += uSunCol * halo * hs * smoothstep(-0.1, 0.1, h + 0.1);
        float disc = 1.0 - smoothstep(uSunSize - 0.004, uSunSize, ang);
        vec3 sunC = uSunCol;
        if (uMode < 0.5) {
          // Synthwave-Sonne: Farbverlauf und waagrechte Lücken, nach unten breiter
          float t = clamp((uSunDir.y - d.y) / uSunSize, -1.0, 1.0);
          sunC = mix(uSunCol, vec3(1.0, 0.08, 0.45), clamp(t * 0.5 + 0.5, 0.0, 1.0));
          float k = fract(t * 5.0);
          float gap = 0.1 + 0.55 * clamp(t, 0.0, 1.0);
          disc *= mix(1.0, step(gap, k), step(0.12, t));
        }
        c = mix(c, sunC * 1.4, disc);
        // Sterne (Neon, Eis)
        if (uMode < 1.5) {
          vec3 sp = d * 110.0;
          vec3 cell = floor(sp);
          float hv = hash31(cell);
          vec3 f = fract(sp) - 0.5;
          float st = step(0.985, hv) * (1.0 - smoothstep(0.0, 0.32, length(f)));
          st *= 0.55 + 0.45 * sin(uTime * (1.5 + hv * 4.0) + hv * 90.0);
          c += vec3(0.85, 0.9, 1.0) * st * smoothstep(0.06, 0.35, h) * (uMode < 0.5 ? 1.2 : 0.7);
        }
        if (uMode < 0.5) {
          c += vec3(1.0, 0.12, 0.6) * exp(-max(h, 0.0) * 12.0) * 0.28 * step(-0.05, h);
        } else if (uMode < 1.5) {
          // Polarlicht
          float band = smoothstep(0.12, 0.4, h) * (1.0 - smoothstep(0.55, 0.95, h));
          float az = atan(d.z, d.x);
          float w = sin(az * 3.0 + uTime * 0.15 + sin(h * 9.0 + uTime * 0.25) * 1.6) * 0.5 + 0.5;
          float w2 = sin(az * 5.0 - uTime * 0.1 + h * 6.0) * 0.5 + 0.5;
          float a = pow(w, 3.0) * (0.5 + 0.5 * w2) * band;
          vec3 ac = mix(vec3(0.1, 1.0, 0.55), vec3(0.45, 0.35, 1.0), smoothstep(0.25, 0.8, h));
          c += ac * a * 0.8;
        } else {
          // Wolkenbänder im Abendlicht
          vec2 cp = d.xz / (abs(d.y) + 0.12) * 0.9;
          float cl = smoothstep(0.52, 0.82, fbm(cp + vec2(uTime * 0.01, 0.0)));
          cl *= smoothstep(0.02, 0.18, h) * (1.0 - smoothstep(0.35, 0.8, h));
          vec3 cc = mix(vec3(0.95, 0.35, 0.28), vec3(1.0, 0.75, 0.45), exp(-ang * 1.4));
          c = mix(c, cc, cl * 0.7);
        }
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`})}function Te(c,t,i){return new ot({uniforms:it(c,{uGround:N(t.ground),uLineA:N(t.lineA),uLineB:N(t.lineB),uMode:{value:i}}),vertexShader:`
      varying vec3 vW;
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,fragmentShader:`
      ${J}${Lt}
      varying vec3 vW;
      uniform vec3 uGround; uniform vec3 uLineA; uniform vec3 uLineB; uniform float uMode;
      void main(){
        vec2 p = vW.xz;
        float dist = length(p);
        vec3 c = uGround;
        if (uMode < 0.5) {
          // Synthwave-Gitter bis zum Horizont
          float g1 = max(gridLine(p.x, 12.0, 0.09 + dist * 0.0009), gridLine(p.y, 12.0, 0.09 + dist * 0.0009));
          float g2 = max(gridLine(p.x, 60.0, 0.2 + dist * 0.002), gridLine(p.y, 60.0, 0.2 + dist * 0.002));
          vec3 lc = mix(uLineA, uLineB, smoothstep(-80.0, 80.0, p.x));
          c += lc * (g1 * 0.55 + g2 * 0.9) * exp(-dist * 0.0022);
          c += uLineA * 0.05 * exp(-dist * 0.006);
        } else if (uMode < 1.5) {
          // Schnee mit Glitzern
          float n = fbm(p * 0.04) * 0.35 + fbm(p * 0.3) * 0.12;
          c = uGround * (0.55 + n);
          vec2 cell = floor(p * 3.0);
          float h = hash21(cell);
          float sp = step(0.985, h) * (0.5 + 0.5 * sin(uTime * 2.0 + h * 80.0));
          c += vec3(1.0) * sp * exp(-dist * 0.004) * 0.7;
        } else {
          // Sand mit Dünenrillen
          float n = fbm(p * 0.02);
          float rip = sin((p.x * 0.12 + n * 14.0) + p.y * 0.05) * 0.5 + 0.5;
          c = mix(uGround * 0.55, uGround * 1.05, n * 0.7 + rip * 0.3);
          c += uLineB * 0.05 * hash21(floor(p * 2.0)) ;
        }
        c = fogMix(c, vW);
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`})}function ke(c,t){return new ot({uniforms:it(c,{uColA:N(t.lineA),uColB:N(t.lineB),uGlass:N(t.glass),uFloor:N(t.floorB),uAlpha:{value:t.glassAlpha},uHalf:{value:new Z(F.halfWidth,F.height,F.halfLength)},uGoalTop:{value:F.goalHeight}}),transparent:!0,depthWrite:!1,side:Pt,vertexShader:`
      varying vec3 vW; varying vec3 vN;
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = mat3(modelMatrix) * normal; gl_Position = projectionMatrix * viewMatrix * w; }`,fragmentShader:`
      ${J}${Lt}
      varying vec3 vW; varying vec3 vN;
      uniform vec3 uColA; uniform vec3 uColB; uniform vec3 uGlass; uniform vec3 uFloor; uniform float uAlpha; uniform vec3 uHalf; uniform float uGoalTop;
      void main(){
        vec3 N = normalize(vN);
        vec3 V = normalize(cameraPosition - vW);
        float ndv = abs(dot(N, V));
        float fres = pow(1.0 - ndv, 3.0);
        float roof = smoothstep(-0.45, -0.85, N.y);
        float horiz = abs(N.x) > abs(N.z) ? vW.z : vW.x;
        vec2 gp = mix(vec2(horiz, vW.y), vW.xz, step(0.6, abs(N.y)));
        float mn = max(gridLine(gp.x, 5.0, 0.022), gridLine(gp.y, 5.0, 0.022));
        float mj = max(gridLine(gp.x, 20.0, 0.07), gridLine(gp.y, 20.0, 0.07));
        float band = aa(abs(vW.y - uGoalTop), 0.09) + aa(abs(vW.y - (uHalf.y - 0.6)), 0.07) * 0.7;
        band *= 1.0 - roof;
        vec3 lineC = mix(uColA, uColB, 0.5 + 0.5 * sin(gp.x * 0.045 + 1.3));
        float side = smoothstep(uHalf.z * 0.55, uHalf.z, abs(vW.z));
        vec3 tc = vW.z < 0.0 ? uT0 : uT1;
        lineC = mix(lineC, tc, side * (1.0 - roof) * 0.85);
        float pul = 0.5 + 0.5 * sin(gp.x * 0.14 - gp.y * 0.11 - uTime * 1.3);
        float e = mn * (0.35 + 0.9 * pow(pul, 3.0)) + mj * 1.0 + band * 1.5;
        float foot = exp(-vW.y * 0.55);
        float db = distance(vW, uBall);
        float bg = exp(-db * db / 110.0);
        float fz = (vW.z < 0.0 ? uFlash.x : uFlash.y) * smoothstep(uHalf.z * 0.25, uHalf.z, abs(vW.z));
        vec3 fcol = vW.z < 0.0 ? uT1 : uT0;
        vec3 c = uGlass * 1.5;
        c += lineC * e * (1.0 - 0.55 * roof);
        c += lineC * (fres * 0.55 + foot * 0.45);
        c += mix(lineC, vec3(1.0), 0.5) * bg * 0.65;
        c += fcol * fz * 0.95 + vec3(fz * 0.05);
        c += uPulseCol * uPulse * (0.1 + e * 0.6);
        float a = uAlpha * (1.0 - 0.45 * roof) + clamp(e, 0.0, 1.0) * 0.75 + fres * 0.38 + foot * 0.2 + bg * 0.3 + fz * 0.35 + uPulse * 0.1;
        // Der untere Rundungsbogen setzt den Boden fort (undurchsichtig, damit man dort den Ball gut sieht)
        float cv = smoothstep(0.12, 0.55, N.y) * (1.0 - roof);
        c += uFloor * 1.5 * cv;
        a = mix(a, max(a, 0.94), cv);
        gl_FragColor = vec4(c, clamp(a, 0.0, 0.97));
        #include <colorspace_fragment>
      }`})}function Be(c,t){const i=new Jt({color:16777215}),r={uFloorA:N(t.floorA),uFloorB:N(t.floorB),uLineCol:N(t.floorLine),uGridCol:N(t.floorGrid),uColA:N(t.lineA),uSkyGlow:N(t.skyBottom)},e=`
    varying vec3 vFW;
    uniform float uTime; uniform vec3 uBall; uniform vec2 uFlash; uniform float uPulse; uniform vec3 uPulseCol;
    uniform vec3 uT0; uniform vec3 uT1;
    uniform vec3 uFloorA; uniform vec3 uFloorB; uniform vec3 uLineCol; uniform vec3 uGridCol; uniform vec3 uColA; uniform vec3 uSkyGlow;
    ${Lt}
    vec3 floorColor(vec3 p, out vec3 glow){
      vec2 q = p.xz;
      float az = abs(q.y);
      float ax = abs(q.x);
      vec3 tint = q.y < 0.0 ? uT0 : uT1;
      vec2 tile = floor(q / 10.0);
      vec3 base = mix(uFloorA, uFloorB, mod(tile.x + tile.y, 2.0));
      base = mix(base, base * 0.7 + tint * 0.07, smoothstep(14.0, 50.0, az));
      glow = vec3(0.0);
      float g = max(gridLine(q.x, 5.0, 0.02), gridLine(q.y, 5.0, 0.02));
      float g2 = max(gridLine(q.x, 10.0, 0.035), gridLine(q.y, 10.0, 0.035));
      glow += uGridCol * (g * 0.22 + g2 * 0.5);
      float wl = 0.12;
      float lm = max(max(aa(abs(q.y), wl), aa(abs(length(q) - 10.0), wl)), 1.0 - smoothstep(0.5, 0.7, length(q)));
      float pen = aa(abs(sdBox(vec2(q.x, az - 37.0), vec2(20.0, 13.0))), wl);
      float gar = aa(abs(sdBox(vec2(q.x, az - 44.0), vec2(12.0, 6.0))), wl);
      float gl = aa(abs(az - 50.0), 0.3) * step(ax, 8.3);
      glow += uLineCol * lm * 1.1 + mix(uLineCol, tint, 0.75) * max(pen, gar) * 1.1 + tint * gl * 2.4;
      float ex = 34.0 - ax;
      float ez = 44.0 - az;
      float e = min(ex, mix(1000.0, ez, smoothstep(7.0, 12.0, ax)));
      float edge = exp(-max(e, 0.0) * 0.5);
      glow += mix(uColA, tint, smoothstep(30.0, 46.0, az) * 0.7) * edge * 0.4;
      float bd = distance(q, uBall.xz);
      float pool = exp(-bd * bd / 70.0) / (1.0 + uBall.y * 0.15);
      glow += (uColA * 0.5 + vec3(0.5)) * pool * 0.5;
      vec3 V = normalize(cameraPosition - p);
      float fr = pow(1.0 - clamp(V.y, 0.0, 1.0), 3.0);
      glow += uSkyGlow * fr * 0.3 * (0.6 + edge);
      glow += uPulseCol * uPulse * (0.05 + 0.3 * g2 + 0.2 * edge);
      float fl = q.y < 0.0 ? uFlash.x : uFlash.y;
      glow += (q.y < 0.0 ? uT1 : uT0) * fl * smoothstep(10.0, 50.0, az) * 0.55;
      return base;
    }`;return i.customProgramCacheKey=()=>"tk-floor-v1",i.onBeforeCompile=n=>{Object.assign(n.uniforms,{uTime:c.uTime,uBall:c.uBall,uFlash:c.uFlash,uPulse:c.uPulse,uPulseCol:c.uPulseCol,uT0:c.uT0,uT1:c.uT1,...r}),n.vertexShader=n.vertexShader.replace("#include <common>",`#include <common>
varying vec3 vFW;`).replace("#include <project_vertex>",`#include <project_vertex>
vFW = (modelMatrix * vec4(transformed, 1.0)).xyz;`),n.fragmentShader=n.fragmentShader.replace("#include <common>",`#include <common>
`+e).replace("#include <color_fragment>",`#include <color_fragment>
vec3 floorGlow; diffuseColor.rgb = floorColor(vFW, floorGlow);`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
totalEmissiveRadiance += floorGlow;`)},i}function Ge(c){return new ot({uniforms:it(c,{}),transparent:!0,depthWrite:!1,side:Pt,vertexShader:`
      varying vec3 vW; varying vec3 vN;
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = mat3(modelMatrix) * normal; gl_Position = projectionMatrix * viewMatrix * w; }`,fragmentShader:`
      ${J}
      varying vec3 vW; varying vec3 vN;
      void main(){
        vec3 N = normalize(vN);
        vec2 g = abs(N.z) > 0.6 ? vW.xy : (abs(N.x) > 0.6 ? vW.zy : vW.xz);
        vec2 r = vec2(g.x + g.y, g.x - g.y) / 0.9;
        vec2 f = abs(fract(r) - 0.5);
        vec2 w = fwidth(r) * 1.2;
        float d = min(0.5 - f.x, 0.5 - f.y);
        float net = 1.0 - smoothstep(0.035, 0.035 + max(w.x, w.y) + 0.01, d);
        net = mix(net, 0.3, smoothstep(0.2, 0.55, max(w.x, w.y)));
        bool neg = vW.z < 0.0;
        vec3 tc = neg ? uT0 : uT1;
        float depth = clamp((abs(vW.z) - 50.0) / 8.0, 0.0, 1.0);
        float fl = neg ? uFlash.x : uFlash.y;
        vec3 sc = neg ? uT1 : uT0;
        vec3 c = vec3(0.01, 0.015, 0.03) + tc * (0.1 + 0.4 * depth);
        c += mix(tc, vec3(1.0), 0.45) * net * (0.55 + 0.6 * depth);
        c += sc * fl * (0.25 + net * 0.9);
        c += uPulseCol * uPulse * net * 0.6;
        float a = 0.3 + net * 0.62 + depth * 0.15 + fl * 0.4;
        gl_FragColor = vec4(c, clamp(a, 0.0, 0.97));
        #include <colorspace_fragment>
      }`})}function ft(c,t,i=1,r=1){return new ot({uniforms:it(c,{uGain:{value:i},uAlpha:{value:r}}),transparent:t!==0,depthWrite:t===0,blending:t===0?ee:Wt,side:t===1?Pt:te,defines:{MODE:t},vertexShader:`
      attribute vec3 color;
      varying vec3 vC; varying vec2 vUv; varying vec3 vW; varying vec3 vN;
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vC = color; vUv = uv; vN = mat3(modelMatrix) * normal; gl_Position = projectionMatrix * viewMatrix * w; }`,fragmentShader:`
      ${J}
      uniform float uGain; uniform float uAlpha;
      varying vec3 vC; varying vec2 vUv; varying vec3 vW; varying vec3 vN;
      void main(){
        float fl = vW.z < 0.0 ? uFlash.x : uFlash.y;
        vec3 c = vC * uGain * (1.0 + 0.6 * fl) + vec3(fl * 0.12) + uPulseCol * uPulse * 0.22;
        float a = 1.0;
        #if MODE == 1
          vec3 V = normalize(cameraPosition - vW);
          float soft = pow(abs(dot(normalize(vN), V)), 1.4);
          a = uAlpha * pow(clamp(vUv.y, 0.0, 1.0), 2.0) * soft * (0.8 + 0.2 * sin(uTime * 0.7 + vW.x * 0.1)) * (1.0 + fl * 2.0 + uCheer);
          c *= a;
          a = 1.0;
        #elif MODE == 2
          c *= uAlpha;
        #endif
        c *= fogKeep(vW);
        gl_FragColor = vec4(c, a);
        #include <colorspace_fragment>
      }`})}function bt(c,t,i){const r=new Z(...t.lightDir).normalize();return new ot({uniforms:it(c,{uSunDir:{value:r},uSunCol:N(t.lightCol),uAmb:N(t.hemiSky),uAccent:N(t.lineA),uAccent2:N(t.lineB),uMode:{value:i}}),vertexShader:`
      attribute vec3 color;
      varying vec3 vC; varying vec3 vN; varying vec3 vW; varying vec2 vUv;
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vC = color; vUv = uv; vN = mat3(modelMatrix) * normal; gl_Position = projectionMatrix * viewMatrix * w; }`,fragmentShader:`
      ${J}
      varying vec3 vC; varying vec3 vN; varying vec3 vW; varying vec2 vUv;
      uniform vec3 uSunDir; uniform vec3 uSunCol; uniform vec3 uAmb; uniform vec3 uAccent; uniform vec3 uAccent2; uniform float uMode;
      void main(){
        vec3 N = normalize(vN);
        vec3 V = normalize(cameraPosition - vW);
        float ndl = max(dot(N, uSunDir), 0.0);
        float rim = pow(1.0 - abs(dot(N, V)), 3.0);
        vec3 lit = uAmb * (0.35 + 0.25 * N.y) + uSunCol * ndl * 0.55;
        vec3 c = vC * lit;
        vec3 em = vec3(0.0);
        if (uMode < 0.5) {
          if (abs(N.y) < 0.5) {
            vec2 gp = abs(N.x) > abs(N.z) ? vec2(vW.z, vW.y) : vec2(vW.x, vW.y);
            vec2 cs = vec2(2.6, 3.6);
            vec2 cell = floor(gp / cs);
            vec2 f = fract(gp / cs);
            float h = hash21(cell + vUv.x * 17.0);
            float win = step(0.2, f.x) * step(f.x, 0.8) * step(0.3, f.y) * step(f.y, 0.78);
            float on = step(0.6, h) * win;
            vec3 wc = h > 0.92 ? uAccent : (h > 0.82 ? uAccent2 : vec3(1.0, 0.72, 0.38));
            em += wc * on * 0.9 * (0.75 + 0.25 * sin(uTime * 0.6 + h * 50.0));
            float top = vUv.y - vW.y;
            em += mix(uAccent, uAccent2, step(0.5, hash11(vUv.x))) * (1.0 - smoothstep(0.0, 0.8, top)) * step(0.0, top) * 1.6;
          }
        } else if (uMode < 1.5) {
          c = vC * (0.35 + 0.9 * ndl) + uAmb * 0.1;
          em += uAccent * rim * 0.9 + uAccent2 * pow(rim, 2.0) * 0.5;
          float sp = pow(max(dot(reflect(-V, N), uSunDir), 0.0), 18.0);
          em += uSunCol * sp * 1.4;
          em += uAccent * 0.1 * smoothstep(0.0, 60.0, vW.y);
        } else if (uMode < 2.5) {
          float b = vW.y * 0.2 + vnoise(vW.xz * 0.04) * 2.5;
          float s = floor(b);
          c *= mix(0.6, 1.2, hash11(s)) * (0.88 + 0.2 * step(0.5, fract(b)));
          c *= 0.7 + 0.5 * fbm(vW.xz * 0.15 + vW.y * 0.1);
          c += uAccent * pow(max(dot(N, uSunDir), 0.0), 2.0) * 0.12 * vC;
          em += uAccent * rim * 0.12;
        } else {
          c += vC * rim * 0.25;
        }
        c = fogMix(c + em, vW);
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`})}function Fe(c,t){return new ot({uniforms:it(c,{uAmb:N(t.hemiSky),uAccent:N(t.lineA)}),vertexShader:`
      ${J}
      varying vec3 vC; varying vec3 vN; varying vec3 vW;
      void main(){
        vec3 base = vec3(instanceMatrix[3]);
        float ph = hash21(base.xz * 1.37 + base.y);
        float bob = 0.012 * sin(uTime * 1.6 + ph * 30.0) + uCheer * 0.38 * abs(sin(uTime * (5.0 + ph * 3.5) + ph * 40.0));
        vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0);
        w.y += bob * (0.4 + 0.6 * ph);
        vW = w.xyz;
        vec3 skin = mix(vec3(0.55, 0.38, 0.28), vec3(0.9, 0.7, 0.55), fract(ph * 7.0));
        float head = uv.x;
        vec3 shirt = instanceColor * (1.0 + uCheer * 0.5 * step(0.5, fract(ph * 5.0)));
        vC = mix(shirt, skin * 0.55, head);
        vN = normalize(mat3(instanceMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,fragmentShader:`
      ${J}
      varying vec3 vC; varying vec3 vN; varying vec3 vW;
      uniform vec3 uAmb;
      void main(){
        vec3 N = normalize(vN);
        float l = 0.45 + 0.35 * N.y + 0.2 * max(dot(N, normalize(vec3(0.0, 0.3, 1.0) * sign(-vW.z + 0.001))), 0.0);
        float near = 1.0 / (1.0 + length(vW.xz) * 0.006);
        vec3 c = vC * uAmb * l * (0.75 + near) * 1.1;
        c = fogMix(c, vW);
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`})}function Ct(c,t={}){return new ot({uniforms:it(c,{uAlpha:{value:t.alpha??1}}),transparent:!0,depthWrite:!1,blending:Wt,defines:{BLINK:t.blink?1:0,FLICKER:t.flicker?1:0},vertexShader:`
      ${J}
      attribute vec3 color; attribute float size; attribute float phase;
      uniform float uScale;
      varying vec3 vC; varying vec3 vW;
      void main(){
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        vec4 mv = viewMatrix * w;
        float k = 1.0;
        #if BLINK
          k = 0.25 + 0.75 * pow(0.5 + 0.5 * sin(uTime * (1.2 + phase * 2.0 + uCheer * 6.0) + phase * 60.0), 2.0);
          k *= 1.0 + uCheer * 1.5;
        #endif
        #if FLICKER
          k = 0.7 + 0.3 * sin(uTime * (9.0 + phase * 7.0) + phase * 50.0) + 0.15 * sin(uTime * 23.0 + phase * 90.0);
        #endif
        vC = color * k;
        gl_Position = projectionMatrix * mv;
        gl_PointSize = clamp(size * uScale / max(-mv.z, 0.1), 0.0, 96.0);
      }`,fragmentShader:`
      ${J}
      uniform float uAlpha;
      varying vec3 vC; varying vec3 vW;
      void main(){
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float a = pow(max(1.0 - d, 0.0), 1.7);
        vec3 c = vC * a * uAlpha * fogKeep(vW);
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`})}function zt(c,t){const i=new Vt;c.onBeforeRender=(r,e,n)=>{r.getDrawingBufferSize(i),t.uScale.value=i.y*.5*n.projectionMatrix.elements[5]}}const kt=10,Et=8,$=1.25,Ut=.9;class Pe{constructor(t,i,r,e){this.group=new vt,this.geos=[],this.mats=[],this.crowd=null,this.persons=0;const n=F.halfWidth,o=F.halfLength,l=F.goalDepth,s=o+l+2,h=n+3.5+kt*$+1,a=new j,f=new j,v=new A(i.stand),u=new A(i.standTop),d=new A(i.lineA),w=new A(i.lineB),D=[];for(const m of[-1,1]){for(let p=0;p<kt;p++){const P=n+3.5+p*$,W=m*(P+$/2),R=1+p*Ut;a.box(W,(R-1)/2,0,$,R+1,s*2,v),a.box(W-m*($/2-.06),R+.02,0,.12,.05,s*2,u),p%3===1&&f.box(W-m*($/2+.01),R-.25,0,.05,.12,s*2-2,p%2?d:w);const tt=Math.floor((s*2-2)/1.1);for(let Y=0;Y<tt;Y++)D.push({x:W+e.float(-.12,.12),y:R,z:-s+1+Y*1.1+p%2*.55+e.float(-.12,.12),end:!1})}a.box(m*(n+3.5+kt*$+.5),5.5,0,1,13,s*2+12,v.clone().multiplyScalar(.7));for(let p=-s+3;p<s-2;p+=6)f.box(m*(n+2.6),.75,p,.12,1.2,5.4,(p+s)/6%2<1?d:w),a.box(m*(n+2.75),.45,p,.5,1.2,5.6,new A(329228))}for(const m of[-1,1]){for(let p=0;p<Et;p++){const P=o+l+3.5+p*$,W=m*(P+$/2),R=1+p*Ut;a.box(0,(R-1)/2,W,h*2,R+1,$,v),a.box(0,R+.02,W-m*($/2-.06),h*2,.05,.12,u),p%3===1&&f.box(0,R-.25,W-m*($/2+.01),h*2-2,.12,.05,p%2?d:w);const tt=Math.floor((h*2-2)/1.1);for(let Y=0;Y<tt;Y++)D.push({x:-h+1+Y*1.1+p%2*.55+e.float(-.12,.12),y:R,z:W+e.float(-.12,.12),end:!0})}a.box(0,5.5,m*(o+l+3.5+Et*$+.5),h*2+6,13,1,v.clone().multiplyScalar(.7)),f.box(0,.75,m*(o+2.6),.12+32,1.2,.12,m<0?new A(X[0]):new A(X[1]))}const E=a.build(),L=f.build();this.geos.push(E,L);const U=bt(t,i,3),k=ft(t,0,1.1);this.mats.push(U,k),this.group.add(new O(E,U),new O(L,k));const _=.35+.6*Math.min(1,Math.max(0,r)),x=D.filter(()=>e.chance(_));this.persons=x.length;const M=new j;M.box(0,.45,0,.46,.8,.3,new A(1,1,1),[0,0]),M.place(new jt(.17,0),0,1.02,0,0,0,0,1,new A(1,1,1),[1,0]);const B=M.build();this.geos.push(B);const H=Fe(t,i);this.mats.push(H);const T=new dt(B,H,Math.max(1,x.length));T.count=x.length,T.frustumCulled=!1;const G=new Kt,I=new A,g=new A(X[0]),C=new A(X[1]),b=[],S=[],y=[],z=[];if(x.forEach((m,p)=>{G.position.set(m.x,m.y,m.z),G.rotation.set(0,e.float(-.5,.5),0);const P=e.float(.92,1.12);G.scale.set(e.float(.9,1.1),P,1),G.updateMatrix(),T.setMatrixAt(p,G.matrix);const W=m.end?.55:.2+.5*Math.min(1,Math.abs(m.z)/s);if(e.chance(W)?I.copy(m.z<0?g:C).multiplyScalar(e.float(.35,.85)):I.setHex(e.pick(i.shirts)).multiplyScalar(e.float(.7,1.3)),T.setColorAt(p,I),e.chance(.13)){b.push(m.x,m.y+1.45,m.z);const R=e.chance(.55)?m.z<0?g:C:I.setHex(16777215);S.push(R.r*1.4,R.g*1.4,R.b*1.4),y.push(e.float(.28,.5)),z.push(e.next())}}),T.instanceMatrix.needsUpdate=!0,T.instanceColor&&(T.instanceColor.needsUpdate=!0),this.crowd=T,this.group.add(T),b.length){const m=new at;m.setAttribute("position",new K(b,3)),m.setAttribute("color",new K(S,3)),m.setAttribute("size",new K(y,1)),m.setAttribute("phase",new K(z,1)),this.geos.push(m);const p=Ct(t,{blink:!0,alpha:1});this.mats.push(p);const P=new St(m,p);P.frustumCulled=!1,zt(P,t),this.group.add(P)}}dispose(){this.crowd?.dispose();for(const t of this.geos)t.dispose();for(const t of this.mats)t.dispose();this.group.removeFromParent()}}const lt=130,rt=140,wt=48;class We{constructor(t,i,r,e){this.t=0,this.kind=t==="eis"?1:t==="canyon"?2:0;const o=Math.max(0,Math.floor((t==="eis"?900:t==="canyon"?520:420)*(.3+.7*Math.min(1,Math.max(0,r)))));this.n=o,this.pos=new Float32Array(o*3),this.vel=new Float32Array(o*3),this.ph=new Float32Array(o);const l=new Float32Array(o*3),s=new Float32Array(o),h=new A;for(let a=0;a<o;a++)this.pos[a*3]=e.float(-lt,lt),this.pos[a*3+1]=e.float(0,wt),this.pos[a*3+2]=e.float(-rt,rt),this.ph[a]=e.next(),this.kind===1?(this.vel.set([e.float(-.4,.4),e.float(-2.6,-1.1),e.float(-.4,.4)],a*3),s[a]=e.float(.14,.3),h.setRGB(.9,.95,1).multiplyScalar(e.float(.5,.9))):this.kind===2?(this.vel.set([e.float(2,5),e.float(-.2,.5),e.float(-1,1)],a*3),s[a]=e.float(.6,1.6),h.setHex(16751178).multiplyScalar(e.float(.06,.18))):(this.vel.set([e.float(-.3,.3),e.float(.5,1.5),e.float(-.3,.3)],a*3),s[a]=e.float(.18,.42),h.setHex(e.chance(.5)?16727464:3335935).multiplyScalar(e.float(.6,1.3))),l.set([h.r,h.g,h.b],a*3);this.geo=new at,this.posAttr=new et(this.pos,3),this.posAttr.setUsage(At),this.geo.setAttribute("position",this.posAttr),this.geo.setAttribute("color",new et(l,3)),this.geo.setAttribute("size",new et(s,1)),this.geo.setAttribute("phase",new et(this.ph,1)),this.mat=Ct(i,{blink:this.kind===0,alpha:1}),this.points=new St(this.geo,this.mat),this.points.frustumCulled=!1,this.points.visible=o>0,zt(this.points,i)}update(t){if(this.n===0)return;this.t+=t;const i=this.pos,r=this.vel,e=this.kind;for(let n=0;n<this.n;n++){const o=n*3,l=this.ph[n],s=e===1?Math.sin(this.t*.9+l*40)*.6:e===0?Math.sin(this.t*.6+l*30)*.3:0;i[o]=i[o]+(r[o]+s)*t,i[o+1]=i[o+1]+r[o+1]*t,i[o+2]=i[o+2]+r[o+2]*t,i[o]>lt?i[o]=i[o]-2*lt:i[o]<-lt&&(i[o]=i[o]+2*lt),i[o+2]>rt?i[o+2]=i[o+2]-2*rt:i[o+2]<-rt&&(i[o+2]=i[o+2]+2*rt),i[o+1]<0?i[o+1]=i[o+1]+wt:i[o+1]>wt&&(i[o+1]=i[o+1]-wt)}this.posAttr.needsUpdate=!0}dispose(){this.geo.dispose(),this.mat.dispose(),this.points.removeFromParent()}}const st=8,ct=4;class Le{constructor(t,i,r){this.rng=r,this.cursor=0,this.idle=!0,this.shState=new Uint8Array(st),this.shTime=new Float32Array(st),this.shFuse=new Float32Array(st),this.shPos=new Float32Array(st*3),this.shVel=new Float32Array(st*3),this.shCol=new Float32Array(st*3),this.foTime=new Float32Array(ct),this.foPos=new Float32Array(ct*3),this.foCol=new Float32Array(ct*3),this.foAcc=new Float32Array(ct),this.tmp=new A,this.quality=Math.min(1,Math.max(0,i));const e=Math.floor(900*(.35+.65*this.quality));this.n=e,this.g=[0,-9.5,0],this.pos=new Float32Array(e*3),this.vel=new Float32Array(e*3),this.base=new Float32Array(e*3),this.out=new Float32Array(e*3),this.life=new Float32Array(e),this.maxLife=new Float32Array(e).fill(1),this.sz=new Float32Array(e),this.szOut=new Float32Array(e);for(let n=0;n<e;n++)this.pos[n*3+1]=-100;this.geo=new at,this.posAttr=new et(this.pos,3),this.colAttr=new et(this.out,3),this.szAttr=new et(this.szOut,1);for(const n of[this.posAttr,this.colAttr,this.szAttr])n.setUsage(At);this.geo.setAttribute("position",this.posAttr),this.geo.setAttribute("color",this.colAttr),this.geo.setAttribute("size",this.szAttr),this.geo.setAttribute("phase",new et(new Float32Array(e),1)),this.mat=Ct(t,{alpha:1}),this.points=new St(this.geo,this.mat),this.points.frustumCulled=!1,this.points.renderOrder=6,zt(this.points,t)}spawn(t,i,r,e,n,o,l,s,h){const a=this.cursor;this.cursor=(this.cursor+1)%this.n;const f=a*3;this.pos[f]=t,this.pos[f+1]=i,this.pos[f+2]=r,this.vel[f]=e,this.vel[f+1]=n,this.vel[f+2]=o,this.base[f]=l.r,this.base[f+1]=l.g,this.base[f+2]=l.b,this.life[a]=s,this.maxLife[a]=s,this.sz[a]=h,this.idle=!1}celebrate(t){if(this.n===0)return;const i=this.rng,r=F.halfLength,e=t===0?1:-1,n=Math.max(3,Math.round(st*(.5+.5*this.quality)));for(let l=0;l<n;l++){const s=l*3;this.shState[l]=1,this.shTime[l]=l*.28+i.float(0,.25),this.shFuse[l]=i.float(1,1.5);const h=l%3===0?0:1;this.shPos[s]=i.float(-34,34),this.shPos[s+1]=1,this.shPos[s+2]=e*(h?i.float(r+14,r+34):i.float(-18,18)),this.shVel[s]=i.float(-3,3),this.shVel[s+1]=i.float(30,38),this.shVel[s+2]=i.float(-3,3);const a=this.tmp.setHex(l%2?16771496:X[t]);this.shCol[s]=a.r,this.shCol[s+1]=a.g,this.shCol[s+2]=a.b}const o=F.goalHalfWidth;for(let l=0;l<ct;l++){const s=l*3;this.foTime[l]=2.8,this.foAcc[l]=0,this.foPos[s]=l%2?o:-o,this.foPos[s+1]=.5,this.foPos[s+2]=(l<2?e:-e)*(r-.6);const h=this.tmp.setHex(l<2?X[t]:16767370);this.foCol[s]=h.r,this.foCol[s+1]=h.g,this.foCol[s+2]=h.b}this.idle=!1}update(t){if(this.idle)return;const i=this.rng,r=this.tmp;let e=!1;for(let o=0;o<st;o++){const l=this.shState[o];if(l===0)continue;e=!0;const s=o*3;if(l===1){this.shTime[o]=this.shTime[o]-t,this.shTime[o]<=0&&(this.shState[o]=2);continue}if(this.shPos[s]=this.shPos[s]+this.shVel[s]*t,this.shPos[s+1]=this.shPos[s+1]+this.shVel[s+1]*t,this.shPos[s+2]=this.shPos[s+2]+this.shVel[s+2]*t,this.shVel[s+1]=this.shVel[s+1]-6*t,r.setRGB(1,.8,.45),this.spawn(this.shPos[s],this.shPos[s+1],this.shPos[s+2],i.float(-.6,.6),i.float(-3,-1),i.float(-.6,.6),r,.55,.5),this.shFuse[o]=this.shFuse[o]-t,this.shFuse[o]<=0){this.shState[o]=0;const h=Math.round(70*(.5+.5*this.quality)),a=i.chance(.5);for(let f=0;f<h;f++){const v=i.float(-1,1),u=i.float(0,Math.PI*2),d=Math.sqrt(1-v*v),w=i.float(7,15);a&&i.chance(.35)?r.setRGB(1.2,1.1,.8):r.setRGB(this.shCol[s],this.shCol[s+1],this.shCol[s+2]).multiplyScalar(1.4),this.spawn(this.shPos[s],this.shPos[s+1],this.shPos[s+2],d*Math.cos(u)*w,v*w,d*Math.sin(u)*w,r,i.float(1.4,2.4),i.float(.7,1.3))}}}for(let o=0;o<ct;o++){const l=this.foTime[o];if(l<=0)continue;e=!0,this.foTime[o]=l-t;const s=o*3;for(this.foAcc[o]=this.foAcc[o]+t*110*(.4+.6*this.quality),r.setRGB(this.foCol[s],this.foCol[s+1],this.foCol[s+2]).multiplyScalar(1.5);this.foAcc[o]>=1;){this.foAcc[o]=this.foAcc[o]-1;const h=i.float(0,Math.PI*2),a=i.float(.5,3.5);this.spawn(this.foPos[s],this.foPos[s+1],this.foPos[s+2],Math.cos(h)*a,i.float(11,17),Math.sin(h)*a,r,i.float(.8,1.4),i.float(.4,.8))}}const n=Math.max(0,1-1.1*t);for(let o=0;o<this.n;o++){const l=this.life[o],s=o*3;if(l<=0){this.szOut[o]!==0&&(this.szOut[o]=0,this.out[s]=this.out[s+1]=this.out[s+2]=0);continue}e=!0,this.life[o]=l-t,this.vel[s]=this.vel[s]*n,this.vel[s+1]=this.vel[s+1]*n+this.g[1]*t,this.vel[s+2]=this.vel[s+2]*n,this.pos[s]=this.pos[s]+this.vel[s]*t,this.pos[s+1]=this.pos[s+1]+this.vel[s+1]*t,this.pos[s+2]=this.pos[s+2]+this.vel[s+2]*t;const h=Math.max(0,l/this.maxLife[o]),a=h*h;this.out[s]=this.base[s]*a,this.out[s+1]=this.base[s+1]*a,this.out[s+2]=this.base[s+2]*a,this.szOut[o]=this.sz[o]*(.5+.5*h)}this.posAttr.needsUpdate=!0,this.colAttr.needsUpdate=!0,this.szAttr.needsUpdate=!0,e||(this.idle=!0)}dispose(){this.geo.dispose(),this.mat.dispose(),this.points.removeFromParent()}}const ht=Ae,mt=22,pt=5.5;class Ne{constructor(t){this.group=new vt,this.geos=[],this.mats=[],this.lastKey=-1;const i=F.halfLength,r=F.goalDepth,e=F.goalHalfWidth,n=F.goalHeight,o=x=>{const M=x>0?[-e,0,i-ht]:[-e,0,-i-r],B=x>0?[e,n,i+r]:[e,n,-i+ht],H=ut(M[2],B[2],ht,4,[],5),T=x>0?G=>G.cz>i+1e-4:G=>G.cz<-i-1e-4;return $t(M,B,ht,[ut(-e,e,ht,4,[],5),ut(0,n,ht,4,[],3),H],T)},l=Ft([o(1),o(-1)]);this.geos.push(l);const s=Ge(t);this.mats.push(s);const h=new O(l,s);h.renderOrder=2,this.group.add(h);const a=new j,f=new j;for(const x of[-1,1]){const M=x<0?0:1,B=new A(X[M]),H=B.clone().multiplyScalar(.4),T=x*i,G=x*(i+r),I=x*(i+r/2),g=(C,b,S,y,z,m,p)=>{a.box(C,b,S,y,z,m,B),f.box(C,b,S,y+p,z+p,m+p,H)};g(-e,n/2,T,.4,n+.4,.6,.7),g(e,n/2,T,.4,n+.4,.6,.7),g(0,n,T,2*e+.4,.4,.6,.7),g(-e,n/2,G,.28,n,.28,.45),g(e,n/2,G,.28,n,.28,.45),g(0,n,G,2*e,.28,.28,.45),g(-e,n,I,.28,.28,r,.45),g(e,n,I,.28,.28,r,.45)}const v=a.build(),u=f.build();this.geos.push(v,u);const d=ft(t,0,1.15),w=ft(t,2,1,.28);this.mats.push(d,w),this.group.add(new O(v,d));const D=new O(u,w);D.renderOrder=4,this.group.add(D),this.canvas=document.createElement("canvas"),this.canvas.width=512,this.canvas.height=128,this.ctx=this.canvas.getContext("2d"),this.tex=new oe(this.canvas),this.tex.colorSpace=ie,this.tex.anisotropy=4,this.boardMat=new yt({map:this.tex,toneMapped:!1}),this.mats.push(this.boardMat);const E=x=>{const M=new Mt(mt,pt);return x>0&&M.rotateY(Math.PI),M.translate(0,11.2,x*(i+.9)),M},L=Ft([E(1),E(-1)]);this.geos.push(L),this.group.add(new O(L,this.boardMat));const U=new j;for(const x of[-1,1]){const M=new A(X[x<0?0:1]).multiplyScalar(1.3),B=x*(i+1);U.box(0,11.2+pt/2+.15,B,mt+.8,.28,.5,M),U.box(0,11.2-pt/2-.15,B,mt+.8,.28,.5,M),U.box(-mt/2-.2,11.2,B,.28,pt+.6,.5,M),U.box(mt/2+.2,11.2,B,.28,pt+.6,.5,M),U.box(-6,5.5,x*(i+1.5),.3,11,.3,new A(.12,.13,.2)),U.box(6,5.5,x*(i+1.5),.3,11,.3,new A(.12,.13,.2))}const k=U.build();this.geos.push(k);const _=ft(t,0,1);this.mats.push(_),this.group.add(new O(k,_)),this.drawBoard(0,0,"5:00","")}drawBoard(t,i,r,e){const n=this.ctx,o=512,l=128,s=n.createLinearGradient(0,0,0,l);s.addColorStop(0,"#0a0d1c"),s.addColorStop(1,"#04050c"),n.fillStyle=s,n.fillRect(0,0,o,l);const h="#"+new A(X[0]).getHexString(),a="#"+new A(X[1]).getHexString(),f=n.createLinearGradient(0,0,190,0);f.addColorStop(0,h+"66"),f.addColorStop(1,h+"00"),n.fillStyle=f,n.fillRect(0,0,190,l);const v=n.createLinearGradient(o,0,o-190,0);v.addColorStop(0,a+"66"),v.addColorStop(1,a+"00"),n.fillStyle=v,n.fillRect(o-190,0,190,l),n.lineWidth=6,n.strokeStyle=h,n.beginPath(),n.moveTo(0,3),n.lineTo(o/2-70,3),n.moveTo(0,l-3),n.lineTo(o/2-70,l-3),n.stroke(),n.strokeStyle=a,n.beginPath(),n.moveTo(o,3),n.lineTo(o/2+70,3),n.moveTo(o,l-3),n.lineTo(o/2+70,l-3),n.stroke(),n.textAlign="center",n.textBaseline="middle",n.shadowBlur=18,n.font='800 18px "Segoe UI", Arial, sans-serif',n.shadowColor=h,n.fillStyle=h,n.fillText("FUNKEN",92,20),n.shadowColor=a,n.fillStyle=a,n.fillText("FROST",o-92,20),n.font='900 78px "Arial Black", Impact, "Segoe UI", sans-serif',n.shadowColor=h,n.fillStyle="#ffffff",n.fillText(String(t),92,78),n.shadowColor=a,n.fillText(String(i),o-92,78),n.shadowColor="#ffffff",n.shadowBlur=10,n.font='800 46px "Segoe UI", Arial, sans-serif',n.fillStyle="#e8ecff",n.fillText(r,o/2,e?52:64),e&&(n.font='800 20px "Segoe UI", Arial, sans-serif',n.fillStyle="#9fb0ff",n.fillText(e,o/2,100)),n.shadowBlur=0,this.tex.needsUpdate=!0}update(t){const i=Math.max(0,Math.ceil(t.clock)),r=t.phase==="countdown"?1:t.phase==="goal"?2:t.phase==="ended"?3:0,e=r===1?Math.max(1,Math.ceil(t.phaseTimer)):0,n=((t.score[0]*64+t.score[1])*8+r)*8+e+(t.overtime?.5:0)+i*1e6;if(n===this.lastKey)return;this.lastKey=n;let o,l="";r===1?(o=String(e),l="ANSTOSS"):r===2?o="TOR!":r===3?o="ENDE":t.overtime?o="GOLDEN GOAL":o=Math.floor(i/60)+":"+String(i%60).padStart(2,"0"),this.drawBoard(t.score[0],t.score[1],o,l)}dispose(){this.tex.dispose();for(const t of this.geos)t.dispose();for(const t of this.mats)t.dispose();this.group.removeFromParent()}}function De(c=64){const t=new Uint8Array(c*c*4);for(let r=0;r<c;r++)for(let e=0;e<c;e++){const n=Math.hypot((e+.5)/c-.5,(r+.5)/c-.5)*2,o=Math.pow(Math.max(0,1-n),2.2),l=(r*c+e)*4;t[l]=t[l+1]=t[l+2]=255,t[l+3]=Math.round(o*255)}const i=new le(t,c,c,re);return i.magFilter=i.minFilter=ce,i.needsUpdate=!0,i}function nt(c){return c.rotateX(-Math.PI/2),c}class Ee{constructor(t){this.group=new vt,this.built=!1,this.count=0,this.slot=[],this.wasActive=[],this.pop=new Float32Array(0),this.tex=null,this.dummy=new Kt,this.tmp=new A,this.meshes=[],this.geos=[],this.mats=[],this.time=0,this.cOff=new A(t.padOff),this.cBig=new A(t.padBig),this.cSmall=new A(t.padSmall)}build(t){this.built=!0,this.count=t.length;let i=0,r=0;for(const w of t)this.slot.push(w.big?r++:i++),this.wasActive.push(!0);this.pop=new Float32Array(t.length);const e=new j;e.place(new Q(1.08,1.2,.12,28),0,.06,0,0,0,0,1,q(.05)),e.place(nt(new Gt(.8,28)),0,.126,0,0,0,0,1,q(.7)),e.place(nt(new Tt(.88,1,40)),0,.13,0,0,0,0,1,q(1.4));const n=new ne;n.moveTo(.12,.5),n.lineTo(-.3,-.05),n.lineTo(-.02,-.05),n.lineTo(-.12,-.5),n.lineTo(.3,.05),n.lineTo(.02,.05),n.closePath(),e.place(nt(new ae(n)),0,.134,0,0,0,0,1,q(.12));const o=e.build();this.geos.push(o);const l=new yt({vertexColors:!0});this.mats.push(l);const s=new j;s.place(new Q(2.45,2.75,.3,6),0,.15,0,0,Math.PI/6,0,.66,q(.05)),s.place(nt(new Tt(1.95,2.28,6)),0,.312,0,0,0,Math.PI/6,.66,q(1.4)),s.place(nt(new Gt(1.75,6)),0,.308,0,0,0,Math.PI/6,.66,q(.3)),s.place(nt(new Tt(1.2,1.35,6)),0,.314,0,0,0,Math.PI/6,.66,q(.9));const h=s.build();this.geos.push(h);const a=new j;a.place(new Q(.55,.55,1.4,18),0,0,0,0,0,0,1,q(.5)),a.place(new Q(.585,.585,.14,18),0,.45,0,0,0,0,1,q(1.5)),a.place(new Q(.585,.585,.14,18),0,-.45,0,0,0,0,1,q(1.5)),a.place(new Q(.22,.5,.3,18),0,.85,0,0,0,0,1,q(.9)),a.place(new Q(.5,.4,.14,18),0,-.77,0,0,0,0,1,q(.3)),a.place(new Bt(.2,.55,.06),0,0,.545,0,0,0,1,q(2.2)),a.place(new Bt(.2,.55,.06),0,0,-.545,0,0,0,1,q(2.2));const f=a.build();this.geos.push(f);const v=new yt({vertexColors:!0});this.mats.push(v),this.tex=De();const u=nt(new Mt(1,1));this.geos.push(u);const d=new yt({map:this.tex,transparent:!0,depthWrite:!1,blending:Wt});this.mats.push(d),this.small=new dt(o,l,Math.max(1,i)),this.big=new dt(h,l,Math.max(1,r)),this.can=new dt(f,v,Math.max(1,r)),this.halo=new dt(u,d,t.length),this.meshes=[this.small,this.big,this.can,this.halo];for(const w of this.meshes)w.frustumCulled=!1,w.instanceMatrix.setUsage(At),w.setColorAt(0,this.cOff),w.instanceColor.setUsage(At),this.group.add(w);this.small.count=i,this.big.count=r,this.can.count=r,this.halo.renderOrder=3}update(t,i){const r=i.pads;if(!this.built||r.length!==this.count){if(this.built&&this.clear(),r.length===0)return;this.build(r)}this.time+=t;const e=this.time,n=this.dummy;for(let o=0;o<r.length;o++){const l=r[o],s=l.big?ye:be,h=l.active?1:Math.min(1,Math.max(0,1-l.timer/s));l.active&&!this.wasActive[o]&&(this.pop[o]=1),this.wasActive[o]=l.active,this.pop[o]=Math.max(0,this.pop[o]-t*2.2);const a=this.pop[o],f=l.active?1:xt(.72,1,h),v=l.active?1:xt(.55,1,h)*.55,u=l.big?this.cBig:this.cSmall,d=this.slot[o],w=Math.max(0,l.pos[1]);this.tmp.copy(this.cOff).lerp(u,v),a>0&&this.tmp.lerp(_t,a*.7);const D=l.big?this.big:this.small;if(n.position.set(l.pos[0],w-(1-f)*.09,l.pos[2]),n.rotation.set(0,0,0),n.scale.set(1,.45+.55*f,1),n.updateMatrix(),D.setMatrixAt(d,n.matrix),D.setColorAt(d,this.tmp),l.big){const U=l.active?1+a*.35:xt(.8,1,h)*.9;n.position.set(l.pos[0],w+1.55+Math.sin(e*2.1+o)*.16,l.pos[2]),n.rotation.set(0,e*1.5+o,0),n.scale.setScalar(Math.max(1e-4,U)),n.updateMatrix(),this.can.setMatrixAt(d,n.matrix),this.tmp.copy(u).multiplyScalar(l.active?1:.35+.65*xt(.8,1,h)),a>0&&this.tmp.lerp(_t,a*.6),this.can.setColorAt(d,this.tmp)}const E=l.big?4.4:3;n.position.set(l.pos[0],w+.05,l.pos[2]),n.rotation.set(0,0,0),n.scale.setScalar(E*(1+a*.5)),n.updateMatrix(),this.halo.setMatrixAt(o,n.matrix);const L=l.active?.45+.12*Math.sin(e*3+o*1.7)+a*1.3:.05+v*.12;this.tmp.copy(u).multiplyScalar(L),this.halo.setColorAt(o,this.tmp)}this.small.instanceMatrix.needsUpdate=!0,this.big.instanceMatrix.needsUpdate=!0,this.can.instanceMatrix.needsUpdate=!0,this.halo.instanceMatrix.needsUpdate=!0;for(let o=0;o<4;o++)this.meshes[o].instanceColor.needsUpdate=!0}clear(){for(const t of this.meshes)t.dispose(),t.removeFromParent();this.disposeShared(),this.slot=[],this.wasActive=[],this.built=!1}disposeShared(){for(const t of this.geos)t.dispose();for(const t of this.mats)t.dispose();this.geos.length=0,this.mats.length=0,this.tex?.dispose(),this.tex=null}dispose(){this.built&&this.clear(),this.group.removeFromParent()}}const _t=new A(1,1,1),q=c=>new A(c,c,c);function xt(c,t,i){const r=Math.min(1,Math.max(0,(i-c)/(t-c)));return r*r*(3-2*r)}class Ue{constructor(t,i,r,e){this.group=new vt,this.geos=[],this.mats=[];const n=t==="neon"?0:t==="eis"?1:2,o=g=>(this.geos.push(g),g),l=g=>(this.mats.push(g),g),s=new O(o(new he(100,32,18)),l(ze(i,r,n)));s.frustumCulled=!1,s.renderOrder=-100,s.onBeforeRender=(g,C,b)=>{s.position.copy(b.position)},this.group.add(s);const h=new O(o(new Gt(1100,64).rotateX(-Math.PI/2)),l(Te(i,r,n)));h.position.y=-.06,this.group.add(h);const a=new j;if(t==="neon"){const g=[658210,856112,1378864,726056];for(let C=0;C<90;C++){const b=C/90*Math.PI*2+e.float(-.03,.03),S=e.float(165,380),y=(30+e.next()*e.next()*190)*(.7+(S-165)/380),z=e.float(12,38),m=Math.cos(b)*S,p=Math.sin(b)*S,P=e.pick(g),W=e.next()*10;a.box(m,y/2-1,p,z,y+2,e.float(12,34),P,[W,y],b+e.float(-.3,.3)),e.chance(.3)&&a.box(m,y+6,p,1.2,12,1.2,P,[W,y+12],0),e.chance(.25)&&a.box(m,y+2,p,z*.6,4,z*.6,P,[W+1,y+4],b)}}else if(t==="eis"){const g=[10474224,7320804,13626111,5083336];for(let C=0;C<70;C++){const b=e.float(0,Math.PI*2),S=e.float(175,360),y=e.float(30,150)*(.8+(S-175)/400),z=e.float(9,26),m=new Q(z*e.float(0,.12),z,y,6,1),p=Math.cos(b)*S,P=Math.sin(b)*S;if(a.place(m,p,y/2-2,P,e.float(-.12,.12),e.float(0,6),e.float(-.14,.14),1,e.pick(g)),e.chance(.6)){const W=new Q(0,z*.55,y*.6,6,1);a.place(W,p+e.float(-14,14),y*.3-2,P+e.float(-14,14),e.float(-.3,.3),e.float(0,6),e.float(-.3,.3),1,e.pick(g))}}}else{const g=[11029026,12935724,9058844,14254136];for(let C=0;C<60;C++){const b=C/60*Math.PI*2+e.float(-.05,.05),S=e.float(150,390),y=e.float(28,130)*(.8+(S-150)/500),z=e.float(26,70),m=new Q(z*e.float(.55,.8),z,y,7,1),p=Math.cos(b)*S,P=Math.sin(b)*S;if(a.place(m,p,y/2-2,P,0,e.float(0,6),0,[e.float(.8,1.3),1,e.float(.8,1.3)],e.pick(g)),e.chance(.5)){const W=new Q(z*.3,z*.5,y*.55,6,1);a.place(W,p+e.float(-z,z),y*.27-2,P+e.float(-z,z),0,e.float(0,6),0,1,e.pick(g))}}}if(!a.empty){const g=new O(o(a.build()),l(bt(i,r,n)));g.frustumCulled=!1,this.group.add(g)}if(t==="eis"){const g=new ue(new jt(150,2));o(g);const C=l(new fe({color:r.lineB,transparent:!0,opacity:.22})),b=new me(g,C);b.position.y=-2,b.frustumCulled=!1,this.group.add(b)}const f=new j,v=new j,u=new j,d=new A(r.mast),w=new A(r.lamp).multiplyScalar(1.6),D=new A(r.beam),E=new Ot,L=new qt,U=new Z(0,-1,0),k=new Z,_=50,x=118,M=new pe(19,x,22,1,!0).translate(0,-x/2,0),B=F.halfWidth+26,H=F.halfLength+F.goalDepth+22;for(const g of[-1,1])for(const C of[-1,1]){const b=g*B,S=C*H;f.box(b,_/2,S,1.6,_,1.6,d),f.box(b,2,S,4,4,4,d);const y=Math.atan2(-b,-S);f.box(b,_+.3,S,10,6.6,.8,d,void 0,y);for(let z=0;z<2;z++)for(let m=-2;m<=2;m++){const p=Math.cos(y)*m*1.8,P=-Math.sin(y)*m*1.8;v.box(b+p+Math.sin(y)*.55,_-1.4+z*2.6+.3,S+P+Math.cos(y)*.55,1.4,1.8,.3,w,void 0,y)}k.set(-b,-50.3,-S).normalize(),E.setFromUnitVectors(U,k),L.setFromQuaternion(E),u.place(M,b+Math.sin(y)*.9,_+.3,S+Math.cos(y)*.9,L.x,L.y,L.z,1,D)}o(M);const T=new O(o(f.build()),l(bt(i,r,3)));T.frustumCulled=!1;const G=new O(o(v.build()),l(ft(i,0,1))),I=new O(o(u.build()),l(ft(i,1,1,r.beamAlpha)));if(I.renderOrder=1,I.frustumCulled=!1,this.group.add(T,G,I),t==="canyon"){const g=new j,C=[],b=[],S=[],y=[],z=[],m=F.halfWidth+3.5+10*1.25+4,p=F.halfLength+F.goalDepth+3.5+8*1.25+4;for(let V=-p+6;V<=p-6;V+=13)z.push([-m,V],[m,V]);for(let V=-m+14;V<=m-14;V+=14)z.push([V,-p],[V,p]);const P=new A(2757644),W=new A;for(const[V,gt]of z){g.box(V,2.2,gt,.3,4.4,.3,P),g.box(V,4.5,gt,.9,.5,.9,P);for(let Nt=0;Nt<6;Nt++)C.push(V+e.float(-.25,.25),5+e.float(0,.9),gt+e.float(-.25,.25)),W.setRGB(1,.45+e.next()*.3,.1).multiplyScalar(e.float(1,1.7)),b.push(W.r,W.g,W.b),S.push(e.float(.9,1.7)),y.push(e.next());C.push(V,5.4,gt),b.push(.5,.2,.04),S.push(7),y.push(e.next())}const R=new O(o(g.build()),l(bt(i,r,3)));R.frustumCulled=!1,this.group.add(R);const tt=o(new at);tt.setAttribute("position",new K(C,3)),tt.setAttribute("color",new K(b,3)),tt.setAttribute("size",new K(S,1)),tt.setAttribute("phase",new K(y,1));const Y=new St(tt,l(Ct(i,{flicker:!0})));Y.frustumCulled=!1,zt(Y,i),this.group.add(Y)}}dispose(){for(const t of this.geos)t.dispose();for(const t of this.mats)t.dispose();this.group.removeFromParent()}}const _e=7,It=3.2,Rt=4;class Ie{constructor(t,i){this.group=new vt,this.scene=null,this.geos=[],this.mats=[],this.time=0,this.flashAge=[1/0,1/0],this.pulseAge=1/0,this.cheerAge=1/0;const r=Se(t),e=Ce(r);this.u=e;const n=new de(ve("turbokick-arena-"+t)),o=F.halfWidth,l=F.height,s=F.halfLength,h=F.coveRadius,a=F.goalHalfWidth,f=F.goalHeight;this.fog=new ge(r.fog,r.fogDensity),this.hemi=new we(r.hemiSky,r.hemiGround,r.hemiIntensity*2),this.sun=new xe(r.lightCol,r.lightIntensity*2.2);const v=new Z(...r.lightDir).normalize().multiplyScalar(90);this.sun.position.copy(v),this.sun.castShadow=i.shadows,this.sun.shadow.mapSize.set(2048,2048);const u=this.sun.shadow.camera;u.left=-66,u.right=66,u.top=74,u.bottom=-74,u.near=20,u.far=220,u.updateProjectionMatrix(),this.sun.shadow.bias=-4e-4,this.sun.shadow.normalBias=.03,this.group.add(this.hemi,this.sun,this.sun.target);const d=$t([-o,0,-s],[o,l,s],h,[ut(-o,o,h,8,[-a,a],4),ut(0,l,h,8,[f],3),ut(-s,s,h,8,[],6)],x=>x.maxY<1e-4?!1:!(Math.abs(x.cx)<a&&x.cy<f&&Math.abs(x.cz)>s-h+.001));this.geos.push(d);const w=ke(e,r);this.mats.push(w);const D=new O(d,w);D.renderOrder=2,D.frustumCulled=!1,this.group.add(D);const E=new Mt(2*(o-h),2*(s-h)).rotateX(-Math.PI/2),L=x=>new Mt(2*a,h).rotateX(-Math.PI/2).translate(0,0,x*(s-h/2)),U=Ft([E,L(1),L(-1)]);this.geos.push(U);const k=Be(e,r);this.mats.push(k);const _=new O(U,k);_.receiveShadow=!0,this.group.add(_),this.pads=new Ee(r),this.goals=new Ne(e),this.stands=new Pe(e,r,i.particles,n.fork(1)),this.scenery=new Ue(t,e,r,n.fork(2)),this.weather=new We(t,e,i.particles,n.fork(3)),this.fireworks=new Le(e,i.particles,n.fork(4)),this.group.add(this.pads.group,this.goals.group,this.stands.group,this.scenery.group,this.weather.points,this.fireworks.points)}applyTo(t){this.scene=t,t.fog=this.fog,t.background=this.fog.color}update(t,i){this.time+=t;const r=this.u;r.uTime.value=this.time,r.uBall.value.set(i.ball.pos[0],i.ball.pos[1],i.ball.pos[2]),this.flashAge[0]+=t,this.flashAge[1]+=t,this.pulseAge+=t,this.cheerAge+=t,r.uFlash.value.set(Ht(this.flashAge[0]),Ht(this.flashAge[1]));const e=this.pulseAge<Rt?1-this.pulseAge/Rt:0;r.uPulse.value=e>0?e*e*(.65+.35*Math.sin(this.pulseAge*11)):0;const n=Math.max(0,1-this.cheerAge/_e);r.uCheer.value=Math.min(1,n*2.2)*(n>0?1:0),this.pads.update(t,i),this.goals.update(i),this.weather.update(t),this.fireworks.update(t)}celebrate(t){this.flashAge[t===0?1:0]=0,this.pulseAge=0,this.cheerAge=0,this.u.uPulseCol.value.setHex(X[t]),this.fireworks.celebrate(t)}setQuality(t){this.sun.castShadow=t.shadows}dispose(){this.scene&&this.scene.fog===this.fog&&(this.scene.fog=null),this.sun.shadow.map?.dispose(),this.pads.dispose(),this.goals.dispose(),this.stands.dispose(),this.scenery.dispose(),this.weather.dispose(),this.fireworks.dispose();for(const t of this.geos)t.dispose();for(const t of this.mats)t.dispose();this.group.removeFromParent()}}function Ht(c){if(!(c<It))return 0;const t=1-c/It;return Math.min(1,t*(.55+.45*Math.sin(c*20))+(c<.25?.6:0))}function qe(c,t){return Me.some(i=>i.id===c)||(c="neon"),new Ie(c,t)}export{qe as c};
