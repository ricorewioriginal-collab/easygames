(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function e(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=e(s);fetch(s.href,r)}})();/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const fh="170",am=0,Yh=1,om=2,ad=1,lm=2,gi=3,bi=0,ln=1,mn=2,xi=0,or=1,cc=2,jh=3,Zh=4,cm=5,_s=100,hm=101,um=102,fm=103,dm=104,pm=200,mm=201,gm=202,vm=203,hc=204,uc=205,_m=206,xm=207,Mm=208,ym=209,Sm=210,Em=211,bm=212,Tm=213,Am=214,fc=0,dc=1,pc=2,ur=3,mc=4,gc=5,vc=6,_c=7,od=0,wm=1,Rm=2,Yi=0,Cm=1,Lm=2,Dm=3,Pm=4,Im=5,Nm=6,Om=7,ld=300,fr=301,dr=302,xc=303,Mc=304,jo=306,No=1e3,Ms=1001,yc=1002,Je=1003,km=1004,Oa=1005,on=1006,pl=1007,si=1008,Ti=1009,cd=1010,hd=1011,fa=1012,dh=1013,ts=1014,ri=1015,ai=1016,ph=1017,mh=1018,pr=1020,ud=35902,fd=1021,dd=1022,Nn=1023,pd=1024,md=1025,lr=1026,mr=1027,gh=1028,vh=1029,gd=1030,_h=1031,xh=1033,Mo=33776,yo=33777,So=33778,Eo=33779,Sc=35840,Ec=35841,bc=35842,Tc=35843,Ac=36196,wc=37492,Rc=37496,Cc=37808,Lc=37809,Dc=37810,Pc=37811,Ic=37812,Nc=37813,Oc=37814,kc=37815,Uc=37816,zc=37817,Fc=37818,Bc=37819,Hc=37820,Gc=37821,bo=36492,Vc=36494,Wc=36495,vd=36283,Xc=36284,$c=36285,qc=36286,Um=3200,zm=3201,Fm=0,Bm=1,Vi="",Pn="srgb",yr="srgb-linear",Zo="linear",me="srgb",Is=7680,Jh=519,Hm=512,Gm=513,Vm=514,_d=515,Wm=516,Xm=517,$m=518,qm=519,Kc=35044,Qh="300 es",vi=2e3,Oo=2001;class Sr{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const s=this._listeners[t];if(s!==void 0){const r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const n=this._listeners[t.type];if(n!==void 0){t.target=this;const s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}}const qe=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],To=Math.PI/180,Yc=180/Math.PI;function ji(){const i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(qe[i&255]+qe[i>>8&255]+qe[i>>16&255]+qe[i>>24&255]+"-"+qe[t&255]+qe[t>>8&255]+"-"+qe[t>>16&15|64]+qe[t>>24&255]+"-"+qe[e&63|128]+qe[e>>8&255]+"-"+qe[e>>16&255]+qe[e>>24&255]+qe[n&255]+qe[n>>8&255]+qe[n>>16&255]+qe[n>>24&255]).toLowerCase()}function pn(i,t,e){return Math.max(t,Math.min(e,i))}function Km(i,t){return(i%t+t)%t}function ml(i,t,e){return(1-e)*i+e*t}function ii(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function ve(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}class kt{constructor(t=0,e=0){kt.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(pn(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*s+t.x,this.y=r*s+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class qt{constructor(t,e,n,s,r,a,o,l,c){qt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c)}set(t,e,n,s,r,a,o,l,c){const h=this.elements;return h[0]=t,h[1]=s,h[2]=o,h[3]=e,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],f=n[2],p=n[5],v=n[8],_=s[0],m=s[3],d=s[6],x=s[1],M=s[4],y=s[7],C=s[2],A=s[5],R=s[8];return r[0]=a*_+o*x+l*C,r[3]=a*m+o*M+l*A,r[6]=a*d+o*y+l*R,r[1]=c*_+h*x+u*C,r[4]=c*m+h*M+u*A,r[7]=c*d+h*y+u*R,r[2]=f*_+p*x+v*C,r[5]=f*m+p*M+v*A,r[8]=f*d+p*y+v*R,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8];return e*a*h-e*o*c-n*r*h+n*o*l+s*r*c-s*a*l}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=h*a-o*c,f=o*l-h*r,p=c*r-a*l,v=e*u+n*f+s*p;if(v===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/v;return t[0]=u*_,t[1]=(s*c-h*n)*_,t[2]=(o*n-s*a)*_,t[3]=f*_,t[4]=(h*e-s*l)*_,t[5]=(s*r-o*e)*_,t[6]=p*_,t[7]=(n*l-c*e)*_,t[8]=(a*e-n*r)*_,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+t,-s*c,s*l,-s*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return this.premultiply(gl.makeScale(t,e)),this}rotate(t){return this.premultiply(gl.makeRotation(-t)),this}translate(t,e){return this.premultiply(gl.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const gl=new qt;function xd(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function da(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Ym(){const i=da("canvas");return i.style.display="block",i}const tu={};function Zr(i){i in tu||(tu[i]=!0,console.warn(i))}function jm(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}function Zm(i){const t=i.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function Jm(i){const t=i.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}const oe={enabled:!0,workingColorSpace:yr,spaces:{},convert:function(i,t,e){return this.enabled===!1||t===e||!t||!e||(this.spaces[t].transfer===me&&(i.r=Mi(i.r),i.g=Mi(i.g),i.b=Mi(i.b)),this.spaces[t].primaries!==this.spaces[e].primaries&&(i.applyMatrix3(this.spaces[t].toXYZ),i.applyMatrix3(this.spaces[e].fromXYZ)),this.spaces[e].transfer===me&&(i.r=cr(i.r),i.g=cr(i.g),i.b=cr(i.b))),i},fromWorkingColorSpace:function(i,t){return this.convert(i,this.workingColorSpace,t)},toWorkingColorSpace:function(i,t){return this.convert(i,t,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===Vi?Zo:this.spaces[i].transfer},getLuminanceCoefficients:function(i,t=this.workingColorSpace){return i.fromArray(this.spaces[t].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,t,e){return i.copy(this.spaces[t].toXYZ).multiply(this.spaces[e].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}};function Mi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function cr(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}const eu=[.64,.33,.3,.6,.15,.06],nu=[.2126,.7152,.0722],iu=[.3127,.329],su=new qt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),ru=new qt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);oe.define({[yr]:{primaries:eu,whitePoint:iu,transfer:Zo,toXYZ:su,fromXYZ:ru,luminanceCoefficients:nu,workingColorSpaceConfig:{unpackColorSpace:Pn},outputColorSpaceConfig:{drawingBufferColorSpace:Pn}},[Pn]:{primaries:eu,whitePoint:iu,transfer:me,toXYZ:su,fromXYZ:ru,luminanceCoefficients:nu,outputColorSpaceConfig:{drawingBufferColorSpace:Pn}}});let Ns;class Qm{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{Ns===void 0&&(Ns=da("canvas")),Ns.width=t.width,Ns.height=t.height;const n=Ns.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=Ns}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=da("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Mi(r[a]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Mi(e[n]/255)*255):e[n]=Mi(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let t0=0;class Md{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:t0++}),this.uuid=ji(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(vl(s[a].image)):r.push(vl(s[a]))}else r=vl(s);n.url=r}return e||(t.images[this.uuid]=n),n}}function vl(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Qm.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let e0=0;class Xe extends Sr{constructor(t=Xe.DEFAULT_IMAGE,e=Xe.DEFAULT_MAPPING,n=Ms,s=Ms,r=on,a=si,o=Nn,l=Ti,c=Xe.DEFAULT_ANISOTROPY,h=Vi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:e0++}),this.uuid=ji(),this.name="",this.source=new Md(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new kt(0,0),this.repeat=new kt(1,1),this.center=new kt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new qt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==ld)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case No:t.x=t.x-Math.floor(t.x);break;case Ms:t.x=t.x<0?0:1;break;case yc:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case No:t.y=t.y-Math.floor(t.y);break;case Ms:t.y=t.y<0?0:1;break;case yc:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}Xe.DEFAULT_IMAGE=null;Xe.DEFAULT_MAPPING=ld;Xe.DEFAULT_ANISOTROPY=1;class Oe{constructor(t=0,e=0,n=0,s=1){Oe.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*s+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r;const l=t.elements,c=l[0],h=l[4],u=l[8],f=l[1],p=l[5],v=l[9],_=l[2],m=l[6],d=l[10];if(Math.abs(h-f)<.01&&Math.abs(u-_)<.01&&Math.abs(v-m)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+_)<.1&&Math.abs(v+m)<.1&&Math.abs(c+p+d-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const M=(c+1)/2,y=(p+1)/2,C=(d+1)/2,A=(h+f)/4,R=(u+_)/4,P=(v+m)/4;return M>y&&M>C?M<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(M),s=A/n,r=R/n):y>C?y<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(y),n=A/s,r=P/s):C<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(C),n=R/r,s=P/r),this.set(n,s,r,e),this}let x=Math.sqrt((m-v)*(m-v)+(u-_)*(u-_)+(f-h)*(f-h));return Math.abs(x)<.001&&(x=1),this.x=(m-v)/x,this.y=(u-_)/x,this.z=(f-h)/x,this.w=Math.acos((c+p+d-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class n0 extends Sr{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new Oe(0,0,t,e),this.scissorTest=!1,this.viewport=new Oe(0,0,t,e);const s={width:t,height:e,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:on,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const r=new Xe(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];const a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,s=t.textures.length;n<s;n++)this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const e=Object.assign({},t.texture.image);return this.texture.source=new Md(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class wn extends n0{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class yd extends Xe{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Je,this.minFilter=Je,this.wrapR=Ms,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class i0 extends Xe{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Je,this.minFilter=Je,this.wrapR=Ms,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Ta{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,a,o){let l=n[s+0],c=n[s+1],h=n[s+2],u=n[s+3];const f=r[a+0],p=r[a+1],v=r[a+2],_=r[a+3];if(o===0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u;return}if(o===1){t[e+0]=f,t[e+1]=p,t[e+2]=v,t[e+3]=_;return}if(u!==_||l!==f||c!==p||h!==v){let m=1-o;const d=l*f+c*p+h*v+u*_,x=d>=0?1:-1,M=1-d*d;if(M>Number.EPSILON){const C=Math.sqrt(M),A=Math.atan2(C,d*x);m=Math.sin(m*A)/C,o=Math.sin(o*A)/C}const y=o*x;if(l=l*m+f*y,c=c*m+p*y,h=h*m+v*y,u=u*m+_*y,m===1-o){const C=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=C,c*=C,h*=C,u*=C}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,s,r,a){const o=n[s],l=n[s+1],c=n[s+2],h=n[s+3],u=r[a],f=r[a+1],p=r[a+2],v=r[a+3];return t[e]=o*v+h*u+l*p-c*f,t[e+1]=l*v+h*f+c*u-o*p,t[e+2]=c*v+h*p+o*f-l*u,t[e+3]=h*v-o*u-l*f-c*p,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(s/2),u=o(r/2),f=l(n/2),p=l(s/2),v=l(r/2);switch(a){case"XYZ":this._x=f*h*u+c*p*v,this._y=c*p*u-f*h*v,this._z=c*h*v+f*p*u,this._w=c*h*u-f*p*v;break;case"YXZ":this._x=f*h*u+c*p*v,this._y=c*p*u-f*h*v,this._z=c*h*v-f*p*u,this._w=c*h*u+f*p*v;break;case"ZXY":this._x=f*h*u-c*p*v,this._y=c*p*u+f*h*v,this._z=c*h*v+f*p*u,this._w=c*h*u-f*p*v;break;case"ZYX":this._x=f*h*u-c*p*v,this._y=c*p*u+f*h*v,this._z=c*h*v-f*p*u,this._w=c*h*u+f*p*v;break;case"YZX":this._x=f*h*u+c*p*v,this._y=c*p*u+f*h*v,this._z=c*h*v-f*p*u,this._w=c*h*u-f*p*v;break;case"XZY":this._x=f*h*u-c*p*v,this._y=c*p*u-f*h*v,this._z=c*h*v+f*p*u,this._w=c*h*u+f*p*v;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],s=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],h=e[6],u=e[10],f=n+o+u;if(f>0){const p=.5/Math.sqrt(f+1);this._w=.25/p,this._x=(h-l)*p,this._y=(r-c)*p,this._z=(a-s)*p}else if(n>o&&n>u){const p=2*Math.sqrt(1+n-o-u);this._w=(h-l)/p,this._x=.25*p,this._y=(s+a)/p,this._z=(r+c)/p}else if(o>u){const p=2*Math.sqrt(1+o-n-u);this._w=(r-c)/p,this._x=(s+a)/p,this._y=.25*p,this._z=(l+h)/p}else{const p=2*Math.sqrt(1+u-n-o);this._w=(a-s)/p,this._x=(r+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(pn(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,s=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-s*o,this._w=a*h-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const n=this._x,s=this._y,r=this._z,a=this._w;let o=a*t._w+n*t._x+s*t._y+r*t._z;if(o<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,o=-o):this.copy(t),o>=1)return this._w=a,this._x=n,this._y=s,this._z=r,this;const l=1-o*o;if(l<=Number.EPSILON){const p=1-e;return this._w=p*a+e*this._w,this._x=p*n+e*this._x,this._y=p*s+e*this._y,this._z=p*r+e*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,o),u=Math.sin((1-e)*h)/c,f=Math.sin(e*h)/c;return this._w=a*u+this._w*f,this._x=n*u+this._x*f,this._y=s*u+this._y*f,this._z=r*u+this._z*f,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class N{constructor(t=0,e=0,n=0){N.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(au.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(au.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(t){const e=this.x,n=this.y,s=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*s-o*n),h=2*(o*e-r*s),u=2*(r*n-a*e);return this.x=e+l*c+a*u-o*h,this.y=n+l*h+o*c-r*u,this.z=s+l*u+r*h-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,s=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return _l.copy(this).projectOnVector(t),this.sub(_l)}reflect(t){return this.sub(_l.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(pn(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const _l=new N,au=new Ta;class Rs{constructor(t=new N(1/0,1/0,1/0),e=new N(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(Hn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(Hn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=Hn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,Hn):Hn.fromBufferAttribute(r,a),Hn.applyMatrix4(t.matrixWorld),this.expandByPoint(Hn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),ka.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ka.copy(n.boundingBox)),ka.applyMatrix4(t.matrixWorld),this.union(ka)}const s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Hn),Hn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Dr),Ua.subVectors(this.max,Dr),Os.subVectors(t.a,Dr),ks.subVectors(t.b,Dr),Us.subVectors(t.c,Dr),Oi.subVectors(ks,Os),ki.subVectors(Us,ks),cs.subVectors(Os,Us);let e=[0,-Oi.z,Oi.y,0,-ki.z,ki.y,0,-cs.z,cs.y,Oi.z,0,-Oi.x,ki.z,0,-ki.x,cs.z,0,-cs.x,-Oi.y,Oi.x,0,-ki.y,ki.x,0,-cs.y,cs.x,0];return!xl(e,Os,ks,Us,Ua)||(e=[1,0,0,0,1,0,0,0,1],!xl(e,Os,ks,Us,Ua))?!1:(za.crossVectors(Oi,ki),e=[za.x,za.y,za.z],xl(e,Os,ks,Us,Ua))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Hn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Hn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(ci[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),ci[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),ci[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),ci[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),ci[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),ci[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),ci[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),ci[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(ci),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const ci=[new N,new N,new N,new N,new N,new N,new N,new N],Hn=new N,ka=new Rs,Os=new N,ks=new N,Us=new N,Oi=new N,ki=new N,cs=new N,Dr=new N,Ua=new N,za=new N,hs=new N;function xl(i,t,e,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){hs.fromArray(i,r);const o=s.x*Math.abs(hs.x)+s.y*Math.abs(hs.y)+s.z*Math.abs(hs.z),l=t.dot(hs),c=e.dot(hs),h=n.dot(hs);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}const s0=new Rs,Pr=new N,Ml=new N;class is{constructor(t=new N,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):s0.setFromPoints(t).getCenter(n);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Pr.subVectors(t,this.center);const e=Pr.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(Pr,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Ml.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Pr.copy(t.center).add(Ml)),this.expandByPoint(Pr.copy(t.center).sub(Ml))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const hi=new N,yl=new N,Fa=new N,Ui=new N,Sl=new N,Ba=new N,El=new N;class Mh{constructor(t=new N,e=new N(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,hi)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=hi.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(hi.copy(this.origin).addScaledVector(this.direction,e),hi.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){yl.copy(t).add(e).multiplyScalar(.5),Fa.copy(e).sub(t).normalize(),Ui.copy(this.origin).sub(yl);const r=t.distanceTo(e)*.5,a=-this.direction.dot(Fa),o=Ui.dot(this.direction),l=-Ui.dot(Fa),c=Ui.lengthSq(),h=Math.abs(1-a*a);let u,f,p,v;if(h>0)if(u=a*l-o,f=a*o-l,v=r*h,u>=0)if(f>=-v)if(f<=v){const _=1/h;u*=_,f*=_,p=u*(u+a*f+2*o)+f*(a*u+f+2*l)+c}else f=r,u=Math.max(0,-(a*f+o)),p=-u*u+f*(f+2*l)+c;else f=-r,u=Math.max(0,-(a*f+o)),p=-u*u+f*(f+2*l)+c;else f<=-v?(u=Math.max(0,-(-a*r+o)),f=u>0?-r:Math.min(Math.max(-r,-l),r),p=-u*u+f*(f+2*l)+c):f<=v?(u=0,f=Math.min(Math.max(-r,-l),r),p=f*(f+2*l)+c):(u=Math.max(0,-(a*r+o)),f=u>0?r:Math.min(Math.max(-r,-l),r),p=-u*u+f*(f+2*l)+c);else f=a>0?-r:r,u=Math.max(0,-(a*f+o)),p=-u*u+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(yl).addScaledVector(Fa,f),p}intersectSphere(t,e){hi.subVectors(t.center,this.origin);const n=hi.dot(this.direction),s=hi.dot(hi)-n*n,r=t.radius*t.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,a,o,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return c>=0?(n=(t.min.x-f.x)*c,s=(t.max.x-f.x)*c):(n=(t.max.x-f.x)*c,s=(t.min.x-f.x)*c),h>=0?(r=(t.min.y-f.y)*h,a=(t.max.y-f.y)*h):(r=(t.max.y-f.y)*h,a=(t.min.y-f.y)*h),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),u>=0?(o=(t.min.z-f.z)*u,l=(t.max.z-f.z)*u):(o=(t.max.z-f.z)*u,l=(t.min.z-f.z)*u),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,hi)!==null}intersectTriangle(t,e,n,s,r){Sl.subVectors(e,t),Ba.subVectors(n,t),El.crossVectors(Sl,Ba);let a=this.direction.dot(El),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Ui.subVectors(this.origin,t);const l=o*this.direction.dot(Ba.crossVectors(Ui,Ba));if(l<0)return null;const c=o*this.direction.dot(Sl.cross(Ui));if(c<0||l+c>a)return null;const h=-o*Ui.dot(El);return h<0?null:this.at(h/a,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class de{constructor(t,e,n,s,r,a,o,l,c,h,u,f,p,v,_,m){de.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c,h,u,f,p,v,_,m)}set(t,e,n,s,r,a,o,l,c,h,u,f,p,v,_,m){const d=this.elements;return d[0]=t,d[4]=e,d[8]=n,d[12]=s,d[1]=r,d[5]=a,d[9]=o,d[13]=l,d[2]=c,d[6]=h,d[10]=u,d[14]=f,d[3]=p,d[7]=v,d[11]=_,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new de().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,n=t.elements,s=1/zs.setFromMatrixColumn(t,0).length(),r=1/zs.setFromMatrixColumn(t,1).length(),a=1/zs.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,s=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){const f=a*h,p=a*u,v=o*h,_=o*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=p+v*c,e[5]=f-_*c,e[9]=-o*l,e[2]=_-f*c,e[6]=v+p*c,e[10]=a*l}else if(t.order==="YXZ"){const f=l*h,p=l*u,v=c*h,_=c*u;e[0]=f+_*o,e[4]=v*o-p,e[8]=a*c,e[1]=a*u,e[5]=a*h,e[9]=-o,e[2]=p*o-v,e[6]=_+f*o,e[10]=a*l}else if(t.order==="ZXY"){const f=l*h,p=l*u,v=c*h,_=c*u;e[0]=f-_*o,e[4]=-a*u,e[8]=v+p*o,e[1]=p+v*o,e[5]=a*h,e[9]=_-f*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){const f=a*h,p=a*u,v=o*h,_=o*u;e[0]=l*h,e[4]=v*c-p,e[8]=f*c+_,e[1]=l*u,e[5]=_*c+f,e[9]=p*c-v,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){const f=a*l,p=a*c,v=o*l,_=o*c;e[0]=l*h,e[4]=_-f*u,e[8]=v*u+p,e[1]=u,e[5]=a*h,e[9]=-o*h,e[2]=-c*h,e[6]=p*u+v,e[10]=f-_*u}else if(t.order==="XZY"){const f=a*l,p=a*c,v=o*l,_=o*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=f*u+_,e[5]=a*h,e[9]=p*u-v,e[2]=v*u-p,e[6]=o*h,e[10]=_*u+f}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(r0,t,a0)}lookAt(t,e,n){const s=this.elements;return xn.subVectors(t,e),xn.lengthSq()===0&&(xn.z=1),xn.normalize(),zi.crossVectors(n,xn),zi.lengthSq()===0&&(Math.abs(n.z)===1?xn.x+=1e-4:xn.z+=1e-4,xn.normalize(),zi.crossVectors(n,xn)),zi.normalize(),Ha.crossVectors(xn,zi),s[0]=zi.x,s[4]=Ha.x,s[8]=xn.x,s[1]=zi.y,s[5]=Ha.y,s[9]=xn.y,s[2]=zi.z,s[6]=Ha.z,s[10]=xn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],f=n[9],p=n[13],v=n[2],_=n[6],m=n[10],d=n[14],x=n[3],M=n[7],y=n[11],C=n[15],A=s[0],R=s[4],P=s[8],T=s[12],E=s[1],I=s[5],$=s[9],V=s[13],Y=s[2],nt=s[6],q=s[10],it=s[14],W=s[3],st=s[7],mt=s[11],Ct=s[15];return r[0]=a*A+o*E+l*Y+c*W,r[4]=a*R+o*I+l*nt+c*st,r[8]=a*P+o*$+l*q+c*mt,r[12]=a*T+o*V+l*it+c*Ct,r[1]=h*A+u*E+f*Y+p*W,r[5]=h*R+u*I+f*nt+p*st,r[9]=h*P+u*$+f*q+p*mt,r[13]=h*T+u*V+f*it+p*Ct,r[2]=v*A+_*E+m*Y+d*W,r[6]=v*R+_*I+m*nt+d*st,r[10]=v*P+_*$+m*q+d*mt,r[14]=v*T+_*V+m*it+d*Ct,r[3]=x*A+M*E+y*Y+C*W,r[7]=x*R+M*I+y*nt+C*st,r[11]=x*P+M*$+y*q+C*mt,r[15]=x*T+M*V+y*it+C*Ct,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],h=t[2],u=t[6],f=t[10],p=t[14],v=t[3],_=t[7],m=t[11],d=t[15];return v*(+r*l*u-s*c*u-r*o*f+n*c*f+s*o*p-n*l*p)+_*(+e*l*p-e*c*f+r*a*f-s*a*p+s*c*h-r*l*h)+m*(+e*c*u-e*o*p-r*a*u+n*a*p+r*o*h-n*c*h)+d*(-s*o*h-e*l*u+e*o*f+s*a*u-n*a*f+n*l*h)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=t[9],f=t[10],p=t[11],v=t[12],_=t[13],m=t[14],d=t[15],x=u*m*c-_*f*c+_*l*p-o*m*p-u*l*d+o*f*d,M=v*f*c-h*m*c-v*l*p+a*m*p+h*l*d-a*f*d,y=h*_*c-v*u*c+v*o*p-a*_*p-h*o*d+a*u*d,C=v*u*l-h*_*l-v*o*f+a*_*f+h*o*m-a*u*m,A=e*x+n*M+s*y+r*C;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const R=1/A;return t[0]=x*R,t[1]=(_*f*r-u*m*r-_*s*p+n*m*p+u*s*d-n*f*d)*R,t[2]=(o*m*r-_*l*r+_*s*c-n*m*c-o*s*d+n*l*d)*R,t[3]=(u*l*r-o*f*r-u*s*c+n*f*c+o*s*p-n*l*p)*R,t[4]=M*R,t[5]=(h*m*r-v*f*r+v*s*p-e*m*p-h*s*d+e*f*d)*R,t[6]=(v*l*r-a*m*r-v*s*c+e*m*c+a*s*d-e*l*d)*R,t[7]=(a*f*r-h*l*r+h*s*c-e*f*c-a*s*p+e*l*p)*R,t[8]=y*R,t[9]=(v*u*r-h*_*r-v*n*p+e*_*p+h*n*d-e*u*d)*R,t[10]=(a*_*r-v*o*r+v*n*c-e*_*c-a*n*d+e*o*d)*R,t[11]=(h*o*r-a*u*r-h*n*c+e*u*c+a*n*p-e*o*p)*R,t[12]=C*R,t[13]=(h*_*s-v*u*s+v*n*f-e*_*f-h*n*m+e*u*m)*R,t[14]=(v*o*s-a*_*s-v*n*l+e*_*l+a*n*m-e*o*m)*R,t[15]=(a*u*s-h*o*s+h*n*l-e*u*l-a*n*f+e*o*f)*R,this}scale(t){const e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),s=Math.sin(e),r=1-n,a=t.x,o=t.y,l=t.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+n,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,a){return this.set(1,n,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){const s=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,h=a+a,u=o+o,f=r*c,p=r*h,v=r*u,_=a*h,m=a*u,d=o*u,x=l*c,M=l*h,y=l*u,C=n.x,A=n.y,R=n.z;return s[0]=(1-(_+d))*C,s[1]=(p+y)*C,s[2]=(v-M)*C,s[3]=0,s[4]=(p-y)*A,s[5]=(1-(f+d))*A,s[6]=(m+x)*A,s[7]=0,s[8]=(v+M)*R,s[9]=(m-x)*R,s[10]=(1-(f+_))*R,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){const s=this.elements;let r=zs.set(s[0],s[1],s[2]).length();const a=zs.set(s[4],s[5],s[6]).length(),o=zs.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],Gn.copy(this);const c=1/r,h=1/a,u=1/o;return Gn.elements[0]*=c,Gn.elements[1]*=c,Gn.elements[2]*=c,Gn.elements[4]*=h,Gn.elements[5]*=h,Gn.elements[6]*=h,Gn.elements[8]*=u,Gn.elements[9]*=u,Gn.elements[10]*=u,e.setFromRotationMatrix(Gn),n.x=r,n.y=a,n.z=o,this}makePerspective(t,e,n,s,r,a,o=vi){const l=this.elements,c=2*r/(e-t),h=2*r/(n-s),u=(e+t)/(e-t),f=(n+s)/(n-s);let p,v;if(o===vi)p=-(a+r)/(a-r),v=-2*a*r/(a-r);else if(o===Oo)p=-a/(a-r),v=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=v,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,s,r,a,o=vi){const l=this.elements,c=1/(e-t),h=1/(n-s),u=1/(a-r),f=(e+t)*c,p=(n+s)*h;let v,_;if(o===vi)v=(a+r)*u,_=-2*u;else if(o===Oo)v=r*u,_=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-p,l[2]=0,l[6]=0,l[10]=_,l[14]=-v,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}const zs=new N,Gn=new de,r0=new N(0,0,0),a0=new N(1,1,1),zi=new N,Ha=new N,xn=new N,ou=new de,lu=new Ta;class Ai{constructor(t=0,e=0,n=0,s=Ai.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const s=t.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],u=s[2],f=s[6],p=s[10];switch(e){case"XYZ":this._y=Math.asin(pn(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-pn(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(pn(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,p),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-pn(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(pn(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-pn(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return ou.makeRotationFromQuaternion(t),this.setFromRotationMatrix(ou,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return lu.setFromEuler(this),this.setFromQuaternion(lu,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Ai.DEFAULT_ORDER="XYZ";class Sd{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let o0=0;const cu=new N,Fs=new Ta,ui=new de,Ga=new N,Ir=new N,l0=new N,c0=new Ta,hu=new N(1,0,0),uu=new N(0,1,0),fu=new N(0,0,1),du={type:"added"},h0={type:"removed"},Bs={type:"childadded",child:null},bl={type:"childremoved",child:null};class Qe extends Sr{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:o0++}),this.uuid=ji(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Qe.DEFAULT_UP.clone();const t=new N,e=new Ai,n=new Ta,s=new N(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new de},normalMatrix:{value:new qt}}),this.matrix=new de,this.matrixWorld=new de,this.matrixAutoUpdate=Qe.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Qe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Sd,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Fs.setFromAxisAngle(t,e),this.quaternion.multiply(Fs),this}rotateOnWorldAxis(t,e){return Fs.setFromAxisAngle(t,e),this.quaternion.premultiply(Fs),this}rotateX(t){return this.rotateOnAxis(hu,t)}rotateY(t){return this.rotateOnAxis(uu,t)}rotateZ(t){return this.rotateOnAxis(fu,t)}translateOnAxis(t,e){return cu.copy(t).applyQuaternion(this.quaternion),this.position.add(cu.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(hu,t)}translateY(t){return this.translateOnAxis(uu,t)}translateZ(t){return this.translateOnAxis(fu,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(ui.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Ga.copy(t):Ga.set(t,e,n);const s=this.parent;this.updateWorldMatrix(!0,!1),Ir.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ui.lookAt(Ir,Ga,this.up):ui.lookAt(Ga,Ir,this.up),this.quaternion.setFromRotationMatrix(ui),s&&(ui.extractRotation(s.matrixWorld),Fs.setFromRotationMatrix(ui),this.quaternion.premultiply(Fs.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(du),Bs.child=t,this.dispatchEvent(Bs),Bs.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(h0),bl.child=t,this.dispatchEvent(bl),bl.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),ui.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),ui.multiply(t.parent.matrixWorld)),t.applyMatrix4(ui),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(du),Bs.child=t,this.dispatchEvent(Bs),Bs.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){const a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ir,t,l0),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ir,c0,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){const n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];r(t.shapes,u)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];s.animations.push(r(t.animations,l))}}if(e){const o=a(t.geometries),l=a(t.materials),c=a(t.textures),h=a(t.images),u=a(t.shapes),f=a(t.skeletons),p=a(t.animations),v=a(t.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),f.length>0&&(n.skeletons=f),p.length>0&&(n.animations=p),v.length>0&&(n.nodes=v)}return n.object=s,n;function a(o){const l=[];for(const c in o){const h=o[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const s=t.children[n];this.add(s.clone())}return this}}Qe.DEFAULT_UP=new N(0,1,0);Qe.DEFAULT_MATRIX_AUTO_UPDATE=!0;Qe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Vn=new N,fi=new N,Tl=new N,di=new N,Hs=new N,Gs=new N,pu=new N,Al=new N,wl=new N,Rl=new N,Cl=new Oe,Ll=new Oe,Dl=new Oe;class Tn{constructor(t=new N,e=new N,n=new N){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),Vn.subVectors(t,e),s.cross(Vn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){Vn.subVectors(s,e),fi.subVectors(n,e),Tl.subVectors(t,e);const a=Vn.dot(Vn),o=Vn.dot(fi),l=Vn.dot(Tl),c=fi.dot(fi),h=fi.dot(Tl),u=a*c-o*o;if(u===0)return r.set(0,0,0),null;const f=1/u,p=(c*l-o*h)*f,v=(a*h-o*l)*f;return r.set(1-p-v,v,p)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,di)===null?!1:di.x>=0&&di.y>=0&&di.x+di.y<=1}static getInterpolation(t,e,n,s,r,a,o,l){return this.getBarycoord(t,e,n,s,di)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,di.x),l.addScaledVector(a,di.y),l.addScaledVector(o,di.z),l)}static getInterpolatedAttribute(t,e,n,s,r,a){return Cl.setScalar(0),Ll.setScalar(0),Dl.setScalar(0),Cl.fromBufferAttribute(t,e),Ll.fromBufferAttribute(t,n),Dl.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(Cl,r.x),a.addScaledVector(Ll,r.y),a.addScaledVector(Dl,r.z),a}static isFrontFacing(t,e,n,s){return Vn.subVectors(n,e),fi.subVectors(t,e),Vn.cross(fi).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Vn.subVectors(this.c,this.b),fi.subVectors(this.a,this.b),Vn.cross(fi).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return Tn.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return Tn.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return Tn.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return Tn.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return Tn.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,s=this.b,r=this.c;let a,o;Hs.subVectors(s,n),Gs.subVectors(r,n),Al.subVectors(t,n);const l=Hs.dot(Al),c=Gs.dot(Al);if(l<=0&&c<=0)return e.copy(n);wl.subVectors(t,s);const h=Hs.dot(wl),u=Gs.dot(wl);if(h>=0&&u<=h)return e.copy(s);const f=l*u-h*c;if(f<=0&&l>=0&&h<=0)return a=l/(l-h),e.copy(n).addScaledVector(Hs,a);Rl.subVectors(t,r);const p=Hs.dot(Rl),v=Gs.dot(Rl);if(v>=0&&p<=v)return e.copy(r);const _=p*c-l*v;if(_<=0&&c>=0&&v<=0)return o=c/(c-v),e.copy(n).addScaledVector(Gs,o);const m=h*v-p*u;if(m<=0&&u-h>=0&&p-v>=0)return pu.subVectors(r,s),o=(u-h)/(u-h+(p-v)),e.copy(s).addScaledVector(pu,o);const d=1/(m+_+f);return a=_*d,o=f*d,e.copy(n).addScaledVector(Hs,a).addScaledVector(Gs,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const Ed={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Fi={h:0,s:0,l:0},Va={h:0,s:0,l:0};function Pl(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}class Jt{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Pn){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,oe.toWorkingColorSpace(this,e),this}setRGB(t,e,n,s=oe.workingColorSpace){return this.r=t,this.g=e,this.b=n,oe.toWorkingColorSpace(this,s),this}setHSL(t,e,n,s=oe.workingColorSpace){if(t=Km(t,1),e=pn(e,0,1),n=pn(n,0,1),e===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=Pl(a,r,t+1/3),this.g=Pl(a,r,t),this.b=Pl(a,r,t-1/3)}return oe.toWorkingColorSpace(this,s),this}setStyle(t,e=Pn){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Pn){const n=Ed[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Mi(t.r),this.g=Mi(t.g),this.b=Mi(t.b),this}copyLinearToSRGB(t){return this.r=cr(t.r),this.g=cr(t.g),this.b=cr(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Pn){return oe.fromWorkingColorSpace(Ke.copy(this),t),Math.round(pn(Ke.r*255,0,255))*65536+Math.round(pn(Ke.g*255,0,255))*256+Math.round(pn(Ke.b*255,0,255))}getHexString(t=Pn){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=oe.workingColorSpace){oe.fromWorkingColorSpace(Ke.copy(this),e);const n=Ke.r,s=Ke.g,r=Ke.b,a=Math.max(n,s,r),o=Math.min(n,s,r);let l,c;const h=(o+a)/2;if(o===a)l=0,c=0;else{const u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-n)/u+2;break;case r:l=(n-s)/u+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=oe.workingColorSpace){return oe.fromWorkingColorSpace(Ke.copy(this),e),t.r=Ke.r,t.g=Ke.g,t.b=Ke.b,t}getStyle(t=Pn){oe.fromWorkingColorSpace(Ke.copy(this),t);const e=Ke.r,n=Ke.g,s=Ke.b;return t!==Pn?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(Fi),this.setHSL(Fi.h+t,Fi.s+e,Fi.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Fi),t.getHSL(Va);const n=ml(Fi.h,Va.h,e),s=ml(Fi.s,Va.s,e),r=ml(Fi.l,Va.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Ke=new Jt;Jt.NAMES=Ed;let u0=0;class Cs extends Sr{static get type(){return"Material"}get type(){return this.constructor.type}set type(t){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:u0++}),this.uuid=ji(),this.name="",this.blending=or,this.side=bi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=hc,this.blendDst=uc,this.blendEquation=_s,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Jt(0,0,0),this.blendAlpha=0,this.depthFunc=ur,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Jh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Is,this.stencilZFail=Is,this.stencilZPass=Is,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==or&&(n.blending=this.blending),this.side!==bi&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==hc&&(n.blendSrc=this.blendSrc),this.blendDst!==uc&&(n.blendDst=this.blendDst),this.blendEquation!==_s&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==ur&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Jh&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Is&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Is&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Is&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(e){const r=s(t.textures),a=s(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class jn extends Cs{static get type(){return"MeshBasicMaterial"}constructor(t){super(),this.isMeshBasicMaterial=!0,this.color=new Jt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ai,this.combine=od,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const ke=new N,Wa=new kt;class be{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=Kc,this.updateRanges=[],this.gpuType=ri,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Wa.fromBufferAttribute(this,e),Wa.applyMatrix3(t),this.setXY(e,Wa.x,Wa.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)ke.fromBufferAttribute(this,e),ke.applyMatrix3(t),this.setXYZ(e,ke.x,ke.y,ke.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)ke.fromBufferAttribute(this,e),ke.applyMatrix4(t),this.setXYZ(e,ke.x,ke.y,ke.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)ke.fromBufferAttribute(this,e),ke.applyNormalMatrix(t),this.setXYZ(e,ke.x,ke.y,ke.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)ke.fromBufferAttribute(this,e),ke.transformDirection(t),this.setXYZ(e,ke.x,ke.y,ke.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=ii(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=ve(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=ii(e,this.array)),e}setX(t,e){return this.normalized&&(e=ve(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=ii(e,this.array)),e}setY(t,e){return this.normalized&&(e=ve(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=ii(e,this.array)),e}setZ(t,e){return this.normalized&&(e=ve(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=ii(e,this.array)),e}setW(t,e){return this.normalized&&(e=ve(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=ve(e,this.array),n=ve(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=ve(e,this.array),n=ve(n,this.array),s=ve(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=ve(e,this.array),n=ve(n,this.array),s=ve(s,this.array),r=ve(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==Kc&&(t.usage=this.usage),t}}class yh extends be{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class Sh extends be{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class Fe extends be{constructor(t,e,n){super(new Float32Array(t),e,n)}}let f0=0;const Cn=new de,Il=new Qe,Vs=new N,Mn=new Rs,Nr=new Rs,Ve=new N;class Ie extends Sr{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:f0++}),this.uuid=ji(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(xd(t)?Sh:yh)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new qt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return Cn.makeRotationFromQuaternion(t),this.applyMatrix4(Cn),this}rotateX(t){return Cn.makeRotationX(t),this.applyMatrix4(Cn),this}rotateY(t){return Cn.makeRotationY(t),this.applyMatrix4(Cn),this}rotateZ(t){return Cn.makeRotationZ(t),this.applyMatrix4(Cn),this}translate(t,e,n){return Cn.makeTranslation(t,e,n),this.applyMatrix4(Cn),this}scale(t,e,n){return Cn.makeScale(t,e,n),this.applyMatrix4(Cn),this}lookAt(t){return Il.lookAt(t),Il.updateMatrix(),this.applyMatrix4(Il.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Vs).negate(),this.translate(Vs.x,Vs.y,Vs.z),this}setFromPoints(t){const e=this.getAttribute("position");if(e===void 0){const n=[];for(let s=0,r=t.length;s<r;s++){const a=t[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Fe(n,3))}else{for(let n=0,s=e.count;n<s;n++){const r=t[n];e.setXYZ(n,r.x,r.y,r.z||0)}t.length>e.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Rs);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new N(-1/0,-1/0,-1/0),new N(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){const r=e[n];Mn.setFromBufferAttribute(r),this.morphTargetsRelative?(Ve.addVectors(this.boundingBox.min,Mn.min),this.boundingBox.expandByPoint(Ve),Ve.addVectors(this.boundingBox.max,Mn.max),this.boundingBox.expandByPoint(Ve)):(this.boundingBox.expandByPoint(Mn.min),this.boundingBox.expandByPoint(Mn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new is);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new N,1/0);return}if(t){const n=this.boundingSphere.center;if(Mn.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){const o=e[r];Nr.setFromBufferAttribute(o),this.morphTargetsRelative?(Ve.addVectors(Mn.min,Nr.min),Mn.expandByPoint(Ve),Ve.addVectors(Mn.max,Nr.max),Mn.expandByPoint(Ve)):(Mn.expandByPoint(Nr.min),Mn.expandByPoint(Nr.max))}Mn.getCenter(n);let s=0;for(let r=0,a=t.count;r<a;r++)Ve.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(Ve));if(e)for(let r=0,a=e.length;r<a;r++){const o=e[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Ve.fromBufferAttribute(o,c),l&&(Vs.fromBufferAttribute(t,c),Ve.add(Vs)),s=Math.max(s,n.distanceToSquared(Ve))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new be(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let P=0;P<n.count;P++)o[P]=new N,l[P]=new N;const c=new N,h=new N,u=new N,f=new kt,p=new kt,v=new kt,_=new N,m=new N;function d(P,T,E){c.fromBufferAttribute(n,P),h.fromBufferAttribute(n,T),u.fromBufferAttribute(n,E),f.fromBufferAttribute(r,P),p.fromBufferAttribute(r,T),v.fromBufferAttribute(r,E),h.sub(c),u.sub(c),p.sub(f),v.sub(f);const I=1/(p.x*v.y-v.x*p.y);isFinite(I)&&(_.copy(h).multiplyScalar(v.y).addScaledVector(u,-p.y).multiplyScalar(I),m.copy(u).multiplyScalar(p.x).addScaledVector(h,-v.x).multiplyScalar(I),o[P].add(_),o[T].add(_),o[E].add(_),l[P].add(m),l[T].add(m),l[E].add(m))}let x=this.groups;x.length===0&&(x=[{start:0,count:t.count}]);for(let P=0,T=x.length;P<T;++P){const E=x[P],I=E.start,$=E.count;for(let V=I,Y=I+$;V<Y;V+=3)d(t.getX(V+0),t.getX(V+1),t.getX(V+2))}const M=new N,y=new N,C=new N,A=new N;function R(P){C.fromBufferAttribute(s,P),A.copy(C);const T=o[P];M.copy(T),M.sub(C.multiplyScalar(C.dot(T))).normalize(),y.crossVectors(A,T);const I=y.dot(l[P])<0?-1:1;a.setXYZW(P,M.x,M.y,M.z,I)}for(let P=0,T=x.length;P<T;++P){const E=x[P],I=E.start,$=E.count;for(let V=I,Y=I+$;V<Y;V+=3)R(t.getX(V+0)),R(t.getX(V+1)),R(t.getX(V+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new be(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let f=0,p=n.count;f<p;f++)n.setXYZ(f,0,0,0);const s=new N,r=new N,a=new N,o=new N,l=new N,c=new N,h=new N,u=new N;if(t)for(let f=0,p=t.count;f<p;f+=3){const v=t.getX(f+0),_=t.getX(f+1),m=t.getX(f+2);s.fromBufferAttribute(e,v),r.fromBufferAttribute(e,_),a.fromBufferAttribute(e,m),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),o.fromBufferAttribute(n,v),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),o.add(h),l.add(h),c.add(h),n.setXYZ(v,o.x,o.y,o.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let f=0,p=e.count;f<p;f+=3)s.fromBufferAttribute(e,f+0),r.fromBufferAttribute(e,f+1),a.fromBufferAttribute(e,f+2),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),n.setXYZ(f+0,h.x,h.y,h.z),n.setXYZ(f+1,h.x,h.y,h.z),n.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Ve.fromBufferAttribute(t,e),Ve.normalize(),t.setXYZ(e,Ve.x,Ve.y,Ve.z)}toNonIndexed(){function t(o,l){const c=o.array,h=o.itemSize,u=o.normalized,f=new c.constructor(l.length*h);let p=0,v=0;for(let _=0,m=l.length;_<m;_++){o.isInterleavedBufferAttribute?p=l[_]*o.data.stride+o.offset:p=l[_]*h;for(let d=0;d<h;d++)f[v++]=c[p++]}return new be(f,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new Ie,n=this.index.array,s=this.attributes;for(const o in s){const l=s[o],c=t(l,n);e.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let h=0,u=c.length;h<u;h++){const f=c[h],p=t(f,n);l.push(p)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const l in n){const c=n[l];t.data.attributes[l]=c.toJSON(t.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,f=c.length;u<f;u++){const p=c[u];h.push(p.toJSON(t.data))}h.length>0&&(s[l]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(t.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone(e));const s=t.attributes;for(const c in s){const h=s[c];this.setAttribute(c,h.clone(e))}const r=t.morphAttributes;for(const c in r){const h=[],u=r[c];for(let f=0,p=u.length;f<p;f++)h.push(u[f].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;const a=t.groups;for(let c=0,h=a.length;c<h;c++){const u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}const o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const mu=new de,us=new Mh,Xa=new is,gu=new N,$a=new N,qa=new N,Ka=new N,Nl=new N,Ya=new N,vu=new N,ja=new N;class Te extends Qe{constructor(t=new Ie,e=new jn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(s,t);const o=this.morphTargetInfluences;if(r&&o){Ya.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=o[l],u=r[l];h!==0&&(Nl.fromBufferAttribute(u,t),a?Ya.addScaledVector(Nl,h):Ya.addScaledVector(Nl.sub(e),h))}e.add(Ya)}return e}raycast(t,e){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Xa.copy(n.boundingSphere),Xa.applyMatrix4(r),us.copy(t.ray).recast(t.near),!(Xa.containsPoint(us.origin)===!1&&(us.intersectSphere(Xa,gu)===null||us.origin.distanceToSquared(gu)>(t.far-t.near)**2))&&(mu.copy(r).invert(),us.copy(t.ray).applyMatrix4(mu),!(n.boundingBox!==null&&us.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,us)))}_computeIntersections(t,e,n){let s;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,f=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let v=0,_=f.length;v<_;v++){const m=f[v],d=a[m.materialIndex],x=Math.max(m.start,p.start),M=Math.min(o.count,Math.min(m.start+m.count,p.start+p.count));for(let y=x,C=M;y<C;y+=3){const A=o.getX(y),R=o.getX(y+1),P=o.getX(y+2);s=Za(this,d,t,n,c,h,u,A,R,P),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const v=Math.max(0,p.start),_=Math.min(o.count,p.start+p.count);for(let m=v,d=_;m<d;m+=3){const x=o.getX(m),M=o.getX(m+1),y=o.getX(m+2);s=Za(this,a,t,n,c,h,u,x,M,y),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let v=0,_=f.length;v<_;v++){const m=f[v],d=a[m.materialIndex],x=Math.max(m.start,p.start),M=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let y=x,C=M;y<C;y+=3){const A=y,R=y+1,P=y+2;s=Za(this,d,t,n,c,h,u,A,R,P),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const v=Math.max(0,p.start),_=Math.min(l.count,p.start+p.count);for(let m=v,d=_;m<d;m+=3){const x=m,M=m+1,y=m+2;s=Za(this,a,t,n,c,h,u,x,M,y),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}}function d0(i,t,e,n,s,r,a,o){let l;if(t.side===ln?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,t.side===bi,o),l===null)return null;ja.copy(o),ja.applyMatrix4(i.matrixWorld);const c=e.ray.origin.distanceTo(ja);return c<e.near||c>e.far?null:{distance:c,point:ja.clone(),object:i}}function Za(i,t,e,n,s,r,a,o,l,c){i.getVertexPosition(o,$a),i.getVertexPosition(l,qa),i.getVertexPosition(c,Ka);const h=d0(i,t,e,n,$a,qa,Ka,vu);if(h){const u=new N;Tn.getBarycoord(vu,$a,qa,Ka,u),s&&(h.uv=Tn.getInterpolatedAttribute(s,o,l,c,u,new kt)),r&&(h.uv1=Tn.getInterpolatedAttribute(r,o,l,c,u,new kt)),a&&(h.normal=Tn.getInterpolatedAttribute(a,o,l,c,u,new N),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const f={a:o,b:l,c,normal:new N,materialIndex:0};Tn.getNormal($a,qa,Ka,f.normal),h.face=f,h.barycoord=u}return h}class es extends Ie{constructor(t=1,e=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],h=[],u=[];let f=0,p=0;v("z","y","x",-1,-1,n,e,t,a,r,0),v("z","y","x",1,-1,n,e,-t,a,r,1),v("x","z","y",1,1,t,n,e,s,a,2),v("x","z","y",1,-1,t,n,-e,s,a,3),v("x","y","z",1,-1,t,e,n,s,r,4),v("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new Fe(c,3)),this.setAttribute("normal",new Fe(h,3)),this.setAttribute("uv",new Fe(u,2));function v(_,m,d,x,M,y,C,A,R,P,T){const E=y/R,I=C/P,$=y/2,V=C/2,Y=A/2,nt=R+1,q=P+1;let it=0,W=0;const st=new N;for(let mt=0;mt<q;mt++){const Ct=mt*I-V;for(let Wt=0;Wt<nt;Wt++){const ce=Wt*E-$;st[_]=ce*x,st[m]=Ct*M,st[d]=Y,c.push(st.x,st.y,st.z),st[_]=0,st[m]=0,st[d]=A>0?1:-1,h.push(st.x,st.y,st.z),u.push(Wt/R),u.push(1-mt/P),it+=1}}for(let mt=0;mt<P;mt++)for(let Ct=0;Ct<R;Ct++){const Wt=f+Ct+nt*mt,ce=f+Ct+nt*(mt+1),j=f+(Ct+1)+nt*(mt+1),rt=f+(Ct+1)+nt*mt;l.push(Wt,ce,rt),l.push(ce,j,rt),W+=6}o.addGroup(p,W,T),p+=W,f+=it}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new es(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function gr(i){const t={};for(const e in i){t[e]={};for(const n in i[e]){const s=i[e][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone():Array.isArray(s)?t[e][n]=s.slice():t[e][n]=s}}return t}function nn(i){const t={};for(let e=0;e<i.length;e++){const n=gr(i[e]);for(const s in n)t[s]=n[s]}return t}function p0(i){const t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function bd(i){const t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:oe.workingColorSpace}const ko={clone:gr,merge:nn};var m0=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,g0=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class ze extends Cs{static get type(){return"ShaderMaterial"}constructor(t){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=m0,this.fragmentShader=g0,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=gr(t.uniforms),this.uniformsGroups=p0(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}}class Td extends Qe{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new de,this.projectionMatrix=new de,this.projectionMatrixInverse=new de,this.coordinateSystem=vi}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Bi=new N,_u=new kt,xu=new kt;class In extends Td{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=Yc*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(To*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Yc*2*Math.atan(Math.tan(To*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Bi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Bi.x,Bi.y).multiplyScalar(-t/Bi.z),Bi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Bi.x,Bi.y).multiplyScalar(-t/Bi.z)}getViewSize(t,e){return this.getViewBounds(t,_u,xu),e.subVectors(xu,_u)}setViewOffset(t,e,n,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(To*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,e-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const Ws=-90,Xs=1;class v0 extends Qe{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new In(Ws,Xs,t,e);s.layers=this.layers,this.add(s);const r=new In(Ws,Xs,t,e);r.layers=this.layers,this.add(r);const a=new In(Ws,Xs,t,e);a.layers=this.layers,this.add(a);const o=new In(Ws,Xs,t,e);o.layers=this.layers,this.add(o);const l=new In(Ws,Xs,t,e);l.layers=this.layers,this.add(l);const c=new In(Ws,Xs,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,s,r,a,o,l]=e;for(const c of e)this.remove(c);if(t===vi)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Oo)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,h]=this.children,u=t.getRenderTarget(),f=t.getActiveCubeFace(),p=t.getActiveMipmapLevel(),v=t.xr.enabled;t.xr.enabled=!1;const _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,s),t.render(e,r),t.setRenderTarget(n,1,s),t.render(e,a),t.setRenderTarget(n,2,s),t.render(e,o),t.setRenderTarget(n,3,s),t.render(e,l),t.setRenderTarget(n,4,s),t.render(e,c),n.texture.generateMipmaps=_,t.setRenderTarget(n,5,s),t.render(e,h),t.setRenderTarget(u,f,p),t.xr.enabled=v,n.texture.needsPMREMUpdate=!0}}class Ad extends Xe{constructor(t,e,n,s,r,a,o,l,c,h){t=t!==void 0?t:[],e=e!==void 0?e:fr,super(t,e,n,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class _0 extends wn{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new Ad(s,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:on}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new es(5,5,5),r=new ze({name:"CubemapFromEquirect",uniforms:gr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:ln,blending:xi});r.uniforms.tEquirect.value=e;const a=new Te(s,r),o=e.minFilter;return e.minFilter===si&&(e.minFilter=on),new v0(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e,n,s){const r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,s);t.setRenderTarget(r)}}const Ol=new N,x0=new N,M0=new qt;class gs{constructor(t=new N(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const s=Ol.subVectors(n,e).cross(x0.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const n=t.delta(Ol),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||M0.getNormalMatrix(t),s=this.coplanarPoint(Ol).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const fs=new is,Ja=new N;class wd{constructor(t=new gs,e=new gs,n=new gs,s=new gs,r=new gs,a=new gs){this.planes=[t,e,n,s,r,a]}set(t,e,n,s,r,a){const o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=vi){const n=this.planes,s=t.elements,r=s[0],a=s[1],o=s[2],l=s[3],c=s[4],h=s[5],u=s[6],f=s[7],p=s[8],v=s[9],_=s[10],m=s[11],d=s[12],x=s[13],M=s[14],y=s[15];if(n[0].setComponents(l-r,f-c,m-p,y-d).normalize(),n[1].setComponents(l+r,f+c,m+p,y+d).normalize(),n[2].setComponents(l+a,f+h,m+v,y+x).normalize(),n[3].setComponents(l-a,f-h,m-v,y-x).normalize(),n[4].setComponents(l-o,f-u,m-_,y-M).normalize(),e===vi)n[5].setComponents(l+o,f+u,m+_,y+M).normalize();else if(e===Oo)n[5].setComponents(o,u,_,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),fs.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),fs.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(fs)}intersectsSprite(t){return fs.center.set(0,0,0),fs.radius=.7071067811865476,fs.applyMatrix4(t.matrixWorld),this.intersectsSphere(fs)}intersectsSphere(t){const e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const s=e[n];if(Ja.x=s.normal.x>0?t.max.x:t.min.x,Ja.y=s.normal.y>0?t.max.y:t.min.y,Ja.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(Ja)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Rd(){let i=null,t=!1,e=null,n=null;function s(r,a){e(r,a),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function y0(i){const t=new WeakMap;function e(o,l){const c=o.array,h=o.usage,u=c.byteLength,f=i.createBuffer();i.bindBuffer(l,f),i.bufferData(l,c,h),o.onUploadCallback();let p;if(c instanceof Float32Array)p=i.FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=i.SHORT;else if(c instanceof Uint32Array)p=i.UNSIGNED_INT;else if(c instanceof Int32Array)p=i.INT;else if(c instanceof Int8Array)p=i.BYTE;else if(c instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,c){const h=l.array,u=l.updateRanges;if(i.bindBuffer(c,o),u.length===0)i.bufferSubData(c,0,h);else{u.sort((p,v)=>p.start-v.start);let f=0;for(let p=1;p<u.length;p++){const v=u[f],_=u[p];_.start<=v.start+v.count+1?v.count=Math.max(v.count,_.start+_.count-v.start):(++f,u[f]=_)}u.length=f+1;for(let p=0,v=u.length;p<v;p++){const _=u[p];i.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=t.get(o);l&&(i.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}class ys extends Ie{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};const r=t/2,a=e/2,o=Math.floor(n),l=Math.floor(s),c=o+1,h=l+1,u=t/o,f=e/l,p=[],v=[],_=[],m=[];for(let d=0;d<h;d++){const x=d*f-a;for(let M=0;M<c;M++){const y=M*u-r;v.push(y,-x,0),_.push(0,0,1),m.push(M/o),m.push(1-d/l)}}for(let d=0;d<l;d++)for(let x=0;x<o;x++){const M=x+c*d,y=x+c*(d+1),C=x+1+c*(d+1),A=x+1+c*d;p.push(M,y,A),p.push(y,C,A)}this.setIndex(p),this.setAttribute("position",new Fe(v,3)),this.setAttribute("normal",new Fe(_,3)),this.setAttribute("uv",new Fe(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ys(t.width,t.height,t.widthSegments,t.heightSegments)}}var S0=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,E0=`#ifdef USE_ALPHAHASH
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
#endif`,b0=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,T0=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,A0=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,w0=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,R0=`#ifdef USE_AOMAP
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
#endif`,C0=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,L0=`#ifdef USE_BATCHING
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
#endif`,D0=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,P0=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,I0=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,N0=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,O0=`#ifdef USE_IRIDESCENCE
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
#endif`,k0=`#ifdef USE_BUMPMAP
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
#endif`,U0=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,z0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,F0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,B0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,H0=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,G0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,V0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,W0=`#if defined( USE_COLOR_ALPHA )
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
#endif`,X0=`#define PI 3.141592653589793
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
} // validated`,$0=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,q0=`vec3 transformedNormal = objectNormal;
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
#endif`,K0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Y0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,j0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Z0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,J0="gl_FragColor = linearToOutputTexel( gl_FragColor );",Q0=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,tg=`#ifdef USE_ENVMAP
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
#endif`,eg=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,ng=`#ifdef USE_ENVMAP
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
#endif`,ig=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,sg=`#ifdef USE_ENVMAP
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
#endif`,rg=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,ag=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,og=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,lg=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,cg=`#ifdef USE_GRADIENTMAP
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
}`,hg=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,ug=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,fg=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,dg=`uniform bool receiveShadow;
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
#endif`,pg=`#ifdef USE_ENVMAP
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
#endif`,mg=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,gg=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,vg=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,_g=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,xg=`PhysicalMaterial material;
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
#endif`,Mg=`struct PhysicalMaterial {
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
}`,yg=`
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
#endif`,Sg=`#if defined( RE_IndirectDiffuse )
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
#endif`,Eg=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,bg=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Tg=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ag=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,wg=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Rg=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Cg=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Lg=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Dg=`#if defined( USE_POINTS_UV )
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
#endif`,Pg=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Ig=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Ng=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Og=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,kg=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ug=`#ifdef USE_MORPHTARGETS
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
#endif`,zg=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Fg=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Bg=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Hg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Gg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Vg=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Wg=`#ifdef USE_NORMALMAP
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
#endif`,Xg=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,$g=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,qg=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Kg=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Yg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,jg=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Zg=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Jg=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Qg=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,tv=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,ev=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,nv=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,iv=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,sv=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,rv=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,av=`float getShadowMask() {
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
}`,ov=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,lv=`#ifdef USE_SKINNING
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
#endif`,cv=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,hv=`#ifdef USE_SKINNING
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
#endif`,uv=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,fv=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,dv=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,pv=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,mv=`#ifdef USE_TRANSMISSION
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
#endif`,gv=`#ifdef USE_TRANSMISSION
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
#endif`,vv=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,_v=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,xv=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Mv=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const yv=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Sv=`uniform sampler2D t2D;
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
}`,Ev=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,bv=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Tv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Av=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,wv=`#include <common>
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
}`,Rv=`#if DEPTH_PACKING == 3200
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
}`,Cv=`#define DISTANCE
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
}`,Lv=`#define DISTANCE
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
}`,Dv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Pv=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Iv=`uniform float scale;
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
}`,Nv=`uniform vec3 diffuse;
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
}`,Ov=`#include <common>
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
}`,kv=`uniform vec3 diffuse;
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
}`,Uv=`#define LAMBERT
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
}`,zv=`#define LAMBERT
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
}`,Fv=`#define MATCAP
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
}`,Bv=`#define MATCAP
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
}`,Hv=`#define NORMAL
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
}`,Gv=`#define NORMAL
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
}`,Vv=`#define PHONG
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
}`,Wv=`#define PHONG
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
}`,Xv=`#define STANDARD
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
}`,$v=`#define STANDARD
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
}`,qv=`#define TOON
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
}`,Kv=`#define TOON
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
}`,Yv=`uniform float size;
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
}`,jv=`uniform vec3 diffuse;
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
}`,Zv=`#include <common>
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
}`,Jv=`uniform vec3 color;
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
}`,Qv=`uniform float rotation;
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
}`,t1=`uniform vec3 diffuse;
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
}`,Yt={alphahash_fragment:S0,alphahash_pars_fragment:E0,alphamap_fragment:b0,alphamap_pars_fragment:T0,alphatest_fragment:A0,alphatest_pars_fragment:w0,aomap_fragment:R0,aomap_pars_fragment:C0,batching_pars_vertex:L0,batching_vertex:D0,begin_vertex:P0,beginnormal_vertex:I0,bsdfs:N0,iridescence_fragment:O0,bumpmap_pars_fragment:k0,clipping_planes_fragment:U0,clipping_planes_pars_fragment:z0,clipping_planes_pars_vertex:F0,clipping_planes_vertex:B0,color_fragment:H0,color_pars_fragment:G0,color_pars_vertex:V0,color_vertex:W0,common:X0,cube_uv_reflection_fragment:$0,defaultnormal_vertex:q0,displacementmap_pars_vertex:K0,displacementmap_vertex:Y0,emissivemap_fragment:j0,emissivemap_pars_fragment:Z0,colorspace_fragment:J0,colorspace_pars_fragment:Q0,envmap_fragment:tg,envmap_common_pars_fragment:eg,envmap_pars_fragment:ng,envmap_pars_vertex:ig,envmap_physical_pars_fragment:pg,envmap_vertex:sg,fog_vertex:rg,fog_pars_vertex:ag,fog_fragment:og,fog_pars_fragment:lg,gradientmap_pars_fragment:cg,lightmap_pars_fragment:hg,lights_lambert_fragment:ug,lights_lambert_pars_fragment:fg,lights_pars_begin:dg,lights_toon_fragment:mg,lights_toon_pars_fragment:gg,lights_phong_fragment:vg,lights_phong_pars_fragment:_g,lights_physical_fragment:xg,lights_physical_pars_fragment:Mg,lights_fragment_begin:yg,lights_fragment_maps:Sg,lights_fragment_end:Eg,logdepthbuf_fragment:bg,logdepthbuf_pars_fragment:Tg,logdepthbuf_pars_vertex:Ag,logdepthbuf_vertex:wg,map_fragment:Rg,map_pars_fragment:Cg,map_particle_fragment:Lg,map_particle_pars_fragment:Dg,metalnessmap_fragment:Pg,metalnessmap_pars_fragment:Ig,morphinstance_vertex:Ng,morphcolor_vertex:Og,morphnormal_vertex:kg,morphtarget_pars_vertex:Ug,morphtarget_vertex:zg,normal_fragment_begin:Fg,normal_fragment_maps:Bg,normal_pars_fragment:Hg,normal_pars_vertex:Gg,normal_vertex:Vg,normalmap_pars_fragment:Wg,clearcoat_normal_fragment_begin:Xg,clearcoat_normal_fragment_maps:$g,clearcoat_pars_fragment:qg,iridescence_pars_fragment:Kg,opaque_fragment:Yg,packing:jg,premultiplied_alpha_fragment:Zg,project_vertex:Jg,dithering_fragment:Qg,dithering_pars_fragment:tv,roughnessmap_fragment:ev,roughnessmap_pars_fragment:nv,shadowmap_pars_fragment:iv,shadowmap_pars_vertex:sv,shadowmap_vertex:rv,shadowmask_pars_fragment:av,skinbase_vertex:ov,skinning_pars_vertex:lv,skinning_vertex:cv,skinnormal_vertex:hv,specularmap_fragment:uv,specularmap_pars_fragment:fv,tonemapping_fragment:dv,tonemapping_pars_fragment:pv,transmission_fragment:mv,transmission_pars_fragment:gv,uv_pars_fragment:vv,uv_pars_vertex:_v,uv_vertex:xv,worldpos_vertex:Mv,background_vert:yv,background_frag:Sv,backgroundCube_vert:Ev,backgroundCube_frag:bv,cube_vert:Tv,cube_frag:Av,depth_vert:wv,depth_frag:Rv,distanceRGBA_vert:Cv,distanceRGBA_frag:Lv,equirect_vert:Dv,equirect_frag:Pv,linedashed_vert:Iv,linedashed_frag:Nv,meshbasic_vert:Ov,meshbasic_frag:kv,meshlambert_vert:Uv,meshlambert_frag:zv,meshmatcap_vert:Fv,meshmatcap_frag:Bv,meshnormal_vert:Hv,meshnormal_frag:Gv,meshphong_vert:Vv,meshphong_frag:Wv,meshphysical_vert:Xv,meshphysical_frag:$v,meshtoon_vert:qv,meshtoon_frag:Kv,points_vert:Yv,points_frag:jv,shadow_vert:Zv,shadow_frag:Jv,sprite_vert:Qv,sprite_frag:t1},ct={common:{diffuse:{value:new Jt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new qt},alphaMap:{value:null},alphaMapTransform:{value:new qt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new qt}},envmap:{envMap:{value:null},envMapRotation:{value:new qt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new qt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new qt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new qt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new qt},normalScale:{value:new kt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new qt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new qt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new qt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new qt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Jt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Jt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new qt},alphaTest:{value:0},uvTransform:{value:new qt}},sprite:{diffuse:{value:new Jt(16777215)},opacity:{value:1},center:{value:new kt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new qt},alphaMap:{value:null},alphaMapTransform:{value:new qt},alphaTest:{value:0}}},ni={basic:{uniforms:nn([ct.common,ct.specularmap,ct.envmap,ct.aomap,ct.lightmap,ct.fog]),vertexShader:Yt.meshbasic_vert,fragmentShader:Yt.meshbasic_frag},lambert:{uniforms:nn([ct.common,ct.specularmap,ct.envmap,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.fog,ct.lights,{emissive:{value:new Jt(0)}}]),vertexShader:Yt.meshlambert_vert,fragmentShader:Yt.meshlambert_frag},phong:{uniforms:nn([ct.common,ct.specularmap,ct.envmap,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.fog,ct.lights,{emissive:{value:new Jt(0)},specular:{value:new Jt(1118481)},shininess:{value:30}}]),vertexShader:Yt.meshphong_vert,fragmentShader:Yt.meshphong_frag},standard:{uniforms:nn([ct.common,ct.envmap,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.roughnessmap,ct.metalnessmap,ct.fog,ct.lights,{emissive:{value:new Jt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Yt.meshphysical_vert,fragmentShader:Yt.meshphysical_frag},toon:{uniforms:nn([ct.common,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.gradientmap,ct.fog,ct.lights,{emissive:{value:new Jt(0)}}]),vertexShader:Yt.meshtoon_vert,fragmentShader:Yt.meshtoon_frag},matcap:{uniforms:nn([ct.common,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.fog,{matcap:{value:null}}]),vertexShader:Yt.meshmatcap_vert,fragmentShader:Yt.meshmatcap_frag},points:{uniforms:nn([ct.points,ct.fog]),vertexShader:Yt.points_vert,fragmentShader:Yt.points_frag},dashed:{uniforms:nn([ct.common,ct.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Yt.linedashed_vert,fragmentShader:Yt.linedashed_frag},depth:{uniforms:nn([ct.common,ct.displacementmap]),vertexShader:Yt.depth_vert,fragmentShader:Yt.depth_frag},normal:{uniforms:nn([ct.common,ct.bumpmap,ct.normalmap,ct.displacementmap,{opacity:{value:1}}]),vertexShader:Yt.meshnormal_vert,fragmentShader:Yt.meshnormal_frag},sprite:{uniforms:nn([ct.sprite,ct.fog]),vertexShader:Yt.sprite_vert,fragmentShader:Yt.sprite_frag},background:{uniforms:{uvTransform:{value:new qt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Yt.background_vert,fragmentShader:Yt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new qt}},vertexShader:Yt.backgroundCube_vert,fragmentShader:Yt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Yt.cube_vert,fragmentShader:Yt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Yt.equirect_vert,fragmentShader:Yt.equirect_frag},distanceRGBA:{uniforms:nn([ct.common,ct.displacementmap,{referencePosition:{value:new N},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Yt.distanceRGBA_vert,fragmentShader:Yt.distanceRGBA_frag},shadow:{uniforms:nn([ct.lights,ct.fog,{color:{value:new Jt(0)},opacity:{value:1}}]),vertexShader:Yt.shadow_vert,fragmentShader:Yt.shadow_frag}};ni.physical={uniforms:nn([ni.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new qt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new qt},clearcoatNormalScale:{value:new kt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new qt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new qt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new qt},sheen:{value:0},sheenColor:{value:new Jt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new qt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new qt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new qt},transmissionSamplerSize:{value:new kt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new qt},attenuationDistance:{value:0},attenuationColor:{value:new Jt(0)},specularColor:{value:new Jt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new qt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new qt},anisotropyVector:{value:new kt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new qt}}]),vertexShader:Yt.meshphysical_vert,fragmentShader:Yt.meshphysical_frag};const Qa={r:0,b:0,g:0},ds=new Ai,e1=new de;function n1(i,t,e,n,s,r,a){const o=new Jt(0);let l=r===!0?0:1,c,h,u=null,f=0,p=null;function v(x){let M=x.isScene===!0?x.background:null;return M&&M.isTexture&&(M=(x.backgroundBlurriness>0?e:t).get(M)),M}function _(x){let M=!1;const y=v(x);y===null?d(o,l):y&&y.isColor&&(d(y,1),M=!0);const C=i.xr.getEnvironmentBlendMode();C==="additive"?n.buffers.color.setClear(0,0,0,1,a):C==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||M)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(x,M){const y=v(M);y&&(y.isCubeTexture||y.mapping===jo)?(h===void 0&&(h=new Te(new es(1,1,1),new ze({name:"BackgroundCubeMaterial",uniforms:gr(ni.backgroundCube.uniforms),vertexShader:ni.backgroundCube.vertexShader,fragmentShader:ni.backgroundCube.fragmentShader,side:ln,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(C,A,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),ds.copy(M.backgroundRotation),ds.x*=-1,ds.y*=-1,ds.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(ds.y*=-1,ds.z*=-1),h.material.uniforms.envMap.value=y,h.material.uniforms.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(e1.makeRotationFromEuler(ds)),h.material.toneMapped=oe.getTransfer(y.colorSpace)!==me,(u!==y||f!==y.version||p!==i.toneMapping)&&(h.material.needsUpdate=!0,u=y,f=y.version,p=i.toneMapping),h.layers.enableAll(),x.unshift(h,h.geometry,h.material,0,0,null)):y&&y.isTexture&&(c===void 0&&(c=new Te(new ys(2,2),new ze({name:"BackgroundMaterial",uniforms:gr(ni.background.uniforms),vertexShader:ni.background.vertexShader,fragmentShader:ni.background.fragmentShader,side:bi,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=y,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.toneMapped=oe.getTransfer(y.colorSpace)!==me,y.matrixAutoUpdate===!0&&y.updateMatrix(),c.material.uniforms.uvTransform.value.copy(y.matrix),(u!==y||f!==y.version||p!==i.toneMapping)&&(c.material.needsUpdate=!0,u=y,f=y.version,p=i.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null))}function d(x,M){x.getRGB(Qa,bd(i)),n.buffers.color.setClear(Qa.r,Qa.g,Qa.b,M,a)}return{getClearColor:function(){return o},setClearColor:function(x,M=1){o.set(x),l=M,d(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(x){l=x,d(o,l)},render:_,addToRenderList:m}}function i1(i,t){const e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=f(null);let r=s,a=!1;function o(E,I,$,V,Y){let nt=!1;const q=u(V,$,I);r!==q&&(r=q,c(r.object)),nt=p(E,V,$,Y),nt&&v(E,V,$,Y),Y!==null&&t.update(Y,i.ELEMENT_ARRAY_BUFFER),(nt||a)&&(a=!1,y(E,I,$,V),Y!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(Y).buffer))}function l(){return i.createVertexArray()}function c(E){return i.bindVertexArray(E)}function h(E){return i.deleteVertexArray(E)}function u(E,I,$){const V=$.wireframe===!0;let Y=n[E.id];Y===void 0&&(Y={},n[E.id]=Y);let nt=Y[I.id];nt===void 0&&(nt={},Y[I.id]=nt);let q=nt[V];return q===void 0&&(q=f(l()),nt[V]=q),q}function f(E){const I=[],$=[],V=[];for(let Y=0;Y<e;Y++)I[Y]=0,$[Y]=0,V[Y]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:I,enabledAttributes:$,attributeDivisors:V,object:E,attributes:{},index:null}}function p(E,I,$,V){const Y=r.attributes,nt=I.attributes;let q=0;const it=$.getAttributes();for(const W in it)if(it[W].location>=0){const mt=Y[W];let Ct=nt[W];if(Ct===void 0&&(W==="instanceMatrix"&&E.instanceMatrix&&(Ct=E.instanceMatrix),W==="instanceColor"&&E.instanceColor&&(Ct=E.instanceColor)),mt===void 0||mt.attribute!==Ct||Ct&&mt.data!==Ct.data)return!0;q++}return r.attributesNum!==q||r.index!==V}function v(E,I,$,V){const Y={},nt=I.attributes;let q=0;const it=$.getAttributes();for(const W in it)if(it[W].location>=0){let mt=nt[W];mt===void 0&&(W==="instanceMatrix"&&E.instanceMatrix&&(mt=E.instanceMatrix),W==="instanceColor"&&E.instanceColor&&(mt=E.instanceColor));const Ct={};Ct.attribute=mt,mt&&mt.data&&(Ct.data=mt.data),Y[W]=Ct,q++}r.attributes=Y,r.attributesNum=q,r.index=V}function _(){const E=r.newAttributes;for(let I=0,$=E.length;I<$;I++)E[I]=0}function m(E){d(E,0)}function d(E,I){const $=r.newAttributes,V=r.enabledAttributes,Y=r.attributeDivisors;$[E]=1,V[E]===0&&(i.enableVertexAttribArray(E),V[E]=1),Y[E]!==I&&(i.vertexAttribDivisor(E,I),Y[E]=I)}function x(){const E=r.newAttributes,I=r.enabledAttributes;for(let $=0,V=I.length;$<V;$++)I[$]!==E[$]&&(i.disableVertexAttribArray($),I[$]=0)}function M(E,I,$,V,Y,nt,q){q===!0?i.vertexAttribIPointer(E,I,$,Y,nt):i.vertexAttribPointer(E,I,$,V,Y,nt)}function y(E,I,$,V){_();const Y=V.attributes,nt=$.getAttributes(),q=I.defaultAttributeValues;for(const it in nt){const W=nt[it];if(W.location>=0){let st=Y[it];if(st===void 0&&(it==="instanceMatrix"&&E.instanceMatrix&&(st=E.instanceMatrix),it==="instanceColor"&&E.instanceColor&&(st=E.instanceColor)),st!==void 0){const mt=st.normalized,Ct=st.itemSize,Wt=t.get(st);if(Wt===void 0)continue;const ce=Wt.buffer,j=Wt.type,rt=Wt.bytesPerElement,Tt=j===i.INT||j===i.UNSIGNED_INT||st.gpuType===dh;if(st.isInterleavedBufferAttribute){const lt=st.data,It=lt.stride,zt=st.offset;if(lt.isInstancedInterleavedBuffer){for(let Gt=0;Gt<W.locationSize;Gt++)d(W.location+Gt,lt.meshPerAttribute);E.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=lt.meshPerAttribute*lt.count)}else for(let Gt=0;Gt<W.locationSize;Gt++)m(W.location+Gt);i.bindBuffer(i.ARRAY_BUFFER,ce);for(let Gt=0;Gt<W.locationSize;Gt++)M(W.location+Gt,Ct/W.locationSize,j,mt,It*rt,(zt+Ct/W.locationSize*Gt)*rt,Tt)}else{if(st.isInstancedBufferAttribute){for(let lt=0;lt<W.locationSize;lt++)d(W.location+lt,st.meshPerAttribute);E.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=st.meshPerAttribute*st.count)}else for(let lt=0;lt<W.locationSize;lt++)m(W.location+lt);i.bindBuffer(i.ARRAY_BUFFER,ce);for(let lt=0;lt<W.locationSize;lt++)M(W.location+lt,Ct/W.locationSize,j,mt,Ct*rt,Ct/W.locationSize*lt*rt,Tt)}}else if(q!==void 0){const mt=q[it];if(mt!==void 0)switch(mt.length){case 2:i.vertexAttrib2fv(W.location,mt);break;case 3:i.vertexAttrib3fv(W.location,mt);break;case 4:i.vertexAttrib4fv(W.location,mt);break;default:i.vertexAttrib1fv(W.location,mt)}}}}x()}function C(){P();for(const E in n){const I=n[E];for(const $ in I){const V=I[$];for(const Y in V)h(V[Y].object),delete V[Y];delete I[$]}delete n[E]}}function A(E){if(n[E.id]===void 0)return;const I=n[E.id];for(const $ in I){const V=I[$];for(const Y in V)h(V[Y].object),delete V[Y];delete I[$]}delete n[E.id]}function R(E){for(const I in n){const $=n[I];if($[E.id]===void 0)continue;const V=$[E.id];for(const Y in V)h(V[Y].object),delete V[Y];delete $[E.id]}}function P(){T(),a=!0,r!==s&&(r=s,c(r.object))}function T(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:P,resetDefaultState:T,dispose:C,releaseStatesOfGeometry:A,releaseStatesOfProgram:R,initAttributes:_,enableAttribute:m,disableUnusedAttributes:x}}function s1(i,t,e){let n;function s(c){n=c}function r(c,h){i.drawArrays(n,c,h),e.update(h,n,1)}function a(c,h,u){u!==0&&(i.drawArraysInstanced(n,c,h,u),e.update(h,n,u))}function o(c,h,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let p=0;for(let v=0;v<u;v++)p+=h[v];e.update(p,n,1)}function l(c,h,u,f){if(u===0)return;const p=t.get("WEBGL_multi_draw");if(p===null)for(let v=0;v<c.length;v++)a(c[v],h[v],f[v]);else{p.multiDrawArraysInstancedWEBGL(n,c,0,h,0,f,0,u);let v=0;for(let _=0;_<u;_++)v+=h[_]*f[_];e.update(v,n,1)}}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function r1(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){const R=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(R){return!(R!==Nn&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(R){const P=R===ai&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(R!==Ti&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&R!==ri&&!P)}function l(R){if(R==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=e.logarithmicDepthBuffer===!0,f=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control"),p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),d=i.getParameter(i.MAX_VERTEX_ATTRIBS),x=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),M=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),C=v>0,A=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reverseDepthBuffer:f,maxTextures:p,maxVertexTextures:v,maxTextureSize:_,maxCubemapSize:m,maxAttributes:d,maxVertexUniforms:x,maxVaryings:M,maxFragmentUniforms:y,vertexTextures:C,maxSamples:A}}function a1(i){const t=this;let e=null,n=0,s=!1,r=!1;const a=new gs,o=new qt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){const p=u.length!==0||f||n!==0||s;return s=f,n=u.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,f){e=h(u,f,0)},this.setState=function(u,f,p){const v=u.clippingPlanes,_=u.clipIntersection,m=u.clipShadows,d=i.get(u);if(!s||v===null||v.length===0||r&&!m)r?h(null):c();else{const x=r?0:n,M=x*4;let y=d.clippingState||null;l.value=y,y=h(v,f,M,p);for(let C=0;C!==M;++C)y[C]=e[C];d.clippingState=y,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=x}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(u,f,p,v){const _=u!==null?u.length:0;let m=null;if(_!==0){if(m=l.value,v!==!0||m===null){const d=p+_*4,x=f.matrixWorldInverse;o.getNormalMatrix(x),(m===null||m.length<d)&&(m=new Float32Array(d));for(let M=0,y=p;M!==_;++M,y+=4)a.copy(u[M]).applyMatrix4(x,o),a.normal.toArray(m,y),m[y+3]=a.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,m}}function o1(i){let t=new WeakMap;function e(a,o){return o===xc?a.mapping=fr:o===Mc&&(a.mapping=dr),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===xc||o===Mc)if(t.has(a)){const l=t.get(a).texture;return e(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new _0(l.height);return c.fromEquirectangularTexture(i,a),t.set(a,c),a.addEventListener("dispose",s),e(c.texture,a.mapping)}else return null}}return a}function s(a){const o=a.target;o.removeEventListener("dispose",s);const l=t.get(o);l!==void 0&&(t.delete(o),l.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}class Eh extends Td{constructor(t=-1,e=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-t,a=n+t,o=s+e,l=s-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}const nr=4,Mu=[.125,.215,.35,.446,.526,.582],xs=20,kl=new Eh,yu=new Jt;let Ul=null,zl=0,Fl=0,Bl=!1;const vs=(1+Math.sqrt(5))/2,$s=1/vs,Su=[new N(-vs,$s,0),new N(vs,$s,0),new N(-$s,0,vs),new N($s,0,vs),new N(0,vs,-$s),new N(0,vs,$s),new N(-1,1,-1),new N(1,1,-1),new N(-1,1,1),new N(1,1,1)];class Eu{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,s=100){Ul=this._renderer.getRenderTarget(),zl=this._renderer.getActiveCubeFace(),Fl=this._renderer.getActiveMipmapLevel(),Bl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,n,s,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Au(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Tu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(Ul,zl,Fl),this._renderer.xr.enabled=Bl,t.scissorTest=!1,to(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===fr||t.mapping===dr?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Ul=this._renderer.getRenderTarget(),zl=this._renderer.getActiveCubeFace(),Fl=this._renderer.getActiveMipmapLevel(),Bl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:on,minFilter:on,generateMipmaps:!1,type:ai,format:Nn,colorSpace:yr,depthBuffer:!1},s=bu(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=bu(t,e,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=l1(r)),this._blurMaterial=c1(r,t,e)}return s}_compileMaterial(t){const e=new Te(this._lodPlanes[0],t);this._renderer.compile(e,kl)}_sceneToCubeUV(t,e,n,s){const o=new In(90,1,e,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,f=h.toneMapping;h.getClearColor(yu),h.toneMapping=Yi,h.autoClear=!1;const p=new jn({name:"PMREM.Background",side:ln,depthWrite:!1,depthTest:!1}),v=new Te(new es,p);let _=!1;const m=t.background;m?m.isColor&&(p.color.copy(m),t.background=null,_=!0):(p.color.copy(yu),_=!0);for(let d=0;d<6;d++){const x=d%3;x===0?(o.up.set(0,l[d],0),o.lookAt(c[d],0,0)):x===1?(o.up.set(0,0,l[d]),o.lookAt(0,c[d],0)):(o.up.set(0,l[d],0),o.lookAt(0,0,c[d]));const M=this._cubeSize;to(s,x*M,d>2?M:0,M,M),h.setRenderTarget(s),_&&h.render(v,o),h.render(t,o)}v.geometry.dispose(),v.material.dispose(),h.toneMapping=f,h.autoClear=u,t.background=m}_textureToCubeUV(t,e){const n=this._renderer,s=t.mapping===fr||t.mapping===dr;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Au()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Tu());const r=s?this._cubemapMaterial:this._equirectMaterial,a=new Te(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=t;const l=this._cubeSize;to(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(a,kl)}_applyPMREM(t){const e=this._renderer,n=e.autoClear;e.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=Su[(s-r-1)%Su.length];this._blur(t,r-1,r,a,o)}e.autoClear=n}_blur(t,e,n,s,r){const a=this._pingPongRenderTarget;this._halfBlur(t,a,e,n,s,"latitudinal",r),this._halfBlur(a,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new Te(this._lodPlanes[s],c),f=c.uniforms,p=this._sizeLods[n]-1,v=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*xs-1),_=r/v,m=isFinite(r)?1+Math.floor(h*_):xs;m>xs&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${xs}`);const d=[];let x=0;for(let R=0;R<xs;++R){const P=R/_,T=Math.exp(-P*P/2);d.push(T),R===0?x+=T:R<m&&(x+=2*T)}for(let R=0;R<d.length;R++)d[R]=d[R]/x;f.envMap.value=t.texture,f.samples.value=m,f.weights.value=d,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);const{_lodMax:M}=this;f.dTheta.value=v,f.mipInt.value=M-n;const y=this._sizeLods[s],C=3*y*(s>M-nr?s-M+nr:0),A=4*(this._cubeSize-y);to(e,C,A,3*y,2*y),l.setRenderTarget(e),l.render(u,kl)}}function l1(i){const t=[],e=[],n=[];let s=i;const r=i-nr+1+Mu.length;for(let a=0;a<r;a++){const o=Math.pow(2,s);e.push(o);let l=1/o;a>i-nr?l=Mu[a-i+nr-1]:a===0&&(l=0),n.push(l);const c=1/(o-2),h=-c,u=1+c,f=[h,h,u,h,u,u,h,h,u,u,h,u],p=6,v=6,_=3,m=2,d=1,x=new Float32Array(_*v*p),M=new Float32Array(m*v*p),y=new Float32Array(d*v*p);for(let A=0;A<p;A++){const R=A%3*2/3-1,P=A>2?0:-1,T=[R,P,0,R+2/3,P,0,R+2/3,P+1,0,R,P,0,R+2/3,P+1,0,R,P+1,0];x.set(T,_*v*A),M.set(f,m*v*A);const E=[A,A,A,A,A,A];y.set(E,d*v*A)}const C=new Ie;C.setAttribute("position",new be(x,_)),C.setAttribute("uv",new be(M,m)),C.setAttribute("faceIndex",new be(y,d)),t.push(C),s>nr&&s--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function bu(i,t,e){const n=new wn(i,t,e);return n.texture.mapping=jo,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function to(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function c1(i,t,e){const n=new Float32Array(xs),s=new N(0,1,0);return new ze({name:"SphericalGaussianBlur",defines:{n:xs,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:bh(),fragmentShader:`

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
		`,blending:xi,depthTest:!1,depthWrite:!1})}function Tu(){return new ze({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:bh(),fragmentShader:`

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
		`,blending:xi,depthTest:!1,depthWrite:!1})}function Au(){return new ze({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:bh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:xi,depthTest:!1,depthWrite:!1})}function bh(){return`

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
	`}function h1(i){let t=new WeakMap,e=null;function n(o){if(o&&o.isTexture){const l=o.mapping,c=l===xc||l===Mc,h=l===fr||l===dr;if(c||h){let u=t.get(o);const f=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==f)return e===null&&(e=new Eu(i)),u=c?e.fromEquirectangular(o,u):e.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),u.texture;if(u!==void 0)return u.texture;{const p=o.image;return c&&p&&p.height>0||h&&p&&s(p)?(e===null&&(e=new Eu(i)),u=c?e.fromEquirectangular(o):e.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),o.addEventListener("dispose",r),u.texture):null}}}return o}function s(o){let l=0;const c=6;for(let h=0;h<c;h++)o[h]!==void 0&&l++;return l===c}function r(o){const l=o.target;l.removeEventListener("dispose",r);const c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function a(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:a}}function u1(i){const t={};function e(n){if(t[n]!==void 0)return t[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const s=e(n);return s===null&&Zr("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function f1(i,t,e,n){const s={},r=new WeakMap;function a(u){const f=u.target;f.index!==null&&t.remove(f.index);for(const v in f.attributes)t.remove(f.attributes[v]);for(const v in f.morphAttributes){const _=f.morphAttributes[v];for(let m=0,d=_.length;m<d;m++)t.remove(_[m])}f.removeEventListener("dispose",a),delete s[f.id];const p=r.get(f);p&&(t.remove(p),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,e.memory.geometries--}function o(u,f){return s[f.id]===!0||(f.addEventListener("dispose",a),s[f.id]=!0,e.memory.geometries++),f}function l(u){const f=u.attributes;for(const v in f)t.update(f[v],i.ARRAY_BUFFER);const p=u.morphAttributes;for(const v in p){const _=p[v];for(let m=0,d=_.length;m<d;m++)t.update(_[m],i.ARRAY_BUFFER)}}function c(u){const f=[],p=u.index,v=u.attributes.position;let _=0;if(p!==null){const x=p.array;_=p.version;for(let M=0,y=x.length;M<y;M+=3){const C=x[M+0],A=x[M+1],R=x[M+2];f.push(C,A,A,R,R,C)}}else if(v!==void 0){const x=v.array;_=v.version;for(let M=0,y=x.length/3-1;M<y;M+=3){const C=M+0,A=M+1,R=M+2;f.push(C,A,A,R,R,C)}}else return;const m=new(xd(f)?Sh:yh)(f,1);m.version=_;const d=r.get(u);d&&t.remove(d),r.set(u,m)}function h(u){const f=r.get(u);if(f){const p=u.index;p!==null&&f.version<p.version&&c(u)}else c(u);return r.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function d1(i,t,e){let n;function s(f){n=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function l(f,p){i.drawElements(n,p,r,f*a),e.update(p,n,1)}function c(f,p,v){v!==0&&(i.drawElementsInstanced(n,p,r,f*a,v),e.update(p,n,v))}function h(f,p,v){if(v===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,p,0,r,f,0,v);let m=0;for(let d=0;d<v;d++)m+=p[d];e.update(m,n,1)}function u(f,p,v,_){if(v===0)return;const m=t.get("WEBGL_multi_draw");if(m===null)for(let d=0;d<f.length;d++)c(f[d]/a,p[d],_[d]);else{m.multiDrawElementsInstancedWEBGL(n,p,0,r,f,0,_,0,v);let d=0;for(let x=0;x<v;x++)d+=p[x]*_[x];e.update(d,n,1)}}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function p1(i){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case i.TRIANGLES:e.triangles+=o*(r/3);break;case i.LINES:e.lines+=o*(r/2);break;case i.LINE_STRIP:e.lines+=o*(r-1);break;case i.LINE_LOOP:e.lines+=o*r;break;case i.POINTS:e.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function m1(i,t,e){const n=new WeakMap,s=new Oe;function r(a,o,l){const c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0;let f=n.get(o);if(f===void 0||f.count!==u){let T=function(){R.dispose(),n.delete(o),o.removeEventListener("dispose",T)};f!==void 0&&f.texture.dispose();const p=o.morphAttributes.position!==void 0,v=o.morphAttributes.normal!==void 0,_=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],d=o.morphAttributes.normal||[],x=o.morphAttributes.color||[];let M=0;p===!0&&(M=1),v===!0&&(M=2),_===!0&&(M=3);let y=o.attributes.position.count*M,C=1;y>t.maxTextureSize&&(C=Math.ceil(y/t.maxTextureSize),y=t.maxTextureSize);const A=new Float32Array(y*C*4*u),R=new yd(A,y,C,u);R.type=ri,R.needsUpdate=!0;const P=M*4;for(let E=0;E<u;E++){const I=m[E],$=d[E],V=x[E],Y=y*C*4*E;for(let nt=0;nt<I.count;nt++){const q=nt*P;p===!0&&(s.fromBufferAttribute(I,nt),A[Y+q+0]=s.x,A[Y+q+1]=s.y,A[Y+q+2]=s.z,A[Y+q+3]=0),v===!0&&(s.fromBufferAttribute($,nt),A[Y+q+4]=s.x,A[Y+q+5]=s.y,A[Y+q+6]=s.z,A[Y+q+7]=0),_===!0&&(s.fromBufferAttribute(V,nt),A[Y+q+8]=s.x,A[Y+q+9]=s.y,A[Y+q+10]=s.z,A[Y+q+11]=V.itemSize===4?s.w:1)}}f={count:u,texture:R,size:new kt(y,C)},n.set(o,f),o.addEventListener("dispose",T)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,e);else{let p=0;for(let _=0;_<c.length;_++)p+=c[_];const v=o.morphTargetsRelative?1:1-p;l.getUniforms().setValue(i,"morphTargetBaseInfluence",v),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",f.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",f.size)}return{update:r}}function g1(i,t,e,n){let s=new WeakMap;function r(l){const c=n.render.frame,h=l.geometry,u=t.get(l,h);if(s.get(u)!==c&&(t.update(u),s.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),s.get(l)!==c&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const f=l.skeleton;s.get(f)!==c&&(f.update(),s.set(f,c))}return u}function a(){s=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:a}}class Th extends Xe{constructor(t,e,n,s,r,a,o,l,c,h=lr){if(h!==lr&&h!==mr)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===lr&&(n=ts),n===void 0&&h===mr&&(n=pr),super(null,s,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=o!==void 0?o:Je,this.minFilter=l!==void 0?l:Je,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}const Cd=new Xe,wu=new Th(1,1),Ld=new yd,Dd=new i0,Pd=new Ad,Ru=[],Cu=[],Lu=new Float32Array(16),Du=new Float32Array(9),Pu=new Float32Array(4);function Er(i,t,e){const n=i[0];if(n<=0||n>0)return i;const s=t*e;let r=Ru[s];if(r===void 0&&(r=new Float32Array(s),Ru[s]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,i[a].toArray(r,o)}return r}function Be(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function He(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function Jo(i,t){let e=Cu[t];e===void 0&&(e=new Int32Array(t),Cu[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function v1(i,t){const e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function _1(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Be(e,t))return;i.uniform2fv(this.addr,t),He(e,t)}}function x1(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Be(e,t))return;i.uniform3fv(this.addr,t),He(e,t)}}function M1(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Be(e,t))return;i.uniform4fv(this.addr,t),He(e,t)}}function y1(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Be(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),He(e,t)}else{if(Be(e,n))return;Pu.set(n),i.uniformMatrix2fv(this.addr,!1,Pu),He(e,n)}}function S1(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Be(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),He(e,t)}else{if(Be(e,n))return;Du.set(n),i.uniformMatrix3fv(this.addr,!1,Du),He(e,n)}}function E1(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Be(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),He(e,t)}else{if(Be(e,n))return;Lu.set(n),i.uniformMatrix4fv(this.addr,!1,Lu),He(e,n)}}function b1(i,t){const e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function T1(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Be(e,t))return;i.uniform2iv(this.addr,t),He(e,t)}}function A1(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Be(e,t))return;i.uniform3iv(this.addr,t),He(e,t)}}function w1(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Be(e,t))return;i.uniform4iv(this.addr,t),He(e,t)}}function R1(i,t){const e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function C1(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Be(e,t))return;i.uniform2uiv(this.addr,t),He(e,t)}}function L1(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Be(e,t))return;i.uniform3uiv(this.addr,t),He(e,t)}}function D1(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Be(e,t))return;i.uniform4uiv(this.addr,t),He(e,t)}}function P1(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(wu.compareFunction=_d,r=wu):r=Cd,e.setTexture2D(t||r,s)}function I1(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||Dd,s)}function N1(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||Pd,s)}function O1(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||Ld,s)}function k1(i){switch(i){case 5126:return v1;case 35664:return _1;case 35665:return x1;case 35666:return M1;case 35674:return y1;case 35675:return S1;case 35676:return E1;case 5124:case 35670:return b1;case 35667:case 35671:return T1;case 35668:case 35672:return A1;case 35669:case 35673:return w1;case 5125:return R1;case 36294:return C1;case 36295:return L1;case 36296:return D1;case 35678:case 36198:case 36298:case 36306:case 35682:return P1;case 35679:case 36299:case 36307:return I1;case 35680:case 36300:case 36308:case 36293:return N1;case 36289:case 36303:case 36311:case 36292:return O1}}function U1(i,t){i.uniform1fv(this.addr,t)}function z1(i,t){const e=Er(t,this.size,2);i.uniform2fv(this.addr,e)}function F1(i,t){const e=Er(t,this.size,3);i.uniform3fv(this.addr,e)}function B1(i,t){const e=Er(t,this.size,4);i.uniform4fv(this.addr,e)}function H1(i,t){const e=Er(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function G1(i,t){const e=Er(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function V1(i,t){const e=Er(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function W1(i,t){i.uniform1iv(this.addr,t)}function X1(i,t){i.uniform2iv(this.addr,t)}function $1(i,t){i.uniform3iv(this.addr,t)}function q1(i,t){i.uniform4iv(this.addr,t)}function K1(i,t){i.uniform1uiv(this.addr,t)}function Y1(i,t){i.uniform2uiv(this.addr,t)}function j1(i,t){i.uniform3uiv(this.addr,t)}function Z1(i,t){i.uniform4uiv(this.addr,t)}function J1(i,t,e){const n=this.cache,s=t.length,r=Jo(e,s);Be(n,r)||(i.uniform1iv(this.addr,r),He(n,r));for(let a=0;a!==s;++a)e.setTexture2D(t[a]||Cd,r[a])}function Q1(i,t,e){const n=this.cache,s=t.length,r=Jo(e,s);Be(n,r)||(i.uniform1iv(this.addr,r),He(n,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||Dd,r[a])}function t_(i,t,e){const n=this.cache,s=t.length,r=Jo(e,s);Be(n,r)||(i.uniform1iv(this.addr,r),He(n,r));for(let a=0;a!==s;++a)e.setTextureCube(t[a]||Pd,r[a])}function e_(i,t,e){const n=this.cache,s=t.length,r=Jo(e,s);Be(n,r)||(i.uniform1iv(this.addr,r),He(n,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||Ld,r[a])}function n_(i){switch(i){case 5126:return U1;case 35664:return z1;case 35665:return F1;case 35666:return B1;case 35674:return H1;case 35675:return G1;case 35676:return V1;case 5124:case 35670:return W1;case 35667:case 35671:return X1;case 35668:case 35672:return $1;case 35669:case 35673:return q1;case 5125:return K1;case 36294:return Y1;case 36295:return j1;case 36296:return Z1;case 35678:case 36198:case 36298:case 36306:case 35682:return J1;case 35679:case 36299:case 36307:return Q1;case 35680:case 36300:case 36308:case 36293:return t_;case 36289:case 36303:case 36311:case 36292:return e_}}class i_{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=k1(e.type)}}class s_{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=n_(e.type)}}class r_{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(t,e[o.id],n)}}}const Hl=/(\w+)(\])?(\[|\.)?/g;function Iu(i,t){i.seq.push(t),i.map[t.id]=t}function a_(i,t,e){const n=i.name,s=n.length;for(Hl.lastIndex=0;;){const r=Hl.exec(n),a=Hl.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){Iu(e,c===void 0?new i_(o,i,t):new s_(o,i,t));break}else{let u=e.map[o];u===void 0&&(u=new r_(o),Iu(e,u)),e=u}}}class Ao{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=t.getActiveUniform(e,s),a=t.getUniformLocation(e,r.name);a_(r,a,this)}}setValue(t,e,n,s){const r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){const s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,a=e.length;r!==a;++r){const o=e[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,e){const n=[];for(let s=0,r=t.length;s!==r;++s){const a=t[s];a.id in e&&n.push(a)}return n}}function Nu(i,t,e){const n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}const o_=37297;let l_=0;function c_(i,t){const e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){const o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}const Ou=new qt;function h_(i){oe._getMatrix(Ou,oe.workingColorSpace,i);const t=`mat3( ${Ou.elements.map(e=>e.toFixed(4))} )`;switch(oe.getTransfer(i)){case Zo:return[t,"LinearTransferOETF"];case me:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function ku(i,t,e){const n=i.getShaderParameter(t,i.COMPILE_STATUS),s=i.getShaderInfoLog(t).trim();if(n&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const a=parseInt(r[1]);return e.toUpperCase()+`

`+s+`

`+c_(i.getShaderSource(t),a)}else return s}function u_(i,t){const e=h_(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}function f_(i,t){let e;switch(t){case Cm:e="Linear";break;case Lm:e="Reinhard";break;case Dm:e="Cineon";break;case Pm:e="ACESFilmic";break;case Nm:e="AgX";break;case Om:e="Neutral";break;case Im:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const eo=new N;function d_(){oe.getLuminanceCoefficients(eo);const i=eo.x.toFixed(4),t=eo.y.toFixed(4),e=eo.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function p_(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Jr).join(`
`)}function m_(i){const t=[];for(const e in i){const n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function g_(i,t){const e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(t,s),a=r.name;let o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:i.getAttribLocation(t,a),locationSize:o}}return e}function Jr(i){return i!==""}function Uu(i,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function zu(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const v_=/^[ \t]*#include +<([\w\d./]+)>/gm;function jc(i){return i.replace(v_,x_)}const __=new Map;function x_(i,t){let e=Yt[t];if(e===void 0){const n=__.get(t);if(n!==void 0)e=Yt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return jc(e)}const M_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Fu(i){return i.replace(M_,y_)}function y_(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Bu(i){let t=`precision ${i.precision} float;
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
#define LOW_PRECISION`),t}function S_(i){let t="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===ad?t="SHADOWMAP_TYPE_PCF":i.shadowMapType===lm?t="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===gi&&(t="SHADOWMAP_TYPE_VSM"),t}function E_(i){let t="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case fr:case dr:t="ENVMAP_TYPE_CUBE";break;case jo:t="ENVMAP_TYPE_CUBE_UV";break}return t}function b_(i){let t="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case dr:t="ENVMAP_MODE_REFRACTION";break}return t}function T_(i){let t="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case od:t="ENVMAP_BLENDING_MULTIPLY";break;case wm:t="ENVMAP_BLENDING_MIX";break;case Rm:t="ENVMAP_BLENDING_ADD";break}return t}function A_(i){const t=i.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:n,maxMip:e}}function w_(i,t,e,n){const s=i.getContext(),r=e.defines;let a=e.vertexShader,o=e.fragmentShader;const l=S_(e),c=E_(e),h=b_(e),u=T_(e),f=A_(e),p=p_(e),v=m_(r),_=s.createProgram();let m,d,x=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,v].filter(Jr).join(`
`),m.length>0&&(m+=`
`),d=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,v].filter(Jr).join(`
`),d.length>0&&(d+=`
`)):(m=[Bu(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,v,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Jr).join(`
`),d=[Bu(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,v,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Yi?"#define TONE_MAPPING":"",e.toneMapping!==Yi?Yt.tonemapping_pars_fragment:"",e.toneMapping!==Yi?f_("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Yt.colorspace_pars_fragment,u_("linearToOutputTexel",e.outputColorSpace),d_(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Jr).join(`
`)),a=jc(a),a=Uu(a,e),a=zu(a,e),o=jc(o),o=Uu(o,e),o=zu(o,e),a=Fu(a),o=Fu(o),e.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,d=["#define varying in",e.glslVersion===Qh?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Qh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const M=x+m+a,y=x+d+o,C=Nu(s,s.VERTEX_SHADER,M),A=Nu(s,s.FRAGMENT_SHADER,y);s.attachShader(_,C),s.attachShader(_,A),e.index0AttributeName!==void 0?s.bindAttribLocation(_,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function R(I){if(i.debug.checkShaderErrors){const $=s.getProgramInfoLog(_).trim(),V=s.getShaderInfoLog(C).trim(),Y=s.getShaderInfoLog(A).trim();let nt=!0,q=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(nt=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,_,C,A);else{const it=ku(s,C,"vertex"),W=ku(s,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+$+`
`+it+`
`+W)}else $!==""?console.warn("THREE.WebGLProgram: Program Info Log:",$):(V===""||Y==="")&&(q=!1);q&&(I.diagnostics={runnable:nt,programLog:$,vertexShader:{log:V,prefix:m},fragmentShader:{log:Y,prefix:d}})}s.deleteShader(C),s.deleteShader(A),P=new Ao(s,_),T=g_(s,_)}let P;this.getUniforms=function(){return P===void 0&&R(this),P};let T;this.getAttributes=function(){return T===void 0&&R(this),T};let E=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=s.getProgramParameter(_,o_)),E},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=l_++,this.cacheKey=t,this.usedTimes=1,this.program=_,this.vertexShader=C,this.fragmentShader=A,this}let R_=0;class C_{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,n=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(t);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new L_(t),e.set(t,n)),n}}class L_{constructor(t){this.id=R_++,this.code=t,this.usedTimes=0}}function D_(i,t,e,n,s,r,a){const o=new Sd,l=new C_,c=new Set,h=[],u=s.logarithmicDepthBuffer,f=s.vertexTextures;let p=s.precision;const v={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(T){return c.add(T),T===0?"uv":`uv${T}`}function m(T,E,I,$,V){const Y=$.fog,nt=V.geometry,q=T.isMeshStandardMaterial?$.environment:null,it=(T.isMeshStandardMaterial?e:t).get(T.envMap||q),W=it&&it.mapping===jo?it.image.height:null,st=v[T.type];T.precision!==null&&(p=s.getMaxPrecision(T.precision),p!==T.precision&&console.warn("THREE.WebGLProgram.getParameters:",T.precision,"not supported, using",p,"instead."));const mt=nt.morphAttributes.position||nt.morphAttributes.normal||nt.morphAttributes.color,Ct=mt!==void 0?mt.length:0;let Wt=0;nt.morphAttributes.position!==void 0&&(Wt=1),nt.morphAttributes.normal!==void 0&&(Wt=2),nt.morphAttributes.color!==void 0&&(Wt=3);let ce,j,rt,Tt;if(st){const fe=ni[st];ce=fe.vertexShader,j=fe.fragmentShader}else ce=T.vertexShader,j=T.fragmentShader,l.update(T),rt=l.getVertexShaderID(T),Tt=l.getFragmentShaderID(T);const lt=i.getRenderTarget(),It=i.state.buffers.depth.getReversed(),zt=V.isInstancedMesh===!0,Gt=V.isBatchedMesh===!0,pe=!!T.map,Zt=!!T.matcap,Ae=!!it,U=!!T.aoMap,tn=!!T.lightMap,jt=!!T.bumpMap,ee=!!T.normalMap,Ot=!!T.displacementMap,ye=!!T.emissiveMap,Nt=!!T.metalnessMap,w=!!T.roughnessMap,S=T.anisotropy>0,B=T.clearcoat>0,J=T.dispersion>0,et=T.iridescence>0,Z=T.sheen>0,Lt=T.transmission>0,ft=S&&!!T.anisotropyMap,St=B&&!!T.clearcoatMap,re=B&&!!T.clearcoatNormalMap,at=B&&!!T.clearcoatRoughnessMap,Et=et&&!!T.iridescenceMap,Ut=et&&!!T.iridescenceThicknessMap,Ft=Z&&!!T.sheenColorMap,bt=Z&&!!T.sheenRoughnessMap,ne=!!T.specularMap,Kt=!!T.specularColorMap,xe=!!T.specularIntensityMap,O=Lt&&!!T.transmissionMap,ut=Lt&&!!T.thicknessMap,X=!!T.gradientMap,Q=!!T.alphaMap,gt=T.alphaTest>0,dt=!!T.alphaHash,Xt=!!T.extensions;let Le=Yi;T.toneMapped&&(lt===null||lt.isXRRenderTarget===!0)&&(Le=i.toneMapping);const $e={shaderID:st,shaderType:T.type,shaderName:T.name,vertexShader:ce,fragmentShader:j,defines:T.defines,customVertexShaderID:rt,customFragmentShaderID:Tt,isRawShaderMaterial:T.isRawShaderMaterial===!0,glslVersion:T.glslVersion,precision:p,batching:Gt,batchingColor:Gt&&V._colorsTexture!==null,instancing:zt,instancingColor:zt&&V.instanceColor!==null,instancingMorph:zt&&V.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:lt===null?i.outputColorSpace:lt.isXRRenderTarget===!0?lt.texture.colorSpace:yr,alphaToCoverage:!!T.alphaToCoverage,map:pe,matcap:Zt,envMap:Ae,envMapMode:Ae&&it.mapping,envMapCubeUVHeight:W,aoMap:U,lightMap:tn,bumpMap:jt,normalMap:ee,displacementMap:f&&Ot,emissiveMap:ye,normalMapObjectSpace:ee&&T.normalMapType===Bm,normalMapTangentSpace:ee&&T.normalMapType===Fm,metalnessMap:Nt,roughnessMap:w,anisotropy:S,anisotropyMap:ft,clearcoat:B,clearcoatMap:St,clearcoatNormalMap:re,clearcoatRoughnessMap:at,dispersion:J,iridescence:et,iridescenceMap:Et,iridescenceThicknessMap:Ut,sheen:Z,sheenColorMap:Ft,sheenRoughnessMap:bt,specularMap:ne,specularColorMap:Kt,specularIntensityMap:xe,transmission:Lt,transmissionMap:O,thicknessMap:ut,gradientMap:X,opaque:T.transparent===!1&&T.blending===or&&T.alphaToCoverage===!1,alphaMap:Q,alphaTest:gt,alphaHash:dt,combine:T.combine,mapUv:pe&&_(T.map.channel),aoMapUv:U&&_(T.aoMap.channel),lightMapUv:tn&&_(T.lightMap.channel),bumpMapUv:jt&&_(T.bumpMap.channel),normalMapUv:ee&&_(T.normalMap.channel),displacementMapUv:Ot&&_(T.displacementMap.channel),emissiveMapUv:ye&&_(T.emissiveMap.channel),metalnessMapUv:Nt&&_(T.metalnessMap.channel),roughnessMapUv:w&&_(T.roughnessMap.channel),anisotropyMapUv:ft&&_(T.anisotropyMap.channel),clearcoatMapUv:St&&_(T.clearcoatMap.channel),clearcoatNormalMapUv:re&&_(T.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:at&&_(T.clearcoatRoughnessMap.channel),iridescenceMapUv:Et&&_(T.iridescenceMap.channel),iridescenceThicknessMapUv:Ut&&_(T.iridescenceThicknessMap.channel),sheenColorMapUv:Ft&&_(T.sheenColorMap.channel),sheenRoughnessMapUv:bt&&_(T.sheenRoughnessMap.channel),specularMapUv:ne&&_(T.specularMap.channel),specularColorMapUv:Kt&&_(T.specularColorMap.channel),specularIntensityMapUv:xe&&_(T.specularIntensityMap.channel),transmissionMapUv:O&&_(T.transmissionMap.channel),thicknessMapUv:ut&&_(T.thicknessMap.channel),alphaMapUv:Q&&_(T.alphaMap.channel),vertexTangents:!!nt.attributes.tangent&&(ee||S),vertexColors:T.vertexColors,vertexAlphas:T.vertexColors===!0&&!!nt.attributes.color&&nt.attributes.color.itemSize===4,pointsUvs:V.isPoints===!0&&!!nt.attributes.uv&&(pe||Q),fog:!!Y,useFog:T.fog===!0,fogExp2:!!Y&&Y.isFogExp2,flatShading:T.flatShading===!0,sizeAttenuation:T.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:It,skinning:V.isSkinnedMesh===!0,morphTargets:nt.morphAttributes.position!==void 0,morphNormals:nt.morphAttributes.normal!==void 0,morphColors:nt.morphAttributes.color!==void 0,morphTargetsCount:Ct,morphTextureStride:Wt,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:T.dithering,shadowMapEnabled:i.shadowMap.enabled&&I.length>0,shadowMapType:i.shadowMap.type,toneMapping:Le,decodeVideoTexture:pe&&T.map.isVideoTexture===!0&&oe.getTransfer(T.map.colorSpace)===me,decodeVideoTextureEmissive:ye&&T.emissiveMap.isVideoTexture===!0&&oe.getTransfer(T.emissiveMap.colorSpace)===me,premultipliedAlpha:T.premultipliedAlpha,doubleSided:T.side===mn,flipSided:T.side===ln,useDepthPacking:T.depthPacking>=0,depthPacking:T.depthPacking||0,index0AttributeName:T.index0AttributeName,extensionClipCullDistance:Xt&&T.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Xt&&T.extensions.multiDraw===!0||Gt)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:T.customProgramCacheKey()};return $e.vertexUv1s=c.has(1),$e.vertexUv2s=c.has(2),$e.vertexUv3s=c.has(3),c.clear(),$e}function d(T){const E=[];if(T.shaderID?E.push(T.shaderID):(E.push(T.customVertexShaderID),E.push(T.customFragmentShaderID)),T.defines!==void 0)for(const I in T.defines)E.push(I),E.push(T.defines[I]);return T.isRawShaderMaterial===!1&&(x(E,T),M(E,T),E.push(i.outputColorSpace)),E.push(T.customProgramCacheKey),E.join()}function x(T,E){T.push(E.precision),T.push(E.outputColorSpace),T.push(E.envMapMode),T.push(E.envMapCubeUVHeight),T.push(E.mapUv),T.push(E.alphaMapUv),T.push(E.lightMapUv),T.push(E.aoMapUv),T.push(E.bumpMapUv),T.push(E.normalMapUv),T.push(E.displacementMapUv),T.push(E.emissiveMapUv),T.push(E.metalnessMapUv),T.push(E.roughnessMapUv),T.push(E.anisotropyMapUv),T.push(E.clearcoatMapUv),T.push(E.clearcoatNormalMapUv),T.push(E.clearcoatRoughnessMapUv),T.push(E.iridescenceMapUv),T.push(E.iridescenceThicknessMapUv),T.push(E.sheenColorMapUv),T.push(E.sheenRoughnessMapUv),T.push(E.specularMapUv),T.push(E.specularColorMapUv),T.push(E.specularIntensityMapUv),T.push(E.transmissionMapUv),T.push(E.thicknessMapUv),T.push(E.combine),T.push(E.fogExp2),T.push(E.sizeAttenuation),T.push(E.morphTargetsCount),T.push(E.morphAttributeCount),T.push(E.numDirLights),T.push(E.numPointLights),T.push(E.numSpotLights),T.push(E.numSpotLightMaps),T.push(E.numHemiLights),T.push(E.numRectAreaLights),T.push(E.numDirLightShadows),T.push(E.numPointLightShadows),T.push(E.numSpotLightShadows),T.push(E.numSpotLightShadowsWithMaps),T.push(E.numLightProbes),T.push(E.shadowMapType),T.push(E.toneMapping),T.push(E.numClippingPlanes),T.push(E.numClipIntersection),T.push(E.depthPacking)}function M(T,E){o.disableAll(),E.supportsVertexTextures&&o.enable(0),E.instancing&&o.enable(1),E.instancingColor&&o.enable(2),E.instancingMorph&&o.enable(3),E.matcap&&o.enable(4),E.envMap&&o.enable(5),E.normalMapObjectSpace&&o.enable(6),E.normalMapTangentSpace&&o.enable(7),E.clearcoat&&o.enable(8),E.iridescence&&o.enable(9),E.alphaTest&&o.enable(10),E.vertexColors&&o.enable(11),E.vertexAlphas&&o.enable(12),E.vertexUv1s&&o.enable(13),E.vertexUv2s&&o.enable(14),E.vertexUv3s&&o.enable(15),E.vertexTangents&&o.enable(16),E.anisotropy&&o.enable(17),E.alphaHash&&o.enable(18),E.batching&&o.enable(19),E.dispersion&&o.enable(20),E.batchingColor&&o.enable(21),T.push(o.mask),o.disableAll(),E.fog&&o.enable(0),E.useFog&&o.enable(1),E.flatShading&&o.enable(2),E.logarithmicDepthBuffer&&o.enable(3),E.reverseDepthBuffer&&o.enable(4),E.skinning&&o.enable(5),E.morphTargets&&o.enable(6),E.morphNormals&&o.enable(7),E.morphColors&&o.enable(8),E.premultipliedAlpha&&o.enable(9),E.shadowMapEnabled&&o.enable(10),E.doubleSided&&o.enable(11),E.flipSided&&o.enable(12),E.useDepthPacking&&o.enable(13),E.dithering&&o.enable(14),E.transmission&&o.enable(15),E.sheen&&o.enable(16),E.opaque&&o.enable(17),E.pointsUvs&&o.enable(18),E.decodeVideoTexture&&o.enable(19),E.decodeVideoTextureEmissive&&o.enable(20),E.alphaToCoverage&&o.enable(21),T.push(o.mask)}function y(T){const E=v[T.type];let I;if(E){const $=ni[E];I=ko.clone($.uniforms)}else I=T.uniforms;return I}function C(T,E){let I;for(let $=0,V=h.length;$<V;$++){const Y=h[$];if(Y.cacheKey===E){I=Y,++I.usedTimes;break}}return I===void 0&&(I=new w_(i,E,T,r),h.push(I)),I}function A(T){if(--T.usedTimes===0){const E=h.indexOf(T);h[E]=h[h.length-1],h.pop(),T.destroy()}}function R(T){l.remove(T)}function P(){l.dispose()}return{getParameters:m,getProgramCacheKey:d,getUniforms:y,acquireProgram:C,releaseProgram:A,releaseShaderCache:R,programs:h,dispose:P}}function P_(){let i=new WeakMap;function t(a){return i.has(a)}function e(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function I_(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.z!==t.z?i.z-t.z:i.id-t.id}function Hu(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function Gu(){const i=[];let t=0;const e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function a(u,f,p,v,_,m){let d=i[t];return d===void 0?(d={id:u.id,object:u,geometry:f,material:p,groupOrder:v,renderOrder:u.renderOrder,z:_,group:m},i[t]=d):(d.id=u.id,d.object=u,d.geometry=f,d.material=p,d.groupOrder=v,d.renderOrder=u.renderOrder,d.z=_,d.group=m),t++,d}function o(u,f,p,v,_,m){const d=a(u,f,p,v,_,m);p.transmission>0?n.push(d):p.transparent===!0?s.push(d):e.push(d)}function l(u,f,p,v,_,m){const d=a(u,f,p,v,_,m);p.transmission>0?n.unshift(d):p.transparent===!0?s.unshift(d):e.unshift(d)}function c(u,f){e.length>1&&e.sort(u||I_),n.length>1&&n.sort(f||Hu),s.length>1&&s.sort(f||Hu)}function h(){for(let u=t,f=i.length;u<f;u++){const p=i[u];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:o,unshift:l,finish:h,sort:c}}function N_(){let i=new WeakMap;function t(n,s){const r=i.get(n);let a;return r===void 0?(a=new Gu,i.set(n,[a])):s>=r.length?(a=new Gu,r.push(a)):a=r[s],a}function e(){i=new WeakMap}return{get:t,dispose:e}}function O_(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new N,color:new Jt};break;case"SpotLight":e={position:new N,direction:new N,color:new Jt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new N,color:new Jt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new N,skyColor:new Jt,groundColor:new Jt};break;case"RectAreaLight":e={color:new Jt,position:new N,halfWidth:new N,halfHeight:new N};break}return i[t.id]=e,e}}}function k_(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new kt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new kt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new kt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}let U_=0;function z_(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function F_(i){const t=new O_,e=k_(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new N);const s=new N,r=new de,a=new de;function o(c){let h=0,u=0,f=0;for(let T=0;T<9;T++)n.probe[T].set(0,0,0);let p=0,v=0,_=0,m=0,d=0,x=0,M=0,y=0,C=0,A=0,R=0;c.sort(z_);for(let T=0,E=c.length;T<E;T++){const I=c[T],$=I.color,V=I.intensity,Y=I.distance,nt=I.shadow&&I.shadow.map?I.shadow.map.texture:null;if(I.isAmbientLight)h+=$.r*V,u+=$.g*V,f+=$.b*V;else if(I.isLightProbe){for(let q=0;q<9;q++)n.probe[q].addScaledVector(I.sh.coefficients[q],V);R++}else if(I.isDirectionalLight){const q=t.get(I);if(q.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){const it=I.shadow,W=e.get(I);W.shadowIntensity=it.intensity,W.shadowBias=it.bias,W.shadowNormalBias=it.normalBias,W.shadowRadius=it.radius,W.shadowMapSize=it.mapSize,n.directionalShadow[p]=W,n.directionalShadowMap[p]=nt,n.directionalShadowMatrix[p]=I.shadow.matrix,x++}n.directional[p]=q,p++}else if(I.isSpotLight){const q=t.get(I);q.position.setFromMatrixPosition(I.matrixWorld),q.color.copy($).multiplyScalar(V),q.distance=Y,q.coneCos=Math.cos(I.angle),q.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),q.decay=I.decay,n.spot[_]=q;const it=I.shadow;if(I.map&&(n.spotLightMap[C]=I.map,C++,it.updateMatrices(I),I.castShadow&&A++),n.spotLightMatrix[_]=it.matrix,I.castShadow){const W=e.get(I);W.shadowIntensity=it.intensity,W.shadowBias=it.bias,W.shadowNormalBias=it.normalBias,W.shadowRadius=it.radius,W.shadowMapSize=it.mapSize,n.spotShadow[_]=W,n.spotShadowMap[_]=nt,y++}_++}else if(I.isRectAreaLight){const q=t.get(I);q.color.copy($).multiplyScalar(V),q.halfWidth.set(I.width*.5,0,0),q.halfHeight.set(0,I.height*.5,0),n.rectArea[m]=q,m++}else if(I.isPointLight){const q=t.get(I);if(q.color.copy(I.color).multiplyScalar(I.intensity),q.distance=I.distance,q.decay=I.decay,I.castShadow){const it=I.shadow,W=e.get(I);W.shadowIntensity=it.intensity,W.shadowBias=it.bias,W.shadowNormalBias=it.normalBias,W.shadowRadius=it.radius,W.shadowMapSize=it.mapSize,W.shadowCameraNear=it.camera.near,W.shadowCameraFar=it.camera.far,n.pointShadow[v]=W,n.pointShadowMap[v]=nt,n.pointShadowMatrix[v]=I.shadow.matrix,M++}n.point[v]=q,v++}else if(I.isHemisphereLight){const q=t.get(I);q.skyColor.copy(I.color).multiplyScalar(V),q.groundColor.copy(I.groundColor).multiplyScalar(V),n.hemi[d]=q,d++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ct.LTC_FLOAT_1,n.rectAreaLTC2=ct.LTC_FLOAT_2):(n.rectAreaLTC1=ct.LTC_HALF_1,n.rectAreaLTC2=ct.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=f;const P=n.hash;(P.directionalLength!==p||P.pointLength!==v||P.spotLength!==_||P.rectAreaLength!==m||P.hemiLength!==d||P.numDirectionalShadows!==x||P.numPointShadows!==M||P.numSpotShadows!==y||P.numSpotMaps!==C||P.numLightProbes!==R)&&(n.directional.length=p,n.spot.length=_,n.rectArea.length=m,n.point.length=v,n.hemi.length=d,n.directionalShadow.length=x,n.directionalShadowMap.length=x,n.pointShadow.length=M,n.pointShadowMap.length=M,n.spotShadow.length=y,n.spotShadowMap.length=y,n.directionalShadowMatrix.length=x,n.pointShadowMatrix.length=M,n.spotLightMatrix.length=y+C-A,n.spotLightMap.length=C,n.numSpotLightShadowsWithMaps=A,n.numLightProbes=R,P.directionalLength=p,P.pointLength=v,P.spotLength=_,P.rectAreaLength=m,P.hemiLength=d,P.numDirectionalShadows=x,P.numPointShadows=M,P.numSpotShadows=y,P.numSpotMaps=C,P.numLightProbes=R,n.version=U_++)}function l(c,h){let u=0,f=0,p=0,v=0,_=0;const m=h.matrixWorldInverse;for(let d=0,x=c.length;d<x;d++){const M=c[d];if(M.isDirectionalLight){const y=n.directional[u];y.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),u++}else if(M.isSpotLight){const y=n.spot[p];y.position.setFromMatrixPosition(M.matrixWorld),y.position.applyMatrix4(m),y.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),p++}else if(M.isRectAreaLight){const y=n.rectArea[v];y.position.setFromMatrixPosition(M.matrixWorld),y.position.applyMatrix4(m),a.identity(),r.copy(M.matrixWorld),r.premultiply(m),a.extractRotation(r),y.halfWidth.set(M.width*.5,0,0),y.halfHeight.set(0,M.height*.5,0),y.halfWidth.applyMatrix4(a),y.halfHeight.applyMatrix4(a),v++}else if(M.isPointLight){const y=n.point[f];y.position.setFromMatrixPosition(M.matrixWorld),y.position.applyMatrix4(m),f++}else if(M.isHemisphereLight){const y=n.hemi[_];y.direction.setFromMatrixPosition(M.matrixWorld),y.direction.transformDirection(m),_++}}}return{setup:o,setupView:l,state:n}}function Vu(i){const t=new F_(i),e=[],n=[];function s(h){c.camera=h,e.length=0,n.length=0}function r(h){e.push(h)}function a(h){n.push(h)}function o(){t.setup(e)}function l(h){t.setupView(e,h)}const c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function B_(i){let t=new WeakMap;function e(s,r=0){const a=t.get(s);let o;return a===void 0?(o=new Vu(i),t.set(s,[o])):r>=a.length?(o=new Vu(i),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}class H_ extends Cs{static get type(){return"MeshDepthMaterial"}constructor(t){super(),this.isMeshDepthMaterial=!0,this.depthPacking=Um,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class G_ extends Cs{static get type(){return"MeshDistanceMaterial"}constructor(t){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const V_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,W_=`uniform sampler2D shadow_pass;
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
}`;function X_(i,t,e){let n=new wd;const s=new kt,r=new kt,a=new Oe,o=new H_({depthPacking:zm}),l=new G_,c={},h=e.maxTextureSize,u={[bi]:ln,[ln]:bi,[mn]:mn},f=new ze({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new kt},radius:{value:4}},vertexShader:V_,fragmentShader:W_}),p=f.clone();p.defines.HORIZONTAL_PASS=1;const v=new Ie;v.setAttribute("position",new be(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new Te(v,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ad;let d=this.type;this.render=function(A,R,P){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||A.length===0)return;const T=i.getRenderTarget(),E=i.getActiveCubeFace(),I=i.getActiveMipmapLevel(),$=i.state;$.setBlending(xi),$.buffers.color.setClear(1,1,1,1),$.buffers.depth.setTest(!0),$.setScissorTest(!1);const V=d!==gi&&this.type===gi,Y=d===gi&&this.type!==gi;for(let nt=0,q=A.length;nt<q;nt++){const it=A[nt],W=it.shadow;if(W===void 0){console.warn("THREE.WebGLShadowMap:",it,"has no shadow.");continue}if(W.autoUpdate===!1&&W.needsUpdate===!1)continue;s.copy(W.mapSize);const st=W.getFrameExtents();if(s.multiply(st),r.copy(W.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/st.x),s.x=r.x*st.x,W.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/st.y),s.y=r.y*st.y,W.mapSize.y=r.y)),W.map===null||V===!0||Y===!0){const Ct=this.type!==gi?{minFilter:Je,magFilter:Je}:{};W.map!==null&&W.map.dispose(),W.map=new wn(s.x,s.y,Ct),W.map.texture.name=it.name+".shadowMap",W.camera.updateProjectionMatrix()}i.setRenderTarget(W.map),i.clear();const mt=W.getViewportCount();for(let Ct=0;Ct<mt;Ct++){const Wt=W.getViewport(Ct);a.set(r.x*Wt.x,r.y*Wt.y,r.x*Wt.z,r.y*Wt.w),$.viewport(a),W.updateMatrices(it,Ct),n=W.getFrustum(),y(R,P,W.camera,it,this.type)}W.isPointLightShadow!==!0&&this.type===gi&&x(W,P),W.needsUpdate=!1}d=this.type,m.needsUpdate=!1,i.setRenderTarget(T,E,I)};function x(A,R){const P=t.update(_);f.defines.VSM_SAMPLES!==A.blurSamples&&(f.defines.VSM_SAMPLES=A.blurSamples,p.defines.VSM_SAMPLES=A.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new wn(s.x,s.y)),f.uniforms.shadow_pass.value=A.map.texture,f.uniforms.resolution.value=A.mapSize,f.uniforms.radius.value=A.radius,i.setRenderTarget(A.mapPass),i.clear(),i.renderBufferDirect(R,null,P,f,_,null),p.uniforms.shadow_pass.value=A.mapPass.texture,p.uniforms.resolution.value=A.mapSize,p.uniforms.radius.value=A.radius,i.setRenderTarget(A.map),i.clear(),i.renderBufferDirect(R,null,P,p,_,null)}function M(A,R,P,T){let E=null;const I=P.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(I!==void 0)E=I;else if(E=P.isPointLight===!0?l:o,i.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0){const $=E.uuid,V=R.uuid;let Y=c[$];Y===void 0&&(Y={},c[$]=Y);let nt=Y[V];nt===void 0&&(nt=E.clone(),Y[V]=nt,R.addEventListener("dispose",C)),E=nt}if(E.visible=R.visible,E.wireframe=R.wireframe,T===gi?E.side=R.shadowSide!==null?R.shadowSide:R.side:E.side=R.shadowSide!==null?R.shadowSide:u[R.side],E.alphaMap=R.alphaMap,E.alphaTest=R.alphaTest,E.map=R.map,E.clipShadows=R.clipShadows,E.clippingPlanes=R.clippingPlanes,E.clipIntersection=R.clipIntersection,E.displacementMap=R.displacementMap,E.displacementScale=R.displacementScale,E.displacementBias=R.displacementBias,E.wireframeLinewidth=R.wireframeLinewidth,E.linewidth=R.linewidth,P.isPointLight===!0&&E.isMeshDistanceMaterial===!0){const $=i.properties.get(E);$.light=P}return E}function y(A,R,P,T,E){if(A.visible===!1)return;if(A.layers.test(R.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&E===gi)&&(!A.frustumCulled||n.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(P.matrixWorldInverse,A.matrixWorld);const V=t.update(A),Y=A.material;if(Array.isArray(Y)){const nt=V.groups;for(let q=0,it=nt.length;q<it;q++){const W=nt[q],st=Y[W.materialIndex];if(st&&st.visible){const mt=M(A,st,T,E);A.onBeforeShadow(i,A,R,P,V,mt,W),i.renderBufferDirect(P,null,V,mt,A,W),A.onAfterShadow(i,A,R,P,V,mt,W)}}}else if(Y.visible){const nt=M(A,Y,T,E);A.onBeforeShadow(i,A,R,P,V,nt,null),i.renderBufferDirect(P,null,V,nt,A,null),A.onAfterShadow(i,A,R,P,V,nt,null)}}const $=A.children;for(let V=0,Y=$.length;V<Y;V++)y($[V],R,P,T,E)}function C(A){A.target.removeEventListener("dispose",C);for(const P in c){const T=c[P],E=A.target.uuid;E in T&&(T[E].dispose(),delete T[E])}}}const $_={[fc]:dc,[pc]:vc,[mc]:_c,[ur]:gc,[dc]:fc,[vc]:pc,[_c]:mc,[gc]:ur};function q_(i,t){function e(){let O=!1;const ut=new Oe;let X=null;const Q=new Oe(0,0,0,0);return{setMask:function(gt){X!==gt&&!O&&(i.colorMask(gt,gt,gt,gt),X=gt)},setLocked:function(gt){O=gt},setClear:function(gt,dt,Xt,Le,$e){$e===!0&&(gt*=Le,dt*=Le,Xt*=Le),ut.set(gt,dt,Xt,Le),Q.equals(ut)===!1&&(i.clearColor(gt,dt,Xt,Le),Q.copy(ut))},reset:function(){O=!1,X=null,Q.set(-1,0,0,0)}}}function n(){let O=!1,ut=!1,X=null,Q=null,gt=null;return{setReversed:function(dt){if(ut!==dt){const Xt=t.get("EXT_clip_control");ut?Xt.clipControlEXT(Xt.LOWER_LEFT_EXT,Xt.ZERO_TO_ONE_EXT):Xt.clipControlEXT(Xt.LOWER_LEFT_EXT,Xt.NEGATIVE_ONE_TO_ONE_EXT);const Le=gt;gt=null,this.setClear(Le)}ut=dt},getReversed:function(){return ut},setTest:function(dt){dt?lt(i.DEPTH_TEST):It(i.DEPTH_TEST)},setMask:function(dt){X!==dt&&!O&&(i.depthMask(dt),X=dt)},setFunc:function(dt){if(ut&&(dt=$_[dt]),Q!==dt){switch(dt){case fc:i.depthFunc(i.NEVER);break;case dc:i.depthFunc(i.ALWAYS);break;case pc:i.depthFunc(i.LESS);break;case ur:i.depthFunc(i.LEQUAL);break;case mc:i.depthFunc(i.EQUAL);break;case gc:i.depthFunc(i.GEQUAL);break;case vc:i.depthFunc(i.GREATER);break;case _c:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}Q=dt}},setLocked:function(dt){O=dt},setClear:function(dt){gt!==dt&&(ut&&(dt=1-dt),i.clearDepth(dt),gt=dt)},reset:function(){O=!1,X=null,Q=null,gt=null,ut=!1}}}function s(){let O=!1,ut=null,X=null,Q=null,gt=null,dt=null,Xt=null,Le=null,$e=null;return{setTest:function(fe){O||(fe?lt(i.STENCIL_TEST):It(i.STENCIL_TEST))},setMask:function(fe){ut!==fe&&!O&&(i.stencilMask(fe),ut=fe)},setFunc:function(fe,Fn,oi){(X!==fe||Q!==Fn||gt!==oi)&&(i.stencilFunc(fe,Fn,oi),X=fe,Q=Fn,gt=oi)},setOp:function(fe,Fn,oi){(dt!==fe||Xt!==Fn||Le!==oi)&&(i.stencilOp(fe,Fn,oi),dt=fe,Xt=Fn,Le=oi)},setLocked:function(fe){O=fe},setClear:function(fe){$e!==fe&&(i.clearStencil(fe),$e=fe)},reset:function(){O=!1,ut=null,X=null,Q=null,gt=null,dt=null,Xt=null,Le=null,$e=null}}}const r=new e,a=new n,o=new s,l=new WeakMap,c=new WeakMap;let h={},u={},f=new WeakMap,p=[],v=null,_=!1,m=null,d=null,x=null,M=null,y=null,C=null,A=null,R=new Jt(0,0,0),P=0,T=!1,E=null,I=null,$=null,V=null,Y=null;const nt=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let q=!1,it=0;const W=i.getParameter(i.VERSION);W.indexOf("WebGL")!==-1?(it=parseFloat(/^WebGL (\d)/.exec(W)[1]),q=it>=1):W.indexOf("OpenGL ES")!==-1&&(it=parseFloat(/^OpenGL ES (\d)/.exec(W)[1]),q=it>=2);let st=null,mt={};const Ct=i.getParameter(i.SCISSOR_BOX),Wt=i.getParameter(i.VIEWPORT),ce=new Oe().fromArray(Ct),j=new Oe().fromArray(Wt);function rt(O,ut,X,Q){const gt=new Uint8Array(4),dt=i.createTexture();i.bindTexture(O,dt),i.texParameteri(O,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(O,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Xt=0;Xt<X;Xt++)O===i.TEXTURE_3D||O===i.TEXTURE_2D_ARRAY?i.texImage3D(ut,0,i.RGBA,1,1,Q,0,i.RGBA,i.UNSIGNED_BYTE,gt):i.texImage2D(ut+Xt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,gt);return dt}const Tt={};Tt[i.TEXTURE_2D]=rt(i.TEXTURE_2D,i.TEXTURE_2D,1),Tt[i.TEXTURE_CUBE_MAP]=rt(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Tt[i.TEXTURE_2D_ARRAY]=rt(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Tt[i.TEXTURE_3D]=rt(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),lt(i.DEPTH_TEST),a.setFunc(ur),jt(!1),ee(Yh),lt(i.CULL_FACE),U(xi);function lt(O){h[O]!==!0&&(i.enable(O),h[O]=!0)}function It(O){h[O]!==!1&&(i.disable(O),h[O]=!1)}function zt(O,ut){return u[O]!==ut?(i.bindFramebuffer(O,ut),u[O]=ut,O===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=ut),O===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=ut),!0):!1}function Gt(O,ut){let X=p,Q=!1;if(O){X=f.get(ut),X===void 0&&(X=[],f.set(ut,X));const gt=O.textures;if(X.length!==gt.length||X[0]!==i.COLOR_ATTACHMENT0){for(let dt=0,Xt=gt.length;dt<Xt;dt++)X[dt]=i.COLOR_ATTACHMENT0+dt;X.length=gt.length,Q=!0}}else X[0]!==i.BACK&&(X[0]=i.BACK,Q=!0);Q&&i.drawBuffers(X)}function pe(O){return v!==O?(i.useProgram(O),v=O,!0):!1}const Zt={[_s]:i.FUNC_ADD,[hm]:i.FUNC_SUBTRACT,[um]:i.FUNC_REVERSE_SUBTRACT};Zt[fm]=i.MIN,Zt[dm]=i.MAX;const Ae={[pm]:i.ZERO,[mm]:i.ONE,[gm]:i.SRC_COLOR,[hc]:i.SRC_ALPHA,[Sm]:i.SRC_ALPHA_SATURATE,[Mm]:i.DST_COLOR,[_m]:i.DST_ALPHA,[vm]:i.ONE_MINUS_SRC_COLOR,[uc]:i.ONE_MINUS_SRC_ALPHA,[ym]:i.ONE_MINUS_DST_COLOR,[xm]:i.ONE_MINUS_DST_ALPHA,[Em]:i.CONSTANT_COLOR,[bm]:i.ONE_MINUS_CONSTANT_COLOR,[Tm]:i.CONSTANT_ALPHA,[Am]:i.ONE_MINUS_CONSTANT_ALPHA};function U(O,ut,X,Q,gt,dt,Xt,Le,$e,fe){if(O===xi){_===!0&&(It(i.BLEND),_=!1);return}if(_===!1&&(lt(i.BLEND),_=!0),O!==cm){if(O!==m||fe!==T){if((d!==_s||y!==_s)&&(i.blendEquation(i.FUNC_ADD),d=_s,y=_s),fe)switch(O){case or:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case cc:i.blendFunc(i.ONE,i.ONE);break;case jh:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Zh:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",O);break}else switch(O){case or:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case cc:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case jh:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Zh:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",O);break}x=null,M=null,C=null,A=null,R.set(0,0,0),P=0,m=O,T=fe}return}gt=gt||ut,dt=dt||X,Xt=Xt||Q,(ut!==d||gt!==y)&&(i.blendEquationSeparate(Zt[ut],Zt[gt]),d=ut,y=gt),(X!==x||Q!==M||dt!==C||Xt!==A)&&(i.blendFuncSeparate(Ae[X],Ae[Q],Ae[dt],Ae[Xt]),x=X,M=Q,C=dt,A=Xt),(Le.equals(R)===!1||$e!==P)&&(i.blendColor(Le.r,Le.g,Le.b,$e),R.copy(Le),P=$e),m=O,T=!1}function tn(O,ut){O.side===mn?It(i.CULL_FACE):lt(i.CULL_FACE);let X=O.side===ln;ut&&(X=!X),jt(X),O.blending===or&&O.transparent===!1?U(xi):U(O.blending,O.blendEquation,O.blendSrc,O.blendDst,O.blendEquationAlpha,O.blendSrcAlpha,O.blendDstAlpha,O.blendColor,O.blendAlpha,O.premultipliedAlpha),a.setFunc(O.depthFunc),a.setTest(O.depthTest),a.setMask(O.depthWrite),r.setMask(O.colorWrite);const Q=O.stencilWrite;o.setTest(Q),Q&&(o.setMask(O.stencilWriteMask),o.setFunc(O.stencilFunc,O.stencilRef,O.stencilFuncMask),o.setOp(O.stencilFail,O.stencilZFail,O.stencilZPass)),ye(O.polygonOffset,O.polygonOffsetFactor,O.polygonOffsetUnits),O.alphaToCoverage===!0?lt(i.SAMPLE_ALPHA_TO_COVERAGE):It(i.SAMPLE_ALPHA_TO_COVERAGE)}function jt(O){E!==O&&(O?i.frontFace(i.CW):i.frontFace(i.CCW),E=O)}function ee(O){O!==am?(lt(i.CULL_FACE),O!==I&&(O===Yh?i.cullFace(i.BACK):O===om?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):It(i.CULL_FACE),I=O}function Ot(O){O!==$&&(q&&i.lineWidth(O),$=O)}function ye(O,ut,X){O?(lt(i.POLYGON_OFFSET_FILL),(V!==ut||Y!==X)&&(i.polygonOffset(ut,X),V=ut,Y=X)):It(i.POLYGON_OFFSET_FILL)}function Nt(O){O?lt(i.SCISSOR_TEST):It(i.SCISSOR_TEST)}function w(O){O===void 0&&(O=i.TEXTURE0+nt-1),st!==O&&(i.activeTexture(O),st=O)}function S(O,ut,X){X===void 0&&(st===null?X=i.TEXTURE0+nt-1:X=st);let Q=mt[X];Q===void 0&&(Q={type:void 0,texture:void 0},mt[X]=Q),(Q.type!==O||Q.texture!==ut)&&(st!==X&&(i.activeTexture(X),st=X),i.bindTexture(O,ut||Tt[O]),Q.type=O,Q.texture=ut)}function B(){const O=mt[st];O!==void 0&&O.type!==void 0&&(i.bindTexture(O.type,null),O.type=void 0,O.texture=void 0)}function J(){try{i.compressedTexImage2D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function et(){try{i.compressedTexImage3D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function Z(){try{i.texSubImage2D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function Lt(){try{i.texSubImage3D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function ft(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function St(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function re(){try{i.texStorage2D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function at(){try{i.texStorage3D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function Et(){try{i.texImage2D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function Ut(){try{i.texImage3D.apply(i,arguments)}catch(O){console.error("THREE.WebGLState:",O)}}function Ft(O){ce.equals(O)===!1&&(i.scissor(O.x,O.y,O.z,O.w),ce.copy(O))}function bt(O){j.equals(O)===!1&&(i.viewport(O.x,O.y,O.z,O.w),j.copy(O))}function ne(O,ut){let X=c.get(ut);X===void 0&&(X=new WeakMap,c.set(ut,X));let Q=X.get(O);Q===void 0&&(Q=i.getUniformBlockIndex(ut,O.name),X.set(O,Q))}function Kt(O,ut){const Q=c.get(ut).get(O);l.get(ut)!==Q&&(i.uniformBlockBinding(ut,Q,O.__bindingPointIndex),l.set(ut,Q))}function xe(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),h={},st=null,mt={},u={},f=new WeakMap,p=[],v=null,_=!1,m=null,d=null,x=null,M=null,y=null,C=null,A=null,R=new Jt(0,0,0),P=0,T=!1,E=null,I=null,$=null,V=null,Y=null,ce.set(0,0,i.canvas.width,i.canvas.height),j.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:lt,disable:It,bindFramebuffer:zt,drawBuffers:Gt,useProgram:pe,setBlending:U,setMaterial:tn,setFlipSided:jt,setCullFace:ee,setLineWidth:Ot,setPolygonOffset:ye,setScissorTest:Nt,activeTexture:w,bindTexture:S,unbindTexture:B,compressedTexImage2D:J,compressedTexImage3D:et,texImage2D:Et,texImage3D:Ut,updateUBOMapping:ne,uniformBlockBinding:Kt,texStorage2D:re,texStorage3D:at,texSubImage2D:Z,texSubImage3D:Lt,compressedTexSubImage2D:ft,compressedTexSubImage3D:St,scissor:Ft,viewport:bt,reset:xe}}function Wu(i,t,e,n){const s=K_(n);switch(e){case fd:return i*t;case pd:return i*t;case md:return i*t*2;case gh:return i*t/s.components*s.byteLength;case vh:return i*t/s.components*s.byteLength;case gd:return i*t*2/s.components*s.byteLength;case _h:return i*t*2/s.components*s.byteLength;case dd:return i*t*3/s.components*s.byteLength;case Nn:return i*t*4/s.components*s.byteLength;case xh:return i*t*4/s.components*s.byteLength;case Mo:case yo:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case So:case Eo:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Ec:case Tc:return Math.max(i,16)*Math.max(t,8)/4;case Sc:case bc:return Math.max(i,8)*Math.max(t,8)/2;case Ac:case wc:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Rc:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Cc:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Lc:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case Dc:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case Pc:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case Ic:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case Nc:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case Oc:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case kc:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case Uc:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case zc:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case Fc:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case Bc:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case Hc:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case Gc:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case bo:case Vc:case Wc:return Math.ceil(i/4)*Math.ceil(t/4)*16;case vd:case Xc:return Math.ceil(i/4)*Math.ceil(t/4)*8;case $c:case qc:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function K_(i){switch(i){case Ti:case cd:return{byteLength:1,components:1};case fa:case hd:case ai:return{byteLength:2,components:1};case ph:case mh:return{byteLength:2,components:4};case ts:case dh:case ri:return{byteLength:4,components:1};case ud:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function Y_(i,t,e,n,s,r,a){const o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new kt,h=new WeakMap;let u;const f=new WeakMap;let p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(w,S){return p?new OffscreenCanvas(w,S):da("canvas")}function _(w,S,B){let J=1;const et=Nt(w);if((et.width>B||et.height>B)&&(J=B/Math.max(et.width,et.height)),J<1)if(typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&w instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&w instanceof ImageBitmap||typeof VideoFrame<"u"&&w instanceof VideoFrame){const Z=Math.floor(J*et.width),Lt=Math.floor(J*et.height);u===void 0&&(u=v(Z,Lt));const ft=S?v(Z,Lt):u;return ft.width=Z,ft.height=Lt,ft.getContext("2d").drawImage(w,0,0,Z,Lt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+et.width+"x"+et.height+") to ("+Z+"x"+Lt+")."),ft}else return"data"in w&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+et.width+"x"+et.height+")."),w;return w}function m(w){return w.generateMipmaps}function d(w){i.generateMipmap(w)}function x(w){return w.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:w.isWebGL3DRenderTarget?i.TEXTURE_3D:w.isWebGLArrayRenderTarget||w.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function M(w,S,B,J,et=!1){if(w!==null){if(i[w]!==void 0)return i[w];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+w+"'")}let Z=S;if(S===i.RED&&(B===i.FLOAT&&(Z=i.R32F),B===i.HALF_FLOAT&&(Z=i.R16F),B===i.UNSIGNED_BYTE&&(Z=i.R8)),S===i.RED_INTEGER&&(B===i.UNSIGNED_BYTE&&(Z=i.R8UI),B===i.UNSIGNED_SHORT&&(Z=i.R16UI),B===i.UNSIGNED_INT&&(Z=i.R32UI),B===i.BYTE&&(Z=i.R8I),B===i.SHORT&&(Z=i.R16I),B===i.INT&&(Z=i.R32I)),S===i.RG&&(B===i.FLOAT&&(Z=i.RG32F),B===i.HALF_FLOAT&&(Z=i.RG16F),B===i.UNSIGNED_BYTE&&(Z=i.RG8)),S===i.RG_INTEGER&&(B===i.UNSIGNED_BYTE&&(Z=i.RG8UI),B===i.UNSIGNED_SHORT&&(Z=i.RG16UI),B===i.UNSIGNED_INT&&(Z=i.RG32UI),B===i.BYTE&&(Z=i.RG8I),B===i.SHORT&&(Z=i.RG16I),B===i.INT&&(Z=i.RG32I)),S===i.RGB_INTEGER&&(B===i.UNSIGNED_BYTE&&(Z=i.RGB8UI),B===i.UNSIGNED_SHORT&&(Z=i.RGB16UI),B===i.UNSIGNED_INT&&(Z=i.RGB32UI),B===i.BYTE&&(Z=i.RGB8I),B===i.SHORT&&(Z=i.RGB16I),B===i.INT&&(Z=i.RGB32I)),S===i.RGBA_INTEGER&&(B===i.UNSIGNED_BYTE&&(Z=i.RGBA8UI),B===i.UNSIGNED_SHORT&&(Z=i.RGBA16UI),B===i.UNSIGNED_INT&&(Z=i.RGBA32UI),B===i.BYTE&&(Z=i.RGBA8I),B===i.SHORT&&(Z=i.RGBA16I),B===i.INT&&(Z=i.RGBA32I)),S===i.RGB&&B===i.UNSIGNED_INT_5_9_9_9_REV&&(Z=i.RGB9_E5),S===i.RGBA){const Lt=et?Zo:oe.getTransfer(J);B===i.FLOAT&&(Z=i.RGBA32F),B===i.HALF_FLOAT&&(Z=i.RGBA16F),B===i.UNSIGNED_BYTE&&(Z=Lt===me?i.SRGB8_ALPHA8:i.RGBA8),B===i.UNSIGNED_SHORT_4_4_4_4&&(Z=i.RGBA4),B===i.UNSIGNED_SHORT_5_5_5_1&&(Z=i.RGB5_A1)}return(Z===i.R16F||Z===i.R32F||Z===i.RG16F||Z===i.RG32F||Z===i.RGBA16F||Z===i.RGBA32F)&&t.get("EXT_color_buffer_float"),Z}function y(w,S){let B;return w?S===null||S===ts||S===pr?B=i.DEPTH24_STENCIL8:S===ri?B=i.DEPTH32F_STENCIL8:S===fa&&(B=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===ts||S===pr?B=i.DEPTH_COMPONENT24:S===ri?B=i.DEPTH_COMPONENT32F:S===fa&&(B=i.DEPTH_COMPONENT16),B}function C(w,S){return m(w)===!0||w.isFramebufferTexture&&w.minFilter!==Je&&w.minFilter!==on?Math.log2(Math.max(S.width,S.height))+1:w.mipmaps!==void 0&&w.mipmaps.length>0?w.mipmaps.length:w.isCompressedTexture&&Array.isArray(w.image)?S.mipmaps.length:1}function A(w){const S=w.target;S.removeEventListener("dispose",A),P(S),S.isVideoTexture&&h.delete(S)}function R(w){const S=w.target;S.removeEventListener("dispose",R),E(S)}function P(w){const S=n.get(w);if(S.__webglInit===void 0)return;const B=w.source,J=f.get(B);if(J){const et=J[S.__cacheKey];et.usedTimes--,et.usedTimes===0&&T(w),Object.keys(J).length===0&&f.delete(B)}n.remove(w)}function T(w){const S=n.get(w);i.deleteTexture(S.__webglTexture);const B=w.source,J=f.get(B);delete J[S.__cacheKey],a.memory.textures--}function E(w){const S=n.get(w);if(w.depthTexture&&(w.depthTexture.dispose(),n.remove(w.depthTexture)),w.isWebGLCubeRenderTarget)for(let J=0;J<6;J++){if(Array.isArray(S.__webglFramebuffer[J]))for(let et=0;et<S.__webglFramebuffer[J].length;et++)i.deleteFramebuffer(S.__webglFramebuffer[J][et]);else i.deleteFramebuffer(S.__webglFramebuffer[J]);S.__webglDepthbuffer&&i.deleteRenderbuffer(S.__webglDepthbuffer[J])}else{if(Array.isArray(S.__webglFramebuffer))for(let J=0;J<S.__webglFramebuffer.length;J++)i.deleteFramebuffer(S.__webglFramebuffer[J]);else i.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&i.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&i.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let J=0;J<S.__webglColorRenderbuffer.length;J++)S.__webglColorRenderbuffer[J]&&i.deleteRenderbuffer(S.__webglColorRenderbuffer[J]);S.__webglDepthRenderbuffer&&i.deleteRenderbuffer(S.__webglDepthRenderbuffer)}const B=w.textures;for(let J=0,et=B.length;J<et;J++){const Z=n.get(B[J]);Z.__webglTexture&&(i.deleteTexture(Z.__webglTexture),a.memory.textures--),n.remove(B[J])}n.remove(w)}let I=0;function $(){I=0}function V(){const w=I;return w>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+w+" texture units while this GPU supports only "+s.maxTextures),I+=1,w}function Y(w){const S=[];return S.push(w.wrapS),S.push(w.wrapT),S.push(w.wrapR||0),S.push(w.magFilter),S.push(w.minFilter),S.push(w.anisotropy),S.push(w.internalFormat),S.push(w.format),S.push(w.type),S.push(w.generateMipmaps),S.push(w.premultiplyAlpha),S.push(w.flipY),S.push(w.unpackAlignment),S.push(w.colorSpace),S.join()}function nt(w,S){const B=n.get(w);if(w.isVideoTexture&&Ot(w),w.isRenderTargetTexture===!1&&w.version>0&&B.__version!==w.version){const J=w.image;if(J===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(J.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{j(B,w,S);return}}e.bindTexture(i.TEXTURE_2D,B.__webglTexture,i.TEXTURE0+S)}function q(w,S){const B=n.get(w);if(w.version>0&&B.__version!==w.version){j(B,w,S);return}e.bindTexture(i.TEXTURE_2D_ARRAY,B.__webglTexture,i.TEXTURE0+S)}function it(w,S){const B=n.get(w);if(w.version>0&&B.__version!==w.version){j(B,w,S);return}e.bindTexture(i.TEXTURE_3D,B.__webglTexture,i.TEXTURE0+S)}function W(w,S){const B=n.get(w);if(w.version>0&&B.__version!==w.version){rt(B,w,S);return}e.bindTexture(i.TEXTURE_CUBE_MAP,B.__webglTexture,i.TEXTURE0+S)}const st={[No]:i.REPEAT,[Ms]:i.CLAMP_TO_EDGE,[yc]:i.MIRRORED_REPEAT},mt={[Je]:i.NEAREST,[km]:i.NEAREST_MIPMAP_NEAREST,[Oa]:i.NEAREST_MIPMAP_LINEAR,[on]:i.LINEAR,[pl]:i.LINEAR_MIPMAP_NEAREST,[si]:i.LINEAR_MIPMAP_LINEAR},Ct={[Hm]:i.NEVER,[qm]:i.ALWAYS,[Gm]:i.LESS,[_d]:i.LEQUAL,[Vm]:i.EQUAL,[$m]:i.GEQUAL,[Wm]:i.GREATER,[Xm]:i.NOTEQUAL};function Wt(w,S){if(S.type===ri&&t.has("OES_texture_float_linear")===!1&&(S.magFilter===on||S.magFilter===pl||S.magFilter===Oa||S.magFilter===si||S.minFilter===on||S.minFilter===pl||S.minFilter===Oa||S.minFilter===si)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(w,i.TEXTURE_WRAP_S,st[S.wrapS]),i.texParameteri(w,i.TEXTURE_WRAP_T,st[S.wrapT]),(w===i.TEXTURE_3D||w===i.TEXTURE_2D_ARRAY)&&i.texParameteri(w,i.TEXTURE_WRAP_R,st[S.wrapR]),i.texParameteri(w,i.TEXTURE_MAG_FILTER,mt[S.magFilter]),i.texParameteri(w,i.TEXTURE_MIN_FILTER,mt[S.minFilter]),S.compareFunction&&(i.texParameteri(w,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(w,i.TEXTURE_COMPARE_FUNC,Ct[S.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===Je||S.minFilter!==Oa&&S.minFilter!==si||S.type===ri&&t.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||n.get(S).__currentAnisotropy){const B=t.get("EXT_texture_filter_anisotropic");i.texParameterf(w,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,s.getMaxAnisotropy())),n.get(S).__currentAnisotropy=S.anisotropy}}}function ce(w,S){let B=!1;w.__webglInit===void 0&&(w.__webglInit=!0,S.addEventListener("dispose",A));const J=S.source;let et=f.get(J);et===void 0&&(et={},f.set(J,et));const Z=Y(S);if(Z!==w.__cacheKey){et[Z]===void 0&&(et[Z]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,B=!0),et[Z].usedTimes++;const Lt=et[w.__cacheKey];Lt!==void 0&&(et[w.__cacheKey].usedTimes--,Lt.usedTimes===0&&T(S)),w.__cacheKey=Z,w.__webglTexture=et[Z].texture}return B}function j(w,S,B){let J=i.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(J=i.TEXTURE_2D_ARRAY),S.isData3DTexture&&(J=i.TEXTURE_3D);const et=ce(w,S),Z=S.source;e.bindTexture(J,w.__webglTexture,i.TEXTURE0+B);const Lt=n.get(Z);if(Z.version!==Lt.__version||et===!0){e.activeTexture(i.TEXTURE0+B);const ft=oe.getPrimaries(oe.workingColorSpace),St=S.colorSpace===Vi?null:oe.getPrimaries(S.colorSpace),re=S.colorSpace===Vi||ft===St?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,S.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,S.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,re);let at=_(S.image,!1,s.maxTextureSize);at=ye(S,at);const Et=r.convert(S.format,S.colorSpace),Ut=r.convert(S.type);let Ft=M(S.internalFormat,Et,Ut,S.colorSpace,S.isVideoTexture);Wt(J,S);let bt;const ne=S.mipmaps,Kt=S.isVideoTexture!==!0,xe=Lt.__version===void 0||et===!0,O=Z.dataReady,ut=C(S,at);if(S.isDepthTexture)Ft=y(S.format===mr,S.type),xe&&(Kt?e.texStorage2D(i.TEXTURE_2D,1,Ft,at.width,at.height):e.texImage2D(i.TEXTURE_2D,0,Ft,at.width,at.height,0,Et,Ut,null));else if(S.isDataTexture)if(ne.length>0){Kt&&xe&&e.texStorage2D(i.TEXTURE_2D,ut,Ft,ne[0].width,ne[0].height);for(let X=0,Q=ne.length;X<Q;X++)bt=ne[X],Kt?O&&e.texSubImage2D(i.TEXTURE_2D,X,0,0,bt.width,bt.height,Et,Ut,bt.data):e.texImage2D(i.TEXTURE_2D,X,Ft,bt.width,bt.height,0,Et,Ut,bt.data);S.generateMipmaps=!1}else Kt?(xe&&e.texStorage2D(i.TEXTURE_2D,ut,Ft,at.width,at.height),O&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,at.width,at.height,Et,Ut,at.data)):e.texImage2D(i.TEXTURE_2D,0,Ft,at.width,at.height,0,Et,Ut,at.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){Kt&&xe&&e.texStorage3D(i.TEXTURE_2D_ARRAY,ut,Ft,ne[0].width,ne[0].height,at.depth);for(let X=0,Q=ne.length;X<Q;X++)if(bt=ne[X],S.format!==Nn)if(Et!==null)if(Kt){if(O)if(S.layerUpdates.size>0){const gt=Wu(bt.width,bt.height,S.format,S.type);for(const dt of S.layerUpdates){const Xt=bt.data.subarray(dt*gt/bt.data.BYTES_PER_ELEMENT,(dt+1)*gt/bt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,X,0,0,dt,bt.width,bt.height,1,Et,Xt)}S.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,X,0,0,0,bt.width,bt.height,at.depth,Et,bt.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,X,Ft,bt.width,bt.height,at.depth,0,bt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Kt?O&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,X,0,0,0,bt.width,bt.height,at.depth,Et,Ut,bt.data):e.texImage3D(i.TEXTURE_2D_ARRAY,X,Ft,bt.width,bt.height,at.depth,0,Et,Ut,bt.data)}else{Kt&&xe&&e.texStorage2D(i.TEXTURE_2D,ut,Ft,ne[0].width,ne[0].height);for(let X=0,Q=ne.length;X<Q;X++)bt=ne[X],S.format!==Nn?Et!==null?Kt?O&&e.compressedTexSubImage2D(i.TEXTURE_2D,X,0,0,bt.width,bt.height,Et,bt.data):e.compressedTexImage2D(i.TEXTURE_2D,X,Ft,bt.width,bt.height,0,bt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Kt?O&&e.texSubImage2D(i.TEXTURE_2D,X,0,0,bt.width,bt.height,Et,Ut,bt.data):e.texImage2D(i.TEXTURE_2D,X,Ft,bt.width,bt.height,0,Et,Ut,bt.data)}else if(S.isDataArrayTexture)if(Kt){if(xe&&e.texStorage3D(i.TEXTURE_2D_ARRAY,ut,Ft,at.width,at.height,at.depth),O)if(S.layerUpdates.size>0){const X=Wu(at.width,at.height,S.format,S.type);for(const Q of S.layerUpdates){const gt=at.data.subarray(Q*X/at.data.BYTES_PER_ELEMENT,(Q+1)*X/at.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Q,at.width,at.height,1,Et,Ut,gt)}S.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,at.width,at.height,at.depth,Et,Ut,at.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,Ft,at.width,at.height,at.depth,0,Et,Ut,at.data);else if(S.isData3DTexture)Kt?(xe&&e.texStorage3D(i.TEXTURE_3D,ut,Ft,at.width,at.height,at.depth),O&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,at.width,at.height,at.depth,Et,Ut,at.data)):e.texImage3D(i.TEXTURE_3D,0,Ft,at.width,at.height,at.depth,0,Et,Ut,at.data);else if(S.isFramebufferTexture){if(xe)if(Kt)e.texStorage2D(i.TEXTURE_2D,ut,Ft,at.width,at.height);else{let X=at.width,Q=at.height;for(let gt=0;gt<ut;gt++)e.texImage2D(i.TEXTURE_2D,gt,Ft,X,Q,0,Et,Ut,null),X>>=1,Q>>=1}}else if(ne.length>0){if(Kt&&xe){const X=Nt(ne[0]);e.texStorage2D(i.TEXTURE_2D,ut,Ft,X.width,X.height)}for(let X=0,Q=ne.length;X<Q;X++)bt=ne[X],Kt?O&&e.texSubImage2D(i.TEXTURE_2D,X,0,0,Et,Ut,bt):e.texImage2D(i.TEXTURE_2D,X,Ft,Et,Ut,bt);S.generateMipmaps=!1}else if(Kt){if(xe){const X=Nt(at);e.texStorage2D(i.TEXTURE_2D,ut,Ft,X.width,X.height)}O&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,Et,Ut,at)}else e.texImage2D(i.TEXTURE_2D,0,Ft,Et,Ut,at);m(S)&&d(J),Lt.__version=Z.version,S.onUpdate&&S.onUpdate(S)}w.__version=S.version}function rt(w,S,B){if(S.image.length!==6)return;const J=ce(w,S),et=S.source;e.bindTexture(i.TEXTURE_CUBE_MAP,w.__webglTexture,i.TEXTURE0+B);const Z=n.get(et);if(et.version!==Z.__version||J===!0){e.activeTexture(i.TEXTURE0+B);const Lt=oe.getPrimaries(oe.workingColorSpace),ft=S.colorSpace===Vi?null:oe.getPrimaries(S.colorSpace),St=S.colorSpace===Vi||Lt===ft?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,S.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,S.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,St);const re=S.isCompressedTexture||S.image[0].isCompressedTexture,at=S.image[0]&&S.image[0].isDataTexture,Et=[];for(let Q=0;Q<6;Q++)!re&&!at?Et[Q]=_(S.image[Q],!0,s.maxCubemapSize):Et[Q]=at?S.image[Q].image:S.image[Q],Et[Q]=ye(S,Et[Q]);const Ut=Et[0],Ft=r.convert(S.format,S.colorSpace),bt=r.convert(S.type),ne=M(S.internalFormat,Ft,bt,S.colorSpace),Kt=S.isVideoTexture!==!0,xe=Z.__version===void 0||J===!0,O=et.dataReady;let ut=C(S,Ut);Wt(i.TEXTURE_CUBE_MAP,S);let X;if(re){Kt&&xe&&e.texStorage2D(i.TEXTURE_CUBE_MAP,ut,ne,Ut.width,Ut.height);for(let Q=0;Q<6;Q++){X=Et[Q].mipmaps;for(let gt=0;gt<X.length;gt++){const dt=X[gt];S.format!==Nn?Ft!==null?Kt?O&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,gt,0,0,dt.width,dt.height,Ft,dt.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,gt,ne,dt.width,dt.height,0,dt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Kt?O&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,gt,0,0,dt.width,dt.height,Ft,bt,dt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,gt,ne,dt.width,dt.height,0,Ft,bt,dt.data)}}}else{if(X=S.mipmaps,Kt&&xe){X.length>0&&ut++;const Q=Nt(Et[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,ut,ne,Q.width,Q.height)}for(let Q=0;Q<6;Q++)if(at){Kt?O&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,Et[Q].width,Et[Q].height,Ft,bt,Et[Q].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,ne,Et[Q].width,Et[Q].height,0,Ft,bt,Et[Q].data);for(let gt=0;gt<X.length;gt++){const Xt=X[gt].image[Q].image;Kt?O&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,gt+1,0,0,Xt.width,Xt.height,Ft,bt,Xt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,gt+1,ne,Xt.width,Xt.height,0,Ft,bt,Xt.data)}}else{Kt?O&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,Ft,bt,Et[Q]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,ne,Ft,bt,Et[Q]);for(let gt=0;gt<X.length;gt++){const dt=X[gt];Kt?O&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,gt+1,0,0,Ft,bt,dt.image[Q]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,gt+1,ne,Ft,bt,dt.image[Q])}}}m(S)&&d(i.TEXTURE_CUBE_MAP),Z.__version=et.version,S.onUpdate&&S.onUpdate(S)}w.__version=S.version}function Tt(w,S,B,J,et,Z){const Lt=r.convert(B.format,B.colorSpace),ft=r.convert(B.type),St=M(B.internalFormat,Lt,ft,B.colorSpace),re=n.get(S),at=n.get(B);if(at.__renderTarget=S,!re.__hasExternalTextures){const Et=Math.max(1,S.width>>Z),Ut=Math.max(1,S.height>>Z);et===i.TEXTURE_3D||et===i.TEXTURE_2D_ARRAY?e.texImage3D(et,Z,St,Et,Ut,S.depth,0,Lt,ft,null):e.texImage2D(et,Z,St,Et,Ut,0,Lt,ft,null)}e.bindFramebuffer(i.FRAMEBUFFER,w),ee(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,J,et,at.__webglTexture,0,jt(S)):(et===i.TEXTURE_2D||et>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&et<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,J,et,at.__webglTexture,Z),e.bindFramebuffer(i.FRAMEBUFFER,null)}function lt(w,S,B){if(i.bindRenderbuffer(i.RENDERBUFFER,w),S.depthBuffer){const J=S.depthTexture,et=J&&J.isDepthTexture?J.type:null,Z=y(S.stencilBuffer,et),Lt=S.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ft=jt(S);ee(S)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ft,Z,S.width,S.height):B?i.renderbufferStorageMultisample(i.RENDERBUFFER,ft,Z,S.width,S.height):i.renderbufferStorage(i.RENDERBUFFER,Z,S.width,S.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Lt,i.RENDERBUFFER,w)}else{const J=S.textures;for(let et=0;et<J.length;et++){const Z=J[et],Lt=r.convert(Z.format,Z.colorSpace),ft=r.convert(Z.type),St=M(Z.internalFormat,Lt,ft,Z.colorSpace),re=jt(S);B&&ee(S)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,re,St,S.width,S.height):ee(S)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,re,St,S.width,S.height):i.renderbufferStorage(i.RENDERBUFFER,St,S.width,S.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function It(w,S){if(S&&S.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(i.FRAMEBUFFER,w),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const J=n.get(S.depthTexture);J.__renderTarget=S,(!J.__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),nt(S.depthTexture,0);const et=J.__webglTexture,Z=jt(S);if(S.depthTexture.format===lr)ee(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,et,0,Z):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,et,0);else if(S.depthTexture.format===mr)ee(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,et,0,Z):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,et,0);else throw new Error("Unknown depthTexture format")}function zt(w){const S=n.get(w),B=w.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==w.depthTexture){const J=w.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),J){const et=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,J.removeEventListener("dispose",et)};J.addEventListener("dispose",et),S.__depthDisposeCallback=et}S.__boundDepthTexture=J}if(w.depthTexture&&!S.__autoAllocateDepthBuffer){if(B)throw new Error("target.depthTexture not supported in Cube render targets");It(S.__webglFramebuffer,w)}else if(B){S.__webglDepthbuffer=[];for(let J=0;J<6;J++)if(e.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer[J]),S.__webglDepthbuffer[J]===void 0)S.__webglDepthbuffer[J]=i.createRenderbuffer(),lt(S.__webglDepthbuffer[J],w,!1);else{const et=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Z=S.__webglDepthbuffer[J];i.bindRenderbuffer(i.RENDERBUFFER,Z),i.framebufferRenderbuffer(i.FRAMEBUFFER,et,i.RENDERBUFFER,Z)}}else if(e.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=i.createRenderbuffer(),lt(S.__webglDepthbuffer,w,!1);else{const J=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,et=S.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,et),i.framebufferRenderbuffer(i.FRAMEBUFFER,J,i.RENDERBUFFER,et)}e.bindFramebuffer(i.FRAMEBUFFER,null)}function Gt(w,S,B){const J=n.get(w);S!==void 0&&Tt(J.__webglFramebuffer,w,w.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),B!==void 0&&zt(w)}function pe(w){const S=w.texture,B=n.get(w),J=n.get(S);w.addEventListener("dispose",R);const et=w.textures,Z=w.isWebGLCubeRenderTarget===!0,Lt=et.length>1;if(Lt||(J.__webglTexture===void 0&&(J.__webglTexture=i.createTexture()),J.__version=S.version,a.memory.textures++),Z){B.__webglFramebuffer=[];for(let ft=0;ft<6;ft++)if(S.mipmaps&&S.mipmaps.length>0){B.__webglFramebuffer[ft]=[];for(let St=0;St<S.mipmaps.length;St++)B.__webglFramebuffer[ft][St]=i.createFramebuffer()}else B.__webglFramebuffer[ft]=i.createFramebuffer()}else{if(S.mipmaps&&S.mipmaps.length>0){B.__webglFramebuffer=[];for(let ft=0;ft<S.mipmaps.length;ft++)B.__webglFramebuffer[ft]=i.createFramebuffer()}else B.__webglFramebuffer=i.createFramebuffer();if(Lt)for(let ft=0,St=et.length;ft<St;ft++){const re=n.get(et[ft]);re.__webglTexture===void 0&&(re.__webglTexture=i.createTexture(),a.memory.textures++)}if(w.samples>0&&ee(w)===!1){B.__webglMultisampledFramebuffer=i.createFramebuffer(),B.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let ft=0;ft<et.length;ft++){const St=et[ft];B.__webglColorRenderbuffer[ft]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,B.__webglColorRenderbuffer[ft]);const re=r.convert(St.format,St.colorSpace),at=r.convert(St.type),Et=M(St.internalFormat,re,at,St.colorSpace,w.isXRRenderTarget===!0),Ut=jt(w);i.renderbufferStorageMultisample(i.RENDERBUFFER,Ut,Et,w.width,w.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ft,i.RENDERBUFFER,B.__webglColorRenderbuffer[ft])}i.bindRenderbuffer(i.RENDERBUFFER,null),w.depthBuffer&&(B.__webglDepthRenderbuffer=i.createRenderbuffer(),lt(B.__webglDepthRenderbuffer,w,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(Z){e.bindTexture(i.TEXTURE_CUBE_MAP,J.__webglTexture),Wt(i.TEXTURE_CUBE_MAP,S);for(let ft=0;ft<6;ft++)if(S.mipmaps&&S.mipmaps.length>0)for(let St=0;St<S.mipmaps.length;St++)Tt(B.__webglFramebuffer[ft][St],w,S,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,St);else Tt(B.__webglFramebuffer[ft],w,S,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,0);m(S)&&d(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(Lt){for(let ft=0,St=et.length;ft<St;ft++){const re=et[ft],at=n.get(re);e.bindTexture(i.TEXTURE_2D,at.__webglTexture),Wt(i.TEXTURE_2D,re),Tt(B.__webglFramebuffer,w,re,i.COLOR_ATTACHMENT0+ft,i.TEXTURE_2D,0),m(re)&&d(i.TEXTURE_2D)}e.unbindTexture()}else{let ft=i.TEXTURE_2D;if((w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(ft=w.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(ft,J.__webglTexture),Wt(ft,S),S.mipmaps&&S.mipmaps.length>0)for(let St=0;St<S.mipmaps.length;St++)Tt(B.__webglFramebuffer[St],w,S,i.COLOR_ATTACHMENT0,ft,St);else Tt(B.__webglFramebuffer,w,S,i.COLOR_ATTACHMENT0,ft,0);m(S)&&d(ft),e.unbindTexture()}w.depthBuffer&&zt(w)}function Zt(w){const S=w.textures;for(let B=0,J=S.length;B<J;B++){const et=S[B];if(m(et)){const Z=x(w),Lt=n.get(et).__webglTexture;e.bindTexture(Z,Lt),d(Z),e.unbindTexture()}}}const Ae=[],U=[];function tn(w){if(w.samples>0){if(ee(w)===!1){const S=w.textures,B=w.width,J=w.height;let et=i.COLOR_BUFFER_BIT;const Z=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Lt=n.get(w),ft=S.length>1;if(ft)for(let St=0;St<S.length;St++)e.bindFramebuffer(i.FRAMEBUFFER,Lt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+St,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,Lt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+St,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,Lt.__webglMultisampledFramebuffer),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Lt.__webglFramebuffer);for(let St=0;St<S.length;St++){if(w.resolveDepthBuffer&&(w.depthBuffer&&(et|=i.DEPTH_BUFFER_BIT),w.stencilBuffer&&w.resolveStencilBuffer&&(et|=i.STENCIL_BUFFER_BIT)),ft){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Lt.__webglColorRenderbuffer[St]);const re=n.get(S[St]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,re,0)}i.blitFramebuffer(0,0,B,J,0,0,B,J,et,i.NEAREST),l===!0&&(Ae.length=0,U.length=0,Ae.push(i.COLOR_ATTACHMENT0+St),w.depthBuffer&&w.resolveDepthBuffer===!1&&(Ae.push(Z),U.push(Z),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,U)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Ae))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ft)for(let St=0;St<S.length;St++){e.bindFramebuffer(i.FRAMEBUFFER,Lt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+St,i.RENDERBUFFER,Lt.__webglColorRenderbuffer[St]);const re=n.get(S[St]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,Lt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+St,i.TEXTURE_2D,re,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Lt.__webglMultisampledFramebuffer)}else if(w.depthBuffer&&w.resolveDepthBuffer===!1&&l){const S=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[S])}}}function jt(w){return Math.min(s.maxSamples,w.samples)}function ee(w){const S=n.get(w);return w.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function Ot(w){const S=a.render.frame;h.get(w)!==S&&(h.set(w,S),w.update())}function ye(w,S){const B=w.colorSpace,J=w.format,et=w.type;return w.isCompressedTexture===!0||w.isVideoTexture===!0||B!==yr&&B!==Vi&&(oe.getTransfer(B)===me?(J!==Nn||et!==Ti)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",B)),S}function Nt(w){return typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement?(c.width=w.naturalWidth||w.width,c.height=w.naturalHeight||w.height):typeof VideoFrame<"u"&&w instanceof VideoFrame?(c.width=w.displayWidth,c.height=w.displayHeight):(c.width=w.width,c.height=w.height),c}this.allocateTextureUnit=V,this.resetTextureUnits=$,this.setTexture2D=nt,this.setTexture2DArray=q,this.setTexture3D=it,this.setTextureCube=W,this.rebindTextures=Gt,this.setupRenderTarget=pe,this.updateRenderTargetMipmap=Zt,this.updateMultisampleRenderTarget=tn,this.setupDepthRenderbuffer=zt,this.setupFrameBufferTexture=Tt,this.useMultisampledRTT=ee}function j_(i,t){function e(n,s=Vi){let r;const a=oe.getTransfer(s);if(n===Ti)return i.UNSIGNED_BYTE;if(n===ph)return i.UNSIGNED_SHORT_4_4_4_4;if(n===mh)return i.UNSIGNED_SHORT_5_5_5_1;if(n===ud)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===cd)return i.BYTE;if(n===hd)return i.SHORT;if(n===fa)return i.UNSIGNED_SHORT;if(n===dh)return i.INT;if(n===ts)return i.UNSIGNED_INT;if(n===ri)return i.FLOAT;if(n===ai)return i.HALF_FLOAT;if(n===fd)return i.ALPHA;if(n===dd)return i.RGB;if(n===Nn)return i.RGBA;if(n===pd)return i.LUMINANCE;if(n===md)return i.LUMINANCE_ALPHA;if(n===lr)return i.DEPTH_COMPONENT;if(n===mr)return i.DEPTH_STENCIL;if(n===gh)return i.RED;if(n===vh)return i.RED_INTEGER;if(n===gd)return i.RG;if(n===_h)return i.RG_INTEGER;if(n===xh)return i.RGBA_INTEGER;if(n===Mo||n===yo||n===So||n===Eo)if(a===me)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Mo)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===yo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===So)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Eo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Mo)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===yo)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===So)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Eo)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Sc||n===Ec||n===bc||n===Tc)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Sc)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Ec)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===bc)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Tc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Ac||n===wc||n===Rc)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Ac||n===wc)return a===me?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Rc)return a===me?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Cc||n===Lc||n===Dc||n===Pc||n===Ic||n===Nc||n===Oc||n===kc||n===Uc||n===zc||n===Fc||n===Bc||n===Hc||n===Gc)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Cc)return a===me?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Lc)return a===me?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Dc)return a===me?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Pc)return a===me?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Ic)return a===me?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Nc)return a===me?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Oc)return a===me?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===kc)return a===me?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Uc)return a===me?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===zc)return a===me?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Fc)return a===me?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Bc)return a===me?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Hc)return a===me?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Gc)return a===me?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===bo||n===Vc||n===Wc)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===bo)return a===me?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Vc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Wc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===vd||n===Xc||n===$c||n===qc)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===bo)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Xc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===$c)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===qc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===pr?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}class Z_ extends In{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}class Yn extends Qe{constructor(){super(),this.isGroup=!0,this.type="Group"}}const J_={type:"move"};class Gl{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Yn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Yn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new N,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new N),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Yn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new N,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new N),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(const _ of t.hand.values()){const m=e.getJointPose(_,n),d=this._getHandJoint(c,_);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],f=h.position.distanceTo(u.position),p=.02,v=.005;c.inputState.pinching&&f>p+v?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&f<=p-v&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(J_)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new Yn;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}const Q_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,tx=`
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

}`;class ex{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){const s=new Xe,r=t.properties.get(s);r.__webglTexture=e.texture,(e.depthNear!=n.depthNear||e.depthFar!=n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=s}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new ze({vertexShader:Q_,fragmentShader:tx,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Te(new ys(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class nx extends Sr{constructor(t,e){super();const n=this;let s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,f=null,p=null,v=null;const _=new ex,m=e.getContextAttributes();let d=null,x=null;const M=[],y=[],C=new kt;let A=null;const R=new In;R.viewport=new Oe;const P=new In;P.viewport=new Oe;const T=[R,P],E=new Z_;let I=null,$=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(j){let rt=M[j];return rt===void 0&&(rt=new Gl,M[j]=rt),rt.getTargetRaySpace()},this.getControllerGrip=function(j){let rt=M[j];return rt===void 0&&(rt=new Gl,M[j]=rt),rt.getGripSpace()},this.getHand=function(j){let rt=M[j];return rt===void 0&&(rt=new Gl,M[j]=rt),rt.getHandSpace()};function V(j){const rt=y.indexOf(j.inputSource);if(rt===-1)return;const Tt=M[rt];Tt!==void 0&&(Tt.update(j.inputSource,j.frame,c||a),Tt.dispatchEvent({type:j.type,data:j.inputSource}))}function Y(){s.removeEventListener("select",V),s.removeEventListener("selectstart",V),s.removeEventListener("selectend",V),s.removeEventListener("squeeze",V),s.removeEventListener("squeezestart",V),s.removeEventListener("squeezeend",V),s.removeEventListener("end",Y),s.removeEventListener("inputsourceschange",nt);for(let j=0;j<M.length;j++){const rt=y[j];rt!==null&&(y[j]=null,M[j].disconnect(rt))}I=null,$=null,_.reset(),t.setRenderTarget(d),p=null,f=null,u=null,s=null,x=null,ce.stop(),n.isPresenting=!1,t.setPixelRatio(A),t.setSize(C.width,C.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(j){r=j,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(j){o=j,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(j){c=j},this.getBaseLayer=function(){return f!==null?f:p},this.getBinding=function(){return u},this.getFrame=function(){return v},this.getSession=function(){return s},this.setSession=async function(j){if(s=j,s!==null){if(d=t.getRenderTarget(),s.addEventListener("select",V),s.addEventListener("selectstart",V),s.addEventListener("selectend",V),s.addEventListener("squeeze",V),s.addEventListener("squeezestart",V),s.addEventListener("squeezeend",V),s.addEventListener("end",Y),s.addEventListener("inputsourceschange",nt),m.xrCompatible!==!0&&await e.makeXRCompatible(),A=t.getPixelRatio(),t.getSize(C),s.renderState.layers===void 0){const rt={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,e,rt),s.updateRenderState({baseLayer:p}),t.setPixelRatio(1),t.setSize(p.framebufferWidth,p.framebufferHeight,!1),x=new wn(p.framebufferWidth,p.framebufferHeight,{format:Nn,type:Ti,colorSpace:t.outputColorSpace,stencilBuffer:m.stencil})}else{let rt=null,Tt=null,lt=null;m.depth&&(lt=m.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,rt=m.stencil?mr:lr,Tt=m.stencil?pr:ts);const It={colorFormat:e.RGBA8,depthFormat:lt,scaleFactor:r};u=new XRWebGLBinding(s,e),f=u.createProjectionLayer(It),s.updateRenderState({layers:[f]}),t.setPixelRatio(1),t.setSize(f.textureWidth,f.textureHeight,!1),x=new wn(f.textureWidth,f.textureHeight,{format:Nn,type:Ti,depthTexture:new Th(f.textureWidth,f.textureHeight,Tt,void 0,void 0,void 0,void 0,void 0,void 0,rt),stencilBuffer:m.stencil,colorSpace:t.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),ce.setContext(s),ce.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function nt(j){for(let rt=0;rt<j.removed.length;rt++){const Tt=j.removed[rt],lt=y.indexOf(Tt);lt>=0&&(y[lt]=null,M[lt].disconnect(Tt))}for(let rt=0;rt<j.added.length;rt++){const Tt=j.added[rt];let lt=y.indexOf(Tt);if(lt===-1){for(let zt=0;zt<M.length;zt++)if(zt>=y.length){y.push(Tt),lt=zt;break}else if(y[zt]===null){y[zt]=Tt,lt=zt;break}if(lt===-1)break}const It=M[lt];It&&It.connect(Tt)}}const q=new N,it=new N;function W(j,rt,Tt){q.setFromMatrixPosition(rt.matrixWorld),it.setFromMatrixPosition(Tt.matrixWorld);const lt=q.distanceTo(it),It=rt.projectionMatrix.elements,zt=Tt.projectionMatrix.elements,Gt=It[14]/(It[10]-1),pe=It[14]/(It[10]+1),Zt=(It[9]+1)/It[5],Ae=(It[9]-1)/It[5],U=(It[8]-1)/It[0],tn=(zt[8]+1)/zt[0],jt=Gt*U,ee=Gt*tn,Ot=lt/(-U+tn),ye=Ot*-U;if(rt.matrixWorld.decompose(j.position,j.quaternion,j.scale),j.translateX(ye),j.translateZ(Ot),j.matrixWorld.compose(j.position,j.quaternion,j.scale),j.matrixWorldInverse.copy(j.matrixWorld).invert(),It[10]===-1)j.projectionMatrix.copy(rt.projectionMatrix),j.projectionMatrixInverse.copy(rt.projectionMatrixInverse);else{const Nt=Gt+Ot,w=pe+Ot,S=jt-ye,B=ee+(lt-ye),J=Zt*pe/w*Nt,et=Ae*pe/w*Nt;j.projectionMatrix.makePerspective(S,B,J,et,Nt,w),j.projectionMatrixInverse.copy(j.projectionMatrix).invert()}}function st(j,rt){rt===null?j.matrixWorld.copy(j.matrix):j.matrixWorld.multiplyMatrices(rt.matrixWorld,j.matrix),j.matrixWorldInverse.copy(j.matrixWorld).invert()}this.updateCamera=function(j){if(s===null)return;let rt=j.near,Tt=j.far;_.texture!==null&&(_.depthNear>0&&(rt=_.depthNear),_.depthFar>0&&(Tt=_.depthFar)),E.near=P.near=R.near=rt,E.far=P.far=R.far=Tt,(I!==E.near||$!==E.far)&&(s.updateRenderState({depthNear:E.near,depthFar:E.far}),I=E.near,$=E.far),R.layers.mask=j.layers.mask|2,P.layers.mask=j.layers.mask|4,E.layers.mask=R.layers.mask|P.layers.mask;const lt=j.parent,It=E.cameras;st(E,lt);for(let zt=0;zt<It.length;zt++)st(It[zt],lt);It.length===2?W(E,R,P):E.projectionMatrix.copy(R.projectionMatrix),mt(j,E,lt)};function mt(j,rt,Tt){Tt===null?j.matrix.copy(rt.matrixWorld):(j.matrix.copy(Tt.matrixWorld),j.matrix.invert(),j.matrix.multiply(rt.matrixWorld)),j.matrix.decompose(j.position,j.quaternion,j.scale),j.updateMatrixWorld(!0),j.projectionMatrix.copy(rt.projectionMatrix),j.projectionMatrixInverse.copy(rt.projectionMatrixInverse),j.isPerspectiveCamera&&(j.fov=Yc*2*Math.atan(1/j.projectionMatrix.elements[5]),j.zoom=1)}this.getCamera=function(){return E},this.getFoveation=function(){if(!(f===null&&p===null))return l},this.setFoveation=function(j){l=j,f!==null&&(f.fixedFoveation=j),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=j)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(E)};let Ct=null;function Wt(j,rt){if(h=rt.getViewerPose(c||a),v=rt,h!==null){const Tt=h.views;p!==null&&(t.setRenderTargetFramebuffer(x,p.framebuffer),t.setRenderTarget(x));let lt=!1;Tt.length!==E.cameras.length&&(E.cameras.length=0,lt=!0);for(let zt=0;zt<Tt.length;zt++){const Gt=Tt[zt];let pe=null;if(p!==null)pe=p.getViewport(Gt);else{const Ae=u.getViewSubImage(f,Gt);pe=Ae.viewport,zt===0&&(t.setRenderTargetTextures(x,Ae.colorTexture,f.ignoreDepthValues?void 0:Ae.depthStencilTexture),t.setRenderTarget(x))}let Zt=T[zt];Zt===void 0&&(Zt=new In,Zt.layers.enable(zt),Zt.viewport=new Oe,T[zt]=Zt),Zt.matrix.fromArray(Gt.transform.matrix),Zt.matrix.decompose(Zt.position,Zt.quaternion,Zt.scale),Zt.projectionMatrix.fromArray(Gt.projectionMatrix),Zt.projectionMatrixInverse.copy(Zt.projectionMatrix).invert(),Zt.viewport.set(pe.x,pe.y,pe.width,pe.height),zt===0&&(E.matrix.copy(Zt.matrix),E.matrix.decompose(E.position,E.quaternion,E.scale)),lt===!0&&E.cameras.push(Zt)}const It=s.enabledFeatures;if(It&&It.includes("depth-sensing")){const zt=u.getDepthInformation(Tt[0]);zt&&zt.isValid&&zt.texture&&_.init(t,zt,s.renderState)}}for(let Tt=0;Tt<M.length;Tt++){const lt=y[Tt],It=M[Tt];lt!==null&&It!==void 0&&It.update(lt,rt,c||a)}Ct&&Ct(j,rt),rt.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:rt}),v=null}const ce=new Rd;ce.setAnimationLoop(Wt),this.setAnimationLoop=function(j){Ct=j},this.dispose=function(){}}}const ps=new Ai,ix=new de;function sx(i,t){function e(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function n(m,d){d.color.getRGB(m.fogColor.value,bd(i)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function s(m,d,x,M,y){d.isMeshBasicMaterial||d.isMeshLambertMaterial?r(m,d):d.isMeshToonMaterial?(r(m,d),u(m,d)):d.isMeshPhongMaterial?(r(m,d),h(m,d)):d.isMeshStandardMaterial?(r(m,d),f(m,d),d.isMeshPhysicalMaterial&&p(m,d,y)):d.isMeshMatcapMaterial?(r(m,d),v(m,d)):d.isMeshDepthMaterial?r(m,d):d.isMeshDistanceMaterial?(r(m,d),_(m,d)):d.isMeshNormalMaterial?r(m,d):d.isLineBasicMaterial?(a(m,d),d.isLineDashedMaterial&&o(m,d)):d.isPointsMaterial?l(m,d,x,M):d.isSpriteMaterial?c(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,e(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,e(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,e(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===ln&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,e(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===ln&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,e(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,e(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,e(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);const x=t.get(d),M=x.envMap,y=x.envMapRotation;M&&(m.envMap.value=M,ps.copy(y),ps.x*=-1,ps.y*=-1,ps.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(ps.y*=-1,ps.z*=-1),m.envMapRotation.value.setFromMatrix4(ix.makeRotationFromEuler(ps)),m.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap&&(m.lightMap.value=d.lightMap,m.lightMapIntensity.value=d.lightMapIntensity,e(d.lightMap,m.lightMapTransform)),d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,e(d.aoMap,m.aoMapTransform))}function a(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,e(d.map,m.mapTransform))}function o(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function l(m,d,x,M){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*x,m.scale.value=M*.5,d.map&&(m.map.value=d.map,e(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,e(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function c(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,e(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,e(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function h(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function u(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function f(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,e(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,e(d.roughnessMap,m.roughnessMapTransform)),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function p(m,d,x){m.ior.value=d.ior,d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,e(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,e(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,e(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,e(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,e(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===ln&&m.clearcoatNormalScale.value.negate())),d.dispersion>0&&(m.dispersion.value=d.dispersion),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,e(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,e(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=x.texture,m.transmissionSamplerSize.value.set(x.width,x.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,e(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,e(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,e(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,e(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,e(d.specularIntensityMap,m.specularIntensityMapTransform))}function v(m,d){d.matcap&&(m.matcap.value=d.matcap)}function _(m,d){const x=t.get(d).light;m.referencePosition.value.setFromMatrixPosition(x.matrixWorld),m.nearDistance.value=x.shadow.camera.near,m.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function rx(i,t,e,n){let s={},r={},a=[];const o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(x,M){const y=M.program;n.uniformBlockBinding(x,y)}function c(x,M){let y=s[x.id];y===void 0&&(v(x),y=h(x),s[x.id]=y,x.addEventListener("dispose",m));const C=M.program;n.updateUBOMapping(x,C);const A=t.render.frame;r[x.id]!==A&&(f(x),r[x.id]=A)}function h(x){const M=u();x.__bindingPointIndex=M;const y=i.createBuffer(),C=x.__size,A=x.usage;return i.bindBuffer(i.UNIFORM_BUFFER,y),i.bufferData(i.UNIFORM_BUFFER,C,A),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,M,y),y}function u(){for(let x=0;x<o;x++)if(a.indexOf(x)===-1)return a.push(x),x;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(x){const M=s[x.id],y=x.uniforms,C=x.__cache;i.bindBuffer(i.UNIFORM_BUFFER,M);for(let A=0,R=y.length;A<R;A++){const P=Array.isArray(y[A])?y[A]:[y[A]];for(let T=0,E=P.length;T<E;T++){const I=P[T];if(p(I,A,T,C)===!0){const $=I.__offset,V=Array.isArray(I.value)?I.value:[I.value];let Y=0;for(let nt=0;nt<V.length;nt++){const q=V[nt],it=_(q);typeof q=="number"||typeof q=="boolean"?(I.__data[0]=q,i.bufferSubData(i.UNIFORM_BUFFER,$+Y,I.__data)):q.isMatrix3?(I.__data[0]=q.elements[0],I.__data[1]=q.elements[1],I.__data[2]=q.elements[2],I.__data[3]=0,I.__data[4]=q.elements[3],I.__data[5]=q.elements[4],I.__data[6]=q.elements[5],I.__data[7]=0,I.__data[8]=q.elements[6],I.__data[9]=q.elements[7],I.__data[10]=q.elements[8],I.__data[11]=0):(q.toArray(I.__data,Y),Y+=it.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,$,I.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(x,M,y,C){const A=x.value,R=M+"_"+y;if(C[R]===void 0)return typeof A=="number"||typeof A=="boolean"?C[R]=A:C[R]=A.clone(),!0;{const P=C[R];if(typeof A=="number"||typeof A=="boolean"){if(P!==A)return C[R]=A,!0}else if(P.equals(A)===!1)return P.copy(A),!0}return!1}function v(x){const M=x.uniforms;let y=0;const C=16;for(let R=0,P=M.length;R<P;R++){const T=Array.isArray(M[R])?M[R]:[M[R]];for(let E=0,I=T.length;E<I;E++){const $=T[E],V=Array.isArray($.value)?$.value:[$.value];for(let Y=0,nt=V.length;Y<nt;Y++){const q=V[Y],it=_(q),W=y%C,st=W%it.boundary,mt=W+st;y+=st,mt!==0&&C-mt<it.storage&&(y+=C-mt),$.__data=new Float32Array(it.storage/Float32Array.BYTES_PER_ELEMENT),$.__offset=y,y+=it.storage}}}const A=y%C;return A>0&&(y+=C-A),x.__size=y,x.__cache={},this}function _(x){const M={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(M.boundary=4,M.storage=4):x.isVector2?(M.boundary=8,M.storage=8):x.isVector3||x.isColor?(M.boundary=16,M.storage=12):x.isVector4?(M.boundary=16,M.storage=16):x.isMatrix3?(M.boundary=48,M.storage=48):x.isMatrix4?(M.boundary=64,M.storage=64):x.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",x),M}function m(x){const M=x.target;M.removeEventListener("dispose",m);const y=a.indexOf(M.__bindingPointIndex);a.splice(y,1),i.deleteBuffer(s[M.id]),delete s[M.id],delete r[M.id]}function d(){for(const x in s)i.deleteBuffer(s[x]);a=[],s={},r={}}return{bind:l,update:c,dispose:d}}class ax{constructor(t={}){const{canvas:e=Ym(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:f=!1}=t;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=a;const v=new Uint32Array(4),_=new Int32Array(4);let m=null,d=null;const x=[],M=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Pn,this.toneMapping=Yi,this.toneMappingExposure=1;const y=this;let C=!1,A=0,R=0,P=null,T=-1,E=null;const I=new Oe,$=new Oe;let V=null;const Y=new Jt(0);let nt=0,q=e.width,it=e.height,W=1,st=null,mt=null;const Ct=new Oe(0,0,q,it),Wt=new Oe(0,0,q,it);let ce=!1;const j=new wd;let rt=!1,Tt=!1;const lt=new de,It=new de,zt=new N,Gt=new Oe,pe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Zt=!1;function Ae(){return P===null?W:1}let U=n;function tn(b,k){return e.getContext(b,k)}try{const b={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${fh}`),e.addEventListener("webglcontextlost",Q,!1),e.addEventListener("webglcontextrestored",gt,!1),e.addEventListener("webglcontextcreationerror",dt,!1),U===null){const k="webgl2";if(U=tn(k,b),U===null)throw tn(k)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(b){throw console.error("THREE.WebGLRenderer: "+b.message),b}let jt,ee,Ot,ye,Nt,w,S,B,J,et,Z,Lt,ft,St,re,at,Et,Ut,Ft,bt,ne,Kt,xe,O;function ut(){jt=new u1(U),jt.init(),Kt=new j_(U,jt),ee=new r1(U,jt,t,Kt),Ot=new q_(U,jt),ee.reverseDepthBuffer&&f&&Ot.buffers.depth.setReversed(!0),ye=new p1(U),Nt=new P_,w=new Y_(U,jt,Ot,Nt,ee,Kt,ye),S=new o1(y),B=new h1(y),J=new y0(U),xe=new i1(U,J),et=new f1(U,J,ye,xe),Z=new g1(U,et,J,ye),Ft=new m1(U,ee,w),at=new a1(Nt),Lt=new D_(y,S,B,jt,ee,xe,at),ft=new sx(y,Nt),St=new N_,re=new B_(jt),Ut=new n1(y,S,B,Ot,Z,p,l),Et=new X_(y,Z,ee),O=new rx(U,ye,ee,Ot),bt=new s1(U,jt,ye),ne=new d1(U,jt,ye),ye.programs=Lt.programs,y.capabilities=ee,y.extensions=jt,y.properties=Nt,y.renderLists=St,y.shadowMap=Et,y.state=Ot,y.info=ye}ut();const X=new nx(y,U);this.xr=X,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){const b=jt.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){const b=jt.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return W},this.setPixelRatio=function(b){b!==void 0&&(W=b,this.setSize(q,it,!1))},this.getSize=function(b){return b.set(q,it)},this.setSize=function(b,k,H=!0){if(X.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}q=b,it=k,e.width=Math.floor(b*W),e.height=Math.floor(k*W),H===!0&&(e.style.width=b+"px",e.style.height=k+"px"),this.setViewport(0,0,b,k)},this.getDrawingBufferSize=function(b){return b.set(q*W,it*W).floor()},this.setDrawingBufferSize=function(b,k,H){q=b,it=k,W=H,e.width=Math.floor(b*H),e.height=Math.floor(k*H),this.setViewport(0,0,b,k)},this.getCurrentViewport=function(b){return b.copy(I)},this.getViewport=function(b){return b.copy(Ct)},this.setViewport=function(b,k,H,G){b.isVector4?Ct.set(b.x,b.y,b.z,b.w):Ct.set(b,k,H,G),Ot.viewport(I.copy(Ct).multiplyScalar(W).round())},this.getScissor=function(b){return b.copy(Wt)},this.setScissor=function(b,k,H,G){b.isVector4?Wt.set(b.x,b.y,b.z,b.w):Wt.set(b,k,H,G),Ot.scissor($.copy(Wt).multiplyScalar(W).round())},this.getScissorTest=function(){return ce},this.setScissorTest=function(b){Ot.setScissorTest(ce=b)},this.setOpaqueSort=function(b){st=b},this.setTransparentSort=function(b){mt=b},this.getClearColor=function(b){return b.copy(Ut.getClearColor())},this.setClearColor=function(){Ut.setClearColor.apply(Ut,arguments)},this.getClearAlpha=function(){return Ut.getClearAlpha()},this.setClearAlpha=function(){Ut.setClearAlpha.apply(Ut,arguments)},this.clear=function(b=!0,k=!0,H=!0){let G=0;if(b){let z=!1;if(P!==null){const ot=P.texture.format;z=ot===xh||ot===_h||ot===vh}if(z){const ot=P.texture.type,pt=ot===Ti||ot===ts||ot===fa||ot===pr||ot===ph||ot===mh,At=Ut.getClearColor(),wt=Ut.getClearAlpha(),Bt=At.r,$t=At.g,Rt=At.b;pt?(v[0]=Bt,v[1]=$t,v[2]=Rt,v[3]=wt,U.clearBufferuiv(U.COLOR,0,v)):(_[0]=Bt,_[1]=$t,_[2]=Rt,_[3]=wt,U.clearBufferiv(U.COLOR,0,_))}else G|=U.COLOR_BUFFER_BIT}k&&(G|=U.DEPTH_BUFFER_BIT),H&&(G|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),U.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",Q,!1),e.removeEventListener("webglcontextrestored",gt,!1),e.removeEventListener("webglcontextcreationerror",dt,!1),St.dispose(),re.dispose(),Nt.dispose(),S.dispose(),B.dispose(),Z.dispose(),xe.dispose(),O.dispose(),Lt.dispose(),X.dispose(),X.removeEventListener("sessionstart",Hh),X.removeEventListener("sessionend",Gh),ls.stop()};function Q(b){b.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),C=!0}function gt(){console.log("THREE.WebGLRenderer: Context Restored."),C=!1;const b=ye.autoReset,k=Et.enabled,H=Et.autoUpdate,G=Et.needsUpdate,z=Et.type;ut(),ye.autoReset=b,Et.enabled=k,Et.autoUpdate=H,Et.needsUpdate=G,Et.type=z}function dt(b){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function Xt(b){const k=b.target;k.removeEventListener("dispose",Xt),Le(k)}function Le(b){$e(b),Nt.remove(b)}function $e(b){const k=Nt.get(b).programs;k!==void 0&&(k.forEach(function(H){Lt.releaseProgram(H)}),b.isShaderMaterial&&Lt.releaseShaderCache(b))}this.renderBufferDirect=function(b,k,H,G,z,ot){k===null&&(k=pe);const pt=z.isMesh&&z.matrixWorld.determinant()<0,At=im(b,k,H,G,z);Ot.setMaterial(G,pt);let wt=H.index,Bt=1;if(G.wireframe===!0){if(wt=et.getWireframeAttribute(H),wt===void 0)return;Bt=2}const $t=H.drawRange,Rt=H.attributes.position;let le=$t.start*Bt,Me=($t.start+$t.count)*Bt;ot!==null&&(le=Math.max(le,ot.start*Bt),Me=Math.min(Me,(ot.start+ot.count)*Bt)),wt!==null?(le=Math.max(le,0),Me=Math.min(Me,wt.count)):Rt!=null&&(le=Math.max(le,0),Me=Math.min(Me,Rt.count));const Se=Me-le;if(Se<0||Se===1/0)return;xe.setup(z,G,At,H,wt);let un,he=bt;if(wt!==null&&(un=J.get(wt),he=ne,he.setIndex(un)),z.isMesh)G.wireframe===!0?(Ot.setLineWidth(G.wireframeLinewidth*Ae()),he.setMode(U.LINES)):he.setMode(U.TRIANGLES);else if(z.isLine){let Dt=G.linewidth;Dt===void 0&&(Dt=1),Ot.setLineWidth(Dt*Ae()),z.isLineSegments?he.setMode(U.LINES):z.isLineLoop?he.setMode(U.LINE_LOOP):he.setMode(U.LINE_STRIP)}else z.isPoints?he.setMode(U.POINTS):z.isSprite&&he.setMode(U.TRIANGLES);if(z.isBatchedMesh)if(z._multiDrawInstances!==null)he.renderMultiDrawInstances(z._multiDrawStarts,z._multiDrawCounts,z._multiDrawCount,z._multiDrawInstances);else if(jt.get("WEBGL_multi_draw"))he.renderMultiDraw(z._multiDrawStarts,z._multiDrawCounts,z._multiDrawCount);else{const Dt=z._multiDrawStarts,li=z._multiDrawCounts,ue=z._multiDrawCount,Bn=wt?J.get(wt).bytesPerElement:1,Ps=Nt.get(G).currentProgram.getUniforms();for(let _n=0;_n<ue;_n++)Ps.setValue(U,"_gl_DrawID",_n),he.render(Dt[_n]/Bn,li[_n])}else if(z.isInstancedMesh)he.renderInstances(le,Se,z.count);else if(H.isInstancedBufferGeometry){const Dt=H._maxInstanceCount!==void 0?H._maxInstanceCount:1/0,li=Math.min(H.instanceCount,Dt);he.renderInstances(le,Se,li)}else he.render(le,Se)};function fe(b,k,H){b.transparent===!0&&b.side===mn&&b.forceSinglePass===!1?(b.side=ln,b.needsUpdate=!0,Na(b,k,H),b.side=bi,b.needsUpdate=!0,Na(b,k,H),b.side=mn):Na(b,k,H)}this.compile=function(b,k,H=null){H===null&&(H=b),d=re.get(H),d.init(k),M.push(d),H.traverseVisible(function(z){z.isLight&&z.layers.test(k.layers)&&(d.pushLight(z),z.castShadow&&d.pushShadow(z))}),b!==H&&b.traverseVisible(function(z){z.isLight&&z.layers.test(k.layers)&&(d.pushLight(z),z.castShadow&&d.pushShadow(z))}),d.setupLights();const G=new Set;return b.traverse(function(z){if(!(z.isMesh||z.isPoints||z.isLine||z.isSprite))return;const ot=z.material;if(ot)if(Array.isArray(ot))for(let pt=0;pt<ot.length;pt++){const At=ot[pt];fe(At,H,z),G.add(At)}else fe(ot,H,z),G.add(ot)}),M.pop(),d=null,G},this.compileAsync=function(b,k,H=null){const G=this.compile(b,k,H);return new Promise(z=>{function ot(){if(G.forEach(function(pt){Nt.get(pt).currentProgram.isReady()&&G.delete(pt)}),G.size===0){z(b);return}setTimeout(ot,10)}jt.get("KHR_parallel_shader_compile")!==null?ot():setTimeout(ot,10)})};let Fn=null;function oi(b){Fn&&Fn(b)}function Hh(){ls.stop()}function Gh(){ls.start()}const ls=new Rd;ls.setAnimationLoop(oi),typeof self<"u"&&ls.setContext(self),this.setAnimationLoop=function(b){Fn=b,X.setAnimationLoop(b),b===null?ls.stop():ls.start()},X.addEventListener("sessionstart",Hh),X.addEventListener("sessionend",Gh),this.render=function(b,k){if(k!==void 0&&k.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(C===!0)return;if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),k.parent===null&&k.matrixWorldAutoUpdate===!0&&k.updateMatrixWorld(),X.enabled===!0&&X.isPresenting===!0&&(X.cameraAutoUpdate===!0&&X.updateCamera(k),k=X.getCamera()),b.isScene===!0&&b.onBeforeRender(y,b,k,P),d=re.get(b,M.length),d.init(k),M.push(d),It.multiplyMatrices(k.projectionMatrix,k.matrixWorldInverse),j.setFromProjectionMatrix(It),Tt=this.localClippingEnabled,rt=at.init(this.clippingPlanes,Tt),m=St.get(b,x.length),m.init(),x.push(m),X.enabled===!0&&X.isPresenting===!0){const ot=y.xr.getDepthSensingMesh();ot!==null&&dl(ot,k,-1/0,y.sortObjects)}dl(b,k,0,y.sortObjects),m.finish(),y.sortObjects===!0&&m.sort(st,mt),Zt=X.enabled===!1||X.isPresenting===!1||X.hasDepthSensing()===!1,Zt&&Ut.addToRenderList(m,b),this.info.render.frame++,rt===!0&&at.beginShadows();const H=d.state.shadowsArray;Et.render(H,b,k),rt===!0&&at.endShadows(),this.info.autoReset===!0&&this.info.reset();const G=m.opaque,z=m.transmissive;if(d.setupLights(),k.isArrayCamera){const ot=k.cameras;if(z.length>0)for(let pt=0,At=ot.length;pt<At;pt++){const wt=ot[pt];Wh(G,z,b,wt)}Zt&&Ut.render(b);for(let pt=0,At=ot.length;pt<At;pt++){const wt=ot[pt];Vh(m,b,wt,wt.viewport)}}else z.length>0&&Wh(G,z,b,k),Zt&&Ut.render(b),Vh(m,b,k);P!==null&&(w.updateMultisampleRenderTarget(P),w.updateRenderTargetMipmap(P)),b.isScene===!0&&b.onAfterRender(y,b,k),xe.resetDefaultState(),T=-1,E=null,M.pop(),M.length>0?(d=M[M.length-1],rt===!0&&at.setGlobalState(y.clippingPlanes,d.state.camera)):d=null,x.pop(),x.length>0?m=x[x.length-1]:m=null};function dl(b,k,H,G){if(b.visible===!1)return;if(b.layers.test(k.layers)){if(b.isGroup)H=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(k);else if(b.isLight)d.pushLight(b),b.castShadow&&d.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||j.intersectsSprite(b)){G&&Gt.setFromMatrixPosition(b.matrixWorld).applyMatrix4(It);const pt=Z.update(b),At=b.material;At.visible&&m.push(b,pt,At,H,Gt.z,null)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||j.intersectsObject(b))){const pt=Z.update(b),At=b.material;if(G&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),Gt.copy(b.boundingSphere.center)):(pt.boundingSphere===null&&pt.computeBoundingSphere(),Gt.copy(pt.boundingSphere.center)),Gt.applyMatrix4(b.matrixWorld).applyMatrix4(It)),Array.isArray(At)){const wt=pt.groups;for(let Bt=0,$t=wt.length;Bt<$t;Bt++){const Rt=wt[Bt],le=At[Rt.materialIndex];le&&le.visible&&m.push(b,pt,le,H,Gt.z,Rt)}}else At.visible&&m.push(b,pt,At,H,Gt.z,null)}}const ot=b.children;for(let pt=0,At=ot.length;pt<At;pt++)dl(ot[pt],k,H,G)}function Vh(b,k,H,G){const z=b.opaque,ot=b.transmissive,pt=b.transparent;d.setupLightsView(H),rt===!0&&at.setGlobalState(y.clippingPlanes,H),G&&Ot.viewport(I.copy(G)),z.length>0&&Ia(z,k,H),ot.length>0&&Ia(ot,k,H),pt.length>0&&Ia(pt,k,H),Ot.buffers.depth.setTest(!0),Ot.buffers.depth.setMask(!0),Ot.buffers.color.setMask(!0),Ot.setPolygonOffset(!1)}function Wh(b,k,H,G){if((H.isScene===!0?H.overrideMaterial:null)!==null)return;d.state.transmissionRenderTarget[G.id]===void 0&&(d.state.transmissionRenderTarget[G.id]=new wn(1,1,{generateMipmaps:!0,type:jt.has("EXT_color_buffer_half_float")||jt.has("EXT_color_buffer_float")?ai:Ti,minFilter:si,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:oe.workingColorSpace}));const ot=d.state.transmissionRenderTarget[G.id],pt=G.viewport||I;ot.setSize(pt.z,pt.w);const At=y.getRenderTarget();y.setRenderTarget(ot),y.getClearColor(Y),nt=y.getClearAlpha(),nt<1&&y.setClearColor(16777215,.5),y.clear(),Zt&&Ut.render(H);const wt=y.toneMapping;y.toneMapping=Yi;const Bt=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),d.setupLightsView(G),rt===!0&&at.setGlobalState(y.clippingPlanes,G),Ia(b,H,G),w.updateMultisampleRenderTarget(ot),w.updateRenderTargetMipmap(ot),jt.has("WEBGL_multisampled_render_to_texture")===!1){let $t=!1;for(let Rt=0,le=k.length;Rt<le;Rt++){const Me=k[Rt],Se=Me.object,un=Me.geometry,he=Me.material,Dt=Me.group;if(he.side===mn&&Se.layers.test(G.layers)){const li=he.side;he.side=ln,he.needsUpdate=!0,Xh(Se,H,G,un,he,Dt),he.side=li,he.needsUpdate=!0,$t=!0}}$t===!0&&(w.updateMultisampleRenderTarget(ot),w.updateRenderTargetMipmap(ot))}y.setRenderTarget(At),y.setClearColor(Y,nt),Bt!==void 0&&(G.viewport=Bt),y.toneMapping=wt}function Ia(b,k,H){const G=k.isScene===!0?k.overrideMaterial:null;for(let z=0,ot=b.length;z<ot;z++){const pt=b[z],At=pt.object,wt=pt.geometry,Bt=G===null?pt.material:G,$t=pt.group;At.layers.test(H.layers)&&Xh(At,k,H,wt,Bt,$t)}}function Xh(b,k,H,G,z,ot){b.onBeforeRender(y,k,H,G,z,ot),b.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),z.onBeforeRender(y,k,H,G,b,ot),z.transparent===!0&&z.side===mn&&z.forceSinglePass===!1?(z.side=ln,z.needsUpdate=!0,y.renderBufferDirect(H,k,G,z,b,ot),z.side=bi,z.needsUpdate=!0,y.renderBufferDirect(H,k,G,z,b,ot),z.side=mn):y.renderBufferDirect(H,k,G,z,b,ot),b.onAfterRender(y,k,H,G,z,ot)}function Na(b,k,H){k.isScene!==!0&&(k=pe);const G=Nt.get(b),z=d.state.lights,ot=d.state.shadowsArray,pt=z.state.version,At=Lt.getParameters(b,z.state,ot,k,H),wt=Lt.getProgramCacheKey(At);let Bt=G.programs;G.environment=b.isMeshStandardMaterial?k.environment:null,G.fog=k.fog,G.envMap=(b.isMeshStandardMaterial?B:S).get(b.envMap||G.environment),G.envMapRotation=G.environment!==null&&b.envMap===null?k.environmentRotation:b.envMapRotation,Bt===void 0&&(b.addEventListener("dispose",Xt),Bt=new Map,G.programs=Bt);let $t=Bt.get(wt);if($t!==void 0){if(G.currentProgram===$t&&G.lightsStateVersion===pt)return qh(b,At),$t}else At.uniforms=Lt.getUniforms(b),b.onBeforeCompile(At,y),$t=Lt.acquireProgram(At,wt),Bt.set(wt,$t),G.uniforms=At.uniforms;const Rt=G.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(Rt.clippingPlanes=at.uniform),qh(b,At),G.needsLights=rm(b),G.lightsStateVersion=pt,G.needsLights&&(Rt.ambientLightColor.value=z.state.ambient,Rt.lightProbe.value=z.state.probe,Rt.directionalLights.value=z.state.directional,Rt.directionalLightShadows.value=z.state.directionalShadow,Rt.spotLights.value=z.state.spot,Rt.spotLightShadows.value=z.state.spotShadow,Rt.rectAreaLights.value=z.state.rectArea,Rt.ltc_1.value=z.state.rectAreaLTC1,Rt.ltc_2.value=z.state.rectAreaLTC2,Rt.pointLights.value=z.state.point,Rt.pointLightShadows.value=z.state.pointShadow,Rt.hemisphereLights.value=z.state.hemi,Rt.directionalShadowMap.value=z.state.directionalShadowMap,Rt.directionalShadowMatrix.value=z.state.directionalShadowMatrix,Rt.spotShadowMap.value=z.state.spotShadowMap,Rt.spotLightMatrix.value=z.state.spotLightMatrix,Rt.spotLightMap.value=z.state.spotLightMap,Rt.pointShadowMap.value=z.state.pointShadowMap,Rt.pointShadowMatrix.value=z.state.pointShadowMatrix),G.currentProgram=$t,G.uniformsList=null,$t}function $h(b){if(b.uniformsList===null){const k=b.currentProgram.getUniforms();b.uniformsList=Ao.seqWithValue(k.seq,b.uniforms)}return b.uniformsList}function qh(b,k){const H=Nt.get(b);H.outputColorSpace=k.outputColorSpace,H.batching=k.batching,H.batchingColor=k.batchingColor,H.instancing=k.instancing,H.instancingColor=k.instancingColor,H.instancingMorph=k.instancingMorph,H.skinning=k.skinning,H.morphTargets=k.morphTargets,H.morphNormals=k.morphNormals,H.morphColors=k.morphColors,H.morphTargetsCount=k.morphTargetsCount,H.numClippingPlanes=k.numClippingPlanes,H.numIntersection=k.numClipIntersection,H.vertexAlphas=k.vertexAlphas,H.vertexTangents=k.vertexTangents,H.toneMapping=k.toneMapping}function im(b,k,H,G,z){k.isScene!==!0&&(k=pe),w.resetTextureUnits();const ot=k.fog,pt=G.isMeshStandardMaterial?k.environment:null,At=P===null?y.outputColorSpace:P.isXRRenderTarget===!0?P.texture.colorSpace:yr,wt=(G.isMeshStandardMaterial?B:S).get(G.envMap||pt),Bt=G.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,$t=!!H.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),Rt=!!H.morphAttributes.position,le=!!H.morphAttributes.normal,Me=!!H.morphAttributes.color;let Se=Yi;G.toneMapped&&(P===null||P.isXRRenderTarget===!0)&&(Se=y.toneMapping);const un=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,he=un!==void 0?un.length:0,Dt=Nt.get(G),li=d.state.lights;if(rt===!0&&(Tt===!0||b!==E)){const Rn=b===E&&G.id===T;at.setState(G,b,Rn)}let ue=!1;G.version===Dt.__version?(Dt.needsLights&&Dt.lightsStateVersion!==li.state.version||Dt.outputColorSpace!==At||z.isBatchedMesh&&Dt.batching===!1||!z.isBatchedMesh&&Dt.batching===!0||z.isBatchedMesh&&Dt.batchingColor===!0&&z.colorTexture===null||z.isBatchedMesh&&Dt.batchingColor===!1&&z.colorTexture!==null||z.isInstancedMesh&&Dt.instancing===!1||!z.isInstancedMesh&&Dt.instancing===!0||z.isSkinnedMesh&&Dt.skinning===!1||!z.isSkinnedMesh&&Dt.skinning===!0||z.isInstancedMesh&&Dt.instancingColor===!0&&z.instanceColor===null||z.isInstancedMesh&&Dt.instancingColor===!1&&z.instanceColor!==null||z.isInstancedMesh&&Dt.instancingMorph===!0&&z.morphTexture===null||z.isInstancedMesh&&Dt.instancingMorph===!1&&z.morphTexture!==null||Dt.envMap!==wt||G.fog===!0&&Dt.fog!==ot||Dt.numClippingPlanes!==void 0&&(Dt.numClippingPlanes!==at.numPlanes||Dt.numIntersection!==at.numIntersection)||Dt.vertexAlphas!==Bt||Dt.vertexTangents!==$t||Dt.morphTargets!==Rt||Dt.morphNormals!==le||Dt.morphColors!==Me||Dt.toneMapping!==Se||Dt.morphTargetsCount!==he)&&(ue=!0):(ue=!0,Dt.__version=G.version);let Bn=Dt.currentProgram;ue===!0&&(Bn=Na(G,k,z));let Ps=!1,_n=!1,Cr=!1;const Ee=Bn.getUniforms(),Qn=Dt.uniforms;if(Ot.useProgram(Bn.program)&&(Ps=!0,_n=!0,Cr=!0),G.id!==T&&(T=G.id,_n=!0),Ps||E!==b){Ot.buffers.depth.getReversed()?(lt.copy(b.projectionMatrix),Zm(lt),Jm(lt),Ee.setValue(U,"projectionMatrix",lt)):Ee.setValue(U,"projectionMatrix",b.projectionMatrix),Ee.setValue(U,"viewMatrix",b.matrixWorldInverse);const Ii=Ee.map.cameraPosition;Ii!==void 0&&Ii.setValue(U,zt.setFromMatrixPosition(b.matrixWorld)),ee.logarithmicDepthBuffer&&Ee.setValue(U,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&Ee.setValue(U,"isOrthographic",b.isOrthographicCamera===!0),E!==b&&(E=b,_n=!0,Cr=!0)}if(z.isSkinnedMesh){Ee.setOptional(U,z,"bindMatrix"),Ee.setOptional(U,z,"bindMatrixInverse");const Rn=z.skeleton;Rn&&(Rn.boneTexture===null&&Rn.computeBoneTexture(),Ee.setValue(U,"boneTexture",Rn.boneTexture,w))}z.isBatchedMesh&&(Ee.setOptional(U,z,"batchingTexture"),Ee.setValue(U,"batchingTexture",z._matricesTexture,w),Ee.setOptional(U,z,"batchingIdTexture"),Ee.setValue(U,"batchingIdTexture",z._indirectTexture,w),Ee.setOptional(U,z,"batchingColorTexture"),z._colorsTexture!==null&&Ee.setValue(U,"batchingColorTexture",z._colorsTexture,w));const Lr=H.morphAttributes;if((Lr.position!==void 0||Lr.normal!==void 0||Lr.color!==void 0)&&Ft.update(z,H,Bn),(_n||Dt.receiveShadow!==z.receiveShadow)&&(Dt.receiveShadow=z.receiveShadow,Ee.setValue(U,"receiveShadow",z.receiveShadow)),G.isMeshGouraudMaterial&&G.envMap!==null&&(Qn.envMap.value=wt,Qn.flipEnvMap.value=wt.isCubeTexture&&wt.isRenderTargetTexture===!1?-1:1),G.isMeshStandardMaterial&&G.envMap===null&&k.environment!==null&&(Qn.envMapIntensity.value=k.environmentIntensity),_n&&(Ee.setValue(U,"toneMappingExposure",y.toneMappingExposure),Dt.needsLights&&sm(Qn,Cr),ot&&G.fog===!0&&ft.refreshFogUniforms(Qn,ot),ft.refreshMaterialUniforms(Qn,G,W,it,d.state.transmissionRenderTarget[b.id]),Ao.upload(U,$h(Dt),Qn,w)),G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(Ao.upload(U,$h(Dt),Qn,w),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&Ee.setValue(U,"center",z.center),Ee.setValue(U,"modelViewMatrix",z.modelViewMatrix),Ee.setValue(U,"normalMatrix",z.normalMatrix),Ee.setValue(U,"modelMatrix",z.matrixWorld),G.isShaderMaterial||G.isRawShaderMaterial){const Rn=G.uniformsGroups;for(let Ii=0,Ni=Rn.length;Ii<Ni;Ii++){const Kh=Rn[Ii];O.update(Kh,Bn),O.bind(Kh,Bn)}}return Bn}function sm(b,k){b.ambientLightColor.needsUpdate=k,b.lightProbe.needsUpdate=k,b.directionalLights.needsUpdate=k,b.directionalLightShadows.needsUpdate=k,b.pointLights.needsUpdate=k,b.pointLightShadows.needsUpdate=k,b.spotLights.needsUpdate=k,b.spotLightShadows.needsUpdate=k,b.rectAreaLights.needsUpdate=k,b.hemisphereLights.needsUpdate=k}function rm(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return A},this.getActiveMipmapLevel=function(){return R},this.getRenderTarget=function(){return P},this.setRenderTargetTextures=function(b,k,H){Nt.get(b.texture).__webglTexture=k,Nt.get(b.depthTexture).__webglTexture=H;const G=Nt.get(b);G.__hasExternalTextures=!0,G.__autoAllocateDepthBuffer=H===void 0,G.__autoAllocateDepthBuffer||jt.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),G.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(b,k){const H=Nt.get(b);H.__webglFramebuffer=k,H.__useDefaultFramebuffer=k===void 0},this.setRenderTarget=function(b,k=0,H=0){P=b,A=k,R=H;let G=!0,z=null,ot=!1,pt=!1;if(b){const wt=Nt.get(b);if(wt.__useDefaultFramebuffer!==void 0)Ot.bindFramebuffer(U.FRAMEBUFFER,null),G=!1;else if(wt.__webglFramebuffer===void 0)w.setupRenderTarget(b);else if(wt.__hasExternalTextures)w.rebindTextures(b,Nt.get(b.texture).__webglTexture,Nt.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){const Rt=b.depthTexture;if(wt.__boundDepthTexture!==Rt){if(Rt!==null&&Nt.has(Rt)&&(b.width!==Rt.image.width||b.height!==Rt.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");w.setupDepthRenderbuffer(b)}}const Bt=b.texture;(Bt.isData3DTexture||Bt.isDataArrayTexture||Bt.isCompressedArrayTexture)&&(pt=!0);const $t=Nt.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray($t[k])?z=$t[k][H]:z=$t[k],ot=!0):b.samples>0&&w.useMultisampledRTT(b)===!1?z=Nt.get(b).__webglMultisampledFramebuffer:Array.isArray($t)?z=$t[H]:z=$t,I.copy(b.viewport),$.copy(b.scissor),V=b.scissorTest}else I.copy(Ct).multiplyScalar(W).floor(),$.copy(Wt).multiplyScalar(W).floor(),V=ce;if(Ot.bindFramebuffer(U.FRAMEBUFFER,z)&&G&&Ot.drawBuffers(b,z),Ot.viewport(I),Ot.scissor($),Ot.setScissorTest(V),ot){const wt=Nt.get(b.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+k,wt.__webglTexture,H)}else if(pt){const wt=Nt.get(b.texture),Bt=k||0;U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,wt.__webglTexture,H||0,Bt)}T=-1},this.readRenderTargetPixels=function(b,k,H,G,z,ot,pt){if(!(b&&b.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let At=Nt.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&pt!==void 0&&(At=At[pt]),At){Ot.bindFramebuffer(U.FRAMEBUFFER,At);try{const wt=b.texture,Bt=wt.format,$t=wt.type;if(!ee.textureFormatReadable(Bt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ee.textureTypeReadable($t)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}k>=0&&k<=b.width-G&&H>=0&&H<=b.height-z&&U.readPixels(k,H,G,z,Kt.convert(Bt),Kt.convert($t),ot)}finally{const wt=P!==null?Nt.get(P).__webglFramebuffer:null;Ot.bindFramebuffer(U.FRAMEBUFFER,wt)}}},this.readRenderTargetPixelsAsync=async function(b,k,H,G,z,ot,pt){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let At=Nt.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&pt!==void 0&&(At=At[pt]),At){const wt=b.texture,Bt=wt.format,$t=wt.type;if(!ee.textureFormatReadable(Bt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ee.textureTypeReadable($t))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(k>=0&&k<=b.width-G&&H>=0&&H<=b.height-z){Ot.bindFramebuffer(U.FRAMEBUFFER,At);const Rt=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,Rt),U.bufferData(U.PIXEL_PACK_BUFFER,ot.byteLength,U.STREAM_READ),U.readPixels(k,H,G,z,Kt.convert(Bt),Kt.convert($t),0);const le=P!==null?Nt.get(P).__webglFramebuffer:null;Ot.bindFramebuffer(U.FRAMEBUFFER,le);const Me=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await jm(U,Me,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,Rt),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,ot),U.deleteBuffer(Rt),U.deleteSync(Me),ot}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(b,k=null,H=0){b.isTexture!==!0&&(Zr("WebGLRenderer: copyFramebufferToTexture function signature has changed."),k=arguments[0]||null,b=arguments[1]);const G=Math.pow(2,-H),z=Math.floor(b.image.width*G),ot=Math.floor(b.image.height*G),pt=k!==null?k.x:0,At=k!==null?k.y:0;w.setTexture2D(b,0),U.copyTexSubImage2D(U.TEXTURE_2D,H,0,0,pt,At,z,ot),Ot.unbindTexture()},this.copyTextureToTexture=function(b,k,H=null,G=null,z=0){b.isTexture!==!0&&(Zr("WebGLRenderer: copyTextureToTexture function signature has changed."),G=arguments[0]||null,b=arguments[1],k=arguments[2],z=arguments[3]||0,H=null);let ot,pt,At,wt,Bt,$t,Rt,le,Me;const Se=b.isCompressedTexture?b.mipmaps[z]:b.image;H!==null?(ot=H.max.x-H.min.x,pt=H.max.y-H.min.y,At=H.isBox3?H.max.z-H.min.z:1,wt=H.min.x,Bt=H.min.y,$t=H.isBox3?H.min.z:0):(ot=Se.width,pt=Se.height,At=Se.depth||1,wt=0,Bt=0,$t=0),G!==null?(Rt=G.x,le=G.y,Me=G.z):(Rt=0,le=0,Me=0);const un=Kt.convert(k.format),he=Kt.convert(k.type);let Dt;k.isData3DTexture?(w.setTexture3D(k,0),Dt=U.TEXTURE_3D):k.isDataArrayTexture||k.isCompressedArrayTexture?(w.setTexture2DArray(k,0),Dt=U.TEXTURE_2D_ARRAY):(w.setTexture2D(k,0),Dt=U.TEXTURE_2D),U.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,k.flipY),U.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),U.pixelStorei(U.UNPACK_ALIGNMENT,k.unpackAlignment);const li=U.getParameter(U.UNPACK_ROW_LENGTH),ue=U.getParameter(U.UNPACK_IMAGE_HEIGHT),Bn=U.getParameter(U.UNPACK_SKIP_PIXELS),Ps=U.getParameter(U.UNPACK_SKIP_ROWS),_n=U.getParameter(U.UNPACK_SKIP_IMAGES);U.pixelStorei(U.UNPACK_ROW_LENGTH,Se.width),U.pixelStorei(U.UNPACK_IMAGE_HEIGHT,Se.height),U.pixelStorei(U.UNPACK_SKIP_PIXELS,wt),U.pixelStorei(U.UNPACK_SKIP_ROWS,Bt),U.pixelStorei(U.UNPACK_SKIP_IMAGES,$t);const Cr=b.isDataArrayTexture||b.isData3DTexture,Ee=k.isDataArrayTexture||k.isData3DTexture;if(b.isRenderTargetTexture||b.isDepthTexture){const Qn=Nt.get(b),Lr=Nt.get(k),Rn=Nt.get(Qn.__renderTarget),Ii=Nt.get(Lr.__renderTarget);Ot.bindFramebuffer(U.READ_FRAMEBUFFER,Rn.__webglFramebuffer),Ot.bindFramebuffer(U.DRAW_FRAMEBUFFER,Ii.__webglFramebuffer);for(let Ni=0;Ni<At;Ni++)Cr&&U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Nt.get(b).__webglTexture,z,$t+Ni),b.isDepthTexture?(Ee&&U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Nt.get(k).__webglTexture,z,Me+Ni),U.blitFramebuffer(wt,Bt,ot,pt,Rt,le,ot,pt,U.DEPTH_BUFFER_BIT,U.NEAREST)):Ee?U.copyTexSubImage3D(Dt,z,Rt,le,Me+Ni,wt,Bt,ot,pt):U.copyTexSubImage2D(Dt,z,Rt,le,Me+Ni,wt,Bt,ot,pt);Ot.bindFramebuffer(U.READ_FRAMEBUFFER,null),Ot.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else Ee?b.isDataTexture||b.isData3DTexture?U.texSubImage3D(Dt,z,Rt,le,Me,ot,pt,At,un,he,Se.data):k.isCompressedArrayTexture?U.compressedTexSubImage3D(Dt,z,Rt,le,Me,ot,pt,At,un,Se.data):U.texSubImage3D(Dt,z,Rt,le,Me,ot,pt,At,un,he,Se):b.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,z,Rt,le,ot,pt,un,he,Se.data):b.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,z,Rt,le,Se.width,Se.height,un,Se.data):U.texSubImage2D(U.TEXTURE_2D,z,Rt,le,ot,pt,un,he,Se);U.pixelStorei(U.UNPACK_ROW_LENGTH,li),U.pixelStorei(U.UNPACK_IMAGE_HEIGHT,ue),U.pixelStorei(U.UNPACK_SKIP_PIXELS,Bn),U.pixelStorei(U.UNPACK_SKIP_ROWS,Ps),U.pixelStorei(U.UNPACK_SKIP_IMAGES,_n),z===0&&k.generateMipmaps&&U.generateMipmap(Dt),Ot.unbindTexture()},this.copyTextureToTexture3D=function(b,k,H=null,G=null,z=0){return b.isTexture!==!0&&(Zr("WebGLRenderer: copyTextureToTexture3D function signature has changed."),H=arguments[0]||null,G=arguments[1]||null,b=arguments[2],k=arguments[3],z=arguments[4]||0),Zr('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(b,k,H,G,z)},this.initRenderTarget=function(b){Nt.get(b).__webglFramebuffer===void 0&&w.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?w.setTextureCube(b,0):b.isData3DTexture?w.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?w.setTexture2DArray(b,0):w.setTexture2D(b,0),Ot.unbindTexture()},this.resetState=function(){A=0,R=0,P=null,Ot.reset(),xe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return vi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorspace=oe._getDrawingBufferColorSpace(t),e.unpackColorSpace=oe._getUnpackColorSpace()}}class ox extends Qe{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ai,this.environmentIntensity=1,this.environmentRotation=new Ai,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class lx{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=Kc,this.updateRanges=[],this.version=0,this.uuid=ji()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let s=0,r=this.stride;s<r;s++)this.array[t+s]=e.array[n+s];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=ji()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){return t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=ji()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const en=new N;class Uo{constructor(t,e,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)en.fromBufferAttribute(this,e),en.applyMatrix4(t),this.setXYZ(e,en.x,en.y,en.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)en.fromBufferAttribute(this,e),en.applyNormalMatrix(t),this.setXYZ(e,en.x,en.y,en.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)en.fromBufferAttribute(this,e),en.transformDirection(t),this.setXYZ(e,en.x,en.y,en.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=ii(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=ve(n,this.array)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=ve(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=ve(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=ve(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=ve(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=ii(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=ii(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=ii(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=ii(e,this.array)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=ve(e,this.array),n=ve(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,s){return t=t*this.data.stride+this.offset,this.normalized&&(e=ve(e,this.array),n=ve(n,this.array),s=ve(s,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=ve(e,this.array),n=ve(n,this.array),s=ve(s,this.array),r=ve(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this.data.array[t+3]=r,this}clone(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return new be(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new Uo(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class Id extends Cs{static get type(){return"SpriteMaterial"}constructor(t){super(),this.isSpriteMaterial=!0,this.color=new Jt(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}let qs;const Or=new N,Ks=new N,Ys=new N,js=new kt,kr=new kt,Nd=new de,no=new N,Ur=new N,io=new N,Xu=new kt,Vl=new kt,$u=new kt;class cx extends Qe{constructor(t=new Id){if(super(),this.isSprite=!0,this.type="Sprite",qs===void 0){qs=new Ie;const e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new lx(e,5);qs.setIndex([0,1,2,0,2,3]),qs.setAttribute("position",new Uo(n,3,0,!1)),qs.setAttribute("uv",new Uo(n,2,3,!1))}this.geometry=qs,this.material=t,this.center=new kt(.5,.5)}raycast(t,e){t.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Ks.setFromMatrixScale(this.matrixWorld),Nd.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),Ys.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Ks.multiplyScalar(-Ys.z);const n=this.material.rotation;let s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));const a=this.center;so(no.set(-.5,-.5,0),Ys,a,Ks,s,r),so(Ur.set(.5,-.5,0),Ys,a,Ks,s,r),so(io.set(.5,.5,0),Ys,a,Ks,s,r),Xu.set(0,0),Vl.set(1,0),$u.set(1,1);let o=t.ray.intersectTriangle(no,Ur,io,!1,Or);if(o===null&&(so(Ur.set(-.5,.5,0),Ys,a,Ks,s,r),Vl.set(0,1),o=t.ray.intersectTriangle(no,io,Ur,!1,Or),o===null))return;const l=t.ray.origin.distanceTo(Or);l<t.near||l>t.far||e.push({distance:l,point:Or.clone(),uv:Tn.getInterpolation(Or,no,Ur,io,Xu,Vl,$u,new kt),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}}function so(i,t,e,n,s,r){js.subVectors(i,e).addScalar(.5).multiply(n),s!==void 0?(kr.x=r*js.x-s*js.y,kr.y=s*js.x+r*js.y):kr.copy(js),i.copy(t),i.x+=kr.x,i.y+=kr.y,i.applyMatrix4(Nd)}class Od extends Xe{constructor(t=null,e=1,n=1,s,r,a,o,l,c=Je,h=Je,u,f){super(null,a,o,l,c,h,s,r,u,f),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class qu extends be{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){const t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}const Zs=new de,Ku=new de,ro=[],Yu=new Rs,hx=new de,zr=new Te,Fr=new is;class kd extends Te{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new qu(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,hx)}computeBoundingBox(){const t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new Rs),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Zs),Yu.copy(t.boundingBox).applyMatrix4(Zs),this.boundingBox.union(Yu)}computeBoundingSphere(){const t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new is),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Zs),Fr.copy(t.boundingSphere).applyMatrix4(Zs),this.boundingSphere.union(Fr)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){const n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=t*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(t,e){const n=this.matrixWorld,s=this.count;if(zr.geometry=this.geometry,zr.material=this.material,zr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Fr.copy(this.boundingSphere),Fr.applyMatrix4(n),t.ray.intersectsSphere(Fr)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Zs),Ku.multiplyMatrices(n,Zs),zr.matrixWorld=Ku,zr.raycast(t,ro);for(let a=0,o=ro.length;a<o;a++){const l=ro[a];l.instanceId=r,l.object=this,e.push(l)}ro.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new qu(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){const n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Od(new Float32Array(s*this.count),s,this.count,gh,ri));const r=this.morphTexture.source.data.data;let a=0;for(let c=0;c<n.length;c++)a+=n[c];const o=this.geometry.morphTargetsRelative?1:1-a,l=s*t;r[l]=o,r.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class Qr extends Cs{static get type(){return"LineBasicMaterial"}constructor(t){super(),this.isLineBasicMaterial=!0,this.color=new Jt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const zo=new N,Fo=new N,ju=new de,Br=new Mh,ao=new is,Wl=new N,Zu=new N;class Zc extends Qe{constructor(t=new Ie,e=new Qr){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[0];for(let s=1,r=e.count;s<r;s++)zo.fromBufferAttribute(e,s-1),Fo.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=zo.distanceTo(Fo);t.setAttribute("lineDistance",new Fe(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){const n=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ao.copy(n.boundingSphere),ao.applyMatrix4(s),ao.radius+=r,t.ray.intersectsSphere(ao)===!1)return;ju.copy(s).invert(),Br.copy(t.ray).applyMatrix4(ju);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=n.index,f=n.attributes.position;if(h!==null){const p=Math.max(0,a.start),v=Math.min(h.count,a.start+a.count);for(let _=p,m=v-1;_<m;_+=c){const d=h.getX(_),x=h.getX(_+1),M=oo(this,t,Br,l,d,x);M&&e.push(M)}if(this.isLineLoop){const _=h.getX(v-1),m=h.getX(p),d=oo(this,t,Br,l,_,m);d&&e.push(d)}}else{const p=Math.max(0,a.start),v=Math.min(f.count,a.start+a.count);for(let _=p,m=v-1;_<m;_+=c){const d=oo(this,t,Br,l,_,_+1);d&&e.push(d)}if(this.isLineLoop){const _=oo(this,t,Br,l,v-1,p);_&&e.push(_)}}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function oo(i,t,e,n,s,r){const a=i.geometry.attributes.position;if(zo.fromBufferAttribute(a,s),Fo.fromBufferAttribute(a,r),e.distanceSqToSegment(zo,Fo,Wl,Zu)>n)return;Wl.applyMatrix4(i.matrixWorld);const l=t.ray.origin.distanceTo(Wl);if(!(l<t.near||l>t.far))return{distance:l,point:Zu.clone().applyMatrix4(i.matrixWorld),index:s,face:null,faceIndex:null,barycoord:null,object:i}}const Ju=new N,Qu=new N;class tf extends Zc{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[];for(let s=0,r=e.count;s<r;s+=2)Ju.fromBufferAttribute(e,s),Qu.fromBufferAttribute(e,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Ju.distanceTo(Qu);t.setAttribute("lineDistance",new Fe(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Ud extends Cs{static get type(){return"PointsMaterial"}constructor(t){super(),this.isPointsMaterial=!0,this.color=new Jt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}const ef=new de,Jc=new Mh,lo=new is,co=new N;class ux extends Qe{constructor(t=new Ie,e=new Ud){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){const n=this.geometry,s=this.matrixWorld,r=t.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),lo.copy(n.boundingSphere),lo.applyMatrix4(s),lo.radius+=r,t.ray.intersectsSphere(lo)===!1)return;ef.copy(s).invert(),Jc.copy(t.ray).applyMatrix4(ef);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,u=n.attributes.position;if(c!==null){const f=Math.max(0,a.start),p=Math.min(c.count,a.start+a.count);for(let v=f,_=p;v<_;v++){const m=c.getX(v);co.fromBufferAttribute(u,m),nf(co,m,l,s,t,e,this)}}else{const f=Math.max(0,a.start),p=Math.min(u.count,a.start+a.count);for(let v=f,_=p;v<_;v++)co.fromBufferAttribute(u,v),nf(co,v,l,s,t,e,this)}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function nf(i,t,e,n,s,r,a){const o=Jc.distanceSqToPoint(i);if(o<e){const l=new N;Jc.closestPointToPoint(i,l),l.applyMatrix4(n);const c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:a})}}class wo extends Xe{constructor(t,e,n,s,r,a,o,l,c){super(t,e,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}const ho=new N,uo=new N,Xl=new N,fo=new Tn;class fx extends Ie{constructor(t=null,e=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:t,thresholdAngle:e},t!==null){const s=Math.pow(10,4),r=Math.cos(To*e),a=t.getIndex(),o=t.getAttribute("position"),l=a?a.count:o.count,c=[0,0,0],h=["a","b","c"],u=new Array(3),f={},p=[];for(let v=0;v<l;v+=3){a?(c[0]=a.getX(v),c[1]=a.getX(v+1),c[2]=a.getX(v+2)):(c[0]=v,c[1]=v+1,c[2]=v+2);const{a:_,b:m,c:d}=fo;if(_.fromBufferAttribute(o,c[0]),m.fromBufferAttribute(o,c[1]),d.fromBufferAttribute(o,c[2]),fo.getNormal(Xl),u[0]=`${Math.round(_.x*s)},${Math.round(_.y*s)},${Math.round(_.z*s)}`,u[1]=`${Math.round(m.x*s)},${Math.round(m.y*s)},${Math.round(m.z*s)}`,u[2]=`${Math.round(d.x*s)},${Math.round(d.y*s)},${Math.round(d.z*s)}`,!(u[0]===u[1]||u[1]===u[2]||u[2]===u[0]))for(let x=0;x<3;x++){const M=(x+1)%3,y=u[x],C=u[M],A=fo[h[x]],R=fo[h[M]],P=`${y}_${C}`,T=`${C}_${y}`;T in f&&f[T]?(Xl.dot(f[T].normal)<=r&&(p.push(A.x,A.y,A.z),p.push(R.x,R.y,R.z)),f[T]=null):P in f||(f[P]={index0:c[x],index1:c[M],normal:Xl.clone()})}}for(const v in f)if(f[v]){const{index0:_,index1:m}=f[v];ho.fromBufferAttribute(o,_),uo.fromBufferAttribute(o,m),p.push(ho.x,ho.y,ho.z),p.push(uo.x,uo.y,uo.z)}this.setAttribute("position",new Fe(p,3))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}}class Ah extends Ie{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const l=Math.min(a+o,Math.PI);let c=0;const h=[],u=new N,f=new N,p=[],v=[],_=[],m=[];for(let d=0;d<=n;d++){const x=[],M=d/n;let y=0;d===0&&a===0?y=.5/e:d===n&&l===Math.PI&&(y=-.5/e);for(let C=0;C<=e;C++){const A=C/e;u.x=-t*Math.cos(s+A*r)*Math.sin(a+M*o),u.y=t*Math.cos(a+M*o),u.z=t*Math.sin(s+A*r)*Math.sin(a+M*o),v.push(u.x,u.y,u.z),f.copy(u).normalize(),_.push(f.x,f.y,f.z),m.push(A+y,1-M),x.push(c++)}h.push(x)}for(let d=0;d<n;d++)for(let x=0;x<e;x++){const M=h[d][x+1],y=h[d][x],C=h[d+1][x],A=h[d+1][x+1];(d!==0||a>0)&&p.push(M,y,A),(d!==n-1||l<Math.PI)&&p.push(y,C,A)}this.setIndex(p),this.setAttribute("position",new Fe(v,3)),this.setAttribute("normal",new Fe(_,3)),this.setAttribute("uv",new Fe(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ah(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}const sf={enabled:!1,files:{},add:function(i,t){this.enabled!==!1&&(this.files[i]=t)},get:function(i){if(this.enabled!==!1)return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};class dx{constructor(t,e,n){const s=this;let r=!1,a=0,o=0,l;const c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this.itemStart=function(h){o++,r===!1&&s.onStart!==void 0&&s.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,s.onProgress!==void 0&&s.onProgress(h,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){const u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,f=c.length;u<f;u+=2){const p=c[u],v=c[u+1];if(p.global&&(p.lastIndex=0),p.test(h))return v}return null}}}const px=new dx;class wh{constructor(t){this.manager=t!==void 0?t:px,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(t,e){const n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}}wh.DEFAULT_MATERIAL_NAME="__DEFAULT";class mx extends wh{constructor(t){super(t)}load(t,e,n,s){this.path!==void 0&&(t=this.path+t),t=this.manager.resolveURL(t);const r=this,a=sf.get(t);if(a!==void 0)return r.manager.itemStart(t),setTimeout(function(){e&&e(a),r.manager.itemEnd(t)},0),a;const o=da("img");function l(){h(),sf.add(t,this),e&&e(this),r.manager.itemEnd(t)}function c(u){h(),s&&s(u),r.manager.itemError(t),r.manager.itemEnd(t)}function h(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),t.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),r.manager.itemStart(t),o.src=t,o}}class gx extends wh{constructor(t){super(t)}load(t,e,n,s){const r=new Xe,a=new mx(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(t,function(o){r.image=o,r.needsUpdate=!0,e!==void 0&&e(r)},n,s),r}}class vx{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=rf(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const e=rf();t=(e-this.oldTime)/1e3,this.oldTime=e,this.elapsedTime+=t}return t}}function rf(){return performance.now()}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:fh}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=fh);const wi=11,Rh=16,Qc=27,zd=11,_x=["RicoReWi","YourTime-FM","RapRadio 24","SchlagerPop 24","ChartRadio 24","ClubRadio 24","AnMaCha 24","RadioFloh!","RockRadio 24","ChristmasRadio","KultRadio 24","Zocker-FM","Special-Radio","AnMaChaCast","SenderWelt","RadioPortal"],xx=[{id:"natur",name:"Natur"},{id:"erz",name:"Erze & Steine"},{id:"bau",name:"Bauen"},{id:"form",name:"Formen"},{id:"deko",name:"Deko"},{id:"licht",name:"Licht"},{id:"spezial",name:"Spezial"},{id:"technik",name:"Funktechnik"},{id:"funk",name:"Funk-Logos"}],Jn=[[0,"AIR","Luft","",null,{solid:0,opaque:0,inv:0}],[1,"GRASS","Gras","natur",[0,1,2],{hard:.6,tool:"schaufel",color:5808188,map:[88,160,60],icon:1}],[2,"DIRT","Erde","natur",[2,2,2],{hard:.5,tool:"schaufel",color:8806463,map:[134,96,63],icon:2}],[3,"STONE","Stein","erz",[3,3,3],{hard:1.5,tool:"spitzhacke",color:8158336,map:[124,124,128],icon:3}],[4,"SAND","Sand","natur",[4,4,4],{hard:.5,tool:"schaufel",color:14404494,map:[219,203,142],icon:4}],[5,"WOOD","Holz","natur",[6,5,6],{hard:1,tool:"axt",color:6836270,map:[104,80,46],icon:5}],[6,"LEAVES","Blätter","natur",[7,7,7],{opaque:0,self:1,hard:.2,color:3833904,map:[46,120,44],icon:7}],[7,"PLANKS","Bretter","bau",[8,8,8],{hard:1,tool:"axt",color:11306578,map:[172,134,82],icon:8}],[8,"GLASS","Glas","bau",[9,9,9],{opaque:0,trans:1,hard:.3,color:13625584,map:[200,230,240],icon:9}],[9,"LAMP","Leuchtblock","licht",[10,10,10],{emit:1,hard:.3,color:16767098,map:[255,214,120],icon:10}],[10,"WATER","Wasser","",[11,11,11],{solid:0,opaque:0,trans:1,inv:0,map:[44,100,200]}],[27,"FEDER","Federblock","spezial",[12,13,13],{hard:.5,color:16738976,map:[255,100,160],icon:12}],[28,"TURBO","Turbo-Block","spezial",[14,15,15],{hard:.8,color:16766504,map:[255,214,40],icon:14}],[29,"WIND","Aufwind-Block","spezial",[16,17,17],{hard:.5,color:5294318,map:[80,200,235],icon:16}],[30,"RADIO","Radio-Block","spezial",[19,18,19],{hard:.5,color:3817034,map:[60,64,76],icon:18}],[31,"RAINBOW","Regenbogen-Block","licht",[20,20,20],{emit:2,hard:.5,color:14509823,map:[220,100,255],icon:20}],[32,"NEON_R","Neonrot","licht",[21,21,21],{emit:1,hard:.3,color:16721990,map:[255,40,70],icon:21}],[33,"NEON_B","Neonblau","licht",[22,22,22],{emit:1,hard:.3,color:2657535,map:[40,140,255],icon:22}],[34,"NEON_G","Neongrün","licht",[23,23,23],{emit:1,hard:.3,color:3342200,map:[50,255,120],icon:23}],[35,"NEON_P","Neonlila","licht",[24,24,24],{emit:1,hard:.3,color:12470015,map:[190,70,255],icon:24}],[36,"BRICK","Ziegel","bau",[25,25,25],{hard:1.5,tool:"spitzhacke",color:10111544,map:[154,74,56],icon:25}],[37,"MARBLE","Marmor","bau",[26,26,26],{hard:1.5,tool:"spitzhacke",color:15132398,map:[232,232,240],icon:26}],[38,"SNOW","Schnee","natur",[27,28,2],{hard:.4,tool:"schaufel",color:15922938,map:[240,246,250],icon:27}],[39,"ICE","Eis","natur",[29,29,29],{hard:.6,tool:"spitzhacke",color:11064560,map:[168,212,240],icon:29}],[40,"GRAVEL","Kies","erz",[30,30,30],{hard:.6,tool:"schaufel",color:9078402,map:[138,134,130],icon:30}],[41,"CLAY","Ton","natur",[31,31,31],{hard:.6,tool:"schaufel",color:10134708,map:[154,164,180],icon:31}],[42,"SPRUCE","Fichtenholz","natur",[33,32,33],{hard:1,tool:"axt",color:4863008,map:[74,52,32],icon:32}],[43,"NEEDLES","Fichtennadeln","natur",[34,34,34],{opaque:0,self:1,hard:.2,color:2775606,map:[36,84,50],icon:34}],[44,"CACTUS","Kaktus","natur",[36,35,36],{hard:.4,color:3967546,map:[60,138,58],icon:35}],[45,"COAL","Kohleerz","erz",[37,37,37],{hard:2,tool:"spitzhacke",color:3816e3,map:[70,70,78],icon:37,tier:1}],[46,"COPPER","Kupfererz","erz",[38,38,38],{hard:2.2,tool:"spitzhacke",color:13136956,map:[200,116,60],icon:38,tier:1}],[47,"IRON","Eisenerz","erz",[39,39,39],{hard:2.6,tool:"spitzhacke",color:13150344,map:[200,168,136],icon:39,tier:2}],[48,"CRYSTAL","Funkkristall","erz",[40,40,40],{emit:1,hard:2.4,tool:"spitzhacke",color:7006463,map:[106,232,255],icon:40,tier:2}],[49,"MUD","Schlamm","natur",[41,41,41],{hard:.5,tool:"schaufel",color:5128756,map:[78,66,52],icon:41}],[50,"FLOWERS","Blütenwiese","natur",[42,1,2],{hard:.6,tool:"schaufel",color:6991946,map:[150,170,90],icon:42}],[51,"BASALT","Basalt","erz",[43,43,43],{hard:1.8,tool:"spitzhacke",color:3421242,map:[52,52,58],icon:43}],[52,"MAGMA","Magma","erz",[44,44,44],{emit:1,hard:1.2,tool:"spitzhacke",color:16738842,map:[255,106,26],icon:44}],[53,"SHROOM","Pilzhut","natur",[45,45,45],{hard:.3,color:13122106,map:[200,58,58],icon:45}],[54,"MYCEL","Pilzboden","natur",[46,47,2],{hard:.6,tool:"schaufel",color:8022656,map:[122,106,128],icon:46}],[55,"SANDSTONE","Sandstein","bau",[48,48,48],{hard:1.2,tool:"spitzhacke",color:14205066,map:[216,192,138],icon:48}],[56,"STEM","Pilzstiel","natur",[49,49,49],{hard:.6,tool:"axt",color:15261904,map:[232,224,208],icon:49}],[57,"JLEAVES","Dschungelblätter","natur",[50,50,50],{opaque:0,self:1,hard:.2,color:3050020,map:[40,130,34],icon:50}],[58,"WORKBENCH","Werkbank","bau",[51,52,8],{hard:1.2,tool:"axt",color:10122308,map:[150,112,66],icon:51,station:"werkbank"}],[59,"FURNACE","Schmelzofen","bau",[54,53,54],{hard:2,tool:"spitzhacke",color:6974064,map:[110,110,116],icon:53,station:"ofen"}],[60,"WOOL","Wolle","bau",[55,55,55],{hard:.4,color:15657698,map:[236,232,224],icon:55}],[61,"FARMLAND","Ackerboden","natur",[56,2,2],{hard:.5,tool:"schaufel",color:5914150,map:[96,66,40],icon:56}],[62,"WHEAT0","Weizen (Keim)","",[57,57,57],{shape:"cross",solid:0,opaque:0,inv:0,hard:0,color:6991936,map:[100,150,60]}],[63,"WHEAT1","Weizen (jung)","",[58,58,58],{shape:"cross",solid:0,opaque:0,inv:0,hard:0,color:8041536,map:[110,160,60]}],[64,"WHEAT2","Weizen (grün)","",[59,59,59],{shape:"cross",solid:0,opaque:0,inv:0,hard:0,color:10530880,map:[150,170,60]}],[65,"WHEAT3","Weizen (reif)","",[60,60,60],{shape:"cross",solid:0,opaque:0,inv:0,hard:0,color:14202960,map:[216,184,80]}],[66,"PATH","Dorfweg","bau",[61,2,2],{hard:.5,tool:"schaufel",color:10126946,map:[150,132,100],icon:61}],[67,"COBBLE","Bruchstein","bau",[62,62,62],{hard:1.6,tool:"spitzhacke",color:8421510,map:[120,120,126],icon:62}],[68,"SWITCH","Schalter","technik",[63,63,63],{hard:.5,color:9079440,map:[140,140,146],icon:63}],[69,"SWITCH_ON","Schalter (an)","",[64,64,64],{hard:.5,color:9079440,map:[140,160,146],inv:0,drop:68}],[70,"WIRE","Signalleitung","technik",[65,65,65],{hard:.5,color:14188604,map:[200,120,60],icon:65}],[71,"SENDER","Funksender","technik",[66,67,62],{hard:.8,color:3817034,map:[80,200,240],icon:67}],[72,"RELAY","Funkrelais","technik",[68,68,68],{hard:.8,color:4869722,map:[110,200,230],icon:68}],[73,"RECEIVER","Empfänger","technik",[69,69,69],{hard:.8,color:3159102,map:[70,74,86],icon:69}],[74,"RECEIVER_ON","Empfänger (an)","",[70,70,70],{hard:.8,color:3159102,map:[90,230,140],inv:0,drop:73,emit:1}],[75,"SIGLAMP","Signallampe","technik",[71,71,71],{hard:.3,color:6969920,map:[110,92,66],icon:71}],[76,"SIGLAMP_ON","Signallampe (an)","",[72,72,72],{hard:.3,color:16767098,map:[255,220,120],inv:0,drop:75,emit:1}],[77,"GATE","Funktor","technik",[73,73,73],{hard:2,tool:"spitzhacke",color:11843262,map:[170,172,180],icon:73}],[78,"GATE_OPEN","Funktor (offen)","",[74,74,74],{solid:0,opaque:0,hard:2,tool:"spitzhacke",color:11843262,map:[130,132,140],inv:0,drop:77}],[79,"RAIL","Schiene","technik",[75,75,75],{shape:"flat",solid:0,opaque:0,hard:.4,color:9075306,map:[140,120,100],icon:75}]];Jn.push([80,"STONEBRICK","Steinziegel","bau",[76,76,76],{hard:1.5,tool:"spitzhacke",color:9079954,map:[138,140,146],icon:76}],[81,"SMOOTH","Glattstein","bau",[77,77,77],{hard:1.5,tool:"spitzhacke",color:10790572,map:[164,166,172],icon:77}],[82,"DARKPLANKS","Dunkle Bretter","bau",[78,78,78],{hard:1,tool:"axt",color:5650980,map:[86,58,36],icon:78}],[83,"BIRCH","Birkenbretter","bau",[79,79,79],{hard:1,tool:"axt",color:14205070,map:[216,192,142],icon:79}],[84,"ROOF","Dachziegel","bau",[80,80,80],{hard:1.2,tool:"spitzhacke",color:11029046,map:[168,74,54],icon:80}],[85,"BOOKS","Bücherregal","bau",[8,81,8],{hard:1,tool:"axt",color:9067060,map:[138,90,52],icon:81}],[86,"LANTERN","Laterne","licht",[82,82,82],{emit:1,hard:.5,color:16764006,map:[255,204,102],icon:82}],[87,"COPPERBLOCK","Kupferblock","bau",[83,83,83],{hard:2,tool:"spitzhacke",color:13136956,map:[210,124,72],icon:83}],[88,"IRONBLOCK","Eisenblock","bau",[84,84,84],{hard:2.4,tool:"spitzhacke",color:13159122,map:[200,202,210],icon:84}],[89,"HAY","Strohballen","natur",[86,85,86],{hard:.4,color:14201936,map:[216,180,80],icon:85}]);["weiß","schwarz","rot","orange","gelb","grün","blau","lila"].forEach((i,t)=>{const e=[[236,238,240],[36,38,44],[190,44,44],[232,120,30],[240,200,40],[70,160,60],[40,90,190],[130,60,180]][t];Jn.push([90+t,"CONCRETE"+t,"Beton "+i,"bau",[87+t,87+t,87+t],{hard:1.4,tool:"spitzhacke",color:e[0]<<16|e[1]<<8|e[2],map:e,icon:87+t}])});["rot","blau","grün"].forEach((i,t)=>{const e=[[220,60,70],[70,120,230],[70,200,110]][t];Jn.push([98+t,"STAINED"+t,"Buntglas "+i,"bau",[95+t,95+t,95+t],{trans:1,hard:.3,color:e[0]<<16|e[1]<<8|e[2],map:e,icon:95+t}])});const Fd=[["PLANKS","Bretter",7,8],["COBBLE","Bruchstein",67,62],["BRICK","Ziegel",36,25],["STONEBRICK","Steinziegel",80,76],["SANDSTONE","Sandstein",55,48],["MARBLE","Marmor",37,26],["DARKPLANKS","Dunkle Bretter",82,78],["SMOOTH","Glattstein",81,77]],Mx=i=>Jn.find(t=>t[0]===i)[5];Fd.forEach(([i,t,e,n],s)=>{const r=Mx(e),a={hard:r.hard,tool:r.tool,color:r.color,map:r.map,opaque:0,icon:n};Jn.push([101+s,i+"_SLAB",t+"-Stufe","form",[n,n,n],{...a,shape:"slab",full:e}]);for(let o=0;o<4;o++)Jn.push([109+s*4+o,i+"_STAIRS"+(o||""),t+"-Treppe",o?"":"form",[n,n,n],{...a,shape:"stair",dir:o,inv:o?0:1,drop:o?109+s*4:0}])});Jn.push([141,"FENCE","Holzzaun","form",[8,8,8],{shape:"fence",opaque:0,hard:1,tool:"axt",color:11306578,map:[172,134,82],icon:8}],[142,"WALL","Steinmauer","form",[62,62,62],{shape:"wall",opaque:0,hard:1.6,tool:"spitzhacke",color:8421510,map:[120,120,126],icon:62}],[143,"PANE","Glasscheibe","form",[9,9,9],{shape:"pane",trans:1,hard:.3,color:13625584,map:[200,230,240],icon:9}],[144,"DOOR","Holztür","form",[8,98,8],{shape:"door",opaque:0,hard:1,tool:"axt",color:10119740,map:[154,106,60],icon:98}],[145,"DOOR_OPEN","Holztür (offen)","",[8,98,8],{shape:"door",opaque:0,solid:0,hard:1,tool:"axt",color:10119740,map:[154,106,60],inv:0,drop:144}],[146,"LADDER","Leiter","form",[99,99,99],{shape:"ladder",opaque:0,solid:0,hard:.4,tool:"axt",color:9068596,map:[138,96,52],icon:99}]);const Ls=[["chair","Stuhl","🪑",0,0,0,0,8],["armchair","Sessel","🛋️",0,0,0,0,55],["stool","Hocker","🪑",0,0,0,0,8],["couch","Sofa","🛋️",0,0,0,0,55],["table","Tisch","🍽️",.8,0,0,.8,8],["tablelong","Langer Tisch","🍽️",.63,0,0,.63,8],["bed","Bett","🛏️",0,0,0,0,55],["cabinet","Kommode","🗄️",.9,0,0,.9,8],["shelf","Regal","📚",.78,0,0,.78,8],["lamp","Stehlampe","💡",0,0,1,0,10],["tablelamp","Tischlampe","💡",0,0,1,0,10],["books","Bücherstapel","📚",0,0,0,0,81],["picture","Bilderrahmen","🖼️",0,1,0,0,8],["rug","Teppich","🟥",0,0,0,0,55],["bench","Parkbank","🪑",0,0,0,0,8],["streetlight","Straßenlaterne","🏮",0,0,1,0,84],["trafficlight","Ampel","🚦",0,0,1,0,84],["hydrant","Hydrant","🧯",0,0,0,0,89],["trash","Müllcontainer","🗑️",.56,0,0,.56,84],["bush","Busch","🌳",0,0,0,0,7],["barrel","Fass","🛢️",1,0,0,1,5],["chest","Truhe","🧰",.73,0,0,.73,8],["keg","Bierfass","🍺",.97,0,0,.97,5],["candles","Kerzen","🕯️",0,0,1,0,10],["torch","Wandfackel","🔥",0,1,1,0,10],["banner","Banner","🚩",0,1,0,0,55],["crates","Kistenstapel","📦",.95,0,0,.95,8]],Bd=147;Ls.forEach(([i,t,e,n,s,r,a,o],l)=>{Jn.push([Bd+l,"DECO_"+i.toUpperCase(),t,"deko",[o,o,o],{shape:"deco",opaque:0,solid:n?1:0,emit:r?1:0,hard:.5,emoji:e,icon:o,color:10123866,map:[150,120,90]}])});for(let i=0;i<Rh;i++)Jn.push([wi+i,"LOGO"+(i+1),_x[i],"funk",null,{logo:1,hard:.5,color:1712192,map:[60,70,110]}]);Jn.sort((i,t)=>i[0]-t[0]);const Di=256,Ht=[],g={},pa=[],ma=new Uint8Array(Di),gn=new Uint8Array(Di),Hd=new Uint8Array(Di),ga=new Float32Array(Di),Ro=new Uint8Array(Di),Gd=new Uint8Array(Di),Vd=new Uint8Array(Di),Wd=new Uint8Array(Di),yx=["","slab","stair","fence","wall","pane","door","ladder","deco"],bn=new Uint8Array(Di),ir={};for(const[i,t,e,n,s,r]of Jn){if(Ht[i])throw new Error("Block-Id doppelt: "+i);const a={id:i,key:t,name:e,cat:n,tiles:s,solid:1,opaque:1,trans:0,self:0,emit:0,hard:1,tool:null,color:14540253,map:[200,200,210],icon:0,inv:1,logo:0,station:null,tier:0,shape:null,drop:0,dir:0,full:0,...r};a.trans&&(a.opaque=0),Ht[i]=a,g[t]=i,pa[i]=e,ma[i]=a.solid,gn[i]=a.opaque,Ro[i]=a.trans,Gd[i]=a.self,ga[i]=a.emit,Vd[i]=a.shape==="cross"?1:0,Wd[i]=a.shape==="flat"?1:0,bn[i]=Math.max(0,yx.indexOf(a.shape||"")),Hd[i]=a.opaque||a.self?1:0,s&&(ir[i]=s)}const Qo=i=>i>=wi&&i<wi+Rh;pa.slice(Qc,Qc+zd);const Sx=Ht.filter(i=>i&&i.inv).map(i=>i.id);function Ex(i,t){const e=-Math.sin(t),n=-Math.cos(t),s=Math.abs(e)>Math.abs(n)?e>0?1:3:n>0?2:0;return i+s}function af(i,t){return Math.abs(i)>Math.abs(t)?i>0?1:3:t>0?0:2}const br=[];Ls.forEach((i,t)=>{br[Bd+t]=t,i.solid=i[3],i.wall=i[4],i.emit=i[5],i.top=i[6]});const va=[g.WHEAT0,g.WHEAT1,g.WHEAT2,g.WHEAT3],F=16,ie=96,se=24,bx=8,of=16;function Qt(i,t,e){let n=Math.imul(i|0,668265261)^Math.imul(t|0,374761393)^Math.imul(e|0,2654435761);return n=Math.imul(n^n>>>15,2246822507),n=Math.imul(n^n>>>13,3266489909),n^=n>>>16,(n>>>0)/4294967296}function Tx(i,t,e){const n=Math.floor(i),s=Math.floor(t),r=i-n,a=t-s,o=r*r*(3-2*r),l=a*a*(3-2*a),c=Qt(n,s,e),h=Qt(n+1,s,e),u=Qt(n,s+1,e),f=Qt(n+1,s+1,e);return c+(h-c)*o+(u-c)*l+(c-h-u+f)*o*l}function Ye(i,t,e,n){let s=0,r=.5,a=1,o=0;for(let l=0;l<n;l++)s+=r*Tx(i*a,t*a,e+l*101),o+=r,r*=.5,a*=2;return s/o}const Pt={OCEAN:0,BEACH:1,PLAINS:2,FOREST:3,TAIGA:4,MOUNTAINS:5,SNOW:6,DESERT:7,SWAMP:8,JUNGLE:9,MEADOW:10,VOLCANO:11,MUSHROOM:12,CRYSTAL:13,COAST:14},Ax=["Meer","Strand","Grüne Ebene","Laubwald","Nadelwald","Berge","Schneegebiet","Wüste","Sumpf","Dschungel","Blumenwiese","Vulkanregion","Pilzwald","Kristallgebiet","Felsküste"],Js=[[40,90,180],[222,206,146],[110,176,70],[52,122,46],[44,96,70],[130,130,136],[236,242,248],[228,200,120],[78,98,60],[36,140,40],[170,190,90],[70,50,50],[130,100,140],[110,220,240],[120,118,112]],wx=[Pt.PLAINS,Pt.FOREST,Pt.MEADOW],ms=(i,t,e)=>{const n=Math.max(0,Math.min(1,(e-i)/(t-i)));return n*n*(3-2*n)},$l=i=>Math.max(0,Math.min(1,(i-.5)*2.4+.5)),lf=se-14,Rx=6,Cx=5,ra=5;function Ri(i,t,e,n){const s=Ye(t/640,e/640,i+1,4),r=ms(.4,.5,s),a=Ye(t/52,e/52,i+3,3),o=ms(.56,.72,Ye(t/300,e/300,i+2,3))*r,l=$l(Ye(t/520,e/520,i+11,3))+(Qt(t,e,i+5)-.5)*.05,c=$l(Ye(t/480,e/480,i+23,3))+(Qt(t,e,i+6)-.5)*.05,h=$l(Ye(t/360,e/360,i+37,2));let u=(se-13+a*8)*(1-r)+(se+2+a*12)*r;if(o>0){const M=1-Math.abs(Ye(t/80,e/80,i+4,2)*2-1);u+=o*(12+M*36)}const f=ms(.74,.82,c)*ms(.42,.5,l)*(1-ms(0,.2,o))*r;f>0&&(u+=(se+(a<.45?-1:1)-u)*f);const p=l>.6?ms(.86,.98,h)*r*(1-f):0;p>0&&(u+=p*26-ms(.8,.95,p)*5),u=Math.max(2,Math.min(ie-12,Math.floor(u)));const v=l-Math.max(0,u-(se+18))*.012;let _;f>.5?_=Pt.SWAMP:u<se?_=Pt.OCEAN:p>.05?_=Pt.VOLCANO:o>.3&&u>se+18?_=Pt.MOUNTAINS:u<=se+1?_=v<.32||o>.15?Pt.COAST:Pt.BEACH:h>.86?_=c>.5?Pt.MUSHROOM:Pt.CRYSTAL:v<.16?_=Pt.SNOW:v<.3?_=Pt.TAIGA:v>.7&&c<.4?_=Pt.DESERT:v>.66&&c>.62?_=Pt.JUNGLE:c>.56?_=Pt.FOREST:Ye(t/110,e/110,i+41,2)>.6?_=Pt.MEADOW:_=Pt.PLAINS,n.h=u,n.biome=_,n.t=v,n.u=c,n.d=a,n.volc=p;const m=u<se+6,d=m?Math.min(u-5,lf):u;n.t0lo=n.t1lo=n.cvlo=1e9,n.t0hi=n.t1hi=n.cvhi=-1,n.lake=!1,n.open=!1;for(let M=0;M<2;M++){const y=Math.abs(Ye(t/64,e/64,i+50+M*7,2)-.5);if(y>=.024)continue;const C=8+M*13+Ye(t/90,e/90,i+60+M,2)*16,A=1.4+(1-y/.024)*1.6,R=Math.max(Rx,Math.ceil(C-A)),P=Math.min(d,Math.floor(C+A*.75));P<R||(M===0?(n.t0lo=R,n.t0hi=P):(n.t1lo=R,n.t1hi=P),P>=u&&(n.open=!0))}const x=Ye(t/36,e/36,i+70,2);if(x>.66){const M=Math.min(u-6,m?lf:ie,ra+Math.floor((x-.66)*55));M>=ra&&(n.cvlo=ra,n.cvhi=M,n.lake=Ye(t/200,e/200,i+71,2)>.52)}return n}function cf(i,t,e,n){const s=i.h,r=i.d;switch(i.biome){case Pt.OCEAN:return[r>.62?g.GRAVEL:r<.32?g.CLAY:g.SAND,g.SAND,3,g.STONE,0,g.STONE];case Pt.BEACH:return[g.SAND,g.SAND,4,g.SANDSTONE,3,g.STONE];case Pt.COAST:return[g.GRAVEL,g.STONE,2,g.STONE,0,g.STONE];case Pt.MEADOW:return[g.FLOWERS,g.DIRT,3,g.STONE,0,g.STONE];case Pt.SNOW:return[g.SNOW,g.DIRT,3,g.STONE,0,g.STONE];case Pt.MOUNTAINS:return s>se+44?[g.SNOW,g.STONE,1,g.STONE,0,g.STONE]:s<se+26?[g.GRASS,g.DIRT,2,g.STONE,0,g.STONE]:[r>.6?g.GRAVEL:g.STONE,g.STONE,1,g.STONE,0,g.STONE];case Pt.DESERT:return[g.SAND,g.SAND,4,g.SANDSTONE,3,g.STONE];case Pt.SWAMP:return[Qt(e,n,t+8)<.4?g.MUD:g.GRASS,g.MUD,2,g.DIRT,2,g.STONE];case Pt.VOLCANO:return[r>.74||Ye(e/14,n/14,t+9,2)>.7?g.MAGMA:g.BASALT,g.BASALT,4,g.STONE,0,g.STONE];case Pt.MUSHROOM:return[g.MYCEL,g.DIRT,3,g.STONE,0,g.STONE];case Pt.CRYSTAL:return[r>.55?g.GRAVEL:g.STONE,g.STONE,1,g.STONE,0,g.STONE];default:return[g.GRASS,g.DIRT,3,g.STONE,0,g.STONE]}}const Un=[];Un[Pt.PLAINS]=["oak",.004];Un[Pt.FOREST]=["oak",.035];Un[Pt.MEADOW]=["oak",.002];Un[Pt.TAIGA]=["spruce",.03];Un[Pt.SNOW]=["spruce",.008];Un[Pt.MOUNTAINS]=["spruce",.006];Un[Pt.JUNGLE]=["jungle",.045];Un[Pt.SWAMP]=["oak",.012];Un[Pt.DESERT]=["cactus",.006];Un[Pt.MUSHROOM]=["mushroom",.012];Un[Pt.CRYSTAL]=["spire",.012];const Lx=new Set([g.GRASS,g.DIRT,g.SNOW,g.FLOWERS,g.MUD,g.MYCEL,g.SAND,g.STONE,g.GRAVEL]),Wn=3,ei=F+2*Wn,po=Array.from({length:ei*ei},()=>({}));function Dx(i,t,e,n){const s=t*F,r=e*F;for(let h=0;h<ei;h++)for(let u=0;u<ei;u++)Ri(i,s+u-Wn,r+h-Wn,po[h*ei+u]);let a=se;const o=(h,u,f)=>h+f*F+u*F*F;for(let h=0;h<F;h++)for(let u=0;u<F;u++){const f=po[(h+Wn)*ei+u+Wn],p=f.h,v=s+u,_=r+h,[m,d,x,M,y,C]=cf(f,i,v,_);for(let A=0;A<=p;A++){const R=p-A;n[o(u,A,h)]=A===0?g.STONE:R===0?m:R<=x?d:R<=x+y?M:C}for(let A=p+1;A<=se;A++)n[o(u,A,h)]=A===se&&f.t<.16&&f.biome!==Pt.SWAMP?g.ICE:g.WATER;p>a&&(a=p)}for(let h=0;h<F;h++)for(let u=0;u<F;u++){const f=po[(h+Wn)*ei+u+Wn];for(let p=f.t0lo;p<=f.t0hi;p++)n[o(u,p,h)]=g.AIR;for(let p=f.t1lo;p<=f.t1hi;p++)n[o(u,p,h)]=g.AIR;if(f.cvhi>=0){for(let p=f.cvlo;p<=f.cvhi;p++)n[o(u,p,h)]=g.AIR;if(f.lake)n[o(u,Cx,h)]=g.WATER;else if(Qt(s+u,r+h,i+72)<(f.biome===Pt.CRYSTAL?.22:.04)){const p=1+Math.floor(Qt(s+u,r+h,i+73)*3);for(let v=ra;v<ra+p&&v<=f.cvhi;v++)n[o(u,v,h)]=g.CRYSTAL}}}const l=(h,u,f,p,v,_)=>{for(let m=0;m<u;m++){const d=C=>Qt(t*31+m*7+C,e*17-m,i+_);let x=Math.floor(d(1)*F),M=Math.floor(d(2)*F),y=f+Math.floor(d(3)*(p-f));for(let C=0;C<v;C++){const A=o(x,y,M);n[A]===g.STONE&&(n[A]=h);const R=Math.floor(d(4+C)*6),P=R&1?1:-1;R<2?x=Math.max(0,Math.min(F-1,x+P)):R<4?M=Math.max(0,Math.min(F-1,M+P)):y=Math.max(1,Math.min(ie-1,y+P))}}};l(g.COAL,16,6,70,6,80),l(g.COPPER,9,4,44,5,81),l(g.IRON,7,2,30,4,82),l(g.CRYSTAL,2,2,14,3,83);const c=(h,u,f,p,v)=>{if(h<0||h>=F||f<0||f>=F||u<1||u>=ie)return;const _=o(h,u,f);(v||n[_]===g.AIR)&&(n[_]=p,u>a&&(a=u))};for(let h=0;h<ei;h++)for(let u=0;u<ei;u++){const f=po[h*ei+u],p=Un[f.biome];if(!p||f.open||f.h<=se)continue;const v=s+u-Wn,_=r+h-Wn;if(Qt(v,_,i+99)>=p[1])continue;const m=u-Wn,d=h-Wn,x=f.h,M=Qt(v,_,i+7),y=cf(f,i,v,_)[0];if(Lx.has(y))if(p[0]==="cactus"){if(y!==g.SAND)continue;const C=1+Math.floor(M*3);for(let A=1;A<=C;A++)c(m,x+A,d,g.CACTUS)}else if(p[0]==="spire"){const C=2+Math.floor(M*4);for(let A=1;A<=C;A++)c(m,x+A,d,g.CRYSTAL);c(m+(M<.5?1:-1),x+1,d,g.CRYSTAL)}else if(p[0]==="mushroom"){const C=4+Math.floor(M*3);for(let A=1;A<=C;A++)c(m,x+A,d,g.STEM,!0);for(let A=-2;A<=2;A++)for(let R=-2;R<=2;R++){const P=Math.abs(R)===2&&Math.abs(A)===2;P||c(m+R,x+C+1,d+A,g.SHROOM),!P&&(Math.abs(R)===2||Math.abs(A)===2)&&c(m+R,x+C,d+A,g.SHROOM)}}else if(p[0]==="spruce"){const C=6+Math.floor(M*4),A=x+C+1;for(let R=1;R<=C;R++)c(m,x+R,d,g.SPRUCE,!0);for(let R=x+3;R<=A;R++){const P=Math.min(3,Math.floor((A-R)/2.2+(R%2?.4:0)));for(let T=-P;T<=P;T++)for(let E=-P;E<=P;E++)E*E+T*T<=P*P+.5&&c(m+E,R,d+T,g.NEEDLES)}}else if(p[0]==="jungle"){const C=8+Math.floor(M*5);for(let A=1;A<=C;A++)c(m,x+A,d,g.WOOD,!0);for(let A=-1;A<=1;A++){const R=A===1?2:3;for(let P=-R;P<=R;P++)for(let T=-R;T<=R;T++)T*T+P*P>R*R+1||R===3&&Qt(v+T,_+P+A,i+3)<.25||c(m+T,x+C+A,d+P,g.JLEAVES)}}else{const C=4+Math.floor(M*3);for(let A=1;A<=C;A++)c(m,x+A,d,g.WOOD,!0);for(let A=C-2;A<=C+1;A++){const R=A>=C?1:2;for(let P=-R;P<=R;P++)for(let T=-R;T<=R;T++)R===2&&Math.abs(T)===2&&Math.abs(P)===2&&Qt(v+T,_+P+A,i+3)<.5||c(m+T,x+A,d+P,g.LEAVES)}}}return Math.min(ie-1,a)}const hf=24,uf=4096,ta={[g.SWITCH]:"switch",[g.SWITCH_ON]:"switch",[g.WIRE]:"wire",[g.SENDER]:"sender",[g.RELAY]:"relay",[g.RECEIVER]:"receiver",[g.RECEIVER_ON]:"receiver",[g.SIGLAMP]:"machine",[g.SIGLAMP_ON]:"machine",[g.GATE]:"machine",[g.GATE_OPEN]:"machine"},ql=new Set(Object.keys(ta).map(Number)),ff={[g.RECEIVER]:g.RECEIVER_ON,[g.SIGLAMP]:g.SIGLAMP_ON,[g.GATE]:g.GATE_OPEN},Px={[g.RECEIVER_ON]:g.RECEIVER,[g.SIGLAMP_ON]:g.SIGLAMP,[g.GATE_OPEN]:g.GATE},Ix=(i,t,e)=>i+","+t+","+e,Nx=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];function Ox(i){const t=new Set,e=new Set,n=new Set,s=new Map,r=[],a=[];for(const[v,_]of i){const m=ta[_[3]];(m==="relay"||m==="receiver")&&a.push(v),_[3]===g.SWITCH_ON&&(e.add(v),r.push(v))}let o=0,l=0,c=0,h=0,u=0;const f=hf*hf;let p=0;for(;p<r.length&&!(++o>uf);){const v=r[p++],_=i.get(v),m=ta[_[3]];if(m==="sender"||m==="relay"){const d=s.get(v);for(const x of a){if(x===v)continue;const M=i.get(x),y=M[0]-_[0],C=M[1]-_[1],A=M[2]-_[2];if(y*y+C*C+A*A>f)continue;const R=ta[M[3]];R==="relay"&&!n.has(x)?(n.add(x),s.set(x,d),r.push(x)):R==="receiver"&&!e.has(x)&&(e.add(x),t.add(x),c++,r.push(x),l=Math.max(l,Math.hypot(M[0]-d[0],M[1]-d[1],M[2]-d[2])))}continue}for(const[d,x,M]of Nx){const y=Ix(_[0]+d,_[1]+x,_[2]+M),C=i.get(y);if(!C)continue;const A=ta[C[3]];A==="wire"&&!e.has(y)?(e.add(y),r.push(y)):A==="sender"&&!n.has(y)?(n.add(y),s.set(y,C),u++,r.push(y)):A==="machine"&&!t.has(y)&&(t.add(y),h++)}}return{on:t,receivers:c,machines:h,senders:u,reach:l,capped:o>uf}}const _a=160,$n=20,th=4,kx=new Set([Pt.PLAINS,Pt.FOREST,Pt.MEADOW,Pt.TAIGA,Pt.SNOW,Pt.DESERT]),Ux=[{key:"bauer",name:"Bäuerin Frieda"},{key:"schmied",name:"Schmied Kalle"},{key:"funker",name:"Funkerin Lotte"},{key:"hirte",name:"Hirte Mats"}],zx=[[0,-1],[1,0],[0,1],[-1,0]],Hr=new Map;function Xd(i,t){if(Hr.has(i))return Hr.get(i);const e=t();return Hr.size>512&&Hr.clear(),Hr.set(i,e),e}const On=i=>Math.floor(i/_a);function Aa(i,t,e){return Xd(`v${i},${t},${e}`,()=>{if(Qt(t,e,i+500)>.75)return null;const n=t*_a+40+Math.floor(Qt(t,e,i+501)*80),s=e*_a+40+Math.floor(Qt(t,e,i+502)*80),r={};Ri(i,n,s,r);const a=r.h,o=r.biome;if(!kx.has(o)||a<se+2||a>se+22)return null;let l=a,c=a;for(let v=-$n-2;v<=$n+2;v+=4)for(let _=-$n-2;_<=$n+2;_+=4)if(!(_*_+v*v>($n+2)*($n+2))){if(Ri(i,n+_,s+v,r),r.h<=se+1||r.biome===Pt.SWAMP||r.biome===Pt.VOLCANO)return null;l=Math.min(l,r.h),c=Math.max(c,r.h)}if(c-l>9)return null;const h=3+(Qt(t,e,i+503)<.5?1:0),u=[];for(let v=0;v<h;v++){const[_,m]=zx[v],d=n+_*11,x=s+m*11;u.push({x:d,z:x,dx:_,dz:m,door:{x:d-_*3,z:x-m*3},front:{x:d-_*5,z:x-m*5},role:Ux[v]})}const f=o===Pt.DESERT,p=o===Pt.SNOW||o===Pt.TAIGA;return{id:t+","+e,x:n,z:s,y:a,biome:o,houses:u,field:{x0:n+6,z0:s-12,x1:n+12,z1:s-6},mast:{x:n-9,z:s+9},top:f?g.SAND:o===Pt.SNOW?g.SNOW:g.GRASS,wall:f?g.SANDSTONE:p?g.SPRUCE:g.PLANKS,roof:f?g.SANDSTONE:p?g.SPRUCE:g.BRICK,post:p?g.SPRUCE:g.WOOD}})}function Fx(i,t){switch(t.role.key){case"bauer":return{x:i.field.x0-1.5,z:(i.field.z0+i.field.z1)/2+.5};case"funker":return{x:i.mast.x+2.5,z:i.mast.z+.5};case"hirte":return{x:i.x-8.5,z:i.z-8.5};default:return{x:t.front.x+.5+t.dz*2,z:t.front.z+.5+t.dx*2}}}function Bx(i,t,e){return Xd(`m${i},${t},${e}`,()=>{if(Qt(t,e,i+600)>.5)return null;const n=t*_a+40+Math.floor(Qt(t,e,i+601)*80),s=e*_a+40+Math.floor(Qt(t,e,i+602)*80),r=10+Math.floor(Qt(t,e,i+603)*8),a=18+Math.floor(Qt(t,e,i+604)*12);return Ri(i,n,s,{}).h<r+12?null:{x:n,y:r,z:s,L:a}})}function $d(i,t=0,e=0,n=2){const s=On(t),r=On(e);let a=null,o=1/0;for(let l=r-n;l<=r+n;l++)for(let c=s-n;c<=s+n;c++){const h=Aa(i,c,l);if(!h)continue;const u=Math.hypot(h.x-t,h.z-e);u<o&&(o=u,a=h)}return a}function Hx(i,t,e,n,s,r){const a=t*F,o=e*F,l=On(a),c=On(o);let h=s;const u=(M,y,C)=>M-a+(C-o)*F+y*F*F,f=(M,y)=>M>=a&&M<a+F&&y>=o&&y<o+F,p=(M,y,C,A)=>{!f(M,C)||y<1||y>=ie||(n[u(M,y,C)]=A,A&&y>h&&(h=y),A===g.RADIO&&r&&r(M,y,C,A))},v=(M,y,C)=>f(M,C)&&y>=0&&y<ie?n[u(M,y,C)]:g.AIR,_=(M,y,C,A)=>C>=a&&M<a+F&&A>=o&&y<o+F,m=Bx(i,l,c);m&&_(m.x-m.L-2,m.z-m.L-2,m.x+m.L+2,m.z+m.L+2)&&Gx(i,m,a,o,p,v);const d=Aa(i,l,c),x=$n+th;return d&&_(d.x-x,d.z-x,d.x+x,d.z+x)&&Vx(i,d,a,o,p,v),h}function Gx(i,t,e,n,s,r){const a={},o=(c,h,u,f)=>{if(c<e||c>=e+F||h<n||h>=n+F||Ri(i,c,h,a).h<t.y+5)return;const p=f==="x"?h-t.z:c-t.x;for(let v=t.y;v<=t.y+2;v++)r(c,v,h)!==g.WATER&&s(c,v,h,g.AIR);r(c,t.y-1,h)===g.AIR&&s(c,t.y-1,h,g.PLANKS),u%5===0&&(p!==0&&(s(c,t.y,h,g.WOOD),s(c,t.y+1,h,g.WOOD)),s(c,t.y+2,h,p===0&&u%10===0&&Qt(c,h,i+605)<.5?g.LAMP:g.PLANKS))},l=(c,h)=>{if(c<e||c>=e+F||h<n||h>=n+F||r(c,t.y+1,h)!==g.STONE)return;const u=Qt(c,h,i+606);u<.07&&s(c,t.y+1,h,u<.035?g.COAL:u<.055?g.COPPER:g.IRON)};for(let c=-t.L;c<=t.L;c++){for(let h=-1;h<=1;h++)o(t.x+c,t.z+h,Math.abs(c),"x"),o(t.x+h,t.z+c,Math.abs(c),"z");l(t.x+c,t.z-2),l(t.x+c,t.z+2),l(t.x-2,t.z+c),l(t.x+2,t.z+c)}for(let c=-2;c<=2;c++)for(let h=-2;h<=2;h++){const u=t.x+h,f=t.z+c;if(!(u<e||u>=e+F||f<n||f>=n+F))for(let p=t.y;p<=t.y+3;p++)s(u,p,f,g.AIR)}s(t.x+2,t.y,t.z+2,g.FURNACE),s(t.x-2,t.y,t.z+2,g.WORKBENCH)}function Vx(i,t,e,n,s,r){const a={},o=t.y,l=$n+th;for(let f=n;f<n+F;f++)for(let p=e;p<e+F;p++){const v=Math.hypot(p-t.x,f-t.z);if(v>l)continue;const _=Ri(i,p,f,a).h,m=v<=$n?o:Math.round(o+(_-o)*(v-$n)/th);for(let d=Math.min(_+1,m-3);d<m;d++)s(p,d,f,g.DIRT);s(p,m,f,t.top);for(let d=m+1,x=Math.min(ie-1,Math.max(_,m)+18);d<=x;d++)r(p,d,f)!==g.AIR&&s(p,d,f,g.AIR)}const c=(f,p,v,_,m,d,x)=>{for(let M=p;M<=m;M++)for(let y=Math.max(v,n);y<=Math.min(d,n+F-1);y++)for(let C=Math.max(f,e);C<=Math.min(_,e+F-1);C++)s(C,M,y,x)};c(t.x-3,o,t.z-3,t.x+3,o,t.z+3,g.PATH);for(const f of t.houses){const p=Math.min(t.x,f.front.x),v=Math.max(t.x,f.front.x),_=Math.min(t.z,f.front.z),m=Math.max(t.z,f.front.z);c(p,o,_,v,o,m,g.PATH),c(f.front.x,o,f.front.z,f.door.x,o,f.door.z,g.PATH)}c(t.x-1,o,t.z-1,t.x+1,o+1,t.z+1,g.COBBLE),c(t.x,o-1,t.z,t.x,o,t.z,g.WATER),s(t.x,o+1,t.z,g.AIR);for(const[f,p]of[[-4,-4],[4,-4],[4,4],[-4,4]])c(t.x+f,o+1,t.z+p,t.x+f,o+2,t.z+p,t.post),s(t.x+f,o+3,t.z+p,g.LAMP);for(const f of t.houses){c(f.x-3,o,f.z-3,f.x+3,o,f.z+3,g.COBBLE),c(f.x-2,o,f.z-2,f.x+2,o,f.z+2,g.PLANKS);for(let m=-3;m<=3;m++)for(let d=-3;d<=3;d++){const x=Math.abs(d)===3||Math.abs(m)===3,M=Math.abs(d)===3&&Math.abs(m)===3;for(let C=o+1;C<=o+4;C++)s(f.x+d,C,f.z+m,M?t.post:x?t.wall:g.AIR);(Math.abs(d)===3&&m===0||Math.abs(m)===3&&d===0)&&!(d===-f.dx*3&&m===-f.dz*3)&&s(f.x+d,o+2,f.z+m,g.GLASS)}s(f.door.x,o+1,f.door.z,g.AIR),s(f.door.x,o+2,f.door.z,g.AIR);for(let m=0;m<=4;m++)c(f.x-4+m,o+5+m,f.z-4+m,f.x+4-m,o+5+m,f.z+4-m,t.roof);s(f.x,o+4,f.z,g.LAMP);const p=f.x+f.dx*2+(f.dz?2:0),v=f.z+f.dz*2+(f.dx?2:0),_={bauer:g.WORKBENCH,schmied:g.FURNACE,funker:g.RADIO,hirte:g.WOOL}[f.role.key];if(s(p,o+1,v,_),f.role.key==="schmied"){const m=f.front.x+f.dz*3,d=f.front.z+f.dx*3;s(m,o+1,d,g.FURNACE),s(m,o+2,d,g.COBBLE)}}const h=t.field,u=h.z0+h.z1>>1;for(let f=h.z0;f<=h.z1;f++)for(let p=h.x0;p<=h.x1;p++){if(f===u){s(p,o,f,g.WATER);continue}s(p,o,f,g.FARMLAND),s(p,o+1,f,Qt(p,f,i+510)<.7?g.WHEAT3:g.WHEAT2)}c(t.mast.x,o+1,t.mast.z,t.mast.x,o+7,t.mast.z,t.post),s(t.mast.x,o+8,t.mast.z,g.LAMP),s(t.mast.x+1,o+1,t.mast.z,g.RADIO)}const qd=3,Kd=i=>i===2||i===3?i:1,Yd=52;function Co(i,t,e){const n=Ye(t/110,e/110,i,4),s=Ye(t/24,e/24,i+5,2),r=Math.floor(10+n*44+(s-.5)*5);return Math.max(2,Math.min(Yd,r))}function ti(i,t){return(i+32768)*65536+(t+32768)}class df{constructor(t,e,n=1){this.seed=t|0,this.gen=Kd(n),this.chunks=new Map,this.edits=e||new Map,this.dirty=new Set,this.radios=new Map,this.sig=new Map,this.sigDirty=!1,this.onSet=null,this.rot=new Map}setRot(t,e,n,s){if(e<0||e>=ie)return!1;const r=this.chunks.get(ti(t>>4,n>>4));if(!r)return!1;const a=(t&15)+(n&15)*F+e*F*F;let o=this.rot.get(r.key);if(s==null){if(!o||!o.delete(a))return!1}else o||(o=new Map,this.rot.set(r.key,o)),o.set(a,s&3);return this.dirty.add(r),!0}getRot(t,e,n){const s=this.rot.get(ti(t>>4,n>>4));return s?s.get((t&15)+(n&15)*F+e*F*F):void 0}getChunk(t,e){return this.chunks.get(ti(t,e))}ensure(t,e){const n=ti(t,e);let s=this.chunks.get(n);return s||(s=this.generate(t,e,n),this.chunks.set(n,s)),s}generate(t,e,n){const s=new Uint8Array(F*F*ie);let r=this.gen>=2?Dx(this.seed,t,e,s):this.generate1(t,e,s);return this.gen===3&&(r=Hx(this.seed,t,e,s,r,(a,o,l)=>this.radios.set(`${a},${o},${l}`,[a,o,l]))),this.finish(t,e,n,s,r)}generate1(t,e,n){const s=this.seed;let r=0;for(let a=0;a<F;a++)for(let o=0;o<F;o++){const l=t*F+o,c=e*F+a,h=Co(s,l,c),u=h<=se+1;for(let p=0;p<=h;p++){let v;p===0||p<h-3?v=g.STONE:u?v=g.SAND:p<h?v=g.DIRT:v=h>=46?g.STONE:g.GRASS,n[o+a*F+p*F*F]=v}for(let p=h+1;p<=se;p++)n[o+a*F+p*F*F]=g.WATER;const f=Math.max(h,h<se?se:0);f>r&&(r=f)}for(let a=2;a<F-2;a++)for(let o=2;o<F-2;o++){const l=t*F+o,c=e*F+a;if(Qt(l,c,s+99)>=.012)continue;const h=Co(s,l,c);if(h<=se+1||h>=44||n[o+a*F+h*F*F]!==g.GRASS)continue;const u=4+Math.floor(Qt(l,c,s+7)*3);for(let f=1;f<=u;f++)n[o+a*F+(h+f)*F*F]=g.WOOD;for(let f=u-2;f<=u+1;f++){const p=f>=u?1:2;for(let v=-p;v<=p;v++)for(let _=-p;_<=p;_++){if(p===2&&Math.abs(_)===2&&Math.abs(v)===2&&Qt(l+_,c+v+f,s+3)<.5)continue;const m=o+_+(a+v)*F+(h+f)*F*F;n[m]===g.AIR&&(n[m]=g.LEAVES)}}h+u+1>r&&(r=h+u+1)}return r}finish(t,e,n,s,r){const a=this.edits.get(n);if(a)for(const[o,l]of a){const c=o/(F*F)|0;s[o]===g.RADIO&&l!==g.RADIO&&this.radios.delete(`${t*F+(o&15)},${c},${e*F+(o>>4&15)}`),s[o]=l,c>r&&(r=c);const h=t*F+(o&15),u=e*F+(o>>4&15);l===g.RADIO&&this.radios.set(`${h},${c},${u}`,[h,c,u]),ql.has(l)?(this.sig.set(`${h},${c},${u}`,[h,c,u,l]),this.sigDirty=!0):this.sig.delete(`${h},${c},${u}`)&&(this.sigDirty=!0)}return{cx:t,cz:e,key:n,data:s,maxY:r,hm:null,opaque:null,trans:null,logo:null,meshed:!1}}getBlock(t,e,n){if(e<0)return g.STONE;if(e>=ie)return g.AIR;const s=this.chunks.get(ti(t>>4,n>>4));return s?s.data[(t&15)+(n&15)*F+e*F*F]:g.AIR}isLoaded(t,e){return this.chunks.has(ti(t>>4,e>>4))}isSolid(t,e,n){if(e<0)return!0;if(e>=ie)return!1;const s=this.chunks.get(ti(t>>4,n>>4));return s?ma[s.data[(t&15)+(n&15)*F+e*F*F]]===1:!0}setBlock(t,e,n,s){if(e<0||e>=ie)return!1;const r=t>>4,a=n>>4,o=this.chunks.get(ti(r,a));if(!o)return!1;const l=t&15,c=n&15,h=l+c*F+e*F*F,u=o.data[h];if(u===s)return!1;o.data[h]=s;const f=this.rot.get(o.key);f&&f.delete(h),u===g.RADIO&&this.radios.delete(`${t},${e},${n}`),s===g.RADIO&&this.radios.set(`${t},${e},${n}`,[t,e,n]),ql.has(s)?(this.sig.set(`${t},${e},${n}`,[t,e,n,s]),this.sigDirty=!0):ql.has(u)&&(this.sig.delete(`${t},${e},${n}`),this.sigDirty=!0),e>o.maxY&&(o.maxY=e),o.hm=null;let p=this.edits.get(o.key);p||(p=new Map,this.edits.set(o.key,p)),p.set(h,s),this.dirty.add(o);const v=l===0?-1:l===F-1?1:0,_=c===0?-1:c===F-1?1:0;for(let m=Math.min(0,_);m<=Math.max(0,_);m++)for(let d=Math.min(0,v);d<=Math.max(0,v);d++)if(d||m){const x=this.chunks.get(ti(r+d,a+m));x&&this.dirty.add(x)}return this.onSet&&this.onSet(t,e,n,s),!0}heightmap(t){if(t.hm)return t.hm;const e=new Uint8Array(F*F),n=t.data;for(let s=0;s<F*F;s++)for(let r=Math.min(ie-1,t.maxY);r>=0;r--)if(Hd[n[s+r*F*F]]){e[s]=r+1;break}return t.hm=e}neighborhood(t){const e=new Array(9);for(let n=-1;n<=1;n++)for(let s=-1;s<=1;s++){const r=this.chunks.get(ti(t.cx+s,t.cz+n));if(!r)return null;e[(n+1)*3+s+1]=r.data}return e}findSpawn(t=!0){if(this.gen===3&&t){const e=$d(this.seed);if(e)return this.ensure(e.x>>4,e.z+3>>4),{x:e.x+.5,y:e.y+1.01,z:e.z+3.5}}if(this.gen>=2){const e=this.findSpawn2();if(e)return e}for(let e=0;e<60;e++)for(let n=0;n<Math.max(1,e*8);n++){const s=n/Math.max(1,e*8)*Math.PI*2,r=Math.round(Math.cos(s)*e*4),a=Math.round(Math.sin(s)*e*4),o=Co(this.seed,r,a);if(o<=se+1||o>=44)continue;const l=this.ensure(r>>4,a>>4);let c=ie-1;for(;c>0&&l.data[(r&15)+(a&15)*F+c*F*F]===g.AIR;)c--;const h=l.data[(r&15)+(a&15)*F+c*F*F];if(!(h===g.WOOD||h===g.LEAVES||h===g.WATER))return{x:r+.5,y:c+1.01,z:a+.5}}return{x:.5,y:Yd+2,z:.5}}findSpawn2(){const t={};for(let e=0;e<120;e++){const n=Math.max(1,e*8);for(let s=0;s<n;s++){const r=s/n*Math.PI*2,a=Math.round(Math.cos(r)*e*8),o=Math.round(Math.sin(r)*e*8);if(Ri(this.seed,a,o,t),!wx.includes(t.biome)||t.h<se+2||t.h>se+18)continue;const l=this.ensure(a>>4,o>>4);let c=ie-1;for(;c>0&&l.data[(a&15)+(o&15)*F+c*F*F]===g.AIR;)c--;const h=l.data[(a&15)+(o&15)*F+c*F*F];if(!(h!==g.GRASS&&h!==g.FLOWERS)&&!(l.data[(a&15)+(o&15)*F+(c+1)*F*F]!==g.AIR||l.data[(a&15)+(o&15)*F+(c+2)*F*F]!==g.AIR))return{x:a+.5,y:c+1.01,z:o+.5}}}return null}biomeAt(t,e){return this.gen<2?-1:Ri(this.seed,Math.floor(t),Math.floor(e),{}).biome}villageAt(t,e){if(this.gen!==3)return null;const n=Aa(this.seed,On(Math.floor(t)),On(Math.floor(e)));return n&&Math.hypot(n.x+.5-t,n.z+.5-e)<=$n+4?n:null}}const jd={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};class wa{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const Wx=new Eh(-1,1,1,-1,0,1);class Xx extends Ie{constructor(){super(),this.setAttribute("position",new Fe([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Fe([0,2,0,0,2,0],2))}}const $x=new Xx;class Zd{constructor(t){this._mesh=new Te($x,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,Wx)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}}class Jd extends wa{constructor(t,e){super(),this.textureID=e!==void 0?e:"tDiffuse",t instanceof ze?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=ko.clone(t.uniforms),this.material=new ze({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this.fsQuad=new Zd(this.material)}render(t,e,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this.fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class pf extends wa{constructor(t,e){super(),this.scene=t,this.camera=e,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,e,n){const s=t.getContext(),r=t.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,a,4294967295),r.buffers.stencil.setClear(o),r.buffers.stencil.setLocked(!0),t.setRenderTarget(n),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(e),this.clear&&t.clear(),t.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}}class qx extends wa{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}}class Kx{constructor(t,e){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),e===void 0){const n=t.getSize(new kt);this._width=n.width,this._height=n.height,e=new wn(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:ai}),e.texture.name="EffectComposer.rt1"}else this._width=e.width,this._height=e.height;this.renderTarget1=e,this.renderTarget2=e.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Jd(jd),this.copyPass.material.blending=xi,this.clock=new vx}swapBuffers(){const t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,e){this.passes.splice(e,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){const e=this.passes.indexOf(t);e!==-1&&this.passes.splice(e,1)}isLastEnabledPass(t){for(let e=t+1;e<this.passes.length;e++)if(this.passes[e].enabled)return!1;return!0}render(t){t===void 0&&(t=this.clock.getDelta());const e=this.renderer.getRenderTarget();let n=!1;for(let s=0,r=this.passes.length;s<r;s++){const a=this.passes[s];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),a.render(this.renderer,this.writeBuffer,this.readBuffer,t,n),a.needsSwap){if(n){const o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}pf!==void 0&&(a instanceof pf?n=!0:a instanceof qx&&(n=!1))}}this.renderer.setRenderTarget(e)}reset(t){if(t===void 0){const e=this.renderer.getSize(new kt);this._pixelRatio=this.renderer.getPixelRatio(),this._width=e.width,this._height=e.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,e){this._width=t,this._height=e;const n=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(n,s),this.renderTarget2.setSize(n,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,s)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class Yx extends wa{constructor(t,e,n=null,s=null,r=null){super(),this.scene=t,this.camera=e,this.overrideMaterial=n,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new Jt}render(t,e,n){const s=t.autoClear;t.autoClear=!1;let r,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(t.getClearColor(this._oldClearColor),t.setClearColor(this.clearColor,t.getClearAlpha())),this.clearAlpha!==null&&(r=t.getClearAlpha(),t.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&t.clearDepth(),t.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),t.render(this.scene,this.camera),this.clearColor!==null&&t.setClearColor(this._oldClearColor),this.clearAlpha!==null&&t.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),t.autoClear=s}}const jx={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Jt(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};class vr extends wa{constructor(t,e,n,s){super(),this.strength=e!==void 0?e:1,this.radius=n,this.threshold=s,this.resolution=t!==void 0?new kt(t.x,t.y):new kt(256,256),this.clearColor=new Jt(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new wn(r,a,{type:ai}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let u=0;u<this.nMips;u++){const f=new wn(r,a,{type:ai});f.texture.name="UnrealBloomPass.h"+u,f.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(f);const p=new wn(r,a,{type:ai});p.texture.name="UnrealBloomPass.v"+u,p.texture.generateMipmaps=!1,this.renderTargetsVertical.push(p),r=Math.round(r/2),a=Math.round(a/2)}const o=jx;this.highPassUniforms=ko.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new ze({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];const l=[3,5,7,9,11];r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let u=0;u<this.nMips;u++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(l[u])),this.separableBlurMaterials[u].uniforms.invSize.value=new kt(1/r,1/a),r=Math.round(r/2),a=Math.round(a/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=e,this.compositeMaterial.uniforms.bloomRadius.value=.1;const c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new N(1,1,1),new N(1,1,1),new N(1,1,1),new N(1,1,1),new N(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;const h=jd;this.copyUniforms=ko.clone(h.uniforms),this.blendMaterial=new ze({uniforms:this.copyUniforms,vertexShader:h.vertexShader,fragmentShader:h.fragmentShader,blending:cc,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new Jt,this.oldClearAlpha=1,this.basic=new jn,this.fsQuad=new Zd(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(t,e){let n=Math.round(t/2),s=Math.round(e/2);this.renderTargetBright.setSize(n,s);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(n,s),this.renderTargetsVertical[r].setSize(n,s),this.separableBlurMaterials[r].uniforms.invSize.value=new kt(1/n,1/s),n=Math.round(n/2),s=Math.round(s/2)}render(t,e,n,s,r){t.getClearColor(this._oldClearColor),this.oldClearAlpha=t.getClearAlpha();const a=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),r&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=n.texture,t.setRenderTarget(null),t.clear(),this.fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this.fsQuad.render(t);let o=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this.fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[l].uniforms.direction.value=vr.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[l]),t.clear(),this.fsQuad.render(t),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=vr.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[l]),t.clear(),this.fsQuad.render(t),o=this.renderTargetsVertical[l];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this.fsQuad.render(t),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(n),this.fsQuad.render(t)),t.setClearColor(this._oldClearColor,this.oldClearAlpha),t.autoClear=a}getSeperableBlurMaterial(t){const e=[];for(let n=0;n<t;n++)e.push(.39894*Math.exp(-.5*n*n/(t*t))/t);return new ze({defines:{KERNEL_RADIUS:t},uniforms:{colorTexture:{value:null},invSize:{value:new kt(.5,.5)},direction:{value:new kt(.5,.5)},gaussianCoefficients:{value:e}},vertexShader:`varying vec2 vUv;
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
				}`})}getCompositeMaterial(t){return new ze({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
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
				}`})}}vr.BlurDirectionX=new kt(1,0);vr.BlurDirectionY=new kt(0,1);const Ch=1,Qd=`
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
`,mf=()=>({uShadowMap:{value:null},uShadowMat:{value:new de},uShadowOn:{value:0},uShadowTexel:{value:1/2048},uFogSun:{value:new N}});class Zx{constructor(t){this.uni=t,this.size=0,this.rt=null,this.radius=40,this.frame=0,this.every=1,this.cam=new Eh(-1,1,1,-1,1,320),this.cam.layers.set(Ch),this.matAtlas=null,this.matPlain=new jn({colorWrite:!1,side:mn}),this.tmp=new N,this.saved=[]}setAtlas(t){this.matAtlas=new jn({map:t,alphaTest:.5,colorWrite:!1,side:mn})}configure(t,e,n){if(this.radius=e,this.every=n,t===this.size){this.uni.uShadowOn.value=t?1:0;return}this.rt&&(this.rt.dispose(),this.rt=null),this.size=t,t&&(this.rt=new wn(t,t,{depthBuffer:!0}),this.rt.depthTexture=new Th(t,t,ts),this.rt.depthTexture.minFilter=this.rt.depthTexture.magFilter=Je,this.uni.uShadowMap.value=this.rt.depthTexture),this.uni.uShadowOn.value=t?1:0,this.frame=0}update(t,e,n,s,r,a){if(!this.size)return;if(r.y<.04){this.uni.uShadowOn.value=0;return}if(this.uni.uShadowOn.value=1,!a&&this.frame++%this.every)return;const o=this.cam,l=this.radius,c=2*l/this.size;o.left=-l,o.right=l,o.top=l,o.bottom=-l,o.updateProjectionMatrix(),o.position.copy(r).multiplyScalar(160),o.lookAt(0,0,0),o.updateMatrixWorld();const h=this.tmp.copy(s).applyMatrix4(o.matrixWorldInverse);h.x=Math.round(h.x/c)*c,h.y=Math.round(h.y/c)*c,h.applyMatrix4(o.matrixWorld),o.position.copy(h).addScaledVector(r,160),o.updateMatrixWorld(),this.uni.uShadowMat.value.multiplyMatrices(o.projectionMatrix,o.matrixWorldInverse),this.uni.uShadowTexel.value=1/this.size;const u=this.saved;u.length=0;for(const p of n.children)p.layers.test(o.layers)&&(u.push(p,p.material),p.material=p.userData.atlas&&this.matAtlas?this.matAtlas:this.matPlain);const f=e.background;e.background=null,t.setRenderTarget(this.rt),t.clear(!0,!0,!1),t.render(e,o),t.setRenderTarget(null),e.background=f;for(let p=0;p<u.length;p+=2)u[p].material=u[p+1];u.length=0}dispose(){this.configure(0,this.radius,1)}}const Ne=64,ea=12,Ln=4,Gr=Ne*ea,Jx=`
varying vec3 vN; varying vec3 vWp;
void main(){ vN = normal; vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0); vWp = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`,Qx=`
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
}`;function tM(i=7){const t=new Uint8Array(Ne*Ne);for(let e=0;e<Ne;e++)for(let n=0;n<Ne;n++){const r=(c,h)=>Ye(c/Ne*9,h/Ne*9,i,3),a=n/Ne,o=e/Ne,l=r(n,e)*(1-a)*(1-o)+r(n-Ne,e)*a*(1-o)+r(n,e-Ne)*(1-a)*o+r(n-Ne,e-Ne)*a*o;t[n+e*Ne]=l>.53?1:0}return t}function eM(i){const t=[],e=[],n=[],s=(o,l)=>i[(o+Ne)%Ne+(l+Ne)%Ne*Ne],r=(o,l)=>{const c=t.length/3;for(const h of o)t.push(...h),e.push(...l);n.push(c,c+1,c+2,c,c+2,c+3)};for(let o=0;o<Ne;o++)for(let l=0;l<Ne;l++){if(!s(l,o))continue;const c=l*ea,h=c+ea,u=o*ea,f=u+ea;r([[c,Ln,u],[c,Ln,f],[h,Ln,f],[h,Ln,u]],[0,1,0]),r([[c,0,u],[h,0,u],[h,0,f],[c,0,f]],[0,-1,0]),s(l+1,o)||r([[h,0,u],[h,Ln,u],[h,Ln,f],[h,0,f]],[1,0,0]),s(l-1,o)||r([[c,0,f],[c,Ln,f],[c,Ln,u],[c,0,u]],[-1,0,0]),s(l,o+1)||r([[h,0,f],[h,Ln,f],[c,Ln,f],[c,0,f]],[0,0,1]),s(l,o-1)||r([[c,0,u],[c,Ln,u],[h,Ln,u],[h,0,u]],[0,0,-1])}const a=new Ie;return a.setAttribute("position",new Fe(t,3)),a.setAttribute("normal",new Fe(e,3)),a.setIndex(t.length/3>65535?new Sh(n,1):new yh(n,1)),a}class nM{constructor(t,e){this.u={uCol:{value:new N(1,1,1)},uSunCol:e.uSunCol,uSunDir:e.uSunDir,uFog:e.uFog,uFogSun:e.uFogSun,uFade:{value:new kt(260,440)}},this.mesh=new kd(eM(tM()),new ze({vertexShader:Jx,fragmentShader:Qx,uniforms:this.u,transparent:!0,depthWrite:!0}),9),this.mesh.frustumCulled=!1,this.mesh.visible=!1,this.mesh.renderOrder=-5,this.m4=new de,t.add(this.mesh)}update(t,e,n,s){if(this.mesh.visible=s,!s)return;const r=e*1.4%Gr,a=Math.floor((t.x-r)/Gr),o=Math.floor(t.z/Gr);let l=0;for(let c=-1;c<=1;c++)for(let h=-1;h<=1;h++)this.mesh.setMatrixAt(l++,this.m4.makeTranslation(r+(a+h)*Gr,112,(o+c)*Gr));this.mesh.instanceMatrix.needsUpdate=!0,this.u.uCol.value.set(n[0],n[1],n[2])}}const iM={uniforms:{tDiffuse:{value:null},uVig:{value:.22},uSat:{value:1}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
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
}`};class sM{constructor(t,e,n,s){this.renderer=t;const r=new wn(2,2,{type:ai,samples:s?4:0});this.composer=new Kx(t,r),this.composer.addPass(new Yx(e,n)),this.bloom=new vr(new kt(256,256),.32,.55,.86),this.composer.addPass(this.bloom),this.grade=new Jd(iM),this.composer.addPass(this.grade)}setSize(t,e,n){this.composer.setPixelRatio(n),this.composer.setSize(t,e)}render(){this.composer.render()}dispose(){this.composer.dispose()}}const rM=`
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
}`,aM=`
uniform sampler2D uMap; uniform vec3 uFog; uniform vec2 uFogRange; uniform vec3 uSunDir;
varying vec2 vUv; varying vec3 vAmb; varying vec3 vSun; varying float vEm; varying float vDist; varying vec3 vWp; varying vec3 vN; varying float vBl;
${Qd}
void main(){
  float sh = dot(vSun, vSun) > 0.0 ? shadowAt(vWp, vN) : 1.0;
  vec3 c = texture2D(uMap, vUv).rgb * max(vAmb + vSun * sh + blockGlow(vBl), vec3(vEm));
  c = mix(vec3(dot(c, vec3(0.299, 0.587, 0.114))), c, 1.1); c = c * 1.15 / (1.0 + 0.15 * c);
  gl_FragColor = vec4(toLinear(applyFog(c, vWp, vDist, uFog, uFogRange, uSunDir)), 1.0);
  #include <colorspace_fragment>
}`;function oM(i,t){return i.map(e=>{let n=e.off;const s=new Uint16Array(t,n,e.nv*3);n+=e.nv*6;const r=new Int8Array(t,n,e.nv*3);n+=e.nv*3,n%2&&n++;const a=new Uint16Array(t,n,e.nv*2);n+=e.nv*4;const o=new Uint16Array(t,n,e.ni),l=new Float32Array(e.nv*3),c=new Float32Array(e.nv*3),h=new Float32Array(e.nv*2);for(let u=0;u<e.nv*3;u++){const f=u%3;l[u]=e.lo[f]+s[u]/65535*(e.hi[f]-e.lo[f]),c[u]=r[u]/127}for(let u=0;u<e.nv*2;u++)h[u]=a[u]/65535;return{name:e.name,pos:l,nor:c,uv:h,idx:new Uint16Array(o),lo:e.lo,hi:e.hi}})}function lM(i,t,e,n,s,r,a,o){const l=s*Math.PI/2,c=Math.cos(l),h=Math.sin(l),u=r?.5-a/2-.02:0,f=Math.sin(l),p=Math.cos(l),v=t+.5-f*u,_=n+.5-p*u;return i.set(c,0,h,v-.5*c-.5*h,0,1,0,e+o,-h,0,c,_+.5*h-.5*c,0,0,0,1),i}class cM{constructor(t,e,n="kaykit/"){this.group=t,this.uni=e,this.base=n,this.geos=null,this.meta=null,this.mat=null,this.state=0,this.chunks=new Map,this.waiting=new Map,this.m4=new de,this.col=new Jt}load(){if(this.state)return;this.state=1;const t=new Promise(e=>new gx().load(this.base+"deco.png",e,void 0,()=>e(null)));Promise.all([fetch(this.base+"deco.json").then(e=>e.json()),fetch(this.base+"deco.bin").then(e=>e.arrayBuffer()),t]).then(([e,n,s])=>{const r=oM(e,n);s&&(s.flipY=!1,s.magFilter=on,s.minFilter=on,s.generateMipmaps=!1),this.mat=new ze({vertexShader:rM,fragmentShader:aM,uniforms:{uAmb:this.uni.uAmb,uSunCol:this.uni.uSunCol,uSunDir:this.uni.uSunDir,uFog:this.uni.uFog,uFogRange:this.uni.uFogRange,uShadowMap:this.uni.uShadowMap,uShadowMat:this.uni.uShadowMat,uShadowOn:this.uni.uShadowOn,uShadowTexel:this.uni.uShadowTexel,uFogSun:this.uni.uFogSun,uMap:{value:s}}}),this.meta=r,this.geos=r.map(a=>{const o=new Ie;return o.setAttribute("position",new be(a.pos,3)),o.setAttribute("normal",new be(a.nor,3)),o.setAttribute("uv",new be(a.uv,2)),o.setIndex(new be(a.idx,1)),o}),this.state=2;for(const[a,o]of this.waiting)this.setChunk(a,o);this.waiting.clear(),this.onReady&&this.onReady()}).catch(()=>{this.state=3,this.waiting.clear()})}setChunk(t,e){if(this.drop(t),!e||!e.length)return;if(this.state!==2){this.state!==3&&(this.waiting.set(t,e),this.load());return}const n=new Map;for(let r=0;r<e.length;r+=8){const a=br[e[r+3]];a!=null&&(n.has(a)||n.set(a,[]),n.get(a).push(r))}const s=[];for(const[r,a]of n){const o=Ls[r],l=this.meta[r],c=new kd(this.geos[r],this.mat,a.length);a.forEach((h,u)=>{lM(this.m4,t.cx*16+e[h],e[h+1],t.cz*16+e[h+2],e[h+4],o.wall,l.hi[2]-l.lo[2],e[h+6]),c.setMatrixAt(u,this.m4),c.setColorAt(u,this.col.setRGB(e[h+5],o.emit?1:0,e[h+7]||0))}),c.frustumCulled=!1,c.layers.enable(Ch),this.group.add(c),s.push(c)}this.chunks.set(t,s)}drop(t){this.waiting.delete(t);const e=this.chunks.get(t);if(e){for(const n of e)this.group.remove(n),n.dispose();this.chunks.delete(t)}}clear(){for(const t of[...this.chunks.keys()])this.drop(t);this.waiting.clear()}}const tl=3,tp=2,hM=["survival","creative","story"],Zi=i=>"klotzfunk.world."+i,el=i=>"klotzfunk.meta."+i,yi=i=>"klotzfunk-bak.world."+i,sr=i=>"klotzfunk-bak.time."+i,uM=10*60*1e3,nl=()=>{try{return globalThis.localStorage||null}catch{return null}},Ci=i=>{try{return nl().getItem(i)}catch{return null}},Tr=i=>{try{return i?JSON.parse(i):null}catch{return null}};function ep(i){const t={};for(const[e,n]of i){if(!n.size)continue;const s=new Uint8Array(n.size*3);let r=0;for(const[o,l]of n)s[r++]=o&255,s[r++]=o>>8,s[r++]=l;let a="";for(let o=0;o<s.length;o+=8192)a+=String.fromCharCode.apply(null,s.subarray(o,o+8192));t[e]=btoa(a)}return t}function fM(i){const t=new Map;if(!i||typeof i!="object")return t;for(const e of Object.keys(i)){const n=i[e],s=new Map;if(Array.isArray(n))for(let a=0;a+1<n.length;a+=2)Number.isInteger(n[a])&&Number.isInteger(n[a+1])&&s.set(n[a],n[a+1]&255);else if(typeof n=="string"){let a="";try{a=atob(n)}catch{continue}for(let o=0;o+2<a.length;o+=3)s.set(a.charCodeAt(o)|a.charCodeAt(o+1)<<8,a.charCodeAt(o+2))}const r=Number(e);s.size&&Number.isFinite(r)&&t.set(r,s)}return t}function dM(i){const t={};if(i){for(const[e,n]of i)if(n.size){const s=[];for(const[r,a]of n)s.push(r,a);t[e]=s}}return t}function pM(i){const t=new Map;if(!i||typeof i!="object")return t;for(const e of Object.keys(i)){const n=i[e],s=Number(e),r=new Map;if(!(!Array.isArray(n)||!Number.isFinite(s))){for(let a=0;a+1<n.length;a+=2)Number.isInteger(n[a])&&n[a]>=0&&n[a]<65536&&Number.isInteger(n[a+1])&&r.set(n[a],n[a+1]&3);r.size&&t.set(s,r)}}return t}function Ra(i){return!!i&&typeof i=="object"&&Number.isFinite(i.seed)&&hM.includes(i.mode)&&typeof i.name=="string"&&(i.edits===void 0||typeof i.edits=="object"&&i.edits!==null)}function np(i){return Tr(Ci(el(i)))}function ip(i){const t=Tr(Ci(Zi(i)));return Ra(t)?t:null}function sp(i){const t=Tr(Ci(yi(i)));return Ra(t)?t:null}function mM(i){return Ci(yi(i))!==null}const rp=i=>({name:i.name,mode:i.mode,seed:i.seed,gen:i.gen||1,savedAt:i.savedAt,q:i.story?i.story.done?-1:i.story.i:void 0,qc:i.story?i.story.c:void 0});function ap(i,t){const e=nl();if(!e)return!1;let n;try{n=JSON.stringify(t)}catch{return!1}const s=Ci(Zi(i)),r=Date.now();if(s&&s!==n&&r-(Number(Ci(sr(i)))||0)>uM&&Ra(Tr(s)))try{e.setItem(yi(i),s),e.setItem(sr(i),String(r))}catch{try{e.removeItem(yi(i)),e.removeItem(sr(i))}catch{}}try{e.setItem(Zi(i),n)}catch{try{for(let o=0;o<tl;o++)e.removeItem(yi(o)),e.removeItem(sr(o));e.setItem(Zi(i),n)}catch{return!1}}try{e.setItem(el(i),JSON.stringify(rp(t)))}catch{}return!0}function gM(i){const t=nl();if(t)for(const e of[Zi(i),el(i),yi(i),sr(i)])try{t.removeItem(e)}catch{}}function op(i){const t=nl(),e=Ci(yi(i)),n=Tr(e);if(!t||!Ra(n))return!1;const s=Ci(Zi(i));try{t.setItem(Zi(i),e),s?t.setItem(yi(i),s):t.removeItem(yi(i)),t.setItem(sr(i),String(Date.now())),t.setItem(el(i),JSON.stringify(rp(n)))}catch{return!1}return!0}function vM(i){return JSON.stringify({format:"klotzfunk-world",version:tp,exportedAt:Date.now(),save:i})}function _M(i){const t=Tr(i);if(!t)return null;const e=t.format==="klotzfunk-world"?t.save:t;return Ra(e)?(e.name=e.name.slice(0,40),e):null}function lp(){for(let i=0;i<tl;i++)if(Ci(Zi(i))===null)return i;return-1}const cp="klotzfunk.settings",eh={eco:{name:"Eco",dpr:.75,view:3,clouds:!1,budget:3,shadow:0,vclouds:!1,post:!1,wind:!1},mobile:{name:"Mobil",dpr:1.25,view:4,clouds:!0,budget:4,shadow:1024,shadowR:28,shadowEvery:3,vclouds:!1,post:!1,wind:!0},standard:{name:"Standard",dpr:1.5,view:6,clouds:!0,budget:6,shadow:2048,shadowR:44,shadowEvery:1,vclouds:!0,post:!0,wind:!0},high:{name:"Hoch",dpr:2,view:9,clouds:!0,budget:8,shadow:2048,shadowR:60,shadowEvery:1,vclouds:!0,post:!0,wind:!0}},na={quality:"auto",mouseSens:1,touchSens:1,joySens:1,btnScale:1,lefty:!1,invertY:!1,placeDelay:!0,sfxVol:.8,musicVol:.8,ambVol:.7,showFps:!1,deathLoss:"keep",enemies:!0,preview:!0,stun:!0,mpName:"",minimap:!0,keys:{},padKeys:{},padSens:1,padRumble:.8,padDead:.18,padInvertY:!1,touchPos:{}};function xM(){let i={};try{i=JSON.parse(globalThis.localStorage.getItem(cp))||{}}catch{i={}}const t={...na};for(const e of Object.keys(na))i[e]!==void 0&&typeof i[e]==typeof na[e]&&i[e]===null==(na[e]===null)&&(t[e]=i[e]);return t.quality!=="auto"&&!eh[t.quality]&&(t.quality="auto"),["keep","grave"].includes(t.deathLoss)||(t.deathLoss="keep"),t}function ss(i){try{return globalThis.localStorage.setItem(cp,JSON.stringify(i)),!0}catch{return!1}}function MM(i){return i?"mobile":"standard"}const rs=1e3,Re=[],K={},Bo=[],kn=[{key:"WOOD",name:"Holz",speed:2,dur:60,col:"#b48a52"},{key:"STONE",name:"Stein",speed:3,dur:140,col:"#8c8c94"},{key:"COPPER",name:"Kupfer",speed:4,dur:220,col:"#d8803c"},{key:"IRON",name:"Eisen",speed:6,dur:360,col:"#dcdce4"}],hp=[{key:"PICK",kind:"spitzhacke",name:"spitzhacke"},{key:"AXE",kind:"axt",name:"axt"},{key:"SHOVEL",kind:"schaufel",name:"schaufel"}];function Ge(i,t,e,n){if(Re[i])throw new Error("Item-Id doppelt: "+i);const s={id:i,key:t,name:e,cat:"items",icon:Bo.length,food:0,tool:null,...n};return Re[i]=s,K[t]=i,Bo.push(i),s}Ge(1e3,"STICK","Stock",{draw:"stick"});Ge(1001,"COPPER_INGOT","Kupferbarren",{draw:"ingot",col:"#d8803c"});Ge(1002,"IRON_INGOT","Eisenbarren",{draw:"ingot",col:"#dcdce4"});Ge(1003,"APPLE","Apfel",{draw:"apple",food:4});Ge(1004,"MEAT_RAW","Rohes Fleisch",{draw:"meat",col:"#e0605a",food:2});Ge(1005,"MEAT_COOKED","Braten",{draw:"meat",col:"#9a5a2a",food:7});kn.forEach((i,t)=>hp.forEach((e,n)=>{Ge(1010+t*3+n,i.key+"_"+e.key,i.name+e.name,{draw:e.kind,col:i.col,tool:{kind:e.kind,tier:t+1,speed:i.speed,dur:i.dur}})}));Ge(1022,"WOOD_HOE","Holzhacke",{draw:"hacke",col:kn[0].col,tool:{kind:"hacke",tier:1,speed:1,dur:kn[0].dur}});Ge(1023,"STONE_HOE","Steinhacke",{draw:"hacke",col:kn[1].col,tool:{kind:"hacke",tier:2,speed:1,dur:kn[1].dur}});Ge(1024,"SEEDS","Weizensamen",{draw:"seeds",plant:g.WHEAT0});Ge(1025,"WHEAT","Weizen",{draw:"wheat"});Ge(1026,"BREAD","Brot",{draw:"bread",food:6});kn.forEach((i,t)=>Ge(1027+t,i.key+"_SWORD",i.name+"schwert",{draw:"schwert",col:i.col,tool:{kind:"schwert",tier:t+1,speed:1,dur:i.dur,dmg:3+t}}));Ge(1031,"COPPER_HELMET","Kupferhelm",{draw:"helm",col:kn[2].col,armor:{slot:"kopf",pts:2,dur:60}});Ge(1032,"COPPER_CHEST","Kupferharnisch",{draw:"harnisch",col:kn[2].col,armor:{slot:"brust",pts:3,dur:80}});Ge(1033,"IRON_HELMET","Eisenhelm",{draw:"helm",col:kn[3].col,armor:{slot:"kopf",pts:3,dur:110}});Ge(1034,"IRON_CHEST","Eisenharnisch",{draw:"harnisch",col:kn[3].col,armor:{slot:"brust",pts:5,dur:150}});Ge(1035,"BOAT","Boot",{draw:"boot",col:"#a87a46",vehicle:"boot"});Ge(1036,"MINECART","Lore",{draw:"lore",col:"#8a8c94",vehicle:"lore"});const Wi=i=>i>=rs,Vr=i=>i>=rs&&Re[i]&&Re[i].armor||null,gf=i=>1-Math.min(.4,Math.max(0,i)*.05),vf=i=>i>=rs&&Re[i]&&Re[i].vehicle||null,Kl=i=>i>=rs&&Re[i]&&Re[i].plant||0,_e=i=>i>=rs?Re[i]?Re[i].name:"?":pa[i]||"?",$i=i=>i>=rs&&Re[i]?Re[i].tool:null,_f=i=>i>=rs&&Re[i]?Re[i].food:0,xf=i=>!!(i>=rs?Re[i]:Ht[i]),yM=.9;function SM(i,t){const e=Ht[i];if(!e)return .5;const n=$i(t),s=n&&e.tool===n.kind?n.speed:1;return Math.max(.12,e.hard*yM/s)}function EM(i,t){const e=Ht[i];if(!e||!e.tier)return!0;const n=$i(t);return!!n&&n.kind==="spitzhacke"&&n.tier>=e.tier}function bM(i,t){const e=Ht[i],n=$i(t);return!!(e&&n&&e.tool===n.kind)}const Ze=999,hn=[{id:"planks",give:[g.PLANKS,4],need:[[g.WOOD,1]]},{id:"planks2",give:[g.PLANKS,4],need:[[g.SPRUCE,1]]},{id:"glass",give:[g.GLASS,1],need:[[g.SAND,2]]},{id:"lamp",give:[g.LAMP,2],need:[[g.GLASS,2],[g.WOOD,1]]},{id:"lampCoal",give:[g.LAMP,2],need:[[g.COAL,1],[g.PLANKS,1]]},{id:"lampCrystal",give:[g.LAMP,4],need:[[g.CRYSTAL,1],[g.GLASS,1]]},{id:"feder",give:[g.FEDER,2],need:[[g.LEAVES,4],[g.PLANKS,1]]},{id:"turbo",give:[g.TURBO,2],need:[[g.STONE,2],[g.LAMP,1]]},{id:"turboIron",give:[g.TURBO,3],need:[[g.IRON,1],[g.STONE,2]]},{id:"wind",give:[g.WIND,2],need:[[g.GLASS,2],[g.LEAVES,2]]},{id:"radio",give:[g.RADIO,1],need:[[g.PLANKS,4],[g.LAMP,1]]},{id:"radioCopper",give:[g.RADIO,2],need:[[g.PLANKS,2],[g.COPPER,1],[g.LAMP,1]]},{id:"rainbow",give:[g.RAINBOW,2],need:[[g.GLASS,2],[g.LAMP,1]]},{id:"neonR",give:[g.NEON_R,3],need:[[g.LAMP,1],[g.SAND,1]]},{id:"neonB",give:[g.NEON_B,3],need:[[g.LAMP,1],[g.GLASS,1]]},{id:"neonG",give:[g.NEON_G,3],need:[[g.LAMP,1],[g.LEAVES,1]]},{id:"neonP",give:[g.NEON_P,3],need:[[g.LAMP,1],[g.DIRT,1]]},{id:"brick",give:[g.BRICK,4],need:[[g.DIRT,2],[g.SAND,1]]},{id:"brickClay",give:[g.BRICK,4],need:[[g.CLAY,2],[g.COAL,1]]},{id:"marble",give:[g.MARBLE,2],need:[[g.STONE,2],[g.SAND,1]]},{id:"sandstone",give:[g.SANDSTONE,2],need:[[g.SAND,4]]}];for(let i=0;i<Rh;i++)hn.push({id:"logo"+(i+1),give:[wi+i,2],need:[[g.PLANKS,1]]});hn.push({id:"sticks",give:[K.STICK,4],need:[[g.PLANKS,2]]},{id:"workbench",give:[g.WORKBENCH,1],need:[[g.PLANKS,4]]},{id:"furnace",give:[g.FURNACE,1],need:[[g.STONE,8]],st:"werkbank"});const up=[g.PLANKS,g.STONE,K.COPPER_INGOT,K.IRON_INGOT],TM=[3,3,1];kn.forEach((i,t)=>hp.forEach((e,n)=>{const s=K[i.key+"_"+e.key];hn.push({id:"tool"+s,give:[s,1],need:[[up[t],TM[n]],[K.STICK,2]],st:"werkbank"})}));const AM=[g.PLANKS,g.STONE];["WOOD","STONE"].forEach((i,t)=>hn.push({id:"tool"+K[i+"_HOE"],give:[K[i+"_HOE"],1],need:[[AM[t],2],[K.STICK,2]],st:"werkbank"}));kn.forEach((i,t)=>hn.push({id:"tool"+K[i.key+"_SWORD"],give:[K[i.key+"_SWORD"],1],need:[[up[t],2],[K.STICK,1]],st:"werkbank"}));hn.push({id:"bread",give:[K.BREAD,1],need:[[K.WHEAT,3]]});hn.push({id:"copperHelmet",give:[K.COPPER_HELMET,1],need:[[K.COPPER_INGOT,5]],st:"werkbank"},{id:"copperChest",give:[K.COPPER_CHEST,1],need:[[K.COPPER_INGOT,8]],st:"werkbank"},{id:"ironHelmet",give:[K.IRON_HELMET,1],need:[[K.IRON_INGOT,5]],st:"werkbank"},{id:"ironChest",give:[K.IRON_CHEST,1],need:[[K.IRON_INGOT,8]],st:"werkbank"},{id:"cobble",give:[g.COBBLE,2],need:[[g.STONE,2]]},{id:"path",give:[g.PATH,2],need:[[g.GRAVEL,1],[g.DIRT,1]]});hn.push({id:"switch",give:[g.SWITCH,2],need:[[g.STONE,1],[K.STICK,1]],st:"werkbank"},{id:"wire",give:[g.WIRE,8],need:[[K.COPPER_INGOT,1],[g.STONE,1]],st:"werkbank"},{id:"sender",give:[g.SENDER,1],need:[[K.COPPER_INGOT,2],[g.CRYSTAL,1],[g.RADIO,1]],st:"werkbank"},{id:"relay",give:[g.RELAY,1],need:[[K.COPPER_INGOT,1],[g.CRYSTAL,1],[g.STONE,2]],st:"werkbank"},{id:"receiver",give:[g.RECEIVER,1],need:[[K.COPPER_INGOT,1],[g.GLASS,1],[g.PLANKS,2]],st:"werkbank"},{id:"siglamp",give:[g.SIGLAMP,2],need:[[g.LAMP,1],[g.WIRE,1]],st:"werkbank"},{id:"gate",give:[g.GATE,2],need:[[K.IRON_INGOT,1],[g.PLANKS,4]],st:"werkbank"});hn.push({id:"boat",give:[K.BOAT,1],need:[[g.PLANKS,5],[K.STICK,1]],st:"werkbank"},{id:"minecart",give:[K.MINECART,1],need:[[K.IRON_INGOT,3],[K.COPPER_INGOT,2]],st:"werkbank"},{id:"rail",give:[g.RAIL,16],need:[[K.COPPER_INGOT,3],[K.STICK,2]],st:"werkbank"});hn.push({id:"ingotCopper",give:[K.COPPER_INGOT,1],need:[[g.COPPER,1],[g.COAL,1]],st:"ofen"},{id:"ingotIron",give:[K.IRON_INGOT,1],need:[[g.IRON,1],[g.COAL,1]],st:"ofen"},{id:"cook",give:[K.MEAT_COOKED,1],need:[[K.MEAT_RAW,1],[g.PLANKS,1]],st:"ofen"},{id:"cookCoal",give:[K.MEAT_COOKED,4],need:[[K.MEAT_RAW,4],[g.COAL,1]],st:"ofen"},{id:"glassOven",give:[g.GLASS,3],need:[[g.SAND,3],[g.COAL,1]],st:"ofen"});hn.push({id:"stonebrick",give:[g.STONEBRICK,4],need:[[g.STONE,4]]},{id:"smooth",give:[g.SMOOTH,2],need:[[g.STONE,2],[g.COAL,1]],st:"ofen"},{id:"darkplanks",give:[g.DARKPLANKS,4],need:[[g.SPRUCE,1],[g.COAL,1]]},{id:"birch",give:[g.BIRCH,4],need:[[g.WOOD,1],[g.SAND,1]]},{id:"roof",give:[g.ROOF,4],need:[[g.BRICK,2],[g.CLAY,1]]},{id:"books",give:[g.BOOKS,1],need:[[g.PLANKS,4],[g.WOOL,1]]},{id:"lantern",give:[g.LANTERN,2],need:[[K.IRON_INGOT,1],[g.LAMP,1]],st:"werkbank"},{id:"copperblock",give:[g.COPPERBLOCK,1],need:[[K.COPPER_INGOT,4]],st:"werkbank"},{id:"ironblock",give:[g.IRONBLOCK,1],need:[[K.IRON_INGOT,4]],st:"werkbank"},{id:"hay",give:[g.HAY,1],need:[[K.WHEAT,6]]},...[g.SNOW,g.COAL,g.MAGMA,g.COPPER,g.SANDSTONE,g.LEAVES,g.CLAY,g.CRYSTAL].map((i,t)=>({id:"concrete"+t,give:[g["CONCRETE"+t],4],need:[[g.SAND,2],[g.GRAVEL,2],[i,1]]})),...[[g.MAGMA,1],[g.CLAY,1],[g.LEAVES,1]].map((i,t)=>({id:"stained"+t,give:[g["STAINED"+t],2],need:[[g.GLASS,2],i]})),...Fd.flatMap(([i,,t],e)=>[{id:"slab"+i,give:[101+e,6],need:[[t,3]]},{id:"stairs"+i,give:[109+e*4,4],need:[[t,6]]}]),{id:"fence",give:[g.FENCE,3],need:[[g.PLANKS,4],[K.STICK,2]]},{id:"wall",give:[g.WALL,6],need:[[g.COBBLE,6]]},{id:"pane",give:[g.PANE,16],need:[[g.GLASS,6]]},{id:"door",give:[g.DOOR,2],need:[[g.PLANKS,6]]},{id:"ladder",give:[g.LADDER,3],need:[[K.STICK,7]]});const wM=i=>g["DECO_"+i.toUpperCase()];hn.push(...[["chair",[[g.PLANKS,3]]],["armchair",[[g.PLANKS,2],[g.WOOL,3]]],["stool",[[g.PLANKS,2]]],["couch",[[g.PLANKS,3],[g.WOOL,5]]],["table",[[g.PLANKS,4]]],["tablelong",[[g.PLANKS,6]]],["bed",[[g.PLANKS,3],[g.WOOL,3]]],["cabinet",[[g.PLANKS,6]]],["shelf",[[g.PLANKS,6],[g.BOOKS,1]]],["lamp",[[K.IRON_INGOT,1],[g.LAMP,1]]],["tablelamp",[[K.COPPER_INGOT,1],[g.LAMP,1]]],["books",[[g.BOOKS,1]]],["picture",[[g.PLANKS,2],[g.FLOWERS,1]]],["rug",[[g.WOOL,3]]],["bench",[[g.PLANKS,4],[K.IRON_INGOT,1]]],["streetlight",[[K.IRON_INGOT,3],[g.LAMP,1]]],["trafficlight",[[K.IRON_INGOT,3],[g.NEON_R,1],[g.NEON_G,1]]],["hydrant",[[K.IRON_INGOT,2]]],["trash",[[K.IRON_INGOT,4]]],["bush",[[g.LEAVES,4]]],["barrel",[[g.PLANKS,5],[K.IRON_INGOT,1]]],["chest",[[g.PLANKS,6],[K.COPPER_INGOT,1]]],["keg",[[g.PLANKS,4],[K.COPPER_INGOT,1]]],["candles",[[g.WOOL,1],[g.COAL,1]]],["torch",[[K.STICK,1],[g.COAL,1]]],["banner",[[g.WOOL,4],[K.STICK,1]]],["crates",[[g.PLANKS,6]]]].map(([i,t])=>({id:"deco_"+i,give:[wM(i),i==="torch"||i==="candles"?4:1],need:t,st:"werkbank"})));for(const i of hn)i.cat=(Re[i.give[0]]||Ht[i.give[0]]).cat;const Mf={werkbank:"Werkbank",ofen:"Schmelzofen"},RM={werkbank:"eine Werkbank",ofen:"einen Schmelzofen"},Ss=(i,t)=>i[t]||0;function Lh(i,t,e=Ze,n=null){const s=t.need.filter(([o,l])=>Ss(i,o)<l).map(([o,l])=>[o,l-Ss(i,o)]),r=Ss(i,t.give[0])+t.give[1]>e,a=!!(t.st&&n&&!n.has(t.st));return{ok:!s.length&&!r&&!a,missing:s,full:r,noStation:a}}function fp(i,t,e=Ze,n=null){const s=Lh(i,t,e,n);if(!s.ok)return{ok:!1,msg:s.noStation?`Braucht ${RM[t.st]} in der Nähe`:s.missing.length?"Es fehlt: "+s.missing.map(([a,o])=>`${o}× ${_e(a)}`).join(", "):`Vorrat voll: höchstens ${e}× ${_e(t.give[0])}`};for(const[r,a]of t.need)i[r]=Ss(i,r)-a;return i[t.give[0]]=Ss(i,t.give[0])+t.give[1],{ok:!0,msg:`+${t.give[1]} ${_e(t.give[0])}`}}function CM(i,t,e=Ze,n=null){if(t.st&&n&&!n.has(t.st))return 0;let s=Math.floor((e-Ss(i,t.give[0]))/t.give[1]);for(const[r,a]of t.need)s=Math.min(s,Math.floor(Ss(i,r)/a));return Math.max(0,s)}function LM(i,t){return t?(t=t.toLowerCase(),_e(i.give[0]).toLowerCase().includes(t)||i.need.some(([e])=>_e(e).toLowerCase().includes(t))):!0}const DM=[[0,.5,0,1,1,.5],[.5,.5,0,1,1,1],[0,.5,.5,1,1,1],[0,.5,0,.5,1,1]],Ho=[[0,-1],[1,0],[0,1],[-1,0]],dp=i=>bn[i]===6;function PM(i,t){return bn[t]===i||gn[t]===1||(i===3||i===4)&&dp(t)}function Wr(i,t,e,n,s,r){const a=.5-e/2,o=.5+e/2;r&&!t.some(Boolean)&&(t=[1,1,1,1]),t[0]&&i.push([a,n,0,o,s,a]),t[1]&&i.push([o,n,a,1,s,o]),t[2]&&i.push([a,n,o,o,s,1]),t[3]&&i.push([0,n,a,a,s,o])}function pp(i,t,e,n,s,r=!1){const a=bn[i];if(!a)return null;if(a===1)return[[0,0,0,1,.5,1]];if(a===2)return[[0,0,0,1,.5,1],DM[Ht[i].dir&3]];const o=()=>Ho.map(([l,c])=>PM(a,t(e+l,n,s+c))?1:0);if(a===3){const l=o(),c=[[.375,0,.375,.625,1,.625]];return r?Wr(c,l,.25,0,1):(Wr(c,l,.125,.375,.5625),Wr(c,l,.125,.75,.9375)),c}if(a===4){const l=[[.25,0,.25,.75,1,.75]];return Wr(l,o(),.375,0,r?1:.8125),l}if(a===5){const l=[[.4375,0,.4375,.5625,1,.5625]];return Wr(l,o(),.125,0,1,!0),l}if(a===6){let l=n;for(;l>0&&dp(t(e,l-1,s));)l--;const c=gn[t(e-1,l,s)]||gn[t(e+1,l,s)],u=(gn[t(e,l,s-1)]||gn[t(e,l,s+1)])&&!c,f=i===g.DOOR_OPEN,p=.1875;return f?[u?[0,0,0,1,1,p]:[0,0,0,p,1,1]]:[u?[.5-p/2,0,0,.5+p/2,1,1]:[0,0,.5-p/2,1,1,.5+p/2]]}if(a===7){for(const[c,h]of Ho)if(gn[t(e+c,n,s+h)])return[c===1?[1-.0625,0,0,1,1,1]:c===-1?[0,0,0,.0625,1,1]:h===1?[0,0,1-.0625,1,1,1]:[0,0,0,1,1,.0625]];return[[0,0,0,1,1,.0625]]}if(a===8){const l=Ls[br[i]];return[[0,0,0,1,l&&l.solid?l.solid:1,1]]}return null}const IM={"0,-1":0,"1,0":3,"0,1":2,"-1,0":1},NM={"0,-1":2,"1,0":1,"0,1":0,"-1,0":3};function mp(i,t,e,n){for(const[s,r]of Ho)if(gn[i(t+s,e,n+r)])return IM[s+","+r];for(const[s,r]of Ho){const a=i(t+s,e,n+r),o=Ls[br[a]];if(o&&o.top)return NM[s+","+r]}return 0}function OM(i,t,e,n){const s=Ls[br[i(t,e-1,n)]];return s&&s.top?s.top-1:0}function kM(i,t,e,n,s,r,a,o,l,c,h){const u=pp(i,t,e,n,s,!0);if(!u)return!0;for(const f of u)if(l>e+f[0]&&r<e+f[3]&&c>n+f[1]&&a<n+f[4]&&h>s+f[2]&&o<s+f[5])return!0;return!1}const gp=new Uint8Array(256);for(const i of Ht)i&&/LEAVES$/.test(i.key)&&(gp[i.id]=1);const il=[{n:[1,0,0],o:[1,0,1],a:[0,0,-1],b:[0,1,0],k:1},{n:[-1,0,0],o:[0,0,0],a:[0,0,1],b:[0,1,0],k:1},{n:[0,0,1],o:[0,0,1],a:[1,0,0],b:[0,1,0],k:1},{n:[0,0,-1],o:[1,0,0],a:[-1,0,0],b:[0,1,0],k:1},{n:[0,1,0],o:[0,1,0],a:[0,0,1],b:[1,0,0],k:0},{n:[0,-1,0],o:[0,0,0],a:[1,0,0],b:[0,0,1],k:2}],UM=[[0,0],[1,0],[1,1],[0,1]];for(const i of il)i.c=UM.map(([t,e])=>{const n=t?1:-1,s=e?1:-1,r=(a,o,l)=>[i.n[0]*a+i.a[0]*o+i.b[0]*l,i.n[1]*a+i.a[1]*o+i.b[1]*l,i.n[2]*a+i.a[2]*o+i.b[2]*l];return{i:t,j:e,p:[i.o[0]+t*i.a[0]+e*i.b[0],i.o[1]+t*i.a[1]+e*i.b[1],i.o[2]+t*i.a[2]+e*i.b[2]],s1:r(1,n,0),s2:r(1,0,s),cn:r(1,n,s)}});const yf=[.45,.66,.84,1],zM=[1,.62,.38,.18];function FM(i,t){return t===g.AIR?!0:gn[t]?!1:i===t?Gd[i]===1:!0}class Lo{constructor(){this.pos=[],this.uv=[],this.col=[],this.idx=[],this.n=0}finish(){return this.n?{pos:new Float32Array(this.pos),uv:new Float32Array(this.uv),col:new Float32Array(this.col),idx:this.n>16383?new Uint32Array(this.idx):new Uint16Array(this.idx)}:null}}function Ca(i,t){const e=t?4:bx,n=t?4:of,s=1/e,r=1/n,a=(t?3:2)/512,o=t?a:2/(64*of);return[i%e*s+a,1-(Math.floor(i/e)+1)*r+o,s-2*a,r-2*o]}function vp(i,t){const e=i.neighborhood(t);if(!e)return null;const n=[];for(let s=-1;s<=1;s++)for(let r=-1;r<=1;r++)n.push(i.heightmap(i.getChunk(t.cx+r,t.cz+s)));return{nb:e,hms:n,maxY:t.maxY,rot:i.rot&&i.rot.get(t.key)||null}}function BM(i,t){const e=vp(i,t);return e?GM(e.nb,e.hms,e.maxY,e.rot):null}const De=14,yn=F+2*De;let mo=null,Sf=null;function HM(i,t,e=null){const n=Math.min(ie-1,t+De),s=[];if(e)for(let u=-1;u<=1;u++)for(let f=-1;f<=1;f++){const p=e[(u+1)*3+f+1],v=Math.max(0,-De-f*F),_=Math.min(F-1,F+De-1-f*F),m=Math.max(0,-De-u*F),d=Math.min(F-1,F+De-1-u*F),x=Math.min(p.length,n+1<<8);for(let M=0;M<x;M++){if(!ga[p[M]])continue;const y=M&15,C=M>>4&15;y>=v&&y<=_&&C>=m&&C<=d&&s.push(f*F+y,M>>8,u*F+C)}}else for(let u=0;u<=n;u++)for(let f=-De;f<F+De;f++)for(let p=-De;p<F+De;p++)ga[i(p,u,f)]&&s.push(p,u,f);if(!s.length)return null;const r=yn*yn*(n+1);(!mo||mo.length<r)&&(mo=new Uint8Array(r),Sf=new Int32Array(r));const a=mo,o=Sf;a.fill(0,0,r);let l=0,c=0;for(let u=0;u<s.length;u+=3){const f=s[u]+De+(s[u+2]+De)*yn+s[u+1]*yn*yn;a[f]=De,o[c++]=f}const h=yn*yn;for(;l<c;){const u=o[l++],f=a[u]-1;if(f<=0)continue;const p=u/h|0,v=u-p*h,_=v/yn|0,m=v-_*yn;for(let d=0;d<6;d++){const x=m+(d===0?1:d===1?-1:0),M=p+(d===2?1:d===3?-1:0),y=_+(d===4?1:d===5?-1:0);if(x<0||y<0||M<0||x>=yn||y>=yn||M>n)continue;const C=x+y*yn+M*h;a[C]>=f||gn[i(x-De,M,y-De)]||(a[C]=f,o[c++]=C)}}return(u,f,p)=>f<0||f>n||u<-De||p<-De||u>=F+De||p>=F+De?0:a[u+De+(p+De)*yn+f*h]/De}const xa=(i,t)=>i+8*Math.round(t*63);function GM(i,t,e,n=null){const s=i[4],r=(m,d)=>(d<0?0:d>=F?2:1)*3+(m<0?0:m>=F?2:1),a=(m,d,x)=>d<0?g.STONE:d>=ie?g.AIR:i[r(m,x)][(m&15)+((x&15)<<4)+(d<<8)],o=(m,d,x)=>{const M=t[r(m,x)][(m&15)+((x&15)<<4)];return d>=M?1:zM[Math.min(3,M-d)]},l=new Lo,c=new Lo,h=new Lo,u=[0,0,0,0],f=[],p=Math.min(ie-1,e+1),v=HM(a,p,i),_=v||(()=>0);for(let m=0;m<=p;m++)for(let d=0;d<F;d++)for(let x=0;x<F;x++){const M=s[x+(d<<4)+(m<<8)];if(M===g.AIR)continue;if(Vd[M]){XM(l,x,m,d,ir[M][0],o(x,m,d),_(x,m,d));continue}if(Wd[M]){const E=(I,$)=>a(x+I,m,d+$)===M||a(x+I,m+1,d+$)===M||a(x+I,m-1,d+$)===M;$M(l,x,m,d,ir[M][0],o(x,m,d),(E(1,0)||E(-1,0))&&!E(0,1)&&!E(0,-1),_(x,m,d));continue}if(bn[M]===8){const E=n?n.get(x+(d<<4)+(m<<8)):void 0;f.push(x,m,d,M,E??mp(a,x,m,d),o(x,m,d),OM(a,x,m,d),_(x,m,d));continue}if(bn[M]){VM(Ro[M]?c:l,x,m,d,pp(M,a,x,m,d),ir[M],a,o,_);continue}const y=Qo(M),C=y?h:Ro[M]?c:l,A=ga[M],R=M===g.WATER&&a(x,m+1,d)!==g.WATER,P=ir[M],T=A===0&&!Ro[M];for(let E=0;E<6;E++){const I=il[E];if(!FM(M,a(x+I.n[0],m+I.n[1],d+I.n[2])))continue;const $=y?M-wi:P[I.k],[V,Y,nt,q]=Ca($,y);for(let W=0;W<4;W++){const st=I.c[W],mt=o(x+I.n[0],m+I.n[1],d+I.n[2]),Ct=x+st.s1[0],Wt=m+st.s1[1],ce=d+st.s1[2],j=x+st.s2[0],rt=m+st.s2[1],Tt=d+st.s2[2],lt=x+st.cn[0],It=m+st.cn[1],zt=d+st.cn[2],Gt=gn[a(Ct,Wt,ce)],pe=gn[a(j,rt,Tt)],Zt=gn[a(lt,It,zt)],Ae=T?Gt&&pe?0:3-(Gt+pe+Zt):3,U=(mt+(Gt?mt:o(Ct,Wt,ce))+(pe?mt:o(j,rt,Tt))+(Zt?mt:o(lt,It,zt)))/4;let tn=0;if(v){const jt=_(x+I.n[0],m+I.n[1],d+I.n[2]);tn=(jt+(Gt?jt:_(Ct,Wt,ce))+(pe?jt:_(j,rt,Tt))+(Zt?jt:_(lt,It,zt)))/4}u[W]=yf[Ae]*(.5+.5*U),C.pos.push(x+st.p[0],m+st.p[1]-(R&&st.p[1]===1?.12:0),d+st.p[2]),C.uv.push(V+st.i*nt,Y+st.j*q),C.col.push(yf[Ae],U,xa(M===g.WATER?3:gp[M]?4:A,tn),E)}const it=C.n*4;u[0]+u[2]<u[1]+u[3]?C.idx.push(it+1,it+2,it+3,it+1,it+3,it):C.idx.push(it,it+1,it+2,it,it+2,it+3),C.n++}}return{opaque:l.finish(),trans:c.finish(),logo:h.finish(),deco:f}}function VM(i,t,e,n,s,r,a,o,l){const c=o(t,e,n),h=l(t,e,n);for(const u of s)for(let f=0;f<6;f++){const p=il[f],v=p.n[0]?0:p.n[1]?1:2,m=p.n[v]>0?u[v+3]>=1:u[v]<=0;if(m&&gn[a(t+p.n[0],e+p.n[1],n+p.n[2])])continue;const d=m?(o(t+p.n[0],e+p.n[1],n+p.n[2])+c)/2:c,x=m?xa(0,(l(t+p.n[0],e+p.n[1],n+p.n[2])+h)/2):xa(0,h),[M,y,C,A]=Ca(r[p.k],!1),R=m?1:.84;for(let T=0;T<4;T++){const E=p.c[T],I=[0,1,2].map(q=>E.p[q]?u[q+3]:u[q]),$=p.a[0]?0:p.a[1]?1:2,V=p.b[0]?0:p.b[1]?1:2,Y=p.a[$]>0?I[$]:1-I[$],nt=p.b[V]>0?I[V]:1-I[V];i.pos.push(t+I[0],e+I[1],n+I[2]),i.uv.push(M+Y*C,y+nt*A),i.col.push(R,d,x,f)}const P=i.n*4;i.idx.push(P,P+1,P+2,P,P+2,P+3),i.n++}}const WM=[[[.15,.15],[.85,.85]],[[.85,.15],[.15,.85]]];function XM(i,t,e,n,s,r,a=0){const[o,l,c,h]=Ca(s,!1);for(const[[u,f],[p,v]]of WM)for(const _ of[0,1]){const m=i.n*4,d=_?[[p,v],[u,f]]:[[u,f],[p,v]];i.pos.push(t+d[0][0],e,n+d[0][1],t+d[1][0],e,n+d[1][1],t+d[1][0],e+1,n+d[1][1],t+d[0][0],e+1,n+d[0][1]),i.uv.push(o,l,o+c,l,o+c,l+h,o,l+h);for(let x=0;x<4;x++)i.col.push(.9,r,xa(x>1?5:0,a),4);i.idx.push(m,m+1,m+2,m,m+2,m+3),i.n++}}function $M(i,t,e,n,s,r,a,o=0){const[l,c,h,u]=Ca(s,!1),f=e+.0625,p=[l,c,l,c+u,l+h,c+u,l+h,c],v=[l,c,l+h,c,l+h,c+u,l,c+u],_=a?v:p;for(const m of[0,1]){const d=i.n*4;m?(i.pos.push(t,f,n,t+1,f,n,t+1,f,n+1,t,f,n+1),i.uv.push(_[0],_[1],_[6],_[7],_[4],_[5],_[2],_[3])):(i.pos.push(t,f,n,t,f,n+1,t+1,f,n+1,t+1,f,n),i.uv.push(..._));for(let x=0;x<4;x++)i.col.push(.95,r,xa(0,o),m?5:4);i.idx.push(d,d+1,d+2,d,d+2,d+3),i.n++}}function qM(i){const t=Qo(i),e=ir[i],n=new Lo;for(let s=0;s<6;s++){const r=il[s],[a,o,l,c]=Ca(t?i-wi:e[r.k],t);for(let u=0;u<4;u++){const f=r.c[u];n.pos.push(f.p[0]-.5,f.p[1]-.5,f.p[2]-.5),n.uv.push(a+f.i*l,o+f.j*c),n.col.push(1,1,ga[i],s)}const h=n.n*4;n.idx.push(h,h+1,h+2,h,h+2,h+3),n.n++}return n.finish()}const we=64,Qs=8,Ef=16,Xr=128,Yl=4,bf=16;function rn(i,t,e){let n=Math.imul(i|0,668265261)^Math.imul(t|0,374761393)^Math.imul(e|0,2654435761);return n=Math.imul(n^n>>>15,2246822507),n=Math.imul(n^n>>>13,3266489909),n^=n>>>16,(n>>>0)/4294967296}function Pe(i,t,e,n,s){const r=Math.floor(i),a=Math.floor(t),o=i-r,l=t-a,c=o*o*(3-2*o),h=l*l*(3-2*l),u=(r%e+e)%e,f=(u+1)%e,p=(a%n+n)%n,v=(p+1)%n,_=rn(u,p,s),m=rn(f,p,s),d=rn(u,v,s),x=rn(f,v,s);return _+(m-_)*c+(d-_)*h+(_-m-d+x)*c*h}function yt(i,t,e,n,s){let r=0,a=.5,o=0,l=e;for(let c=0;c<n;c++)r+=a*Pe(i*l,t*l,l,l,s+c*17),o+=a,a*=.5,l*=2;return r/o}const _t=(i,t,e)=>[i[0]+(t[0]-i[0])*e,i[1]+(t[1]-i[1])*e,i[2]+(t[2]-i[2])*e],tt=(i,t)=>[i[0]+t,i[1]+t,i[2]+t],xt=(i,t,e,n)=>(rn(i,t,e)-.5)*n,jl=(i,t,e,n)=>{const s=yt(i,t,6,3,2),r=Pe(i*32,t*32,32,32,5);return[...tt(_t([58,122,38],[120,186,72],s*.65+r*.45),xt(e,n,8,10)),255]},go=(i,t,e,n)=>{const s=yt(i,t,4,4,1),r=yt(i,t,12,2,9);let a=_t([108,76,50],[150,108,76],s);return r>.66?a=tt(a,-26):r<.28&&(a=tt(a,12)),[...tt(a,xt(e,n,3,10)),255]},Xi=[jl,(i,t,e,n)=>{const s=.17+.11*Pe(i*8,.5,8,1,4)+.05*Pe(i*24,.5,24,1,6);if(t<s){const o=jl(i,t,e,n);return t>s-.035&&(o[0]*=.8,o[1]*=.85,o[2]*=.8),o}const r=go(i,t,e,n),a=Math.max(0,1-(t-s)*7)*.28;return[r[0]*(1-a),r[1]*(1-a),r[2]*(1-a),255]},go,(i,t,e,n)=>{const s=yt(i,t,4,4,3),r=Math.abs(yt(i,t,3,3,7)-.5);let a=_t([92,94,100],[142,144,150],s);return r<.022?a=tt(a,-34):yt(i,t,10,2,13)>.7&&(a=tt(a,14)),[...tt(a,xt(e,n,4,9)),255]},(i,t,e,n)=>{const s=yt(i,t,5,3,21),r=Math.sin((t+s*.35)*Math.PI*8)*5;return[...tt(_t([212,194,136],[232,218,160],s),r+xt(e,n,5,10)),255]},(i,t,e,n)=>{const s=Pe(i*10,t*3,10,3,31)*.6+Pe(i*20,t*6,20,6,32)*.4;let r=_t([82,58,33],[132,98,58],s);return s<.3&&(r=tt(r,-16)),[...tt(r,xt(e,n,6,8)),255]},(i,t,e,n)=>{const s=i-.5,r=t-.5,a=Math.max(Math.abs(s),Math.abs(r)),o=yt(i,t,6,2,41);if(a>.43)return[...tt(_t([80,56,32],[118,86,50],o),xt(e,n,7,8)),255];const l=Math.hypot(s,r)*15+yt(i,t,3,2,42)*2.2,c=.5+.5*Math.sin(l*Math.PI*2);return[...tt(_t([186,148,94],[148,108,62],c),xt(e,n,9,7)),255]},(i,t,e,n)=>{const s=yt(i,t,8,3,11),r=yt(i,t,9,2,12);let a=_t([30,92,30],[92,168,58],s);return r>.64?[a[0],a[1],a[2],0]:(Pe(i*16,t*16,16,16,14)>.78&&(a=tt(a,18)),[...tt(a,xt(e,n,10,10)),255])},(i,t,e,n)=>{const s=Math.floor(t*4),r=t*4%1,a=Pe(i*6,t*40,6,40,51+s)*.7+.3*Pe(i*24,t*4+s,24,4,55);let o=_t([150,110,60],[200,156,96],a);(r<.045||r>.97)&&(o=tt(o,-46));const l=s%2?.25:.75;return Math.abs(i-l)<.012&&(o=tt(o,-40)),[...tt(o,xt(e,n,11,6)),255]},(i,t,e,n)=>{if(Math.min(e,n,we-1-e,we-1-n)<3)return[228,245,252,238];const r=(i+t)%.5;return r>.1&&r<.17&&i+t<1?[255,255,255,140]:[186,226,240,55]},(i,t,e,n)=>{const s=i*2%1,r=t*2%1;if(Math.min(s,1-s,r,1-r)<.055)return[150,98,38,255];const o=Math.max(0,1-Math.hypot(s-.5,r-.5)*1.5),l=yt(i,t,6,2,61);return[..._t([255,196,96],[255,246,190],o*.9+l*.1),255]},(i,t,e,n)=>{const s=yt(i,t,4,3,15),a=yt(i+s*.2,t,8,2,16)>.62?26:0;return[...tt(_t([34,92,190],[62,134,220],s),a),172]},(i,t,e,n)=>{const s=Math.hypot(i-.5,t-.5),r=Math.min(e,n,we-1-e,we-1-n);let a=_t([255,120,170],[255,70,130],Math.min(1,s*1.6));return Math.sin(s*Math.PI*14)>.7&&(a=tt(a,22)),r<4&&(a=_t(a,[150,30,80],.6)),[...a,255]},(i,t,e,n)=>{if(t<.17||t>.83){const r=Math.min(t,1-t);return[..._t([255,80,140],[190,40,100],r<.04?.6:0),255]}const s=Math.sin((t*7+Math.abs(i-.5)*.8)*Math.PI*2);return s>-.1?[...tt([176,182,194],s*24),255]:[52,54,64,255]},(i,t)=>{const e=(t+Math.abs(i-.5))*3%1;return Math.min(i,t,1-i,1-t)<.04?[30,30,36,255]:e<.5?[255,214,40,255]:[38,38,46,255]},(i,t)=>t>.35&&t<.65?[255,214,40,255]:[40,40,50,255],(i,t,e,n)=>{const s=Math.abs(i*2%1-.5),r=t*2%1,a=s<.07&&r>.4&&r<.88,o=r>.12&&r<.44&&s<(r-.12)*.75,l=_t([40,170,215],[96,220,245],yt(i,t,4,2,71));return a||o?[255,255,255,255]:[...tt(l,xt(e,n,12,8)),255]},(i,t,e,n)=>[...Math.sin((t*5-i*.6)*Math.PI*2+Math.sin(i*9)*1.2)>.82?[235,250,255]:_t([40,160,205],[80,205,235],t),255],(i,t,e,n)=>{const s=Math.min(i,t,1-i,1-t),r=Math.hypot(i-.5,t-.5);return s<.05?[28,30,38,255]:r<.34?e%6<3&&n%6<3?[18,20,26,255]:[96,102,116,255]:t<.14&&i>.7&&i<.84?[255,150,40,255]:[...tt([58,62,74],xt(e,n,13,8)),255]},(i,t,e,n)=>Math.min(i,t,1-i,1-t)<.05?[28,30,38,255]:Math.hypot(i-.3,t-.5)<.16?[255,150,40,255]:t>.42&&t<.58&&i>.55&&i<.9?[0,229,255,255]:[...tt([58,62,74],xt(e,n,14,8)),255],(i,t,e,n)=>{const s=.5+.5*Math.sin((i+t)*Math.PI*6+yt(i,t,4,2,81)*5),a=Math.min(i,t,1-i,1-t)<.04?.45:.7+.3*s;return[a*255,a*255,a*255,255]},...[[255,40,70],[40,140,255],[50,255,120],[190,70,255]].map(i=>(t,e)=>{const n=t*2%1,s=e*2%1;if(Math.min(n,1-n,s,1-s)<.06)return[i[0]*.3,i[1]*.3,i[2]*.3,255];const a=Math.max(0,1-Math.hypot(n-.5,s-.5)*1.3);return[..._t(i,[255,255,255],a*a*.65),255]}),(i,t,e,n)=>{const s=Math.floor(t*8),r=t*8%1,a=s%2?.125:0,o=(i*4+a*4)%1;if(r<.1||o<.05)return[...tt([176,170,160],xt(e,n,15,10)),255];const l=yt(i,t,8,2,91+s);return[...tt(_t([150,62,46],[186,92,66],l),xt(e,n,16,12)),255]},(i,t,e,n)=>{const s=yt(i,t,3,4,95),r=Math.abs(yt(i+s*.3,t,3,3,96)-.5);let a=_t([236,236,242],[214,216,226],s);return r<.03?a=tt(a,-52):r<.05&&(a=tt(a,-22)),[...tt(a,xt(e,n,17,5)),255]},(i,t,e,n)=>[...tt(_t([226,234,244],[250,252,255],yt(i,t,5,3,101)),xt(e,n,18,6)),255],(i,t,e,n)=>{const s=.2+.1*Pe(i*8,.5,8,1,102);if(t<s)return[...tt([240,246,252],xt(e,n,19,6)),255];const r=go(i,t,e,n),a=Math.max(0,1-(t-s)*7)*.2;return[r[0]*(1-a),r[1]*(1-a),r[2]*(1-a),255]},(i,t,e,n)=>{const s=yt(i,t,4,3,103),r=Math.abs(yt(i,t,3,2,104)-.5)<.018;return[...tt(_t([150,196,236],[196,226,250],s),r?30:xt(e,n,20,5)),255]},(i,t,e,n)=>{const s=Pe(i*10,t*10,10,10,105),r=yt(i,t,16,2,106),a=s>.6?[150,144,138]:s<.3?[96,92,90]:[124,120,116];return[...tt(a,(r-.5)*40+xt(e,n,21,10)),255]},(i,t,e,n)=>{const s=Math.sin((t+yt(i,t,3,2,107)*.2)*Math.PI*6)*6;return[...tt(_t([142,152,168],[168,176,190],yt(i,t,4,3,108)),s+xt(e,n,22,6)),255]},(i,t,e,n)=>{const s=Pe(i*12,t*2,12,2,109)*.6+Pe(i*24,t*5,24,5,110)*.4;let r=_t([52,36,22],[92,64,40],s);return s<.32&&(r=tt(r,-12)),[...tt(r,xt(e,n,23,8)),255]},(i,t,e,n)=>{const s=i-.5,r=t-.5;if(Math.max(Math.abs(s),Math.abs(r))>.43)return[...tt([66,46,28],xt(e,n,24,8)),255];const o=.5+.5*Math.sin((Math.hypot(s,r)*18+yt(i,t,3,2,111)*2)*Math.PI*2);return[...tt(_t([170,128,80],[130,92,56],o),xt(e,n,25,7)),255]},(i,t,e,n)=>{const s=yt(i,t,10,3,112),r=yt(i,t,11,2,113),a=_t([22,58,34],[52,104,60],s);return r>.66?[a[0],a[1],a[2],0]:[...tt(a,xt(e,n,26,12)),255]},(i,t,e,n)=>{const s=Math.abs(i*4%1-.5)<.08;let r=_t([44,120,44],[70,150,58],yt(i,t,4,2,114));return s&&(r=tt(r,-24)),rn(e>>2,n>>2,115)>.93&&(r=[230,226,190]),[...tt(r,xt(e,n,27,6)),255]},(i,t,e,n)=>{const s=Math.hypot(i-.5,t-.5);return[...tt(_t([92,168,70],[50,124,44],Math.min(1,s*2)),xt(e,n,28,6)),255]},...[[[34,34,38],[58,58,64]],[[196,108,52],[236,150,84]],[[196,160,128],[232,204,176]]].map((i,t)=>(e,n,s,r)=>{const a=yt(e,n,4,4,3);let o=_t([92,94,100],[142,144,150],a);return Pe(e*6,n*6,6,6,116+t)>.68&&(o=_t(i[0],i[1],Pe(e*24,n*24,24,24,119+t))),[...tt(o,xt(s,r,29+t,9)),255]}),(i,t,e,n)=>{const s=Math.abs((i+t)*3%1-.5),r=Math.abs((i-t+1)*3%1-.5),a=Math.min(s,r),o=_t([40,170,230],[170,250,255],1-a*2);return[...tt(o,yt(i,t,6,2,120)*30-15),255]},(i,t,e,n)=>{const s=yt(i,t,5,3,121),r=yt(i,t,9,2,122)>.64;return[...tt(_t([60,50,38],[92,76,58],s),r?18:xt(e,n,32,8)),255]},(i,t,e,n)=>{const s=jl(i,t,e,n);if(rn(e>>2,n>>2,123)>.88&&(e&3)>0&&(n&3)>0){const a=Math.floor(rn(e>>2,n>>2,124)*4);return[...[[250,230,70],[240,80,110],[250,250,250],[150,110,240]][a],255]}return s},(i,t,e,n)=>{const s=Math.floor(i*4),r=Math.abs(i*4%1-.5)>.45;let a=_t([38,38,44],[66,64,72],yt(i,t+s*.3,4,3,125));return r&&(a=tt(a,-14)),[...tt(a,xt(e,n,33,8)),255]},(i,t,e,n)=>{const s=yt(i,t,4,3,126);return Math.abs(yt(i,t,5,2,127)-.5)<.06?[60,30,26,255]:[..._t([230,70,20],[255,200,60],s),255]},(i,t,e,n)=>Pe(i*5,t*5,5,5,128)>.72?[...tt([240,236,226],xt(e,n,34,6)),255]:[...tt(_t([170,34,38],[214,60,56],yt(i,t,4,2,129)),xt(e,n,35,8)),255],(i,t,e,n)=>[...tt(_t([98,82,108],[140,120,150],yt(i,t,6,3,130)),xt(e,n,36,12)),255],(i,t,e,n)=>{const s=.16+.08*Pe(i*8,.5,8,1,131);return t<s?[...tt([120,100,130],xt(e,n,37,10)),255]:go(i,t,e,n)},(i,t,e,n)=>{const s=Math.floor(t*4),r=t*4%1;let a=_t([206,182,124],[226,204,150],yt(i,t,5,2,132+s));return r<.06&&(a=tt(a,-22)),[...tt(a,xt(e,n,38,6)),255]},(i,t,e,n)=>[...tt(_t([214,206,188],[240,234,222],Pe(i*8,t*2,8,2,133)),xt(e,n,39,6)),255],(i,t,e,n)=>{const s=yt(i,t,7,3,134),r=yt(i,t,8,2,135),a=_t([24,100,22],[70,170,40],s);return r>.68?[a[0],a[1],a[2],0]:[...tt(a,xt(e,n,40,10)),255]},(i,t,e,n)=>{const s=Math.floor(t*4),r=t*4%1;let a=_t([150,112,66],[182,140,88],yt(i*.5,t,6,2,140+s));return r<.05&&(a=tt(a,-40)),(Math.abs(i-.5)<.03||Math.abs(t-.5)<.03)&&(a=[84,58,34]),Math.min(i,t,1-i,1-t)<.08&&(a=[104,76,44]),[...tt(a,xt(e,n,41,8)),255]},(i,t,e,n)=>{let s=_t([150,112,66],[182,140,88],yt(i,t*.5,6,2,142));return t*4%1<.05&&(s=tt(s,-36)),t<.14&&(s=[110,80,46]),i>.18&&i<.44&&t>.32&&t<.5&&(s=[186,190,198]),i>.4&&i<.48&&t>.3&&t<.52&&(s=[90,60,34]),i>.6&&i<.66&&t>.3&&t<.78&&(s=[96,66,38]),i>.54&&i<.74&&t>.26&&t<.36&&(s=[120,124,132]),[...tt(s,xt(e,n,42,8)),255]},(i,t,e,n)=>{const s=Math.floor(t*4),r=s&1?.25:0,a=(i*2+r)%1,o=t*4%1;let l=_t([96,96,102],[132,132,138],yt(i,t,5,3,144));if((a<.05||o<.07)&&(l=tt(l,-38)),i>.26&&i<.74&&t>.52&&t<.86){const c=1-Math.abs(i-.5)*3;l=t>.68?_t([200,70,20],[255,190,60],c*Pe(i*8,t*8,8,8,145)):[26,22,22]}return[...tt(l,xt(e,n,43,8)),255]},(i,t,e,n)=>{let s=_t([100,100,106],[136,136,142],yt(i,t,5,3,146));return Math.abs(i-.5)<.16&&Math.abs(t-.5)<.16&&(s=[30,26,26]),[...tt(s,xt(e,n,44,8)),255]},(i,t,e,n)=>{const s=yt(i,t,8,3,147),r=Pe(i*16,t*16,16,16,148);return[...tt(_t([214,210,202],[246,244,238],s*.5+r*.5),xt(e,n,45,6)),255]},(i,t,e,n)=>{const s=t*5%1,r=s<.32;let a=_t([74,50,30],[104,72,46],yt(i,t,6,3,150));return r&&(a=tt(a,-22)),[...tt(a,xt(e,n,46,10)),255]},...[0,1,2,3].map(i=>(t,e,n,s)=>{const r=[.3,.52,.76,.92][i],a=[[70,170,50],[90,176,54],[150,176,60],[214,184,76]][i],o=Math.floor(t*8),l=t*8%1,c=r*(.8+.2*rn(o,i,151));return 1-e>c||l<.3||l>.7?i===3&&1-e>c-.22&&1-e<c+.04&&l>.15&&l<.85&&rn(n>>1,s>>1,152)>.3?[228,196,90,255]:[0,0,0,0]:[...tt(a,xt(n,s,47+i,16)-(1-e)*20),255]}),(i,t,e,n)=>{const s=yt(i,t,6,3,160),r=Pe(i*16,t*16,16,16,161);let a=_t([128,110,84],[160,142,112],s);return r>.72?a=tt(a,22):r<.22&&(a=tt(a,-18)),[...tt(a,xt(e,n,50,10)),255]},(i,t,e,n)=>{const s=(h,u)=>rn(Math.floor(h),Math.floor(u),162),r=i*4+(Math.floor(t*4)&1)*.5,a=t*4,o=r%1,l=a%1;let c=_t([96,96,100],[150,150,156],s(r,a)*.6+yt(i,t,5,2,163)*.4);return(o<.08||l<.1)&&(c=[64,64,68]),[...tt(c,xt(e,n,51,8)),255]},...[0,1].map(i=>(t,e,n,s)=>{let r=_t([110,110,116],[140,140,146],yt(t,e,5,2,164));Math.abs(t-.5)<.2&&Math.abs(e-.5)<.3&&(r=[70,70,76]);const a=.5+(i?.12:-.12)*(.5-e)*2;return Math.abs(t-a)<.05&&e>.25&&e<.6&&(r=[138,98,54]),Math.abs(t-(i?.62:.38))<.08&&e>.2&&e<.3&&(r=i?[80,240,120]:[200,60,60]),[...tt(r,xt(n,s,52,6)),255]}),(i,t,e,n)=>{let s=_t([84,84,92],[112,112,120],yt(i,t,5,2,165));return(Math.abs(i-.5)<.07||Math.abs(t-.5)<.07)&&(s=[214,128,60]),Math.abs(i-.5)<.12&&Math.abs(t-.5)<.12&&(s=[240,160,80]),[...tt(s,xt(e,n,53,6)),255]},(i,t,e,n)=>{let s=_t([60,64,76],[86,90,104],yt(i,t,5,2,166));const r=Math.hypot(i-.5,t-.5);return r<.18?s=_t([60,200,240],[180,250,255],1-r/.18):r<.24&&(s=[200,120,60]),[...tt(s,xt(e,n,54,6)),255]},(i,t,e,n)=>{let s=_t([56,60,72],[80,84,98],yt(i,t,5,2,167));const r=Math.hypot(i-.5,t-.15);return t>.15&&Math.abs(r*5%1-.5)<.09&&r<.75&&(s=[106,232,255]),t>.82&&(s=[200,120,60]),[...tt(s,xt(e,n,55,6)),255]},(i,t,e,n)=>{let s=_t([70,74,86],[98,102,116],yt(i,t,5,2,168));return(i*6%1<.12||t*6%1<.12)&&(s=[180,110,56]),Math.hypot(i-.5,t-.5)<.12&&(s=[106,232,255]),[...tt(s,xt(e,n,56,6)),255]},...[0,1].map(i=>(t,e,n,s)=>{let r=_t([48,52,62],[70,74,86],yt(t,e,5,2,169));const a=Math.hypot(t-.5,e-.58);return a<.26&&a*14%1<.5&&(r=[30,32,40]),e<.2&&Math.abs(t-.5)<.3&&(r=i?[90,255,140]:[90,40,40]),[...tt(r,xt(n,s,57,6)),255]}),...[0,1].map(i=>(t,e,n,s)=>{if(Math.min(t,e,1-t,1-e)<.1)return[...tt([150,96,52],xt(n,s,58,8)),255];const a=yt(t,e,4,2,170);return[...tt(i?_t([255,200,90],[255,240,170],a):_t([86,70,50],[110,92,66],a),xt(n,s,59,6)),255]}),(i,t,e,n)=>{let s=_t([150,152,160],[188,190,198],yt(i,t,4,2,171));return(t*2%1<.05||i<.05||i>.95)&&(s=[96,98,106]),Math.hypot(i*4%1-.5,t*2%1-.2)<.09&&(s=[110,112,120]),[...tt(s,xt(e,n,60,6)),255]},(i,t,e,n)=>Math.min(i,t,1-i,1-t)>.1?[0,0,0,0]:[...tt([120,122,130],xt(e,n,61,8)),255],(i,t,e,n)=>Math.abs(i-.22)<.055||Math.abs(i-.78)<.055?[...tt(_t([150,150,158],[200,200,208],1-Math.abs(i-(i<.5?.22:.78))/.055),xt(e,n,62,6)),255]:t*4%1<.42&&i>.08&&i<.92?[...tt(_t([104,72,42],[132,94,56],yt(i,t,6,2,172)),xt(e,n,63,8)),255]:[0,0,0,0],(i,t,e,n)=>{const s=Math.floor(t*4),r=i*2+(s&1)*.5,a=r%1,o=t*4%1;let l=_t([112,114,120],[150,152,158],rn(Math.floor(r),s,180)*.5+yt(i,t,6,2,181)*.5);return a<.04||o<.08?l=[78,78,84]:o<.16&&(l=tt(l,12)),[...tt(l,xt(e,n,70,7)),255]},(i,t,e,n)=>{const s=Math.min(i,t,1-i,1-t);let r=_t([150,152,158],[176,178,184],yt(i,t,3,3,182));return s<.04?r=[118,120,126]:s<.08&&(r=tt(r,14)),[...tt(r,xt(e,n,71,4)),255]},(i,t,e,n)=>{const s=Xi[8](i,t,e,n);return[s[0]*.5,s[1]*.4,s[2]*.34,255]},(i,t,e,n)=>{const s=Xi[8](i,t,e,n);return[Math.min(255,s[0]*1.2+30),Math.min(255,s[1]*1.2+30),Math.min(255,s[2]*1.15+34),255]},(i,t,e,n)=>{const s=Math.floor(t*5),r=i*4+(s&1)*.5,a=t*5%1,o=r%1;let l=_t([150,58,44],[196,86,62],rn(Math.floor(r),s,183)*.5+yt(i,t,6,2,184)*.4);return l=tt(l,(a-.5)*-40),(a>.88||o<.05)&&(l=[96,34,28]),[...tt(l,xt(e,n,72,8)),255]},(i,t,e,n)=>{const s=t*2%1;if(s<.14||i<.06||i>.94){const h=Xi[8](i,t,e,n);return[h[0]*.8,h[1]*.8,h[2]*.8,255]}const r=Math.floor(i*9)+Math.floor(t*2)*9,a=rn(r,1,185),o=.14+rn(r,2,186)*.25;if(s<o)return[40,28,18,255];const l=[[160,40,40],[40,90,160],[50,130,60],[190,150,50],[110,60,140],[180,100,40]];let c=l[Math.floor(a*l.length)];return i*9%1<.1&&(c=tt(c,-40)),Math.abs(s-.55)<.04&&(c=tt(c,50)),[...tt(c,xt(e,n,73,8)),255]},(i,t,e,n)=>{if(Math.min(i,t,1-i,1-t)<.12||Math.abs(i-.5)<.04)return[...tt([52,52,58],xt(e,n,74,8)),255];const r=Math.hypot(i-.5,t-.55);return[..._t([255,236,170],[255,170,60],Math.min(1,r*2.2)),255]},...[[[186,98,52],[236,150,92]],[[176,178,186],[226,228,234]]].map(([i,t],e)=>(n,s,r,a)=>{const o=Math.min(n,s,1-n,1-s);let l=_t(i,t,yt(n,s,3,2,187+e)*.6+(1-s)*.4);return o<.05?l=tt(l,-50):o<.09&&(l=tt(l,26)),Math.hypot(n*2%1-.5,s*2%1-.5)>.44&&o>.09&&o<.16&&(l=tt(l,-30)),[...tt(l,xt(r,a,75+e,5)),255]}),(i,t,e,n)=>{let s=_t([196,160,64],[232,204,100],Pe(i*3,t*40,3,40,189));return(Math.abs(t-.3)<.04||Math.abs(t-.7)<.04)&&(s=[120,84,40]),[...tt(s,xt(e,n,77,12)),255]},(i,t,e,n)=>{const s=Math.hypot(i-.5,t-.5);let r=_t([200,166,70],[238,210,110],(s*14+yt(i,t,6,2,190)*2)%1);return(Math.abs(i-.3)<.04||Math.abs(i-.7)<.04)&&(r=[120,84,40]),[...tt(r,xt(e,n,78,10)),255]},...[[236,238,240],[36,38,44],[190,44,44],[232,120,30],[240,200,40],[70,160,60],[40,90,190],[130,60,180]].map((i,t)=>(e,n,s,r)=>[...tt(tt(i,(yt(e,n,5,3,191+t)-.5)*18),xt(s,r,79+t,7)),255]),...[[220,60,70],[70,120,230],[70,200,110]].map((i,t)=>(e,n,s,r)=>{if(Math.min(e,n,1-e,1-n)<.06)return[...tt(_t(i,[255,255,255],.35),xt(s,r,90+t,6)),255];const o=(e+n)%.5<.06?40:0;return[...tt(i,o),120]}),(i,t,e,n)=>{const s=Math.min(i,1-i),r=Xi[8](i,t,e,n);let a=[r[0]*.8,r[1]*.68,r[2]*.56];return(s<.1||t<.06||t>.94||Math.abs(t-.5)<.03)&&(a=tt(a,-34)),t<.4&&t>.12&&s>.18?[150,200,230,150]:(Math.hypot(i-.8,t-.55)<.05&&(a=[210,190,90]),[...a,255])},(i,t,e,n)=>{if(Math.abs(i-.18)<.07||Math.abs(i-.82)<.07||t*4%1<.16&&i>.12&&i<.88){const s=Xi[8](i,t,e,n);return[s[0]*.85,s[1]*.8,s[2]*.75,255]}return[0,0,0,0]}];Xi.length;const KM=new Set([76,77,78,79,80,83,84,85,87,88,89,90,91,92,93,94,0,1,2,3,4,5,6,8,14,15,18,19,25,26,27,28,29,30,31,32,33,35,37,38,39,41,42,43,45,46,47,48,49,52,53,54,55,61,63,64,65,66,67,68,69,70,73]);function YM(){const i=document.createElement("canvas");i.width=we*Qs,i.height=we*Ef;const t=i.getContext("2d"),e=t.createImageData(we,we),n=e.data,s=we*Qs,r=we*Ef,a=new Uint8Array(s*r*4);for(let o=0;o<Xi.length;o++){for(let l=0;l<we;l++)for(let c=0;c<we;c++){const h=Xi[o]((c+.5)/we,(l+.5)/we,c,l),u=(l*we+c)*4;let f=0;if(KM.has(o)){const v=Math.min(c,l,we-1-c,we-1-l);v<3&&(f=(c<we/2&&c<=l||l<we/2&&l<c?16:-20)*(1-v/3))}n[u]=Math.max(0,Math.min(255,h[0]+f)),n[u+1]=Math.max(0,Math.min(255,h[1]+f)),n[u+2]=Math.max(0,Math.min(255,h[2]+f)),n[u+3]=Math.max(0,Math.min(255,h[3]));const p=((r-1-(Math.floor(o/Qs)*we+l))*s+o%Qs*we+c)*4;a[p]=n[u],a[p+1]=n[u+1],a[p+2]=n[u+2],a[p+3]=n[u+3]}t.putImageData(e,o%Qs*we,Math.floor(o/Qs)*we)}return i.raw=a,i}function jM(i,t){const e=document.createElement("canvas");e.width=e.height=Xr*Yl;const n=e.getContext("2d");n.fillStyle="#0e1224",n.fillRect(0,0,e.width,e.height);let s=bf;for(let r=0;r<bf;r++){const a=new Image,o=String(r+1).padStart(2,"0"),l=()=>{--s===0&&t&&t()};a.onload=()=>{n.drawImage(a,r%Yl*Xr,Math.floor(r/Yl)*Xr,Xr,Xr),i&&i(),l()},a.onerror=l,a.src=`logos/${o}.png`}return e}function ZM(){const t=document.createElement("canvas");t.width=t.height=128;const e=t.getContext("2d"),n=e.createImageData(128,128);for(let s=0;s<128;s++)for(let r=0;r<128;r++){const a=yt((r+.5)/128,(s+.5)/128,4,4,77),o=Math.max(0,Math.min(1,(a-.5)/.18)),l=(s*128+r)*4;n.data[l]=n.data[l+1]=n.data[l+2]=255,n.data[l+3]=o*o*(3-2*o)*255}return e.putImageData(n,0,0),t}const ia=32,qi=8;function JM(i){const t=document.createElement("canvas");t.width=ia*qi,t.height=ia*Math.max(1,Math.ceil(i.length/qi));const e=t.getContext("2d");return i.forEach((n,s)=>{const r=s%qi*ia,a=Math.floor(s/qi)*ia,o=(p,v,_,m=1,d=1)=>{e.fillStyle=_,e.fillRect(r+p*2,a+v*2,m*2,d*2)},l=(p=2)=>{for(let v=p;v<14;v++)o(v,15-v,"#5a3a1e"),o(v,14-v,"#8a6034")},c=(p,v)=>{const _=parseInt(p.slice(1),16),m=d=>Math.max(0,Math.min(255,Math.round(d*v)));return`rgb(${m(_>>16)},${m(_>>8&255)},${m(_&255)})`},h=n.col||"#ccc",u=c(h,.62),f=c(h,1.18);switch(n.draw){case"stick":l(1);break;case"ingot":for(let p=0;p<5;p++)o(3+p,6+p,p?h:f,10-p,1);o(3,11,u,10,1),o(12,6,u,1,5);break;case"apple":o(5,5,"#c82a2a",7,8),o(4,6,"#c82a2a",9,6),o(6,6,"#f06a5a",2,2),o(5,12,"#8a1a1a",7,1),o(8,2,"#5a3a1e",1,3),o(9,2,"#3c8a2a",3,2);break;case"meat":o(3,5,h,9,7),o(2,6,h,11,5),o(4,6,f,3,2),o(3,11,u,9,1),o(12,9,"#efe6d2",2,2),o(13,8,"#efe6d2",2,1),o(13,11,"#efe6d2",2,1);break;case"spitzhacke":l(3);for(let p=0;p<10;p++){const v=3+p,_=2+Math.round(Math.abs(p-4.5)*.55);o(v,_,h),o(v,_+1,u)}o(3,4,f),o(12,4,f);break;case"axt":l(3),o(8,2,h,4,5),o(7,3,h,1,4),o(12,3,u,1,3),o(8,2,f,4,1),o(8,6,u,4,1);break;case"schaufel":l(5),o(10,2,h,4,4),o(9,3,h,1,3),o(14,3,u,1,3),o(10,2,f,4,1),o(11,6,u,2,1);break;case"hacke":l(3),o(9,2,h,5,2),o(12,4,h,2,2),o(9,2,f,5,1),o(13,4,u,1,2);break;case"schwert":for(let p=0;p<9;p++)o(5+p,10-p,h),o(6+p,10-p,f),o(5+p,11-p,u);o(3,10,"#5a3a1e",4,1),o(5,8,"#5a3a1e",1,5),o(2,13,"#8a6034",2,2),o(4,11,"#8a6034",1,2);break;case"seeds":[[4,6],[8,4],[10,8],[6,10],[11,11],[5,13],[9,12]].forEach(([p,v])=>{o(p,v,"#c8b060",2,1),o(p,v+1,"#8a7a3a",2,1)});break;case"wheat":for(let p=0;p<3;p++){const v=5+p*3;o(v,7,"#6a8a2a",1,8),o(v-1,2,"#e0c060",3,5),o(v,1,"#f0d880",1,2)}o(4,11,"#8a6a2a",9,1);break;case"bread":o(2,6,"#c8843c",12,6),o(3,5,"#d89848",10,1),o(2,12,"#8a5420",12,1);for(let p=0;p<3;p++)o(4+p*3,7,"#f0c070",2,1);break;case"helm":o(4,4,h,8,3),o(3,6,h,10,4),o(3,10,u,3,2),o(10,10,u,3,2),o(5,4,f,5,1),o(6,8,"#1a1a22",4,1);break;case"harnisch":o(3,3,h,3,3),o(10,3,h,3,3),o(4,5,h,8,8),o(5,5,f,2,6),o(4,12,u,8,1),o(7,3,u,2,3);break;case"boot":o(1,8,h,14,3),o(2,11,u,12,2),o(3,13,u,10,1),o(1,7,f,14,1),o(4,9,"#5a3a1e",8,1),o(7,2,"#5a3a1e",1,6),o(8,3,"#efe6d2",4,3);break;case"lore":o(2,5,h,12,6),o(2,5,f,12,1),o(3,6,u,10,1),o(2,10,u,12,1),o(3,11,"#2a2a30",3,3),o(10,11,"#2a2a30",3,3),o(4,12,"#6a6a72",1,1),o(11,12,"#6a6a72",1,1);break;default:o(4,4,h,8,8)}}),t}const Tf=64,Go={boot:{item:K.BOAT,half:.6,h:.55,seat:.25,max:7,name:"Boot"},lore:{item:K.MINECART,half:.45,h:.75,seat:.3,max:10,name:"Lore"}},pi=[[1,0],[0,1],[-1,0],[0,-1]],QM=(i,t)=>Math.atan2(-i,-t),Af=.001;class wf{constructor(t,e,n,s,r=0){this.kind=t,this.K=Go[t],this.x=e,this.y=n,this.z=s,this.yaw=r,this.speed=0,this.vy=0,this.rider=!1,this.t=0,this.rail=null}}class ty{constructor(t,e){if(this.world=t,this.list=[],this.onAdd=()=>{},this.onRemove=()=>{},Array.isArray(e))for(const n of e)!Array.isArray(n)||!Go[n[0]]||!n.slice(1,5).every(Number.isFinite)||this.list.length>=Tf||this.list.push(new wf(n[0],n[1],n[2],n[3],n[4]))}attach(){for(const t of this.list)this.onAdd(t)}add(t,e,n,s,r=0){if(!Go[t]||this.list.length>=Tf)return null;const a=new wf(t,e,n,s,r);return t==="lore"&&!this.snapRail(a,r)?null:(this.list.push(a),this.onAdd(a),a)}remove(t){const e=this.list.indexOf(t);e<0||(this.list.splice(e,1),this.onRemove(t))}clear(){for(const t of this.list.slice())this.remove(t)}serialize(){return this.list.map(t=>[t.kind,+t.x.toFixed(2),+t.y.toFixed(2),+t.z.toFixed(2),+t.yaw.toFixed(2)])}raycast(t,e,n,s,r,a,o){let l=null;for(const c of this.list){const h=c.K.half,u=[c.x-h,c.y,c.z-h],f=[c.x+h,c.y+c.K.h,c.z+h],p=[t,e,n],v=[s,r,a];let _=0,m=o;for(let d=0;d<3&&_<=m;d++){if(Math.abs(v[d])<1e-9){(p[d]<u[d]||p[d]>f[d])&&(_=1/0);continue}let x=(u[d]-p[d])/v[d],M=(f[d]-p[d])/v[d];x>M&&([x,M]=[M,x]),_=Math.max(_,x),m=Math.min(m,M)}_<=m&&(!l||_<l.t)&&(l={veh:c,t:_})}return l}update(t,e,n){for(const s of this.list){const r=this.world;if(r.isLoaded&&!r.isLoaded(Math.floor(s.x),Math.floor(s.z)))continue;const a=Math.max(1,Math.ceil(t*60-1e-9)),o=t/a,l=s===e?n:null;for(let c=0;c<a;c++)s.kind==="boot"?this.stepBoat(s,o,l):this.stepCart(s,o,l);s.t+=t*Math.abs(s.speed)}}waterTop(t,e,n){const s=this.world,r=Math.floor(t),a=Math.floor(n);let o=Math.floor(e+.3);if(s.getBlock(r,o,a)!==g.WATER&&(o--,s.getBlock(r,o,a)!==g.WATER))return null;for(let l=0;l<4&&s.getBlock(r,o+1,a)===g.WATER;l++)o++;return o+1-.12}boxHits(t,e,n,s){const r=this.world,a=t.K.half;for(let o=Math.floor(n);o<=Math.floor(n+t.K.h-1e-7);o++)for(let l=Math.floor(s-a);l<=Math.floor(s+a-1e-7);l++)for(let c=Math.floor(e-a);c<=Math.floor(e+a-1e-7);c++)if(r.isSolid(c,o,l))return!0;return!1}stepBoat(t,e,n){const s=this.waterTop(t.x,t.y,t.z),r=s!==null;n&&(t.yaw-=n.r*1.9*e*(r?1:.3),t.speed+=n.f*(r?5:1.2)*e);const a=r?t.K.max:1.2;t.speed=Math.max(-a*.5,Math.min(a,t.speed)),t.speed-=t.speed*Math.min(1,(r?.6:4)*e),Math.abs(t.speed)<.01&&(t.speed=0),r?(t.vy+=(s-.3-t.y)*30*e,t.vy-=t.vy*Math.min(1,6*e)):t.vy=Math.max(-30,t.vy-25*e);const o=-Math.sin(t.yaw)*t.speed*e,l=-Math.cos(t.yaw)*t.speed*e;this.boxHits(t,t.x+o,t.y,t.z)?t.speed*=.2:t.x+=o,this.boxHits(t,t.x,t.y,t.z+l)?t.speed*=.2:t.z+=l;const c=t.y+t.vy*e;this.boxHits(t,t.x,c,t.z)?(t.vy<0&&(t.y=Math.floor(c)+1+Af),t.vy=0):t.y=c}isRail(t,e,n){return this.world.getBlock(t,e,n)===g.RAIL}nextRail(t,e,n,s){const[r,a]=pi[s];for(const o of[0,1,-1])if(this.isRail(t+r,e+o,n+a))return[t+r,e+o,n+a];return null}snapRail(t,e){const n=Math.floor(t.x),s=Math.floor(t.z);let r=Math.floor(t.y+.5);if(!this.isRail(n,r,s)&&(r--,!this.isRail(n,r,s)))return!1;const a=-Math.sin(e),o=-Math.cos(e),l=[0,1,2,3].sort((h,u)=>pi[u][0]*a+pi[u][1]*o-(pi[h][0]*a+pi[h][1]*o)),c=l.find(h=>this.nextRail(n,r,s,h))??l[0];return t.rail={x:n,y:r,z:s,d:c,p:0},t.speed=0,t.vy=0,this.placeOnRail(t),!0}placeOnRail(t){const e=t.rail,[n,s]=pi[e.d],r=this.nextRail(e.x,e.y,e.z,e.d),a=r?r[1]:e.y;t.x=e.x+.5+n*e.p,t.z=e.z+.5+s*e.p,t.y=e.y+.0625+(a-e.y)*e.p,t.yaw=QM(n,s)}stepCart(t,e,n){const s=t.rail;if(!s||!this.isRail(s.x,s.y,s.z)){t.rail=null,t.speed=0,t.vy=Math.max(-30,t.vy-25*e);const o=t.y+t.vy*e;this.boxHits(t,t.x,o,t.z)?(t.vy<0&&(t.y=Math.floor(o)+1+Af),t.vy=0):t.y=o,t.vy===0&&this.snapRail(t,t.yaw);return}if(n){const o=n.look||pi[s.d];if(n.f>.2&&t.speed<.3&&o[0]*pi[s.d][0]+o[1]*pi[s.d][1]<-.2){const l=this.nextRail(s.x,s.y,s.z,s.d);s.d=(s.d+2)%4,l&&s.p>0&&(s.x=l[0],s.y=l[1],s.z=l[2],s.p=1-s.p)}t.speed+=(n.f>0?n.f*4:n.f*8)*e}const r=this.nextRail(s.x,s.y,s.z,s.d);r&&(t.speed-=(r[1]-s.y)*7*e),t.speed-=t.speed*Math.min(1,.25*e),t.speed=Math.max(0,Math.min(t.K.max,t.speed)),t.speed<.02&&(t.speed=0);let a=t.speed*e;for(let o=0;a>0&&o<4;o++){const l=this.nextRail(s.x,s.y,s.z,s.d);if(!l){s.p=0,t.speed=0;break}const c=1-s.p;if(a<c){s.p+=a,a=0;break}if(a-=c,s.x=l[0],s.y=l[1],s.z=l[2],s.p=0,!this.nextRail(s.x,s.y,s.z,s.d)){const h=[1,3].map(u=>(s.d+u)%4).find(u=>this.nextRail(s.x,s.y,s.z,u));h!==void 0&&(s.d=h,t.speed*=.85)}}this.placeOnRail(t)}exitSpot(t,e){const n=[[0,t.K.h+.05,0],[1.2,.1,0],[-1.2,.1,0],[0,.1,1.2],[0,.1,-1.2],[1.2,1.1,0],[-1.2,1.1,0],[0,1.1,1.2],[0,1.1,-1.2]];for(const[s,r,a]of n)if(!e(t.x+s,t.y+r,t.z+a))return[t.x+s,t.y+r,t.z+a];return[t.x,t.y+t.K.h+.05,t.z]}}const ey=[[[-.2,.25,-.25,.2,.6,.27,16052972],[-.13,.5,-.42,.13,.82,-.18,16052972],[-.06,.6,-.52,.06,.68,-.42,15769632],[-.03,.82,-.36,.03,.9,-.24,14168112],[-.13,0,-.04,-.07,.25,.02,15249456],[.07,0,-.04,.13,.25,.02,15249456]],[[-.4,.45,-.6,.4,1.08,.6,15526626],[-.2,.72,-.95,.2,1.12,-.56,13154464],[-.21,1,-.9,.21,1.16,-.6,15526626],[-.32,0,-.5,-.14,.46,-.32,4867136],[.14,0,-.5,.32,.46,-.32,4867136],[-.32,0,.32,-.14,.46,.5,4867136],[.14,0,.32,.32,.46,.5,4867136]],[[-.42,.55,-.7,.42,1.22,.7,6964264],[-.43,.75,-.2,.43,1.12,.25,15920870],[-.25,.85,-1.08,.25,1.36,-.7,5913122],[-.16,.86,-1.13,.16,1.02,-1.06,15118496],[-.32,1.3,-.95,-.24,1.46,-.88,15262416],[.24,1.3,-.95,.32,1.46,-.88,15262416],[-.36,0,-.62,-.16,.56,-.42,3811354],[.16,0,-.62,.36,.56,-.42,3811354],[-.36,0,.42,-.16,.56,.62,3811354],[.16,0,.42,.36,.56,.62,3811354]],[[-.28,.75,-.16,.28,1.35,.16,2761792],[-.22,1.35,-.22,.22,1.75,.22,3419218],[-.15,1.52,-.24,-.05,1.6,-.21,7008511],[.05,1.52,-.24,.15,1.6,-.21,7008511],[-.02,1.75,-.02,.02,1.98,.02,9076912],[-.05,1.96,-.05,.05,2.04,.05,16727180],[-.42,.8,-.08,-.28,1.32,.08,2761792],[.28,.8,-.08,.42,1.32,.08,2761792],[-.22,0,-.1,-.04,.75,.1,2235446],[.04,0,-.1,.22,.75,.1,2235446]],[[-.42,.25,-.3,.42,.72,.5,3816004],[-.28,.3,-.62,.28,.66,-.3,2763314],[-.2,.5,-.64,-.08,.6,-.61,16724016],[.08,.5,-.64,.2,.6,-.61,16724016],...[-.2,.1,.35].flatMap(i=>[[-.82,0,i-.05,-.42,.4,i+.05,2368556],[.42,0,i-.05,.82,.4,i+.05,2368556]])],[[-.35,.15,-.35,.35,.42,.35,5265512],[-.2,.42,-.2,.2,.56,.2,2764344],[-.1,.2,-.38,.1,.34,-.35,16719952],[-.03,.56,-.03,.03,.7,.03,9079446],...[[-1,-1],[1,-1],[1,1],[-1,1]].map(([i,t])=>[i*.55-.13,.44,t*.55-.13,i*.55+.13,.48,t*.55+.13,10133676])],[[-.2,0,-.1,-.02,.7,.1,4864554],[.02,0,-.1,.2,.7,.1,4864554],[-.25,.7,-.15,.25,1.35,.15,3828384],[-.2,.75,-.17,.2,1.2,-.15,9071168],[-.36,.8,-.08,-.25,1.3,.08,3828384],[.25,.8,-.08,.36,1.3,.08,3828384],[-.2,1.35,-.2,.2,1.73,.2,15253658],[-.22,1.68,-.22,.22,1.82,.22,6965802],[-.12,1.52,-.22,-.05,1.58,-.2,2105376],[.05,1.52,-.22,.12,1.58,-.2,2105376]]],ny=[.8,.8,1,.5,.68,.68];function rr(i){const t=[],e=[],n=[],s=new Jt;for(const[a,o,l,c,h,u,f]of i){const p=new es(c-a,h-o,u-l);p.translate((a+c)/2,(o+h)/2,(l+u)/2);const v=p.attributes.position.array,_=t.length/3;s.setHex(f);for(let m=0;m<v.length/3;m++){const d=ny[Math.floor(m/4)];t.push(v[m*3],v[m*3+1],v[m*3+2]),e.push(s.r*d,s.g*d,s.b*d)}for(const m of p.index.array)n.push(_+m);p.dispose()}const r=new Ie;return r.setAttribute("position",new Fe(t,3)),r.setAttribute("color",new Fe(e,3)),r.setIndex(n),r.computeBoundingSphere(),r}class iy{constructor(t){this.group=new Yn,t.add(this.group),this.geos=ey.map(rr),this.meshes=new Map}add(t){const e=new Te(this.geos[t.type],new jn({vertexColors:!0}));e.matrixAutoUpdate=!0,this.group.add(e),this.meshes.set(t,e)}remove(t){const e=this.meshes.get(t);e&&(this.group.remove(e),e.material.dispose(),this.meshes.delete(t))}update(t,e,n,s,r){for(const[a,o]of this.meshes){const l=Math.hypot(a.x-t,a.z-e);if(o.visible=l<s,!o.visible)continue;const c=a.moving?Math.abs(Math.sin(r*9+a.x))*.05:0,h=a.hostile?Math.max(n,.7)*(.85+.15*Math.sin(r*23+a.z)):n;o.position.set(a.x,a.y+c,a.z),o.rotation.y=a.yaw,a.hurtT>0?o.material.color.setRGB(h*1.3,h*.45,h*.45):o.material.color.setRGB(h,h,h)}}clear(){for(const t of[...this.meshes.keys()])this.remove(t)}}const sy=[[-.6,0,-.75,.6,.12,.75,6965802],[-.6,.12,-.75,-.48,.5,.75,11041350],[.48,.12,-.75,.6,.5,.75,11041350],[-.48,.12,.63,.48,.5,.75,11041350],[-.48,.12,-.95,.48,.45,-.75,10120766],[-.48,.28,-.1,.48,.34,.12,8016944]],ry=[[-.03,-.05,-.03,.03,.75,.03,5913118],[-.08,-.32,-.02,.08,-.05,.02,9068596]],ay=[[-.45,.18,-.55,.45,.26,.55,5921892],[-.45,.26,-.55,-.37,.72,.55,9079956],[.37,.26,-.55,.45,.72,.55,9079956],[-.37,.26,-.55,.37,.72,-.47,8027268],[-.37,.26,.47,.37,.72,.55,8027268],[-.45,.66,-.55,.45,.72,-.5,12088364],[-.45,.66,.5,.45,.72,.55,12088364]],oy=[[-.04,-.12,-.12,.04,.12,.12,2763312],[-.05,-.03,-.03,.05,.03,.03,10132130],[-.045,-.12,-.02,.045,.12,.02,4868690]];class ly{constructor(t){this.group=new Yn,t.add(this.group),this.geo={hull:rr(sy),paddle:rr(ry),cart:rr(ay),wheel:rr(oy)},this.items=new Map}add(t){const e=new jn({vertexColors:!0}),n=new Yn,s=[];if(t.kind==="boot"){n.add(new Te(this.geo.hull,e));for(const r of[-1,1]){const a=new Te(this.geo.paddle,e);a.position.set(r*.62,.45,.05),n.add(a),s.push(a)}}else{n.add(new Te(this.geo.cart,e));for(const[r,a]of[[-.48,-.35],[.48,-.35],[-.48,.35],[.48,.35]]){const o=new Te(this.geo.wheel,e);o.position.set(r,.12,a),n.add(o),s.push(o)}}this.group.add(n),this.items.set(t,{root:n,parts:s,mat:e})}remove(t){const e=this.items.get(t);e&&(this.group.remove(e.root),e.mat.dispose(),this.items.delete(t))}clear(){for(const t of[...this.items.keys()])this.remove(t)}update(t,e,n,s,r){for(const[a,o]of this.items){const l=Math.hypot(a.x-t,a.z-e)<s;if(o.root.visible=l,!!l)if(o.root.position.set(a.x,a.y,a.z),o.root.rotation.y=a.yaw,o.mat.color.setRGB(n,n,n),a.kind==="boot")o.root.rotation.z=Math.sin(r*1.7+a.x)*.04,o.root.rotation.x=Math.sin(r*1.3+a.z)*.03,o.parts.forEach((c,h)=>{c.rotation.x=Math.sin(a.t*2.2+h*Math.PI)*.7,c.rotation.z=(h?-1:1)*.5});else{o.parts.forEach(u=>{u.rotation.x=-a.t/.12});const c=a.rail,h=c?a.y-(c.y+.0625):0;o.root.rotation.x=h>.01?Math.PI/4:h<-.01?-Math.PI/4:0}}}}const $r=[{key:"einzeln",name:"Einzeln",clicks:1},{key:"linie",name:"Linie",clicks:2},{key:"flaeche",name:"Fläche",clicks:2},{key:"wand",name:"Wand",clicks:2},{key:"saeule",name:"Säule",clicks:2},{key:"kopieren",name:"Kopieren",clicks:2,creative:!0},{key:"einfuegen",name:"Einfügen",clicks:1,creative:!0}],nh={creative:8192,survival:512},cy=32768,mi=(i,t)=>{const e=[],n=i<=t?1:-1;for(let s=i;s!==t+n;s+=n)e.push(s);return e};function hy(i,t,e,n=nh.creative){const s=[],r=(c,h,u)=>(h>=0&&h<ie&&s.push([c,h,u]),s.length<=n);if(i==="linie"){const c=Math.max(Math.abs(e[0]-t[0]),Math.abs(e[1]-t[1]),Math.abs(e[2]-t[2]));if(c+1>n)return null;for(let h=0;h<=c;h++){const u=c?h/c:0;r(Math.round(t[0]+(e[0]-t[0])*u),Math.round(t[1]+(e[1]-t[1])*u),Math.round(t[2]+(e[2]-t[2])*u))}return s}let a,o,l;if(i==="flaeche")a=mi(t[0],e[0]),o=[t[1]],l=mi(t[2],e[2]);else if(i==="saeule")a=[t[0]],o=mi(t[1],e[1]),l=[t[2]];else if(i==="wand")o=mi(t[1],e[1]),Math.abs(e[0]-t[0])>=Math.abs(e[2]-t[2])?(a=mi(t[0],e[0]),l=[t[2]]):(a=[t[0]],l=mi(t[2],e[2]));else if(i==="kopieren")a=mi(t[0],e[0]),o=mi(t[1],e[1]),l=mi(t[2],e[2]);else return[t.slice()];if(a.length*o.length*l.length>n)return null;for(const c of o)for(const h of l)for(const u of a)r(u,c,h);return s}function ih(i,t){return[Math.min(i[0],t[0]),Math.min(i[1],t[1]),Math.min(i[2],t[2]),Math.max(i[0],t[0]),Math.max(i[1],t[1]),Math.max(i[2],t[2])]}function uy(i,t,e){const[n,s,r,a,o,l]=ih(t,e),c=a-n+1,h=o-s+1,u=l-r+1;if(c*h*u>cy)return null;const f=new Uint8Array(c*h*u);let p=0;for(let v=0;v<h;v++)for(let _=0;_<u;_++)for(let m=0;m<c;m++){const d=i.getBlock(n+m,s+v,r+_);f[m+_*c+v*c*u]=d===g.WATER?g.AIR:d,d&&d!==g.WATER&&p++}return{sx:c,sy:h,sz:u,data:f,n:p}}function fy(i,t){const e=[];for(let n=0;n<i.sy;n++)for(let s=0;s<i.sz;s++)for(let r=0;r<i.sx;r++){const a=i.data[r+s*i.sx+n*i.sx*i.sz];a&&t[1]+n>=0&&t[1]+n<ie&&e.push([t[0]+r,t[1]+n,t[2]+s,a])}return e}const sh=20,Rf=64,We=4,fn=32,dy=i=>{let t="";for(const e of i)t+=String.fromCharCode(e);return btoa(t)},py=i=>{const t=atob(i),e=new Uint8Array(128);for(let n=0;n<Math.min(128,t.length);n++)e[n]=t.charCodeAt(n);return e},Cf=i=>Number.isFinite(i);class my{constructor(t){this.regions=new Map,this.marks=[],this.radios=new Map,this.tiles=new Map,this.count=0;const e=t&&typeof t=="object"?t:{};if(e.seen&&typeof e.seen=="object"){for(const[n,s]of Object.entries(e.seen))if(!(!/^-?\d+,-?\d+$/.test(n)||typeof s!="string"))try{const r=py(s);this.regions.set(n,r);for(const a of r)for(let o=a;o;o&=o-1)this.count++}catch{}}if(Array.isArray(e.marks))for(const n of e.marks.slice(0,sh))n&&Cf(n.x)&&Cf(n.z)&&this.marks.push({x:Math.round(n.x),z:Math.round(n.z),n:String(n.n||"Markierung").slice(0,24)});if(Array.isArray(e.radios))for(const n of e.radios.slice(0,Rf))Array.isArray(n)&&n.length===3&&n.every(Number.isInteger)&&this.radios.set(n.join(","),n)}has(t,e){const n=this.regions.get(`${Math.floor(t/fn)},${Math.floor(e/fn)}`);if(!n)return!1;const s=t-Math.floor(t/fn)*fn+(e-Math.floor(e/fn)*fn)*fn;return(n[s>>3]&1<<(s&7))!==0}mark(t,e){const n=`${Math.floor(t/fn)},${Math.floor(e/fn)}`;let s=this.regions.get(n);s||(s=new Uint8Array(128),this.regions.set(n,s));const r=t-Math.floor(t/fn)*fn+(e-Math.floor(e/fn)*fn)*fn;return s[r>>3]&1<<(r&7)?!1:(s[r>>3]|=1<<(r&7),this.count++,!0)}markAround(t,e,n){const s=Math.floor(t/F),r=Math.floor(e/F);let a=0;for(let o=-n;o<=n;o++)for(let l=-n;l<=n;l++)l*l+o*o<=n*n+1&&this.mark(s+l,r+o)&&a++;return a}syncRadios(t){for(const[e,n]of this.radios)t.getChunk(n[0]>>4,n[2]>>4)&&t.getBlock(n[0],n[1],n[2])!==g.RADIO&&this.radios.delete(e);for(const[e,n]of t.radios)this.radios.size<Rf&&this.has(n[0]>>4,n[2]>>4)&&this.radios.set(e,n)}addMark(t,e,n){return this.marks.length>=sh?!1:(this.marks.push({x:Math.round(t),z:Math.round(e),n:String(n||`Markierung ${this.marks.length+1}`).slice(0,24)}),!0)}removeMark(t){t>=0&&t<this.marks.length&&this.marks.splice(t,1)}serialize(){if(!this.count&&!this.marks.length)return;const t={};for(const[e,n]of this.regions)t[e]=dy(n);return{seen:t,marks:this.marks.length?this.marks:void 0,radios:this.radios.size?[...this.radios.values()]:void 0}}tile(t,e,n){const s=`${e},${n}`,r=t.getChunk(e,n);let a=this.tiles.get(s);if(a&&(a.real||!r))return a.px;this.tiles.size>6e3&&this.tiles.clear();const o=new Uint8ClampedArray(We*We*4),l={},c=F/We;for(let h=0;h<We;h++)for(let u=0;u<We;u++){const f=u*c+1,p=h*c+1,v=(h*We+u)*4;let _,m=1;if(r){const d=f+p*F;let x=Math.min(ie-1,r.maxY);for(;x>0&&r.data[d+x*F*F]===g.AIR;)x--;const M=r.data[d+x*F*F];_=Ht[M]&&Ht[M].map?Ht[M].map:[200,200,210],M!==g.WATER&&(m=Math.max(.6,Math.min(1.3,.85+(x-se)*.012)))}else{const d=e*F+f,x=n*F+p;if(t.gen>=2)Ri(t.seed,d,x,l),_=l.h<se?Js[0]:Js[l.biome],l.h>=se&&(m=Math.max(.6,Math.min(1.3,.85+(l.h-se)*.012)));else{const M=Co(t.seed,d,x);_=M<se?Js[0]:M<=se+1?Js[1]:M>40?Js[5]:Js[2]}}o[v]=_[0]*m,o[v+1]=_[1]*m,o[v+2]=_[2]*m,o[v+3]=255}return this.tiles.set(s,{px:o,real:!!r}),o}}const gy=90,Lf=4096,vy=(i,t)=>Math.max(0,Math.min(va.length-1,Math.floor((t-i)/gy))),_p=i=>va.includes(i);function _y(i,t=Math.random){return i===va[va.length-1]?[[K.WHEAT,1],[K.SEEDS,1+Math.floor(t()*2)]]:[[K.SEEDS,1]]}const Df=(i,t,e)=>i+","+t+","+e;class Pf{constructor(t){if(this.plants=new Map,t&&typeof t=="object")for(const[e,n]of Object.entries(t)){const s=e.split(",").map(Number);s.length===3&&s.every(Number.isInteger)&&Number.isFinite(n)&&this.plants.size<Lf&&this.plants.set(e,n)}}plant(t,e,n,s){return this.plants.size>=Lf?!1:(this.plants.set(Df(t,e,n),s),!0)}remove(t,e,n){this.plants.delete(Df(t,e,n))}update(t,e){let n=0;for(const[s,r]of this.plants){const[a,o,l]=s.split(",").map(Number);if(!t.isLoaded(a,l))continue;const c=t.getBlock(a,o,l);if(!_p(c)){this.plants.delete(s);continue}if(t.getBlock(a,o-1,l)!==g.FARMLAND){t.setBlock(a,o,l,g.AIR),this.plants.delete(s),n++;continue}const h=va[vy(r,e)];h!==c&&t.setBlock(a,o,l,h)&&n++}return n}serialize(){return Object.fromEntries(this.plants)}}const er=20,sa=20,Do=10,If=15.5;function xy(i){return i>If?Math.floor((i-If)/2.5)+1:0}const Zl={idle:.018,walk:.028,sprint:.06};class Nf{constructor(t={}){const e=(n,s,r)=>Number.isFinite(n)?Math.max(0,Math.min(r,n)):s;this.hp=e(t.hp,er,er),this.food=e(t.food,sa,sa),this.air=e(t.air,Do,Do),this.hp<=0&&(this.hp=er),this.regenT=0,this.starveT=0,this.drownT=0,this.magmaT=0,this.cause=""}hurt(t,e){return t<=0||this.hp<=0?!1:(this.hp=Math.max(0,this.hp-t),this.cause=e,this.hp<=0)}eat(t){return this.food>=sa?!1:(this.food=Math.min(sa,this.food+t),!0)}tick(t,e){const n=this.hp;return this.food=Math.max(0,this.food-t*(e.sprint&&e.moving?Zl.sprint:e.moving?Zl.walk:Zl.idle)),this.food>=16&&this.hp<er?(this.regenT+=t,this.regenT>=3&&(this.regenT=0,this.hp=Math.min(er,this.hp+1),this.food=Math.max(0,this.food-.6))):this.regenT=0,this.food<=0&&this.hp>1?(this.starveT+=t,this.starveT>=4&&(this.starveT=0,this.hurt(1,"Hunger"))):this.starveT=0,e.eyeWater?(this.air=Math.max(0,this.air-t),this.air<=0&&(this.drownT+=t,this.drownT>=1&&(this.drownT=0,this.hurt(2,"Ertrunken")))):(this.air=Math.min(Do,this.air+t*4),this.drownT=0),e.onMagma?(this.magmaT+=t,this.magmaT>=1&&(this.magmaT=0,this.hurt(1,"Magma"))):this.magmaT=.6,n-this.hp>0?n-this.hp:0}get dead(){return this.hp<=0}toJSON(){return{hp:Math.round(this.hp*10)/10,food:Math.round(this.food*10)/10,air:Math.round(this.air*10)/10}}}const Ma=[{key:"huhn",name:"Huhn",hp:3,half:.25,h:.8,speed:1.5,drops:[[K.MEAT_RAW,1,1]]},{key:"schaf",name:"Schaf",hp:5,half:.42,h:1.2,speed:1.2,drops:[[K.MEAT_RAW,1,2],[g.WOOL,1,2]]},{key:"kuh",name:"Kuh",hp:6,half:.45,h:1.4,speed:1.1,drops:[[K.MEAT_RAW,2,3]]},{key:"rauschling",name:"Rauschling",hp:8,half:.3,h:1.7,speed:2.4,hostile:!0,dmg:2,drops:[[g.CRYSTAL,0,1]]},{key:"hoehlenwesen",name:"Höhlenwesen",hp:12,half:.45,h:.9,speed:1.9,hostile:!0,dmg:3,drops:[[g.COAL,1,2],[g.IRON,0,1]]},{key:"drohne",name:"Störsender-Drohne",hp:6,half:.35,h:.6,speed:3,hostile:!0,fly:!0,range:7,dmg:2,drops:[[K.COPPER_INGOT,0,1],[g.CRYSTAL,0,1]]},{key:"dorfbewohner",name:"Dorfbewohner",hp:20,half:.3,h:1.8,speed:1.5,npc:!0,drops:[]}],Of=3,kf=3,My=4,Uf=5,yy=6;function zf(i){return i<.03||i>=.5?"home":i<.22||i>=.32&&i<.47?"work":"plaza"}const Sy=4,Ey=18;function by(i,t,e,n,s,r,a){const o=Math.hypot(s-t,r-e,a-n),l=Math.ceil(o/.4);for(let c=1;c<l;c++){const h=c/l;if(i.isSolid(Math.floor(t+(s-t)*h),Math.floor(e+(r-e)*h),Math.floor(n+(a-n)*h)))return!1}return!0}const qr=3,Ff=40,Ty=24,Ay=new Set([g.GRASS,g.FLOWERS,g.SNOW,g.MYCEL]),Kr=(i,t)=>(i+32768)*65536+(t+32768);let wy=1;class Jl{constructor(t,e,n,s,r){const a=Ma[t];this.id=wy++,this.target=0,this.type=t,this.T=a,this.x=e,this.y=n,this.z=s,this.hp=r??a.hp,this.vx=0,this.vy=0,this.vz=0,this.yaw=0,this.onGround=!1,this.walk=0,this.timer=0,this.flee=0,this.hurtT=0,this.acc=0,this.moving=!1,this.hostile=!!a.hostile,this.sees=!1,this.seeT=0,this.atkT=0,this.attack=!1,this.npc=!!a.npc,this.path=null,this.stuck=0,this.phase=null}warp(t,e,n){const s=Math.floor(this.y),r=a=>a>1&&a<ie-2&&ma[t.getBlock(Math.floor(e),a-1,Math.floor(n))]&&!this.collides(t,e,a,n);for(let a=0;a<=8;a++)for(const o of[s-a,s+a])if(r(o))return this.x=e,this.y=o,this.z=n,this.vy=0,!0;return!1}collides(t,e,n,s){const r=this.T.half,a=Math.floor(e-r),o=Math.floor(e+r-1e-7),l=Math.floor(s-r),c=Math.floor(s+r-1e-7),h=Math.floor(n),u=Math.floor(n+this.T.h-1e-7);for(let f=h;f<=u;f++)for(let p=l;p<=c;p++)for(let v=a;v<=o;v++)if(t.isSolid(v,f,p))return!0;return!1}move(t,e,n){if(!n)return!1;const s=this[e];return this[e]+=n,this.collides(t,this.x,this.y,this.z)?(this[e]=s,e==="y"&&(n<0&&(this.onGround=!0),this.vy=0),!0):!1}update(t,e,n,s,r,a=this.y){if(!t.isLoaded(Math.floor(this.x),Math.floor(this.z)))return;const o=this.T;if(this.hurtT=Math.max(0,this.hurtT-e),this.timer-=e,this.hostile){this.atkT-=e,this.seeT-=e;const m=Math.hypot(s-this.x,r-this.z);this.seeT<=0&&(this.seeT=.5,this.sees=m<Ey&&by(t,this.x,this.y+1.5,this.z,s,a+1.6,r)),this.sees&&m>.8&&(this.walk=1,this.yaw=Math.atan2(-(s-this.x),-(r-this.z)),this.timer=.5),o.range?(this.sees&&m<4&&(this.walk=0),this.sees&&Math.hypot(m,a+1-this.y)<o.range&&this.atkT<=0&&(this.atkT=2,this.attack=!0)):this.sees&&m<1.5&&Math.abs(a-this.y)<1.8&&this.atkT<=0&&(this.atkT=1,this.attack=!0)}if(this.npc&&this.path&&this.path.length){const m=this.path[0],d=Math.hypot(m.x-this.x,m.z-this.z);d<.6?(this.path.shift(),this.walk=0,this.stuck=0,this.bestD=1/0,this.timer=1+n()*2):(this.walk=1,this.yaw=Math.atan2(-(m.x-this.x),-(m.z-this.z)),this.timer=.3,d<(this.bestD??1/0)-.3?(this.bestD=d,this.stuck=0):(this.stuck+=e)>5&&(this.path.shift(),this.warp(t,m.x,m.z),this.stuck=0,this.bestD=1/0))}this.hostile&&this.sees||this.npc&&this.path&&this.path.length||(this.npc?this.timer<=0&&(this.walk=0,this.yaw+=(n()-.5)*1.5,this.timer=2+n()*3):this.flee>0?(this.flee-=e,this.walk=1,this.yaw=Math.atan2(-(this.x-s),-(this.z-r))):this.timer<=0&&(n()<.55?(this.walk=1,this.yaw=n()*Math.PI*2,this.timer=1+n()*3):(this.walk=0,this.timer=2+n()*4)));const l=Math.floor(this.x),c=Math.floor(this.z),h=t.getBlock(l,Math.floor(this.y+.3),c)===g.WATER;let u=this.walk?o.speed*(this.flee>0?2.2:1):0,f=-Math.sin(this.yaw),p=-Math.cos(this.yaw);if(u&&this.onGround&&!this.sees&&!o.fly){const m=Math.floor(this.x+f*(o.half+.6)),d=Math.floor(this.z+p*(o.half+.6));let x=0;for(let M=Math.floor(this.y)-1;x<4&&M>0&&!ma[t.getBlock(m,M,d)];M--)if(x++,t.getBlock(m,M,d)===g.WATER&&!this.flee){x=9;break}x>3&&(this.yaw+=Math.PI*(.5+n()),this.timer=.5+n(),f=-f,p=-p,u*=.3)}if(this.hostile&&this.sees&&Math.hypot(s-this.x,r-this.z)<.9&&(u=0),this.vx=f*u,this.vz=p*u,o.fly){const m=this.sees?a+2.5:this.y+Math.sin(this.timer*3)*.3;this.vy=Math.max(-3,Math.min(3,(m-this.y)*2))}else h?this.vy=Math.min(2,this.vy+20*e):this.vy=Math.max(-40,this.vy-28*e);const v=this.move(t,"x",this.vx*e),_=this.move(t,"z",this.vz*e);this.onGround=!1,this.move(t,"y",this.vy*e),(v||_)&&u&&!o.fly&&(this.onGround&&!this.collides(t,this.x,this.y+1.05,this.z)?this.vy=7.2:this.npc&&this.path&&this.path.length||this.onGround&&(this.yaw+=Math.PI*(.5+n()),this.timer=.5)),this.y<-10&&(this.y=ie),this.moving=u>0&&Math.abs(this.vx)+Math.abs(this.vz)>.1}hit(t,e,n){if(this.npc)return!1;this.hp-=t,this.hurtT=.35,this.hostile||(this.flee=3.5);const s=Math.hypot(this.x-e,this.z-n)||1;return this.x+=(this.x-e)/s*.15,this.z+=(this.z-n)/s*.15,this.vy=4.5,this.hp<=0}record(){return[this.type,+this.x.toFixed(2),+this.y.toFixed(2),+this.z.toFixed(2),this.hp]}}function Ry(i,t,e,n,s,r,a,o,l,c,h,u){let f=0,p=1/0;const v=[i,t,e],_=[n,s,r],m=[a,o,l],d=[c,h,u];for(let x=0;x<3;x++){if(Math.abs(_[x])<1e-9){if(v[x]<m[x]||v[x]>d[x])return 1/0;continue}let M=(m[x]-v[x])/_[x],y=(d[x]-v[x])/_[x];if(M>y){const C=M;M=y,y=C}if(f=Math.max(f,M),p=Math.min(p,y),f>p)return 1/0}return f}class Cy{constructor(t,e,n,s=!0){if(this.world=t,this.seed=e|0,this.enabled=s,this.store=new Map,n&&typeof n=="object")for(const r of Object.keys(n)){const a=n[r],o=Number(r);!Array.isArray(a)||!Number.isFinite(o)||this.store.set(o,a.filter(l=>Array.isArray(l)&&Number.isInteger(l[0])&&l[0]>=0&&l[0]<Of&&l.slice(1,5).every(Number.isFinite)))}this.list=[],this.active=new Set,this.lastPC=null,this.rnd=Math.random,this.onAdd=()=>{},this.onRemove=()=>{},this.onAttack=()=>{},this.onPoof=()=>{},this.day=!0,this.spawnT=3,this.villages=new Map,this.findVillages=null,this.time=.2}spawnRecords(t,e){const n=this.seed+9001;if(Qt(t,e,n)>.2)return null;const s=this.world.getChunk(t,e);if(!s)return null;const r=Math.floor(Qt(t,e,n+1)*Of),a=2+Math.floor(Qt(t,e,n+2)*3),o=[];for(let l=0;l<a*3&&o.length<a;l++){const c=Math.floor(Qt(t*31+l,e,n+3)*F),h=Math.floor(Qt(t,e*31+l,n+4)*F),u=c+h*F;let f=Math.min(ie-3,s.maxY+1);for(;f>0&&s.data[u+f*256]===g.AIR;)f--;const p=s.data[u+f*256];!Ay.has(p)||f<se||s.data[u+(f+1)*256]!==g.AIR||s.data[u+(f+2)*256]!==g.AIR||o.push([r,t*F+c+.5,f+1,e*F+h+.5,Ma[r].hp])}return o.length?o:null}activate(t,e,n){this.active.add(t);let s=this.store.get(t);if(s?this.store.delete(t):s=this.spawnRecords(e,n),!!s){if(!s.length){this.store.set(t,s);return}for(const r of s){if(this.list.length>=Ff){this.stash(r);continue}const a=new Jl(r[0],r[1],r[2],r[3],r[4]);a.yaw=Qt(Math.floor(r[1]),Math.floor(r[3]),5)*6.28,this.list.push(a),this.onAdd(a)}}}stash(t){const e=Kr(Math.floor(t[1]/F),Math.floor(t[3]/F));let n=this.store.get(e);n||this.store.set(e,n=[]),n.push(t)}remove(t,e){const n=this.list.indexOf(t);if(!(n<0)&&(this.list.splice(n,1),this.onRemove(t),!(t.hostile||t.npc)))if(e)this.stash(t.record());else{const s=Kr(Math.floor(t.x/F),Math.floor(t.z/F));!this.store.has(s)&&!this.active.has(s)&&this.store.set(s,[])}}hostile(t){return t.hostile}hostileCount(){let t=0;for(const e of this.list)e.hostile&&t++;return t}spawnHostile(t,e,n,s,r=this.rnd){if(this.hostileCount()>=Sy||this.list.length>=Ff)return null;for(let a=0;a<6;a++){const o=r()*Math.PI*2,l=14+r()*12,c=Math.floor(t+Math.cos(o)*l),h=Math.floor(n+Math.sin(o)*l),u=this.world.getChunk(c>>4,h>>4);if(!u)continue;const f=this.world.heightmap(u)[(c&15)+(h&15)*F];for(let p=Math.min(ie-3,Math.floor(e)+8);p>Math.max(1,Math.floor(e)-10);p--){if(!ma[this.world.getBlock(c,p-1,h)]||this.world.getBlock(c,p-1,h)===g.WATER||this.world.getBlock(c,p,h)!==g.AIR||this.world.getBlock(c,p+1,h)!==g.AIR)continue;const v=p>=f,_=!v&&p<se-4;if(v&&s||_){for(const{v:x}of this.villages.values())if(Math.hypot(x.x-c,x.z-h)<30)return null;const m=_?r()<.5?My:kf:r()<.3?Uf:kf,d=new Jl(m,c+.5,m===Uf?p+3:p,h+.5);return d.yaw=r()*6.28,this.list.push(d),this.onAdd(d),d}break}}return null}refresh(t,e){if(!this.enabled)return;const n=Math.floor(t/F),s=Math.floor(e/F);for(let r=-qr;r<=qr;r++)for(let a=-qr;a<=qr;a++){const o=n+a,l=s+r,c=Kr(o,l);this.active.has(c)||!this.world.getChunk(o,l)||this.activate(c,o,l)}for(const r of this.active){const a=Math.floor(r/65536)-32768,o=r%65536-32768;Math.max(Math.abs(a-n),Math.abs(o-s))<=qr+1||this.active.delete(r)}for(const r of this.list.slice()){const a=Kr(Math.floor(r.x/F),Math.floor(r.z/F));if(r.hostile){const o=Math.hypot(r.x-t,r.z-e)>40,l=this.world.getChunk(Math.floor(r.x)>>4,Math.floor(r.z)>>4),c=l&&Math.floor(r.y)>=this.world.heightmap(l)[(Math.floor(r.x)&15)+(Math.floor(r.z)&15)*F];(o||this.day&&c)&&(this.onPoof(r),this.remove(r,!1))}else!r.npc&&!this.active.has(a)&&this.remove(r,!0)}this.refreshVillages(t,e)}refreshVillages(t,e){for(const[n,s]of this.villages)if(!(Math.hypot(s.v.x-t,s.v.z-e)<112)){for(const r of s.list)this.remove(r,!1);this.villages.delete(n)}if(this.findVillages)for(const n of this.findVillages(t,e))this.villages.has(n.id)||Math.hypot(n.x-t,n.z-e)>96||!this.world.getChunk(n.x>>4,n.z>>4)||this.villages.set(n.id,{v:n,list:this.spawnVillagers(n)})}spawnVillagers(t){const e=[];return t.houses.forEach((n,s)=>{const r=new Jl(yy,n.x+.5,t.y+1,n.z+.5);r.name=n.role.name,r.role=n.role.key,r.vid=t.id,r.home={x:n.x+.5,z:n.z+.5},r.front={x:n.front.x+.5,z:n.front.z+.5},r.work=Fx(t,n),r.plaza={x:t.x+.5+(s&1?2.2:-2.2),z:t.z+.5+(s<2?-2.2:2.2)};const a=zf(this.time),o=a==="home"?r.home:a==="work"?r.work:r.plaza;r.phase=a,r.warp(this.world,o.x,o.z),this.list.push(r),this.onAdd(r),e.push(r)}),e}route(t,e){const n=Math.abs(t.x-t.home.x)<2.6&&Math.abs(t.z-t.home.z)<2.6;if(e==="home")return n?[t.home]:[t.front,t.home];const s=e==="work"?t.work:t.plaza;return n?[t.front,s]:[s]}update(t,e,n,s={}){if(!this.enabled)return;const r=s.py??0;this.day=!s.night,this.time=s.time??.2;const a=zf(this.time);if(s.hostiles)this.spawnT-=t,this.spawnT<=0&&(this.spawnT=3,this.spawnHostile(e,r,n,!!s.night));else if(this.hostileCount())for(const c of this.list.slice())c.hostile&&this.remove(c,!1);const o=Math.floor(e/F),l=Math.floor(n/F);(!this.lastPC||this.lastPC[0]!==o||this.lastPC[1]!==l||(this.refreshT=(this.refreshT||0)-t)<=0)&&(this.lastPC=[o,l],this.refreshT=1,this.refresh(e,n));for(const c of this.list){c.npc&&c.phase!==a&&(c.phase=a,c.path=this.route(c,a),c.bestD=1/0,c.stuck=0);const h=Math.hypot(c.x-e,c.z-n);if(c.hostile){let u=e,f=r,p=n,v=h;if(c.target=0,s.others)for(const _ of s.others){const m=Math.hypot(c.x-_.x,c.z-_.z);m<v&&(v=m,u=_.x,f=_.y,p=_.z,c.target=_.id)}c.update(this.world,t,this.rnd,u,p,f)}else h<Ty||c.flee>0?c.update(this.world,t,this.rnd,e,n,r):(c.acc+=t,c.acc>=.25&&(c.update(this.world,Math.min(c.acc,.25),this.rnd,e,n,r),c.acc=0));c.attack&&(c.attack=!1,this.onAttack(c))}}raycast(t,e,n,s,r,a,o){let l=null,c=o;for(const h of this.list){const u=h.T.half,f=Ry(t,e,n,s,r,a,h.x-u,h.y,h.z-u,h.x+u,h.y+h.T.h,h.z+u);f<c&&(c=f,l=h)}return l?{mob:l,t:c}:null}serialize(){const t={};for(const[e,n]of this.store)t[e]=n.slice();for(const e of this.active)t[e]||(t[e]=[]);for(const e of this.list){if(e.hostile||e.npc)continue;const n=Kr(Math.floor(e.x/F),Math.floor(e.z/F));(t[n]||(t[n]=[])).push(e.record())}for(const e of this.active){if(t[e].length)continue;const n=Math.floor(e/65536)-32768,s=e%65536-32768;Qt(n,s,this.seed+9001)>.2&&delete t[e]}return t}clear(){for(const t of this.list)this.onRemove(t);this.list=[],this.active.clear(),this.villages.clear()}}function xp(i,t=Math.random){return Ma[i].drops.map(([e,n,s])=>[e,n+Math.floor(t()*(s-n+1))]).filter(([,e])=>e>0)}const Dn=.3,vo=1.8,Ql=1.62,Yr=.001;class Ly{constructor(){this.x=0,this.y=0,this.z=0,this.vx=0,this.vy=0,this.vz=0,this.onGround=!1,this.inWater=!1,this.flying=!1,this.coyote=0,this.fallT=0,this.gliding=!1,this.hook=!1,this.lifted=!1,this.bounces=0,this.eyeWater=!1,this.impact=0}collides(t,e,n,s){const r=Math.floor(e-Dn),a=Math.floor(e+Dn-1e-7),o=Math.floor(s-Dn),l=Math.floor(s+Dn-1e-7),c=Math.floor(n),h=Math.floor(n+vo-1e-7);this.shaped=!1;for(let u=c;u<=h;u++)for(let f=o;f<=l;f++)for(let p=r;p<=a;p++){if(!t.isSolid(p,u,f))continue;const v=t.getBlock(p,u,f);if(!bn[v])return!0;if(kM(v,(_,m,d)=>t.getBlock(_,m,d),p,u,f,e-Dn,n,s-Dn,e+Dn,n+vo,s+Dn))return this.shaped=!0,!0}return!1}move(t,e,n){for(;n!==0;){const s=Math.abs(n)>.2?Math.sign(n)*.2:n;if(n-=s,this[e]+=s,this.collides(t,this.x,this.y,this.z)){if(this.shaped){this.moveShaped(t,e,s);return}e==="y"?this.y=s>0?Math.floor(this.y+vo)-vo-Yr:Math.floor(this.y)+1+Yr:this[e]=s>0?Math.floor(this[e]+Dn)-Dn-Yr:Math.floor(this[e]-Dn)+1+Dn+Yr,this["v"+e]=0,e==="y"&&s<0&&(this.onGround=!0);return}}}moveShaped(t,e,n){if(e!=="y"&&this.onGround){const a=this.y;for(const o of[.25,.5+.001])if(!this.collides(t,this.x,a+o,this.z)){let l=a,c=a+o;for(let h=0;h<10;h++){const u=(l+c)/2;this.collides(t,this.x,u,this.z)?l=u:c=u}this.y=c+Yr;return}}this[e]-=n;let s=0,r=1;for(let a=0;a<10;a++){const o=(s+r)/2;this[e]+=n*o;const l=this.collides(t,this.x,this.y,this.z);this[e]-=n*o,l?r=o:s=o}this[e]+=n*s,this["v"+e]=0,e==="y"&&n<0&&(this.onGround=!0)}onLadder(t){const e=Math.floor(this.x),n=Math.floor(this.z);return t.getBlock(e,Math.floor(this.y+.1),n)===g.LADDER||t.getBlock(e,Math.floor(this.y+1),n)===g.LADDER}update(t,e,n,s){if(t.isLoaded&&!t.isLoaded(Math.floor(this.x),Math.floor(this.z))){this.vx=this.vy=this.vz=0,this.waiting=!0;return}this.waiting=!1;for(let o=0;o<12&&this.collides(t,this.x,this.y,this.z);o++)this.y+=1;const r=Math.max(1,Math.ceil(e*120-1e-9)),a=e/r;for(let o=0;o<r;o++)this.step(t,a,n,s)}step(t,e,n,s){const r=Math.sin(s),a=Math.cos(s);let o=-n.f*r+n.r*a,l=-n.f*a-n.r*r;const c=Math.hypot(o,l);c>1&&(o/=c,l/=c);const h=Math.floor(this.x),u=Math.floor(this.z);this.inWater=t.getBlock(h,Math.floor(this.y+.4),u)===g.WATER;const f=this.eyeWater=t.getBlock(h,Math.floor(this.y+1.5),u)===g.WATER,p=this.onGround?t.getBlock(h,Math.floor(this.y-.05),u):g.AIR;if(this.lifted=!1,!this.flying)for(let m=0,d=Math.floor(this.y-.1);m<=11;m++,d--){const x=t.getBlock(h,d,u);if(x===g.WIND){this.lifted=!0;break}if(x!==g.AIR&&x!==g.WATER)break}const v=!this.onGround&&!this.inWater&&!this.flying;if(this.fallT=v&&this.vy<0?this.fallT+e:0,this.gliding=v&&n.jump&&this.fallT>.45&&!this.lifted&&!this.hook,!this.hook){let m;this.flying?m=n.sprint?16:10.5:this.gliding?(m=9.5,c<.1&&(o=-r,l=-a)):this.inWater?m=2.8:m=n.sprint?5.9:4.3,p===g.TURBO&&(m*=2.4);const d=Math.min(1,(this.flying?8:this.onGround?14:this.inWater?5:this.gliding?2.5:4)*e);if(this.vx+=(o*m-this.vx)*d,this.vz+=(l*m-this.vz)*d,this.flying){const x=((n.jump?1:0)-(n.down?1:0))*(n.sprint?12:8);this.vy+=(x-this.vy)*Math.min(1,8*e)}else this.inWater?(this.vy-=9*e,n.jump&&(f?this.vy+=24*e:this.vy=Math.max(this.vy,6.5)),this.vy-=this.vy*Math.min(1,3*e),this.vy=Math.max(-4,Math.min(this.vy,4))):this.onLadder(t)?(this.vy=n.jump||n.f>.3?3.4:n.sprint&&!n.f?0:Math.max(this.vy-28*e,-2.2),this.fallT=0):(this.vy=Math.max(-55,this.vy-28*e),this.gliding&&(this.vy=Math.max(this.vy,-2.2)),this.lifted&&(this.vy=Math.min(7.5,this.vy+60*e)),n.jump&&(this.onGround||this.coyote>0)&&(this.vy=p===g.FEDER?15:8.8,this.onGround=!1,this.coyote=0))}const _=this.vy;this.move(t,"x",this.vx*e),this.move(t,"z",this.vz*e),this.onGround=!1,this.move(t,"y",this.vy*e),this.onGround&&_<-2&&t.getBlock(h,Math.floor(this.y-.05),u)===g.FEDER?(this.vy=Math.min(26,Math.max(10,-_*.92)),this.onGround=!1,this.bounces++):this.onGround&&_<0&&!this.hook&&!this.flying&&(this.impact=Math.max(this.impact,-_)),this.coyote=this.onGround?.1:this.coyote-e}}function Bf(i,t,e,n,s,r,a,o){let l=Math.floor(t),c=Math.floor(e),h=Math.floor(n);const u=s>0?1:-1,f=r>0?1:-1,p=a>0?1:-1,v=s!==0?Math.abs(1/s):1/0,_=r!==0?Math.abs(1/r):1/0,m=a!==0?Math.abs(1/a):1/0;let d=s!==0?(s>0?l+1-t:t-l)*v:1/0,x=r!==0?(r>0?c+1-e:e-c)*_:1/0,M=a!==0?(a>0?h+1-n:n-h)*m:1/0;for(;;){let y=0,C=0,A=0,R;if(d<=x&&d<=M?(R=d,d+=v,l+=u,y=-u):x<=M?(R=x,x+=_,c+=f,C=-f):(R=M,M+=m,h+=p,A=-p),R>o)return null;const P=i.getBlock(l,c,h);if(P!==g.AIR&&P!==g.WATER)return{x:l,y:c,z:h,nx:y,ny:C,nz:A,type:P,t:R}}}let Vt=null,Ki=null;const cn={enabled:!0,vol:.8,music:.8,amb:.7};function Ji(){try{Vt||(Vt=new(window.AudioContext||window.webkitAudioContext)),Vt.state==="suspended"&&Vt.resume()}catch{Vt=null}}const Mp=i=>!!Vt&&cn.enabled&&Vt.state==="running"&&i>.001;function an(i,t,e,n="lowpass",s=!1){if(e*=s?cn.amb:cn.vol,!Mp(e))return;if(!Ki){Ki=Vt.createBuffer(1,Math.floor(Vt.sampleRate*.25),Vt.sampleRate);const c=Ki.getChannelData(0);for(let h=0;h<c.length;h++)c[h]=Math.random()*2-1}const r=Vt.createBufferSource(),a=Vt.createBiquadFilter(),o=Vt.createGain(),l=Vt.currentTime;r.buffer=Ki,a.type=n,a.frequency.value=i,o.gain.setValueAtTime(e,l),o.gain.exponentialRampToValueAtTime(.001,l+t),r.connect(a),a.connect(o),o.connect(Vt.destination),r.start(l),r.stop(l+t+.02)}const rh={fn:null},La=i=>{rh.fn&&rh.fn(i)},tc=()=>{La("break"),an(1100,.14,.5)},dn=()=>{La("place"),an(600,.09,.4)},Sn=()=>{La("deny"),an(220,.1,.3)};function je(i,t,e,n,s,r,a=0,o=0){if(s*=r?cn.amb:cn.vol,!Mp(s))return;const l=Vt.currentTime+o,c=Vt.createOscillator(),h=Vt.createGain();if(c.type=i,c.frequency.setValueAtTime(t,l),c.frequency.exponentialRampToValueAtTime(Math.max(20,e),l+n),a){const u=Vt.createOscillator(),f=Vt.createGain();u.frequency.value=a,f.gain.value=t*.04,u.connect(f),f.connect(c.frequency),u.start(l),u.stop(l+n+.02)}h.gain.setValueAtTime(1e-4,l),h.gain.exponentialRampToValueAtTime(s,l+Math.min(.04,n/4)),h.gain.exponentialRampToValueAtTime(.001,l+n),c.connect(h),h.connect(Vt.destination),c.start(l),c.stop(l+n+.02)}const Hf={weich:()=>an(380,.08,.22,"lowpass",!0),stein:()=>{an(2400,.05,.16,"bandpass",!0),an(500,.04,.12,"lowpass",!0)},holz:()=>{je("triangle",190,120,.07,.16,!0),an(900,.04,.08,"bandpass",!0)},sand:()=>an(3200,.11,.12,"highpass",!0),schnee:()=>{an(1600,.12,.16,"bandpass",!0),an(300,.08,.1,"lowpass",!0)},glas:()=>je("sine",2200,1900,.06,.07,!0)},Dy=i=>(Hf[i]||Hf.weich)(),Gf=i=>{an(1400,i?.45:.18,i?.35:.14,"bandpass",!0),i&&an(400,.3,.2,"lowpass",!0)},Vf={huhn:i=>{je("square",1200,1500,.06,i*.08,!0),je("square",1300,1e3,.07,i*.08,!0,0,.09)},schaf:i=>je("sawtooth",330,300,.5,i*.1,!0,7),kuh:i=>je("sawtooth",140,105,.9,i*.16,!0,3),rauschling:i=>{an(5e3,.5,i*.18,"bandpass",!0),je("sawtooth",90,70,.4,i*.08,!0,11)},hoehlenwesen:i=>je("square",70,50,.35,i*.14,!0,18),drohne:i=>je("sawtooth",210,230,.6,i*.06,!0,30),dorfbewohner:i=>{je("triangle",240,300,.12,i*.12,!0),je("triangle",280,220,.15,i*.12,!0,0,.14)}};function Py(i,t){const e=Math.max(0,1-t/20);e>0&&Vf[i]&&Vf[i](e)}const ec=()=>je("square",1800,900,.04,.12,!1),Iy=()=>{an(700,.25,.3,"bandpass"),je("square",160,110,.18,.1,!1)},Ny=()=>je("sine",880,880,.12,.12,!1),Oy=()=>La("done")||[0,4,7,12].forEach((i,t)=>je("triangle",523*Math.pow(2,i/12),523*Math.pow(2,i/12),.22,.14,!1,0,t*.11)),nc=()=>{La("hurt"),je("sawtooth",300,120,.18,.16,!1),an(800,.1,.2)},ge={on:!1,timer:0,next:0,step:0,master:null,seed:0},ky=[[0,3,5,7,10],[0,2,4,7,9],[0,2,3,7,8]],Wf=i=>440*Math.pow(2,(i-69)/12);function Xf(i,t,e,n,s,r){const a=Vt.createOscillator(),o=Vt.createGain();a.type=i,a.frequency.setValueAtTime(t,e),o.gain.setValueAtTime(s,e),o.gain.exponentialRampToValueAtTime(.001,e+n);let l=a;if(r){const c=Vt.createBiquadFilter();c.type="lowpass",c.frequency.value=r,a.connect(c),l=c}l.connect(o),o.connect(ge.master),a.start(e),a.stop(e+n+.02)}function $f(i,t,e,n,s){if(!Ki){Ki=Vt.createBuffer(1,Math.floor(Vt.sampleRate*.25),Vt.sampleRate);const l=Ki.getChannelData(0);for(let c=0;c<l.length;c++)l[c]=Math.random()*2-1}const r=Vt.createBufferSource(),a=Vt.createBiquadFilter(),o=Vt.createGain();r.buffer=Ki,a.type=n,a.frequency.value=s,o.gain.setValueAtTime(e,i),o.gain.exponentialRampToValueAtTime(.001,i+t),r.connect(a),a.connect(o),o.connect(ge.master),r.start(i),r.stop(i+t+.02)}function Uy(i,t){const e=ky[ge.seed%3],n=45+(ge.seed>>2)%5,s=i%16,r=Math.floor(i/16)%4;if(s%4===0){const o=Vt.createOscillator(),l=Vt.createGain();o.frequency.setValueAtTime(150,t),o.frequency.exponentialRampToValueAtTime(42,t+.14),l.gain.setValueAtTime(.9,t),l.gain.exponentialRampToValueAtTime(.001,t+.2),o.connect(l),l.connect(ge.master),o.start(t),o.stop(t+.22)}(s===4||s===12)&&$f(t,.12,.35,"bandpass",1800),s%2===0&&$f(t,.04,s%4===2?.22:.1,"highpass",7e3),(s%4===2||s===7||s===15)&&Xf("sawtooth",Wf(n+e[(r+(s>>2))%5]-12),t,.2,.2,500);const a=(i*3+ge.seed+r*2)%5;(s%2===1||s%4===0)&&Xf("triangle",Wf(n+24+e[a]+(s>8?12:0)),t,.16,.12,3e3)}function zy(){if(!Vt||Vt.state!=="running")return;const i=118+ge.seed%3*6,t=60/i/4;for(ge.next<Vt.currentTime&&(ge.next=Vt.currentTime+.05);ge.next<Vt.currentTime+.25;)Uy(ge.step++,ge.next),ge.next+=t}function qf(i,t){if(i*=cn.music,!Vt||!cn.enabled||i<=.01){ge.on&&(ge.on=!1,clearInterval(ge.timer),ge.master&&ge.master.gain.setTargetAtTime(0,Vt.currentTime,.1));return}ge.master||(ge.master=Vt.createGain(),ge.master.gain.value=0,ge.master.connect(Vt.destination)),ge.on||(ge.on=!0,ge.seed=t,ge.next=0,ge.timer=setInterval(zy,80)),ge.master.gain.setTargetAtTime(Math.min(1,i)*.45,Vt.currentTime,.15)}const Fy=[g.NEON_R,g.NEON_B,g.NEON_G,g.NEON_P],yp=[{t:"Holz sammeln",d:"Die Funkzentrale will wieder auf Sendung. Dafür braucht sie Material. Schlage 5 Holzblöcke an Bäumen ab.",k:"break",a:[g.WOOD],n:5,r:{[g.PLANKS]:4}},{t:"Bretter herstellen",d:"Öffne das Inventar (E oder 🎒) und stelle unter „Herstellen“ Bretter aus Holz her. Du brauchst 8 Bretter.",k:"craft",a:[g.PLANKS],n:8,r:{[g.DIRT]:10}},{t:"Fundament legen",d:"Setze 12 Bretter als Fundament für die Sendehütte.",k:"place",a:[g.PLANKS],n:12,r:{[g.STONE]:4}},{t:"Steinbruch",d:"Grabe nach Stein, unter Erde und in Hügeln. Sammle 12 Steinblöcke im Vorrat.",k:"have",a:[g.STONE],n:12,r:{[g.SAND]:4}},{t:"Strand und Glas",d:"Sand findest du am Wasser. Stelle 4 Glas her (2 Sand ergeben 1 Glas).",k:"craft",a:[g.GLASS],n:4,r:{[g.WOOD]:2,[g.GLASS]:2}},{t:"Leuchtfeuer",d:"Stelle 2 Leuchtblöcke her (Glas und Holz).",k:"craft",a:[g.LAMP],n:2,r:{[g.LEAVES]:4,[g.PLANKS]:2}},{t:"Licht an",d:"Setze beide Leuchtblöcke, damit die Hütte auch nachts zu sehen ist.",k:"place",a:[g.LAMP],n:2,r:{[g.LAMP]:2}},{t:"Hoch hinaus",d:"Der Funkmast muss hoch stehen. Erreiche eine Höhe von 14 Blöcken über dem Startpunkt, zum Beispiel mit einem Turm aus Blöcken.",k:"height",n:14,r:{[g.PLANKS]:6,[g.LEAVES]:4}},{t:"Der Funkmast",d:"Stelle einen Radio-Block her (4 Bretter und 1 Leuchtblock) und setze ihn. Hör zu, wie er spielt.",k:"place",a:[g.RADIO],n:1,r:{[g.PLANKS]:4,[g.LEAVES]:4}},{t:"Federn für die Landung",d:"Stelle 2 Federblöcke her (Blätter und Bretter).",k:"craft",a:[g.FEDER],n:2,r:{[g.STONE]:4}},{t:"Sprungtraining",d:"Setze einen Federblock und springe 3-mal darauf zurück in die Luft. Aufprall genügt, die Feder wirft dich hoch.",k:"bounce",n:3,r:{[g.LAMP]:1}},{t:"Seilhaken",d:"Ziele auf einen entfernten Block und benutze den Seilhaken (Q oder Taste Haken) 2-mal.",k:"hook",n:2,r:{[g.LEAVES]:4}},{t:"Gleitflug",d:"Springe von deinem Turm und halte im Fall die Sprungtaste gedrückt. Gleite insgesamt 5 Sekunden.",k:"glide",n:5,r:{[g.LAMP]:4,[g.SAND]:4}},{t:"Neon-Show",d:"Stelle Neonblöcke her (Leuchtblock mit Sand, Glas, Blättern oder Erde) und setze 4 davon.",k:"place",a:Fy,n:4,r:{[g.GLASS]:2,[g.LAMP]:1}},{t:"Regenbogen-Finale",d:"Setze als Krönung einen Regenbogen-Block (2 Glas und 1 Leuchtblock) auf deinen Sendeturm.",k:"place",a:[g.RAINBOW],n:1,r:{[g.RAINBOW]:2}}],By=5,Hy=4,Gy=[g.PLANKS,g.STONE,g.COBBLE,g.DIRT,g.WOOD,g.SPRUCE,g.BRICK,g.SANDSTONE,g.GLASS,g.MARBLE],ya=[null,{t:"Das erste Signal",d:"Ein gewaltiges Funknetz verband einst alle Regionen. Dann kam das große Rauschen, und die Stationen verstummten. Du stehst allein in der Wildnis. Irgendwo knistert ein Signal."},{t:"Der vergessene Sender",d:"Aus deinem Radio dringt eine Stimme: „…Dorf … der Mast … hört uns jemand?“ Der Wegpunkt zeigt dir den Weg."},{t:"Stimmen aus der Tiefe",d:"Funkerin Lotte: „Der Mast braucht Funkkristalle. Sie wachsen tief unten, wo das Rauschen am lautesten ist.“"},{t:"Die zerbrochene Verbindung",d:"Aus Kupfer und Kristallen entsteht ein Funksender. Relais tragen das Signal weiter, Empfänger fangen es auf."},{t:"Das Herz des Rauschens",d:"Das Rauschen wird stärker. Drohnen stören die Leitungen, und in der Tiefe regt sich etwas."},{t:"Die letzte Frequenz",d:"Lotte: „Ein hoher Turm, drei Empfänger, und das Signal geht wieder um die ganze Welt.“"}],Sp=[{c:1,t:"Holz sammeln",d:"Schlage 6 Holzblöcke an Bäumen ab. Im Überleben dauert das etwas, mit einer Axt geht es schneller.",k:"break",a:[g.WOOD,g.SPRUCE],n:6,r:{[g.PLANKS]:4}},{c:1,t:"Werkbank",d:"Öffne das Inventar (E oder 🎒), stelle Bretter her und daraus eine Werkbank.",k:"craft",a:[g.WORKBENCH],n:1,r:{[K.STICK]:4}},{c:1,t:"Erstes Werkzeug",d:"Setze die Werkbank, drücke Setzen auf sie und stelle eine Holzspitzhacke her.",k:"craft",a:[K.WOOD_PICK],n:1,r:{[K.APPLE]:3}},{c:1,t:"Unterschlupf",d:"Die erste Nacht kommt. Baue dir mit 20 Blöcken (Bretter, Stein, Erde …) einen Unterschlupf.",k:"place",a:Gy,n:20,r:{[g.LAMP]:2}},{c:1,t:"Licht für die Nacht",d:"Setze einen Leuchtblock in deinen Unterschlupf.",k:"place",a:[g.LAMP],n:1,r:{[K.BREAD]:2}},{c:1,t:"Das erste Signal",d:"Baue ein Radio (4 Bretter und 1 Leuchtblock) und setze es. Hör genau hin.",k:"place",a:[g.RADIO],n:1,r:{[K.MEAT_COOKED]:2}},{c:2,t:"Das Dorf",d:"Folge dem Wegpunkt 📍 bis ins Dorf.",k:"visit",n:1,r:{[K.BREAD]:2}},{c:2,t:"Erste Kontakte",d:"Sprich mit einem Dorfbewohner: Setzen-Taste auf ihn.",k:"talk",n:1,r:{[K.SEEDS]:4}},{c:2,t:"Erntezeit",d:"Ernte reifen Weizen auf dem Dorffeld oder auf deinem eigenen. Sammle 6 Weizen.",k:"have",a:[K.WHEAT],n:6,r:{[K.BREAD]:1}},{c:2,t:"Tauschhandel",d:"Tausche etwas mit einem Dorfbewohner.",k:"trade",n:1,r:{[K.COPPER_INGOT]:1}},{c:3,t:"Steinwerkzeug",d:"Stelle an der Werkbank eine Steinspitzhacke her. Ohne sie gibt Eisen und Funkkristall nichts her.",k:"craft",a:[K.STONE_PICK],n:1,r:{[g.LAMP]:4}},{c:3,t:"Abstieg",d:"Steige in eine Höhle, bis unter Höhe 18 (Y-Wert oben links). Vorsicht, dort unten ist es nie ganz ruhig.",k:"depth",y:18,n:1,r:{[K.MEAT_COOKED]:2}},{c:3,t:"Kupfer schmelzen",d:"Baue einen Schmelzofen (8 Stein, an der Werkbank) und schmelze 3 Kupferbarren aus Kupfererz und Kohle.",k:"craft",a:[K.COPPER_INGOT],n:3,r:{[g.COAL]:4}},{c:3,t:"Funkkristalle",d:"Funkkristalle leuchten tief unter der Erde. Sammle 3 Stück.",k:"have",a:[g.CRYSTAL],n:3,r:{[K.IRON_INGOT]:2}},{c:4,t:"Der Funksender",d:"Baue an der Werkbank einen Funksender (2 Kupferbarren, 1 Funkkristall, 1 Radio) und setze ihn.",k:"place",a:[g.SENDER],n:1,r:{[g.WIRE]:8}},{c:4,t:"Strom drauf",d:"Setze einen Schalter direkt neben den Sender (oder verbinde beide mit Signalleitungen) und schalte ihn mit der Setzen-Taste ein.",k:"place",a:[g.SWITCH],n:1,r:{[K.COPPER_INGOT]:2}},{c:4,t:"Relais",d:"Ein Funkrelais trägt das Signal 24 Blöcke weiter. Baue eins (Kupfer, Kristall, 2 Stein) und setze es höchstens 24 Blöcke vom Sender entfernt.",k:"place",a:[g.RELAY],n:1,r:{[g.CRYSTAL]:1,[K.COPPER_INGOT]:1}},{c:4,t:"Die Verbindung",d:"Bringe einen Empfänger zum Leuchten, der mindestens 40 Blöcke vom eingeschalteten Sender entfernt steht (über das Relais).",k:"reach",n:40,r:{[K.IRON_INGOT]:3}},{c:5,t:"Gerüstet",d:"Stelle an der Werkbank einen Helm oder Harnisch her und lege ihn an (wählen, Setzen drücken).",k:"craft",a:[K.COPPER_HELMET,K.COPPER_CHEST,K.IRON_HELMET,K.IRON_CHEST],n:1,r:{[K.BREAD]:3}},{c:5,t:"Störsender",d:"Nachts fliegen Störsender-Drohnen. Hol eine vom Himmel.",k:"kill",a:[By],n:1,r:{[g.CRYSTAL]:1}},{c:5,t:"Wesen der Tiefe",d:"In tiefen Höhlen hausen Höhlenwesen. Besiege 2 davon.",k:"kill",a:[Hy],n:2,r:{[K.IRON_INGOT]:2}},{c:5,t:"Maschinen",d:"Schalte mit deinem Netz 3 Maschinen gleichzeitig ein: Signallampen oder Funktore neben Leitungen oder Empfängern.",k:"powered",n:3,r:{[g.RAINBOW]:1}},{c:6,t:"Der Funkturm",d:"Baue einen Turm: Erreiche 20 Blöcke über deinem Startpunkt.",k:"height",n:20,r:{[g.RELAY]:1}},{c:6,t:"Großes Netz",d:"Lass 3 Empfänger gleichzeitig leuchten.",k:"net",n:3,r:{[g.RAINBOW]:1}},{c:6,t:"Die letzte Frequenz",d:"Setze einen Regenbogen-Block auf deinen Funkturm. Das Netz steht, das Rauschen verstummt.",k:"place",a:[g.RAINBOW],n:1,r:{[g.RAINBOW]:2}}],hr=i=>i&&i.c==="rauschen"?Sp:yp;function Ep(i,t){const e=i.story,n=i.sigStats||{receivers:0,machines:0,reach:0};if(t.k==="have"){let s=0;for(const r of t.a)s+=i.inv[r]||0;return[s,t.n]}return t.k==="height"?[Math.max(0,Math.floor(e.max)),t.n]:t.k==="net"?[n.receivers,t.n]:t.k==="powered"?[n.machines,t.n]:t.k==="reach"?[Math.floor(n.reach),t.n]:[Math.floor(e.p),t.n]}const Vy=480,jr=6,Wy=`
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
}`,Xy=`
uniform sampler2D uMap; uniform vec3 uFog; uniform vec2 uFogRange; uniform float uCut; uniform float uTime; uniform vec3 uSunCol; uniform vec3 uSunDir;
varying vec2 vUv; varying vec3 vAmb; varying vec3 vSun; varying float vEm; varying float vBl; varying float vDist; varying float vRb; varying float vWater; varying vec3 vWp; varying vec3 vN;
${Qd}
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
}`,$y="varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }",qy=`
uniform vec3 uHor; uniform vec3 uZen; uniform vec3 uSunN; uniform vec3 uGlow; varying vec3 vDir;
void main(){
  float h = clamp(vDir.y, 0.0, 1.0);
  vec3 c = mix(uHor, uZen, pow(h, 0.5));
  c += uGlow * pow(max(dot(normalize(vDir), uSunN), 0.0), 6.0);
  c += uGlow * 0.6 * pow(max(dot(normalize(vDir), uSunN), 0.0), 64.0); // heller Hof um die Sonne
  c = max(c, 0.0);
  gl_FragColor = vec4(mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)), 1.0);
  #include <colorspace_fragment>
}`,Ky=`
uniform vec2 uOff; varying vec2 vUv; varying float vD;
void main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vUv = (wp.xz + uOff) / 520.0; vD = length(position.xy) / 1200.0; gl_Position = projectionMatrix * viewMatrix * wp; }`,Yy=`
uniform sampler2D uTex; uniform vec3 uCol; varying vec2 vUv; varying float vD;
void main(){ float a = texture2D(uTex, vUv).a * (1.0 - smoothstep(0.45, 0.95, vD)) * 0.9; vec3 c = max(uCol, 0.0); gl_FragColor = vec4(mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)), a);
  #include <colorspace_fragment>
}`,ic=(i,t,e)=>i+(t-i)*e;function jy(i){if(i===g.SNOW)return"schnee";if(i===g.GLASS||i===g.ICE)return"glas";if(i===g.SAND||i===g.GRAVEL)return"sand";const t=Ht[i]&&Ht[i].tool;return t==="axt"?"holz":t==="spitzhacke"?"stein":"weich"}const Hi=(i,t,e)=>[ic(i[0],t[0],e),ic(i[1],t[1],e),ic(i[2],t[2],e)],_o=(i,t,e)=>{const n=Math.max(0,Math.min(1,(e-i)/(t-i)));return n*n*(3-2*n)};class Zy{constructor(t,e,n="auto"){this.coarse=e;const s=window.devicePixelRatio||1;this.renderer=new ax({canvas:t,antialias:n!=="eco"&&!(e&&s>=2.5),powerPreference:"high-performance"}),this.maxDpr=e?1.75:2,this.dprScale=1,this.budget=e?4:6,this.maxView=e?4:7,this.autoQ=!1,this.cloudsOn=!0,this.perf={acc:0,n:0,good:0},this.fps=0,this.placeDelay=!0,this.scene=new ox,this.camera=new In(e?70:75,1,.08,1500),this.camera.rotation.order="YXZ",this.scene.add(this.camera),this.group=new Yn,this.scene.add(this.group);const r=Math.min(8,this.renderer.capabilities.getMaxAnisotropy()),a=d=>{const x=new wo(d);return x.magFilter=on,x.minFilter=si,x.anisotropy=r,x.generateMipmaps=!0,x};this.atlasCanvas=YM(),this.atlasTex=new Od(this.atlasCanvas.raw,this.atlasCanvas.width,this.atlasCanvas.height,Nn),this.atlasTex.magFilter=on,this.atlasTex.minFilter=si,this.atlasTex.anisotropy=r,this.atlasTex.generateMipmaps=!0,this.atlasTex.needsUpdate=!0,this.logoCanvas=jM(()=>{this.logoTex.needsUpdate=!0,!this.running&&this.world&&this.render()},()=>this.onLogos()),this.logoTex=a(this.logoCanvas),this.onLogos=()=>{},this.uni={uAmb:{value:new N(.44,.5,.62)},uSunCol:{value:new N(.6,.57,.5)},uSunDir:{value:new N(0,1,.25).normalize()},uFog:{value:new N(.68,.84,.95)},uFogRange:{value:new kt(40,90)},uTime:{value:0},uWind:{value:1},...mf()};const o=(d,x,M,y)=>new ze({vertexShader:Wy,fragmentShader:Xy,transparent:M,depthWrite:!M,side:M?mn:bi,uniforms:{...y,uMap:{value:d},uCut:{value:x}}});this.matO=o(this.atlasTex,.5,!1,this.uni),this.matT=o(this.atlasTex,.02,!0,this.uni),this.matL=o(this.logoTex,.5,!1,this.uni),this.shadows=new Zx(this.uni),this.shadows.setAtlas(this.atlasTex),this.post=null,this.postOn=!1,this.msaa=n!=="eco"&&!(e&&s>=2.5),this.deco=new cM(this.group,this.uni),this.deco.onReady=()=>{!this.running&&this.world&&this.render()},this.sky=new Yn,this.scene.add(this.sky),this.domeU={uHor:{value:new N},uZen:{value:new N},uSunN:{value:new N(1,0,0)},uGlow:{value:new N}};const l=new Te(new Ah(700,20,12),new ze({vertexShader:$y,fragmentShader:qy,uniforms:this.domeU,side:ln,depthWrite:!1,depthTest:!1}));l.renderOrder=-20,l.frustumCulled=!1,this.sky.add(l);const c=(d,x)=>{const M=new Te(new ys(d,d),new jn({color:x,fog:!1,depthWrite:!1}));return M.renderOrder=-10,this.sky.add(M),M};this.sun=c(80,16773808),this.moon=c(52,14674175);const h=new Float32Array(300*3);for(let d=0;d<300;d++){const x=Math.random()*2-1,M=Math.random()*Math.PI*2,y=Math.sqrt(1-x*x);h[d*3]=Math.cos(M)*y*600,h[d*3+1]=x*600,h[d*3+2]=Math.sin(M)*y*600}const u=new Ie;u.setAttribute("position",new be(h,3)),this.starMat=new Ud({color:16777215,size:2,sizeAttenuation:!1,transparent:!0,opacity:0,fog:!1,depthWrite:!1}),this.stars=new ux(u,this.starMat),this.stars.renderOrder=-15,this.sky.add(this.stars);const f=new wo(ZM());f.wrapS=f.wrapT=No,f.minFilter=si,f.magFilter=on,this.cloudU={uTex:{value:f},uCol:{value:new N(1,1,1)},uOff:{value:new kt}},this.clouds=new Te(new ys(2400,2400),new ze({vertexShader:Ky,fragmentShader:Yy,uniforms:this.cloudU,transparent:!0,depthWrite:!1,side:mn})),this.clouds.rotation.x=-Math.PI/2,this.clouds.frustumCulled=!1,this.chunkSphereR=Math.hypot(F/2,ie/2,F/2)+1,this.scene.add(this.clouds),this.vclouds=new nM(this.scene,this.uni),this.vcloudsOn=!1;const p=new fx(new es(1.004,1.004,1.004));this.hl=new tf(p,new Qr({color:0,transparent:!0,opacity:.75})),this.hl.visible=!1,this.scene.add(this.hl),this.ghost=new tf(p,new Qr({color:16777215,transparent:!0,opacity:.55,depthTest:!1})),this.ghost.visible=!1,this.ghost.renderOrder=40,this.scene.add(this.ghost),this.buildMode=0,this.anchor=null,this.clip=null,this.batch=null,this.preview=!0,this.beam=new Zc(new Ie().setFromPoints([new N,new N]),new Qr({color:16722538})),this.beam.frustumCulled=!1,this.beam.visible=!1,this.beamT=0,this.scene.add(this.beam);const v={uAmb:{value:new N(.62,.64,.7)},uSunCol:{value:new N(.5,.46,.38)},uSunDir:{value:new N(.35,.8,.5).normalize()},uFog:{value:new N},uFogRange:{value:new kt(1e5,2e5)},uTime:this.uni.uTime,uWind:{value:0},...mf()},_=d=>{const x=o(d,.5,!1,v);return x.depthTest=!1,x};this.handMatO=_(this.atlasTex),this.handMatL=_(this.logoTex),this.hand=new Te(new Ie,this.handMatO),this.hand.frustumCulled=!1,this.hand.renderOrder=50,this.hand.visible=!1,this.camera.add(this.hand),this.itemCanvas=JM(Bo.map(d=>Re[d]));const m=new wo(this.itemCanvas);if(m.magFilter=Je,m.minFilter=Je,m.generateMipmaps=!1,this.itemHand=new Te(new ys(1,1),new jn({map:m,transparent:!0,alphaTest:.5,depthTest:!1,side:mn})),this.itemHand.frustumCulled=!1,this.itemHand.renderOrder=50,this.itemHand.visible=!1,this.camera.add(this.itemHand),this.mobView=new iy(this.scene),this.mobs=null,this.light=1,this.vehView=new ly(this.scene),this.vehicles=null,this.ride=null,this.prevJump=!1,this.meshSeq=0,this.mwJobs=0,this.mw=null,typeof Worker<"u")try{this.mw=new Worker(new URL(""+new URL("meshworker-BL9OcKGN.js",import.meta.url).href,import.meta.url),{type:"module"}),this.mw.onmessage=d=>this.onMeshed(d.data),this.mw.onerror=()=>{this.mw=null,this.mwJobs=0,this.scanDirty=!0}}catch{this.mw=null}this.handType=-1,this.swing=0,this.bob=0,this.parts=[],this.partCount=0,this.rope=new Zc(new Ie().setFromPoints([new N,new N]),new Qr({color:16769162})),this.rope.frustumCulled=!1,this.rope.visible=!1,this.scene.add(this.rope),this.hookT=0,this.hookTarget=new N,this.wp=null,this.timeFrozen=!1,this.radioT=0,this.player=new Ly,this.input={f:0,r:0,jump:!1,down:!1,sprint:!1},this.breakHeld=!1,this.placeHeld=!1,this.actCool=0,this.world=null,this.running=!1,this.raf=0,this.last=0,this.viewDist=e?4:7,this.offsets=[],this.setViewDist(this.viewDist),this.onChange=()=>{},this.onToast=()=>{},this.story=null,this.onQuest=()=>{},this.onQuestDone=()=>{},this.vitals=null,this.dead=!1,this.mine=null,this.deathLoss="keep",this.enemies=!0,this.farm=new Pf,this.age=0,this.history=[],this.redoList=[],this.onVitals=()=>{},this.onHurt=()=>{},this.onDeath=()=>{},this.onMine=()=>{},this.onStation=()=>{},this.onTrade=()=>{},this.onBuildMode=()=>{},this.onRide=()=>{},this.mp=null,this.net=null,this.armor={kopf:0,brust:0},this.armWear={kopf:0,brust:0},this.resize()}setQuality(t,e){const n=eh[t]||eh.standard;if(this.qName=t,this.autoQ=!!e,this.maxDpr=n.dpr,this.dprScale=1,this.budget=n.budget,this.cloudsOn=n.clouds,this.maxView=n.view,this.shadows.configure(n.shadow||0,n.shadowR||40,n.shadowEvery||1),this.vcloudsOn=!!n.vclouds,this.uni.uWind.value=n.wind===!1?0:1,this.postOn=!!n.post,this.postOn&&!this.post)try{this.post=new sM(this.renderer,this.scene,this.camera,this.msaa)}catch{this.postOn=!1}this.perf.acc=this.perf.n=this.perf.good=0,this.menuMode?this.savedView=n.view:this.setViewDist(n.view),this.resize()}measure(t){const e=this.perf;if(t>250||(e.acc+=t,e.n++,e.acc<2e3))return;const n=e.acc/e.n;e.acc=e.n=0,this.fps=Math.round(1e3/n),!(!this.autoQ||this.menuMode)&&(n>26?(e.good=0,this.dprScale>.6?(this.dprScale=Math.max(.6,this.dprScale-.15),this.resize()):this.viewDist>3&&this.setViewDist(this.viewDist-1)):n<18&&++e.good>=3&&(e.good=0,this.dprScale<1?(this.dprScale=Math.min(1,this.dprScale+.1),this.resize()):this.viewDist<this.maxView&&this.setViewDist(this.viewDist+1)))}setViewDist(t){this.viewDist=t;const e=t+2,n=[];for(let s=-e-1;s<=e+1;s++)for(let r=-e-1;r<=e+1;r++){const a=Math.hypot(r,s);a<=e&&n.push([r,s,a])}n.sort((s,r)=>s[2]-r[2]),this.offsets=n,this.scanDirty=!0}resize(){const t=window.innerWidth,e=window.innerHeight,n=Math.min(window.devicePixelRatio||1,this.maxDpr)*this.dprScale;this.renderer.setPixelRatio(n),this.renderer.setSize(t,e,!1),this.post&&this.post.setSize(t,e,n),this.camera.aspect=t/e,this.camera.updateProjectionMatrix(),!this.running&&this.world&&this.render()}start(t){if(this.stop(),this.clearWorld(),this.leaveMenu(),this.gen=Kd(t.gen),this.world=new df(t.seed,fM(t.edits),this.gen),this.world.rot=pM(t.rot),this.name=t.name,this.seed=t.seed,this.mode=t.mode,this.time=t.time??.08,this.hotbar=Array.isArray(t.hotbar)&&t.hotbar.length===9?t.hotbar.map(s=>Number.isInteger(s)&&xf(s)?s:0):[1,2,3,4,5,6,7,8,9],this.sel=t.sel??0,this.inv=t.inv?{...t.inv}:{[g.DIRT]:20,[g.PLANKS]:10,[g.GLASS]:4},this.story=t.mode==="story"?t.story?{...t.story}:{i:0,p:0,max:0,done:!1,c:this.gen===3?"rauschen":void 0}:null,this.story&&!this.story.c&&delete this.story.c,this.sigStats={receivers:0,machines:0,reach:0,senders:0},this.sigRetry=!1,!t.inv&&t.mode==="survival"){for(let s=0;s<16;s++)this.inv[wi+s]=4;for(let s=0;s<zd;s++)this.inv[Qc+s]=8}if(this.wp=t.wp||null,this.map=new my(t.map),this.hookT=0,this.rope.visible=!1,this.timeFrozen=!1,this.handType=-1,this.survival=t.mode==="survival"||t.mode==="story"&&this.gen===3,this.vitals=this.survival?new Nf(t.vit||{}):null,this.dead=!1,this.mine=null,this.player.impact=0,this.dur={},t.dur&&typeof t.dur=="object")for(const[s,r]of Object.entries(t.dur))$i(Number(s))&&Number.isFinite(r)&&(this.dur[s]=r);this.armor={kopf:0,brust:0},this.armWear={kopf:0,brust:0},Array.isArray(t.arm)&&["kopf","brust"].forEach((s,r)=>{const a=Vr(t.arm[r]);a&&a.slot===s&&(this.armor[s]=t.arm[r],this.armWear[s]=Math.max(0,Math.min(a.dur-1,t.arm[r+2]|0)))}),this.buildMode=0,this.anchor=null,this.clip=null,this.batch=null;const e=t.grave;this.grave=e&&[e.x,e.y,e.z].every(Number.isFinite)&&e.inv&&typeof e.inv=="object"?e:null,this.mobs=new Cy(this.world,t.seed,t.mobs,t.mode!=="story"||this.gen===3),this.gen===3&&(this.mobs.findVillages=(s,r)=>{const a=[],o=On(s),l=On(r);for(let c=-1;c<=1;c++)for(let h=-1;h<=1;h++){const u=Aa(this.seed,o+h,l+c);u&&a.push(u)}return a}),this.mobs.onAdd=s=>this.mobView.add(s),this.mobs.onRemove=s=>this.mobView.remove(s),this.vehicles=new ty(this.world,t.veh),this.ride=null,this.prevJump=!1,this.vehicles.onAdd=s=>this.vehView.add(s),this.vehicles.onRemove=s=>this.vehView.remove(s),this.vehicles.attach(),this.mobs.onAttack=s=>this.mobHits(s),this.mobs.onPoof=s=>this.spawnBreak(s.x-.5,s.y+.5,s.z-.5,g.BASALT),this.age=Number.isFinite(t.age)&&t.age>=0?t.age:0,this.farm=new Pf(t.farm),this.farmT=0,this.history=[],this.redoList=[],this.spawn=this.world.findSpawn(t.mode!=="story"),this.spawnY=this.spawn.y;const n=this.player;t.px!==void 0?(n.x=t.px,n.y=t.py,n.z=t.pz,this.yaw=t.yaw||0,this.pitch=t.pitch||0):(n.x=this.spawn.x,n.y=this.spawn.y,n.z=this.spawn.z,this.yaw=0,this.pitch=-.1),n.vx=n.vy=n.vz=0,n.flying=!1,n.onGround=!1,this.target=null,this.unsaved=!1,this.loadAround(2,1),this.scanDirty=!0,this.lastPC=null,this.applyCamera(),this.updateSky(),this.resume()}startMenu(){this.stop(),this.clearWorld(),this.menuMode=!0,this.savedView=this.savedView??this.viewDist,this.setViewDist(Math.min(this.viewDist,4)),this.world=new df(20241,new Map,1),this.mode="creative",this.time=.06,this.menuT=0,this.hotbar=new Array(9).fill(0),this.sel=0,this.inv={};const t=this.world.findSpawn(),e=this.player,n=this.world;e.x=t.x,e.z=t.z,e.y=t.y,e.flying=!1,e.vx=e.vy=e.vz=0,e.hook=!1,this.loadAround(3,2);const s=Math.floor(t.x),r=Math.floor(t.z),a=Math.floor(t.y)-1;for(let l=s-5;l<=s+5;l++)for(let c=r-5;c<=r+5;c++){for(let h=a+1;h<=a+9;h++)n.setBlock(l,h,c,g.AIR);n.setBlock(l,a,c,l+c&1?g.MARBLE:g.STONE)}for(let l=0;l<16;l++)n.setBlock(s-2+l%4,a+1,r-2+(l>>2),wi+l);const o=[g.NEON_R,g.NEON_B,g.NEON_G,g.NEON_P];[[-3,-3],[3,-3],[3,3],[-3,3]].forEach(([l,c],h)=>{for(let u=1;u<=4;u++)n.setBlock(s+l,a+u,r+c,o[h]);n.setBlock(s+l,a+5,r+c,g.RAINBOW)}),n.setBlock(s,a+2,r,g.RADIO);for(let l=3;l<=5;l++)n.setBlock(s,a+l,r,g.FEDER);n.setBlock(s,a+6,r,g.RAINBOW),this.menuC={x:s+.5,y:a+3,z:r+.5},this.flushDirty(),this.hand.visible=!1,this.hl.visible=!1,this.rope.visible=!1,this.scanDirty=!0,this.lastPC=null,this.menuStep(0),this.resume()}leaveMenu(){this.menuMode&&(this.menuMode=!1,this.savedView!=null&&(this.setViewDist(this.savedView),this.savedView=null))}menuStep(t){this.menuT+=t,this.time=(this.time+t/150)%1;const e=this.menuC,n=this.menuT*.07,s=15+Math.sin(this.menuT*.05)*2.5,r=4.5+Math.sin(this.menuT*.11)*1.5;this.camera.position.set(e.x+Math.cos(n)*s,e.y+r,e.z+Math.sin(n)*s),this.camera.lookAt(e.x,e.y-3.2,e.z),this.stream(),this.flushDirty(),this.uni.uTime.value=performance.now()/1e3,this.updateSky(),this.cloudU.uOff.value.x+=t*2.5}clearWorld(){this.deco.clear();for(const t of this.group.children.slice())t.geometry.dispose(),this.group.remove(t);this.mobs&&(this.mobs.clear(),this.mobs=null),this.mobView.clear(),this.vehicles&&(this.vehicles.clear(),this.vehicles=null),this.vehView.clear(),this.ride=null,this.vitals=null,this.dead=!1,this.world=null,this.mwJobs=0}loadAround(t,e){const n=Math.floor(this.player.x/F),s=Math.floor(this.player.z/F);for(let r=-t;r<=t;r++)for(let a=-t;a<=t;a++)this.world.ensure(n+a,s+r);for(let r=-e;r<=e;r++)for(let a=-e;a<=e;a++)this.applyMesh(this.world.getChunk(n+a,s+r))}serialize(){const t=this.player,e=ep(this.world.edits);return{v:tp,gen:this.gen,name:this.name,seed:this.seed,mode:this.mode,time:this.time,savedAt:Date.now(),px:t.x,py:t.y,pz:t.z,yaw:this.yaw,pitch:this.pitch,hotbar:this.hotbar,sel:this.sel,inv:this.inv,wp:this.wp,story:this.story,edits:e,vit:this.vitals?this.vitals.toJSON():void 0,dur:this.dur,grave:this.grave||void 0,mobs:this.mobs?this.mobs.serialize():void 0,age:Math.round(this.age),farm:this.farm.plants.size?this.farm.serialize():void 0,arm:this.armor.kopf||this.armor.brust?[this.armor.kopf,this.armor.brust,this.armWear.kopf,this.armWear.brust]:void 0,veh:this.vehicles&&this.vehicles.list.length?this.vehicles.serialize():void 0,map:this.map?this.map.serialize():void 0,rot:this.world.rot.size?dM(this.world.rot):void 0}}respawn(){const t=this.player;this.world.ensure(Math.floor(this.spawn.x/F),Math.floor(this.spawn.z/F)),t.x=this.spawn.x,t.y=this.spawn.y,t.z=this.spawn.z,t.vx=t.vy=t.vz=0,t.flying=!1,t.impact=0,this.hookT=0,this.rope.visible=!1,this.loadAround(1,0),this.scanDirty=!0,this.applyCamera(),this.running||this.render()}resume(){this.running||(this.running=!0,this.last=performance.now(),this.raf=requestAnimationFrame(t=>this.frame(t)))}stop(){this.running=!1,cancelAnimationFrame(this.raf),qf(0,0)}frame(t){if(!this.running||(this.raf=requestAnimationFrame(n=>this.frame(n)),this.menuMode&&t-this.last<32))return;this.measure(t-this.last);const e=Math.max(0,Math.min(.05,(t-this.last)/1e3));this.last=t,this.menuMode?this.menuStep(e):this.step(e),this.render()}step(t){const e=this.world,n=this.player;if(this.timeFrozen||(this.time=(this.time+t/Vy)%1),this.uni.uTime.value=performance.now()/1e3,this.dead||(this.ride?this.rideStep():(this.updateHook(t),n.update(e,t,this.input,this.yaw),this.sounds(t)),n.bounces&&(this.questEvent("bounce",0,n.bounces),n.bounces=0),this.story&&n.gliding&&(this.glideAcc=(this.glideAcc||0)+t),this.vitals&&!n.waiting&&this.updateVitals(t)),this.vehicles&&this.vehicles.list.length){const l=-Math.sin(this.yaw),c=-Math.cos(this.yaw),h=Math.hypot(l,c)||1;this.vehicles.update(t,this.ride,this.ride&&!this.dead?{f:this.input.f,r:this.input.r,look:[l/h,c/h]}:null),this.ride&&this.seatPlayer(),this.vehView.update(n.x,n.z,this.light,this.viewDist*F,this.uni.uTime.value)}this.applyCamera(),this.stream();const s=this.time>.52&&this.time<.98;this.mobs&&(this.mobs.update(t,n.x,n.z,{py:n.y,night:s,time:this.time,hostiles:this.survival&&this.enemies&&!this.dead,others:this.mp?this.mp.others():null}),this.mobView.update(n.x,n.z,this.light,this.viewDist*F,this.uni.uTime.value)),this.mp&&this.mp.tick(t),this.dead||(this.age+=t),this.farmT-=t,this.farmT<=0&&(this.farmT=2,!this.net&&this.farm.update(this.world,this.age)&&(this.unsaved=!0));const r=this.camera,a=this.lookDir||(this.lookDir=new N);a.set(0,0,-1).applyEuler(r.rotation),this.target=this.dead?null:Bf(e,r.position.x,r.position.y,r.position.z,a.x,a.y,a.z,jr);const o=!!(this.target&&bn[this.target.type]===8);o!==this.onDeco&&(this.onDeco=o,this.onDecoTarget&&this.onDecoTarget(o)),this.target?(this.hl.position.set(this.target.x+.5,this.target.y+.5,this.target.z+.5),this.hl.visible=!0):this.hl.visible=!1,this.updateGhost(),this.beamT>0&&(this.beamT-=t)<=0&&(this.beam.visible=!1),this.actCool-=t,this.placeHeld&&!this.prevPlace&&(this.placeFirst=!0),this.prevPlace=this.placeHeld,this.breakHeld&&!this.dead?this.useBreak(t,a):(this.setMine(null),this.actCool<=0&&this.placeHeld&&!this.dead&&this.placeBlock()&&(this.actCool=this.placeFirst&&this.placeDelay?.45:.25,this.placeFirst=!1)),this.flushDirty(),this.updateSky(),this.cloudU.uOff.value.x+=t*2.5,this.radioT-=t,(this.world.sigDirty||this.sigRetry&&this.radioT<=0)&&this.updateSignals(),this.radioT<=0&&(this.radioT=.3,this.updateRadio(),this.questTick(),this.checkGrave(),(this.mapT=(this.mapT||0)+1)%4===0&&this.map&&(this.map.markAround(this.player.x,this.player.z,Math.min(this.viewDist,5)),this.map.syncRadios(this.world))),this.updateHand(t),this.partCount&&this.updateParticles(t)}sounds(t){const e=this.player,n=this.world;if(e.onGround&&!e.flying&&!e.inWater&&(this.stepAcc=(this.stepAcc||0)+Math.hypot(e.vx,e.vz)*t,this.stepAcc>2.1&&(this.stepAcc=0,Dy(jy(n.getBlock(Math.floor(e.x),Math.floor(e.y-.05),Math.floor(e.z)))))),e.inWater&&!this.wasWater?Gf(e.vy<-6):e.inWater&&(this.swimAcc=(this.swimAcc||0)+Math.hypot(e.vx,e.vz)*t)>2.5&&(this.swimAcc=0,Gf(!1)),this.wasWater=e.inWater,this.mobs&&(this.callT=(this.callT??3)-t)<=0){this.callT=2.5+Math.random()*5;const s=this.mobs.list.filter(r=>Math.hypot(r.x-e.x,r.z-e.z)<20);if(s.length){const r=s[Math.floor(Math.random()*s.length)];Py(r.T.key,Math.hypot(r.x-e.x,r.y-e.y,r.z-e.z))}}}updateVitals(t){const e=this.vitals,n=this.player,s=[Math.ceil(e.hp),Math.ceil(e.food),Math.ceil(e.air)];let r=0;if(n.impact){const o=xy(n.impact);n.impact=0,o&&!n.inWater&&(e.hurt(o,"Sturz"),r+=o)}const a=n.onGround&&this.world.getBlock(Math.floor(n.x),Math.floor(n.y-.05),Math.floor(n.z))===g.MAGMA;if(r+=e.tick(t,{moving:Math.hypot(n.vx,n.vz)>.5,sprint:this.input.sprint,eyeWater:n.eyeWater,onMagma:a}),r>0&&(this.onHurt(r,e.cause),this.unsaved=!0,r>=1&&nc()),e.dead){this.die(e.cause);return}(s[0]!==Math.ceil(e.hp)||s[1]!==Math.ceil(e.food)||s[2]!==Math.ceil(e.air))&&this.onVitals()}die(t){const e=this.player;this.ride&&this.dismount(),this.dead=!0,this.breakHeld=this.placeHeld=!1,this.hookT=0,this.rope.visible=!1,this.setMine(null),e.vx=e.vy=e.vz=0;const n={x:Math.round(e.x),y:Math.round(e.y),z:Math.round(e.z)};let s=!1;if(this.deathLoss==="grave"){const r={};for(const[a,o]of Object.entries(this.inv))o>0&&(r[a]=o);if(Object.keys(r).length){if(this.grave)for(const[a,o]of Object.entries(this.grave.inv))r[a]=Math.min(Ze,(r[a]||0)+o);this.grave={...n,inv:r},this.inv={},s=!0}}this.wp=n,this.unsaved=!0,this.onDeath(t,s)}revive(){this.dead&&(this.vitals=new Nf,this.dead=!1,this.player.impact=0,this.respawn(),this.onVitals(),this.onChange())}checkGrave(){const t=this.grave,e=this.player;if(!(!t||this.dead||Math.hypot(t.x-e.x,t.y-e.y,t.z-e.z)>2.5)){for(const[n,s]of Object.entries(t.inv))xf(Number(n))&&(this.inv[n]=Math.min(Ze,(this.inv[n]||0)+s));this.wp&&this.wp.x===t.x&&this.wp.z===t.z&&(this.wp=null),this.grave=null,this.unsaved=!0,dn(),this.onToast("Deine Sachen sind wieder da"),this.onChange()}}held(){const t=this.hotbar[this.sel];return t&&(this.mode==="creative"||this.inv[t]>0)?t:0}setMine(t){const e=!!this.mine;this.mine=t,(e||t)&&this.onMine(t?Math.min(1,t.t/t.need):0)}useBreak(t,e){if(this.actCool>0)return;const n=this.camera.position,s=this.target,r=this.mobs?this.mobs.raycast(n.x,n.y,n.z,e.x,e.y,e.z,jr):null,a=this.vehHit(e);if(a&&(!s||a.t<s.t)&&(!r||a.t<r.t)){this.pickVehicle(a.veh),this.actCool=.45,this.setMine(null);return}if(r&&(!s||r.t<s.t)){this.attack(r.mob),this.actCool=.45,this.setMine(null);return}if(!this.survival){this.setMine(null),this.breakBlock()&&(this.actCool=.22);return}if(!s||s.y===0){this.setMine(null);return}const o=this.held();if(!EM(s.type,o)){Sn(),this.onToast(`${pa[s.type]} braucht eine ${Ht[s.type].tier>1?"Stein- oder bessere ":""}Spitzhacke`),this.actCool=.8,this.setMine(null);return}let l=this.mine;if((!l||l.x!==s.x||l.y!==s.y||l.z!==s.z||l.held!==o)&&(l={x:s.x,y:s.y,z:s.z,held:o,t:0,need:SM(s.type,o),sw:0}),l.t+=t,l.sw-=t,l.sw<=0&&(l.sw=.25,this.swing=1),l.t>=l.need){this.setMine(null),this.breakBlock()&&(this.actCool=.1);return}this.setMine(l)}attack(t){if(t.npc){this.onToast(`${t.name}: „He, nicht hauen! Lass uns lieber tauschen.“`),this.actCool=.8;return}const e=this.held(),n=$i(e),s=this.player,r=this.mode==="creative"?99:n?n.kind==="schwert"?n.dmg:n.kind==="axt"?3:2:1;if(this.swing=1,tc(),n&&n.kind==="schwert"&&this.wear(e),this.net){this.net.hit(t.id,Math.min(r,10)),t.hurtT=.35;return}if(!t.hit(r,s.x,s.z)||(this.spawnBreak(t.x-.5,t.y,t.z-.5,g.WOOL),this.mobs.remove(t,!1),this.unsaved=!0,this.questEvent("kill",t.type),this.mode==="creative"))return;const a=xp(t.type).map(([o,l])=>(this.inv[o]=Math.min(Ze,(this.inv[o]||0)+l),`+${l} ${_e(o)}`));a.length&&this.onToast(a.join(" · ")),this.onChange()}mobHits(t){if(t.target&&this.mp){this.mp.hurtGuest(t);return}const e=this.vitals,n=this.player;if(!e||this.dead)return;const s=Math.hypot(n.x-t.x,n.z-t.z)||1;if(t.T.range){const a=this.beam.geometry.attributes.position;a.setXYZ(0,t.x,t.y+.3,t.z),a.setXYZ(1,n.x,n.y+1.2,n.z),a.needsUpdate=!0,this.beam.visible=!0,this.beamT=.15}else n.vx+=(n.x-t.x)/s*6,n.vz+=(n.z-t.z)/s*6,n.vy=Math.max(n.vy,5),n.onGround=!1;const r=t.T.dmg*gf(this.armorPoints());this.wearArmor(),e.hurt(r,t.T.name),nc(),this.onHurt(r,t.T.name),this.onVitals(),this.unsaved=!0,e.dead&&this.die(t.T.name)}remoteHurt(t){const e=this.vitals,n=this.player;if(!e||this.dead)return;const s=Array.isArray(t.from)&&t.from.slice(0,3).every(Number.isFinite)?t.from:null;if(s&&s[3]){const o=this.beam.geometry.attributes.position;o.setXYZ(0,s[0],s[1],s[2]),o.setXYZ(1,n.x,n.y+1.2,n.z),o.needsUpdate=!0,this.beam.visible=!0,this.beamT=.15}else if(s){const o=Math.hypot(n.x-s[0],n.z-s[2])||1;n.vx+=(n.x-s[0])/o*6,n.vz+=(n.z-s[2])/o*6,n.vy=Math.max(n.vy,5),n.onGround=!1}const r=typeof t.cause=="string"?t.cause.slice(0,30):"Gegner",a=Math.min(10,t.dmg)*gf(this.armorPoints());this.wearArmor(),e.hurt(a,r),nc(),this.onHurt(a,r),this.onVitals(),e.dead&&this.die(r)}record(t,e,n,s,r){if(this.net&&this.net.local(t,e,n,s,r),this.mode==="creative"){if(this.batch){this.batch.push([t,e,n,s,r]);return}this.history.push([[t,e,n,s,r]]),this.history.length>100&&this.history.shift(),this.redoList.length=0}}beginBatch(){this.batch=[]}endBatch(){const t=this.batch;this.batch=null,t&&t.length&&(this.history.push(t),this.history.length>100&&this.history.shift(),this.redoList.length=0)}undo(t=!1){if(this.mode!=="creative")return this.onToast("Rückgängig gibt es im Kreativmodus"),!1;const e=t?this.redoList:this.history,n=t?this.history:this.redoList,s=e.pop();if(!s)return this.onToast(t?"Nichts zum Wiederholen":"Nichts zum Rückgängigmachen"),!1;const r=t?s:s.slice().reverse();for(const[a,o,l,c,h]of r){this.world.ensure(a>>4,l>>4);const u=t?c:h,f=t?h:c;this.world.setBlock(a,o,l,f)&&this.net&&this.net.local(a,o,l,u,f)}return n.push(s),this.unsaved=!0,dn(),this.running||(this.flushDirty(),this.render()),!0}hoe(t){const e=this.target;return!e||![g.GRASS,g.DIRT,g.FLOWERS,g.MYCEL].includes(e.type)||this.world.getBlock(e.x,e.y+1,e.z)!==g.AIR||!this.world.setBlock(e.x,e.y,e.z,g.FARMLAND)?!1:(this.record(e.x,e.y,e.z,e.type,g.FARMLAND),this.wear(t),this.swing=1,dn(),this.unsaved=!0,this.onChange(),!0)}sow(t){const e=this.target;return!e||e.type!==g.FARMLAND||this.world.getBlock(e.x,e.y+1,e.z)!==g.AIR?(this.onToast("Samen brauchen Ackerboden (Hacke auf Gras oder Erde)"),this.actCool=.6,!1):this.mode!=="creative"&&!(this.inv[t]>0)?(Sn(),this.onToast(`Keine ${_e(t)} im Vorrat`),this.actCool=.4,!1):this.farm.plant(e.x,e.y+1,e.z,this.age)?(this.world.setBlock(e.x,e.y+1,e.z,Kl(t)),this.record(e.x,e.y+1,e.z,g.AIR,Kl(t)),this.mode!=="creative"&&this.inv[t]--,this.swing=1,dn(),this.unsaved=!0,this.onChange(),!0):(this.onToast("Zu viele Pflanzen in dieser Welt"),!1)}eat(t){return this.vitals?this.inv[t]>0?this.vitals.eat(_f(t))?(this.inv[t]--,this.swing=1,dn(),this.unsaved=!0,this.onChange(),this.onVitals(),!0):(this.onToast("Du bist satt"),this.actCool=.6,!1):(Sn(),this.onToast(`Kein ${_e(t)} im Vorrat`),this.actCool=.4,!1):(this.onToast("Essen braucht man nur im Überlebensmodus"),this.actCool=.6,!1)}wear(t){const e=$i(t);if(!e||this.mode==="creative")return;const n=(this.dur[t]||0)+1;if(n<e.dur){this.dur[t]=n;return}delete this.dur[t],this.inv[t]=Math.max(0,(this.inv[t]||0)-1),Sn(),this.onToast(`${_e(t)} ist zerbrochen`)}stationsNear(t=4){const e=new Set,n=this.player,s=this.world;if(!s)return e;const r=Math.floor(n.x),a=Math.floor(n.y),o=Math.floor(n.z);for(let l=a-2;l<=a+3;l++)for(let c=o-t;c<=o+t;c++)for(let h=r-t;h<=r+t;h++){const u=Ht[s.getBlock(h,l,c)];u&&u.station&&e.add(u.station)}return e}updateSignals(){const t=this.world,e=this.player,n=Ox(t.sig);let s=!1;this.sigStats=n,this.sigRetry=!1;for(const[r,a]of t.sig){const o=a[3],l=Px[o]??o;if(!ff[l])continue;const c=n.on.has(r)?ff[l]:l;if(c===o)continue;if(c===g.GATE&&e.x+.3>a[0]&&e.x-.3<a[0]+1&&e.z+.3>a[2]&&e.z-.3<a[2]+1&&e.y+1.8>a[1]&&e.y<a[1]+1){this.sigRetry=!0;continue}t.setBlock(a[0],a[1],a[2],c),Math.hypot(a[0]-e.x,a[1]-e.y,a[2]-e.z)<24&&!s&&(s=!0,(l===g.GATE?Iy:Ny)())}t.sigDirty=!1,n.capped&&this.onToast("Signalnetz zu groß: nicht alles wird berechnet")}fireHook(){if(!this.running||this.ride)return;const t=this.camera,e=new N(0,0,-1).applyEuler(t.rotation),n=Bf(this.world,t.position.x,t.position.y,t.position.z,e.x,e.y,e.z,40);if(!n){Sn(),this.onToast("Seilhaken: kein Ziel in Reichweite");return}this.hookTarget.set(n.x+.5+n.nx*.9,n.y+.5+n.ny*.9,n.z+.5+n.nz*.9),this.hookT=1.6,dn(),this.questEvent("hook",0)}updateHook(t){const e=this.player;if(e.hook=!1,this.hookT<=0){this.rope.visible=!1;return}this.hookT-=t;const n=this.hookTarget,s=n.x-e.x,r=n.y-(e.y+Ql),a=n.z-e.z,o=Math.hypot(s,r,a);if(o<2||this.hookT<=0){this.hookT=0,this.rope.visible=!1,e.vx*=.6,e.vz*=.6,e.vy=Math.max(e.vy*.6,3);return}const l=24/o;e.vx=s*l,e.vy=r*l,e.vz=a*l,e.hook=!0;const c=this.rope.geometry.attributes.position;c.setXYZ(0,e.x+.3,e.y+Ql-.35,e.z),c.setXYZ(1,n.x,n.y,n.z),c.needsUpdate=!0,this.rope.visible=!0}toggleWaypoint(){const t=this.player;this.wp&&Math.hypot(this.wp.x-t.x,this.wp.z-t.z)<4?(this.wp=null,this.onToast("Wegpunkt entfernt")):(this.wp={x:Math.round(t.x),y:Math.round(t.y),z:Math.round(t.z)},this.onToast("Wegpunkt gesetzt")),this.unsaved=!0}updateRadio(){const t=this.player;let e=1e9,n=0;for(const s of this.world.radios.values()){const r=Math.hypot(s[0]+.5-t.x,s[1]+.5-(t.y+1),s[2]+.5-t.z);r<e&&(e=r,n=s[0]*7+s[2]*13+s[1]>>>0)}this.radioDist=e,qf(e<24?Math.pow(1-e/24,1.5):0,n)}questTick(){const t=this.story;if(!t||t.done)return;const e=hr(t)[t.i];e.k==="height"&&(t.max=Math.max(t.max,this.player.y-this.spawnY)),e.k==="glide"&&this.glideAcc&&(t.p+=this.glideAcc),e.k==="depth"&&this.player.y<e.y&&(t.p=1),e.k==="visit"&&this.world.villageAt(this.player.x,this.player.z)&&(t.p=1),this.glideAcc=0,this.questCheck()}questEvent(t,e,n=1){const s=this.story;if(!s||s.done)return;const r=hr(s)[s.i];if(r.k==="have"){this.questCheck();return}r.k!==t||r.a&&!r.a.includes(e)||(s.p+=n,this.questCheck())}questCheck(){const t=this.story,e=hr(t);for(let n=0;t&&!t.done&&n<e.length;n++){const s=e[t.i],[r,a]=Ep(this,s);if(r<a)break;for(const[o,l]of Object.entries(s.r||{}))this.inv[o]=Math.min(Ze,(this.inv[o]||0)+l);if(t.i++,t.p=0,t.max=0,t.i>=e.length)t.done=!0;else if(e[t.i].k==="visit"){const o=$d(this.seed,this.player.x,this.player.z);o&&(this.wp={x:o.x,y:o.y+1,z:o.z})}this.unsaved=!0,Oy(),this.onQuestDone(s,t.done),this.onChange()}this.onQuest()}updateHand(t){const e=this.hotbar[this.sel];if(e!==this.handType){if(this.handType=e,this.hand.visible=e>0&&!Wi(e),this.itemHand.visible=Wi(e)&&!!Re[e],this.itemHand.visible){const a=Re[e].icon,o=this.itemCanvas.height/ia,l=a%qi/qi,c=l+1/qi,h=1-Math.floor(a/qi)/o,u=h-1/o,f=this.itemHand.geometry.attributes.uv;f.setXY(0,l,h),f.setXY(1,c,h),f.setXY(2,l,u),f.setXY(3,c,u),f.needsUpdate=!0}if(this.hand.visible){const a=qM(e),o=new Ie;o.setAttribute("position",new be(a.pos,3)),o.setAttribute("uv",new be(a.uv,2)),o.setAttribute("aCol",new be(a.col,4)),o.setIndex(new be(a.idx,1)),this.hand.geometry.dispose(),this.hand.geometry=o,this.hand.material=Qo(e)?this.handMatL:this.handMatO}}const n=this.player,s=Math.hypot(n.vx,n.vz)>.5&&n.onGround;if(this.ride){this.hand.visible=this.itemHand.visible=!1,this.handType=-1;return}s&&(this.bob+=t*9),this.swing=Math.max(0,this.swing-t*4.5);const r=Math.sin(this.swing*Math.PI);this.hand.scale.setScalar(.12),this.hand.position.set(.34-r*.06,-.27+Math.sin(this.bob)*.008-r*.06,-.55-r*.04),this.hand.rotation.set(.25-r*.7,-.62,.06),this.itemHand.visible&&(this.itemHand.scale.setScalar(.3),this.itemHand.position.set(.36-r*.05,-.24+Math.sin(this.bob)*.008-r*.05,-.55),this.itemHand.rotation.set(-r*.9,-.35,.2+r*.4))}spawnBreak(t,e,n,s){const r=Ht[s]?Ht[s].color:14540253;for(let a=0;a<10;a++){this.partIdx=((this.partIdx||0)+1)%24;let o=this.parts[this.partIdx];o||(o=new Te(this.partGeo||(this.partGeo=new es(1,1,1)),new jn({color:r})),o.userData={life:0},this.scene.add(o),this.parts[this.partIdx]=o),o.userData.life||this.partCount++,o.material.color.setHex(r),o.position.set(t+.2+Math.random()*.6,e+.2+Math.random()*.6,n+.2+Math.random()*.6),o.userData={life:.55+Math.random()*.3,v:new N((Math.random()-.5)*3,Math.random()*3+1,(Math.random()-.5)*3)},o.scale.setScalar(.1+Math.random()*.08),o.visible=!0}}updateParticles(t){for(const e of this.parts){if(!e||!e.userData.life)continue;const n=e.userData;n.life-=t,n.v.y-=14*t,e.position.addScaledVector(n.v,t),n.life<=0&&(n.life=0,e.visible=!1,this.partCount--)}}applyCamera(){const t=this.player,e=this.camera;e.position.set(t.x,t.y+Ql,t.z),e.rotation.set(this.pitch,this.yaw,0)}breakBlock(){const t=this.target;if(!t||t.y===0)return!1;if(this.world.setBlock(t.x,t.y,t.z,g.AIR)){this.record(t.x,t.y,t.z,t.type,g.AIR);const e=(n,s)=>{this.inv[n]=Math.min(Ze,(this.inv[n]||0)+s)};if(_p(t.type)){if(this.farm.remove(t.x,t.y,t.z),this.mode!=="creative"){const n=_y(t.type);n.forEach(([s,r])=>e(s,r)),this.onToast(n.map(([s,r])=>`+${r} ${_e(s)}`).join(" · "))}}else this.mode!=="creative"&&e(Ht[t.type].drop||(t.type===g.FARMLAND?g.DIRT:t.type),1);if(this.mode!=="creative"&&(t.type===g.GRASS||t.type===g.FLOWERS)&&Math.random()<.12&&(e(K.SEEDS,1),this.onToast("+1 Weizensamen")),this.survival){const n=this.held();bM(t.type,n)&&this.wear(n),(t.type===g.LEAVES||t.type===g.JLEAVES)&&Math.random()<.08&&(this.inv[K.APPLE]=Math.min(Ze,(this.inv[K.APPLE]||0)+1),this.onToast("+1 Apfel"))}return this.unsaved=!0,this.swing=1,this.spawnBreak(t.x,t.y,t.z,t.type),tc(),this.onChange(),this.questEvent("break",t.type),!0}return!1}rotateDeco(t=1){const e=this.target;if(!e||bn[e.type]!==8)return!1;const n=this.world,s=n.getRot(e.x,e.y,e.z)??mp((r,a,o)=>n.getBlock(r,a,o),e.x,e.y,e.z);return n.setRot(e.x,e.y,e.z,s+t+4&3)?(this.unsaved=!0,this.swing=1,ec(),this.actCool=.25,this.running||(this.flushDirty(),this.render()),!0):!1}placeBlock(){const t=this.target,e=this.hotbar[this.sel];if(t&&bn[t.type]===8&&this.input.sneak)return this.placeFirst?this.rotateDeco():!1;const n=this.camera.position,s=this.lookDir,r=this.mobs&&s?this.mobs.raycast(n.x,n.y,n.z,s.x,s.y,s.z,jr):null;if(r&&r.mob.npc&&(!t||r.t<t.t))return this.onTrade(r.mob),this.questEvent("talk",0),this.actCool=.5,!1;const a=s?this.vehHit(s):null;if(a&&(!t||a.t<t.t)&&!this.ride)return this.placeFirst&&this.mount(a.veh),!1;if(e&&vf(e))return this.placeVehicle(e);if(t&&(t.type===g.SWITCH||t.type===g.SWITCH_ON)){if(!this.placeFirst)return!1;const _=t.type===g.SWITCH?g.SWITCH_ON:g.SWITCH;return this.world.setBlock(t.x,t.y,t.z,_)&&(this.record(t.x,t.y,t.z,t.type,_),this.swing=1,ec(),this.unsaved=!0,this.onToast(_===g.SWITCH_ON?"Schalter an":"Schalter aus")),!0}if(t&&(t.type===g.DOOR||t.type===g.DOOR_OPEN)&&!(e&&bn[e]===6&&t.ny===1))return this.placeFirst?(this.toggleDoor(t.x,t.y,t.z),!0):!1;if(t&&e===t.type&&Ht[e].full&&t.ny===1&&(this.mode==="creative"||this.inv[e]>0)){const _=Ht[e].full;if(this.world.setBlock(t.x,t.y,t.z,_))return this.record(t.x,t.y,t.z,t.type,_),this.mode!=="creative"&&this.inv[e]--,this.unsaved=!0,this.swing=1,dn(),this.onChange(),!0}if(t&&this.mode!=="creative"&&Ht[t.type]&&Ht[t.type].station)return this.onStation(Ht[t.type].station),this.actCool=.5,!1;if(e&&Vr(e))return this.equip(e);if(e&&Wi(e)){const _=this.held(),m=$i(_);return m&&m.kind==="hacke"?this.hoe(_):Kl(e)?this.sow(e):_f(e)?this.eat(e):!1}const o=$r[this.buildMode];if(o.key!=="einzeln")return this.buildClick(o,t,e);if(!t||!e)return!1;if(this.mode!=="creative"&&!(this.inv[e]>0))return Sn(),this.onToast(`Kein ${pa[e]} im Vorrat`),this.actCool=.4,!1;const l=t.x+t.nx,c=t.y+t.ny,h=t.z+t.nz;if(c<0||c>=ie)return!1;const u=this.world.getBlock(l,c,h);if(u!==g.AIR&&u!==g.WATER)return!1;const f=this.player,p=.3;if(f.x+p>l&&f.x-p<l+1&&f.z+p>h&&f.z-p<h+1&&f.y+1.8>c&&f.y<c+1)return!1;const v=bn[e]===2?Ex(e,this.yaw):e;return this.world.setBlock(l,c,h,v)?(bn[e]===8&&this.world.setRot(l,c,h,Ls[br[e]].wall&&t.ny===0?af(t.nx,t.nz):af(Math.sin(this.yaw),Math.cos(this.yaw))),this.record(l,c,h,u,v),this.mode!=="creative"&&this.inv[e]--,this.unsaved=!0,this.swing=1,dn(),this.onChange(),this.questEvent("place",e),!0):!1}toggleDoor(t,e,n){const s=this.world,r=l=>l===g.DOOR||l===g.DOOR_OPEN,a=s.getBlock(t,e,n)===g.DOOR?g.DOOR_OPEN:g.DOOR;let o=e;for(;o>0&&r(s.getBlock(t,o-1,n));)o--;for(let l=o;l<ie&&r(s.getBlock(t,l,n));l++){const c=s.getBlock(t,l,n);c!==a&&s.setBlock(t,l,n,a)&&this.record(t,l,n,c,a)}this.swing=1,this.unsaved=!0,ec()}selectSlot(t){this.sel=(t%9+9)%9,this.onChange()}cycleBuild(t=1){const e=$r.map((s,r)=>r).filter(s=>!$r[s].creative||this.mode==="creative"),n=Math.max(0,e.indexOf(this.buildMode));this.buildMode=e[(n+t+e.length)%e.length],this.anchor=null,this.onBuildMode($r[this.buildMode])}buildClick(t,e,n){if(!this.placeFirst)return!1;if(t.creative&&this.mode!=="creative")return this.onToast(`${t.name} gibt es im Kreativmodus`),!0;if(t.key==="einfuegen")return this.clip?e?this.applyCells(fy(this.clip,[e.x+e.nx,e.y+e.ny,e.z+e.nz]),"Eingefügt",!0):!1:(this.onToast("Erst mit „Kopieren“ zwei Ecken wählen"),!0);if(!e)return!1;const s=t.key==="kopieren"?[e.x,e.y,e.z]:[e.x+e.nx,e.y+e.ny,e.z+e.nz];if(!this.anchor)return this.anchor=s,this.onToast(`${t.name}: erste Ecke gesetzt, jetzt die zweite wählen`),dn(),!0;const r=this.anchor;if(this.anchor=null,t.key==="kopieren"){const l=uy(this.world,r,s);return l?(this.clip=l,dn(),this.onToast(`${l.n} Blöcke kopiert (${l.sx}×${l.sy}×${l.sz}), jetzt „Einfügen“ wählen`),!0):(Sn(),this.onToast("Zu groß zum Kopieren (höchstens 32 768 Blöcke)"),!0)}if(!n||Wi(n))return this.onToast("Wähle einen Block in der Hotbar"),!0;const a=this.mode==="creative"?nh.creative:nh.survival,o=hy(t.key,r,s,a);return o?this.applyCells(o.map(l=>[l[0],l[1],l[2],n]),t.name,!1):(Sn(),this.onToast(`Zu groß: höchstens ${a} Blöcke auf einmal`),!0)}applyCells(t,e,n){const s=this.mode==="creative",r=this.player,a=.3;let o=0,l=!1;this.beginBatch();for(const[c,h,u,f]of t){if(h<=0||h>=ie)continue;if(!s&&!(this.inv[f]>0)){l=!0;continue}const p=this.world.getBlock(c,h,u);p===f||!(n&&s)&&p!==g.AIR&&p!==g.WATER||Ht[f].solid&&r.x+a>c&&r.x-a<c+1&&r.z+a>u&&r.z-a<u+1&&r.y+1.8>h&&r.y<h+1||this.world.setBlock(c,h,u,f)&&(this.record(c,h,u,p,f),s||this.inv[f]--,o++,this.questEvent("place",f))}return this.endBatch(),o&&(this.unsaved=!0,this.swing=1,dn(),this.onChange()),this.onToast(o?`${e}: ${o} Blöcke${l?" (Vorrat reichte nicht)":""}`:l?"Nicht genug im Vorrat":"Nichts zu setzen"),!0}updateGhost(){const t=this.ghost,e=this.target,n=$r[this.buildMode],s=this.hotbar[this.sel];let r=null;if(e&&!this.dead&&(this.preview||n.key!=="einzeln")){const a=[e.x+e.nx,e.y+e.ny,e.z+e.nz];if(n.key==="einfuegen")this.clip&&(r=[...a,a[0]+this.clip.sx-1,a[1]+this.clip.sy-1,a[2]+this.clip.sz-1]);else if(n.key==="kopieren"){const o=[e.x,e.y,e.z];r=this.anchor?ih(this.anchor,o):[...o,...o]}else s&&!Wi(s)&&!(this.mode!=="creative"&&Ht[e.type]&&Ht[e.type].station)&&(r=this.anchor?ih(this.anchor,a):[...a,...a])}if(!r){t.visible=!1;return}t.position.set((r[0]+r[3]+1)/2,(r[1]+r[4]+1)/2,(r[2]+r[5]+1)/2),t.scale.set(r[3]-r[0]+1,r[4]-r[1]+1,r[5]-r[2]+1),t.visible=!0}vehHit(t){if(!this.vehicles||!this.vehicles.list.length)return null;const e=this.camera.position,n=this.vehicles.raycast(e.x,e.y,e.z,t.x,t.y,t.z,jr);return n&&n.veh!==this.ride?n:null}placeVehicle(t){if(!this.placeFirst)return!1;const e=vf(t),n=Go[e],s=this.target,r=this.lookDir,a=this.camera.position;if(this.mode!=="creative"&&!(this.inv[t]>0))return Sn(),this.onToast(`Kein ${n.name} im Vorrat`),!1;let o=null;if(e==="boot"){for(let c=.5;c<=jr&&!o;c+=.25){const h=Math.floor(a.x+r.x*c),u=Math.floor(a.y+r.y*c),f=Math.floor(a.z+r.z*c);if(s&&c>s.t)break;if(this.world.getBlock(h,u,f)===g.WATER){const p=this.vehicles.waterTop(h+.5,u,f+.5);p!==null&&(o=[h+.5,p-.3,f+.5])}}!o&&s&&s.ny===1&&(o=[s.x+.5,s.y+1.001,s.z+.5])}else s&&s.type===g.RAIL?o=[s.x+.5,s.y,s.z+.5]:s&&s.ny===1&&this.world.getBlock(s.x,s.y+1,s.z)===g.RAIL&&(o=[s.x+.5,s.y+1,s.z+.5]);return o?this.vehicles.boxHits({K:n},o[0],o[1]+.05,o[2])?(Sn(),this.onToast("Kein Platz für das Fahrzeug"),!1):this.vehicles.add(e,o[0],o[1],o[2],this.yaw)?(this.mode!=="creative"&&this.inv[t]--,this.swing=1,dn(),this.unsaved=!0,this.onChange(),this.onToast(`${n.name} gesetzt · Setzen = einsteigen, Abbauen = einpacken`),!0):(Sn(),this.onToast(e==="lore"?"Die Lore braucht eine Schiene":"Zu viele Fahrzeuge in dieser Welt"),!1):(Sn(),this.onToast(e==="boot"?"Boot: aufs Wasser oder auf den Boden zielen":"Die Lore braucht eine Schiene"),this.actCool=.5,!1)}pickVehicle(t){this.vehicles.remove(t),this.spawnBreak(t.x-.5,t.y,t.z-.5,t.kind==="boot"?g.PLANKS:g.STONE),tc(),this.mode!=="creative"&&(this.inv[t.K.item]=Math.min(Ze,(this.inv[t.K.item]||0)+1),this.onToast(`+1 ${t.K.name}`)),this.unsaved=!0,this.onChange()}mount(t){const e=this.player;this.ride=t,t.rider=!0,e.flying=!1,e.vx=e.vy=e.vz=0,e.eyeWater=!1,e.impact=0,this.hookT=0,this.rope.visible=!1,this.prevJump=!0,t.kind==="lore"&&(this.yaw=t.yaw),this.seatPlayer(),dn(),this.onToast(t.kind==="boot"?"Im Boot: vor/zurück = paddeln, links/rechts = lenken, Springen = aussteigen":"In der Lore: vor = anschieben (in Blickrichtung), zurück = bremsen, Springen = aussteigen"),this.onRide(!0)}dismount(){const t=this.ride,e=this.player;if(!t)return;this.ride=null,t.rider=!1;const[n,s,r]=this.vehicles.exitSpot(t,(a,o,l)=>e.collides(this.world,a,o,l));e.x=n,e.y=s,e.z=r,e.vx=e.vy=e.vz=0,e.onGround=!1,this.onRide(!1)}seatPlayer(){const t=this.ride,e=this.player;e.x=t.x,e.y=t.y+t.K.seat-.4,e.z=t.z}rideStep(){const t=this.input.jump;t&&!this.prevJump&&this.dismount(),this.prevJump=t}equip(t){const e=Vr(t),n=this.mode==="creative";if(!n&&!(this.inv[t]>0))return Sn(),this.onToast(`Kein ${_e(t)} im Vorrat`),this.actCool=.4,!1;const s=this.armor[e.slot];return s===t?(this.onToast(`${_e(t)} trägst du schon`),this.actCool=.6,!1):(n||(this.inv[t]--,s&&(this.inv[s]=Math.min(Ze,(this.inv[s]||0)+1))),this.armor[e.slot]=t,this.armWear[e.slot]=0,this.swing=1,dn(),this.unsaved=!0,this.onToast(`${_e(t)} angelegt · Schutz ${this.armorPoints()*5} %`),this.onChange(),this.onVitals(),!0)}armorPoints(){let t=0;for(const e of["kopf","brust"]){const n=Vr(this.armor[e]);n&&(t+=n.pts)}return t}wearArmor(){if(this.mode!=="creative")for(const t of["kopf","brust"]){const e=this.armor[t],n=Vr(e);n&&++this.armWear[t]>=n.dur&&(this.armor[t]=0,this.armWear[t]=0,this.onToast(`${_e(e)} ist zerbrochen`))}}areaReady(t){const e=Math.floor(this.player.x/F),n=Math.floor(this.player.z/F);let s=0,r=0;for(const[a,o,l]of this.offsets){if(l>t)continue;s++;const c=this.world.getChunk(e+a,n+o);c&&c.meshed&&r++}return s?r/s:1}stream(){const t=Math.floor(this.player.x/F),e=Math.floor(this.player.z/F);if(!this.lastPC||this.lastPC[0]!==t||this.lastPC[1]!==e){this.lastPC=[t,e],this.scanDirty=!0;const h=this.viewDist+3.5;for(const[u,f]of this.world.chunks)Math.hypot(f.cx-t,f.cz-e)>h&&(this.dropMesh(f),this.world.chunks.delete(u))}if(!this.scanDirty)return;const s=performance.now(),r=this.viewDist+.5,a=-Math.sin(this.yaw),o=-Math.cos(this.yaw);let l=!1,c=0;t:for(let h=0;h<2;h++)for(const[u,f,p]of this.offsets){const v=p<2.5||u*a+f*o>-.3*p;if(h===0!==v)continue;let _=this.world.getChunk(t+u,e+f);const m=p<=r&&(!_||!_.meshed);if(!(_&&!m)){if(c>0&&performance.now()-s>this.budget){l=!0;break t}if(_||(_=this.world.ensure(t+u,e+f),c++,l=!0),m){const d=this.requestMesh(_);d===!0?(c++,l=!0):d==="wait"&&(l=!0)}}}l||(this.scanDirty=!1)}flushDirty(){const t=this.world;if(t.dirty.size){for(const e of t.dirty)e.meshed&&t.chunks.get(e.key)===e&&this.applyMesh(e);t.dirty.clear()}}dropMesh(t){this.deco.drop(t);for(const e of["opaque","trans","logo"])t[e]&&(this.group.remove(t[e]),t[e].geometry.dispose(),t[e]=null)}requestMesh(t){if(!this.mw)return this.applyMesh(t);if(t.pending||this.mwJobs>=4)return"wait";const e=vp(this.world,t);if(!e)return!1;const n=e.nb.map(r=>r.slice()),s=e.hms.map(r=>r.slice());return t.pending=t.ver=++this.meshSeq,this.mwJobs++,this.mw.postMessage({key:t.key,ver:t.ver,nb:n,hms:s,maxY:e.maxY,rot:e.rot},n.map(r=>r.buffer)),!0}onMeshed({key:t,ver:e,r:n}){this.mwJobs=Math.max(0,this.mwJobs-1);const s=this.world&&this.world.chunks.get(t);!s||s.ver!==e||s.pending!==e||(s.pending=0,this.setPart(s,"opaque",n.opaque,this.matO),this.setPart(s,"trans",n.trans,this.matT),this.setPart(s,"logo",n.logo,this.matL),this.deco.setChunk(s,n.deco),s.meshed=!0,this.scanDirty=!0,!this.running&&this.world&&this.render())}applyMesh(t){const e=BM(this.world,t);return e?(t.ver=++this.meshSeq,t.pending=0,this.setPart(t,"opaque",e.opaque,this.matO),this.setPart(t,"trans",e.trans,this.matT),this.setPart(t,"logo",e.logo,this.matL),this.deco.setChunk(t,e.deco),t.meshed=!0,!0):!1}setPart(t,e,n,s){let r=t[e];if(!n){r&&(this.group.remove(r),r.geometry.dispose(),t[e]=null);return}const a=new Ie;if(a.setAttribute("position",new be(n.pos,3)),a.setAttribute("uv",new be(n.uv,2)),a.setAttribute("aCol",new be(n.col,4)),a.setIndex(new be(n.idx,1)),a.boundingSphere=new is(new N(F/2,ie/2,F/2),this.chunkSphereR),r){r.geometry.dispose(),r.geometry=a;return}r=new Te(a,s),s!==this.matT&&(r.layers.enable(Ch),r.userData.atlas=s===this.matO),r.position.set(t.cx*F,0,t.cz*F),r.matrixAutoUpdate=!1,r.updateMatrix(),this.group.add(r),t[e]=r}updateSky(){const t=this.time*Math.PI*2,e=Math.sin(t),n=Math.cos(t),s=_o(-.12,.28,e),r=Math.max(0,1-Math.abs(e)/.3);let a=Hi([.04,.06,.14],[.68,.84,.95],s);a=Hi(a,[.97,.56,.36],r*.55);let o=Hi([.012,.02,.07],[.24,.5,.88],s);o=Hi(o,[.34,.3,.52],r*.4);const l=e>=0,c=l?_o(-.02,.3,e):_o(-.02,.3,-e)*.3,h=this.uni.uSunDir.value;l?h.set(n,e,.25):h.set(-n,-e,.25),h.normalize();const u=l?Hi([1,.6,.36],[1,.95,.84],_o(0,.4,e)).map(M=>M*.8*c):[.42*c,.52*c,.85*c];this.uni.uSunCol.value.set(u[0],u[1],u[2]);const f=Hi([.17,.21,.36],[.38,.45,.6],s);this.light=.38+.62*s,this.uni.uAmb.value.set(f[0]+r*.12,f[1]+r*.06,f[2]+r*.02);const p=this.camera.position,v=this.world.getBlock(Math.floor(p.x),Math.floor(p.y),Math.floor(p.z))===g.WATER;this.underwater=v;const _=this.viewDist*F-6;if(v){const M=Hi([.04,.12,.26],[.12,.38,.66],s);this.uni.uFog.value.set(M[0],M[1],M[2]),this.uni.uFogRange.value.set(.5,24),this.domeU.uHor.value.set(M[0],M[1],M[2]),this.domeU.uZen.value.set(M[0],M[1],M[2]),this.domeU.uGlow.value.set(0,0,0)}else{this.uni.uFog.value.set(a[0],a[1],a[2]),this.uni.uFogRange.value.set(_*.4,_),this.domeU.uHor.value.set(a[0],a[1],a[2]),this.domeU.uZen.value.set(o[0],o[1],o[2]);const M=.9*r+.1*s;this.domeU.uGlow.value.set(.95*M,.62*M,.4*M)}this.domeU.uSunN.value.set(n,e,.25).normalize(),this.sky.position.copy(p);const m=this.domeU.uSunN.value;this.sun.position.copy(m).multiplyScalar(500),this.sun.lookAt(p),this.moon.position.copy(m).multiplyScalar(-500),this.moon.lookAt(p),this.sun.visible=e>-.25&&!v,this.moon.visible=e<.25&&!v,this.starMat.opacity=Math.max(0,Math.min(1,(.12-e)*3))*(v?0:1),this.stars.rotation.z=t,this.clouds.position.set(p.x,105,p.z);const d=Hi([.2,.23,.36],[1,1,1],s);this.cloudU.uCol.value.set(d[0]+r*0,d[1]-r*.18,d[2]-r*.3),this.clouds.visible=!v&&this.cloudsOn&&!this.vcloudsOn,this.vclouds.update(p,this.uni.uTime.value,[d[0],d[1]-r*.18,d[2]-r*.3],!v&&this.cloudsOn&&this.vcloudsOn);const x=v?0:.35*s+.5*r;this.uni.uFogSun.value.set(1*x,.78*x,.55*x)}render(){this.world&&this.shadows.update(this.renderer,this.scene,this.group,this.camera.position,this.uni.uSunDir.value,!this.running),this.postOn&&this.post?this.post.render():this.renderer.render(this.scene,this.camera)}biomeName(){const t=this.world?this.world.biomeAt(this.player.x,this.player.z):-1;return t>=0?Ax[t]:""}clockText(){const t=Math.floor((this.time*24+6)%24*60);return String(Math.floor(t/60)).padStart(2,"0")+":"+String(t%60).padStart(2,"0")}}const bp={bauer:[{give:[K.APPLE,4],need:[[K.WHEAT,4]]},{give:[K.SEEDS,6],need:[[K.BREAD,1]]},{give:[K.BREAD,2],need:[[g.WOOD,3]]},{give:[K.COPPER_INGOT,1],need:[[K.WHEAT,10]]}],schmied:[{give:[K.IRON_INGOT,1],need:[[g.COAL,6]]},{give:[K.STONE_PICK,1],need:[[K.WHEAT,4]]},{give:[K.COPPER_HELMET,1],need:[[K.COPPER_INGOT,3],[K.BREAD,2]]},{give:[K.IRON_PICK,1],need:[[g.CRYSTAL,2],[K.WHEAT,8]]}],funker:[{give:[g.RADIO,1],need:[[K.COPPER_INGOT,2]]},{give:[g.LAMP,4],need:[[K.WHEAT,6]]},{give:[g.SWITCH,2],need:[[K.BREAD,1]]},{give:[g.CRYSTAL,1],need:[[K.IRON_INGOT,3]]}],hirte:[{give:[g.WOOL,4],need:[[K.WHEAT,4]]},{give:[K.MEAT_COOKED,3],need:[[K.WHEAT,5]]},{give:[K.MEAT_RAW,4],need:[[K.APPLE,3]]}]},Jy={bauer:"Die Felder geben gut her. Weizen tausche ich gern!",schmied:"Kohle und Barren sind mir am liebsten. Ich mache dir gutes Werkzeug.",funker:"Seit dem großen Rauschen ist unser Mast stumm. Bring mir Kupfer, dann reden wir über Funk.",hirte:"Meine Schafe geben Wolle. Für Weizen bekommst du welche."},Tp=1,Kf=4,Qy=9,tS=16e3,eS=60,Yf={survival:[64,32],creative:[8192,2e3]},nS=new Set([g.SWITCH_ON,g.WHEAT0,g.FARMLAND]),aa=i=>typeof i=="number"&&Number.isFinite(i),Xn=i=>Number.isInteger(i),Ap=i=>(typeof i=="string"?i.replace(/[^\p{L}\p{N} _.-]/gu,"").trim().slice(0,16):"")||"Gast";function wp(i){if(typeof i!="string"||i.length>4e6)return null;try{const t=JSON.parse(i);return t&&typeof t=="object"&&typeof t.k=="string"?t:null}catch{return null}}function iS(i,t=tS){const e=[];for(let n=0;n<i.length;n+=t)e.push(i.slice(n,n+t));return e.length?e:[""]}const sS=i=>Ht[i]&&Ht[i].drop||i;class rS{constructor(t){this.env=t,this.peers=new Map,this.nextId=1,this.blocks=[],this.t=0,this.mobT=0}addPeer(t){return{id:0,name:"",send:t,token:null,pos:null,posT:0,bucket:0,bucketT:0,joined:!1}}get guests(){return[...this.peers.values()]}sendTo(t,e){try{t.send(JSON.stringify(e))}catch{}}broadcast(t,e){const n=JSON.stringify(t);for(const s of this.peers.values())if(s!==e)try{s.send(n)}catch{}}receive(t,e){const n=wp(e);if(n){if(!t.joined){n.k==="hello"&&this.hello(t,n);return}if(n.tk===t.token){if(n.k==="pos")this.onPos(t,n);else if(n.k==="sets")this.onSets(t,n);else if(n.k==="hit"&&Xn(n.id)&&aa(n.dmg)){const s=this.env.onHit(t,n.id,Math.max(0,Math.min(10,n.dmg)));s&&s.length&&this.sendTo(t,{k:"drops",list:s})}}}}hello(t,e){if(e.v!==Tp){this.sendTo(t,{k:"bye",why:"Andere Spielversion – bitte beide die Seite neu laden."});return}if(this.peers.size>=Kf){this.sendTo(t,{k:"bye",why:`Die Welt ist voll (höchstens ${Kf} Gäste).`});return}t.id=this.nextId++,t.name=Ap(e.name),t.joined=!0,t.token=Math.random().toString(36).slice(2,12)+Date.now().toString(36);const n=this.env.info(),s=JSON.stringify(n.edits||{}),r=iS(s);t.pos={x:n.pos.x,y:n.pos.y,z:n.pos.z,yaw:0,pitch:0},t.posT=this.env.now(),t.bucket=Yf[n.mode==="creative"?"creative":"survival"][0],t.bucketT=this.env.now(),this.sendTo(t,{k:"welcome",id:t.id,tk:t.token,seed:n.seed,gen:n.gen,mode:n.mode,time:n.time,pos:n.pos,host:n.name,parts:r.length}),r.forEach((a,o)=>this.sendTo(t,{k:"part",i:o,s:a})),this.sendTo(t,{k:"pp",id:0,name:n.name,...n.pos});for(const a of this.peers.values())this.sendTo(t,{k:"pp",id:a.id,name:a.name,...a.pos}),this.sendTo(a,{k:"pp",id:t.id,name:t.name,...t.pos});this.peers.set(t.id,t),this.env.onJoin(t)}close(t){this.peers.has(t.id)&&(this.peers.delete(t.id),this.broadcast({k:"left",id:t.id}),this.env.onLeave(t))}kick(t,e){this.sendTo(t,{k:"bye",why:e}),this.close(t)}onPos(t,e){if(![e.x,e.y,e.z,e.yaw,e.pitch].every(aa)||e.y<-10||e.y>ie+60)return;const n=this.env.now(),s=Math.max(.05,(n-t.posT)/1e3);Math.hypot(e.x-t.pos.x,e.y-t.pos.y,e.z-t.pos.z)>eS*s+4||(t.pos={x:e.x,y:e.y,z:e.z,yaw:e.yaw,pitch:e.pitch},t.posT=n,this.broadcast({k:"pp",id:t.id,x:e.x,y:e.y,z:e.z,yaw:e.yaw},t))}onSets(t,e){if(!Array.isArray(e.list)||!Xn(e.r))return;const n=this.env.world,s=this.env.info().mode,[r,a]=Yf[s==="creative"?"creative":"survival"],o=this.env.now();t.bucket=Math.min(r,t.bucket+(o-t.bucketT)/1e3*a),t.bucketT=o;const l=[],c=t.pos;e.list.forEach((h,u)=>{if(!Array.isArray(h)||h.length!==5||!h.every(Xn)){l.push([u,-1]);return}const[f,p,v,_,m]=h;if(p<1||p>=ie||!Ht[m]||!Ht[_]){l.push([u,-1]);return}if(s!=="creative"&&m&&!Ht[m].inv&&!nS.has(m)){l.push([u,-1]);return}n.ensure&&n.ensure(f>>4,v>>4);const d=n.getBlock(f,p,v);if(Math.hypot(f+.5-c.x,p+.5-(c.y+1.6),v+.5-c.z)>(s==="creative"?200:Qy)||t.bucket<1||d!==_){l.push([u,d]);return}t.bucket--,n.setBlock(f,p,v,m),Ht[m].shape==="cross"&&_===0&&this.env.onPlant(f,p,v)}),this.sendTo(t,{k:"ack",r:e.r,bad:l})}queueBlock(t,e,n,s){this.blocks.push([t,e,n,s])}hurt(t,e,n,s){const r=this.peers.get(t);r&&this.sendTo(r,{k:"hurt",dmg:e,cause:n,from:s})}tick(t,e,n,s){if(!this.peers.size){this.blocks.length=0;return}if(this.blocks.length&&(this.broadcast({k:"bs",list:this.blocks}),this.blocks=[]),this.t-=t,this.mobT-=t,this.t<=0&&(this.t=.1,this.broadcast({k:"pp",id:0,x:e.x,y:e.y,z:e.z,yaw:e.yaw}),(this.tt=(this.tt||0)+1)%10===0&&this.broadcast({k:"time",t:n})),this.mobT<=0&&s){this.mobT=.2;for(const r of this.peers.values()){const a=[];for(const o of s)Math.hypot(o.x-r.pos.x,o.z-r.pos.z)<64&&a.push(aS(o));this.sendTo(r,{k:"mobs",list:a})}}}}const aS=i=>[i.id,i.type,+i.x.toFixed(2),+i.y.toFixed(2),+i.z.toFixed(2),+i.yaw.toFixed(2),i.hurtT>0?1:0,i.moving?1:0,i.npc&&i.role||"",i.npc&&i.name||""];class oS{constructor(t,e,n){this.env=t,this.send=e,this.name=Ap(n),this.token=null,this.id=0,this.welcome=null,this.parts=null,this.r=0,this.pending=new Map,this.out=[]}hello(){this.send(JSON.stringify({k:"hello",v:Tp,name:this.name}))}post(t){this.token&&this.send(JSON.stringify({...t,tk:this.token}))}receive(t){const e=wp(t);if(e)switch(e.k){case"welcome":if(this.token||!Xn(e.parts)||e.parts<1)return;this.welcome=e,this.parts=new Array(e.parts),this.got=0,this.token=e.tk,this.id=e.id;return;case"part":{if(!this.parts||!Xn(e.i)||e.i<0||e.i>=this.parts.length||this.parts[e.i]!==void 0||typeof e.s!="string"||(this.parts[e.i]=e.s,++this.got<this.parts.length))return;let n={};try{n=JSON.parse(this.parts.join(""))}catch{this.env.onBye("Weltdaten beschädigt");return}const s=this.welcome;this.parts=null,this.env.onWelcome({seed:s.seed,gen:s.gen,mode:s.mode,time:s.time,pos:s.pos,host:s.host,edits:n,id:s.id});return}case"bs":Array.isArray(e.list)&&this.env.onBlocks(e.list.filter(n=>Array.isArray(n)&&n.length===4&&n.every(Xn)));return;case"pp":Xn(e.id)&&e.id!==this.id&&[e.x,e.y,e.z].every(aa)&&this.env.onPlayer(e.id,e);return;case"left":Xn(e.id)&&this.env.onLeft(e.id);return;case"mobs":Array.isArray(e.list)&&this.env.onMobs(e.list);return;case"hurt":aa(e.dmg)&&this.env.onHurt(e);return;case"drops":Array.isArray(e.list)&&this.env.onDrops(e.list.filter(n=>Array.isArray(n)&&Xn(n[0])&&Xn(n[1])&&n[1]>0&&n[1]<100));return;case"time":aa(e.t)&&this.env.onTime(e.t);return;case"ack":{const n=this.pending.get(e.r);if(!n)return;this.pending.delete(e.r);const s=Array.isArray(e.bad)?e.bad.filter(r=>Array.isArray(r)&&Xn(r[0])&&n[r[0]]).map(r=>[...n[r[0]],r[1]]):[];s.length&&this.env.onReject(s);return}case"bye":this.env.onBye(typeof e.why=="string"?e.why.slice(0,120):"Verbindung beendet");return}}local(t,e,n,s,r){this.out.push([t,e,n,s,r])}flush(){if(!this.out.length||!this.token)return;const t=++this.r;for(let e=0;e<this.out.length;e+=4096){const n=this.out.slice(e,e+4096),s=e?++this.r:t;this.pending.set(s,n),this.post({k:"sets",r:s,list:n})}this.out=[]}pos(t){this.post({k:"pos",x:+t.x.toFixed(2),y:+t.y.toFixed(2),z:+t.z.toFixed(2),yaw:+t.yaw.toFixed(2),pitch:+t.pitch.toFixed(2)})}hit(t,e){this.post({k:"hit",id:t,dmg:e})}}const Rp=[{urls:"stun:stun.l.google.com:19302"}],oa="KF1.";function Cp(i){return i.iceGatheringState==="complete"?Promise.resolve():new Promise(t=>{const e=setTimeout(t,5e3);i.addEventListener("icegatheringstatechange",()=>{i.iceGatheringState==="complete"&&(clearTimeout(e),t())})})}const jf=i=>{let t="";for(let e=0;e<i.length;e+=8192)t+=String.fromCharCode.apply(null,i.subarray(e,e+8192));return btoa(t).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")},lS=i=>{const t=atob(i.replace(/-/g,"+").replace(/_/g,"/")),e=new Uint8Array(t.length);for(let n=0;n<t.length;n++)e[n]=t.charCodeAt(n);return e};async function Lp(i,t){return new Uint8Array(await new Response(new Blob([i]).stream().pipeThrough(t)).arrayBuffer())}async function Dp(i){const t=new TextEncoder().encode(JSON.stringify(i));return typeof CompressionStream<"u"?oa+"z"+jf(await Lp(t,new CompressionStream("deflate-raw"))):oa+"j"+jf(t)}async function Pp(i){const t=String(i||"").replace(/\s+/g,"");if(!t.startsWith(oa))throw new Error("Das ist kein KlotzFunk-Code");let e=lS(t.slice(oa.length+1));if(t[oa.length]==="z"){if(typeof DecompressionStream>"u")throw new Error("Dieser Browser kann den Code nicht entpacken");e=await Lp(e,new DecompressionStream("deflate-raw"))}return JSON.parse(new TextDecoder().decode(e))}async function cS(i,t){const e=new RTCPeerConnection({iceServers:i?Rp:[]}),n=e.createDataChannel("klotzfunk",{ordered:!0});n.onopen=()=>t(n,e),await e.setLocalDescription(await e.createOffer()),await Cp(e);const s=await Dp({t:"o",sdp:e.localDescription.sdp});return{pc:e,dc:n,code:s,async accept(r){const a=await Pp(r);if(a.t!=="a"||typeof a.sdp!="string")throw new Error("Das ist kein Antwort-Code");await e.setRemoteDescription({type:"answer",sdp:a.sdp})}}}async function hS(i,t,e){const n=await Pp(i);if(n.t!=="o"||typeof n.sdp!="string")throw new Error("Das ist kein Einladungs-Code");const s=new RTCPeerConnection({iceServers:t?Rp:[]});return s.ondatachannel=r=>{const a=r.channel;a.readyState==="open"?e(a,s):a.onopen=()=>e(a,s)},await s.setRemoteDescription({type:"offer",sdp:n.sdp}),await s.setLocalDescription(await s.createAnswer()),await Cp(s),{pc:s,code:await Dp({t:"a",sdp:s.localDescription.sdp})}}const Zf=[3836632,14178874,3848298,13150266,10115800],uS=i=>[[-.22,0,-.12,-.02,.75,.12,2767450],[.02,0,-.12,.22,.75,.12,2767450],[-.28,.75,-.16,.28,1.4,.16,i],[-.4,.8,-.1,-.28,1.38,.1,i],[.28,.8,-.1,.4,1.38,.1,i],[-.22,1.4,-.22,.22,1.84,.22,15253658],[-.24,1.76,-.24,.24,1.9,.24,4863008],[-.13,1.6,-.24,-.05,1.66,-.22,2105376],[.05,1.6,-.24,.13,1.66,-.22,2105376]];function fS(i){const t=document.createElement("canvas");t.width=256,t.height=64;const e=t.getContext("2d");e.font="bold 34px system-ui, sans-serif",e.textAlign="center",e.textBaseline="middle";const n=Math.min(250,e.measureText(i).width+28);e.fillStyle="rgba(10,14,30,.62)",e.fillRect(128-n/2,6,n,52),e.fillStyle="#fff",e.fillText(i,128,33);const s=new wo(t),r=new cx(new Id({map:s,depthTest:!1,transparent:!0}));return r.scale.set(1.6,.4,1),r.position.y=2.25,r.renderOrder=30,r}class dS{constructor(t){this.group=new Yn,t.add(this.group),this.list=new Map,this.geos=Zf.map(e=>rr(uS(e)))}set(t,e){let n=this.list.get(t);if(!n){const s=new jn({vertexColors:!0}),r=new Yn;r.add(new Te(this.geos[t%Zf.length],s)),n={root:r,mat:s,name:"",tag:null,x:e.x,y:e.y,z:e.z,yaw:e.yaw||0,tx:e.x,ty:e.y,tz:e.z,tyaw:e.yaw||0},this.group.add(r),this.list.set(t,n)}e.name&&e.name!==n.name&&(n.name=e.name,n.tag&&(n.root.remove(n.tag),n.tag.material.map.dispose(),n.tag.material.dispose()),n.tag=fS(e.name),n.root.add(n.tag)),n.tx=e.x,n.ty=e.y,n.tz=e.z,Number.isFinite(e.yaw)&&(n.tyaw=e.yaw)}remove(t){const e=this.list.get(t);e&&(this.group.remove(e.root),e.mat.dispose(),e.tag&&(e.tag.material.map.dispose(),e.tag.material.dispose()),this.list.delete(t))}clear(){for(const t of[...this.list.keys()])this.remove(t)}update(t,e){const n=Math.min(1,t*12);for(const s of this.list.values()){Math.hypot(s.tx-s.x,s.tz-s.z)>20&&(s.x=s.tx,s.y=s.ty,s.z=s.tz),s.x+=(s.tx-s.x)*n,s.y+=(s.ty-s.y)*n,s.z+=(s.tz-s.z)*n;let r=s.tyaw-s.yaw;r=Math.atan2(Math.sin(r),Math.cos(r)),s.yaw+=r*n,s.root.position.set(s.x,s.y,s.z),s.root.rotation.y=s.yaw,s.mat.color.setRGB(e,e,e)}}}class sc{constructor(t){this.view=t,this.list=[],this.byId=new Map,this.enabled=!1}set(t){const e=new Set;for(const n of t){const[s,r,a,o,l,c,h,u,f,p]=n;if(!Number.isInteger(s)||!Ma[r]||![a,o,l,c].every(Number.isFinite))continue;e.add(s);let v=this.byId.get(s);if(!v){const _=Ma[r];v={id:s,type:r,T:_,x:a,y:o,z:l,yaw:c,hurtT:0,moving:!1,hostile:!!_.hostile,npc:!!_.npc,role:f||"",name:p||_.name},this.byId.set(s,v),this.list.push(v),this.view.add(v)}Object.assign(v,{x:a,y:o,z:l,yaw:c,moving:!!u}),h&&(v.hurtT=.2)}for(const n of this.list.slice())e.has(n.id)||this.removeMob(n)}removeMob(t){this.byId.delete(t.id),this.list.splice(this.list.indexOf(t),1),this.view.remove(t)}update(t){for(const e of this.list)e.hurtT=Math.max(0,e.hurtT-t)}raycast(t,e,n,s,r,a,o){let l=null,c=o;for(const h of this.list){const u=h.T.half,f=[h.x-u,h.y,h.z-u],p=[h.x+u,h.y+h.T.h,h.z+u],v=[t,e,n],_=[s,r,a];let m=0,d=c;for(let x=0;x<3&&m<=d;x++){if(Math.abs(_[x])<1e-9){(v[x]<f[x]||v[x]>p[x])&&(m=1/0);continue}let M=(f[x]-v[x])/_[x],y=(p[x]-v[x])/_[x];M>y&&([M,y]=[y,M]),m=Math.max(m,M),d=Math.min(d,y)}m<=d&&m<c&&(c=m,l=h)}return l?{mob:l,t:c}:null}remove(t){this.byId.has(t.id)&&this.removeMob(t)}clear(){for(const t of this.list.slice())this.removeMob(t)}serialize(){}hostileCount(){return 0}}class pS{constructor(t,e){this.game=t,this.ui=e,this.avatars=new dS(t.scene),this.host=null,this.guest=null,this.conns=new Set,this.posT=0,this.useStun=!0}get active(){return!!(this.host||this.guest)}open(){const t=this.game;this.host||(this.host=new rS({world:t.world,now:()=>performance.now(),info:()=>({seed:t.seed,gen:t.gen,mode:t.mode,time:t.time,edits:ep(t.world.edits),pos:{x:t.player.x,y:t.player.y,z:t.player.z},name:this.myName||"Gastgeber"}),onPlant:(e,n,s)=>t.farm.plant(e,n,s,t.age),onHit:(e,n,s)=>this.hostHit(e,n,s),onJoin:e=>{this.ui.toast(`${e.name} ist in deiner Welt`),this.avatars.set(e.id,{...e.pos,name:e.name}),this.listPlayers()},onLeave:e=>{this.ui.toast(`${e.name} hat die Welt verlassen`),this.avatars.remove(e.id),this.listPlayers()}}),t.world.onSet=(e,n,s,r)=>this.host&&this.host.queueBlock(e,n,s,r),t.mp=this,t.running||t.resume())}async invite(){this.open();let t=null;const e=await cS(this.useStun,n=>{t=this.host.addPeer(s=>n.send(s)),t.dc=n,t.pc=e.pc,this.conns.add(e.pc),n.onmessage=s=>this.host.receive(t,s.data),n.onclose=()=>{this.host&&this.host.close(t),this.conns.delete(e.pc)}});return e.pc.onconnectionstatechange=()=>{["failed","closed"].includes(e.pc.connectionState)&&t&&this.host&&this.host.close(t)},e}hostHit(t,e,n){const s=this.game,r=s.mobs&&s.mobs.list.find(a=>a.id===e);return!r||r.npc||Math.hypot(r.x-t.pos.x,r.z-t.pos.z)>8||!r.hit(n,t.pos.x,t.pos.z)?null:(s.spawnBreak(r.x-.5,r.y,r.z-.5,60),s.mobs.remove(r,!1),s.unsaved=!0,s.mode==="creative"?null:xp(r.type))}others(){return this.host?this.host.guests.map(t=>({id:t.id,x:t.pos.x,y:t.pos.y,z:t.pos.z})):null}hurtGuest(t){const e=this.host&&this.host.peers.get(t.target);e&&this.host.hurt(e.id,t.T.dmg,t.T.name,[t.x,t.y+.3,t.z,t.T.range?1:0])}kick(t){const e=this.host&&this.host.peers.get(t);if(e){this.host.kick(e,"Der Gastgeber hat dich aus der Welt genommen.");try{e.pc.close()}catch{}}}listPlayers(){const t=this.host?this.host.guests.map(e=>({id:e.id,name:e.name})):[...this.avatars.list.entries()].map(([e,n])=>({id:e,name:n.name}));this.ui.players(t)}async join(t,e){const n=this.game;this.myName=e,this.guest=new oS({onWelcome:r=>this.welcome(r),onBlocks:r=>{const a=n.world;if(a)for(const[o,l,c,h]of r)a.ensure&&a.ensure(o>>4,c>>4),a.setBlock(o,l,c,h)},onPlayer:(r,a)=>{this.avatars.set(r,a),a.name&&this.listPlayers()},onLeft:r=>{const a=this.avatars.list.get(r);a&&this.ui.toast(`${a.name||"Ein Spieler"} ist gegangen`),this.avatars.remove(r),this.listPlayers()},onMobs:r=>{n.mobs instanceof sc&&n.mobs.set(r)},onHurt:r=>n.remoteHurt(r),onDrops:r=>{for(const[a,o]of r)n.inv[a]=Math.min(Ze,(n.inv[a]||0)+o);this.ui.toast(r.map(([a,o])=>`+${o} ${_e(a)}`).join(" · ")),n.onChange()},onTime:r=>{n.time=r},onReject:r=>this.reject(r),onBye:r=>this.end(r)},r=>this.dc&&this.dc.readyState==="open"&&this.dc.send(r),e);const s=await hS(t,this.useStun,(r,a)=>{this.dc=r,this.conns.add(a),r.onmessage=o=>this.guest&&this.guest.receive(o.data),r.onclose=()=>this.end("Die Verbindung zum Gastgeber ist getrennt."),this.guest.hello(),this.ui.status("Verbunden, Welt wird geladen …")});return s.pc.onconnectionstatechange=()=>{["failed","closed"].includes(s.pc.connectionState)&&this.end("Die Verbindung zum Gastgeber ist getrennt.")},s.code}welcome(t){const e=this.game;e.start({name:`Bei ${t.host}`,seed:t.seed,gen:t.gen,mode:t.mode,time:t.time,edits:t.edits,px:t.pos.x+1.5,py:t.pos.y,pz:t.pos.z,yaw:0,pitch:0}),e.mp=this,e.net=this.guest,e.mobs.clear(),e.mobs=new sc(e.mobView),this.ui.joined(t)}reject(t){const e=this.game;for(const[n,s,r,a,o,l]of t)if(e.world.setBlock(n,s,r,l>=0?l:a),e.mode!=="creative")if(o)e.inv[o]=Math.min(Ze,(e.inv[o]||0)+1);else{const c=sS(a);e.inv[c]=Math.max(0,(e.inv[c]||0)-1)}e.onChange(),this.ui.toast("Der Gastgeber hat eine Änderung nicht übernommen")}tick(t){const e=this.game,n=e.player;if(this.avatars.update(t,e.light),this.host){this.host.tick(t,{x:n.x,y:n.y,z:n.z,yaw:e.yaw},e.time,e.mobs?e.mobs.list:null);for(const s of this.host.guests)this.avatars.set(s.id,s.pos)}this.guest&&this.guest.token&&(this.guest.flush(),(this.posT-=t)<=0&&(this.posT=.1,this.guest.pos({x:n.x,y:n.y,z:n.z,yaw:e.yaw,pitch:e.pitch})),e.mobs instanceof sc&&e.mobs.update(t))}end(t){if(!this.active&&!this.conns.size)return;const e=!!this.guest;if(this.host)for(const s of this.host.guests)this.host.kick(s,"Der Gastgeber hat die Welt geschlossen.");for(const s of this.conns)try{s.close()}catch{}this.conns.clear(),this.host=null,this.guest=null,this.dc=null,this.avatars.clear();const n=this.game;n.world&&(n.world.onSet=null),n.mp=null,n.net=null,t&&this.ui.ended(t,e)}}const tr=[.25,.5,1,2];class mS{constructor(t,e,n){this.game=t,this.$=e,this.toast=n,this.cv=e("wm"),this.ctx=this.cv.getContext("2d"),this.off=document.createElement("canvas"),this.offCtx=this.off.getContext("2d"),this.zi=3,this.cx=0,this.cz=0,this.sel=null,this.drag=null;const s=this.cv;s.addEventListener("pointerdown",a=>{s.setPointerCapture(a.pointerId),this.drag={id:a.pointerId,x:a.clientX,y:a.clientY,moved:0}}),s.addEventListener("pointermove",a=>{const o=this.drag;if(!o||o.id!==a.pointerId)return;const l=this.scale(),c=tr[this.zi];this.cx-=(a.clientX-o.x)*l/c,this.cz-=(a.clientY-o.y)*l/c,o.moved+=Math.abs(a.clientX-o.x)+Math.abs(a.clientY-o.y),o.x=a.clientX,o.y=a.clientY,this.draw()});const r=a=>{const o=this.drag;if(!(!o||o.id!==a.pointerId)&&(this.drag=null,o.moved<8)){const l=this.toWorld(a);this.select(l.x,l.z)}};s.addEventListener("pointerup",r),s.addEventListener("pointercancel",()=>{this.drag=null}),s.addEventListener("wheel",a=>{a.preventDefault(),this.zoom(a.deltaY<0?1:-1)},{passive:!1}),e("mapZin").onclick=()=>this.zoom(1),e("mapZout").onclick=()=>this.zoom(-1),e("mapMe").onclick=()=>{this.cx=t.player.x,this.cz=t.player.z,this.draw()},e("mapMark").onclick=()=>{if(this.sel){if(!t.map.addMark(this.sel.x,this.sel.z)){this.toast(`Höchstens ${sh} Markierungen`);return}t.unsaved=!0,this.list(),this.draw()}},e("mapGo").onclick=()=>{this.sel&&this.setWp(this.sel.x,this.sel.z)},e("mapMarks").addEventListener("click",a=>{const o=a.target.closest("button[data-i]");if(!o)return;const l=t.map.marks[Number(o.dataset.i)];l&&(o.dataset.a==="go"?this.setWp(l.x,l.z):o.dataset.a==="del"?(t.map.removeMark(Number(o.dataset.i)),t.unsaved=!0,this.list()):(this.cx=l.x,this.cz=l.z),this.draw())}),e("mapMarks").addEventListener("change",a=>{const o=a.target;if(o.dataset.i==null)return;const l=t.map.marks[Number(o.dataset.i)];l&&(l.n=o.value.trim().slice(0,24)||l.n,o.value=l.n,t.unsaved=!0,this.draw())})}scale(){return this.cv.width/Math.max(1,this.cv.clientWidth)}toWorld(t){const e=this.cv.getBoundingClientRect(),n=this.scale(),s=tr[this.zi];return{x:this.cx+((t.clientX-e.left)*n-this.cv.width/2)/s,z:this.cz+((t.clientY-e.top)*n-this.cv.height/2)/s}}zoomLevel(){return tr[this.zi]}zoom(t){this.zi=Math.max(0,Math.min(tr.length-1,this.zi+t)),this.draw()}select(t,e){const n=this.game,s=Math.floor(t/16),r=Math.floor(e/16);this.sel={x:Math.round(t),z:Math.round(e)},this.$("mapSel").textContent=`Gewählt: X ${this.sel.x} · Z ${this.sel.z}${n.map.has(s,r)?"":" (noch unentdeckt)"}`,this.$("mapAct").hidden=!1,this.draw()}setWp(t,e){const n=this.game;n.wp={x:Math.round(t),y:Math.round(n.player.y),z:Math.round(e)},n.unsaved=!0,this.toast("Wegpunkt gesetzt 📍")}open(){const t=this.game,e=this.cv,n=Math.min(1.5,window.devicePixelRatio||1);this.cx=t.player.x,this.cz=t.player.z,this.sel=null,this.$("mapSel").textContent="Tippe auf die Karte, um einen Ort zu wählen. Ziehen verschiebt die Karte.",this.$("mapAct").hidden=!0,t.map.markAround(t.player.x,t.player.z,Math.min(t.viewDist,5)),t.map.syncRadios(t.world),requestAnimationFrame(()=>{e.width=Math.max(200,Math.round(e.clientWidth*n)),e.height=Math.max(160,Math.round(e.clientHeight*n)),this.list(),this.draw()})}list(){const t=this.$("mapMarks"),e=this.game;t.textContent="",e.map.marks.forEach((n,s)=>{const r=document.createElement("li"),a=document.createElement("input");a.value=n.n,a.maxLength=24,a.dataset.i=s,a.setAttribute("aria-label","Name der Markierung");const o=(l,c,h)=>{const u=document.createElement("button");return u.dataset.i=s,u.dataset.a=l,u.textContent=c,u.title=h,u.setAttribute("aria-label",h),u};r.append(o("show","★","Auf der Karte zeigen"),a,o("go","📍","Wegpunkt hierher"),o("del","✕","Markierung löschen")),t.append(r)}),this.$("mapMarksH").hidden=!e.map.marks.length}draw(){const t=this.game,e=this.cv,n=this.ctx,s=e.width,r=e.height,a=tr[this.zi],o=t.map;if(!o||!t.world)return;const l=this.cx-s/2/a,c=this.cz-r/2/a,h=Math.floor(l/16),u=Math.floor(c/16),f=Math.ceil(s/a/16)+2,p=Math.ceil(r/a/16)+2;(this.off.width!==f*We||this.off.height!==p*We)&&(this.off.width=f*We,this.off.height=p*We,this.img=this.offCtx.createImageData(f*We,p*We));const v=this.img.data;v.fill(0);for(let y=0;y<p;y++)for(let C=0;C<f;C++){if(!o.has(h+C,u+y))continue;const A=o.tile(t.world,h+C,u+y);for(let R=0;R<We;R++)v.set(A.subarray(R*We*4,(R+1)*We*4),((y*We+R)*f*We+C*We)*4)}this.offCtx.putImageData(this.img,0,0),n.fillStyle="#0b1020",n.fillRect(0,0,s,r),n.imageSmoothingEnabled=!1;const _=y=>(y-l)*a,m=y=>(y-c)*a;n.drawImage(this.off,_(h*16),m(u*16),f*16*a,p*16*a);const d=Math.max(11,Math.round(13*s/Math.max(1,e.clientWidth)));n.font=`${d}px system-ui,sans-serif`,n.textAlign="center",n.textBaseline="middle";const x=(y,C,A,R)=>{const P=_(y),T=m(C);P<-20||T<-20||P>s+20||T>r+20||(n.fillText(A,P,T),R&&(n.lineWidth=3,n.strokeStyle="rgba(0,0,0,.7)",n.strokeText(R,P,T+d),n.fillStyle="#fff",n.fillText(R,P,T+d)))};if(n.fillStyle="#fff",t.world.gen===3){const y=On(l),C=On(l+s/a),A=On(c),R=On(c+r/a);if((C-y+1)*(R-A+1)<=64)for(let P=A;P<=R;P++)for(let T=y;T<=C;T++){const E=Aa(t.seed,T,P);E&&o.has(E.x>>4,E.z>>4)&&x(E.x,E.z,"🏘",a>=.5?"Dorf":"")}}for(const y of o.radios.values())x(y[0],y[2],"📻","");for(const y of o.marks)x(y.x,y.z,"★",y.n);if(t.grave&&x(t.grave.x,t.grave.z,"✝",""),t.wp&&x(t.wp.x,t.wp.z,"📍",t.story&&!t.story.done?"Storyziel":""),this.sel&&(n.strokeStyle="#ff2d95",n.lineWidth=2,n.strokeRect(_(this.sel.x)-7,m(this.sel.z)-7,14,14)),t.mp)for(const[,y]of t.mp.avatars.list)y.x!=null&&x(y.x,y.z,"👤",a>=.5?y.name:"");const M=t.player;n.save(),n.translate(_(M.x),m(M.z)),n.rotate(-t.yaw),n.scale(d/9,d/9),n.fillStyle="#fff",n.strokeStyle="#000",n.lineWidth=1,n.beginPath(),n.moveTo(0,-6),n.lineTo(4.5,5),n.lineTo(0,2.5),n.lineTo(-4.5,5),n.closePath(),n.fill(),n.stroke(),n.restore(),this.$("mapInfo").textContent=`${o.count} Gebiete entdeckt · Zoom ${this.zi+1}/${tr.length} · X ${Math.round(t.player.x)} Z ${Math.round(t.player.z)}`}}const la=[["fwd","Vorwärts","KeyW"],["back","Rückwärts","KeyS"],["left","Links","KeyA"],["right","Rechts","KeyD"],["jump","Springen / Hoch","Space"],["sneak","Schleichen / Runter","ShiftLeft"],["sprint","Rennen","ControlLeft"],["inv","Inventar","KeyE"],["map","Weltkarte","KeyM"],["hook","Seilhaken","KeyQ"],["wp","Wegpunkt","KeyB"],["fly","Fliegen (Kreativ)","KeyF"],["build","Bauform","KeyG"],["quests","Aufträge ein/aus","KeyJ"],["rotate","Deko drehen","KeyR"]],Ip=new Set(["Escape","Tab","MetaLeft","MetaRight",...Array.from({length:9},(i,t)=>"Digit"+(t+1))]),rc=Object.fromEntries(la.map(i=>[i[0],i[2]]));function Np(i){const t={...rc};if(!i||typeof i!="object")return t;for(const[n]of la){const s=i[n];typeof s=="string"&&/^[A-Za-z0-9]{1,24}$/.test(s)&&!Ip.has(s)&&(t[n]=s)}const e=new Map;for(const[n]of la)e.has(t[n])&&(t[n]=rc[n]),e.set(t[n],n);return new Set(Object.values(t)).size===la.length?t:{...rc}}function gS(i,t,e){if(Ip.has(e)||!(t in i))return null;const n={...i},s=Object.keys(n).find(r=>n[r]===e);return s&&s!==t&&(n[s]=n[t]),n[t]=e,n}function vS(i,t){for(const e in i)if(i[e]===t)return e;return null}function _S(i){return/^Key[A-Z]$/.test(i)?i[3]:/^Digit\d$/.test(i)?i[5]:{Space:"Leertaste",ShiftLeft:"Umschalt links",ShiftRight:"Umschalt rechts",ControlLeft:"Strg links",ControlRight:"Strg rechts",AltLeft:"Alt",AltRight:"Alt Gr",ArrowUp:"↑",ArrowDown:"↓",ArrowLeft:"←",ArrowRight:"→",Enter:"Eingabe",Backspace:"⌫",CapsLock:"Feststell"}[i]||i}const ae={S:0,E:1,W:2,N:3,LB:4,RB:5,LT:6,RT:7,SEL:8,START:9,L3:10,R3:11,UP:12,DOWN:13,LEFT:14,RIGHT:15},Dh=16;function Op(i=""){const t=String(i).toLowerCase();return/054c|playstation|dualsense|dualshock|ps[345]\b|ps[345] controller/.test(t)?"ps":/057e|nintendo|switch|pro controller|joy-?con/.test(t)?"switch":/045e|xbox|xinput|x-box/.test(t)?"xbox":"generic"}const Vo={xbox:["A","B","X","Y","LB","RB","LT","RT","Ansicht","Menü","LS","RS","✚↑","✚↓","✚←","✚→","Xbox"],ps:["✕","○","□","△","L1","R1","L2","R2","Create","Options","L3","R3","✚↑","✚↓","✚←","✚→","PS"],switch:["B","A","Y","X","L","R","ZL","ZR","−","+","LS","RS","✚↑","✚↓","✚←","✚→","Home"]};Vo.generic=Vo.xbox;const kp={xbox:"Xbox-Controller",ps:"PlayStation-Controller",switch:"Switch-Controller",generic:"Controller"},ah=(i,t)=>(Vo[i]||Vo.xbox)[t]??"Taste "+t,Up=i=>i==="switch"?ae.E:ae.S,zp=i=>i==="switch"?ae.S:ae.E,ca=[["jump","Springen / Hoch",ae.S],["sneak","Schleichen / Runter",ae.E],["hook","Seilhaken",ae.W],["inv","Inventar",ae.N],["prev","Hotbar links",ae.LB],["next","Hotbar rechts",ae.RB],["place","Setzen / Benutzen",ae.LT],["break","Abbauen / Angreifen",ae.RT],["map","Weltkarte",ae.SEL],["pause","Pause",ae.START],["sprint","Rennen",ae.L3],["undo","Rückgängig (Kreativ)",ae.R3],["fly","Fliegen (Kreativ)",ae.UP],["wp","Wegpunkt",ae.DOWN],["build","Bauform",ae.LEFT],["quests","Aufträge ein/aus",ae.RIGHT]],Po=Object.fromEntries(ca.map(i=>[i[0],i[2]]));function Ph(i){const t={...Po};if(!i||typeof i!="object")return t;for(const[n]of ca){const s=i[n];Number.isInteger(s)&&s>=0&&s<Dh&&(t[n]=s)}const e=new Set;for(const[n]of ca)e.has(t[n])&&(t[n]=Po[n]),e.add(t[n]);return new Set(Object.values(t)).size===ca.length?t:{...Po}}function xS(i,t,e){if(!(t in i)||!Number.isInteger(e)||e<0||e>=Dh)return null;const n={...i},s=Object.keys(n).find(r=>n[r]===e);return s&&s!==t&&(n[s]=n[t]),n[t]=e,n}const MS=(i,t=.18)=>Math.abs(i)<t?0:(i-Math.sign(i)*t)/(1-t);function yS(i,t,e=Po,n=.18){const s=c=>MS(i.axes[c]||0,n),r=c=>{const h=i.buttons[c];return!!h&&(h.pressed||h.value>.5)},a=i.buttons.map((c,h)=>r(h)),o={},l={};for(const c in e){const h=e[c];o[c]=!!a[h],l[c]=!!a[h]&&!t[h]}return{r:s(0),f:-s(1),lx:s(2),ly:s(3),held:o,hit:l,buttons:a}}function SS(i,t,e){const n=i[t];if(!n)return i.length?0:-1;const s=n.x+n.w/2,r=n.y+n.h/2,a=e==="up"||e==="down",o=e==="down"||e==="right"?1:-1;let l=-1,c=1/0;return i.forEach((h,u)=>{if(u===t)return;const f=h.x+h.w/2,p=h.y+h.h/2,v=a?o>0?h.y-(n.y+n.h):n.y-(h.y+h.h):o>0?h.x-(n.x+n.w):n.x-(h.x+h.w);if((a?(p-r)*o:(f-s)*o)<=1||v<-Math.min(n.h,n.w)/2)return;const m=a?Math.max(0,Math.max(h.x,n.x)-Math.min(h.x+h.w,n.x+n.w)):Math.max(0,Math.max(h.y,n.y)-Math.min(h.y+h.h,n.y+n.h)),d=Math.max(0,v)+m*2.5;d<c&&(c=d,l=u)}),l}const ES={break:[.2,.45,55],place:[0,.22,30],hurt:[.85,.6,200],deny:[.05,.18,40],done:[.35,.7,260],hook:[.15,.35,70]};function sl(i,t,e=1){const n=ES[t];if(!i||!n||!(e>0))return!1;const s=Math.min(1,e),[r,a,o]=n;try{const l=i.vibrationActuator;if(l&&l.playEffect){const h=l.playEffect("dual-rumble",{startDelay:0,duration:o,strongMagnitude:r*s,weakMagnitude:a*s});return h&&h.catch&&h.catch(()=>{}),!0}const c=i.hapticActuators&&i.hapticActuators[0];if(c&&c.pulse){const h=c.pulse(Math.max(r,a)*s,o);return h&&h.catch&&h.catch(()=>{}),!0}}catch{}return!1}const bS="1.13.0",D=i=>document.getElementById(i),Da=D("c"),Ih=window.matchMedia("(pointer: coarse)").matches;let ht=xM();const L=new Zy(Da,Ih,ht.quality);window.__bv=L;let Mt="menu",bs="menu",_r=-1,vn=Ih;const An=new Set;let Kn=Np(ht.keys);document.documentElement.style.setProperty("--atlas",`url(${L.atlasCanvas.toDataURL()})`);const oh=L.itemCanvas.height/32;document.documentElement.style.setProperty("--items",`url(${L.itemCanvas.toDataURL()})`);document.documentElement.style.setProperty("--itemRows",oh*100+"%");const Wo=i=>{if(Wi(i)){const e=Re[i]?Re[i].icon:0;return`<i class="ic it" style="background-position:${e%8*100/7}% ${oh>1?Math.floor(e/8)*100/(oh-1):0}%"></i>`}if(Qo(i)){const e=i-wi;return`<i class="ic lg" style="background-position:${e%4*100/3}% ${Math.floor(e/4)*100/3}%"></i>`}if(i===g.RAINBOW)return'<i class="ic rb"></i>';if(Ht[i]&&Ht[i].emoji)return`<i class="ic em">${Ht[i].emoji}</i>`;const t=Ht[i]?Ht[i].icon:0;return`<i class="ic" style="background-position:${t%8*100/7}% ${Math.floor(t/8)*100/15}%"></i>`};L.onLogos=()=>{document.documentElement.style.setProperty("--logos",`url(${L.logoCanvas.toDataURL("image/png")})`)};let Jf=0;function te(i){const t=D("toast");t.textContent=i,t.classList.add("on"),clearTimeout(Jf),Jf=setTimeout(()=>t.classList.remove("on"),1800)}L.onToast=te;function as(){const i=D("hotbar");if(!i.children.length)for(let t=0;t<9;t++){const e=document.createElement("div");e.className="slot",e.addEventListener("pointerdown",n=>{n.stopPropagation(),L.selectSlot(t)}),e.addEventListener("dragstart",n=>{if(Mt!=="inventory"||!L.hotbar[t]){n.preventDefault();return}n.dataTransfer.setData("text/plain","h"+t)}),e.addEventListener("dragover",n=>{Mt==="inventory"&&(n.preventDefault(),e.classList.add("drop"))}),e.addEventListener("dragleave",()=>e.classList.remove("drop")),e.addEventListener("drop",n=>{n.preventDefault(),e.classList.remove("drop"),Gp(t,n.dataTransfer.getData("text/plain"))}),i.appendChild(e)}for(let t=0;t<9;t++){const e=i.children[t],n=L.hotbar[t],s=L.mode==="creative"?"∞":L.inv[n]||0;e.className="slot"+(t===L.sel?" sel":"")+(n&&s===0?" empty":""),e.title=n?_e(n):"",e.draggable=Mt==="inventory"&&!!n;const r=$i(n),a=r&&L.dur[n]?1-L.dur[n]/r.dur:0;e.innerHTML=`<span class="k">${t+1}</span>${n?Wo(n):""}<span class="n">${n?s:""}</span>${a?`<span class="dur"><i style="width:${Math.round(a*100)}%;background:hsl(${Math.round(a*120)},80%,50%)"></i></span>`:""}`}}let _i="all",Fp="",Bp=!1,Sa=new Set,Qi=null;const TS=[{id:"all",name:"Alle"},...xx,{id:"items",name:"Werkzeuge & Essen"}],AS=i=>i.tool?` · ${i.tool.speed}× schneller · hält ${i.tool.dur} Blöcke`:i.food?` · +${i.food} Hunger`:"";function Hp(){D("invTabs").innerHTML=TS.map(i=>`<button role="tab" data-cat="${i.id}" class="${i.id===_i?"on":""}" aria-selected="${i.id===_i}">${i.name}</button>`).join("")}function Gp(i,t){if(t){if(t[0]==="h"){const e=Number(t.slice(1));e>=0&&e<9&&e!==i&&([L.hotbar[i],L.hotbar[e]]=[L.hotbar[e],L.hotbar[i]])}else{const e=Number(t);if(!Number.isInteger(e)||!(Ht[e]||Re[e]))return;const n=L.hotbar.indexOf(e);n>=0&&(L.hotbar[n]=L.hotbar[i]),L.hotbar[i]=e}L.selectSlot(i),L.unsaved=!0,L.onChange()}}let lh="std";function Ar(){const i=L.mode==="creative",t=Fp.trim().toLowerCase();D("invHint").textContent=i?"Kreativmodus: alle Blöcke sind unbegrenzt. Tippe einen Block, um ihn in den gewählten Hotbar-Platz zu legen.":"Tippe einen Block, um ihn in den gewählten Hotbar-Platz zu legen. Zahl = Vorrat.",D("invOwnedL").hidden=i,D("invSt").hidden=i||!Qi,Qi&&(D("invSt").textContent=Qi==="ofen"?"🔥 Am Schmelzofen: Barren schmelzen und Essen braten":"🪚 An der Werkbank: Werkzeuge und Schmelzofen bauen");let e="";const n=[...Sx,...Bo];lh==="name"?n.sort((r,a)=>_e(r).localeCompare(_e(a),"de")):lh==="count"&&!i&&n.sort((r,a)=>(L.inv[a]||0)-(L.inv[r]||0));for(const r of n){const a=Ht[r]&&!Wi(r)?Ht[r]:Re[r],o=i?"∞":L.inv[r]||0;if(_i!=="all"&&a.cat!==_i||t&&!a.name.toLowerCase().includes(t)||Bp&&!i&&!o)continue;const l=Wi(r)?AS(a):a.tool?" · am besten mit "+a.tool[0].toUpperCase()+a.tool.slice(1):"";e+=`<button class="cell ${o?"has":"dim"}" data-t="${r}" draggable="true" title="${a.name}${l}${vn?"":" · Umschalt-Klick: in freien Platz · auf die Hotbar ziehen"}">${Wo(r)}<span>${a.name}</span><b>${o}</b></button>`}if(D("invGrid").innerHTML=e||'<div class="empty-note">Nichts gefunden.</div>',D("recH").hidden=i,i){D("recipes").innerHTML="";return}const s=hn.map((r,a)=>[r,a]).filter(([r])=>(_i==="all"||r.cat===_i)&&LM(r,t));D("recipes").innerHTML=s.length?s.map(([r,a])=>{const o=Lh(L.inv,r,Ze,Sa),l=CM(L.inv,r,Ze,Sa),c=r.need.map(([f,p])=>{const v=L.inv[f]||0;return v>=p?`${p}× ${_e(f)}`:`<i>${p}× ${_e(f)} (${v})</i>`}).join(" + "),h=o.full?" · Vorrat voll":o.noStation?` · <i>${Mf[r.st]} nicht in der Nähe</i>`:"",u=r.st?`<span class="badge">${r.st==="ofen"?"🔥":"🪚"} ${Mf[r.st]}</span>`:"";return`<button data-r="${a}" ${o.ok?"":"disabled"}>${Wo(r.give[0])}<span><b>${r.give[1]}× ${_e(r.give[0])}</b>${u}<small>aus ${c}${h}</small></span><span class="cnt">${l?l+"×":""}</span></button>`}).join(""):'<div class="empty-note">Kein passendes Rezept.</div>'}D("invTabs").addEventListener("click",i=>{const t=i.target.closest("[data-cat]");t&&(_i=t.dataset.cat,Hp(),Ar())});D("invSearch").addEventListener("input",i=>{Fp=i.target.value,Ar()});D("invOwned").addEventListener("change",i=>{Bp=i.target.checked,Ar()});D("invGrid").addEventListener("click",i=>{const t=i.target.closest("[data-t]");if(!t)return;const e=Number(t.dataset.t);if(i.shiftKey){if(L.hotbar.includes(e)){te("Liegt schon in der Hotbar");return}const n=L.hotbar.indexOf(0);if(n<0){te("Kein freier Hotbar-Platz");return}L.hotbar[n]=e,L.unsaved=!0,L.onChange(),te(`${_e(e)} → Platz ${n+1}`);return}Gp(L.sel,String(e))});D("invGrid").addEventListener("dragstart",i=>{const t=i.target.closest("[data-t]");t&&i.dataTransfer.setData("text/plain",t.dataset.t)});D("invGrid").addEventListener("dragover",i=>i.preventDefault());D("invGrid").addEventListener("drop",i=>{i.preventDefault();const t=i.dataTransfer.getData("text/plain");t[0]==="h"&&(L.hotbar[Number(t.slice(1))]=0,L.unsaved=!0,L.onChange())});D("invSort").addEventListener("change",i=>{lh=i.target.value,Ar()});D("recipes").addEventListener("click",i=>{const t=i.target.closest("[data-r]");if(!t)return;const e=hn[Number(t.dataset.r)];let n=0,s=null;for(let r=i.shiftKey?5:1;r>0&&(s=fp(L.inv,e,Ze,Sa),!!s.ok);r--)n++;if(!n){te(s.msg);return}L.unsaved=!0,L.onChange(),L.questEvent("craft",e.give[0],e.give[1]*n),te(`+${e.give[1]*n} ${_e(e.give[0])}`)});L.onChange=()=>{as(),Mt==="inventory"&&Ar()};const ch=D("vit").getContext("2d"),wS=[".##.##.","#######","#######",".#####.","..###..","...#..."],RS=["....##.","...####","..#####",".####..","##.....","#......"],CS=["..###..",".#...#.","#.....#","#.....#",".#...#.","..###.."],LS=["#######","#######","#######",".#####.","..###..","...#..."];function xo(i,t,e,n,s,r){for(let a=0;a<6;a++)for(let o=0;o<7;o++)i[a][o]==="#"&&(ch.fillStyle=o<3.5?n||s?n||s:r:n||r,ch.fillRect(t+o*2,e+a*2,2,2))}function xr(){const i=L.vitals,t=D("vit");if(t.hidden=!i||Mt==="menu",!i)return;ch.clearRect(0,0,200,34);const e=Math.ceil(i.hp),n=Math.ceil(i.food);for(let r=0;r<er/2;r++){const a=e-r*2;xo(wS,r*10,18,a>=2?"#ff3b4a":null,a===1?"#ff3b4a":null,"#3a1a20")}for(let r=0;r<sa/2;r++){const a=n-r*2;xo(RS,186-r*10,18,a>=2?"#d89048":null,a===1?"#d89048":null,"#3a2a1a")}if(i.air<Do)for(let r=0;r<Math.ceil(i.air);r++)xo(CS,186-r*10,2,"#9ad8ff",null,"#9ad8ff");const s=L.armorPoints();for(let r=0;r<s;r++)xo(LS,r*10,2,"#cfd6e2",null,"#cfd6e2")}L.onVitals=xr;let Qf=0;L.onHurt=()=>{const i=D("hurt");if(i.classList.add("on"),xr(),clearTimeout(Qf),Qf=setTimeout(()=>i.classList.remove("on"),120),navigator.vibrate&&vn)try{navigator.vibrate(60)}catch{}};L.onMine=i=>{D("mine").classList.toggle("on",i>0),D("mine").firstChild.style.width=Math.round(i*100)+"%"};const DS={Sturz:"Zu tief gefallen.",Ertrunken:"Unter Wasser ging die Luft aus.",Magma:"Magma ist heiß.",Hunger:"Vor Hunger.",Rauschling:"Ein Rauschling hat dich erwischt.",Höhlenwesen:"Ein Höhlenwesen hat dich erwischt.","Störsender-Drohne":"Die Störimpulse einer Drohne waren zu viel."};L.onDeath=(i,t)=>{wr(),Ce("dead"),D("deadWhy").textContent=(DS[i]||"")+(t?" Dein Vorrat liegt am Unglücksort, der Wegpunkt 📍 zeigt den Weg.":" Dein Vorrat bleibt erhalten. Der Wegpunkt 📍 markiert den Unglücksort."),zn()&&document.exitPointerLock(),Ds(!1)};D("dRevive").onclick=()=>{L.revive(),as(),Ce("playing"),os()};D("dMenu").onclick=()=>{L.revive(),D("pMenu").onclick()};L.onStation=i=>{Qi=i,_i="all",ol()};let Es=null;function Vp(){const i=bp[Es.role]||[];D("trName").firstChild.textContent=Es.name+" ",D("trSay").textContent="„"+(Jy[Es.role]||"Hallo!")+"“",D("trList").innerHTML=i.map((t,e)=>{const n=Lh(L.inv,t),s=t.need.map(([r,a])=>{const o=L.inv[r]||0;return o>=a?`${a}× ${_e(r)}`:`<i>${a}× ${_e(r)} (${o})</i>`}).join(" + ");return`<button data-tr="${e}" ${n.ok?"":"disabled"}>${Wo(t.give[0])}<span><b>${t.give[1]}× ${_e(t.give[0])}</b><small>für ${s}</small></span></button>`}).join("")}L.onTrade=i=>{if(Mt==="playing"){if(L.mode==="creative"){te(`${i.name}: „Im Kreativmodus hast du doch schon alles!“`);return}Es=i,wr(),Ce("trade"),Vp(),zn()&&document.exitPointerLock(),rl()}};D("trList").addEventListener("click",i=>{const t=i.target.closest("[data-tr]");if(!t||!Es)return;const e=bp[Es.role][Number(t.dataset.tr)],n=fp(L.inv,e);te(n.ok?`Getauscht: ${n.msg}`:n.msg),n.ok&&(L.unsaved=!0,Vp(),as(),L.questEvent("trade",e.give[0]))});function Nh(){Mt==="trade"&&(Es=null,Ce("playing"),L.resume(),os(),ns()&&setTimeout(()=>{Mt==="playing"&&!zn()&&ns()&&Pi()},250))}D("trClose").onclick=Nh;L.onBuildMode=i=>{const t=D("bmode");t.hidden=i.key==="einzeln",t.textContent=`▦ ${i.name}`+(i.clicks===2?" · zwei Ecken setzen":i.key==="einfuegen"?" · Setzen fügt ein":"")+" (G wechselt)",te("Bauform: "+i.name)};D("bBuild").onclick=()=>L.cycleBuild(1);D("bRot").onclick=()=>L.rotateDeco(1);L.onDecoTarget=i=>{D("bRot").hidden=!i};let Ts=!1,td=0;function Li(){const i=D("quest"),t=L.story;if(!t||L.menuMode){i.hidden=!0;return}if(i.hidden=!1,i.classList.toggle("min",Ts),t.done){i.innerHTML='<b>🎉 Story abgeschlossen</b><small class="txt">Alle Aufträge erledigt. Baue frei weiter!</small>';return}const e=hr(t),n=e[t.i],[s,r]=Ep(L,n),a=Math.min(100,Math.round(s/r*100)),o=n.c?`Kapitel ${n.c} · ${n.t}`:`Auftrag ${t.i+1}/${e.length} · ${n.t}`;i.innerHTML=`<b>${o}</b><div class="bar"><i style="width:${a}%"></i></div><small>${Math.min(s,r)} / ${r}${n.c?` · Auftrag ${t.i+1}/${e.length}`:""}</small><small class="txt">${n.d}</small>`}function ha(i){const t=D("banner");t.innerHTML=i,t.classList.add("on"),clearTimeout(td),td=setTimeout(()=>t.classList.remove("on"),4200)}L.onQuest=Li;L.onQuestDone=(i,t)=>{const e=Object.entries(i.r||{}).map(([s,r])=>`+${r} ${_e(Number(s))}`).join(" · "),n=!t&&hr(L.story)[L.story.i];t?ha(i.c?"🎉 Das Rauschen ist verstummt!<small>Das Funknetz steht wieder. Die Welt gehört dir, baue frei weiter.</small>":`🎉 Story abgeschlossen!<small>${i.t} geschafft. Die Funkzentrale sendet wieder. Baue frei weiter.</small>`):n&&n.c&&n.c!==i.c?ha(`📻 Kapitel ${n.c}: ${ya[n.c].t}<small>${ya[n.c].d}</small>`):ha(`✔ Auftrag erledigt: ${i.t}<small>${e}</small>`)};function PS(){const i=L.story;i&&(D("qlist").innerHTML=hr(i).map((t,e,n)=>{const s=i.done||e<i.i,r=!i.done&&e===i.i;return`${t.c&&(e===0||n[e-1].c!==t.c)?`<h3 class="qch">Kapitel ${t.c} · ${ya[t.c].t}</h3>`:""}<div class="qi ${s?"done":r?"cur":""}"><span class="st">${s?"✔":r?"➜":e+1}</span><div><b>${t.t}</b>${s||r?`<small>${t.d}</small>`:""}</div></div>`}).join(""),D("qlogT").textContent=i.c==="rauschen"?"Das große Rauschen":"Aufträge der Funkzentrale")}D("quest").addEventListener("click",()=>{Ts=!Ts,Li()});D("pQuests").onclick=()=>{PS(),sn("qlog",!0)};D("qlogClose").onclick=()=>sn("qlog",!1);const sn=(i,t)=>{D(i).hidden=!t};function Ce(i){Mt=i,document.body.dataset.st=i,document.body.classList.toggle("playing",i==="playing"),sn("map",i==="map"),sn("menu",i==="menu"),sn("pause",i==="paused"),sn("inv",i==="inventory"),sn("loading",i==="loading"),sn("set",i==="settings"),sn("dead",i==="dead"),sn("trade",i==="trade"),sn("mp",i==="mp"),sn("hud",i==="playing"||i==="paused"||i==="inventory"||i==="dead"||i==="trade"||(i==="settings"||i==="mp")&&bs==="paused"),i!=="playing"&&L.onMine(0),i!=="paused"&&sn("qlog",!1),i==="menu"&&Oh(null)}const zn=()=>document.pointerLockElement===Da,ns=()=>!vn&&!vt.raf;function os(){if(!(vn||zn()))try{const i=Da.requestPointerLock();i&&i.catch&&i.catch(()=>{})}catch{}}function wr(){L.breakHeld=L.placeHeld=!1,An.clear(),As(),Object.assign(L.input,{f:0,r:0,jump:!1,down:!1,sprint:!1})}function rl(){L.mp||L.stop()}function Pi(){Mt==="playing"&&(rl(),wr(),Ds(),D("pMp").hidden=!!L.story||!!(L.mp&&L.mp.guest),Ce("paused"),D("vd").value=L.viewDist,D("vdVal").textContent=L.viewDist,D("pQuests").hidden=!L.story,D("td").value=Math.round(L.time*100),D("tdVal").textContent=L.clockText(),zn()&&document.exitPointerLock())}function al(){Ce("playing"),L.resume(),os()}function ol(){Mt==="playing"&&(Sa=L.stationsNear(),Qi&&!Sa.has(Qi)&&(Qi=null),wr(),Ce("inventory"),Hp(),Ar(),as(),zn()&&document.exitPointerLock(),rl())}function Ea(){Mt==="inventory"&&(Qi=null,Ce("playing"),as(),L.resume(),os(),ns()&&setTimeout(()=>{Mt==="playing"&&!zn()&&ns()&&Pi()},250))}document.addEventListener("pointerlockchange",()=>{!zn()&&Mt==="playing"&&ns()&&Pi()});document.addEventListener("pointerlockerror",()=>{if(!(Mt!=="playing"||!ns())){if(performance.now()-Xp<2e3){te("Ins Bild klicken, um loszulegen");return}Pi()}});function Ds(i){if(!L.world||_r<0||L.menuMode)return;const t=ap(_r,L.serialize());return t&&(L.unsaved=!1),(i||!t)&&te(t?"Gespeichert ✔":"Speichern fehlgeschlagen (Speicher voll?)"),t}setInterval(()=>{Mt==="playing"&&Ds(!1)},3e4);window.addEventListener("pagehide",()=>Ds(!1));document.addEventListener("visibilitychange",()=>{document.hidden&&Mt==="playing"&&Pi()});function IS(i){if(i=(i||"").trim(),!i)return Math.floor(Math.random()*2147483647);if(/^-?\d{1,9}$/.test(i))return Number(i);let t=2166136261;for(let e=0;e<i.length;e++)t=Math.imul(t^i.charCodeAt(e),16777619);return t|0}const ed=i=>String(i).replace(/[&<>"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[t]);function Si(){let i="";for(let t=0;t<tl;t++){const e=np(t);if(e){const n=new Date(e.savedAt).toLocaleString("de-DE",{dateStyle:"short",timeStyle:"short"}),s=e.mode==="creative",r=e.mode==="story",a=e.qc==="rauschen"?Sp:yp,o=e.q??0,l=r?`<span class="pill st">📜 Story · ${e.q===-1?"abgeschlossen":(a[o]&&a[o].c?"Kapitel "+a[o].c+" · ":"")+"Auftrag "+(o+1)+"/"+a.length}</span>`:`<span class="pill ${s?"cr":""}">${s?"Kreativ":"Überleben"}</span>`;i+=`<div class="card"><div class="top"><div class="ico">${r?"📜":s?"🕊":"⛏"}</div><div class="ttl"><b>${ed(e.name)}</b>${l}</div></div>
        <small>${r?"Feste Story-Welt":"Startwert "+ed(e.seed)}${(e.gen||1)<qd?" · klassische Welt":""} · zuletzt ${n}</small>
        <div class="row"><button class="go" data-act="load" data-i="${t}">▶ Weiterspielen</button><button data-act="exp" data-i="${t}" aria-label="Welt exportieren" title="Welt als Datei sichern">⤓</button>${mM(t)?`<button data-act="bak" data-i="${t}" aria-label="Sicherung laden" title="Ältere Sicherung wiederherstellen">↺</button>`:""}<button data-act="del" data-i="${t}" aria-label="Welt löschen" title="Welt löschen">🗑</button></div></div>`}else i+=`<div class="card new"><div class="top"><div class="ico">✨</div><div class="ttl"><b>Neue Welt ${t+1}</b><span class="pill">frei</span></div></div>
        <div class="seed"><input id="seed${t}" placeholder="Startwert (leer = Zufall)" maxlength="24" autocomplete="off"><button data-act="dice" data-i="${t}" aria-label="Zufälliger Startwert" title="Zufälliger Startwert">🎲</button></div>
        <div class="seg three" id="mode${t}"><button class="on" data-mode="survival">⛏ Überleben<small>Rohstoffe, Hunger</small></button><button data-mode="creative">🕊 Kreativ<small>alles, fliegen</small></button><button data-mode="story">📜 Story<small>6 Kapitel</small></button></div>
        <button class="go" data-act="new" data-i="${t}">Welt erzeugen</button></div>`}D("slots").innerHTML=i,NS()}let En=null,hh=-1;const Xo={worlds:"pgWorlds",help:"pgHelp",data:"pgData"};function NS(){let i=null;for(let t=0;t<tl;t++){const e=np(t);e&&(!i||e.savedAt>i.m.savedAt)&&(i={i:t,m:e})}if(hh=i?i.i:-1,D("mContinue").hidden=!i,i){const t=i.m,e=t.mode==="story"?"Story":t.mode==="creative"?"Kreativ":"Überleben";D("mContinueSub").textContent=`${t.name} · ${e} · ${new Date(t.savedAt).toLocaleString("de-DE",{dateStyle:"short",timeStyle:"short"})}`}}function Oh(i){En=i||null;for(const[n,s]of Object.entries(Xo))sn(s,n===En);D("menu").classList.toggle("paged",!!En);for(const n of document.querySelectorAll("#mmNav [data-page]"))n.classList.toggle("cur",n.dataset.page===En);const t=D(En?Xo[En]:"mmNav"),e=En&&t.querySelector(".go");e&&!vn?e.focus():OS(t)}const ll=i=>[...i.querySelectorAll("button,input,select,a[href],summary")].filter(t=>!t.disabled&&t.offsetParent!==null);function OS(i,t=0){if(vn)return;const e=ll(i);e.length&&e[Math.min(t,e.length-1)].focus({preventScroll:!1})}function ac(i){const t=D(En?Xo[En]:"mmNav"),e=ll(t);if(!e.length)return;const n=e.indexOf(document.activeElement);e[n<0?0:(n+i+e.length)%e.length].focus()}function kh(){if(En){const i=En;Oh(null);const t=document.querySelector(`#mmNav [data-page=${i}]`);t&&!vn&&t.focus()}}D("mmNav").addEventListener("click",i=>{const t=i.target.closest("[data-page]");t&&Oh(t.dataset.page)});for(const i of document.querySelectorAll(".pg-back"))i.onclick=kh;D("mContinue").onclick=()=>{hh>=0&&Wp(hh)};D("mmVer").textContent=bS;function ba(i){const t=i==="pad"?[[ah(vt.style,Up(vt.style)),"Auswählen",1],[ah(vt.style,zp(vt.style)),"Zurück",1],["✚","Bewegen",1]]:[["↑↓","Auswählen"],["Enter","Bestätigen"],["Esc","Zurück"]];D("mmHints").innerHTML=t.map(([e,n,s])=>`<span><kbd class="${s?"pad":""}">${e}</kbd>${n}</span>`).join("")}ba("keys");D("slots").addEventListener("click",i=>{const t=i.target.closest(".seg [data-mode]");if(t){for(const o of t.parentNode.children)o.classList.toggle("on",o===t);const s=t.closest(".card"),r=t.dataset.mode==="story",a=s.querySelector("input");a.disabled=r,a.placeholder=r?"feste Story-Welt":"Startwert (leer = Zufall)",s.querySelector("[data-act=dice]").disabled=r;return}const e=i.target.closest("[data-act]");if(!e)return;const n=Number(e.dataset.i);if(e.dataset.act==="dice")D("seed"+n).value=String(Math.floor(Math.random()*9e5)+1e5);else if(e.dataset.act==="del")confirm("Diese Welt wirklich löschen?")&&(gM(n),Si());else if(e.dataset.act==="load")Wp(n);else if(e.dataset.act==="exp"){const s=ip(n);if(!s){te("Speicherstand nicht lesbar");return}kS(`klotzfunk-${s.name.replace(/[^\w-]+/g,"_")}.json`,vM(s))}else if(e.dataset.act==="bak"){const s=sp(n);if(!s){te("Keine lesbare Sicherung"),Si();return}const r=new Date(s.savedAt).toLocaleString("de-DE",{dateStyle:"short",timeStyle:"short"});confirm(`Sicherung vom ${r} wiederherstellen? Der aktuelle Stand wird dafür zur Sicherung.`)&&(te(op(n)?"Sicherung wiederhergestellt":"Wiederherstellen fehlgeschlagen"),Si())}else{const s=D("mode"+n).querySelector(".on").dataset.mode;$p(n,{name:s==="story"?"Story "+(n+1):"Welt "+(n+1),seed:s==="story"?777:IS(D("seed"+n).value),mode:s,gen:qd})}});function Wp(i){let t=ip(i);if(!t){const e=sp(i);if(e&&confirm("Dieser Speicherstand ist beschädigt. Die letzte Sicherung laden?"))op(i),t=e;else{te("Speicherstand nicht lesbar"),Si();return}}$p(i,t)}function kS(i,t){try{const e=URL.createObjectURL(new Blob([t],{type:"application/json"})),n=document.createElement("a");n.href=e,n.download=i,document.body.appendChild(n),n.click(),n.remove(),setTimeout(()=>URL.revokeObjectURL(e),2e3)}catch{te("Export nicht möglich")}}D("mImport").onclick=()=>{if(lp()<0){te("Kein freier Platz – lösche zuerst eine Welt");return}D("importFile").value="",D("importFile").click()};D("importFile").addEventListener("change",i=>{const t=i.target.files&&i.target.files[0];if(t){if(t.size>8*1024*1024){te("Datei zu groß");return}t.text().then(e=>{const n=_M(e),s=lp();if(!n){te("Keine gültige KLOTZFUNK-Welt");return}if(s<0){te("Kein freier Platz");return}te(ap(s,n)?`„${n.name}“ importiert (Platz ${s+1})`:"Import fehlgeschlagen (Speicher voll?)"),Si()}).catch(()=>te("Datei nicht lesbar"))}});const oc=["Halte die Sprungtaste im Fall gedrückt, um zu gleiten.","Q oder „Haken“ zieht dich mit dem Seilhaken bis zu 40 Blöcke weit.","Mit M oder 🗺 öffnest du die Weltkarte. Dort kannst du eigene Markierungen setzen.","Erze brauchen eine Spitzhacke. Für Eisen und Funkkristall muss sie mindestens aus Stein sein.","Nachts kommen Rauschlinge. Sie verfolgen dich nur, wenn sie dich sehen.","Setzen auf einen Dorfbewohner öffnet den Handel.","Ein Schalter speist den Funksender daneben. Relais tragen das Signal weiter.","Ein Boot fährt auf Wasser, eine Lore folgt Schienen über Kurven und Stufen.","G wechselt die Bauform: Linie, Fläche, Wand oder Säule.","Weizen wächst auf Ackerboden. Aus 3 Weizen wird Brot.","Pause → 👥 Mehrspieler lädt bis zu 4 Freunde in deine Welt ein.","In den Einstellungen kannst du alle Tasten neu belegen und die Touch-Tasten verschieben."];let $o=0,Xp=0;function US(i){const t={story:"📜 Story",creative:"🕊 Kreativ"}[i.mode]||"⛏ Überleben";D("ldName").textContent=i.name||"Welt",D("ldMode").textContent=t;let e=Math.floor(Math.random()*oc.length);const n=()=>{D("ldTip").textContent=oc[e++%oc.length]};n(),clearInterval($o),$o=setInterval(n,4e3),qo(.04,i.px===void 0?"Welt wird erzeugt …":"Spielstand wird geladen …")}function qo(i,t){D("ldFill").style.width=Math.round(i*100)+"%",D("ldBar").setAttribute("aria-valuenow",Math.round(i*100)),t&&(D("ldStep").textContent=t)}function zS(i){const t=performance.now(),e=Math.min(L.viewDist,3)+.5;L.resume();const n=()=>{if(Mt!=="loading")return;const s=L.areaReady(e);if(qo(.3+s*.7,`Umgebung wird gebaut … ${Math.round(s*100)} %`),s>=1||performance.now()-t>1e4){qo(1,"Los geht’s!"),setTimeout(i,180);return}setTimeout(n,100)};n()}function $p(i,t){Ji(),_r=i,US(t),Ce("loading"),requestAnimationFrame(()=>setTimeout(()=>{try{L.start(t),qo(.3,"Umgebung wird gebaut …"),t.mode==="creative"&&(L.player.flying=!1),D("bFly").hidden=!(vn&&L.mode==="creative"),D("bUndo").hidden=L.mode!=="creative",D("bmode").hidden=!0,as(),Li(),zS(()=>{clearInterval($o),Mt==="loading"&&(Ce("playing"),xr(),Xp=performance.now(),os(),FS(t))})}catch(e){clearInterval($o),console.error(e),Ce("menu"),Si(),alert("Die Welt konnte nicht gestartet werden.")}},30))}function FS(i){L.story&&L.story.i===0&&L.story.p===0&&i.px===void 0&&ha(L.story.c?`📻 Kapitel 1: ${ya[1].t}<small>${ya[1].d} Dein Auftrag steht links (J blendet ihn aus).</small>`:"📜 Willkommen in der Funkzentrale!<small>Dein erster Auftrag steht links. J blendet ihn ein oder aus.</small>"),!L.unsaved&&i.px===void 0&&Ds(!1)}D("pResume").onclick=()=>{Ji(),al()};D("pSave").onclick=()=>Ds(!0);D("pRespawn").onclick=()=>{L.respawn(),al()};D("pSound").onclick=()=>{cn.enabled=!cn.enabled,D("pSound").textContent=cn.enabled?"🔊 Ton: an":"🔇 Ton: aus"};D("pFull").onclick=()=>{try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}catch{}};D("pMenu").onclick=()=>{L.mp&&Zn.end(null),Ds(!1),_r=-1,Si(),Ce("menu"),L.startMenu(),Li(),xr()};D("vd").oninput=i=>{const t=Number(i.target.value);L.maxView=t,L.setViewDist(t),D("vdVal").textContent=t};D("invClose").onclick=Ea;D("bInv").onclick=ol;D("bWp").onclick=()=>L.toggleWaypoint();D("bUndo").onclick=()=>L.undo(!1);D("bMap").onclick=()=>hl();D("td").oninput=i=>{L.time=Number(i.target.value)/100,D("tdVal").textContent=L.clockText(),L.updateSky(),L.render()};D("pFreeze").onclick=()=>{L.timeFrozen=!L.timeFrozen,D("pFreeze").textContent=L.timeFrozen?"⏸ Zeit steht still":"⏱ Zeit läuft"};D("bPause").onclick=Pi;function As(){const i=L.input;if(qn.joy||vt.active)return;const t=n=>An.has(Kn[n]);i.f=(t("fwd")||An.has("ArrowUp")?1:0)-(t("back")||An.has("ArrowDown")?1:0),i.r=(t("right")||An.has("ArrowRight")?1:0)-(t("left")||An.has("ArrowLeft")?1:0);const e=L.player.flying;i.sprint=t("sprint")||!e&&t("sneak"),i.down=e&&t("sneak")||qn.down,i.sneak=t("sneak"),i.jump=t("jump")||qn.jump}const qn={joy:!1,jump:!1,down:!1};let nd=0;function Ko(){if(L.mode!=="creative"||L.ride)return;const i=L.player;i.flying=!i.flying,i.vy=0,te(i.flying?"Fliegen an":"Fliegen aus"),D("bDown").hidden=!(vn&&i.flying),D("bFly").classList.toggle("on",i.flying)}window.addEventListener("keydown",i=>{if(Ei){if(i.preventDefault(),i.code!=="Escape"){const e=gS(Kn,Ei,i.code);e?(Kn=e,ht.keys={...e},ss(ht)):te("Diese Taste ist reserviert")}Ei=null,zh();return}if(Mt==="menu"&&i.target&&i.target.tagName==="INPUT"&&(i.code==="ArrowUp"||i.code==="ArrowDown")){i.preventDefault(),ac(i.code==="ArrowDown"?1:-1);return}if(i.target&&/^(INPUT|SELECT|TEXTAREA)$/.test(i.target.tagName)){i.code==="Escape"&&(i.target.blur(),Mt==="inventory"?Ea():Mt==="settings"&&Yo());return}if(Mt==="menu"){i.code==="ArrowDown"||i.code==="ArrowRight"?(i.preventDefault(),ac(1)):i.code==="ArrowUp"||i.code==="ArrowLeft"?(i.preventDefault(),ac(-1)):(i.code==="Escape"||i.code==="Backspace")&&(i.preventDefault(),kh()),ba("keys");return}if(Mt==="settings"){i.code==="Escape"&&Yo();return}if(Mt==="mp"){i.code==="Escape"&&D("mpClose").onclick();return}if(Mt==="map"){(i.code==="Escape"||i.code===Kn.map)&&(i.preventDefault(),ul());return}if(Mt==="layout"){i.code==="Escape"&&Fh();return}if(Mt==="trade"){(i.code==="Escape"||i.code==="KeyE")&&(i.preventDefault(),Nh());return}if(Mt==="inventory"){(i.code===Kn.inv||i.code==="Escape")&&(i.preventDefault(),Ea());return}if(Mt!=="playing")return;const t=vS(Kn,i.code);if((t==="jump"||i.code==="Tab"||i.code.startsWith("Arrow"))&&i.preventDefault(),!i.repeat){if(/^Digit[1-9]$/.test(i.code)){L.selectSlot(Number(i.code[5])-1);return}if(i.code==="KeyZ"&&(i.ctrlKey||i.metaKey)){i.preventDefault(),L.undo(i.shiftKey);return}if(i.code==="KeyY"&&(i.ctrlKey||i.metaKey)){i.preventDefault(),L.undo(!0);return}if(t==="inv"){i.preventDefault(),ol();return}if(t==="fly"){Ko();return}if(t==="build"){L.cycleBuild(i.shiftKey?-1:1);return}if(t==="rotate"){L.rotateDeco(i.shiftKey?-1:1)||te("Schau auf ein Deko-Stück zum Drehen");return}if(t==="hook"){L.fireHook();return}if(t==="wp"){L.toggleWaypoint();return}if(t==="map"){hl();return}if(t==="quests"){Ts=!Ts,Li();return}if(t==="jump"){const e=performance.now();e-nd<280&&Ko(),nd=e}An.add(i.code),As()}});window.addEventListener("keyup",i=>{An.delete(i.code),Mt==="playing"&&As()});window.addEventListener("blur",()=>{An.clear(),As()});const qp=.0022,BS=.0058;function Uh(i,t,e){L.yaw-=i*e,L.pitch=Math.max(-1.55,Math.min(1.55,L.pitch-t*e*(ht.invertY?-1:1)))}window.addEventListener("mousemove",i=>{Mt==="playing"&&zn()&&Uh(i.movementX,i.movementY,qp*ht.mouseSens)});Da.addEventListener("mousedown",i=>{if(!(Mt!=="playing"||vn&&i.sourceCapabilities&&i.sourceCapabilities.firesTouchEvents)){if(Ji(),!zn()){os();return}i.button===0?L.breakHeld=!0:i.button===2&&(L.placeHeld=!0),i.preventDefault()}});window.addEventListener("mouseup",i=>{i.button===0?L.breakHeld=!1:i.button===2&&(L.placeHeld=!1)});Da.addEventListener("contextmenu",i=>i.preventDefault());window.addEventListener("wheel",i=>{Mt==="playing"&&L.selectSlot(L.sel+(i.deltaY>0?1:-1))},{passive:!0});function HS(){vn&&document.body.classList.contains("touch")||(vn=!0,document.body.classList.add("touch"),D("bFly").hidden=L.mode!=="creative")}vn&&document.body.classList.add("touch");window.addEventListener("pointerdown",i=>{i.pointerType==="touch"&&HS()},{capture:!0});(function(){const t=D("zl"),e=D("zr"),n=D("joy"),s=D("thumb"),r=52;let a=null,o=null;t.addEventListener("pointerdown",u=>{a||(Ji(),a={id:u.pointerId,x:u.clientX,y:u.clientY},t.setPointerCapture(u.pointerId),n.style.display="block",n.style.left=u.clientX+"px",n.style.top=u.clientY+"px",s.style.transform="translate(0,0)",qn.joy=!0)}),t.addEventListener("pointermove",u=>{if(!a||u.pointerId!==a.id)return;let f=u.clientX-a.x,p=u.clientY-a.y;const v=Math.hypot(f,p),_=v>r?r/v:1;s.style.transform=`translate(${f*_}px,${p*_}px)`;const m=Math.min(1,v*ht.joySens/r),d=m<.14?0:(m-.14)/.86,x=v?f/v:0,M=v?p/v:0;L.input.r=x*d,L.input.f=-M*d,L.input.sprint=v>r*1.35});const l=u=>{!a||u.pointerId!==a.id||(a=null,n.style.display="none",qn.joy=!1,L.input.f=L.input.r=0,L.input.sprint=!1,As())};t.addEventListener("pointerup",l),t.addEventListener("pointercancel",l),e.addEventListener("pointerdown",u=>{o||(o={id:u.pointerId,x:u.clientX,y:u.clientY},e.setPointerCapture(u.pointerId))}),e.addEventListener("pointermove",u=>{!o||u.pointerId!==o.id||(Uh(u.clientX-o.x,u.clientY-o.y,BS*ht.touchSens),o.x=u.clientX,o.y=u.clientY)});const c=u=>{o&&u.pointerId===o.id&&(o=null)};e.addEventListener("pointerup",c),e.addEventListener("pointercancel",c);const h=(u,f,p)=>{const v=D(u);v.addEventListener("pointerdown",m=>{m.preventDefault(),Ji(),v.setPointerCapture(m.pointerId),v.classList.add("on"),f()});const _=()=>{v.classList.remove("on"),p()};v.addEventListener("pointerup",_),v.addEventListener("pointercancel",_)};h("bBreak",()=>{L.breakHeld=!0},()=>{L.breakHeld=!1}),h("bPlace",()=>{L.placeHeld=!0},()=>{L.placeHeld=!1}),h("bJump",()=>{qn.jump=!0,L.input.jump=!0},()=>{qn.jump=!1,L.input.jump=An.has("Space")}),h("bDown",()=>{qn.down=!0,L.input.down=!0},()=>{qn.down=!1,L.input.down=!1}),D("bFly").addEventListener("click",Ko),D("bHook").addEventListener("pointerdown",u=>{u.preventDefault(),Ji(),L.fireHook()})})();const vt={active:!1,prev:[],raf:0,last:0,idx:-1,style:"generic",used:0,cap:null,rt:!1,lt:!1,run:!1,dir:"",dirT:0,dirN:0};let Mr=Ph(ht.padKeys);function cl(){const i=navigator.getGamepads?[...navigator.getGamepads()]:[],t=i[vt.idx];if(t&&t.connected)return t;const e=i.find(n=>n&&n.connected);return e&&(vt.idx=e.index,vt.style=Op(e.id)),e||null}rh.fn=i=>{vt.raf&&performance.now()-vt.used<3e4&&sl(cl(),i,ht.padRumble)};const id={inventory:"inv",settings:"set",mp:"mp",map:"map",trade:"trade",dead:"dead"};function Io(){return Mt==="menu"?D(En?Xo[En]:"mmNav"):Mt==="paused"?D("qlog").hidden?D("pause"):D("qlog"):id[Mt]?D(id[Mt]):null}function GS(){Mt==="menu"?kh():Mt==="paused"?D("qlog").hidden?al():sn("qlog",!1):Mt==="inventory"?Ea():Mt==="settings"?vt.cap||Ei?(vt.cap=Ei=null,Bh()):Yo():Mt==="mp"?D("mpClose").onclick():Mt==="map"?ul():Mt==="trade"?Nh():Mt==="layout"&&Fh()}const lc=(i,t)=>i.dispatchEvent(new Event(t,{bubbles:!0}));function uh(i){i.focus({preventScroll:!0,focusVisible:!0}),i.scrollIntoView({block:"nearest",inline:"nearest"})}function VS(i){const t=Io();if(!t)return;const e=ll(t);if(!e.length)return;const n=e.indexOf(document.activeElement),s=e[n];if(s&&(i==="left"||i==="right")){const o=i==="right"?1:-1;if(s.type==="range"){o>0?s.stepUp():s.stepDown(),lc(s,"input"),lc(s,"change");return}if(s.tagName==="SELECT"){const l=s.options.length;s.selectedIndex=(s.selectedIndex+o+l)%l,lc(s,"change");return}}if(n<0){uh(t.querySelector(".cell:not([disabled]),.go,.big")||e.find(o=>!o.classList.contains("x"))||e[0]);return}const r=e.map(o=>{const l=o.getBoundingClientRect();return{x:l.left,y:l.top,w:l.width,h:l.height}});let a=SS(r,n,i);a<0&&(i==="up"||i==="down")&&(a=(n+(i==="down"?1:-1)+e.length)%e.length),a>=0&&uh(e[a])}function WS(i){for(let t=i;t&&t!==document.body;t=t.parentElement){const e=getComputedStyle(t).overflowY;if((e==="auto"||e==="scroll")&&t.scrollHeight>t.clientHeight)return t}return null}function XS(i,t){const e=i.buttons,n=e[ae.UP]?"up":e[ae.DOWN]?"down":e[ae.LEFT]?"left":e[ae.RIGHT]?"right":i.f>.55?"up":i.f<-.55?"down":i.r<-.55?"left":i.r>.55?"right":"";return n!==vt.dir?(vt.dir=n,vt.dirT=t,vt.dirN=0,n):n&&t-vt.dirT>(vt.dirN?110:380)?(vt.dirT=t,vt.dirN++,n):""}function $S(i,t,e,n){if(vt.cap){const r=i.buttons.findIndex((a,o)=>a&&o<Dh&&t(o));if(r>=0){const a=xS(Mr,vt.cap,r);a&&(Mr=a,ht.padKeys={...a},ss(ht)),vt.cap=null,Rr()}return}if(Mt==="paused"&&i.hit.pause){al();return}if(Mt==="inventory"&&i.hit.inv){Ea();return}if(Mt==="map"&&i.hit.map){ul();return}if(t(zp(vt.style))){GS();return}const s=XS(i,e);if(s&&VS(s),t(Up(vt.style))){const r=Io(),a=document.activeElement;if(r&&a&&r.contains(a)&&a!==document.body)a.click();else if(r){const o=ll(r);o[0]&&uh(o[0])}}if(Mt==="inventory"){if(t(ae.LB)||t(ae.RB)){const r=[...D("invTabs").querySelectorAll("[data-cat]")],a=r.findIndex(l=>l.dataset.cat===_i),o=r[(a+(t(ae.RB)?1:-1)+r.length)%r.length];o&&o.click()}(t(ae.LT)||t(ae.RT))&&(L.selectSlot((L.sel+(t(ae.RT)?1:8))%9),as()),t(ae.W)&&document.activeElement&&document.activeElement.closest("#invGrid,#recipes")&&document.activeElement.dispatchEvent(new MouseEvent("click",{bubbles:!0,shiftKey:!0}))}if(Mt==="map"){if(t(ae.LB)&&Gi.zoom(-1),t(ae.RB)&&Gi.zoom(1),i.lx||i.ly){const r=160*n/Math.max(.25,Gi.zoomLevel?Gi.zoomLevel():1);Gi.cx+=i.lx*r,Gi.cz+=i.ly*r,Gi.draw()}}else if(i.ly){const r=WS(document.activeElement)||Io()&&Io().querySelector(".panel");r&&(r.scrollTop+=i.ly*18)}}const sd=i=>i*(.45+.55*Math.abs(i));function Kp(i){const t=cl();if(!t){vt.raf=0,vt.active=!1,Rr(),ba("keys");return}vt.raf=requestAnimationFrame(Kp);const e=Math.min(.05,(i-(vt.last||i))/1e3);vt.last=i;const n=vt.prev,s=yS(t,n,Mr,ht.padDead);vt.prev=s.buttons;const r=h=>s.buttons[h]&&!n[h];if((s.buttons.some(Boolean)||s.r||s.f||s.lx||s.ly)&&((!vt.used||i-vt.used>5e3)&&(document.body.classList.add("pad"),Mt==="menu"&&ba("pad")),vt.used=i,Ji()),Mt==="loading")return;if(Mt!=="playing"){$S(s,r,i,e);return}const a=L.input,o=s.r||s.f,l=L.player.flying,c=s.held;s.hit.sprint&&(vt.run=!vt.run),o?(vt.active=!0,a.r=s.r,a.f=s.f,a.sprint=vt.run||!l&&c.sneak):vt.active&&(vt.active=!1,vt.run=!1,a.f=a.r=0,a.sprint=!1,As()),(s.lx||s.ly)&&Uh(sd(s.lx)*900*e,sd(s.ly)*600*e*(ht.padInvertY?-1:1),qp*ht.padSens),a.jump=c.jump||An.has(Kn.jump)||qn.jump,a.down=c.sneak&&l||qn.down||l&&An.has(Kn.sneak),a.sneak=c.sneak||An.has(Kn.sneak),!o&&c.sneak!==!!vt.sneak&&(c.sneak?a.sprint=!l:As()),vt.sneak=c.sneak,c.break!==vt.rt&&(vt.rt=c.break,L.breakHeld=vt.rt),c.place!==vt.lt&&(vt.lt=c.place,L.placeHeld=vt.lt),s.hit.hook&&(sl(t,"hook",ht.padRumble),L.fireHook()),s.hit.prev&&L.selectSlot((L.sel+8)%9),s.hit.next&&L.selectSlot((L.sel+1)%9),s.hit.fly&&Ko(),s.hit.wp&&L.toggleWaypoint(),s.hit.build&&L.cycleBuild(1),s.hit.quests&&(Ts=!Ts,Li()),s.hit.undo&&L.mode==="creative"&&L.undo(!1),s.hit.inv?ol():s.hit.map?hl():s.hit.pause&&Pi()}window.addEventListener("gamepadconnected",i=>{vt.idx=i.gamepad.index,vt.style=Op(i.gamepad.id),vt.used=performance.now(),document.body.classList.add("pad"),te(`🎮 ${kp[vt.style]} verbunden`),ba("pad"),Rr(),sl(i.gamepad,"done",ht.padRumble),vt.raf||(vt.raf=requestAnimationFrame(Kp))});window.addEventListener("gamepaddisconnected",i=>{i.gamepad.index===vt.idx&&(vt.idx=-1,te("🎮 Controller getrennt"),wr(),Mt==="playing"&&Pi())});window.addEventListener("mousemove",()=>{vt.used&&performance.now()-vt.used>1500&&document.body.classList.remove("pad")},{passive:!0});window.addEventListener("resize",()=>L.resize());let ws=ht.minimap;D("mm").classList.toggle("off",!ws);const Gi=new mS(L,D,te);function hl(){Mt!=="playing"||!L.map||(wr(),Ce("map"),D("mapMini").checked=ws,zn()&&document.exitPointerLock(),rl(),Gi.open())}function ul(){Mt==="map"&&(Ce("playing"),L.resume(),os(),ns()&&setTimeout(()=>{Mt==="playing"&&!zn()&&ns()&&Pi()},250))}D("mapClose").onclick=ul;D("mm").addEventListener("click",()=>hl());D("mapMini").onchange=i=>{ws=ht.minimap=i.target.checked,ss(ht),D("mm").classList.toggle("off",!ws)};const Ue=D("mm").getContext("2d"),rd=Ue.createImageData(56,56);function qS(){const i=L.world,t=L.player,e=rd.data,n=Math.floor(t.x)-28,s=Math.floor(t.z)-28,r=t.y;for(let a=0;a<56;a++)for(let o=0;o<56;o++){const l=n+o,c=s+a,h=i.getChunk(l>>4,c>>4),u=(a*56+o)*4;let f=14,p=18,v=32;if(h){const _=(l&15)+(c&15)*16;let m=Math.min(ie-1,h.maxY);for(;m>0&&h.data[_+m*256]===0;)m--;const d=h.data[_+m*256],x=Ht[d]?Ht[d].map:[200,200,210],M=d===g.WATER?1:Math.max(.55,Math.min(1.25,1+(m-r)*.025));f=x[0]*M,p=x[1]*M,v=x[2]*M}e[u]=f,e[u+1]=p,e[u+2]=v,e[u+3]=255}if(Ue.putImageData(rd,0,0),L.wp){let a=L.wp.x-t.x,o=L.wp.z-t.z;const l=Math.max(Math.abs(a),Math.abs(o)),c=l>25?25/l:1;a*=c,o*=c,Ue.fillStyle="#ff2d95",Ue.fillRect(28+a-2,28+o-2,5,5),Ue.strokeStyle="#fff",Ue.strokeRect(28+a-2.5,28+o-2.5,6,6)}Ue.save(),Ue.translate(28,28),Ue.rotate(-L.yaw),Ue.fillStyle="#fff",Ue.strokeStyle="#000",Ue.beginPath(),Ue.moveTo(0,-5),Ue.lineTo(3.5,4),Ue.lineTo(0,2),Ue.lineTo(-3.5,4),Ue.closePath(),Ue.fill(),Ue.stroke(),Ue.restore()}let KS=0;setInterval(()=>{if(Mt!=="playing")return;const i=L.player;let t="";i.flying&&(t+=" · fliegt"),i.gliding&&(t+=" · gleitet"),L.hookT>0&&(t+=" · Haken"),L.wp&&(t+=` · 📍 ${Math.round(Math.hypot(L.wp.x-i.x,L.wp.z-i.z))} m`),L.radioDist<24&&(t+=" · ♪");const e=L.biomeName();e&&(t+=" · "+e),ht.showFps&&(t+=` · ${L.fps} FPS`),D("info").textContent=`${L.clockText()} ${L.time<.5?"☀":"☾"} · X ${i.x.toFixed(0)} Y ${i.y.toFixed(0)} Z ${i.z.toFixed(0)}${t}`,D("uw").classList.toggle("on",!!L.underwater),ws&&!(KS++&1)&&qS(),L.story&&Li()},250);function Yp(){const i=ht.quality==="auto";L.setQuality(i?MM(Ih):ht.quality,i),L.placeDelay=ht.placeDelay,L.deathLoss=ht.deathLoss,L.enemies=ht.enemies,L.preview=ht.preview,cn.vol=ht.sfxVol,cn.music=ht.musicVol,cn.amb=ht.ambVol,document.documentElement.style.setProperty("--tbs",String(ht.btnScale)),document.body.classList.toggle("lefty",ht.lefty)}const jp=[["sMouse","mouseSens",i=>i.toFixed(1)+"×"],["sTouch","touchSens",i=>i.toFixed(1)+"×"],["sJoy","joySens",i=>i.toFixed(1)+"×"],["sBtn","btnScale",i=>Math.round(i*100)+" %"],["sSfx","sfxVol",i=>Math.round(i*100)+" %"],["sMus","musicVol",i=>Math.round(i*100)+" %"],["sAmb","ambVol",i=>Math.round(i*100)+" %"],["sPadSens","padSens",i=>i.toFixed(1)+"×"],["sPadRum","padRumble",i=>i?Math.round(i*100)+" %":"aus"],["sPadDead","padDead",i=>Math.round(i*100)+" %"]],Zp=[["sPadInv","padInvertY"],["sLefty","lefty"],["sInvY","invertY"],["sPlace","placeDelay"],["sFps","showFps"],["sEnemy","enemies"],["sPreview","preview"]];let Ei=null;function zh(){const i=D("sKeys");i.textContent="";for(const[t,e]of la){const n=document.createElement("label"),s=document.createElement("button");n.textContent=e,s.dataset.a=t,s.textContent=Ei===t?"Taste drücken …":_S(Kn[t]),s.className=Ei===t?"wait":"",n.append(s),i.append(n)}}function Rr(){const i=D("sPadKeys");if(!i)return;const t=vt.raf?cl():null;D("sPad").textContent=t?`Erkannt: ${kp[vt.style]} (${String(t.id).slice(0,48)})${t.vibrationActuator||t.hapticActuators&&t.hapticActuators.length?" · mit Vibration":""}`:"Kein Controller erkannt – eine Taste am Controller drücken.",i.textContent="";for(const[e,n]of ca){const s=document.createElement("label"),r=document.createElement("button");s.textContent=n,r.dataset.pa=e,r.textContent=vt.cap===e?"Taste drücken …":ah(vt.style,Mr[e]),r.className=vt.cap===e?"wait":"",s.append(r),i.append(s)}}D("sPadKeys").addEventListener("click",i=>{const t=i.target.closest("button[data-pa]");t&&(i.preventDefault(),vt.cap=t.dataset.pa,Rr(),t.focus())});D("sPadTest").onclick=()=>{const i=cl();te(i&&sl(i,"hurt",Math.max(.5,ht.padRumble))?"📳 Vibration":"Dieser Controller oder Browser kann nicht vibrieren")};D("sPadReset").onclick=()=>{ht.padKeys={},Mr=Ph({}),ss(ht),Rr(),te("Controller-Belegung zurückgesetzt")};D("sKeys").addEventListener("click",i=>{const t=i.target.closest("button[data-a]");t&&(i.preventDefault(),Ei=t.dataset.a,zh())});const YS=["bJump","bDown","bBreak","bPlace","bFly","bHook"];function fl(){for(const i of YS){const t=D(i),e=ht.touchPos[i],n=Array.isArray(e)&&e.length===2&&e.every(s=>Number.isFinite(s)&&s>=0&&s<=1);t.style.left=n?e[0]*100+"%":"",t.style.top=n?e[1]*100+"%":"",t.style.right=t.style.bottom=n?"auto":"",t.style.transform=n?"translate(-50%,-50%)":""}}let Jp="settings",ua=null;function jS(){Jp=bs,Ce("layout"),D("layoutBar").hidden=!1}function Fh(){D("layoutBar").hidden=!0,ss(ht),Ce("settings"),bs=Jp}D("sLayout").onclick=jS;D("lDone").onclick=Fh;D("lReset").onclick=()=>{ht.touchPos={},fl()};D("touch").addEventListener("pointerdown",i=>{if(Mt!=="layout")return;const t=i.target.closest(".tb");if(i.stopPropagation(),i.preventDefault(),!!t){try{t.setPointerCapture(i.pointerId)}catch{}ua={el:t,id:i.pointerId}}},{capture:!0});D("touch").addEventListener("pointermove",i=>{if(Mt!=="layout"||!ua||ua.id!==i.pointerId)return;const t=Math.max(.04,Math.min(.96,i.clientX/innerWidth)),e=Math.max(.1,Math.min(.94,i.clientY/innerHeight));ht.touchPos={...ht.touchPos,[ua.el.id]:[+t.toFixed(3),+e.toFixed(3)]},fl()},{capture:!0});D("touch").addEventListener("pointerup",i=>{Mt==="layout"&&(i.stopPropagation(),ua=null)},{capture:!0});function Bh(){zh(),Rr(),D("sQuality").value=ht.quality,D("sDeath").value=ht.deathLoss;for(const[i,t,e]of jp)D(i).value=ht[t],D(i+"V").textContent=e(ht[t]);for(const[i,t]of Zp)D(i).checked=ht[t]}function Pa(i){ss(ht),i?Yp():(L.placeDelay=ht.placeDelay,L.deathLoss=ht.deathLoss,L.enemies=ht.enemies,L.preview=ht.preview,cn.vol=ht.sfxVol,cn.music=ht.musicVol,document.documentElement.style.setProperty("--tbs",String(ht.btnScale)),document.body.classList.toggle("lefty",ht.lefty))}D("sQuality").onchange=i=>{ht.quality=i.target.value,Pa(!0)};D("sDeath").onchange=i=>{ht.deathLoss=i.target.value,Pa(!1)};for(const[i,t,e]of jp)D(i).oninput=n=>{ht[t]=Number(n.target.value),D(i+"V").textContent=e(ht[t]),Pa(!1)};for(const[i,t]of Zp)D(i).onchange=e=>{ht[t]=e.target.checked,Pa(!1)};D("sReset").onclick=()=>{ht={...na,keys:{},padKeys:{},touchPos:{},stun:ht.stun,mpName:ht.mpName},Kn=Np(ht.keys),Mr=Ph({}),fl(),ws=ht.minimap,D("mm").classList.toggle("off",!ws),Pa(!0),Bh(),te("Standard wiederhergestellt")};function Qp(){bs=Mt,Bh(),Ce("settings")}function Yo(){Mt==="settings"&&(Ei=null,vt.cap=null,Ce(bs),bs==="paused"&&(D("vd").value=L.viewDist,D("vdVal").textContent=L.viewDist))}D("pSettings").onclick=Qp;D("mSettings").onclick=Qp;D("setClose").onclick=Yo;Yp();fl();Si();const Zn=new pS(L,{toast:i=>te(i),status:i=>{D("mpStatus").textContent=i},players:i=>{D("mpPlayers").innerHTML=i.map(t=>`<li><span>👤 ${t.name.replace(/[<>&]/g,"")}</span>${Zn.host?`<button data-kick="${t.id}">Entfernen</button>`:""}</li>`).join("")},joined:i=>{_r=-1,D("bFly").hidden=!(vn&&L.mode==="creative"),D("bUndo").hidden=L.mode!=="creative",D("bmode").hidden=!0,as(),Li(),Ce("playing"),xr(),os(),ha(`👥 Bei ${String(i.host).replace(/[<>&]/g,"")}<small>Du spielst in seiner Welt. Dein Vorrat gilt nur für diesen Besuch; gespeichert wird beim Gastgeber.</small>`)},ended:(i,t)=>{te(i),t?(_r=-1,Si(),Ce("menu"),L.startMenu(),Li(),xr()):Zn.listPlayers()}});let ar=null,tm="menu";function em(i){tm=Mt,bs=Mt==="paused"?"paused":"menu",D("mpHost").hidden=!i,D("mpGuest").hidden=i,D("mpStun").checked=ht.stun,D("mpName").value=ht.mpName,D("mpStatus").textContent="",i&&Zn.listPlayers(),Ce("mp")}D("pMp").onclick=()=>em(!0);D("mJoin").onclick=()=>{Ji(),D("mpAnswerBox").hidden=!0,em(!1)};D("mpClose").onclick=()=>{Ce(tm==="paused"?"paused":"menu")};D("mpStun").onchange=i=>{ht.stun=i.target.checked,ss(ht)};const nm=i=>{const t=D(i);t.select(),(navigator.clipboard?navigator.clipboard.writeText(t.value):Promise.reject()).then(()=>te("Kopiert ✔"),()=>{document.execCommand("copy"),te("Kopiert")})};D("mpCopyO").onclick=()=>nm("mpOffer");D("mpCopyA").onclick=()=>nm("mpAnswer");D("mpInvite").onclick=async()=>{Zn.useStun=ht.stun,Zn.myName=ht.mpName||"Gastgeber",D("mpStatus").textContent="Einladung wird vorbereitet …",D("mpInvite").disabled=!0;try{ar=await Zn.invite(),D("mpOffer").value=ar.code,D("mpAnswerIn").value="",D("mpOfferBox").hidden=!1,D("mpStatus").textContent="Einladung kopieren und schicken, dann die Antwort einfügen."}catch(i){D("mpStatus").textContent="Einladung ging nicht: "+(i.message||i)}D("mpInvite").disabled=!1};D("mpConnect").onclick=async()=>{if(ar)try{await ar.accept(D("mpAnswerIn").value),D("mpStatus").textContent="Verbinde …";const i=ar.pc;ar=null,D("mpOfferBox").hidden=!0;const t=setTimeout(()=>{i.connectionState!=="connected"&&(D("mpStatus").textContent="Keine Verbindung. Tipp: „Über das Internet verbinden“ bei beiden einschalten oder im selben WLAN spielen.")},15e3);i.addEventListener("connectionstatechange",()=>{i.connectionState==="connected"&&(clearTimeout(t),D("mpStatus").textContent="Verbunden ✔")})}catch(i){D("mpStatus").textContent=i.message||"Antwort-Code passt nicht"}};D("mpPlayers").addEventListener("click",i=>{const t=i.target.closest("[data-kick]");t&&Zn.kick(Number(t.dataset.kick))});D("mpJoin").onclick=async()=>{const i=D("mpName").value.trim();ht.mpName=i,ht.stun=D("mpStun").checked,ss(ht),L.mp&&Zn.end(null),Zn.useStun=ht.stun,D("mpStatus").textContent="Antwort wird erstellt …",D("mpJoin").disabled=!0;try{const t=await Zn.join(D("mpInviteIn").value,i||"Gast");D("mpAnswer").value=t,D("mpAnswerBox").hidden=!1,D("mpStatus").textContent="Antwort kopieren und dem Gastgeber schicken. Sobald er sie einfügt, geht es los."}catch(t){D("mpStatus").textContent=t.message||"Einladungs-Code passt nicht"}D("mpJoin").disabled=!1};Ce("menu");L.startMenu();
