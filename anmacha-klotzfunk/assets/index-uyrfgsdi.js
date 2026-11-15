(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function e(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=e(s);fetch(s.href,r)}})();/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Hc="170",mp=0,Mh=1,gp=2,Ef=1,_p=2,ii=3,ui=0,Qe=1,Sn=2,ki=0,qs=1,yh=2,Sh=3,Eh=4,vp=5,as=100,xp=101,Mp=102,yp=103,Sp=104,Ep=200,bp=201,Tp=202,Ap=203,Ol=204,zl=205,wp=206,Rp=207,Cp=208,Lp=209,Pp=210,Dp=211,Ip=212,Np=213,Up=214,Fl=0,Bl=1,Hl=2,Zs=3,Gl=4,Vl=5,Wl=6,Xl=7,bf=0,kp=1,Op=2,Oi=0,zp=1,Fp=2,Bp=3,Hp=4,Gp=5,Vp=6,Wp=7,Tf=300,Js=301,Qs=302,$l=303,ql=304,bo=306,lo=1e3,ls=1001,Yl=1002,tn=1003,Xp=1004,da=1005,mn=1006,Go=1007,qn=1008,fi=1009,Af=1010,wf=1011,qr=1012,Gc=1013,fs=1014,si=1015,ia=1016,Vc=1017,Wc=1018,tr=1020,Rf=35902,Cf=1021,Lf=1022,bn=1023,Pf=1024,Df=1025,Ys=1026,er=1027,If=1028,Xc=1029,Nf=1030,$c=1031,qc=1033,Ka=33776,ja=33777,Za=33778,Ja=33779,Kl=35840,jl=35841,Zl=35842,Jl=35843,Ql=36196,tc=37492,ec=37496,nc=37808,ic=37809,sc=37810,rc=37811,ac=37812,oc=37813,lc=37814,cc=37815,hc=37816,uc=37817,fc=37818,dc=37819,pc=37820,mc=37821,Qa=36492,gc=36494,_c=36495,Uf=36283,vc=36284,xc=36285,Mc=36286,$p=3200,qp=3201,Yp=0,Kp=1,Pi="",Mn="srgb",ar="srgb-linear",To="linear",de="srgb",ys=7680,bh=519,jp=512,Zp=513,Jp=514,kf=515,Qp=516,tm=517,em=518,nm=519,yc=35044,Th="300 es",ri=2e3,co=2001;class or{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const s=this._listeners[t];if(s!==void 0){const r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const n=this._listeners[t.type];if(n!==void 0){t.target=this;const s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}}const Ge=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],to=Math.PI/180,Sc=180/Math.PI;function zi(){const i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ge[i&255]+Ge[i>>8&255]+Ge[i>>16&255]+Ge[i>>24&255]+"-"+Ge[t&255]+Ge[t>>8&255]+"-"+Ge[t>>16&15|64]+Ge[t>>24&255]+"-"+Ge[e&63|128]+Ge[e>>8&255]+"-"+Ge[e>>16&255]+Ge[e>>24&255]+Ge[n&255]+Ge[n>>8&255]+Ge[n>>16&255]+Ge[n>>24&255]).toLowerCase()}function an(i,t,e){return Math.max(t,Math.min(e,i))}function im(i,t){return(i%t+t)%t}function Vo(i,t,e){return(1-e)*i+e*t}function Xn(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function me(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}class Kt{constructor(t=0,e=0){Kt.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(an(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*s+t.x,this.y=r*s+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Vt{constructor(t,e,n,s,r,a,o,l,c){Vt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c)}set(t,e,n,s,r,a,o,l,c){const h=this.elements;return h[0]=t,h[1]=s,h[2]=o,h[3]=e,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],f=n[2],d=n[5],g=n[8],_=s[0],m=s[3],p=s[6],x=s[1],y=s[4],M=s[7],C=s[2],A=s[5],w=s[8];return r[0]=a*_+o*x+l*C,r[3]=a*m+o*y+l*A,r[6]=a*p+o*M+l*w,r[1]=c*_+h*x+u*C,r[4]=c*m+h*y+u*A,r[7]=c*p+h*M+u*w,r[2]=f*_+d*x+g*C,r[5]=f*m+d*y+g*A,r[8]=f*p+d*M+g*w,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8];return e*a*h-e*o*c-n*r*h+n*o*l+s*r*c-s*a*l}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=h*a-o*c,f=o*l-h*r,d=c*r-a*l,g=e*u+n*f+s*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return t[0]=u*_,t[1]=(s*c-h*n)*_,t[2]=(o*n-s*a)*_,t[3]=f*_,t[4]=(h*e-s*l)*_,t[5]=(s*r-o*e)*_,t[6]=d*_,t[7]=(n*l-c*e)*_,t[8]=(a*e-n*r)*_,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+t,-s*c,s*l,-s*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return this.premultiply(Wo.makeScale(t,e)),this}rotate(t){return this.premultiply(Wo.makeRotation(-t)),this}translate(t,e){return this.premultiply(Wo.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const Wo=new Vt;function Of(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function ho(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function sm(){const i=ho("canvas");return i.style.display="block",i}const Ah={};function Pr(i){i in Ah||(Ah[i]=!0,console.warn(i))}function rm(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}function am(i){const t=i.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function om(i){const t=i.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}const re={enabled:!0,workingColorSpace:ar,spaces:{},convert:function(i,t,e){return this.enabled===!1||t===e||!t||!e||(this.spaces[t].transfer===de&&(i.r=oi(i.r),i.g=oi(i.g),i.b=oi(i.b)),this.spaces[t].primaries!==this.spaces[e].primaries&&(i.applyMatrix3(this.spaces[t].toXYZ),i.applyMatrix3(this.spaces[e].fromXYZ)),this.spaces[e].transfer===de&&(i.r=Ks(i.r),i.g=Ks(i.g),i.b=Ks(i.b))),i},fromWorkingColorSpace:function(i,t){return this.convert(i,this.workingColorSpace,t)},toWorkingColorSpace:function(i,t){return this.convert(i,t,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===Pi?To:this.spaces[i].transfer},getLuminanceCoefficients:function(i,t=this.workingColorSpace){return i.fromArray(this.spaces[t].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,t,e){return i.copy(this.spaces[t].toXYZ).multiply(this.spaces[e].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}};function oi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Ks(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}const wh=[.64,.33,.3,.6,.15,.06],Rh=[.2126,.7152,.0722],Ch=[.3127,.329],Lh=new Vt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Ph=new Vt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);re.define({[ar]:{primaries:wh,whitePoint:Ch,transfer:To,toXYZ:Lh,fromXYZ:Ph,luminanceCoefficients:Rh,workingColorSpaceConfig:{unpackColorSpace:Mn},outputColorSpaceConfig:{drawingBufferColorSpace:Mn}},[Mn]:{primaries:wh,whitePoint:Ch,transfer:de,toXYZ:Lh,fromXYZ:Ph,luminanceCoefficients:Rh,outputColorSpaceConfig:{drawingBufferColorSpace:Mn}}});let Ss;class lm{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{Ss===void 0&&(Ss=ho("canvas")),Ss.width=t.width,Ss.height=t.height;const n=Ss.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=Ss}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=ho("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=oi(r[a]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(oi(e[n]/255)*255):e[n]=oi(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let cm=0;class zf{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:cm++}),this.uuid=zi(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Xo(s[a].image)):r.push(Xo(s[a]))}else r=Xo(s);n.url=r}return e||(t.images[this.uuid]=n),n}}function Xo(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?lm.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let hm=0;class $e extends or{constructor(t=$e.DEFAULT_IMAGE,e=$e.DEFAULT_MAPPING,n=ls,s=ls,r=mn,a=qn,o=bn,l=fi,c=$e.DEFAULT_ANISOTROPY,h=Pi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:hm++}),this.uuid=zi(),this.name="",this.source=new zf(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Kt(0,0),this.repeat=new Kt(1,1),this.center=new Kt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Vt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Tf)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case lo:t.x=t.x-Math.floor(t.x);break;case ls:t.x=t.x<0?0:1;break;case Yl:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case lo:t.y=t.y-Math.floor(t.y);break;case ls:t.y=t.y<0?0:1;break;case Yl:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}$e.DEFAULT_IMAGE=null;$e.DEFAULT_MAPPING=Tf;$e.DEFAULT_ANISOTROPY=1;class Pe{constructor(t=0,e=0,n=0,s=1){Pe.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*s+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r;const l=t.elements,c=l[0],h=l[4],u=l[8],f=l[1],d=l[5],g=l[9],_=l[2],m=l[6],p=l[10];if(Math.abs(h-f)<.01&&Math.abs(u-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+d+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const y=(c+1)/2,M=(d+1)/2,C=(p+1)/2,A=(h+f)/4,w=(u+_)/4,D=(g+m)/4;return y>M&&y>C?y<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(y),s=A/n,r=w/n):M>C?M<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(M),n=A/s,r=D/s):C<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(C),n=w/r,s=D/r),this.set(n,s,r,e),this}let x=Math.sqrt((m-g)*(m-g)+(u-_)*(u-_)+(f-h)*(f-h));return Math.abs(x)<.001&&(x=1),this.x=(m-g)/x,this.y=(u-_)/x,this.z=(f-h)/x,this.w=Math.acos((c+d+p-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class um extends or{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new Pe(0,0,t,e),this.scissorTest=!1,this.viewport=new Pe(0,0,t,e);const s={width:t,height:e,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:mn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const r=new $e(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];const a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,s=t.textures.length;n<s;n++)this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const e=Object.assign({},t.texture.image);return this.texture.source=new zf(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class ds extends um{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class Ff extends $e{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=tn,this.minFilter=tn,this.wrapR=ls,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class fm extends $e{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=tn,this.minFilter=tn,this.wrapR=ls,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class sa{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,a,o){let l=n[s+0],c=n[s+1],h=n[s+2],u=n[s+3];const f=r[a+0],d=r[a+1],g=r[a+2],_=r[a+3];if(o===0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u;return}if(o===1){t[e+0]=f,t[e+1]=d,t[e+2]=g,t[e+3]=_;return}if(u!==_||l!==f||c!==d||h!==g){let m=1-o;const p=l*f+c*d+h*g+u*_,x=p>=0?1:-1,y=1-p*p;if(y>Number.EPSILON){const C=Math.sqrt(y),A=Math.atan2(C,p*x);m=Math.sin(m*A)/C,o=Math.sin(o*A)/C}const M=o*x;if(l=l*m+f*M,c=c*m+d*M,h=h*m+g*M,u=u*m+_*M,m===1-o){const C=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=C,c*=C,h*=C,u*=C}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,s,r,a){const o=n[s],l=n[s+1],c=n[s+2],h=n[s+3],u=r[a],f=r[a+1],d=r[a+2],g=r[a+3];return t[e]=o*g+h*u+l*d-c*f,t[e+1]=l*g+h*f+c*u-o*d,t[e+2]=c*g+h*d+o*f-l*u,t[e+3]=h*g-o*u-l*f-c*d,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(s/2),u=o(r/2),f=l(n/2),d=l(s/2),g=l(r/2);switch(a){case"XYZ":this._x=f*h*u+c*d*g,this._y=c*d*u-f*h*g,this._z=c*h*g+f*d*u,this._w=c*h*u-f*d*g;break;case"YXZ":this._x=f*h*u+c*d*g,this._y=c*d*u-f*h*g,this._z=c*h*g-f*d*u,this._w=c*h*u+f*d*g;break;case"ZXY":this._x=f*h*u-c*d*g,this._y=c*d*u+f*h*g,this._z=c*h*g+f*d*u,this._w=c*h*u-f*d*g;break;case"ZYX":this._x=f*h*u-c*d*g,this._y=c*d*u+f*h*g,this._z=c*h*g-f*d*u,this._w=c*h*u+f*d*g;break;case"YZX":this._x=f*h*u+c*d*g,this._y=c*d*u+f*h*g,this._z=c*h*g-f*d*u,this._w=c*h*u-f*d*g;break;case"XZY":this._x=f*h*u-c*d*g,this._y=c*d*u-f*h*g,this._z=c*h*g+f*d*u,this._w=c*h*u+f*d*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],s=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],h=e[6],u=e[10],f=n+o+u;if(f>0){const d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(h-l)*d,this._y=(r-c)*d,this._z=(a-s)*d}else if(n>o&&n>u){const d=2*Math.sqrt(1+n-o-u);this._w=(h-l)/d,this._x=.25*d,this._y=(s+a)/d,this._z=(r+c)/d}else if(o>u){const d=2*Math.sqrt(1+o-n-u);this._w=(r-c)/d,this._x=(s+a)/d,this._y=.25*d,this._z=(l+h)/d}else{const d=2*Math.sqrt(1+u-n-o);this._w=(a-s)/d,this._x=(r+c)/d,this._y=(l+h)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(an(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,s=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-s*o,this._w=a*h-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const n=this._x,s=this._y,r=this._z,a=this._w;let o=a*t._w+n*t._x+s*t._y+r*t._z;if(o<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,o=-o):this.copy(t),o>=1)return this._w=a,this._x=n,this._y=s,this._z=r,this;const l=1-o*o;if(l<=Number.EPSILON){const d=1-e;return this._w=d*a+e*this._w,this._x=d*n+e*this._x,this._y=d*s+e*this._y,this._z=d*r+e*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,o),u=Math.sin((1-e)*h)/c,f=Math.sin(e*h)/c;return this._w=a*u+this._w*f,this._x=n*u+this._x*f,this._y=s*u+this._y*f,this._z=r*u+this._z*f,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class U{constructor(t=0,e=0,n=0){U.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Dh.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Dh.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(t){const e=this.x,n=this.y,s=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*s-o*n),h=2*(o*e-r*s),u=2*(r*n-a*e);return this.x=e+l*c+a*u-o*h,this.y=n+l*h+o*c-r*u,this.z=s+l*u+r*h-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,s=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return $o.copy(this).projectOnVector(t),this.sub($o)}reflect(t){return this.sub($o.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(an(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const $o=new U,Dh=new sa;class ra{constructor(t=new U(1/0,1/0,1/0),e=new U(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(Pn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(Pn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=Pn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,Pn):Pn.fromBufferAttribute(r,a),Pn.applyMatrix4(t.matrixWorld),this.expandByPoint(Pn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),pa.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),pa.copy(n.boundingBox)),pa.applyMatrix4(t.matrixWorld),this.union(pa)}const s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Pn),Pn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(gr),ma.subVectors(this.max,gr),Es.subVectors(t.a,gr),bs.subVectors(t.b,gr),Ts.subVectors(t.c,gr),yi.subVectors(bs,Es),Si.subVectors(Ts,bs),Zi.subVectors(Es,Ts);let e=[0,-yi.z,yi.y,0,-Si.z,Si.y,0,-Zi.z,Zi.y,yi.z,0,-yi.x,Si.z,0,-Si.x,Zi.z,0,-Zi.x,-yi.y,yi.x,0,-Si.y,Si.x,0,-Zi.y,Zi.x,0];return!qo(e,Es,bs,Ts,ma)||(e=[1,0,0,0,1,0,0,0,1],!qo(e,Es,bs,Ts,ma))?!1:(ga.crossVectors(yi,Si),e=[ga.x,ga.y,ga.z],qo(e,Es,bs,Ts,ma))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Pn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Pn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(jn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),jn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),jn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),jn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),jn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),jn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),jn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),jn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(jn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const jn=[new U,new U,new U,new U,new U,new U,new U,new U],Pn=new U,pa=new ra,Es=new U,bs=new U,Ts=new U,yi=new U,Si=new U,Zi=new U,gr=new U,ma=new U,ga=new U,Ji=new U;function qo(i,t,e,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){Ji.fromArray(i,r);const o=s.x*Math.abs(Ji.x)+s.y*Math.abs(Ji.y)+s.z*Math.abs(Ji.z),l=t.dot(Ji),c=e.dot(Ji),h=n.dot(Ji);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}const dm=new ra,_r=new U,Yo=new U;class lr{constructor(t=new U,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):dm.setFromPoints(t).getCenter(n);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;_r.subVectors(t,this.center);const e=_r.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(_r,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Yo.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(_r.copy(t.center).add(Yo)),this.expandByPoint(_r.copy(t.center).sub(Yo))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Zn=new U,Ko=new U,_a=new U,Ei=new U,jo=new U,va=new U,Zo=new U;class Yc{constructor(t=new U,e=new U(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Zn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=Zn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Zn.copy(this.origin).addScaledVector(this.direction,e),Zn.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){Ko.copy(t).add(e).multiplyScalar(.5),_a.copy(e).sub(t).normalize(),Ei.copy(this.origin).sub(Ko);const r=t.distanceTo(e)*.5,a=-this.direction.dot(_a),o=Ei.dot(this.direction),l=-Ei.dot(_a),c=Ei.lengthSq(),h=Math.abs(1-a*a);let u,f,d,g;if(h>0)if(u=a*l-o,f=a*o-l,g=r*h,u>=0)if(f>=-g)if(f<=g){const _=1/h;u*=_,f*=_,d=u*(u+a*f+2*o)+f*(a*u+f+2*l)+c}else f=r,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*l)+c;else f=-r,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*l)+c;else f<=-g?(u=Math.max(0,-(-a*r+o)),f=u>0?-r:Math.min(Math.max(-r,-l),r),d=-u*u+f*(f+2*l)+c):f<=g?(u=0,f=Math.min(Math.max(-r,-l),r),d=f*(f+2*l)+c):(u=Math.max(0,-(a*r+o)),f=u>0?r:Math.min(Math.max(-r,-l),r),d=-u*u+f*(f+2*l)+c);else f=a>0?-r:r,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(Ko).addScaledVector(_a,f),d}intersectSphere(t,e){Zn.subVectors(t.center,this.origin);const n=Zn.dot(this.direction),s=Zn.dot(Zn)-n*n,r=t.radius*t.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,a,o,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return c>=0?(n=(t.min.x-f.x)*c,s=(t.max.x-f.x)*c):(n=(t.max.x-f.x)*c,s=(t.min.x-f.x)*c),h>=0?(r=(t.min.y-f.y)*h,a=(t.max.y-f.y)*h):(r=(t.max.y-f.y)*h,a=(t.min.y-f.y)*h),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),u>=0?(o=(t.min.z-f.z)*u,l=(t.max.z-f.z)*u):(o=(t.max.z-f.z)*u,l=(t.min.z-f.z)*u),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,Zn)!==null}intersectTriangle(t,e,n,s,r){jo.subVectors(e,t),va.subVectors(n,t),Zo.crossVectors(jo,va);let a=this.direction.dot(Zo),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Ei.subVectors(this.origin,t);const l=o*this.direction.dot(va.crossVectors(Ei,va));if(l<0)return null;const c=o*this.direction.dot(jo.cross(Ei));if(c<0||l+c>a)return null;const h=-o*Ei.dot(Zo);return h<0?null:this.at(h/a,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class be{constructor(t,e,n,s,r,a,o,l,c,h,u,f,d,g,_,m){be.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c,h,u,f,d,g,_,m)}set(t,e,n,s,r,a,o,l,c,h,u,f,d,g,_,m){const p=this.elements;return p[0]=t,p[4]=e,p[8]=n,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=h,p[10]=u,p[14]=f,p[3]=d,p[7]=g,p[11]=_,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new be().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,n=t.elements,s=1/As.setFromMatrixColumn(t,0).length(),r=1/As.setFromMatrixColumn(t,1).length(),a=1/As.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,s=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){const f=a*h,d=a*u,g=o*h,_=o*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=d+g*c,e[5]=f-_*c,e[9]=-o*l,e[2]=_-f*c,e[6]=g+d*c,e[10]=a*l}else if(t.order==="YXZ"){const f=l*h,d=l*u,g=c*h,_=c*u;e[0]=f+_*o,e[4]=g*o-d,e[8]=a*c,e[1]=a*u,e[5]=a*h,e[9]=-o,e[2]=d*o-g,e[6]=_+f*o,e[10]=a*l}else if(t.order==="ZXY"){const f=l*h,d=l*u,g=c*h,_=c*u;e[0]=f-_*o,e[4]=-a*u,e[8]=g+d*o,e[1]=d+g*o,e[5]=a*h,e[9]=_-f*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){const f=a*h,d=a*u,g=o*h,_=o*u;e[0]=l*h,e[4]=g*c-d,e[8]=f*c+_,e[1]=l*u,e[5]=_*c+f,e[9]=d*c-g,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){const f=a*l,d=a*c,g=o*l,_=o*c;e[0]=l*h,e[4]=_-f*u,e[8]=g*u+d,e[1]=u,e[5]=a*h,e[9]=-o*h,e[2]=-c*h,e[6]=d*u+g,e[10]=f-_*u}else if(t.order==="XZY"){const f=a*l,d=a*c,g=o*l,_=o*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=f*u+_,e[5]=a*h,e[9]=d*u-g,e[2]=g*u-d,e[6]=o*h,e[10]=_*u+f}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(pm,t,mm)}lookAt(t,e,n){const s=this.elements;return cn.subVectors(t,e),cn.lengthSq()===0&&(cn.z=1),cn.normalize(),bi.crossVectors(n,cn),bi.lengthSq()===0&&(Math.abs(n.z)===1?cn.x+=1e-4:cn.z+=1e-4,cn.normalize(),bi.crossVectors(n,cn)),bi.normalize(),xa.crossVectors(cn,bi),s[0]=bi.x,s[4]=xa.x,s[8]=cn.x,s[1]=bi.y,s[5]=xa.y,s[9]=cn.y,s[2]=bi.z,s[6]=xa.z,s[10]=cn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],f=n[9],d=n[13],g=n[2],_=n[6],m=n[10],p=n[14],x=n[3],y=n[7],M=n[11],C=n[15],A=s[0],w=s[4],D=s[8],T=s[12],b=s[1],I=s[5],K=s[9],H=s[13],q=s[2],Z=s[6],$=s[10],nt=s[14],W=s[3],ct=s[7],_t=s[11],Ct=s[15];return r[0]=a*A+o*b+l*q+c*W,r[4]=a*w+o*I+l*Z+c*ct,r[8]=a*D+o*K+l*$+c*_t,r[12]=a*T+o*H+l*nt+c*Ct,r[1]=h*A+u*b+f*q+d*W,r[5]=h*w+u*I+f*Z+d*ct,r[9]=h*D+u*K+f*$+d*_t,r[13]=h*T+u*H+f*nt+d*Ct,r[2]=g*A+_*b+m*q+p*W,r[6]=g*w+_*I+m*Z+p*ct,r[10]=g*D+_*K+m*$+p*_t,r[14]=g*T+_*H+m*nt+p*Ct,r[3]=x*A+y*b+M*q+C*W,r[7]=x*w+y*I+M*Z+C*ct,r[11]=x*D+y*K+M*$+C*_t,r[15]=x*T+y*H+M*nt+C*Ct,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],h=t[2],u=t[6],f=t[10],d=t[14],g=t[3],_=t[7],m=t[11],p=t[15];return g*(+r*l*u-s*c*u-r*o*f+n*c*f+s*o*d-n*l*d)+_*(+e*l*d-e*c*f+r*a*f-s*a*d+s*c*h-r*l*h)+m*(+e*c*u-e*o*d-r*a*u+n*a*d+r*o*h-n*c*h)+p*(-s*o*h-e*l*u+e*o*f+s*a*u-n*a*f+n*l*h)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=t[9],f=t[10],d=t[11],g=t[12],_=t[13],m=t[14],p=t[15],x=u*m*c-_*f*c+_*l*d-o*m*d-u*l*p+o*f*p,y=g*f*c-h*m*c-g*l*d+a*m*d+h*l*p-a*f*p,M=h*_*c-g*u*c+g*o*d-a*_*d-h*o*p+a*u*p,C=g*u*l-h*_*l-g*o*f+a*_*f+h*o*m-a*u*m,A=e*x+n*y+s*M+r*C;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const w=1/A;return t[0]=x*w,t[1]=(_*f*r-u*m*r-_*s*d+n*m*d+u*s*p-n*f*p)*w,t[2]=(o*m*r-_*l*r+_*s*c-n*m*c-o*s*p+n*l*p)*w,t[3]=(u*l*r-o*f*r-u*s*c+n*f*c+o*s*d-n*l*d)*w,t[4]=y*w,t[5]=(h*m*r-g*f*r+g*s*d-e*m*d-h*s*p+e*f*p)*w,t[6]=(g*l*r-a*m*r-g*s*c+e*m*c+a*s*p-e*l*p)*w,t[7]=(a*f*r-h*l*r+h*s*c-e*f*c-a*s*d+e*l*d)*w,t[8]=M*w,t[9]=(g*u*r-h*_*r-g*n*d+e*_*d+h*n*p-e*u*p)*w,t[10]=(a*_*r-g*o*r+g*n*c-e*_*c-a*n*p+e*o*p)*w,t[11]=(h*o*r-a*u*r-h*n*c+e*u*c+a*n*d-e*o*d)*w,t[12]=C*w,t[13]=(h*_*s-g*u*s+g*n*f-e*_*f-h*n*m+e*u*m)*w,t[14]=(g*o*s-a*_*s-g*n*l+e*_*l+a*n*m-e*o*m)*w,t[15]=(a*u*s-h*o*s+h*n*l-e*u*l-a*n*f+e*o*f)*w,this}scale(t){const e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),s=Math.sin(e),r=1-n,a=t.x,o=t.y,l=t.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+n,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,a){return this.set(1,n,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){const s=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,h=a+a,u=o+o,f=r*c,d=r*h,g=r*u,_=a*h,m=a*u,p=o*u,x=l*c,y=l*h,M=l*u,C=n.x,A=n.y,w=n.z;return s[0]=(1-(_+p))*C,s[1]=(d+M)*C,s[2]=(g-y)*C,s[3]=0,s[4]=(d-M)*A,s[5]=(1-(f+p))*A,s[6]=(m+x)*A,s[7]=0,s[8]=(g+y)*w,s[9]=(m-x)*w,s[10]=(1-(f+_))*w,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){const s=this.elements;let r=As.set(s[0],s[1],s[2]).length();const a=As.set(s[4],s[5],s[6]).length(),o=As.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],Dn.copy(this);const c=1/r,h=1/a,u=1/o;return Dn.elements[0]*=c,Dn.elements[1]*=c,Dn.elements[2]*=c,Dn.elements[4]*=h,Dn.elements[5]*=h,Dn.elements[6]*=h,Dn.elements[8]*=u,Dn.elements[9]*=u,Dn.elements[10]*=u,e.setFromRotationMatrix(Dn),n.x=r,n.y=a,n.z=o,this}makePerspective(t,e,n,s,r,a,o=ri){const l=this.elements,c=2*r/(e-t),h=2*r/(n-s),u=(e+t)/(e-t),f=(n+s)/(n-s);let d,g;if(o===ri)d=-(a+r)/(a-r),g=-2*a*r/(a-r);else if(o===co)d=-a/(a-r),g=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=d,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,s,r,a,o=ri){const l=this.elements,c=1/(e-t),h=1/(n-s),u=1/(a-r),f=(e+t)*c,d=(n+s)*h;let g,_;if(o===ri)g=(a+r)*u,_=-2*u;else if(o===co)g=r*u,_=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-d,l[2]=0,l[6]=0,l[10]=_,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}const As=new U,Dn=new be,pm=new U(0,0,0),mm=new U(1,1,1),bi=new U,xa=new U,cn=new U,Ih=new be,Nh=new sa;class di{constructor(t=0,e=0,n=0,s=di.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const s=t.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],u=s[2],f=s[6],d=s[10];switch(e){case"XYZ":this._y=Math.asin(an(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,d),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-an(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(an(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,d),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-an(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(an(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-an(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,d),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Ih.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Ih,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Nh.setFromEuler(this),this.setFromQuaternion(Nh,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}di.DEFAULT_ORDER="XYZ";class Bf{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let gm=0;const Uh=new U,ws=new sa,Jn=new be,Ma=new U,vr=new U,_m=new U,vm=new sa,kh=new U(1,0,0),Oh=new U(0,1,0),zh=new U(0,0,1),Fh={type:"added"},xm={type:"removed"},Rs={type:"childadded",child:null},Jo={type:"childremoved",child:null};class qe extends or{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:gm++}),this.uuid=zi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=qe.DEFAULT_UP.clone();const t=new U,e=new di,n=new sa,s=new U(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new be},normalMatrix:{value:new Vt}}),this.matrix=new be,this.matrixWorld=new be,this.matrixAutoUpdate=qe.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=qe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Bf,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return ws.setFromAxisAngle(t,e),this.quaternion.multiply(ws),this}rotateOnWorldAxis(t,e){return ws.setFromAxisAngle(t,e),this.quaternion.premultiply(ws),this}rotateX(t){return this.rotateOnAxis(kh,t)}rotateY(t){return this.rotateOnAxis(Oh,t)}rotateZ(t){return this.rotateOnAxis(zh,t)}translateOnAxis(t,e){return Uh.copy(t).applyQuaternion(this.quaternion),this.position.add(Uh.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(kh,t)}translateY(t){return this.translateOnAxis(Oh,t)}translateZ(t){return this.translateOnAxis(zh,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Jn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Ma.copy(t):Ma.set(t,e,n);const s=this.parent;this.updateWorldMatrix(!0,!1),vr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Jn.lookAt(vr,Ma,this.up):Jn.lookAt(Ma,vr,this.up),this.quaternion.setFromRotationMatrix(Jn),s&&(Jn.extractRotation(s.matrixWorld),ws.setFromRotationMatrix(Jn),this.quaternion.premultiply(ws.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Fh),Rs.child=t,this.dispatchEvent(Rs),Rs.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(xm),Jo.child=t,this.dispatchEvent(Jo),Jo.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Jn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Jn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Jn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Fh),Rs.child=t,this.dispatchEvent(Rs),Rs.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){const a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(vr,t,_m),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(vr,vm,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){const n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];r(t.shapes,u)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];s.animations.push(r(t.animations,l))}}if(e){const o=a(t.geometries),l=a(t.materials),c=a(t.textures),h=a(t.images),u=a(t.shapes),f=a(t.skeletons),d=a(t.animations),g=a(t.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),f.length>0&&(n.skeletons=f),d.length>0&&(n.animations=d),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){const l=[];for(const c in o){const h=o[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const s=t.children[n];this.add(s.clone())}return this}}qe.DEFAULT_UP=new U(0,1,0);qe.DEFAULT_MATRIX_AUTO_UPDATE=!0;qe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const In=new U,Qn=new U,Qo=new U,ti=new U,Cs=new U,Ls=new U,Bh=new U,tl=new U,el=new U,nl=new U,il=new Pe,sl=new Pe,rl=new Pe;class pn{constructor(t=new U,e=new U,n=new U){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),In.subVectors(t,e),s.cross(In);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){In.subVectors(s,e),Qn.subVectors(n,e),Qo.subVectors(t,e);const a=In.dot(In),o=In.dot(Qn),l=In.dot(Qo),c=Qn.dot(Qn),h=Qn.dot(Qo),u=a*c-o*o;if(u===0)return r.set(0,0,0),null;const f=1/u,d=(c*l-o*h)*f,g=(a*h-o*l)*f;return r.set(1-d-g,g,d)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,ti)===null?!1:ti.x>=0&&ti.y>=0&&ti.x+ti.y<=1}static getInterpolation(t,e,n,s,r,a,o,l){return this.getBarycoord(t,e,n,s,ti)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,ti.x),l.addScaledVector(a,ti.y),l.addScaledVector(o,ti.z),l)}static getInterpolatedAttribute(t,e,n,s,r,a){return il.setScalar(0),sl.setScalar(0),rl.setScalar(0),il.fromBufferAttribute(t,e),sl.fromBufferAttribute(t,n),rl.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(il,r.x),a.addScaledVector(sl,r.y),a.addScaledVector(rl,r.z),a}static isFrontFacing(t,e,n,s){return In.subVectors(n,e),Qn.subVectors(t,e),In.cross(Qn).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return In.subVectors(this.c,this.b),Qn.subVectors(this.a,this.b),In.cross(Qn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return pn.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return pn.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return pn.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return pn.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return pn.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,s=this.b,r=this.c;let a,o;Cs.subVectors(s,n),Ls.subVectors(r,n),tl.subVectors(t,n);const l=Cs.dot(tl),c=Ls.dot(tl);if(l<=0&&c<=0)return e.copy(n);el.subVectors(t,s);const h=Cs.dot(el),u=Ls.dot(el);if(h>=0&&u<=h)return e.copy(s);const f=l*u-h*c;if(f<=0&&l>=0&&h<=0)return a=l/(l-h),e.copy(n).addScaledVector(Cs,a);nl.subVectors(t,r);const d=Cs.dot(nl),g=Ls.dot(nl);if(g>=0&&d<=g)return e.copy(r);const _=d*c-l*g;if(_<=0&&c>=0&&g<=0)return o=c/(c-g),e.copy(n).addScaledVector(Ls,o);const m=h*g-d*u;if(m<=0&&u-h>=0&&d-g>=0)return Bh.subVectors(r,s),o=(u-h)/(u-h+(d-g)),e.copy(s).addScaledVector(Bh,o);const p=1/(m+_+f);return a=_*p,o=f*p,e.copy(n).addScaledVector(Cs,a).addScaledVector(Ls,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const Hf={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ti={h:0,s:0,l:0},ya={h:0,s:0,l:0};function al(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}class oe{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Mn){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,re.toWorkingColorSpace(this,e),this}setRGB(t,e,n,s=re.workingColorSpace){return this.r=t,this.g=e,this.b=n,re.toWorkingColorSpace(this,s),this}setHSL(t,e,n,s=re.workingColorSpace){if(t=im(t,1),e=an(e,0,1),n=an(n,0,1),e===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=al(a,r,t+1/3),this.g=al(a,r,t),this.b=al(a,r,t-1/3)}return re.toWorkingColorSpace(this,s),this}setStyle(t,e=Mn){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Mn){const n=Hf[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=oi(t.r),this.g=oi(t.g),this.b=oi(t.b),this}copyLinearToSRGB(t){return this.r=Ks(t.r),this.g=Ks(t.g),this.b=Ks(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Mn){return re.fromWorkingColorSpace(Ve.copy(this),t),Math.round(an(Ve.r*255,0,255))*65536+Math.round(an(Ve.g*255,0,255))*256+Math.round(an(Ve.b*255,0,255))}getHexString(t=Mn){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=re.workingColorSpace){re.fromWorkingColorSpace(Ve.copy(this),e);const n=Ve.r,s=Ve.g,r=Ve.b,a=Math.max(n,s,r),o=Math.min(n,s,r);let l,c;const h=(o+a)/2;if(o===a)l=0,c=0;else{const u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-n)/u+2;break;case r:l=(n-s)/u+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=re.workingColorSpace){return re.fromWorkingColorSpace(Ve.copy(this),e),t.r=Ve.r,t.g=Ve.g,t.b=Ve.b,t}getStyle(t=Mn){re.fromWorkingColorSpace(Ve.copy(this),t);const e=Ve.r,n=Ve.g,s=Ve.b;return t!==Mn?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(Ti),this.setHSL(Ti.h+t,Ti.s+e,Ti.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Ti),t.getHSL(ya);const n=Vo(Ti.h,ya.h,e),s=Vo(Ti.s,ya.s,e),r=Vo(Ti.l,ya.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Ve=new oe;oe.NAMES=Hf;let Mm=0;class vs extends or{static get type(){return"Material"}get type(){return this.constructor.type}set type(t){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Mm++}),this.uuid=zi(),this.name="",this.blending=qs,this.side=ui,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ol,this.blendDst=zl,this.blendEquation=as,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new oe(0,0,0),this.blendAlpha=0,this.depthFunc=Zs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=bh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ys,this.stencilZFail=ys,this.stencilZPass=ys,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==qs&&(n.blending=this.blending),this.side!==ui&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Ol&&(n.blendSrc=this.blendSrc),this.blendDst!==zl&&(n.blendDst=this.blendDst),this.blendEquation!==as&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Zs&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==bh&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==ys&&(n.stencilFail=this.stencilFail),this.stencilZFail!==ys&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==ys&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(e){const r=s(t.textures),a=s(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Fi extends vs{static get type(){return"MeshBasicMaterial"}constructor(t){super(),this.isMeshBasicMaterial=!0,this.color=new oe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new di,this.combine=bf,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const De=new U,Sa=new Kt;class Ne{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=yc,this.updateRanges=[],this.gpuType=si,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Sa.fromBufferAttribute(this,e),Sa.applyMatrix3(t),this.setXY(e,Sa.x,Sa.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)De.fromBufferAttribute(this,e),De.applyMatrix3(t),this.setXYZ(e,De.x,De.y,De.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)De.fromBufferAttribute(this,e),De.applyMatrix4(t),this.setXYZ(e,De.x,De.y,De.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)De.fromBufferAttribute(this,e),De.applyNormalMatrix(t),this.setXYZ(e,De.x,De.y,De.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)De.fromBufferAttribute(this,e),De.transformDirection(t),this.setXYZ(e,De.x,De.y,De.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=Xn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=me(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Xn(e,this.array)),e}setX(t,e){return this.normalized&&(e=me(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Xn(e,this.array)),e}setY(t,e){return this.normalized&&(e=me(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Xn(e,this.array)),e}setZ(t,e){return this.normalized&&(e=me(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Xn(e,this.array)),e}setW(t,e){return this.normalized&&(e=me(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=me(e,this.array),n=me(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=me(e,this.array),n=me(n,this.array),s=me(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=me(e,this.array),n=me(n,this.array),s=me(s,this.array),r=me(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==yc&&(t.usage=this.usage),t}}class Gf extends Ne{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class Vf extends Ne{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class en extends Ne{constructor(t,e,n){super(new Float32Array(t),e,n)}}let ym=0;const xn=new be,ol=new qe,Ps=new U,hn=new ra,xr=new ra,Fe=new U;class Ue extends or{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:ym++}),this.uuid=zi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Of(t)?Vf:Gf)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Vt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return xn.makeRotationFromQuaternion(t),this.applyMatrix4(xn),this}rotateX(t){return xn.makeRotationX(t),this.applyMatrix4(xn),this}rotateY(t){return xn.makeRotationY(t),this.applyMatrix4(xn),this}rotateZ(t){return xn.makeRotationZ(t),this.applyMatrix4(xn),this}translate(t,e,n){return xn.makeTranslation(t,e,n),this.applyMatrix4(xn),this}scale(t,e,n){return xn.makeScale(t,e,n),this.applyMatrix4(xn),this}lookAt(t){return ol.lookAt(t),ol.updateMatrix(),this.applyMatrix4(ol.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ps).negate(),this.translate(Ps.x,Ps.y,Ps.z),this}setFromPoints(t){const e=this.getAttribute("position");if(e===void 0){const n=[];for(let s=0,r=t.length;s<r;s++){const a=t[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new en(n,3))}else{for(let n=0,s=e.count;n<s;n++){const r=t[n];e.setXYZ(n,r.x,r.y,r.z||0)}t.length>e.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ra);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new U(-1/0,-1/0,-1/0),new U(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){const r=e[n];hn.setFromBufferAttribute(r),this.morphTargetsRelative?(Fe.addVectors(this.boundingBox.min,hn.min),this.boundingBox.expandByPoint(Fe),Fe.addVectors(this.boundingBox.max,hn.max),this.boundingBox.expandByPoint(Fe)):(this.boundingBox.expandByPoint(hn.min),this.boundingBox.expandByPoint(hn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new lr);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new U,1/0);return}if(t){const n=this.boundingSphere.center;if(hn.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){const o=e[r];xr.setFromBufferAttribute(o),this.morphTargetsRelative?(Fe.addVectors(hn.min,xr.min),hn.expandByPoint(Fe),Fe.addVectors(hn.max,xr.max),hn.expandByPoint(Fe)):(hn.expandByPoint(xr.min),hn.expandByPoint(xr.max))}hn.getCenter(n);let s=0;for(let r=0,a=t.count;r<a;r++)Fe.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(Fe));if(e)for(let r=0,a=e.length;r<a;r++){const o=e[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Fe.fromBufferAttribute(o,c),l&&(Ps.fromBufferAttribute(t,c),Fe.add(Ps)),s=Math.max(s,n.distanceToSquared(Fe))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ne(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let D=0;D<n.count;D++)o[D]=new U,l[D]=new U;const c=new U,h=new U,u=new U,f=new Kt,d=new Kt,g=new Kt,_=new U,m=new U;function p(D,T,b){c.fromBufferAttribute(n,D),h.fromBufferAttribute(n,T),u.fromBufferAttribute(n,b),f.fromBufferAttribute(r,D),d.fromBufferAttribute(r,T),g.fromBufferAttribute(r,b),h.sub(c),u.sub(c),d.sub(f),g.sub(f);const I=1/(d.x*g.y-g.x*d.y);isFinite(I)&&(_.copy(h).multiplyScalar(g.y).addScaledVector(u,-d.y).multiplyScalar(I),m.copy(u).multiplyScalar(d.x).addScaledVector(h,-g.x).multiplyScalar(I),o[D].add(_),o[T].add(_),o[b].add(_),l[D].add(m),l[T].add(m),l[b].add(m))}let x=this.groups;x.length===0&&(x=[{start:0,count:t.count}]);for(let D=0,T=x.length;D<T;++D){const b=x[D],I=b.start,K=b.count;for(let H=I,q=I+K;H<q;H+=3)p(t.getX(H+0),t.getX(H+1),t.getX(H+2))}const y=new U,M=new U,C=new U,A=new U;function w(D){C.fromBufferAttribute(s,D),A.copy(C);const T=o[D];y.copy(T),y.sub(C.multiplyScalar(C.dot(T))).normalize(),M.crossVectors(A,T);const I=M.dot(l[D])<0?-1:1;a.setXYZW(D,y.x,y.y,y.z,I)}for(let D=0,T=x.length;D<T;++D){const b=x[D],I=b.start,K=b.count;for(let H=I,q=I+K;H<q;H+=3)w(t.getX(H+0)),w(t.getX(H+1)),w(t.getX(H+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Ne(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let f=0,d=n.count;f<d;f++)n.setXYZ(f,0,0,0);const s=new U,r=new U,a=new U,o=new U,l=new U,c=new U,h=new U,u=new U;if(t)for(let f=0,d=t.count;f<d;f+=3){const g=t.getX(f+0),_=t.getX(f+1),m=t.getX(f+2);s.fromBufferAttribute(e,g),r.fromBufferAttribute(e,_),a.fromBufferAttribute(e,m),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),o.add(h),l.add(h),c.add(h),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let f=0,d=e.count;f<d;f+=3)s.fromBufferAttribute(e,f+0),r.fromBufferAttribute(e,f+1),a.fromBufferAttribute(e,f+2),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),n.setXYZ(f+0,h.x,h.y,h.z),n.setXYZ(f+1,h.x,h.y,h.z),n.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Fe.fromBufferAttribute(t,e),Fe.normalize(),t.setXYZ(e,Fe.x,Fe.y,Fe.z)}toNonIndexed(){function t(o,l){const c=o.array,h=o.itemSize,u=o.normalized,f=new c.constructor(l.length*h);let d=0,g=0;for(let _=0,m=l.length;_<m;_++){o.isInterleavedBufferAttribute?d=l[_]*o.data.stride+o.offset:d=l[_]*h;for(let p=0;p<h;p++)f[g++]=c[d++]}return new Ne(f,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new Ue,n=this.index.array,s=this.attributes;for(const o in s){const l=s[o],c=t(l,n);e.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let h=0,u=c.length;h<u;h++){const f=c[h],d=t(f,n);l.push(d)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const l in n){const c=n[l];t.data.attributes[l]=c.toJSON(t.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,f=c.length;u<f;u++){const d=c[u];h.push(d.toJSON(t.data))}h.length>0&&(s[l]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(t.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone(e));const s=t.attributes;for(const c in s){const h=s[c];this.setAttribute(c,h.clone(e))}const r=t.morphAttributes;for(const c in r){const h=[],u=r[c];for(let f=0,d=u.length;f<d;f++)h.push(u[f].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;const a=t.groups;for(let c=0,h=a.length;c<h;c++){const u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}const o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Hh=new be,Qi=new Yc,Ea=new lr,Gh=new U,ba=new U,Ta=new U,Aa=new U,ll=new U,wa=new U,Vh=new U,Ra=new U;class Re extends qe{constructor(t=new Ue,e=new Fi){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(s,t);const o=this.morphTargetInfluences;if(r&&o){wa.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=o[l],u=r[l];h!==0&&(ll.fromBufferAttribute(u,t),a?wa.addScaledVector(ll,h):wa.addScaledVector(ll.sub(e),h))}e.add(wa)}return e}raycast(t,e){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Ea.copy(n.boundingSphere),Ea.applyMatrix4(r),Qi.copy(t.ray).recast(t.near),!(Ea.containsPoint(Qi.origin)===!1&&(Qi.intersectSphere(Ea,Gh)===null||Qi.origin.distanceToSquared(Gh)>(t.far-t.near)**2))&&(Hh.copy(r).invert(),Qi.copy(t.ray).applyMatrix4(Hh),!(n.boundingBox!==null&&Qi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,Qi)))}_computeIntersections(t,e,n){let s;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,f=r.groups,d=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,_=f.length;g<_;g++){const m=f[g],p=a[m.materialIndex],x=Math.max(m.start,d.start),y=Math.min(o.count,Math.min(m.start+m.count,d.start+d.count));for(let M=x,C=y;M<C;M+=3){const A=o.getX(M),w=o.getX(M+1),D=o.getX(M+2);s=Ca(this,p,t,n,c,h,u,A,w,D),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const g=Math.max(0,d.start),_=Math.min(o.count,d.start+d.count);for(let m=g,p=_;m<p;m+=3){const x=o.getX(m),y=o.getX(m+1),M=o.getX(m+2);s=Ca(this,a,t,n,c,h,u,x,y,M),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,_=f.length;g<_;g++){const m=f[g],p=a[m.materialIndex],x=Math.max(m.start,d.start),y=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let M=x,C=y;M<C;M+=3){const A=M,w=M+1,D=M+2;s=Ca(this,p,t,n,c,h,u,A,w,D),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const g=Math.max(0,d.start),_=Math.min(l.count,d.start+d.count);for(let m=g,p=_;m<p;m+=3){const x=m,y=m+1,M=m+2;s=Ca(this,a,t,n,c,h,u,x,y,M),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}}function Sm(i,t,e,n,s,r,a,o){let l;if(t.side===Qe?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,t.side===ui,o),l===null)return null;Ra.copy(o),Ra.applyMatrix4(i.matrixWorld);const c=e.ray.origin.distanceTo(Ra);return c<e.near||c>e.far?null:{distance:c,point:Ra.clone(),object:i}}function Ca(i,t,e,n,s,r,a,o,l,c){i.getVertexPosition(o,ba),i.getVertexPosition(l,Ta),i.getVertexPosition(c,Aa);const h=Sm(i,t,e,n,ba,Ta,Aa,Vh);if(h){const u=new U;pn.getBarycoord(Vh,ba,Ta,Aa,u),s&&(h.uv=pn.getInterpolatedAttribute(s,o,l,c,u,new Kt)),r&&(h.uv1=pn.getInterpolatedAttribute(r,o,l,c,u,new Kt)),a&&(h.normal=pn.getInterpolatedAttribute(a,o,l,c,u,new U),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const f={a:o,b:l,c,normal:new U,materialIndex:0};pn.getNormal(ba,Ta,Aa,f.normal),h.face=f,h.barycoord=u}return h}class Vi extends Ue{constructor(t=1,e=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],h=[],u=[];let f=0,d=0;g("z","y","x",-1,-1,n,e,t,a,r,0),g("z","y","x",1,-1,n,e,-t,a,r,1),g("x","z","y",1,1,t,n,e,s,a,2),g("x","z","y",1,-1,t,n,-e,s,a,3),g("x","y","z",1,-1,t,e,n,s,r,4),g("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new en(c,3)),this.setAttribute("normal",new en(h,3)),this.setAttribute("uv",new en(u,2));function g(_,m,p,x,y,M,C,A,w,D,T){const b=M/w,I=C/D,K=M/2,H=C/2,q=A/2,Z=w+1,$=D+1;let nt=0,W=0;const ct=new U;for(let _t=0;_t<$;_t++){const Ct=_t*I-H;for(let Wt=0;Wt<Z;Wt++){const ce=Wt*b-K;ct[_]=ce*x,ct[m]=Ct*y,ct[p]=q,c.push(ct.x,ct.y,ct.z),ct[_]=0,ct[m]=0,ct[p]=A>0?1:-1,h.push(ct.x,ct.y,ct.z),u.push(Wt/w),u.push(1-_t/D),nt+=1}}for(let _t=0;_t<D;_t++)for(let Ct=0;Ct<w;Ct++){const Wt=f+Ct+Z*_t,ce=f+Ct+Z*(_t+1),Y=f+(Ct+1)+Z*(_t+1),it=f+(Ct+1)+Z*_t;l.push(Wt,ce,it),l.push(ce,Y,it),W+=6}o.addGroup(d,W,T),d+=W,f+=nt}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Vi(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function nr(i){const t={};for(const e in i){t[e]={};for(const n in i[e]){const s=i[e][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone():Array.isArray(s)?t[e][n]=s.slice():t[e][n]=s}}return t}function Ke(i){const t={};for(let e=0;e<i.length;e++){const n=nr(i[e]);for(const s in n)t[s]=n[s]}return t}function Em(i){const t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Wf(i){const t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:re.workingColorSpace}const bm={clone:nr,merge:Ke};var Tm=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Am=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Bn extends vs{static get type(){return"ShaderMaterial"}constructor(t){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Tm,this.fragmentShader=Am,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=nr(t.uniforms),this.uniformsGroups=Em(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}}class Xf extends qe{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new be,this.projectionMatrix=new be,this.projectionMatrixInverse=new be,this.coordinateSystem=ri}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Ai=new U,Wh=new Kt,Xh=new Kt;class yn extends Xf{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=Sc*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(to*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Sc*2*Math.atan(Math.tan(to*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Ai.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Ai.x,Ai.y).multiplyScalar(-t/Ai.z),Ai.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ai.x,Ai.y).multiplyScalar(-t/Ai.z)}getViewSize(t,e){return this.getViewBounds(t,Wh,Xh),e.subVectors(Xh,Wh)}setViewOffset(t,e,n,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(to*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,e-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const Ds=-90,Is=1;class wm extends qe{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new yn(Ds,Is,t,e);s.layers=this.layers,this.add(s);const r=new yn(Ds,Is,t,e);r.layers=this.layers,this.add(r);const a=new yn(Ds,Is,t,e);a.layers=this.layers,this.add(a);const o=new yn(Ds,Is,t,e);o.layers=this.layers,this.add(o);const l=new yn(Ds,Is,t,e);l.layers=this.layers,this.add(l);const c=new yn(Ds,Is,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,s,r,a,o,l]=e;for(const c of e)this.remove(c);if(t===ri)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===co)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,h]=this.children,u=t.getRenderTarget(),f=t.getActiveCubeFace(),d=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;const _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,s),t.render(e,r),t.setRenderTarget(n,1,s),t.render(e,a),t.setRenderTarget(n,2,s),t.render(e,o),t.setRenderTarget(n,3,s),t.render(e,l),t.setRenderTarget(n,4,s),t.render(e,c),n.texture.generateMipmaps=_,t.setRenderTarget(n,5,s),t.render(e,h),t.setRenderTarget(u,f,d),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class $f extends $e{constructor(t,e,n,s,r,a,o,l,c,h){t=t!==void 0?t:[],e=e!==void 0?e:Js,super(t,e,n,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class Rm extends ds{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new $f(s,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:mn}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new Vi(5,5,5),r=new Bn({name:"CubemapFromEquirect",uniforms:nr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Qe,blending:ki});r.uniforms.tEquirect.value=e;const a=new Re(s,r),o=e.minFilter;return e.minFilter===qn&&(e.minFilter=mn),new wm(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e,n,s){const r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,s);t.setRenderTarget(r)}}const cl=new U,Cm=new U,Lm=new Vt;class ss{constructor(t=new U(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const s=cl.subVectors(n,e).cross(Cm.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const n=t.delta(cl),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||Lm.getNormalMatrix(t),s=this.coplanarPoint(cl).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const ts=new lr,La=new U;class qf{constructor(t=new ss,e=new ss,n=new ss,s=new ss,r=new ss,a=new ss){this.planes=[t,e,n,s,r,a]}set(t,e,n,s,r,a){const o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=ri){const n=this.planes,s=t.elements,r=s[0],a=s[1],o=s[2],l=s[3],c=s[4],h=s[5],u=s[6],f=s[7],d=s[8],g=s[9],_=s[10],m=s[11],p=s[12],x=s[13],y=s[14],M=s[15];if(n[0].setComponents(l-r,f-c,m-d,M-p).normalize(),n[1].setComponents(l+r,f+c,m+d,M+p).normalize(),n[2].setComponents(l+a,f+h,m+g,M+x).normalize(),n[3].setComponents(l-a,f-h,m-g,M-x).normalize(),n[4].setComponents(l-o,f-u,m-_,M-y).normalize(),e===ri)n[5].setComponents(l+o,f+u,m+_,M+y).normalize();else if(e===co)n[5].setComponents(o,u,_,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),ts.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),ts.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(ts)}intersectsSprite(t){return ts.center.set(0,0,0),ts.radius=.7071067811865476,ts.applyMatrix4(t.matrixWorld),this.intersectsSphere(ts)}intersectsSphere(t){const e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const s=e[n];if(La.x=s.normal.x>0?t.max.x:t.min.x,La.y=s.normal.y>0?t.max.y:t.min.y,La.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(La)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Yf(){let i=null,t=!1,e=null,n=null;function s(r,a){e(r,a),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Pm(i){const t=new WeakMap;function e(o,l){const c=o.array,h=o.usage,u=c.byteLength,f=i.createBuffer();i.bindBuffer(l,f),i.bufferData(l,c,h),o.onUploadCallback();let d;if(c instanceof Float32Array)d=i.FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?d=i.HALF_FLOAT:d=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=i.SHORT;else if(c instanceof Uint32Array)d=i.UNSIGNED_INT;else if(c instanceof Int32Array)d=i.INT;else if(c instanceof Int8Array)d=i.BYTE;else if(c instanceof Uint8Array)d=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,c){const h=l.array,u=l.updateRanges;if(i.bindBuffer(c,o),u.length===0)i.bufferSubData(c,0,h);else{u.sort((d,g)=>d.start-g.start);let f=0;for(let d=1;d<u.length;d++){const g=u[f],_=u[d];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++f,u[f]=_)}u.length=f+1;for(let d=0,g=u.length;d<g;d++){const _=u[d];i.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=t.get(o);l&&(i.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}class cs extends Ue{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};const r=t/2,a=e/2,o=Math.floor(n),l=Math.floor(s),c=o+1,h=l+1,u=t/o,f=e/l,d=[],g=[],_=[],m=[];for(let p=0;p<h;p++){const x=p*f-a;for(let y=0;y<c;y++){const M=y*u-r;g.push(M,-x,0),_.push(0,0,1),m.push(y/o),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let x=0;x<o;x++){const y=x+c*p,M=x+c*(p+1),C=x+1+c*(p+1),A=x+1+c*p;d.push(y,M,A),d.push(M,C,A)}this.setIndex(d),this.setAttribute("position",new en(g,3)),this.setAttribute("normal",new en(_,3)),this.setAttribute("uv",new en(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new cs(t.width,t.height,t.widthSegments,t.heightSegments)}}var Dm=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Im=`#ifdef USE_ALPHAHASH
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
#endif`,Nm=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Um=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,km=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Om=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,zm=`#ifdef USE_AOMAP
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
#endif`,Fm=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Bm=`#ifdef USE_BATCHING
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
#endif`,Hm=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Gm=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Vm=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Wm=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Xm=`#ifdef USE_IRIDESCENCE
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
#endif`,$m=`#ifdef USE_BUMPMAP
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
#endif`,qm=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Ym=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Km=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,jm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Zm=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Jm=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Qm=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,t0=`#if defined( USE_COLOR_ALPHA )
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
#endif`,e0=`#define PI 3.141592653589793
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
} // validated`,n0=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,i0=`vec3 transformedNormal = objectNormal;
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
#endif`,s0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,r0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,a0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,o0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,l0="gl_FragColor = linearToOutputTexel( gl_FragColor );",c0=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,h0=`#ifdef USE_ENVMAP
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
#endif`,u0=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,f0=`#ifdef USE_ENVMAP
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
#endif`,d0=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,p0=`#ifdef USE_ENVMAP
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
#endif`,m0=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,g0=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,_0=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,v0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,x0=`#ifdef USE_GRADIENTMAP
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
}`,M0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,y0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,S0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,E0=`uniform bool receiveShadow;
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
#endif`,b0=`#ifdef USE_ENVMAP
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
#endif`,T0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,A0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,w0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,R0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,C0=`PhysicalMaterial material;
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
#endif`,L0=`struct PhysicalMaterial {
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
}`,P0=`
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
#endif`,D0=`#if defined( RE_IndirectDiffuse )
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
#endif`,I0=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,N0=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,U0=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,k0=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,O0=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,z0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,F0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,B0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,H0=`#if defined( USE_POINTS_UV )
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
#endif`,G0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,V0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,W0=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,X0=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,$0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,q0=`#ifdef USE_MORPHTARGETS
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
#endif`,Y0=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,K0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,j0=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Z0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,J0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Q0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,tg=`#ifdef USE_NORMALMAP
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
#endif`,eg=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,ng=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,ig=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,sg=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,rg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,ag=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,og=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,lg=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,cg=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,hg=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,ug=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,fg=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,dg=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,pg=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,mg=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,gg=`float getShadowMask() {
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
}`,_g=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,vg=`#ifdef USE_SKINNING
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
#endif`,xg=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Mg=`#ifdef USE_SKINNING
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
#endif`,yg=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Sg=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Eg=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,bg=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Tg=`#ifdef USE_TRANSMISSION
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
#endif`,Ag=`#ifdef USE_TRANSMISSION
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
#endif`,wg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Rg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Cg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Lg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Pg=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Dg=`uniform sampler2D t2D;
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
}`,Ig=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ng=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Ug=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,kg=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Og=`#include <common>
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
}`,zg=`#if DEPTH_PACKING == 3200
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
}`,Fg=`#define DISTANCE
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
}`,Bg=`#define DISTANCE
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
}`,Hg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Gg=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Vg=`uniform float scale;
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
}`,Wg=`uniform vec3 diffuse;
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
}`,Xg=`#include <common>
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
}`,$g=`uniform vec3 diffuse;
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
}`,qg=`#define LAMBERT
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
}`,Yg=`#define LAMBERT
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
}`,Kg=`#define MATCAP
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
}`,jg=`#define MATCAP
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
}`,Zg=`#define NORMAL
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
}`,Jg=`#define NORMAL
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
}`,Qg=`#define PHONG
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
}`,t_=`#define PHONG
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
}`,e_=`#define STANDARD
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
}`,n_=`#define STANDARD
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
}`,i_=`#define TOON
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
}`,s_=`#define TOON
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
}`,r_=`uniform float size;
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
}`,a_=`uniform vec3 diffuse;
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
}`,o_=`#include <common>
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
}`,l_=`uniform vec3 color;
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
}`,c_=`uniform float rotation;
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
}`,h_=`uniform vec3 diffuse;
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
}`,qt={alphahash_fragment:Dm,alphahash_pars_fragment:Im,alphamap_fragment:Nm,alphamap_pars_fragment:Um,alphatest_fragment:km,alphatest_pars_fragment:Om,aomap_fragment:zm,aomap_pars_fragment:Fm,batching_pars_vertex:Bm,batching_vertex:Hm,begin_vertex:Gm,beginnormal_vertex:Vm,bsdfs:Wm,iridescence_fragment:Xm,bumpmap_pars_fragment:$m,clipping_planes_fragment:qm,clipping_planes_pars_fragment:Ym,clipping_planes_pars_vertex:Km,clipping_planes_vertex:jm,color_fragment:Zm,color_pars_fragment:Jm,color_pars_vertex:Qm,color_vertex:t0,common:e0,cube_uv_reflection_fragment:n0,defaultnormal_vertex:i0,displacementmap_pars_vertex:s0,displacementmap_vertex:r0,emissivemap_fragment:a0,emissivemap_pars_fragment:o0,colorspace_fragment:l0,colorspace_pars_fragment:c0,envmap_fragment:h0,envmap_common_pars_fragment:u0,envmap_pars_fragment:f0,envmap_pars_vertex:d0,envmap_physical_pars_fragment:b0,envmap_vertex:p0,fog_vertex:m0,fog_pars_vertex:g0,fog_fragment:_0,fog_pars_fragment:v0,gradientmap_pars_fragment:x0,lightmap_pars_fragment:M0,lights_lambert_fragment:y0,lights_lambert_pars_fragment:S0,lights_pars_begin:E0,lights_toon_fragment:T0,lights_toon_pars_fragment:A0,lights_phong_fragment:w0,lights_phong_pars_fragment:R0,lights_physical_fragment:C0,lights_physical_pars_fragment:L0,lights_fragment_begin:P0,lights_fragment_maps:D0,lights_fragment_end:I0,logdepthbuf_fragment:N0,logdepthbuf_pars_fragment:U0,logdepthbuf_pars_vertex:k0,logdepthbuf_vertex:O0,map_fragment:z0,map_pars_fragment:F0,map_particle_fragment:B0,map_particle_pars_fragment:H0,metalnessmap_fragment:G0,metalnessmap_pars_fragment:V0,morphinstance_vertex:W0,morphcolor_vertex:X0,morphnormal_vertex:$0,morphtarget_pars_vertex:q0,morphtarget_vertex:Y0,normal_fragment_begin:K0,normal_fragment_maps:j0,normal_pars_fragment:Z0,normal_pars_vertex:J0,normal_vertex:Q0,normalmap_pars_fragment:tg,clearcoat_normal_fragment_begin:eg,clearcoat_normal_fragment_maps:ng,clearcoat_pars_fragment:ig,iridescence_pars_fragment:sg,opaque_fragment:rg,packing:ag,premultiplied_alpha_fragment:og,project_vertex:lg,dithering_fragment:cg,dithering_pars_fragment:hg,roughnessmap_fragment:ug,roughnessmap_pars_fragment:fg,shadowmap_pars_fragment:dg,shadowmap_pars_vertex:pg,shadowmap_vertex:mg,shadowmask_pars_fragment:gg,skinbase_vertex:_g,skinning_pars_vertex:vg,skinning_vertex:xg,skinnormal_vertex:Mg,specularmap_fragment:yg,specularmap_pars_fragment:Sg,tonemapping_fragment:Eg,tonemapping_pars_fragment:bg,transmission_fragment:Tg,transmission_pars_fragment:Ag,uv_pars_fragment:wg,uv_pars_vertex:Rg,uv_vertex:Cg,worldpos_vertex:Lg,background_vert:Pg,background_frag:Dg,backgroundCube_vert:Ig,backgroundCube_frag:Ng,cube_vert:Ug,cube_frag:kg,depth_vert:Og,depth_frag:zg,distanceRGBA_vert:Fg,distanceRGBA_frag:Bg,equirect_vert:Hg,equirect_frag:Gg,linedashed_vert:Vg,linedashed_frag:Wg,meshbasic_vert:Xg,meshbasic_frag:$g,meshlambert_vert:qg,meshlambert_frag:Yg,meshmatcap_vert:Kg,meshmatcap_frag:jg,meshnormal_vert:Zg,meshnormal_frag:Jg,meshphong_vert:Qg,meshphong_frag:t_,meshphysical_vert:e_,meshphysical_frag:n_,meshtoon_vert:i_,meshtoon_frag:s_,points_vert:r_,points_frag:a_,shadow_vert:o_,shadow_frag:l_,sprite_vert:c_,sprite_frag:h_},lt={common:{diffuse:{value:new oe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Vt},alphaMap:{value:null},alphaMapTransform:{value:new Vt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Vt}},envmap:{envMap:{value:null},envMapRotation:{value:new Vt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Vt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Vt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Vt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Vt},normalScale:{value:new Kt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Vt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Vt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Vt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Vt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new oe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new oe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Vt},alphaTest:{value:0},uvTransform:{value:new Vt}},sprite:{diffuse:{value:new oe(16777215)},opacity:{value:1},center:{value:new Kt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Vt},alphaMap:{value:null},alphaMapTransform:{value:new Vt},alphaTest:{value:0}}},Wn={basic:{uniforms:Ke([lt.common,lt.specularmap,lt.envmap,lt.aomap,lt.lightmap,lt.fog]),vertexShader:qt.meshbasic_vert,fragmentShader:qt.meshbasic_frag},lambert:{uniforms:Ke([lt.common,lt.specularmap,lt.envmap,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.fog,lt.lights,{emissive:{value:new oe(0)}}]),vertexShader:qt.meshlambert_vert,fragmentShader:qt.meshlambert_frag},phong:{uniforms:Ke([lt.common,lt.specularmap,lt.envmap,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.fog,lt.lights,{emissive:{value:new oe(0)},specular:{value:new oe(1118481)},shininess:{value:30}}]),vertexShader:qt.meshphong_vert,fragmentShader:qt.meshphong_frag},standard:{uniforms:Ke([lt.common,lt.envmap,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.roughnessmap,lt.metalnessmap,lt.fog,lt.lights,{emissive:{value:new oe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:qt.meshphysical_vert,fragmentShader:qt.meshphysical_frag},toon:{uniforms:Ke([lt.common,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.gradientmap,lt.fog,lt.lights,{emissive:{value:new oe(0)}}]),vertexShader:qt.meshtoon_vert,fragmentShader:qt.meshtoon_frag},matcap:{uniforms:Ke([lt.common,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.fog,{matcap:{value:null}}]),vertexShader:qt.meshmatcap_vert,fragmentShader:qt.meshmatcap_frag},points:{uniforms:Ke([lt.points,lt.fog]),vertexShader:qt.points_vert,fragmentShader:qt.points_frag},dashed:{uniforms:Ke([lt.common,lt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:qt.linedashed_vert,fragmentShader:qt.linedashed_frag},depth:{uniforms:Ke([lt.common,lt.displacementmap]),vertexShader:qt.depth_vert,fragmentShader:qt.depth_frag},normal:{uniforms:Ke([lt.common,lt.bumpmap,lt.normalmap,lt.displacementmap,{opacity:{value:1}}]),vertexShader:qt.meshnormal_vert,fragmentShader:qt.meshnormal_frag},sprite:{uniforms:Ke([lt.sprite,lt.fog]),vertexShader:qt.sprite_vert,fragmentShader:qt.sprite_frag},background:{uniforms:{uvTransform:{value:new Vt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:qt.background_vert,fragmentShader:qt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Vt}},vertexShader:qt.backgroundCube_vert,fragmentShader:qt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:qt.cube_vert,fragmentShader:qt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:qt.equirect_vert,fragmentShader:qt.equirect_frag},distanceRGBA:{uniforms:Ke([lt.common,lt.displacementmap,{referencePosition:{value:new U},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:qt.distanceRGBA_vert,fragmentShader:qt.distanceRGBA_frag},shadow:{uniforms:Ke([lt.lights,lt.fog,{color:{value:new oe(0)},opacity:{value:1}}]),vertexShader:qt.shadow_vert,fragmentShader:qt.shadow_frag}};Wn.physical={uniforms:Ke([Wn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Vt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Vt},clearcoatNormalScale:{value:new Kt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Vt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Vt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Vt},sheen:{value:0},sheenColor:{value:new oe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Vt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Vt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Vt},transmissionSamplerSize:{value:new Kt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Vt},attenuationDistance:{value:0},attenuationColor:{value:new oe(0)},specularColor:{value:new oe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Vt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Vt},anisotropyVector:{value:new Kt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Vt}}]),vertexShader:qt.meshphysical_vert,fragmentShader:qt.meshphysical_frag};const Pa={r:0,b:0,g:0},es=new di,u_=new be;function f_(i,t,e,n,s,r,a){const o=new oe(0);let l=r===!0?0:1,c,h,u=null,f=0,d=null;function g(x){let y=x.isScene===!0?x.background:null;return y&&y.isTexture&&(y=(x.backgroundBlurriness>0?e:t).get(y)),y}function _(x){let y=!1;const M=g(x);M===null?p(o,l):M&&M.isColor&&(p(M,1),y=!0);const C=i.xr.getEnvironmentBlendMode();C==="additive"?n.buffers.color.setClear(0,0,0,1,a):C==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||y)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(x,y){const M=g(y);M&&(M.isCubeTexture||M.mapping===bo)?(h===void 0&&(h=new Re(new Vi(1,1,1),new Bn({name:"BackgroundCubeMaterial",uniforms:nr(Wn.backgroundCube.uniforms),vertexShader:Wn.backgroundCube.vertexShader,fragmentShader:Wn.backgroundCube.fragmentShader,side:Qe,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(C,A,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),es.copy(y.backgroundRotation),es.x*=-1,es.y*=-1,es.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(es.y*=-1,es.z*=-1),h.material.uniforms.envMap.value=M,h.material.uniforms.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=y.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(u_.makeRotationFromEuler(es)),h.material.toneMapped=re.getTransfer(M.colorSpace)!==de,(u!==M||f!==M.version||d!==i.toneMapping)&&(h.material.needsUpdate=!0,u=M,f=M.version,d=i.toneMapping),h.layers.enableAll(),x.unshift(h,h.geometry,h.material,0,0,null)):M&&M.isTexture&&(c===void 0&&(c=new Re(new cs(2,2),new Bn({name:"BackgroundMaterial",uniforms:nr(Wn.background.uniforms),vertexShader:Wn.background.vertexShader,fragmentShader:Wn.background.fragmentShader,side:ui,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=M,c.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,c.material.toneMapped=re.getTransfer(M.colorSpace)!==de,M.matrixAutoUpdate===!0&&M.updateMatrix(),c.material.uniforms.uvTransform.value.copy(M.matrix),(u!==M||f!==M.version||d!==i.toneMapping)&&(c.material.needsUpdate=!0,u=M,f=M.version,d=i.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null))}function p(x,y){x.getRGB(Pa,Wf(i)),n.buffers.color.setClear(Pa.r,Pa.g,Pa.b,y,a)}return{getClearColor:function(){return o},setClearColor:function(x,y=1){o.set(x),l=y,p(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(x){l=x,p(o,l)},render:_,addToRenderList:m}}function d_(i,t){const e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=f(null);let r=s,a=!1;function o(b,I,K,H,q){let Z=!1;const $=u(H,K,I);r!==$&&(r=$,c(r.object)),Z=d(b,H,K,q),Z&&g(b,H,K,q),q!==null&&t.update(q,i.ELEMENT_ARRAY_BUFFER),(Z||a)&&(a=!1,M(b,I,K,H),q!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(q).buffer))}function l(){return i.createVertexArray()}function c(b){return i.bindVertexArray(b)}function h(b){return i.deleteVertexArray(b)}function u(b,I,K){const H=K.wireframe===!0;let q=n[b.id];q===void 0&&(q={},n[b.id]=q);let Z=q[I.id];Z===void 0&&(Z={},q[I.id]=Z);let $=Z[H];return $===void 0&&($=f(l()),Z[H]=$),$}function f(b){const I=[],K=[],H=[];for(let q=0;q<e;q++)I[q]=0,K[q]=0,H[q]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:I,enabledAttributes:K,attributeDivisors:H,object:b,attributes:{},index:null}}function d(b,I,K,H){const q=r.attributes,Z=I.attributes;let $=0;const nt=K.getAttributes();for(const W in nt)if(nt[W].location>=0){const _t=q[W];let Ct=Z[W];if(Ct===void 0&&(W==="instanceMatrix"&&b.instanceMatrix&&(Ct=b.instanceMatrix),W==="instanceColor"&&b.instanceColor&&(Ct=b.instanceColor)),_t===void 0||_t.attribute!==Ct||Ct&&_t.data!==Ct.data)return!0;$++}return r.attributesNum!==$||r.index!==H}function g(b,I,K,H){const q={},Z=I.attributes;let $=0;const nt=K.getAttributes();for(const W in nt)if(nt[W].location>=0){let _t=Z[W];_t===void 0&&(W==="instanceMatrix"&&b.instanceMatrix&&(_t=b.instanceMatrix),W==="instanceColor"&&b.instanceColor&&(_t=b.instanceColor));const Ct={};Ct.attribute=_t,_t&&_t.data&&(Ct.data=_t.data),q[W]=Ct,$++}r.attributes=q,r.attributesNum=$,r.index=H}function _(){const b=r.newAttributes;for(let I=0,K=b.length;I<K;I++)b[I]=0}function m(b){p(b,0)}function p(b,I){const K=r.newAttributes,H=r.enabledAttributes,q=r.attributeDivisors;K[b]=1,H[b]===0&&(i.enableVertexAttribArray(b),H[b]=1),q[b]!==I&&(i.vertexAttribDivisor(b,I),q[b]=I)}function x(){const b=r.newAttributes,I=r.enabledAttributes;for(let K=0,H=I.length;K<H;K++)I[K]!==b[K]&&(i.disableVertexAttribArray(K),I[K]=0)}function y(b,I,K,H,q,Z,$){$===!0?i.vertexAttribIPointer(b,I,K,q,Z):i.vertexAttribPointer(b,I,K,H,q,Z)}function M(b,I,K,H){_();const q=H.attributes,Z=K.getAttributes(),$=I.defaultAttributeValues;for(const nt in Z){const W=Z[nt];if(W.location>=0){let ct=q[nt];if(ct===void 0&&(nt==="instanceMatrix"&&b.instanceMatrix&&(ct=b.instanceMatrix),nt==="instanceColor"&&b.instanceColor&&(ct=b.instanceColor)),ct!==void 0){const _t=ct.normalized,Ct=ct.itemSize,Wt=t.get(ct);if(Wt===void 0)continue;const ce=Wt.buffer,Y=Wt.type,it=Wt.bytesPerElement,St=Y===i.INT||Y===i.UNSIGNED_INT||ct.gpuType===Gc;if(ct.isInterleavedBufferAttribute){const ot=ct.data,It=ot.stride,Ot=ct.offset;if(ot.isInstancedInterleavedBuffer){for(let Xt=0;Xt<W.locationSize;Xt++)p(W.location+Xt,ot.meshPerAttribute);b.isInstancedMesh!==!0&&H._maxInstanceCount===void 0&&(H._maxInstanceCount=ot.meshPerAttribute*ot.count)}else for(let Xt=0;Xt<W.locationSize;Xt++)m(W.location+Xt);i.bindBuffer(i.ARRAY_BUFFER,ce);for(let Xt=0;Xt<W.locationSize;Xt++)y(W.location+Xt,Ct/W.locationSize,Y,_t,It*it,(Ot+Ct/W.locationSize*Xt)*it,St)}else{if(ct.isInstancedBufferAttribute){for(let ot=0;ot<W.locationSize;ot++)p(W.location+ot,ct.meshPerAttribute);b.isInstancedMesh!==!0&&H._maxInstanceCount===void 0&&(H._maxInstanceCount=ct.meshPerAttribute*ct.count)}else for(let ot=0;ot<W.locationSize;ot++)m(W.location+ot);i.bindBuffer(i.ARRAY_BUFFER,ce);for(let ot=0;ot<W.locationSize;ot++)y(W.location+ot,Ct/W.locationSize,Y,_t,Ct*it,Ct/W.locationSize*ot*it,St)}}else if($!==void 0){const _t=$[nt];if(_t!==void 0)switch(_t.length){case 2:i.vertexAttrib2fv(W.location,_t);break;case 3:i.vertexAttrib3fv(W.location,_t);break;case 4:i.vertexAttrib4fv(W.location,_t);break;default:i.vertexAttrib1fv(W.location,_t)}}}}x()}function C(){D();for(const b in n){const I=n[b];for(const K in I){const H=I[K];for(const q in H)h(H[q].object),delete H[q];delete I[K]}delete n[b]}}function A(b){if(n[b.id]===void 0)return;const I=n[b.id];for(const K in I){const H=I[K];for(const q in H)h(H[q].object),delete H[q];delete I[K]}delete n[b.id]}function w(b){for(const I in n){const K=n[I];if(K[b.id]===void 0)continue;const H=K[b.id];for(const q in H)h(H[q].object),delete H[q];delete K[b.id]}}function D(){T(),a=!0,r!==s&&(r=s,c(r.object))}function T(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:D,resetDefaultState:T,dispose:C,releaseStatesOfGeometry:A,releaseStatesOfProgram:w,initAttributes:_,enableAttribute:m,disableUnusedAttributes:x}}function p_(i,t,e){let n;function s(c){n=c}function r(c,h){i.drawArrays(n,c,h),e.update(h,n,1)}function a(c,h,u){u!==0&&(i.drawArraysInstanced(n,c,h,u),e.update(h,n,u))}function o(c,h,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let d=0;for(let g=0;g<u;g++)d+=h[g];e.update(d,n,1)}function l(c,h,u,f){if(u===0)return;const d=t.get("WEBGL_multi_draw");if(d===null)for(let g=0;g<c.length;g++)a(c[g],h[g],f[g]);else{d.multiDrawArraysInstancedWEBGL(n,c,0,h,0,f,0,u);let g=0;for(let _=0;_<u;_++)g+=h[_]*f[_];e.update(g,n,1)}}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function m_(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){const w=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(w){return!(w!==bn&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(w){const D=w===ia&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(w!==fi&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&w!==si&&!D)}function l(w){if(w==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=e.logarithmicDepthBuffer===!0,f=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control"),d=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),x=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),y=i.getParameter(i.MAX_VARYING_VECTORS),M=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),C=g>0,A=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reverseDepthBuffer:f,maxTextures:d,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:x,maxVaryings:y,maxFragmentUniforms:M,vertexTextures:C,maxSamples:A}}function g_(i){const t=this;let e=null,n=0,s=!1,r=!1;const a=new ss,o=new Vt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){const d=u.length!==0||f||n!==0||s;return s=f,n=u.length,d},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,f){e=h(u,f,0)},this.setState=function(u,f,d){const g=u.clippingPlanes,_=u.clipIntersection,m=u.clipShadows,p=i.get(u);if(!s||g===null||g.length===0||r&&!m)r?h(null):c();else{const x=r?0:n,y=x*4;let M=p.clippingState||null;l.value=M,M=h(g,f,y,d);for(let C=0;C!==y;++C)M[C]=e[C];p.clippingState=M,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=x}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(u,f,d,g){const _=u!==null?u.length:0;let m=null;if(_!==0){if(m=l.value,g!==!0||m===null){const p=d+_*4,x=f.matrixWorldInverse;o.getNormalMatrix(x),(m===null||m.length<p)&&(m=new Float32Array(p));for(let y=0,M=d;y!==_;++y,M+=4)a.copy(u[y]).applyMatrix4(x,o),a.normal.toArray(m,M),m[M+3]=a.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,m}}function __(i){let t=new WeakMap;function e(a,o){return o===$l?a.mapping=Js:o===ql&&(a.mapping=Qs),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===$l||o===ql)if(t.has(a)){const l=t.get(a).texture;return e(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new Rm(l.height);return c.fromEquirectangularTexture(i,a),t.set(a,c),a.addEventListener("dispose",s),e(c.texture,a.mapping)}else return null}}return a}function s(a){const o=a.target;o.removeEventListener("dispose",s);const l=t.get(o);l!==void 0&&(t.delete(o),l.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}class v_ extends Xf{constructor(t=-1,e=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-t,a=n+t,o=s+e,l=s-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}const Vs=4,$h=[.125,.215,.35,.446,.526,.582],os=20,hl=new v_,qh=new oe;let ul=null,fl=0,dl=0,pl=!1;const rs=(1+Math.sqrt(5))/2,Ns=1/rs,Yh=[new U(-rs,Ns,0),new U(rs,Ns,0),new U(-Ns,0,rs),new U(Ns,0,rs),new U(0,rs,-Ns),new U(0,rs,Ns),new U(-1,1,-1),new U(1,1,-1),new U(-1,1,1),new U(1,1,1)];class Kh{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,s=100){ul=this._renderer.getRenderTarget(),fl=this._renderer.getActiveCubeFace(),dl=this._renderer.getActiveMipmapLevel(),pl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,n,s,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Jh(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Zh(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(ul,fl,dl),this._renderer.xr.enabled=pl,t.scissorTest=!1,Da(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Js||t.mapping===Qs?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),ul=this._renderer.getRenderTarget(),fl=this._renderer.getActiveCubeFace(),dl=this._renderer.getActiveMipmapLevel(),pl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:mn,minFilter:mn,generateMipmaps:!1,type:ia,format:bn,colorSpace:ar,depthBuffer:!1},s=jh(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=jh(t,e,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=x_(r)),this._blurMaterial=M_(r,t,e)}return s}_compileMaterial(t){const e=new Re(this._lodPlanes[0],t);this._renderer.compile(e,hl)}_sceneToCubeUV(t,e,n,s){const o=new yn(90,1,e,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,f=h.toneMapping;h.getClearColor(qh),h.toneMapping=Oi,h.autoClear=!1;const d=new Fi({name:"PMREM.Background",side:Qe,depthWrite:!1,depthTest:!1}),g=new Re(new Vi,d);let _=!1;const m=t.background;m?m.isColor&&(d.color.copy(m),t.background=null,_=!0):(d.color.copy(qh),_=!0);for(let p=0;p<6;p++){const x=p%3;x===0?(o.up.set(0,l[p],0),o.lookAt(c[p],0,0)):x===1?(o.up.set(0,0,l[p]),o.lookAt(0,c[p],0)):(o.up.set(0,l[p],0),o.lookAt(0,0,c[p]));const y=this._cubeSize;Da(s,x*y,p>2?y:0,y,y),h.setRenderTarget(s),_&&h.render(g,o),h.render(t,o)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=f,h.autoClear=u,t.background=m}_textureToCubeUV(t,e){const n=this._renderer,s=t.mapping===Js||t.mapping===Qs;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Jh()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Zh());const r=s?this._cubemapMaterial:this._equirectMaterial,a=new Re(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=t;const l=this._cubeSize;Da(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(a,hl)}_applyPMREM(t){const e=this._renderer,n=e.autoClear;e.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=Yh[(s-r-1)%Yh.length];this._blur(t,r-1,r,a,o)}e.autoClear=n}_blur(t,e,n,s,r){const a=this._pingPongRenderTarget;this._halfBlur(t,a,e,n,s,"latitudinal",r),this._halfBlur(a,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new Re(this._lodPlanes[s],c),f=c.uniforms,d=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*d):2*Math.PI/(2*os-1),_=r/g,m=isFinite(r)?1+Math.floor(h*_):os;m>os&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${os}`);const p=[];let x=0;for(let w=0;w<os;++w){const D=w/_,T=Math.exp(-D*D/2);p.push(T),w===0?x+=T:w<m&&(x+=2*T)}for(let w=0;w<p.length;w++)p[w]=p[w]/x;f.envMap.value=t.texture,f.samples.value=m,f.weights.value=p,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);const{_lodMax:y}=this;f.dTheta.value=g,f.mipInt.value=y-n;const M=this._sizeLods[s],C=3*M*(s>y-Vs?s-y+Vs:0),A=4*(this._cubeSize-M);Da(e,C,A,3*M,2*M),l.setRenderTarget(e),l.render(u,hl)}}function x_(i){const t=[],e=[],n=[];let s=i;const r=i-Vs+1+$h.length;for(let a=0;a<r;a++){const o=Math.pow(2,s);e.push(o);let l=1/o;a>i-Vs?l=$h[a-i+Vs-1]:a===0&&(l=0),n.push(l);const c=1/(o-2),h=-c,u=1+c,f=[h,h,u,h,u,u,h,h,u,u,h,u],d=6,g=6,_=3,m=2,p=1,x=new Float32Array(_*g*d),y=new Float32Array(m*g*d),M=new Float32Array(p*g*d);for(let A=0;A<d;A++){const w=A%3*2/3-1,D=A>2?0:-1,T=[w,D,0,w+2/3,D,0,w+2/3,D+1,0,w,D,0,w+2/3,D+1,0,w,D+1,0];x.set(T,_*g*A),y.set(f,m*g*A);const b=[A,A,A,A,A,A];M.set(b,p*g*A)}const C=new Ue;C.setAttribute("position",new Ne(x,_)),C.setAttribute("uv",new Ne(y,m)),C.setAttribute("faceIndex",new Ne(M,p)),t.push(C),s>Vs&&s--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function jh(i,t,e){const n=new ds(i,t,e);return n.texture.mapping=bo,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Da(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function M_(i,t,e){const n=new Float32Array(os),s=new U(0,1,0);return new Bn({name:"SphericalGaussianBlur",defines:{n:os,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Kc(),fragmentShader:`

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
		`,blending:ki,depthTest:!1,depthWrite:!1})}function Zh(){return new Bn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Kc(),fragmentShader:`

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
		`,blending:ki,depthTest:!1,depthWrite:!1})}function Jh(){return new Bn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Kc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:ki,depthTest:!1,depthWrite:!1})}function Kc(){return`

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
	`}function y_(i){let t=new WeakMap,e=null;function n(o){if(o&&o.isTexture){const l=o.mapping,c=l===$l||l===ql,h=l===Js||l===Qs;if(c||h){let u=t.get(o);const f=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==f)return e===null&&(e=new Kh(i)),u=c?e.fromEquirectangular(o,u):e.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),u.texture;if(u!==void 0)return u.texture;{const d=o.image;return c&&d&&d.height>0||h&&d&&s(d)?(e===null&&(e=new Kh(i)),u=c?e.fromEquirectangular(o):e.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),o.addEventListener("dispose",r),u.texture):null}}}return o}function s(o){let l=0;const c=6;for(let h=0;h<c;h++)o[h]!==void 0&&l++;return l===c}function r(o){const l=o.target;l.removeEventListener("dispose",r);const c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function a(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:a}}function S_(i){const t={};function e(n){if(t[n]!==void 0)return t[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const s=e(n);return s===null&&Pr("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function E_(i,t,e,n){const s={},r=new WeakMap;function a(u){const f=u.target;f.index!==null&&t.remove(f.index);for(const g in f.attributes)t.remove(f.attributes[g]);for(const g in f.morphAttributes){const _=f.morphAttributes[g];for(let m=0,p=_.length;m<p;m++)t.remove(_[m])}f.removeEventListener("dispose",a),delete s[f.id];const d=r.get(f);d&&(t.remove(d),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,e.memory.geometries--}function o(u,f){return s[f.id]===!0||(f.addEventListener("dispose",a),s[f.id]=!0,e.memory.geometries++),f}function l(u){const f=u.attributes;for(const g in f)t.update(f[g],i.ARRAY_BUFFER);const d=u.morphAttributes;for(const g in d){const _=d[g];for(let m=0,p=_.length;m<p;m++)t.update(_[m],i.ARRAY_BUFFER)}}function c(u){const f=[],d=u.index,g=u.attributes.position;let _=0;if(d!==null){const x=d.array;_=d.version;for(let y=0,M=x.length;y<M;y+=3){const C=x[y+0],A=x[y+1],w=x[y+2];f.push(C,A,A,w,w,C)}}else if(g!==void 0){const x=g.array;_=g.version;for(let y=0,M=x.length/3-1;y<M;y+=3){const C=y+0,A=y+1,w=y+2;f.push(C,A,A,w,w,C)}}else return;const m=new(Of(f)?Vf:Gf)(f,1);m.version=_;const p=r.get(u);p&&t.remove(p),r.set(u,m)}function h(u){const f=r.get(u);if(f){const d=u.index;d!==null&&f.version<d.version&&c(u)}else c(u);return r.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function b_(i,t,e){let n;function s(f){n=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function l(f,d){i.drawElements(n,d,r,f*a),e.update(d,n,1)}function c(f,d,g){g!==0&&(i.drawElementsInstanced(n,d,r,f*a,g),e.update(d,n,g))}function h(f,d,g){if(g===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,f,0,g);let m=0;for(let p=0;p<g;p++)m+=d[p];e.update(m,n,1)}function u(f,d,g,_){if(g===0)return;const m=t.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<f.length;p++)c(f[p]/a,d[p],_[p]);else{m.multiDrawElementsInstancedWEBGL(n,d,0,r,f,0,_,0,g);let p=0;for(let x=0;x<g;x++)p+=d[x]*_[x];e.update(p,n,1)}}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function T_(i){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case i.TRIANGLES:e.triangles+=o*(r/3);break;case i.LINES:e.lines+=o*(r/2);break;case i.LINE_STRIP:e.lines+=o*(r-1);break;case i.LINE_LOOP:e.lines+=o*r;break;case i.POINTS:e.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function A_(i,t,e){const n=new WeakMap,s=new Pe;function r(a,o,l){const c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0;let f=n.get(o);if(f===void 0||f.count!==u){let T=function(){w.dispose(),n.delete(o),o.removeEventListener("dispose",T)};f!==void 0&&f.texture.dispose();const d=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,_=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],x=o.morphAttributes.color||[];let y=0;d===!0&&(y=1),g===!0&&(y=2),_===!0&&(y=3);let M=o.attributes.position.count*y,C=1;M>t.maxTextureSize&&(C=Math.ceil(M/t.maxTextureSize),M=t.maxTextureSize);const A=new Float32Array(M*C*4*u),w=new Ff(A,M,C,u);w.type=si,w.needsUpdate=!0;const D=y*4;for(let b=0;b<u;b++){const I=m[b],K=p[b],H=x[b],q=M*C*4*b;for(let Z=0;Z<I.count;Z++){const $=Z*D;d===!0&&(s.fromBufferAttribute(I,Z),A[q+$+0]=s.x,A[q+$+1]=s.y,A[q+$+2]=s.z,A[q+$+3]=0),g===!0&&(s.fromBufferAttribute(K,Z),A[q+$+4]=s.x,A[q+$+5]=s.y,A[q+$+6]=s.z,A[q+$+7]=0),_===!0&&(s.fromBufferAttribute(H,Z),A[q+$+8]=s.x,A[q+$+9]=s.y,A[q+$+10]=s.z,A[q+$+11]=H.itemSize===4?s.w:1)}}f={count:u,texture:w,size:new Kt(M,C)},n.set(o,f),o.addEventListener("dispose",T)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,e);else{let d=0;for(let _=0;_<c.length;_++)d+=c[_];const g=o.morphTargetsRelative?1:1-d;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",f.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",f.size)}return{update:r}}function w_(i,t,e,n){let s=new WeakMap;function r(l){const c=n.render.frame,h=l.geometry,u=t.get(l,h);if(s.get(u)!==c&&(t.update(u),s.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),s.get(l)!==c&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const f=l.skeleton;s.get(f)!==c&&(f.update(),s.set(f,c))}return u}function a(){s=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:a}}class Kf extends $e{constructor(t,e,n,s,r,a,o,l,c,h=Ys){if(h!==Ys&&h!==er)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===Ys&&(n=fs),n===void 0&&h===er&&(n=tr),super(null,s,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=o!==void 0?o:tn,this.minFilter=l!==void 0?l:tn,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}const jf=new $e,Qh=new Kf(1,1),Zf=new Ff,Jf=new fm,Qf=new $f,tu=[],eu=[],nu=new Float32Array(16),iu=new Float32Array(9),su=new Float32Array(4);function cr(i,t,e){const n=i[0];if(n<=0||n>0)return i;const s=t*e;let r=tu[s];if(r===void 0&&(r=new Float32Array(s),tu[s]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,i[a].toArray(r,o)}return r}function ke(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Oe(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function Ao(i,t){let e=eu[t];e===void 0&&(e=new Int32Array(t),eu[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function R_(i,t){const e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function C_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ke(e,t))return;i.uniform2fv(this.addr,t),Oe(e,t)}}function L_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(ke(e,t))return;i.uniform3fv(this.addr,t),Oe(e,t)}}function P_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ke(e,t))return;i.uniform4fv(this.addr,t),Oe(e,t)}}function D_(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(ke(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Oe(e,t)}else{if(ke(e,n))return;su.set(n),i.uniformMatrix2fv(this.addr,!1,su),Oe(e,n)}}function I_(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(ke(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Oe(e,t)}else{if(ke(e,n))return;iu.set(n),i.uniformMatrix3fv(this.addr,!1,iu),Oe(e,n)}}function N_(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(ke(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Oe(e,t)}else{if(ke(e,n))return;nu.set(n),i.uniformMatrix4fv(this.addr,!1,nu),Oe(e,n)}}function U_(i,t){const e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function k_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ke(e,t))return;i.uniform2iv(this.addr,t),Oe(e,t)}}function O_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(ke(e,t))return;i.uniform3iv(this.addr,t),Oe(e,t)}}function z_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ke(e,t))return;i.uniform4iv(this.addr,t),Oe(e,t)}}function F_(i,t){const e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function B_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ke(e,t))return;i.uniform2uiv(this.addr,t),Oe(e,t)}}function H_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(ke(e,t))return;i.uniform3uiv(this.addr,t),Oe(e,t)}}function G_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ke(e,t))return;i.uniform4uiv(this.addr,t),Oe(e,t)}}function V_(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Qh.compareFunction=kf,r=Qh):r=jf,e.setTexture2D(t||r,s)}function W_(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||Jf,s)}function X_(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||Qf,s)}function $_(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||Zf,s)}function q_(i){switch(i){case 5126:return R_;case 35664:return C_;case 35665:return L_;case 35666:return P_;case 35674:return D_;case 35675:return I_;case 35676:return N_;case 5124:case 35670:return U_;case 35667:case 35671:return k_;case 35668:case 35672:return O_;case 35669:case 35673:return z_;case 5125:return F_;case 36294:return B_;case 36295:return H_;case 36296:return G_;case 35678:case 36198:case 36298:case 36306:case 35682:return V_;case 35679:case 36299:case 36307:return W_;case 35680:case 36300:case 36308:case 36293:return X_;case 36289:case 36303:case 36311:case 36292:return $_}}function Y_(i,t){i.uniform1fv(this.addr,t)}function K_(i,t){const e=cr(t,this.size,2);i.uniform2fv(this.addr,e)}function j_(i,t){const e=cr(t,this.size,3);i.uniform3fv(this.addr,e)}function Z_(i,t){const e=cr(t,this.size,4);i.uniform4fv(this.addr,e)}function J_(i,t){const e=cr(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function Q_(i,t){const e=cr(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function tv(i,t){const e=cr(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function ev(i,t){i.uniform1iv(this.addr,t)}function nv(i,t){i.uniform2iv(this.addr,t)}function iv(i,t){i.uniform3iv(this.addr,t)}function sv(i,t){i.uniform4iv(this.addr,t)}function rv(i,t){i.uniform1uiv(this.addr,t)}function av(i,t){i.uniform2uiv(this.addr,t)}function ov(i,t){i.uniform3uiv(this.addr,t)}function lv(i,t){i.uniform4uiv(this.addr,t)}function cv(i,t,e){const n=this.cache,s=t.length,r=Ao(e,s);ke(n,r)||(i.uniform1iv(this.addr,r),Oe(n,r));for(let a=0;a!==s;++a)e.setTexture2D(t[a]||jf,r[a])}function hv(i,t,e){const n=this.cache,s=t.length,r=Ao(e,s);ke(n,r)||(i.uniform1iv(this.addr,r),Oe(n,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||Jf,r[a])}function uv(i,t,e){const n=this.cache,s=t.length,r=Ao(e,s);ke(n,r)||(i.uniform1iv(this.addr,r),Oe(n,r));for(let a=0;a!==s;++a)e.setTextureCube(t[a]||Qf,r[a])}function fv(i,t,e){const n=this.cache,s=t.length,r=Ao(e,s);ke(n,r)||(i.uniform1iv(this.addr,r),Oe(n,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||Zf,r[a])}function dv(i){switch(i){case 5126:return Y_;case 35664:return K_;case 35665:return j_;case 35666:return Z_;case 35674:return J_;case 35675:return Q_;case 35676:return tv;case 5124:case 35670:return ev;case 35667:case 35671:return nv;case 35668:case 35672:return iv;case 35669:case 35673:return sv;case 5125:return rv;case 36294:return av;case 36295:return ov;case 36296:return lv;case 35678:case 36198:case 36298:case 36306:case 35682:return cv;case 35679:case 36299:case 36307:return hv;case 35680:case 36300:case 36308:case 36293:return uv;case 36289:case 36303:case 36311:case 36292:return fv}}class pv{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=q_(e.type)}}class mv{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=dv(e.type)}}class gv{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(t,e[o.id],n)}}}const ml=/(\w+)(\])?(\[|\.)?/g;function ru(i,t){i.seq.push(t),i.map[t.id]=t}function _v(i,t,e){const n=i.name,s=n.length;for(ml.lastIndex=0;;){const r=ml.exec(n),a=ml.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){ru(e,c===void 0?new pv(o,i,t):new mv(o,i,t));break}else{let u=e.map[o];u===void 0&&(u=new gv(o),ru(e,u)),e=u}}}class eo{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=t.getActiveUniform(e,s),a=t.getUniformLocation(e,r.name);_v(r,a,this)}}setValue(t,e,n,s){const r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){const s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,a=e.length;r!==a;++r){const o=e[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,e){const n=[];for(let s=0,r=t.length;s!==r;++s){const a=t[s];a.id in e&&n.push(a)}return n}}function au(i,t,e){const n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}const vv=37297;let xv=0;function Mv(i,t){const e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){const o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}const ou=new Vt;function yv(i){re._getMatrix(ou,re.workingColorSpace,i);const t=`mat3( ${ou.elements.map(e=>e.toFixed(4))} )`;switch(re.getTransfer(i)){case To:return[t,"LinearTransferOETF"];case de:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function lu(i,t,e){const n=i.getShaderParameter(t,i.COMPILE_STATUS),s=i.getShaderInfoLog(t).trim();if(n&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const a=parseInt(r[1]);return e.toUpperCase()+`

`+s+`

`+Mv(i.getShaderSource(t),a)}else return s}function Sv(i,t){const e=yv(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}function Ev(i,t){let e;switch(t){case zp:e="Linear";break;case Fp:e="Reinhard";break;case Bp:e="Cineon";break;case Hp:e="ACESFilmic";break;case Vp:e="AgX";break;case Wp:e="Neutral";break;case Gp:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const Ia=new U;function bv(){re.getLuminanceCoefficients(Ia);const i=Ia.x.toFixed(4),t=Ia.y.toFixed(4),e=Ia.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Tv(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Dr).join(`
`)}function Av(i){const t=[];for(const e in i){const n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function wv(i,t){const e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(t,s),a=r.name;let o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:i.getAttribLocation(t,a),locationSize:o}}return e}function Dr(i){return i!==""}function cu(i,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function hu(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const Rv=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ec(i){return i.replace(Rv,Lv)}const Cv=new Map;function Lv(i,t){let e=qt[t];if(e===void 0){const n=Cv.get(t);if(n!==void 0)e=qt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return Ec(e)}const Pv=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function uu(i){return i.replace(Pv,Dv)}function Dv(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function fu(i){let t=`precision ${i.precision} float;
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
#define LOW_PRECISION`),t}function Iv(i){let t="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===Ef?t="SHADOWMAP_TYPE_PCF":i.shadowMapType===_p?t="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===ii&&(t="SHADOWMAP_TYPE_VSM"),t}function Nv(i){let t="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Js:case Qs:t="ENVMAP_TYPE_CUBE";break;case bo:t="ENVMAP_TYPE_CUBE_UV";break}return t}function Uv(i){let t="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case Qs:t="ENVMAP_MODE_REFRACTION";break}return t}function kv(i){let t="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case bf:t="ENVMAP_BLENDING_MULTIPLY";break;case kp:t="ENVMAP_BLENDING_MIX";break;case Op:t="ENVMAP_BLENDING_ADD";break}return t}function Ov(i){const t=i.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:n,maxMip:e}}function zv(i,t,e,n){const s=i.getContext(),r=e.defines;let a=e.vertexShader,o=e.fragmentShader;const l=Iv(e),c=Nv(e),h=Uv(e),u=kv(e),f=Ov(e),d=Tv(e),g=Av(r),_=s.createProgram();let m,p,x=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Dr).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Dr).join(`
`),p.length>0&&(p+=`
`)):(m=[fu(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Dr).join(`
`),p=[fu(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Oi?"#define TONE_MAPPING":"",e.toneMapping!==Oi?qt.tonemapping_pars_fragment:"",e.toneMapping!==Oi?Ev("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",qt.colorspace_pars_fragment,Sv("linearToOutputTexel",e.outputColorSpace),bv(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Dr).join(`
`)),a=Ec(a),a=cu(a,e),a=hu(a,e),o=Ec(o),o=cu(o,e),o=hu(o,e),a=uu(a),o=uu(o),e.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",e.glslVersion===Th?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Th?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const y=x+m+a,M=x+p+o,C=au(s,s.VERTEX_SHADER,y),A=au(s,s.FRAGMENT_SHADER,M);s.attachShader(_,C),s.attachShader(_,A),e.index0AttributeName!==void 0?s.bindAttribLocation(_,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function w(I){if(i.debug.checkShaderErrors){const K=s.getProgramInfoLog(_).trim(),H=s.getShaderInfoLog(C).trim(),q=s.getShaderInfoLog(A).trim();let Z=!0,$=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(Z=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,_,C,A);else{const nt=lu(s,C,"vertex"),W=lu(s,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+K+`
`+nt+`
`+W)}else K!==""?console.warn("THREE.WebGLProgram: Program Info Log:",K):(H===""||q==="")&&($=!1);$&&(I.diagnostics={runnable:Z,programLog:K,vertexShader:{log:H,prefix:m},fragmentShader:{log:q,prefix:p}})}s.deleteShader(C),s.deleteShader(A),D=new eo(s,_),T=wv(s,_)}let D;this.getUniforms=function(){return D===void 0&&w(this),D};let T;this.getAttributes=function(){return T===void 0&&w(this),T};let b=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return b===!1&&(b=s.getProgramParameter(_,vv)),b},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=xv++,this.cacheKey=t,this.usedTimes=1,this.program=_,this.vertexShader=C,this.fragmentShader=A,this}let Fv=0;class Bv{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,n=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(t);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new Hv(t),e.set(t,n)),n}}class Hv{constructor(t){this.id=Fv++,this.code=t,this.usedTimes=0}}function Gv(i,t,e,n,s,r,a){const o=new Bf,l=new Bv,c=new Set,h=[],u=s.logarithmicDepthBuffer,f=s.vertexTextures;let d=s.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(T){return c.add(T),T===0?"uv":`uv${T}`}function m(T,b,I,K,H){const q=K.fog,Z=H.geometry,$=T.isMeshStandardMaterial?K.environment:null,nt=(T.isMeshStandardMaterial?e:t).get(T.envMap||$),W=nt&&nt.mapping===bo?nt.image.height:null,ct=g[T.type];T.precision!==null&&(d=s.getMaxPrecision(T.precision),d!==T.precision&&console.warn("THREE.WebGLProgram.getParameters:",T.precision,"not supported, using",d,"instead."));const _t=Z.morphAttributes.position||Z.morphAttributes.normal||Z.morphAttributes.color,Ct=_t!==void 0?_t.length:0;let Wt=0;Z.morphAttributes.position!==void 0&&(Wt=1),Z.morphAttributes.normal!==void 0&&(Wt=2),Z.morphAttributes.color!==void 0&&(Wt=3);let ce,Y,it,St;if(ct){const fe=Wn[ct];ce=fe.vertexShader,Y=fe.fragmentShader}else ce=T.vertexShader,Y=T.fragmentShader,l.update(T),it=l.getVertexShaderID(T),St=l.getFragmentShaderID(T);const ot=i.getRenderTarget(),It=i.state.buffers.depth.getReversed(),Ot=H.isInstancedMesh===!0,Xt=H.isBatchedMesh===!0,Se=!!T.map,ne=!!T.matcap,Ce=!!nt,z=!!T.aoMap,_n=!!T.lightMap,Zt=!!T.bumpMap,Jt=!!T.normalMap,Ut=!!T.displacementMap,xe=!!T.emissiveMap,Nt=!!T.metalnessMap,R=!!T.roughnessMap,S=T.anisotropy>0,B=T.clearcoat>0,J=T.dispersion>0,et=T.iridescence>0,j=T.sheen>0,Lt=T.transmission>0,ft=S&&!!T.anisotropyMap,xt=B&&!!T.clearcoatMap,ie=B&&!!T.clearcoatNormalMap,st=B&&!!T.clearcoatRoughnessMap,Mt=et&&!!T.iridescenceMap,kt=et&&!!T.iridescenceThicknessMap,zt=j&&!!T.sheenColorMap,yt=j&&!!T.sheenRoughnessMap,Qt=!!T.specularMap,$t=!!T.specularColorMap,_e=!!T.specularIntensityMap,N=Lt&&!!T.transmissionMap,ut=Lt&&!!T.thicknessMap,X=!!T.gradientMap,Q=!!T.alphaMap,mt=T.alphaTest>0,dt=!!T.alphaHash,Ht=!!T.extensions;let we=Oi;T.toneMapped&&(ot===null||ot.isXRRenderTarget===!0)&&(we=i.toneMapping);const He={shaderID:ct,shaderType:T.type,shaderName:T.name,vertexShader:ce,fragmentShader:Y,defines:T.defines,customVertexShaderID:it,customFragmentShaderID:St,isRawShaderMaterial:T.isRawShaderMaterial===!0,glslVersion:T.glslVersion,precision:d,batching:Xt,batchingColor:Xt&&H._colorsTexture!==null,instancing:Ot,instancingColor:Ot&&H.instanceColor!==null,instancingMorph:Ot&&H.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:ot===null?i.outputColorSpace:ot.isXRRenderTarget===!0?ot.texture.colorSpace:ar,alphaToCoverage:!!T.alphaToCoverage,map:Se,matcap:ne,envMap:Ce,envMapMode:Ce&&nt.mapping,envMapCubeUVHeight:W,aoMap:z,lightMap:_n,bumpMap:Zt,normalMap:Jt,displacementMap:f&&Ut,emissiveMap:xe,normalMapObjectSpace:Jt&&T.normalMapType===Kp,normalMapTangentSpace:Jt&&T.normalMapType===Yp,metalnessMap:Nt,roughnessMap:R,anisotropy:S,anisotropyMap:ft,clearcoat:B,clearcoatMap:xt,clearcoatNormalMap:ie,clearcoatRoughnessMap:st,dispersion:J,iridescence:et,iridescenceMap:Mt,iridescenceThicknessMap:kt,sheen:j,sheenColorMap:zt,sheenRoughnessMap:yt,specularMap:Qt,specularColorMap:$t,specularIntensityMap:_e,transmission:Lt,transmissionMap:N,thicknessMap:ut,gradientMap:X,opaque:T.transparent===!1&&T.blending===qs&&T.alphaToCoverage===!1,alphaMap:Q,alphaTest:mt,alphaHash:dt,combine:T.combine,mapUv:Se&&_(T.map.channel),aoMapUv:z&&_(T.aoMap.channel),lightMapUv:_n&&_(T.lightMap.channel),bumpMapUv:Zt&&_(T.bumpMap.channel),normalMapUv:Jt&&_(T.normalMap.channel),displacementMapUv:Ut&&_(T.displacementMap.channel),emissiveMapUv:xe&&_(T.emissiveMap.channel),metalnessMapUv:Nt&&_(T.metalnessMap.channel),roughnessMapUv:R&&_(T.roughnessMap.channel),anisotropyMapUv:ft&&_(T.anisotropyMap.channel),clearcoatMapUv:xt&&_(T.clearcoatMap.channel),clearcoatNormalMapUv:ie&&_(T.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:st&&_(T.clearcoatRoughnessMap.channel),iridescenceMapUv:Mt&&_(T.iridescenceMap.channel),iridescenceThicknessMapUv:kt&&_(T.iridescenceThicknessMap.channel),sheenColorMapUv:zt&&_(T.sheenColorMap.channel),sheenRoughnessMapUv:yt&&_(T.sheenRoughnessMap.channel),specularMapUv:Qt&&_(T.specularMap.channel),specularColorMapUv:$t&&_(T.specularColorMap.channel),specularIntensityMapUv:_e&&_(T.specularIntensityMap.channel),transmissionMapUv:N&&_(T.transmissionMap.channel),thicknessMapUv:ut&&_(T.thicknessMap.channel),alphaMapUv:Q&&_(T.alphaMap.channel),vertexTangents:!!Z.attributes.tangent&&(Jt||S),vertexColors:T.vertexColors,vertexAlphas:T.vertexColors===!0&&!!Z.attributes.color&&Z.attributes.color.itemSize===4,pointsUvs:H.isPoints===!0&&!!Z.attributes.uv&&(Se||Q),fog:!!q,useFog:T.fog===!0,fogExp2:!!q&&q.isFogExp2,flatShading:T.flatShading===!0,sizeAttenuation:T.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:It,skinning:H.isSkinnedMesh===!0,morphTargets:Z.morphAttributes.position!==void 0,morphNormals:Z.morphAttributes.normal!==void 0,morphColors:Z.morphAttributes.color!==void 0,morphTargetsCount:Ct,morphTextureStride:Wt,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:T.dithering,shadowMapEnabled:i.shadowMap.enabled&&I.length>0,shadowMapType:i.shadowMap.type,toneMapping:we,decodeVideoTexture:Se&&T.map.isVideoTexture===!0&&re.getTransfer(T.map.colorSpace)===de,decodeVideoTextureEmissive:xe&&T.emissiveMap.isVideoTexture===!0&&re.getTransfer(T.emissiveMap.colorSpace)===de,premultipliedAlpha:T.premultipliedAlpha,doubleSided:T.side===Sn,flipSided:T.side===Qe,useDepthPacking:T.depthPacking>=0,depthPacking:T.depthPacking||0,index0AttributeName:T.index0AttributeName,extensionClipCullDistance:Ht&&T.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ht&&T.extensions.multiDraw===!0||Xt)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:T.customProgramCacheKey()};return He.vertexUv1s=c.has(1),He.vertexUv2s=c.has(2),He.vertexUv3s=c.has(3),c.clear(),He}function p(T){const b=[];if(T.shaderID?b.push(T.shaderID):(b.push(T.customVertexShaderID),b.push(T.customFragmentShaderID)),T.defines!==void 0)for(const I in T.defines)b.push(I),b.push(T.defines[I]);return T.isRawShaderMaterial===!1&&(x(b,T),y(b,T),b.push(i.outputColorSpace)),b.push(T.customProgramCacheKey),b.join()}function x(T,b){T.push(b.precision),T.push(b.outputColorSpace),T.push(b.envMapMode),T.push(b.envMapCubeUVHeight),T.push(b.mapUv),T.push(b.alphaMapUv),T.push(b.lightMapUv),T.push(b.aoMapUv),T.push(b.bumpMapUv),T.push(b.normalMapUv),T.push(b.displacementMapUv),T.push(b.emissiveMapUv),T.push(b.metalnessMapUv),T.push(b.roughnessMapUv),T.push(b.anisotropyMapUv),T.push(b.clearcoatMapUv),T.push(b.clearcoatNormalMapUv),T.push(b.clearcoatRoughnessMapUv),T.push(b.iridescenceMapUv),T.push(b.iridescenceThicknessMapUv),T.push(b.sheenColorMapUv),T.push(b.sheenRoughnessMapUv),T.push(b.specularMapUv),T.push(b.specularColorMapUv),T.push(b.specularIntensityMapUv),T.push(b.transmissionMapUv),T.push(b.thicknessMapUv),T.push(b.combine),T.push(b.fogExp2),T.push(b.sizeAttenuation),T.push(b.morphTargetsCount),T.push(b.morphAttributeCount),T.push(b.numDirLights),T.push(b.numPointLights),T.push(b.numSpotLights),T.push(b.numSpotLightMaps),T.push(b.numHemiLights),T.push(b.numRectAreaLights),T.push(b.numDirLightShadows),T.push(b.numPointLightShadows),T.push(b.numSpotLightShadows),T.push(b.numSpotLightShadowsWithMaps),T.push(b.numLightProbes),T.push(b.shadowMapType),T.push(b.toneMapping),T.push(b.numClippingPlanes),T.push(b.numClipIntersection),T.push(b.depthPacking)}function y(T,b){o.disableAll(),b.supportsVertexTextures&&o.enable(0),b.instancing&&o.enable(1),b.instancingColor&&o.enable(2),b.instancingMorph&&o.enable(3),b.matcap&&o.enable(4),b.envMap&&o.enable(5),b.normalMapObjectSpace&&o.enable(6),b.normalMapTangentSpace&&o.enable(7),b.clearcoat&&o.enable(8),b.iridescence&&o.enable(9),b.alphaTest&&o.enable(10),b.vertexColors&&o.enable(11),b.vertexAlphas&&o.enable(12),b.vertexUv1s&&o.enable(13),b.vertexUv2s&&o.enable(14),b.vertexUv3s&&o.enable(15),b.vertexTangents&&o.enable(16),b.anisotropy&&o.enable(17),b.alphaHash&&o.enable(18),b.batching&&o.enable(19),b.dispersion&&o.enable(20),b.batchingColor&&o.enable(21),T.push(o.mask),o.disableAll(),b.fog&&o.enable(0),b.useFog&&o.enable(1),b.flatShading&&o.enable(2),b.logarithmicDepthBuffer&&o.enable(3),b.reverseDepthBuffer&&o.enable(4),b.skinning&&o.enable(5),b.morphTargets&&o.enable(6),b.morphNormals&&o.enable(7),b.morphColors&&o.enable(8),b.premultipliedAlpha&&o.enable(9),b.shadowMapEnabled&&o.enable(10),b.doubleSided&&o.enable(11),b.flipSided&&o.enable(12),b.useDepthPacking&&o.enable(13),b.dithering&&o.enable(14),b.transmission&&o.enable(15),b.sheen&&o.enable(16),b.opaque&&o.enable(17),b.pointsUvs&&o.enable(18),b.decodeVideoTexture&&o.enable(19),b.decodeVideoTextureEmissive&&o.enable(20),b.alphaToCoverage&&o.enable(21),T.push(o.mask)}function M(T){const b=g[T.type];let I;if(b){const K=Wn[b];I=bm.clone(K.uniforms)}else I=T.uniforms;return I}function C(T,b){let I;for(let K=0,H=h.length;K<H;K++){const q=h[K];if(q.cacheKey===b){I=q,++I.usedTimes;break}}return I===void 0&&(I=new zv(i,b,T,r),h.push(I)),I}function A(T){if(--T.usedTimes===0){const b=h.indexOf(T);h[b]=h[h.length-1],h.pop(),T.destroy()}}function w(T){l.remove(T)}function D(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:M,acquireProgram:C,releaseProgram:A,releaseShaderCache:w,programs:h,dispose:D}}function Vv(){let i=new WeakMap;function t(a){return i.has(a)}function e(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function Wv(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.z!==t.z?i.z-t.z:i.id-t.id}function du(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function pu(){const i=[];let t=0;const e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function a(u,f,d,g,_,m){let p=i[t];return p===void 0?(p={id:u.id,object:u,geometry:f,material:d,groupOrder:g,renderOrder:u.renderOrder,z:_,group:m},i[t]=p):(p.id=u.id,p.object=u,p.geometry=f,p.material=d,p.groupOrder=g,p.renderOrder=u.renderOrder,p.z=_,p.group=m),t++,p}function o(u,f,d,g,_,m){const p=a(u,f,d,g,_,m);d.transmission>0?n.push(p):d.transparent===!0?s.push(p):e.push(p)}function l(u,f,d,g,_,m){const p=a(u,f,d,g,_,m);d.transmission>0?n.unshift(p):d.transparent===!0?s.unshift(p):e.unshift(p)}function c(u,f){e.length>1&&e.sort(u||Wv),n.length>1&&n.sort(f||du),s.length>1&&s.sort(f||du)}function h(){for(let u=t,f=i.length;u<f;u++){const d=i[u];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:o,unshift:l,finish:h,sort:c}}function Xv(){let i=new WeakMap;function t(n,s){const r=i.get(n);let a;return r===void 0?(a=new pu,i.set(n,[a])):s>=r.length?(a=new pu,r.push(a)):a=r[s],a}function e(){i=new WeakMap}return{get:t,dispose:e}}function $v(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new U,color:new oe};break;case"SpotLight":e={position:new U,direction:new U,color:new oe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new U,color:new oe,distance:0,decay:0};break;case"HemisphereLight":e={direction:new U,skyColor:new oe,groundColor:new oe};break;case"RectAreaLight":e={color:new oe,position:new U,halfWidth:new U,halfHeight:new U};break}return i[t.id]=e,e}}}function qv(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Kt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Kt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Kt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}let Yv=0;function Kv(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function jv(i){const t=new $v,e=qv(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new U);const s=new U,r=new be,a=new be;function o(c){let h=0,u=0,f=0;for(let T=0;T<9;T++)n.probe[T].set(0,0,0);let d=0,g=0,_=0,m=0,p=0,x=0,y=0,M=0,C=0,A=0,w=0;c.sort(Kv);for(let T=0,b=c.length;T<b;T++){const I=c[T],K=I.color,H=I.intensity,q=I.distance,Z=I.shadow&&I.shadow.map?I.shadow.map.texture:null;if(I.isAmbientLight)h+=K.r*H,u+=K.g*H,f+=K.b*H;else if(I.isLightProbe){for(let $=0;$<9;$++)n.probe[$].addScaledVector(I.sh.coefficients[$],H);w++}else if(I.isDirectionalLight){const $=t.get(I);if($.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){const nt=I.shadow,W=e.get(I);W.shadowIntensity=nt.intensity,W.shadowBias=nt.bias,W.shadowNormalBias=nt.normalBias,W.shadowRadius=nt.radius,W.shadowMapSize=nt.mapSize,n.directionalShadow[d]=W,n.directionalShadowMap[d]=Z,n.directionalShadowMatrix[d]=I.shadow.matrix,x++}n.directional[d]=$,d++}else if(I.isSpotLight){const $=t.get(I);$.position.setFromMatrixPosition(I.matrixWorld),$.color.copy(K).multiplyScalar(H),$.distance=q,$.coneCos=Math.cos(I.angle),$.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),$.decay=I.decay,n.spot[_]=$;const nt=I.shadow;if(I.map&&(n.spotLightMap[C]=I.map,C++,nt.updateMatrices(I),I.castShadow&&A++),n.spotLightMatrix[_]=nt.matrix,I.castShadow){const W=e.get(I);W.shadowIntensity=nt.intensity,W.shadowBias=nt.bias,W.shadowNormalBias=nt.normalBias,W.shadowRadius=nt.radius,W.shadowMapSize=nt.mapSize,n.spotShadow[_]=W,n.spotShadowMap[_]=Z,M++}_++}else if(I.isRectAreaLight){const $=t.get(I);$.color.copy(K).multiplyScalar(H),$.halfWidth.set(I.width*.5,0,0),$.halfHeight.set(0,I.height*.5,0),n.rectArea[m]=$,m++}else if(I.isPointLight){const $=t.get(I);if($.color.copy(I.color).multiplyScalar(I.intensity),$.distance=I.distance,$.decay=I.decay,I.castShadow){const nt=I.shadow,W=e.get(I);W.shadowIntensity=nt.intensity,W.shadowBias=nt.bias,W.shadowNormalBias=nt.normalBias,W.shadowRadius=nt.radius,W.shadowMapSize=nt.mapSize,W.shadowCameraNear=nt.camera.near,W.shadowCameraFar=nt.camera.far,n.pointShadow[g]=W,n.pointShadowMap[g]=Z,n.pointShadowMatrix[g]=I.shadow.matrix,y++}n.point[g]=$,g++}else if(I.isHemisphereLight){const $=t.get(I);$.skyColor.copy(I.color).multiplyScalar(H),$.groundColor.copy(I.groundColor).multiplyScalar(H),n.hemi[p]=$,p++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=lt.LTC_FLOAT_1,n.rectAreaLTC2=lt.LTC_FLOAT_2):(n.rectAreaLTC1=lt.LTC_HALF_1,n.rectAreaLTC2=lt.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=f;const D=n.hash;(D.directionalLength!==d||D.pointLength!==g||D.spotLength!==_||D.rectAreaLength!==m||D.hemiLength!==p||D.numDirectionalShadows!==x||D.numPointShadows!==y||D.numSpotShadows!==M||D.numSpotMaps!==C||D.numLightProbes!==w)&&(n.directional.length=d,n.spot.length=_,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=x,n.directionalShadowMap.length=x,n.pointShadow.length=y,n.pointShadowMap.length=y,n.spotShadow.length=M,n.spotShadowMap.length=M,n.directionalShadowMatrix.length=x,n.pointShadowMatrix.length=y,n.spotLightMatrix.length=M+C-A,n.spotLightMap.length=C,n.numSpotLightShadowsWithMaps=A,n.numLightProbes=w,D.directionalLength=d,D.pointLength=g,D.spotLength=_,D.rectAreaLength=m,D.hemiLength=p,D.numDirectionalShadows=x,D.numPointShadows=y,D.numSpotShadows=M,D.numSpotMaps=C,D.numLightProbes=w,n.version=Yv++)}function l(c,h){let u=0,f=0,d=0,g=0,_=0;const m=h.matrixWorldInverse;for(let p=0,x=c.length;p<x;p++){const y=c[p];if(y.isDirectionalLight){const M=n.directional[u];M.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(m),u++}else if(y.isSpotLight){const M=n.spot[d];M.position.setFromMatrixPosition(y.matrixWorld),M.position.applyMatrix4(m),M.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(m),d++}else if(y.isRectAreaLight){const M=n.rectArea[g];M.position.setFromMatrixPosition(y.matrixWorld),M.position.applyMatrix4(m),a.identity(),r.copy(y.matrixWorld),r.premultiply(m),a.extractRotation(r),M.halfWidth.set(y.width*.5,0,0),M.halfHeight.set(0,y.height*.5,0),M.halfWidth.applyMatrix4(a),M.halfHeight.applyMatrix4(a),g++}else if(y.isPointLight){const M=n.point[f];M.position.setFromMatrixPosition(y.matrixWorld),M.position.applyMatrix4(m),f++}else if(y.isHemisphereLight){const M=n.hemi[_];M.direction.setFromMatrixPosition(y.matrixWorld),M.direction.transformDirection(m),_++}}}return{setup:o,setupView:l,state:n}}function mu(i){const t=new jv(i),e=[],n=[];function s(h){c.camera=h,e.length=0,n.length=0}function r(h){e.push(h)}function a(h){n.push(h)}function o(){t.setup(e)}function l(h){t.setupView(e,h)}const c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function Zv(i){let t=new WeakMap;function e(s,r=0){const a=t.get(s);let o;return a===void 0?(o=new mu(i),t.set(s,[o])):r>=a.length?(o=new mu(i),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}class Jv extends vs{static get type(){return"MeshDepthMaterial"}constructor(t){super(),this.isMeshDepthMaterial=!0,this.depthPacking=$p,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class Qv extends vs{static get type(){return"MeshDistanceMaterial"}constructor(t){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const tx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,ex=`uniform sampler2D shadow_pass;
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
}`;function nx(i,t,e){let n=new qf;const s=new Kt,r=new Kt,a=new Pe,o=new Jv({depthPacking:qp}),l=new Qv,c={},h=e.maxTextureSize,u={[ui]:Qe,[Qe]:ui,[Sn]:Sn},f=new Bn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Kt},radius:{value:4}},vertexShader:tx,fragmentShader:ex}),d=f.clone();d.defines.HORIZONTAL_PASS=1;const g=new Ue;g.setAttribute("position",new Ne(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new Re(g,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ef;let p=this.type;this.render=function(A,w,D){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||A.length===0)return;const T=i.getRenderTarget(),b=i.getActiveCubeFace(),I=i.getActiveMipmapLevel(),K=i.state;K.setBlending(ki),K.buffers.color.setClear(1,1,1,1),K.buffers.depth.setTest(!0),K.setScissorTest(!1);const H=p!==ii&&this.type===ii,q=p===ii&&this.type!==ii;for(let Z=0,$=A.length;Z<$;Z++){const nt=A[Z],W=nt.shadow;if(W===void 0){console.warn("THREE.WebGLShadowMap:",nt,"has no shadow.");continue}if(W.autoUpdate===!1&&W.needsUpdate===!1)continue;s.copy(W.mapSize);const ct=W.getFrameExtents();if(s.multiply(ct),r.copy(W.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/ct.x),s.x=r.x*ct.x,W.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/ct.y),s.y=r.y*ct.y,W.mapSize.y=r.y)),W.map===null||H===!0||q===!0){const Ct=this.type!==ii?{minFilter:tn,magFilter:tn}:{};W.map!==null&&W.map.dispose(),W.map=new ds(s.x,s.y,Ct),W.map.texture.name=nt.name+".shadowMap",W.camera.updateProjectionMatrix()}i.setRenderTarget(W.map),i.clear();const _t=W.getViewportCount();for(let Ct=0;Ct<_t;Ct++){const Wt=W.getViewport(Ct);a.set(r.x*Wt.x,r.y*Wt.y,r.x*Wt.z,r.y*Wt.w),K.viewport(a),W.updateMatrices(nt,Ct),n=W.getFrustum(),M(w,D,W.camera,nt,this.type)}W.isPointLightShadow!==!0&&this.type===ii&&x(W,D),W.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(T,b,I)};function x(A,w){const D=t.update(_);f.defines.VSM_SAMPLES!==A.blurSamples&&(f.defines.VSM_SAMPLES=A.blurSamples,d.defines.VSM_SAMPLES=A.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new ds(s.x,s.y)),f.uniforms.shadow_pass.value=A.map.texture,f.uniforms.resolution.value=A.mapSize,f.uniforms.radius.value=A.radius,i.setRenderTarget(A.mapPass),i.clear(),i.renderBufferDirect(w,null,D,f,_,null),d.uniforms.shadow_pass.value=A.mapPass.texture,d.uniforms.resolution.value=A.mapSize,d.uniforms.radius.value=A.radius,i.setRenderTarget(A.map),i.clear(),i.renderBufferDirect(w,null,D,d,_,null)}function y(A,w,D,T){let b=null;const I=D.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(I!==void 0)b=I;else if(b=D.isPointLight===!0?l:o,i.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0){const K=b.uuid,H=w.uuid;let q=c[K];q===void 0&&(q={},c[K]=q);let Z=q[H];Z===void 0&&(Z=b.clone(),q[H]=Z,w.addEventListener("dispose",C)),b=Z}if(b.visible=w.visible,b.wireframe=w.wireframe,T===ii?b.side=w.shadowSide!==null?w.shadowSide:w.side:b.side=w.shadowSide!==null?w.shadowSide:u[w.side],b.alphaMap=w.alphaMap,b.alphaTest=w.alphaTest,b.map=w.map,b.clipShadows=w.clipShadows,b.clippingPlanes=w.clippingPlanes,b.clipIntersection=w.clipIntersection,b.displacementMap=w.displacementMap,b.displacementScale=w.displacementScale,b.displacementBias=w.displacementBias,b.wireframeLinewidth=w.wireframeLinewidth,b.linewidth=w.linewidth,D.isPointLight===!0&&b.isMeshDistanceMaterial===!0){const K=i.properties.get(b);K.light=D}return b}function M(A,w,D,T,b){if(A.visible===!1)return;if(A.layers.test(w.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&b===ii)&&(!A.frustumCulled||n.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(D.matrixWorldInverse,A.matrixWorld);const H=t.update(A),q=A.material;if(Array.isArray(q)){const Z=H.groups;for(let $=0,nt=Z.length;$<nt;$++){const W=Z[$],ct=q[W.materialIndex];if(ct&&ct.visible){const _t=y(A,ct,T,b);A.onBeforeShadow(i,A,w,D,H,_t,W),i.renderBufferDirect(D,null,H,_t,A,W),A.onAfterShadow(i,A,w,D,H,_t,W)}}}else if(q.visible){const Z=y(A,q,T,b);A.onBeforeShadow(i,A,w,D,H,Z,null),i.renderBufferDirect(D,null,H,Z,A,null),A.onAfterShadow(i,A,w,D,H,Z,null)}}const K=A.children;for(let H=0,q=K.length;H<q;H++)M(K[H],w,D,T,b)}function C(A){A.target.removeEventListener("dispose",C);for(const D in c){const T=c[D],b=A.target.uuid;b in T&&(T[b].dispose(),delete T[b])}}}const ix={[Fl]:Bl,[Hl]:Wl,[Gl]:Xl,[Zs]:Vl,[Bl]:Fl,[Wl]:Hl,[Xl]:Gl,[Vl]:Zs};function sx(i,t){function e(){let N=!1;const ut=new Pe;let X=null;const Q=new Pe(0,0,0,0);return{setMask:function(mt){X!==mt&&!N&&(i.colorMask(mt,mt,mt,mt),X=mt)},setLocked:function(mt){N=mt},setClear:function(mt,dt,Ht,we,He){He===!0&&(mt*=we,dt*=we,Ht*=we),ut.set(mt,dt,Ht,we),Q.equals(ut)===!1&&(i.clearColor(mt,dt,Ht,we),Q.copy(ut))},reset:function(){N=!1,X=null,Q.set(-1,0,0,0)}}}function n(){let N=!1,ut=!1,X=null,Q=null,mt=null;return{setReversed:function(dt){if(ut!==dt){const Ht=t.get("EXT_clip_control");ut?Ht.clipControlEXT(Ht.LOWER_LEFT_EXT,Ht.ZERO_TO_ONE_EXT):Ht.clipControlEXT(Ht.LOWER_LEFT_EXT,Ht.NEGATIVE_ONE_TO_ONE_EXT);const we=mt;mt=null,this.setClear(we)}ut=dt},getReversed:function(){return ut},setTest:function(dt){dt?ot(i.DEPTH_TEST):It(i.DEPTH_TEST)},setMask:function(dt){X!==dt&&!N&&(i.depthMask(dt),X=dt)},setFunc:function(dt){if(ut&&(dt=ix[dt]),Q!==dt){switch(dt){case Fl:i.depthFunc(i.NEVER);break;case Bl:i.depthFunc(i.ALWAYS);break;case Hl:i.depthFunc(i.LESS);break;case Zs:i.depthFunc(i.LEQUAL);break;case Gl:i.depthFunc(i.EQUAL);break;case Vl:i.depthFunc(i.GEQUAL);break;case Wl:i.depthFunc(i.GREATER);break;case Xl:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}Q=dt}},setLocked:function(dt){N=dt},setClear:function(dt){mt!==dt&&(ut&&(dt=1-dt),i.clearDepth(dt),mt=dt)},reset:function(){N=!1,X=null,Q=null,mt=null,ut=!1}}}function s(){let N=!1,ut=null,X=null,Q=null,mt=null,dt=null,Ht=null,we=null,He=null;return{setTest:function(fe){N||(fe?ot(i.STENCIL_TEST):It(i.STENCIL_TEST))},setMask:function(fe){ut!==fe&&!N&&(i.stencilMask(fe),ut=fe)},setFunc:function(fe,Cn,Yn){(X!==fe||Q!==Cn||mt!==Yn)&&(i.stencilFunc(fe,Cn,Yn),X=fe,Q=Cn,mt=Yn)},setOp:function(fe,Cn,Yn){(dt!==fe||Ht!==Cn||we!==Yn)&&(i.stencilOp(fe,Cn,Yn),dt=fe,Ht=Cn,we=Yn)},setLocked:function(fe){N=fe},setClear:function(fe){He!==fe&&(i.clearStencil(fe),He=fe)},reset:function(){N=!1,ut=null,X=null,Q=null,mt=null,dt=null,Ht=null,we=null,He=null}}}const r=new e,a=new n,o=new s,l=new WeakMap,c=new WeakMap;let h={},u={},f=new WeakMap,d=[],g=null,_=!1,m=null,p=null,x=null,y=null,M=null,C=null,A=null,w=new oe(0,0,0),D=0,T=!1,b=null,I=null,K=null,H=null,q=null;const Z=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let $=!1,nt=0;const W=i.getParameter(i.VERSION);W.indexOf("WebGL")!==-1?(nt=parseFloat(/^WebGL (\d)/.exec(W)[1]),$=nt>=1):W.indexOf("OpenGL ES")!==-1&&(nt=parseFloat(/^OpenGL ES (\d)/.exec(W)[1]),$=nt>=2);let ct=null,_t={};const Ct=i.getParameter(i.SCISSOR_BOX),Wt=i.getParameter(i.VIEWPORT),ce=new Pe().fromArray(Ct),Y=new Pe().fromArray(Wt);function it(N,ut,X,Q){const mt=new Uint8Array(4),dt=i.createTexture();i.bindTexture(N,dt),i.texParameteri(N,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(N,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ht=0;Ht<X;Ht++)N===i.TEXTURE_3D||N===i.TEXTURE_2D_ARRAY?i.texImage3D(ut,0,i.RGBA,1,1,Q,0,i.RGBA,i.UNSIGNED_BYTE,mt):i.texImage2D(ut+Ht,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,mt);return dt}const St={};St[i.TEXTURE_2D]=it(i.TEXTURE_2D,i.TEXTURE_2D,1),St[i.TEXTURE_CUBE_MAP]=it(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),St[i.TEXTURE_2D_ARRAY]=it(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),St[i.TEXTURE_3D]=it(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ot(i.DEPTH_TEST),a.setFunc(Zs),Zt(!1),Jt(Mh),ot(i.CULL_FACE),z(ki);function ot(N){h[N]!==!0&&(i.enable(N),h[N]=!0)}function It(N){h[N]!==!1&&(i.disable(N),h[N]=!1)}function Ot(N,ut){return u[N]!==ut?(i.bindFramebuffer(N,ut),u[N]=ut,N===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=ut),N===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=ut),!0):!1}function Xt(N,ut){let X=d,Q=!1;if(N){X=f.get(ut),X===void 0&&(X=[],f.set(ut,X));const mt=N.textures;if(X.length!==mt.length||X[0]!==i.COLOR_ATTACHMENT0){for(let dt=0,Ht=mt.length;dt<Ht;dt++)X[dt]=i.COLOR_ATTACHMENT0+dt;X.length=mt.length,Q=!0}}else X[0]!==i.BACK&&(X[0]=i.BACK,Q=!0);Q&&i.drawBuffers(X)}function Se(N){return g!==N?(i.useProgram(N),g=N,!0):!1}const ne={[as]:i.FUNC_ADD,[xp]:i.FUNC_SUBTRACT,[Mp]:i.FUNC_REVERSE_SUBTRACT};ne[yp]=i.MIN,ne[Sp]=i.MAX;const Ce={[Ep]:i.ZERO,[bp]:i.ONE,[Tp]:i.SRC_COLOR,[Ol]:i.SRC_ALPHA,[Pp]:i.SRC_ALPHA_SATURATE,[Cp]:i.DST_COLOR,[wp]:i.DST_ALPHA,[Ap]:i.ONE_MINUS_SRC_COLOR,[zl]:i.ONE_MINUS_SRC_ALPHA,[Lp]:i.ONE_MINUS_DST_COLOR,[Rp]:i.ONE_MINUS_DST_ALPHA,[Dp]:i.CONSTANT_COLOR,[Ip]:i.ONE_MINUS_CONSTANT_COLOR,[Np]:i.CONSTANT_ALPHA,[Up]:i.ONE_MINUS_CONSTANT_ALPHA};function z(N,ut,X,Q,mt,dt,Ht,we,He,fe){if(N===ki){_===!0&&(It(i.BLEND),_=!1);return}if(_===!1&&(ot(i.BLEND),_=!0),N!==vp){if(N!==m||fe!==T){if((p!==as||M!==as)&&(i.blendEquation(i.FUNC_ADD),p=as,M=as),fe)switch(N){case qs:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case yh:i.blendFunc(i.ONE,i.ONE);break;case Sh:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Eh:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",N);break}else switch(N){case qs:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case yh:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case Sh:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Eh:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",N);break}x=null,y=null,C=null,A=null,w.set(0,0,0),D=0,m=N,T=fe}return}mt=mt||ut,dt=dt||X,Ht=Ht||Q,(ut!==p||mt!==M)&&(i.blendEquationSeparate(ne[ut],ne[mt]),p=ut,M=mt),(X!==x||Q!==y||dt!==C||Ht!==A)&&(i.blendFuncSeparate(Ce[X],Ce[Q],Ce[dt],Ce[Ht]),x=X,y=Q,C=dt,A=Ht),(we.equals(w)===!1||He!==D)&&(i.blendColor(we.r,we.g,we.b,He),w.copy(we),D=He),m=N,T=!1}function _n(N,ut){N.side===Sn?It(i.CULL_FACE):ot(i.CULL_FACE);let X=N.side===Qe;ut&&(X=!X),Zt(X),N.blending===qs&&N.transparent===!1?z(ki):z(N.blending,N.blendEquation,N.blendSrc,N.blendDst,N.blendEquationAlpha,N.blendSrcAlpha,N.blendDstAlpha,N.blendColor,N.blendAlpha,N.premultipliedAlpha),a.setFunc(N.depthFunc),a.setTest(N.depthTest),a.setMask(N.depthWrite),r.setMask(N.colorWrite);const Q=N.stencilWrite;o.setTest(Q),Q&&(o.setMask(N.stencilWriteMask),o.setFunc(N.stencilFunc,N.stencilRef,N.stencilFuncMask),o.setOp(N.stencilFail,N.stencilZFail,N.stencilZPass)),xe(N.polygonOffset,N.polygonOffsetFactor,N.polygonOffsetUnits),N.alphaToCoverage===!0?ot(i.SAMPLE_ALPHA_TO_COVERAGE):It(i.SAMPLE_ALPHA_TO_COVERAGE)}function Zt(N){b!==N&&(N?i.frontFace(i.CW):i.frontFace(i.CCW),b=N)}function Jt(N){N!==mp?(ot(i.CULL_FACE),N!==I&&(N===Mh?i.cullFace(i.BACK):N===gp?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):It(i.CULL_FACE),I=N}function Ut(N){N!==K&&($&&i.lineWidth(N),K=N)}function xe(N,ut,X){N?(ot(i.POLYGON_OFFSET_FILL),(H!==ut||q!==X)&&(i.polygonOffset(ut,X),H=ut,q=X)):It(i.POLYGON_OFFSET_FILL)}function Nt(N){N?ot(i.SCISSOR_TEST):It(i.SCISSOR_TEST)}function R(N){N===void 0&&(N=i.TEXTURE0+Z-1),ct!==N&&(i.activeTexture(N),ct=N)}function S(N,ut,X){X===void 0&&(ct===null?X=i.TEXTURE0+Z-1:X=ct);let Q=_t[X];Q===void 0&&(Q={type:void 0,texture:void 0},_t[X]=Q),(Q.type!==N||Q.texture!==ut)&&(ct!==X&&(i.activeTexture(X),ct=X),i.bindTexture(N,ut||St[N]),Q.type=N,Q.texture=ut)}function B(){const N=_t[ct];N!==void 0&&N.type!==void 0&&(i.bindTexture(N.type,null),N.type=void 0,N.texture=void 0)}function J(){try{i.compressedTexImage2D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function et(){try{i.compressedTexImage3D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function j(){try{i.texSubImage2D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Lt(){try{i.texSubImage3D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function ft(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function xt(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function ie(){try{i.texStorage2D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function st(){try{i.texStorage3D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function Mt(){try{i.texImage2D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function kt(){try{i.texImage3D.apply(i,arguments)}catch(N){console.error("THREE.WebGLState:",N)}}function zt(N){ce.equals(N)===!1&&(i.scissor(N.x,N.y,N.z,N.w),ce.copy(N))}function yt(N){Y.equals(N)===!1&&(i.viewport(N.x,N.y,N.z,N.w),Y.copy(N))}function Qt(N,ut){let X=c.get(ut);X===void 0&&(X=new WeakMap,c.set(ut,X));let Q=X.get(N);Q===void 0&&(Q=i.getUniformBlockIndex(ut,N.name),X.set(N,Q))}function $t(N,ut){const Q=c.get(ut).get(N);l.get(ut)!==Q&&(i.uniformBlockBinding(ut,Q,N.__bindingPointIndex),l.set(ut,Q))}function _e(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),h={},ct=null,_t={},u={},f=new WeakMap,d=[],g=null,_=!1,m=null,p=null,x=null,y=null,M=null,C=null,A=null,w=new oe(0,0,0),D=0,T=!1,b=null,I=null,K=null,H=null,q=null,ce.set(0,0,i.canvas.width,i.canvas.height),Y.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:ot,disable:It,bindFramebuffer:Ot,drawBuffers:Xt,useProgram:Se,setBlending:z,setMaterial:_n,setFlipSided:Zt,setCullFace:Jt,setLineWidth:Ut,setPolygonOffset:xe,setScissorTest:Nt,activeTexture:R,bindTexture:S,unbindTexture:B,compressedTexImage2D:J,compressedTexImage3D:et,texImage2D:Mt,texImage3D:kt,updateUBOMapping:Qt,uniformBlockBinding:$t,texStorage2D:ie,texStorage3D:st,texSubImage2D:j,texSubImage3D:Lt,compressedTexSubImage2D:ft,compressedTexSubImage3D:xt,scissor:zt,viewport:yt,reset:_e}}function gu(i,t,e,n){const s=rx(n);switch(e){case Cf:return i*t;case Pf:return i*t;case Df:return i*t*2;case If:return i*t/s.components*s.byteLength;case Xc:return i*t/s.components*s.byteLength;case Nf:return i*t*2/s.components*s.byteLength;case $c:return i*t*2/s.components*s.byteLength;case Lf:return i*t*3/s.components*s.byteLength;case bn:return i*t*4/s.components*s.byteLength;case qc:return i*t*4/s.components*s.byteLength;case Ka:case ja:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Za:case Ja:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case jl:case Jl:return Math.max(i,16)*Math.max(t,8)/4;case Kl:case Zl:return Math.max(i,8)*Math.max(t,8)/2;case Ql:case tc:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case ec:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case nc:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case ic:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case sc:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case rc:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case ac:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case oc:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case lc:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case cc:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case hc:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case uc:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case fc:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case dc:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case pc:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case mc:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case Qa:case gc:case _c:return Math.ceil(i/4)*Math.ceil(t/4)*16;case Uf:case vc:return Math.ceil(i/4)*Math.ceil(t/4)*8;case xc:case Mc:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function rx(i){switch(i){case fi:case Af:return{byteLength:1,components:1};case qr:case wf:case ia:return{byteLength:2,components:1};case Vc:case Wc:return{byteLength:2,components:4};case fs:case Gc:case si:return{byteLength:4,components:1};case Rf:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function ax(i,t,e,n,s,r,a){const o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Kt,h=new WeakMap;let u;const f=new WeakMap;let d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(R,S){return d?new OffscreenCanvas(R,S):ho("canvas")}function _(R,S,B){let J=1;const et=Nt(R);if((et.width>B||et.height>B)&&(J=B/Math.max(et.width,et.height)),J<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){const j=Math.floor(J*et.width),Lt=Math.floor(J*et.height);u===void 0&&(u=g(j,Lt));const ft=S?g(j,Lt):u;return ft.width=j,ft.height=Lt,ft.getContext("2d").drawImage(R,0,0,j,Lt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+et.width+"x"+et.height+") to ("+j+"x"+Lt+")."),ft}else return"data"in R&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+et.width+"x"+et.height+")."),R;return R}function m(R){return R.generateMipmaps}function p(R){i.generateMipmap(R)}function x(R){return R.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?i.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function y(R,S,B,J,et=!1){if(R!==null){if(i[R]!==void 0)return i[R];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let j=S;if(S===i.RED&&(B===i.FLOAT&&(j=i.R32F),B===i.HALF_FLOAT&&(j=i.R16F),B===i.UNSIGNED_BYTE&&(j=i.R8)),S===i.RED_INTEGER&&(B===i.UNSIGNED_BYTE&&(j=i.R8UI),B===i.UNSIGNED_SHORT&&(j=i.R16UI),B===i.UNSIGNED_INT&&(j=i.R32UI),B===i.BYTE&&(j=i.R8I),B===i.SHORT&&(j=i.R16I),B===i.INT&&(j=i.R32I)),S===i.RG&&(B===i.FLOAT&&(j=i.RG32F),B===i.HALF_FLOAT&&(j=i.RG16F),B===i.UNSIGNED_BYTE&&(j=i.RG8)),S===i.RG_INTEGER&&(B===i.UNSIGNED_BYTE&&(j=i.RG8UI),B===i.UNSIGNED_SHORT&&(j=i.RG16UI),B===i.UNSIGNED_INT&&(j=i.RG32UI),B===i.BYTE&&(j=i.RG8I),B===i.SHORT&&(j=i.RG16I),B===i.INT&&(j=i.RG32I)),S===i.RGB_INTEGER&&(B===i.UNSIGNED_BYTE&&(j=i.RGB8UI),B===i.UNSIGNED_SHORT&&(j=i.RGB16UI),B===i.UNSIGNED_INT&&(j=i.RGB32UI),B===i.BYTE&&(j=i.RGB8I),B===i.SHORT&&(j=i.RGB16I),B===i.INT&&(j=i.RGB32I)),S===i.RGBA_INTEGER&&(B===i.UNSIGNED_BYTE&&(j=i.RGBA8UI),B===i.UNSIGNED_SHORT&&(j=i.RGBA16UI),B===i.UNSIGNED_INT&&(j=i.RGBA32UI),B===i.BYTE&&(j=i.RGBA8I),B===i.SHORT&&(j=i.RGBA16I),B===i.INT&&(j=i.RGBA32I)),S===i.RGB&&B===i.UNSIGNED_INT_5_9_9_9_REV&&(j=i.RGB9_E5),S===i.RGBA){const Lt=et?To:re.getTransfer(J);B===i.FLOAT&&(j=i.RGBA32F),B===i.HALF_FLOAT&&(j=i.RGBA16F),B===i.UNSIGNED_BYTE&&(j=Lt===de?i.SRGB8_ALPHA8:i.RGBA8),B===i.UNSIGNED_SHORT_4_4_4_4&&(j=i.RGBA4),B===i.UNSIGNED_SHORT_5_5_5_1&&(j=i.RGB5_A1)}return(j===i.R16F||j===i.R32F||j===i.RG16F||j===i.RG32F||j===i.RGBA16F||j===i.RGBA32F)&&t.get("EXT_color_buffer_float"),j}function M(R,S){let B;return R?S===null||S===fs||S===tr?B=i.DEPTH24_STENCIL8:S===si?B=i.DEPTH32F_STENCIL8:S===qr&&(B=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===fs||S===tr?B=i.DEPTH_COMPONENT24:S===si?B=i.DEPTH_COMPONENT32F:S===qr&&(B=i.DEPTH_COMPONENT16),B}function C(R,S){return m(R)===!0||R.isFramebufferTexture&&R.minFilter!==tn&&R.minFilter!==mn?Math.log2(Math.max(S.width,S.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?S.mipmaps.length:1}function A(R){const S=R.target;S.removeEventListener("dispose",A),D(S),S.isVideoTexture&&h.delete(S)}function w(R){const S=R.target;S.removeEventListener("dispose",w),b(S)}function D(R){const S=n.get(R);if(S.__webglInit===void 0)return;const B=R.source,J=f.get(B);if(J){const et=J[S.__cacheKey];et.usedTimes--,et.usedTimes===0&&T(R),Object.keys(J).length===0&&f.delete(B)}n.remove(R)}function T(R){const S=n.get(R);i.deleteTexture(S.__webglTexture);const B=R.source,J=f.get(B);delete J[S.__cacheKey],a.memory.textures--}function b(R){const S=n.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),n.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let J=0;J<6;J++){if(Array.isArray(S.__webglFramebuffer[J]))for(let et=0;et<S.__webglFramebuffer[J].length;et++)i.deleteFramebuffer(S.__webglFramebuffer[J][et]);else i.deleteFramebuffer(S.__webglFramebuffer[J]);S.__webglDepthbuffer&&i.deleteRenderbuffer(S.__webglDepthbuffer[J])}else{if(Array.isArray(S.__webglFramebuffer))for(let J=0;J<S.__webglFramebuffer.length;J++)i.deleteFramebuffer(S.__webglFramebuffer[J]);else i.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&i.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&i.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let J=0;J<S.__webglColorRenderbuffer.length;J++)S.__webglColorRenderbuffer[J]&&i.deleteRenderbuffer(S.__webglColorRenderbuffer[J]);S.__webglDepthRenderbuffer&&i.deleteRenderbuffer(S.__webglDepthRenderbuffer)}const B=R.textures;for(let J=0,et=B.length;J<et;J++){const j=n.get(B[J]);j.__webglTexture&&(i.deleteTexture(j.__webglTexture),a.memory.textures--),n.remove(B[J])}n.remove(R)}let I=0;function K(){I=0}function H(){const R=I;return R>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+s.maxTextures),I+=1,R}function q(R){const S=[];return S.push(R.wrapS),S.push(R.wrapT),S.push(R.wrapR||0),S.push(R.magFilter),S.push(R.minFilter),S.push(R.anisotropy),S.push(R.internalFormat),S.push(R.format),S.push(R.type),S.push(R.generateMipmaps),S.push(R.premultiplyAlpha),S.push(R.flipY),S.push(R.unpackAlignment),S.push(R.colorSpace),S.join()}function Z(R,S){const B=n.get(R);if(R.isVideoTexture&&Ut(R),R.isRenderTargetTexture===!1&&R.version>0&&B.__version!==R.version){const J=R.image;if(J===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(J.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Y(B,R,S);return}}e.bindTexture(i.TEXTURE_2D,B.__webglTexture,i.TEXTURE0+S)}function $(R,S){const B=n.get(R);if(R.version>0&&B.__version!==R.version){Y(B,R,S);return}e.bindTexture(i.TEXTURE_2D_ARRAY,B.__webglTexture,i.TEXTURE0+S)}function nt(R,S){const B=n.get(R);if(R.version>0&&B.__version!==R.version){Y(B,R,S);return}e.bindTexture(i.TEXTURE_3D,B.__webglTexture,i.TEXTURE0+S)}function W(R,S){const B=n.get(R);if(R.version>0&&B.__version!==R.version){it(B,R,S);return}e.bindTexture(i.TEXTURE_CUBE_MAP,B.__webglTexture,i.TEXTURE0+S)}const ct={[lo]:i.REPEAT,[ls]:i.CLAMP_TO_EDGE,[Yl]:i.MIRRORED_REPEAT},_t={[tn]:i.NEAREST,[Xp]:i.NEAREST_MIPMAP_NEAREST,[da]:i.NEAREST_MIPMAP_LINEAR,[mn]:i.LINEAR,[Go]:i.LINEAR_MIPMAP_NEAREST,[qn]:i.LINEAR_MIPMAP_LINEAR},Ct={[jp]:i.NEVER,[nm]:i.ALWAYS,[Zp]:i.LESS,[kf]:i.LEQUAL,[Jp]:i.EQUAL,[em]:i.GEQUAL,[Qp]:i.GREATER,[tm]:i.NOTEQUAL};function Wt(R,S){if(S.type===si&&t.has("OES_texture_float_linear")===!1&&(S.magFilter===mn||S.magFilter===Go||S.magFilter===da||S.magFilter===qn||S.minFilter===mn||S.minFilter===Go||S.minFilter===da||S.minFilter===qn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(R,i.TEXTURE_WRAP_S,ct[S.wrapS]),i.texParameteri(R,i.TEXTURE_WRAP_T,ct[S.wrapT]),(R===i.TEXTURE_3D||R===i.TEXTURE_2D_ARRAY)&&i.texParameteri(R,i.TEXTURE_WRAP_R,ct[S.wrapR]),i.texParameteri(R,i.TEXTURE_MAG_FILTER,_t[S.magFilter]),i.texParameteri(R,i.TEXTURE_MIN_FILTER,_t[S.minFilter]),S.compareFunction&&(i.texParameteri(R,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(R,i.TEXTURE_COMPARE_FUNC,Ct[S.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===tn||S.minFilter!==da&&S.minFilter!==qn||S.type===si&&t.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||n.get(S).__currentAnisotropy){const B=t.get("EXT_texture_filter_anisotropic");i.texParameterf(R,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,s.getMaxAnisotropy())),n.get(S).__currentAnisotropy=S.anisotropy}}}function ce(R,S){let B=!1;R.__webglInit===void 0&&(R.__webglInit=!0,S.addEventListener("dispose",A));const J=S.source;let et=f.get(J);et===void 0&&(et={},f.set(J,et));const j=q(S);if(j!==R.__cacheKey){et[j]===void 0&&(et[j]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,B=!0),et[j].usedTimes++;const Lt=et[R.__cacheKey];Lt!==void 0&&(et[R.__cacheKey].usedTimes--,Lt.usedTimes===0&&T(S)),R.__cacheKey=j,R.__webglTexture=et[j].texture}return B}function Y(R,S,B){let J=i.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(J=i.TEXTURE_2D_ARRAY),S.isData3DTexture&&(J=i.TEXTURE_3D);const et=ce(R,S),j=S.source;e.bindTexture(J,R.__webglTexture,i.TEXTURE0+B);const Lt=n.get(j);if(j.version!==Lt.__version||et===!0){e.activeTexture(i.TEXTURE0+B);const ft=re.getPrimaries(re.workingColorSpace),xt=S.colorSpace===Pi?null:re.getPrimaries(S.colorSpace),ie=S.colorSpace===Pi||ft===xt?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,S.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,S.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ie);let st=_(S.image,!1,s.maxTextureSize);st=xe(S,st);const Mt=r.convert(S.format,S.colorSpace),kt=r.convert(S.type);let zt=y(S.internalFormat,Mt,kt,S.colorSpace,S.isVideoTexture);Wt(J,S);let yt;const Qt=S.mipmaps,$t=S.isVideoTexture!==!0,_e=Lt.__version===void 0||et===!0,N=j.dataReady,ut=C(S,st);if(S.isDepthTexture)zt=M(S.format===er,S.type),_e&&($t?e.texStorage2D(i.TEXTURE_2D,1,zt,st.width,st.height):e.texImage2D(i.TEXTURE_2D,0,zt,st.width,st.height,0,Mt,kt,null));else if(S.isDataTexture)if(Qt.length>0){$t&&_e&&e.texStorage2D(i.TEXTURE_2D,ut,zt,Qt[0].width,Qt[0].height);for(let X=0,Q=Qt.length;X<Q;X++)yt=Qt[X],$t?N&&e.texSubImage2D(i.TEXTURE_2D,X,0,0,yt.width,yt.height,Mt,kt,yt.data):e.texImage2D(i.TEXTURE_2D,X,zt,yt.width,yt.height,0,Mt,kt,yt.data);S.generateMipmaps=!1}else $t?(_e&&e.texStorage2D(i.TEXTURE_2D,ut,zt,st.width,st.height),N&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,st.width,st.height,Mt,kt,st.data)):e.texImage2D(i.TEXTURE_2D,0,zt,st.width,st.height,0,Mt,kt,st.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){$t&&_e&&e.texStorage3D(i.TEXTURE_2D_ARRAY,ut,zt,Qt[0].width,Qt[0].height,st.depth);for(let X=0,Q=Qt.length;X<Q;X++)if(yt=Qt[X],S.format!==bn)if(Mt!==null)if($t){if(N)if(S.layerUpdates.size>0){const mt=gu(yt.width,yt.height,S.format,S.type);for(const dt of S.layerUpdates){const Ht=yt.data.subarray(dt*mt/yt.data.BYTES_PER_ELEMENT,(dt+1)*mt/yt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,X,0,0,dt,yt.width,yt.height,1,Mt,Ht)}S.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,X,0,0,0,yt.width,yt.height,st.depth,Mt,yt.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,X,zt,yt.width,yt.height,st.depth,0,yt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else $t?N&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,X,0,0,0,yt.width,yt.height,st.depth,Mt,kt,yt.data):e.texImage3D(i.TEXTURE_2D_ARRAY,X,zt,yt.width,yt.height,st.depth,0,Mt,kt,yt.data)}else{$t&&_e&&e.texStorage2D(i.TEXTURE_2D,ut,zt,Qt[0].width,Qt[0].height);for(let X=0,Q=Qt.length;X<Q;X++)yt=Qt[X],S.format!==bn?Mt!==null?$t?N&&e.compressedTexSubImage2D(i.TEXTURE_2D,X,0,0,yt.width,yt.height,Mt,yt.data):e.compressedTexImage2D(i.TEXTURE_2D,X,zt,yt.width,yt.height,0,yt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):$t?N&&e.texSubImage2D(i.TEXTURE_2D,X,0,0,yt.width,yt.height,Mt,kt,yt.data):e.texImage2D(i.TEXTURE_2D,X,zt,yt.width,yt.height,0,Mt,kt,yt.data)}else if(S.isDataArrayTexture)if($t){if(_e&&e.texStorage3D(i.TEXTURE_2D_ARRAY,ut,zt,st.width,st.height,st.depth),N)if(S.layerUpdates.size>0){const X=gu(st.width,st.height,S.format,S.type);for(const Q of S.layerUpdates){const mt=st.data.subarray(Q*X/st.data.BYTES_PER_ELEMENT,(Q+1)*X/st.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Q,st.width,st.height,1,Mt,kt,mt)}S.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,st.width,st.height,st.depth,Mt,kt,st.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,zt,st.width,st.height,st.depth,0,Mt,kt,st.data);else if(S.isData3DTexture)$t?(_e&&e.texStorage3D(i.TEXTURE_3D,ut,zt,st.width,st.height,st.depth),N&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,st.width,st.height,st.depth,Mt,kt,st.data)):e.texImage3D(i.TEXTURE_3D,0,zt,st.width,st.height,st.depth,0,Mt,kt,st.data);else if(S.isFramebufferTexture){if(_e)if($t)e.texStorage2D(i.TEXTURE_2D,ut,zt,st.width,st.height);else{let X=st.width,Q=st.height;for(let mt=0;mt<ut;mt++)e.texImage2D(i.TEXTURE_2D,mt,zt,X,Q,0,Mt,kt,null),X>>=1,Q>>=1}}else if(Qt.length>0){if($t&&_e){const X=Nt(Qt[0]);e.texStorage2D(i.TEXTURE_2D,ut,zt,X.width,X.height)}for(let X=0,Q=Qt.length;X<Q;X++)yt=Qt[X],$t?N&&e.texSubImage2D(i.TEXTURE_2D,X,0,0,Mt,kt,yt):e.texImage2D(i.TEXTURE_2D,X,zt,Mt,kt,yt);S.generateMipmaps=!1}else if($t){if(_e){const X=Nt(st);e.texStorage2D(i.TEXTURE_2D,ut,zt,X.width,X.height)}N&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,Mt,kt,st)}else e.texImage2D(i.TEXTURE_2D,0,zt,Mt,kt,st);m(S)&&p(J),Lt.__version=j.version,S.onUpdate&&S.onUpdate(S)}R.__version=S.version}function it(R,S,B){if(S.image.length!==6)return;const J=ce(R,S),et=S.source;e.bindTexture(i.TEXTURE_CUBE_MAP,R.__webglTexture,i.TEXTURE0+B);const j=n.get(et);if(et.version!==j.__version||J===!0){e.activeTexture(i.TEXTURE0+B);const Lt=re.getPrimaries(re.workingColorSpace),ft=S.colorSpace===Pi?null:re.getPrimaries(S.colorSpace),xt=S.colorSpace===Pi||Lt===ft?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,S.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,S.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,xt);const ie=S.isCompressedTexture||S.image[0].isCompressedTexture,st=S.image[0]&&S.image[0].isDataTexture,Mt=[];for(let Q=0;Q<6;Q++)!ie&&!st?Mt[Q]=_(S.image[Q],!0,s.maxCubemapSize):Mt[Q]=st?S.image[Q].image:S.image[Q],Mt[Q]=xe(S,Mt[Q]);const kt=Mt[0],zt=r.convert(S.format,S.colorSpace),yt=r.convert(S.type),Qt=y(S.internalFormat,zt,yt,S.colorSpace),$t=S.isVideoTexture!==!0,_e=j.__version===void 0||J===!0,N=et.dataReady;let ut=C(S,kt);Wt(i.TEXTURE_CUBE_MAP,S);let X;if(ie){$t&&_e&&e.texStorage2D(i.TEXTURE_CUBE_MAP,ut,Qt,kt.width,kt.height);for(let Q=0;Q<6;Q++){X=Mt[Q].mipmaps;for(let mt=0;mt<X.length;mt++){const dt=X[mt];S.format!==bn?zt!==null?$t?N&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,mt,0,0,dt.width,dt.height,zt,dt.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,mt,Qt,dt.width,dt.height,0,dt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):$t?N&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,mt,0,0,dt.width,dt.height,zt,yt,dt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,mt,Qt,dt.width,dt.height,0,zt,yt,dt.data)}}}else{if(X=S.mipmaps,$t&&_e){X.length>0&&ut++;const Q=Nt(Mt[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,ut,Qt,Q.width,Q.height)}for(let Q=0;Q<6;Q++)if(st){$t?N&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,Mt[Q].width,Mt[Q].height,zt,yt,Mt[Q].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,Qt,Mt[Q].width,Mt[Q].height,0,zt,yt,Mt[Q].data);for(let mt=0;mt<X.length;mt++){const Ht=X[mt].image[Q].image;$t?N&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,mt+1,0,0,Ht.width,Ht.height,zt,yt,Ht.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,mt+1,Qt,Ht.width,Ht.height,0,zt,yt,Ht.data)}}else{$t?N&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,zt,yt,Mt[Q]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,Qt,zt,yt,Mt[Q]);for(let mt=0;mt<X.length;mt++){const dt=X[mt];$t?N&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,mt+1,0,0,zt,yt,dt.image[Q]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,mt+1,Qt,zt,yt,dt.image[Q])}}}m(S)&&p(i.TEXTURE_CUBE_MAP),j.__version=et.version,S.onUpdate&&S.onUpdate(S)}R.__version=S.version}function St(R,S,B,J,et,j){const Lt=r.convert(B.format,B.colorSpace),ft=r.convert(B.type),xt=y(B.internalFormat,Lt,ft,B.colorSpace),ie=n.get(S),st=n.get(B);if(st.__renderTarget=S,!ie.__hasExternalTextures){const Mt=Math.max(1,S.width>>j),kt=Math.max(1,S.height>>j);et===i.TEXTURE_3D||et===i.TEXTURE_2D_ARRAY?e.texImage3D(et,j,xt,Mt,kt,S.depth,0,Lt,ft,null):e.texImage2D(et,j,xt,Mt,kt,0,Lt,ft,null)}e.bindFramebuffer(i.FRAMEBUFFER,R),Jt(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,J,et,st.__webglTexture,0,Zt(S)):(et===i.TEXTURE_2D||et>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&et<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,J,et,st.__webglTexture,j),e.bindFramebuffer(i.FRAMEBUFFER,null)}function ot(R,S,B){if(i.bindRenderbuffer(i.RENDERBUFFER,R),S.depthBuffer){const J=S.depthTexture,et=J&&J.isDepthTexture?J.type:null,j=M(S.stencilBuffer,et),Lt=S.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ft=Zt(S);Jt(S)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ft,j,S.width,S.height):B?i.renderbufferStorageMultisample(i.RENDERBUFFER,ft,j,S.width,S.height):i.renderbufferStorage(i.RENDERBUFFER,j,S.width,S.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Lt,i.RENDERBUFFER,R)}else{const J=S.textures;for(let et=0;et<J.length;et++){const j=J[et],Lt=r.convert(j.format,j.colorSpace),ft=r.convert(j.type),xt=y(j.internalFormat,Lt,ft,j.colorSpace),ie=Zt(S);B&&Jt(S)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,ie,xt,S.width,S.height):Jt(S)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ie,xt,S.width,S.height):i.renderbufferStorage(i.RENDERBUFFER,xt,S.width,S.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function It(R,S){if(S&&S.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(i.FRAMEBUFFER,R),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const J=n.get(S.depthTexture);J.__renderTarget=S,(!J.__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),Z(S.depthTexture,0);const et=J.__webglTexture,j=Zt(S);if(S.depthTexture.format===Ys)Jt(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,et,0,j):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,et,0);else if(S.depthTexture.format===er)Jt(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,et,0,j):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,et,0);else throw new Error("Unknown depthTexture format")}function Ot(R){const S=n.get(R),B=R.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==R.depthTexture){const J=R.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),J){const et=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,J.removeEventListener("dispose",et)};J.addEventListener("dispose",et),S.__depthDisposeCallback=et}S.__boundDepthTexture=J}if(R.depthTexture&&!S.__autoAllocateDepthBuffer){if(B)throw new Error("target.depthTexture not supported in Cube render targets");It(S.__webglFramebuffer,R)}else if(B){S.__webglDepthbuffer=[];for(let J=0;J<6;J++)if(e.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer[J]),S.__webglDepthbuffer[J]===void 0)S.__webglDepthbuffer[J]=i.createRenderbuffer(),ot(S.__webglDepthbuffer[J],R,!1);else{const et=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,j=S.__webglDepthbuffer[J];i.bindRenderbuffer(i.RENDERBUFFER,j),i.framebufferRenderbuffer(i.FRAMEBUFFER,et,i.RENDERBUFFER,j)}}else if(e.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=i.createRenderbuffer(),ot(S.__webglDepthbuffer,R,!1);else{const J=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,et=S.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,et),i.framebufferRenderbuffer(i.FRAMEBUFFER,J,i.RENDERBUFFER,et)}e.bindFramebuffer(i.FRAMEBUFFER,null)}function Xt(R,S,B){const J=n.get(R);S!==void 0&&St(J.__webglFramebuffer,R,R.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),B!==void 0&&Ot(R)}function Se(R){const S=R.texture,B=n.get(R),J=n.get(S);R.addEventListener("dispose",w);const et=R.textures,j=R.isWebGLCubeRenderTarget===!0,Lt=et.length>1;if(Lt||(J.__webglTexture===void 0&&(J.__webglTexture=i.createTexture()),J.__version=S.version,a.memory.textures++),j){B.__webglFramebuffer=[];for(let ft=0;ft<6;ft++)if(S.mipmaps&&S.mipmaps.length>0){B.__webglFramebuffer[ft]=[];for(let xt=0;xt<S.mipmaps.length;xt++)B.__webglFramebuffer[ft][xt]=i.createFramebuffer()}else B.__webglFramebuffer[ft]=i.createFramebuffer()}else{if(S.mipmaps&&S.mipmaps.length>0){B.__webglFramebuffer=[];for(let ft=0;ft<S.mipmaps.length;ft++)B.__webglFramebuffer[ft]=i.createFramebuffer()}else B.__webglFramebuffer=i.createFramebuffer();if(Lt)for(let ft=0,xt=et.length;ft<xt;ft++){const ie=n.get(et[ft]);ie.__webglTexture===void 0&&(ie.__webglTexture=i.createTexture(),a.memory.textures++)}if(R.samples>0&&Jt(R)===!1){B.__webglMultisampledFramebuffer=i.createFramebuffer(),B.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let ft=0;ft<et.length;ft++){const xt=et[ft];B.__webglColorRenderbuffer[ft]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,B.__webglColorRenderbuffer[ft]);const ie=r.convert(xt.format,xt.colorSpace),st=r.convert(xt.type),Mt=y(xt.internalFormat,ie,st,xt.colorSpace,R.isXRRenderTarget===!0),kt=Zt(R);i.renderbufferStorageMultisample(i.RENDERBUFFER,kt,Mt,R.width,R.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ft,i.RENDERBUFFER,B.__webglColorRenderbuffer[ft])}i.bindRenderbuffer(i.RENDERBUFFER,null),R.depthBuffer&&(B.__webglDepthRenderbuffer=i.createRenderbuffer(),ot(B.__webglDepthRenderbuffer,R,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(j){e.bindTexture(i.TEXTURE_CUBE_MAP,J.__webglTexture),Wt(i.TEXTURE_CUBE_MAP,S);for(let ft=0;ft<6;ft++)if(S.mipmaps&&S.mipmaps.length>0)for(let xt=0;xt<S.mipmaps.length;xt++)St(B.__webglFramebuffer[ft][xt],R,S,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,xt);else St(B.__webglFramebuffer[ft],R,S,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,0);m(S)&&p(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(Lt){for(let ft=0,xt=et.length;ft<xt;ft++){const ie=et[ft],st=n.get(ie);e.bindTexture(i.TEXTURE_2D,st.__webglTexture),Wt(i.TEXTURE_2D,ie),St(B.__webglFramebuffer,R,ie,i.COLOR_ATTACHMENT0+ft,i.TEXTURE_2D,0),m(ie)&&p(i.TEXTURE_2D)}e.unbindTexture()}else{let ft=i.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(ft=R.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(ft,J.__webglTexture),Wt(ft,S),S.mipmaps&&S.mipmaps.length>0)for(let xt=0;xt<S.mipmaps.length;xt++)St(B.__webglFramebuffer[xt],R,S,i.COLOR_ATTACHMENT0,ft,xt);else St(B.__webglFramebuffer,R,S,i.COLOR_ATTACHMENT0,ft,0);m(S)&&p(ft),e.unbindTexture()}R.depthBuffer&&Ot(R)}function ne(R){const S=R.textures;for(let B=0,J=S.length;B<J;B++){const et=S[B];if(m(et)){const j=x(R),Lt=n.get(et).__webglTexture;e.bindTexture(j,Lt),p(j),e.unbindTexture()}}}const Ce=[],z=[];function _n(R){if(R.samples>0){if(Jt(R)===!1){const S=R.textures,B=R.width,J=R.height;let et=i.COLOR_BUFFER_BIT;const j=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Lt=n.get(R),ft=S.length>1;if(ft)for(let xt=0;xt<S.length;xt++)e.bindFramebuffer(i.FRAMEBUFFER,Lt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+xt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,Lt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+xt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,Lt.__webglMultisampledFramebuffer),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Lt.__webglFramebuffer);for(let xt=0;xt<S.length;xt++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(et|=i.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(et|=i.STENCIL_BUFFER_BIT)),ft){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Lt.__webglColorRenderbuffer[xt]);const ie=n.get(S[xt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,ie,0)}i.blitFramebuffer(0,0,B,J,0,0,B,J,et,i.NEAREST),l===!0&&(Ce.length=0,z.length=0,Ce.push(i.COLOR_ATTACHMENT0+xt),R.depthBuffer&&R.resolveDepthBuffer===!1&&(Ce.push(j),z.push(j),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,z)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Ce))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ft)for(let xt=0;xt<S.length;xt++){e.bindFramebuffer(i.FRAMEBUFFER,Lt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+xt,i.RENDERBUFFER,Lt.__webglColorRenderbuffer[xt]);const ie=n.get(S[xt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,Lt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+xt,i.TEXTURE_2D,ie,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Lt.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.resolveDepthBuffer===!1&&l){const S=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[S])}}}function Zt(R){return Math.min(s.maxSamples,R.samples)}function Jt(R){const S=n.get(R);return R.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function Ut(R){const S=a.render.frame;h.get(R)!==S&&(h.set(R,S),R.update())}function xe(R,S){const B=R.colorSpace,J=R.format,et=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||B!==ar&&B!==Pi&&(re.getTransfer(B)===de?(J!==bn||et!==fi)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",B)),S}function Nt(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(c.width=R.naturalWidth||R.width,c.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(c.width=R.displayWidth,c.height=R.displayHeight):(c.width=R.width,c.height=R.height),c}this.allocateTextureUnit=H,this.resetTextureUnits=K,this.setTexture2D=Z,this.setTexture2DArray=$,this.setTexture3D=nt,this.setTextureCube=W,this.rebindTextures=Xt,this.setupRenderTarget=Se,this.updateRenderTargetMipmap=ne,this.updateMultisampleRenderTarget=_n,this.setupDepthRenderbuffer=Ot,this.setupFrameBufferTexture=St,this.useMultisampledRTT=Jt}function ox(i,t){function e(n,s=Pi){let r;const a=re.getTransfer(s);if(n===fi)return i.UNSIGNED_BYTE;if(n===Vc)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Wc)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Rf)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Af)return i.BYTE;if(n===wf)return i.SHORT;if(n===qr)return i.UNSIGNED_SHORT;if(n===Gc)return i.INT;if(n===fs)return i.UNSIGNED_INT;if(n===si)return i.FLOAT;if(n===ia)return i.HALF_FLOAT;if(n===Cf)return i.ALPHA;if(n===Lf)return i.RGB;if(n===bn)return i.RGBA;if(n===Pf)return i.LUMINANCE;if(n===Df)return i.LUMINANCE_ALPHA;if(n===Ys)return i.DEPTH_COMPONENT;if(n===er)return i.DEPTH_STENCIL;if(n===If)return i.RED;if(n===Xc)return i.RED_INTEGER;if(n===Nf)return i.RG;if(n===$c)return i.RG_INTEGER;if(n===qc)return i.RGBA_INTEGER;if(n===Ka||n===ja||n===Za||n===Ja)if(a===de)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Ka)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===ja)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Za)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Ja)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Ka)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===ja)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Za)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Ja)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Kl||n===jl||n===Zl||n===Jl)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Kl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===jl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Zl)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Jl)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Ql||n===tc||n===ec)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Ql||n===tc)return a===de?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===ec)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===nc||n===ic||n===sc||n===rc||n===ac||n===oc||n===lc||n===cc||n===hc||n===uc||n===fc||n===dc||n===pc||n===mc)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===nc)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===ic)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===sc)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===rc)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===ac)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===oc)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===lc)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===cc)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===hc)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===uc)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===fc)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===dc)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===pc)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===mc)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Qa||n===gc||n===_c)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===Qa)return a===de?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===gc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===_c)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Uf||n===vc||n===xc||n===Mc)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===Qa)return r.COMPRESSED_RED_RGTC1_EXT;if(n===vc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===xc)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Mc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===tr?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}class lx extends yn{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}class Fn extends qe{constructor(){super(),this.isGroup=!0,this.type="Group"}}const cx={type:"move"};class gl{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Fn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Fn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new U,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new U),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Fn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new U,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new U),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(const _ of t.hand.values()){const m=e.getJointPose(_,n),p=this._getHandJoint(c,_);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],f=h.position.distanceTo(u.position),d=.02,g=.005;c.inputState.pinching&&f>d+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&f<=d-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(cx)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new Fn;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}const hx=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,ux=`
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

}`;class fx{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){const s=new $e,r=t.properties.get(s);r.__webglTexture=e.texture,(e.depthNear!=n.depthNear||e.depthFar!=n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=s}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new Bn({vertexShader:hx,fragmentShader:ux,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Re(new cs(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class dx extends or{constructor(t,e){super();const n=this;let s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,f=null,d=null,g=null;const _=new fx,m=e.getContextAttributes();let p=null,x=null;const y=[],M=[],C=new Kt;let A=null;const w=new yn;w.viewport=new Pe;const D=new yn;D.viewport=new Pe;const T=[w,D],b=new lx;let I=null,K=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let it=y[Y];return it===void 0&&(it=new gl,y[Y]=it),it.getTargetRaySpace()},this.getControllerGrip=function(Y){let it=y[Y];return it===void 0&&(it=new gl,y[Y]=it),it.getGripSpace()},this.getHand=function(Y){let it=y[Y];return it===void 0&&(it=new gl,y[Y]=it),it.getHandSpace()};function H(Y){const it=M.indexOf(Y.inputSource);if(it===-1)return;const St=y[it];St!==void 0&&(St.update(Y.inputSource,Y.frame,c||a),St.dispatchEvent({type:Y.type,data:Y.inputSource}))}function q(){s.removeEventListener("select",H),s.removeEventListener("selectstart",H),s.removeEventListener("selectend",H),s.removeEventListener("squeeze",H),s.removeEventListener("squeezestart",H),s.removeEventListener("squeezeend",H),s.removeEventListener("end",q),s.removeEventListener("inputsourceschange",Z);for(let Y=0;Y<y.length;Y++){const it=M[Y];it!==null&&(M[Y]=null,y[Y].disconnect(it))}I=null,K=null,_.reset(),t.setRenderTarget(p),d=null,f=null,u=null,s=null,x=null,ce.stop(),n.isPresenting=!1,t.setPixelRatio(A),t.setSize(C.width,C.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){r=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){o=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(Y){c=Y},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(Y){if(s=Y,s!==null){if(p=t.getRenderTarget(),s.addEventListener("select",H),s.addEventListener("selectstart",H),s.addEventListener("selectend",H),s.addEventListener("squeeze",H),s.addEventListener("squeezestart",H),s.addEventListener("squeezeend",H),s.addEventListener("end",q),s.addEventListener("inputsourceschange",Z),m.xrCompatible!==!0&&await e.makeXRCompatible(),A=t.getPixelRatio(),t.getSize(C),s.renderState.layers===void 0){const it={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(s,e,it),s.updateRenderState({baseLayer:d}),t.setPixelRatio(1),t.setSize(d.framebufferWidth,d.framebufferHeight,!1),x=new ds(d.framebufferWidth,d.framebufferHeight,{format:bn,type:fi,colorSpace:t.outputColorSpace,stencilBuffer:m.stencil})}else{let it=null,St=null,ot=null;m.depth&&(ot=m.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,it=m.stencil?er:Ys,St=m.stencil?tr:fs);const It={colorFormat:e.RGBA8,depthFormat:ot,scaleFactor:r};u=new XRWebGLBinding(s,e),f=u.createProjectionLayer(It),s.updateRenderState({layers:[f]}),t.setPixelRatio(1),t.setSize(f.textureWidth,f.textureHeight,!1),x=new ds(f.textureWidth,f.textureHeight,{format:bn,type:fi,depthTexture:new Kf(f.textureWidth,f.textureHeight,St,void 0,void 0,void 0,void 0,void 0,void 0,it),stencilBuffer:m.stencil,colorSpace:t.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),ce.setContext(s),ce.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function Z(Y){for(let it=0;it<Y.removed.length;it++){const St=Y.removed[it],ot=M.indexOf(St);ot>=0&&(M[ot]=null,y[ot].disconnect(St))}for(let it=0;it<Y.added.length;it++){const St=Y.added[it];let ot=M.indexOf(St);if(ot===-1){for(let Ot=0;Ot<y.length;Ot++)if(Ot>=M.length){M.push(St),ot=Ot;break}else if(M[Ot]===null){M[Ot]=St,ot=Ot;break}if(ot===-1)break}const It=y[ot];It&&It.connect(St)}}const $=new U,nt=new U;function W(Y,it,St){$.setFromMatrixPosition(it.matrixWorld),nt.setFromMatrixPosition(St.matrixWorld);const ot=$.distanceTo(nt),It=it.projectionMatrix.elements,Ot=St.projectionMatrix.elements,Xt=It[14]/(It[10]-1),Se=It[14]/(It[10]+1),ne=(It[9]+1)/It[5],Ce=(It[9]-1)/It[5],z=(It[8]-1)/It[0],_n=(Ot[8]+1)/Ot[0],Zt=Xt*z,Jt=Xt*_n,Ut=ot/(-z+_n),xe=Ut*-z;if(it.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(xe),Y.translateZ(Ut),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),It[10]===-1)Y.projectionMatrix.copy(it.projectionMatrix),Y.projectionMatrixInverse.copy(it.projectionMatrixInverse);else{const Nt=Xt+Ut,R=Se+Ut,S=Zt-xe,B=Jt+(ot-xe),J=ne*Se/R*Nt,et=Ce*Se/R*Nt;Y.projectionMatrix.makePerspective(S,B,J,et,Nt,R),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function ct(Y,it){it===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(it.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(s===null)return;let it=Y.near,St=Y.far;_.texture!==null&&(_.depthNear>0&&(it=_.depthNear),_.depthFar>0&&(St=_.depthFar)),b.near=D.near=w.near=it,b.far=D.far=w.far=St,(I!==b.near||K!==b.far)&&(s.updateRenderState({depthNear:b.near,depthFar:b.far}),I=b.near,K=b.far),w.layers.mask=Y.layers.mask|2,D.layers.mask=Y.layers.mask|4,b.layers.mask=w.layers.mask|D.layers.mask;const ot=Y.parent,It=b.cameras;ct(b,ot);for(let Ot=0;Ot<It.length;Ot++)ct(It[Ot],ot);It.length===2?W(b,w,D):b.projectionMatrix.copy(w.projectionMatrix),_t(Y,b,ot)};function _t(Y,it,St){St===null?Y.matrix.copy(it.matrixWorld):(Y.matrix.copy(St.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(it.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(it.projectionMatrix),Y.projectionMatrixInverse.copy(it.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=Sc*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return b},this.getFoveation=function(){if(!(f===null&&d===null))return l},this.setFoveation=function(Y){l=Y,f!==null&&(f.fixedFoveation=Y),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=Y)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(b)};let Ct=null;function Wt(Y,it){if(h=it.getViewerPose(c||a),g=it,h!==null){const St=h.views;d!==null&&(t.setRenderTargetFramebuffer(x,d.framebuffer),t.setRenderTarget(x));let ot=!1;St.length!==b.cameras.length&&(b.cameras.length=0,ot=!0);for(let Ot=0;Ot<St.length;Ot++){const Xt=St[Ot];let Se=null;if(d!==null)Se=d.getViewport(Xt);else{const Ce=u.getViewSubImage(f,Xt);Se=Ce.viewport,Ot===0&&(t.setRenderTargetTextures(x,Ce.colorTexture,f.ignoreDepthValues?void 0:Ce.depthStencilTexture),t.setRenderTarget(x))}let ne=T[Ot];ne===void 0&&(ne=new yn,ne.layers.enable(Ot),ne.viewport=new Pe,T[Ot]=ne),ne.matrix.fromArray(Xt.transform.matrix),ne.matrix.decompose(ne.position,ne.quaternion,ne.scale),ne.projectionMatrix.fromArray(Xt.projectionMatrix),ne.projectionMatrixInverse.copy(ne.projectionMatrix).invert(),ne.viewport.set(Se.x,Se.y,Se.width,Se.height),Ot===0&&(b.matrix.copy(ne.matrix),b.matrix.decompose(b.position,b.quaternion,b.scale)),ot===!0&&b.cameras.push(ne)}const It=s.enabledFeatures;if(It&&It.includes("depth-sensing")){const Ot=u.getDepthInformation(St[0]);Ot&&Ot.isValid&&Ot.texture&&_.init(t,Ot,s.renderState)}}for(let St=0;St<y.length;St++){const ot=M[St],It=y[St];ot!==null&&It!==void 0&&It.update(ot,it,c||a)}Ct&&Ct(Y,it),it.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:it}),g=null}const ce=new Yf;ce.setAnimationLoop(Wt),this.setAnimationLoop=function(Y){Ct=Y},this.dispose=function(){}}}const ns=new di,px=new be;function mx(i,t){function e(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,Wf(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,x,y,M){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),u(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p)):p.isMeshStandardMaterial?(r(m,p),f(m,p),p.isMeshPhysicalMaterial&&d(m,p,M)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),_(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?l(m,p,x,y):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,e(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Qe&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,e(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Qe&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,e(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,e(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,e(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const x=t.get(p),y=x.envMap,M=x.envMapRotation;y&&(m.envMap.value=y,ns.copy(M),ns.x*=-1,ns.y*=-1,ns.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(ns.y*=-1,ns.z*=-1),m.envMapRotation.value.setFromMatrix4(px.makeRotationFromEuler(ns)),m.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,e(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,e(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,x,y){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*x,m.scale.value=y*.5,p.map&&(m.map.value=p.map,e(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function u(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function f(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,e(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,e(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function d(m,p,x){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,e(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,e(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,e(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,e(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,e(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Qe&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,e(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,e(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=x.texture,m.transmissionSamplerSize.value.set(x.width,x.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,e(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,e(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,e(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,e(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,e(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function _(m,p){const x=t.get(p).light;m.referencePosition.value.setFromMatrixPosition(x.matrixWorld),m.nearDistance.value=x.shadow.camera.near,m.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function gx(i,t,e,n){let s={},r={},a=[];const o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(x,y){const M=y.program;n.uniformBlockBinding(x,M)}function c(x,y){let M=s[x.id];M===void 0&&(g(x),M=h(x),s[x.id]=M,x.addEventListener("dispose",m));const C=y.program;n.updateUBOMapping(x,C);const A=t.render.frame;r[x.id]!==A&&(f(x),r[x.id]=A)}function h(x){const y=u();x.__bindingPointIndex=y;const M=i.createBuffer(),C=x.__size,A=x.usage;return i.bindBuffer(i.UNIFORM_BUFFER,M),i.bufferData(i.UNIFORM_BUFFER,C,A),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,y,M),M}function u(){for(let x=0;x<o;x++)if(a.indexOf(x)===-1)return a.push(x),x;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(x){const y=s[x.id],M=x.uniforms,C=x.__cache;i.bindBuffer(i.UNIFORM_BUFFER,y);for(let A=0,w=M.length;A<w;A++){const D=Array.isArray(M[A])?M[A]:[M[A]];for(let T=0,b=D.length;T<b;T++){const I=D[T];if(d(I,A,T,C)===!0){const K=I.__offset,H=Array.isArray(I.value)?I.value:[I.value];let q=0;for(let Z=0;Z<H.length;Z++){const $=H[Z],nt=_($);typeof $=="number"||typeof $=="boolean"?(I.__data[0]=$,i.bufferSubData(i.UNIFORM_BUFFER,K+q,I.__data)):$.isMatrix3?(I.__data[0]=$.elements[0],I.__data[1]=$.elements[1],I.__data[2]=$.elements[2],I.__data[3]=0,I.__data[4]=$.elements[3],I.__data[5]=$.elements[4],I.__data[6]=$.elements[5],I.__data[7]=0,I.__data[8]=$.elements[6],I.__data[9]=$.elements[7],I.__data[10]=$.elements[8],I.__data[11]=0):($.toArray(I.__data,q),q+=nt.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,K,I.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function d(x,y,M,C){const A=x.value,w=y+"_"+M;if(C[w]===void 0)return typeof A=="number"||typeof A=="boolean"?C[w]=A:C[w]=A.clone(),!0;{const D=C[w];if(typeof A=="number"||typeof A=="boolean"){if(D!==A)return C[w]=A,!0}else if(D.equals(A)===!1)return D.copy(A),!0}return!1}function g(x){const y=x.uniforms;let M=0;const C=16;for(let w=0,D=y.length;w<D;w++){const T=Array.isArray(y[w])?y[w]:[y[w]];for(let b=0,I=T.length;b<I;b++){const K=T[b],H=Array.isArray(K.value)?K.value:[K.value];for(let q=0,Z=H.length;q<Z;q++){const $=H[q],nt=_($),W=M%C,ct=W%nt.boundary,_t=W+ct;M+=ct,_t!==0&&C-_t<nt.storage&&(M+=C-_t),K.__data=new Float32Array(nt.storage/Float32Array.BYTES_PER_ELEMENT),K.__offset=M,M+=nt.storage}}}const A=M%C;return A>0&&(M+=C-A),x.__size=M,x.__cache={},this}function _(x){const y={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(y.boundary=4,y.storage=4):x.isVector2?(y.boundary=8,y.storage=8):x.isVector3||x.isColor?(y.boundary=16,y.storage=12):x.isVector4?(y.boundary=16,y.storage=16):x.isMatrix3?(y.boundary=48,y.storage=48):x.isMatrix4?(y.boundary=64,y.storage=64):x.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",x),y}function m(x){const y=x.target;y.removeEventListener("dispose",m);const M=a.indexOf(y.__bindingPointIndex);a.splice(M,1),i.deleteBuffer(s[y.id]),delete s[y.id],delete r[y.id]}function p(){for(const x in s)i.deleteBuffer(s[x]);a=[],s={},r={}}return{bind:l,update:c,dispose:p}}class _x{constructor(t={}){const{canvas:e=sm(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:f=!1}=t;this.isWebGLRenderer=!0;let d;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=n.getContextAttributes().alpha}else d=a;const g=new Uint32Array(4),_=new Int32Array(4);let m=null,p=null;const x=[],y=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Mn,this.toneMapping=Oi,this.toneMappingExposure=1;const M=this;let C=!1,A=0,w=0,D=null,T=-1,b=null;const I=new Pe,K=new Pe;let H=null;const q=new oe(0);let Z=0,$=e.width,nt=e.height,W=1,ct=null,_t=null;const Ct=new Pe(0,0,$,nt),Wt=new Pe(0,0,$,nt);let ce=!1;const Y=new qf;let it=!1,St=!1;const ot=new be,It=new be,Ot=new U,Xt=new Pe,Se={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let ne=!1;function Ce(){return D===null?W:1}let z=n;function _n(E,k){return e.getContext(E,k)}try{const E={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Hc}`),e.addEventListener("webglcontextlost",Q,!1),e.addEventListener("webglcontextrestored",mt,!1),e.addEventListener("webglcontextcreationerror",dt,!1),z===null){const k="webgl2";if(z=_n(k,E),z===null)throw _n(k)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(E){throw console.error("THREE.WebGLRenderer: "+E.message),E}let Zt,Jt,Ut,xe,Nt,R,S,B,J,et,j,Lt,ft,xt,ie,st,Mt,kt,zt,yt,Qt,$t,_e,N;function ut(){Zt=new S_(z),Zt.init(),$t=new ox(z,Zt),Jt=new m_(z,Zt,t,$t),Ut=new sx(z,Zt),Jt.reverseDepthBuffer&&f&&Ut.buffers.depth.setReversed(!0),xe=new T_(z),Nt=new Vv,R=new ax(z,Zt,Ut,Nt,Jt,$t,xe),S=new __(M),B=new y_(M),J=new Pm(z),_e=new d_(z,J),et=new E_(z,J,xe,_e),j=new w_(z,et,J,xe),zt=new A_(z,Jt,R),st=new g_(Nt),Lt=new Gv(M,S,B,Zt,Jt,_e,st),ft=new mx(M,Nt),xt=new Xv,ie=new Zv(Zt),kt=new f_(M,S,B,Ut,j,d,l),Mt=new nx(M,j,Jt),N=new gx(z,xe,Jt,Ut),yt=new p_(z,Zt,xe),Qt=new b_(z,Zt,xe),xe.programs=Lt.programs,M.capabilities=Jt,M.extensions=Zt,M.properties=Nt,M.renderLists=xt,M.shadowMap=Mt,M.state=Ut,M.info=xe}ut();const X=new dx(M,z);this.xr=X,this.getContext=function(){return z},this.getContextAttributes=function(){return z.getContextAttributes()},this.forceContextLoss=function(){const E=Zt.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){const E=Zt.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return W},this.setPixelRatio=function(E){E!==void 0&&(W=E,this.setSize($,nt,!1))},this.getSize=function(E){return E.set($,nt)},this.setSize=function(E,k,G=!0){if(X.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}$=E,nt=k,e.width=Math.floor(E*W),e.height=Math.floor(k*W),G===!0&&(e.style.width=E+"px",e.style.height=k+"px"),this.setViewport(0,0,E,k)},this.getDrawingBufferSize=function(E){return E.set($*W,nt*W).floor()},this.setDrawingBufferSize=function(E,k,G){$=E,nt=k,W=G,e.width=Math.floor(E*G),e.height=Math.floor(k*G),this.setViewport(0,0,E,k)},this.getCurrentViewport=function(E){return E.copy(I)},this.getViewport=function(E){return E.copy(Ct)},this.setViewport=function(E,k,G,V){E.isVector4?Ct.set(E.x,E.y,E.z,E.w):Ct.set(E,k,G,V),Ut.viewport(I.copy(Ct).multiplyScalar(W).round())},this.getScissor=function(E){return E.copy(Wt)},this.setScissor=function(E,k,G,V){E.isVector4?Wt.set(E.x,E.y,E.z,E.w):Wt.set(E,k,G,V),Ut.scissor(K.copy(Wt).multiplyScalar(W).round())},this.getScissorTest=function(){return ce},this.setScissorTest=function(E){Ut.setScissorTest(ce=E)},this.setOpaqueSort=function(E){ct=E},this.setTransparentSort=function(E){_t=E},this.getClearColor=function(E){return E.copy(kt.getClearColor())},this.setClearColor=function(){kt.setClearColor.apply(kt,arguments)},this.getClearAlpha=function(){return kt.getClearAlpha()},this.setClearAlpha=function(){kt.setClearAlpha.apply(kt,arguments)},this.clear=function(E=!0,k=!0,G=!0){let V=0;if(E){let O=!1;if(D!==null){const rt=D.texture.format;O=rt===qc||rt===$c||rt===Xc}if(O){const rt=D.texture.type,pt=rt===fi||rt===fs||rt===qr||rt===tr||rt===Vc||rt===Wc,Tt=kt.getClearColor(),At=kt.getClearAlpha(),Ft=Tt.r,Gt=Tt.g,wt=Tt.b;pt?(g[0]=Ft,g[1]=Gt,g[2]=wt,g[3]=At,z.clearBufferuiv(z.COLOR,0,g)):(_[0]=Ft,_[1]=Gt,_[2]=wt,_[3]=At,z.clearBufferiv(z.COLOR,0,_))}else V|=z.COLOR_BUFFER_BIT}k&&(V|=z.DEPTH_BUFFER_BIT),G&&(V|=z.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),z.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",Q,!1),e.removeEventListener("webglcontextrestored",mt,!1),e.removeEventListener("webglcontextcreationerror",dt,!1),xt.dispose(),ie.dispose(),Nt.dispose(),S.dispose(),B.dispose(),j.dispose(),_e.dispose(),N.dispose(),Lt.dispose(),X.dispose(),X.removeEventListener("sessionstart",fh),X.removeEventListener("sessionend",dh),ji.stop()};function Q(E){E.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),C=!0}function mt(){console.log("THREE.WebGLRenderer: Context Restored."),C=!1;const E=xe.autoReset,k=Mt.enabled,G=Mt.autoUpdate,V=Mt.needsUpdate,O=Mt.type;ut(),xe.autoReset=E,Mt.enabled=k,Mt.autoUpdate=G,Mt.needsUpdate=V,Mt.type=O}function dt(E){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function Ht(E){const k=E.target;k.removeEventListener("dispose",Ht),we(k)}function we(E){He(E),Nt.remove(E)}function He(E){const k=Nt.get(E).programs;k!==void 0&&(k.forEach(function(G){Lt.releaseProgram(G)}),E.isShaderMaterial&&Lt.releaseShaderCache(E))}this.renderBufferDirect=function(E,k,G,V,O,rt){k===null&&(k=Se);const pt=O.isMesh&&O.matrixWorld.determinant()<0,Tt=fp(E,k,G,V,O);Ut.setMaterial(V,pt);let At=G.index,Ft=1;if(V.wireframe===!0){if(At=et.getWireframeAttribute(G),At===void 0)return;Ft=2}const Gt=G.drawRange,wt=G.attributes.position;let ae=Gt.start*Ft,ve=(Gt.start+Gt.count)*Ft;rt!==null&&(ae=Math.max(ae,rt.start*Ft),ve=Math.min(ve,(rt.start+rt.count)*Ft)),At!==null?(ae=Math.max(ae,0),ve=Math.min(ve,At.count)):wt!=null&&(ae=Math.max(ae,0),ve=Math.min(ve,wt.count));const Me=ve-ae;if(Me<0||Me===1/0)return;_e.setup(O,V,Tt,G,At);let sn,he=yt;if(At!==null&&(sn=J.get(At),he=Qt,he.setIndex(sn)),O.isMesh)V.wireframe===!0?(Ut.setLineWidth(V.wireframeLinewidth*Ce()),he.setMode(z.LINES)):he.setMode(z.TRIANGLES);else if(O.isLine){let Pt=V.linewidth;Pt===void 0&&(Pt=1),Ut.setLineWidth(Pt*Ce()),O.isLineSegments?he.setMode(z.LINES):O.isLineLoop?he.setMode(z.LINE_LOOP):he.setMode(z.LINE_STRIP)}else O.isPoints?he.setMode(z.POINTS):O.isSprite&&he.setMode(z.TRIANGLES);if(O.isBatchedMesh)if(O._multiDrawInstances!==null)he.renderMultiDrawInstances(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount,O._multiDrawInstances);else if(Zt.get("WEBGL_multi_draw"))he.renderMultiDraw(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount);else{const Pt=O._multiDrawStarts,Kn=O._multiDrawCounts,ue=O._multiDrawCount,Ln=At?J.get(At).bytesPerElement:1,Ms=Nt.get(V).currentProgram.getUniforms();for(let ln=0;ln<ue;ln++)Ms.setValue(z,"_gl_DrawID",ln),he.render(Pt[ln]/Ln,Kn[ln])}else if(O.isInstancedMesh)he.renderInstances(ae,Me,O.count);else if(G.isInstancedBufferGeometry){const Pt=G._maxInstanceCount!==void 0?G._maxInstanceCount:1/0,Kn=Math.min(G.instanceCount,Pt);he.renderInstances(ae,Me,Kn)}else he.render(ae,Me)};function fe(E,k,G){E.transparent===!0&&E.side===Sn&&E.forceSinglePass===!1?(E.side=Qe,E.needsUpdate=!0,fa(E,k,G),E.side=ui,E.needsUpdate=!0,fa(E,k,G),E.side=Sn):fa(E,k,G)}this.compile=function(E,k,G=null){G===null&&(G=E),p=ie.get(G),p.init(k),y.push(p),G.traverseVisible(function(O){O.isLight&&O.layers.test(k.layers)&&(p.pushLight(O),O.castShadow&&p.pushShadow(O))}),E!==G&&E.traverseVisible(function(O){O.isLight&&O.layers.test(k.layers)&&(p.pushLight(O),O.castShadow&&p.pushShadow(O))}),p.setupLights();const V=new Set;return E.traverse(function(O){if(!(O.isMesh||O.isPoints||O.isLine||O.isSprite))return;const rt=O.material;if(rt)if(Array.isArray(rt))for(let pt=0;pt<rt.length;pt++){const Tt=rt[pt];fe(Tt,G,O),V.add(Tt)}else fe(rt,G,O),V.add(rt)}),y.pop(),p=null,V},this.compileAsync=function(E,k,G=null){const V=this.compile(E,k,G);return new Promise(O=>{function rt(){if(V.forEach(function(pt){Nt.get(pt).currentProgram.isReady()&&V.delete(pt)}),V.size===0){O(E);return}setTimeout(rt,10)}Zt.get("KHR_parallel_shader_compile")!==null?rt():setTimeout(rt,10)})};let Cn=null;function Yn(E){Cn&&Cn(E)}function fh(){ji.stop()}function dh(){ji.start()}const ji=new Yf;ji.setAnimationLoop(Yn),typeof self<"u"&&ji.setContext(self),this.setAnimationLoop=function(E){Cn=E,X.setAnimationLoop(E),E===null?ji.stop():ji.start()},X.addEventListener("sessionstart",fh),X.addEventListener("sessionend",dh),this.render=function(E,k){if(k!==void 0&&k.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(C===!0)return;if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),k.parent===null&&k.matrixWorldAutoUpdate===!0&&k.updateMatrixWorld(),X.enabled===!0&&X.isPresenting===!0&&(X.cameraAutoUpdate===!0&&X.updateCamera(k),k=X.getCamera()),E.isScene===!0&&E.onBeforeRender(M,E,k,D),p=ie.get(E,y.length),p.init(k),y.push(p),It.multiplyMatrices(k.projectionMatrix,k.matrixWorldInverse),Y.setFromProjectionMatrix(It),St=this.localClippingEnabled,it=st.init(this.clippingPlanes,St),m=xt.get(E,x.length),m.init(),x.push(m),X.enabled===!0&&X.isPresenting===!0){const rt=M.xr.getDepthSensingMesh();rt!==null&&Ho(rt,k,-1/0,M.sortObjects)}Ho(E,k,0,M.sortObjects),m.finish(),M.sortObjects===!0&&m.sort(ct,_t),ne=X.enabled===!1||X.isPresenting===!1||X.hasDepthSensing()===!1,ne&&kt.addToRenderList(m,E),this.info.render.frame++,it===!0&&st.beginShadows();const G=p.state.shadowsArray;Mt.render(G,E,k),it===!0&&st.endShadows(),this.info.autoReset===!0&&this.info.reset();const V=m.opaque,O=m.transmissive;if(p.setupLights(),k.isArrayCamera){const rt=k.cameras;if(O.length>0)for(let pt=0,Tt=rt.length;pt<Tt;pt++){const At=rt[pt];mh(V,O,E,At)}ne&&kt.render(E);for(let pt=0,Tt=rt.length;pt<Tt;pt++){const At=rt[pt];ph(m,E,At,At.viewport)}}else O.length>0&&mh(V,O,E,k),ne&&kt.render(E),ph(m,E,k);D!==null&&(R.updateMultisampleRenderTarget(D),R.updateRenderTargetMipmap(D)),E.isScene===!0&&E.onAfterRender(M,E,k),_e.resetDefaultState(),T=-1,b=null,y.pop(),y.length>0?(p=y[y.length-1],it===!0&&st.setGlobalState(M.clippingPlanes,p.state.camera)):p=null,x.pop(),x.length>0?m=x[x.length-1]:m=null};function Ho(E,k,G,V){if(E.visible===!1)return;if(E.layers.test(k.layers)){if(E.isGroup)G=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(k);else if(E.isLight)p.pushLight(E),E.castShadow&&p.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||Y.intersectsSprite(E)){V&&Xt.setFromMatrixPosition(E.matrixWorld).applyMatrix4(It);const pt=j.update(E),Tt=E.material;Tt.visible&&m.push(E,pt,Tt,G,Xt.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||Y.intersectsObject(E))){const pt=j.update(E),Tt=E.material;if(V&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Xt.copy(E.boundingSphere.center)):(pt.boundingSphere===null&&pt.computeBoundingSphere(),Xt.copy(pt.boundingSphere.center)),Xt.applyMatrix4(E.matrixWorld).applyMatrix4(It)),Array.isArray(Tt)){const At=pt.groups;for(let Ft=0,Gt=At.length;Ft<Gt;Ft++){const wt=At[Ft],ae=Tt[wt.materialIndex];ae&&ae.visible&&m.push(E,pt,ae,G,Xt.z,wt)}}else Tt.visible&&m.push(E,pt,Tt,G,Xt.z,null)}}const rt=E.children;for(let pt=0,Tt=rt.length;pt<Tt;pt++)Ho(rt[pt],k,G,V)}function ph(E,k,G,V){const O=E.opaque,rt=E.transmissive,pt=E.transparent;p.setupLightsView(G),it===!0&&st.setGlobalState(M.clippingPlanes,G),V&&Ut.viewport(I.copy(V)),O.length>0&&ua(O,k,G),rt.length>0&&ua(rt,k,G),pt.length>0&&ua(pt,k,G),Ut.buffers.depth.setTest(!0),Ut.buffers.depth.setMask(!0),Ut.buffers.color.setMask(!0),Ut.setPolygonOffset(!1)}function mh(E,k,G,V){if((G.isScene===!0?G.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[V.id]===void 0&&(p.state.transmissionRenderTarget[V.id]=new ds(1,1,{generateMipmaps:!0,type:Zt.has("EXT_color_buffer_half_float")||Zt.has("EXT_color_buffer_float")?ia:fi,minFilter:qn,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:re.workingColorSpace}));const rt=p.state.transmissionRenderTarget[V.id],pt=V.viewport||I;rt.setSize(pt.z,pt.w);const Tt=M.getRenderTarget();M.setRenderTarget(rt),M.getClearColor(q),Z=M.getClearAlpha(),Z<1&&M.setClearColor(16777215,.5),M.clear(),ne&&kt.render(G);const At=M.toneMapping;M.toneMapping=Oi;const Ft=V.viewport;if(V.viewport!==void 0&&(V.viewport=void 0),p.setupLightsView(V),it===!0&&st.setGlobalState(M.clippingPlanes,V),ua(E,G,V),R.updateMultisampleRenderTarget(rt),R.updateRenderTargetMipmap(rt),Zt.has("WEBGL_multisampled_render_to_texture")===!1){let Gt=!1;for(let wt=0,ae=k.length;wt<ae;wt++){const ve=k[wt],Me=ve.object,sn=ve.geometry,he=ve.material,Pt=ve.group;if(he.side===Sn&&Me.layers.test(V.layers)){const Kn=he.side;he.side=Qe,he.needsUpdate=!0,gh(Me,G,V,sn,he,Pt),he.side=Kn,he.needsUpdate=!0,Gt=!0}}Gt===!0&&(R.updateMultisampleRenderTarget(rt),R.updateRenderTargetMipmap(rt))}M.setRenderTarget(Tt),M.setClearColor(q,Z),Ft!==void 0&&(V.viewport=Ft),M.toneMapping=At}function ua(E,k,G){const V=k.isScene===!0?k.overrideMaterial:null;for(let O=0,rt=E.length;O<rt;O++){const pt=E[O],Tt=pt.object,At=pt.geometry,Ft=V===null?pt.material:V,Gt=pt.group;Tt.layers.test(G.layers)&&gh(Tt,k,G,At,Ft,Gt)}}function gh(E,k,G,V,O,rt){E.onBeforeRender(M,k,G,V,O,rt),E.modelViewMatrix.multiplyMatrices(G.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),O.onBeforeRender(M,k,G,V,E,rt),O.transparent===!0&&O.side===Sn&&O.forceSinglePass===!1?(O.side=Qe,O.needsUpdate=!0,M.renderBufferDirect(G,k,V,O,E,rt),O.side=ui,O.needsUpdate=!0,M.renderBufferDirect(G,k,V,O,E,rt),O.side=Sn):M.renderBufferDirect(G,k,V,O,E,rt),E.onAfterRender(M,k,G,V,O,rt)}function fa(E,k,G){k.isScene!==!0&&(k=Se);const V=Nt.get(E),O=p.state.lights,rt=p.state.shadowsArray,pt=O.state.version,Tt=Lt.getParameters(E,O.state,rt,k,G),At=Lt.getProgramCacheKey(Tt);let Ft=V.programs;V.environment=E.isMeshStandardMaterial?k.environment:null,V.fog=k.fog,V.envMap=(E.isMeshStandardMaterial?B:S).get(E.envMap||V.environment),V.envMapRotation=V.environment!==null&&E.envMap===null?k.environmentRotation:E.envMapRotation,Ft===void 0&&(E.addEventListener("dispose",Ht),Ft=new Map,V.programs=Ft);let Gt=Ft.get(At);if(Gt!==void 0){if(V.currentProgram===Gt&&V.lightsStateVersion===pt)return vh(E,Tt),Gt}else Tt.uniforms=Lt.getUniforms(E),E.onBeforeCompile(Tt,M),Gt=Lt.acquireProgram(Tt,At),Ft.set(At,Gt),V.uniforms=Tt.uniforms;const wt=V.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(wt.clippingPlanes=st.uniform),vh(E,Tt),V.needsLights=pp(E),V.lightsStateVersion=pt,V.needsLights&&(wt.ambientLightColor.value=O.state.ambient,wt.lightProbe.value=O.state.probe,wt.directionalLights.value=O.state.directional,wt.directionalLightShadows.value=O.state.directionalShadow,wt.spotLights.value=O.state.spot,wt.spotLightShadows.value=O.state.spotShadow,wt.rectAreaLights.value=O.state.rectArea,wt.ltc_1.value=O.state.rectAreaLTC1,wt.ltc_2.value=O.state.rectAreaLTC2,wt.pointLights.value=O.state.point,wt.pointLightShadows.value=O.state.pointShadow,wt.hemisphereLights.value=O.state.hemi,wt.directionalShadowMap.value=O.state.directionalShadowMap,wt.directionalShadowMatrix.value=O.state.directionalShadowMatrix,wt.spotShadowMap.value=O.state.spotShadowMap,wt.spotLightMatrix.value=O.state.spotLightMatrix,wt.spotLightMap.value=O.state.spotLightMap,wt.pointShadowMap.value=O.state.pointShadowMap,wt.pointShadowMatrix.value=O.state.pointShadowMatrix),V.currentProgram=Gt,V.uniformsList=null,Gt}function _h(E){if(E.uniformsList===null){const k=E.currentProgram.getUniforms();E.uniformsList=eo.seqWithValue(k.seq,E.uniforms)}return E.uniformsList}function vh(E,k){const G=Nt.get(E);G.outputColorSpace=k.outputColorSpace,G.batching=k.batching,G.batchingColor=k.batchingColor,G.instancing=k.instancing,G.instancingColor=k.instancingColor,G.instancingMorph=k.instancingMorph,G.skinning=k.skinning,G.morphTargets=k.morphTargets,G.morphNormals=k.morphNormals,G.morphColors=k.morphColors,G.morphTargetsCount=k.morphTargetsCount,G.numClippingPlanes=k.numClippingPlanes,G.numIntersection=k.numClipIntersection,G.vertexAlphas=k.vertexAlphas,G.vertexTangents=k.vertexTangents,G.toneMapping=k.toneMapping}function fp(E,k,G,V,O){k.isScene!==!0&&(k=Se),R.resetTextureUnits();const rt=k.fog,pt=V.isMeshStandardMaterial?k.environment:null,Tt=D===null?M.outputColorSpace:D.isXRRenderTarget===!0?D.texture.colorSpace:ar,At=(V.isMeshStandardMaterial?B:S).get(V.envMap||pt),Ft=V.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,Gt=!!G.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),wt=!!G.morphAttributes.position,ae=!!G.morphAttributes.normal,ve=!!G.morphAttributes.color;let Me=Oi;V.toneMapped&&(D===null||D.isXRRenderTarget===!0)&&(Me=M.toneMapping);const sn=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,he=sn!==void 0?sn.length:0,Pt=Nt.get(V),Kn=p.state.lights;if(it===!0&&(St===!0||E!==b)){const vn=E===b&&V.id===T;st.setState(V,E,vn)}let ue=!1;V.version===Pt.__version?(Pt.needsLights&&Pt.lightsStateVersion!==Kn.state.version||Pt.outputColorSpace!==Tt||O.isBatchedMesh&&Pt.batching===!1||!O.isBatchedMesh&&Pt.batching===!0||O.isBatchedMesh&&Pt.batchingColor===!0&&O.colorTexture===null||O.isBatchedMesh&&Pt.batchingColor===!1&&O.colorTexture!==null||O.isInstancedMesh&&Pt.instancing===!1||!O.isInstancedMesh&&Pt.instancing===!0||O.isSkinnedMesh&&Pt.skinning===!1||!O.isSkinnedMesh&&Pt.skinning===!0||O.isInstancedMesh&&Pt.instancingColor===!0&&O.instanceColor===null||O.isInstancedMesh&&Pt.instancingColor===!1&&O.instanceColor!==null||O.isInstancedMesh&&Pt.instancingMorph===!0&&O.morphTexture===null||O.isInstancedMesh&&Pt.instancingMorph===!1&&O.morphTexture!==null||Pt.envMap!==At||V.fog===!0&&Pt.fog!==rt||Pt.numClippingPlanes!==void 0&&(Pt.numClippingPlanes!==st.numPlanes||Pt.numIntersection!==st.numIntersection)||Pt.vertexAlphas!==Ft||Pt.vertexTangents!==Gt||Pt.morphTargets!==wt||Pt.morphNormals!==ae||Pt.morphColors!==ve||Pt.toneMapping!==Me||Pt.morphTargetsCount!==he)&&(ue=!0):(ue=!0,Pt.__version=V.version);let Ln=Pt.currentProgram;ue===!0&&(Ln=fa(V,k,O));let Ms=!1,ln=!1,pr=!1;const ye=Ln.getUniforms(),Gn=Pt.uniforms;if(Ut.useProgram(Ln.program)&&(Ms=!0,ln=!0,pr=!0),V.id!==T&&(T=V.id,ln=!0),Ms||b!==E){Ut.buffers.depth.getReversed()?(ot.copy(E.projectionMatrix),am(ot),om(ot),ye.setValue(z,"projectionMatrix",ot)):ye.setValue(z,"projectionMatrix",E.projectionMatrix),ye.setValue(z,"viewMatrix",E.matrixWorldInverse);const xi=ye.map.cameraPosition;xi!==void 0&&xi.setValue(z,Ot.setFromMatrixPosition(E.matrixWorld)),Jt.logarithmicDepthBuffer&&ye.setValue(z,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&ye.setValue(z,"isOrthographic",E.isOrthographicCamera===!0),b!==E&&(b=E,ln=!0,pr=!0)}if(O.isSkinnedMesh){ye.setOptional(z,O,"bindMatrix"),ye.setOptional(z,O,"bindMatrixInverse");const vn=O.skeleton;vn&&(vn.boneTexture===null&&vn.computeBoneTexture(),ye.setValue(z,"boneTexture",vn.boneTexture,R))}O.isBatchedMesh&&(ye.setOptional(z,O,"batchingTexture"),ye.setValue(z,"batchingTexture",O._matricesTexture,R),ye.setOptional(z,O,"batchingIdTexture"),ye.setValue(z,"batchingIdTexture",O._indirectTexture,R),ye.setOptional(z,O,"batchingColorTexture"),O._colorsTexture!==null&&ye.setValue(z,"batchingColorTexture",O._colorsTexture,R));const mr=G.morphAttributes;if((mr.position!==void 0||mr.normal!==void 0||mr.color!==void 0)&&zt.update(O,G,Ln),(ln||Pt.receiveShadow!==O.receiveShadow)&&(Pt.receiveShadow=O.receiveShadow,ye.setValue(z,"receiveShadow",O.receiveShadow)),V.isMeshGouraudMaterial&&V.envMap!==null&&(Gn.envMap.value=At,Gn.flipEnvMap.value=At.isCubeTexture&&At.isRenderTargetTexture===!1?-1:1),V.isMeshStandardMaterial&&V.envMap===null&&k.environment!==null&&(Gn.envMapIntensity.value=k.environmentIntensity),ln&&(ye.setValue(z,"toneMappingExposure",M.toneMappingExposure),Pt.needsLights&&dp(Gn,pr),rt&&V.fog===!0&&ft.refreshFogUniforms(Gn,rt),ft.refreshMaterialUniforms(Gn,V,W,nt,p.state.transmissionRenderTarget[E.id]),eo.upload(z,_h(Pt),Gn,R)),V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(eo.upload(z,_h(Pt),Gn,R),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&ye.setValue(z,"center",O.center),ye.setValue(z,"modelViewMatrix",O.modelViewMatrix),ye.setValue(z,"normalMatrix",O.normalMatrix),ye.setValue(z,"modelMatrix",O.matrixWorld),V.isShaderMaterial||V.isRawShaderMaterial){const vn=V.uniformsGroups;for(let xi=0,Mi=vn.length;xi<Mi;xi++){const xh=vn[xi];N.update(xh,Ln),N.bind(xh,Ln)}}return Ln}function dp(E,k){E.ambientLightColor.needsUpdate=k,E.lightProbe.needsUpdate=k,E.directionalLights.needsUpdate=k,E.directionalLightShadows.needsUpdate=k,E.pointLights.needsUpdate=k,E.pointLightShadows.needsUpdate=k,E.spotLights.needsUpdate=k,E.spotLightShadows.needsUpdate=k,E.rectAreaLights.needsUpdate=k,E.hemisphereLights.needsUpdate=k}function pp(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return A},this.getActiveMipmapLevel=function(){return w},this.getRenderTarget=function(){return D},this.setRenderTargetTextures=function(E,k,G){Nt.get(E.texture).__webglTexture=k,Nt.get(E.depthTexture).__webglTexture=G;const V=Nt.get(E);V.__hasExternalTextures=!0,V.__autoAllocateDepthBuffer=G===void 0,V.__autoAllocateDepthBuffer||Zt.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),V.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(E,k){const G=Nt.get(E);G.__webglFramebuffer=k,G.__useDefaultFramebuffer=k===void 0},this.setRenderTarget=function(E,k=0,G=0){D=E,A=k,w=G;let V=!0,O=null,rt=!1,pt=!1;if(E){const At=Nt.get(E);if(At.__useDefaultFramebuffer!==void 0)Ut.bindFramebuffer(z.FRAMEBUFFER,null),V=!1;else if(At.__webglFramebuffer===void 0)R.setupRenderTarget(E);else if(At.__hasExternalTextures)R.rebindTextures(E,Nt.get(E.texture).__webglTexture,Nt.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){const wt=E.depthTexture;if(At.__boundDepthTexture!==wt){if(wt!==null&&Nt.has(wt)&&(E.width!==wt.image.width||E.height!==wt.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");R.setupDepthRenderbuffer(E)}}const Ft=E.texture;(Ft.isData3DTexture||Ft.isDataArrayTexture||Ft.isCompressedArrayTexture)&&(pt=!0);const Gt=Nt.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(Gt[k])?O=Gt[k][G]:O=Gt[k],rt=!0):E.samples>0&&R.useMultisampledRTT(E)===!1?O=Nt.get(E).__webglMultisampledFramebuffer:Array.isArray(Gt)?O=Gt[G]:O=Gt,I.copy(E.viewport),K.copy(E.scissor),H=E.scissorTest}else I.copy(Ct).multiplyScalar(W).floor(),K.copy(Wt).multiplyScalar(W).floor(),H=ce;if(Ut.bindFramebuffer(z.FRAMEBUFFER,O)&&V&&Ut.drawBuffers(E,O),Ut.viewport(I),Ut.scissor(K),Ut.setScissorTest(H),rt){const At=Nt.get(E.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_CUBE_MAP_POSITIVE_X+k,At.__webglTexture,G)}else if(pt){const At=Nt.get(E.texture),Ft=k||0;z.framebufferTextureLayer(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,At.__webglTexture,G||0,Ft)}T=-1},this.readRenderTargetPixels=function(E,k,G,V,O,rt,pt){if(!(E&&E.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Tt=Nt.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&pt!==void 0&&(Tt=Tt[pt]),Tt){Ut.bindFramebuffer(z.FRAMEBUFFER,Tt);try{const At=E.texture,Ft=At.format,Gt=At.type;if(!Jt.textureFormatReadable(Ft)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Jt.textureTypeReadable(Gt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}k>=0&&k<=E.width-V&&G>=0&&G<=E.height-O&&z.readPixels(k,G,V,O,$t.convert(Ft),$t.convert(Gt),rt)}finally{const At=D!==null?Nt.get(D).__webglFramebuffer:null;Ut.bindFramebuffer(z.FRAMEBUFFER,At)}}},this.readRenderTargetPixelsAsync=async function(E,k,G,V,O,rt,pt){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Tt=Nt.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&pt!==void 0&&(Tt=Tt[pt]),Tt){const At=E.texture,Ft=At.format,Gt=At.type;if(!Jt.textureFormatReadable(Ft))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Jt.textureTypeReadable(Gt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(k>=0&&k<=E.width-V&&G>=0&&G<=E.height-O){Ut.bindFramebuffer(z.FRAMEBUFFER,Tt);const wt=z.createBuffer();z.bindBuffer(z.PIXEL_PACK_BUFFER,wt),z.bufferData(z.PIXEL_PACK_BUFFER,rt.byteLength,z.STREAM_READ),z.readPixels(k,G,V,O,$t.convert(Ft),$t.convert(Gt),0);const ae=D!==null?Nt.get(D).__webglFramebuffer:null;Ut.bindFramebuffer(z.FRAMEBUFFER,ae);const ve=z.fenceSync(z.SYNC_GPU_COMMANDS_COMPLETE,0);return z.flush(),await rm(z,ve,4),z.bindBuffer(z.PIXEL_PACK_BUFFER,wt),z.getBufferSubData(z.PIXEL_PACK_BUFFER,0,rt),z.deleteBuffer(wt),z.deleteSync(ve),rt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(E,k=null,G=0){E.isTexture!==!0&&(Pr("WebGLRenderer: copyFramebufferToTexture function signature has changed."),k=arguments[0]||null,E=arguments[1]);const V=Math.pow(2,-G),O=Math.floor(E.image.width*V),rt=Math.floor(E.image.height*V),pt=k!==null?k.x:0,Tt=k!==null?k.y:0;R.setTexture2D(E,0),z.copyTexSubImage2D(z.TEXTURE_2D,G,0,0,pt,Tt,O,rt),Ut.unbindTexture()},this.copyTextureToTexture=function(E,k,G=null,V=null,O=0){E.isTexture!==!0&&(Pr("WebGLRenderer: copyTextureToTexture function signature has changed."),V=arguments[0]||null,E=arguments[1],k=arguments[2],O=arguments[3]||0,G=null);let rt,pt,Tt,At,Ft,Gt,wt,ae,ve;const Me=E.isCompressedTexture?E.mipmaps[O]:E.image;G!==null?(rt=G.max.x-G.min.x,pt=G.max.y-G.min.y,Tt=G.isBox3?G.max.z-G.min.z:1,At=G.min.x,Ft=G.min.y,Gt=G.isBox3?G.min.z:0):(rt=Me.width,pt=Me.height,Tt=Me.depth||1,At=0,Ft=0,Gt=0),V!==null?(wt=V.x,ae=V.y,ve=V.z):(wt=0,ae=0,ve=0);const sn=$t.convert(k.format),he=$t.convert(k.type);let Pt;k.isData3DTexture?(R.setTexture3D(k,0),Pt=z.TEXTURE_3D):k.isDataArrayTexture||k.isCompressedArrayTexture?(R.setTexture2DArray(k,0),Pt=z.TEXTURE_2D_ARRAY):(R.setTexture2D(k,0),Pt=z.TEXTURE_2D),z.pixelStorei(z.UNPACK_FLIP_Y_WEBGL,k.flipY),z.pixelStorei(z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),z.pixelStorei(z.UNPACK_ALIGNMENT,k.unpackAlignment);const Kn=z.getParameter(z.UNPACK_ROW_LENGTH),ue=z.getParameter(z.UNPACK_IMAGE_HEIGHT),Ln=z.getParameter(z.UNPACK_SKIP_PIXELS),Ms=z.getParameter(z.UNPACK_SKIP_ROWS),ln=z.getParameter(z.UNPACK_SKIP_IMAGES);z.pixelStorei(z.UNPACK_ROW_LENGTH,Me.width),z.pixelStorei(z.UNPACK_IMAGE_HEIGHT,Me.height),z.pixelStorei(z.UNPACK_SKIP_PIXELS,At),z.pixelStorei(z.UNPACK_SKIP_ROWS,Ft),z.pixelStorei(z.UNPACK_SKIP_IMAGES,Gt);const pr=E.isDataArrayTexture||E.isData3DTexture,ye=k.isDataArrayTexture||k.isData3DTexture;if(E.isRenderTargetTexture||E.isDepthTexture){const Gn=Nt.get(E),mr=Nt.get(k),vn=Nt.get(Gn.__renderTarget),xi=Nt.get(mr.__renderTarget);Ut.bindFramebuffer(z.READ_FRAMEBUFFER,vn.__webglFramebuffer),Ut.bindFramebuffer(z.DRAW_FRAMEBUFFER,xi.__webglFramebuffer);for(let Mi=0;Mi<Tt;Mi++)pr&&z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,Nt.get(E).__webglTexture,O,Gt+Mi),E.isDepthTexture?(ye&&z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,Nt.get(k).__webglTexture,O,ve+Mi),z.blitFramebuffer(At,Ft,rt,pt,wt,ae,rt,pt,z.DEPTH_BUFFER_BIT,z.NEAREST)):ye?z.copyTexSubImage3D(Pt,O,wt,ae,ve+Mi,At,Ft,rt,pt):z.copyTexSubImage2D(Pt,O,wt,ae,ve+Mi,At,Ft,rt,pt);Ut.bindFramebuffer(z.READ_FRAMEBUFFER,null),Ut.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else ye?E.isDataTexture||E.isData3DTexture?z.texSubImage3D(Pt,O,wt,ae,ve,rt,pt,Tt,sn,he,Me.data):k.isCompressedArrayTexture?z.compressedTexSubImage3D(Pt,O,wt,ae,ve,rt,pt,Tt,sn,Me.data):z.texSubImage3D(Pt,O,wt,ae,ve,rt,pt,Tt,sn,he,Me):E.isDataTexture?z.texSubImage2D(z.TEXTURE_2D,O,wt,ae,rt,pt,sn,he,Me.data):E.isCompressedTexture?z.compressedTexSubImage2D(z.TEXTURE_2D,O,wt,ae,Me.width,Me.height,sn,Me.data):z.texSubImage2D(z.TEXTURE_2D,O,wt,ae,rt,pt,sn,he,Me);z.pixelStorei(z.UNPACK_ROW_LENGTH,Kn),z.pixelStorei(z.UNPACK_IMAGE_HEIGHT,ue),z.pixelStorei(z.UNPACK_SKIP_PIXELS,Ln),z.pixelStorei(z.UNPACK_SKIP_ROWS,Ms),z.pixelStorei(z.UNPACK_SKIP_IMAGES,ln),O===0&&k.generateMipmaps&&z.generateMipmap(Pt),Ut.unbindTexture()},this.copyTextureToTexture3D=function(E,k,G=null,V=null,O=0){return E.isTexture!==!0&&(Pr("WebGLRenderer: copyTextureToTexture3D function signature has changed."),G=arguments[0]||null,V=arguments[1]||null,E=arguments[2],k=arguments[3],O=arguments[4]||0),Pr('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(E,k,G,V,O)},this.initRenderTarget=function(E){Nt.get(E).__webglFramebuffer===void 0&&R.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?R.setTextureCube(E,0):E.isData3DTexture?R.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?R.setTexture2DArray(E,0):R.setTexture2D(E,0),Ut.unbindTexture()},this.resetState=function(){A=0,w=0,D=null,Ut.reset(),_e.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ri}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorspace=re._getDrawingBufferColorSpace(t),e.unpackColorSpace=re._getUnpackColorSpace()}}class vx extends qe{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new di,this.environmentIntensity=1,this.environmentRotation=new di,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class xx{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=yc,this.updateRanges=[],this.version=0,this.uuid=zi()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let s=0,r=this.stride;s<r;s++)this.array[t+s]=e.array[n+s];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=zi()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){return t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=zi()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Ye=new U;class uo{constructor(t,e,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)Ye.fromBufferAttribute(this,e),Ye.applyMatrix4(t),this.setXYZ(e,Ye.x,Ye.y,Ye.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Ye.fromBufferAttribute(this,e),Ye.applyNormalMatrix(t),this.setXYZ(e,Ye.x,Ye.y,Ye.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Ye.fromBufferAttribute(this,e),Ye.transformDirection(t),this.setXYZ(e,Ye.x,Ye.y,Ye.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=Xn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=me(n,this.array)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=me(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=me(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=me(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=me(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=Xn(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=Xn(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=Xn(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=Xn(e,this.array)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=me(e,this.array),n=me(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,s){return t=t*this.data.stride+this.offset,this.normalized&&(e=me(e,this.array),n=me(n,this.array),s=me(s,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=me(e,this.array),n=me(n,this.array),s=me(s,this.array),r=me(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this.data.array[t+3]=r,this}clone(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return new Ne(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new uo(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class td extends vs{static get type(){return"SpriteMaterial"}constructor(t){super(),this.isSpriteMaterial=!0,this.color=new oe(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}let Us;const Mr=new U,ks=new U,Os=new U,zs=new Kt,yr=new Kt,ed=new be,Na=new U,Sr=new U,Ua=new U,_u=new Kt,_l=new Kt,vu=new Kt;class Mx extends qe{constructor(t=new td){if(super(),this.isSprite=!0,this.type="Sprite",Us===void 0){Us=new Ue;const e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new xx(e,5);Us.setIndex([0,1,2,0,2,3]),Us.setAttribute("position",new uo(n,3,0,!1)),Us.setAttribute("uv",new uo(n,2,3,!1))}this.geometry=Us,this.material=t,this.center=new Kt(.5,.5)}raycast(t,e){t.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),ks.setFromMatrixScale(this.matrixWorld),ed.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),Os.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&ks.multiplyScalar(-Os.z);const n=this.material.rotation;let s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));const a=this.center;ka(Na.set(-.5,-.5,0),Os,a,ks,s,r),ka(Sr.set(.5,-.5,0),Os,a,ks,s,r),ka(Ua.set(.5,.5,0),Os,a,ks,s,r),_u.set(0,0),_l.set(1,0),vu.set(1,1);let o=t.ray.intersectTriangle(Na,Sr,Ua,!1,Mr);if(o===null&&(ka(Sr.set(-.5,.5,0),Os,a,ks,s,r),_l.set(0,1),o=t.ray.intersectTriangle(Na,Ua,Sr,!1,Mr),o===null))return;const l=t.ray.origin.distanceTo(Mr);l<t.near||l>t.far||e.push({distance:l,point:Mr.clone(),uv:pn.getInterpolation(Mr,Na,Sr,Ua,_u,_l,vu,new Kt),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}}function ka(i,t,e,n,s,r){zs.subVectors(i,e).addScalar(.5).multiply(n),s!==void 0?(yr.x=r*zs.x-s*zs.y,yr.y=s*zs.x+r*zs.y):yr.copy(zs),i.copy(t),i.x+=yr.x,i.y+=yr.y,i.applyMatrix4(ed)}class yx extends $e{constructor(t=null,e=1,n=1,s,r,a,o,l,c=tn,h=tn,u,f){super(null,a,o,l,c,h,s,r,u,f),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Ir extends vs{static get type(){return"LineBasicMaterial"}constructor(t){super(),this.isLineBasicMaterial=!0,this.color=new oe(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const fo=new U,po=new U,xu=new be,Er=new Yc,Oa=new lr,vl=new U,Mu=new U;class bc extends qe{constructor(t=new Ue,e=new Ir){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[0];for(let s=1,r=e.count;s<r;s++)fo.fromBufferAttribute(e,s-1),po.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=fo.distanceTo(po);t.setAttribute("lineDistance",new en(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){const n=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Oa.copy(n.boundingSphere),Oa.applyMatrix4(s),Oa.radius+=r,t.ray.intersectsSphere(Oa)===!1)return;xu.copy(s).invert(),Er.copy(t.ray).applyMatrix4(xu);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=n.index,f=n.attributes.position;if(h!==null){const d=Math.max(0,a.start),g=Math.min(h.count,a.start+a.count);for(let _=d,m=g-1;_<m;_+=c){const p=h.getX(_),x=h.getX(_+1),y=za(this,t,Er,l,p,x);y&&e.push(y)}if(this.isLineLoop){const _=h.getX(g-1),m=h.getX(d),p=za(this,t,Er,l,_,m);p&&e.push(p)}}else{const d=Math.max(0,a.start),g=Math.min(f.count,a.start+a.count);for(let _=d,m=g-1;_<m;_+=c){const p=za(this,t,Er,l,_,_+1);p&&e.push(p)}if(this.isLineLoop){const _=za(this,t,Er,l,g-1,d);_&&e.push(_)}}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function za(i,t,e,n,s,r){const a=i.geometry.attributes.position;if(fo.fromBufferAttribute(a,s),po.fromBufferAttribute(a,r),e.distanceSqToSegment(fo,po,vl,Mu)>n)return;vl.applyMatrix4(i.matrixWorld);const l=t.ray.origin.distanceTo(vl);if(!(l<t.near||l>t.far))return{distance:l,point:Mu.clone().applyMatrix4(i.matrixWorld),index:s,face:null,faceIndex:null,barycoord:null,object:i}}const yu=new U,Su=new U;class Eu extends bc{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[];for(let s=0,r=e.count;s<r;s+=2)yu.fromBufferAttribute(e,s),Su.fromBufferAttribute(e,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+yu.distanceTo(Su);t.setAttribute("lineDistance",new en(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class nd extends vs{static get type(){return"PointsMaterial"}constructor(t){super(),this.isPointsMaterial=!0,this.color=new oe(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}const bu=new be,Tc=new Yc,Fa=new lr,Ba=new U;class Sx extends qe{constructor(t=new Ue,e=new nd){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){const n=this.geometry,s=this.matrixWorld,r=t.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Fa.copy(n.boundingSphere),Fa.applyMatrix4(s),Fa.radius+=r,t.ray.intersectsSphere(Fa)===!1)return;bu.copy(s).invert(),Tc.copy(t.ray).applyMatrix4(bu);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,u=n.attributes.position;if(c!==null){const f=Math.max(0,a.start),d=Math.min(c.count,a.start+a.count);for(let g=f,_=d;g<_;g++){const m=c.getX(g);Ba.fromBufferAttribute(u,m),Tu(Ba,m,l,s,t,e,this)}}else{const f=Math.max(0,a.start),d=Math.min(u.count,a.start+a.count);for(let g=f,_=d;g<_;g++)Ba.fromBufferAttribute(u,g),Tu(Ba,g,l,s,t,e,this)}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function Tu(i,t,e,n,s,r,a){const o=Tc.distanceSqToPoint(i);if(o<e){const l=new U;Tc.closestPointToPoint(i,l),l.applyMatrix4(n);const c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:a})}}class no extends $e{constructor(t,e,n,s,r,a,o,l,c){super(t,e,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}const Ha=new U,Ga=new U,xl=new U,Va=new pn;class Ex extends Ue{constructor(t=null,e=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:t,thresholdAngle:e},t!==null){const s=Math.pow(10,4),r=Math.cos(to*e),a=t.getIndex(),o=t.getAttribute("position"),l=a?a.count:o.count,c=[0,0,0],h=["a","b","c"],u=new Array(3),f={},d=[];for(let g=0;g<l;g+=3){a?(c[0]=a.getX(g),c[1]=a.getX(g+1),c[2]=a.getX(g+2)):(c[0]=g,c[1]=g+1,c[2]=g+2);const{a:_,b:m,c:p}=Va;if(_.fromBufferAttribute(o,c[0]),m.fromBufferAttribute(o,c[1]),p.fromBufferAttribute(o,c[2]),Va.getNormal(xl),u[0]=`${Math.round(_.x*s)},${Math.round(_.y*s)},${Math.round(_.z*s)}`,u[1]=`${Math.round(m.x*s)},${Math.round(m.y*s)},${Math.round(m.z*s)}`,u[2]=`${Math.round(p.x*s)},${Math.round(p.y*s)},${Math.round(p.z*s)}`,!(u[0]===u[1]||u[1]===u[2]||u[2]===u[0]))for(let x=0;x<3;x++){const y=(x+1)%3,M=u[x],C=u[y],A=Va[h[x]],w=Va[h[y]],D=`${M}_${C}`,T=`${C}_${M}`;T in f&&f[T]?(xl.dot(f[T].normal)<=r&&(d.push(A.x,A.y,A.z),d.push(w.x,w.y,w.z)),f[T]=null):D in f||(f[D]={index0:c[x],index1:c[y],normal:xl.clone()})}}for(const g in f)if(f[g]){const{index0:_,index1:m}=f[g];Ha.fromBufferAttribute(o,_),Ga.fromBufferAttribute(o,m),d.push(Ha.x,Ha.y,Ha.z),d.push(Ga.x,Ga.y,Ga.z)}this.setAttribute("position",new en(d,3))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}}class jc extends Ue{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const l=Math.min(a+o,Math.PI);let c=0;const h=[],u=new U,f=new U,d=[],g=[],_=[],m=[];for(let p=0;p<=n;p++){const x=[],y=p/n;let M=0;p===0&&a===0?M=.5/e:p===n&&l===Math.PI&&(M=-.5/e);for(let C=0;C<=e;C++){const A=C/e;u.x=-t*Math.cos(s+A*r)*Math.sin(a+y*o),u.y=t*Math.cos(a+y*o),u.z=t*Math.sin(s+A*r)*Math.sin(a+y*o),g.push(u.x,u.y,u.z),f.copy(u).normalize(),_.push(f.x,f.y,f.z),m.push(A+M,1-y),x.push(c++)}h.push(x)}for(let p=0;p<n;p++)for(let x=0;x<e;x++){const y=h[p][x+1],M=h[p][x],C=h[p+1][x],A=h[p+1][x+1];(p!==0||a>0)&&d.push(y,M,A),(p!==n-1||l<Math.PI)&&d.push(M,C,A)}this.setIndex(d),this.setAttribute("position",new en(g,3)),this.setAttribute("normal",new en(_,3)),this.setAttribute("uv",new en(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new jc(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Hc}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Hc);const pi=11,Zc=16,Ac=27,id=11,bx=["RicoReWi","YourTime-FM","RapRadio 24","SchlagerPop 24","ChartRadio 24","ClubRadio 24","AnMaCha 24","RadioFloh!","RockRadio 24","ChristmasRadio","KultRadio 24","Zocker-FM","Special-Radio","AnMaChaCast","SenderWelt","RadioPortal"],Tx=[{id:"natur",name:"Natur"},{id:"erz",name:"Erze & Steine"},{id:"bau",name:"Bauen"},{id:"licht",name:"Licht"},{id:"spezial",name:"Spezial"},{id:"technik",name:"Funktechnik"},{id:"funk",name:"Funk-Logos"}],Jc=[[0,"AIR","Luft","",null,{solid:0,opaque:0,inv:0}],[1,"GRASS","Gras","natur",[0,1,2],{hard:.6,tool:"schaufel",color:5808188,map:[88,160,60],icon:1}],[2,"DIRT","Erde","natur",[2,2,2],{hard:.5,tool:"schaufel",color:8806463,map:[134,96,63],icon:2}],[3,"STONE","Stein","erz",[3,3,3],{hard:1.5,tool:"spitzhacke",color:8158336,map:[124,124,128],icon:3}],[4,"SAND","Sand","natur",[4,4,4],{hard:.5,tool:"schaufel",color:14404494,map:[219,203,142],icon:4}],[5,"WOOD","Holz","natur",[6,5,6],{hard:1,tool:"axt",color:6836270,map:[104,80,46],icon:5}],[6,"LEAVES","Blätter","natur",[7,7,7],{opaque:0,self:1,hard:.2,color:3833904,map:[46,120,44],icon:7}],[7,"PLANKS","Bretter","bau",[8,8,8],{hard:1,tool:"axt",color:11306578,map:[172,134,82],icon:8}],[8,"GLASS","Glas","bau",[9,9,9],{opaque:0,trans:1,hard:.3,color:13625584,map:[200,230,240],icon:9}],[9,"LAMP","Leuchtblock","licht",[10,10,10],{emit:1,hard:.3,color:16767098,map:[255,214,120],icon:10}],[10,"WATER","Wasser","",[11,11,11],{solid:0,opaque:0,trans:1,inv:0,map:[44,100,200]}],[27,"FEDER","Federblock","spezial",[12,13,13],{hard:.5,color:16738976,map:[255,100,160],icon:12}],[28,"TURBO","Turbo-Block","spezial",[14,15,15],{hard:.8,color:16766504,map:[255,214,40],icon:14}],[29,"WIND","Aufwind-Block","spezial",[16,17,17],{hard:.5,color:5294318,map:[80,200,235],icon:16}],[30,"RADIO","Radio-Block","spezial",[19,18,19],{hard:.5,color:3817034,map:[60,64,76],icon:18}],[31,"RAINBOW","Regenbogen-Block","licht",[20,20,20],{emit:2,hard:.5,color:14509823,map:[220,100,255],icon:20}],[32,"NEON_R","Neonrot","licht",[21,21,21],{emit:1,hard:.3,color:16721990,map:[255,40,70],icon:21}],[33,"NEON_B","Neonblau","licht",[22,22,22],{emit:1,hard:.3,color:2657535,map:[40,140,255],icon:22}],[34,"NEON_G","Neongrün","licht",[23,23,23],{emit:1,hard:.3,color:3342200,map:[50,255,120],icon:23}],[35,"NEON_P","Neonlila","licht",[24,24,24],{emit:1,hard:.3,color:12470015,map:[190,70,255],icon:24}],[36,"BRICK","Ziegel","bau",[25,25,25],{hard:1.5,tool:"spitzhacke",color:10111544,map:[154,74,56],icon:25}],[37,"MARBLE","Marmor","bau",[26,26,26],{hard:1.5,tool:"spitzhacke",color:15132398,map:[232,232,240],icon:26}],[38,"SNOW","Schnee","natur",[27,28,2],{hard:.4,tool:"schaufel",color:15922938,map:[240,246,250],icon:27}],[39,"ICE","Eis","natur",[29,29,29],{hard:.6,tool:"spitzhacke",color:11064560,map:[168,212,240],icon:29}],[40,"GRAVEL","Kies","erz",[30,30,30],{hard:.6,tool:"schaufel",color:9078402,map:[138,134,130],icon:30}],[41,"CLAY","Ton","natur",[31,31,31],{hard:.6,tool:"schaufel",color:10134708,map:[154,164,180],icon:31}],[42,"SPRUCE","Fichtenholz","natur",[33,32,33],{hard:1,tool:"axt",color:4863008,map:[74,52,32],icon:32}],[43,"NEEDLES","Fichtennadeln","natur",[34,34,34],{opaque:0,self:1,hard:.2,color:2775606,map:[36,84,50],icon:34}],[44,"CACTUS","Kaktus","natur",[36,35,36],{hard:.4,color:3967546,map:[60,138,58],icon:35}],[45,"COAL","Kohleerz","erz",[37,37,37],{hard:2,tool:"spitzhacke",color:3816e3,map:[70,70,78],icon:37,tier:1}],[46,"COPPER","Kupfererz","erz",[38,38,38],{hard:2.2,tool:"spitzhacke",color:13136956,map:[200,116,60],icon:38,tier:1}],[47,"IRON","Eisenerz","erz",[39,39,39],{hard:2.6,tool:"spitzhacke",color:13150344,map:[200,168,136],icon:39,tier:2}],[48,"CRYSTAL","Funkkristall","erz",[40,40,40],{emit:1,hard:2.4,tool:"spitzhacke",color:7006463,map:[106,232,255],icon:40,tier:2}],[49,"MUD","Schlamm","natur",[41,41,41],{hard:.5,tool:"schaufel",color:5128756,map:[78,66,52],icon:41}],[50,"FLOWERS","Blütenwiese","natur",[42,1,2],{hard:.6,tool:"schaufel",color:6991946,map:[150,170,90],icon:42}],[51,"BASALT","Basalt","erz",[43,43,43],{hard:1.8,tool:"spitzhacke",color:3421242,map:[52,52,58],icon:43}],[52,"MAGMA","Magma","erz",[44,44,44],{emit:1,hard:1.2,tool:"spitzhacke",color:16738842,map:[255,106,26],icon:44}],[53,"SHROOM","Pilzhut","natur",[45,45,45],{hard:.3,color:13122106,map:[200,58,58],icon:45}],[54,"MYCEL","Pilzboden","natur",[46,47,2],{hard:.6,tool:"schaufel",color:8022656,map:[122,106,128],icon:46}],[55,"SANDSTONE","Sandstein","bau",[48,48,48],{hard:1.2,tool:"spitzhacke",color:14205066,map:[216,192,138],icon:48}],[56,"STEM","Pilzstiel","natur",[49,49,49],{hard:.6,tool:"axt",color:15261904,map:[232,224,208],icon:49}],[57,"JLEAVES","Dschungelblätter","natur",[50,50,50],{opaque:0,self:1,hard:.2,color:3050020,map:[40,130,34],icon:50}],[58,"WORKBENCH","Werkbank","bau",[51,52,8],{hard:1.2,tool:"axt",color:10122308,map:[150,112,66],icon:51,station:"werkbank"}],[59,"FURNACE","Schmelzofen","bau",[54,53,54],{hard:2,tool:"spitzhacke",color:6974064,map:[110,110,116],icon:53,station:"ofen"}],[60,"WOOL","Wolle","bau",[55,55,55],{hard:.4,color:15657698,map:[236,232,224],icon:55}],[61,"FARMLAND","Ackerboden","natur",[56,2,2],{hard:.5,tool:"schaufel",color:5914150,map:[96,66,40],icon:56}],[62,"WHEAT0","Weizen (Keim)","",[57,57,57],{shape:"cross",solid:0,opaque:0,inv:0,hard:0,color:6991936,map:[100,150,60]}],[63,"WHEAT1","Weizen (jung)","",[58,58,58],{shape:"cross",solid:0,opaque:0,inv:0,hard:0,color:8041536,map:[110,160,60]}],[64,"WHEAT2","Weizen (grün)","",[59,59,59],{shape:"cross",solid:0,opaque:0,inv:0,hard:0,color:10530880,map:[150,170,60]}],[65,"WHEAT3","Weizen (reif)","",[60,60,60],{shape:"cross",solid:0,opaque:0,inv:0,hard:0,color:14202960,map:[216,184,80]}],[66,"PATH","Dorfweg","bau",[61,2,2],{hard:.5,tool:"schaufel",color:10126946,map:[150,132,100],icon:61}],[67,"COBBLE","Bruchstein","bau",[62,62,62],{hard:1.6,tool:"spitzhacke",color:8421510,map:[120,120,126],icon:62}],[68,"SWITCH","Schalter","technik",[63,63,63],{hard:.5,color:9079440,map:[140,140,146],icon:63}],[69,"SWITCH_ON","Schalter (an)","",[64,64,64],{hard:.5,color:9079440,map:[140,160,146],inv:0,drop:68}],[70,"WIRE","Signalleitung","technik",[65,65,65],{hard:.5,color:14188604,map:[200,120,60],icon:65}],[71,"SENDER","Funksender","technik",[66,67,62],{hard:.8,color:3817034,map:[80,200,240],icon:67}],[72,"RELAY","Funkrelais","technik",[68,68,68],{hard:.8,color:4869722,map:[110,200,230],icon:68}],[73,"RECEIVER","Empfänger","technik",[69,69,69],{hard:.8,color:3159102,map:[70,74,86],icon:69}],[74,"RECEIVER_ON","Empfänger (an)","",[70,70,70],{hard:.8,color:3159102,map:[90,230,140],inv:0,drop:73,emit:1}],[75,"SIGLAMP","Signallampe","technik",[71,71,71],{hard:.3,color:6969920,map:[110,92,66],icon:71}],[76,"SIGLAMP_ON","Signallampe (an)","",[72,72,72],{hard:.3,color:16767098,map:[255,220,120],inv:0,drop:75,emit:1}],[77,"GATE","Funktor","technik",[73,73,73],{hard:2,tool:"spitzhacke",color:11843262,map:[170,172,180],icon:73}],[78,"GATE_OPEN","Funktor (offen)","",[74,74,74],{solid:0,opaque:0,hard:2,tool:"spitzhacke",color:11843262,map:[130,132,140],inv:0,drop:77}],[79,"RAIL","Schiene","technik",[75,75,75],{shape:"flat",solid:0,opaque:0,hard:.4,color:9075306,map:[140,120,100],icon:75}]];for(let i=0;i<Zc;i++)Jc.push([pi+i,"LOGO"+(i+1),bx[i],"funk",null,{logo:1,hard:.5,color:1712192,map:[60,70,110]}]);Jc.sort((i,t)=>i[0]-t[0]);const Xi=256,Yt=[],v={},Yr=[],Kr=new Uint8Array(Xi),zr=new Uint8Array(Xi),sd=new Uint8Array(Xi),Qc=new Float32Array(Xi),wc=new Uint8Array(Xi),rd=new Uint8Array(Xi),ad=new Uint8Array(Xi),od=new Uint8Array(Xi),Fr={};for(const[i,t,e,n,s,r]of Jc){if(Yt[i])throw new Error("Block-Id doppelt: "+i);const a={id:i,key:t,name:e,cat:n,tiles:s,solid:1,opaque:1,trans:0,self:0,emit:0,hard:1,tool:null,color:14540253,map:[200,200,210],icon:0,inv:1,logo:0,station:null,tier:0,shape:null,drop:0,...r};a.trans&&(a.opaque=0),Yt[i]=a,v[t]=i,Yr[i]=e,Kr[i]=a.solid,zr[i]=a.opaque,wc[i]=a.trans,rd[i]=a.self,Qc[i]=a.emit,ad[i]=a.shape==="cross"?1:0,od[i]=a.shape==="flat"?1:0,sd[i]=a.opaque||a.self?1:0,s&&(Fr[i]=s)}const wo=i=>i>=pi&&i<pi+Zc;Yr.slice(Ac,Ac+id);const Ax=Yt.filter(i=>i&&i.inv).map(i=>i.id),jr=[v.WHEAT0,v.WHEAT1,v.WHEAT2,v.WHEAT3],F=16,le=96,te=24,wx=8,Au=16;function jt(i,t,e){let n=Math.imul(i|0,668265261)^Math.imul(t|0,374761393)^Math.imul(e|0,2654435761);return n=Math.imul(n^n>>>15,2246822507),n=Math.imul(n^n>>>13,3266489909),n^=n>>>16,(n>>>0)/4294967296}function Rx(i,t,e){const n=Math.floor(i),s=Math.floor(t),r=i-n,a=t-s,o=r*r*(3-2*r),l=a*a*(3-2*a),c=jt(n,s,e),h=jt(n+1,s,e),u=jt(n,s+1,e),f=jt(n+1,s+1,e);return c+(h-c)*o+(u-c)*l+(c-h-u+f)*o*l}function je(i,t,e,n){let s=0,r=.5,a=1,o=0;for(let l=0;l<n;l++)s+=r*Rx(i*a,t*a,e+l*101),o+=r,r*=.5,a*=2;return s/o}const Dt={OCEAN:0,BEACH:1,PLAINS:2,FOREST:3,TAIGA:4,MOUNTAINS:5,SNOW:6,DESERT:7,SWAMP:8,JUNGLE:9,MEADOW:10,VOLCANO:11,MUSHROOM:12,CRYSTAL:13,COAST:14},Cx=["Meer","Strand","Grüne Ebene","Laubwald","Nadelwald","Berge","Schneegebiet","Wüste","Sumpf","Dschungel","Blumenwiese","Vulkanregion","Pilzwald","Kristallgebiet","Felsküste"],Fs=[[40,90,180],[222,206,146],[110,176,70],[52,122,46],[44,96,70],[130,130,136],[236,242,248],[228,200,120],[78,98,60],[36,140,40],[170,190,90],[70,50,50],[130,100,140],[110,220,240],[120,118,112]],Lx=[Dt.PLAINS,Dt.FOREST,Dt.MEADOW],is=(i,t,e)=>{const n=Math.max(0,Math.min(1,(e-i)/(t-i)));return n*n*(3-2*n)},Ml=i=>Math.max(0,Math.min(1,(i-.5)*2.4+.5)),wu=te-14,Px=6,Dx=5,Br=5;function mi(i,t,e,n){const s=je(t/640,e/640,i+1,4),r=is(.4,.5,s),a=je(t/52,e/52,i+3,3),o=is(.56,.72,je(t/300,e/300,i+2,3))*r,l=Ml(je(t/520,e/520,i+11,3))+(jt(t,e,i+5)-.5)*.05,c=Ml(je(t/480,e/480,i+23,3))+(jt(t,e,i+6)-.5)*.05,h=Ml(je(t/360,e/360,i+37,2));let u=(te-13+a*8)*(1-r)+(te+2+a*12)*r;if(o>0){const y=1-Math.abs(je(t/80,e/80,i+4,2)*2-1);u+=o*(12+y*36)}const f=is(.74,.82,c)*is(.42,.5,l)*(1-is(0,.2,o))*r;f>0&&(u+=(te+(a<.45?-1:1)-u)*f);const d=l>.6?is(.86,.98,h)*r*(1-f):0;d>0&&(u+=d*26-is(.8,.95,d)*5),u=Math.max(2,Math.min(le-12,Math.floor(u)));const g=l-Math.max(0,u-(te+18))*.012;let _;f>.5?_=Dt.SWAMP:u<te?_=Dt.OCEAN:d>.05?_=Dt.VOLCANO:o>.3&&u>te+18?_=Dt.MOUNTAINS:u<=te+1?_=g<.32||o>.15?Dt.COAST:Dt.BEACH:h>.86?_=c>.5?Dt.MUSHROOM:Dt.CRYSTAL:g<.16?_=Dt.SNOW:g<.3?_=Dt.TAIGA:g>.7&&c<.4?_=Dt.DESERT:g>.66&&c>.62?_=Dt.JUNGLE:c>.56?_=Dt.FOREST:je(t/110,e/110,i+41,2)>.6?_=Dt.MEADOW:_=Dt.PLAINS,n.h=u,n.biome=_,n.t=g,n.u=c,n.d=a,n.volc=d;const m=u<te+6,p=m?Math.min(u-5,wu):u;n.t0lo=n.t1lo=n.cvlo=1e9,n.t0hi=n.t1hi=n.cvhi=-1,n.lake=!1,n.open=!1;for(let y=0;y<2;y++){const M=Math.abs(je(t/64,e/64,i+50+y*7,2)-.5);if(M>=.024)continue;const C=8+y*13+je(t/90,e/90,i+60+y,2)*16,A=1.4+(1-M/.024)*1.6,w=Math.max(Px,Math.ceil(C-A)),D=Math.min(p,Math.floor(C+A*.75));D<w||(y===0?(n.t0lo=w,n.t0hi=D):(n.t1lo=w,n.t1hi=D),D>=u&&(n.open=!0))}const x=je(t/36,e/36,i+70,2);if(x>.66){const y=Math.min(u-6,m?wu:le,Br+Math.floor((x-.66)*55));y>=Br&&(n.cvlo=Br,n.cvhi=y,n.lake=je(t/200,e/200,i+71,2)>.52)}return n}function Ru(i,t,e,n){const s=i.h,r=i.d;switch(i.biome){case Dt.OCEAN:return[r>.62?v.GRAVEL:r<.32?v.CLAY:v.SAND,v.SAND,3,v.STONE,0,v.STONE];case Dt.BEACH:return[v.SAND,v.SAND,4,v.SANDSTONE,3,v.STONE];case Dt.COAST:return[v.GRAVEL,v.STONE,2,v.STONE,0,v.STONE];case Dt.MEADOW:return[v.FLOWERS,v.DIRT,3,v.STONE,0,v.STONE];case Dt.SNOW:return[v.SNOW,v.DIRT,3,v.STONE,0,v.STONE];case Dt.MOUNTAINS:return s>te+44?[v.SNOW,v.STONE,1,v.STONE,0,v.STONE]:s<te+26?[v.GRASS,v.DIRT,2,v.STONE,0,v.STONE]:[r>.6?v.GRAVEL:v.STONE,v.STONE,1,v.STONE,0,v.STONE];case Dt.DESERT:return[v.SAND,v.SAND,4,v.SANDSTONE,3,v.STONE];case Dt.SWAMP:return[jt(e,n,t+8)<.4?v.MUD:v.GRASS,v.MUD,2,v.DIRT,2,v.STONE];case Dt.VOLCANO:return[r>.74||je(e/14,n/14,t+9,2)>.7?v.MAGMA:v.BASALT,v.BASALT,4,v.STONE,0,v.STONE];case Dt.MUSHROOM:return[v.MYCEL,v.DIRT,3,v.STONE,0,v.STONE];case Dt.CRYSTAL:return[r>.55?v.GRAVEL:v.STONE,v.STONE,1,v.STONE,0,v.STONE];default:return[v.GRASS,v.DIRT,3,v.STONE,0,v.STONE]}}const wn=[];wn[Dt.PLAINS]=["oak",.004];wn[Dt.FOREST]=["oak",.035];wn[Dt.MEADOW]=["oak",.002];wn[Dt.TAIGA]=["spruce",.03];wn[Dt.SNOW]=["spruce",.008];wn[Dt.MOUNTAINS]=["spruce",.006];wn[Dt.JUNGLE]=["jungle",.045];wn[Dt.SWAMP]=["oak",.012];wn[Dt.DESERT]=["cactus",.006];wn[Dt.MUSHROOM]=["mushroom",.012];wn[Dt.CRYSTAL]=["spire",.012];const Ix=new Set([v.GRASS,v.DIRT,v.SNOW,v.FLOWERS,v.MUD,v.MYCEL,v.SAND,v.STONE,v.GRAVEL]),Nn=3,Vn=F+2*Nn,Wa=Array.from({length:Vn*Vn},()=>({}));function Nx(i,t,e,n){const s=t*F,r=e*F;for(let h=0;h<Vn;h++)for(let u=0;u<Vn;u++)mi(i,s+u-Nn,r+h-Nn,Wa[h*Vn+u]);let a=te;const o=(h,u,f)=>h+f*F+u*F*F;for(let h=0;h<F;h++)for(let u=0;u<F;u++){const f=Wa[(h+Nn)*Vn+u+Nn],d=f.h,g=s+u,_=r+h,[m,p,x,y,M,C]=Ru(f,i,g,_);for(let A=0;A<=d;A++){const w=d-A;n[o(u,A,h)]=A===0?v.STONE:w===0?m:w<=x?p:w<=x+M?y:C}for(let A=d+1;A<=te;A++)n[o(u,A,h)]=A===te&&f.t<.16&&f.biome!==Dt.SWAMP?v.ICE:v.WATER;d>a&&(a=d)}for(let h=0;h<F;h++)for(let u=0;u<F;u++){const f=Wa[(h+Nn)*Vn+u+Nn];for(let d=f.t0lo;d<=f.t0hi;d++)n[o(u,d,h)]=v.AIR;for(let d=f.t1lo;d<=f.t1hi;d++)n[o(u,d,h)]=v.AIR;if(f.cvhi>=0){for(let d=f.cvlo;d<=f.cvhi;d++)n[o(u,d,h)]=v.AIR;if(f.lake)n[o(u,Dx,h)]=v.WATER;else if(jt(s+u,r+h,i+72)<(f.biome===Dt.CRYSTAL?.22:.04)){const d=1+Math.floor(jt(s+u,r+h,i+73)*3);for(let g=Br;g<Br+d&&g<=f.cvhi;g++)n[o(u,g,h)]=v.CRYSTAL}}}const l=(h,u,f,d,g,_)=>{for(let m=0;m<u;m++){const p=C=>jt(t*31+m*7+C,e*17-m,i+_);let x=Math.floor(p(1)*F),y=Math.floor(p(2)*F),M=f+Math.floor(p(3)*(d-f));for(let C=0;C<g;C++){const A=o(x,M,y);n[A]===v.STONE&&(n[A]=h);const w=Math.floor(p(4+C)*6),D=w&1?1:-1;w<2?x=Math.max(0,Math.min(F-1,x+D)):w<4?y=Math.max(0,Math.min(F-1,y+D)):M=Math.max(1,Math.min(le-1,M+D))}}};l(v.COAL,16,6,70,6,80),l(v.COPPER,9,4,44,5,81),l(v.IRON,7,2,30,4,82),l(v.CRYSTAL,2,2,14,3,83);const c=(h,u,f,d,g)=>{if(h<0||h>=F||f<0||f>=F||u<1||u>=le)return;const _=o(h,u,f);(g||n[_]===v.AIR)&&(n[_]=d,u>a&&(a=u))};for(let h=0;h<Vn;h++)for(let u=0;u<Vn;u++){const f=Wa[h*Vn+u],d=wn[f.biome];if(!d||f.open||f.h<=te)continue;const g=s+u-Nn,_=r+h-Nn;if(jt(g,_,i+99)>=d[1])continue;const m=u-Nn,p=h-Nn,x=f.h,y=jt(g,_,i+7),M=Ru(f,i,g,_)[0];if(Ix.has(M))if(d[0]==="cactus"){if(M!==v.SAND)continue;const C=1+Math.floor(y*3);for(let A=1;A<=C;A++)c(m,x+A,p,v.CACTUS)}else if(d[0]==="spire"){const C=2+Math.floor(y*4);for(let A=1;A<=C;A++)c(m,x+A,p,v.CRYSTAL);c(m+(y<.5?1:-1),x+1,p,v.CRYSTAL)}else if(d[0]==="mushroom"){const C=4+Math.floor(y*3);for(let A=1;A<=C;A++)c(m,x+A,p,v.STEM,!0);for(let A=-2;A<=2;A++)for(let w=-2;w<=2;w++){const D=Math.abs(w)===2&&Math.abs(A)===2;D||c(m+w,x+C+1,p+A,v.SHROOM),!D&&(Math.abs(w)===2||Math.abs(A)===2)&&c(m+w,x+C,p+A,v.SHROOM)}}else if(d[0]==="spruce"){const C=6+Math.floor(y*4),A=x+C+1;for(let w=1;w<=C;w++)c(m,x+w,p,v.SPRUCE,!0);for(let w=x+3;w<=A;w++){const D=Math.min(3,Math.floor((A-w)/2.2+(w%2?.4:0)));for(let T=-D;T<=D;T++)for(let b=-D;b<=D;b++)b*b+T*T<=D*D+.5&&c(m+b,w,p+T,v.NEEDLES)}}else if(d[0]==="jungle"){const C=8+Math.floor(y*5);for(let A=1;A<=C;A++)c(m,x+A,p,v.WOOD,!0);for(let A=-1;A<=1;A++){const w=A===1?2:3;for(let D=-w;D<=w;D++)for(let T=-w;T<=w;T++)T*T+D*D>w*w+1||w===3&&jt(g+T,_+D+A,i+3)<.25||c(m+T,x+C+A,p+D,v.JLEAVES)}}else{const C=4+Math.floor(y*3);for(let A=1;A<=C;A++)c(m,x+A,p,v.WOOD,!0);for(let A=C-2;A<=C+1;A++){const w=A>=C?1:2;for(let D=-w;D<=w;D++)for(let T=-w;T<=w;T++)w===2&&Math.abs(T)===2&&Math.abs(D)===2&&jt(g+T,_+D+A,i+3)<.5||c(m+T,x+A,p+D,v.LEAVES)}}}return Math.min(le-1,a)}const Cu=24,Lu=4096,Nr={[v.SWITCH]:"switch",[v.SWITCH_ON]:"switch",[v.WIRE]:"wire",[v.SENDER]:"sender",[v.RELAY]:"relay",[v.RECEIVER]:"receiver",[v.RECEIVER_ON]:"receiver",[v.SIGLAMP]:"machine",[v.SIGLAMP_ON]:"machine",[v.GATE]:"machine",[v.GATE_OPEN]:"machine"},yl=new Set(Object.keys(Nr).map(Number)),Pu={[v.RECEIVER]:v.RECEIVER_ON,[v.SIGLAMP]:v.SIGLAMP_ON,[v.GATE]:v.GATE_OPEN},Ux={[v.RECEIVER_ON]:v.RECEIVER,[v.SIGLAMP_ON]:v.SIGLAMP,[v.GATE_OPEN]:v.GATE},kx=(i,t,e)=>i+","+t+","+e,Ox=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];function zx(i){const t=new Set,e=new Set,n=new Set,s=new Map,r=[],a=[];for(const[g,_]of i){const m=Nr[_[3]];(m==="relay"||m==="receiver")&&a.push(g),_[3]===v.SWITCH_ON&&(e.add(g),r.push(g))}let o=0,l=0,c=0,h=0,u=0;const f=Cu*Cu;let d=0;for(;d<r.length&&!(++o>Lu);){const g=r[d++],_=i.get(g),m=Nr[_[3]];if(m==="sender"||m==="relay"){const p=s.get(g);for(const x of a){if(x===g)continue;const y=i.get(x),M=y[0]-_[0],C=y[1]-_[1],A=y[2]-_[2];if(M*M+C*C+A*A>f)continue;const w=Nr[y[3]];w==="relay"&&!n.has(x)?(n.add(x),s.set(x,p),r.push(x)):w==="receiver"&&!e.has(x)&&(e.add(x),t.add(x),c++,r.push(x),l=Math.max(l,Math.hypot(y[0]-p[0],y[1]-p[1],y[2]-p[2])))}continue}for(const[p,x,y]of Ox){const M=kx(_[0]+p,_[1]+x,_[2]+y),C=i.get(M);if(!C)continue;const A=Nr[C[3]];A==="wire"&&!e.has(M)?(e.add(M),r.push(M)):A==="sender"&&!n.has(M)?(n.add(M),s.set(M,C),u++,r.push(M)):A==="machine"&&!t.has(M)&&(t.add(M),h++)}}return{on:t,receivers:c,machines:h,senders:u,reach:l,capped:o>Lu}}const Zr=160,kn=20,Rc=4,Fx=new Set([Dt.PLAINS,Dt.FOREST,Dt.MEADOW,Dt.TAIGA,Dt.SNOW,Dt.DESERT]),Bx=[{key:"bauer",name:"Bäuerin Frieda"},{key:"schmied",name:"Schmied Kalle"},{key:"funker",name:"Funkerin Lotte"},{key:"hirte",name:"Hirte Mats"}],Hx=[[0,-1],[1,0],[0,1],[-1,0]],br=new Map;function ld(i,t){if(br.has(i))return br.get(i);const e=t();return br.size>512&&br.clear(),br.set(i,e),e}const Tn=i=>Math.floor(i/Zr);function aa(i,t,e){return ld(`v${i},${t},${e}`,()=>{if(jt(t,e,i+500)>.75)return null;const n=t*Zr+40+Math.floor(jt(t,e,i+501)*80),s=e*Zr+40+Math.floor(jt(t,e,i+502)*80),r={};mi(i,n,s,r);const a=r.h,o=r.biome;if(!Fx.has(o)||a<te+2||a>te+22)return null;let l=a,c=a;for(let g=-kn-2;g<=kn+2;g+=4)for(let _=-kn-2;_<=kn+2;_+=4)if(!(_*_+g*g>(kn+2)*(kn+2))){if(mi(i,n+_,s+g,r),r.h<=te+1||r.biome===Dt.SWAMP||r.biome===Dt.VOLCANO)return null;l=Math.min(l,r.h),c=Math.max(c,r.h)}if(c-l>9)return null;const h=3+(jt(t,e,i+503)<.5?1:0),u=[];for(let g=0;g<h;g++){const[_,m]=Hx[g],p=n+_*11,x=s+m*11;u.push({x:p,z:x,dx:_,dz:m,door:{x:p-_*3,z:x-m*3},front:{x:p-_*5,z:x-m*5},role:Bx[g]})}const f=o===Dt.DESERT,d=o===Dt.SNOW||o===Dt.TAIGA;return{id:t+","+e,x:n,z:s,y:a,biome:o,houses:u,field:{x0:n+6,z0:s-12,x1:n+12,z1:s-6},mast:{x:n-9,z:s+9},top:f?v.SAND:o===Dt.SNOW?v.SNOW:v.GRASS,wall:f?v.SANDSTONE:d?v.SPRUCE:v.PLANKS,roof:f?v.SANDSTONE:d?v.SPRUCE:v.BRICK,post:d?v.SPRUCE:v.WOOD}})}function Gx(i,t){switch(t.role.key){case"bauer":return{x:i.field.x0-1.5,z:(i.field.z0+i.field.z1)/2+.5};case"funker":return{x:i.mast.x+2.5,z:i.mast.z+.5};case"hirte":return{x:i.x-8.5,z:i.z-8.5};default:return{x:t.front.x+.5+t.dz*2,z:t.front.z+.5+t.dx*2}}}function Vx(i,t,e){return ld(`m${i},${t},${e}`,()=>{if(jt(t,e,i+600)>.5)return null;const n=t*Zr+40+Math.floor(jt(t,e,i+601)*80),s=e*Zr+40+Math.floor(jt(t,e,i+602)*80),r=10+Math.floor(jt(t,e,i+603)*8),a=18+Math.floor(jt(t,e,i+604)*12);return mi(i,n,s,{}).h<r+12?null:{x:n,y:r,z:s,L:a}})}function cd(i,t=0,e=0,n=2){const s=Tn(t),r=Tn(e);let a=null,o=1/0;for(let l=r-n;l<=r+n;l++)for(let c=s-n;c<=s+n;c++){const h=aa(i,c,l);if(!h)continue;const u=Math.hypot(h.x-t,h.z-e);u<o&&(o=u,a=h)}return a}function Wx(i,t,e,n,s,r){const a=t*F,o=e*F,l=Tn(a),c=Tn(o);let h=s;const u=(y,M,C)=>y-a+(C-o)*F+M*F*F,f=(y,M)=>y>=a&&y<a+F&&M>=o&&M<o+F,d=(y,M,C,A)=>{!f(y,C)||M<1||M>=le||(n[u(y,M,C)]=A,A&&M>h&&(h=M),A===v.RADIO&&r&&r(y,M,C,A))},g=(y,M,C)=>f(y,C)&&M>=0&&M<le?n[u(y,M,C)]:v.AIR,_=(y,M,C,A)=>C>=a&&y<a+F&&A>=o&&M<o+F,m=Vx(i,l,c);m&&_(m.x-m.L-2,m.z-m.L-2,m.x+m.L+2,m.z+m.L+2)&&Xx(i,m,a,o,d,g);const p=aa(i,l,c),x=kn+Rc;return p&&_(p.x-x,p.z-x,p.x+x,p.z+x)&&$x(i,p,a,o,d,g),h}function Xx(i,t,e,n,s,r){const a={},o=(c,h,u,f)=>{if(c<e||c>=e+F||h<n||h>=n+F||mi(i,c,h,a).h<t.y+5)return;const d=f==="x"?h-t.z:c-t.x;for(let g=t.y;g<=t.y+2;g++)r(c,g,h)!==v.WATER&&s(c,g,h,v.AIR);r(c,t.y-1,h)===v.AIR&&s(c,t.y-1,h,v.PLANKS),u%5===0&&(d!==0&&(s(c,t.y,h,v.WOOD),s(c,t.y+1,h,v.WOOD)),s(c,t.y+2,h,d===0&&u%10===0&&jt(c,h,i+605)<.5?v.LAMP:v.PLANKS))},l=(c,h)=>{if(c<e||c>=e+F||h<n||h>=n+F||r(c,t.y+1,h)!==v.STONE)return;const u=jt(c,h,i+606);u<.07&&s(c,t.y+1,h,u<.035?v.COAL:u<.055?v.COPPER:v.IRON)};for(let c=-t.L;c<=t.L;c++){for(let h=-1;h<=1;h++)o(t.x+c,t.z+h,Math.abs(c),"x"),o(t.x+h,t.z+c,Math.abs(c),"z");l(t.x+c,t.z-2),l(t.x+c,t.z+2),l(t.x-2,t.z+c),l(t.x+2,t.z+c)}for(let c=-2;c<=2;c++)for(let h=-2;h<=2;h++){const u=t.x+h,f=t.z+c;if(!(u<e||u>=e+F||f<n||f>=n+F))for(let d=t.y;d<=t.y+3;d++)s(u,d,f,v.AIR)}s(t.x+2,t.y,t.z+2,v.FURNACE),s(t.x-2,t.y,t.z+2,v.WORKBENCH)}function $x(i,t,e,n,s,r){const a={},o=t.y,l=kn+Rc;for(let f=n;f<n+F;f++)for(let d=e;d<e+F;d++){const g=Math.hypot(d-t.x,f-t.z);if(g>l)continue;const _=mi(i,d,f,a).h,m=g<=kn?o:Math.round(o+(_-o)*(g-kn)/Rc);for(let p=Math.min(_+1,m-3);p<m;p++)s(d,p,f,v.DIRT);s(d,m,f,t.top);for(let p=m+1,x=Math.min(le-1,Math.max(_,m)+18);p<=x;p++)r(d,p,f)!==v.AIR&&s(d,p,f,v.AIR)}const c=(f,d,g,_,m,p,x)=>{for(let y=d;y<=m;y++)for(let M=Math.max(g,n);M<=Math.min(p,n+F-1);M++)for(let C=Math.max(f,e);C<=Math.min(_,e+F-1);C++)s(C,y,M,x)};c(t.x-3,o,t.z-3,t.x+3,o,t.z+3,v.PATH);for(const f of t.houses){const d=Math.min(t.x,f.front.x),g=Math.max(t.x,f.front.x),_=Math.min(t.z,f.front.z),m=Math.max(t.z,f.front.z);c(d,o,_,g,o,m,v.PATH),c(f.front.x,o,f.front.z,f.door.x,o,f.door.z,v.PATH)}c(t.x-1,o,t.z-1,t.x+1,o+1,t.z+1,v.COBBLE),c(t.x,o-1,t.z,t.x,o,t.z,v.WATER),s(t.x,o+1,t.z,v.AIR);for(const[f,d]of[[-4,-4],[4,-4],[4,4],[-4,4]])c(t.x+f,o+1,t.z+d,t.x+f,o+2,t.z+d,t.post),s(t.x+f,o+3,t.z+d,v.LAMP);for(const f of t.houses){c(f.x-3,o,f.z-3,f.x+3,o,f.z+3,v.COBBLE),c(f.x-2,o,f.z-2,f.x+2,o,f.z+2,v.PLANKS);for(let m=-3;m<=3;m++)for(let p=-3;p<=3;p++){const x=Math.abs(p)===3||Math.abs(m)===3,y=Math.abs(p)===3&&Math.abs(m)===3;for(let C=o+1;C<=o+4;C++)s(f.x+p,C,f.z+m,y?t.post:x?t.wall:v.AIR);(Math.abs(p)===3&&m===0||Math.abs(m)===3&&p===0)&&!(p===-f.dx*3&&m===-f.dz*3)&&s(f.x+p,o+2,f.z+m,v.GLASS)}s(f.door.x,o+1,f.door.z,v.AIR),s(f.door.x,o+2,f.door.z,v.AIR);for(let m=0;m<=4;m++)c(f.x-4+m,o+5+m,f.z-4+m,f.x+4-m,o+5+m,f.z+4-m,t.roof);s(f.x,o+4,f.z,v.LAMP);const d=f.x+f.dx*2+(f.dz?2:0),g=f.z+f.dz*2+(f.dx?2:0),_={bauer:v.WORKBENCH,schmied:v.FURNACE,funker:v.RADIO,hirte:v.WOOL}[f.role.key];if(s(d,o+1,g,_),f.role.key==="schmied"){const m=f.front.x+f.dz*3,p=f.front.z+f.dx*3;s(m,o+1,p,v.FURNACE),s(m,o+2,p,v.COBBLE)}}const h=t.field,u=h.z0+h.z1>>1;for(let f=h.z0;f<=h.z1;f++)for(let d=h.x0;d<=h.x1;d++){if(f===u){s(d,o,f,v.WATER);continue}s(d,o,f,v.FARMLAND),s(d,o+1,f,jt(d,f,i+510)<.7?v.WHEAT3:v.WHEAT2)}c(t.mast.x,o+1,t.mast.z,t.mast.x,o+7,t.mast.z,t.post),s(t.mast.x,o+8,t.mast.z,v.LAMP),s(t.mast.x+1,o+1,t.mast.z,v.RADIO)}const hd=3,ud=i=>i===2||i===3?i:1,fd=52;function io(i,t,e){const n=je(t/110,e/110,i,4),s=je(t/24,e/24,i+5,2),r=Math.floor(10+n*44+(s-.5)*5);return Math.max(2,Math.min(fd,r))}function wi(i,t){return(i+32768)*65536+(t+32768)}class Du{constructor(t,e,n=1){this.seed=t|0,this.gen=ud(n),this.chunks=new Map,this.edits=e||new Map,this.dirty=new Set,this.radios=new Map,this.sig=new Map,this.sigDirty=!1,this.onSet=null}getChunk(t,e){return this.chunks.get(wi(t,e))}ensure(t,e){const n=wi(t,e);let s=this.chunks.get(n);return s||(s=this.generate(t,e,n),this.chunks.set(n,s)),s}generate(t,e,n){const s=new Uint8Array(F*F*le);let r=this.gen>=2?Nx(this.seed,t,e,s):this.generate1(t,e,s);return this.gen===3&&(r=Wx(this.seed,t,e,s,r,(a,o,l)=>this.radios.set(`${a},${o},${l}`,[a,o,l]))),this.finish(t,e,n,s,r)}generate1(t,e,n){const s=this.seed;let r=0;for(let a=0;a<F;a++)for(let o=0;o<F;o++){const l=t*F+o,c=e*F+a,h=io(s,l,c),u=h<=te+1;for(let d=0;d<=h;d++){let g;d===0||d<h-3?g=v.STONE:u?g=v.SAND:d<h?g=v.DIRT:g=h>=46?v.STONE:v.GRASS,n[o+a*F+d*F*F]=g}for(let d=h+1;d<=te;d++)n[o+a*F+d*F*F]=v.WATER;const f=Math.max(h,h<te?te:0);f>r&&(r=f)}for(let a=2;a<F-2;a++)for(let o=2;o<F-2;o++){const l=t*F+o,c=e*F+a;if(jt(l,c,s+99)>=.012)continue;const h=io(s,l,c);if(h<=te+1||h>=44||n[o+a*F+h*F*F]!==v.GRASS)continue;const u=4+Math.floor(jt(l,c,s+7)*3);for(let f=1;f<=u;f++)n[o+a*F+(h+f)*F*F]=v.WOOD;for(let f=u-2;f<=u+1;f++){const d=f>=u?1:2;for(let g=-d;g<=d;g++)for(let _=-d;_<=d;_++){if(d===2&&Math.abs(_)===2&&Math.abs(g)===2&&jt(l+_,c+g+f,s+3)<.5)continue;const m=o+_+(a+g)*F+(h+f)*F*F;n[m]===v.AIR&&(n[m]=v.LEAVES)}}h+u+1>r&&(r=h+u+1)}return r}finish(t,e,n,s,r){const a=this.edits.get(n);if(a)for(const[o,l]of a){const c=o/(F*F)|0;s[o]===v.RADIO&&l!==v.RADIO&&this.radios.delete(`${t*F+(o&15)},${c},${e*F+(o>>4&15)}`),s[o]=l,c>r&&(r=c);const h=t*F+(o&15),u=e*F+(o>>4&15);l===v.RADIO&&this.radios.set(`${h},${c},${u}`,[h,c,u]),yl.has(l)?(this.sig.set(`${h},${c},${u}`,[h,c,u,l]),this.sigDirty=!0):this.sig.delete(`${h},${c},${u}`)&&(this.sigDirty=!0)}return{cx:t,cz:e,key:n,data:s,maxY:r,hm:null,opaque:null,trans:null,logo:null,meshed:!1}}getBlock(t,e,n){if(e<0)return v.STONE;if(e>=le)return v.AIR;const s=this.chunks.get(wi(t>>4,n>>4));return s?s.data[(t&15)+(n&15)*F+e*F*F]:v.AIR}isLoaded(t,e){return this.chunks.has(wi(t>>4,e>>4))}isSolid(t,e,n){if(e<0)return!0;if(e>=le)return!1;const s=this.chunks.get(wi(t>>4,n>>4));return s?Kr[s.data[(t&15)+(n&15)*F+e*F*F]]===1:!0}setBlock(t,e,n,s){if(e<0||e>=le)return!1;const r=t>>4,a=n>>4,o=this.chunks.get(wi(r,a));if(!o)return!1;const l=t&15,c=n&15,h=l+c*F+e*F*F,u=o.data[h];if(u===s)return!1;o.data[h]=s,u===v.RADIO&&this.radios.delete(`${t},${e},${n}`),s===v.RADIO&&this.radios.set(`${t},${e},${n}`,[t,e,n]),yl.has(s)?(this.sig.set(`${t},${e},${n}`,[t,e,n,s]),this.sigDirty=!0):yl.has(u)&&(this.sig.delete(`${t},${e},${n}`),this.sigDirty=!0),e>o.maxY&&(o.maxY=e),o.hm=null;let f=this.edits.get(o.key);f||(f=new Map,this.edits.set(o.key,f)),f.set(h,s),this.dirty.add(o);const d=l===0?-1:l===F-1?1:0,g=c===0?-1:c===F-1?1:0;for(let _=Math.min(0,g);_<=Math.max(0,g);_++)for(let m=Math.min(0,d);m<=Math.max(0,d);m++)if(m||_){const p=this.chunks.get(wi(r+m,a+_));p&&this.dirty.add(p)}return this.onSet&&this.onSet(t,e,n,s),!0}heightmap(t){if(t.hm)return t.hm;const e=new Uint8Array(F*F),n=t.data;for(let s=0;s<F*F;s++)for(let r=Math.min(le-1,t.maxY);r>=0;r--)if(sd[n[s+r*F*F]]){e[s]=r+1;break}return t.hm=e}neighborhood(t){const e=new Array(9);for(let n=-1;n<=1;n++)for(let s=-1;s<=1;s++){const r=this.chunks.get(wi(t.cx+s,t.cz+n));if(!r)return null;e[(n+1)*3+s+1]=r.data}return e}findSpawn(t=!0){if(this.gen===3&&t){const e=cd(this.seed);if(e)return this.ensure(e.x>>4,e.z+3>>4),{x:e.x+.5,y:e.y+1.01,z:e.z+3.5}}if(this.gen>=2){const e=this.findSpawn2();if(e)return e}for(let e=0;e<60;e++)for(let n=0;n<Math.max(1,e*8);n++){const s=n/Math.max(1,e*8)*Math.PI*2,r=Math.round(Math.cos(s)*e*4),a=Math.round(Math.sin(s)*e*4),o=io(this.seed,r,a);if(o<=te+1||o>=44)continue;const l=this.ensure(r>>4,a>>4);let c=le-1;for(;c>0&&l.data[(r&15)+(a&15)*F+c*F*F]===v.AIR;)c--;const h=l.data[(r&15)+(a&15)*F+c*F*F];if(!(h===v.WOOD||h===v.LEAVES||h===v.WATER))return{x:r+.5,y:c+1.01,z:a+.5}}return{x:.5,y:fd+2,z:.5}}findSpawn2(){const t={};for(let e=0;e<120;e++){const n=Math.max(1,e*8);for(let s=0;s<n;s++){const r=s/n*Math.PI*2,a=Math.round(Math.cos(r)*e*8),o=Math.round(Math.sin(r)*e*8);if(mi(this.seed,a,o,t),!Lx.includes(t.biome)||t.h<te+2||t.h>te+18)continue;const l=this.ensure(a>>4,o>>4);let c=le-1;for(;c>0&&l.data[(a&15)+(o&15)*F+c*F*F]===v.AIR;)c--;const h=l.data[(a&15)+(o&15)*F+c*F*F];if(!(h!==v.GRASS&&h!==v.FLOWERS)&&!(l.data[(a&15)+(o&15)*F+(c+1)*F*F]!==v.AIR||l.data[(a&15)+(o&15)*F+(c+2)*F*F]!==v.AIR))return{x:a+.5,y:c+1.01,z:o+.5}}}return null}biomeAt(t,e){return this.gen<2?-1:mi(this.seed,Math.floor(t),Math.floor(e),{}).biome}villageAt(t,e){if(this.gen!==3)return null;const n=aa(this.seed,Tn(Math.floor(t)),Tn(Math.floor(e)));return n&&Math.hypot(n.x+.5-t,n.z+.5-e)<=kn+4?n:null}}const Ro=3,dd=2,qx=["survival","creative","story"],Bi=i=>"klotzfunk.world."+i,Co=i=>"klotzfunk.meta."+i,li=i=>"klotzfunk-bak.world."+i,Ws=i=>"klotzfunk-bak.time."+i,Yx=10*60*1e3,Lo=()=>{try{return globalThis.localStorage||null}catch{return null}},gi=i=>{try{return Lo().getItem(i)}catch{return null}},hr=i=>{try{return i?JSON.parse(i):null}catch{return null}};function pd(i){const t={};for(const[e,n]of i){if(!n.size)continue;const s=new Uint8Array(n.size*3);let r=0;for(const[o,l]of n)s[r++]=o&255,s[r++]=o>>8,s[r++]=l;let a="";for(let o=0;o<s.length;o+=8192)a+=String.fromCharCode.apply(null,s.subarray(o,o+8192));t[e]=btoa(a)}return t}function Kx(i){const t=new Map;if(!i||typeof i!="object")return t;for(const e of Object.keys(i)){const n=i[e],s=new Map;if(Array.isArray(n))for(let a=0;a+1<n.length;a+=2)Number.isInteger(n[a])&&Number.isInteger(n[a+1])&&s.set(n[a],n[a+1]&255);else if(typeof n=="string"){let a="";try{a=atob(n)}catch{continue}for(let o=0;o+2<a.length;o+=3)s.set(a.charCodeAt(o)|a.charCodeAt(o+1)<<8,a.charCodeAt(o+2))}const r=Number(e);s.size&&Number.isFinite(r)&&t.set(r,s)}return t}function oa(i){return!!i&&typeof i=="object"&&Number.isFinite(i.seed)&&qx.includes(i.mode)&&typeof i.name=="string"&&(i.edits===void 0||typeof i.edits=="object"&&i.edits!==null)}function md(i){return hr(gi(Co(i)))}function gd(i){const t=hr(gi(Bi(i)));return oa(t)?t:null}function _d(i){const t=hr(gi(li(i)));return oa(t)?t:null}function jx(i){return gi(li(i))!==null}const vd=i=>({name:i.name,mode:i.mode,seed:i.seed,gen:i.gen||1,savedAt:i.savedAt,q:i.story?i.story.done?-1:i.story.i:void 0,qc:i.story?i.story.c:void 0});function xd(i,t){const e=Lo();if(!e)return!1;let n;try{n=JSON.stringify(t)}catch{return!1}const s=gi(Bi(i)),r=Date.now();if(s&&s!==n&&r-(Number(gi(Ws(i)))||0)>Yx&&oa(hr(s)))try{e.setItem(li(i),s),e.setItem(Ws(i),String(r))}catch{try{e.removeItem(li(i)),e.removeItem(Ws(i))}catch{}}try{e.setItem(Bi(i),n)}catch{try{for(let o=0;o<Ro;o++)e.removeItem(li(o)),e.removeItem(Ws(o));e.setItem(Bi(i),n)}catch{return!1}}try{e.setItem(Co(i),JSON.stringify(vd(t)))}catch{}return!0}function Zx(i){const t=Lo();if(t)for(const e of[Bi(i),Co(i),li(i),Ws(i)])try{t.removeItem(e)}catch{}}function Md(i){const t=Lo(),e=gi(li(i)),n=hr(e);if(!t||!oa(n))return!1;const s=gi(Bi(i));try{t.setItem(Bi(i),e),s?t.setItem(li(i),s):t.removeItem(li(i)),t.setItem(Ws(i),String(Date.now())),t.setItem(Co(i),JSON.stringify(vd(n)))}catch{return!1}return!0}function Jx(i){return JSON.stringify({format:"klotzfunk-world",version:dd,exportedAt:Date.now(),save:i})}function Qx(i){const t=hr(i);if(!t)return null;const e=t.format==="klotzfunk-world"?t.save:t;return oa(e)?(e.name=e.name.slice(0,40),e):null}function yd(){for(let i=0;i<Ro;i++)if(gi(Bi(i))===null)return i;return-1}const Sd="klotzfunk.settings",Cc={eco:{name:"Eco",dpr:.75,view:3,clouds:!1,budget:3},mobile:{name:"Mobil",dpr:1.25,view:4,clouds:!0,budget:4},standard:{name:"Standard",dpr:1.5,view:6,clouds:!0,budget:6},high:{name:"Hoch",dpr:2,view:9,clouds:!0,budget:8}},Ur={quality:"auto",mouseSens:1,touchSens:1,joySens:1,btnScale:1,lefty:!1,invertY:!1,placeDelay:!0,sfxVol:.8,musicVol:.8,ambVol:.7,showFps:!1,deathLoss:"keep",enemies:!0,preview:!0,stun:!0,mpName:"",minimap:!0,keys:{},padKeys:{},padSens:1,padRumble:.8,padDead:.18,padInvertY:!1,touchPos:{}};function tM(){let i={};try{i=JSON.parse(globalThis.localStorage.getItem(Sd))||{}}catch{i={}}const t={...Ur};for(const e of Object.keys(Ur))i[e]!==void 0&&typeof i[e]==typeof Ur[e]&&i[e]===null==(Ur[e]===null)&&(t[e]=i[e]);return t.quality!=="auto"&&!Cc[t.quality]&&(t.quality="auto"),["keep","grave"].includes(t.deathLoss)||(t.deathLoss="keep"),t}function $i(i){try{return globalThis.localStorage.setItem(Sd,JSON.stringify(i)),!0}catch{return!1}}function eM(i){return i?"mobile":"standard"}const qi=1e3,Te=[],tt={},mo=[],An=[{key:"WOOD",name:"Holz",speed:2,dur:60,col:"#b48a52"},{key:"STONE",name:"Stein",speed:3,dur:140,col:"#8c8c94"},{key:"COPPER",name:"Kupfer",speed:4,dur:220,col:"#d8803c"},{key:"IRON",name:"Eisen",speed:6,dur:360,col:"#dcdce4"}],Ed=[{key:"PICK",kind:"spitzhacke",name:"spitzhacke"},{key:"AXE",kind:"axt",name:"axt"},{key:"SHOVEL",kind:"schaufel",name:"schaufel"}];function ze(i,t,e,n){if(Te[i])throw new Error("Item-Id doppelt: "+i);const s={id:i,key:t,name:e,cat:"items",icon:mo.length,food:0,tool:null,...n};return Te[i]=s,tt[t]=i,mo.push(i),s}ze(1e3,"STICK","Stock",{draw:"stick"});ze(1001,"COPPER_INGOT","Kupferbarren",{draw:"ingot",col:"#d8803c"});ze(1002,"IRON_INGOT","Eisenbarren",{draw:"ingot",col:"#dcdce4"});ze(1003,"APPLE","Apfel",{draw:"apple",food:4});ze(1004,"MEAT_RAW","Rohes Fleisch",{draw:"meat",col:"#e0605a",food:2});ze(1005,"MEAT_COOKED","Braten",{draw:"meat",col:"#9a5a2a",food:7});An.forEach((i,t)=>Ed.forEach((e,n)=>{ze(1010+t*3+n,i.key+"_"+e.key,i.name+e.name,{draw:e.kind,col:i.col,tool:{kind:e.kind,tier:t+1,speed:i.speed,dur:i.dur}})}));ze(1022,"WOOD_HOE","Holzhacke",{draw:"hacke",col:An[0].col,tool:{kind:"hacke",tier:1,speed:1,dur:An[0].dur}});ze(1023,"STONE_HOE","Steinhacke",{draw:"hacke",col:An[1].col,tool:{kind:"hacke",tier:2,speed:1,dur:An[1].dur}});ze(1024,"SEEDS","Weizensamen",{draw:"seeds",plant:v.WHEAT0});ze(1025,"WHEAT","Weizen",{draw:"wheat"});ze(1026,"BREAD","Brot",{draw:"bread",food:6});An.forEach((i,t)=>ze(1027+t,i.key+"_SWORD",i.name+"schwert",{draw:"schwert",col:i.col,tool:{kind:"schwert",tier:t+1,speed:1,dur:i.dur,dmg:3+t}}));ze(1031,"COPPER_HELMET","Kupferhelm",{draw:"helm",col:An[2].col,armor:{slot:"kopf",pts:2,dur:60}});ze(1032,"COPPER_CHEST","Kupferharnisch",{draw:"harnisch",col:An[2].col,armor:{slot:"brust",pts:3,dur:80}});ze(1033,"IRON_HELMET","Eisenhelm",{draw:"helm",col:An[3].col,armor:{slot:"kopf",pts:3,dur:110}});ze(1034,"IRON_CHEST","Eisenharnisch",{draw:"harnisch",col:An[3].col,armor:{slot:"brust",pts:5,dur:150}});ze(1035,"BOAT","Boot",{draw:"boot",col:"#a87a46",vehicle:"boot"});ze(1036,"MINECART","Lore",{draw:"lore",col:"#8a8c94",vehicle:"lore"});const Di=i=>i>=qi,Tr=i=>i>=qi&&Te[i]&&Te[i].armor||null,Iu=i=>1-Math.min(.4,Math.max(0,i)*.05),Nu=i=>i>=qi&&Te[i]&&Te[i].vehicle||null,Sl=i=>i>=qi&&Te[i]&&Te[i].plant||0,ge=i=>i>=qi?Te[i]?Te[i].name:"?":Yr[i]||"?",Ii=i=>i>=qi&&Te[i]?Te[i].tool:null,Uu=i=>i>=qi&&Te[i]?Te[i].food:0,ku=i=>!!(i>=qi?Te[i]:Yt[i]),nM=.9;function iM(i,t){const e=Yt[i];if(!e)return .5;const n=Ii(t),s=n&&e.tool===n.kind?n.speed:1;return Math.max(.12,e.hard*nM/s)}function sM(i,t){const e=Yt[i];if(!e||!e.tier)return!0;const n=Ii(t);return!!n&&n.kind==="spitzhacke"&&n.tier>=e.tier}function rM(i,t){const e=Yt[i],n=Ii(t);return!!(e&&n&&e.tool===n.kind)}const Xe=999,gn=[{id:"planks",give:[v.PLANKS,4],need:[[v.WOOD,1]]},{id:"planks2",give:[v.PLANKS,4],need:[[v.SPRUCE,1]]},{id:"glass",give:[v.GLASS,1],need:[[v.SAND,2]]},{id:"lamp",give:[v.LAMP,2],need:[[v.GLASS,2],[v.WOOD,1]]},{id:"lampCoal",give:[v.LAMP,2],need:[[v.COAL,1],[v.PLANKS,1]]},{id:"lampCrystal",give:[v.LAMP,4],need:[[v.CRYSTAL,1],[v.GLASS,1]]},{id:"feder",give:[v.FEDER,2],need:[[v.LEAVES,4],[v.PLANKS,1]]},{id:"turbo",give:[v.TURBO,2],need:[[v.STONE,2],[v.LAMP,1]]},{id:"turboIron",give:[v.TURBO,3],need:[[v.IRON,1],[v.STONE,2]]},{id:"wind",give:[v.WIND,2],need:[[v.GLASS,2],[v.LEAVES,2]]},{id:"radio",give:[v.RADIO,1],need:[[v.PLANKS,4],[v.LAMP,1]]},{id:"radioCopper",give:[v.RADIO,2],need:[[v.PLANKS,2],[v.COPPER,1],[v.LAMP,1]]},{id:"rainbow",give:[v.RAINBOW,2],need:[[v.GLASS,2],[v.LAMP,1]]},{id:"neonR",give:[v.NEON_R,3],need:[[v.LAMP,1],[v.SAND,1]]},{id:"neonB",give:[v.NEON_B,3],need:[[v.LAMP,1],[v.GLASS,1]]},{id:"neonG",give:[v.NEON_G,3],need:[[v.LAMP,1],[v.LEAVES,1]]},{id:"neonP",give:[v.NEON_P,3],need:[[v.LAMP,1],[v.DIRT,1]]},{id:"brick",give:[v.BRICK,4],need:[[v.DIRT,2],[v.SAND,1]]},{id:"brickClay",give:[v.BRICK,4],need:[[v.CLAY,2],[v.COAL,1]]},{id:"marble",give:[v.MARBLE,2],need:[[v.STONE,2],[v.SAND,1]]},{id:"sandstone",give:[v.SANDSTONE,2],need:[[v.SAND,4]]}];for(let i=0;i<Zc;i++)gn.push({id:"logo"+(i+1),give:[pi+i,2],need:[[v.PLANKS,1]]});gn.push({id:"sticks",give:[tt.STICK,4],need:[[v.PLANKS,2]]},{id:"workbench",give:[v.WORKBENCH,1],need:[[v.PLANKS,4]]},{id:"furnace",give:[v.FURNACE,1],need:[[v.STONE,8]],st:"werkbank"});const bd=[v.PLANKS,v.STONE,tt.COPPER_INGOT,tt.IRON_INGOT],aM=[3,3,1];An.forEach((i,t)=>Ed.forEach((e,n)=>{const s=tt[i.key+"_"+e.key];gn.push({id:"tool"+s,give:[s,1],need:[[bd[t],aM[n]],[tt.STICK,2]],st:"werkbank"})}));const oM=[v.PLANKS,v.STONE];["WOOD","STONE"].forEach((i,t)=>gn.push({id:"tool"+tt[i+"_HOE"],give:[tt[i+"_HOE"],1],need:[[oM[t],2],[tt.STICK,2]],st:"werkbank"}));An.forEach((i,t)=>gn.push({id:"tool"+tt[i.key+"_SWORD"],give:[tt[i.key+"_SWORD"],1],need:[[bd[t],2],[tt.STICK,1]],st:"werkbank"}));gn.push({id:"bread",give:[tt.BREAD,1],need:[[tt.WHEAT,3]]});gn.push({id:"copperHelmet",give:[tt.COPPER_HELMET,1],need:[[tt.COPPER_INGOT,5]],st:"werkbank"},{id:"copperChest",give:[tt.COPPER_CHEST,1],need:[[tt.COPPER_INGOT,8]],st:"werkbank"},{id:"ironHelmet",give:[tt.IRON_HELMET,1],need:[[tt.IRON_INGOT,5]],st:"werkbank"},{id:"ironChest",give:[tt.IRON_CHEST,1],need:[[tt.IRON_INGOT,8]],st:"werkbank"},{id:"cobble",give:[v.COBBLE,2],need:[[v.STONE,2]]},{id:"path",give:[v.PATH,2],need:[[v.GRAVEL,1],[v.DIRT,1]]});gn.push({id:"switch",give:[v.SWITCH,2],need:[[v.STONE,1],[tt.STICK,1]],st:"werkbank"},{id:"wire",give:[v.WIRE,8],need:[[tt.COPPER_INGOT,1],[v.STONE,1]],st:"werkbank"},{id:"sender",give:[v.SENDER,1],need:[[tt.COPPER_INGOT,2],[v.CRYSTAL,1],[v.RADIO,1]],st:"werkbank"},{id:"relay",give:[v.RELAY,1],need:[[tt.COPPER_INGOT,1],[v.CRYSTAL,1],[v.STONE,2]],st:"werkbank"},{id:"receiver",give:[v.RECEIVER,1],need:[[tt.COPPER_INGOT,1],[v.GLASS,1],[v.PLANKS,2]],st:"werkbank"},{id:"siglamp",give:[v.SIGLAMP,2],need:[[v.LAMP,1],[v.WIRE,1]],st:"werkbank"},{id:"gate",give:[v.GATE,2],need:[[tt.IRON_INGOT,1],[v.PLANKS,4]],st:"werkbank"});gn.push({id:"boat",give:[tt.BOAT,1],need:[[v.PLANKS,5],[tt.STICK,1]],st:"werkbank"},{id:"minecart",give:[tt.MINECART,1],need:[[tt.IRON_INGOT,3],[tt.COPPER_INGOT,2]],st:"werkbank"},{id:"rail",give:[v.RAIL,16],need:[[tt.COPPER_INGOT,3],[tt.STICK,2]],st:"werkbank"});gn.push({id:"ingotCopper",give:[tt.COPPER_INGOT,1],need:[[v.COPPER,1],[v.COAL,1]],st:"ofen"},{id:"ingotIron",give:[tt.IRON_INGOT,1],need:[[v.IRON,1],[v.COAL,1]],st:"ofen"},{id:"cook",give:[tt.MEAT_COOKED,1],need:[[tt.MEAT_RAW,1],[v.PLANKS,1]],st:"ofen"},{id:"cookCoal",give:[tt.MEAT_COOKED,4],need:[[tt.MEAT_RAW,4],[v.COAL,1]],st:"ofen"},{id:"glassOven",give:[v.GLASS,3],need:[[v.SAND,3],[v.COAL,1]],st:"ofen"});for(const i of gn)i.cat=(Te[i.give[0]]||Yt[i.give[0]]).cat;const Ou={werkbank:"Werkbank",ofen:"Schmelzofen"},lM={werkbank:"eine Werkbank",ofen:"einen Schmelzofen"},hs=(i,t)=>i[t]||0;function th(i,t,e=Xe,n=null){const s=t.need.filter(([o,l])=>hs(i,o)<l).map(([o,l])=>[o,l-hs(i,o)]),r=hs(i,t.give[0])+t.give[1]>e,a=!!(t.st&&n&&!n.has(t.st));return{ok:!s.length&&!r&&!a,missing:s,full:r,noStation:a}}function Td(i,t,e=Xe,n=null){const s=th(i,t,e,n);if(!s.ok)return{ok:!1,msg:s.noStation?`Braucht ${lM[t.st]} in der Nähe`:s.missing.length?"Es fehlt: "+s.missing.map(([a,o])=>`${o}× ${ge(a)}`).join(", "):`Vorrat voll: höchstens ${e}× ${ge(t.give[0])}`};for(const[r,a]of t.need)i[r]=hs(i,r)-a;return i[t.give[0]]=hs(i,t.give[0])+t.give[1],{ok:!0,msg:`+${t.give[1]} ${ge(t.give[0])}`}}function cM(i,t,e=Xe,n=null){if(t.st&&n&&!n.has(t.st))return 0;let s=Math.floor((e-hs(i,t.give[0]))/t.give[1]);for(const[r,a]of t.need)s=Math.min(s,Math.floor(hs(i,r)/a));return Math.max(0,s)}function hM(i,t){return t?(t=t.toLowerCase(),ge(i.give[0]).toLowerCase().includes(t)||i.need.some(([e])=>ge(e).toLowerCase().includes(t))):!0}const eh=[{n:[1,0,0],o:[1,0,1],a:[0,0,-1],b:[0,1,0],k:1},{n:[-1,0,0],o:[0,0,0],a:[0,0,1],b:[0,1,0],k:1},{n:[0,0,1],o:[0,0,1],a:[1,0,0],b:[0,1,0],k:1},{n:[0,0,-1],o:[1,0,0],a:[-1,0,0],b:[0,1,0],k:1},{n:[0,1,0],o:[0,1,0],a:[0,0,1],b:[1,0,0],k:0},{n:[0,-1,0],o:[0,0,0],a:[1,0,0],b:[0,0,1],k:2}],uM=[[0,0],[1,0],[1,1],[0,1]];for(const i of eh)i.c=uM.map(([t,e])=>{const n=t?1:-1,s=e?1:-1,r=(a,o,l)=>[i.n[0]*a+i.a[0]*o+i.b[0]*l,i.n[1]*a+i.a[1]*o+i.b[1]*l,i.n[2]*a+i.a[2]*o+i.b[2]*l];return{i:t,j:e,p:[i.o[0]+t*i.a[0]+e*i.b[0],i.o[1]+t*i.a[1]+e*i.b[1],i.o[2]+t*i.a[2]+e*i.b[2]],s1:r(1,n,0),s2:r(1,0,s),cn:r(1,n,s)}});const zu=[.45,.66,.84,1],fM=[1,.62,.38,.18];function dM(i,t){return t===v.AIR?!0:zr[t]?!1:i===t?rd[i]===1:!0}class so{constructor(){this.pos=[],this.uv=[],this.col=[],this.idx=[],this.n=0}finish(){return this.n?{pos:new Float32Array(this.pos),uv:new Float32Array(this.uv),col:new Float32Array(this.col),idx:this.n>16383?new Uint32Array(this.idx):new Uint16Array(this.idx)}:null}}function Po(i,t){const e=t?4:wx,n=t?4:Au,s=1/e,r=1/n,a=(t?3:2)/512,o=t?a:2/(64*Au);return[i%e*s+a,1-(Math.floor(i/e)+1)*r+o,s-2*a,r-2*o]}function Ad(i,t){const e=i.neighborhood(t);if(!e)return null;const n=[];for(let s=-1;s<=1;s++)for(let r=-1;r<=1;r++)n.push(i.heightmap(i.getChunk(t.cx+r,t.cz+s)));return{nb:e,hms:n,maxY:t.maxY}}function pM(i,t){const e=Ad(i,t);return e?mM(e.nb,e.hms,e.maxY):null}function mM(i,t,e){const n=i[4],s=(f,d)=>(d<0?0:d>=F?2:1)*3+(f<0?0:f>=F?2:1),r=(f,d,g)=>d<0?v.STONE:d>=le?v.AIR:i[s(f,g)][(f&15)+((g&15)<<4)+(d<<8)],a=(f,d,g)=>{const _=t[s(f,g)][(f&15)+((g&15)<<4)];return d>=_?1:fM[Math.min(3,_-d)]},o=new so,l=new so,c=new so,h=[0,0,0,0],u=Math.min(le-1,e+1);for(let f=0;f<=u;f++)for(let d=0;d<F;d++)for(let g=0;g<F;g++){const _=n[g+(d<<4)+(f<<8)];if(_===v.AIR)continue;if(ad[_]){_M(o,g,f,d,Fr[_][0],a(g,f,d));continue}if(od[_]){const A=(w,D)=>r(g+w,f,d+D)===_||r(g+w,f+1,d+D)===_||r(g+w,f-1,d+D)===_;vM(o,g,f,d,Fr[_][0],a(g,f,d),(A(1,0)||A(-1,0))&&!A(0,1)&&!A(0,-1));continue}const m=wo(_),p=m?c:wc[_]?l:o,x=Qc[_],y=_===v.WATER&&r(g,f+1,d)!==v.WATER,M=Fr[_],C=x===0&&!wc[_];for(let A=0;A<6;A++){const w=eh[A];if(!dM(_,r(g+w.n[0],f+w.n[1],d+w.n[2])))continue;const D=m?_-pi:M[w.k],[T,b,I,K]=Po(D,m);for(let q=0;q<4;q++){const Z=w.c[q],$=a(g+w.n[0],f+w.n[1],d+w.n[2]),nt=g+Z.s1[0],W=f+Z.s1[1],ct=d+Z.s1[2],_t=g+Z.s2[0],Ct=f+Z.s2[1],Wt=d+Z.s2[2],ce=g+Z.cn[0],Y=f+Z.cn[1],it=d+Z.cn[2],St=zr[r(nt,W,ct)],ot=zr[r(_t,Ct,Wt)],It=zr[r(ce,Y,it)],Ot=C?St&&ot?0:3-(St+ot+It):3,Xt=($+(St?$:a(nt,W,ct))+(ot?$:a(_t,Ct,Wt))+(It?$:a(ce,Y,it)))/4;h[q]=zu[Ot]*(.5+.5*Xt),p.pos.push(g+Z.p[0],f+Z.p[1]-(y&&Z.p[1]===1?.12:0),d+Z.p[2]),p.uv.push(T+Z.i*I,b+Z.j*K),p.col.push(zu[Ot],Xt,x,A)}const H=p.n*4;h[0]+h[2]<h[1]+h[3]?p.idx.push(H+1,H+2,H+3,H+1,H+3,H):p.idx.push(H,H+1,H+2,H,H+2,H+3),p.n++}}return{opaque:o.finish(),trans:l.finish(),logo:c.finish()}}const gM=[[[.15,.15],[.85,.85]],[[.85,.15],[.15,.85]]];function _M(i,t,e,n,s,r){const[a,o,l,c]=Po(s,!1);for(const[[h,u],[f,d]]of gM)for(const g of[0,1]){const _=i.n*4,m=g?[[f,d],[h,u]]:[[h,u],[f,d]];i.pos.push(t+m[0][0],e,n+m[0][1],t+m[1][0],e,n+m[1][1],t+m[1][0],e+1,n+m[1][1],t+m[0][0],e+1,n+m[0][1]),i.uv.push(a,o,a+l,o,a+l,o+c,a,o+c);for(let p=0;p<4;p++)i.col.push(.9,r,0,4);i.idx.push(_,_+1,_+2,_,_+2,_+3),i.n++}}function vM(i,t,e,n,s,r,a){const[o,l,c,h]=Po(s,!1),u=e+.0625,f=[o,l,o,l+h,o+c,l+h,o+c,l],d=[o,l,o+c,l,o+c,l+h,o,l+h],g=a?d:f;for(const _ of[0,1]){const m=i.n*4;_?(i.pos.push(t,u,n,t+1,u,n,t+1,u,n+1,t,u,n+1),i.uv.push(g[0],g[1],g[6],g[7],g[4],g[5],g[2],g[3])):(i.pos.push(t,u,n,t,u,n+1,t+1,u,n+1,t+1,u,n),i.uv.push(...g));for(let p=0;p<4;p++)i.col.push(.95,r,0,_?5:4);i.idx.push(m,m+1,m+2,m,m+2,m+3),i.n++}}function xM(i){const t=wo(i),e=Fr[i],n=new so;for(let s=0;s<6;s++){const r=eh[s],[a,o,l,c]=Po(t?i-pi:e[r.k],t);for(let u=0;u<4;u++){const f=r.c[u];n.pos.push(f.p[0]-.5,f.p[1]-.5,f.p[2]-.5),n.uv.push(a+f.i*l,o+f.j*c),n.col.push(1,1,Qc[i],s)}const h=n.n*4;n.idx.push(h,h+1,h+2,h,h+2,h+3),n.n++}return n.finish()}const Ee=64,Bs=8,Fu=16,Ar=128,El=4,Bu=16;function On(i,t,e){let n=Math.imul(i|0,668265261)^Math.imul(t|0,374761393)^Math.imul(e|0,2654435761);return n=Math.imul(n^n>>>15,2246822507),n=Math.imul(n^n>>>13,3266489909),n^=n>>>16,(n>>>0)/4294967296}function Le(i,t,e,n,s){const r=Math.floor(i),a=Math.floor(t),o=i-r,l=t-a,c=o*o*(3-2*o),h=l*l*(3-2*l),u=(r%e+e)%e,f=(u+1)%e,d=(a%n+n)%n,g=(d+1)%n,_=On(u,d,s),m=On(f,d,s),p=On(u,g,s),x=On(f,g,s);return _+(m-_)*c+(p-_)*h+(_-m-p+x)*c*h}function bt(i,t,e,n,s){let r=0,a=.5,o=0,l=e;for(let c=0;c<n;c++)r+=a*Le(i*l,t*l,l,l,s+c*17),o+=a,a*=.5,l*=2;return r/o}const Et=(i,t,e)=>[i[0]+(t[0]-i[0])*e,i[1]+(t[1]-i[1])*e,i[2]+(t[2]-i[2])*e],at=(i,t)=>[i[0]+t,i[1]+t,i[2]+t],Rt=(i,t,e,n)=>(On(i,t,e)-.5)*n,bl=(i,t,e,n)=>{const s=bt(i,t,6,3,2),r=Le(i*32,t*32,32,32,5);return[...at(Et([58,122,38],[120,186,72],s*.65+r*.45),Rt(e,n,8,10)),255]},Xa=(i,t,e,n)=>{const s=bt(i,t,4,4,1),r=bt(i,t,12,2,9);let a=Et([108,76,50],[150,108,76],s);return r>.66?a=at(a,-26):r<.28&&(a=at(a,12)),[...at(a,Rt(e,n,3,10)),255]},Lc=[bl,(i,t,e,n)=>{const s=.17+.11*Le(i*8,.5,8,1,4)+.05*Le(i*24,.5,24,1,6);if(t<s){const o=bl(i,t,e,n);return t>s-.035&&(o[0]*=.8,o[1]*=.85,o[2]*=.8),o}const r=Xa(i,t,e,n),a=Math.max(0,1-(t-s)*7)*.28;return[r[0]*(1-a),r[1]*(1-a),r[2]*(1-a),255]},Xa,(i,t,e,n)=>{const s=bt(i,t,4,4,3),r=Math.abs(bt(i,t,3,3,7)-.5);let a=Et([92,94,100],[142,144,150],s);return r<.022?a=at(a,-34):bt(i,t,10,2,13)>.7&&(a=at(a,14)),[...at(a,Rt(e,n,4,9)),255]},(i,t,e,n)=>{const s=bt(i,t,5,3,21),r=Math.sin((t+s*.35)*Math.PI*8)*5;return[...at(Et([212,194,136],[232,218,160],s),r+Rt(e,n,5,10)),255]},(i,t,e,n)=>{const s=Le(i*10,t*3,10,3,31)*.6+Le(i*20,t*6,20,6,32)*.4;let r=Et([82,58,33],[132,98,58],s);return s<.3&&(r=at(r,-16)),[...at(r,Rt(e,n,6,8)),255]},(i,t,e,n)=>{const s=i-.5,r=t-.5,a=Math.max(Math.abs(s),Math.abs(r)),o=bt(i,t,6,2,41);if(a>.43)return[...at(Et([80,56,32],[118,86,50],o),Rt(e,n,7,8)),255];const l=Math.hypot(s,r)*15+bt(i,t,3,2,42)*2.2,c=.5+.5*Math.sin(l*Math.PI*2);return[...at(Et([186,148,94],[148,108,62],c),Rt(e,n,9,7)),255]},(i,t,e,n)=>{const s=bt(i,t,8,3,11),r=bt(i,t,9,2,12);let a=Et([30,92,30],[92,168,58],s);return r>.64?[a[0],a[1],a[2],0]:(Le(i*16,t*16,16,16,14)>.78&&(a=at(a,18)),[...at(a,Rt(e,n,10,10)),255])},(i,t,e,n)=>{const s=Math.floor(t*4),r=t*4%1,a=Le(i*6,t*40,6,40,51+s)*.7+.3*Le(i*24,t*4+s,24,4,55);let o=Et([150,110,60],[200,156,96],a);(r<.045||r>.97)&&(o=at(o,-46));const l=s%2?.25:.75;return Math.abs(i-l)<.012&&(o=at(o,-40)),[...at(o,Rt(e,n,11,6)),255]},(i,t,e,n)=>{if(Math.min(e,n,Ee-1-e,Ee-1-n)<3)return[228,245,252,238];const r=(i+t)%.5;return r>.1&&r<.17&&i+t<1?[255,255,255,140]:[186,226,240,55]},(i,t,e,n)=>{const s=i*2%1,r=t*2%1;if(Math.min(s,1-s,r,1-r)<.055)return[150,98,38,255];const o=Math.max(0,1-Math.hypot(s-.5,r-.5)*1.5),l=bt(i,t,6,2,61);return[...Et([255,196,96],[255,246,190],o*.9+l*.1),255]},(i,t,e,n)=>{const s=bt(i,t,4,3,15),a=bt(i+s*.2,t,8,2,16)>.62?26:0;return[...at(Et([34,92,190],[62,134,220],s),a),172]},(i,t,e,n)=>{const s=Math.hypot(i-.5,t-.5),r=Math.min(e,n,Ee-1-e,Ee-1-n);let a=Et([255,120,170],[255,70,130],Math.min(1,s*1.6));return Math.sin(s*Math.PI*14)>.7&&(a=at(a,22)),r<4&&(a=Et(a,[150,30,80],.6)),[...a,255]},(i,t,e,n)=>{if(t<.17||t>.83){const r=Math.min(t,1-t);return[...Et([255,80,140],[190,40,100],r<.04?.6:0),255]}const s=Math.sin((t*7+Math.abs(i-.5)*.8)*Math.PI*2);return s>-.1?[...at([176,182,194],s*24),255]:[52,54,64,255]},(i,t)=>{const e=(t+Math.abs(i-.5))*3%1;return Math.min(i,t,1-i,1-t)<.04?[30,30,36,255]:e<.5?[255,214,40,255]:[38,38,46,255]},(i,t)=>t>.35&&t<.65?[255,214,40,255]:[40,40,50,255],(i,t,e,n)=>{const s=Math.abs(i*2%1-.5),r=t*2%1,a=s<.07&&r>.4&&r<.88,o=r>.12&&r<.44&&s<(r-.12)*.75,l=Et([40,170,215],[96,220,245],bt(i,t,4,2,71));return a||o?[255,255,255,255]:[...at(l,Rt(e,n,12,8)),255]},(i,t,e,n)=>[...Math.sin((t*5-i*.6)*Math.PI*2+Math.sin(i*9)*1.2)>.82?[235,250,255]:Et([40,160,205],[80,205,235],t),255],(i,t,e,n)=>{const s=Math.min(i,t,1-i,1-t),r=Math.hypot(i-.5,t-.5);return s<.05?[28,30,38,255]:r<.34?e%6<3&&n%6<3?[18,20,26,255]:[96,102,116,255]:t<.14&&i>.7&&i<.84?[255,150,40,255]:[...at([58,62,74],Rt(e,n,13,8)),255]},(i,t,e,n)=>Math.min(i,t,1-i,1-t)<.05?[28,30,38,255]:Math.hypot(i-.3,t-.5)<.16?[255,150,40,255]:t>.42&&t<.58&&i>.55&&i<.9?[0,229,255,255]:[...at([58,62,74],Rt(e,n,14,8)),255],(i,t,e,n)=>{const s=.5+.5*Math.sin((i+t)*Math.PI*6+bt(i,t,4,2,81)*5),a=Math.min(i,t,1-i,1-t)<.04?.45:.7+.3*s;return[a*255,a*255,a*255,255]},...[[255,40,70],[40,140,255],[50,255,120],[190,70,255]].map(i=>(t,e)=>{const n=t*2%1,s=e*2%1;if(Math.min(n,1-n,s,1-s)<.06)return[i[0]*.3,i[1]*.3,i[2]*.3,255];const a=Math.max(0,1-Math.hypot(n-.5,s-.5)*1.3);return[...Et(i,[255,255,255],a*a*.65),255]}),(i,t,e,n)=>{const s=Math.floor(t*8),r=t*8%1,a=s%2?.125:0,o=(i*4+a*4)%1;if(r<.1||o<.05)return[...at([176,170,160],Rt(e,n,15,10)),255];const l=bt(i,t,8,2,91+s);return[...at(Et([150,62,46],[186,92,66],l),Rt(e,n,16,12)),255]},(i,t,e,n)=>{const s=bt(i,t,3,4,95),r=Math.abs(bt(i+s*.3,t,3,3,96)-.5);let a=Et([236,236,242],[214,216,226],s);return r<.03?a=at(a,-52):r<.05&&(a=at(a,-22)),[...at(a,Rt(e,n,17,5)),255]},(i,t,e,n)=>[...at(Et([226,234,244],[250,252,255],bt(i,t,5,3,101)),Rt(e,n,18,6)),255],(i,t,e,n)=>{const s=.2+.1*Le(i*8,.5,8,1,102);if(t<s)return[...at([240,246,252],Rt(e,n,19,6)),255];const r=Xa(i,t,e,n),a=Math.max(0,1-(t-s)*7)*.2;return[r[0]*(1-a),r[1]*(1-a),r[2]*(1-a),255]},(i,t,e,n)=>{const s=bt(i,t,4,3,103),r=Math.abs(bt(i,t,3,2,104)-.5)<.018;return[...at(Et([150,196,236],[196,226,250],s),r?30:Rt(e,n,20,5)),255]},(i,t,e,n)=>{const s=Le(i*10,t*10,10,10,105),r=bt(i,t,16,2,106),a=s>.6?[150,144,138]:s<.3?[96,92,90]:[124,120,116];return[...at(a,(r-.5)*40+Rt(e,n,21,10)),255]},(i,t,e,n)=>{const s=Math.sin((t+bt(i,t,3,2,107)*.2)*Math.PI*6)*6;return[...at(Et([142,152,168],[168,176,190],bt(i,t,4,3,108)),s+Rt(e,n,22,6)),255]},(i,t,e,n)=>{const s=Le(i*12,t*2,12,2,109)*.6+Le(i*24,t*5,24,5,110)*.4;let r=Et([52,36,22],[92,64,40],s);return s<.32&&(r=at(r,-12)),[...at(r,Rt(e,n,23,8)),255]},(i,t,e,n)=>{const s=i-.5,r=t-.5;if(Math.max(Math.abs(s),Math.abs(r))>.43)return[...at([66,46,28],Rt(e,n,24,8)),255];const o=.5+.5*Math.sin((Math.hypot(s,r)*18+bt(i,t,3,2,111)*2)*Math.PI*2);return[...at(Et([170,128,80],[130,92,56],o),Rt(e,n,25,7)),255]},(i,t,e,n)=>{const s=bt(i,t,10,3,112),r=bt(i,t,11,2,113),a=Et([22,58,34],[52,104,60],s);return r>.66?[a[0],a[1],a[2],0]:[...at(a,Rt(e,n,26,12)),255]},(i,t,e,n)=>{const s=Math.abs(i*4%1-.5)<.08;let r=Et([44,120,44],[70,150,58],bt(i,t,4,2,114));return s&&(r=at(r,-24)),On(e>>2,n>>2,115)>.93&&(r=[230,226,190]),[...at(r,Rt(e,n,27,6)),255]},(i,t,e,n)=>{const s=Math.hypot(i-.5,t-.5);return[...at(Et([92,168,70],[50,124,44],Math.min(1,s*2)),Rt(e,n,28,6)),255]},...[[[34,34,38],[58,58,64]],[[196,108,52],[236,150,84]],[[196,160,128],[232,204,176]]].map((i,t)=>(e,n,s,r)=>{const a=bt(e,n,4,4,3);let o=Et([92,94,100],[142,144,150],a);return Le(e*6,n*6,6,6,116+t)>.68&&(o=Et(i[0],i[1],Le(e*24,n*24,24,24,119+t))),[...at(o,Rt(s,r,29+t,9)),255]}),(i,t,e,n)=>{const s=Math.abs((i+t)*3%1-.5),r=Math.abs((i-t+1)*3%1-.5),a=Math.min(s,r),o=Et([40,170,230],[170,250,255],1-a*2);return[...at(o,bt(i,t,6,2,120)*30-15),255]},(i,t,e,n)=>{const s=bt(i,t,5,3,121),r=bt(i,t,9,2,122)>.64;return[...at(Et([60,50,38],[92,76,58],s),r?18:Rt(e,n,32,8)),255]},(i,t,e,n)=>{const s=bl(i,t,e,n);if(On(e>>2,n>>2,123)>.88&&(e&3)>0&&(n&3)>0){const a=Math.floor(On(e>>2,n>>2,124)*4);return[...[[250,230,70],[240,80,110],[250,250,250],[150,110,240]][a],255]}return s},(i,t,e,n)=>{const s=Math.floor(i*4),r=Math.abs(i*4%1-.5)>.45;let a=Et([38,38,44],[66,64,72],bt(i,t+s*.3,4,3,125));return r&&(a=at(a,-14)),[...at(a,Rt(e,n,33,8)),255]},(i,t,e,n)=>{const s=bt(i,t,4,3,126);return Math.abs(bt(i,t,5,2,127)-.5)<.06?[60,30,26,255]:[...Et([230,70,20],[255,200,60],s),255]},(i,t,e,n)=>Le(i*5,t*5,5,5,128)>.72?[...at([240,236,226],Rt(e,n,34,6)),255]:[...at(Et([170,34,38],[214,60,56],bt(i,t,4,2,129)),Rt(e,n,35,8)),255],(i,t,e,n)=>[...at(Et([98,82,108],[140,120,150],bt(i,t,6,3,130)),Rt(e,n,36,12)),255],(i,t,e,n)=>{const s=.16+.08*Le(i*8,.5,8,1,131);return t<s?[...at([120,100,130],Rt(e,n,37,10)),255]:Xa(i,t,e,n)},(i,t,e,n)=>{const s=Math.floor(t*4),r=t*4%1;let a=Et([206,182,124],[226,204,150],bt(i,t,5,2,132+s));return r<.06&&(a=at(a,-22)),[...at(a,Rt(e,n,38,6)),255]},(i,t,e,n)=>[...at(Et([214,206,188],[240,234,222],Le(i*8,t*2,8,2,133)),Rt(e,n,39,6)),255],(i,t,e,n)=>{const s=bt(i,t,7,3,134),r=bt(i,t,8,2,135),a=Et([24,100,22],[70,170,40],s);return r>.68?[a[0],a[1],a[2],0]:[...at(a,Rt(e,n,40,10)),255]},(i,t,e,n)=>{const s=Math.floor(t*4),r=t*4%1;let a=Et([150,112,66],[182,140,88],bt(i*.5,t,6,2,140+s));return r<.05&&(a=at(a,-40)),(Math.abs(i-.5)<.03||Math.abs(t-.5)<.03)&&(a=[84,58,34]),Math.min(i,t,1-i,1-t)<.08&&(a=[104,76,44]),[...at(a,Rt(e,n,41,8)),255]},(i,t,e,n)=>{let s=Et([150,112,66],[182,140,88],bt(i,t*.5,6,2,142));return t*4%1<.05&&(s=at(s,-36)),t<.14&&(s=[110,80,46]),i>.18&&i<.44&&t>.32&&t<.5&&(s=[186,190,198]),i>.4&&i<.48&&t>.3&&t<.52&&(s=[90,60,34]),i>.6&&i<.66&&t>.3&&t<.78&&(s=[96,66,38]),i>.54&&i<.74&&t>.26&&t<.36&&(s=[120,124,132]),[...at(s,Rt(e,n,42,8)),255]},(i,t,e,n)=>{const s=Math.floor(t*4),r=s&1?.25:0,a=(i*2+r)%1,o=t*4%1;let l=Et([96,96,102],[132,132,138],bt(i,t,5,3,144));if((a<.05||o<.07)&&(l=at(l,-38)),i>.26&&i<.74&&t>.52&&t<.86){const c=1-Math.abs(i-.5)*3;l=t>.68?Et([200,70,20],[255,190,60],c*Le(i*8,t*8,8,8,145)):[26,22,22]}return[...at(l,Rt(e,n,43,8)),255]},(i,t,e,n)=>{let s=Et([100,100,106],[136,136,142],bt(i,t,5,3,146));return Math.abs(i-.5)<.16&&Math.abs(t-.5)<.16&&(s=[30,26,26]),[...at(s,Rt(e,n,44,8)),255]},(i,t,e,n)=>{const s=bt(i,t,8,3,147),r=Le(i*16,t*16,16,16,148);return[...at(Et([214,210,202],[246,244,238],s*.5+r*.5),Rt(e,n,45,6)),255]},(i,t,e,n)=>{const s=t*5%1,r=s<.32;let a=Et([74,50,30],[104,72,46],bt(i,t,6,3,150));return r&&(a=at(a,-22)),[...at(a,Rt(e,n,46,10)),255]},...[0,1,2,3].map(i=>(t,e,n,s)=>{const r=[.3,.52,.76,.92][i],a=[[70,170,50],[90,176,54],[150,176,60],[214,184,76]][i],o=Math.floor(t*8),l=t*8%1,c=r*(.8+.2*On(o,i,151));return 1-e>c||l<.3||l>.7?i===3&&1-e>c-.22&&1-e<c+.04&&l>.15&&l<.85&&On(n>>1,s>>1,152)>.3?[228,196,90,255]:[0,0,0,0]:[...at(a,Rt(n,s,47+i,16)-(1-e)*20),255]}),(i,t,e,n)=>{const s=bt(i,t,6,3,160),r=Le(i*16,t*16,16,16,161);let a=Et([128,110,84],[160,142,112],s);return r>.72?a=at(a,22):r<.22&&(a=at(a,-18)),[...at(a,Rt(e,n,50,10)),255]},(i,t,e,n)=>{const s=(h,u)=>On(Math.floor(h),Math.floor(u),162),r=i*4+(Math.floor(t*4)&1)*.5,a=t*4,o=r%1,l=a%1;let c=Et([96,96,100],[150,150,156],s(r,a)*.6+bt(i,t,5,2,163)*.4);return(o<.08||l<.1)&&(c=[64,64,68]),[...at(c,Rt(e,n,51,8)),255]},...[0,1].map(i=>(t,e,n,s)=>{let r=Et([110,110,116],[140,140,146],bt(t,e,5,2,164));Math.abs(t-.5)<.2&&Math.abs(e-.5)<.3&&(r=[70,70,76]);const a=.5+(i?.12:-.12)*(.5-e)*2;return Math.abs(t-a)<.05&&e>.25&&e<.6&&(r=[138,98,54]),Math.abs(t-(i?.62:.38))<.08&&e>.2&&e<.3&&(r=i?[80,240,120]:[200,60,60]),[...at(r,Rt(n,s,52,6)),255]}),(i,t,e,n)=>{let s=Et([84,84,92],[112,112,120],bt(i,t,5,2,165));return(Math.abs(i-.5)<.07||Math.abs(t-.5)<.07)&&(s=[214,128,60]),Math.abs(i-.5)<.12&&Math.abs(t-.5)<.12&&(s=[240,160,80]),[...at(s,Rt(e,n,53,6)),255]},(i,t,e,n)=>{let s=Et([60,64,76],[86,90,104],bt(i,t,5,2,166));const r=Math.hypot(i-.5,t-.5);return r<.18?s=Et([60,200,240],[180,250,255],1-r/.18):r<.24&&(s=[200,120,60]),[...at(s,Rt(e,n,54,6)),255]},(i,t,e,n)=>{let s=Et([56,60,72],[80,84,98],bt(i,t,5,2,167));const r=Math.hypot(i-.5,t-.15);return t>.15&&Math.abs(r*5%1-.5)<.09&&r<.75&&(s=[106,232,255]),t>.82&&(s=[200,120,60]),[...at(s,Rt(e,n,55,6)),255]},(i,t,e,n)=>{let s=Et([70,74,86],[98,102,116],bt(i,t,5,2,168));return(i*6%1<.12||t*6%1<.12)&&(s=[180,110,56]),Math.hypot(i-.5,t-.5)<.12&&(s=[106,232,255]),[...at(s,Rt(e,n,56,6)),255]},...[0,1].map(i=>(t,e,n,s)=>{let r=Et([48,52,62],[70,74,86],bt(t,e,5,2,169));const a=Math.hypot(t-.5,e-.58);return a<.26&&a*14%1<.5&&(r=[30,32,40]),e<.2&&Math.abs(t-.5)<.3&&(r=i?[90,255,140]:[90,40,40]),[...at(r,Rt(n,s,57,6)),255]}),...[0,1].map(i=>(t,e,n,s)=>{if(Math.min(t,e,1-t,1-e)<.1)return[...at([150,96,52],Rt(n,s,58,8)),255];const a=bt(t,e,4,2,170);return[...at(i?Et([255,200,90],[255,240,170],a):Et([86,70,50],[110,92,66],a),Rt(n,s,59,6)),255]}),(i,t,e,n)=>{let s=Et([150,152,160],[188,190,198],bt(i,t,4,2,171));return(t*2%1<.05||i<.05||i>.95)&&(s=[96,98,106]),Math.hypot(i*4%1-.5,t*2%1-.2)<.09&&(s=[110,112,120]),[...at(s,Rt(e,n,60,6)),255]},(i,t,e,n)=>Math.min(i,t,1-i,1-t)>.1?[0,0,0,0]:[...at([120,122,130],Rt(e,n,61,8)),255],(i,t,e,n)=>Math.abs(i-.22)<.055||Math.abs(i-.78)<.055?[...at(Et([150,150,158],[200,200,208],1-Math.abs(i-(i<.5?.22:.78))/.055),Rt(e,n,62,6)),255]:t*4%1<.42&&i>.08&&i<.92?[...at(Et([104,72,42],[132,94,56],bt(i,t,6,2,172)),Rt(e,n,63,8)),255]:[0,0,0,0]];Lc.length;const MM=new Set([0,1,2,3,4,5,6,8,14,15,18,19,25,26,27,28,29,30,31,32,33,35,37,38,39,41,42,43,45,46,47,48,49,52,53,54,55,61,63,64,65,66,67,68,69,70,73]);function yM(){const i=document.createElement("canvas");i.width=Ee*Bs,i.height=Ee*Fu;const t=i.getContext("2d"),e=t.createImageData(Ee,Ee),n=e.data,s=Ee*Bs,r=Ee*Fu,a=new Uint8Array(s*r*4);for(let o=0;o<Lc.length;o++){for(let l=0;l<Ee;l++)for(let c=0;c<Ee;c++){const h=Lc[o]((c+.5)/Ee,(l+.5)/Ee,c,l),u=(l*Ee+c)*4;let f=0;if(MM.has(o)){const g=Math.min(c,l,Ee-1-c,Ee-1-l);g<3&&(f=(c<Ee/2&&c<=l||l<Ee/2&&l<c?16:-20)*(1-g/3))}n[u]=Math.max(0,Math.min(255,h[0]+f)),n[u+1]=Math.max(0,Math.min(255,h[1]+f)),n[u+2]=Math.max(0,Math.min(255,h[2]+f)),n[u+3]=Math.max(0,Math.min(255,h[3]));const d=((r-1-(Math.floor(o/Bs)*Ee+l))*s+o%Bs*Ee+c)*4;a[d]=n[u],a[d+1]=n[u+1],a[d+2]=n[u+2],a[d+3]=n[u+3]}t.putImageData(e,o%Bs*Ee,Math.floor(o/Bs)*Ee)}return i.raw=a,i}function SM(i,t){const e=document.createElement("canvas");e.width=e.height=Ar*El;const n=e.getContext("2d");n.fillStyle="#0e1224",n.fillRect(0,0,e.width,e.height);let s=Bu;for(let r=0;r<Bu;r++){const a=new Image,o=String(r+1).padStart(2,"0"),l=()=>{--s===0&&t&&t()};a.onload=()=>{n.drawImage(a,r%El*Ar,Math.floor(r/El)*Ar,Ar,Ar),i&&i(),l()},a.onerror=l,a.src=`logos/${o}.png`}return e}function EM(){const t=document.createElement("canvas");t.width=t.height=128;const e=t.getContext("2d"),n=e.createImageData(128,128);for(let s=0;s<128;s++)for(let r=0;r<128;r++){const a=bt((r+.5)/128,(s+.5)/128,4,4,77),o=Math.max(0,Math.min(1,(a-.5)/.18)),l=(s*128+r)*4;n.data[l]=n.data[l+1]=n.data[l+2]=255,n.data[l+3]=o*o*(3-2*o)*255}return e.putImageData(n,0,0),t}const kr=32,Ni=8;function bM(i){const t=document.createElement("canvas");t.width=kr*Ni,t.height=kr*Math.max(1,Math.ceil(i.length/Ni));const e=t.getContext("2d");return i.forEach((n,s)=>{const r=s%Ni*kr,a=Math.floor(s/Ni)*kr,o=(d,g,_,m=1,p=1)=>{e.fillStyle=_,e.fillRect(r+d*2,a+g*2,m*2,p*2)},l=(d=2)=>{for(let g=d;g<14;g++)o(g,15-g,"#5a3a1e"),o(g,14-g,"#8a6034")},c=(d,g)=>{const _=parseInt(d.slice(1),16),m=p=>Math.max(0,Math.min(255,Math.round(p*g)));return`rgb(${m(_>>16)},${m(_>>8&255)},${m(_&255)})`},h=n.col||"#ccc",u=c(h,.62),f=c(h,1.18);switch(n.draw){case"stick":l(1);break;case"ingot":for(let d=0;d<5;d++)o(3+d,6+d,d?h:f,10-d,1);o(3,11,u,10,1),o(12,6,u,1,5);break;case"apple":o(5,5,"#c82a2a",7,8),o(4,6,"#c82a2a",9,6),o(6,6,"#f06a5a",2,2),o(5,12,"#8a1a1a",7,1),o(8,2,"#5a3a1e",1,3),o(9,2,"#3c8a2a",3,2);break;case"meat":o(3,5,h,9,7),o(2,6,h,11,5),o(4,6,f,3,2),o(3,11,u,9,1),o(12,9,"#efe6d2",2,2),o(13,8,"#efe6d2",2,1),o(13,11,"#efe6d2",2,1);break;case"spitzhacke":l(3);for(let d=0;d<10;d++){const g=3+d,_=2+Math.round(Math.abs(d-4.5)*.55);o(g,_,h),o(g,_+1,u)}o(3,4,f),o(12,4,f);break;case"axt":l(3),o(8,2,h,4,5),o(7,3,h,1,4),o(12,3,u,1,3),o(8,2,f,4,1),o(8,6,u,4,1);break;case"schaufel":l(5),o(10,2,h,4,4),o(9,3,h,1,3),o(14,3,u,1,3),o(10,2,f,4,1),o(11,6,u,2,1);break;case"hacke":l(3),o(9,2,h,5,2),o(12,4,h,2,2),o(9,2,f,5,1),o(13,4,u,1,2);break;case"schwert":for(let d=0;d<9;d++)o(5+d,10-d,h),o(6+d,10-d,f),o(5+d,11-d,u);o(3,10,"#5a3a1e",4,1),o(5,8,"#5a3a1e",1,5),o(2,13,"#8a6034",2,2),o(4,11,"#8a6034",1,2);break;case"seeds":[[4,6],[8,4],[10,8],[6,10],[11,11],[5,13],[9,12]].forEach(([d,g])=>{o(d,g,"#c8b060",2,1),o(d,g+1,"#8a7a3a",2,1)});break;case"wheat":for(let d=0;d<3;d++){const g=5+d*3;o(g,7,"#6a8a2a",1,8),o(g-1,2,"#e0c060",3,5),o(g,1,"#f0d880",1,2)}o(4,11,"#8a6a2a",9,1);break;case"bread":o(2,6,"#c8843c",12,6),o(3,5,"#d89848",10,1),o(2,12,"#8a5420",12,1);for(let d=0;d<3;d++)o(4+d*3,7,"#f0c070",2,1);break;case"helm":o(4,4,h,8,3),o(3,6,h,10,4),o(3,10,u,3,2),o(10,10,u,3,2),o(5,4,f,5,1),o(6,8,"#1a1a22",4,1);break;case"harnisch":o(3,3,h,3,3),o(10,3,h,3,3),o(4,5,h,8,8),o(5,5,f,2,6),o(4,12,u,8,1),o(7,3,u,2,3);break;case"boot":o(1,8,h,14,3),o(2,11,u,12,2),o(3,13,u,10,1),o(1,7,f,14,1),o(4,9,"#5a3a1e",8,1),o(7,2,"#5a3a1e",1,6),o(8,3,"#efe6d2",4,3);break;case"lore":o(2,5,h,12,6),o(2,5,f,12,1),o(3,6,u,10,1),o(2,10,u,12,1),o(3,11,"#2a2a30",3,3),o(10,11,"#2a2a30",3,3),o(4,12,"#6a6a72",1,1),o(11,12,"#6a6a72",1,1);break;default:o(4,4,h,8,8)}}),t}const Hu=64,go={boot:{item:tt.BOAT,half:.6,h:.55,seat:.25,max:7,name:"Boot"},lore:{item:tt.MINECART,half:.45,h:.75,seat:.3,max:10,name:"Lore"}},ei=[[1,0],[0,1],[-1,0],[0,-1]],TM=(i,t)=>Math.atan2(-i,-t),Gu=.001;class Vu{constructor(t,e,n,s,r=0){this.kind=t,this.K=go[t],this.x=e,this.y=n,this.z=s,this.yaw=r,this.speed=0,this.vy=0,this.rider=!1,this.t=0,this.rail=null}}class AM{constructor(t,e){if(this.world=t,this.list=[],this.onAdd=()=>{},this.onRemove=()=>{},Array.isArray(e))for(const n of e)!Array.isArray(n)||!go[n[0]]||!n.slice(1,5).every(Number.isFinite)||this.list.length>=Hu||this.list.push(new Vu(n[0],n[1],n[2],n[3],n[4]))}attach(){for(const t of this.list)this.onAdd(t)}add(t,e,n,s,r=0){if(!go[t]||this.list.length>=Hu)return null;const a=new Vu(t,e,n,s,r);return t==="lore"&&!this.snapRail(a,r)?null:(this.list.push(a),this.onAdd(a),a)}remove(t){const e=this.list.indexOf(t);e<0||(this.list.splice(e,1),this.onRemove(t))}clear(){for(const t of this.list.slice())this.remove(t)}serialize(){return this.list.map(t=>[t.kind,+t.x.toFixed(2),+t.y.toFixed(2),+t.z.toFixed(2),+t.yaw.toFixed(2)])}raycast(t,e,n,s,r,a,o){let l=null;for(const c of this.list){const h=c.K.half,u=[c.x-h,c.y,c.z-h],f=[c.x+h,c.y+c.K.h,c.z+h],d=[t,e,n],g=[s,r,a];let _=0,m=o;for(let p=0;p<3&&_<=m;p++){if(Math.abs(g[p])<1e-9){(d[p]<u[p]||d[p]>f[p])&&(_=1/0);continue}let x=(u[p]-d[p])/g[p],y=(f[p]-d[p])/g[p];x>y&&([x,y]=[y,x]),_=Math.max(_,x),m=Math.min(m,y)}_<=m&&(!l||_<l.t)&&(l={veh:c,t:_})}return l}update(t,e,n){for(const s of this.list){const r=this.world;if(r.isLoaded&&!r.isLoaded(Math.floor(s.x),Math.floor(s.z)))continue;const a=Math.max(1,Math.ceil(t*60-1e-9)),o=t/a,l=s===e?n:null;for(let c=0;c<a;c++)s.kind==="boot"?this.stepBoat(s,o,l):this.stepCart(s,o,l);s.t+=t*Math.abs(s.speed)}}waterTop(t,e,n){const s=this.world,r=Math.floor(t),a=Math.floor(n);let o=Math.floor(e+.3);if(s.getBlock(r,o,a)!==v.WATER&&(o--,s.getBlock(r,o,a)!==v.WATER))return null;for(let l=0;l<4&&s.getBlock(r,o+1,a)===v.WATER;l++)o++;return o+1-.12}boxHits(t,e,n,s){const r=this.world,a=t.K.half;for(let o=Math.floor(n);o<=Math.floor(n+t.K.h-1e-7);o++)for(let l=Math.floor(s-a);l<=Math.floor(s+a-1e-7);l++)for(let c=Math.floor(e-a);c<=Math.floor(e+a-1e-7);c++)if(r.isSolid(c,o,l))return!0;return!1}stepBoat(t,e,n){const s=this.waterTop(t.x,t.y,t.z),r=s!==null;n&&(t.yaw-=n.r*1.9*e*(r?1:.3),t.speed+=n.f*(r?5:1.2)*e);const a=r?t.K.max:1.2;t.speed=Math.max(-a*.5,Math.min(a,t.speed)),t.speed-=t.speed*Math.min(1,(r?.6:4)*e),Math.abs(t.speed)<.01&&(t.speed=0),r?(t.vy+=(s-.3-t.y)*30*e,t.vy-=t.vy*Math.min(1,6*e)):t.vy=Math.max(-30,t.vy-25*e);const o=-Math.sin(t.yaw)*t.speed*e,l=-Math.cos(t.yaw)*t.speed*e;this.boxHits(t,t.x+o,t.y,t.z)?t.speed*=.2:t.x+=o,this.boxHits(t,t.x,t.y,t.z+l)?t.speed*=.2:t.z+=l;const c=t.y+t.vy*e;this.boxHits(t,t.x,c,t.z)?(t.vy<0&&(t.y=Math.floor(c)+1+Gu),t.vy=0):t.y=c}isRail(t,e,n){return this.world.getBlock(t,e,n)===v.RAIL}nextRail(t,e,n,s){const[r,a]=ei[s];for(const o of[0,1,-1])if(this.isRail(t+r,e+o,n+a))return[t+r,e+o,n+a];return null}snapRail(t,e){const n=Math.floor(t.x),s=Math.floor(t.z);let r=Math.floor(t.y+.5);if(!this.isRail(n,r,s)&&(r--,!this.isRail(n,r,s)))return!1;const a=-Math.sin(e),o=-Math.cos(e),l=[0,1,2,3].sort((h,u)=>ei[u][0]*a+ei[u][1]*o-(ei[h][0]*a+ei[h][1]*o)),c=l.find(h=>this.nextRail(n,r,s,h))??l[0];return t.rail={x:n,y:r,z:s,d:c,p:0},t.speed=0,t.vy=0,this.placeOnRail(t),!0}placeOnRail(t){const e=t.rail,[n,s]=ei[e.d],r=this.nextRail(e.x,e.y,e.z,e.d),a=r?r[1]:e.y;t.x=e.x+.5+n*e.p,t.z=e.z+.5+s*e.p,t.y=e.y+.0625+(a-e.y)*e.p,t.yaw=TM(n,s)}stepCart(t,e,n){const s=t.rail;if(!s||!this.isRail(s.x,s.y,s.z)){t.rail=null,t.speed=0,t.vy=Math.max(-30,t.vy-25*e);const o=t.y+t.vy*e;this.boxHits(t,t.x,o,t.z)?(t.vy<0&&(t.y=Math.floor(o)+1+Gu),t.vy=0):t.y=o,t.vy===0&&this.snapRail(t,t.yaw);return}if(n){const o=n.look||ei[s.d];if(n.f>.2&&t.speed<.3&&o[0]*ei[s.d][0]+o[1]*ei[s.d][1]<-.2){const l=this.nextRail(s.x,s.y,s.z,s.d);s.d=(s.d+2)%4,l&&s.p>0&&(s.x=l[0],s.y=l[1],s.z=l[2],s.p=1-s.p)}t.speed+=(n.f>0?n.f*4:n.f*8)*e}const r=this.nextRail(s.x,s.y,s.z,s.d);r&&(t.speed-=(r[1]-s.y)*7*e),t.speed-=t.speed*Math.min(1,.25*e),t.speed=Math.max(0,Math.min(t.K.max,t.speed)),t.speed<.02&&(t.speed=0);let a=t.speed*e;for(let o=0;a>0&&o<4;o++){const l=this.nextRail(s.x,s.y,s.z,s.d);if(!l){s.p=0,t.speed=0;break}const c=1-s.p;if(a<c){s.p+=a,a=0;break}if(a-=c,s.x=l[0],s.y=l[1],s.z=l[2],s.p=0,!this.nextRail(s.x,s.y,s.z,s.d)){const h=[1,3].map(u=>(s.d+u)%4).find(u=>this.nextRail(s.x,s.y,s.z,u));h!==void 0&&(s.d=h,t.speed*=.85)}}this.placeOnRail(t)}exitSpot(t,e){const n=[[0,t.K.h+.05,0],[1.2,.1,0],[-1.2,.1,0],[0,.1,1.2],[0,.1,-1.2],[1.2,1.1,0],[-1.2,1.1,0],[0,1.1,1.2],[0,1.1,-1.2]];for(const[s,r,a]of n)if(!e(t.x+s,t.y+r,t.z+a))return[t.x+s,t.y+r,t.z+a];return[t.x,t.y+t.K.h+.05,t.z]}}const wM=[[[-.2,.25,-.25,.2,.6,.27,16052972],[-.13,.5,-.42,.13,.82,-.18,16052972],[-.06,.6,-.52,.06,.68,-.42,15769632],[-.03,.82,-.36,.03,.9,-.24,14168112],[-.13,0,-.04,-.07,.25,.02,15249456],[.07,0,-.04,.13,.25,.02,15249456]],[[-.4,.45,-.6,.4,1.08,.6,15526626],[-.2,.72,-.95,.2,1.12,-.56,13154464],[-.21,1,-.9,.21,1.16,-.6,15526626],[-.32,0,-.5,-.14,.46,-.32,4867136],[.14,0,-.5,.32,.46,-.32,4867136],[-.32,0,.32,-.14,.46,.5,4867136],[.14,0,.32,.32,.46,.5,4867136]],[[-.42,.55,-.7,.42,1.22,.7,6964264],[-.43,.75,-.2,.43,1.12,.25,15920870],[-.25,.85,-1.08,.25,1.36,-.7,5913122],[-.16,.86,-1.13,.16,1.02,-1.06,15118496],[-.32,1.3,-.95,-.24,1.46,-.88,15262416],[.24,1.3,-.95,.32,1.46,-.88,15262416],[-.36,0,-.62,-.16,.56,-.42,3811354],[.16,0,-.62,.36,.56,-.42,3811354],[-.36,0,.42,-.16,.56,.62,3811354],[.16,0,.42,.36,.56,.62,3811354]],[[-.28,.75,-.16,.28,1.35,.16,2761792],[-.22,1.35,-.22,.22,1.75,.22,3419218],[-.15,1.52,-.24,-.05,1.6,-.21,7008511],[.05,1.52,-.24,.15,1.6,-.21,7008511],[-.02,1.75,-.02,.02,1.98,.02,9076912],[-.05,1.96,-.05,.05,2.04,.05,16727180],[-.42,.8,-.08,-.28,1.32,.08,2761792],[.28,.8,-.08,.42,1.32,.08,2761792],[-.22,0,-.1,-.04,.75,.1,2235446],[.04,0,-.1,.22,.75,.1,2235446]],[[-.42,.25,-.3,.42,.72,.5,3816004],[-.28,.3,-.62,.28,.66,-.3,2763314],[-.2,.5,-.64,-.08,.6,-.61,16724016],[.08,.5,-.64,.2,.6,-.61,16724016],...[-.2,.1,.35].flatMap(i=>[[-.82,0,i-.05,-.42,.4,i+.05,2368556],[.42,0,i-.05,.82,.4,i+.05,2368556]])],[[-.35,.15,-.35,.35,.42,.35,5265512],[-.2,.42,-.2,.2,.56,.2,2764344],[-.1,.2,-.38,.1,.34,-.35,16719952],[-.03,.56,-.03,.03,.7,.03,9079446],...[[-1,-1],[1,-1],[1,1],[-1,1]].map(([i,t])=>[i*.55-.13,.44,t*.55-.13,i*.55+.13,.48,t*.55+.13,10133676])],[[-.2,0,-.1,-.02,.7,.1,4864554],[.02,0,-.1,.2,.7,.1,4864554],[-.25,.7,-.15,.25,1.35,.15,3828384],[-.2,.75,-.17,.2,1.2,-.15,9071168],[-.36,.8,-.08,-.25,1.3,.08,3828384],[.25,.8,-.08,.36,1.3,.08,3828384],[-.2,1.35,-.2,.2,1.73,.2,15253658],[-.22,1.68,-.22,.22,1.82,.22,6965802],[-.12,1.52,-.22,-.05,1.58,-.2,2105376],[.05,1.52,-.22,.12,1.58,-.2,2105376]]],RM=[.8,.8,1,.5,.68,.68];function Xs(i){const t=[],e=[],n=[],s=new oe;for(const[a,o,l,c,h,u,f]of i){const d=new Vi(c-a,h-o,u-l);d.translate((a+c)/2,(o+h)/2,(l+u)/2);const g=d.attributes.position.array,_=t.length/3;s.setHex(f);for(let m=0;m<g.length/3;m++){const p=RM[Math.floor(m/4)];t.push(g[m*3],g[m*3+1],g[m*3+2]),e.push(s.r*p,s.g*p,s.b*p)}for(const m of d.index.array)n.push(_+m);d.dispose()}const r=new Ue;return r.setAttribute("position",new en(t,3)),r.setAttribute("color",new en(e,3)),r.setIndex(n),r.computeBoundingSphere(),r}class CM{constructor(t){this.group=new Fn,t.add(this.group),this.geos=wM.map(Xs),this.meshes=new Map}add(t){const e=new Re(this.geos[t.type],new Fi({vertexColors:!0}));e.matrixAutoUpdate=!0,this.group.add(e),this.meshes.set(t,e)}remove(t){const e=this.meshes.get(t);e&&(this.group.remove(e),e.material.dispose(),this.meshes.delete(t))}update(t,e,n,s,r){for(const[a,o]of this.meshes){const l=Math.hypot(a.x-t,a.z-e);if(o.visible=l<s,!o.visible)continue;const c=a.moving?Math.abs(Math.sin(r*9+a.x))*.05:0,h=a.hostile?Math.max(n,.7)*(.85+.15*Math.sin(r*23+a.z)):n;o.position.set(a.x,a.y+c,a.z),o.rotation.y=a.yaw,a.hurtT>0?o.material.color.setRGB(h*1.3,h*.45,h*.45):o.material.color.setRGB(h,h,h)}}clear(){for(const t of[...this.meshes.keys()])this.remove(t)}}const LM=[[-.6,0,-.75,.6,.12,.75,6965802],[-.6,.12,-.75,-.48,.5,.75,11041350],[.48,.12,-.75,.6,.5,.75,11041350],[-.48,.12,.63,.48,.5,.75,11041350],[-.48,.12,-.95,.48,.45,-.75,10120766],[-.48,.28,-.1,.48,.34,.12,8016944]],PM=[[-.03,-.05,-.03,.03,.75,.03,5913118],[-.08,-.32,-.02,.08,-.05,.02,9068596]],DM=[[-.45,.18,-.55,.45,.26,.55,5921892],[-.45,.26,-.55,-.37,.72,.55,9079956],[.37,.26,-.55,.45,.72,.55,9079956],[-.37,.26,-.55,.37,.72,-.47,8027268],[-.37,.26,.47,.37,.72,.55,8027268],[-.45,.66,-.55,.45,.72,-.5,12088364],[-.45,.66,.5,.45,.72,.55,12088364]],IM=[[-.04,-.12,-.12,.04,.12,.12,2763312],[-.05,-.03,-.03,.05,.03,.03,10132130],[-.045,-.12,-.02,.045,.12,.02,4868690]];class NM{constructor(t){this.group=new Fn,t.add(this.group),this.geo={hull:Xs(LM),paddle:Xs(PM),cart:Xs(DM),wheel:Xs(IM)},this.items=new Map}add(t){const e=new Fi({vertexColors:!0}),n=new Fn,s=[];if(t.kind==="boot"){n.add(new Re(this.geo.hull,e));for(const r of[-1,1]){const a=new Re(this.geo.paddle,e);a.position.set(r*.62,.45,.05),n.add(a),s.push(a)}}else{n.add(new Re(this.geo.cart,e));for(const[r,a]of[[-.48,-.35],[.48,-.35],[-.48,.35],[.48,.35]]){const o=new Re(this.geo.wheel,e);o.position.set(r,.12,a),n.add(o),s.push(o)}}this.group.add(n),this.items.set(t,{root:n,parts:s,mat:e})}remove(t){const e=this.items.get(t);e&&(this.group.remove(e.root),e.mat.dispose(),this.items.delete(t))}clear(){for(const t of[...this.items.keys()])this.remove(t)}update(t,e,n,s,r){for(const[a,o]of this.items){const l=Math.hypot(a.x-t,a.z-e)<s;if(o.root.visible=l,!!l)if(o.root.position.set(a.x,a.y,a.z),o.root.rotation.y=a.yaw,o.mat.color.setRGB(n,n,n),a.kind==="boot")o.root.rotation.z=Math.sin(r*1.7+a.x)*.04,o.root.rotation.x=Math.sin(r*1.3+a.z)*.03,o.parts.forEach((c,h)=>{c.rotation.x=Math.sin(a.t*2.2+h*Math.PI)*.7,c.rotation.z=(h?-1:1)*.5});else{o.parts.forEach(u=>{u.rotation.x=-a.t/.12});const c=a.rail,h=c?a.y-(c.y+.0625):0;o.root.rotation.x=h>.01?Math.PI/4:h<-.01?-Math.PI/4:0}}}}const wr=[{key:"einzeln",name:"Einzeln",clicks:1},{key:"linie",name:"Linie",clicks:2},{key:"flaeche",name:"Fläche",clicks:2},{key:"wand",name:"Wand",clicks:2},{key:"saeule",name:"Säule",clicks:2},{key:"kopieren",name:"Kopieren",clicks:2,creative:!0},{key:"einfuegen",name:"Einfügen",clicks:1,creative:!0}],Pc={creative:8192,survival:512},UM=32768,ni=(i,t)=>{const e=[],n=i<=t?1:-1;for(let s=i;s!==t+n;s+=n)e.push(s);return e};function kM(i,t,e,n=Pc.creative){const s=[],r=(c,h,u)=>(h>=0&&h<le&&s.push([c,h,u]),s.length<=n);if(i==="linie"){const c=Math.max(Math.abs(e[0]-t[0]),Math.abs(e[1]-t[1]),Math.abs(e[2]-t[2]));if(c+1>n)return null;for(let h=0;h<=c;h++){const u=c?h/c:0;r(Math.round(t[0]+(e[0]-t[0])*u),Math.round(t[1]+(e[1]-t[1])*u),Math.round(t[2]+(e[2]-t[2])*u))}return s}let a,o,l;if(i==="flaeche")a=ni(t[0],e[0]),o=[t[1]],l=ni(t[2],e[2]);else if(i==="saeule")a=[t[0]],o=ni(t[1],e[1]),l=[t[2]];else if(i==="wand")o=ni(t[1],e[1]),Math.abs(e[0]-t[0])>=Math.abs(e[2]-t[2])?(a=ni(t[0],e[0]),l=[t[2]]):(a=[t[0]],l=ni(t[2],e[2]));else if(i==="kopieren")a=ni(t[0],e[0]),o=ni(t[1],e[1]),l=ni(t[2],e[2]);else return[t.slice()];if(a.length*o.length*l.length>n)return null;for(const c of o)for(const h of l)for(const u of a)r(u,c,h);return s}function Dc(i,t){return[Math.min(i[0],t[0]),Math.min(i[1],t[1]),Math.min(i[2],t[2]),Math.max(i[0],t[0]),Math.max(i[1],t[1]),Math.max(i[2],t[2])]}function OM(i,t,e){const[n,s,r,a,o,l]=Dc(t,e),c=a-n+1,h=o-s+1,u=l-r+1;if(c*h*u>UM)return null;const f=new Uint8Array(c*h*u);let d=0;for(let g=0;g<h;g++)for(let _=0;_<u;_++)for(let m=0;m<c;m++){const p=i.getBlock(n+m,s+g,r+_);f[m+_*c+g*c*u]=p===v.WATER?v.AIR:p,p&&p!==v.WATER&&d++}return{sx:c,sy:h,sz:u,data:f,n:d}}function zM(i,t){const e=[];for(let n=0;n<i.sy;n++)for(let s=0;s<i.sz;s++)for(let r=0;r<i.sx;r++){const a=i.data[r+s*i.sx+n*i.sx*i.sz];a&&t[1]+n>=0&&t[1]+n<le&&e.push([t[0]+r,t[1]+n,t[2]+s,a])}return e}const Ic=20,Wu=64,Be=4,rn=32,FM=i=>{let t="";for(const e of i)t+=String.fromCharCode(e);return btoa(t)},BM=i=>{const t=atob(i),e=new Uint8Array(128);for(let n=0;n<Math.min(128,t.length);n++)e[n]=t.charCodeAt(n);return e},Xu=i=>Number.isFinite(i);class HM{constructor(t){this.regions=new Map,this.marks=[],this.radios=new Map,this.tiles=new Map,this.count=0;const e=t&&typeof t=="object"?t:{};if(e.seen&&typeof e.seen=="object"){for(const[n,s]of Object.entries(e.seen))if(!(!/^-?\d+,-?\d+$/.test(n)||typeof s!="string"))try{const r=BM(s);this.regions.set(n,r);for(const a of r)for(let o=a;o;o&=o-1)this.count++}catch{}}if(Array.isArray(e.marks))for(const n of e.marks.slice(0,Ic))n&&Xu(n.x)&&Xu(n.z)&&this.marks.push({x:Math.round(n.x),z:Math.round(n.z),n:String(n.n||"Markierung").slice(0,24)});if(Array.isArray(e.radios))for(const n of e.radios.slice(0,Wu))Array.isArray(n)&&n.length===3&&n.every(Number.isInteger)&&this.radios.set(n.join(","),n)}has(t,e){const n=this.regions.get(`${Math.floor(t/rn)},${Math.floor(e/rn)}`);if(!n)return!1;const s=t-Math.floor(t/rn)*rn+(e-Math.floor(e/rn)*rn)*rn;return(n[s>>3]&1<<(s&7))!==0}mark(t,e){const n=`${Math.floor(t/rn)},${Math.floor(e/rn)}`;let s=this.regions.get(n);s||(s=new Uint8Array(128),this.regions.set(n,s));const r=t-Math.floor(t/rn)*rn+(e-Math.floor(e/rn)*rn)*rn;return s[r>>3]&1<<(r&7)?!1:(s[r>>3]|=1<<(r&7),this.count++,!0)}markAround(t,e,n){const s=Math.floor(t/F),r=Math.floor(e/F);let a=0;for(let o=-n;o<=n;o++)for(let l=-n;l<=n;l++)l*l+o*o<=n*n+1&&this.mark(s+l,r+o)&&a++;return a}syncRadios(t){for(const[e,n]of this.radios)t.getChunk(n[0]>>4,n[2]>>4)&&t.getBlock(n[0],n[1],n[2])!==v.RADIO&&this.radios.delete(e);for(const[e,n]of t.radios)this.radios.size<Wu&&this.has(n[0]>>4,n[2]>>4)&&this.radios.set(e,n)}addMark(t,e,n){return this.marks.length>=Ic?!1:(this.marks.push({x:Math.round(t),z:Math.round(e),n:String(n||`Markierung ${this.marks.length+1}`).slice(0,24)}),!0)}removeMark(t){t>=0&&t<this.marks.length&&this.marks.splice(t,1)}serialize(){if(!this.count&&!this.marks.length)return;const t={};for(const[e,n]of this.regions)t[e]=FM(n);return{seen:t,marks:this.marks.length?this.marks:void 0,radios:this.radios.size?[...this.radios.values()]:void 0}}tile(t,e,n){const s=`${e},${n}`,r=t.getChunk(e,n);let a=this.tiles.get(s);if(a&&(a.real||!r))return a.px;this.tiles.size>6e3&&this.tiles.clear();const o=new Uint8ClampedArray(Be*Be*4),l={},c=F/Be;for(let h=0;h<Be;h++)for(let u=0;u<Be;u++){const f=u*c+1,d=h*c+1,g=(h*Be+u)*4;let _,m=1;if(r){const p=f+d*F;let x=Math.min(le-1,r.maxY);for(;x>0&&r.data[p+x*F*F]===v.AIR;)x--;const y=r.data[p+x*F*F];_=Yt[y]&&Yt[y].map?Yt[y].map:[200,200,210],y!==v.WATER&&(m=Math.max(.6,Math.min(1.3,.85+(x-te)*.012)))}else{const p=e*F+f,x=n*F+d;if(t.gen>=2)mi(t.seed,p,x,l),_=l.h<te?Fs[0]:Fs[l.biome],l.h>=te&&(m=Math.max(.6,Math.min(1.3,.85+(l.h-te)*.012)));else{const y=io(t.seed,p,x);_=y<te?Fs[0]:y<=te+1?Fs[1]:y>40?Fs[5]:Fs[2]}}o[g]=_[0]*m,o[g+1]=_[1]*m,o[g+2]=_[2]*m,o[g+3]=255}return this.tiles.set(s,{px:o,real:!!r}),o}}const GM=90,$u=4096,VM=(i,t)=>Math.max(0,Math.min(jr.length-1,Math.floor((t-i)/GM))),wd=i=>jr.includes(i);function WM(i,t=Math.random){return i===jr[jr.length-1]?[[tt.WHEAT,1],[tt.SEEDS,1+Math.floor(t()*2)]]:[[tt.SEEDS,1]]}const qu=(i,t,e)=>i+","+t+","+e;class Yu{constructor(t){if(this.plants=new Map,t&&typeof t=="object")for(const[e,n]of Object.entries(t)){const s=e.split(",").map(Number);s.length===3&&s.every(Number.isInteger)&&Number.isFinite(n)&&this.plants.size<$u&&this.plants.set(e,n)}}plant(t,e,n,s){return this.plants.size>=$u?!1:(this.plants.set(qu(t,e,n),s),!0)}remove(t,e,n){this.plants.delete(qu(t,e,n))}update(t,e){let n=0;for(const[s,r]of this.plants){const[a,o,l]=s.split(",").map(Number);if(!t.isLoaded(a,l))continue;const c=t.getBlock(a,o,l);if(!wd(c)){this.plants.delete(s);continue}if(t.getBlock(a,o-1,l)!==v.FARMLAND){t.setBlock(a,o,l,v.AIR),this.plants.delete(s),n++;continue}const h=jr[VM(r,e)];h!==c&&t.setBlock(a,o,l,h)&&n++}return n}serialize(){return Object.fromEntries(this.plants)}}const Gs=20,Or=20,ro=10,Ku=15.5;function XM(i){return i>Ku?Math.floor((i-Ku)/2.5)+1:0}const Tl={idle:.018,walk:.028,sprint:.06};class ju{constructor(t={}){const e=(n,s,r)=>Number.isFinite(n)?Math.max(0,Math.min(r,n)):s;this.hp=e(t.hp,Gs,Gs),this.food=e(t.food,Or,Or),this.air=e(t.air,ro,ro),this.hp<=0&&(this.hp=Gs),this.regenT=0,this.starveT=0,this.drownT=0,this.magmaT=0,this.cause=""}hurt(t,e){return t<=0||this.hp<=0?!1:(this.hp=Math.max(0,this.hp-t),this.cause=e,this.hp<=0)}eat(t){return this.food>=Or?!1:(this.food=Math.min(Or,this.food+t),!0)}tick(t,e){const n=this.hp;return this.food=Math.max(0,this.food-t*(e.sprint&&e.moving?Tl.sprint:e.moving?Tl.walk:Tl.idle)),this.food>=16&&this.hp<Gs?(this.regenT+=t,this.regenT>=3&&(this.regenT=0,this.hp=Math.min(Gs,this.hp+1),this.food=Math.max(0,this.food-.6))):this.regenT=0,this.food<=0&&this.hp>1?(this.starveT+=t,this.starveT>=4&&(this.starveT=0,this.hurt(1,"Hunger"))):this.starveT=0,e.eyeWater?(this.air=Math.max(0,this.air-t),this.air<=0&&(this.drownT+=t,this.drownT>=1&&(this.drownT=0,this.hurt(2,"Ertrunken")))):(this.air=Math.min(ro,this.air+t*4),this.drownT=0),e.onMagma?(this.magmaT+=t,this.magmaT>=1&&(this.magmaT=0,this.hurt(1,"Magma"))):this.magmaT=.6,n-this.hp>0?n-this.hp:0}get dead(){return this.hp<=0}toJSON(){return{hp:Math.round(this.hp*10)/10,food:Math.round(this.food*10)/10,air:Math.round(this.air*10)/10}}}const Jr=[{key:"huhn",name:"Huhn",hp:3,half:.25,h:.8,speed:1.5,drops:[[tt.MEAT_RAW,1,1]]},{key:"schaf",name:"Schaf",hp:5,half:.42,h:1.2,speed:1.2,drops:[[tt.MEAT_RAW,1,2],[v.WOOL,1,2]]},{key:"kuh",name:"Kuh",hp:6,half:.45,h:1.4,speed:1.1,drops:[[tt.MEAT_RAW,2,3]]},{key:"rauschling",name:"Rauschling",hp:8,half:.3,h:1.7,speed:2.4,hostile:!0,dmg:2,drops:[[v.CRYSTAL,0,1]]},{key:"hoehlenwesen",name:"Höhlenwesen",hp:12,half:.45,h:.9,speed:1.9,hostile:!0,dmg:3,drops:[[v.COAL,1,2],[v.IRON,0,1]]},{key:"drohne",name:"Störsender-Drohne",hp:6,half:.35,h:.6,speed:3,hostile:!0,fly:!0,range:7,dmg:2,drops:[[tt.COPPER_INGOT,0,1],[v.CRYSTAL,0,1]]},{key:"dorfbewohner",name:"Dorfbewohner",hp:20,half:.3,h:1.8,speed:1.5,npc:!0,drops:[]}],Zu=3,Ju=3,$M=4,Qu=5,qM=6;function tf(i){return i<.03||i>=.5?"home":i<.22||i>=.32&&i<.47?"work":"plaza"}const YM=4,KM=18;function jM(i,t,e,n,s,r,a){const o=Math.hypot(s-t,r-e,a-n),l=Math.ceil(o/.4);for(let c=1;c<l;c++){const h=c/l;if(i.isSolid(Math.floor(t+(s-t)*h),Math.floor(e+(r-e)*h),Math.floor(n+(a-n)*h)))return!1}return!0}const Rr=3,ef=40,ZM=24,JM=new Set([v.GRASS,v.FLOWERS,v.SNOW,v.MYCEL]),Cr=(i,t)=>(i+32768)*65536+(t+32768);let QM=1;class Al{constructor(t,e,n,s,r){const a=Jr[t];this.id=QM++,this.target=0,this.type=t,this.T=a,this.x=e,this.y=n,this.z=s,this.hp=r??a.hp,this.vx=0,this.vy=0,this.vz=0,this.yaw=0,this.onGround=!1,this.walk=0,this.timer=0,this.flee=0,this.hurtT=0,this.acc=0,this.moving=!1,this.hostile=!!a.hostile,this.sees=!1,this.seeT=0,this.atkT=0,this.attack=!1,this.npc=!!a.npc,this.path=null,this.stuck=0,this.phase=null}warp(t,e,n){const s=Math.floor(this.y),r=a=>a>1&&a<le-2&&Kr[t.getBlock(Math.floor(e),a-1,Math.floor(n))]&&!this.collides(t,e,a,n);for(let a=0;a<=8;a++)for(const o of[s-a,s+a])if(r(o))return this.x=e,this.y=o,this.z=n,this.vy=0,!0;return!1}collides(t,e,n,s){const r=this.T.half,a=Math.floor(e-r),o=Math.floor(e+r-1e-7),l=Math.floor(s-r),c=Math.floor(s+r-1e-7),h=Math.floor(n),u=Math.floor(n+this.T.h-1e-7);for(let f=h;f<=u;f++)for(let d=l;d<=c;d++)for(let g=a;g<=o;g++)if(t.isSolid(g,f,d))return!0;return!1}move(t,e,n){if(!n)return!1;const s=this[e];return this[e]+=n,this.collides(t,this.x,this.y,this.z)?(this[e]=s,e==="y"&&(n<0&&(this.onGround=!0),this.vy=0),!0):!1}update(t,e,n,s,r,a=this.y){if(!t.isLoaded(Math.floor(this.x),Math.floor(this.z)))return;const o=this.T;if(this.hurtT=Math.max(0,this.hurtT-e),this.timer-=e,this.hostile){this.atkT-=e,this.seeT-=e;const m=Math.hypot(s-this.x,r-this.z);this.seeT<=0&&(this.seeT=.5,this.sees=m<KM&&jM(t,this.x,this.y+1.5,this.z,s,a+1.6,r)),this.sees&&m>.8&&(this.walk=1,this.yaw=Math.atan2(-(s-this.x),-(r-this.z)),this.timer=.5),o.range?(this.sees&&m<4&&(this.walk=0),this.sees&&Math.hypot(m,a+1-this.y)<o.range&&this.atkT<=0&&(this.atkT=2,this.attack=!0)):this.sees&&m<1.5&&Math.abs(a-this.y)<1.8&&this.atkT<=0&&(this.atkT=1,this.attack=!0)}if(this.npc&&this.path&&this.path.length){const m=this.path[0],p=Math.hypot(m.x-this.x,m.z-this.z);p<.6?(this.path.shift(),this.walk=0,this.stuck=0,this.bestD=1/0,this.timer=1+n()*2):(this.walk=1,this.yaw=Math.atan2(-(m.x-this.x),-(m.z-this.z)),this.timer=.3,p<(this.bestD??1/0)-.3?(this.bestD=p,this.stuck=0):(this.stuck+=e)>5&&(this.path.shift(),this.warp(t,m.x,m.z),this.stuck=0,this.bestD=1/0))}this.hostile&&this.sees||this.npc&&this.path&&this.path.length||(this.npc?this.timer<=0&&(this.walk=0,this.yaw+=(n()-.5)*1.5,this.timer=2+n()*3):this.flee>0?(this.flee-=e,this.walk=1,this.yaw=Math.atan2(-(this.x-s),-(this.z-r))):this.timer<=0&&(n()<.55?(this.walk=1,this.yaw=n()*Math.PI*2,this.timer=1+n()*3):(this.walk=0,this.timer=2+n()*4)));const l=Math.floor(this.x),c=Math.floor(this.z),h=t.getBlock(l,Math.floor(this.y+.3),c)===v.WATER;let u=this.walk?o.speed*(this.flee>0?2.2:1):0,f=-Math.sin(this.yaw),d=-Math.cos(this.yaw);if(u&&this.onGround&&!this.sees&&!o.fly){const m=Math.floor(this.x+f*(o.half+.6)),p=Math.floor(this.z+d*(o.half+.6));let x=0;for(let y=Math.floor(this.y)-1;x<4&&y>0&&!Kr[t.getBlock(m,y,p)];y--)if(x++,t.getBlock(m,y,p)===v.WATER&&!this.flee){x=9;break}x>3&&(this.yaw+=Math.PI*(.5+n()),this.timer=.5+n(),f=-f,d=-d,u*=.3)}if(this.hostile&&this.sees&&Math.hypot(s-this.x,r-this.z)<.9&&(u=0),this.vx=f*u,this.vz=d*u,o.fly){const m=this.sees?a+2.5:this.y+Math.sin(this.timer*3)*.3;this.vy=Math.max(-3,Math.min(3,(m-this.y)*2))}else h?this.vy=Math.min(2,this.vy+20*e):this.vy=Math.max(-40,this.vy-28*e);const g=this.move(t,"x",this.vx*e),_=this.move(t,"z",this.vz*e);this.onGround=!1,this.move(t,"y",this.vy*e),(g||_)&&u&&!o.fly&&(this.onGround&&!this.collides(t,this.x,this.y+1.05,this.z)?this.vy=7.2:this.npc&&this.path&&this.path.length||this.onGround&&(this.yaw+=Math.PI*(.5+n()),this.timer=.5)),this.y<-10&&(this.y=le),this.moving=u>0&&Math.abs(this.vx)+Math.abs(this.vz)>.1}hit(t,e,n){if(this.npc)return!1;this.hp-=t,this.hurtT=.35,this.hostile||(this.flee=3.5);const s=Math.hypot(this.x-e,this.z-n)||1;return this.x+=(this.x-e)/s*.15,this.z+=(this.z-n)/s*.15,this.vy=4.5,this.hp<=0}record(){return[this.type,+this.x.toFixed(2),+this.y.toFixed(2),+this.z.toFixed(2),this.hp]}}function t1(i,t,e,n,s,r,a,o,l,c,h,u){let f=0,d=1/0;const g=[i,t,e],_=[n,s,r],m=[a,o,l],p=[c,h,u];for(let x=0;x<3;x++){if(Math.abs(_[x])<1e-9){if(g[x]<m[x]||g[x]>p[x])return 1/0;continue}let y=(m[x]-g[x])/_[x],M=(p[x]-g[x])/_[x];if(y>M){const C=y;y=M,M=C}if(f=Math.max(f,y),d=Math.min(d,M),f>d)return 1/0}return f}class e1{constructor(t,e,n,s=!0){if(this.world=t,this.seed=e|0,this.enabled=s,this.store=new Map,n&&typeof n=="object")for(const r of Object.keys(n)){const a=n[r],o=Number(r);!Array.isArray(a)||!Number.isFinite(o)||this.store.set(o,a.filter(l=>Array.isArray(l)&&Number.isInteger(l[0])&&l[0]>=0&&l[0]<Zu&&l.slice(1,5).every(Number.isFinite)))}this.list=[],this.active=new Set,this.lastPC=null,this.rnd=Math.random,this.onAdd=()=>{},this.onRemove=()=>{},this.onAttack=()=>{},this.onPoof=()=>{},this.day=!0,this.spawnT=3,this.villages=new Map,this.findVillages=null,this.time=.2}spawnRecords(t,e){const n=this.seed+9001;if(jt(t,e,n)>.2)return null;const s=this.world.getChunk(t,e);if(!s)return null;const r=Math.floor(jt(t,e,n+1)*Zu),a=2+Math.floor(jt(t,e,n+2)*3),o=[];for(let l=0;l<a*3&&o.length<a;l++){const c=Math.floor(jt(t*31+l,e,n+3)*F),h=Math.floor(jt(t,e*31+l,n+4)*F),u=c+h*F;let f=Math.min(le-3,s.maxY+1);for(;f>0&&s.data[u+f*256]===v.AIR;)f--;const d=s.data[u+f*256];!JM.has(d)||f<te||s.data[u+(f+1)*256]!==v.AIR||s.data[u+(f+2)*256]!==v.AIR||o.push([r,t*F+c+.5,f+1,e*F+h+.5,Jr[r].hp])}return o.length?o:null}activate(t,e,n){this.active.add(t);let s=this.store.get(t);if(s?this.store.delete(t):s=this.spawnRecords(e,n),!!s){if(!s.length){this.store.set(t,s);return}for(const r of s){if(this.list.length>=ef){this.stash(r);continue}const a=new Al(r[0],r[1],r[2],r[3],r[4]);a.yaw=jt(Math.floor(r[1]),Math.floor(r[3]),5)*6.28,this.list.push(a),this.onAdd(a)}}}stash(t){const e=Cr(Math.floor(t[1]/F),Math.floor(t[3]/F));let n=this.store.get(e);n||this.store.set(e,n=[]),n.push(t)}remove(t,e){const n=this.list.indexOf(t);if(!(n<0)&&(this.list.splice(n,1),this.onRemove(t),!(t.hostile||t.npc)))if(e)this.stash(t.record());else{const s=Cr(Math.floor(t.x/F),Math.floor(t.z/F));!this.store.has(s)&&!this.active.has(s)&&this.store.set(s,[])}}hostile(t){return t.hostile}hostileCount(){let t=0;for(const e of this.list)e.hostile&&t++;return t}spawnHostile(t,e,n,s,r=this.rnd){if(this.hostileCount()>=YM||this.list.length>=ef)return null;for(let a=0;a<6;a++){const o=r()*Math.PI*2,l=14+r()*12,c=Math.floor(t+Math.cos(o)*l),h=Math.floor(n+Math.sin(o)*l),u=this.world.getChunk(c>>4,h>>4);if(!u)continue;const f=this.world.heightmap(u)[(c&15)+(h&15)*F];for(let d=Math.min(le-3,Math.floor(e)+8);d>Math.max(1,Math.floor(e)-10);d--){if(!Kr[this.world.getBlock(c,d-1,h)]||this.world.getBlock(c,d-1,h)===v.WATER||this.world.getBlock(c,d,h)!==v.AIR||this.world.getBlock(c,d+1,h)!==v.AIR)continue;const g=d>=f,_=!g&&d<te-4;if(g&&s||_){for(const{v:x}of this.villages.values())if(Math.hypot(x.x-c,x.z-h)<30)return null;const m=_?r()<.5?$M:Ju:r()<.3?Qu:Ju,p=new Al(m,c+.5,m===Qu?d+3:d,h+.5);return p.yaw=r()*6.28,this.list.push(p),this.onAdd(p),p}break}}return null}refresh(t,e){if(!this.enabled)return;const n=Math.floor(t/F),s=Math.floor(e/F);for(let r=-Rr;r<=Rr;r++)for(let a=-Rr;a<=Rr;a++){const o=n+a,l=s+r,c=Cr(o,l);this.active.has(c)||!this.world.getChunk(o,l)||this.activate(c,o,l)}for(const r of this.active){const a=Math.floor(r/65536)-32768,o=r%65536-32768;Math.max(Math.abs(a-n),Math.abs(o-s))<=Rr+1||this.active.delete(r)}for(const r of this.list.slice()){const a=Cr(Math.floor(r.x/F),Math.floor(r.z/F));if(r.hostile){const o=Math.hypot(r.x-t,r.z-e)>40,l=this.world.getChunk(Math.floor(r.x)>>4,Math.floor(r.z)>>4),c=l&&Math.floor(r.y)>=this.world.heightmap(l)[(Math.floor(r.x)&15)+(Math.floor(r.z)&15)*F];(o||this.day&&c)&&(this.onPoof(r),this.remove(r,!1))}else!r.npc&&!this.active.has(a)&&this.remove(r,!0)}this.refreshVillages(t,e)}refreshVillages(t,e){for(const[n,s]of this.villages)if(!(Math.hypot(s.v.x-t,s.v.z-e)<112)){for(const r of s.list)this.remove(r,!1);this.villages.delete(n)}if(this.findVillages)for(const n of this.findVillages(t,e))this.villages.has(n.id)||Math.hypot(n.x-t,n.z-e)>96||!this.world.getChunk(n.x>>4,n.z>>4)||this.villages.set(n.id,{v:n,list:this.spawnVillagers(n)})}spawnVillagers(t){const e=[];return t.houses.forEach((n,s)=>{const r=new Al(qM,n.x+.5,t.y+1,n.z+.5);r.name=n.role.name,r.role=n.role.key,r.vid=t.id,r.home={x:n.x+.5,z:n.z+.5},r.front={x:n.front.x+.5,z:n.front.z+.5},r.work=Gx(t,n),r.plaza={x:t.x+.5+(s&1?2.2:-2.2),z:t.z+.5+(s<2?-2.2:2.2)};const a=tf(this.time),o=a==="home"?r.home:a==="work"?r.work:r.plaza;r.phase=a,r.warp(this.world,o.x,o.z),this.list.push(r),this.onAdd(r),e.push(r)}),e}route(t,e){const n=Math.abs(t.x-t.home.x)<2.6&&Math.abs(t.z-t.home.z)<2.6;if(e==="home")return n?[t.home]:[t.front,t.home];const s=e==="work"?t.work:t.plaza;return n?[t.front,s]:[s]}update(t,e,n,s={}){if(!this.enabled)return;const r=s.py??0;this.day=!s.night,this.time=s.time??.2;const a=tf(this.time);if(s.hostiles)this.spawnT-=t,this.spawnT<=0&&(this.spawnT=3,this.spawnHostile(e,r,n,!!s.night));else if(this.hostileCount())for(const c of this.list.slice())c.hostile&&this.remove(c,!1);const o=Math.floor(e/F),l=Math.floor(n/F);(!this.lastPC||this.lastPC[0]!==o||this.lastPC[1]!==l||(this.refreshT=(this.refreshT||0)-t)<=0)&&(this.lastPC=[o,l],this.refreshT=1,this.refresh(e,n));for(const c of this.list){c.npc&&c.phase!==a&&(c.phase=a,c.path=this.route(c,a),c.bestD=1/0,c.stuck=0);const h=Math.hypot(c.x-e,c.z-n);if(c.hostile){let u=e,f=r,d=n,g=h;if(c.target=0,s.others)for(const _ of s.others){const m=Math.hypot(c.x-_.x,c.z-_.z);m<g&&(g=m,u=_.x,f=_.y,d=_.z,c.target=_.id)}c.update(this.world,t,this.rnd,u,d,f)}else h<ZM||c.flee>0?c.update(this.world,t,this.rnd,e,n,r):(c.acc+=t,c.acc>=.25&&(c.update(this.world,Math.min(c.acc,.25),this.rnd,e,n,r),c.acc=0));c.attack&&(c.attack=!1,this.onAttack(c))}}raycast(t,e,n,s,r,a,o){let l=null,c=o;for(const h of this.list){const u=h.T.half,f=t1(t,e,n,s,r,a,h.x-u,h.y,h.z-u,h.x+u,h.y+h.T.h,h.z+u);f<c&&(c=f,l=h)}return l?{mob:l,t:c}:null}serialize(){const t={};for(const[e,n]of this.store)t[e]=n.slice();for(const e of this.active)t[e]||(t[e]=[]);for(const e of this.list){if(e.hostile||e.npc)continue;const n=Cr(Math.floor(e.x/F),Math.floor(e.z/F));(t[n]||(t[n]=[])).push(e.record())}for(const e of this.active){if(t[e].length)continue;const n=Math.floor(e/65536)-32768,s=e%65536-32768;jt(n,s,this.seed+9001)>.2&&delete t[e]}return t}clear(){for(const t of this.list)this.onRemove(t);this.list=[],this.active.clear(),this.villages.clear()}}function Rd(i,t=Math.random){return Jr[i].drops.map(([e,n,s])=>[e,n+Math.floor(t()*(s-n+1))]).filter(([,e])=>e>0)}const Ri=.3,wl=1.8,Rl=1.62,$a=.001;class n1{constructor(){this.x=0,this.y=0,this.z=0,this.vx=0,this.vy=0,this.vz=0,this.onGround=!1,this.inWater=!1,this.flying=!1,this.coyote=0,this.fallT=0,this.gliding=!1,this.hook=!1,this.lifted=!1,this.bounces=0,this.eyeWater=!1,this.impact=0}collides(t,e,n,s){const r=Math.floor(e-Ri),a=Math.floor(e+Ri-1e-7),o=Math.floor(s-Ri),l=Math.floor(s+Ri-1e-7),c=Math.floor(n),h=Math.floor(n+wl-1e-7);for(let u=c;u<=h;u++)for(let f=o;f<=l;f++)for(let d=r;d<=a;d++)if(t.isSolid(d,u,f))return!0;return!1}move(t,e,n){for(;n!==0;){const s=Math.abs(n)>.2?Math.sign(n)*.2:n;if(n-=s,this[e]+=s,this.collides(t,this.x,this.y,this.z)){e==="y"?this.y=s>0?Math.floor(this.y+wl)-wl-$a:Math.floor(this.y)+1+$a:this[e]=s>0?Math.floor(this[e]+Ri)-Ri-$a:Math.floor(this[e]-Ri)+1+Ri+$a,this["v"+e]=0,e==="y"&&s<0&&(this.onGround=!0);return}}}update(t,e,n,s){if(t.isLoaded&&!t.isLoaded(Math.floor(this.x),Math.floor(this.z))){this.vx=this.vy=this.vz=0,this.waiting=!0;return}this.waiting=!1;for(let o=0;o<12&&this.collides(t,this.x,this.y,this.z);o++)this.y+=1;const r=Math.max(1,Math.ceil(e*120-1e-9)),a=e/r;for(let o=0;o<r;o++)this.step(t,a,n,s)}step(t,e,n,s){const r=Math.sin(s),a=Math.cos(s);let o=-n.f*r+n.r*a,l=-n.f*a-n.r*r;const c=Math.hypot(o,l);c>1&&(o/=c,l/=c);const h=Math.floor(this.x),u=Math.floor(this.z);this.inWater=t.getBlock(h,Math.floor(this.y+.4),u)===v.WATER;const f=this.eyeWater=t.getBlock(h,Math.floor(this.y+1.5),u)===v.WATER,d=this.onGround?t.getBlock(h,Math.floor(this.y-.05),u):v.AIR;if(this.lifted=!1,!this.flying)for(let m=0,p=Math.floor(this.y-.1);m<=11;m++,p--){const x=t.getBlock(h,p,u);if(x===v.WIND){this.lifted=!0;break}if(x!==v.AIR&&x!==v.WATER)break}const g=!this.onGround&&!this.inWater&&!this.flying;if(this.fallT=g&&this.vy<0?this.fallT+e:0,this.gliding=g&&n.jump&&this.fallT>.45&&!this.lifted&&!this.hook,!this.hook){let m;this.flying?m=n.sprint?16:10.5:this.gliding?(m=9.5,c<.1&&(o=-r,l=-a)):this.inWater?m=2.8:m=n.sprint?5.9:4.3,d===v.TURBO&&(m*=2.4);const p=Math.min(1,(this.flying?8:this.onGround?14:this.inWater?5:this.gliding?2.5:4)*e);if(this.vx+=(o*m-this.vx)*p,this.vz+=(l*m-this.vz)*p,this.flying){const x=((n.jump?1:0)-(n.down?1:0))*(n.sprint?12:8);this.vy+=(x-this.vy)*Math.min(1,8*e)}else this.inWater?(this.vy-=9*e,n.jump&&(f?this.vy+=24*e:this.vy=Math.max(this.vy,6.5)),this.vy-=this.vy*Math.min(1,3*e),this.vy=Math.max(-4,Math.min(this.vy,4))):(this.vy=Math.max(-55,this.vy-28*e),this.gliding&&(this.vy=Math.max(this.vy,-2.2)),this.lifted&&(this.vy=Math.min(7.5,this.vy+60*e)),n.jump&&(this.onGround||this.coyote>0)&&(this.vy=d===v.FEDER?15:8.8,this.onGround=!1,this.coyote=0))}const _=this.vy;this.move(t,"x",this.vx*e),this.move(t,"z",this.vz*e),this.onGround=!1,this.move(t,"y",this.vy*e),this.onGround&&_<-2&&t.getBlock(h,Math.floor(this.y-.05),u)===v.FEDER?(this.vy=Math.min(26,Math.max(10,-_*.92)),this.onGround=!1,this.bounces++):this.onGround&&_<0&&!this.hook&&!this.flying&&(this.impact=Math.max(this.impact,-_)),this.coyote=this.onGround?.1:this.coyote-e}}function nf(i,t,e,n,s,r,a,o){let l=Math.floor(t),c=Math.floor(e),h=Math.floor(n);const u=s>0?1:-1,f=r>0?1:-1,d=a>0?1:-1,g=s!==0?Math.abs(1/s):1/0,_=r!==0?Math.abs(1/r):1/0,m=a!==0?Math.abs(1/a):1/0;let p=s!==0?(s>0?l+1-t:t-l)*g:1/0,x=r!==0?(r>0?c+1-e:e-c)*_:1/0,y=a!==0?(a>0?h+1-n:n-h)*m:1/0;for(;;){let M=0,C=0,A=0,w;if(p<=x&&p<=y?(w=p,p+=g,l+=u,M=-u):x<=y?(w=x,x+=_,c+=f,C=-f):(w=y,y+=m,h+=d,A=-d),w>o)return null;const D=i.getBlock(l,c,h);if(D!==v.AIR&&D!==v.WATER)return{x:l,y:c,z:h,nx:M,ny:C,nz:A,type:D,t:w}}}let Bt=null,Ui=null;const nn={enabled:!0,vol:.8,music:.8,amb:.7};function Hi(){try{Bt||(Bt=new(window.AudioContext||window.webkitAudioContext)),Bt.state==="suspended"&&Bt.resume()}catch{Bt=null}}const Cd=i=>!!Bt&&nn.enabled&&Bt.state==="running"&&i>.001;function Je(i,t,e,n="lowpass",s=!1){if(e*=s?nn.amb:nn.vol,!Cd(e))return;if(!Ui){Ui=Bt.createBuffer(1,Math.floor(Bt.sampleRate*.25),Bt.sampleRate);const c=Ui.getChannelData(0);for(let h=0;h<c.length;h++)c[h]=Math.random()*2-1}const r=Bt.createBufferSource(),a=Bt.createBiquadFilter(),o=Bt.createGain(),l=Bt.currentTime;r.buffer=Ui,a.type=n,a.frequency.value=i,o.gain.setValueAtTime(e,l),o.gain.exponentialRampToValueAtTime(.001,l+t),r.connect(a),a.connect(o),o.connect(Bt.destination),r.start(l),r.stop(l+t+.02)}const Nc={fn:null},la=i=>{Nc.fn&&Nc.fn(i)},Cl=()=>{la("break"),Je(1100,.14,.5)},un=()=>{la("place"),Je(600,.09,.4)},fn=()=>{la("deny"),Je(220,.1,.3)};function We(i,t,e,n,s,r,a=0,o=0){if(s*=r?nn.amb:nn.vol,!Cd(s))return;const l=Bt.currentTime+o,c=Bt.createOscillator(),h=Bt.createGain();if(c.type=i,c.frequency.setValueAtTime(t,l),c.frequency.exponentialRampToValueAtTime(Math.max(20,e),l+n),a){const u=Bt.createOscillator(),f=Bt.createGain();u.frequency.value=a,f.gain.value=t*.04,u.connect(f),f.connect(c.frequency),u.start(l),u.stop(l+n+.02)}h.gain.setValueAtTime(1e-4,l),h.gain.exponentialRampToValueAtTime(s,l+Math.min(.04,n/4)),h.gain.exponentialRampToValueAtTime(.001,l+n),c.connect(h),h.connect(Bt.destination),c.start(l),c.stop(l+n+.02)}const sf={weich:()=>Je(380,.08,.22,"lowpass",!0),stein:()=>{Je(2400,.05,.16,"bandpass",!0),Je(500,.04,.12,"lowpass",!0)},holz:()=>{We("triangle",190,120,.07,.16,!0),Je(900,.04,.08,"bandpass",!0)},sand:()=>Je(3200,.11,.12,"highpass",!0),schnee:()=>{Je(1600,.12,.16,"bandpass",!0),Je(300,.08,.1,"lowpass",!0)},glas:()=>We("sine",2200,1900,.06,.07,!0)},i1=i=>(sf[i]||sf.weich)(),rf=i=>{Je(1400,i?.45:.18,i?.35:.14,"bandpass",!0),i&&Je(400,.3,.2,"lowpass",!0)},af={huhn:i=>{We("square",1200,1500,.06,i*.08,!0),We("square",1300,1e3,.07,i*.08,!0,0,.09)},schaf:i=>We("sawtooth",330,300,.5,i*.1,!0,7),kuh:i=>We("sawtooth",140,105,.9,i*.16,!0,3),rauschling:i=>{Je(5e3,.5,i*.18,"bandpass",!0),We("sawtooth",90,70,.4,i*.08,!0,11)},hoehlenwesen:i=>We("square",70,50,.35,i*.14,!0,18),drohne:i=>We("sawtooth",210,230,.6,i*.06,!0,30),dorfbewohner:i=>{We("triangle",240,300,.12,i*.12,!0),We("triangle",280,220,.15,i*.12,!0,0,.14)}};function s1(i,t){const e=Math.max(0,1-t/20);e>0&&af[i]&&af[i](e)}const r1=()=>We("square",1800,900,.04,.12,!1),a1=()=>{Je(700,.25,.3,"bandpass"),We("square",160,110,.18,.1,!1)},o1=()=>We("sine",880,880,.12,.12,!1),l1=()=>la("done")||[0,4,7,12].forEach((i,t)=>We("triangle",523*Math.pow(2,i/12),523*Math.pow(2,i/12),.22,.14,!1,0,t*.11)),Ll=()=>{la("hurt"),We("sawtooth",300,120,.18,.16,!1),Je(800,.1,.2)},pe={on:!1,timer:0,next:0,step:0,master:null,seed:0},c1=[[0,3,5,7,10],[0,2,4,7,9],[0,2,3,7,8]],of=i=>440*Math.pow(2,(i-69)/12);function lf(i,t,e,n,s,r){const a=Bt.createOscillator(),o=Bt.createGain();a.type=i,a.frequency.setValueAtTime(t,e),o.gain.setValueAtTime(s,e),o.gain.exponentialRampToValueAtTime(.001,e+n);let l=a;if(r){const c=Bt.createBiquadFilter();c.type="lowpass",c.frequency.value=r,a.connect(c),l=c}l.connect(o),o.connect(pe.master),a.start(e),a.stop(e+n+.02)}function cf(i,t,e,n,s){if(!Ui){Ui=Bt.createBuffer(1,Math.floor(Bt.sampleRate*.25),Bt.sampleRate);const l=Ui.getChannelData(0);for(let c=0;c<l.length;c++)l[c]=Math.random()*2-1}const r=Bt.createBufferSource(),a=Bt.createBiquadFilter(),o=Bt.createGain();r.buffer=Ui,a.type=n,a.frequency.value=s,o.gain.setValueAtTime(e,i),o.gain.exponentialRampToValueAtTime(.001,i+t),r.connect(a),a.connect(o),o.connect(pe.master),r.start(i),r.stop(i+t+.02)}function h1(i,t){const e=c1[pe.seed%3],n=45+(pe.seed>>2)%5,s=i%16,r=Math.floor(i/16)%4;if(s%4===0){const o=Bt.createOscillator(),l=Bt.createGain();o.frequency.setValueAtTime(150,t),o.frequency.exponentialRampToValueAtTime(42,t+.14),l.gain.setValueAtTime(.9,t),l.gain.exponentialRampToValueAtTime(.001,t+.2),o.connect(l),l.connect(pe.master),o.start(t),o.stop(t+.22)}(s===4||s===12)&&cf(t,.12,.35,"bandpass",1800),s%2===0&&cf(t,.04,s%4===2?.22:.1,"highpass",7e3),(s%4===2||s===7||s===15)&&lf("sawtooth",of(n+e[(r+(s>>2))%5]-12),t,.2,.2,500);const a=(i*3+pe.seed+r*2)%5;(s%2===1||s%4===0)&&lf("triangle",of(n+24+e[a]+(s>8?12:0)),t,.16,.12,3e3)}function u1(){if(!Bt||Bt.state!=="running")return;const i=118+pe.seed%3*6,t=60/i/4;for(pe.next<Bt.currentTime&&(pe.next=Bt.currentTime+.05);pe.next<Bt.currentTime+.25;)h1(pe.step++,pe.next),pe.next+=t}function hf(i,t){if(i*=nn.music,!Bt||!nn.enabled||i<=.01){pe.on&&(pe.on=!1,clearInterval(pe.timer),pe.master&&pe.master.gain.setTargetAtTime(0,Bt.currentTime,.1));return}pe.master||(pe.master=Bt.createGain(),pe.master.gain.value=0,pe.master.connect(Bt.destination)),pe.on||(pe.on=!0,pe.seed=t,pe.next=0,pe.timer=setInterval(u1,80)),pe.master.gain.setTargetAtTime(Math.min(1,i)*.45,Bt.currentTime,.15)}const f1=[v.NEON_R,v.NEON_B,v.NEON_G,v.NEON_P],Ld=[{t:"Holz sammeln",d:"Die Funkzentrale will wieder auf Sendung. Dafür braucht sie Material. Schlage 5 Holzblöcke an Bäumen ab.",k:"break",a:[v.WOOD],n:5,r:{[v.PLANKS]:4}},{t:"Bretter herstellen",d:"Öffne das Inventar (E oder 🎒) und stelle unter „Herstellen“ Bretter aus Holz her. Du brauchst 8 Bretter.",k:"craft",a:[v.PLANKS],n:8,r:{[v.DIRT]:10}},{t:"Fundament legen",d:"Setze 12 Bretter als Fundament für die Sendehütte.",k:"place",a:[v.PLANKS],n:12,r:{[v.STONE]:4}},{t:"Steinbruch",d:"Grabe nach Stein, unter Erde und in Hügeln. Sammle 12 Steinblöcke im Vorrat.",k:"have",a:[v.STONE],n:12,r:{[v.SAND]:4}},{t:"Strand und Glas",d:"Sand findest du am Wasser. Stelle 4 Glas her (2 Sand ergeben 1 Glas).",k:"craft",a:[v.GLASS],n:4,r:{[v.WOOD]:2,[v.GLASS]:2}},{t:"Leuchtfeuer",d:"Stelle 2 Leuchtblöcke her (Glas und Holz).",k:"craft",a:[v.LAMP],n:2,r:{[v.LEAVES]:4,[v.PLANKS]:2}},{t:"Licht an",d:"Setze beide Leuchtblöcke, damit die Hütte auch nachts zu sehen ist.",k:"place",a:[v.LAMP],n:2,r:{[v.LAMP]:2}},{t:"Hoch hinaus",d:"Der Funkmast muss hoch stehen. Erreiche eine Höhe von 14 Blöcken über dem Startpunkt, zum Beispiel mit einem Turm aus Blöcken.",k:"height",n:14,r:{[v.PLANKS]:6,[v.LEAVES]:4}},{t:"Der Funkmast",d:"Stelle einen Radio-Block her (4 Bretter und 1 Leuchtblock) und setze ihn. Hör zu, wie er spielt.",k:"place",a:[v.RADIO],n:1,r:{[v.PLANKS]:4,[v.LEAVES]:4}},{t:"Federn für die Landung",d:"Stelle 2 Federblöcke her (Blätter und Bretter).",k:"craft",a:[v.FEDER],n:2,r:{[v.STONE]:4}},{t:"Sprungtraining",d:"Setze einen Federblock und springe 3-mal darauf zurück in die Luft. Aufprall genügt, die Feder wirft dich hoch.",k:"bounce",n:3,r:{[v.LAMP]:1}},{t:"Seilhaken",d:"Ziele auf einen entfernten Block und benutze den Seilhaken (Q oder Taste Haken) 2-mal.",k:"hook",n:2,r:{[v.LEAVES]:4}},{t:"Gleitflug",d:"Springe von deinem Turm und halte im Fall die Sprungtaste gedrückt. Gleite insgesamt 5 Sekunden.",k:"glide",n:5,r:{[v.LAMP]:4,[v.SAND]:4}},{t:"Neon-Show",d:"Stelle Neonblöcke her (Leuchtblock mit Sand, Glas, Blättern oder Erde) und setze 4 davon.",k:"place",a:f1,n:4,r:{[v.GLASS]:2,[v.LAMP]:1}},{t:"Regenbogen-Finale",d:"Setze als Krönung einen Regenbogen-Block (2 Glas und 1 Leuchtblock) auf deinen Sendeturm.",k:"place",a:[v.RAINBOW],n:1,r:{[v.RAINBOW]:2}}],d1=5,p1=4,m1=[v.PLANKS,v.STONE,v.COBBLE,v.DIRT,v.WOOD,v.SPRUCE,v.BRICK,v.SANDSTONE,v.GLASS,v.MARBLE],Qr=[null,{t:"Das erste Signal",d:"Ein gewaltiges Funknetz verband einst alle Regionen. Dann kam das große Rauschen, und die Stationen verstummten. Du stehst allein in der Wildnis. Irgendwo knistert ein Signal."},{t:"Der vergessene Sender",d:"Aus deinem Radio dringt eine Stimme: „…Dorf … der Mast … hört uns jemand?“ Der Wegpunkt zeigt dir den Weg."},{t:"Stimmen aus der Tiefe",d:"Funkerin Lotte: „Der Mast braucht Funkkristalle. Sie wachsen tief unten, wo das Rauschen am lautesten ist.“"},{t:"Die zerbrochene Verbindung",d:"Aus Kupfer und Kristallen entsteht ein Funksender. Relais tragen das Signal weiter, Empfänger fangen es auf."},{t:"Das Herz des Rauschens",d:"Das Rauschen wird stärker. Drohnen stören die Leitungen, und in der Tiefe regt sich etwas."},{t:"Die letzte Frequenz",d:"Lotte: „Ein hoher Turm, drei Empfänger, und das Signal geht wieder um die ganze Welt.“"}],Pd=[{c:1,t:"Holz sammeln",d:"Schlage 6 Holzblöcke an Bäumen ab. Im Überleben dauert das etwas, mit einer Axt geht es schneller.",k:"break",a:[v.WOOD,v.SPRUCE],n:6,r:{[v.PLANKS]:4}},{c:1,t:"Werkbank",d:"Öffne das Inventar (E oder 🎒), stelle Bretter her und daraus eine Werkbank.",k:"craft",a:[v.WORKBENCH],n:1,r:{[tt.STICK]:4}},{c:1,t:"Erstes Werkzeug",d:"Setze die Werkbank, drücke Setzen auf sie und stelle eine Holzspitzhacke her.",k:"craft",a:[tt.WOOD_PICK],n:1,r:{[tt.APPLE]:3}},{c:1,t:"Unterschlupf",d:"Die erste Nacht kommt. Baue dir mit 20 Blöcken (Bretter, Stein, Erde …) einen Unterschlupf.",k:"place",a:m1,n:20,r:{[v.LAMP]:2}},{c:1,t:"Licht für die Nacht",d:"Setze einen Leuchtblock in deinen Unterschlupf.",k:"place",a:[v.LAMP],n:1,r:{[tt.BREAD]:2}},{c:1,t:"Das erste Signal",d:"Baue ein Radio (4 Bretter und 1 Leuchtblock) und setze es. Hör genau hin.",k:"place",a:[v.RADIO],n:1,r:{[tt.MEAT_COOKED]:2}},{c:2,t:"Das Dorf",d:"Folge dem Wegpunkt 📍 bis ins Dorf.",k:"visit",n:1,r:{[tt.BREAD]:2}},{c:2,t:"Erste Kontakte",d:"Sprich mit einem Dorfbewohner: Setzen-Taste auf ihn.",k:"talk",n:1,r:{[tt.SEEDS]:4}},{c:2,t:"Erntezeit",d:"Ernte reifen Weizen auf dem Dorffeld oder auf deinem eigenen. Sammle 6 Weizen.",k:"have",a:[tt.WHEAT],n:6,r:{[tt.BREAD]:1}},{c:2,t:"Tauschhandel",d:"Tausche etwas mit einem Dorfbewohner.",k:"trade",n:1,r:{[tt.COPPER_INGOT]:1}},{c:3,t:"Steinwerkzeug",d:"Stelle an der Werkbank eine Steinspitzhacke her. Ohne sie gibt Eisen und Funkkristall nichts her.",k:"craft",a:[tt.STONE_PICK],n:1,r:{[v.LAMP]:4}},{c:3,t:"Abstieg",d:"Steige in eine Höhle, bis unter Höhe 18 (Y-Wert oben links). Vorsicht, dort unten ist es nie ganz ruhig.",k:"depth",y:18,n:1,r:{[tt.MEAT_COOKED]:2}},{c:3,t:"Kupfer schmelzen",d:"Baue einen Schmelzofen (8 Stein, an der Werkbank) und schmelze 3 Kupferbarren aus Kupfererz und Kohle.",k:"craft",a:[tt.COPPER_INGOT],n:3,r:{[v.COAL]:4}},{c:3,t:"Funkkristalle",d:"Funkkristalle leuchten tief unter der Erde. Sammle 3 Stück.",k:"have",a:[v.CRYSTAL],n:3,r:{[tt.IRON_INGOT]:2}},{c:4,t:"Der Funksender",d:"Baue an der Werkbank einen Funksender (2 Kupferbarren, 1 Funkkristall, 1 Radio) und setze ihn.",k:"place",a:[v.SENDER],n:1,r:{[v.WIRE]:8}},{c:4,t:"Strom drauf",d:"Setze einen Schalter direkt neben den Sender (oder verbinde beide mit Signalleitungen) und schalte ihn mit der Setzen-Taste ein.",k:"place",a:[v.SWITCH],n:1,r:{[tt.COPPER_INGOT]:2}},{c:4,t:"Relais",d:"Ein Funkrelais trägt das Signal 24 Blöcke weiter. Baue eins (Kupfer, Kristall, 2 Stein) und setze es höchstens 24 Blöcke vom Sender entfernt.",k:"place",a:[v.RELAY],n:1,r:{[v.CRYSTAL]:1,[tt.COPPER_INGOT]:1}},{c:4,t:"Die Verbindung",d:"Bringe einen Empfänger zum Leuchten, der mindestens 40 Blöcke vom eingeschalteten Sender entfernt steht (über das Relais).",k:"reach",n:40,r:{[tt.IRON_INGOT]:3}},{c:5,t:"Gerüstet",d:"Stelle an der Werkbank einen Helm oder Harnisch her und lege ihn an (wählen, Setzen drücken).",k:"craft",a:[tt.COPPER_HELMET,tt.COPPER_CHEST,tt.IRON_HELMET,tt.IRON_CHEST],n:1,r:{[tt.BREAD]:3}},{c:5,t:"Störsender",d:"Nachts fliegen Störsender-Drohnen. Hol eine vom Himmel.",k:"kill",a:[d1],n:1,r:{[v.CRYSTAL]:1}},{c:5,t:"Wesen der Tiefe",d:"In tiefen Höhlen hausen Höhlenwesen. Besiege 2 davon.",k:"kill",a:[p1],n:2,r:{[tt.IRON_INGOT]:2}},{c:5,t:"Maschinen",d:"Schalte mit deinem Netz 3 Maschinen gleichzeitig ein: Signallampen oder Funktore neben Leitungen oder Empfängern.",k:"powered",n:3,r:{[v.RAINBOW]:1}},{c:6,t:"Der Funkturm",d:"Baue einen Turm: Erreiche 20 Blöcke über deinem Startpunkt.",k:"height",n:20,r:{[v.RELAY]:1}},{c:6,t:"Großes Netz",d:"Lass 3 Empfänger gleichzeitig leuchten.",k:"net",n:3,r:{[v.RAINBOW]:1}},{c:6,t:"Die letzte Frequenz",d:"Setze einen Regenbogen-Block auf deinen Funkturm. Das Netz steht, das Rauschen verstummt.",k:"place",a:[v.RAINBOW],n:1,r:{[v.RAINBOW]:2}}],js=i=>i&&i.c==="rauschen"?Pd:Ld;function Dd(i,t){const e=i.story,n=i.sigStats||{receivers:0,machines:0,reach:0};if(t.k==="have"){let s=0;for(const r of t.a)s+=i.inv[r]||0;return[s,t.n]}return t.k==="height"?[Math.max(0,Math.floor(e.max)),t.n]:t.k==="net"?[n.receivers,t.n]:t.k==="powered"?[n.machines,t.n]:t.k==="reach"?[Math.floor(n.reach),t.n]:[Math.floor(e.p),t.n]}const g1=480,Lr=6,_1=`
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
}`,v1=`
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
}`,x1="varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }",M1=`
uniform vec3 uHor; uniform vec3 uZen; uniform vec3 uSunN; uniform vec3 uGlow; varying vec3 vDir;
void main(){
  float h = clamp(vDir.y, 0.0, 1.0);
  vec3 c = mix(uHor, uZen, pow(h, 0.5));
  c += uGlow * pow(max(dot(normalize(vDir), uSunN), 0.0), 6.0);
  gl_FragColor = vec4(c, 1.0);
}`,y1=`
uniform vec2 uOff; varying vec2 vUv; varying float vD;
void main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vUv = (wp.xz + uOff) / 520.0; vD = length(position.xy) / 1200.0; gl_Position = projectionMatrix * viewMatrix * wp; }`,S1=`
uniform sampler2D uTex; uniform vec3 uCol; varying vec2 vUv; varying float vD;
void main(){ float a = texture2D(uTex, vUv).a * (1.0 - smoothstep(0.45, 0.95, vD)) * 0.9; gl_FragColor = vec4(uCol, a); }`,Pl=(i,t,e)=>i+(t-i)*e;function E1(i){if(i===v.SNOW)return"schnee";if(i===v.GLASS||i===v.ICE)return"glas";if(i===v.SAND||i===v.GRAVEL)return"sand";const t=Yt[i]&&Yt[i].tool;return t==="axt"?"holz":t==="spitzhacke"?"stein":"weich"}const Ci=(i,t,e)=>[Pl(i[0],t[0],e),Pl(i[1],t[1],e),Pl(i[2],t[2],e)],qa=(i,t,e)=>{const n=Math.max(0,Math.min(1,(e-i)/(t-i)));return n*n*(3-2*n)};class b1{constructor(t,e,n="auto"){this.coarse=e;const s=window.devicePixelRatio||1;this.renderer=new _x({canvas:t,antialias:n!=="eco"&&!(e&&s>=2.5),powerPreference:"high-performance"}),this.maxDpr=e?1.75:2,this.dprScale=1,this.budget=e?4:6,this.maxView=e?4:7,this.autoQ=!1,this.cloudsOn=!0,this.perf={acc:0,n:0,good:0},this.fps=0,this.placeDelay=!0,this.scene=new vx,this.camera=new yn(e?70:75,1,.08,1500),this.camera.rotation.order="YXZ",this.scene.add(this.camera),this.group=new Fn,this.scene.add(this.group);const r=Math.min(8,this.renderer.capabilities.getMaxAnisotropy()),a=p=>{const x=new no(p);return x.magFilter=mn,x.minFilter=qn,x.anisotropy=r,x.generateMipmaps=!0,x};this.atlasCanvas=yM(),this.atlasTex=new yx(this.atlasCanvas.raw,this.atlasCanvas.width,this.atlasCanvas.height,bn),this.atlasTex.magFilter=mn,this.atlasTex.minFilter=qn,this.atlasTex.anisotropy=r,this.atlasTex.generateMipmaps=!0,this.atlasTex.needsUpdate=!0,this.logoCanvas=SM(()=>{this.logoTex.needsUpdate=!0,!this.running&&this.world&&this.render()},()=>this.onLogos()),this.logoTex=a(this.logoCanvas),this.onLogos=()=>{},this.uni={uAmb:{value:new U(.44,.5,.62)},uSunCol:{value:new U(.6,.57,.5)},uSunDir:{value:new U(0,1,.25).normalize()},uFog:{value:new U(.68,.84,.95)},uFogRange:{value:new Kt(40,90)},uTime:{value:0}};const o=(p,x,y,M)=>new Bn({vertexShader:_1,fragmentShader:v1,transparent:y,depthWrite:!y,side:y?Sn:ui,uniforms:{...M,uMap:{value:p},uCut:{value:x}}});this.matO=o(this.atlasTex,.5,!1,this.uni),this.matT=o(this.atlasTex,.02,!0,this.uni),this.matL=o(this.logoTex,.5,!1,this.uni),this.sky=new Fn,this.scene.add(this.sky),this.domeU={uHor:{value:new U},uZen:{value:new U},uSunN:{value:new U(1,0,0)},uGlow:{value:new U}};const l=new Re(new jc(700,20,12),new Bn({vertexShader:x1,fragmentShader:M1,uniforms:this.domeU,side:Qe,depthWrite:!1,depthTest:!1}));l.renderOrder=-20,l.frustumCulled=!1,this.sky.add(l);const c=(p,x)=>{const y=new Re(new cs(p,p),new Fi({color:x,fog:!1,depthWrite:!1}));return y.renderOrder=-10,this.sky.add(y),y};this.sun=c(80,16773808),this.moon=c(52,14674175);const h=new Float32Array(300*3);for(let p=0;p<300;p++){const x=Math.random()*2-1,y=Math.random()*Math.PI*2,M=Math.sqrt(1-x*x);h[p*3]=Math.cos(y)*M*600,h[p*3+1]=x*600,h[p*3+2]=Math.sin(y)*M*600}const u=new Ue;u.setAttribute("position",new Ne(h,3)),this.starMat=new nd({color:16777215,size:2,sizeAttenuation:!1,transparent:!0,opacity:0,fog:!1,depthWrite:!1}),this.stars=new Sx(u,this.starMat),this.stars.renderOrder=-15,this.sky.add(this.stars);const f=new no(EM());f.wrapS=f.wrapT=lo,f.minFilter=qn,f.magFilter=mn,this.cloudU={uTex:{value:f},uCol:{value:new U(1,1,1)},uOff:{value:new Kt}},this.clouds=new Re(new cs(2400,2400),new Bn({vertexShader:y1,fragmentShader:S1,uniforms:this.cloudU,transparent:!0,depthWrite:!1,side:Sn})),this.clouds.rotation.x=-Math.PI/2,this.clouds.frustumCulled=!1,this.chunkSphereR=Math.hypot(F/2,le/2,F/2)+1,this.scene.add(this.clouds);const d=new Ex(new Vi(1.004,1.004,1.004));this.hl=new Eu(d,new Ir({color:0,transparent:!0,opacity:.75})),this.hl.visible=!1,this.scene.add(this.hl),this.ghost=new Eu(d,new Ir({color:16777215,transparent:!0,opacity:.55,depthTest:!1})),this.ghost.visible=!1,this.ghost.renderOrder=40,this.scene.add(this.ghost),this.buildMode=0,this.anchor=null,this.clip=null,this.batch=null,this.preview=!0,this.beam=new bc(new Ue().setFromPoints([new U,new U]),new Ir({color:16722538})),this.beam.frustumCulled=!1,this.beam.visible=!1,this.beamT=0,this.scene.add(this.beam);const g={uAmb:{value:new U(.62,.64,.7)},uSunCol:{value:new U(.5,.46,.38)},uSunDir:{value:new U(.35,.8,.5).normalize()},uFog:{value:new U},uFogRange:{value:new Kt(1e5,2e5)},uTime:this.uni.uTime},_=p=>{const x=o(p,.5,!1,g);return x.depthTest=!1,x};this.handMatO=_(this.atlasTex),this.handMatL=_(this.logoTex),this.hand=new Re(new Ue,this.handMatO),this.hand.frustumCulled=!1,this.hand.renderOrder=50,this.hand.visible=!1,this.camera.add(this.hand),this.itemCanvas=bM(mo.map(p=>Te[p]));const m=new no(this.itemCanvas);if(m.magFilter=tn,m.minFilter=tn,m.generateMipmaps=!1,this.itemHand=new Re(new cs(1,1),new Fi({map:m,transparent:!0,alphaTest:.5,depthTest:!1,side:Sn})),this.itemHand.frustumCulled=!1,this.itemHand.renderOrder=50,this.itemHand.visible=!1,this.camera.add(this.itemHand),this.mobView=new CM(this.scene),this.mobs=null,this.light=1,this.vehView=new NM(this.scene),this.vehicles=null,this.ride=null,this.prevJump=!1,this.meshSeq=0,this.mwJobs=0,this.mw=null,typeof Worker<"u")try{this.mw=new Worker(new URL(""+new URL("meshworker-D6QDB5xl.js",import.meta.url).href,import.meta.url),{type:"module"}),this.mw.onmessage=p=>this.onMeshed(p.data),this.mw.onerror=()=>{this.mw=null,this.mwJobs=0,this.scanDirty=!0}}catch{this.mw=null}this.handType=-1,this.swing=0,this.bob=0,this.parts=[],this.partCount=0,this.rope=new bc(new Ue().setFromPoints([new U,new U]),new Ir({color:16769162})),this.rope.frustumCulled=!1,this.rope.visible=!1,this.scene.add(this.rope),this.hookT=0,this.hookTarget=new U,this.wp=null,this.timeFrozen=!1,this.radioT=0,this.player=new n1,this.input={f:0,r:0,jump:!1,down:!1,sprint:!1},this.breakHeld=!1,this.placeHeld=!1,this.actCool=0,this.world=null,this.running=!1,this.raf=0,this.last=0,this.viewDist=e?4:7,this.offsets=[],this.setViewDist(this.viewDist),this.onChange=()=>{},this.onToast=()=>{},this.story=null,this.onQuest=()=>{},this.onQuestDone=()=>{},this.vitals=null,this.dead=!1,this.mine=null,this.deathLoss="keep",this.enemies=!0,this.farm=new Yu,this.age=0,this.history=[],this.redoList=[],this.onVitals=()=>{},this.onHurt=()=>{},this.onDeath=()=>{},this.onMine=()=>{},this.onStation=()=>{},this.onTrade=()=>{},this.onBuildMode=()=>{},this.onRide=()=>{},this.mp=null,this.net=null,this.armor={kopf:0,brust:0},this.armWear={kopf:0,brust:0},this.resize()}setQuality(t,e){const n=Cc[t]||Cc.standard;this.qName=t,this.autoQ=!!e,this.maxDpr=n.dpr,this.dprScale=1,this.budget=n.budget,this.cloudsOn=n.clouds,this.maxView=n.view,this.perf.acc=this.perf.n=this.perf.good=0,this.menuMode?this.savedView=n.view:this.setViewDist(n.view),this.resize()}measure(t){const e=this.perf;if(t>250||(e.acc+=t,e.n++,e.acc<2e3))return;const n=e.acc/e.n;e.acc=e.n=0,this.fps=Math.round(1e3/n),!(!this.autoQ||this.menuMode)&&(n>26?(e.good=0,this.dprScale>.6?(this.dprScale=Math.max(.6,this.dprScale-.15),this.resize()):this.viewDist>3&&this.setViewDist(this.viewDist-1)):n<18&&++e.good>=3&&(e.good=0,this.dprScale<1?(this.dprScale=Math.min(1,this.dprScale+.1),this.resize()):this.viewDist<this.maxView&&this.setViewDist(this.viewDist+1)))}setViewDist(t){this.viewDist=t;const e=t+2,n=[];for(let s=-e-1;s<=e+1;s++)for(let r=-e-1;r<=e+1;r++){const a=Math.hypot(r,s);a<=e&&n.push([r,s,a])}n.sort((s,r)=>s[2]-r[2]),this.offsets=n,this.scanDirty=!0}resize(){const t=window.innerWidth,e=window.innerHeight;this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,this.maxDpr)*this.dprScale),this.renderer.setSize(t,e,!1),this.camera.aspect=t/e,this.camera.updateProjectionMatrix(),!this.running&&this.world&&this.render()}start(t){if(this.stop(),this.clearWorld(),this.leaveMenu(),this.gen=ud(t.gen),this.world=new Du(t.seed,Kx(t.edits),this.gen),this.name=t.name,this.seed=t.seed,this.mode=t.mode,this.time=t.time??.08,this.hotbar=Array.isArray(t.hotbar)&&t.hotbar.length===9?t.hotbar.map(s=>Number.isInteger(s)&&ku(s)?s:0):[1,2,3,4,5,6,7,8,9],this.sel=t.sel??0,this.inv=t.inv?{...t.inv}:{[v.DIRT]:20,[v.PLANKS]:10,[v.GLASS]:4},this.story=t.mode==="story"?t.story?{...t.story}:{i:0,p:0,max:0,done:!1,c:this.gen===3?"rauschen":void 0}:null,this.story&&!this.story.c&&delete this.story.c,this.sigStats={receivers:0,machines:0,reach:0,senders:0},this.sigRetry=!1,!t.inv&&t.mode==="survival"){for(let s=0;s<16;s++)this.inv[pi+s]=4;for(let s=0;s<id;s++)this.inv[Ac+s]=8}if(this.wp=t.wp||null,this.map=new HM(t.map),this.hookT=0,this.rope.visible=!1,this.timeFrozen=!1,this.handType=-1,this.survival=t.mode==="survival"||t.mode==="story"&&this.gen===3,this.vitals=this.survival?new ju(t.vit||{}):null,this.dead=!1,this.mine=null,this.player.impact=0,this.dur={},t.dur&&typeof t.dur=="object")for(const[s,r]of Object.entries(t.dur))Ii(Number(s))&&Number.isFinite(r)&&(this.dur[s]=r);this.armor={kopf:0,brust:0},this.armWear={kopf:0,brust:0},Array.isArray(t.arm)&&["kopf","brust"].forEach((s,r)=>{const a=Tr(t.arm[r]);a&&a.slot===s&&(this.armor[s]=t.arm[r],this.armWear[s]=Math.max(0,Math.min(a.dur-1,t.arm[r+2]|0)))}),this.buildMode=0,this.anchor=null,this.clip=null,this.batch=null;const e=t.grave;this.grave=e&&[e.x,e.y,e.z].every(Number.isFinite)&&e.inv&&typeof e.inv=="object"?e:null,this.mobs=new e1(this.world,t.seed,t.mobs,t.mode!=="story"||this.gen===3),this.gen===3&&(this.mobs.findVillages=(s,r)=>{const a=[],o=Tn(s),l=Tn(r);for(let c=-1;c<=1;c++)for(let h=-1;h<=1;h++){const u=aa(this.seed,o+h,l+c);u&&a.push(u)}return a}),this.mobs.onAdd=s=>this.mobView.add(s),this.mobs.onRemove=s=>this.mobView.remove(s),this.vehicles=new AM(this.world,t.veh),this.ride=null,this.prevJump=!1,this.vehicles.onAdd=s=>this.vehView.add(s),this.vehicles.onRemove=s=>this.vehView.remove(s),this.vehicles.attach(),this.mobs.onAttack=s=>this.mobHits(s),this.mobs.onPoof=s=>this.spawnBreak(s.x-.5,s.y+.5,s.z-.5,v.BASALT),this.age=Number.isFinite(t.age)&&t.age>=0?t.age:0,this.farm=new Yu(t.farm),this.farmT=0,this.history=[],this.redoList=[],this.spawn=this.world.findSpawn(t.mode!=="story"),this.spawnY=this.spawn.y;const n=this.player;t.px!==void 0?(n.x=t.px,n.y=t.py,n.z=t.pz,this.yaw=t.yaw||0,this.pitch=t.pitch||0):(n.x=this.spawn.x,n.y=this.spawn.y,n.z=this.spawn.z,this.yaw=0,this.pitch=-.1),n.vx=n.vy=n.vz=0,n.flying=!1,n.onGround=!1,this.target=null,this.unsaved=!1,this.loadAround(2,1),this.scanDirty=!0,this.lastPC=null,this.applyCamera(),this.updateSky(),this.resume()}startMenu(){this.stop(),this.clearWorld(),this.menuMode=!0,this.savedView=this.savedView??this.viewDist,this.setViewDist(Math.min(this.viewDist,4)),this.world=new Du(20241,new Map,1),this.mode="creative",this.time=.06,this.menuT=0,this.hotbar=new Array(9).fill(0),this.sel=0,this.inv={};const t=this.world.findSpawn(),e=this.player,n=this.world;e.x=t.x,e.z=t.z,e.y=t.y,e.flying=!1,e.vx=e.vy=e.vz=0,e.hook=!1,this.loadAround(3,2);const s=Math.floor(t.x),r=Math.floor(t.z),a=Math.floor(t.y)-1;for(let l=s-5;l<=s+5;l++)for(let c=r-5;c<=r+5;c++){for(let h=a+1;h<=a+9;h++)n.setBlock(l,h,c,v.AIR);n.setBlock(l,a,c,l+c&1?v.MARBLE:v.STONE)}for(let l=0;l<16;l++)n.setBlock(s-2+l%4,a+1,r-2+(l>>2),pi+l);const o=[v.NEON_R,v.NEON_B,v.NEON_G,v.NEON_P];[[-3,-3],[3,-3],[3,3],[-3,3]].forEach(([l,c],h)=>{for(let u=1;u<=4;u++)n.setBlock(s+l,a+u,r+c,o[h]);n.setBlock(s+l,a+5,r+c,v.RAINBOW)}),n.setBlock(s,a+2,r,v.RADIO);for(let l=3;l<=5;l++)n.setBlock(s,a+l,r,v.FEDER);n.setBlock(s,a+6,r,v.RAINBOW),this.menuC={x:s+.5,y:a+3,z:r+.5},this.flushDirty(),this.hand.visible=!1,this.hl.visible=!1,this.rope.visible=!1,this.scanDirty=!0,this.lastPC=null,this.menuStep(0),this.resume()}leaveMenu(){this.menuMode&&(this.menuMode=!1,this.savedView!=null&&(this.setViewDist(this.savedView),this.savedView=null))}menuStep(t){this.menuT+=t,this.time=(this.time+t/150)%1;const e=this.menuC,n=this.menuT*.07,s=15+Math.sin(this.menuT*.05)*2.5,r=4.5+Math.sin(this.menuT*.11)*1.5;this.camera.position.set(e.x+Math.cos(n)*s,e.y+r,e.z+Math.sin(n)*s),this.camera.lookAt(e.x,e.y-3.2,e.z),this.stream(),this.flushDirty(),this.uni.uTime.value=performance.now()/1e3,this.updateSky(),this.cloudU.uOff.value.x+=t*2.5}clearWorld(){for(const t of this.group.children.slice())t.geometry.dispose(),this.group.remove(t);this.mobs&&(this.mobs.clear(),this.mobs=null),this.mobView.clear(),this.vehicles&&(this.vehicles.clear(),this.vehicles=null),this.vehView.clear(),this.ride=null,this.vitals=null,this.dead=!1,this.world=null,this.mwJobs=0}loadAround(t,e){const n=Math.floor(this.player.x/F),s=Math.floor(this.player.z/F);for(let r=-t;r<=t;r++)for(let a=-t;a<=t;a++)this.world.ensure(n+a,s+r);for(let r=-e;r<=e;r++)for(let a=-e;a<=e;a++)this.applyMesh(this.world.getChunk(n+a,s+r))}serialize(){const t=this.player,e=pd(this.world.edits);return{v:dd,gen:this.gen,name:this.name,seed:this.seed,mode:this.mode,time:this.time,savedAt:Date.now(),px:t.x,py:t.y,pz:t.z,yaw:this.yaw,pitch:this.pitch,hotbar:this.hotbar,sel:this.sel,inv:this.inv,wp:this.wp,story:this.story,edits:e,vit:this.vitals?this.vitals.toJSON():void 0,dur:this.dur,grave:this.grave||void 0,mobs:this.mobs?this.mobs.serialize():void 0,age:Math.round(this.age),farm:this.farm.plants.size?this.farm.serialize():void 0,arm:this.armor.kopf||this.armor.brust?[this.armor.kopf,this.armor.brust,this.armWear.kopf,this.armWear.brust]:void 0,veh:this.vehicles&&this.vehicles.list.length?this.vehicles.serialize():void 0,map:this.map?this.map.serialize():void 0}}respawn(){const t=this.player;this.world.ensure(Math.floor(this.spawn.x/F),Math.floor(this.spawn.z/F)),t.x=this.spawn.x,t.y=this.spawn.y,t.z=this.spawn.z,t.vx=t.vy=t.vz=0,t.flying=!1,t.impact=0,this.hookT=0,this.rope.visible=!1,this.loadAround(1,0),this.scanDirty=!0,this.applyCamera(),this.running||this.render()}resume(){this.running||(this.running=!0,this.last=performance.now(),this.raf=requestAnimationFrame(t=>this.frame(t)))}stop(){this.running=!1,cancelAnimationFrame(this.raf),hf(0,0)}frame(t){if(!this.running||(this.raf=requestAnimationFrame(n=>this.frame(n)),this.menuMode&&t-this.last<32))return;this.measure(t-this.last);const e=Math.max(0,Math.min(.05,(t-this.last)/1e3));this.last=t,this.menuMode?this.menuStep(e):this.step(e),this.render()}step(t){const e=this.world,n=this.player;if(this.timeFrozen||(this.time=(this.time+t/g1)%1),this.uni.uTime.value=performance.now()/1e3,this.dead||(this.ride?this.rideStep():(this.updateHook(t),n.update(e,t,this.input,this.yaw),this.sounds(t)),n.bounces&&(this.questEvent("bounce",0,n.bounces),n.bounces=0),this.story&&n.gliding&&(this.glideAcc=(this.glideAcc||0)+t),this.vitals&&!n.waiting&&this.updateVitals(t)),this.vehicles&&this.vehicles.list.length){const o=-Math.sin(this.yaw),l=-Math.cos(this.yaw),c=Math.hypot(o,l)||1;this.vehicles.update(t,this.ride,this.ride&&!this.dead?{f:this.input.f,r:this.input.r,look:[o/c,l/c]}:null),this.ride&&this.seatPlayer(),this.vehView.update(n.x,n.z,this.light,this.viewDist*F,this.uni.uTime.value)}this.applyCamera(),this.stream();const s=this.time>.52&&this.time<.98;this.mobs&&(this.mobs.update(t,n.x,n.z,{py:n.y,night:s,time:this.time,hostiles:this.survival&&this.enemies&&!this.dead,others:this.mp?this.mp.others():null}),this.mobView.update(n.x,n.z,this.light,this.viewDist*F,this.uni.uTime.value)),this.mp&&this.mp.tick(t),this.dead||(this.age+=t),this.farmT-=t,this.farmT<=0&&(this.farmT=2,!this.net&&this.farm.update(this.world,this.age)&&(this.unsaved=!0));const r=this.camera,a=this.lookDir||(this.lookDir=new U);a.set(0,0,-1).applyEuler(r.rotation),this.target=this.dead?null:nf(e,r.position.x,r.position.y,r.position.z,a.x,a.y,a.z,Lr),this.target?(this.hl.position.set(this.target.x+.5,this.target.y+.5,this.target.z+.5),this.hl.visible=!0):this.hl.visible=!1,this.updateGhost(),this.beamT>0&&(this.beamT-=t)<=0&&(this.beam.visible=!1),this.actCool-=t,this.placeHeld&&!this.prevPlace&&(this.placeFirst=!0),this.prevPlace=this.placeHeld,this.breakHeld&&!this.dead?this.useBreak(t,a):(this.setMine(null),this.actCool<=0&&this.placeHeld&&!this.dead&&this.placeBlock()&&(this.actCool=this.placeFirst&&this.placeDelay?.45:.25,this.placeFirst=!1)),this.flushDirty(),this.updateSky(),this.cloudU.uOff.value.x+=t*2.5,this.radioT-=t,(this.world.sigDirty||this.sigRetry&&this.radioT<=0)&&this.updateSignals(),this.radioT<=0&&(this.radioT=.3,this.updateRadio(),this.questTick(),this.checkGrave(),(this.mapT=(this.mapT||0)+1)%4===0&&this.map&&(this.map.markAround(this.player.x,this.player.z,Math.min(this.viewDist,5)),this.map.syncRadios(this.world))),this.updateHand(t),this.partCount&&this.updateParticles(t)}sounds(t){const e=this.player,n=this.world;if(e.onGround&&!e.flying&&!e.inWater&&(this.stepAcc=(this.stepAcc||0)+Math.hypot(e.vx,e.vz)*t,this.stepAcc>2.1&&(this.stepAcc=0,i1(E1(n.getBlock(Math.floor(e.x),Math.floor(e.y-.05),Math.floor(e.z)))))),e.inWater&&!this.wasWater?rf(e.vy<-6):e.inWater&&(this.swimAcc=(this.swimAcc||0)+Math.hypot(e.vx,e.vz)*t)>2.5&&(this.swimAcc=0,rf(!1)),this.wasWater=e.inWater,this.mobs&&(this.callT=(this.callT??3)-t)<=0){this.callT=2.5+Math.random()*5;const s=this.mobs.list.filter(r=>Math.hypot(r.x-e.x,r.z-e.z)<20);if(s.length){const r=s[Math.floor(Math.random()*s.length)];s1(r.T.key,Math.hypot(r.x-e.x,r.y-e.y,r.z-e.z))}}}updateVitals(t){const e=this.vitals,n=this.player,s=[Math.ceil(e.hp),Math.ceil(e.food),Math.ceil(e.air)];let r=0;if(n.impact){const o=XM(n.impact);n.impact=0,o&&!n.inWater&&(e.hurt(o,"Sturz"),r+=o)}const a=n.onGround&&this.world.getBlock(Math.floor(n.x),Math.floor(n.y-.05),Math.floor(n.z))===v.MAGMA;if(r+=e.tick(t,{moving:Math.hypot(n.vx,n.vz)>.5,sprint:this.input.sprint,eyeWater:n.eyeWater,onMagma:a}),r>0&&(this.onHurt(r,e.cause),this.unsaved=!0,r>=1&&Ll()),e.dead){this.die(e.cause);return}(s[0]!==Math.ceil(e.hp)||s[1]!==Math.ceil(e.food)||s[2]!==Math.ceil(e.air))&&this.onVitals()}die(t){const e=this.player;this.ride&&this.dismount(),this.dead=!0,this.breakHeld=this.placeHeld=!1,this.hookT=0,this.rope.visible=!1,this.setMine(null),e.vx=e.vy=e.vz=0;const n={x:Math.round(e.x),y:Math.round(e.y),z:Math.round(e.z)};let s=!1;if(this.deathLoss==="grave"){const r={};for(const[a,o]of Object.entries(this.inv))o>0&&(r[a]=o);if(Object.keys(r).length){if(this.grave)for(const[a,o]of Object.entries(this.grave.inv))r[a]=Math.min(Xe,(r[a]||0)+o);this.grave={...n,inv:r},this.inv={},s=!0}}this.wp=n,this.unsaved=!0,this.onDeath(t,s)}revive(){this.dead&&(this.vitals=new ju,this.dead=!1,this.player.impact=0,this.respawn(),this.onVitals(),this.onChange())}checkGrave(){const t=this.grave,e=this.player;if(!(!t||this.dead||Math.hypot(t.x-e.x,t.y-e.y,t.z-e.z)>2.5)){for(const[n,s]of Object.entries(t.inv))ku(Number(n))&&(this.inv[n]=Math.min(Xe,(this.inv[n]||0)+s));this.wp&&this.wp.x===t.x&&this.wp.z===t.z&&(this.wp=null),this.grave=null,this.unsaved=!0,un(),this.onToast("Deine Sachen sind wieder da"),this.onChange()}}held(){const t=this.hotbar[this.sel];return t&&(this.mode==="creative"||this.inv[t]>0)?t:0}setMine(t){const e=!!this.mine;this.mine=t,(e||t)&&this.onMine(t?Math.min(1,t.t/t.need):0)}useBreak(t,e){if(this.actCool>0)return;const n=this.camera.position,s=this.target,r=this.mobs?this.mobs.raycast(n.x,n.y,n.z,e.x,e.y,e.z,Lr):null,a=this.vehHit(e);if(a&&(!s||a.t<s.t)&&(!r||a.t<r.t)){this.pickVehicle(a.veh),this.actCool=.45,this.setMine(null);return}if(r&&(!s||r.t<s.t)){this.attack(r.mob),this.actCool=.45,this.setMine(null);return}if(!this.survival){this.setMine(null),this.breakBlock()&&(this.actCool=.22);return}if(!s||s.y===0){this.setMine(null);return}const o=this.held();if(!sM(s.type,o)){fn(),this.onToast(`${Yr[s.type]} braucht eine ${Yt[s.type].tier>1?"Stein- oder bessere ":""}Spitzhacke`),this.actCool=.8,this.setMine(null);return}let l=this.mine;if((!l||l.x!==s.x||l.y!==s.y||l.z!==s.z||l.held!==o)&&(l={x:s.x,y:s.y,z:s.z,held:o,t:0,need:iM(s.type,o),sw:0}),l.t+=t,l.sw-=t,l.sw<=0&&(l.sw=.25,this.swing=1),l.t>=l.need){this.setMine(null),this.breakBlock()&&(this.actCool=.1);return}this.setMine(l)}attack(t){if(t.npc){this.onToast(`${t.name}: „He, nicht hauen! Lass uns lieber tauschen.“`),this.actCool=.8;return}const e=this.held(),n=Ii(e),s=this.player,r=this.mode==="creative"?99:n?n.kind==="schwert"?n.dmg:n.kind==="axt"?3:2:1;if(this.swing=1,Cl(),n&&n.kind==="schwert"&&this.wear(e),this.net){this.net.hit(t.id,Math.min(r,10)),t.hurtT=.35;return}if(!t.hit(r,s.x,s.z)||(this.spawnBreak(t.x-.5,t.y,t.z-.5,v.WOOL),this.mobs.remove(t,!1),this.unsaved=!0,this.questEvent("kill",t.type),this.mode==="creative"))return;const a=Rd(t.type).map(([o,l])=>(this.inv[o]=Math.min(Xe,(this.inv[o]||0)+l),`+${l} ${ge(o)}`));a.length&&this.onToast(a.join(" · ")),this.onChange()}mobHits(t){if(t.target&&this.mp){this.mp.hurtGuest(t);return}const e=this.vitals,n=this.player;if(!e||this.dead)return;const s=Math.hypot(n.x-t.x,n.z-t.z)||1;if(t.T.range){const a=this.beam.geometry.attributes.position;a.setXYZ(0,t.x,t.y+.3,t.z),a.setXYZ(1,n.x,n.y+1.2,n.z),a.needsUpdate=!0,this.beam.visible=!0,this.beamT=.15}else n.vx+=(n.x-t.x)/s*6,n.vz+=(n.z-t.z)/s*6,n.vy=Math.max(n.vy,5),n.onGround=!1;const r=t.T.dmg*Iu(this.armorPoints());this.wearArmor(),e.hurt(r,t.T.name),Ll(),this.onHurt(r,t.T.name),this.onVitals(),this.unsaved=!0,e.dead&&this.die(t.T.name)}remoteHurt(t){const e=this.vitals,n=this.player;if(!e||this.dead)return;const s=Array.isArray(t.from)&&t.from.slice(0,3).every(Number.isFinite)?t.from:null;if(s&&s[3]){const o=this.beam.geometry.attributes.position;o.setXYZ(0,s[0],s[1],s[2]),o.setXYZ(1,n.x,n.y+1.2,n.z),o.needsUpdate=!0,this.beam.visible=!0,this.beamT=.15}else if(s){const o=Math.hypot(n.x-s[0],n.z-s[2])||1;n.vx+=(n.x-s[0])/o*6,n.vz+=(n.z-s[2])/o*6,n.vy=Math.max(n.vy,5),n.onGround=!1}const r=typeof t.cause=="string"?t.cause.slice(0,30):"Gegner",a=Math.min(10,t.dmg)*Iu(this.armorPoints());this.wearArmor(),e.hurt(a,r),Ll(),this.onHurt(a,r),this.onVitals(),e.dead&&this.die(r)}record(t,e,n,s,r){if(this.net&&this.net.local(t,e,n,s,r),this.mode==="creative"){if(this.batch){this.batch.push([t,e,n,s,r]);return}this.history.push([[t,e,n,s,r]]),this.history.length>100&&this.history.shift(),this.redoList.length=0}}beginBatch(){this.batch=[]}endBatch(){const t=this.batch;this.batch=null,t&&t.length&&(this.history.push(t),this.history.length>100&&this.history.shift(),this.redoList.length=0)}undo(t=!1){if(this.mode!=="creative")return this.onToast("Rückgängig gibt es im Kreativmodus"),!1;const e=t?this.redoList:this.history,n=t?this.history:this.redoList,s=e.pop();if(!s)return this.onToast(t?"Nichts zum Wiederholen":"Nichts zum Rückgängigmachen"),!1;const r=t?s:s.slice().reverse();for(const[a,o,l,c,h]of r){this.world.ensure(a>>4,l>>4);const u=t?c:h,f=t?h:c;this.world.setBlock(a,o,l,f)&&this.net&&this.net.local(a,o,l,u,f)}return n.push(s),this.unsaved=!0,un(),this.running||(this.flushDirty(),this.render()),!0}hoe(t){const e=this.target;return!e||![v.GRASS,v.DIRT,v.FLOWERS,v.MYCEL].includes(e.type)||this.world.getBlock(e.x,e.y+1,e.z)!==v.AIR||!this.world.setBlock(e.x,e.y,e.z,v.FARMLAND)?!1:(this.record(e.x,e.y,e.z,e.type,v.FARMLAND),this.wear(t),this.swing=1,un(),this.unsaved=!0,this.onChange(),!0)}sow(t){const e=this.target;return!e||e.type!==v.FARMLAND||this.world.getBlock(e.x,e.y+1,e.z)!==v.AIR?(this.onToast("Samen brauchen Ackerboden (Hacke auf Gras oder Erde)"),this.actCool=.6,!1):this.mode!=="creative"&&!(this.inv[t]>0)?(fn(),this.onToast(`Keine ${ge(t)} im Vorrat`),this.actCool=.4,!1):this.farm.plant(e.x,e.y+1,e.z,this.age)?(this.world.setBlock(e.x,e.y+1,e.z,Sl(t)),this.record(e.x,e.y+1,e.z,v.AIR,Sl(t)),this.mode!=="creative"&&this.inv[t]--,this.swing=1,un(),this.unsaved=!0,this.onChange(),!0):(this.onToast("Zu viele Pflanzen in dieser Welt"),!1)}eat(t){return this.vitals?this.inv[t]>0?this.vitals.eat(Uu(t))?(this.inv[t]--,this.swing=1,un(),this.unsaved=!0,this.onChange(),this.onVitals(),!0):(this.onToast("Du bist satt"),this.actCool=.6,!1):(fn(),this.onToast(`Kein ${ge(t)} im Vorrat`),this.actCool=.4,!1):(this.onToast("Essen braucht man nur im Überlebensmodus"),this.actCool=.6,!1)}wear(t){const e=Ii(t);if(!e||this.mode==="creative")return;const n=(this.dur[t]||0)+1;if(n<e.dur){this.dur[t]=n;return}delete this.dur[t],this.inv[t]=Math.max(0,(this.inv[t]||0)-1),fn(),this.onToast(`${ge(t)} ist zerbrochen`)}stationsNear(t=4){const e=new Set,n=this.player,s=this.world;if(!s)return e;const r=Math.floor(n.x),a=Math.floor(n.y),o=Math.floor(n.z);for(let l=a-2;l<=a+3;l++)for(let c=o-t;c<=o+t;c++)for(let h=r-t;h<=r+t;h++){const u=Yt[s.getBlock(h,l,c)];u&&u.station&&e.add(u.station)}return e}updateSignals(){const t=this.world,e=this.player,n=zx(t.sig);let s=!1;this.sigStats=n,this.sigRetry=!1;for(const[r,a]of t.sig){const o=a[3],l=Ux[o]??o;if(!Pu[l])continue;const c=n.on.has(r)?Pu[l]:l;if(c===o)continue;if(c===v.GATE&&e.x+.3>a[0]&&e.x-.3<a[0]+1&&e.z+.3>a[2]&&e.z-.3<a[2]+1&&e.y+1.8>a[1]&&e.y<a[1]+1){this.sigRetry=!0;continue}t.setBlock(a[0],a[1],a[2],c),Math.hypot(a[0]-e.x,a[1]-e.y,a[2]-e.z)<24&&!s&&(s=!0,(l===v.GATE?a1:o1)())}t.sigDirty=!1,n.capped&&this.onToast("Signalnetz zu groß: nicht alles wird berechnet")}fireHook(){if(!this.running||this.ride)return;const t=this.camera,e=new U(0,0,-1).applyEuler(t.rotation),n=nf(this.world,t.position.x,t.position.y,t.position.z,e.x,e.y,e.z,40);if(!n){fn(),this.onToast("Seilhaken: kein Ziel in Reichweite");return}this.hookTarget.set(n.x+.5+n.nx*.9,n.y+.5+n.ny*.9,n.z+.5+n.nz*.9),this.hookT=1.6,un(),this.questEvent("hook",0)}updateHook(t){const e=this.player;if(e.hook=!1,this.hookT<=0){this.rope.visible=!1;return}this.hookT-=t;const n=this.hookTarget,s=n.x-e.x,r=n.y-(e.y+Rl),a=n.z-e.z,o=Math.hypot(s,r,a);if(o<2||this.hookT<=0){this.hookT=0,this.rope.visible=!1,e.vx*=.6,e.vz*=.6,e.vy=Math.max(e.vy*.6,3);return}const l=24/o;e.vx=s*l,e.vy=r*l,e.vz=a*l,e.hook=!0;const c=this.rope.geometry.attributes.position;c.setXYZ(0,e.x+.3,e.y+Rl-.35,e.z),c.setXYZ(1,n.x,n.y,n.z),c.needsUpdate=!0,this.rope.visible=!0}toggleWaypoint(){const t=this.player;this.wp&&Math.hypot(this.wp.x-t.x,this.wp.z-t.z)<4?(this.wp=null,this.onToast("Wegpunkt entfernt")):(this.wp={x:Math.round(t.x),y:Math.round(t.y),z:Math.round(t.z)},this.onToast("Wegpunkt gesetzt")),this.unsaved=!0}updateRadio(){const t=this.player;let e=1e9,n=0;for(const s of this.world.radios.values()){const r=Math.hypot(s[0]+.5-t.x,s[1]+.5-(t.y+1),s[2]+.5-t.z);r<e&&(e=r,n=s[0]*7+s[2]*13+s[1]>>>0)}this.radioDist=e,hf(e<24?Math.pow(1-e/24,1.5):0,n)}questTick(){const t=this.story;if(!t||t.done)return;const e=js(t)[t.i];e.k==="height"&&(t.max=Math.max(t.max,this.player.y-this.spawnY)),e.k==="glide"&&this.glideAcc&&(t.p+=this.glideAcc),e.k==="depth"&&this.player.y<e.y&&(t.p=1),e.k==="visit"&&this.world.villageAt(this.player.x,this.player.z)&&(t.p=1),this.glideAcc=0,this.questCheck()}questEvent(t,e,n=1){const s=this.story;if(!s||s.done)return;const r=js(s)[s.i];if(r.k==="have"){this.questCheck();return}r.k!==t||r.a&&!r.a.includes(e)||(s.p+=n,this.questCheck())}questCheck(){const t=this.story,e=js(t);for(let n=0;t&&!t.done&&n<e.length;n++){const s=e[t.i],[r,a]=Dd(this,s);if(r<a)break;for(const[o,l]of Object.entries(s.r||{}))this.inv[o]=Math.min(Xe,(this.inv[o]||0)+l);if(t.i++,t.p=0,t.max=0,t.i>=e.length)t.done=!0;else if(e[t.i].k==="visit"){const o=cd(this.seed,this.player.x,this.player.z);o&&(this.wp={x:o.x,y:o.y+1,z:o.z})}this.unsaved=!0,l1(),this.onQuestDone(s,t.done),this.onChange()}this.onQuest()}updateHand(t){const e=this.hotbar[this.sel];if(e!==this.handType){if(this.handType=e,this.hand.visible=e>0&&!Di(e),this.itemHand.visible=Di(e)&&!!Te[e],this.itemHand.visible){const a=Te[e].icon,o=this.itemCanvas.height/kr,l=a%Ni/Ni,c=l+1/Ni,h=1-Math.floor(a/Ni)/o,u=h-1/o,f=this.itemHand.geometry.attributes.uv;f.setXY(0,l,h),f.setXY(1,c,h),f.setXY(2,l,u),f.setXY(3,c,u),f.needsUpdate=!0}if(this.hand.visible){const a=xM(e),o=new Ue;o.setAttribute("position",new Ne(a.pos,3)),o.setAttribute("uv",new Ne(a.uv,2)),o.setAttribute("aCol",new Ne(a.col,4)),o.setIndex(new Ne(a.idx,1)),this.hand.geometry.dispose(),this.hand.geometry=o,this.hand.material=wo(e)?this.handMatL:this.handMatO}}const n=this.player,s=Math.hypot(n.vx,n.vz)>.5&&n.onGround;if(this.ride){this.hand.visible=this.itemHand.visible=!1,this.handType=-1;return}s&&(this.bob+=t*9),this.swing=Math.max(0,this.swing-t*4.5);const r=Math.sin(this.swing*Math.PI);this.hand.scale.setScalar(.12),this.hand.position.set(.34-r*.06,-.27+Math.sin(this.bob)*.008-r*.06,-.55-r*.04),this.hand.rotation.set(.25-r*.7,-.62,.06),this.itemHand.visible&&(this.itemHand.scale.setScalar(.3),this.itemHand.position.set(.36-r*.05,-.24+Math.sin(this.bob)*.008-r*.05,-.55),this.itemHand.rotation.set(-r*.9,-.35,.2+r*.4))}spawnBreak(t,e,n,s){const r=Yt[s]?Yt[s].color:14540253;for(let a=0;a<10;a++){this.partIdx=((this.partIdx||0)+1)%24;let o=this.parts[this.partIdx];o||(o=new Re(this.partGeo||(this.partGeo=new Vi(1,1,1)),new Fi({color:r})),o.userData={life:0},this.scene.add(o),this.parts[this.partIdx]=o),o.userData.life||this.partCount++,o.material.color.setHex(r),o.position.set(t+.2+Math.random()*.6,e+.2+Math.random()*.6,n+.2+Math.random()*.6),o.userData={life:.55+Math.random()*.3,v:new U((Math.random()-.5)*3,Math.random()*3+1,(Math.random()-.5)*3)},o.scale.setScalar(.1+Math.random()*.08),o.visible=!0}}updateParticles(t){for(const e of this.parts){if(!e||!e.userData.life)continue;const n=e.userData;n.life-=t,n.v.y-=14*t,e.position.addScaledVector(n.v,t),n.life<=0&&(n.life=0,e.visible=!1,this.partCount--)}}applyCamera(){const t=this.player,e=this.camera;e.position.set(t.x,t.y+Rl,t.z),e.rotation.set(this.pitch,this.yaw,0)}breakBlock(){const t=this.target;if(!t||t.y===0)return!1;if(this.world.setBlock(t.x,t.y,t.z,v.AIR)){this.record(t.x,t.y,t.z,t.type,v.AIR);const e=(n,s)=>{this.inv[n]=Math.min(Xe,(this.inv[n]||0)+s)};if(wd(t.type)){if(this.farm.remove(t.x,t.y,t.z),this.mode!=="creative"){const n=WM(t.type);n.forEach(([s,r])=>e(s,r)),this.onToast(n.map(([s,r])=>`+${r} ${ge(s)}`).join(" · "))}}else this.mode!=="creative"&&e(Yt[t.type].drop||(t.type===v.FARMLAND?v.DIRT:t.type),1);if(this.mode!=="creative"&&(t.type===v.GRASS||t.type===v.FLOWERS)&&Math.random()<.12&&(e(tt.SEEDS,1),this.onToast("+1 Weizensamen")),this.survival){const n=this.held();rM(t.type,n)&&this.wear(n),(t.type===v.LEAVES||t.type===v.JLEAVES)&&Math.random()<.08&&(this.inv[tt.APPLE]=Math.min(Xe,(this.inv[tt.APPLE]||0)+1),this.onToast("+1 Apfel"))}return this.unsaved=!0,this.swing=1,this.spawnBreak(t.x,t.y,t.z,t.type),Cl(),this.onChange(),this.questEvent("break",t.type),!0}return!1}placeBlock(){const t=this.target,e=this.hotbar[this.sel],n=this.camera.position,s=this.lookDir,r=this.mobs&&s?this.mobs.raycast(n.x,n.y,n.z,s.x,s.y,s.z,Lr):null;if(r&&r.mob.npc&&(!t||r.t<t.t))return this.onTrade(r.mob),this.questEvent("talk",0),this.actCool=.5,!1;const a=s?this.vehHit(s):null;if(a&&(!t||a.t<t.t)&&!this.ride)return this.placeFirst&&this.mount(a.veh),!1;if(e&&Nu(e))return this.placeVehicle(e);if(t&&(t.type===v.SWITCH||t.type===v.SWITCH_ON)){if(!this.placeFirst)return!1;const g=t.type===v.SWITCH?v.SWITCH_ON:v.SWITCH;return this.world.setBlock(t.x,t.y,t.z,g)&&(this.record(t.x,t.y,t.z,t.type,g),this.swing=1,r1(),this.unsaved=!0,this.onToast(g===v.SWITCH_ON?"Schalter an":"Schalter aus")),!0}if(t&&this.mode!=="creative"&&Yt[t.type]&&Yt[t.type].station)return this.onStation(Yt[t.type].station),this.actCool=.5,!1;if(e&&Tr(e))return this.equip(e);if(e&&Di(e)){const g=this.held(),_=Ii(g);return _&&_.kind==="hacke"?this.hoe(g):Sl(e)?this.sow(e):Uu(e)?this.eat(e):!1}const o=wr[this.buildMode];if(o.key!=="einzeln")return this.buildClick(o,t,e);if(!t||!e)return!1;if(this.mode!=="creative"&&!(this.inv[e]>0))return fn(),this.onToast(`Kein ${Yr[e]} im Vorrat`),this.actCool=.4,!1;const l=t.x+t.nx,c=t.y+t.ny,h=t.z+t.nz;if(c<0||c>=le)return!1;const u=this.world.getBlock(l,c,h);if(u!==v.AIR&&u!==v.WATER)return!1;const f=this.player,d=.3;return f.x+d>l&&f.x-d<l+1&&f.z+d>h&&f.z-d<h+1&&f.y+1.8>c&&f.y<c+1||!this.world.setBlock(l,c,h,e)?!1:(this.record(l,c,h,u,e),this.mode!=="creative"&&this.inv[e]--,this.unsaved=!0,this.swing=1,un(),this.onChange(),this.questEvent("place",e),!0)}selectSlot(t){this.sel=(t%9+9)%9,this.onChange()}cycleBuild(t=1){const e=wr.map((s,r)=>r).filter(s=>!wr[s].creative||this.mode==="creative"),n=Math.max(0,e.indexOf(this.buildMode));this.buildMode=e[(n+t+e.length)%e.length],this.anchor=null,this.onBuildMode(wr[this.buildMode])}buildClick(t,e,n){if(!this.placeFirst)return!1;if(t.creative&&this.mode!=="creative")return this.onToast(`${t.name} gibt es im Kreativmodus`),!0;if(t.key==="einfuegen")return this.clip?e?this.applyCells(zM(this.clip,[e.x+e.nx,e.y+e.ny,e.z+e.nz]),"Eingefügt",!0):!1:(this.onToast("Erst mit „Kopieren“ zwei Ecken wählen"),!0);if(!e)return!1;const s=t.key==="kopieren"?[e.x,e.y,e.z]:[e.x+e.nx,e.y+e.ny,e.z+e.nz];if(!this.anchor)return this.anchor=s,this.onToast(`${t.name}: erste Ecke gesetzt, jetzt die zweite wählen`),un(),!0;const r=this.anchor;if(this.anchor=null,t.key==="kopieren"){const l=OM(this.world,r,s);return l?(this.clip=l,un(),this.onToast(`${l.n} Blöcke kopiert (${l.sx}×${l.sy}×${l.sz}), jetzt „Einfügen“ wählen`),!0):(fn(),this.onToast("Zu groß zum Kopieren (höchstens 32 768 Blöcke)"),!0)}if(!n||Di(n))return this.onToast("Wähle einen Block in der Hotbar"),!0;const a=this.mode==="creative"?Pc.creative:Pc.survival,o=kM(t.key,r,s,a);return o?this.applyCells(o.map(l=>[l[0],l[1],l[2],n]),t.name,!1):(fn(),this.onToast(`Zu groß: höchstens ${a} Blöcke auf einmal`),!0)}applyCells(t,e,n){const s=this.mode==="creative",r=this.player,a=.3;let o=0,l=!1;this.beginBatch();for(const[c,h,u,f]of t){if(h<=0||h>=le)continue;if(!s&&!(this.inv[f]>0)){l=!0;continue}const d=this.world.getBlock(c,h,u);d===f||!(n&&s)&&d!==v.AIR&&d!==v.WATER||Yt[f].solid&&r.x+a>c&&r.x-a<c+1&&r.z+a>u&&r.z-a<u+1&&r.y+1.8>h&&r.y<h+1||this.world.setBlock(c,h,u,f)&&(this.record(c,h,u,d,f),s||this.inv[f]--,o++,this.questEvent("place",f))}return this.endBatch(),o&&(this.unsaved=!0,this.swing=1,un(),this.onChange()),this.onToast(o?`${e}: ${o} Blöcke${l?" (Vorrat reichte nicht)":""}`:l?"Nicht genug im Vorrat":"Nichts zu setzen"),!0}updateGhost(){const t=this.ghost,e=this.target,n=wr[this.buildMode],s=this.hotbar[this.sel];let r=null;if(e&&!this.dead&&(this.preview||n.key!=="einzeln")){const a=[e.x+e.nx,e.y+e.ny,e.z+e.nz];if(n.key==="einfuegen")this.clip&&(r=[...a,a[0]+this.clip.sx-1,a[1]+this.clip.sy-1,a[2]+this.clip.sz-1]);else if(n.key==="kopieren"){const o=[e.x,e.y,e.z];r=this.anchor?Dc(this.anchor,o):[...o,...o]}else s&&!Di(s)&&!(this.mode!=="creative"&&Yt[e.type]&&Yt[e.type].station)&&(r=this.anchor?Dc(this.anchor,a):[...a,...a])}if(!r){t.visible=!1;return}t.position.set((r[0]+r[3]+1)/2,(r[1]+r[4]+1)/2,(r[2]+r[5]+1)/2),t.scale.set(r[3]-r[0]+1,r[4]-r[1]+1,r[5]-r[2]+1),t.visible=!0}vehHit(t){if(!this.vehicles||!this.vehicles.list.length)return null;const e=this.camera.position,n=this.vehicles.raycast(e.x,e.y,e.z,t.x,t.y,t.z,Lr);return n&&n.veh!==this.ride?n:null}placeVehicle(t){if(!this.placeFirst)return!1;const e=Nu(t),n=go[e],s=this.target,r=this.lookDir,a=this.camera.position;if(this.mode!=="creative"&&!(this.inv[t]>0))return fn(),this.onToast(`Kein ${n.name} im Vorrat`),!1;let o=null;if(e==="boot"){for(let c=.5;c<=Lr&&!o;c+=.25){const h=Math.floor(a.x+r.x*c),u=Math.floor(a.y+r.y*c),f=Math.floor(a.z+r.z*c);if(s&&c>s.t)break;if(this.world.getBlock(h,u,f)===v.WATER){const d=this.vehicles.waterTop(h+.5,u,f+.5);d!==null&&(o=[h+.5,d-.3,f+.5])}}!o&&s&&s.ny===1&&(o=[s.x+.5,s.y+1.001,s.z+.5])}else s&&s.type===v.RAIL?o=[s.x+.5,s.y,s.z+.5]:s&&s.ny===1&&this.world.getBlock(s.x,s.y+1,s.z)===v.RAIL&&(o=[s.x+.5,s.y+1,s.z+.5]);return o?this.vehicles.boxHits({K:n},o[0],o[1]+.05,o[2])?(fn(),this.onToast("Kein Platz für das Fahrzeug"),!1):this.vehicles.add(e,o[0],o[1],o[2],this.yaw)?(this.mode!=="creative"&&this.inv[t]--,this.swing=1,un(),this.unsaved=!0,this.onChange(),this.onToast(`${n.name} gesetzt · Setzen = einsteigen, Abbauen = einpacken`),!0):(fn(),this.onToast(e==="lore"?"Die Lore braucht eine Schiene":"Zu viele Fahrzeuge in dieser Welt"),!1):(fn(),this.onToast(e==="boot"?"Boot: aufs Wasser oder auf den Boden zielen":"Die Lore braucht eine Schiene"),this.actCool=.5,!1)}pickVehicle(t){this.vehicles.remove(t),this.spawnBreak(t.x-.5,t.y,t.z-.5,t.kind==="boot"?v.PLANKS:v.STONE),Cl(),this.mode!=="creative"&&(this.inv[t.K.item]=Math.min(Xe,(this.inv[t.K.item]||0)+1),this.onToast(`+1 ${t.K.name}`)),this.unsaved=!0,this.onChange()}mount(t){const e=this.player;this.ride=t,t.rider=!0,e.flying=!1,e.vx=e.vy=e.vz=0,e.eyeWater=!1,e.impact=0,this.hookT=0,this.rope.visible=!1,this.prevJump=!0,t.kind==="lore"&&(this.yaw=t.yaw),this.seatPlayer(),un(),this.onToast(t.kind==="boot"?"Im Boot: vor/zurück = paddeln, links/rechts = lenken, Springen = aussteigen":"In der Lore: vor = anschieben (in Blickrichtung), zurück = bremsen, Springen = aussteigen"),this.onRide(!0)}dismount(){const t=this.ride,e=this.player;if(!t)return;this.ride=null,t.rider=!1;const[n,s,r]=this.vehicles.exitSpot(t,(a,o,l)=>e.collides(this.world,a,o,l));e.x=n,e.y=s,e.z=r,e.vx=e.vy=e.vz=0,e.onGround=!1,this.onRide(!1)}seatPlayer(){const t=this.ride,e=this.player;e.x=t.x,e.y=t.y+t.K.seat-.4,e.z=t.z}rideStep(){const t=this.input.jump;t&&!this.prevJump&&this.dismount(),this.prevJump=t}equip(t){const e=Tr(t),n=this.mode==="creative";if(!n&&!(this.inv[t]>0))return fn(),this.onToast(`Kein ${ge(t)} im Vorrat`),this.actCool=.4,!1;const s=this.armor[e.slot];return s===t?(this.onToast(`${ge(t)} trägst du schon`),this.actCool=.6,!1):(n||(this.inv[t]--,s&&(this.inv[s]=Math.min(Xe,(this.inv[s]||0)+1))),this.armor[e.slot]=t,this.armWear[e.slot]=0,this.swing=1,un(),this.unsaved=!0,this.onToast(`${ge(t)} angelegt · Schutz ${this.armorPoints()*5} %`),this.onChange(),this.onVitals(),!0)}armorPoints(){let t=0;for(const e of["kopf","brust"]){const n=Tr(this.armor[e]);n&&(t+=n.pts)}return t}wearArmor(){if(this.mode!=="creative")for(const t of["kopf","brust"]){const e=this.armor[t],n=Tr(e);n&&++this.armWear[t]>=n.dur&&(this.armor[t]=0,this.armWear[t]=0,this.onToast(`${ge(e)} ist zerbrochen`))}}areaReady(t){const e=Math.floor(this.player.x/F),n=Math.floor(this.player.z/F);let s=0,r=0;for(const[a,o,l]of this.offsets){if(l>t)continue;s++;const c=this.world.getChunk(e+a,n+o);c&&c.meshed&&r++}return s?r/s:1}stream(){const t=Math.floor(this.player.x/F),e=Math.floor(this.player.z/F);if(!this.lastPC||this.lastPC[0]!==t||this.lastPC[1]!==e){this.lastPC=[t,e],this.scanDirty=!0;const h=this.viewDist+3.5;for(const[u,f]of this.world.chunks)Math.hypot(f.cx-t,f.cz-e)>h&&(this.dropMesh(f),this.world.chunks.delete(u))}if(!this.scanDirty)return;const s=performance.now(),r=this.viewDist+.5,a=-Math.sin(this.yaw),o=-Math.cos(this.yaw);let l=!1,c=0;t:for(let h=0;h<2;h++)for(const[u,f,d]of this.offsets){const g=d<2.5||u*a+f*o>-.3*d;if(h===0!==g)continue;let _=this.world.getChunk(t+u,e+f);const m=d<=r&&(!_||!_.meshed);if(!(_&&!m)){if(c>0&&performance.now()-s>this.budget){l=!0;break t}if(_||(_=this.world.ensure(t+u,e+f),c++,l=!0),m){const p=this.requestMesh(_);p===!0?(c++,l=!0):p==="wait"&&(l=!0)}}}l||(this.scanDirty=!1)}flushDirty(){const t=this.world;if(t.dirty.size){for(const e of t.dirty)e.meshed&&t.chunks.get(e.key)===e&&this.applyMesh(e);t.dirty.clear()}}dropMesh(t){for(const e of["opaque","trans","logo"])t[e]&&(this.group.remove(t[e]),t[e].geometry.dispose(),t[e]=null)}requestMesh(t){if(!this.mw)return this.applyMesh(t);if(t.pending||this.mwJobs>=4)return"wait";const e=Ad(this.world,t);if(!e)return!1;const n=e.nb.map(r=>r.slice()),s=e.hms.map(r=>r.slice());return t.pending=t.ver=++this.meshSeq,this.mwJobs++,this.mw.postMessage({key:t.key,ver:t.ver,nb:n,hms:s,maxY:e.maxY},n.map(r=>r.buffer)),!0}onMeshed({key:t,ver:e,r:n}){this.mwJobs=Math.max(0,this.mwJobs-1);const s=this.world&&this.world.chunks.get(t);!s||s.ver!==e||s.pending!==e||(s.pending=0,this.setPart(s,"opaque",n.opaque,this.matO),this.setPart(s,"trans",n.trans,this.matT),this.setPart(s,"logo",n.logo,this.matL),s.meshed=!0,this.scanDirty=!0,!this.running&&this.world&&this.render())}applyMesh(t){const e=pM(this.world,t);return e?(t.ver=++this.meshSeq,t.pending=0,this.setPart(t,"opaque",e.opaque,this.matO),this.setPart(t,"trans",e.trans,this.matT),this.setPart(t,"logo",e.logo,this.matL),t.meshed=!0,!0):!1}setPart(t,e,n,s){let r=t[e];if(!n){r&&(this.group.remove(r),r.geometry.dispose(),t[e]=null);return}const a=new Ue;if(a.setAttribute("position",new Ne(n.pos,3)),a.setAttribute("uv",new Ne(n.uv,2)),a.setAttribute("aCol",new Ne(n.col,4)),a.setIndex(new Ne(n.idx,1)),a.boundingSphere=new lr(new U(F/2,le/2,F/2),this.chunkSphereR),r){r.geometry.dispose(),r.geometry=a;return}r=new Re(a,s),r.position.set(t.cx*F,0,t.cz*F),r.matrixAutoUpdate=!1,r.updateMatrix(),this.group.add(r),t[e]=r}updateSky(){const t=this.time*Math.PI*2,e=Math.sin(t),n=Math.cos(t),s=qa(-.12,.28,e),r=Math.max(0,1-Math.abs(e)/.3);let a=Ci([.04,.06,.14],[.68,.84,.95],s);a=Ci(a,[.97,.56,.36],r*.55);let o=Ci([.012,.02,.07],[.24,.5,.88],s);o=Ci(o,[.34,.3,.52],r*.4);const l=e>=0,c=l?qa(-.02,.3,e):qa(-.02,.3,-e)*.3,h=this.uni.uSunDir.value;l?h.set(n,e,.25):h.set(-n,-e,.25),h.normalize();const u=l?Ci([1,.6,.36],[1,.96,.86],qa(0,.4,e)).map(x=>x*.62*c):[.42*c,.52*c,.85*c];this.uni.uSunCol.value.set(u[0],u[1],u[2]);const f=Ci([.17,.21,.36],[.44,.5,.62],s);this.light=.38+.62*s,this.uni.uAmb.value.set(f[0]+r*.12,f[1]+r*.06,f[2]+r*.02);const d=this.camera.position,g=this.world.getBlock(Math.floor(d.x),Math.floor(d.y),Math.floor(d.z))===v.WATER;this.underwater=g;const _=this.viewDist*F-6;if(g){const x=Ci([.04,.12,.26],[.12,.38,.66],s);this.uni.uFog.value.set(x[0],x[1],x[2]),this.uni.uFogRange.value.set(.5,24),this.domeU.uHor.value.set(x[0],x[1],x[2]),this.domeU.uZen.value.set(x[0],x[1],x[2]),this.domeU.uGlow.value.set(0,0,0)}else{this.uni.uFog.value.set(a[0],a[1],a[2]),this.uni.uFogRange.value.set(_*.4,_),this.domeU.uHor.value.set(a[0],a[1],a[2]),this.domeU.uZen.value.set(o[0],o[1],o[2]);const x=.9*r+.1*s;this.domeU.uGlow.value.set(.95*x,.62*x,.4*x)}this.domeU.uSunN.value.set(n,e,.25).normalize(),this.sky.position.copy(d);const m=this.domeU.uSunN.value;this.sun.position.copy(m).multiplyScalar(500),this.sun.lookAt(d),this.moon.position.copy(m).multiplyScalar(-500),this.moon.lookAt(d),this.sun.visible=e>-.25&&!g,this.moon.visible=e<.25&&!g,this.starMat.opacity=Math.max(0,Math.min(1,(.12-e)*3))*(g?0:1),this.stars.rotation.z=t,this.clouds.position.set(d.x,105,d.z),this.clouds.visible=!g&&this.cloudsOn;const p=Ci([.2,.23,.36],[1,1,1],s);this.cloudU.uCol.value.set(p[0]+r*0,p[1]-r*.18,p[2]-r*.3)}render(){this.renderer.render(this.scene,this.camera)}biomeName(){const t=this.world?this.world.biomeAt(this.player.x,this.player.z):-1;return t>=0?Cx[t]:""}clockText(){const t=Math.floor((this.time*24+6)%24*60);return String(Math.floor(t/60)).padStart(2,"0")+":"+String(t%60).padStart(2,"0")}}const Id={bauer:[{give:[tt.APPLE,4],need:[[tt.WHEAT,4]]},{give:[tt.SEEDS,6],need:[[tt.BREAD,1]]},{give:[tt.BREAD,2],need:[[v.WOOD,3]]},{give:[tt.COPPER_INGOT,1],need:[[tt.WHEAT,10]]}],schmied:[{give:[tt.IRON_INGOT,1],need:[[v.COAL,6]]},{give:[tt.STONE_PICK,1],need:[[tt.WHEAT,4]]},{give:[tt.COPPER_HELMET,1],need:[[tt.COPPER_INGOT,3],[tt.BREAD,2]]},{give:[tt.IRON_PICK,1],need:[[v.CRYSTAL,2],[tt.WHEAT,8]]}],funker:[{give:[v.RADIO,1],need:[[tt.COPPER_INGOT,2]]},{give:[v.LAMP,4],need:[[tt.WHEAT,6]]},{give:[v.SWITCH,2],need:[[tt.BREAD,1]]},{give:[v.CRYSTAL,1],need:[[tt.IRON_INGOT,3]]}],hirte:[{give:[v.WOOL,4],need:[[tt.WHEAT,4]]},{give:[tt.MEAT_COOKED,3],need:[[tt.WHEAT,5]]},{give:[tt.MEAT_RAW,4],need:[[tt.APPLE,3]]}]},T1={bauer:"Die Felder geben gut her. Weizen tausche ich gern!",schmied:"Kohle und Barren sind mir am liebsten. Ich mache dir gutes Werkzeug.",funker:"Seit dem großen Rauschen ist unser Mast stumm. Bring mir Kupfer, dann reden wir über Funk.",hirte:"Meine Schafe geben Wolle. Für Weizen bekommst du welche."},Nd=1,uf=4,A1=9,w1=16e3,R1=60,ff={survival:[64,32],creative:[8192,2e3]},C1=new Set([v.SWITCH_ON,v.WHEAT0,v.FARMLAND]),Hr=i=>typeof i=="number"&&Number.isFinite(i),Un=i=>Number.isInteger(i),Ud=i=>(typeof i=="string"?i.replace(/[^\p{L}\p{N} _.-]/gu,"").trim().slice(0,16):"")||"Gast";function kd(i){if(typeof i!="string"||i.length>4e6)return null;try{const t=JSON.parse(i);return t&&typeof t=="object"&&typeof t.k=="string"?t:null}catch{return null}}function L1(i,t=w1){const e=[];for(let n=0;n<i.length;n+=t)e.push(i.slice(n,n+t));return e.length?e:[""]}const P1=i=>Yt[i]&&Yt[i].drop||i;class D1{constructor(t){this.env=t,this.peers=new Map,this.nextId=1,this.blocks=[],this.t=0,this.mobT=0}addPeer(t){return{id:0,name:"",send:t,token:null,pos:null,posT:0,bucket:0,bucketT:0,joined:!1}}get guests(){return[...this.peers.values()]}sendTo(t,e){try{t.send(JSON.stringify(e))}catch{}}broadcast(t,e){const n=JSON.stringify(t);for(const s of this.peers.values())if(s!==e)try{s.send(n)}catch{}}receive(t,e){const n=kd(e);if(n){if(!t.joined){n.k==="hello"&&this.hello(t,n);return}if(n.tk===t.token){if(n.k==="pos")this.onPos(t,n);else if(n.k==="sets")this.onSets(t,n);else if(n.k==="hit"&&Un(n.id)&&Hr(n.dmg)){const s=this.env.onHit(t,n.id,Math.max(0,Math.min(10,n.dmg)));s&&s.length&&this.sendTo(t,{k:"drops",list:s})}}}}hello(t,e){if(e.v!==Nd){this.sendTo(t,{k:"bye",why:"Andere Spielversion – bitte beide die Seite neu laden."});return}if(this.peers.size>=uf){this.sendTo(t,{k:"bye",why:`Die Welt ist voll (höchstens ${uf} Gäste).`});return}t.id=this.nextId++,t.name=Ud(e.name),t.joined=!0,t.token=Math.random().toString(36).slice(2,12)+Date.now().toString(36);const n=this.env.info(),s=JSON.stringify(n.edits||{}),r=L1(s);t.pos={x:n.pos.x,y:n.pos.y,z:n.pos.z,yaw:0,pitch:0},t.posT=this.env.now(),t.bucket=ff[n.mode==="creative"?"creative":"survival"][0],t.bucketT=this.env.now(),this.sendTo(t,{k:"welcome",id:t.id,tk:t.token,seed:n.seed,gen:n.gen,mode:n.mode,time:n.time,pos:n.pos,host:n.name,parts:r.length}),r.forEach((a,o)=>this.sendTo(t,{k:"part",i:o,s:a})),this.sendTo(t,{k:"pp",id:0,name:n.name,...n.pos});for(const a of this.peers.values())this.sendTo(t,{k:"pp",id:a.id,name:a.name,...a.pos}),this.sendTo(a,{k:"pp",id:t.id,name:t.name,...t.pos});this.peers.set(t.id,t),this.env.onJoin(t)}close(t){this.peers.has(t.id)&&(this.peers.delete(t.id),this.broadcast({k:"left",id:t.id}),this.env.onLeave(t))}kick(t,e){this.sendTo(t,{k:"bye",why:e}),this.close(t)}onPos(t,e){if(![e.x,e.y,e.z,e.yaw,e.pitch].every(Hr)||e.y<-10||e.y>le+60)return;const n=this.env.now(),s=Math.max(.05,(n-t.posT)/1e3);Math.hypot(e.x-t.pos.x,e.y-t.pos.y,e.z-t.pos.z)>R1*s+4||(t.pos={x:e.x,y:e.y,z:e.z,yaw:e.yaw,pitch:e.pitch},t.posT=n,this.broadcast({k:"pp",id:t.id,x:e.x,y:e.y,z:e.z,yaw:e.yaw},t))}onSets(t,e){if(!Array.isArray(e.list)||!Un(e.r))return;const n=this.env.world,s=this.env.info().mode,[r,a]=ff[s==="creative"?"creative":"survival"],o=this.env.now();t.bucket=Math.min(r,t.bucket+(o-t.bucketT)/1e3*a),t.bucketT=o;const l=[],c=t.pos;e.list.forEach((h,u)=>{if(!Array.isArray(h)||h.length!==5||!h.every(Un)){l.push([u,-1]);return}const[f,d,g,_,m]=h;if(d<1||d>=le||!Yt[m]||!Yt[_]){l.push([u,-1]);return}if(s!=="creative"&&m&&!Yt[m].inv&&!C1.has(m)){l.push([u,-1]);return}n.ensure&&n.ensure(f>>4,g>>4);const p=n.getBlock(f,d,g);if(Math.hypot(f+.5-c.x,d+.5-(c.y+1.6),g+.5-c.z)>(s==="creative"?200:A1)||t.bucket<1||p!==_){l.push([u,p]);return}t.bucket--,n.setBlock(f,d,g,m),Yt[m].shape==="cross"&&_===0&&this.env.onPlant(f,d,g)}),this.sendTo(t,{k:"ack",r:e.r,bad:l})}queueBlock(t,e,n,s){this.blocks.push([t,e,n,s])}hurt(t,e,n,s){const r=this.peers.get(t);r&&this.sendTo(r,{k:"hurt",dmg:e,cause:n,from:s})}tick(t,e,n,s){if(!this.peers.size){this.blocks.length=0;return}if(this.blocks.length&&(this.broadcast({k:"bs",list:this.blocks}),this.blocks=[]),this.t-=t,this.mobT-=t,this.t<=0&&(this.t=.1,this.broadcast({k:"pp",id:0,x:e.x,y:e.y,z:e.z,yaw:e.yaw}),(this.tt=(this.tt||0)+1)%10===0&&this.broadcast({k:"time",t:n})),this.mobT<=0&&s){this.mobT=.2;for(const r of this.peers.values()){const a=[];for(const o of s)Math.hypot(o.x-r.pos.x,o.z-r.pos.z)<64&&a.push(I1(o));this.sendTo(r,{k:"mobs",list:a})}}}}const I1=i=>[i.id,i.type,+i.x.toFixed(2),+i.y.toFixed(2),+i.z.toFixed(2),+i.yaw.toFixed(2),i.hurtT>0?1:0,i.moving?1:0,i.npc&&i.role||"",i.npc&&i.name||""];class N1{constructor(t,e,n){this.env=t,this.send=e,this.name=Ud(n),this.token=null,this.id=0,this.welcome=null,this.parts=null,this.r=0,this.pending=new Map,this.out=[]}hello(){this.send(JSON.stringify({k:"hello",v:Nd,name:this.name}))}post(t){this.token&&this.send(JSON.stringify({...t,tk:this.token}))}receive(t){const e=kd(t);if(e)switch(e.k){case"welcome":if(this.token||!Un(e.parts)||e.parts<1)return;this.welcome=e,this.parts=new Array(e.parts),this.got=0,this.token=e.tk,this.id=e.id;return;case"part":{if(!this.parts||!Un(e.i)||e.i<0||e.i>=this.parts.length||this.parts[e.i]!==void 0||typeof e.s!="string"||(this.parts[e.i]=e.s,++this.got<this.parts.length))return;let n={};try{n=JSON.parse(this.parts.join(""))}catch{this.env.onBye("Weltdaten beschädigt");return}const s=this.welcome;this.parts=null,this.env.onWelcome({seed:s.seed,gen:s.gen,mode:s.mode,time:s.time,pos:s.pos,host:s.host,edits:n,id:s.id});return}case"bs":Array.isArray(e.list)&&this.env.onBlocks(e.list.filter(n=>Array.isArray(n)&&n.length===4&&n.every(Un)));return;case"pp":Un(e.id)&&e.id!==this.id&&[e.x,e.y,e.z].every(Hr)&&this.env.onPlayer(e.id,e);return;case"left":Un(e.id)&&this.env.onLeft(e.id);return;case"mobs":Array.isArray(e.list)&&this.env.onMobs(e.list);return;case"hurt":Hr(e.dmg)&&this.env.onHurt(e);return;case"drops":Array.isArray(e.list)&&this.env.onDrops(e.list.filter(n=>Array.isArray(n)&&Un(n[0])&&Un(n[1])&&n[1]>0&&n[1]<100));return;case"time":Hr(e.t)&&this.env.onTime(e.t);return;case"ack":{const n=this.pending.get(e.r);if(!n)return;this.pending.delete(e.r);const s=Array.isArray(e.bad)?e.bad.filter(r=>Array.isArray(r)&&Un(r[0])&&n[r[0]]).map(r=>[...n[r[0]],r[1]]):[];s.length&&this.env.onReject(s);return}case"bye":this.env.onBye(typeof e.why=="string"?e.why.slice(0,120):"Verbindung beendet");return}}local(t,e,n,s,r){this.out.push([t,e,n,s,r])}flush(){if(!this.out.length||!this.token)return;const t=++this.r;for(let e=0;e<this.out.length;e+=4096){const n=this.out.slice(e,e+4096),s=e?++this.r:t;this.pending.set(s,n),this.post({k:"sets",r:s,list:n})}this.out=[]}pos(t){this.post({k:"pos",x:+t.x.toFixed(2),y:+t.y.toFixed(2),z:+t.z.toFixed(2),yaw:+t.yaw.toFixed(2),pitch:+t.pitch.toFixed(2)})}hit(t,e){this.post({k:"hit",id:t,dmg:e})}}const Od=[{urls:"stun:stun.l.google.com:19302"}],Gr="KF1.";function zd(i){return i.iceGatheringState==="complete"?Promise.resolve():new Promise(t=>{const e=setTimeout(t,5e3);i.addEventListener("icegatheringstatechange",()=>{i.iceGatheringState==="complete"&&(clearTimeout(e),t())})})}const df=i=>{let t="";for(let e=0;e<i.length;e+=8192)t+=String.fromCharCode.apply(null,i.subarray(e,e+8192));return btoa(t).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")},U1=i=>{const t=atob(i.replace(/-/g,"+").replace(/_/g,"/")),e=new Uint8Array(t.length);for(let n=0;n<t.length;n++)e[n]=t.charCodeAt(n);return e};async function Fd(i,t){return new Uint8Array(await new Response(new Blob([i]).stream().pipeThrough(t)).arrayBuffer())}async function Bd(i){const t=new TextEncoder().encode(JSON.stringify(i));return typeof CompressionStream<"u"?Gr+"z"+df(await Fd(t,new CompressionStream("deflate-raw"))):Gr+"j"+df(t)}async function Hd(i){const t=String(i||"").replace(/\s+/g,"");if(!t.startsWith(Gr))throw new Error("Das ist kein KlotzFunk-Code");let e=U1(t.slice(Gr.length+1));if(t[Gr.length]==="z"){if(typeof DecompressionStream>"u")throw new Error("Dieser Browser kann den Code nicht entpacken");e=await Fd(e,new DecompressionStream("deflate-raw"))}return JSON.parse(new TextDecoder().decode(e))}async function k1(i,t){const e=new RTCPeerConnection({iceServers:i?Od:[]}),n=e.createDataChannel("klotzfunk",{ordered:!0});n.onopen=()=>t(n,e),await e.setLocalDescription(await e.createOffer()),await zd(e);const s=await Bd({t:"o",sdp:e.localDescription.sdp});return{pc:e,dc:n,code:s,async accept(r){const a=await Hd(r);if(a.t!=="a"||typeof a.sdp!="string")throw new Error("Das ist kein Antwort-Code");await e.setRemoteDescription({type:"answer",sdp:a.sdp})}}}async function O1(i,t,e){const n=await Hd(i);if(n.t!=="o"||typeof n.sdp!="string")throw new Error("Das ist kein Einladungs-Code");const s=new RTCPeerConnection({iceServers:t?Od:[]});return s.ondatachannel=r=>{const a=r.channel;a.readyState==="open"?e(a,s):a.onopen=()=>e(a,s)},await s.setRemoteDescription({type:"offer",sdp:n.sdp}),await s.setLocalDescription(await s.createAnswer()),await zd(s),{pc:s,code:await Bd({t:"a",sdp:s.localDescription.sdp})}}const pf=[3836632,14178874,3848298,13150266,10115800],z1=i=>[[-.22,0,-.12,-.02,.75,.12,2767450],[.02,0,-.12,.22,.75,.12,2767450],[-.28,.75,-.16,.28,1.4,.16,i],[-.4,.8,-.1,-.28,1.38,.1,i],[.28,.8,-.1,.4,1.38,.1,i],[-.22,1.4,-.22,.22,1.84,.22,15253658],[-.24,1.76,-.24,.24,1.9,.24,4863008],[-.13,1.6,-.24,-.05,1.66,-.22,2105376],[.05,1.6,-.24,.13,1.66,-.22,2105376]];function F1(i){const t=document.createElement("canvas");t.width=256,t.height=64;const e=t.getContext("2d");e.font="bold 34px system-ui, sans-serif",e.textAlign="center",e.textBaseline="middle";const n=Math.min(250,e.measureText(i).width+28);e.fillStyle="rgba(10,14,30,.62)",e.fillRect(128-n/2,6,n,52),e.fillStyle="#fff",e.fillText(i,128,33);const s=new no(t),r=new Mx(new td({map:s,depthTest:!1,transparent:!0}));return r.scale.set(1.6,.4,1),r.position.y=2.25,r.renderOrder=30,r}class B1{constructor(t){this.group=new Fn,t.add(this.group),this.list=new Map,this.geos=pf.map(e=>Xs(z1(e)))}set(t,e){let n=this.list.get(t);if(!n){const s=new Fi({vertexColors:!0}),r=new Fn;r.add(new Re(this.geos[t%pf.length],s)),n={root:r,mat:s,name:"",tag:null,x:e.x,y:e.y,z:e.z,yaw:e.yaw||0,tx:e.x,ty:e.y,tz:e.z,tyaw:e.yaw||0},this.group.add(r),this.list.set(t,n)}e.name&&e.name!==n.name&&(n.name=e.name,n.tag&&(n.root.remove(n.tag),n.tag.material.map.dispose(),n.tag.material.dispose()),n.tag=F1(e.name),n.root.add(n.tag)),n.tx=e.x,n.ty=e.y,n.tz=e.z,Number.isFinite(e.yaw)&&(n.tyaw=e.yaw)}remove(t){const e=this.list.get(t);e&&(this.group.remove(e.root),e.mat.dispose(),e.tag&&(e.tag.material.map.dispose(),e.tag.material.dispose()),this.list.delete(t))}clear(){for(const t of[...this.list.keys()])this.remove(t)}update(t,e){const n=Math.min(1,t*12);for(const s of this.list.values()){Math.hypot(s.tx-s.x,s.tz-s.z)>20&&(s.x=s.tx,s.y=s.ty,s.z=s.tz),s.x+=(s.tx-s.x)*n,s.y+=(s.ty-s.y)*n,s.z+=(s.tz-s.z)*n;let r=s.tyaw-s.yaw;r=Math.atan2(Math.sin(r),Math.cos(r)),s.yaw+=r*n,s.root.position.set(s.x,s.y,s.z),s.root.rotation.y=s.yaw,s.mat.color.setRGB(e,e,e)}}}class Dl{constructor(t){this.view=t,this.list=[],this.byId=new Map,this.enabled=!1}set(t){const e=new Set;for(const n of t){const[s,r,a,o,l,c,h,u,f,d]=n;if(!Number.isInteger(s)||!Jr[r]||![a,o,l,c].every(Number.isFinite))continue;e.add(s);let g=this.byId.get(s);if(!g){const _=Jr[r];g={id:s,type:r,T:_,x:a,y:o,z:l,yaw:c,hurtT:0,moving:!1,hostile:!!_.hostile,npc:!!_.npc,role:f||"",name:d||_.name},this.byId.set(s,g),this.list.push(g),this.view.add(g)}Object.assign(g,{x:a,y:o,z:l,yaw:c,moving:!!u}),h&&(g.hurtT=.2)}for(const n of this.list.slice())e.has(n.id)||this.removeMob(n)}removeMob(t){this.byId.delete(t.id),this.list.splice(this.list.indexOf(t),1),this.view.remove(t)}update(t){for(const e of this.list)e.hurtT=Math.max(0,e.hurtT-t)}raycast(t,e,n,s,r,a,o){let l=null,c=o;for(const h of this.list){const u=h.T.half,f=[h.x-u,h.y,h.z-u],d=[h.x+u,h.y+h.T.h,h.z+u],g=[t,e,n],_=[s,r,a];let m=0,p=c;for(let x=0;x<3&&m<=p;x++){if(Math.abs(_[x])<1e-9){(g[x]<f[x]||g[x]>d[x])&&(m=1/0);continue}let y=(f[x]-g[x])/_[x],M=(d[x]-g[x])/_[x];y>M&&([y,M]=[M,y]),m=Math.max(m,y),p=Math.min(p,M)}m<=p&&m<c&&(c=m,l=h)}return l?{mob:l,t:c}:null}remove(t){this.byId.has(t.id)&&this.removeMob(t)}clear(){for(const t of this.list.slice())this.removeMob(t)}serialize(){}hostileCount(){return 0}}class H1{constructor(t,e){this.game=t,this.ui=e,this.avatars=new B1(t.scene),this.host=null,this.guest=null,this.conns=new Set,this.posT=0,this.useStun=!0}get active(){return!!(this.host||this.guest)}open(){const t=this.game;this.host||(this.host=new D1({world:t.world,now:()=>performance.now(),info:()=>({seed:t.seed,gen:t.gen,mode:t.mode,time:t.time,edits:pd(t.world.edits),pos:{x:t.player.x,y:t.player.y,z:t.player.z},name:this.myName||"Gastgeber"}),onPlant:(e,n,s)=>t.farm.plant(e,n,s,t.age),onHit:(e,n,s)=>this.hostHit(e,n,s),onJoin:e=>{this.ui.toast(`${e.name} ist in deiner Welt`),this.avatars.set(e.id,{...e.pos,name:e.name}),this.listPlayers()},onLeave:e=>{this.ui.toast(`${e.name} hat die Welt verlassen`),this.avatars.remove(e.id),this.listPlayers()}}),t.world.onSet=(e,n,s,r)=>this.host&&this.host.queueBlock(e,n,s,r),t.mp=this,t.running||t.resume())}async invite(){this.open();let t=null;const e=await k1(this.useStun,n=>{t=this.host.addPeer(s=>n.send(s)),t.dc=n,t.pc=e.pc,this.conns.add(e.pc),n.onmessage=s=>this.host.receive(t,s.data),n.onclose=()=>{this.host&&this.host.close(t),this.conns.delete(e.pc)}});return e.pc.onconnectionstatechange=()=>{["failed","closed"].includes(e.pc.connectionState)&&t&&this.host&&this.host.close(t)},e}hostHit(t,e,n){const s=this.game,r=s.mobs&&s.mobs.list.find(a=>a.id===e);return!r||r.npc||Math.hypot(r.x-t.pos.x,r.z-t.pos.z)>8||!r.hit(n,t.pos.x,t.pos.z)?null:(s.spawnBreak(r.x-.5,r.y,r.z-.5,60),s.mobs.remove(r,!1),s.unsaved=!0,s.mode==="creative"?null:Rd(r.type))}others(){return this.host?this.host.guests.map(t=>({id:t.id,x:t.pos.x,y:t.pos.y,z:t.pos.z})):null}hurtGuest(t){const e=this.host&&this.host.peers.get(t.target);e&&this.host.hurt(e.id,t.T.dmg,t.T.name,[t.x,t.y+.3,t.z,t.T.range?1:0])}kick(t){const e=this.host&&this.host.peers.get(t);if(e){this.host.kick(e,"Der Gastgeber hat dich aus der Welt genommen.");try{e.pc.close()}catch{}}}listPlayers(){const t=this.host?this.host.guests.map(e=>({id:e.id,name:e.name})):[...this.avatars.list.entries()].map(([e,n])=>({id:e,name:n.name}));this.ui.players(t)}async join(t,e){const n=this.game;this.myName=e,this.guest=new N1({onWelcome:r=>this.welcome(r),onBlocks:r=>{const a=n.world;if(a)for(const[o,l,c,h]of r)a.ensure&&a.ensure(o>>4,c>>4),a.setBlock(o,l,c,h)},onPlayer:(r,a)=>{this.avatars.set(r,a),a.name&&this.listPlayers()},onLeft:r=>{const a=this.avatars.list.get(r);a&&this.ui.toast(`${a.name||"Ein Spieler"} ist gegangen`),this.avatars.remove(r),this.listPlayers()},onMobs:r=>{n.mobs instanceof Dl&&n.mobs.set(r)},onHurt:r=>n.remoteHurt(r),onDrops:r=>{for(const[a,o]of r)n.inv[a]=Math.min(Xe,(n.inv[a]||0)+o);this.ui.toast(r.map(([a,o])=>`+${o} ${ge(a)}`).join(" · ")),n.onChange()},onTime:r=>{n.time=r},onReject:r=>this.reject(r),onBye:r=>this.end(r)},r=>this.dc&&this.dc.readyState==="open"&&this.dc.send(r),e);const s=await O1(t,this.useStun,(r,a)=>{this.dc=r,this.conns.add(a),r.onmessage=o=>this.guest&&this.guest.receive(o.data),r.onclose=()=>this.end("Die Verbindung zum Gastgeber ist getrennt."),this.guest.hello(),this.ui.status("Verbunden, Welt wird geladen …")});return s.pc.onconnectionstatechange=()=>{["failed","closed"].includes(s.pc.connectionState)&&this.end("Die Verbindung zum Gastgeber ist getrennt.")},s.code}welcome(t){const e=this.game;e.start({name:`Bei ${t.host}`,seed:t.seed,gen:t.gen,mode:t.mode,time:t.time,edits:t.edits,px:t.pos.x+1.5,py:t.pos.y,pz:t.pos.z,yaw:0,pitch:0}),e.mp=this,e.net=this.guest,e.mobs.clear(),e.mobs=new Dl(e.mobView),this.ui.joined(t)}reject(t){const e=this.game;for(const[n,s,r,a,o,l]of t)if(e.world.setBlock(n,s,r,l>=0?l:a),e.mode!=="creative")if(o)e.inv[o]=Math.min(Xe,(e.inv[o]||0)+1);else{const c=P1(a);e.inv[c]=Math.max(0,(e.inv[c]||0)-1)}e.onChange(),this.ui.toast("Der Gastgeber hat eine Änderung nicht übernommen")}tick(t){const e=this.game,n=e.player;if(this.avatars.update(t,e.light),this.host){this.host.tick(t,{x:n.x,y:n.y,z:n.z,yaw:e.yaw},e.time,e.mobs?e.mobs.list:null);for(const s of this.host.guests)this.avatars.set(s.id,s.pos)}this.guest&&this.guest.token&&(this.guest.flush(),(this.posT-=t)<=0&&(this.posT=.1,this.guest.pos({x:n.x,y:n.y,z:n.z,yaw:e.yaw,pitch:e.pitch})),e.mobs instanceof Dl&&e.mobs.update(t))}end(t){if(!this.active&&!this.conns.size)return;const e=!!this.guest;if(this.host)for(const s of this.host.guests)this.host.kick(s,"Der Gastgeber hat die Welt geschlossen.");for(const s of this.conns)try{s.close()}catch{}this.conns.clear(),this.host=null,this.guest=null,this.dc=null,this.avatars.clear();const n=this.game;n.world&&(n.world.onSet=null),n.mp=null,n.net=null,t&&this.ui.ended(t,e)}}const Hs=[.25,.5,1,2];class G1{constructor(t,e,n){this.game=t,this.$=e,this.toast=n,this.cv=e("wm"),this.ctx=this.cv.getContext("2d"),this.off=document.createElement("canvas"),this.offCtx=this.off.getContext("2d"),this.zi=3,this.cx=0,this.cz=0,this.sel=null,this.drag=null;const s=this.cv;s.addEventListener("pointerdown",a=>{s.setPointerCapture(a.pointerId),this.drag={id:a.pointerId,x:a.clientX,y:a.clientY,moved:0}}),s.addEventListener("pointermove",a=>{const o=this.drag;if(!o||o.id!==a.pointerId)return;const l=this.scale(),c=Hs[this.zi];this.cx-=(a.clientX-o.x)*l/c,this.cz-=(a.clientY-o.y)*l/c,o.moved+=Math.abs(a.clientX-o.x)+Math.abs(a.clientY-o.y),o.x=a.clientX,o.y=a.clientY,this.draw()});const r=a=>{const o=this.drag;if(!(!o||o.id!==a.pointerId)&&(this.drag=null,o.moved<8)){const l=this.toWorld(a);this.select(l.x,l.z)}};s.addEventListener("pointerup",r),s.addEventListener("pointercancel",()=>{this.drag=null}),s.addEventListener("wheel",a=>{a.preventDefault(),this.zoom(a.deltaY<0?1:-1)},{passive:!1}),e("mapZin").onclick=()=>this.zoom(1),e("mapZout").onclick=()=>this.zoom(-1),e("mapMe").onclick=()=>{this.cx=t.player.x,this.cz=t.player.z,this.draw()},e("mapMark").onclick=()=>{if(this.sel){if(!t.map.addMark(this.sel.x,this.sel.z)){this.toast(`Höchstens ${Ic} Markierungen`);return}t.unsaved=!0,this.list(),this.draw()}},e("mapGo").onclick=()=>{this.sel&&this.setWp(this.sel.x,this.sel.z)},e("mapMarks").addEventListener("click",a=>{const o=a.target.closest("button[data-i]");if(!o)return;const l=t.map.marks[Number(o.dataset.i)];l&&(o.dataset.a==="go"?this.setWp(l.x,l.z):o.dataset.a==="del"?(t.map.removeMark(Number(o.dataset.i)),t.unsaved=!0,this.list()):(this.cx=l.x,this.cz=l.z),this.draw())}),e("mapMarks").addEventListener("change",a=>{const o=a.target;if(o.dataset.i==null)return;const l=t.map.marks[Number(o.dataset.i)];l&&(l.n=o.value.trim().slice(0,24)||l.n,o.value=l.n,t.unsaved=!0,this.draw())})}scale(){return this.cv.width/Math.max(1,this.cv.clientWidth)}toWorld(t){const e=this.cv.getBoundingClientRect(),n=this.scale(),s=Hs[this.zi];return{x:this.cx+((t.clientX-e.left)*n-this.cv.width/2)/s,z:this.cz+((t.clientY-e.top)*n-this.cv.height/2)/s}}zoomLevel(){return Hs[this.zi]}zoom(t){this.zi=Math.max(0,Math.min(Hs.length-1,this.zi+t)),this.draw()}select(t,e){const n=this.game,s=Math.floor(t/16),r=Math.floor(e/16);this.sel={x:Math.round(t),z:Math.round(e)},this.$("mapSel").textContent=`Gewählt: X ${this.sel.x} · Z ${this.sel.z}${n.map.has(s,r)?"":" (noch unentdeckt)"}`,this.$("mapAct").hidden=!1,this.draw()}setWp(t,e){const n=this.game;n.wp={x:Math.round(t),y:Math.round(n.player.y),z:Math.round(e)},n.unsaved=!0,this.toast("Wegpunkt gesetzt 📍")}open(){const t=this.game,e=this.cv,n=Math.min(1.5,window.devicePixelRatio||1);this.cx=t.player.x,this.cz=t.player.z,this.sel=null,this.$("mapSel").textContent="Tippe auf die Karte, um einen Ort zu wählen. Ziehen verschiebt die Karte.",this.$("mapAct").hidden=!0,t.map.markAround(t.player.x,t.player.z,Math.min(t.viewDist,5)),t.map.syncRadios(t.world),requestAnimationFrame(()=>{e.width=Math.max(200,Math.round(e.clientWidth*n)),e.height=Math.max(160,Math.round(e.clientHeight*n)),this.list(),this.draw()})}list(){const t=this.$("mapMarks"),e=this.game;t.textContent="",e.map.marks.forEach((n,s)=>{const r=document.createElement("li"),a=document.createElement("input");a.value=n.n,a.maxLength=24,a.dataset.i=s,a.setAttribute("aria-label","Name der Markierung");const o=(l,c,h)=>{const u=document.createElement("button");return u.dataset.i=s,u.dataset.a=l,u.textContent=c,u.title=h,u.setAttribute("aria-label",h),u};r.append(o("show","★","Auf der Karte zeigen"),a,o("go","📍","Wegpunkt hierher"),o("del","✕","Markierung löschen")),t.append(r)}),this.$("mapMarksH").hidden=!e.map.marks.length}draw(){const t=this.game,e=this.cv,n=this.ctx,s=e.width,r=e.height,a=Hs[this.zi],o=t.map;if(!o||!t.world)return;const l=this.cx-s/2/a,c=this.cz-r/2/a,h=Math.floor(l/16),u=Math.floor(c/16),f=Math.ceil(s/a/16)+2,d=Math.ceil(r/a/16)+2;(this.off.width!==f*Be||this.off.height!==d*Be)&&(this.off.width=f*Be,this.off.height=d*Be,this.img=this.offCtx.createImageData(f*Be,d*Be));const g=this.img.data;g.fill(0);for(let M=0;M<d;M++)for(let C=0;C<f;C++){if(!o.has(h+C,u+M))continue;const A=o.tile(t.world,h+C,u+M);for(let w=0;w<Be;w++)g.set(A.subarray(w*Be*4,(w+1)*Be*4),((M*Be+w)*f*Be+C*Be)*4)}this.offCtx.putImageData(this.img,0,0),n.fillStyle="#0b1020",n.fillRect(0,0,s,r),n.imageSmoothingEnabled=!1;const _=M=>(M-l)*a,m=M=>(M-c)*a;n.drawImage(this.off,_(h*16),m(u*16),f*16*a,d*16*a);const p=Math.max(11,Math.round(13*s/Math.max(1,e.clientWidth)));n.font=`${p}px system-ui,sans-serif`,n.textAlign="center",n.textBaseline="middle";const x=(M,C,A,w)=>{const D=_(M),T=m(C);D<-20||T<-20||D>s+20||T>r+20||(n.fillText(A,D,T),w&&(n.lineWidth=3,n.strokeStyle="rgba(0,0,0,.7)",n.strokeText(w,D,T+p),n.fillStyle="#fff",n.fillText(w,D,T+p)))};if(n.fillStyle="#fff",t.world.gen===3){const M=Tn(l),C=Tn(l+s/a),A=Tn(c),w=Tn(c+r/a);if((C-M+1)*(w-A+1)<=64)for(let D=A;D<=w;D++)for(let T=M;T<=C;T++){const b=aa(t.seed,T,D);b&&o.has(b.x>>4,b.z>>4)&&x(b.x,b.z,"🏘",a>=.5?"Dorf":"")}}for(const M of o.radios.values())x(M[0],M[2],"📻","");for(const M of o.marks)x(M.x,M.z,"★",M.n);if(t.grave&&x(t.grave.x,t.grave.z,"✝",""),t.wp&&x(t.wp.x,t.wp.z,"📍",t.story&&!t.story.done?"Storyziel":""),this.sel&&(n.strokeStyle="#ff2d95",n.lineWidth=2,n.strokeRect(_(this.sel.x)-7,m(this.sel.z)-7,14,14)),t.mp)for(const[,M]of t.mp.avatars.list)M.x!=null&&x(M.x,M.z,"👤",a>=.5?M.name:"");const y=t.player;n.save(),n.translate(_(y.x),m(y.z)),n.rotate(-t.yaw),n.scale(p/9,p/9),n.fillStyle="#fff",n.strokeStyle="#000",n.lineWidth=1,n.beginPath(),n.moveTo(0,-6),n.lineTo(4.5,5),n.lineTo(0,2.5),n.lineTo(-4.5,5),n.closePath(),n.fill(),n.stroke(),n.restore(),this.$("mapInfo").textContent=`${o.count} Gebiete entdeckt · Zoom ${this.zi+1}/${Hs.length} · X ${Math.round(t.player.x)} Z ${Math.round(t.player.z)}`}}const Vr=[["fwd","Vorwärts","KeyW"],["back","Rückwärts","KeyS"],["left","Links","KeyA"],["right","Rechts","KeyD"],["jump","Springen / Hoch","Space"],["sneak","Schleichen / Runter","ShiftLeft"],["sprint","Rennen","ControlLeft"],["inv","Inventar","KeyE"],["map","Weltkarte","KeyM"],["hook","Seilhaken","KeyQ"],["wp","Wegpunkt","KeyB"],["fly","Fliegen (Kreativ)","KeyF"],["build","Bauform","KeyG"],["quests","Aufträge ein/aus","KeyJ"]],Gd=new Set(["Escape","Tab","MetaLeft","MetaRight",...Array.from({length:9},(i,t)=>"Digit"+(t+1))]),Il=Object.fromEntries(Vr.map(i=>[i[0],i[2]]));function Vd(i){const t={...Il};if(!i||typeof i!="object")return t;for(const[n]of Vr){const s=i[n];typeof s=="string"&&/^[A-Za-z0-9]{1,24}$/.test(s)&&!Gd.has(s)&&(t[n]=s)}const e=new Map;for(const[n]of Vr)e.has(t[n])&&(t[n]=Il[n]),e.set(t[n],n);return new Set(Object.values(t)).size===Vr.length?t:{...Il}}function V1(i,t,e){if(Gd.has(e)||!(t in i))return null;const n={...i},s=Object.keys(n).find(r=>n[r]===e);return s&&s!==t&&(n[s]=n[t]),n[t]=e,n}function W1(i,t){for(const e in i)if(i[e]===t)return e;return null}function X1(i){return/^Key[A-Z]$/.test(i)?i[3]:/^Digit\d$/.test(i)?i[5]:{Space:"Leertaste",ShiftLeft:"Umschalt links",ShiftRight:"Umschalt rechts",ControlLeft:"Strg links",ControlRight:"Strg rechts",AltLeft:"Alt",AltRight:"Alt Gr",ArrowUp:"↑",ArrowDown:"↓",ArrowLeft:"←",ArrowRight:"→",Enter:"Eingabe",Backspace:"⌫",CapsLock:"Feststell"}[i]||i}const se={S:0,E:1,W:2,N:3,LB:4,RB:5,LT:6,RT:7,SEL:8,START:9,L3:10,R3:11,UP:12,DOWN:13,LEFT:14,RIGHT:15},nh=16;function Wd(i=""){const t=String(i).toLowerCase();return/054c|playstation|dualsense|dualshock|ps[345]\b|ps[345] controller/.test(t)?"ps":/057e|nintendo|switch|pro controller|joy-?con/.test(t)?"switch":/045e|xbox|xinput|x-box/.test(t)?"xbox":"generic"}const _o={xbox:["A","B","X","Y","LB","RB","LT","RT","Ansicht","Menü","LS","RS","✚↑","✚↓","✚←","✚→","Xbox"],ps:["✕","○","□","△","L1","R1","L2","R2","Create","Options","L3","R3","✚↑","✚↓","✚←","✚→","PS"],switch:["B","A","Y","X","L","R","ZL","ZR","−","+","LS","RS","✚↑","✚↓","✚←","✚→","Home"]};_o.generic=_o.xbox;const Xd={xbox:"Xbox-Controller",ps:"PlayStation-Controller",switch:"Switch-Controller",generic:"Controller"},Uc=(i,t)=>(_o[i]||_o.xbox)[t]??"Taste "+t,$d=i=>i==="switch"?se.E:se.S,qd=i=>i==="switch"?se.S:se.E,Wr=[["jump","Springen / Hoch",se.S],["sneak","Schleichen / Runter",se.E],["hook","Seilhaken",se.W],["inv","Inventar",se.N],["prev","Hotbar links",se.LB],["next","Hotbar rechts",se.RB],["place","Setzen / Benutzen",se.LT],["break","Abbauen / Angreifen",se.RT],["map","Weltkarte",se.SEL],["pause","Pause",se.START],["sprint","Rennen",se.L3],["undo","Rückgängig (Kreativ)",se.R3],["fly","Fliegen (Kreativ)",se.UP],["wp","Wegpunkt",se.DOWN],["build","Bauform",se.LEFT],["quests","Aufträge ein/aus",se.RIGHT]],ao=Object.fromEntries(Wr.map(i=>[i[0],i[2]]));function ih(i){const t={...ao};if(!i||typeof i!="object")return t;for(const[n]of Wr){const s=i[n];Number.isInteger(s)&&s>=0&&s<nh&&(t[n]=s)}const e=new Set;for(const[n]of Wr)e.has(t[n])&&(t[n]=ao[n]),e.add(t[n]);return new Set(Object.values(t)).size===Wr.length?t:{...ao}}function $1(i,t,e){if(!(t in i)||!Number.isInteger(e)||e<0||e>=nh)return null;const n={...i},s=Object.keys(n).find(r=>n[r]===e);return s&&s!==t&&(n[s]=n[t]),n[t]=e,n}const q1=(i,t=.18)=>Math.abs(i)<t?0:(i-Math.sign(i)*t)/(1-t);function Y1(i,t,e=ao,n=.18){const s=c=>q1(i.axes[c]||0,n),r=c=>{const h=i.buttons[c];return!!h&&(h.pressed||h.value>.5)},a=i.buttons.map((c,h)=>r(h)),o={},l={};for(const c in e){const h=e[c];o[c]=!!a[h],l[c]=!!a[h]&&!t[h]}return{r:s(0),f:-s(1),lx:s(2),ly:s(3),held:o,hit:l,buttons:a}}function K1(i,t,e){const n=i[t];if(!n)return i.length?0:-1;const s=n.x+n.w/2,r=n.y+n.h/2,a=e==="up"||e==="down",o=e==="down"||e==="right"?1:-1;let l=-1,c=1/0;return i.forEach((h,u)=>{if(u===t)return;const f=h.x+h.w/2,d=h.y+h.h/2,g=a?o>0?h.y-(n.y+n.h):n.y-(h.y+h.h):o>0?h.x-(n.x+n.w):n.x-(h.x+h.w);if((a?(d-r)*o:(f-s)*o)<=1||g<-Math.min(n.h,n.w)/2)return;const m=a?Math.max(0,Math.max(h.x,n.x)-Math.min(h.x+h.w,n.x+n.w)):Math.max(0,Math.max(h.y,n.y)-Math.min(h.y+h.h,n.y+n.h)),p=Math.max(0,g)+m*2.5;p<c&&(c=p,l=u)}),l}const j1={break:[.2,.45,55],place:[0,.22,30],hurt:[.85,.6,200],deny:[.05,.18,40],done:[.35,.7,260],hook:[.15,.35,70]};function Do(i,t,e=1){const n=j1[t];if(!i||!n||!(e>0))return!1;const s=Math.min(1,e),[r,a,o]=n;try{const l=i.vibrationActuator;if(l&&l.playEffect){const h=l.playEffect("dual-rumble",{startDelay:0,duration:o,strongMagnitude:r*s,weakMagnitude:a*s});return h&&h.catch&&h.catch(()=>{}),!0}const c=i.hapticActuators&&i.hapticActuators[0];if(c&&c.pulse){const h=c.pulse(Math.max(r,a)*s,o);return h&&h.catch&&h.catch(()=>{}),!0}}catch{}return!1}const Z1="1.10.0",P=i=>document.getElementById(i),ca=P("c"),sh=window.matchMedia("(pointer: coarse)").matches;let ht=tM();const L=new b1(ca,sh,ht.quality);window.__bv=L;let vt="menu",ps="menu",ir=-1,on=sh;const En=new Set;let $n=Vd(ht.keys);document.documentElement.style.setProperty("--atlas",`url(${L.atlasCanvas.toDataURL()})`);const kc=L.itemCanvas.height/32;document.documentElement.style.setProperty("--items",`url(${L.itemCanvas.toDataURL()})`);document.documentElement.style.setProperty("--itemRows",kc*100+"%");const vo=i=>{if(Di(i)){const e=Te[i]?Te[i].icon:0;return`<i class="ic it" style="background-position:${e%8*100/7}% ${kc>1?Math.floor(e/8)*100/(kc-1):0}%"></i>`}if(wo(i)){const e=i-pi;return`<i class="ic lg" style="background-position:${e%4*100/3}% ${Math.floor(e/4)*100/3}%"></i>`}if(i===v.RAINBOW)return'<i class="ic rb"></i>';const t=Yt[i]?Yt[i].icon:0;return`<i class="ic" style="background-position:${t%8*100/7}% ${Math.floor(t/8)*100/15}%"></i>`};L.onLogos=()=>{document.documentElement.style.setProperty("--logos",`url(${L.logoCanvas.toDataURL("image/png")})`)};let mf=0;function ee(i){const t=P("toast");t.textContent=i,t.classList.add("on"),clearTimeout(mf),mf=setTimeout(()=>t.classList.remove("on"),1800)}L.onToast=ee;function Yi(){const i=P("hotbar");if(!i.children.length)for(let t=0;t<9;t++){const e=document.createElement("div");e.className="slot",e.addEventListener("pointerdown",n=>{n.stopPropagation(),L.selectSlot(t)}),e.addEventListener("dragstart",n=>{if(vt!=="inventory"||!L.hotbar[t]){n.preventDefault();return}n.dataTransfer.setData("text/plain","h"+t)}),e.addEventListener("dragover",n=>{vt==="inventory"&&(n.preventDefault(),e.classList.add("drop"))}),e.addEventListener("dragleave",()=>e.classList.remove("drop")),e.addEventListener("drop",n=>{n.preventDefault(),e.classList.remove("drop"),Zd(t,n.dataTransfer.getData("text/plain"))}),i.appendChild(e)}for(let t=0;t<9;t++){const e=i.children[t],n=L.hotbar[t],s=L.mode==="creative"?"∞":L.inv[n]||0;e.className="slot"+(t===L.sel?" sel":"")+(n&&s===0?" empty":""),e.title=n?ge(n):"",e.draggable=vt==="inventory"&&!!n;const r=Ii(n),a=r&&L.dur[n]?1-L.dur[n]/r.dur:0;e.innerHTML=`<span class="k">${t+1}</span>${n?vo(n):""}<span class="n">${n?s:""}</span>${a?`<span class="dur"><i style="width:${Math.round(a*100)}%;background:hsl(${Math.round(a*120)},80%,50%)"></i></span>`:""}`}}let ai="all",Yd="",Kd=!1,ta=new Set,Gi=null;const J1=[{id:"all",name:"Alle"},...Tx,{id:"items",name:"Werkzeuge & Essen"}],Q1=i=>i.tool?` · ${i.tool.speed}× schneller · hält ${i.tool.dur} Blöcke`:i.food?` · +${i.food} Hunger`:"";function jd(){P("invTabs").innerHTML=J1.map(i=>`<button role="tab" data-cat="${i.id}" class="${i.id===ai?"on":""}" aria-selected="${i.id===ai}">${i.name}</button>`).join("")}function Zd(i,t){if(t){if(t[0]==="h"){const e=Number(t.slice(1));e>=0&&e<9&&e!==i&&([L.hotbar[i],L.hotbar[e]]=[L.hotbar[e],L.hotbar[i]])}else{const e=Number(t);if(!Number.isInteger(e)||!(Yt[e]||Te[e]))return;const n=L.hotbar.indexOf(e);n>=0&&(L.hotbar[n]=L.hotbar[i]),L.hotbar[i]=e}L.selectSlot(i),L.unsaved=!0,L.onChange()}}let Oc="std";function ur(){const i=L.mode==="creative",t=Yd.trim().toLowerCase();P("invHint").textContent=i?"Kreativmodus: alle Blöcke sind unbegrenzt. Tippe einen Block, um ihn in den gewählten Hotbar-Platz zu legen.":"Tippe einen Block, um ihn in den gewählten Hotbar-Platz zu legen. Zahl = Vorrat.",P("invOwnedL").hidden=i,P("invSt").hidden=i||!Gi,Gi&&(P("invSt").textContent=Gi==="ofen"?"🔥 Am Schmelzofen: Barren schmelzen und Essen braten":"🪚 An der Werkbank: Werkzeuge und Schmelzofen bauen");let e="";const n=[...Ax,...mo];Oc==="name"?n.sort((r,a)=>ge(r).localeCompare(ge(a),"de")):Oc==="count"&&!i&&n.sort((r,a)=>(L.inv[a]||0)-(L.inv[r]||0));for(const r of n){const a=Yt[r]&&!Di(r)?Yt[r]:Te[r],o=i?"∞":L.inv[r]||0;if(ai!=="all"&&a.cat!==ai||t&&!a.name.toLowerCase().includes(t)||Kd&&!i&&!o)continue;const l=Di(r)?Q1(a):a.tool?" · am besten mit "+a.tool[0].toUpperCase()+a.tool.slice(1):"";e+=`<button class="cell ${o?"has":"dim"}" data-t="${r}" draggable="true" title="${a.name}${l}${on?"":" · Umschalt-Klick: in freien Platz · auf die Hotbar ziehen"}">${vo(r)}<span>${a.name}</span><b>${o}</b></button>`}if(P("invGrid").innerHTML=e||'<div class="empty-note">Nichts gefunden.</div>',P("recH").hidden=i,i){P("recipes").innerHTML="";return}const s=gn.map((r,a)=>[r,a]).filter(([r])=>(ai==="all"||r.cat===ai)&&hM(r,t));P("recipes").innerHTML=s.length?s.map(([r,a])=>{const o=th(L.inv,r,Xe,ta),l=cM(L.inv,r,Xe,ta),c=r.need.map(([f,d])=>{const g=L.inv[f]||0;return g>=d?`${d}× ${ge(f)}`:`<i>${d}× ${ge(f)} (${g})</i>`}).join(" + "),h=o.full?" · Vorrat voll":o.noStation?` · <i>${Ou[r.st]} nicht in der Nähe</i>`:"",u=r.st?`<span class="badge">${r.st==="ofen"?"🔥":"🪚"} ${Ou[r.st]}</span>`:"";return`<button data-r="${a}" ${o.ok?"":"disabled"}>${vo(r.give[0])}<span><b>${r.give[1]}× ${ge(r.give[0])}</b>${u}<small>aus ${c}${h}</small></span><span class="cnt">${l?l+"×":""}</span></button>`}).join(""):'<div class="empty-note">Kein passendes Rezept.</div>'}P("invTabs").addEventListener("click",i=>{const t=i.target.closest("[data-cat]");t&&(ai=t.dataset.cat,jd(),ur())});P("invSearch").addEventListener("input",i=>{Yd=i.target.value,ur()});P("invOwned").addEventListener("change",i=>{Kd=i.target.checked,ur()});P("invGrid").addEventListener("click",i=>{const t=i.target.closest("[data-t]");if(!t)return;const e=Number(t.dataset.t);if(i.shiftKey){if(L.hotbar.includes(e)){ee("Liegt schon in der Hotbar");return}const n=L.hotbar.indexOf(0);if(n<0){ee("Kein freier Hotbar-Platz");return}L.hotbar[n]=e,L.unsaved=!0,L.onChange(),ee(`${ge(e)} → Platz ${n+1}`);return}Zd(L.sel,String(e))});P("invGrid").addEventListener("dragstart",i=>{const t=i.target.closest("[data-t]");t&&i.dataTransfer.setData("text/plain",t.dataset.t)});P("invGrid").addEventListener("dragover",i=>i.preventDefault());P("invGrid").addEventListener("drop",i=>{i.preventDefault();const t=i.dataTransfer.getData("text/plain");t[0]==="h"&&(L.hotbar[Number(t.slice(1))]=0,L.unsaved=!0,L.onChange())});P("invSort").addEventListener("change",i=>{Oc=i.target.value,ur()});P("recipes").addEventListener("click",i=>{const t=i.target.closest("[data-r]");if(!t)return;const e=gn[Number(t.dataset.r)];let n=0,s=null;for(let r=i.shiftKey?5:1;r>0&&(s=Td(L.inv,e,Xe,ta),!!s.ok);r--)n++;if(!n){ee(s.msg);return}L.unsaved=!0,L.onChange(),L.questEvent("craft",e.give[0],e.give[1]*n),ee(`+${e.give[1]*n} ${ge(e.give[0])}`)});L.onChange=()=>{Yi(),vt==="inventory"&&ur()};const zc=P("vit").getContext("2d"),ty=[".##.##.","#######","#######",".#####.","..###..","...#..."],ey=["....##.","...####","..#####",".####..","##.....","#......"],ny=["..###..",".#...#.","#.....#","#.....#",".#...#.","..###.."],iy=["#######","#######","#######",".#####.","..###..","...#..."];function Ya(i,t,e,n,s,r){for(let a=0;a<6;a++)for(let o=0;o<7;o++)i[a][o]==="#"&&(zc.fillStyle=o<3.5?n||s?n||s:r:n||r,zc.fillRect(t+o*2,e+a*2,2,2))}function sr(){const i=L.vitals,t=P("vit");if(t.hidden=!i||vt==="menu",!i)return;zc.clearRect(0,0,200,34);const e=Math.ceil(i.hp),n=Math.ceil(i.food);for(let r=0;r<Gs/2;r++){const a=e-r*2;Ya(ty,r*10,18,a>=2?"#ff3b4a":null,a===1?"#ff3b4a":null,"#3a1a20")}for(let r=0;r<Or/2;r++){const a=n-r*2;Ya(ey,186-r*10,18,a>=2?"#d89048":null,a===1?"#d89048":null,"#3a2a1a")}if(i.air<ro)for(let r=0;r<Math.ceil(i.air);r++)Ya(ny,186-r*10,2,"#9ad8ff",null,"#9ad8ff");const s=L.armorPoints();for(let r=0;r<s;r++)Ya(iy,r*10,2,"#cfd6e2",null,"#cfd6e2")}L.onVitals=sr;let gf=0;L.onHurt=()=>{const i=P("hurt");if(i.classList.add("on"),sr(),clearTimeout(gf),gf=setTimeout(()=>i.classList.remove("on"),120),navigator.vibrate&&on)try{navigator.vibrate(60)}catch{}};L.onMine=i=>{P("mine").classList.toggle("on",i>0),P("mine").firstChild.style.width=Math.round(i*100)+"%"};const sy={Sturz:"Zu tief gefallen.",Ertrunken:"Unter Wasser ging die Luft aus.",Magma:"Magma ist heiß.",Hunger:"Vor Hunger.",Rauschling:"Ein Rauschling hat dich erwischt.",Höhlenwesen:"Ein Höhlenwesen hat dich erwischt.","Störsender-Drohne":"Die Störimpulse einer Drohne waren zu viel."};L.onDeath=(i,t)=>{fr(),Ae("dead"),P("deadWhy").textContent=(sy[i]||"")+(t?" Dein Vorrat liegt am Unglücksort, der Wegpunkt 📍 zeigt den Weg.":" Dein Vorrat bleibt erhalten. Der Wegpunkt 📍 markiert den Unglücksort."),Rn()&&document.exitPointerLock(),xs(!1)};P("dRevive").onclick=()=>{L.revive(),Yi(),Ae("playing"),Ki()};P("dMenu").onclick=()=>{L.revive(),P("pMenu").onclick()};L.onStation=i=>{Gi=i,ai="all",Uo()};let us=null;function Jd(){const i=Id[us.role]||[];P("trName").firstChild.textContent=us.name+" ",P("trSay").textContent="„"+(T1[us.role]||"Hallo!")+"“",P("trList").innerHTML=i.map((t,e)=>{const n=th(L.inv,t),s=t.need.map(([r,a])=>{const o=L.inv[r]||0;return o>=a?`${a}× ${ge(r)}`:`<i>${a}× ${ge(r)} (${o})</i>`}).join(" + ");return`<button data-tr="${e}" ${n.ok?"":"disabled"}>${vo(t.give[0])}<span><b>${t.give[1]}× ${ge(t.give[0])}</b><small>für ${s}</small></span></button>`}).join("")}L.onTrade=i=>{if(vt==="playing"){if(L.mode==="creative"){ee(`${i.name}: „Im Kreativmodus hast du doch schon alles!“`);return}us=i,fr(),Ae("trade"),Jd(),Rn()&&document.exitPointerLock(),Io()}};P("trList").addEventListener("click",i=>{const t=i.target.closest("[data-tr]");if(!t||!us)return;const e=Id[us.role][Number(t.dataset.tr)],n=Td(L.inv,e);ee(n.ok?`Getauscht: ${n.msg}`:n.msg),n.ok&&(L.unsaved=!0,Jd(),Yi(),L.questEvent("trade",e.give[0]))});function rh(){vt==="trade"&&(us=null,Ae("playing"),L.resume(),Ki(),Wi()&&setTimeout(()=>{vt==="playing"&&!Rn()&&Wi()&&vi()},250))}P("trClose").onclick=rh;L.onBuildMode=i=>{const t=P("bmode");t.hidden=i.key==="einzeln",t.textContent=`▦ ${i.name}`+(i.clicks===2?" · zwei Ecken setzen":i.key==="einfuegen"?" · Setzen fügt ein":"")+" (G wechselt)",ee("Bauform: "+i.name)};P("bBuild").onclick=()=>L.cycleBuild(1);let ms=!1,_f=0;function _i(){const i=P("quest"),t=L.story;if(!t||L.menuMode){i.hidden=!0;return}if(i.hidden=!1,i.classList.toggle("min",ms),t.done){i.innerHTML='<b>🎉 Story abgeschlossen</b><small class="txt">Alle Aufträge erledigt. Baue frei weiter!</small>';return}const e=js(t),n=e[t.i],[s,r]=Dd(L,n),a=Math.min(100,Math.round(s/r*100)),o=n.c?`Kapitel ${n.c} · ${n.t}`:`Auftrag ${t.i+1}/${e.length} · ${n.t}`;i.innerHTML=`<b>${o}</b><div class="bar"><i style="width:${a}%"></i></div><small>${Math.min(s,r)} / ${r}${n.c?` · Auftrag ${t.i+1}/${e.length}`:""}</small><small class="txt">${n.d}</small>`}function Xr(i){const t=P("banner");t.innerHTML=i,t.classList.add("on"),clearTimeout(_f),_f=setTimeout(()=>t.classList.remove("on"),4200)}L.onQuest=_i;L.onQuestDone=(i,t)=>{const e=Object.entries(i.r||{}).map(([s,r])=>`+${r} ${ge(Number(s))}`).join(" · "),n=!t&&js(L.story)[L.story.i];t?Xr(i.c?"🎉 Das Rauschen ist verstummt!<small>Das Funknetz steht wieder. Die Welt gehört dir, baue frei weiter.</small>":`🎉 Story abgeschlossen!<small>${i.t} geschafft. Die Funkzentrale sendet wieder. Baue frei weiter.</small>`):n&&n.c&&n.c!==i.c?Xr(`📻 Kapitel ${n.c}: ${Qr[n.c].t}<small>${Qr[n.c].d}</small>`):Xr(`✔ Auftrag erledigt: ${i.t}<small>${e}</small>`)};function ry(){const i=L.story;i&&(P("qlist").innerHTML=js(i).map((t,e,n)=>{const s=i.done||e<i.i,r=!i.done&&e===i.i;return`${t.c&&(e===0||n[e-1].c!==t.c)?`<h3 class="qch">Kapitel ${t.c} · ${Qr[t.c].t}</h3>`:""}<div class="qi ${s?"done":r?"cur":""}"><span class="st">${s?"✔":r?"➜":e+1}</span><div><b>${t.t}</b>${s||r?`<small>${t.d}</small>`:""}</div></div>`}).join(""),P("qlogT").textContent=i.c==="rauschen"?"Das große Rauschen":"Aufträge der Funkzentrale")}P("quest").addEventListener("click",()=>{ms=!ms,_i()});P("pQuests").onclick=()=>{ry(),Ze("qlog",!0)};P("qlogClose").onclick=()=>Ze("qlog",!1);const Ze=(i,t)=>{P(i).hidden=!t};function Ae(i){vt=i,document.body.dataset.st=i,document.body.classList.toggle("playing",i==="playing"),Ze("map",i==="map"),Ze("menu",i==="menu"),Ze("pause",i==="paused"),Ze("inv",i==="inventory"),Ze("loading",i==="loading"),Ze("set",i==="settings"),Ze("dead",i==="dead"),Ze("trade",i==="trade"),Ze("mp",i==="mp"),Ze("hud",i==="playing"||i==="paused"||i==="inventory"||i==="dead"||i==="trade"||(i==="settings"||i==="mp")&&ps==="paused"),i!=="playing"&&L.onMine(0),i!=="paused"&&Ze("qlog",!1),i==="menu"&&ah(null)}const Rn=()=>document.pointerLockElement===ca,Wi=()=>!on&&!gt.raf;function Ki(){if(!(on||Rn()))try{const i=ca.requestPointerLock();i&&i.catch&&i.catch(()=>{})}catch{}}function fr(){L.breakHeld=L.placeHeld=!1,En.clear(),gs(),Object.assign(L.input,{f:0,r:0,jump:!1,down:!1,sprint:!1})}function Io(){L.mp||L.stop()}function vi(){vt==="playing"&&(Io(),fr(),xs(),P("pMp").hidden=!!L.story||!!(L.mp&&L.mp.guest),Ae("paused"),P("vd").value=L.viewDist,P("vdVal").textContent=L.viewDist,P("pQuests").hidden=!L.story,P("td").value=Math.round(L.time*100),P("tdVal").textContent=L.clockText(),Rn()&&document.exitPointerLock())}function No(){Ae("playing"),L.resume(),Ki()}function Uo(){vt==="playing"&&(ta=L.stationsNear(),Gi&&!ta.has(Gi)&&(Gi=null),fr(),Ae("inventory"),jd(),ur(),Yi(),Rn()&&document.exitPointerLock(),Io())}function ea(){vt==="inventory"&&(Gi=null,Ae("playing"),Yi(),L.resume(),Ki(),Wi()&&setTimeout(()=>{vt==="playing"&&!Rn()&&Wi()&&vi()},250))}document.addEventListener("pointerlockchange",()=>{!Rn()&&vt==="playing"&&Wi()&&vi()});document.addEventListener("pointerlockerror",()=>{if(!(vt!=="playing"||!Wi())){if(performance.now()-tp<2e3){ee("Ins Bild klicken, um loszulegen");return}vi()}});function xs(i){if(!L.world||ir<0||L.menuMode)return;const t=xd(ir,L.serialize());return t&&(L.unsaved=!1),(i||!t)&&ee(t?"Gespeichert ✔":"Speichern fehlgeschlagen (Speicher voll?)"),t}setInterval(()=>{vt==="playing"&&xs(!1)},3e4);window.addEventListener("pagehide",()=>xs(!1));document.addEventListener("visibilitychange",()=>{document.hidden&&vt==="playing"&&vi()});function ay(i){if(i=(i||"").trim(),!i)return Math.floor(Math.random()*2147483647);if(/^-?\d{1,9}$/.test(i))return Number(i);let t=2166136261;for(let e=0;e<i.length;e++)t=Math.imul(t^i.charCodeAt(e),16777619);return t|0}const vf=i=>String(i).replace(/[&<>"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[t]);function ci(){let i="";for(let t=0;t<Ro;t++){const e=md(t);if(e){const n=new Date(e.savedAt).toLocaleString("de-DE",{dateStyle:"short",timeStyle:"short"}),s=e.mode==="creative",r=e.mode==="story",a=e.qc==="rauschen"?Pd:Ld,o=e.q??0,l=r?`<span class="pill st">📜 Story · ${e.q===-1?"abgeschlossen":(a[o]&&a[o].c?"Kapitel "+a[o].c+" · ":"")+"Auftrag "+(o+1)+"/"+a.length}</span>`:`<span class="pill ${s?"cr":""}">${s?"Kreativ":"Überleben"}</span>`;i+=`<div class="card"><div class="top"><div class="ico">${r?"📜":s?"🕊":"⛏"}</div><div class="ttl"><b>${vf(e.name)}</b>${l}</div></div>
        <small>${r?"Feste Story-Welt":"Startwert "+vf(e.seed)}${(e.gen||1)<hd?" · klassische Welt":""} · zuletzt ${n}</small>
        <div class="row"><button class="go" data-act="load" data-i="${t}">▶ Weiterspielen</button><button data-act="exp" data-i="${t}" aria-label="Welt exportieren" title="Welt als Datei sichern">⤓</button>${jx(t)?`<button data-act="bak" data-i="${t}" aria-label="Sicherung laden" title="Ältere Sicherung wiederherstellen">↺</button>`:""}<button data-act="del" data-i="${t}" aria-label="Welt löschen" title="Welt löschen">🗑</button></div></div>`}else i+=`<div class="card new"><div class="top"><div class="ico">✨</div><div class="ttl"><b>Neue Welt ${t+1}</b><span class="pill">frei</span></div></div>
        <div class="seed"><input id="seed${t}" placeholder="Startwert (leer = Zufall)" maxlength="24" autocomplete="off"><button data-act="dice" data-i="${t}" aria-label="Zufälliger Startwert" title="Zufälliger Startwert">🎲</button></div>
        <div class="seg three" id="mode${t}"><button class="on" data-mode="survival">⛏ Überleben<small>Rohstoffe, Hunger</small></button><button data-mode="creative">🕊 Kreativ<small>alles, fliegen</small></button><button data-mode="story">📜 Story<small>6 Kapitel</small></button></div>
        <button class="go" data-act="new" data-i="${t}">Welt erzeugen</button></div>`}P("slots").innerHTML=i,oy()}let dn=null,Fc=-1;const xo={worlds:"pgWorlds",help:"pgHelp",data:"pgData"};function oy(){let i=null;for(let t=0;t<Ro;t++){const e=md(t);e&&(!i||e.savedAt>i.m.savedAt)&&(i={i:t,m:e})}if(Fc=i?i.i:-1,P("mContinue").hidden=!i,i){const t=i.m,e=t.mode==="story"?"Story":t.mode==="creative"?"Kreativ":"Überleben";P("mContinueSub").textContent=`${t.name} · ${e} · ${new Date(t.savedAt).toLocaleString("de-DE",{dateStyle:"short",timeStyle:"short"})}`}}function ah(i){dn=i||null;for(const[n,s]of Object.entries(xo))Ze(s,n===dn);P("menu").classList.toggle("paged",!!dn);for(const n of document.querySelectorAll("#mmNav [data-page]"))n.classList.toggle("cur",n.dataset.page===dn);const t=P(dn?xo[dn]:"mmNav"),e=dn&&t.querySelector(".go");e&&!on?e.focus():ly(t)}const ko=i=>[...i.querySelectorAll("button,input,select,a[href],summary")].filter(t=>!t.disabled&&t.offsetParent!==null);function ly(i,t=0){if(on)return;const e=ko(i);e.length&&e[Math.min(t,e.length-1)].focus({preventScroll:!1})}function Nl(i){const t=P(dn?xo[dn]:"mmNav"),e=ko(t);if(!e.length)return;const n=e.indexOf(document.activeElement);e[n<0?0:(n+i+e.length)%e.length].focus()}function oh(){if(dn){const i=dn;ah(null);const t=document.querySelector(`#mmNav [data-page=${i}]`);t&&!on&&t.focus()}}P("mmNav").addEventListener("click",i=>{const t=i.target.closest("[data-page]");t&&ah(t.dataset.page)});for(const i of document.querySelectorAll(".pg-back"))i.onclick=oh;P("mContinue").onclick=()=>{Fc>=0&&Qd(Fc)};P("mmVer").textContent=Z1;function na(i){const t=i==="pad"?[[Uc(gt.style,$d(gt.style)),"Auswählen",1],[Uc(gt.style,qd(gt.style)),"Zurück",1],["✚","Bewegen",1]]:[["↑↓","Auswählen"],["Enter","Bestätigen"],["Esc","Zurück"]];P("mmHints").innerHTML=t.map(([e,n,s])=>`<span><kbd class="${s?"pad":""}">${e}</kbd>${n}</span>`).join("")}na("keys");P("slots").addEventListener("click",i=>{const t=i.target.closest(".seg [data-mode]");if(t){for(const o of t.parentNode.children)o.classList.toggle("on",o===t);const s=t.closest(".card"),r=t.dataset.mode==="story",a=s.querySelector("input");a.disabled=r,a.placeholder=r?"feste Story-Welt":"Startwert (leer = Zufall)",s.querySelector("[data-act=dice]").disabled=r;return}const e=i.target.closest("[data-act]");if(!e)return;const n=Number(e.dataset.i);if(e.dataset.act==="dice")P("seed"+n).value=String(Math.floor(Math.random()*9e5)+1e5);else if(e.dataset.act==="del")confirm("Diese Welt wirklich löschen?")&&(Zx(n),ci());else if(e.dataset.act==="load")Qd(n);else if(e.dataset.act==="exp"){const s=gd(n);if(!s){ee("Speicherstand nicht lesbar");return}cy(`klotzfunk-${s.name.replace(/[^\w-]+/g,"_")}.json`,Jx(s))}else if(e.dataset.act==="bak"){const s=_d(n);if(!s){ee("Keine lesbare Sicherung"),ci();return}const r=new Date(s.savedAt).toLocaleString("de-DE",{dateStyle:"short",timeStyle:"short"});confirm(`Sicherung vom ${r} wiederherstellen? Der aktuelle Stand wird dafür zur Sicherung.`)&&(ee(Md(n)?"Sicherung wiederhergestellt":"Wiederherstellen fehlgeschlagen"),ci())}else{const s=P("mode"+n).querySelector(".on").dataset.mode;ep(n,{name:s==="story"?"Story "+(n+1):"Welt "+(n+1),seed:s==="story"?777:ay(P("seed"+n).value),mode:s,gen:hd})}});function Qd(i){let t=gd(i);if(!t){const e=_d(i);if(e&&confirm("Dieser Speicherstand ist beschädigt. Die letzte Sicherung laden?"))Md(i),t=e;else{ee("Speicherstand nicht lesbar"),ci();return}}ep(i,t)}function cy(i,t){try{const e=URL.createObjectURL(new Blob([t],{type:"application/json"})),n=document.createElement("a");n.href=e,n.download=i,document.body.appendChild(n),n.click(),n.remove(),setTimeout(()=>URL.revokeObjectURL(e),2e3)}catch{ee("Export nicht möglich")}}P("mImport").onclick=()=>{if(yd()<0){ee("Kein freier Platz – lösche zuerst eine Welt");return}P("importFile").value="",P("importFile").click()};P("importFile").addEventListener("change",i=>{const t=i.target.files&&i.target.files[0];if(t){if(t.size>8*1024*1024){ee("Datei zu groß");return}t.text().then(e=>{const n=Qx(e),s=yd();if(!n){ee("Keine gültige KLOTZFUNK-Welt");return}if(s<0){ee("Kein freier Platz");return}ee(xd(s,n)?`„${n.name}“ importiert (Platz ${s+1})`:"Import fehlgeschlagen (Speicher voll?)"),ci()}).catch(()=>ee("Datei nicht lesbar"))}});const Ul=["Halte die Sprungtaste im Fall gedrückt, um zu gleiten.","Q oder „Haken“ zieht dich mit dem Seilhaken bis zu 40 Blöcke weit.","Mit M oder 🗺 öffnest du die Weltkarte. Dort kannst du eigene Markierungen setzen.","Erze brauchen eine Spitzhacke. Für Eisen und Funkkristall muss sie mindestens aus Stein sein.","Nachts kommen Rauschlinge. Sie verfolgen dich nur, wenn sie dich sehen.","Setzen auf einen Dorfbewohner öffnet den Handel.","Ein Schalter speist den Funksender daneben. Relais tragen das Signal weiter.","Ein Boot fährt auf Wasser, eine Lore folgt Schienen über Kurven und Stufen.","G wechselt die Bauform: Linie, Fläche, Wand oder Säule.","Weizen wächst auf Ackerboden. Aus 3 Weizen wird Brot.","Pause → 👥 Mehrspieler lädt bis zu 4 Freunde in deine Welt ein.","In den Einstellungen kannst du alle Tasten neu belegen und die Touch-Tasten verschieben."];let Mo=0,tp=0;function hy(i){const t={story:"📜 Story",creative:"🕊 Kreativ"}[i.mode]||"⛏ Überleben";P("ldName").textContent=i.name||"Welt",P("ldMode").textContent=t;let e=Math.floor(Math.random()*Ul.length);const n=()=>{P("ldTip").textContent=Ul[e++%Ul.length]};n(),clearInterval(Mo),Mo=setInterval(n,4e3),yo(.04,i.px===void 0?"Welt wird erzeugt …":"Spielstand wird geladen …")}function yo(i,t){P("ldFill").style.width=Math.round(i*100)+"%",P("ldBar").setAttribute("aria-valuenow",Math.round(i*100)),t&&(P("ldStep").textContent=t)}function uy(i){const t=performance.now(),e=Math.min(L.viewDist,3)+.5;L.resume();const n=()=>{if(vt!=="loading")return;const s=L.areaReady(e);if(yo(.3+s*.7,`Umgebung wird gebaut … ${Math.round(s*100)} %`),s>=1||performance.now()-t>1e4){yo(1,"Los geht’s!"),setTimeout(i,180);return}setTimeout(n,100)};n()}function ep(i,t){Hi(),ir=i,hy(t),Ae("loading"),requestAnimationFrame(()=>setTimeout(()=>{try{L.start(t),yo(.3,"Umgebung wird gebaut …"),t.mode==="creative"&&(L.player.flying=!1),P("bFly").hidden=!(on&&L.mode==="creative"),P("bUndo").hidden=L.mode!=="creative",P("bmode").hidden=!0,Yi(),_i(),uy(()=>{clearInterval(Mo),vt==="loading"&&(Ae("playing"),sr(),tp=performance.now(),Ki(),fy(t))})}catch(e){clearInterval(Mo),console.error(e),Ae("menu"),ci(),alert("Die Welt konnte nicht gestartet werden.")}},30))}function fy(i){L.story&&L.story.i===0&&L.story.p===0&&i.px===void 0&&Xr(L.story.c?`📻 Kapitel 1: ${Qr[1].t}<small>${Qr[1].d} Dein Auftrag steht links (J blendet ihn aus).</small>`:"📜 Willkommen in der Funkzentrale!<small>Dein erster Auftrag steht links. J blendet ihn ein oder aus.</small>"),!L.unsaved&&i.px===void 0&&xs(!1)}P("pResume").onclick=()=>{Hi(),No()};P("pSave").onclick=()=>xs(!0);P("pRespawn").onclick=()=>{L.respawn(),No()};P("pSound").onclick=()=>{nn.enabled=!nn.enabled,P("pSound").textContent=nn.enabled?"🔊 Ton: an":"🔇 Ton: aus"};P("pFull").onclick=()=>{try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}catch{}};P("pMenu").onclick=()=>{L.mp&&Hn.end(null),xs(!1),ir=-1,ci(),Ae("menu"),L.startMenu(),_i(),sr()};P("vd").oninput=i=>{const t=Number(i.target.value);L.maxView=t,L.setViewDist(t),P("vdVal").textContent=t};P("invClose").onclick=ea;P("bInv").onclick=Uo;P("bWp").onclick=()=>L.toggleWaypoint();P("bUndo").onclick=()=>L.undo(!1);P("bMap").onclick=()=>zo();P("td").oninput=i=>{L.time=Number(i.target.value)/100,P("tdVal").textContent=L.clockText(),L.updateSky(),L.render()};P("pFreeze").onclick=()=>{L.timeFrozen=!L.timeFrozen,P("pFreeze").textContent=L.timeFrozen?"⏸ Zeit steht still":"⏱ Zeit läuft"};P("bPause").onclick=vi;function gs(){const i=L.input;if(zn.joy||gt.active)return;const t=n=>En.has($n[n]);i.f=(t("fwd")||En.has("ArrowUp")?1:0)-(t("back")||En.has("ArrowDown")?1:0),i.r=(t("right")||En.has("ArrowRight")?1:0)-(t("left")||En.has("ArrowLeft")?1:0);const e=L.player.flying;i.sprint=t("sprint")||!e&&t("sneak"),i.down=e&&t("sneak")||zn.down,i.jump=t("jump")||zn.jump}const zn={joy:!1,jump:!1,down:!1};let xf=0;function So(){if(L.mode!=="creative"||L.ride)return;const i=L.player;i.flying=!i.flying,i.vy=0,ee(i.flying?"Fliegen an":"Fliegen aus"),P("bDown").hidden=!(on&&i.flying),P("bFly").classList.toggle("on",i.flying)}window.addEventListener("keydown",i=>{if(hi){if(i.preventDefault(),i.code!=="Escape"){const e=V1($n,hi,i.code);e?($n=e,ht.keys={...e},$i(ht)):ee("Diese Taste ist reserviert")}hi=null,ch();return}if(vt==="menu"&&i.target&&i.target.tagName==="INPUT"&&(i.code==="ArrowUp"||i.code==="ArrowDown")){i.preventDefault(),Nl(i.code==="ArrowDown"?1:-1);return}if(i.target&&/^(INPUT|SELECT|TEXTAREA)$/.test(i.target.tagName)){i.code==="Escape"&&(i.target.blur(),vt==="inventory"?ea():vt==="settings"&&Eo());return}if(vt==="menu"){i.code==="ArrowDown"||i.code==="ArrowRight"?(i.preventDefault(),Nl(1)):i.code==="ArrowUp"||i.code==="ArrowLeft"?(i.preventDefault(),Nl(-1)):(i.code==="Escape"||i.code==="Backspace")&&(i.preventDefault(),oh()),na("keys");return}if(vt==="settings"){i.code==="Escape"&&Eo();return}if(vt==="mp"){i.code==="Escape"&&P("mpClose").onclick();return}if(vt==="map"){(i.code==="Escape"||i.code===$n.map)&&(i.preventDefault(),Fo());return}if(vt==="layout"){i.code==="Escape"&&hh();return}if(vt==="trade"){(i.code==="Escape"||i.code==="KeyE")&&(i.preventDefault(),rh());return}if(vt==="inventory"){(i.code===$n.inv||i.code==="Escape")&&(i.preventDefault(),ea());return}if(vt!=="playing")return;const t=W1($n,i.code);if((t==="jump"||i.code==="Tab"||i.code.startsWith("Arrow"))&&i.preventDefault(),!i.repeat){if(/^Digit[1-9]$/.test(i.code)){L.selectSlot(Number(i.code[5])-1);return}if(i.code==="KeyZ"&&(i.ctrlKey||i.metaKey)){i.preventDefault(),L.undo(i.shiftKey);return}if(i.code==="KeyY"&&(i.ctrlKey||i.metaKey)){i.preventDefault(),L.undo(!0);return}if(t==="inv"){i.preventDefault(),Uo();return}if(t==="fly"){So();return}if(t==="build"){L.cycleBuild(i.shiftKey?-1:1);return}if(t==="hook"){L.fireHook();return}if(t==="wp"){L.toggleWaypoint();return}if(t==="map"){zo();return}if(t==="quests"){ms=!ms,_i();return}if(t==="jump"){const e=performance.now();e-xf<280&&So(),xf=e}En.add(i.code),gs()}});window.addEventListener("keyup",i=>{En.delete(i.code),vt==="playing"&&gs()});window.addEventListener("blur",()=>{En.clear(),gs()});const np=.0022,dy=.0058;function lh(i,t,e){L.yaw-=i*e,L.pitch=Math.max(-1.55,Math.min(1.55,L.pitch-t*e*(ht.invertY?-1:1)))}window.addEventListener("mousemove",i=>{vt==="playing"&&Rn()&&lh(i.movementX,i.movementY,np*ht.mouseSens)});ca.addEventListener("mousedown",i=>{if(!(vt!=="playing"||on&&i.sourceCapabilities&&i.sourceCapabilities.firesTouchEvents)){if(Hi(),!Rn()){Ki();return}i.button===0?L.breakHeld=!0:i.button===2&&(L.placeHeld=!0),i.preventDefault()}});window.addEventListener("mouseup",i=>{i.button===0?L.breakHeld=!1:i.button===2&&(L.placeHeld=!1)});ca.addEventListener("contextmenu",i=>i.preventDefault());window.addEventListener("wheel",i=>{vt==="playing"&&L.selectSlot(L.sel+(i.deltaY>0?1:-1))},{passive:!0});function py(){on&&document.body.classList.contains("touch")||(on=!0,document.body.classList.add("touch"),P("bFly").hidden=L.mode!=="creative")}on&&document.body.classList.add("touch");window.addEventListener("pointerdown",i=>{i.pointerType==="touch"&&py()},{capture:!0});(function(){const t=P("zl"),e=P("zr"),n=P("joy"),s=P("thumb"),r=52;let a=null,o=null;t.addEventListener("pointerdown",u=>{a||(Hi(),a={id:u.pointerId,x:u.clientX,y:u.clientY},t.setPointerCapture(u.pointerId),n.style.display="block",n.style.left=u.clientX+"px",n.style.top=u.clientY+"px",s.style.transform="translate(0,0)",zn.joy=!0)}),t.addEventListener("pointermove",u=>{if(!a||u.pointerId!==a.id)return;let f=u.clientX-a.x,d=u.clientY-a.y;const g=Math.hypot(f,d),_=g>r?r/g:1;s.style.transform=`translate(${f*_}px,${d*_}px)`;const m=Math.min(1,g*ht.joySens/r),p=m<.14?0:(m-.14)/.86,x=g?f/g:0,y=g?d/g:0;L.input.r=x*p,L.input.f=-y*p,L.input.sprint=g>r*1.35});const l=u=>{!a||u.pointerId!==a.id||(a=null,n.style.display="none",zn.joy=!1,L.input.f=L.input.r=0,L.input.sprint=!1,gs())};t.addEventListener("pointerup",l),t.addEventListener("pointercancel",l),e.addEventListener("pointerdown",u=>{o||(o={id:u.pointerId,x:u.clientX,y:u.clientY},e.setPointerCapture(u.pointerId))}),e.addEventListener("pointermove",u=>{!o||u.pointerId!==o.id||(lh(u.clientX-o.x,u.clientY-o.y,dy*ht.touchSens),o.x=u.clientX,o.y=u.clientY)});const c=u=>{o&&u.pointerId===o.id&&(o=null)};e.addEventListener("pointerup",c),e.addEventListener("pointercancel",c);const h=(u,f,d)=>{const g=P(u);g.addEventListener("pointerdown",m=>{m.preventDefault(),Hi(),g.setPointerCapture(m.pointerId),g.classList.add("on"),f()});const _=()=>{g.classList.remove("on"),d()};g.addEventListener("pointerup",_),g.addEventListener("pointercancel",_)};h("bBreak",()=>{L.breakHeld=!0},()=>{L.breakHeld=!1}),h("bPlace",()=>{L.placeHeld=!0},()=>{L.placeHeld=!1}),h("bJump",()=>{zn.jump=!0,L.input.jump=!0},()=>{zn.jump=!1,L.input.jump=En.has("Space")}),h("bDown",()=>{zn.down=!0,L.input.down=!0},()=>{zn.down=!1,L.input.down=!1}),P("bFly").addEventListener("click",So),P("bHook").addEventListener("pointerdown",u=>{u.preventDefault(),Hi(),L.fireHook()})})();const gt={active:!1,prev:[],raf:0,last:0,idx:-1,style:"generic",used:0,cap:null,rt:!1,lt:!1,run:!1,dir:"",dirT:0,dirN:0};let rr=ih(ht.padKeys);function Oo(){const i=navigator.getGamepads?[...navigator.getGamepads()]:[],t=i[gt.idx];if(t&&t.connected)return t;const e=i.find(n=>n&&n.connected);return e&&(gt.idx=e.index,gt.style=Wd(e.id)),e||null}Nc.fn=i=>{gt.raf&&performance.now()-gt.used<3e4&&Do(Oo(),i,ht.padRumble)};const Mf={inventory:"inv",settings:"set",mp:"mp",map:"map",trade:"trade",dead:"dead"};function oo(){return vt==="menu"?P(dn?xo[dn]:"mmNav"):vt==="paused"?P("qlog").hidden?P("pause"):P("qlog"):Mf[vt]?P(Mf[vt]):null}function my(){vt==="menu"?oh():vt==="paused"?P("qlog").hidden?No():Ze("qlog",!1):vt==="inventory"?ea():vt==="settings"?gt.cap||hi?(gt.cap=hi=null,uh()):Eo():vt==="mp"?P("mpClose").onclick():vt==="map"?Fo():vt==="trade"?rh():vt==="layout"&&hh()}const kl=(i,t)=>i.dispatchEvent(new Event(t,{bubbles:!0}));function Bc(i){i.focus({preventScroll:!0,focusVisible:!0}),i.scrollIntoView({block:"nearest",inline:"nearest"})}function gy(i){const t=oo();if(!t)return;const e=ko(t);if(!e.length)return;const n=e.indexOf(document.activeElement),s=e[n];if(s&&(i==="left"||i==="right")){const o=i==="right"?1:-1;if(s.type==="range"){o>0?s.stepUp():s.stepDown(),kl(s,"input"),kl(s,"change");return}if(s.tagName==="SELECT"){const l=s.options.length;s.selectedIndex=(s.selectedIndex+o+l)%l,kl(s,"change");return}}if(n<0){Bc(t.querySelector(".cell:not([disabled]),.go,.big")||e.find(o=>!o.classList.contains("x"))||e[0]);return}const r=e.map(o=>{const l=o.getBoundingClientRect();return{x:l.left,y:l.top,w:l.width,h:l.height}});let a=K1(r,n,i);a<0&&(i==="up"||i==="down")&&(a=(n+(i==="down"?1:-1)+e.length)%e.length),a>=0&&Bc(e[a])}function _y(i){for(let t=i;t&&t!==document.body;t=t.parentElement){const e=getComputedStyle(t).overflowY;if((e==="auto"||e==="scroll")&&t.scrollHeight>t.clientHeight)return t}return null}function vy(i,t){const e=i.buttons,n=e[se.UP]?"up":e[se.DOWN]?"down":e[se.LEFT]?"left":e[se.RIGHT]?"right":i.f>.55?"up":i.f<-.55?"down":i.r<-.55?"left":i.r>.55?"right":"";return n!==gt.dir?(gt.dir=n,gt.dirT=t,gt.dirN=0,n):n&&t-gt.dirT>(gt.dirN?110:380)?(gt.dirT=t,gt.dirN++,n):""}function xy(i,t,e,n){if(gt.cap){const r=i.buttons.findIndex((a,o)=>a&&o<nh&&t(o));if(r>=0){const a=$1(rr,gt.cap,r);a&&(rr=a,ht.padKeys={...a},$i(ht)),gt.cap=null,dr()}return}if(vt==="paused"&&i.hit.pause){No();return}if(vt==="inventory"&&i.hit.inv){ea();return}if(vt==="map"&&i.hit.map){Fo();return}if(t(qd(gt.style))){my();return}const s=vy(i,e);if(s&&gy(s),t($d(gt.style))){const r=oo(),a=document.activeElement;if(r&&a&&r.contains(a)&&a!==document.body)a.click();else if(r){const o=ko(r);o[0]&&Bc(o[0])}}if(vt==="inventory"){if(t(se.LB)||t(se.RB)){const r=[...P("invTabs").querySelectorAll("[data-cat]")],a=r.findIndex(l=>l.dataset.cat===ai),o=r[(a+(t(se.RB)?1:-1)+r.length)%r.length];o&&o.click()}(t(se.LT)||t(se.RT))&&(L.selectSlot((L.sel+(t(se.RT)?1:8))%9),Yi()),t(se.W)&&document.activeElement&&document.activeElement.closest("#invGrid,#recipes")&&document.activeElement.dispatchEvent(new MouseEvent("click",{bubbles:!0,shiftKey:!0}))}if(vt==="map"){if(t(se.LB)&&Li.zoom(-1),t(se.RB)&&Li.zoom(1),i.lx||i.ly){const r=160*n/Math.max(.25,Li.zoomLevel?Li.zoomLevel():1);Li.cx+=i.lx*r,Li.cz+=i.ly*r,Li.draw()}}else if(i.ly){const r=_y(document.activeElement)||oo()&&oo().querySelector(".panel");r&&(r.scrollTop+=i.ly*18)}}const yf=i=>i*(.45+.55*Math.abs(i));function ip(i){const t=Oo();if(!t){gt.raf=0,gt.active=!1,dr(),na("keys");return}gt.raf=requestAnimationFrame(ip);const e=Math.min(.05,(i-(gt.last||i))/1e3);gt.last=i;const n=gt.prev,s=Y1(t,n,rr,ht.padDead);gt.prev=s.buttons;const r=h=>s.buttons[h]&&!n[h];if((s.buttons.some(Boolean)||s.r||s.f||s.lx||s.ly)&&((!gt.used||i-gt.used>5e3)&&(document.body.classList.add("pad"),vt==="menu"&&na("pad")),gt.used=i,Hi()),vt==="loading")return;if(vt!=="playing"){xy(s,r,i,e);return}const a=L.input,o=s.r||s.f,l=L.player.flying,c=s.held;s.hit.sprint&&(gt.run=!gt.run),o?(gt.active=!0,a.r=s.r,a.f=s.f,a.sprint=gt.run||!l&&c.sneak):gt.active&&(gt.active=!1,gt.run=!1,a.f=a.r=0,a.sprint=!1,gs()),(s.lx||s.ly)&&lh(yf(s.lx)*900*e,yf(s.ly)*600*e*(ht.padInvertY?-1:1),np*ht.padSens),a.jump=c.jump||En.has($n.jump)||zn.jump,a.down=c.sneak&&l||zn.down||l&&En.has($n.sneak),!o&&c.sneak!==!!gt.sneak&&(c.sneak?a.sprint=!l:gs()),gt.sneak=c.sneak,c.break!==gt.rt&&(gt.rt=c.break,L.breakHeld=gt.rt),c.place!==gt.lt&&(gt.lt=c.place,L.placeHeld=gt.lt),s.hit.hook&&(Do(t,"hook",ht.padRumble),L.fireHook()),s.hit.prev&&L.selectSlot((L.sel+8)%9),s.hit.next&&L.selectSlot((L.sel+1)%9),s.hit.fly&&So(),s.hit.wp&&L.toggleWaypoint(),s.hit.build&&L.cycleBuild(1),s.hit.quests&&(ms=!ms,_i()),s.hit.undo&&L.mode==="creative"&&L.undo(!1),s.hit.inv?Uo():s.hit.map?zo():s.hit.pause&&vi()}window.addEventListener("gamepadconnected",i=>{gt.idx=i.gamepad.index,gt.style=Wd(i.gamepad.id),gt.used=performance.now(),document.body.classList.add("pad"),ee(`🎮 ${Xd[gt.style]} verbunden`),na("pad"),dr(),Do(i.gamepad,"done",ht.padRumble),gt.raf||(gt.raf=requestAnimationFrame(ip))});window.addEventListener("gamepaddisconnected",i=>{i.gamepad.index===gt.idx&&(gt.idx=-1,ee("🎮 Controller getrennt"),fr(),vt==="playing"&&vi())});window.addEventListener("mousemove",()=>{gt.used&&performance.now()-gt.used>1500&&document.body.classList.remove("pad")},{passive:!0});window.addEventListener("resize",()=>L.resize());let _s=ht.minimap;P("mm").classList.toggle("off",!_s);const Li=new G1(L,P,ee);function zo(){vt!=="playing"||!L.map||(fr(),Ae("map"),P("mapMini").checked=_s,Rn()&&document.exitPointerLock(),Io(),Li.open())}function Fo(){vt==="map"&&(Ae("playing"),L.resume(),Ki(),Wi()&&setTimeout(()=>{vt==="playing"&&!Rn()&&Wi()&&vi()},250))}P("mapClose").onclick=Fo;P("mm").addEventListener("click",()=>zo());P("mapMini").onchange=i=>{_s=ht.minimap=i.target.checked,$i(ht),P("mm").classList.toggle("off",!_s)};const Ie=P("mm").getContext("2d"),Sf=Ie.createImageData(56,56);function My(){const i=L.world,t=L.player,e=Sf.data,n=Math.floor(t.x)-28,s=Math.floor(t.z)-28,r=t.y;for(let a=0;a<56;a++)for(let o=0;o<56;o++){const l=n+o,c=s+a,h=i.getChunk(l>>4,c>>4),u=(a*56+o)*4;let f=14,d=18,g=32;if(h){const _=(l&15)+(c&15)*16;let m=Math.min(le-1,h.maxY);for(;m>0&&h.data[_+m*256]===0;)m--;const p=h.data[_+m*256],x=Yt[p]?Yt[p].map:[200,200,210],y=p===v.WATER?1:Math.max(.55,Math.min(1.25,1+(m-r)*.025));f=x[0]*y,d=x[1]*y,g=x[2]*y}e[u]=f,e[u+1]=d,e[u+2]=g,e[u+3]=255}if(Ie.putImageData(Sf,0,0),L.wp){let a=L.wp.x-t.x,o=L.wp.z-t.z;const l=Math.max(Math.abs(a),Math.abs(o)),c=l>25?25/l:1;a*=c,o*=c,Ie.fillStyle="#ff2d95",Ie.fillRect(28+a-2,28+o-2,5,5),Ie.strokeStyle="#fff",Ie.strokeRect(28+a-2.5,28+o-2.5,6,6)}Ie.save(),Ie.translate(28,28),Ie.rotate(-L.yaw),Ie.fillStyle="#fff",Ie.strokeStyle="#000",Ie.beginPath(),Ie.moveTo(0,-5),Ie.lineTo(3.5,4),Ie.lineTo(0,2),Ie.lineTo(-3.5,4),Ie.closePath(),Ie.fill(),Ie.stroke(),Ie.restore()}let yy=0;setInterval(()=>{if(vt!=="playing")return;const i=L.player;let t="";i.flying&&(t+=" · fliegt"),i.gliding&&(t+=" · gleitet"),L.hookT>0&&(t+=" · Haken"),L.wp&&(t+=` · 📍 ${Math.round(Math.hypot(L.wp.x-i.x,L.wp.z-i.z))} m`),L.radioDist<24&&(t+=" · ♪");const e=L.biomeName();e&&(t+=" · "+e),ht.showFps&&(t+=` · ${L.fps} FPS`),P("info").textContent=`${L.clockText()} ${L.time<.5?"☀":"☾"} · X ${i.x.toFixed(0)} Y ${i.y.toFixed(0)} Z ${i.z.toFixed(0)}${t}`,P("uw").classList.toggle("on",!!L.underwater),_s&&!(yy++&1)&&My(),L.story&&_i()},250);function sp(){const i=ht.quality==="auto";L.setQuality(i?eM(sh):ht.quality,i),L.placeDelay=ht.placeDelay,L.deathLoss=ht.deathLoss,L.enemies=ht.enemies,L.preview=ht.preview,nn.vol=ht.sfxVol,nn.music=ht.musicVol,nn.amb=ht.ambVol,document.documentElement.style.setProperty("--tbs",String(ht.btnScale)),document.body.classList.toggle("lefty",ht.lefty)}const rp=[["sMouse","mouseSens",i=>i.toFixed(1)+"×"],["sTouch","touchSens",i=>i.toFixed(1)+"×"],["sJoy","joySens",i=>i.toFixed(1)+"×"],["sBtn","btnScale",i=>Math.round(i*100)+" %"],["sSfx","sfxVol",i=>Math.round(i*100)+" %"],["sMus","musicVol",i=>Math.round(i*100)+" %"],["sAmb","ambVol",i=>Math.round(i*100)+" %"],["sPadSens","padSens",i=>i.toFixed(1)+"×"],["sPadRum","padRumble",i=>i?Math.round(i*100)+" %":"aus"],["sPadDead","padDead",i=>Math.round(i*100)+" %"]],ap=[["sPadInv","padInvertY"],["sLefty","lefty"],["sInvY","invertY"],["sPlace","placeDelay"],["sFps","showFps"],["sEnemy","enemies"],["sPreview","preview"]];let hi=null;function ch(){const i=P("sKeys");i.textContent="";for(const[t,e]of Vr){const n=document.createElement("label"),s=document.createElement("button");n.textContent=e,s.dataset.a=t,s.textContent=hi===t?"Taste drücken …":X1($n[t]),s.className=hi===t?"wait":"",n.append(s),i.append(n)}}function dr(){const i=P("sPadKeys");if(!i)return;const t=gt.raf?Oo():null;P("sPad").textContent=t?`Erkannt: ${Xd[gt.style]} (${String(t.id).slice(0,48)})${t.vibrationActuator||t.hapticActuators&&t.hapticActuators.length?" · mit Vibration":""}`:"Kein Controller erkannt – eine Taste am Controller drücken.",i.textContent="";for(const[e,n]of Wr){const s=document.createElement("label"),r=document.createElement("button");s.textContent=n,r.dataset.pa=e,r.textContent=gt.cap===e?"Taste drücken …":Uc(gt.style,rr[e]),r.className=gt.cap===e?"wait":"",s.append(r),i.append(s)}}P("sPadKeys").addEventListener("click",i=>{const t=i.target.closest("button[data-pa]");t&&(i.preventDefault(),gt.cap=t.dataset.pa,dr(),t.focus())});P("sPadTest").onclick=()=>{const i=Oo();ee(i&&Do(i,"hurt",Math.max(.5,ht.padRumble))?"📳 Vibration":"Dieser Controller oder Browser kann nicht vibrieren")};P("sPadReset").onclick=()=>{ht.padKeys={},rr=ih({}),$i(ht),dr(),ee("Controller-Belegung zurückgesetzt")};P("sKeys").addEventListener("click",i=>{const t=i.target.closest("button[data-a]");t&&(i.preventDefault(),hi=t.dataset.a,ch())});const Sy=["bJump","bDown","bBreak","bPlace","bFly","bHook"];function Bo(){for(const i of Sy){const t=P(i),e=ht.touchPos[i],n=Array.isArray(e)&&e.length===2&&e.every(s=>Number.isFinite(s)&&s>=0&&s<=1);t.style.left=n?e[0]*100+"%":"",t.style.top=n?e[1]*100+"%":"",t.style.right=t.style.bottom=n?"auto":"",t.style.transform=n?"translate(-50%,-50%)":""}}let op="settings",$r=null;function Ey(){op=ps,Ae("layout"),P("layoutBar").hidden=!1}function hh(){P("layoutBar").hidden=!0,$i(ht),Ae("settings"),ps=op}P("sLayout").onclick=Ey;P("lDone").onclick=hh;P("lReset").onclick=()=>{ht.touchPos={},Bo()};P("touch").addEventListener("pointerdown",i=>{if(vt!=="layout")return;const t=i.target.closest(".tb");if(i.stopPropagation(),i.preventDefault(),!!t){try{t.setPointerCapture(i.pointerId)}catch{}$r={el:t,id:i.pointerId}}},{capture:!0});P("touch").addEventListener("pointermove",i=>{if(vt!=="layout"||!$r||$r.id!==i.pointerId)return;const t=Math.max(.04,Math.min(.96,i.clientX/innerWidth)),e=Math.max(.1,Math.min(.94,i.clientY/innerHeight));ht.touchPos={...ht.touchPos,[$r.el.id]:[+t.toFixed(3),+e.toFixed(3)]},Bo()},{capture:!0});P("touch").addEventListener("pointerup",i=>{vt==="layout"&&(i.stopPropagation(),$r=null)},{capture:!0});function uh(){ch(),dr(),P("sQuality").value=ht.quality,P("sDeath").value=ht.deathLoss;for(const[i,t,e]of rp)P(i).value=ht[t],P(i+"V").textContent=e(ht[t]);for(const[i,t]of ap)P(i).checked=ht[t]}function ha(i){$i(ht),i?sp():(L.placeDelay=ht.placeDelay,L.deathLoss=ht.deathLoss,L.enemies=ht.enemies,L.preview=ht.preview,nn.vol=ht.sfxVol,nn.music=ht.musicVol,document.documentElement.style.setProperty("--tbs",String(ht.btnScale)),document.body.classList.toggle("lefty",ht.lefty))}P("sQuality").onchange=i=>{ht.quality=i.target.value,ha(!0)};P("sDeath").onchange=i=>{ht.deathLoss=i.target.value,ha(!1)};for(const[i,t,e]of rp)P(i).oninput=n=>{ht[t]=Number(n.target.value),P(i+"V").textContent=e(ht[t]),ha(!1)};for(const[i,t]of ap)P(i).onchange=e=>{ht[t]=e.target.checked,ha(!1)};P("sReset").onclick=()=>{ht={...Ur,keys:{},padKeys:{},touchPos:{},stun:ht.stun,mpName:ht.mpName},$n=Vd(ht.keys),rr=ih({}),Bo(),_s=ht.minimap,P("mm").classList.toggle("off",!_s),ha(!0),uh(),ee("Standard wiederhergestellt")};function lp(){ps=vt,uh(),Ae("settings")}function Eo(){vt==="settings"&&(hi=null,gt.cap=null,Ae(ps),ps==="paused"&&(P("vd").value=L.viewDist,P("vdVal").textContent=L.viewDist))}P("pSettings").onclick=lp;P("mSettings").onclick=lp;P("setClose").onclick=Eo;sp();Bo();ci();const Hn=new H1(L,{toast:i=>ee(i),status:i=>{P("mpStatus").textContent=i},players:i=>{P("mpPlayers").innerHTML=i.map(t=>`<li><span>👤 ${t.name.replace(/[<>&]/g,"")}</span>${Hn.host?`<button data-kick="${t.id}">Entfernen</button>`:""}</li>`).join("")},joined:i=>{ir=-1,P("bFly").hidden=!(on&&L.mode==="creative"),P("bUndo").hidden=L.mode!=="creative",P("bmode").hidden=!0,Yi(),_i(),Ae("playing"),sr(),Ki(),Xr(`👥 Bei ${String(i.host).replace(/[<>&]/g,"")}<small>Du spielst in seiner Welt. Dein Vorrat gilt nur für diesen Besuch; gespeichert wird beim Gastgeber.</small>`)},ended:(i,t)=>{ee(i),t?(ir=-1,ci(),Ae("menu"),L.startMenu(),_i(),sr()):Hn.listPlayers()}});let $s=null,cp="menu";function hp(i){cp=vt,ps=vt==="paused"?"paused":"menu",P("mpHost").hidden=!i,P("mpGuest").hidden=i,P("mpStun").checked=ht.stun,P("mpName").value=ht.mpName,P("mpStatus").textContent="",i&&Hn.listPlayers(),Ae("mp")}P("pMp").onclick=()=>hp(!0);P("mJoin").onclick=()=>{Hi(),P("mpAnswerBox").hidden=!0,hp(!1)};P("mpClose").onclick=()=>{Ae(cp==="paused"?"paused":"menu")};P("mpStun").onchange=i=>{ht.stun=i.target.checked,$i(ht)};const up=i=>{const t=P(i);t.select(),(navigator.clipboard?navigator.clipboard.writeText(t.value):Promise.reject()).then(()=>ee("Kopiert ✔"),()=>{document.execCommand("copy"),ee("Kopiert")})};P("mpCopyO").onclick=()=>up("mpOffer");P("mpCopyA").onclick=()=>up("mpAnswer");P("mpInvite").onclick=async()=>{Hn.useStun=ht.stun,Hn.myName=ht.mpName||"Gastgeber",P("mpStatus").textContent="Einladung wird vorbereitet …",P("mpInvite").disabled=!0;try{$s=await Hn.invite(),P("mpOffer").value=$s.code,P("mpAnswerIn").value="",P("mpOfferBox").hidden=!1,P("mpStatus").textContent="Einladung kopieren und schicken, dann die Antwort einfügen."}catch(i){P("mpStatus").textContent="Einladung ging nicht: "+(i.message||i)}P("mpInvite").disabled=!1};P("mpConnect").onclick=async()=>{if($s)try{await $s.accept(P("mpAnswerIn").value),P("mpStatus").textContent="Verbinde …";const i=$s.pc;$s=null,P("mpOfferBox").hidden=!0;const t=setTimeout(()=>{i.connectionState!=="connected"&&(P("mpStatus").textContent="Keine Verbindung. Tipp: „Über das Internet verbinden“ bei beiden einschalten oder im selben WLAN spielen.")},15e3);i.addEventListener("connectionstatechange",()=>{i.connectionState==="connected"&&(clearTimeout(t),P("mpStatus").textContent="Verbunden ✔")})}catch(i){P("mpStatus").textContent=i.message||"Antwort-Code passt nicht"}};P("mpPlayers").addEventListener("click",i=>{const t=i.target.closest("[data-kick]");t&&Hn.kick(Number(t.dataset.kick))});P("mpJoin").onclick=async()=>{const i=P("mpName").value.trim();ht.mpName=i,ht.stun=P("mpStun").checked,$i(ht),L.mp&&Hn.end(null),Hn.useStun=ht.stun,P("mpStatus").textContent="Antwort wird erstellt …",P("mpJoin").disabled=!0;try{const t=await Hn.join(P("mpInviteIn").value,i||"Gast");P("mpAnswer").value=t,P("mpAnswerBox").hidden=!1,P("mpStatus").textContent="Antwort kopieren und dem Gastgeber schicken. Sobald er sie einfügt, geht es los."}catch(t){P("mpStatus").textContent=t.message||"Einladungs-Code passt nicht"}P("mpJoin").disabled=!1};Ae("menu");L.startMenu();
