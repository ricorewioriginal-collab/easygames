(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function e(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=e(s);fetch(s.href,r)}})();/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Xc="170",Sp=0,Sh=1,Ep=2,wf=1,bp=2,ai=3,pi=0,tn=1,bn=2,Bi=0,Js=1,Eh=2,bh=3,Th=4,Tp=5,hs=100,Ap=101,wp=102,Rp=103,Cp=104,Lp=200,Dp=201,Pp=202,Ip=203,Vl=204,Wl=205,Np=206,Op=207,Up=208,kp=209,zp=210,Fp=211,Bp=212,Hp=213,Gp=214,Xl=0,$l=1,ql=2,nr=3,Kl=4,Yl=5,jl=6,Zl=7,Rf=0,Vp=1,Wp=2,Hi=0,Xp=1,$p=2,qp=3,Kp=4,Yp=5,jp=6,Zp=7,Cf=300,ir=301,sr=302,Jl=303,Ql=304,Do=306,go=1e3,fs=1001,tc=1002,en=1003,Jp=1004,xa=1005,_n=1006,Yo=1007,Yn=1008,mi=1009,Lf=1010,Df=1011,Jr=1012,$c=1013,gs=1014,oi=1015,la=1016,qc=1017,Kc=1018,rr=1020,Pf=35902,If=1021,Nf=1022,wn=1023,Of=1024,Uf=1025,Qs=1026,ar=1027,kf=1028,Yc=1029,zf=1030,jc=1031,Zc=1033,eo=33776,no=33777,io=33778,so=33779,ec=35840,nc=35841,ic=35842,sc=35843,rc=36196,ac=37492,oc=37496,lc=37808,cc=37809,hc=37810,uc=37811,fc=37812,dc=37813,pc=37814,mc=37815,gc=37816,_c=37817,vc=37818,xc=37819,Mc=37820,yc=37821,ro=36492,Sc=36494,Ec=36495,Ff=36283,bc=36284,Tc=36285,Ac=36286,Qp=3200,tm=3201,em=0,nm=1,Ni="",Sn="srgb",ur="srgb-linear",Po="linear",de="srgb",Ts=7680,Ah=519,im=512,sm=513,rm=514,Bf=515,am=516,om=517,lm=518,cm=519,wc=35044,wh="300 es",li=2e3,_o=2001;class fr{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const s=this._listeners[t];if(s!==void 0){const r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const n=this._listeners[t.type];if(n!==void 0){t.target=this;const s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}}const Ge=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],ao=Math.PI/180,Rc=180/Math.PI;function Gi(){const i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ge[i&255]+Ge[i>>8&255]+Ge[i>>16&255]+Ge[i>>24&255]+"-"+Ge[t&255]+Ge[t>>8&255]+"-"+Ge[t>>16&15|64]+Ge[t>>24&255]+"-"+Ge[e&63|128]+Ge[e>>8&255]+"-"+Ge[e>>16&255]+Ge[e>>24&255]+Ge[n&255]+Ge[n>>8&255]+Ge[n>>16&255]+Ge[n>>24&255]).toLowerCase()}function ln(i,t,e){return Math.max(t,Math.min(e,i))}function hm(i,t){return(i%t+t)%t}function jo(i,t,e){return(1-e)*i+e*t}function qn(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function me(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}class Yt{constructor(t=0,e=0){Yt.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(ln(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*s+t.x,this.y=r*s+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Vt{constructor(t,e,n,s,r,a,o,l,c){Vt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c)}set(t,e,n,s,r,a,o,l,c){const h=this.elements;return h[0]=t,h[1]=s,h[2]=o,h[3]=e,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],f=n[2],d=n[5],g=n[8],v=s[0],m=s[3],p=s[6],x=s[1],y=s[4],M=s[7],C=s[2],A=s[5],w=s[8];return r[0]=a*v+o*x+l*C,r[3]=a*m+o*y+l*A,r[6]=a*p+o*M+l*w,r[1]=c*v+h*x+u*C,r[4]=c*m+h*y+u*A,r[7]=c*p+h*M+u*w,r[2]=f*v+d*x+g*C,r[5]=f*m+d*y+g*A,r[8]=f*p+d*M+g*w,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8];return e*a*h-e*o*c-n*r*h+n*o*l+s*r*c-s*a*l}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=h*a-o*c,f=o*l-h*r,d=c*r-a*l,g=e*u+n*f+s*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/g;return t[0]=u*v,t[1]=(s*c-h*n)*v,t[2]=(o*n-s*a)*v,t[3]=f*v,t[4]=(h*e-s*l)*v,t[5]=(s*r-o*e)*v,t[6]=d*v,t[7]=(n*l-c*e)*v,t[8]=(a*e-n*r)*v,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+t,-s*c,s*l,-s*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return this.premultiply(Zo.makeScale(t,e)),this}rotate(t){return this.premultiply(Zo.makeRotation(-t)),this}translate(t,e){return this.premultiply(Zo.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const Zo=new Vt;function Hf(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function vo(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function um(){const i=vo("canvas");return i.style.display="block",i}const Rh={};function zr(i){i in Rh||(Rh[i]=!0,console.warn(i))}function fm(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}function dm(i){const t=i.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function pm(i){const t=i.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}const re={enabled:!0,workingColorSpace:ur,spaces:{},convert:function(i,t,e){return this.enabled===!1||t===e||!t||!e||(this.spaces[t].transfer===de&&(i.r=hi(i.r),i.g=hi(i.g),i.b=hi(i.b)),this.spaces[t].primaries!==this.spaces[e].primaries&&(i.applyMatrix3(this.spaces[t].toXYZ),i.applyMatrix3(this.spaces[e].fromXYZ)),this.spaces[e].transfer===de&&(i.r=tr(i.r),i.g=tr(i.g),i.b=tr(i.b))),i},fromWorkingColorSpace:function(i,t){return this.convert(i,this.workingColorSpace,t)},toWorkingColorSpace:function(i,t){return this.convert(i,t,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===Ni?Po:this.spaces[i].transfer},getLuminanceCoefficients:function(i,t=this.workingColorSpace){return i.fromArray(this.spaces[t].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,t,e){return i.copy(this.spaces[t].toXYZ).multiply(this.spaces[e].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}};function hi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function tr(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}const Ch=[.64,.33,.3,.6,.15,.06],Lh=[.2126,.7152,.0722],Dh=[.3127,.329],Ph=new Vt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Ih=new Vt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);re.define({[ur]:{primaries:Ch,whitePoint:Dh,transfer:Po,toXYZ:Ph,fromXYZ:Ih,luminanceCoefficients:Lh,workingColorSpaceConfig:{unpackColorSpace:Sn},outputColorSpaceConfig:{drawingBufferColorSpace:Sn}},[Sn]:{primaries:Ch,whitePoint:Dh,transfer:de,toXYZ:Ph,fromXYZ:Ih,luminanceCoefficients:Lh,outputColorSpaceConfig:{drawingBufferColorSpace:Sn}}});let As;class mm{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{As===void 0&&(As=vo("canvas")),As.width=t.width,As.height=t.height;const n=As.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=As}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=vo("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=hi(r[a]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(hi(e[n]/255)*255):e[n]=hi(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let gm=0;class Gf{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:gm++}),this.uuid=Gi(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Jo(s[a].image)):r.push(Jo(s[a]))}else r=Jo(s);n.url=r}return e||(t.images[this.uuid]=n),n}}function Jo(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?mm.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let _m=0;class $e extends fr{constructor(t=$e.DEFAULT_IMAGE,e=$e.DEFAULT_MAPPING,n=fs,s=fs,r=_n,a=Yn,o=wn,l=mi,c=$e.DEFAULT_ANISOTROPY,h=Ni){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:_m++}),this.uuid=Gi(),this.name="",this.source=new Gf(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Yt(0,0),this.repeat=new Yt(1,1),this.center=new Yt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Vt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Cf)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case go:t.x=t.x-Math.floor(t.x);break;case fs:t.x=t.x<0?0:1;break;case tc:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case go:t.y=t.y-Math.floor(t.y);break;case fs:t.y=t.y<0?0:1;break;case tc:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}$e.DEFAULT_IMAGE=null;$e.DEFAULT_MAPPING=Cf;$e.DEFAULT_ANISOTROPY=1;class De{constructor(t=0,e=0,n=0,s=1){De.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*s+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r;const l=t.elements,c=l[0],h=l[4],u=l[8],f=l[1],d=l[5],g=l[9],v=l[2],m=l[6],p=l[10];if(Math.abs(h-f)<.01&&Math.abs(u-v)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+v)<.1&&Math.abs(g+m)<.1&&Math.abs(c+d+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const y=(c+1)/2,M=(d+1)/2,C=(p+1)/2,A=(h+f)/4,w=(u+v)/4,L=(g+m)/4;return y>M&&y>C?y<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(y),s=A/n,r=w/n):M>C?M<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(M),n=A/s,r=L/s):C<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(C),n=w/r,s=L/r),this.set(n,s,r,e),this}let x=Math.sqrt((m-g)*(m-g)+(u-v)*(u-v)+(f-h)*(f-h));return Math.abs(x)<.001&&(x=1),this.x=(m-g)/x,this.y=(u-v)/x,this.z=(f-h)/x,this.w=Math.acos((c+d+p-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class vm extends fr{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new De(0,0,t,e),this.scissorTest=!1,this.viewport=new De(0,0,t,e);const s={width:t,height:e,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:_n,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const r=new $e(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];const a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,s=t.textures.length;n<s;n++)this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const e=Object.assign({},t.texture.image);return this.texture.source=new Gf(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class _s extends vm{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class Vf extends $e{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=en,this.minFilter=en,this.wrapR=fs,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class xm extends $e{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=en,this.minFilter=en,this.wrapR=fs,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class ca{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,a,o){let l=n[s+0],c=n[s+1],h=n[s+2],u=n[s+3];const f=r[a+0],d=r[a+1],g=r[a+2],v=r[a+3];if(o===0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u;return}if(o===1){t[e+0]=f,t[e+1]=d,t[e+2]=g,t[e+3]=v;return}if(u!==v||l!==f||c!==d||h!==g){let m=1-o;const p=l*f+c*d+h*g+u*v,x=p>=0?1:-1,y=1-p*p;if(y>Number.EPSILON){const C=Math.sqrt(y),A=Math.atan2(C,p*x);m=Math.sin(m*A)/C,o=Math.sin(o*A)/C}const M=o*x;if(l=l*m+f*M,c=c*m+d*M,h=h*m+g*M,u=u*m+v*M,m===1-o){const C=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=C,c*=C,h*=C,u*=C}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,s,r,a){const o=n[s],l=n[s+1],c=n[s+2],h=n[s+3],u=r[a],f=r[a+1],d=r[a+2],g=r[a+3];return t[e]=o*g+h*u+l*d-c*f,t[e+1]=l*g+h*f+c*u-o*d,t[e+2]=c*g+h*d+o*f-l*u,t[e+3]=h*g-o*u-l*f-c*d,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(s/2),u=o(r/2),f=l(n/2),d=l(s/2),g=l(r/2);switch(a){case"XYZ":this._x=f*h*u+c*d*g,this._y=c*d*u-f*h*g,this._z=c*h*g+f*d*u,this._w=c*h*u-f*d*g;break;case"YXZ":this._x=f*h*u+c*d*g,this._y=c*d*u-f*h*g,this._z=c*h*g-f*d*u,this._w=c*h*u+f*d*g;break;case"ZXY":this._x=f*h*u-c*d*g,this._y=c*d*u+f*h*g,this._z=c*h*g+f*d*u,this._w=c*h*u-f*d*g;break;case"ZYX":this._x=f*h*u-c*d*g,this._y=c*d*u+f*h*g,this._z=c*h*g-f*d*u,this._w=c*h*u+f*d*g;break;case"YZX":this._x=f*h*u+c*d*g,this._y=c*d*u+f*h*g,this._z=c*h*g-f*d*u,this._w=c*h*u-f*d*g;break;case"XZY":this._x=f*h*u-c*d*g,this._y=c*d*u-f*h*g,this._z=c*h*g+f*d*u,this._w=c*h*u+f*d*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],s=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],h=e[6],u=e[10],f=n+o+u;if(f>0){const d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(h-l)*d,this._y=(r-c)*d,this._z=(a-s)*d}else if(n>o&&n>u){const d=2*Math.sqrt(1+n-o-u);this._w=(h-l)/d,this._x=.25*d,this._y=(s+a)/d,this._z=(r+c)/d}else if(o>u){const d=2*Math.sqrt(1+o-n-u);this._w=(r-c)/d,this._x=(s+a)/d,this._y=.25*d,this._z=(l+h)/d}else{const d=2*Math.sqrt(1+u-n-o);this._w=(a-s)/d,this._x=(r+c)/d,this._y=(l+h)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(ln(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,s=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-s*o,this._w=a*h-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const n=this._x,s=this._y,r=this._z,a=this._w;let o=a*t._w+n*t._x+s*t._y+r*t._z;if(o<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,o=-o):this.copy(t),o>=1)return this._w=a,this._x=n,this._y=s,this._z=r,this;const l=1-o*o;if(l<=Number.EPSILON){const d=1-e;return this._w=d*a+e*this._w,this._x=d*n+e*this._x,this._y=d*s+e*this._y,this._z=d*r+e*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,o),u=Math.sin((1-e)*h)/c,f=Math.sin(e*h)/c;return this._w=a*u+this._w*f,this._x=n*u+this._x*f,this._y=s*u+this._y*f,this._z=r*u+this._z*f,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class O{constructor(t=0,e=0,n=0){O.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Nh.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Nh.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(t){const e=this.x,n=this.y,s=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*s-o*n),h=2*(o*e-r*s),u=2*(r*n-a*e);return this.x=e+l*c+a*u-o*h,this.y=n+l*h+o*c-r*u,this.z=s+l*u+r*h-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,s=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Qo.copy(this).projectOnVector(t),this.sub(Qo)}reflect(t){return this.sub(Qo.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(ln(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Qo=new O,Nh=new ca;class ha{constructor(t=new O(1/0,1/0,1/0),e=new O(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(Nn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(Nn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=Nn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,Nn):Nn.fromBufferAttribute(r,a),Nn.applyMatrix4(t.matrixWorld),this.expandByPoint(Nn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Ma.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Ma.copy(n.boundingBox)),Ma.applyMatrix4(t.matrixWorld),this.union(Ma)}const s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Nn),Nn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(yr),ya.subVectors(this.max,yr),ws.subVectors(t.a,yr),Rs.subVectors(t.b,yr),Cs.subVectors(t.c,yr),Ti.subVectors(Rs,ws),Ai.subVectors(Cs,Rs),es.subVectors(ws,Cs);let e=[0,-Ti.z,Ti.y,0,-Ai.z,Ai.y,0,-es.z,es.y,Ti.z,0,-Ti.x,Ai.z,0,-Ai.x,es.z,0,-es.x,-Ti.y,Ti.x,0,-Ai.y,Ai.x,0,-es.y,es.x,0];return!tl(e,ws,Rs,Cs,ya)||(e=[1,0,0,0,1,0,0,0,1],!tl(e,ws,Rs,Cs,ya))?!1:(Sa.crossVectors(Ti,Ai),e=[Sa.x,Sa.y,Sa.z],tl(e,ws,Rs,Cs,ya))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Nn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Nn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Qn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Qn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Qn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Qn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Qn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Qn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Qn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Qn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Qn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const Qn=[new O,new O,new O,new O,new O,new O,new O,new O],Nn=new O,Ma=new ha,ws=new O,Rs=new O,Cs=new O,Ti=new O,Ai=new O,es=new O,yr=new O,ya=new O,Sa=new O,ns=new O;function tl(i,t,e,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){ns.fromArray(i,r);const o=s.x*Math.abs(ns.x)+s.y*Math.abs(ns.y)+s.z*Math.abs(ns.z),l=t.dot(ns),c=e.dot(ns),h=n.dot(ns);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}const Mm=new ha,Sr=new O,el=new O;class dr{constructor(t=new O,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):Mm.setFromPoints(t).getCenter(n);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Sr.subVectors(t,this.center);const e=Sr.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(Sr,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(el.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Sr.copy(t.center).add(el)),this.expandByPoint(Sr.copy(t.center).sub(el))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const ti=new O,nl=new O,Ea=new O,wi=new O,il=new O,ba=new O,sl=new O;class Jc{constructor(t=new O,e=new O(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,ti)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=ti.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(ti.copy(this.origin).addScaledVector(this.direction,e),ti.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){nl.copy(t).add(e).multiplyScalar(.5),Ea.copy(e).sub(t).normalize(),wi.copy(this.origin).sub(nl);const r=t.distanceTo(e)*.5,a=-this.direction.dot(Ea),o=wi.dot(this.direction),l=-wi.dot(Ea),c=wi.lengthSq(),h=Math.abs(1-a*a);let u,f,d,g;if(h>0)if(u=a*l-o,f=a*o-l,g=r*h,u>=0)if(f>=-g)if(f<=g){const v=1/h;u*=v,f*=v,d=u*(u+a*f+2*o)+f*(a*u+f+2*l)+c}else f=r,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*l)+c;else f=-r,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*l)+c;else f<=-g?(u=Math.max(0,-(-a*r+o)),f=u>0?-r:Math.min(Math.max(-r,-l),r),d=-u*u+f*(f+2*l)+c):f<=g?(u=0,f=Math.min(Math.max(-r,-l),r),d=f*(f+2*l)+c):(u=Math.max(0,-(a*r+o)),f=u>0?r:Math.min(Math.max(-r,-l),r),d=-u*u+f*(f+2*l)+c);else f=a>0?-r:r,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(nl).addScaledVector(Ea,f),d}intersectSphere(t,e){ti.subVectors(t.center,this.origin);const n=ti.dot(this.direction),s=ti.dot(ti)-n*n,r=t.radius*t.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,a,o,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return c>=0?(n=(t.min.x-f.x)*c,s=(t.max.x-f.x)*c):(n=(t.max.x-f.x)*c,s=(t.min.x-f.x)*c),h>=0?(r=(t.min.y-f.y)*h,a=(t.max.y-f.y)*h):(r=(t.max.y-f.y)*h,a=(t.min.y-f.y)*h),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),u>=0?(o=(t.min.z-f.z)*u,l=(t.max.z-f.z)*u):(o=(t.max.z-f.z)*u,l=(t.min.z-f.z)*u),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,ti)!==null}intersectTriangle(t,e,n,s,r){il.subVectors(e,t),ba.subVectors(n,t),sl.crossVectors(il,ba);let a=this.direction.dot(sl),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;wi.subVectors(this.origin,t);const l=o*this.direction.dot(ba.crossVectors(wi,ba));if(l<0)return null;const c=o*this.direction.dot(il.cross(wi));if(c<0||l+c>a)return null;const h=-o*wi.dot(sl);return h<0?null:this.at(h/a,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class be{constructor(t,e,n,s,r,a,o,l,c,h,u,f,d,g,v,m){be.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c,h,u,f,d,g,v,m)}set(t,e,n,s,r,a,o,l,c,h,u,f,d,g,v,m){const p=this.elements;return p[0]=t,p[4]=e,p[8]=n,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=h,p[10]=u,p[14]=f,p[3]=d,p[7]=g,p[11]=v,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new be().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,n=t.elements,s=1/Ls.setFromMatrixColumn(t,0).length(),r=1/Ls.setFromMatrixColumn(t,1).length(),a=1/Ls.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,s=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){const f=a*h,d=a*u,g=o*h,v=o*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=d+g*c,e[5]=f-v*c,e[9]=-o*l,e[2]=v-f*c,e[6]=g+d*c,e[10]=a*l}else if(t.order==="YXZ"){const f=l*h,d=l*u,g=c*h,v=c*u;e[0]=f+v*o,e[4]=g*o-d,e[8]=a*c,e[1]=a*u,e[5]=a*h,e[9]=-o,e[2]=d*o-g,e[6]=v+f*o,e[10]=a*l}else if(t.order==="ZXY"){const f=l*h,d=l*u,g=c*h,v=c*u;e[0]=f-v*o,e[4]=-a*u,e[8]=g+d*o,e[1]=d+g*o,e[5]=a*h,e[9]=v-f*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){const f=a*h,d=a*u,g=o*h,v=o*u;e[0]=l*h,e[4]=g*c-d,e[8]=f*c+v,e[1]=l*u,e[5]=v*c+f,e[9]=d*c-g,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){const f=a*l,d=a*c,g=o*l,v=o*c;e[0]=l*h,e[4]=v-f*u,e[8]=g*u+d,e[1]=u,e[5]=a*h,e[9]=-o*h,e[2]=-c*h,e[6]=d*u+g,e[10]=f-v*u}else if(t.order==="XZY"){const f=a*l,d=a*c,g=o*l,v=o*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=f*u+v,e[5]=a*h,e[9]=d*u-g,e[2]=g*u-d,e[6]=o*h,e[10]=v*u+f}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(ym,t,Sm)}lookAt(t,e,n){const s=this.elements;return fn.subVectors(t,e),fn.lengthSq()===0&&(fn.z=1),fn.normalize(),Ri.crossVectors(n,fn),Ri.lengthSq()===0&&(Math.abs(n.z)===1?fn.x+=1e-4:fn.z+=1e-4,fn.normalize(),Ri.crossVectors(n,fn)),Ri.normalize(),Ta.crossVectors(fn,Ri),s[0]=Ri.x,s[4]=Ta.x,s[8]=fn.x,s[1]=Ri.y,s[5]=Ta.y,s[9]=fn.y,s[2]=Ri.z,s[6]=Ta.z,s[10]=fn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],f=n[9],d=n[13],g=n[2],v=n[6],m=n[10],p=n[14],x=n[3],y=n[7],M=n[11],C=n[15],A=s[0],w=s[4],L=s[8],T=s[12],b=s[1],I=s[5],K=s[9],H=s[13],q=s[2],Z=s[6],$=s[10],it=s[14],W=s[3],ct=s[7],_t=s[11],Ct=s[15];return r[0]=a*A+o*b+l*q+c*W,r[4]=a*w+o*I+l*Z+c*ct,r[8]=a*L+o*K+l*$+c*_t,r[12]=a*T+o*H+l*it+c*Ct,r[1]=h*A+u*b+f*q+d*W,r[5]=h*w+u*I+f*Z+d*ct,r[9]=h*L+u*K+f*$+d*_t,r[13]=h*T+u*H+f*it+d*Ct,r[2]=g*A+v*b+m*q+p*W,r[6]=g*w+v*I+m*Z+p*ct,r[10]=g*L+v*K+m*$+p*_t,r[14]=g*T+v*H+m*it+p*Ct,r[3]=x*A+y*b+M*q+C*W,r[7]=x*w+y*I+M*Z+C*ct,r[11]=x*L+y*K+M*$+C*_t,r[15]=x*T+y*H+M*it+C*Ct,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],h=t[2],u=t[6],f=t[10],d=t[14],g=t[3],v=t[7],m=t[11],p=t[15];return g*(+r*l*u-s*c*u-r*o*f+n*c*f+s*o*d-n*l*d)+v*(+e*l*d-e*c*f+r*a*f-s*a*d+s*c*h-r*l*h)+m*(+e*c*u-e*o*d-r*a*u+n*a*d+r*o*h-n*c*h)+p*(-s*o*h-e*l*u+e*o*f+s*a*u-n*a*f+n*l*h)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=t[9],f=t[10],d=t[11],g=t[12],v=t[13],m=t[14],p=t[15],x=u*m*c-v*f*c+v*l*d-o*m*d-u*l*p+o*f*p,y=g*f*c-h*m*c-g*l*d+a*m*d+h*l*p-a*f*p,M=h*v*c-g*u*c+g*o*d-a*v*d-h*o*p+a*u*p,C=g*u*l-h*v*l-g*o*f+a*v*f+h*o*m-a*u*m,A=e*x+n*y+s*M+r*C;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const w=1/A;return t[0]=x*w,t[1]=(v*f*r-u*m*r-v*s*d+n*m*d+u*s*p-n*f*p)*w,t[2]=(o*m*r-v*l*r+v*s*c-n*m*c-o*s*p+n*l*p)*w,t[3]=(u*l*r-o*f*r-u*s*c+n*f*c+o*s*d-n*l*d)*w,t[4]=y*w,t[5]=(h*m*r-g*f*r+g*s*d-e*m*d-h*s*p+e*f*p)*w,t[6]=(g*l*r-a*m*r-g*s*c+e*m*c+a*s*p-e*l*p)*w,t[7]=(a*f*r-h*l*r+h*s*c-e*f*c-a*s*d+e*l*d)*w,t[8]=M*w,t[9]=(g*u*r-h*v*r-g*n*d+e*v*d+h*n*p-e*u*p)*w,t[10]=(a*v*r-g*o*r+g*n*c-e*v*c-a*n*p+e*o*p)*w,t[11]=(h*o*r-a*u*r-h*n*c+e*u*c+a*n*d-e*o*d)*w,t[12]=C*w,t[13]=(h*v*s-g*u*s+g*n*f-e*v*f-h*n*m+e*u*m)*w,t[14]=(g*o*s-a*v*s-g*n*l+e*v*l+a*n*m-e*o*m)*w,t[15]=(a*u*s-h*o*s+h*n*l-e*u*l-a*n*f+e*o*f)*w,this}scale(t){const e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),s=Math.sin(e),r=1-n,a=t.x,o=t.y,l=t.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+n,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,a){return this.set(1,n,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){const s=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,h=a+a,u=o+o,f=r*c,d=r*h,g=r*u,v=a*h,m=a*u,p=o*u,x=l*c,y=l*h,M=l*u,C=n.x,A=n.y,w=n.z;return s[0]=(1-(v+p))*C,s[1]=(d+M)*C,s[2]=(g-y)*C,s[3]=0,s[4]=(d-M)*A,s[5]=(1-(f+p))*A,s[6]=(m+x)*A,s[7]=0,s[8]=(g+y)*w,s[9]=(m-x)*w,s[10]=(1-(f+v))*w,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){const s=this.elements;let r=Ls.set(s[0],s[1],s[2]).length();const a=Ls.set(s[4],s[5],s[6]).length(),o=Ls.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],On.copy(this);const c=1/r,h=1/a,u=1/o;return On.elements[0]*=c,On.elements[1]*=c,On.elements[2]*=c,On.elements[4]*=h,On.elements[5]*=h,On.elements[6]*=h,On.elements[8]*=u,On.elements[9]*=u,On.elements[10]*=u,e.setFromRotationMatrix(On),n.x=r,n.y=a,n.z=o,this}makePerspective(t,e,n,s,r,a,o=li){const l=this.elements,c=2*r/(e-t),h=2*r/(n-s),u=(e+t)/(e-t),f=(n+s)/(n-s);let d,g;if(o===li)d=-(a+r)/(a-r),g=-2*a*r/(a-r);else if(o===_o)d=-a/(a-r),g=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=d,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,s,r,a,o=li){const l=this.elements,c=1/(e-t),h=1/(n-s),u=1/(a-r),f=(e+t)*c,d=(n+s)*h;let g,v;if(o===li)g=(a+r)*u,v=-2*u;else if(o===_o)g=r*u,v=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-d,l[2]=0,l[6]=0,l[10]=v,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}const Ls=new O,On=new be,ym=new O(0,0,0),Sm=new O(1,1,1),Ri=new O,Ta=new O,fn=new O,Oh=new be,Uh=new ca;class gi{constructor(t=0,e=0,n=0,s=gi.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const s=t.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],u=s[2],f=s[6],d=s[10];switch(e){case"XYZ":this._y=Math.asin(ln(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,d),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-ln(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(ln(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,d),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-ln(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(ln(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-ln(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,d),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Oh.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Oh,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Uh.setFromEuler(this),this.setFromQuaternion(Uh,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}gi.DEFAULT_ORDER="XYZ";class Wf{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let Em=0;const kh=new O,Ds=new ca,ei=new be,Aa=new O,Er=new O,bm=new O,Tm=new ca,zh=new O(1,0,0),Fh=new O(0,1,0),Bh=new O(0,0,1),Hh={type:"added"},Am={type:"removed"},Ps={type:"childadded",child:null},rl={type:"childremoved",child:null};class qe extends fr{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Em++}),this.uuid=Gi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=qe.DEFAULT_UP.clone();const t=new O,e=new gi,n=new ca,s=new O(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new be},normalMatrix:{value:new Vt}}),this.matrix=new be,this.matrixWorld=new be,this.matrixAutoUpdate=qe.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=qe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Wf,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Ds.setFromAxisAngle(t,e),this.quaternion.multiply(Ds),this}rotateOnWorldAxis(t,e){return Ds.setFromAxisAngle(t,e),this.quaternion.premultiply(Ds),this}rotateX(t){return this.rotateOnAxis(zh,t)}rotateY(t){return this.rotateOnAxis(Fh,t)}rotateZ(t){return this.rotateOnAxis(Bh,t)}translateOnAxis(t,e){return kh.copy(t).applyQuaternion(this.quaternion),this.position.add(kh.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(zh,t)}translateY(t){return this.translateOnAxis(Fh,t)}translateZ(t){return this.translateOnAxis(Bh,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(ei.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Aa.copy(t):Aa.set(t,e,n);const s=this.parent;this.updateWorldMatrix(!0,!1),Er.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ei.lookAt(Er,Aa,this.up):ei.lookAt(Aa,Er,this.up),this.quaternion.setFromRotationMatrix(ei),s&&(ei.extractRotation(s.matrixWorld),Ds.setFromRotationMatrix(ei),this.quaternion.premultiply(Ds.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Hh),Ps.child=t,this.dispatchEvent(Ps),Ps.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Am),rl.child=t,this.dispatchEvent(rl),rl.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),ei.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),ei.multiply(t.parent.matrixWorld)),t.applyMatrix4(ei),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Hh),Ps.child=t,this.dispatchEvent(Ps),Ps.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){const a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Er,t,bm),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Er,Tm,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){const n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];r(t.shapes,u)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];s.animations.push(r(t.animations,l))}}if(e){const o=a(t.geometries),l=a(t.materials),c=a(t.textures),h=a(t.images),u=a(t.shapes),f=a(t.skeletons),d=a(t.animations),g=a(t.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),f.length>0&&(n.skeletons=f),d.length>0&&(n.animations=d),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){const l=[];for(const c in o){const h=o[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const s=t.children[n];this.add(s.clone())}return this}}qe.DEFAULT_UP=new O(0,1,0);qe.DEFAULT_MATRIX_AUTO_UPDATE=!0;qe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Un=new O,ni=new O,al=new O,ii=new O,Is=new O,Ns=new O,Gh=new O,ol=new O,ll=new O,cl=new O,hl=new De,ul=new De,fl=new De;class gn{constructor(t=new O,e=new O,n=new O){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),Un.subVectors(t,e),s.cross(Un);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){Un.subVectors(s,e),ni.subVectors(n,e),al.subVectors(t,e);const a=Un.dot(Un),o=Un.dot(ni),l=Un.dot(al),c=ni.dot(ni),h=ni.dot(al),u=a*c-o*o;if(u===0)return r.set(0,0,0),null;const f=1/u,d=(c*l-o*h)*f,g=(a*h-o*l)*f;return r.set(1-d-g,g,d)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,ii)===null?!1:ii.x>=0&&ii.y>=0&&ii.x+ii.y<=1}static getInterpolation(t,e,n,s,r,a,o,l){return this.getBarycoord(t,e,n,s,ii)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,ii.x),l.addScaledVector(a,ii.y),l.addScaledVector(o,ii.z),l)}static getInterpolatedAttribute(t,e,n,s,r,a){return hl.setScalar(0),ul.setScalar(0),fl.setScalar(0),hl.fromBufferAttribute(t,e),ul.fromBufferAttribute(t,n),fl.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(hl,r.x),a.addScaledVector(ul,r.y),a.addScaledVector(fl,r.z),a}static isFrontFacing(t,e,n,s){return Un.subVectors(n,e),ni.subVectors(t,e),Un.cross(ni).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Un.subVectors(this.c,this.b),ni.subVectors(this.a,this.b),Un.cross(ni).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return gn.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return gn.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return gn.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return gn.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return gn.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,s=this.b,r=this.c;let a,o;Is.subVectors(s,n),Ns.subVectors(r,n),ol.subVectors(t,n);const l=Is.dot(ol),c=Ns.dot(ol);if(l<=0&&c<=0)return e.copy(n);ll.subVectors(t,s);const h=Is.dot(ll),u=Ns.dot(ll);if(h>=0&&u<=h)return e.copy(s);const f=l*u-h*c;if(f<=0&&l>=0&&h<=0)return a=l/(l-h),e.copy(n).addScaledVector(Is,a);cl.subVectors(t,r);const d=Is.dot(cl),g=Ns.dot(cl);if(g>=0&&d<=g)return e.copy(r);const v=d*c-l*g;if(v<=0&&c>=0&&g<=0)return o=c/(c-g),e.copy(n).addScaledVector(Ns,o);const m=h*g-d*u;if(m<=0&&u-h>=0&&d-g>=0)return Gh.subVectors(r,s),o=(u-h)/(u-h+(d-g)),e.copy(s).addScaledVector(Gh,o);const p=1/(m+v+f);return a=v*p,o=f*p,e.copy(n).addScaledVector(Is,a).addScaledVector(Ns,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const Xf={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ci={h:0,s:0,l:0},wa={h:0,s:0,l:0};function dl(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}class le{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Sn){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,re.toWorkingColorSpace(this,e),this}setRGB(t,e,n,s=re.workingColorSpace){return this.r=t,this.g=e,this.b=n,re.toWorkingColorSpace(this,s),this}setHSL(t,e,n,s=re.workingColorSpace){if(t=hm(t,1),e=ln(e,0,1),n=ln(n,0,1),e===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=dl(a,r,t+1/3),this.g=dl(a,r,t),this.b=dl(a,r,t-1/3)}return re.toWorkingColorSpace(this,s),this}setStyle(t,e=Sn){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Sn){const n=Xf[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=hi(t.r),this.g=hi(t.g),this.b=hi(t.b),this}copyLinearToSRGB(t){return this.r=tr(t.r),this.g=tr(t.g),this.b=tr(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Sn){return re.fromWorkingColorSpace(Ve.copy(this),t),Math.round(ln(Ve.r*255,0,255))*65536+Math.round(ln(Ve.g*255,0,255))*256+Math.round(ln(Ve.b*255,0,255))}getHexString(t=Sn){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=re.workingColorSpace){re.fromWorkingColorSpace(Ve.copy(this),e);const n=Ve.r,s=Ve.g,r=Ve.b,a=Math.max(n,s,r),o=Math.min(n,s,r);let l,c;const h=(o+a)/2;if(o===a)l=0,c=0;else{const u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-n)/u+2;break;case r:l=(n-s)/u+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=re.workingColorSpace){return re.fromWorkingColorSpace(Ve.copy(this),e),t.r=Ve.r,t.g=Ve.g,t.b=Ve.b,t}getStyle(t=Sn){re.fromWorkingColorSpace(Ve.copy(this),t);const e=Ve.r,n=Ve.g,s=Ve.b;return t!==Sn?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(Ci),this.setHSL(Ci.h+t,Ci.s+e,Ci.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Ci),t.getHSL(wa);const n=jo(Ci.h,wa.h,e),s=jo(Ci.s,wa.s,e),r=jo(Ci.l,wa.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Ve=new le;le.NAMES=Xf;let wm=0;class Ss extends fr{static get type(){return"Material"}get type(){return this.constructor.type}set type(t){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:wm++}),this.uuid=Gi(),this.name="",this.blending=Js,this.side=pi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Vl,this.blendDst=Wl,this.blendEquation=hs,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new le(0,0,0),this.blendAlpha=0,this.depthFunc=nr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Ah,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ts,this.stencilZFail=Ts,this.stencilZPass=Ts,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Js&&(n.blending=this.blending),this.side!==pi&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Vl&&(n.blendSrc=this.blendSrc),this.blendDst!==Wl&&(n.blendDst=this.blendDst),this.blendEquation!==hs&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==nr&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Ah&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ts&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Ts&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Ts&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(e){const r=s(t.textures),a=s(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Vi extends Ss{static get type(){return"MeshBasicMaterial"}constructor(t){super(),this.isMeshBasicMaterial=!0,this.color=new le(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new gi,this.combine=Rf,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const Pe=new O,Ra=new Yt;class Ne{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=wc,this.updateRanges=[],this.gpuType=oi,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Ra.fromBufferAttribute(this,e),Ra.applyMatrix3(t),this.setXY(e,Ra.x,Ra.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Pe.fromBufferAttribute(this,e),Pe.applyMatrix3(t),this.setXYZ(e,Pe.x,Pe.y,Pe.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Pe.fromBufferAttribute(this,e),Pe.applyMatrix4(t),this.setXYZ(e,Pe.x,Pe.y,Pe.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Pe.fromBufferAttribute(this,e),Pe.applyNormalMatrix(t),this.setXYZ(e,Pe.x,Pe.y,Pe.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Pe.fromBufferAttribute(this,e),Pe.transformDirection(t),this.setXYZ(e,Pe.x,Pe.y,Pe.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=qn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=me(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=qn(e,this.array)),e}setX(t,e){return this.normalized&&(e=me(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=qn(e,this.array)),e}setY(t,e){return this.normalized&&(e=me(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=qn(e,this.array)),e}setZ(t,e){return this.normalized&&(e=me(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=qn(e,this.array)),e}setW(t,e){return this.normalized&&(e=me(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=me(e,this.array),n=me(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=me(e,this.array),n=me(n,this.array),s=me(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=me(e,this.array),n=me(n,this.array),s=me(s,this.array),r=me(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==wc&&(t.usage=this.usage),t}}class $f extends Ne{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class qf extends Ne{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class nn extends Ne{constructor(t,e,n){super(new Float32Array(t),e,n)}}let Rm=0;const Mn=new be,pl=new qe,Os=new O,dn=new ha,br=new ha,Fe=new O;class Oe extends fr{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Rm++}),this.uuid=Gi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Hf(t)?qf:$f)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Vt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return Mn.makeRotationFromQuaternion(t),this.applyMatrix4(Mn),this}rotateX(t){return Mn.makeRotationX(t),this.applyMatrix4(Mn),this}rotateY(t){return Mn.makeRotationY(t),this.applyMatrix4(Mn),this}rotateZ(t){return Mn.makeRotationZ(t),this.applyMatrix4(Mn),this}translate(t,e,n){return Mn.makeTranslation(t,e,n),this.applyMatrix4(Mn),this}scale(t,e,n){return Mn.makeScale(t,e,n),this.applyMatrix4(Mn),this}lookAt(t){return pl.lookAt(t),pl.updateMatrix(),this.applyMatrix4(pl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Os).negate(),this.translate(Os.x,Os.y,Os.z),this}setFromPoints(t){const e=this.getAttribute("position");if(e===void 0){const n=[];for(let s=0,r=t.length;s<r;s++){const a=t[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new nn(n,3))}else{for(let n=0,s=e.count;n<s;n++){const r=t[n];e.setXYZ(n,r.x,r.y,r.z||0)}t.length>e.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ha);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new O(-1/0,-1/0,-1/0),new O(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){const r=e[n];dn.setFromBufferAttribute(r),this.morphTargetsRelative?(Fe.addVectors(this.boundingBox.min,dn.min),this.boundingBox.expandByPoint(Fe),Fe.addVectors(this.boundingBox.max,dn.max),this.boundingBox.expandByPoint(Fe)):(this.boundingBox.expandByPoint(dn.min),this.boundingBox.expandByPoint(dn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new dr);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new O,1/0);return}if(t){const n=this.boundingSphere.center;if(dn.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){const o=e[r];br.setFromBufferAttribute(o),this.morphTargetsRelative?(Fe.addVectors(dn.min,br.min),dn.expandByPoint(Fe),Fe.addVectors(dn.max,br.max),dn.expandByPoint(Fe)):(dn.expandByPoint(br.min),dn.expandByPoint(br.max))}dn.getCenter(n);let s=0;for(let r=0,a=t.count;r<a;r++)Fe.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(Fe));if(e)for(let r=0,a=e.length;r<a;r++){const o=e[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Fe.fromBufferAttribute(o,c),l&&(Os.fromBufferAttribute(t,c),Fe.add(Os)),s=Math.max(s,n.distanceToSquared(Fe))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ne(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let L=0;L<n.count;L++)o[L]=new O,l[L]=new O;const c=new O,h=new O,u=new O,f=new Yt,d=new Yt,g=new Yt,v=new O,m=new O;function p(L,T,b){c.fromBufferAttribute(n,L),h.fromBufferAttribute(n,T),u.fromBufferAttribute(n,b),f.fromBufferAttribute(r,L),d.fromBufferAttribute(r,T),g.fromBufferAttribute(r,b),h.sub(c),u.sub(c),d.sub(f),g.sub(f);const I=1/(d.x*g.y-g.x*d.y);isFinite(I)&&(v.copy(h).multiplyScalar(g.y).addScaledVector(u,-d.y).multiplyScalar(I),m.copy(u).multiplyScalar(d.x).addScaledVector(h,-g.x).multiplyScalar(I),o[L].add(v),o[T].add(v),o[b].add(v),l[L].add(m),l[T].add(m),l[b].add(m))}let x=this.groups;x.length===0&&(x=[{start:0,count:t.count}]);for(let L=0,T=x.length;L<T;++L){const b=x[L],I=b.start,K=b.count;for(let H=I,q=I+K;H<q;H+=3)p(t.getX(H+0),t.getX(H+1),t.getX(H+2))}const y=new O,M=new O,C=new O,A=new O;function w(L){C.fromBufferAttribute(s,L),A.copy(C);const T=o[L];y.copy(T),y.sub(C.multiplyScalar(C.dot(T))).normalize(),M.crossVectors(A,T);const I=M.dot(l[L])<0?-1:1;a.setXYZW(L,y.x,y.y,y.z,I)}for(let L=0,T=x.length;L<T;++L){const b=x[L],I=b.start,K=b.count;for(let H=I,q=I+K;H<q;H+=3)w(t.getX(H+0)),w(t.getX(H+1)),w(t.getX(H+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Ne(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let f=0,d=n.count;f<d;f++)n.setXYZ(f,0,0,0);const s=new O,r=new O,a=new O,o=new O,l=new O,c=new O,h=new O,u=new O;if(t)for(let f=0,d=t.count;f<d;f+=3){const g=t.getX(f+0),v=t.getX(f+1),m=t.getX(f+2);s.fromBufferAttribute(e,g),r.fromBufferAttribute(e,v),a.fromBufferAttribute(e,m),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,m),o.add(h),l.add(h),c.add(h),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let f=0,d=e.count;f<d;f+=3)s.fromBufferAttribute(e,f+0),r.fromBufferAttribute(e,f+1),a.fromBufferAttribute(e,f+2),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),n.setXYZ(f+0,h.x,h.y,h.z),n.setXYZ(f+1,h.x,h.y,h.z),n.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Fe.fromBufferAttribute(t,e),Fe.normalize(),t.setXYZ(e,Fe.x,Fe.y,Fe.z)}toNonIndexed(){function t(o,l){const c=o.array,h=o.itemSize,u=o.normalized,f=new c.constructor(l.length*h);let d=0,g=0;for(let v=0,m=l.length;v<m;v++){o.isInterleavedBufferAttribute?d=l[v]*o.data.stride+o.offset:d=l[v]*h;for(let p=0;p<h;p++)f[g++]=c[d++]}return new Ne(f,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new Oe,n=this.index.array,s=this.attributes;for(const o in s){const l=s[o],c=t(l,n);e.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let h=0,u=c.length;h<u;h++){const f=c[h],d=t(f,n);l.push(d)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const l in n){const c=n[l];t.data.attributes[l]=c.toJSON(t.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,f=c.length;u<f;u++){const d=c[u];h.push(d.toJSON(t.data))}h.length>0&&(s[l]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(t.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone(e));const s=t.attributes;for(const c in s){const h=s[c];this.setAttribute(c,h.clone(e))}const r=t.morphAttributes;for(const c in r){const h=[],u=r[c];for(let f=0,d=u.length;f<d;f++)h.push(u[f].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;const a=t.groups;for(let c=0,h=a.length;c<h;c++){const u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}const o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Vh=new be,is=new Jc,Ca=new dr,Wh=new O,La=new O,Da=new O,Pa=new O,ml=new O,Ia=new O,Xh=new O,Na=new O;class Ce extends qe{constructor(t=new Oe,e=new Vi){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(s,t);const o=this.morphTargetInfluences;if(r&&o){Ia.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=o[l],u=r[l];h!==0&&(ml.fromBufferAttribute(u,t),a?Ia.addScaledVector(ml,h):Ia.addScaledVector(ml.sub(e),h))}e.add(Ia)}return e}raycast(t,e){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Ca.copy(n.boundingSphere),Ca.applyMatrix4(r),is.copy(t.ray).recast(t.near),!(Ca.containsPoint(is.origin)===!1&&(is.intersectSphere(Ca,Wh)===null||is.origin.distanceToSquared(Wh)>(t.far-t.near)**2))&&(Vh.copy(r).invert(),is.copy(t.ray).applyMatrix4(Vh),!(n.boundingBox!==null&&is.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,is)))}_computeIntersections(t,e,n){let s;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,f=r.groups,d=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,v=f.length;g<v;g++){const m=f[g],p=a[m.materialIndex],x=Math.max(m.start,d.start),y=Math.min(o.count,Math.min(m.start+m.count,d.start+d.count));for(let M=x,C=y;M<C;M+=3){const A=o.getX(M),w=o.getX(M+1),L=o.getX(M+2);s=Oa(this,p,t,n,c,h,u,A,w,L),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const g=Math.max(0,d.start),v=Math.min(o.count,d.start+d.count);for(let m=g,p=v;m<p;m+=3){const x=o.getX(m),y=o.getX(m+1),M=o.getX(m+2);s=Oa(this,a,t,n,c,h,u,x,y,M),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,v=f.length;g<v;g++){const m=f[g],p=a[m.materialIndex],x=Math.max(m.start,d.start),y=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let M=x,C=y;M<C;M+=3){const A=M,w=M+1,L=M+2;s=Oa(this,p,t,n,c,h,u,A,w,L),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const g=Math.max(0,d.start),v=Math.min(l.count,d.start+d.count);for(let m=g,p=v;m<p;m+=3){const x=m,y=m+1,M=m+2;s=Oa(this,a,t,n,c,h,u,x,y,M),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}}function Cm(i,t,e,n,s,r,a,o){let l;if(t.side===tn?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,t.side===pi,o),l===null)return null;Na.copy(o),Na.applyMatrix4(i.matrixWorld);const c=e.ray.origin.distanceTo(Na);return c<e.near||c>e.far?null:{distance:c,point:Na.clone(),object:i}}function Oa(i,t,e,n,s,r,a,o,l,c){i.getVertexPosition(o,La),i.getVertexPosition(l,Da),i.getVertexPosition(c,Pa);const h=Cm(i,t,e,n,La,Da,Pa,Xh);if(h){const u=new O;gn.getBarycoord(Xh,La,Da,Pa,u),s&&(h.uv=gn.getInterpolatedAttribute(s,o,l,c,u,new Yt)),r&&(h.uv1=gn.getInterpolatedAttribute(r,o,l,c,u,new Yt)),a&&(h.normal=gn.getInterpolatedAttribute(a,o,l,c,u,new O),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const f={a:o,b:l,c,normal:new O,materialIndex:0};gn.getNormal(La,Da,Pa,f.normal),h.face=f,h.barycoord=u}return h}class qi extends Oe{constructor(t=1,e=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],h=[],u=[];let f=0,d=0;g("z","y","x",-1,-1,n,e,t,a,r,0),g("z","y","x",1,-1,n,e,-t,a,r,1),g("x","z","y",1,1,t,n,e,s,a,2),g("x","z","y",1,-1,t,n,-e,s,a,3),g("x","y","z",1,-1,t,e,n,s,r,4),g("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new nn(c,3)),this.setAttribute("normal",new nn(h,3)),this.setAttribute("uv",new nn(u,2));function g(v,m,p,x,y,M,C,A,w,L,T){const b=M/w,I=C/L,K=M/2,H=C/2,q=A/2,Z=w+1,$=L+1;let it=0,W=0;const ct=new O;for(let _t=0;_t<$;_t++){const Ct=_t*I-H;for(let Wt=0;Wt<Z;Wt++){const ce=Wt*b-K;ct[v]=ce*x,ct[m]=Ct*y,ct[p]=q,c.push(ct.x,ct.y,ct.z),ct[v]=0,ct[m]=0,ct[p]=A>0?1:-1,h.push(ct.x,ct.y,ct.z),u.push(Wt/w),u.push(1-_t/L),it+=1}}for(let _t=0;_t<L;_t++)for(let Ct=0;Ct<w;Ct++){const Wt=f+Ct+Z*_t,ce=f+Ct+Z*(_t+1),Y=f+(Ct+1)+Z*(_t+1),st=f+(Ct+1)+Z*_t;l.push(Wt,ce,st),l.push(ce,Y,st),W+=6}o.addGroup(d,W,T),d+=W,f+=it}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new qi(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function or(i){const t={};for(const e in i){t[e]={};for(const n in i[e]){const s=i[e][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone():Array.isArray(s)?t[e][n]=s.slice():t[e][n]=s}}return t}function Ye(i){const t={};for(let e=0;e<i.length;e++){const n=or(i[e]);for(const s in n)t[s]=n[s]}return t}function Lm(i){const t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Kf(i){const t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:re.workingColorSpace}const Dm={clone:or,merge:Ye};var Pm=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Im=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Gn extends Ss{static get type(){return"ShaderMaterial"}constructor(t){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Pm,this.fragmentShader=Im,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=or(t.uniforms),this.uniformsGroups=Lm(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}}class Yf extends qe{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new be,this.projectionMatrix=new be,this.projectionMatrixInverse=new be,this.coordinateSystem=li}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Li=new O,$h=new Yt,qh=new Yt;class En extends Yf{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=Rc*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(ao*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Rc*2*Math.atan(Math.tan(ao*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Li.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Li.x,Li.y).multiplyScalar(-t/Li.z),Li.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Li.x,Li.y).multiplyScalar(-t/Li.z)}getViewSize(t,e){return this.getViewBounds(t,$h,qh),e.subVectors(qh,$h)}setViewOffset(t,e,n,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(ao*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,e-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const Us=-90,ks=1;class Nm extends qe{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new En(Us,ks,t,e);s.layers=this.layers,this.add(s);const r=new En(Us,ks,t,e);r.layers=this.layers,this.add(r);const a=new En(Us,ks,t,e);a.layers=this.layers,this.add(a);const o=new En(Us,ks,t,e);o.layers=this.layers,this.add(o);const l=new En(Us,ks,t,e);l.layers=this.layers,this.add(l);const c=new En(Us,ks,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,s,r,a,o,l]=e;for(const c of e)this.remove(c);if(t===li)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===_o)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,h]=this.children,u=t.getRenderTarget(),f=t.getActiveCubeFace(),d=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;const v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,s),t.render(e,r),t.setRenderTarget(n,1,s),t.render(e,a),t.setRenderTarget(n,2,s),t.render(e,o),t.setRenderTarget(n,3,s),t.render(e,l),t.setRenderTarget(n,4,s),t.render(e,c),n.texture.generateMipmaps=v,t.setRenderTarget(n,5,s),t.render(e,h),t.setRenderTarget(u,f,d),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class jf extends $e{constructor(t,e,n,s,r,a,o,l,c,h){t=t!==void 0?t:[],e=e!==void 0?e:ir,super(t,e,n,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class Om extends _s{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new jf(s,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:_n}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new qi(5,5,5),r=new Gn({name:"CubemapFromEquirect",uniforms:or(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:tn,blending:Bi});r.uniforms.tEquirect.value=e;const a=new Ce(s,r),o=e.minFilter;return e.minFilter===Yn&&(e.minFilter=_n),new Nm(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e,n,s){const r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,s);t.setRenderTarget(r)}}const gl=new O,Um=new O,km=new Vt;class ls{constructor(t=new O(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const s=gl.subVectors(n,e).cross(Um.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const n=t.delta(gl),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||km.getNormalMatrix(t),s=this.coplanarPoint(gl).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const ss=new dr,Ua=new O;class Zf{constructor(t=new ls,e=new ls,n=new ls,s=new ls,r=new ls,a=new ls){this.planes=[t,e,n,s,r,a]}set(t,e,n,s,r,a){const o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=li){const n=this.planes,s=t.elements,r=s[0],a=s[1],o=s[2],l=s[3],c=s[4],h=s[5],u=s[6],f=s[7],d=s[8],g=s[9],v=s[10],m=s[11],p=s[12],x=s[13],y=s[14],M=s[15];if(n[0].setComponents(l-r,f-c,m-d,M-p).normalize(),n[1].setComponents(l+r,f+c,m+d,M+p).normalize(),n[2].setComponents(l+a,f+h,m+g,M+x).normalize(),n[3].setComponents(l-a,f-h,m-g,M-x).normalize(),n[4].setComponents(l-o,f-u,m-v,M-y).normalize(),e===li)n[5].setComponents(l+o,f+u,m+v,M+y).normalize();else if(e===_o)n[5].setComponents(o,u,v,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),ss.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),ss.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(ss)}intersectsSprite(t){return ss.center.set(0,0,0),ss.radius=.7071067811865476,ss.applyMatrix4(t.matrixWorld),this.intersectsSphere(ss)}intersectsSphere(t){const e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const s=e[n];if(Ua.x=s.normal.x>0?t.max.x:t.min.x,Ua.y=s.normal.y>0?t.max.y:t.min.y,Ua.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(Ua)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Jf(){let i=null,t=!1,e=null,n=null;function s(r,a){e(r,a),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function zm(i){const t=new WeakMap;function e(o,l){const c=o.array,h=o.usage,u=c.byteLength,f=i.createBuffer();i.bindBuffer(l,f),i.bufferData(l,c,h),o.onUploadCallback();let d;if(c instanceof Float32Array)d=i.FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?d=i.HALF_FLOAT:d=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=i.SHORT;else if(c instanceof Uint32Array)d=i.UNSIGNED_INT;else if(c instanceof Int32Array)d=i.INT;else if(c instanceof Int8Array)d=i.BYTE;else if(c instanceof Uint8Array)d=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,c){const h=l.array,u=l.updateRanges;if(i.bindBuffer(c,o),u.length===0)i.bufferSubData(c,0,h);else{u.sort((d,g)=>d.start-g.start);let f=0;for(let d=1;d<u.length;d++){const g=u[f],v=u[d];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++f,u[f]=v)}u.length=f+1;for(let d=0,g=u.length;d<g;d++){const v=u[d];i.bufferSubData(c,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=t.get(o);l&&(i.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}class ds extends Oe{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};const r=t/2,a=e/2,o=Math.floor(n),l=Math.floor(s),c=o+1,h=l+1,u=t/o,f=e/l,d=[],g=[],v=[],m=[];for(let p=0;p<h;p++){const x=p*f-a;for(let y=0;y<c;y++){const M=y*u-r;g.push(M,-x,0),v.push(0,0,1),m.push(y/o),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let x=0;x<o;x++){const y=x+c*p,M=x+c*(p+1),C=x+1+c*(p+1),A=x+1+c*p;d.push(y,M,A),d.push(M,C,A)}this.setIndex(d),this.setAttribute("position",new nn(g,3)),this.setAttribute("normal",new nn(v,3)),this.setAttribute("uv",new nn(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ds(t.width,t.height,t.widthSegments,t.heightSegments)}}var Fm=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Bm=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Hm=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Gm=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Vm=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Wm=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Xm=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,$m=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,qm=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Km=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Ym=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,jm=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Zm=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Jm=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Qm=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,t0=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,e0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,n0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,i0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,s0=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,r0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,a0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,o0=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,l0=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,c0=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,h0=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,u0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,f0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,d0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,p0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,m0="gl_FragColor = linearToOutputTexel( gl_FragColor );",g0=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,_0=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,v0=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,x0=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,M0=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,y0=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,S0=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,E0=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,b0=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,T0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,A0=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,w0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,R0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,C0=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,L0=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,D0=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,P0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,I0=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,N0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,O0=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,U0=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,k0=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,z0=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,F0=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,B0=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,H0=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,G0=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,V0=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,W0=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,X0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,$0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,q0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,K0=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Y0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,j0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Z0=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,J0=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Q0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,tg=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,eg=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,ng=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,ig=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,sg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,rg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,ag=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,og=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,lg=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,cg=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,hg=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,ug=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,fg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,dg=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,pg=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,mg=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,gg=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,_g=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,vg=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,xg=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Mg=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,yg=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Sg=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Eg=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,bg=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Tg=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Ag=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,wg=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Rg=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Cg=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Lg=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Dg=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Pg=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Ig=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Ng=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Og=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Ug=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,kg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const zg=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Fg=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Bg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Hg=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Gg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Vg=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Wg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Xg=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,$g=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,qg=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Kg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Yg=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,jg=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Zg=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Jg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Qg=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,t_=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,e_=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,n_=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,i_=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,s_=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,r_=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,a_=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,o_=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,l_=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,c_=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,h_=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,u_=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,f_=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,d_=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,p_=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,m_=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,g_=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,__=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,qt={alphahash_fragment:Fm,alphahash_pars_fragment:Bm,alphamap_fragment:Hm,alphamap_pars_fragment:Gm,alphatest_fragment:Vm,alphatest_pars_fragment:Wm,aomap_fragment:Xm,aomap_pars_fragment:$m,batching_pars_vertex:qm,batching_vertex:Km,begin_vertex:Ym,beginnormal_vertex:jm,bsdfs:Zm,iridescence_fragment:Jm,bumpmap_pars_fragment:Qm,clipping_planes_fragment:t0,clipping_planes_pars_fragment:e0,clipping_planes_pars_vertex:n0,clipping_planes_vertex:i0,color_fragment:s0,color_pars_fragment:r0,color_pars_vertex:a0,color_vertex:o0,common:l0,cube_uv_reflection_fragment:c0,defaultnormal_vertex:h0,displacementmap_pars_vertex:u0,displacementmap_vertex:f0,emissivemap_fragment:d0,emissivemap_pars_fragment:p0,colorspace_fragment:m0,colorspace_pars_fragment:g0,envmap_fragment:_0,envmap_common_pars_fragment:v0,envmap_pars_fragment:x0,envmap_pars_vertex:M0,envmap_physical_pars_fragment:D0,envmap_vertex:y0,fog_vertex:S0,fog_pars_vertex:E0,fog_fragment:b0,fog_pars_fragment:T0,gradientmap_pars_fragment:A0,lightmap_pars_fragment:w0,lights_lambert_fragment:R0,lights_lambert_pars_fragment:C0,lights_pars_begin:L0,lights_toon_fragment:P0,lights_toon_pars_fragment:I0,lights_phong_fragment:N0,lights_phong_pars_fragment:O0,lights_physical_fragment:U0,lights_physical_pars_fragment:k0,lights_fragment_begin:z0,lights_fragment_maps:F0,lights_fragment_end:B0,logdepthbuf_fragment:H0,logdepthbuf_pars_fragment:G0,logdepthbuf_pars_vertex:V0,logdepthbuf_vertex:W0,map_fragment:X0,map_pars_fragment:$0,map_particle_fragment:q0,map_particle_pars_fragment:K0,metalnessmap_fragment:Y0,metalnessmap_pars_fragment:j0,morphinstance_vertex:Z0,morphcolor_vertex:J0,morphnormal_vertex:Q0,morphtarget_pars_vertex:tg,morphtarget_vertex:eg,normal_fragment_begin:ng,normal_fragment_maps:ig,normal_pars_fragment:sg,normal_pars_vertex:rg,normal_vertex:ag,normalmap_pars_fragment:og,clearcoat_normal_fragment_begin:lg,clearcoat_normal_fragment_maps:cg,clearcoat_pars_fragment:hg,iridescence_pars_fragment:ug,opaque_fragment:fg,packing:dg,premultiplied_alpha_fragment:pg,project_vertex:mg,dithering_fragment:gg,dithering_pars_fragment:_g,roughnessmap_fragment:vg,roughnessmap_pars_fragment:xg,shadowmap_pars_fragment:Mg,shadowmap_pars_vertex:yg,shadowmap_vertex:Sg,shadowmask_pars_fragment:Eg,skinbase_vertex:bg,skinning_pars_vertex:Tg,skinning_vertex:Ag,skinnormal_vertex:wg,specularmap_fragment:Rg,specularmap_pars_fragment:Cg,tonemapping_fragment:Lg,tonemapping_pars_fragment:Dg,transmission_fragment:Pg,transmission_pars_fragment:Ig,uv_pars_fragment:Ng,uv_pars_vertex:Og,uv_vertex:Ug,worldpos_vertex:kg,background_vert:zg,background_frag:Fg,backgroundCube_vert:Bg,backgroundCube_frag:Hg,cube_vert:Gg,cube_frag:Vg,depth_vert:Wg,depth_frag:Xg,distanceRGBA_vert:$g,distanceRGBA_frag:qg,equirect_vert:Kg,equirect_frag:Yg,linedashed_vert:jg,linedashed_frag:Zg,meshbasic_vert:Jg,meshbasic_frag:Qg,meshlambert_vert:t_,meshlambert_frag:e_,meshmatcap_vert:n_,meshmatcap_frag:i_,meshnormal_vert:s_,meshnormal_frag:r_,meshphong_vert:a_,meshphong_frag:o_,meshphysical_vert:l_,meshphysical_frag:c_,meshtoon_vert:h_,meshtoon_frag:u_,points_vert:f_,points_frag:d_,shadow_vert:p_,shadow_frag:m_,sprite_vert:g_,sprite_frag:__},lt={common:{diffuse:{value:new le(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Vt},alphaMap:{value:null},alphaMapTransform:{value:new Vt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Vt}},envmap:{envMap:{value:null},envMapRotation:{value:new Vt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Vt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Vt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Vt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Vt},normalScale:{value:new Yt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Vt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Vt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Vt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Vt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new le(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new le(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Vt},alphaTest:{value:0},uvTransform:{value:new Vt}},sprite:{diffuse:{value:new le(16777215)},opacity:{value:1},center:{value:new Yt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Vt},alphaMap:{value:null},alphaMapTransform:{value:new Vt},alphaTest:{value:0}}},$n={basic:{uniforms:Ye([lt.common,lt.specularmap,lt.envmap,lt.aomap,lt.lightmap,lt.fog]),vertexShader:qt.meshbasic_vert,fragmentShader:qt.meshbasic_frag},lambert:{uniforms:Ye([lt.common,lt.specularmap,lt.envmap,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.fog,lt.lights,{emissive:{value:new le(0)}}]),vertexShader:qt.meshlambert_vert,fragmentShader:qt.meshlambert_frag},phong:{uniforms:Ye([lt.common,lt.specularmap,lt.envmap,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.fog,lt.lights,{emissive:{value:new le(0)},specular:{value:new le(1118481)},shininess:{value:30}}]),vertexShader:qt.meshphong_vert,fragmentShader:qt.meshphong_frag},standard:{uniforms:Ye([lt.common,lt.envmap,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.roughnessmap,lt.metalnessmap,lt.fog,lt.lights,{emissive:{value:new le(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:qt.meshphysical_vert,fragmentShader:qt.meshphysical_frag},toon:{uniforms:Ye([lt.common,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.gradientmap,lt.fog,lt.lights,{emissive:{value:new le(0)}}]),vertexShader:qt.meshtoon_vert,fragmentShader:qt.meshtoon_frag},matcap:{uniforms:Ye([lt.common,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.fog,{matcap:{value:null}}]),vertexShader:qt.meshmatcap_vert,fragmentShader:qt.meshmatcap_frag},points:{uniforms:Ye([lt.points,lt.fog]),vertexShader:qt.points_vert,fragmentShader:qt.points_frag},dashed:{uniforms:Ye([lt.common,lt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:qt.linedashed_vert,fragmentShader:qt.linedashed_frag},depth:{uniforms:Ye([lt.common,lt.displacementmap]),vertexShader:qt.depth_vert,fragmentShader:qt.depth_frag},normal:{uniforms:Ye([lt.common,lt.bumpmap,lt.normalmap,lt.displacementmap,{opacity:{value:1}}]),vertexShader:qt.meshnormal_vert,fragmentShader:qt.meshnormal_frag},sprite:{uniforms:Ye([lt.sprite,lt.fog]),vertexShader:qt.sprite_vert,fragmentShader:qt.sprite_frag},background:{uniforms:{uvTransform:{value:new Vt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:qt.background_vert,fragmentShader:qt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Vt}},vertexShader:qt.backgroundCube_vert,fragmentShader:qt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:qt.cube_vert,fragmentShader:qt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:qt.equirect_vert,fragmentShader:qt.equirect_frag},distanceRGBA:{uniforms:Ye([lt.common,lt.displacementmap,{referencePosition:{value:new O},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:qt.distanceRGBA_vert,fragmentShader:qt.distanceRGBA_frag},shadow:{uniforms:Ye([lt.lights,lt.fog,{color:{value:new le(0)},opacity:{value:1}}]),vertexShader:qt.shadow_vert,fragmentShader:qt.shadow_frag}};$n.physical={uniforms:Ye([$n.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Vt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Vt},clearcoatNormalScale:{value:new Yt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Vt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Vt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Vt},sheen:{value:0},sheenColor:{value:new le(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Vt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Vt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Vt},transmissionSamplerSize:{value:new Yt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Vt},attenuationDistance:{value:0},attenuationColor:{value:new le(0)},specularColor:{value:new le(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Vt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Vt},anisotropyVector:{value:new Yt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Vt}}]),vertexShader:qt.meshphysical_vert,fragmentShader:qt.meshphysical_frag};const ka={r:0,b:0,g:0},rs=new gi,v_=new be;function x_(i,t,e,n,s,r,a){const o=new le(0);let l=r===!0?0:1,c,h,u=null,f=0,d=null;function g(x){let y=x.isScene===!0?x.background:null;return y&&y.isTexture&&(y=(x.backgroundBlurriness>0?e:t).get(y)),y}function v(x){let y=!1;const M=g(x);M===null?p(o,l):M&&M.isColor&&(p(M,1),y=!0);const C=i.xr.getEnvironmentBlendMode();C==="additive"?n.buffers.color.setClear(0,0,0,1,a):C==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||y)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(x,y){const M=g(y);M&&(M.isCubeTexture||M.mapping===Do)?(h===void 0&&(h=new Ce(new qi(1,1,1),new Gn({name:"BackgroundCubeMaterial",uniforms:or($n.backgroundCube.uniforms),vertexShader:$n.backgroundCube.vertexShader,fragmentShader:$n.backgroundCube.fragmentShader,side:tn,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(C,A,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),rs.copy(y.backgroundRotation),rs.x*=-1,rs.y*=-1,rs.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(rs.y*=-1,rs.z*=-1),h.material.uniforms.envMap.value=M,h.material.uniforms.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=y.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(v_.makeRotationFromEuler(rs)),h.material.toneMapped=re.getTransfer(M.colorSpace)!==de,(u!==M||f!==M.version||d!==i.toneMapping)&&(h.material.needsUpdate=!0,u=M,f=M.version,d=i.toneMapping),h.layers.enableAll(),x.unshift(h,h.geometry,h.material,0,0,null)):M&&M.isTexture&&(c===void 0&&(c=new Ce(new ds(2,2),new Gn({name:"BackgroundMaterial",uniforms:or($n.background.uniforms),vertexShader:$n.background.vertexShader,fragmentShader:$n.background.fragmentShader,side:pi,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=M,c.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,c.material.toneMapped=re.getTransfer(M.colorSpace)!==de,M.matrixAutoUpdate===!0&&M.updateMatrix(),c.material.uniforms.uvTransform.value.copy(M.matrix),(u!==M||f!==M.version||d!==i.toneMapping)&&(c.material.needsUpdate=!0,u=M,f=M.version,d=i.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null))}function p(x,y){x.getRGB(ka,Kf(i)),n.buffers.color.setClear(ka.r,ka.g,ka.b,y,a)}return{getClearColor:function(){return o},setClearColor:function(x,y=1){o.set(x),l=y,p(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(x){l=x,p(o,l)},render:v,addToRenderList:m}}function M_(i,t){const e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=f(null);let r=s,a=!1;function o(b,I,K,H,q){let Z=!1;const $=u(H,K,I);r!==$&&(r=$,c(r.object)),Z=d(b,H,K,q),Z&&g(b,H,K,q),q!==null&&t.update(q,i.ELEMENT_ARRAY_BUFFER),(Z||a)&&(a=!1,M(b,I,K,H),q!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(q).buffer))}function l(){return i.createVertexArray()}function c(b){return i.bindVertexArray(b)}function h(b){return i.deleteVertexArray(b)}function u(b,I,K){const H=K.wireframe===!0;let q=n[b.id];q===void 0&&(q={},n[b.id]=q);let Z=q[I.id];Z===void 0&&(Z={},q[I.id]=Z);let $=Z[H];return $===void 0&&($=f(l()),Z[H]=$),$}function f(b){const I=[],K=[],H=[];for(let q=0;q<e;q++)I[q]=0,K[q]=0,H[q]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:I,enabledAttributes:K,attributeDivisors:H,object:b,attributes:{},index:null}}function d(b,I,K,H){const q=r.attributes,Z=I.attributes;let $=0;const it=K.getAttributes();for(const W in it)if(it[W].location>=0){const _t=q[W];let Ct=Z[W];if(Ct===void 0&&(W==="instanceMatrix"&&b.instanceMatrix&&(Ct=b.instanceMatrix),W==="instanceColor"&&b.instanceColor&&(Ct=b.instanceColor)),_t===void 0||_t.attribute!==Ct||Ct&&_t.data!==Ct.data)return!0;$++}return r.attributesNum!==$||r.index!==H}function g(b,I,K,H){const q={},Z=I.attributes;let $=0;const it=K.getAttributes();for(const W in it)if(it[W].location>=0){let _t=Z[W];_t===void 0&&(W==="instanceMatrix"&&b.instanceMatrix&&(_t=b.instanceMatrix),W==="instanceColor"&&b.instanceColor&&(_t=b.instanceColor));const Ct={};Ct.attribute=_t,_t&&_t.data&&(Ct.data=_t.data),q[W]=Ct,$++}r.attributes=q,r.attributesNum=$,r.index=H}function v(){const b=r.newAttributes;for(let I=0,K=b.length;I<K;I++)b[I]=0}function m(b){p(b,0)}function p(b,I){const K=r.newAttributes,H=r.enabledAttributes,q=r.attributeDivisors;K[b]=1,H[b]===0&&(i.enableVertexAttribArray(b),H[b]=1),q[b]!==I&&(i.vertexAttribDivisor(b,I),q[b]=I)}function x(){const b=r.newAttributes,I=r.enabledAttributes;for(let K=0,H=I.length;K<H;K++)I[K]!==b[K]&&(i.disableVertexAttribArray(K),I[K]=0)}function y(b,I,K,H,q,Z,$){$===!0?i.vertexAttribIPointer(b,I,K,q,Z):i.vertexAttribPointer(b,I,K,H,q,Z)}function M(b,I,K,H){v();const q=H.attributes,Z=K.getAttributes(),$=I.defaultAttributeValues;for(const it in Z){const W=Z[it];if(W.location>=0){let ct=q[it];if(ct===void 0&&(it==="instanceMatrix"&&b.instanceMatrix&&(ct=b.instanceMatrix),it==="instanceColor"&&b.instanceColor&&(ct=b.instanceColor)),ct!==void 0){const _t=ct.normalized,Ct=ct.itemSize,Wt=t.get(ct);if(Wt===void 0)continue;const ce=Wt.buffer,Y=Wt.type,st=Wt.bytesPerElement,Tt=Y===i.INT||Y===i.UNSIGNED_INT||ct.gpuType===$c;if(ct.isInterleavedBufferAttribute){const ot=ct.data,It=ot.stride,kt=ct.offset;if(ot.isInstancedInterleavedBuffer){for(let Xt=0;Xt<W.locationSize;Xt++)p(W.location+Xt,ot.meshPerAttribute);b.isInstancedMesh!==!0&&H._maxInstanceCount===void 0&&(H._maxInstanceCount=ot.meshPerAttribute*ot.count)}else for(let Xt=0;Xt<W.locationSize;Xt++)m(W.location+Xt);i.bindBuffer(i.ARRAY_BUFFER,ce);for(let Xt=0;Xt<W.locationSize;Xt++)y(W.location+Xt,Ct/W.locationSize,Y,_t,It*st,(kt+Ct/W.locationSize*Xt)*st,Tt)}else{if(ct.isInstancedBufferAttribute){for(let ot=0;ot<W.locationSize;ot++)p(W.location+ot,ct.meshPerAttribute);b.isInstancedMesh!==!0&&H._maxInstanceCount===void 0&&(H._maxInstanceCount=ct.meshPerAttribute*ct.count)}else for(let ot=0;ot<W.locationSize;ot++)m(W.location+ot);i.bindBuffer(i.ARRAY_BUFFER,ce);for(let ot=0;ot<W.locationSize;ot++)y(W.location+ot,Ct/W.locationSize,Y,_t,Ct*st,Ct/W.locationSize*ot*st,Tt)}}else if($!==void 0){const _t=$[it];if(_t!==void 0)switch(_t.length){case 2:i.vertexAttrib2fv(W.location,_t);break;case 3:i.vertexAttrib3fv(W.location,_t);break;case 4:i.vertexAttrib4fv(W.location,_t);break;default:i.vertexAttrib1fv(W.location,_t)}}}}x()}function C(){L();for(const b in n){const I=n[b];for(const K in I){const H=I[K];for(const q in H)h(H[q].object),delete H[q];delete I[K]}delete n[b]}}function A(b){if(n[b.id]===void 0)return;const I=n[b.id];for(const K in I){const H=I[K];for(const q in H)h(H[q].object),delete H[q];delete I[K]}delete n[b.id]}function w(b){for(const I in n){const K=n[I];if(K[b.id]===void 0)continue;const H=K[b.id];for(const q in H)h(H[q].object),delete H[q];delete K[b.id]}}function L(){T(),a=!0,r!==s&&(r=s,c(r.object))}function T(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:L,resetDefaultState:T,dispose:C,releaseStatesOfGeometry:A,releaseStatesOfProgram:w,initAttributes:v,enableAttribute:m,disableUnusedAttributes:x}}function y_(i,t,e){let n;function s(c){n=c}function r(c,h){i.drawArrays(n,c,h),e.update(h,n,1)}function a(c,h,u){u!==0&&(i.drawArraysInstanced(n,c,h,u),e.update(h,n,u))}function o(c,h,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let d=0;for(let g=0;g<u;g++)d+=h[g];e.update(d,n,1)}function l(c,h,u,f){if(u===0)return;const d=t.get("WEBGL_multi_draw");if(d===null)for(let g=0;g<c.length;g++)a(c[g],h[g],f[g]);else{d.multiDrawArraysInstancedWEBGL(n,c,0,h,0,f,0,u);let g=0;for(let v=0;v<u;v++)g+=h[v]*f[v];e.update(g,n,1)}}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function S_(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){const w=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(w){return!(w!==wn&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(w){const L=w===la&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(w!==mi&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&w!==oi&&!L)}function l(w){if(w==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=e.logarithmicDepthBuffer===!0,f=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control"),d=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),x=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),y=i.getParameter(i.MAX_VARYING_VECTORS),M=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),C=g>0,A=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reverseDepthBuffer:f,maxTextures:d,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:x,maxVaryings:y,maxFragmentUniforms:M,vertexTextures:C,maxSamples:A}}function E_(i){const t=this;let e=null,n=0,s=!1,r=!1;const a=new ls,o=new Vt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){const d=u.length!==0||f||n!==0||s;return s=f,n=u.length,d},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,f){e=h(u,f,0)},this.setState=function(u,f,d){const g=u.clippingPlanes,v=u.clipIntersection,m=u.clipShadows,p=i.get(u);if(!s||g===null||g.length===0||r&&!m)r?h(null):c();else{const x=r?0:n,y=x*4;let M=p.clippingState||null;l.value=M,M=h(g,f,y,d);for(let C=0;C!==y;++C)M[C]=e[C];p.clippingState=M,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=x}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(u,f,d,g){const v=u!==null?u.length:0;let m=null;if(v!==0){if(m=l.value,g!==!0||m===null){const p=d+v*4,x=f.matrixWorldInverse;o.getNormalMatrix(x),(m===null||m.length<p)&&(m=new Float32Array(p));for(let y=0,M=d;y!==v;++y,M+=4)a.copy(u[y]).applyMatrix4(x,o),a.normal.toArray(m,M),m[M+3]=a.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=v,t.numIntersection=0,m}}function b_(i){let t=new WeakMap;function e(a,o){return o===Jl?a.mapping=ir:o===Ql&&(a.mapping=sr),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===Jl||o===Ql)if(t.has(a)){const l=t.get(a).texture;return e(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new Om(l.height);return c.fromEquirectangularTexture(i,a),t.set(a,c),a.addEventListener("dispose",s),e(c.texture,a.mapping)}else return null}}return a}function s(a){const o=a.target;o.removeEventListener("dispose",s);const l=t.get(o);l!==void 0&&(t.delete(o),l.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}class T_ extends Yf{constructor(t=-1,e=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-t,a=n+t,o=s+e,l=s-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}const qs=4,Kh=[.125,.215,.35,.446,.526,.582],us=20,_l=new T_,Yh=new le;let vl=null,xl=0,Ml=0,yl=!1;const cs=(1+Math.sqrt(5))/2,zs=1/cs,jh=[new O(-cs,zs,0),new O(cs,zs,0),new O(-zs,0,cs),new O(zs,0,cs),new O(0,cs,-zs),new O(0,cs,zs),new O(-1,1,-1),new O(1,1,-1),new O(-1,1,1),new O(1,1,1)];class Zh{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,s=100){vl=this._renderer.getRenderTarget(),xl=this._renderer.getActiveCubeFace(),Ml=this._renderer.getActiveMipmapLevel(),yl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,n,s,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=tu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Qh(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(vl,xl,Ml),this._renderer.xr.enabled=yl,t.scissorTest=!1,za(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===ir||t.mapping===sr?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),vl=this._renderer.getRenderTarget(),xl=this._renderer.getActiveCubeFace(),Ml=this._renderer.getActiveMipmapLevel(),yl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:_n,minFilter:_n,generateMipmaps:!1,type:la,format:wn,colorSpace:ur,depthBuffer:!1},s=Jh(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Jh(t,e,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=A_(r)),this._blurMaterial=w_(r,t,e)}return s}_compileMaterial(t){const e=new Ce(this._lodPlanes[0],t);this._renderer.compile(e,_l)}_sceneToCubeUV(t,e,n,s){const o=new En(90,1,e,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,f=h.toneMapping;h.getClearColor(Yh),h.toneMapping=Hi,h.autoClear=!1;const d=new Vi({name:"PMREM.Background",side:tn,depthWrite:!1,depthTest:!1}),g=new Ce(new qi,d);let v=!1;const m=t.background;m?m.isColor&&(d.color.copy(m),t.background=null,v=!0):(d.color.copy(Yh),v=!0);for(let p=0;p<6;p++){const x=p%3;x===0?(o.up.set(0,l[p],0),o.lookAt(c[p],0,0)):x===1?(o.up.set(0,0,l[p]),o.lookAt(0,c[p],0)):(o.up.set(0,l[p],0),o.lookAt(0,0,c[p]));const y=this._cubeSize;za(s,x*y,p>2?y:0,y,y),h.setRenderTarget(s),v&&h.render(g,o),h.render(t,o)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=f,h.autoClear=u,t.background=m}_textureToCubeUV(t,e){const n=this._renderer,s=t.mapping===ir||t.mapping===sr;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=tu()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Qh());const r=s?this._cubemapMaterial:this._equirectMaterial,a=new Ce(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=t;const l=this._cubeSize;za(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(a,_l)}_applyPMREM(t){const e=this._renderer,n=e.autoClear;e.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=jh[(s-r-1)%jh.length];this._blur(t,r-1,r,a,o)}e.autoClear=n}_blur(t,e,n,s,r){const a=this._pingPongRenderTarget;this._halfBlur(t,a,e,n,s,"latitudinal",r),this._halfBlur(a,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new Ce(this._lodPlanes[s],c),f=c.uniforms,d=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*d):2*Math.PI/(2*us-1),v=r/g,m=isFinite(r)?1+Math.floor(h*v):us;m>us&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${us}`);const p=[];let x=0;for(let w=0;w<us;++w){const L=w/v,T=Math.exp(-L*L/2);p.push(T),w===0?x+=T:w<m&&(x+=2*T)}for(let w=0;w<p.length;w++)p[w]=p[w]/x;f.envMap.value=t.texture,f.samples.value=m,f.weights.value=p,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);const{_lodMax:y}=this;f.dTheta.value=g,f.mipInt.value=y-n;const M=this._sizeLods[s],C=3*M*(s>y-qs?s-y+qs:0),A=4*(this._cubeSize-M);za(e,C,A,3*M,2*M),l.setRenderTarget(e),l.render(u,_l)}}function A_(i){const t=[],e=[],n=[];let s=i;const r=i-qs+1+Kh.length;for(let a=0;a<r;a++){const o=Math.pow(2,s);e.push(o);let l=1/o;a>i-qs?l=Kh[a-i+qs-1]:a===0&&(l=0),n.push(l);const c=1/(o-2),h=-c,u=1+c,f=[h,h,u,h,u,u,h,h,u,u,h,u],d=6,g=6,v=3,m=2,p=1,x=new Float32Array(v*g*d),y=new Float32Array(m*g*d),M=new Float32Array(p*g*d);for(let A=0;A<d;A++){const w=A%3*2/3-1,L=A>2?0:-1,T=[w,L,0,w+2/3,L,0,w+2/3,L+1,0,w,L,0,w+2/3,L+1,0,w,L+1,0];x.set(T,v*g*A),y.set(f,m*g*A);const b=[A,A,A,A,A,A];M.set(b,p*g*A)}const C=new Oe;C.setAttribute("position",new Ne(x,v)),C.setAttribute("uv",new Ne(y,m)),C.setAttribute("faceIndex",new Ne(M,p)),t.push(C),s>qs&&s--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function Jh(i,t,e){const n=new _s(i,t,e);return n.texture.mapping=Do,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function za(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function w_(i,t,e){const n=new Float32Array(us),s=new O(0,1,0);return new Gn({name:"SphericalGaussianBlur",defines:{n:us,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Qc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Bi,depthTest:!1,depthWrite:!1})}function Qh(){return new Gn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Qc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Bi,depthTest:!1,depthWrite:!1})}function tu(){return new Gn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Qc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Bi,depthTest:!1,depthWrite:!1})}function Qc(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function R_(i){let t=new WeakMap,e=null;function n(o){if(o&&o.isTexture){const l=o.mapping,c=l===Jl||l===Ql,h=l===ir||l===sr;if(c||h){let u=t.get(o);const f=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==f)return e===null&&(e=new Zh(i)),u=c?e.fromEquirectangular(o,u):e.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),u.texture;if(u!==void 0)return u.texture;{const d=o.image;return c&&d&&d.height>0||h&&d&&s(d)?(e===null&&(e=new Zh(i)),u=c?e.fromEquirectangular(o):e.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),o.addEventListener("dispose",r),u.texture):null}}}return o}function s(o){let l=0;const c=6;for(let h=0;h<c;h++)o[h]!==void 0&&l++;return l===c}function r(o){const l=o.target;l.removeEventListener("dispose",r);const c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function a(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:a}}function C_(i){const t={};function e(n){if(t[n]!==void 0)return t[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const s=e(n);return s===null&&zr("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function L_(i,t,e,n){const s={},r=new WeakMap;function a(u){const f=u.target;f.index!==null&&t.remove(f.index);for(const g in f.attributes)t.remove(f.attributes[g]);for(const g in f.morphAttributes){const v=f.morphAttributes[g];for(let m=0,p=v.length;m<p;m++)t.remove(v[m])}f.removeEventListener("dispose",a),delete s[f.id];const d=r.get(f);d&&(t.remove(d),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,e.memory.geometries--}function o(u,f){return s[f.id]===!0||(f.addEventListener("dispose",a),s[f.id]=!0,e.memory.geometries++),f}function l(u){const f=u.attributes;for(const g in f)t.update(f[g],i.ARRAY_BUFFER);const d=u.morphAttributes;for(const g in d){const v=d[g];for(let m=0,p=v.length;m<p;m++)t.update(v[m],i.ARRAY_BUFFER)}}function c(u){const f=[],d=u.index,g=u.attributes.position;let v=0;if(d!==null){const x=d.array;v=d.version;for(let y=0,M=x.length;y<M;y+=3){const C=x[y+0],A=x[y+1],w=x[y+2];f.push(C,A,A,w,w,C)}}else if(g!==void 0){const x=g.array;v=g.version;for(let y=0,M=x.length/3-1;y<M;y+=3){const C=y+0,A=y+1,w=y+2;f.push(C,A,A,w,w,C)}}else return;const m=new(Hf(f)?qf:$f)(f,1);m.version=v;const p=r.get(u);p&&t.remove(p),r.set(u,m)}function h(u){const f=r.get(u);if(f){const d=u.index;d!==null&&f.version<d.version&&c(u)}else c(u);return r.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function D_(i,t,e){let n;function s(f){n=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function l(f,d){i.drawElements(n,d,r,f*a),e.update(d,n,1)}function c(f,d,g){g!==0&&(i.drawElementsInstanced(n,d,r,f*a,g),e.update(d,n,g))}function h(f,d,g){if(g===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,f,0,g);let m=0;for(let p=0;p<g;p++)m+=d[p];e.update(m,n,1)}function u(f,d,g,v){if(g===0)return;const m=t.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<f.length;p++)c(f[p]/a,d[p],v[p]);else{m.multiDrawElementsInstancedWEBGL(n,d,0,r,f,0,v,0,g);let p=0;for(let x=0;x<g;x++)p+=d[x]*v[x];e.update(p,n,1)}}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function P_(i){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case i.TRIANGLES:e.triangles+=o*(r/3);break;case i.LINES:e.lines+=o*(r/2);break;case i.LINE_STRIP:e.lines+=o*(r-1);break;case i.LINE_LOOP:e.lines+=o*r;break;case i.POINTS:e.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function I_(i,t,e){const n=new WeakMap,s=new De;function r(a,o,l){const c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0;let f=n.get(o);if(f===void 0||f.count!==u){let T=function(){w.dispose(),n.delete(o),o.removeEventListener("dispose",T)};f!==void 0&&f.texture.dispose();const d=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,v=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],x=o.morphAttributes.color||[];let y=0;d===!0&&(y=1),g===!0&&(y=2),v===!0&&(y=3);let M=o.attributes.position.count*y,C=1;M>t.maxTextureSize&&(C=Math.ceil(M/t.maxTextureSize),M=t.maxTextureSize);const A=new Float32Array(M*C*4*u),w=new Vf(A,M,C,u);w.type=oi,w.needsUpdate=!0;const L=y*4;for(let b=0;b<u;b++){const I=m[b],K=p[b],H=x[b],q=M*C*4*b;for(let Z=0;Z<I.count;Z++){const $=Z*L;d===!0&&(s.fromBufferAttribute(I,Z),A[q+$+0]=s.x,A[q+$+1]=s.y,A[q+$+2]=s.z,A[q+$+3]=0),g===!0&&(s.fromBufferAttribute(K,Z),A[q+$+4]=s.x,A[q+$+5]=s.y,A[q+$+6]=s.z,A[q+$+7]=0),v===!0&&(s.fromBufferAttribute(H,Z),A[q+$+8]=s.x,A[q+$+9]=s.y,A[q+$+10]=s.z,A[q+$+11]=H.itemSize===4?s.w:1)}}f={count:u,texture:w,size:new Yt(M,C)},n.set(o,f),o.addEventListener("dispose",T)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,e);else{let d=0;for(let v=0;v<c.length;v++)d+=c[v];const g=o.morphTargetsRelative?1:1-d;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",f.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",f.size)}return{update:r}}function N_(i,t,e,n){let s=new WeakMap;function r(l){const c=n.render.frame,h=l.geometry,u=t.get(l,h);if(s.get(u)!==c&&(t.update(u),s.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),s.get(l)!==c&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const f=l.skeleton;s.get(f)!==c&&(f.update(),s.set(f,c))}return u}function a(){s=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:a}}class Qf extends $e{constructor(t,e,n,s,r,a,o,l,c,h=Qs){if(h!==Qs&&h!==ar)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===Qs&&(n=gs),n===void 0&&h===ar&&(n=rr),super(null,s,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=o!==void 0?o:en,this.minFilter=l!==void 0?l:en,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}const td=new $e,eu=new Qf(1,1),ed=new Vf,nd=new xm,id=new jf,nu=[],iu=[],su=new Float32Array(16),ru=new Float32Array(9),au=new Float32Array(4);function pr(i,t,e){const n=i[0];if(n<=0||n>0)return i;const s=t*e;let r=nu[s];if(r===void 0&&(r=new Float32Array(s),nu[s]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,i[a].toArray(r,o)}return r}function Ue(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function ke(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function Io(i,t){let e=iu[t];e===void 0&&(e=new Int32Array(t),iu[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function O_(i,t){const e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function U_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ue(e,t))return;i.uniform2fv(this.addr,t),ke(e,t)}}function k_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Ue(e,t))return;i.uniform3fv(this.addr,t),ke(e,t)}}function z_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ue(e,t))return;i.uniform4fv(this.addr,t),ke(e,t)}}function F_(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ue(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),ke(e,t)}else{if(Ue(e,n))return;au.set(n),i.uniformMatrix2fv(this.addr,!1,au),ke(e,n)}}function B_(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ue(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),ke(e,t)}else{if(Ue(e,n))return;ru.set(n),i.uniformMatrix3fv(this.addr,!1,ru),ke(e,n)}}function H_(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ue(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),ke(e,t)}else{if(Ue(e,n))return;su.set(n),i.uniformMatrix4fv(this.addr,!1,su),ke(e,n)}}function G_(i,t){const e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function V_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ue(e,t))return;i.uniform2iv(this.addr,t),ke(e,t)}}function W_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ue(e,t))return;i.uniform3iv(this.addr,t),ke(e,t)}}function X_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ue(e,t))return;i.uniform4iv(this.addr,t),ke(e,t)}}function $_(i,t){const e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function q_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ue(e,t))return;i.uniform2uiv(this.addr,t),ke(e,t)}}function K_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ue(e,t))return;i.uniform3uiv(this.addr,t),ke(e,t)}}function Y_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ue(e,t))return;i.uniform4uiv(this.addr,t),ke(e,t)}}function j_(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(eu.compareFunction=Bf,r=eu):r=td,e.setTexture2D(t||r,s)}function Z_(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||nd,s)}function J_(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||id,s)}function Q_(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||ed,s)}function tv(i){switch(i){case 5126:return O_;case 35664:return U_;case 35665:return k_;case 35666:return z_;case 35674:return F_;case 35675:return B_;case 35676:return H_;case 5124:case 35670:return G_;case 35667:case 35671:return V_;case 35668:case 35672:return W_;case 35669:case 35673:return X_;case 5125:return $_;case 36294:return q_;case 36295:return K_;case 36296:return Y_;case 35678:case 36198:case 36298:case 36306:case 35682:return j_;case 35679:case 36299:case 36307:return Z_;case 35680:case 36300:case 36308:case 36293:return J_;case 36289:case 36303:case 36311:case 36292:return Q_}}function ev(i,t){i.uniform1fv(this.addr,t)}function nv(i,t){const e=pr(t,this.size,2);i.uniform2fv(this.addr,e)}function iv(i,t){const e=pr(t,this.size,3);i.uniform3fv(this.addr,e)}function sv(i,t){const e=pr(t,this.size,4);i.uniform4fv(this.addr,e)}function rv(i,t){const e=pr(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function av(i,t){const e=pr(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function ov(i,t){const e=pr(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function lv(i,t){i.uniform1iv(this.addr,t)}function cv(i,t){i.uniform2iv(this.addr,t)}function hv(i,t){i.uniform3iv(this.addr,t)}function uv(i,t){i.uniform4iv(this.addr,t)}function fv(i,t){i.uniform1uiv(this.addr,t)}function dv(i,t){i.uniform2uiv(this.addr,t)}function pv(i,t){i.uniform3uiv(this.addr,t)}function mv(i,t){i.uniform4uiv(this.addr,t)}function gv(i,t,e){const n=this.cache,s=t.length,r=Io(e,s);Ue(n,r)||(i.uniform1iv(this.addr,r),ke(n,r));for(let a=0;a!==s;++a)e.setTexture2D(t[a]||td,r[a])}function _v(i,t,e){const n=this.cache,s=t.length,r=Io(e,s);Ue(n,r)||(i.uniform1iv(this.addr,r),ke(n,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||nd,r[a])}function vv(i,t,e){const n=this.cache,s=t.length,r=Io(e,s);Ue(n,r)||(i.uniform1iv(this.addr,r),ke(n,r));for(let a=0;a!==s;++a)e.setTextureCube(t[a]||id,r[a])}function xv(i,t,e){const n=this.cache,s=t.length,r=Io(e,s);Ue(n,r)||(i.uniform1iv(this.addr,r),ke(n,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||ed,r[a])}function Mv(i){switch(i){case 5126:return ev;case 35664:return nv;case 35665:return iv;case 35666:return sv;case 35674:return rv;case 35675:return av;case 35676:return ov;case 5124:case 35670:return lv;case 35667:case 35671:return cv;case 35668:case 35672:return hv;case 35669:case 35673:return uv;case 5125:return fv;case 36294:return dv;case 36295:return pv;case 36296:return mv;case 35678:case 36198:case 36298:case 36306:case 35682:return gv;case 35679:case 36299:case 36307:return _v;case 35680:case 36300:case 36308:case 36293:return vv;case 36289:case 36303:case 36311:case 36292:return xv}}class yv{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=tv(e.type)}}class Sv{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Mv(e.type)}}class Ev{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(t,e[o.id],n)}}}const Sl=/(\w+)(\])?(\[|\.)?/g;function ou(i,t){i.seq.push(t),i.map[t.id]=t}function bv(i,t,e){const n=i.name,s=n.length;for(Sl.lastIndex=0;;){const r=Sl.exec(n),a=Sl.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){ou(e,c===void 0?new yv(o,i,t):new Sv(o,i,t));break}else{let u=e.map[o];u===void 0&&(u=new Ev(o),ou(e,u)),e=u}}}class oo{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=t.getActiveUniform(e,s),a=t.getUniformLocation(e,r.name);bv(r,a,this)}}setValue(t,e,n,s){const r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){const s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,a=e.length;r!==a;++r){const o=e[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,e){const n=[];for(let s=0,r=t.length;s!==r;++s){const a=t[s];a.id in e&&n.push(a)}return n}}function lu(i,t,e){const n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}const Tv=37297;let Av=0;function wv(i,t){const e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){const o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}const cu=new Vt;function Rv(i){re._getMatrix(cu,re.workingColorSpace,i);const t=`mat3( ${cu.elements.map(e=>e.toFixed(4))} )`;switch(re.getTransfer(i)){case Po:return[t,"LinearTransferOETF"];case de:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function hu(i,t,e){const n=i.getShaderParameter(t,i.COMPILE_STATUS),s=i.getShaderInfoLog(t).trim();if(n&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const a=parseInt(r[1]);return e.toUpperCase()+`

`+s+`

`+wv(i.getShaderSource(t),a)}else return s}function Cv(i,t){const e=Rv(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}function Lv(i,t){let e;switch(t){case Xp:e="Linear";break;case $p:e="Reinhard";break;case qp:e="Cineon";break;case Kp:e="ACESFilmic";break;case jp:e="AgX";break;case Zp:e="Neutral";break;case Yp:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const Fa=new O;function Dv(){re.getLuminanceCoefficients(Fa);const i=Fa.x.toFixed(4),t=Fa.y.toFixed(4),e=Fa.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Pv(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Fr).join(`
`)}function Iv(i){const t=[];for(const e in i){const n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function Nv(i,t){const e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(t,s),a=r.name;let o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:i.getAttribLocation(t,a),locationSize:o}}return e}function Fr(i){return i!==""}function uu(i,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function fu(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const Ov=/^[ \t]*#include +<([\w\d./]+)>/gm;function Cc(i){return i.replace(Ov,kv)}const Uv=new Map;function kv(i,t){let e=qt[t];if(e===void 0){const n=Uv.get(t);if(n!==void 0)e=qt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return Cc(e)}const zv=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function du(i){return i.replace(zv,Fv)}function Fv(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function pu(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function Bv(i){let t="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===wf?t="SHADOWMAP_TYPE_PCF":i.shadowMapType===bp?t="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===ai&&(t="SHADOWMAP_TYPE_VSM"),t}function Hv(i){let t="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case ir:case sr:t="ENVMAP_TYPE_CUBE";break;case Do:t="ENVMAP_TYPE_CUBE_UV";break}return t}function Gv(i){let t="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case sr:t="ENVMAP_MODE_REFRACTION";break}return t}function Vv(i){let t="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Rf:t="ENVMAP_BLENDING_MULTIPLY";break;case Vp:t="ENVMAP_BLENDING_MIX";break;case Wp:t="ENVMAP_BLENDING_ADD";break}return t}function Wv(i){const t=i.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:n,maxMip:e}}function Xv(i,t,e,n){const s=i.getContext(),r=e.defines;let a=e.vertexShader,o=e.fragmentShader;const l=Bv(e),c=Hv(e),h=Gv(e),u=Vv(e),f=Wv(e),d=Pv(e),g=Iv(r),v=s.createProgram();let m,p,x=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Fr).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Fr).join(`
`),p.length>0&&(p+=`
`)):(m=[pu(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Fr).join(`
`),p=[pu(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Hi?"#define TONE_MAPPING":"",e.toneMapping!==Hi?qt.tonemapping_pars_fragment:"",e.toneMapping!==Hi?Lv("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",qt.colorspace_pars_fragment,Cv("linearToOutputTexel",e.outputColorSpace),Dv(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Fr).join(`
`)),a=Cc(a),a=uu(a,e),a=fu(a,e),o=Cc(o),o=uu(o,e),o=fu(o,e),a=du(a),o=du(o),e.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",e.glslVersion===wh?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===wh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const y=x+m+a,M=x+p+o,C=lu(s,s.VERTEX_SHADER,y),A=lu(s,s.FRAGMENT_SHADER,M);s.attachShader(v,C),s.attachShader(v,A),e.index0AttributeName!==void 0?s.bindAttribLocation(v,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function w(I){if(i.debug.checkShaderErrors){const K=s.getProgramInfoLog(v).trim(),H=s.getShaderInfoLog(C).trim(),q=s.getShaderInfoLog(A).trim();let Z=!0,$=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if(Z=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,v,C,A);else{const it=hu(s,C,"vertex"),W=hu(s,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+K+`
`+it+`
`+W)}else K!==""?console.warn("THREE.WebGLProgram: Program Info Log:",K):(H===""||q==="")&&($=!1);$&&(I.diagnostics={runnable:Z,programLog:K,vertexShader:{log:H,prefix:m},fragmentShader:{log:q,prefix:p}})}s.deleteShader(C),s.deleteShader(A),L=new oo(s,v),T=Nv(s,v)}let L;this.getUniforms=function(){return L===void 0&&w(this),L};let T;this.getAttributes=function(){return T===void 0&&w(this),T};let b=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return b===!1&&(b=s.getProgramParameter(v,Tv)),b},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Av++,this.cacheKey=t,this.usedTimes=1,this.program=v,this.vertexShader=C,this.fragmentShader=A,this}let $v=0;class qv{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,n=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(t);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new Kv(t),e.set(t,n)),n}}class Kv{constructor(t){this.id=$v++,this.code=t,this.usedTimes=0}}function Yv(i,t,e,n,s,r,a){const o=new Wf,l=new qv,c=new Set,h=[],u=s.logarithmicDepthBuffer,f=s.vertexTextures;let d=s.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(T){return c.add(T),T===0?"uv":`uv${T}`}function m(T,b,I,K,H){const q=K.fog,Z=H.geometry,$=T.isMeshStandardMaterial?K.environment:null,it=(T.isMeshStandardMaterial?e:t).get(T.envMap||$),W=it&&it.mapping===Do?it.image.height:null,ct=g[T.type];T.precision!==null&&(d=s.getMaxPrecision(T.precision),d!==T.precision&&console.warn("THREE.WebGLProgram.getParameters:",T.precision,"not supported, using",d,"instead."));const _t=Z.morphAttributes.position||Z.morphAttributes.normal||Z.morphAttributes.color,Ct=_t!==void 0?_t.length:0;let Wt=0;Z.morphAttributes.position!==void 0&&(Wt=1),Z.morphAttributes.normal!==void 0&&(Wt=2),Z.morphAttributes.color!==void 0&&(Wt=3);let ce,Y,st,Tt;if(ct){const fe=$n[ct];ce=fe.vertexShader,Y=fe.fragmentShader}else ce=T.vertexShader,Y=T.fragmentShader,l.update(T),st=l.getVertexShaderID(T),Tt=l.getFragmentShaderID(T);const ot=i.getRenderTarget(),It=i.state.buffers.depth.getReversed(),kt=H.isInstancedMesh===!0,Xt=H.isBatchedMesh===!0,Se=!!T.map,ne=!!T.matcap,Le=!!it,z=!!T.aoMap,vn=!!T.lightMap,Zt=!!T.bumpMap,Jt=!!T.normalMap,Ot=!!T.displacementMap,xe=!!T.emissiveMap,Nt=!!T.metalnessMap,R=!!T.roughnessMap,S=T.anisotropy>0,B=T.clearcoat>0,J=T.dispersion>0,nt=T.iridescence>0,j=T.sheen>0,Lt=T.transmission>0,ft=S&&!!T.anisotropyMap,St=B&&!!T.clearcoatMap,ie=B&&!!T.clearcoatNormalMap,rt=B&&!!T.clearcoatRoughnessMap,Et=nt&&!!T.iridescenceMap,Ut=nt&&!!T.iridescenceThicknessMap,zt=j&&!!T.sheenColorMap,bt=j&&!!T.sheenRoughnessMap,Qt=!!T.specularMap,$t=!!T.specularColorMap,_e=!!T.specularIntensityMap,N=Lt&&!!T.transmissionMap,ut=Lt&&!!T.thicknessMap,X=!!T.gradientMap,Q=!!T.alphaMap,mt=T.alphaTest>0,dt=!!T.alphaHash,Ht=!!T.extensions;let we=Hi;T.toneMapped&&(ot===null||ot.isXRRenderTarget===!0)&&(we=i.toneMapping);const He={shaderID:ct,shaderType:T.type,shaderName:T.name,vertexShader:ce,fragmentShader:Y,defines:T.defines,customVertexShaderID:st,customFragmentShaderID:Tt,isRawShaderMaterial:T.isRawShaderMaterial===!0,glslVersion:T.glslVersion,precision:d,batching:Xt,batchingColor:Xt&&H._colorsTexture!==null,instancing:kt,instancingColor:kt&&H.instanceColor!==null,instancingMorph:kt&&H.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:ot===null?i.outputColorSpace:ot.isXRRenderTarget===!0?ot.texture.colorSpace:ur,alphaToCoverage:!!T.alphaToCoverage,map:Se,matcap:ne,envMap:Le,envMapMode:Le&&it.mapping,envMapCubeUVHeight:W,aoMap:z,lightMap:vn,bumpMap:Zt,normalMap:Jt,displacementMap:f&&Ot,emissiveMap:xe,normalMapObjectSpace:Jt&&T.normalMapType===nm,normalMapTangentSpace:Jt&&T.normalMapType===em,metalnessMap:Nt,roughnessMap:R,anisotropy:S,anisotropyMap:ft,clearcoat:B,clearcoatMap:St,clearcoatNormalMap:ie,clearcoatRoughnessMap:rt,dispersion:J,iridescence:nt,iridescenceMap:Et,iridescenceThicknessMap:Ut,sheen:j,sheenColorMap:zt,sheenRoughnessMap:bt,specularMap:Qt,specularColorMap:$t,specularIntensityMap:_e,transmission:Lt,transmissionMap:N,thicknessMap:ut,gradientMap:X,opaque:T.transparent===!1&&T.blending===Js&&T.alphaToCoverage===!1,alphaMap:Q,alphaTest:mt,alphaHash:dt,combine:T.combine,mapUv:Se&&v(T.map.channel),aoMapUv:z&&v(T.aoMap.channel),lightMapUv:vn&&v(T.lightMap.channel),bumpMapUv:Zt&&v(T.bumpMap.channel),normalMapUv:Jt&&v(T.normalMap.channel),displacementMapUv:Ot&&v(T.displacementMap.channel),emissiveMapUv:xe&&v(T.emissiveMap.channel),metalnessMapUv:Nt&&v(T.metalnessMap.channel),roughnessMapUv:R&&v(T.roughnessMap.channel),anisotropyMapUv:ft&&v(T.anisotropyMap.channel),clearcoatMapUv:St&&v(T.clearcoatMap.channel),clearcoatNormalMapUv:ie&&v(T.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:rt&&v(T.clearcoatRoughnessMap.channel),iridescenceMapUv:Et&&v(T.iridescenceMap.channel),iridescenceThicknessMapUv:Ut&&v(T.iridescenceThicknessMap.channel),sheenColorMapUv:zt&&v(T.sheenColorMap.channel),sheenRoughnessMapUv:bt&&v(T.sheenRoughnessMap.channel),specularMapUv:Qt&&v(T.specularMap.channel),specularColorMapUv:$t&&v(T.specularColorMap.channel),specularIntensityMapUv:_e&&v(T.specularIntensityMap.channel),transmissionMapUv:N&&v(T.transmissionMap.channel),thicknessMapUv:ut&&v(T.thicknessMap.channel),alphaMapUv:Q&&v(T.alphaMap.channel),vertexTangents:!!Z.attributes.tangent&&(Jt||S),vertexColors:T.vertexColors,vertexAlphas:T.vertexColors===!0&&!!Z.attributes.color&&Z.attributes.color.itemSize===4,pointsUvs:H.isPoints===!0&&!!Z.attributes.uv&&(Se||Q),fog:!!q,useFog:T.fog===!0,fogExp2:!!q&&q.isFogExp2,flatShading:T.flatShading===!0,sizeAttenuation:T.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:It,skinning:H.isSkinnedMesh===!0,morphTargets:Z.morphAttributes.position!==void 0,morphNormals:Z.morphAttributes.normal!==void 0,morphColors:Z.morphAttributes.color!==void 0,morphTargetsCount:Ct,morphTextureStride:Wt,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:T.dithering,shadowMapEnabled:i.shadowMap.enabled&&I.length>0,shadowMapType:i.shadowMap.type,toneMapping:we,decodeVideoTexture:Se&&T.map.isVideoTexture===!0&&re.getTransfer(T.map.colorSpace)===de,decodeVideoTextureEmissive:xe&&T.emissiveMap.isVideoTexture===!0&&re.getTransfer(T.emissiveMap.colorSpace)===de,premultipliedAlpha:T.premultipliedAlpha,doubleSided:T.side===bn,flipSided:T.side===tn,useDepthPacking:T.depthPacking>=0,depthPacking:T.depthPacking||0,index0AttributeName:T.index0AttributeName,extensionClipCullDistance:Ht&&T.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ht&&T.extensions.multiDraw===!0||Xt)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:T.customProgramCacheKey()};return He.vertexUv1s=c.has(1),He.vertexUv2s=c.has(2),He.vertexUv3s=c.has(3),c.clear(),He}function p(T){const b=[];if(T.shaderID?b.push(T.shaderID):(b.push(T.customVertexShaderID),b.push(T.customFragmentShaderID)),T.defines!==void 0)for(const I in T.defines)b.push(I),b.push(T.defines[I]);return T.isRawShaderMaterial===!1&&(x(b,T),y(b,T),b.push(i.outputColorSpace)),b.push(T.customProgramCacheKey),b.join()}function x(T,b){T.push(b.precision),T.push(b.outputColorSpace),T.push(b.envMapMode),T.push(b.envMapCubeUVHeight),T.push(b.mapUv),T.push(b.alphaMapUv),T.push(b.lightMapUv),T.push(b.aoMapUv),T.push(b.bumpMapUv),T.push(b.normalMapUv),T.push(b.displacementMapUv),T.push(b.emissiveMapUv),T.push(b.metalnessMapUv),T.push(b.roughnessMapUv),T.push(b.anisotropyMapUv),T.push(b.clearcoatMapUv),T.push(b.clearcoatNormalMapUv),T.push(b.clearcoatRoughnessMapUv),T.push(b.iridescenceMapUv),T.push(b.iridescenceThicknessMapUv),T.push(b.sheenColorMapUv),T.push(b.sheenRoughnessMapUv),T.push(b.specularMapUv),T.push(b.specularColorMapUv),T.push(b.specularIntensityMapUv),T.push(b.transmissionMapUv),T.push(b.thicknessMapUv),T.push(b.combine),T.push(b.fogExp2),T.push(b.sizeAttenuation),T.push(b.morphTargetsCount),T.push(b.morphAttributeCount),T.push(b.numDirLights),T.push(b.numPointLights),T.push(b.numSpotLights),T.push(b.numSpotLightMaps),T.push(b.numHemiLights),T.push(b.numRectAreaLights),T.push(b.numDirLightShadows),T.push(b.numPointLightShadows),T.push(b.numSpotLightShadows),T.push(b.numSpotLightShadowsWithMaps),T.push(b.numLightProbes),T.push(b.shadowMapType),T.push(b.toneMapping),T.push(b.numClippingPlanes),T.push(b.numClipIntersection),T.push(b.depthPacking)}function y(T,b){o.disableAll(),b.supportsVertexTextures&&o.enable(0),b.instancing&&o.enable(1),b.instancingColor&&o.enable(2),b.instancingMorph&&o.enable(3),b.matcap&&o.enable(4),b.envMap&&o.enable(5),b.normalMapObjectSpace&&o.enable(6),b.normalMapTangentSpace&&o.enable(7),b.clearcoat&&o.enable(8),b.iridescence&&o.enable(9),b.alphaTest&&o.enable(10),b.vertexColors&&o.enable(11),b.vertexAlphas&&o.enable(12),b.vertexUv1s&&o.enable(13),b.vertexUv2s&&o.enable(14),b.vertexUv3s&&o.enable(15),b.vertexTangents&&o.enable(16),b.anisotropy&&o.enable(17),b.alphaHash&&o.enable(18),b.batching&&o.enable(19),b.dispersion&&o.enable(20),b.batchingColor&&o.enable(21),T.push(o.mask),o.disableAll(),b.fog&&o.enable(0),b.useFog&&o.enable(1),b.flatShading&&o.enable(2),b.logarithmicDepthBuffer&&o.enable(3),b.reverseDepthBuffer&&o.enable(4),b.skinning&&o.enable(5),b.morphTargets&&o.enable(6),b.morphNormals&&o.enable(7),b.morphColors&&o.enable(8),b.premultipliedAlpha&&o.enable(9),b.shadowMapEnabled&&o.enable(10),b.doubleSided&&o.enable(11),b.flipSided&&o.enable(12),b.useDepthPacking&&o.enable(13),b.dithering&&o.enable(14),b.transmission&&o.enable(15),b.sheen&&o.enable(16),b.opaque&&o.enable(17),b.pointsUvs&&o.enable(18),b.decodeVideoTexture&&o.enable(19),b.decodeVideoTextureEmissive&&o.enable(20),b.alphaToCoverage&&o.enable(21),T.push(o.mask)}function M(T){const b=g[T.type];let I;if(b){const K=$n[b];I=Dm.clone(K.uniforms)}else I=T.uniforms;return I}function C(T,b){let I;for(let K=0,H=h.length;K<H;K++){const q=h[K];if(q.cacheKey===b){I=q,++I.usedTimes;break}}return I===void 0&&(I=new Xv(i,b,T,r),h.push(I)),I}function A(T){if(--T.usedTimes===0){const b=h.indexOf(T);h[b]=h[h.length-1],h.pop(),T.destroy()}}function w(T){l.remove(T)}function L(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:M,acquireProgram:C,releaseProgram:A,releaseShaderCache:w,programs:h,dispose:L}}function jv(){let i=new WeakMap;function t(a){return i.has(a)}function e(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function Zv(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.z!==t.z?i.z-t.z:i.id-t.id}function mu(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function gu(){const i=[];let t=0;const e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function a(u,f,d,g,v,m){let p=i[t];return p===void 0?(p={id:u.id,object:u,geometry:f,material:d,groupOrder:g,renderOrder:u.renderOrder,z:v,group:m},i[t]=p):(p.id=u.id,p.object=u,p.geometry=f,p.material=d,p.groupOrder=g,p.renderOrder=u.renderOrder,p.z=v,p.group=m),t++,p}function o(u,f,d,g,v,m){const p=a(u,f,d,g,v,m);d.transmission>0?n.push(p):d.transparent===!0?s.push(p):e.push(p)}function l(u,f,d,g,v,m){const p=a(u,f,d,g,v,m);d.transmission>0?n.unshift(p):d.transparent===!0?s.unshift(p):e.unshift(p)}function c(u,f){e.length>1&&e.sort(u||Zv),n.length>1&&n.sort(f||mu),s.length>1&&s.sort(f||mu)}function h(){for(let u=t,f=i.length;u<f;u++){const d=i[u];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:o,unshift:l,finish:h,sort:c}}function Jv(){let i=new WeakMap;function t(n,s){const r=i.get(n);let a;return r===void 0?(a=new gu,i.set(n,[a])):s>=r.length?(a=new gu,r.push(a)):a=r[s],a}function e(){i=new WeakMap}return{get:t,dispose:e}}function Qv(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new O,color:new le};break;case"SpotLight":e={position:new O,direction:new O,color:new le,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new O,color:new le,distance:0,decay:0};break;case"HemisphereLight":e={direction:new O,skyColor:new le,groundColor:new le};break;case"RectAreaLight":e={color:new le,position:new O,halfWidth:new O,halfHeight:new O};break}return i[t.id]=e,e}}}function tx(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Yt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Yt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Yt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}let ex=0;function nx(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function ix(i){const t=new Qv,e=tx(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new O);const s=new O,r=new be,a=new be;function o(c){let h=0,u=0,f=0;for(let T=0;T<9;T++)n.probe[T].set(0,0,0);let d=0,g=0,v=0,m=0,p=0,x=0,y=0,M=0,C=0,A=0,w=0;c.sort(nx);for(let T=0,b=c.length;T<b;T++){const I=c[T],K=I.color,H=I.intensity,q=I.distance,Z=I.shadow&&I.shadow.map?I.shadow.map.texture:null;if(I.isAmbientLight)h+=K.r*H,u+=K.g*H,f+=K.b*H;else if(I.isLightProbe){for(let $=0;$<9;$++)n.probe[$].addScaledVector(I.sh.coefficients[$],H);w++}else if(I.isDirectionalLight){const $=t.get(I);if($.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){const it=I.shadow,W=e.get(I);W.shadowIntensity=it.intensity,W.shadowBias=it.bias,W.shadowNormalBias=it.normalBias,W.shadowRadius=it.radius,W.shadowMapSize=it.mapSize,n.directionalShadow[d]=W,n.directionalShadowMap[d]=Z,n.directionalShadowMatrix[d]=I.shadow.matrix,x++}n.directional[d]=$,d++}else if(I.isSpotLight){const $=t.get(I);$.position.setFromMatrixPosition(I.matrixWorld),$.color.copy(K).multiplyScalar(H),$.distance=q,$.coneCos=Math.cos(I.angle),$.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),$.decay=I.decay,n.spot[v]=$;const it=I.shadow;if(I.map&&(n.spotLightMap[C]=I.map,C++,it.updateMatrices(I),I.castShadow&&A++),n.spotLightMatrix[v]=it.matrix,I.castShadow){const W=e.get(I);W.shadowIntensity=it.intensity,W.shadowBias=it.bias,W.shadowNormalBias=it.normalBias,W.shadowRadius=it.radius,W.shadowMapSize=it.mapSize,n.spotShadow[v]=W,n.spotShadowMap[v]=Z,M++}v++}else if(I.isRectAreaLight){const $=t.get(I);$.color.copy(K).multiplyScalar(H),$.halfWidth.set(I.width*.5,0,0),$.halfHeight.set(0,I.height*.5,0),n.rectArea[m]=$,m++}else if(I.isPointLight){const $=t.get(I);if($.color.copy(I.color).multiplyScalar(I.intensity),$.distance=I.distance,$.decay=I.decay,I.castShadow){const it=I.shadow,W=e.get(I);W.shadowIntensity=it.intensity,W.shadowBias=it.bias,W.shadowNormalBias=it.normalBias,W.shadowRadius=it.radius,W.shadowMapSize=it.mapSize,W.shadowCameraNear=it.camera.near,W.shadowCameraFar=it.camera.far,n.pointShadow[g]=W,n.pointShadowMap[g]=Z,n.pointShadowMatrix[g]=I.shadow.matrix,y++}n.point[g]=$,g++}else if(I.isHemisphereLight){const $=t.get(I);$.skyColor.copy(I.color).multiplyScalar(H),$.groundColor.copy(I.groundColor).multiplyScalar(H),n.hemi[p]=$,p++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=lt.LTC_FLOAT_1,n.rectAreaLTC2=lt.LTC_FLOAT_2):(n.rectAreaLTC1=lt.LTC_HALF_1,n.rectAreaLTC2=lt.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=f;const L=n.hash;(L.directionalLength!==d||L.pointLength!==g||L.spotLength!==v||L.rectAreaLength!==m||L.hemiLength!==p||L.numDirectionalShadows!==x||L.numPointShadows!==y||L.numSpotShadows!==M||L.numSpotMaps!==C||L.numLightProbes!==w)&&(n.directional.length=d,n.spot.length=v,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=x,n.directionalShadowMap.length=x,n.pointShadow.length=y,n.pointShadowMap.length=y,n.spotShadow.length=M,n.spotShadowMap.length=M,n.directionalShadowMatrix.length=x,n.pointShadowMatrix.length=y,n.spotLightMatrix.length=M+C-A,n.spotLightMap.length=C,n.numSpotLightShadowsWithMaps=A,n.numLightProbes=w,L.directionalLength=d,L.pointLength=g,L.spotLength=v,L.rectAreaLength=m,L.hemiLength=p,L.numDirectionalShadows=x,L.numPointShadows=y,L.numSpotShadows=M,L.numSpotMaps=C,L.numLightProbes=w,n.version=ex++)}function l(c,h){let u=0,f=0,d=0,g=0,v=0;const m=h.matrixWorldInverse;for(let p=0,x=c.length;p<x;p++){const y=c[p];if(y.isDirectionalLight){const M=n.directional[u];M.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(m),u++}else if(y.isSpotLight){const M=n.spot[d];M.position.setFromMatrixPosition(y.matrixWorld),M.position.applyMatrix4(m),M.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(m),d++}else if(y.isRectAreaLight){const M=n.rectArea[g];M.position.setFromMatrixPosition(y.matrixWorld),M.position.applyMatrix4(m),a.identity(),r.copy(y.matrixWorld),r.premultiply(m),a.extractRotation(r),M.halfWidth.set(y.width*.5,0,0),M.halfHeight.set(0,y.height*.5,0),M.halfWidth.applyMatrix4(a),M.halfHeight.applyMatrix4(a),g++}else if(y.isPointLight){const M=n.point[f];M.position.setFromMatrixPosition(y.matrixWorld),M.position.applyMatrix4(m),f++}else if(y.isHemisphereLight){const M=n.hemi[v];M.direction.setFromMatrixPosition(y.matrixWorld),M.direction.transformDirection(m),v++}}}return{setup:o,setupView:l,state:n}}function _u(i){const t=new ix(i),e=[],n=[];function s(h){c.camera=h,e.length=0,n.length=0}function r(h){e.push(h)}function a(h){n.push(h)}function o(){t.setup(e)}function l(h){t.setupView(e,h)}const c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function sx(i){let t=new WeakMap;function e(s,r=0){const a=t.get(s);let o;return a===void 0?(o=new _u(i),t.set(s,[o])):r>=a.length?(o=new _u(i),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}class rx extends Ss{static get type(){return"MeshDepthMaterial"}constructor(t){super(),this.isMeshDepthMaterial=!0,this.depthPacking=Qp,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class ax extends Ss{static get type(){return"MeshDistanceMaterial"}constructor(t){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const ox=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,lx=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function cx(i,t,e){let n=new Zf;const s=new Yt,r=new Yt,a=new De,o=new rx({depthPacking:tm}),l=new ax,c={},h=e.maxTextureSize,u={[pi]:tn,[tn]:pi,[bn]:bn},f=new Gn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Yt},radius:{value:4}},vertexShader:ox,fragmentShader:lx}),d=f.clone();d.defines.HORIZONTAL_PASS=1;const g=new Oe;g.setAttribute("position",new Ne(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new Ce(g,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=wf;let p=this.type;this.render=function(A,w,L){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||A.length===0)return;const T=i.getRenderTarget(),b=i.getActiveCubeFace(),I=i.getActiveMipmapLevel(),K=i.state;K.setBlending(Bi),K.buffers.color.setClear(1,1,1,1),K.buffers.depth.setTest(!0),K.setScissorTest(!1);const H=p!==ai&&this.type===ai,q=p===ai&&this.type!==ai;for(let Z=0,$=A.length;Z<$;Z++){const it=A[Z],W=it.shadow;if(W===void 0){console.warn("THREE.WebGLShadowMap:",it,"has no shadow.");continue}if(W.autoUpdate===!1&&W.needsUpdate===!1)continue;s.copy(W.mapSize);const ct=W.getFrameExtents();if(s.multiply(ct),r.copy(W.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/ct.x),s.x=r.x*ct.x,W.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/ct.y),s.y=r.y*ct.y,W.mapSize.y=r.y)),W.map===null||H===!0||q===!0){const Ct=this.type!==ai?{minFilter:en,magFilter:en}:{};W.map!==null&&W.map.dispose(),W.map=new _s(s.x,s.y,Ct),W.map.texture.name=it.name+".shadowMap",W.camera.updateProjectionMatrix()}i.setRenderTarget(W.map),i.clear();const _t=W.getViewportCount();for(let Ct=0;Ct<_t;Ct++){const Wt=W.getViewport(Ct);a.set(r.x*Wt.x,r.y*Wt.y,r.x*Wt.z,r.y*Wt.w),K.viewport(a),W.updateMatrices(it,Ct),n=W.getFrustum(),M(w,L,W.camera,it,this.type)}W.isPointLightShadow!==!0&&this.type===ai&&x(W,L),W.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(T,b,I)};function x(A,w){const L=t.update(v);f.defines.VSM_SAMPLES!==A.blurSamples&&(f.defines.VSM_SAMPLES=A.blurSamples,d.defines.VSM_SAMPLES=A.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new _s(s.x,s.y)),f.uniforms.shadow_pass.value=A.map.texture,f.uniforms.resolution.value=A.mapSize,f.uniforms.radius.value=A.radius,i.setRenderTarget(A.mapPass),i.clear(),i.renderBufferDirect(w,null,L,f,v,null),d.uniforms.shadow_pass.value=A.mapPass.texture,d.uniforms.resolution.value=A.mapSize,d.uniforms.radius.value=A.radius,i.setRenderTarget(A.map),i.clear(),i.renderBufferDirect(w,null,L,d,v,null)}function y(A,w,L,T){let b=null;const I=L.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(I!==void 0)b=I;else if(b=L.isPointLight===!0?l:o,i.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0){const K=b.uuid,H=w.uuid;let q=c[K];q===void 0&&(q={},c[K]=q);let Z=q[H];Z===void 0&&(Z=b.clone(),q[H]=Z,w.addEventListener("dispose",C)),b=Z}if(b.visible=w.visible,b.wireframe=w.wireframe,T===ai?b.side=w.shadowSide!==null?w.shadowSide:w.side:b.side=w.shadowSide!==null?w.shadowSide:u[w.side],b.alphaMap=w.alphaMap,b.alphaTest=w.alphaTest,b.map=w.map,b.clipShadows=w.clipShadows,b.clippingPlanes=w.clippingPlanes,b.clipIntersection=w.clipIntersection,b.displacementMap=w.displacementMap,b.displacementScale=w.displacementScale,b.displacementBias=w.displacementBias,b.wireframeLinewidth=w.wireframeLinewidth,b.linewidth=w.linewidth,L.isPointLight===!0&&b.isMeshDistanceMaterial===!0){const K=i.properties.get(b);K.light=L}return b}function M(A,w,L,T,b){if(A.visible===!1)return;if(A.layers.test(w.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&b===ai)&&(!A.frustumCulled||n.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(L.matrixWorldInverse,A.matrixWorld);const H=t.update(A),q=A.material;if(Array.isArray(q)){const Z=H.groups;for(let $=0,it=Z.length;$<it;$++){const W=Z[$],ct=q[W.materialIndex];if(ct&&ct.visible){const _t=y(A,ct,T,b);A.onBeforeShadow(i,A,w,L,H,_t,W),i.renderBufferDirect(L,null,H,_t,A,W),A.onAfterShadow(i,A,w,L,H,_t,W)}}}else if(q.visible){const Z=y(A,q,T,b);A.onBeforeShadow(i,A,w,L,H,Z,null),i.renderBufferDirect(L,null,H,Z,A,null),A.onAfterShadow(i,A,w,L,H,Z,null)}}const K=A.children;for(let H=0,q=K.length;H<q;H++)M(K[H],w,L,T,b)}function C(A){A.target.removeEventListener("dispose",C);for(const L in c){const T=c[L],b=A.target.uuid;b in T&&(T[b].dispose(),delete T[b])}}}const hx={[Xl]:$l,[ql]:jl,[Kl]:Zl,[nr]:Yl,[$l]:Xl,[jl]:ql,[Zl]:Kl,[Yl]:nr};function ux(i,t){function e(){let N=!1;const ut=new De;let X=null;const Q=new De(0,0,0,0);return{setMask:function(mt){X!==mt&&!N&&(i.colorMask(mt,mt,mt,mt),X=mt)},setLocked:function(mt){N=mt},setClear:function(mt,dt,Ht,we,He){He===!0&&(mt*=we,dt*=we,Ht*=we),ut.set(mt,dt,Ht,we),Q.equals(ut)===!1&&(i.clearColor(mt,dt,Ht,we),Q.copy(ut))},reset:function(){N=!1,X=null,Q.set(-1,0,0,0)}}}function n(){let N=!1,ut=!1,X=null,Q=null,mt=null;return{setReversed:function(dt){if(ut!==dt){const Ht=t.get("EXT_clip_control");ut?Ht.clipControlEXT(Ht.LOWER_LEFT_EXT,Ht.ZERO_TO_ONE_EXT):Ht.clipControlEXT(Ht.LOWER_LEFT_EXT,Ht.NEGATIVE_ONE_TO_ONE_EXT);const we=mt;mt=null,this.setClear(we)}ut=dt},getReversed:function(){return ut},setTest:function(dt){dt?ot(i.DEPTH_TEST):It(i.DEPTH_TEST)},setMask:function(dt){X!==dt&&!N&&(i.depthMask(dt),X=dt)},setFunc:function(dt){if(ut&&(dt=hx[dt]),Q!==dt){switch(dt){case Xl:i.depthFunc(i.NEVER);break;case $l:i.depthFunc(i.ALWAYS);break;case ql:i.depthFunc(i.LESS);break;case nr:i.depthFunc(i.LEQUAL);break;case Kl:i.depthFunc(i.EQUAL);break;case Yl:i.depthFunc(i.GEQUAL);break;case jl:i.depthFunc(i.GREATER);break;case Zl:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}Q=dt}},setLocked:function(dt){N=dt},setClear:function(dt){mt!==dt&&(ut&&(dt=1-dt),i.clearDepth(dt),mt=dt)},reset:function(){N=!1,X=null,Q=null,mt=null,ut=!1}}}function s(){let N=!1,ut=null,X=null,Q=null,mt=null,dt=null,Ht=null,we=null,He=null;return{setTest:function(fe){N||(fe?ot(i.STENCIL_TEST):It(i.STENCIL_TEST))},setMask:function(fe){ut!==fe&&!N&&(i.stencilMask(fe),ut=fe)},setFunc:function(fe,Pn,Zn){(X!==fe||Q!==Pn||mt!==Zn)&&(i.stencilFunc(fe,Pn,Zn),X=fe,Q=Pn,mt=Zn)},setOp:function(fe,Pn,Zn){(dt!==fe||Ht!==Pn||we!==Zn)&&(i.stencilOp(fe,Pn,Zn),dt=fe,Ht=Pn,we=Zn)},setLocked:function(fe){N=fe},setClear:function(fe){He!==fe&&(i.clearStencil(fe),He=fe)},reset:function(){N=!1,ut=null,X=null,Q=null,mt=null,dt=null,Ht=null,we=null,He=null}}}const r=new e,a=new n,o=new s,l=new WeakMap,c=new WeakMap;let h={},u={},f=new WeakMap,d=[],g=null,v=!1,m=null,p=null,x=null,y=null,M=null,C=null,A=null,w=new le(0,0,0),L=0,T=!1,b=null,I=null,K=null,H=null,q=null;const Z=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let $=!1,it=0;const W=i.getParameter(i.VERSION);W.indexOf("WebGL")!==-1?(it=parseFloat(/^WebGL (\d)/.exec(W)[1]),$=it>=1):W.indexOf("OpenGL ES")!==-1&&(it=parseFloat(/^OpenGL ES (\d)/.exec(W)[1]),$=it>=2);let ct=null,_t={};const Ct=i.getParameter(i.SCISSOR_BOX),Wt=i.getParameter(i.VIEWPORT),ce=new De().fromArray(Ct),Y=new De().fromArray(Wt);function st(N,ut,X,Q){const mt=new Uint8Array(4),dt=i.createTexture();i.bindTexture(N,dt),i.texParameteri(N,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(N,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ht=0;Ht<X;Ht++)N===i.TEXTURE_3D||N===i.TEXTURE_2D_ARRAY?i.texImage3D(ut,0,i.RGBA,1,1,Q,0,i.RGBA,i.UNSIGNED_BYTE,mt):i.texImage2D(ut+Ht,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,mt);return dt}const Tt={};Tt[i.TEXTURE_2D]=st(i.TEXTURE_2D,i.TEXTURE_2D,1),Tt[i.TEXTURE_CUBE_MAP]=st(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Tt[i.TEXTURE_2D_ARRAY]=st(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Tt[i.TEXTURE_3D]=st(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ot(i.DEPTH_TEST),a.setFunc(nr),Zt(!1),Jt(Sh),ot(i.CULL_FACE),z(Bi);function ot(N){h[N]!==!0&&(i.enable(N),h[N]=!0)}function It(N){h[N]!==!1&&(i.disable(N),h[N]=!1)}function kt(N,ut){return u[N]!==ut?(i.bindFramebuffer(N,ut),u[N]=ut,N===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=ut),N===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=ut),!0):!1}function Xt(N,ut){let X=d,Q=!1;if(N){X=f.get(ut),X===void 0&&(X=[],f.set(ut,X));const mt=N.textures;if(X.length!==mt.length||X[0]!==i.COLOR_ATTACHMENT0){for(let dt=0,Ht=mt.length;dt<Ht;dt++)X[dt]=i.COLOR_ATTACHMENT0+dt;X.length=mt.length,Q=!0}}else X[0]!==i.BACK&&(X[0]=i.BACK,Q=!0);Q&&i.drawBuffers(X)}function Se(N){return g!==N?(i.useProgram(N),g=N,!0):!1}const ne={[hs]:i.FUNC_ADD,[Ap]:i.FUNC_SUBTRACT,[wp]:i.FUNC_REVERSE_SUBTRACT};ne[Rp]=i.MIN,ne[Cp]=i.MAX;const Le={[Lp]:i.ZERO,[Dp]:i.ONE,[Pp]:i.SRC_COLOR,[Vl]:i.SRC_ALPHA,[zp]:i.SRC_ALPHA_SATURATE,[Up]:i.DST_COLOR,[Np]:i.DST_ALPHA,[Ip]:i.ONE_MINUS_SRC_COLOR,[Wl]:i.ONE_MINUS_SRC_ALPHA,[kp]:i.ONE_MINUS_DST_COLOR,[Op]:i.ONE_MINUS_DST_ALPHA,[Fp]:i.CONSTANT_COLOR,[Bp]:i.ONE_MINUS_CONSTANT_COLOR,[Hp]:i.CONSTANT_ALPHA,[Gp]:i.ONE_MINUS_CONSTANT_ALPHA};function z(N,ut,X,Q,mt,dt,Ht,we,He,fe){if(N===Bi){v===!0&&(It(i.BLEND),v=!1);return}if(v===!1&&(ot(i.BLEND),v=!0),N!==Tp){if(N!==m||fe!==T){if((p!==hs||M!==hs)&&(i.blendEquation(i.FUNC_ADD),p=hs,M=hs),fe)switch(N){case Js:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Eh:i.blendFunc(i.ONE,i.ONE);break;case bh:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Th:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",N);break}else switch(N){case Js:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Eh:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case bh:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Th:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",N);break}x=null,y=null,C=null,A=null,w.set(0,0,0),L=0,m=N,T=fe}return}mt=mt||ut,dt=dt||X,Ht=Ht||Q,(ut!==p||mt!==M)&&(i.blendEquationSeparate(ne[ut],ne[mt]),p=ut,M=mt),(X!==x||Q!==y||dt!==C||Ht!==A)&&(i.blendFuncSeparate(Le[X],Le[Q],Le[dt],Le[Ht]),x=X,y=Q,C=dt,A=Ht),(we.equals(w)===!1||He!==L)&&(i.blendColor(we.r,we.g,we.b,He),w.copy(we),L=He),m=N,T=!1}function vn(N,ut){N.side===bn?It(i.CULL_FACE):ot(i.CULL_FACE);let X=N.side===tn;ut&&(X=!X),Zt(X),N.blending===Js&&N.transparent===!1?z(Bi):z(N.blending,N.blendEquation,N.blendSrc,N.blendDst,N.blendEquationAlpha,N.blendSrcAlpha,N.blendDstAlpha,N.blendColor,N.blendAlpha,N.premultipliedAlpha),a.setFunc(N.depthFunc),a.setTest(N.depthTest),a.setMask(N.depthWrite),r.setMask(N.colorWrite);const Q=N.stencilWrite;o.setTest(Q),Q&&(o.setMask(N.stencilWriteMask),o.setFunc(N.stencilFunc,N.stencilRef,N.stencilFuncMask),o.setOp(N.stencilFail,N.stencilZFail,N.stencilZPass)),xe(N.polygonOffset,N.polygonOffsetFactor,N.polygonOffsetUnits),N.alphaToCoverage===!0?ot(i.SAMPLE_ALPHA_TO_COVERAGE):It(i.SAMPLE_ALPHA_TO_COVERAGE)}function Zt(N){b!==N&&(N?i.frontFace(i.CW):i.frontFace(i.CCW),b=N)}function Jt(N){N!==Sp?(ot(i.CULL_FACE),N!==I&&(N===Sh?i.cullFace(i.BACK):N===Ep?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):It(i.CULL_FACE),I=N}function Ot(N){N!==K&&($&&i.lineWidth(N),K=N)}function xe(N,ut,X){N?(ot(i.POLYGON_OFFSET_FILL),(H!==ut||q!==X)&&(i.polygonOffset(ut,X),H=ut,q=X)):It(i.POLYGON_OFFSET_FILL)}function Nt(N){N?ot(i.SCISSOR_TEST):It(i.SCISSOR_TEST)}function R(N){N===void 0&&(N=i.TEXTURE0+Z-1),ct!==N&&(i.activeTexture(N),ct=N)}function S(N,ut,X){X===void 0&&(ct===null?X=i.TEXTURE0+Z-1:X=ct);let Q=_t[X];Q===void 0&&(Q={type:void 0,texture:void 0},_t[X]=Q),(Q.type!==N||Q.texture!==ut)&&(ct!==X&&(i.activeTexture(X),ct=X),i.bindTexture(N,ut||Tt[N]),Q.type=N,Q.texture=ut)}function B(){const N=_t[ct];N!==void 0&&N.type!==void 0&&(i.bindTexture(N.type,null),N.type=void 0,N.texture=void 0)}function J(){try{i.compressedTexImage2D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function nt(){try{i.compressedTexImage3D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function j(){try{i.texSubImage2D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Lt(){try{i.texSubImage3D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function ft(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function St(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function ie(){try{i.texStorage2D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function rt(){try{i.texStorage3D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Et(){try{i.texImage2D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Ut(){try{i.texImage3D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function zt(N){ce.equals(N)===!1&&(i.scissor(N.x,N.y,N.z,N.w),ce.copy(N))}function bt(N){Y.equals(N)===!1&&(i.viewport(N.x,N.y,N.z,N.w),Y.copy(N))}function Qt(N,ut){let X=c.get(ut);X===void 0&&(X=new WeakMap,c.set(ut,X));let Q=X.get(N);Q===void 0&&(Q=i.getUniformBlockIndex(ut,N.name),X.set(N,Q))}function $t(N,ut){const Q=c.get(ut).get(N);l.get(ut)!==Q&&(i.uniformBlockBinding(ut,Q,N.__bindingPointIndex),l.set(ut,Q))}function _e(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),h={},ct=null,_t={},u={},f=new WeakMap,d=[],g=null,v=!1,m=null,p=null,x=null,y=null,M=null,C=null,A=null,w=new le(0,0,0),L=0,T=!1,b=null,I=null,K=null,H=null,q=null,ce.set(0,0,i.canvas.width,i.canvas.height),Y.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:ot,disable:It,bindFramebuffer:kt,drawBuffers:Xt,useProgram:Se,setBlending:z,setMaterial:vn,setFlipSided:Zt,setCullFace:Jt,setLineWidth:Ot,setPolygonOffset:xe,setScissorTest:Nt,activeTexture:R,bindTexture:S,unbindTexture:B,compressedTexImage2D:J,compressedTexImage3D:nt,texImage2D:Et,texImage3D:Ut,updateUBOMapping:Qt,uniformBlockBinding:$t,texStorage2D:ie,texStorage3D:rt,texSubImage2D:j,texSubImage3D:Lt,compressedTexSubImage2D:ft,compressedTexSubImage3D:St,scissor:zt,viewport:bt,reset:_e}}function vu(i,t,e,n){const s=fx(n);switch(e){case If:return i*t;case Of:return i*t;case Uf:return i*t*2;case kf:return i*t/s.components*s.byteLength;case Yc:return i*t/s.components*s.byteLength;case zf:return i*t*2/s.components*s.byteLength;case jc:return i*t*2/s.components*s.byteLength;case Nf:return i*t*3/s.components*s.byteLength;case wn:return i*t*4/s.components*s.byteLength;case Zc:return i*t*4/s.components*s.byteLength;case eo:case no:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case io:case so:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case nc:case sc:return Math.max(i,16)*Math.max(t,8)/4;case ec:case ic:return Math.max(i,8)*Math.max(t,8)/2;case rc:case ac:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case oc:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case lc:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case cc:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case hc:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case uc:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case fc:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case dc:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case pc:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case mc:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case gc:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case _c:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case vc:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case xc:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case Mc:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case yc:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case ro:case Sc:case Ec:return Math.ceil(i/4)*Math.ceil(t/4)*16;case Ff:case bc:return Math.ceil(i/4)*Math.ceil(t/4)*8;case Tc:case Ac:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function fx(i){switch(i){case mi:case Lf:return{byteLength:1,components:1};case Jr:case Df:case la:return{byteLength:2,components:1};case qc:case Kc:return{byteLength:2,components:4};case gs:case $c:case oi:return{byteLength:4,components:1};case Pf:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function dx(i,t,e,n,s,r,a){const o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Yt,h=new WeakMap;let u;const f=new WeakMap;let d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(R,S){return d?new OffscreenCanvas(R,S):vo("canvas")}function v(R,S,B){let J=1;const nt=Nt(R);if((nt.width>B||nt.height>B)&&(J=B/Math.max(nt.width,nt.height)),J<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){const j=Math.floor(J*nt.width),Lt=Math.floor(J*nt.height);u===void 0&&(u=g(j,Lt));const ft=S?g(j,Lt):u;return ft.width=j,ft.height=Lt,ft.getContext("2d").drawImage(R,0,0,j,Lt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+nt.width+"x"+nt.height+") to ("+j+"x"+Lt+")."),ft}else return"data"in R&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+nt.width+"x"+nt.height+")."),R;return R}function m(R){return R.generateMipmaps}function p(R){i.generateMipmap(R)}function x(R){return R.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?i.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function y(R,S,B,J,nt=!1){if(R!==null){if(i[R]!==void 0)return i[R];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let j=S;if(S===i.RED&&(B===i.FLOAT&&(j=i.R32F),B===i.HALF_FLOAT&&(j=i.R16F),B===i.UNSIGNED_BYTE&&(j=i.R8)),S===i.RED_INTEGER&&(B===i.UNSIGNED_BYTE&&(j=i.R8UI),B===i.UNSIGNED_SHORT&&(j=i.R16UI),B===i.UNSIGNED_INT&&(j=i.R32UI),B===i.BYTE&&(j=i.R8I),B===i.SHORT&&(j=i.R16I),B===i.INT&&(j=i.R32I)),S===i.RG&&(B===i.FLOAT&&(j=i.RG32F),B===i.HALF_FLOAT&&(j=i.RG16F),B===i.UNSIGNED_BYTE&&(j=i.RG8)),S===i.RG_INTEGER&&(B===i.UNSIGNED_BYTE&&(j=i.RG8UI),B===i.UNSIGNED_SHORT&&(j=i.RG16UI),B===i.UNSIGNED_INT&&(j=i.RG32UI),B===i.BYTE&&(j=i.RG8I),B===i.SHORT&&(j=i.RG16I),B===i.INT&&(j=i.RG32I)),S===i.RGB_INTEGER&&(B===i.UNSIGNED_BYTE&&(j=i.RGB8UI),B===i.UNSIGNED_SHORT&&(j=i.RGB16UI),B===i.UNSIGNED_INT&&(j=i.RGB32UI),B===i.BYTE&&(j=i.RGB8I),B===i.SHORT&&(j=i.RGB16I),B===i.INT&&(j=i.RGB32I)),S===i.RGBA_INTEGER&&(B===i.UNSIGNED_BYTE&&(j=i.RGBA8UI),B===i.UNSIGNED_SHORT&&(j=i.RGBA16UI),B===i.UNSIGNED_INT&&(j=i.RGBA32UI),B===i.BYTE&&(j=i.RGBA8I),B===i.SHORT&&(j=i.RGBA16I),B===i.INT&&(j=i.RGBA32I)),S===i.RGB&&B===i.UNSIGNED_INT_5_9_9_9_REV&&(j=i.RGB9_E5),S===i.RGBA){const Lt=nt?Po:re.getTransfer(J);B===i.FLOAT&&(j=i.RGBA32F),B===i.HALF_FLOAT&&(j=i.RGBA16F),B===i.UNSIGNED_BYTE&&(j=Lt===de?i.SRGB8_ALPHA8:i.RGBA8),B===i.UNSIGNED_SHORT_4_4_4_4&&(j=i.RGBA4),B===i.UNSIGNED_SHORT_5_5_5_1&&(j=i.RGB5_A1)}return(j===i.R16F||j===i.R32F||j===i.RG16F||j===i.RG32F||j===i.RGBA16F||j===i.RGBA32F)&&t.get("EXT_color_buffer_float"),j}function M(R,S){let B;return R?S===null||S===gs||S===rr?B=i.DEPTH24_STENCIL8:S===oi?B=i.DEPTH32F_STENCIL8:S===Jr&&(B=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===gs||S===rr?B=i.DEPTH_COMPONENT24:S===oi?B=i.DEPTH_COMPONENT32F:S===Jr&&(B=i.DEPTH_COMPONENT16),B}function C(R,S){return m(R)===!0||R.isFramebufferTexture&&R.minFilter!==en&&R.minFilter!==_n?Math.log2(Math.max(S.width,S.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?S.mipmaps.length:1}function A(R){const S=R.target;S.removeEventListener("dispose",A),L(S),S.isVideoTexture&&h.delete(S)}function w(R){const S=R.target;S.removeEventListener("dispose",w),b(S)}function L(R){const S=n.get(R);if(S.__webglInit===void 0)return;const B=R.source,J=f.get(B);if(J){const nt=J[S.__cacheKey];nt.usedTimes--,nt.usedTimes===0&&T(R),Object.keys(J).length===0&&f.delete(B)}n.remove(R)}function T(R){const S=n.get(R);i.deleteTexture(S.__webglTexture);const B=R.source,J=f.get(B);delete J[S.__cacheKey],a.memory.textures--}function b(R){const S=n.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),n.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let J=0;J<6;J++){if(Array.isArray(S.__webglFramebuffer[J]))for(let nt=0;nt<S.__webglFramebuffer[J].length;nt++)i.deleteFramebuffer(S.__webglFramebuffer[J][nt]);else i.deleteFramebuffer(S.__webglFramebuffer[J]);S.__webglDepthbuffer&&i.deleteRenderbuffer(S.__webglDepthbuffer[J])}else{if(Array.isArray(S.__webglFramebuffer))for(let J=0;J<S.__webglFramebuffer.length;J++)i.deleteFramebuffer(S.__webglFramebuffer[J]);else i.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&i.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&i.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let J=0;J<S.__webglColorRenderbuffer.length;J++)S.__webglColorRenderbuffer[J]&&i.deleteRenderbuffer(S.__webglColorRenderbuffer[J]);S.__webglDepthRenderbuffer&&i.deleteRenderbuffer(S.__webglDepthRenderbuffer)}const B=R.textures;for(let J=0,nt=B.length;J<nt;J++){const j=n.get(B[J]);j.__webglTexture&&(i.deleteTexture(j.__webglTexture),a.memory.textures--),n.remove(B[J])}n.remove(R)}let I=0;function K(){I=0}function H(){const R=I;return R>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+s.maxTextures),I+=1,R}function q(R){const S=[];return S.push(R.wrapS),S.push(R.wrapT),S.push(R.wrapR||0),S.push(R.magFilter),S.push(R.minFilter),S.push(R.anisotropy),S.push(R.internalFormat),S.push(R.format),S.push(R.type),S.push(R.generateMipmaps),S.push(R.premultiplyAlpha),S.push(R.flipY),S.push(R.unpackAlignment),S.push(R.colorSpace),S.join()}function Z(R,S){const B=n.get(R);if(R.isVideoTexture&&Ot(R),R.isRenderTargetTexture===!1&&R.version>0&&B.__version!==R.version){const J=R.image;if(J===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(J.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Y(B,R,S);return}}e.bindTexture(i.TEXTURE_2D,B.__webglTexture,i.TEXTURE0+S)}function $(R,S){const B=n.get(R);if(R.version>0&&B.__version!==R.version){Y(B,R,S);return}e.bindTexture(i.TEXTURE_2D_ARRAY,B.__webglTexture,i.TEXTURE0+S)}function it(R,S){const B=n.get(R);if(R.version>0&&B.__version!==R.version){Y(B,R,S);return}e.bindTexture(i.TEXTURE_3D,B.__webglTexture,i.TEXTURE0+S)}function W(R,S){const B=n.get(R);if(R.version>0&&B.__version!==R.version){st(B,R,S);return}e.bindTexture(i.TEXTURE_CUBE_MAP,B.__webglTexture,i.TEXTURE0+S)}const ct={[go]:i.REPEAT,[fs]:i.CLAMP_TO_EDGE,[tc]:i.MIRRORED_REPEAT},_t={[en]:i.NEAREST,[Jp]:i.NEAREST_MIPMAP_NEAREST,[xa]:i.NEAREST_MIPMAP_LINEAR,[_n]:i.LINEAR,[Yo]:i.LINEAR_MIPMAP_NEAREST,[Yn]:i.LINEAR_MIPMAP_LINEAR},Ct={[im]:i.NEVER,[cm]:i.ALWAYS,[sm]:i.LESS,[Bf]:i.LEQUAL,[rm]:i.EQUAL,[lm]:i.GEQUAL,[am]:i.GREATER,[om]:i.NOTEQUAL};function Wt(R,S){if(S.type===oi&&t.has("OES_texture_float_linear")===!1&&(S.magFilter===_n||S.magFilter===Yo||S.magFilter===xa||S.magFilter===Yn||S.minFilter===_n||S.minFilter===Yo||S.minFilter===xa||S.minFilter===Yn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(R,i.TEXTURE_WRAP_S,ct[S.wrapS]),i.texParameteri(R,i.TEXTURE_WRAP_T,ct[S.wrapT]),(R===i.TEXTURE_3D||R===i.TEXTURE_2D_ARRAY)&&i.texParameteri(R,i.TEXTURE_WRAP_R,ct[S.wrapR]),i.texParameteri(R,i.TEXTURE_MAG_FILTER,_t[S.magFilter]),i.texParameteri(R,i.TEXTURE_MIN_FILTER,_t[S.minFilter]),S.compareFunction&&(i.texParameteri(R,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(R,i.TEXTURE_COMPARE_FUNC,Ct[S.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===en||S.minFilter!==xa&&S.minFilter!==Yn||S.type===oi&&t.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||n.get(S).__currentAnisotropy){const B=t.get("EXT_texture_filter_anisotropic");i.texParameterf(R,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,s.getMaxAnisotropy())),n.get(S).__currentAnisotropy=S.anisotropy}}}function ce(R,S){let B=!1;R.__webglInit===void 0&&(R.__webglInit=!0,S.addEventListener("dispose",A));const J=S.source;let nt=f.get(J);nt===void 0&&(nt={},f.set(J,nt));const j=q(S);if(j!==R.__cacheKey){nt[j]===void 0&&(nt[j]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,B=!0),nt[j].usedTimes++;const Lt=nt[R.__cacheKey];Lt!==void 0&&(nt[R.__cacheKey].usedTimes--,Lt.usedTimes===0&&T(S)),R.__cacheKey=j,R.__webglTexture=nt[j].texture}return B}function Y(R,S,B){let J=i.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(J=i.TEXTURE_2D_ARRAY),S.isData3DTexture&&(J=i.TEXTURE_3D);const nt=ce(R,S),j=S.source;e.bindTexture(J,R.__webglTexture,i.TEXTURE0+B);const Lt=n.get(j);if(j.version!==Lt.__version||nt===!0){e.activeTexture(i.TEXTURE0+B);const ft=re.getPrimaries(re.workingColorSpace),St=S.colorSpace===Ni?null:re.getPrimaries(S.colorSpace),ie=S.colorSpace===Ni||ft===St?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,S.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,S.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ie);let rt=v(S.image,!1,s.maxTextureSize);rt=xe(S,rt);const Et=r.convert(S.format,S.colorSpace),Ut=r.convert(S.type);let zt=y(S.internalFormat,Et,Ut,S.colorSpace,S.isVideoTexture);Wt(J,S);let bt;const Qt=S.mipmaps,$t=S.isVideoTexture!==!0,_e=Lt.__version===void 0||nt===!0,N=j.dataReady,ut=C(S,rt);if(S.isDepthTexture)zt=M(S.format===ar,S.type),_e&&($t?e.texStorage2D(i.TEXTURE_2D,1,zt,rt.width,rt.height):e.texImage2D(i.TEXTURE_2D,0,zt,rt.width,rt.height,0,Et,Ut,null));else if(S.isDataTexture)if(Qt.length>0){$t&&_e&&e.texStorage2D(i.TEXTURE_2D,ut,zt,Qt[0].width,Qt[0].height);for(let X=0,Q=Qt.length;X<Q;X++)bt=Qt[X],$t?N&&e.texSubImage2D(i.TEXTURE_2D,X,0,0,bt.width,bt.height,Et,Ut,bt.data):e.texImage2D(i.TEXTURE_2D,X,zt,bt.width,bt.height,0,Et,Ut,bt.data);S.generateMipmaps=!1}else $t?(_e&&e.texStorage2D(i.TEXTURE_2D,ut,zt,rt.width,rt.height),N&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,rt.width,rt.height,Et,Ut,rt.data)):e.texImage2D(i.TEXTURE_2D,0,zt,rt.width,rt.height,0,Et,Ut,rt.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){$t&&_e&&e.texStorage3D(i.TEXTURE_2D_ARRAY,ut,zt,Qt[0].width,Qt[0].height,rt.depth);for(let X=0,Q=Qt.length;X<Q;X++)if(bt=Qt[X],S.format!==wn)if(Et!==null)if($t){if(N)if(S.layerUpdates.size>0){const mt=vu(bt.width,bt.height,S.format,S.type);for(const dt of S.layerUpdates){const Ht=bt.data.subarray(dt*mt/bt.data.BYTES_PER_ELEMENT,(dt+1)*mt/bt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,X,0,0,dt,bt.width,bt.height,1,Et,Ht)}S.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,X,0,0,0,bt.width,bt.height,rt.depth,Et,bt.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,X,zt,bt.width,bt.height,rt.depth,0,bt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else $t?N&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,X,0,0,0,bt.width,bt.height,rt.depth,Et,Ut,bt.data):e.texImage3D(i.TEXTURE_2D_ARRAY,X,zt,bt.width,bt.height,rt.depth,0,Et,Ut,bt.data)}else{$t&&_e&&e.texStorage2D(i.TEXTURE_2D,ut,zt,Qt[0].width,Qt[0].height);for(let X=0,Q=Qt.length;X<Q;X++)bt=Qt[X],S.format!==wn?Et!==null?$t?N&&e.compressedTexSubImage2D(i.TEXTURE_2D,X,0,0,bt.width,bt.height,Et,bt.data):e.compressedTexImage2D(i.TEXTURE_2D,X,zt,bt.width,bt.height,0,bt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):$t?N&&e.texSubImage2D(i.TEXTURE_2D,X,0,0,bt.width,bt.height,Et,Ut,bt.data):e.texImage2D(i.TEXTURE_2D,X,zt,bt.width,bt.height,0,Et,Ut,bt.data)}else if(S.isDataArrayTexture)if($t){if(_e&&e.texStorage3D(i.TEXTURE_2D_ARRAY,ut,zt,rt.width,rt.height,rt.depth),N)if(S.layerUpdates.size>0){const X=vu(rt.width,rt.height,S.format,S.type);for(const Q of S.layerUpdates){const mt=rt.data.subarray(Q*X/rt.data.BYTES_PER_ELEMENT,(Q+1)*X/rt.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Q,rt.width,rt.height,1,Et,Ut,mt)}S.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,rt.width,rt.height,rt.depth,Et,Ut,rt.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,zt,rt.width,rt.height,rt.depth,0,Et,Ut,rt.data);else if(S.isData3DTexture)$t?(_e&&e.texStorage3D(i.TEXTURE_3D,ut,zt,rt.width,rt.height,rt.depth),N&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,rt.width,rt.height,rt.depth,Et,Ut,rt.data)):e.texImage3D(i.TEXTURE_3D,0,zt,rt.width,rt.height,rt.depth,0,Et,Ut,rt.data);else if(S.isFramebufferTexture){if(_e)if($t)e.texStorage2D(i.TEXTURE_2D,ut,zt,rt.width,rt.height);else{let X=rt.width,Q=rt.height;for(let mt=0;mt<ut;mt++)e.texImage2D(i.TEXTURE_2D,mt,zt,X,Q,0,Et,Ut,null),X>>=1,Q>>=1}}else if(Qt.length>0){if($t&&_e){const X=Nt(Qt[0]);e.texStorage2D(i.TEXTURE_2D,ut,zt,X.width,X.height)}for(let X=0,Q=Qt.length;X<Q;X++)bt=Qt[X],$t?N&&e.texSubImage2D(i.TEXTURE_2D,X,0,0,Et,Ut,bt):e.texImage2D(i.TEXTURE_2D,X,zt,Et,Ut,bt);S.generateMipmaps=!1}else if($t){if(_e){const X=Nt(rt);e.texStorage2D(i.TEXTURE_2D,ut,zt,X.width,X.height)}N&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,Et,Ut,rt)}else e.texImage2D(i.TEXTURE_2D,0,zt,Et,Ut,rt);m(S)&&p(J),Lt.__version=j.version,S.onUpdate&&S.onUpdate(S)}R.__version=S.version}function st(R,S,B){if(S.image.length!==6)return;const J=ce(R,S),nt=S.source;e.bindTexture(i.TEXTURE_CUBE_MAP,R.__webglTexture,i.TEXTURE0+B);const j=n.get(nt);if(nt.version!==j.__version||J===!0){e.activeTexture(i.TEXTURE0+B);const Lt=re.getPrimaries(re.workingColorSpace),ft=S.colorSpace===Ni?null:re.getPrimaries(S.colorSpace),St=S.colorSpace===Ni||Lt===ft?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,S.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,S.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,St);const ie=S.isCompressedTexture||S.image[0].isCompressedTexture,rt=S.image[0]&&S.image[0].isDataTexture,Et=[];for(let Q=0;Q<6;Q++)!ie&&!rt?Et[Q]=v(S.image[Q],!0,s.maxCubemapSize):Et[Q]=rt?S.image[Q].image:S.image[Q],Et[Q]=xe(S,Et[Q]);const Ut=Et[0],zt=r.convert(S.format,S.colorSpace),bt=r.convert(S.type),Qt=y(S.internalFormat,zt,bt,S.colorSpace),$t=S.isVideoTexture!==!0,_e=j.__version===void 0||J===!0,N=nt.dataReady;let ut=C(S,Ut);Wt(i.TEXTURE_CUBE_MAP,S);let X;if(ie){$t&&_e&&e.texStorage2D(i.TEXTURE_CUBE_MAP,ut,Qt,Ut.width,Ut.height);for(let Q=0;Q<6;Q++){X=Et[Q].mipmaps;for(let mt=0;mt<X.length;mt++){const dt=X[mt];S.format!==wn?zt!==null?$t?N&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,mt,0,0,dt.width,dt.height,zt,dt.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,mt,Qt,dt.width,dt.height,0,dt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):$t?N&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,mt,0,0,dt.width,dt.height,zt,bt,dt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,mt,Qt,dt.width,dt.height,0,zt,bt,dt.data)}}}else{if(X=S.mipmaps,$t&&_e){X.length>0&&ut++;const Q=Nt(Et[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,ut,Qt,Q.width,Q.height)}for(let Q=0;Q<6;Q++)if(rt){$t?N&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,Et[Q].width,Et[Q].height,zt,bt,Et[Q].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,Qt,Et[Q].width,Et[Q].height,0,zt,bt,Et[Q].data);for(let mt=0;mt<X.length;mt++){const Ht=X[mt].image[Q].image;$t?N&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,mt+1,0,0,Ht.width,Ht.height,zt,bt,Ht.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,mt+1,Qt,Ht.width,Ht.height,0,zt,bt,Ht.data)}}else{$t?N&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,zt,bt,Et[Q]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,Qt,zt,bt,Et[Q]);for(let mt=0;mt<X.length;mt++){const dt=X[mt];$t?N&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,mt+1,0,0,zt,bt,dt.image[Q]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,mt+1,Qt,zt,bt,dt.image[Q])}}}m(S)&&p(i.TEXTURE_CUBE_MAP),j.__version=nt.version,S.onUpdate&&S.onUpdate(S)}R.__version=S.version}function Tt(R,S,B,J,nt,j){const Lt=r.convert(B.format,B.colorSpace),ft=r.convert(B.type),St=y(B.internalFormat,Lt,ft,B.colorSpace),ie=n.get(S),rt=n.get(B);if(rt.__renderTarget=S,!ie.__hasExternalTextures){const Et=Math.max(1,S.width>>j),Ut=Math.max(1,S.height>>j);nt===i.TEXTURE_3D||nt===i.TEXTURE_2D_ARRAY?e.texImage3D(nt,j,St,Et,Ut,S.depth,0,Lt,ft,null):e.texImage2D(nt,j,St,Et,Ut,0,Lt,ft,null)}e.bindFramebuffer(i.FRAMEBUFFER,R),Jt(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,J,nt,rt.__webglTexture,0,Zt(S)):(nt===i.TEXTURE_2D||nt>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&nt<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,J,nt,rt.__webglTexture,j),e.bindFramebuffer(i.FRAMEBUFFER,null)}function ot(R,S,B){if(i.bindRenderbuffer(i.RENDERBUFFER,R),S.depthBuffer){const J=S.depthTexture,nt=J&&J.isDepthTexture?J.type:null,j=M(S.stencilBuffer,nt),Lt=S.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ft=Zt(S);Jt(S)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ft,j,S.width,S.height):B?i.renderbufferStorageMultisample(i.RENDERBUFFER,ft,j,S.width,S.height):i.renderbufferStorage(i.RENDERBUFFER,j,S.width,S.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Lt,i.RENDERBUFFER,R)}else{const J=S.textures;for(let nt=0;nt<J.length;nt++){const j=J[nt],Lt=r.convert(j.format,j.colorSpace),ft=r.convert(j.type),St=y(j.internalFormat,Lt,ft,j.colorSpace),ie=Zt(S);B&&Jt(S)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,ie,St,S.width,S.height):Jt(S)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ie,St,S.width,S.height):i.renderbufferStorage(i.RENDERBUFFER,St,S.width,S.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function It(R,S){if(S&&S.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(i.FRAMEBUFFER,R),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const J=n.get(S.depthTexture);J.__renderTarget=S,(!J.__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),Z(S.depthTexture,0);const nt=J.__webglTexture,j=Zt(S);if(S.depthTexture.format===Qs)Jt(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,nt,0,j):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,nt,0);else if(S.depthTexture.format===ar)Jt(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,nt,0,j):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,nt,0);else throw new Error("Unknown depthTexture format")}function kt(R){const S=n.get(R),B=R.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==R.depthTexture){const J=R.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),J){const nt=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,J.removeEventListener("dispose",nt)};J.addEventListener("dispose",nt),S.__depthDisposeCallback=nt}S.__boundDepthTexture=J}if(R.depthTexture&&!S.__autoAllocateDepthBuffer){if(B)throw new Error("target.depthTexture not supported in Cube render targets");It(S.__webglFramebuffer,R)}else if(B){S.__webglDepthbuffer=[];for(let J=0;J<6;J++)if(e.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer[J]),S.__webglDepthbuffer[J]===void 0)S.__webglDepthbuffer[J]=i.createRenderbuffer(),ot(S.__webglDepthbuffer[J],R,!1);else{const nt=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,j=S.__webglDepthbuffer[J];i.bindRenderbuffer(i.RENDERBUFFER,j),i.framebufferRenderbuffer(i.FRAMEBUFFER,nt,i.RENDERBUFFER,j)}}else if(e.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=i.createRenderbuffer(),ot(S.__webglDepthbuffer,R,!1);else{const J=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,nt=S.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,nt),i.framebufferRenderbuffer(i.FRAMEBUFFER,J,i.RENDERBUFFER,nt)}e.bindFramebuffer(i.FRAMEBUFFER,null)}function Xt(R,S,B){const J=n.get(R);S!==void 0&&Tt(J.__webglFramebuffer,R,R.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),B!==void 0&&kt(R)}function Se(R){const S=R.texture,B=n.get(R),J=n.get(S);R.addEventListener("dispose",w);const nt=R.textures,j=R.isWebGLCubeRenderTarget===!0,Lt=nt.length>1;if(Lt||(J.__webglTexture===void 0&&(J.__webglTexture=i.createTexture()),J.__version=S.version,a.memory.textures++),j){B.__webglFramebuffer=[];for(let ft=0;ft<6;ft++)if(S.mipmaps&&S.mipmaps.length>0){B.__webglFramebuffer[ft]=[];for(let St=0;St<S.mipmaps.length;St++)B.__webglFramebuffer[ft][St]=i.createFramebuffer()}else B.__webglFramebuffer[ft]=i.createFramebuffer()}else{if(S.mipmaps&&S.mipmaps.length>0){B.__webglFramebuffer=[];for(let ft=0;ft<S.mipmaps.length;ft++)B.__webglFramebuffer[ft]=i.createFramebuffer()}else B.__webglFramebuffer=i.createFramebuffer();if(Lt)for(let ft=0,St=nt.length;ft<St;ft++){const ie=n.get(nt[ft]);ie.__webglTexture===void 0&&(ie.__webglTexture=i.createTexture(),a.memory.textures++)}if(R.samples>0&&Jt(R)===!1){B.__webglMultisampledFramebuffer=i.createFramebuffer(),B.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let ft=0;ft<nt.length;ft++){const St=nt[ft];B.__webglColorRenderbuffer[ft]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,B.__webglColorRenderbuffer[ft]);const ie=r.convert(St.format,St.colorSpace),rt=r.convert(St.type),Et=y(St.internalFormat,ie,rt,St.colorSpace,R.isXRRenderTarget===!0),Ut=Zt(R);i.renderbufferStorageMultisample(i.RENDERBUFFER,Ut,Et,R.width,R.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ft,i.RENDERBUFFER,B.__webglColorRenderbuffer[ft])}i.bindRenderbuffer(i.RENDERBUFFER,null),R.depthBuffer&&(B.__webglDepthRenderbuffer=i.createRenderbuffer(),ot(B.__webglDepthRenderbuffer,R,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(j){e.bindTexture(i.TEXTURE_CUBE_MAP,J.__webglTexture),Wt(i.TEXTURE_CUBE_MAP,S);for(let ft=0;ft<6;ft++)if(S.mipmaps&&S.mipmaps.length>0)for(let St=0;St<S.mipmaps.length;St++)Tt(B.__webglFramebuffer[ft][St],R,S,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,St);else Tt(B.__webglFramebuffer[ft],R,S,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,0);m(S)&&p(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(Lt){for(let ft=0,St=nt.length;ft<St;ft++){const ie=nt[ft],rt=n.get(ie);e.bindTexture(i.TEXTURE_2D,rt.__webglTexture),Wt(i.TEXTURE_2D,ie),Tt(B.__webglFramebuffer,R,ie,i.COLOR_ATTACHMENT0+ft,i.TEXTURE_2D,0),m(ie)&&p(i.TEXTURE_2D)}e.unbindTexture()}else{let ft=i.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(ft=R.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(ft,J.__webglTexture),Wt(ft,S),S.mipmaps&&S.mipmaps.length>0)for(let St=0;St<S.mipmaps.length;St++)Tt(B.__webglFramebuffer[St],R,S,i.COLOR_ATTACHMENT0,ft,St);else Tt(B.__webglFramebuffer,R,S,i.COLOR_ATTACHMENT0,ft,0);m(S)&&p(ft),e.unbindTexture()}R.depthBuffer&&kt(R)}function ne(R){const S=R.textures;for(let B=0,J=S.length;B<J;B++){const nt=S[B];if(m(nt)){const j=x(R),Lt=n.get(nt).__webglTexture;e.bindTexture(j,Lt),p(j),e.unbindTexture()}}}const Le=[],z=[];function vn(R){if(R.samples>0){if(Jt(R)===!1){const S=R.textures,B=R.width,J=R.height;let nt=i.COLOR_BUFFER_BIT;const j=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Lt=n.get(R),ft=S.length>1;if(ft)for(let St=0;St<S.length;St++)e.bindFramebuffer(i.FRAMEBUFFER,Lt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+St,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,Lt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+St,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,Lt.__webglMultisampledFramebuffer),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Lt.__webglFramebuffer);for(let St=0;St<S.length;St++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(nt|=i.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(nt|=i.STENCIL_BUFFER_BIT)),ft){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Lt.__webglColorRenderbuffer[St]);const ie=n.get(S[St]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,ie,0)}i.blitFramebuffer(0,0,B,J,0,0,B,J,nt,i.NEAREST),l===!0&&(Le.length=0,z.length=0,Le.push(i.COLOR_ATTACHMENT0+St),R.depthBuffer&&R.resolveDepthBuffer===!1&&(Le.push(j),z.push(j),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,z)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Le))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ft)for(let St=0;St<S.length;St++){e.bindFramebuffer(i.FRAMEBUFFER,Lt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+St,i.RENDERBUFFER,Lt.__webglColorRenderbuffer[St]);const ie=n.get(S[St]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,Lt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+St,i.TEXTURE_2D,ie,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Lt.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.resolveDepthBuffer===!1&&l){const S=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[S])}}}function Zt(R){return Math.min(s.maxSamples,R.samples)}function Jt(R){const S=n.get(R);return R.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function Ot(R){const S=a.render.frame;h.get(R)!==S&&(h.set(R,S),R.update())}function xe(R,S){const B=R.colorSpace,J=R.format,nt=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||B!==ur&&B!==Ni&&(re.getTransfer(B)===de?(J!==wn||nt!==mi)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",B)),S}function Nt(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(c.width=R.naturalWidth||R.width,c.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(c.width=R.displayWidth,c.height=R.displayHeight):(c.width=R.width,c.height=R.height),c}this.allocateTextureUnit=H,this.resetTextureUnits=K,this.setTexture2D=Z,this.setTexture2DArray=$,this.setTexture3D=it,this.setTextureCube=W,this.rebindTextures=Xt,this.setupRenderTarget=Se,this.updateRenderTargetMipmap=ne,this.updateMultisampleRenderTarget=vn,this.setupDepthRenderbuffer=kt,this.setupFrameBufferTexture=Tt,this.useMultisampledRTT=Jt}function px(i,t){function e(n,s=Ni){let r;const a=re.getTransfer(s);if(n===mi)return i.UNSIGNED_BYTE;if(n===qc)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Kc)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Pf)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Lf)return i.BYTE;if(n===Df)return i.SHORT;if(n===Jr)return i.UNSIGNED_SHORT;if(n===$c)return i.INT;if(n===gs)return i.UNSIGNED_INT;if(n===oi)return i.FLOAT;if(n===la)return i.HALF_FLOAT;if(n===If)return i.ALPHA;if(n===Nf)return i.RGB;if(n===wn)return i.RGBA;if(n===Of)return i.LUMINANCE;if(n===Uf)return i.LUMINANCE_ALPHA;if(n===Qs)return i.DEPTH_COMPONENT;if(n===ar)return i.DEPTH_STENCIL;if(n===kf)return i.RED;if(n===Yc)return i.RED_INTEGER;if(n===zf)return i.RG;if(n===jc)return i.RG_INTEGER;if(n===Zc)return i.RGBA_INTEGER;if(n===eo||n===no||n===io||n===so)if(a===de)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===eo)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===no)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===io)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===so)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===eo)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===no)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===io)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===so)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===ec||n===nc||n===ic||n===sc)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===ec)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===nc)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===ic)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===sc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===rc||n===ac||n===oc)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===rc||n===ac)return a===de?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===oc)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===lc||n===cc||n===hc||n===uc||n===fc||n===dc||n===pc||n===mc||n===gc||n===_c||n===vc||n===xc||n===Mc||n===yc)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===lc)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===cc)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===hc)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===uc)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===fc)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===dc)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===pc)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===mc)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===gc)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===_c)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===vc)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===xc)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Mc)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===yc)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===ro||n===Sc||n===Ec)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===ro)return a===de?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Sc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Ec)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Ff||n===bc||n===Tc||n===Ac)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===ro)return r.COMPRESSED_RED_RGTC1_EXT;if(n===bc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Tc)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Ac)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===rr?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}class mx extends En{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}class Hn extends qe{constructor(){super(),this.isGroup=!0,this.type="Group"}}const gx={type:"move"};class El{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Hn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Hn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new O,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new O),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Hn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new O,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new O),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(const v of t.hand.values()){const m=e.getJointPose(v,n),p=this._getHandJoint(c,v);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],f=h.position.distanceTo(u.position),d=.02,g=.005;c.inputState.pinching&&f>d+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&f<=d-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(gx)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new Hn;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}const _x=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,vx=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class xx{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){const s=new $e,r=t.properties.get(s);r.__webglTexture=e.texture,(e.depthNear!=n.depthNear||e.depthFar!=n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=s}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new Gn({vertexShader:_x,fragmentShader:vx,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Ce(new ds(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Mx extends fr{constructor(t,e){super();const n=this;let s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,f=null,d=null,g=null;const v=new xx,m=e.getContextAttributes();let p=null,x=null;const y=[],M=[],C=new Yt;let A=null;const w=new En;w.viewport=new De;const L=new En;L.viewport=new De;const T=[w,L],b=new mx;let I=null,K=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let st=y[Y];return st===void 0&&(st=new El,y[Y]=st),st.getTargetRaySpace()},this.getControllerGrip=function(Y){let st=y[Y];return st===void 0&&(st=new El,y[Y]=st),st.getGripSpace()},this.getHand=function(Y){let st=y[Y];return st===void 0&&(st=new El,y[Y]=st),st.getHandSpace()};function H(Y){const st=M.indexOf(Y.inputSource);if(st===-1)return;const Tt=y[st];Tt!==void 0&&(Tt.update(Y.inputSource,Y.frame,c||a),Tt.dispatchEvent({type:Y.type,data:Y.inputSource}))}function q(){s.removeEventListener("select",H),s.removeEventListener("selectstart",H),s.removeEventListener("selectend",H),s.removeEventListener("squeeze",H),s.removeEventListener("squeezestart",H),s.removeEventListener("squeezeend",H),s.removeEventListener("end",q),s.removeEventListener("inputsourceschange",Z);for(let Y=0;Y<y.length;Y++){const st=M[Y];st!==null&&(M[Y]=null,y[Y].disconnect(st))}I=null,K=null,v.reset(),t.setRenderTarget(p),d=null,f=null,u=null,s=null,x=null,ce.stop(),n.isPresenting=!1,t.setPixelRatio(A),t.setSize(C.width,C.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){r=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){o=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(Y){c=Y},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(Y){if(s=Y,s!==null){if(p=t.getRenderTarget(),s.addEventListener("select",H),s.addEventListener("selectstart",H),s.addEventListener("selectend",H),s.addEventListener("squeeze",H),s.addEventListener("squeezestart",H),s.addEventListener("squeezeend",H),s.addEventListener("end",q),s.addEventListener("inputsourceschange",Z),m.xrCompatible!==!0&&await e.makeXRCompatible(),A=t.getPixelRatio(),t.getSize(C),s.renderState.layers===void 0){const st={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(s,e,st),s.updateRenderState({baseLayer:d}),t.setPixelRatio(1),t.setSize(d.framebufferWidth,d.framebufferHeight,!1),x=new _s(d.framebufferWidth,d.framebufferHeight,{format:wn,type:mi,colorSpace:t.outputColorSpace,stencilBuffer:m.stencil})}else{let st=null,Tt=null,ot=null;m.depth&&(ot=m.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,st=m.stencil?ar:Qs,Tt=m.stencil?rr:gs);const It={colorFormat:e.RGBA8,depthFormat:ot,scaleFactor:r};u=new XRWebGLBinding(s,e),f=u.createProjectionLayer(It),s.updateRenderState({layers:[f]}),t.setPixelRatio(1),t.setSize(f.textureWidth,f.textureHeight,!1),x=new _s(f.textureWidth,f.textureHeight,{format:wn,type:mi,depthTexture:new Qf(f.textureWidth,f.textureHeight,Tt,void 0,void 0,void 0,void 0,void 0,void 0,st),stencilBuffer:m.stencil,colorSpace:t.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),ce.setContext(s),ce.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function Z(Y){for(let st=0;st<Y.removed.length;st++){const Tt=Y.removed[st],ot=M.indexOf(Tt);ot>=0&&(M[ot]=null,y[ot].disconnect(Tt))}for(let st=0;st<Y.added.length;st++){const Tt=Y.added[st];let ot=M.indexOf(Tt);if(ot===-1){for(let kt=0;kt<y.length;kt++)if(kt>=M.length){M.push(Tt),ot=kt;break}else if(M[kt]===null){M[kt]=Tt,ot=kt;break}if(ot===-1)break}const It=y[ot];It&&It.connect(Tt)}}const $=new O,it=new O;function W(Y,st,Tt){$.setFromMatrixPosition(st.matrixWorld),it.setFromMatrixPosition(Tt.matrixWorld);const ot=$.distanceTo(it),It=st.projectionMatrix.elements,kt=Tt.projectionMatrix.elements,Xt=It[14]/(It[10]-1),Se=It[14]/(It[10]+1),ne=(It[9]+1)/It[5],Le=(It[9]-1)/It[5],z=(It[8]-1)/It[0],vn=(kt[8]+1)/kt[0],Zt=Xt*z,Jt=Xt*vn,Ot=ot/(-z+vn),xe=Ot*-z;if(st.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(xe),Y.translateZ(Ot),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),It[10]===-1)Y.projectionMatrix.copy(st.projectionMatrix),Y.projectionMatrixInverse.copy(st.projectionMatrixInverse);else{const Nt=Xt+Ot,R=Se+Ot,S=Zt-xe,B=Jt+(ot-xe),J=ne*Se/R*Nt,nt=Le*Se/R*Nt;Y.projectionMatrix.makePerspective(S,B,J,nt,Nt,R),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function ct(Y,st){st===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(st.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(s===null)return;let st=Y.near,Tt=Y.far;v.texture!==null&&(v.depthNear>0&&(st=v.depthNear),v.depthFar>0&&(Tt=v.depthFar)),b.near=L.near=w.near=st,b.far=L.far=w.far=Tt,(I!==b.near||K!==b.far)&&(s.updateRenderState({depthNear:b.near,depthFar:b.far}),I=b.near,K=b.far),w.layers.mask=Y.layers.mask|2,L.layers.mask=Y.layers.mask|4,b.layers.mask=w.layers.mask|L.layers.mask;const ot=Y.parent,It=b.cameras;ct(b,ot);for(let kt=0;kt<It.length;kt++)ct(It[kt],ot);It.length===2?W(b,w,L):b.projectionMatrix.copy(w.projectionMatrix),_t(Y,b,ot)};function _t(Y,st,Tt){Tt===null?Y.matrix.copy(st.matrixWorld):(Y.matrix.copy(Tt.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(st.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(st.projectionMatrix),Y.projectionMatrixInverse.copy(st.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=Rc*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return b},this.getFoveation=function(){if(!(f===null&&d===null))return l},this.setFoveation=function(Y){l=Y,f!==null&&(f.fixedFoveation=Y),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=Y)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(b)};let Ct=null;function Wt(Y,st){if(h=st.getViewerPose(c||a),g=st,h!==null){const Tt=h.views;d!==null&&(t.setRenderTargetFramebuffer(x,d.framebuffer),t.setRenderTarget(x));let ot=!1;Tt.length!==b.cameras.length&&(b.cameras.length=0,ot=!0);for(let kt=0;kt<Tt.length;kt++){const Xt=Tt[kt];let Se=null;if(d!==null)Se=d.getViewport(Xt);else{const Le=u.getViewSubImage(f,Xt);Se=Le.viewport,kt===0&&(t.setRenderTargetTextures(x,Le.colorTexture,f.ignoreDepthValues?void 0:Le.depthStencilTexture),t.setRenderTarget(x))}let ne=T[kt];ne===void 0&&(ne=new En,ne.layers.enable(kt),ne.viewport=new De,T[kt]=ne),ne.matrix.fromArray(Xt.transform.matrix),ne.matrix.decompose(ne.position,ne.quaternion,ne.scale),ne.projectionMatrix.fromArray(Xt.projectionMatrix),ne.projectionMatrixInverse.copy(ne.projectionMatrix).invert(),ne.viewport.set(Se.x,Se.y,Se.width,Se.height),kt===0&&(b.matrix.copy(ne.matrix),b.matrix.decompose(b.position,b.quaternion,b.scale)),ot===!0&&b.cameras.push(ne)}const It=s.enabledFeatures;if(It&&It.includes("depth-sensing")){const kt=u.getDepthInformation(Tt[0]);kt&&kt.isValid&&kt.texture&&v.init(t,kt,s.renderState)}}for(let Tt=0;Tt<y.length;Tt++){const ot=M[Tt],It=y[Tt];ot!==null&&It!==void 0&&It.update(ot,st,c||a)}Ct&&Ct(Y,st),st.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:st}),g=null}const ce=new Jf;ce.setAnimationLoop(Wt),this.setAnimationLoop=function(Y){Ct=Y},this.dispose=function(){}}}const as=new gi,yx=new be;function Sx(i,t){function e(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,Kf(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,x,y,M){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),u(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p)):p.isMeshStandardMaterial?(r(m,p),f(m,p),p.isMeshPhysicalMaterial&&d(m,p,M)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),v(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?l(m,p,x,y):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,e(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===tn&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,e(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===tn&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,e(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,e(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,e(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const x=t.get(p),y=x.envMap,M=x.envMapRotation;y&&(m.envMap.value=y,as.copy(M),as.x*=-1,as.y*=-1,as.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(as.y*=-1,as.z*=-1),m.envMapRotation.value.setFromMatrix4(yx.makeRotationFromEuler(as)),m.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,e(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,e(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,x,y){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*x,m.scale.value=y*.5,p.map&&(m.map.value=p.map,e(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function u(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function f(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,e(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,e(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function d(m,p,x){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,e(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,e(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,e(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,e(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,e(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===tn&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,e(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,e(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=x.texture,m.transmissionSamplerSize.value.set(x.width,x.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,e(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,e(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,e(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,e(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,e(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function v(m,p){const x=t.get(p).light;m.referencePosition.value.setFromMatrixPosition(x.matrixWorld),m.nearDistance.value=x.shadow.camera.near,m.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Ex(i,t,e,n){let s={},r={},a=[];const o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(x,y){const M=y.program;n.uniformBlockBinding(x,M)}function c(x,y){let M=s[x.id];M===void 0&&(g(x),M=h(x),s[x.id]=M,x.addEventListener("dispose",m));const C=y.program;n.updateUBOMapping(x,C);const A=t.render.frame;r[x.id]!==A&&(f(x),r[x.id]=A)}function h(x){const y=u();x.__bindingPointIndex=y;const M=i.createBuffer(),C=x.__size,A=x.usage;return i.bindBuffer(i.UNIFORM_BUFFER,M),i.bufferData(i.UNIFORM_BUFFER,C,A),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,y,M),M}function u(){for(let x=0;x<o;x++)if(a.indexOf(x)===-1)return a.push(x),x;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(x){const y=s[x.id],M=x.uniforms,C=x.__cache;i.bindBuffer(i.UNIFORM_BUFFER,y);for(let A=0,w=M.length;A<w;A++){const L=Array.isArray(M[A])?M[A]:[M[A]];for(let T=0,b=L.length;T<b;T++){const I=L[T];if(d(I,A,T,C)===!0){const K=I.__offset,H=Array.isArray(I.value)?I.value:[I.value];let q=0;for(let Z=0;Z<H.length;Z++){const $=H[Z],it=v($);typeof $=="number"||typeof $=="boolean"?(I.__data[0]=$,i.bufferSubData(i.UNIFORM_BUFFER,K+q,I.__data)):$.isMatrix3?(I.__data[0]=$.elements[0],I.__data[1]=$.elements[1],I.__data[2]=$.elements[2],I.__data[3]=0,I.__data[4]=$.elements[3],I.__data[5]=$.elements[4],I.__data[6]=$.elements[5],I.__data[7]=0,I.__data[8]=$.elements[6],I.__data[9]=$.elements[7],I.__data[10]=$.elements[8],I.__data[11]=0):($.toArray(I.__data,q),q+=it.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,K,I.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function d(x,y,M,C){const A=x.value,w=y+"_"+M;if(C[w]===void 0)return typeof A=="number"||typeof A=="boolean"?C[w]=A:C[w]=A.clone(),!0;{const L=C[w];if(typeof A=="number"||typeof A=="boolean"){if(L!==A)return C[w]=A,!0}else if(L.equals(A)===!1)return L.copy(A),!0}return!1}function g(x){const y=x.uniforms;let M=0;const C=16;for(let w=0,L=y.length;w<L;w++){const T=Array.isArray(y[w])?y[w]:[y[w]];for(let b=0,I=T.length;b<I;b++){const K=T[b],H=Array.isArray(K.value)?K.value:[K.value];for(let q=0,Z=H.length;q<Z;q++){const $=H[q],it=v($),W=M%C,ct=W%it.boundary,_t=W+ct;M+=ct,_t!==0&&C-_t<it.storage&&(M+=C-_t),K.__data=new Float32Array(it.storage/Float32Array.BYTES_PER_ELEMENT),K.__offset=M,M+=it.storage}}}const A=M%C;return A>0&&(M+=C-A),x.__size=M,x.__cache={},this}function v(x){const y={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(y.boundary=4,y.storage=4):x.isVector2?(y.boundary=8,y.storage=8):x.isVector3||x.isColor?(y.boundary=16,y.storage=12):x.isVector4?(y.boundary=16,y.storage=16):x.isMatrix3?(y.boundary=48,y.storage=48):x.isMatrix4?(y.boundary=64,y.storage=64):x.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",x),y}function m(x){const y=x.target;y.removeEventListener("dispose",m);const M=a.indexOf(y.__bindingPointIndex);a.splice(M,1),i.deleteBuffer(s[y.id]),delete s[y.id],delete r[y.id]}function p(){for(const x in s)i.deleteBuffer(s[x]);a=[],s={},r={}}return{bind:l,update:c,dispose:p}}class bx{constructor(t={}){const{canvas:e=um(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:f=!1}=t;this.isWebGLRenderer=!0;let d;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=n.getContextAttributes().alpha}else d=a;const g=new Uint32Array(4),v=new Int32Array(4);let m=null,p=null;const x=[],y=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Sn,this.toneMapping=Hi,this.toneMappingExposure=1;const M=this;let C=!1,A=0,w=0,L=null,T=-1,b=null;const I=new De,K=new De;let H=null;const q=new le(0);let Z=0,$=e.width,it=e.height,W=1,ct=null,_t=null;const Ct=new De(0,0,$,it),Wt=new De(0,0,$,it);let ce=!1;const Y=new Zf;let st=!1,Tt=!1;const ot=new be,It=new be,kt=new O,Xt=new De,Se={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let ne=!1;function Le(){return L===null?W:1}let z=n;function vn(E,U){return e.getContext(E,U)}try{const E={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Xc}`),e.addEventListener("webglcontextlost",Q,!1),e.addEventListener("webglcontextrestored",mt,!1),e.addEventListener("webglcontextcreationerror",dt,!1),z===null){const U="webgl2";if(z=vn(U,E),z===null)throw vn(U)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(E){throw console.error("THREE.WebGLRenderer: "+E.message),E}let Zt,Jt,Ot,xe,Nt,R,S,B,J,nt,j,Lt,ft,St,ie,rt,Et,Ut,zt,bt,Qt,$t,_e,N;function ut(){Zt=new C_(z),Zt.init(),$t=new px(z,Zt),Jt=new S_(z,Zt,t,$t),Ot=new ux(z,Zt),Jt.reverseDepthBuffer&&f&&Ot.buffers.depth.setReversed(!0),xe=new P_(z),Nt=new jv,R=new dx(z,Zt,Ot,Nt,Jt,$t,xe),S=new b_(M),B=new R_(M),J=new zm(z),_e=new M_(z,J),nt=new L_(z,J,xe,_e),j=new N_(z,nt,J,xe),zt=new I_(z,Jt,R),rt=new E_(Nt),Lt=new Yv(M,S,B,Zt,Jt,_e,rt),ft=new Sx(M,Nt),St=new Jv,ie=new sx(Zt),Ut=new x_(M,S,B,Ot,j,d,l),Et=new cx(M,j,Jt),N=new Ex(z,xe,Jt,Ot),bt=new y_(z,Zt,xe),Qt=new D_(z,Zt,xe),xe.programs=Lt.programs,M.capabilities=Jt,M.extensions=Zt,M.properties=Nt,M.renderLists=St,M.shadowMap=Et,M.state=Ot,M.info=xe}ut();const X=new Mx(M,z);this.xr=X,this.getContext=function(){return z},this.getContextAttributes=function(){return z.getContextAttributes()},this.forceContextLoss=function(){const E=Zt.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){const E=Zt.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return W},this.setPixelRatio=function(E){E!==void 0&&(W=E,this.setSize($,it,!1))},this.getSize=function(E){return E.set($,it)},this.setSize=function(E,U,G=!0){if(X.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}$=E,it=U,e.width=Math.floor(E*W),e.height=Math.floor(U*W),G===!0&&(e.style.width=E+"px",e.style.height=U+"px"),this.setViewport(0,0,E,U)},this.getDrawingBufferSize=function(E){return E.set($*W,it*W).floor()},this.setDrawingBufferSize=function(E,U,G){$=E,it=U,W=G,e.width=Math.floor(E*G),e.height=Math.floor(U*G),this.setViewport(0,0,E,U)},this.getCurrentViewport=function(E){return E.copy(I)},this.getViewport=function(E){return E.copy(Ct)},this.setViewport=function(E,U,G,V){E.isVector4?Ct.set(E.x,E.y,E.z,E.w):Ct.set(E,U,G,V),Ot.viewport(I.copy(Ct).multiplyScalar(W).round())},this.getScissor=function(E){return E.copy(Wt)},this.setScissor=function(E,U,G,V){E.isVector4?Wt.set(E.x,E.y,E.z,E.w):Wt.set(E,U,G,V),Ot.scissor(K.copy(Wt).multiplyScalar(W).round())},this.getScissorTest=function(){return ce},this.setScissorTest=function(E){Ot.setScissorTest(ce=E)},this.setOpaqueSort=function(E){ct=E},this.setTransparentSort=function(E){_t=E},this.getClearColor=function(E){return E.copy(Ut.getClearColor())},this.setClearColor=function(){Ut.setClearColor.apply(Ut,arguments)},this.getClearAlpha=function(){return Ut.getClearAlpha()},this.setClearAlpha=function(){Ut.setClearAlpha.apply(Ut,arguments)},this.clear=function(E=!0,U=!0,G=!0){let V=0;if(E){let k=!1;if(L!==null){const at=L.texture.format;k=at===Zc||at===jc||at===Yc}if(k){const at=L.texture.type,pt=at===mi||at===gs||at===Jr||at===rr||at===qc||at===Kc,At=Ut.getClearColor(),wt=Ut.getClearAlpha(),Ft=At.r,Gt=At.g,Rt=At.b;pt?(g[0]=Ft,g[1]=Gt,g[2]=Rt,g[3]=wt,z.clearBufferuiv(z.COLOR,0,g)):(v[0]=Ft,v[1]=Gt,v[2]=Rt,v[3]=wt,z.clearBufferiv(z.COLOR,0,v))}else V|=z.COLOR_BUFFER_BIT}U&&(V|=z.DEPTH_BUFFER_BIT),G&&(V|=z.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),z.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",Q,!1),e.removeEventListener("webglcontextrestored",mt,!1),e.removeEventListener("webglcontextcreationerror",dt,!1),St.dispose(),ie.dispose(),Nt.dispose(),S.dispose(),B.dispose(),j.dispose(),_e.dispose(),N.dispose(),Lt.dispose(),X.dispose(),X.removeEventListener("sessionstart",ph),X.removeEventListener("sessionend",mh),ts.stop()};function Q(E){E.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),C=!0}function mt(){console.log("THREE.WebGLRenderer: Context Restored."),C=!1;const E=xe.autoReset,U=Et.enabled,G=Et.autoUpdate,V=Et.needsUpdate,k=Et.type;ut(),xe.autoReset=E,Et.enabled=U,Et.autoUpdate=G,Et.needsUpdate=V,Et.type=k}function dt(E){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function Ht(E){const U=E.target;U.removeEventListener("dispose",Ht),we(U)}function we(E){He(E),Nt.remove(E)}function He(E){const U=Nt.get(E).programs;U!==void 0&&(U.forEach(function(G){Lt.releaseProgram(G)}),E.isShaderMaterial&&Lt.releaseShaderCache(E))}this.renderBufferDirect=function(E,U,G,V,k,at){U===null&&(U=Se);const pt=k.isMesh&&k.matrixWorld.determinant()<0,At=xp(E,U,G,V,k);Ot.setMaterial(V,pt);let wt=G.index,Ft=1;if(V.wireframe===!0){if(wt=nt.getWireframeAttribute(G),wt===void 0)return;Ft=2}const Gt=G.drawRange,Rt=G.attributes.position;let ae=Gt.start*Ft,ve=(Gt.start+Gt.count)*Ft;at!==null&&(ae=Math.max(ae,at.start*Ft),ve=Math.min(ve,(at.start+at.count)*Ft)),wt!==null?(ae=Math.max(ae,0),ve=Math.min(ve,wt.count)):Rt!=null&&(ae=Math.max(ae,0),ve=Math.min(ve,Rt.count));const Me=ve-ae;if(Me<0||Me===1/0)return;_e.setup(k,V,At,G,wt);let rn,he=bt;if(wt!==null&&(rn=J.get(wt),he=Qt,he.setIndex(rn)),k.isMesh)V.wireframe===!0?(Ot.setLineWidth(V.wireframeLinewidth*Le()),he.setMode(z.LINES)):he.setMode(z.TRIANGLES);else if(k.isLine){let Dt=V.linewidth;Dt===void 0&&(Dt=1),Ot.setLineWidth(Dt*Le()),k.isLineSegments?he.setMode(z.LINES):k.isLineLoop?he.setMode(z.LINE_LOOP):he.setMode(z.LINE_STRIP)}else k.isPoints?he.setMode(z.POINTS):k.isSprite&&he.setMode(z.TRIANGLES);if(k.isBatchedMesh)if(k._multiDrawInstances!==null)he.renderMultiDrawInstances(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount,k._multiDrawInstances);else if(Zt.get("WEBGL_multi_draw"))he.renderMultiDraw(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount);else{const Dt=k._multiDrawStarts,Jn=k._multiDrawCounts,ue=k._multiDrawCount,In=wt?J.get(wt).bytesPerElement:1,bs=Nt.get(V).currentProgram.getUniforms();for(let un=0;un<ue;un++)bs.setValue(z,"_gl_DrawID",un),he.render(Dt[un]/In,Jn[un])}else if(k.isInstancedMesh)he.renderInstances(ae,Me,k.count);else if(G.isInstancedBufferGeometry){const Dt=G._maxInstanceCount!==void 0?G._maxInstanceCount:1/0,Jn=Math.min(G.instanceCount,Dt);he.renderInstances(ae,Me,Jn)}else he.render(ae,Me)};function fe(E,U,G){E.transparent===!0&&E.side===bn&&E.forceSinglePass===!1?(E.side=tn,E.needsUpdate=!0,va(E,U,G),E.side=pi,E.needsUpdate=!0,va(E,U,G),E.side=bn):va(E,U,G)}this.compile=function(E,U,G=null){G===null&&(G=E),p=ie.get(G),p.init(U),y.push(p),G.traverseVisible(function(k){k.isLight&&k.layers.test(U.layers)&&(p.pushLight(k),k.castShadow&&p.pushShadow(k))}),E!==G&&E.traverseVisible(function(k){k.isLight&&k.layers.test(U.layers)&&(p.pushLight(k),k.castShadow&&p.pushShadow(k))}),p.setupLights();const V=new Set;return E.traverse(function(k){if(!(k.isMesh||k.isPoints||k.isLine||k.isSprite))return;const at=k.material;if(at)if(Array.isArray(at))for(let pt=0;pt<at.length;pt++){const At=at[pt];fe(At,G,k),V.add(At)}else fe(at,G,k),V.add(at)}),y.pop(),p=null,V},this.compileAsync=function(E,U,G=null){const V=this.compile(E,U,G);return new Promise(k=>{function at(){if(V.forEach(function(pt){Nt.get(pt).currentProgram.isReady()&&V.delete(pt)}),V.size===0){k(E);return}setTimeout(at,10)}Zt.get("KHR_parallel_shader_compile")!==null?at():setTimeout(at,10)})};let Pn=null;function Zn(E){Pn&&Pn(E)}function ph(){ts.stop()}function mh(){ts.start()}const ts=new Jf;ts.setAnimationLoop(Zn),typeof self<"u"&&ts.setContext(self),this.setAnimationLoop=function(E){Pn=E,X.setAnimationLoop(E),E===null?ts.stop():ts.start()},X.addEventListener("sessionstart",ph),X.addEventListener("sessionend",mh),this.render=function(E,U){if(U!==void 0&&U.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(C===!0)return;if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),X.enabled===!0&&X.isPresenting===!0&&(X.cameraAutoUpdate===!0&&X.updateCamera(U),U=X.getCamera()),E.isScene===!0&&E.onBeforeRender(M,E,U,L),p=ie.get(E,y.length),p.init(U),y.push(p),It.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),Y.setFromProjectionMatrix(It),Tt=this.localClippingEnabled,st=rt.init(this.clippingPlanes,Tt),m=St.get(E,x.length),m.init(),x.push(m),X.enabled===!0&&X.isPresenting===!0){const at=M.xr.getDepthSensingMesh();at!==null&&Ko(at,U,-1/0,M.sortObjects)}Ko(E,U,0,M.sortObjects),m.finish(),M.sortObjects===!0&&m.sort(ct,_t),ne=X.enabled===!1||X.isPresenting===!1||X.hasDepthSensing()===!1,ne&&Ut.addToRenderList(m,E),this.info.render.frame++,st===!0&&rt.beginShadows();const G=p.state.shadowsArray;Et.render(G,E,U),st===!0&&rt.endShadows(),this.info.autoReset===!0&&this.info.reset();const V=m.opaque,k=m.transmissive;if(p.setupLights(),U.isArrayCamera){const at=U.cameras;if(k.length>0)for(let pt=0,At=at.length;pt<At;pt++){const wt=at[pt];_h(V,k,E,wt)}ne&&Ut.render(E);for(let pt=0,At=at.length;pt<At;pt++){const wt=at[pt];gh(m,E,wt,wt.viewport)}}else k.length>0&&_h(V,k,E,U),ne&&Ut.render(E),gh(m,E,U);L!==null&&(R.updateMultisampleRenderTarget(L),R.updateRenderTargetMipmap(L)),E.isScene===!0&&E.onAfterRender(M,E,U),_e.resetDefaultState(),T=-1,b=null,y.pop(),y.length>0?(p=y[y.length-1],st===!0&&rt.setGlobalState(M.clippingPlanes,p.state.camera)):p=null,x.pop(),x.length>0?m=x[x.length-1]:m=null};function Ko(E,U,G,V){if(E.visible===!1)return;if(E.layers.test(U.layers)){if(E.isGroup)G=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(U);else if(E.isLight)p.pushLight(E),E.castShadow&&p.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||Y.intersectsSprite(E)){V&&Xt.setFromMatrixPosition(E.matrixWorld).applyMatrix4(It);const pt=j.update(E),At=E.material;At.visible&&m.push(E,pt,At,G,Xt.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||Y.intersectsObject(E))){const pt=j.update(E),At=E.material;if(V&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Xt.copy(E.boundingSphere.center)):(pt.boundingSphere===null&&pt.computeBoundingSphere(),Xt.copy(pt.boundingSphere.center)),Xt.applyMatrix4(E.matrixWorld).applyMatrix4(It)),Array.isArray(At)){const wt=pt.groups;for(let Ft=0,Gt=wt.length;Ft<Gt;Ft++){const Rt=wt[Ft],ae=At[Rt.materialIndex];ae&&ae.visible&&m.push(E,pt,ae,G,Xt.z,Rt)}}else At.visible&&m.push(E,pt,At,G,Xt.z,null)}}const at=E.children;for(let pt=0,At=at.length;pt<At;pt++)Ko(at[pt],U,G,V)}function gh(E,U,G,V){const k=E.opaque,at=E.transmissive,pt=E.transparent;p.setupLightsView(G),st===!0&&rt.setGlobalState(M.clippingPlanes,G),V&&Ot.viewport(I.copy(V)),k.length>0&&_a(k,U,G),at.length>0&&_a(at,U,G),pt.length>0&&_a(pt,U,G),Ot.buffers.depth.setTest(!0),Ot.buffers.depth.setMask(!0),Ot.buffers.color.setMask(!0),Ot.setPolygonOffset(!1)}function _h(E,U,G,V){if((G.isScene===!0?G.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[V.id]===void 0&&(p.state.transmissionRenderTarget[V.id]=new _s(1,1,{generateMipmaps:!0,type:Zt.has("EXT_color_buffer_half_float")||Zt.has("EXT_color_buffer_float")?la:mi,minFilter:Yn,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:re.workingColorSpace}));const at=p.state.transmissionRenderTarget[V.id],pt=V.viewport||I;at.setSize(pt.z,pt.w);const At=M.getRenderTarget();M.setRenderTarget(at),M.getClearColor(q),Z=M.getClearAlpha(),Z<1&&M.setClearColor(16777215,.5),M.clear(),ne&&Ut.render(G);const wt=M.toneMapping;M.toneMapping=Hi;const Ft=V.viewport;if(V.viewport!==void 0&&(V.viewport=void 0),p.setupLightsView(V),st===!0&&rt.setGlobalState(M.clippingPlanes,V),_a(E,G,V),R.updateMultisampleRenderTarget(at),R.updateRenderTargetMipmap(at),Zt.has("WEBGL_multisampled_render_to_texture")===!1){let Gt=!1;for(let Rt=0,ae=U.length;Rt<ae;Rt++){const ve=U[Rt],Me=ve.object,rn=ve.geometry,he=ve.material,Dt=ve.group;if(he.side===bn&&Me.layers.test(V.layers)){const Jn=he.side;he.side=tn,he.needsUpdate=!0,vh(Me,G,V,rn,he,Dt),he.side=Jn,he.needsUpdate=!0,Gt=!0}}Gt===!0&&(R.updateMultisampleRenderTarget(at),R.updateRenderTargetMipmap(at))}M.setRenderTarget(At),M.setClearColor(q,Z),Ft!==void 0&&(V.viewport=Ft),M.toneMapping=wt}function _a(E,U,G){const V=U.isScene===!0?U.overrideMaterial:null;for(let k=0,at=E.length;k<at;k++){const pt=E[k],At=pt.object,wt=pt.geometry,Ft=V===null?pt.material:V,Gt=pt.group;At.layers.test(G.layers)&&vh(At,U,G,wt,Ft,Gt)}}function vh(E,U,G,V,k,at){E.onBeforeRender(M,U,G,V,k,at),E.modelViewMatrix.multiplyMatrices(G.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),k.onBeforeRender(M,U,G,V,E,at),k.transparent===!0&&k.side===bn&&k.forceSinglePass===!1?(k.side=tn,k.needsUpdate=!0,M.renderBufferDirect(G,U,V,k,E,at),k.side=pi,k.needsUpdate=!0,M.renderBufferDirect(G,U,V,k,E,at),k.side=bn):M.renderBufferDirect(G,U,V,k,E,at),E.onAfterRender(M,U,G,V,k,at)}function va(E,U,G){U.isScene!==!0&&(U=Se);const V=Nt.get(E),k=p.state.lights,at=p.state.shadowsArray,pt=k.state.version,At=Lt.getParameters(E,k.state,at,U,G),wt=Lt.getProgramCacheKey(At);let Ft=V.programs;V.environment=E.isMeshStandardMaterial?U.environment:null,V.fog=U.fog,V.envMap=(E.isMeshStandardMaterial?B:S).get(E.envMap||V.environment),V.envMapRotation=V.environment!==null&&E.envMap===null?U.environmentRotation:E.envMapRotation,Ft===void 0&&(E.addEventListener("dispose",Ht),Ft=new Map,V.programs=Ft);let Gt=Ft.get(wt);if(Gt!==void 0){if(V.currentProgram===Gt&&V.lightsStateVersion===pt)return Mh(E,At),Gt}else At.uniforms=Lt.getUniforms(E),E.onBeforeCompile(At,M),Gt=Lt.acquireProgram(At,wt),Ft.set(wt,Gt),V.uniforms=At.uniforms;const Rt=V.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Rt.clippingPlanes=rt.uniform),Mh(E,At),V.needsLights=yp(E),V.lightsStateVersion=pt,V.needsLights&&(Rt.ambientLightColor.value=k.state.ambient,Rt.lightProbe.value=k.state.probe,Rt.directionalLights.value=k.state.directional,Rt.directionalLightShadows.value=k.state.directionalShadow,Rt.spotLights.value=k.state.spot,Rt.spotLightShadows.value=k.state.spotShadow,Rt.rectAreaLights.value=k.state.rectArea,Rt.ltc_1.value=k.state.rectAreaLTC1,Rt.ltc_2.value=k.state.rectAreaLTC2,Rt.pointLights.value=k.state.point,Rt.pointLightShadows.value=k.state.pointShadow,Rt.hemisphereLights.value=k.state.hemi,Rt.directionalShadowMap.value=k.state.directionalShadowMap,Rt.directionalShadowMatrix.value=k.state.directionalShadowMatrix,Rt.spotShadowMap.value=k.state.spotShadowMap,Rt.spotLightMatrix.value=k.state.spotLightMatrix,Rt.spotLightMap.value=k.state.spotLightMap,Rt.pointShadowMap.value=k.state.pointShadowMap,Rt.pointShadowMatrix.value=k.state.pointShadowMatrix),V.currentProgram=Gt,V.uniformsList=null,Gt}function xh(E){if(E.uniformsList===null){const U=E.currentProgram.getUniforms();E.uniformsList=oo.seqWithValue(U.seq,E.uniforms)}return E.uniformsList}function Mh(E,U){const G=Nt.get(E);G.outputColorSpace=U.outputColorSpace,G.batching=U.batching,G.batchingColor=U.batchingColor,G.instancing=U.instancing,G.instancingColor=U.instancingColor,G.instancingMorph=U.instancingMorph,G.skinning=U.skinning,G.morphTargets=U.morphTargets,G.morphNormals=U.morphNormals,G.morphColors=U.morphColors,G.morphTargetsCount=U.morphTargetsCount,G.numClippingPlanes=U.numClippingPlanes,G.numIntersection=U.numClipIntersection,G.vertexAlphas=U.vertexAlphas,G.vertexTangents=U.vertexTangents,G.toneMapping=U.toneMapping}function xp(E,U,G,V,k){U.isScene!==!0&&(U=Se),R.resetTextureUnits();const at=U.fog,pt=V.isMeshStandardMaterial?U.environment:null,At=L===null?M.outputColorSpace:L.isXRRenderTarget===!0?L.texture.colorSpace:ur,wt=(V.isMeshStandardMaterial?B:S).get(V.envMap||pt),Ft=V.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,Gt=!!G.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),Rt=!!G.morphAttributes.position,ae=!!G.morphAttributes.normal,ve=!!G.morphAttributes.color;let Me=Hi;V.toneMapped&&(L===null||L.isXRRenderTarget===!0)&&(Me=M.toneMapping);const rn=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,he=rn!==void 0?rn.length:0,Dt=Nt.get(V),Jn=p.state.lights;if(st===!0&&(Tt===!0||E!==b)){const xn=E===b&&V.id===T;rt.setState(V,E,xn)}let ue=!1;V.version===Dt.__version?(Dt.needsLights&&Dt.lightsStateVersion!==Jn.state.version||Dt.outputColorSpace!==At||k.isBatchedMesh&&Dt.batching===!1||!k.isBatchedMesh&&Dt.batching===!0||k.isBatchedMesh&&Dt.batchingColor===!0&&k.colorTexture===null||k.isBatchedMesh&&Dt.batchingColor===!1&&k.colorTexture!==null||k.isInstancedMesh&&Dt.instancing===!1||!k.isInstancedMesh&&Dt.instancing===!0||k.isSkinnedMesh&&Dt.skinning===!1||!k.isSkinnedMesh&&Dt.skinning===!0||k.isInstancedMesh&&Dt.instancingColor===!0&&k.instanceColor===null||k.isInstancedMesh&&Dt.instancingColor===!1&&k.instanceColor!==null||k.isInstancedMesh&&Dt.instancingMorph===!0&&k.morphTexture===null||k.isInstancedMesh&&Dt.instancingMorph===!1&&k.morphTexture!==null||Dt.envMap!==wt||V.fog===!0&&Dt.fog!==at||Dt.numClippingPlanes!==void 0&&(Dt.numClippingPlanes!==rt.numPlanes||Dt.numIntersection!==rt.numIntersection)||Dt.vertexAlphas!==Ft||Dt.vertexTangents!==Gt||Dt.morphTargets!==Rt||Dt.morphNormals!==ae||Dt.morphColors!==ve||Dt.toneMapping!==Me||Dt.morphTargetsCount!==he)&&(ue=!0):(ue=!0,Dt.__version=V.version);let In=Dt.currentProgram;ue===!0&&(In=va(V,U,k));let bs=!1,un=!1,xr=!1;const ye=In.getUniforms(),Wn=Dt.uniforms;if(Ot.useProgram(In.program)&&(bs=!0,un=!0,xr=!0),V.id!==T&&(T=V.id,un=!0),bs||b!==E){Ot.buffers.depth.getReversed()?(ot.copy(E.projectionMatrix),dm(ot),pm(ot),ye.setValue(z,"projectionMatrix",ot)):ye.setValue(z,"projectionMatrix",E.projectionMatrix),ye.setValue(z,"viewMatrix",E.matrixWorldInverse);const Ei=ye.map.cameraPosition;Ei!==void 0&&Ei.setValue(z,kt.setFromMatrixPosition(E.matrixWorld)),Jt.logarithmicDepthBuffer&&ye.setValue(z,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&ye.setValue(z,"isOrthographic",E.isOrthographicCamera===!0),b!==E&&(b=E,un=!0,xr=!0)}if(k.isSkinnedMesh){ye.setOptional(z,k,"bindMatrix"),ye.setOptional(z,k,"bindMatrixInverse");const xn=k.skeleton;xn&&(xn.boneTexture===null&&xn.computeBoneTexture(),ye.setValue(z,"boneTexture",xn.boneTexture,R))}k.isBatchedMesh&&(ye.setOptional(z,k,"batchingTexture"),ye.setValue(z,"batchingTexture",k._matricesTexture,R),ye.setOptional(z,k,"batchingIdTexture"),ye.setValue(z,"batchingIdTexture",k._indirectTexture,R),ye.setOptional(z,k,"batchingColorTexture"),k._colorsTexture!==null&&ye.setValue(z,"batchingColorTexture",k._colorsTexture,R));const Mr=G.morphAttributes;if((Mr.position!==void 0||Mr.normal!==void 0||Mr.color!==void 0)&&zt.update(k,G,In),(un||Dt.receiveShadow!==k.receiveShadow)&&(Dt.receiveShadow=k.receiveShadow,ye.setValue(z,"receiveShadow",k.receiveShadow)),V.isMeshGouraudMaterial&&V.envMap!==null&&(Wn.envMap.value=wt,Wn.flipEnvMap.value=wt.isCubeTexture&&wt.isRenderTargetTexture===!1?-1:1),V.isMeshStandardMaterial&&V.envMap===null&&U.environment!==null&&(Wn.envMapIntensity.value=U.environmentIntensity),un&&(ye.setValue(z,"toneMappingExposure",M.toneMappingExposure),Dt.needsLights&&Mp(Wn,xr),at&&V.fog===!0&&ft.refreshFogUniforms(Wn,at),ft.refreshMaterialUniforms(Wn,V,W,it,p.state.transmissionRenderTarget[E.id]),oo.upload(z,xh(Dt),Wn,R)),V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(oo.upload(z,xh(Dt),Wn,R),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&ye.setValue(z,"center",k.center),ye.setValue(z,"modelViewMatrix",k.modelViewMatrix),ye.setValue(z,"normalMatrix",k.normalMatrix),ye.setValue(z,"modelMatrix",k.matrixWorld),V.isShaderMaterial||V.isRawShaderMaterial){const xn=V.uniformsGroups;for(let Ei=0,bi=xn.length;Ei<bi;Ei++){const yh=xn[Ei];N.update(yh,In),N.bind(yh,In)}}return In}function Mp(E,U){E.ambientLightColor.needsUpdate=U,E.lightProbe.needsUpdate=U,E.directionalLights.needsUpdate=U,E.directionalLightShadows.needsUpdate=U,E.pointLights.needsUpdate=U,E.pointLightShadows.needsUpdate=U,E.spotLights.needsUpdate=U,E.spotLightShadows.needsUpdate=U,E.rectAreaLights.needsUpdate=U,E.hemisphereLights.needsUpdate=U}function yp(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return A},this.getActiveMipmapLevel=function(){return w},this.getRenderTarget=function(){return L},this.setRenderTargetTextures=function(E,U,G){Nt.get(E.texture).__webglTexture=U,Nt.get(E.depthTexture).__webglTexture=G;const V=Nt.get(E);V.__hasExternalTextures=!0,V.__autoAllocateDepthBuffer=G===void 0,V.__autoAllocateDepthBuffer||Zt.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),V.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(E,U){const G=Nt.get(E);G.__webglFramebuffer=U,G.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(E,U=0,G=0){L=E,A=U,w=G;let V=!0,k=null,at=!1,pt=!1;if(E){const wt=Nt.get(E);if(wt.__useDefaultFramebuffer!==void 0)Ot.bindFramebuffer(z.FRAMEBUFFER,null),V=!1;else if(wt.__webglFramebuffer===void 0)R.setupRenderTarget(E);else if(wt.__hasExternalTextures)R.rebindTextures(E,Nt.get(E.texture).__webglTexture,Nt.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){const Rt=E.depthTexture;if(wt.__boundDepthTexture!==Rt){if(Rt!==null&&Nt.has(Rt)&&(E.width!==Rt.image.width||E.height!==Rt.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");R.setupDepthRenderbuffer(E)}}const Ft=E.texture;(Ft.isData3DTexture||Ft.isDataArrayTexture||Ft.isCompressedArrayTexture)&&(pt=!0);const Gt=Nt.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(Gt[U])?k=Gt[U][G]:k=Gt[U],at=!0):E.samples>0&&R.useMultisampledRTT(E)===!1?k=Nt.get(E).__webglMultisampledFramebuffer:Array.isArray(Gt)?k=Gt[G]:k=Gt,I.copy(E.viewport),K.copy(E.scissor),H=E.scissorTest}else I.copy(Ct).multiplyScalar(W).floor(),K.copy(Wt).multiplyScalar(W).floor(),H=ce;if(Ot.bindFramebuffer(z.FRAMEBUFFER,k)&&V&&Ot.drawBuffers(E,k),Ot.viewport(I),Ot.scissor(K),Ot.setScissorTest(H),at){const wt=Nt.get(E.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_CUBE_MAP_POSITIVE_X+U,wt.__webglTexture,G)}else if(pt){const wt=Nt.get(E.texture),Ft=U||0;z.framebufferTextureLayer(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,wt.__webglTexture,G||0,Ft)}T=-1},this.readRenderTargetPixels=function(E,U,G,V,k,at,pt){if(!(E&&E.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let At=Nt.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&pt!==void 0&&(At=At[pt]),At){Ot.bindFramebuffer(z.FRAMEBUFFER,At);try{const wt=E.texture,Ft=wt.format,Gt=wt.type;if(!Jt.textureFormatReadable(Ft)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Jt.textureTypeReadable(Gt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=E.width-V&&G>=0&&G<=E.height-k&&z.readPixels(U,G,V,k,$t.convert(Ft),$t.convert(Gt),at)}finally{const wt=L!==null?Nt.get(L).__webglFramebuffer:null;Ot.bindFramebuffer(z.FRAMEBUFFER,wt)}}},this.readRenderTargetPixelsAsync=async function(E,U,G,V,k,at,pt){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let At=Nt.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&pt!==void 0&&(At=At[pt]),At){const wt=E.texture,Ft=wt.format,Gt=wt.type;if(!Jt.textureFormatReadable(Ft))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Jt.textureTypeReadable(Gt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(U>=0&&U<=E.width-V&&G>=0&&G<=E.height-k){Ot.bindFramebuffer(z.FRAMEBUFFER,At);const Rt=z.createBuffer();z.bindBuffer(z.PIXEL_PACK_BUFFER,Rt),z.bufferData(z.PIXEL_PACK_BUFFER,at.byteLength,z.STREAM_READ),z.readPixels(U,G,V,k,$t.convert(Ft),$t.convert(Gt),0);const ae=L!==null?Nt.get(L).__webglFramebuffer:null;Ot.bindFramebuffer(z.FRAMEBUFFER,ae);const ve=z.fenceSync(z.SYNC_GPU_COMMANDS_COMPLETE,0);return z.flush(),await fm(z,ve,4),z.bindBuffer(z.PIXEL_PACK_BUFFER,Rt),z.getBufferSubData(z.PIXEL_PACK_BUFFER,0,at),z.deleteBuffer(Rt),z.deleteSync(ve),at}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(E,U=null,G=0){E.isTexture!==!0&&(zr("WebGLRenderer: copyFramebufferToTexture function signature has changed."),U=arguments[0]||null,E=arguments[1]);const V=Math.pow(2,-G),k=Math.floor(E.image.width*V),at=Math.floor(E.image.height*V),pt=U!==null?U.x:0,At=U!==null?U.y:0;R.setTexture2D(E,0),z.copyTexSubImage2D(z.TEXTURE_2D,G,0,0,pt,At,k,at),Ot.unbindTexture()},this.copyTextureToTexture=function(E,U,G=null,V=null,k=0){E.isTexture!==!0&&(zr("WebGLRenderer: copyTextureToTexture function signature has changed."),V=arguments[0]||null,E=arguments[1],U=arguments[2],k=arguments[3]||0,G=null);let at,pt,At,wt,Ft,Gt,Rt,ae,ve;const Me=E.isCompressedTexture?E.mipmaps[k]:E.image;G!==null?(at=G.max.x-G.min.x,pt=G.max.y-G.min.y,At=G.isBox3?G.max.z-G.min.z:1,wt=G.min.x,Ft=G.min.y,Gt=G.isBox3?G.min.z:0):(at=Me.width,pt=Me.height,At=Me.depth||1,wt=0,Ft=0,Gt=0),V!==null?(Rt=V.x,ae=V.y,ve=V.z):(Rt=0,ae=0,ve=0);const rn=$t.convert(U.format),he=$t.convert(U.type);let Dt;U.isData3DTexture?(R.setTexture3D(U,0),Dt=z.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(R.setTexture2DArray(U,0),Dt=z.TEXTURE_2D_ARRAY):(R.setTexture2D(U,0),Dt=z.TEXTURE_2D),z.pixelStorei(z.UNPACK_FLIP_Y_WEBGL,U.flipY),z.pixelStorei(z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),z.pixelStorei(z.UNPACK_ALIGNMENT,U.unpackAlignment);const Jn=z.getParameter(z.UNPACK_ROW_LENGTH),ue=z.getParameter(z.UNPACK_IMAGE_HEIGHT),In=z.getParameter(z.UNPACK_SKIP_PIXELS),bs=z.getParameter(z.UNPACK_SKIP_ROWS),un=z.getParameter(z.UNPACK_SKIP_IMAGES);z.pixelStorei(z.UNPACK_ROW_LENGTH,Me.width),z.pixelStorei(z.UNPACK_IMAGE_HEIGHT,Me.height),z.pixelStorei(z.UNPACK_SKIP_PIXELS,wt),z.pixelStorei(z.UNPACK_SKIP_ROWS,Ft),z.pixelStorei(z.UNPACK_SKIP_IMAGES,Gt);const xr=E.isDataArrayTexture||E.isData3DTexture,ye=U.isDataArrayTexture||U.isData3DTexture;if(E.isRenderTargetTexture||E.isDepthTexture){const Wn=Nt.get(E),Mr=Nt.get(U),xn=Nt.get(Wn.__renderTarget),Ei=Nt.get(Mr.__renderTarget);Ot.bindFramebuffer(z.READ_FRAMEBUFFER,xn.__webglFramebuffer),Ot.bindFramebuffer(z.DRAW_FRAMEBUFFER,Ei.__webglFramebuffer);for(let bi=0;bi<At;bi++)xr&&z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,Nt.get(E).__webglTexture,k,Gt+bi),E.isDepthTexture?(ye&&z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,Nt.get(U).__webglTexture,k,ve+bi),z.blitFramebuffer(wt,Ft,at,pt,Rt,ae,at,pt,z.DEPTH_BUFFER_BIT,z.NEAREST)):ye?z.copyTexSubImage3D(Dt,k,Rt,ae,ve+bi,wt,Ft,at,pt):z.copyTexSubImage2D(Dt,k,Rt,ae,ve+bi,wt,Ft,at,pt);Ot.bindFramebuffer(z.READ_FRAMEBUFFER,null),Ot.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else ye?E.isDataTexture||E.isData3DTexture?z.texSubImage3D(Dt,k,Rt,ae,ve,at,pt,At,rn,he,Me.data):U.isCompressedArrayTexture?z.compressedTexSubImage3D(Dt,k,Rt,ae,ve,at,pt,At,rn,Me.data):z.texSubImage3D(Dt,k,Rt,ae,ve,at,pt,At,rn,he,Me):E.isDataTexture?z.texSubImage2D(z.TEXTURE_2D,k,Rt,ae,at,pt,rn,he,Me.data):E.isCompressedTexture?z.compressedTexSubImage2D(z.TEXTURE_2D,k,Rt,ae,Me.width,Me.height,rn,Me.data):z.texSubImage2D(z.TEXTURE_2D,k,Rt,ae,at,pt,rn,he,Me);z.pixelStorei(z.UNPACK_ROW_LENGTH,Jn),z.pixelStorei(z.UNPACK_IMAGE_HEIGHT,ue),z.pixelStorei(z.UNPACK_SKIP_PIXELS,In),z.pixelStorei(z.UNPACK_SKIP_ROWS,bs),z.pixelStorei(z.UNPACK_SKIP_IMAGES,un),k===0&&U.generateMipmaps&&z.generateMipmap(Dt),Ot.unbindTexture()},this.copyTextureToTexture3D=function(E,U,G=null,V=null,k=0){return E.isTexture!==!0&&(zr("WebGLRenderer: copyTextureToTexture3D function signature has changed."),G=arguments[0]||null,V=arguments[1]||null,E=arguments[2],U=arguments[3],k=arguments[4]||0),zr('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(E,U,G,V,k)},this.initRenderTarget=function(E){Nt.get(E).__webglFramebuffer===void 0&&R.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?R.setTextureCube(E,0):E.isData3DTexture?R.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?R.setTexture2DArray(E,0):R.setTexture2D(E,0),Ot.unbindTexture()},this.resetState=function(){A=0,w=0,L=null,Ot.reset(),_e.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return li}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorspace=re._getDrawingBufferColorSpace(t),e.unpackColorSpace=re._getUnpackColorSpace()}}class Tx extends qe{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new gi,this.environmentIntensity=1,this.environmentRotation=new gi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class Ax{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=wc,this.updateRanges=[],this.version=0,this.uuid=Gi()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let s=0,r=this.stride;s<r;s++)this.array[t+s]=e.array[n+s];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Gi()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){return t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Gi()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Ke=new O;class xo{constructor(t,e,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)Ke.fromBufferAttribute(this,e),Ke.applyMatrix4(t),this.setXYZ(e,Ke.x,Ke.y,Ke.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Ke.fromBufferAttribute(this,e),Ke.applyNormalMatrix(t),this.setXYZ(e,Ke.x,Ke.y,Ke.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Ke.fromBufferAttribute(this,e),Ke.transformDirection(t),this.setXYZ(e,Ke.x,Ke.y,Ke.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=qn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=me(n,this.array)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=me(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=me(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=me(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=me(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=qn(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=qn(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=qn(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=qn(e,this.array)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=me(e,this.array),n=me(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,s){return t=t*this.data.stride+this.offset,this.normalized&&(e=me(e,this.array),n=me(n,this.array),s=me(s,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=me(e,this.array),n=me(n,this.array),s=me(s,this.array),r=me(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this.data.array[t+3]=r,this}clone(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return new Ne(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new xo(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class sd extends Ss{static get type(){return"SpriteMaterial"}constructor(t){super(),this.isSpriteMaterial=!0,this.color=new le(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}let Fs;const Tr=new O,Bs=new O,Hs=new O,Gs=new Yt,Ar=new Yt,rd=new be,Ba=new O,wr=new O,Ha=new O,xu=new Yt,bl=new Yt,Mu=new Yt;class wx extends qe{constructor(t=new sd){if(super(),this.isSprite=!0,this.type="Sprite",Fs===void 0){Fs=new Oe;const e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Ax(e,5);Fs.setIndex([0,1,2,0,2,3]),Fs.setAttribute("position",new xo(n,3,0,!1)),Fs.setAttribute("uv",new xo(n,2,3,!1))}this.geometry=Fs,this.material=t,this.center=new Yt(.5,.5)}raycast(t,e){t.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Bs.setFromMatrixScale(this.matrixWorld),rd.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),Hs.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Bs.multiplyScalar(-Hs.z);const n=this.material.rotation;let s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));const a=this.center;Ga(Ba.set(-.5,-.5,0),Hs,a,Bs,s,r),Ga(wr.set(.5,-.5,0),Hs,a,Bs,s,r),Ga(Ha.set(.5,.5,0),Hs,a,Bs,s,r),xu.set(0,0),bl.set(1,0),Mu.set(1,1);let o=t.ray.intersectTriangle(Ba,wr,Ha,!1,Tr);if(o===null&&(Ga(wr.set(-.5,.5,0),Hs,a,Bs,s,r),bl.set(0,1),o=t.ray.intersectTriangle(Ba,Ha,wr,!1,Tr),o===null))return;const l=t.ray.origin.distanceTo(Tr);l<t.near||l>t.far||e.push({distance:l,point:Tr.clone(),uv:gn.getInterpolation(Tr,Ba,wr,Ha,xu,bl,Mu,new Yt),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}}function Ga(i,t,e,n,s,r){Gs.subVectors(i,e).addScalar(.5).multiply(n),s!==void 0?(Ar.x=r*Gs.x-s*Gs.y,Ar.y=s*Gs.x+r*Gs.y):Ar.copy(Gs),i.copy(t),i.x+=Ar.x,i.y+=Ar.y,i.applyMatrix4(rd)}class Rx extends $e{constructor(t=null,e=1,n=1,s,r,a,o,l,c=en,h=en,u,f){super(null,a,o,l,c,h,s,r,u,f),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Br extends Ss{static get type(){return"LineBasicMaterial"}constructor(t){super(),this.isLineBasicMaterial=!0,this.color=new le(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const Mo=new O,yo=new O,yu=new be,Rr=new Jc,Va=new dr,Tl=new O,Su=new O;class Lc extends qe{constructor(t=new Oe,e=new Br){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[0];for(let s=1,r=e.count;s<r;s++)Mo.fromBufferAttribute(e,s-1),yo.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=Mo.distanceTo(yo);t.setAttribute("lineDistance",new nn(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){const n=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Va.copy(n.boundingSphere),Va.applyMatrix4(s),Va.radius+=r,t.ray.intersectsSphere(Va)===!1)return;yu.copy(s).invert(),Rr.copy(t.ray).applyMatrix4(yu);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=n.index,f=n.attributes.position;if(h!==null){const d=Math.max(0,a.start),g=Math.min(h.count,a.start+a.count);for(let v=d,m=g-1;v<m;v+=c){const p=h.getX(v),x=h.getX(v+1),y=Wa(this,t,Rr,l,p,x);y&&e.push(y)}if(this.isLineLoop){const v=h.getX(g-1),m=h.getX(d),p=Wa(this,t,Rr,l,v,m);p&&e.push(p)}}else{const d=Math.max(0,a.start),g=Math.min(f.count,a.start+a.count);for(let v=d,m=g-1;v<m;v+=c){const p=Wa(this,t,Rr,l,v,v+1);p&&e.push(p)}if(this.isLineLoop){const v=Wa(this,t,Rr,l,g-1,d);v&&e.push(v)}}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function Wa(i,t,e,n,s,r){const a=i.geometry.attributes.position;if(Mo.fromBufferAttribute(a,s),yo.fromBufferAttribute(a,r),e.distanceSqToSegment(Mo,yo,Tl,Su)>n)return;Tl.applyMatrix4(i.matrixWorld);const l=t.ray.origin.distanceTo(Tl);if(!(l<t.near||l>t.far))return{distance:l,point:Su.clone().applyMatrix4(i.matrixWorld),index:s,face:null,faceIndex:null,barycoord:null,object:i}}const Eu=new O,bu=new O;class Tu extends Lc{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[];for(let s=0,r=e.count;s<r;s+=2)Eu.fromBufferAttribute(e,s),bu.fromBufferAttribute(e,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Eu.distanceTo(bu);t.setAttribute("lineDistance",new nn(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class ad extends Ss{static get type(){return"PointsMaterial"}constructor(t){super(),this.isPointsMaterial=!0,this.color=new le(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}const Au=new be,Dc=new Jc,Xa=new dr,$a=new O;class Cx extends qe{constructor(t=new Oe,e=new ad){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){const n=this.geometry,s=this.matrixWorld,r=t.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Xa.copy(n.boundingSphere),Xa.applyMatrix4(s),Xa.radius+=r,t.ray.intersectsSphere(Xa)===!1)return;Au.copy(s).invert(),Dc.copy(t.ray).applyMatrix4(Au);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,u=n.attributes.position;if(c!==null){const f=Math.max(0,a.start),d=Math.min(c.count,a.start+a.count);for(let g=f,v=d;g<v;g++){const m=c.getX(g);$a.fromBufferAttribute(u,m),wu($a,m,l,s,t,e,this)}}else{const f=Math.max(0,a.start),d=Math.min(u.count,a.start+a.count);for(let g=f,v=d;g<v;g++)$a.fromBufferAttribute(u,g),wu($a,g,l,s,t,e,this)}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function wu(i,t,e,n,s,r,a){const o=Dc.distanceSqToPoint(i);if(o<e){const l=new O;Dc.closestPointToPoint(i,l),l.applyMatrix4(n);const c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:a})}}class lo extends $e{constructor(t,e,n,s,r,a,o,l,c){super(t,e,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}const qa=new O,Ka=new O,Al=new O,Ya=new gn;class Lx extends Oe{constructor(t=null,e=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:t,thresholdAngle:e},t!==null){const s=Math.pow(10,4),r=Math.cos(ao*e),a=t.getIndex(),o=t.getAttribute("position"),l=a?a.count:o.count,c=[0,0,0],h=["a","b","c"],u=new Array(3),f={},d=[];for(let g=0;g<l;g+=3){a?(c[0]=a.getX(g),c[1]=a.getX(g+1),c[2]=a.getX(g+2)):(c[0]=g,c[1]=g+1,c[2]=g+2);const{a:v,b:m,c:p}=Ya;if(v.fromBufferAttribute(o,c[0]),m.fromBufferAttribute(o,c[1]),p.fromBufferAttribute(o,c[2]),Ya.getNormal(Al),u[0]=`${Math.round(v.x*s)},${Math.round(v.y*s)},${Math.round(v.z*s)}`,u[1]=`${Math.round(m.x*s)},${Math.round(m.y*s)},${Math.round(m.z*s)}`,u[2]=`${Math.round(p.x*s)},${Math.round(p.y*s)},${Math.round(p.z*s)}`,!(u[0]===u[1]||u[1]===u[2]||u[2]===u[0]))for(let x=0;x<3;x++){const y=(x+1)%3,M=u[x],C=u[y],A=Ya[h[x]],w=Ya[h[y]],L=`${M}_${C}`,T=`${C}_${M}`;T in f&&f[T]?(Al.dot(f[T].normal)<=r&&(d.push(A.x,A.y,A.z),d.push(w.x,w.y,w.z)),f[T]=null):L in f||(f[L]={index0:c[x],index1:c[y],normal:Al.clone()})}}for(const g in f)if(f[g]){const{index0:v,index1:m}=f[g];qa.fromBufferAttribute(o,v),Ka.fromBufferAttribute(o,m),d.push(qa.x,qa.y,qa.z),d.push(Ka.x,Ka.y,Ka.z)}this.setAttribute("position",new nn(d,3))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}}class th extends Oe{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const l=Math.min(a+o,Math.PI);let c=0;const h=[],u=new O,f=new O,d=[],g=[],v=[],m=[];for(let p=0;p<=n;p++){const x=[],y=p/n;let M=0;p===0&&a===0?M=.5/e:p===n&&l===Math.PI&&(M=-.5/e);for(let C=0;C<=e;C++){const A=C/e;u.x=-t*Math.cos(s+A*r)*Math.sin(a+y*o),u.y=t*Math.cos(a+y*o),u.z=t*Math.sin(s+A*r)*Math.sin(a+y*o),g.push(u.x,u.y,u.z),f.copy(u).normalize(),v.push(f.x,f.y,f.z),m.push(A+M,1-y),x.push(c++)}h.push(x)}for(let p=0;p<n;p++)for(let x=0;x<e;x++){const y=h[p][x+1],M=h[p][x],C=h[p+1][x],A=h[p+1][x+1];(p!==0||a>0)&&d.push(y,M,A),(p!==n-1||l<Math.PI)&&d.push(M,C,A)}this.setIndex(d),this.setAttribute("position",new nn(g,3)),this.setAttribute("normal",new nn(v,3)),this.setAttribute("uv",new nn(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new th(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Xc}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Xc);const _i=11,eh=16,Pc=27,od=11,Dx=["RicoReWi","YourTime-FM","RapRadio 24","SchlagerPop 24","ChartRadio 24","ClubRadio 24","AnMaCha 24","RadioFloh!","RockRadio 24","ChristmasRadio","KultRadio 24","Zocker-FM","Special-Radio","AnMaChaCast","SenderWelt","RadioPortal"],Px=[{id:"natur",name:"Natur"},{id:"erz",name:"Erze & Steine"},{id:"bau",name:"Bauen"},{id:"form",name:"Formen"},{id:"licht",name:"Licht"},{id:"spezial",name:"Spezial"},{id:"technik",name:"Funktechnik"},{id:"funk",name:"Funk-Logos"}],jn=[[0,"AIR","Luft","",null,{solid:0,opaque:0,inv:0}],[1,"GRASS","Gras","natur",[0,1,2],{hard:.6,tool:"schaufel",color:5808188,map:[88,160,60],icon:1}],[2,"DIRT","Erde","natur",[2,2,2],{hard:.5,tool:"schaufel",color:8806463,map:[134,96,63],icon:2}],[3,"STONE","Stein","erz",[3,3,3],{hard:1.5,tool:"spitzhacke",color:8158336,map:[124,124,128],icon:3}],[4,"SAND","Sand","natur",[4,4,4],{hard:.5,tool:"schaufel",color:14404494,map:[219,203,142],icon:4}],[5,"WOOD","Holz","natur",[6,5,6],{hard:1,tool:"axt",color:6836270,map:[104,80,46],icon:5}],[6,"LEAVES","Blätter","natur",[7,7,7],{opaque:0,self:1,hard:.2,color:3833904,map:[46,120,44],icon:7}],[7,"PLANKS","Bretter","bau",[8,8,8],{hard:1,tool:"axt",color:11306578,map:[172,134,82],icon:8}],[8,"GLASS","Glas","bau",[9,9,9],{opaque:0,trans:1,hard:.3,color:13625584,map:[200,230,240],icon:9}],[9,"LAMP","Leuchtblock","licht",[10,10,10],{emit:1,hard:.3,color:16767098,map:[255,214,120],icon:10}],[10,"WATER","Wasser","",[11,11,11],{solid:0,opaque:0,trans:1,inv:0,map:[44,100,200]}],[27,"FEDER","Federblock","spezial",[12,13,13],{hard:.5,color:16738976,map:[255,100,160],icon:12}],[28,"TURBO","Turbo-Block","spezial",[14,15,15],{hard:.8,color:16766504,map:[255,214,40],icon:14}],[29,"WIND","Aufwind-Block","spezial",[16,17,17],{hard:.5,color:5294318,map:[80,200,235],icon:16}],[30,"RADIO","Radio-Block","spezial",[19,18,19],{hard:.5,color:3817034,map:[60,64,76],icon:18}],[31,"RAINBOW","Regenbogen-Block","licht",[20,20,20],{emit:2,hard:.5,color:14509823,map:[220,100,255],icon:20}],[32,"NEON_R","Neonrot","licht",[21,21,21],{emit:1,hard:.3,color:16721990,map:[255,40,70],icon:21}],[33,"NEON_B","Neonblau","licht",[22,22,22],{emit:1,hard:.3,color:2657535,map:[40,140,255],icon:22}],[34,"NEON_G","Neongrün","licht",[23,23,23],{emit:1,hard:.3,color:3342200,map:[50,255,120],icon:23}],[35,"NEON_P","Neonlila","licht",[24,24,24],{emit:1,hard:.3,color:12470015,map:[190,70,255],icon:24}],[36,"BRICK","Ziegel","bau",[25,25,25],{hard:1.5,tool:"spitzhacke",color:10111544,map:[154,74,56],icon:25}],[37,"MARBLE","Marmor","bau",[26,26,26],{hard:1.5,tool:"spitzhacke",color:15132398,map:[232,232,240],icon:26}],[38,"SNOW","Schnee","natur",[27,28,2],{hard:.4,tool:"schaufel",color:15922938,map:[240,246,250],icon:27}],[39,"ICE","Eis","natur",[29,29,29],{hard:.6,tool:"spitzhacke",color:11064560,map:[168,212,240],icon:29}],[40,"GRAVEL","Kies","erz",[30,30,30],{hard:.6,tool:"schaufel",color:9078402,map:[138,134,130],icon:30}],[41,"CLAY","Ton","natur",[31,31,31],{hard:.6,tool:"schaufel",color:10134708,map:[154,164,180],icon:31}],[42,"SPRUCE","Fichtenholz","natur",[33,32,33],{hard:1,tool:"axt",color:4863008,map:[74,52,32],icon:32}],[43,"NEEDLES","Fichtennadeln","natur",[34,34,34],{opaque:0,self:1,hard:.2,color:2775606,map:[36,84,50],icon:34}],[44,"CACTUS","Kaktus","natur",[36,35,36],{hard:.4,color:3967546,map:[60,138,58],icon:35}],[45,"COAL","Kohleerz","erz",[37,37,37],{hard:2,tool:"spitzhacke",color:3816e3,map:[70,70,78],icon:37,tier:1}],[46,"COPPER","Kupfererz","erz",[38,38,38],{hard:2.2,tool:"spitzhacke",color:13136956,map:[200,116,60],icon:38,tier:1}],[47,"IRON","Eisenerz","erz",[39,39,39],{hard:2.6,tool:"spitzhacke",color:13150344,map:[200,168,136],icon:39,tier:2}],[48,"CRYSTAL","Funkkristall","erz",[40,40,40],{emit:1,hard:2.4,tool:"spitzhacke",color:7006463,map:[106,232,255],icon:40,tier:2}],[49,"MUD","Schlamm","natur",[41,41,41],{hard:.5,tool:"schaufel",color:5128756,map:[78,66,52],icon:41}],[50,"FLOWERS","Blütenwiese","natur",[42,1,2],{hard:.6,tool:"schaufel",color:6991946,map:[150,170,90],icon:42}],[51,"BASALT","Basalt","erz",[43,43,43],{hard:1.8,tool:"spitzhacke",color:3421242,map:[52,52,58],icon:43}],[52,"MAGMA","Magma","erz",[44,44,44],{emit:1,hard:1.2,tool:"spitzhacke",color:16738842,map:[255,106,26],icon:44}],[53,"SHROOM","Pilzhut","natur",[45,45,45],{hard:.3,color:13122106,map:[200,58,58],icon:45}],[54,"MYCEL","Pilzboden","natur",[46,47,2],{hard:.6,tool:"schaufel",color:8022656,map:[122,106,128],icon:46}],[55,"SANDSTONE","Sandstein","bau",[48,48,48],{hard:1.2,tool:"spitzhacke",color:14205066,map:[216,192,138],icon:48}],[56,"STEM","Pilzstiel","natur",[49,49,49],{hard:.6,tool:"axt",color:15261904,map:[232,224,208],icon:49}],[57,"JLEAVES","Dschungelblätter","natur",[50,50,50],{opaque:0,self:1,hard:.2,color:3050020,map:[40,130,34],icon:50}],[58,"WORKBENCH","Werkbank","bau",[51,52,8],{hard:1.2,tool:"axt",color:10122308,map:[150,112,66],icon:51,station:"werkbank"}],[59,"FURNACE","Schmelzofen","bau",[54,53,54],{hard:2,tool:"spitzhacke",color:6974064,map:[110,110,116],icon:53,station:"ofen"}],[60,"WOOL","Wolle","bau",[55,55,55],{hard:.4,color:15657698,map:[236,232,224],icon:55}],[61,"FARMLAND","Ackerboden","natur",[56,2,2],{hard:.5,tool:"schaufel",color:5914150,map:[96,66,40],icon:56}],[62,"WHEAT0","Weizen (Keim)","",[57,57,57],{shape:"cross",solid:0,opaque:0,inv:0,hard:0,color:6991936,map:[100,150,60]}],[63,"WHEAT1","Weizen (jung)","",[58,58,58],{shape:"cross",solid:0,opaque:0,inv:0,hard:0,color:8041536,map:[110,160,60]}],[64,"WHEAT2","Weizen (grün)","",[59,59,59],{shape:"cross",solid:0,opaque:0,inv:0,hard:0,color:10530880,map:[150,170,60]}],[65,"WHEAT3","Weizen (reif)","",[60,60,60],{shape:"cross",solid:0,opaque:0,inv:0,hard:0,color:14202960,map:[216,184,80]}],[66,"PATH","Dorfweg","bau",[61,2,2],{hard:.5,tool:"schaufel",color:10126946,map:[150,132,100],icon:61}],[67,"COBBLE","Bruchstein","bau",[62,62,62],{hard:1.6,tool:"spitzhacke",color:8421510,map:[120,120,126],icon:62}],[68,"SWITCH","Schalter","technik",[63,63,63],{hard:.5,color:9079440,map:[140,140,146],icon:63}],[69,"SWITCH_ON","Schalter (an)","",[64,64,64],{hard:.5,color:9079440,map:[140,160,146],inv:0,drop:68}],[70,"WIRE","Signalleitung","technik",[65,65,65],{hard:.5,color:14188604,map:[200,120,60],icon:65}],[71,"SENDER","Funksender","technik",[66,67,62],{hard:.8,color:3817034,map:[80,200,240],icon:67}],[72,"RELAY","Funkrelais","technik",[68,68,68],{hard:.8,color:4869722,map:[110,200,230],icon:68}],[73,"RECEIVER","Empfänger","technik",[69,69,69],{hard:.8,color:3159102,map:[70,74,86],icon:69}],[74,"RECEIVER_ON","Empfänger (an)","",[70,70,70],{hard:.8,color:3159102,map:[90,230,140],inv:0,drop:73,emit:1}],[75,"SIGLAMP","Signallampe","technik",[71,71,71],{hard:.3,color:6969920,map:[110,92,66],icon:71}],[76,"SIGLAMP_ON","Signallampe (an)","",[72,72,72],{hard:.3,color:16767098,map:[255,220,120],inv:0,drop:75,emit:1}],[77,"GATE","Funktor","technik",[73,73,73],{hard:2,tool:"spitzhacke",color:11843262,map:[170,172,180],icon:73}],[78,"GATE_OPEN","Funktor (offen)","",[74,74,74],{solid:0,opaque:0,hard:2,tool:"spitzhacke",color:11843262,map:[130,132,140],inv:0,drop:77}],[79,"RAIL","Schiene","technik",[75,75,75],{shape:"flat",solid:0,opaque:0,hard:.4,color:9075306,map:[140,120,100],icon:75}]];jn.push([80,"STONEBRICK","Steinziegel","bau",[76,76,76],{hard:1.5,tool:"spitzhacke",color:9079954,map:[138,140,146],icon:76}],[81,"SMOOTH","Glattstein","bau",[77,77,77],{hard:1.5,tool:"spitzhacke",color:10790572,map:[164,166,172],icon:77}],[82,"DARKPLANKS","Dunkle Bretter","bau",[78,78,78],{hard:1,tool:"axt",color:5650980,map:[86,58,36],icon:78}],[83,"BIRCH","Birkenbretter","bau",[79,79,79],{hard:1,tool:"axt",color:14205070,map:[216,192,142],icon:79}],[84,"ROOF","Dachziegel","bau",[80,80,80],{hard:1.2,tool:"spitzhacke",color:11029046,map:[168,74,54],icon:80}],[85,"BOOKS","Bücherregal","bau",[8,81,8],{hard:1,tool:"axt",color:9067060,map:[138,90,52],icon:81}],[86,"LANTERN","Laterne","licht",[82,82,82],{emit:1,hard:.5,color:16764006,map:[255,204,102],icon:82}],[87,"COPPERBLOCK","Kupferblock","bau",[83,83,83],{hard:2,tool:"spitzhacke",color:13136956,map:[210,124,72],icon:83}],[88,"IRONBLOCK","Eisenblock","bau",[84,84,84],{hard:2.4,tool:"spitzhacke",color:13159122,map:[200,202,210],icon:84}],[89,"HAY","Strohballen","natur",[86,85,86],{hard:.4,color:14201936,map:[216,180,80],icon:85}]);["weiß","schwarz","rot","orange","gelb","grün","blau","lila"].forEach((i,t)=>{const e=[[236,238,240],[36,38,44],[190,44,44],[232,120,30],[240,200,40],[70,160,60],[40,90,190],[130,60,180]][t];jn.push([90+t,"CONCRETE"+t,"Beton "+i,"bau",[87+t,87+t,87+t],{hard:1.4,tool:"spitzhacke",color:e[0]<<16|e[1]<<8|e[2],map:e,icon:87+t}])});["rot","blau","grün"].forEach((i,t)=>{const e=[[220,60,70],[70,120,230],[70,200,110]][t];jn.push([98+t,"STAINED"+t,"Buntglas "+i,"bau",[95+t,95+t,95+t],{trans:1,hard:.3,color:e[0]<<16|e[1]<<8|e[2],map:e,icon:95+t}])});const ld=[["PLANKS","Bretter",7,8],["COBBLE","Bruchstein",67,62],["BRICK","Ziegel",36,25],["STONEBRICK","Steinziegel",80,76],["SANDSTONE","Sandstein",55,48],["MARBLE","Marmor",37,26],["DARKPLANKS","Dunkle Bretter",82,78],["SMOOTH","Glattstein",81,77]],Ix=i=>jn.find(t=>t[0]===i)[5];ld.forEach(([i,t,e,n],s)=>{const r=Ix(e),a={hard:r.hard,tool:r.tool,color:r.color,map:r.map,opaque:0,icon:n};jn.push([101+s,i+"_SLAB",t+"-Stufe","form",[n,n,n],{...a,shape:"slab",full:e}]);for(let o=0;o<4;o++)jn.push([109+s*4+o,i+"_STAIRS"+(o||""),t+"-Treppe",o?"":"form",[n,n,n],{...a,shape:"stair",dir:o,inv:o?0:1,drop:o?109+s*4:0}])});jn.push([141,"FENCE","Holzzaun","form",[8,8,8],{shape:"fence",opaque:0,hard:1,tool:"axt",color:11306578,map:[172,134,82],icon:8}],[142,"WALL","Steinmauer","form",[62,62,62],{shape:"wall",opaque:0,hard:1.6,tool:"spitzhacke",color:8421510,map:[120,120,126],icon:62}],[143,"PANE","Glasscheibe","form",[9,9,9],{shape:"pane",trans:1,hard:.3,color:13625584,map:[200,230,240],icon:9}],[144,"DOOR","Holztür","form",[8,98,8],{shape:"door",opaque:0,hard:1,tool:"axt",color:10119740,map:[154,106,60],icon:98}],[145,"DOOR_OPEN","Holztür (offen)","",[8,98,8],{shape:"door",opaque:0,solid:0,hard:1,tool:"axt",color:10119740,map:[154,106,60],inv:0,drop:144}],[146,"LADDER","Leiter","form",[99,99,99],{shape:"ladder",opaque:0,solid:0,hard:.4,tool:"axt",color:9068596,map:[138,96,52],icon:99}]);for(let i=0;i<eh;i++)jn.push([_i+i,"LOGO"+(i+1),Dx[i],"funk",null,{logo:1,hard:.5,color:1712192,map:[60,70,110]}]);jn.sort((i,t)=>i[0]-t[0]);const yi=256,Kt=[],_={},Qr=[],ta=new Uint8Array(yi),Tn=new Uint8Array(yi),cd=new Uint8Array(yi),nh=new Float32Array(yi),co=new Uint8Array(yi),hd=new Uint8Array(yi),ud=new Uint8Array(yi),fd=new Uint8Array(yi),Nx=["","slab","stair","fence","wall","pane","door","ladder"],Ki=new Uint8Array(yi),Ks={};for(const[i,t,e,n,s,r]of jn){if(Kt[i])throw new Error("Block-Id doppelt: "+i);const a={id:i,key:t,name:e,cat:n,tiles:s,solid:1,opaque:1,trans:0,self:0,emit:0,hard:1,tool:null,color:14540253,map:[200,200,210],icon:0,inv:1,logo:0,station:null,tier:0,shape:null,drop:0,dir:0,full:0,...r};a.trans&&(a.opaque=0),Kt[i]=a,_[t]=i,Qr[i]=e,ta[i]=a.solid,Tn[i]=a.opaque,co[i]=a.trans,hd[i]=a.self,nh[i]=a.emit,ud[i]=a.shape==="cross"?1:0,fd[i]=a.shape==="flat"?1:0,Ki[i]=Math.max(0,Nx.indexOf(a.shape||"")),cd[i]=a.opaque||a.self?1:0,s&&(Ks[i]=s)}const No=i=>i>=_i&&i<_i+eh;Qr.slice(Pc,Pc+od);const Ox=Kt.filter(i=>i&&i.inv).map(i=>i.id);function Ux(i,t){const e=-Math.sin(t),n=-Math.cos(t),s=Math.abs(e)>Math.abs(n)?e>0?1:3:n>0?2:0;return i+s}const ea=[_.WHEAT0,_.WHEAT1,_.WHEAT2,_.WHEAT3],F=16,oe=96,te=24,kx=8,Ru=16;function jt(i,t,e){let n=Math.imul(i|0,668265261)^Math.imul(t|0,374761393)^Math.imul(e|0,2654435761);return n=Math.imul(n^n>>>15,2246822507),n=Math.imul(n^n>>>13,3266489909),n^=n>>>16,(n>>>0)/4294967296}function zx(i,t,e){const n=Math.floor(i),s=Math.floor(t),r=i-n,a=t-s,o=r*r*(3-2*r),l=a*a*(3-2*a),c=jt(n,s,e),h=jt(n+1,s,e),u=jt(n,s+1,e),f=jt(n+1,s+1,e);return c+(h-c)*o+(u-c)*l+(c-h-u+f)*o*l}function je(i,t,e,n){let s=0,r=.5,a=1,o=0;for(let l=0;l<n;l++)s+=r*zx(i*a,t*a,e+l*101),o+=r,r*=.5,a*=2;return s/o}const Pt={OCEAN:0,BEACH:1,PLAINS:2,FOREST:3,TAIGA:4,MOUNTAINS:5,SNOW:6,DESERT:7,SWAMP:8,JUNGLE:9,MEADOW:10,VOLCANO:11,MUSHROOM:12,CRYSTAL:13,COAST:14},Fx=["Meer","Strand","Grüne Ebene","Laubwald","Nadelwald","Berge","Schneegebiet","Wüste","Sumpf","Dschungel","Blumenwiese","Vulkanregion","Pilzwald","Kristallgebiet","Felsküste"],Vs=[[40,90,180],[222,206,146],[110,176,70],[52,122,46],[44,96,70],[130,130,136],[236,242,248],[228,200,120],[78,98,60],[36,140,40],[170,190,90],[70,50,50],[130,100,140],[110,220,240],[120,118,112]],Bx=[Pt.PLAINS,Pt.FOREST,Pt.MEADOW],os=(i,t,e)=>{const n=Math.max(0,Math.min(1,(e-i)/(t-i)));return n*n*(3-2*n)},wl=i=>Math.max(0,Math.min(1,(i-.5)*2.4+.5)),Cu=te-14,Hx=6,Gx=5,Xr=5;function vi(i,t,e,n){const s=je(t/640,e/640,i+1,4),r=os(.4,.5,s),a=je(t/52,e/52,i+3,3),o=os(.56,.72,je(t/300,e/300,i+2,3))*r,l=wl(je(t/520,e/520,i+11,3))+(jt(t,e,i+5)-.5)*.05,c=wl(je(t/480,e/480,i+23,3))+(jt(t,e,i+6)-.5)*.05,h=wl(je(t/360,e/360,i+37,2));let u=(te-13+a*8)*(1-r)+(te+2+a*12)*r;if(o>0){const y=1-Math.abs(je(t/80,e/80,i+4,2)*2-1);u+=o*(12+y*36)}const f=os(.74,.82,c)*os(.42,.5,l)*(1-os(0,.2,o))*r;f>0&&(u+=(te+(a<.45?-1:1)-u)*f);const d=l>.6?os(.86,.98,h)*r*(1-f):0;d>0&&(u+=d*26-os(.8,.95,d)*5),u=Math.max(2,Math.min(oe-12,Math.floor(u)));const g=l-Math.max(0,u-(te+18))*.012;let v;f>.5?v=Pt.SWAMP:u<te?v=Pt.OCEAN:d>.05?v=Pt.VOLCANO:o>.3&&u>te+18?v=Pt.MOUNTAINS:u<=te+1?v=g<.32||o>.15?Pt.COAST:Pt.BEACH:h>.86?v=c>.5?Pt.MUSHROOM:Pt.CRYSTAL:g<.16?v=Pt.SNOW:g<.3?v=Pt.TAIGA:g>.7&&c<.4?v=Pt.DESERT:g>.66&&c>.62?v=Pt.JUNGLE:c>.56?v=Pt.FOREST:je(t/110,e/110,i+41,2)>.6?v=Pt.MEADOW:v=Pt.PLAINS,n.h=u,n.biome=v,n.t=g,n.u=c,n.d=a,n.volc=d;const m=u<te+6,p=m?Math.min(u-5,Cu):u;n.t0lo=n.t1lo=n.cvlo=1e9,n.t0hi=n.t1hi=n.cvhi=-1,n.lake=!1,n.open=!1;for(let y=0;y<2;y++){const M=Math.abs(je(t/64,e/64,i+50+y*7,2)-.5);if(M>=.024)continue;const C=8+y*13+je(t/90,e/90,i+60+y,2)*16,A=1.4+(1-M/.024)*1.6,w=Math.max(Hx,Math.ceil(C-A)),L=Math.min(p,Math.floor(C+A*.75));L<w||(y===0?(n.t0lo=w,n.t0hi=L):(n.t1lo=w,n.t1hi=L),L>=u&&(n.open=!0))}const x=je(t/36,e/36,i+70,2);if(x>.66){const y=Math.min(u-6,m?Cu:oe,Xr+Math.floor((x-.66)*55));y>=Xr&&(n.cvlo=Xr,n.cvhi=y,n.lake=je(t/200,e/200,i+71,2)>.52)}return n}function Lu(i,t,e,n){const s=i.h,r=i.d;switch(i.biome){case Pt.OCEAN:return[r>.62?_.GRAVEL:r<.32?_.CLAY:_.SAND,_.SAND,3,_.STONE,0,_.STONE];case Pt.BEACH:return[_.SAND,_.SAND,4,_.SANDSTONE,3,_.STONE];case Pt.COAST:return[_.GRAVEL,_.STONE,2,_.STONE,0,_.STONE];case Pt.MEADOW:return[_.FLOWERS,_.DIRT,3,_.STONE,0,_.STONE];case Pt.SNOW:return[_.SNOW,_.DIRT,3,_.STONE,0,_.STONE];case Pt.MOUNTAINS:return s>te+44?[_.SNOW,_.STONE,1,_.STONE,0,_.STONE]:s<te+26?[_.GRASS,_.DIRT,2,_.STONE,0,_.STONE]:[r>.6?_.GRAVEL:_.STONE,_.STONE,1,_.STONE,0,_.STONE];case Pt.DESERT:return[_.SAND,_.SAND,4,_.SANDSTONE,3,_.STONE];case Pt.SWAMP:return[jt(e,n,t+8)<.4?_.MUD:_.GRASS,_.MUD,2,_.DIRT,2,_.STONE];case Pt.VOLCANO:return[r>.74||je(e/14,n/14,t+9,2)>.7?_.MAGMA:_.BASALT,_.BASALT,4,_.STONE,0,_.STONE];case Pt.MUSHROOM:return[_.MYCEL,_.DIRT,3,_.STONE,0,_.STONE];case Pt.CRYSTAL:return[r>.55?_.GRAVEL:_.STONE,_.STONE,1,_.STONE,0,_.STONE];default:return[_.GRASS,_.DIRT,3,_.STONE,0,_.STONE]}}const Ln=[];Ln[Pt.PLAINS]=["oak",.004];Ln[Pt.FOREST]=["oak",.035];Ln[Pt.MEADOW]=["oak",.002];Ln[Pt.TAIGA]=["spruce",.03];Ln[Pt.SNOW]=["spruce",.008];Ln[Pt.MOUNTAINS]=["spruce",.006];Ln[Pt.JUNGLE]=["jungle",.045];Ln[Pt.SWAMP]=["oak",.012];Ln[Pt.DESERT]=["cactus",.006];Ln[Pt.MUSHROOM]=["mushroom",.012];Ln[Pt.CRYSTAL]=["spire",.012];const Vx=new Set([_.GRASS,_.DIRT,_.SNOW,_.FLOWERS,_.MUD,_.MYCEL,_.SAND,_.STONE,_.GRAVEL]),kn=3,Xn=F+2*kn,ja=Array.from({length:Xn*Xn},()=>({}));function Wx(i,t,e,n){const s=t*F,r=e*F;for(let h=0;h<Xn;h++)for(let u=0;u<Xn;u++)vi(i,s+u-kn,r+h-kn,ja[h*Xn+u]);let a=te;const o=(h,u,f)=>h+f*F+u*F*F;for(let h=0;h<F;h++)for(let u=0;u<F;u++){const f=ja[(h+kn)*Xn+u+kn],d=f.h,g=s+u,v=r+h,[m,p,x,y,M,C]=Lu(f,i,g,v);for(let A=0;A<=d;A++){const w=d-A;n[o(u,A,h)]=A===0?_.STONE:w===0?m:w<=x?p:w<=x+M?y:C}for(let A=d+1;A<=te;A++)n[o(u,A,h)]=A===te&&f.t<.16&&f.biome!==Pt.SWAMP?_.ICE:_.WATER;d>a&&(a=d)}for(let h=0;h<F;h++)for(let u=0;u<F;u++){const f=ja[(h+kn)*Xn+u+kn];for(let d=f.t0lo;d<=f.t0hi;d++)n[o(u,d,h)]=_.AIR;for(let d=f.t1lo;d<=f.t1hi;d++)n[o(u,d,h)]=_.AIR;if(f.cvhi>=0){for(let d=f.cvlo;d<=f.cvhi;d++)n[o(u,d,h)]=_.AIR;if(f.lake)n[o(u,Gx,h)]=_.WATER;else if(jt(s+u,r+h,i+72)<(f.biome===Pt.CRYSTAL?.22:.04)){const d=1+Math.floor(jt(s+u,r+h,i+73)*3);for(let g=Xr;g<Xr+d&&g<=f.cvhi;g++)n[o(u,g,h)]=_.CRYSTAL}}}const l=(h,u,f,d,g,v)=>{for(let m=0;m<u;m++){const p=C=>jt(t*31+m*7+C,e*17-m,i+v);let x=Math.floor(p(1)*F),y=Math.floor(p(2)*F),M=f+Math.floor(p(3)*(d-f));for(let C=0;C<g;C++){const A=o(x,M,y);n[A]===_.STONE&&(n[A]=h);const w=Math.floor(p(4+C)*6),L=w&1?1:-1;w<2?x=Math.max(0,Math.min(F-1,x+L)):w<4?y=Math.max(0,Math.min(F-1,y+L)):M=Math.max(1,Math.min(oe-1,M+L))}}};l(_.COAL,16,6,70,6,80),l(_.COPPER,9,4,44,5,81),l(_.IRON,7,2,30,4,82),l(_.CRYSTAL,2,2,14,3,83);const c=(h,u,f,d,g)=>{if(h<0||h>=F||f<0||f>=F||u<1||u>=oe)return;const v=o(h,u,f);(g||n[v]===_.AIR)&&(n[v]=d,u>a&&(a=u))};for(let h=0;h<Xn;h++)for(let u=0;u<Xn;u++){const f=ja[h*Xn+u],d=Ln[f.biome];if(!d||f.open||f.h<=te)continue;const g=s+u-kn,v=r+h-kn;if(jt(g,v,i+99)>=d[1])continue;const m=u-kn,p=h-kn,x=f.h,y=jt(g,v,i+7),M=Lu(f,i,g,v)[0];if(Vx.has(M))if(d[0]==="cactus"){if(M!==_.SAND)continue;const C=1+Math.floor(y*3);for(let A=1;A<=C;A++)c(m,x+A,p,_.CACTUS)}else if(d[0]==="spire"){const C=2+Math.floor(y*4);for(let A=1;A<=C;A++)c(m,x+A,p,_.CRYSTAL);c(m+(y<.5?1:-1),x+1,p,_.CRYSTAL)}else if(d[0]==="mushroom"){const C=4+Math.floor(y*3);for(let A=1;A<=C;A++)c(m,x+A,p,_.STEM,!0);for(let A=-2;A<=2;A++)for(let w=-2;w<=2;w++){const L=Math.abs(w)===2&&Math.abs(A)===2;L||c(m+w,x+C+1,p+A,_.SHROOM),!L&&(Math.abs(w)===2||Math.abs(A)===2)&&c(m+w,x+C,p+A,_.SHROOM)}}else if(d[0]==="spruce"){const C=6+Math.floor(y*4),A=x+C+1;for(let w=1;w<=C;w++)c(m,x+w,p,_.SPRUCE,!0);for(let w=x+3;w<=A;w++){const L=Math.min(3,Math.floor((A-w)/2.2+(w%2?.4:0)));for(let T=-L;T<=L;T++)for(let b=-L;b<=L;b++)b*b+T*T<=L*L+.5&&c(m+b,w,p+T,_.NEEDLES)}}else if(d[0]==="jungle"){const C=8+Math.floor(y*5);for(let A=1;A<=C;A++)c(m,x+A,p,_.WOOD,!0);for(let A=-1;A<=1;A++){const w=A===1?2:3;for(let L=-w;L<=w;L++)for(let T=-w;T<=w;T++)T*T+L*L>w*w+1||w===3&&jt(g+T,v+L+A,i+3)<.25||c(m+T,x+C+A,p+L,_.JLEAVES)}}else{const C=4+Math.floor(y*3);for(let A=1;A<=C;A++)c(m,x+A,p,_.WOOD,!0);for(let A=C-2;A<=C+1;A++){const w=A>=C?1:2;for(let L=-w;L<=w;L++)for(let T=-w;T<=w;T++)w===2&&Math.abs(T)===2&&Math.abs(L)===2&&jt(g+T,v+L+A,i+3)<.5||c(m+T,x+A,p+L,_.LEAVES)}}}return Math.min(oe-1,a)}const Du=24,Pu=4096,Hr={[_.SWITCH]:"switch",[_.SWITCH_ON]:"switch",[_.WIRE]:"wire",[_.SENDER]:"sender",[_.RELAY]:"relay",[_.RECEIVER]:"receiver",[_.RECEIVER_ON]:"receiver",[_.SIGLAMP]:"machine",[_.SIGLAMP_ON]:"machine",[_.GATE]:"machine",[_.GATE_OPEN]:"machine"},Rl=new Set(Object.keys(Hr).map(Number)),Iu={[_.RECEIVER]:_.RECEIVER_ON,[_.SIGLAMP]:_.SIGLAMP_ON,[_.GATE]:_.GATE_OPEN},Xx={[_.RECEIVER_ON]:_.RECEIVER,[_.SIGLAMP_ON]:_.SIGLAMP,[_.GATE_OPEN]:_.GATE},$x=(i,t,e)=>i+","+t+","+e,qx=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];function Kx(i){const t=new Set,e=new Set,n=new Set,s=new Map,r=[],a=[];for(const[g,v]of i){const m=Hr[v[3]];(m==="relay"||m==="receiver")&&a.push(g),v[3]===_.SWITCH_ON&&(e.add(g),r.push(g))}let o=0,l=0,c=0,h=0,u=0;const f=Du*Du;let d=0;for(;d<r.length&&!(++o>Pu);){const g=r[d++],v=i.get(g),m=Hr[v[3]];if(m==="sender"||m==="relay"){const p=s.get(g);for(const x of a){if(x===g)continue;const y=i.get(x),M=y[0]-v[0],C=y[1]-v[1],A=y[2]-v[2];if(M*M+C*C+A*A>f)continue;const w=Hr[y[3]];w==="relay"&&!n.has(x)?(n.add(x),s.set(x,p),r.push(x)):w==="receiver"&&!e.has(x)&&(e.add(x),t.add(x),c++,r.push(x),l=Math.max(l,Math.hypot(y[0]-p[0],y[1]-p[1],y[2]-p[2])))}continue}for(const[p,x,y]of qx){const M=$x(v[0]+p,v[1]+x,v[2]+y),C=i.get(M);if(!C)continue;const A=Hr[C[3]];A==="wire"&&!e.has(M)?(e.add(M),r.push(M)):A==="sender"&&!n.has(M)?(n.add(M),s.set(M,C),u++,r.push(M)):A==="machine"&&!t.has(M)&&(t.add(M),h++)}}return{on:t,receivers:c,machines:h,senders:u,reach:l,capped:o>Pu}}const na=160,Fn=20,Ic=4,Yx=new Set([Pt.PLAINS,Pt.FOREST,Pt.MEADOW,Pt.TAIGA,Pt.SNOW,Pt.DESERT]),jx=[{key:"bauer",name:"Bäuerin Frieda"},{key:"schmied",name:"Schmied Kalle"},{key:"funker",name:"Funkerin Lotte"},{key:"hirte",name:"Hirte Mats"}],Zx=[[0,-1],[1,0],[0,1],[-1,0]],Cr=new Map;function dd(i,t){if(Cr.has(i))return Cr.get(i);const e=t();return Cr.size>512&&Cr.clear(),Cr.set(i,e),e}const Rn=i=>Math.floor(i/na);function ua(i,t,e){return dd(`v${i},${t},${e}`,()=>{if(jt(t,e,i+500)>.75)return null;const n=t*na+40+Math.floor(jt(t,e,i+501)*80),s=e*na+40+Math.floor(jt(t,e,i+502)*80),r={};vi(i,n,s,r);const a=r.h,o=r.biome;if(!Yx.has(o)||a<te+2||a>te+22)return null;let l=a,c=a;for(let g=-Fn-2;g<=Fn+2;g+=4)for(let v=-Fn-2;v<=Fn+2;v+=4)if(!(v*v+g*g>(Fn+2)*(Fn+2))){if(vi(i,n+v,s+g,r),r.h<=te+1||r.biome===Pt.SWAMP||r.biome===Pt.VOLCANO)return null;l=Math.min(l,r.h),c=Math.max(c,r.h)}if(c-l>9)return null;const h=3+(jt(t,e,i+503)<.5?1:0),u=[];for(let g=0;g<h;g++){const[v,m]=Zx[g],p=n+v*11,x=s+m*11;u.push({x:p,z:x,dx:v,dz:m,door:{x:p-v*3,z:x-m*3},front:{x:p-v*5,z:x-m*5},role:jx[g]})}const f=o===Pt.DESERT,d=o===Pt.SNOW||o===Pt.TAIGA;return{id:t+","+e,x:n,z:s,y:a,biome:o,houses:u,field:{x0:n+6,z0:s-12,x1:n+12,z1:s-6},mast:{x:n-9,z:s+9},top:f?_.SAND:o===Pt.SNOW?_.SNOW:_.GRASS,wall:f?_.SANDSTONE:d?_.SPRUCE:_.PLANKS,roof:f?_.SANDSTONE:d?_.SPRUCE:_.BRICK,post:d?_.SPRUCE:_.WOOD}})}function Jx(i,t){switch(t.role.key){case"bauer":return{x:i.field.x0-1.5,z:(i.field.z0+i.field.z1)/2+.5};case"funker":return{x:i.mast.x+2.5,z:i.mast.z+.5};case"hirte":return{x:i.x-8.5,z:i.z-8.5};default:return{x:t.front.x+.5+t.dz*2,z:t.front.z+.5+t.dx*2}}}function Qx(i,t,e){return dd(`m${i},${t},${e}`,()=>{if(jt(t,e,i+600)>.5)return null;const n=t*na+40+Math.floor(jt(t,e,i+601)*80),s=e*na+40+Math.floor(jt(t,e,i+602)*80),r=10+Math.floor(jt(t,e,i+603)*8),a=18+Math.floor(jt(t,e,i+604)*12);return vi(i,n,s,{}).h<r+12?null:{x:n,y:r,z:s,L:a}})}function pd(i,t=0,e=0,n=2){const s=Rn(t),r=Rn(e);let a=null,o=1/0;for(let l=r-n;l<=r+n;l++)for(let c=s-n;c<=s+n;c++){const h=ua(i,c,l);if(!h)continue;const u=Math.hypot(h.x-t,h.z-e);u<o&&(o=u,a=h)}return a}function t1(i,t,e,n,s,r){const a=t*F,o=e*F,l=Rn(a),c=Rn(o);let h=s;const u=(y,M,C)=>y-a+(C-o)*F+M*F*F,f=(y,M)=>y>=a&&y<a+F&&M>=o&&M<o+F,d=(y,M,C,A)=>{!f(y,C)||M<1||M>=oe||(n[u(y,M,C)]=A,A&&M>h&&(h=M),A===_.RADIO&&r&&r(y,M,C,A))},g=(y,M,C)=>f(y,C)&&M>=0&&M<oe?n[u(y,M,C)]:_.AIR,v=(y,M,C,A)=>C>=a&&y<a+F&&A>=o&&M<o+F,m=Qx(i,l,c);m&&v(m.x-m.L-2,m.z-m.L-2,m.x+m.L+2,m.z+m.L+2)&&e1(i,m,a,o,d,g);const p=ua(i,l,c),x=Fn+Ic;return p&&v(p.x-x,p.z-x,p.x+x,p.z+x)&&n1(i,p,a,o,d,g),h}function e1(i,t,e,n,s,r){const a={},o=(c,h,u,f)=>{if(c<e||c>=e+F||h<n||h>=n+F||vi(i,c,h,a).h<t.y+5)return;const d=f==="x"?h-t.z:c-t.x;for(let g=t.y;g<=t.y+2;g++)r(c,g,h)!==_.WATER&&s(c,g,h,_.AIR);r(c,t.y-1,h)===_.AIR&&s(c,t.y-1,h,_.PLANKS),u%5===0&&(d!==0&&(s(c,t.y,h,_.WOOD),s(c,t.y+1,h,_.WOOD)),s(c,t.y+2,h,d===0&&u%10===0&&jt(c,h,i+605)<.5?_.LAMP:_.PLANKS))},l=(c,h)=>{if(c<e||c>=e+F||h<n||h>=n+F||r(c,t.y+1,h)!==_.STONE)return;const u=jt(c,h,i+606);u<.07&&s(c,t.y+1,h,u<.035?_.COAL:u<.055?_.COPPER:_.IRON)};for(let c=-t.L;c<=t.L;c++){for(let h=-1;h<=1;h++)o(t.x+c,t.z+h,Math.abs(c),"x"),o(t.x+h,t.z+c,Math.abs(c),"z");l(t.x+c,t.z-2),l(t.x+c,t.z+2),l(t.x-2,t.z+c),l(t.x+2,t.z+c)}for(let c=-2;c<=2;c++)for(let h=-2;h<=2;h++){const u=t.x+h,f=t.z+c;if(!(u<e||u>=e+F||f<n||f>=n+F))for(let d=t.y;d<=t.y+3;d++)s(u,d,f,_.AIR)}s(t.x+2,t.y,t.z+2,_.FURNACE),s(t.x-2,t.y,t.z+2,_.WORKBENCH)}function n1(i,t,e,n,s,r){const a={},o=t.y,l=Fn+Ic;for(let f=n;f<n+F;f++)for(let d=e;d<e+F;d++){const g=Math.hypot(d-t.x,f-t.z);if(g>l)continue;const v=vi(i,d,f,a).h,m=g<=Fn?o:Math.round(o+(v-o)*(g-Fn)/Ic);for(let p=Math.min(v+1,m-3);p<m;p++)s(d,p,f,_.DIRT);s(d,m,f,t.top);for(let p=m+1,x=Math.min(oe-1,Math.max(v,m)+18);p<=x;p++)r(d,p,f)!==_.AIR&&s(d,p,f,_.AIR)}const c=(f,d,g,v,m,p,x)=>{for(let y=d;y<=m;y++)for(let M=Math.max(g,n);M<=Math.min(p,n+F-1);M++)for(let C=Math.max(f,e);C<=Math.min(v,e+F-1);C++)s(C,y,M,x)};c(t.x-3,o,t.z-3,t.x+3,o,t.z+3,_.PATH);for(const f of t.houses){const d=Math.min(t.x,f.front.x),g=Math.max(t.x,f.front.x),v=Math.min(t.z,f.front.z),m=Math.max(t.z,f.front.z);c(d,o,v,g,o,m,_.PATH),c(f.front.x,o,f.front.z,f.door.x,o,f.door.z,_.PATH)}c(t.x-1,o,t.z-1,t.x+1,o+1,t.z+1,_.COBBLE),c(t.x,o-1,t.z,t.x,o,t.z,_.WATER),s(t.x,o+1,t.z,_.AIR);for(const[f,d]of[[-4,-4],[4,-4],[4,4],[-4,4]])c(t.x+f,o+1,t.z+d,t.x+f,o+2,t.z+d,t.post),s(t.x+f,o+3,t.z+d,_.LAMP);for(const f of t.houses){c(f.x-3,o,f.z-3,f.x+3,o,f.z+3,_.COBBLE),c(f.x-2,o,f.z-2,f.x+2,o,f.z+2,_.PLANKS);for(let m=-3;m<=3;m++)for(let p=-3;p<=3;p++){const x=Math.abs(p)===3||Math.abs(m)===3,y=Math.abs(p)===3&&Math.abs(m)===3;for(let C=o+1;C<=o+4;C++)s(f.x+p,C,f.z+m,y?t.post:x?t.wall:_.AIR);(Math.abs(p)===3&&m===0||Math.abs(m)===3&&p===0)&&!(p===-f.dx*3&&m===-f.dz*3)&&s(f.x+p,o+2,f.z+m,_.GLASS)}s(f.door.x,o+1,f.door.z,_.AIR),s(f.door.x,o+2,f.door.z,_.AIR);for(let m=0;m<=4;m++)c(f.x-4+m,o+5+m,f.z-4+m,f.x+4-m,o+5+m,f.z+4-m,t.roof);s(f.x,o+4,f.z,_.LAMP);const d=f.x+f.dx*2+(f.dz?2:0),g=f.z+f.dz*2+(f.dx?2:0),v={bauer:_.WORKBENCH,schmied:_.FURNACE,funker:_.RADIO,hirte:_.WOOL}[f.role.key];if(s(d,o+1,g,v),f.role.key==="schmied"){const m=f.front.x+f.dz*3,p=f.front.z+f.dx*3;s(m,o+1,p,_.FURNACE),s(m,o+2,p,_.COBBLE)}}const h=t.field,u=h.z0+h.z1>>1;for(let f=h.z0;f<=h.z1;f++)for(let d=h.x0;d<=h.x1;d++){if(f===u){s(d,o,f,_.WATER);continue}s(d,o,f,_.FARMLAND),s(d,o+1,f,jt(d,f,i+510)<.7?_.WHEAT3:_.WHEAT2)}c(t.mast.x,o+1,t.mast.z,t.mast.x,o+7,t.mast.z,t.post),s(t.mast.x,o+8,t.mast.z,_.LAMP),s(t.mast.x+1,o+1,t.mast.z,_.RADIO)}const md=3,gd=i=>i===2||i===3?i:1,_d=52;function ho(i,t,e){const n=je(t/110,e/110,i,4),s=je(t/24,e/24,i+5,2),r=Math.floor(10+n*44+(s-.5)*5);return Math.max(2,Math.min(_d,r))}function Di(i,t){return(i+32768)*65536+(t+32768)}class Nu{constructor(t,e,n=1){this.seed=t|0,this.gen=gd(n),this.chunks=new Map,this.edits=e||new Map,this.dirty=new Set,this.radios=new Map,this.sig=new Map,this.sigDirty=!1,this.onSet=null}getChunk(t,e){return this.chunks.get(Di(t,e))}ensure(t,e){const n=Di(t,e);let s=this.chunks.get(n);return s||(s=this.generate(t,e,n),this.chunks.set(n,s)),s}generate(t,e,n){const s=new Uint8Array(F*F*oe);let r=this.gen>=2?Wx(this.seed,t,e,s):this.generate1(t,e,s);return this.gen===3&&(r=t1(this.seed,t,e,s,r,(a,o,l)=>this.radios.set(`${a},${o},${l}`,[a,o,l]))),this.finish(t,e,n,s,r)}generate1(t,e,n){const s=this.seed;let r=0;for(let a=0;a<F;a++)for(let o=0;o<F;o++){const l=t*F+o,c=e*F+a,h=ho(s,l,c),u=h<=te+1;for(let d=0;d<=h;d++){let g;d===0||d<h-3?g=_.STONE:u?g=_.SAND:d<h?g=_.DIRT:g=h>=46?_.STONE:_.GRASS,n[o+a*F+d*F*F]=g}for(let d=h+1;d<=te;d++)n[o+a*F+d*F*F]=_.WATER;const f=Math.max(h,h<te?te:0);f>r&&(r=f)}for(let a=2;a<F-2;a++)for(let o=2;o<F-2;o++){const l=t*F+o,c=e*F+a;if(jt(l,c,s+99)>=.012)continue;const h=ho(s,l,c);if(h<=te+1||h>=44||n[o+a*F+h*F*F]!==_.GRASS)continue;const u=4+Math.floor(jt(l,c,s+7)*3);for(let f=1;f<=u;f++)n[o+a*F+(h+f)*F*F]=_.WOOD;for(let f=u-2;f<=u+1;f++){const d=f>=u?1:2;for(let g=-d;g<=d;g++)for(let v=-d;v<=d;v++){if(d===2&&Math.abs(v)===2&&Math.abs(g)===2&&jt(l+v,c+g+f,s+3)<.5)continue;const m=o+v+(a+g)*F+(h+f)*F*F;n[m]===_.AIR&&(n[m]=_.LEAVES)}}h+u+1>r&&(r=h+u+1)}return r}finish(t,e,n,s,r){const a=this.edits.get(n);if(a)for(const[o,l]of a){const c=o/(F*F)|0;s[o]===_.RADIO&&l!==_.RADIO&&this.radios.delete(`${t*F+(o&15)},${c},${e*F+(o>>4&15)}`),s[o]=l,c>r&&(r=c);const h=t*F+(o&15),u=e*F+(o>>4&15);l===_.RADIO&&this.radios.set(`${h},${c},${u}`,[h,c,u]),Rl.has(l)?(this.sig.set(`${h},${c},${u}`,[h,c,u,l]),this.sigDirty=!0):this.sig.delete(`${h},${c},${u}`)&&(this.sigDirty=!0)}return{cx:t,cz:e,key:n,data:s,maxY:r,hm:null,opaque:null,trans:null,logo:null,meshed:!1}}getBlock(t,e,n){if(e<0)return _.STONE;if(e>=oe)return _.AIR;const s=this.chunks.get(Di(t>>4,n>>4));return s?s.data[(t&15)+(n&15)*F+e*F*F]:_.AIR}isLoaded(t,e){return this.chunks.has(Di(t>>4,e>>4))}isSolid(t,e,n){if(e<0)return!0;if(e>=oe)return!1;const s=this.chunks.get(Di(t>>4,n>>4));return s?ta[s.data[(t&15)+(n&15)*F+e*F*F]]===1:!0}setBlock(t,e,n,s){if(e<0||e>=oe)return!1;const r=t>>4,a=n>>4,o=this.chunks.get(Di(r,a));if(!o)return!1;const l=t&15,c=n&15,h=l+c*F+e*F*F,u=o.data[h];if(u===s)return!1;o.data[h]=s,u===_.RADIO&&this.radios.delete(`${t},${e},${n}`),s===_.RADIO&&this.radios.set(`${t},${e},${n}`,[t,e,n]),Rl.has(s)?(this.sig.set(`${t},${e},${n}`,[t,e,n,s]),this.sigDirty=!0):Rl.has(u)&&(this.sig.delete(`${t},${e},${n}`),this.sigDirty=!0),e>o.maxY&&(o.maxY=e),o.hm=null;let f=this.edits.get(o.key);f||(f=new Map,this.edits.set(o.key,f)),f.set(h,s),this.dirty.add(o);const d=l===0?-1:l===F-1?1:0,g=c===0?-1:c===F-1?1:0;for(let v=Math.min(0,g);v<=Math.max(0,g);v++)for(let m=Math.min(0,d);m<=Math.max(0,d);m++)if(m||v){const p=this.chunks.get(Di(r+m,a+v));p&&this.dirty.add(p)}return this.onSet&&this.onSet(t,e,n,s),!0}heightmap(t){if(t.hm)return t.hm;const e=new Uint8Array(F*F),n=t.data;for(let s=0;s<F*F;s++)for(let r=Math.min(oe-1,t.maxY);r>=0;r--)if(cd[n[s+r*F*F]]){e[s]=r+1;break}return t.hm=e}neighborhood(t){const e=new Array(9);for(let n=-1;n<=1;n++)for(let s=-1;s<=1;s++){const r=this.chunks.get(Di(t.cx+s,t.cz+n));if(!r)return null;e[(n+1)*3+s+1]=r.data}return e}findSpawn(t=!0){if(this.gen===3&&t){const e=pd(this.seed);if(e)return this.ensure(e.x>>4,e.z+3>>4),{x:e.x+.5,y:e.y+1.01,z:e.z+3.5}}if(this.gen>=2){const e=this.findSpawn2();if(e)return e}for(let e=0;e<60;e++)for(let n=0;n<Math.max(1,e*8);n++){const s=n/Math.max(1,e*8)*Math.PI*2,r=Math.round(Math.cos(s)*e*4),a=Math.round(Math.sin(s)*e*4),o=ho(this.seed,r,a);if(o<=te+1||o>=44)continue;const l=this.ensure(r>>4,a>>4);let c=oe-1;for(;c>0&&l.data[(r&15)+(a&15)*F+c*F*F]===_.AIR;)c--;const h=l.data[(r&15)+(a&15)*F+c*F*F];if(!(h===_.WOOD||h===_.LEAVES||h===_.WATER))return{x:r+.5,y:c+1.01,z:a+.5}}return{x:.5,y:_d+2,z:.5}}findSpawn2(){const t={};for(let e=0;e<120;e++){const n=Math.max(1,e*8);for(let s=0;s<n;s++){const r=s/n*Math.PI*2,a=Math.round(Math.cos(r)*e*8),o=Math.round(Math.sin(r)*e*8);if(vi(this.seed,a,o,t),!Bx.includes(t.biome)||t.h<te+2||t.h>te+18)continue;const l=this.ensure(a>>4,o>>4);let c=oe-1;for(;c>0&&l.data[(a&15)+(o&15)*F+c*F*F]===_.AIR;)c--;const h=l.data[(a&15)+(o&15)*F+c*F*F];if(!(h!==_.GRASS&&h!==_.FLOWERS)&&!(l.data[(a&15)+(o&15)*F+(c+1)*F*F]!==_.AIR||l.data[(a&15)+(o&15)*F+(c+2)*F*F]!==_.AIR))return{x:a+.5,y:c+1.01,z:o+.5}}}return null}biomeAt(t,e){return this.gen<2?-1:vi(this.seed,Math.floor(t),Math.floor(e),{}).biome}villageAt(t,e){if(this.gen!==3)return null;const n=ua(this.seed,Rn(Math.floor(t)),Rn(Math.floor(e)));return n&&Math.hypot(n.x+.5-t,n.z+.5-e)<=Fn+4?n:null}}const Oo=3,vd=2,i1=["survival","creative","story"],Wi=i=>"klotzfunk.world."+i,Uo=i=>"klotzfunk.meta."+i,ui=i=>"klotzfunk-bak.world."+i,Ys=i=>"klotzfunk-bak.time."+i,s1=10*60*1e3,ko=()=>{try{return globalThis.localStorage||null}catch{return null}},xi=i=>{try{return ko().getItem(i)}catch{return null}},mr=i=>{try{return i?JSON.parse(i):null}catch{return null}};function xd(i){const t={};for(const[e,n]of i){if(!n.size)continue;const s=new Uint8Array(n.size*3);let r=0;for(const[o,l]of n)s[r++]=o&255,s[r++]=o>>8,s[r++]=l;let a="";for(let o=0;o<s.length;o+=8192)a+=String.fromCharCode.apply(null,s.subarray(o,o+8192));t[e]=btoa(a)}return t}function r1(i){const t=new Map;if(!i||typeof i!="object")return t;for(const e of Object.keys(i)){const n=i[e],s=new Map;if(Array.isArray(n))for(let a=0;a+1<n.length;a+=2)Number.isInteger(n[a])&&Number.isInteger(n[a+1])&&s.set(n[a],n[a+1]&255);else if(typeof n=="string"){let a="";try{a=atob(n)}catch{continue}for(let o=0;o+2<a.length;o+=3)s.set(a.charCodeAt(o)|a.charCodeAt(o+1)<<8,a.charCodeAt(o+2))}const r=Number(e);s.size&&Number.isFinite(r)&&t.set(r,s)}return t}function fa(i){return!!i&&typeof i=="object"&&Number.isFinite(i.seed)&&i1.includes(i.mode)&&typeof i.name=="string"&&(i.edits===void 0||typeof i.edits=="object"&&i.edits!==null)}function Md(i){return mr(xi(Uo(i)))}function yd(i){const t=mr(xi(Wi(i)));return fa(t)?t:null}function Sd(i){const t=mr(xi(ui(i)));return fa(t)?t:null}function a1(i){return xi(ui(i))!==null}const Ed=i=>({name:i.name,mode:i.mode,seed:i.seed,gen:i.gen||1,savedAt:i.savedAt,q:i.story?i.story.done?-1:i.story.i:void 0,qc:i.story?i.story.c:void 0});function bd(i,t){const e=ko();if(!e)return!1;let n;try{n=JSON.stringify(t)}catch{return!1}const s=xi(Wi(i)),r=Date.now();if(s&&s!==n&&r-(Number(xi(Ys(i)))||0)>s1&&fa(mr(s)))try{e.setItem(ui(i),s),e.setItem(Ys(i),String(r))}catch{try{e.removeItem(ui(i)),e.removeItem(Ys(i))}catch{}}try{e.setItem(Wi(i),n)}catch{try{for(let o=0;o<Oo;o++)e.removeItem(ui(o)),e.removeItem(Ys(o));e.setItem(Wi(i),n)}catch{return!1}}try{e.setItem(Uo(i),JSON.stringify(Ed(t)))}catch{}return!0}function o1(i){const t=ko();if(t)for(const e of[Wi(i),Uo(i),ui(i),Ys(i)])try{t.removeItem(e)}catch{}}function Td(i){const t=ko(),e=xi(ui(i)),n=mr(e);if(!t||!fa(n))return!1;const s=xi(Wi(i));try{t.setItem(Wi(i),e),s?t.setItem(ui(i),s):t.removeItem(ui(i)),t.setItem(Ys(i),String(Date.now())),t.setItem(Uo(i),JSON.stringify(Ed(n)))}catch{return!1}return!0}function l1(i){return JSON.stringify({format:"klotzfunk-world",version:vd,exportedAt:Date.now(),save:i})}function c1(i){const t=mr(i);if(!t)return null;const e=t.format==="klotzfunk-world"?t.save:t;return fa(e)?(e.name=e.name.slice(0,40),e):null}function Ad(){for(let i=0;i<Oo;i++)if(xi(Wi(i))===null)return i;return-1}const wd="klotzfunk.settings",Nc={eco:{name:"Eco",dpr:.75,view:3,clouds:!1,budget:3},mobile:{name:"Mobil",dpr:1.25,view:4,clouds:!0,budget:4},standard:{name:"Standard",dpr:1.5,view:6,clouds:!0,budget:6},high:{name:"Hoch",dpr:2,view:9,clouds:!0,budget:8}},Gr={quality:"auto",mouseSens:1,touchSens:1,joySens:1,btnScale:1,lefty:!1,invertY:!1,placeDelay:!0,sfxVol:.8,musicVol:.8,ambVol:.7,showFps:!1,deathLoss:"keep",enemies:!0,preview:!0,stun:!0,mpName:"",minimap:!0,keys:{},padKeys:{},padSens:1,padRumble:.8,padDead:.18,padInvertY:!1,touchPos:{}};function h1(){let i={};try{i=JSON.parse(globalThis.localStorage.getItem(wd))||{}}catch{i={}}const t={...Gr};for(const e of Object.keys(Gr))i[e]!==void 0&&typeof i[e]==typeof Gr[e]&&i[e]===null==(Gr[e]===null)&&(t[e]=i[e]);return t.quality!=="auto"&&!Nc[t.quality]&&(t.quality="auto"),["keep","grave"].includes(t.deathLoss)||(t.deathLoss="keep"),t}function ji(i){try{return globalThis.localStorage.setItem(wd,JSON.stringify(i)),!0}catch{return!1}}function u1(i){return i?"mobile":"standard"}const Zi=1e3,Te=[],tt={},So=[],Cn=[{key:"WOOD",name:"Holz",speed:2,dur:60,col:"#b48a52"},{key:"STONE",name:"Stein",speed:3,dur:140,col:"#8c8c94"},{key:"COPPER",name:"Kupfer",speed:4,dur:220,col:"#d8803c"},{key:"IRON",name:"Eisen",speed:6,dur:360,col:"#dcdce4"}],Rd=[{key:"PICK",kind:"spitzhacke",name:"spitzhacke"},{key:"AXE",kind:"axt",name:"axt"},{key:"SHOVEL",kind:"schaufel",name:"schaufel"}];function ze(i,t,e,n){if(Te[i])throw new Error("Item-Id doppelt: "+i);const s={id:i,key:t,name:e,cat:"items",icon:So.length,food:0,tool:null,...n};return Te[i]=s,tt[t]=i,So.push(i),s}ze(1e3,"STICK","Stock",{draw:"stick"});ze(1001,"COPPER_INGOT","Kupferbarren",{draw:"ingot",col:"#d8803c"});ze(1002,"IRON_INGOT","Eisenbarren",{draw:"ingot",col:"#dcdce4"});ze(1003,"APPLE","Apfel",{draw:"apple",food:4});ze(1004,"MEAT_RAW","Rohes Fleisch",{draw:"meat",col:"#e0605a",food:2});ze(1005,"MEAT_COOKED","Braten",{draw:"meat",col:"#9a5a2a",food:7});Cn.forEach((i,t)=>Rd.forEach((e,n)=>{ze(1010+t*3+n,i.key+"_"+e.key,i.name+e.name,{draw:e.kind,col:i.col,tool:{kind:e.kind,tier:t+1,speed:i.speed,dur:i.dur}})}));ze(1022,"WOOD_HOE","Holzhacke",{draw:"hacke",col:Cn[0].col,tool:{kind:"hacke",tier:1,speed:1,dur:Cn[0].dur}});ze(1023,"STONE_HOE","Steinhacke",{draw:"hacke",col:Cn[1].col,tool:{kind:"hacke",tier:2,speed:1,dur:Cn[1].dur}});ze(1024,"SEEDS","Weizensamen",{draw:"seeds",plant:_.WHEAT0});ze(1025,"WHEAT","Weizen",{draw:"wheat"});ze(1026,"BREAD","Brot",{draw:"bread",food:6});Cn.forEach((i,t)=>ze(1027+t,i.key+"_SWORD",i.name+"schwert",{draw:"schwert",col:i.col,tool:{kind:"schwert",tier:t+1,speed:1,dur:i.dur,dmg:3+t}}));ze(1031,"COPPER_HELMET","Kupferhelm",{draw:"helm",col:Cn[2].col,armor:{slot:"kopf",pts:2,dur:60}});ze(1032,"COPPER_CHEST","Kupferharnisch",{draw:"harnisch",col:Cn[2].col,armor:{slot:"brust",pts:3,dur:80}});ze(1033,"IRON_HELMET","Eisenhelm",{draw:"helm",col:Cn[3].col,armor:{slot:"kopf",pts:3,dur:110}});ze(1034,"IRON_CHEST","Eisenharnisch",{draw:"harnisch",col:Cn[3].col,armor:{slot:"brust",pts:5,dur:150}});ze(1035,"BOAT","Boot",{draw:"boot",col:"#a87a46",vehicle:"boot"});ze(1036,"MINECART","Lore",{draw:"lore",col:"#8a8c94",vehicle:"lore"});const Oi=i=>i>=Zi,Lr=i=>i>=Zi&&Te[i]&&Te[i].armor||null,Ou=i=>1-Math.min(.4,Math.max(0,i)*.05),Uu=i=>i>=Zi&&Te[i]&&Te[i].vehicle||null,Cl=i=>i>=Zi&&Te[i]&&Te[i].plant||0,ge=i=>i>=Zi?Te[i]?Te[i].name:"?":Qr[i]||"?",ki=i=>i>=Zi&&Te[i]?Te[i].tool:null,ku=i=>i>=Zi&&Te[i]?Te[i].food:0,zu=i=>!!(i>=Zi?Te[i]:Kt[i]),f1=.9;function d1(i,t){const e=Kt[i];if(!e)return .5;const n=ki(t),s=n&&e.tool===n.kind?n.speed:1;return Math.max(.12,e.hard*f1/s)}function p1(i,t){const e=Kt[i];if(!e||!e.tier)return!0;const n=ki(t);return!!n&&n.kind==="spitzhacke"&&n.tier>=e.tier}function m1(i,t){const e=Kt[i],n=ki(t);return!!(e&&n&&e.tool===n.kind)}const Xe=999,hn=[{id:"planks",give:[_.PLANKS,4],need:[[_.WOOD,1]]},{id:"planks2",give:[_.PLANKS,4],need:[[_.SPRUCE,1]]},{id:"glass",give:[_.GLASS,1],need:[[_.SAND,2]]},{id:"lamp",give:[_.LAMP,2],need:[[_.GLASS,2],[_.WOOD,1]]},{id:"lampCoal",give:[_.LAMP,2],need:[[_.COAL,1],[_.PLANKS,1]]},{id:"lampCrystal",give:[_.LAMP,4],need:[[_.CRYSTAL,1],[_.GLASS,1]]},{id:"feder",give:[_.FEDER,2],need:[[_.LEAVES,4],[_.PLANKS,1]]},{id:"turbo",give:[_.TURBO,2],need:[[_.STONE,2],[_.LAMP,1]]},{id:"turboIron",give:[_.TURBO,3],need:[[_.IRON,1],[_.STONE,2]]},{id:"wind",give:[_.WIND,2],need:[[_.GLASS,2],[_.LEAVES,2]]},{id:"radio",give:[_.RADIO,1],need:[[_.PLANKS,4],[_.LAMP,1]]},{id:"radioCopper",give:[_.RADIO,2],need:[[_.PLANKS,2],[_.COPPER,1],[_.LAMP,1]]},{id:"rainbow",give:[_.RAINBOW,2],need:[[_.GLASS,2],[_.LAMP,1]]},{id:"neonR",give:[_.NEON_R,3],need:[[_.LAMP,1],[_.SAND,1]]},{id:"neonB",give:[_.NEON_B,3],need:[[_.LAMP,1],[_.GLASS,1]]},{id:"neonG",give:[_.NEON_G,3],need:[[_.LAMP,1],[_.LEAVES,1]]},{id:"neonP",give:[_.NEON_P,3],need:[[_.LAMP,1],[_.DIRT,1]]},{id:"brick",give:[_.BRICK,4],need:[[_.DIRT,2],[_.SAND,1]]},{id:"brickClay",give:[_.BRICK,4],need:[[_.CLAY,2],[_.COAL,1]]},{id:"marble",give:[_.MARBLE,2],need:[[_.STONE,2],[_.SAND,1]]},{id:"sandstone",give:[_.SANDSTONE,2],need:[[_.SAND,4]]}];for(let i=0;i<eh;i++)hn.push({id:"logo"+(i+1),give:[_i+i,2],need:[[_.PLANKS,1]]});hn.push({id:"sticks",give:[tt.STICK,4],need:[[_.PLANKS,2]]},{id:"workbench",give:[_.WORKBENCH,1],need:[[_.PLANKS,4]]},{id:"furnace",give:[_.FURNACE,1],need:[[_.STONE,8]],st:"werkbank"});const Cd=[_.PLANKS,_.STONE,tt.COPPER_INGOT,tt.IRON_INGOT],g1=[3,3,1];Cn.forEach((i,t)=>Rd.forEach((e,n)=>{const s=tt[i.key+"_"+e.key];hn.push({id:"tool"+s,give:[s,1],need:[[Cd[t],g1[n]],[tt.STICK,2]],st:"werkbank"})}));const _1=[_.PLANKS,_.STONE];["WOOD","STONE"].forEach((i,t)=>hn.push({id:"tool"+tt[i+"_HOE"],give:[tt[i+"_HOE"],1],need:[[_1[t],2],[tt.STICK,2]],st:"werkbank"}));Cn.forEach((i,t)=>hn.push({id:"tool"+tt[i.key+"_SWORD"],give:[tt[i.key+"_SWORD"],1],need:[[Cd[t],2],[tt.STICK,1]],st:"werkbank"}));hn.push({id:"bread",give:[tt.BREAD,1],need:[[tt.WHEAT,3]]});hn.push({id:"copperHelmet",give:[tt.COPPER_HELMET,1],need:[[tt.COPPER_INGOT,5]],st:"werkbank"},{id:"copperChest",give:[tt.COPPER_CHEST,1],need:[[tt.COPPER_INGOT,8]],st:"werkbank"},{id:"ironHelmet",give:[tt.IRON_HELMET,1],need:[[tt.IRON_INGOT,5]],st:"werkbank"},{id:"ironChest",give:[tt.IRON_CHEST,1],need:[[tt.IRON_INGOT,8]],st:"werkbank"},{id:"cobble",give:[_.COBBLE,2],need:[[_.STONE,2]]},{id:"path",give:[_.PATH,2],need:[[_.GRAVEL,1],[_.DIRT,1]]});hn.push({id:"switch",give:[_.SWITCH,2],need:[[_.STONE,1],[tt.STICK,1]],st:"werkbank"},{id:"wire",give:[_.WIRE,8],need:[[tt.COPPER_INGOT,1],[_.STONE,1]],st:"werkbank"},{id:"sender",give:[_.SENDER,1],need:[[tt.COPPER_INGOT,2],[_.CRYSTAL,1],[_.RADIO,1]],st:"werkbank"},{id:"relay",give:[_.RELAY,1],need:[[tt.COPPER_INGOT,1],[_.CRYSTAL,1],[_.STONE,2]],st:"werkbank"},{id:"receiver",give:[_.RECEIVER,1],need:[[tt.COPPER_INGOT,1],[_.GLASS,1],[_.PLANKS,2]],st:"werkbank"},{id:"siglamp",give:[_.SIGLAMP,2],need:[[_.LAMP,1],[_.WIRE,1]],st:"werkbank"},{id:"gate",give:[_.GATE,2],need:[[tt.IRON_INGOT,1],[_.PLANKS,4]],st:"werkbank"});hn.push({id:"boat",give:[tt.BOAT,1],need:[[_.PLANKS,5],[tt.STICK,1]],st:"werkbank"},{id:"minecart",give:[tt.MINECART,1],need:[[tt.IRON_INGOT,3],[tt.COPPER_INGOT,2]],st:"werkbank"},{id:"rail",give:[_.RAIL,16],need:[[tt.COPPER_INGOT,3],[tt.STICK,2]],st:"werkbank"});hn.push({id:"ingotCopper",give:[tt.COPPER_INGOT,1],need:[[_.COPPER,1],[_.COAL,1]],st:"ofen"},{id:"ingotIron",give:[tt.IRON_INGOT,1],need:[[_.IRON,1],[_.COAL,1]],st:"ofen"},{id:"cook",give:[tt.MEAT_COOKED,1],need:[[tt.MEAT_RAW,1],[_.PLANKS,1]],st:"ofen"},{id:"cookCoal",give:[tt.MEAT_COOKED,4],need:[[tt.MEAT_RAW,4],[_.COAL,1]],st:"ofen"},{id:"glassOven",give:[_.GLASS,3],need:[[_.SAND,3],[_.COAL,1]],st:"ofen"});hn.push({id:"stonebrick",give:[_.STONEBRICK,4],need:[[_.STONE,4]]},{id:"smooth",give:[_.SMOOTH,2],need:[[_.STONE,2],[_.COAL,1]],st:"ofen"},{id:"darkplanks",give:[_.DARKPLANKS,4],need:[[_.SPRUCE,1],[_.COAL,1]]},{id:"birch",give:[_.BIRCH,4],need:[[_.WOOD,1],[_.SAND,1]]},{id:"roof",give:[_.ROOF,4],need:[[_.BRICK,2],[_.CLAY,1]]},{id:"books",give:[_.BOOKS,1],need:[[_.PLANKS,4],[_.WOOL,1]]},{id:"lantern",give:[_.LANTERN,2],need:[[tt.IRON_INGOT,1],[_.LAMP,1]],st:"werkbank"},{id:"copperblock",give:[_.COPPERBLOCK,1],need:[[tt.COPPER_INGOT,4]],st:"werkbank"},{id:"ironblock",give:[_.IRONBLOCK,1],need:[[tt.IRON_INGOT,4]],st:"werkbank"},{id:"hay",give:[_.HAY,1],need:[[tt.WHEAT,6]]},...[_.SNOW,_.COAL,_.MAGMA,_.COPPER,_.SANDSTONE,_.LEAVES,_.CLAY,_.CRYSTAL].map((i,t)=>({id:"concrete"+t,give:[_["CONCRETE"+t],4],need:[[_.SAND,2],[_.GRAVEL,2],[i,1]]})),...[[_.MAGMA,1],[_.CLAY,1],[_.LEAVES,1]].map((i,t)=>({id:"stained"+t,give:[_["STAINED"+t],2],need:[[_.GLASS,2],i]})),...ld.flatMap(([i,,t],e)=>[{id:"slab"+i,give:[101+e,6],need:[[t,3]]},{id:"stairs"+i,give:[109+e*4,4],need:[[t,6]]}]),{id:"fence",give:[_.FENCE,3],need:[[_.PLANKS,4],[tt.STICK,2]]},{id:"wall",give:[_.WALL,6],need:[[_.COBBLE,6]]},{id:"pane",give:[_.PANE,16],need:[[_.GLASS,6]]},{id:"door",give:[_.DOOR,2],need:[[_.PLANKS,6]]},{id:"ladder",give:[_.LADDER,3],need:[[tt.STICK,7]]});for(const i of hn)i.cat=(Te[i.give[0]]||Kt[i.give[0]]).cat;const Fu={werkbank:"Werkbank",ofen:"Schmelzofen"},v1={werkbank:"eine Werkbank",ofen:"einen Schmelzofen"},ps=(i,t)=>i[t]||0;function ih(i,t,e=Xe,n=null){const s=t.need.filter(([o,l])=>ps(i,o)<l).map(([o,l])=>[o,l-ps(i,o)]),r=ps(i,t.give[0])+t.give[1]>e,a=!!(t.st&&n&&!n.has(t.st));return{ok:!s.length&&!r&&!a,missing:s,full:r,noStation:a}}function Ld(i,t,e=Xe,n=null){const s=ih(i,t,e,n);if(!s.ok)return{ok:!1,msg:s.noStation?`Braucht ${v1[t.st]} in der Nähe`:s.missing.length?"Es fehlt: "+s.missing.map(([a,o])=>`${o}× ${ge(a)}`).join(", "):`Vorrat voll: höchstens ${e}× ${ge(t.give[0])}`};for(const[r,a]of t.need)i[r]=ps(i,r)-a;return i[t.give[0]]=ps(i,t.give[0])+t.give[1],{ok:!0,msg:`+${t.give[1]} ${ge(t.give[0])}`}}function x1(i,t,e=Xe,n=null){if(t.st&&n&&!n.has(t.st))return 0;let s=Math.floor((e-ps(i,t.give[0]))/t.give[1]);for(const[r,a]of t.need)s=Math.min(s,Math.floor(ps(i,r)/a));return Math.max(0,s)}function M1(i,t){return t?(t=t.toLowerCase(),ge(i.give[0]).toLowerCase().includes(t)||i.need.some(([e])=>ge(e).toLowerCase().includes(t))):!0}const y1=[[0,.5,0,1,1,.5],[.5,.5,0,1,1,1],[0,.5,.5,1,1,1],[0,.5,0,.5,1,1]],Bu=[[0,-1],[1,0],[0,1],[-1,0]],Dd=i=>Ki[i]===6;function S1(i,t){return Ki[t]===i||Tn[t]===1||(i===3||i===4)&&Dd(t)}function Dr(i,t,e,n,s,r){const a=.5-e/2,o=.5+e/2;r&&!t.some(Boolean)&&(t=[1,1,1,1]),t[0]&&i.push([a,n,0,o,s,a]),t[1]&&i.push([o,n,a,1,s,o]),t[2]&&i.push([a,n,o,o,s,1]),t[3]&&i.push([0,n,a,a,s,o])}function Pd(i,t,e,n,s,r=!1){const a=Ki[i];if(!a)return null;if(a===1)return[[0,0,0,1,.5,1]];if(a===2)return[[0,0,0,1,.5,1],y1[Kt[i].dir&3]];const o=()=>Bu.map(([l,c])=>S1(a,t(e+l,n,s+c))?1:0);if(a===3){const l=o(),c=[[.375,0,.375,.625,1,.625]];return r?Dr(c,l,.25,0,1):(Dr(c,l,.125,.375,.5625),Dr(c,l,.125,.75,.9375)),c}if(a===4){const l=[[.25,0,.25,.75,1,.75]];return Dr(l,o(),.375,0,r?1:.8125),l}if(a===5){const l=[[.4375,0,.4375,.5625,1,.5625]];return Dr(l,o(),.125,0,1,!0),l}if(a===6){let l=n;for(;l>0&&Dd(t(e,l-1,s));)l--;const c=Tn[t(e-1,l,s)]||Tn[t(e+1,l,s)],u=(Tn[t(e,l,s-1)]||Tn[t(e,l,s+1)])&&!c,f=i===_.DOOR_OPEN,d=.1875;return f?[u?[0,0,0,1,1,d]:[0,0,0,d,1,1]]:[u?[.5-d/2,0,0,.5+d/2,1,1]:[0,0,.5-d/2,1,1,.5+d/2]]}if(a===7){for(const[c,h]of Bu)if(Tn[t(e+c,n,s+h)])return[c===1?[1-.0625,0,0,1,1,1]:c===-1?[0,0,0,.0625,1,1]:h===1?[0,0,1-.0625,1,1,1]:[0,0,0,1,1,.0625]];return[[0,0,0,1,1,.0625]]}return null}function E1(i,t,e,n,s,r,a,o,l,c,h){const u=Pd(i,t,e,n,s,!0);if(!u)return!0;for(const f of u)if(l>e+f[0]&&r<e+f[3]&&c>n+f[1]&&a<n+f[4]&&h>s+f[2]&&o<s+f[5])return!0;return!1}const zo=[{n:[1,0,0],o:[1,0,1],a:[0,0,-1],b:[0,1,0],k:1},{n:[-1,0,0],o:[0,0,0],a:[0,0,1],b:[0,1,0],k:1},{n:[0,0,1],o:[0,0,1],a:[1,0,0],b:[0,1,0],k:1},{n:[0,0,-1],o:[1,0,0],a:[-1,0,0],b:[0,1,0],k:1},{n:[0,1,0],o:[0,1,0],a:[0,0,1],b:[1,0,0],k:0},{n:[0,-1,0],o:[0,0,0],a:[1,0,0],b:[0,0,1],k:2}],b1=[[0,0],[1,0],[1,1],[0,1]];for(const i of zo)i.c=b1.map(([t,e])=>{const n=t?1:-1,s=e?1:-1,r=(a,o,l)=>[i.n[0]*a+i.a[0]*o+i.b[0]*l,i.n[1]*a+i.a[1]*o+i.b[1]*l,i.n[2]*a+i.a[2]*o+i.b[2]*l];return{i:t,j:e,p:[i.o[0]+t*i.a[0]+e*i.b[0],i.o[1]+t*i.a[1]+e*i.b[1],i.o[2]+t*i.a[2]+e*i.b[2]],s1:r(1,n,0),s2:r(1,0,s),cn:r(1,n,s)}});const Hu=[.45,.66,.84,1],T1=[1,.62,.38,.18];function A1(i,t){return t===_.AIR?!0:Tn[t]?!1:i===t?hd[i]===1:!0}class uo{constructor(){this.pos=[],this.uv=[],this.col=[],this.idx=[],this.n=0}finish(){return this.n?{pos:new Float32Array(this.pos),uv:new Float32Array(this.uv),col:new Float32Array(this.col),idx:this.n>16383?new Uint32Array(this.idx):new Uint16Array(this.idx)}:null}}function da(i,t){const e=t?4:kx,n=t?4:Ru,s=1/e,r=1/n,a=(t?3:2)/512,o=t?a:2/(64*Ru);return[i%e*s+a,1-(Math.floor(i/e)+1)*r+o,s-2*a,r-2*o]}function Id(i,t){const e=i.neighborhood(t);if(!e)return null;const n=[];for(let s=-1;s<=1;s++)for(let r=-1;r<=1;r++)n.push(i.heightmap(i.getChunk(t.cx+r,t.cz+s)));return{nb:e,hms:n,maxY:t.maxY}}function w1(i,t){const e=Id(i,t);return e?R1(e.nb,e.hms,e.maxY):null}function R1(i,t,e){const n=i[4],s=(f,d)=>(d<0?0:d>=F?2:1)*3+(f<0?0:f>=F?2:1),r=(f,d,g)=>d<0?_.STONE:d>=oe?_.AIR:i[s(f,g)][(f&15)+((g&15)<<4)+(d<<8)],a=(f,d,g)=>{const v=t[s(f,g)][(f&15)+((g&15)<<4)];return d>=v?1:T1[Math.min(3,v-d)]},o=new uo,l=new uo,c=new uo,h=[0,0,0,0],u=Math.min(oe-1,e+1);for(let f=0;f<=u;f++)for(let d=0;d<F;d++)for(let g=0;g<F;g++){const v=n[g+(d<<4)+(f<<8)];if(v===_.AIR)continue;if(ud[v]){D1(o,g,f,d,Ks[v][0],a(g,f,d));continue}if(fd[v]){const A=(w,L)=>r(g+w,f,d+L)===v||r(g+w,f+1,d+L)===v||r(g+w,f-1,d+L)===v;P1(o,g,f,d,Ks[v][0],a(g,f,d),(A(1,0)||A(-1,0))&&!A(0,1)&&!A(0,-1));continue}if(Ki[v]){C1(co[v]?l:o,g,f,d,Pd(v,r,g,f,d),Ks[v],r,a);continue}const m=No(v),p=m?c:co[v]?l:o,x=nh[v],y=v===_.WATER&&r(g,f+1,d)!==_.WATER,M=Ks[v],C=x===0&&!co[v];for(let A=0;A<6;A++){const w=zo[A];if(!A1(v,r(g+w.n[0],f+w.n[1],d+w.n[2])))continue;const L=m?v-_i:M[w.k],[T,b,I,K]=da(L,m);for(let q=0;q<4;q++){const Z=w.c[q],$=a(g+w.n[0],f+w.n[1],d+w.n[2]),it=g+Z.s1[0],W=f+Z.s1[1],ct=d+Z.s1[2],_t=g+Z.s2[0],Ct=f+Z.s2[1],Wt=d+Z.s2[2],ce=g+Z.cn[0],Y=f+Z.cn[1],st=d+Z.cn[2],Tt=Tn[r(it,W,ct)],ot=Tn[r(_t,Ct,Wt)],It=Tn[r(ce,Y,st)],kt=C?Tt&&ot?0:3-(Tt+ot+It):3,Xt=($+(Tt?$:a(it,W,ct))+(ot?$:a(_t,Ct,Wt))+(It?$:a(ce,Y,st)))/4;h[q]=Hu[kt]*(.5+.5*Xt),p.pos.push(g+Z.p[0],f+Z.p[1]-(y&&Z.p[1]===1?.12:0),d+Z.p[2]),p.uv.push(T+Z.i*I,b+Z.j*K),p.col.push(Hu[kt],Xt,x,A)}const H=p.n*4;h[0]+h[2]<h[1]+h[3]?p.idx.push(H+1,H+2,H+3,H+1,H+3,H):p.idx.push(H,H+1,H+2,H,H+2,H+3),p.n++}}return{opaque:o.finish(),trans:l.finish(),logo:c.finish()}}function C1(i,t,e,n,s,r,a,o){const l=o(t,e,n);for(const c of s)for(let h=0;h<6;h++){const u=zo[h],f=u.n[0]?0:u.n[1]?1:2,g=u.n[f]>0?c[f+3]>=1:c[f]<=0;if(g&&Tn[a(t+u.n[0],e+u.n[1],n+u.n[2])])continue;const v=g?(o(t+u.n[0],e+u.n[1],n+u.n[2])+l)/2:l,[m,p,x,y]=da(r[u.k],!1),M=g?1:.84;for(let A=0;A<4;A++){const w=u.c[A],L=[0,1,2].map(H=>w.p[H]?c[H+3]:c[H]),T=u.a[0]?0:u.a[1]?1:2,b=u.b[0]?0:u.b[1]?1:2,I=u.a[T]>0?L[T]:1-L[T],K=u.b[b]>0?L[b]:1-L[b];i.pos.push(t+L[0],e+L[1],n+L[2]),i.uv.push(m+I*x,p+K*y),i.col.push(M,v,0,h)}const C=i.n*4;i.idx.push(C,C+1,C+2,C,C+2,C+3),i.n++}}const L1=[[[.15,.15],[.85,.85]],[[.85,.15],[.15,.85]]];function D1(i,t,e,n,s,r){const[a,o,l,c]=da(s,!1);for(const[[h,u],[f,d]]of L1)for(const g of[0,1]){const v=i.n*4,m=g?[[f,d],[h,u]]:[[h,u],[f,d]];i.pos.push(t+m[0][0],e,n+m[0][1],t+m[1][0],e,n+m[1][1],t+m[1][0],e+1,n+m[1][1],t+m[0][0],e+1,n+m[0][1]),i.uv.push(a,o,a+l,o,a+l,o+c,a,o+c);for(let p=0;p<4;p++)i.col.push(.9,r,0,4);i.idx.push(v,v+1,v+2,v,v+2,v+3),i.n++}}function P1(i,t,e,n,s,r,a){const[o,l,c,h]=da(s,!1),u=e+.0625,f=[o,l,o,l+h,o+c,l+h,o+c,l],d=[o,l,o+c,l,o+c,l+h,o,l+h],g=a?d:f;for(const v of[0,1]){const m=i.n*4;v?(i.pos.push(t,u,n,t+1,u,n,t+1,u,n+1,t,u,n+1),i.uv.push(g[0],g[1],g[6],g[7],g[4],g[5],g[2],g[3])):(i.pos.push(t,u,n,t,u,n+1,t+1,u,n+1,t+1,u,n),i.uv.push(...g));for(let p=0;p<4;p++)i.col.push(.95,r,0,v?5:4);i.idx.push(m,m+1,m+2,m,m+2,m+3),i.n++}}function I1(i){const t=No(i),e=Ks[i],n=new uo;for(let s=0;s<6;s++){const r=zo[s],[a,o,l,c]=da(t?i-_i:e[r.k],t);for(let u=0;u<4;u++){const f=r.c[u];n.pos.push(f.p[0]-.5,f.p[1]-.5,f.p[2]-.5),n.uv.push(a+f.i*l,o+f.j*c),n.col.push(1,1,nh[i],s)}const h=n.n*4;n.idx.push(h,h+1,h+2,h,h+2,h+3),n.n++}return n.finish()}const Ee=64,Ws=8,Gu=16,Pr=128,Ll=4,Vu=16;function Je(i,t,e){let n=Math.imul(i|0,668265261)^Math.imul(t|0,374761393)^Math.imul(e|0,2654435761);return n=Math.imul(n^n>>>15,2246822507),n=Math.imul(n^n>>>13,3266489909),n^=n>>>16,(n>>>0)/4294967296}function Re(i,t,e,n,s){const r=Math.floor(i),a=Math.floor(t),o=i-r,l=t-a,c=o*o*(3-2*o),h=l*l*(3-2*l),u=(r%e+e)%e,f=(u+1)%e,d=(a%n+n)%n,g=(d+1)%n,v=Je(u,d,s),m=Je(f,d,s),p=Je(u,g,s),x=Je(f,g,s);return v+(m-v)*c+(p-v)*h+(v-m-p+x)*c*h}function yt(i,t,e,n,s){let r=0,a=.5,o=0,l=e;for(let c=0;c<n;c++)r+=a*Re(i*l,t*l,l,l,s+c*17),o+=a,a*=.5,l*=2;return r/o}const vt=(i,t,e)=>[i[0]+(t[0]-i[0])*e,i[1]+(t[1]-i[1])*e,i[2]+(t[2]-i[2])*e],et=(i,t)=>[i[0]+t,i[1]+t,i[2]+t],xt=(i,t,e,n)=>(Je(i,t,e)-.5)*n,Dl=(i,t,e,n)=>{const s=yt(i,t,6,3,2),r=Re(i*32,t*32,32,32,5);return[...et(vt([58,122,38],[120,186,72],s*.65+r*.45),xt(e,n,8,10)),255]},Za=(i,t,e,n)=>{const s=yt(i,t,4,4,1),r=yt(i,t,12,2,9);let a=vt([108,76,50],[150,108,76],s);return r>.66?a=et(a,-26):r<.28&&(a=et(a,12)),[...et(a,xt(e,n,3,10)),255]},Ui=[Dl,(i,t,e,n)=>{const s=.17+.11*Re(i*8,.5,8,1,4)+.05*Re(i*24,.5,24,1,6);if(t<s){const o=Dl(i,t,e,n);return t>s-.035&&(o[0]*=.8,o[1]*=.85,o[2]*=.8),o}const r=Za(i,t,e,n),a=Math.max(0,1-(t-s)*7)*.28;return[r[0]*(1-a),r[1]*(1-a),r[2]*(1-a),255]},Za,(i,t,e,n)=>{const s=yt(i,t,4,4,3),r=Math.abs(yt(i,t,3,3,7)-.5);let a=vt([92,94,100],[142,144,150],s);return r<.022?a=et(a,-34):yt(i,t,10,2,13)>.7&&(a=et(a,14)),[...et(a,xt(e,n,4,9)),255]},(i,t,e,n)=>{const s=yt(i,t,5,3,21),r=Math.sin((t+s*.35)*Math.PI*8)*5;return[...et(vt([212,194,136],[232,218,160],s),r+xt(e,n,5,10)),255]},(i,t,e,n)=>{const s=Re(i*10,t*3,10,3,31)*.6+Re(i*20,t*6,20,6,32)*.4;let r=vt([82,58,33],[132,98,58],s);return s<.3&&(r=et(r,-16)),[...et(r,xt(e,n,6,8)),255]},(i,t,e,n)=>{const s=i-.5,r=t-.5,a=Math.max(Math.abs(s),Math.abs(r)),o=yt(i,t,6,2,41);if(a>.43)return[...et(vt([80,56,32],[118,86,50],o),xt(e,n,7,8)),255];const l=Math.hypot(s,r)*15+yt(i,t,3,2,42)*2.2,c=.5+.5*Math.sin(l*Math.PI*2);return[...et(vt([186,148,94],[148,108,62],c),xt(e,n,9,7)),255]},(i,t,e,n)=>{const s=yt(i,t,8,3,11),r=yt(i,t,9,2,12);let a=vt([30,92,30],[92,168,58],s);return r>.64?[a[0],a[1],a[2],0]:(Re(i*16,t*16,16,16,14)>.78&&(a=et(a,18)),[...et(a,xt(e,n,10,10)),255])},(i,t,e,n)=>{const s=Math.floor(t*4),r=t*4%1,a=Re(i*6,t*40,6,40,51+s)*.7+.3*Re(i*24,t*4+s,24,4,55);let o=vt([150,110,60],[200,156,96],a);(r<.045||r>.97)&&(o=et(o,-46));const l=s%2?.25:.75;return Math.abs(i-l)<.012&&(o=et(o,-40)),[...et(o,xt(e,n,11,6)),255]},(i,t,e,n)=>{if(Math.min(e,n,Ee-1-e,Ee-1-n)<3)return[228,245,252,238];const r=(i+t)%.5;return r>.1&&r<.17&&i+t<1?[255,255,255,140]:[186,226,240,55]},(i,t,e,n)=>{const s=i*2%1,r=t*2%1;if(Math.min(s,1-s,r,1-r)<.055)return[150,98,38,255];const o=Math.max(0,1-Math.hypot(s-.5,r-.5)*1.5),l=yt(i,t,6,2,61);return[...vt([255,196,96],[255,246,190],o*.9+l*.1),255]},(i,t,e,n)=>{const s=yt(i,t,4,3,15),a=yt(i+s*.2,t,8,2,16)>.62?26:0;return[...et(vt([34,92,190],[62,134,220],s),a),172]},(i,t,e,n)=>{const s=Math.hypot(i-.5,t-.5),r=Math.min(e,n,Ee-1-e,Ee-1-n);let a=vt([255,120,170],[255,70,130],Math.min(1,s*1.6));return Math.sin(s*Math.PI*14)>.7&&(a=et(a,22)),r<4&&(a=vt(a,[150,30,80],.6)),[...a,255]},(i,t,e,n)=>{if(t<.17||t>.83){const r=Math.min(t,1-t);return[...vt([255,80,140],[190,40,100],r<.04?.6:0),255]}const s=Math.sin((t*7+Math.abs(i-.5)*.8)*Math.PI*2);return s>-.1?[...et([176,182,194],s*24),255]:[52,54,64,255]},(i,t)=>{const e=(t+Math.abs(i-.5))*3%1;return Math.min(i,t,1-i,1-t)<.04?[30,30,36,255]:e<.5?[255,214,40,255]:[38,38,46,255]},(i,t)=>t>.35&&t<.65?[255,214,40,255]:[40,40,50,255],(i,t,e,n)=>{const s=Math.abs(i*2%1-.5),r=t*2%1,a=s<.07&&r>.4&&r<.88,o=r>.12&&r<.44&&s<(r-.12)*.75,l=vt([40,170,215],[96,220,245],yt(i,t,4,2,71));return a||o?[255,255,255,255]:[...et(l,xt(e,n,12,8)),255]},(i,t,e,n)=>[...Math.sin((t*5-i*.6)*Math.PI*2+Math.sin(i*9)*1.2)>.82?[235,250,255]:vt([40,160,205],[80,205,235],t),255],(i,t,e,n)=>{const s=Math.min(i,t,1-i,1-t),r=Math.hypot(i-.5,t-.5);return s<.05?[28,30,38,255]:r<.34?e%6<3&&n%6<3?[18,20,26,255]:[96,102,116,255]:t<.14&&i>.7&&i<.84?[255,150,40,255]:[...et([58,62,74],xt(e,n,13,8)),255]},(i,t,e,n)=>Math.min(i,t,1-i,1-t)<.05?[28,30,38,255]:Math.hypot(i-.3,t-.5)<.16?[255,150,40,255]:t>.42&&t<.58&&i>.55&&i<.9?[0,229,255,255]:[...et([58,62,74],xt(e,n,14,8)),255],(i,t,e,n)=>{const s=.5+.5*Math.sin((i+t)*Math.PI*6+yt(i,t,4,2,81)*5),a=Math.min(i,t,1-i,1-t)<.04?.45:.7+.3*s;return[a*255,a*255,a*255,255]},...[[255,40,70],[40,140,255],[50,255,120],[190,70,255]].map(i=>(t,e)=>{const n=t*2%1,s=e*2%1;if(Math.min(n,1-n,s,1-s)<.06)return[i[0]*.3,i[1]*.3,i[2]*.3,255];const a=Math.max(0,1-Math.hypot(n-.5,s-.5)*1.3);return[...vt(i,[255,255,255],a*a*.65),255]}),(i,t,e,n)=>{const s=Math.floor(t*8),r=t*8%1,a=s%2?.125:0,o=(i*4+a*4)%1;if(r<.1||o<.05)return[...et([176,170,160],xt(e,n,15,10)),255];const l=yt(i,t,8,2,91+s);return[...et(vt([150,62,46],[186,92,66],l),xt(e,n,16,12)),255]},(i,t,e,n)=>{const s=yt(i,t,3,4,95),r=Math.abs(yt(i+s*.3,t,3,3,96)-.5);let a=vt([236,236,242],[214,216,226],s);return r<.03?a=et(a,-52):r<.05&&(a=et(a,-22)),[...et(a,xt(e,n,17,5)),255]},(i,t,e,n)=>[...et(vt([226,234,244],[250,252,255],yt(i,t,5,3,101)),xt(e,n,18,6)),255],(i,t,e,n)=>{const s=.2+.1*Re(i*8,.5,8,1,102);if(t<s)return[...et([240,246,252],xt(e,n,19,6)),255];const r=Za(i,t,e,n),a=Math.max(0,1-(t-s)*7)*.2;return[r[0]*(1-a),r[1]*(1-a),r[2]*(1-a),255]},(i,t,e,n)=>{const s=yt(i,t,4,3,103),r=Math.abs(yt(i,t,3,2,104)-.5)<.018;return[...et(vt([150,196,236],[196,226,250],s),r?30:xt(e,n,20,5)),255]},(i,t,e,n)=>{const s=Re(i*10,t*10,10,10,105),r=yt(i,t,16,2,106),a=s>.6?[150,144,138]:s<.3?[96,92,90]:[124,120,116];return[...et(a,(r-.5)*40+xt(e,n,21,10)),255]},(i,t,e,n)=>{const s=Math.sin((t+yt(i,t,3,2,107)*.2)*Math.PI*6)*6;return[...et(vt([142,152,168],[168,176,190],yt(i,t,4,3,108)),s+xt(e,n,22,6)),255]},(i,t,e,n)=>{const s=Re(i*12,t*2,12,2,109)*.6+Re(i*24,t*5,24,5,110)*.4;let r=vt([52,36,22],[92,64,40],s);return s<.32&&(r=et(r,-12)),[...et(r,xt(e,n,23,8)),255]},(i,t,e,n)=>{const s=i-.5,r=t-.5;if(Math.max(Math.abs(s),Math.abs(r))>.43)return[...et([66,46,28],xt(e,n,24,8)),255];const o=.5+.5*Math.sin((Math.hypot(s,r)*18+yt(i,t,3,2,111)*2)*Math.PI*2);return[...et(vt([170,128,80],[130,92,56],o),xt(e,n,25,7)),255]},(i,t,e,n)=>{const s=yt(i,t,10,3,112),r=yt(i,t,11,2,113),a=vt([22,58,34],[52,104,60],s);return r>.66?[a[0],a[1],a[2],0]:[...et(a,xt(e,n,26,12)),255]},(i,t,e,n)=>{const s=Math.abs(i*4%1-.5)<.08;let r=vt([44,120,44],[70,150,58],yt(i,t,4,2,114));return s&&(r=et(r,-24)),Je(e>>2,n>>2,115)>.93&&(r=[230,226,190]),[...et(r,xt(e,n,27,6)),255]},(i,t,e,n)=>{const s=Math.hypot(i-.5,t-.5);return[...et(vt([92,168,70],[50,124,44],Math.min(1,s*2)),xt(e,n,28,6)),255]},...[[[34,34,38],[58,58,64]],[[196,108,52],[236,150,84]],[[196,160,128],[232,204,176]]].map((i,t)=>(e,n,s,r)=>{const a=yt(e,n,4,4,3);let o=vt([92,94,100],[142,144,150],a);return Re(e*6,n*6,6,6,116+t)>.68&&(o=vt(i[0],i[1],Re(e*24,n*24,24,24,119+t))),[...et(o,xt(s,r,29+t,9)),255]}),(i,t,e,n)=>{const s=Math.abs((i+t)*3%1-.5),r=Math.abs((i-t+1)*3%1-.5),a=Math.min(s,r),o=vt([40,170,230],[170,250,255],1-a*2);return[...et(o,yt(i,t,6,2,120)*30-15),255]},(i,t,e,n)=>{const s=yt(i,t,5,3,121),r=yt(i,t,9,2,122)>.64;return[...et(vt([60,50,38],[92,76,58],s),r?18:xt(e,n,32,8)),255]},(i,t,e,n)=>{const s=Dl(i,t,e,n);if(Je(e>>2,n>>2,123)>.88&&(e&3)>0&&(n&3)>0){const a=Math.floor(Je(e>>2,n>>2,124)*4);return[...[[250,230,70],[240,80,110],[250,250,250],[150,110,240]][a],255]}return s},(i,t,e,n)=>{const s=Math.floor(i*4),r=Math.abs(i*4%1-.5)>.45;let a=vt([38,38,44],[66,64,72],yt(i,t+s*.3,4,3,125));return r&&(a=et(a,-14)),[...et(a,xt(e,n,33,8)),255]},(i,t,e,n)=>{const s=yt(i,t,4,3,126);return Math.abs(yt(i,t,5,2,127)-.5)<.06?[60,30,26,255]:[...vt([230,70,20],[255,200,60],s),255]},(i,t,e,n)=>Re(i*5,t*5,5,5,128)>.72?[...et([240,236,226],xt(e,n,34,6)),255]:[...et(vt([170,34,38],[214,60,56],yt(i,t,4,2,129)),xt(e,n,35,8)),255],(i,t,e,n)=>[...et(vt([98,82,108],[140,120,150],yt(i,t,6,3,130)),xt(e,n,36,12)),255],(i,t,e,n)=>{const s=.16+.08*Re(i*8,.5,8,1,131);return t<s?[...et([120,100,130],xt(e,n,37,10)),255]:Za(i,t,e,n)},(i,t,e,n)=>{const s=Math.floor(t*4),r=t*4%1;let a=vt([206,182,124],[226,204,150],yt(i,t,5,2,132+s));return r<.06&&(a=et(a,-22)),[...et(a,xt(e,n,38,6)),255]},(i,t,e,n)=>[...et(vt([214,206,188],[240,234,222],Re(i*8,t*2,8,2,133)),xt(e,n,39,6)),255],(i,t,e,n)=>{const s=yt(i,t,7,3,134),r=yt(i,t,8,2,135),a=vt([24,100,22],[70,170,40],s);return r>.68?[a[0],a[1],a[2],0]:[...et(a,xt(e,n,40,10)),255]},(i,t,e,n)=>{const s=Math.floor(t*4),r=t*4%1;let a=vt([150,112,66],[182,140,88],yt(i*.5,t,6,2,140+s));return r<.05&&(a=et(a,-40)),(Math.abs(i-.5)<.03||Math.abs(t-.5)<.03)&&(a=[84,58,34]),Math.min(i,t,1-i,1-t)<.08&&(a=[104,76,44]),[...et(a,xt(e,n,41,8)),255]},(i,t,e,n)=>{let s=vt([150,112,66],[182,140,88],yt(i,t*.5,6,2,142));return t*4%1<.05&&(s=et(s,-36)),t<.14&&(s=[110,80,46]),i>.18&&i<.44&&t>.32&&t<.5&&(s=[186,190,198]),i>.4&&i<.48&&t>.3&&t<.52&&(s=[90,60,34]),i>.6&&i<.66&&t>.3&&t<.78&&(s=[96,66,38]),i>.54&&i<.74&&t>.26&&t<.36&&(s=[120,124,132]),[...et(s,xt(e,n,42,8)),255]},(i,t,e,n)=>{const s=Math.floor(t*4),r=s&1?.25:0,a=(i*2+r)%1,o=t*4%1;let l=vt([96,96,102],[132,132,138],yt(i,t,5,3,144));if((a<.05||o<.07)&&(l=et(l,-38)),i>.26&&i<.74&&t>.52&&t<.86){const c=1-Math.abs(i-.5)*3;l=t>.68?vt([200,70,20],[255,190,60],c*Re(i*8,t*8,8,8,145)):[26,22,22]}return[...et(l,xt(e,n,43,8)),255]},(i,t,e,n)=>{let s=vt([100,100,106],[136,136,142],yt(i,t,5,3,146));return Math.abs(i-.5)<.16&&Math.abs(t-.5)<.16&&(s=[30,26,26]),[...et(s,xt(e,n,44,8)),255]},(i,t,e,n)=>{const s=yt(i,t,8,3,147),r=Re(i*16,t*16,16,16,148);return[...et(vt([214,210,202],[246,244,238],s*.5+r*.5),xt(e,n,45,6)),255]},(i,t,e,n)=>{const s=t*5%1,r=s<.32;let a=vt([74,50,30],[104,72,46],yt(i,t,6,3,150));return r&&(a=et(a,-22)),[...et(a,xt(e,n,46,10)),255]},...[0,1,2,3].map(i=>(t,e,n,s)=>{const r=[.3,.52,.76,.92][i],a=[[70,170,50],[90,176,54],[150,176,60],[214,184,76]][i],o=Math.floor(t*8),l=t*8%1,c=r*(.8+.2*Je(o,i,151));return 1-e>c||l<.3||l>.7?i===3&&1-e>c-.22&&1-e<c+.04&&l>.15&&l<.85&&Je(n>>1,s>>1,152)>.3?[228,196,90,255]:[0,0,0,0]:[...et(a,xt(n,s,47+i,16)-(1-e)*20),255]}),(i,t,e,n)=>{const s=yt(i,t,6,3,160),r=Re(i*16,t*16,16,16,161);let a=vt([128,110,84],[160,142,112],s);return r>.72?a=et(a,22):r<.22&&(a=et(a,-18)),[...et(a,xt(e,n,50,10)),255]},(i,t,e,n)=>{const s=(h,u)=>Je(Math.floor(h),Math.floor(u),162),r=i*4+(Math.floor(t*4)&1)*.5,a=t*4,o=r%1,l=a%1;let c=vt([96,96,100],[150,150,156],s(r,a)*.6+yt(i,t,5,2,163)*.4);return(o<.08||l<.1)&&(c=[64,64,68]),[...et(c,xt(e,n,51,8)),255]},...[0,1].map(i=>(t,e,n,s)=>{let r=vt([110,110,116],[140,140,146],yt(t,e,5,2,164));Math.abs(t-.5)<.2&&Math.abs(e-.5)<.3&&(r=[70,70,76]);const a=.5+(i?.12:-.12)*(.5-e)*2;return Math.abs(t-a)<.05&&e>.25&&e<.6&&(r=[138,98,54]),Math.abs(t-(i?.62:.38))<.08&&e>.2&&e<.3&&(r=i?[80,240,120]:[200,60,60]),[...et(r,xt(n,s,52,6)),255]}),(i,t,e,n)=>{let s=vt([84,84,92],[112,112,120],yt(i,t,5,2,165));return(Math.abs(i-.5)<.07||Math.abs(t-.5)<.07)&&(s=[214,128,60]),Math.abs(i-.5)<.12&&Math.abs(t-.5)<.12&&(s=[240,160,80]),[...et(s,xt(e,n,53,6)),255]},(i,t,e,n)=>{let s=vt([60,64,76],[86,90,104],yt(i,t,5,2,166));const r=Math.hypot(i-.5,t-.5);return r<.18?s=vt([60,200,240],[180,250,255],1-r/.18):r<.24&&(s=[200,120,60]),[...et(s,xt(e,n,54,6)),255]},(i,t,e,n)=>{let s=vt([56,60,72],[80,84,98],yt(i,t,5,2,167));const r=Math.hypot(i-.5,t-.15);return t>.15&&Math.abs(r*5%1-.5)<.09&&r<.75&&(s=[106,232,255]),t>.82&&(s=[200,120,60]),[...et(s,xt(e,n,55,6)),255]},(i,t,e,n)=>{let s=vt([70,74,86],[98,102,116],yt(i,t,5,2,168));return(i*6%1<.12||t*6%1<.12)&&(s=[180,110,56]),Math.hypot(i-.5,t-.5)<.12&&(s=[106,232,255]),[...et(s,xt(e,n,56,6)),255]},...[0,1].map(i=>(t,e,n,s)=>{let r=vt([48,52,62],[70,74,86],yt(t,e,5,2,169));const a=Math.hypot(t-.5,e-.58);return a<.26&&a*14%1<.5&&(r=[30,32,40]),e<.2&&Math.abs(t-.5)<.3&&(r=i?[90,255,140]:[90,40,40]),[...et(r,xt(n,s,57,6)),255]}),...[0,1].map(i=>(t,e,n,s)=>{if(Math.min(t,e,1-t,1-e)<.1)return[...et([150,96,52],xt(n,s,58,8)),255];const a=yt(t,e,4,2,170);return[...et(i?vt([255,200,90],[255,240,170],a):vt([86,70,50],[110,92,66],a),xt(n,s,59,6)),255]}),(i,t,e,n)=>{let s=vt([150,152,160],[188,190,198],yt(i,t,4,2,171));return(t*2%1<.05||i<.05||i>.95)&&(s=[96,98,106]),Math.hypot(i*4%1-.5,t*2%1-.2)<.09&&(s=[110,112,120]),[...et(s,xt(e,n,60,6)),255]},(i,t,e,n)=>Math.min(i,t,1-i,1-t)>.1?[0,0,0,0]:[...et([120,122,130],xt(e,n,61,8)),255],(i,t,e,n)=>Math.abs(i-.22)<.055||Math.abs(i-.78)<.055?[...et(vt([150,150,158],[200,200,208],1-Math.abs(i-(i<.5?.22:.78))/.055),xt(e,n,62,6)),255]:t*4%1<.42&&i>.08&&i<.92?[...et(vt([104,72,42],[132,94,56],yt(i,t,6,2,172)),xt(e,n,63,8)),255]:[0,0,0,0],(i,t,e,n)=>{const s=Math.floor(t*4),r=i*2+(s&1)*.5,a=r%1,o=t*4%1;let l=vt([112,114,120],[150,152,158],Je(Math.floor(r),s,180)*.5+yt(i,t,6,2,181)*.5);return a<.04||o<.08?l=[78,78,84]:o<.16&&(l=et(l,12)),[...et(l,xt(e,n,70,7)),255]},(i,t,e,n)=>{const s=Math.min(i,t,1-i,1-t);let r=vt([150,152,158],[176,178,184],yt(i,t,3,3,182));return s<.04?r=[118,120,126]:s<.08&&(r=et(r,14)),[...et(r,xt(e,n,71,4)),255]},(i,t,e,n)=>{const s=Ui[8](i,t,e,n);return[s[0]*.5,s[1]*.4,s[2]*.34,255]},(i,t,e,n)=>{const s=Ui[8](i,t,e,n);return[Math.min(255,s[0]*1.2+30),Math.min(255,s[1]*1.2+30),Math.min(255,s[2]*1.15+34),255]},(i,t,e,n)=>{const s=Math.floor(t*5),r=i*4+(s&1)*.5,a=t*5%1,o=r%1;let l=vt([150,58,44],[196,86,62],Je(Math.floor(r),s,183)*.5+yt(i,t,6,2,184)*.4);return l=et(l,(a-.5)*-40),(a>.88||o<.05)&&(l=[96,34,28]),[...et(l,xt(e,n,72,8)),255]},(i,t,e,n)=>{const s=t*2%1;if(s<.14||i<.06||i>.94){const h=Ui[8](i,t,e,n);return[h[0]*.8,h[1]*.8,h[2]*.8,255]}const r=Math.floor(i*9)+Math.floor(t*2)*9,a=Je(r,1,185),o=.14+Je(r,2,186)*.25;if(s<o)return[40,28,18,255];const l=[[160,40,40],[40,90,160],[50,130,60],[190,150,50],[110,60,140],[180,100,40]];let c=l[Math.floor(a*l.length)];return i*9%1<.1&&(c=et(c,-40)),Math.abs(s-.55)<.04&&(c=et(c,50)),[...et(c,xt(e,n,73,8)),255]},(i,t,e,n)=>{if(Math.min(i,t,1-i,1-t)<.12||Math.abs(i-.5)<.04)return[...et([52,52,58],xt(e,n,74,8)),255];const r=Math.hypot(i-.5,t-.55);return[...vt([255,236,170],[255,170,60],Math.min(1,r*2.2)),255]},...[[[186,98,52],[236,150,92]],[[176,178,186],[226,228,234]]].map(([i,t],e)=>(n,s,r,a)=>{const o=Math.min(n,s,1-n,1-s);let l=vt(i,t,yt(n,s,3,2,187+e)*.6+(1-s)*.4);return o<.05?l=et(l,-50):o<.09&&(l=et(l,26)),Math.hypot(n*2%1-.5,s*2%1-.5)>.44&&o>.09&&o<.16&&(l=et(l,-30)),[...et(l,xt(r,a,75+e,5)),255]}),(i,t,e,n)=>{let s=vt([196,160,64],[232,204,100],Re(i*3,t*40,3,40,189));return(Math.abs(t-.3)<.04||Math.abs(t-.7)<.04)&&(s=[120,84,40]),[...et(s,xt(e,n,77,12)),255]},(i,t,e,n)=>{const s=Math.hypot(i-.5,t-.5);let r=vt([200,166,70],[238,210,110],(s*14+yt(i,t,6,2,190)*2)%1);return(Math.abs(i-.3)<.04||Math.abs(i-.7)<.04)&&(r=[120,84,40]),[...et(r,xt(e,n,78,10)),255]},...[[236,238,240],[36,38,44],[190,44,44],[232,120,30],[240,200,40],[70,160,60],[40,90,190],[130,60,180]].map((i,t)=>(e,n,s,r)=>[...et(et(i,(yt(e,n,5,3,191+t)-.5)*18),xt(s,r,79+t,7)),255]),...[[220,60,70],[70,120,230],[70,200,110]].map((i,t)=>(e,n,s,r)=>{if(Math.min(e,n,1-e,1-n)<.06)return[...et(vt(i,[255,255,255],.35),xt(s,r,90+t,6)),255];const o=(e+n)%.5<.06?40:0;return[...et(i,o),120]}),(i,t,e,n)=>{const s=Math.min(i,1-i),r=Ui[8](i,t,e,n);let a=[r[0]*.8,r[1]*.68,r[2]*.56];return(s<.1||t<.06||t>.94||Math.abs(t-.5)<.03)&&(a=et(a,-34)),t<.4&&t>.12&&s>.18?[150,200,230,150]:(Math.hypot(i-.8,t-.55)<.05&&(a=[210,190,90]),[...a,255])},(i,t,e,n)=>{if(Math.abs(i-.18)<.07||Math.abs(i-.82)<.07||t*4%1<.16&&i>.12&&i<.88){const s=Ui[8](i,t,e,n);return[s[0]*.85,s[1]*.8,s[2]*.75,255]}return[0,0,0,0]}];Ui.length;const N1=new Set([76,77,78,79,80,83,84,85,87,88,89,90,91,92,93,94,0,1,2,3,4,5,6,8,14,15,18,19,25,26,27,28,29,30,31,32,33,35,37,38,39,41,42,43,45,46,47,48,49,52,53,54,55,61,63,64,65,66,67,68,69,70,73]);function O1(){const i=document.createElement("canvas");i.width=Ee*Ws,i.height=Ee*Gu;const t=i.getContext("2d"),e=t.createImageData(Ee,Ee),n=e.data,s=Ee*Ws,r=Ee*Gu,a=new Uint8Array(s*r*4);for(let o=0;o<Ui.length;o++){for(let l=0;l<Ee;l++)for(let c=0;c<Ee;c++){const h=Ui[o]((c+.5)/Ee,(l+.5)/Ee,c,l),u=(l*Ee+c)*4;let f=0;if(N1.has(o)){const g=Math.min(c,l,Ee-1-c,Ee-1-l);g<3&&(f=(c<Ee/2&&c<=l||l<Ee/2&&l<c?16:-20)*(1-g/3))}n[u]=Math.max(0,Math.min(255,h[0]+f)),n[u+1]=Math.max(0,Math.min(255,h[1]+f)),n[u+2]=Math.max(0,Math.min(255,h[2]+f)),n[u+3]=Math.max(0,Math.min(255,h[3]));const d=((r-1-(Math.floor(o/Ws)*Ee+l))*s+o%Ws*Ee+c)*4;a[d]=n[u],a[d+1]=n[u+1],a[d+2]=n[u+2],a[d+3]=n[u+3]}t.putImageData(e,o%Ws*Ee,Math.floor(o/Ws)*Ee)}return i.raw=a,i}function U1(i,t){const e=document.createElement("canvas");e.width=e.height=Pr*Ll;const n=e.getContext("2d");n.fillStyle="#0e1224",n.fillRect(0,0,e.width,e.height);let s=Vu;for(let r=0;r<Vu;r++){const a=new Image,o=String(r+1).padStart(2,"0"),l=()=>{--s===0&&t&&t()};a.onload=()=>{n.drawImage(a,r%Ll*Pr,Math.floor(r/Ll)*Pr,Pr,Pr),i&&i(),l()},a.onerror=l,a.src=`logos/${o}.png`}return e}function k1(){const t=document.createElement("canvas");t.width=t.height=128;const e=t.getContext("2d"),n=e.createImageData(128,128);for(let s=0;s<128;s++)for(let r=0;r<128;r++){const a=yt((r+.5)/128,(s+.5)/128,4,4,77),o=Math.max(0,Math.min(1,(a-.5)/.18)),l=(s*128+r)*4;n.data[l]=n.data[l+1]=n.data[l+2]=255,n.data[l+3]=o*o*(3-2*o)*255}return e.putImageData(n,0,0),t}const Vr=32,zi=8;function z1(i){const t=document.createElement("canvas");t.width=Vr*zi,t.height=Vr*Math.max(1,Math.ceil(i.length/zi));const e=t.getContext("2d");return i.forEach((n,s)=>{const r=s%zi*Vr,a=Math.floor(s/zi)*Vr,o=(d,g,v,m=1,p=1)=>{e.fillStyle=v,e.fillRect(r+d*2,a+g*2,m*2,p*2)},l=(d=2)=>{for(let g=d;g<14;g++)o(g,15-g,"#5a3a1e"),o(g,14-g,"#8a6034")},c=(d,g)=>{const v=parseInt(d.slice(1),16),m=p=>Math.max(0,Math.min(255,Math.round(p*g)));return`rgb(${m(v>>16)},${m(v>>8&255)},${m(v&255)})`},h=n.col||"#ccc",u=c(h,.62),f=c(h,1.18);switch(n.draw){case"stick":l(1);break;case"ingot":for(let d=0;d<5;d++)o(3+d,6+d,d?h:f,10-d,1);o(3,11,u,10,1),o(12,6,u,1,5);break;case"apple":o(5,5,"#c82a2a",7,8),o(4,6,"#c82a2a",9,6),o(6,6,"#f06a5a",2,2),o(5,12,"#8a1a1a",7,1),o(8,2,"#5a3a1e",1,3),o(9,2,"#3c8a2a",3,2);break;case"meat":o(3,5,h,9,7),o(2,6,h,11,5),o(4,6,f,3,2),o(3,11,u,9,1),o(12,9,"#efe6d2",2,2),o(13,8,"#efe6d2",2,1),o(13,11,"#efe6d2",2,1);break;case"spitzhacke":l(3);for(let d=0;d<10;d++){const g=3+d,v=2+Math.round(Math.abs(d-4.5)*.55);o(g,v,h),o(g,v+1,u)}o(3,4,f),o(12,4,f);break;case"axt":l(3),o(8,2,h,4,5),o(7,3,h,1,4),o(12,3,u,1,3),o(8,2,f,4,1),o(8,6,u,4,1);break;case"schaufel":l(5),o(10,2,h,4,4),o(9,3,h,1,3),o(14,3,u,1,3),o(10,2,f,4,1),o(11,6,u,2,1);break;case"hacke":l(3),o(9,2,h,5,2),o(12,4,h,2,2),o(9,2,f,5,1),o(13,4,u,1,2);break;case"schwert":for(let d=0;d<9;d++)o(5+d,10-d,h),o(6+d,10-d,f),o(5+d,11-d,u);o(3,10,"#5a3a1e",4,1),o(5,8,"#5a3a1e",1,5),o(2,13,"#8a6034",2,2),o(4,11,"#8a6034",1,2);break;case"seeds":[[4,6],[8,4],[10,8],[6,10],[11,11],[5,13],[9,12]].forEach(([d,g])=>{o(d,g,"#c8b060",2,1),o(d,g+1,"#8a7a3a",2,1)});break;case"wheat":for(let d=0;d<3;d++){const g=5+d*3;o(g,7,"#6a8a2a",1,8),o(g-1,2,"#e0c060",3,5),o(g,1,"#f0d880",1,2)}o(4,11,"#8a6a2a",9,1);break;case"bread":o(2,6,"#c8843c",12,6),o(3,5,"#d89848",10,1),o(2,12,"#8a5420",12,1);for(let d=0;d<3;d++)o(4+d*3,7,"#f0c070",2,1);break;case"helm":o(4,4,h,8,3),o(3,6,h,10,4),o(3,10,u,3,2),o(10,10,u,3,2),o(5,4,f,5,1),o(6,8,"#1a1a22",4,1);break;case"harnisch":o(3,3,h,3,3),o(10,3,h,3,3),o(4,5,h,8,8),o(5,5,f,2,6),o(4,12,u,8,1),o(7,3,u,2,3);break;case"boot":o(1,8,h,14,3),o(2,11,u,12,2),o(3,13,u,10,1),o(1,7,f,14,1),o(4,9,"#5a3a1e",8,1),o(7,2,"#5a3a1e",1,6),o(8,3,"#efe6d2",4,3);break;case"lore":o(2,5,h,12,6),o(2,5,f,12,1),o(3,6,u,10,1),o(2,10,u,12,1),o(3,11,"#2a2a30",3,3),o(10,11,"#2a2a30",3,3),o(4,12,"#6a6a72",1,1),o(11,12,"#6a6a72",1,1);break;default:o(4,4,h,8,8)}}),t}const Wu=64,Eo={boot:{item:tt.BOAT,half:.6,h:.55,seat:.25,max:7,name:"Boot"},lore:{item:tt.MINECART,half:.45,h:.75,seat:.3,max:10,name:"Lore"}},si=[[1,0],[0,1],[-1,0],[0,-1]],F1=(i,t)=>Math.atan2(-i,-t),Xu=.001;class $u{constructor(t,e,n,s,r=0){this.kind=t,this.K=Eo[t],this.x=e,this.y=n,this.z=s,this.yaw=r,this.speed=0,this.vy=0,this.rider=!1,this.t=0,this.rail=null}}class B1{constructor(t,e){if(this.world=t,this.list=[],this.onAdd=()=>{},this.onRemove=()=>{},Array.isArray(e))for(const n of e)!Array.isArray(n)||!Eo[n[0]]||!n.slice(1,5).every(Number.isFinite)||this.list.length>=Wu||this.list.push(new $u(n[0],n[1],n[2],n[3],n[4]))}attach(){for(const t of this.list)this.onAdd(t)}add(t,e,n,s,r=0){if(!Eo[t]||this.list.length>=Wu)return null;const a=new $u(t,e,n,s,r);return t==="lore"&&!this.snapRail(a,r)?null:(this.list.push(a),this.onAdd(a),a)}remove(t){const e=this.list.indexOf(t);e<0||(this.list.splice(e,1),this.onRemove(t))}clear(){for(const t of this.list.slice())this.remove(t)}serialize(){return this.list.map(t=>[t.kind,+t.x.toFixed(2),+t.y.toFixed(2),+t.z.toFixed(2),+t.yaw.toFixed(2)])}raycast(t,e,n,s,r,a,o){let l=null;for(const c of this.list){const h=c.K.half,u=[c.x-h,c.y,c.z-h],f=[c.x+h,c.y+c.K.h,c.z+h],d=[t,e,n],g=[s,r,a];let v=0,m=o;for(let p=0;p<3&&v<=m;p++){if(Math.abs(g[p])<1e-9){(d[p]<u[p]||d[p]>f[p])&&(v=1/0);continue}let x=(u[p]-d[p])/g[p],y=(f[p]-d[p])/g[p];x>y&&([x,y]=[y,x]),v=Math.max(v,x),m=Math.min(m,y)}v<=m&&(!l||v<l.t)&&(l={veh:c,t:v})}return l}update(t,e,n){for(const s of this.list){const r=this.world;if(r.isLoaded&&!r.isLoaded(Math.floor(s.x),Math.floor(s.z)))continue;const a=Math.max(1,Math.ceil(t*60-1e-9)),o=t/a,l=s===e?n:null;for(let c=0;c<a;c++)s.kind==="boot"?this.stepBoat(s,o,l):this.stepCart(s,o,l);s.t+=t*Math.abs(s.speed)}}waterTop(t,e,n){const s=this.world,r=Math.floor(t),a=Math.floor(n);let o=Math.floor(e+.3);if(s.getBlock(r,o,a)!==_.WATER&&(o--,s.getBlock(r,o,a)!==_.WATER))return null;for(let l=0;l<4&&s.getBlock(r,o+1,a)===_.WATER;l++)o++;return o+1-.12}boxHits(t,e,n,s){const r=this.world,a=t.K.half;for(let o=Math.floor(n);o<=Math.floor(n+t.K.h-1e-7);o++)for(let l=Math.floor(s-a);l<=Math.floor(s+a-1e-7);l++)for(let c=Math.floor(e-a);c<=Math.floor(e+a-1e-7);c++)if(r.isSolid(c,o,l))return!0;return!1}stepBoat(t,e,n){const s=this.waterTop(t.x,t.y,t.z),r=s!==null;n&&(t.yaw-=n.r*1.9*e*(r?1:.3),t.speed+=n.f*(r?5:1.2)*e);const a=r?t.K.max:1.2;t.speed=Math.max(-a*.5,Math.min(a,t.speed)),t.speed-=t.speed*Math.min(1,(r?.6:4)*e),Math.abs(t.speed)<.01&&(t.speed=0),r?(t.vy+=(s-.3-t.y)*30*e,t.vy-=t.vy*Math.min(1,6*e)):t.vy=Math.max(-30,t.vy-25*e);const o=-Math.sin(t.yaw)*t.speed*e,l=-Math.cos(t.yaw)*t.speed*e;this.boxHits(t,t.x+o,t.y,t.z)?t.speed*=.2:t.x+=o,this.boxHits(t,t.x,t.y,t.z+l)?t.speed*=.2:t.z+=l;const c=t.y+t.vy*e;this.boxHits(t,t.x,c,t.z)?(t.vy<0&&(t.y=Math.floor(c)+1+Xu),t.vy=0):t.y=c}isRail(t,e,n){return this.world.getBlock(t,e,n)===_.RAIL}nextRail(t,e,n,s){const[r,a]=si[s];for(const o of[0,1,-1])if(this.isRail(t+r,e+o,n+a))return[t+r,e+o,n+a];return null}snapRail(t,e){const n=Math.floor(t.x),s=Math.floor(t.z);let r=Math.floor(t.y+.5);if(!this.isRail(n,r,s)&&(r--,!this.isRail(n,r,s)))return!1;const a=-Math.sin(e),o=-Math.cos(e),l=[0,1,2,3].sort((h,u)=>si[u][0]*a+si[u][1]*o-(si[h][0]*a+si[h][1]*o)),c=l.find(h=>this.nextRail(n,r,s,h))??l[0];return t.rail={x:n,y:r,z:s,d:c,p:0},t.speed=0,t.vy=0,this.placeOnRail(t),!0}placeOnRail(t){const e=t.rail,[n,s]=si[e.d],r=this.nextRail(e.x,e.y,e.z,e.d),a=r?r[1]:e.y;t.x=e.x+.5+n*e.p,t.z=e.z+.5+s*e.p,t.y=e.y+.0625+(a-e.y)*e.p,t.yaw=F1(n,s)}stepCart(t,e,n){const s=t.rail;if(!s||!this.isRail(s.x,s.y,s.z)){t.rail=null,t.speed=0,t.vy=Math.max(-30,t.vy-25*e);const o=t.y+t.vy*e;this.boxHits(t,t.x,o,t.z)?(t.vy<0&&(t.y=Math.floor(o)+1+Xu),t.vy=0):t.y=o,t.vy===0&&this.snapRail(t,t.yaw);return}if(n){const o=n.look||si[s.d];if(n.f>.2&&t.speed<.3&&o[0]*si[s.d][0]+o[1]*si[s.d][1]<-.2){const l=this.nextRail(s.x,s.y,s.z,s.d);s.d=(s.d+2)%4,l&&s.p>0&&(s.x=l[0],s.y=l[1],s.z=l[2],s.p=1-s.p)}t.speed+=(n.f>0?n.f*4:n.f*8)*e}const r=this.nextRail(s.x,s.y,s.z,s.d);r&&(t.speed-=(r[1]-s.y)*7*e),t.speed-=t.speed*Math.min(1,.25*e),t.speed=Math.max(0,Math.min(t.K.max,t.speed)),t.speed<.02&&(t.speed=0);let a=t.speed*e;for(let o=0;a>0&&o<4;o++){const l=this.nextRail(s.x,s.y,s.z,s.d);if(!l){s.p=0,t.speed=0;break}const c=1-s.p;if(a<c){s.p+=a,a=0;break}if(a-=c,s.x=l[0],s.y=l[1],s.z=l[2],s.p=0,!this.nextRail(s.x,s.y,s.z,s.d)){const h=[1,3].map(u=>(s.d+u)%4).find(u=>this.nextRail(s.x,s.y,s.z,u));h!==void 0&&(s.d=h,t.speed*=.85)}}this.placeOnRail(t)}exitSpot(t,e){const n=[[0,t.K.h+.05,0],[1.2,.1,0],[-1.2,.1,0],[0,.1,1.2],[0,.1,-1.2],[1.2,1.1,0],[-1.2,1.1,0],[0,1.1,1.2],[0,1.1,-1.2]];for(const[s,r,a]of n)if(!e(t.x+s,t.y+r,t.z+a))return[t.x+s,t.y+r,t.z+a];return[t.x,t.y+t.K.h+.05,t.z]}}const H1=[[[-.2,.25,-.25,.2,.6,.27,16052972],[-.13,.5,-.42,.13,.82,-.18,16052972],[-.06,.6,-.52,.06,.68,-.42,15769632],[-.03,.82,-.36,.03,.9,-.24,14168112],[-.13,0,-.04,-.07,.25,.02,15249456],[.07,0,-.04,.13,.25,.02,15249456]],[[-.4,.45,-.6,.4,1.08,.6,15526626],[-.2,.72,-.95,.2,1.12,-.56,13154464],[-.21,1,-.9,.21,1.16,-.6,15526626],[-.32,0,-.5,-.14,.46,-.32,4867136],[.14,0,-.5,.32,.46,-.32,4867136],[-.32,0,.32,-.14,.46,.5,4867136],[.14,0,.32,.32,.46,.5,4867136]],[[-.42,.55,-.7,.42,1.22,.7,6964264],[-.43,.75,-.2,.43,1.12,.25,15920870],[-.25,.85,-1.08,.25,1.36,-.7,5913122],[-.16,.86,-1.13,.16,1.02,-1.06,15118496],[-.32,1.3,-.95,-.24,1.46,-.88,15262416],[.24,1.3,-.95,.32,1.46,-.88,15262416],[-.36,0,-.62,-.16,.56,-.42,3811354],[.16,0,-.62,.36,.56,-.42,3811354],[-.36,0,.42,-.16,.56,.62,3811354],[.16,0,.42,.36,.56,.62,3811354]],[[-.28,.75,-.16,.28,1.35,.16,2761792],[-.22,1.35,-.22,.22,1.75,.22,3419218],[-.15,1.52,-.24,-.05,1.6,-.21,7008511],[.05,1.52,-.24,.15,1.6,-.21,7008511],[-.02,1.75,-.02,.02,1.98,.02,9076912],[-.05,1.96,-.05,.05,2.04,.05,16727180],[-.42,.8,-.08,-.28,1.32,.08,2761792],[.28,.8,-.08,.42,1.32,.08,2761792],[-.22,0,-.1,-.04,.75,.1,2235446],[.04,0,-.1,.22,.75,.1,2235446]],[[-.42,.25,-.3,.42,.72,.5,3816004],[-.28,.3,-.62,.28,.66,-.3,2763314],[-.2,.5,-.64,-.08,.6,-.61,16724016],[.08,.5,-.64,.2,.6,-.61,16724016],...[-.2,.1,.35].flatMap(i=>[[-.82,0,i-.05,-.42,.4,i+.05,2368556],[.42,0,i-.05,.82,.4,i+.05,2368556]])],[[-.35,.15,-.35,.35,.42,.35,5265512],[-.2,.42,-.2,.2,.56,.2,2764344],[-.1,.2,-.38,.1,.34,-.35,16719952],[-.03,.56,-.03,.03,.7,.03,9079446],...[[-1,-1],[1,-1],[1,1],[-1,1]].map(([i,t])=>[i*.55-.13,.44,t*.55-.13,i*.55+.13,.48,t*.55+.13,10133676])],[[-.2,0,-.1,-.02,.7,.1,4864554],[.02,0,-.1,.2,.7,.1,4864554],[-.25,.7,-.15,.25,1.35,.15,3828384],[-.2,.75,-.17,.2,1.2,-.15,9071168],[-.36,.8,-.08,-.25,1.3,.08,3828384],[.25,.8,-.08,.36,1.3,.08,3828384],[-.2,1.35,-.2,.2,1.73,.2,15253658],[-.22,1.68,-.22,.22,1.82,.22,6965802],[-.12,1.52,-.22,-.05,1.58,-.2,2105376],[.05,1.52,-.22,.12,1.58,-.2,2105376]]],G1=[.8,.8,1,.5,.68,.68];function js(i){const t=[],e=[],n=[],s=new le;for(const[a,o,l,c,h,u,f]of i){const d=new qi(c-a,h-o,u-l);d.translate((a+c)/2,(o+h)/2,(l+u)/2);const g=d.attributes.position.array,v=t.length/3;s.setHex(f);for(let m=0;m<g.length/3;m++){const p=G1[Math.floor(m/4)];t.push(g[m*3],g[m*3+1],g[m*3+2]),e.push(s.r*p,s.g*p,s.b*p)}for(const m of d.index.array)n.push(v+m);d.dispose()}const r=new Oe;return r.setAttribute("position",new nn(t,3)),r.setAttribute("color",new nn(e,3)),r.setIndex(n),r.computeBoundingSphere(),r}class V1{constructor(t){this.group=new Hn,t.add(this.group),this.geos=H1.map(js),this.meshes=new Map}add(t){const e=new Ce(this.geos[t.type],new Vi({vertexColors:!0}));e.matrixAutoUpdate=!0,this.group.add(e),this.meshes.set(t,e)}remove(t){const e=this.meshes.get(t);e&&(this.group.remove(e),e.material.dispose(),this.meshes.delete(t))}update(t,e,n,s,r){for(const[a,o]of this.meshes){const l=Math.hypot(a.x-t,a.z-e);if(o.visible=l<s,!o.visible)continue;const c=a.moving?Math.abs(Math.sin(r*9+a.x))*.05:0,h=a.hostile?Math.max(n,.7)*(.85+.15*Math.sin(r*23+a.z)):n;o.position.set(a.x,a.y+c,a.z),o.rotation.y=a.yaw,a.hurtT>0?o.material.color.setRGB(h*1.3,h*.45,h*.45):o.material.color.setRGB(h,h,h)}}clear(){for(const t of[...this.meshes.keys()])this.remove(t)}}const W1=[[-.6,0,-.75,.6,.12,.75,6965802],[-.6,.12,-.75,-.48,.5,.75,11041350],[.48,.12,-.75,.6,.5,.75,11041350],[-.48,.12,.63,.48,.5,.75,11041350],[-.48,.12,-.95,.48,.45,-.75,10120766],[-.48,.28,-.1,.48,.34,.12,8016944]],X1=[[-.03,-.05,-.03,.03,.75,.03,5913118],[-.08,-.32,-.02,.08,-.05,.02,9068596]],$1=[[-.45,.18,-.55,.45,.26,.55,5921892],[-.45,.26,-.55,-.37,.72,.55,9079956],[.37,.26,-.55,.45,.72,.55,9079956],[-.37,.26,-.55,.37,.72,-.47,8027268],[-.37,.26,.47,.37,.72,.55,8027268],[-.45,.66,-.55,.45,.72,-.5,12088364],[-.45,.66,.5,.45,.72,.55,12088364]],q1=[[-.04,-.12,-.12,.04,.12,.12,2763312],[-.05,-.03,-.03,.05,.03,.03,10132130],[-.045,-.12,-.02,.045,.12,.02,4868690]];class K1{constructor(t){this.group=new Hn,t.add(this.group),this.geo={hull:js(W1),paddle:js(X1),cart:js($1),wheel:js(q1)},this.items=new Map}add(t){const e=new Vi({vertexColors:!0}),n=new Hn,s=[];if(t.kind==="boot"){n.add(new Ce(this.geo.hull,e));for(const r of[-1,1]){const a=new Ce(this.geo.paddle,e);a.position.set(r*.62,.45,.05),n.add(a),s.push(a)}}else{n.add(new Ce(this.geo.cart,e));for(const[r,a]of[[-.48,-.35],[.48,-.35],[-.48,.35],[.48,.35]]){const o=new Ce(this.geo.wheel,e);o.position.set(r,.12,a),n.add(o),s.push(o)}}this.group.add(n),this.items.set(t,{root:n,parts:s,mat:e})}remove(t){const e=this.items.get(t);e&&(this.group.remove(e.root),e.mat.dispose(),this.items.delete(t))}clear(){for(const t of[...this.items.keys()])this.remove(t)}update(t,e,n,s,r){for(const[a,o]of this.items){const l=Math.hypot(a.x-t,a.z-e)<s;if(o.root.visible=l,!!l)if(o.root.position.set(a.x,a.y,a.z),o.root.rotation.y=a.yaw,o.mat.color.setRGB(n,n,n),a.kind==="boot")o.root.rotation.z=Math.sin(r*1.7+a.x)*.04,o.root.rotation.x=Math.sin(r*1.3+a.z)*.03,o.parts.forEach((c,h)=>{c.rotation.x=Math.sin(a.t*2.2+h*Math.PI)*.7,c.rotation.z=(h?-1:1)*.5});else{o.parts.forEach(u=>{u.rotation.x=-a.t/.12});const c=a.rail,h=c?a.y-(c.y+.0625):0;o.root.rotation.x=h>.01?Math.PI/4:h<-.01?-Math.PI/4:0}}}}const Ir=[{key:"einzeln",name:"Einzeln",clicks:1},{key:"linie",name:"Linie",clicks:2},{key:"flaeche",name:"Fläche",clicks:2},{key:"wand",name:"Wand",clicks:2},{key:"saeule",name:"Säule",clicks:2},{key:"kopieren",name:"Kopieren",clicks:2,creative:!0},{key:"einfuegen",name:"Einfügen",clicks:1,creative:!0}],Oc={creative:8192,survival:512},Y1=32768,ri=(i,t)=>{const e=[],n=i<=t?1:-1;for(let s=i;s!==t+n;s+=n)e.push(s);return e};function j1(i,t,e,n=Oc.creative){const s=[],r=(c,h,u)=>(h>=0&&h<oe&&s.push([c,h,u]),s.length<=n);if(i==="linie"){const c=Math.max(Math.abs(e[0]-t[0]),Math.abs(e[1]-t[1]),Math.abs(e[2]-t[2]));if(c+1>n)return null;for(let h=0;h<=c;h++){const u=c?h/c:0;r(Math.round(t[0]+(e[0]-t[0])*u),Math.round(t[1]+(e[1]-t[1])*u),Math.round(t[2]+(e[2]-t[2])*u))}return s}let a,o,l;if(i==="flaeche")a=ri(t[0],e[0]),o=[t[1]],l=ri(t[2],e[2]);else if(i==="saeule")a=[t[0]],o=ri(t[1],e[1]),l=[t[2]];else if(i==="wand")o=ri(t[1],e[1]),Math.abs(e[0]-t[0])>=Math.abs(e[2]-t[2])?(a=ri(t[0],e[0]),l=[t[2]]):(a=[t[0]],l=ri(t[2],e[2]));else if(i==="kopieren")a=ri(t[0],e[0]),o=ri(t[1],e[1]),l=ri(t[2],e[2]);else return[t.slice()];if(a.length*o.length*l.length>n)return null;for(const c of o)for(const h of l)for(const u of a)r(u,c,h);return s}function Uc(i,t){return[Math.min(i[0],t[0]),Math.min(i[1],t[1]),Math.min(i[2],t[2]),Math.max(i[0],t[0]),Math.max(i[1],t[1]),Math.max(i[2],t[2])]}function Z1(i,t,e){const[n,s,r,a,o,l]=Uc(t,e),c=a-n+1,h=o-s+1,u=l-r+1;if(c*h*u>Y1)return null;const f=new Uint8Array(c*h*u);let d=0;for(let g=0;g<h;g++)for(let v=0;v<u;v++)for(let m=0;m<c;m++){const p=i.getBlock(n+m,s+g,r+v);f[m+v*c+g*c*u]=p===_.WATER?_.AIR:p,p&&p!==_.WATER&&d++}return{sx:c,sy:h,sz:u,data:f,n:d}}function J1(i,t){const e=[];for(let n=0;n<i.sy;n++)for(let s=0;s<i.sz;s++)for(let r=0;r<i.sx;r++){const a=i.data[r+s*i.sx+n*i.sx*i.sz];a&&t[1]+n>=0&&t[1]+n<oe&&e.push([t[0]+r,t[1]+n,t[2]+s,a])}return e}const kc=20,qu=64,Be=4,an=32,Q1=i=>{let t="";for(const e of i)t+=String.fromCharCode(e);return btoa(t)},tM=i=>{const t=atob(i),e=new Uint8Array(128);for(let n=0;n<Math.min(128,t.length);n++)e[n]=t.charCodeAt(n);return e},Ku=i=>Number.isFinite(i);class eM{constructor(t){this.regions=new Map,this.marks=[],this.radios=new Map,this.tiles=new Map,this.count=0;const e=t&&typeof t=="object"?t:{};if(e.seen&&typeof e.seen=="object"){for(const[n,s]of Object.entries(e.seen))if(!(!/^-?\d+,-?\d+$/.test(n)||typeof s!="string"))try{const r=tM(s);this.regions.set(n,r);for(const a of r)for(let o=a;o;o&=o-1)this.count++}catch{}}if(Array.isArray(e.marks))for(const n of e.marks.slice(0,kc))n&&Ku(n.x)&&Ku(n.z)&&this.marks.push({x:Math.round(n.x),z:Math.round(n.z),n:String(n.n||"Markierung").slice(0,24)});if(Array.isArray(e.radios))for(const n of e.radios.slice(0,qu))Array.isArray(n)&&n.length===3&&n.every(Number.isInteger)&&this.radios.set(n.join(","),n)}has(t,e){const n=this.regions.get(`${Math.floor(t/an)},${Math.floor(e/an)}`);if(!n)return!1;const s=t-Math.floor(t/an)*an+(e-Math.floor(e/an)*an)*an;return(n[s>>3]&1<<(s&7))!==0}mark(t,e){const n=`${Math.floor(t/an)},${Math.floor(e/an)}`;let s=this.regions.get(n);s||(s=new Uint8Array(128),this.regions.set(n,s));const r=t-Math.floor(t/an)*an+(e-Math.floor(e/an)*an)*an;return s[r>>3]&1<<(r&7)?!1:(s[r>>3]|=1<<(r&7),this.count++,!0)}markAround(t,e,n){const s=Math.floor(t/F),r=Math.floor(e/F);let a=0;for(let o=-n;o<=n;o++)for(let l=-n;l<=n;l++)l*l+o*o<=n*n+1&&this.mark(s+l,r+o)&&a++;return a}syncRadios(t){for(const[e,n]of this.radios)t.getChunk(n[0]>>4,n[2]>>4)&&t.getBlock(n[0],n[1],n[2])!==_.RADIO&&this.radios.delete(e);for(const[e,n]of t.radios)this.radios.size<qu&&this.has(n[0]>>4,n[2]>>4)&&this.radios.set(e,n)}addMark(t,e,n){return this.marks.length>=kc?!1:(this.marks.push({x:Math.round(t),z:Math.round(e),n:String(n||`Markierung ${this.marks.length+1}`).slice(0,24)}),!0)}removeMark(t){t>=0&&t<this.marks.length&&this.marks.splice(t,1)}serialize(){if(!this.count&&!this.marks.length)return;const t={};for(const[e,n]of this.regions)t[e]=Q1(n);return{seen:t,marks:this.marks.length?this.marks:void 0,radios:this.radios.size?[...this.radios.values()]:void 0}}tile(t,e,n){const s=`${e},${n}`,r=t.getChunk(e,n);let a=this.tiles.get(s);if(a&&(a.real||!r))return a.px;this.tiles.size>6e3&&this.tiles.clear();const o=new Uint8ClampedArray(Be*Be*4),l={},c=F/Be;for(let h=0;h<Be;h++)for(let u=0;u<Be;u++){const f=u*c+1,d=h*c+1,g=(h*Be+u)*4;let v,m=1;if(r){const p=f+d*F;let x=Math.min(oe-1,r.maxY);for(;x>0&&r.data[p+x*F*F]===_.AIR;)x--;const y=r.data[p+x*F*F];v=Kt[y]&&Kt[y].map?Kt[y].map:[200,200,210],y!==_.WATER&&(m=Math.max(.6,Math.min(1.3,.85+(x-te)*.012)))}else{const p=e*F+f,x=n*F+d;if(t.gen>=2)vi(t.seed,p,x,l),v=l.h<te?Vs[0]:Vs[l.biome],l.h>=te&&(m=Math.max(.6,Math.min(1.3,.85+(l.h-te)*.012)));else{const y=ho(t.seed,p,x);v=y<te?Vs[0]:y<=te+1?Vs[1]:y>40?Vs[5]:Vs[2]}}o[g]=v[0]*m,o[g+1]=v[1]*m,o[g+2]=v[2]*m,o[g+3]=255}return this.tiles.set(s,{px:o,real:!!r}),o}}const nM=90,Yu=4096,iM=(i,t)=>Math.max(0,Math.min(ea.length-1,Math.floor((t-i)/nM))),Nd=i=>ea.includes(i);function sM(i,t=Math.random){return i===ea[ea.length-1]?[[tt.WHEAT,1],[tt.SEEDS,1+Math.floor(t()*2)]]:[[tt.SEEDS,1]]}const ju=(i,t,e)=>i+","+t+","+e;class Zu{constructor(t){if(this.plants=new Map,t&&typeof t=="object")for(const[e,n]of Object.entries(t)){const s=e.split(",").map(Number);s.length===3&&s.every(Number.isInteger)&&Number.isFinite(n)&&this.plants.size<Yu&&this.plants.set(e,n)}}plant(t,e,n,s){return this.plants.size>=Yu?!1:(this.plants.set(ju(t,e,n),s),!0)}remove(t,e,n){this.plants.delete(ju(t,e,n))}update(t,e){let n=0;for(const[s,r]of this.plants){const[a,o,l]=s.split(",").map(Number);if(!t.isLoaded(a,l))continue;const c=t.getBlock(a,o,l);if(!Nd(c)){this.plants.delete(s);continue}if(t.getBlock(a,o-1,l)!==_.FARMLAND){t.setBlock(a,o,l,_.AIR),this.plants.delete(s),n++;continue}const h=ea[iM(r,e)];h!==c&&t.setBlock(a,o,l,h)&&n++}return n}serialize(){return Object.fromEntries(this.plants)}}const $s=20,Wr=20,fo=10,Ju=15.5;function rM(i){return i>Ju?Math.floor((i-Ju)/2.5)+1:0}const Pl={idle:.018,walk:.028,sprint:.06};class Qu{constructor(t={}){const e=(n,s,r)=>Number.isFinite(n)?Math.max(0,Math.min(r,n)):s;this.hp=e(t.hp,$s,$s),this.food=e(t.food,Wr,Wr),this.air=e(t.air,fo,fo),this.hp<=0&&(this.hp=$s),this.regenT=0,this.starveT=0,this.drownT=0,this.magmaT=0,this.cause=""}hurt(t,e){return t<=0||this.hp<=0?!1:(this.hp=Math.max(0,this.hp-t),this.cause=e,this.hp<=0)}eat(t){return this.food>=Wr?!1:(this.food=Math.min(Wr,this.food+t),!0)}tick(t,e){const n=this.hp;return this.food=Math.max(0,this.food-t*(e.sprint&&e.moving?Pl.sprint:e.moving?Pl.walk:Pl.idle)),this.food>=16&&this.hp<$s?(this.regenT+=t,this.regenT>=3&&(this.regenT=0,this.hp=Math.min($s,this.hp+1),this.food=Math.max(0,this.food-.6))):this.regenT=0,this.food<=0&&this.hp>1?(this.starveT+=t,this.starveT>=4&&(this.starveT=0,this.hurt(1,"Hunger"))):this.starveT=0,e.eyeWater?(this.air=Math.max(0,this.air-t),this.air<=0&&(this.drownT+=t,this.drownT>=1&&(this.drownT=0,this.hurt(2,"Ertrunken")))):(this.air=Math.min(fo,this.air+t*4),this.drownT=0),e.onMagma?(this.magmaT+=t,this.magmaT>=1&&(this.magmaT=0,this.hurt(1,"Magma"))):this.magmaT=.6,n-this.hp>0?n-this.hp:0}get dead(){return this.hp<=0}toJSON(){return{hp:Math.round(this.hp*10)/10,food:Math.round(this.food*10)/10,air:Math.round(this.air*10)/10}}}const ia=[{key:"huhn",name:"Huhn",hp:3,half:.25,h:.8,speed:1.5,drops:[[tt.MEAT_RAW,1,1]]},{key:"schaf",name:"Schaf",hp:5,half:.42,h:1.2,speed:1.2,drops:[[tt.MEAT_RAW,1,2],[_.WOOL,1,2]]},{key:"kuh",name:"Kuh",hp:6,half:.45,h:1.4,speed:1.1,drops:[[tt.MEAT_RAW,2,3]]},{key:"rauschling",name:"Rauschling",hp:8,half:.3,h:1.7,speed:2.4,hostile:!0,dmg:2,drops:[[_.CRYSTAL,0,1]]},{key:"hoehlenwesen",name:"Höhlenwesen",hp:12,half:.45,h:.9,speed:1.9,hostile:!0,dmg:3,drops:[[_.COAL,1,2],[_.IRON,0,1]]},{key:"drohne",name:"Störsender-Drohne",hp:6,half:.35,h:.6,speed:3,hostile:!0,fly:!0,range:7,dmg:2,drops:[[tt.COPPER_INGOT,0,1],[_.CRYSTAL,0,1]]},{key:"dorfbewohner",name:"Dorfbewohner",hp:20,half:.3,h:1.8,speed:1.5,npc:!0,drops:[]}],tf=3,ef=3,aM=4,nf=5,oM=6;function sf(i){return i<.03||i>=.5?"home":i<.22||i>=.32&&i<.47?"work":"plaza"}const lM=4,cM=18;function hM(i,t,e,n,s,r,a){const o=Math.hypot(s-t,r-e,a-n),l=Math.ceil(o/.4);for(let c=1;c<l;c++){const h=c/l;if(i.isSolid(Math.floor(t+(s-t)*h),Math.floor(e+(r-e)*h),Math.floor(n+(a-n)*h)))return!1}return!0}const Nr=3,rf=40,uM=24,fM=new Set([_.GRASS,_.FLOWERS,_.SNOW,_.MYCEL]),Or=(i,t)=>(i+32768)*65536+(t+32768);let dM=1;class Il{constructor(t,e,n,s,r){const a=ia[t];this.id=dM++,this.target=0,this.type=t,this.T=a,this.x=e,this.y=n,this.z=s,this.hp=r??a.hp,this.vx=0,this.vy=0,this.vz=0,this.yaw=0,this.onGround=!1,this.walk=0,this.timer=0,this.flee=0,this.hurtT=0,this.acc=0,this.moving=!1,this.hostile=!!a.hostile,this.sees=!1,this.seeT=0,this.atkT=0,this.attack=!1,this.npc=!!a.npc,this.path=null,this.stuck=0,this.phase=null}warp(t,e,n){const s=Math.floor(this.y),r=a=>a>1&&a<oe-2&&ta[t.getBlock(Math.floor(e),a-1,Math.floor(n))]&&!this.collides(t,e,a,n);for(let a=0;a<=8;a++)for(const o of[s-a,s+a])if(r(o))return this.x=e,this.y=o,this.z=n,this.vy=0,!0;return!1}collides(t,e,n,s){const r=this.T.half,a=Math.floor(e-r),o=Math.floor(e+r-1e-7),l=Math.floor(s-r),c=Math.floor(s+r-1e-7),h=Math.floor(n),u=Math.floor(n+this.T.h-1e-7);for(let f=h;f<=u;f++)for(let d=l;d<=c;d++)for(let g=a;g<=o;g++)if(t.isSolid(g,f,d))return!0;return!1}move(t,e,n){if(!n)return!1;const s=this[e];return this[e]+=n,this.collides(t,this.x,this.y,this.z)?(this[e]=s,e==="y"&&(n<0&&(this.onGround=!0),this.vy=0),!0):!1}update(t,e,n,s,r,a=this.y){if(!t.isLoaded(Math.floor(this.x),Math.floor(this.z)))return;const o=this.T;if(this.hurtT=Math.max(0,this.hurtT-e),this.timer-=e,this.hostile){this.atkT-=e,this.seeT-=e;const m=Math.hypot(s-this.x,r-this.z);this.seeT<=0&&(this.seeT=.5,this.sees=m<cM&&hM(t,this.x,this.y+1.5,this.z,s,a+1.6,r)),this.sees&&m>.8&&(this.walk=1,this.yaw=Math.atan2(-(s-this.x),-(r-this.z)),this.timer=.5),o.range?(this.sees&&m<4&&(this.walk=0),this.sees&&Math.hypot(m,a+1-this.y)<o.range&&this.atkT<=0&&(this.atkT=2,this.attack=!0)):this.sees&&m<1.5&&Math.abs(a-this.y)<1.8&&this.atkT<=0&&(this.atkT=1,this.attack=!0)}if(this.npc&&this.path&&this.path.length){const m=this.path[0],p=Math.hypot(m.x-this.x,m.z-this.z);p<.6?(this.path.shift(),this.walk=0,this.stuck=0,this.bestD=1/0,this.timer=1+n()*2):(this.walk=1,this.yaw=Math.atan2(-(m.x-this.x),-(m.z-this.z)),this.timer=.3,p<(this.bestD??1/0)-.3?(this.bestD=p,this.stuck=0):(this.stuck+=e)>5&&(this.path.shift(),this.warp(t,m.x,m.z),this.stuck=0,this.bestD=1/0))}this.hostile&&this.sees||this.npc&&this.path&&this.path.length||(this.npc?this.timer<=0&&(this.walk=0,this.yaw+=(n()-.5)*1.5,this.timer=2+n()*3):this.flee>0?(this.flee-=e,this.walk=1,this.yaw=Math.atan2(-(this.x-s),-(this.z-r))):this.timer<=0&&(n()<.55?(this.walk=1,this.yaw=n()*Math.PI*2,this.timer=1+n()*3):(this.walk=0,this.timer=2+n()*4)));const l=Math.floor(this.x),c=Math.floor(this.z),h=t.getBlock(l,Math.floor(this.y+.3),c)===_.WATER;let u=this.walk?o.speed*(this.flee>0?2.2:1):0,f=-Math.sin(this.yaw),d=-Math.cos(this.yaw);if(u&&this.onGround&&!this.sees&&!o.fly){const m=Math.floor(this.x+f*(o.half+.6)),p=Math.floor(this.z+d*(o.half+.6));let x=0;for(let y=Math.floor(this.y)-1;x<4&&y>0&&!ta[t.getBlock(m,y,p)];y--)if(x++,t.getBlock(m,y,p)===_.WATER&&!this.flee){x=9;break}x>3&&(this.yaw+=Math.PI*(.5+n()),this.timer=.5+n(),f=-f,d=-d,u*=.3)}if(this.hostile&&this.sees&&Math.hypot(s-this.x,r-this.z)<.9&&(u=0),this.vx=f*u,this.vz=d*u,o.fly){const m=this.sees?a+2.5:this.y+Math.sin(this.timer*3)*.3;this.vy=Math.max(-3,Math.min(3,(m-this.y)*2))}else h?this.vy=Math.min(2,this.vy+20*e):this.vy=Math.max(-40,this.vy-28*e);const g=this.move(t,"x",this.vx*e),v=this.move(t,"z",this.vz*e);this.onGround=!1,this.move(t,"y",this.vy*e),(g||v)&&u&&!o.fly&&(this.onGround&&!this.collides(t,this.x,this.y+1.05,this.z)?this.vy=7.2:this.npc&&this.path&&this.path.length||this.onGround&&(this.yaw+=Math.PI*(.5+n()),this.timer=.5)),this.y<-10&&(this.y=oe),this.moving=u>0&&Math.abs(this.vx)+Math.abs(this.vz)>.1}hit(t,e,n){if(this.npc)return!1;this.hp-=t,this.hurtT=.35,this.hostile||(this.flee=3.5);const s=Math.hypot(this.x-e,this.z-n)||1;return this.x+=(this.x-e)/s*.15,this.z+=(this.z-n)/s*.15,this.vy=4.5,this.hp<=0}record(){return[this.type,+this.x.toFixed(2),+this.y.toFixed(2),+this.z.toFixed(2),this.hp]}}function pM(i,t,e,n,s,r,a,o,l,c,h,u){let f=0,d=1/0;const g=[i,t,e],v=[n,s,r],m=[a,o,l],p=[c,h,u];for(let x=0;x<3;x++){if(Math.abs(v[x])<1e-9){if(g[x]<m[x]||g[x]>p[x])return 1/0;continue}let y=(m[x]-g[x])/v[x],M=(p[x]-g[x])/v[x];if(y>M){const C=y;y=M,M=C}if(f=Math.max(f,y),d=Math.min(d,M),f>d)return 1/0}return f}class mM{constructor(t,e,n,s=!0){if(this.world=t,this.seed=e|0,this.enabled=s,this.store=new Map,n&&typeof n=="object")for(const r of Object.keys(n)){const a=n[r],o=Number(r);!Array.isArray(a)||!Number.isFinite(o)||this.store.set(o,a.filter(l=>Array.isArray(l)&&Number.isInteger(l[0])&&l[0]>=0&&l[0]<tf&&l.slice(1,5).every(Number.isFinite)))}this.list=[],this.active=new Set,this.lastPC=null,this.rnd=Math.random,this.onAdd=()=>{},this.onRemove=()=>{},this.onAttack=()=>{},this.onPoof=()=>{},this.day=!0,this.spawnT=3,this.villages=new Map,this.findVillages=null,this.time=.2}spawnRecords(t,e){const n=this.seed+9001;if(jt(t,e,n)>.2)return null;const s=this.world.getChunk(t,e);if(!s)return null;const r=Math.floor(jt(t,e,n+1)*tf),a=2+Math.floor(jt(t,e,n+2)*3),o=[];for(let l=0;l<a*3&&o.length<a;l++){const c=Math.floor(jt(t*31+l,e,n+3)*F),h=Math.floor(jt(t,e*31+l,n+4)*F),u=c+h*F;let f=Math.min(oe-3,s.maxY+1);for(;f>0&&s.data[u+f*256]===_.AIR;)f--;const d=s.data[u+f*256];!fM.has(d)||f<te||s.data[u+(f+1)*256]!==_.AIR||s.data[u+(f+2)*256]!==_.AIR||o.push([r,t*F+c+.5,f+1,e*F+h+.5,ia[r].hp])}return o.length?o:null}activate(t,e,n){this.active.add(t);let s=this.store.get(t);if(s?this.store.delete(t):s=this.spawnRecords(e,n),!!s){if(!s.length){this.store.set(t,s);return}for(const r of s){if(this.list.length>=rf){this.stash(r);continue}const a=new Il(r[0],r[1],r[2],r[3],r[4]);a.yaw=jt(Math.floor(r[1]),Math.floor(r[3]),5)*6.28,this.list.push(a),this.onAdd(a)}}}stash(t){const e=Or(Math.floor(t[1]/F),Math.floor(t[3]/F));let n=this.store.get(e);n||this.store.set(e,n=[]),n.push(t)}remove(t,e){const n=this.list.indexOf(t);if(!(n<0)&&(this.list.splice(n,1),this.onRemove(t),!(t.hostile||t.npc)))if(e)this.stash(t.record());else{const s=Or(Math.floor(t.x/F),Math.floor(t.z/F));!this.store.has(s)&&!this.active.has(s)&&this.store.set(s,[])}}hostile(t){return t.hostile}hostileCount(){let t=0;for(const e of this.list)e.hostile&&t++;return t}spawnHostile(t,e,n,s,r=this.rnd){if(this.hostileCount()>=lM||this.list.length>=rf)return null;for(let a=0;a<6;a++){const o=r()*Math.PI*2,l=14+r()*12,c=Math.floor(t+Math.cos(o)*l),h=Math.floor(n+Math.sin(o)*l),u=this.world.getChunk(c>>4,h>>4);if(!u)continue;const f=this.world.heightmap(u)[(c&15)+(h&15)*F];for(let d=Math.min(oe-3,Math.floor(e)+8);d>Math.max(1,Math.floor(e)-10);d--){if(!ta[this.world.getBlock(c,d-1,h)]||this.world.getBlock(c,d-1,h)===_.WATER||this.world.getBlock(c,d,h)!==_.AIR||this.world.getBlock(c,d+1,h)!==_.AIR)continue;const g=d>=f,v=!g&&d<te-4;if(g&&s||v){for(const{v:x}of this.villages.values())if(Math.hypot(x.x-c,x.z-h)<30)return null;const m=v?r()<.5?aM:ef:r()<.3?nf:ef,p=new Il(m,c+.5,m===nf?d+3:d,h+.5);return p.yaw=r()*6.28,this.list.push(p),this.onAdd(p),p}break}}return null}refresh(t,e){if(!this.enabled)return;const n=Math.floor(t/F),s=Math.floor(e/F);for(let r=-Nr;r<=Nr;r++)for(let a=-Nr;a<=Nr;a++){const o=n+a,l=s+r,c=Or(o,l);this.active.has(c)||!this.world.getChunk(o,l)||this.activate(c,o,l)}for(const r of this.active){const a=Math.floor(r/65536)-32768,o=r%65536-32768;Math.max(Math.abs(a-n),Math.abs(o-s))<=Nr+1||this.active.delete(r)}for(const r of this.list.slice()){const a=Or(Math.floor(r.x/F),Math.floor(r.z/F));if(r.hostile){const o=Math.hypot(r.x-t,r.z-e)>40,l=this.world.getChunk(Math.floor(r.x)>>4,Math.floor(r.z)>>4),c=l&&Math.floor(r.y)>=this.world.heightmap(l)[(Math.floor(r.x)&15)+(Math.floor(r.z)&15)*F];(o||this.day&&c)&&(this.onPoof(r),this.remove(r,!1))}else!r.npc&&!this.active.has(a)&&this.remove(r,!0)}this.refreshVillages(t,e)}refreshVillages(t,e){for(const[n,s]of this.villages)if(!(Math.hypot(s.v.x-t,s.v.z-e)<112)){for(const r of s.list)this.remove(r,!1);this.villages.delete(n)}if(this.findVillages)for(const n of this.findVillages(t,e))this.villages.has(n.id)||Math.hypot(n.x-t,n.z-e)>96||!this.world.getChunk(n.x>>4,n.z>>4)||this.villages.set(n.id,{v:n,list:this.spawnVillagers(n)})}spawnVillagers(t){const e=[];return t.houses.forEach((n,s)=>{const r=new Il(oM,n.x+.5,t.y+1,n.z+.5);r.name=n.role.name,r.role=n.role.key,r.vid=t.id,r.home={x:n.x+.5,z:n.z+.5},r.front={x:n.front.x+.5,z:n.front.z+.5},r.work=Jx(t,n),r.plaza={x:t.x+.5+(s&1?2.2:-2.2),z:t.z+.5+(s<2?-2.2:2.2)};const a=sf(this.time),o=a==="home"?r.home:a==="work"?r.work:r.plaza;r.phase=a,r.warp(this.world,o.x,o.z),this.list.push(r),this.onAdd(r),e.push(r)}),e}route(t,e){const n=Math.abs(t.x-t.home.x)<2.6&&Math.abs(t.z-t.home.z)<2.6;if(e==="home")return n?[t.home]:[t.front,t.home];const s=e==="work"?t.work:t.plaza;return n?[t.front,s]:[s]}update(t,e,n,s={}){if(!this.enabled)return;const r=s.py??0;this.day=!s.night,this.time=s.time??.2;const a=sf(this.time);if(s.hostiles)this.spawnT-=t,this.spawnT<=0&&(this.spawnT=3,this.spawnHostile(e,r,n,!!s.night));else if(this.hostileCount())for(const c of this.list.slice())c.hostile&&this.remove(c,!1);const o=Math.floor(e/F),l=Math.floor(n/F);(!this.lastPC||this.lastPC[0]!==o||this.lastPC[1]!==l||(this.refreshT=(this.refreshT||0)-t)<=0)&&(this.lastPC=[o,l],this.refreshT=1,this.refresh(e,n));for(const c of this.list){c.npc&&c.phase!==a&&(c.phase=a,c.path=this.route(c,a),c.bestD=1/0,c.stuck=0);const h=Math.hypot(c.x-e,c.z-n);if(c.hostile){let u=e,f=r,d=n,g=h;if(c.target=0,s.others)for(const v of s.others){const m=Math.hypot(c.x-v.x,c.z-v.z);m<g&&(g=m,u=v.x,f=v.y,d=v.z,c.target=v.id)}c.update(this.world,t,this.rnd,u,d,f)}else h<uM||c.flee>0?c.update(this.world,t,this.rnd,e,n,r):(c.acc+=t,c.acc>=.25&&(c.update(this.world,Math.min(c.acc,.25),this.rnd,e,n,r),c.acc=0));c.attack&&(c.attack=!1,this.onAttack(c))}}raycast(t,e,n,s,r,a,o){let l=null,c=o;for(const h of this.list){const u=h.T.half,f=pM(t,e,n,s,r,a,h.x-u,h.y,h.z-u,h.x+u,h.y+h.T.h,h.z+u);f<c&&(c=f,l=h)}return l?{mob:l,t:c}:null}serialize(){const t={};for(const[e,n]of this.store)t[e]=n.slice();for(const e of this.active)t[e]||(t[e]=[]);for(const e of this.list){if(e.hostile||e.npc)continue;const n=Or(Math.floor(e.x/F),Math.floor(e.z/F));(t[n]||(t[n]=[])).push(e.record())}for(const e of this.active){if(t[e].length)continue;const n=Math.floor(e/65536)-32768,s=e%65536-32768;jt(n,s,this.seed+9001)>.2&&delete t[e]}return t}clear(){for(const t of this.list)this.onRemove(t);this.list=[],this.active.clear(),this.villages.clear()}}function Od(i,t=Math.random){return ia[i].drops.map(([e,n,s])=>[e,n+Math.floor(t()*(s-n+1))]).filter(([,e])=>e>0)}const yn=.3,Ja=1.8,Nl=1.62,Ur=.001;class gM{constructor(){this.x=0,this.y=0,this.z=0,this.vx=0,this.vy=0,this.vz=0,this.onGround=!1,this.inWater=!1,this.flying=!1,this.coyote=0,this.fallT=0,this.gliding=!1,this.hook=!1,this.lifted=!1,this.bounces=0,this.eyeWater=!1,this.impact=0}collides(t,e,n,s){const r=Math.floor(e-yn),a=Math.floor(e+yn-1e-7),o=Math.floor(s-yn),l=Math.floor(s+yn-1e-7),c=Math.floor(n),h=Math.floor(n+Ja-1e-7);this.shaped=!1;for(let u=c;u<=h;u++)for(let f=o;f<=l;f++)for(let d=r;d<=a;d++){if(!t.isSolid(d,u,f))continue;const g=t.getBlock(d,u,f);if(!Ki[g])return!0;if(E1(g,(v,m,p)=>t.getBlock(v,m,p),d,u,f,e-yn,n,s-yn,e+yn,n+Ja,s+yn))return this.shaped=!0,!0}return!1}move(t,e,n){for(;n!==0;){const s=Math.abs(n)>.2?Math.sign(n)*.2:n;if(n-=s,this[e]+=s,this.collides(t,this.x,this.y,this.z)){if(this.shaped){this.moveShaped(t,e,s);return}e==="y"?this.y=s>0?Math.floor(this.y+Ja)-Ja-Ur:Math.floor(this.y)+1+Ur:this[e]=s>0?Math.floor(this[e]+yn)-yn-Ur:Math.floor(this[e]-yn)+1+yn+Ur,this["v"+e]=0,e==="y"&&s<0&&(this.onGround=!0);return}}}moveShaped(t,e,n){if(e!=="y"&&this.onGround){const a=this.y;for(const o of[.25,.5+.001])if(!this.collides(t,this.x,a+o,this.z)){let l=a,c=a+o;for(let h=0;h<10;h++){const u=(l+c)/2;this.collides(t,this.x,u,this.z)?l=u:c=u}this.y=c+Ur;return}}this[e]-=n;let s=0,r=1;for(let a=0;a<10;a++){const o=(s+r)/2;this[e]+=n*o;const l=this.collides(t,this.x,this.y,this.z);this[e]-=n*o,l?r=o:s=o}this[e]+=n*s,this["v"+e]=0,e==="y"&&n<0&&(this.onGround=!0)}onLadder(t){const e=Math.floor(this.x),n=Math.floor(this.z);return t.getBlock(e,Math.floor(this.y+.1),n)===_.LADDER||t.getBlock(e,Math.floor(this.y+1),n)===_.LADDER}update(t,e,n,s){if(t.isLoaded&&!t.isLoaded(Math.floor(this.x),Math.floor(this.z))){this.vx=this.vy=this.vz=0,this.waiting=!0;return}this.waiting=!1;for(let o=0;o<12&&this.collides(t,this.x,this.y,this.z);o++)this.y+=1;const r=Math.max(1,Math.ceil(e*120-1e-9)),a=e/r;for(let o=0;o<r;o++)this.step(t,a,n,s)}step(t,e,n,s){const r=Math.sin(s),a=Math.cos(s);let o=-n.f*r+n.r*a,l=-n.f*a-n.r*r;const c=Math.hypot(o,l);c>1&&(o/=c,l/=c);const h=Math.floor(this.x),u=Math.floor(this.z);this.inWater=t.getBlock(h,Math.floor(this.y+.4),u)===_.WATER;const f=this.eyeWater=t.getBlock(h,Math.floor(this.y+1.5),u)===_.WATER,d=this.onGround?t.getBlock(h,Math.floor(this.y-.05),u):_.AIR;if(this.lifted=!1,!this.flying)for(let m=0,p=Math.floor(this.y-.1);m<=11;m++,p--){const x=t.getBlock(h,p,u);if(x===_.WIND){this.lifted=!0;break}if(x!==_.AIR&&x!==_.WATER)break}const g=!this.onGround&&!this.inWater&&!this.flying;if(this.fallT=g&&this.vy<0?this.fallT+e:0,this.gliding=g&&n.jump&&this.fallT>.45&&!this.lifted&&!this.hook,!this.hook){let m;this.flying?m=n.sprint?16:10.5:this.gliding?(m=9.5,c<.1&&(o=-r,l=-a)):this.inWater?m=2.8:m=n.sprint?5.9:4.3,d===_.TURBO&&(m*=2.4);const p=Math.min(1,(this.flying?8:this.onGround?14:this.inWater?5:this.gliding?2.5:4)*e);if(this.vx+=(o*m-this.vx)*p,this.vz+=(l*m-this.vz)*p,this.flying){const x=((n.jump?1:0)-(n.down?1:0))*(n.sprint?12:8);this.vy+=(x-this.vy)*Math.min(1,8*e)}else this.inWater?(this.vy-=9*e,n.jump&&(f?this.vy+=24*e:this.vy=Math.max(this.vy,6.5)),this.vy-=this.vy*Math.min(1,3*e),this.vy=Math.max(-4,Math.min(this.vy,4))):this.onLadder(t)?(this.vy=n.jump||n.f>.3?3.4:n.sprint&&!n.f?0:Math.max(this.vy-28*e,-2.2),this.fallT=0):(this.vy=Math.max(-55,this.vy-28*e),this.gliding&&(this.vy=Math.max(this.vy,-2.2)),this.lifted&&(this.vy=Math.min(7.5,this.vy+60*e)),n.jump&&(this.onGround||this.coyote>0)&&(this.vy=d===_.FEDER?15:8.8,this.onGround=!1,this.coyote=0))}const v=this.vy;this.move(t,"x",this.vx*e),this.move(t,"z",this.vz*e),this.onGround=!1,this.move(t,"y",this.vy*e),this.onGround&&v<-2&&t.getBlock(h,Math.floor(this.y-.05),u)===_.FEDER?(this.vy=Math.min(26,Math.max(10,-v*.92)),this.onGround=!1,this.bounces++):this.onGround&&v<0&&!this.hook&&!this.flying&&(this.impact=Math.max(this.impact,-v)),this.coyote=this.onGround?.1:this.coyote-e}}function af(i,t,e,n,s,r,a,o){let l=Math.floor(t),c=Math.floor(e),h=Math.floor(n);const u=s>0?1:-1,f=r>0?1:-1,d=a>0?1:-1,g=s!==0?Math.abs(1/s):1/0,v=r!==0?Math.abs(1/r):1/0,m=a!==0?Math.abs(1/a):1/0;let p=s!==0?(s>0?l+1-t:t-l)*g:1/0,x=r!==0?(r>0?c+1-e:e-c)*v:1/0,y=a!==0?(a>0?h+1-n:n-h)*m:1/0;for(;;){let M=0,C=0,A=0,w;if(p<=x&&p<=y?(w=p,p+=g,l+=u,M=-u):x<=y?(w=x,x+=v,c+=f,C=-f):(w=y,y+=m,h+=d,A=-d),w>o)return null;const L=i.getBlock(l,c,h);if(L!==_.AIR&&L!==_.WATER)return{x:l,y:c,z:h,nx:M,ny:C,nz:A,type:L,t:w}}}let Bt=null,Fi=null;const sn={enabled:!0,vol:.8,music:.8,amb:.7};function Xi(){try{Bt||(Bt=new(window.AudioContext||window.webkitAudioContext)),Bt.state==="suspended"&&Bt.resume()}catch{Bt=null}}const Ud=i=>!!Bt&&sn.enabled&&Bt.state==="running"&&i>.001;function Qe(i,t,e,n="lowpass",s=!1){if(e*=s?sn.amb:sn.vol,!Ud(e))return;if(!Fi){Fi=Bt.createBuffer(1,Math.floor(Bt.sampleRate*.25),Bt.sampleRate);const c=Fi.getChannelData(0);for(let h=0;h<c.length;h++)c[h]=Math.random()*2-1}const r=Bt.createBufferSource(),a=Bt.createBiquadFilter(),o=Bt.createGain(),l=Bt.currentTime;r.buffer=Fi,a.type=n,a.frequency.value=i,o.gain.setValueAtTime(e,l),o.gain.exponentialRampToValueAtTime(.001,l+t),r.connect(a),a.connect(o),o.connect(Bt.destination),r.start(l),r.stop(l+t+.02)}const zc={fn:null},pa=i=>{zc.fn&&zc.fn(i)},Ol=()=>{pa("break"),Qe(1100,.14,.5)},on=()=>{pa("place"),Qe(600,.09,.4)},pn=()=>{pa("deny"),Qe(220,.1,.3)};function We(i,t,e,n,s,r,a=0,o=0){if(s*=r?sn.amb:sn.vol,!Ud(s))return;const l=Bt.currentTime+o,c=Bt.createOscillator(),h=Bt.createGain();if(c.type=i,c.frequency.setValueAtTime(t,l),c.frequency.exponentialRampToValueAtTime(Math.max(20,e),l+n),a){const u=Bt.createOscillator(),f=Bt.createGain();u.frequency.value=a,f.gain.value=t*.04,u.connect(f),f.connect(c.frequency),u.start(l),u.stop(l+n+.02)}h.gain.setValueAtTime(1e-4,l),h.gain.exponentialRampToValueAtTime(s,l+Math.min(.04,n/4)),h.gain.exponentialRampToValueAtTime(.001,l+n),c.connect(h),h.connect(Bt.destination),c.start(l),c.stop(l+n+.02)}const of={weich:()=>Qe(380,.08,.22,"lowpass",!0),stein:()=>{Qe(2400,.05,.16,"bandpass",!0),Qe(500,.04,.12,"lowpass",!0)},holz:()=>{We("triangle",190,120,.07,.16,!0),Qe(900,.04,.08,"bandpass",!0)},sand:()=>Qe(3200,.11,.12,"highpass",!0),schnee:()=>{Qe(1600,.12,.16,"bandpass",!0),Qe(300,.08,.1,"lowpass",!0)},glas:()=>We("sine",2200,1900,.06,.07,!0)},_M=i=>(of[i]||of.weich)(),lf=i=>{Qe(1400,i?.45:.18,i?.35:.14,"bandpass",!0),i&&Qe(400,.3,.2,"lowpass",!0)},cf={huhn:i=>{We("square",1200,1500,.06,i*.08,!0),We("square",1300,1e3,.07,i*.08,!0,0,.09)},schaf:i=>We("sawtooth",330,300,.5,i*.1,!0,7),kuh:i=>We("sawtooth",140,105,.9,i*.16,!0,3),rauschling:i=>{Qe(5e3,.5,i*.18,"bandpass",!0),We("sawtooth",90,70,.4,i*.08,!0,11)},hoehlenwesen:i=>We("square",70,50,.35,i*.14,!0,18),drohne:i=>We("sawtooth",210,230,.6,i*.06,!0,30),dorfbewohner:i=>{We("triangle",240,300,.12,i*.12,!0),We("triangle",280,220,.15,i*.12,!0,0,.14)}};function vM(i,t){const e=Math.max(0,1-t/20);e>0&&cf[i]&&cf[i](e)}const hf=()=>We("square",1800,900,.04,.12,!1),xM=()=>{Qe(700,.25,.3,"bandpass"),We("square",160,110,.18,.1,!1)},MM=()=>We("sine",880,880,.12,.12,!1),yM=()=>pa("done")||[0,4,7,12].forEach((i,t)=>We("triangle",523*Math.pow(2,i/12),523*Math.pow(2,i/12),.22,.14,!1,0,t*.11)),Ul=()=>{pa("hurt"),We("sawtooth",300,120,.18,.16,!1),Qe(800,.1,.2)},pe={on:!1,timer:0,next:0,step:0,master:null,seed:0},SM=[[0,3,5,7,10],[0,2,4,7,9],[0,2,3,7,8]],uf=i=>440*Math.pow(2,(i-69)/12);function ff(i,t,e,n,s,r){const a=Bt.createOscillator(),o=Bt.createGain();a.type=i,a.frequency.setValueAtTime(t,e),o.gain.setValueAtTime(s,e),o.gain.exponentialRampToValueAtTime(.001,e+n);let l=a;if(r){const c=Bt.createBiquadFilter();c.type="lowpass",c.frequency.value=r,a.connect(c),l=c}l.connect(o),o.connect(pe.master),a.start(e),a.stop(e+n+.02)}function df(i,t,e,n,s){if(!Fi){Fi=Bt.createBuffer(1,Math.floor(Bt.sampleRate*.25),Bt.sampleRate);const l=Fi.getChannelData(0);for(let c=0;c<l.length;c++)l[c]=Math.random()*2-1}const r=Bt.createBufferSource(),a=Bt.createBiquadFilter(),o=Bt.createGain();r.buffer=Fi,a.type=n,a.frequency.value=s,o.gain.setValueAtTime(e,i),o.gain.exponentialRampToValueAtTime(.001,i+t),r.connect(a),a.connect(o),o.connect(pe.master),r.start(i),r.stop(i+t+.02)}function EM(i,t){const e=SM[pe.seed%3],n=45+(pe.seed>>2)%5,s=i%16,r=Math.floor(i/16)%4;if(s%4===0){const o=Bt.createOscillator(),l=Bt.createGain();o.frequency.setValueAtTime(150,t),o.frequency.exponentialRampToValueAtTime(42,t+.14),l.gain.setValueAtTime(.9,t),l.gain.exponentialRampToValueAtTime(.001,t+.2),o.connect(l),l.connect(pe.master),o.start(t),o.stop(t+.22)}(s===4||s===12)&&df(t,.12,.35,"bandpass",1800),s%2===0&&df(t,.04,s%4===2?.22:.1,"highpass",7e3),(s%4===2||s===7||s===15)&&ff("sawtooth",uf(n+e[(r+(s>>2))%5]-12),t,.2,.2,500);const a=(i*3+pe.seed+r*2)%5;(s%2===1||s%4===0)&&ff("triangle",uf(n+24+e[a]+(s>8?12:0)),t,.16,.12,3e3)}function bM(){if(!Bt||Bt.state!=="running")return;const i=118+pe.seed%3*6,t=60/i/4;for(pe.next<Bt.currentTime&&(pe.next=Bt.currentTime+.05);pe.next<Bt.currentTime+.25;)EM(pe.step++,pe.next),pe.next+=t}function pf(i,t){if(i*=sn.music,!Bt||!sn.enabled||i<=.01){pe.on&&(pe.on=!1,clearInterval(pe.timer),pe.master&&pe.master.gain.setTargetAtTime(0,Bt.currentTime,.1));return}pe.master||(pe.master=Bt.createGain(),pe.master.gain.value=0,pe.master.connect(Bt.destination)),pe.on||(pe.on=!0,pe.seed=t,pe.next=0,pe.timer=setInterval(bM,80)),pe.master.gain.setTargetAtTime(Math.min(1,i)*.45,Bt.currentTime,.15)}const TM=[_.NEON_R,_.NEON_B,_.NEON_G,_.NEON_P],kd=[{t:"Holz sammeln",d:"Die Funkzentrale will wieder auf Sendung. Dafür braucht sie Material. Schlage 5 Holzblöcke an Bäumen ab.",k:"break",a:[_.WOOD],n:5,r:{[_.PLANKS]:4}},{t:"Bretter herstellen",d:"Öffne das Inventar (E oder 🎒) und stelle unter „Herstellen“ Bretter aus Holz her. Du brauchst 8 Bretter.",k:"craft",a:[_.PLANKS],n:8,r:{[_.DIRT]:10}},{t:"Fundament legen",d:"Setze 12 Bretter als Fundament für die Sendehütte.",k:"place",a:[_.PLANKS],n:12,r:{[_.STONE]:4}},{t:"Steinbruch",d:"Grabe nach Stein, unter Erde und in Hügeln. Sammle 12 Steinblöcke im Vorrat.",k:"have",a:[_.STONE],n:12,r:{[_.SAND]:4}},{t:"Strand und Glas",d:"Sand findest du am Wasser. Stelle 4 Glas her (2 Sand ergeben 1 Glas).",k:"craft",a:[_.GLASS],n:4,r:{[_.WOOD]:2,[_.GLASS]:2}},{t:"Leuchtfeuer",d:"Stelle 2 Leuchtblöcke her (Glas und Holz).",k:"craft",a:[_.LAMP],n:2,r:{[_.LEAVES]:4,[_.PLANKS]:2}},{t:"Licht an",d:"Setze beide Leuchtblöcke, damit die Hütte auch nachts zu sehen ist.",k:"place",a:[_.LAMP],n:2,r:{[_.LAMP]:2}},{t:"Hoch hinaus",d:"Der Funkmast muss hoch stehen. Erreiche eine Höhe von 14 Blöcken über dem Startpunkt, zum Beispiel mit einem Turm aus Blöcken.",k:"height",n:14,r:{[_.PLANKS]:6,[_.LEAVES]:4}},{t:"Der Funkmast",d:"Stelle einen Radio-Block her (4 Bretter und 1 Leuchtblock) und setze ihn. Hör zu, wie er spielt.",k:"place",a:[_.RADIO],n:1,r:{[_.PLANKS]:4,[_.LEAVES]:4}},{t:"Federn für die Landung",d:"Stelle 2 Federblöcke her (Blätter und Bretter).",k:"craft",a:[_.FEDER],n:2,r:{[_.STONE]:4}},{t:"Sprungtraining",d:"Setze einen Federblock und springe 3-mal darauf zurück in die Luft. Aufprall genügt, die Feder wirft dich hoch.",k:"bounce",n:3,r:{[_.LAMP]:1}},{t:"Seilhaken",d:"Ziele auf einen entfernten Block und benutze den Seilhaken (Q oder Taste Haken) 2-mal.",k:"hook",n:2,r:{[_.LEAVES]:4}},{t:"Gleitflug",d:"Springe von deinem Turm und halte im Fall die Sprungtaste gedrückt. Gleite insgesamt 5 Sekunden.",k:"glide",n:5,r:{[_.LAMP]:4,[_.SAND]:4}},{t:"Neon-Show",d:"Stelle Neonblöcke her (Leuchtblock mit Sand, Glas, Blättern oder Erde) und setze 4 davon.",k:"place",a:TM,n:4,r:{[_.GLASS]:2,[_.LAMP]:1}},{t:"Regenbogen-Finale",d:"Setze als Krönung einen Regenbogen-Block (2 Glas und 1 Leuchtblock) auf deinen Sendeturm.",k:"place",a:[_.RAINBOW],n:1,r:{[_.RAINBOW]:2}}],AM=5,wM=4,RM=[_.PLANKS,_.STONE,_.COBBLE,_.DIRT,_.WOOD,_.SPRUCE,_.BRICK,_.SANDSTONE,_.GLASS,_.MARBLE],sa=[null,{t:"Das erste Signal",d:"Ein gewaltiges Funknetz verband einst alle Regionen. Dann kam das große Rauschen, und die Stationen verstummten. Du stehst allein in der Wildnis. Irgendwo knistert ein Signal."},{t:"Der vergessene Sender",d:"Aus deinem Radio dringt eine Stimme: „…Dorf … der Mast … hört uns jemand?“ Der Wegpunkt zeigt dir den Weg."},{t:"Stimmen aus der Tiefe",d:"Funkerin Lotte: „Der Mast braucht Funkkristalle. Sie wachsen tief unten, wo das Rauschen am lautesten ist.“"},{t:"Die zerbrochene Verbindung",d:"Aus Kupfer und Kristallen entsteht ein Funksender. Relais tragen das Signal weiter, Empfänger fangen es auf."},{t:"Das Herz des Rauschens",d:"Das Rauschen wird stärker. Drohnen stören die Leitungen, und in der Tiefe regt sich etwas."},{t:"Die letzte Frequenz",d:"Lotte: „Ein hoher Turm, drei Empfänger, und das Signal geht wieder um die ganze Welt.“"}],zd=[{c:1,t:"Holz sammeln",d:"Schlage 6 Holzblöcke an Bäumen ab. Im Überleben dauert das etwas, mit einer Axt geht es schneller.",k:"break",a:[_.WOOD,_.SPRUCE],n:6,r:{[_.PLANKS]:4}},{c:1,t:"Werkbank",d:"Öffne das Inventar (E oder 🎒), stelle Bretter her und daraus eine Werkbank.",k:"craft",a:[_.WORKBENCH],n:1,r:{[tt.STICK]:4}},{c:1,t:"Erstes Werkzeug",d:"Setze die Werkbank, drücke Setzen auf sie und stelle eine Holzspitzhacke her.",k:"craft",a:[tt.WOOD_PICK],n:1,r:{[tt.APPLE]:3}},{c:1,t:"Unterschlupf",d:"Die erste Nacht kommt. Baue dir mit 20 Blöcken (Bretter, Stein, Erde …) einen Unterschlupf.",k:"place",a:RM,n:20,r:{[_.LAMP]:2}},{c:1,t:"Licht für die Nacht",d:"Setze einen Leuchtblock in deinen Unterschlupf.",k:"place",a:[_.LAMP],n:1,r:{[tt.BREAD]:2}},{c:1,t:"Das erste Signal",d:"Baue ein Radio (4 Bretter und 1 Leuchtblock) und setze es. Hör genau hin.",k:"place",a:[_.RADIO],n:1,r:{[tt.MEAT_COOKED]:2}},{c:2,t:"Das Dorf",d:"Folge dem Wegpunkt 📍 bis ins Dorf.",k:"visit",n:1,r:{[tt.BREAD]:2}},{c:2,t:"Erste Kontakte",d:"Sprich mit einem Dorfbewohner: Setzen-Taste auf ihn.",k:"talk",n:1,r:{[tt.SEEDS]:4}},{c:2,t:"Erntezeit",d:"Ernte reifen Weizen auf dem Dorffeld oder auf deinem eigenen. Sammle 6 Weizen.",k:"have",a:[tt.WHEAT],n:6,r:{[tt.BREAD]:1}},{c:2,t:"Tauschhandel",d:"Tausche etwas mit einem Dorfbewohner.",k:"trade",n:1,r:{[tt.COPPER_INGOT]:1}},{c:3,t:"Steinwerkzeug",d:"Stelle an der Werkbank eine Steinspitzhacke her. Ohne sie gibt Eisen und Funkkristall nichts her.",k:"craft",a:[tt.STONE_PICK],n:1,r:{[_.LAMP]:4}},{c:3,t:"Abstieg",d:"Steige in eine Höhle, bis unter Höhe 18 (Y-Wert oben links). Vorsicht, dort unten ist es nie ganz ruhig.",k:"depth",y:18,n:1,r:{[tt.MEAT_COOKED]:2}},{c:3,t:"Kupfer schmelzen",d:"Baue einen Schmelzofen (8 Stein, an der Werkbank) und schmelze 3 Kupferbarren aus Kupfererz und Kohle.",k:"craft",a:[tt.COPPER_INGOT],n:3,r:{[_.COAL]:4}},{c:3,t:"Funkkristalle",d:"Funkkristalle leuchten tief unter der Erde. Sammle 3 Stück.",k:"have",a:[_.CRYSTAL],n:3,r:{[tt.IRON_INGOT]:2}},{c:4,t:"Der Funksender",d:"Baue an der Werkbank einen Funksender (2 Kupferbarren, 1 Funkkristall, 1 Radio) und setze ihn.",k:"place",a:[_.SENDER],n:1,r:{[_.WIRE]:8}},{c:4,t:"Strom drauf",d:"Setze einen Schalter direkt neben den Sender (oder verbinde beide mit Signalleitungen) und schalte ihn mit der Setzen-Taste ein.",k:"place",a:[_.SWITCH],n:1,r:{[tt.COPPER_INGOT]:2}},{c:4,t:"Relais",d:"Ein Funkrelais trägt das Signal 24 Blöcke weiter. Baue eins (Kupfer, Kristall, 2 Stein) und setze es höchstens 24 Blöcke vom Sender entfernt.",k:"place",a:[_.RELAY],n:1,r:{[_.CRYSTAL]:1,[tt.COPPER_INGOT]:1}},{c:4,t:"Die Verbindung",d:"Bringe einen Empfänger zum Leuchten, der mindestens 40 Blöcke vom eingeschalteten Sender entfernt steht (über das Relais).",k:"reach",n:40,r:{[tt.IRON_INGOT]:3}},{c:5,t:"Gerüstet",d:"Stelle an der Werkbank einen Helm oder Harnisch her und lege ihn an (wählen, Setzen drücken).",k:"craft",a:[tt.COPPER_HELMET,tt.COPPER_CHEST,tt.IRON_HELMET,tt.IRON_CHEST],n:1,r:{[tt.BREAD]:3}},{c:5,t:"Störsender",d:"Nachts fliegen Störsender-Drohnen. Hol eine vom Himmel.",k:"kill",a:[AM],n:1,r:{[_.CRYSTAL]:1}},{c:5,t:"Wesen der Tiefe",d:"In tiefen Höhlen hausen Höhlenwesen. Besiege 2 davon.",k:"kill",a:[wM],n:2,r:{[tt.IRON_INGOT]:2}},{c:5,t:"Maschinen",d:"Schalte mit deinem Netz 3 Maschinen gleichzeitig ein: Signallampen oder Funktore neben Leitungen oder Empfängern.",k:"powered",n:3,r:{[_.RAINBOW]:1}},{c:6,t:"Der Funkturm",d:"Baue einen Turm: Erreiche 20 Blöcke über deinem Startpunkt.",k:"height",n:20,r:{[_.RELAY]:1}},{c:6,t:"Großes Netz",d:"Lass 3 Empfänger gleichzeitig leuchten.",k:"net",n:3,r:{[_.RAINBOW]:1}},{c:6,t:"Die letzte Frequenz",d:"Setze einen Regenbogen-Block auf deinen Funkturm. Das Netz steht, das Rauschen verstummt.",k:"place",a:[_.RAINBOW],n:1,r:{[_.RAINBOW]:2}}],er=i=>i&&i.c==="rauschen"?zd:kd;function Fd(i,t){const e=i.story,n=i.sigStats||{receivers:0,machines:0,reach:0};if(t.k==="have"){let s=0;for(const r of t.a)s+=i.inv[r]||0;return[s,t.n]}return t.k==="height"?[Math.max(0,Math.floor(e.max)),t.n]:t.k==="net"?[n.receivers,t.n]:t.k==="powered"?[n.machines,t.n]:t.k==="reach"?[Math.floor(n.reach),t.n]:[Math.floor(e.p),t.n]}const CM=480,kr=6,LM=`
attribute vec4 aCol; varying vec2 vUv; varying vec3 vLight; varying float vDist; varying float vRb;
uniform vec3 uAmb; uniform vec3 uSunCol; uniform vec3 uSunDir;
void main(){
  float f = aCol.a;
  vec3 n = f < 0.5 ? vec3(1.,0.,0.) : f < 1.5 ? vec3(-1.,0.,0.) : f < 2.5 ? vec3(0.,0.,1.) : f < 3.5 ? vec3(0.,0.,-1.) : f < 4.5 ? vec3(0.,1.,0.) : vec3(0.,-1.,0.);
  float sky = aCol.g;
  vec3 amb = uAmb * (0.62 + 0.38 * (n.y * 0.5 + 0.5)) * (0.5 + 0.5 * sky);
  vec3 dir = uSunCol * max(dot(n, uSunDir), 0.0) * sky;
  vLight = max((amb + dir) * aCol.r, vec3(min(aCol.b, 1.0)));
  vRb = aCol.b > 1.5 ? 1.0 : 0.0;
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vDist = length(mv.xyz);
  gl_Position = projectionMatrix * mv;
}`,DM=`
uniform sampler2D uMap; uniform vec3 uFog; uniform vec2 uFogRange; uniform float uCut; uniform float uTime;
varying vec2 vUv; varying vec3 vLight; varying float vDist; varying float vRb;
void main(){
  vec4 t = texture2D(uMap, vUv);
  if (t.a < uCut) discard;
  vec3 c = t.rgb * vLight;
  if (vRb > 0.5) { // Regenbogen-Block: wandernde Farben
    float hue = fract((vUv.x + vUv.y) * 14.0 + uTime * 0.25 + t.r * 0.35);
    vec3 rb = clamp(abs(fract(hue + vec3(0.0, 0.6667, 0.3333)) * 6.0 - 3.0) - 1.0, 0.0, 1.0);
    c = rb * (0.55 + 0.6 * t.r);
  }
  gl_FragColor = vec4(mix(c, uFog, smoothstep(uFogRange.x, uFogRange.y, vDist)), t.a);
}`,PM="varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }",IM=`
uniform vec3 uHor; uniform vec3 uZen; uniform vec3 uSunN; uniform vec3 uGlow; varying vec3 vDir;
void main(){
  float h = clamp(vDir.y, 0.0, 1.0);
  vec3 c = mix(uHor, uZen, pow(h, 0.5));
  c += uGlow * pow(max(dot(normalize(vDir), uSunN), 0.0), 6.0);
  gl_FragColor = vec4(c, 1.0);
}`,NM=`
uniform vec2 uOff; varying vec2 vUv; varying float vD;
void main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vUv = (wp.xz + uOff) / 520.0; vD = length(position.xy) / 1200.0; gl_Position = projectionMatrix * viewMatrix * wp; }`,OM=`
uniform sampler2D uTex; uniform vec3 uCol; varying vec2 vUv; varying float vD;
void main(){ float a = texture2D(uTex, vUv).a * (1.0 - smoothstep(0.45, 0.95, vD)) * 0.9; gl_FragColor = vec4(uCol, a); }`,kl=(i,t,e)=>i+(t-i)*e;function UM(i){if(i===_.SNOW)return"schnee";if(i===_.GLASS||i===_.ICE)return"glas";if(i===_.SAND||i===_.GRAVEL)return"sand";const t=Kt[i]&&Kt[i].tool;return t==="axt"?"holz":t==="spitzhacke"?"stein":"weich"}const Pi=(i,t,e)=>[kl(i[0],t[0],e),kl(i[1],t[1],e),kl(i[2],t[2],e)],Qa=(i,t,e)=>{const n=Math.max(0,Math.min(1,(e-i)/(t-i)));return n*n*(3-2*n)};class kM{constructor(t,e,n="auto"){this.coarse=e;const s=window.devicePixelRatio||1;this.renderer=new bx({canvas:t,antialias:n!=="eco"&&!(e&&s>=2.5),powerPreference:"high-performance"}),this.maxDpr=e?1.75:2,this.dprScale=1,this.budget=e?4:6,this.maxView=e?4:7,this.autoQ=!1,this.cloudsOn=!0,this.perf={acc:0,n:0,good:0},this.fps=0,this.placeDelay=!0,this.scene=new Tx,this.camera=new En(e?70:75,1,.08,1500),this.camera.rotation.order="YXZ",this.scene.add(this.camera),this.group=new Hn,this.scene.add(this.group);const r=Math.min(8,this.renderer.capabilities.getMaxAnisotropy()),a=p=>{const x=new lo(p);return x.magFilter=_n,x.minFilter=Yn,x.anisotropy=r,x.generateMipmaps=!0,x};this.atlasCanvas=O1(),this.atlasTex=new Rx(this.atlasCanvas.raw,this.atlasCanvas.width,this.atlasCanvas.height,wn),this.atlasTex.magFilter=_n,this.atlasTex.minFilter=Yn,this.atlasTex.anisotropy=r,this.atlasTex.generateMipmaps=!0,this.atlasTex.needsUpdate=!0,this.logoCanvas=U1(()=>{this.logoTex.needsUpdate=!0,!this.running&&this.world&&this.render()},()=>this.onLogos()),this.logoTex=a(this.logoCanvas),this.onLogos=()=>{},this.uni={uAmb:{value:new O(.44,.5,.62)},uSunCol:{value:new O(.6,.57,.5)},uSunDir:{value:new O(0,1,.25).normalize()},uFog:{value:new O(.68,.84,.95)},uFogRange:{value:new Yt(40,90)},uTime:{value:0}};const o=(p,x,y,M)=>new Gn({vertexShader:LM,fragmentShader:DM,transparent:y,depthWrite:!y,side:y?bn:pi,uniforms:{...M,uMap:{value:p},uCut:{value:x}}});this.matO=o(this.atlasTex,.5,!1,this.uni),this.matT=o(this.atlasTex,.02,!0,this.uni),this.matL=o(this.logoTex,.5,!1,this.uni),this.sky=new Hn,this.scene.add(this.sky),this.domeU={uHor:{value:new O},uZen:{value:new O},uSunN:{value:new O(1,0,0)},uGlow:{value:new O}};const l=new Ce(new th(700,20,12),new Gn({vertexShader:PM,fragmentShader:IM,uniforms:this.domeU,side:tn,depthWrite:!1,depthTest:!1}));l.renderOrder=-20,l.frustumCulled=!1,this.sky.add(l);const c=(p,x)=>{const y=new Ce(new ds(p,p),new Vi({color:x,fog:!1,depthWrite:!1}));return y.renderOrder=-10,this.sky.add(y),y};this.sun=c(80,16773808),this.moon=c(52,14674175);const h=new Float32Array(300*3);for(let p=0;p<300;p++){const x=Math.random()*2-1,y=Math.random()*Math.PI*2,M=Math.sqrt(1-x*x);h[p*3]=Math.cos(y)*M*600,h[p*3+1]=x*600,h[p*3+2]=Math.sin(y)*M*600}const u=new Oe;u.setAttribute("position",new Ne(h,3)),this.starMat=new ad({color:16777215,size:2,sizeAttenuation:!1,transparent:!0,opacity:0,fog:!1,depthWrite:!1}),this.stars=new Cx(u,this.starMat),this.stars.renderOrder=-15,this.sky.add(this.stars);const f=new lo(k1());f.wrapS=f.wrapT=go,f.minFilter=Yn,f.magFilter=_n,this.cloudU={uTex:{value:f},uCol:{value:new O(1,1,1)},uOff:{value:new Yt}},this.clouds=new Ce(new ds(2400,2400),new Gn({vertexShader:NM,fragmentShader:OM,uniforms:this.cloudU,transparent:!0,depthWrite:!1,side:bn})),this.clouds.rotation.x=-Math.PI/2,this.clouds.frustumCulled=!1,this.chunkSphereR=Math.hypot(F/2,oe/2,F/2)+1,this.scene.add(this.clouds);const d=new Lx(new qi(1.004,1.004,1.004));this.hl=new Tu(d,new Br({color:0,transparent:!0,opacity:.75})),this.hl.visible=!1,this.scene.add(this.hl),this.ghost=new Tu(d,new Br({color:16777215,transparent:!0,opacity:.55,depthTest:!1})),this.ghost.visible=!1,this.ghost.renderOrder=40,this.scene.add(this.ghost),this.buildMode=0,this.anchor=null,this.clip=null,this.batch=null,this.preview=!0,this.beam=new Lc(new Oe().setFromPoints([new O,new O]),new Br({color:16722538})),this.beam.frustumCulled=!1,this.beam.visible=!1,this.beamT=0,this.scene.add(this.beam);const g={uAmb:{value:new O(.62,.64,.7)},uSunCol:{value:new O(.5,.46,.38)},uSunDir:{value:new O(.35,.8,.5).normalize()},uFog:{value:new O},uFogRange:{value:new Yt(1e5,2e5)},uTime:this.uni.uTime},v=p=>{const x=o(p,.5,!1,g);return x.depthTest=!1,x};this.handMatO=v(this.atlasTex),this.handMatL=v(this.logoTex),this.hand=new Ce(new Oe,this.handMatO),this.hand.frustumCulled=!1,this.hand.renderOrder=50,this.hand.visible=!1,this.camera.add(this.hand),this.itemCanvas=z1(So.map(p=>Te[p]));const m=new lo(this.itemCanvas);if(m.magFilter=en,m.minFilter=en,m.generateMipmaps=!1,this.itemHand=new Ce(new ds(1,1),new Vi({map:m,transparent:!0,alphaTest:.5,depthTest:!1,side:bn})),this.itemHand.frustumCulled=!1,this.itemHand.renderOrder=50,this.itemHand.visible=!1,this.camera.add(this.itemHand),this.mobView=new V1(this.scene),this.mobs=null,this.light=1,this.vehView=new K1(this.scene),this.vehicles=null,this.ride=null,this.prevJump=!1,this.meshSeq=0,this.mwJobs=0,this.mw=null,typeof Worker<"u")try{this.mw=new Worker(new URL(""+new URL("meshworker-f07_iv9J.js",import.meta.url).href,import.meta.url),{type:"module"}),this.mw.onmessage=p=>this.onMeshed(p.data),this.mw.onerror=()=>{this.mw=null,this.mwJobs=0,this.scanDirty=!0}}catch{this.mw=null}this.handType=-1,this.swing=0,this.bob=0,this.parts=[],this.partCount=0,this.rope=new Lc(new Oe().setFromPoints([new O,new O]),new Br({color:16769162})),this.rope.frustumCulled=!1,this.rope.visible=!1,this.scene.add(this.rope),this.hookT=0,this.hookTarget=new O,this.wp=null,this.timeFrozen=!1,this.radioT=0,this.player=new gM,this.input={f:0,r:0,jump:!1,down:!1,sprint:!1},this.breakHeld=!1,this.placeHeld=!1,this.actCool=0,this.world=null,this.running=!1,this.raf=0,this.last=0,this.viewDist=e?4:7,this.offsets=[],this.setViewDist(this.viewDist),this.onChange=()=>{},this.onToast=()=>{},this.story=null,this.onQuest=()=>{},this.onQuestDone=()=>{},this.vitals=null,this.dead=!1,this.mine=null,this.deathLoss="keep",this.enemies=!0,this.farm=new Zu,this.age=0,this.history=[],this.redoList=[],this.onVitals=()=>{},this.onHurt=()=>{},this.onDeath=()=>{},this.onMine=()=>{},this.onStation=()=>{},this.onTrade=()=>{},this.onBuildMode=()=>{},this.onRide=()=>{},this.mp=null,this.net=null,this.armor={kopf:0,brust:0},this.armWear={kopf:0,brust:0},this.resize()}setQuality(t,e){const n=Nc[t]||Nc.standard;this.qName=t,this.autoQ=!!e,this.maxDpr=n.dpr,this.dprScale=1,this.budget=n.budget,this.cloudsOn=n.clouds,this.maxView=n.view,this.perf.acc=this.perf.n=this.perf.good=0,this.menuMode?this.savedView=n.view:this.setViewDist(n.view),this.resize()}measure(t){const e=this.perf;if(t>250||(e.acc+=t,e.n++,e.acc<2e3))return;const n=e.acc/e.n;e.acc=e.n=0,this.fps=Math.round(1e3/n),!(!this.autoQ||this.menuMode)&&(n>26?(e.good=0,this.dprScale>.6?(this.dprScale=Math.max(.6,this.dprScale-.15),this.resize()):this.viewDist>3&&this.setViewDist(this.viewDist-1)):n<18&&++e.good>=3&&(e.good=0,this.dprScale<1?(this.dprScale=Math.min(1,this.dprScale+.1),this.resize()):this.viewDist<this.maxView&&this.setViewDist(this.viewDist+1)))}setViewDist(t){this.viewDist=t;const e=t+2,n=[];for(let s=-e-1;s<=e+1;s++)for(let r=-e-1;r<=e+1;r++){const a=Math.hypot(r,s);a<=e&&n.push([r,s,a])}n.sort((s,r)=>s[2]-r[2]),this.offsets=n,this.scanDirty=!0}resize(){const t=window.innerWidth,e=window.innerHeight;this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,this.maxDpr)*this.dprScale),this.renderer.setSize(t,e,!1),this.camera.aspect=t/e,this.camera.updateProjectionMatrix(),!this.running&&this.world&&this.render()}start(t){if(this.stop(),this.clearWorld(),this.leaveMenu(),this.gen=gd(t.gen),this.world=new Nu(t.seed,r1(t.edits),this.gen),this.name=t.name,this.seed=t.seed,this.mode=t.mode,this.time=t.time??.08,this.hotbar=Array.isArray(t.hotbar)&&t.hotbar.length===9?t.hotbar.map(s=>Number.isInteger(s)&&zu(s)?s:0):[1,2,3,4,5,6,7,8,9],this.sel=t.sel??0,this.inv=t.inv?{...t.inv}:{[_.DIRT]:20,[_.PLANKS]:10,[_.GLASS]:4},this.story=t.mode==="story"?t.story?{...t.story}:{i:0,p:0,max:0,done:!1,c:this.gen===3?"rauschen":void 0}:null,this.story&&!this.story.c&&delete this.story.c,this.sigStats={receivers:0,machines:0,reach:0,senders:0},this.sigRetry=!1,!t.inv&&t.mode==="survival"){for(let s=0;s<16;s++)this.inv[_i+s]=4;for(let s=0;s<od;s++)this.inv[Pc+s]=8}if(this.wp=t.wp||null,this.map=new eM(t.map),this.hookT=0,this.rope.visible=!1,this.timeFrozen=!1,this.handType=-1,this.survival=t.mode==="survival"||t.mode==="story"&&this.gen===3,this.vitals=this.survival?new Qu(t.vit||{}):null,this.dead=!1,this.mine=null,this.player.impact=0,this.dur={},t.dur&&typeof t.dur=="object")for(const[s,r]of Object.entries(t.dur))ki(Number(s))&&Number.isFinite(r)&&(this.dur[s]=r);this.armor={kopf:0,brust:0},this.armWear={kopf:0,brust:0},Array.isArray(t.arm)&&["kopf","brust"].forEach((s,r)=>{const a=Lr(t.arm[r]);a&&a.slot===s&&(this.armor[s]=t.arm[r],this.armWear[s]=Math.max(0,Math.min(a.dur-1,t.arm[r+2]|0)))}),this.buildMode=0,this.anchor=null,this.clip=null,this.batch=null;const e=t.grave;this.grave=e&&[e.x,e.y,e.z].every(Number.isFinite)&&e.inv&&typeof e.inv=="object"?e:null,this.mobs=new mM(this.world,t.seed,t.mobs,t.mode!=="story"||this.gen===3),this.gen===3&&(this.mobs.findVillages=(s,r)=>{const a=[],o=Rn(s),l=Rn(r);for(let c=-1;c<=1;c++)for(let h=-1;h<=1;h++){const u=ua(this.seed,o+h,l+c);u&&a.push(u)}return a}),this.mobs.onAdd=s=>this.mobView.add(s),this.mobs.onRemove=s=>this.mobView.remove(s),this.vehicles=new B1(this.world,t.veh),this.ride=null,this.prevJump=!1,this.vehicles.onAdd=s=>this.vehView.add(s),this.vehicles.onRemove=s=>this.vehView.remove(s),this.vehicles.attach(),this.mobs.onAttack=s=>this.mobHits(s),this.mobs.onPoof=s=>this.spawnBreak(s.x-.5,s.y+.5,s.z-.5,_.BASALT),this.age=Number.isFinite(t.age)&&t.age>=0?t.age:0,this.farm=new Zu(t.farm),this.farmT=0,this.history=[],this.redoList=[],this.spawn=this.world.findSpawn(t.mode!=="story"),this.spawnY=this.spawn.y;const n=this.player;t.px!==void 0?(n.x=t.px,n.y=t.py,n.z=t.pz,this.yaw=t.yaw||0,this.pitch=t.pitch||0):(n.x=this.spawn.x,n.y=this.spawn.y,n.z=this.spawn.z,this.yaw=0,this.pitch=-.1),n.vx=n.vy=n.vz=0,n.flying=!1,n.onGround=!1,this.target=null,this.unsaved=!1,this.loadAround(2,1),this.scanDirty=!0,this.lastPC=null,this.applyCamera(),this.updateSky(),this.resume()}startMenu(){this.stop(),this.clearWorld(),this.menuMode=!0,this.savedView=this.savedView??this.viewDist,this.setViewDist(Math.min(this.viewDist,4)),this.world=new Nu(20241,new Map,1),this.mode="creative",this.time=.06,this.menuT=0,this.hotbar=new Array(9).fill(0),this.sel=0,this.inv={};const t=this.world.findSpawn(),e=this.player,n=this.world;e.x=t.x,e.z=t.z,e.y=t.y,e.flying=!1,e.vx=e.vy=e.vz=0,e.hook=!1,this.loadAround(3,2);const s=Math.floor(t.x),r=Math.floor(t.z),a=Math.floor(t.y)-1;for(let l=s-5;l<=s+5;l++)for(let c=r-5;c<=r+5;c++){for(let h=a+1;h<=a+9;h++)n.setBlock(l,h,c,_.AIR);n.setBlock(l,a,c,l+c&1?_.MARBLE:_.STONE)}for(let l=0;l<16;l++)n.setBlock(s-2+l%4,a+1,r-2+(l>>2),_i+l);const o=[_.NEON_R,_.NEON_B,_.NEON_G,_.NEON_P];[[-3,-3],[3,-3],[3,3],[-3,3]].forEach(([l,c],h)=>{for(let u=1;u<=4;u++)n.setBlock(s+l,a+u,r+c,o[h]);n.setBlock(s+l,a+5,r+c,_.RAINBOW)}),n.setBlock(s,a+2,r,_.RADIO);for(let l=3;l<=5;l++)n.setBlock(s,a+l,r,_.FEDER);n.setBlock(s,a+6,r,_.RAINBOW),this.menuC={x:s+.5,y:a+3,z:r+.5},this.flushDirty(),this.hand.visible=!1,this.hl.visible=!1,this.rope.visible=!1,this.scanDirty=!0,this.lastPC=null,this.menuStep(0),this.resume()}leaveMenu(){this.menuMode&&(this.menuMode=!1,this.savedView!=null&&(this.setViewDist(this.savedView),this.savedView=null))}menuStep(t){this.menuT+=t,this.time=(this.time+t/150)%1;const e=this.menuC,n=this.menuT*.07,s=15+Math.sin(this.menuT*.05)*2.5,r=4.5+Math.sin(this.menuT*.11)*1.5;this.camera.position.set(e.x+Math.cos(n)*s,e.y+r,e.z+Math.sin(n)*s),this.camera.lookAt(e.x,e.y-3.2,e.z),this.stream(),this.flushDirty(),this.uni.uTime.value=performance.now()/1e3,this.updateSky(),this.cloudU.uOff.value.x+=t*2.5}clearWorld(){for(const t of this.group.children.slice())t.geometry.dispose(),this.group.remove(t);this.mobs&&(this.mobs.clear(),this.mobs=null),this.mobView.clear(),this.vehicles&&(this.vehicles.clear(),this.vehicles=null),this.vehView.clear(),this.ride=null,this.vitals=null,this.dead=!1,this.world=null,this.mwJobs=0}loadAround(t,e){const n=Math.floor(this.player.x/F),s=Math.floor(this.player.z/F);for(let r=-t;r<=t;r++)for(let a=-t;a<=t;a++)this.world.ensure(n+a,s+r);for(let r=-e;r<=e;r++)for(let a=-e;a<=e;a++)this.applyMesh(this.world.getChunk(n+a,s+r))}serialize(){const t=this.player,e=xd(this.world.edits);return{v:vd,gen:this.gen,name:this.name,seed:this.seed,mode:this.mode,time:this.time,savedAt:Date.now(),px:t.x,py:t.y,pz:t.z,yaw:this.yaw,pitch:this.pitch,hotbar:this.hotbar,sel:this.sel,inv:this.inv,wp:this.wp,story:this.story,edits:e,vit:this.vitals?this.vitals.toJSON():void 0,dur:this.dur,grave:this.grave||void 0,mobs:this.mobs?this.mobs.serialize():void 0,age:Math.round(this.age),farm:this.farm.plants.size?this.farm.serialize():void 0,arm:this.armor.kopf||this.armor.brust?[this.armor.kopf,this.armor.brust,this.armWear.kopf,this.armWear.brust]:void 0,veh:this.vehicles&&this.vehicles.list.length?this.vehicles.serialize():void 0,map:this.map?this.map.serialize():void 0}}respawn(){const t=this.player;this.world.ensure(Math.floor(this.spawn.x/F),Math.floor(this.spawn.z/F)),t.x=this.spawn.x,t.y=this.spawn.y,t.z=this.spawn.z,t.vx=t.vy=t.vz=0,t.flying=!1,t.impact=0,this.hookT=0,this.rope.visible=!1,this.loadAround(1,0),this.scanDirty=!0,this.applyCamera(),this.running||this.render()}resume(){this.running||(this.running=!0,this.last=performance.now(),this.raf=requestAnimationFrame(t=>this.frame(t)))}stop(){this.running=!1,cancelAnimationFrame(this.raf),pf(0,0)}frame(t){if(!this.running||(this.raf=requestAnimationFrame(n=>this.frame(n)),this.menuMode&&t-this.last<32))return;this.measure(t-this.last);const e=Math.max(0,Math.min(.05,(t-this.last)/1e3));this.last=t,this.menuMode?this.menuStep(e):this.step(e),this.render()}step(t){const e=this.world,n=this.player;if(this.timeFrozen||(this.time=(this.time+t/CM)%1),this.uni.uTime.value=performance.now()/1e3,this.dead||(this.ride?this.rideStep():(this.updateHook(t),n.update(e,t,this.input,this.yaw),this.sounds(t)),n.bounces&&(this.questEvent("bounce",0,n.bounces),n.bounces=0),this.story&&n.gliding&&(this.glideAcc=(this.glideAcc||0)+t),this.vitals&&!n.waiting&&this.updateVitals(t)),this.vehicles&&this.vehicles.list.length){const o=-Math.sin(this.yaw),l=-Math.cos(this.yaw),c=Math.hypot(o,l)||1;this.vehicles.update(t,this.ride,this.ride&&!this.dead?{f:this.input.f,r:this.input.r,look:[o/c,l/c]}:null),this.ride&&this.seatPlayer(),this.vehView.update(n.x,n.z,this.light,this.viewDist*F,this.uni.uTime.value)}this.applyCamera(),this.stream();const s=this.time>.52&&this.time<.98;this.mobs&&(this.mobs.update(t,n.x,n.z,{py:n.y,night:s,time:this.time,hostiles:this.survival&&this.enemies&&!this.dead,others:this.mp?this.mp.others():null}),this.mobView.update(n.x,n.z,this.light,this.viewDist*F,this.uni.uTime.value)),this.mp&&this.mp.tick(t),this.dead||(this.age+=t),this.farmT-=t,this.farmT<=0&&(this.farmT=2,!this.net&&this.farm.update(this.world,this.age)&&(this.unsaved=!0));const r=this.camera,a=this.lookDir||(this.lookDir=new O);a.set(0,0,-1).applyEuler(r.rotation),this.target=this.dead?null:af(e,r.position.x,r.position.y,r.position.z,a.x,a.y,a.z,kr),this.target?(this.hl.position.set(this.target.x+.5,this.target.y+.5,this.target.z+.5),this.hl.visible=!0):this.hl.visible=!1,this.updateGhost(),this.beamT>0&&(this.beamT-=t)<=0&&(this.beam.visible=!1),this.actCool-=t,this.placeHeld&&!this.prevPlace&&(this.placeFirst=!0),this.prevPlace=this.placeHeld,this.breakHeld&&!this.dead?this.useBreak(t,a):(this.setMine(null),this.actCool<=0&&this.placeHeld&&!this.dead&&this.placeBlock()&&(this.actCool=this.placeFirst&&this.placeDelay?.45:.25,this.placeFirst=!1)),this.flushDirty(),this.updateSky(),this.cloudU.uOff.value.x+=t*2.5,this.radioT-=t,(this.world.sigDirty||this.sigRetry&&this.radioT<=0)&&this.updateSignals(),this.radioT<=0&&(this.radioT=.3,this.updateRadio(),this.questTick(),this.checkGrave(),(this.mapT=(this.mapT||0)+1)%4===0&&this.map&&(this.map.markAround(this.player.x,this.player.z,Math.min(this.viewDist,5)),this.map.syncRadios(this.world))),this.updateHand(t),this.partCount&&this.updateParticles(t)}sounds(t){const e=this.player,n=this.world;if(e.onGround&&!e.flying&&!e.inWater&&(this.stepAcc=(this.stepAcc||0)+Math.hypot(e.vx,e.vz)*t,this.stepAcc>2.1&&(this.stepAcc=0,_M(UM(n.getBlock(Math.floor(e.x),Math.floor(e.y-.05),Math.floor(e.z)))))),e.inWater&&!this.wasWater?lf(e.vy<-6):e.inWater&&(this.swimAcc=(this.swimAcc||0)+Math.hypot(e.vx,e.vz)*t)>2.5&&(this.swimAcc=0,lf(!1)),this.wasWater=e.inWater,this.mobs&&(this.callT=(this.callT??3)-t)<=0){this.callT=2.5+Math.random()*5;const s=this.mobs.list.filter(r=>Math.hypot(r.x-e.x,r.z-e.z)<20);if(s.length){const r=s[Math.floor(Math.random()*s.length)];vM(r.T.key,Math.hypot(r.x-e.x,r.y-e.y,r.z-e.z))}}}updateVitals(t){const e=this.vitals,n=this.player,s=[Math.ceil(e.hp),Math.ceil(e.food),Math.ceil(e.air)];let r=0;if(n.impact){const o=rM(n.impact);n.impact=0,o&&!n.inWater&&(e.hurt(o,"Sturz"),r+=o)}const a=n.onGround&&this.world.getBlock(Math.floor(n.x),Math.floor(n.y-.05),Math.floor(n.z))===_.MAGMA;if(r+=e.tick(t,{moving:Math.hypot(n.vx,n.vz)>.5,sprint:this.input.sprint,eyeWater:n.eyeWater,onMagma:a}),r>0&&(this.onHurt(r,e.cause),this.unsaved=!0,r>=1&&Ul()),e.dead){this.die(e.cause);return}(s[0]!==Math.ceil(e.hp)||s[1]!==Math.ceil(e.food)||s[2]!==Math.ceil(e.air))&&this.onVitals()}die(t){const e=this.player;this.ride&&this.dismount(),this.dead=!0,this.breakHeld=this.placeHeld=!1,this.hookT=0,this.rope.visible=!1,this.setMine(null),e.vx=e.vy=e.vz=0;const n={x:Math.round(e.x),y:Math.round(e.y),z:Math.round(e.z)};let s=!1;if(this.deathLoss==="grave"){const r={};for(const[a,o]of Object.entries(this.inv))o>0&&(r[a]=o);if(Object.keys(r).length){if(this.grave)for(const[a,o]of Object.entries(this.grave.inv))r[a]=Math.min(Xe,(r[a]||0)+o);this.grave={...n,inv:r},this.inv={},s=!0}}this.wp=n,this.unsaved=!0,this.onDeath(t,s)}revive(){this.dead&&(this.vitals=new Qu,this.dead=!1,this.player.impact=0,this.respawn(),this.onVitals(),this.onChange())}checkGrave(){const t=this.grave,e=this.player;if(!(!t||this.dead||Math.hypot(t.x-e.x,t.y-e.y,t.z-e.z)>2.5)){for(const[n,s]of Object.entries(t.inv))zu(Number(n))&&(this.inv[n]=Math.min(Xe,(this.inv[n]||0)+s));this.wp&&this.wp.x===t.x&&this.wp.z===t.z&&(this.wp=null),this.grave=null,this.unsaved=!0,on(),this.onToast("Deine Sachen sind wieder da"),this.onChange()}}held(){const t=this.hotbar[this.sel];return t&&(this.mode==="creative"||this.inv[t]>0)?t:0}setMine(t){const e=!!this.mine;this.mine=t,(e||t)&&this.onMine(t?Math.min(1,t.t/t.need):0)}useBreak(t,e){if(this.actCool>0)return;const n=this.camera.position,s=this.target,r=this.mobs?this.mobs.raycast(n.x,n.y,n.z,e.x,e.y,e.z,kr):null,a=this.vehHit(e);if(a&&(!s||a.t<s.t)&&(!r||a.t<r.t)){this.pickVehicle(a.veh),this.actCool=.45,this.setMine(null);return}if(r&&(!s||r.t<s.t)){this.attack(r.mob),this.actCool=.45,this.setMine(null);return}if(!this.survival){this.setMine(null),this.breakBlock()&&(this.actCool=.22);return}if(!s||s.y===0){this.setMine(null);return}const o=this.held();if(!p1(s.type,o)){pn(),this.onToast(`${Qr[s.type]} braucht eine ${Kt[s.type].tier>1?"Stein- oder bessere ":""}Spitzhacke`),this.actCool=.8,this.setMine(null);return}let l=this.mine;if((!l||l.x!==s.x||l.y!==s.y||l.z!==s.z||l.held!==o)&&(l={x:s.x,y:s.y,z:s.z,held:o,t:0,need:d1(s.type,o),sw:0}),l.t+=t,l.sw-=t,l.sw<=0&&(l.sw=.25,this.swing=1),l.t>=l.need){this.setMine(null),this.breakBlock()&&(this.actCool=.1);return}this.setMine(l)}attack(t){if(t.npc){this.onToast(`${t.name}: „He, nicht hauen! Lass uns lieber tauschen.“`),this.actCool=.8;return}const e=this.held(),n=ki(e),s=this.player,r=this.mode==="creative"?99:n?n.kind==="schwert"?n.dmg:n.kind==="axt"?3:2:1;if(this.swing=1,Ol(),n&&n.kind==="schwert"&&this.wear(e),this.net){this.net.hit(t.id,Math.min(r,10)),t.hurtT=.35;return}if(!t.hit(r,s.x,s.z)||(this.spawnBreak(t.x-.5,t.y,t.z-.5,_.WOOL),this.mobs.remove(t,!1),this.unsaved=!0,this.questEvent("kill",t.type),this.mode==="creative"))return;const a=Od(t.type).map(([o,l])=>(this.inv[o]=Math.min(Xe,(this.inv[o]||0)+l),`+${l} ${ge(o)}`));a.length&&this.onToast(a.join(" · ")),this.onChange()}mobHits(t){if(t.target&&this.mp){this.mp.hurtGuest(t);return}const e=this.vitals,n=this.player;if(!e||this.dead)return;const s=Math.hypot(n.x-t.x,n.z-t.z)||1;if(t.T.range){const a=this.beam.geometry.attributes.position;a.setXYZ(0,t.x,t.y+.3,t.z),a.setXYZ(1,n.x,n.y+1.2,n.z),a.needsUpdate=!0,this.beam.visible=!0,this.beamT=.15}else n.vx+=(n.x-t.x)/s*6,n.vz+=(n.z-t.z)/s*6,n.vy=Math.max(n.vy,5),n.onGround=!1;const r=t.T.dmg*Ou(this.armorPoints());this.wearArmor(),e.hurt(r,t.T.name),Ul(),this.onHurt(r,t.T.name),this.onVitals(),this.unsaved=!0,e.dead&&this.die(t.T.name)}remoteHurt(t){const e=this.vitals,n=this.player;if(!e||this.dead)return;const s=Array.isArray(t.from)&&t.from.slice(0,3).every(Number.isFinite)?t.from:null;if(s&&s[3]){const o=this.beam.geometry.attributes.position;o.setXYZ(0,s[0],s[1],s[2]),o.setXYZ(1,n.x,n.y+1.2,n.z),o.needsUpdate=!0,this.beam.visible=!0,this.beamT=.15}else if(s){const o=Math.hypot(n.x-s[0],n.z-s[2])||1;n.vx+=(n.x-s[0])/o*6,n.vz+=(n.z-s[2])/o*6,n.vy=Math.max(n.vy,5),n.onGround=!1}const r=typeof t.cause=="string"?t.cause.slice(0,30):"Gegner",a=Math.min(10,t.dmg)*Ou(this.armorPoints());this.wearArmor(),e.hurt(a,r),Ul(),this.onHurt(a,r),this.onVitals(),e.dead&&this.die(r)}record(t,e,n,s,r){if(this.net&&this.net.local(t,e,n,s,r),this.mode==="creative"){if(this.batch){this.batch.push([t,e,n,s,r]);return}this.history.push([[t,e,n,s,r]]),this.history.length>100&&this.history.shift(),this.redoList.length=0}}beginBatch(){this.batch=[]}endBatch(){const t=this.batch;this.batch=null,t&&t.length&&(this.history.push(t),this.history.length>100&&this.history.shift(),this.redoList.length=0)}undo(t=!1){if(this.mode!=="creative")return this.onToast("Rückgängig gibt es im Kreativmodus"),!1;const e=t?this.redoList:this.history,n=t?this.history:this.redoList,s=e.pop();if(!s)return this.onToast(t?"Nichts zum Wiederholen":"Nichts zum Rückgängigmachen"),!1;const r=t?s:s.slice().reverse();for(const[a,o,l,c,h]of r){this.world.ensure(a>>4,l>>4);const u=t?c:h,f=t?h:c;this.world.setBlock(a,o,l,f)&&this.net&&this.net.local(a,o,l,u,f)}return n.push(s),this.unsaved=!0,on(),this.running||(this.flushDirty(),this.render()),!0}hoe(t){const e=this.target;return!e||![_.GRASS,_.DIRT,_.FLOWERS,_.MYCEL].includes(e.type)||this.world.getBlock(e.x,e.y+1,e.z)!==_.AIR||!this.world.setBlock(e.x,e.y,e.z,_.FARMLAND)?!1:(this.record(e.x,e.y,e.z,e.type,_.FARMLAND),this.wear(t),this.swing=1,on(),this.unsaved=!0,this.onChange(),!0)}sow(t){const e=this.target;return!e||e.type!==_.FARMLAND||this.world.getBlock(e.x,e.y+1,e.z)!==_.AIR?(this.onToast("Samen brauchen Ackerboden (Hacke auf Gras oder Erde)"),this.actCool=.6,!1):this.mode!=="creative"&&!(this.inv[t]>0)?(pn(),this.onToast(`Keine ${ge(t)} im Vorrat`),this.actCool=.4,!1):this.farm.plant(e.x,e.y+1,e.z,this.age)?(this.world.setBlock(e.x,e.y+1,e.z,Cl(t)),this.record(e.x,e.y+1,e.z,_.AIR,Cl(t)),this.mode!=="creative"&&this.inv[t]--,this.swing=1,on(),this.unsaved=!0,this.onChange(),!0):(this.onToast("Zu viele Pflanzen in dieser Welt"),!1)}eat(t){return this.vitals?this.inv[t]>0?this.vitals.eat(ku(t))?(this.inv[t]--,this.swing=1,on(),this.unsaved=!0,this.onChange(),this.onVitals(),!0):(this.onToast("Du bist satt"),this.actCool=.6,!1):(pn(),this.onToast(`Kein ${ge(t)} im Vorrat`),this.actCool=.4,!1):(this.onToast("Essen braucht man nur im Überlebensmodus"),this.actCool=.6,!1)}wear(t){const e=ki(t);if(!e||this.mode==="creative")return;const n=(this.dur[t]||0)+1;if(n<e.dur){this.dur[t]=n;return}delete this.dur[t],this.inv[t]=Math.max(0,(this.inv[t]||0)-1),pn(),this.onToast(`${ge(t)} ist zerbrochen`)}stationsNear(t=4){const e=new Set,n=this.player,s=this.world;if(!s)return e;const r=Math.floor(n.x),a=Math.floor(n.y),o=Math.floor(n.z);for(let l=a-2;l<=a+3;l++)for(let c=o-t;c<=o+t;c++)for(let h=r-t;h<=r+t;h++){const u=Kt[s.getBlock(h,l,c)];u&&u.station&&e.add(u.station)}return e}updateSignals(){const t=this.world,e=this.player,n=Kx(t.sig);let s=!1;this.sigStats=n,this.sigRetry=!1;for(const[r,a]of t.sig){const o=a[3],l=Xx[o]??o;if(!Iu[l])continue;const c=n.on.has(r)?Iu[l]:l;if(c===o)continue;if(c===_.GATE&&e.x+.3>a[0]&&e.x-.3<a[0]+1&&e.z+.3>a[2]&&e.z-.3<a[2]+1&&e.y+1.8>a[1]&&e.y<a[1]+1){this.sigRetry=!0;continue}t.setBlock(a[0],a[1],a[2],c),Math.hypot(a[0]-e.x,a[1]-e.y,a[2]-e.z)<24&&!s&&(s=!0,(l===_.GATE?xM:MM)())}t.sigDirty=!1,n.capped&&this.onToast("Signalnetz zu groß: nicht alles wird berechnet")}fireHook(){if(!this.running||this.ride)return;const t=this.camera,e=new O(0,0,-1).applyEuler(t.rotation),n=af(this.world,t.position.x,t.position.y,t.position.z,e.x,e.y,e.z,40);if(!n){pn(),this.onToast("Seilhaken: kein Ziel in Reichweite");return}this.hookTarget.set(n.x+.5+n.nx*.9,n.y+.5+n.ny*.9,n.z+.5+n.nz*.9),this.hookT=1.6,on(),this.questEvent("hook",0)}updateHook(t){const e=this.player;if(e.hook=!1,this.hookT<=0){this.rope.visible=!1;return}this.hookT-=t;const n=this.hookTarget,s=n.x-e.x,r=n.y-(e.y+Nl),a=n.z-e.z,o=Math.hypot(s,r,a);if(o<2||this.hookT<=0){this.hookT=0,this.rope.visible=!1,e.vx*=.6,e.vz*=.6,e.vy=Math.max(e.vy*.6,3);return}const l=24/o;e.vx=s*l,e.vy=r*l,e.vz=a*l,e.hook=!0;const c=this.rope.geometry.attributes.position;c.setXYZ(0,e.x+.3,e.y+Nl-.35,e.z),c.setXYZ(1,n.x,n.y,n.z),c.needsUpdate=!0,this.rope.visible=!0}toggleWaypoint(){const t=this.player;this.wp&&Math.hypot(this.wp.x-t.x,this.wp.z-t.z)<4?(this.wp=null,this.onToast("Wegpunkt entfernt")):(this.wp={x:Math.round(t.x),y:Math.round(t.y),z:Math.round(t.z)},this.onToast("Wegpunkt gesetzt")),this.unsaved=!0}updateRadio(){const t=this.player;let e=1e9,n=0;for(const s of this.world.radios.values()){const r=Math.hypot(s[0]+.5-t.x,s[1]+.5-(t.y+1),s[2]+.5-t.z);r<e&&(e=r,n=s[0]*7+s[2]*13+s[1]>>>0)}this.radioDist=e,pf(e<24?Math.pow(1-e/24,1.5):0,n)}questTick(){const t=this.story;if(!t||t.done)return;const e=er(t)[t.i];e.k==="height"&&(t.max=Math.max(t.max,this.player.y-this.spawnY)),e.k==="glide"&&this.glideAcc&&(t.p+=this.glideAcc),e.k==="depth"&&this.player.y<e.y&&(t.p=1),e.k==="visit"&&this.world.villageAt(this.player.x,this.player.z)&&(t.p=1),this.glideAcc=0,this.questCheck()}questEvent(t,e,n=1){const s=this.story;if(!s||s.done)return;const r=er(s)[s.i];if(r.k==="have"){this.questCheck();return}r.k!==t||r.a&&!r.a.includes(e)||(s.p+=n,this.questCheck())}questCheck(){const t=this.story,e=er(t);for(let n=0;t&&!t.done&&n<e.length;n++){const s=e[t.i],[r,a]=Fd(this,s);if(r<a)break;for(const[o,l]of Object.entries(s.r||{}))this.inv[o]=Math.min(Xe,(this.inv[o]||0)+l);if(t.i++,t.p=0,t.max=0,t.i>=e.length)t.done=!0;else if(e[t.i].k==="visit"){const o=pd(this.seed,this.player.x,this.player.z);o&&(this.wp={x:o.x,y:o.y+1,z:o.z})}this.unsaved=!0,yM(),this.onQuestDone(s,t.done),this.onChange()}this.onQuest()}updateHand(t){const e=this.hotbar[this.sel];if(e!==this.handType){if(this.handType=e,this.hand.visible=e>0&&!Oi(e),this.itemHand.visible=Oi(e)&&!!Te[e],this.itemHand.visible){const a=Te[e].icon,o=this.itemCanvas.height/Vr,l=a%zi/zi,c=l+1/zi,h=1-Math.floor(a/zi)/o,u=h-1/o,f=this.itemHand.geometry.attributes.uv;f.setXY(0,l,h),f.setXY(1,c,h),f.setXY(2,l,u),f.setXY(3,c,u),f.needsUpdate=!0}if(this.hand.visible){const a=I1(e),o=new Oe;o.setAttribute("position",new Ne(a.pos,3)),o.setAttribute("uv",new Ne(a.uv,2)),o.setAttribute("aCol",new Ne(a.col,4)),o.setIndex(new Ne(a.idx,1)),this.hand.geometry.dispose(),this.hand.geometry=o,this.hand.material=No(e)?this.handMatL:this.handMatO}}const n=this.player,s=Math.hypot(n.vx,n.vz)>.5&&n.onGround;if(this.ride){this.hand.visible=this.itemHand.visible=!1,this.handType=-1;return}s&&(this.bob+=t*9),this.swing=Math.max(0,this.swing-t*4.5);const r=Math.sin(this.swing*Math.PI);this.hand.scale.setScalar(.12),this.hand.position.set(.34-r*.06,-.27+Math.sin(this.bob)*.008-r*.06,-.55-r*.04),this.hand.rotation.set(.25-r*.7,-.62,.06),this.itemHand.visible&&(this.itemHand.scale.setScalar(.3),this.itemHand.position.set(.36-r*.05,-.24+Math.sin(this.bob)*.008-r*.05,-.55),this.itemHand.rotation.set(-r*.9,-.35,.2+r*.4))}spawnBreak(t,e,n,s){const r=Kt[s]?Kt[s].color:14540253;for(let a=0;a<10;a++){this.partIdx=((this.partIdx||0)+1)%24;let o=this.parts[this.partIdx];o||(o=new Ce(this.partGeo||(this.partGeo=new qi(1,1,1)),new Vi({color:r})),o.userData={life:0},this.scene.add(o),this.parts[this.partIdx]=o),o.userData.life||this.partCount++,o.material.color.setHex(r),o.position.set(t+.2+Math.random()*.6,e+.2+Math.random()*.6,n+.2+Math.random()*.6),o.userData={life:.55+Math.random()*.3,v:new O((Math.random()-.5)*3,Math.random()*3+1,(Math.random()-.5)*3)},o.scale.setScalar(.1+Math.random()*.08),o.visible=!0}}updateParticles(t){for(const e of this.parts){if(!e||!e.userData.life)continue;const n=e.userData;n.life-=t,n.v.y-=14*t,e.position.addScaledVector(n.v,t),n.life<=0&&(n.life=0,e.visible=!1,this.partCount--)}}applyCamera(){const t=this.player,e=this.camera;e.position.set(t.x,t.y+Nl,t.z),e.rotation.set(this.pitch,this.yaw,0)}breakBlock(){const t=this.target;if(!t||t.y===0)return!1;if(this.world.setBlock(t.x,t.y,t.z,_.AIR)){this.record(t.x,t.y,t.z,t.type,_.AIR);const e=(n,s)=>{this.inv[n]=Math.min(Xe,(this.inv[n]||0)+s)};if(Nd(t.type)){if(this.farm.remove(t.x,t.y,t.z),this.mode!=="creative"){const n=sM(t.type);n.forEach(([s,r])=>e(s,r)),this.onToast(n.map(([s,r])=>`+${r} ${ge(s)}`).join(" · "))}}else this.mode!=="creative"&&e(Kt[t.type].drop||(t.type===_.FARMLAND?_.DIRT:t.type),1);if(this.mode!=="creative"&&(t.type===_.GRASS||t.type===_.FLOWERS)&&Math.random()<.12&&(e(tt.SEEDS,1),this.onToast("+1 Weizensamen")),this.survival){const n=this.held();m1(t.type,n)&&this.wear(n),(t.type===_.LEAVES||t.type===_.JLEAVES)&&Math.random()<.08&&(this.inv[tt.APPLE]=Math.min(Xe,(this.inv[tt.APPLE]||0)+1),this.onToast("+1 Apfel"))}return this.unsaved=!0,this.swing=1,this.spawnBreak(t.x,t.y,t.z,t.type),Ol(),this.onChange(),this.questEvent("break",t.type),!0}return!1}placeBlock(){const t=this.target,e=this.hotbar[this.sel],n=this.camera.position,s=this.lookDir,r=this.mobs&&s?this.mobs.raycast(n.x,n.y,n.z,s.x,s.y,s.z,kr):null;if(r&&r.mob.npc&&(!t||r.t<t.t))return this.onTrade(r.mob),this.questEvent("talk",0),this.actCool=.5,!1;const a=s?this.vehHit(s):null;if(a&&(!t||a.t<t.t)&&!this.ride)return this.placeFirst&&this.mount(a.veh),!1;if(e&&Uu(e))return this.placeVehicle(e);if(t&&(t.type===_.SWITCH||t.type===_.SWITCH_ON)){if(!this.placeFirst)return!1;const v=t.type===_.SWITCH?_.SWITCH_ON:_.SWITCH;return this.world.setBlock(t.x,t.y,t.z,v)&&(this.record(t.x,t.y,t.z,t.type,v),this.swing=1,hf(),this.unsaved=!0,this.onToast(v===_.SWITCH_ON?"Schalter an":"Schalter aus")),!0}if(t&&(t.type===_.DOOR||t.type===_.DOOR_OPEN)&&!(e&&Ki[e]===6&&t.ny===1))return this.placeFirst?(this.toggleDoor(t.x,t.y,t.z),!0):!1;if(t&&e===t.type&&Kt[e].full&&t.ny===1&&(this.mode==="creative"||this.inv[e]>0)){const v=Kt[e].full;if(this.world.setBlock(t.x,t.y,t.z,v))return this.record(t.x,t.y,t.z,t.type,v),this.mode!=="creative"&&this.inv[e]--,this.unsaved=!0,this.swing=1,on(),this.onChange(),!0}if(t&&this.mode!=="creative"&&Kt[t.type]&&Kt[t.type].station)return this.onStation(Kt[t.type].station),this.actCool=.5,!1;if(e&&Lr(e))return this.equip(e);if(e&&Oi(e)){const v=this.held(),m=ki(v);return m&&m.kind==="hacke"?this.hoe(v):Cl(e)?this.sow(e):ku(e)?this.eat(e):!1}const o=Ir[this.buildMode];if(o.key!=="einzeln")return this.buildClick(o,t,e);if(!t||!e)return!1;if(this.mode!=="creative"&&!(this.inv[e]>0))return pn(),this.onToast(`Kein ${Qr[e]} im Vorrat`),this.actCool=.4,!1;const l=t.x+t.nx,c=t.y+t.ny,h=t.z+t.nz;if(c<0||c>=oe)return!1;const u=this.world.getBlock(l,c,h);if(u!==_.AIR&&u!==_.WATER)return!1;const f=this.player,d=.3;if(f.x+d>l&&f.x-d<l+1&&f.z+d>h&&f.z-d<h+1&&f.y+1.8>c&&f.y<c+1)return!1;const g=Ki[e]===2?Ux(e,this.yaw):e;return this.world.setBlock(l,c,h,g)?(this.record(l,c,h,u,g),this.mode!=="creative"&&this.inv[e]--,this.unsaved=!0,this.swing=1,on(),this.onChange(),this.questEvent("place",e),!0):!1}toggleDoor(t,e,n){const s=this.world,r=l=>l===_.DOOR||l===_.DOOR_OPEN,a=s.getBlock(t,e,n)===_.DOOR?_.DOOR_OPEN:_.DOOR;let o=e;for(;o>0&&r(s.getBlock(t,o-1,n));)o--;for(let l=o;l<oe&&r(s.getBlock(t,l,n));l++){const c=s.getBlock(t,l,n);c!==a&&s.setBlock(t,l,n,a)&&this.record(t,l,n,c,a)}this.swing=1,this.unsaved=!0,hf()}selectSlot(t){this.sel=(t%9+9)%9,this.onChange()}cycleBuild(t=1){const e=Ir.map((s,r)=>r).filter(s=>!Ir[s].creative||this.mode==="creative"),n=Math.max(0,e.indexOf(this.buildMode));this.buildMode=e[(n+t+e.length)%e.length],this.anchor=null,this.onBuildMode(Ir[this.buildMode])}buildClick(t,e,n){if(!this.placeFirst)return!1;if(t.creative&&this.mode!=="creative")return this.onToast(`${t.name} gibt es im Kreativmodus`),!0;if(t.key==="einfuegen")return this.clip?e?this.applyCells(J1(this.clip,[e.x+e.nx,e.y+e.ny,e.z+e.nz]),"Eingefügt",!0):!1:(this.onToast("Erst mit „Kopieren“ zwei Ecken wählen"),!0);if(!e)return!1;const s=t.key==="kopieren"?[e.x,e.y,e.z]:[e.x+e.nx,e.y+e.ny,e.z+e.nz];if(!this.anchor)return this.anchor=s,this.onToast(`${t.name}: erste Ecke gesetzt, jetzt die zweite wählen`),on(),!0;const r=this.anchor;if(this.anchor=null,t.key==="kopieren"){const l=Z1(this.world,r,s);return l?(this.clip=l,on(),this.onToast(`${l.n} Blöcke kopiert (${l.sx}×${l.sy}×${l.sz}), jetzt „Einfügen“ wählen`),!0):(pn(),this.onToast("Zu groß zum Kopieren (höchstens 32 768 Blöcke)"),!0)}if(!n||Oi(n))return this.onToast("Wähle einen Block in der Hotbar"),!0;const a=this.mode==="creative"?Oc.creative:Oc.survival,o=j1(t.key,r,s,a);return o?this.applyCells(o.map(l=>[l[0],l[1],l[2],n]),t.name,!1):(pn(),this.onToast(`Zu groß: höchstens ${a} Blöcke auf einmal`),!0)}applyCells(t,e,n){const s=this.mode==="creative",r=this.player,a=.3;let o=0,l=!1;this.beginBatch();for(const[c,h,u,f]of t){if(h<=0||h>=oe)continue;if(!s&&!(this.inv[f]>0)){l=!0;continue}const d=this.world.getBlock(c,h,u);d===f||!(n&&s)&&d!==_.AIR&&d!==_.WATER||Kt[f].solid&&r.x+a>c&&r.x-a<c+1&&r.z+a>u&&r.z-a<u+1&&r.y+1.8>h&&r.y<h+1||this.world.setBlock(c,h,u,f)&&(this.record(c,h,u,d,f),s||this.inv[f]--,o++,this.questEvent("place",f))}return this.endBatch(),o&&(this.unsaved=!0,this.swing=1,on(),this.onChange()),this.onToast(o?`${e}: ${o} Blöcke${l?" (Vorrat reichte nicht)":""}`:l?"Nicht genug im Vorrat":"Nichts zu setzen"),!0}updateGhost(){const t=this.ghost,e=this.target,n=Ir[this.buildMode],s=this.hotbar[this.sel];let r=null;if(e&&!this.dead&&(this.preview||n.key!=="einzeln")){const a=[e.x+e.nx,e.y+e.ny,e.z+e.nz];if(n.key==="einfuegen")this.clip&&(r=[...a,a[0]+this.clip.sx-1,a[1]+this.clip.sy-1,a[2]+this.clip.sz-1]);else if(n.key==="kopieren"){const o=[e.x,e.y,e.z];r=this.anchor?Uc(this.anchor,o):[...o,...o]}else s&&!Oi(s)&&!(this.mode!=="creative"&&Kt[e.type]&&Kt[e.type].station)&&(r=this.anchor?Uc(this.anchor,a):[...a,...a])}if(!r){t.visible=!1;return}t.position.set((r[0]+r[3]+1)/2,(r[1]+r[4]+1)/2,(r[2]+r[5]+1)/2),t.scale.set(r[3]-r[0]+1,r[4]-r[1]+1,r[5]-r[2]+1),t.visible=!0}vehHit(t){if(!this.vehicles||!this.vehicles.list.length)return null;const e=this.camera.position,n=this.vehicles.raycast(e.x,e.y,e.z,t.x,t.y,t.z,kr);return n&&n.veh!==this.ride?n:null}placeVehicle(t){if(!this.placeFirst)return!1;const e=Uu(t),n=Eo[e],s=this.target,r=this.lookDir,a=this.camera.position;if(this.mode!=="creative"&&!(this.inv[t]>0))return pn(),this.onToast(`Kein ${n.name} im Vorrat`),!1;let o=null;if(e==="boot"){for(let c=.5;c<=kr&&!o;c+=.25){const h=Math.floor(a.x+r.x*c),u=Math.floor(a.y+r.y*c),f=Math.floor(a.z+r.z*c);if(s&&c>s.t)break;if(this.world.getBlock(h,u,f)===_.WATER){const d=this.vehicles.waterTop(h+.5,u,f+.5);d!==null&&(o=[h+.5,d-.3,f+.5])}}!o&&s&&s.ny===1&&(o=[s.x+.5,s.y+1.001,s.z+.5])}else s&&s.type===_.RAIL?o=[s.x+.5,s.y,s.z+.5]:s&&s.ny===1&&this.world.getBlock(s.x,s.y+1,s.z)===_.RAIL&&(o=[s.x+.5,s.y+1,s.z+.5]);return o?this.vehicles.boxHits({K:n},o[0],o[1]+.05,o[2])?(pn(),this.onToast("Kein Platz für das Fahrzeug"),!1):this.vehicles.add(e,o[0],o[1],o[2],this.yaw)?(this.mode!=="creative"&&this.inv[t]--,this.swing=1,on(),this.unsaved=!0,this.onChange(),this.onToast(`${n.name} gesetzt · Setzen = einsteigen, Abbauen = einpacken`),!0):(pn(),this.onToast(e==="lore"?"Die Lore braucht eine Schiene":"Zu viele Fahrzeuge in dieser Welt"),!1):(pn(),this.onToast(e==="boot"?"Boot: aufs Wasser oder auf den Boden zielen":"Die Lore braucht eine Schiene"),this.actCool=.5,!1)}pickVehicle(t){this.vehicles.remove(t),this.spawnBreak(t.x-.5,t.y,t.z-.5,t.kind==="boot"?_.PLANKS:_.STONE),Ol(),this.mode!=="creative"&&(this.inv[t.K.item]=Math.min(Xe,(this.inv[t.K.item]||0)+1),this.onToast(`+1 ${t.K.name}`)),this.unsaved=!0,this.onChange()}mount(t){const e=this.player;this.ride=t,t.rider=!0,e.flying=!1,e.vx=e.vy=e.vz=0,e.eyeWater=!1,e.impact=0,this.hookT=0,this.rope.visible=!1,this.prevJump=!0,t.kind==="lore"&&(this.yaw=t.yaw),this.seatPlayer(),on(),this.onToast(t.kind==="boot"?"Im Boot: vor/zurück = paddeln, links/rechts = lenken, Springen = aussteigen":"In der Lore: vor = anschieben (in Blickrichtung), zurück = bremsen, Springen = aussteigen"),this.onRide(!0)}dismount(){const t=this.ride,e=this.player;if(!t)return;this.ride=null,t.rider=!1;const[n,s,r]=this.vehicles.exitSpot(t,(a,o,l)=>e.collides(this.world,a,o,l));e.x=n,e.y=s,e.z=r,e.vx=e.vy=e.vz=0,e.onGround=!1,this.onRide(!1)}seatPlayer(){const t=this.ride,e=this.player;e.x=t.x,e.y=t.y+t.K.seat-.4,e.z=t.z}rideStep(){const t=this.input.jump;t&&!this.prevJump&&this.dismount(),this.prevJump=t}equip(t){const e=Lr(t),n=this.mode==="creative";if(!n&&!(this.inv[t]>0))return pn(),this.onToast(`Kein ${ge(t)} im Vorrat`),this.actCool=.4,!1;const s=this.armor[e.slot];return s===t?(this.onToast(`${ge(t)} trägst du schon`),this.actCool=.6,!1):(n||(this.inv[t]--,s&&(this.inv[s]=Math.min(Xe,(this.inv[s]||0)+1))),this.armor[e.slot]=t,this.armWear[e.slot]=0,this.swing=1,on(),this.unsaved=!0,this.onToast(`${ge(t)} angelegt · Schutz ${this.armorPoints()*5} %`),this.onChange(),this.onVitals(),!0)}armorPoints(){let t=0;for(const e of["kopf","brust"]){const n=Lr(this.armor[e]);n&&(t+=n.pts)}return t}wearArmor(){if(this.mode!=="creative")for(const t of["kopf","brust"]){const e=this.armor[t],n=Lr(e);n&&++this.armWear[t]>=n.dur&&(this.armor[t]=0,this.armWear[t]=0,this.onToast(`${ge(e)} ist zerbrochen`))}}areaReady(t){const e=Math.floor(this.player.x/F),n=Math.floor(this.player.z/F);let s=0,r=0;for(const[a,o,l]of this.offsets){if(l>t)continue;s++;const c=this.world.getChunk(e+a,n+o);c&&c.meshed&&r++}return s?r/s:1}stream(){const t=Math.floor(this.player.x/F),e=Math.floor(this.player.z/F);if(!this.lastPC||this.lastPC[0]!==t||this.lastPC[1]!==e){this.lastPC=[t,e],this.scanDirty=!0;const h=this.viewDist+3.5;for(const[u,f]of this.world.chunks)Math.hypot(f.cx-t,f.cz-e)>h&&(this.dropMesh(f),this.world.chunks.delete(u))}if(!this.scanDirty)return;const s=performance.now(),r=this.viewDist+.5,a=-Math.sin(this.yaw),o=-Math.cos(this.yaw);let l=!1,c=0;t:for(let h=0;h<2;h++)for(const[u,f,d]of this.offsets){const g=d<2.5||u*a+f*o>-.3*d;if(h===0!==g)continue;let v=this.world.getChunk(t+u,e+f);const m=d<=r&&(!v||!v.meshed);if(!(v&&!m)){if(c>0&&performance.now()-s>this.budget){l=!0;break t}if(v||(v=this.world.ensure(t+u,e+f),c++,l=!0),m){const p=this.requestMesh(v);p===!0?(c++,l=!0):p==="wait"&&(l=!0)}}}l||(this.scanDirty=!1)}flushDirty(){const t=this.world;if(t.dirty.size){for(const e of t.dirty)e.meshed&&t.chunks.get(e.key)===e&&this.applyMesh(e);t.dirty.clear()}}dropMesh(t){for(const e of["opaque","trans","logo"])t[e]&&(this.group.remove(t[e]),t[e].geometry.dispose(),t[e]=null)}requestMesh(t){if(!this.mw)return this.applyMesh(t);if(t.pending||this.mwJobs>=4)return"wait";const e=Id(this.world,t);if(!e)return!1;const n=e.nb.map(r=>r.slice()),s=e.hms.map(r=>r.slice());return t.pending=t.ver=++this.meshSeq,this.mwJobs++,this.mw.postMessage({key:t.key,ver:t.ver,nb:n,hms:s,maxY:e.maxY},n.map(r=>r.buffer)),!0}onMeshed({key:t,ver:e,r:n}){this.mwJobs=Math.max(0,this.mwJobs-1);const s=this.world&&this.world.chunks.get(t);!s||s.ver!==e||s.pending!==e||(s.pending=0,this.setPart(s,"opaque",n.opaque,this.matO),this.setPart(s,"trans",n.trans,this.matT),this.setPart(s,"logo",n.logo,this.matL),s.meshed=!0,this.scanDirty=!0,!this.running&&this.world&&this.render())}applyMesh(t){const e=w1(this.world,t);return e?(t.ver=++this.meshSeq,t.pending=0,this.setPart(t,"opaque",e.opaque,this.matO),this.setPart(t,"trans",e.trans,this.matT),this.setPart(t,"logo",e.logo,this.matL),t.meshed=!0,!0):!1}setPart(t,e,n,s){let r=t[e];if(!n){r&&(this.group.remove(r),r.geometry.dispose(),t[e]=null);return}const a=new Oe;if(a.setAttribute("position",new Ne(n.pos,3)),a.setAttribute("uv",new Ne(n.uv,2)),a.setAttribute("aCol",new Ne(n.col,4)),a.setIndex(new Ne(n.idx,1)),a.boundingSphere=new dr(new O(F/2,oe/2,F/2),this.chunkSphereR),r){r.geometry.dispose(),r.geometry=a;return}r=new Ce(a,s),r.position.set(t.cx*F,0,t.cz*F),r.matrixAutoUpdate=!1,r.updateMatrix(),this.group.add(r),t[e]=r}updateSky(){const t=this.time*Math.PI*2,e=Math.sin(t),n=Math.cos(t),s=Qa(-.12,.28,e),r=Math.max(0,1-Math.abs(e)/.3);let a=Pi([.04,.06,.14],[.68,.84,.95],s);a=Pi(a,[.97,.56,.36],r*.55);let o=Pi([.012,.02,.07],[.24,.5,.88],s);o=Pi(o,[.34,.3,.52],r*.4);const l=e>=0,c=l?Qa(-.02,.3,e):Qa(-.02,.3,-e)*.3,h=this.uni.uSunDir.value;l?h.set(n,e,.25):h.set(-n,-e,.25),h.normalize();const u=l?Pi([1,.6,.36],[1,.96,.86],Qa(0,.4,e)).map(x=>x*.62*c):[.42*c,.52*c,.85*c];this.uni.uSunCol.value.set(u[0],u[1],u[2]);const f=Pi([.17,.21,.36],[.44,.5,.62],s);this.light=.38+.62*s,this.uni.uAmb.value.set(f[0]+r*.12,f[1]+r*.06,f[2]+r*.02);const d=this.camera.position,g=this.world.getBlock(Math.floor(d.x),Math.floor(d.y),Math.floor(d.z))===_.WATER;this.underwater=g;const v=this.viewDist*F-6;if(g){const x=Pi([.04,.12,.26],[.12,.38,.66],s);this.uni.uFog.value.set(x[0],x[1],x[2]),this.uni.uFogRange.value.set(.5,24),this.domeU.uHor.value.set(x[0],x[1],x[2]),this.domeU.uZen.value.set(x[0],x[1],x[2]),this.domeU.uGlow.value.set(0,0,0)}else{this.uni.uFog.value.set(a[0],a[1],a[2]),this.uni.uFogRange.value.set(v*.4,v),this.domeU.uHor.value.set(a[0],a[1],a[2]),this.domeU.uZen.value.set(o[0],o[1],o[2]);const x=.9*r+.1*s;this.domeU.uGlow.value.set(.95*x,.62*x,.4*x)}this.domeU.uSunN.value.set(n,e,.25).normalize(),this.sky.position.copy(d);const m=this.domeU.uSunN.value;this.sun.position.copy(m).multiplyScalar(500),this.sun.lookAt(d),this.moon.position.copy(m).multiplyScalar(-500),this.moon.lookAt(d),this.sun.visible=e>-.25&&!g,this.moon.visible=e<.25&&!g,this.starMat.opacity=Math.max(0,Math.min(1,(.12-e)*3))*(g?0:1),this.stars.rotation.z=t,this.clouds.position.set(d.x,105,d.z),this.clouds.visible=!g&&this.cloudsOn;const p=Pi([.2,.23,.36],[1,1,1],s);this.cloudU.uCol.value.set(p[0]+r*0,p[1]-r*.18,p[2]-r*.3)}render(){this.renderer.render(this.scene,this.camera)}biomeName(){const t=this.world?this.world.biomeAt(this.player.x,this.player.z):-1;return t>=0?Fx[t]:""}clockText(){const t=Math.floor((this.time*24+6)%24*60);return String(Math.floor(t/60)).padStart(2,"0")+":"+String(t%60).padStart(2,"0")}}const Bd={bauer:[{give:[tt.APPLE,4],need:[[tt.WHEAT,4]]},{give:[tt.SEEDS,6],need:[[tt.BREAD,1]]},{give:[tt.BREAD,2],need:[[_.WOOD,3]]},{give:[tt.COPPER_INGOT,1],need:[[tt.WHEAT,10]]}],schmied:[{give:[tt.IRON_INGOT,1],need:[[_.COAL,6]]},{give:[tt.STONE_PICK,1],need:[[tt.WHEAT,4]]},{give:[tt.COPPER_HELMET,1],need:[[tt.COPPER_INGOT,3],[tt.BREAD,2]]},{give:[tt.IRON_PICK,1],need:[[_.CRYSTAL,2],[tt.WHEAT,8]]}],funker:[{give:[_.RADIO,1],need:[[tt.COPPER_INGOT,2]]},{give:[_.LAMP,4],need:[[tt.WHEAT,6]]},{give:[_.SWITCH,2],need:[[tt.BREAD,1]]},{give:[_.CRYSTAL,1],need:[[tt.IRON_INGOT,3]]}],hirte:[{give:[_.WOOL,4],need:[[tt.WHEAT,4]]},{give:[tt.MEAT_COOKED,3],need:[[tt.WHEAT,5]]},{give:[tt.MEAT_RAW,4],need:[[tt.APPLE,3]]}]},zM={bauer:"Die Felder geben gut her. Weizen tausche ich gern!",schmied:"Kohle und Barren sind mir am liebsten. Ich mache dir gutes Werkzeug.",funker:"Seit dem großen Rauschen ist unser Mast stumm. Bring mir Kupfer, dann reden wir über Funk.",hirte:"Meine Schafe geben Wolle. Für Weizen bekommst du welche."},Hd=1,mf=4,FM=9,BM=16e3,HM=60,gf={survival:[64,32],creative:[8192,2e3]},GM=new Set([_.SWITCH_ON,_.WHEAT0,_.FARMLAND]),$r=i=>typeof i=="number"&&Number.isFinite(i),zn=i=>Number.isInteger(i),Gd=i=>(typeof i=="string"?i.replace(/[^\p{L}\p{N} _.-]/gu,"").trim().slice(0,16):"")||"Gast";function Vd(i){if(typeof i!="string"||i.length>4e6)return null;try{const t=JSON.parse(i);return t&&typeof t=="object"&&typeof t.k=="string"?t:null}catch{return null}}function VM(i,t=BM){const e=[];for(let n=0;n<i.length;n+=t)e.push(i.slice(n,n+t));return e.length?e:[""]}const WM=i=>Kt[i]&&Kt[i].drop||i;class XM{constructor(t){this.env=t,this.peers=new Map,this.nextId=1,this.blocks=[],this.t=0,this.mobT=0}addPeer(t){return{id:0,name:"",send:t,token:null,pos:null,posT:0,bucket:0,bucketT:0,joined:!1}}get guests(){return[...this.peers.values()]}sendTo(t,e){try{t.send(JSON.stringify(e))}catch{}}broadcast(t,e){const n=JSON.stringify(t);for(const s of this.peers.values())if(s!==e)try{s.send(n)}catch{}}receive(t,e){const n=Vd(e);if(n){if(!t.joined){n.k==="hello"&&this.hello(t,n);return}if(n.tk===t.token){if(n.k==="pos")this.onPos(t,n);else if(n.k==="sets")this.onSets(t,n);else if(n.k==="hit"&&zn(n.id)&&$r(n.dmg)){const s=this.env.onHit(t,n.id,Math.max(0,Math.min(10,n.dmg)));s&&s.length&&this.sendTo(t,{k:"drops",list:s})}}}}hello(t,e){if(e.v!==Hd){this.sendTo(t,{k:"bye",why:"Andere Spielversion – bitte beide die Seite neu laden."});return}if(this.peers.size>=mf){this.sendTo(t,{k:"bye",why:`Die Welt ist voll (höchstens ${mf} Gäste).`});return}t.id=this.nextId++,t.name=Gd(e.name),t.joined=!0,t.token=Math.random().toString(36).slice(2,12)+Date.now().toString(36);const n=this.env.info(),s=JSON.stringify(n.edits||{}),r=VM(s);t.pos={x:n.pos.x,y:n.pos.y,z:n.pos.z,yaw:0,pitch:0},t.posT=this.env.now(),t.bucket=gf[n.mode==="creative"?"creative":"survival"][0],t.bucketT=this.env.now(),this.sendTo(t,{k:"welcome",id:t.id,tk:t.token,seed:n.seed,gen:n.gen,mode:n.mode,time:n.time,pos:n.pos,host:n.name,parts:r.length}),r.forEach((a,o)=>this.sendTo(t,{k:"part",i:o,s:a})),this.sendTo(t,{k:"pp",id:0,name:n.name,...n.pos});for(const a of this.peers.values())this.sendTo(t,{k:"pp",id:a.id,name:a.name,...a.pos}),this.sendTo(a,{k:"pp",id:t.id,name:t.name,...t.pos});this.peers.set(t.id,t),this.env.onJoin(t)}close(t){this.peers.has(t.id)&&(this.peers.delete(t.id),this.broadcast({k:"left",id:t.id}),this.env.onLeave(t))}kick(t,e){this.sendTo(t,{k:"bye",why:e}),this.close(t)}onPos(t,e){if(![e.x,e.y,e.z,e.yaw,e.pitch].every($r)||e.y<-10||e.y>oe+60)return;const n=this.env.now(),s=Math.max(.05,(n-t.posT)/1e3);Math.hypot(e.x-t.pos.x,e.y-t.pos.y,e.z-t.pos.z)>HM*s+4||(t.pos={x:e.x,y:e.y,z:e.z,yaw:e.yaw,pitch:e.pitch},t.posT=n,this.broadcast({k:"pp",id:t.id,x:e.x,y:e.y,z:e.z,yaw:e.yaw},t))}onSets(t,e){if(!Array.isArray(e.list)||!zn(e.r))return;const n=this.env.world,s=this.env.info().mode,[r,a]=gf[s==="creative"?"creative":"survival"],o=this.env.now();t.bucket=Math.min(r,t.bucket+(o-t.bucketT)/1e3*a),t.bucketT=o;const l=[],c=t.pos;e.list.forEach((h,u)=>{if(!Array.isArray(h)||h.length!==5||!h.every(zn)){l.push([u,-1]);return}const[f,d,g,v,m]=h;if(d<1||d>=oe||!Kt[m]||!Kt[v]){l.push([u,-1]);return}if(s!=="creative"&&m&&!Kt[m].inv&&!GM.has(m)){l.push([u,-1]);return}n.ensure&&n.ensure(f>>4,g>>4);const p=n.getBlock(f,d,g);if(Math.hypot(f+.5-c.x,d+.5-(c.y+1.6),g+.5-c.z)>(s==="creative"?200:FM)||t.bucket<1||p!==v){l.push([u,p]);return}t.bucket--,n.setBlock(f,d,g,m),Kt[m].shape==="cross"&&v===0&&this.env.onPlant(f,d,g)}),this.sendTo(t,{k:"ack",r:e.r,bad:l})}queueBlock(t,e,n,s){this.blocks.push([t,e,n,s])}hurt(t,e,n,s){const r=this.peers.get(t);r&&this.sendTo(r,{k:"hurt",dmg:e,cause:n,from:s})}tick(t,e,n,s){if(!this.peers.size){this.blocks.length=0;return}if(this.blocks.length&&(this.broadcast({k:"bs",list:this.blocks}),this.blocks=[]),this.t-=t,this.mobT-=t,this.t<=0&&(this.t=.1,this.broadcast({k:"pp",id:0,x:e.x,y:e.y,z:e.z,yaw:e.yaw}),(this.tt=(this.tt||0)+1)%10===0&&this.broadcast({k:"time",t:n})),this.mobT<=0&&s){this.mobT=.2;for(const r of this.peers.values()){const a=[];for(const o of s)Math.hypot(o.x-r.pos.x,o.z-r.pos.z)<64&&a.push($M(o));this.sendTo(r,{k:"mobs",list:a})}}}}const $M=i=>[i.id,i.type,+i.x.toFixed(2),+i.y.toFixed(2),+i.z.toFixed(2),+i.yaw.toFixed(2),i.hurtT>0?1:0,i.moving?1:0,i.npc&&i.role||"",i.npc&&i.name||""];class qM{constructor(t,e,n){this.env=t,this.send=e,this.name=Gd(n),this.token=null,this.id=0,this.welcome=null,this.parts=null,this.r=0,this.pending=new Map,this.out=[]}hello(){this.send(JSON.stringify({k:"hello",v:Hd,name:this.name}))}post(t){this.token&&this.send(JSON.stringify({...t,tk:this.token}))}receive(t){const e=Vd(t);if(e)switch(e.k){case"welcome":if(this.token||!zn(e.parts)||e.parts<1)return;this.welcome=e,this.parts=new Array(e.parts),this.got=0,this.token=e.tk,this.id=e.id;return;case"part":{if(!this.parts||!zn(e.i)||e.i<0||e.i>=this.parts.length||this.parts[e.i]!==void 0||typeof e.s!="string"||(this.parts[e.i]=e.s,++this.got<this.parts.length))return;let n={};try{n=JSON.parse(this.parts.join(""))}catch{this.env.onBye("Weltdaten beschädigt");return}const s=this.welcome;this.parts=null,this.env.onWelcome({seed:s.seed,gen:s.gen,mode:s.mode,time:s.time,pos:s.pos,host:s.host,edits:n,id:s.id});return}case"bs":Array.isArray(e.list)&&this.env.onBlocks(e.list.filter(n=>Array.isArray(n)&&n.length===4&&n.every(zn)));return;case"pp":zn(e.id)&&e.id!==this.id&&[e.x,e.y,e.z].every($r)&&this.env.onPlayer(e.id,e);return;case"left":zn(e.id)&&this.env.onLeft(e.id);return;case"mobs":Array.isArray(e.list)&&this.env.onMobs(e.list);return;case"hurt":$r(e.dmg)&&this.env.onHurt(e);return;case"drops":Array.isArray(e.list)&&this.env.onDrops(e.list.filter(n=>Array.isArray(n)&&zn(n[0])&&zn(n[1])&&n[1]>0&&n[1]<100));return;case"time":$r(e.t)&&this.env.onTime(e.t);return;case"ack":{const n=this.pending.get(e.r);if(!n)return;this.pending.delete(e.r);const s=Array.isArray(e.bad)?e.bad.filter(r=>Array.isArray(r)&&zn(r[0])&&n[r[0]]).map(r=>[...n[r[0]],r[1]]):[];s.length&&this.env.onReject(s);return}case"bye":this.env.onBye(typeof e.why=="string"?e.why.slice(0,120):"Verbindung beendet");return}}local(t,e,n,s,r){this.out.push([t,e,n,s,r])}flush(){if(!this.out.length||!this.token)return;const t=++this.r;for(let e=0;e<this.out.length;e+=4096){const n=this.out.slice(e,e+4096),s=e?++this.r:t;this.pending.set(s,n),this.post({k:"sets",r:s,list:n})}this.out=[]}pos(t){this.post({k:"pos",x:+t.x.toFixed(2),y:+t.y.toFixed(2),z:+t.z.toFixed(2),yaw:+t.yaw.toFixed(2),pitch:+t.pitch.toFixed(2)})}hit(t,e){this.post({k:"hit",id:t,dmg:e})}}const Wd=[{urls:"stun:stun.l.google.com:19302"}],qr="KF1.";function Xd(i){return i.iceGatheringState==="complete"?Promise.resolve():new Promise(t=>{const e=setTimeout(t,5e3);i.addEventListener("icegatheringstatechange",()=>{i.iceGatheringState==="complete"&&(clearTimeout(e),t())})})}const _f=i=>{let t="";for(let e=0;e<i.length;e+=8192)t+=String.fromCharCode.apply(null,i.subarray(e,e+8192));return btoa(t).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")},KM=i=>{const t=atob(i.replace(/-/g,"+").replace(/_/g,"/")),e=new Uint8Array(t.length);for(let n=0;n<t.length;n++)e[n]=t.charCodeAt(n);return e};async function $d(i,t){return new Uint8Array(await new Response(new Blob([i]).stream().pipeThrough(t)).arrayBuffer())}async function qd(i){const t=new TextEncoder().encode(JSON.stringify(i));return typeof CompressionStream<"u"?qr+"z"+_f(await $d(t,new CompressionStream("deflate-raw"))):qr+"j"+_f(t)}async function Kd(i){const t=String(i||"").replace(/\s+/g,"");if(!t.startsWith(qr))throw new Error("Das ist kein KlotzFunk-Code");let e=KM(t.slice(qr.length+1));if(t[qr.length]==="z"){if(typeof DecompressionStream>"u")throw new Error("Dieser Browser kann den Code nicht entpacken");e=await $d(e,new DecompressionStream("deflate-raw"))}return JSON.parse(new TextDecoder().decode(e))}async function YM(i,t){const e=new RTCPeerConnection({iceServers:i?Wd:[]}),n=e.createDataChannel("klotzfunk",{ordered:!0});n.onopen=()=>t(n,e),await e.setLocalDescription(await e.createOffer()),await Xd(e);const s=await qd({t:"o",sdp:e.localDescription.sdp});return{pc:e,dc:n,code:s,async accept(r){const a=await Kd(r);if(a.t!=="a"||typeof a.sdp!="string")throw new Error("Das ist kein Antwort-Code");await e.setRemoteDescription({type:"answer",sdp:a.sdp})}}}async function jM(i,t,e){const n=await Kd(i);if(n.t!=="o"||typeof n.sdp!="string")throw new Error("Das ist kein Einladungs-Code");const s=new RTCPeerConnection({iceServers:t?Wd:[]});return s.ondatachannel=r=>{const a=r.channel;a.readyState==="open"?e(a,s):a.onopen=()=>e(a,s)},await s.setRemoteDescription({type:"offer",sdp:n.sdp}),await s.setLocalDescription(await s.createAnswer()),await Xd(s),{pc:s,code:await qd({t:"a",sdp:s.localDescription.sdp})}}const vf=[3836632,14178874,3848298,13150266,10115800],ZM=i=>[[-.22,0,-.12,-.02,.75,.12,2767450],[.02,0,-.12,.22,.75,.12,2767450],[-.28,.75,-.16,.28,1.4,.16,i],[-.4,.8,-.1,-.28,1.38,.1,i],[.28,.8,-.1,.4,1.38,.1,i],[-.22,1.4,-.22,.22,1.84,.22,15253658],[-.24,1.76,-.24,.24,1.9,.24,4863008],[-.13,1.6,-.24,-.05,1.66,-.22,2105376],[.05,1.6,-.24,.13,1.66,-.22,2105376]];function JM(i){const t=document.createElement("canvas");t.width=256,t.height=64;const e=t.getContext("2d");e.font="bold 34px system-ui, sans-serif",e.textAlign="center",e.textBaseline="middle";const n=Math.min(250,e.measureText(i).width+28);e.fillStyle="rgba(10,14,30,.62)",e.fillRect(128-n/2,6,n,52),e.fillStyle="#fff",e.fillText(i,128,33);const s=new lo(t),r=new wx(new sd({map:s,depthTest:!1,transparent:!0}));return r.scale.set(1.6,.4,1),r.position.y=2.25,r.renderOrder=30,r}class QM{constructor(t){this.group=new Hn,t.add(this.group),this.list=new Map,this.geos=vf.map(e=>js(ZM(e)))}set(t,e){let n=this.list.get(t);if(!n){const s=new Vi({vertexColors:!0}),r=new Hn;r.add(new Ce(this.geos[t%vf.length],s)),n={root:r,mat:s,name:"",tag:null,x:e.x,y:e.y,z:e.z,yaw:e.yaw||0,tx:e.x,ty:e.y,tz:e.z,tyaw:e.yaw||0},this.group.add(r),this.list.set(t,n)}e.name&&e.name!==n.name&&(n.name=e.name,n.tag&&(n.root.remove(n.tag),n.tag.material.map.dispose(),n.tag.material.dispose()),n.tag=JM(e.name),n.root.add(n.tag)),n.tx=e.x,n.ty=e.y,n.tz=e.z,Number.isFinite(e.yaw)&&(n.tyaw=e.yaw)}remove(t){const e=this.list.get(t);e&&(this.group.remove(e.root),e.mat.dispose(),e.tag&&(e.tag.material.map.dispose(),e.tag.material.dispose()),this.list.delete(t))}clear(){for(const t of[...this.list.keys()])this.remove(t)}update(t,e){const n=Math.min(1,t*12);for(const s of this.list.values()){Math.hypot(s.tx-s.x,s.tz-s.z)>20&&(s.x=s.tx,s.y=s.ty,s.z=s.tz),s.x+=(s.tx-s.x)*n,s.y+=(s.ty-s.y)*n,s.z+=(s.tz-s.z)*n;let r=s.tyaw-s.yaw;r=Math.atan2(Math.sin(r),Math.cos(r)),s.yaw+=r*n,s.root.position.set(s.x,s.y,s.z),s.root.rotation.y=s.yaw,s.mat.color.setRGB(e,e,e)}}}class zl{constructor(t){this.view=t,this.list=[],this.byId=new Map,this.enabled=!1}set(t){const e=new Set;for(const n of t){const[s,r,a,o,l,c,h,u,f,d]=n;if(!Number.isInteger(s)||!ia[r]||![a,o,l,c].every(Number.isFinite))continue;e.add(s);let g=this.byId.get(s);if(!g){const v=ia[r];g={id:s,type:r,T:v,x:a,y:o,z:l,yaw:c,hurtT:0,moving:!1,hostile:!!v.hostile,npc:!!v.npc,role:f||"",name:d||v.name},this.byId.set(s,g),this.list.push(g),this.view.add(g)}Object.assign(g,{x:a,y:o,z:l,yaw:c,moving:!!u}),h&&(g.hurtT=.2)}for(const n of this.list.slice())e.has(n.id)||this.removeMob(n)}removeMob(t){this.byId.delete(t.id),this.list.splice(this.list.indexOf(t),1),this.view.remove(t)}update(t){for(const e of this.list)e.hurtT=Math.max(0,e.hurtT-t)}raycast(t,e,n,s,r,a,o){let l=null,c=o;for(const h of this.list){const u=h.T.half,f=[h.x-u,h.y,h.z-u],d=[h.x+u,h.y+h.T.h,h.z+u],g=[t,e,n],v=[s,r,a];let m=0,p=c;for(let x=0;x<3&&m<=p;x++){if(Math.abs(v[x])<1e-9){(g[x]<f[x]||g[x]>d[x])&&(m=1/0);continue}let y=(f[x]-g[x])/v[x],M=(d[x]-g[x])/v[x];y>M&&([y,M]=[M,y]),m=Math.max(m,y),p=Math.min(p,M)}m<=p&&m<c&&(c=m,l=h)}return l?{mob:l,t:c}:null}remove(t){this.byId.has(t.id)&&this.removeMob(t)}clear(){for(const t of this.list.slice())this.removeMob(t)}serialize(){}hostileCount(){return 0}}class ty{constructor(t,e){this.game=t,this.ui=e,this.avatars=new QM(t.scene),this.host=null,this.guest=null,this.conns=new Set,this.posT=0,this.useStun=!0}get active(){return!!(this.host||this.guest)}open(){const t=this.game;this.host||(this.host=new XM({world:t.world,now:()=>performance.now(),info:()=>({seed:t.seed,gen:t.gen,mode:t.mode,time:t.time,edits:xd(t.world.edits),pos:{x:t.player.x,y:t.player.y,z:t.player.z},name:this.myName||"Gastgeber"}),onPlant:(e,n,s)=>t.farm.plant(e,n,s,t.age),onHit:(e,n,s)=>this.hostHit(e,n,s),onJoin:e=>{this.ui.toast(`${e.name} ist in deiner Welt`),this.avatars.set(e.id,{...e.pos,name:e.name}),this.listPlayers()},onLeave:e=>{this.ui.toast(`${e.name} hat die Welt verlassen`),this.avatars.remove(e.id),this.listPlayers()}}),t.world.onSet=(e,n,s,r)=>this.host&&this.host.queueBlock(e,n,s,r),t.mp=this,t.running||t.resume())}async invite(){this.open();let t=null;const e=await YM(this.useStun,n=>{t=this.host.addPeer(s=>n.send(s)),t.dc=n,t.pc=e.pc,this.conns.add(e.pc),n.onmessage=s=>this.host.receive(t,s.data),n.onclose=()=>{this.host&&this.host.close(t),this.conns.delete(e.pc)}});return e.pc.onconnectionstatechange=()=>{["failed","closed"].includes(e.pc.connectionState)&&t&&this.host&&this.host.close(t)},e}hostHit(t,e,n){const s=this.game,r=s.mobs&&s.mobs.list.find(a=>a.id===e);return!r||r.npc||Math.hypot(r.x-t.pos.x,r.z-t.pos.z)>8||!r.hit(n,t.pos.x,t.pos.z)?null:(s.spawnBreak(r.x-.5,r.y,r.z-.5,60),s.mobs.remove(r,!1),s.unsaved=!0,s.mode==="creative"?null:Od(r.type))}others(){return this.host?this.host.guests.map(t=>({id:t.id,x:t.pos.x,y:t.pos.y,z:t.pos.z})):null}hurtGuest(t){const e=this.host&&this.host.peers.get(t.target);e&&this.host.hurt(e.id,t.T.dmg,t.T.name,[t.x,t.y+.3,t.z,t.T.range?1:0])}kick(t){const e=this.host&&this.host.peers.get(t);if(e){this.host.kick(e,"Der Gastgeber hat dich aus der Welt genommen.");try{e.pc.close()}catch{}}}listPlayers(){const t=this.host?this.host.guests.map(e=>({id:e.id,name:e.name})):[...this.avatars.list.entries()].map(([e,n])=>({id:e,name:n.name}));this.ui.players(t)}async join(t,e){const n=this.game;this.myName=e,this.guest=new qM({onWelcome:r=>this.welcome(r),onBlocks:r=>{const a=n.world;if(a)for(const[o,l,c,h]of r)a.ensure&&a.ensure(o>>4,c>>4),a.setBlock(o,l,c,h)},onPlayer:(r,a)=>{this.avatars.set(r,a),a.name&&this.listPlayers()},onLeft:r=>{const a=this.avatars.list.get(r);a&&this.ui.toast(`${a.name||"Ein Spieler"} ist gegangen`),this.avatars.remove(r),this.listPlayers()},onMobs:r=>{n.mobs instanceof zl&&n.mobs.set(r)},onHurt:r=>n.remoteHurt(r),onDrops:r=>{for(const[a,o]of r)n.inv[a]=Math.min(Xe,(n.inv[a]||0)+o);this.ui.toast(r.map(([a,o])=>`+${o} ${ge(a)}`).join(" · ")),n.onChange()},onTime:r=>{n.time=r},onReject:r=>this.reject(r),onBye:r=>this.end(r)},r=>this.dc&&this.dc.readyState==="open"&&this.dc.send(r),e);const s=await jM(t,this.useStun,(r,a)=>{this.dc=r,this.conns.add(a),r.onmessage=o=>this.guest&&this.guest.receive(o.data),r.onclose=()=>this.end("Die Verbindung zum Gastgeber ist getrennt."),this.guest.hello(),this.ui.status("Verbunden, Welt wird geladen …")});return s.pc.onconnectionstatechange=()=>{["failed","closed"].includes(s.pc.connectionState)&&this.end("Die Verbindung zum Gastgeber ist getrennt.")},s.code}welcome(t){const e=this.game;e.start({name:`Bei ${t.host}`,seed:t.seed,gen:t.gen,mode:t.mode,time:t.time,edits:t.edits,px:t.pos.x+1.5,py:t.pos.y,pz:t.pos.z,yaw:0,pitch:0}),e.mp=this,e.net=this.guest,e.mobs.clear(),e.mobs=new zl(e.mobView),this.ui.joined(t)}reject(t){const e=this.game;for(const[n,s,r,a,o,l]of t)if(e.world.setBlock(n,s,r,l>=0?l:a),e.mode!=="creative")if(o)e.inv[o]=Math.min(Xe,(e.inv[o]||0)+1);else{const c=WM(a);e.inv[c]=Math.max(0,(e.inv[c]||0)-1)}e.onChange(),this.ui.toast("Der Gastgeber hat eine Änderung nicht übernommen")}tick(t){const e=this.game,n=e.player;if(this.avatars.update(t,e.light),this.host){this.host.tick(t,{x:n.x,y:n.y,z:n.z,yaw:e.yaw},e.time,e.mobs?e.mobs.list:null);for(const s of this.host.guests)this.avatars.set(s.id,s.pos)}this.guest&&this.guest.token&&(this.guest.flush(),(this.posT-=t)<=0&&(this.posT=.1,this.guest.pos({x:n.x,y:n.y,z:n.z,yaw:e.yaw,pitch:e.pitch})),e.mobs instanceof zl&&e.mobs.update(t))}end(t){if(!this.active&&!this.conns.size)return;const e=!!this.guest;if(this.host)for(const s of this.host.guests)this.host.kick(s,"Der Gastgeber hat die Welt geschlossen.");for(const s of this.conns)try{s.close()}catch{}this.conns.clear(),this.host=null,this.guest=null,this.dc=null,this.avatars.clear();const n=this.game;n.world&&(n.world.onSet=null),n.mp=null,n.net=null,t&&this.ui.ended(t,e)}}const Xs=[.25,.5,1,2];class ey{constructor(t,e,n){this.game=t,this.$=e,this.toast=n,this.cv=e("wm"),this.ctx=this.cv.getContext("2d"),this.off=document.createElement("canvas"),this.offCtx=this.off.getContext("2d"),this.zi=3,this.cx=0,this.cz=0,this.sel=null,this.drag=null;const s=this.cv;s.addEventListener("pointerdown",a=>{s.setPointerCapture(a.pointerId),this.drag={id:a.pointerId,x:a.clientX,y:a.clientY,moved:0}}),s.addEventListener("pointermove",a=>{const o=this.drag;if(!o||o.id!==a.pointerId)return;const l=this.scale(),c=Xs[this.zi];this.cx-=(a.clientX-o.x)*l/c,this.cz-=(a.clientY-o.y)*l/c,o.moved+=Math.abs(a.clientX-o.x)+Math.abs(a.clientY-o.y),o.x=a.clientX,o.y=a.clientY,this.draw()});const r=a=>{const o=this.drag;if(!(!o||o.id!==a.pointerId)&&(this.drag=null,o.moved<8)){const l=this.toWorld(a);this.select(l.x,l.z)}};s.addEventListener("pointerup",r),s.addEventListener("pointercancel",()=>{this.drag=null}),s.addEventListener("wheel",a=>{a.preventDefault(),this.zoom(a.deltaY<0?1:-1)},{passive:!1}),e("mapZin").onclick=()=>this.zoom(1),e("mapZout").onclick=()=>this.zoom(-1),e("mapMe").onclick=()=>{this.cx=t.player.x,this.cz=t.player.z,this.draw()},e("mapMark").onclick=()=>{if(this.sel){if(!t.map.addMark(this.sel.x,this.sel.z)){this.toast(`Höchstens ${kc} Markierungen`);return}t.unsaved=!0,this.list(),this.draw()}},e("mapGo").onclick=()=>{this.sel&&this.setWp(this.sel.x,this.sel.z)},e("mapMarks").addEventListener("click",a=>{const o=a.target.closest("button[data-i]");if(!o)return;const l=t.map.marks[Number(o.dataset.i)];l&&(o.dataset.a==="go"?this.setWp(l.x,l.z):o.dataset.a==="del"?(t.map.removeMark(Number(o.dataset.i)),t.unsaved=!0,this.list()):(this.cx=l.x,this.cz=l.z),this.draw())}),e("mapMarks").addEventListener("change",a=>{const o=a.target;if(o.dataset.i==null)return;const l=t.map.marks[Number(o.dataset.i)];l&&(l.n=o.value.trim().slice(0,24)||l.n,o.value=l.n,t.unsaved=!0,this.draw())})}scale(){return this.cv.width/Math.max(1,this.cv.clientWidth)}toWorld(t){const e=this.cv.getBoundingClientRect(),n=this.scale(),s=Xs[this.zi];return{x:this.cx+((t.clientX-e.left)*n-this.cv.width/2)/s,z:this.cz+((t.clientY-e.top)*n-this.cv.height/2)/s}}zoomLevel(){return Xs[this.zi]}zoom(t){this.zi=Math.max(0,Math.min(Xs.length-1,this.zi+t)),this.draw()}select(t,e){const n=this.game,s=Math.floor(t/16),r=Math.floor(e/16);this.sel={x:Math.round(t),z:Math.round(e)},this.$("mapSel").textContent=`Gewählt: X ${this.sel.x} · Z ${this.sel.z}${n.map.has(s,r)?"":" (noch unentdeckt)"}`,this.$("mapAct").hidden=!1,this.draw()}setWp(t,e){const n=this.game;n.wp={x:Math.round(t),y:Math.round(n.player.y),z:Math.round(e)},n.unsaved=!0,this.toast("Wegpunkt gesetzt 📍")}open(){const t=this.game,e=this.cv,n=Math.min(1.5,window.devicePixelRatio||1);this.cx=t.player.x,this.cz=t.player.z,this.sel=null,this.$("mapSel").textContent="Tippe auf die Karte, um einen Ort zu wählen. Ziehen verschiebt die Karte.",this.$("mapAct").hidden=!0,t.map.markAround(t.player.x,t.player.z,Math.min(t.viewDist,5)),t.map.syncRadios(t.world),requestAnimationFrame(()=>{e.width=Math.max(200,Math.round(e.clientWidth*n)),e.height=Math.max(160,Math.round(e.clientHeight*n)),this.list(),this.draw()})}list(){const t=this.$("mapMarks"),e=this.game;t.textContent="",e.map.marks.forEach((n,s)=>{const r=document.createElement("li"),a=document.createElement("input");a.value=n.n,a.maxLength=24,a.dataset.i=s,a.setAttribute("aria-label","Name der Markierung");const o=(l,c,h)=>{const u=document.createElement("button");return u.dataset.i=s,u.dataset.a=l,u.textContent=c,u.title=h,u.setAttribute("aria-label",h),u};r.append(o("show","★","Auf der Karte zeigen"),a,o("go","📍","Wegpunkt hierher"),o("del","✕","Markierung löschen")),t.append(r)}),this.$("mapMarksH").hidden=!e.map.marks.length}draw(){const t=this.game,e=this.cv,n=this.ctx,s=e.width,r=e.height,a=Xs[this.zi],o=t.map;if(!o||!t.world)return;const l=this.cx-s/2/a,c=this.cz-r/2/a,h=Math.floor(l/16),u=Math.floor(c/16),f=Math.ceil(s/a/16)+2,d=Math.ceil(r/a/16)+2;(this.off.width!==f*Be||this.off.height!==d*Be)&&(this.off.width=f*Be,this.off.height=d*Be,this.img=this.offCtx.createImageData(f*Be,d*Be));const g=this.img.data;g.fill(0);for(let M=0;M<d;M++)for(let C=0;C<f;C++){if(!o.has(h+C,u+M))continue;const A=o.tile(t.world,h+C,u+M);for(let w=0;w<Be;w++)g.set(A.subarray(w*Be*4,(w+1)*Be*4),((M*Be+w)*f*Be+C*Be)*4)}this.offCtx.putImageData(this.img,0,0),n.fillStyle="#0b1020",n.fillRect(0,0,s,r),n.imageSmoothingEnabled=!1;const v=M=>(M-l)*a,m=M=>(M-c)*a;n.drawImage(this.off,v(h*16),m(u*16),f*16*a,d*16*a);const p=Math.max(11,Math.round(13*s/Math.max(1,e.clientWidth)));n.font=`${p}px system-ui,sans-serif`,n.textAlign="center",n.textBaseline="middle";const x=(M,C,A,w)=>{const L=v(M),T=m(C);L<-20||T<-20||L>s+20||T>r+20||(n.fillText(A,L,T),w&&(n.lineWidth=3,n.strokeStyle="rgba(0,0,0,.7)",n.strokeText(w,L,T+p),n.fillStyle="#fff",n.fillText(w,L,T+p)))};if(n.fillStyle="#fff",t.world.gen===3){const M=Rn(l),C=Rn(l+s/a),A=Rn(c),w=Rn(c+r/a);if((C-M+1)*(w-A+1)<=64)for(let L=A;L<=w;L++)for(let T=M;T<=C;T++){const b=ua(t.seed,T,L);b&&o.has(b.x>>4,b.z>>4)&&x(b.x,b.z,"🏘",a>=.5?"Dorf":"")}}for(const M of o.radios.values())x(M[0],M[2],"📻","");for(const M of o.marks)x(M.x,M.z,"★",M.n);if(t.grave&&x(t.grave.x,t.grave.z,"✝",""),t.wp&&x(t.wp.x,t.wp.z,"📍",t.story&&!t.story.done?"Storyziel":""),this.sel&&(n.strokeStyle="#ff2d95",n.lineWidth=2,n.strokeRect(v(this.sel.x)-7,m(this.sel.z)-7,14,14)),t.mp)for(const[,M]of t.mp.avatars.list)M.x!=null&&x(M.x,M.z,"👤",a>=.5?M.name:"");const y=t.player;n.save(),n.translate(v(y.x),m(y.z)),n.rotate(-t.yaw),n.scale(p/9,p/9),n.fillStyle="#fff",n.strokeStyle="#000",n.lineWidth=1,n.beginPath(),n.moveTo(0,-6),n.lineTo(4.5,5),n.lineTo(0,2.5),n.lineTo(-4.5,5),n.closePath(),n.fill(),n.stroke(),n.restore(),this.$("mapInfo").textContent=`${o.count} Gebiete entdeckt · Zoom ${this.zi+1}/${Xs.length} · X ${Math.round(t.player.x)} Z ${Math.round(t.player.z)}`}}const Kr=[["fwd","Vorwärts","KeyW"],["back","Rückwärts","KeyS"],["left","Links","KeyA"],["right","Rechts","KeyD"],["jump","Springen / Hoch","Space"],["sneak","Schleichen / Runter","ShiftLeft"],["sprint","Rennen","ControlLeft"],["inv","Inventar","KeyE"],["map","Weltkarte","KeyM"],["hook","Seilhaken","KeyQ"],["wp","Wegpunkt","KeyB"],["fly","Fliegen (Kreativ)","KeyF"],["build","Bauform","KeyG"],["quests","Aufträge ein/aus","KeyJ"]],Yd=new Set(["Escape","Tab","MetaLeft","MetaRight",...Array.from({length:9},(i,t)=>"Digit"+(t+1))]),Fl=Object.fromEntries(Kr.map(i=>[i[0],i[2]]));function jd(i){const t={...Fl};if(!i||typeof i!="object")return t;for(const[n]of Kr){const s=i[n];typeof s=="string"&&/^[A-Za-z0-9]{1,24}$/.test(s)&&!Yd.has(s)&&(t[n]=s)}const e=new Map;for(const[n]of Kr)e.has(t[n])&&(t[n]=Fl[n]),e.set(t[n],n);return new Set(Object.values(t)).size===Kr.length?t:{...Fl}}function ny(i,t,e){if(Yd.has(e)||!(t in i))return null;const n={...i},s=Object.keys(n).find(r=>n[r]===e);return s&&s!==t&&(n[s]=n[t]),n[t]=e,n}function iy(i,t){for(const e in i)if(i[e]===t)return e;return null}function sy(i){return/^Key[A-Z]$/.test(i)?i[3]:/^Digit\d$/.test(i)?i[5]:{Space:"Leertaste",ShiftLeft:"Umschalt links",ShiftRight:"Umschalt rechts",ControlLeft:"Strg links",ControlRight:"Strg rechts",AltLeft:"Alt",AltRight:"Alt Gr",ArrowUp:"↑",ArrowDown:"↓",ArrowLeft:"←",ArrowRight:"→",Enter:"Eingabe",Backspace:"⌫",CapsLock:"Feststell"}[i]||i}const se={S:0,E:1,W:2,N:3,LB:4,RB:5,LT:6,RT:7,SEL:8,START:9,L3:10,R3:11,UP:12,DOWN:13,LEFT:14,RIGHT:15},sh=16;function Zd(i=""){const t=String(i).toLowerCase();return/054c|playstation|dualsense|dualshock|ps[345]\b|ps[345] controller/.test(t)?"ps":/057e|nintendo|switch|pro controller|joy-?con/.test(t)?"switch":/045e|xbox|xinput|x-box/.test(t)?"xbox":"generic"}const bo={xbox:["A","B","X","Y","LB","RB","LT","RT","Ansicht","Menü","LS","RS","✚↑","✚↓","✚←","✚→","Xbox"],ps:["✕","○","□","△","L1","R1","L2","R2","Create","Options","L3","R3","✚↑","✚↓","✚←","✚→","PS"],switch:["B","A","Y","X","L","R","ZL","ZR","−","+","LS","RS","✚↑","✚↓","✚←","✚→","Home"]};bo.generic=bo.xbox;const Jd={xbox:"Xbox-Controller",ps:"PlayStation-Controller",switch:"Switch-Controller",generic:"Controller"},Fc=(i,t)=>(bo[i]||bo.xbox)[t]??"Taste "+t,Qd=i=>i==="switch"?se.E:se.S,tp=i=>i==="switch"?se.S:se.E,Yr=[["jump","Springen / Hoch",se.S],["sneak","Schleichen / Runter",se.E],["hook","Seilhaken",se.W],["inv","Inventar",se.N],["prev","Hotbar links",se.LB],["next","Hotbar rechts",se.RB],["place","Setzen / Benutzen",se.LT],["break","Abbauen / Angreifen",se.RT],["map","Weltkarte",se.SEL],["pause","Pause",se.START],["sprint","Rennen",se.L3],["undo","Rückgängig (Kreativ)",se.R3],["fly","Fliegen (Kreativ)",se.UP],["wp","Wegpunkt",se.DOWN],["build","Bauform",se.LEFT],["quests","Aufträge ein/aus",se.RIGHT]],po=Object.fromEntries(Yr.map(i=>[i[0],i[2]]));function rh(i){const t={...po};if(!i||typeof i!="object")return t;for(const[n]of Yr){const s=i[n];Number.isInteger(s)&&s>=0&&s<sh&&(t[n]=s)}const e=new Set;for(const[n]of Yr)e.has(t[n])&&(t[n]=po[n]),e.add(t[n]);return new Set(Object.values(t)).size===Yr.length?t:{...po}}function ry(i,t,e){if(!(t in i)||!Number.isInteger(e)||e<0||e>=sh)return null;const n={...i},s=Object.keys(n).find(r=>n[r]===e);return s&&s!==t&&(n[s]=n[t]),n[t]=e,n}const ay=(i,t=.18)=>Math.abs(i)<t?0:(i-Math.sign(i)*t)/(1-t);function oy(i,t,e=po,n=.18){const s=c=>ay(i.axes[c]||0,n),r=c=>{const h=i.buttons[c];return!!h&&(h.pressed||h.value>.5)},a=i.buttons.map((c,h)=>r(h)),o={},l={};for(const c in e){const h=e[c];o[c]=!!a[h],l[c]=!!a[h]&&!t[h]}return{r:s(0),f:-s(1),lx:s(2),ly:s(3),held:o,hit:l,buttons:a}}function ly(i,t,e){const n=i[t];if(!n)return i.length?0:-1;const s=n.x+n.w/2,r=n.y+n.h/2,a=e==="up"||e==="down",o=e==="down"||e==="right"?1:-1;let l=-1,c=1/0;return i.forEach((h,u)=>{if(u===t)return;const f=h.x+h.w/2,d=h.y+h.h/2,g=a?o>0?h.y-(n.y+n.h):n.y-(h.y+h.h):o>0?h.x-(n.x+n.w):n.x-(h.x+h.w);if((a?(d-r)*o:(f-s)*o)<=1||g<-Math.min(n.h,n.w)/2)return;const m=a?Math.max(0,Math.max(h.x,n.x)-Math.min(h.x+h.w,n.x+n.w)):Math.max(0,Math.max(h.y,n.y)-Math.min(h.y+h.h,n.y+n.h)),p=Math.max(0,g)+m*2.5;p<c&&(c=p,l=u)}),l}const cy={break:[.2,.45,55],place:[0,.22,30],hurt:[.85,.6,200],deny:[.05,.18,40],done:[.35,.7,260],hook:[.15,.35,70]};function Fo(i,t,e=1){const n=cy[t];if(!i||!n||!(e>0))return!1;const s=Math.min(1,e),[r,a,o]=n;try{const l=i.vibrationActuator;if(l&&l.playEffect){const h=l.playEffect("dual-rumble",{startDelay:0,duration:o,strongMagnitude:r*s,weakMagnitude:a*s});return h&&h.catch&&h.catch(()=>{}),!0}const c=i.hapticActuators&&i.hapticActuators[0];if(c&&c.pulse){const h=c.pulse(Math.max(r,a)*s,o);return h&&h.catch&&h.catch(()=>{}),!0}}catch{}return!1}const hy="1.11.0",P=i=>document.getElementById(i),ma=P("c"),ah=window.matchMedia("(pointer: coarse)").matches;let ht=h1();const D=new kM(ma,ah,ht.quality);window.__bv=D;let Mt="menu",vs="menu",lr=-1,cn=ah;const An=new Set;let Kn=jd(ht.keys);document.documentElement.style.setProperty("--atlas",`url(${D.atlasCanvas.toDataURL()})`);const Bc=D.itemCanvas.height/32;document.documentElement.style.setProperty("--items",`url(${D.itemCanvas.toDataURL()})`);document.documentElement.style.setProperty("--itemRows",Bc*100+"%");const To=i=>{if(Oi(i)){const e=Te[i]?Te[i].icon:0;return`<i class="ic it" style="background-position:${e%8*100/7}% ${Bc>1?Math.floor(e/8)*100/(Bc-1):0}%"></i>`}if(No(i)){const e=i-_i;return`<i class="ic lg" style="background-position:${e%4*100/3}% ${Math.floor(e/4)*100/3}%"></i>`}if(i===_.RAINBOW)return'<i class="ic rb"></i>';const t=Kt[i]?Kt[i].icon:0;return`<i class="ic" style="background-position:${t%8*100/7}% ${Math.floor(t/8)*100/15}%"></i>`};D.onLogos=()=>{document.documentElement.style.setProperty("--logos",`url(${D.logoCanvas.toDataURL("image/png")})`)};let xf=0;function ee(i){const t=P("toast");t.textContent=i,t.classList.add("on"),clearTimeout(xf),xf=setTimeout(()=>t.classList.remove("on"),1800)}D.onToast=ee;function Ji(){const i=P("hotbar");if(!i.children.length)for(let t=0;t<9;t++){const e=document.createElement("div");e.className="slot",e.addEventListener("pointerdown",n=>{n.stopPropagation(),D.selectSlot(t)}),e.addEventListener("dragstart",n=>{if(Mt!=="inventory"||!D.hotbar[t]){n.preventDefault();return}n.dataTransfer.setData("text/plain","h"+t)}),e.addEventListener("dragover",n=>{Mt==="inventory"&&(n.preventDefault(),e.classList.add("drop"))}),e.addEventListener("dragleave",()=>e.classList.remove("drop")),e.addEventListener("drop",n=>{n.preventDefault(),e.classList.remove("drop"),sp(t,n.dataTransfer.getData("text/plain"))}),i.appendChild(e)}for(let t=0;t<9;t++){const e=i.children[t],n=D.hotbar[t],s=D.mode==="creative"?"∞":D.inv[n]||0;e.className="slot"+(t===D.sel?" sel":"")+(n&&s===0?" empty":""),e.title=n?ge(n):"",e.draggable=Mt==="inventory"&&!!n;const r=ki(n),a=r&&D.dur[n]?1-D.dur[n]/r.dur:0;e.innerHTML=`<span class="k">${t+1}</span>${n?To(n):""}<span class="n">${n?s:""}</span>${a?`<span class="dur"><i style="width:${Math.round(a*100)}%;background:hsl(${Math.round(a*120)},80%,50%)"></i></span>`:""}`}}let ci="all",ep="",np=!1,ra=new Set,$i=null;const uy=[{id:"all",name:"Alle"},...Px,{id:"items",name:"Werkzeuge & Essen"}],fy=i=>i.tool?` · ${i.tool.speed}× schneller · hält ${i.tool.dur} Blöcke`:i.food?` · +${i.food} Hunger`:"";function ip(){P("invTabs").innerHTML=uy.map(i=>`<button role="tab" data-cat="${i.id}" class="${i.id===ci?"on":""}" aria-selected="${i.id===ci}">${i.name}</button>`).join("")}function sp(i,t){if(t){if(t[0]==="h"){const e=Number(t.slice(1));e>=0&&e<9&&e!==i&&([D.hotbar[i],D.hotbar[e]]=[D.hotbar[e],D.hotbar[i]])}else{const e=Number(t);if(!Number.isInteger(e)||!(Kt[e]||Te[e]))return;const n=D.hotbar.indexOf(e);n>=0&&(D.hotbar[n]=D.hotbar[i]),D.hotbar[i]=e}D.selectSlot(i),D.unsaved=!0,D.onChange()}}let Hc="std";function gr(){const i=D.mode==="creative",t=ep.trim().toLowerCase();P("invHint").textContent=i?"Kreativmodus: alle Blöcke sind unbegrenzt. Tippe einen Block, um ihn in den gewählten Hotbar-Platz zu legen.":"Tippe einen Block, um ihn in den gewählten Hotbar-Platz zu legen. Zahl = Vorrat.",P("invOwnedL").hidden=i,P("invSt").hidden=i||!$i,$i&&(P("invSt").textContent=$i==="ofen"?"🔥 Am Schmelzofen: Barren schmelzen und Essen braten":"🪚 An der Werkbank: Werkzeuge und Schmelzofen bauen");let e="";const n=[...Ox,...So];Hc==="name"?n.sort((r,a)=>ge(r).localeCompare(ge(a),"de")):Hc==="count"&&!i&&n.sort((r,a)=>(D.inv[a]||0)-(D.inv[r]||0));for(const r of n){const a=Kt[r]&&!Oi(r)?Kt[r]:Te[r],o=i?"∞":D.inv[r]||0;if(ci!=="all"&&a.cat!==ci||t&&!a.name.toLowerCase().includes(t)||np&&!i&&!o)continue;const l=Oi(r)?fy(a):a.tool?" · am besten mit "+a.tool[0].toUpperCase()+a.tool.slice(1):"";e+=`<button class="cell ${o?"has":"dim"}" data-t="${r}" draggable="true" title="${a.name}${l}${cn?"":" · Umschalt-Klick: in freien Platz · auf die Hotbar ziehen"}">${To(r)}<span>${a.name}</span><b>${o}</b></button>`}if(P("invGrid").innerHTML=e||'<div class="empty-note">Nichts gefunden.</div>',P("recH").hidden=i,i){P("recipes").innerHTML="";return}const s=hn.map((r,a)=>[r,a]).filter(([r])=>(ci==="all"||r.cat===ci)&&M1(r,t));P("recipes").innerHTML=s.length?s.map(([r,a])=>{const o=ih(D.inv,r,Xe,ra),l=x1(D.inv,r,Xe,ra),c=r.need.map(([f,d])=>{const g=D.inv[f]||0;return g>=d?`${d}× ${ge(f)}`:`<i>${d}× ${ge(f)} (${g})</i>`}).join(" + "),h=o.full?" · Vorrat voll":o.noStation?` · <i>${Fu[r.st]} nicht in der Nähe</i>`:"",u=r.st?`<span class="badge">${r.st==="ofen"?"🔥":"🪚"} ${Fu[r.st]}</span>`:"";return`<button data-r="${a}" ${o.ok?"":"disabled"}>${To(r.give[0])}<span><b>${r.give[1]}× ${ge(r.give[0])}</b>${u}<small>aus ${c}${h}</small></span><span class="cnt">${l?l+"×":""}</span></button>`}).join(""):'<div class="empty-note">Kein passendes Rezept.</div>'}P("invTabs").addEventListener("click",i=>{const t=i.target.closest("[data-cat]");t&&(ci=t.dataset.cat,ip(),gr())});P("invSearch").addEventListener("input",i=>{ep=i.target.value,gr()});P("invOwned").addEventListener("change",i=>{np=i.target.checked,gr()});P("invGrid").addEventListener("click",i=>{const t=i.target.closest("[data-t]");if(!t)return;const e=Number(t.dataset.t);if(i.shiftKey){if(D.hotbar.includes(e)){ee("Liegt schon in der Hotbar");return}const n=D.hotbar.indexOf(0);if(n<0){ee("Kein freier Hotbar-Platz");return}D.hotbar[n]=e,D.unsaved=!0,D.onChange(),ee(`${ge(e)} → Platz ${n+1}`);return}sp(D.sel,String(e))});P("invGrid").addEventListener("dragstart",i=>{const t=i.target.closest("[data-t]");t&&i.dataTransfer.setData("text/plain",t.dataset.t)});P("invGrid").addEventListener("dragover",i=>i.preventDefault());P("invGrid").addEventListener("drop",i=>{i.preventDefault();const t=i.dataTransfer.getData("text/plain");t[0]==="h"&&(D.hotbar[Number(t.slice(1))]=0,D.unsaved=!0,D.onChange())});P("invSort").addEventListener("change",i=>{Hc=i.target.value,gr()});P("recipes").addEventListener("click",i=>{const t=i.target.closest("[data-r]");if(!t)return;const e=hn[Number(t.dataset.r)];let n=0,s=null;for(let r=i.shiftKey?5:1;r>0&&(s=Ld(D.inv,e,Xe,ra),!!s.ok);r--)n++;if(!n){ee(s.msg);return}D.unsaved=!0,D.onChange(),D.questEvent("craft",e.give[0],e.give[1]*n),ee(`+${e.give[1]*n} ${ge(e.give[0])}`)});D.onChange=()=>{Ji(),Mt==="inventory"&&gr()};const Gc=P("vit").getContext("2d"),dy=[".##.##.","#######","#######",".#####.","..###..","...#..."],py=["....##.","...####","..#####",".####..","##.....","#......"],my=["..###..",".#...#.","#.....#","#.....#",".#...#.","..###.."],gy=["#######","#######","#######",".#####.","..###..","...#..."];function to(i,t,e,n,s,r){for(let a=0;a<6;a++)for(let o=0;o<7;o++)i[a][o]==="#"&&(Gc.fillStyle=o<3.5?n||s?n||s:r:n||r,Gc.fillRect(t+o*2,e+a*2,2,2))}function cr(){const i=D.vitals,t=P("vit");if(t.hidden=!i||Mt==="menu",!i)return;Gc.clearRect(0,0,200,34);const e=Math.ceil(i.hp),n=Math.ceil(i.food);for(let r=0;r<$s/2;r++){const a=e-r*2;to(dy,r*10,18,a>=2?"#ff3b4a":null,a===1?"#ff3b4a":null,"#3a1a20")}for(let r=0;r<Wr/2;r++){const a=n-r*2;to(py,186-r*10,18,a>=2?"#d89048":null,a===1?"#d89048":null,"#3a2a1a")}if(i.air<fo)for(let r=0;r<Math.ceil(i.air);r++)to(my,186-r*10,2,"#9ad8ff",null,"#9ad8ff");const s=D.armorPoints();for(let r=0;r<s;r++)to(gy,r*10,2,"#cfd6e2",null,"#cfd6e2")}D.onVitals=cr;let Mf=0;D.onHurt=()=>{const i=P("hurt");if(i.classList.add("on"),cr(),clearTimeout(Mf),Mf=setTimeout(()=>i.classList.remove("on"),120),navigator.vibrate&&cn)try{navigator.vibrate(60)}catch{}};D.onMine=i=>{P("mine").classList.toggle("on",i>0),P("mine").firstChild.style.width=Math.round(i*100)+"%"};const _y={Sturz:"Zu tief gefallen.",Ertrunken:"Unter Wasser ging die Luft aus.",Magma:"Magma ist heiß.",Hunger:"Vor Hunger.",Rauschling:"Ein Rauschling hat dich erwischt.",Höhlenwesen:"Ein Höhlenwesen hat dich erwischt.","Störsender-Drohne":"Die Störimpulse einer Drohne waren zu viel."};D.onDeath=(i,t)=>{_r(),Ae("dead"),P("deadWhy").textContent=(_y[i]||"")+(t?" Dein Vorrat liegt am Unglücksort, der Wegpunkt 📍 zeigt den Weg.":" Dein Vorrat bleibt erhalten. Der Wegpunkt 📍 markiert den Unglücksort."),Dn()&&document.exitPointerLock(),Es(!1)};P("dRevive").onclick=()=>{D.revive(),Ji(),Ae("playing"),Qi()};P("dMenu").onclick=()=>{D.revive(),P("pMenu").onclick()};D.onStation=i=>{$i=i,ci="all",Go()};let ms=null;function rp(){const i=Bd[ms.role]||[];P("trName").firstChild.textContent=ms.name+" ",P("trSay").textContent="„"+(zM[ms.role]||"Hallo!")+"“",P("trList").innerHTML=i.map((t,e)=>{const n=ih(D.inv,t),s=t.need.map(([r,a])=>{const o=D.inv[r]||0;return o>=a?`${a}× ${ge(r)}`:`<i>${a}× ${ge(r)} (${o})</i>`}).join(" + ");return`<button data-tr="${e}" ${n.ok?"":"disabled"}>${To(t.give[0])}<span><b>${t.give[1]}× ${ge(t.give[0])}</b><small>für ${s}</small></span></button>`}).join("")}D.onTrade=i=>{if(Mt==="playing"){if(D.mode==="creative"){ee(`${i.name}: „Im Kreativmodus hast du doch schon alles!“`);return}ms=i,_r(),Ae("trade"),rp(),Dn()&&document.exitPointerLock(),Bo()}};P("trList").addEventListener("click",i=>{const t=i.target.closest("[data-tr]");if(!t||!ms)return;const e=Bd[ms.role][Number(t.dataset.tr)],n=Ld(D.inv,e);ee(n.ok?`Getauscht: ${n.msg}`:n.msg),n.ok&&(D.unsaved=!0,rp(),Ji(),D.questEvent("trade",e.give[0]))});function oh(){Mt==="trade"&&(ms=null,Ae("playing"),D.resume(),Qi(),Yi()&&setTimeout(()=>{Mt==="playing"&&!Dn()&&Yi()&&Si()},250))}P("trClose").onclick=oh;D.onBuildMode=i=>{const t=P("bmode");t.hidden=i.key==="einzeln",t.textContent=`▦ ${i.name}`+(i.clicks===2?" · zwei Ecken setzen":i.key==="einfuegen"?" · Setzen fügt ein":"")+" (G wechselt)",ee("Bauform: "+i.name)};P("bBuild").onclick=()=>D.cycleBuild(1);let xs=!1,yf=0;function Mi(){const i=P("quest"),t=D.story;if(!t||D.menuMode){i.hidden=!0;return}if(i.hidden=!1,i.classList.toggle("min",xs),t.done){i.innerHTML='<b>🎉 Story abgeschlossen</b><small class="txt">Alle Aufträge erledigt. Baue frei weiter!</small>';return}const e=er(t),n=e[t.i],[s,r]=Fd(D,n),a=Math.min(100,Math.round(s/r*100)),o=n.c?`Kapitel ${n.c} · ${n.t}`:`Auftrag ${t.i+1}/${e.length} · ${n.t}`;i.innerHTML=`<b>${o}</b><div class="bar"><i style="width:${a}%"></i></div><small>${Math.min(s,r)} / ${r}${n.c?` · Auftrag ${t.i+1}/${e.length}`:""}</small><small class="txt">${n.d}</small>`}function jr(i){const t=P("banner");t.innerHTML=i,t.classList.add("on"),clearTimeout(yf),yf=setTimeout(()=>t.classList.remove("on"),4200)}D.onQuest=Mi;D.onQuestDone=(i,t)=>{const e=Object.entries(i.r||{}).map(([s,r])=>`+${r} ${ge(Number(s))}`).join(" · "),n=!t&&er(D.story)[D.story.i];t?jr(i.c?"🎉 Das Rauschen ist verstummt!<small>Das Funknetz steht wieder. Die Welt gehört dir, baue frei weiter.</small>":`🎉 Story abgeschlossen!<small>${i.t} geschafft. Die Funkzentrale sendet wieder. Baue frei weiter.</small>`):n&&n.c&&n.c!==i.c?jr(`📻 Kapitel ${n.c}: ${sa[n.c].t}<small>${sa[n.c].d}</small>`):jr(`✔ Auftrag erledigt: ${i.t}<small>${e}</small>`)};function vy(){const i=D.story;i&&(P("qlist").innerHTML=er(i).map((t,e,n)=>{const s=i.done||e<i.i,r=!i.done&&e===i.i;return`${t.c&&(e===0||n[e-1].c!==t.c)?`<h3 class="qch">Kapitel ${t.c} · ${sa[t.c].t}</h3>`:""}<div class="qi ${s?"done":r?"cur":""}"><span class="st">${s?"✔":r?"➜":e+1}</span><div><b>${t.t}</b>${s||r?`<small>${t.d}</small>`:""}</div></div>`}).join(""),P("qlogT").textContent=i.c==="rauschen"?"Das große Rauschen":"Aufträge der Funkzentrale")}P("quest").addEventListener("click",()=>{xs=!xs,Mi()});P("pQuests").onclick=()=>{vy(),Ze("qlog",!0)};P("qlogClose").onclick=()=>Ze("qlog",!1);const Ze=(i,t)=>{P(i).hidden=!t};function Ae(i){Mt=i,document.body.dataset.st=i,document.body.classList.toggle("playing",i==="playing"),Ze("map",i==="map"),Ze("menu",i==="menu"),Ze("pause",i==="paused"),Ze("inv",i==="inventory"),Ze("loading",i==="loading"),Ze("set",i==="settings"),Ze("dead",i==="dead"),Ze("trade",i==="trade"),Ze("mp",i==="mp"),Ze("hud",i==="playing"||i==="paused"||i==="inventory"||i==="dead"||i==="trade"||(i==="settings"||i==="mp")&&vs==="paused"),i!=="playing"&&D.onMine(0),i!=="paused"&&Ze("qlog",!1),i==="menu"&&lh(null)}const Dn=()=>document.pointerLockElement===ma,Yi=()=>!cn&&!gt.raf;function Qi(){if(!(cn||Dn()))try{const i=ma.requestPointerLock();i&&i.catch&&i.catch(()=>{})}catch{}}function _r(){D.breakHeld=D.placeHeld=!1,An.clear(),Ms(),Object.assign(D.input,{f:0,r:0,jump:!1,down:!1,sprint:!1})}function Bo(){D.mp||D.stop()}function Si(){Mt==="playing"&&(Bo(),_r(),Es(),P("pMp").hidden=!!D.story||!!(D.mp&&D.mp.guest),Ae("paused"),P("vd").value=D.viewDist,P("vdVal").textContent=D.viewDist,P("pQuests").hidden=!D.story,P("td").value=Math.round(D.time*100),P("tdVal").textContent=D.clockText(),Dn()&&document.exitPointerLock())}function Ho(){Ae("playing"),D.resume(),Qi()}function Go(){Mt==="playing"&&(ra=D.stationsNear(),$i&&!ra.has($i)&&($i=null),_r(),Ae("inventory"),ip(),gr(),Ji(),Dn()&&document.exitPointerLock(),Bo())}function aa(){Mt==="inventory"&&($i=null,Ae("playing"),Ji(),D.resume(),Qi(),Yi()&&setTimeout(()=>{Mt==="playing"&&!Dn()&&Yi()&&Si()},250))}document.addEventListener("pointerlockchange",()=>{!Dn()&&Mt==="playing"&&Yi()&&Si()});document.addEventListener("pointerlockerror",()=>{if(!(Mt!=="playing"||!Yi())){if(performance.now()-op<2e3){ee("Ins Bild klicken, um loszulegen");return}Si()}});function Es(i){if(!D.world||lr<0||D.menuMode)return;const t=bd(lr,D.serialize());return t&&(D.unsaved=!1),(i||!t)&&ee(t?"Gespeichert ✔":"Speichern fehlgeschlagen (Speicher voll?)"),t}setInterval(()=>{Mt==="playing"&&Es(!1)},3e4);window.addEventListener("pagehide",()=>Es(!1));document.addEventListener("visibilitychange",()=>{document.hidden&&Mt==="playing"&&Si()});function xy(i){if(i=(i||"").trim(),!i)return Math.floor(Math.random()*2147483647);if(/^-?\d{1,9}$/.test(i))return Number(i);let t=2166136261;for(let e=0;e<i.length;e++)t=Math.imul(t^i.charCodeAt(e),16777619);return t|0}const Sf=i=>String(i).replace(/[&<>"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[t]);function fi(){let i="";for(let t=0;t<Oo;t++){const e=Md(t);if(e){const n=new Date(e.savedAt).toLocaleString("de-DE",{dateStyle:"short",timeStyle:"short"}),s=e.mode==="creative",r=e.mode==="story",a=e.qc==="rauschen"?zd:kd,o=e.q??0,l=r?`<span class="pill st">📜 Story · ${e.q===-1?"abgeschlossen":(a[o]&&a[o].c?"Kapitel "+a[o].c+" · ":"")+"Auftrag "+(o+1)+"/"+a.length}</span>`:`<span class="pill ${s?"cr":""}">${s?"Kreativ":"Überleben"}</span>`;i+=`<div class="card"><div class="top"><div class="ico">${r?"📜":s?"🕊":"⛏"}</div><div class="ttl"><b>${Sf(e.name)}</b>${l}</div></div>
        <small>${r?"Feste Story-Welt":"Startwert "+Sf(e.seed)}${(e.gen||1)<md?" · klassische Welt":""} · zuletzt ${n}</small>
        <div class="row"><button class="go" data-act="load" data-i="${t}">▶ Weiterspielen</button><button data-act="exp" data-i="${t}" aria-label="Welt exportieren" title="Welt als Datei sichern">⤓</button>${a1(t)?`<button data-act="bak" data-i="${t}" aria-label="Sicherung laden" title="Ältere Sicherung wiederherstellen">↺</button>`:""}<button data-act="del" data-i="${t}" aria-label="Welt löschen" title="Welt löschen">🗑</button></div></div>`}else i+=`<div class="card new"><div class="top"><div class="ico">✨</div><div class="ttl"><b>Neue Welt ${t+1}</b><span class="pill">frei</span></div></div>
        <div class="seed"><input id="seed${t}" placeholder="Startwert (leer = Zufall)" maxlength="24" autocomplete="off"><button data-act="dice" data-i="${t}" aria-label="Zufälliger Startwert" title="Zufälliger Startwert">🎲</button></div>
        <div class="seg three" id="mode${t}"><button class="on" data-mode="survival">⛏ Überleben<small>Rohstoffe, Hunger</small></button><button data-mode="creative">🕊 Kreativ<small>alles, fliegen</small></button><button data-mode="story">📜 Story<small>6 Kapitel</small></button></div>
        <button class="go" data-act="new" data-i="${t}">Welt erzeugen</button></div>`}P("slots").innerHTML=i,My()}let mn=null,Vc=-1;const Ao={worlds:"pgWorlds",help:"pgHelp",data:"pgData"};function My(){let i=null;for(let t=0;t<Oo;t++){const e=Md(t);e&&(!i||e.savedAt>i.m.savedAt)&&(i={i:t,m:e})}if(Vc=i?i.i:-1,P("mContinue").hidden=!i,i){const t=i.m,e=t.mode==="story"?"Story":t.mode==="creative"?"Kreativ":"Überleben";P("mContinueSub").textContent=`${t.name} · ${e} · ${new Date(t.savedAt).toLocaleString("de-DE",{dateStyle:"short",timeStyle:"short"})}`}}function lh(i){mn=i||null;for(const[n,s]of Object.entries(Ao))Ze(s,n===mn);P("menu").classList.toggle("paged",!!mn);for(const n of document.querySelectorAll("#mmNav [data-page]"))n.classList.toggle("cur",n.dataset.page===mn);const t=P(mn?Ao[mn]:"mmNav"),e=mn&&t.querySelector(".go");e&&!cn?e.focus():yy(t)}const Vo=i=>[...i.querySelectorAll("button,input,select,a[href],summary")].filter(t=>!t.disabled&&t.offsetParent!==null);function yy(i,t=0){if(cn)return;const e=Vo(i);e.length&&e[Math.min(t,e.length-1)].focus({preventScroll:!1})}function Bl(i){const t=P(mn?Ao[mn]:"mmNav"),e=Vo(t);if(!e.length)return;const n=e.indexOf(document.activeElement);e[n<0?0:(n+i+e.length)%e.length].focus()}function ch(){if(mn){const i=mn;lh(null);const t=document.querySelector(`#mmNav [data-page=${i}]`);t&&!cn&&t.focus()}}P("mmNav").addEventListener("click",i=>{const t=i.target.closest("[data-page]");t&&lh(t.dataset.page)});for(const i of document.querySelectorAll(".pg-back"))i.onclick=ch;P("mContinue").onclick=()=>{Vc>=0&&ap(Vc)};P("mmVer").textContent=hy;function oa(i){const t=i==="pad"?[[Fc(gt.style,Qd(gt.style)),"Auswählen",1],[Fc(gt.style,tp(gt.style)),"Zurück",1],["✚","Bewegen",1]]:[["↑↓","Auswählen"],["Enter","Bestätigen"],["Esc","Zurück"]];P("mmHints").innerHTML=t.map(([e,n,s])=>`<span><kbd class="${s?"pad":""}">${e}</kbd>${n}</span>`).join("")}oa("keys");P("slots").addEventListener("click",i=>{const t=i.target.closest(".seg [data-mode]");if(t){for(const o of t.parentNode.children)o.classList.toggle("on",o===t);const s=t.closest(".card"),r=t.dataset.mode==="story",a=s.querySelector("input");a.disabled=r,a.placeholder=r?"feste Story-Welt":"Startwert (leer = Zufall)",s.querySelector("[data-act=dice]").disabled=r;return}const e=i.target.closest("[data-act]");if(!e)return;const n=Number(e.dataset.i);if(e.dataset.act==="dice")P("seed"+n).value=String(Math.floor(Math.random()*9e5)+1e5);else if(e.dataset.act==="del")confirm("Diese Welt wirklich löschen?")&&(o1(n),fi());else if(e.dataset.act==="load")ap(n);else if(e.dataset.act==="exp"){const s=yd(n);if(!s){ee("Speicherstand nicht lesbar");return}Sy(`klotzfunk-${s.name.replace(/[^\w-]+/g,"_")}.json`,l1(s))}else if(e.dataset.act==="bak"){const s=Sd(n);if(!s){ee("Keine lesbare Sicherung"),fi();return}const r=new Date(s.savedAt).toLocaleString("de-DE",{dateStyle:"short",timeStyle:"short"});confirm(`Sicherung vom ${r} wiederherstellen? Der aktuelle Stand wird dafür zur Sicherung.`)&&(ee(Td(n)?"Sicherung wiederhergestellt":"Wiederherstellen fehlgeschlagen"),fi())}else{const s=P("mode"+n).querySelector(".on").dataset.mode;lp(n,{name:s==="story"?"Story "+(n+1):"Welt "+(n+1),seed:s==="story"?777:xy(P("seed"+n).value),mode:s,gen:md})}});function ap(i){let t=yd(i);if(!t){const e=Sd(i);if(e&&confirm("Dieser Speicherstand ist beschädigt. Die letzte Sicherung laden?"))Td(i),t=e;else{ee("Speicherstand nicht lesbar"),fi();return}}lp(i,t)}function Sy(i,t){try{const e=URL.createObjectURL(new Blob([t],{type:"application/json"})),n=document.createElement("a");n.href=e,n.download=i,document.body.appendChild(n),n.click(),n.remove(),setTimeout(()=>URL.revokeObjectURL(e),2e3)}catch{ee("Export nicht möglich")}}P("mImport").onclick=()=>{if(Ad()<0){ee("Kein freier Platz – lösche zuerst eine Welt");return}P("importFile").value="",P("importFile").click()};P("importFile").addEventListener("change",i=>{const t=i.target.files&&i.target.files[0];if(t){if(t.size>8*1024*1024){ee("Datei zu groß");return}t.text().then(e=>{const n=c1(e),s=Ad();if(!n){ee("Keine gültige KLOTZFUNK-Welt");return}if(s<0){ee("Kein freier Platz");return}ee(bd(s,n)?`„${n.name}“ importiert (Platz ${s+1})`:"Import fehlgeschlagen (Speicher voll?)"),fi()}).catch(()=>ee("Datei nicht lesbar"))}});const Hl=["Halte die Sprungtaste im Fall gedrückt, um zu gleiten.","Q oder „Haken“ zieht dich mit dem Seilhaken bis zu 40 Blöcke weit.","Mit M oder 🗺 öffnest du die Weltkarte. Dort kannst du eigene Markierungen setzen.","Erze brauchen eine Spitzhacke. Für Eisen und Funkkristall muss sie mindestens aus Stein sein.","Nachts kommen Rauschlinge. Sie verfolgen dich nur, wenn sie dich sehen.","Setzen auf einen Dorfbewohner öffnet den Handel.","Ein Schalter speist den Funksender daneben. Relais tragen das Signal weiter.","Ein Boot fährt auf Wasser, eine Lore folgt Schienen über Kurven und Stufen.","G wechselt die Bauform: Linie, Fläche, Wand oder Säule.","Weizen wächst auf Ackerboden. Aus 3 Weizen wird Brot.","Pause → 👥 Mehrspieler lädt bis zu 4 Freunde in deine Welt ein.","In den Einstellungen kannst du alle Tasten neu belegen und die Touch-Tasten verschieben."];let wo=0,op=0;function Ey(i){const t={story:"📜 Story",creative:"🕊 Kreativ"}[i.mode]||"⛏ Überleben";P("ldName").textContent=i.name||"Welt",P("ldMode").textContent=t;let e=Math.floor(Math.random()*Hl.length);const n=()=>{P("ldTip").textContent=Hl[e++%Hl.length]};n(),clearInterval(wo),wo=setInterval(n,4e3),Ro(.04,i.px===void 0?"Welt wird erzeugt …":"Spielstand wird geladen …")}function Ro(i,t){P("ldFill").style.width=Math.round(i*100)+"%",P("ldBar").setAttribute("aria-valuenow",Math.round(i*100)),t&&(P("ldStep").textContent=t)}function by(i){const t=performance.now(),e=Math.min(D.viewDist,3)+.5;D.resume();const n=()=>{if(Mt!=="loading")return;const s=D.areaReady(e);if(Ro(.3+s*.7,`Umgebung wird gebaut … ${Math.round(s*100)} %`),s>=1||performance.now()-t>1e4){Ro(1,"Los geht’s!"),setTimeout(i,180);return}setTimeout(n,100)};n()}function lp(i,t){Xi(),lr=i,Ey(t),Ae("loading"),requestAnimationFrame(()=>setTimeout(()=>{try{D.start(t),Ro(.3,"Umgebung wird gebaut …"),t.mode==="creative"&&(D.player.flying=!1),P("bFly").hidden=!(cn&&D.mode==="creative"),P("bUndo").hidden=D.mode!=="creative",P("bmode").hidden=!0,Ji(),Mi(),by(()=>{clearInterval(wo),Mt==="loading"&&(Ae("playing"),cr(),op=performance.now(),Qi(),Ty(t))})}catch(e){clearInterval(wo),console.error(e),Ae("menu"),fi(),alert("Die Welt konnte nicht gestartet werden.")}},30))}function Ty(i){D.story&&D.story.i===0&&D.story.p===0&&i.px===void 0&&jr(D.story.c?`📻 Kapitel 1: ${sa[1].t}<small>${sa[1].d} Dein Auftrag steht links (J blendet ihn aus).</small>`:"📜 Willkommen in der Funkzentrale!<small>Dein erster Auftrag steht links. J blendet ihn ein oder aus.</small>"),!D.unsaved&&i.px===void 0&&Es(!1)}P("pResume").onclick=()=>{Xi(),Ho()};P("pSave").onclick=()=>Es(!0);P("pRespawn").onclick=()=>{D.respawn(),Ho()};P("pSound").onclick=()=>{sn.enabled=!sn.enabled,P("pSound").textContent=sn.enabled?"🔊 Ton: an":"🔇 Ton: aus"};P("pFull").onclick=()=>{try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}catch{}};P("pMenu").onclick=()=>{D.mp&&Vn.end(null),Es(!1),lr=-1,fi(),Ae("menu"),D.startMenu(),Mi(),cr()};P("vd").oninput=i=>{const t=Number(i.target.value);D.maxView=t,D.setViewDist(t),P("vdVal").textContent=t};P("invClose").onclick=aa;P("bInv").onclick=Go;P("bWp").onclick=()=>D.toggleWaypoint();P("bUndo").onclick=()=>D.undo(!1);P("bMap").onclick=()=>Xo();P("td").oninput=i=>{D.time=Number(i.target.value)/100,P("tdVal").textContent=D.clockText(),D.updateSky(),D.render()};P("pFreeze").onclick=()=>{D.timeFrozen=!D.timeFrozen,P("pFreeze").textContent=D.timeFrozen?"⏸ Zeit steht still":"⏱ Zeit läuft"};P("bPause").onclick=Si;function Ms(){const i=D.input;if(Bn.joy||gt.active)return;const t=n=>An.has(Kn[n]);i.f=(t("fwd")||An.has("ArrowUp")?1:0)-(t("back")||An.has("ArrowDown")?1:0),i.r=(t("right")||An.has("ArrowRight")?1:0)-(t("left")||An.has("ArrowLeft")?1:0);const e=D.player.flying;i.sprint=t("sprint")||!e&&t("sneak"),i.down=e&&t("sneak")||Bn.down,i.jump=t("jump")||Bn.jump}const Bn={joy:!1,jump:!1,down:!1};let Ef=0;function Co(){if(D.mode!=="creative"||D.ride)return;const i=D.player;i.flying=!i.flying,i.vy=0,ee(i.flying?"Fliegen an":"Fliegen aus"),P("bDown").hidden=!(cn&&i.flying),P("bFly").classList.toggle("on",i.flying)}window.addEventListener("keydown",i=>{if(di){if(i.preventDefault(),i.code!=="Escape"){const e=ny(Kn,di,i.code);e?(Kn=e,ht.keys={...e},ji(ht)):ee("Diese Taste ist reserviert")}di=null,uh();return}if(Mt==="menu"&&i.target&&i.target.tagName==="INPUT"&&(i.code==="ArrowUp"||i.code==="ArrowDown")){i.preventDefault(),Bl(i.code==="ArrowDown"?1:-1);return}if(i.target&&/^(INPUT|SELECT|TEXTAREA)$/.test(i.target.tagName)){i.code==="Escape"&&(i.target.blur(),Mt==="inventory"?aa():Mt==="settings"&&Lo());return}if(Mt==="menu"){i.code==="ArrowDown"||i.code==="ArrowRight"?(i.preventDefault(),Bl(1)):i.code==="ArrowUp"||i.code==="ArrowLeft"?(i.preventDefault(),Bl(-1)):(i.code==="Escape"||i.code==="Backspace")&&(i.preventDefault(),ch()),oa("keys");return}if(Mt==="settings"){i.code==="Escape"&&Lo();return}if(Mt==="mp"){i.code==="Escape"&&P("mpClose").onclick();return}if(Mt==="map"){(i.code==="Escape"||i.code===Kn.map)&&(i.preventDefault(),$o());return}if(Mt==="layout"){i.code==="Escape"&&fh();return}if(Mt==="trade"){(i.code==="Escape"||i.code==="KeyE")&&(i.preventDefault(),oh());return}if(Mt==="inventory"){(i.code===Kn.inv||i.code==="Escape")&&(i.preventDefault(),aa());return}if(Mt!=="playing")return;const t=iy(Kn,i.code);if((t==="jump"||i.code==="Tab"||i.code.startsWith("Arrow"))&&i.preventDefault(),!i.repeat){if(/^Digit[1-9]$/.test(i.code)){D.selectSlot(Number(i.code[5])-1);return}if(i.code==="KeyZ"&&(i.ctrlKey||i.metaKey)){i.preventDefault(),D.undo(i.shiftKey);return}if(i.code==="KeyY"&&(i.ctrlKey||i.metaKey)){i.preventDefault(),D.undo(!0);return}if(t==="inv"){i.preventDefault(),Go();return}if(t==="fly"){Co();return}if(t==="build"){D.cycleBuild(i.shiftKey?-1:1);return}if(t==="hook"){D.fireHook();return}if(t==="wp"){D.toggleWaypoint();return}if(t==="map"){Xo();return}if(t==="quests"){xs=!xs,Mi();return}if(t==="jump"){const e=performance.now();e-Ef<280&&Co(),Ef=e}An.add(i.code),Ms()}});window.addEventListener("keyup",i=>{An.delete(i.code),Mt==="playing"&&Ms()});window.addEventListener("blur",()=>{An.clear(),Ms()});const cp=.0022,Ay=.0058;function hh(i,t,e){D.yaw-=i*e,D.pitch=Math.max(-1.55,Math.min(1.55,D.pitch-t*e*(ht.invertY?-1:1)))}window.addEventListener("mousemove",i=>{Mt==="playing"&&Dn()&&hh(i.movementX,i.movementY,cp*ht.mouseSens)});ma.addEventListener("mousedown",i=>{if(!(Mt!=="playing"||cn&&i.sourceCapabilities&&i.sourceCapabilities.firesTouchEvents)){if(Xi(),!Dn()){Qi();return}i.button===0?D.breakHeld=!0:i.button===2&&(D.placeHeld=!0),i.preventDefault()}});window.addEventListener("mouseup",i=>{i.button===0?D.breakHeld=!1:i.button===2&&(D.placeHeld=!1)});ma.addEventListener("contextmenu",i=>i.preventDefault());window.addEventListener("wheel",i=>{Mt==="playing"&&D.selectSlot(D.sel+(i.deltaY>0?1:-1))},{passive:!0});function wy(){cn&&document.body.classList.contains("touch")||(cn=!0,document.body.classList.add("touch"),P("bFly").hidden=D.mode!=="creative")}cn&&document.body.classList.add("touch");window.addEventListener("pointerdown",i=>{i.pointerType==="touch"&&wy()},{capture:!0});(function(){const t=P("zl"),e=P("zr"),n=P("joy"),s=P("thumb"),r=52;let a=null,o=null;t.addEventListener("pointerdown",u=>{a||(Xi(),a={id:u.pointerId,x:u.clientX,y:u.clientY},t.setPointerCapture(u.pointerId),n.style.display="block",n.style.left=u.clientX+"px",n.style.top=u.clientY+"px",s.style.transform="translate(0,0)",Bn.joy=!0)}),t.addEventListener("pointermove",u=>{if(!a||u.pointerId!==a.id)return;let f=u.clientX-a.x,d=u.clientY-a.y;const g=Math.hypot(f,d),v=g>r?r/g:1;s.style.transform=`translate(${f*v}px,${d*v}px)`;const m=Math.min(1,g*ht.joySens/r),p=m<.14?0:(m-.14)/.86,x=g?f/g:0,y=g?d/g:0;D.input.r=x*p,D.input.f=-y*p,D.input.sprint=g>r*1.35});const l=u=>{!a||u.pointerId!==a.id||(a=null,n.style.display="none",Bn.joy=!1,D.input.f=D.input.r=0,D.input.sprint=!1,Ms())};t.addEventListener("pointerup",l),t.addEventListener("pointercancel",l),e.addEventListener("pointerdown",u=>{o||(o={id:u.pointerId,x:u.clientX,y:u.clientY},e.setPointerCapture(u.pointerId))}),e.addEventListener("pointermove",u=>{!o||u.pointerId!==o.id||(hh(u.clientX-o.x,u.clientY-o.y,Ay*ht.touchSens),o.x=u.clientX,o.y=u.clientY)});const c=u=>{o&&u.pointerId===o.id&&(o=null)};e.addEventListener("pointerup",c),e.addEventListener("pointercancel",c);const h=(u,f,d)=>{const g=P(u);g.addEventListener("pointerdown",m=>{m.preventDefault(),Xi(),g.setPointerCapture(m.pointerId),g.classList.add("on"),f()});const v=()=>{g.classList.remove("on"),d()};g.addEventListener("pointerup",v),g.addEventListener("pointercancel",v)};h("bBreak",()=>{D.breakHeld=!0},()=>{D.breakHeld=!1}),h("bPlace",()=>{D.placeHeld=!0},()=>{D.placeHeld=!1}),h("bJump",()=>{Bn.jump=!0,D.input.jump=!0},()=>{Bn.jump=!1,D.input.jump=An.has("Space")}),h("bDown",()=>{Bn.down=!0,D.input.down=!0},()=>{Bn.down=!1,D.input.down=!1}),P("bFly").addEventListener("click",Co),P("bHook").addEventListener("pointerdown",u=>{u.preventDefault(),Xi(),D.fireHook()})})();const gt={active:!1,prev:[],raf:0,last:0,idx:-1,style:"generic",used:0,cap:null,rt:!1,lt:!1,run:!1,dir:"",dirT:0,dirN:0};let hr=rh(ht.padKeys);function Wo(){const i=navigator.getGamepads?[...navigator.getGamepads()]:[],t=i[gt.idx];if(t&&t.connected)return t;const e=i.find(n=>n&&n.connected);return e&&(gt.idx=e.index,gt.style=Zd(e.id)),e||null}zc.fn=i=>{gt.raf&&performance.now()-gt.used<3e4&&Fo(Wo(),i,ht.padRumble)};const bf={inventory:"inv",settings:"set",mp:"mp",map:"map",trade:"trade",dead:"dead"};function mo(){return Mt==="menu"?P(mn?Ao[mn]:"mmNav"):Mt==="paused"?P("qlog").hidden?P("pause"):P("qlog"):bf[Mt]?P(bf[Mt]):null}function Ry(){Mt==="menu"?ch():Mt==="paused"?P("qlog").hidden?Ho():Ze("qlog",!1):Mt==="inventory"?aa():Mt==="settings"?gt.cap||di?(gt.cap=di=null,dh()):Lo():Mt==="mp"?P("mpClose").onclick():Mt==="map"?$o():Mt==="trade"?oh():Mt==="layout"&&fh()}const Gl=(i,t)=>i.dispatchEvent(new Event(t,{bubbles:!0}));function Wc(i){i.focus({preventScroll:!0,focusVisible:!0}),i.scrollIntoView({block:"nearest",inline:"nearest"})}function Cy(i){const t=mo();if(!t)return;const e=Vo(t);if(!e.length)return;const n=e.indexOf(document.activeElement),s=e[n];if(s&&(i==="left"||i==="right")){const o=i==="right"?1:-1;if(s.type==="range"){o>0?s.stepUp():s.stepDown(),Gl(s,"input"),Gl(s,"change");return}if(s.tagName==="SELECT"){const l=s.options.length;s.selectedIndex=(s.selectedIndex+o+l)%l,Gl(s,"change");return}}if(n<0){Wc(t.querySelector(".cell:not([disabled]),.go,.big")||e.find(o=>!o.classList.contains("x"))||e[0]);return}const r=e.map(o=>{const l=o.getBoundingClientRect();return{x:l.left,y:l.top,w:l.width,h:l.height}});let a=ly(r,n,i);a<0&&(i==="up"||i==="down")&&(a=(n+(i==="down"?1:-1)+e.length)%e.length),a>=0&&Wc(e[a])}function Ly(i){for(let t=i;t&&t!==document.body;t=t.parentElement){const e=getComputedStyle(t).overflowY;if((e==="auto"||e==="scroll")&&t.scrollHeight>t.clientHeight)return t}return null}function Dy(i,t){const e=i.buttons,n=e[se.UP]?"up":e[se.DOWN]?"down":e[se.LEFT]?"left":e[se.RIGHT]?"right":i.f>.55?"up":i.f<-.55?"down":i.r<-.55?"left":i.r>.55?"right":"";return n!==gt.dir?(gt.dir=n,gt.dirT=t,gt.dirN=0,n):n&&t-gt.dirT>(gt.dirN?110:380)?(gt.dirT=t,gt.dirN++,n):""}function Py(i,t,e,n){if(gt.cap){const r=i.buttons.findIndex((a,o)=>a&&o<sh&&t(o));if(r>=0){const a=ry(hr,gt.cap,r);a&&(hr=a,ht.padKeys={...a},ji(ht)),gt.cap=null,vr()}return}if(Mt==="paused"&&i.hit.pause){Ho();return}if(Mt==="inventory"&&i.hit.inv){aa();return}if(Mt==="map"&&i.hit.map){$o();return}if(t(tp(gt.style))){Ry();return}const s=Dy(i,e);if(s&&Cy(s),t(Qd(gt.style))){const r=mo(),a=document.activeElement;if(r&&a&&r.contains(a)&&a!==document.body)a.click();else if(r){const o=Vo(r);o[0]&&Wc(o[0])}}if(Mt==="inventory"){if(t(se.LB)||t(se.RB)){const r=[...P("invTabs").querySelectorAll("[data-cat]")],a=r.findIndex(l=>l.dataset.cat===ci),o=r[(a+(t(se.RB)?1:-1)+r.length)%r.length];o&&o.click()}(t(se.LT)||t(se.RT))&&(D.selectSlot((D.sel+(t(se.RT)?1:8))%9),Ji()),t(se.W)&&document.activeElement&&document.activeElement.closest("#invGrid,#recipes")&&document.activeElement.dispatchEvent(new MouseEvent("click",{bubbles:!0,shiftKey:!0}))}if(Mt==="map"){if(t(se.LB)&&Ii.zoom(-1),t(se.RB)&&Ii.zoom(1),i.lx||i.ly){const r=160*n/Math.max(.25,Ii.zoomLevel?Ii.zoomLevel():1);Ii.cx+=i.lx*r,Ii.cz+=i.ly*r,Ii.draw()}}else if(i.ly){const r=Ly(document.activeElement)||mo()&&mo().querySelector(".panel");r&&(r.scrollTop+=i.ly*18)}}const Tf=i=>i*(.45+.55*Math.abs(i));function hp(i){const t=Wo();if(!t){gt.raf=0,gt.active=!1,vr(),oa("keys");return}gt.raf=requestAnimationFrame(hp);const e=Math.min(.05,(i-(gt.last||i))/1e3);gt.last=i;const n=gt.prev,s=oy(t,n,hr,ht.padDead);gt.prev=s.buttons;const r=h=>s.buttons[h]&&!n[h];if((s.buttons.some(Boolean)||s.r||s.f||s.lx||s.ly)&&((!gt.used||i-gt.used>5e3)&&(document.body.classList.add("pad"),Mt==="menu"&&oa("pad")),gt.used=i,Xi()),Mt==="loading")return;if(Mt!=="playing"){Py(s,r,i,e);return}const a=D.input,o=s.r||s.f,l=D.player.flying,c=s.held;s.hit.sprint&&(gt.run=!gt.run),o?(gt.active=!0,a.r=s.r,a.f=s.f,a.sprint=gt.run||!l&&c.sneak):gt.active&&(gt.active=!1,gt.run=!1,a.f=a.r=0,a.sprint=!1,Ms()),(s.lx||s.ly)&&hh(Tf(s.lx)*900*e,Tf(s.ly)*600*e*(ht.padInvertY?-1:1),cp*ht.padSens),a.jump=c.jump||An.has(Kn.jump)||Bn.jump,a.down=c.sneak&&l||Bn.down||l&&An.has(Kn.sneak),!o&&c.sneak!==!!gt.sneak&&(c.sneak?a.sprint=!l:Ms()),gt.sneak=c.sneak,c.break!==gt.rt&&(gt.rt=c.break,D.breakHeld=gt.rt),c.place!==gt.lt&&(gt.lt=c.place,D.placeHeld=gt.lt),s.hit.hook&&(Fo(t,"hook",ht.padRumble),D.fireHook()),s.hit.prev&&D.selectSlot((D.sel+8)%9),s.hit.next&&D.selectSlot((D.sel+1)%9),s.hit.fly&&Co(),s.hit.wp&&D.toggleWaypoint(),s.hit.build&&D.cycleBuild(1),s.hit.quests&&(xs=!xs,Mi()),s.hit.undo&&D.mode==="creative"&&D.undo(!1),s.hit.inv?Go():s.hit.map?Xo():s.hit.pause&&Si()}window.addEventListener("gamepadconnected",i=>{gt.idx=i.gamepad.index,gt.style=Zd(i.gamepad.id),gt.used=performance.now(),document.body.classList.add("pad"),ee(`🎮 ${Jd[gt.style]} verbunden`),oa("pad"),vr(),Fo(i.gamepad,"done",ht.padRumble),gt.raf||(gt.raf=requestAnimationFrame(hp))});window.addEventListener("gamepaddisconnected",i=>{i.gamepad.index===gt.idx&&(gt.idx=-1,ee("🎮 Controller getrennt"),_r(),Mt==="playing"&&Si())});window.addEventListener("mousemove",()=>{gt.used&&performance.now()-gt.used>1500&&document.body.classList.remove("pad")},{passive:!0});window.addEventListener("resize",()=>D.resize());let ys=ht.minimap;P("mm").classList.toggle("off",!ys);const Ii=new ey(D,P,ee);function Xo(){Mt!=="playing"||!D.map||(_r(),Ae("map"),P("mapMini").checked=ys,Dn()&&document.exitPointerLock(),Bo(),Ii.open())}function $o(){Mt==="map"&&(Ae("playing"),D.resume(),Qi(),Yi()&&setTimeout(()=>{Mt==="playing"&&!Dn()&&Yi()&&Si()},250))}P("mapClose").onclick=$o;P("mm").addEventListener("click",()=>Xo());P("mapMini").onchange=i=>{ys=ht.minimap=i.target.checked,ji(ht),P("mm").classList.toggle("off",!ys)};const Ie=P("mm").getContext("2d"),Af=Ie.createImageData(56,56);function Iy(){const i=D.world,t=D.player,e=Af.data,n=Math.floor(t.x)-28,s=Math.floor(t.z)-28,r=t.y;for(let a=0;a<56;a++)for(let o=0;o<56;o++){const l=n+o,c=s+a,h=i.getChunk(l>>4,c>>4),u=(a*56+o)*4;let f=14,d=18,g=32;if(h){const v=(l&15)+(c&15)*16;let m=Math.min(oe-1,h.maxY);for(;m>0&&h.data[v+m*256]===0;)m--;const p=h.data[v+m*256],x=Kt[p]?Kt[p].map:[200,200,210],y=p===_.WATER?1:Math.max(.55,Math.min(1.25,1+(m-r)*.025));f=x[0]*y,d=x[1]*y,g=x[2]*y}e[u]=f,e[u+1]=d,e[u+2]=g,e[u+3]=255}if(Ie.putImageData(Af,0,0),D.wp){let a=D.wp.x-t.x,o=D.wp.z-t.z;const l=Math.max(Math.abs(a),Math.abs(o)),c=l>25?25/l:1;a*=c,o*=c,Ie.fillStyle="#ff2d95",Ie.fillRect(28+a-2,28+o-2,5,5),Ie.strokeStyle="#fff",Ie.strokeRect(28+a-2.5,28+o-2.5,6,6)}Ie.save(),Ie.translate(28,28),Ie.rotate(-D.yaw),Ie.fillStyle="#fff",Ie.strokeStyle="#000",Ie.beginPath(),Ie.moveTo(0,-5),Ie.lineTo(3.5,4),Ie.lineTo(0,2),Ie.lineTo(-3.5,4),Ie.closePath(),Ie.fill(),Ie.stroke(),Ie.restore()}let Ny=0;setInterval(()=>{if(Mt!=="playing")return;const i=D.player;let t="";i.flying&&(t+=" · fliegt"),i.gliding&&(t+=" · gleitet"),D.hookT>0&&(t+=" · Haken"),D.wp&&(t+=` · 📍 ${Math.round(Math.hypot(D.wp.x-i.x,D.wp.z-i.z))} m`),D.radioDist<24&&(t+=" · ♪");const e=D.biomeName();e&&(t+=" · "+e),ht.showFps&&(t+=` · ${D.fps} FPS`),P("info").textContent=`${D.clockText()} ${D.time<.5?"☀":"☾"} · X ${i.x.toFixed(0)} Y ${i.y.toFixed(0)} Z ${i.z.toFixed(0)}${t}`,P("uw").classList.toggle("on",!!D.underwater),ys&&!(Ny++&1)&&Iy(),D.story&&Mi()},250);function up(){const i=ht.quality==="auto";D.setQuality(i?u1(ah):ht.quality,i),D.placeDelay=ht.placeDelay,D.deathLoss=ht.deathLoss,D.enemies=ht.enemies,D.preview=ht.preview,sn.vol=ht.sfxVol,sn.music=ht.musicVol,sn.amb=ht.ambVol,document.documentElement.style.setProperty("--tbs",String(ht.btnScale)),document.body.classList.toggle("lefty",ht.lefty)}const fp=[["sMouse","mouseSens",i=>i.toFixed(1)+"×"],["sTouch","touchSens",i=>i.toFixed(1)+"×"],["sJoy","joySens",i=>i.toFixed(1)+"×"],["sBtn","btnScale",i=>Math.round(i*100)+" %"],["sSfx","sfxVol",i=>Math.round(i*100)+" %"],["sMus","musicVol",i=>Math.round(i*100)+" %"],["sAmb","ambVol",i=>Math.round(i*100)+" %"],["sPadSens","padSens",i=>i.toFixed(1)+"×"],["sPadRum","padRumble",i=>i?Math.round(i*100)+" %":"aus"],["sPadDead","padDead",i=>Math.round(i*100)+" %"]],dp=[["sPadInv","padInvertY"],["sLefty","lefty"],["sInvY","invertY"],["sPlace","placeDelay"],["sFps","showFps"],["sEnemy","enemies"],["sPreview","preview"]];let di=null;function uh(){const i=P("sKeys");i.textContent="";for(const[t,e]of Kr){const n=document.createElement("label"),s=document.createElement("button");n.textContent=e,s.dataset.a=t,s.textContent=di===t?"Taste drücken …":sy(Kn[t]),s.className=di===t?"wait":"",n.append(s),i.append(n)}}function vr(){const i=P("sPadKeys");if(!i)return;const t=gt.raf?Wo():null;P("sPad").textContent=t?`Erkannt: ${Jd[gt.style]} (${String(t.id).slice(0,48)})${t.vibrationActuator||t.hapticActuators&&t.hapticActuators.length?" · mit Vibration":""}`:"Kein Controller erkannt – eine Taste am Controller drücken.",i.textContent="";for(const[e,n]of Yr){const s=document.createElement("label"),r=document.createElement("button");s.textContent=n,r.dataset.pa=e,r.textContent=gt.cap===e?"Taste drücken …":Fc(gt.style,hr[e]),r.className=gt.cap===e?"wait":"",s.append(r),i.append(s)}}P("sPadKeys").addEventListener("click",i=>{const t=i.target.closest("button[data-pa]");t&&(i.preventDefault(),gt.cap=t.dataset.pa,vr(),t.focus())});P("sPadTest").onclick=()=>{const i=Wo();ee(i&&Fo(i,"hurt",Math.max(.5,ht.padRumble))?"📳 Vibration":"Dieser Controller oder Browser kann nicht vibrieren")};P("sPadReset").onclick=()=>{ht.padKeys={},hr=rh({}),ji(ht),vr(),ee("Controller-Belegung zurückgesetzt")};P("sKeys").addEventListener("click",i=>{const t=i.target.closest("button[data-a]");t&&(i.preventDefault(),di=t.dataset.a,uh())});const Oy=["bJump","bDown","bBreak","bPlace","bFly","bHook"];function qo(){for(const i of Oy){const t=P(i),e=ht.touchPos[i],n=Array.isArray(e)&&e.length===2&&e.every(s=>Number.isFinite(s)&&s>=0&&s<=1);t.style.left=n?e[0]*100+"%":"",t.style.top=n?e[1]*100+"%":"",t.style.right=t.style.bottom=n?"auto":"",t.style.transform=n?"translate(-50%,-50%)":""}}let pp="settings",Zr=null;function Uy(){pp=vs,Ae("layout"),P("layoutBar").hidden=!1}function fh(){P("layoutBar").hidden=!0,ji(ht),Ae("settings"),vs=pp}P("sLayout").onclick=Uy;P("lDone").onclick=fh;P("lReset").onclick=()=>{ht.touchPos={},qo()};P("touch").addEventListener("pointerdown",i=>{if(Mt!=="layout")return;const t=i.target.closest(".tb");if(i.stopPropagation(),i.preventDefault(),!!t){try{t.setPointerCapture(i.pointerId)}catch{}Zr={el:t,id:i.pointerId}}},{capture:!0});P("touch").addEventListener("pointermove",i=>{if(Mt!=="layout"||!Zr||Zr.id!==i.pointerId)return;const t=Math.max(.04,Math.min(.96,i.clientX/innerWidth)),e=Math.max(.1,Math.min(.94,i.clientY/innerHeight));ht.touchPos={...ht.touchPos,[Zr.el.id]:[+t.toFixed(3),+e.toFixed(3)]},qo()},{capture:!0});P("touch").addEventListener("pointerup",i=>{Mt==="layout"&&(i.stopPropagation(),Zr=null)},{capture:!0});function dh(){uh(),vr(),P("sQuality").value=ht.quality,P("sDeath").value=ht.deathLoss;for(const[i,t,e]of fp)P(i).value=ht[t],P(i+"V").textContent=e(ht[t]);for(const[i,t]of dp)P(i).checked=ht[t]}function ga(i){ji(ht),i?up():(D.placeDelay=ht.placeDelay,D.deathLoss=ht.deathLoss,D.enemies=ht.enemies,D.preview=ht.preview,sn.vol=ht.sfxVol,sn.music=ht.musicVol,document.documentElement.style.setProperty("--tbs",String(ht.btnScale)),document.body.classList.toggle("lefty",ht.lefty))}P("sQuality").onchange=i=>{ht.quality=i.target.value,ga(!0)};P("sDeath").onchange=i=>{ht.deathLoss=i.target.value,ga(!1)};for(const[i,t,e]of fp)P(i).oninput=n=>{ht[t]=Number(n.target.value),P(i+"V").textContent=e(ht[t]),ga(!1)};for(const[i,t]of dp)P(i).onchange=e=>{ht[t]=e.target.checked,ga(!1)};P("sReset").onclick=()=>{ht={...Gr,keys:{},padKeys:{},touchPos:{},stun:ht.stun,mpName:ht.mpName},Kn=jd(ht.keys),hr=rh({}),qo(),ys=ht.minimap,P("mm").classList.toggle("off",!ys),ga(!0),dh(),ee("Standard wiederhergestellt")};function mp(){vs=Mt,dh(),Ae("settings")}function Lo(){Mt==="settings"&&(di=null,gt.cap=null,Ae(vs),vs==="paused"&&(P("vd").value=D.viewDist,P("vdVal").textContent=D.viewDist))}P("pSettings").onclick=mp;P("mSettings").onclick=mp;P("setClose").onclick=Lo;up();qo();fi();const Vn=new ty(D,{toast:i=>ee(i),status:i=>{P("mpStatus").textContent=i},players:i=>{P("mpPlayers").innerHTML=i.map(t=>`<li><span>👤 ${t.name.replace(/[<>&]/g,"")}</span>${Vn.host?`<button data-kick="${t.id}">Entfernen</button>`:""}</li>`).join("")},joined:i=>{lr=-1,P("bFly").hidden=!(cn&&D.mode==="creative"),P("bUndo").hidden=D.mode!=="creative",P("bmode").hidden=!0,Ji(),Mi(),Ae("playing"),cr(),Qi(),jr(`👥 Bei ${String(i.host).replace(/[<>&]/g,"")}<small>Du spielst in seiner Welt. Dein Vorrat gilt nur für diesen Besuch; gespeichert wird beim Gastgeber.</small>`)},ended:(i,t)=>{ee(i),t?(lr=-1,fi(),Ae("menu"),D.startMenu(),Mi(),cr()):Vn.listPlayers()}});let Zs=null,gp="menu";function _p(i){gp=Mt,vs=Mt==="paused"?"paused":"menu",P("mpHost").hidden=!i,P("mpGuest").hidden=i,P("mpStun").checked=ht.stun,P("mpName").value=ht.mpName,P("mpStatus").textContent="",i&&Vn.listPlayers(),Ae("mp")}P("pMp").onclick=()=>_p(!0);P("mJoin").onclick=()=>{Xi(),P("mpAnswerBox").hidden=!0,_p(!1)};P("mpClose").onclick=()=>{Ae(gp==="paused"?"paused":"menu")};P("mpStun").onchange=i=>{ht.stun=i.target.checked,ji(ht)};const vp=i=>{const t=P(i);t.select(),(navigator.clipboard?navigator.clipboard.writeText(t.value):Promise.reject()).then(()=>ee("Kopiert ✔"),()=>{document.execCommand("copy"),ee("Kopiert")})};P("mpCopyO").onclick=()=>vp("mpOffer");P("mpCopyA").onclick=()=>vp("mpAnswer");P("mpInvite").onclick=async()=>{Vn.useStun=ht.stun,Vn.myName=ht.mpName||"Gastgeber",P("mpStatus").textContent="Einladung wird vorbereitet …",P("mpInvite").disabled=!0;try{Zs=await Vn.invite(),P("mpOffer").value=Zs.code,P("mpAnswerIn").value="",P("mpOfferBox").hidden=!1,P("mpStatus").textContent="Einladung kopieren und schicken, dann die Antwort einfügen."}catch(i){P("mpStatus").textContent="Einladung ging nicht: "+(i.message||i)}P("mpInvite").disabled=!1};P("mpConnect").onclick=async()=>{if(Zs)try{await Zs.accept(P("mpAnswerIn").value),P("mpStatus").textContent="Verbinde …";const i=Zs.pc;Zs=null,P("mpOfferBox").hidden=!0;const t=setTimeout(()=>{i.connectionState!=="connected"&&(P("mpStatus").textContent="Keine Verbindung. Tipp: „Über das Internet verbinden“ bei beiden einschalten oder im selben WLAN spielen.")},15e3);i.addEventListener("connectionstatechange",()=>{i.connectionState==="connected"&&(clearTimeout(t),P("mpStatus").textContent="Verbunden ✔")})}catch(i){P("mpStatus").textContent=i.message||"Antwort-Code passt nicht"}};P("mpPlayers").addEventListener("click",i=>{const t=i.target.closest("[data-kick]");t&&Vn.kick(Number(t.dataset.kick))});P("mpJoin").onclick=async()=>{const i=P("mpName").value.trim();ht.mpName=i,ht.stun=P("mpStun").checked,ji(ht),D.mp&&Vn.end(null),Vn.useStun=ht.stun,P("mpStatus").textContent="Antwort wird erstellt …",P("mpJoin").disabled=!0;try{const t=await Vn.join(P("mpInviteIn").value,i||"Gast");P("mpAnswer").value=t,P("mpAnswerBox").hidden=!1,P("mpStatus").textContent="Antwort kopieren und dem Gastgeber schicken. Sobald er sie einfügt, geht es los."}catch(t){P("mpStatus").textContent=t.message||"Einladungs-Code passt nicht"}P("mpJoin").disabled=!1};Ae("menu");D.startMenu();
