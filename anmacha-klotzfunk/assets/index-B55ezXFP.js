(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function e(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=e(s);fetch(s.href,r)}})();/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Uh="170",j0=0,Ru=1,Z0=2,Wd=1,J0=2,Ri=3,Oi=0,pn=1,Mn=2,Di=0,_r=1,Pc=2,Cu=3,Lu=4,Q0=5,Rs=100,tm=101,em=102,nm=103,im=104,sm=200,rm=201,om=202,am=203,Nc=204,Ic=205,lm=206,cm=207,hm=208,um=209,fm=210,dm=211,pm=212,mm=213,gm=214,Oc=0,kc=1,Uc=2,Tr=3,zc=4,Fc=5,Bc=6,Hc=7,Gd=0,vm=1,xm=2,ss=0,_m=1,Mm=2,Sm=3,ym=4,Em=5,bm=6,Tm=7,Kd=300,Ar=301,wr=302,Vc=303,Wc=304,vl=306,Ja=1e3,Ds=1001,Gc=1002,nn=1003,Am=1004,Qo=1005,dn=1006,Ul=1007,di=1008,ki=1009,Xd=1010,$d=1011,Do=1012,zh=1013,ls=1014,pi=1015,vi=1016,Fh=1017,Bh=1018,Rr=1020,qd=35902,Yd=1021,jd=1022,Bn=1023,Zd=1024,Jd=1025,Mr=1026,Cr=1027,Hh=1028,Vh=1029,Qd=1030,Wh=1031,Gh=1033,Fa=33776,Ba=33777,Ha=33778,Va=33779,Kc=35840,Xc=35841,$c=35842,qc=35843,Yc=36196,jc=37492,Zc=37496,Jc=37808,Qc=37809,th=37810,eh=37811,nh=37812,ih=37813,sh=37814,rh=37815,oh=37816,ah=37817,lh=37818,ch=37819,hh=37820,uh=37821,Wa=36492,fh=36494,dh=36495,tp=36283,ph=36284,mh=36285,gh=36286,wm=3200,Rm=3201,Cm=0,Lm=1,Ji="",zn="srgb",Or="srgb-linear",xl="linear",xe="srgb",$s=7680,Du=519,Dm=512,Pm=513,Nm=514,ep=515,Im=516,Om=517,km=518,Um=519,vh=35044,Pu="300 es",Ci=2e3,Qa=2001;class kr{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const s=this._listeners[t];if(s!==void 0){const r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const n=this._listeners[t.type];if(n!==void 0){t.target=this;const s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,t);t.target=null}}}const Ze=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Ga=Math.PI/180,xh=180/Math.PI;function rs(){const i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ze[i&255]+Ze[i>>8&255]+Ze[i>>16&255]+Ze[i>>24&255]+"-"+Ze[t&255]+Ze[t>>8&255]+"-"+Ze[t>>16&15|64]+Ze[t>>24&255]+"-"+Ze[e&63|128]+Ze[e>>8&255]+"-"+Ze[e>>16&255]+Ze[e>>24&255]+Ze[n&255]+Ze[n>>8&255]+Ze[n>>16&255]+Ze[n>>24&255]).toLowerCase()}function _n(i,t,e){return Math.max(t,Math.min(e,i))}function zm(i,t){return(i%t+t)%t}function zl(i,t,e){return(1-e)*i+e*t}function fi(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Me(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}class zt{constructor(t=0,e=0){zt.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(_n(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*s+t.x,this.y=r*s+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class jt{constructor(t,e,n,s,r,o,a,l,c){jt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,c)}set(t,e,n,s,r,o,a,l,c){const h=this.elements;return h[0]=t,h[1]=s,h[2]=a,h[3]=e,h[4]=r,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],f=n[7],u=n[2],p=n[5],x=n[8],v=s[0],m=s[3],g=s[6],_=s[1],M=s[4],S=s[7],C=s[2],y=s[5],w=s[8];return r[0]=o*v+a*_+l*C,r[3]=o*m+a*M+l*y,r[6]=o*g+a*S+l*w,r[1]=c*v+h*_+f*C,r[4]=c*m+h*M+f*y,r[7]=c*g+h*S+f*w,r[2]=u*v+p*_+x*C,r[5]=u*m+p*M+x*y,r[8]=u*g+p*S+x*w,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8];return e*o*h-e*a*c-n*r*h+n*a*l+s*r*c-s*o*l}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],f=h*o-a*c,u=a*l-h*r,p=c*r-o*l,x=e*f+n*u+s*p;if(x===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/x;return t[0]=f*v,t[1]=(s*c-h*n)*v,t[2]=(a*n-s*o)*v,t[3]=u*v,t[4]=(h*e-s*l)*v,t[5]=(s*r-a*e)*v,t[6]=p*v,t[7]=(n*l-c*e)*v,t[8]=(o*e-n*r)*v,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+t,-s*c,s*l,-s*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return this.premultiply(Fl.makeScale(t,e)),this}rotate(t){return this.premultiply(Fl.makeRotation(-t)),this}translate(t,e){return this.premultiply(Fl.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const Fl=new jt;function np(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function Po(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Fm(){const i=Po("canvas");return i.style.display="block",i}const Nu={};function mo(i){i in Nu||(Nu[i]=!0,console.warn(i))}function Bm(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}function Hm(i){const t=i.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function Vm(i){const t=i.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}const ce={enabled:!0,workingColorSpace:Or,spaces:{},convert:function(i,t,e){return this.enabled===!1||t===e||!t||!e||(this.spaces[t].transfer===xe&&(i.r=Pi(i.r),i.g=Pi(i.g),i.b=Pi(i.b)),this.spaces[t].primaries!==this.spaces[e].primaries&&(i.applyMatrix3(this.spaces[t].toXYZ),i.applyMatrix3(this.spaces[e].fromXYZ)),this.spaces[e].transfer===xe&&(i.r=Sr(i.r),i.g=Sr(i.g),i.b=Sr(i.b))),i},fromWorkingColorSpace:function(i,t){return this.convert(i,this.workingColorSpace,t)},toWorkingColorSpace:function(i,t){return this.convert(i,t,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===Ji?xl:this.spaces[i].transfer},getLuminanceCoefficients:function(i,t=this.workingColorSpace){return i.fromArray(this.spaces[t].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,t,e){return i.copy(this.spaces[t].toXYZ).multiply(this.spaces[e].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}};function Pi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Sr(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}const Iu=[.64,.33,.3,.6,.15,.06],Ou=[.2126,.7152,.0722],ku=[.3127,.329],Uu=new jt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),zu=new jt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);ce.define({[Or]:{primaries:Iu,whitePoint:ku,transfer:xl,toXYZ:Uu,fromXYZ:zu,luminanceCoefficients:Ou,workingColorSpaceConfig:{unpackColorSpace:zn},outputColorSpaceConfig:{drawingBufferColorSpace:zn}},[zn]:{primaries:Iu,whitePoint:ku,transfer:xe,toXYZ:Uu,fromXYZ:zu,luminanceCoefficients:Ou,outputColorSpaceConfig:{drawingBufferColorSpace:zn}}});let qs;class Wm{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{qs===void 0&&(qs=Po("canvas")),qs.width=t.width,qs.height=t.height;const n=qs.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=qs}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=Po("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Pi(r[o]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Pi(e[n]/255)*255):e[n]=Pi(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let Gm=0;class ip{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Gm++}),this.uuid=rs(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(Bl(s[o].image)):r.push(Bl(s[o]))}else r=Bl(s);n.url=r}return e||(t.images[this.uuid]=n),n}}function Bl(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Wm.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Km=0;class Ye extends kr{constructor(t=Ye.DEFAULT_IMAGE,e=Ye.DEFAULT_MAPPING,n=Ds,s=Ds,r=dn,o=di,a=Bn,l=ki,c=Ye.DEFAULT_ANISOTROPY,h=Ji){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Km++}),this.uuid=rs(),this.name="",this.source=new ip(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new zt(0,0),this.repeat=new zt(1,1),this.center=new zt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new jt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Kd)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Ja:t.x=t.x-Math.floor(t.x);break;case Ds:t.x=t.x<0?0:1;break;case Gc:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Ja:t.y=t.y-Math.floor(t.y);break;case Ds:t.y=t.y<0?0:1;break;case Gc:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}Ye.DEFAULT_IMAGE=null;Ye.DEFAULT_MAPPING=Kd;Ye.DEFAULT_ANISOTROPY=1;class ze{constructor(t=0,e=0,n=0,s=1){ze.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*s+o[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r;const l=t.elements,c=l[0],h=l[4],f=l[8],u=l[1],p=l[5],x=l[9],v=l[2],m=l[6],g=l[10];if(Math.abs(h-u)<.01&&Math.abs(f-v)<.01&&Math.abs(x-m)<.01){if(Math.abs(h+u)<.1&&Math.abs(f+v)<.1&&Math.abs(x+m)<.1&&Math.abs(c+p+g-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const M=(c+1)/2,S=(p+1)/2,C=(g+1)/2,y=(h+u)/4,w=(f+v)/4,L=(x+m)/4;return M>S&&M>C?M<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(M),s=y/n,r=w/n):S>C?S<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(S),n=y/s,r=L/s):C<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(C),n=w/r,s=L/r),this.set(n,s,r,e),this}let _=Math.sqrt((m-x)*(m-x)+(f-v)*(f-v)+(u-h)*(u-h));return Math.abs(_)<.001&&(_=1),this.x=(m-x)/_,this.y=(f-v)/_,this.z=(u-h)/_,this.w=Math.acos((c+p+g-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Xm extends kr{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new ze(0,0,t,e),this.scissorTest=!1,this.viewport=new ze(0,0,t,e);const s={width:t,height:e,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:dn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const r=new Ye(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,s=t.textures.length;n<s;n++)this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const e=Object.assign({},t.texture.image);return this.texture.source=new ip(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Nn extends Xm{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class sp extends Ye{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=nn,this.minFilter=nn,this.wrapR=Ds,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class $m extends Ye{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=nn,this.minFilter=nn,this.wrapR=Ds,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Wo{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,o,a){let l=n[s+0],c=n[s+1],h=n[s+2],f=n[s+3];const u=r[o+0],p=r[o+1],x=r[o+2],v=r[o+3];if(a===0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=f;return}if(a===1){t[e+0]=u,t[e+1]=p,t[e+2]=x,t[e+3]=v;return}if(f!==v||l!==u||c!==p||h!==x){let m=1-a;const g=l*u+c*p+h*x+f*v,_=g>=0?1:-1,M=1-g*g;if(M>Number.EPSILON){const C=Math.sqrt(M),y=Math.atan2(C,g*_);m=Math.sin(m*y)/C,a=Math.sin(a*y)/C}const S=a*_;if(l=l*m+u*S,c=c*m+p*S,h=h*m+x*S,f=f*m+v*S,m===1-a){const C=1/Math.sqrt(l*l+c*c+h*h+f*f);l*=C,c*=C,h*=C,f*=C}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=f}static multiplyQuaternionsFlat(t,e,n,s,r,o){const a=n[s],l=n[s+1],c=n[s+2],h=n[s+3],f=r[o],u=r[o+1],p=r[o+2],x=r[o+3];return t[e]=a*x+h*f+l*p-c*u,t[e+1]=l*x+h*u+c*f-a*p,t[e+2]=c*x+h*p+a*u-l*f,t[e+3]=h*x-a*f-l*u-c*p,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,s=t._y,r=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(s/2),f=a(r/2),u=l(n/2),p=l(s/2),x=l(r/2);switch(o){case"XYZ":this._x=u*h*f+c*p*x,this._y=c*p*f-u*h*x,this._z=c*h*x+u*p*f,this._w=c*h*f-u*p*x;break;case"YXZ":this._x=u*h*f+c*p*x,this._y=c*p*f-u*h*x,this._z=c*h*x-u*p*f,this._w=c*h*f+u*p*x;break;case"ZXY":this._x=u*h*f-c*p*x,this._y=c*p*f+u*h*x,this._z=c*h*x+u*p*f,this._w=c*h*f-u*p*x;break;case"ZYX":this._x=u*h*f-c*p*x,this._y=c*p*f+u*h*x,this._z=c*h*x-u*p*f,this._w=c*h*f+u*p*x;break;case"YZX":this._x=u*h*f+c*p*x,this._y=c*p*f+u*h*x,this._z=c*h*x-u*p*f,this._w=c*h*f-u*p*x;break;case"XZY":this._x=u*h*f-c*p*x,this._y=c*p*f-u*h*x,this._z=c*h*x+u*p*f,this._w=c*h*f+u*p*x;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],s=e[4],r=e[8],o=e[1],a=e[5],l=e[9],c=e[2],h=e[6],f=e[10],u=n+a+f;if(u>0){const p=.5/Math.sqrt(u+1);this._w=.25/p,this._x=(h-l)*p,this._y=(r-c)*p,this._z=(o-s)*p}else if(n>a&&n>f){const p=2*Math.sqrt(1+n-a-f);this._w=(h-l)/p,this._x=.25*p,this._y=(s+o)/p,this._z=(r+c)/p}else if(a>f){const p=2*Math.sqrt(1+a-n-f);this._w=(r-c)/p,this._x=(s+o)/p,this._y=.25*p,this._z=(l+h)/p}else{const p=2*Math.sqrt(1+f-n-a);this._w=(o-s)/p,this._x=(r+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(_n(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,s=t._y,r=t._z,o=t._w,a=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+o*a+s*c-r*l,this._y=s*h+o*l+r*a-n*c,this._z=r*h+o*c+n*l-s*a,this._w=o*h-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const n=this._x,s=this._y,r=this._z,o=this._w;let a=o*t._w+n*t._x+s*t._y+r*t._z;if(a<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,a=-a):this.copy(t),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;const l=1-a*a;if(l<=Number.EPSILON){const p=1-e;return this._w=p*o+e*this._w,this._x=p*n+e*this._x,this._y=p*s+e*this._y,this._z=p*r+e*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,a),f=Math.sin((1-e)*h)/c,u=Math.sin(e*h)/c;return this._w=o*f+this._w*u,this._x=n*f+this._x*u,this._y=s*f+this._y*u,this._z=r*f+this._z*u,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class O{constructor(t=0,e=0,n=0){O.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Fu.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Fu.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(t){const e=this.x,n=this.y,s=this.z,r=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*s-a*n),h=2*(a*e-r*s),f=2*(r*n-o*e);return this.x=e+l*c+o*f-a*h,this.y=n+l*h+a*c-r*f,this.z=s+l*f+r*h-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,s=t.y,r=t.z,o=e.x,a=e.y,l=e.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Hl.copy(this).projectOnVector(t),this.sub(Hl)}reflect(t){return this.sub(Hl.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(_n(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Hl=new O,Fu=new Wo;class Bs{constructor(t=new O(1/0,1/0,1/0),e=new O(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(Yn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(Yn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=Yn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,Yn):Yn.fromBufferAttribute(r,o),Yn.applyMatrix4(t.matrixWorld),this.expandByPoint(Yn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),ta.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ta.copy(n.boundingBox)),ta.applyMatrix4(t.matrixWorld),this.union(ta)}const s=t.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Yn),Yn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Xr),ea.subVectors(this.max,Xr),Ys.subVectors(t.a,Xr),js.subVectors(t.b,Xr),Zs.subVectors(t.c,Xr),Gi.subVectors(js,Ys),Ki.subVectors(Zs,js),xs.subVectors(Ys,Zs);let e=[0,-Gi.z,Gi.y,0,-Ki.z,Ki.y,0,-xs.z,xs.y,Gi.z,0,-Gi.x,Ki.z,0,-Ki.x,xs.z,0,-xs.x,-Gi.y,Gi.x,0,-Ki.y,Ki.x,0,-xs.y,xs.x,0];return!Vl(e,Ys,js,Zs,ea)||(e=[1,0,0,0,1,0,0,0,1],!Vl(e,Ys,js,Zs,ea))?!1:(na.crossVectors(Gi,Ki),e=[na.x,na.y,na.z],Vl(e,Ys,js,Zs,ea))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Yn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Yn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Si[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Si[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Si[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Si[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Si[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Si[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Si[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Si[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Si),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const Si=[new O,new O,new O,new O,new O,new O,new O,new O],Yn=new O,ta=new Bs,Ys=new O,js=new O,Zs=new O,Gi=new O,Ki=new O,xs=new O,Xr=new O,ea=new O,na=new O,_s=new O;function Vl(i,t,e,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){_s.fromArray(i,r);const a=s.x*Math.abs(_s.x)+s.y*Math.abs(_s.y)+s.z*Math.abs(_s.z),l=t.dot(_s),c=e.dot(_s),h=n.dot(_s);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}const qm=new Bs,$r=new O,Wl=new O;class fs{constructor(t=new O,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):qm.setFromPoints(t).getCenter(n);let s=0;for(let r=0,o=t.length;r<o;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;$r.subVectors(t,this.center);const e=$r.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector($r,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Wl.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint($r.copy(t.center).add(Wl)),this.expandByPoint($r.copy(t.center).sub(Wl))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const yi=new O,Gl=new O,ia=new O,Xi=new O,Kl=new O,sa=new O,Xl=new O;class Kh{constructor(t=new O,e=new O(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,yi)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=yi.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(yi.copy(this.origin).addScaledVector(this.direction,e),yi.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){Gl.copy(t).add(e).multiplyScalar(.5),ia.copy(e).sub(t).normalize(),Xi.copy(this.origin).sub(Gl);const r=t.distanceTo(e)*.5,o=-this.direction.dot(ia),a=Xi.dot(this.direction),l=-Xi.dot(ia),c=Xi.lengthSq(),h=Math.abs(1-o*o);let f,u,p,x;if(h>0)if(f=o*l-a,u=o*a-l,x=r*h,f>=0)if(u>=-x)if(u<=x){const v=1/h;f*=v,u*=v,p=f*(f+o*u+2*a)+u*(o*f+u+2*l)+c}else u=r,f=Math.max(0,-(o*u+a)),p=-f*f+u*(u+2*l)+c;else u=-r,f=Math.max(0,-(o*u+a)),p=-f*f+u*(u+2*l)+c;else u<=-x?(f=Math.max(0,-(-o*r+a)),u=f>0?-r:Math.min(Math.max(-r,-l),r),p=-f*f+u*(u+2*l)+c):u<=x?(f=0,u=Math.min(Math.max(-r,-l),r),p=u*(u+2*l)+c):(f=Math.max(0,-(o*r+a)),u=f>0?r:Math.min(Math.max(-r,-l),r),p=-f*f+u*(u+2*l)+c);else u=o>0?-r:r,f=Math.max(0,-(o*u+a)),p=-f*f+u*(u+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,f),s&&s.copy(Gl).addScaledVector(ia,u),p}intersectSphere(t,e){yi.subVectors(t.center,this.origin);const n=yi.dot(this.direction),s=yi.dot(yi)-n*n,r=t.radius*t.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,o,a,l;const c=1/this.direction.x,h=1/this.direction.y,f=1/this.direction.z,u=this.origin;return c>=0?(n=(t.min.x-u.x)*c,s=(t.max.x-u.x)*c):(n=(t.max.x-u.x)*c,s=(t.min.x-u.x)*c),h>=0?(r=(t.min.y-u.y)*h,o=(t.max.y-u.y)*h):(r=(t.max.y-u.y)*h,o=(t.min.y-u.y)*h),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),f>=0?(a=(t.min.z-u.z)*f,l=(t.max.z-u.z)*f):(a=(t.max.z-u.z)*f,l=(t.min.z-u.z)*f),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,yi)!==null}intersectTriangle(t,e,n,s,r){Kl.subVectors(e,t),sa.subVectors(n,t),Xl.crossVectors(Kl,sa);let o=this.direction.dot(Xl),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Xi.subVectors(this.origin,t);const l=a*this.direction.dot(sa.crossVectors(Xi,sa));if(l<0)return null;const c=a*this.direction.dot(Kl.cross(Xi));if(c<0||l+c>o)return null;const h=-a*Xi.dot(Xl);return h<0?null:this.at(h/o,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class ge{constructor(t,e,n,s,r,o,a,l,c,h,f,u,p,x,v,m){ge.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,c,h,f,u,p,x,v,m)}set(t,e,n,s,r,o,a,l,c,h,f,u,p,x,v,m){const g=this.elements;return g[0]=t,g[4]=e,g[8]=n,g[12]=s,g[1]=r,g[5]=o,g[9]=a,g[13]=l,g[2]=c,g[6]=h,g[10]=f,g[14]=u,g[3]=p,g[7]=x,g[11]=v,g[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new ge().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,n=t.elements,s=1/Js.setFromMatrixColumn(t,0).length(),r=1/Js.setFromMatrixColumn(t,1).length(),o=1/Js.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,s=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),f=Math.sin(r);if(t.order==="XYZ"){const u=o*h,p=o*f,x=a*h,v=a*f;e[0]=l*h,e[4]=-l*f,e[8]=c,e[1]=p+x*c,e[5]=u-v*c,e[9]=-a*l,e[2]=v-u*c,e[6]=x+p*c,e[10]=o*l}else if(t.order==="YXZ"){const u=l*h,p=l*f,x=c*h,v=c*f;e[0]=u+v*a,e[4]=x*a-p,e[8]=o*c,e[1]=o*f,e[5]=o*h,e[9]=-a,e[2]=p*a-x,e[6]=v+u*a,e[10]=o*l}else if(t.order==="ZXY"){const u=l*h,p=l*f,x=c*h,v=c*f;e[0]=u-v*a,e[4]=-o*f,e[8]=x+p*a,e[1]=p+x*a,e[5]=o*h,e[9]=v-u*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){const u=o*h,p=o*f,x=a*h,v=a*f;e[0]=l*h,e[4]=x*c-p,e[8]=u*c+v,e[1]=l*f,e[5]=v*c+u,e[9]=p*c-x,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){const u=o*l,p=o*c,x=a*l,v=a*c;e[0]=l*h,e[4]=v-u*f,e[8]=x*f+p,e[1]=f,e[5]=o*h,e[9]=-a*h,e[2]=-c*h,e[6]=p*f+x,e[10]=u-v*f}else if(t.order==="XZY"){const u=o*l,p=o*c,x=a*l,v=a*c;e[0]=l*h,e[4]=-f,e[8]=c*h,e[1]=u*f+v,e[5]=o*h,e[9]=p*f-x,e[2]=x*f-p,e[6]=a*h,e[10]=v*f+u}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Ym,t,jm)}lookAt(t,e,n){const s=this.elements;return An.subVectors(t,e),An.lengthSq()===0&&(An.z=1),An.normalize(),$i.crossVectors(n,An),$i.lengthSq()===0&&(Math.abs(n.z)===1?An.x+=1e-4:An.z+=1e-4,An.normalize(),$i.crossVectors(n,An)),$i.normalize(),ra.crossVectors(An,$i),s[0]=$i.x,s[4]=ra.x,s[8]=An.x,s[1]=$i.y,s[5]=ra.y,s[9]=An.y,s[2]=$i.z,s[6]=ra.z,s[10]=An.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],f=n[5],u=n[9],p=n[13],x=n[2],v=n[6],m=n[10],g=n[14],_=n[3],M=n[7],S=n[11],C=n[15],y=s[0],w=s[4],L=s[8],E=s[12],b=s[1],N=s[5],X=s[9],W=s[13],Y=s[2],nt=s[6],$=s[10],it=s[14],G=s[3],st=s[7],xt=s[11],Dt=s[15];return r[0]=o*y+a*b+l*Y+c*G,r[4]=o*w+a*N+l*nt+c*st,r[8]=o*L+a*X+l*$+c*xt,r[12]=o*E+a*W+l*it+c*Dt,r[1]=h*y+f*b+u*Y+p*G,r[5]=h*w+f*N+u*nt+p*st,r[9]=h*L+f*X+u*$+p*xt,r[13]=h*E+f*W+u*it+p*Dt,r[2]=x*y+v*b+m*Y+g*G,r[6]=x*w+v*N+m*nt+g*st,r[10]=x*L+v*X+m*$+g*xt,r[14]=x*E+v*W+m*it+g*Dt,r[3]=_*y+M*b+S*Y+C*G,r[7]=_*w+M*N+S*nt+C*st,r[11]=_*L+M*X+S*$+C*xt,r[15]=_*E+M*W+S*it+C*Dt,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],o=t[1],a=t[5],l=t[9],c=t[13],h=t[2],f=t[6],u=t[10],p=t[14],x=t[3],v=t[7],m=t[11],g=t[15];return x*(+r*l*f-s*c*f-r*a*u+n*c*u+s*a*p-n*l*p)+v*(+e*l*p-e*c*u+r*o*u-s*o*p+s*c*h-r*l*h)+m*(+e*c*f-e*a*p-r*o*f+n*o*p+r*a*h-n*c*h)+g*(-s*a*h-e*l*f+e*a*u+s*o*f-n*o*u+n*l*h)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],f=t[9],u=t[10],p=t[11],x=t[12],v=t[13],m=t[14],g=t[15],_=f*m*c-v*u*c+v*l*p-a*m*p-f*l*g+a*u*g,M=x*u*c-h*m*c-x*l*p+o*m*p+h*l*g-o*u*g,S=h*v*c-x*f*c+x*a*p-o*v*p-h*a*g+o*f*g,C=x*f*l-h*v*l-x*a*u+o*v*u+h*a*m-o*f*m,y=e*_+n*M+s*S+r*C;if(y===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const w=1/y;return t[0]=_*w,t[1]=(v*u*r-f*m*r-v*s*p+n*m*p+f*s*g-n*u*g)*w,t[2]=(a*m*r-v*l*r+v*s*c-n*m*c-a*s*g+n*l*g)*w,t[3]=(f*l*r-a*u*r-f*s*c+n*u*c+a*s*p-n*l*p)*w,t[4]=M*w,t[5]=(h*m*r-x*u*r+x*s*p-e*m*p-h*s*g+e*u*g)*w,t[6]=(x*l*r-o*m*r-x*s*c+e*m*c+o*s*g-e*l*g)*w,t[7]=(o*u*r-h*l*r+h*s*c-e*u*c-o*s*p+e*l*p)*w,t[8]=S*w,t[9]=(x*f*r-h*v*r-x*n*p+e*v*p+h*n*g-e*f*g)*w,t[10]=(o*v*r-x*a*r+x*n*c-e*v*c-o*n*g+e*a*g)*w,t[11]=(h*a*r-o*f*r-h*n*c+e*f*c+o*n*p-e*a*p)*w,t[12]=C*w,t[13]=(h*v*s-x*f*s+x*n*u-e*v*u-h*n*m+e*f*m)*w,t[14]=(x*a*s-o*v*s-x*n*l+e*v*l+o*n*m-e*a*m)*w,t[15]=(o*f*s-h*a*s+h*n*l-e*f*l-o*n*u+e*a*u)*w,this}scale(t){const e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),s=Math.sin(e),r=1-n,o=t.x,a=t.y,l=t.z,c=r*o,h=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,h*a+n,h*l-s*o,0,c*l-s*a,h*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,o){return this.set(1,n,r,0,t,1,o,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){const s=this.elements,r=e._x,o=e._y,a=e._z,l=e._w,c=r+r,h=o+o,f=a+a,u=r*c,p=r*h,x=r*f,v=o*h,m=o*f,g=a*f,_=l*c,M=l*h,S=l*f,C=n.x,y=n.y,w=n.z;return s[0]=(1-(v+g))*C,s[1]=(p+S)*C,s[2]=(x-M)*C,s[3]=0,s[4]=(p-S)*y,s[5]=(1-(u+g))*y,s[6]=(m+_)*y,s[7]=0,s[8]=(x+M)*w,s[9]=(m-_)*w,s[10]=(1-(u+v))*w,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){const s=this.elements;let r=Js.set(s[0],s[1],s[2]).length();const o=Js.set(s[4],s[5],s[6]).length(),a=Js.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],jn.copy(this);const c=1/r,h=1/o,f=1/a;return jn.elements[0]*=c,jn.elements[1]*=c,jn.elements[2]*=c,jn.elements[4]*=h,jn.elements[5]*=h,jn.elements[6]*=h,jn.elements[8]*=f,jn.elements[9]*=f,jn.elements[10]*=f,e.setFromRotationMatrix(jn),n.x=r,n.y=o,n.z=a,this}makePerspective(t,e,n,s,r,o,a=Ci){const l=this.elements,c=2*r/(e-t),h=2*r/(n-s),f=(e+t)/(e-t),u=(n+s)/(n-s);let p,x;if(a===Ci)p=-(o+r)/(o-r),x=-2*o*r/(o-r);else if(a===Qa)p=-o/(o-r),x=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=f,l[12]=0,l[1]=0,l[5]=h,l[9]=u,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=x,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,s,r,o,a=Ci){const l=this.elements,c=1/(e-t),h=1/(n-s),f=1/(o-r),u=(e+t)*c,p=(n+s)*h;let x,v;if(a===Ci)x=(o+r)*f,v=-2*f;else if(a===Qa)x=r*f,v=-1*f;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-u,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-p,l[2]=0,l[6]=0,l[10]=v,l[14]=-x,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}const Js=new O,jn=new ge,Ym=new O(0,0,0),jm=new O(1,1,1),$i=new O,ra=new O,An=new O,Bu=new ge,Hu=new Wo;class Ui{constructor(t=0,e=0,n=0,s=Ui.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const s=t.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],h=s[9],f=s[2],u=s[6],p=s[10];switch(e){case"XYZ":this._y=Math.asin(_n(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-_n(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(_n(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-f,p),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-_n(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(u,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(_n(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-_n(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Bu.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Bu,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Hu.setFromEuler(this),this.setFromQuaternion(Hu,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Ui.DEFAULT_ORDER="XYZ";class rp{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let Zm=0;const Vu=new O,Qs=new Wo,Ei=new ge,oa=new O,qr=new O,Jm=new O,Qm=new Wo,Wu=new O(1,0,0),Gu=new O(0,1,0),Ku=new O(0,0,1),Xu={type:"added"},tg={type:"removed"},tr={type:"childadded",child:null},$l={type:"childremoved",child:null};class sn extends kr{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Zm++}),this.uuid=rs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=sn.DEFAULT_UP.clone();const t=new O,e=new Ui,n=new Wo,s=new O(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ge},normalMatrix:{value:new jt}}),this.matrix=new ge,this.matrixWorld=new ge,this.matrixAutoUpdate=sn.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=sn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new rp,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Qs.setFromAxisAngle(t,e),this.quaternion.multiply(Qs),this}rotateOnWorldAxis(t,e){return Qs.setFromAxisAngle(t,e),this.quaternion.premultiply(Qs),this}rotateX(t){return this.rotateOnAxis(Wu,t)}rotateY(t){return this.rotateOnAxis(Gu,t)}rotateZ(t){return this.rotateOnAxis(Ku,t)}translateOnAxis(t,e){return Vu.copy(t).applyQuaternion(this.quaternion),this.position.add(Vu.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Wu,t)}translateY(t){return this.translateOnAxis(Gu,t)}translateZ(t){return this.translateOnAxis(Ku,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Ei.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?oa.copy(t):oa.set(t,e,n);const s=this.parent;this.updateWorldMatrix(!0,!1),qr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ei.lookAt(qr,oa,this.up):Ei.lookAt(oa,qr,this.up),this.quaternion.setFromRotationMatrix(Ei),s&&(Ei.extractRotation(s.matrixWorld),Qs.setFromRotationMatrix(Ei),this.quaternion.premultiply(Qs.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Xu),tr.child=t,this.dispatchEvent(tr),tr.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(tg),$l.child=t,this.dispatchEvent($l),$l.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Ei.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Ei.multiply(t.parent.matrixWorld)),t.applyMatrix4(Ei),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Xu),tr.child=t,this.dispatchEvent(tr),tr.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){const o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(qr,t,Jm),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(qr,Qm,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){const n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const f=l[c];r(t.shapes,f)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(t.materials,this.material[l]));s.material=a}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];s.animations.push(r(t.animations,l))}}if(e){const a=o(t.geometries),l=o(t.materials),c=o(t.textures),h=o(t.images),f=o(t.shapes),u=o(t.skeletons),p=o(t.animations),x=o(t.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),f.length>0&&(n.shapes=f),u.length>0&&(n.skeletons=u),p.length>0&&(n.animations=p),x.length>0&&(n.nodes=x)}return n.object=s,n;function o(a){const l=[];for(const c in a){const h=a[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const s=t.children[n];this.add(s.clone())}return this}}sn.DEFAULT_UP=new O(0,1,0);sn.DEFAULT_MATRIX_AUTO_UPDATE=!0;sn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Zn=new O,bi=new O,ql=new O,Ti=new O,er=new O,nr=new O,$u=new O,Yl=new O,jl=new O,Zl=new O,Jl=new ze,Ql=new ze,tc=new ze;class Dn{constructor(t=new O,e=new O,n=new O){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),Zn.subVectors(t,e),s.cross(Zn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){Zn.subVectors(s,e),bi.subVectors(n,e),ql.subVectors(t,e);const o=Zn.dot(Zn),a=Zn.dot(bi),l=Zn.dot(ql),c=bi.dot(bi),h=bi.dot(ql),f=o*c-a*a;if(f===0)return r.set(0,0,0),null;const u=1/f,p=(c*l-a*h)*u,x=(o*h-a*l)*u;return r.set(1-p-x,x,p)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,Ti)===null?!1:Ti.x>=0&&Ti.y>=0&&Ti.x+Ti.y<=1}static getInterpolation(t,e,n,s,r,o,a,l){return this.getBarycoord(t,e,n,s,Ti)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Ti.x),l.addScaledVector(o,Ti.y),l.addScaledVector(a,Ti.z),l)}static getInterpolatedAttribute(t,e,n,s,r,o){return Jl.setScalar(0),Ql.setScalar(0),tc.setScalar(0),Jl.fromBufferAttribute(t,e),Ql.fromBufferAttribute(t,n),tc.fromBufferAttribute(t,s),o.setScalar(0),o.addScaledVector(Jl,r.x),o.addScaledVector(Ql,r.y),o.addScaledVector(tc,r.z),o}static isFrontFacing(t,e,n,s){return Zn.subVectors(n,e),bi.subVectors(t,e),Zn.cross(bi).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Zn.subVectors(this.c,this.b),bi.subVectors(this.a,this.b),Zn.cross(bi).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return Dn.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return Dn.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return Dn.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return Dn.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return Dn.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,s=this.b,r=this.c;let o,a;er.subVectors(s,n),nr.subVectors(r,n),Yl.subVectors(t,n);const l=er.dot(Yl),c=nr.dot(Yl);if(l<=0&&c<=0)return e.copy(n);jl.subVectors(t,s);const h=er.dot(jl),f=nr.dot(jl);if(h>=0&&f<=h)return e.copy(s);const u=l*f-h*c;if(u<=0&&l>=0&&h<=0)return o=l/(l-h),e.copy(n).addScaledVector(er,o);Zl.subVectors(t,r);const p=er.dot(Zl),x=nr.dot(Zl);if(x>=0&&p<=x)return e.copy(r);const v=p*c-l*x;if(v<=0&&c>=0&&x<=0)return a=c/(c-x),e.copy(n).addScaledVector(nr,a);const m=h*x-p*f;if(m<=0&&f-h>=0&&p-x>=0)return $u.subVectors(r,s),a=(f-h)/(f-h+(p-x)),e.copy(s).addScaledVector($u,a);const g=1/(m+v+u);return o=v*g,a=u*g,e.copy(n).addScaledVector(er,o).addScaledVector(nr,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const op={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},qi={h:0,s:0,l:0},aa={h:0,s:0,l:0};function ec(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}class se{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=zn){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,ce.toWorkingColorSpace(this,e),this}setRGB(t,e,n,s=ce.workingColorSpace){return this.r=t,this.g=e,this.b=n,ce.toWorkingColorSpace(this,s),this}setHSL(t,e,n,s=ce.workingColorSpace){if(t=zm(t,1),e=_n(e,0,1),n=_n(n,0,1),e===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=ec(o,r,t+1/3),this.g=ec(o,r,t),this.b=ec(o,r,t-1/3)}return ce.toWorkingColorSpace(this,s),this}setStyle(t,e=zn){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=zn){const n=op[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Pi(t.r),this.g=Pi(t.g),this.b=Pi(t.b),this}copyLinearToSRGB(t){return this.r=Sr(t.r),this.g=Sr(t.g),this.b=Sr(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=zn){return ce.fromWorkingColorSpace(Je.copy(this),t),Math.round(_n(Je.r*255,0,255))*65536+Math.round(_n(Je.g*255,0,255))*256+Math.round(_n(Je.b*255,0,255))}getHexString(t=zn){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=ce.workingColorSpace){ce.fromWorkingColorSpace(Je.copy(this),e);const n=Je.r,s=Je.g,r=Je.b,o=Math.max(n,s,r),a=Math.min(n,s,r);let l,c;const h=(a+o)/2;if(a===o)l=0,c=0;else{const f=o-a;switch(c=h<=.5?f/(o+a):f/(2-o-a),o){case n:l=(s-r)/f+(s<r?6:0);break;case s:l=(r-n)/f+2;break;case r:l=(n-s)/f+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=ce.workingColorSpace){return ce.fromWorkingColorSpace(Je.copy(this),e),t.r=Je.r,t.g=Je.g,t.b=Je.b,t}getStyle(t=zn){ce.fromWorkingColorSpace(Je.copy(this),t);const e=Je.r,n=Je.g,s=Je.b;return t!==zn?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(qi),this.setHSL(qi.h+t,qi.s+e,qi.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(qi),t.getHSL(aa);const n=zl(qi.h,aa.h,e),s=zl(qi.s,aa.s,e),r=zl(qi.l,aa.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Je=new se;se.NAMES=op;let eg=0;class Hs extends kr{static get type(){return"Material"}get type(){return this.constructor.type}set type(t){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:eg++}),this.uuid=rs(),this.name="",this.blending=_r,this.side=Oi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Nc,this.blendDst=Ic,this.blendEquation=Rs,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new se(0,0,0),this.blendAlpha=0,this.depthFunc=Tr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Du,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=$s,this.stencilZFail=$s,this.stencilZPass=$s,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==_r&&(n.blending=this.blending),this.side!==Oi&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Nc&&(n.blendSrc=this.blendSrc),this.blendDst!==Ic&&(n.blendDst=this.blendDst),this.blendEquation!==Rs&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Tr&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Du&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==$s&&(n.stencilFail=this.stencilFail),this.stencilZFail!==$s&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==$s&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(e){const r=s(t.textures),o=s(t.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class si extends Hs{static get type(){return"MeshBasicMaterial"}constructor(t){super(),this.isMeshBasicMaterial=!0,this.color=new se(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ui,this.combine=Gd,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const Fe=new O,la=new zt;class we{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=vh,this.updateRanges=[],this.gpuType=pi,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)la.fromBufferAttribute(this,e),la.applyMatrix3(t),this.setXY(e,la.x,la.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Fe.fromBufferAttribute(this,e),Fe.applyMatrix3(t),this.setXYZ(e,Fe.x,Fe.y,Fe.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Fe.fromBufferAttribute(this,e),Fe.applyMatrix4(t),this.setXYZ(e,Fe.x,Fe.y,Fe.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Fe.fromBufferAttribute(this,e),Fe.applyNormalMatrix(t),this.setXYZ(e,Fe.x,Fe.y,Fe.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Fe.fromBufferAttribute(this,e),Fe.transformDirection(t),this.setXYZ(e,Fe.x,Fe.y,Fe.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=fi(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Me(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=fi(e,this.array)),e}setX(t,e){return this.normalized&&(e=Me(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=fi(e,this.array)),e}setY(t,e){return this.normalized&&(e=Me(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=fi(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Me(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=fi(e,this.array)),e}setW(t,e){return this.normalized&&(e=Me(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=Me(e,this.array),n=Me(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=Me(e,this.array),n=Me(n,this.array),s=Me(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=Me(e,this.array),n=Me(n,this.array),s=Me(s,this.array),r=Me(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==vh&&(t.usage=this.usage),t}}class Xh extends we{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class $h extends we{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class We extends we{constructor(t,e,n){super(new Float32Array(t),e,n)}}let ng=0;const On=new ge,nc=new sn,ir=new O,wn=new Bs,Yr=new Bs,$e=new O;class ke extends kr{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:ng++}),this.uuid=rs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(np(t)?$h:Xh)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new jt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return On.makeRotationFromQuaternion(t),this.applyMatrix4(On),this}rotateX(t){return On.makeRotationX(t),this.applyMatrix4(On),this}rotateY(t){return On.makeRotationY(t),this.applyMatrix4(On),this}rotateZ(t){return On.makeRotationZ(t),this.applyMatrix4(On),this}translate(t,e,n){return On.makeTranslation(t,e,n),this.applyMatrix4(On),this}scale(t,e,n){return On.makeScale(t,e,n),this.applyMatrix4(On),this}lookAt(t){return nc.lookAt(t),nc.updateMatrix(),this.applyMatrix4(nc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ir).negate(),this.translate(ir.x,ir.y,ir.z),this}setFromPoints(t){const e=this.getAttribute("position");if(e===void 0){const n=[];for(let s=0,r=t.length;s<r;s++){const o=t[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new We(n,3))}else{for(let n=0,s=e.count;n<s;n++){const r=t[n];e.setXYZ(n,r.x,r.y,r.z||0)}t.length>e.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Bs);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new O(-1/0,-1/0,-1/0),new O(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){const r=e[n];wn.setFromBufferAttribute(r),this.morphTargetsRelative?($e.addVectors(this.boundingBox.min,wn.min),this.boundingBox.expandByPoint($e),$e.addVectors(this.boundingBox.max,wn.max),this.boundingBox.expandByPoint($e)):(this.boundingBox.expandByPoint(wn.min),this.boundingBox.expandByPoint(wn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new fs);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new O,1/0);return}if(t){const n=this.boundingSphere.center;if(wn.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){const a=e[r];Yr.setFromBufferAttribute(a),this.morphTargetsRelative?($e.addVectors(wn.min,Yr.min),wn.expandByPoint($e),$e.addVectors(wn.max,Yr.max),wn.expandByPoint($e)):(wn.expandByPoint(Yr.min),wn.expandByPoint(Yr.max))}wn.getCenter(n);let s=0;for(let r=0,o=t.count;r<o;r++)$e.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared($e));if(e)for(let r=0,o=e.length;r<o;r++){const a=e[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)$e.fromBufferAttribute(a,c),l&&(ir.fromBufferAttribute(t,c),$e.add(ir)),s=Math.max(s,n.distanceToSquared($e))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new we(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let L=0;L<n.count;L++)a[L]=new O,l[L]=new O;const c=new O,h=new O,f=new O,u=new zt,p=new zt,x=new zt,v=new O,m=new O;function g(L,E,b){c.fromBufferAttribute(n,L),h.fromBufferAttribute(n,E),f.fromBufferAttribute(n,b),u.fromBufferAttribute(r,L),p.fromBufferAttribute(r,E),x.fromBufferAttribute(r,b),h.sub(c),f.sub(c),p.sub(u),x.sub(u);const N=1/(p.x*x.y-x.x*p.y);isFinite(N)&&(v.copy(h).multiplyScalar(x.y).addScaledVector(f,-p.y).multiplyScalar(N),m.copy(f).multiplyScalar(p.x).addScaledVector(h,-x.x).multiplyScalar(N),a[L].add(v),a[E].add(v),a[b].add(v),l[L].add(m),l[E].add(m),l[b].add(m))}let _=this.groups;_.length===0&&(_=[{start:0,count:t.count}]);for(let L=0,E=_.length;L<E;++L){const b=_[L],N=b.start,X=b.count;for(let W=N,Y=N+X;W<Y;W+=3)g(t.getX(W+0),t.getX(W+1),t.getX(W+2))}const M=new O,S=new O,C=new O,y=new O;function w(L){C.fromBufferAttribute(s,L),y.copy(C);const E=a[L];M.copy(E),M.sub(C.multiplyScalar(C.dot(E))).normalize(),S.crossVectors(y,E);const N=S.dot(l[L])<0?-1:1;o.setXYZW(L,M.x,M.y,M.z,N)}for(let L=0,E=_.length;L<E;++L){const b=_[L],N=b.start,X=b.count;for(let W=N,Y=N+X;W<Y;W+=3)w(t.getX(W+0)),w(t.getX(W+1)),w(t.getX(W+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new we(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let u=0,p=n.count;u<p;u++)n.setXYZ(u,0,0,0);const s=new O,r=new O,o=new O,a=new O,l=new O,c=new O,h=new O,f=new O;if(t)for(let u=0,p=t.count;u<p;u+=3){const x=t.getX(u+0),v=t.getX(u+1),m=t.getX(u+2);s.fromBufferAttribute(e,x),r.fromBufferAttribute(e,v),o.fromBufferAttribute(e,m),h.subVectors(o,r),f.subVectors(s,r),h.cross(f),a.fromBufferAttribute(n,x),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,m),a.add(h),l.add(h),c.add(h),n.setXYZ(x,a.x,a.y,a.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let u=0,p=e.count;u<p;u+=3)s.fromBufferAttribute(e,u+0),r.fromBufferAttribute(e,u+1),o.fromBufferAttribute(e,u+2),h.subVectors(o,r),f.subVectors(s,r),h.cross(f),n.setXYZ(u+0,h.x,h.y,h.z),n.setXYZ(u+1,h.x,h.y,h.z),n.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)$e.fromBufferAttribute(t,e),$e.normalize(),t.setXYZ(e,$e.x,$e.y,$e.z)}toNonIndexed(){function t(a,l){const c=a.array,h=a.itemSize,f=a.normalized,u=new c.constructor(l.length*h);let p=0,x=0;for(let v=0,m=l.length;v<m;v++){a.isInterleavedBufferAttribute?p=l[v]*a.data.stride+a.offset:p=l[v]*h;for(let g=0;g<h;g++)u[x++]=c[p++]}return new we(u,h,f)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new ke,n=this.index.array,s=this.attributes;for(const a in s){const l=s[a],c=t(l,n);e.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let h=0,f=c.length;h<f;h++){const u=c[h],p=t(u,n);l.push(p)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const l in n){const c=n[l];t.data.attributes[l]=c.toJSON(t.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let f=0,u=c.length;f<u;f++){const p=c[f];h.push(p.toJSON(t.data))}h.length>0&&(s[l]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(t.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone(e));const s=t.attributes;for(const c in s){const h=s[c];this.setAttribute(c,h.clone(e))}const r=t.morphAttributes;for(const c in r){const h=[],f=r[c];for(let u=0,p=f.length;u<p;u++)h.push(f[u].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;const o=t.groups;for(let c=0,h=o.length;c<h;c++){const f=o[c];this.addGroup(f.start,f.count,f.materialIndex)}const a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const qu=new ge,Ms=new Kh,ca=new fs,Yu=new O,ha=new O,ua=new O,fa=new O,ic=new O,da=new O,ju=new O,pa=new O;class Re extends sn{constructor(t=new ke,e=new si){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(s,t);const a=this.morphTargetInfluences;if(r&&a){da.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=a[l],f=r[l];h!==0&&(ic.fromBufferAttribute(f,t),o?da.addScaledVector(ic,h):da.addScaledVector(ic.sub(e),h))}e.add(da)}return e}raycast(t,e){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ca.copy(n.boundingSphere),ca.applyMatrix4(r),Ms.copy(t.ray).recast(t.near),!(ca.containsPoint(Ms.origin)===!1&&(Ms.intersectSphere(ca,Yu)===null||Ms.origin.distanceToSquared(Yu)>(t.far-t.near)**2))&&(qu.copy(r).invert(),Ms.copy(t.ray).applyMatrix4(qu),!(n.boundingBox!==null&&Ms.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,Ms)))}_computeIntersections(t,e,n){let s;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,f=r.attributes.normal,u=r.groups,p=r.drawRange;if(a!==null)if(Array.isArray(o))for(let x=0,v=u.length;x<v;x++){const m=u[x],g=o[m.materialIndex],_=Math.max(m.start,p.start),M=Math.min(a.count,Math.min(m.start+m.count,p.start+p.count));for(let S=_,C=M;S<C;S+=3){const y=a.getX(S),w=a.getX(S+1),L=a.getX(S+2);s=ma(this,g,t,n,c,h,f,y,w,L),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const x=Math.max(0,p.start),v=Math.min(a.count,p.start+p.count);for(let m=x,g=v;m<g;m+=3){const _=a.getX(m),M=a.getX(m+1),S=a.getX(m+2);s=ma(this,o,t,n,c,h,f,_,M,S),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let x=0,v=u.length;x<v;x++){const m=u[x],g=o[m.materialIndex],_=Math.max(m.start,p.start),M=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let S=_,C=M;S<C;S+=3){const y=S,w=S+1,L=S+2;s=ma(this,g,t,n,c,h,f,y,w,L),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const x=Math.max(0,p.start),v=Math.min(l.count,p.start+p.count);for(let m=x,g=v;m<g;m+=3){const _=m,M=m+1,S=m+2;s=ma(this,o,t,n,c,h,f,_,M,S),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}}function ig(i,t,e,n,s,r,o,a){let l;if(t.side===pn?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,t.side===Oi,a),l===null)return null;pa.copy(a),pa.applyMatrix4(i.matrixWorld);const c=e.ray.origin.distanceTo(pa);return c<e.near||c>e.far?null:{distance:c,point:pa.clone(),object:i}}function ma(i,t,e,n,s,r,o,a,l,c){i.getVertexPosition(a,ha),i.getVertexPosition(l,ua),i.getVertexPosition(c,fa);const h=ig(i,t,e,n,ha,ua,fa,ju);if(h){const f=new O;Dn.getBarycoord(ju,ha,ua,fa,f),s&&(h.uv=Dn.getInterpolatedAttribute(s,a,l,c,f,new zt)),r&&(h.uv1=Dn.getInterpolatedAttribute(r,a,l,c,f,new zt)),o&&(h.normal=Dn.getInterpolatedAttribute(o,a,l,c,f,new O),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const u={a,b:l,c,normal:new O,materialIndex:0};Dn.getNormal(ha,ua,fa,u.normal),h.face=u,h.barycoord=f}return h}class cs extends ke{constructor(t=1,e=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],h=[],f=[];let u=0,p=0;x("z","y","x",-1,-1,n,e,t,o,r,0),x("z","y","x",1,-1,n,e,-t,o,r,1),x("x","z","y",1,1,t,n,e,s,o,2),x("x","z","y",1,-1,t,n,-e,s,o,3),x("x","y","z",1,-1,t,e,n,s,r,4),x("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new We(c,3)),this.setAttribute("normal",new We(h,3)),this.setAttribute("uv",new We(f,2));function x(v,m,g,_,M,S,C,y,w,L,E){const b=S/w,N=C/L,X=S/2,W=C/2,Y=y/2,nt=w+1,$=L+1;let it=0,G=0;const st=new O;for(let xt=0;xt<$;xt++){const Dt=xt*N-W;for(let $t=0;$t<nt;$t++){const fe=$t*b-X;st[v]=fe*_,st[m]=Dt*M,st[g]=Y,c.push(st.x,st.y,st.z),st[v]=0,st[m]=0,st[g]=y>0?1:-1,h.push(st.x,st.y,st.z),f.push($t/w),f.push(1-xt/L),it+=1}}for(let xt=0;xt<L;xt++)for(let Dt=0;Dt<w;Dt++){const $t=u+Dt+nt*xt,fe=u+Dt+nt*(xt+1),j=u+(Dt+1)+nt*(xt+1),rt=u+(Dt+1)+nt*xt;l.push($t,fe,rt),l.push(fe,j,rt),G+=6}a.addGroup(p,G,E),p+=G,u+=it}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new cs(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function Lr(i){const t={};for(const e in i){t[e]={};for(const n in i[e]){const s=i[e][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone():Array.isArray(s)?t[e][n]=s.slice():t[e][n]=s}}return t}function ln(i){const t={};for(let e=0;e<i.length;e++){const n=Lr(i[e]);for(const s in n)t[s]=n[s]}return t}function sg(i){const t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function ap(i){const t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:ce.workingColorSpace}const tl={clone:Lr,merge:ln};var rg=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,og=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Ve extends Hs{static get type(){return"ShaderMaterial"}constructor(t){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=rg,this.fragmentShader=og,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Lr(t.uniforms),this.uniformsGroups=sg(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?e.uniforms[s]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[s]={type:"m4",value:o.toArray()}:e.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}}class lp extends sn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ge,this.projectionMatrix=new ge,this.projectionMatrixInverse=new ge,this.coordinateSystem=Ci}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Yi=new O,Zu=new zt,Ju=new zt;class Fn extends lp{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=xh*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(Ga*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return xh*2*Math.atan(Math.tan(Ga*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Yi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Yi.x,Yi.y).multiplyScalar(-t/Yi.z),Yi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Yi.x,Yi.y).multiplyScalar(-t/Yi.z)}getViewSize(t,e){return this.getViewBounds(t,Zu,Ju),e.subVectors(Ju,Zu)}setViewOffset(t,e,n,s,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(Ga*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,e-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const sr=-90,rr=1;class ag extends sn{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Fn(sr,rr,t,e);s.layers=this.layers,this.add(s);const r=new Fn(sr,rr,t,e);r.layers=this.layers,this.add(r);const o=new Fn(sr,rr,t,e);o.layers=this.layers,this.add(o);const a=new Fn(sr,rr,t,e);a.layers=this.layers,this.add(a);const l=new Fn(sr,rr,t,e);l.layers=this.layers,this.add(l);const c=new Fn(sr,rr,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,s,r,o,a,l]=e;for(const c of e)this.remove(c);if(t===Ci)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Qa)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,c,h]=this.children,f=t.getRenderTarget(),u=t.getActiveCubeFace(),p=t.getActiveMipmapLevel(),x=t.xr.enabled;t.xr.enabled=!1;const v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,s),t.render(e,r),t.setRenderTarget(n,1,s),t.render(e,o),t.setRenderTarget(n,2,s),t.render(e,a),t.setRenderTarget(n,3,s),t.render(e,l),t.setRenderTarget(n,4,s),t.render(e,c),n.texture.generateMipmaps=v,t.setRenderTarget(n,5,s),t.render(e,h),t.setRenderTarget(f,u,p),t.xr.enabled=x,n.texture.needsPMREMUpdate=!0}}class cp extends Ye{constructor(t,e,n,s,r,o,a,l,c,h){t=t!==void 0?t:[],e=e!==void 0?e:Ar,super(t,e,n,s,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class lg extends Nn{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new cp(s,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:dn}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new cs(5,5,5),r=new Ve({name:"CubemapFromEquirect",uniforms:Lr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:pn,blending:Di});r.uniforms.tEquirect.value=e;const o=new Re(s,r),a=e.minFilter;return e.minFilter===di&&(e.minFilter=dn),new ag(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e,n,s){const r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,s);t.setRenderTarget(r)}}const sc=new O,cg=new O,hg=new jt;class As{constructor(t=new O(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const s=sc.subVectors(n,e).cross(cg.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const n=t.delta(sc),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||hg.getNormalMatrix(t),s=this.coplanarPoint(sc).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Ss=new fs,ga=new O;class hp{constructor(t=new As,e=new As,n=new As,s=new As,r=new As,o=new As){this.planes=[t,e,n,s,r,o]}set(t,e,n,s,r,o){const a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=Ci){const n=this.planes,s=t.elements,r=s[0],o=s[1],a=s[2],l=s[3],c=s[4],h=s[5],f=s[6],u=s[7],p=s[8],x=s[9],v=s[10],m=s[11],g=s[12],_=s[13],M=s[14],S=s[15];if(n[0].setComponents(l-r,u-c,m-p,S-g).normalize(),n[1].setComponents(l+r,u+c,m+p,S+g).normalize(),n[2].setComponents(l+o,u+h,m+x,S+_).normalize(),n[3].setComponents(l-o,u-h,m-x,S-_).normalize(),n[4].setComponents(l-a,u-f,m-v,S-M).normalize(),e===Ci)n[5].setComponents(l+a,u+f,m+v,S+M).normalize();else if(e===Qa)n[5].setComponents(a,f,v,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Ss.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Ss.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Ss)}intersectsSprite(t){return Ss.center.set(0,0,0),Ss.radius=.7071067811865476,Ss.applyMatrix4(t.matrixWorld),this.intersectsSphere(Ss)}intersectsSphere(t){const e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const s=e[n];if(ga.x=s.normal.x>0?t.max.x:t.min.x,ga.y=s.normal.y>0?t.max.y:t.min.y,ga.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(ga)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function up(){let i=null,t=!1,e=null,n=null;function s(r,o){e(r,o),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function ug(i){const t=new WeakMap;function e(a,l){const c=a.array,h=a.usage,f=c.byteLength,u=i.createBuffer();i.bindBuffer(l,u),i.bufferData(l,c,h),a.onUploadCallback();let p;if(c instanceof Float32Array)p=i.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=i.SHORT;else if(c instanceof Uint32Array)p=i.UNSIGNED_INT;else if(c instanceof Int32Array)p=i.INT;else if(c instanceof Int8Array)p=i.BYTE;else if(c instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:f}}function n(a,l,c){const h=l.array,f=l.updateRanges;if(i.bindBuffer(c,a),f.length===0)i.bufferSubData(c,0,h);else{f.sort((p,x)=>p.start-x.start);let u=0;for(let p=1;p<f.length;p++){const x=f[u],v=f[p];v.start<=x.start+x.count+1?x.count=Math.max(x.count,v.start+v.count-x.start):(++u,f[u]=v)}f.length=u+1;for(let p=0,x=f.length;p<x;p++){const v=f[p];i.bufferSubData(c,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=t.get(a);l&&(i.deleteBuffer(l.buffer),t.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=t.get(a);if(c===void 0)t.set(a,e(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}class Ps extends ke{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};const r=t/2,o=e/2,a=Math.floor(n),l=Math.floor(s),c=a+1,h=l+1,f=t/a,u=e/l,p=[],x=[],v=[],m=[];for(let g=0;g<h;g++){const _=g*u-o;for(let M=0;M<c;M++){const S=M*f-r;x.push(S,-_,0),v.push(0,0,1),m.push(M/a),m.push(1-g/l)}}for(let g=0;g<l;g++)for(let _=0;_<a;_++){const M=_+c*g,S=_+c*(g+1),C=_+1+c*(g+1),y=_+1+c*g;p.push(M,S,y),p.push(S,C,y)}this.setIndex(p),this.setAttribute("position",new We(x,3)),this.setAttribute("normal",new We(v,3)),this.setAttribute("uv",new We(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ps(t.width,t.height,t.widthSegments,t.heightSegments)}}var fg=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,dg=`#ifdef USE_ALPHAHASH
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
#endif`,pg=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,mg=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,gg=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,vg=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,xg=`#ifdef USE_AOMAP
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
#endif`,_g=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Mg=`#ifdef USE_BATCHING
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
#endif`,Sg=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,yg=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Eg=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bg=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Tg=`#ifdef USE_IRIDESCENCE
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
#endif`,Ag=`#ifdef USE_BUMPMAP
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
#endif`,wg=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Rg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Cg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Lg=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Dg=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Pg=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Ng=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Ig=`#if defined( USE_COLOR_ALPHA )
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
#endif`,Og=`#define PI 3.141592653589793
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
} // validated`,kg=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Ug=`vec3 transformedNormal = objectNormal;
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
#endif`,zg=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Fg=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Bg=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Hg=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Vg="gl_FragColor = linearToOutputTexel( gl_FragColor );",Wg=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Gg=`#ifdef USE_ENVMAP
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
#endif`,Kg=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Xg=`#ifdef USE_ENVMAP
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
#endif`,$g=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,qg=`#ifdef USE_ENVMAP
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
#endif`,Yg=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,jg=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Zg=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Jg=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Qg=`#ifdef USE_GRADIENTMAP
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
}`,t1=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,e1=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,n1=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,i1=`uniform bool receiveShadow;
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
#endif`,s1=`#ifdef USE_ENVMAP
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
#endif`,r1=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,o1=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,a1=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,l1=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,c1=`PhysicalMaterial material;
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
#endif`,h1=`struct PhysicalMaterial {
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
}`,u1=`
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
#endif`,f1=`#if defined( RE_IndirectDiffuse )
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
#endif`,d1=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,p1=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,m1=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,g1=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,v1=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,x1=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,_1=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,M1=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,S1=`#if defined( USE_POINTS_UV )
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
#endif`,y1=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,E1=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,b1=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,T1=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,A1=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,w1=`#ifdef USE_MORPHTARGETS
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
#endif`,R1=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,C1=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,L1=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,D1=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,P1=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,N1=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,I1=`#ifdef USE_NORMALMAP
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
#endif`,O1=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,k1=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,U1=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,z1=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,F1=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,B1=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,H1=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,V1=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,W1=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,G1=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,K1=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,X1=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,$1=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,q1=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Y1=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,j1=`float getShadowMask() {
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
}`,Z1=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,J1=`#ifdef USE_SKINNING
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
#endif`,Q1=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,tv=`#ifdef USE_SKINNING
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
#endif`,ev=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,nv=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,iv=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,sv=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,rv=`#ifdef USE_TRANSMISSION
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
#endif`,ov=`#ifdef USE_TRANSMISSION
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
#endif`,av=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,lv=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,cv=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,hv=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const uv=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,fv=`uniform sampler2D t2D;
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
}`,dv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,pv=`#ifdef ENVMAP_TYPE_CUBE
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
}`,mv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,gv=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,vv=`#include <common>
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
}`,xv=`#if DEPTH_PACKING == 3200
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
}`,_v=`#define DISTANCE
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
}`,Mv=`#define DISTANCE
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
}`,Sv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,yv=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ev=`uniform float scale;
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
}`,bv=`uniform vec3 diffuse;
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
}`,Tv=`#include <common>
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
}`,Av=`uniform vec3 diffuse;
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
}`,wv=`#define LAMBERT
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
}`,Rv=`#define LAMBERT
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
}`,Cv=`#define MATCAP
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
}`,Lv=`#define MATCAP
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
}`,Dv=`#define NORMAL
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
}`,Pv=`#define NORMAL
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
}`,Nv=`#define PHONG
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
}`,Iv=`#define PHONG
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
}`,Ov=`#define STANDARD
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
}`,kv=`#define STANDARD
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
}`,Uv=`#define TOON
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
}`,zv=`#define TOON
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
}`,Fv=`uniform float size;
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
}`,Bv=`uniform vec3 diffuse;
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
}`,Hv=`#include <common>
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
}`,Vv=`uniform vec3 color;
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
}`,Wv=`uniform float rotation;
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
}`,Gv=`uniform vec3 diffuse;
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
}`,Jt={alphahash_fragment:fg,alphahash_pars_fragment:dg,alphamap_fragment:pg,alphamap_pars_fragment:mg,alphatest_fragment:gg,alphatest_pars_fragment:vg,aomap_fragment:xg,aomap_pars_fragment:_g,batching_pars_vertex:Mg,batching_vertex:Sg,begin_vertex:yg,beginnormal_vertex:Eg,bsdfs:bg,iridescence_fragment:Tg,bumpmap_pars_fragment:Ag,clipping_planes_fragment:wg,clipping_planes_pars_fragment:Rg,clipping_planes_pars_vertex:Cg,clipping_planes_vertex:Lg,color_fragment:Dg,color_pars_fragment:Pg,color_pars_vertex:Ng,color_vertex:Ig,common:Og,cube_uv_reflection_fragment:kg,defaultnormal_vertex:Ug,displacementmap_pars_vertex:zg,displacementmap_vertex:Fg,emissivemap_fragment:Bg,emissivemap_pars_fragment:Hg,colorspace_fragment:Vg,colorspace_pars_fragment:Wg,envmap_fragment:Gg,envmap_common_pars_fragment:Kg,envmap_pars_fragment:Xg,envmap_pars_vertex:$g,envmap_physical_pars_fragment:s1,envmap_vertex:qg,fog_vertex:Yg,fog_pars_vertex:jg,fog_fragment:Zg,fog_pars_fragment:Jg,gradientmap_pars_fragment:Qg,lightmap_pars_fragment:t1,lights_lambert_fragment:e1,lights_lambert_pars_fragment:n1,lights_pars_begin:i1,lights_toon_fragment:r1,lights_toon_pars_fragment:o1,lights_phong_fragment:a1,lights_phong_pars_fragment:l1,lights_physical_fragment:c1,lights_physical_pars_fragment:h1,lights_fragment_begin:u1,lights_fragment_maps:f1,lights_fragment_end:d1,logdepthbuf_fragment:p1,logdepthbuf_pars_fragment:m1,logdepthbuf_pars_vertex:g1,logdepthbuf_vertex:v1,map_fragment:x1,map_pars_fragment:_1,map_particle_fragment:M1,map_particle_pars_fragment:S1,metalnessmap_fragment:y1,metalnessmap_pars_fragment:E1,morphinstance_vertex:b1,morphcolor_vertex:T1,morphnormal_vertex:A1,morphtarget_pars_vertex:w1,morphtarget_vertex:R1,normal_fragment_begin:C1,normal_fragment_maps:L1,normal_pars_fragment:D1,normal_pars_vertex:P1,normal_vertex:N1,normalmap_pars_fragment:I1,clearcoat_normal_fragment_begin:O1,clearcoat_normal_fragment_maps:k1,clearcoat_pars_fragment:U1,iridescence_pars_fragment:z1,opaque_fragment:F1,packing:B1,premultiplied_alpha_fragment:H1,project_vertex:V1,dithering_fragment:W1,dithering_pars_fragment:G1,roughnessmap_fragment:K1,roughnessmap_pars_fragment:X1,shadowmap_pars_fragment:$1,shadowmap_pars_vertex:q1,shadowmap_vertex:Y1,shadowmask_pars_fragment:j1,skinbase_vertex:Z1,skinning_pars_vertex:J1,skinning_vertex:Q1,skinnormal_vertex:tv,specularmap_fragment:ev,specularmap_pars_fragment:nv,tonemapping_fragment:iv,tonemapping_pars_fragment:sv,transmission_fragment:rv,transmission_pars_fragment:ov,uv_pars_fragment:av,uv_pars_vertex:lv,uv_vertex:cv,worldpos_vertex:hv,background_vert:uv,background_frag:fv,backgroundCube_vert:dv,backgroundCube_frag:pv,cube_vert:mv,cube_frag:gv,depth_vert:vv,depth_frag:xv,distanceRGBA_vert:_v,distanceRGBA_frag:Mv,equirect_vert:Sv,equirect_frag:yv,linedashed_vert:Ev,linedashed_frag:bv,meshbasic_vert:Tv,meshbasic_frag:Av,meshlambert_vert:wv,meshlambert_frag:Rv,meshmatcap_vert:Cv,meshmatcap_frag:Lv,meshnormal_vert:Dv,meshnormal_frag:Pv,meshphong_vert:Nv,meshphong_frag:Iv,meshphysical_vert:Ov,meshphysical_frag:kv,meshtoon_vert:Uv,meshtoon_frag:zv,points_vert:Fv,points_frag:Bv,shadow_vert:Hv,shadow_frag:Vv,sprite_vert:Wv,sprite_frag:Gv},ht={common:{diffuse:{value:new se(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new jt},alphaMap:{value:null},alphaMapTransform:{value:new jt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new jt}},envmap:{envMap:{value:null},envMapRotation:{value:new jt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new jt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new jt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new jt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new jt},normalScale:{value:new zt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new jt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new jt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new jt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new jt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new se(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new se(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new jt},alphaTest:{value:0},uvTransform:{value:new jt}},sprite:{diffuse:{value:new se(16777215)},opacity:{value:1},center:{value:new zt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new jt},alphaMap:{value:null},alphaMapTransform:{value:new jt},alphaTest:{value:0}}},ui={basic:{uniforms:ln([ht.common,ht.specularmap,ht.envmap,ht.aomap,ht.lightmap,ht.fog]),vertexShader:Jt.meshbasic_vert,fragmentShader:Jt.meshbasic_frag},lambert:{uniforms:ln([ht.common,ht.specularmap,ht.envmap,ht.aomap,ht.lightmap,ht.emissivemap,ht.bumpmap,ht.normalmap,ht.displacementmap,ht.fog,ht.lights,{emissive:{value:new se(0)}}]),vertexShader:Jt.meshlambert_vert,fragmentShader:Jt.meshlambert_frag},phong:{uniforms:ln([ht.common,ht.specularmap,ht.envmap,ht.aomap,ht.lightmap,ht.emissivemap,ht.bumpmap,ht.normalmap,ht.displacementmap,ht.fog,ht.lights,{emissive:{value:new se(0)},specular:{value:new se(1118481)},shininess:{value:30}}]),vertexShader:Jt.meshphong_vert,fragmentShader:Jt.meshphong_frag},standard:{uniforms:ln([ht.common,ht.envmap,ht.aomap,ht.lightmap,ht.emissivemap,ht.bumpmap,ht.normalmap,ht.displacementmap,ht.roughnessmap,ht.metalnessmap,ht.fog,ht.lights,{emissive:{value:new se(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Jt.meshphysical_vert,fragmentShader:Jt.meshphysical_frag},toon:{uniforms:ln([ht.common,ht.aomap,ht.lightmap,ht.emissivemap,ht.bumpmap,ht.normalmap,ht.displacementmap,ht.gradientmap,ht.fog,ht.lights,{emissive:{value:new se(0)}}]),vertexShader:Jt.meshtoon_vert,fragmentShader:Jt.meshtoon_frag},matcap:{uniforms:ln([ht.common,ht.bumpmap,ht.normalmap,ht.displacementmap,ht.fog,{matcap:{value:null}}]),vertexShader:Jt.meshmatcap_vert,fragmentShader:Jt.meshmatcap_frag},points:{uniforms:ln([ht.points,ht.fog]),vertexShader:Jt.points_vert,fragmentShader:Jt.points_frag},dashed:{uniforms:ln([ht.common,ht.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Jt.linedashed_vert,fragmentShader:Jt.linedashed_frag},depth:{uniforms:ln([ht.common,ht.displacementmap]),vertexShader:Jt.depth_vert,fragmentShader:Jt.depth_frag},normal:{uniforms:ln([ht.common,ht.bumpmap,ht.normalmap,ht.displacementmap,{opacity:{value:1}}]),vertexShader:Jt.meshnormal_vert,fragmentShader:Jt.meshnormal_frag},sprite:{uniforms:ln([ht.sprite,ht.fog]),vertexShader:Jt.sprite_vert,fragmentShader:Jt.sprite_frag},background:{uniforms:{uvTransform:{value:new jt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Jt.background_vert,fragmentShader:Jt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new jt}},vertexShader:Jt.backgroundCube_vert,fragmentShader:Jt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Jt.cube_vert,fragmentShader:Jt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Jt.equirect_vert,fragmentShader:Jt.equirect_frag},distanceRGBA:{uniforms:ln([ht.common,ht.displacementmap,{referencePosition:{value:new O},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Jt.distanceRGBA_vert,fragmentShader:Jt.distanceRGBA_frag},shadow:{uniforms:ln([ht.lights,ht.fog,{color:{value:new se(0)},opacity:{value:1}}]),vertexShader:Jt.shadow_vert,fragmentShader:Jt.shadow_frag}};ui.physical={uniforms:ln([ui.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new jt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new jt},clearcoatNormalScale:{value:new zt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new jt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new jt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new jt},sheen:{value:0},sheenColor:{value:new se(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new jt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new jt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new jt},transmissionSamplerSize:{value:new zt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new jt},attenuationDistance:{value:0},attenuationColor:{value:new se(0)},specularColor:{value:new se(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new jt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new jt},anisotropyVector:{value:new zt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new jt}}]),vertexShader:Jt.meshphysical_vert,fragmentShader:Jt.meshphysical_frag};const va={r:0,b:0,g:0},ys=new Ui,Kv=new ge;function Xv(i,t,e,n,s,r,o){const a=new se(0);let l=r===!0?0:1,c,h,f=null,u=0,p=null;function x(_){let M=_.isScene===!0?_.background:null;return M&&M.isTexture&&(M=(_.backgroundBlurriness>0?e:t).get(M)),M}function v(_){let M=!1;const S=x(_);S===null?g(a,l):S&&S.isColor&&(g(S,1),M=!0);const C=i.xr.getEnvironmentBlendMode();C==="additive"?n.buffers.color.setClear(0,0,0,1,o):C==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||M)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(_,M){const S=x(M);S&&(S.isCubeTexture||S.mapping===vl)?(h===void 0&&(h=new Re(new cs(1,1,1),new Ve({name:"BackgroundCubeMaterial",uniforms:Lr(ui.backgroundCube.uniforms),vertexShader:ui.backgroundCube.vertexShader,fragmentShader:ui.backgroundCube.fragmentShader,side:pn,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(C,y,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),ys.copy(M.backgroundRotation),ys.x*=-1,ys.y*=-1,ys.z*=-1,S.isCubeTexture&&S.isRenderTargetTexture===!1&&(ys.y*=-1,ys.z*=-1),h.material.uniforms.envMap.value=S,h.material.uniforms.flipEnvMap.value=S.isCubeTexture&&S.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Kv.makeRotationFromEuler(ys)),h.material.toneMapped=ce.getTransfer(S.colorSpace)!==xe,(f!==S||u!==S.version||p!==i.toneMapping)&&(h.material.needsUpdate=!0,f=S,u=S.version,p=i.toneMapping),h.layers.enableAll(),_.unshift(h,h.geometry,h.material,0,0,null)):S&&S.isTexture&&(c===void 0&&(c=new Re(new Ps(2,2),new Ve({name:"BackgroundMaterial",uniforms:Lr(ui.background.uniforms),vertexShader:ui.background.vertexShader,fragmentShader:ui.background.fragmentShader,side:Oi,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=S,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.toneMapped=ce.getTransfer(S.colorSpace)!==xe,S.matrixAutoUpdate===!0&&S.updateMatrix(),c.material.uniforms.uvTransform.value.copy(S.matrix),(f!==S||u!==S.version||p!==i.toneMapping)&&(c.material.needsUpdate=!0,f=S,u=S.version,p=i.toneMapping),c.layers.enableAll(),_.unshift(c,c.geometry,c.material,0,0,null))}function g(_,M){_.getRGB(va,ap(i)),n.buffers.color.setClear(va.r,va.g,va.b,M,o)}return{getClearColor:function(){return a},setClearColor:function(_,M=1){a.set(_),l=M,g(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(_){l=_,g(a,l)},render:v,addToRenderList:m}}function $v(i,t){const e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=u(null);let r=s,o=!1;function a(b,N,X,W,Y){let nt=!1;const $=f(W,X,N);r!==$&&(r=$,c(r.object)),nt=p(b,W,X,Y),nt&&x(b,W,X,Y),Y!==null&&t.update(Y,i.ELEMENT_ARRAY_BUFFER),(nt||o)&&(o=!1,S(b,N,X,W),Y!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(Y).buffer))}function l(){return i.createVertexArray()}function c(b){return i.bindVertexArray(b)}function h(b){return i.deleteVertexArray(b)}function f(b,N,X){const W=X.wireframe===!0;let Y=n[b.id];Y===void 0&&(Y={},n[b.id]=Y);let nt=Y[N.id];nt===void 0&&(nt={},Y[N.id]=nt);let $=nt[W];return $===void 0&&($=u(l()),nt[W]=$),$}function u(b){const N=[],X=[],W=[];for(let Y=0;Y<e;Y++)N[Y]=0,X[Y]=0,W[Y]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:N,enabledAttributes:X,attributeDivisors:W,object:b,attributes:{},index:null}}function p(b,N,X,W){const Y=r.attributes,nt=N.attributes;let $=0;const it=X.getAttributes();for(const G in it)if(it[G].location>=0){const xt=Y[G];let Dt=nt[G];if(Dt===void 0&&(G==="instanceMatrix"&&b.instanceMatrix&&(Dt=b.instanceMatrix),G==="instanceColor"&&b.instanceColor&&(Dt=b.instanceColor)),xt===void 0||xt.attribute!==Dt||Dt&&xt.data!==Dt.data)return!0;$++}return r.attributesNum!==$||r.index!==W}function x(b,N,X,W){const Y={},nt=N.attributes;let $=0;const it=X.getAttributes();for(const G in it)if(it[G].location>=0){let xt=nt[G];xt===void 0&&(G==="instanceMatrix"&&b.instanceMatrix&&(xt=b.instanceMatrix),G==="instanceColor"&&b.instanceColor&&(xt=b.instanceColor));const Dt={};Dt.attribute=xt,xt&&xt.data&&(Dt.data=xt.data),Y[G]=Dt,$++}r.attributes=Y,r.attributesNum=$,r.index=W}function v(){const b=r.newAttributes;for(let N=0,X=b.length;N<X;N++)b[N]=0}function m(b){g(b,0)}function g(b,N){const X=r.newAttributes,W=r.enabledAttributes,Y=r.attributeDivisors;X[b]=1,W[b]===0&&(i.enableVertexAttribArray(b),W[b]=1),Y[b]!==N&&(i.vertexAttribDivisor(b,N),Y[b]=N)}function _(){const b=r.newAttributes,N=r.enabledAttributes;for(let X=0,W=N.length;X<W;X++)N[X]!==b[X]&&(i.disableVertexAttribArray(X),N[X]=0)}function M(b,N,X,W,Y,nt,$){$===!0?i.vertexAttribIPointer(b,N,X,Y,nt):i.vertexAttribPointer(b,N,X,W,Y,nt)}function S(b,N,X,W){v();const Y=W.attributes,nt=X.getAttributes(),$=N.defaultAttributeValues;for(const it in nt){const G=nt[it];if(G.location>=0){let st=Y[it];if(st===void 0&&(it==="instanceMatrix"&&b.instanceMatrix&&(st=b.instanceMatrix),it==="instanceColor"&&b.instanceColor&&(st=b.instanceColor)),st!==void 0){const xt=st.normalized,Dt=st.itemSize,$t=t.get(st);if($t===void 0)continue;const fe=$t.buffer,j=$t.type,rt=$t.bytesPerElement,wt=j===i.INT||j===i.UNSIGNED_INT||st.gpuType===zh;if(st.isInterleavedBufferAttribute){const lt=st.data,Ot=lt.stride,Ht=st.offset;if(lt.isInstancedInterleavedBuffer){for(let Kt=0;Kt<G.locationSize;Kt++)g(G.location+Kt,lt.meshPerAttribute);b.isInstancedMesh!==!0&&W._maxInstanceCount===void 0&&(W._maxInstanceCount=lt.meshPerAttribute*lt.count)}else for(let Kt=0;Kt<G.locationSize;Kt++)m(G.location+Kt);i.bindBuffer(i.ARRAY_BUFFER,fe);for(let Kt=0;Kt<G.locationSize;Kt++)M(G.location+Kt,Dt/G.locationSize,j,xt,Ot*rt,(Ht+Dt/G.locationSize*Kt)*rt,wt)}else{if(st.isInstancedBufferAttribute){for(let lt=0;lt<G.locationSize;lt++)g(G.location+lt,st.meshPerAttribute);b.isInstancedMesh!==!0&&W._maxInstanceCount===void 0&&(W._maxInstanceCount=st.meshPerAttribute*st.count)}else for(let lt=0;lt<G.locationSize;lt++)m(G.location+lt);i.bindBuffer(i.ARRAY_BUFFER,fe);for(let lt=0;lt<G.locationSize;lt++)M(G.location+lt,Dt/G.locationSize,j,xt,Dt*rt,Dt/G.locationSize*lt*rt,wt)}}else if($!==void 0){const xt=$[it];if(xt!==void 0)switch(xt.length){case 2:i.vertexAttrib2fv(G.location,xt);break;case 3:i.vertexAttrib3fv(G.location,xt);break;case 4:i.vertexAttrib4fv(G.location,xt);break;default:i.vertexAttrib1fv(G.location,xt)}}}}_()}function C(){L();for(const b in n){const N=n[b];for(const X in N){const W=N[X];for(const Y in W)h(W[Y].object),delete W[Y];delete N[X]}delete n[b]}}function y(b){if(n[b.id]===void 0)return;const N=n[b.id];for(const X in N){const W=N[X];for(const Y in W)h(W[Y].object),delete W[Y];delete N[X]}delete n[b.id]}function w(b){for(const N in n){const X=n[N];if(X[b.id]===void 0)continue;const W=X[b.id];for(const Y in W)h(W[Y].object),delete W[Y];delete X[b.id]}}function L(){E(),o=!0,r!==s&&(r=s,c(r.object))}function E(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:L,resetDefaultState:E,dispose:C,releaseStatesOfGeometry:y,releaseStatesOfProgram:w,initAttributes:v,enableAttribute:m,disableUnusedAttributes:_}}function qv(i,t,e){let n;function s(c){n=c}function r(c,h){i.drawArrays(n,c,h),e.update(h,n,1)}function o(c,h,f){f!==0&&(i.drawArraysInstanced(n,c,h,f),e.update(h,n,f))}function a(c,h,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,f);let p=0;for(let x=0;x<f;x++)p+=h[x];e.update(p,n,1)}function l(c,h,f,u){if(f===0)return;const p=t.get("WEBGL_multi_draw");if(p===null)for(let x=0;x<c.length;x++)o(c[x],h[x],u[x]);else{p.multiDrawArraysInstancedWEBGL(n,c,0,h,0,u,0,f);let x=0;for(let v=0;v<f;v++)x+=h[v]*u[v];e.update(x,n,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function Yv(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){const w=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(w){return!(w!==Bn&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(w){const L=w===vi&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(w!==ki&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&w!==pi&&!L)}function l(w){if(w==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const f=e.logarithmicDepthBuffer===!0,u=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control"),p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),g=i.getParameter(i.MAX_VERTEX_ATTRIBS),_=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),M=i.getParameter(i.MAX_VARYING_VECTORS),S=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),C=x>0,y=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:f,reverseDepthBuffer:u,maxTextures:p,maxVertexTextures:x,maxTextureSize:v,maxCubemapSize:m,maxAttributes:g,maxVertexUniforms:_,maxVaryings:M,maxFragmentUniforms:S,vertexTextures:C,maxSamples:y}}function jv(i){const t=this;let e=null,n=0,s=!1,r=!1;const o=new As,a=new jt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,u){const p=f.length!==0||u||n!==0||s;return s=u,n=f.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,u){e=h(f,u,0)},this.setState=function(f,u,p){const x=f.clippingPlanes,v=f.clipIntersection,m=f.clipShadows,g=i.get(f);if(!s||x===null||x.length===0||r&&!m)r?h(null):c();else{const _=r?0:n,M=_*4;let S=g.clippingState||null;l.value=S,S=h(x,u,M,p);for(let C=0;C!==M;++C)S[C]=e[C];g.clippingState=S,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=_}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(f,u,p,x){const v=f!==null?f.length:0;let m=null;if(v!==0){if(m=l.value,x!==!0||m===null){const g=p+v*4,_=u.matrixWorldInverse;a.getNormalMatrix(_),(m===null||m.length<g)&&(m=new Float32Array(g));for(let M=0,S=p;M!==v;++M,S+=4)o.copy(f[M]).applyMatrix4(_,a),o.normal.toArray(m,S),m[S+3]=o.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=v,t.numIntersection=0,m}}function Zv(i){let t=new WeakMap;function e(o,a){return a===Vc?o.mapping=Ar:a===Wc&&(o.mapping=wr),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===Vc||a===Wc)if(t.has(o)){const l=t.get(o).texture;return e(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new lg(l.height);return c.fromEquirectangularTexture(i,o),t.set(o,c),o.addEventListener("dispose",s),e(c.texture,o.mapping)}else return null}}return o}function s(o){const a=o.target;a.removeEventListener("dispose",s);const l=t.get(a);l!==void 0&&(t.delete(a),l.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}class qh extends lp{constructor(t=-1,e=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-t,o=n+t,a=s+e,l=s-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}const mr=4,Qu=[.125,.215,.35,.446,.526,.582],Cs=20,rc=new qh,tf=new se;let oc=null,ac=0,lc=0,cc=!1;const ws=(1+Math.sqrt(5))/2,or=1/ws,ef=[new O(-ws,or,0),new O(ws,or,0),new O(-or,0,ws),new O(or,0,ws),new O(0,ws,-or),new O(0,ws,or),new O(-1,1,-1),new O(1,1,-1),new O(-1,1,1),new O(1,1,1)];class nf{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,s=100){oc=this._renderer.getRenderTarget(),ac=this._renderer.getActiveCubeFace(),lc=this._renderer.getActiveMipmapLevel(),cc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,n,s,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=of(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=rf(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(oc,ac,lc),this._renderer.xr.enabled=cc,t.scissorTest=!1,xa(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Ar||t.mapping===wr?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),oc=this._renderer.getRenderTarget(),ac=this._renderer.getActiveCubeFace(),lc=this._renderer.getActiveMipmapLevel(),cc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:dn,minFilter:dn,generateMipmaps:!1,type:vi,format:Bn,colorSpace:Or,depthBuffer:!1},s=sf(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=sf(t,e,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Jv(r)),this._blurMaterial=Qv(r,t,e)}return s}_compileMaterial(t){const e=new Re(this._lodPlanes[0],t);this._renderer.compile(e,rc)}_sceneToCubeUV(t,e,n,s){const a=new Fn(90,1,e,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,f=h.autoClear,u=h.toneMapping;h.getClearColor(tf),h.toneMapping=ss,h.autoClear=!1;const p=new si({name:"PMREM.Background",side:pn,depthWrite:!1,depthTest:!1}),x=new Re(new cs,p);let v=!1;const m=t.background;m?m.isColor&&(p.color.copy(m),t.background=null,v=!0):(p.color.copy(tf),v=!0);for(let g=0;g<6;g++){const _=g%3;_===0?(a.up.set(0,l[g],0),a.lookAt(c[g],0,0)):_===1?(a.up.set(0,0,l[g]),a.lookAt(0,c[g],0)):(a.up.set(0,l[g],0),a.lookAt(0,0,c[g]));const M=this._cubeSize;xa(s,_*M,g>2?M:0,M,M),h.setRenderTarget(s),v&&h.render(x,a),h.render(t,a)}x.geometry.dispose(),x.material.dispose(),h.toneMapping=u,h.autoClear=f,t.background=m}_textureToCubeUV(t,e){const n=this._renderer,s=t.mapping===Ar||t.mapping===wr;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=of()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=rf());const r=s?this._cubemapMaterial:this._equirectMaterial,o=new Re(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=t;const l=this._cubeSize;xa(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(o,rc)}_applyPMREM(t){const e=this._renderer,n=e.autoClear;e.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=ef[(s-r-1)%ef.length];this._blur(t,r-1,r,o,a)}e.autoClear=n}_blur(t,e,n,s,r){const o=this._pingPongRenderTarget;this._halfBlur(t,o,e,n,s,"latitudinal",r),this._halfBlur(o,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,f=new Re(this._lodPlanes[s],c),u=c.uniforms,p=this._sizeLods[n]-1,x=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*Cs-1),v=r/x,m=isFinite(r)?1+Math.floor(h*v):Cs;m>Cs&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Cs}`);const g=[];let _=0;for(let w=0;w<Cs;++w){const L=w/v,E=Math.exp(-L*L/2);g.push(E),w===0?_+=E:w<m&&(_+=2*E)}for(let w=0;w<g.length;w++)g[w]=g[w]/_;u.envMap.value=t.texture,u.samples.value=m,u.weights.value=g,u.latitudinal.value=o==="latitudinal",a&&(u.poleAxis.value=a);const{_lodMax:M}=this;u.dTheta.value=x,u.mipInt.value=M-n;const S=this._sizeLods[s],C=3*S*(s>M-mr?s-M+mr:0),y=4*(this._cubeSize-S);xa(e,C,y,3*S,2*S),l.setRenderTarget(e),l.render(f,rc)}}function Jv(i){const t=[],e=[],n=[];let s=i;const r=i-mr+1+Qu.length;for(let o=0;o<r;o++){const a=Math.pow(2,s);e.push(a);let l=1/a;o>i-mr?l=Qu[o-i+mr-1]:o===0&&(l=0),n.push(l);const c=1/(a-2),h=-c,f=1+c,u=[h,h,f,h,f,f,h,h,f,f,h,f],p=6,x=6,v=3,m=2,g=1,_=new Float32Array(v*x*p),M=new Float32Array(m*x*p),S=new Float32Array(g*x*p);for(let y=0;y<p;y++){const w=y%3*2/3-1,L=y>2?0:-1,E=[w,L,0,w+2/3,L,0,w+2/3,L+1,0,w,L,0,w+2/3,L+1,0,w,L+1,0];_.set(E,v*x*y),M.set(u,m*x*y);const b=[y,y,y,y,y,y];S.set(b,g*x*y)}const C=new ke;C.setAttribute("position",new we(_,v)),C.setAttribute("uv",new we(M,m)),C.setAttribute("faceIndex",new we(S,g)),t.push(C),s>mr&&s--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function sf(i,t,e){const n=new Nn(i,t,e);return n.texture.mapping=vl,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function xa(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function Qv(i,t,e){const n=new Float32Array(Cs),s=new O(0,1,0);return new Ve({name:"SphericalGaussianBlur",defines:{n:Cs,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Yh(),fragmentShader:`

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
		`,blending:Di,depthTest:!1,depthWrite:!1})}function rf(){return new Ve({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Yh(),fragmentShader:`

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
		`,blending:Di,depthTest:!1,depthWrite:!1})}function of(){return new Ve({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Yh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Di,depthTest:!1,depthWrite:!1})}function Yh(){return`

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
	`}function tx(i){let t=new WeakMap,e=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===Vc||l===Wc,h=l===Ar||l===wr;if(c||h){let f=t.get(a);const u=f!==void 0?f.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==u)return e===null&&(e=new nf(i)),f=c?e.fromEquirectangular(a,f):e.fromCubemap(a,f),f.texture.pmremVersion=a.pmremVersion,t.set(a,f),f.texture;if(f!==void 0)return f.texture;{const p=a.image;return c&&p&&p.height>0||h&&p&&s(p)?(e===null&&(e=new nf(i)),f=c?e.fromEquirectangular(a):e.fromCubemap(a),f.texture.pmremVersion=a.pmremVersion,t.set(a,f),a.addEventListener("dispose",r),f.texture):null}}}return a}function s(a){let l=0;const c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function r(a){const l=a.target;l.removeEventListener("dispose",r);const c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function o(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:o}}function ex(i){const t={};function e(n){if(t[n]!==void 0)return t[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const s=e(n);return s===null&&mo("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function nx(i,t,e,n){const s={},r=new WeakMap;function o(f){const u=f.target;u.index!==null&&t.remove(u.index);for(const x in u.attributes)t.remove(u.attributes[x]);for(const x in u.morphAttributes){const v=u.morphAttributes[x];for(let m=0,g=v.length;m<g;m++)t.remove(v[m])}u.removeEventListener("dispose",o),delete s[u.id];const p=r.get(u);p&&(t.remove(p),r.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,e.memory.geometries--}function a(f,u){return s[u.id]===!0||(u.addEventListener("dispose",o),s[u.id]=!0,e.memory.geometries++),u}function l(f){const u=f.attributes;for(const x in u)t.update(u[x],i.ARRAY_BUFFER);const p=f.morphAttributes;for(const x in p){const v=p[x];for(let m=0,g=v.length;m<g;m++)t.update(v[m],i.ARRAY_BUFFER)}}function c(f){const u=[],p=f.index,x=f.attributes.position;let v=0;if(p!==null){const _=p.array;v=p.version;for(let M=0,S=_.length;M<S;M+=3){const C=_[M+0],y=_[M+1],w=_[M+2];u.push(C,y,y,w,w,C)}}else if(x!==void 0){const _=x.array;v=x.version;for(let M=0,S=_.length/3-1;M<S;M+=3){const C=M+0,y=M+1,w=M+2;u.push(C,y,y,w,w,C)}}else return;const m=new(np(u)?$h:Xh)(u,1);m.version=v;const g=r.get(f);g&&t.remove(g),r.set(f,m)}function h(f){const u=r.get(f);if(u){const p=f.index;p!==null&&u.version<p.version&&c(f)}else c(f);return r.get(f)}return{get:a,update:l,getWireframeAttribute:h}}function ix(i,t,e){let n;function s(u){n=u}let r,o;function a(u){r=u.type,o=u.bytesPerElement}function l(u,p){i.drawElements(n,p,r,u*o),e.update(p,n,1)}function c(u,p,x){x!==0&&(i.drawElementsInstanced(n,p,r,u*o,x),e.update(p,n,x))}function h(u,p,x){if(x===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,p,0,r,u,0,x);let m=0;for(let g=0;g<x;g++)m+=p[g];e.update(m,n,1)}function f(u,p,x,v){if(x===0)return;const m=t.get("WEBGL_multi_draw");if(m===null)for(let g=0;g<u.length;g++)c(u[g]/o,p[g],v[g]);else{m.multiDrawElementsInstancedWEBGL(n,p,0,r,u,0,v,0,x);let g=0;for(let _=0;_<x;_++)g+=p[_]*v[_];e.update(g,n,1)}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=f}function sx(i){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(e.calls++,o){case i.TRIANGLES:e.triangles+=a*(r/3);break;case i.LINES:e.lines+=a*(r/2);break;case i.LINE_STRIP:e.lines+=a*(r-1);break;case i.LINE_LOOP:e.lines+=a*r;break;case i.POINTS:e.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function rx(i,t,e){const n=new WeakMap,s=new ze;function r(o,a,l){const c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,f=h!==void 0?h.length:0;let u=n.get(a);if(u===void 0||u.count!==f){let E=function(){w.dispose(),n.delete(a),a.removeEventListener("dispose",E)};u!==void 0&&u.texture.dispose();const p=a.morphAttributes.position!==void 0,x=a.morphAttributes.normal!==void 0,v=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],g=a.morphAttributes.normal||[],_=a.morphAttributes.color||[];let M=0;p===!0&&(M=1),x===!0&&(M=2),v===!0&&(M=3);let S=a.attributes.position.count*M,C=1;S>t.maxTextureSize&&(C=Math.ceil(S/t.maxTextureSize),S=t.maxTextureSize);const y=new Float32Array(S*C*4*f),w=new sp(y,S,C,f);w.type=pi,w.needsUpdate=!0;const L=M*4;for(let b=0;b<f;b++){const N=m[b],X=g[b],W=_[b],Y=S*C*4*b;for(let nt=0;nt<N.count;nt++){const $=nt*L;p===!0&&(s.fromBufferAttribute(N,nt),y[Y+$+0]=s.x,y[Y+$+1]=s.y,y[Y+$+2]=s.z,y[Y+$+3]=0),x===!0&&(s.fromBufferAttribute(X,nt),y[Y+$+4]=s.x,y[Y+$+5]=s.y,y[Y+$+6]=s.z,y[Y+$+7]=0),v===!0&&(s.fromBufferAttribute(W,nt),y[Y+$+8]=s.x,y[Y+$+9]=s.y,y[Y+$+10]=s.z,y[Y+$+11]=W.itemSize===4?s.w:1)}}u={count:f,texture:w,size:new zt(S,C)},n.set(a,u),a.addEventListener("dispose",E)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,e);else{let p=0;for(let v=0;v<c.length;v++)p+=c[v];const x=a.morphTargetsRelative?1:1-p;l.getUniforms().setValue(i,"morphTargetBaseInfluence",x),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",u.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",u.size)}return{update:r}}function ox(i,t,e,n){let s=new WeakMap;function r(l){const c=n.render.frame,h=l.geometry,f=t.get(l,h);if(s.get(f)!==c&&(t.update(f),s.set(f,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const u=l.skeleton;s.get(u)!==c&&(u.update(),s.set(u,c))}return f}function o(){s=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:o}}class jh extends Ye{constructor(t,e,n,s,r,o,a,l,c,h=Mr){if(h!==Mr&&h!==Cr)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===Mr&&(n=ls),n===void 0&&h===Cr&&(n=Rr),super(null,s,r,o,a,l,h,n,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=a!==void 0?a:nn,this.minFilter=l!==void 0?l:nn,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}const fp=new Ye,af=new jh(1,1),dp=new sp,pp=new $m,mp=new cp,lf=[],cf=[],hf=new Float32Array(16),uf=new Float32Array(9),ff=new Float32Array(4);function Ur(i,t,e){const n=i[0];if(n<=0||n>0)return i;const s=t*e;let r=lf[s];if(r===void 0&&(r=new Float32Array(s),lf[s]=r),t!==0){n.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,i[o].toArray(r,a)}return r}function Ge(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Ke(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function _l(i,t){let e=cf[t];e===void 0&&(e=new Int32Array(t),cf[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function ax(i,t){const e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function lx(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ge(e,t))return;i.uniform2fv(this.addr,t),Ke(e,t)}}function cx(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Ge(e,t))return;i.uniform3fv(this.addr,t),Ke(e,t)}}function hx(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ge(e,t))return;i.uniform4fv(this.addr,t),Ke(e,t)}}function ux(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ge(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Ke(e,t)}else{if(Ge(e,n))return;ff.set(n),i.uniformMatrix2fv(this.addr,!1,ff),Ke(e,n)}}function fx(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ge(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Ke(e,t)}else{if(Ge(e,n))return;uf.set(n),i.uniformMatrix3fv(this.addr,!1,uf),Ke(e,n)}}function dx(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ge(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Ke(e,t)}else{if(Ge(e,n))return;hf.set(n),i.uniformMatrix4fv(this.addr,!1,hf),Ke(e,n)}}function px(i,t){const e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function mx(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ge(e,t))return;i.uniform2iv(this.addr,t),Ke(e,t)}}function gx(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ge(e,t))return;i.uniform3iv(this.addr,t),Ke(e,t)}}function vx(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ge(e,t))return;i.uniform4iv(this.addr,t),Ke(e,t)}}function xx(i,t){const e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function _x(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ge(e,t))return;i.uniform2uiv(this.addr,t),Ke(e,t)}}function Mx(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ge(e,t))return;i.uniform3uiv(this.addr,t),Ke(e,t)}}function Sx(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ge(e,t))return;i.uniform4uiv(this.addr,t),Ke(e,t)}}function yx(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(af.compareFunction=ep,r=af):r=fp,e.setTexture2D(t||r,s)}function Ex(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||pp,s)}function bx(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||mp,s)}function Tx(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||dp,s)}function Ax(i){switch(i){case 5126:return ax;case 35664:return lx;case 35665:return cx;case 35666:return hx;case 35674:return ux;case 35675:return fx;case 35676:return dx;case 5124:case 35670:return px;case 35667:case 35671:return mx;case 35668:case 35672:return gx;case 35669:case 35673:return vx;case 5125:return xx;case 36294:return _x;case 36295:return Mx;case 36296:return Sx;case 35678:case 36198:case 36298:case 36306:case 35682:return yx;case 35679:case 36299:case 36307:return Ex;case 35680:case 36300:case 36308:case 36293:return bx;case 36289:case 36303:case 36311:case 36292:return Tx}}function wx(i,t){i.uniform1fv(this.addr,t)}function Rx(i,t){const e=Ur(t,this.size,2);i.uniform2fv(this.addr,e)}function Cx(i,t){const e=Ur(t,this.size,3);i.uniform3fv(this.addr,e)}function Lx(i,t){const e=Ur(t,this.size,4);i.uniform4fv(this.addr,e)}function Dx(i,t){const e=Ur(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function Px(i,t){const e=Ur(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function Nx(i,t){const e=Ur(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function Ix(i,t){i.uniform1iv(this.addr,t)}function Ox(i,t){i.uniform2iv(this.addr,t)}function kx(i,t){i.uniform3iv(this.addr,t)}function Ux(i,t){i.uniform4iv(this.addr,t)}function zx(i,t){i.uniform1uiv(this.addr,t)}function Fx(i,t){i.uniform2uiv(this.addr,t)}function Bx(i,t){i.uniform3uiv(this.addr,t)}function Hx(i,t){i.uniform4uiv(this.addr,t)}function Vx(i,t,e){const n=this.cache,s=t.length,r=_l(e,s);Ge(n,r)||(i.uniform1iv(this.addr,r),Ke(n,r));for(let o=0;o!==s;++o)e.setTexture2D(t[o]||fp,r[o])}function Wx(i,t,e){const n=this.cache,s=t.length,r=_l(e,s);Ge(n,r)||(i.uniform1iv(this.addr,r),Ke(n,r));for(let o=0;o!==s;++o)e.setTexture3D(t[o]||pp,r[o])}function Gx(i,t,e){const n=this.cache,s=t.length,r=_l(e,s);Ge(n,r)||(i.uniform1iv(this.addr,r),Ke(n,r));for(let o=0;o!==s;++o)e.setTextureCube(t[o]||mp,r[o])}function Kx(i,t,e){const n=this.cache,s=t.length,r=_l(e,s);Ge(n,r)||(i.uniform1iv(this.addr,r),Ke(n,r));for(let o=0;o!==s;++o)e.setTexture2DArray(t[o]||dp,r[o])}function Xx(i){switch(i){case 5126:return wx;case 35664:return Rx;case 35665:return Cx;case 35666:return Lx;case 35674:return Dx;case 35675:return Px;case 35676:return Nx;case 5124:case 35670:return Ix;case 35667:case 35671:return Ox;case 35668:case 35672:return kx;case 35669:case 35673:return Ux;case 5125:return zx;case 36294:return Fx;case 36295:return Bx;case 36296:return Hx;case 35678:case 36198:case 36298:case 36306:case 35682:return Vx;case 35679:case 36299:case 36307:return Wx;case 35680:case 36300:case 36308:case 36293:return Gx;case 36289:case 36303:case 36311:case 36292:return Kx}}class $x{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=Ax(e.type)}}class qx{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Xx(e.type)}}class Yx{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(t,e[a.id],n)}}}const hc=/(\w+)(\])?(\[|\.)?/g;function df(i,t){i.seq.push(t),i.map[t.id]=t}function jx(i,t,e){const n=i.name,s=n.length;for(hc.lastIndex=0;;){const r=hc.exec(n),o=hc.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){df(e,c===void 0?new $x(a,i,t):new qx(a,i,t));break}else{let f=e.map[a];f===void 0&&(f=new Yx(a),df(e,f)),e=f}}}class Ka{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=t.getActiveUniform(e,s),o=t.getUniformLocation(e,r.name);jx(r,o,this)}}setValue(t,e,n,s){const r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){const s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,o=e.length;r!==o;++r){const a=e[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,s)}}static seqWithValue(t,e){const n=[];for(let s=0,r=t.length;s!==r;++s){const o=t[s];o.id in e&&n.push(o)}return n}}function pf(i,t,e){const n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}const Zx=37297;let Jx=0;function Qx(i,t){const e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=s;o<r;o++){const a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}const mf=new jt;function t_(i){ce._getMatrix(mf,ce.workingColorSpace,i);const t=`mat3( ${mf.elements.map(e=>e.toFixed(4))} )`;switch(ce.getTransfer(i)){case xl:return[t,"LinearTransferOETF"];case xe:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function gf(i,t,e){const n=i.getShaderParameter(t,i.COMPILE_STATUS),s=i.getShaderInfoLog(t).trim();if(n&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const o=parseInt(r[1]);return e.toUpperCase()+`

`+s+`

`+Qx(i.getShaderSource(t),o)}else return s}function e_(i,t){const e=t_(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}function n_(i,t){let e;switch(t){case _m:e="Linear";break;case Mm:e="Reinhard";break;case Sm:e="Cineon";break;case ym:e="ACESFilmic";break;case bm:e="AgX";break;case Tm:e="Neutral";break;case Em:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const _a=new O;function i_(){ce.getLuminanceCoefficients(_a);const i=_a.x.toFixed(4),t=_a.y.toFixed(4),e=_a.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function s_(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(go).join(`
`)}function r_(i){const t=[];for(const e in i){const n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function o_(i,t){const e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(t,s),o=r.name;let a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:i.getAttribLocation(t,o),locationSize:a}}return e}function go(i){return i!==""}function vf(i,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function xf(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const a_=/^[ \t]*#include +<([\w\d./]+)>/gm;function _h(i){return i.replace(a_,c_)}const l_=new Map;function c_(i,t){let e=Jt[t];if(e===void 0){const n=l_.get(t);if(n!==void 0)e=Jt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return _h(e)}const h_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function _f(i){return i.replace(h_,u_)}function u_(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Mf(i){let t=`precision ${i.precision} float;
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
#define LOW_PRECISION`),t}function f_(i){let t="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===Wd?t="SHADOWMAP_TYPE_PCF":i.shadowMapType===J0?t="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Ri&&(t="SHADOWMAP_TYPE_VSM"),t}function d_(i){let t="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Ar:case wr:t="ENVMAP_TYPE_CUBE";break;case vl:t="ENVMAP_TYPE_CUBE_UV";break}return t}function p_(i){let t="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case wr:t="ENVMAP_MODE_REFRACTION";break}return t}function m_(i){let t="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Gd:t="ENVMAP_BLENDING_MULTIPLY";break;case vm:t="ENVMAP_BLENDING_MIX";break;case xm:t="ENVMAP_BLENDING_ADD";break}return t}function g_(i){const t=i.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:n,maxMip:e}}function v_(i,t,e,n){const s=i.getContext(),r=e.defines;let o=e.vertexShader,a=e.fragmentShader;const l=f_(e),c=d_(e),h=p_(e),f=m_(e),u=g_(e),p=s_(e),x=r_(r),v=s.createProgram();let m,g,_=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,x].filter(go).join(`
`),m.length>0&&(m+=`
`),g=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,x].filter(go).join(`
`),g.length>0&&(g+=`
`)):(m=[Mf(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,x,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(go).join(`
`),g=[Mf(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,x,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+f:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==ss?"#define TONE_MAPPING":"",e.toneMapping!==ss?Jt.tonemapping_pars_fragment:"",e.toneMapping!==ss?n_("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Jt.colorspace_pars_fragment,e_("linearToOutputTexel",e.outputColorSpace),i_(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(go).join(`
`)),o=_h(o),o=vf(o,e),o=xf(o,e),a=_h(a),a=vf(a,e),a=xf(a,e),o=_f(o),a=_f(a),e.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,g=["#define varying in",e.glslVersion===Pu?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Pu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);const M=_+m+o,S=_+g+a,C=pf(s,s.VERTEX_SHADER,M),y=pf(s,s.FRAGMENT_SHADER,S);s.attachShader(v,C),s.attachShader(v,y),e.index0AttributeName!==void 0?s.bindAttribLocation(v,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function w(N){if(i.debug.checkShaderErrors){const X=s.getProgramInfoLog(v).trim(),W=s.getShaderInfoLog(C).trim(),Y=s.getShaderInfoLog(y).trim();let nt=!0,$=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if(nt=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,v,C,y);else{const it=gf(s,C,"vertex"),G=gf(s,y,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+N.name+`
Material Type: `+N.type+`

Program Info Log: `+X+`
`+it+`
`+G)}else X!==""?console.warn("THREE.WebGLProgram: Program Info Log:",X):(W===""||Y==="")&&($=!1);$&&(N.diagnostics={runnable:nt,programLog:X,vertexShader:{log:W,prefix:m},fragmentShader:{log:Y,prefix:g}})}s.deleteShader(C),s.deleteShader(y),L=new Ka(s,v),E=o_(s,v)}let L;this.getUniforms=function(){return L===void 0&&w(this),L};let E;this.getAttributes=function(){return E===void 0&&w(this),E};let b=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return b===!1&&(b=s.getProgramParameter(v,Zx)),b},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Jx++,this.cacheKey=t,this.usedTimes=1,this.program=v,this.vertexShader=C,this.fragmentShader=y,this}let x_=0;class __{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,n=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(t);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new M_(t),e.set(t,n)),n}}class M_{constructor(t){this.id=x_++,this.code=t,this.usedTimes=0}}function S_(i,t,e,n,s,r,o){const a=new rp,l=new __,c=new Set,h=[],f=s.logarithmicDepthBuffer,u=s.vertexTextures;let p=s.precision;const x={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(E){return c.add(E),E===0?"uv":`uv${E}`}function m(E,b,N,X,W){const Y=X.fog,nt=W.geometry,$=E.isMeshStandardMaterial?X.environment:null,it=(E.isMeshStandardMaterial?e:t).get(E.envMap||$),G=it&&it.mapping===vl?it.image.height:null,st=x[E.type];E.precision!==null&&(p=s.getMaxPrecision(E.precision),p!==E.precision&&console.warn("THREE.WebGLProgram.getParameters:",E.precision,"not supported, using",p,"instead."));const xt=nt.morphAttributes.position||nt.morphAttributes.normal||nt.morphAttributes.color,Dt=xt!==void 0?xt.length:0;let $t=0;nt.morphAttributes.position!==void 0&&($t=1),nt.morphAttributes.normal!==void 0&&($t=2),nt.morphAttributes.color!==void 0&&($t=3);let fe,j,rt,wt;if(st){const me=ui[st];fe=me.vertexShader,j=me.fragmentShader}else fe=E.vertexShader,j=E.fragmentShader,l.update(E),rt=l.getVertexShaderID(E),wt=l.getFragmentShaderID(E);const lt=i.getRenderTarget(),Ot=i.state.buffers.depth.getReversed(),Ht=W.isInstancedMesh===!0,Kt=W.isBatchedMesh===!0,ve=!!E.map,ne=!!E.matcap,Ce=!!it,z=!!E.aoMap,on=!!E.lightMap,Qt=!!E.bumpMap,re=!!E.normalMap,Ut=!!E.displacementMap,be=!!E.emissiveMap,kt=!!E.metalnessMap,R=!!E.roughnessMap,T=E.anisotropy>0,B=E.clearcoat>0,Q=E.dispersion>0,et=E.iridescence>0,Z=E.sheen>0,Pt=E.transmission>0,pt=T&&!!E.anisotropyMap,bt=B&&!!E.clearcoatMap,ae=B&&!!E.clearcoatNormalMap,ot=B&&!!E.clearcoatRoughnessMap,Tt=et&&!!E.iridescenceMap,Ft=et&&!!E.iridescenceThicknessMap,Vt=Z&&!!E.sheenColorMap,At=Z&&!!E.sheenRoughnessMap,oe=!!E.specularMap,Zt=!!E.specularColorMap,ye=!!E.specularIntensityMap,k=Pt&&!!E.transmissionMap,dt=Pt&&!!E.thicknessMap,K=!!E.gradientMap,tt=!!E.alphaMap,_t=E.alphaTest>0,mt=!!E.alphaHash,qt=!!E.extensions;let Ne=ss;E.toneMapped&&(lt===null||lt.isXRRenderTarget===!0)&&(Ne=i.toneMapping);const je={shaderID:st,shaderType:E.type,shaderName:E.name,vertexShader:fe,fragmentShader:j,defines:E.defines,customVertexShaderID:rt,customFragmentShaderID:wt,isRawShaderMaterial:E.isRawShaderMaterial===!0,glslVersion:E.glslVersion,precision:p,batching:Kt,batchingColor:Kt&&W._colorsTexture!==null,instancing:Ht,instancingColor:Ht&&W.instanceColor!==null,instancingMorph:Ht&&W.morphTexture!==null,supportsVertexTextures:u,outputColorSpace:lt===null?i.outputColorSpace:lt.isXRRenderTarget===!0?lt.texture.colorSpace:Or,alphaToCoverage:!!E.alphaToCoverage,map:ve,matcap:ne,envMap:Ce,envMapMode:Ce&&it.mapping,envMapCubeUVHeight:G,aoMap:z,lightMap:on,bumpMap:Qt,normalMap:re,displacementMap:u&&Ut,emissiveMap:be,normalMapObjectSpace:re&&E.normalMapType===Lm,normalMapTangentSpace:re&&E.normalMapType===Cm,metalnessMap:kt,roughnessMap:R,anisotropy:T,anisotropyMap:pt,clearcoat:B,clearcoatMap:bt,clearcoatNormalMap:ae,clearcoatRoughnessMap:ot,dispersion:Q,iridescence:et,iridescenceMap:Tt,iridescenceThicknessMap:Ft,sheen:Z,sheenColorMap:Vt,sheenRoughnessMap:At,specularMap:oe,specularColorMap:Zt,specularIntensityMap:ye,transmission:Pt,transmissionMap:k,thicknessMap:dt,gradientMap:K,opaque:E.transparent===!1&&E.blending===_r&&E.alphaToCoverage===!1,alphaMap:tt,alphaTest:_t,alphaHash:mt,combine:E.combine,mapUv:ve&&v(E.map.channel),aoMapUv:z&&v(E.aoMap.channel),lightMapUv:on&&v(E.lightMap.channel),bumpMapUv:Qt&&v(E.bumpMap.channel),normalMapUv:re&&v(E.normalMap.channel),displacementMapUv:Ut&&v(E.displacementMap.channel),emissiveMapUv:be&&v(E.emissiveMap.channel),metalnessMapUv:kt&&v(E.metalnessMap.channel),roughnessMapUv:R&&v(E.roughnessMap.channel),anisotropyMapUv:pt&&v(E.anisotropyMap.channel),clearcoatMapUv:bt&&v(E.clearcoatMap.channel),clearcoatNormalMapUv:ae&&v(E.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ot&&v(E.clearcoatRoughnessMap.channel),iridescenceMapUv:Tt&&v(E.iridescenceMap.channel),iridescenceThicknessMapUv:Ft&&v(E.iridescenceThicknessMap.channel),sheenColorMapUv:Vt&&v(E.sheenColorMap.channel),sheenRoughnessMapUv:At&&v(E.sheenRoughnessMap.channel),specularMapUv:oe&&v(E.specularMap.channel),specularColorMapUv:Zt&&v(E.specularColorMap.channel),specularIntensityMapUv:ye&&v(E.specularIntensityMap.channel),transmissionMapUv:k&&v(E.transmissionMap.channel),thicknessMapUv:dt&&v(E.thicknessMap.channel),alphaMapUv:tt&&v(E.alphaMap.channel),vertexTangents:!!nt.attributes.tangent&&(re||T),vertexColors:E.vertexColors,vertexAlphas:E.vertexColors===!0&&!!nt.attributes.color&&nt.attributes.color.itemSize===4,pointsUvs:W.isPoints===!0&&!!nt.attributes.uv&&(ve||tt),fog:!!Y,useFog:E.fog===!0,fogExp2:!!Y&&Y.isFogExp2,flatShading:E.flatShading===!0,sizeAttenuation:E.sizeAttenuation===!0,logarithmicDepthBuffer:f,reverseDepthBuffer:Ot,skinning:W.isSkinnedMesh===!0,morphTargets:nt.morphAttributes.position!==void 0,morphNormals:nt.morphAttributes.normal!==void 0,morphColors:nt.morphAttributes.color!==void 0,morphTargetsCount:Dt,morphTextureStride:$t,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:E.dithering,shadowMapEnabled:i.shadowMap.enabled&&N.length>0,shadowMapType:i.shadowMap.type,toneMapping:Ne,decodeVideoTexture:ve&&E.map.isVideoTexture===!0&&ce.getTransfer(E.map.colorSpace)===xe,decodeVideoTextureEmissive:be&&E.emissiveMap.isVideoTexture===!0&&ce.getTransfer(E.emissiveMap.colorSpace)===xe,premultipliedAlpha:E.premultipliedAlpha,doubleSided:E.side===Mn,flipSided:E.side===pn,useDepthPacking:E.depthPacking>=0,depthPacking:E.depthPacking||0,index0AttributeName:E.index0AttributeName,extensionClipCullDistance:qt&&E.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(qt&&E.extensions.multiDraw===!0||Kt)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:E.customProgramCacheKey()};return je.vertexUv1s=c.has(1),je.vertexUv2s=c.has(2),je.vertexUv3s=c.has(3),c.clear(),je}function g(E){const b=[];if(E.shaderID?b.push(E.shaderID):(b.push(E.customVertexShaderID),b.push(E.customFragmentShaderID)),E.defines!==void 0)for(const N in E.defines)b.push(N),b.push(E.defines[N]);return E.isRawShaderMaterial===!1&&(_(b,E),M(b,E),b.push(i.outputColorSpace)),b.push(E.customProgramCacheKey),b.join()}function _(E,b){E.push(b.precision),E.push(b.outputColorSpace),E.push(b.envMapMode),E.push(b.envMapCubeUVHeight),E.push(b.mapUv),E.push(b.alphaMapUv),E.push(b.lightMapUv),E.push(b.aoMapUv),E.push(b.bumpMapUv),E.push(b.normalMapUv),E.push(b.displacementMapUv),E.push(b.emissiveMapUv),E.push(b.metalnessMapUv),E.push(b.roughnessMapUv),E.push(b.anisotropyMapUv),E.push(b.clearcoatMapUv),E.push(b.clearcoatNormalMapUv),E.push(b.clearcoatRoughnessMapUv),E.push(b.iridescenceMapUv),E.push(b.iridescenceThicknessMapUv),E.push(b.sheenColorMapUv),E.push(b.sheenRoughnessMapUv),E.push(b.specularMapUv),E.push(b.specularColorMapUv),E.push(b.specularIntensityMapUv),E.push(b.transmissionMapUv),E.push(b.thicknessMapUv),E.push(b.combine),E.push(b.fogExp2),E.push(b.sizeAttenuation),E.push(b.morphTargetsCount),E.push(b.morphAttributeCount),E.push(b.numDirLights),E.push(b.numPointLights),E.push(b.numSpotLights),E.push(b.numSpotLightMaps),E.push(b.numHemiLights),E.push(b.numRectAreaLights),E.push(b.numDirLightShadows),E.push(b.numPointLightShadows),E.push(b.numSpotLightShadows),E.push(b.numSpotLightShadowsWithMaps),E.push(b.numLightProbes),E.push(b.shadowMapType),E.push(b.toneMapping),E.push(b.numClippingPlanes),E.push(b.numClipIntersection),E.push(b.depthPacking)}function M(E,b){a.disableAll(),b.supportsVertexTextures&&a.enable(0),b.instancing&&a.enable(1),b.instancingColor&&a.enable(2),b.instancingMorph&&a.enable(3),b.matcap&&a.enable(4),b.envMap&&a.enable(5),b.normalMapObjectSpace&&a.enable(6),b.normalMapTangentSpace&&a.enable(7),b.clearcoat&&a.enable(8),b.iridescence&&a.enable(9),b.alphaTest&&a.enable(10),b.vertexColors&&a.enable(11),b.vertexAlphas&&a.enable(12),b.vertexUv1s&&a.enable(13),b.vertexUv2s&&a.enable(14),b.vertexUv3s&&a.enable(15),b.vertexTangents&&a.enable(16),b.anisotropy&&a.enable(17),b.alphaHash&&a.enable(18),b.batching&&a.enable(19),b.dispersion&&a.enable(20),b.batchingColor&&a.enable(21),E.push(a.mask),a.disableAll(),b.fog&&a.enable(0),b.useFog&&a.enable(1),b.flatShading&&a.enable(2),b.logarithmicDepthBuffer&&a.enable(3),b.reverseDepthBuffer&&a.enable(4),b.skinning&&a.enable(5),b.morphTargets&&a.enable(6),b.morphNormals&&a.enable(7),b.morphColors&&a.enable(8),b.premultipliedAlpha&&a.enable(9),b.shadowMapEnabled&&a.enable(10),b.doubleSided&&a.enable(11),b.flipSided&&a.enable(12),b.useDepthPacking&&a.enable(13),b.dithering&&a.enable(14),b.transmission&&a.enable(15),b.sheen&&a.enable(16),b.opaque&&a.enable(17),b.pointsUvs&&a.enable(18),b.decodeVideoTexture&&a.enable(19),b.decodeVideoTextureEmissive&&a.enable(20),b.alphaToCoverage&&a.enable(21),E.push(a.mask)}function S(E){const b=x[E.type];let N;if(b){const X=ui[b];N=tl.clone(X.uniforms)}else N=E.uniforms;return N}function C(E,b){let N;for(let X=0,W=h.length;X<W;X++){const Y=h[X];if(Y.cacheKey===b){N=Y,++N.usedTimes;break}}return N===void 0&&(N=new v_(i,b,E,r),h.push(N)),N}function y(E){if(--E.usedTimes===0){const b=h.indexOf(E);h[b]=h[h.length-1],h.pop(),E.destroy()}}function w(E){l.remove(E)}function L(){l.dispose()}return{getParameters:m,getProgramCacheKey:g,getUniforms:S,acquireProgram:C,releaseProgram:y,releaseShaderCache:w,programs:h,dispose:L}}function y_(){let i=new WeakMap;function t(o){return i.has(o)}function e(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function E_(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.z!==t.z?i.z-t.z:i.id-t.id}function Sf(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function yf(){const i=[];let t=0;const e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function o(f,u,p,x,v,m){let g=i[t];return g===void 0?(g={id:f.id,object:f,geometry:u,material:p,groupOrder:x,renderOrder:f.renderOrder,z:v,group:m},i[t]=g):(g.id=f.id,g.object=f,g.geometry=u,g.material=p,g.groupOrder=x,g.renderOrder=f.renderOrder,g.z=v,g.group=m),t++,g}function a(f,u,p,x,v,m){const g=o(f,u,p,x,v,m);p.transmission>0?n.push(g):p.transparent===!0?s.push(g):e.push(g)}function l(f,u,p,x,v,m){const g=o(f,u,p,x,v,m);p.transmission>0?n.unshift(g):p.transparent===!0?s.unshift(g):e.unshift(g)}function c(f,u){e.length>1&&e.sort(f||E_),n.length>1&&n.sort(u||Sf),s.length>1&&s.sort(u||Sf)}function h(){for(let f=t,u=i.length;f<u;f++){const p=i[f];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:a,unshift:l,finish:h,sort:c}}function b_(){let i=new WeakMap;function t(n,s){const r=i.get(n);let o;return r===void 0?(o=new yf,i.set(n,[o])):s>=r.length?(o=new yf,r.push(o)):o=r[s],o}function e(){i=new WeakMap}return{get:t,dispose:e}}function T_(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new O,color:new se};break;case"SpotLight":e={position:new O,direction:new O,color:new se,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new O,color:new se,distance:0,decay:0};break;case"HemisphereLight":e={direction:new O,skyColor:new se,groundColor:new se};break;case"RectAreaLight":e={color:new se,position:new O,halfWidth:new O,halfHeight:new O};break}return i[t.id]=e,e}}}function A_(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new zt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new zt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new zt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}let w_=0;function R_(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function C_(i){const t=new T_,e=A_(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new O);const s=new O,r=new ge,o=new ge;function a(c){let h=0,f=0,u=0;for(let E=0;E<9;E++)n.probe[E].set(0,0,0);let p=0,x=0,v=0,m=0,g=0,_=0,M=0,S=0,C=0,y=0,w=0;c.sort(R_);for(let E=0,b=c.length;E<b;E++){const N=c[E],X=N.color,W=N.intensity,Y=N.distance,nt=N.shadow&&N.shadow.map?N.shadow.map.texture:null;if(N.isAmbientLight)h+=X.r*W,f+=X.g*W,u+=X.b*W;else if(N.isLightProbe){for(let $=0;$<9;$++)n.probe[$].addScaledVector(N.sh.coefficients[$],W);w++}else if(N.isDirectionalLight){const $=t.get(N);if($.color.copy(N.color).multiplyScalar(N.intensity),N.castShadow){const it=N.shadow,G=e.get(N);G.shadowIntensity=it.intensity,G.shadowBias=it.bias,G.shadowNormalBias=it.normalBias,G.shadowRadius=it.radius,G.shadowMapSize=it.mapSize,n.directionalShadow[p]=G,n.directionalShadowMap[p]=nt,n.directionalShadowMatrix[p]=N.shadow.matrix,_++}n.directional[p]=$,p++}else if(N.isSpotLight){const $=t.get(N);$.position.setFromMatrixPosition(N.matrixWorld),$.color.copy(X).multiplyScalar(W),$.distance=Y,$.coneCos=Math.cos(N.angle),$.penumbraCos=Math.cos(N.angle*(1-N.penumbra)),$.decay=N.decay,n.spot[v]=$;const it=N.shadow;if(N.map&&(n.spotLightMap[C]=N.map,C++,it.updateMatrices(N),N.castShadow&&y++),n.spotLightMatrix[v]=it.matrix,N.castShadow){const G=e.get(N);G.shadowIntensity=it.intensity,G.shadowBias=it.bias,G.shadowNormalBias=it.normalBias,G.shadowRadius=it.radius,G.shadowMapSize=it.mapSize,n.spotShadow[v]=G,n.spotShadowMap[v]=nt,S++}v++}else if(N.isRectAreaLight){const $=t.get(N);$.color.copy(X).multiplyScalar(W),$.halfWidth.set(N.width*.5,0,0),$.halfHeight.set(0,N.height*.5,0),n.rectArea[m]=$,m++}else if(N.isPointLight){const $=t.get(N);if($.color.copy(N.color).multiplyScalar(N.intensity),$.distance=N.distance,$.decay=N.decay,N.castShadow){const it=N.shadow,G=e.get(N);G.shadowIntensity=it.intensity,G.shadowBias=it.bias,G.shadowNormalBias=it.normalBias,G.shadowRadius=it.radius,G.shadowMapSize=it.mapSize,G.shadowCameraNear=it.camera.near,G.shadowCameraFar=it.camera.far,n.pointShadow[x]=G,n.pointShadowMap[x]=nt,n.pointShadowMatrix[x]=N.shadow.matrix,M++}n.point[x]=$,x++}else if(N.isHemisphereLight){const $=t.get(N);$.skyColor.copy(N.color).multiplyScalar(W),$.groundColor.copy(N.groundColor).multiplyScalar(W),n.hemi[g]=$,g++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ht.LTC_FLOAT_1,n.rectAreaLTC2=ht.LTC_FLOAT_2):(n.rectAreaLTC1=ht.LTC_HALF_1,n.rectAreaLTC2=ht.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=f,n.ambient[2]=u;const L=n.hash;(L.directionalLength!==p||L.pointLength!==x||L.spotLength!==v||L.rectAreaLength!==m||L.hemiLength!==g||L.numDirectionalShadows!==_||L.numPointShadows!==M||L.numSpotShadows!==S||L.numSpotMaps!==C||L.numLightProbes!==w)&&(n.directional.length=p,n.spot.length=v,n.rectArea.length=m,n.point.length=x,n.hemi.length=g,n.directionalShadow.length=_,n.directionalShadowMap.length=_,n.pointShadow.length=M,n.pointShadowMap.length=M,n.spotShadow.length=S,n.spotShadowMap.length=S,n.directionalShadowMatrix.length=_,n.pointShadowMatrix.length=M,n.spotLightMatrix.length=S+C-y,n.spotLightMap.length=C,n.numSpotLightShadowsWithMaps=y,n.numLightProbes=w,L.directionalLength=p,L.pointLength=x,L.spotLength=v,L.rectAreaLength=m,L.hemiLength=g,L.numDirectionalShadows=_,L.numPointShadows=M,L.numSpotShadows=S,L.numSpotMaps=C,L.numLightProbes=w,n.version=w_++)}function l(c,h){let f=0,u=0,p=0,x=0,v=0;const m=h.matrixWorldInverse;for(let g=0,_=c.length;g<_;g++){const M=c[g];if(M.isDirectionalLight){const S=n.directional[f];S.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(m),f++}else if(M.isSpotLight){const S=n.spot[p];S.position.setFromMatrixPosition(M.matrixWorld),S.position.applyMatrix4(m),S.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(m),p++}else if(M.isRectAreaLight){const S=n.rectArea[x];S.position.setFromMatrixPosition(M.matrixWorld),S.position.applyMatrix4(m),o.identity(),r.copy(M.matrixWorld),r.premultiply(m),o.extractRotation(r),S.halfWidth.set(M.width*.5,0,0),S.halfHeight.set(0,M.height*.5,0),S.halfWidth.applyMatrix4(o),S.halfHeight.applyMatrix4(o),x++}else if(M.isPointLight){const S=n.point[u];S.position.setFromMatrixPosition(M.matrixWorld),S.position.applyMatrix4(m),u++}else if(M.isHemisphereLight){const S=n.hemi[v];S.direction.setFromMatrixPosition(M.matrixWorld),S.direction.transformDirection(m),v++}}}return{setup:a,setupView:l,state:n}}function Ef(i){const t=new C_(i),e=[],n=[];function s(h){c.camera=h,e.length=0,n.length=0}function r(h){e.push(h)}function o(h){n.push(h)}function a(){t.setup(e)}function l(h){t.setupView(e,h)}const c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function L_(i){let t=new WeakMap;function e(s,r=0){const o=t.get(s);let a;return o===void 0?(a=new Ef(i),t.set(s,[a])):r>=o.length?(a=new Ef(i),o.push(a)):a=o[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}class D_ extends Hs{static get type(){return"MeshDepthMaterial"}constructor(t){super(),this.isMeshDepthMaterial=!0,this.depthPacking=wm,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class P_ extends Hs{static get type(){return"MeshDistanceMaterial"}constructor(t){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const N_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,I_=`uniform sampler2D shadow_pass;
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
}`;function O_(i,t,e){let n=new hp;const s=new zt,r=new zt,o=new ze,a=new D_({depthPacking:Rm}),l=new P_,c={},h=e.maxTextureSize,f={[Oi]:pn,[pn]:Oi,[Mn]:Mn},u=new Ve({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new zt},radius:{value:4}},vertexShader:N_,fragmentShader:I_}),p=u.clone();p.defines.HORIZONTAL_PASS=1;const x=new ke;x.setAttribute("position",new we(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new Re(x,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Wd;let g=this.type;this.render=function(y,w,L){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||y.length===0)return;const E=i.getRenderTarget(),b=i.getActiveCubeFace(),N=i.getActiveMipmapLevel(),X=i.state;X.setBlending(Di),X.buffers.color.setClear(1,1,1,1),X.buffers.depth.setTest(!0),X.setScissorTest(!1);const W=g!==Ri&&this.type===Ri,Y=g===Ri&&this.type!==Ri;for(let nt=0,$=y.length;nt<$;nt++){const it=y[nt],G=it.shadow;if(G===void 0){console.warn("THREE.WebGLShadowMap:",it,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;s.copy(G.mapSize);const st=G.getFrameExtents();if(s.multiply(st),r.copy(G.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/st.x),s.x=r.x*st.x,G.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/st.y),s.y=r.y*st.y,G.mapSize.y=r.y)),G.map===null||W===!0||Y===!0){const Dt=this.type!==Ri?{minFilter:nn,magFilter:nn}:{};G.map!==null&&G.map.dispose(),G.map=new Nn(s.x,s.y,Dt),G.map.texture.name=it.name+".shadowMap",G.camera.updateProjectionMatrix()}i.setRenderTarget(G.map),i.clear();const xt=G.getViewportCount();for(let Dt=0;Dt<xt;Dt++){const $t=G.getViewport(Dt);o.set(r.x*$t.x,r.y*$t.y,r.x*$t.z,r.y*$t.w),X.viewport(o),G.updateMatrices(it,Dt),n=G.getFrustum(),S(w,L,G.camera,it,this.type)}G.isPointLightShadow!==!0&&this.type===Ri&&_(G,L),G.needsUpdate=!1}g=this.type,m.needsUpdate=!1,i.setRenderTarget(E,b,N)};function _(y,w){const L=t.update(v);u.defines.VSM_SAMPLES!==y.blurSamples&&(u.defines.VSM_SAMPLES=y.blurSamples,p.defines.VSM_SAMPLES=y.blurSamples,u.needsUpdate=!0,p.needsUpdate=!0),y.mapPass===null&&(y.mapPass=new Nn(s.x,s.y)),u.uniforms.shadow_pass.value=y.map.texture,u.uniforms.resolution.value=y.mapSize,u.uniforms.radius.value=y.radius,i.setRenderTarget(y.mapPass),i.clear(),i.renderBufferDirect(w,null,L,u,v,null),p.uniforms.shadow_pass.value=y.mapPass.texture,p.uniforms.resolution.value=y.mapSize,p.uniforms.radius.value=y.radius,i.setRenderTarget(y.map),i.clear(),i.renderBufferDirect(w,null,L,p,v,null)}function M(y,w,L,E){let b=null;const N=L.isPointLight===!0?y.customDistanceMaterial:y.customDepthMaterial;if(N!==void 0)b=N;else if(b=L.isPointLight===!0?l:a,i.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0){const X=b.uuid,W=w.uuid;let Y=c[X];Y===void 0&&(Y={},c[X]=Y);let nt=Y[W];nt===void 0&&(nt=b.clone(),Y[W]=nt,w.addEventListener("dispose",C)),b=nt}if(b.visible=w.visible,b.wireframe=w.wireframe,E===Ri?b.side=w.shadowSide!==null?w.shadowSide:w.side:b.side=w.shadowSide!==null?w.shadowSide:f[w.side],b.alphaMap=w.alphaMap,b.alphaTest=w.alphaTest,b.map=w.map,b.clipShadows=w.clipShadows,b.clippingPlanes=w.clippingPlanes,b.clipIntersection=w.clipIntersection,b.displacementMap=w.displacementMap,b.displacementScale=w.displacementScale,b.displacementBias=w.displacementBias,b.wireframeLinewidth=w.wireframeLinewidth,b.linewidth=w.linewidth,L.isPointLight===!0&&b.isMeshDistanceMaterial===!0){const X=i.properties.get(b);X.light=L}return b}function S(y,w,L,E,b){if(y.visible===!1)return;if(y.layers.test(w.layers)&&(y.isMesh||y.isLine||y.isPoints)&&(y.castShadow||y.receiveShadow&&b===Ri)&&(!y.frustumCulled||n.intersectsObject(y))){y.modelViewMatrix.multiplyMatrices(L.matrixWorldInverse,y.matrixWorld);const W=t.update(y),Y=y.material;if(Array.isArray(Y)){const nt=W.groups;for(let $=0,it=nt.length;$<it;$++){const G=nt[$],st=Y[G.materialIndex];if(st&&st.visible){const xt=M(y,st,E,b);y.onBeforeShadow(i,y,w,L,W,xt,G),i.renderBufferDirect(L,null,W,xt,y,G),y.onAfterShadow(i,y,w,L,W,xt,G)}}}else if(Y.visible){const nt=M(y,Y,E,b);y.onBeforeShadow(i,y,w,L,W,nt,null),i.renderBufferDirect(L,null,W,nt,y,null),y.onAfterShadow(i,y,w,L,W,nt,null)}}const X=y.children;for(let W=0,Y=X.length;W<Y;W++)S(X[W],w,L,E,b)}function C(y){y.target.removeEventListener("dispose",C);for(const L in c){const E=c[L],b=y.target.uuid;b in E&&(E[b].dispose(),delete E[b])}}}const k_={[Oc]:kc,[Uc]:Bc,[zc]:Hc,[Tr]:Fc,[kc]:Oc,[Bc]:Uc,[Hc]:zc,[Fc]:Tr};function U_(i,t){function e(){let k=!1;const dt=new ze;let K=null;const tt=new ze(0,0,0,0);return{setMask:function(_t){K!==_t&&!k&&(i.colorMask(_t,_t,_t,_t),K=_t)},setLocked:function(_t){k=_t},setClear:function(_t,mt,qt,Ne,je){je===!0&&(_t*=Ne,mt*=Ne,qt*=Ne),dt.set(_t,mt,qt,Ne),tt.equals(dt)===!1&&(i.clearColor(_t,mt,qt,Ne),tt.copy(dt))},reset:function(){k=!1,K=null,tt.set(-1,0,0,0)}}}function n(){let k=!1,dt=!1,K=null,tt=null,_t=null;return{setReversed:function(mt){if(dt!==mt){const qt=t.get("EXT_clip_control");dt?qt.clipControlEXT(qt.LOWER_LEFT_EXT,qt.ZERO_TO_ONE_EXT):qt.clipControlEXT(qt.LOWER_LEFT_EXT,qt.NEGATIVE_ONE_TO_ONE_EXT);const Ne=_t;_t=null,this.setClear(Ne)}dt=mt},getReversed:function(){return dt},setTest:function(mt){mt?lt(i.DEPTH_TEST):Ot(i.DEPTH_TEST)},setMask:function(mt){K!==mt&&!k&&(i.depthMask(mt),K=mt)},setFunc:function(mt){if(dt&&(mt=k_[mt]),tt!==mt){switch(mt){case Oc:i.depthFunc(i.NEVER);break;case kc:i.depthFunc(i.ALWAYS);break;case Uc:i.depthFunc(i.LESS);break;case Tr:i.depthFunc(i.LEQUAL);break;case zc:i.depthFunc(i.EQUAL);break;case Fc:i.depthFunc(i.GEQUAL);break;case Bc:i.depthFunc(i.GREATER);break;case Hc:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}tt=mt}},setLocked:function(mt){k=mt},setClear:function(mt){_t!==mt&&(dt&&(mt=1-mt),i.clearDepth(mt),_t=mt)},reset:function(){k=!1,K=null,tt=null,_t=null,dt=!1}}}function s(){let k=!1,dt=null,K=null,tt=null,_t=null,mt=null,qt=null,Ne=null,je=null;return{setTest:function(me){k||(me?lt(i.STENCIL_TEST):Ot(i.STENCIL_TEST))},setMask:function(me){dt!==me&&!k&&(i.stencilMask(me),dt=me)},setFunc:function(me,$n,_i){(K!==me||tt!==$n||_t!==_i)&&(i.stencilFunc(me,$n,_i),K=me,tt=$n,_t=_i)},setOp:function(me,$n,_i){(mt!==me||qt!==$n||Ne!==_i)&&(i.stencilOp(me,$n,_i),mt=me,qt=$n,Ne=_i)},setLocked:function(me){k=me},setClear:function(me){je!==me&&(i.clearStencil(me),je=me)},reset:function(){k=!1,dt=null,K=null,tt=null,_t=null,mt=null,qt=null,Ne=null,je=null}}}const r=new e,o=new n,a=new s,l=new WeakMap,c=new WeakMap;let h={},f={},u=new WeakMap,p=[],x=null,v=!1,m=null,g=null,_=null,M=null,S=null,C=null,y=null,w=new se(0,0,0),L=0,E=!1,b=null,N=null,X=null,W=null,Y=null;const nt=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let $=!1,it=0;const G=i.getParameter(i.VERSION);G.indexOf("WebGL")!==-1?(it=parseFloat(/^WebGL (\d)/.exec(G)[1]),$=it>=1):G.indexOf("OpenGL ES")!==-1&&(it=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),$=it>=2);let st=null,xt={};const Dt=i.getParameter(i.SCISSOR_BOX),$t=i.getParameter(i.VIEWPORT),fe=new ze().fromArray(Dt),j=new ze().fromArray($t);function rt(k,dt,K,tt){const _t=new Uint8Array(4),mt=i.createTexture();i.bindTexture(k,mt),i.texParameteri(k,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(k,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let qt=0;qt<K;qt++)k===i.TEXTURE_3D||k===i.TEXTURE_2D_ARRAY?i.texImage3D(dt,0,i.RGBA,1,1,tt,0,i.RGBA,i.UNSIGNED_BYTE,_t):i.texImage2D(dt+qt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,_t);return mt}const wt={};wt[i.TEXTURE_2D]=rt(i.TEXTURE_2D,i.TEXTURE_2D,1),wt[i.TEXTURE_CUBE_MAP]=rt(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),wt[i.TEXTURE_2D_ARRAY]=rt(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),wt[i.TEXTURE_3D]=rt(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),lt(i.DEPTH_TEST),o.setFunc(Tr),Qt(!1),re(Ru),lt(i.CULL_FACE),z(Di);function lt(k){h[k]!==!0&&(i.enable(k),h[k]=!0)}function Ot(k){h[k]!==!1&&(i.disable(k),h[k]=!1)}function Ht(k,dt){return f[k]!==dt?(i.bindFramebuffer(k,dt),f[k]=dt,k===i.DRAW_FRAMEBUFFER&&(f[i.FRAMEBUFFER]=dt),k===i.FRAMEBUFFER&&(f[i.DRAW_FRAMEBUFFER]=dt),!0):!1}function Kt(k,dt){let K=p,tt=!1;if(k){K=u.get(dt),K===void 0&&(K=[],u.set(dt,K));const _t=k.textures;if(K.length!==_t.length||K[0]!==i.COLOR_ATTACHMENT0){for(let mt=0,qt=_t.length;mt<qt;mt++)K[mt]=i.COLOR_ATTACHMENT0+mt;K.length=_t.length,tt=!0}}else K[0]!==i.BACK&&(K[0]=i.BACK,tt=!0);tt&&i.drawBuffers(K)}function ve(k){return x!==k?(i.useProgram(k),x=k,!0):!1}const ne={[Rs]:i.FUNC_ADD,[tm]:i.FUNC_SUBTRACT,[em]:i.FUNC_REVERSE_SUBTRACT};ne[nm]=i.MIN,ne[im]=i.MAX;const Ce={[sm]:i.ZERO,[rm]:i.ONE,[om]:i.SRC_COLOR,[Nc]:i.SRC_ALPHA,[fm]:i.SRC_ALPHA_SATURATE,[hm]:i.DST_COLOR,[lm]:i.DST_ALPHA,[am]:i.ONE_MINUS_SRC_COLOR,[Ic]:i.ONE_MINUS_SRC_ALPHA,[um]:i.ONE_MINUS_DST_COLOR,[cm]:i.ONE_MINUS_DST_ALPHA,[dm]:i.CONSTANT_COLOR,[pm]:i.ONE_MINUS_CONSTANT_COLOR,[mm]:i.CONSTANT_ALPHA,[gm]:i.ONE_MINUS_CONSTANT_ALPHA};function z(k,dt,K,tt,_t,mt,qt,Ne,je,me){if(k===Di){v===!0&&(Ot(i.BLEND),v=!1);return}if(v===!1&&(lt(i.BLEND),v=!0),k!==Q0){if(k!==m||me!==E){if((g!==Rs||S!==Rs)&&(i.blendEquation(i.FUNC_ADD),g=Rs,S=Rs),me)switch(k){case _r:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Pc:i.blendFunc(i.ONE,i.ONE);break;case Cu:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Lu:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",k);break}else switch(k){case _r:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Pc:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case Cu:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Lu:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",k);break}_=null,M=null,C=null,y=null,w.set(0,0,0),L=0,m=k,E=me}return}_t=_t||dt,mt=mt||K,qt=qt||tt,(dt!==g||_t!==S)&&(i.blendEquationSeparate(ne[dt],ne[_t]),g=dt,S=_t),(K!==_||tt!==M||mt!==C||qt!==y)&&(i.blendFuncSeparate(Ce[K],Ce[tt],Ce[mt],Ce[qt]),_=K,M=tt,C=mt,y=qt),(Ne.equals(w)===!1||je!==L)&&(i.blendColor(Ne.r,Ne.g,Ne.b,je),w.copy(Ne),L=je),m=k,E=!1}function on(k,dt){k.side===Mn?Ot(i.CULL_FACE):lt(i.CULL_FACE);let K=k.side===pn;dt&&(K=!K),Qt(K),k.blending===_r&&k.transparent===!1?z(Di):z(k.blending,k.blendEquation,k.blendSrc,k.blendDst,k.blendEquationAlpha,k.blendSrcAlpha,k.blendDstAlpha,k.blendColor,k.blendAlpha,k.premultipliedAlpha),o.setFunc(k.depthFunc),o.setTest(k.depthTest),o.setMask(k.depthWrite),r.setMask(k.colorWrite);const tt=k.stencilWrite;a.setTest(tt),tt&&(a.setMask(k.stencilWriteMask),a.setFunc(k.stencilFunc,k.stencilRef,k.stencilFuncMask),a.setOp(k.stencilFail,k.stencilZFail,k.stencilZPass)),be(k.polygonOffset,k.polygonOffsetFactor,k.polygonOffsetUnits),k.alphaToCoverage===!0?lt(i.SAMPLE_ALPHA_TO_COVERAGE):Ot(i.SAMPLE_ALPHA_TO_COVERAGE)}function Qt(k){b!==k&&(k?i.frontFace(i.CW):i.frontFace(i.CCW),b=k)}function re(k){k!==j0?(lt(i.CULL_FACE),k!==N&&(k===Ru?i.cullFace(i.BACK):k===Z0?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Ot(i.CULL_FACE),N=k}function Ut(k){k!==X&&($&&i.lineWidth(k),X=k)}function be(k,dt,K){k?(lt(i.POLYGON_OFFSET_FILL),(W!==dt||Y!==K)&&(i.polygonOffset(dt,K),W=dt,Y=K)):Ot(i.POLYGON_OFFSET_FILL)}function kt(k){k?lt(i.SCISSOR_TEST):Ot(i.SCISSOR_TEST)}function R(k){k===void 0&&(k=i.TEXTURE0+nt-1),st!==k&&(i.activeTexture(k),st=k)}function T(k,dt,K){K===void 0&&(st===null?K=i.TEXTURE0+nt-1:K=st);let tt=xt[K];tt===void 0&&(tt={type:void 0,texture:void 0},xt[K]=tt),(tt.type!==k||tt.texture!==dt)&&(st!==K&&(i.activeTexture(K),st=K),i.bindTexture(k,dt||wt[k]),tt.type=k,tt.texture=dt)}function B(){const k=xt[st];k!==void 0&&k.type!==void 0&&(i.bindTexture(k.type,null),k.type=void 0,k.texture=void 0)}function Q(){try{i.compressedTexImage2D.apply(i,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function et(){try{i.compressedTexImage3D.apply(i,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function Z(){try{i.texSubImage2D.apply(i,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function Pt(){try{i.texSubImage3D.apply(i,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function pt(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function bt(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function ae(){try{i.texStorage2D.apply(i,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function ot(){try{i.texStorage3D.apply(i,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function Tt(){try{i.texImage2D.apply(i,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function Ft(){try{i.texImage3D.apply(i,arguments)}catch(k){console.error("THREE.WebGLState:",k)}}function Vt(k){fe.equals(k)===!1&&(i.scissor(k.x,k.y,k.z,k.w),fe.copy(k))}function At(k){j.equals(k)===!1&&(i.viewport(k.x,k.y,k.z,k.w),j.copy(k))}function oe(k,dt){let K=c.get(dt);K===void 0&&(K=new WeakMap,c.set(dt,K));let tt=K.get(k);tt===void 0&&(tt=i.getUniformBlockIndex(dt,k.name),K.set(k,tt))}function Zt(k,dt){const tt=c.get(dt).get(k);l.get(dt)!==tt&&(i.uniformBlockBinding(dt,tt,k.__bindingPointIndex),l.set(dt,tt))}function ye(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),h={},st=null,xt={},f={},u=new WeakMap,p=[],x=null,v=!1,m=null,g=null,_=null,M=null,S=null,C=null,y=null,w=new se(0,0,0),L=0,E=!1,b=null,N=null,X=null,W=null,Y=null,fe.set(0,0,i.canvas.width,i.canvas.height),j.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:lt,disable:Ot,bindFramebuffer:Ht,drawBuffers:Kt,useProgram:ve,setBlending:z,setMaterial:on,setFlipSided:Qt,setCullFace:re,setLineWidth:Ut,setPolygonOffset:be,setScissorTest:kt,activeTexture:R,bindTexture:T,unbindTexture:B,compressedTexImage2D:Q,compressedTexImage3D:et,texImage2D:Tt,texImage3D:Ft,updateUBOMapping:oe,uniformBlockBinding:Zt,texStorage2D:ae,texStorage3D:ot,texSubImage2D:Z,texSubImage3D:Pt,compressedTexSubImage2D:pt,compressedTexSubImage3D:bt,scissor:Vt,viewport:At,reset:ye}}function bf(i,t,e,n){const s=z_(n);switch(e){case Yd:return i*t;case Zd:return i*t;case Jd:return i*t*2;case Hh:return i*t/s.components*s.byteLength;case Vh:return i*t/s.components*s.byteLength;case Qd:return i*t*2/s.components*s.byteLength;case Wh:return i*t*2/s.components*s.byteLength;case jd:return i*t*3/s.components*s.byteLength;case Bn:return i*t*4/s.components*s.byteLength;case Gh:return i*t*4/s.components*s.byteLength;case Fa:case Ba:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Ha:case Va:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Xc:case qc:return Math.max(i,16)*Math.max(t,8)/4;case Kc:case $c:return Math.max(i,8)*Math.max(t,8)/2;case Yc:case jc:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Zc:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Jc:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Qc:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case th:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case eh:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case nh:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case ih:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case sh:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case rh:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case oh:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case ah:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case lh:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case ch:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case hh:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case uh:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case Wa:case fh:case dh:return Math.ceil(i/4)*Math.ceil(t/4)*16;case tp:case ph:return Math.ceil(i/4)*Math.ceil(t/4)*8;case mh:case gh:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function z_(i){switch(i){case ki:case Xd:return{byteLength:1,components:1};case Do:case $d:case vi:return{byteLength:2,components:1};case Fh:case Bh:return{byteLength:2,components:4};case ls:case zh:case pi:return{byteLength:4,components:1};case qd:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function F_(i,t,e,n,s,r,o){const a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new zt,h=new WeakMap;let f;const u=new WeakMap;let p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function x(R,T){return p?new OffscreenCanvas(R,T):Po("canvas")}function v(R,T,B){let Q=1;const et=kt(R);if((et.width>B||et.height>B)&&(Q=B/Math.max(et.width,et.height)),Q<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){const Z=Math.floor(Q*et.width),Pt=Math.floor(Q*et.height);f===void 0&&(f=x(Z,Pt));const pt=T?x(Z,Pt):f;return pt.width=Z,pt.height=Pt,pt.getContext("2d").drawImage(R,0,0,Z,Pt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+et.width+"x"+et.height+") to ("+Z+"x"+Pt+")."),pt}else return"data"in R&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+et.width+"x"+et.height+")."),R;return R}function m(R){return R.generateMipmaps}function g(R){i.generateMipmap(R)}function _(R){return R.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?i.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function M(R,T,B,Q,et=!1){if(R!==null){if(i[R]!==void 0)return i[R];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let Z=T;if(T===i.RED&&(B===i.FLOAT&&(Z=i.R32F),B===i.HALF_FLOAT&&(Z=i.R16F),B===i.UNSIGNED_BYTE&&(Z=i.R8)),T===i.RED_INTEGER&&(B===i.UNSIGNED_BYTE&&(Z=i.R8UI),B===i.UNSIGNED_SHORT&&(Z=i.R16UI),B===i.UNSIGNED_INT&&(Z=i.R32UI),B===i.BYTE&&(Z=i.R8I),B===i.SHORT&&(Z=i.R16I),B===i.INT&&(Z=i.R32I)),T===i.RG&&(B===i.FLOAT&&(Z=i.RG32F),B===i.HALF_FLOAT&&(Z=i.RG16F),B===i.UNSIGNED_BYTE&&(Z=i.RG8)),T===i.RG_INTEGER&&(B===i.UNSIGNED_BYTE&&(Z=i.RG8UI),B===i.UNSIGNED_SHORT&&(Z=i.RG16UI),B===i.UNSIGNED_INT&&(Z=i.RG32UI),B===i.BYTE&&(Z=i.RG8I),B===i.SHORT&&(Z=i.RG16I),B===i.INT&&(Z=i.RG32I)),T===i.RGB_INTEGER&&(B===i.UNSIGNED_BYTE&&(Z=i.RGB8UI),B===i.UNSIGNED_SHORT&&(Z=i.RGB16UI),B===i.UNSIGNED_INT&&(Z=i.RGB32UI),B===i.BYTE&&(Z=i.RGB8I),B===i.SHORT&&(Z=i.RGB16I),B===i.INT&&(Z=i.RGB32I)),T===i.RGBA_INTEGER&&(B===i.UNSIGNED_BYTE&&(Z=i.RGBA8UI),B===i.UNSIGNED_SHORT&&(Z=i.RGBA16UI),B===i.UNSIGNED_INT&&(Z=i.RGBA32UI),B===i.BYTE&&(Z=i.RGBA8I),B===i.SHORT&&(Z=i.RGBA16I),B===i.INT&&(Z=i.RGBA32I)),T===i.RGB&&B===i.UNSIGNED_INT_5_9_9_9_REV&&(Z=i.RGB9_E5),T===i.RGBA){const Pt=et?xl:ce.getTransfer(Q);B===i.FLOAT&&(Z=i.RGBA32F),B===i.HALF_FLOAT&&(Z=i.RGBA16F),B===i.UNSIGNED_BYTE&&(Z=Pt===xe?i.SRGB8_ALPHA8:i.RGBA8),B===i.UNSIGNED_SHORT_4_4_4_4&&(Z=i.RGBA4),B===i.UNSIGNED_SHORT_5_5_5_1&&(Z=i.RGB5_A1)}return(Z===i.R16F||Z===i.R32F||Z===i.RG16F||Z===i.RG32F||Z===i.RGBA16F||Z===i.RGBA32F)&&t.get("EXT_color_buffer_float"),Z}function S(R,T){let B;return R?T===null||T===ls||T===Rr?B=i.DEPTH24_STENCIL8:T===pi?B=i.DEPTH32F_STENCIL8:T===Do&&(B=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):T===null||T===ls||T===Rr?B=i.DEPTH_COMPONENT24:T===pi?B=i.DEPTH_COMPONENT32F:T===Do&&(B=i.DEPTH_COMPONENT16),B}function C(R,T){return m(R)===!0||R.isFramebufferTexture&&R.minFilter!==nn&&R.minFilter!==dn?Math.log2(Math.max(T.width,T.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?T.mipmaps.length:1}function y(R){const T=R.target;T.removeEventListener("dispose",y),L(T),T.isVideoTexture&&h.delete(T)}function w(R){const T=R.target;T.removeEventListener("dispose",w),b(T)}function L(R){const T=n.get(R);if(T.__webglInit===void 0)return;const B=R.source,Q=u.get(B);if(Q){const et=Q[T.__cacheKey];et.usedTimes--,et.usedTimes===0&&E(R),Object.keys(Q).length===0&&u.delete(B)}n.remove(R)}function E(R){const T=n.get(R);i.deleteTexture(T.__webglTexture);const B=R.source,Q=u.get(B);delete Q[T.__cacheKey],o.memory.textures--}function b(R){const T=n.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),n.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let Q=0;Q<6;Q++){if(Array.isArray(T.__webglFramebuffer[Q]))for(let et=0;et<T.__webglFramebuffer[Q].length;et++)i.deleteFramebuffer(T.__webglFramebuffer[Q][et]);else i.deleteFramebuffer(T.__webglFramebuffer[Q]);T.__webglDepthbuffer&&i.deleteRenderbuffer(T.__webglDepthbuffer[Q])}else{if(Array.isArray(T.__webglFramebuffer))for(let Q=0;Q<T.__webglFramebuffer.length;Q++)i.deleteFramebuffer(T.__webglFramebuffer[Q]);else i.deleteFramebuffer(T.__webglFramebuffer);if(T.__webglDepthbuffer&&i.deleteRenderbuffer(T.__webglDepthbuffer),T.__webglMultisampledFramebuffer&&i.deleteFramebuffer(T.__webglMultisampledFramebuffer),T.__webglColorRenderbuffer)for(let Q=0;Q<T.__webglColorRenderbuffer.length;Q++)T.__webglColorRenderbuffer[Q]&&i.deleteRenderbuffer(T.__webglColorRenderbuffer[Q]);T.__webglDepthRenderbuffer&&i.deleteRenderbuffer(T.__webglDepthRenderbuffer)}const B=R.textures;for(let Q=0,et=B.length;Q<et;Q++){const Z=n.get(B[Q]);Z.__webglTexture&&(i.deleteTexture(Z.__webglTexture),o.memory.textures--),n.remove(B[Q])}n.remove(R)}let N=0;function X(){N=0}function W(){const R=N;return R>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+s.maxTextures),N+=1,R}function Y(R){const T=[];return T.push(R.wrapS),T.push(R.wrapT),T.push(R.wrapR||0),T.push(R.magFilter),T.push(R.minFilter),T.push(R.anisotropy),T.push(R.internalFormat),T.push(R.format),T.push(R.type),T.push(R.generateMipmaps),T.push(R.premultiplyAlpha),T.push(R.flipY),T.push(R.unpackAlignment),T.push(R.colorSpace),T.join()}function nt(R,T){const B=n.get(R);if(R.isVideoTexture&&Ut(R),R.isRenderTargetTexture===!1&&R.version>0&&B.__version!==R.version){const Q=R.image;if(Q===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Q.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{j(B,R,T);return}}e.bindTexture(i.TEXTURE_2D,B.__webglTexture,i.TEXTURE0+T)}function $(R,T){const B=n.get(R);if(R.version>0&&B.__version!==R.version){j(B,R,T);return}e.bindTexture(i.TEXTURE_2D_ARRAY,B.__webglTexture,i.TEXTURE0+T)}function it(R,T){const B=n.get(R);if(R.version>0&&B.__version!==R.version){j(B,R,T);return}e.bindTexture(i.TEXTURE_3D,B.__webglTexture,i.TEXTURE0+T)}function G(R,T){const B=n.get(R);if(R.version>0&&B.__version!==R.version){rt(B,R,T);return}e.bindTexture(i.TEXTURE_CUBE_MAP,B.__webglTexture,i.TEXTURE0+T)}const st={[Ja]:i.REPEAT,[Ds]:i.CLAMP_TO_EDGE,[Gc]:i.MIRRORED_REPEAT},xt={[nn]:i.NEAREST,[Am]:i.NEAREST_MIPMAP_NEAREST,[Qo]:i.NEAREST_MIPMAP_LINEAR,[dn]:i.LINEAR,[Ul]:i.LINEAR_MIPMAP_NEAREST,[di]:i.LINEAR_MIPMAP_LINEAR},Dt={[Dm]:i.NEVER,[Um]:i.ALWAYS,[Pm]:i.LESS,[ep]:i.LEQUAL,[Nm]:i.EQUAL,[km]:i.GEQUAL,[Im]:i.GREATER,[Om]:i.NOTEQUAL};function $t(R,T){if(T.type===pi&&t.has("OES_texture_float_linear")===!1&&(T.magFilter===dn||T.magFilter===Ul||T.magFilter===Qo||T.magFilter===di||T.minFilter===dn||T.minFilter===Ul||T.minFilter===Qo||T.minFilter===di)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(R,i.TEXTURE_WRAP_S,st[T.wrapS]),i.texParameteri(R,i.TEXTURE_WRAP_T,st[T.wrapT]),(R===i.TEXTURE_3D||R===i.TEXTURE_2D_ARRAY)&&i.texParameteri(R,i.TEXTURE_WRAP_R,st[T.wrapR]),i.texParameteri(R,i.TEXTURE_MAG_FILTER,xt[T.magFilter]),i.texParameteri(R,i.TEXTURE_MIN_FILTER,xt[T.minFilter]),T.compareFunction&&(i.texParameteri(R,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(R,i.TEXTURE_COMPARE_FUNC,Dt[T.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(T.magFilter===nn||T.minFilter!==Qo&&T.minFilter!==di||T.type===pi&&t.has("OES_texture_float_linear")===!1)return;if(T.anisotropy>1||n.get(T).__currentAnisotropy){const B=t.get("EXT_texture_filter_anisotropic");i.texParameterf(R,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(T.anisotropy,s.getMaxAnisotropy())),n.get(T).__currentAnisotropy=T.anisotropy}}}function fe(R,T){let B=!1;R.__webglInit===void 0&&(R.__webglInit=!0,T.addEventListener("dispose",y));const Q=T.source;let et=u.get(Q);et===void 0&&(et={},u.set(Q,et));const Z=Y(T);if(Z!==R.__cacheKey){et[Z]===void 0&&(et[Z]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,B=!0),et[Z].usedTimes++;const Pt=et[R.__cacheKey];Pt!==void 0&&(et[R.__cacheKey].usedTimes--,Pt.usedTimes===0&&E(T)),R.__cacheKey=Z,R.__webglTexture=et[Z].texture}return B}function j(R,T,B){let Q=i.TEXTURE_2D;(T.isDataArrayTexture||T.isCompressedArrayTexture)&&(Q=i.TEXTURE_2D_ARRAY),T.isData3DTexture&&(Q=i.TEXTURE_3D);const et=fe(R,T),Z=T.source;e.bindTexture(Q,R.__webglTexture,i.TEXTURE0+B);const Pt=n.get(Z);if(Z.version!==Pt.__version||et===!0){e.activeTexture(i.TEXTURE0+B);const pt=ce.getPrimaries(ce.workingColorSpace),bt=T.colorSpace===Ji?null:ce.getPrimaries(T.colorSpace),ae=T.colorSpace===Ji||pt===bt?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,T.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,T.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ae);let ot=v(T.image,!1,s.maxTextureSize);ot=be(T,ot);const Tt=r.convert(T.format,T.colorSpace),Ft=r.convert(T.type);let Vt=M(T.internalFormat,Tt,Ft,T.colorSpace,T.isVideoTexture);$t(Q,T);let At;const oe=T.mipmaps,Zt=T.isVideoTexture!==!0,ye=Pt.__version===void 0||et===!0,k=Z.dataReady,dt=C(T,ot);if(T.isDepthTexture)Vt=S(T.format===Cr,T.type),ye&&(Zt?e.texStorage2D(i.TEXTURE_2D,1,Vt,ot.width,ot.height):e.texImage2D(i.TEXTURE_2D,0,Vt,ot.width,ot.height,0,Tt,Ft,null));else if(T.isDataTexture)if(oe.length>0){Zt&&ye&&e.texStorage2D(i.TEXTURE_2D,dt,Vt,oe[0].width,oe[0].height);for(let K=0,tt=oe.length;K<tt;K++)At=oe[K],Zt?k&&e.texSubImage2D(i.TEXTURE_2D,K,0,0,At.width,At.height,Tt,Ft,At.data):e.texImage2D(i.TEXTURE_2D,K,Vt,At.width,At.height,0,Tt,Ft,At.data);T.generateMipmaps=!1}else Zt?(ye&&e.texStorage2D(i.TEXTURE_2D,dt,Vt,ot.width,ot.height),k&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,ot.width,ot.height,Tt,Ft,ot.data)):e.texImage2D(i.TEXTURE_2D,0,Vt,ot.width,ot.height,0,Tt,Ft,ot.data);else if(T.isCompressedTexture)if(T.isCompressedArrayTexture){Zt&&ye&&e.texStorage3D(i.TEXTURE_2D_ARRAY,dt,Vt,oe[0].width,oe[0].height,ot.depth);for(let K=0,tt=oe.length;K<tt;K++)if(At=oe[K],T.format!==Bn)if(Tt!==null)if(Zt){if(k)if(T.layerUpdates.size>0){const _t=bf(At.width,At.height,T.format,T.type);for(const mt of T.layerUpdates){const qt=At.data.subarray(mt*_t/At.data.BYTES_PER_ELEMENT,(mt+1)*_t/At.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,K,0,0,mt,At.width,At.height,1,Tt,qt)}T.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,K,0,0,0,At.width,At.height,ot.depth,Tt,At.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,K,Vt,At.width,At.height,ot.depth,0,At.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Zt?k&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,K,0,0,0,At.width,At.height,ot.depth,Tt,Ft,At.data):e.texImage3D(i.TEXTURE_2D_ARRAY,K,Vt,At.width,At.height,ot.depth,0,Tt,Ft,At.data)}else{Zt&&ye&&e.texStorage2D(i.TEXTURE_2D,dt,Vt,oe[0].width,oe[0].height);for(let K=0,tt=oe.length;K<tt;K++)At=oe[K],T.format!==Bn?Tt!==null?Zt?k&&e.compressedTexSubImage2D(i.TEXTURE_2D,K,0,0,At.width,At.height,Tt,At.data):e.compressedTexImage2D(i.TEXTURE_2D,K,Vt,At.width,At.height,0,At.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Zt?k&&e.texSubImage2D(i.TEXTURE_2D,K,0,0,At.width,At.height,Tt,Ft,At.data):e.texImage2D(i.TEXTURE_2D,K,Vt,At.width,At.height,0,Tt,Ft,At.data)}else if(T.isDataArrayTexture)if(Zt){if(ye&&e.texStorage3D(i.TEXTURE_2D_ARRAY,dt,Vt,ot.width,ot.height,ot.depth),k)if(T.layerUpdates.size>0){const K=bf(ot.width,ot.height,T.format,T.type);for(const tt of T.layerUpdates){const _t=ot.data.subarray(tt*K/ot.data.BYTES_PER_ELEMENT,(tt+1)*K/ot.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,tt,ot.width,ot.height,1,Tt,Ft,_t)}T.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ot.width,ot.height,ot.depth,Tt,Ft,ot.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,Vt,ot.width,ot.height,ot.depth,0,Tt,Ft,ot.data);else if(T.isData3DTexture)Zt?(ye&&e.texStorage3D(i.TEXTURE_3D,dt,Vt,ot.width,ot.height,ot.depth),k&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ot.width,ot.height,ot.depth,Tt,Ft,ot.data)):e.texImage3D(i.TEXTURE_3D,0,Vt,ot.width,ot.height,ot.depth,0,Tt,Ft,ot.data);else if(T.isFramebufferTexture){if(ye)if(Zt)e.texStorage2D(i.TEXTURE_2D,dt,Vt,ot.width,ot.height);else{let K=ot.width,tt=ot.height;for(let _t=0;_t<dt;_t++)e.texImage2D(i.TEXTURE_2D,_t,Vt,K,tt,0,Tt,Ft,null),K>>=1,tt>>=1}}else if(oe.length>0){if(Zt&&ye){const K=kt(oe[0]);e.texStorage2D(i.TEXTURE_2D,dt,Vt,K.width,K.height)}for(let K=0,tt=oe.length;K<tt;K++)At=oe[K],Zt?k&&e.texSubImage2D(i.TEXTURE_2D,K,0,0,Tt,Ft,At):e.texImage2D(i.TEXTURE_2D,K,Vt,Tt,Ft,At);T.generateMipmaps=!1}else if(Zt){if(ye){const K=kt(ot);e.texStorage2D(i.TEXTURE_2D,dt,Vt,K.width,K.height)}k&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,Tt,Ft,ot)}else e.texImage2D(i.TEXTURE_2D,0,Vt,Tt,Ft,ot);m(T)&&g(Q),Pt.__version=Z.version,T.onUpdate&&T.onUpdate(T)}R.__version=T.version}function rt(R,T,B){if(T.image.length!==6)return;const Q=fe(R,T),et=T.source;e.bindTexture(i.TEXTURE_CUBE_MAP,R.__webglTexture,i.TEXTURE0+B);const Z=n.get(et);if(et.version!==Z.__version||Q===!0){e.activeTexture(i.TEXTURE0+B);const Pt=ce.getPrimaries(ce.workingColorSpace),pt=T.colorSpace===Ji?null:ce.getPrimaries(T.colorSpace),bt=T.colorSpace===Ji||Pt===pt?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,T.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,T.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,bt);const ae=T.isCompressedTexture||T.image[0].isCompressedTexture,ot=T.image[0]&&T.image[0].isDataTexture,Tt=[];for(let tt=0;tt<6;tt++)!ae&&!ot?Tt[tt]=v(T.image[tt],!0,s.maxCubemapSize):Tt[tt]=ot?T.image[tt].image:T.image[tt],Tt[tt]=be(T,Tt[tt]);const Ft=Tt[0],Vt=r.convert(T.format,T.colorSpace),At=r.convert(T.type),oe=M(T.internalFormat,Vt,At,T.colorSpace),Zt=T.isVideoTexture!==!0,ye=Z.__version===void 0||Q===!0,k=et.dataReady;let dt=C(T,Ft);$t(i.TEXTURE_CUBE_MAP,T);let K;if(ae){Zt&&ye&&e.texStorage2D(i.TEXTURE_CUBE_MAP,dt,oe,Ft.width,Ft.height);for(let tt=0;tt<6;tt++){K=Tt[tt].mipmaps;for(let _t=0;_t<K.length;_t++){const mt=K[_t];T.format!==Bn?Vt!==null?Zt?k&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+tt,_t,0,0,mt.width,mt.height,Vt,mt.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+tt,_t,oe,mt.width,mt.height,0,mt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Zt?k&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+tt,_t,0,0,mt.width,mt.height,Vt,At,mt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+tt,_t,oe,mt.width,mt.height,0,Vt,At,mt.data)}}}else{if(K=T.mipmaps,Zt&&ye){K.length>0&&dt++;const tt=kt(Tt[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,dt,oe,tt.width,tt.height)}for(let tt=0;tt<6;tt++)if(ot){Zt?k&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+tt,0,0,0,Tt[tt].width,Tt[tt].height,Vt,At,Tt[tt].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+tt,0,oe,Tt[tt].width,Tt[tt].height,0,Vt,At,Tt[tt].data);for(let _t=0;_t<K.length;_t++){const qt=K[_t].image[tt].image;Zt?k&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+tt,_t+1,0,0,qt.width,qt.height,Vt,At,qt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+tt,_t+1,oe,qt.width,qt.height,0,Vt,At,qt.data)}}else{Zt?k&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+tt,0,0,0,Vt,At,Tt[tt]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+tt,0,oe,Vt,At,Tt[tt]);for(let _t=0;_t<K.length;_t++){const mt=K[_t];Zt?k&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+tt,_t+1,0,0,Vt,At,mt.image[tt]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+tt,_t+1,oe,Vt,At,mt.image[tt])}}}m(T)&&g(i.TEXTURE_CUBE_MAP),Z.__version=et.version,T.onUpdate&&T.onUpdate(T)}R.__version=T.version}function wt(R,T,B,Q,et,Z){const Pt=r.convert(B.format,B.colorSpace),pt=r.convert(B.type),bt=M(B.internalFormat,Pt,pt,B.colorSpace),ae=n.get(T),ot=n.get(B);if(ot.__renderTarget=T,!ae.__hasExternalTextures){const Tt=Math.max(1,T.width>>Z),Ft=Math.max(1,T.height>>Z);et===i.TEXTURE_3D||et===i.TEXTURE_2D_ARRAY?e.texImage3D(et,Z,bt,Tt,Ft,T.depth,0,Pt,pt,null):e.texImage2D(et,Z,bt,Tt,Ft,0,Pt,pt,null)}e.bindFramebuffer(i.FRAMEBUFFER,R),re(T)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Q,et,ot.__webglTexture,0,Qt(T)):(et===i.TEXTURE_2D||et>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&et<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,Q,et,ot.__webglTexture,Z),e.bindFramebuffer(i.FRAMEBUFFER,null)}function lt(R,T,B){if(i.bindRenderbuffer(i.RENDERBUFFER,R),T.depthBuffer){const Q=T.depthTexture,et=Q&&Q.isDepthTexture?Q.type:null,Z=S(T.stencilBuffer,et),Pt=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,pt=Qt(T);re(T)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,pt,Z,T.width,T.height):B?i.renderbufferStorageMultisample(i.RENDERBUFFER,pt,Z,T.width,T.height):i.renderbufferStorage(i.RENDERBUFFER,Z,T.width,T.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Pt,i.RENDERBUFFER,R)}else{const Q=T.textures;for(let et=0;et<Q.length;et++){const Z=Q[et],Pt=r.convert(Z.format,Z.colorSpace),pt=r.convert(Z.type),bt=M(Z.internalFormat,Pt,pt,Z.colorSpace),ae=Qt(T);B&&re(T)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,ae,bt,T.width,T.height):re(T)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ae,bt,T.width,T.height):i.renderbufferStorage(i.RENDERBUFFER,bt,T.width,T.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Ot(R,T){if(T&&T.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(i.FRAMEBUFFER,R),!(T.depthTexture&&T.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const Q=n.get(T.depthTexture);Q.__renderTarget=T,(!Q.__webglTexture||T.depthTexture.image.width!==T.width||T.depthTexture.image.height!==T.height)&&(T.depthTexture.image.width=T.width,T.depthTexture.image.height=T.height,T.depthTexture.needsUpdate=!0),nt(T.depthTexture,0);const et=Q.__webglTexture,Z=Qt(T);if(T.depthTexture.format===Mr)re(T)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,et,0,Z):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,et,0);else if(T.depthTexture.format===Cr)re(T)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,et,0,Z):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,et,0);else throw new Error("Unknown depthTexture format")}function Ht(R){const T=n.get(R),B=R.isWebGLCubeRenderTarget===!0;if(T.__boundDepthTexture!==R.depthTexture){const Q=R.depthTexture;if(T.__depthDisposeCallback&&T.__depthDisposeCallback(),Q){const et=()=>{delete T.__boundDepthTexture,delete T.__depthDisposeCallback,Q.removeEventListener("dispose",et)};Q.addEventListener("dispose",et),T.__depthDisposeCallback=et}T.__boundDepthTexture=Q}if(R.depthTexture&&!T.__autoAllocateDepthBuffer){if(B)throw new Error("target.depthTexture not supported in Cube render targets");Ot(T.__webglFramebuffer,R)}else if(B){T.__webglDepthbuffer=[];for(let Q=0;Q<6;Q++)if(e.bindFramebuffer(i.FRAMEBUFFER,T.__webglFramebuffer[Q]),T.__webglDepthbuffer[Q]===void 0)T.__webglDepthbuffer[Q]=i.createRenderbuffer(),lt(T.__webglDepthbuffer[Q],R,!1);else{const et=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Z=T.__webglDepthbuffer[Q];i.bindRenderbuffer(i.RENDERBUFFER,Z),i.framebufferRenderbuffer(i.FRAMEBUFFER,et,i.RENDERBUFFER,Z)}}else if(e.bindFramebuffer(i.FRAMEBUFFER,T.__webglFramebuffer),T.__webglDepthbuffer===void 0)T.__webglDepthbuffer=i.createRenderbuffer(),lt(T.__webglDepthbuffer,R,!1);else{const Q=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,et=T.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,et),i.framebufferRenderbuffer(i.FRAMEBUFFER,Q,i.RENDERBUFFER,et)}e.bindFramebuffer(i.FRAMEBUFFER,null)}function Kt(R,T,B){const Q=n.get(R);T!==void 0&&wt(Q.__webglFramebuffer,R,R.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),B!==void 0&&Ht(R)}function ve(R){const T=R.texture,B=n.get(R),Q=n.get(T);R.addEventListener("dispose",w);const et=R.textures,Z=R.isWebGLCubeRenderTarget===!0,Pt=et.length>1;if(Pt||(Q.__webglTexture===void 0&&(Q.__webglTexture=i.createTexture()),Q.__version=T.version,o.memory.textures++),Z){B.__webglFramebuffer=[];for(let pt=0;pt<6;pt++)if(T.mipmaps&&T.mipmaps.length>0){B.__webglFramebuffer[pt]=[];for(let bt=0;bt<T.mipmaps.length;bt++)B.__webglFramebuffer[pt][bt]=i.createFramebuffer()}else B.__webglFramebuffer[pt]=i.createFramebuffer()}else{if(T.mipmaps&&T.mipmaps.length>0){B.__webglFramebuffer=[];for(let pt=0;pt<T.mipmaps.length;pt++)B.__webglFramebuffer[pt]=i.createFramebuffer()}else B.__webglFramebuffer=i.createFramebuffer();if(Pt)for(let pt=0,bt=et.length;pt<bt;pt++){const ae=n.get(et[pt]);ae.__webglTexture===void 0&&(ae.__webglTexture=i.createTexture(),o.memory.textures++)}if(R.samples>0&&re(R)===!1){B.__webglMultisampledFramebuffer=i.createFramebuffer(),B.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let pt=0;pt<et.length;pt++){const bt=et[pt];B.__webglColorRenderbuffer[pt]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,B.__webglColorRenderbuffer[pt]);const ae=r.convert(bt.format,bt.colorSpace),ot=r.convert(bt.type),Tt=M(bt.internalFormat,ae,ot,bt.colorSpace,R.isXRRenderTarget===!0),Ft=Qt(R);i.renderbufferStorageMultisample(i.RENDERBUFFER,Ft,Tt,R.width,R.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+pt,i.RENDERBUFFER,B.__webglColorRenderbuffer[pt])}i.bindRenderbuffer(i.RENDERBUFFER,null),R.depthBuffer&&(B.__webglDepthRenderbuffer=i.createRenderbuffer(),lt(B.__webglDepthRenderbuffer,R,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(Z){e.bindTexture(i.TEXTURE_CUBE_MAP,Q.__webglTexture),$t(i.TEXTURE_CUBE_MAP,T);for(let pt=0;pt<6;pt++)if(T.mipmaps&&T.mipmaps.length>0)for(let bt=0;bt<T.mipmaps.length;bt++)wt(B.__webglFramebuffer[pt][bt],R,T,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+pt,bt);else wt(B.__webglFramebuffer[pt],R,T,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+pt,0);m(T)&&g(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(Pt){for(let pt=0,bt=et.length;pt<bt;pt++){const ae=et[pt],ot=n.get(ae);e.bindTexture(i.TEXTURE_2D,ot.__webglTexture),$t(i.TEXTURE_2D,ae),wt(B.__webglFramebuffer,R,ae,i.COLOR_ATTACHMENT0+pt,i.TEXTURE_2D,0),m(ae)&&g(i.TEXTURE_2D)}e.unbindTexture()}else{let pt=i.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(pt=R.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(pt,Q.__webglTexture),$t(pt,T),T.mipmaps&&T.mipmaps.length>0)for(let bt=0;bt<T.mipmaps.length;bt++)wt(B.__webglFramebuffer[bt],R,T,i.COLOR_ATTACHMENT0,pt,bt);else wt(B.__webglFramebuffer,R,T,i.COLOR_ATTACHMENT0,pt,0);m(T)&&g(pt),e.unbindTexture()}R.depthBuffer&&Ht(R)}function ne(R){const T=R.textures;for(let B=0,Q=T.length;B<Q;B++){const et=T[B];if(m(et)){const Z=_(R),Pt=n.get(et).__webglTexture;e.bindTexture(Z,Pt),g(Z),e.unbindTexture()}}}const Ce=[],z=[];function on(R){if(R.samples>0){if(re(R)===!1){const T=R.textures,B=R.width,Q=R.height;let et=i.COLOR_BUFFER_BIT;const Z=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Pt=n.get(R),pt=T.length>1;if(pt)for(let bt=0;bt<T.length;bt++)e.bindFramebuffer(i.FRAMEBUFFER,Pt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+bt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,Pt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+bt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,Pt.__webglMultisampledFramebuffer),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Pt.__webglFramebuffer);for(let bt=0;bt<T.length;bt++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(et|=i.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(et|=i.STENCIL_BUFFER_BIT)),pt){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Pt.__webglColorRenderbuffer[bt]);const ae=n.get(T[bt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,ae,0)}i.blitFramebuffer(0,0,B,Q,0,0,B,Q,et,i.NEAREST),l===!0&&(Ce.length=0,z.length=0,Ce.push(i.COLOR_ATTACHMENT0+bt),R.depthBuffer&&R.resolveDepthBuffer===!1&&(Ce.push(Z),z.push(Z),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,z)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Ce))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),pt)for(let bt=0;bt<T.length;bt++){e.bindFramebuffer(i.FRAMEBUFFER,Pt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+bt,i.RENDERBUFFER,Pt.__webglColorRenderbuffer[bt]);const ae=n.get(T[bt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,Pt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+bt,i.TEXTURE_2D,ae,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Pt.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.resolveDepthBuffer===!1&&l){const T=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[T])}}}function Qt(R){return Math.min(s.maxSamples,R.samples)}function re(R){const T=n.get(R);return R.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&T.__useRenderToTexture!==!1}function Ut(R){const T=o.render.frame;h.get(R)!==T&&(h.set(R,T),R.update())}function be(R,T){const B=R.colorSpace,Q=R.format,et=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||B!==Or&&B!==Ji&&(ce.getTransfer(B)===xe?(Q!==Bn||et!==ki)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",B)),T}function kt(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(c.width=R.naturalWidth||R.width,c.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(c.width=R.displayWidth,c.height=R.displayHeight):(c.width=R.width,c.height=R.height),c}this.allocateTextureUnit=W,this.resetTextureUnits=X,this.setTexture2D=nt,this.setTexture2DArray=$,this.setTexture3D=it,this.setTextureCube=G,this.rebindTextures=Kt,this.setupRenderTarget=ve,this.updateRenderTargetMipmap=ne,this.updateMultisampleRenderTarget=on,this.setupDepthRenderbuffer=Ht,this.setupFrameBufferTexture=wt,this.useMultisampledRTT=re}function B_(i,t){function e(n,s=Ji){let r;const o=ce.getTransfer(s);if(n===ki)return i.UNSIGNED_BYTE;if(n===Fh)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Bh)return i.UNSIGNED_SHORT_5_5_5_1;if(n===qd)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Xd)return i.BYTE;if(n===$d)return i.SHORT;if(n===Do)return i.UNSIGNED_SHORT;if(n===zh)return i.INT;if(n===ls)return i.UNSIGNED_INT;if(n===pi)return i.FLOAT;if(n===vi)return i.HALF_FLOAT;if(n===Yd)return i.ALPHA;if(n===jd)return i.RGB;if(n===Bn)return i.RGBA;if(n===Zd)return i.LUMINANCE;if(n===Jd)return i.LUMINANCE_ALPHA;if(n===Mr)return i.DEPTH_COMPONENT;if(n===Cr)return i.DEPTH_STENCIL;if(n===Hh)return i.RED;if(n===Vh)return i.RED_INTEGER;if(n===Qd)return i.RG;if(n===Wh)return i.RG_INTEGER;if(n===Gh)return i.RGBA_INTEGER;if(n===Fa||n===Ba||n===Ha||n===Va)if(o===xe)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Fa)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Ba)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Ha)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Va)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Fa)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Ba)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Ha)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Va)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Kc||n===Xc||n===$c||n===qc)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Kc)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Xc)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===$c)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===qc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Yc||n===jc||n===Zc)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Yc||n===jc)return o===xe?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Zc)return o===xe?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Jc||n===Qc||n===th||n===eh||n===nh||n===ih||n===sh||n===rh||n===oh||n===ah||n===lh||n===ch||n===hh||n===uh)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Jc)return o===xe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Qc)return o===xe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===th)return o===xe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===eh)return o===xe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===nh)return o===xe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===ih)return o===xe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===sh)return o===xe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===rh)return o===xe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===oh)return o===xe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===ah)return o===xe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===lh)return o===xe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===ch)return o===xe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===hh)return o===xe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===uh)return o===xe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Wa||n===fh||n===dh)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===Wa)return o===xe?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===fh)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===dh)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===tp||n===ph||n===mh||n===gh)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===Wa)return r.COMPRESSED_RED_RGTC1_EXT;if(n===ph)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===mh)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===gh)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Rr?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}class H_ extends Fn{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}class ii extends sn{constructor(){super(),this.isGroup=!0,this.type="Group"}}const V_={type:"move"};class uc{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ii,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ii,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new O,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new O),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ii,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new O,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new O),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(const v of t.hand.values()){const m=e.getJointPose(v,n),g=this._getHandJoint(c,v);m!==null&&(g.matrix.fromArray(m.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=m.radius),g.visible=m!==null}const h=c.joints["index-finger-tip"],f=c.joints["thumb-tip"],u=h.position.distanceTo(f.position),p=.02,x=.005;c.inputState.pinching&&u>p+x?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&u<=p-x&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(V_)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new ii;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}const W_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,G_=`
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

}`;class K_{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){const s=new Ye,r=t.properties.get(s);r.__webglTexture=e.texture,(e.depthNear!=n.depthNear||e.depthFar!=n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=s}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new Ve({vertexShader:W_,fragmentShader:G_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Re(new Ps(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class X_ extends kr{constructor(t,e){super();const n=this;let s=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,f=null,u=null,p=null,x=null;const v=new K_,m=e.getContextAttributes();let g=null,_=null;const M=[],S=[],C=new zt;let y=null;const w=new Fn;w.viewport=new ze;const L=new Fn;L.viewport=new ze;const E=[w,L],b=new H_;let N=null,X=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(j){let rt=M[j];return rt===void 0&&(rt=new uc,M[j]=rt),rt.getTargetRaySpace()},this.getControllerGrip=function(j){let rt=M[j];return rt===void 0&&(rt=new uc,M[j]=rt),rt.getGripSpace()},this.getHand=function(j){let rt=M[j];return rt===void 0&&(rt=new uc,M[j]=rt),rt.getHandSpace()};function W(j){const rt=S.indexOf(j.inputSource);if(rt===-1)return;const wt=M[rt];wt!==void 0&&(wt.update(j.inputSource,j.frame,c||o),wt.dispatchEvent({type:j.type,data:j.inputSource}))}function Y(){s.removeEventListener("select",W),s.removeEventListener("selectstart",W),s.removeEventListener("selectend",W),s.removeEventListener("squeeze",W),s.removeEventListener("squeezestart",W),s.removeEventListener("squeezeend",W),s.removeEventListener("end",Y),s.removeEventListener("inputsourceschange",nt);for(let j=0;j<M.length;j++){const rt=S[j];rt!==null&&(S[j]=null,M[j].disconnect(rt))}N=null,X=null,v.reset(),t.setRenderTarget(g),p=null,u=null,f=null,s=null,_=null,fe.stop(),n.isPresenting=!1,t.setPixelRatio(y),t.setSize(C.width,C.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(j){r=j,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(j){a=j,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(j){c=j},this.getBaseLayer=function(){return u!==null?u:p},this.getBinding=function(){return f},this.getFrame=function(){return x},this.getSession=function(){return s},this.setSession=async function(j){if(s=j,s!==null){if(g=t.getRenderTarget(),s.addEventListener("select",W),s.addEventListener("selectstart",W),s.addEventListener("selectend",W),s.addEventListener("squeeze",W),s.addEventListener("squeezestart",W),s.addEventListener("squeezeend",W),s.addEventListener("end",Y),s.addEventListener("inputsourceschange",nt),m.xrCompatible!==!0&&await e.makeXRCompatible(),y=t.getPixelRatio(),t.getSize(C),s.renderState.layers===void 0){const rt={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,e,rt),s.updateRenderState({baseLayer:p}),t.setPixelRatio(1),t.setSize(p.framebufferWidth,p.framebufferHeight,!1),_=new Nn(p.framebufferWidth,p.framebufferHeight,{format:Bn,type:ki,colorSpace:t.outputColorSpace,stencilBuffer:m.stencil})}else{let rt=null,wt=null,lt=null;m.depth&&(lt=m.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,rt=m.stencil?Cr:Mr,wt=m.stencil?Rr:ls);const Ot={colorFormat:e.RGBA8,depthFormat:lt,scaleFactor:r};f=new XRWebGLBinding(s,e),u=f.createProjectionLayer(Ot),s.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),_=new Nn(u.textureWidth,u.textureHeight,{format:Bn,type:ki,depthTexture:new jh(u.textureWidth,u.textureHeight,wt,void 0,void 0,void 0,void 0,void 0,void 0,rt),stencilBuffer:m.stencil,colorSpace:t.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1})}_.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),fe.setContext(s),fe.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function nt(j){for(let rt=0;rt<j.removed.length;rt++){const wt=j.removed[rt],lt=S.indexOf(wt);lt>=0&&(S[lt]=null,M[lt].disconnect(wt))}for(let rt=0;rt<j.added.length;rt++){const wt=j.added[rt];let lt=S.indexOf(wt);if(lt===-1){for(let Ht=0;Ht<M.length;Ht++)if(Ht>=S.length){S.push(wt),lt=Ht;break}else if(S[Ht]===null){S[Ht]=wt,lt=Ht;break}if(lt===-1)break}const Ot=M[lt];Ot&&Ot.connect(wt)}}const $=new O,it=new O;function G(j,rt,wt){$.setFromMatrixPosition(rt.matrixWorld),it.setFromMatrixPosition(wt.matrixWorld);const lt=$.distanceTo(it),Ot=rt.projectionMatrix.elements,Ht=wt.projectionMatrix.elements,Kt=Ot[14]/(Ot[10]-1),ve=Ot[14]/(Ot[10]+1),ne=(Ot[9]+1)/Ot[5],Ce=(Ot[9]-1)/Ot[5],z=(Ot[8]-1)/Ot[0],on=(Ht[8]+1)/Ht[0],Qt=Kt*z,re=Kt*on,Ut=lt/(-z+on),be=Ut*-z;if(rt.matrixWorld.decompose(j.position,j.quaternion,j.scale),j.translateX(be),j.translateZ(Ut),j.matrixWorld.compose(j.position,j.quaternion,j.scale),j.matrixWorldInverse.copy(j.matrixWorld).invert(),Ot[10]===-1)j.projectionMatrix.copy(rt.projectionMatrix),j.projectionMatrixInverse.copy(rt.projectionMatrixInverse);else{const kt=Kt+Ut,R=ve+Ut,T=Qt-be,B=re+(lt-be),Q=ne*ve/R*kt,et=Ce*ve/R*kt;j.projectionMatrix.makePerspective(T,B,Q,et,kt,R),j.projectionMatrixInverse.copy(j.projectionMatrix).invert()}}function st(j,rt){rt===null?j.matrixWorld.copy(j.matrix):j.matrixWorld.multiplyMatrices(rt.matrixWorld,j.matrix),j.matrixWorldInverse.copy(j.matrixWorld).invert()}this.updateCamera=function(j){if(s===null)return;let rt=j.near,wt=j.far;v.texture!==null&&(v.depthNear>0&&(rt=v.depthNear),v.depthFar>0&&(wt=v.depthFar)),b.near=L.near=w.near=rt,b.far=L.far=w.far=wt,(N!==b.near||X!==b.far)&&(s.updateRenderState({depthNear:b.near,depthFar:b.far}),N=b.near,X=b.far),w.layers.mask=j.layers.mask|2,L.layers.mask=j.layers.mask|4,b.layers.mask=w.layers.mask|L.layers.mask;const lt=j.parent,Ot=b.cameras;st(b,lt);for(let Ht=0;Ht<Ot.length;Ht++)st(Ot[Ht],lt);Ot.length===2?G(b,w,L):b.projectionMatrix.copy(w.projectionMatrix),xt(j,b,lt)};function xt(j,rt,wt){wt===null?j.matrix.copy(rt.matrixWorld):(j.matrix.copy(wt.matrixWorld),j.matrix.invert(),j.matrix.multiply(rt.matrixWorld)),j.matrix.decompose(j.position,j.quaternion,j.scale),j.updateMatrixWorld(!0),j.projectionMatrix.copy(rt.projectionMatrix),j.projectionMatrixInverse.copy(rt.projectionMatrixInverse),j.isPerspectiveCamera&&(j.fov=xh*2*Math.atan(1/j.projectionMatrix.elements[5]),j.zoom=1)}this.getCamera=function(){return b},this.getFoveation=function(){if(!(u===null&&p===null))return l},this.setFoveation=function(j){l=j,u!==null&&(u.fixedFoveation=j),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=j)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(b)};let Dt=null;function $t(j,rt){if(h=rt.getViewerPose(c||o),x=rt,h!==null){const wt=h.views;p!==null&&(t.setRenderTargetFramebuffer(_,p.framebuffer),t.setRenderTarget(_));let lt=!1;wt.length!==b.cameras.length&&(b.cameras.length=0,lt=!0);for(let Ht=0;Ht<wt.length;Ht++){const Kt=wt[Ht];let ve=null;if(p!==null)ve=p.getViewport(Kt);else{const Ce=f.getViewSubImage(u,Kt);ve=Ce.viewport,Ht===0&&(t.setRenderTargetTextures(_,Ce.colorTexture,u.ignoreDepthValues?void 0:Ce.depthStencilTexture),t.setRenderTarget(_))}let ne=E[Ht];ne===void 0&&(ne=new Fn,ne.layers.enable(Ht),ne.viewport=new ze,E[Ht]=ne),ne.matrix.fromArray(Kt.transform.matrix),ne.matrix.decompose(ne.position,ne.quaternion,ne.scale),ne.projectionMatrix.fromArray(Kt.projectionMatrix),ne.projectionMatrixInverse.copy(ne.projectionMatrix).invert(),ne.viewport.set(ve.x,ve.y,ve.width,ve.height),Ht===0&&(b.matrix.copy(ne.matrix),b.matrix.decompose(b.position,b.quaternion,b.scale)),lt===!0&&b.cameras.push(ne)}const Ot=s.enabledFeatures;if(Ot&&Ot.includes("depth-sensing")){const Ht=f.getDepthInformation(wt[0]);Ht&&Ht.isValid&&Ht.texture&&v.init(t,Ht,s.renderState)}}for(let wt=0;wt<M.length;wt++){const lt=S[wt],Ot=M[wt];lt!==null&&Ot!==void 0&&Ot.update(lt,rt,c||o)}Dt&&Dt(j,rt),rt.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:rt}),x=null}const fe=new up;fe.setAnimationLoop($t),this.setAnimationLoop=function(j){Dt=j},this.dispose=function(){}}}const Es=new Ui,$_=new ge;function q_(i,t){function e(m,g){m.matrixAutoUpdate===!0&&m.updateMatrix(),g.value.copy(m.matrix)}function n(m,g){g.color.getRGB(m.fogColor.value,ap(i)),g.isFog?(m.fogNear.value=g.near,m.fogFar.value=g.far):g.isFogExp2&&(m.fogDensity.value=g.density)}function s(m,g,_,M,S){g.isMeshBasicMaterial||g.isMeshLambertMaterial?r(m,g):g.isMeshToonMaterial?(r(m,g),f(m,g)):g.isMeshPhongMaterial?(r(m,g),h(m,g)):g.isMeshStandardMaterial?(r(m,g),u(m,g),g.isMeshPhysicalMaterial&&p(m,g,S)):g.isMeshMatcapMaterial?(r(m,g),x(m,g)):g.isMeshDepthMaterial?r(m,g):g.isMeshDistanceMaterial?(r(m,g),v(m,g)):g.isMeshNormalMaterial?r(m,g):g.isLineBasicMaterial?(o(m,g),g.isLineDashedMaterial&&a(m,g)):g.isPointsMaterial?l(m,g,_,M):g.isSpriteMaterial?c(m,g):g.isShadowMaterial?(m.color.value.copy(g.color),m.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(m,g){m.opacity.value=g.opacity,g.color&&m.diffuse.value.copy(g.color),g.emissive&&m.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(m.map.value=g.map,e(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,e(g.alphaMap,m.alphaMapTransform)),g.bumpMap&&(m.bumpMap.value=g.bumpMap,e(g.bumpMap,m.bumpMapTransform),m.bumpScale.value=g.bumpScale,g.side===pn&&(m.bumpScale.value*=-1)),g.normalMap&&(m.normalMap.value=g.normalMap,e(g.normalMap,m.normalMapTransform),m.normalScale.value.copy(g.normalScale),g.side===pn&&m.normalScale.value.negate()),g.displacementMap&&(m.displacementMap.value=g.displacementMap,e(g.displacementMap,m.displacementMapTransform),m.displacementScale.value=g.displacementScale,m.displacementBias.value=g.displacementBias),g.emissiveMap&&(m.emissiveMap.value=g.emissiveMap,e(g.emissiveMap,m.emissiveMapTransform)),g.specularMap&&(m.specularMap.value=g.specularMap,e(g.specularMap,m.specularMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest);const _=t.get(g),M=_.envMap,S=_.envMapRotation;M&&(m.envMap.value=M,Es.copy(S),Es.x*=-1,Es.y*=-1,Es.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(Es.y*=-1,Es.z*=-1),m.envMapRotation.value.setFromMatrix4($_.makeRotationFromEuler(Es)),m.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=g.reflectivity,m.ior.value=g.ior,m.refractionRatio.value=g.refractionRatio),g.lightMap&&(m.lightMap.value=g.lightMap,m.lightMapIntensity.value=g.lightMapIntensity,e(g.lightMap,m.lightMapTransform)),g.aoMap&&(m.aoMap.value=g.aoMap,m.aoMapIntensity.value=g.aoMapIntensity,e(g.aoMap,m.aoMapTransform))}function o(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,g.map&&(m.map.value=g.map,e(g.map,m.mapTransform))}function a(m,g){m.dashSize.value=g.dashSize,m.totalSize.value=g.dashSize+g.gapSize,m.scale.value=g.scale}function l(m,g,_,M){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.size.value=g.size*_,m.scale.value=M*.5,g.map&&(m.map.value=g.map,e(g.map,m.uvTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,e(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function c(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.rotation.value=g.rotation,g.map&&(m.map.value=g.map,e(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,e(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function h(m,g){m.specular.value.copy(g.specular),m.shininess.value=Math.max(g.shininess,1e-4)}function f(m,g){g.gradientMap&&(m.gradientMap.value=g.gradientMap)}function u(m,g){m.metalness.value=g.metalness,g.metalnessMap&&(m.metalnessMap.value=g.metalnessMap,e(g.metalnessMap,m.metalnessMapTransform)),m.roughness.value=g.roughness,g.roughnessMap&&(m.roughnessMap.value=g.roughnessMap,e(g.roughnessMap,m.roughnessMapTransform)),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)}function p(m,g,_){m.ior.value=g.ior,g.sheen>0&&(m.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),m.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(m.sheenColorMap.value=g.sheenColorMap,e(g.sheenColorMap,m.sheenColorMapTransform)),g.sheenRoughnessMap&&(m.sheenRoughnessMap.value=g.sheenRoughnessMap,e(g.sheenRoughnessMap,m.sheenRoughnessMapTransform))),g.clearcoat>0&&(m.clearcoat.value=g.clearcoat,m.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(m.clearcoatMap.value=g.clearcoatMap,e(g.clearcoatMap,m.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,e(g.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(m.clearcoatNormalMap.value=g.clearcoatNormalMap,e(g.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===pn&&m.clearcoatNormalScale.value.negate())),g.dispersion>0&&(m.dispersion.value=g.dispersion),g.iridescence>0&&(m.iridescence.value=g.iridescence,m.iridescenceIOR.value=g.iridescenceIOR,m.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(m.iridescenceMap.value=g.iridescenceMap,e(g.iridescenceMap,m.iridescenceMapTransform)),g.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=g.iridescenceThicknessMap,e(g.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),g.transmission>0&&(m.transmission.value=g.transmission,m.transmissionSamplerMap.value=_.texture,m.transmissionSamplerSize.value.set(_.width,_.height),g.transmissionMap&&(m.transmissionMap.value=g.transmissionMap,e(g.transmissionMap,m.transmissionMapTransform)),m.thickness.value=g.thickness,g.thicknessMap&&(m.thicknessMap.value=g.thicknessMap,e(g.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=g.attenuationDistance,m.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(m.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(m.anisotropyMap.value=g.anisotropyMap,e(g.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=g.specularIntensity,m.specularColor.value.copy(g.specularColor),g.specularColorMap&&(m.specularColorMap.value=g.specularColorMap,e(g.specularColorMap,m.specularColorMapTransform)),g.specularIntensityMap&&(m.specularIntensityMap.value=g.specularIntensityMap,e(g.specularIntensityMap,m.specularIntensityMapTransform))}function x(m,g){g.matcap&&(m.matcap.value=g.matcap)}function v(m,g){const _=t.get(g).light;m.referencePosition.value.setFromMatrixPosition(_.matrixWorld),m.nearDistance.value=_.shadow.camera.near,m.farDistance.value=_.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Y_(i,t,e,n){let s={},r={},o=[];const a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(_,M){const S=M.program;n.uniformBlockBinding(_,S)}function c(_,M){let S=s[_.id];S===void 0&&(x(_),S=h(_),s[_.id]=S,_.addEventListener("dispose",m));const C=M.program;n.updateUBOMapping(_,C);const y=t.render.frame;r[_.id]!==y&&(u(_),r[_.id]=y)}function h(_){const M=f();_.__bindingPointIndex=M;const S=i.createBuffer(),C=_.__size,y=_.usage;return i.bindBuffer(i.UNIFORM_BUFFER,S),i.bufferData(i.UNIFORM_BUFFER,C,y),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,M,S),S}function f(){for(let _=0;_<a;_++)if(o.indexOf(_)===-1)return o.push(_),_;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(_){const M=s[_.id],S=_.uniforms,C=_.__cache;i.bindBuffer(i.UNIFORM_BUFFER,M);for(let y=0,w=S.length;y<w;y++){const L=Array.isArray(S[y])?S[y]:[S[y]];for(let E=0,b=L.length;E<b;E++){const N=L[E];if(p(N,y,E,C)===!0){const X=N.__offset,W=Array.isArray(N.value)?N.value:[N.value];let Y=0;for(let nt=0;nt<W.length;nt++){const $=W[nt],it=v($);typeof $=="number"||typeof $=="boolean"?(N.__data[0]=$,i.bufferSubData(i.UNIFORM_BUFFER,X+Y,N.__data)):$.isMatrix3?(N.__data[0]=$.elements[0],N.__data[1]=$.elements[1],N.__data[2]=$.elements[2],N.__data[3]=0,N.__data[4]=$.elements[3],N.__data[5]=$.elements[4],N.__data[6]=$.elements[5],N.__data[7]=0,N.__data[8]=$.elements[6],N.__data[9]=$.elements[7],N.__data[10]=$.elements[8],N.__data[11]=0):($.toArray(N.__data,Y),Y+=it.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,X,N.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(_,M,S,C){const y=_.value,w=M+"_"+S;if(C[w]===void 0)return typeof y=="number"||typeof y=="boolean"?C[w]=y:C[w]=y.clone(),!0;{const L=C[w];if(typeof y=="number"||typeof y=="boolean"){if(L!==y)return C[w]=y,!0}else if(L.equals(y)===!1)return L.copy(y),!0}return!1}function x(_){const M=_.uniforms;let S=0;const C=16;for(let w=0,L=M.length;w<L;w++){const E=Array.isArray(M[w])?M[w]:[M[w]];for(let b=0,N=E.length;b<N;b++){const X=E[b],W=Array.isArray(X.value)?X.value:[X.value];for(let Y=0,nt=W.length;Y<nt;Y++){const $=W[Y],it=v($),G=S%C,st=G%it.boundary,xt=G+st;S+=st,xt!==0&&C-xt<it.storage&&(S+=C-xt),X.__data=new Float32Array(it.storage/Float32Array.BYTES_PER_ELEMENT),X.__offset=S,S+=it.storage}}}const y=S%C;return y>0&&(S+=C-y),_.__size=S,_.__cache={},this}function v(_){const M={boundary:0,storage:0};return typeof _=="number"||typeof _=="boolean"?(M.boundary=4,M.storage=4):_.isVector2?(M.boundary=8,M.storage=8):_.isVector3||_.isColor?(M.boundary=16,M.storage=12):_.isVector4?(M.boundary=16,M.storage=16):_.isMatrix3?(M.boundary=48,M.storage=48):_.isMatrix4?(M.boundary=64,M.storage=64):_.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",_),M}function m(_){const M=_.target;M.removeEventListener("dispose",m);const S=o.indexOf(M.__bindingPointIndex);o.splice(S,1),i.deleteBuffer(s[M.id]),delete s[M.id],delete r[M.id]}function g(){for(const _ in s)i.deleteBuffer(s[_]);o=[],s={},r={}}return{bind:l,update:c,dispose:g}}class j_{constructor(t={}){const{canvas:e=Fm(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:f=!1,reverseDepthBuffer:u=!1}=t;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=o;const x=new Uint32Array(4),v=new Int32Array(4);let m=null,g=null;const _=[],M=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=zn,this.toneMapping=ss,this.toneMappingExposure=1;const S=this;let C=!1,y=0,w=0,L=null,E=-1,b=null;const N=new ze,X=new ze;let W=null;const Y=new se(0);let nt=0,$=e.width,it=e.height,G=1,st=null,xt=null;const Dt=new ze(0,0,$,it),$t=new ze(0,0,$,it);let fe=!1;const j=new hp;let rt=!1,wt=!1;const lt=new ge,Ot=new ge,Ht=new O,Kt=new ze,ve={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let ne=!1;function Ce(){return L===null?G:1}let z=n;function on(A,U){return e.getContext(A,U)}try{const A={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:f};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Uh}`),e.addEventListener("webglcontextlost",tt,!1),e.addEventListener("webglcontextrestored",_t,!1),e.addEventListener("webglcontextcreationerror",mt,!1),z===null){const U="webgl2";if(z=on(U,A),z===null)throw on(U)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(A){throw console.error("THREE.WebGLRenderer: "+A.message),A}let Qt,re,Ut,be,kt,R,T,B,Q,et,Z,Pt,pt,bt,ae,ot,Tt,Ft,Vt,At,oe,Zt,ye,k;function dt(){Qt=new ex(z),Qt.init(),Zt=new B_(z,Qt),re=new Yv(z,Qt,t,Zt),Ut=new U_(z,Qt),re.reverseDepthBuffer&&u&&Ut.buffers.depth.setReversed(!0),be=new sx(z),kt=new y_,R=new F_(z,Qt,Ut,kt,re,Zt,be),T=new Zv(S),B=new tx(S),Q=new ug(z),ye=new $v(z,Q),et=new nx(z,Q,be,ye),Z=new ox(z,et,Q,be),Vt=new rx(z,re,R),ot=new jv(kt),Pt=new S_(S,T,B,Qt,re,ye,ot),pt=new q_(S,kt),bt=new b_,ae=new L_(Qt),Ft=new Xv(S,T,B,Ut,Z,p,l),Tt=new O_(S,Z,re),k=new Y_(z,be,re,Ut),At=new qv(z,Qt,be),oe=new ix(z,Qt,be),be.programs=Pt.programs,S.capabilities=re,S.extensions=Qt,S.properties=kt,S.renderLists=bt,S.shadowMap=Tt,S.state=Ut,S.info=be}dt();const K=new X_(S,z);this.xr=K,this.getContext=function(){return z},this.getContextAttributes=function(){return z.getContextAttributes()},this.forceContextLoss=function(){const A=Qt.get("WEBGL_lose_context");A&&A.loseContext()},this.forceContextRestore=function(){const A=Qt.get("WEBGL_lose_context");A&&A.restoreContext()},this.getPixelRatio=function(){return G},this.setPixelRatio=function(A){A!==void 0&&(G=A,this.setSize($,it,!1))},this.getSize=function(A){return A.set($,it)},this.setSize=function(A,U,H=!0){if(K.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}$=A,it=U,e.width=Math.floor(A*G),e.height=Math.floor(U*G),H===!0&&(e.style.width=A+"px",e.style.height=U+"px"),this.setViewport(0,0,A,U)},this.getDrawingBufferSize=function(A){return A.set($*G,it*G).floor()},this.setDrawingBufferSize=function(A,U,H){$=A,it=U,G=H,e.width=Math.floor(A*H),e.height=Math.floor(U*H),this.setViewport(0,0,A,U)},this.getCurrentViewport=function(A){return A.copy(N)},this.getViewport=function(A){return A.copy(Dt)},this.setViewport=function(A,U,H,V){A.isVector4?Dt.set(A.x,A.y,A.z,A.w):Dt.set(A,U,H,V),Ut.viewport(N.copy(Dt).multiplyScalar(G).round())},this.getScissor=function(A){return A.copy($t)},this.setScissor=function(A,U,H,V){A.isVector4?$t.set(A.x,A.y,A.z,A.w):$t.set(A,U,H,V),Ut.scissor(X.copy($t).multiplyScalar(G).round())},this.getScissorTest=function(){return fe},this.setScissorTest=function(A){Ut.setScissorTest(fe=A)},this.setOpaqueSort=function(A){st=A},this.setTransparentSort=function(A){xt=A},this.getClearColor=function(A){return A.copy(Ft.getClearColor())},this.setClearColor=function(){Ft.setClearColor.apply(Ft,arguments)},this.getClearAlpha=function(){return Ft.getClearAlpha()},this.setClearAlpha=function(){Ft.setClearAlpha.apply(Ft,arguments)},this.clear=function(A=!0,U=!0,H=!0){let V=0;if(A){let F=!1;if(L!==null){const at=L.texture.format;F=at===Gh||at===Wh||at===Vh}if(F){const at=L.texture.type,gt=at===ki||at===ls||at===Do||at===Rr||at===Fh||at===Bh,Rt=Ft.getClearColor(),Ct=Ft.getClearAlpha(),Wt=Rt.r,Yt=Rt.g,Lt=Rt.b;gt?(x[0]=Wt,x[1]=Yt,x[2]=Lt,x[3]=Ct,z.clearBufferuiv(z.COLOR,0,x)):(v[0]=Wt,v[1]=Yt,v[2]=Lt,v[3]=Ct,z.clearBufferiv(z.COLOR,0,v))}else V|=z.COLOR_BUFFER_BIT}U&&(V|=z.DEPTH_BUFFER_BIT),H&&(V|=z.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),z.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",tt,!1),e.removeEventListener("webglcontextrestored",_t,!1),e.removeEventListener("webglcontextcreationerror",mt,!1),bt.dispose(),ae.dispose(),kt.dispose(),T.dispose(),B.dispose(),Z.dispose(),ye.dispose(),k.dispose(),Pt.dispose(),K.dispose(),K.removeEventListener("sessionstart",Mu),K.removeEventListener("sessionend",Su),vs.stop()};function tt(A){A.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),C=!0}function _t(){console.log("THREE.WebGLRenderer: Context Restored."),C=!1;const A=be.autoReset,U=Tt.enabled,H=Tt.autoUpdate,V=Tt.needsUpdate,F=Tt.type;dt(),be.autoReset=A,Tt.enabled=U,Tt.autoUpdate=H,Tt.needsUpdate=V,Tt.type=F}function mt(A){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",A.statusMessage)}function qt(A){const U=A.target;U.removeEventListener("dispose",qt),Ne(U)}function Ne(A){je(A),kt.remove(A)}function je(A){const U=kt.get(A).programs;U!==void 0&&(U.forEach(function(H){Pt.releaseProgram(H)}),A.isShaderMaterial&&Pt.releaseShaderCache(A))}this.renderBufferDirect=function(A,U,H,V,F,at){U===null&&(U=ve);const gt=F.isMesh&&F.matrixWorld.determinant()<0,Rt=$0(A,U,H,V,F);Ut.setMaterial(V,gt);let Ct=H.index,Wt=1;if(V.wireframe===!0){if(Ct=et.getWireframeAttribute(H),Ct===void 0)return;Wt=2}const Yt=H.drawRange,Lt=H.attributes.position;let he=Yt.start*Wt,Ee=(Yt.start+Yt.count)*Wt;at!==null&&(he=Math.max(he,at.start*Wt),Ee=Math.min(Ee,(at.start+at.count)*Wt)),Ct!==null?(he=Math.max(he,0),Ee=Math.min(Ee,Ct.count)):Lt!=null&&(he=Math.max(he,0),Ee=Math.min(Ee,Lt.count));const Te=Ee-he;if(Te<0||Te===1/0)return;ye.setup(F,V,Rt,H,Ct);let gn,de=At;if(Ct!==null&&(gn=Q.get(Ct),de=oe,de.setIndex(gn)),F.isMesh)V.wireframe===!0?(Ut.setLineWidth(V.wireframeLinewidth*Ce()),de.setMode(z.LINES)):de.setMode(z.TRIANGLES);else if(F.isLine){let Nt=V.linewidth;Nt===void 0&&(Nt=1),Ut.setLineWidth(Nt*Ce()),F.isLineSegments?de.setMode(z.LINES):F.isLineLoop?de.setMode(z.LINE_LOOP):de.setMode(z.LINE_STRIP)}else F.isPoints?de.setMode(z.POINTS):F.isSprite&&de.setMode(z.TRIANGLES);if(F.isBatchedMesh)if(F._multiDrawInstances!==null)de.renderMultiDrawInstances(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount,F._multiDrawInstances);else if(Qt.get("WEBGL_multi_draw"))de.renderMultiDraw(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount);else{const Nt=F._multiDrawStarts,Mi=F._multiDrawCounts,pe=F._multiDrawCount,qn=Ct?Q.get(Ct).bytesPerElement:1,Xs=kt.get(V).currentProgram.getUniforms();for(let Tn=0;Tn<pe;Tn++)Xs.setValue(z,"_gl_DrawID",Tn),de.render(Nt[Tn]/qn,Mi[Tn])}else if(F.isInstancedMesh)de.renderInstances(he,Te,F.count);else if(H.isInstancedBufferGeometry){const Nt=H._maxInstanceCount!==void 0?H._maxInstanceCount:1/0,Mi=Math.min(H.instanceCount,Nt);de.renderInstances(he,Te,Mi)}else de.render(he,Te)};function me(A,U,H){A.transparent===!0&&A.side===Mn&&A.forceSinglePass===!1?(A.side=pn,A.needsUpdate=!0,Jo(A,U,H),A.side=Oi,A.needsUpdate=!0,Jo(A,U,H),A.side=Mn):Jo(A,U,H)}this.compile=function(A,U,H=null){H===null&&(H=A),g=ae.get(H),g.init(U),M.push(g),H.traverseVisible(function(F){F.isLight&&F.layers.test(U.layers)&&(g.pushLight(F),F.castShadow&&g.pushShadow(F))}),A!==H&&A.traverseVisible(function(F){F.isLight&&F.layers.test(U.layers)&&(g.pushLight(F),F.castShadow&&g.pushShadow(F))}),g.setupLights();const V=new Set;return A.traverse(function(F){if(!(F.isMesh||F.isPoints||F.isLine||F.isSprite))return;const at=F.material;if(at)if(Array.isArray(at))for(let gt=0;gt<at.length;gt++){const Rt=at[gt];me(Rt,H,F),V.add(Rt)}else me(at,H,F),V.add(at)}),M.pop(),g=null,V},this.compileAsync=function(A,U,H=null){const V=this.compile(A,U,H);return new Promise(F=>{function at(){if(V.forEach(function(gt){kt.get(gt).currentProgram.isReady()&&V.delete(gt)}),V.size===0){F(A);return}setTimeout(at,10)}Qt.get("KHR_parallel_shader_compile")!==null?at():setTimeout(at,10)})};let $n=null;function _i(A){$n&&$n(A)}function Mu(){vs.stop()}function Su(){vs.start()}const vs=new up;vs.setAnimationLoop(_i),typeof self<"u"&&vs.setContext(self),this.setAnimationLoop=function(A){$n=A,K.setAnimationLoop(A),A===null?vs.stop():vs.start()},K.addEventListener("sessionstart",Mu),K.addEventListener("sessionend",Su),this.render=function(A,U){if(U!==void 0&&U.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(C===!0)return;if(A.matrixWorldAutoUpdate===!0&&A.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),K.enabled===!0&&K.isPresenting===!0&&(K.cameraAutoUpdate===!0&&K.updateCamera(U),U=K.getCamera()),A.isScene===!0&&A.onBeforeRender(S,A,U,L),g=ae.get(A,M.length),g.init(U),M.push(g),Ot.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),j.setFromProjectionMatrix(Ot),wt=this.localClippingEnabled,rt=ot.init(this.clippingPlanes,wt),m=bt.get(A,_.length),m.init(),_.push(m),K.enabled===!0&&K.isPresenting===!0){const at=S.xr.getDepthSensingMesh();at!==null&&kl(at,U,-1/0,S.sortObjects)}kl(A,U,0,S.sortObjects),m.finish(),S.sortObjects===!0&&m.sort(st,xt),ne=K.enabled===!1||K.isPresenting===!1||K.hasDepthSensing()===!1,ne&&Ft.addToRenderList(m,A),this.info.render.frame++,rt===!0&&ot.beginShadows();const H=g.state.shadowsArray;Tt.render(H,A,U),rt===!0&&ot.endShadows(),this.info.autoReset===!0&&this.info.reset();const V=m.opaque,F=m.transmissive;if(g.setupLights(),U.isArrayCamera){const at=U.cameras;if(F.length>0)for(let gt=0,Rt=at.length;gt<Rt;gt++){const Ct=at[gt];Eu(V,F,A,Ct)}ne&&Ft.render(A);for(let gt=0,Rt=at.length;gt<Rt;gt++){const Ct=at[gt];yu(m,A,Ct,Ct.viewport)}}else F.length>0&&Eu(V,F,A,U),ne&&Ft.render(A),yu(m,A,U);L!==null&&(R.updateMultisampleRenderTarget(L),R.updateRenderTargetMipmap(L)),A.isScene===!0&&A.onAfterRender(S,A,U),ye.resetDefaultState(),E=-1,b=null,M.pop(),M.length>0?(g=M[M.length-1],rt===!0&&ot.setGlobalState(S.clippingPlanes,g.state.camera)):g=null,_.pop(),_.length>0?m=_[_.length-1]:m=null};function kl(A,U,H,V){if(A.visible===!1)return;if(A.layers.test(U.layers)){if(A.isGroup)H=A.renderOrder;else if(A.isLOD)A.autoUpdate===!0&&A.update(U);else if(A.isLight)g.pushLight(A),A.castShadow&&g.pushShadow(A);else if(A.isSprite){if(!A.frustumCulled||j.intersectsSprite(A)){V&&Kt.setFromMatrixPosition(A.matrixWorld).applyMatrix4(Ot);const gt=Z.update(A),Rt=A.material;Rt.visible&&m.push(A,gt,Rt,H,Kt.z,null)}}else if((A.isMesh||A.isLine||A.isPoints)&&(!A.frustumCulled||j.intersectsObject(A))){const gt=Z.update(A),Rt=A.material;if(V&&(A.boundingSphere!==void 0?(A.boundingSphere===null&&A.computeBoundingSphere(),Kt.copy(A.boundingSphere.center)):(gt.boundingSphere===null&&gt.computeBoundingSphere(),Kt.copy(gt.boundingSphere.center)),Kt.applyMatrix4(A.matrixWorld).applyMatrix4(Ot)),Array.isArray(Rt)){const Ct=gt.groups;for(let Wt=0,Yt=Ct.length;Wt<Yt;Wt++){const Lt=Ct[Wt],he=Rt[Lt.materialIndex];he&&he.visible&&m.push(A,gt,he,H,Kt.z,Lt)}}else Rt.visible&&m.push(A,gt,Rt,H,Kt.z,null)}}const at=A.children;for(let gt=0,Rt=at.length;gt<Rt;gt++)kl(at[gt],U,H,V)}function yu(A,U,H,V){const F=A.opaque,at=A.transmissive,gt=A.transparent;g.setupLightsView(H),rt===!0&&ot.setGlobalState(S.clippingPlanes,H),V&&Ut.viewport(N.copy(V)),F.length>0&&Zo(F,U,H),at.length>0&&Zo(at,U,H),gt.length>0&&Zo(gt,U,H),Ut.buffers.depth.setTest(!0),Ut.buffers.depth.setMask(!0),Ut.buffers.color.setMask(!0),Ut.setPolygonOffset(!1)}function Eu(A,U,H,V){if((H.isScene===!0?H.overrideMaterial:null)!==null)return;g.state.transmissionRenderTarget[V.id]===void 0&&(g.state.transmissionRenderTarget[V.id]=new Nn(1,1,{generateMipmaps:!0,type:Qt.has("EXT_color_buffer_half_float")||Qt.has("EXT_color_buffer_float")?vi:ki,minFilter:di,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ce.workingColorSpace}));const at=g.state.transmissionRenderTarget[V.id],gt=V.viewport||N;at.setSize(gt.z,gt.w);const Rt=S.getRenderTarget();S.setRenderTarget(at),S.getClearColor(Y),nt=S.getClearAlpha(),nt<1&&S.setClearColor(16777215,.5),S.clear(),ne&&Ft.render(H);const Ct=S.toneMapping;S.toneMapping=ss;const Wt=V.viewport;if(V.viewport!==void 0&&(V.viewport=void 0),g.setupLightsView(V),rt===!0&&ot.setGlobalState(S.clippingPlanes,V),Zo(A,H,V),R.updateMultisampleRenderTarget(at),R.updateRenderTargetMipmap(at),Qt.has("WEBGL_multisampled_render_to_texture")===!1){let Yt=!1;for(let Lt=0,he=U.length;Lt<he;Lt++){const Ee=U[Lt],Te=Ee.object,gn=Ee.geometry,de=Ee.material,Nt=Ee.group;if(de.side===Mn&&Te.layers.test(V.layers)){const Mi=de.side;de.side=pn,de.needsUpdate=!0,bu(Te,H,V,gn,de,Nt),de.side=Mi,de.needsUpdate=!0,Yt=!0}}Yt===!0&&(R.updateMultisampleRenderTarget(at),R.updateRenderTargetMipmap(at))}S.setRenderTarget(Rt),S.setClearColor(Y,nt),Wt!==void 0&&(V.viewport=Wt),S.toneMapping=Ct}function Zo(A,U,H){const V=U.isScene===!0?U.overrideMaterial:null;for(let F=0,at=A.length;F<at;F++){const gt=A[F],Rt=gt.object,Ct=gt.geometry,Wt=V===null?gt.material:V,Yt=gt.group;Rt.layers.test(H.layers)&&bu(Rt,U,H,Ct,Wt,Yt)}}function bu(A,U,H,V,F,at){A.onBeforeRender(S,U,H,V,F,at),A.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse,A.matrixWorld),A.normalMatrix.getNormalMatrix(A.modelViewMatrix),F.onBeforeRender(S,U,H,V,A,at),F.transparent===!0&&F.side===Mn&&F.forceSinglePass===!1?(F.side=pn,F.needsUpdate=!0,S.renderBufferDirect(H,U,V,F,A,at),F.side=Oi,F.needsUpdate=!0,S.renderBufferDirect(H,U,V,F,A,at),F.side=Mn):S.renderBufferDirect(H,U,V,F,A,at),A.onAfterRender(S,U,H,V,F,at)}function Jo(A,U,H){U.isScene!==!0&&(U=ve);const V=kt.get(A),F=g.state.lights,at=g.state.shadowsArray,gt=F.state.version,Rt=Pt.getParameters(A,F.state,at,U,H),Ct=Pt.getProgramCacheKey(Rt);let Wt=V.programs;V.environment=A.isMeshStandardMaterial?U.environment:null,V.fog=U.fog,V.envMap=(A.isMeshStandardMaterial?B:T).get(A.envMap||V.environment),V.envMapRotation=V.environment!==null&&A.envMap===null?U.environmentRotation:A.envMapRotation,Wt===void 0&&(A.addEventListener("dispose",qt),Wt=new Map,V.programs=Wt);let Yt=Wt.get(Ct);if(Yt!==void 0){if(V.currentProgram===Yt&&V.lightsStateVersion===gt)return Au(A,Rt),Yt}else Rt.uniforms=Pt.getUniforms(A),A.onBeforeCompile(Rt,S),Yt=Pt.acquireProgram(Rt,Ct),Wt.set(Ct,Yt),V.uniforms=Rt.uniforms;const Lt=V.uniforms;return(!A.isShaderMaterial&&!A.isRawShaderMaterial||A.clipping===!0)&&(Lt.clippingPlanes=ot.uniform),Au(A,Rt),V.needsLights=Y0(A),V.lightsStateVersion=gt,V.needsLights&&(Lt.ambientLightColor.value=F.state.ambient,Lt.lightProbe.value=F.state.probe,Lt.directionalLights.value=F.state.directional,Lt.directionalLightShadows.value=F.state.directionalShadow,Lt.spotLights.value=F.state.spot,Lt.spotLightShadows.value=F.state.spotShadow,Lt.rectAreaLights.value=F.state.rectArea,Lt.ltc_1.value=F.state.rectAreaLTC1,Lt.ltc_2.value=F.state.rectAreaLTC2,Lt.pointLights.value=F.state.point,Lt.pointLightShadows.value=F.state.pointShadow,Lt.hemisphereLights.value=F.state.hemi,Lt.directionalShadowMap.value=F.state.directionalShadowMap,Lt.directionalShadowMatrix.value=F.state.directionalShadowMatrix,Lt.spotShadowMap.value=F.state.spotShadowMap,Lt.spotLightMatrix.value=F.state.spotLightMatrix,Lt.spotLightMap.value=F.state.spotLightMap,Lt.pointShadowMap.value=F.state.pointShadowMap,Lt.pointShadowMatrix.value=F.state.pointShadowMatrix),V.currentProgram=Yt,V.uniformsList=null,Yt}function Tu(A){if(A.uniformsList===null){const U=A.currentProgram.getUniforms();A.uniformsList=Ka.seqWithValue(U.seq,A.uniforms)}return A.uniformsList}function Au(A,U){const H=kt.get(A);H.outputColorSpace=U.outputColorSpace,H.batching=U.batching,H.batchingColor=U.batchingColor,H.instancing=U.instancing,H.instancingColor=U.instancingColor,H.instancingMorph=U.instancingMorph,H.skinning=U.skinning,H.morphTargets=U.morphTargets,H.morphNormals=U.morphNormals,H.morphColors=U.morphColors,H.morphTargetsCount=U.morphTargetsCount,H.numClippingPlanes=U.numClippingPlanes,H.numIntersection=U.numClipIntersection,H.vertexAlphas=U.vertexAlphas,H.vertexTangents=U.vertexTangents,H.toneMapping=U.toneMapping}function $0(A,U,H,V,F){U.isScene!==!0&&(U=ve),R.resetTextureUnits();const at=U.fog,gt=V.isMeshStandardMaterial?U.environment:null,Rt=L===null?S.outputColorSpace:L.isXRRenderTarget===!0?L.texture.colorSpace:Or,Ct=(V.isMeshStandardMaterial?B:T).get(V.envMap||gt),Wt=V.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,Yt=!!H.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),Lt=!!H.morphAttributes.position,he=!!H.morphAttributes.normal,Ee=!!H.morphAttributes.color;let Te=ss;V.toneMapped&&(L===null||L.isXRRenderTarget===!0)&&(Te=S.toneMapping);const gn=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,de=gn!==void 0?gn.length:0,Nt=kt.get(V),Mi=g.state.lights;if(rt===!0&&(wt===!0||A!==b)){const In=A===b&&V.id===E;ot.setState(V,A,In)}let pe=!1;V.version===Nt.__version?(Nt.needsLights&&Nt.lightsStateVersion!==Mi.state.version||Nt.outputColorSpace!==Rt||F.isBatchedMesh&&Nt.batching===!1||!F.isBatchedMesh&&Nt.batching===!0||F.isBatchedMesh&&Nt.batchingColor===!0&&F.colorTexture===null||F.isBatchedMesh&&Nt.batchingColor===!1&&F.colorTexture!==null||F.isInstancedMesh&&Nt.instancing===!1||!F.isInstancedMesh&&Nt.instancing===!0||F.isSkinnedMesh&&Nt.skinning===!1||!F.isSkinnedMesh&&Nt.skinning===!0||F.isInstancedMesh&&Nt.instancingColor===!0&&F.instanceColor===null||F.isInstancedMesh&&Nt.instancingColor===!1&&F.instanceColor!==null||F.isInstancedMesh&&Nt.instancingMorph===!0&&F.morphTexture===null||F.isInstancedMesh&&Nt.instancingMorph===!1&&F.morphTexture!==null||Nt.envMap!==Ct||V.fog===!0&&Nt.fog!==at||Nt.numClippingPlanes!==void 0&&(Nt.numClippingPlanes!==ot.numPlanes||Nt.numIntersection!==ot.numIntersection)||Nt.vertexAlphas!==Wt||Nt.vertexTangents!==Yt||Nt.morphTargets!==Lt||Nt.morphNormals!==he||Nt.morphColors!==Ee||Nt.toneMapping!==Te||Nt.morphTargetsCount!==de)&&(pe=!0):(pe=!0,Nt.__version=V.version);let qn=Nt.currentProgram;pe===!0&&(qn=Jo(V,U,F));let Xs=!1,Tn=!1,Gr=!1;const Ae=qn.getUniforms(),ai=Nt.uniforms;if(Ut.useProgram(qn.program)&&(Xs=!0,Tn=!0,Gr=!0),V.id!==E&&(E=V.id,Tn=!0),Xs||b!==A){Ut.buffers.depth.getReversed()?(lt.copy(A.projectionMatrix),Hm(lt),Vm(lt),Ae.setValue(z,"projectionMatrix",lt)):Ae.setValue(z,"projectionMatrix",A.projectionMatrix),Ae.setValue(z,"viewMatrix",A.matrixWorldInverse);const Vi=Ae.map.cameraPosition;Vi!==void 0&&Vi.setValue(z,Ht.setFromMatrixPosition(A.matrixWorld)),re.logarithmicDepthBuffer&&Ae.setValue(z,"logDepthBufFC",2/(Math.log(A.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&Ae.setValue(z,"isOrthographic",A.isOrthographicCamera===!0),b!==A&&(b=A,Tn=!0,Gr=!0)}if(F.isSkinnedMesh){Ae.setOptional(z,F,"bindMatrix"),Ae.setOptional(z,F,"bindMatrixInverse");const In=F.skeleton;In&&(In.boneTexture===null&&In.computeBoneTexture(),Ae.setValue(z,"boneTexture",In.boneTexture,R))}F.isBatchedMesh&&(Ae.setOptional(z,F,"batchingTexture"),Ae.setValue(z,"batchingTexture",F._matricesTexture,R),Ae.setOptional(z,F,"batchingIdTexture"),Ae.setValue(z,"batchingIdTexture",F._indirectTexture,R),Ae.setOptional(z,F,"batchingColorTexture"),F._colorsTexture!==null&&Ae.setValue(z,"batchingColorTexture",F._colorsTexture,R));const Kr=H.morphAttributes;if((Kr.position!==void 0||Kr.normal!==void 0||Kr.color!==void 0)&&Vt.update(F,H,qn),(Tn||Nt.receiveShadow!==F.receiveShadow)&&(Nt.receiveShadow=F.receiveShadow,Ae.setValue(z,"receiveShadow",F.receiveShadow)),V.isMeshGouraudMaterial&&V.envMap!==null&&(ai.envMap.value=Ct,ai.flipEnvMap.value=Ct.isCubeTexture&&Ct.isRenderTargetTexture===!1?-1:1),V.isMeshStandardMaterial&&V.envMap===null&&U.environment!==null&&(ai.envMapIntensity.value=U.environmentIntensity),Tn&&(Ae.setValue(z,"toneMappingExposure",S.toneMappingExposure),Nt.needsLights&&q0(ai,Gr),at&&V.fog===!0&&pt.refreshFogUniforms(ai,at),pt.refreshMaterialUniforms(ai,V,G,it,g.state.transmissionRenderTarget[A.id]),Ka.upload(z,Tu(Nt),ai,R)),V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(Ka.upload(z,Tu(Nt),ai,R),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&Ae.setValue(z,"center",F.center),Ae.setValue(z,"modelViewMatrix",F.modelViewMatrix),Ae.setValue(z,"normalMatrix",F.normalMatrix),Ae.setValue(z,"modelMatrix",F.matrixWorld),V.isShaderMaterial||V.isRawShaderMaterial){const In=V.uniformsGroups;for(let Vi=0,Wi=In.length;Vi<Wi;Vi++){const wu=In[Vi];k.update(wu,qn),k.bind(wu,qn)}}return qn}function q0(A,U){A.ambientLightColor.needsUpdate=U,A.lightProbe.needsUpdate=U,A.directionalLights.needsUpdate=U,A.directionalLightShadows.needsUpdate=U,A.pointLights.needsUpdate=U,A.pointLightShadows.needsUpdate=U,A.spotLights.needsUpdate=U,A.spotLightShadows.needsUpdate=U,A.rectAreaLights.needsUpdate=U,A.hemisphereLights.needsUpdate=U}function Y0(A){return A.isMeshLambertMaterial||A.isMeshToonMaterial||A.isMeshPhongMaterial||A.isMeshStandardMaterial||A.isShadowMaterial||A.isShaderMaterial&&A.lights===!0}this.getActiveCubeFace=function(){return y},this.getActiveMipmapLevel=function(){return w},this.getRenderTarget=function(){return L},this.setRenderTargetTextures=function(A,U,H){kt.get(A.texture).__webglTexture=U,kt.get(A.depthTexture).__webglTexture=H;const V=kt.get(A);V.__hasExternalTextures=!0,V.__autoAllocateDepthBuffer=H===void 0,V.__autoAllocateDepthBuffer||Qt.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),V.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(A,U){const H=kt.get(A);H.__webglFramebuffer=U,H.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(A,U=0,H=0){L=A,y=U,w=H;let V=!0,F=null,at=!1,gt=!1;if(A){const Ct=kt.get(A);if(Ct.__useDefaultFramebuffer!==void 0)Ut.bindFramebuffer(z.FRAMEBUFFER,null),V=!1;else if(Ct.__webglFramebuffer===void 0)R.setupRenderTarget(A);else if(Ct.__hasExternalTextures)R.rebindTextures(A,kt.get(A.texture).__webglTexture,kt.get(A.depthTexture).__webglTexture);else if(A.depthBuffer){const Lt=A.depthTexture;if(Ct.__boundDepthTexture!==Lt){if(Lt!==null&&kt.has(Lt)&&(A.width!==Lt.image.width||A.height!==Lt.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");R.setupDepthRenderbuffer(A)}}const Wt=A.texture;(Wt.isData3DTexture||Wt.isDataArrayTexture||Wt.isCompressedArrayTexture)&&(gt=!0);const Yt=kt.get(A).__webglFramebuffer;A.isWebGLCubeRenderTarget?(Array.isArray(Yt[U])?F=Yt[U][H]:F=Yt[U],at=!0):A.samples>0&&R.useMultisampledRTT(A)===!1?F=kt.get(A).__webglMultisampledFramebuffer:Array.isArray(Yt)?F=Yt[H]:F=Yt,N.copy(A.viewport),X.copy(A.scissor),W=A.scissorTest}else N.copy(Dt).multiplyScalar(G).floor(),X.copy($t).multiplyScalar(G).floor(),W=fe;if(Ut.bindFramebuffer(z.FRAMEBUFFER,F)&&V&&Ut.drawBuffers(A,F),Ut.viewport(N),Ut.scissor(X),Ut.setScissorTest(W),at){const Ct=kt.get(A.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_CUBE_MAP_POSITIVE_X+U,Ct.__webglTexture,H)}else if(gt){const Ct=kt.get(A.texture),Wt=U||0;z.framebufferTextureLayer(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,Ct.__webglTexture,H||0,Wt)}E=-1},this.readRenderTargetPixels=function(A,U,H,V,F,at,gt){if(!(A&&A.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Rt=kt.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&gt!==void 0&&(Rt=Rt[gt]),Rt){Ut.bindFramebuffer(z.FRAMEBUFFER,Rt);try{const Ct=A.texture,Wt=Ct.format,Yt=Ct.type;if(!re.textureFormatReadable(Wt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!re.textureTypeReadable(Yt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=A.width-V&&H>=0&&H<=A.height-F&&z.readPixels(U,H,V,F,Zt.convert(Wt),Zt.convert(Yt),at)}finally{const Ct=L!==null?kt.get(L).__webglFramebuffer:null;Ut.bindFramebuffer(z.FRAMEBUFFER,Ct)}}},this.readRenderTargetPixelsAsync=async function(A,U,H,V,F,at,gt){if(!(A&&A.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Rt=kt.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&gt!==void 0&&(Rt=Rt[gt]),Rt){const Ct=A.texture,Wt=Ct.format,Yt=Ct.type;if(!re.textureFormatReadable(Wt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!re.textureTypeReadable(Yt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(U>=0&&U<=A.width-V&&H>=0&&H<=A.height-F){Ut.bindFramebuffer(z.FRAMEBUFFER,Rt);const Lt=z.createBuffer();z.bindBuffer(z.PIXEL_PACK_BUFFER,Lt),z.bufferData(z.PIXEL_PACK_BUFFER,at.byteLength,z.STREAM_READ),z.readPixels(U,H,V,F,Zt.convert(Wt),Zt.convert(Yt),0);const he=L!==null?kt.get(L).__webglFramebuffer:null;Ut.bindFramebuffer(z.FRAMEBUFFER,he);const Ee=z.fenceSync(z.SYNC_GPU_COMMANDS_COMPLETE,0);return z.flush(),await Bm(z,Ee,4),z.bindBuffer(z.PIXEL_PACK_BUFFER,Lt),z.getBufferSubData(z.PIXEL_PACK_BUFFER,0,at),z.deleteBuffer(Lt),z.deleteSync(Ee),at}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(A,U=null,H=0){A.isTexture!==!0&&(mo("WebGLRenderer: copyFramebufferToTexture function signature has changed."),U=arguments[0]||null,A=arguments[1]);const V=Math.pow(2,-H),F=Math.floor(A.image.width*V),at=Math.floor(A.image.height*V),gt=U!==null?U.x:0,Rt=U!==null?U.y:0;R.setTexture2D(A,0),z.copyTexSubImage2D(z.TEXTURE_2D,H,0,0,gt,Rt,F,at),Ut.unbindTexture()},this.copyTextureToTexture=function(A,U,H=null,V=null,F=0){A.isTexture!==!0&&(mo("WebGLRenderer: copyTextureToTexture function signature has changed."),V=arguments[0]||null,A=arguments[1],U=arguments[2],F=arguments[3]||0,H=null);let at,gt,Rt,Ct,Wt,Yt,Lt,he,Ee;const Te=A.isCompressedTexture?A.mipmaps[F]:A.image;H!==null?(at=H.max.x-H.min.x,gt=H.max.y-H.min.y,Rt=H.isBox3?H.max.z-H.min.z:1,Ct=H.min.x,Wt=H.min.y,Yt=H.isBox3?H.min.z:0):(at=Te.width,gt=Te.height,Rt=Te.depth||1,Ct=0,Wt=0,Yt=0),V!==null?(Lt=V.x,he=V.y,Ee=V.z):(Lt=0,he=0,Ee=0);const gn=Zt.convert(U.format),de=Zt.convert(U.type);let Nt;U.isData3DTexture?(R.setTexture3D(U,0),Nt=z.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(R.setTexture2DArray(U,0),Nt=z.TEXTURE_2D_ARRAY):(R.setTexture2D(U,0),Nt=z.TEXTURE_2D),z.pixelStorei(z.UNPACK_FLIP_Y_WEBGL,U.flipY),z.pixelStorei(z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),z.pixelStorei(z.UNPACK_ALIGNMENT,U.unpackAlignment);const Mi=z.getParameter(z.UNPACK_ROW_LENGTH),pe=z.getParameter(z.UNPACK_IMAGE_HEIGHT),qn=z.getParameter(z.UNPACK_SKIP_PIXELS),Xs=z.getParameter(z.UNPACK_SKIP_ROWS),Tn=z.getParameter(z.UNPACK_SKIP_IMAGES);z.pixelStorei(z.UNPACK_ROW_LENGTH,Te.width),z.pixelStorei(z.UNPACK_IMAGE_HEIGHT,Te.height),z.pixelStorei(z.UNPACK_SKIP_PIXELS,Ct),z.pixelStorei(z.UNPACK_SKIP_ROWS,Wt),z.pixelStorei(z.UNPACK_SKIP_IMAGES,Yt);const Gr=A.isDataArrayTexture||A.isData3DTexture,Ae=U.isDataArrayTexture||U.isData3DTexture;if(A.isRenderTargetTexture||A.isDepthTexture){const ai=kt.get(A),Kr=kt.get(U),In=kt.get(ai.__renderTarget),Vi=kt.get(Kr.__renderTarget);Ut.bindFramebuffer(z.READ_FRAMEBUFFER,In.__webglFramebuffer),Ut.bindFramebuffer(z.DRAW_FRAMEBUFFER,Vi.__webglFramebuffer);for(let Wi=0;Wi<Rt;Wi++)Gr&&z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,kt.get(A).__webglTexture,F,Yt+Wi),A.isDepthTexture?(Ae&&z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,kt.get(U).__webglTexture,F,Ee+Wi),z.blitFramebuffer(Ct,Wt,at,gt,Lt,he,at,gt,z.DEPTH_BUFFER_BIT,z.NEAREST)):Ae?z.copyTexSubImage3D(Nt,F,Lt,he,Ee+Wi,Ct,Wt,at,gt):z.copyTexSubImage2D(Nt,F,Lt,he,Ee+Wi,Ct,Wt,at,gt);Ut.bindFramebuffer(z.READ_FRAMEBUFFER,null),Ut.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else Ae?A.isDataTexture||A.isData3DTexture?z.texSubImage3D(Nt,F,Lt,he,Ee,at,gt,Rt,gn,de,Te.data):U.isCompressedArrayTexture?z.compressedTexSubImage3D(Nt,F,Lt,he,Ee,at,gt,Rt,gn,Te.data):z.texSubImage3D(Nt,F,Lt,he,Ee,at,gt,Rt,gn,de,Te):A.isDataTexture?z.texSubImage2D(z.TEXTURE_2D,F,Lt,he,at,gt,gn,de,Te.data):A.isCompressedTexture?z.compressedTexSubImage2D(z.TEXTURE_2D,F,Lt,he,Te.width,Te.height,gn,Te.data):z.texSubImage2D(z.TEXTURE_2D,F,Lt,he,at,gt,gn,de,Te);z.pixelStorei(z.UNPACK_ROW_LENGTH,Mi),z.pixelStorei(z.UNPACK_IMAGE_HEIGHT,pe),z.pixelStorei(z.UNPACK_SKIP_PIXELS,qn),z.pixelStorei(z.UNPACK_SKIP_ROWS,Xs),z.pixelStorei(z.UNPACK_SKIP_IMAGES,Tn),F===0&&U.generateMipmaps&&z.generateMipmap(Nt),Ut.unbindTexture()},this.copyTextureToTexture3D=function(A,U,H=null,V=null,F=0){return A.isTexture!==!0&&(mo("WebGLRenderer: copyTextureToTexture3D function signature has changed."),H=arguments[0]||null,V=arguments[1]||null,A=arguments[2],U=arguments[3],F=arguments[4]||0),mo('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(A,U,H,V,F)},this.initRenderTarget=function(A){kt.get(A).__webglFramebuffer===void 0&&R.setupRenderTarget(A)},this.initTexture=function(A){A.isCubeTexture?R.setTextureCube(A,0):A.isData3DTexture?R.setTexture3D(A,0):A.isDataArrayTexture||A.isCompressedArrayTexture?R.setTexture2DArray(A,0):R.setTexture2D(A,0),Ut.unbindTexture()},this.resetState=function(){y=0,w=0,L=null,Ut.reset(),ye.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Ci}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorspace=ce._getDrawingBufferColorSpace(t),e.unpackColorSpace=ce._getUnpackColorSpace()}}class Z_ extends sn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ui,this.environmentIntensity=1,this.environmentRotation=new Ui,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class J_{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=vh,this.updateRanges=[],this.version=0,this.uuid=rs()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let s=0,r=this.stride;s<r;s++)this.array[t+s]=e.array[n+s];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=rs()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){return t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=rs()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const an=new O;class el{constructor(t,e,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)an.fromBufferAttribute(this,e),an.applyMatrix4(t),this.setXYZ(e,an.x,an.y,an.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)an.fromBufferAttribute(this,e),an.applyNormalMatrix(t),this.setXYZ(e,an.x,an.y,an.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)an.fromBufferAttribute(this,e),an.transformDirection(t),this.setXYZ(e,an.x,an.y,an.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=fi(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Me(n,this.array)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=Me(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=Me(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=Me(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=Me(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=fi(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=fi(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=fi(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=fi(e,this.array)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=Me(e,this.array),n=Me(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,s){return t=t*this.data.stride+this.offset,this.normalized&&(e=Me(e,this.array),n=Me(n,this.array),s=Me(s,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=Me(e,this.array),n=Me(n,this.array),s=Me(s,this.array),r=Me(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this.data.array[t+3]=r,this}clone(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return new we(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new el(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class gp extends Hs{static get type(){return"SpriteMaterial"}constructor(t){super(),this.isSpriteMaterial=!0,this.color=new se(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}let ar;const jr=new O,lr=new O,cr=new O,hr=new zt,Zr=new zt,vp=new ge,Ma=new O,Jr=new O,Sa=new O,Tf=new zt,fc=new zt,Af=new zt;class Q_ extends sn{constructor(t=new gp){if(super(),this.isSprite=!0,this.type="Sprite",ar===void 0){ar=new ke;const e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new J_(e,5);ar.setIndex([0,1,2,0,2,3]),ar.setAttribute("position",new el(n,3,0,!1)),ar.setAttribute("uv",new el(n,2,3,!1))}this.geometry=ar,this.material=t,this.center=new zt(.5,.5)}raycast(t,e){t.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),lr.setFromMatrixScale(this.matrixWorld),vp.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),cr.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&lr.multiplyScalar(-cr.z);const n=this.material.rotation;let s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));const o=this.center;ya(Ma.set(-.5,-.5,0),cr,o,lr,s,r),ya(Jr.set(.5,-.5,0),cr,o,lr,s,r),ya(Sa.set(.5,.5,0),cr,o,lr,s,r),Tf.set(0,0),fc.set(1,0),Af.set(1,1);let a=t.ray.intersectTriangle(Ma,Jr,Sa,!1,jr);if(a===null&&(ya(Jr.set(-.5,.5,0),cr,o,lr,s,r),fc.set(0,1),a=t.ray.intersectTriangle(Ma,Sa,Jr,!1,jr),a===null))return;const l=t.ray.origin.distanceTo(jr);l<t.near||l>t.far||e.push({distance:l,point:jr.clone(),uv:Dn.getInterpolation(jr,Ma,Jr,Sa,Tf,fc,Af,new zt),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}}function ya(i,t,e,n,s,r){hr.subVectors(i,e).addScalar(.5).multiply(n),s!==void 0?(Zr.x=r*hr.x-s*hr.y,Zr.y=s*hr.x+r*hr.y):Zr.copy(hr),i.copy(t),i.x+=Zr.x,i.y+=Zr.y,i.applyMatrix4(vp)}class xp extends Ye{constructor(t=null,e=1,n=1,s,r,o,a,l,c=nn,h=nn,f,u){super(null,o,a,l,c,h,s,r,f,u),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class wf extends we{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){const t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}const ur=new ge,Rf=new ge,Ea=[],Cf=new Bs,tM=new ge,Qr=new Re,to=new fs;class _p extends Re{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new wf(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,tM)}computeBoundingBox(){const t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new Bs),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,ur),Cf.copy(t.boundingBox).applyMatrix4(ur),this.boundingBox.union(Cf)}computeBoundingSphere(){const t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new fs),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,ur),to.copy(t.boundingSphere).applyMatrix4(ur),this.boundingSphere.union(to)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){const n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=t*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(t,e){const n=this.matrixWorld,s=this.count;if(Qr.geometry=this.geometry,Qr.material=this.material,Qr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),to.copy(this.boundingSphere),to.applyMatrix4(n),t.ray.intersectsSphere(to)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,ur),Rf.multiplyMatrices(n,ur),Qr.matrixWorld=Rf,Qr.raycast(t,Ea);for(let o=0,a=Ea.length;o<a;o++){const l=Ea[o];l.instanceId=r,l.object=this,e.push(l)}Ea.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new wf(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){const n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new xp(new Float32Array(s*this.count),s,this.count,Hh,pi));const r=this.morphTexture.source.data.data;let o=0;for(let c=0;c<n.length;c++)o+=n[c];const a=this.geometry.morphTargetsRelative?1:1-o,l=s*t;r[l]=a,r.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class vo extends Hs{static get type(){return"LineBasicMaterial"}constructor(t){super(),this.isLineBasicMaterial=!0,this.color=new se(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const nl=new O,il=new O,Lf=new ge,eo=new Kh,ba=new fs,dc=new O,Df=new O;class Mh extends sn{constructor(t=new ke,e=new vo){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[0];for(let s=1,r=e.count;s<r;s++)nl.fromBufferAttribute(e,s-1),il.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=nl.distanceTo(il);t.setAttribute("lineDistance",new We(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){const n=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ba.copy(n.boundingSphere),ba.applyMatrix4(s),ba.radius+=r,t.ray.intersectsSphere(ba)===!1)return;Lf.copy(s).invert(),eo.copy(t.ray).applyMatrix4(Lf);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,h=n.index,u=n.attributes.position;if(h!==null){const p=Math.max(0,o.start),x=Math.min(h.count,o.start+o.count);for(let v=p,m=x-1;v<m;v+=c){const g=h.getX(v),_=h.getX(v+1),M=Ta(this,t,eo,l,g,_);M&&e.push(M)}if(this.isLineLoop){const v=h.getX(x-1),m=h.getX(p),g=Ta(this,t,eo,l,v,m);g&&e.push(g)}}else{const p=Math.max(0,o.start),x=Math.min(u.count,o.start+o.count);for(let v=p,m=x-1;v<m;v+=c){const g=Ta(this,t,eo,l,v,v+1);g&&e.push(g)}if(this.isLineLoop){const v=Ta(this,t,eo,l,x-1,p);v&&e.push(v)}}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function Ta(i,t,e,n,s,r){const o=i.geometry.attributes.position;if(nl.fromBufferAttribute(o,s),il.fromBufferAttribute(o,r),e.distanceSqToSegment(nl,il,dc,Df)>n)return;dc.applyMatrix4(i.matrixWorld);const l=t.ray.origin.distanceTo(dc);if(!(l<t.near||l>t.far))return{distance:l,point:Df.clone().applyMatrix4(i.matrixWorld),index:s,face:null,faceIndex:null,barycoord:null,object:i}}const Pf=new O,Nf=new O;class If extends Mh{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[];for(let s=0,r=e.count;s<r;s+=2)Pf.fromBufferAttribute(e,s),Nf.fromBufferAttribute(e,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Pf.distanceTo(Nf);t.setAttribute("lineDistance",new We(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Mp extends Hs{static get type(){return"PointsMaterial"}constructor(t){super(),this.isPointsMaterial=!0,this.color=new se(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}const Of=new ge,Sh=new Kh,Aa=new fs,wa=new O;class eM extends sn{constructor(t=new ke,e=new Mp){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){const n=this.geometry,s=this.matrixWorld,r=t.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Aa.copy(n.boundingSphere),Aa.applyMatrix4(s),Aa.radius+=r,t.ray.intersectsSphere(Aa)===!1)return;Of.copy(s).invert(),Sh.copy(t.ray).applyMatrix4(Of);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,f=n.attributes.position;if(c!==null){const u=Math.max(0,o.start),p=Math.min(c.count,o.start+o.count);for(let x=u,v=p;x<v;x++){const m=c.getX(x);wa.fromBufferAttribute(f,m),kf(wa,m,l,s,t,e,this)}}else{const u=Math.max(0,o.start),p=Math.min(f.count,o.start+o.count);for(let x=u,v=p;x<v;x++)wa.fromBufferAttribute(f,x),kf(wa,x,l,s,t,e,this)}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function kf(i,t,e,n,s,r,o){const a=Sh.distanceSqToPoint(i);if(a<e){const l=new O;Sh.closestPointToPoint(i,l),l.applyMatrix4(n);const c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}class Xa extends Ye{constructor(t,e,n,s,r,o,a,l,c){super(t,e,n,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}const Ra=new O,Ca=new O,pc=new O,La=new Dn;class nM extends ke{constructor(t=null,e=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:t,thresholdAngle:e},t!==null){const s=Math.pow(10,4),r=Math.cos(Ga*e),o=t.getIndex(),a=t.getAttribute("position"),l=o?o.count:a.count,c=[0,0,0],h=["a","b","c"],f=new Array(3),u={},p=[];for(let x=0;x<l;x+=3){o?(c[0]=o.getX(x),c[1]=o.getX(x+1),c[2]=o.getX(x+2)):(c[0]=x,c[1]=x+1,c[2]=x+2);const{a:v,b:m,c:g}=La;if(v.fromBufferAttribute(a,c[0]),m.fromBufferAttribute(a,c[1]),g.fromBufferAttribute(a,c[2]),La.getNormal(pc),f[0]=`${Math.round(v.x*s)},${Math.round(v.y*s)},${Math.round(v.z*s)}`,f[1]=`${Math.round(m.x*s)},${Math.round(m.y*s)},${Math.round(m.z*s)}`,f[2]=`${Math.round(g.x*s)},${Math.round(g.y*s)},${Math.round(g.z*s)}`,!(f[0]===f[1]||f[1]===f[2]||f[2]===f[0]))for(let _=0;_<3;_++){const M=(_+1)%3,S=f[_],C=f[M],y=La[h[_]],w=La[h[M]],L=`${S}_${C}`,E=`${C}_${S}`;E in u&&u[E]?(pc.dot(u[E].normal)<=r&&(p.push(y.x,y.y,y.z),p.push(w.x,w.y,w.z)),u[E]=null):L in u||(u[L]={index0:c[_],index1:c[M],normal:pc.clone()})}}for(const x in u)if(u[x]){const{index0:v,index1:m}=u[x];Ra.fromBufferAttribute(a,v),Ca.fromBufferAttribute(a,m),p.push(Ra.x,Ra.y,Ra.z),p.push(Ca.x,Ca.y,Ca.z)}this.setAttribute("position",new We(p,3))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}}class Zh extends ke{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const l=Math.min(o+a,Math.PI);let c=0;const h=[],f=new O,u=new O,p=[],x=[],v=[],m=[];for(let g=0;g<=n;g++){const _=[],M=g/n;let S=0;g===0&&o===0?S=.5/e:g===n&&l===Math.PI&&(S=-.5/e);for(let C=0;C<=e;C++){const y=C/e;f.x=-t*Math.cos(s+y*r)*Math.sin(o+M*a),f.y=t*Math.cos(o+M*a),f.z=t*Math.sin(s+y*r)*Math.sin(o+M*a),x.push(f.x,f.y,f.z),u.copy(f).normalize(),v.push(u.x,u.y,u.z),m.push(y+S,1-M),_.push(c++)}h.push(_)}for(let g=0;g<n;g++)for(let _=0;_<e;_++){const M=h[g][_+1],S=h[g][_],C=h[g+1][_],y=h[g+1][_+1];(g!==0||o>0)&&p.push(M,S,y),(g!==n-1||l<Math.PI)&&p.push(S,C,y)}this.setIndex(p),this.setAttribute("position",new We(x,3)),this.setAttribute("normal",new We(v,3)),this.setAttribute("uv",new We(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Zh(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}const Uf={enabled:!1,files:{},add:function(i,t){this.enabled!==!1&&(this.files[i]=t)},get:function(i){if(this.enabled!==!1)return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};class iM{constructor(t,e,n){const s=this;let r=!1,o=0,a=0,l;const c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this.itemStart=function(h){a++,r===!1&&s.onStart!==void 0&&s.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,s.onProgress!==void 0&&s.onProgress(h,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,f){return c.push(h,f),this},this.removeHandler=function(h){const f=c.indexOf(h);return f!==-1&&c.splice(f,2),this},this.getHandler=function(h){for(let f=0,u=c.length;f<u;f+=2){const p=c[f],x=c[f+1];if(p.global&&(p.lastIndex=0),p.test(h))return x}return null}}}const sM=new iM;class Jh{constructor(t){this.manager=t!==void 0?t:sM,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(t,e){const n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}}Jh.DEFAULT_MATERIAL_NAME="__DEFAULT";class rM extends Jh{constructor(t){super(t)}load(t,e,n,s){this.path!==void 0&&(t=this.path+t),t=this.manager.resolveURL(t);const r=this,o=Uf.get(t);if(o!==void 0)return r.manager.itemStart(t),setTimeout(function(){e&&e(o),r.manager.itemEnd(t)},0),o;const a=Po("img");function l(){h(),Uf.add(t,this),e&&e(this),r.manager.itemEnd(t)}function c(f){h(),s&&s(f),r.manager.itemError(t),r.manager.itemEnd(t)}function h(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),t.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),r.manager.itemStart(t),a.src=t,a}}class oM extends Jh{constructor(t){super(t)}load(t,e,n,s){const r=new Ye,o=new rM(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(t,function(a){r.image=a,r.needsUpdate=!0,e!==void 0&&e(r)},n,s),r}}class aM{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=zf(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const e=zf();t=(e-this.oldTime)/1e3,this.oldTime=e,this.elapsedTime+=t}return t}}function zf(){return performance.now()}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Uh}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Uh);const xi=11,Qh=16,yh=27,Sp=11,lM=["RicoReWi","YourTime-FM","RapRadio 24","SchlagerPop 24","ChartRadio 24","ClubRadio 24","AnMaCha 24","RadioFloh!","RockRadio 24","ChristmasRadio","KultRadio 24","Zocker-FM","Special-Radio","AnMaChaCast","SenderWelt","RadioPortal"],cM=[{id:"natur",name:"Natur"},{id:"erz",name:"Erze & Steine"},{id:"bau",name:"Bauen"},{id:"form",name:"Formen"},{id:"deko",name:"Deko"},{id:"licht",name:"Licht"},{id:"spezial",name:"Spezial"},{id:"technik",name:"Funktechnik"},{id:"funk",name:"Funk-Logos"}],Wn=[[0,"AIR","Luft","",null,{solid:0,opaque:0,inv:0}],[1,"GRASS","Gras","natur",[0,1,2],{hard:.6,tool:"schaufel",color:5808188,map:[88,160,60],icon:1}],[2,"DIRT","Erde","natur",[2,2,2],{hard:.5,tool:"schaufel",color:8806463,map:[134,96,63],icon:2}],[3,"STONE","Stein","erz",[3,3,3],{hard:1.5,tool:"spitzhacke",color:8158336,map:[124,124,128],icon:3}],[4,"SAND","Sand","natur",[4,4,4],{hard:.5,tool:"schaufel",color:14404494,map:[219,203,142],icon:4}],[5,"WOOD","Holz","natur",[6,5,6],{hard:1,tool:"axt",color:6836270,map:[104,80,46],icon:5}],[6,"LEAVES","Blätter","natur",[7,7,7],{opaque:0,self:1,hard:.2,color:3833904,map:[46,120,44],icon:7}],[7,"PLANKS","Bretter","bau",[8,8,8],{hard:1,tool:"axt",color:11306578,map:[172,134,82],icon:8}],[8,"GLASS","Glas","bau",[9,9,9],{opaque:0,trans:1,hard:.3,color:13625584,map:[200,230,240],icon:9}],[9,"LAMP","Leuchtblock","licht",[10,10,10],{emit:1,hard:.3,color:16767098,map:[255,214,120],icon:10}],[10,"WATER","Wasser","",[11,11,11],{solid:0,opaque:0,trans:1,inv:0,map:[44,100,200]}],[27,"FEDER","Federblock","spezial",[12,13,13],{hard:.5,color:16738976,map:[255,100,160],icon:12}],[28,"TURBO","Turbo-Block","spezial",[14,15,15],{hard:.8,color:16766504,map:[255,214,40],icon:14}],[29,"WIND","Aufwind-Block","spezial",[16,17,17],{hard:.5,color:5294318,map:[80,200,235],icon:16}],[30,"RADIO","Radio-Block","spezial",[19,18,19],{hard:.5,color:3817034,map:[60,64,76],icon:18}],[31,"RAINBOW","Regenbogen-Block","licht",[20,20,20],{emit:2,hard:.5,color:14509823,map:[220,100,255],icon:20}],[32,"NEON_R","Neonrot","licht",[21,21,21],{emit:1,hard:.3,color:16721990,map:[255,40,70],icon:21}],[33,"NEON_B","Neonblau","licht",[22,22,22],{emit:1,hard:.3,color:2657535,map:[40,140,255],icon:22}],[34,"NEON_G","Neongrün","licht",[23,23,23],{emit:1,hard:.3,color:3342200,map:[50,255,120],icon:23}],[35,"NEON_P","Neonlila","licht",[24,24,24],{emit:1,hard:.3,color:12470015,map:[190,70,255],icon:24}],[36,"BRICK","Ziegel","bau",[25,25,25],{hard:1.5,tool:"spitzhacke",color:10111544,map:[154,74,56],icon:25}],[37,"MARBLE","Marmor","bau",[26,26,26],{hard:1.5,tool:"spitzhacke",color:15132398,map:[232,232,240],icon:26}],[38,"SNOW","Schnee","natur",[27,28,2],{hard:.4,tool:"schaufel",color:15922938,map:[240,246,250],icon:27}],[39,"ICE","Eis","natur",[29,29,29],{hard:.6,tool:"spitzhacke",color:11064560,map:[168,212,240],icon:29}],[40,"GRAVEL","Kies","erz",[30,30,30],{hard:.6,tool:"schaufel",color:9078402,map:[138,134,130],icon:30}],[41,"CLAY","Ton","natur",[31,31,31],{hard:.6,tool:"schaufel",color:10134708,map:[154,164,180],icon:31}],[42,"SPRUCE","Fichtenholz","natur",[33,32,33],{hard:1,tool:"axt",color:4863008,map:[74,52,32],icon:32}],[43,"NEEDLES","Fichtennadeln","natur",[34,34,34],{opaque:0,self:1,hard:.2,color:2775606,map:[36,84,50],icon:34}],[44,"CACTUS","Kaktus","natur",[36,35,36],{hard:.4,color:3967546,map:[60,138,58],icon:35}],[45,"COAL","Kohleerz","erz",[37,37,37],{hard:2,tool:"spitzhacke",color:3816e3,map:[70,70,78],icon:37,tier:1}],[46,"COPPER","Kupfererz","erz",[38,38,38],{hard:2.2,tool:"spitzhacke",color:13136956,map:[200,116,60],icon:38,tier:1}],[47,"IRON","Eisenerz","erz",[39,39,39],{hard:2.6,tool:"spitzhacke",color:13150344,map:[200,168,136],icon:39,tier:2}],[48,"CRYSTAL","Funkkristall","erz",[40,40,40],{emit:1,hard:2.4,tool:"spitzhacke",color:7006463,map:[106,232,255],icon:40,tier:2}],[49,"MUD","Schlamm","natur",[41,41,41],{hard:.5,tool:"schaufel",color:5128756,map:[78,66,52],icon:41}],[50,"FLOWERS","Blütenwiese","natur",[42,1,2],{hard:.6,tool:"schaufel",color:6991946,map:[150,170,90],icon:42}],[51,"BASALT","Basalt","erz",[43,43,43],{hard:1.8,tool:"spitzhacke",color:3421242,map:[52,52,58],icon:43}],[52,"MAGMA","Magma","erz",[44,44,44],{emit:1,hard:1.2,tool:"spitzhacke",color:16738842,map:[255,106,26],icon:44}],[53,"SHROOM","Pilzhut","natur",[45,45,45],{hard:.3,color:13122106,map:[200,58,58],icon:45}],[54,"MYCEL","Pilzboden","natur",[46,47,2],{hard:.6,tool:"schaufel",color:8022656,map:[122,106,128],icon:46}],[55,"SANDSTONE","Sandstein","bau",[48,48,48],{hard:1.2,tool:"spitzhacke",color:14205066,map:[216,192,138],icon:48}],[56,"STEM","Pilzstiel","natur",[49,49,49],{hard:.6,tool:"axt",color:15261904,map:[232,224,208],icon:49}],[57,"JLEAVES","Dschungelblätter","natur",[50,50,50],{opaque:0,self:1,hard:.2,color:3050020,map:[40,130,34],icon:50}],[58,"WORKBENCH","Werkbank","bau",[51,52,8],{hard:1.2,tool:"axt",color:10122308,map:[150,112,66],icon:51,station:"werkbank"}],[59,"FURNACE","Schmelzofen","bau",[54,53,54],{hard:2,tool:"spitzhacke",color:6974064,map:[110,110,116],icon:53,station:"ofen"}],[60,"WOOL","Wolle","bau",[55,55,55],{hard:.4,color:15657698,map:[236,232,224],icon:55}],[61,"FARMLAND","Ackerboden","natur",[56,2,2],{hard:.5,tool:"schaufel",color:5914150,map:[96,66,40],icon:56}],[62,"WHEAT0","Weizen (Keim)","",[57,57,57],{shape:"cross",solid:0,opaque:0,inv:0,hard:0,color:6991936,map:[100,150,60]}],[63,"WHEAT1","Weizen (jung)","",[58,58,58],{shape:"cross",solid:0,opaque:0,inv:0,hard:0,color:8041536,map:[110,160,60]}],[64,"WHEAT2","Weizen (grün)","",[59,59,59],{shape:"cross",solid:0,opaque:0,inv:0,hard:0,color:10530880,map:[150,170,60]}],[65,"WHEAT3","Weizen (reif)","",[60,60,60],{shape:"cross",solid:0,opaque:0,inv:0,hard:0,color:14202960,map:[216,184,80]}],[66,"PATH","Dorfweg","bau",[61,2,2],{hard:.5,tool:"schaufel",color:10126946,map:[150,132,100],icon:61}],[67,"COBBLE","Bruchstein","bau",[62,62,62],{hard:1.6,tool:"spitzhacke",color:8421510,map:[120,120,126],icon:62}],[68,"SWITCH","Schalter","technik",[63,63,63],{hard:.5,color:9079440,map:[140,140,146],icon:63}],[69,"SWITCH_ON","Schalter (an)","",[64,64,64],{hard:.5,color:9079440,map:[140,160,146],inv:0,drop:68}],[70,"WIRE","Signalleitung","technik",[65,65,65],{hard:.5,color:14188604,map:[200,120,60],icon:65}],[71,"SENDER","Funksender","technik",[66,67,62],{hard:.8,color:3817034,map:[80,200,240],icon:67}],[72,"RELAY","Funkrelais","technik",[68,68,68],{hard:.8,color:4869722,map:[110,200,230],icon:68}],[73,"RECEIVER","Empfänger","technik",[69,69,69],{hard:.8,color:3159102,map:[70,74,86],icon:69}],[74,"RECEIVER_ON","Empfänger (an)","",[70,70,70],{hard:.8,color:3159102,map:[90,230,140],inv:0,drop:73,emit:1}],[75,"SIGLAMP","Signallampe","technik",[71,71,71],{hard:.3,color:6969920,map:[110,92,66],icon:71}],[76,"SIGLAMP_ON","Signallampe (an)","",[72,72,72],{hard:.3,color:16767098,map:[255,220,120],inv:0,drop:75,emit:1}],[77,"GATE","Funktor","technik",[73,73,73],{hard:2,tool:"spitzhacke",color:11843262,map:[170,172,180],icon:73}],[78,"GATE_OPEN","Funktor (offen)","",[74,74,74],{solid:0,opaque:0,hard:2,tool:"spitzhacke",color:11843262,map:[130,132,140],inv:0,drop:77}],[79,"RAIL","Schiene","technik",[75,75,75],{shape:"flat",solid:0,opaque:0,hard:.4,color:9075306,map:[140,120,100],icon:75}]];Wn.push([80,"STONEBRICK","Steinziegel","bau",[76,76,76],{hard:1.5,tool:"spitzhacke",color:9079954,map:[138,140,146],icon:76}],[81,"SMOOTH","Glattstein","bau",[77,77,77],{hard:1.5,tool:"spitzhacke",color:10790572,map:[164,166,172],icon:77}],[82,"DARKPLANKS","Dunkle Bretter","bau",[78,78,78],{hard:1,tool:"axt",color:5650980,map:[86,58,36],icon:78}],[83,"BIRCH","Birkenbretter","bau",[79,79,79],{hard:1,tool:"axt",color:14205070,map:[216,192,142],icon:79}],[84,"ROOF","Dachziegel","bau",[80,80,80],{hard:1.2,tool:"spitzhacke",color:11029046,map:[168,74,54],icon:80}],[85,"BOOKS","Bücherregal","bau",[8,81,8],{hard:1,tool:"axt",color:9067060,map:[138,90,52],icon:81}],[86,"LANTERN","Laterne","licht",[82,82,82],{emit:1,hard:.5,color:16764006,map:[255,204,102],icon:82}],[87,"COPPERBLOCK","Kupferblock","bau",[83,83,83],{hard:2,tool:"spitzhacke",color:13136956,map:[210,124,72],icon:83}],[88,"IRONBLOCK","Eisenblock","bau",[84,84,84],{hard:2.4,tool:"spitzhacke",color:13159122,map:[200,202,210],icon:84}],[89,"HAY","Strohballen","natur",[86,85,86],{hard:.4,color:14201936,map:[216,180,80],icon:85}]);["weiß","schwarz","rot","orange","gelb","grün","blau","lila"].forEach((i,t)=>{const e=[[236,238,240],[36,38,44],[190,44,44],[232,120,30],[240,200,40],[70,160,60],[40,90,190],[130,60,180]][t];Wn.push([90+t,"CONCRETE"+t,"Beton "+i,"bau",[87+t,87+t,87+t],{hard:1.4,tool:"spitzhacke",color:e[0]<<16|e[1]<<8|e[2],map:e,icon:87+t}])});["rot","blau","grün"].forEach((i,t)=>{const e=[[220,60,70],[70,120,230],[70,200,110]][t];Wn.push([98+t,"STAINED"+t,"Buntglas "+i,"bau",[95+t,95+t,95+t],{trans:1,hard:.3,color:e[0]<<16|e[1]<<8|e[2],map:e,icon:95+t}])});const Ml=[["PLANKS","Bretter",7,8],["COBBLE","Bruchstein",67,62],["BRICK","Ziegel",36,25],["STONEBRICK","Steinziegel",80,76],["SANDSTONE","Sandstein",55,48],["MARBLE","Marmor",37,26],["DARKPLANKS","Dunkle Bretter",82,78],["SMOOTH","Glattstein",81,77]],hM=i=>Wn.find(t=>t[0]===i)[5];Ml.forEach(([i,t,e,n],s)=>{const r=hM(e),o={hard:r.hard,tool:r.tool,color:r.color,map:r.map,opaque:0,icon:n};Wn.push([101+s,i+"_SLAB",t+"-Stufe","form",[n,n,n],{...o,shape:"slab",full:e}]);for(let a=0;a<4;a++)Wn.push([109+s*4+a,i+"_STAIRS"+(a||""),t+"-Treppe",a?"":"form",[n,n,n],{...o,shape:"stair",dir:a,inv:a?0:1,drop:a?109+s*4:0}])});Wn.push([141,"FENCE","Holzzaun","form",[8,8,8],{shape:"fence",opaque:0,hard:1,tool:"axt",color:11306578,map:[172,134,82],icon:8}],[142,"WALL","Steinmauer","form",[62,62,62],{shape:"wall",opaque:0,hard:1.6,tool:"spitzhacke",color:8421510,map:[120,120,126],icon:62}],[143,"PANE","Glasscheibe","form",[9,9,9],{shape:"pane",trans:1,hard:.3,color:13625584,map:[200,230,240],icon:9}],[144,"DOOR","Holztür","form",[8,98,8],{shape:"door",opaque:0,hard:1,tool:"axt",color:10119740,map:[154,106,60],icon:98}],[145,"DOOR_OPEN","Holztür (offen)","",[8,98,8],{shape:"door",opaque:0,solid:0,hard:1,tool:"axt",color:10119740,map:[154,106,60],inv:0,drop:144}],[146,"LADDER","Leiter","form",[99,99,99],{shape:"ladder",opaque:0,solid:0,hard:.4,tool:"axt",color:9068596,map:[138,96,52],icon:99}]);const Vs=[["chair","Stuhl","🪑",0,0,0,0,8],["armchair","Sessel","🛋️",0,0,0,0,55],["stool","Hocker","🪑",0,0,0,0,8],["couch","Sofa","🛋️",0,0,0,0,55],["table","Tisch","🍽️",.8,0,0,.8,8],["tablelong","Langer Tisch","🍽️",.63,0,0,.63,8],["bed","Bett","🛏️",0,0,0,0,55],["cabinet","Kommode","🗄️",.9,0,0,.9,8],["shelf","Regal","📚",.78,0,0,.78,8],["lamp","Stehlampe","💡",0,0,1,0,10],["tablelamp","Tischlampe","💡",0,0,1,0,10],["books","Bücherstapel","📚",0,0,0,0,81],["picture","Bilderrahmen","🖼️",0,1,0,0,8],["rug","Teppich","🟥",0,0,0,0,55],["bench","Parkbank","🪑",0,0,0,0,8],["streetlight","Straßenlaterne","🏮",0,0,1,0,84],["trafficlight","Ampel","🚦",0,0,1,0,84],["hydrant","Hydrant","🧯",0,0,0,0,89],["trash","Müllcontainer","🗑️",.56,0,0,.56,84],["bush","Busch","🌳",0,0,0,0,7],["barrel","Fass","🛢️",1,0,0,1,5],["chest","Truhe","🧰",.73,0,0,.73,8],["keg","Bierfass","🍺",.97,0,0,.97,5],["candles","Kerzen","🕯️",0,0,1,0,10],["torch","Wandfackel","🔥",0,1,1,0,10],["banner","Banner","🚩",0,1,0,0,55],["crates","Kistenstapel","📦",.95,0,0,.95,8]],yp=147;Vs.forEach(([i,t,e,n,s,r,o,a],l)=>{Wn.push([yp+l,"DECO_"+i.toUpperCase(),t,"deko",[a,a,a],{shape:"deco",opaque:0,solid:n?1:0,emit:r?1:0,hard:.5,emoji:e,icon:a,color:10123866,map:[150,120,90]}])});Wn.push([174,"MOONSTONE","Mondstein","bau",[100,100,100],{hard:1.6,tool:"spitzhacke",color:5925560,map:[90,106,184],icon:100}],[175,"MOONLEAVES","Mondblätter","natur",[101,101,101],{opaque:0,self:1,hard:.2,color:4878528,map:[74,112,192],icon:101}],[176,"GINGERBREAD","Lebkuchen","bau",[102,102,102],{hard:.8,tool:"axt",color:11035692,map:[168,100,44],icon:102}],[177,"ICING","Zuckerguss","bau",[103,103,103],{hard:.6,color:16181488,map:[246,232,240],icon:103}],[178,"ROSELEAVES","Rosenhecke","natur",[104,104,104],{opaque:0,self:1,hard:.3,color:3045940,map:[60,120,52],icon:104}],[179,"FOAM","Akustikschaum","bau",[105,105,105],{hard:.4,color:2763828,map:[42,44,52],icon:105}],[180,"ONAIR","On-Air-Schild","licht",[106,106,106],{emit:1,hard:.5,color:14690874,map:[224,42,58],icon:106}],[181,"GOLDBLOCK","Goldblock","bau",[107,107,107],{hard:2,tool:"spitzhacke",color:15253568,map:[232,192,64],icon:107}],[182,"CAPSULE","Kapselblock","bau",[108,108,108],{hard:.8,color:14170682,map:[216,58,58],icon:108}],[183,"TALLGRASS","Hohes Gras","natur",[109,109,109],{shape:"cross",solid:0,opaque:0,hard:0,color:5939258,map:[90,160,58],icon:109}]);for(let i=0;i<Qh;i++)Wn.push([xi+i,"LOGO"+(i+1),lM[i],"funk",null,{logo:1,hard:.5,color:1712192,map:[60,70,110]}]);Wn.sort((i,t)=>i[0]-t[0]);const Bi=256,Gt=[],d={},No=[],Io=new Uint8Array(Bi),Sn=new Uint8Array(Bi),Ep=new Uint8Array(Bi),Oo=new Float32Array(Bi),$a=new Uint8Array(Bi),bp=new Uint8Array(Bi),Tp=new Uint8Array(Bi),Ap=new Uint8Array(Bi),uM=["","slab","stair","fence","wall","pane","door","ladder","deco"],Ln=new Uint8Array(Bi),gr={};for(const[i,t,e,n,s,r]of Wn){if(Gt[i])throw new Error("Block-Id doppelt: "+i);const o={id:i,key:t,name:e,cat:n,tiles:s,solid:1,opaque:1,trans:0,self:0,emit:0,hard:1,tool:null,color:14540253,map:[200,200,210],icon:0,inv:1,logo:0,station:null,tier:0,shape:null,drop:0,dir:0,full:0,...r};o.trans&&(o.opaque=0),Gt[i]=o,d[t]=i,No[i]=e,Io[i]=o.solid,Sn[i]=o.opaque,$a[i]=o.trans,bp[i]=o.self,Oo[i]=o.emit,Tp[i]=o.shape==="cross"?1:0,Ap[i]=o.shape==="flat"?1:0,Ln[i]=Math.max(0,uM.indexOf(o.shape||"")),Ep[i]=o.opaque||o.self?1:0,s&&(gr[i]=s)}const Sl=i=>i>=xi&&i<xi+Qh;No.slice(yh,yh+Sp);const fM=Gt.filter(i=>i&&i.inv).map(i=>i.id);function dM(i,t){const e=-Math.sin(t),n=-Math.cos(t),s=Math.abs(e)>Math.abs(n)?e>0?1:3:n>0?2:0;return i+s}function Ff(i,t){return Math.abs(i)>Math.abs(t)?i>0?1:3:t>0?0:2}const zr=[];Vs.forEach((i,t)=>{zr[yp+t]=t,i.solid=i[3],i.wall=i[4],i.emit=i[5],i.top=i[6]});const ko=[d.WHEAT0,d.WHEAT1,d.WHEAT2,d.WHEAT3],I=16,ie=96,te=24,pM=8,Bf=16;function Bt(i,t,e){let n=Math.imul(i|0,668265261)^Math.imul(t|0,374761393)^Math.imul(e|0,2654435761);return n=Math.imul(n^n>>>15,2246822507),n=Math.imul(n^n>>>13,3266489909),n^=n>>>16,(n>>>0)/4294967296}function mM(i,t,e){const n=Math.floor(i),s=Math.floor(t),r=i-n,o=t-s,a=r*r*(3-2*r),l=o*o*(3-2*o),c=Bt(n,s,e),h=Bt(n+1,s,e),f=Bt(n,s+1,e),u=Bt(n+1,s+1,e);return c+(h-c)*a+(f-c)*l+(c-h-f+u)*a*l}function Qe(i,t,e,n){let s=0,r=.5,o=1,a=0;for(let l=0;l<n;l++)s+=r*mM(i*o,t*o,e+l*101),a+=r,r*=.5,o*=2;return s/a}const It={OCEAN:0,BEACH:1,PLAINS:2,FOREST:3,TAIGA:4,MOUNTAINS:5,SNOW:6,DESERT:7,SWAMP:8,JUNGLE:9,MEADOW:10,VOLCANO:11,MUSHROOM:12,CRYSTAL:13,COAST:14},gM=["Meer","Strand","Grüne Ebene","Laubwald","Nadelwald","Berge","Schneegebiet","Wüste","Sumpf","Dschungel","Blumenwiese","Vulkanregion","Pilzwald","Kristallgebiet","Felsküste"],bs=[[40,90,180],[222,206,146],[110,176,70],[52,122,46],[44,96,70],[130,130,136],[236,242,248],[228,200,120],[78,98,60],[36,140,40],[170,190,90],[70,50,50],[130,100,140],[110,220,240],[120,118,112]],vM=[It.PLAINS,It.FOREST,It.MEADOW],Ts=(i,t,e)=>{const n=Math.max(0,Math.min(1,(e-i)/(t-i)));return n*n*(3-2*n)},mc=i=>Math.max(0,Math.min(1,(i-.5)*2.4+.5)),Hf=te-14,xM=6,_M=5,Eo=5;function En(i,t,e,n){const s=Qe(t/640,e/640,i+1,4),r=Ts(.4,.5,s),o=Qe(t/52,e/52,i+3,3),a=Ts(.56,.72,Qe(t/300,e/300,i+2,3))*r,l=mc(Qe(t/520,e/520,i+11,3))+(Bt(t,e,i+5)-.5)*.05,c=mc(Qe(t/480,e/480,i+23,3))+(Bt(t,e,i+6)-.5)*.05,h=mc(Qe(t/360,e/360,i+37,2));let f=(te-13+o*8)*(1-r)+(te+2+o*12)*r;if(a>0){const M=1-Math.abs(Qe(t/80,e/80,i+4,2)*2-1);f+=a*(12+M*36)}const u=Ts(.74,.82,c)*Ts(.42,.5,l)*(1-Ts(0,.2,a))*r;u>0&&(f+=(te+(o<.45?-1:1)-f)*u);const p=l>.6?Ts(.86,.98,h)*r*(1-u):0;p>0&&(f+=p*26-Ts(.8,.95,p)*5),f=Math.max(2,Math.min(ie-12,Math.floor(f)));const x=l-Math.max(0,f-(te+18))*.012;let v;u>.5?v=It.SWAMP:f<te?v=It.OCEAN:p>.05?v=It.VOLCANO:a>.3&&f>te+18?v=It.MOUNTAINS:f<=te+1?v=x<.32||a>.15?It.COAST:It.BEACH:h>.86?v=c>.5?It.MUSHROOM:It.CRYSTAL:x<.16?v=It.SNOW:x<.3?v=It.TAIGA:x>.7&&c<.4?v=It.DESERT:x>.66&&c>.62?v=It.JUNGLE:c>.56?v=It.FOREST:Qe(t/110,e/110,i+41,2)>.6?v=It.MEADOW:v=It.PLAINS,n.h=f,n.biome=v,n.t=x,n.u=c,n.d=o,n.volc=p;const m=f<te+6,g=m?Math.min(f-5,Hf):f;n.t0lo=n.t1lo=n.cvlo=1e9,n.t0hi=n.t1hi=n.cvhi=-1,n.lake=!1,n.open=!1;for(let M=0;M<2;M++){const S=Math.abs(Qe(t/64,e/64,i+50+M*7,2)-.5);if(S>=.024)continue;const C=8+M*13+Qe(t/90,e/90,i+60+M,2)*16,y=1.4+(1-S/.024)*1.6,w=Math.max(xM,Math.ceil(C-y)),L=Math.min(g,Math.floor(C+y*.75));L<w||(M===0?(n.t0lo=w,n.t0hi=L):(n.t1lo=w,n.t1hi=L),L>=f&&(n.open=!0))}const _=Qe(t/36,e/36,i+70,2);if(_>.66){const M=Math.min(f-6,m?Hf:ie,Eo+Math.floor((_-.66)*55));M>=Eo&&(n.cvlo=Eo,n.cvhi=M,n.lake=Qe(t/200,e/200,i+71,2)>.52)}return n}function Vf(i,t,e,n){const s=i.h,r=i.d;switch(i.biome){case It.OCEAN:return[r>.62?d.GRAVEL:r<.32?d.CLAY:d.SAND,d.SAND,3,d.STONE,0,d.STONE];case It.BEACH:return[d.SAND,d.SAND,4,d.SANDSTONE,3,d.STONE];case It.COAST:return[d.GRAVEL,d.STONE,2,d.STONE,0,d.STONE];case It.MEADOW:return[d.FLOWERS,d.DIRT,3,d.STONE,0,d.STONE];case It.SNOW:return[d.SNOW,d.DIRT,3,d.STONE,0,d.STONE];case It.MOUNTAINS:return s>te+44?[d.SNOW,d.STONE,1,d.STONE,0,d.STONE]:s<te+26?[d.GRASS,d.DIRT,2,d.STONE,0,d.STONE]:[r>.6?d.GRAVEL:d.STONE,d.STONE,1,d.STONE,0,d.STONE];case It.DESERT:return[d.SAND,d.SAND,4,d.SANDSTONE,3,d.STONE];case It.SWAMP:return[Bt(e,n,t+8)<.4?d.MUD:d.GRASS,d.MUD,2,d.DIRT,2,d.STONE];case It.VOLCANO:return[r>.74||Qe(e/14,n/14,t+9,2)>.7?d.MAGMA:d.BASALT,d.BASALT,4,d.STONE,0,d.STONE];case It.MUSHROOM:return[d.MYCEL,d.DIRT,3,d.STONE,0,d.STONE];case It.CRYSTAL:return[r>.55?d.GRAVEL:d.STONE,d.STONE,1,d.STONE,0,d.STONE];default:return[d.GRASS,d.DIRT,3,d.STONE,0,d.STONE]}}const Kn=[];Kn[It.PLAINS]=["oak",.004];Kn[It.FOREST]=["oak",.035];Kn[It.MEADOW]=["oak",.002];Kn[It.TAIGA]=["spruce",.03];Kn[It.SNOW]=["spruce",.008];Kn[It.MOUNTAINS]=["spruce",.006];Kn[It.JUNGLE]=["jungle",.045];Kn[It.SWAMP]=["oak",.012];Kn[It.DESERT]=["cactus",.006];Kn[It.MUSHROOM]=["mushroom",.012];Kn[It.CRYSTAL]=["spire",.012];const MM=new Set([d.GRASS,d.DIRT,d.SNOW,d.FLOWERS,d.MUD,d.MYCEL,d.SAND,d.STONE,d.GRAVEL]),Jn=3,ci=I+2*Jn,Da=Array.from({length:ci*ci},()=>({}));function SM(i,t,e,n){const s=t*I,r=e*I;for(let h=0;h<ci;h++)for(let f=0;f<ci;f++)En(i,s+f-Jn,r+h-Jn,Da[h*ci+f]);let o=te;const a=(h,f,u)=>h+u*I+f*I*I;for(let h=0;h<I;h++)for(let f=0;f<I;f++){const u=Da[(h+Jn)*ci+f+Jn],p=u.h,x=s+f,v=r+h,[m,g,_,M,S,C]=Vf(u,i,x,v);for(let y=0;y<=p;y++){const w=p-y;n[a(f,y,h)]=y===0?d.STONE:w===0?m:w<=_?g:w<=_+S?M:C}for(let y=p+1;y<=te;y++)n[a(f,y,h)]=y===te&&u.t<.16&&u.biome!==It.SWAMP?d.ICE:d.WATER;p>o&&(o=p)}for(let h=0;h<I;h++)for(let f=0;f<I;f++){const u=Da[(h+Jn)*ci+f+Jn];for(let p=u.t0lo;p<=u.t0hi;p++)n[a(f,p,h)]=d.AIR;for(let p=u.t1lo;p<=u.t1hi;p++)n[a(f,p,h)]=d.AIR;if(u.cvhi>=0){for(let p=u.cvlo;p<=u.cvhi;p++)n[a(f,p,h)]=d.AIR;if(u.lake)n[a(f,_M,h)]=d.WATER;else if(Bt(s+f,r+h,i+72)<(u.biome===It.CRYSTAL?.22:.04)){const p=1+Math.floor(Bt(s+f,r+h,i+73)*3);for(let x=Eo;x<Eo+p&&x<=u.cvhi;x++)n[a(f,x,h)]=d.CRYSTAL}}}const l=(h,f,u,p,x,v)=>{for(let m=0;m<f;m++){const g=C=>Bt(t*31+m*7+C,e*17-m,i+v);let _=Math.floor(g(1)*I),M=Math.floor(g(2)*I),S=u+Math.floor(g(3)*(p-u));for(let C=0;C<x;C++){const y=a(_,S,M);n[y]===d.STONE&&(n[y]=h);const w=Math.floor(g(4+C)*6),L=w&1?1:-1;w<2?_=Math.max(0,Math.min(I-1,_+L)):w<4?M=Math.max(0,Math.min(I-1,M+L)):S=Math.max(1,Math.min(ie-1,S+L))}}};l(d.COAL,16,6,70,6,80),l(d.COPPER,9,4,44,5,81),l(d.IRON,7,2,30,4,82),l(d.CRYSTAL,2,2,14,3,83);const c=(h,f,u,p,x)=>{if(h<0||h>=I||u<0||u>=I||f<1||f>=ie)return;const v=a(h,f,u);(x||n[v]===d.AIR)&&(n[v]=p,f>o&&(o=f))};for(let h=0;h<ci;h++)for(let f=0;f<ci;f++){const u=Da[h*ci+f],p=Kn[u.biome];if(!p||u.open||u.h<=te)continue;const x=s+f-Jn,v=r+h-Jn;if(Bt(x,v,i+99)>=p[1])continue;const m=f-Jn,g=h-Jn,_=u.h,M=Bt(x,v,i+7),S=Vf(u,i,x,v)[0];if(MM.has(S))if(p[0]==="cactus"){if(S!==d.SAND)continue;const C=1+Math.floor(M*3);for(let y=1;y<=C;y++)c(m,_+y,g,d.CACTUS)}else if(p[0]==="spire"){const C=2+Math.floor(M*4);for(let y=1;y<=C;y++)c(m,_+y,g,d.CRYSTAL);c(m+(M<.5?1:-1),_+1,g,d.CRYSTAL)}else if(p[0]==="mushroom"){const C=4+Math.floor(M*3);for(let y=1;y<=C;y++)c(m,_+y,g,d.STEM,!0);for(let y=-2;y<=2;y++)for(let w=-2;w<=2;w++){const L=Math.abs(w)===2&&Math.abs(y)===2;L||c(m+w,_+C+1,g+y,d.SHROOM),!L&&(Math.abs(w)===2||Math.abs(y)===2)&&c(m+w,_+C,g+y,d.SHROOM)}}else if(p[0]==="spruce"){const C=6+Math.floor(M*4),y=_+C+1;for(let w=1;w<=C;w++)c(m,_+w,g,d.SPRUCE,!0);for(let w=_+3;w<=y;w++){const L=Math.min(3,Math.floor((y-w)/2.2+(w%2?.4:0)));for(let E=-L;E<=L;E++)for(let b=-L;b<=L;b++)b*b+E*E<=L*L+.5&&c(m+b,w,g+E,d.NEEDLES)}}else if(p[0]==="jungle"){const C=8+Math.floor(M*5);for(let y=1;y<=C;y++)c(m,_+y,g,d.WOOD,!0);for(let y=-1;y<=1;y++){const w=y===1?2:3;for(let L=-w;L<=w;L++)for(let E=-w;E<=w;E++)E*E+L*L>w*w+1||w===3&&Bt(x+E,v+L+y,i+3)<.25||c(m+E,_+C+y,g+L,d.JLEAVES)}}else{const C=4+Math.floor(M*3);for(let y=1;y<=C;y++)c(m,_+y,g,d.WOOD,!0);for(let y=C-2;y<=C+1;y++){const w=y>=C?1:2;for(let L=-w;L<=w;L++)for(let E=-w;E<=w;E++)w===2&&Math.abs(E)===2&&Math.abs(L)===2&&Bt(x+E,v+L+y,i+3)<.5||c(m+E,_+y,g+L,d.LEAVES)}}}return Math.min(ie-1,o)}const Wf=24,Gf=4096,xo={[d.SWITCH]:"switch",[d.SWITCH_ON]:"switch",[d.WIRE]:"wire",[d.SENDER]:"sender",[d.RELAY]:"relay",[d.RECEIVER]:"receiver",[d.RECEIVER_ON]:"receiver",[d.SIGLAMP]:"machine",[d.SIGLAMP_ON]:"machine",[d.GATE]:"machine",[d.GATE_OPEN]:"machine"},gc=new Set(Object.keys(xo).map(Number)),Kf={[d.RECEIVER]:d.RECEIVER_ON,[d.SIGLAMP]:d.SIGLAMP_ON,[d.GATE]:d.GATE_OPEN},yM={[d.RECEIVER_ON]:d.RECEIVER,[d.SIGLAMP_ON]:d.SIGLAMP,[d.GATE_OPEN]:d.GATE},EM=(i,t,e)=>i+","+t+","+e,bM=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];function TM(i){const t=new Set,e=new Set,n=new Set,s=new Map,r=[],o=[];for(const[x,v]of i){const m=xo[v[3]];(m==="relay"||m==="receiver")&&o.push(x),v[3]===d.SWITCH_ON&&(e.add(x),r.push(x))}let a=0,l=0,c=0,h=0,f=0;const u=Wf*Wf;let p=0;for(;p<r.length&&!(++a>Gf);){const x=r[p++],v=i.get(x),m=xo[v[3]];if(m==="sender"||m==="relay"){const g=s.get(x);for(const _ of o){if(_===x)continue;const M=i.get(_),S=M[0]-v[0],C=M[1]-v[1],y=M[2]-v[2];if(S*S+C*C+y*y>u)continue;const w=xo[M[3]];w==="relay"&&!n.has(_)?(n.add(_),s.set(_,g),r.push(_)):w==="receiver"&&!e.has(_)&&(e.add(_),t.add(_),c++,r.push(_),l=Math.max(l,Math.hypot(M[0]-g[0],M[1]-g[1],M[2]-g[2])))}continue}for(const[g,_,M]of bM){const S=EM(v[0]+g,v[1]+_,v[2]+M),C=i.get(S);if(!C)continue;const y=xo[C[3]];y==="wire"&&!e.has(S)?(e.add(S),r.push(S)):y==="sender"&&!n.has(S)?(n.add(S),s.set(S,C),f++,r.push(S)):y==="machine"&&!t.has(S)&&(t.add(S),h++)}}return{on:t,receivers:c,machines:h,senders:f,reach:l,capped:a>Gf}}const Pa=(i,t)=>(i+32768)*65536+(t+32768),AM=Object.fromEntries(Ml.map(([i],t)=>[i,109+t*4])),mi=(i,t)=>AM[i]+(t&3),wM=i=>101+Ml.findIndex(t=>t[0]===i),Mt=i=>d["DECO_"+i.toUpperCase()];class wp{constructor(){this.by=new Map,this.pads=[],this.box=null}set(t,e,n,s){if(e<1||e>=ie||s==null)return;const r=Pa(t>>4,n>>4);let o=this.by.get(r);o||(o=new Map,this.by.set(r,o)),o.set((t&15)+((n&15)<<4)+(e<<8),s);const a=this.box;a?(t<a[0]&&(a[0]=t),n<a[1]&&(a[1]=n),t>a[2]&&(a[2]=t),n>a[3]&&(a[3]=n)):this.box=[t,n,t,n]}get(t,e,n){const s=this.by.get(Pa(t>>4,n>>4));return s?s.get((t&15)+((n&15)<<4)+(e<<8)):void 0}fill(t,e,n,s,r,o,a){for(let l=Math.min(e,r);l<=Math.max(e,r);l++)for(let c=Math.min(n,o);c<=Math.max(n,o);c++)for(let h=Math.min(t,s);h<=Math.max(t,s);h++)this.set(h,l,c,a)}fillSoft(t,e,n,s,r,o,a){for(let l=e;l<=r;l++)for(let c=n;c<=o;c++)for(let h=t;h<=s;h++)this.get(h,l,c)===void 0&&this.set(h,l,c,a)}pad(t,e,n,s,r,o=d.GRASS,a=5,l=!1){this.pads.push({x0:t,z0:e,x1:n,z1:s,y:r,top:o,edge:a,round:l})}touches(t,e){if(this.by.has(Pa(t,e)))return!0;const n=t*I,s=e*I;return this.pads.some(r=>r.x1+r.edge>=n&&r.x0-r.edge<n+I&&r.z1+r.edge>=s&&r.z0-r.edge<s+I)}apply(t,e,n,s,r,o){const a=t*I,l=e*I;let c=r;for(const f of this.pads)if(f.x1+f.edge>=a&&f.x0-f.edge<a+I&&f.z1+f.edge>=l&&f.z0-f.edge<l+I)for(let u=l;u<l+I;u++)for(let p=a;p<a+I;p++){let x;if(f.round){const _=(f.x0+f.x1)/2,M=(f.z0+f.z1)/2,S=(f.x1-f.x0)/2;x=Math.max(0,Math.hypot(p-_,u-M)-S)}else x=Math.max(0,f.x0-p,p-f.x1,f.z0-u,u-f.z1);if(x>f.edge)continue;const v=s(p,u),m=x===0?f.y:Math.round(f.y+(v-f.y)*x/f.edge),g=p-a+(u-l)*I;for(let _=Math.max(1,Math.min(v+1,m-4));_<m;_++)n[g+_*I*I]=_<m-3?d.STONE:d.DIRT;n[g+m*I*I]=f.top;for(let _=m+1,M=Math.min(ie-1,Math.max(v,m)+22);_<=M;_++)n[g+_*I*I]=d.AIR;m>c&&(c=m)}const h=this.by.get(Pa(t,e));if(h)for(const[f,u]of h){n[f]=u;const p=f>>8;u&&p>c&&(c=p),u===d.RADIO&&o&&o(a+(f&15),p,l+(f>>4&15),u)}return c}}function Os(i,t,e,n,s,r,o,a={}){const l=a.wall??d.PLANKS,c=a.post??l,h=a.floor??d.PLANKS,f=a.ceil;for(let u=e;u<=r;u++)for(let p=n;p<=o;p++)for(let x=t;x<=s;x++){const v=x===t||x===s,m=p===n||p===o;let g=d.AIR;u===e?g=v||m?a.base??h:h:u===r&&f!=null?g=f:v&&m?g=c:(v||m)&&(g=l),i.set(x,u,p,g)}}function bo(i,t,e,n){i.set(t,e,n,d.DOOR),i.set(t,e+1,n,d.DOOR)}function tu(i,t,e,n,s,r,o,a,l=!0,c=null){const h=l?s-e:n-t,f=Math.ceil((h+1)/2);for(let u=0;u<=f;u++){const p=r+u,x=(l?e:t)-1+u,v=(l?s:n)+1-u;if(x>v)break;for(let m=(l?t:e)-1;m<=(l?n:s)+1;m++){const g=m===(l?t:e)||m===(l?n:s);if(x===v){l?i.set(m,p,x,c??Xf(o)):i.set(x,p,m,c??Xf(o));continue}if(l?(i.set(m,p,x,mi(o,2)),i.set(m,p,v,mi(o,0))):(i.set(x,p,m,mi(o,1)),i.set(v,p,m,mi(o,3))),g)for(let _=x+1;_<v;_++)l?i.set(m,p,_,a):i.set(_,p,m,a)}if(x+1===v){for(let m=(l?t:e)-1;m<=(l?n:s)+1;m++)l?(i.set(m,p+1,x,Na(o)),i.set(m,p+1,v,Na(o))):(i.set(x,p+1,m,Na(o)),i.set(v,p+1,m,Na(o)));break}}}const RM={PLANKS:d.PLANKS,COBBLE:d.COBBLE,BRICK:d.BRICK,STONEBRICK:d.STONEBRICK,SANDSTONE:d.SANDSTONE,MARBLE:d.MARBLE,DARKPLANKS:d.DARKPLANKS,SMOOTH:d.SMOOTH},Xf=i=>RM[i]??d.PLANKS,Na=i=>wM(i);function $f(i,t,e,n,s,r,o,a={}){for(let l=e;l<e+r;l++)for(let c=n-s;c<=n+s;c++)for(let h=t-s;h<=t+s;h++){const f=Math.hypot(h-t,c-n);if(f>s+.5)continue;f>s-.5?i.set(h,l,c,o):i.set(h,l,c,a.floors&&(l-e)%a.floors===0?a.floor??d.PLANKS:d.AIR)}}function qf(i,t,e,n,s,r){for(let o=0;s-o*.7>-.5;o++){const a=s+1-o*.7;for(let l=Math.floor(n-a);l<=n+a;l++)for(let c=Math.floor(t-a);c<=t+a;c++)Math.hypot(c-t,l-n)<=a+.3&&i.set(c,e+o,l,r)}}function CM(i,t,e,n,s,r,o,a){for(let l=e-r;l<=e+r;l++)for(let c=n-o;c<=n+o;c++)for(let h=t-s;h<=t+s;h++){const f=(h-t)/s,u=(l-e)/r,p=(c-n)/o,x=f*f+u*u*(l<e?2.2:1)+p*p,v=.86+.14*a(h>>1,(c>>1)+l*31);x<=v&&i.set(h,l,c,d.AIR)}}function LM(i,t,e,n,s,r,o,a,l="COBBLE"){const c=s===1?1:s===-1?3:0,h=r,f=s;for(let u=0;u<o;u++){for(let p=-1;p<=1;p++){const x=t+h*p,v=n+f*p;i.set(x,e-1,v,d.COBBLE),i.set(x,e,v,mi(l,c));for(let m=1;m<=4;m++)i.set(x,e+m,v,d.AIR)}if(u%6===3&&i.set(t+h*2,e+2,n+f*2,d.LANTERN),a(t,e,n))return{x:t,y:e,z:n};t+=s,n+=r,e++}return{x:t,y:e,z:n}}const Yf={A:"010101111101101",B:"110101110101110",C:"011100100100011",D:"110101101101110",E:"111100110100111",F:"111100110100100",G:"011100101101011",H:"101101111101101",I:"111010010010111",K:"101101110101101",L:"100100100100111",M:"101111111101101",N:"110101101101101",O:"010101101101010",P:"110101110100100",R:"110101110101101",S:"011100010001110",T:"111010010010010",U:"101101101101111",W:"101101111111101",V:"101101101101010",X:"101101010101101",Y:"101101010010010",J:"001001001101010",Q:"010101101111011",Ö:"101010101101010",Z:"111001010100111",Ä:"101010101111101",Ü:"101000101101111"," ":"000000000000000"};function Eh(i,t,e,n,s,r,o,a){let l=0;for(const c of t.toUpperCase()){const h=Yf[c]||Yf[" "];for(let f=0;f<5;f++)for(let u=0;u<3;u++)h[f*3+u]==="1"&&i.set(e+r*(l+u),n-f,s+o*(l+u),a);l+=4}return l}function eu(i,t,e,n,s,r=d.LEAVES,o=d.WOOD,a=2){for(let l=0;l<s;l++)i.set(t,e+l,n,o);for(let l=-1;l<=2;l++){const c=l>=2?a-1:a;for(let h=-c;h<=c;h++)for(let f=-c;f<=c;f++){if(Math.abs(f)===c&&Math.abs(h)===c&&(l!==0||c>1))continue;const u=e+s-1+l;(i.get(t+f,u,n+h)===void 0||i.get(t+f,u,n+h)===d.AIR)&&i.set(t+f,u,n+h,r)}}i.set(t,e+s-1,n,o)}function DM(i,t,e,n,s,r,o=d.GRASS,a=()=>.5){for(let l=n-s;l<=n+s;l++)for(let c=t-s;c<=t+s;c++){const h=Math.hypot(c-t,l-n)/s;if(h>1)continue;const f=Math.round(r*Math.pow(1-h*h,.6)+(a(c,l)-.5)*2);for(let u=1;u<=f;u++)i.set(c,e+u,l,u===f?o:u>f-3?d.DIRT:d.STONE)}}function PM(i,t,e,n,s,r,o,a=null,l=()=>.5){for(let c=e;c<=e+r;c++){const h=Math.sqrt(Math.max(0,1-Math.pow((c-e)/(r+1),2)));for(let f=n-o;f<=n+o;f++)for(let u=t-s;u<=t+s;u++){const p=(u-t)/(s*h+.01),x=(f-n)/(o*h+.01);p*p+x*x<=.9+.1*l(u,f+c*17)&&(i.set(u,c,f,d.AIR),c===e&&a!=null&&i.set(u,e-1,f,a))}}}function NM(i,t,e,n,s,r,o=4,a=1,l=null){for(let c=Math.min(e,s)-(t===n?0:a);c<=Math.max(e,s)+(t===n?0:a);c++)for(let h=Math.min(t,n)-(t===n?a:0);h<=Math.max(t,n)+(t===n?a:0);h++){for(let f=0;f<o;f++)i.set(h,r+f,c,d.AIR);l!=null&&i.set(h,r-1,c,l)}}function Rp(i,t,e,n,s,r=0){const o=(a,l)=>r===0?[a,l]:r===1?[l,-a]:r===2?[-a,-l]:[-l,a];for(const[a,l,c,h,f,u,p]of s)for(let x=l;x<=f;x++)for(let v=c;v<=u;v++)for(let m=a;m<=h;m++){const[g,_]=o(m,v);i.set(t+g,e+x,n+_,p)}}function Hn(i,t,e,n,s,r,o={},a="wohnen",l=6){const c=o.wall??d.PLANKS,h=o.post??d.WOOD,f=o.floor??d.PLANKS,u=o.base??d.COBBLE,p=-r,x=s,v=(E,b)=>[t+p*E+s*b,n+x*E+r*b],m=(E,b,N,X)=>{const[W,Y]=v(E,N);i.set(W,b,Y,X)},g=5;Os(i,t-l,e,n-l,t+l,e+g,n+l,{wall:c,post:h,floor:f,base:u,ceil:f}),Os(i,t-l,e+g,n-l,t+l,e+g+4,n+l,{wall:c,post:h,floor:f,base:c});for(let E=1;E<g+4;E++)for(const[b,N]of[[-l,0],[l,0],[0,-l]])m(b,e+E,N,h);for(let E=1;E<g+4;E++)m(0,e+E,l,h);for(const E of[e+2,e+3,e+g+2])for(const b of[-3,-2,2,3])m(b,E,-l,d.PANE),m(b,E,l,d.PANE),m(-l,E,b,d.PANE),m(l,E,b,d.PANE);m(0,e+1,l,d.AIR),m(0,e+2,l,d.AIR);{const[E,b]=v(0,l);bo(i,E,e+1,b)}m(-1,e+3,l+1,Mt("torch")),m(1,e+3,l+1,Mt("torch"));for(const E of[-1,0,1])m(E,e,l+1,u);const[_,M]=v(-l,-l),[S,C]=v(l,l);tu(i,Math.min(_,S),Math.min(M,C),Math.max(_,S),Math.max(M,C),e+g+5,o.roof??"DARKPLANKS",o.roofWall??c,s===0);for(let E=1;E<=g+1;E++)m(l-1,e+E,-l+1,d.LADDER);for(const[E,b]of[[-3,-3],[3,3],[-3,3],[3,-3]])m(E,e+g-1,b,d.LANTERN);m(0,e+g+3,0,d.LANTERN);const y=Mt,w={wohnen:()=>{m(-2,e+1,0,y("table")),m(-2,e+1,1,y("chair")),m(-2,e+1,-1,y("chair")),m(-3,e+1,0,y("chair")),m(-1,e+1,0,y("chair")),m(-2,e+2,0,y("candles")),m(2,e+1,-5,y("couch")),m(3,e+1,-2,y("rug")),m(5,e+1,2,y("shelf")),m(-5,e+1,-4,y("cabinet")),m(-5,e+2,-4,y("tablelamp")),m(-5,e+1,4,d.BOOKS),m(-5,e+2,4,d.BOOKS),m(-4,e+1,5,y("barrel")),m(4,e+1,-5,y("lamp")),m(0,e+3,-l+1,y("picture"))},bauer:()=>{w.wohnen(),m(5,e+1,-2,d.WORKBENCH),m(5,e+1,-1,d.HAY),m(4,e+1,4,d.HAY),m(5,e+1,4,y("crates"))},schmied:()=>{m(5,e+1,-2,d.FURNACE),m(5,e+1,-1,d.FURNACE),m(5,e+1,0,d.WORKBENCH),m(4,e+1,4,d.IRONBLOCK),m(-5,e+1,3,y("barrel")),m(-5,e+1,4,y("crates")),m(-2,e+1,0,y("tablelong")),m(-2,e+1,1,y("stool")),m(-5,e+1,-4,y("chest")),m(0,e+3,-l+1,y("banner")),m(4,e+1,-5,y("lamp"))},funker:()=>{w.wohnen(),m(5,e+1,-2,d.RADIO),m(5,e+1,-1,d.SENDER),m(5,e+2,-2,y("tablelamp"))},hirte:()=>{w.wohnen(),m(5,e+1,-2,d.WOOL),m(5,e+1,-1,d.WOOL),m(5,e+2,-2,d.WOOL),m(4,e+1,4,d.HAY)},wirt:()=>{for(const E of[-3,0,3])m(-2,e+1,E,y("tablelong")),m(-3,e+1,E,y("stool")),m(-1,e+1,E,y("stool")),m(-2,e+2,E,y("candles"));for(const E of[-4,-3,-2,-1])m(4,e+1,E,y("keg"));m(4,e+1,1,y("barrel")),m(5,e+1,3,y("barrel")),m(3,e+1,4,y("crates")),m(0,e+3,-l+1,y("banner")),m(4,e+1,-5,y("lamp"))},laden:()=>{for(const E of[-3,-2,-1,0,1,2])m(E,e+1,-2,y("cabinet"));m(-3,e+2,-2,y("books")),m(0,e+2,-2,y("tablelamp"));for(const E of[-5,-4])for(const b of[-4,0,4])m(b,e+1,E,y("shelf"));m(4,e+1,4,y("crates")),m(-4,e+1,4,y("barrel")),m(-5,e+1,0,y("chest"))}};w.heil=()=>{for(const E of[-3,-2,-1,0,1,2,3])m(E,e+1,-2,y("cabinet"));m(0,e+2,-2,y("tablelamp")),m(-2,e+2,-2,y("books"));for(const E of[-1,1,3])m(-5,e+1,E,y("bed")),m(5,e+1,E,y("bed"));m(-3,e+1,4,y("couch")),m(3,e+1,4,y("couch")),m(0,e+1,2,y("rug")),m(-4,e+1,-5,y("lamp")),m(4,e+1,-5,y("bush")),m(0,e+3,-l+1,y("picture"))},w.labor=()=>{for(const E of[-1,2])m(-2,e+1,E,y("tablelong")),m(-2,e+2,E,d.CAPSULE),m(2,e+1,E,y("tablelong")),m(2,e+2,E,y("books"));for(const E of[-4,-3,-2,-1,0,1,2,3,4])m(E,e+1,-5,d.BOOKS),m(E,e+2,-5,d.BOOKS);m(-5,e+1,4,d.RADIO),m(-5,e+2,4,y("tablelamp")),m(5,e+1,4,d.CRYSTAL),m(0,e+1,4,y("chair")),m(5,e+1,-2,y("cabinet")),m(5,e+2,-2,d.CAPSULE),m(-5,e+1,0,y("lamp"))},(w[a]||w.wohnen)();const L=e+g+1;return m(-4,L,-4,y("bed")),m(-1,L,-4,y("bed")),m(-5,L,0,y("cabinet")),m(-5,L+1,0,y("tablelamp")),m(3,L,-4,y("chest")),m(3,L,3,y("armchair")),m(0,L,2,y("rug")),m(-4,L,4,y("shelf")),m(2,L,0,y("table")),m(2,L+1,0,y("books")),m(0,L+1,-l+1,y("picture")),m(-l+1,L+1,2,y("picture")),{door:v(0,l),front:v(0,l+2)}}const zi=160,fn=20,sl=4,IM=new Set([It.PLAINS,It.FOREST,It.MEADOW,It.TAIGA,It.SNOW,It.DESERT]),OM=[{key:"bauer",name:"Bäuerin Frieda"},{key:"schmied",name:"Schmied Kalle"},{key:"funker",name:"Funkerin Lotte"},{key:"hirte",name:"Hirte Mats"}],kM=[[0,-1],[1,0],[0,1],[-1,0]],no=new Map;function yl(i,t){if(no.has(i))return no.get(i);const e=t();return no.size>512&&no.clear(),no.set(i,e),e}const Vn=i=>Math.floor(i/zi);function Fr(i,t,e,n=3){return yl(`v${i},${t},${e},${n>=4?4:3}`,()=>{if(Bt(t,e,i+500)>.75)return null;const s=t*zi+40+Math.floor(Bt(t,e,i+501)*80),r=e*zi+40+Math.floor(Bt(t,e,i+502)*80),o={};En(i,s,r,o);const a=o.h,l=o.biome;if(!IM.has(l)||a<te+2||a>te+22)return null;let c=a,h=a;for(let _=-fn-2;_<=fn+2;_+=4)for(let M=-fn-2;M<=fn+2;M+=4)if(!(M*M+_*_>(fn+2)*(fn+2))){if(En(i,s+M,r+_,o),o.h<=te+1||o.biome===It.SWAMP||o.biome===It.VOLCANO)return null;c=Math.min(c,o.h),h=Math.max(h,o.h)}if(h-c>9)return null;const f=3+(Bt(t,e,i+503)<.5?1:0),u=[],p=n>=4,x=p?13:11,v=p?6:3;for(let _=0;_<f;_++){const[M,S]=kM[_],C=s+M*x,y=r+S*x;u.push({x:C,z:y,dx:M,dz:S,door:{x:C-M*v,z:y-S*v},front:{x:C-M*(v+2),z:y-S*(v+2)},role:OM[_]})}const m=l===It.DESERT,g=l===It.SNOW||l===It.TAIGA;return{id:t+","+e,x:s,z:r,y:a,biome:l,houses:u,big:p,field:p?{x0:s+8,z0:r-14,x1:s+14,z1:r-8}:{x0:s+6,z0:r-12,x1:s+12,z1:r-6},mast:{x:s-9,z:r+9},top:m?d.SAND:l===It.SNOW?d.SNOW:d.GRASS,wall:m?d.SANDSTONE:g?d.SPRUCE:d.PLANKS,roof:m?d.SANDSTONE:g?d.SPRUCE:d.BRICK,post:g?d.SPRUCE:d.WOOD}})}function UM(i,t){switch(t.role.key){case"bauer":return{x:i.field.x0-1.5,z:(i.field.z0+i.field.z1)/2+.5};case"funker":return{x:i.mast.x+2.5,z:i.mast.z+.5};case"hirte":return{x:i.x-8.5,z:i.z-8.5};default:return{x:t.front.x+.5+t.dz*2,z:t.front.z+.5+t.dx*2}}}function zM(i,t,e){return yl(`m${i},${t},${e}`,()=>{if(Bt(t,e,i+600)>.5)return null;const n=t*zi+40+Math.floor(Bt(t,e,i+601)*80),s=e*zi+40+Math.floor(Bt(t,e,i+602)*80),r=10+Math.floor(Bt(t,e,i+603)*8),o=18+Math.floor(Bt(t,e,i+604)*12);return En(i,n,s,{}).h<r+12?null:{x:n,y:r,z:s,L:o}})}function Cp(i,t=0,e=0,n=2,s=3){const r=Vn(t),o=Vn(e);let a=null,l=1/0;for(let c=o-n;c<=o+n;c++)for(let h=r-n;h<=r+n;h++){const f=Fr(i,h,c,s);if(!f)continue;const u=Math.hypot(f.x-t,f.z-e);u<l&&(l=u,a=f)}return a}function FM(i,t,e,n,s,r,o=3,a=null){const l=t*I,c=e*I,h=Vn(l),f=Vn(c);let u=s;const p=(y,w,L)=>y-l+(L-c)*I+w*I*I,x=(y,w)=>y>=l&&y<l+I&&w>=c&&w<c+I,v=(y,w,L,E)=>{!x(y,L)||w<1||w>=ie||(n[p(y,w,L)]=E,E&&w>u&&(u=w),E===d.RADIO&&r&&r(y,w,L,E))},m=(y,w,L)=>x(y,L)&&w>=0&&w<ie?n[p(y,w,L)]:d.AIR,g=(y,w,L,E)=>L>=l&&y<l+I&&E>=c&&w<c+I,_=!(a&&a(h,f));o>=4&&HM(i,l,c,n);const M=_?zM(i,h,f):null;if(M&&g(M.x-M.L-2,M.z-M.L-2,M.x+M.L+2,M.z+M.L+2)&&XM(i,M,l,c,v,m),!_)return u;if(o>=4){const y=WM(i,h,f);return y.touches(t,e)&&(u=y.apply(t,e,n,(w,L)=>En(i,w,L,BM).h,u,r)),u}const S=Fr(i,h,f),C=fn+sl;return S&&g(S.x-C,S.z-C,S.x+C,S.z+C)&&$M(i,S,l,c,v,m),u}const BM={};function HM(i,t,e,n){for(let s=0;s<I;s++)for(let r=0;r<I;r++)if(!(Bt(t+r,e+s,i+700)>.16))for(let a=ie-2;a>te;a--){const l=n[r+s*I+a*I*I];if(l!==d.AIR){l===d.GRASS&&n[r+s*I+(a+1)*I*I]===d.AIR&&(n[r+s*I+(a+1)*I*I]=d.TALLGRASS);break}}}function VM(i,t,e){return yl(`c${i},${t},${e}`,()=>{if(Bt(t,e,i+800)>.8)return null;const n=t*zi+50+Math.floor(Bt(t,e,i+801)*60),s=e*zi+50+Math.floor(Bt(t,e,i+802)*60),r=En(i,n,s,{}).h,o=6+Math.floor(Bt(t,e,i+803)*3),a=12+Math.floor(Bt(t,e,i+804)*5),l=Math.max(10,Math.min(r-o-7,30));return l+o+5>r||r<=te+1?null:{x:n,y:l,z:s,r:a,ry:o}})}function WM(i,t,e){return yl(`p${i},${t},${e}`,()=>{const n=new wp,s={},r=(l,c)=>En(i,l,c,s).h,o=Fr(i,t,e,4);o&&GM(i,o,n);const a=VM(i,t,e);return a&&KM(i,a,n,r,t),n})}function GM(i,t,e){const n=t.y;e.pad(t.x-fn,t.z-fn,t.x+fn,t.z+fn,n,t.top,sl+2,!0);const s={wall:t.wall,post:t.post,floor:d.PLANKS,roof:t.wall===d.SANDSTONE?"SANDSTONE":t.wall===d.SPRUCE?"DARKPLANKS":"BRICK",roofWall:t.wall};e.fill(t.x-3,n,t.z-3,t.x+3,n,t.z+3,d.PATH);for(const a of t.houses)e.fill(Math.min(t.x,a.front.x),n,Math.min(t.z,a.front.z),Math.max(t.x,a.front.x),n,Math.max(t.z,a.front.z),d.PATH);for(let a=-1;a<=1;a++)for(const l of t.houses)e.set(l.front.x+l.dz*a,n,l.front.z+l.dx*a,d.PATH);e.fill(t.x-2,n,t.z-2,t.x+2,n+1,t.z+2,d.COBBLE),e.fill(t.x-1,n-2,t.z-1,t.x+1,n+1,t.z+1,d.WATER);for(const[a,l]of[[-2,-2],[2,-2],[2,2],[-2,2]])e.fill(t.x+a,n+2,t.z+l,t.x+a,n+4,t.z+l,d.FENCE);e.fill(t.x-2,n+5,t.z-2,t.x+2,n+5,t.z+2,t.wall===d.SANDSTONE?d.SANDSTONE:d.DARKPLANKS),e.set(t.x,n+4,t.z,d.LANTERN);for(const[a,l]of[[-5,-5],[5,-5],[5,5],[-5,5]])e.set(t.x+a,n+1,t.z+l,Mt("streetlight")),e.set(t.x+a+Math.sign(a),n+1,t.z+l,Mt("bench"));e.set(t.x-6,n+1,t.z+1,Mt("barrel")),e.set(t.x+6,n+1,t.z-1,Mt("crates"));for(const a of t.houses)Hn(e,a.x,n,a.z,-a.dx,-a.dz,s,a.role.key);const r=t.field,o=r.z0+r.z1>>1;for(let a=r.z0-1;a<=r.z1+1;a++)for(let l=r.x0-1;l<=r.x1+1;l++){if(a<r.z0||a>r.z1||l<r.x0||l>r.x1){l===r.x0-1&&a===o||e.set(l,n+1,a,d.FENCE);continue}if(a===o){e.set(l,n,a,d.WATER);continue}e.set(l,n,a,d.FARMLAND),e.set(l,n+1,a,Bt(l,a,i+510)<.7?d.WHEAT3:d.WHEAT2)}e.fill(t.mast.x,n+1,t.mast.z,t.mast.x,n+9,t.mast.z,t.post),e.set(t.mast.x,n+10,t.mast.z,d.LANTERN),e.set(t.mast.x+1,n+1,t.mast.z,d.RADIO);for(let a=-3;a<=3;a++)e.set(t.x-11+a,n+1,t.z-11-3,d.FENCE),e.set(t.x-11+a,n+1,t.z-11+3,d.FENCE),e.set(t.x-11-3,n+1,t.z-11+a,d.FENCE),a!==0&&e.set(t.x-11+3,n+1,t.z-11+a,d.FENCE);e.set(t.x-11,n+1,t.z-11,d.HAY)}function KM(i,t,e,n,s,r){const o=(f,u)=>Bt(f,u,i+810);CM(e,t.x,t.y,t.z,t.r,t.ry,t.r,o);for(let f=t.z-t.r;f<=t.z+t.r;f++)for(let u=t.x-t.r;u<=t.x+t.r;u++){let p=-1;for(let m=t.y-t.ry;m<=t.y+t.ry;m++)if(e.get(u,m,f)===d.AIR){p=m;break}if(p<0)continue;const x=Bt(u,f,i+811);x<.03?e.set(u,p,f,d.CRYSTAL):x<.036?(e.set(u,p,f,d.FENCE),e.set(u,p+1,f,d.FENCE),e.set(u,p+2,f,d.LANTERN)):x<.05&&e.set(u,p-1,f,x<.042?d.IRON:d.COPPER);let v=-1;for(let m=t.y+t.ry;m>=t.y;m--)if(e.get(u,m,f)===d.AIR){v=m;break}v>0&&Bt(u,f,i+812)<.02&&e.set(u,v+1,f,d.CRYSTAL)}const a=s*zi,l=t.x-a<zi/2?1:-1,c=t.y-Math.round(t.ry/1.5)+1,h=t.x+l*(t.r-3);for(let f=0;f<=Math.abs(t.r-3);f++)for(let u=-1;u<=1;u++)for(let p=c;p<=c+3;p++)e.set(t.x+l*f,p,t.z+u,d.AIR);LM(e,h,c,t.z,l,0,60,(f,u,p)=>u>=n(f,p))}function XM(i,t,e,n,s,r){const o={},a=(c,h,f,u)=>{if(c<e||c>=e+I||h<n||h>=n+I||En(i,c,h,o).h<t.y+5)return;const p=u==="x"?h-t.z:c-t.x;for(let x=t.y;x<=t.y+2;x++)r(c,x,h)!==d.WATER&&s(c,x,h,d.AIR);r(c,t.y-1,h)===d.AIR&&s(c,t.y-1,h,d.PLANKS),f%5===0&&(p!==0&&(s(c,t.y,h,d.WOOD),s(c,t.y+1,h,d.WOOD)),s(c,t.y+2,h,p===0&&f%10===0&&Bt(c,h,i+605)<.5?d.LAMP:d.PLANKS))},l=(c,h)=>{if(c<e||c>=e+I||h<n||h>=n+I||r(c,t.y+1,h)!==d.STONE)return;const f=Bt(c,h,i+606);f<.07&&s(c,t.y+1,h,f<.035?d.COAL:f<.055?d.COPPER:d.IRON)};for(let c=-t.L;c<=t.L;c++){for(let h=-1;h<=1;h++)a(t.x+c,t.z+h,Math.abs(c),"x"),a(t.x+h,t.z+c,Math.abs(c),"z");l(t.x+c,t.z-2),l(t.x+c,t.z+2),l(t.x-2,t.z+c),l(t.x+2,t.z+c)}for(let c=-2;c<=2;c++)for(let h=-2;h<=2;h++){const f=t.x+h,u=t.z+c;if(!(f<e||f>=e+I||u<n||u>=n+I))for(let p=t.y;p<=t.y+3;p++)s(f,p,u,d.AIR)}s(t.x+2,t.y,t.z+2,d.FURNACE),s(t.x-2,t.y,t.z+2,d.WORKBENCH)}function $M(i,t,e,n,s,r){const o={},a=t.y,l=fn+sl;for(let u=n;u<n+I;u++)for(let p=e;p<e+I;p++){const x=Math.hypot(p-t.x,u-t.z);if(x>l)continue;const v=En(i,p,u,o).h,m=x<=fn?a:Math.round(a+(v-a)*(x-fn)/sl);for(let g=Math.min(v+1,m-3);g<m;g++)s(p,g,u,d.DIRT);s(p,m,u,t.top);for(let g=m+1,_=Math.min(ie-1,Math.max(v,m)+18);g<=_;g++)r(p,g,u)!==d.AIR&&s(p,g,u,d.AIR)}const c=(u,p,x,v,m,g,_)=>{for(let M=p;M<=m;M++)for(let S=Math.max(x,n);S<=Math.min(g,n+I-1);S++)for(let C=Math.max(u,e);C<=Math.min(v,e+I-1);C++)s(C,M,S,_)};c(t.x-3,a,t.z-3,t.x+3,a,t.z+3,d.PATH);for(const u of t.houses){const p=Math.min(t.x,u.front.x),x=Math.max(t.x,u.front.x),v=Math.min(t.z,u.front.z),m=Math.max(t.z,u.front.z);c(p,a,v,x,a,m,d.PATH),c(u.front.x,a,u.front.z,u.door.x,a,u.door.z,d.PATH)}c(t.x-1,a,t.z-1,t.x+1,a+1,t.z+1,d.COBBLE),c(t.x,a-1,t.z,t.x,a,t.z,d.WATER),s(t.x,a+1,t.z,d.AIR);for(const[u,p]of[[-4,-4],[4,-4],[4,4],[-4,4]])c(t.x+u,a+1,t.z+p,t.x+u,a+2,t.z+p,t.post),s(t.x+u,a+3,t.z+p,d.LAMP);for(const u of t.houses){c(u.x-3,a,u.z-3,u.x+3,a,u.z+3,d.COBBLE),c(u.x-2,a,u.z-2,u.x+2,a,u.z+2,d.PLANKS);for(let m=-3;m<=3;m++)for(let g=-3;g<=3;g++){const _=Math.abs(g)===3||Math.abs(m)===3,M=Math.abs(g)===3&&Math.abs(m)===3;for(let C=a+1;C<=a+4;C++)s(u.x+g,C,u.z+m,M?t.post:_?t.wall:d.AIR);(Math.abs(g)===3&&m===0||Math.abs(m)===3&&g===0)&&!(g===-u.dx*3&&m===-u.dz*3)&&s(u.x+g,a+2,u.z+m,d.GLASS)}s(u.door.x,a+1,u.door.z,d.AIR),s(u.door.x,a+2,u.door.z,d.AIR);for(let m=0;m<=4;m++)c(u.x-4+m,a+5+m,u.z-4+m,u.x+4-m,a+5+m,u.z+4-m,t.roof);s(u.x,a+4,u.z,d.LAMP);const p=u.x+u.dx*2+(u.dz?2:0),x=u.z+u.dz*2+(u.dx?2:0),v={bauer:d.WORKBENCH,schmied:d.FURNACE,funker:d.RADIO,hirte:d.WOOL}[u.role.key];if(s(p,a+1,x,v),u.role.key==="schmied"){const m=u.front.x+u.dz*3,g=u.front.z+u.dx*3;s(m,a+1,g,d.FURNACE),s(m,a+2,g,d.COBBLE)}}const h=t.field,f=h.z0+h.z1>>1;for(let u=h.z0;u<=h.z1;u++)for(let p=h.x0;p<=h.x1;p++){if(u===f){s(p,a,u,d.WATER);continue}s(p,a,u,d.FARMLAND),s(p,a+1,u,Bt(p,u,i+510)<.7?d.WHEAT3:d.WHEAT2)}c(t.mast.x,a+1,t.mast.z,t.mast.x,a+7,t.mast.z,t.post),s(t.mast.x,a+8,t.mast.z,d.LAMP),s(t.mast.x+1,a+1,t.mast.z,d.RADIO)}const Ni={taschi:{name:"Taschi-Land",emoji:"🐉",desc:"Heilzentrum, Labor, Arena, Glimmstein-Höhle und Wiesen voller hohem Gras"},zotik:{name:"Zotik: Lunaris",emoji:"🦊",desc:"Dorf am Mondblick mit Kirche, Schmiede, Wirtshaus, Weltentor und Risshöhle im Mondwald",time:.36},anmacha:{name:"AnMaCha – der Podcast",emoji:"🎙️",desc:"Funkhaus mit Studios, Sendemast, Bühne, Café und Plattenladen in der Funkstadt"},maerchen:{name:"Märchenwald",emoji:"🏰",desc:"Dornröschen-Schloss, Rapunzel-Turm, Hexenhaus, Großmutters Haus und die Zwergenmine"}},qM=Object.keys(Ni),ts=72,Lp=(i,t)=>(i===-1||i===0)&&(t===-1||t===0),io=new Map;function Dp(i){const t=En(i,0,0,{}).h;return Math.max(te+4,Math.min(te+14,t))}function YM(i,t){return{x:.5,y:Dp(t)+1.01,z:9.5}}function jM(i,t){const e=i+","+t;return io.has(e)||(io.size>8&&io.clear(),io.set(e,ZM(i,t))),io.get(e)}const Et={white:d.CONCRETE0,black:d.CONCRETE1,red:d.CONCRETE2,orange:d.CONCRETE3,yellow:d.CONCRETE4,green:d.CONCRETE5,blue:d.CONCRETE6,purple:d.CONCRETE7};function ZM(i,t){const e=new wp,n=Dp(t),s=(o,a)=>Bt(o,a,t+900);e.pad(-ts,-ts,ts,ts,n,d.GRASS,10,!0);const r={taschi:JM,zotik:QM,anmacha:tS,maerchen:eS}[i];return r(e,n,s,t),e}function To(i,t,e,n,s,r,o=d.PATH,a=1){t===n?i.fill(t-a,r,Math.min(e,s),t+a,r,Math.max(e,s),o):i.fill(Math.min(t,n),r,e-a,Math.max(t,n),r,e+a,o)}function nu(i,t,e,n=d.PATH,s=d.STONEBRICK){for(let r=-t;r<=t;r++)for(let o=-t;o<=t;o++){const a=Math.hypot(o,r);a<=t&&i.set(o,e,r,a>t-1?s:n)}}function Pp(i,t,e,n="streetlight"){for(const[s,r]of t)i.set(s,e+1,r,Mt(n))}function iu(i,t,e,n=d.LEAVES,s=50,r=ts+6,o=.03,a=()=>!1){for(let l=-r;l<=r;l+=3)for(let c=-r;c<=r;c+=3){const h=Math.hypot(c,l),f=c+Math.floor(e(c,l)*3),u=l+Math.floor(e(l,c)*3);if(h<s||h>r||e(f*7,u*3)>o*9||a(f,u)||h>ts)continue;let p=!1;for(let x=-3;x<=3&&!p;x+=3)for(let v=-3;v<=3&&!p;v+=3)for(const m of[t,t+1,t+3])i.get(f+v,m,u+x)!==void 0&&(p=!0);p||eu(i,f,t+1,u,4+Math.floor(e(f,u*5)*3),n,d.WOOD,2)}}function vc(i,t,e,n,s,r,o,a=.5){for(let l=s;l<=o;l++)for(let c=n;c<=r;c++)i.get(c,t+1,l)===void 0&&i.get(c,t,l)===void 0&&e(c*3,l*5)<a&&i.set(c,t+1,l,d.TALLGRASS)}function su(i,t,e,n,s,r,o,a,l){DM(i,t,e,n,s,15,d.GRASS,a);const c=e+1;PM(i,t,c,n,s-5,8,s-5,d.STONE,a),NM(i,t,n,t+r*(s+1),n+o*(s+1),c,5,2,d.COBBLE);for(let h=3;h<s;h+=4)for(const f of[-3,3])i.set(t+r*h+o*f,c+3,n+o*h+r*f,d.LANTERN);for(let h=n-s+5;h<=n+s-5;h++)for(let f=t-s+5;f<=t+s-5;f++){if(i.get(f,c,h)!==d.AIR)continue;const u=a(f*11,h*13);u<.025?i.set(f,c,h,d.CRYSTAL):u<.03&&(i.set(f,c,h,d.FENCE),i.set(f,c+1,h,d.LANTERN));let p=c+8;for(;p>c&&i.get(f,p,h)!==d.AIR;)p--;p>c+4&&a(f*5,h*7)<.03&&i.set(f,p,h,d.CRYSTAL),a(f*3,h*2)<.02&&i.set(f,c-1,h,u<.5?d.IRON:d.COPPER)}l&&l(c)}function JM(i,t,e){nu(i,9,t);for(const[u,p,x,v]of[[0,-9,0,-20],[0,9,0,22],[-9,0,-20,0],[9,0,24,0]])To(i,u,p,x,v,t);i.fill(-2,t+1,-2,2,t+1,2,d.STONEBRICK);for(let u=0;u<=8;u++)for(let p=-4;p<=4;p++)for(let x=-4;x<=4;x++)Math.hypot(x,u-4,p)>4.3||i.set(x,t+2+u,p,u===4?Et.black:u>4?Et.red:Et.white);for(const u of[4,-4])i.fill(-1,t+5,u,1,t+7,u,Et.black),i.set(0,t+6,u,Et.white);Pp(i,[[-7,-7],[7,-7],[7,7],[-7,7]],t),Hn(i,0,t,-27,0,1,{wall:Et.white,post:Et.red,floor:d.BIRCH,roof:"BRICK",roofWall:Et.white},"heil"),i.fill(-1,t+10,-20,1,t+10,-20,Et.red),i.fill(0,t+9,-20,0,t+11,-20,Et.red),Hn(i,-27,t,0,1,0,{wall:d.SMOOTH,post:d.BIRCH,floor:d.BIRCH,roof:"SMOOTH",roofWall:d.SMOOTH},"labor"),Hn(i,0,t,29,0,-1,{wall:Et.blue,post:Et.white,floor:d.PLANKS,roof:"SMOOTH",roofWall:Et.blue},"laden");const n=40,s=0,r=11,o=8;for(let u=s-o;u<=s+o;u++)for(let p=n-r;p<=n+r;p++){const x=p===n-r||p===n+r||u===s-o||u===s+o||p===n||Math.hypot(p-n,u-s)>2.5&&Math.hypot(p-n,u-s)<3.5;i.set(p,t,u,x?Et.white:d.GRASS)}for(let u=1;u<=4;u++){for(let p=n-r-u;p<=n+r+u;p++)i.set(p,t+u,s-o-u,mi("STONEBRICK",2)),i.fill(p,t+1,s-o-u,p,t+u-1,s-o-u,d.STONEBRICK),i.set(p,t+u,s+o+u,mi("STONEBRICK",0)),i.fill(p,t+1,s+o+u,p,t+u-1,s+o+u,d.STONEBRICK);for(let p=s-o-u+1;p<=s+o+u-1;p++)Math.abs(p-s)<=1||(i.set(n+r+u,t+u,p,mi("STONEBRICK",3)),i.fill(n+r+u,t+1,p,n+r+u,t+u-1,p,d.STONEBRICK))}for(const[u,p]of[[n-r-4,s-o-4],[n+r+4,s-o-4],[n-r-4,s+o+4],[n+r+4,s+o+4]])i.fill(u,t+1,p,u,t+10,p,d.IRONBLOCK),i.fill(u-1,t+11,p-1,u+1,t+11,p+1,d.LAMP);i.fill(n-11,t+1,s-o-5,n+11,t+12,s-o-5,d.STONEBRICK),Eh(i,"ARENA",n-9,t+11,s-o-4,1,0,Et.red);const a=(u,p)=>{i.fill(u-2,t+1,p-2,u+2,t+1,p+2,d.STONEBRICK),i.fill(u-1,t+2,p-1,u+1,t+2,p+1,d.SMOOTH)},l=[[-1,0,-2,1,2,1,Et.orange],[-1,0,1,1,1,1,Et.yellow],[-1,2,1,1,4,3,Et.orange],[-1,2,3,1,2,3,Et.yellow],[-1,4,3,-1,4,3,Et.black],[1,4,3,1,4,3,Et.black],[-1,5,2,-1,5,2,Et.white],[1,5,2,1,5,2,Et.white],[-3,2,-1,-2,3,0,Et.red],[2,2,-1,3,3,0,Et.red],[0,1,-4,0,1,-3,Et.orange],[0,2,-5,0,3,-5,d.MAGMA]],c=[[-2,0,-2,2,2,2,Et.blue],[-1,0,2,1,1,2,Et.yellow],[-1,3,-1,1,5,1,Et.blue],[-1,4,2,1,4,2,Et.blue],[-1,4,2,-1,4,2,Et.black],[1,4,2,1,4,2,Et.black],[0,6,-1,0,6,1,d.ICE],[-2,1,-3,2,1,-3,d.ICE]],h=[[-2,0,-2,2,2,2,Et.green],[-1,3,-1,1,4,1,Et.green],[-1,4,2,-1,4,2,Et.black],[1,4,2,1,4,2,Et.black],[0,5,0,0,6,0,d.WOOD],[-1,7,-1,1,7,1,d.LEAVES],[0,8,0,0,8,0,d.FLOWERS]],f=[[-2,0,-2,2,3,2,d.WOOL],[-1,3,2,-1,3,2,Et.black],[1,3,2,1,3,2,Et.black],[0,2,3,0,2,3,Et.red],[-2,4,0,-2,5,0,d.CLAY],[2,4,0,2,5,0,d.CLAY],[0,1,-3,0,2,-3,d.WOOL]];for(const[u,p,x]of[[-13,-13,l],[13,-13,c],[-13,13,h],[13,13,f]])a(u,p),Rp(i,u,t+3,p,x,0);su(i,-42,t,-40,18,1,0,e,u=>{i.set(-42,u,-40,d.CAPSULE),i.set(-42,u+1,-40,Mt("chest"))}),vc(i,t,e,-60,-10,-14,60,.45),vc(i,t,e,14,14,60,60,.45),vc(i,t,e,14,-60,60,-16,.4),iu(i,t,e,d.LEAVES,54)}function QM(i,t,e){nu(i,10,t,d.STONEBRICK,d.MOONSTONE);for(const[c,h,f,u]of[[0,-10,0,-18],[0,10,0,22],[-10,0,-18,0],[10,0,18,0]])To(i,c,h,f,u,t,d.GRAVEL);Pp(i,[[-8,-8],[8,-8],[8,8],[-8,8],[-3,16],[3,16]],t),i.fill(-4,t+1,-4,4,t+2,4,d.STONEBRICK),i.fill(-3,t+3,-3,3,t+3,3,d.SMOOTH);const n=Et.orange,s=Et.white;Rp(i,0,t+4,0,[[-2,0,-1,-1,1,1,d.DARKPLANKS],[1,0,-1,2,1,1,d.DARKPLANKS],[-2,2,-1,-1,4,0,n],[1,2,-1,2,4,0,n],[-2,5,-1,2,9,1,n],[-1,5,1,1,8,1,s],[-2,6,-1,-2,9,1,d.DARKPLANKS],[2,6,-1,2,9,1,d.DARKPLANKS],[-3,6,0,-3,9,0,n],[3,6,0,3,9,0,n],[-2,10,-2,2,10,2,Et.green],[1,7,-2,1,9,-2,Et.green],[-2,11,-2,2,14,2,n],[-1,11,3,1,12,4,s],[0,12,5,0,12,5,Et.black],[-1,13,3,-1,13,3,Et.black],[1,13,3,1,13,3,Et.black],[-2,15,0,-1,16,0,n],[1,15,0,2,16,0,n],[-2,17,0,-2,17,0,Et.black],[2,17,0,2,17,0,Et.black],[-2,3,-3,2,7,-5,n],[-1,6,-6,1,9,-7,n],[-1,9,-7,1,10,-8,s],[4,6,1,4,7,1,d.DARKPLANKS],[4,8,1,4,8,1,d.CRYSTAL],[4,9,1,4,15,1,d.IRONBLOCK]],0);const r=-44,o=-22,a=6;Os(i,-a,t,r,a,t+8,o,{wall:d.STONEBRICK,post:d.SMOOTH,floor:d.SMOOTH,base:d.STONEBRICK});for(let c=r+3;c<=o-3;c+=4)for(const h of[-a,a])i.fill(h,t+3,c,h,t+6,c+1,d.STAINED1);tu(i,-a,r,a,o,t+9,"STONEBRICK",d.STONEBRICK,!1),bo(i,0,t+1,o),i.fill(-2,t+6,o,2,t+7,o,d.STAINED1);for(let c=o-4;c>=r+7;c-=2)for(const h of[-4,-3,3,4])i.set(h,t+1,c,Mt("bench"));i.fill(-2,t+1,r+2,2,t+1,r+3,d.MARBLE),i.set(0,t+2,r+2,d.GOLDBLOCK),i.set(-2,t+2,r+2,Mt("candles")),i.set(2,t+2,r+2,Mt("candles"));for(let c=o-1;c>=r+4;c--)i.set(0,t+1,c,Mt("rug"));for(const c of[r+5,r+11,o-4])i.set(0,t+7,c,d.LANTERN);Os(i,a+1,t,o-6,a+7,t+22,o,{wall:d.STONEBRICK,post:d.SMOOTH,floor:d.SMOOTH});for(let c=t+1;c<=t+21;c++)i.set(a+6,c,o-3,d.LADDER);i.fill(a,t+1,o-3,a+1,t+2,o-3,d.AIR);for(const c of[t+7,t+14])i.fill(a+2,c,o-5,a+5,c,o-1,d.PLANKS);i.fill(a+2,t+18,o-6,a+6,t+20,o-6,d.AIR),i.fill(a+2,t+18,o,a+6,t+20,o,d.AIR),i.set(a+4,t+21,o-3,d.GOLDBLOCK);for(let c=0;c<4;c++)i.fill(a+1+c,t+23+c,o-6+c,a+7-c,t+23+c,o-c,d.MOONSTONE);Hn(i,-28,t,2,1,0,{wall:d.COBBLE,post:d.DARKPLANKS,roof:"COBBLE",roofWall:d.COBBLE},"schmied"),Hn(i,28,t,2,-1,0,{wall:d.DARKPLANKS,post:d.WOOD,roof:"BRICK",roofWall:d.DARKPLANKS},"wirt"),Hn(i,-24,t,30,0,-1,{wall:d.MOONSTONE,post:d.DARKPLANKS,floor:d.DARKPLANKS,roof:"DARKPLANKS",roofWall:d.MOONSTONE},"laden"),Hn(i,24,t,30,0,-1,{wall:d.PLANKS,post:d.WOOD,roof:"DARKPLANKS",roofWall:d.PLANKS},"wohnen");const l=22;i.fill(-7,t+1,l-2,7,t+1,l+2,d.STONEBRICK);for(let c=-7;c<=7;c++)for(let h=-7;h<=7;h++){const f=Math.hypot(h,c),u=t+9+c;f>=5.5&&f<=7.2&&u>t+1?i.set(h,u,l,(h+c)%4===0?d.CRYSTAL:d.MOONSTONE):f<5.5&&u>t+1&&i.set(h,u,l,d.STAINED1)}su(i,44,t,-40,18,-1,0,e,c=>{for(const[h,f]of[[40,-44],[48,-36],[44,-46],[40,-36]])i.fill(h,c,f,h,c+6,f,d.MOONSTONE);i.set(44,c,-40,Mt("chest"))}),iu(i,t,e,d.MOONLEAVES,40,ts+6,.05)}function tS(i,t,e){for(const[v,m,g,_,M]of[[-70,0,70,0,1],[0,-16,0,70,0]]){for(let S=-3;S<=3;S++)for(let C=M?v:m;C<=(M?g:_);C++){const y=Math.abs(S)===3?d.SMOOTH:S===0&&C%4<2?Et.white:Et.black;M?i.set(C,t,S,y):i.set(S,t,C,y)}for(const S of[-5,-4,4,5])for(let C=M?v:m;C<=(M?g:_);C++)M?i.set(C,t,S,d.SMOOTH):i.set(S,t,C,d.SMOOTH)}i.fill(-17,t,-38,17,t,-11,d.SMOOTH),i.fill(-12,t,38,12,t,62,d.SMOOTH);for(const v of[-30,-15,15,30])i.set(v,t+1,-4,Mt("streetlight")),i.set(v,t+1,4,Mt("streetlight"));for(const v of[14,28,42])i.set(-4,t+1,v,Mt("streetlight")),i.set(4,t+1,v,Mt("streetlight"));i.set(4,t+1,-4,Mt("trafficlight")),i.set(-4,t+1,4,Mt("trafficlight"));for(const[v,m,g]of[[-10,-5,"bench"],[10,-5,"bench"],[-20,5,"hydrant"],[20,5,"trash"],[-5,20,"bench"],[5,34,"hydrant"]])i.set(v,t+1,m,Mt(g));const n=-15,s=15,r=-34,o=-12,a=6;for(let v=0;v<3;v++)Os(i,n,t+v*a,r,s,t+(v+1)*a,o,{wall:Et.white,post:Et.black,floor:v?d.DARKPLANKS:d.MARBLE,base:Et.black,ceil:d.SMOOTH});for(let v=0;v<3;v++)for(let m=n+1;m<s;m++)for(let g=t+v*a+1;g<=t+v*a+4;g++)(m-n)%6!==0&&i.set(m,g,o,d.GLASS);for(let v=t+1;v<=t+3;v++)for(let m=-2;m<=2;m++)i.set(m,v,o,d.AIR);for(let v=0;v<16;v++)i.set(-8+v+(v>=8?1:0),t+2+v%2,r+1,xi+v);for(let v=-9;v<=9;v++)for(const m of[t+1,t+4])i.set(v,m,r+1,Et.black);for(const v of[-3,-2,-1,0,1,2,3])i.set(v,t+1,r+6,Mt("cabinet"));i.set(0,t+2,r+6,Mt("tablelamp")),i.set(-6,t+1,o-3,Mt("couch")),i.set(6,t+1,o-3,Mt("couch")),i.set(-6,t+1,o-5,Mt("table")),i.set(6,t+1,o-5,Mt("table"));for(const[v,m]of[[-13,o-2],[13,o-2],[-13,r+2],[13,r+2]])i.set(v,t+1,m,Mt("bush"));for(const[v,m]of[[-8,-24],[8,-24],[0,-18]])for(let g=0;g<3;g++)i.set(v,t+g*a+5,m,d.LANTERN);for(let v=t+1;v<=t+2*a+1;v++)i.set(s-1,v,r+3,d.LADDER);const l=t+a;for(const[v,m]of[[n+1,-2],[2,s-2]]){for(let _=l+1;_<=l+5;_++)for(let M=v;M<=m;M++)i.set(M,_,r+1,d.FOAM),i.set(M,_,r+11,M===Math.round((v+m)/2)&&_<=l+2?d.AIR:d.FOAM);for(let _=l+1;_<=l+5;_++)for(let M=r+1;M<=r+11;M++)i.set(v,_,M,d.FOAM),i.set(m,_,M,d.FOAM);const g=Math.round((v+m)/2);i.set(g,l+4,r+12,d.ONAIR);for(const _ of[g-2,g+2])i.set(_,l+1,r+5,Mt("tablelong")),i.set(_,l+2,r+5,Mt("tablelamp")),i.set(_,l+1,r+6,Mt("armchair")),i.set(_,l+1,r+4,Mt("armchair"));i.set(g,l+1,r+8,Mt("rug")),i.set(g,l+4,r+6,d.LANTERN),i.set(v+1,l+1,r+2,Mt("shelf")),i.set(g,l+3,r+2,Mt("picture"))}i.fill(s-1,l,r+3,s-1,l,r+3,d.LADDER);const c=t+2*a;i.set(s-1,c,r+3,d.LADDER);for(const v of[-8,0,8])i.set(v,c+1,-24,Mt("couch")),i.set(v,c+1,-22,Mt("table")),i.set(v,c+2,-22,Mt("books"));i.set(-12,c+1,-30,Mt("keg")),i.set(12,c+1,-30,Mt("crates")),i.set(-12,c+1,-16,Mt("lamp")),i.set(12,c+1,-16,Mt("lamp"));const h=t+3*a;i.fill(-14,h+1,o,14,h+6,o,Et.black),Eh(i,"ANMACHA",-13,h+6,o+1,1,0,d.NEON_P),i.fill(10,h+1,-28,10,h+10,-28,d.IRONBLOCK),i.set(10,h+11,-28,d.NEON_R);const f=40,u=-36,p=Math.min(92,t+60);for(let v=t+1;v<=p;v++){const m=Math.max(1,Math.round(4-(v-t)/16));for(const[g,_]of[[-m,-m],[m,-m],[m,m],[-m,m]])i.set(f+g,v,u+_,d.IRONBLOCK);if((v-t)%6===0)for(let g=-m;g<=m;g++)i.set(f+g,v,u-m,d.IRONBLOCK),i.set(f+g,v,u+m,d.IRONBLOCK),i.set(f-m,v,u+g,d.IRONBLOCK),i.set(f+m,v,u+g,d.IRONBLOCK);(v-t)%12===0&&i.set(f,v,u,d.NEON_R)}i.set(f,p+1,u,d.NEON_R);for(let v=t+1;v<=t+20;v++)i.set(f,v,u-4,d.LADDER);i.fill(f-4,t+21,u-4,f+4,t+21,u+4,d.IRONBLOCK),i.set(f,t+21,u-4,d.LADDER),i.set(f,t+22,u-4,d.LADDER);const x=50;i.fill(-9,t+1,x,9,t+2,x+6,d.DARKPLANKS);for(let v=-9;v<=9;v++)i.set(v,t+1,x-1,mi("DARKPLANKS",0));i.fill(-9,t+3,x+7,9,t+12,x+7,d.FOAM);for(const v of[-8,8])i.fill(v,t+3,x+6,v,t+5,x+6,d.FOAM),i.set(v,t+6,x+6,d.NEON_B);i.fill(-9,t+13,x,9,t+13,x,d.IRONBLOCK);for(const v of[-9,9])i.fill(v,t+3,x,v,t+12,x,d.IRONBLOCK);for(let v=-7;v<=7;v+=2)i.set(v,t+12,x,v%4===1?d.NEON_P:d.LAMP);Eh(i,"LIVE",7,t+11,x+6,-1,0,d.ONAIR),i.set(0,t+3,x+3,Mt("tablelong")),i.set(-1,t+3,x+4,Mt("armchair")),i.set(1,t+3,x+4,Mt("armchair")),i.set(0,t+4,x+3,Mt("tablelamp"));for(let v=x-12;v<=x-4;v+=2)for(let m=-8;m<=8;m+=2)Math.abs(m)>1&&i.set(m,t+1,v,Mt("stool"));Hn(i,-32,t,20,1,0,{wall:Et.orange,post:Et.white,floor:d.BIRCH,roof:"SMOOTH",roofWall:Et.orange},"wirt"),Hn(i,32,t,20,-1,0,{wall:Et.purple,post:Et.black,floor:d.DARKPLANKS,roof:"SMOOTH",roofWall:Et.purple},"funker");for(const[v,m]of[[-45,-45],[-50,40],[50,45],[-55,-10],[55,-10]])eu(i,v,t+1,m,5,d.LEAVES,d.WOOD,2)}function eS(i,t,e){nu(i,7,t,d.PATH,d.COBBLE);for(const[u,p,x,v]of[[0,-7,0,-24],[0,7,0,30],[-7,0,-26,0],[7,0,30,0]])To(i,u,p,x,v,t);for(let u=-3;u<=3;u++)for(let p=-3;p<=3;p++){const x=Math.hypot(p,u);x<=3.4&&i.set(p,t+1,u,x>2.4?d.MARBLE:d.WATER)}i.fill(0,t+1,0,0,t+3,0,d.MARBLE),i.set(0,t+4,0,d.GOLDBLOCK),i.set(2,t+2,0,Et.green);const n=-16,s=16,r=-60,o=-30;for(let u=r;u<=o;u++)for(let p=n;p<=s;p++){const x=p===n||p===s||u===r||u===o;i.set(p,t,u,x?d.STONEBRICK:d.PATH),x&&(i.fill(p,t+1,u,p,t+7,u,d.STONEBRICK),(p+u)%2===0&&i.set(p,t+8,u,d.STONEBRICK))}for(const[u,p]of[[n,r],[s,r],[n,o],[s,o]]){$f(i,u,t,p,3,15,d.STONEBRICK,{floors:5,floor:d.PLANKS}),qf(i,u,t+15,p,3,Et.blue);const x=u<0?1:-1,v=p<-45?1:-1;for(let m=t+1;m<=t+14;m++)i.set(u-x*2,m,p,d.LADDER);for(let m=1;m<=3;m++)for(const g of[t+1,t+2])i.set(u+x*m,g,p+v*m,d.AIR)}i.fill(-2,t+1,o,2,t+5,o,d.AIR),i.fill(-3,t+6,o,3,t+10,o,d.STONEBRICK);for(let u=-3;u<=3;u+=2)i.set(u,t+11,o,d.STONEBRICK);for(const u of[-4,4])i.set(u,t+4,o+1,Mt("torch"));const a=r+3,l=r+17,c=8;Os(i,-c,t,a,c,t+9,l,{wall:d.MARBLE,post:d.STONEBRICK,floor:d.MARBLE,ceil:d.STONEBRICK}),tu(i,-c,a,c,l,t+10,"STONEBRICK",d.MARBLE,!1),bo(i,0,t+1,l);for(let u=a+3;u<=l-2;u+=3)for(const p of[-c,c])i.fill(p,t+3,u,p,t+6,u,d.STAINED0);for(let u=l-1;u>=a+3;u--)i.set(0,t+1,u,Mt("rug"));i.fill(-2,t+1,a+1,2,t+1,a+2,d.GOLDBLOCK),i.set(0,t+2,a+1,mi("MARBLE",0)),i.set(-1,t+2,a+1,d.GOLDBLOCK),i.set(1,t+2,a+1,d.GOLDBLOCK),i.set(0,t+4,a+1,Mt("banner")),i.set(-3,t+4,a+1,Mt("banner")),i.set(3,t+4,a+1,Mt("banner"));for(const u of[-5,5])for(let p=a+5;p<=l-3;p+=4)i.set(u,t+1,p,Mt("tablelong")),i.set(u,t+2,p,Mt("candles")),i.set(u-1,t+1,p,Mt("chair")),i.set(u+1,t+1,p,Mt("chair"));for(const u of[a+4,a+9,l-3])i.set(0,t+8,u,d.LANTERN);Os(i,n+1,t,o-9,n+9,t+6,o-1,{wall:d.MARBLE,post:d.STONEBRICK,floor:d.BIRCH,ceil:d.STONEBRICK}),bo(i,n+9,t+1,o-5),i.set(n+4,t+1,o-6,Mt("bed")),i.set(n+2,t+1,o-3,Mt("cabinet")),i.set(n+2,t+2,o-3,Mt("candles")),i.set(n+6,t+1,o-4,Mt("rug")),i.set(n+5,t+5,o-5,d.LANTERN);for(let u=r-4;u<=o+4;u++)for(let p=n-4;p<=s+4;p++)(p===n-4||p===s+4||u===r-4||u===o+4)&&!(Math.abs(p)<=2&&u===o+4)&&i.fill(p,t+1,u,p,t+2,u,d.ROSELEAVES);To(i,0,o+1,0,-7,t);const h=40,f=-12;$f(i,h,t,f,3,28,d.STONEBRICK,{floors:7,floor:d.PLANKS}),qf(i,h,t+28,f,3,Et.purple);for(let u=t+1;u<=t+27;u++)i.set(h+2,u,f,d.LADDER);i.fill(h-3,t+1,f,h-3,t+2,f,d.AIR),bo(i,h-3,t+1,f),i.fill(h,t+23,f-3,h,t+24,f-3,d.AIR),i.set(h,t+22,f+1,Mt("bed")),i.set(h-1,t+22,f-1,Mt("candles")),i.set(h-1,t+26,f,d.LANTERN);for(let u=0;u<18;u++)i.set(h,t+22-u,f-4,u%2?d.HAY:Et.yellow);Hn(i,-34,t,6,1,0,{wall:d.GINGERBREAD,post:d.ICING,floor:d.PLANKS,base:d.ICING,roof:"MARBLE",roofWall:d.ICING},"wohnen"),i.set(-38,t+1,9,d.FURNACE),i.set(-37,t+1,9,d.FURNACE);for(const[u,p]of[[-30,2],[-30,3]])i.fill(u,t+1,p,u,t+2,p,d.FENCE);for(const u of[3,4,8,9])for(const p of[t+2,t+3])i.set(-28,p,u,(u+p)%2?d.STAINED0:d.STAINED2);Hn(i,34,t,34,-1,0,{wall:d.PLANKS,post:d.WOOD,roof:"BRICK",roofWall:d.PLANKS},"wohnen"),To(i,28,0,28,33,t),i.fill(26,t,32,27,t,34,d.PATH),su(i,-40,t,42,18,1,0,e,u=>{for(let p=0;p<7;p++)i.set(-46+p*2,u,34,Mt("bed")),i.set(-46+p*2,u,36,Mt("candles"));for(let p=0;p<7;p++)i.set(-46+p*2,u,44,Mt("stool"));i.set(-42,u,43,Mt("tablelong")),i.set(-40,u,43,Mt("tablelong")),i.set(-44,u,43,Mt("tablelong"));for(let p=-50;p<=-34;p++)i.set(p,u,48,d.RAIL);for(const[p,x]of[[-48,40],[-33,38],[-36,47]])i.set(p,u,x,d.IRON),i.set(p,u+1,x,d.CRYSTAL)}),iu(i,t,e,d.LEAVES,48,ts+6,.05);for(const[u,p]of[[18,40],[24,46],[44,26],[46,44]])eu(i,u,t+1,p,6,d.ROSELEAVES,d.WOOD,2)}const Np=4,Ip=i=>i===2||i===3||i===4?i:1,nS=["nature","flat"],iS=i=>nS.includes(i)?i:null,so=te+2,Op=52;function qa(i,t,e){const n=Qe(t/110,e/110,i,4),s=Qe(t/24,e/24,i+5,2),r=Math.floor(10+n*44+(s-.5)*5);return Math.max(2,Math.min(Op,r))}function li(i,t){return(i+32768)*65536+(t+32768)}class jf{constructor(t,e,n=1,s=null,r=null){this.seed=t|0,this.gen=Ip(n),this.preset=this.gen>=4&&Ni[s]?s:null,this.terrain=this.gen>=2&&!this.preset?iS(r):null,this.structs=this.gen>=3&&!this.terrain,this.chunks=new Map,this.edits=e||new Map,this.dirty=new Set,this.radios=new Map,this.sig=new Map,this.sigDirty=!1,this.onSet=null,this.rot=new Map}setRot(t,e,n,s){if(e<0||e>=ie)return!1;const r=this.chunks.get(li(t>>4,n>>4));if(!r)return!1;const o=(t&15)+(n&15)*I+e*I*I;let a=this.rot.get(r.key);if(s==null){if(!a||!a.delete(o))return!1}else a||(a=new Map,this.rot.set(r.key,a)),a.set(o,s&3);return this.dirty.add(r),!0}getRot(t,e,n){const s=this.rot.get(li(t>>4,n>>4));return s?s.get((t&15)+(n&15)*I+e*I*I):void 0}getChunk(t,e){return this.chunks.get(li(t,e))}ensure(t,e){const n=li(t,e);let s=this.chunks.get(n);return s||(s=this.generate(t,e,n),this.chunks.set(n,s)),s}generate(t,e,n){const s=new Uint8Array(I*I*ie);if(this.terrain==="flat")return this.finish(t,e,n,s,this.generateFlat(s));let r=this.gen>=2?SM(this.seed,t,e,s):this.generate1(t,e,s);const o=(a,l,c)=>this.radios.set(`${a},${l},${c}`,[a,l,c]);if(this.structs&&(r=FM(this.seed,t,e,s,r,o,this.gen,this.preset?Lp:null)),this.preset){const a=jM(this.preset,this.seed);a.touches(t,e)&&(r=a.apply(t,e,s,(l,c)=>En(this.seed,l,c,this.colTmp||(this.colTmp={})).h,r,o))}return this.finish(t,e,n,s,r)}generateFlat(t){for(let e=0;e<=so;e++)t.fill(e===so?d.GRASS:e>=so-3?d.DIRT:d.STONE,e*I*I,(e+1)*I*I);return so}generate1(t,e,n){const s=this.seed;let r=0;for(let o=0;o<I;o++)for(let a=0;a<I;a++){const l=t*I+a,c=e*I+o,h=qa(s,l,c),f=h<=te+1;for(let p=0;p<=h;p++){let x;p===0||p<h-3?x=d.STONE:f?x=d.SAND:p<h?x=d.DIRT:x=h>=46?d.STONE:d.GRASS,n[a+o*I+p*I*I]=x}for(let p=h+1;p<=te;p++)n[a+o*I+p*I*I]=d.WATER;const u=Math.max(h,h<te?te:0);u>r&&(r=u)}for(let o=2;o<I-2;o++)for(let a=2;a<I-2;a++){const l=t*I+a,c=e*I+o;if(Bt(l,c,s+99)>=.012)continue;const h=qa(s,l,c);if(h<=te+1||h>=44||n[a+o*I+h*I*I]!==d.GRASS)continue;const f=4+Math.floor(Bt(l,c,s+7)*3);for(let u=1;u<=f;u++)n[a+o*I+(h+u)*I*I]=d.WOOD;for(let u=f-2;u<=f+1;u++){const p=u>=f?1:2;for(let x=-p;x<=p;x++)for(let v=-p;v<=p;v++){if(p===2&&Math.abs(v)===2&&Math.abs(x)===2&&Bt(l+v,c+x+u,s+3)<.5)continue;const m=a+v+(o+x)*I+(h+u)*I*I;n[m]===d.AIR&&(n[m]=d.LEAVES)}}h+f+1>r&&(r=h+f+1)}return r}finish(t,e,n,s,r){const o=this.edits.get(n);if(o)for(const[a,l]of o){const c=a/(I*I)|0;s[a]===d.RADIO&&l!==d.RADIO&&this.radios.delete(`${t*I+(a&15)},${c},${e*I+(a>>4&15)}`),s[a]=l,c>r&&(r=c);const h=t*I+(a&15),f=e*I+(a>>4&15);l===d.RADIO&&this.radios.set(`${h},${c},${f}`,[h,c,f]),gc.has(l)?(this.sig.set(`${h},${c},${f}`,[h,c,f,l]),this.sigDirty=!0):this.sig.delete(`${h},${c},${f}`)&&(this.sigDirty=!0)}return{cx:t,cz:e,key:n,data:s,maxY:r,hm:null,opaque:null,trans:null,logo:null,meshed:!1}}getBlock(t,e,n){if(e<0)return d.STONE;if(e>=ie)return d.AIR;const s=this.chunks.get(li(t>>4,n>>4));return s?s.data[(t&15)+(n&15)*I+e*I*I]:d.AIR}isLoaded(t,e){return this.chunks.has(li(t>>4,e>>4))}isSolid(t,e,n){if(e<0)return!0;if(e>=ie)return!1;const s=this.chunks.get(li(t>>4,n>>4));return s?Io[s.data[(t&15)+(n&15)*I+e*I*I]]===1:!0}setBlock(t,e,n,s){if(e<0||e>=ie)return!1;const r=t>>4,o=n>>4,a=this.chunks.get(li(r,o));if(!a)return!1;const l=t&15,c=n&15,h=l+c*I+e*I*I,f=a.data[h];if(f===s)return!1;a.data[h]=s;const u=this.rot.get(a.key);u&&u.delete(h),f===d.RADIO&&this.radios.delete(`${t},${e},${n}`),s===d.RADIO&&this.radios.set(`${t},${e},${n}`,[t,e,n]),gc.has(s)?(this.sig.set(`${t},${e},${n}`,[t,e,n,s]),this.sigDirty=!0):gc.has(f)&&(this.sig.delete(`${t},${e},${n}`),this.sigDirty=!0),e>a.maxY&&(a.maxY=e),a.hm=null;let p=this.edits.get(a.key);p||(p=new Map,this.edits.set(a.key,p)),p.set(h,s),this.dirty.add(a);const x=l===0?-1:l===I-1?1:0,v=c===0?-1:c===I-1?1:0;for(let m=Math.min(0,v);m<=Math.max(0,v);m++)for(let g=Math.min(0,x);g<=Math.max(0,x);g++)if(g||m){const _=this.chunks.get(li(r+g,o+m));_&&this.dirty.add(_)}return this.onSet&&this.onSet(t,e,n,s),!0}heightmap(t){if(t.hm)return t.hm;const e=new Uint8Array(I*I),n=t.data;for(let s=0;s<I*I;s++)for(let r=Math.min(ie-1,t.maxY);r>=0;r--)if(Ep[n[s+r*I*I]]){e[s]=r+1;break}return t.hm=e}neighborhood(t){const e=new Array(9);for(let n=-1;n<=1;n++)for(let s=-1;s<=1;s++){const r=this.chunks.get(li(t.cx+s,t.cz+n));if(!r)return null;e[(n+1)*3+s+1]=r.data}return e}findSpawn(t=!0){if(this.preset){const e=YM(this.preset,this.seed);return this.ensure(Math.floor(e.x)>>4,Math.floor(e.z)>>4),e}if(this.terrain==="flat")return this.ensure(0,0),{x:.5,y:so+1.01,z:.5};if(this.structs&&t){const e=Cp(this.seed,0,0,2,this.gen);if(e)return this.ensure(e.x>>4,e.z+3>>4),{x:e.x+.5,y:e.y+1.01,z:e.z+3.5}}if(this.gen>=2){const e=this.findSpawn2();if(e)return e}for(let e=0;e<60;e++)for(let n=0;n<Math.max(1,e*8);n++){const s=n/Math.max(1,e*8)*Math.PI*2,r=Math.round(Math.cos(s)*e*4),o=Math.round(Math.sin(s)*e*4),a=qa(this.seed,r,o);if(a<=te+1||a>=44)continue;const l=this.ensure(r>>4,o>>4);let c=ie-1;for(;c>0&&l.data[(r&15)+(o&15)*I+c*I*I]===d.AIR;)c--;const h=l.data[(r&15)+(o&15)*I+c*I*I];if(!(h===d.WOOD||h===d.LEAVES||h===d.WATER))return{x:r+.5,y:c+1.01,z:o+.5}}return{x:.5,y:Op+2,z:.5}}findSpawn2(){const t={};for(let e=0;e<120;e++){const n=Math.max(1,e*8);for(let s=0;s<n;s++){const r=s/n*Math.PI*2,o=Math.round(Math.cos(r)*e*8),a=Math.round(Math.sin(r)*e*8);if(En(this.seed,o,a,t),!vM.includes(t.biome)||t.h<te+2||t.h>te+18)continue;const l=this.ensure(o>>4,a>>4);let c=ie-1;for(;c>0&&l.data[(o&15)+(a&15)*I+c*I*I]===d.AIR;)c--;const h=l.data[(o&15)+(a&15)*I+c*I*I];if(!(h!==d.GRASS&&h!==d.FLOWERS)&&!(l.data[(o&15)+(a&15)*I+(c+1)*I*I]!==d.AIR||l.data[(o&15)+(a&15)*I+(c+2)*I*I]!==d.AIR))return{x:o+.5,y:c+1.01,z:a+.5}}}return null}biomeAt(t,e){return this.gen<2?-1:this.terrain==="flat"?It.PLAINS:En(this.seed,Math.floor(t),Math.floor(e),{}).biome}villageAt(t,e){if(!this.structs)return null;const n=Fr(this.seed,Vn(Math.floor(t)),Vn(Math.floor(e)),this.gen);return n&&Math.hypot(n.x+.5-t,n.z+.5-e)<=fn+4?n:null}}const kp={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class Go{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const sS=new qh(-1,1,1,-1,0,1);class rS extends ke{constructor(){super(),this.setAttribute("position",new We([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new We([0,2,0,0,2,0],2))}}const oS=new rS;class Up{constructor(t){this._mesh=new Re(oS,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,sS)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}}class zp extends Go{constructor(t,e){super(),this.textureID=e!==void 0?e:"tDiffuse",t instanceof Ve?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=tl.clone(t.uniforms),this.material=new Ve({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this.fsQuad=new Up(this.material)}render(t,e,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this.fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class Zf extends Go{constructor(t,e){super(),this.scene=t,this.camera=e,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,e,n){const s=t.getContext(),r=t.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let o,a;this.inverse?(o=0,a=1):(o=1,a=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,o,4294967295),r.buffers.stencil.setClear(a),r.buffers.stencil.setLocked(!0),t.setRenderTarget(n),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(e),this.clear&&t.clear(),t.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}}class aS extends Go{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}}class lS{constructor(t,e){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),e===void 0){const n=t.getSize(new zt);this._width=n.width,this._height=n.height,e=new Nn(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:vi}),e.texture.name="EffectComposer.rt1"}else this._width=e.width,this._height=e.height;this.renderTarget1=e,this.renderTarget2=e.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new zp(kp),this.copyPass.material.blending=Di,this.clock=new aM}swapBuffers(){const t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,e){this.passes.splice(e,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){const e=this.passes.indexOf(t);e!==-1&&this.passes.splice(e,1)}isLastEnabledPass(t){for(let e=t+1;e<this.passes.length;e++)if(this.passes[e].enabled)return!1;return!0}render(t){t===void 0&&(t=this.clock.getDelta());const e=this.renderer.getRenderTarget();let n=!1;for(let s=0,r=this.passes.length;s<r;s++){const o=this.passes[s];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),o.render(this.renderer,this.writeBuffer,this.readBuffer,t,n),o.needsSwap){if(n){const a=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(a.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),l.setFunc(a.EQUAL,1,4294967295)}this.swapBuffers()}Zf!==void 0&&(o instanceof Zf?n=!0:o instanceof aS&&(n=!1))}}this.renderer.setRenderTarget(e)}reset(t){if(t===void 0){const e=this.renderer.getSize(new zt);this._pixelRatio=this.renderer.getPixelRatio(),this._width=e.width,this._height=e.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,e){this._width=t,this._height=e;const n=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(n,s),this.renderTarget2.setSize(n,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,s)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class cS extends Go{constructor(t,e,n=null,s=null,r=null){super(),this.scene=t,this.camera=e,this.overrideMaterial=n,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new se}render(t,e,n){const s=t.autoClear;t.autoClear=!1;let r,o;this.overrideMaterial!==null&&(o=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(t.getClearColor(this._oldClearColor),t.setClearColor(this.clearColor,t.getClearAlpha())),this.clearAlpha!==null&&(r=t.getClearAlpha(),t.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&t.clearDepth(),t.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),t.render(this.scene,this.camera),this.clearColor!==null&&t.setClearColor(this._oldClearColor),this.clearAlpha!==null&&t.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=o),t.autoClear=s}}const hS={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new se(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class Dr extends Go{constructor(t,e,n,s){super(),this.strength=e!==void 0?e:1,this.radius=n,this.threshold=s,this.resolution=t!==void 0?new zt(t.x,t.y):new zt(256,256),this.clearColor=new se(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);this.renderTargetBright=new Nn(r,o,{type:vi}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let f=0;f<this.nMips;f++){const u=new Nn(r,o,{type:vi});u.texture.name="UnrealBloomPass.h"+f,u.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(u);const p=new Nn(r,o,{type:vi});p.texture.name="UnrealBloomPass.v"+f,p.texture.generateMipmaps=!1,this.renderTargetsVertical.push(p),r=Math.round(r/2),o=Math.round(o/2)}const a=hS;this.highPassUniforms=tl.clone(a.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Ve({uniforms:this.highPassUniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this.separableBlurMaterials=[];const l=[3,5,7,9,11];r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);for(let f=0;f<this.nMips;f++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(l[f])),this.separableBlurMaterials[f].uniforms.invSize.value=new zt(1/r,1/o),r=Math.round(r/2),o=Math.round(o/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=e,this.compositeMaterial.uniforms.bloomRadius.value=.1;const c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new O(1,1,1),new O(1,1,1),new O(1,1,1),new O(1,1,1),new O(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;const h=kp;this.copyUniforms=tl.clone(h.uniforms),this.blendMaterial=new Ve({uniforms:this.copyUniforms,vertexShader:h.vertexShader,fragmentShader:h.fragmentShader,blending:Pc,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new se,this.oldClearAlpha=1,this.basic=new si,this.fsQuad=new Up(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(t,e){let n=Math.round(t/2),s=Math.round(e/2);this.renderTargetBright.setSize(n,s);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(n,s),this.renderTargetsVertical[r].setSize(n,s),this.separableBlurMaterials[r].uniforms.invSize.value=new zt(1/n,1/s),n=Math.round(n/2),s=Math.round(s/2)}render(t,e,n,s,r){t.getClearColor(this._oldClearColor),this.oldClearAlpha=t.getClearAlpha();const o=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),r&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=n.texture,t.setRenderTarget(null),t.clear(),this.fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this.fsQuad.render(t);let a=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this.fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=a.texture,this.separableBlurMaterials[l].uniforms.direction.value=Dr.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[l]),t.clear(),this.fsQuad.render(t),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=Dr.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[l]),t.clear(),this.fsQuad.render(t),a=this.renderTargetsVertical[l];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this.fsQuad.render(t),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(n),this.fsQuad.render(t)),t.setClearColor(this._oldClearColor,this.oldClearAlpha),t.autoClear=o}getSeperableBlurMaterial(t){const e=[];for(let n=0;n<t;n++)e.push(.39894*Math.exp(-.5*n*n/(t*t))/t);return new Ve({defines:{KERNEL_RADIUS:t},uniforms:{colorTexture:{value:null},invSize:{value:new zt(.5,.5)},direction:{value:new zt(.5,.5)},gaussianCoefficients:{value:e}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}getCompositeMaterial(t){return new Ve({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}}Dr.BlurDirectionX=new zt(1,0);Dr.BlurDirectionY=new zt(0,1);const ru=1,Fp=`
uniform sampler2D uShadowMap; uniform mat4 uShadowMat; uniform float uShadowOn; uniform float uShadowTexel; uniform vec3 uFogSun;
// weicher Schatten: 12 gedrehte Stichproben (Poisson) um den Punkt, Rand des Schattenbereichs blendet aus
const vec2 PD[12] = vec2[12](vec2(-0.326,-0.406), vec2(-0.840,-0.074), vec2(-0.696,0.457), vec2(-0.203,0.621), vec2(0.962,-0.195), vec2(0.473,-0.480),
  vec2(0.519,0.767), vec2(0.185,-0.893), vec2(0.507,0.064), vec2(0.896,0.412), vec2(-0.322,-0.933), vec2(-0.792,-0.598));
float shadowAt(vec3 wp, vec3 n) {
  if (uShadowOn < 0.5) return 1.0;
  vec3 p = (uShadowMat * vec4(wp + n * 0.08, 1.0)).xyz * 0.5 + 0.5;
  float edge = min(min(p.x, 1.0 - p.x), min(p.y, 1.0 - p.y));
  if (edge <= 0.0 || p.z >= 1.0) return 1.0;
  float a = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) * 6.2832, cs = cos(a), sn = sin(a);
  float s = 0.0, r = uShadowTexel * 1.8;
  for (int i = 0; i < 12; i++) {
    vec2 o = vec2(PD[i].x * cs - PD[i].y * sn, PD[i].x * sn + PD[i].y * cs) * r;
    s += step(p.z - 0.0012, texture2D(uShadowMap, p.xy + o).r);
  }
  return mix(1.0, s / 12.0, smoothstep(0.0, 0.06, edge));
}
// Dunst: Entfernung + leichter Grundschleier, in Richtung Sonne warm aufgehellt
vec3 applyFog(vec3 c, vec3 wp, float dist, vec3 fog, vec2 range, vec3 sunDir) {
  vec3 v = normalize(wp - cameraPosition);
  vec3 fc = fog + uFogSun * pow(max(dot(v, sunDir), 0.0), 6.0);
  float f = max(smoothstep(range.x, range.y, dist), (1.0 - exp(-dist * 0.006)) * 0.3);
  return mix(c, fc, f);
}
// warmes Licht von Lampen und Fackeln (Blocklicht 0..1 aus dem Mesher)
vec3 blockGlow(float b) { return vec3(1.0, 0.72, 0.44) * pow(b, 2.0) * 1.05; }
// Shader rechnen in Anzeige-Farben; für Nachbearbeitung und Bloom linear ausgeben (am Bildschirm wieder genau gleich)
vec3 toLinear(vec3 c) { c = max(c, 0.0); return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }
`,Jf=()=>({uShadowMap:{value:null},uShadowMat:{value:new ge},uShadowOn:{value:0},uShadowTexel:{value:1/2048},uFogSun:{value:new O}});class uS{constructor(t){this.uni=t,this.size=0,this.rt=null,this.radius=40,this.frame=0,this.every=1,this.cam=new qh(-1,1,1,-1,1,320),this.cam.layers.set(ru),this.matAtlas=null,this.matPlain=new si({colorWrite:!1,side:Mn}),this.tmp=new O,this.saved=[]}setAtlas(t){this.matAtlas=new si({map:t,alphaTest:.5,colorWrite:!1,side:Mn})}configure(t,e,n){if(this.radius=e,this.every=n,t===this.size){this.uni.uShadowOn.value=t?1:0;return}this.rt&&(this.rt.dispose(),this.rt=null),this.size=t,t&&(this.rt=new Nn(t,t,{depthBuffer:!0}),this.rt.depthTexture=new jh(t,t,ls),this.rt.depthTexture.minFilter=this.rt.depthTexture.magFilter=nn,this.uni.uShadowMap.value=this.rt.depthTexture),this.uni.uShadowOn.value=t?1:0,this.frame=0}update(t,e,n,s,r,o){if(!this.size)return;if(r.y<.04){this.uni.uShadowOn.value=0;return}if(this.uni.uShadowOn.value=1,!o&&this.frame++%this.every)return;const a=this.cam,l=this.radius,c=2*l/this.size;a.left=-l,a.right=l,a.top=l,a.bottom=-l,a.updateProjectionMatrix(),a.position.copy(r).multiplyScalar(160),a.lookAt(0,0,0),a.updateMatrixWorld();const h=this.tmp.copy(s).applyMatrix4(a.matrixWorldInverse);h.x=Math.round(h.x/c)*c,h.y=Math.round(h.y/c)*c,h.applyMatrix4(a.matrixWorld),a.position.copy(h).addScaledVector(r,160),a.updateMatrixWorld(),this.uni.uShadowMat.value.multiplyMatrices(a.projectionMatrix,a.matrixWorldInverse),this.uni.uShadowTexel.value=1/this.size;const f=this.saved;f.length=0;for(const p of n.children)p.layers.test(a.layers)&&(f.push(p,p.material),p.material=p.userData.atlas&&this.matAtlas?this.matAtlas:this.matPlain);const u=e.background;e.background=null,t.setRenderTarget(this.rt),t.clear(!0,!0,!1),t.render(e,a),t.setRenderTarget(null),e.background=u;for(let p=0;p<f.length;p+=2)f[p].material=f[p+1];f.length=0}dispose(){this.configure(0,this.radius,1)}}const Ue=64,_o=12,kn=4,ro=Ue*_o,fS=`
varying vec3 vN; varying vec3 vWp;
void main(){ vN = normal; vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0); vWp = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`,dS=`
uniform vec3 uCol; uniform vec3 uSunCol; uniform vec3 uSunDir; uniform vec3 uFog; uniform vec2 uFade; uniform vec3 uFogSun;
varying vec3 vN; varying vec3 vWp;
vec3 toLin(vec3 c) { c = max(c, 0.0); return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }
void main(){
  float shade = vN.y > 0.5 ? 1.0 : vN.y < -0.5 ? 0.74 : 0.87;
  vec3 c = uCol * shade + uSunCol * max(dot(vN, uSunDir), 0.0) * 0.35;
  float d = length(vWp.xz - cameraPosition.xz);
  vec3 v = normalize(vWp - cameraPosition);
  c = mix(c, uFog + uFogSun * pow(max(dot(v, uSunDir), 0.0), 6.0), smoothstep(uFade.x * 0.4, uFade.y, d) * 0.7);
  float a = 0.88 * (1.0 - smoothstep(uFade.x, uFade.y, d));
  if (a < 0.01) discard;
  gl_FragColor = vec4(toLin(c), a);
  #include <colorspace_fragment>
}`;function pS(i=7){const t=new Uint8Array(Ue*Ue);for(let e=0;e<Ue;e++)for(let n=0;n<Ue;n++){const r=(c,h)=>Qe(c/Ue*9,h/Ue*9,i,3),o=n/Ue,a=e/Ue,l=r(n,e)*(1-o)*(1-a)+r(n-Ue,e)*o*(1-a)+r(n,e-Ue)*(1-o)*a+r(n-Ue,e-Ue)*o*a;t[n+e*Ue]=l>.53?1:0}return t}function mS(i){const t=[],e=[],n=[],s=(a,l)=>i[(a+Ue)%Ue+(l+Ue)%Ue*Ue],r=(a,l)=>{const c=t.length/3;for(const h of a)t.push(...h),e.push(...l);n.push(c,c+1,c+2,c,c+2,c+3)};for(let a=0;a<Ue;a++)for(let l=0;l<Ue;l++){if(!s(l,a))continue;const c=l*_o,h=c+_o,f=a*_o,u=f+_o;r([[c,kn,f],[c,kn,u],[h,kn,u],[h,kn,f]],[0,1,0]),r([[c,0,f],[h,0,f],[h,0,u],[c,0,u]],[0,-1,0]),s(l+1,a)||r([[h,0,f],[h,kn,f],[h,kn,u],[h,0,u]],[1,0,0]),s(l-1,a)||r([[c,0,u],[c,kn,u],[c,kn,f],[c,0,f]],[-1,0,0]),s(l,a+1)||r([[h,0,u],[h,kn,u],[c,kn,u],[c,0,u]],[0,0,1]),s(l,a-1)||r([[c,0,f],[c,kn,f],[h,kn,f],[h,0,f]],[0,0,-1])}const o=new ke;return o.setAttribute("position",new We(t,3)),o.setAttribute("normal",new We(e,3)),o.setIndex(t.length/3>65535?new $h(n,1):new Xh(n,1)),o}class gS{constructor(t,e){this.u={uCol:{value:new O(1,1,1)},uSunCol:e.uSunCol,uSunDir:e.uSunDir,uFog:e.uFog,uFogSun:e.uFogSun,uFade:{value:new zt(260,440)}},this.mesh=new _p(mS(pS()),new Ve({vertexShader:fS,fragmentShader:dS,uniforms:this.u,transparent:!0,depthWrite:!0}),9),this.mesh.frustumCulled=!1,this.mesh.visible=!1,this.mesh.renderOrder=-5,this.m4=new ge,t.add(this.mesh)}update(t,e,n,s){if(this.mesh.visible=s,!s)return;const r=e*1.4%ro,o=Math.floor((t.x-r)/ro),a=Math.floor(t.z/ro);let l=0;for(let c=-1;c<=1;c++)for(let h=-1;h<=1;h++)this.mesh.setMatrixAt(l++,this.m4.makeTranslation(r+(o+h)*ro,112,(a+c)*ro));this.mesh.instanceMatrix.needsUpdate=!0,this.u.uCol.value.set(n[0],n[1],n[2])}}const vS={uniforms:{tDiffuse:{value:null},uVig:{value:.22},uSat:{value:1}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
uniform sampler2D tDiffuse; uniform float uVig; uniform float uSat; varying vec2 vUv;
vec3 toSrgb(vec3 c) { c = max(c, 0.0); return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
void main(){
  vec3 c = texture2D(tDiffuse, vUv).rgb;
  c = c / (1.0 + max(0.0, max(c.r, max(c.g, c.b)) - 0.8) * 0.6); // Lichter weich abfangen statt hart abschneiden
  vec3 s = toSrgb(c);
  float l = dot(s, vec3(0.299, 0.587, 0.114));
  s = mix(vec3(l), s, uSat);
  s = mix(s, s * s * (3.0 - 2.0 * s), 0.12); // etwas mehr Tiefe
  vec2 q = vUv - 0.5; s *= 1.0 - uVig * dot(q, q) * 2.2;
  s += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0; // gegen Farbstufen im Himmel
  gl_FragColor = vec4(s, 1.0);
}`};class xS{constructor(t,e,n,s){this.renderer=t;const r=new Nn(2,2,{type:vi,samples:s?4:0});this.composer=new lS(t,r),this.composer.addPass(new cS(e,n)),this.bloom=new Dr(new zt(256,256),.32,.55,.86),this.composer.addPass(this.bloom),this.grade=new zp(vS),this.composer.addPass(this.grade)}setSize(t,e,n){this.composer.setPixelRatio(n),this.composer.setSize(t,e)}render(){this.composer.render()}dispose(){this.composer.dispose()}}const _S=`
uniform vec3 uAmb; uniform vec3 uSunCol; uniform vec3 uSunDir;
varying vec2 vUv; varying vec3 vAmb; varying vec3 vSun; varying float vEm; varying float vDist; varying vec3 vWp; varying vec3 vN; varying float vBl;
void main(){
  vBl = instanceColor.b;
  vec3 n = normalize(mat3(instanceMatrix) * normal);
  float sky = instanceColor.r, em = instanceColor.g;
  vN = n;
  vAmb = uAmb * (0.62 + 0.38 * (n.y * 0.5 + 0.5)) * (0.5 + 0.5 * sky);
  vSun = uSunCol * max(dot(n, uSunDir), 0.0) * sky;
  vEm = em;
  vUv = uv;
  vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vWp = wp.xyz;
  vec4 mv = viewMatrix * wp;
  vDist = length(mv.xyz);
  gl_Position = projectionMatrix * mv;
}`,MS=`
uniform sampler2D uMap; uniform vec3 uFog; uniform vec2 uFogRange; uniform vec3 uSunDir;
varying vec2 vUv; varying vec3 vAmb; varying vec3 vSun; varying float vEm; varying float vDist; varying vec3 vWp; varying vec3 vN; varying float vBl;
${Fp}
void main(){
  float sh = dot(vSun, vSun) > 0.0 ? shadowAt(vWp, vN) : 1.0;
  vec3 c = texture2D(uMap, vUv).rgb * max(vAmb + vSun * sh + blockGlow(vBl), vec3(vEm));
  c = mix(vec3(dot(c, vec3(0.299, 0.587, 0.114))), c, 1.1); c = c * 1.15 / (1.0 + 0.15 * c);
  gl_FragColor = vec4(toLinear(applyFog(c, vWp, vDist, uFog, uFogRange, uSunDir)), 1.0);
  #include <colorspace_fragment>
}`;function SS(i,t){return i.map(e=>{let n=e.off;const s=new Uint16Array(t,n,e.nv*3);n+=e.nv*6;const r=new Int8Array(t,n,e.nv*3);n+=e.nv*3,n%2&&n++;const o=new Uint16Array(t,n,e.nv*2);n+=e.nv*4;const a=new Uint16Array(t,n,e.ni),l=new Float32Array(e.nv*3),c=new Float32Array(e.nv*3),h=new Float32Array(e.nv*2);for(let f=0;f<e.nv*3;f++){const u=f%3;l[f]=e.lo[u]+s[f]/65535*(e.hi[u]-e.lo[u]),c[f]=r[f]/127}for(let f=0;f<e.nv*2;f++)h[f]=o[f]/65535;return{name:e.name,pos:l,nor:c,uv:h,idx:new Uint16Array(a),lo:e.lo,hi:e.hi}})}function yS(i,t,e,n,s,r,o,a){const l=s*Math.PI/2,c=Math.cos(l),h=Math.sin(l),f=r?.5-o/2-.02:0,u=Math.sin(l),p=Math.cos(l),x=t+.5-u*f,v=n+.5-p*f;return i.set(c,0,h,x-.5*c-.5*h,0,1,0,e+a,-h,0,c,v+.5*h-.5*c,0,0,0,1),i}class ES{constructor(t,e,n="kaykit/"){this.group=t,this.uni=e,this.base=n,this.geos=null,this.meta=null,this.mat=null,this.state=0,this.chunks=new Map,this.waiting=new Map,this.m4=new ge,this.col=new se}load(){if(this.state)return;this.state=1;const t=new Promise(e=>new oM().load(this.base+"deco.png",e,void 0,()=>e(null)));Promise.all([fetch(this.base+"deco.json").then(e=>e.json()),fetch(this.base+"deco.bin").then(e=>e.arrayBuffer()),t]).then(([e,n,s])=>{const r=SS(e,n);s&&(s.flipY=!1,s.magFilter=dn,s.minFilter=dn,s.generateMipmaps=!1),this.mat=new Ve({vertexShader:_S,fragmentShader:MS,uniforms:{uAmb:this.uni.uAmb,uSunCol:this.uni.uSunCol,uSunDir:this.uni.uSunDir,uFog:this.uni.uFog,uFogRange:this.uni.uFogRange,uShadowMap:this.uni.uShadowMap,uShadowMat:this.uni.uShadowMat,uShadowOn:this.uni.uShadowOn,uShadowTexel:this.uni.uShadowTexel,uFogSun:this.uni.uFogSun,uMap:{value:s}}}),this.meta=r,this.geos=r.map(o=>{const a=new ke;return a.setAttribute("position",new we(o.pos,3)),a.setAttribute("normal",new we(o.nor,3)),a.setAttribute("uv",new we(o.uv,2)),a.setIndex(new we(o.idx,1)),a}),this.state=2;for(const[o,a]of this.waiting)this.setChunk(o,a);this.waiting.clear(),this.onReady&&this.onReady()}).catch(()=>{this.state=3,this.waiting.clear()})}setChunk(t,e){if(this.drop(t),!e||!e.length)return;if(this.state!==2){this.state!==3&&(this.waiting.set(t,e),this.load());return}const n=new Map;for(let r=0;r<e.length;r+=8){const o=zr[e[r+3]];o!=null&&(n.has(o)||n.set(o,[]),n.get(o).push(r))}const s=[];for(const[r,o]of n){const a=Vs[r],l=this.meta[r],c=new _p(this.geos[r],this.mat,o.length);o.forEach((h,f)=>{yS(this.m4,t.cx*16+e[h],e[h+1],t.cz*16+e[h+2],e[h+4],a.wall,l.hi[2]-l.lo[2],e[h+6]),c.setMatrixAt(f,this.m4),c.setColorAt(f,this.col.setRGB(e[h+5],a.emit?1:0,e[h+7]||0))}),c.frustumCulled=!1,c.layers.enable(ru),this.group.add(c),s.push(c)}this.chunks.set(t,s)}drop(t){this.waiting.delete(t);const e=this.chunks.get(t);if(e){for(const n of e)this.group.remove(n),n.dispose();this.chunks.delete(t)}}clear(){for(const t of[...this.chunks.keys()])this.drop(t);this.waiting.clear()}}const rl=200,Bp=2,bS=["survival","creative","story"],ri=i=>"klotzfunk.world."+i,Ws=i=>"klotzfunk.meta."+i,gi=i=>"klotzfunk-bak.world."+i,Ls=i=>"klotzfunk-bak.time."+i,TS=10*60*1e3,Gs=()=>{try{return globalThis.localStorage||null}catch{return null}},yn=i=>{try{return Gs().getItem(i)}catch{return null}},Br=i=>{try{return i?JSON.parse(i):null}catch{return null}};function Hp(i){const t={};for(const[e,n]of i){if(!n.size)continue;const s=new Uint8Array(n.size*3);let r=0;for(const[a,l]of n)s[r++]=a&255,s[r++]=a>>8,s[r++]=l;let o="";for(let a=0;a<s.length;a+=8192)o+=String.fromCharCode.apply(null,s.subarray(a,a+8192));t[e]=btoa(o)}return t}function AS(i){const t=new Map;if(!i||typeof i!="object")return t;for(const e of Object.keys(i)){const n=i[e],s=new Map;if(Array.isArray(n))for(let o=0;o+1<n.length;o+=2)Number.isInteger(n[o])&&Number.isInteger(n[o+1])&&s.set(n[o],n[o+1]&255);else if(typeof n=="string"){let o="";try{o=atob(n)}catch{continue}for(let a=0;a+2<o.length;a+=3)s.set(o.charCodeAt(a)|o.charCodeAt(a+1)<<8,o.charCodeAt(a+2))}const r=Number(e);s.size&&Number.isFinite(r)&&t.set(r,s)}return t}function wS(i){const t={};if(i){for(const[e,n]of i)if(n.size){const s=[];for(const[r,o]of n)s.push(r,o);t[e]=s}}return t}function RS(i){const t=new Map;if(!i||typeof i!="object")return t;for(const e of Object.keys(i)){const n=i[e],s=Number(e),r=new Map;if(!(!Array.isArray(n)||!Number.isFinite(s))){for(let o=0;o+1<n.length;o+=2)Number.isInteger(n[o])&&n[o]>=0&&n[o]<65536&&Number.isInteger(n[o+1])&&r.set(n[o],n[o+1]&3);r.size&&t.set(s,r)}}return t}function Ko(i){return!!i&&typeof i=="object"&&Number.isFinite(i.seed)&&bS.includes(i.mode)&&typeof i.name=="string"&&(i.edits===void 0||typeof i.edits=="object"&&i.edits!==null)}function CS(i){return Br(yn(Ws(i)))}function Xo(i){const t=Br(yn(ri(i)));return Ko(t)?t:null}function Vp(i){const t=Br(yn(gi(i)));return Ko(t)?t:null}function LS(i){return yn(gi(i))!==null}const El=i=>({name:i.name,mode:i.mode,seed:i.seed,gen:i.gen||1,preset:i.preset||void 0,terrain:i.terrain||void 0,savedAt:i.savedAt,q:i.story?i.story.done?-1:i.story.i:void 0,qc:i.story?i.story.c:void 0});function ou(i,t){const e=Gs();if(!e)return!1;let n;try{n=JSON.stringify(t)}catch{return!1}const s=yn(ri(i)),r=Date.now();if(s&&s!==n&&r-(Number(yn(Ls(i)))||0)>TS&&Ko(Br(s)))try{e.setItem(gi(i),s),e.setItem(Ls(i),String(r))}catch{try{e.removeItem(gi(i)),e.removeItem(Ls(i))}catch{}}try{e.setItem(ri(i),n)}catch{try{for(let a=0;a<rl;a++)(yn(gi(a))!==null||yn(Ls(a))!==null)&&(e.removeItem(gi(a)),e.removeItem(Ls(a)));e.setItem(ri(i),n)}catch{return!1}}try{e.setItem(Ws(i),JSON.stringify(El(t)))}catch{}return!0}function DS(i){const t=Gs();if(t)for(const e of[ri(i),Ws(i),gi(i),Ls(i)])try{t.removeItem(e)}catch{}}function Wp(i){const t=Gs(),e=yn(gi(i)),n=Br(e);if(!t||!Ko(n))return!1;const s=yn(ri(i));try{t.setItem(ri(i),e),s?t.setItem(gi(i),s):t.removeItem(gi(i)),t.setItem(Ls(i),String(Date.now())),t.setItem(Ws(i),JSON.stringify(El(n)))}catch{return!1}return!0}function PS(i){return JSON.stringify({format:"klotzfunk-world",version:Bp,exportedAt:Date.now(),save:i})}function NS(i){const t=Br(i);if(!t)return null;const e=t.format==="klotzfunk-world"?t.save:t;return Ko(e)?(e.name=e.name.slice(0,40),e):null}function Gp(){const i=Gs(),t=new Set;if(!i)return[];let e=0;try{e=typeof i.key=="function"?i.length:0}catch{e=0}if(e)for(let n=0;n<e;n++){let s=null;try{s=i.key(n)}catch{}const r=s&&/^klotzfunk\.(?:world|meta)\.(\d{1,4})$/.exec(s);r&&t.add(Number(r[1]))}else for(let n=0;n<rl;n++)(yn(ri(n))!==null||yn(Ws(n))!==null)&&t.add(n);return[...t].filter(n=>n<rl&&yn(ri(n))!==null).sort((n,s)=>n-s)}function bl(){const i=new Set(Gp());for(let t=0;t<rl;t++)if(!i.has(t)&&yn(ri(t))===null)return t;return-1}function bh(i){const t=CS(i);if(t&&typeof t.name=="string")return t;const e=Xo(i);if(!e)return null;const n=El(e);try{Gs().setItem(Ws(i),JSON.stringify(n))}catch{}return n}function IS(i,t){const e=Xo(i),n=Gs();if(t=String(t||"").trim().slice(0,40),!e||!n||!t)return!1;e.name=t;try{n.setItem(ri(i),JSON.stringify(e)),n.setItem(Ws(i),JSON.stringify(El(e)))}catch{return!1}return!0}function OS(i){const t=Xo(i),e=bl();return!t||e<0?-1:(t.name=(t.name+" (Kopie)").slice(0,40),t.savedAt=Date.now(),ou(e,t)?e:-1)}const Kp="klotzfunk.settings",Th={eco:{name:"Eco",dpr:.75,view:3,clouds:!1,budget:3,shadow:0,vclouds:!1,post:!1,wind:!1},mobile:{name:"Mobil",dpr:1.25,view:4,clouds:!0,budget:4,shadow:1024,shadowR:28,shadowEvery:3,vclouds:!1,post:!1,wind:!0},standard:{name:"Standard",dpr:1.5,view:6,clouds:!0,budget:6,shadow:2048,shadowR:44,shadowEvery:1,vclouds:!0,post:!0,wind:!0},high:{name:"Hoch",dpr:2,view:9,clouds:!0,budget:8,shadow:2048,shadowR:60,shadowEvery:1,vclouds:!0,post:!0,wind:!0}},Mo={quality:"auto",mouseSens:1,touchSens:1,joySens:1,btnScale:1,lefty:!1,invertY:!1,placeDelay:!0,sfxVol:.8,musicVol:.8,ambVol:.7,showFps:!1,deathLoss:"keep",enemies:!0,preview:!0,stun:!0,mpName:"",minimap:!0,keys:{},padKeys:{},padSens:1,padRumble:.8,padDead:.18,padInvertY:!1,touchPos:{}};function kS(){let i={};try{i=JSON.parse(globalThis.localStorage.getItem(Kp))||{}}catch{i={}}const t={...Mo};for(const e of Object.keys(Mo))i[e]!==void 0&&typeof i[e]==typeof Mo[e]&&i[e]===null==(Mo[e]===null)&&(t[e]=i[e]);return t.quality!=="auto"&&!Th[t.quality]&&(t.quality="auto"),["keep","grave"].includes(t.deathLoss)||(t.deathLoss="keep"),t}function ds(i){try{return globalThis.localStorage.setItem(Kp,JSON.stringify(i)),!0}catch{return!1}}function US(i){return i?"mobile":"standard"}const ps=1e3,De=[],q={},ol=[],Gn=[{key:"WOOD",name:"Holz",speed:2,dur:60,col:"#b48a52"},{key:"STONE",name:"Stein",speed:3,dur:140,col:"#8c8c94"},{key:"COPPER",name:"Kupfer",speed:4,dur:220,col:"#d8803c"},{key:"IRON",name:"Eisen",speed:6,dur:360,col:"#dcdce4"}],Xp=[{key:"PICK",kind:"spitzhacke",name:"spitzhacke"},{key:"AXE",kind:"axt",name:"axt"},{key:"SHOVEL",kind:"schaufel",name:"schaufel"}];function Xe(i,t,e,n){if(De[i])throw new Error("Item-Id doppelt: "+i);const s={id:i,key:t,name:e,cat:"items",icon:ol.length,food:0,tool:null,...n};return De[i]=s,q[t]=i,ol.push(i),s}Xe(1e3,"STICK","Stock",{draw:"stick"});Xe(1001,"COPPER_INGOT","Kupferbarren",{draw:"ingot",col:"#d8803c"});Xe(1002,"IRON_INGOT","Eisenbarren",{draw:"ingot",col:"#dcdce4"});Xe(1003,"APPLE","Apfel",{draw:"apple",food:4});Xe(1004,"MEAT_RAW","Rohes Fleisch",{draw:"meat",col:"#e0605a",food:2});Xe(1005,"MEAT_COOKED","Braten",{draw:"meat",col:"#9a5a2a",food:7});Gn.forEach((i,t)=>Xp.forEach((e,n)=>{Xe(1010+t*3+n,i.key+"_"+e.key,i.name+e.name,{draw:e.kind,col:i.col,tool:{kind:e.kind,tier:t+1,speed:i.speed,dur:i.dur}})}));Xe(1022,"WOOD_HOE","Holzhacke",{draw:"hacke",col:Gn[0].col,tool:{kind:"hacke",tier:1,speed:1,dur:Gn[0].dur}});Xe(1023,"STONE_HOE","Steinhacke",{draw:"hacke",col:Gn[1].col,tool:{kind:"hacke",tier:2,speed:1,dur:Gn[1].dur}});Xe(1024,"SEEDS","Weizensamen",{draw:"seeds",plant:d.WHEAT0});Xe(1025,"WHEAT","Weizen",{draw:"wheat"});Xe(1026,"BREAD","Brot",{draw:"bread",food:6});Gn.forEach((i,t)=>Xe(1027+t,i.key+"_SWORD",i.name+"schwert",{draw:"schwert",col:i.col,tool:{kind:"schwert",tier:t+1,speed:1,dur:i.dur,dmg:3+t}}));Xe(1031,"COPPER_HELMET","Kupferhelm",{draw:"helm",col:Gn[2].col,armor:{slot:"kopf",pts:2,dur:60}});Xe(1032,"COPPER_CHEST","Kupferharnisch",{draw:"harnisch",col:Gn[2].col,armor:{slot:"brust",pts:3,dur:80}});Xe(1033,"IRON_HELMET","Eisenhelm",{draw:"helm",col:Gn[3].col,armor:{slot:"kopf",pts:3,dur:110}});Xe(1034,"IRON_CHEST","Eisenharnisch",{draw:"harnisch",col:Gn[3].col,armor:{slot:"brust",pts:5,dur:150}});Xe(1035,"BOAT","Boot",{draw:"boot",col:"#a87a46",vehicle:"boot"});Xe(1036,"MINECART","Lore",{draw:"lore",col:"#8a8c94",vehicle:"lore"});const Qi=i=>i>=ps,oo=i=>i>=ps&&De[i]&&De[i].armor||null,Qf=i=>1-Math.min(.4,Math.max(0,i)*.05),td=i=>i>=ps&&De[i]&&De[i].vehicle||null,xc=i=>i>=ps&&De[i]&&De[i].plant||0,Se=i=>i>=ps?De[i]?De[i].name:"?":No[i]||"?",es=i=>i>=ps&&De[i]?De[i].tool:null,ed=i=>i>=ps&&De[i]?De[i].food:0,nd=i=>!!(i>=ps?De[i]:Gt[i]),zS=.9;function FS(i,t){const e=Gt[i];if(!e)return .5;const n=es(t),s=n&&e.tool===n.kind?n.speed:1;return Math.max(.12,e.hard*zS/s)}function BS(i,t){const e=Gt[i];if(!e||!e.tier)return!0;const n=es(t);return!!n&&n.kind==="spitzhacke"&&n.tier>=e.tier}function HS(i,t){const e=Gt[i],n=es(t);return!!(e&&n&&e.tool===n.kind)}const en=999,rn=[{id:"planks",give:[d.PLANKS,4],need:[[d.WOOD,1]]},{id:"planks2",give:[d.PLANKS,4],need:[[d.SPRUCE,1]]},{id:"glass",give:[d.GLASS,1],need:[[d.SAND,2]]},{id:"lamp",give:[d.LAMP,2],need:[[d.GLASS,2],[d.WOOD,1]]},{id:"lampCoal",give:[d.LAMP,2],need:[[d.COAL,1],[d.PLANKS,1]]},{id:"lampCrystal",give:[d.LAMP,4],need:[[d.CRYSTAL,1],[d.GLASS,1]]},{id:"feder",give:[d.FEDER,2],need:[[d.LEAVES,4],[d.PLANKS,1]]},{id:"turbo",give:[d.TURBO,2],need:[[d.STONE,2],[d.LAMP,1]]},{id:"turboIron",give:[d.TURBO,3],need:[[d.IRON,1],[d.STONE,2]]},{id:"wind",give:[d.WIND,2],need:[[d.GLASS,2],[d.LEAVES,2]]},{id:"radio",give:[d.RADIO,1],need:[[d.PLANKS,4],[d.LAMP,1]]},{id:"radioCopper",give:[d.RADIO,2],need:[[d.PLANKS,2],[d.COPPER,1],[d.LAMP,1]]},{id:"rainbow",give:[d.RAINBOW,2],need:[[d.GLASS,2],[d.LAMP,1]]},{id:"neonR",give:[d.NEON_R,3],need:[[d.LAMP,1],[d.SAND,1]]},{id:"neonB",give:[d.NEON_B,3],need:[[d.LAMP,1],[d.GLASS,1]]},{id:"neonG",give:[d.NEON_G,3],need:[[d.LAMP,1],[d.LEAVES,1]]},{id:"neonP",give:[d.NEON_P,3],need:[[d.LAMP,1],[d.DIRT,1]]},{id:"brick",give:[d.BRICK,4],need:[[d.DIRT,2],[d.SAND,1]]},{id:"brickClay",give:[d.BRICK,4],need:[[d.CLAY,2],[d.COAL,1]]},{id:"marble",give:[d.MARBLE,2],need:[[d.STONE,2],[d.SAND,1]]},{id:"sandstone",give:[d.SANDSTONE,2],need:[[d.SAND,4]]}];for(let i=0;i<Qh;i++)rn.push({id:"logo"+(i+1),give:[xi+i,2],need:[[d.PLANKS,1]]});rn.push({id:"sticks",give:[q.STICK,4],need:[[d.PLANKS,2]]},{id:"workbench",give:[d.WORKBENCH,1],need:[[d.PLANKS,4]]},{id:"furnace",give:[d.FURNACE,1],need:[[d.STONE,8]],st:"werkbank"});const $p=[d.PLANKS,d.STONE,q.COPPER_INGOT,q.IRON_INGOT],VS=[3,3,1];Gn.forEach((i,t)=>Xp.forEach((e,n)=>{const s=q[i.key+"_"+e.key];rn.push({id:"tool"+s,give:[s,1],need:[[$p[t],VS[n]],[q.STICK,2]],st:"werkbank"})}));const WS=[d.PLANKS,d.STONE];["WOOD","STONE"].forEach((i,t)=>rn.push({id:"tool"+q[i+"_HOE"],give:[q[i+"_HOE"],1],need:[[WS[t],2],[q.STICK,2]],st:"werkbank"}));Gn.forEach((i,t)=>rn.push({id:"tool"+q[i.key+"_SWORD"],give:[q[i.key+"_SWORD"],1],need:[[$p[t],2],[q.STICK,1]],st:"werkbank"}));rn.push({id:"bread",give:[q.BREAD,1],need:[[q.WHEAT,3]]});rn.push({id:"copperHelmet",give:[q.COPPER_HELMET,1],need:[[q.COPPER_INGOT,5]],st:"werkbank"},{id:"copperChest",give:[q.COPPER_CHEST,1],need:[[q.COPPER_INGOT,8]],st:"werkbank"},{id:"ironHelmet",give:[q.IRON_HELMET,1],need:[[q.IRON_INGOT,5]],st:"werkbank"},{id:"ironChest",give:[q.IRON_CHEST,1],need:[[q.IRON_INGOT,8]],st:"werkbank"},{id:"cobble",give:[d.COBBLE,2],need:[[d.STONE,2]]},{id:"path",give:[d.PATH,2],need:[[d.GRAVEL,1],[d.DIRT,1]]});rn.push({id:"switch",give:[d.SWITCH,2],need:[[d.STONE,1],[q.STICK,1]],st:"werkbank"},{id:"wire",give:[d.WIRE,8],need:[[q.COPPER_INGOT,1],[d.STONE,1]],st:"werkbank"},{id:"sender",give:[d.SENDER,1],need:[[q.COPPER_INGOT,2],[d.CRYSTAL,1],[d.RADIO,1]],st:"werkbank"},{id:"relay",give:[d.RELAY,1],need:[[q.COPPER_INGOT,1],[d.CRYSTAL,1],[d.STONE,2]],st:"werkbank"},{id:"receiver",give:[d.RECEIVER,1],need:[[q.COPPER_INGOT,1],[d.GLASS,1],[d.PLANKS,2]],st:"werkbank"},{id:"siglamp",give:[d.SIGLAMP,2],need:[[d.LAMP,1],[d.WIRE,1]],st:"werkbank"},{id:"gate",give:[d.GATE,2],need:[[q.IRON_INGOT,1],[d.PLANKS,4]],st:"werkbank"});rn.push({id:"boat",give:[q.BOAT,1],need:[[d.PLANKS,5],[q.STICK,1]],st:"werkbank"},{id:"minecart",give:[q.MINECART,1],need:[[q.IRON_INGOT,3],[q.COPPER_INGOT,2]],st:"werkbank"},{id:"rail",give:[d.RAIL,16],need:[[q.COPPER_INGOT,3],[q.STICK,2]],st:"werkbank"});rn.push({id:"ingotCopper",give:[q.COPPER_INGOT,1],need:[[d.COPPER,1],[d.COAL,1]],st:"ofen"},{id:"ingotIron",give:[q.IRON_INGOT,1],need:[[d.IRON,1],[d.COAL,1]],st:"ofen"},{id:"cook",give:[q.MEAT_COOKED,1],need:[[q.MEAT_RAW,1],[d.PLANKS,1]],st:"ofen"},{id:"cookCoal",give:[q.MEAT_COOKED,4],need:[[q.MEAT_RAW,4],[d.COAL,1]],st:"ofen"},{id:"glassOven",give:[d.GLASS,3],need:[[d.SAND,3],[d.COAL,1]],st:"ofen"});rn.push({id:"stonebrick",give:[d.STONEBRICK,4],need:[[d.STONE,4]]},{id:"smooth",give:[d.SMOOTH,2],need:[[d.STONE,2],[d.COAL,1]],st:"ofen"},{id:"darkplanks",give:[d.DARKPLANKS,4],need:[[d.SPRUCE,1],[d.COAL,1]]},{id:"birch",give:[d.BIRCH,4],need:[[d.WOOD,1],[d.SAND,1]]},{id:"roof",give:[d.ROOF,4],need:[[d.BRICK,2],[d.CLAY,1]]},{id:"books",give:[d.BOOKS,1],need:[[d.PLANKS,4],[d.WOOL,1]]},{id:"lantern",give:[d.LANTERN,2],need:[[q.IRON_INGOT,1],[d.LAMP,1]],st:"werkbank"},{id:"copperblock",give:[d.COPPERBLOCK,1],need:[[q.COPPER_INGOT,4]],st:"werkbank"},{id:"ironblock",give:[d.IRONBLOCK,1],need:[[q.IRON_INGOT,4]],st:"werkbank"},{id:"hay",give:[d.HAY,1],need:[[q.WHEAT,6]]},...[d.SNOW,d.COAL,d.MAGMA,d.COPPER,d.SANDSTONE,d.LEAVES,d.CLAY,d.CRYSTAL].map((i,t)=>({id:"concrete"+t,give:[d["CONCRETE"+t],4],need:[[d.SAND,2],[d.GRAVEL,2],[i,1]]})),...[[d.MAGMA,1],[d.CLAY,1],[d.LEAVES,1]].map((i,t)=>({id:"stained"+t,give:[d["STAINED"+t],2],need:[[d.GLASS,2],i]})),...Ml.flatMap(([i,,t],e)=>[{id:"slab"+i,give:[101+e,6],need:[[t,3]]},{id:"stairs"+i,give:[109+e*4,4],need:[[t,6]]}]),{id:"fence",give:[d.FENCE,3],need:[[d.PLANKS,4],[q.STICK,2]]},{id:"wall",give:[d.WALL,6],need:[[d.COBBLE,6]]},{id:"pane",give:[d.PANE,16],need:[[d.GLASS,6]]},{id:"door",give:[d.DOOR,2],need:[[d.PLANKS,6]]},{id:"ladder",give:[d.LADDER,3],need:[[q.STICK,7]]});const GS=i=>d["DECO_"+i.toUpperCase()];rn.push(...[["chair",[[d.PLANKS,3]]],["armchair",[[d.PLANKS,2],[d.WOOL,3]]],["stool",[[d.PLANKS,2]]],["couch",[[d.PLANKS,3],[d.WOOL,5]]],["table",[[d.PLANKS,4]]],["tablelong",[[d.PLANKS,6]]],["bed",[[d.PLANKS,3],[d.WOOL,3]]],["cabinet",[[d.PLANKS,6]]],["shelf",[[d.PLANKS,6],[d.BOOKS,1]]],["lamp",[[q.IRON_INGOT,1],[d.LAMP,1]]],["tablelamp",[[q.COPPER_INGOT,1],[d.LAMP,1]]],["books",[[d.BOOKS,1]]],["picture",[[d.PLANKS,2],[d.FLOWERS,1]]],["rug",[[d.WOOL,3]]],["bench",[[d.PLANKS,4],[q.IRON_INGOT,1]]],["streetlight",[[q.IRON_INGOT,3],[d.LAMP,1]]],["trafficlight",[[q.IRON_INGOT,3],[d.NEON_R,1],[d.NEON_G,1]]],["hydrant",[[q.IRON_INGOT,2]]],["trash",[[q.IRON_INGOT,4]]],["bush",[[d.LEAVES,4]]],["barrel",[[d.PLANKS,5],[q.IRON_INGOT,1]]],["chest",[[d.PLANKS,6],[q.COPPER_INGOT,1]]],["keg",[[d.PLANKS,4],[q.COPPER_INGOT,1]]],["candles",[[d.WOOL,1],[d.COAL,1]]],["torch",[[q.STICK,1],[d.COAL,1]]],["banner",[[d.WOOL,4],[q.STICK,1]]],["crates",[[d.PLANKS,6]]]].map(([i,t])=>({id:"deco_"+i,give:[GS(i),i==="torch"||i==="candles"?4:1],need:t,st:"werkbank"})));rn.push({id:"moonstone",give:[d.MOONSTONE,4],need:[[d.STONE,4],[d.CRYSTAL,1]],st:"werkbank"},{id:"moonleaves",give:[d.MOONLEAVES,4],need:[[d.LEAVES,4],[d.CRYSTAL,1]],st:"werkbank"},{id:"gingerbread",give:[d.GINGERBREAD,4],need:[[q.WHEAT,3],[d.CLAY,1]],st:"werkbank"},{id:"icing",give:[d.ICING,4],need:[[d.SNOW,2],[d.FLOWERS,1]],st:"werkbank"},{id:"roseleaves",give:[d.ROSELEAVES,4],need:[[d.LEAVES,4],[d.FLOWERS,1]],st:"werkbank"},{id:"foam",give:[d.FOAM,4],need:[[d.WOOL,2],[d.COAL,1]],st:"werkbank"},{id:"onair",give:[d.ONAIR,1],need:[[d.NEON_R,1],[d.GLASS,1]],st:"werkbank"},{id:"goldblock",give:[d.GOLDBLOCK,1],need:[[d.COPPERBLOCK,1],[d.CRYSTAL,2]],st:"werkbank"},{id:"capsule",give:[d.CAPSULE,2],need:[[d.CONCRETE2,1],[d.CONCRETE0,1]],st:"werkbank"},{id:"tallgrass",give:[d.TALLGRASS,4],need:[[d.GRASS,1]]});for(const i of rn)i.cat=(De[i.give[0]]||Gt[i.give[0]]).cat;const id={werkbank:"Werkbank",ofen:"Schmelzofen"},KS={werkbank:"eine Werkbank",ofen:"einen Schmelzofen"},Ns=(i,t)=>i[t]||0;function au(i,t,e=en,n=null){const s=t.need.filter(([a,l])=>Ns(i,a)<l).map(([a,l])=>[a,l-Ns(i,a)]),r=Ns(i,t.give[0])+t.give[1]>e,o=!!(t.st&&n&&!n.has(t.st));return{ok:!s.length&&!r&&!o,missing:s,full:r,noStation:o}}function qp(i,t,e=en,n=null){const s=au(i,t,e,n);if(!s.ok)return{ok:!1,msg:s.noStation?`Braucht ${KS[t.st]} in der Nähe`:s.missing.length?"Es fehlt: "+s.missing.map(([o,a])=>`${a}× ${Se(o)}`).join(", "):`Vorrat voll: höchstens ${e}× ${Se(t.give[0])}`};for(const[r,o]of t.need)i[r]=Ns(i,r)-o;return i[t.give[0]]=Ns(i,t.give[0])+t.give[1],{ok:!0,msg:`+${t.give[1]} ${Se(t.give[0])}`}}function XS(i,t,e=en,n=null){if(t.st&&n&&!n.has(t.st))return 0;let s=Math.floor((e-Ns(i,t.give[0]))/t.give[1]);for(const[r,o]of t.need)s=Math.min(s,Math.floor(Ns(i,r)/o));return Math.max(0,s)}function $S(i,t){return t?(t=t.toLowerCase(),Se(i.give[0]).toLowerCase().includes(t)||i.need.some(([e])=>Se(e).toLowerCase().includes(t))):!0}const qS=[[0,.5,0,1,1,.5],[.5,.5,0,1,1,1],[0,.5,.5,1,1,1],[0,.5,0,.5,1,1]],al=[[0,-1],[1,0],[0,1],[-1,0]],Yp=i=>Ln[i]===6;function YS(i,t){return Ln[t]===i||Sn[t]===1||(i===3||i===4)&&Yp(t)}function ao(i,t,e,n,s,r){const o=.5-e/2,a=.5+e/2;r&&!t.some(Boolean)&&(t=[1,1,1,1]),t[0]&&i.push([o,n,0,a,s,o]),t[1]&&i.push([a,n,o,1,s,a]),t[2]&&i.push([o,n,a,a,s,1]),t[3]&&i.push([0,n,o,o,s,a])}function jp(i,t,e,n,s,r=!1){const o=Ln[i];if(!o)return null;if(o===1)return[[0,0,0,1,.5,1]];if(o===2)return[[0,0,0,1,.5,1],qS[Gt[i].dir&3]];const a=()=>al.map(([l,c])=>YS(o,t(e+l,n,s+c))?1:0);if(o===3){const l=a(),c=[[.375,0,.375,.625,1,.625]];return r?ao(c,l,.25,0,1):(ao(c,l,.125,.375,.5625),ao(c,l,.125,.75,.9375)),c}if(o===4){const l=[[.25,0,.25,.75,1,.75]];return ao(l,a(),.375,0,r?1:.8125),l}if(o===5){const l=[[.4375,0,.4375,.5625,1,.5625]];return ao(l,a(),.125,0,1,!0),l}if(o===6){let l=n;for(;l>0&&Yp(t(e,l-1,s));)l--;const c=Sn[t(e-1,l,s)]||Sn[t(e+1,l,s)],f=(Sn[t(e,l,s-1)]||Sn[t(e,l,s+1)])&&!c,u=i===d.DOOR_OPEN,p=.1875;return u?[f?[0,0,0,1,1,p]:[0,0,0,p,1,1]]:[f?[.5-p/2,0,0,.5+p/2,1,1]:[0,0,.5-p/2,1,1,.5+p/2]]}if(o===7){for(const[c,h]of al)if(Sn[t(e+c,n,s+h)])return[c===1?[1-.0625,0,0,1,1,1]:c===-1?[0,0,0,.0625,1,1]:h===1?[0,0,1-.0625,1,1,1]:[0,0,0,1,1,.0625]];return[[0,0,0,1,1,.0625]]}if(o===8){const l=Vs[zr[i]];return[[0,0,0,1,l&&l.solid?l.solid:1,1]]}return null}const jS={"0,-1":0,"1,0":3,"0,1":2,"-1,0":1},ZS={"0,-1":2,"1,0":1,"0,1":0,"-1,0":3};function Zp(i,t,e,n){for(const[s,r]of al)if(Sn[i(t+s,e,n+r)])return jS[s+","+r];for(const[s,r]of al){const o=i(t+s,e,n+r),a=Vs[zr[o]];if(a&&a.top)return ZS[s+","+r]}return 0}function JS(i,t,e,n){const s=Vs[zr[i(t,e-1,n)]];return s&&s.top?s.top-1:0}function QS(i,t,e,n,s,r,o,a,l,c,h){const f=jp(i,t,e,n,s,!0);if(!f)return!0;for(const u of f)if(l>e+u[0]&&r<e+u[3]&&c>n+u[1]&&o<n+u[4]&&h>s+u[2]&&a<s+u[5])return!0;return!1}const Jp=new Uint8Array(256);for(const i of Gt)i&&/LEAVES$/.test(i.key)&&(Jp[i.id]=1);const Tl=[{n:[1,0,0],o:[1,0,1],a:[0,0,-1],b:[0,1,0],k:1},{n:[-1,0,0],o:[0,0,0],a:[0,0,1],b:[0,1,0],k:1},{n:[0,0,1],o:[0,0,1],a:[1,0,0],b:[0,1,0],k:1},{n:[0,0,-1],o:[1,0,0],a:[-1,0,0],b:[0,1,0],k:1},{n:[0,1,0],o:[0,1,0],a:[0,0,1],b:[1,0,0],k:0},{n:[0,-1,0],o:[0,0,0],a:[1,0,0],b:[0,0,1],k:2}],t2=[[0,0],[1,0],[1,1],[0,1]];for(const i of Tl)i.c=t2.map(([t,e])=>{const n=t?1:-1,s=e?1:-1,r=(o,a,l)=>[i.n[0]*o+i.a[0]*a+i.b[0]*l,i.n[1]*o+i.a[1]*a+i.b[1]*l,i.n[2]*o+i.a[2]*a+i.b[2]*l];return{i:t,j:e,p:[i.o[0]+t*i.a[0]+e*i.b[0],i.o[1]+t*i.a[1]+e*i.b[1],i.o[2]+t*i.a[2]+e*i.b[2]],s1:r(1,n,0),s2:r(1,0,s),cn:r(1,n,s)}});const sd=[.45,.66,.84,1],e2=[1,.62,.38,.18];function n2(i,t){return t===d.AIR?!0:Sn[t]?!1:i===t?bp[i]===1:!0}class Ya{constructor(){this.pos=[],this.uv=[],this.col=[],this.idx=[],this.n=0}finish(){return this.n?{pos:new Float32Array(this.pos),uv:new Float32Array(this.uv),col:new Float32Array(this.col),idx:this.n>16383?new Uint32Array(this.idx):new Uint16Array(this.idx)}:null}}function $o(i,t){const e=t?4:pM,n=t?4:Bf,s=1/e,r=1/n,o=(t?3:2)/512,a=t?o:2/(64*Bf);return[i%e*s+o,1-(Math.floor(i/e)+1)*r+a,s-2*o,r-2*a]}function Qp(i,t){const e=i.neighborhood(t);if(!e)return null;const n=[];for(let s=-1;s<=1;s++)for(let r=-1;r<=1;r++)n.push(i.heightmap(i.getChunk(t.cx+r,t.cz+s)));return{nb:e,hms:n,maxY:t.maxY,rot:i.rot&&i.rot.get(t.key)||null}}function i2(i,t){const e=Qp(i,t);return e?r2(e.nb,e.hms,e.maxY,e.rot):null}const Ie=14,Rn=I+2*Ie;let Ia=null,rd=null;function s2(i,t,e=null){const n=Math.min(ie-1,t+Ie),s=[];if(e)for(let f=-1;f<=1;f++)for(let u=-1;u<=1;u++){const p=e[(f+1)*3+u+1],x=Math.max(0,-Ie-u*I),v=Math.min(I-1,I+Ie-1-u*I),m=Math.max(0,-Ie-f*I),g=Math.min(I-1,I+Ie-1-f*I),_=Math.min(p.length,n+1<<8);for(let M=0;M<_;M++){if(!Oo[p[M]])continue;const S=M&15,C=M>>4&15;S>=x&&S<=v&&C>=m&&C<=g&&s.push(u*I+S,M>>8,f*I+C)}}else for(let f=0;f<=n;f++)for(let u=-Ie;u<I+Ie;u++)for(let p=-Ie;p<I+Ie;p++)Oo[i(p,f,u)]&&s.push(p,f,u);if(!s.length)return null;const r=Rn*Rn*(n+1);(!Ia||Ia.length<r)&&(Ia=new Uint8Array(r),rd=new Int32Array(r));const o=Ia,a=rd;o.fill(0,0,r);let l=0,c=0;for(let f=0;f<s.length;f+=3){const u=s[f]+Ie+(s[f+2]+Ie)*Rn+s[f+1]*Rn*Rn;o[u]=Ie,a[c++]=u}const h=Rn*Rn;for(;l<c;){const f=a[l++],u=o[f]-1;if(u<=0)continue;const p=f/h|0,x=f-p*h,v=x/Rn|0,m=x-v*Rn;for(let g=0;g<6;g++){const _=m+(g===0?1:g===1?-1:0),M=p+(g===2?1:g===3?-1:0),S=v+(g===4?1:g===5?-1:0);if(_<0||S<0||M<0||_>=Rn||S>=Rn||M>n)continue;const C=_+S*Rn+M*h;o[C]>=u||Sn[i(_-Ie,M,S-Ie)]||(o[C]=u,a[c++]=C)}}return(f,u,p)=>u<0||u>n||f<-Ie||p<-Ie||f>=I+Ie||p>=I+Ie?0:o[f+Ie+(p+Ie)*Rn+u*h]/Ie}const Uo=(i,t)=>i+8*Math.round(t*63);function r2(i,t,e,n=null){const s=i[4],r=(m,g)=>(g<0?0:g>=I?2:1)*3+(m<0?0:m>=I?2:1),o=(m,g,_)=>g<0?d.STONE:g>=ie?d.AIR:i[r(m,_)][(m&15)+((_&15)<<4)+(g<<8)],a=(m,g,_)=>{const M=t[r(m,_)][(m&15)+((_&15)<<4)];return g>=M?1:e2[Math.min(3,M-g)]},l=new Ya,c=new Ya,h=new Ya,f=[0,0,0,0],u=[],p=Math.min(ie-1,e+1),x=s2(o,p,i),v=x||(()=>0);for(let m=0;m<=p;m++)for(let g=0;g<I;g++)for(let _=0;_<I;_++){const M=s[_+(g<<4)+(m<<8)];if(M===d.AIR)continue;if(Tp[M]){l2(l,_,m,g,gr[M][0],a(_,m,g),v(_,m,g));continue}if(Ap[M]){const b=(N,X)=>o(_+N,m,g+X)===M||o(_+N,m+1,g+X)===M||o(_+N,m-1,g+X)===M;c2(l,_,m,g,gr[M][0],a(_,m,g),(b(1,0)||b(-1,0))&&!b(0,1)&&!b(0,-1),v(_,m,g));continue}if(Ln[M]===8){const b=n?n.get(_+(g<<4)+(m<<8)):void 0;u.push(_,m,g,M,b??Zp(o,_,m,g),a(_,m,g),JS(o,_,m,g),v(_,m,g));continue}if(Ln[M]){o2($a[M]?c:l,_,m,g,jp(M,o,_,m,g),gr[M],o,a,v);continue}const S=Sl(M),C=S?h:$a[M]?c:l,y=Oo[M],w=M===d.WATER&&o(_,m+1,g)!==d.WATER,L=gr[M],E=y===0&&!$a[M];for(let b=0;b<6;b++){const N=Tl[b];if(!n2(M,o(_+N.n[0],m+N.n[1],g+N.n[2])))continue;const X=S?M-xi:L[N.k],[W,Y,nt,$]=$o(X,S);for(let G=0;G<4;G++){const st=N.c[G],xt=a(_+N.n[0],m+N.n[1],g+N.n[2]),Dt=_+st.s1[0],$t=m+st.s1[1],fe=g+st.s1[2],j=_+st.s2[0],rt=m+st.s2[1],wt=g+st.s2[2],lt=_+st.cn[0],Ot=m+st.cn[1],Ht=g+st.cn[2],Kt=Sn[o(Dt,$t,fe)],ve=Sn[o(j,rt,wt)],ne=Sn[o(lt,Ot,Ht)],Ce=E?Kt&&ve?0:3-(Kt+ve+ne):3,z=(xt+(Kt?xt:a(Dt,$t,fe))+(ve?xt:a(j,rt,wt))+(ne?xt:a(lt,Ot,Ht)))/4;let on=0;if(x){const Qt=v(_+N.n[0],m+N.n[1],g+N.n[2]);on=(Qt+(Kt?Qt:v(Dt,$t,fe))+(ve?Qt:v(j,rt,wt))+(ne?Qt:v(lt,Ot,Ht)))/4}f[G]=sd[Ce]*(.5+.5*z),C.pos.push(_+st.p[0],m+st.p[1]-(w&&st.p[1]===1?.12:0),g+st.p[2]),C.uv.push(W+st.i*nt,Y+st.j*$),C.col.push(sd[Ce],z,Uo(M===d.WATER?3:Jp[M]?4:y,on),b)}const it=C.n*4;f[0]+f[2]<f[1]+f[3]?C.idx.push(it+1,it+2,it+3,it+1,it+3,it):C.idx.push(it,it+1,it+2,it,it+2,it+3),C.n++}}return{opaque:l.finish(),trans:c.finish(),logo:h.finish(),deco:u}}function o2(i,t,e,n,s,r,o,a,l){const c=a(t,e,n),h=l(t,e,n);for(const f of s)for(let u=0;u<6;u++){const p=Tl[u],x=p.n[0]?0:p.n[1]?1:2,m=p.n[x]>0?f[x+3]>=1:f[x]<=0;if(m&&Sn[o(t+p.n[0],e+p.n[1],n+p.n[2])])continue;const g=m?(a(t+p.n[0],e+p.n[1],n+p.n[2])+c)/2:c,_=m?Uo(0,(l(t+p.n[0],e+p.n[1],n+p.n[2])+h)/2):Uo(0,h),[M,S,C,y]=$o(r[p.k],!1),w=m?1:.84;for(let E=0;E<4;E++){const b=p.c[E],N=[0,1,2].map($=>b.p[$]?f[$+3]:f[$]),X=p.a[0]?0:p.a[1]?1:2,W=p.b[0]?0:p.b[1]?1:2,Y=p.a[X]>0?N[X]:1-N[X],nt=p.b[W]>0?N[W]:1-N[W];i.pos.push(t+N[0],e+N[1],n+N[2]),i.uv.push(M+Y*C,S+nt*y),i.col.push(w,g,_,u)}const L=i.n*4;i.idx.push(L,L+1,L+2,L,L+2,L+3),i.n++}}const a2=[[[.15,.15],[.85,.85]],[[.85,.15],[.15,.85]]];function l2(i,t,e,n,s,r,o=0){const[a,l,c,h]=$o(s,!1);for(const[[f,u],[p,x]]of a2)for(const v of[0,1]){const m=i.n*4,g=v?[[p,x],[f,u]]:[[f,u],[p,x]];i.pos.push(t+g[0][0],e,n+g[0][1],t+g[1][0],e,n+g[1][1],t+g[1][0],e+1,n+g[1][1],t+g[0][0],e+1,n+g[0][1]),i.uv.push(a,l,a+c,l,a+c,l+h,a,l+h);for(let _=0;_<4;_++)i.col.push(.9,r,Uo(_>1?5:0,o),4);i.idx.push(m,m+1,m+2,m,m+2,m+3),i.n++}}function c2(i,t,e,n,s,r,o,a=0){const[l,c,h,f]=$o(s,!1),u=e+.0625,p=[l,c,l,c+f,l+h,c+f,l+h,c],x=[l,c,l+h,c,l+h,c+f,l,c+f],v=o?x:p;for(const m of[0,1]){const g=i.n*4;m?(i.pos.push(t,u,n,t+1,u,n,t+1,u,n+1,t,u,n+1),i.uv.push(v[0],v[1],v[6],v[7],v[4],v[5],v[2],v[3])):(i.pos.push(t,u,n,t,u,n+1,t+1,u,n+1,t+1,u,n),i.uv.push(...v));for(let _=0;_<4;_++)i.col.push(.95,r,Uo(0,a),m?5:4);i.idx.push(g,g+1,g+2,g,g+2,g+3),i.n++}}function h2(i){const t=Sl(i),e=gr[i],n=new Ya;for(let s=0;s<6;s++){const r=Tl[s],[o,a,l,c]=$o(t?i-xi:e[r.k],t);for(let f=0;f<4;f++){const u=r.c[f];n.pos.push(u.p[0]-.5,u.p[1]-.5,u.p[2]-.5),n.uv.push(o+u.i*l,a+u.j*c),n.col.push(1,1,Oo[i],s)}const h=n.n*4;n.idx.push(h,h+1,h+2,h,h+2,h+3),n.n++}return n.finish()}const Le=64,fr=8,od=16,lo=128,_c=4,ad=16;function He(i,t,e){let n=Math.imul(i|0,668265261)^Math.imul(t|0,374761393)^Math.imul(e|0,2654435761);return n=Math.imul(n^n>>>15,2246822507),n=Math.imul(n^n>>>13,3266489909),n^=n>>>16,(n>>>0)/4294967296}function Oe(i,t,e,n,s){const r=Math.floor(i),o=Math.floor(t),a=i-r,l=t-o,c=a*a*(3-2*a),h=l*l*(3-2*l),f=(r%e+e)%e,u=(f+1)%e,p=(o%n+n)%n,x=(p+1)%n,v=He(f,p,s),m=He(u,p,s),g=He(f,x,s),_=He(u,x,s);return v+(m-v)*c+(g-v)*h+(v-m-g+_)*c*h}function vt(i,t,e,n,s){let r=0,o=.5,a=0,l=e;for(let c=0;c<n;c++)r+=o*Oe(i*l,t*l,l,l,s+c*17),a+=o,o*=.5,l*=2;return r/a}const ut=(i,t,e)=>[i[0]+(t[0]-i[0])*e,i[1]+(t[1]-i[1])*e,i[2]+(t[2]-i[2])*e],J=(i,t)=>[i[0]+t,i[1]+t,i[2]+t],ct=(i,t,e,n)=>(He(i,t,e)-.5)*n,Mc=(i,t,e,n)=>{const s=vt(i,t,6,3,2),r=Oe(i*32,t*32,32,32,5);return[...J(ut([58,122,38],[120,186,72],s*.65+r*.45),ct(e,n,8,10)),255]},Oa=(i,t,e,n)=>{const s=vt(i,t,4,4,1),r=vt(i,t,12,2,9);let o=ut([108,76,50],[150,108,76],s);return r>.66?o=J(o,-26):r<.28&&(o=J(o,12)),[...J(o,ct(e,n,3,10)),255]},hi=[Mc,(i,t,e,n)=>{const s=.17+.11*Oe(i*8,.5,8,1,4)+.05*Oe(i*24,.5,24,1,6);if(t<s){const a=Mc(i,t,e,n);return t>s-.035&&(a[0]*=.8,a[1]*=.85,a[2]*=.8),a}const r=Oa(i,t,e,n),o=Math.max(0,1-(t-s)*7)*.28;return[r[0]*(1-o),r[1]*(1-o),r[2]*(1-o),255]},Oa,(i,t,e,n)=>{const s=vt(i,t,4,4,3),r=Math.abs(vt(i,t,3,3,7)-.5);let o=ut([92,94,100],[142,144,150],s);return r<.022?o=J(o,-34):vt(i,t,10,2,13)>.7&&(o=J(o,14)),[...J(o,ct(e,n,4,9)),255]},(i,t,e,n)=>{const s=vt(i,t,5,3,21),r=Math.sin((t+s*.35)*Math.PI*8)*5;return[...J(ut([212,194,136],[232,218,160],s),r+ct(e,n,5,10)),255]},(i,t,e,n)=>{const s=Oe(i*10,t*3,10,3,31)*.6+Oe(i*20,t*6,20,6,32)*.4;let r=ut([82,58,33],[132,98,58],s);return s<.3&&(r=J(r,-16)),[...J(r,ct(e,n,6,8)),255]},(i,t,e,n)=>{const s=i-.5,r=t-.5,o=Math.max(Math.abs(s),Math.abs(r)),a=vt(i,t,6,2,41);if(o>.43)return[...J(ut([80,56,32],[118,86,50],a),ct(e,n,7,8)),255];const l=Math.hypot(s,r)*15+vt(i,t,3,2,42)*2.2,c=.5+.5*Math.sin(l*Math.PI*2);return[...J(ut([186,148,94],[148,108,62],c),ct(e,n,9,7)),255]},(i,t,e,n)=>{const s=vt(i,t,8,3,11),r=vt(i,t,9,2,12);let o=ut([30,92,30],[92,168,58],s);return r>.64?[o[0],o[1],o[2],0]:(Oe(i*16,t*16,16,16,14)>.78&&(o=J(o,18)),[...J(o,ct(e,n,10,10)),255])},(i,t,e,n)=>{const s=Math.floor(t*4),r=t*4%1,o=Oe(i*6,t*40,6,40,51+s)*.7+.3*Oe(i*24,t*4+s,24,4,55);let a=ut([150,110,60],[200,156,96],o);(r<.045||r>.97)&&(a=J(a,-46));const l=s%2?.25:.75;return Math.abs(i-l)<.012&&(a=J(a,-40)),[...J(a,ct(e,n,11,6)),255]},(i,t,e,n)=>{if(Math.min(e,n,Le-1-e,Le-1-n)<3)return[228,245,252,238];const r=(i+t)%.5;return r>.1&&r<.17&&i+t<1?[255,255,255,140]:[186,226,240,55]},(i,t,e,n)=>{const s=i*2%1,r=t*2%1;if(Math.min(s,1-s,r,1-r)<.055)return[150,98,38,255];const a=Math.max(0,1-Math.hypot(s-.5,r-.5)*1.5),l=vt(i,t,6,2,61);return[...ut([255,196,96],[255,246,190],a*.9+l*.1),255]},(i,t,e,n)=>{const s=vt(i,t,4,3,15),o=vt(i+s*.2,t,8,2,16)>.62?26:0;return[...J(ut([34,92,190],[62,134,220],s),o),172]},(i,t,e,n)=>{const s=Math.hypot(i-.5,t-.5),r=Math.min(e,n,Le-1-e,Le-1-n);let o=ut([255,120,170],[255,70,130],Math.min(1,s*1.6));return Math.sin(s*Math.PI*14)>.7&&(o=J(o,22)),r<4&&(o=ut(o,[150,30,80],.6)),[...o,255]},(i,t,e,n)=>{if(t<.17||t>.83){const r=Math.min(t,1-t);return[...ut([255,80,140],[190,40,100],r<.04?.6:0),255]}const s=Math.sin((t*7+Math.abs(i-.5)*.8)*Math.PI*2);return s>-.1?[...J([176,182,194],s*24),255]:[52,54,64,255]},(i,t)=>{const e=(t+Math.abs(i-.5))*3%1;return Math.min(i,t,1-i,1-t)<.04?[30,30,36,255]:e<.5?[255,214,40,255]:[38,38,46,255]},(i,t)=>t>.35&&t<.65?[255,214,40,255]:[40,40,50,255],(i,t,e,n)=>{const s=Math.abs(i*2%1-.5),r=t*2%1,o=s<.07&&r>.4&&r<.88,a=r>.12&&r<.44&&s<(r-.12)*.75,l=ut([40,170,215],[96,220,245],vt(i,t,4,2,71));return o||a?[255,255,255,255]:[...J(l,ct(e,n,12,8)),255]},(i,t,e,n)=>[...Math.sin((t*5-i*.6)*Math.PI*2+Math.sin(i*9)*1.2)>.82?[235,250,255]:ut([40,160,205],[80,205,235],t),255],(i,t,e,n)=>{const s=Math.min(i,t,1-i,1-t),r=Math.hypot(i-.5,t-.5);return s<.05?[28,30,38,255]:r<.34?e%6<3&&n%6<3?[18,20,26,255]:[96,102,116,255]:t<.14&&i>.7&&i<.84?[255,150,40,255]:[...J([58,62,74],ct(e,n,13,8)),255]},(i,t,e,n)=>Math.min(i,t,1-i,1-t)<.05?[28,30,38,255]:Math.hypot(i-.3,t-.5)<.16?[255,150,40,255]:t>.42&&t<.58&&i>.55&&i<.9?[0,229,255,255]:[...J([58,62,74],ct(e,n,14,8)),255],(i,t,e,n)=>{const s=.5+.5*Math.sin((i+t)*Math.PI*6+vt(i,t,4,2,81)*5),o=Math.min(i,t,1-i,1-t)<.04?.45:.7+.3*s;return[o*255,o*255,o*255,255]},...[[255,40,70],[40,140,255],[50,255,120],[190,70,255]].map(i=>(t,e)=>{const n=t*2%1,s=e*2%1;if(Math.min(n,1-n,s,1-s)<.06)return[i[0]*.3,i[1]*.3,i[2]*.3,255];const o=Math.max(0,1-Math.hypot(n-.5,s-.5)*1.3);return[...ut(i,[255,255,255],o*o*.65),255]}),(i,t,e,n)=>{const s=Math.floor(t*8),r=t*8%1,o=s%2?.125:0,a=(i*4+o*4)%1;if(r<.1||a<.05)return[...J([176,170,160],ct(e,n,15,10)),255];const l=vt(i,t,8,2,91+s);return[...J(ut([150,62,46],[186,92,66],l),ct(e,n,16,12)),255]},(i,t,e,n)=>{const s=vt(i,t,3,4,95),r=Math.abs(vt(i+s*.3,t,3,3,96)-.5);let o=ut([236,236,242],[214,216,226],s);return r<.03?o=J(o,-52):r<.05&&(o=J(o,-22)),[...J(o,ct(e,n,17,5)),255]},(i,t,e,n)=>[...J(ut([226,234,244],[250,252,255],vt(i,t,5,3,101)),ct(e,n,18,6)),255],(i,t,e,n)=>{const s=.2+.1*Oe(i*8,.5,8,1,102);if(t<s)return[...J([240,246,252],ct(e,n,19,6)),255];const r=Oa(i,t,e,n),o=Math.max(0,1-(t-s)*7)*.2;return[r[0]*(1-o),r[1]*(1-o),r[2]*(1-o),255]},(i,t,e,n)=>{const s=vt(i,t,4,3,103),r=Math.abs(vt(i,t,3,2,104)-.5)<.018;return[...J(ut([150,196,236],[196,226,250],s),r?30:ct(e,n,20,5)),255]},(i,t,e,n)=>{const s=Oe(i*10,t*10,10,10,105),r=vt(i,t,16,2,106),o=s>.6?[150,144,138]:s<.3?[96,92,90]:[124,120,116];return[...J(o,(r-.5)*40+ct(e,n,21,10)),255]},(i,t,e,n)=>{const s=Math.sin((t+vt(i,t,3,2,107)*.2)*Math.PI*6)*6;return[...J(ut([142,152,168],[168,176,190],vt(i,t,4,3,108)),s+ct(e,n,22,6)),255]},(i,t,e,n)=>{const s=Oe(i*12,t*2,12,2,109)*.6+Oe(i*24,t*5,24,5,110)*.4;let r=ut([52,36,22],[92,64,40],s);return s<.32&&(r=J(r,-12)),[...J(r,ct(e,n,23,8)),255]},(i,t,e,n)=>{const s=i-.5,r=t-.5;if(Math.max(Math.abs(s),Math.abs(r))>.43)return[...J([66,46,28],ct(e,n,24,8)),255];const a=.5+.5*Math.sin((Math.hypot(s,r)*18+vt(i,t,3,2,111)*2)*Math.PI*2);return[...J(ut([170,128,80],[130,92,56],a),ct(e,n,25,7)),255]},(i,t,e,n)=>{const s=vt(i,t,10,3,112),r=vt(i,t,11,2,113),o=ut([22,58,34],[52,104,60],s);return r>.66?[o[0],o[1],o[2],0]:[...J(o,ct(e,n,26,12)),255]},(i,t,e,n)=>{const s=Math.abs(i*4%1-.5)<.08;let r=ut([44,120,44],[70,150,58],vt(i,t,4,2,114));return s&&(r=J(r,-24)),He(e>>2,n>>2,115)>.93&&(r=[230,226,190]),[...J(r,ct(e,n,27,6)),255]},(i,t,e,n)=>{const s=Math.hypot(i-.5,t-.5);return[...J(ut([92,168,70],[50,124,44],Math.min(1,s*2)),ct(e,n,28,6)),255]},...[[[34,34,38],[58,58,64]],[[196,108,52],[236,150,84]],[[196,160,128],[232,204,176]]].map((i,t)=>(e,n,s,r)=>{const o=vt(e,n,4,4,3);let a=ut([92,94,100],[142,144,150],o);return Oe(e*6,n*6,6,6,116+t)>.68&&(a=ut(i[0],i[1],Oe(e*24,n*24,24,24,119+t))),[...J(a,ct(s,r,29+t,9)),255]}),(i,t,e,n)=>{const s=Math.abs((i+t)*3%1-.5),r=Math.abs((i-t+1)*3%1-.5),o=Math.min(s,r),a=ut([40,170,230],[170,250,255],1-o*2);return[...J(a,vt(i,t,6,2,120)*30-15),255]},(i,t,e,n)=>{const s=vt(i,t,5,3,121),r=vt(i,t,9,2,122)>.64;return[...J(ut([60,50,38],[92,76,58],s),r?18:ct(e,n,32,8)),255]},(i,t,e,n)=>{const s=Mc(i,t,e,n);if(He(e>>2,n>>2,123)>.88&&(e&3)>0&&(n&3)>0){const o=Math.floor(He(e>>2,n>>2,124)*4);return[...[[250,230,70],[240,80,110],[250,250,250],[150,110,240]][o],255]}return s},(i,t,e,n)=>{const s=Math.floor(i*4),r=Math.abs(i*4%1-.5)>.45;let o=ut([38,38,44],[66,64,72],vt(i,t+s*.3,4,3,125));return r&&(o=J(o,-14)),[...J(o,ct(e,n,33,8)),255]},(i,t,e,n)=>{const s=vt(i,t,4,3,126);return Math.abs(vt(i,t,5,2,127)-.5)<.06?[60,30,26,255]:[...ut([230,70,20],[255,200,60],s),255]},(i,t,e,n)=>Oe(i*5,t*5,5,5,128)>.72?[...J([240,236,226],ct(e,n,34,6)),255]:[...J(ut([170,34,38],[214,60,56],vt(i,t,4,2,129)),ct(e,n,35,8)),255],(i,t,e,n)=>[...J(ut([98,82,108],[140,120,150],vt(i,t,6,3,130)),ct(e,n,36,12)),255],(i,t,e,n)=>{const s=.16+.08*Oe(i*8,.5,8,1,131);return t<s?[...J([120,100,130],ct(e,n,37,10)),255]:Oa(i,t,e,n)},(i,t,e,n)=>{const s=Math.floor(t*4),r=t*4%1;let o=ut([206,182,124],[226,204,150],vt(i,t,5,2,132+s));return r<.06&&(o=J(o,-22)),[...J(o,ct(e,n,38,6)),255]},(i,t,e,n)=>[...J(ut([214,206,188],[240,234,222],Oe(i*8,t*2,8,2,133)),ct(e,n,39,6)),255],(i,t,e,n)=>{const s=vt(i,t,7,3,134),r=vt(i,t,8,2,135),o=ut([24,100,22],[70,170,40],s);return r>.68?[o[0],o[1],o[2],0]:[...J(o,ct(e,n,40,10)),255]},(i,t,e,n)=>{const s=Math.floor(t*4),r=t*4%1;let o=ut([150,112,66],[182,140,88],vt(i*.5,t,6,2,140+s));return r<.05&&(o=J(o,-40)),(Math.abs(i-.5)<.03||Math.abs(t-.5)<.03)&&(o=[84,58,34]),Math.min(i,t,1-i,1-t)<.08&&(o=[104,76,44]),[...J(o,ct(e,n,41,8)),255]},(i,t,e,n)=>{let s=ut([150,112,66],[182,140,88],vt(i,t*.5,6,2,142));return t*4%1<.05&&(s=J(s,-36)),t<.14&&(s=[110,80,46]),i>.18&&i<.44&&t>.32&&t<.5&&(s=[186,190,198]),i>.4&&i<.48&&t>.3&&t<.52&&(s=[90,60,34]),i>.6&&i<.66&&t>.3&&t<.78&&(s=[96,66,38]),i>.54&&i<.74&&t>.26&&t<.36&&(s=[120,124,132]),[...J(s,ct(e,n,42,8)),255]},(i,t,e,n)=>{const s=Math.floor(t*4),r=s&1?.25:0,o=(i*2+r)%1,a=t*4%1;let l=ut([96,96,102],[132,132,138],vt(i,t,5,3,144));if((o<.05||a<.07)&&(l=J(l,-38)),i>.26&&i<.74&&t>.52&&t<.86){const c=1-Math.abs(i-.5)*3;l=t>.68?ut([200,70,20],[255,190,60],c*Oe(i*8,t*8,8,8,145)):[26,22,22]}return[...J(l,ct(e,n,43,8)),255]},(i,t,e,n)=>{let s=ut([100,100,106],[136,136,142],vt(i,t,5,3,146));return Math.abs(i-.5)<.16&&Math.abs(t-.5)<.16&&(s=[30,26,26]),[...J(s,ct(e,n,44,8)),255]},(i,t,e,n)=>{const s=vt(i,t,8,3,147),r=Oe(i*16,t*16,16,16,148);return[...J(ut([214,210,202],[246,244,238],s*.5+r*.5),ct(e,n,45,6)),255]},(i,t,e,n)=>{const s=t*5%1,r=s<.32;let o=ut([74,50,30],[104,72,46],vt(i,t,6,3,150));return r&&(o=J(o,-22)),[...J(o,ct(e,n,46,10)),255]},...[0,1,2,3].map(i=>(t,e,n,s)=>{const r=[.3,.52,.76,.92][i],o=[[70,170,50],[90,176,54],[150,176,60],[214,184,76]][i],a=Math.floor(t*8),l=t*8%1,c=r*(.8+.2*He(a,i,151));return 1-e>c||l<.3||l>.7?i===3&&1-e>c-.22&&1-e<c+.04&&l>.15&&l<.85&&He(n>>1,s>>1,152)>.3?[228,196,90,255]:[0,0,0,0]:[...J(o,ct(n,s,47+i,16)-(1-e)*20),255]}),(i,t,e,n)=>{const s=vt(i,t,6,3,160),r=Oe(i*16,t*16,16,16,161);let o=ut([128,110,84],[160,142,112],s);return r>.72?o=J(o,22):r<.22&&(o=J(o,-18)),[...J(o,ct(e,n,50,10)),255]},(i,t,e,n)=>{const s=(h,f)=>He(Math.floor(h),Math.floor(f),162),r=i*4+(Math.floor(t*4)&1)*.5,o=t*4,a=r%1,l=o%1;let c=ut([96,96,100],[150,150,156],s(r,o)*.6+vt(i,t,5,2,163)*.4);return(a<.08||l<.1)&&(c=[64,64,68]),[...J(c,ct(e,n,51,8)),255]},...[0,1].map(i=>(t,e,n,s)=>{let r=ut([110,110,116],[140,140,146],vt(t,e,5,2,164));Math.abs(t-.5)<.2&&Math.abs(e-.5)<.3&&(r=[70,70,76]);const o=.5+(i?.12:-.12)*(.5-e)*2;return Math.abs(t-o)<.05&&e>.25&&e<.6&&(r=[138,98,54]),Math.abs(t-(i?.62:.38))<.08&&e>.2&&e<.3&&(r=i?[80,240,120]:[200,60,60]),[...J(r,ct(n,s,52,6)),255]}),(i,t,e,n)=>{let s=ut([84,84,92],[112,112,120],vt(i,t,5,2,165));return(Math.abs(i-.5)<.07||Math.abs(t-.5)<.07)&&(s=[214,128,60]),Math.abs(i-.5)<.12&&Math.abs(t-.5)<.12&&(s=[240,160,80]),[...J(s,ct(e,n,53,6)),255]},(i,t,e,n)=>{let s=ut([60,64,76],[86,90,104],vt(i,t,5,2,166));const r=Math.hypot(i-.5,t-.5);return r<.18?s=ut([60,200,240],[180,250,255],1-r/.18):r<.24&&(s=[200,120,60]),[...J(s,ct(e,n,54,6)),255]},(i,t,e,n)=>{let s=ut([56,60,72],[80,84,98],vt(i,t,5,2,167));const r=Math.hypot(i-.5,t-.15);return t>.15&&Math.abs(r*5%1-.5)<.09&&r<.75&&(s=[106,232,255]),t>.82&&(s=[200,120,60]),[...J(s,ct(e,n,55,6)),255]},(i,t,e,n)=>{let s=ut([70,74,86],[98,102,116],vt(i,t,5,2,168));return(i*6%1<.12||t*6%1<.12)&&(s=[180,110,56]),Math.hypot(i-.5,t-.5)<.12&&(s=[106,232,255]),[...J(s,ct(e,n,56,6)),255]},...[0,1].map(i=>(t,e,n,s)=>{let r=ut([48,52,62],[70,74,86],vt(t,e,5,2,169));const o=Math.hypot(t-.5,e-.58);return o<.26&&o*14%1<.5&&(r=[30,32,40]),e<.2&&Math.abs(t-.5)<.3&&(r=i?[90,255,140]:[90,40,40]),[...J(r,ct(n,s,57,6)),255]}),...[0,1].map(i=>(t,e,n,s)=>{if(Math.min(t,e,1-t,1-e)<.1)return[...J([150,96,52],ct(n,s,58,8)),255];const o=vt(t,e,4,2,170);return[...J(i?ut([255,200,90],[255,240,170],o):ut([86,70,50],[110,92,66],o),ct(n,s,59,6)),255]}),(i,t,e,n)=>{let s=ut([150,152,160],[188,190,198],vt(i,t,4,2,171));return(t*2%1<.05||i<.05||i>.95)&&(s=[96,98,106]),Math.hypot(i*4%1-.5,t*2%1-.2)<.09&&(s=[110,112,120]),[...J(s,ct(e,n,60,6)),255]},(i,t,e,n)=>Math.min(i,t,1-i,1-t)>.1?[0,0,0,0]:[...J([120,122,130],ct(e,n,61,8)),255],(i,t,e,n)=>Math.abs(i-.22)<.055||Math.abs(i-.78)<.055?[...J(ut([150,150,158],[200,200,208],1-Math.abs(i-(i<.5?.22:.78))/.055),ct(e,n,62,6)),255]:t*4%1<.42&&i>.08&&i<.92?[...J(ut([104,72,42],[132,94,56],vt(i,t,6,2,172)),ct(e,n,63,8)),255]:[0,0,0,0],(i,t,e,n)=>{const s=Math.floor(t*4),r=i*2+(s&1)*.5,o=r%1,a=t*4%1;let l=ut([112,114,120],[150,152,158],He(Math.floor(r),s,180)*.5+vt(i,t,6,2,181)*.5);return o<.04||a<.08?l=[78,78,84]:a<.16&&(l=J(l,12)),[...J(l,ct(e,n,70,7)),255]},(i,t,e,n)=>{const s=Math.min(i,t,1-i,1-t);let r=ut([150,152,158],[176,178,184],vt(i,t,3,3,182));return s<.04?r=[118,120,126]:s<.08&&(r=J(r,14)),[...J(r,ct(e,n,71,4)),255]},(i,t,e,n)=>{const s=hi[8](i,t,e,n);return[s[0]*.5,s[1]*.4,s[2]*.34,255]},(i,t,e,n)=>{const s=hi[8](i,t,e,n);return[Math.min(255,s[0]*1.2+30),Math.min(255,s[1]*1.2+30),Math.min(255,s[2]*1.15+34),255]},(i,t,e,n)=>{const s=Math.floor(t*5),r=i*4+(s&1)*.5,o=t*5%1,a=r%1;let l=ut([150,58,44],[196,86,62],He(Math.floor(r),s,183)*.5+vt(i,t,6,2,184)*.4);return l=J(l,(o-.5)*-40),(o>.88||a<.05)&&(l=[96,34,28]),[...J(l,ct(e,n,72,8)),255]},(i,t,e,n)=>{const s=t*2%1;if(s<.14||i<.06||i>.94){const h=hi[8](i,t,e,n);return[h[0]*.8,h[1]*.8,h[2]*.8,255]}const r=Math.floor(i*9)+Math.floor(t*2)*9,o=He(r,1,185),a=.14+He(r,2,186)*.25;if(s<a)return[40,28,18,255];const l=[[160,40,40],[40,90,160],[50,130,60],[190,150,50],[110,60,140],[180,100,40]];let c=l[Math.floor(o*l.length)];return i*9%1<.1&&(c=J(c,-40)),Math.abs(s-.55)<.04&&(c=J(c,50)),[...J(c,ct(e,n,73,8)),255]},(i,t,e,n)=>{if(Math.min(i,t,1-i,1-t)<.12||Math.abs(i-.5)<.04)return[...J([52,52,58],ct(e,n,74,8)),255];const r=Math.hypot(i-.5,t-.55);return[...ut([255,236,170],[255,170,60],Math.min(1,r*2.2)),255]},...[[[186,98,52],[236,150,92]],[[176,178,186],[226,228,234]]].map(([i,t],e)=>(n,s,r,o)=>{const a=Math.min(n,s,1-n,1-s);let l=ut(i,t,vt(n,s,3,2,187+e)*.6+(1-s)*.4);return a<.05?l=J(l,-50):a<.09&&(l=J(l,26)),Math.hypot(n*2%1-.5,s*2%1-.5)>.44&&a>.09&&a<.16&&(l=J(l,-30)),[...J(l,ct(r,o,75+e,5)),255]}),(i,t,e,n)=>{let s=ut([196,160,64],[232,204,100],Oe(i*3,t*40,3,40,189));return(Math.abs(t-.3)<.04||Math.abs(t-.7)<.04)&&(s=[120,84,40]),[...J(s,ct(e,n,77,12)),255]},(i,t,e,n)=>{const s=Math.hypot(i-.5,t-.5);let r=ut([200,166,70],[238,210,110],(s*14+vt(i,t,6,2,190)*2)%1);return(Math.abs(i-.3)<.04||Math.abs(i-.7)<.04)&&(r=[120,84,40]),[...J(r,ct(e,n,78,10)),255]},...[[236,238,240],[36,38,44],[190,44,44],[232,120,30],[240,200,40],[70,160,60],[40,90,190],[130,60,180]].map((i,t)=>(e,n,s,r)=>[...J(J(i,(vt(e,n,5,3,191+t)-.5)*18),ct(s,r,79+t,7)),255]),...[[220,60,70],[70,120,230],[70,200,110]].map((i,t)=>(e,n,s,r)=>{if(Math.min(e,n,1-e,1-n)<.06)return[...J(ut(i,[255,255,255],.35),ct(s,r,90+t,6)),255];const a=(e+n)%.5<.06?40:0;return[...J(i,a),120]}),(i,t,e,n)=>{const s=Math.min(i,1-i),r=hi[8](i,t,e,n);let o=[r[0]*.8,r[1]*.68,r[2]*.56];return(s<.1||t<.06||t>.94||Math.abs(t-.5)<.03)&&(o=J(o,-34)),t<.4&&t>.12&&s>.18?[150,200,230,150]:(Math.hypot(i-.8,t-.55)<.05&&(o=[210,190,90]),[...o,255])},(i,t,e,n)=>{if(Math.abs(i-.18)<.07||Math.abs(i-.82)<.07||t*4%1<.16&&i>.12&&i<.88){const s=hi[8](i,t,e,n);return[s[0]*.85,s[1]*.8,s[2]*.75,255]}return[0,0,0,0]},(i,t,e,n)=>{const s=vt(i,t,4,3,200),r=Math.abs(vt(i,t,3,3,201)-.5);let o=ut([62,70,140],[104,116,196],s);return r<.03&&(o=ut(o,[200,220,255],.7)),[...J(o,ct(e,n,100,8)),255]},(i,t,e,n)=>{const s=hi[7](i,t,e,n);return[s[0]*.8+18,s[1]*.8+30,Math.min(255,s[1]*1.3+40),s[3]]},(i,t,e,n)=>{let s=ut([150,84,34],[190,116,54],vt(i,t,5,3,202));return Math.hypot(i*3%1-.5,t*3%1-.5)<.12&&(s=[238,220,184]),[...J(s,ct(e,n,102,10)),255]},(i,t,e,n)=>{let s=ut([236,226,234],[252,246,250],vt(i,t,4,2,203));const r=He(Math.floor(i*10),Math.floor(t*10),204);return r<.16&&(s=[[230,80,120],[90,170,230],[250,200,60],[120,200,110]][Math.floor(r*25)%4]),[...J(s,ct(e,n,103,5)),255]},(i,t,e,n)=>{const s=hi[7](i,t,e,n),r=Math.hypot(i*4%1-.5,t*4%1-.5);return He(Math.floor(i*4),Math.floor(t*4),205)<.45&&r<.2?[...J([200-r*300,30,50],ct(e,n,104,12)),255]:[s[0]*.85,s[1]*.9,s[2]*.8,s[3]]},(i,t,e,n)=>{const s=i*4%1,r=t*4%1,o=Math.hypot(s-.5,r-.5);return[...J([40+(.5-o)*40,42+(.5-o)*40,52+(.5-o)*40],ct(e,n,105,6)),255]},(i,t,e,n)=>Math.min(i,t,1-i,1-t)<.08?[60,20,24,255]:Math.abs(t-.5)<.12&&i>.18&&i<.82&&i*10%1<.7?[255,240,236,255]:[...ut([255,60,70],[200,20,40],Math.hypot(i-.5,t-.5)*1.4),255],(i,t,e,n)=>{const s=Math.min(i,t,1-i,1-t);let r=ut([210,160,40],[255,226,110],vt(i,t,3,2,206)*.5+(1-t)*.5);return s<.05?r=J(r,-50):s<.09&&(r=J(r,30)),[...J(r,ct(e,n,107,5)),255]},(i,t,e,n)=>{const s=Math.hypot(i-.5,t-.5);return s<.1?[240,240,240,255]:s<.15||Math.abs(t-.5)<.05?[30,30,36,255]:[...J(t<.5?[214,50,50]:[236,236,240],ct(e,n,108,8)),255]},(i,t,e,n)=>{const s=Math.floor(i*12),r=.35+He(s,7,207)*.6,o=(He(s,8,208)-.5)*.08*(1-t),a=(s+.5)/12+o;return 1-t<r&&Math.abs(i-a)<.035*(.4+t)?[...J(ut([60,120,40],[130,190,80],1-t),ct(e,n,109,12)),255]:[70,130,50,0]}];hi.length;const u2=new Set([76,77,78,79,80,83,84,85,87,88,89,90,91,92,93,94,0,1,2,3,4,5,6,8,14,15,18,19,25,26,27,28,29,30,31,32,33,35,37,38,39,41,42,43,45,46,47,48,49,52,53,54,55,61,63,64,65,66,67,68,69,70,73]);function f2(){const i=document.createElement("canvas");i.width=Le*fr,i.height=Le*od;const t=i.getContext("2d"),e=t.createImageData(Le,Le),n=e.data,s=Le*fr,r=Le*od,o=new Uint8Array(s*r*4);for(let a=0;a<hi.length;a++){for(let l=0;l<Le;l++)for(let c=0;c<Le;c++){const h=hi[a]((c+.5)/Le,(l+.5)/Le,c,l),f=(l*Le+c)*4;let u=0;if(u2.has(a)){const x=Math.min(c,l,Le-1-c,Le-1-l);x<3&&(u=(c<Le/2&&c<=l||l<Le/2&&l<c?16:-20)*(1-x/3))}n[f]=Math.max(0,Math.min(255,h[0]+u)),n[f+1]=Math.max(0,Math.min(255,h[1]+u)),n[f+2]=Math.max(0,Math.min(255,h[2]+u)),n[f+3]=Math.max(0,Math.min(255,h[3]));const p=((r-1-(Math.floor(a/fr)*Le+l))*s+a%fr*Le+c)*4;o[p]=n[f],o[p+1]=n[f+1],o[p+2]=n[f+2],o[p+3]=n[f+3]}t.putImageData(e,a%fr*Le,Math.floor(a/fr)*Le)}return i.raw=o,i}function d2(i,t){const e=document.createElement("canvas");e.width=e.height=lo*_c;const n=e.getContext("2d");n.fillStyle="#0e1224",n.fillRect(0,0,e.width,e.height);let s=ad;for(let r=0;r<ad;r++){const o=new Image,a=String(r+1).padStart(2,"0"),l=()=>{--s===0&&t&&t()};o.onload=()=>{n.drawImage(o,r%_c*lo,Math.floor(r/_c)*lo,lo,lo),i&&i(),l()},o.onerror=l,o.src=`logos/${a}.png`}return e}function p2(){const t=document.createElement("canvas");t.width=t.height=128;const e=t.getContext("2d"),n=e.createImageData(128,128);for(let s=0;s<128;s++)for(let r=0;r<128;r++){const o=vt((r+.5)/128,(s+.5)/128,4,4,77),a=Math.max(0,Math.min(1,(o-.5)/.18)),l=(s*128+r)*4;n.data[l]=n.data[l+1]=n.data[l+2]=255,n.data[l+3]=a*a*(3-2*a)*255}return e.putImageData(n,0,0),t}const So=32,ns=8;function m2(i){const t=document.createElement("canvas");t.width=So*ns,t.height=So*Math.max(1,Math.ceil(i.length/ns));const e=t.getContext("2d");return i.forEach((n,s)=>{const r=s%ns*So,o=Math.floor(s/ns)*So,a=(p,x,v,m=1,g=1)=>{e.fillStyle=v,e.fillRect(r+p*2,o+x*2,m*2,g*2)},l=(p=2)=>{for(let x=p;x<14;x++)a(x,15-x,"#5a3a1e"),a(x,14-x,"#8a6034")},c=(p,x)=>{const v=parseInt(p.slice(1),16),m=g=>Math.max(0,Math.min(255,Math.round(g*x)));return`rgb(${m(v>>16)},${m(v>>8&255)},${m(v&255)})`},h=n.col||"#ccc",f=c(h,.62),u=c(h,1.18);switch(n.draw){case"stick":l(1);break;case"ingot":for(let p=0;p<5;p++)a(3+p,6+p,p?h:u,10-p,1);a(3,11,f,10,1),a(12,6,f,1,5);break;case"apple":a(5,5,"#c82a2a",7,8),a(4,6,"#c82a2a",9,6),a(6,6,"#f06a5a",2,2),a(5,12,"#8a1a1a",7,1),a(8,2,"#5a3a1e",1,3),a(9,2,"#3c8a2a",3,2);break;case"meat":a(3,5,h,9,7),a(2,6,h,11,5),a(4,6,u,3,2),a(3,11,f,9,1),a(12,9,"#efe6d2",2,2),a(13,8,"#efe6d2",2,1),a(13,11,"#efe6d2",2,1);break;case"spitzhacke":l(3);for(let p=0;p<10;p++){const x=3+p,v=2+Math.round(Math.abs(p-4.5)*.55);a(x,v,h),a(x,v+1,f)}a(3,4,u),a(12,4,u);break;case"axt":l(3),a(8,2,h,4,5),a(7,3,h,1,4),a(12,3,f,1,3),a(8,2,u,4,1),a(8,6,f,4,1);break;case"schaufel":l(5),a(10,2,h,4,4),a(9,3,h,1,3),a(14,3,f,1,3),a(10,2,u,4,1),a(11,6,f,2,1);break;case"hacke":l(3),a(9,2,h,5,2),a(12,4,h,2,2),a(9,2,u,5,1),a(13,4,f,1,2);break;case"schwert":for(let p=0;p<9;p++)a(5+p,10-p,h),a(6+p,10-p,u),a(5+p,11-p,f);a(3,10,"#5a3a1e",4,1),a(5,8,"#5a3a1e",1,5),a(2,13,"#8a6034",2,2),a(4,11,"#8a6034",1,2);break;case"seeds":[[4,6],[8,4],[10,8],[6,10],[11,11],[5,13],[9,12]].forEach(([p,x])=>{a(p,x,"#c8b060",2,1),a(p,x+1,"#8a7a3a",2,1)});break;case"wheat":for(let p=0;p<3;p++){const x=5+p*3;a(x,7,"#6a8a2a",1,8),a(x-1,2,"#e0c060",3,5),a(x,1,"#f0d880",1,2)}a(4,11,"#8a6a2a",9,1);break;case"bread":a(2,6,"#c8843c",12,6),a(3,5,"#d89848",10,1),a(2,12,"#8a5420",12,1);for(let p=0;p<3;p++)a(4+p*3,7,"#f0c070",2,1);break;case"helm":a(4,4,h,8,3),a(3,6,h,10,4),a(3,10,f,3,2),a(10,10,f,3,2),a(5,4,u,5,1),a(6,8,"#1a1a22",4,1);break;case"harnisch":a(3,3,h,3,3),a(10,3,h,3,3),a(4,5,h,8,8),a(5,5,u,2,6),a(4,12,f,8,1),a(7,3,f,2,3);break;case"boot":a(1,8,h,14,3),a(2,11,f,12,2),a(3,13,f,10,1),a(1,7,u,14,1),a(4,9,"#5a3a1e",8,1),a(7,2,"#5a3a1e",1,6),a(8,3,"#efe6d2",4,3);break;case"lore":a(2,5,h,12,6),a(2,5,u,12,1),a(3,6,f,10,1),a(2,10,f,12,1),a(3,11,"#2a2a30",3,3),a(10,11,"#2a2a30",3,3),a(4,12,"#6a6a72",1,1),a(11,12,"#6a6a72",1,1);break;default:a(4,4,h,8,8)}}),t}const ld=64,ll={boot:{item:q.BOAT,half:.6,h:.55,seat:.25,max:7,name:"Boot"},lore:{item:q.MINECART,half:.45,h:.75,seat:.3,max:10,name:"Lore"}},Ai=[[1,0],[0,1],[-1,0],[0,-1]],g2=(i,t)=>Math.atan2(-i,-t),cd=.001;class hd{constructor(t,e,n,s,r=0){this.kind=t,this.K=ll[t],this.x=e,this.y=n,this.z=s,this.yaw=r,this.speed=0,this.vy=0,this.rider=!1,this.t=0,this.rail=null}}class v2{constructor(t,e){if(this.world=t,this.list=[],this.onAdd=()=>{},this.onRemove=()=>{},Array.isArray(e))for(const n of e)!Array.isArray(n)||!ll[n[0]]||!n.slice(1,5).every(Number.isFinite)||this.list.length>=ld||this.list.push(new hd(n[0],n[1],n[2],n[3],n[4]))}attach(){for(const t of this.list)this.onAdd(t)}add(t,e,n,s,r=0){if(!ll[t]||this.list.length>=ld)return null;const o=new hd(t,e,n,s,r);return t==="lore"&&!this.snapRail(o,r)?null:(this.list.push(o),this.onAdd(o),o)}remove(t){const e=this.list.indexOf(t);e<0||(this.list.splice(e,1),this.onRemove(t))}clear(){for(const t of this.list.slice())this.remove(t)}serialize(){return this.list.map(t=>[t.kind,+t.x.toFixed(2),+t.y.toFixed(2),+t.z.toFixed(2),+t.yaw.toFixed(2)])}raycast(t,e,n,s,r,o,a){let l=null;for(const c of this.list){const h=c.K.half,f=[c.x-h,c.y,c.z-h],u=[c.x+h,c.y+c.K.h,c.z+h],p=[t,e,n],x=[s,r,o];let v=0,m=a;for(let g=0;g<3&&v<=m;g++){if(Math.abs(x[g])<1e-9){(p[g]<f[g]||p[g]>u[g])&&(v=1/0);continue}let _=(f[g]-p[g])/x[g],M=(u[g]-p[g])/x[g];_>M&&([_,M]=[M,_]),v=Math.max(v,_),m=Math.min(m,M)}v<=m&&(!l||v<l.t)&&(l={veh:c,t:v})}return l}update(t,e,n){for(const s of this.list){const r=this.world;if(r.isLoaded&&!r.isLoaded(Math.floor(s.x),Math.floor(s.z)))continue;const o=Math.max(1,Math.ceil(t*60-1e-9)),a=t/o,l=s===e?n:null;for(let c=0;c<o;c++)s.kind==="boot"?this.stepBoat(s,a,l):this.stepCart(s,a,l);s.t+=t*Math.abs(s.speed)}}waterTop(t,e,n){const s=this.world,r=Math.floor(t),o=Math.floor(n);let a=Math.floor(e+.3);if(s.getBlock(r,a,o)!==d.WATER&&(a--,s.getBlock(r,a,o)!==d.WATER))return null;for(let l=0;l<4&&s.getBlock(r,a+1,o)===d.WATER;l++)a++;return a+1-.12}boxHits(t,e,n,s){const r=this.world,o=t.K.half;for(let a=Math.floor(n);a<=Math.floor(n+t.K.h-1e-7);a++)for(let l=Math.floor(s-o);l<=Math.floor(s+o-1e-7);l++)for(let c=Math.floor(e-o);c<=Math.floor(e+o-1e-7);c++)if(r.isSolid(c,a,l))return!0;return!1}stepBoat(t,e,n){const s=this.waterTop(t.x,t.y,t.z),r=s!==null;n&&(t.yaw-=n.r*1.9*e*(r?1:.3),t.speed+=n.f*(r?5:1.2)*e);const o=r?t.K.max:1.2;t.speed=Math.max(-o*.5,Math.min(o,t.speed)),t.speed-=t.speed*Math.min(1,(r?.6:4)*e),Math.abs(t.speed)<.01&&(t.speed=0),r?(t.vy+=(s-.3-t.y)*30*e,t.vy-=t.vy*Math.min(1,6*e)):t.vy=Math.max(-30,t.vy-25*e);const a=-Math.sin(t.yaw)*t.speed*e,l=-Math.cos(t.yaw)*t.speed*e;this.boxHits(t,t.x+a,t.y,t.z)?t.speed*=.2:t.x+=a,this.boxHits(t,t.x,t.y,t.z+l)?t.speed*=.2:t.z+=l;const c=t.y+t.vy*e;this.boxHits(t,t.x,c,t.z)?(t.vy<0&&(t.y=Math.floor(c)+1+cd),t.vy=0):t.y=c}isRail(t,e,n){return this.world.getBlock(t,e,n)===d.RAIL}nextRail(t,e,n,s){const[r,o]=Ai[s];for(const a of[0,1,-1])if(this.isRail(t+r,e+a,n+o))return[t+r,e+a,n+o];return null}snapRail(t,e){const n=Math.floor(t.x),s=Math.floor(t.z);let r=Math.floor(t.y+.5);if(!this.isRail(n,r,s)&&(r--,!this.isRail(n,r,s)))return!1;const o=-Math.sin(e),a=-Math.cos(e),l=[0,1,2,3].sort((h,f)=>Ai[f][0]*o+Ai[f][1]*a-(Ai[h][0]*o+Ai[h][1]*a)),c=l.find(h=>this.nextRail(n,r,s,h))??l[0];return t.rail={x:n,y:r,z:s,d:c,p:0},t.speed=0,t.vy=0,this.placeOnRail(t),!0}placeOnRail(t){const e=t.rail,[n,s]=Ai[e.d],r=this.nextRail(e.x,e.y,e.z,e.d),o=r?r[1]:e.y;t.x=e.x+.5+n*e.p,t.z=e.z+.5+s*e.p,t.y=e.y+.0625+(o-e.y)*e.p,t.yaw=g2(n,s)}stepCart(t,e,n){const s=t.rail;if(!s||!this.isRail(s.x,s.y,s.z)){t.rail=null,t.speed=0,t.vy=Math.max(-30,t.vy-25*e);const a=t.y+t.vy*e;this.boxHits(t,t.x,a,t.z)?(t.vy<0&&(t.y=Math.floor(a)+1+cd),t.vy=0):t.y=a,t.vy===0&&this.snapRail(t,t.yaw);return}if(n){const a=n.look||Ai[s.d];if(n.f>.2&&t.speed<.3&&a[0]*Ai[s.d][0]+a[1]*Ai[s.d][1]<-.2){const l=this.nextRail(s.x,s.y,s.z,s.d);s.d=(s.d+2)%4,l&&s.p>0&&(s.x=l[0],s.y=l[1],s.z=l[2],s.p=1-s.p)}t.speed+=(n.f>0?n.f*4:n.f*8)*e}const r=this.nextRail(s.x,s.y,s.z,s.d);r&&(t.speed-=(r[1]-s.y)*7*e),t.speed-=t.speed*Math.min(1,.25*e),t.speed=Math.max(0,Math.min(t.K.max,t.speed)),t.speed<.02&&(t.speed=0);let o=t.speed*e;for(let a=0;o>0&&a<4;a++){const l=this.nextRail(s.x,s.y,s.z,s.d);if(!l){s.p=0,t.speed=0;break}const c=1-s.p;if(o<c){s.p+=o,o=0;break}if(o-=c,s.x=l[0],s.y=l[1],s.z=l[2],s.p=0,!this.nextRail(s.x,s.y,s.z,s.d)){const h=[1,3].map(f=>(s.d+f)%4).find(f=>this.nextRail(s.x,s.y,s.z,f));h!==void 0&&(s.d=h,t.speed*=.85)}}this.placeOnRail(t)}exitSpot(t,e){const n=[[0,t.K.h+.05,0],[1.2,.1,0],[-1.2,.1,0],[0,.1,1.2],[0,.1,-1.2],[1.2,1.1,0],[-1.2,1.1,0],[0,1.1,1.2],[0,1.1,-1.2]];for(const[s,r,o]of n)if(!e(t.x+s,t.y+r,t.z+o))return[t.x+s,t.y+r,t.z+o];return[t.x,t.y+t.K.h+.05,t.z]}}const x2=[[[-.2,.25,-.25,.2,.6,.27,16052972],[-.13,.5,-.42,.13,.82,-.18,16052972],[-.06,.6,-.52,.06,.68,-.42,15769632],[-.03,.82,-.36,.03,.9,-.24,14168112],[-.13,0,-.04,-.07,.25,.02,15249456],[.07,0,-.04,.13,.25,.02,15249456]],[[-.4,.45,-.6,.4,1.08,.6,15526626],[-.2,.72,-.95,.2,1.12,-.56,13154464],[-.21,1,-.9,.21,1.16,-.6,15526626],[-.32,0,-.5,-.14,.46,-.32,4867136],[.14,0,-.5,.32,.46,-.32,4867136],[-.32,0,.32,-.14,.46,.5,4867136],[.14,0,.32,.32,.46,.5,4867136]],[[-.42,.55,-.7,.42,1.22,.7,6964264],[-.43,.75,-.2,.43,1.12,.25,15920870],[-.25,.85,-1.08,.25,1.36,-.7,5913122],[-.16,.86,-1.13,.16,1.02,-1.06,15118496],[-.32,1.3,-.95,-.24,1.46,-.88,15262416],[.24,1.3,-.95,.32,1.46,-.88,15262416],[-.36,0,-.62,-.16,.56,-.42,3811354],[.16,0,-.62,.36,.56,-.42,3811354],[-.36,0,.42,-.16,.56,.62,3811354],[.16,0,.42,.36,.56,.62,3811354]],[[-.28,.75,-.16,.28,1.35,.16,2761792],[-.22,1.35,-.22,.22,1.75,.22,3419218],[-.15,1.52,-.24,-.05,1.6,-.21,7008511],[.05,1.52,-.24,.15,1.6,-.21,7008511],[-.02,1.75,-.02,.02,1.98,.02,9076912],[-.05,1.96,-.05,.05,2.04,.05,16727180],[-.42,.8,-.08,-.28,1.32,.08,2761792],[.28,.8,-.08,.42,1.32,.08,2761792],[-.22,0,-.1,-.04,.75,.1,2235446],[.04,0,-.1,.22,.75,.1,2235446]],[[-.42,.25,-.3,.42,.72,.5,3816004],[-.28,.3,-.62,.28,.66,-.3,2763314],[-.2,.5,-.64,-.08,.6,-.61,16724016],[.08,.5,-.64,.2,.6,-.61,16724016],...[-.2,.1,.35].flatMap(i=>[[-.82,0,i-.05,-.42,.4,i+.05,2368556],[.42,0,i-.05,.82,.4,i+.05,2368556]])],[[-.35,.15,-.35,.35,.42,.35,5265512],[-.2,.42,-.2,.2,.56,.2,2764344],[-.1,.2,-.38,.1,.34,-.35,16719952],[-.03,.56,-.03,.03,.7,.03,9079446],...[[-1,-1],[1,-1],[1,1],[-1,1]].map(([i,t])=>[i*.55-.13,.44,t*.55-.13,i*.55+.13,.48,t*.55+.13,10133676])],[[-.2,0,-.1,-.02,.7,.1,4864554],[.02,0,-.1,.2,.7,.1,4864554],[-.25,.7,-.15,.25,1.35,.15,3828384],[-.2,.75,-.17,.2,1.2,-.15,9071168],[-.36,.8,-.08,-.25,1.3,.08,3828384],[.25,.8,-.08,.36,1.3,.08,3828384],[-.2,1.35,-.2,.2,1.73,.2,15253658],[-.22,1.68,-.22,.22,1.82,.22,6965802],[-.12,1.52,-.22,-.05,1.58,-.2,2105376],[.05,1.52,-.22,.12,1.58,-.2,2105376]]],_2=[.8,.8,1,.5,.68,.68];function vr(i){const t=[],e=[],n=[],s=new se;for(const[o,a,l,c,h,f,u]of i){const p=new cs(c-o,h-a,f-l);p.translate((o+c)/2,(a+h)/2,(l+f)/2);const x=p.attributes.position.array,v=t.length/3;s.setHex(u);for(let m=0;m<x.length/3;m++){const g=_2[Math.floor(m/4)];t.push(x[m*3],x[m*3+1],x[m*3+2]),e.push(s.r*g,s.g*g,s.b*g)}for(const m of p.index.array)n.push(v+m);p.dispose()}const r=new ke;return r.setAttribute("position",new We(t,3)),r.setAttribute("color",new We(e,3)),r.setIndex(n),r.computeBoundingSphere(),r}class M2{constructor(t){this.group=new ii,t.add(this.group),this.geos=x2.map(vr),this.meshes=new Map}add(t){const e=new Re(this.geos[t.type],new si({vertexColors:!0}));e.matrixAutoUpdate=!0,this.group.add(e),this.meshes.set(t,e)}remove(t){const e=this.meshes.get(t);e&&(this.group.remove(e),e.material.dispose(),this.meshes.delete(t))}update(t,e,n,s,r){for(const[o,a]of this.meshes){const l=Math.hypot(o.x-t,o.z-e);if(a.visible=l<s,!a.visible)continue;const c=o.moving?Math.abs(Math.sin(r*9+o.x))*.05:0,h=o.hostile?Math.max(n,.7)*(.85+.15*Math.sin(r*23+o.z)):n;a.position.set(o.x,o.y+c,o.z),a.rotation.y=o.yaw,o.hurtT>0?a.material.color.setRGB(h*1.3,h*.45,h*.45):a.material.color.setRGB(h,h,h)}}clear(){for(const t of[...this.meshes.keys()])this.remove(t)}}const S2=[[-.6,0,-.75,.6,.12,.75,6965802],[-.6,.12,-.75,-.48,.5,.75,11041350],[.48,.12,-.75,.6,.5,.75,11041350],[-.48,.12,.63,.48,.5,.75,11041350],[-.48,.12,-.95,.48,.45,-.75,10120766],[-.48,.28,-.1,.48,.34,.12,8016944]],y2=[[-.03,-.05,-.03,.03,.75,.03,5913118],[-.08,-.32,-.02,.08,-.05,.02,9068596]],E2=[[-.45,.18,-.55,.45,.26,.55,5921892],[-.45,.26,-.55,-.37,.72,.55,9079956],[.37,.26,-.55,.45,.72,.55,9079956],[-.37,.26,-.55,.37,.72,-.47,8027268],[-.37,.26,.47,.37,.72,.55,8027268],[-.45,.66,-.55,.45,.72,-.5,12088364],[-.45,.66,.5,.45,.72,.55,12088364]],b2=[[-.04,-.12,-.12,.04,.12,.12,2763312],[-.05,-.03,-.03,.05,.03,.03,10132130],[-.045,-.12,-.02,.045,.12,.02,4868690]];class T2{constructor(t){this.group=new ii,t.add(this.group),this.geo={hull:vr(S2),paddle:vr(y2),cart:vr(E2),wheel:vr(b2)},this.items=new Map}add(t){const e=new si({vertexColors:!0}),n=new ii,s=[];if(t.kind==="boot"){n.add(new Re(this.geo.hull,e));for(const r of[-1,1]){const o=new Re(this.geo.paddle,e);o.position.set(r*.62,.45,.05),n.add(o),s.push(o)}}else{n.add(new Re(this.geo.cart,e));for(const[r,o]of[[-.48,-.35],[.48,-.35],[-.48,.35],[.48,.35]]){const a=new Re(this.geo.wheel,e);a.position.set(r,.12,o),n.add(a),s.push(a)}}this.group.add(n),this.items.set(t,{root:n,parts:s,mat:e})}remove(t){const e=this.items.get(t);e&&(this.group.remove(e.root),e.mat.dispose(),this.items.delete(t))}clear(){for(const t of[...this.items.keys()])this.remove(t)}update(t,e,n,s,r){for(const[o,a]of this.items){const l=Math.hypot(o.x-t,o.z-e)<s;if(a.root.visible=l,!!l)if(a.root.position.set(o.x,o.y,o.z),a.root.rotation.y=o.yaw,a.mat.color.setRGB(n,n,n),o.kind==="boot")a.root.rotation.z=Math.sin(r*1.7+o.x)*.04,a.root.rotation.x=Math.sin(r*1.3+o.z)*.03,a.parts.forEach((c,h)=>{c.rotation.x=Math.sin(o.t*2.2+h*Math.PI)*.7,c.rotation.z=(h?-1:1)*.5});else{a.parts.forEach(f=>{f.rotation.x=-o.t/.12});const c=o.rail,h=c?o.y-(c.y+.0625):0;a.root.rotation.x=h>.01?Math.PI/4:h<-.01?-Math.PI/4:0}}}}const co=[{key:"einzeln",name:"Einzeln",clicks:1},{key:"linie",name:"Linie",clicks:2},{key:"flaeche",name:"Fläche",clicks:2},{key:"wand",name:"Wand",clicks:2},{key:"saeule",name:"Säule",clicks:2},{key:"kopieren",name:"Kopieren",clicks:2,creative:!0},{key:"einfuegen",name:"Einfügen",clicks:1,creative:!0}],Ah={creative:8192,survival:512},A2=32768,wi=(i,t)=>{const e=[],n=i<=t?1:-1;for(let s=i;s!==t+n;s+=n)e.push(s);return e};function w2(i,t,e,n=Ah.creative){const s=[],r=(c,h,f)=>(h>=0&&h<ie&&s.push([c,h,f]),s.length<=n);if(i==="linie"){const c=Math.max(Math.abs(e[0]-t[0]),Math.abs(e[1]-t[1]),Math.abs(e[2]-t[2]));if(c+1>n)return null;for(let h=0;h<=c;h++){const f=c?h/c:0;r(Math.round(t[0]+(e[0]-t[0])*f),Math.round(t[1]+(e[1]-t[1])*f),Math.round(t[2]+(e[2]-t[2])*f))}return s}let o,a,l;if(i==="flaeche")o=wi(t[0],e[0]),a=[t[1]],l=wi(t[2],e[2]);else if(i==="saeule")o=[t[0]],a=wi(t[1],e[1]),l=[t[2]];else if(i==="wand")a=wi(t[1],e[1]),Math.abs(e[0]-t[0])>=Math.abs(e[2]-t[2])?(o=wi(t[0],e[0]),l=[t[2]]):(o=[t[0]],l=wi(t[2],e[2]));else if(i==="kopieren")o=wi(t[0],e[0]),a=wi(t[1],e[1]),l=wi(t[2],e[2]);else return[t.slice()];if(o.length*a.length*l.length>n)return null;for(const c of a)for(const h of l)for(const f of o)r(f,c,h);return s}function wh(i,t){return[Math.min(i[0],t[0]),Math.min(i[1],t[1]),Math.min(i[2],t[2]),Math.max(i[0],t[0]),Math.max(i[1],t[1]),Math.max(i[2],t[2])]}function R2(i,t,e){const[n,s,r,o,a,l]=wh(t,e),c=o-n+1,h=a-s+1,f=l-r+1;if(c*h*f>A2)return null;const u=new Uint8Array(c*h*f);let p=0;for(let x=0;x<h;x++)for(let v=0;v<f;v++)for(let m=0;m<c;m++){const g=i.getBlock(n+m,s+x,r+v);u[m+v*c+x*c*f]=g===d.WATER?d.AIR:g,g&&g!==d.WATER&&p++}return{sx:c,sy:h,sz:f,data:u,n:p}}function C2(i,t){const e=[];for(let n=0;n<i.sy;n++)for(let s=0;s<i.sz;s++)for(let r=0;r<i.sx;r++){const o=i.data[r+s*i.sx+n*i.sx*i.sz];o&&t[1]+n>=0&&t[1]+n<ie&&e.push([t[0]+r,t[1]+n,t[2]+s,o])}return e}const Rh=20,ud=64,qe=4,vn=32,L2=i=>{let t="";for(const e of i)t+=String.fromCharCode(e);return btoa(t)},D2=i=>{const t=atob(i),e=new Uint8Array(128);for(let n=0;n<Math.min(128,t.length);n++)e[n]=t.charCodeAt(n);return e},fd=i=>Number.isFinite(i);class P2{constructor(t){this.regions=new Map,this.marks=[],this.radios=new Map,this.tiles=new Map,this.count=0;const e=t&&typeof t=="object"?t:{};if(e.seen&&typeof e.seen=="object"){for(const[n,s]of Object.entries(e.seen))if(!(!/^-?\d+,-?\d+$/.test(n)||typeof s!="string"))try{const r=D2(s);this.regions.set(n,r);for(const o of r)for(let a=o;a;a&=a-1)this.count++}catch{}}if(Array.isArray(e.marks))for(const n of e.marks.slice(0,Rh))n&&fd(n.x)&&fd(n.z)&&this.marks.push({x:Math.round(n.x),z:Math.round(n.z),n:String(n.n||"Markierung").slice(0,24)});if(Array.isArray(e.radios))for(const n of e.radios.slice(0,ud))Array.isArray(n)&&n.length===3&&n.every(Number.isInteger)&&this.radios.set(n.join(","),n)}has(t,e){const n=this.regions.get(`${Math.floor(t/vn)},${Math.floor(e/vn)}`);if(!n)return!1;const s=t-Math.floor(t/vn)*vn+(e-Math.floor(e/vn)*vn)*vn;return(n[s>>3]&1<<(s&7))!==0}mark(t,e){const n=`${Math.floor(t/vn)},${Math.floor(e/vn)}`;let s=this.regions.get(n);s||(s=new Uint8Array(128),this.regions.set(n,s));const r=t-Math.floor(t/vn)*vn+(e-Math.floor(e/vn)*vn)*vn;return s[r>>3]&1<<(r&7)?!1:(s[r>>3]|=1<<(r&7),this.count++,!0)}markAround(t,e,n){const s=Math.floor(t/I),r=Math.floor(e/I);let o=0;for(let a=-n;a<=n;a++)for(let l=-n;l<=n;l++)l*l+a*a<=n*n+1&&this.mark(s+l,r+a)&&o++;return o}syncRadios(t){for(const[e,n]of this.radios)t.getChunk(n[0]>>4,n[2]>>4)&&t.getBlock(n[0],n[1],n[2])!==d.RADIO&&this.radios.delete(e);for(const[e,n]of t.radios)this.radios.size<ud&&this.has(n[0]>>4,n[2]>>4)&&this.radios.set(e,n)}addMark(t,e,n){return this.marks.length>=Rh?!1:(this.marks.push({x:Math.round(t),z:Math.round(e),n:String(n||`Markierung ${this.marks.length+1}`).slice(0,24)}),!0)}removeMark(t){t>=0&&t<this.marks.length&&this.marks.splice(t,1)}serialize(){if(!this.count&&!this.marks.length)return;const t={};for(const[e,n]of this.regions)t[e]=L2(n);return{seen:t,marks:this.marks.length?this.marks:void 0,radios:this.radios.size?[...this.radios.values()]:void 0}}tile(t,e,n){const s=`${e},${n}`,r=t.getChunk(e,n);let o=this.tiles.get(s);if(o&&(o.real||!r))return o.px;this.tiles.size>6e3&&this.tiles.clear();const a=new Uint8ClampedArray(qe*qe*4),l={},c=I/qe;for(let h=0;h<qe;h++)for(let f=0;f<qe;f++){const u=f*c+1,p=h*c+1,x=(h*qe+f)*4;let v,m=1;if(r){const g=u+p*I;let _=Math.min(ie-1,r.maxY);for(;_>0&&r.data[g+_*I*I]===d.AIR;)_--;const M=r.data[g+_*I*I];v=Gt[M]&&Gt[M].map?Gt[M].map:[200,200,210],M!==d.WATER&&(m=Math.max(.6,Math.min(1.3,.85+(_-te)*.012)))}else{const g=e*I+u,_=n*I+p;if(t.terrain==="flat")v=bs[2];else if(t.gen>=2)En(t.seed,g,_,l),v=l.h<te?bs[0]:bs[l.biome],l.h>=te&&(m=Math.max(.6,Math.min(1.3,.85+(l.h-te)*.012)));else{const M=qa(t.seed,g,_);v=M<te?bs[0]:M<=te+1?bs[1]:M>40?bs[5]:bs[2]}}a[x]=v[0]*m,a[x+1]=v[1]*m,a[x+2]=v[2]*m,a[x+3]=255}return this.tiles.set(s,{px:a,real:!!r}),a}}const N2=90,dd=4096,I2=(i,t)=>Math.max(0,Math.min(ko.length-1,Math.floor((t-i)/N2))),t0=i=>ko.includes(i);function O2(i,t=Math.random){return i===ko[ko.length-1]?[[q.WHEAT,1],[q.SEEDS,1+Math.floor(t()*2)]]:[[q.SEEDS,1]]}const pd=(i,t,e)=>i+","+t+","+e;class md{constructor(t){if(this.plants=new Map,t&&typeof t=="object")for(const[e,n]of Object.entries(t)){const s=e.split(",").map(Number);s.length===3&&s.every(Number.isInteger)&&Number.isFinite(n)&&this.plants.size<dd&&this.plants.set(e,n)}}plant(t,e,n,s){return this.plants.size>=dd?!1:(this.plants.set(pd(t,e,n),s),!0)}remove(t,e,n){this.plants.delete(pd(t,e,n))}update(t,e){let n=0;for(const[s,r]of this.plants){const[o,a,l]=s.split(",").map(Number);if(!t.isLoaded(o,l))continue;const c=t.getBlock(o,a,l);if(!t0(c)){this.plants.delete(s);continue}if(t.getBlock(o,a-1,l)!==d.FARMLAND){t.setBlock(o,a,l,d.AIR),this.plants.delete(s),n++;continue}const h=ko[I2(r,e)];h!==c&&t.setBlock(o,a,l,h)&&n++}return n}serialize(){return Object.fromEntries(this.plants)}}const pr=20,yo=20,ja=10,gd=15.5;function k2(i){return i>gd?Math.floor((i-gd)/2.5)+1:0}const Sc={idle:.018,walk:.028,sprint:.06};class vd{constructor(t={}){const e=(n,s,r)=>Number.isFinite(n)?Math.max(0,Math.min(r,n)):s;this.hp=e(t.hp,pr,pr),this.food=e(t.food,yo,yo),this.air=e(t.air,ja,ja),this.hp<=0&&(this.hp=pr),this.regenT=0,this.starveT=0,this.drownT=0,this.magmaT=0,this.cause=""}hurt(t,e){return t<=0||this.hp<=0?!1:(this.hp=Math.max(0,this.hp-t),this.cause=e,this.hp<=0)}eat(t){return this.food>=yo?!1:(this.food=Math.min(yo,this.food+t),!0)}tick(t,e){const n=this.hp;return this.food=Math.max(0,this.food-t*(e.sprint&&e.moving?Sc.sprint:e.moving?Sc.walk:Sc.idle)),this.food>=16&&this.hp<pr?(this.regenT+=t,this.regenT>=3&&(this.regenT=0,this.hp=Math.min(pr,this.hp+1),this.food=Math.max(0,this.food-.6))):this.regenT=0,this.food<=0&&this.hp>1?(this.starveT+=t,this.starveT>=4&&(this.starveT=0,this.hurt(1,"Hunger"))):this.starveT=0,e.eyeWater?(this.air=Math.max(0,this.air-t),this.air<=0&&(this.drownT+=t,this.drownT>=1&&(this.drownT=0,this.hurt(2,"Ertrunken")))):(this.air=Math.min(ja,this.air+t*4),this.drownT=0),e.onMagma?(this.magmaT+=t,this.magmaT>=1&&(this.magmaT=0,this.hurt(1,"Magma"))):this.magmaT=.6,n-this.hp>0?n-this.hp:0}get dead(){return this.hp<=0}toJSON(){return{hp:Math.round(this.hp*10)/10,food:Math.round(this.food*10)/10,air:Math.round(this.air*10)/10}}}const zo=[{key:"huhn",name:"Huhn",hp:3,half:.25,h:.8,speed:1.5,drops:[[q.MEAT_RAW,1,1]]},{key:"schaf",name:"Schaf",hp:5,half:.42,h:1.2,speed:1.2,drops:[[q.MEAT_RAW,1,2],[d.WOOL,1,2]]},{key:"kuh",name:"Kuh",hp:6,half:.45,h:1.4,speed:1.1,drops:[[q.MEAT_RAW,2,3]]},{key:"rauschling",name:"Rauschling",hp:8,half:.3,h:1.7,speed:2.4,hostile:!0,dmg:2,drops:[[d.CRYSTAL,0,1]]},{key:"hoehlenwesen",name:"Höhlenwesen",hp:12,half:.45,h:.9,speed:1.9,hostile:!0,dmg:3,drops:[[d.COAL,1,2],[d.IRON,0,1]]},{key:"drohne",name:"Störsender-Drohne",hp:6,half:.35,h:.6,speed:3,hostile:!0,fly:!0,range:7,dmg:2,drops:[[q.COPPER_INGOT,0,1],[d.CRYSTAL,0,1]]},{key:"dorfbewohner",name:"Dorfbewohner",hp:20,half:.3,h:1.8,speed:1.5,npc:!0,drops:[]}],xd=3,_d=3,U2=4,Md=5,z2=6;function Sd(i){return i<.03||i>=.5?"home":i<.22||i>=.32&&i<.47?"work":"plaza"}const F2=4,B2=18;function H2(i,t,e,n,s,r,o){const a=Math.hypot(s-t,r-e,o-n),l=Math.ceil(a/.4);for(let c=1;c<l;c++){const h=c/l;if(i.isSolid(Math.floor(t+(s-t)*h),Math.floor(e+(r-e)*h),Math.floor(n+(o-n)*h)))return!1}return!0}const ho=3,yd=40,V2=24,W2=new Set([d.GRASS,d.FLOWERS,d.SNOW,d.MYCEL]),uo=(i,t)=>(i+32768)*65536+(t+32768);let G2=1;class yc{constructor(t,e,n,s,r){const o=zo[t];this.id=G2++,this.target=0,this.type=t,this.T=o,this.x=e,this.y=n,this.z=s,this.hp=r??o.hp,this.vx=0,this.vy=0,this.vz=0,this.yaw=0,this.onGround=!1,this.walk=0,this.timer=0,this.flee=0,this.hurtT=0,this.acc=0,this.moving=!1,this.hostile=!!o.hostile,this.sees=!1,this.seeT=0,this.atkT=0,this.attack=!1,this.npc=!!o.npc,this.path=null,this.stuck=0,this.phase=null}warp(t,e,n){const s=Math.floor(this.y),r=o=>o>1&&o<ie-2&&Io[t.getBlock(Math.floor(e),o-1,Math.floor(n))]&&!this.collides(t,e,o,n);for(let o=0;o<=8;o++)for(const a of[s-o,s+o])if(r(a))return this.x=e,this.y=a,this.z=n,this.vy=0,!0;return!1}collides(t,e,n,s){const r=this.T.half,o=Math.floor(e-r),a=Math.floor(e+r-1e-7),l=Math.floor(s-r),c=Math.floor(s+r-1e-7),h=Math.floor(n),f=Math.floor(n+this.T.h-1e-7);for(let u=h;u<=f;u++)for(let p=l;p<=c;p++)for(let x=o;x<=a;x++)if(t.isSolid(x,u,p))return!0;return!1}move(t,e,n){if(!n)return!1;const s=this[e];return this[e]+=n,this.collides(t,this.x,this.y,this.z)?(this[e]=s,e==="y"&&(n<0&&(this.onGround=!0),this.vy=0),!0):!1}update(t,e,n,s,r,o=this.y){if(!t.isLoaded(Math.floor(this.x),Math.floor(this.z)))return;const a=this.T;if(this.hurtT=Math.max(0,this.hurtT-e),this.timer-=e,this.hostile){this.atkT-=e,this.seeT-=e;const m=Math.hypot(s-this.x,r-this.z);this.seeT<=0&&(this.seeT=.5,this.sees=m<B2&&H2(t,this.x,this.y+1.5,this.z,s,o+1.6,r)),this.sees&&m>.8&&(this.walk=1,this.yaw=Math.atan2(-(s-this.x),-(r-this.z)),this.timer=.5),a.range?(this.sees&&m<4&&(this.walk=0),this.sees&&Math.hypot(m,o+1-this.y)<a.range&&this.atkT<=0&&(this.atkT=2,this.attack=!0)):this.sees&&m<1.5&&Math.abs(o-this.y)<1.8&&this.atkT<=0&&(this.atkT=1,this.attack=!0)}if(this.npc&&this.path&&this.path.length){const m=this.path[0],g=Math.hypot(m.x-this.x,m.z-this.z);g<.6?(this.path.shift(),this.walk=0,this.stuck=0,this.bestD=1/0,this.timer=1+n()*2):(this.walk=1,this.yaw=Math.atan2(-(m.x-this.x),-(m.z-this.z)),this.timer=.3,g<(this.bestD??1/0)-.3?(this.bestD=g,this.stuck=0):(this.stuck+=e)>5&&(this.path.shift(),this.warp(t,m.x,m.z),this.stuck=0,this.bestD=1/0))}this.hostile&&this.sees||this.npc&&this.path&&this.path.length||(this.npc?this.timer<=0&&(this.walk=0,this.yaw+=(n()-.5)*1.5,this.timer=2+n()*3):this.flee>0?(this.flee-=e,this.walk=1,this.yaw=Math.atan2(-(this.x-s),-(this.z-r))):this.timer<=0&&(n()<.55?(this.walk=1,this.yaw=n()*Math.PI*2,this.timer=1+n()*3):(this.walk=0,this.timer=2+n()*4)));const l=Math.floor(this.x),c=Math.floor(this.z),h=t.getBlock(l,Math.floor(this.y+.3),c)===d.WATER;let f=this.walk?a.speed*(this.flee>0?2.2:1):0,u=-Math.sin(this.yaw),p=-Math.cos(this.yaw);if(f&&this.onGround&&!this.sees&&!a.fly){const m=Math.floor(this.x+u*(a.half+.6)),g=Math.floor(this.z+p*(a.half+.6));let _=0;for(let M=Math.floor(this.y)-1;_<4&&M>0&&!Io[t.getBlock(m,M,g)];M--)if(_++,t.getBlock(m,M,g)===d.WATER&&!this.flee){_=9;break}_>3&&(this.yaw+=Math.PI*(.5+n()),this.timer=.5+n(),u=-u,p=-p,f*=.3)}if(this.hostile&&this.sees&&Math.hypot(s-this.x,r-this.z)<.9&&(f=0),this.vx=u*f,this.vz=p*f,a.fly){const m=this.sees?o+2.5:this.y+Math.sin(this.timer*3)*.3;this.vy=Math.max(-3,Math.min(3,(m-this.y)*2))}else h?this.vy=Math.min(2,this.vy+20*e):this.vy=Math.max(-40,this.vy-28*e);const x=this.move(t,"x",this.vx*e),v=this.move(t,"z",this.vz*e);this.onGround=!1,this.move(t,"y",this.vy*e),(x||v)&&f&&!a.fly&&(this.onGround&&!this.collides(t,this.x,this.y+1.05,this.z)?this.vy=7.2:this.npc&&this.path&&this.path.length||this.onGround&&(this.yaw+=Math.PI*(.5+n()),this.timer=.5)),this.y<-10&&(this.y=ie),this.moving=f>0&&Math.abs(this.vx)+Math.abs(this.vz)>.1}hit(t,e,n){if(this.npc)return!1;this.hp-=t,this.hurtT=.35,this.hostile||(this.flee=3.5);const s=Math.hypot(this.x-e,this.z-n)||1;return this.x+=(this.x-e)/s*.15,this.z+=(this.z-n)/s*.15,this.vy=4.5,this.hp<=0}record(){return[this.type,+this.x.toFixed(2),+this.y.toFixed(2),+this.z.toFixed(2),this.hp]}}function K2(i,t,e,n,s,r,o,a,l,c,h,f){let u=0,p=1/0;const x=[i,t,e],v=[n,s,r],m=[o,a,l],g=[c,h,f];for(let _=0;_<3;_++){if(Math.abs(v[_])<1e-9){if(x[_]<m[_]||x[_]>g[_])return 1/0;continue}let M=(m[_]-x[_])/v[_],S=(g[_]-x[_])/v[_];if(M>S){const C=M;M=S,S=C}if(u=Math.max(u,M),p=Math.min(p,S),u>p)return 1/0}return u}class X2{constructor(t,e,n,s=!0){if(this.world=t,this.seed=e|0,this.enabled=s,this.store=new Map,n&&typeof n=="object")for(const r of Object.keys(n)){const o=n[r],a=Number(r);!Array.isArray(o)||!Number.isFinite(a)||this.store.set(a,o.filter(l=>Array.isArray(l)&&Number.isInteger(l[0])&&l[0]>=0&&l[0]<xd&&l.slice(1,5).every(Number.isFinite)))}this.list=[],this.active=new Set,this.lastPC=null,this.rnd=Math.random,this.onAdd=()=>{},this.onRemove=()=>{},this.onAttack=()=>{},this.onPoof=()=>{},this.day=!0,this.spawnT=3,this.villages=new Map,this.findVillages=null,this.time=.2}spawnRecords(t,e){const n=this.seed+9001;if(Bt(t,e,n)>.2)return null;const s=this.world.getChunk(t,e);if(!s)return null;const r=Math.floor(Bt(t,e,n+1)*xd),o=2+Math.floor(Bt(t,e,n+2)*3),a=[];for(let l=0;l<o*3&&a.length<o;l++){const c=Math.floor(Bt(t*31+l,e,n+3)*I),h=Math.floor(Bt(t,e*31+l,n+4)*I),f=c+h*I;let u=Math.min(ie-3,s.maxY+1);for(;u>0&&s.data[f+u*256]===d.AIR;)u--;const p=s.data[f+u*256];!W2.has(p)||u<te||s.data[f+(u+1)*256]!==d.AIR||s.data[f+(u+2)*256]!==d.AIR||a.push([r,t*I+c+.5,u+1,e*I+h+.5,zo[r].hp])}return a.length?a:null}activate(t,e,n){this.active.add(t);let s=this.store.get(t);if(s?this.store.delete(t):s=this.spawnRecords(e,n),!!s){if(!s.length){this.store.set(t,s);return}for(const r of s){if(this.list.length>=yd){this.stash(r);continue}const o=new yc(r[0],r[1],r[2],r[3],r[4]);o.yaw=Bt(Math.floor(r[1]),Math.floor(r[3]),5)*6.28,this.list.push(o),this.onAdd(o)}}}stash(t){const e=uo(Math.floor(t[1]/I),Math.floor(t[3]/I));let n=this.store.get(e);n||this.store.set(e,n=[]),n.push(t)}remove(t,e){const n=this.list.indexOf(t);if(!(n<0)&&(this.list.splice(n,1),this.onRemove(t),!(t.hostile||t.npc)))if(e)this.stash(t.record());else{const s=uo(Math.floor(t.x/I),Math.floor(t.z/I));!this.store.has(s)&&!this.active.has(s)&&this.store.set(s,[])}}hostile(t){return t.hostile}hostileCount(){let t=0;for(const e of this.list)e.hostile&&t++;return t}spawnHostile(t,e,n,s,r=this.rnd){if(this.hostileCount()>=F2||this.list.length>=yd)return null;for(let o=0;o<6;o++){const a=r()*Math.PI*2,l=14+r()*12,c=Math.floor(t+Math.cos(a)*l),h=Math.floor(n+Math.sin(a)*l),f=this.world.getChunk(c>>4,h>>4);if(!f)continue;const u=this.world.heightmap(f)[(c&15)+(h&15)*I];for(let p=Math.min(ie-3,Math.floor(e)+8);p>Math.max(1,Math.floor(e)-10);p--){if(!Io[this.world.getBlock(c,p-1,h)]||this.world.getBlock(c,p-1,h)===d.WATER||this.world.getBlock(c,p,h)!==d.AIR||this.world.getBlock(c,p+1,h)!==d.AIR)continue;const x=p>=u,v=!x&&p<te-4;if(x&&s||v){for(const{v:_}of this.villages.values())if(Math.hypot(_.x-c,_.z-h)<30)return null;const m=v?r()<.5?U2:_d:r()<.3?Md:_d,g=new yc(m,c+.5,m===Md?p+3:p,h+.5);return g.yaw=r()*6.28,this.list.push(g),this.onAdd(g),g}break}}return null}refresh(t,e){if(!this.enabled)return;const n=Math.floor(t/I),s=Math.floor(e/I);for(let r=-ho;r<=ho;r++)for(let o=-ho;o<=ho;o++){const a=n+o,l=s+r,c=uo(a,l);this.active.has(c)||!this.world.getChunk(a,l)||this.activate(c,a,l)}for(const r of this.active){const o=Math.floor(r/65536)-32768,a=r%65536-32768;Math.max(Math.abs(o-n),Math.abs(a-s))<=ho+1||this.active.delete(r)}for(const r of this.list.slice()){const o=uo(Math.floor(r.x/I),Math.floor(r.z/I));if(r.hostile){const a=Math.hypot(r.x-t,r.z-e)>40,l=this.world.getChunk(Math.floor(r.x)>>4,Math.floor(r.z)>>4),c=l&&Math.floor(r.y)>=this.world.heightmap(l)[(Math.floor(r.x)&15)+(Math.floor(r.z)&15)*I];(a||this.day&&c)&&(this.onPoof(r),this.remove(r,!1))}else!r.npc&&!this.active.has(o)&&this.remove(r,!0)}this.refreshVillages(t,e)}refreshVillages(t,e){for(const[n,s]of this.villages)if(!(Math.hypot(s.v.x-t,s.v.z-e)<112)){for(const r of s.list)this.remove(r,!1);this.villages.delete(n)}if(this.findVillages)for(const n of this.findVillages(t,e))this.villages.has(n.id)||Math.hypot(n.x-t,n.z-e)>96||!this.world.getChunk(n.x>>4,n.z>>4)||this.villages.set(n.id,{v:n,list:this.spawnVillagers(n)})}spawnVillagers(t){const e=[];return t.houses.forEach((n,s)=>{const r=new yc(z2,n.x+.5,t.y+1,n.z+.5);r.name=n.role.name,r.role=n.role.key,r.vid=t.id,r.home={x:n.x+.5,z:n.z+.5},r.front={x:n.front.x+.5,z:n.front.z+.5},r.work=UM(t,n),r.plaza={x:t.x+.5+(s&1?2.2:-2.2),z:t.z+.5+(s<2?-2.2:2.2)};const o=Sd(this.time),a=o==="home"?r.home:o==="work"?r.work:r.plaza;r.phase=o,r.warp(this.world,a.x,a.z),this.list.push(r),this.onAdd(r),e.push(r)}),e}route(t,e){const n=Math.abs(t.x-t.home.x)<2.6&&Math.abs(t.z-t.home.z)<2.6;if(e==="home")return n?[t.home]:[t.front,t.home];const s=e==="work"?t.work:t.plaza;return n?[t.front,s]:[s]}update(t,e,n,s={}){if(!this.enabled)return;const r=s.py??0;this.day=!s.night,this.time=s.time??.2;const o=Sd(this.time);if(s.hostiles)this.spawnT-=t,this.spawnT<=0&&(this.spawnT=3,this.spawnHostile(e,r,n,!!s.night));else if(this.hostileCount())for(const c of this.list.slice())c.hostile&&this.remove(c,!1);const a=Math.floor(e/I),l=Math.floor(n/I);(!this.lastPC||this.lastPC[0]!==a||this.lastPC[1]!==l||(this.refreshT=(this.refreshT||0)-t)<=0)&&(this.lastPC=[a,l],this.refreshT=1,this.refresh(e,n));for(const c of this.list){c.npc&&c.phase!==o&&(c.phase=o,c.path=this.route(c,o),c.bestD=1/0,c.stuck=0);const h=Math.hypot(c.x-e,c.z-n);if(c.hostile){let f=e,u=r,p=n,x=h;if(c.target=0,s.others)for(const v of s.others){const m=Math.hypot(c.x-v.x,c.z-v.z);m<x&&(x=m,f=v.x,u=v.y,p=v.z,c.target=v.id)}c.update(this.world,t,this.rnd,f,p,u)}else h<V2||c.flee>0?c.update(this.world,t,this.rnd,e,n,r):(c.acc+=t,c.acc>=.25&&(c.update(this.world,Math.min(c.acc,.25),this.rnd,e,n,r),c.acc=0));c.attack&&(c.attack=!1,this.onAttack(c))}}raycast(t,e,n,s,r,o,a){let l=null,c=a;for(const h of this.list){const f=h.T.half,u=K2(t,e,n,s,r,o,h.x-f,h.y,h.z-f,h.x+f,h.y+h.T.h,h.z+f);u<c&&(c=u,l=h)}return l?{mob:l,t:c}:null}serialize(){const t={};for(const[e,n]of this.store)t[e]=n.slice();for(const e of this.active)t[e]||(t[e]=[]);for(const e of this.list){if(e.hostile||e.npc)continue;const n=uo(Math.floor(e.x/I),Math.floor(e.z/I));(t[n]||(t[n]=[])).push(e.record())}for(const e of this.active){if(t[e].length)continue;const n=Math.floor(e/65536)-32768,s=e%65536-32768;Bt(n,s,this.seed+9001)>.2&&delete t[e]}return t}clear(){for(const t of this.list)this.onRemove(t);this.list=[],this.active.clear(),this.villages.clear()}}function e0(i,t=Math.random){return zo[i].drops.map(([e,n,s])=>[e,n+Math.floor(t()*(s-n+1))]).filter(([,e])=>e>0)}const Un=.3,ka=1.8,Ec=1.62,fo=.001;class $2{constructor(){this.x=0,this.y=0,this.z=0,this.vx=0,this.vy=0,this.vz=0,this.onGround=!1,this.inWater=!1,this.flying=!1,this.coyote=0,this.fallT=0,this.gliding=!1,this.hook=!1,this.lifted=!1,this.bounces=0,this.eyeWater=!1,this.impact=0}collides(t,e,n,s){const r=Math.floor(e-Un),o=Math.floor(e+Un-1e-7),a=Math.floor(s-Un),l=Math.floor(s+Un-1e-7),c=Math.floor(n),h=Math.floor(n+ka-1e-7);this.shaped=!1;for(let f=c;f<=h;f++)for(let u=a;u<=l;u++)for(let p=r;p<=o;p++){if(!t.isSolid(p,f,u))continue;const x=t.getBlock(p,f,u);if(!Ln[x])return!0;if(QS(x,(v,m,g)=>t.getBlock(v,m,g),p,f,u,e-Un,n,s-Un,e+Un,n+ka,s+Un))return this.shaped=!0,!0}return!1}move(t,e,n){for(;n!==0;){const s=Math.abs(n)>.2?Math.sign(n)*.2:n;if(n-=s,this[e]+=s,this.collides(t,this.x,this.y,this.z)){if(this.shaped){this.moveShaped(t,e,s);return}e==="y"?this.y=s>0?Math.floor(this.y+ka)-ka-fo:Math.floor(this.y)+1+fo:this[e]=s>0?Math.floor(this[e]+Un)-Un-fo:Math.floor(this[e]-Un)+1+Un+fo,this["v"+e]=0,e==="y"&&s<0&&(this.onGround=!0);return}}}moveShaped(t,e,n){if(e!=="y"&&this.onGround){const o=this.y;for(const a of[.25,.5+.001])if(!this.collides(t,this.x,o+a,this.z)){let l=o,c=o+a;for(let h=0;h<10;h++){const f=(l+c)/2;this.collides(t,this.x,f,this.z)?l=f:c=f}this.y=c+fo;return}}this[e]-=n;let s=0,r=1;for(let o=0;o<10;o++){const a=(s+r)/2;this[e]+=n*a;const l=this.collides(t,this.x,this.y,this.z);this[e]-=n*a,l?r=a:s=a}this[e]+=n*s,this["v"+e]=0,e==="y"&&n<0&&(this.onGround=!0)}onLadder(t){const e=Math.floor(this.x),n=Math.floor(this.z);return t.getBlock(e,Math.floor(this.y+.1),n)===d.LADDER||t.getBlock(e,Math.floor(this.y+1),n)===d.LADDER}update(t,e,n,s){if(t.isLoaded&&!t.isLoaded(Math.floor(this.x),Math.floor(this.z))){this.vx=this.vy=this.vz=0,this.waiting=!0;return}this.waiting=!1;for(let a=0;a<12&&this.collides(t,this.x,this.y,this.z);a++)this.y+=1;const r=Math.max(1,Math.ceil(e*120-1e-9)),o=e/r;for(let a=0;a<r;a++)this.step(t,o,n,s)}step(t,e,n,s){const r=Math.sin(s),o=Math.cos(s);let a=-n.f*r+n.r*o,l=-n.f*o-n.r*r;const c=Math.hypot(a,l);c>1&&(a/=c,l/=c);const h=Math.floor(this.x),f=Math.floor(this.z);this.inWater=t.getBlock(h,Math.floor(this.y+.4),f)===d.WATER;const u=this.eyeWater=t.getBlock(h,Math.floor(this.y+1.5),f)===d.WATER,p=this.onGround?t.getBlock(h,Math.floor(this.y-.05),f):d.AIR;if(this.lifted=!1,!this.flying)for(let m=0,g=Math.floor(this.y-.1);m<=11;m++,g--){const _=t.getBlock(h,g,f);if(_===d.WIND){this.lifted=!0;break}if(_!==d.AIR&&_!==d.WATER)break}const x=!this.onGround&&!this.inWater&&!this.flying;if(this.fallT=x&&this.vy<0?this.fallT+e:0,this.gliding=x&&n.jump&&this.fallT>.45&&!this.lifted&&!this.hook,!this.hook){let m;this.flying?m=n.sprint?16:10.5:this.gliding?(m=9.5,c<.1&&(a=-r,l=-o)):this.inWater?m=2.8:m=n.sprint?5.9:4.3,p===d.TURBO&&(m*=2.4);const g=Math.min(1,(this.flying?8:this.onGround?14:this.inWater?5:this.gliding?2.5:4)*e);if(this.vx+=(a*m-this.vx)*g,this.vz+=(l*m-this.vz)*g,this.flying){const _=((n.jump?1:0)-(n.down?1:0))*(n.sprint?12:8);this.vy+=(_-this.vy)*Math.min(1,8*e)}else this.inWater?(this.vy-=9*e,n.jump&&(u?this.vy+=24*e:this.vy=Math.max(this.vy,6.5)),this.vy-=this.vy*Math.min(1,3*e),this.vy=Math.max(-4,Math.min(this.vy,4))):this.onLadder(t)?(this.vy=n.jump||n.f>.3?3.4:n.sprint&&!n.f?0:Math.max(this.vy-28*e,-2.2),this.fallT=0):(this.vy=Math.max(-55,this.vy-28*e),this.gliding&&(this.vy=Math.max(this.vy,-2.2)),this.lifted&&(this.vy=Math.min(7.5,this.vy+60*e)),n.jump&&(this.onGround||this.coyote>0)&&(this.vy=p===d.FEDER?15:8.8,this.onGround=!1,this.coyote=0))}const v=this.vy;this.move(t,"x",this.vx*e),this.move(t,"z",this.vz*e),this.onGround=!1,this.move(t,"y",this.vy*e),this.onGround&&v<-2&&t.getBlock(h,Math.floor(this.y-.05),f)===d.FEDER?(this.vy=Math.min(26,Math.max(10,-v*.92)),this.onGround=!1,this.bounces++):this.onGround&&v<0&&!this.hook&&!this.flying&&(this.impact=Math.max(this.impact,-v)),this.coyote=this.onGround?.1:this.coyote-e}}function Ed(i,t,e,n,s,r,o,a){let l=Math.floor(t),c=Math.floor(e),h=Math.floor(n);const f=s>0?1:-1,u=r>0?1:-1,p=o>0?1:-1,x=s!==0?Math.abs(1/s):1/0,v=r!==0?Math.abs(1/r):1/0,m=o!==0?Math.abs(1/o):1/0;let g=s!==0?(s>0?l+1-t:t-l)*x:1/0,_=r!==0?(r>0?c+1-e:e-c)*v:1/0,M=o!==0?(o>0?h+1-n:n-h)*m:1/0;for(;;){let S=0,C=0,y=0,w;if(g<=_&&g<=M?(w=g,g+=x,l+=f,S=-f):_<=M?(w=_,_+=v,c+=u,C=-u):(w=M,M+=m,h+=p,y=-p),w>a)return null;const L=i.getBlock(l,c,h);if(L!==d.AIR&&L!==d.WATER)return{x:l,y:c,z:h,nx:S,ny:C,nz:y,type:L,t:w}}}let Xt=null,is=null;const mn={enabled:!0,vol:.8,music:.8,amb:.7};function os(){try{Xt||(Xt=new(window.AudioContext||window.webkitAudioContext)),Xt.state==="suspended"&&Xt.resume()}catch{Xt=null}}const n0=i=>!!Xt&&mn.enabled&&Xt.state==="running"&&i>.001;function un(i,t,e,n="lowpass",s=!1){if(e*=s?mn.amb:mn.vol,!n0(e))return;if(!is){is=Xt.createBuffer(1,Math.floor(Xt.sampleRate*.25),Xt.sampleRate);const c=is.getChannelData(0);for(let h=0;h<c.length;h++)c[h]=Math.random()*2-1}const r=Xt.createBufferSource(),o=Xt.createBiquadFilter(),a=Xt.createGain(),l=Xt.currentTime;r.buffer=is,o.type=n,o.frequency.value=i,a.gain.setValueAtTime(e,l),a.gain.exponentialRampToValueAtTime(.001,l+t),r.connect(o),o.connect(a),a.connect(Xt.destination),r.start(l),r.stop(l+t+.02)}const Ch={fn:null},qo=i=>{Ch.fn&&Ch.fn(i)},bc=()=>{qo("break"),un(1100,.14,.5)},xn=()=>{qo("place"),un(600,.09,.4)},Cn=()=>{qo("deny"),un(220,.1,.3)};function tn(i,t,e,n,s,r,o=0,a=0){if(s*=r?mn.amb:mn.vol,!n0(s))return;const l=Xt.currentTime+a,c=Xt.createOscillator(),h=Xt.createGain();if(c.type=i,c.frequency.setValueAtTime(t,l),c.frequency.exponentialRampToValueAtTime(Math.max(20,e),l+n),o){const f=Xt.createOscillator(),u=Xt.createGain();f.frequency.value=o,u.gain.value=t*.04,f.connect(u),u.connect(c.frequency),f.start(l),f.stop(l+n+.02)}h.gain.setValueAtTime(1e-4,l),h.gain.exponentialRampToValueAtTime(s,l+Math.min(.04,n/4)),h.gain.exponentialRampToValueAtTime(.001,l+n),c.connect(h),h.connect(Xt.destination),c.start(l),c.stop(l+n+.02)}const bd={weich:()=>un(380,.08,.22,"lowpass",!0),stein:()=>{un(2400,.05,.16,"bandpass",!0),un(500,.04,.12,"lowpass",!0)},holz:()=>{tn("triangle",190,120,.07,.16,!0),un(900,.04,.08,"bandpass",!0)},sand:()=>un(3200,.11,.12,"highpass",!0),schnee:()=>{un(1600,.12,.16,"bandpass",!0),un(300,.08,.1,"lowpass",!0)},glas:()=>tn("sine",2200,1900,.06,.07,!0)},q2=i=>(bd[i]||bd.weich)(),Td=i=>{un(1400,i?.45:.18,i?.35:.14,"bandpass",!0),i&&un(400,.3,.2,"lowpass",!0)},Ad={huhn:i=>{tn("square",1200,1500,.06,i*.08,!0),tn("square",1300,1e3,.07,i*.08,!0,0,.09)},schaf:i=>tn("sawtooth",330,300,.5,i*.1,!0,7),kuh:i=>tn("sawtooth",140,105,.9,i*.16,!0,3),rauschling:i=>{un(5e3,.5,i*.18,"bandpass",!0),tn("sawtooth",90,70,.4,i*.08,!0,11)},hoehlenwesen:i=>tn("square",70,50,.35,i*.14,!0,18),drohne:i=>tn("sawtooth",210,230,.6,i*.06,!0,30),dorfbewohner:i=>{tn("triangle",240,300,.12,i*.12,!0),tn("triangle",280,220,.15,i*.12,!0,0,.14)}};function Y2(i,t){const e=Math.max(0,1-t/20);e>0&&Ad[i]&&Ad[i](e)}const Tc=()=>tn("square",1800,900,.04,.12,!1),j2=()=>{un(700,.25,.3,"bandpass"),tn("square",160,110,.18,.1,!1)},Z2=()=>tn("sine",880,880,.12,.12,!1),J2=()=>qo("done")||[0,4,7,12].forEach((i,t)=>tn("triangle",523*Math.pow(2,i/12),523*Math.pow(2,i/12),.22,.14,!1,0,t*.11)),Ac=()=>{qo("hurt"),tn("sawtooth",300,120,.18,.16,!1),un(800,.1,.2)},_e={on:!1,timer:0,next:0,step:0,master:null,seed:0},Q2=[[0,3,5,7,10],[0,2,4,7,9],[0,2,3,7,8]],wd=i=>440*Math.pow(2,(i-69)/12);function Rd(i,t,e,n,s,r){const o=Xt.createOscillator(),a=Xt.createGain();o.type=i,o.frequency.setValueAtTime(t,e),a.gain.setValueAtTime(s,e),a.gain.exponentialRampToValueAtTime(.001,e+n);let l=o;if(r){const c=Xt.createBiquadFilter();c.type="lowpass",c.frequency.value=r,o.connect(c),l=c}l.connect(a),a.connect(_e.master),o.start(e),o.stop(e+n+.02)}function Cd(i,t,e,n,s){if(!is){is=Xt.createBuffer(1,Math.floor(Xt.sampleRate*.25),Xt.sampleRate);const l=is.getChannelData(0);for(let c=0;c<l.length;c++)l[c]=Math.random()*2-1}const r=Xt.createBufferSource(),o=Xt.createBiquadFilter(),a=Xt.createGain();r.buffer=is,o.type=n,o.frequency.value=s,a.gain.setValueAtTime(e,i),a.gain.exponentialRampToValueAtTime(.001,i+t),r.connect(o),o.connect(a),a.connect(_e.master),r.start(i),r.stop(i+t+.02)}function ty(i,t){const e=Q2[_e.seed%3],n=45+(_e.seed>>2)%5,s=i%16,r=Math.floor(i/16)%4;if(s%4===0){const a=Xt.createOscillator(),l=Xt.createGain();a.frequency.setValueAtTime(150,t),a.frequency.exponentialRampToValueAtTime(42,t+.14),l.gain.setValueAtTime(.9,t),l.gain.exponentialRampToValueAtTime(.001,t+.2),a.connect(l),l.connect(_e.master),a.start(t),a.stop(t+.22)}(s===4||s===12)&&Cd(t,.12,.35,"bandpass",1800),s%2===0&&Cd(t,.04,s%4===2?.22:.1,"highpass",7e3),(s%4===2||s===7||s===15)&&Rd("sawtooth",wd(n+e[(r+(s>>2))%5]-12),t,.2,.2,500);const o=(i*3+_e.seed+r*2)%5;(s%2===1||s%4===0)&&Rd("triangle",wd(n+24+e[o]+(s>8?12:0)),t,.16,.12,3e3)}function ey(){if(!Xt||Xt.state!=="running")return;const i=118+_e.seed%3*6,t=60/i/4;for(_e.next<Xt.currentTime&&(_e.next=Xt.currentTime+.05);_e.next<Xt.currentTime+.25;)ty(_e.step++,_e.next),_e.next+=t}function Ld(i,t){if(i*=mn.music,!Xt||!mn.enabled||i<=.01){_e.on&&(_e.on=!1,clearInterval(_e.timer),_e.master&&_e.master.gain.setTargetAtTime(0,Xt.currentTime,.1));return}_e.master||(_e.master=Xt.createGain(),_e.master.gain.value=0,_e.master.connect(Xt.destination)),_e.on||(_e.on=!0,_e.seed=t,_e.next=0,_e.timer=setInterval(ey,80)),_e.master.gain.setTargetAtTime(Math.min(1,i)*.45,Xt.currentTime,.15)}const ny=[d.NEON_R,d.NEON_B,d.NEON_G,d.NEON_P],i0=[{t:"Holz sammeln",d:"Die Funkzentrale will wieder auf Sendung. Dafür braucht sie Material. Schlage 5 Holzblöcke an Bäumen ab.",k:"break",a:[d.WOOD],n:5,r:{[d.PLANKS]:4}},{t:"Bretter herstellen",d:"Öffne das Inventar (E oder 🎒) und stelle unter „Herstellen“ Bretter aus Holz her. Du brauchst 8 Bretter.",k:"craft",a:[d.PLANKS],n:8,r:{[d.DIRT]:10}},{t:"Fundament legen",d:"Setze 12 Bretter als Fundament für die Sendehütte.",k:"place",a:[d.PLANKS],n:12,r:{[d.STONE]:4}},{t:"Steinbruch",d:"Grabe nach Stein, unter Erde und in Hügeln. Sammle 12 Steinblöcke im Vorrat.",k:"have",a:[d.STONE],n:12,r:{[d.SAND]:4}},{t:"Strand und Glas",d:"Sand findest du am Wasser. Stelle 4 Glas her (2 Sand ergeben 1 Glas).",k:"craft",a:[d.GLASS],n:4,r:{[d.WOOD]:2,[d.GLASS]:2}},{t:"Leuchtfeuer",d:"Stelle 2 Leuchtblöcke her (Glas und Holz).",k:"craft",a:[d.LAMP],n:2,r:{[d.LEAVES]:4,[d.PLANKS]:2}},{t:"Licht an",d:"Setze beide Leuchtblöcke, damit die Hütte auch nachts zu sehen ist.",k:"place",a:[d.LAMP],n:2,r:{[d.LAMP]:2}},{t:"Hoch hinaus",d:"Der Funkmast muss hoch stehen. Erreiche eine Höhe von 14 Blöcken über dem Startpunkt, zum Beispiel mit einem Turm aus Blöcken.",k:"height",n:14,r:{[d.PLANKS]:6,[d.LEAVES]:4}},{t:"Der Funkmast",d:"Stelle einen Radio-Block her (4 Bretter und 1 Leuchtblock) und setze ihn. Hör zu, wie er spielt.",k:"place",a:[d.RADIO],n:1,r:{[d.PLANKS]:4,[d.LEAVES]:4}},{t:"Federn für die Landung",d:"Stelle 2 Federblöcke her (Blätter und Bretter).",k:"craft",a:[d.FEDER],n:2,r:{[d.STONE]:4}},{t:"Sprungtraining",d:"Setze einen Federblock und springe 3-mal darauf zurück in die Luft. Aufprall genügt, die Feder wirft dich hoch.",k:"bounce",n:3,r:{[d.LAMP]:1}},{t:"Seilhaken",d:"Ziele auf einen entfernten Block und benutze den Seilhaken (Q oder Taste Haken) 2-mal.",k:"hook",n:2,r:{[d.LEAVES]:4}},{t:"Gleitflug",d:"Springe von deinem Turm und halte im Fall die Sprungtaste gedrückt. Gleite insgesamt 5 Sekunden.",k:"glide",n:5,r:{[d.LAMP]:4,[d.SAND]:4}},{t:"Neon-Show",d:"Stelle Neonblöcke her (Leuchtblock mit Sand, Glas, Blättern oder Erde) und setze 4 davon.",k:"place",a:ny,n:4,r:{[d.GLASS]:2,[d.LAMP]:1}},{t:"Regenbogen-Finale",d:"Setze als Krönung einen Regenbogen-Block (2 Glas und 1 Leuchtblock) auf deinen Sendeturm.",k:"place",a:[d.RAINBOW],n:1,r:{[d.RAINBOW]:2}}],iy=5,sy=4,ry=[d.PLANKS,d.STONE,d.COBBLE,d.DIRT,d.WOOD,d.SPRUCE,d.BRICK,d.SANDSTONE,d.GLASS,d.MARBLE],Fo=[null,{t:"Das erste Signal",d:"Ein gewaltiges Funknetz verband einst alle Regionen. Dann kam das große Rauschen, und die Stationen verstummten. Du stehst allein in der Wildnis. Irgendwo knistert ein Signal."},{t:"Der vergessene Sender",d:"Aus deinem Radio dringt eine Stimme: „…Dorf … der Mast … hört uns jemand?“ Der Wegpunkt zeigt dir den Weg."},{t:"Stimmen aus der Tiefe",d:"Funkerin Lotte: „Der Mast braucht Funkkristalle. Sie wachsen tief unten, wo das Rauschen am lautesten ist.“"},{t:"Die zerbrochene Verbindung",d:"Aus Kupfer und Kristallen entsteht ein Funksender. Relais tragen das Signal weiter, Empfänger fangen es auf."},{t:"Das Herz des Rauschens",d:"Das Rauschen wird stärker. Drohnen stören die Leitungen, und in der Tiefe regt sich etwas."},{t:"Die letzte Frequenz",d:"Lotte: „Ein hoher Turm, drei Empfänger, und das Signal geht wieder um die ganze Welt.“"}],s0=[{c:1,t:"Holz sammeln",d:"Schlage 6 Holzblöcke an Bäumen ab. Im Überleben dauert das etwas, mit einer Axt geht es schneller.",k:"break",a:[d.WOOD,d.SPRUCE],n:6,r:{[d.PLANKS]:4}},{c:1,t:"Werkbank",d:"Öffne das Inventar (E oder 🎒), stelle Bretter her und daraus eine Werkbank.",k:"craft",a:[d.WORKBENCH],n:1,r:{[q.STICK]:4}},{c:1,t:"Erstes Werkzeug",d:"Setze die Werkbank, drücke Setzen auf sie und stelle eine Holzspitzhacke her.",k:"craft",a:[q.WOOD_PICK],n:1,r:{[q.APPLE]:3}},{c:1,t:"Unterschlupf",d:"Die erste Nacht kommt. Baue dir mit 20 Blöcken (Bretter, Stein, Erde …) einen Unterschlupf.",k:"place",a:ry,n:20,r:{[d.LAMP]:2}},{c:1,t:"Licht für die Nacht",d:"Setze einen Leuchtblock in deinen Unterschlupf.",k:"place",a:[d.LAMP],n:1,r:{[q.BREAD]:2}},{c:1,t:"Das erste Signal",d:"Baue ein Radio (4 Bretter und 1 Leuchtblock) und setze es. Hör genau hin.",k:"place",a:[d.RADIO],n:1,r:{[q.MEAT_COOKED]:2}},{c:2,t:"Das Dorf",d:"Folge dem Wegpunkt 📍 bis ins Dorf.",k:"visit",n:1,r:{[q.BREAD]:2}},{c:2,t:"Erste Kontakte",d:"Sprich mit einem Dorfbewohner: Setzen-Taste auf ihn.",k:"talk",n:1,r:{[q.SEEDS]:4}},{c:2,t:"Erntezeit",d:"Ernte reifen Weizen auf dem Dorffeld oder auf deinem eigenen. Sammle 6 Weizen.",k:"have",a:[q.WHEAT],n:6,r:{[q.BREAD]:1}},{c:2,t:"Tauschhandel",d:"Tausche etwas mit einem Dorfbewohner.",k:"trade",n:1,r:{[q.COPPER_INGOT]:1}},{c:3,t:"Steinwerkzeug",d:"Stelle an der Werkbank eine Steinspitzhacke her. Ohne sie gibt Eisen und Funkkristall nichts her.",k:"craft",a:[q.STONE_PICK],n:1,r:{[d.LAMP]:4}},{c:3,t:"Abstieg",d:"Steige in eine Höhle, bis unter Höhe 18 (Y-Wert oben links). Vorsicht, dort unten ist es nie ganz ruhig.",k:"depth",y:18,n:1,r:{[q.MEAT_COOKED]:2}},{c:3,t:"Kupfer schmelzen",d:"Baue einen Schmelzofen (8 Stein, an der Werkbank) und schmelze 3 Kupferbarren aus Kupfererz und Kohle.",k:"craft",a:[q.COPPER_INGOT],n:3,r:{[d.COAL]:4}},{c:3,t:"Funkkristalle",d:"Funkkristalle leuchten tief unter der Erde. Sammle 3 Stück.",k:"have",a:[d.CRYSTAL],n:3,r:{[q.IRON_INGOT]:2}},{c:4,t:"Der Funksender",d:"Baue an der Werkbank einen Funksender (2 Kupferbarren, 1 Funkkristall, 1 Radio) und setze ihn.",k:"place",a:[d.SENDER],n:1,r:{[d.WIRE]:8}},{c:4,t:"Strom drauf",d:"Setze einen Schalter direkt neben den Sender (oder verbinde beide mit Signalleitungen) und schalte ihn mit der Setzen-Taste ein.",k:"place",a:[d.SWITCH],n:1,r:{[q.COPPER_INGOT]:2}},{c:4,t:"Relais",d:"Ein Funkrelais trägt das Signal 24 Blöcke weiter. Baue eins (Kupfer, Kristall, 2 Stein) und setze es höchstens 24 Blöcke vom Sender entfernt.",k:"place",a:[d.RELAY],n:1,r:{[d.CRYSTAL]:1,[q.COPPER_INGOT]:1}},{c:4,t:"Die Verbindung",d:"Bringe einen Empfänger zum Leuchten, der mindestens 40 Blöcke vom eingeschalteten Sender entfernt steht (über das Relais).",k:"reach",n:40,r:{[q.IRON_INGOT]:3}},{c:5,t:"Gerüstet",d:"Stelle an der Werkbank einen Helm oder Harnisch her und lege ihn an (wählen, Setzen drücken).",k:"craft",a:[q.COPPER_HELMET,q.COPPER_CHEST,q.IRON_HELMET,q.IRON_CHEST],n:1,r:{[q.BREAD]:3}},{c:5,t:"Störsender",d:"Nachts fliegen Störsender-Drohnen. Hol eine vom Himmel.",k:"kill",a:[iy],n:1,r:{[d.CRYSTAL]:1}},{c:5,t:"Wesen der Tiefe",d:"In tiefen Höhlen hausen Höhlenwesen. Besiege 2 davon.",k:"kill",a:[sy],n:2,r:{[q.IRON_INGOT]:2}},{c:5,t:"Maschinen",d:"Schalte mit deinem Netz 3 Maschinen gleichzeitig ein: Signallampen oder Funktore neben Leitungen oder Empfängern.",k:"powered",n:3,r:{[d.RAINBOW]:1}},{c:6,t:"Der Funkturm",d:"Baue einen Turm: Erreiche 20 Blöcke über deinem Startpunkt.",k:"height",n:20,r:{[d.RELAY]:1}},{c:6,t:"Großes Netz",d:"Lass 3 Empfänger gleichzeitig leuchten.",k:"net",n:3,r:{[d.RAINBOW]:1}},{c:6,t:"Die letzte Frequenz",d:"Setze einen Regenbogen-Block auf deinen Funkturm. Das Netz steht, das Rauschen verstummt.",k:"place",a:[d.RAINBOW],n:1,r:{[d.RAINBOW]:2}}],yr=i=>i&&i.c==="rauschen"?s0:i0;function r0(i,t){const e=i.story,n=i.sigStats||{receivers:0,machines:0,reach:0};if(t.k==="have"){let s=0;for(const r of t.a)s+=i.inv[r]||0;return[s,t.n]}return t.k==="height"?[Math.max(0,Math.floor(e.max)),t.n]:t.k==="net"?[n.receivers,t.n]:t.k==="powered"?[n.machines,t.n]:t.k==="reach"?[Math.floor(n.reach),t.n]:[Math.floor(e.p),t.n]}const oy=480,po=6,ay=`
attribute vec4 aCol; varying vec2 vUv; varying vec3 vAmb; varying vec3 vSun; varying float vEm; varying float vBl; varying float vDist; varying float vRb; varying float vWater; varying vec3 vWp; varying vec3 vN;
uniform vec3 uAmb; uniform vec3 uSunCol; uniform vec3 uSunDir; uniform float uTime; uniform float uWind;
void main(){
  float q = floor((aCol.b + 0.5) / 8.0); vBl = q / 63.0; float lb = aCol.b - q * 8.0; float code = lb > 2.5 ? floor(lb + 0.5) : 0.0; vWater = code == 3.0 ? 1.0 : 0.0; if (lb > 2.5) lb = 0.0;
  float f = aCol.a;
  vec3 n = f < 0.5 ? vec3(1.,0.,0.) : f < 1.5 ? vec3(-1.,0.,0.) : f < 2.5 ? vec3(0.,0.,1.) : f < 3.5 ? vec3(0.,0.,-1.) : f < 4.5 ? vec3(0.,1.,0.) : vec3(0.,-1.,0.);
  vN = n;
  float sky = aCol.g;
  vAmb = uAmb * (0.62 + 0.38 * (n.y * 0.5 + 0.5)) * (0.5 + 0.5 * sky) * aCol.r;
  vSun = uSunCol * max(dot(n, uSunDir), 0.0) * sky * (0.35 + 0.65 * aCol.r);
  vEm = min(lb, 1.0);
  vRb = lb > 1.5 ? 1.0 : 0.0;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  if (code > 3.5 && uWind > 0.0) { // Wind: gleiche Ecken bewegen sich gleich (keine Risse zwischen Blättern)
    float ph = uTime * 1.6 + wp.x * 0.7 + wp.z * 0.5 + wp.y * 0.3;
    float amp = (code > 4.5 ? 0.09 : 0.035) * uWind * sky;
    wp.x += sin(ph) * amp; wp.z += cos(ph * 0.8 + 1.3) * amp; wp.y += sin(ph * 1.3) * amp * 0.3;
  }
  vWp = wp.xyz;
  vUv = uv;
  vec4 mv = viewMatrix * wp;
  vDist = length(mv.xyz);
  gl_Position = projectionMatrix * mv;
}`,ly=`
uniform sampler2D uMap; uniform vec3 uFog; uniform vec2 uFogRange; uniform float uCut; uniform float uTime; uniform vec3 uSunCol; uniform vec3 uSunDir;
varying vec2 vUv; varying vec3 vAmb; varying vec3 vSun; varying float vEm; varying float vBl; varying float vDist; varying float vRb; varying float vWater; varying vec3 vWp; varying vec3 vN;
${Fp}
void main(){
  vec4 t = texture2D(uMap, vUv);
  if (t.a < uCut) discard;
  float sh = dot(vSun, vSun) > 0.0 ? shadowAt(vWp, vN) : 1.0;
  vec3 light = max(vAmb + vSun * sh + blockGlow(vBl), vec3(vEm));
  vec3 c = t.rgb * light;
  float alpha = t.a;
  if (vWater > 0.5) { // Wasser: wandernde Wellen, Sonnenglitzern, am flachen Blickwinkel spiegelt der Himmel
    float w = sin(vWp.x * 1.7 + uTime * 1.3) * sin(vWp.z * 1.3 - uTime * 1.1) + 0.5 * sin((vWp.x + vWp.z) * 3.1 + uTime * 2.3);
    vec3 V = normalize(cameraPosition - vWp);
    float fres = pow(1.0 - abs(V.y), 3.0);
    c *= 0.9 + 0.1 * w;
    c += uSunCol * pow(max(0.0, w * 0.4 + 0.45), 10.0) * 0.8 * smoothstep(0.0, 0.2, uSunDir.y) * sh;
    c = mix(c, uFog + uFogSun * 0.5, fres * 0.55);
    alpha = mix(alpha, 0.94, fres * 0.6);
  }
  if (vRb > 0.5) { // Regenbogen-Block: wandernde Farben
    float hue = fract((vUv.x + vUv.y) * 14.0 + uTime * 0.25 + t.r * 0.35);
    vec3 rb = clamp(abs(fract(hue + vec3(0.0, 0.6667, 0.3333)) * 6.0 - 3.0) - 1.0, 0.0, 1.0);
    c = rb * (0.55 + 0.6 * t.r);
  }
  c = mix(vec3(dot(c, vec3(0.299, 0.587, 0.114))), c, 1.1); c = c * 1.15 / (1.0 + 0.15 * c); // etwas kräftigere Farben, weiche Lichter
  gl_FragColor = vec4(toLinear(applyFog(c, vWp, vDist, uFog, uFogRange, uSunDir)), alpha);
  #include <colorspace_fragment>
}`,cy="varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }",hy=`
uniform vec3 uHor; uniform vec3 uZen; uniform vec3 uSunN; uniform vec3 uGlow; varying vec3 vDir;
void main(){
  float h = clamp(vDir.y, 0.0, 1.0);
  vec3 c = mix(uHor, uZen, pow(h, 0.5));
  c += uGlow * pow(max(dot(normalize(vDir), uSunN), 0.0), 6.0);
  c += uGlow * 0.6 * pow(max(dot(normalize(vDir), uSunN), 0.0), 64.0); // heller Hof um die Sonne
  c = max(c, 0.0);
  gl_FragColor = vec4(mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)), 1.0);
  #include <colorspace_fragment>
}`,uy=`
uniform vec2 uOff; varying vec2 vUv; varying float vD;
void main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vUv = (wp.xz + uOff) / 520.0; vD = length(position.xy) / 1200.0; gl_Position = projectionMatrix * viewMatrix * wp; }`,fy=`
uniform sampler2D uTex; uniform vec3 uCol; varying vec2 vUv; varying float vD;
void main(){ float a = texture2D(uTex, vUv).a * (1.0 - smoothstep(0.45, 0.95, vD)) * 0.9; vec3 c = max(uCol, 0.0); gl_FragColor = vec4(mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)), a);
  #include <colorspace_fragment>
}`,wc=(i,t,e)=>i+(t-i)*e;function dy(i){if(i===d.SNOW)return"schnee";if(i===d.GLASS||i===d.ICE)return"glas";if(i===d.SAND||i===d.GRAVEL)return"sand";const t=Gt[i]&&Gt[i].tool;return t==="axt"?"holz":t==="spitzhacke"?"stein":"weich"}const ji=(i,t,e)=>[wc(i[0],t[0],e),wc(i[1],t[1],e),wc(i[2],t[2],e)],Ua=(i,t,e)=>{const n=Math.max(0,Math.min(1,(e-i)/(t-i)));return n*n*(3-2*n)};class py{constructor(t,e,n="auto"){this.coarse=e;const s=window.devicePixelRatio||1;this.renderer=new j_({canvas:t,antialias:n!=="eco"&&!(e&&s>=2.5),powerPreference:"high-performance"}),this.maxDpr=e?1.75:2,this.dprScale=1,this.budget=e?4:6,this.maxView=e?4:7,this.autoQ=!1,this.cloudsOn=!0,this.perf={acc:0,n:0,good:0},this.fps=0,this.placeDelay=!0,this.scene=new Z_,this.camera=new Fn(e?70:75,1,.08,1500),this.camera.rotation.order="YXZ",this.scene.add(this.camera),this.group=new ii,this.scene.add(this.group);const r=Math.min(8,this.renderer.capabilities.getMaxAnisotropy()),o=g=>{const _=new Xa(g);return _.magFilter=dn,_.minFilter=di,_.anisotropy=r,_.generateMipmaps=!0,_};this.atlasCanvas=f2(),this.atlasTex=new xp(this.atlasCanvas.raw,this.atlasCanvas.width,this.atlasCanvas.height,Bn),this.atlasTex.magFilter=dn,this.atlasTex.minFilter=di,this.atlasTex.anisotropy=r,this.atlasTex.generateMipmaps=!0,this.atlasTex.needsUpdate=!0,this.logoCanvas=d2(()=>{this.logoTex.needsUpdate=!0,!this.running&&this.world&&this.render()},()=>this.onLogos()),this.logoTex=o(this.logoCanvas),this.onLogos=()=>{},this.uni={uAmb:{value:new O(.44,.5,.62)},uSunCol:{value:new O(.6,.57,.5)},uSunDir:{value:new O(0,1,.25).normalize()},uFog:{value:new O(.68,.84,.95)},uFogRange:{value:new zt(40,90)},uTime:{value:0},uWind:{value:1},...Jf()};const a=(g,_,M,S)=>new Ve({vertexShader:ay,fragmentShader:ly,transparent:M,depthWrite:!M,side:M?Mn:Oi,uniforms:{...S,uMap:{value:g},uCut:{value:_}}});this.matO=a(this.atlasTex,.5,!1,this.uni),this.matT=a(this.atlasTex,.02,!0,this.uni),this.matL=a(this.logoTex,.5,!1,this.uni),this.shadows=new uS(this.uni),this.shadows.setAtlas(this.atlasTex),this.post=null,this.postOn=!1,this.msaa=n!=="eco"&&!(e&&s>=2.5),this.deco=new ES(this.group,this.uni),this.deco.onReady=()=>{!this.running&&this.world&&this.render()},this.sky=new ii,this.scene.add(this.sky),this.domeU={uHor:{value:new O},uZen:{value:new O},uSunN:{value:new O(1,0,0)},uGlow:{value:new O}};const l=new Re(new Zh(700,20,12),new Ve({vertexShader:cy,fragmentShader:hy,uniforms:this.domeU,side:pn,depthWrite:!1,depthTest:!1}));l.renderOrder=-20,l.frustumCulled=!1,this.sky.add(l);const c=(g,_)=>{const M=new Re(new Ps(g,g),new si({color:_,fog:!1,depthWrite:!1}));return M.renderOrder=-10,this.sky.add(M),M};this.sun=c(80,16773808),this.moon=c(52,14674175);const h=new Float32Array(300*3);for(let g=0;g<300;g++){const _=Math.random()*2-1,M=Math.random()*Math.PI*2,S=Math.sqrt(1-_*_);h[g*3]=Math.cos(M)*S*600,h[g*3+1]=_*600,h[g*3+2]=Math.sin(M)*S*600}const f=new ke;f.setAttribute("position",new we(h,3)),this.starMat=new Mp({color:16777215,size:2,sizeAttenuation:!1,transparent:!0,opacity:0,fog:!1,depthWrite:!1}),this.stars=new eM(f,this.starMat),this.stars.renderOrder=-15,this.sky.add(this.stars);const u=new Xa(p2());u.wrapS=u.wrapT=Ja,u.minFilter=di,u.magFilter=dn,this.cloudU={uTex:{value:u},uCol:{value:new O(1,1,1)},uOff:{value:new zt}},this.clouds=new Re(new Ps(2400,2400),new Ve({vertexShader:uy,fragmentShader:fy,uniforms:this.cloudU,transparent:!0,depthWrite:!1,side:Mn})),this.clouds.rotation.x=-Math.PI/2,this.clouds.frustumCulled=!1,this.chunkSphereR=Math.hypot(I/2,ie/2,I/2)+1,this.scene.add(this.clouds),this.vclouds=new gS(this.scene,this.uni),this.vcloudsOn=!1;const p=new nM(new cs(1.004,1.004,1.004));this.hl=new If(p,new vo({color:0,transparent:!0,opacity:.75})),this.hl.visible=!1,this.scene.add(this.hl),this.ghost=new If(p,new vo({color:16777215,transparent:!0,opacity:.55,depthTest:!1})),this.ghost.visible=!1,this.ghost.renderOrder=40,this.scene.add(this.ghost),this.buildMode=0,this.anchor=null,this.clip=null,this.batch=null,this.preview=!0,this.beam=new Mh(new ke().setFromPoints([new O,new O]),new vo({color:16722538})),this.beam.frustumCulled=!1,this.beam.visible=!1,this.beamT=0,this.scene.add(this.beam);const x={uAmb:{value:new O(.62,.64,.7)},uSunCol:{value:new O(.5,.46,.38)},uSunDir:{value:new O(.35,.8,.5).normalize()},uFog:{value:new O},uFogRange:{value:new zt(1e5,2e5)},uTime:this.uni.uTime,uWind:{value:0},...Jf()},v=g=>{const _=a(g,.5,!1,x);return _.depthTest=!1,_};this.handMatO=v(this.atlasTex),this.handMatL=v(this.logoTex),this.hand=new Re(new ke,this.handMatO),this.hand.frustumCulled=!1,this.hand.renderOrder=50,this.hand.visible=!1,this.camera.add(this.hand),this.itemCanvas=m2(ol.map(g=>De[g]));const m=new Xa(this.itemCanvas);if(m.magFilter=nn,m.minFilter=nn,m.generateMipmaps=!1,this.itemHand=new Re(new Ps(1,1),new si({map:m,transparent:!0,alphaTest:.5,depthTest:!1,side:Mn})),this.itemHand.frustumCulled=!1,this.itemHand.renderOrder=50,this.itemHand.visible=!1,this.camera.add(this.itemHand),this.mobView=new M2(this.scene),this.mobs=null,this.light=1,this.vehView=new T2(this.scene),this.vehicles=null,this.ride=null,this.prevJump=!1,this.meshSeq=0,this.mwJobs=0,this.mw=null,typeof Worker<"u")try{this.mw=new Worker(new URL(""+new URL("meshworker-CtxK2ADg.js",import.meta.url).href,import.meta.url),{type:"module"}),this.mw.onmessage=g=>this.onMeshed(g.data),this.mw.onerror=()=>{this.mw=null,this.mwJobs=0,this.scanDirty=!0}}catch{this.mw=null}this.handType=-1,this.swing=0,this.bob=0,this.parts=[],this.partCount=0,this.rope=new Mh(new ke().setFromPoints([new O,new O]),new vo({color:16769162})),this.rope.frustumCulled=!1,this.rope.visible=!1,this.scene.add(this.rope),this.hookT=0,this.hookTarget=new O,this.wp=null,this.timeFrozen=!1,this.radioT=0,this.player=new $2,this.input={f:0,r:0,jump:!1,down:!1,sprint:!1},this.breakHeld=!1,this.placeHeld=!1,this.actCool=0,this.world=null,this.running=!1,this.raf=0,this.last=0,this.viewDist=e?4:7,this.offsets=[],this.setViewDist(this.viewDist),this.onChange=()=>{},this.onToast=()=>{},this.story=null,this.onQuest=()=>{},this.onQuestDone=()=>{},this.vitals=null,this.dead=!1,this.mine=null,this.deathLoss="keep",this.enemies=!0,this.farm=new md,this.age=0,this.history=[],this.redoList=[],this.onVitals=()=>{},this.onHurt=()=>{},this.onDeath=()=>{},this.onMine=()=>{},this.onStation=()=>{},this.onTrade=()=>{},this.onBuildMode=()=>{},this.onRide=()=>{},this.mp=null,this.net=null,this.armor={kopf:0,brust:0},this.armWear={kopf:0,brust:0},this.resize()}setQuality(t,e){const n=Th[t]||Th.standard;if(this.qName=t,this.autoQ=!!e,this.maxDpr=n.dpr,this.dprScale=1,this.budget=n.budget,this.cloudsOn=n.clouds,this.maxView=n.view,this.shadows.configure(n.shadow||0,n.shadowR||40,n.shadowEvery||1),this.vcloudsOn=!!n.vclouds,this.uni.uWind.value=n.wind===!1?0:1,this.postOn=!!n.post,this.postOn&&!this.post)try{this.post=new xS(this.renderer,this.scene,this.camera,this.msaa)}catch{this.postOn=!1}this.perf.acc=this.perf.n=this.perf.good=0,this.menuMode?this.savedView=n.view:this.setViewDist(n.view),this.resize()}measure(t){const e=this.perf;if(t>250||(e.acc+=t,e.n++,e.acc<2e3))return;const n=e.acc/e.n;e.acc=e.n=0,this.fps=Math.round(1e3/n),!(!this.autoQ||this.menuMode)&&(n>26?(e.good=0,this.dprScale>.6?(this.dprScale=Math.max(.6,this.dprScale-.15),this.resize()):this.viewDist>3&&this.setViewDist(this.viewDist-1)):n<18&&++e.good>=3&&(e.good=0,this.dprScale<1?(this.dprScale=Math.min(1,this.dprScale+.1),this.resize()):this.viewDist<this.maxView&&this.setViewDist(this.viewDist+1)))}setViewDist(t){this.viewDist=t;const e=t+2,n=[];for(let s=-e-1;s<=e+1;s++)for(let r=-e-1;r<=e+1;r++){const o=Math.hypot(r,s);o<=e&&n.push([r,s,o])}n.sort((s,r)=>s[2]-r[2]),this.offsets=n,this.scanDirty=!0}resize(){const t=window.innerWidth,e=window.innerHeight,n=Math.min(window.devicePixelRatio||1,this.maxDpr)*this.dprScale;this.renderer.setPixelRatio(n),this.renderer.setSize(t,e,!1),this.post&&this.post.setSize(t,e,n),this.camera.aspect=t/e,this.camera.updateProjectionMatrix(),!this.running&&this.world&&this.render()}start(t){if(this.stop(),this.clearWorld(),this.leaveMenu(),this.gen=Ip(t.gen),this.world=new jf(t.seed,AS(t.edits),this.gen,t.preset,t.terrain),this.preset=this.world.preset,this.terrain=this.world.terrain,this.world.rot=RS(t.rot),this.name=t.name,this.seed=t.seed,this.mode=t.mode,this.time=t.time??.08,this.hotbar=Array.isArray(t.hotbar)&&t.hotbar.length===9?t.hotbar.map(s=>Number.isInteger(s)&&nd(s)?s:0):[1,2,3,4,5,6,7,8,9],this.sel=t.sel??0,this.inv=t.inv?{...t.inv}:{[d.DIRT]:20,[d.PLANKS]:10,[d.GLASS]:4},this.story=t.mode==="story"?t.story?{...t.story}:{i:0,p:0,max:0,done:!1,c:this.gen>=3?"rauschen":void 0}:null,this.story&&!this.story.c&&delete this.story.c,this.sigStats={receivers:0,machines:0,reach:0,senders:0},this.sigRetry=!1,!t.inv&&t.mode==="survival"){for(let s=0;s<16;s++)this.inv[xi+s]=4;for(let s=0;s<Sp;s++)this.inv[yh+s]=8}if(this.wp=t.wp||null,this.map=new P2(t.map),this.hookT=0,this.rope.visible=!1,this.timeFrozen=!1,this.handType=-1,this.survival=t.mode==="survival"||t.mode==="story"&&this.gen>=3,this.vitals=this.survival?new vd(t.vit||{}):null,this.dead=!1,this.mine=null,this.player.impact=0,this.dur={},t.dur&&typeof t.dur=="object")for(const[s,r]of Object.entries(t.dur))es(Number(s))&&Number.isFinite(r)&&(this.dur[s]=r);this.armor={kopf:0,brust:0},this.armWear={kopf:0,brust:0},Array.isArray(t.arm)&&["kopf","brust"].forEach((s,r)=>{const o=oo(t.arm[r]);o&&o.slot===s&&(this.armor[s]=t.arm[r],this.armWear[s]=Math.max(0,Math.min(o.dur-1,t.arm[r+2]|0)))}),this.buildMode=0,this.anchor=null,this.clip=null,this.batch=null;const e=t.grave;this.grave=e&&[e.x,e.y,e.z].every(Number.isFinite)&&e.inv&&typeof e.inv=="object"?e:null,this.mobs=new X2(this.world,t.seed,t.mobs,t.mode!=="story"||this.gen>=3),this.world.structs&&(this.mobs.findVillages=(s,r)=>{const o=[],a=Vn(s),l=Vn(r);for(let c=-1;c<=1;c++)for(let h=-1;h<=1;h++){const f=Fr(this.seed,a+h,l+c,this.gen);f&&!(this.world.preset&&Lp(a+h,l+c))&&o.push(f)}return o}),this.mobs.onAdd=s=>this.mobView.add(s),this.mobs.onRemove=s=>this.mobView.remove(s),this.vehicles=new v2(this.world,t.veh),this.ride=null,this.prevJump=!1,this.vehicles.onAdd=s=>this.vehView.add(s),this.vehicles.onRemove=s=>this.vehView.remove(s),this.vehicles.attach(),this.mobs.onAttack=s=>this.mobHits(s),this.mobs.onPoof=s=>this.spawnBreak(s.x-.5,s.y+.5,s.z-.5,d.BASALT),this.age=Number.isFinite(t.age)&&t.age>=0?t.age:0,this.farm=new md(t.farm),this.farmT=0,this.history=[],this.redoList=[],this.spawn=this.world.findSpawn(t.mode!=="story"),this.spawnY=this.spawn.y;const n=this.player;t.px!==void 0?(n.x=t.px,n.y=t.py,n.z=t.pz,this.yaw=t.yaw||0,this.pitch=t.pitch||0):(n.x=this.spawn.x,n.y=this.spawn.y,n.z=this.spawn.z,this.yaw=0,this.pitch=-.1),n.vx=n.vy=n.vz=0,n.flying=!1,n.onGround=!1,this.target=null,this.unsaved=!1,this.loadAround(2,1),this.scanDirty=!0,this.lastPC=null,this.applyCamera(),this.updateSky(),this.resume()}startMenu(){this.stop(),this.clearWorld(),this.menuMode=!0,this.savedView=this.savedView??this.viewDist,this.setViewDist(Math.min(this.viewDist,4)),this.world=new jf(20241,new Map,1),this.mode="creative",this.time=.06,this.menuT=0,this.hotbar=new Array(9).fill(0),this.sel=0,this.inv={};const t=this.world.findSpawn(),e=this.player,n=this.world;e.x=t.x,e.z=t.z,e.y=t.y,e.flying=!1,e.vx=e.vy=e.vz=0,e.hook=!1,this.loadAround(3,2);const s=Math.floor(t.x),r=Math.floor(t.z),o=Math.floor(t.y)-1;for(let l=s-5;l<=s+5;l++)for(let c=r-5;c<=r+5;c++){for(let h=o+1;h<=o+9;h++)n.setBlock(l,h,c,d.AIR);n.setBlock(l,o,c,l+c&1?d.MARBLE:d.STONE)}for(let l=0;l<16;l++)n.setBlock(s-2+l%4,o+1,r-2+(l>>2),xi+l);const a=[d.NEON_R,d.NEON_B,d.NEON_G,d.NEON_P];[[-3,-3],[3,-3],[3,3],[-3,3]].forEach(([l,c],h)=>{for(let f=1;f<=4;f++)n.setBlock(s+l,o+f,r+c,a[h]);n.setBlock(s+l,o+5,r+c,d.RAINBOW)}),n.setBlock(s,o+2,r,d.RADIO);for(let l=3;l<=5;l++)n.setBlock(s,o+l,r,d.FEDER);n.setBlock(s,o+6,r,d.RAINBOW),this.menuC={x:s+.5,y:o+3,z:r+.5},this.flushDirty(),this.hand.visible=!1,this.hl.visible=!1,this.rope.visible=!1,this.scanDirty=!0,this.lastPC=null,this.menuStep(0),this.resume()}leaveMenu(){this.menuMode&&(this.menuMode=!1,this.savedView!=null&&(this.setViewDist(this.savedView),this.savedView=null))}menuStep(t){this.menuT+=t,this.time=(this.time+t/150)%1;const e=this.menuC,n=this.menuT*.07,s=15+Math.sin(this.menuT*.05)*2.5,r=4.5+Math.sin(this.menuT*.11)*1.5;this.camera.position.set(e.x+Math.cos(n)*s,e.y+r,e.z+Math.sin(n)*s),this.camera.lookAt(e.x,e.y-3.2,e.z),this.stream(),this.flushDirty(),this.uni.uTime.value=performance.now()/1e3,this.updateSky(),this.cloudU.uOff.value.x+=t*2.5}clearWorld(){this.deco.clear();for(const t of this.group.children.slice())t.geometry.dispose(),this.group.remove(t);this.mobs&&(this.mobs.clear(),this.mobs=null),this.mobView.clear(),this.vehicles&&(this.vehicles.clear(),this.vehicles=null),this.vehView.clear(),this.ride=null,this.vitals=null,this.dead=!1,this.world=null,this.mwJobs=0}loadAround(t,e){const n=Math.floor(this.player.x/I),s=Math.floor(this.player.z/I);for(let r=-t;r<=t;r++)for(let o=-t;o<=t;o++)this.world.ensure(n+o,s+r);for(let r=-e;r<=e;r++)for(let o=-e;o<=e;o++)this.applyMesh(this.world.getChunk(n+o,s+r))}serialize(){const t=this.player,e=Hp(this.world.edits);return{v:Bp,gen:this.gen,name:this.name,seed:this.seed,mode:this.mode,time:this.time,savedAt:Date.now(),px:t.x,py:t.y,pz:t.z,yaw:this.yaw,pitch:this.pitch,hotbar:this.hotbar,sel:this.sel,inv:this.inv,wp:this.wp,story:this.story,edits:e,vit:this.vitals?this.vitals.toJSON():void 0,dur:this.dur,grave:this.grave||void 0,mobs:this.mobs?this.mobs.serialize():void 0,age:Math.round(this.age),farm:this.farm.plants.size?this.farm.serialize():void 0,arm:this.armor.kopf||this.armor.brust?[this.armor.kopf,this.armor.brust,this.armWear.kopf,this.armWear.brust]:void 0,veh:this.vehicles&&this.vehicles.list.length?this.vehicles.serialize():void 0,map:this.map?this.map.serialize():void 0,rot:this.world.rot.size?wS(this.world.rot):void 0,preset:this.preset||void 0,terrain:this.terrain||void 0}}respawn(){const t=this.player;this.world.ensure(Math.floor(this.spawn.x/I),Math.floor(this.spawn.z/I)),t.x=this.spawn.x,t.y=this.spawn.y,t.z=this.spawn.z,t.vx=t.vy=t.vz=0,t.flying=!1,t.impact=0,this.hookT=0,this.rope.visible=!1,this.loadAround(1,0),this.scanDirty=!0,this.applyCamera(),this.running||this.render()}resume(){this.running||(this.running=!0,this.last=performance.now(),this.raf=requestAnimationFrame(t=>this.frame(t)))}stop(){this.running=!1,cancelAnimationFrame(this.raf),Ld(0,0)}frame(t){if(!this.running||(this.raf=requestAnimationFrame(n=>this.frame(n)),this.menuMode&&t-this.last<32))return;this.measure(t-this.last);const e=Math.max(0,Math.min(.05,(t-this.last)/1e3));this.last=t,this.menuMode?this.menuStep(e):this.step(e),this.render()}step(t){const e=this.world,n=this.player;if(this.timeFrozen||(this.time=(this.time+t/oy)%1),this.uni.uTime.value=performance.now()/1e3,this.dead||(this.ride?this.rideStep():(this.updateHook(t),n.update(e,t,this.input,this.yaw),this.sounds(t)),n.bounces&&(this.questEvent("bounce",0,n.bounces),n.bounces=0),this.story&&n.gliding&&(this.glideAcc=(this.glideAcc||0)+t),this.vitals&&!n.waiting&&this.updateVitals(t)),this.vehicles&&this.vehicles.list.length){const l=-Math.sin(this.yaw),c=-Math.cos(this.yaw),h=Math.hypot(l,c)||1;this.vehicles.update(t,this.ride,this.ride&&!this.dead?{f:this.input.f,r:this.input.r,look:[l/h,c/h]}:null),this.ride&&this.seatPlayer(),this.vehView.update(n.x,n.z,this.light,this.viewDist*I,this.uni.uTime.value)}this.applyCamera(),this.stream();const s=this.time>.52&&this.time<.98;this.mobs&&(this.mobs.update(t,n.x,n.z,{py:n.y,night:s,time:this.time,hostiles:this.survival&&this.enemies&&!this.dead,others:this.mp?this.mp.others():null}),this.mobView.update(n.x,n.z,this.light,this.viewDist*I,this.uni.uTime.value)),this.mp&&this.mp.tick(t),this.dead||(this.age+=t),this.farmT-=t,this.farmT<=0&&(this.farmT=2,!this.net&&this.farm.update(this.world,this.age)&&(this.unsaved=!0));const r=this.camera,o=this.lookDir||(this.lookDir=new O);o.set(0,0,-1).applyEuler(r.rotation),this.target=this.dead?null:Ed(e,r.position.x,r.position.y,r.position.z,o.x,o.y,o.z,po);const a=!!(this.target&&Ln[this.target.type]===8);a!==this.onDeco&&(this.onDeco=a,this.onDecoTarget&&this.onDecoTarget(a)),this.target?(this.hl.position.set(this.target.x+.5,this.target.y+.5,this.target.z+.5),this.hl.visible=!0):this.hl.visible=!1,this.updateGhost(),this.beamT>0&&(this.beamT-=t)<=0&&(this.beam.visible=!1),this.actCool-=t,this.placeHeld&&!this.prevPlace&&(this.placeFirst=!0),this.prevPlace=this.placeHeld,this.breakHeld&&!this.dead?this.useBreak(t,o):(this.setMine(null),this.actCool<=0&&this.placeHeld&&!this.dead&&this.placeBlock()&&(this.actCool=this.placeFirst&&this.placeDelay?.45:.25,this.placeFirst=!1)),this.flushDirty(),this.updateSky(),this.cloudU.uOff.value.x+=t*2.5,this.radioT-=t,(this.world.sigDirty||this.sigRetry&&this.radioT<=0)&&this.updateSignals(),this.radioT<=0&&(this.radioT=.3,this.updateRadio(),this.questTick(),this.checkGrave(),(this.mapT=(this.mapT||0)+1)%4===0&&this.map&&(this.map.markAround(this.player.x,this.player.z,Math.min(this.viewDist,5)),this.map.syncRadios(this.world))),this.updateHand(t),this.partCount&&this.updateParticles(t)}sounds(t){const e=this.player,n=this.world;if(e.onGround&&!e.flying&&!e.inWater&&(this.stepAcc=(this.stepAcc||0)+Math.hypot(e.vx,e.vz)*t,this.stepAcc>2.1&&(this.stepAcc=0,q2(dy(n.getBlock(Math.floor(e.x),Math.floor(e.y-.05),Math.floor(e.z)))))),e.inWater&&!this.wasWater?Td(e.vy<-6):e.inWater&&(this.swimAcc=(this.swimAcc||0)+Math.hypot(e.vx,e.vz)*t)>2.5&&(this.swimAcc=0,Td(!1)),this.wasWater=e.inWater,this.mobs&&(this.callT=(this.callT??3)-t)<=0){this.callT=2.5+Math.random()*5;const s=this.mobs.list.filter(r=>Math.hypot(r.x-e.x,r.z-e.z)<20);if(s.length){const r=s[Math.floor(Math.random()*s.length)];Y2(r.T.key,Math.hypot(r.x-e.x,r.y-e.y,r.z-e.z))}}}updateVitals(t){const e=this.vitals,n=this.player,s=[Math.ceil(e.hp),Math.ceil(e.food),Math.ceil(e.air)];let r=0;if(n.impact){const a=k2(n.impact);n.impact=0,a&&!n.inWater&&(e.hurt(a,"Sturz"),r+=a)}const o=n.onGround&&this.world.getBlock(Math.floor(n.x),Math.floor(n.y-.05),Math.floor(n.z))===d.MAGMA;if(r+=e.tick(t,{moving:Math.hypot(n.vx,n.vz)>.5,sprint:this.input.sprint,eyeWater:n.eyeWater,onMagma:o}),r>0&&(this.onHurt(r,e.cause),this.unsaved=!0,r>=1&&Ac()),e.dead){this.die(e.cause);return}(s[0]!==Math.ceil(e.hp)||s[1]!==Math.ceil(e.food)||s[2]!==Math.ceil(e.air))&&this.onVitals()}die(t){const e=this.player;this.ride&&this.dismount(),this.dead=!0,this.breakHeld=this.placeHeld=!1,this.hookT=0,this.rope.visible=!1,this.setMine(null),e.vx=e.vy=e.vz=0;const n={x:Math.round(e.x),y:Math.round(e.y),z:Math.round(e.z)};let s=!1;if(this.deathLoss==="grave"){const r={};for(const[o,a]of Object.entries(this.inv))a>0&&(r[o]=a);if(Object.keys(r).length){if(this.grave)for(const[o,a]of Object.entries(this.grave.inv))r[o]=Math.min(en,(r[o]||0)+a);this.grave={...n,inv:r},this.inv={},s=!0}}this.wp=n,this.unsaved=!0,this.onDeath(t,s)}revive(){this.dead&&(this.vitals=new vd,this.dead=!1,this.player.impact=0,this.respawn(),this.onVitals(),this.onChange())}checkGrave(){const t=this.grave,e=this.player;if(!(!t||this.dead||Math.hypot(t.x-e.x,t.y-e.y,t.z-e.z)>2.5)){for(const[n,s]of Object.entries(t.inv))nd(Number(n))&&(this.inv[n]=Math.min(en,(this.inv[n]||0)+s));this.wp&&this.wp.x===t.x&&this.wp.z===t.z&&(this.wp=null),this.grave=null,this.unsaved=!0,xn(),this.onToast("Deine Sachen sind wieder da"),this.onChange()}}held(){const t=this.hotbar[this.sel];return t&&(this.mode==="creative"||this.inv[t]>0)?t:0}setMine(t){const e=!!this.mine;this.mine=t,(e||t)&&this.onMine(t?Math.min(1,t.t/t.need):0)}useBreak(t,e){if(this.actCool>0)return;const n=this.camera.position,s=this.target,r=this.mobs?this.mobs.raycast(n.x,n.y,n.z,e.x,e.y,e.z,po):null,o=this.vehHit(e);if(o&&(!s||o.t<s.t)&&(!r||o.t<r.t)){this.pickVehicle(o.veh),this.actCool=.45,this.setMine(null);return}if(r&&(!s||r.t<s.t)){this.attack(r.mob),this.actCool=.45,this.setMine(null);return}if(!this.survival){this.setMine(null),this.breakBlock()&&(this.actCool=.22);return}if(!s||s.y===0){this.setMine(null);return}const a=this.held();if(!BS(s.type,a)){Cn(),this.onToast(`${No[s.type]} braucht eine ${Gt[s.type].tier>1?"Stein- oder bessere ":""}Spitzhacke`),this.actCool=.8,this.setMine(null);return}let l=this.mine;if((!l||l.x!==s.x||l.y!==s.y||l.z!==s.z||l.held!==a)&&(l={x:s.x,y:s.y,z:s.z,held:a,t:0,need:FS(s.type,a),sw:0}),l.t+=t,l.sw-=t,l.sw<=0&&(l.sw=.25,this.swing=1),l.t>=l.need){this.setMine(null),this.breakBlock()&&(this.actCool=.1);return}this.setMine(l)}attack(t){if(t.npc){this.onToast(`${t.name}: „He, nicht hauen! Lass uns lieber tauschen.“`),this.actCool=.8;return}const e=this.held(),n=es(e),s=this.player,r=this.mode==="creative"?99:n?n.kind==="schwert"?n.dmg:n.kind==="axt"?3:2:1;if(this.swing=1,bc(),n&&n.kind==="schwert"&&this.wear(e),this.net){this.net.hit(t.id,Math.min(r,10)),t.hurtT=.35;return}if(!t.hit(r,s.x,s.z)||(this.spawnBreak(t.x-.5,t.y,t.z-.5,d.WOOL),this.mobs.remove(t,!1),this.unsaved=!0,this.questEvent("kill",t.type),this.mode==="creative"))return;const o=e0(t.type).map(([a,l])=>(this.inv[a]=Math.min(en,(this.inv[a]||0)+l),`+${l} ${Se(a)}`));o.length&&this.onToast(o.join(" · ")),this.onChange()}mobHits(t){if(t.target&&this.mp){this.mp.hurtGuest(t);return}const e=this.vitals,n=this.player;if(!e||this.dead)return;const s=Math.hypot(n.x-t.x,n.z-t.z)||1;if(t.T.range){const o=this.beam.geometry.attributes.position;o.setXYZ(0,t.x,t.y+.3,t.z),o.setXYZ(1,n.x,n.y+1.2,n.z),o.needsUpdate=!0,this.beam.visible=!0,this.beamT=.15}else n.vx+=(n.x-t.x)/s*6,n.vz+=(n.z-t.z)/s*6,n.vy=Math.max(n.vy,5),n.onGround=!1;const r=t.T.dmg*Qf(this.armorPoints());this.wearArmor(),e.hurt(r,t.T.name),Ac(),this.onHurt(r,t.T.name),this.onVitals(),this.unsaved=!0,e.dead&&this.die(t.T.name)}remoteHurt(t){const e=this.vitals,n=this.player;if(!e||this.dead)return;const s=Array.isArray(t.from)&&t.from.slice(0,3).every(Number.isFinite)?t.from:null;if(s&&s[3]){const a=this.beam.geometry.attributes.position;a.setXYZ(0,s[0],s[1],s[2]),a.setXYZ(1,n.x,n.y+1.2,n.z),a.needsUpdate=!0,this.beam.visible=!0,this.beamT=.15}else if(s){const a=Math.hypot(n.x-s[0],n.z-s[2])||1;n.vx+=(n.x-s[0])/a*6,n.vz+=(n.z-s[2])/a*6,n.vy=Math.max(n.vy,5),n.onGround=!1}const r=typeof t.cause=="string"?t.cause.slice(0,30):"Gegner",o=Math.min(10,t.dmg)*Qf(this.armorPoints());this.wearArmor(),e.hurt(o,r),Ac(),this.onHurt(o,r),this.onVitals(),e.dead&&this.die(r)}record(t,e,n,s,r){if(this.net&&this.net.local(t,e,n,s,r),this.mode==="creative"){if(this.batch){this.batch.push([t,e,n,s,r]);return}this.history.push([[t,e,n,s,r]]),this.history.length>100&&this.history.shift(),this.redoList.length=0}}beginBatch(){this.batch=[]}endBatch(){const t=this.batch;this.batch=null,t&&t.length&&(this.history.push(t),this.history.length>100&&this.history.shift(),this.redoList.length=0)}undo(t=!1){if(this.mode!=="creative")return this.onToast("Rückgängig gibt es im Kreativmodus"),!1;const e=t?this.redoList:this.history,n=t?this.history:this.redoList,s=e.pop();if(!s)return this.onToast(t?"Nichts zum Wiederholen":"Nichts zum Rückgängigmachen"),!1;const r=t?s:s.slice().reverse();for(const[o,a,l,c,h]of r){this.world.ensure(o>>4,l>>4);const f=t?c:h,u=t?h:c;this.world.setBlock(o,a,l,u)&&this.net&&this.net.local(o,a,l,f,u)}return n.push(s),this.unsaved=!0,xn(),this.running||(this.flushDirty(),this.render()),!0}hoe(t){const e=this.target;return!e||![d.GRASS,d.DIRT,d.FLOWERS,d.MYCEL].includes(e.type)||this.world.getBlock(e.x,e.y+1,e.z)!==d.AIR||!this.world.setBlock(e.x,e.y,e.z,d.FARMLAND)?!1:(this.record(e.x,e.y,e.z,e.type,d.FARMLAND),this.wear(t),this.swing=1,xn(),this.unsaved=!0,this.onChange(),!0)}sow(t){const e=this.target;return!e||e.type!==d.FARMLAND||this.world.getBlock(e.x,e.y+1,e.z)!==d.AIR?(this.onToast("Samen brauchen Ackerboden (Hacke auf Gras oder Erde)"),this.actCool=.6,!1):this.mode!=="creative"&&!(this.inv[t]>0)?(Cn(),this.onToast(`Keine ${Se(t)} im Vorrat`),this.actCool=.4,!1):this.farm.plant(e.x,e.y+1,e.z,this.age)?(this.world.setBlock(e.x,e.y+1,e.z,xc(t)),this.record(e.x,e.y+1,e.z,d.AIR,xc(t)),this.mode!=="creative"&&this.inv[t]--,this.swing=1,xn(),this.unsaved=!0,this.onChange(),!0):(this.onToast("Zu viele Pflanzen in dieser Welt"),!1)}eat(t){return this.vitals?this.inv[t]>0?this.vitals.eat(ed(t))?(this.inv[t]--,this.swing=1,xn(),this.unsaved=!0,this.onChange(),this.onVitals(),!0):(this.onToast("Du bist satt"),this.actCool=.6,!1):(Cn(),this.onToast(`Kein ${Se(t)} im Vorrat`),this.actCool=.4,!1):(this.onToast("Essen braucht man nur im Überlebensmodus"),this.actCool=.6,!1)}wear(t){const e=es(t);if(!e||this.mode==="creative")return;const n=(this.dur[t]||0)+1;if(n<e.dur){this.dur[t]=n;return}delete this.dur[t],this.inv[t]=Math.max(0,(this.inv[t]||0)-1),Cn(),this.onToast(`${Se(t)} ist zerbrochen`)}stationsNear(t=4){const e=new Set,n=this.player,s=this.world;if(!s)return e;const r=Math.floor(n.x),o=Math.floor(n.y),a=Math.floor(n.z);for(let l=o-2;l<=o+3;l++)for(let c=a-t;c<=a+t;c++)for(let h=r-t;h<=r+t;h++){const f=Gt[s.getBlock(h,l,c)];f&&f.station&&e.add(f.station)}return e}updateSignals(){const t=this.world,e=this.player,n=TM(t.sig);let s=!1;this.sigStats=n,this.sigRetry=!1;for(const[r,o]of t.sig){const a=o[3],l=yM[a]??a;if(!Kf[l])continue;const c=n.on.has(r)?Kf[l]:l;if(c===a)continue;if(c===d.GATE&&e.x+.3>o[0]&&e.x-.3<o[0]+1&&e.z+.3>o[2]&&e.z-.3<o[2]+1&&e.y+1.8>o[1]&&e.y<o[1]+1){this.sigRetry=!0;continue}t.setBlock(o[0],o[1],o[2],c),Math.hypot(o[0]-e.x,o[1]-e.y,o[2]-e.z)<24&&!s&&(s=!0,(l===d.GATE?j2:Z2)())}t.sigDirty=!1,n.capped&&this.onToast("Signalnetz zu groß: nicht alles wird berechnet")}fireHook(){if(!this.running||this.ride)return;const t=this.camera,e=new O(0,0,-1).applyEuler(t.rotation),n=Ed(this.world,t.position.x,t.position.y,t.position.z,e.x,e.y,e.z,40);if(!n){Cn(),this.onToast("Seilhaken: kein Ziel in Reichweite");return}this.hookTarget.set(n.x+.5+n.nx*.9,n.y+.5+n.ny*.9,n.z+.5+n.nz*.9),this.hookT=1.6,xn(),this.questEvent("hook",0)}updateHook(t){const e=this.player;if(e.hook=!1,this.hookT<=0){this.rope.visible=!1;return}this.hookT-=t;const n=this.hookTarget,s=n.x-e.x,r=n.y-(e.y+Ec),o=n.z-e.z,a=Math.hypot(s,r,o);if(a<2||this.hookT<=0){this.hookT=0,this.rope.visible=!1,e.vx*=.6,e.vz*=.6,e.vy=Math.max(e.vy*.6,3);return}const l=24/a;e.vx=s*l,e.vy=r*l,e.vz=o*l,e.hook=!0;const c=this.rope.geometry.attributes.position;c.setXYZ(0,e.x+.3,e.y+Ec-.35,e.z),c.setXYZ(1,n.x,n.y,n.z),c.needsUpdate=!0,this.rope.visible=!0}toggleWaypoint(){const t=this.player;this.wp&&Math.hypot(this.wp.x-t.x,this.wp.z-t.z)<4?(this.wp=null,this.onToast("Wegpunkt entfernt")):(this.wp={x:Math.round(t.x),y:Math.round(t.y),z:Math.round(t.z)},this.onToast("Wegpunkt gesetzt")),this.unsaved=!0}updateRadio(){const t=this.player;let e=1e9,n=0;for(const s of this.world.radios.values()){const r=Math.hypot(s[0]+.5-t.x,s[1]+.5-(t.y+1),s[2]+.5-t.z);r<e&&(e=r,n=s[0]*7+s[2]*13+s[1]>>>0)}this.radioDist=e,Ld(e<24?Math.pow(1-e/24,1.5):0,n)}questTick(){const t=this.story;if(!t||t.done)return;const e=yr(t)[t.i];e.k==="height"&&(t.max=Math.max(t.max,this.player.y-this.spawnY)),e.k==="glide"&&this.glideAcc&&(t.p+=this.glideAcc),e.k==="depth"&&this.player.y<e.y&&(t.p=1),e.k==="visit"&&this.world.villageAt(this.player.x,this.player.z)&&(t.p=1),this.glideAcc=0,this.questCheck()}questEvent(t,e,n=1){const s=this.story;if(!s||s.done)return;const r=yr(s)[s.i];if(r.k==="have"){this.questCheck();return}r.k!==t||r.a&&!r.a.includes(e)||(s.p+=n,this.questCheck())}questCheck(){const t=this.story,e=yr(t);for(let n=0;t&&!t.done&&n<e.length;n++){const s=e[t.i],[r,o]=r0(this,s);if(r<o)break;for(const[a,l]of Object.entries(s.r||{}))this.inv[a]=Math.min(en,(this.inv[a]||0)+l);if(t.i++,t.p=0,t.max=0,t.i>=e.length)t.done=!0;else if(e[t.i].k==="visit"){const a=Cp(this.seed,this.player.x,this.player.z,2,this.gen);a&&(this.wp={x:a.x,y:a.y+1,z:a.z})}this.unsaved=!0,J2(),this.onQuestDone(s,t.done),this.onChange()}this.onQuest()}updateHand(t){const e=this.hotbar[this.sel];if(e!==this.handType){if(this.handType=e,this.hand.visible=e>0&&!Qi(e),this.itemHand.visible=Qi(e)&&!!De[e],this.itemHand.visible){const o=De[e].icon,a=this.itemCanvas.height/So,l=o%ns/ns,c=l+1/ns,h=1-Math.floor(o/ns)/a,f=h-1/a,u=this.itemHand.geometry.attributes.uv;u.setXY(0,l,h),u.setXY(1,c,h),u.setXY(2,l,f),u.setXY(3,c,f),u.needsUpdate=!0}if(this.hand.visible){const o=h2(e),a=new ke;a.setAttribute("position",new we(o.pos,3)),a.setAttribute("uv",new we(o.uv,2)),a.setAttribute("aCol",new we(o.col,4)),a.setIndex(new we(o.idx,1)),this.hand.geometry.dispose(),this.hand.geometry=a,this.hand.material=Sl(e)?this.handMatL:this.handMatO}}const n=this.player,s=Math.hypot(n.vx,n.vz)>.5&&n.onGround;if(this.ride){this.hand.visible=this.itemHand.visible=!1,this.handType=-1;return}s&&(this.bob+=t*9),this.swing=Math.max(0,this.swing-t*4.5);const r=Math.sin(this.swing*Math.PI);this.hand.scale.setScalar(.12),this.hand.position.set(.34-r*.06,-.27+Math.sin(this.bob)*.008-r*.06,-.55-r*.04),this.hand.rotation.set(.25-r*.7,-.62,.06),this.itemHand.visible&&(this.itemHand.scale.setScalar(.3),this.itemHand.position.set(.36-r*.05,-.24+Math.sin(this.bob)*.008-r*.05,-.55),this.itemHand.rotation.set(-r*.9,-.35,.2+r*.4))}spawnBreak(t,e,n,s){const r=Gt[s]?Gt[s].color:14540253;for(let o=0;o<10;o++){this.partIdx=((this.partIdx||0)+1)%24;let a=this.parts[this.partIdx];a||(a=new Re(this.partGeo||(this.partGeo=new cs(1,1,1)),new si({color:r})),a.userData={life:0},this.scene.add(a),this.parts[this.partIdx]=a),a.userData.life||this.partCount++,a.material.color.setHex(r),a.position.set(t+.2+Math.random()*.6,e+.2+Math.random()*.6,n+.2+Math.random()*.6),a.userData={life:.55+Math.random()*.3,v:new O((Math.random()-.5)*3,Math.random()*3+1,(Math.random()-.5)*3)},a.scale.setScalar(.1+Math.random()*.08),a.visible=!0}}updateParticles(t){for(const e of this.parts){if(!e||!e.userData.life)continue;const n=e.userData;n.life-=t,n.v.y-=14*t,e.position.addScaledVector(n.v,t),n.life<=0&&(n.life=0,e.visible=!1,this.partCount--)}}applyCamera(){const t=this.player,e=this.camera;e.position.set(t.x,t.y+Ec,t.z),e.rotation.set(this.pitch,this.yaw,0)}breakBlock(){const t=this.target;if(!t||t.y===0)return!1;if(this.world.setBlock(t.x,t.y,t.z,d.AIR)){this.record(t.x,t.y,t.z,t.type,d.AIR);const e=(n,s)=>{this.inv[n]=Math.min(en,(this.inv[n]||0)+s)};if(t0(t.type)){if(this.farm.remove(t.x,t.y,t.z),this.mode!=="creative"){const n=O2(t.type);n.forEach(([s,r])=>e(s,r)),this.onToast(n.map(([s,r])=>`+${r} ${Se(s)}`).join(" · "))}}else this.mode!=="creative"&&e(Gt[t.type].drop||(t.type===d.FARMLAND?d.DIRT:t.type),1);if(this.mode!=="creative"&&(t.type===d.GRASS||t.type===d.FLOWERS)&&Math.random()<.12&&(e(q.SEEDS,1),this.onToast("+1 Weizensamen")),this.survival){const n=this.held();HS(t.type,n)&&this.wear(n),(t.type===d.LEAVES||t.type===d.JLEAVES)&&Math.random()<.08&&(this.inv[q.APPLE]=Math.min(en,(this.inv[q.APPLE]||0)+1),this.onToast("+1 Apfel"))}return this.unsaved=!0,this.swing=1,this.spawnBreak(t.x,t.y,t.z,t.type),bc(),this.onChange(),this.questEvent("break",t.type),!0}return!1}rotateDeco(t=1){const e=this.target;if(!e||Ln[e.type]!==8)return!1;const n=this.world,s=n.getRot(e.x,e.y,e.z)??Zp((r,o,a)=>n.getBlock(r,o,a),e.x,e.y,e.z);return n.setRot(e.x,e.y,e.z,s+t+4&3)?(this.unsaved=!0,this.swing=1,Tc(),this.actCool=.25,this.running||(this.flushDirty(),this.render()),!0):!1}placeBlock(){const t=this.target,e=this.hotbar[this.sel];if(t&&Ln[t.type]===8&&this.input.sneak)return this.placeFirst?this.rotateDeco():!1;const n=this.camera.position,s=this.lookDir,r=this.mobs&&s?this.mobs.raycast(n.x,n.y,n.z,s.x,s.y,s.z,po):null;if(r&&r.mob.npc&&(!t||r.t<t.t))return this.onTrade(r.mob),this.questEvent("talk",0),this.actCool=.5,!1;const o=s?this.vehHit(s):null;if(o&&(!t||o.t<t.t)&&!this.ride)return this.placeFirst&&this.mount(o.veh),!1;if(e&&td(e))return this.placeVehicle(e);if(t&&(t.type===d.SWITCH||t.type===d.SWITCH_ON)){if(!this.placeFirst)return!1;const v=t.type===d.SWITCH?d.SWITCH_ON:d.SWITCH;return this.world.setBlock(t.x,t.y,t.z,v)&&(this.record(t.x,t.y,t.z,t.type,v),this.swing=1,Tc(),this.unsaved=!0,this.onToast(v===d.SWITCH_ON?"Schalter an":"Schalter aus")),!0}if(t&&(t.type===d.DOOR||t.type===d.DOOR_OPEN)&&!(e&&Ln[e]===6&&t.ny===1))return this.placeFirst?(this.toggleDoor(t.x,t.y,t.z),!0):!1;if(t&&e===t.type&&Gt[e].full&&t.ny===1&&(this.mode==="creative"||this.inv[e]>0)){const v=Gt[e].full;if(this.world.setBlock(t.x,t.y,t.z,v))return this.record(t.x,t.y,t.z,t.type,v),this.mode!=="creative"&&this.inv[e]--,this.unsaved=!0,this.swing=1,xn(),this.onChange(),!0}if(t&&this.mode!=="creative"&&Gt[t.type]&&Gt[t.type].station)return this.onStation(Gt[t.type].station),this.actCool=.5,!1;if(e&&oo(e))return this.equip(e);if(e&&Qi(e)){const v=this.held(),m=es(v);return m&&m.kind==="hacke"?this.hoe(v):xc(e)?this.sow(e):ed(e)?this.eat(e):!1}const a=co[this.buildMode];if(a.key!=="einzeln")return this.buildClick(a,t,e);if(!t||!e)return!1;if(this.mode!=="creative"&&!(this.inv[e]>0))return Cn(),this.onToast(`Kein ${No[e]} im Vorrat`),this.actCool=.4,!1;const l=t.x+t.nx,c=t.y+t.ny,h=t.z+t.nz;if(c<0||c>=ie)return!1;const f=this.world.getBlock(l,c,h);if(f!==d.AIR&&f!==d.WATER)return!1;const u=this.player,p=.3;if(u.x+p>l&&u.x-p<l+1&&u.z+p>h&&u.z-p<h+1&&u.y+1.8>c&&u.y<c+1)return!1;const x=Ln[e]===2?dM(e,this.yaw):e;return this.world.setBlock(l,c,h,x)?(Ln[e]===8&&this.world.setRot(l,c,h,Vs[zr[e]].wall&&t.ny===0?Ff(t.nx,t.nz):Ff(Math.sin(this.yaw),Math.cos(this.yaw))),this.record(l,c,h,f,x),this.mode!=="creative"&&this.inv[e]--,this.unsaved=!0,this.swing=1,xn(),this.onChange(),this.questEvent("place",e),!0):!1}toggleDoor(t,e,n){const s=this.world,r=l=>l===d.DOOR||l===d.DOOR_OPEN,o=s.getBlock(t,e,n)===d.DOOR?d.DOOR_OPEN:d.DOOR;let a=e;for(;a>0&&r(s.getBlock(t,a-1,n));)a--;for(let l=a;l<ie&&r(s.getBlock(t,l,n));l++){const c=s.getBlock(t,l,n);c!==o&&s.setBlock(t,l,n,o)&&this.record(t,l,n,c,o)}this.swing=1,this.unsaved=!0,Tc()}selectSlot(t){this.sel=(t%9+9)%9,this.onChange()}cycleBuild(t=1){const e=co.map((s,r)=>r).filter(s=>!co[s].creative||this.mode==="creative"),n=Math.max(0,e.indexOf(this.buildMode));this.buildMode=e[(n+t+e.length)%e.length],this.anchor=null,this.onBuildMode(co[this.buildMode])}buildClick(t,e,n){if(!this.placeFirst)return!1;if(t.creative&&this.mode!=="creative")return this.onToast(`${t.name} gibt es im Kreativmodus`),!0;if(t.key==="einfuegen")return this.clip?e?this.applyCells(C2(this.clip,[e.x+e.nx,e.y+e.ny,e.z+e.nz]),"Eingefügt",!0):!1:(this.onToast("Erst mit „Kopieren“ zwei Ecken wählen"),!0);if(!e)return!1;const s=t.key==="kopieren"?[e.x,e.y,e.z]:[e.x+e.nx,e.y+e.ny,e.z+e.nz];if(!this.anchor)return this.anchor=s,this.onToast(`${t.name}: erste Ecke gesetzt, jetzt die zweite wählen`),xn(),!0;const r=this.anchor;if(this.anchor=null,t.key==="kopieren"){const l=R2(this.world,r,s);return l?(this.clip=l,xn(),this.onToast(`${l.n} Blöcke kopiert (${l.sx}×${l.sy}×${l.sz}), jetzt „Einfügen“ wählen`),!0):(Cn(),this.onToast("Zu groß zum Kopieren (höchstens 32 768 Blöcke)"),!0)}if(!n||Qi(n))return this.onToast("Wähle einen Block in der Hotbar"),!0;const o=this.mode==="creative"?Ah.creative:Ah.survival,a=w2(t.key,r,s,o);return a?this.applyCells(a.map(l=>[l[0],l[1],l[2],n]),t.name,!1):(Cn(),this.onToast(`Zu groß: höchstens ${o} Blöcke auf einmal`),!0)}applyCells(t,e,n){const s=this.mode==="creative",r=this.player,o=.3;let a=0,l=!1;this.beginBatch();for(const[c,h,f,u]of t){if(h<=0||h>=ie)continue;if(!s&&!(this.inv[u]>0)){l=!0;continue}const p=this.world.getBlock(c,h,f);p===u||!(n&&s)&&p!==d.AIR&&p!==d.WATER||Gt[u].solid&&r.x+o>c&&r.x-o<c+1&&r.z+o>f&&r.z-o<f+1&&r.y+1.8>h&&r.y<h+1||this.world.setBlock(c,h,f,u)&&(this.record(c,h,f,p,u),s||this.inv[u]--,a++,this.questEvent("place",u))}return this.endBatch(),a&&(this.unsaved=!0,this.swing=1,xn(),this.onChange()),this.onToast(a?`${e}: ${a} Blöcke${l?" (Vorrat reichte nicht)":""}`:l?"Nicht genug im Vorrat":"Nichts zu setzen"),!0}updateGhost(){const t=this.ghost,e=this.target,n=co[this.buildMode],s=this.hotbar[this.sel];let r=null;if(e&&!this.dead&&(this.preview||n.key!=="einzeln")){const o=[e.x+e.nx,e.y+e.ny,e.z+e.nz];if(n.key==="einfuegen")this.clip&&(r=[...o,o[0]+this.clip.sx-1,o[1]+this.clip.sy-1,o[2]+this.clip.sz-1]);else if(n.key==="kopieren"){const a=[e.x,e.y,e.z];r=this.anchor?wh(this.anchor,a):[...a,...a]}else s&&!Qi(s)&&!(this.mode!=="creative"&&Gt[e.type]&&Gt[e.type].station)&&(r=this.anchor?wh(this.anchor,o):[...o,...o])}if(!r){t.visible=!1;return}t.position.set((r[0]+r[3]+1)/2,(r[1]+r[4]+1)/2,(r[2]+r[5]+1)/2),t.scale.set(r[3]-r[0]+1,r[4]-r[1]+1,r[5]-r[2]+1),t.visible=!0}vehHit(t){if(!this.vehicles||!this.vehicles.list.length)return null;const e=this.camera.position,n=this.vehicles.raycast(e.x,e.y,e.z,t.x,t.y,t.z,po);return n&&n.veh!==this.ride?n:null}placeVehicle(t){if(!this.placeFirst)return!1;const e=td(t),n=ll[e],s=this.target,r=this.lookDir,o=this.camera.position;if(this.mode!=="creative"&&!(this.inv[t]>0))return Cn(),this.onToast(`Kein ${n.name} im Vorrat`),!1;let a=null;if(e==="boot"){for(let c=.5;c<=po&&!a;c+=.25){const h=Math.floor(o.x+r.x*c),f=Math.floor(o.y+r.y*c),u=Math.floor(o.z+r.z*c);if(s&&c>s.t)break;if(this.world.getBlock(h,f,u)===d.WATER){const p=this.vehicles.waterTop(h+.5,f,u+.5);p!==null&&(a=[h+.5,p-.3,u+.5])}}!a&&s&&s.ny===1&&(a=[s.x+.5,s.y+1.001,s.z+.5])}else s&&s.type===d.RAIL?a=[s.x+.5,s.y,s.z+.5]:s&&s.ny===1&&this.world.getBlock(s.x,s.y+1,s.z)===d.RAIL&&(a=[s.x+.5,s.y+1,s.z+.5]);return a?this.vehicles.boxHits({K:n},a[0],a[1]+.05,a[2])?(Cn(),this.onToast("Kein Platz für das Fahrzeug"),!1):this.vehicles.add(e,a[0],a[1],a[2],this.yaw)?(this.mode!=="creative"&&this.inv[t]--,this.swing=1,xn(),this.unsaved=!0,this.onChange(),this.onToast(`${n.name} gesetzt · Setzen = einsteigen, Abbauen = einpacken`),!0):(Cn(),this.onToast(e==="lore"?"Die Lore braucht eine Schiene":"Zu viele Fahrzeuge in dieser Welt"),!1):(Cn(),this.onToast(e==="boot"?"Boot: aufs Wasser oder auf den Boden zielen":"Die Lore braucht eine Schiene"),this.actCool=.5,!1)}pickVehicle(t){this.vehicles.remove(t),this.spawnBreak(t.x-.5,t.y,t.z-.5,t.kind==="boot"?d.PLANKS:d.STONE),bc(),this.mode!=="creative"&&(this.inv[t.K.item]=Math.min(en,(this.inv[t.K.item]||0)+1),this.onToast(`+1 ${t.K.name}`)),this.unsaved=!0,this.onChange()}mount(t){const e=this.player;this.ride=t,t.rider=!0,e.flying=!1,e.vx=e.vy=e.vz=0,e.eyeWater=!1,e.impact=0,this.hookT=0,this.rope.visible=!1,this.prevJump=!0,t.kind==="lore"&&(this.yaw=t.yaw),this.seatPlayer(),xn(),this.onToast(t.kind==="boot"?"Im Boot: vor/zurück = paddeln, links/rechts = lenken, Springen = aussteigen":"In der Lore: vor = anschieben (in Blickrichtung), zurück = bremsen, Springen = aussteigen"),this.onRide(!0)}dismount(){const t=this.ride,e=this.player;if(!t)return;this.ride=null,t.rider=!1;const[n,s,r]=this.vehicles.exitSpot(t,(o,a,l)=>e.collides(this.world,o,a,l));e.x=n,e.y=s,e.z=r,e.vx=e.vy=e.vz=0,e.onGround=!1,this.onRide(!1)}seatPlayer(){const t=this.ride,e=this.player;e.x=t.x,e.y=t.y+t.K.seat-.4,e.z=t.z}rideStep(){const t=this.input.jump;t&&!this.prevJump&&this.dismount(),this.prevJump=t}equip(t){const e=oo(t),n=this.mode==="creative";if(!n&&!(this.inv[t]>0))return Cn(),this.onToast(`Kein ${Se(t)} im Vorrat`),this.actCool=.4,!1;const s=this.armor[e.slot];return s===t?(this.onToast(`${Se(t)} trägst du schon`),this.actCool=.6,!1):(n||(this.inv[t]--,s&&(this.inv[s]=Math.min(en,(this.inv[s]||0)+1))),this.armor[e.slot]=t,this.armWear[e.slot]=0,this.swing=1,xn(),this.unsaved=!0,this.onToast(`${Se(t)} angelegt · Schutz ${this.armorPoints()*5} %`),this.onChange(),this.onVitals(),!0)}armorPoints(){let t=0;for(const e of["kopf","brust"]){const n=oo(this.armor[e]);n&&(t+=n.pts)}return t}wearArmor(){if(this.mode!=="creative")for(const t of["kopf","brust"]){const e=this.armor[t],n=oo(e);n&&++this.armWear[t]>=n.dur&&(this.armor[t]=0,this.armWear[t]=0,this.onToast(`${Se(e)} ist zerbrochen`))}}areaReady(t){const e=Math.floor(this.player.x/I),n=Math.floor(this.player.z/I);let s=0,r=0;for(const[o,a,l]of this.offsets){if(l>t)continue;s++;const c=this.world.getChunk(e+o,n+a);c&&c.meshed&&r++}return s?r/s:1}stream(){const t=Math.floor(this.player.x/I),e=Math.floor(this.player.z/I);if(!this.lastPC||this.lastPC[0]!==t||this.lastPC[1]!==e){this.lastPC=[t,e],this.scanDirty=!0;const h=this.viewDist+3.5;for(const[f,u]of this.world.chunks)Math.hypot(u.cx-t,u.cz-e)>h&&(this.dropMesh(u),this.world.chunks.delete(f))}if(!this.scanDirty)return;const s=performance.now(),r=this.viewDist+.5,o=-Math.sin(this.yaw),a=-Math.cos(this.yaw);let l=!1,c=0;t:for(let h=0;h<2;h++)for(const[f,u,p]of this.offsets){const x=p<2.5||f*o+u*a>-.3*p;if(h===0!==x)continue;let v=this.world.getChunk(t+f,e+u);const m=p<=r&&(!v||!v.meshed);if(!(v&&!m)){if(c>0&&performance.now()-s>this.budget){l=!0;break t}if(v||(v=this.world.ensure(t+f,e+u),c++,l=!0),m){const g=this.requestMesh(v);g===!0?(c++,l=!0):g==="wait"&&(l=!0)}}}l||(this.scanDirty=!1)}flushDirty(){const t=this.world;if(t.dirty.size){for(const e of t.dirty)e.meshed&&t.chunks.get(e.key)===e&&this.applyMesh(e);t.dirty.clear()}}dropMesh(t){this.deco.drop(t);for(const e of["opaque","trans","logo"])t[e]&&(this.group.remove(t[e]),t[e].geometry.dispose(),t[e]=null)}requestMesh(t){if(!this.mw)return this.applyMesh(t);if(t.pending||this.mwJobs>=4)return"wait";const e=Qp(this.world,t);if(!e)return!1;const n=e.nb.map(r=>r.slice()),s=e.hms.map(r=>r.slice());return t.pending=t.ver=++this.meshSeq,this.mwJobs++,this.mw.postMessage({key:t.key,ver:t.ver,nb:n,hms:s,maxY:e.maxY,rot:e.rot},n.map(r=>r.buffer)),!0}onMeshed({key:t,ver:e,r:n}){this.mwJobs=Math.max(0,this.mwJobs-1);const s=this.world&&this.world.chunks.get(t);!s||s.ver!==e||s.pending!==e||(s.pending=0,this.setPart(s,"opaque",n.opaque,this.matO),this.setPart(s,"trans",n.trans,this.matT),this.setPart(s,"logo",n.logo,this.matL),this.deco.setChunk(s,n.deco),s.meshed=!0,this.scanDirty=!0,!this.running&&this.world&&this.render())}applyMesh(t){const e=i2(this.world,t);return e?(t.ver=++this.meshSeq,t.pending=0,this.setPart(t,"opaque",e.opaque,this.matO),this.setPart(t,"trans",e.trans,this.matT),this.setPart(t,"logo",e.logo,this.matL),this.deco.setChunk(t,e.deco),t.meshed=!0,!0):!1}setPart(t,e,n,s){let r=t[e];if(!n){r&&(this.group.remove(r),r.geometry.dispose(),t[e]=null);return}const o=new ke;if(o.setAttribute("position",new we(n.pos,3)),o.setAttribute("uv",new we(n.uv,2)),o.setAttribute("aCol",new we(n.col,4)),o.setIndex(new we(n.idx,1)),o.boundingSphere=new fs(new O(I/2,ie/2,I/2),this.chunkSphereR),r){r.geometry.dispose(),r.geometry=o;return}r=new Re(o,s),s!==this.matT&&(r.layers.enable(ru),r.userData.atlas=s===this.matO),r.position.set(t.cx*I,0,t.cz*I),r.matrixAutoUpdate=!1,r.updateMatrix(),this.group.add(r),t[e]=r}updateSky(){const t=this.time*Math.PI*2,e=Math.sin(t),n=Math.cos(t),s=Ua(-.12,.28,e),r=Math.max(0,1-Math.abs(e)/.3);let o=ji([.04,.06,.14],[.68,.84,.95],s);o=ji(o,[.97,.56,.36],r*.55);let a=ji([.012,.02,.07],[.24,.5,.88],s);a=ji(a,[.34,.3,.52],r*.4);const l=e>=0,c=l?Ua(-.02,.3,e):Ua(-.02,.3,-e)*.3,h=this.uni.uSunDir.value;l?h.set(n,e,.25):h.set(-n,-e,.25),h.normalize();const f=l?ji([1,.6,.36],[1,.95,.84],Ua(0,.4,e)).map(M=>M*.8*c):[.42*c,.52*c,.85*c];this.uni.uSunCol.value.set(f[0],f[1],f[2]);const u=ji([.17,.21,.36],[.38,.45,.6],s);this.light=.38+.62*s,this.uni.uAmb.value.set(u[0]+r*.12,u[1]+r*.06,u[2]+r*.02);const p=this.camera.position,x=this.world.getBlock(Math.floor(p.x),Math.floor(p.y),Math.floor(p.z))===d.WATER;this.underwater=x;const v=this.viewDist*I-6;if(x){const M=ji([.04,.12,.26],[.12,.38,.66],s);this.uni.uFog.value.set(M[0],M[1],M[2]),this.uni.uFogRange.value.set(.5,24),this.domeU.uHor.value.set(M[0],M[1],M[2]),this.domeU.uZen.value.set(M[0],M[1],M[2]),this.domeU.uGlow.value.set(0,0,0)}else{this.uni.uFog.value.set(o[0],o[1],o[2]),this.uni.uFogRange.value.set(v*.4,v),this.domeU.uHor.value.set(o[0],o[1],o[2]),this.domeU.uZen.value.set(a[0],a[1],a[2]);const M=.9*r+.1*s;this.domeU.uGlow.value.set(.95*M,.62*M,.4*M)}this.domeU.uSunN.value.set(n,e,.25).normalize(),this.sky.position.copy(p);const m=this.domeU.uSunN.value;this.sun.position.copy(m).multiplyScalar(500),this.sun.lookAt(p),this.moon.position.copy(m).multiplyScalar(-500),this.moon.lookAt(p),this.sun.visible=e>-.25&&!x,this.moon.visible=e<.25&&!x,this.starMat.opacity=Math.max(0,Math.min(1,(.12-e)*3))*(x?0:1),this.stars.rotation.z=t,this.clouds.position.set(p.x,105,p.z);const g=ji([.2,.23,.36],[1,1,1],s);this.cloudU.uCol.value.set(g[0]+r*0,g[1]-r*.18,g[2]-r*.3),this.clouds.visible=!x&&this.cloudsOn&&!this.vcloudsOn,this.vclouds.update(p,this.uni.uTime.value,[g[0],g[1]-r*.18,g[2]-r*.3],!x&&this.cloudsOn&&this.vcloudsOn);const _=x?0:.35*s+.5*r;this.uni.uFogSun.value.set(1*_,.78*_,.55*_)}render(){this.world&&this.shadows.update(this.renderer,this.scene,this.group,this.camera.position,this.uni.uSunDir.value,!this.running),this.postOn&&this.post?this.post.render():this.renderer.render(this.scene,this.camera)}biomeName(){const t=this.world?this.world.biomeAt(this.player.x,this.player.z):-1;return t>=0?gM[t]:""}clockText(){const t=Math.floor((this.time*24+6)%24*60);return String(Math.floor(t/60)).padStart(2,"0")+":"+String(t%60).padStart(2,"0")}}const o0={bauer:[{give:[q.APPLE,4],need:[[q.WHEAT,4]]},{give:[q.SEEDS,6],need:[[q.BREAD,1]]},{give:[q.BREAD,2],need:[[d.WOOD,3]]},{give:[q.COPPER_INGOT,1],need:[[q.WHEAT,10]]}],schmied:[{give:[q.IRON_INGOT,1],need:[[d.COAL,6]]},{give:[q.STONE_PICK,1],need:[[q.WHEAT,4]]},{give:[q.COPPER_HELMET,1],need:[[q.COPPER_INGOT,3],[q.BREAD,2]]},{give:[q.IRON_PICK,1],need:[[d.CRYSTAL,2],[q.WHEAT,8]]}],funker:[{give:[d.RADIO,1],need:[[q.COPPER_INGOT,2]]},{give:[d.LAMP,4],need:[[q.WHEAT,6]]},{give:[d.SWITCH,2],need:[[q.BREAD,1]]},{give:[d.CRYSTAL,1],need:[[q.IRON_INGOT,3]]}],hirte:[{give:[d.WOOL,4],need:[[q.WHEAT,4]]},{give:[q.MEAT_COOKED,3],need:[[q.WHEAT,5]]},{give:[q.MEAT_RAW,4],need:[[q.APPLE,3]]}]},my={bauer:"Die Felder geben gut her. Weizen tausche ich gern!",schmied:"Kohle und Barren sind mir am liebsten. Ich mache dir gutes Werkzeug.",funker:"Seit dem großen Rauschen ist unser Mast stumm. Bring mir Kupfer, dann reden wir über Funk.",hirte:"Meine Schafe geben Wolle. Für Weizen bekommst du welche."},a0=3,Dd=4,gy=9,vy=16e3,xy=60,Pd={survival:[64,32],creative:[8192,2e3]},_y=new Set([d.SWITCH_ON,d.WHEAT0,d.FARMLAND]),Ao=i=>typeof i=="number"&&Number.isFinite(i),Qn=i=>Number.isInteger(i),l0=i=>(typeof i=="string"?i.replace(/[^\p{L}\p{N} _.-]/gu,"").trim().slice(0,16):"")||"Gast";function c0(i){if(typeof i!="string"||i.length>4e6)return null;try{const t=JSON.parse(i);return t&&typeof t=="object"&&typeof t.k=="string"?t:null}catch{return null}}function My(i,t=vy){const e=[];for(let n=0;n<i.length;n+=t)e.push(i.slice(n,n+t));return e.length?e:[""]}const Sy=i=>Gt[i]&&Gt[i].drop||i;class yy{constructor(t){this.env=t,this.peers=new Map,this.nextId=1,this.blocks=[],this.t=0,this.mobT=0}addPeer(t){return{id:0,name:"",send:t,token:null,pos:null,posT:0,bucket:0,bucketT:0,joined:!1}}get guests(){return[...this.peers.values()]}sendTo(t,e){try{t.send(JSON.stringify(e))}catch{}}broadcast(t,e){const n=JSON.stringify(t);for(const s of this.peers.values())if(s!==e)try{s.send(n)}catch{}}receive(t,e){const n=c0(e);if(n){if(!t.joined){n.k==="hello"&&this.hello(t,n);return}if(n.tk===t.token){if(n.k==="pos")this.onPos(t,n);else if(n.k==="sets")this.onSets(t,n);else if(n.k==="hit"&&Qn(n.id)&&Ao(n.dmg)){const s=this.env.onHit(t,n.id,Math.max(0,Math.min(10,n.dmg)));s&&s.length&&this.sendTo(t,{k:"drops",list:s})}}}}hello(t,e){if(e.v!==a0){this.sendTo(t,{k:"bye",why:"Andere Spielversion – bitte beide die Seite neu laden."});return}if(this.peers.size>=Dd){this.sendTo(t,{k:"bye",why:`Die Welt ist voll (höchstens ${Dd} Gäste).`});return}t.id=this.nextId++,t.name=l0(e.name),t.joined=!0,t.token=Math.random().toString(36).slice(2,12)+Date.now().toString(36);const n=this.env.info(),s=JSON.stringify(n.edits||{}),r=My(s);t.pos={x:n.pos.x,y:n.pos.y,z:n.pos.z,yaw:0,pitch:0},t.posT=this.env.now(),t.bucket=Pd[n.mode==="creative"?"creative":"survival"][0],t.bucketT=this.env.now(),this.sendTo(t,{k:"welcome",id:t.id,tk:t.token,seed:n.seed,gen:n.gen,preset:n.preset,terrain:n.terrain,mode:n.mode,time:n.time,pos:n.pos,host:n.name,parts:r.length}),r.forEach((o,a)=>this.sendTo(t,{k:"part",i:a,s:o})),this.sendTo(t,{k:"pp",id:0,name:n.name,...n.pos});for(const o of this.peers.values())this.sendTo(t,{k:"pp",id:o.id,name:o.name,...o.pos}),this.sendTo(o,{k:"pp",id:t.id,name:t.name,...t.pos});this.peers.set(t.id,t),this.env.onJoin(t)}close(t){this.peers.has(t.id)&&(this.peers.delete(t.id),this.broadcast({k:"left",id:t.id}),this.env.onLeave(t))}kick(t,e){this.sendTo(t,{k:"bye",why:e}),this.close(t)}onPos(t,e){if(![e.x,e.y,e.z,e.yaw,e.pitch].every(Ao)||e.y<-10||e.y>ie+60)return;const n=this.env.now(),s=Math.max(.05,(n-t.posT)/1e3);Math.hypot(e.x-t.pos.x,e.y-t.pos.y,e.z-t.pos.z)>xy*s+4||(t.pos={x:e.x,y:e.y,z:e.z,yaw:e.yaw,pitch:e.pitch},t.posT=n,this.broadcast({k:"pp",id:t.id,x:e.x,y:e.y,z:e.z,yaw:e.yaw},t))}onSets(t,e){if(!Array.isArray(e.list)||!Qn(e.r))return;const n=this.env.world,s=this.env.info().mode,[r,o]=Pd[s==="creative"?"creative":"survival"],a=this.env.now();t.bucket=Math.min(r,t.bucket+(a-t.bucketT)/1e3*o),t.bucketT=a;const l=[],c=t.pos;e.list.forEach((h,f)=>{if(!Array.isArray(h)||h.length!==5||!h.every(Qn)){l.push([f,-1]);return}const[u,p,x,v,m]=h;if(p<1||p>=ie||!Gt[m]||!Gt[v]){l.push([f,-1]);return}if(s!=="creative"&&m&&!Gt[m].inv&&!_y.has(m)){l.push([f,-1]);return}n.ensure&&n.ensure(u>>4,x>>4);const g=n.getBlock(u,p,x);if(Math.hypot(u+.5-c.x,p+.5-(c.y+1.6),x+.5-c.z)>(s==="creative"?200:gy)||t.bucket<1||g!==v){l.push([f,g]);return}t.bucket--,n.setBlock(u,p,x,m),Gt[m].shape==="cross"&&v===0&&this.env.onPlant(u,p,x)}),this.sendTo(t,{k:"ack",r:e.r,bad:l})}queueBlock(t,e,n,s){this.blocks.push([t,e,n,s])}hurt(t,e,n,s){const r=this.peers.get(t);r&&this.sendTo(r,{k:"hurt",dmg:e,cause:n,from:s})}tick(t,e,n,s){if(!this.peers.size){this.blocks.length=0;return}if(this.blocks.length&&(this.broadcast({k:"bs",list:this.blocks}),this.blocks=[]),this.t-=t,this.mobT-=t,this.t<=0&&(this.t=.1,this.broadcast({k:"pp",id:0,x:e.x,y:e.y,z:e.z,yaw:e.yaw}),(this.tt=(this.tt||0)+1)%10===0&&this.broadcast({k:"time",t:n})),this.mobT<=0&&s){this.mobT=.2;for(const r of this.peers.values()){const o=[];for(const a of s)Math.hypot(a.x-r.pos.x,a.z-r.pos.z)<64&&o.push(Ey(a));this.sendTo(r,{k:"mobs",list:o})}}}}const Ey=i=>[i.id,i.type,+i.x.toFixed(2),+i.y.toFixed(2),+i.z.toFixed(2),+i.yaw.toFixed(2),i.hurtT>0?1:0,i.moving?1:0,i.npc&&i.role||"",i.npc&&i.name||""];class by{constructor(t,e,n){this.env=t,this.send=e,this.name=l0(n),this.token=null,this.id=0,this.welcome=null,this.parts=null,this.r=0,this.pending=new Map,this.out=[]}hello(){this.send(JSON.stringify({k:"hello",v:a0,name:this.name}))}post(t){this.token&&this.send(JSON.stringify({...t,tk:this.token}))}receive(t){const e=c0(t);if(e)switch(e.k){case"welcome":if(this.token||!Qn(e.parts)||e.parts<1)return;this.welcome=e,this.parts=new Array(e.parts),this.got=0,this.token=e.tk,this.id=e.id;return;case"part":{if(!this.parts||!Qn(e.i)||e.i<0||e.i>=this.parts.length||this.parts[e.i]!==void 0||typeof e.s!="string"||(this.parts[e.i]=e.s,++this.got<this.parts.length))return;let n={};try{n=JSON.parse(this.parts.join(""))}catch{this.env.onBye("Weltdaten beschädigt");return}const s=this.welcome;this.parts=null,this.env.onWelcome({seed:s.seed,gen:s.gen,preset:typeof s.preset=="string"?s.preset:void 0,terrain:typeof s.terrain=="string"?s.terrain:void 0,mode:s.mode,time:s.time,pos:s.pos,host:s.host,edits:n,id:s.id});return}case"bs":Array.isArray(e.list)&&this.env.onBlocks(e.list.filter(n=>Array.isArray(n)&&n.length===4&&n.every(Qn)));return;case"pp":Qn(e.id)&&e.id!==this.id&&[e.x,e.y,e.z].every(Ao)&&this.env.onPlayer(e.id,e);return;case"left":Qn(e.id)&&this.env.onLeft(e.id);return;case"mobs":Array.isArray(e.list)&&this.env.onMobs(e.list);return;case"hurt":Ao(e.dmg)&&this.env.onHurt(e);return;case"drops":Array.isArray(e.list)&&this.env.onDrops(e.list.filter(n=>Array.isArray(n)&&Qn(n[0])&&Qn(n[1])&&n[1]>0&&n[1]<100));return;case"time":Ao(e.t)&&this.env.onTime(e.t);return;case"ack":{const n=this.pending.get(e.r);if(!n)return;this.pending.delete(e.r);const s=Array.isArray(e.bad)?e.bad.filter(r=>Array.isArray(r)&&Qn(r[0])&&n[r[0]]).map(r=>[...n[r[0]],r[1]]):[];s.length&&this.env.onReject(s);return}case"bye":this.env.onBye(typeof e.why=="string"?e.why.slice(0,120):"Verbindung beendet");return}}local(t,e,n,s,r){this.out.push([t,e,n,s,r])}flush(){if(!this.out.length||!this.token)return;const t=++this.r;for(let e=0;e<this.out.length;e+=4096){const n=this.out.slice(e,e+4096),s=e?++this.r:t;this.pending.set(s,n),this.post({k:"sets",r:s,list:n})}this.out=[]}pos(t){this.post({k:"pos",x:+t.x.toFixed(2),y:+t.y.toFixed(2),z:+t.z.toFixed(2),yaw:+t.yaw.toFixed(2),pitch:+t.pitch.toFixed(2)})}hit(t,e){this.post({k:"hit",id:t,dmg:e})}}const h0=[{urls:"stun:stun.l.google.com:19302"}],wo="KF1.";function u0(i){return i.iceGatheringState==="complete"?Promise.resolve():new Promise(t=>{const e=setTimeout(t,5e3);i.addEventListener("icegatheringstatechange",()=>{i.iceGatheringState==="complete"&&(clearTimeout(e),t())})})}const Nd=i=>{let t="";for(let e=0;e<i.length;e+=8192)t+=String.fromCharCode.apply(null,i.subarray(e,e+8192));return btoa(t).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")},Ty=i=>{const t=atob(i.replace(/-/g,"+").replace(/_/g,"/")),e=new Uint8Array(t.length);for(let n=0;n<t.length;n++)e[n]=t.charCodeAt(n);return e};async function f0(i,t){return new Uint8Array(await new Response(new Blob([i]).stream().pipeThrough(t)).arrayBuffer())}async function d0(i){const t=new TextEncoder().encode(JSON.stringify(i));return typeof CompressionStream<"u"?wo+"z"+Nd(await f0(t,new CompressionStream("deflate-raw"))):wo+"j"+Nd(t)}async function p0(i){const t=String(i||"").replace(/\s+/g,"");if(!t.startsWith(wo))throw new Error("Das ist kein KlotzFunk-Code");let e=Ty(t.slice(wo.length+1));if(t[wo.length]==="z"){if(typeof DecompressionStream>"u")throw new Error("Dieser Browser kann den Code nicht entpacken");e=await f0(e,new DecompressionStream("deflate-raw"))}return JSON.parse(new TextDecoder().decode(e))}async function Ay(i,t){const e=new RTCPeerConnection({iceServers:i?h0:[]}),n=e.createDataChannel("klotzfunk",{ordered:!0});n.onopen=()=>t(n,e),await e.setLocalDescription(await e.createOffer()),await u0(e);const s=await d0({t:"o",sdp:e.localDescription.sdp});return{pc:e,dc:n,code:s,async accept(r){const o=await p0(r);if(o.t!=="a"||typeof o.sdp!="string")throw new Error("Das ist kein Antwort-Code");await e.setRemoteDescription({type:"answer",sdp:o.sdp})}}}async function wy(i,t,e){const n=await p0(i);if(n.t!=="o"||typeof n.sdp!="string")throw new Error("Das ist kein Einladungs-Code");const s=new RTCPeerConnection({iceServers:t?h0:[]});return s.ondatachannel=r=>{const o=r.channel;o.readyState==="open"?e(o,s):o.onopen=()=>e(o,s)},await s.setRemoteDescription({type:"offer",sdp:n.sdp}),await s.setLocalDescription(await s.createAnswer()),await u0(s),{pc:s,code:await d0({t:"a",sdp:s.localDescription.sdp})}}const Id=[3836632,14178874,3848298,13150266,10115800],Ry=i=>[[-.22,0,-.12,-.02,.75,.12,2767450],[.02,0,-.12,.22,.75,.12,2767450],[-.28,.75,-.16,.28,1.4,.16,i],[-.4,.8,-.1,-.28,1.38,.1,i],[.28,.8,-.1,.4,1.38,.1,i],[-.22,1.4,-.22,.22,1.84,.22,15253658],[-.24,1.76,-.24,.24,1.9,.24,4863008],[-.13,1.6,-.24,-.05,1.66,-.22,2105376],[.05,1.6,-.24,.13,1.66,-.22,2105376]];function Cy(i){const t=document.createElement("canvas");t.width=256,t.height=64;const e=t.getContext("2d");e.font="bold 34px system-ui, sans-serif",e.textAlign="center",e.textBaseline="middle";const n=Math.min(250,e.measureText(i).width+28);e.fillStyle="rgba(10,14,30,.62)",e.fillRect(128-n/2,6,n,52),e.fillStyle="#fff",e.fillText(i,128,33);const s=new Xa(t),r=new Q_(new gp({map:s,depthTest:!1,transparent:!0}));return r.scale.set(1.6,.4,1),r.position.y=2.25,r.renderOrder=30,r}class Ly{constructor(t){this.group=new ii,t.add(this.group),this.list=new Map,this.geos=Id.map(e=>vr(Ry(e)))}set(t,e){let n=this.list.get(t);if(!n){const s=new si({vertexColors:!0}),r=new ii;r.add(new Re(this.geos[t%Id.length],s)),n={root:r,mat:s,name:"",tag:null,x:e.x,y:e.y,z:e.z,yaw:e.yaw||0,tx:e.x,ty:e.y,tz:e.z,tyaw:e.yaw||0},this.group.add(r),this.list.set(t,n)}e.name&&e.name!==n.name&&(n.name=e.name,n.tag&&(n.root.remove(n.tag),n.tag.material.map.dispose(),n.tag.material.dispose()),n.tag=Cy(e.name),n.root.add(n.tag)),n.tx=e.x,n.ty=e.y,n.tz=e.z,Number.isFinite(e.yaw)&&(n.tyaw=e.yaw)}remove(t){const e=this.list.get(t);e&&(this.group.remove(e.root),e.mat.dispose(),e.tag&&(e.tag.material.map.dispose(),e.tag.material.dispose()),this.list.delete(t))}clear(){for(const t of[...this.list.keys()])this.remove(t)}update(t,e){const n=Math.min(1,t*12);for(const s of this.list.values()){Math.hypot(s.tx-s.x,s.tz-s.z)>20&&(s.x=s.tx,s.y=s.ty,s.z=s.tz),s.x+=(s.tx-s.x)*n,s.y+=(s.ty-s.y)*n,s.z+=(s.tz-s.z)*n;let r=s.tyaw-s.yaw;r=Math.atan2(Math.sin(r),Math.cos(r)),s.yaw+=r*n,s.root.position.set(s.x,s.y,s.z),s.root.rotation.y=s.yaw,s.mat.color.setRGB(e,e,e)}}}class Rc{constructor(t){this.view=t,this.list=[],this.byId=new Map,this.enabled=!1}set(t){const e=new Set;for(const n of t){const[s,r,o,a,l,c,h,f,u,p]=n;if(!Number.isInteger(s)||!zo[r]||![o,a,l,c].every(Number.isFinite))continue;e.add(s);let x=this.byId.get(s);if(!x){const v=zo[r];x={id:s,type:r,T:v,x:o,y:a,z:l,yaw:c,hurtT:0,moving:!1,hostile:!!v.hostile,npc:!!v.npc,role:u||"",name:p||v.name},this.byId.set(s,x),this.list.push(x),this.view.add(x)}Object.assign(x,{x:o,y:a,z:l,yaw:c,moving:!!f}),h&&(x.hurtT=.2)}for(const n of this.list.slice())e.has(n.id)||this.removeMob(n)}removeMob(t){this.byId.delete(t.id),this.list.splice(this.list.indexOf(t),1),this.view.remove(t)}update(t){for(const e of this.list)e.hurtT=Math.max(0,e.hurtT-t)}raycast(t,e,n,s,r,o,a){let l=null,c=a;for(const h of this.list){const f=h.T.half,u=[h.x-f,h.y,h.z-f],p=[h.x+f,h.y+h.T.h,h.z+f],x=[t,e,n],v=[s,r,o];let m=0,g=c;for(let _=0;_<3&&m<=g;_++){if(Math.abs(v[_])<1e-9){(x[_]<u[_]||x[_]>p[_])&&(m=1/0);continue}let M=(u[_]-x[_])/v[_],S=(p[_]-x[_])/v[_];M>S&&([M,S]=[S,M]),m=Math.max(m,M),g=Math.min(g,S)}m<=g&&m<c&&(c=m,l=h)}return l?{mob:l,t:c}:null}remove(t){this.byId.has(t.id)&&this.removeMob(t)}clear(){for(const t of this.list.slice())this.removeMob(t)}serialize(){}hostileCount(){return 0}}class Dy{constructor(t,e){this.game=t,this.ui=e,this.avatars=new Ly(t.scene),this.host=null,this.guest=null,this.conns=new Set,this.posT=0,this.useStun=!0}get active(){return!!(this.host||this.guest)}open(){const t=this.game;this.host||(this.host=new yy({world:t.world,now:()=>performance.now(),info:()=>({seed:t.seed,gen:t.gen,preset:t.preset||void 0,terrain:t.terrain||void 0,mode:t.mode,time:t.time,edits:Hp(t.world.edits),pos:{x:t.player.x,y:t.player.y,z:t.player.z},name:this.myName||"Gastgeber"}),onPlant:(e,n,s)=>t.farm.plant(e,n,s,t.age),onHit:(e,n,s)=>this.hostHit(e,n,s),onJoin:e=>{this.ui.toast(`${e.name} ist in deiner Welt`),this.avatars.set(e.id,{...e.pos,name:e.name}),this.listPlayers()},onLeave:e=>{this.ui.toast(`${e.name} hat die Welt verlassen`),this.avatars.remove(e.id),this.listPlayers()}}),t.world.onSet=(e,n,s,r)=>this.host&&this.host.queueBlock(e,n,s,r),t.mp=this,t.running||t.resume())}async invite(){this.open();let t=null;const e=await Ay(this.useStun,n=>{t=this.host.addPeer(s=>n.send(s)),t.dc=n,t.pc=e.pc,this.conns.add(e.pc),n.onmessage=s=>this.host.receive(t,s.data),n.onclose=()=>{this.host&&this.host.close(t),this.conns.delete(e.pc)}});return e.pc.onconnectionstatechange=()=>{["failed","closed"].includes(e.pc.connectionState)&&t&&this.host&&this.host.close(t)},e}hostHit(t,e,n){const s=this.game,r=s.mobs&&s.mobs.list.find(o=>o.id===e);return!r||r.npc||Math.hypot(r.x-t.pos.x,r.z-t.pos.z)>8||!r.hit(n,t.pos.x,t.pos.z)?null:(s.spawnBreak(r.x-.5,r.y,r.z-.5,60),s.mobs.remove(r,!1),s.unsaved=!0,s.mode==="creative"?null:e0(r.type))}others(){return this.host?this.host.guests.map(t=>({id:t.id,x:t.pos.x,y:t.pos.y,z:t.pos.z})):null}hurtGuest(t){const e=this.host&&this.host.peers.get(t.target);e&&this.host.hurt(e.id,t.T.dmg,t.T.name,[t.x,t.y+.3,t.z,t.T.range?1:0])}kick(t){const e=this.host&&this.host.peers.get(t);if(e){this.host.kick(e,"Der Gastgeber hat dich aus der Welt genommen.");try{e.pc.close()}catch{}}}listPlayers(){const t=this.host?this.host.guests.map(e=>({id:e.id,name:e.name})):[...this.avatars.list.entries()].map(([e,n])=>({id:e,name:n.name}));this.ui.players(t)}async join(t,e){const n=this.game;this.myName=e,this.guest=new by({onWelcome:r=>this.welcome(r),onBlocks:r=>{const o=n.world;if(o)for(const[a,l,c,h]of r)o.ensure&&o.ensure(a>>4,c>>4),o.setBlock(a,l,c,h)},onPlayer:(r,o)=>{this.avatars.set(r,o),o.name&&this.listPlayers()},onLeft:r=>{const o=this.avatars.list.get(r);o&&this.ui.toast(`${o.name||"Ein Spieler"} ist gegangen`),this.avatars.remove(r),this.listPlayers()},onMobs:r=>{n.mobs instanceof Rc&&n.mobs.set(r)},onHurt:r=>n.remoteHurt(r),onDrops:r=>{for(const[o,a]of r)n.inv[o]=Math.min(en,(n.inv[o]||0)+a);this.ui.toast(r.map(([o,a])=>`+${a} ${Se(o)}`).join(" · ")),n.onChange()},onTime:r=>{n.time=r},onReject:r=>this.reject(r),onBye:r=>this.end(r)},r=>this.dc&&this.dc.readyState==="open"&&this.dc.send(r),e);const s=await wy(t,this.useStun,(r,o)=>{this.dc=r,this.conns.add(o),r.onmessage=a=>this.guest&&this.guest.receive(a.data),r.onclose=()=>this.end("Die Verbindung zum Gastgeber ist getrennt."),this.guest.hello(),this.ui.status("Verbunden, Welt wird geladen …")});return s.pc.onconnectionstatechange=()=>{["failed","closed"].includes(s.pc.connectionState)&&this.end("Die Verbindung zum Gastgeber ist getrennt.")},s.code}welcome(t){const e=this.game;e.start({name:`Bei ${t.host}`,seed:t.seed,gen:t.gen,preset:t.preset,terrain:t.terrain,mode:t.mode,time:t.time,edits:t.edits,px:t.pos.x+1.5,py:t.pos.y,pz:t.pos.z,yaw:0,pitch:0}),e.mp=this,e.net=this.guest,e.mobs.clear(),e.mobs=new Rc(e.mobView),this.ui.joined(t)}reject(t){const e=this.game;for(const[n,s,r,o,a,l]of t)if(e.world.setBlock(n,s,r,l>=0?l:o),e.mode!=="creative")if(a)e.inv[a]=Math.min(en,(e.inv[a]||0)+1);else{const c=Sy(o);e.inv[c]=Math.max(0,(e.inv[c]||0)-1)}e.onChange(),this.ui.toast("Der Gastgeber hat eine Änderung nicht übernommen")}tick(t){const e=this.game,n=e.player;if(this.avatars.update(t,e.light),this.host){this.host.tick(t,{x:n.x,y:n.y,z:n.z,yaw:e.yaw},e.time,e.mobs?e.mobs.list:null);for(const s of this.host.guests)this.avatars.set(s.id,s.pos)}this.guest&&this.guest.token&&(this.guest.flush(),(this.posT-=t)<=0&&(this.posT=.1,this.guest.pos({x:n.x,y:n.y,z:n.z,yaw:e.yaw,pitch:e.pitch})),e.mobs instanceof Rc&&e.mobs.update(t))}end(t){if(!this.active&&!this.conns.size)return;const e=!!this.guest;if(this.host)for(const s of this.host.guests)this.host.kick(s,"Der Gastgeber hat die Welt geschlossen.");for(const s of this.conns)try{s.close()}catch{}this.conns.clear(),this.host=null,this.guest=null,this.dc=null,this.avatars.clear();const n=this.game;n.world&&(n.world.onSet=null),n.mp=null,n.net=null,t&&this.ui.ended(t,e)}}const dr=[.25,.5,1,2];class Py{constructor(t,e,n){this.game=t,this.$=e,this.toast=n,this.cv=e("wm"),this.ctx=this.cv.getContext("2d"),this.off=document.createElement("canvas"),this.offCtx=this.off.getContext("2d"),this.zi=3,this.cx=0,this.cz=0,this.sel=null,this.drag=null;const s=this.cv;s.addEventListener("pointerdown",o=>{s.setPointerCapture(o.pointerId),this.drag={id:o.pointerId,x:o.clientX,y:o.clientY,moved:0}}),s.addEventListener("pointermove",o=>{const a=this.drag;if(!a||a.id!==o.pointerId)return;const l=this.scale(),c=dr[this.zi];this.cx-=(o.clientX-a.x)*l/c,this.cz-=(o.clientY-a.y)*l/c,a.moved+=Math.abs(o.clientX-a.x)+Math.abs(o.clientY-a.y),a.x=o.clientX,a.y=o.clientY,this.draw()});const r=o=>{const a=this.drag;if(!(!a||a.id!==o.pointerId)&&(this.drag=null,a.moved<8)){const l=this.toWorld(o);this.select(l.x,l.z)}};s.addEventListener("pointerup",r),s.addEventListener("pointercancel",()=>{this.drag=null}),s.addEventListener("wheel",o=>{o.preventDefault(),this.zoom(o.deltaY<0?1:-1)},{passive:!1}),e("mapZin").onclick=()=>this.zoom(1),e("mapZout").onclick=()=>this.zoom(-1),e("mapMe").onclick=()=>{this.cx=t.player.x,this.cz=t.player.z,this.draw()},e("mapMark").onclick=()=>{if(this.sel){if(!t.map.addMark(this.sel.x,this.sel.z)){this.toast(`Höchstens ${Rh} Markierungen`);return}t.unsaved=!0,this.list(),this.draw()}},e("mapGo").onclick=()=>{this.sel&&this.setWp(this.sel.x,this.sel.z)},e("mapMarks").addEventListener("click",o=>{const a=o.target.closest("button[data-i]");if(!a)return;const l=t.map.marks[Number(a.dataset.i)];l&&(a.dataset.a==="go"?this.setWp(l.x,l.z):a.dataset.a==="del"?(t.map.removeMark(Number(a.dataset.i)),t.unsaved=!0,this.list()):(this.cx=l.x,this.cz=l.z),this.draw())}),e("mapMarks").addEventListener("change",o=>{const a=o.target;if(a.dataset.i==null)return;const l=t.map.marks[Number(a.dataset.i)];l&&(l.n=a.value.trim().slice(0,24)||l.n,a.value=l.n,t.unsaved=!0,this.draw())})}scale(){return this.cv.width/Math.max(1,this.cv.clientWidth)}toWorld(t){const e=this.cv.getBoundingClientRect(),n=this.scale(),s=dr[this.zi];return{x:this.cx+((t.clientX-e.left)*n-this.cv.width/2)/s,z:this.cz+((t.clientY-e.top)*n-this.cv.height/2)/s}}zoomLevel(){return dr[this.zi]}zoom(t){this.zi=Math.max(0,Math.min(dr.length-1,this.zi+t)),this.draw()}select(t,e){const n=this.game,s=Math.floor(t/16),r=Math.floor(e/16);this.sel={x:Math.round(t),z:Math.round(e)},this.$("mapSel").textContent=`Gewählt: X ${this.sel.x} · Z ${this.sel.z}${n.map.has(s,r)?"":" (noch unentdeckt)"}`,this.$("mapAct").hidden=!1,this.draw()}setWp(t,e){const n=this.game;n.wp={x:Math.round(t),y:Math.round(n.player.y),z:Math.round(e)},n.unsaved=!0,this.toast("Wegpunkt gesetzt 📍")}open(){const t=this.game,e=this.cv,n=Math.min(1.5,window.devicePixelRatio||1);this.cx=t.player.x,this.cz=t.player.z,this.sel=null,this.$("mapSel").textContent="Tippe auf die Karte, um einen Ort zu wählen. Ziehen verschiebt die Karte.",this.$("mapAct").hidden=!0,t.map.markAround(t.player.x,t.player.z,Math.min(t.viewDist,5)),t.map.syncRadios(t.world),requestAnimationFrame(()=>{e.width=Math.max(200,Math.round(e.clientWidth*n)),e.height=Math.max(160,Math.round(e.clientHeight*n)),this.list(),this.draw()})}list(){const t=this.$("mapMarks"),e=this.game;t.textContent="",e.map.marks.forEach((n,s)=>{const r=document.createElement("li"),o=document.createElement("input");o.value=n.n,o.maxLength=24,o.dataset.i=s,o.setAttribute("aria-label","Name der Markierung");const a=(l,c,h)=>{const f=document.createElement("button");return f.dataset.i=s,f.dataset.a=l,f.textContent=c,f.title=h,f.setAttribute("aria-label",h),f};r.append(a("show","★","Auf der Karte zeigen"),o,a("go","📍","Wegpunkt hierher"),a("del","✕","Markierung löschen")),t.append(r)}),this.$("mapMarksH").hidden=!e.map.marks.length}draw(){const t=this.game,e=this.cv,n=this.ctx,s=e.width,r=e.height,o=dr[this.zi],a=t.map;if(!a||!t.world)return;const l=this.cx-s/2/o,c=this.cz-r/2/o,h=Math.floor(l/16),f=Math.floor(c/16),u=Math.ceil(s/o/16)+2,p=Math.ceil(r/o/16)+2;(this.off.width!==u*qe||this.off.height!==p*qe)&&(this.off.width=u*qe,this.off.height=p*qe,this.img=this.offCtx.createImageData(u*qe,p*qe));const x=this.img.data;x.fill(0);for(let S=0;S<p;S++)for(let C=0;C<u;C++){if(!a.has(h+C,f+S))continue;const y=a.tile(t.world,h+C,f+S);for(let w=0;w<qe;w++)x.set(y.subarray(w*qe*4,(w+1)*qe*4),((S*qe+w)*u*qe+C*qe)*4)}this.offCtx.putImageData(this.img,0,0),n.fillStyle="#0b1020",n.fillRect(0,0,s,r),n.imageSmoothingEnabled=!1;const v=S=>(S-l)*o,m=S=>(S-c)*o;n.drawImage(this.off,v(h*16),m(f*16),u*16*o,p*16*o);const g=Math.max(11,Math.round(13*s/Math.max(1,e.clientWidth)));n.font=`${g}px system-ui,sans-serif`,n.textAlign="center",n.textBaseline="middle";const _=(S,C,y,w)=>{const L=v(S),E=m(C);L<-20||E<-20||L>s+20||E>r+20||(n.fillText(y,L,E),w&&(n.lineWidth=3,n.strokeStyle="rgba(0,0,0,.7)",n.strokeText(w,L,E+g),n.fillStyle="#fff",n.fillText(w,L,E+g)))};if(n.fillStyle="#fff",t.world.structs){const S=Vn(l),C=Vn(l+s/o),y=Vn(c),w=Vn(c+r/o);if((C-S+1)*(w-y+1)<=64)for(let L=y;L<=w;L++)for(let E=S;E<=C;E++){const b=Fr(t.seed,E,L,t.world.gen);b&&a.has(b.x>>4,b.z>>4)&&_(b.x,b.z,"🏘",o>=.5?"Dorf":"")}}for(const S of a.radios.values())_(S[0],S[2],"📻","");for(const S of a.marks)_(S.x,S.z,"★",S.n);if(t.grave&&_(t.grave.x,t.grave.z,"✝",""),t.wp&&_(t.wp.x,t.wp.z,"📍",t.story&&!t.story.done?"Storyziel":""),this.sel&&(n.strokeStyle="#ff2d95",n.lineWidth=2,n.strokeRect(v(this.sel.x)-7,m(this.sel.z)-7,14,14)),t.mp)for(const[,S]of t.mp.avatars.list)S.x!=null&&_(S.x,S.z,"👤",o>=.5?S.name:"");const M=t.player;n.save(),n.translate(v(M.x),m(M.z)),n.rotate(-t.yaw),n.scale(g/9,g/9),n.fillStyle="#fff",n.strokeStyle="#000",n.lineWidth=1,n.beginPath(),n.moveTo(0,-6),n.lineTo(4.5,5),n.lineTo(0,2.5),n.lineTo(-4.5,5),n.closePath(),n.fill(),n.stroke(),n.restore(),this.$("mapInfo").textContent=`${a.count} Gebiete entdeckt · Zoom ${this.zi+1}/${dr.length} · X ${Math.round(t.player.x)} Z ${Math.round(t.player.z)}`}}const Ro=[["fwd","Vorwärts","KeyW"],["back","Rückwärts","KeyS"],["left","Links","KeyA"],["right","Rechts","KeyD"],["jump","Springen / Hoch","Space"],["sneak","Schleichen / Runter","ShiftLeft"],["sprint","Rennen","ControlLeft"],["inv","Inventar","KeyE"],["map","Weltkarte","KeyM"],["hook","Seilhaken","KeyQ"],["wp","Wegpunkt","KeyB"],["fly","Fliegen (Kreativ)","KeyF"],["build","Bauform","KeyG"],["quests","Aufträge ein/aus","KeyJ"],["rotate","Deko drehen","KeyR"]],m0=new Set(["Escape","Tab","MetaLeft","MetaRight",...Array.from({length:9},(i,t)=>"Digit"+(t+1))]),Cc=Object.fromEntries(Ro.map(i=>[i[0],i[2]]));function g0(i){const t={...Cc};if(!i||typeof i!="object")return t;for(const[n]of Ro){const s=i[n];typeof s=="string"&&/^[A-Za-z0-9]{1,24}$/.test(s)&&!m0.has(s)&&(t[n]=s)}const e=new Map;for(const[n]of Ro)e.has(t[n])&&(t[n]=Cc[n]),e.set(t[n],n);return new Set(Object.values(t)).size===Ro.length?t:{...Cc}}function Ny(i,t,e){if(m0.has(e)||!(t in i))return null;const n={...i},s=Object.keys(n).find(r=>n[r]===e);return s&&s!==t&&(n[s]=n[t]),n[t]=e,n}function Iy(i,t){for(const e in i)if(i[e]===t)return e;return null}function Oy(i){return/^Key[A-Z]$/.test(i)?i[3]:/^Digit\d$/.test(i)?i[5]:{Space:"Leertaste",ShiftLeft:"Umschalt links",ShiftRight:"Umschalt rechts",ControlLeft:"Strg links",ControlRight:"Strg rechts",AltLeft:"Alt",AltRight:"Alt Gr",ArrowUp:"↑",ArrowDown:"↓",ArrowLeft:"←",ArrowRight:"→",Enter:"Eingabe",Backspace:"⌫",CapsLock:"Feststell"}[i]||i}const le={S:0,E:1,W:2,N:3,LB:4,RB:5,LT:6,RT:7,SEL:8,START:9,L3:10,R3:11,UP:12,DOWN:13,LEFT:14,RIGHT:15},lu=16;function v0(i=""){const t=String(i).toLowerCase();return/054c|playstation|dualsense|dualshock|ps[345]\b|ps[345] controller/.test(t)?"ps":/057e|nintendo|switch|pro controller|joy-?con/.test(t)?"switch":/045e|xbox|xinput|x-box/.test(t)?"xbox":"generic"}const cl={xbox:["A","B","X","Y","LB","RB","LT","RT","Ansicht","Menü","LS","RS","✚↑","✚↓","✚←","✚→","Xbox"],ps:["✕","○","□","△","L1","R1","L2","R2","Create","Options","L3","R3","✚↑","✚↓","✚←","✚→","PS"],switch:["B","A","Y","X","L","R","ZL","ZR","−","+","LS","RS","✚↑","✚↓","✚←","✚→","Home"]};cl.generic=cl.xbox;const x0={xbox:"Xbox-Controller",ps:"PlayStation-Controller",switch:"Switch-Controller",generic:"Controller"},Lh=(i,t)=>(cl[i]||cl.xbox)[t]??"Taste "+t,_0=i=>i==="switch"?le.E:le.S,M0=i=>i==="switch"?le.S:le.E,Co=[["jump","Springen / Hoch",le.S],["sneak","Schleichen / Runter",le.E],["hook","Seilhaken",le.W],["inv","Inventar",le.N],["prev","Hotbar links",le.LB],["next","Hotbar rechts",le.RB],["place","Setzen / Benutzen",le.LT],["break","Abbauen / Angreifen",le.RT],["map","Weltkarte",le.SEL],["pause","Pause",le.START],["sprint","Rennen",le.L3],["undo","Rückgängig (Kreativ)",le.R3],["fly","Fliegen (Kreativ)",le.UP],["wp","Wegpunkt",le.DOWN],["build","Bauform",le.LEFT],["quests","Aufträge ein/aus",le.RIGHT]],Za=Object.fromEntries(Co.map(i=>[i[0],i[2]]));function cu(i){const t={...Za};if(!i||typeof i!="object")return t;for(const[n]of Co){const s=i[n];Number.isInteger(s)&&s>=0&&s<lu&&(t[n]=s)}const e=new Set;for(const[n]of Co)e.has(t[n])&&(t[n]=Za[n]),e.add(t[n]);return new Set(Object.values(t)).size===Co.length?t:{...Za}}function ky(i,t,e){if(!(t in i)||!Number.isInteger(e)||e<0||e>=lu)return null;const n={...i},s=Object.keys(n).find(r=>n[r]===e);return s&&s!==t&&(n[s]=n[t]),n[t]=e,n}const Uy=(i,t=.18)=>Math.abs(i)<t?0:(i-Math.sign(i)*t)/(1-t);function zy(i,t,e=Za,n=.18){const s=c=>Uy(i.axes[c]||0,n),r=c=>{const h=i.buttons[c];return!!h&&(h.pressed||h.value>.5)},o=i.buttons.map((c,h)=>r(h)),a={},l={};for(const c in e){const h=e[c];a[c]=!!o[h],l[c]=!!o[h]&&!t[h]}return{r:s(0),f:-s(1),lx:s(2),ly:s(3),held:a,hit:l,buttons:o}}function Fy(i,t,e){const n=i[t];if(!n)return i.length?0:-1;const s=n.x+n.w/2,r=n.y+n.h/2,o=e==="up"||e==="down",a=e==="down"||e==="right"?1:-1;let l=-1,c=1/0;return i.forEach((h,f)=>{if(f===t)return;const u=h.x+h.w/2,p=h.y+h.h/2,x=o?a>0?h.y-(n.y+n.h):n.y-(h.y+h.h):a>0?h.x-(n.x+n.w):n.x-(h.x+h.w);if((o?(p-r)*a:(u-s)*a)<=1||x<-Math.min(n.h,n.w)/2)return;const m=o?Math.max(0,Math.max(h.x,n.x)-Math.min(h.x+h.w,n.x+n.w)):Math.max(0,Math.max(h.y,n.y)-Math.min(h.y+h.h,n.y+n.h)),g=Math.max(0,x)+m*2.5;g<c&&(c=g,l=f)}),l}const By={break:[.2,.45,55],place:[0,.22,30],hurt:[.85,.6,200],deny:[.05,.18,40],done:[.35,.7,260],hook:[.15,.35,70]};function Al(i,t,e=1){const n=By[t];if(!i||!n||!(e>0))return!1;const s=Math.min(1,e),[r,o,a]=n;try{const l=i.vibrationActuator;if(l&&l.playEffect){const h=l.playEffect("dual-rumble",{startDelay:0,duration:a,strongMagnitude:r*s,weakMagnitude:o*s});return h&&h.catch&&h.catch(()=>{}),!0}const c=i.hapticActuators&&i.hapticActuators[0];if(c&&c.pulse){const h=c.pulse(Math.max(r,o)*s,a);return h&&h.catch&&h.catch(()=>{}),!0}}catch{}return!1}const Hy="1.15.0",D=i=>document.getElementById(i),Yo=D("c"),hu=window.matchMedia("(pointer: coarse)").matches;let ft=kS();const P=new py(Yo,hu,ft.quality);window.__bv=P;let yt="menu",ks="menu",Pr=-1,bn=hu;const Pn=new Set;let ei=g0(ft.keys);document.documentElement.style.setProperty("--atlas",`url(${P.atlasCanvas.toDataURL()})`);const Dh=P.itemCanvas.height/32;document.documentElement.style.setProperty("--items",`url(${P.itemCanvas.toDataURL()})`);document.documentElement.style.setProperty("--itemRows",Dh*100+"%");const hl=i=>{if(Qi(i)){const e=De[i]?De[i].icon:0;return`<i class="ic it" style="background-position:${e%8*100/7}% ${Dh>1?Math.floor(e/8)*100/(Dh-1):0}%"></i>`}if(Sl(i)){const e=i-xi;return`<i class="ic lg" style="background-position:${e%4*100/3}% ${Math.floor(e/4)*100/3}%"></i>`}if(i===d.RAINBOW)return'<i class="ic rb"></i>';if(Gt[i]&&Gt[i].emoji)return`<i class="ic em">${Gt[i].emoji}</i>`;const t=Gt[i]?Gt[i].icon:0;return`<i class="ic" style="background-position:${t%8*100/7}% ${Math.floor(t/8)*100/15}%"></i>`};P.onLogos=()=>{document.documentElement.style.setProperty("--logos",`url(${P.logoCanvas.toDataURL("image/png")})`)};let Od=0;function ee(i){const t=D("toast");t.textContent=i,t.classList.add("on"),clearTimeout(Od),Od=setTimeout(()=>t.classList.remove("on"),1800)}P.onToast=ee;function ms(){const i=D("hotbar");if(!i.children.length)for(let t=0;t<9;t++){const e=document.createElement("div");e.className="slot",e.addEventListener("pointerdown",n=>{n.stopPropagation(),P.selectSlot(t)}),e.addEventListener("dragstart",n=>{if(yt!=="inventory"||!P.hotbar[t]){n.preventDefault();return}n.dataTransfer.setData("text/plain","h"+t)}),e.addEventListener("dragover",n=>{yt==="inventory"&&(n.preventDefault(),e.classList.add("drop"))}),e.addEventListener("dragleave",()=>e.classList.remove("drop")),e.addEventListener("drop",n=>{n.preventDefault(),e.classList.remove("drop"),b0(t,n.dataTransfer.getData("text/plain"))}),i.appendChild(e)}for(let t=0;t<9;t++){const e=i.children[t],n=P.hotbar[t],s=P.mode==="creative"?"∞":P.inv[n]||0;e.className="slot"+(t===P.sel?" sel":"")+(n&&s===0?" empty":""),e.title=n?Se(n):"",e.draggable=yt==="inventory"&&!!n;const r=es(n),o=r&&P.dur[n]?1-P.dur[n]/r.dur:0;e.innerHTML=`<span class="k">${t+1}</span>${n?hl(n):""}<span class="n">${n?s:""}</span>${o?`<span class="dur"><i style="width:${Math.round(o*100)}%;background:hsl(${Math.round(o*120)},80%,50%)"></i></span>`:""}`}}let Li="all",S0="",y0=!1,Bo=new Set,as=null;const Vy=[{id:"all",name:"Alle"},...cM,{id:"items",name:"Werkzeuge & Essen"}],Wy=i=>i.tool?` · ${i.tool.speed}× schneller · hält ${i.tool.dur} Blöcke`:i.food?` · +${i.food} Hunger`:"";function E0(){D("invTabs").innerHTML=Vy.map(i=>`<button role="tab" data-cat="${i.id}" class="${i.id===Li?"on":""}" aria-selected="${i.id===Li}">${i.name}</button>`).join("")}function b0(i,t){if(t){if(t[0]==="h"){const e=Number(t.slice(1));e>=0&&e<9&&e!==i&&([P.hotbar[i],P.hotbar[e]]=[P.hotbar[e],P.hotbar[i]])}else{const e=Number(t);if(!Number.isInteger(e)||!(Gt[e]||De[e]))return;const n=P.hotbar.indexOf(e);n>=0&&(P.hotbar[n]=P.hotbar[i]),P.hotbar[i]=e}P.selectSlot(i),P.unsaved=!0,P.onChange()}}let Ph="std";function Hr(){const i=P.mode==="creative",t=S0.trim().toLowerCase();D("invHint").textContent=i?"Kreativmodus: alle Blöcke sind unbegrenzt. Tippe einen Block, um ihn in den gewählten Hotbar-Platz zu legen.":"Tippe einen Block, um ihn in den gewählten Hotbar-Platz zu legen. Zahl = Vorrat.",D("invOwnedL").hidden=i,D("invSt").hidden=i||!as,as&&(D("invSt").textContent=as==="ofen"?"🔥 Am Schmelzofen: Barren schmelzen und Essen braten":"🪚 An der Werkbank: Werkzeuge und Schmelzofen bauen");let e="";const n=[...fM,...ol];Ph==="name"?n.sort((r,o)=>Se(r).localeCompare(Se(o),"de")):Ph==="count"&&!i&&n.sort((r,o)=>(P.inv[o]||0)-(P.inv[r]||0));for(const r of n){const o=Gt[r]&&!Qi(r)?Gt[r]:De[r],a=i?"∞":P.inv[r]||0;if(Li!=="all"&&o.cat!==Li||t&&!o.name.toLowerCase().includes(t)||y0&&!i&&!a)continue;const l=Qi(r)?Wy(o):o.tool?" · am besten mit "+o.tool[0].toUpperCase()+o.tool.slice(1):"";e+=`<button class="cell ${a?"has":"dim"}" data-t="${r}" draggable="true" title="${o.name}${l}${bn?"":" · Umschalt-Klick: in freien Platz · auf die Hotbar ziehen"}">${hl(r)}<span>${o.name}</span><b>${a}</b></button>`}if(D("invGrid").innerHTML=e||'<div class="empty-note">Nichts gefunden.</div>',D("recH").hidden=i,i){D("recipes").innerHTML="";return}const s=rn.map((r,o)=>[r,o]).filter(([r])=>(Li==="all"||r.cat===Li)&&$S(r,t));D("recipes").innerHTML=s.length?s.map(([r,o])=>{const a=au(P.inv,r,en,Bo),l=XS(P.inv,r,en,Bo),c=r.need.map(([u,p])=>{const x=P.inv[u]||0;return x>=p?`${p}× ${Se(u)}`:`<i>${p}× ${Se(u)} (${x})</i>`}).join(" + "),h=a.full?" · Vorrat voll":a.noStation?` · <i>${id[r.st]} nicht in der Nähe</i>`:"",f=r.st?`<span class="badge">${r.st==="ofen"?"🔥":"🪚"} ${id[r.st]}</span>`:"";return`<button data-r="${o}" ${a.ok?"":"disabled"}>${hl(r.give[0])}<span><b>${r.give[1]}× ${Se(r.give[0])}</b>${f}<small>aus ${c}${h}</small></span><span class="cnt">${l?l+"×":""}</span></button>`}).join(""):'<div class="empty-note">Kein passendes Rezept.</div>'}D("invTabs").addEventListener("click",i=>{const t=i.target.closest("[data-cat]");t&&(Li=t.dataset.cat,E0(),Hr())});D("invSearch").addEventListener("input",i=>{S0=i.target.value,Hr()});D("invOwned").addEventListener("change",i=>{y0=i.target.checked,Hr()});D("invGrid").addEventListener("click",i=>{const t=i.target.closest("[data-t]");if(!t)return;const e=Number(t.dataset.t);if(i.shiftKey){if(P.hotbar.includes(e)){ee("Liegt schon in der Hotbar");return}const n=P.hotbar.indexOf(0);if(n<0){ee("Kein freier Hotbar-Platz");return}P.hotbar[n]=e,P.unsaved=!0,P.onChange(),ee(`${Se(e)} → Platz ${n+1}`);return}b0(P.sel,String(e))});D("invGrid").addEventListener("dragstart",i=>{const t=i.target.closest("[data-t]");t&&i.dataTransfer.setData("text/plain",t.dataset.t)});D("invGrid").addEventListener("dragover",i=>i.preventDefault());D("invGrid").addEventListener("drop",i=>{i.preventDefault();const t=i.dataTransfer.getData("text/plain");t[0]==="h"&&(P.hotbar[Number(t.slice(1))]=0,P.unsaved=!0,P.onChange())});D("invSort").addEventListener("change",i=>{Ph=i.target.value,Hr()});D("recipes").addEventListener("click",i=>{const t=i.target.closest("[data-r]");if(!t)return;const e=rn[Number(t.dataset.r)];let n=0,s=null;for(let r=i.shiftKey?5:1;r>0&&(s=qp(P.inv,e,en,Bo),!!s.ok);r--)n++;if(!n){ee(s.msg);return}P.unsaved=!0,P.onChange(),P.questEvent("craft",e.give[0],e.give[1]*n),ee(`+${e.give[1]*n} ${Se(e.give[0])}`)});P.onChange=()=>{ms(),yt==="inventory"&&Hr()};const Nh=D("vit").getContext("2d"),Gy=[".##.##.","#######","#######",".#####.","..###..","...#..."],Ky=["....##.","...####","..#####",".####..","##.....","#......"],Xy=["..###..",".#...#.","#.....#","#.....#",".#...#.","..###.."],$y=["#######","#######","#######",".#####.","..###..","...#..."];function za(i,t,e,n,s,r){for(let o=0;o<6;o++)for(let a=0;a<7;a++)i[o][a]==="#"&&(Nh.fillStyle=a<3.5?n||s?n||s:r:n||r,Nh.fillRect(t+a*2,e+o*2,2,2))}function Nr(){const i=P.vitals,t=D("vit");if(t.hidden=!i||yt==="menu",!i)return;Nh.clearRect(0,0,200,34);const e=Math.ceil(i.hp),n=Math.ceil(i.food);for(let r=0;r<pr/2;r++){const o=e-r*2;za(Gy,r*10,18,o>=2?"#ff3b4a":null,o===1?"#ff3b4a":null,"#3a1a20")}for(let r=0;r<yo/2;r++){const o=n-r*2;za(Ky,186-r*10,18,o>=2?"#d89048":null,o===1?"#d89048":null,"#3a2a1a")}if(i.air<ja)for(let r=0;r<Math.ceil(i.air);r++)za(Xy,186-r*10,2,"#9ad8ff",null,"#9ad8ff");const s=P.armorPoints();for(let r=0;r<s;r++)za($y,r*10,2,"#cfd6e2",null,"#cfd6e2")}P.onVitals=Nr;let kd=0;P.onHurt=()=>{const i=D("hurt");if(i.classList.add("on"),Nr(),clearTimeout(kd),kd=setTimeout(()=>i.classList.remove("on"),120),navigator.vibrate&&bn)try{navigator.vibrate(60)}catch{}};P.onMine=i=>{D("mine").classList.toggle("on",i>0),D("mine").firstChild.style.width=Math.round(i*100)+"%"};const qy={Sturz:"Zu tief gefallen.",Ertrunken:"Unter Wasser ging die Luft aus.",Magma:"Magma ist heiß.",Hunger:"Vor Hunger.",Rauschling:"Ein Rauschling hat dich erwischt.",Höhlenwesen:"Ein Höhlenwesen hat dich erwischt.","Störsender-Drohne":"Die Störimpulse einer Drohne waren zu viel."};P.onDeath=(i,t)=>{Vr(),Pe("dead"),D("deadWhy").textContent=(qy[i]||"")+(t?" Dein Vorrat liegt am Unglücksort, der Wegpunkt 📍 zeigt den Weg.":" Dein Vorrat bleibt erhalten. Der Wegpunkt 📍 markiert den Unglücksort."),Xn()&&document.exitPointerLock(),Ks(!1)};D("dRevive").onclick=()=>{P.revive(),ms(),Pe("playing"),gs()};D("dMenu").onclick=()=>{P.revive(),D("pMenu").onclick()};P.onStation=i=>{as=i,Li="all",Cl()};let Is=null;function T0(){const i=o0[Is.role]||[];D("trName").firstChild.textContent=Is.name+" ",D("trSay").textContent="„"+(my[Is.role]||"Hallo!")+"“",D("trList").innerHTML=i.map((t,e)=>{const n=au(P.inv,t),s=t.need.map(([r,o])=>{const a=P.inv[r]||0;return a>=o?`${o}× ${Se(r)}`:`<i>${o}× ${Se(r)} (${a})</i>`}).join(" + ");return`<button data-tr="${e}" ${n.ok?"":"disabled"}>${hl(t.give[0])}<span><b>${t.give[1]}× ${Se(t.give[0])}</b><small>für ${s}</small></span></button>`}).join("")}P.onTrade=i=>{if(yt==="playing"){if(P.mode==="creative"){ee(`${i.name}: „Im Kreativmodus hast du doch schon alles!“`);return}Is=i,Vr(),Pe("trade"),T0(),Xn()&&document.exitPointerLock(),wl()}};D("trList").addEventListener("click",i=>{const t=i.target.closest("[data-tr]");if(!t||!Is)return;const e=o0[Is.role][Number(t.dataset.tr)],n=qp(P.inv,e);ee(n.ok?`Getauscht: ${n.msg}`:n.msg),n.ok&&(P.unsaved=!0,T0(),ms(),P.questEvent("trade",e.give[0]))});function uu(){yt==="trade"&&(Is=null,Pe("playing"),P.resume(),gs(),hs()&&setTimeout(()=>{yt==="playing"&&!Xn()&&hs()&&Hi()},250))}D("trClose").onclick=uu;P.onBuildMode=i=>{const t=D("bmode");t.hidden=i.key==="einzeln",t.textContent=`▦ ${i.name}`+(i.clicks===2?" · zwei Ecken setzen":i.key==="einfuegen"?" · Setzen fügt ein":"")+" (G wechselt)",ee("Bauform: "+i.name)};D("bBuild").onclick=()=>P.cycleBuild(1);D("bRot").onclick=()=>P.rotateDeco(1);P.onDecoTarget=i=>{D("bRot").hidden=!i};let Us=!1,Ud=0;function Fi(){const i=D("quest"),t=P.story;if(!t||P.menuMode){i.hidden=!0;return}if(i.hidden=!1,i.classList.toggle("min",Us),t.done){i.innerHTML='<b>🎉 Story abgeschlossen</b><small class="txt">Alle Aufträge erledigt. Baue frei weiter!</small>';return}const e=yr(t),n=e[t.i],[s,r]=r0(P,n),o=Math.min(100,Math.round(s/r*100)),a=n.c?`Kapitel ${n.c} · ${n.t}`:`Auftrag ${t.i+1}/${e.length} · ${n.t}`;i.innerHTML=`<b>${a}</b><div class="bar"><i style="width:${o}%"></i></div><small>${Math.min(s,r)} / ${r}${n.c?` · Auftrag ${t.i+1}/${e.length}`:""}</small><small class="txt">${n.d}</small>`}function Er(i){const t=D("banner");t.innerHTML=i,t.classList.add("on"),clearTimeout(Ud),Ud=setTimeout(()=>t.classList.remove("on"),4200)}P.onQuest=Fi;P.onQuestDone=(i,t)=>{const e=Object.entries(i.r||{}).map(([s,r])=>`+${r} ${Se(Number(s))}`).join(" · "),n=!t&&yr(P.story)[P.story.i];t?Er(i.c?"🎉 Das Rauschen ist verstummt!<small>Das Funknetz steht wieder. Die Welt gehört dir, baue frei weiter.</small>":`🎉 Story abgeschlossen!<small>${i.t} geschafft. Die Funkzentrale sendet wieder. Baue frei weiter.</small>`):n&&n.c&&n.c!==i.c?Er(`📻 Kapitel ${n.c}: ${Fo[n.c].t}<small>${Fo[n.c].d}</small>`):Er(`✔ Auftrag erledigt: ${i.t}<small>${e}</small>`)};function Yy(){const i=P.story;i&&(D("qlist").innerHTML=yr(i).map((t,e,n)=>{const s=i.done||e<i.i,r=!i.done&&e===i.i;return`${t.c&&(e===0||n[e-1].c!==t.c)?`<h3 class="qch">Kapitel ${t.c} · ${Fo[t.c].t}</h3>`:""}<div class="qi ${s?"done":r?"cur":""}"><span class="st">${s?"✔":r?"➜":e+1}</span><div><b>${t.t}</b>${s||r?`<small>${t.d}</small>`:""}</div></div>`}).join(""),D("qlogT").textContent=i.c==="rauschen"?"Das große Rauschen":"Aufträge der Funkzentrale")}D("quest").addEventListener("click",()=>{Us=!Us,Fi()});D("pQuests").onclick=()=>{Yy(),cn("qlog",!0)};D("qlogClose").onclick=()=>cn("qlog",!1);const cn=(i,t)=>{D(i).hidden=!t};function Pe(i){yt=i,document.body.dataset.st=i,document.body.classList.toggle("playing",i==="playing"),cn("map",i==="map"),cn("menu",i==="menu"),cn("pause",i==="paused"),cn("inv",i==="inventory"),cn("loading",i==="loading"),cn("set",i==="settings"),cn("dead",i==="dead"),cn("trade",i==="trade"),cn("mp",i==="mp"),cn("hud",i==="playing"||i==="paused"||i==="inventory"||i==="dead"||i==="trade"||(i==="settings"||i==="mp")&&ks==="paused"),i!=="playing"&&P.onMine(0),i!=="paused"&&cn("qlog",!1),i==="menu"&&Ll(null)}const Xn=()=>document.pointerLockElement===Yo,hs=()=>!bn&&!St.raf;function gs(){if(!(bn||Xn()))try{const i=Yo.requestPointerLock();i&&i.catch&&i.catch(()=>{})}catch{}}function Vr(){P.breakHeld=P.placeHeld=!1,Pn.clear(),zs(),Object.assign(P.input,{f:0,r:0,jump:!1,down:!1,sprint:!1})}function wl(){P.mp||P.stop()}function Hi(){yt==="playing"&&(wl(),Vr(),Ks(),D("pMp").hidden=!!P.story||!!(P.mp&&P.mp.guest),Pe("paused"),D("vd").value=P.viewDist,D("vdVal").textContent=P.viewDist,D("pQuests").hidden=!P.story,D("td").value=Math.round(P.time*100),D("tdVal").textContent=P.clockText(),Xn()&&document.exitPointerLock())}function Rl(){Pe("playing"),P.resume(),gs()}function Cl(){yt==="playing"&&(Bo=P.stationsNear(),as&&!Bo.has(as)&&(as=null),Vr(),Pe("inventory"),E0(),Hr(),ms(),Xn()&&document.exitPointerLock(),wl())}function Ho(){yt==="inventory"&&(as=null,Pe("playing"),ms(),P.resume(),gs(),hs()&&setTimeout(()=>{yt==="playing"&&!Xn()&&hs()&&Hi()},250))}document.addEventListener("pointerlockchange",()=>{!Xn()&&yt==="playing"&&hs()&&Hi()});document.addEventListener("pointerlockerror",()=>{if(!(yt!=="playing"||!hs())){if(performance.now()-I0<2e3){ee("Ins Bild klicken, um loszulegen");return}Hi()}});function Ks(i){if(!P.world||Pr<0||P.menuMode)return;const t=ou(Pr,P.serialize());return t&&(P.unsaved=!1),(i||!t)&&ee(t?"Gespeichert ✔":"Speichern fehlgeschlagen (Speicher voll?)"),t}setInterval(()=>{yt==="playing"&&Ks(!1)},3e4);window.addEventListener("pagehide",()=>Ks(!1));document.addEventListener("visibilitychange",()=>{document.hidden&&yt==="playing"&&Hi()});function jy(i){if(i=(i||"").trim(),!i)return Math.floor(Math.random()*2147483647);if(/^-?\d{1,9}$/.test(i))return Number(i);let t=2166136261;for(let e=0;e<i.length;e++)t=Math.imul(t^i.charCodeAt(e),16777619);return t|0}const ul=i=>String(i).replace(/[&<>"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[t]),A0=[{k:"nature",e:"🌄",n:"Landschaft",d:"Hügel, Wälder, Seen und Höhlen – leer, ohne Bauwerke"},{k:"flat",e:"⬜",n:"Flach",d:"Ebenes Grasland, ideal zum freien Bauen"},{k:"adventure",e:"🏘",n:"Abenteuer",d:"Landschaft mit Dörfern, Minen und Höhlenhallen"}],w0=[{k:"story",e:"📜",n:"Story-Welt",d:"Dorf und Gegend aus „Das große Rauschen“"},...qM.map(i=>({k:"fan:"+i,img:i,e:Ni[i].emoji,n:Ni[i].name,d:Ni[i].desc}))],us={};for(const i of[...A0,...w0])us[i.k]=i;const R0=i=>new URL(`worlds/${us[i]&&us[i].img||i}.webp`,document.baseURI).href;function Ih(i){return i.preset&&Ni[i.preset]?"fan:"+i.preset:i.mode==="story"||i.seed===777&&(i.gen||1)>=3&&!i.terrain?i.mode==="story"?"story":"adventure":i.terrain==="flat"||i.terrain==="nature"?i.terrain:(i.gen||1)>=3?"adventure":"nature"}const fu=i=>new Date(i).toLocaleString("de-DE",{dateStyle:"short",timeStyle:"short"}),Zy={story:"Story",creative:"Kreativ",survival:"Überleben"};function du(){return Gp().map(i=>({i,m:bh(i)})).filter(i=>i.m).sort((i,t)=>(t.m.savedAt||0)-(i.m.savedAt||0))}function ni(){const i=du();let t='<button class="card add" data-act="add"><span class="plus-ico">✚</span><b>Neue Welt</b><small>Kreativ, Überleben oder Story – mit Gelände oder Vorlage</small></button>';for(const{i:e,m:n}of i){const s=n.mode==="creative",r=n.mode==="story",o=Ih(n),a=us[o],l=n.qc==="rauschen"?s0:i0,c=n.q??0,h=r?`<span class="pill st">📜 ${n.q===-1?"Story abgeschlossen":(l[c]&&l[c].c?"Kapitel "+l[c].c+" · ":"")+"Auftrag "+(c+1)+"/"+l.length}</span>`:`<span class="pill ${s?"cr":""}">${s?"🕊 Kreativ":"⛏ Überleben"}</span>`,f=(a?a.e+" "+a.n:"")+(r||n.terrain==="flat"?"":" · Startwert "+ul(n.seed))+((n.gen||1)<Np?" · klassisch":"");t+=`<div class="card" data-i="${e}"><div class="th" style="--img:url(${R0(o)})">${h}</div>
      <div class="ttl"><b>${ul(n.name)}</b><small>${f}</small><small>zuletzt ${fu(n.savedAt)}</small></div>
      <div class="row"><button class="go" data-act="load" data-i="${e}">▶ Spielen</button><button data-act="ren" data-i="${e}" aria-label="Umbenennen" title="Umbenennen">✎</button><button data-act="copy" data-i="${e}" aria-label="Kopieren" title="Kopie anlegen">⧉</button><button data-act="exp" data-i="${e}" aria-label="Welt exportieren" title="Welt als Datei sichern">⤓</button>${LS(e)?`<button data-act="bak" data-i="${e}" aria-label="Sicherung laden" title="Ältere Sicherung wiederherstellen">↺</button>`:""}<button data-act="del" data-i="${e}" aria-label="Welt löschen" title="Welt löschen">🗑</button></div></div>`}D("slots").innerHTML=t,D("worldCount").textContent=i.length===1?"1 Welt":i.length+" Welten",D("mWorldsSub").textContent=i.length?i.length===1?"1 Welt gespeichert":i.length+" Welten gespeichert":"Noch keine Welt",Qy(i)}const ue={mode:"creative",kind:"nature",named:!1},C0=i=>`<button class="wtile" data-k="${i.k}"><i class="th" style="--img:url(${R0(i.k)})"><em>${i.e}</em></i><b>${ul(i.n)}</b><small>${ul(i.d)}</small></button>`;D("nwBase").innerHTML=A0.map(C0).join("");D("nwTpl").innerHTML=w0.map(C0).join("");function L0(i){const t=new Set(du().map(e=>e.m.name));if(!t.has(i))return i;for(let e=2;;e++)if(!t.has(i+" "+e))return i+" "+e}function D0(){if(ue.mode==="story")return"Story";const i=us[ue.kind];return ue.kind.startsWith("fan:")||ue.kind==="story"?i.n:ue.kind==="flat"?"Flachwelt":ue.mode==="creative"?"Kreativwelt":"Überlebenswelt"}function pu(){const i=ue.mode==="story";i&&(ue.kind="story");for(const n of D("nwMode").children)n.classList.toggle("on",n.dataset.mode===ue.mode);for(const n of document.querySelectorAll("#pgNew .wtile"))n.classList.toggle("on",n.dataset.k===ue.kind),n.disabled=i&&n.dataset.k!=="story";const t=ue.kind==="story"||ue.kind==="flat";D("nwSeedF").hidden=t,ue.named||(D("nwName").value=L0(D0()));const e=us[ue.kind];D("nwInfo").textContent=i?"Die Story spielt immer in der festen Story-Welt mit Dorf. Es gelten die Überlebensregeln.":`${e.e} ${e.n}: ${e.d}.`+(ue.kind.startsWith("fan:")||ue.kind==="story"?" Fertige Orte rund um den Start – alles begehbar und frei umbaubar.":"")}function Jy(){ue.named=!1,ue.kind=ue.mode==="creative"?"nature":ue.mode==="story"?"story":ue.kind==="story"?"adventure":ue.kind,D("nwSeed").value="",pu()}D("nwMode").addEventListener("click",i=>{const t=i.target.closest("[data-mode]");if(!t)return;const e=ue.mode;ue.mode=t.dataset.mode,e==="story"&&ue.mode!=="story"&&(ue.kind=ue.mode==="creative"?"nature":"adventure"),pu()});D("pgNew").addEventListener("click",i=>{const t=i.target.closest(".wtile");t&&!t.disabled&&(ue.kind=t.dataset.k,pu())});D("nwName").addEventListener("input",()=>{ue.named=!!D("nwName").value.trim()});D("nwDice").onclick=()=>{D("nwSeed").value=String(Math.floor(Math.random()*9e5)+1e5)};D("nwGo").onclick=()=>{const i=bl();if(i<0){ee("Zu viele Welten – lösche zuerst eine");return}const t=ue.mode==="story",e=ue.kind,n=e.startsWith("fan:")?e.slice(4):null,s=(D("nwName").value.trim()||L0(D0())).slice(0,40);O0(i,{name:s,mode:ue.mode,seed:t||e==="story"?777:e==="flat"?1:jy(D("nwSeed").value),gen:Np,preset:n||void 0,terrain:e==="flat"||e==="nature"?e:void 0,time:n&&Ni[n].time!=null?Ni[n].time:void 0})};let hn=null,Oh=-1;const fl={worlds:"pgWorlds",new:"pgNew",help:"pgHelp",data:"pgData"};function Qy(i=du()){const t=i[0];Oh=t?t.i:-1,D("mContinue").hidden=!t,t&&(D("mContinueSub").textContent=`${t.m.name} · ${Zy[t.m.mode]||""} · ${fu(t.m.savedAt)}`)}function Ll(i){hn=i||null,hn==="new"&&Jy();for(const[n,s]of Object.entries(fl))cn(s,n===hn);D("menu").classList.toggle("paged",!!hn);for(const n of document.querySelectorAll("#mmNav [data-page]"))n.classList.toggle("cur",n.dataset.page===hn);const t=D(hn?fl[hn]:"mmNav"),e=hn&&t.querySelector(hn==="new"?".wtile.on":".go");e&&!bn?e.focus():P0(t)}const Dl=i=>[...i.querySelectorAll("button,input,select,a[href],summary")].filter(t=>!t.disabled&&t.offsetParent!==null);function P0(i,t=0){if(bn)return;const e=Dl(i);e.length&&e[Math.min(t,e.length-1)].focus({preventScroll:!1})}function zd(i){const t=D(hn?fl[hn]:"mmNav"),e=Dl(t);if(!e.length)return;const n=e.indexOf(document.activeElement);e[n<0?0:(n+i+e.length)%e.length].focus()}function mu(){if(hn){const i=hn;Ll(null);const t=document.querySelector(`#mmNav [data-page=${i}]`);t&&!bn&&t.focus()}}D("mmNav").addEventListener("click",i=>{const t=i.target.closest("[data-page]");t&&Ll(t.dataset.page)});for(const i of document.querySelectorAll(".pg-back"))i.onclick=mu;D("mContinue").onclick=()=>{Oh>=0&&N0(Oh)};D("mmVer").textContent=Hy;function Vo(i){const t=i==="pad"?[[Lh(St.style,_0(St.style)),"Auswählen",1],[Lh(St.style,M0(St.style)),"Zurück",1],["✚","Bewegen",1]]:[["↑↓","Auswählen"],["Enter","Bestätigen"],["Esc","Zurück"]];D("mmHints").innerHTML=t.map(([e,n,s])=>`<span><kbd class="${s?"pad":""}">${e}</kbd>${n}</span>`).join("")}Vo("keys");D("slots").addEventListener("click",i=>{const t=i.target.closest("[data-act]");if(!t)return;const e=Number(t.dataset.i),n=t.dataset.act;if(n==="add")Ll("new");else if(n==="del"){const s=bh(e);confirm(`„${s?s.name:"Welt"}“ wirklich löschen?`)&&(DS(e),ni(),P0(D("pgWorlds")))}else if(n==="load")N0(e);else if(n==="ren"){const s=bh(e),r=prompt("Neuer Name der Welt:",s?s.name:"");r&&r.trim()&&(ee(IS(e,r)?"Umbenannt":"Umbenennen fehlgeschlagen"),ni())}else if(n==="copy"){const s=OS(e);ee(s>=0?"Kopie angelegt":"Kopieren fehlgeschlagen (Speicher voll?)"),ni()}else if(n==="exp"){const s=Xo(e);if(!s){ee("Speicherstand nicht lesbar");return}tE(`klotzfunk-${s.name.replace(/[^\w-]+/g,"_")}.json`,PS(s))}else if(n==="bak"){const s=Vp(e);if(!s){ee("Keine lesbare Sicherung"),ni();return}confirm(`Sicherung vom ${fu(s.savedAt)} wiederherstellen? Der aktuelle Stand wird dafür zur Sicherung.`)&&(ee(Wp(e)?"Sicherung wiederhergestellt":"Wiederherstellen fehlgeschlagen"),ni())}});function N0(i){let t=Xo(i);if(!t){const e=Vp(i);if(e&&confirm("Dieser Speicherstand ist beschädigt. Die letzte Sicherung laden?"))Wp(i),t=e;else{ee("Speicherstand nicht lesbar"),ni();return}}O0(i,t)}function tE(i,t){try{const e=URL.createObjectURL(new Blob([t],{type:"application/json"})),n=document.createElement("a");n.href=e,n.download=i,document.body.appendChild(n),n.click(),n.remove(),setTimeout(()=>URL.revokeObjectURL(e),2e3)}catch{ee("Export nicht möglich")}}D("mImport").onclick=()=>{if(bl()<0){ee("Zu viele Welten – lösche zuerst eine");return}D("importFile").value="",D("importFile").click()};D("importFile").addEventListener("change",i=>{const t=i.target.files&&i.target.files[0];if(t){if(t.size>8*1024*1024){ee("Datei zu groß");return}t.text().then(e=>{const n=NS(e),s=bl();if(!n){ee("Keine gültige KLOTZFUNK-Welt");return}if(s<0){ee("Kein freier Platz");return}ee(ou(s,n)?`„${n.name}“ importiert`:"Import fehlgeschlagen (Speicher voll?)"),ni()}).catch(()=>ee("Datei nicht lesbar"))}});const Lc=["Halte die Sprungtaste im Fall gedrückt, um zu gleiten.","Q oder „Haken“ zieht dich mit dem Seilhaken bis zu 40 Blöcke weit.","Mit M oder 🗺 öffnest du die Weltkarte. Dort kannst du eigene Markierungen setzen.","Erze brauchen eine Spitzhacke. Für Eisen und Funkkristall muss sie mindestens aus Stein sein.","Nachts kommen Rauschlinge. Sie verfolgen dich nur, wenn sie dich sehen.","Setzen auf einen Dorfbewohner öffnet den Handel.","Ein Schalter speist den Funksender daneben. Relais tragen das Signal weiter.","Ein Boot fährt auf Wasser, eine Lore folgt Schienen über Kurven und Stufen.","G wechselt die Bauform: Linie, Fläche, Wand oder Säule.","Weizen wächst auf Ackerboden. Aus 3 Weizen wird Brot.","Pause → 👥 Mehrspieler lädt bis zu 4 Freunde in deine Welt ein.","In den Einstellungen kannst du alle Tasten neu belegen und die Touch-Tasten verschieben."];let dl=0,I0=0;function eE(i){const t=({story:"📜 Story",creative:"🕊 Kreativ"}[i.mode]||"⛏ Überleben")+(us[Ih(i)]?" · "+us[Ih(i)].n:"");D("ldName").textContent=i.name||"Welt",D("ldMode").textContent=t;let e=Math.floor(Math.random()*Lc.length);const n=()=>{D("ldTip").textContent=Lc[e++%Lc.length]};n(),clearInterval(dl),dl=setInterval(n,4e3),pl(.04,i.px===void 0?"Welt wird erzeugt …":"Spielstand wird geladen …")}function pl(i,t){D("ldFill").style.width=Math.round(i*100)+"%",D("ldBar").setAttribute("aria-valuenow",Math.round(i*100)),t&&(D("ldStep").textContent=t)}function nE(i){const t=performance.now(),e=Math.min(P.viewDist,3)+.5;P.resume();const n=()=>{if(yt!=="loading")return;const s=P.areaReady(e);if(pl(.3+s*.7,`Umgebung wird gebaut … ${Math.round(s*100)} %`),s>=1||performance.now()-t>1e4){pl(1,"Los geht’s!"),setTimeout(i,180);return}setTimeout(n,100)};n()}function O0(i,t){os(),Pr=i,eE(t),Pe("loading"),requestAnimationFrame(()=>setTimeout(()=>{try{P.start(t),pl(.3,"Umgebung wird gebaut …"),t.mode==="creative"&&(P.player.flying=!1),D("bFly").hidden=!(bn&&P.mode==="creative"),D("bUndo").hidden=P.mode!=="creative",D("bmode").hidden=!0,ms(),Fi(),nE(()=>{clearInterval(dl),yt==="loading"&&(Pe("playing"),Nr(),I0=performance.now(),gs(),iE(t))})}catch(e){clearInterval(dl),console.error(e),Pe("menu"),ni(),alert("Die Welt konnte nicht gestartet werden.")}},30))}function iE(i){P.story&&P.story.i===0&&P.story.p===0&&i.px===void 0&&Er(P.story.c?`📻 Kapitel 1: ${Fo[1].t}<small>${Fo[1].d} Dein Auftrag steht links (J blendet ihn aus).</small>`:"📜 Willkommen in der Funkzentrale!<small>Dein erster Auftrag steht links. J blendet ihn ein oder aus.</small>");const t=i.px===void 0&&Ni[i.preset];t&&Er(`${t.emoji} ${t.name}<small>${t.desc}. Alles ist begehbar – bau es weiter aus!</small>`),!P.unsaved&&i.px===void 0&&Ks(!1)}D("pResume").onclick=()=>{os(),Rl()};D("pSave").onclick=()=>Ks(!0);D("pRespawn").onclick=()=>{P.respawn(),Rl()};D("pSound").onclick=()=>{mn.enabled=!mn.enabled,D("pSound").textContent=mn.enabled?"🔊 Ton: an":"🔇 Ton: aus"};D("pFull").onclick=()=>{try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}catch{}};D("pMenu").onclick=()=>{P.mp&&oi.end(null),Ks(!1),Pr=-1,ni(),Pe("menu"),P.startMenu(),Fi(),Nr()};D("vd").oninput=i=>{const t=Number(i.target.value);P.maxView=t,P.setViewDist(t),D("vdVal").textContent=t};D("invClose").onclick=Ho;D("bInv").onclick=Cl;D("bWp").onclick=()=>P.toggleWaypoint();D("bUndo").onclick=()=>P.undo(!1);D("bMap").onclick=()=>Nl();D("td").oninput=i=>{P.time=Number(i.target.value)/100,D("tdVal").textContent=P.clockText(),P.updateSky(),P.render()};D("pFreeze").onclick=()=>{P.timeFrozen=!P.timeFrozen,D("pFreeze").textContent=P.timeFrozen?"⏸ Zeit steht still":"⏱ Zeit läuft"};D("bPause").onclick=Hi;function zs(){const i=P.input;if(ti.joy||St.active)return;const t=n=>Pn.has(ei[n]);i.f=(t("fwd")||Pn.has("ArrowUp")?1:0)-(t("back")||Pn.has("ArrowDown")?1:0),i.r=(t("right")||Pn.has("ArrowRight")?1:0)-(t("left")||Pn.has("ArrowLeft")?1:0);const e=P.player.flying;i.sprint=t("sprint")||!e&&t("sneak"),i.down=e&&t("sneak")||ti.down,i.sneak=t("sneak"),i.jump=t("jump")||ti.jump}const ti={joy:!1,jump:!1,down:!1};let Fd=0;function ml(){if(P.mode!=="creative"||P.ride)return;const i=P.player;i.flying=!i.flying,i.vy=0,ee(i.flying?"Fliegen an":"Fliegen aus"),D("bDown").hidden=!(bn&&i.flying),D("bFly").classList.toggle("on",i.flying)}window.addEventListener("keydown",i=>{if(Ii){if(i.preventDefault(),i.code!=="Escape"){const e=Ny(ei,Ii,i.code);e?(ei=e,ft.keys={...e},ds(ft)):ee("Diese Taste ist reserviert")}Ii=null,vu();return}if(yt==="menu"&&i.target&&i.target.tagName==="INPUT"&&(i.code==="ArrowUp"||i.code==="ArrowDown")){i.preventDefault(),zd(i.code==="ArrowDown"?1:-1);return}if(i.target&&/^(INPUT|SELECT|TEXTAREA)$/.test(i.target.tagName)){i.code==="Escape"&&(i.target.blur(),yt==="inventory"?Ho():yt==="settings"&&gl());return}if(yt==="menu"){const e={ArrowDown:"down",ArrowUp:"up",ArrowLeft:"left",ArrowRight:"right"}[i.code];e?(i.preventDefault(),document.activeElement&&br()&&br().contains(document.activeElement)?U0(e):zd(1)):(i.code==="Escape"||i.code==="Backspace")&&(i.preventDefault(),mu()),Vo("keys");return}if(yt==="settings"){i.code==="Escape"&&gl();return}if(yt==="mp"){i.code==="Escape"&&D("mpClose").onclick();return}if(yt==="map"){(i.code==="Escape"||i.code===ei.map)&&(i.preventDefault(),Il());return}if(yt==="layout"){i.code==="Escape"&&xu();return}if(yt==="trade"){(i.code==="Escape"||i.code==="KeyE")&&(i.preventDefault(),uu());return}if(yt==="inventory"){(i.code===ei.inv||i.code==="Escape")&&(i.preventDefault(),Ho());return}if(yt!=="playing")return;const t=Iy(ei,i.code);if((t==="jump"||i.code==="Tab"||i.code.startsWith("Arrow"))&&i.preventDefault(),!i.repeat){if(/^Digit[1-9]$/.test(i.code)){P.selectSlot(Number(i.code[5])-1);return}if(i.code==="KeyZ"&&(i.ctrlKey||i.metaKey)){i.preventDefault(),P.undo(i.shiftKey);return}if(i.code==="KeyY"&&(i.ctrlKey||i.metaKey)){i.preventDefault(),P.undo(!0);return}if(t==="inv"){i.preventDefault(),Cl();return}if(t==="fly"){ml();return}if(t==="build"){P.cycleBuild(i.shiftKey?-1:1);return}if(t==="rotate"){P.rotateDeco(i.shiftKey?-1:1)||ee("Schau auf ein Deko-Stück zum Drehen");return}if(t==="hook"){P.fireHook();return}if(t==="wp"){P.toggleWaypoint();return}if(t==="map"){Nl();return}if(t==="quests"){Us=!Us,Fi();return}if(t==="jump"){const e=performance.now();e-Fd<280&&ml(),Fd=e}Pn.add(i.code),zs()}});window.addEventListener("keyup",i=>{Pn.delete(i.code),yt==="playing"&&zs()});window.addEventListener("blur",()=>{Pn.clear(),zs()});const k0=.0022,sE=.0058;function gu(i,t,e){P.yaw-=i*e,P.pitch=Math.max(-1.55,Math.min(1.55,P.pitch-t*e*(ft.invertY?-1:1)))}window.addEventListener("mousemove",i=>{yt==="playing"&&Xn()&&gu(i.movementX,i.movementY,k0*ft.mouseSens)});Yo.addEventListener("mousedown",i=>{if(!(yt!=="playing"||bn&&i.sourceCapabilities&&i.sourceCapabilities.firesTouchEvents)){if(os(),!Xn()){gs();return}i.button===0?P.breakHeld=!0:i.button===2&&(P.placeHeld=!0),i.preventDefault()}});window.addEventListener("mouseup",i=>{i.button===0?P.breakHeld=!1:i.button===2&&(P.placeHeld=!1)});Yo.addEventListener("contextmenu",i=>i.preventDefault());window.addEventListener("wheel",i=>{yt==="playing"&&P.selectSlot(P.sel+(i.deltaY>0?1:-1))},{passive:!0});function rE(){bn&&document.body.classList.contains("touch")||(bn=!0,document.body.classList.add("touch"),D("bFly").hidden=P.mode!=="creative")}bn&&document.body.classList.add("touch");window.addEventListener("pointerdown",i=>{i.pointerType==="touch"&&rE()},{capture:!0});(function(){const t=D("zl"),e=D("zr"),n=D("joy"),s=D("thumb"),r=52;let o=null,a=null;t.addEventListener("pointerdown",f=>{o||(os(),o={id:f.pointerId,x:f.clientX,y:f.clientY},t.setPointerCapture(f.pointerId),n.style.display="block",n.style.left=f.clientX+"px",n.style.top=f.clientY+"px",s.style.transform="translate(0,0)",ti.joy=!0)}),t.addEventListener("pointermove",f=>{if(!o||f.pointerId!==o.id)return;let u=f.clientX-o.x,p=f.clientY-o.y;const x=Math.hypot(u,p),v=x>r?r/x:1;s.style.transform=`translate(${u*v}px,${p*v}px)`;const m=Math.min(1,x*ft.joySens/r),g=m<.14?0:(m-.14)/.86,_=x?u/x:0,M=x?p/x:0;P.input.r=_*g,P.input.f=-M*g,P.input.sprint=x>r*1.35});const l=f=>{!o||f.pointerId!==o.id||(o=null,n.style.display="none",ti.joy=!1,P.input.f=P.input.r=0,P.input.sprint=!1,zs())};t.addEventListener("pointerup",l),t.addEventListener("pointercancel",l),e.addEventListener("pointerdown",f=>{a||(a={id:f.pointerId,x:f.clientX,y:f.clientY},e.setPointerCapture(f.pointerId))}),e.addEventListener("pointermove",f=>{!a||f.pointerId!==a.id||(gu(f.clientX-a.x,f.clientY-a.y,sE*ft.touchSens),a.x=f.clientX,a.y=f.clientY)});const c=f=>{a&&f.pointerId===a.id&&(a=null)};e.addEventListener("pointerup",c),e.addEventListener("pointercancel",c);const h=(f,u,p)=>{const x=D(f);x.addEventListener("pointerdown",m=>{m.preventDefault(),os(),x.setPointerCapture(m.pointerId),x.classList.add("on"),u()});const v=()=>{x.classList.remove("on"),p()};x.addEventListener("pointerup",v),x.addEventListener("pointercancel",v)};h("bBreak",()=>{P.breakHeld=!0},()=>{P.breakHeld=!1}),h("bPlace",()=>{P.placeHeld=!0},()=>{P.placeHeld=!1}),h("bJump",()=>{ti.jump=!0,P.input.jump=!0},()=>{ti.jump=!1,P.input.jump=Pn.has("Space")}),h("bDown",()=>{ti.down=!0,P.input.down=!0},()=>{ti.down=!1,P.input.down=!1}),D("bFly").addEventListener("click",ml),D("bHook").addEventListener("pointerdown",f=>{f.preventDefault(),os(),P.fireHook()})})();const St={active:!1,prev:[],raf:0,last:0,idx:-1,style:"generic",used:0,cap:null,rt:!1,lt:!1,run:!1,dir:"",dirT:0,dirN:0};let Ir=cu(ft.padKeys);function Pl(){const i=navigator.getGamepads?[...navigator.getGamepads()]:[],t=i[St.idx];if(t&&t.connected)return t;const e=i.find(n=>n&&n.connected);return e&&(St.idx=e.index,St.style=v0(e.id)),e||null}Ch.fn=i=>{St.raf&&performance.now()-St.used<3e4&&Al(Pl(),i,ft.padRumble)};const Bd={inventory:"inv",settings:"set",mp:"mp",map:"map",trade:"trade",dead:"dead"};function br(){return yt==="menu"?D(hn?fl[hn]:"mmNav"):yt==="paused"?D("qlog").hidden?D("pause"):D("qlog"):Bd[yt]?D(Bd[yt]):null}function oE(){yt==="menu"?mu():yt==="paused"?D("qlog").hidden?Rl():cn("qlog",!1):yt==="inventory"?Ho():yt==="settings"?St.cap||Ii?(St.cap=Ii=null,_u()):gl():yt==="mp"?D("mpClose").onclick():yt==="map"?Il():yt==="trade"?uu():yt==="layout"&&xu()}const Dc=(i,t)=>i.dispatchEvent(new Event(t,{bubbles:!0}));function kh(i){i.focus({preventScroll:!0,focusVisible:!0}),i.scrollIntoView({block:"nearest",inline:"nearest"})}function U0(i){const t=br();if(!t)return;const e=Dl(t);if(!e.length)return;const n=e.indexOf(document.activeElement),s=e[n];if(s&&(i==="left"||i==="right")){const a=i==="right"?1:-1;if(s.type==="range"){a>0?s.stepUp():s.stepDown(),Dc(s,"input"),Dc(s,"change");return}if(s.tagName==="SELECT"){const l=s.options.length;s.selectedIndex=(s.selectedIndex+a+l)%l,Dc(s,"change");return}}if(n<0){kh(t.querySelector(".cell:not([disabled]),.go,.big")||e.find(a=>!a.classList.contains("x"))||e[0]);return}const r=e.map(a=>{const l=a.getBoundingClientRect();return{x:l.left,y:l.top,w:l.width,h:l.height}});let o=Fy(r,n,i);o<0&&(i==="up"||i==="down")&&(o=(n+(i==="down"?1:-1)+e.length)%e.length),o>=0&&kh(e[o])}function aE(i){for(let t=i;t&&t!==document.body;t=t.parentElement){const e=getComputedStyle(t).overflowY;if((e==="auto"||e==="scroll")&&t.scrollHeight>t.clientHeight)return t}return null}function lE(i,t){const e=i.buttons,n=e[le.UP]?"up":e[le.DOWN]?"down":e[le.LEFT]?"left":e[le.RIGHT]?"right":i.f>.55?"up":i.f<-.55?"down":i.r<-.55?"left":i.r>.55?"right":"";return n!==St.dir?(St.dir=n,St.dirT=t,St.dirN=0,n):n&&t-St.dirT>(St.dirN?110:380)?(St.dirT=t,St.dirN++,n):""}function cE(i,t,e,n){if(St.cap){const r=i.buttons.findIndex((o,a)=>o&&a<lu&&t(a));if(r>=0){const o=ky(Ir,St.cap,r);o&&(Ir=o,ft.padKeys={...o},ds(ft)),St.cap=null,Wr()}return}if(yt==="paused"&&i.hit.pause){Rl();return}if(yt==="inventory"&&i.hit.inv){Ho();return}if(yt==="map"&&i.hit.map){Il();return}if(t(M0(St.style))){oE();return}const s=lE(i,e);if(s&&U0(s),t(_0(St.style))){const r=br(),o=document.activeElement;if(r&&o&&r.contains(o)&&o!==document.body)o.click();else if(r){const a=Dl(r);a[0]&&kh(a[0])}}if(yt==="inventory"){if(t(le.LB)||t(le.RB)){const r=[...D("invTabs").querySelectorAll("[data-cat]")],o=r.findIndex(l=>l.dataset.cat===Li),a=r[(o+(t(le.RB)?1:-1)+r.length)%r.length];a&&a.click()}(t(le.LT)||t(le.RT))&&(P.selectSlot((P.sel+(t(le.RT)?1:8))%9),ms()),t(le.W)&&document.activeElement&&document.activeElement.closest("#invGrid,#recipes")&&document.activeElement.dispatchEvent(new MouseEvent("click",{bubbles:!0,shiftKey:!0}))}if(yt==="map"){if(t(le.LB)&&Zi.zoom(-1),t(le.RB)&&Zi.zoom(1),i.lx||i.ly){const r=160*n/Math.max(.25,Zi.zoomLevel?Zi.zoomLevel():1);Zi.cx+=i.lx*r,Zi.cz+=i.ly*r,Zi.draw()}}else if(i.ly){const r=aE(document.activeElement)||br()&&br().querySelector(".panel");r&&(r.scrollTop+=i.ly*18)}}const Hd=i=>i*(.45+.55*Math.abs(i));function z0(i){const t=Pl();if(!t){St.raf=0,St.active=!1,Wr(),Vo("keys");return}St.raf=requestAnimationFrame(z0);const e=Math.min(.05,(i-(St.last||i))/1e3);St.last=i;const n=St.prev,s=zy(t,n,Ir,ft.padDead);St.prev=s.buttons;const r=h=>s.buttons[h]&&!n[h];if((s.buttons.some(Boolean)||s.r||s.f||s.lx||s.ly)&&((!St.used||i-St.used>5e3)&&(document.body.classList.add("pad"),yt==="menu"&&Vo("pad")),St.used=i,os()),yt==="loading")return;if(yt!=="playing"){cE(s,r,i,e);return}const o=P.input,a=s.r||s.f,l=P.player.flying,c=s.held;s.hit.sprint&&(St.run=!St.run),a?(St.active=!0,o.r=s.r,o.f=s.f,o.sprint=St.run||!l&&c.sneak):St.active&&(St.active=!1,St.run=!1,o.f=o.r=0,o.sprint=!1,zs()),(s.lx||s.ly)&&gu(Hd(s.lx)*900*e,Hd(s.ly)*600*e*(ft.padInvertY?-1:1),k0*ft.padSens),o.jump=c.jump||Pn.has(ei.jump)||ti.jump,o.down=c.sneak&&l||ti.down||l&&Pn.has(ei.sneak),o.sneak=c.sneak||Pn.has(ei.sneak),!a&&c.sneak!==!!St.sneak&&(c.sneak?o.sprint=!l:zs()),St.sneak=c.sneak,c.break!==St.rt&&(St.rt=c.break,P.breakHeld=St.rt),c.place!==St.lt&&(St.lt=c.place,P.placeHeld=St.lt),s.hit.hook&&(Al(t,"hook",ft.padRumble),P.fireHook()),s.hit.prev&&P.selectSlot((P.sel+8)%9),s.hit.next&&P.selectSlot((P.sel+1)%9),s.hit.fly&&ml(),s.hit.wp&&P.toggleWaypoint(),s.hit.build&&P.cycleBuild(1),s.hit.quests&&(Us=!Us,Fi()),s.hit.undo&&P.mode==="creative"&&P.undo(!1),s.hit.inv?Cl():s.hit.map?Nl():s.hit.pause&&Hi()}window.addEventListener("gamepadconnected",i=>{St.idx=i.gamepad.index,St.style=v0(i.gamepad.id),St.used=performance.now(),document.body.classList.add("pad"),ee(`🎮 ${x0[St.style]} verbunden`),Vo("pad"),Wr(),Al(i.gamepad,"done",ft.padRumble),St.raf||(St.raf=requestAnimationFrame(z0))});window.addEventListener("gamepaddisconnected",i=>{i.gamepad.index===St.idx&&(St.idx=-1,ee("🎮 Controller getrennt"),Vr(),yt==="playing"&&Hi())});window.addEventListener("mousemove",()=>{St.used&&performance.now()-St.used>1500&&document.body.classList.remove("pad")},{passive:!0});window.addEventListener("resize",()=>P.resize());let Fs=ft.minimap;D("mm").classList.toggle("off",!Fs);const Zi=new Py(P,D,ee);function Nl(){yt!=="playing"||!P.map||(Vr(),Pe("map"),D("mapMini").checked=Fs,Xn()&&document.exitPointerLock(),wl(),Zi.open())}function Il(){yt==="map"&&(Pe("playing"),P.resume(),gs(),hs()&&setTimeout(()=>{yt==="playing"&&!Xn()&&hs()&&Hi()},250))}D("mapClose").onclick=Il;D("mm").addEventListener("click",()=>Nl());D("mapMini").onchange=i=>{Fs=ft.minimap=i.target.checked,ds(ft),D("mm").classList.toggle("off",!Fs)};const Be=D("mm").getContext("2d"),Vd=Be.createImageData(56,56);function hE(){const i=P.world,t=P.player,e=Vd.data,n=Math.floor(t.x)-28,s=Math.floor(t.z)-28,r=t.y;for(let o=0;o<56;o++)for(let a=0;a<56;a++){const l=n+a,c=s+o,h=i.getChunk(l>>4,c>>4),f=(o*56+a)*4;let u=14,p=18,x=32;if(h){const v=(l&15)+(c&15)*16;let m=Math.min(ie-1,h.maxY);for(;m>0&&h.data[v+m*256]===0;)m--;const g=h.data[v+m*256],_=Gt[g]?Gt[g].map:[200,200,210],M=g===d.WATER?1:Math.max(.55,Math.min(1.25,1+(m-r)*.025));u=_[0]*M,p=_[1]*M,x=_[2]*M}e[f]=u,e[f+1]=p,e[f+2]=x,e[f+3]=255}if(Be.putImageData(Vd,0,0),P.wp){let o=P.wp.x-t.x,a=P.wp.z-t.z;const l=Math.max(Math.abs(o),Math.abs(a)),c=l>25?25/l:1;o*=c,a*=c,Be.fillStyle="#ff2d95",Be.fillRect(28+o-2,28+a-2,5,5),Be.strokeStyle="#fff",Be.strokeRect(28+o-2.5,28+a-2.5,6,6)}Be.save(),Be.translate(28,28),Be.rotate(-P.yaw),Be.fillStyle="#fff",Be.strokeStyle="#000",Be.beginPath(),Be.moveTo(0,-5),Be.lineTo(3.5,4),Be.lineTo(0,2),Be.lineTo(-3.5,4),Be.closePath(),Be.fill(),Be.stroke(),Be.restore()}let uE=0;setInterval(()=>{if(yt!=="playing")return;const i=P.player;let t="";i.flying&&(t+=" · fliegt"),i.gliding&&(t+=" · gleitet"),P.hookT>0&&(t+=" · Haken"),P.wp&&(t+=` · 📍 ${Math.round(Math.hypot(P.wp.x-i.x,P.wp.z-i.z))} m`),P.radioDist<24&&(t+=" · ♪");const e=P.biomeName();e&&(t+=" · "+e),ft.showFps&&(t+=` · ${P.fps} FPS`),D("info").textContent=`${P.clockText()} ${P.time<.5?"☀":"☾"} · X ${i.x.toFixed(0)} Y ${i.y.toFixed(0)} Z ${i.z.toFixed(0)}${t}`,D("uw").classList.toggle("on",!!P.underwater),Fs&&!(uE++&1)&&hE(),P.story&&Fi()},250);function F0(){const i=ft.quality==="auto";P.setQuality(i?US(hu):ft.quality,i),P.placeDelay=ft.placeDelay,P.deathLoss=ft.deathLoss,P.enemies=ft.enemies,P.preview=ft.preview,mn.vol=ft.sfxVol,mn.music=ft.musicVol,mn.amb=ft.ambVol,document.documentElement.style.setProperty("--tbs",String(ft.btnScale)),document.body.classList.toggle("lefty",ft.lefty)}const B0=[["sMouse","mouseSens",i=>i.toFixed(1)+"×"],["sTouch","touchSens",i=>i.toFixed(1)+"×"],["sJoy","joySens",i=>i.toFixed(1)+"×"],["sBtn","btnScale",i=>Math.round(i*100)+" %"],["sSfx","sfxVol",i=>Math.round(i*100)+" %"],["sMus","musicVol",i=>Math.round(i*100)+" %"],["sAmb","ambVol",i=>Math.round(i*100)+" %"],["sPadSens","padSens",i=>i.toFixed(1)+"×"],["sPadRum","padRumble",i=>i?Math.round(i*100)+" %":"aus"],["sPadDead","padDead",i=>Math.round(i*100)+" %"]],H0=[["sPadInv","padInvertY"],["sLefty","lefty"],["sInvY","invertY"],["sPlace","placeDelay"],["sFps","showFps"],["sEnemy","enemies"],["sPreview","preview"]];let Ii=null;function vu(){const i=D("sKeys");i.textContent="";for(const[t,e]of Ro){const n=document.createElement("label"),s=document.createElement("button");n.textContent=e,s.dataset.a=t,s.textContent=Ii===t?"Taste drücken …":Oy(ei[t]),s.className=Ii===t?"wait":"",n.append(s),i.append(n)}}function Wr(){const i=D("sPadKeys");if(!i)return;const t=St.raf?Pl():null;D("sPad").textContent=t?`Erkannt: ${x0[St.style]} (${String(t.id).slice(0,48)})${t.vibrationActuator||t.hapticActuators&&t.hapticActuators.length?" · mit Vibration":""}`:"Kein Controller erkannt – eine Taste am Controller drücken.",i.textContent="";for(const[e,n]of Co){const s=document.createElement("label"),r=document.createElement("button");s.textContent=n,r.dataset.pa=e,r.textContent=St.cap===e?"Taste drücken …":Lh(St.style,Ir[e]),r.className=St.cap===e?"wait":"",s.append(r),i.append(s)}}D("sPadKeys").addEventListener("click",i=>{const t=i.target.closest("button[data-pa]");t&&(i.preventDefault(),St.cap=t.dataset.pa,Wr(),t.focus())});D("sPadTest").onclick=()=>{const i=Pl();ee(i&&Al(i,"hurt",Math.max(.5,ft.padRumble))?"📳 Vibration":"Dieser Controller oder Browser kann nicht vibrieren")};D("sPadReset").onclick=()=>{ft.padKeys={},Ir=cu({}),ds(ft),Wr(),ee("Controller-Belegung zurückgesetzt")};D("sKeys").addEventListener("click",i=>{const t=i.target.closest("button[data-a]");t&&(i.preventDefault(),Ii=t.dataset.a,vu())});const fE=["bJump","bDown","bBreak","bPlace","bFly","bHook"];function Ol(){for(const i of fE){const t=D(i),e=ft.touchPos[i],n=Array.isArray(e)&&e.length===2&&e.every(s=>Number.isFinite(s)&&s>=0&&s<=1);t.style.left=n?e[0]*100+"%":"",t.style.top=n?e[1]*100+"%":"",t.style.right=t.style.bottom=n?"auto":"",t.style.transform=n?"translate(-50%,-50%)":""}}let V0="settings",Lo=null;function dE(){V0=ks,Pe("layout"),D("layoutBar").hidden=!1}function xu(){D("layoutBar").hidden=!0,ds(ft),Pe("settings"),ks=V0}D("sLayout").onclick=dE;D("lDone").onclick=xu;D("lReset").onclick=()=>{ft.touchPos={},Ol()};D("touch").addEventListener("pointerdown",i=>{if(yt!=="layout")return;const t=i.target.closest(".tb");if(i.stopPropagation(),i.preventDefault(),!!t){try{t.setPointerCapture(i.pointerId)}catch{}Lo={el:t,id:i.pointerId}}},{capture:!0});D("touch").addEventListener("pointermove",i=>{if(yt!=="layout"||!Lo||Lo.id!==i.pointerId)return;const t=Math.max(.04,Math.min(.96,i.clientX/innerWidth)),e=Math.max(.1,Math.min(.94,i.clientY/innerHeight));ft.touchPos={...ft.touchPos,[Lo.el.id]:[+t.toFixed(3),+e.toFixed(3)]},Ol()},{capture:!0});D("touch").addEventListener("pointerup",i=>{yt==="layout"&&(i.stopPropagation(),Lo=null)},{capture:!0});function _u(){vu(),Wr(),D("sQuality").value=ft.quality,D("sDeath").value=ft.deathLoss;for(const[i,t,e]of B0)D(i).value=ft[t],D(i+"V").textContent=e(ft[t]);for(const[i,t]of H0)D(i).checked=ft[t]}function jo(i){ds(ft),i?F0():(P.placeDelay=ft.placeDelay,P.deathLoss=ft.deathLoss,P.enemies=ft.enemies,P.preview=ft.preview,mn.vol=ft.sfxVol,mn.music=ft.musicVol,document.documentElement.style.setProperty("--tbs",String(ft.btnScale)),document.body.classList.toggle("lefty",ft.lefty))}D("sQuality").onchange=i=>{ft.quality=i.target.value,jo(!0)};D("sDeath").onchange=i=>{ft.deathLoss=i.target.value,jo(!1)};for(const[i,t,e]of B0)D(i).oninput=n=>{ft[t]=Number(n.target.value),D(i+"V").textContent=e(ft[t]),jo(!1)};for(const[i,t]of H0)D(i).onchange=e=>{ft[t]=e.target.checked,jo(!1)};D("sReset").onclick=()=>{ft={...Mo,keys:{},padKeys:{},touchPos:{},stun:ft.stun,mpName:ft.mpName},ei=g0(ft.keys),Ir=cu({}),Ol(),Fs=ft.minimap,D("mm").classList.toggle("off",!Fs),jo(!0),_u(),ee("Standard wiederhergestellt")};function W0(){ks=yt,_u(),Pe("settings")}function gl(){yt==="settings"&&(Ii=null,St.cap=null,Pe(ks),ks==="paused"&&(D("vd").value=P.viewDist,D("vdVal").textContent=P.viewDist))}D("pSettings").onclick=W0;D("mSettings").onclick=W0;D("setClose").onclick=gl;F0();Ol();ni();const oi=new Dy(P,{toast:i=>ee(i),status:i=>{D("mpStatus").textContent=i},players:i=>{D("mpPlayers").innerHTML=i.map(t=>`<li><span>👤 ${t.name.replace(/[<>&]/g,"")}</span>${oi.host?`<button data-kick="${t.id}">Entfernen</button>`:""}</li>`).join("")},joined:i=>{Pr=-1,D("bFly").hidden=!(bn&&P.mode==="creative"),D("bUndo").hidden=P.mode!=="creative",D("bmode").hidden=!0,ms(),Fi(),Pe("playing"),Nr(),gs(),Er(`👥 Bei ${String(i.host).replace(/[<>&]/g,"")}<small>Du spielst in seiner Welt. Dein Vorrat gilt nur für diesen Besuch; gespeichert wird beim Gastgeber.</small>`)},ended:(i,t)=>{ee(i),t?(Pr=-1,ni(),Pe("menu"),P.startMenu(),Fi(),Nr()):oi.listPlayers()}});let xr=null,G0="menu";function K0(i){G0=yt,ks=yt==="paused"?"paused":"menu",D("mpHost").hidden=!i,D("mpGuest").hidden=i,D("mpStun").checked=ft.stun,D("mpName").value=ft.mpName,D("mpStatus").textContent="",i&&oi.listPlayers(),Pe("mp")}D("pMp").onclick=()=>K0(!0);D("mJoin").onclick=()=>{os(),D("mpAnswerBox").hidden=!0,K0(!1)};D("mpClose").onclick=()=>{Pe(G0==="paused"?"paused":"menu")};D("mpStun").onchange=i=>{ft.stun=i.target.checked,ds(ft)};const X0=i=>{const t=D(i);t.select(),(navigator.clipboard?navigator.clipboard.writeText(t.value):Promise.reject()).then(()=>ee("Kopiert ✔"),()=>{document.execCommand("copy"),ee("Kopiert")})};D("mpCopyO").onclick=()=>X0("mpOffer");D("mpCopyA").onclick=()=>X0("mpAnswer");D("mpInvite").onclick=async()=>{oi.useStun=ft.stun,oi.myName=ft.mpName||"Gastgeber",D("mpStatus").textContent="Einladung wird vorbereitet …",D("mpInvite").disabled=!0;try{xr=await oi.invite(),D("mpOffer").value=xr.code,D("mpAnswerIn").value="",D("mpOfferBox").hidden=!1,D("mpStatus").textContent="Einladung kopieren und schicken, dann die Antwort einfügen."}catch(i){D("mpStatus").textContent="Einladung ging nicht: "+(i.message||i)}D("mpInvite").disabled=!1};D("mpConnect").onclick=async()=>{if(xr)try{await xr.accept(D("mpAnswerIn").value),D("mpStatus").textContent="Verbinde …";const i=xr.pc;xr=null,D("mpOfferBox").hidden=!0;const t=setTimeout(()=>{i.connectionState!=="connected"&&(D("mpStatus").textContent="Keine Verbindung. Tipp: „Über das Internet verbinden“ bei beiden einschalten oder im selben WLAN spielen.")},15e3);i.addEventListener("connectionstatechange",()=>{i.connectionState==="connected"&&(clearTimeout(t),D("mpStatus").textContent="Verbunden ✔")})}catch(i){D("mpStatus").textContent=i.message||"Antwort-Code passt nicht"}};D("mpPlayers").addEventListener("click",i=>{const t=i.target.closest("[data-kick]");t&&oi.kick(Number(t.dataset.kick))});D("mpJoin").onclick=async()=>{const i=D("mpName").value.trim();ft.mpName=i,ft.stun=D("mpStun").checked,ds(ft),P.mp&&oi.end(null),oi.useStun=ft.stun,D("mpStatus").textContent="Antwort wird erstellt …",D("mpJoin").disabled=!0;try{const t=await oi.join(D("mpInviteIn").value,i||"Gast");D("mpAnswer").value=t,D("mpAnswerBox").hidden=!1,D("mpStatus").textContent="Antwort kopieren und dem Gastgeber schicken. Sobald er sie einfügt, geht es los."}catch(t){D("mpStatus").textContent=t.message||"Einladungs-Code passt nicht"}D("mpJoin").disabled=!1};Pe("menu");P.startMenu();
