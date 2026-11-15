import{s as rt,t as tt,J as j,K as Yt,V as Q,c as Qt,L as Zt,i as Vt,O as qt,f as M,U as Jt,W as te,X as jt,Y as st,r as zt,y as F,Z as ee,_ as se,$ as oe,A as Tt,a0 as ie,m as at,M as R,a1 as Kt,a2 as gt,a3 as $t,u as kt,a4 as Mt,w as ne,x as ae,o as nt,h as At,p as ft,n as St,q as Pt,a5 as re,a6 as le,a7 as Nt,T as Ct,d as ce,e as he,a8 as ue,a9 as fe,aa as pe,ab as me,a as de,ac as ve,ad as ge,ae as we,af as xe,R as ye,j as be,ag as Me,H as Ae,D as Se}from"./engine-DkgeuP18.js";import{G as Ce}from"./sim-CUvQZA4c.js";function Wt(c,t=!1){const i=c[0].index!==null,l=new Set(Object.keys(c[0].attributes)),e=new Set(Object.keys(c[0].morphAttributes)),n={},s={},r=c[0].morphTargetsRelative,o=new rt;let h=0;for(let a=0;a<c.length;++a){const f=c[a];let m=0;if(i!==(f.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const u in f.attributes){if(!l.has(u))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+'. All geometries must have compatible attributes; make sure "'+u+'" attribute exists among all geometries, or in none of them.'),null;n[u]===void 0&&(n[u]=[]),n[u].push(f.attributes[u]),m++}if(m!==l.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". Make sure all geometries have the same number of attributes."),null;if(r!==f.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const u in f.morphAttributes){if(!e.has(u))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+".  .morphAttributes must be consistent throughout all geometries."),null;s[u]===void 0&&(s[u]=[]),s[u].push(f.morphAttributes[u])}if(t){let u;if(i)u=f.index.count;else if(f.attributes.position!==void 0)u=f.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+a+". The geometry must have either an index or a position attribute"),null;o.addGroup(h,u,a),h+=u}}if(i){let a=0;const f=[];for(let m=0;m<c.length;++m){const u=c[m].index;for(let v=0;v<u.count;++v)f.push(u.getX(v)+a);a+=c[m].attributes.position.count}o.setIndex(f)}for(const a in n){const f=Et(n[a]);if(!f)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+a+" attribute."),null;o.setAttribute(a,f)}for(const a in s){const f=s[a][0].length;if(f===0)break;o.morphAttributes=o.morphAttributes||{},o.morphAttributes[a]=[];for(let m=0;m<f;++m){const u=[];for(let x=0;x<s[a].length;++x)u.push(s[a][x][m]);const v=Et(u);if(!v)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+a+" morphAttribute."),null;o.morphAttributes[a].push(v)}}return o}function Et(c){let t,i,l,e=-1,n=0;for(let h=0;h<c.length;++h){const a=c[h];if(t===void 0&&(t=a.array.constructor),t!==a.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(i===void 0&&(i=a.itemSize),i!==a.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(l===void 0&&(l=a.normalized),l!==a.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(e===-1&&(e=a.gpuType),e!==a.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;n+=a.count*i}const s=new t(n),r=new tt(s,i,l);let o=0;for(let h=0;h<c.length;++h){const a=c[h];if(a.isInterleavedBufferAttribute){const f=o/i;for(let m=0,u=a.count;m<u;m++)for(let v=0;v<i;v++){const x=a.getComponent(m,v);r.setComponent(m+f,v,x)}}else s.set(a.array,o);o+=a.count*i}return e!==void 0&&(r.gpuType=e),r}function pt(c,t,i,l,e,n){const s=[];for(let o=0;o<=l;o++)s.push(c+i-i*Math.tan(Math.PI/4*(1-o/l)));for(let o=0;o<=l;o++)s.push(t-i+i*Math.tan(Math.PI/4*(o/l)));for(let o=1;o<n;o++)s.push(c+i+(t-c-2*i)*o/n);for(const o of e)o>c&&o<t&&s.push(o);s.sort((o,h)=>o-h);const r=[];for(const o of s)(r.length===0||o-r[r.length-1]>1e-4)&&r.push(o);return r}function Xt(c,t,i,l,e){const n=c.map(u=>u+i),s=t.map(u=>u-i),r=[],o=[],h=[],a={cx:0,cy:0,cz:0,minY:0,maxY:0},f=(u,v,x)=>{const T=r[u*3],E=r[u*3+1],D=r[u*3+2],I=r[v*3],B=r[v*3+1],U=r[v*3+2],w=r[x*3],A=r[x*3+1],G=r[x*3+2];if(a.cx=(T+I+w)/3,a.cy=(E+B+A)/3,a.cz=(D+U+G)/3,a.minY=Math.min(E,B,A),a.maxY=Math.max(E,B,A),e&&!e(a))return;const O=I-T,k=B-E,P=U-D,_=w-T,g=A-E,C=G-D,b=k*C-P*g,S=P*_-O*C,y=O*g-k*_;if(b*b+S*S+y*y<1e-12)return;const z=o[u*3]+o[v*3]+o[x*3],p=o[u*3+1]+o[v*3+1]+o[x*3+1],d=o[u*3+2]+o[v*3+2]+o[x*3+2];b*z+S*p+y*d>=0?h.push(u,v,x):h.push(u,x,v)};for(let u=0;u<3;u++)for(let v=0;v<2;v++){const x=(u+1)%3,T=(u+2)%3,E=l[x],D=l[T],I=r.length/3,B=[0,0,0];for(let w=0;w<E.length;w++)for(let A=0;A<D.length;A++){B[u]=v?t[u]:c[u],B[x]=E[w],B[T]=D[A];const G=Math.min(Math.max(B[0],n[0]),s[0]),O=Math.min(Math.max(B[1],n[1]),s[1]),k=Math.min(Math.max(B[2],n[2]),s[2]);let P=B[0]-G,_=B[1]-O,g=B[2]-k;const C=Math.hypot(P,_,g)||1;P/=C,_/=C,g/=C,r.push(G+P*i,O+_*i,k+g*i),o.push(-P,-_,-g)}const U=D.length;for(let w=0;w<E.length-1;w++)for(let A=0;A<U-1;A++){const G=I+w*U+A,O=G+1,k=G+U,P=k+1;f(G,k,P),f(G,P,O)}}const m=new rt;return m.setAttribute("position",new j(r,3)),m.setAttribute("normal",new j(o,3)),m.setIndex(h),m}class q{constructor(){this.pos=[],this.nor=[],this.col=[],this.uv=[],this.idx=[],this.nm=new Yt,this.v=new Q,this.unitBox=new Qt(1,1,1),this.tmp=new Zt,this.q=new Vt,this.e=new qt,this.s=new Q,this.t=new Q,this.c=new M}add(t,i,l,e){this.c.set(l),this.nm.getNormalMatrix(i);const n=t.getAttribute("position"),s=t.getAttribute("normal"),r=t.getAttribute("uv"),o=this.pos.length/3;for(let a=0;a<n.count;a++)this.v.fromBufferAttribute(n,a).applyMatrix4(i),this.pos.push(this.v.x,this.v.y,this.v.z),this.v.fromBufferAttribute(s,a).applyMatrix3(this.nm).normalize(),this.nor.push(this.v.x,this.v.y,this.v.z),this.col.push(this.c.r,this.c.g,this.c.b),e?this.uv.push(e[0],e[1]):this.uv.push(r?r.getX(a):0,r?r.getY(a):0);const h=t.getIndex();if(h)for(let a=0;a<h.count;a++)this.idx.push(o+h.getX(a));else for(let a=0;a<n.count;a++)this.idx.push(o+a)}box(t,i,l,e,n,s,r,o,h=0){this.e.set(0,h,0),this.q.setFromEuler(this.e),this.tmp.compose(this.t.set(t,i,l),this.q,this.s.set(e,n,s)),this.add(this.unitBox,this.tmp,r,o)}place(t,i,l,e,n,s,r,o,h,a){this.e.set(n,s,r),this.q.setFromEuler(this.e),typeof o=="number"?this.s.set(o,o,o):this.s.set(o[0],o[1],o[2]),this.tmp.compose(this.t.set(i,l,e),this.q,this.s),this.add(t,this.tmp,h,a)}get empty(){return this.pos.length===0}build(){const t=new rt;return t.setAttribute("position",new j(this.pos,3)),t.setAttribute("normal",new j(this.nor,3)),t.setAttribute("color",new j(this.col,3)),t.setAttribute("uv",new j(this.uv,2)),t.setIndex(this.idx.length>65535?new Jt(this.idx,1):new te(this.idx,1)),this.unitBox.dispose(),t}}const $=[11861806,10636799],ze=[{id:"neon",name:"Neon-Metropole",blurb:"Synthwave-Nacht über der Stadt: Neonlinien, Glasdach und ein Gitter bis zum Horizont.",skyTop:196621,skyBottom:6952048},{id:"eis",name:"Eis-Dom",blurb:"Kühle Kuppel aus Kristall und Schnee, Polarlicht über dem Spielfeld.",skyTop:399418,skyBottom:11131125},{id:"canyon",name:"Glutschlucht",blurb:"Wüsten-Canyon bei Sonnenuntergang: orange Felsen, Staub und Fackeln.",skyTop:1905730,skyBottom:16752714}];function Te(c){switch(c){case"eis":return{skyTop:399418,skyMid:2054805,skyBottom:11131125,ground:13624564,fog:10274530,fogDensity:.0031,skySunDir:[.55,.32,-.78],skySunSize:.045,skySunCol:15399167,lightDir:[.35,1,.3],lightCol:15004671,lightIntensity:1.5,hemiSky:12575743,hemiGround:3824252,hemiIntensity:1.25,floorA:1783122,floorB:2311267,floorLine:15268095,floorGrid:7321830,lineA:7330047,lineB:13496831,glass:731722,glassAlpha:.1,padBig:16773560,padSmall:16756782,padOff:859184,stand:4881064,standTop:10473712,shirts:[9418972,3760522,14478584,1914197,6267864],mast:2770790,lamp:15268095,beam:12577023,beamAlpha:.06};case"canyon":return{skyTop:1905730,skyMid:11553338,skyBottom:16752714,ground:13203514,fog:14715974,fogDensity:.0021,skySunDir:[-.45,.1,-.88],skySunSize:.075,skySunCol:16766602,lightDir:[-.55,.85,-.45],lightCol:16757611,lightIntensity:1.7,hemiSky:16757898,hemiGround:5909018,hemiIntensity:1,floorA:3809815,floorB:4532251,floorLine:16770744,floorGrid:11034668,lineA:16751150,lineB:16765802,glass:3806728,glassAlpha:.12,padBig:16773560,padSmall:16756782,padOff:1838858,stand:8010274,standTop:12874555,shirts:[14262374,9062956,15850676,4858904,12085818],mast:4860444,lamp:16767392,beam:16761466,beamAlpha:.05};default:return{skyTop:196621,skyMid:1837637,skyBottom:6952048,ground:721952,fog:5903206,fogDensity:.0034,skySunDir:[-.35,.16,-.92],skySunSize:.1,skySunCol:16761405,lightDir:[.3,1,.2],lightCol:14206207,lightIntensity:1.35,hemiSky:11046143,hemiGround:2756672,hemiIntensity:1.25,floorA:987688,floorB:1382968,floorLine:16777215,floorGrid:4866216,lineA:16727464,lineB:3335935,glass:1313334,glassAlpha:.09,padBig:16773560,padSmall:16756782,padOff:724252,stand:1709880,standTop:3812984,shirts:[2763352,4860522,1842234,6961802,3033722],mast:2104392,lamp:15920383,beam:11832575,beamAlpha:.055}}}function ke(c){return{uTime:{value:0},uBall:{value:new Q(0,5,0)},uFlash:{value:new jt(0,0)},uPulse:{value:0},uPulseCol:{value:new M(1,1,1)},uCheer:{value:0},uFogCol:{value:new M(c.fog)},uFogD:{value:c.fogDensity},uT0:{value:new M($[0])},uT1:{value:new M($[1])},uScale:{value:600}}}const N=c=>({value:new M(c)}),Z=`
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
`;function ot(c,t){return{...c,...t}}function Be(c,t,i){const l=new Q(...t.skySunDir).normalize();return new st({uniforms:ot(c,{uTop:N(t.skyTop),uMid:N(t.skyMid),uBot:N(t.skyBottom),uSunCol:N(t.skySunCol),uSunDir:{value:l},uSunSize:{value:t.skySunSize},uMode:{value:i}}),side:ie,depthWrite:!1,vertexShader:`
      varying vec3 vDir;
      void main(){
        vDir = normalize(position);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_Position.z = gl_Position.w * 0.99995; // immer ganz hinten, unabhängig von der Kamera-Ferne
      }`,fragmentShader:`
      ${Z}
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
      }`})}function Ge(c,t,i){return new st({uniforms:ot(c,{uGround:N(t.ground),uLineA:N(t.lineA),uLineB:N(t.lineB),uMode:{value:i}}),vertexShader:`
      varying vec3 vW;
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,fragmentShader:`
      ${Z}${Lt}
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
      }`})}function Pe(c,t){return new st({uniforms:ot(c,{uColA:N(t.lineA),uColB:N(t.lineB),uGlass:N(t.glass),uFloor:N(t.floorB),uAlpha:{value:t.glassAlpha},uHalf:{value:new Q(F.halfWidth,F.height,F.halfLength)},uGoalTop:{value:F.goalHeight}}),transparent:!0,depthWrite:!1,side:zt,vertexShader:`
      varying vec3 vW; varying vec3 vN;
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = mat3(modelMatrix) * normal; gl_Position = projectionMatrix * viewMatrix * w; }`,fragmentShader:`
      ${Z}${Lt}
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
      }`})}function Fe(c,t){const i=new ee({color:16777215}),l={uFloorA:N(t.floorA),uFloorB:N(t.floorB),uLineCol:N(t.floorLine),uGridCol:N(t.floorGrid),uColA:N(t.lineA),uSkyGlow:N(t.skyBottom)},e=`
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
    }`;return i.customProgramCacheKey=()=>"tk-floor-v1",i.onBeforeCompile=n=>{Object.assign(n.uniforms,{uTime:c.uTime,uBall:c.uBall,uFlash:c.uFlash,uPulse:c.uPulse,uPulseCol:c.uPulseCol,uT0:c.uT0,uT1:c.uT1,...l}),n.vertexShader=n.vertexShader.replace("#include <common>",`#include <common>
varying vec3 vFW;`).replace("#include <project_vertex>",`#include <project_vertex>
vFW = (modelMatrix * vec4(transformed, 1.0)).xyz;`),n.fragmentShader=n.fragmentShader.replace("#include <common>",`#include <common>
`+e).replace("#include <color_fragment>",`#include <color_fragment>
vec3 floorGlow; diffuseColor.rgb = floorColor(vFW, floorGlow);`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
totalEmissiveRadiance += floorGlow;`)},i}function We(c){return new st({uniforms:ot(c,{}),transparent:!0,depthWrite:!1,side:zt,vertexShader:`
      varying vec3 vW; varying vec3 vN;
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = mat3(modelMatrix) * normal; gl_Position = projectionMatrix * viewMatrix * w; }`,fragmentShader:`
      ${Z}
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
      }`})}function mt(c,t,i=1,l=1){return new st({uniforms:ot(c,{uGain:{value:i},uAlpha:{value:l}}),transparent:t!==0,depthWrite:t===0,blending:t===0?oe:Tt,side:t===1?zt:se,defines:{MODE:t},vertexShader:`
      attribute vec3 color;
      varying vec3 vC; varying vec2 vUv; varying vec3 vW; varying vec3 vN;
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vC = color; vUv = uv; vN = mat3(modelMatrix) * normal; gl_Position = projectionMatrix * viewMatrix * w; }`,fragmentShader:`
      ${Z}
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
      }`})}function bt(c,t,i){const l=new Q(...t.lightDir).normalize();return new st({uniforms:ot(c,{uSunDir:{value:l},uSunCol:N(t.lightCol),uAmb:N(t.hemiSky),uAccent:N(t.lineA),uAccent2:N(t.lineB),uMode:{value:i}}),vertexShader:`
      attribute vec3 color;
      varying vec3 vC; varying vec3 vN; varying vec3 vW; varying vec2 vUv;
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vC = color; vUv = uv; vN = mat3(modelMatrix) * normal; gl_Position = projectionMatrix * viewMatrix * w; }`,fragmentShader:`
      ${Z}
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
      }`})}function Le(c,t){return new st({uniforms:ot(c,{uAmb:N(t.hemiSky),uAccent:N(t.lineA)}),vertexShader:`
      ${Z}
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
      ${Z}
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
      }`})}function Bt(c,t={}){return new st({uniforms:ot(c,{uAlpha:{value:t.alpha??1}}),transparent:!0,depthWrite:!1,blending:Tt,defines:{BLINK:t.blink?1:0,FLICKER:t.flicker?1:0},vertexShader:`
      ${Z}
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
      ${Z}
      uniform float uAlpha;
      varying vec3 vC; varying vec3 vW;
      void main(){
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float a = pow(max(1.0 - d, 0.0), 1.7);
        vec3 c = vC * a * uAlpha * fogKeep(vW);
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`})}function Gt(c,t){const i=new jt;c.onBeforeRender=(l,e,n)=>{l.getDrawingBufferSize(i),t.uScale.value=i.y*.5*n.projectionMatrix.elements[5]}}const Ft=10,It=8,K=1.25,Ut=.9;class De{constructor(t,i,l,e){this.group=new at,this.geos=[],this.mats=[],this.crowd=null,this.persons=0;const n=F.halfWidth,s=F.halfLength,r=F.goalDepth,o=s+r+2,h=n+3.5+Ft*K+1,a=new q,f=new q,m=new M(i.stand),u=new M(i.standTop),v=new M(i.lineA),x=new M(i.lineB),T=[];for(const p of[-1,1]){for(let d=0;d<Ft;d++){const W=n+3.5+d*K,L=p*(W+K/2),H=1+d*Ut;a.box(L,(H-1)/2,0,K,H+1,o*2,m),a.box(L-p*(K/2-.06),H+.02,0,.12,.05,o*2,u),d%3===1&&f.box(L-p*(K/2+.01),H-.25,0,.05,.12,o*2-2,d%2?v:x);const J=Math.floor((o*2-2)/1.1);for(let Y=0;Y<J;Y++)T.push({x:L+e.float(-.12,.12),y:H,z:-o+1+Y*1.1+d%2*.55+e.float(-.12,.12),end:!1})}a.box(p*(n+3.5+Ft*K+.5),5.5,0,1,13,o*2+12,m.clone().multiplyScalar(.7));for(let d=-o+3;d<o-2;d+=6)f.box(p*(n+2.6),.75,d,.12,1.2,5.4,(d+o)/6%2<1?v:x),a.box(p*(n+2.75),.45,d,.5,1.2,5.6,new M(329228))}for(const p of[-1,1]){for(let d=0;d<It;d++){const W=s+r+3.5+d*K,L=p*(W+K/2),H=1+d*Ut;a.box(0,(H-1)/2,L,h*2,H+1,K,m),a.box(0,H+.02,L-p*(K/2-.06),h*2,.05,.12,u),d%3===1&&f.box(0,H-.25,L-p*(K/2+.01),h*2-2,.12,.05,d%2?v:x);const J=Math.floor((h*2-2)/1.1);for(let Y=0;Y<J;Y++)T.push({x:-h+1+Y*1.1+d%2*.55+e.float(-.12,.12),y:H,z:L+e.float(-.12,.12),end:!0})}a.box(0,5.5,p*(s+r+3.5+It*K+.5),h*2+6,13,1,m.clone().multiplyScalar(.7)),f.box(0,.75,p*(s+2.6),.12+32,1.2,.12,p<0?new M($[0]):new M($[1]))}const E=a.build(),D=f.build();this.geos.push(E,D);const I=bt(t,i,3),B=mt(t,0,1.1);this.mats.push(I,B),this.group.add(new R(E,I),new R(D,B));const U=.35+.6*Math.min(1,Math.max(0,l)),w=T.filter(()=>e.chance(U));this.persons=w.length;const A=new q;A.box(0,.45,0,.46,.8,.3,new M(1,1,1),[0,0]),A.place(new Kt(.17,0),0,1.02,0,0,0,0,1,new M(1,1,1),[1,0]);const G=A.build();this.geos.push(G);const O=Le(t,i);this.mats.push(O);const k=new gt(G,O,Math.max(1,w.length));k.count=w.length,k.frustumCulled=!1;const P=new $t,_=new M,g=new M($[0]),C=new M($[1]),b=[],S=[],y=[],z=[];if(w.forEach((p,d)=>{P.position.set(p.x,p.y,p.z),P.rotation.set(0,e.float(-.5,.5),0);const W=e.float(.92,1.12);P.scale.set(e.float(.9,1.1),W,1),P.updateMatrix(),k.setMatrixAt(d,P.matrix);const L=p.end?.55:.2+.5*Math.min(1,Math.abs(p.z)/o);if(e.chance(L)?_.copy(p.z<0?g:C).multiplyScalar(e.float(.35,.85)):_.setHex(e.pick(i.shirts)).multiplyScalar(e.float(.7,1.3)),k.setColorAt(d,_),e.chance(.13)){b.push(p.x,p.y+1.45,p.z);const H=e.chance(.55)?p.z<0?g:C:_.setHex(16777215);S.push(H.r*1.4,H.g*1.4,H.b*1.4),y.push(e.float(.28,.5)),z.push(e.next())}}),k.instanceMatrix.needsUpdate=!0,k.instanceColor&&(k.instanceColor.needsUpdate=!0),this.crowd=k,this.group.add(k),b.length){const p=new rt;p.setAttribute("position",new j(b,3)),p.setAttribute("color",new j(S,3)),p.setAttribute("size",new j(y,1)),p.setAttribute("phase",new j(z,1)),this.geos.push(p);const d=Bt(t,{blink:!0,alpha:1});this.mats.push(d);const W=new kt(p,d);W.frustumCulled=!1,Gt(W,t),this.group.add(W)}}dispose(){this.crowd?.dispose();for(const t of this.geos)t.dispose();for(const t of this.mats)t.dispose();this.group.removeFromParent()}}const lt=130,ct=140,xt=48;class Ne{constructor(t,i,l,e){this.t=0,this.kind=t==="eis"?1:t==="canyon"?2:0;const s=Math.max(0,Math.floor((t==="eis"?900:t==="canyon"?520:420)*(.3+.7*Math.min(1,Math.max(0,l)))));this.n=s,this.pos=new Float32Array(s*3),this.vel=new Float32Array(s*3),this.ph=new Float32Array(s);const r=new Float32Array(s*3),o=new Float32Array(s),h=new M;for(let a=0;a<s;a++)this.pos[a*3]=e.float(-lt,lt),this.pos[a*3+1]=e.float(0,xt),this.pos[a*3+2]=e.float(-ct,ct),this.ph[a]=e.next(),this.kind===1?(this.vel.set([e.float(-.4,.4),e.float(-2.6,-1.1),e.float(-.4,.4)],a*3),o[a]=e.float(.14,.3),h.setRGB(.9,.95,1).multiplyScalar(e.float(.5,.9))):this.kind===2?(this.vel.set([e.float(2,5),e.float(-.2,.5),e.float(-1,1)],a*3),o[a]=e.float(.6,1.6),h.setHex(16751178).multiplyScalar(e.float(.06,.18))):(this.vel.set([e.float(-.3,.3),e.float(.5,1.5),e.float(-.3,.3)],a*3),o[a]=e.float(.18,.42),h.setHex(e.chance(.5)?16727464:3335935).multiplyScalar(e.float(.6,1.3))),r.set([h.r,h.g,h.b],a*3);this.geo=new rt,this.posAttr=new tt(this.pos,3),this.posAttr.setUsage(Mt),this.geo.setAttribute("position",this.posAttr),this.geo.setAttribute("color",new tt(r,3)),this.geo.setAttribute("size",new tt(o,1)),this.geo.setAttribute("phase",new tt(this.ph,1)),this.mat=Bt(i,{blink:this.kind===0,alpha:1}),this.points=new kt(this.geo,this.mat),this.points.frustumCulled=!1,this.points.visible=s>0,Gt(this.points,i)}update(t){if(this.n===0)return;this.t+=t;const i=this.pos,l=this.vel,e=this.kind;for(let n=0;n<this.n;n++){const s=n*3,r=this.ph[n],o=e===1?Math.sin(this.t*.9+r*40)*.6:e===0?Math.sin(this.t*.6+r*30)*.3:0;i[s]=i[s]+(l[s]+o)*t,i[s+1]=i[s+1]+l[s+1]*t,i[s+2]=i[s+2]+l[s+2]*t,i[s]>lt?i[s]=i[s]-2*lt:i[s]<-lt&&(i[s]=i[s]+2*lt),i[s+2]>ct?i[s+2]=i[s+2]-2*ct:i[s+2]<-ct&&(i[s+2]=i[s+2]+2*ct),i[s+1]<0?i[s+1]=i[s+1]+xt:i[s+1]>xt&&(i[s+1]=i[s+1]-xt)}this.posAttr.needsUpdate=!0}dispose(){this.geo.dispose(),this.mat.dispose(),this.points.removeFromParent()}}const et=8,ht=4;class Ee{constructor(t,i,l){this.rng=l,this.cursor=0,this.idle=!0,this.shState=new Uint8Array(et),this.shTime=new Float32Array(et),this.shFuse=new Float32Array(et),this.shPos=new Float32Array(et*3),this.shVel=new Float32Array(et*3),this.shCol=new Float32Array(et*3),this.foTime=new Float32Array(ht),this.foPos=new Float32Array(ht*3),this.foCol=new Float32Array(ht*3),this.foAcc=new Float32Array(ht),this.tmp=new M,this.quality=Math.min(1,Math.max(0,i));const e=Math.floor(900*(.35+.65*this.quality));this.n=e,this.g=[0,-9.5,0],this.pos=new Float32Array(e*3),this.vel=new Float32Array(e*3),this.base=new Float32Array(e*3),this.out=new Float32Array(e*3),this.life=new Float32Array(e),this.maxLife=new Float32Array(e).fill(1),this.sz=new Float32Array(e),this.szOut=new Float32Array(e);for(let n=0;n<e;n++)this.pos[n*3+1]=-100;this.geo=new rt,this.posAttr=new tt(this.pos,3),this.colAttr=new tt(this.out,3),this.szAttr=new tt(this.szOut,1);for(const n of[this.posAttr,this.colAttr,this.szAttr])n.setUsage(Mt);this.geo.setAttribute("position",this.posAttr),this.geo.setAttribute("color",this.colAttr),this.geo.setAttribute("size",this.szAttr),this.geo.setAttribute("phase",new tt(new Float32Array(e),1)),this.mat=Bt(t,{alpha:1}),this.points=new kt(this.geo,this.mat),this.points.frustumCulled=!1,this.points.renderOrder=6,Gt(this.points,t)}spawn(t,i,l,e,n,s,r,o,h){const a=this.cursor;this.cursor=(this.cursor+1)%this.n;const f=a*3;this.pos[f]=t,this.pos[f+1]=i,this.pos[f+2]=l,this.vel[f]=e,this.vel[f+1]=n,this.vel[f+2]=s,this.base[f]=r.r,this.base[f+1]=r.g,this.base[f+2]=r.b,this.life[a]=o,this.maxLife[a]=o,this.sz[a]=h,this.idle=!1}celebrate(t){if(this.n===0)return;const i=this.rng,l=F.halfLength,e=t===0?1:-1,n=Math.max(3,Math.round(et*(.5+.5*this.quality)));for(let r=0;r<n;r++){const o=r*3;this.shState[r]=1,this.shTime[r]=r*.28+i.float(0,.25),this.shFuse[r]=i.float(1,1.5);const h=r%3===0?0:1;this.shPos[o]=i.float(-34,34),this.shPos[o+1]=1,this.shPos[o+2]=e*(h?i.float(l+14,l+34):i.float(-18,18)),this.shVel[o]=i.float(-3,3),this.shVel[o+1]=i.float(30,38),this.shVel[o+2]=i.float(-3,3);const a=this.tmp.setHex(r%2?16771496:$[t]);this.shCol[o]=a.r,this.shCol[o+1]=a.g,this.shCol[o+2]=a.b}const s=F.goalHalfWidth;for(let r=0;r<ht;r++){const o=r*3;this.foTime[r]=2.8,this.foAcc[r]=0,this.foPos[o]=r%2?s:-s,this.foPos[o+1]=.5,this.foPos[o+2]=(r<2?e:-e)*(l-.6);const h=this.tmp.setHex(r<2?$[t]:16767370);this.foCol[o]=h.r,this.foCol[o+1]=h.g,this.foCol[o+2]=h.b}this.idle=!1}update(t){if(this.idle)return;const i=this.rng,l=this.tmp;let e=!1;for(let s=0;s<et;s++){const r=this.shState[s];if(r===0)continue;e=!0;const o=s*3;if(r===1){this.shTime[s]=this.shTime[s]-t,this.shTime[s]<=0&&(this.shState[s]=2);continue}if(this.shPos[o]=this.shPos[o]+this.shVel[o]*t,this.shPos[o+1]=this.shPos[o+1]+this.shVel[o+1]*t,this.shPos[o+2]=this.shPos[o+2]+this.shVel[o+2]*t,this.shVel[o+1]=this.shVel[o+1]-6*t,l.setRGB(1,.8,.45),this.spawn(this.shPos[o],this.shPos[o+1],this.shPos[o+2],i.float(-.6,.6),i.float(-3,-1),i.float(-.6,.6),l,.55,.5),this.shFuse[s]=this.shFuse[s]-t,this.shFuse[s]<=0){this.shState[s]=0;const h=Math.round(70*(.5+.5*this.quality)),a=i.chance(.5);for(let f=0;f<h;f++){const m=i.float(-1,1),u=i.float(0,Math.PI*2),v=Math.sqrt(1-m*m),x=i.float(7,15);a&&i.chance(.35)?l.setRGB(1.2,1.1,.8):l.setRGB(this.shCol[o],this.shCol[o+1],this.shCol[o+2]).multiplyScalar(1.4),this.spawn(this.shPos[o],this.shPos[o+1],this.shPos[o+2],v*Math.cos(u)*x,m*x,v*Math.sin(u)*x,l,i.float(1.4,2.4),i.float(.7,1.3))}}}for(let s=0;s<ht;s++){const r=this.foTime[s];if(r<=0)continue;e=!0,this.foTime[s]=r-t;const o=s*3;for(this.foAcc[s]=this.foAcc[s]+t*110*(.4+.6*this.quality),l.setRGB(this.foCol[o],this.foCol[o+1],this.foCol[o+2]).multiplyScalar(1.5);this.foAcc[s]>=1;){this.foAcc[s]=this.foAcc[s]-1;const h=i.float(0,Math.PI*2),a=i.float(.5,3.5);this.spawn(this.foPos[o],this.foPos[o+1],this.foPos[o+2],Math.cos(h)*a,i.float(11,17),Math.sin(h)*a,l,i.float(.8,1.4),i.float(.4,.8))}}const n=Math.max(0,1-1.1*t);for(let s=0;s<this.n;s++){const r=this.life[s],o=s*3;if(r<=0){this.szOut[s]!==0&&(this.szOut[s]=0,this.out[o]=this.out[o+1]=this.out[o+2]=0);continue}e=!0,this.life[s]=r-t,this.vel[o]=this.vel[o]*n,this.vel[o+1]=this.vel[o+1]*n+this.g[1]*t,this.vel[o+2]=this.vel[o+2]*n,this.pos[o]=this.pos[o]+this.vel[o]*t,this.pos[o+1]=this.pos[o+1]+this.vel[o+1]*t,this.pos[o+2]=this.pos[o+2]+this.vel[o+2]*t;const h=Math.max(0,r/this.maxLife[s]),a=h*h;this.out[o]=this.base[o]*a,this.out[o+1]=this.base[o+1]*a,this.out[o+2]=this.base[o+2]*a,this.szOut[s]=this.sz[s]*(.5+.5*h)}this.posAttr.needsUpdate=!0,this.colAttr.needsUpdate=!0,this.szAttr.needsUpdate=!0,e||(this.idle=!0)}dispose(){this.geo.dispose(),this.mat.dispose(),this.points.removeFromParent()}}const ut=Ce,dt=22,vt=5.5;class Ie{constructor(t){this.group=new at,this.geos=[],this.mats=[],this.lastKey=-1;const i=F.halfLength,l=F.goalDepth,e=F.goalHalfWidth,n=F.goalHeight,s=w=>{const A=w>0?[-e,0,i-ut]:[-e,0,-i-l],G=w>0?[e,n,i+l]:[e,n,-i+ut],O=pt(A[2],G[2],ut,4,[],5),k=w>0?P=>P.cz>i+1e-4:P=>P.cz<-i-1e-4;return Xt(A,G,ut,[pt(-e,e,ut,4,[],5),pt(0,n,ut,4,[],3),O],k)},r=Wt([s(1),s(-1)]);this.geos.push(r);const o=We(t);this.mats.push(o);const h=new R(r,o);h.renderOrder=2,this.group.add(h);const a=new q,f=new q;for(const w of[-1,1]){const A=w<0?0:1,G=new M($[A]),O=G.clone().multiplyScalar(.4),k=w*i,P=w*(i+l),_=w*(i+l/2),g=(C,b,S,y,z,p,d)=>{a.box(C,b,S,y,z,p,G),f.box(C,b,S,y+d,z+d,p+d,O)};g(-e,n/2,k,.4,n+.4,.6,.7),g(e,n/2,k,.4,n+.4,.6,.7),g(0,n,k,2*e+.4,.4,.6,.7),g(-e,n/2,P,.28,n,.28,.45),g(e,n/2,P,.28,n,.28,.45),g(0,n,P,2*e,.28,.28,.45),g(-e,n,_,.28,.28,l,.45),g(e,n,_,.28,.28,l,.45)}const m=a.build(),u=f.build();this.geos.push(m,u);const v=mt(t,0,1.15),x=mt(t,2,1,.28);this.mats.push(v,x),this.group.add(new R(m,v));const T=new R(u,x);T.renderOrder=4,this.group.add(T),this.canvas=document.createElement("canvas"),this.canvas.width=512,this.canvas.height=128,this.ctx=this.canvas.getContext("2d"),this.tex=new ne(this.canvas),this.tex.colorSpace=ae,this.tex.anisotropy=4,this.boardMat=new nt({map:this.tex,toneMapped:!1}),this.mats.push(this.boardMat);const E=w=>{const A=new At(dt,vt);return w>0&&A.rotateY(Math.PI),A.translate(0,11.2,w*(i+.9)),A},D=Wt([E(1),E(-1)]);this.geos.push(D),this.group.add(new R(D,this.boardMat));const I=new q;for(const w of[-1,1]){const A=new M($[w<0?0:1]).multiplyScalar(1.3),G=w*(i+1);I.box(0,11.2+vt/2+.15,G,dt+.8,.28,.5,A),I.box(0,11.2-vt/2-.15,G,dt+.8,.28,.5,A),I.box(-dt/2-.2,11.2,G,.28,vt+.6,.5,A),I.box(dt/2+.2,11.2,G,.28,vt+.6,.5,A),I.box(-6,5.5,w*(i+1.5),.3,11,.3,new M(.12,.13,.2)),I.box(6,5.5,w*(i+1.5),.3,11,.3,new M(.12,.13,.2))}const B=I.build();this.geos.push(B);const U=mt(t,0,1);this.mats.push(U),this.group.add(new R(B,U)),this.drawBoard(0,0,"5:00","")}drawBoard(t,i,l,e){const n=this.ctx,s=512,r=128,o=n.createLinearGradient(0,0,0,r);o.addColorStop(0,"#0a0d1c"),o.addColorStop(1,"#04050c"),n.fillStyle=o,n.fillRect(0,0,s,r);const h="#"+new M($[0]).getHexString(),a="#"+new M($[1]).getHexString(),f=n.createLinearGradient(0,0,190,0);f.addColorStop(0,h+"66"),f.addColorStop(1,h+"00"),n.fillStyle=f,n.fillRect(0,0,190,r);const m=n.createLinearGradient(s,0,s-190,0);m.addColorStop(0,a+"66"),m.addColorStop(1,a+"00"),n.fillStyle=m,n.fillRect(s-190,0,190,r),n.lineWidth=6,n.strokeStyle=h,n.beginPath(),n.moveTo(0,3),n.lineTo(s/2-70,3),n.moveTo(0,r-3),n.lineTo(s/2-70,r-3),n.stroke(),n.strokeStyle=a,n.beginPath(),n.moveTo(s,3),n.lineTo(s/2+70,3),n.moveTo(s,r-3),n.lineTo(s/2+70,r-3),n.stroke(),n.textAlign="center",n.textBaseline="middle",n.shadowBlur=18,n.font='800 18px "Segoe UI", Arial, sans-serif',n.shadowColor=h,n.fillStyle=h,n.fillText("NOVA",92,20),n.shadowColor=a,n.fillStyle=a,n.fillText("FLUX",s-92,20),n.font='900 78px "Arial Black", Impact, "Segoe UI", sans-serif',n.shadowColor=h,n.fillStyle="#ffffff",n.fillText(String(t),92,78),n.shadowColor=a,n.fillText(String(i),s-92,78),n.shadowColor="#ffffff",n.shadowBlur=10,n.font='800 46px "Segoe UI", Arial, sans-serif',n.fillStyle="#e8ecff",n.fillText(l,s/2,e?52:64),e&&(n.font='800 20px "Segoe UI", Arial, sans-serif',n.fillStyle="#9fb0ff",n.fillText(e,s/2,100)),n.shadowBlur=0,this.tex.needsUpdate=!0}update(t){const i=Math.max(0,Math.ceil(t.clock)),l=t.phase==="countdown"?1:t.phase==="goal"?2:t.phase==="ended"?3:0,e=l===1?Math.max(1,Math.ceil(t.phaseTimer)):0,n=((t.score[0]*64+t.score[1])*8+l)*8+e+(t.overtime?.5:0)+i*1e6;if(n===this.lastKey)return;this.lastKey=n;let s,r="";l===1?(s=String(e),r="ANSTOSS"):l===2?s="TREFFER":l===3?s="ENDE":t.overtime?s="GOLDEN GOAL":s=Math.floor(i/60)+":"+String(i%60).padStart(2,"0"),this.drawBoard(t.score[0],t.score[1],s,r)}dispose(){this.tex.dispose();for(const t of this.geos)t.dispose();for(const t of this.mats)t.dispose();this.group.removeFromParent()}}function Ue(c=64){const t=new Uint8Array(c*c*4);for(let l=0;l<c;l++)for(let e=0;e<c;e++){const n=Math.hypot((e+.5)/c-.5,(l+.5)/c-.5)*2,s=Math.pow(Math.max(0,1-n),2.2),r=(l*c+e)*4;t[r]=t[r+1]=t[r+2]=255,t[r+3]=Math.round(s*255)}const i=new ue(t,c,c,fe);return i.magFilter=i.minFilter=pe,i.needsUpdate=!0,i}function it(c){return c.rotateX(-Math.PI/2),c}class _e{constructor(t){this.group=new at,this.built=!1,this.count=0,this.slot=[],this.wasActive=[],this.pop=new Float32Array(0),this.tex=null,this.dummy=new $t,this.tmp=new M,this.meshes=[],this.geos=[],this.mats=[],this.time=0,this.cOff=new M(t.padOff),this.cBig=new M(t.padBig),this.cSmall=new M(t.padSmall)}build(t){this.built=!0,this.count=t.length;let i=0,l=0;for(const T of t)this.slot.push(T.big?l++:i++),this.wasActive.push(!0);this.pop=new Float32Array(t.length);const e=new q;e.place(new ft(1.1,1.24,.12,6),0,.06,0,0,Math.PI/6,0,1,X(.05)),e.place(it(new St(.82,6)),0,.126,0,0,0,Math.PI/6,1,X(.6)),e.place(it(new Pt(.9,1.02,6)),0,.13,0,0,0,Math.PI/6,1,X(1.4));const n=new re;n.moveTo(0,.46),n.lineTo(.26,0),n.lineTo(0,-.46),n.lineTo(-.26,0),n.closePath(),e.place(it(new le(n)),0,.134,0,0,0,0,1,X(1.8));const s=e.build();this.geos.push(s);const r=new nt({vertexColors:!0});this.mats.push(r);const o=new q;o.place(new ft(2.45,2.75,.3,6),0,.15,0,0,Math.PI/6,0,.66,X(.05)),o.place(it(new Pt(1.95,2.28,6)),0,.312,0,0,0,Math.PI/6,.66,X(1.4)),o.place(it(new St(1.75,6)),0,.308,0,0,0,Math.PI/6,.66,X(.3)),o.place(it(new Pt(1.2,1.35,6)),0,.314,0,0,0,Math.PI/6,.66,X(.9));const h=o.build();this.geos.push(h);const a=new q,f=new Nt(.72,0);f.scale(1,1.45,1),a.place(f,0,0,0,0,0,0,1,X(.95)),a.place(new Ct(1,.06,6,36),0,0,0,Math.PI/2,0,0,1,X(1.8)),a.place(new Ct(1.18,.045,6,36),0,0,0,Math.PI/2-.5,0,.35,1,X(1.2)),a.place(new Nt(.16,0),0,1.38,0,0,0,0,1,X(2.2));const m=a.build();this.geos.push(m);const u=new nt({vertexColors:!0});this.mats.push(u),this.tex=Ue();const v=it(new At(1,1));this.geos.push(v);const x=new nt({map:this.tex,transparent:!0,depthWrite:!1,blending:Tt});this.mats.push(x),this.small=new gt(s,r,Math.max(1,i)),this.big=new gt(h,r,Math.max(1,l)),this.can=new gt(m,u,Math.max(1,l)),this.halo=new gt(v,x,t.length),this.meshes=[this.small,this.big,this.can,this.halo];for(const T of this.meshes)T.frustumCulled=!1,T.instanceMatrix.setUsage(Mt),T.setColorAt(0,this.cOff),T.instanceColor.setUsage(Mt),this.group.add(T);this.small.count=i,this.big.count=l,this.can.count=l,this.halo.renderOrder=3}update(t,i){const l=i.pads;if(!this.built||l.length!==this.count){if(this.built&&this.clear(),l.length===0)return;this.build(l)}this.time+=t;const e=this.time,n=this.dummy;for(let s=0;s<l.length;s++){const r=l[s],o=r.big?ce:he,h=r.active?1:Math.min(1,Math.max(0,1-r.timer/o));r.active&&!this.wasActive[s]&&(this.pop[s]=1),this.wasActive[s]=r.active,this.pop[s]=Math.max(0,this.pop[s]-t*2.2);const a=this.pop[s],f=r.active?1:yt(.72,1,h),m=r.active?1:yt(.55,1,h)*.55,u=r.big?this.cBig:this.cSmall,v=this.slot[s],x=Math.max(0,r.pos[1]);this.tmp.copy(this.cOff).lerp(u,m),a>0&&this.tmp.lerp(_t,a*.7);const T=r.big?this.big:this.small;if(n.position.set(r.pos[0],x-(1-f)*.09,r.pos[2]),n.rotation.set(0,0,0),n.scale.set(1,.45+.55*f,1),n.updateMatrix(),T.setMatrixAt(v,n.matrix),T.setColorAt(v,this.tmp),r.big){const I=r.active?1+a*.35:yt(.8,1,h)*.9;n.position.set(r.pos[0],x+1.55+Math.sin(e*2.1+s)*.16,r.pos[2]),n.rotation.set(0,e*1.5+s,0),n.scale.setScalar(Math.max(1e-4,I)),n.updateMatrix(),this.can.setMatrixAt(v,n.matrix),this.tmp.copy(u).multiplyScalar(r.active?1:.35+.65*yt(.8,1,h)),a>0&&this.tmp.lerp(_t,a*.6),this.can.setColorAt(v,this.tmp)}const E=r.big?4.4:3;n.position.set(r.pos[0],x+.05,r.pos[2]),n.rotation.set(0,0,0),n.scale.setScalar(E*(1+a*.5)),n.updateMatrix(),this.halo.setMatrixAt(s,n.matrix);const D=r.active?.45+.12*Math.sin(e*3+s*1.7)+a*1.3:.05+m*.12;this.tmp.copy(u).multiplyScalar(D),this.halo.setColorAt(s,this.tmp)}this.small.instanceMatrix.needsUpdate=!0,this.big.instanceMatrix.needsUpdate=!0,this.can.instanceMatrix.needsUpdate=!0,this.halo.instanceMatrix.needsUpdate=!0;for(let s=0;s<4;s++)this.meshes[s].instanceColor.needsUpdate=!0}clear(){for(const t of this.meshes)t.dispose(),t.removeFromParent();this.disposeShared(),this.slot=[],this.wasActive=[],this.built=!1}disposeShared(){for(const t of this.geos)t.dispose();for(const t of this.mats)t.dispose();this.geos.length=0,this.mats.length=0,this.tex?.dispose(),this.tex=null}dispose(){this.built&&this.clear(),this.group.removeFromParent()}}const _t=new M(1,1,1),X=c=>new M(c,c,c);function yt(c,t,i){const l=Math.min(1,Math.max(0,(i-c)/(t-c)));return l*l*(3-2*l)}class Re{constructor(){this.group=new at,this.built=!1,this.items=[],this.geos=[],this.mats=[],this.time=0}build(t){if(this.built=!0,!t.rings.length)return;const i=me*.82,l=new Ct(i,.16,10,48),e=new Ct(i*.78,.07,8,40),n=new St(i*.76,40);this.geos.push(l,e,n);for(const s of t.rings){const r=new nt({color:16761405,toneMapped:!1}),o=new nt({color:16773552,toneMapped:!1,transparent:!0,opacity:.85}),h=new nt({color:16761405,transparent:!0,opacity:.12,side:zt,depthWrite:!1,blending:Tt});this.mats.push(r,o,h);const a=new at;a.position.set(s.pos[0],s.pos[1],s.pos[2]);const f=new R(l,r),m=new R(e,o),u=new R(n,h);a.add(f,m,u),this.group.add(a),this.items.push({root:a,outer:f,inner:m,disc:u,was:!0,pop:0})}}update(t,i){this.built||this.build(i),this.time+=t;const l=this.time;this.items.forEach((e,n)=>{const s=i.rings[n];if(!s)return;const r=s.timer<=0;r&&!e.was&&(e.pop=1),e.was=r,e.pop=Math.max(0,e.pop-t*2.5),e.root.rotation.y=l*.6+n*1.3,e.inner.rotation.z=-l*1.8,e.outer.rotation.z=l*.7,e.root.position.y=s.pos[1]+Math.sin(l*1.6+n)*.25;const o=r?1+e.pop*.5+Math.sin(l*4+n)*.03:.55;e.root.scale.setScalar(o),e.outer.material.color.setHex(r?16761405:3814736),e.inner.material.opacity=r?.85:.2,e.disc.material.opacity=r?.1+Math.sin(l*3+n)*.05+e.pop*.4:0})}dispose(){this.geos.forEach(t=>t.dispose()),this.mats.forEach(t=>t.dispose())}}class He{constructor(t,i,l,e){this.group=new at,this.geos=[],this.mats=[];const n=t==="neon"?0:t==="eis"?1:2,s=g=>(this.geos.push(g),g),r=g=>(this.mats.push(g),g),o=new R(s(new de(100,32,18)),r(Be(i,l,n)));o.frustumCulled=!1,o.renderOrder=-100,o.onBeforeRender=(g,C,b)=>{o.position.copy(b.position)},this.group.add(o);const h=new R(s(new St(1100,64).rotateX(-Math.PI/2)),r(Ge(i,l,n)));h.position.y=-.06,this.group.add(h);const a=new q;if(t==="neon"){const g=[658210,856112,1378864,726056];for(let C=0;C<90;C++){const b=C/90*Math.PI*2+e.float(-.03,.03),S=e.float(165,380),y=(30+e.next()*e.next()*190)*(.7+(S-165)/380),z=e.float(12,38),p=Math.cos(b)*S,d=Math.sin(b)*S,W=e.pick(g),L=e.next()*10;a.box(p,y/2-1,d,z,y+2,e.float(12,34),W,[L,y],b+e.float(-.3,.3)),e.chance(.3)&&a.box(p,y+6,d,1.2,12,1.2,W,[L,y+12],0),e.chance(.25)&&a.box(p,y+2,d,z*.6,4,z*.6,W,[L+1,y+4],b)}}else if(t==="eis"){const g=[10474224,7320804,13626111,5083336];for(let C=0;C<70;C++){const b=e.float(0,Math.PI*2),S=e.float(175,360),y=e.float(30,150)*(.8+(S-175)/400),z=e.float(9,26),p=new ft(z*e.float(0,.12),z,y,6,1),d=Math.cos(b)*S,W=Math.sin(b)*S;if(a.place(p,d,y/2-2,W,e.float(-.12,.12),e.float(0,6),e.float(-.14,.14),1,e.pick(g)),e.chance(.6)){const L=new ft(0,z*.55,y*.6,6,1);a.place(L,d+e.float(-14,14),y*.3-2,W+e.float(-14,14),e.float(-.3,.3),e.float(0,6),e.float(-.3,.3),1,e.pick(g))}}}else{const g=[11029026,12935724,9058844,14254136];for(let C=0;C<60;C++){const b=C/60*Math.PI*2+e.float(-.05,.05),S=e.float(150,390),y=e.float(28,130)*(.8+(S-150)/500),z=e.float(26,70),p=new ft(z*e.float(.55,.8),z,y,7,1),d=Math.cos(b)*S,W=Math.sin(b)*S;if(a.place(p,d,y/2-2,W,0,e.float(0,6),0,[e.float(.8,1.3),1,e.float(.8,1.3)],e.pick(g)),e.chance(.5)){const L=new ft(z*.3,z*.5,y*.55,6,1);a.place(L,d+e.float(-z,z),y*.27-2,W+e.float(-z,z),0,e.float(0,6),0,1,e.pick(g))}}}if(!a.empty){const g=new R(s(a.build()),r(bt(i,l,n)));g.frustumCulled=!1,this.group.add(g)}if(t==="eis"){const g=new ve(new Kt(150,2));s(g);const C=r(new ge({color:l.lineB,transparent:!0,opacity:.22})),b=new we(g,C);b.position.y=-2,b.frustumCulled=!1,this.group.add(b)}const f=new q,m=new q,u=new q,v=new M(l.mast),x=new M(l.lamp).multiplyScalar(1.6),T=new M(l.beam),E=new Vt,D=new qt,I=new Q(0,-1,0),B=new Q,U=50,w=118,A=new xe(19,w,22,1,!0).translate(0,-w/2,0),G=F.halfWidth+26,O=F.halfLength+F.goalDepth+22;for(const g of[-1,1])for(const C of[-1,1]){const b=g*G,S=C*O;f.box(b,U/2,S,1.6,U,1.6,v),f.box(b,2,S,4,4,4,v);const y=Math.atan2(-b,-S);f.box(b,U+.3,S,10,6.6,.8,v,void 0,y);for(let z=0;z<2;z++)for(let p=-2;p<=2;p++){const d=Math.cos(y)*p*1.8,W=-Math.sin(y)*p*1.8;m.box(b+d+Math.sin(y)*.55,U-1.4+z*2.6+.3,S+W+Math.cos(y)*.55,1.4,1.8,.3,x,void 0,y)}B.set(-b,-50.3,-S).normalize(),E.setFromUnitVectors(I,B),D.setFromQuaternion(E),u.place(A,b+Math.sin(y)*.9,U+.3,S+Math.cos(y)*.9,D.x,D.y,D.z,1,T)}s(A);const k=new R(s(f.build()),r(bt(i,l,3)));k.frustumCulled=!1;const P=new R(s(m.build()),r(mt(i,0,1))),_=new R(s(u.build()),r(mt(i,1,1,l.beamAlpha)));if(_.renderOrder=1,_.frustumCulled=!1,this.group.add(k,P,_),t==="canyon"){const g=new q,C=[],b=[],S=[],y=[],z=[],p=F.halfWidth+3.5+10*1.25+4,d=F.halfLength+F.goalDepth+3.5+8*1.25+4;for(let V=-d+6;V<=d-6;V+=13)z.push([-p,V],[p,V]);for(let V=-p+14;V<=p-14;V+=14)z.push([V,-d],[V,d]);const W=new M(2757644),L=new M;for(const[V,wt]of z){g.box(V,2.2,wt,.3,4.4,.3,W),g.box(V,4.5,wt,.9,.5,.9,W);for(let Dt=0;Dt<6;Dt++)C.push(V+e.float(-.25,.25),5+e.float(0,.9),wt+e.float(-.25,.25)),L.setRGB(1,.45+e.next()*.3,.1).multiplyScalar(e.float(1,1.7)),b.push(L.r,L.g,L.b),S.push(e.float(.9,1.7)),y.push(e.next());C.push(V,5.4,wt),b.push(.5,.2,.04),S.push(7),y.push(e.next())}const H=new R(s(g.build()),r(bt(i,l,3)));H.frustumCulled=!1,this.group.add(H);const J=s(new rt);J.setAttribute("position",new j(C,3)),J.setAttribute("color",new j(b,3)),J.setAttribute("size",new j(S,1)),J.setAttribute("phase",new j(y,1));const Y=new kt(J,r(Bt(i,{flicker:!0})));Y.frustumCulled=!1,Gt(Y,i),this.group.add(Y)}}dispose(){for(const t of this.geos)t.dispose();for(const t of this.mats)t.dispose();this.group.removeFromParent()}}const Oe=7,Rt=3.2,Ht=4;class Ve{constructor(t,i){this.group=new at,this.scene=null,this.geos=[],this.mats=[],this.time=0,this.flashAge=[1/0,1/0],this.pulseAge=1/0,this.cheerAge=1/0;const l=Te(t),e=ke(l);this.u=e;const n=new ye(be("turbokick-arena-"+t)),s=F.halfWidth,r=F.height,o=F.halfLength,h=F.coveRadius,a=F.goalHalfWidth,f=F.goalHeight;this.fog=new Me(l.fog,l.fogDensity),this.hemi=new Ae(l.hemiSky,l.hemiGround,l.hemiIntensity*2),this.sun=new Se(l.lightCol,l.lightIntensity*2.2);const m=new Q(...l.lightDir).normalize().multiplyScalar(90);this.sun.position.copy(m),this.sun.castShadow=i.shadows,this.sun.shadow.mapSize.set(2048,2048);const u=this.sun.shadow.camera;u.left=-66,u.right=66,u.top=74,u.bottom=-74,u.near=20,u.far=220,u.updateProjectionMatrix(),this.sun.shadow.bias=-4e-4,this.sun.shadow.normalBias=.03,this.group.add(this.hemi,this.sun,this.sun.target);const v=Xt([-s,0,-o],[s,r,o],h,[pt(-s,s,h,8,[-a,a],4),pt(0,r,h,8,[f],3),pt(-o,o,h,8,[],6)],w=>w.maxY<1e-4?!1:!(Math.abs(w.cx)<a&&w.cy<f&&Math.abs(w.cz)>o-h+.001));this.geos.push(v);const x=Pe(e,l);this.mats.push(x);const T=new R(v,x);T.renderOrder=2,T.frustumCulled=!1,this.group.add(T);const E=new At(2*(s-h),2*(o-h)).rotateX(-Math.PI/2),D=w=>new At(2*a,h).rotateX(-Math.PI/2).translate(0,0,w*(o-h/2)),I=Wt([E,D(1),D(-1)]);this.geos.push(I);const B=Fe(e,l);this.mats.push(B);const U=new R(I,B);U.receiveShadow=!0,this.group.add(U),this.pads=new _e(l),this.rings=new Re,this.goals=new Ie(e),this.stands=new De(e,l,i.particles,n.fork(1)),this.scenery=new He(t,e,l,n.fork(2)),this.weather=new Ne(t,e,i.particles,n.fork(3)),this.fireworks=new Ee(e,i.particles,n.fork(4)),this.group.add(this.pads.group,this.rings.group,this.goals.group,this.stands.group,this.scenery.group,this.weather.points,this.fireworks.points)}applyTo(t){this.scene=t,t.fog=this.fog,t.background=this.fog.color}update(t,i){this.time+=t;const l=this.u;l.uTime.value=this.time,l.uBall.value.set(i.ball.pos[0],i.ball.pos[1],i.ball.pos[2]),this.flashAge[0]+=t,this.flashAge[1]+=t,this.pulseAge+=t,this.cheerAge+=t,l.uFlash.value.set(Ot(this.flashAge[0]),Ot(this.flashAge[1]));const e=this.pulseAge<Ht?1-this.pulseAge/Ht:0;l.uPulse.value=e>0?e*e*(.65+.35*Math.sin(this.pulseAge*11)):0;const n=Math.max(0,1-this.cheerAge/Oe);l.uCheer.value=Math.min(1,n*2.2)*(n>0?1:0),this.pads.update(t,i),this.rings.update(t,i),this.goals.update(i),this.weather.update(t),this.fireworks.update(t)}celebrate(t){this.flashAge[t===0?1:0]=0,this.pulseAge=0,this.cheerAge=0,this.u.uPulseCol.value.setHex($[t]),this.fireworks.celebrate(t)}setQuality(t){this.sun.castShadow=t.shadows}dispose(){this.scene&&this.scene.fog===this.fog&&(this.scene.fog=null),this.sun.shadow.map?.dispose(),this.pads.dispose(),this.rings.dispose(),this.goals.dispose(),this.stands.dispose(),this.scenery.dispose(),this.weather.dispose(),this.fireworks.dispose();for(const t of this.geos)t.dispose();for(const t of this.mats)t.dispose();this.group.removeFromParent()}}function Ot(c){if(!(c<Rt))return 0;const t=1-c/Rt;return Math.min(1,t*(.55+.45*Math.sin(c*20))+(c<.25?.6:0))}function Ke(c,t){return ze.some(i=>i.id===c)||(c="neon"),new Ve(c,t)}export{Ke as c};
