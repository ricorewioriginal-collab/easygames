(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function e(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=e(s);fetch(s.href,r)}})();/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const ql="170",ed=0,Sc=1,nd=2,yu=1,id=2,qn=3,ti=0,je=1,mn=2,yi=0,ws=1,Ec=2,bc=3,Tc=4,sd=5,Vi=100,rd=101,ad=102,od=103,ld=104,cd=200,hd=201,ud=202,fd=203,$o=204,qo=205,dd=206,pd=207,md=208,gd=209,_d=210,vd=211,xd=212,Md=213,yd=214,Yo=0,Ko=1,jo=2,Ps=3,Zo=4,Jo=5,Qo=6,tl=7,Su=0,Sd=1,Ed=2,Si=0,bd=1,Td=2,Ad=3,wd=4,Rd=5,Cd=6,Ld=7,Eu=300,Ds=301,Is=302,el=303,nl=304,Wa=306,Ua=1e3,Xi=1001,il=1002,Ze=1003,Pd=1004,Hr=1005,an=1006,to=1007,On=1008,ei=1009,bu=1010,Tu=1011,Mr=1012,Yl=1013,Zi=1014,Kn=1015,Lr=1016,Kl=1017,jl=1018,Ns=1020,Au=35902,wu=1021,Ru=1022,gn=1023,Cu=1024,Lu=1025,Rs=1026,Us=1027,Pu=1028,Zl=1029,Du=1030,Jl=1031,Ql=1033,Ea=33776,ba=33777,Ta=33778,Aa=33779,sl=35840,rl=35841,al=35842,ol=35843,ll=36196,cl=37492,hl=37496,ul=37808,fl=37809,dl=37810,pl=37811,ml=37812,gl=37813,_l=37814,vl=37815,xl=37816,Ml=37817,yl=37818,Sl=37819,El=37820,bl=37821,wa=36492,Tl=36494,Al=36495,Iu=36283,wl=36284,Rl=36285,Cl=36286,Dd=3200,Id=3201,Nd=0,Ud=1,gi="",dn="srgb",zs="srgb-linear",Xa="linear",ce="srgb",is=7680,Ac=519,Od=512,kd=513,Fd=514,Nu=515,zd=516,Bd=517,Hd=518,Gd=519,Ll=35044,wc="300 es",jn=2e3,Oa=2001;class Bs{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const s=this._listeners[t];if(s!==void 0){const r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const n=this._listeners[t.type];if(n!==void 0){t.target=this;const s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}}const Be=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Ra=Math.PI/180,Pl=180/Math.PI;function Ei(){const i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Be[i&255]+Be[i>>8&255]+Be[i>>16&255]+Be[i>>24&255]+"-"+Be[t&255]+Be[t>>8&255]+"-"+Be[t>>16&15|64]+Be[t>>24&255]+"-"+Be[e&63|128]+Be[e>>8&255]+"-"+Be[e>>16&255]+Be[e>>24&255]+Be[n&255]+Be[n>>8&255]+Be[n>>16&255]+Be[n>>24&255]).toLowerCase()}function tn(i,t,e){return Math.max(t,Math.min(e,i))}function Vd(i,t){return(i%t+t)%t}function eo(i,t,e){return(1-e)*i+e*t}function Un(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function ue(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}class Xt{constructor(t=0,e=0){Xt.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(tn(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*s+t.x,this.y=r*s+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Bt{constructor(t,e,n,s,r,a,o,l,c){Bt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c)}set(t,e,n,s,r,a,o,l,c){const h=this.elements;return h[0]=t,h[1]=s,h[2]=o,h[3]=e,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],f=n[2],d=n[5],g=n[8],_=s[0],m=s[3],p=s[6],x=s[1],S=s[4],y=s[7],C=s[2],A=s[5],R=s[8];return r[0]=a*_+o*x+l*C,r[3]=a*m+o*S+l*A,r[6]=a*p+o*y+l*R,r[1]=c*_+h*x+u*C,r[4]=c*m+h*S+u*A,r[7]=c*p+h*y+u*R,r[2]=f*_+d*x+g*C,r[5]=f*m+d*S+g*A,r[8]=f*p+d*y+g*R,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8];return e*a*h-e*o*c-n*r*h+n*o*l+s*r*c-s*a*l}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=h*a-o*c,f=o*l-h*r,d=c*r-a*l,g=e*u+n*f+s*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return t[0]=u*_,t[1]=(s*c-h*n)*_,t[2]=(o*n-s*a)*_,t[3]=f*_,t[4]=(h*e-s*l)*_,t[5]=(s*r-o*e)*_,t[6]=d*_,t[7]=(n*l-c*e)*_,t[8]=(a*e-n*r)*_,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+t,-s*c,s*l,-s*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return this.premultiply(no.makeScale(t,e)),this}rotate(t){return this.premultiply(no.makeRotation(-t)),this}translate(t,e){return this.premultiply(no.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const no=new Bt;function Uu(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function ka(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Wd(){const i=ka("canvas");return i.style.display="block",i}const Rc={};function lr(i){i in Rc||(Rc[i]=!0,console.warn(i))}function Xd(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}function $d(i){const t=i.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function qd(i){const t=i.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}const Qt={enabled:!0,workingColorSpace:zs,spaces:{},convert:function(i,t,e){return this.enabled===!1||t===e||!t||!e||(this.spaces[t].transfer===ce&&(i.r=Jn(i.r),i.g=Jn(i.g),i.b=Jn(i.b)),this.spaces[t].primaries!==this.spaces[e].primaries&&(i.applyMatrix3(this.spaces[t].toXYZ),i.applyMatrix3(this.spaces[e].fromXYZ)),this.spaces[e].transfer===ce&&(i.r=Cs(i.r),i.g=Cs(i.g),i.b=Cs(i.b))),i},fromWorkingColorSpace:function(i,t){return this.convert(i,this.workingColorSpace,t)},toWorkingColorSpace:function(i,t){return this.convert(i,t,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===gi?Xa:this.spaces[i].transfer},getLuminanceCoefficients:function(i,t=this.workingColorSpace){return i.fromArray(this.spaces[t].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,t,e){return i.copy(this.spaces[t].toXYZ).multiply(this.spaces[e].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}};function Jn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Cs(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}const Cc=[.64,.33,.3,.6,.15,.06],Lc=[.2126,.7152,.0722],Pc=[.3127,.329],Dc=new Bt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Ic=new Bt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);Qt.define({[zs]:{primaries:Cc,whitePoint:Pc,transfer:Xa,toXYZ:Dc,fromXYZ:Ic,luminanceCoefficients:Lc,workingColorSpaceConfig:{unpackColorSpace:dn},outputColorSpaceConfig:{drawingBufferColorSpace:dn}},[dn]:{primaries:Cc,whitePoint:Pc,transfer:ce,toXYZ:Dc,fromXYZ:Ic,luminanceCoefficients:Lc,outputColorSpaceConfig:{drawingBufferColorSpace:dn}}});let ss;class Yd{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{ss===void 0&&(ss=ka("canvas")),ss.width=t.width,ss.height=t.height;const n=ss.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=ss}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=ka("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Jn(r[a]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Jn(e[n]/255)*255):e[n]=Jn(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let Kd=0;class Ou{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Kd++}),this.uuid=Ei(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(io(s[a].image)):r.push(io(s[a]))}else r=io(s);n.url=r}return e||(t.images[this.uuid]=n),n}}function io(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Yd.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let jd=0;class Ve extends Bs{constructor(t=Ve.DEFAULT_IMAGE,e=Ve.DEFAULT_MAPPING,n=Xi,s=Xi,r=an,a=On,o=gn,l=ei,c=Ve.DEFAULT_ANISOTROPY,h=gi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:jd++}),this.uuid=Ei(),this.name="",this.source=new Ou(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Xt(0,0),this.repeat=new Xt(1,1),this.center=new Xt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Bt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Eu)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Ua:t.x=t.x-Math.floor(t.x);break;case Xi:t.x=t.x<0?0:1;break;case il:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Ua:t.y=t.y-Math.floor(t.y);break;case Xi:t.y=t.y<0?0:1;break;case il:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}Ve.DEFAULT_IMAGE=null;Ve.DEFAULT_MAPPING=Eu;Ve.DEFAULT_ANISOTROPY=1;class Re{constructor(t=0,e=0,n=0,s=1){Re.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*s+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r;const l=t.elements,c=l[0],h=l[4],u=l[8],f=l[1],d=l[5],g=l[9],_=l[2],m=l[6],p=l[10];if(Math.abs(h-f)<.01&&Math.abs(u-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+d+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const S=(c+1)/2,y=(d+1)/2,C=(p+1)/2,A=(h+f)/4,R=(u+_)/4,L=(g+m)/4;return S>y&&S>C?S<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(S),s=A/n,r=R/n):y>C?y<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(y),n=A/s,r=L/s):C<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(C),n=R/r,s=L/r),this.set(n,s,r,e),this}let x=Math.sqrt((m-g)*(m-g)+(u-_)*(u-_)+(f-h)*(f-h));return Math.abs(x)<.001&&(x=1),this.x=(m-g)/x,this.y=(u-_)/x,this.z=(f-h)/x,this.w=Math.acos((c+d+p-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Zd extends Bs{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new Re(0,0,t,e),this.scissorTest=!1,this.viewport=new Re(0,0,t,e);const s={width:t,height:e,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:an,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const r=new Ve(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];const a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,s=t.textures.length;n<s;n++)this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const e=Object.assign({},t.texture.image);return this.texture.source=new Ou(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Ji extends Zd{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class ku extends Ve{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Ze,this.minFilter=Ze,this.wrapR=Xi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class Jd extends Ve{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Ze,this.minFilter=Ze,this.wrapR=Xi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Pr{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,a,o){let l=n[s+0],c=n[s+1],h=n[s+2],u=n[s+3];const f=r[a+0],d=r[a+1],g=r[a+2],_=r[a+3];if(o===0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u;return}if(o===1){t[e+0]=f,t[e+1]=d,t[e+2]=g,t[e+3]=_;return}if(u!==_||l!==f||c!==d||h!==g){let m=1-o;const p=l*f+c*d+h*g+u*_,x=p>=0?1:-1,S=1-p*p;if(S>Number.EPSILON){const C=Math.sqrt(S),A=Math.atan2(C,p*x);m=Math.sin(m*A)/C,o=Math.sin(o*A)/C}const y=o*x;if(l=l*m+f*y,c=c*m+d*y,h=h*m+g*y,u=u*m+_*y,m===1-o){const C=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=C,c*=C,h*=C,u*=C}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,s,r,a){const o=n[s],l=n[s+1],c=n[s+2],h=n[s+3],u=r[a],f=r[a+1],d=r[a+2],g=r[a+3];return t[e]=o*g+h*u+l*d-c*f,t[e+1]=l*g+h*f+c*u-o*d,t[e+2]=c*g+h*d+o*f-l*u,t[e+3]=h*g-o*u-l*f-c*d,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(s/2),u=o(r/2),f=l(n/2),d=l(s/2),g=l(r/2);switch(a){case"XYZ":this._x=f*h*u+c*d*g,this._y=c*d*u-f*h*g,this._z=c*h*g+f*d*u,this._w=c*h*u-f*d*g;break;case"YXZ":this._x=f*h*u+c*d*g,this._y=c*d*u-f*h*g,this._z=c*h*g-f*d*u,this._w=c*h*u+f*d*g;break;case"ZXY":this._x=f*h*u-c*d*g,this._y=c*d*u+f*h*g,this._z=c*h*g+f*d*u,this._w=c*h*u-f*d*g;break;case"ZYX":this._x=f*h*u-c*d*g,this._y=c*d*u+f*h*g,this._z=c*h*g-f*d*u,this._w=c*h*u+f*d*g;break;case"YZX":this._x=f*h*u+c*d*g,this._y=c*d*u+f*h*g,this._z=c*h*g-f*d*u,this._w=c*h*u-f*d*g;break;case"XZY":this._x=f*h*u-c*d*g,this._y=c*d*u-f*h*g,this._z=c*h*g+f*d*u,this._w=c*h*u+f*d*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],s=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],h=e[6],u=e[10],f=n+o+u;if(f>0){const d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(h-l)*d,this._y=(r-c)*d,this._z=(a-s)*d}else if(n>o&&n>u){const d=2*Math.sqrt(1+n-o-u);this._w=(h-l)/d,this._x=.25*d,this._y=(s+a)/d,this._z=(r+c)/d}else if(o>u){const d=2*Math.sqrt(1+o-n-u);this._w=(r-c)/d,this._x=(s+a)/d,this._y=.25*d,this._z=(l+h)/d}else{const d=2*Math.sqrt(1+u-n-o);this._w=(a-s)/d,this._x=(r+c)/d,this._y=(l+h)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(tn(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,s=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-s*o,this._w=a*h-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const n=this._x,s=this._y,r=this._z,a=this._w;let o=a*t._w+n*t._x+s*t._y+r*t._z;if(o<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,o=-o):this.copy(t),o>=1)return this._w=a,this._x=n,this._y=s,this._z=r,this;const l=1-o*o;if(l<=Number.EPSILON){const d=1-e;return this._w=d*a+e*this._w,this._x=d*n+e*this._x,this._y=d*s+e*this._y,this._z=d*r+e*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,o),u=Math.sin((1-e)*h)/c,f=Math.sin(e*h)/c;return this._w=a*u+this._w*f,this._x=n*u+this._x*f,this._y=s*u+this._y*f,this._z=r*u+this._z*f,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class I{constructor(t=0,e=0,n=0){I.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Nc.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Nc.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(t){const e=this.x,n=this.y,s=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*s-o*n),h=2*(o*e-r*s),u=2*(r*n-a*e);return this.x=e+l*c+a*u-o*h,this.y=n+l*h+o*c-r*u,this.z=s+l*u+r*h-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,s=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return so.copy(this).projectOnVector(t),this.sub(so)}reflect(t){return this.sub(so.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(tn(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const so=new I,Nc=new Pr;class Dr{constructor(t=new I(1/0,1/0,1/0),e=new I(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(Sn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(Sn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=Sn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,Sn):Sn.fromBufferAttribute(r,a),Sn.applyMatrix4(t.matrixWorld),this.expandByPoint(Sn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Gr.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Gr.copy(n.boundingBox)),Gr.applyMatrix4(t.matrixWorld),this.union(Gr)}const s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Sn),Sn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(qs),Vr.subVectors(this.max,qs),rs.subVectors(t.a,qs),as.subVectors(t.b,qs),os.subVectors(t.c,qs),oi.subVectors(as,rs),li.subVectors(os,as),Ni.subVectors(rs,os);let e=[0,-oi.z,oi.y,0,-li.z,li.y,0,-Ni.z,Ni.y,oi.z,0,-oi.x,li.z,0,-li.x,Ni.z,0,-Ni.x,-oi.y,oi.x,0,-li.y,li.x,0,-Ni.y,Ni.x,0];return!ro(e,rs,as,os,Vr)||(e=[1,0,0,0,1,0,0,0,1],!ro(e,rs,as,os,Vr))?!1:(Wr.crossVectors(oi,li),e=[Wr.x,Wr.y,Wr.z],ro(e,rs,as,os,Vr))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Sn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Sn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Bn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Bn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Bn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Bn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Bn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Bn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Bn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Bn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Bn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const Bn=[new I,new I,new I,new I,new I,new I,new I,new I],Sn=new I,Gr=new Dr,rs=new I,as=new I,os=new I,oi=new I,li=new I,Ni=new I,qs=new I,Vr=new I,Wr=new I,Ui=new I;function ro(i,t,e,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){Ui.fromArray(i,r);const o=s.x*Math.abs(Ui.x)+s.y*Math.abs(Ui.y)+s.z*Math.abs(Ui.z),l=t.dot(Ui),c=e.dot(Ui),h=n.dot(Ui);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}const Qd=new Dr,Ys=new I,ao=new I;class Hs{constructor(t=new I,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):Qd.setFromPoints(t).getCenter(n);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Ys.subVectors(t,this.center);const e=Ys.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(Ys,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(ao.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Ys.copy(t.center).add(ao)),this.expandByPoint(Ys.copy(t.center).sub(ao))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Hn=new I,oo=new I,Xr=new I,ci=new I,lo=new I,$r=new I,co=new I;class tc{constructor(t=new I,e=new I(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Hn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=Hn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Hn.copy(this.origin).addScaledVector(this.direction,e),Hn.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){oo.copy(t).add(e).multiplyScalar(.5),Xr.copy(e).sub(t).normalize(),ci.copy(this.origin).sub(oo);const r=t.distanceTo(e)*.5,a=-this.direction.dot(Xr),o=ci.dot(this.direction),l=-ci.dot(Xr),c=ci.lengthSq(),h=Math.abs(1-a*a);let u,f,d,g;if(h>0)if(u=a*l-o,f=a*o-l,g=r*h,u>=0)if(f>=-g)if(f<=g){const _=1/h;u*=_,f*=_,d=u*(u+a*f+2*o)+f*(a*u+f+2*l)+c}else f=r,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*l)+c;else f=-r,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*l)+c;else f<=-g?(u=Math.max(0,-(-a*r+o)),f=u>0?-r:Math.min(Math.max(-r,-l),r),d=-u*u+f*(f+2*l)+c):f<=g?(u=0,f=Math.min(Math.max(-r,-l),r),d=f*(f+2*l)+c):(u=Math.max(0,-(a*r+o)),f=u>0?r:Math.min(Math.max(-r,-l),r),d=-u*u+f*(f+2*l)+c);else f=a>0?-r:r,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(oo).addScaledVector(Xr,f),d}intersectSphere(t,e){Hn.subVectors(t.center,this.origin);const n=Hn.dot(this.direction),s=Hn.dot(Hn)-n*n,r=t.radius*t.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,a,o,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return c>=0?(n=(t.min.x-f.x)*c,s=(t.max.x-f.x)*c):(n=(t.max.x-f.x)*c,s=(t.min.x-f.x)*c),h>=0?(r=(t.min.y-f.y)*h,a=(t.max.y-f.y)*h):(r=(t.max.y-f.y)*h,a=(t.min.y-f.y)*h),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),u>=0?(o=(t.min.z-f.z)*u,l=(t.max.z-f.z)*u):(o=(t.max.z-f.z)*u,l=(t.min.z-f.z)*u),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,Hn)!==null}intersectTriangle(t,e,n,s,r){lo.subVectors(e,t),$r.subVectors(n,t),co.crossVectors(lo,$r);let a=this.direction.dot(co),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;ci.subVectors(this.origin,t);const l=o*this.direction.dot($r.crossVectors(ci,$r));if(l<0)return null;const c=o*this.direction.dot(lo.cross(ci));if(c<0||l+c>a)return null;const h=-o*ci.dot(co);return h<0?null:this.at(h/a,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Se{constructor(t,e,n,s,r,a,o,l,c,h,u,f,d,g,_,m){Se.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c,h,u,f,d,g,_,m)}set(t,e,n,s,r,a,o,l,c,h,u,f,d,g,_,m){const p=this.elements;return p[0]=t,p[4]=e,p[8]=n,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=h,p[10]=u,p[14]=f,p[3]=d,p[7]=g,p[11]=_,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Se().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,n=t.elements,s=1/ls.setFromMatrixColumn(t,0).length(),r=1/ls.setFromMatrixColumn(t,1).length(),a=1/ls.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,s=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){const f=a*h,d=a*u,g=o*h,_=o*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=d+g*c,e[5]=f-_*c,e[9]=-o*l,e[2]=_-f*c,e[6]=g+d*c,e[10]=a*l}else if(t.order==="YXZ"){const f=l*h,d=l*u,g=c*h,_=c*u;e[0]=f+_*o,e[4]=g*o-d,e[8]=a*c,e[1]=a*u,e[5]=a*h,e[9]=-o,e[2]=d*o-g,e[6]=_+f*o,e[10]=a*l}else if(t.order==="ZXY"){const f=l*h,d=l*u,g=c*h,_=c*u;e[0]=f-_*o,e[4]=-a*u,e[8]=g+d*o,e[1]=d+g*o,e[5]=a*h,e[9]=_-f*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){const f=a*h,d=a*u,g=o*h,_=o*u;e[0]=l*h,e[4]=g*c-d,e[8]=f*c+_,e[1]=l*u,e[5]=_*c+f,e[9]=d*c-g,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){const f=a*l,d=a*c,g=o*l,_=o*c;e[0]=l*h,e[4]=_-f*u,e[8]=g*u+d,e[1]=u,e[5]=a*h,e[9]=-o*h,e[2]=-c*h,e[6]=d*u+g,e[10]=f-_*u}else if(t.order==="XZY"){const f=a*l,d=a*c,g=o*l,_=o*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=f*u+_,e[5]=a*h,e[9]=d*u-g,e[2]=g*u-d,e[6]=o*h,e[10]=_*u+f}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(tp,t,ep)}lookAt(t,e,n){const s=this.elements;return nn.subVectors(t,e),nn.lengthSq()===0&&(nn.z=1),nn.normalize(),hi.crossVectors(n,nn),hi.lengthSq()===0&&(Math.abs(n.z)===1?nn.x+=1e-4:nn.z+=1e-4,nn.normalize(),hi.crossVectors(n,nn)),hi.normalize(),qr.crossVectors(nn,hi),s[0]=hi.x,s[4]=qr.x,s[8]=nn.x,s[1]=hi.y,s[5]=qr.y,s[9]=nn.y,s[2]=hi.z,s[6]=qr.z,s[10]=nn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],f=n[9],d=n[13],g=n[2],_=n[6],m=n[10],p=n[14],x=n[3],S=n[7],y=n[11],C=n[15],A=s[0],R=s[4],L=s[8],T=s[12],b=s[1],P=s[5],K=s[9],B=s[13],q=s[2],Z=s[6],$=s[10],nt=s[14],W=s[3],ct=s[7],mt=s[11],At=s[15];return r[0]=a*A+o*b+l*q+c*W,r[4]=a*R+o*P+l*Z+c*ct,r[8]=a*L+o*K+l*$+c*mt,r[12]=a*T+o*B+l*nt+c*At,r[1]=h*A+u*b+f*q+d*W,r[5]=h*R+u*P+f*Z+d*ct,r[9]=h*L+u*K+f*$+d*mt,r[13]=h*T+u*B+f*nt+d*At,r[2]=g*A+_*b+m*q+p*W,r[6]=g*R+_*P+m*Z+p*ct,r[10]=g*L+_*K+m*$+p*mt,r[14]=g*T+_*B+m*nt+p*At,r[3]=x*A+S*b+y*q+C*W,r[7]=x*R+S*P+y*Z+C*ct,r[11]=x*L+S*K+y*$+C*mt,r[15]=x*T+S*B+y*nt+C*At,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],h=t[2],u=t[6],f=t[10],d=t[14],g=t[3],_=t[7],m=t[11],p=t[15];return g*(+r*l*u-s*c*u-r*o*f+n*c*f+s*o*d-n*l*d)+_*(+e*l*d-e*c*f+r*a*f-s*a*d+s*c*h-r*l*h)+m*(+e*c*u-e*o*d-r*a*u+n*a*d+r*o*h-n*c*h)+p*(-s*o*h-e*l*u+e*o*f+s*a*u-n*a*f+n*l*h)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=t[9],f=t[10],d=t[11],g=t[12],_=t[13],m=t[14],p=t[15],x=u*m*c-_*f*c+_*l*d-o*m*d-u*l*p+o*f*p,S=g*f*c-h*m*c-g*l*d+a*m*d+h*l*p-a*f*p,y=h*_*c-g*u*c+g*o*d-a*_*d-h*o*p+a*u*p,C=g*u*l-h*_*l-g*o*f+a*_*f+h*o*m-a*u*m,A=e*x+n*S+s*y+r*C;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const R=1/A;return t[0]=x*R,t[1]=(_*f*r-u*m*r-_*s*d+n*m*d+u*s*p-n*f*p)*R,t[2]=(o*m*r-_*l*r+_*s*c-n*m*c-o*s*p+n*l*p)*R,t[3]=(u*l*r-o*f*r-u*s*c+n*f*c+o*s*d-n*l*d)*R,t[4]=S*R,t[5]=(h*m*r-g*f*r+g*s*d-e*m*d-h*s*p+e*f*p)*R,t[6]=(g*l*r-a*m*r-g*s*c+e*m*c+a*s*p-e*l*p)*R,t[7]=(a*f*r-h*l*r+h*s*c-e*f*c-a*s*d+e*l*d)*R,t[8]=y*R,t[9]=(g*u*r-h*_*r-g*n*d+e*_*d+h*n*p-e*u*p)*R,t[10]=(a*_*r-g*o*r+g*n*c-e*_*c-a*n*p+e*o*p)*R,t[11]=(h*o*r-a*u*r-h*n*c+e*u*c+a*n*d-e*o*d)*R,t[12]=C*R,t[13]=(h*_*s-g*u*s+g*n*f-e*_*f-h*n*m+e*u*m)*R,t[14]=(g*o*s-a*_*s-g*n*l+e*_*l+a*n*m-e*o*m)*R,t[15]=(a*u*s-h*o*s+h*n*l-e*u*l-a*n*f+e*o*f)*R,this}scale(t){const e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),s=Math.sin(e),r=1-n,a=t.x,o=t.y,l=t.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+n,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,a){return this.set(1,n,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){const s=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,h=a+a,u=o+o,f=r*c,d=r*h,g=r*u,_=a*h,m=a*u,p=o*u,x=l*c,S=l*h,y=l*u,C=n.x,A=n.y,R=n.z;return s[0]=(1-(_+p))*C,s[1]=(d+y)*C,s[2]=(g-S)*C,s[3]=0,s[4]=(d-y)*A,s[5]=(1-(f+p))*A,s[6]=(m+x)*A,s[7]=0,s[8]=(g+S)*R,s[9]=(m-x)*R,s[10]=(1-(f+_))*R,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){const s=this.elements;let r=ls.set(s[0],s[1],s[2]).length();const a=ls.set(s[4],s[5],s[6]).length(),o=ls.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],En.copy(this);const c=1/r,h=1/a,u=1/o;return En.elements[0]*=c,En.elements[1]*=c,En.elements[2]*=c,En.elements[4]*=h,En.elements[5]*=h,En.elements[6]*=h,En.elements[8]*=u,En.elements[9]*=u,En.elements[10]*=u,e.setFromRotationMatrix(En),n.x=r,n.y=a,n.z=o,this}makePerspective(t,e,n,s,r,a,o=jn){const l=this.elements,c=2*r/(e-t),h=2*r/(n-s),u=(e+t)/(e-t),f=(n+s)/(n-s);let d,g;if(o===jn)d=-(a+r)/(a-r),g=-2*a*r/(a-r);else if(o===Oa)d=-a/(a-r),g=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=d,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,s,r,a,o=jn){const l=this.elements,c=1/(e-t),h=1/(n-s),u=1/(a-r),f=(e+t)*c,d=(n+s)*h;let g,_;if(o===jn)g=(a+r)*u,_=-2*u;else if(o===Oa)g=r*u,_=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-d,l[2]=0,l[6]=0,l[10]=_,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}const ls=new I,En=new Se,tp=new I(0,0,0),ep=new I(1,1,1),hi=new I,qr=new I,nn=new I,Uc=new Se,Oc=new Pr;class ni{constructor(t=0,e=0,n=0,s=ni.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const s=t.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],u=s[2],f=s[6],d=s[10];switch(e){case"XYZ":this._y=Math.asin(tn(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,d),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-tn(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(tn(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,d),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-tn(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(tn(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-tn(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,d),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Uc.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Uc,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Oc.setFromEuler(this),this.setFromQuaternion(Oc,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}ni.DEFAULT_ORDER="XYZ";class Fu{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let np=0;const kc=new I,cs=new Pr,Gn=new Se,Yr=new I,Ks=new I,ip=new I,sp=new Pr,Fc=new I(1,0,0),zc=new I(0,1,0),Bc=new I(0,0,1),Hc={type:"added"},rp={type:"removed"},hs={type:"childadded",child:null},ho={type:"childremoved",child:null};class We extends Bs{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:np++}),this.uuid=Ei(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=We.DEFAULT_UP.clone();const t=new I,e=new ni,n=new Pr,s=new I(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Se},normalMatrix:{value:new Bt}}),this.matrix=new Se,this.matrixWorld=new Se,this.matrixAutoUpdate=We.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=We.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Fu,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return cs.setFromAxisAngle(t,e),this.quaternion.multiply(cs),this}rotateOnWorldAxis(t,e){return cs.setFromAxisAngle(t,e),this.quaternion.premultiply(cs),this}rotateX(t){return this.rotateOnAxis(Fc,t)}rotateY(t){return this.rotateOnAxis(zc,t)}rotateZ(t){return this.rotateOnAxis(Bc,t)}translateOnAxis(t,e){return kc.copy(t).applyQuaternion(this.quaternion),this.position.add(kc.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Fc,t)}translateY(t){return this.translateOnAxis(zc,t)}translateZ(t){return this.translateOnAxis(Bc,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Gn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Yr.copy(t):Yr.set(t,e,n);const s=this.parent;this.updateWorldMatrix(!0,!1),Ks.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Gn.lookAt(Ks,Yr,this.up):Gn.lookAt(Yr,Ks,this.up),this.quaternion.setFromRotationMatrix(Gn),s&&(Gn.extractRotation(s.matrixWorld),cs.setFromRotationMatrix(Gn),this.quaternion.premultiply(cs.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Hc),hs.child=t,this.dispatchEvent(hs),hs.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(rp),ho.child=t,this.dispatchEvent(ho),ho.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Gn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Gn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Gn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Hc),hs.child=t,this.dispatchEvent(hs),hs.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){const a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ks,t,ip),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ks,sp,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){const n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];r(t.shapes,u)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];s.animations.push(r(t.animations,l))}}if(e){const o=a(t.geometries),l=a(t.materials),c=a(t.textures),h=a(t.images),u=a(t.shapes),f=a(t.skeletons),d=a(t.animations),g=a(t.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),f.length>0&&(n.skeletons=f),d.length>0&&(n.animations=d),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){const l=[];for(const c in o){const h=o[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const s=t.children[n];this.add(s.clone())}return this}}We.DEFAULT_UP=new I(0,1,0);We.DEFAULT_MATRIX_AUTO_UPDATE=!0;We.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const bn=new I,Vn=new I,uo=new I,Wn=new I,us=new I,fs=new I,Gc=new I,fo=new I,po=new I,mo=new I,go=new Re,_o=new Re,vo=new Re;class rn{constructor(t=new I,e=new I,n=new I){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),bn.subVectors(t,e),s.cross(bn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){bn.subVectors(s,e),Vn.subVectors(n,e),uo.subVectors(t,e);const a=bn.dot(bn),o=bn.dot(Vn),l=bn.dot(uo),c=Vn.dot(Vn),h=Vn.dot(uo),u=a*c-o*o;if(u===0)return r.set(0,0,0),null;const f=1/u,d=(c*l-o*h)*f,g=(a*h-o*l)*f;return r.set(1-d-g,g,d)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,Wn)===null?!1:Wn.x>=0&&Wn.y>=0&&Wn.x+Wn.y<=1}static getInterpolation(t,e,n,s,r,a,o,l){return this.getBarycoord(t,e,n,s,Wn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Wn.x),l.addScaledVector(a,Wn.y),l.addScaledVector(o,Wn.z),l)}static getInterpolatedAttribute(t,e,n,s,r,a){return go.setScalar(0),_o.setScalar(0),vo.setScalar(0),go.fromBufferAttribute(t,e),_o.fromBufferAttribute(t,n),vo.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(go,r.x),a.addScaledVector(_o,r.y),a.addScaledVector(vo,r.z),a}static isFrontFacing(t,e,n,s){return bn.subVectors(n,e),Vn.subVectors(t,e),bn.cross(Vn).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return bn.subVectors(this.c,this.b),Vn.subVectors(this.a,this.b),bn.cross(Vn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return rn.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return rn.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return rn.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return rn.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return rn.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,s=this.b,r=this.c;let a,o;us.subVectors(s,n),fs.subVectors(r,n),fo.subVectors(t,n);const l=us.dot(fo),c=fs.dot(fo);if(l<=0&&c<=0)return e.copy(n);po.subVectors(t,s);const h=us.dot(po),u=fs.dot(po);if(h>=0&&u<=h)return e.copy(s);const f=l*u-h*c;if(f<=0&&l>=0&&h<=0)return a=l/(l-h),e.copy(n).addScaledVector(us,a);mo.subVectors(t,r);const d=us.dot(mo),g=fs.dot(mo);if(g>=0&&d<=g)return e.copy(r);const _=d*c-l*g;if(_<=0&&c>=0&&g<=0)return o=c/(c-g),e.copy(n).addScaledVector(fs,o);const m=h*g-d*u;if(m<=0&&u-h>=0&&d-g>=0)return Gc.subVectors(r,s),o=(u-h)/(u-h+(d-g)),e.copy(s).addScaledVector(Gc,o);const p=1/(m+_+f);return a=_*p,o=f*p,e.copy(n).addScaledVector(us,a).addScaledVector(fs,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const zu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ui={h:0,s:0,l:0},Kr={h:0,s:0,l:0};function xo(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}class ee{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=dn){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Qt.toWorkingColorSpace(this,e),this}setRGB(t,e,n,s=Qt.workingColorSpace){return this.r=t,this.g=e,this.b=n,Qt.toWorkingColorSpace(this,s),this}setHSL(t,e,n,s=Qt.workingColorSpace){if(t=Vd(t,1),e=tn(e,0,1),n=tn(n,0,1),e===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=xo(a,r,t+1/3),this.g=xo(a,r,t),this.b=xo(a,r,t-1/3)}return Qt.toWorkingColorSpace(this,s),this}setStyle(t,e=dn){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=dn){const n=zu[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Jn(t.r),this.g=Jn(t.g),this.b=Jn(t.b),this}copyLinearToSRGB(t){return this.r=Cs(t.r),this.g=Cs(t.g),this.b=Cs(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=dn){return Qt.fromWorkingColorSpace(He.copy(this),t),Math.round(tn(He.r*255,0,255))*65536+Math.round(tn(He.g*255,0,255))*256+Math.round(tn(He.b*255,0,255))}getHexString(t=dn){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=Qt.workingColorSpace){Qt.fromWorkingColorSpace(He.copy(this),e);const n=He.r,s=He.g,r=He.b,a=Math.max(n,s,r),o=Math.min(n,s,r);let l,c;const h=(o+a)/2;if(o===a)l=0,c=0;else{const u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-n)/u+2;break;case r:l=(n-s)/u+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=Qt.workingColorSpace){return Qt.fromWorkingColorSpace(He.copy(this),e),t.r=He.r,t.g=He.g,t.b=He.b,t}getStyle(t=dn){Qt.fromWorkingColorSpace(He.copy(this),t);const e=He.r,n=He.g,s=He.b;return t!==dn?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(ui),this.setHSL(ui.h+t,ui.s+e,ui.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(ui),t.getHSL(Kr);const n=eo(ui.h,Kr.h,e),s=eo(ui.s,Kr.s,e),r=eo(ui.l,Kr.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const He=new ee;ee.NAMES=zu;let ap=0;class Qi extends Bs{static get type(){return"Material"}get type(){return this.constructor.type}set type(t){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:ap++}),this.uuid=Ei(),this.name="",this.blending=ws,this.side=ti,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=$o,this.blendDst=qo,this.blendEquation=Vi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ee(0,0,0),this.blendAlpha=0,this.depthFunc=Ps,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Ac,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=is,this.stencilZFail=is,this.stencilZPass=is,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==ws&&(n.blending=this.blending),this.side!==ti&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==$o&&(n.blendSrc=this.blendSrc),this.blendDst!==qo&&(n.blendDst=this.blendDst),this.blendEquation!==Vi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Ps&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Ac&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==is&&(n.stencilFail=this.stencilFail),this.stencilZFail!==is&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==is&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(e){const r=s(t.textures),a=s(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class bi extends Qi{static get type(){return"MeshBasicMaterial"}constructor(t){super(),this.isMeshBasicMaterial=!0,this.color=new ee(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ni,this.combine=Su,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const Ce=new I,jr=new Xt;class Pe{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=Ll,this.updateRanges=[],this.gpuType=Kn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)jr.fromBufferAttribute(this,e),jr.applyMatrix3(t),this.setXY(e,jr.x,jr.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Ce.fromBufferAttribute(this,e),Ce.applyMatrix3(t),this.setXYZ(e,Ce.x,Ce.y,Ce.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Ce.fromBufferAttribute(this,e),Ce.applyMatrix4(t),this.setXYZ(e,Ce.x,Ce.y,Ce.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Ce.fromBufferAttribute(this,e),Ce.applyNormalMatrix(t),this.setXYZ(e,Ce.x,Ce.y,Ce.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Ce.fromBufferAttribute(this,e),Ce.transformDirection(t),this.setXYZ(e,Ce.x,Ce.y,Ce.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=Un(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=ue(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Un(e,this.array)),e}setX(t,e){return this.normalized&&(e=ue(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Un(e,this.array)),e}setY(t,e){return this.normalized&&(e=ue(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Un(e,this.array)),e}setZ(t,e){return this.normalized&&(e=ue(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Un(e,this.array)),e}setW(t,e){return this.normalized&&(e=ue(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=ue(e,this.array),n=ue(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=ue(e,this.array),n=ue(n,this.array),s=ue(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=ue(e,this.array),n=ue(n,this.array),s=ue(s,this.array),r=ue(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==Ll&&(t.usage=this.usage),t}}class Bu extends Pe{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class Hu extends Pe{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class Je extends Pe{constructor(t,e,n){super(new Float32Array(t),e,n)}}let op=0;const un=new Se,Mo=new We,ds=new I,sn=new Dr,js=new Dr,ke=new I;class De extends Bs{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:op++}),this.uuid=Ei(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Uu(t)?Hu:Bu)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Bt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return un.makeRotationFromQuaternion(t),this.applyMatrix4(un),this}rotateX(t){return un.makeRotationX(t),this.applyMatrix4(un),this}rotateY(t){return un.makeRotationY(t),this.applyMatrix4(un),this}rotateZ(t){return un.makeRotationZ(t),this.applyMatrix4(un),this}translate(t,e,n){return un.makeTranslation(t,e,n),this.applyMatrix4(un),this}scale(t,e,n){return un.makeScale(t,e,n),this.applyMatrix4(un),this}lookAt(t){return Mo.lookAt(t),Mo.updateMatrix(),this.applyMatrix4(Mo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ds).negate(),this.translate(ds.x,ds.y,ds.z),this}setFromPoints(t){const e=this.getAttribute("position");if(e===void 0){const n=[];for(let s=0,r=t.length;s<r;s++){const a=t[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Je(n,3))}else{for(let n=0,s=e.count;n<s;n++){const r=t[n];e.setXYZ(n,r.x,r.y,r.z||0)}t.length>e.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Dr);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new I(-1/0,-1/0,-1/0),new I(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){const r=e[n];sn.setFromBufferAttribute(r),this.morphTargetsRelative?(ke.addVectors(this.boundingBox.min,sn.min),this.boundingBox.expandByPoint(ke),ke.addVectors(this.boundingBox.max,sn.max),this.boundingBox.expandByPoint(ke)):(this.boundingBox.expandByPoint(sn.min),this.boundingBox.expandByPoint(sn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Hs);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new I,1/0);return}if(t){const n=this.boundingSphere.center;if(sn.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){const o=e[r];js.setFromBufferAttribute(o),this.morphTargetsRelative?(ke.addVectors(sn.min,js.min),sn.expandByPoint(ke),ke.addVectors(sn.max,js.max),sn.expandByPoint(ke)):(sn.expandByPoint(js.min),sn.expandByPoint(js.max))}sn.getCenter(n);let s=0;for(let r=0,a=t.count;r<a;r++)ke.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(ke));if(e)for(let r=0,a=e.length;r<a;r++){const o=e[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)ke.fromBufferAttribute(o,c),l&&(ds.fromBufferAttribute(t,c),ke.add(ds)),s=Math.max(s,n.distanceToSquared(ke))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Pe(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let L=0;L<n.count;L++)o[L]=new I,l[L]=new I;const c=new I,h=new I,u=new I,f=new Xt,d=new Xt,g=new Xt,_=new I,m=new I;function p(L,T,b){c.fromBufferAttribute(n,L),h.fromBufferAttribute(n,T),u.fromBufferAttribute(n,b),f.fromBufferAttribute(r,L),d.fromBufferAttribute(r,T),g.fromBufferAttribute(r,b),h.sub(c),u.sub(c),d.sub(f),g.sub(f);const P=1/(d.x*g.y-g.x*d.y);isFinite(P)&&(_.copy(h).multiplyScalar(g.y).addScaledVector(u,-d.y).multiplyScalar(P),m.copy(u).multiplyScalar(d.x).addScaledVector(h,-g.x).multiplyScalar(P),o[L].add(_),o[T].add(_),o[b].add(_),l[L].add(m),l[T].add(m),l[b].add(m))}let x=this.groups;x.length===0&&(x=[{start:0,count:t.count}]);for(let L=0,T=x.length;L<T;++L){const b=x[L],P=b.start,K=b.count;for(let B=P,q=P+K;B<q;B+=3)p(t.getX(B+0),t.getX(B+1),t.getX(B+2))}const S=new I,y=new I,C=new I,A=new I;function R(L){C.fromBufferAttribute(s,L),A.copy(C);const T=o[L];S.copy(T),S.sub(C.multiplyScalar(C.dot(T))).normalize(),y.crossVectors(A,T);const P=y.dot(l[L])<0?-1:1;a.setXYZW(L,S.x,S.y,S.z,P)}for(let L=0,T=x.length;L<T;++L){const b=x[L],P=b.start,K=b.count;for(let B=P,q=P+K;B<q;B+=3)R(t.getX(B+0)),R(t.getX(B+1)),R(t.getX(B+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Pe(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let f=0,d=n.count;f<d;f++)n.setXYZ(f,0,0,0);const s=new I,r=new I,a=new I,o=new I,l=new I,c=new I,h=new I,u=new I;if(t)for(let f=0,d=t.count;f<d;f+=3){const g=t.getX(f+0),_=t.getX(f+1),m=t.getX(f+2);s.fromBufferAttribute(e,g),r.fromBufferAttribute(e,_),a.fromBufferAttribute(e,m),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),o.add(h),l.add(h),c.add(h),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let f=0,d=e.count;f<d;f+=3)s.fromBufferAttribute(e,f+0),r.fromBufferAttribute(e,f+1),a.fromBufferAttribute(e,f+2),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),n.setXYZ(f+0,h.x,h.y,h.z),n.setXYZ(f+1,h.x,h.y,h.z),n.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)ke.fromBufferAttribute(t,e),ke.normalize(),t.setXYZ(e,ke.x,ke.y,ke.z)}toNonIndexed(){function t(o,l){const c=o.array,h=o.itemSize,u=o.normalized,f=new c.constructor(l.length*h);let d=0,g=0;for(let _=0,m=l.length;_<m;_++){o.isInterleavedBufferAttribute?d=l[_]*o.data.stride+o.offset:d=l[_]*h;for(let p=0;p<h;p++)f[g++]=c[d++]}return new Pe(f,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new De,n=this.index.array,s=this.attributes;for(const o in s){const l=s[o],c=t(l,n);e.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let h=0,u=c.length;h<u;h++){const f=c[h],d=t(f,n);l.push(d)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const l in n){const c=n[l];t.data.attributes[l]=c.toJSON(t.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,f=c.length;u<f;u++){const d=c[u];h.push(d.toJSON(t.data))}h.length>0&&(s[l]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(t.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone(e));const s=t.attributes;for(const c in s){const h=s[c];this.setAttribute(c,h.clone(e))}const r=t.morphAttributes;for(const c in r){const h=[],u=r[c];for(let f=0,d=u.length;f<d;f++)h.push(u[f].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;const a=t.groups;for(let c=0,h=a.length;c<h;c++){const u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}const o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Vc=new Se,Oi=new tc,Zr=new Hs,Wc=new I,Jr=new I,Qr=new I,ta=new I,yo=new I,ea=new I,Xc=new I,na=new I;class be extends We{constructor(t=new De,e=new bi){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(s,t);const o=this.morphTargetInfluences;if(r&&o){ea.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=o[l],u=r[l];h!==0&&(yo.fromBufferAttribute(u,t),a?ea.addScaledVector(yo,h):ea.addScaledVector(yo.sub(e),h))}e.add(ea)}return e}raycast(t,e){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Zr.copy(n.boundingSphere),Zr.applyMatrix4(r),Oi.copy(t.ray).recast(t.near),!(Zr.containsPoint(Oi.origin)===!1&&(Oi.intersectSphere(Zr,Wc)===null||Oi.origin.distanceToSquared(Wc)>(t.far-t.near)**2))&&(Vc.copy(r).invert(),Oi.copy(t.ray).applyMatrix4(Vc),!(n.boundingBox!==null&&Oi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,Oi)))}_computeIntersections(t,e,n){let s;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,f=r.groups,d=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,_=f.length;g<_;g++){const m=f[g],p=a[m.materialIndex],x=Math.max(m.start,d.start),S=Math.min(o.count,Math.min(m.start+m.count,d.start+d.count));for(let y=x,C=S;y<C;y+=3){const A=o.getX(y),R=o.getX(y+1),L=o.getX(y+2);s=ia(this,p,t,n,c,h,u,A,R,L),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const g=Math.max(0,d.start),_=Math.min(o.count,d.start+d.count);for(let m=g,p=_;m<p;m+=3){const x=o.getX(m),S=o.getX(m+1),y=o.getX(m+2);s=ia(this,a,t,n,c,h,u,x,S,y),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,_=f.length;g<_;g++){const m=f[g],p=a[m.materialIndex],x=Math.max(m.start,d.start),S=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let y=x,C=S;y<C;y+=3){const A=y,R=y+1,L=y+2;s=ia(this,p,t,n,c,h,u,A,R,L),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const g=Math.max(0,d.start),_=Math.min(l.count,d.start+d.count);for(let m=g,p=_;m<p;m+=3){const x=m,S=m+1,y=m+2;s=ia(this,a,t,n,c,h,u,x,S,y),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}}function lp(i,t,e,n,s,r,a,o){let l;if(t.side===je?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,t.side===ti,o),l===null)return null;na.copy(o),na.applyMatrix4(i.matrixWorld);const c=e.ray.origin.distanceTo(na);return c<e.near||c>e.far?null:{distance:c,point:na.clone(),object:i}}function ia(i,t,e,n,s,r,a,o,l,c){i.getVertexPosition(o,Jr),i.getVertexPosition(l,Qr),i.getVertexPosition(c,ta);const h=lp(i,t,e,n,Jr,Qr,ta,Xc);if(h){const u=new I;rn.getBarycoord(Xc,Jr,Qr,ta,u),s&&(h.uv=rn.getInterpolatedAttribute(s,o,l,c,u,new Xt)),r&&(h.uv1=rn.getInterpolatedAttribute(r,o,l,c,u,new Xt)),a&&(h.normal=rn.getInterpolatedAttribute(a,o,l,c,u,new I),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const f={a:o,b:l,c,normal:new I,materialIndex:0};rn.getNormal(Jr,Qr,ta,f.normal),h.face=f,h.barycoord=u}return h}class wi extends De{constructor(t=1,e=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],h=[],u=[];let f=0,d=0;g("z","y","x",-1,-1,n,e,t,a,r,0),g("z","y","x",1,-1,n,e,-t,a,r,1),g("x","z","y",1,1,t,n,e,s,a,2),g("x","z","y",1,-1,t,n,-e,s,a,3),g("x","y","z",1,-1,t,e,n,s,r,4),g("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new Je(c,3)),this.setAttribute("normal",new Je(h,3)),this.setAttribute("uv",new Je(u,2));function g(_,m,p,x,S,y,C,A,R,L,T){const b=y/R,P=C/L,K=y/2,B=C/2,q=A/2,Z=R+1,$=L+1;let nt=0,W=0;const ct=new I;for(let mt=0;mt<$;mt++){const At=mt*P-B;for(let Ht=0;Ht<Z;Ht++){const ie=Ht*b-K;ct[_]=ie*x,ct[m]=At*S,ct[p]=q,c.push(ct.x,ct.y,ct.z),ct[_]=0,ct[m]=0,ct[p]=A>0?1:-1,h.push(ct.x,ct.y,ct.z),u.push(Ht/R),u.push(1-mt/L),nt+=1}}for(let mt=0;mt<L;mt++)for(let At=0;At<R;At++){const Ht=f+At+Z*mt,ie=f+At+Z*(mt+1),Y=f+(At+1)+Z*(mt+1),it=f+(At+1)+Z*mt;l.push(Ht,ie,it),l.push(ie,Y,it),W+=6}o.addGroup(d,W,T),d+=W,f+=nt}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new wi(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function Os(i){const t={};for(const e in i){t[e]={};for(const n in i[e]){const s=i[e][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone():Array.isArray(s)?t[e][n]=s.slice():t[e][n]=s}}return t}function Ye(i){const t={};for(let e=0;e<i.length;e++){const n=Os(i[e]);for(const s in n)t[s]=n[s]}return t}function cp(i){const t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Gu(i){const t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Qt.workingColorSpace}const hp={clone:Os,merge:Ye};var up=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,fp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Ln extends Qi{static get type(){return"ShaderMaterial"}constructor(t){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=up,this.fragmentShader=fp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Os(t.uniforms),this.uniformsGroups=cp(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}}class Vu extends We{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Se,this.projectionMatrix=new Se,this.projectionMatrixInverse=new Se,this.coordinateSystem=jn}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const fi=new I,$c=new Xt,qc=new Xt;class pn extends Vu{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=Pl*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(Ra*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Pl*2*Math.atan(Math.tan(Ra*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){fi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(fi.x,fi.y).multiplyScalar(-t/fi.z),fi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(fi.x,fi.y).multiplyScalar(-t/fi.z)}getViewSize(t,e){return this.getViewBounds(t,$c,qc),e.subVectors(qc,$c)}setViewOffset(t,e,n,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(Ra*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,e-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const ps=-90,ms=1;class dp extends We{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new pn(ps,ms,t,e);s.layers=this.layers,this.add(s);const r=new pn(ps,ms,t,e);r.layers=this.layers,this.add(r);const a=new pn(ps,ms,t,e);a.layers=this.layers,this.add(a);const o=new pn(ps,ms,t,e);o.layers=this.layers,this.add(o);const l=new pn(ps,ms,t,e);l.layers=this.layers,this.add(l);const c=new pn(ps,ms,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,s,r,a,o,l]=e;for(const c of e)this.remove(c);if(t===jn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Oa)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,h]=this.children,u=t.getRenderTarget(),f=t.getActiveCubeFace(),d=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;const _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,s),t.render(e,r),t.setRenderTarget(n,1,s),t.render(e,a),t.setRenderTarget(n,2,s),t.render(e,o),t.setRenderTarget(n,3,s),t.render(e,l),t.setRenderTarget(n,4,s),t.render(e,c),n.texture.generateMipmaps=_,t.setRenderTarget(n,5,s),t.render(e,h),t.setRenderTarget(u,f,d),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class Wu extends Ve{constructor(t,e,n,s,r,a,o,l,c,h){t=t!==void 0?t:[],e=e!==void 0?e:Ds,super(t,e,n,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class pp extends Ji{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new Wu(s,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:an}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new wi(5,5,5),r=new Ln({name:"CubemapFromEquirect",uniforms:Os(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:je,blending:yi});r.uniforms.tEquirect.value=e;const a=new be(s,r),o=e.minFilter;return e.minFilter===On&&(e.minFilter=an),new dp(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e,n,s){const r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,s);t.setRenderTarget(r)}}const So=new I,mp=new I,gp=new Bt;class Hi{constructor(t=new I(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const s=So.subVectors(n,e).cross(mp.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const n=t.delta(So),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||gp.getNormalMatrix(t),s=this.coplanarPoint(So).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const ki=new Hs,sa=new I;class Xu{constructor(t=new Hi,e=new Hi,n=new Hi,s=new Hi,r=new Hi,a=new Hi){this.planes=[t,e,n,s,r,a]}set(t,e,n,s,r,a){const o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=jn){const n=this.planes,s=t.elements,r=s[0],a=s[1],o=s[2],l=s[3],c=s[4],h=s[5],u=s[6],f=s[7],d=s[8],g=s[9],_=s[10],m=s[11],p=s[12],x=s[13],S=s[14],y=s[15];if(n[0].setComponents(l-r,f-c,m-d,y-p).normalize(),n[1].setComponents(l+r,f+c,m+d,y+p).normalize(),n[2].setComponents(l+a,f+h,m+g,y+x).normalize(),n[3].setComponents(l-a,f-h,m-g,y-x).normalize(),n[4].setComponents(l-o,f-u,m-_,y-S).normalize(),e===jn)n[5].setComponents(l+o,f+u,m+_,y+S).normalize();else if(e===Oa)n[5].setComponents(o,u,_,S).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),ki.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),ki.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(ki)}intersectsSprite(t){return ki.center.set(0,0,0),ki.radius=.7071067811865476,ki.applyMatrix4(t.matrixWorld),this.intersectsSphere(ki)}intersectsSphere(t){const e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const s=e[n];if(sa.x=s.normal.x>0?t.max.x:t.min.x,sa.y=s.normal.y>0?t.max.y:t.min.y,sa.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(sa)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function $u(){let i=null,t=!1,e=null,n=null;function s(r,a){e(r,a),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function _p(i){const t=new WeakMap;function e(o,l){const c=o.array,h=o.usage,u=c.byteLength,f=i.createBuffer();i.bindBuffer(l,f),i.bufferData(l,c,h),o.onUploadCallback();let d;if(c instanceof Float32Array)d=i.FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?d=i.HALF_FLOAT:d=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=i.SHORT;else if(c instanceof Uint32Array)d=i.UNSIGNED_INT;else if(c instanceof Int32Array)d=i.INT;else if(c instanceof Int8Array)d=i.BYTE;else if(c instanceof Uint8Array)d=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,c){const h=l.array,u=l.updateRanges;if(i.bindBuffer(c,o),u.length===0)i.bufferSubData(c,0,h);else{u.sort((d,g)=>d.start-g.start);let f=0;for(let d=1;d<u.length;d++){const g=u[f],_=u[d];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++f,u[f]=_)}u.length=f+1;for(let d=0,g=u.length;d<g;d++){const _=u[d];i.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=t.get(o);l&&(i.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}class qi extends De{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};const r=t/2,a=e/2,o=Math.floor(n),l=Math.floor(s),c=o+1,h=l+1,u=t/o,f=e/l,d=[],g=[],_=[],m=[];for(let p=0;p<h;p++){const x=p*f-a;for(let S=0;S<c;S++){const y=S*u-r;g.push(y,-x,0),_.push(0,0,1),m.push(S/o),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let x=0;x<o;x++){const S=x+c*p,y=x+c*(p+1),C=x+1+c*(p+1),A=x+1+c*p;d.push(S,y,A),d.push(y,C,A)}this.setIndex(d),this.setAttribute("position",new Je(g,3)),this.setAttribute("normal",new Je(_,3)),this.setAttribute("uv",new Je(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new qi(t.width,t.height,t.widthSegments,t.heightSegments)}}var vp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,xp=`#ifdef USE_ALPHAHASH
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
#endif`,Mp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,yp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Sp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Ep=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,bp=`#ifdef USE_AOMAP
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
#endif`,Tp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Ap=`#ifdef USE_BATCHING
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
#endif`,wp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Rp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Cp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Lp=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Pp=`#ifdef USE_IRIDESCENCE
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
#endif`,Dp=`#ifdef USE_BUMPMAP
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
#endif`,Ip=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Np=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Up=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Op=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,kp=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Fp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,zp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Bp=`#if defined( USE_COLOR_ALPHA )
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
#endif`,Hp=`#define PI 3.141592653589793
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
} // validated`,Gp=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Vp=`vec3 transformedNormal = objectNormal;
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
#endif`,Wp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Xp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,$p=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,qp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Yp="gl_FragColor = linearToOutputTexel( gl_FragColor );",Kp=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,jp=`#ifdef USE_ENVMAP
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
#endif`,Zp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Jp=`#ifdef USE_ENVMAP
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
#endif`,Qp=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,tm=`#ifdef USE_ENVMAP
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
#endif`,em=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,nm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,im=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,sm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,rm=`#ifdef USE_GRADIENTMAP
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
}`,am=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,om=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,cm=`uniform bool receiveShadow;
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
#endif`,hm=`#ifdef USE_ENVMAP
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
#endif`,um=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,fm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,dm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,pm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,mm=`PhysicalMaterial material;
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
#endif`,gm=`struct PhysicalMaterial {
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
}`,_m=`
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
#endif`,vm=`#if defined( RE_IndirectDiffuse )
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
#endif`,xm=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Mm=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,ym=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Sm=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Em=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,bm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Tm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Am=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,wm=`#if defined( USE_POINTS_UV )
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
#endif`,Rm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Cm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Lm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Pm=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Dm=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Im=`#ifdef USE_MORPHTARGETS
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
#endif`,Nm=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Um=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Om=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,km=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Fm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,zm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Bm=`#ifdef USE_NORMALMAP
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
#endif`,Hm=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Gm=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Vm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Wm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Xm=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,$m=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,qm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Ym=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Km=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,jm=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Zm=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Jm=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Qm=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,t0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,e0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,n0=`float getShadowMask() {
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
}`,i0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,s0=`#ifdef USE_SKINNING
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
#endif`,r0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,a0=`#ifdef USE_SKINNING
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
#endif`,o0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,l0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,c0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,h0=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,u0=`#ifdef USE_TRANSMISSION
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
#endif`,f0=`#ifdef USE_TRANSMISSION
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
#endif`,d0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,p0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,m0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,g0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const _0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,v0=`uniform sampler2D t2D;
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
}`,x0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,M0=`#ifdef ENVMAP_TYPE_CUBE
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
}`,y0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,S0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,E0=`#include <common>
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
}`,b0=`#if DEPTH_PACKING == 3200
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
}`,T0=`#define DISTANCE
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
}`,A0=`#define DISTANCE
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
}`,w0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,R0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,C0=`uniform float scale;
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
}`,L0=`uniform vec3 diffuse;
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
}`,P0=`#include <common>
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
}`,D0=`uniform vec3 diffuse;
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
}`,I0=`#define LAMBERT
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
}`,N0=`#define LAMBERT
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
}`,U0=`#define MATCAP
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
}`,O0=`#define MATCAP
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
}`,k0=`#define NORMAL
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
}`,F0=`#define NORMAL
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
}`,z0=`#define PHONG
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
}`,B0=`#define PHONG
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
}`,H0=`#define STANDARD
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
}`,G0=`#define STANDARD
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
}`,V0=`#define TOON
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
}`,W0=`#define TOON
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
}`,X0=`uniform float size;
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
}`,$0=`uniform vec3 diffuse;
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
}`,q0=`#include <common>
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
}`,Y0=`uniform vec3 color;
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
}`,K0=`uniform float rotation;
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
}`,j0=`uniform vec3 diffuse;
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
}`,Wt={alphahash_fragment:vp,alphahash_pars_fragment:xp,alphamap_fragment:Mp,alphamap_pars_fragment:yp,alphatest_fragment:Sp,alphatest_pars_fragment:Ep,aomap_fragment:bp,aomap_pars_fragment:Tp,batching_pars_vertex:Ap,batching_vertex:wp,begin_vertex:Rp,beginnormal_vertex:Cp,bsdfs:Lp,iridescence_fragment:Pp,bumpmap_pars_fragment:Dp,clipping_planes_fragment:Ip,clipping_planes_pars_fragment:Np,clipping_planes_pars_vertex:Up,clipping_planes_vertex:Op,color_fragment:kp,color_pars_fragment:Fp,color_pars_vertex:zp,color_vertex:Bp,common:Hp,cube_uv_reflection_fragment:Gp,defaultnormal_vertex:Vp,displacementmap_pars_vertex:Wp,displacementmap_vertex:Xp,emissivemap_fragment:$p,emissivemap_pars_fragment:qp,colorspace_fragment:Yp,colorspace_pars_fragment:Kp,envmap_fragment:jp,envmap_common_pars_fragment:Zp,envmap_pars_fragment:Jp,envmap_pars_vertex:Qp,envmap_physical_pars_fragment:hm,envmap_vertex:tm,fog_vertex:em,fog_pars_vertex:nm,fog_fragment:im,fog_pars_fragment:sm,gradientmap_pars_fragment:rm,lightmap_pars_fragment:am,lights_lambert_fragment:om,lights_lambert_pars_fragment:lm,lights_pars_begin:cm,lights_toon_fragment:um,lights_toon_pars_fragment:fm,lights_phong_fragment:dm,lights_phong_pars_fragment:pm,lights_physical_fragment:mm,lights_physical_pars_fragment:gm,lights_fragment_begin:_m,lights_fragment_maps:vm,lights_fragment_end:xm,logdepthbuf_fragment:Mm,logdepthbuf_pars_fragment:ym,logdepthbuf_pars_vertex:Sm,logdepthbuf_vertex:Em,map_fragment:bm,map_pars_fragment:Tm,map_particle_fragment:Am,map_particle_pars_fragment:wm,metalnessmap_fragment:Rm,metalnessmap_pars_fragment:Cm,morphinstance_vertex:Lm,morphcolor_vertex:Pm,morphnormal_vertex:Dm,morphtarget_pars_vertex:Im,morphtarget_vertex:Nm,normal_fragment_begin:Um,normal_fragment_maps:Om,normal_pars_fragment:km,normal_pars_vertex:Fm,normal_vertex:zm,normalmap_pars_fragment:Bm,clearcoat_normal_fragment_begin:Hm,clearcoat_normal_fragment_maps:Gm,clearcoat_pars_fragment:Vm,iridescence_pars_fragment:Wm,opaque_fragment:Xm,packing:$m,premultiplied_alpha_fragment:qm,project_vertex:Ym,dithering_fragment:Km,dithering_pars_fragment:jm,roughnessmap_fragment:Zm,roughnessmap_pars_fragment:Jm,shadowmap_pars_fragment:Qm,shadowmap_pars_vertex:t0,shadowmap_vertex:e0,shadowmask_pars_fragment:n0,skinbase_vertex:i0,skinning_pars_vertex:s0,skinning_vertex:r0,skinnormal_vertex:a0,specularmap_fragment:o0,specularmap_pars_fragment:l0,tonemapping_fragment:c0,tonemapping_pars_fragment:h0,transmission_fragment:u0,transmission_pars_fragment:f0,uv_pars_fragment:d0,uv_pars_vertex:p0,uv_vertex:m0,worldpos_vertex:g0,background_vert:_0,background_frag:v0,backgroundCube_vert:x0,backgroundCube_frag:M0,cube_vert:y0,cube_frag:S0,depth_vert:E0,depth_frag:b0,distanceRGBA_vert:T0,distanceRGBA_frag:A0,equirect_vert:w0,equirect_frag:R0,linedashed_vert:C0,linedashed_frag:L0,meshbasic_vert:P0,meshbasic_frag:D0,meshlambert_vert:I0,meshlambert_frag:N0,meshmatcap_vert:U0,meshmatcap_frag:O0,meshnormal_vert:k0,meshnormal_frag:F0,meshphong_vert:z0,meshphong_frag:B0,meshphysical_vert:H0,meshphysical_frag:G0,meshtoon_vert:V0,meshtoon_frag:W0,points_vert:X0,points_frag:$0,shadow_vert:q0,shadow_frag:Y0,sprite_vert:K0,sprite_frag:j0},lt={common:{diffuse:{value:new ee(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Bt},alphaMap:{value:null},alphaMapTransform:{value:new Bt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Bt}},envmap:{envMap:{value:null},envMapRotation:{value:new Bt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Bt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Bt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Bt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Bt},normalScale:{value:new Xt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Bt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Bt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Bt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Bt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ee(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new ee(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Bt},alphaTest:{value:0},uvTransform:{value:new Bt}},sprite:{diffuse:{value:new ee(16777215)},opacity:{value:1},center:{value:new Xt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Bt},alphaMap:{value:null},alphaMapTransform:{value:new Bt},alphaTest:{value:0}}},Nn={basic:{uniforms:Ye([lt.common,lt.specularmap,lt.envmap,lt.aomap,lt.lightmap,lt.fog]),vertexShader:Wt.meshbasic_vert,fragmentShader:Wt.meshbasic_frag},lambert:{uniforms:Ye([lt.common,lt.specularmap,lt.envmap,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.fog,lt.lights,{emissive:{value:new ee(0)}}]),vertexShader:Wt.meshlambert_vert,fragmentShader:Wt.meshlambert_frag},phong:{uniforms:Ye([lt.common,lt.specularmap,lt.envmap,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.fog,lt.lights,{emissive:{value:new ee(0)},specular:{value:new ee(1118481)},shininess:{value:30}}]),vertexShader:Wt.meshphong_vert,fragmentShader:Wt.meshphong_frag},standard:{uniforms:Ye([lt.common,lt.envmap,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.roughnessmap,lt.metalnessmap,lt.fog,lt.lights,{emissive:{value:new ee(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Wt.meshphysical_vert,fragmentShader:Wt.meshphysical_frag},toon:{uniforms:Ye([lt.common,lt.aomap,lt.lightmap,lt.emissivemap,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.gradientmap,lt.fog,lt.lights,{emissive:{value:new ee(0)}}]),vertexShader:Wt.meshtoon_vert,fragmentShader:Wt.meshtoon_frag},matcap:{uniforms:Ye([lt.common,lt.bumpmap,lt.normalmap,lt.displacementmap,lt.fog,{matcap:{value:null}}]),vertexShader:Wt.meshmatcap_vert,fragmentShader:Wt.meshmatcap_frag},points:{uniforms:Ye([lt.points,lt.fog]),vertexShader:Wt.points_vert,fragmentShader:Wt.points_frag},dashed:{uniforms:Ye([lt.common,lt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Wt.linedashed_vert,fragmentShader:Wt.linedashed_frag},depth:{uniforms:Ye([lt.common,lt.displacementmap]),vertexShader:Wt.depth_vert,fragmentShader:Wt.depth_frag},normal:{uniforms:Ye([lt.common,lt.bumpmap,lt.normalmap,lt.displacementmap,{opacity:{value:1}}]),vertexShader:Wt.meshnormal_vert,fragmentShader:Wt.meshnormal_frag},sprite:{uniforms:Ye([lt.sprite,lt.fog]),vertexShader:Wt.sprite_vert,fragmentShader:Wt.sprite_frag},background:{uniforms:{uvTransform:{value:new Bt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Wt.background_vert,fragmentShader:Wt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Bt}},vertexShader:Wt.backgroundCube_vert,fragmentShader:Wt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Wt.cube_vert,fragmentShader:Wt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Wt.equirect_vert,fragmentShader:Wt.equirect_frag},distanceRGBA:{uniforms:Ye([lt.common,lt.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Wt.distanceRGBA_vert,fragmentShader:Wt.distanceRGBA_frag},shadow:{uniforms:Ye([lt.lights,lt.fog,{color:{value:new ee(0)},opacity:{value:1}}]),vertexShader:Wt.shadow_vert,fragmentShader:Wt.shadow_frag}};Nn.physical={uniforms:Ye([Nn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Bt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Bt},clearcoatNormalScale:{value:new Xt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Bt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Bt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Bt},sheen:{value:0},sheenColor:{value:new ee(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Bt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Bt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Bt},transmissionSamplerSize:{value:new Xt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Bt},attenuationDistance:{value:0},attenuationColor:{value:new ee(0)},specularColor:{value:new ee(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Bt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Bt},anisotropyVector:{value:new Xt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Bt}}]),vertexShader:Wt.meshphysical_vert,fragmentShader:Wt.meshphysical_frag};const ra={r:0,b:0,g:0},Fi=new ni,Z0=new Se;function J0(i,t,e,n,s,r,a){const o=new ee(0);let l=r===!0?0:1,c,h,u=null,f=0,d=null;function g(x){let S=x.isScene===!0?x.background:null;return S&&S.isTexture&&(S=(x.backgroundBlurriness>0?e:t).get(S)),S}function _(x){let S=!1;const y=g(x);y===null?p(o,l):y&&y.isColor&&(p(y,1),S=!0);const C=i.xr.getEnvironmentBlendMode();C==="additive"?n.buffers.color.setClear(0,0,0,1,a):C==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||S)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(x,S){const y=g(S);y&&(y.isCubeTexture||y.mapping===Wa)?(h===void 0&&(h=new be(new wi(1,1,1),new Ln({name:"BackgroundCubeMaterial",uniforms:Os(Nn.backgroundCube.uniforms),vertexShader:Nn.backgroundCube.vertexShader,fragmentShader:Nn.backgroundCube.fragmentShader,side:je,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(C,A,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),Fi.copy(S.backgroundRotation),Fi.x*=-1,Fi.y*=-1,Fi.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(Fi.y*=-1,Fi.z*=-1),h.material.uniforms.envMap.value=y,h.material.uniforms.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Z0.makeRotationFromEuler(Fi)),h.material.toneMapped=Qt.getTransfer(y.colorSpace)!==ce,(u!==y||f!==y.version||d!==i.toneMapping)&&(h.material.needsUpdate=!0,u=y,f=y.version,d=i.toneMapping),h.layers.enableAll(),x.unshift(h,h.geometry,h.material,0,0,null)):y&&y.isTexture&&(c===void 0&&(c=new be(new qi(2,2),new Ln({name:"BackgroundMaterial",uniforms:Os(Nn.background.uniforms),vertexShader:Nn.background.vertexShader,fragmentShader:Nn.background.fragmentShader,side:ti,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=y,c.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,c.material.toneMapped=Qt.getTransfer(y.colorSpace)!==ce,y.matrixAutoUpdate===!0&&y.updateMatrix(),c.material.uniforms.uvTransform.value.copy(y.matrix),(u!==y||f!==y.version||d!==i.toneMapping)&&(c.material.needsUpdate=!0,u=y,f=y.version,d=i.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null))}function p(x,S){x.getRGB(ra,Gu(i)),n.buffers.color.setClear(ra.r,ra.g,ra.b,S,a)}return{getClearColor:function(){return o},setClearColor:function(x,S=1){o.set(x),l=S,p(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(x){l=x,p(o,l)},render:_,addToRenderList:m}}function Q0(i,t){const e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=f(null);let r=s,a=!1;function o(b,P,K,B,q){let Z=!1;const $=u(B,K,P);r!==$&&(r=$,c(r.object)),Z=d(b,B,K,q),Z&&g(b,B,K,q),q!==null&&t.update(q,i.ELEMENT_ARRAY_BUFFER),(Z||a)&&(a=!1,y(b,P,K,B),q!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(q).buffer))}function l(){return i.createVertexArray()}function c(b){return i.bindVertexArray(b)}function h(b){return i.deleteVertexArray(b)}function u(b,P,K){const B=K.wireframe===!0;let q=n[b.id];q===void 0&&(q={},n[b.id]=q);let Z=q[P.id];Z===void 0&&(Z={},q[P.id]=Z);let $=Z[B];return $===void 0&&($=f(l()),Z[B]=$),$}function f(b){const P=[],K=[],B=[];for(let q=0;q<e;q++)P[q]=0,K[q]=0,B[q]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:K,attributeDivisors:B,object:b,attributes:{},index:null}}function d(b,P,K,B){const q=r.attributes,Z=P.attributes;let $=0;const nt=K.getAttributes();for(const W in nt)if(nt[W].location>=0){const mt=q[W];let At=Z[W];if(At===void 0&&(W==="instanceMatrix"&&b.instanceMatrix&&(At=b.instanceMatrix),W==="instanceColor"&&b.instanceColor&&(At=b.instanceColor)),mt===void 0||mt.attribute!==At||At&&mt.data!==At.data)return!0;$++}return r.attributesNum!==$||r.index!==B}function g(b,P,K,B){const q={},Z=P.attributes;let $=0;const nt=K.getAttributes();for(const W in nt)if(nt[W].location>=0){let mt=Z[W];mt===void 0&&(W==="instanceMatrix"&&b.instanceMatrix&&(mt=b.instanceMatrix),W==="instanceColor"&&b.instanceColor&&(mt=b.instanceColor));const At={};At.attribute=mt,mt&&mt.data&&(At.data=mt.data),q[W]=At,$++}r.attributes=q,r.attributesNum=$,r.index=B}function _(){const b=r.newAttributes;for(let P=0,K=b.length;P<K;P++)b[P]=0}function m(b){p(b,0)}function p(b,P){const K=r.newAttributes,B=r.enabledAttributes,q=r.attributeDivisors;K[b]=1,B[b]===0&&(i.enableVertexAttribArray(b),B[b]=1),q[b]!==P&&(i.vertexAttribDivisor(b,P),q[b]=P)}function x(){const b=r.newAttributes,P=r.enabledAttributes;for(let K=0,B=P.length;K<B;K++)P[K]!==b[K]&&(i.disableVertexAttribArray(K),P[K]=0)}function S(b,P,K,B,q,Z,$){$===!0?i.vertexAttribIPointer(b,P,K,q,Z):i.vertexAttribPointer(b,P,K,B,q,Z)}function y(b,P,K,B){_();const q=B.attributes,Z=K.getAttributes(),$=P.defaultAttributeValues;for(const nt in Z){const W=Z[nt];if(W.location>=0){let ct=q[nt];if(ct===void 0&&(nt==="instanceMatrix"&&b.instanceMatrix&&(ct=b.instanceMatrix),nt==="instanceColor"&&b.instanceColor&&(ct=b.instanceColor)),ct!==void 0){const mt=ct.normalized,At=ct.itemSize,Ht=t.get(ct);if(Ht===void 0)continue;const ie=Ht.buffer,Y=Ht.type,it=Ht.bytesPerElement,xt=Y===i.INT||Y===i.UNSIGNED_INT||ct.gpuType===Yl;if(ct.isInterleavedBufferAttribute){const ot=ct.data,Lt=ot.stride,Ut=ct.offset;if(ot.isInstancedInterleavedBuffer){for(let Gt=0;Gt<W.locationSize;Gt++)p(W.location+Gt,ot.meshPerAttribute);b.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=ot.meshPerAttribute*ot.count)}else for(let Gt=0;Gt<W.locationSize;Gt++)m(W.location+Gt);i.bindBuffer(i.ARRAY_BUFFER,ie);for(let Gt=0;Gt<W.locationSize;Gt++)S(W.location+Gt,At/W.locationSize,Y,mt,Lt*it,(Ut+At/W.locationSize*Gt)*it,xt)}else{if(ct.isInstancedBufferAttribute){for(let ot=0;ot<W.locationSize;ot++)p(W.location+ot,ct.meshPerAttribute);b.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=ct.meshPerAttribute*ct.count)}else for(let ot=0;ot<W.locationSize;ot++)m(W.location+ot);i.bindBuffer(i.ARRAY_BUFFER,ie);for(let ot=0;ot<W.locationSize;ot++)S(W.location+ot,At/W.locationSize,Y,mt,At*it,At/W.locationSize*ot*it,xt)}}else if($!==void 0){const mt=$[nt];if(mt!==void 0)switch(mt.length){case 2:i.vertexAttrib2fv(W.location,mt);break;case 3:i.vertexAttrib3fv(W.location,mt);break;case 4:i.vertexAttrib4fv(W.location,mt);break;default:i.vertexAttrib1fv(W.location,mt)}}}}x()}function C(){L();for(const b in n){const P=n[b];for(const K in P){const B=P[K];for(const q in B)h(B[q].object),delete B[q];delete P[K]}delete n[b]}}function A(b){if(n[b.id]===void 0)return;const P=n[b.id];for(const K in P){const B=P[K];for(const q in B)h(B[q].object),delete B[q];delete P[K]}delete n[b.id]}function R(b){for(const P in n){const K=n[P];if(K[b.id]===void 0)continue;const B=K[b.id];for(const q in B)h(B[q].object),delete B[q];delete K[b.id]}}function L(){T(),a=!0,r!==s&&(r=s,c(r.object))}function T(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:L,resetDefaultState:T,dispose:C,releaseStatesOfGeometry:A,releaseStatesOfProgram:R,initAttributes:_,enableAttribute:m,disableUnusedAttributes:x}}function tg(i,t,e){let n;function s(c){n=c}function r(c,h){i.drawArrays(n,c,h),e.update(h,n,1)}function a(c,h,u){u!==0&&(i.drawArraysInstanced(n,c,h,u),e.update(h,n,u))}function o(c,h,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let d=0;for(let g=0;g<u;g++)d+=h[g];e.update(d,n,1)}function l(c,h,u,f){if(u===0)return;const d=t.get("WEBGL_multi_draw");if(d===null)for(let g=0;g<c.length;g++)a(c[g],h[g],f[g]);else{d.multiDrawArraysInstancedWEBGL(n,c,0,h,0,f,0,u);let g=0;for(let _=0;_<u;_++)g+=h[_]*f[_];e.update(g,n,1)}}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function eg(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){const R=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(R){return!(R!==gn&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(R){const L=R===Lr&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(R!==ei&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&R!==Kn&&!L)}function l(R){if(R==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=e.logarithmicDepthBuffer===!0,f=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control"),d=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),x=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),S=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),C=g>0,A=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reverseDepthBuffer:f,maxTextures:d,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:x,maxVaryings:S,maxFragmentUniforms:y,vertexTextures:C,maxSamples:A}}function ng(i){const t=this;let e=null,n=0,s=!1,r=!1;const a=new Hi,o=new Bt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){const d=u.length!==0||f||n!==0||s;return s=f,n=u.length,d},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,f){e=h(u,f,0)},this.setState=function(u,f,d){const g=u.clippingPlanes,_=u.clipIntersection,m=u.clipShadows,p=i.get(u);if(!s||g===null||g.length===0||r&&!m)r?h(null):c();else{const x=r?0:n,S=x*4;let y=p.clippingState||null;l.value=y,y=h(g,f,S,d);for(let C=0;C!==S;++C)y[C]=e[C];p.clippingState=y,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=x}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(u,f,d,g){const _=u!==null?u.length:0;let m=null;if(_!==0){if(m=l.value,g!==!0||m===null){const p=d+_*4,x=f.matrixWorldInverse;o.getNormalMatrix(x),(m===null||m.length<p)&&(m=new Float32Array(p));for(let S=0,y=d;S!==_;++S,y+=4)a.copy(u[S]).applyMatrix4(x,o),a.normal.toArray(m,y),m[y+3]=a.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,m}}function ig(i){let t=new WeakMap;function e(a,o){return o===el?a.mapping=Ds:o===nl&&(a.mapping=Is),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===el||o===nl)if(t.has(a)){const l=t.get(a).texture;return e(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new pp(l.height);return c.fromEquirectangularTexture(i,a),t.set(a,c),a.addEventListener("dispose",s),e(c.texture,a.mapping)}else return null}}return a}function s(a){const o=a.target;o.removeEventListener("dispose",s);const l=t.get(o);l!==void 0&&(t.delete(o),l.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}class sg extends Vu{constructor(t=-1,e=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-t,a=n+t,o=s+e,l=s-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}const Es=4,Yc=[.125,.215,.35,.446,.526,.582],Wi=20,Eo=new sg,Kc=new ee;let bo=null,To=0,Ao=0,wo=!1;const Gi=(1+Math.sqrt(5))/2,gs=1/Gi,jc=[new I(-Gi,gs,0),new I(Gi,gs,0),new I(-gs,0,Gi),new I(gs,0,Gi),new I(0,Gi,-gs),new I(0,Gi,gs),new I(-1,1,-1),new I(1,1,-1),new I(-1,1,1),new I(1,1,1)];class Zc{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,s=100){bo=this._renderer.getRenderTarget(),To=this._renderer.getActiveCubeFace(),Ao=this._renderer.getActiveMipmapLevel(),wo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,n,s,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=th(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Qc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(bo,To,Ao),this._renderer.xr.enabled=wo,t.scissorTest=!1,aa(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Ds||t.mapping===Is?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),bo=this._renderer.getRenderTarget(),To=this._renderer.getActiveCubeFace(),Ao=this._renderer.getActiveMipmapLevel(),wo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:an,minFilter:an,generateMipmaps:!1,type:Lr,format:gn,colorSpace:zs,depthBuffer:!1},s=Jc(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Jc(t,e,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=rg(r)),this._blurMaterial=ag(r,t,e)}return s}_compileMaterial(t){const e=new be(this._lodPlanes[0],t);this._renderer.compile(e,Eo)}_sceneToCubeUV(t,e,n,s){const o=new pn(90,1,e,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,f=h.toneMapping;h.getClearColor(Kc),h.toneMapping=Si,h.autoClear=!1;const d=new bi({name:"PMREM.Background",side:je,depthWrite:!1,depthTest:!1}),g=new be(new wi,d);let _=!1;const m=t.background;m?m.isColor&&(d.color.copy(m),t.background=null,_=!0):(d.color.copy(Kc),_=!0);for(let p=0;p<6;p++){const x=p%3;x===0?(o.up.set(0,l[p],0),o.lookAt(c[p],0,0)):x===1?(o.up.set(0,0,l[p]),o.lookAt(0,c[p],0)):(o.up.set(0,l[p],0),o.lookAt(0,0,c[p]));const S=this._cubeSize;aa(s,x*S,p>2?S:0,S,S),h.setRenderTarget(s),_&&h.render(g,o),h.render(t,o)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=f,h.autoClear=u,t.background=m}_textureToCubeUV(t,e){const n=this._renderer,s=t.mapping===Ds||t.mapping===Is;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=th()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Qc());const r=s?this._cubemapMaterial:this._equirectMaterial,a=new be(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=t;const l=this._cubeSize;aa(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(a,Eo)}_applyPMREM(t){const e=this._renderer,n=e.autoClear;e.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=jc[(s-r-1)%jc.length];this._blur(t,r-1,r,a,o)}e.autoClear=n}_blur(t,e,n,s,r){const a=this._pingPongRenderTarget;this._halfBlur(t,a,e,n,s,"latitudinal",r),this._halfBlur(a,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new be(this._lodPlanes[s],c),f=c.uniforms,d=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*d):2*Math.PI/(2*Wi-1),_=r/g,m=isFinite(r)?1+Math.floor(h*_):Wi;m>Wi&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Wi}`);const p=[];let x=0;for(let R=0;R<Wi;++R){const L=R/_,T=Math.exp(-L*L/2);p.push(T),R===0?x+=T:R<m&&(x+=2*T)}for(let R=0;R<p.length;R++)p[R]=p[R]/x;f.envMap.value=t.texture,f.samples.value=m,f.weights.value=p,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);const{_lodMax:S}=this;f.dTheta.value=g,f.mipInt.value=S-n;const y=this._sizeLods[s],C=3*y*(s>S-Es?s-S+Es:0),A=4*(this._cubeSize-y);aa(e,C,A,3*y,2*y),l.setRenderTarget(e),l.render(u,Eo)}}function rg(i){const t=[],e=[],n=[];let s=i;const r=i-Es+1+Yc.length;for(let a=0;a<r;a++){const o=Math.pow(2,s);e.push(o);let l=1/o;a>i-Es?l=Yc[a-i+Es-1]:a===0&&(l=0),n.push(l);const c=1/(o-2),h=-c,u=1+c,f=[h,h,u,h,u,u,h,h,u,u,h,u],d=6,g=6,_=3,m=2,p=1,x=new Float32Array(_*g*d),S=new Float32Array(m*g*d),y=new Float32Array(p*g*d);for(let A=0;A<d;A++){const R=A%3*2/3-1,L=A>2?0:-1,T=[R,L,0,R+2/3,L,0,R+2/3,L+1,0,R,L,0,R+2/3,L+1,0,R,L+1,0];x.set(T,_*g*A),S.set(f,m*g*A);const b=[A,A,A,A,A,A];y.set(b,p*g*A)}const C=new De;C.setAttribute("position",new Pe(x,_)),C.setAttribute("uv",new Pe(S,m)),C.setAttribute("faceIndex",new Pe(y,p)),t.push(C),s>Es&&s--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function Jc(i,t,e){const n=new Ji(i,t,e);return n.texture.mapping=Wa,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function aa(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function ag(i,t,e){const n=new Float32Array(Wi),s=new I(0,1,0);return new Ln({name:"SphericalGaussianBlur",defines:{n:Wi,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:ec(),fragmentShader:`

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
		`,blending:yi,depthTest:!1,depthWrite:!1})}function Qc(){return new Ln({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ec(),fragmentShader:`

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
		`,blending:yi,depthTest:!1,depthWrite:!1})}function th(){return new Ln({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ec(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:yi,depthTest:!1,depthWrite:!1})}function ec(){return`

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
	`}function og(i){let t=new WeakMap,e=null;function n(o){if(o&&o.isTexture){const l=o.mapping,c=l===el||l===nl,h=l===Ds||l===Is;if(c||h){let u=t.get(o);const f=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==f)return e===null&&(e=new Zc(i)),u=c?e.fromEquirectangular(o,u):e.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),u.texture;if(u!==void 0)return u.texture;{const d=o.image;return c&&d&&d.height>0||h&&d&&s(d)?(e===null&&(e=new Zc(i)),u=c?e.fromEquirectangular(o):e.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),o.addEventListener("dispose",r),u.texture):null}}}return o}function s(o){let l=0;const c=6;for(let h=0;h<c;h++)o[h]!==void 0&&l++;return l===c}function r(o){const l=o.target;l.removeEventListener("dispose",r);const c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function a(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:a}}function lg(i){const t={};function e(n){if(t[n]!==void 0)return t[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const s=e(n);return s===null&&lr("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function cg(i,t,e,n){const s={},r=new WeakMap;function a(u){const f=u.target;f.index!==null&&t.remove(f.index);for(const g in f.attributes)t.remove(f.attributes[g]);for(const g in f.morphAttributes){const _=f.morphAttributes[g];for(let m=0,p=_.length;m<p;m++)t.remove(_[m])}f.removeEventListener("dispose",a),delete s[f.id];const d=r.get(f);d&&(t.remove(d),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,e.memory.geometries--}function o(u,f){return s[f.id]===!0||(f.addEventListener("dispose",a),s[f.id]=!0,e.memory.geometries++),f}function l(u){const f=u.attributes;for(const g in f)t.update(f[g],i.ARRAY_BUFFER);const d=u.morphAttributes;for(const g in d){const _=d[g];for(let m=0,p=_.length;m<p;m++)t.update(_[m],i.ARRAY_BUFFER)}}function c(u){const f=[],d=u.index,g=u.attributes.position;let _=0;if(d!==null){const x=d.array;_=d.version;for(let S=0,y=x.length;S<y;S+=3){const C=x[S+0],A=x[S+1],R=x[S+2];f.push(C,A,A,R,R,C)}}else if(g!==void 0){const x=g.array;_=g.version;for(let S=0,y=x.length/3-1;S<y;S+=3){const C=S+0,A=S+1,R=S+2;f.push(C,A,A,R,R,C)}}else return;const m=new(Uu(f)?Hu:Bu)(f,1);m.version=_;const p=r.get(u);p&&t.remove(p),r.set(u,m)}function h(u){const f=r.get(u);if(f){const d=u.index;d!==null&&f.version<d.version&&c(u)}else c(u);return r.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function hg(i,t,e){let n;function s(f){n=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function l(f,d){i.drawElements(n,d,r,f*a),e.update(d,n,1)}function c(f,d,g){g!==0&&(i.drawElementsInstanced(n,d,r,f*a,g),e.update(d,n,g))}function h(f,d,g){if(g===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,f,0,g);let m=0;for(let p=0;p<g;p++)m+=d[p];e.update(m,n,1)}function u(f,d,g,_){if(g===0)return;const m=t.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<f.length;p++)c(f[p]/a,d[p],_[p]);else{m.multiDrawElementsInstancedWEBGL(n,d,0,r,f,0,_,0,g);let p=0;for(let x=0;x<g;x++)p+=d[x]*_[x];e.update(p,n,1)}}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function ug(i){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case i.TRIANGLES:e.triangles+=o*(r/3);break;case i.LINES:e.lines+=o*(r/2);break;case i.LINE_STRIP:e.lines+=o*(r-1);break;case i.LINE_LOOP:e.lines+=o*r;break;case i.POINTS:e.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function fg(i,t,e){const n=new WeakMap,s=new Re;function r(a,o,l){const c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0;let f=n.get(o);if(f===void 0||f.count!==u){let T=function(){R.dispose(),n.delete(o),o.removeEventListener("dispose",T)};f!==void 0&&f.texture.dispose();const d=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,_=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],x=o.morphAttributes.color||[];let S=0;d===!0&&(S=1),g===!0&&(S=2),_===!0&&(S=3);let y=o.attributes.position.count*S,C=1;y>t.maxTextureSize&&(C=Math.ceil(y/t.maxTextureSize),y=t.maxTextureSize);const A=new Float32Array(y*C*4*u),R=new ku(A,y,C,u);R.type=Kn,R.needsUpdate=!0;const L=S*4;for(let b=0;b<u;b++){const P=m[b],K=p[b],B=x[b],q=y*C*4*b;for(let Z=0;Z<P.count;Z++){const $=Z*L;d===!0&&(s.fromBufferAttribute(P,Z),A[q+$+0]=s.x,A[q+$+1]=s.y,A[q+$+2]=s.z,A[q+$+3]=0),g===!0&&(s.fromBufferAttribute(K,Z),A[q+$+4]=s.x,A[q+$+5]=s.y,A[q+$+6]=s.z,A[q+$+7]=0),_===!0&&(s.fromBufferAttribute(B,Z),A[q+$+8]=s.x,A[q+$+9]=s.y,A[q+$+10]=s.z,A[q+$+11]=B.itemSize===4?s.w:1)}}f={count:u,texture:R,size:new Xt(y,C)},n.set(o,f),o.addEventListener("dispose",T)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,e);else{let d=0;for(let _=0;_<c.length;_++)d+=c[_];const g=o.morphTargetsRelative?1:1-d;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",f.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",f.size)}return{update:r}}function dg(i,t,e,n){let s=new WeakMap;function r(l){const c=n.render.frame,h=l.geometry,u=t.get(l,h);if(s.get(u)!==c&&(t.update(u),s.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),s.get(l)!==c&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const f=l.skeleton;s.get(f)!==c&&(f.update(),s.set(f,c))}return u}function a(){s=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:a}}class qu extends Ve{constructor(t,e,n,s,r,a,o,l,c,h=Rs){if(h!==Rs&&h!==Us)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===Rs&&(n=Zi),n===void 0&&h===Us&&(n=Ns),super(null,s,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=o!==void 0?o:Ze,this.minFilter=l!==void 0?l:Ze,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}const Yu=new Ve,eh=new qu(1,1),Ku=new ku,ju=new Jd,Zu=new Wu,nh=[],ih=[],sh=new Float32Array(16),rh=new Float32Array(9),ah=new Float32Array(4);function Gs(i,t,e){const n=i[0];if(n<=0||n>0)return i;const s=t*e;let r=nh[s];if(r===void 0&&(r=new Float32Array(s),nh[s]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,i[a].toArray(r,o)}return r}function Ne(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Ue(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function $a(i,t){let e=ih[t];e===void 0&&(e=new Int32Array(t),ih[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function pg(i,t){const e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function mg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ne(e,t))return;i.uniform2fv(this.addr,t),Ue(e,t)}}function gg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Ne(e,t))return;i.uniform3fv(this.addr,t),Ue(e,t)}}function _g(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ne(e,t))return;i.uniform4fv(this.addr,t),Ue(e,t)}}function vg(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ne(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Ue(e,t)}else{if(Ne(e,n))return;ah.set(n),i.uniformMatrix2fv(this.addr,!1,ah),Ue(e,n)}}function xg(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ne(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Ue(e,t)}else{if(Ne(e,n))return;rh.set(n),i.uniformMatrix3fv(this.addr,!1,rh),Ue(e,n)}}function Mg(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ne(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Ue(e,t)}else{if(Ne(e,n))return;sh.set(n),i.uniformMatrix4fv(this.addr,!1,sh),Ue(e,n)}}function yg(i,t){const e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function Sg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ne(e,t))return;i.uniform2iv(this.addr,t),Ue(e,t)}}function Eg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ne(e,t))return;i.uniform3iv(this.addr,t),Ue(e,t)}}function bg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ne(e,t))return;i.uniform4iv(this.addr,t),Ue(e,t)}}function Tg(i,t){const e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function Ag(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ne(e,t))return;i.uniform2uiv(this.addr,t),Ue(e,t)}}function wg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ne(e,t))return;i.uniform3uiv(this.addr,t),Ue(e,t)}}function Rg(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ne(e,t))return;i.uniform4uiv(this.addr,t),Ue(e,t)}}function Cg(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(eh.compareFunction=Nu,r=eh):r=Yu,e.setTexture2D(t||r,s)}function Lg(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||ju,s)}function Pg(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||Zu,s)}function Dg(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||Ku,s)}function Ig(i){switch(i){case 5126:return pg;case 35664:return mg;case 35665:return gg;case 35666:return _g;case 35674:return vg;case 35675:return xg;case 35676:return Mg;case 5124:case 35670:return yg;case 35667:case 35671:return Sg;case 35668:case 35672:return Eg;case 35669:case 35673:return bg;case 5125:return Tg;case 36294:return Ag;case 36295:return wg;case 36296:return Rg;case 35678:case 36198:case 36298:case 36306:case 35682:return Cg;case 35679:case 36299:case 36307:return Lg;case 35680:case 36300:case 36308:case 36293:return Pg;case 36289:case 36303:case 36311:case 36292:return Dg}}function Ng(i,t){i.uniform1fv(this.addr,t)}function Ug(i,t){const e=Gs(t,this.size,2);i.uniform2fv(this.addr,e)}function Og(i,t){const e=Gs(t,this.size,3);i.uniform3fv(this.addr,e)}function kg(i,t){const e=Gs(t,this.size,4);i.uniform4fv(this.addr,e)}function Fg(i,t){const e=Gs(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function zg(i,t){const e=Gs(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function Bg(i,t){const e=Gs(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function Hg(i,t){i.uniform1iv(this.addr,t)}function Gg(i,t){i.uniform2iv(this.addr,t)}function Vg(i,t){i.uniform3iv(this.addr,t)}function Wg(i,t){i.uniform4iv(this.addr,t)}function Xg(i,t){i.uniform1uiv(this.addr,t)}function $g(i,t){i.uniform2uiv(this.addr,t)}function qg(i,t){i.uniform3uiv(this.addr,t)}function Yg(i,t){i.uniform4uiv(this.addr,t)}function Kg(i,t,e){const n=this.cache,s=t.length,r=$a(e,s);Ne(n,r)||(i.uniform1iv(this.addr,r),Ue(n,r));for(let a=0;a!==s;++a)e.setTexture2D(t[a]||Yu,r[a])}function jg(i,t,e){const n=this.cache,s=t.length,r=$a(e,s);Ne(n,r)||(i.uniform1iv(this.addr,r),Ue(n,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||ju,r[a])}function Zg(i,t,e){const n=this.cache,s=t.length,r=$a(e,s);Ne(n,r)||(i.uniform1iv(this.addr,r),Ue(n,r));for(let a=0;a!==s;++a)e.setTextureCube(t[a]||Zu,r[a])}function Jg(i,t,e){const n=this.cache,s=t.length,r=$a(e,s);Ne(n,r)||(i.uniform1iv(this.addr,r),Ue(n,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||Ku,r[a])}function Qg(i){switch(i){case 5126:return Ng;case 35664:return Ug;case 35665:return Og;case 35666:return kg;case 35674:return Fg;case 35675:return zg;case 35676:return Bg;case 5124:case 35670:return Hg;case 35667:case 35671:return Gg;case 35668:case 35672:return Vg;case 35669:case 35673:return Wg;case 5125:return Xg;case 36294:return $g;case 36295:return qg;case 36296:return Yg;case 35678:case 36198:case 36298:case 36306:case 35682:return Kg;case 35679:case 36299:case 36307:return jg;case 35680:case 36300:case 36308:case 36293:return Zg;case 36289:case 36303:case 36311:case 36292:return Jg}}class t_{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=Ig(e.type)}}class e_{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Qg(e.type)}}class n_{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(t,e[o.id],n)}}}const Ro=/(\w+)(\])?(\[|\.)?/g;function oh(i,t){i.seq.push(t),i.map[t.id]=t}function i_(i,t,e){const n=i.name,s=n.length;for(Ro.lastIndex=0;;){const r=Ro.exec(n),a=Ro.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){oh(e,c===void 0?new t_(o,i,t):new e_(o,i,t));break}else{let u=e.map[o];u===void 0&&(u=new n_(o),oh(e,u)),e=u}}}class Ca{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=t.getActiveUniform(e,s),a=t.getUniformLocation(e,r.name);i_(r,a,this)}}setValue(t,e,n,s){const r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){const s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,a=e.length;r!==a;++r){const o=e[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,e){const n=[];for(let s=0,r=t.length;s!==r;++s){const a=t[s];a.id in e&&n.push(a)}return n}}function lh(i,t,e){const n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}const s_=37297;let r_=0;function a_(i,t){const e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){const o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}const ch=new Bt;function o_(i){Qt._getMatrix(ch,Qt.workingColorSpace,i);const t=`mat3( ${ch.elements.map(e=>e.toFixed(4))} )`;switch(Qt.getTransfer(i)){case Xa:return[t,"LinearTransferOETF"];case ce:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function hh(i,t,e){const n=i.getShaderParameter(t,i.COMPILE_STATUS),s=i.getShaderInfoLog(t).trim();if(n&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const a=parseInt(r[1]);return e.toUpperCase()+`

`+s+`

`+a_(i.getShaderSource(t),a)}else return s}function l_(i,t){const e=o_(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}function c_(i,t){let e;switch(t){case bd:e="Linear";break;case Td:e="Reinhard";break;case Ad:e="Cineon";break;case wd:e="ACESFilmic";break;case Cd:e="AgX";break;case Ld:e="Neutral";break;case Rd:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const oa=new I;function h_(){Qt.getLuminanceCoefficients(oa);const i=oa.x.toFixed(4),t=oa.y.toFixed(4),e=oa.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function u_(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(cr).join(`
`)}function f_(i){const t=[];for(const e in i){const n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function d_(i,t){const e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(t,s),a=r.name;let o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:i.getAttribLocation(t,a),locationSize:o}}return e}function cr(i){return i!==""}function uh(i,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function fh(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const p_=/^[ \t]*#include +<([\w\d./]+)>/gm;function Dl(i){return i.replace(p_,g_)}const m_=new Map;function g_(i,t){let e=Wt[t];if(e===void 0){const n=m_.get(t);if(n!==void 0)e=Wt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return Dl(e)}const __=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function dh(i){return i.replace(__,v_)}function v_(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function ph(i){let t=`precision ${i.precision} float;
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
#define LOW_PRECISION`),t}function x_(i){let t="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===yu?t="SHADOWMAP_TYPE_PCF":i.shadowMapType===id?t="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===qn&&(t="SHADOWMAP_TYPE_VSM"),t}function M_(i){let t="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Ds:case Is:t="ENVMAP_TYPE_CUBE";break;case Wa:t="ENVMAP_TYPE_CUBE_UV";break}return t}function y_(i){let t="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case Is:t="ENVMAP_MODE_REFRACTION";break}return t}function S_(i){let t="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Su:t="ENVMAP_BLENDING_MULTIPLY";break;case Sd:t="ENVMAP_BLENDING_MIX";break;case Ed:t="ENVMAP_BLENDING_ADD";break}return t}function E_(i){const t=i.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:n,maxMip:e}}function b_(i,t,e,n){const s=i.getContext(),r=e.defines;let a=e.vertexShader,o=e.fragmentShader;const l=x_(e),c=M_(e),h=y_(e),u=S_(e),f=E_(e),d=u_(e),g=f_(r),_=s.createProgram();let m,p,x=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(cr).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(cr).join(`
`),p.length>0&&(p+=`
`)):(m=[ph(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(cr).join(`
`),p=[ph(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Si?"#define TONE_MAPPING":"",e.toneMapping!==Si?Wt.tonemapping_pars_fragment:"",e.toneMapping!==Si?c_("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Wt.colorspace_pars_fragment,l_("linearToOutputTexel",e.outputColorSpace),h_(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(cr).join(`
`)),a=Dl(a),a=uh(a,e),a=fh(a,e),o=Dl(o),o=uh(o,e),o=fh(o,e),a=dh(a),o=dh(o),e.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",e.glslVersion===wc?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===wc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const S=x+m+a,y=x+p+o,C=lh(s,s.VERTEX_SHADER,S),A=lh(s,s.FRAGMENT_SHADER,y);s.attachShader(_,C),s.attachShader(_,A),e.index0AttributeName!==void 0?s.bindAttribLocation(_,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function R(P){if(i.debug.checkShaderErrors){const K=s.getProgramInfoLog(_).trim(),B=s.getShaderInfoLog(C).trim(),q=s.getShaderInfoLog(A).trim();let Z=!0,$=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(Z=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,_,C,A);else{const nt=hh(s,C,"vertex"),W=hh(s,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+K+`
`+nt+`
`+W)}else K!==""?console.warn("THREE.WebGLProgram: Program Info Log:",K):(B===""||q==="")&&($=!1);$&&(P.diagnostics={runnable:Z,programLog:K,vertexShader:{log:B,prefix:m},fragmentShader:{log:q,prefix:p}})}s.deleteShader(C),s.deleteShader(A),L=new Ca(s,_),T=d_(s,_)}let L;this.getUniforms=function(){return L===void 0&&R(this),L};let T;this.getAttributes=function(){return T===void 0&&R(this),T};let b=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return b===!1&&(b=s.getProgramParameter(_,s_)),b},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=r_++,this.cacheKey=t,this.usedTimes=1,this.program=_,this.vertexShader=C,this.fragmentShader=A,this}let T_=0;class A_{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,n=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(t);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new w_(t),e.set(t,n)),n}}class w_{constructor(t){this.id=T_++,this.code=t,this.usedTimes=0}}function R_(i,t,e,n,s,r,a){const o=new Fu,l=new A_,c=new Set,h=[],u=s.logarithmicDepthBuffer,f=s.vertexTextures;let d=s.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(T){return c.add(T),T===0?"uv":`uv${T}`}function m(T,b,P,K,B){const q=K.fog,Z=B.geometry,$=T.isMeshStandardMaterial?K.environment:null,nt=(T.isMeshStandardMaterial?e:t).get(T.envMap||$),W=nt&&nt.mapping===Wa?nt.image.height:null,ct=g[T.type];T.precision!==null&&(d=s.getMaxPrecision(T.precision),d!==T.precision&&console.warn("THREE.WebGLProgram.getParameters:",T.precision,"not supported, using",d,"instead."));const mt=Z.morphAttributes.position||Z.morphAttributes.normal||Z.morphAttributes.color,At=mt!==void 0?mt.length:0;let Ht=0;Z.morphAttributes.position!==void 0&&(Ht=1),Z.morphAttributes.normal!==void 0&&(Ht=2),Z.morphAttributes.color!==void 0&&(Ht=3);let ie,Y,it,xt;if(ct){const le=Nn[ct];ie=le.vertexShader,Y=le.fragmentShader}else ie=T.vertexShader,Y=T.fragmentShader,l.update(T),it=l.getVertexShaderID(T),xt=l.getFragmentShaderID(T);const ot=i.getRenderTarget(),Lt=i.state.buffers.depth.getReversed(),Ut=B.isInstancedMesh===!0,Gt=B.isBatchedMesh===!0,Me=!!T.map,Zt=!!T.matcap,Ae=!!nt,k=!!T.aoMap,cn=!!T.lightMap,Yt=!!T.bumpMap,Kt=!!T.normalMap,Dt=!!T.displacementMap,me=!!T.emissiveMap,Pt=!!T.metalnessMap,w=!!T.roughnessMap,M=T.anisotropy>0,z=T.clearcoat>0,J=T.dispersion>0,et=T.iridescence>0,j=T.sheen>0,wt=T.transmission>0,ut=M&&!!T.anisotropyMap,gt=z&&!!T.clearcoatMap,Jt=z&&!!T.clearcoatNormalMap,st=z&&!!T.clearcoatRoughnessMap,_t=et&&!!T.iridescenceMap,It=et&&!!T.iridescenceThicknessMap,Ot=j&&!!T.sheenColorMap,vt=j&&!!T.sheenRoughnessMap,jt=!!T.specularMap,Vt=!!T.specularColorMap,de=!!T.specularIntensityMap,D=wt&&!!T.transmissionMap,ht=wt&&!!T.thicknessMap,X=!!T.gradientMap,Q=!!T.alphaMap,pt=T.alphaTest>0,ft=!!T.alphaHash,Ft=!!T.extensions;let Ee=Si;T.toneMapped&&(ot===null||ot.isXRRenderTarget===!0)&&(Ee=i.toneMapping);const ze={shaderID:ct,shaderType:T.type,shaderName:T.name,vertexShader:ie,fragmentShader:Y,defines:T.defines,customVertexShaderID:it,customFragmentShaderID:xt,isRawShaderMaterial:T.isRawShaderMaterial===!0,glslVersion:T.glslVersion,precision:d,batching:Gt,batchingColor:Gt&&B._colorsTexture!==null,instancing:Ut,instancingColor:Ut&&B.instanceColor!==null,instancingMorph:Ut&&B.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:ot===null?i.outputColorSpace:ot.isXRRenderTarget===!0?ot.texture.colorSpace:zs,alphaToCoverage:!!T.alphaToCoverage,map:Me,matcap:Zt,envMap:Ae,envMapMode:Ae&&nt.mapping,envMapCubeUVHeight:W,aoMap:k,lightMap:cn,bumpMap:Yt,normalMap:Kt,displacementMap:f&&Dt,emissiveMap:me,normalMapObjectSpace:Kt&&T.normalMapType===Ud,normalMapTangentSpace:Kt&&T.normalMapType===Nd,metalnessMap:Pt,roughnessMap:w,anisotropy:M,anisotropyMap:ut,clearcoat:z,clearcoatMap:gt,clearcoatNormalMap:Jt,clearcoatRoughnessMap:st,dispersion:J,iridescence:et,iridescenceMap:_t,iridescenceThicknessMap:It,sheen:j,sheenColorMap:Ot,sheenRoughnessMap:vt,specularMap:jt,specularColorMap:Vt,specularIntensityMap:de,transmission:wt,transmissionMap:D,thicknessMap:ht,gradientMap:X,opaque:T.transparent===!1&&T.blending===ws&&T.alphaToCoverage===!1,alphaMap:Q,alphaTest:pt,alphaHash:ft,combine:T.combine,mapUv:Me&&_(T.map.channel),aoMapUv:k&&_(T.aoMap.channel),lightMapUv:cn&&_(T.lightMap.channel),bumpMapUv:Yt&&_(T.bumpMap.channel),normalMapUv:Kt&&_(T.normalMap.channel),displacementMapUv:Dt&&_(T.displacementMap.channel),emissiveMapUv:me&&_(T.emissiveMap.channel),metalnessMapUv:Pt&&_(T.metalnessMap.channel),roughnessMapUv:w&&_(T.roughnessMap.channel),anisotropyMapUv:ut&&_(T.anisotropyMap.channel),clearcoatMapUv:gt&&_(T.clearcoatMap.channel),clearcoatNormalMapUv:Jt&&_(T.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:st&&_(T.clearcoatRoughnessMap.channel),iridescenceMapUv:_t&&_(T.iridescenceMap.channel),iridescenceThicknessMapUv:It&&_(T.iridescenceThicknessMap.channel),sheenColorMapUv:Ot&&_(T.sheenColorMap.channel),sheenRoughnessMapUv:vt&&_(T.sheenRoughnessMap.channel),specularMapUv:jt&&_(T.specularMap.channel),specularColorMapUv:Vt&&_(T.specularColorMap.channel),specularIntensityMapUv:de&&_(T.specularIntensityMap.channel),transmissionMapUv:D&&_(T.transmissionMap.channel),thicknessMapUv:ht&&_(T.thicknessMap.channel),alphaMapUv:Q&&_(T.alphaMap.channel),vertexTangents:!!Z.attributes.tangent&&(Kt||M),vertexColors:T.vertexColors,vertexAlphas:T.vertexColors===!0&&!!Z.attributes.color&&Z.attributes.color.itemSize===4,pointsUvs:B.isPoints===!0&&!!Z.attributes.uv&&(Me||Q),fog:!!q,useFog:T.fog===!0,fogExp2:!!q&&q.isFogExp2,flatShading:T.flatShading===!0,sizeAttenuation:T.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:Lt,skinning:B.isSkinnedMesh===!0,morphTargets:Z.morphAttributes.position!==void 0,morphNormals:Z.morphAttributes.normal!==void 0,morphColors:Z.morphAttributes.color!==void 0,morphTargetsCount:At,morphTextureStride:Ht,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:T.dithering,shadowMapEnabled:i.shadowMap.enabled&&P.length>0,shadowMapType:i.shadowMap.type,toneMapping:Ee,decodeVideoTexture:Me&&T.map.isVideoTexture===!0&&Qt.getTransfer(T.map.colorSpace)===ce,decodeVideoTextureEmissive:me&&T.emissiveMap.isVideoTexture===!0&&Qt.getTransfer(T.emissiveMap.colorSpace)===ce,premultipliedAlpha:T.premultipliedAlpha,doubleSided:T.side===mn,flipSided:T.side===je,useDepthPacking:T.depthPacking>=0,depthPacking:T.depthPacking||0,index0AttributeName:T.index0AttributeName,extensionClipCullDistance:Ft&&T.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ft&&T.extensions.multiDraw===!0||Gt)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:T.customProgramCacheKey()};return ze.vertexUv1s=c.has(1),ze.vertexUv2s=c.has(2),ze.vertexUv3s=c.has(3),c.clear(),ze}function p(T){const b=[];if(T.shaderID?b.push(T.shaderID):(b.push(T.customVertexShaderID),b.push(T.customFragmentShaderID)),T.defines!==void 0)for(const P in T.defines)b.push(P),b.push(T.defines[P]);return T.isRawShaderMaterial===!1&&(x(b,T),S(b,T),b.push(i.outputColorSpace)),b.push(T.customProgramCacheKey),b.join()}function x(T,b){T.push(b.precision),T.push(b.outputColorSpace),T.push(b.envMapMode),T.push(b.envMapCubeUVHeight),T.push(b.mapUv),T.push(b.alphaMapUv),T.push(b.lightMapUv),T.push(b.aoMapUv),T.push(b.bumpMapUv),T.push(b.normalMapUv),T.push(b.displacementMapUv),T.push(b.emissiveMapUv),T.push(b.metalnessMapUv),T.push(b.roughnessMapUv),T.push(b.anisotropyMapUv),T.push(b.clearcoatMapUv),T.push(b.clearcoatNormalMapUv),T.push(b.clearcoatRoughnessMapUv),T.push(b.iridescenceMapUv),T.push(b.iridescenceThicknessMapUv),T.push(b.sheenColorMapUv),T.push(b.sheenRoughnessMapUv),T.push(b.specularMapUv),T.push(b.specularColorMapUv),T.push(b.specularIntensityMapUv),T.push(b.transmissionMapUv),T.push(b.thicknessMapUv),T.push(b.combine),T.push(b.fogExp2),T.push(b.sizeAttenuation),T.push(b.morphTargetsCount),T.push(b.morphAttributeCount),T.push(b.numDirLights),T.push(b.numPointLights),T.push(b.numSpotLights),T.push(b.numSpotLightMaps),T.push(b.numHemiLights),T.push(b.numRectAreaLights),T.push(b.numDirLightShadows),T.push(b.numPointLightShadows),T.push(b.numSpotLightShadows),T.push(b.numSpotLightShadowsWithMaps),T.push(b.numLightProbes),T.push(b.shadowMapType),T.push(b.toneMapping),T.push(b.numClippingPlanes),T.push(b.numClipIntersection),T.push(b.depthPacking)}function S(T,b){o.disableAll(),b.supportsVertexTextures&&o.enable(0),b.instancing&&o.enable(1),b.instancingColor&&o.enable(2),b.instancingMorph&&o.enable(3),b.matcap&&o.enable(4),b.envMap&&o.enable(5),b.normalMapObjectSpace&&o.enable(6),b.normalMapTangentSpace&&o.enable(7),b.clearcoat&&o.enable(8),b.iridescence&&o.enable(9),b.alphaTest&&o.enable(10),b.vertexColors&&o.enable(11),b.vertexAlphas&&o.enable(12),b.vertexUv1s&&o.enable(13),b.vertexUv2s&&o.enable(14),b.vertexUv3s&&o.enable(15),b.vertexTangents&&o.enable(16),b.anisotropy&&o.enable(17),b.alphaHash&&o.enable(18),b.batching&&o.enable(19),b.dispersion&&o.enable(20),b.batchingColor&&o.enable(21),T.push(o.mask),o.disableAll(),b.fog&&o.enable(0),b.useFog&&o.enable(1),b.flatShading&&o.enable(2),b.logarithmicDepthBuffer&&o.enable(3),b.reverseDepthBuffer&&o.enable(4),b.skinning&&o.enable(5),b.morphTargets&&o.enable(6),b.morphNormals&&o.enable(7),b.morphColors&&o.enable(8),b.premultipliedAlpha&&o.enable(9),b.shadowMapEnabled&&o.enable(10),b.doubleSided&&o.enable(11),b.flipSided&&o.enable(12),b.useDepthPacking&&o.enable(13),b.dithering&&o.enable(14),b.transmission&&o.enable(15),b.sheen&&o.enable(16),b.opaque&&o.enable(17),b.pointsUvs&&o.enable(18),b.decodeVideoTexture&&o.enable(19),b.decodeVideoTextureEmissive&&o.enable(20),b.alphaToCoverage&&o.enable(21),T.push(o.mask)}function y(T){const b=g[T.type];let P;if(b){const K=Nn[b];P=hp.clone(K.uniforms)}else P=T.uniforms;return P}function C(T,b){let P;for(let K=0,B=h.length;K<B;K++){const q=h[K];if(q.cacheKey===b){P=q,++P.usedTimes;break}}return P===void 0&&(P=new b_(i,b,T,r),h.push(P)),P}function A(T){if(--T.usedTimes===0){const b=h.indexOf(T);h[b]=h[h.length-1],h.pop(),T.destroy()}}function R(T){l.remove(T)}function L(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:y,acquireProgram:C,releaseProgram:A,releaseShaderCache:R,programs:h,dispose:L}}function C_(){let i=new WeakMap;function t(a){return i.has(a)}function e(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function L_(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.z!==t.z?i.z-t.z:i.id-t.id}function mh(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function gh(){const i=[];let t=0;const e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function a(u,f,d,g,_,m){let p=i[t];return p===void 0?(p={id:u.id,object:u,geometry:f,material:d,groupOrder:g,renderOrder:u.renderOrder,z:_,group:m},i[t]=p):(p.id=u.id,p.object=u,p.geometry=f,p.material=d,p.groupOrder=g,p.renderOrder=u.renderOrder,p.z=_,p.group=m),t++,p}function o(u,f,d,g,_,m){const p=a(u,f,d,g,_,m);d.transmission>0?n.push(p):d.transparent===!0?s.push(p):e.push(p)}function l(u,f,d,g,_,m){const p=a(u,f,d,g,_,m);d.transmission>0?n.unshift(p):d.transparent===!0?s.unshift(p):e.unshift(p)}function c(u,f){e.length>1&&e.sort(u||L_),n.length>1&&n.sort(f||mh),s.length>1&&s.sort(f||mh)}function h(){for(let u=t,f=i.length;u<f;u++){const d=i[u];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:o,unshift:l,finish:h,sort:c}}function P_(){let i=new WeakMap;function t(n,s){const r=i.get(n);let a;return r===void 0?(a=new gh,i.set(n,[a])):s>=r.length?(a=new gh,r.push(a)):a=r[s],a}function e(){i=new WeakMap}return{get:t,dispose:e}}function D_(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new I,color:new ee};break;case"SpotLight":e={position:new I,direction:new I,color:new ee,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new I,color:new ee,distance:0,decay:0};break;case"HemisphereLight":e={direction:new I,skyColor:new ee,groundColor:new ee};break;case"RectAreaLight":e={color:new ee,position:new I,halfWidth:new I,halfHeight:new I};break}return i[t.id]=e,e}}}function I_(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Xt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Xt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Xt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}let N_=0;function U_(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function O_(i){const t=new D_,e=I_(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new I);const s=new I,r=new Se,a=new Se;function o(c){let h=0,u=0,f=0;for(let T=0;T<9;T++)n.probe[T].set(0,0,0);let d=0,g=0,_=0,m=0,p=0,x=0,S=0,y=0,C=0,A=0,R=0;c.sort(U_);for(let T=0,b=c.length;T<b;T++){const P=c[T],K=P.color,B=P.intensity,q=P.distance,Z=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)h+=K.r*B,u+=K.g*B,f+=K.b*B;else if(P.isLightProbe){for(let $=0;$<9;$++)n.probe[$].addScaledVector(P.sh.coefficients[$],B);R++}else if(P.isDirectionalLight){const $=t.get(P);if($.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){const nt=P.shadow,W=e.get(P);W.shadowIntensity=nt.intensity,W.shadowBias=nt.bias,W.shadowNormalBias=nt.normalBias,W.shadowRadius=nt.radius,W.shadowMapSize=nt.mapSize,n.directionalShadow[d]=W,n.directionalShadowMap[d]=Z,n.directionalShadowMatrix[d]=P.shadow.matrix,x++}n.directional[d]=$,d++}else if(P.isSpotLight){const $=t.get(P);$.position.setFromMatrixPosition(P.matrixWorld),$.color.copy(K).multiplyScalar(B),$.distance=q,$.coneCos=Math.cos(P.angle),$.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),$.decay=P.decay,n.spot[_]=$;const nt=P.shadow;if(P.map&&(n.spotLightMap[C]=P.map,C++,nt.updateMatrices(P),P.castShadow&&A++),n.spotLightMatrix[_]=nt.matrix,P.castShadow){const W=e.get(P);W.shadowIntensity=nt.intensity,W.shadowBias=nt.bias,W.shadowNormalBias=nt.normalBias,W.shadowRadius=nt.radius,W.shadowMapSize=nt.mapSize,n.spotShadow[_]=W,n.spotShadowMap[_]=Z,y++}_++}else if(P.isRectAreaLight){const $=t.get(P);$.color.copy(K).multiplyScalar(B),$.halfWidth.set(P.width*.5,0,0),$.halfHeight.set(0,P.height*.5,0),n.rectArea[m]=$,m++}else if(P.isPointLight){const $=t.get(P);if($.color.copy(P.color).multiplyScalar(P.intensity),$.distance=P.distance,$.decay=P.decay,P.castShadow){const nt=P.shadow,W=e.get(P);W.shadowIntensity=nt.intensity,W.shadowBias=nt.bias,W.shadowNormalBias=nt.normalBias,W.shadowRadius=nt.radius,W.shadowMapSize=nt.mapSize,W.shadowCameraNear=nt.camera.near,W.shadowCameraFar=nt.camera.far,n.pointShadow[g]=W,n.pointShadowMap[g]=Z,n.pointShadowMatrix[g]=P.shadow.matrix,S++}n.point[g]=$,g++}else if(P.isHemisphereLight){const $=t.get(P);$.skyColor.copy(P.color).multiplyScalar(B),$.groundColor.copy(P.groundColor).multiplyScalar(B),n.hemi[p]=$,p++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=lt.LTC_FLOAT_1,n.rectAreaLTC2=lt.LTC_FLOAT_2):(n.rectAreaLTC1=lt.LTC_HALF_1,n.rectAreaLTC2=lt.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=f;const L=n.hash;(L.directionalLength!==d||L.pointLength!==g||L.spotLength!==_||L.rectAreaLength!==m||L.hemiLength!==p||L.numDirectionalShadows!==x||L.numPointShadows!==S||L.numSpotShadows!==y||L.numSpotMaps!==C||L.numLightProbes!==R)&&(n.directional.length=d,n.spot.length=_,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=x,n.directionalShadowMap.length=x,n.pointShadow.length=S,n.pointShadowMap.length=S,n.spotShadow.length=y,n.spotShadowMap.length=y,n.directionalShadowMatrix.length=x,n.pointShadowMatrix.length=S,n.spotLightMatrix.length=y+C-A,n.spotLightMap.length=C,n.numSpotLightShadowsWithMaps=A,n.numLightProbes=R,L.directionalLength=d,L.pointLength=g,L.spotLength=_,L.rectAreaLength=m,L.hemiLength=p,L.numDirectionalShadows=x,L.numPointShadows=S,L.numSpotShadows=y,L.numSpotMaps=C,L.numLightProbes=R,n.version=N_++)}function l(c,h){let u=0,f=0,d=0,g=0,_=0;const m=h.matrixWorldInverse;for(let p=0,x=c.length;p<x;p++){const S=c[p];if(S.isDirectionalLight){const y=n.directional[u];y.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),u++}else if(S.isSpotLight){const y=n.spot[d];y.position.setFromMatrixPosition(S.matrixWorld),y.position.applyMatrix4(m),y.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),d++}else if(S.isRectAreaLight){const y=n.rectArea[g];y.position.setFromMatrixPosition(S.matrixWorld),y.position.applyMatrix4(m),a.identity(),r.copy(S.matrixWorld),r.premultiply(m),a.extractRotation(r),y.halfWidth.set(S.width*.5,0,0),y.halfHeight.set(0,S.height*.5,0),y.halfWidth.applyMatrix4(a),y.halfHeight.applyMatrix4(a),g++}else if(S.isPointLight){const y=n.point[f];y.position.setFromMatrixPosition(S.matrixWorld),y.position.applyMatrix4(m),f++}else if(S.isHemisphereLight){const y=n.hemi[_];y.direction.setFromMatrixPosition(S.matrixWorld),y.direction.transformDirection(m),_++}}}return{setup:o,setupView:l,state:n}}function _h(i){const t=new O_(i),e=[],n=[];function s(h){c.camera=h,e.length=0,n.length=0}function r(h){e.push(h)}function a(h){n.push(h)}function o(){t.setup(e)}function l(h){t.setupView(e,h)}const c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function k_(i){let t=new WeakMap;function e(s,r=0){const a=t.get(s);let o;return a===void 0?(o=new _h(i),t.set(s,[o])):r>=a.length?(o=new _h(i),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}class F_ extends Qi{static get type(){return"MeshDepthMaterial"}constructor(t){super(),this.isMeshDepthMaterial=!0,this.depthPacking=Dd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class z_ extends Qi{static get type(){return"MeshDistanceMaterial"}constructor(t){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const B_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,H_=`uniform sampler2D shadow_pass;
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
}`;function G_(i,t,e){let n=new Xu;const s=new Xt,r=new Xt,a=new Re,o=new F_({depthPacking:Id}),l=new z_,c={},h=e.maxTextureSize,u={[ti]:je,[je]:ti,[mn]:mn},f=new Ln({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Xt},radius:{value:4}},vertexShader:B_,fragmentShader:H_}),d=f.clone();d.defines.HORIZONTAL_PASS=1;const g=new De;g.setAttribute("position",new Pe(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new be(g,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=yu;let p=this.type;this.render=function(A,R,L){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||A.length===0)return;const T=i.getRenderTarget(),b=i.getActiveCubeFace(),P=i.getActiveMipmapLevel(),K=i.state;K.setBlending(yi),K.buffers.color.setClear(1,1,1,1),K.buffers.depth.setTest(!0),K.setScissorTest(!1);const B=p!==qn&&this.type===qn,q=p===qn&&this.type!==qn;for(let Z=0,$=A.length;Z<$;Z++){const nt=A[Z],W=nt.shadow;if(W===void 0){console.warn("THREE.WebGLShadowMap:",nt,"has no shadow.");continue}if(W.autoUpdate===!1&&W.needsUpdate===!1)continue;s.copy(W.mapSize);const ct=W.getFrameExtents();if(s.multiply(ct),r.copy(W.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/ct.x),s.x=r.x*ct.x,W.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/ct.y),s.y=r.y*ct.y,W.mapSize.y=r.y)),W.map===null||B===!0||q===!0){const At=this.type!==qn?{minFilter:Ze,magFilter:Ze}:{};W.map!==null&&W.map.dispose(),W.map=new Ji(s.x,s.y,At),W.map.texture.name=nt.name+".shadowMap",W.camera.updateProjectionMatrix()}i.setRenderTarget(W.map),i.clear();const mt=W.getViewportCount();for(let At=0;At<mt;At++){const Ht=W.getViewport(At);a.set(r.x*Ht.x,r.y*Ht.y,r.x*Ht.z,r.y*Ht.w),K.viewport(a),W.updateMatrices(nt,At),n=W.getFrustum(),y(R,L,W.camera,nt,this.type)}W.isPointLightShadow!==!0&&this.type===qn&&x(W,L),W.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(T,b,P)};function x(A,R){const L=t.update(_);f.defines.VSM_SAMPLES!==A.blurSamples&&(f.defines.VSM_SAMPLES=A.blurSamples,d.defines.VSM_SAMPLES=A.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new Ji(s.x,s.y)),f.uniforms.shadow_pass.value=A.map.texture,f.uniforms.resolution.value=A.mapSize,f.uniforms.radius.value=A.radius,i.setRenderTarget(A.mapPass),i.clear(),i.renderBufferDirect(R,null,L,f,_,null),d.uniforms.shadow_pass.value=A.mapPass.texture,d.uniforms.resolution.value=A.mapSize,d.uniforms.radius.value=A.radius,i.setRenderTarget(A.map),i.clear(),i.renderBufferDirect(R,null,L,d,_,null)}function S(A,R,L,T){let b=null;const P=L.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(P!==void 0)b=P;else if(b=L.isPointLight===!0?l:o,i.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0){const K=b.uuid,B=R.uuid;let q=c[K];q===void 0&&(q={},c[K]=q);let Z=q[B];Z===void 0&&(Z=b.clone(),q[B]=Z,R.addEventListener("dispose",C)),b=Z}if(b.visible=R.visible,b.wireframe=R.wireframe,T===qn?b.side=R.shadowSide!==null?R.shadowSide:R.side:b.side=R.shadowSide!==null?R.shadowSide:u[R.side],b.alphaMap=R.alphaMap,b.alphaTest=R.alphaTest,b.map=R.map,b.clipShadows=R.clipShadows,b.clippingPlanes=R.clippingPlanes,b.clipIntersection=R.clipIntersection,b.displacementMap=R.displacementMap,b.displacementScale=R.displacementScale,b.displacementBias=R.displacementBias,b.wireframeLinewidth=R.wireframeLinewidth,b.linewidth=R.linewidth,L.isPointLight===!0&&b.isMeshDistanceMaterial===!0){const K=i.properties.get(b);K.light=L}return b}function y(A,R,L,T,b){if(A.visible===!1)return;if(A.layers.test(R.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&b===qn)&&(!A.frustumCulled||n.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(L.matrixWorldInverse,A.matrixWorld);const B=t.update(A),q=A.material;if(Array.isArray(q)){const Z=B.groups;for(let $=0,nt=Z.length;$<nt;$++){const W=Z[$],ct=q[W.materialIndex];if(ct&&ct.visible){const mt=S(A,ct,T,b);A.onBeforeShadow(i,A,R,L,B,mt,W),i.renderBufferDirect(L,null,B,mt,A,W),A.onAfterShadow(i,A,R,L,B,mt,W)}}}else if(q.visible){const Z=S(A,q,T,b);A.onBeforeShadow(i,A,R,L,B,Z,null),i.renderBufferDirect(L,null,B,Z,A,null),A.onAfterShadow(i,A,R,L,B,Z,null)}}const K=A.children;for(let B=0,q=K.length;B<q;B++)y(K[B],R,L,T,b)}function C(A){A.target.removeEventListener("dispose",C);for(const L in c){const T=c[L],b=A.target.uuid;b in T&&(T[b].dispose(),delete T[b])}}}const V_={[Yo]:Ko,[jo]:Qo,[Zo]:tl,[Ps]:Jo,[Ko]:Yo,[Qo]:jo,[tl]:Zo,[Jo]:Ps};function W_(i,t){function e(){let D=!1;const ht=new Re;let X=null;const Q=new Re(0,0,0,0);return{setMask:function(pt){X!==pt&&!D&&(i.colorMask(pt,pt,pt,pt),X=pt)},setLocked:function(pt){D=pt},setClear:function(pt,ft,Ft,Ee,ze){ze===!0&&(pt*=Ee,ft*=Ee,Ft*=Ee),ht.set(pt,ft,Ft,Ee),Q.equals(ht)===!1&&(i.clearColor(pt,ft,Ft,Ee),Q.copy(ht))},reset:function(){D=!1,X=null,Q.set(-1,0,0,0)}}}function n(){let D=!1,ht=!1,X=null,Q=null,pt=null;return{setReversed:function(ft){if(ht!==ft){const Ft=t.get("EXT_clip_control");ht?Ft.clipControlEXT(Ft.LOWER_LEFT_EXT,Ft.ZERO_TO_ONE_EXT):Ft.clipControlEXT(Ft.LOWER_LEFT_EXT,Ft.NEGATIVE_ONE_TO_ONE_EXT);const Ee=pt;pt=null,this.setClear(Ee)}ht=ft},getReversed:function(){return ht},setTest:function(ft){ft?ot(i.DEPTH_TEST):Lt(i.DEPTH_TEST)},setMask:function(ft){X!==ft&&!D&&(i.depthMask(ft),X=ft)},setFunc:function(ft){if(ht&&(ft=V_[ft]),Q!==ft){switch(ft){case Yo:i.depthFunc(i.NEVER);break;case Ko:i.depthFunc(i.ALWAYS);break;case jo:i.depthFunc(i.LESS);break;case Ps:i.depthFunc(i.LEQUAL);break;case Zo:i.depthFunc(i.EQUAL);break;case Jo:i.depthFunc(i.GEQUAL);break;case Qo:i.depthFunc(i.GREATER);break;case tl:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}Q=ft}},setLocked:function(ft){D=ft},setClear:function(ft){pt!==ft&&(ht&&(ft=1-ft),i.clearDepth(ft),pt=ft)},reset:function(){D=!1,X=null,Q=null,pt=null,ht=!1}}}function s(){let D=!1,ht=null,X=null,Q=null,pt=null,ft=null,Ft=null,Ee=null,ze=null;return{setTest:function(le){D||(le?ot(i.STENCIL_TEST):Lt(i.STENCIL_TEST))},setMask:function(le){ht!==le&&!D&&(i.stencilMask(le),ht=le)},setFunc:function(le,Mn,Fn){(X!==le||Q!==Mn||pt!==Fn)&&(i.stencilFunc(le,Mn,Fn),X=le,Q=Mn,pt=Fn)},setOp:function(le,Mn,Fn){(ft!==le||Ft!==Mn||Ee!==Fn)&&(i.stencilOp(le,Mn,Fn),ft=le,Ft=Mn,Ee=Fn)},setLocked:function(le){D=le},setClear:function(le){ze!==le&&(i.clearStencil(le),ze=le)},reset:function(){D=!1,ht=null,X=null,Q=null,pt=null,ft=null,Ft=null,Ee=null,ze=null}}}const r=new e,a=new n,o=new s,l=new WeakMap,c=new WeakMap;let h={},u={},f=new WeakMap,d=[],g=null,_=!1,m=null,p=null,x=null,S=null,y=null,C=null,A=null,R=new ee(0,0,0),L=0,T=!1,b=null,P=null,K=null,B=null,q=null;const Z=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let $=!1,nt=0;const W=i.getParameter(i.VERSION);W.indexOf("WebGL")!==-1?(nt=parseFloat(/^WebGL (\d)/.exec(W)[1]),$=nt>=1):W.indexOf("OpenGL ES")!==-1&&(nt=parseFloat(/^OpenGL ES (\d)/.exec(W)[1]),$=nt>=2);let ct=null,mt={};const At=i.getParameter(i.SCISSOR_BOX),Ht=i.getParameter(i.VIEWPORT),ie=new Re().fromArray(At),Y=new Re().fromArray(Ht);function it(D,ht,X,Q){const pt=new Uint8Array(4),ft=i.createTexture();i.bindTexture(D,ft),i.texParameteri(D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(D,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ft=0;Ft<X;Ft++)D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY?i.texImage3D(ht,0,i.RGBA,1,1,Q,0,i.RGBA,i.UNSIGNED_BYTE,pt):i.texImage2D(ht+Ft,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,pt);return ft}const xt={};xt[i.TEXTURE_2D]=it(i.TEXTURE_2D,i.TEXTURE_2D,1),xt[i.TEXTURE_CUBE_MAP]=it(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),xt[i.TEXTURE_2D_ARRAY]=it(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),xt[i.TEXTURE_3D]=it(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ot(i.DEPTH_TEST),a.setFunc(Ps),Yt(!1),Kt(Sc),ot(i.CULL_FACE),k(yi);function ot(D){h[D]!==!0&&(i.enable(D),h[D]=!0)}function Lt(D){h[D]!==!1&&(i.disable(D),h[D]=!1)}function Ut(D,ht){return u[D]!==ht?(i.bindFramebuffer(D,ht),u[D]=ht,D===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=ht),D===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=ht),!0):!1}function Gt(D,ht){let X=d,Q=!1;if(D){X=f.get(ht),X===void 0&&(X=[],f.set(ht,X));const pt=D.textures;if(X.length!==pt.length||X[0]!==i.COLOR_ATTACHMENT0){for(let ft=0,Ft=pt.length;ft<Ft;ft++)X[ft]=i.COLOR_ATTACHMENT0+ft;X.length=pt.length,Q=!0}}else X[0]!==i.BACK&&(X[0]=i.BACK,Q=!0);Q&&i.drawBuffers(X)}function Me(D){return g!==D?(i.useProgram(D),g=D,!0):!1}const Zt={[Vi]:i.FUNC_ADD,[rd]:i.FUNC_SUBTRACT,[ad]:i.FUNC_REVERSE_SUBTRACT};Zt[od]=i.MIN,Zt[ld]=i.MAX;const Ae={[cd]:i.ZERO,[hd]:i.ONE,[ud]:i.SRC_COLOR,[$o]:i.SRC_ALPHA,[_d]:i.SRC_ALPHA_SATURATE,[md]:i.DST_COLOR,[dd]:i.DST_ALPHA,[fd]:i.ONE_MINUS_SRC_COLOR,[qo]:i.ONE_MINUS_SRC_ALPHA,[gd]:i.ONE_MINUS_DST_COLOR,[pd]:i.ONE_MINUS_DST_ALPHA,[vd]:i.CONSTANT_COLOR,[xd]:i.ONE_MINUS_CONSTANT_COLOR,[Md]:i.CONSTANT_ALPHA,[yd]:i.ONE_MINUS_CONSTANT_ALPHA};function k(D,ht,X,Q,pt,ft,Ft,Ee,ze,le){if(D===yi){_===!0&&(Lt(i.BLEND),_=!1);return}if(_===!1&&(ot(i.BLEND),_=!0),D!==sd){if(D!==m||le!==T){if((p!==Vi||y!==Vi)&&(i.blendEquation(i.FUNC_ADD),p=Vi,y=Vi),le)switch(D){case ws:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Ec:i.blendFunc(i.ONE,i.ONE);break;case bc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Tc:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}else switch(D){case ws:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Ec:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case bc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Tc:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}x=null,S=null,C=null,A=null,R.set(0,0,0),L=0,m=D,T=le}return}pt=pt||ht,ft=ft||X,Ft=Ft||Q,(ht!==p||pt!==y)&&(i.blendEquationSeparate(Zt[ht],Zt[pt]),p=ht,y=pt),(X!==x||Q!==S||ft!==C||Ft!==A)&&(i.blendFuncSeparate(Ae[X],Ae[Q],Ae[ft],Ae[Ft]),x=X,S=Q,C=ft,A=Ft),(Ee.equals(R)===!1||ze!==L)&&(i.blendColor(Ee.r,Ee.g,Ee.b,ze),R.copy(Ee),L=ze),m=D,T=!1}function cn(D,ht){D.side===mn?Lt(i.CULL_FACE):ot(i.CULL_FACE);let X=D.side===je;ht&&(X=!X),Yt(X),D.blending===ws&&D.transparent===!1?k(yi):k(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),a.setFunc(D.depthFunc),a.setTest(D.depthTest),a.setMask(D.depthWrite),r.setMask(D.colorWrite);const Q=D.stencilWrite;o.setTest(Q),Q&&(o.setMask(D.stencilWriteMask),o.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),o.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),me(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?ot(i.SAMPLE_ALPHA_TO_COVERAGE):Lt(i.SAMPLE_ALPHA_TO_COVERAGE)}function Yt(D){b!==D&&(D?i.frontFace(i.CW):i.frontFace(i.CCW),b=D)}function Kt(D){D!==ed?(ot(i.CULL_FACE),D!==P&&(D===Sc?i.cullFace(i.BACK):D===nd?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Lt(i.CULL_FACE),P=D}function Dt(D){D!==K&&($&&i.lineWidth(D),K=D)}function me(D,ht,X){D?(ot(i.POLYGON_OFFSET_FILL),(B!==ht||q!==X)&&(i.polygonOffset(ht,X),B=ht,q=X)):Lt(i.POLYGON_OFFSET_FILL)}function Pt(D){D?ot(i.SCISSOR_TEST):Lt(i.SCISSOR_TEST)}function w(D){D===void 0&&(D=i.TEXTURE0+Z-1),ct!==D&&(i.activeTexture(D),ct=D)}function M(D,ht,X){X===void 0&&(ct===null?X=i.TEXTURE0+Z-1:X=ct);let Q=mt[X];Q===void 0&&(Q={type:void 0,texture:void 0},mt[X]=Q),(Q.type!==D||Q.texture!==ht)&&(ct!==X&&(i.activeTexture(X),ct=X),i.bindTexture(D,ht||xt[D]),Q.type=D,Q.texture=ht)}function z(){const D=mt[ct];D!==void 0&&D.type!==void 0&&(i.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function J(){try{i.compressedTexImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function et(){try{i.compressedTexImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function j(){try{i.texSubImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function wt(){try{i.texSubImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ut(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function gt(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Jt(){try{i.texStorage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function st(){try{i.texStorage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function _t(){try{i.texImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function It(){try{i.texImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Ot(D){ie.equals(D)===!1&&(i.scissor(D.x,D.y,D.z,D.w),ie.copy(D))}function vt(D){Y.equals(D)===!1&&(i.viewport(D.x,D.y,D.z,D.w),Y.copy(D))}function jt(D,ht){let X=c.get(ht);X===void 0&&(X=new WeakMap,c.set(ht,X));let Q=X.get(D);Q===void 0&&(Q=i.getUniformBlockIndex(ht,D.name),X.set(D,Q))}function Vt(D,ht){const Q=c.get(ht).get(D);l.get(ht)!==Q&&(i.uniformBlockBinding(ht,Q,D.__bindingPointIndex),l.set(ht,Q))}function de(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),h={},ct=null,mt={},u={},f=new WeakMap,d=[],g=null,_=!1,m=null,p=null,x=null,S=null,y=null,C=null,A=null,R=new ee(0,0,0),L=0,T=!1,b=null,P=null,K=null,B=null,q=null,ie.set(0,0,i.canvas.width,i.canvas.height),Y.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:ot,disable:Lt,bindFramebuffer:Ut,drawBuffers:Gt,useProgram:Me,setBlending:k,setMaterial:cn,setFlipSided:Yt,setCullFace:Kt,setLineWidth:Dt,setPolygonOffset:me,setScissorTest:Pt,activeTexture:w,bindTexture:M,unbindTexture:z,compressedTexImage2D:J,compressedTexImage3D:et,texImage2D:_t,texImage3D:It,updateUBOMapping:jt,uniformBlockBinding:Vt,texStorage2D:Jt,texStorage3D:st,texSubImage2D:j,texSubImage3D:wt,compressedTexSubImage2D:ut,compressedTexSubImage3D:gt,scissor:Ot,viewport:vt,reset:de}}function vh(i,t,e,n){const s=X_(n);switch(e){case wu:return i*t;case Cu:return i*t;case Lu:return i*t*2;case Pu:return i*t/s.components*s.byteLength;case Zl:return i*t/s.components*s.byteLength;case Du:return i*t*2/s.components*s.byteLength;case Jl:return i*t*2/s.components*s.byteLength;case Ru:return i*t*3/s.components*s.byteLength;case gn:return i*t*4/s.components*s.byteLength;case Ql:return i*t*4/s.components*s.byteLength;case Ea:case ba:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Ta:case Aa:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case rl:case ol:return Math.max(i,16)*Math.max(t,8)/4;case sl:case al:return Math.max(i,8)*Math.max(t,8)/2;case ll:case cl:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case hl:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case ul:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case fl:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case dl:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case pl:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case ml:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case gl:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case _l:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case vl:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case xl:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case Ml:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case yl:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case Sl:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case El:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case bl:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case wa:case Tl:case Al:return Math.ceil(i/4)*Math.ceil(t/4)*16;case Iu:case wl:return Math.ceil(i/4)*Math.ceil(t/4)*8;case Rl:case Cl:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function X_(i){switch(i){case ei:case bu:return{byteLength:1,components:1};case Mr:case Tu:case Lr:return{byteLength:2,components:1};case Kl:case jl:return{byteLength:2,components:4};case Zi:case Yl:case Kn:return{byteLength:4,components:1};case Au:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function $_(i,t,e,n,s,r,a){const o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Xt,h=new WeakMap;let u;const f=new WeakMap;let d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(w,M){return d?new OffscreenCanvas(w,M):ka("canvas")}function _(w,M,z){let J=1;const et=Pt(w);if((et.width>z||et.height>z)&&(J=z/Math.max(et.width,et.height)),J<1)if(typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&w instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&w instanceof ImageBitmap||typeof VideoFrame<"u"&&w instanceof VideoFrame){const j=Math.floor(J*et.width),wt=Math.floor(J*et.height);u===void 0&&(u=g(j,wt));const ut=M?g(j,wt):u;return ut.width=j,ut.height=wt,ut.getContext("2d").drawImage(w,0,0,j,wt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+et.width+"x"+et.height+") to ("+j+"x"+wt+")."),ut}else return"data"in w&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+et.width+"x"+et.height+")."),w;return w}function m(w){return w.generateMipmaps}function p(w){i.generateMipmap(w)}function x(w){return w.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:w.isWebGL3DRenderTarget?i.TEXTURE_3D:w.isWebGLArrayRenderTarget||w.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function S(w,M,z,J,et=!1){if(w!==null){if(i[w]!==void 0)return i[w];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+w+"'")}let j=M;if(M===i.RED&&(z===i.FLOAT&&(j=i.R32F),z===i.HALF_FLOAT&&(j=i.R16F),z===i.UNSIGNED_BYTE&&(j=i.R8)),M===i.RED_INTEGER&&(z===i.UNSIGNED_BYTE&&(j=i.R8UI),z===i.UNSIGNED_SHORT&&(j=i.R16UI),z===i.UNSIGNED_INT&&(j=i.R32UI),z===i.BYTE&&(j=i.R8I),z===i.SHORT&&(j=i.R16I),z===i.INT&&(j=i.R32I)),M===i.RG&&(z===i.FLOAT&&(j=i.RG32F),z===i.HALF_FLOAT&&(j=i.RG16F),z===i.UNSIGNED_BYTE&&(j=i.RG8)),M===i.RG_INTEGER&&(z===i.UNSIGNED_BYTE&&(j=i.RG8UI),z===i.UNSIGNED_SHORT&&(j=i.RG16UI),z===i.UNSIGNED_INT&&(j=i.RG32UI),z===i.BYTE&&(j=i.RG8I),z===i.SHORT&&(j=i.RG16I),z===i.INT&&(j=i.RG32I)),M===i.RGB_INTEGER&&(z===i.UNSIGNED_BYTE&&(j=i.RGB8UI),z===i.UNSIGNED_SHORT&&(j=i.RGB16UI),z===i.UNSIGNED_INT&&(j=i.RGB32UI),z===i.BYTE&&(j=i.RGB8I),z===i.SHORT&&(j=i.RGB16I),z===i.INT&&(j=i.RGB32I)),M===i.RGBA_INTEGER&&(z===i.UNSIGNED_BYTE&&(j=i.RGBA8UI),z===i.UNSIGNED_SHORT&&(j=i.RGBA16UI),z===i.UNSIGNED_INT&&(j=i.RGBA32UI),z===i.BYTE&&(j=i.RGBA8I),z===i.SHORT&&(j=i.RGBA16I),z===i.INT&&(j=i.RGBA32I)),M===i.RGB&&z===i.UNSIGNED_INT_5_9_9_9_REV&&(j=i.RGB9_E5),M===i.RGBA){const wt=et?Xa:Qt.getTransfer(J);z===i.FLOAT&&(j=i.RGBA32F),z===i.HALF_FLOAT&&(j=i.RGBA16F),z===i.UNSIGNED_BYTE&&(j=wt===ce?i.SRGB8_ALPHA8:i.RGBA8),z===i.UNSIGNED_SHORT_4_4_4_4&&(j=i.RGBA4),z===i.UNSIGNED_SHORT_5_5_5_1&&(j=i.RGB5_A1)}return(j===i.R16F||j===i.R32F||j===i.RG16F||j===i.RG32F||j===i.RGBA16F||j===i.RGBA32F)&&t.get("EXT_color_buffer_float"),j}function y(w,M){let z;return w?M===null||M===Zi||M===Ns?z=i.DEPTH24_STENCIL8:M===Kn?z=i.DEPTH32F_STENCIL8:M===Mr&&(z=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):M===null||M===Zi||M===Ns?z=i.DEPTH_COMPONENT24:M===Kn?z=i.DEPTH_COMPONENT32F:M===Mr&&(z=i.DEPTH_COMPONENT16),z}function C(w,M){return m(w)===!0||w.isFramebufferTexture&&w.minFilter!==Ze&&w.minFilter!==an?Math.log2(Math.max(M.width,M.height))+1:w.mipmaps!==void 0&&w.mipmaps.length>0?w.mipmaps.length:w.isCompressedTexture&&Array.isArray(w.image)?M.mipmaps.length:1}function A(w){const M=w.target;M.removeEventListener("dispose",A),L(M),M.isVideoTexture&&h.delete(M)}function R(w){const M=w.target;M.removeEventListener("dispose",R),b(M)}function L(w){const M=n.get(w);if(M.__webglInit===void 0)return;const z=w.source,J=f.get(z);if(J){const et=J[M.__cacheKey];et.usedTimes--,et.usedTimes===0&&T(w),Object.keys(J).length===0&&f.delete(z)}n.remove(w)}function T(w){const M=n.get(w);i.deleteTexture(M.__webglTexture);const z=w.source,J=f.get(z);delete J[M.__cacheKey],a.memory.textures--}function b(w){const M=n.get(w);if(w.depthTexture&&(w.depthTexture.dispose(),n.remove(w.depthTexture)),w.isWebGLCubeRenderTarget)for(let J=0;J<6;J++){if(Array.isArray(M.__webglFramebuffer[J]))for(let et=0;et<M.__webglFramebuffer[J].length;et++)i.deleteFramebuffer(M.__webglFramebuffer[J][et]);else i.deleteFramebuffer(M.__webglFramebuffer[J]);M.__webglDepthbuffer&&i.deleteRenderbuffer(M.__webglDepthbuffer[J])}else{if(Array.isArray(M.__webglFramebuffer))for(let J=0;J<M.__webglFramebuffer.length;J++)i.deleteFramebuffer(M.__webglFramebuffer[J]);else i.deleteFramebuffer(M.__webglFramebuffer);if(M.__webglDepthbuffer&&i.deleteRenderbuffer(M.__webglDepthbuffer),M.__webglMultisampledFramebuffer&&i.deleteFramebuffer(M.__webglMultisampledFramebuffer),M.__webglColorRenderbuffer)for(let J=0;J<M.__webglColorRenderbuffer.length;J++)M.__webglColorRenderbuffer[J]&&i.deleteRenderbuffer(M.__webglColorRenderbuffer[J]);M.__webglDepthRenderbuffer&&i.deleteRenderbuffer(M.__webglDepthRenderbuffer)}const z=w.textures;for(let J=0,et=z.length;J<et;J++){const j=n.get(z[J]);j.__webglTexture&&(i.deleteTexture(j.__webglTexture),a.memory.textures--),n.remove(z[J])}n.remove(w)}let P=0;function K(){P=0}function B(){const w=P;return w>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+w+" texture units while this GPU supports only "+s.maxTextures),P+=1,w}function q(w){const M=[];return M.push(w.wrapS),M.push(w.wrapT),M.push(w.wrapR||0),M.push(w.magFilter),M.push(w.minFilter),M.push(w.anisotropy),M.push(w.internalFormat),M.push(w.format),M.push(w.type),M.push(w.generateMipmaps),M.push(w.premultiplyAlpha),M.push(w.flipY),M.push(w.unpackAlignment),M.push(w.colorSpace),M.join()}function Z(w,M){const z=n.get(w);if(w.isVideoTexture&&Dt(w),w.isRenderTargetTexture===!1&&w.version>0&&z.__version!==w.version){const J=w.image;if(J===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(J.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Y(z,w,M);return}}e.bindTexture(i.TEXTURE_2D,z.__webglTexture,i.TEXTURE0+M)}function $(w,M){const z=n.get(w);if(w.version>0&&z.__version!==w.version){Y(z,w,M);return}e.bindTexture(i.TEXTURE_2D_ARRAY,z.__webglTexture,i.TEXTURE0+M)}function nt(w,M){const z=n.get(w);if(w.version>0&&z.__version!==w.version){Y(z,w,M);return}e.bindTexture(i.TEXTURE_3D,z.__webglTexture,i.TEXTURE0+M)}function W(w,M){const z=n.get(w);if(w.version>0&&z.__version!==w.version){it(z,w,M);return}e.bindTexture(i.TEXTURE_CUBE_MAP,z.__webglTexture,i.TEXTURE0+M)}const ct={[Ua]:i.REPEAT,[Xi]:i.CLAMP_TO_EDGE,[il]:i.MIRRORED_REPEAT},mt={[Ze]:i.NEAREST,[Pd]:i.NEAREST_MIPMAP_NEAREST,[Hr]:i.NEAREST_MIPMAP_LINEAR,[an]:i.LINEAR,[to]:i.LINEAR_MIPMAP_NEAREST,[On]:i.LINEAR_MIPMAP_LINEAR},At={[Od]:i.NEVER,[Gd]:i.ALWAYS,[kd]:i.LESS,[Nu]:i.LEQUAL,[Fd]:i.EQUAL,[Hd]:i.GEQUAL,[zd]:i.GREATER,[Bd]:i.NOTEQUAL};function Ht(w,M){if(M.type===Kn&&t.has("OES_texture_float_linear")===!1&&(M.magFilter===an||M.magFilter===to||M.magFilter===Hr||M.magFilter===On||M.minFilter===an||M.minFilter===to||M.minFilter===Hr||M.minFilter===On)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(w,i.TEXTURE_WRAP_S,ct[M.wrapS]),i.texParameteri(w,i.TEXTURE_WRAP_T,ct[M.wrapT]),(w===i.TEXTURE_3D||w===i.TEXTURE_2D_ARRAY)&&i.texParameteri(w,i.TEXTURE_WRAP_R,ct[M.wrapR]),i.texParameteri(w,i.TEXTURE_MAG_FILTER,mt[M.magFilter]),i.texParameteri(w,i.TEXTURE_MIN_FILTER,mt[M.minFilter]),M.compareFunction&&(i.texParameteri(w,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(w,i.TEXTURE_COMPARE_FUNC,At[M.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(M.magFilter===Ze||M.minFilter!==Hr&&M.minFilter!==On||M.type===Kn&&t.has("OES_texture_float_linear")===!1)return;if(M.anisotropy>1||n.get(M).__currentAnisotropy){const z=t.get("EXT_texture_filter_anisotropic");i.texParameterf(w,z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,s.getMaxAnisotropy())),n.get(M).__currentAnisotropy=M.anisotropy}}}function ie(w,M){let z=!1;w.__webglInit===void 0&&(w.__webglInit=!0,M.addEventListener("dispose",A));const J=M.source;let et=f.get(J);et===void 0&&(et={},f.set(J,et));const j=q(M);if(j!==w.__cacheKey){et[j]===void 0&&(et[j]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,z=!0),et[j].usedTimes++;const wt=et[w.__cacheKey];wt!==void 0&&(et[w.__cacheKey].usedTimes--,wt.usedTimes===0&&T(M)),w.__cacheKey=j,w.__webglTexture=et[j].texture}return z}function Y(w,M,z){let J=i.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(J=i.TEXTURE_2D_ARRAY),M.isData3DTexture&&(J=i.TEXTURE_3D);const et=ie(w,M),j=M.source;e.bindTexture(J,w.__webglTexture,i.TEXTURE0+z);const wt=n.get(j);if(j.version!==wt.__version||et===!0){e.activeTexture(i.TEXTURE0+z);const ut=Qt.getPrimaries(Qt.workingColorSpace),gt=M.colorSpace===gi?null:Qt.getPrimaries(M.colorSpace),Jt=M.colorSpace===gi||ut===gt?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,M.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,M.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Jt);let st=_(M.image,!1,s.maxTextureSize);st=me(M,st);const _t=r.convert(M.format,M.colorSpace),It=r.convert(M.type);let Ot=S(M.internalFormat,_t,It,M.colorSpace,M.isVideoTexture);Ht(J,M);let vt;const jt=M.mipmaps,Vt=M.isVideoTexture!==!0,de=wt.__version===void 0||et===!0,D=j.dataReady,ht=C(M,st);if(M.isDepthTexture)Ot=y(M.format===Us,M.type),de&&(Vt?e.texStorage2D(i.TEXTURE_2D,1,Ot,st.width,st.height):e.texImage2D(i.TEXTURE_2D,0,Ot,st.width,st.height,0,_t,It,null));else if(M.isDataTexture)if(jt.length>0){Vt&&de&&e.texStorage2D(i.TEXTURE_2D,ht,Ot,jt[0].width,jt[0].height);for(let X=0,Q=jt.length;X<Q;X++)vt=jt[X],Vt?D&&e.texSubImage2D(i.TEXTURE_2D,X,0,0,vt.width,vt.height,_t,It,vt.data):e.texImage2D(i.TEXTURE_2D,X,Ot,vt.width,vt.height,0,_t,It,vt.data);M.generateMipmaps=!1}else Vt?(de&&e.texStorage2D(i.TEXTURE_2D,ht,Ot,st.width,st.height),D&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,st.width,st.height,_t,It,st.data)):e.texImage2D(i.TEXTURE_2D,0,Ot,st.width,st.height,0,_t,It,st.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){Vt&&de&&e.texStorage3D(i.TEXTURE_2D_ARRAY,ht,Ot,jt[0].width,jt[0].height,st.depth);for(let X=0,Q=jt.length;X<Q;X++)if(vt=jt[X],M.format!==gn)if(_t!==null)if(Vt){if(D)if(M.layerUpdates.size>0){const pt=vh(vt.width,vt.height,M.format,M.type);for(const ft of M.layerUpdates){const Ft=vt.data.subarray(ft*pt/vt.data.BYTES_PER_ELEMENT,(ft+1)*pt/vt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,X,0,0,ft,vt.width,vt.height,1,_t,Ft)}M.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,X,0,0,0,vt.width,vt.height,st.depth,_t,vt.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,X,Ot,vt.width,vt.height,st.depth,0,vt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Vt?D&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,X,0,0,0,vt.width,vt.height,st.depth,_t,It,vt.data):e.texImage3D(i.TEXTURE_2D_ARRAY,X,Ot,vt.width,vt.height,st.depth,0,_t,It,vt.data)}else{Vt&&de&&e.texStorage2D(i.TEXTURE_2D,ht,Ot,jt[0].width,jt[0].height);for(let X=0,Q=jt.length;X<Q;X++)vt=jt[X],M.format!==gn?_t!==null?Vt?D&&e.compressedTexSubImage2D(i.TEXTURE_2D,X,0,0,vt.width,vt.height,_t,vt.data):e.compressedTexImage2D(i.TEXTURE_2D,X,Ot,vt.width,vt.height,0,vt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Vt?D&&e.texSubImage2D(i.TEXTURE_2D,X,0,0,vt.width,vt.height,_t,It,vt.data):e.texImage2D(i.TEXTURE_2D,X,Ot,vt.width,vt.height,0,_t,It,vt.data)}else if(M.isDataArrayTexture)if(Vt){if(de&&e.texStorage3D(i.TEXTURE_2D_ARRAY,ht,Ot,st.width,st.height,st.depth),D)if(M.layerUpdates.size>0){const X=vh(st.width,st.height,M.format,M.type);for(const Q of M.layerUpdates){const pt=st.data.subarray(Q*X/st.data.BYTES_PER_ELEMENT,(Q+1)*X/st.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Q,st.width,st.height,1,_t,It,pt)}M.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,st.width,st.height,st.depth,_t,It,st.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,Ot,st.width,st.height,st.depth,0,_t,It,st.data);else if(M.isData3DTexture)Vt?(de&&e.texStorage3D(i.TEXTURE_3D,ht,Ot,st.width,st.height,st.depth),D&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,st.width,st.height,st.depth,_t,It,st.data)):e.texImage3D(i.TEXTURE_3D,0,Ot,st.width,st.height,st.depth,0,_t,It,st.data);else if(M.isFramebufferTexture){if(de)if(Vt)e.texStorage2D(i.TEXTURE_2D,ht,Ot,st.width,st.height);else{let X=st.width,Q=st.height;for(let pt=0;pt<ht;pt++)e.texImage2D(i.TEXTURE_2D,pt,Ot,X,Q,0,_t,It,null),X>>=1,Q>>=1}}else if(jt.length>0){if(Vt&&de){const X=Pt(jt[0]);e.texStorage2D(i.TEXTURE_2D,ht,Ot,X.width,X.height)}for(let X=0,Q=jt.length;X<Q;X++)vt=jt[X],Vt?D&&e.texSubImage2D(i.TEXTURE_2D,X,0,0,_t,It,vt):e.texImage2D(i.TEXTURE_2D,X,Ot,_t,It,vt);M.generateMipmaps=!1}else if(Vt){if(de){const X=Pt(st);e.texStorage2D(i.TEXTURE_2D,ht,Ot,X.width,X.height)}D&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,_t,It,st)}else e.texImage2D(i.TEXTURE_2D,0,Ot,_t,It,st);m(M)&&p(J),wt.__version=j.version,M.onUpdate&&M.onUpdate(M)}w.__version=M.version}function it(w,M,z){if(M.image.length!==6)return;const J=ie(w,M),et=M.source;e.bindTexture(i.TEXTURE_CUBE_MAP,w.__webglTexture,i.TEXTURE0+z);const j=n.get(et);if(et.version!==j.__version||J===!0){e.activeTexture(i.TEXTURE0+z);const wt=Qt.getPrimaries(Qt.workingColorSpace),ut=M.colorSpace===gi?null:Qt.getPrimaries(M.colorSpace),gt=M.colorSpace===gi||wt===ut?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,M.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,M.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,gt);const Jt=M.isCompressedTexture||M.image[0].isCompressedTexture,st=M.image[0]&&M.image[0].isDataTexture,_t=[];for(let Q=0;Q<6;Q++)!Jt&&!st?_t[Q]=_(M.image[Q],!0,s.maxCubemapSize):_t[Q]=st?M.image[Q].image:M.image[Q],_t[Q]=me(M,_t[Q]);const It=_t[0],Ot=r.convert(M.format,M.colorSpace),vt=r.convert(M.type),jt=S(M.internalFormat,Ot,vt,M.colorSpace),Vt=M.isVideoTexture!==!0,de=j.__version===void 0||J===!0,D=et.dataReady;let ht=C(M,It);Ht(i.TEXTURE_CUBE_MAP,M);let X;if(Jt){Vt&&de&&e.texStorage2D(i.TEXTURE_CUBE_MAP,ht,jt,It.width,It.height);for(let Q=0;Q<6;Q++){X=_t[Q].mipmaps;for(let pt=0;pt<X.length;pt++){const ft=X[pt];M.format!==gn?Ot!==null?Vt?D&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,pt,0,0,ft.width,ft.height,Ot,ft.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,pt,jt,ft.width,ft.height,0,ft.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Vt?D&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,pt,0,0,ft.width,ft.height,Ot,vt,ft.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,pt,jt,ft.width,ft.height,0,Ot,vt,ft.data)}}}else{if(X=M.mipmaps,Vt&&de){X.length>0&&ht++;const Q=Pt(_t[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,ht,jt,Q.width,Q.height)}for(let Q=0;Q<6;Q++)if(st){Vt?D&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,_t[Q].width,_t[Q].height,Ot,vt,_t[Q].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,jt,_t[Q].width,_t[Q].height,0,Ot,vt,_t[Q].data);for(let pt=0;pt<X.length;pt++){const Ft=X[pt].image[Q].image;Vt?D&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,pt+1,0,0,Ft.width,Ft.height,Ot,vt,Ft.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,pt+1,jt,Ft.width,Ft.height,0,Ot,vt,Ft.data)}}else{Vt?D&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,Ot,vt,_t[Q]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,jt,Ot,vt,_t[Q]);for(let pt=0;pt<X.length;pt++){const ft=X[pt];Vt?D&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,pt+1,0,0,Ot,vt,ft.image[Q]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,pt+1,jt,Ot,vt,ft.image[Q])}}}m(M)&&p(i.TEXTURE_CUBE_MAP),j.__version=et.version,M.onUpdate&&M.onUpdate(M)}w.__version=M.version}function xt(w,M,z,J,et,j){const wt=r.convert(z.format,z.colorSpace),ut=r.convert(z.type),gt=S(z.internalFormat,wt,ut,z.colorSpace),Jt=n.get(M),st=n.get(z);if(st.__renderTarget=M,!Jt.__hasExternalTextures){const _t=Math.max(1,M.width>>j),It=Math.max(1,M.height>>j);et===i.TEXTURE_3D||et===i.TEXTURE_2D_ARRAY?e.texImage3D(et,j,gt,_t,It,M.depth,0,wt,ut,null):e.texImage2D(et,j,gt,_t,It,0,wt,ut,null)}e.bindFramebuffer(i.FRAMEBUFFER,w),Kt(M)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,J,et,st.__webglTexture,0,Yt(M)):(et===i.TEXTURE_2D||et>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&et<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,J,et,st.__webglTexture,j),e.bindFramebuffer(i.FRAMEBUFFER,null)}function ot(w,M,z){if(i.bindRenderbuffer(i.RENDERBUFFER,w),M.depthBuffer){const J=M.depthTexture,et=J&&J.isDepthTexture?J.type:null,j=y(M.stencilBuffer,et),wt=M.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ut=Yt(M);Kt(M)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ut,j,M.width,M.height):z?i.renderbufferStorageMultisample(i.RENDERBUFFER,ut,j,M.width,M.height):i.renderbufferStorage(i.RENDERBUFFER,j,M.width,M.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,wt,i.RENDERBUFFER,w)}else{const J=M.textures;for(let et=0;et<J.length;et++){const j=J[et],wt=r.convert(j.format,j.colorSpace),ut=r.convert(j.type),gt=S(j.internalFormat,wt,ut,j.colorSpace),Jt=Yt(M);z&&Kt(M)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Jt,gt,M.width,M.height):Kt(M)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Jt,gt,M.width,M.height):i.renderbufferStorage(i.RENDERBUFFER,gt,M.width,M.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Lt(w,M){if(M&&M.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(i.FRAMEBUFFER,w),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const J=n.get(M.depthTexture);J.__renderTarget=M,(!J.__webglTexture||M.depthTexture.image.width!==M.width||M.depthTexture.image.height!==M.height)&&(M.depthTexture.image.width=M.width,M.depthTexture.image.height=M.height,M.depthTexture.needsUpdate=!0),Z(M.depthTexture,0);const et=J.__webglTexture,j=Yt(M);if(M.depthTexture.format===Rs)Kt(M)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,et,0,j):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,et,0);else if(M.depthTexture.format===Us)Kt(M)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,et,0,j):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,et,0);else throw new Error("Unknown depthTexture format")}function Ut(w){const M=n.get(w),z=w.isWebGLCubeRenderTarget===!0;if(M.__boundDepthTexture!==w.depthTexture){const J=w.depthTexture;if(M.__depthDisposeCallback&&M.__depthDisposeCallback(),J){const et=()=>{delete M.__boundDepthTexture,delete M.__depthDisposeCallback,J.removeEventListener("dispose",et)};J.addEventListener("dispose",et),M.__depthDisposeCallback=et}M.__boundDepthTexture=J}if(w.depthTexture&&!M.__autoAllocateDepthBuffer){if(z)throw new Error("target.depthTexture not supported in Cube render targets");Lt(M.__webglFramebuffer,w)}else if(z){M.__webglDepthbuffer=[];for(let J=0;J<6;J++)if(e.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer[J]),M.__webglDepthbuffer[J]===void 0)M.__webglDepthbuffer[J]=i.createRenderbuffer(),ot(M.__webglDepthbuffer[J],w,!1);else{const et=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,j=M.__webglDepthbuffer[J];i.bindRenderbuffer(i.RENDERBUFFER,j),i.framebufferRenderbuffer(i.FRAMEBUFFER,et,i.RENDERBUFFER,j)}}else if(e.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer===void 0)M.__webglDepthbuffer=i.createRenderbuffer(),ot(M.__webglDepthbuffer,w,!1);else{const J=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,et=M.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,et),i.framebufferRenderbuffer(i.FRAMEBUFFER,J,i.RENDERBUFFER,et)}e.bindFramebuffer(i.FRAMEBUFFER,null)}function Gt(w,M,z){const J=n.get(w);M!==void 0&&xt(J.__webglFramebuffer,w,w.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),z!==void 0&&Ut(w)}function Me(w){const M=w.texture,z=n.get(w),J=n.get(M);w.addEventListener("dispose",R);const et=w.textures,j=w.isWebGLCubeRenderTarget===!0,wt=et.length>1;if(wt||(J.__webglTexture===void 0&&(J.__webglTexture=i.createTexture()),J.__version=M.version,a.memory.textures++),j){z.__webglFramebuffer=[];for(let ut=0;ut<6;ut++)if(M.mipmaps&&M.mipmaps.length>0){z.__webglFramebuffer[ut]=[];for(let gt=0;gt<M.mipmaps.length;gt++)z.__webglFramebuffer[ut][gt]=i.createFramebuffer()}else z.__webglFramebuffer[ut]=i.createFramebuffer()}else{if(M.mipmaps&&M.mipmaps.length>0){z.__webglFramebuffer=[];for(let ut=0;ut<M.mipmaps.length;ut++)z.__webglFramebuffer[ut]=i.createFramebuffer()}else z.__webglFramebuffer=i.createFramebuffer();if(wt)for(let ut=0,gt=et.length;ut<gt;ut++){const Jt=n.get(et[ut]);Jt.__webglTexture===void 0&&(Jt.__webglTexture=i.createTexture(),a.memory.textures++)}if(w.samples>0&&Kt(w)===!1){z.__webglMultisampledFramebuffer=i.createFramebuffer(),z.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let ut=0;ut<et.length;ut++){const gt=et[ut];z.__webglColorRenderbuffer[ut]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,z.__webglColorRenderbuffer[ut]);const Jt=r.convert(gt.format,gt.colorSpace),st=r.convert(gt.type),_t=S(gt.internalFormat,Jt,st,gt.colorSpace,w.isXRRenderTarget===!0),It=Yt(w);i.renderbufferStorageMultisample(i.RENDERBUFFER,It,_t,w.width,w.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ut,i.RENDERBUFFER,z.__webglColorRenderbuffer[ut])}i.bindRenderbuffer(i.RENDERBUFFER,null),w.depthBuffer&&(z.__webglDepthRenderbuffer=i.createRenderbuffer(),ot(z.__webglDepthRenderbuffer,w,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(j){e.bindTexture(i.TEXTURE_CUBE_MAP,J.__webglTexture),Ht(i.TEXTURE_CUBE_MAP,M);for(let ut=0;ut<6;ut++)if(M.mipmaps&&M.mipmaps.length>0)for(let gt=0;gt<M.mipmaps.length;gt++)xt(z.__webglFramebuffer[ut][gt],w,M,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ut,gt);else xt(z.__webglFramebuffer[ut],w,M,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ut,0);m(M)&&p(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(wt){for(let ut=0,gt=et.length;ut<gt;ut++){const Jt=et[ut],st=n.get(Jt);e.bindTexture(i.TEXTURE_2D,st.__webglTexture),Ht(i.TEXTURE_2D,Jt),xt(z.__webglFramebuffer,w,Jt,i.COLOR_ATTACHMENT0+ut,i.TEXTURE_2D,0),m(Jt)&&p(i.TEXTURE_2D)}e.unbindTexture()}else{let ut=i.TEXTURE_2D;if((w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(ut=w.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(ut,J.__webglTexture),Ht(ut,M),M.mipmaps&&M.mipmaps.length>0)for(let gt=0;gt<M.mipmaps.length;gt++)xt(z.__webglFramebuffer[gt],w,M,i.COLOR_ATTACHMENT0,ut,gt);else xt(z.__webglFramebuffer,w,M,i.COLOR_ATTACHMENT0,ut,0);m(M)&&p(ut),e.unbindTexture()}w.depthBuffer&&Ut(w)}function Zt(w){const M=w.textures;for(let z=0,J=M.length;z<J;z++){const et=M[z];if(m(et)){const j=x(w),wt=n.get(et).__webglTexture;e.bindTexture(j,wt),p(j),e.unbindTexture()}}}const Ae=[],k=[];function cn(w){if(w.samples>0){if(Kt(w)===!1){const M=w.textures,z=w.width,J=w.height;let et=i.COLOR_BUFFER_BIT;const j=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,wt=n.get(w),ut=M.length>1;if(ut)for(let gt=0;gt<M.length;gt++)e.bindFramebuffer(i.FRAMEBUFFER,wt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+gt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,wt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+gt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,wt.__webglMultisampledFramebuffer),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,wt.__webglFramebuffer);for(let gt=0;gt<M.length;gt++){if(w.resolveDepthBuffer&&(w.depthBuffer&&(et|=i.DEPTH_BUFFER_BIT),w.stencilBuffer&&w.resolveStencilBuffer&&(et|=i.STENCIL_BUFFER_BIT)),ut){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,wt.__webglColorRenderbuffer[gt]);const Jt=n.get(M[gt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Jt,0)}i.blitFramebuffer(0,0,z,J,0,0,z,J,et,i.NEAREST),l===!0&&(Ae.length=0,k.length=0,Ae.push(i.COLOR_ATTACHMENT0+gt),w.depthBuffer&&w.resolveDepthBuffer===!1&&(Ae.push(j),k.push(j),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,k)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Ae))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ut)for(let gt=0;gt<M.length;gt++){e.bindFramebuffer(i.FRAMEBUFFER,wt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+gt,i.RENDERBUFFER,wt.__webglColorRenderbuffer[gt]);const Jt=n.get(M[gt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,wt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+gt,i.TEXTURE_2D,Jt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,wt.__webglMultisampledFramebuffer)}else if(w.depthBuffer&&w.resolveDepthBuffer===!1&&l){const M=w.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[M])}}}function Yt(w){return Math.min(s.maxSamples,w.samples)}function Kt(w){const M=n.get(w);return w.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}function Dt(w){const M=a.render.frame;h.get(w)!==M&&(h.set(w,M),w.update())}function me(w,M){const z=w.colorSpace,J=w.format,et=w.type;return w.isCompressedTexture===!0||w.isVideoTexture===!0||z!==zs&&z!==gi&&(Qt.getTransfer(z)===ce?(J!==gn||et!==ei)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",z)),M}function Pt(w){return typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement?(c.width=w.naturalWidth||w.width,c.height=w.naturalHeight||w.height):typeof VideoFrame<"u"&&w instanceof VideoFrame?(c.width=w.displayWidth,c.height=w.displayHeight):(c.width=w.width,c.height=w.height),c}this.allocateTextureUnit=B,this.resetTextureUnits=K,this.setTexture2D=Z,this.setTexture2DArray=$,this.setTexture3D=nt,this.setTextureCube=W,this.rebindTextures=Gt,this.setupRenderTarget=Me,this.updateRenderTargetMipmap=Zt,this.updateMultisampleRenderTarget=cn,this.setupDepthRenderbuffer=Ut,this.setupFrameBufferTexture=xt,this.useMultisampledRTT=Kt}function q_(i,t){function e(n,s=gi){let r;const a=Qt.getTransfer(s);if(n===ei)return i.UNSIGNED_BYTE;if(n===Kl)return i.UNSIGNED_SHORT_4_4_4_4;if(n===jl)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Au)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===bu)return i.BYTE;if(n===Tu)return i.SHORT;if(n===Mr)return i.UNSIGNED_SHORT;if(n===Yl)return i.INT;if(n===Zi)return i.UNSIGNED_INT;if(n===Kn)return i.FLOAT;if(n===Lr)return i.HALF_FLOAT;if(n===wu)return i.ALPHA;if(n===Ru)return i.RGB;if(n===gn)return i.RGBA;if(n===Cu)return i.LUMINANCE;if(n===Lu)return i.LUMINANCE_ALPHA;if(n===Rs)return i.DEPTH_COMPONENT;if(n===Us)return i.DEPTH_STENCIL;if(n===Pu)return i.RED;if(n===Zl)return i.RED_INTEGER;if(n===Du)return i.RG;if(n===Jl)return i.RG_INTEGER;if(n===Ql)return i.RGBA_INTEGER;if(n===Ea||n===ba||n===Ta||n===Aa)if(a===ce)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Ea)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===ba)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Ta)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Aa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Ea)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===ba)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Ta)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Aa)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===sl||n===rl||n===al||n===ol)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===sl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===rl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===al)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===ol)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===ll||n===cl||n===hl)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===ll||n===cl)return a===ce?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===hl)return a===ce?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===ul||n===fl||n===dl||n===pl||n===ml||n===gl||n===_l||n===vl||n===xl||n===Ml||n===yl||n===Sl||n===El||n===bl)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===ul)return a===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===fl)return a===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===dl)return a===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===pl)return a===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===ml)return a===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===gl)return a===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===_l)return a===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===vl)return a===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===xl)return a===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Ml)return a===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===yl)return a===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Sl)return a===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===El)return a===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===bl)return a===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===wa||n===Tl||n===Al)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===wa)return a===ce?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Tl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Al)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Iu||n===wl||n===Rl||n===Cl)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===wa)return r.COMPRESSED_RED_RGTC1_EXT;if(n===wl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Rl)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Cl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Ns?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}class Y_ extends pn{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}class Cn extends We{constructor(){super(),this.isGroup=!0,this.type="Group"}}const K_={type:"move"};class Co{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Cn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Cn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new I,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new I),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Cn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new I,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new I),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(const _ of t.hand.values()){const m=e.getJointPose(_,n),p=this._getHandJoint(c,_);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],f=h.position.distanceTo(u.position),d=.02,g=.005;c.inputState.pinching&&f>d+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&f<=d-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(K_)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new Cn;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}const j_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Z_=`
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

}`;class J_{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){const s=new Ve,r=t.properties.get(s);r.__webglTexture=e.texture,(e.depthNear!=n.depthNear||e.depthFar!=n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=s}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new Ln({vertexShader:j_,fragmentShader:Z_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new be(new qi(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Q_ extends Bs{constructor(t,e){super();const n=this;let s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,f=null,d=null,g=null;const _=new J_,m=e.getContextAttributes();let p=null,x=null;const S=[],y=[],C=new Xt;let A=null;const R=new pn;R.viewport=new Re;const L=new pn;L.viewport=new Re;const T=[R,L],b=new Y_;let P=null,K=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let it=S[Y];return it===void 0&&(it=new Co,S[Y]=it),it.getTargetRaySpace()},this.getControllerGrip=function(Y){let it=S[Y];return it===void 0&&(it=new Co,S[Y]=it),it.getGripSpace()},this.getHand=function(Y){let it=S[Y];return it===void 0&&(it=new Co,S[Y]=it),it.getHandSpace()};function B(Y){const it=y.indexOf(Y.inputSource);if(it===-1)return;const xt=S[it];xt!==void 0&&(xt.update(Y.inputSource,Y.frame,c||a),xt.dispatchEvent({type:Y.type,data:Y.inputSource}))}function q(){s.removeEventListener("select",B),s.removeEventListener("selectstart",B),s.removeEventListener("selectend",B),s.removeEventListener("squeeze",B),s.removeEventListener("squeezestart",B),s.removeEventListener("squeezeend",B),s.removeEventListener("end",q),s.removeEventListener("inputsourceschange",Z);for(let Y=0;Y<S.length;Y++){const it=y[Y];it!==null&&(y[Y]=null,S[Y].disconnect(it))}P=null,K=null,_.reset(),t.setRenderTarget(p),d=null,f=null,u=null,s=null,x=null,ie.stop(),n.isPresenting=!1,t.setPixelRatio(A),t.setSize(C.width,C.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){r=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){o=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(Y){c=Y},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(Y){if(s=Y,s!==null){if(p=t.getRenderTarget(),s.addEventListener("select",B),s.addEventListener("selectstart",B),s.addEventListener("selectend",B),s.addEventListener("squeeze",B),s.addEventListener("squeezestart",B),s.addEventListener("squeezeend",B),s.addEventListener("end",q),s.addEventListener("inputsourceschange",Z),m.xrCompatible!==!0&&await e.makeXRCompatible(),A=t.getPixelRatio(),t.getSize(C),s.renderState.layers===void 0){const it={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(s,e,it),s.updateRenderState({baseLayer:d}),t.setPixelRatio(1),t.setSize(d.framebufferWidth,d.framebufferHeight,!1),x=new Ji(d.framebufferWidth,d.framebufferHeight,{format:gn,type:ei,colorSpace:t.outputColorSpace,stencilBuffer:m.stencil})}else{let it=null,xt=null,ot=null;m.depth&&(ot=m.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,it=m.stencil?Us:Rs,xt=m.stencil?Ns:Zi);const Lt={colorFormat:e.RGBA8,depthFormat:ot,scaleFactor:r};u=new XRWebGLBinding(s,e),f=u.createProjectionLayer(Lt),s.updateRenderState({layers:[f]}),t.setPixelRatio(1),t.setSize(f.textureWidth,f.textureHeight,!1),x=new Ji(f.textureWidth,f.textureHeight,{format:gn,type:ei,depthTexture:new qu(f.textureWidth,f.textureHeight,xt,void 0,void 0,void 0,void 0,void 0,void 0,it),stencilBuffer:m.stencil,colorSpace:t.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),ie.setContext(s),ie.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function Z(Y){for(let it=0;it<Y.removed.length;it++){const xt=Y.removed[it],ot=y.indexOf(xt);ot>=0&&(y[ot]=null,S[ot].disconnect(xt))}for(let it=0;it<Y.added.length;it++){const xt=Y.added[it];let ot=y.indexOf(xt);if(ot===-1){for(let Ut=0;Ut<S.length;Ut++)if(Ut>=y.length){y.push(xt),ot=Ut;break}else if(y[Ut]===null){y[Ut]=xt,ot=Ut;break}if(ot===-1)break}const Lt=S[ot];Lt&&Lt.connect(xt)}}const $=new I,nt=new I;function W(Y,it,xt){$.setFromMatrixPosition(it.matrixWorld),nt.setFromMatrixPosition(xt.matrixWorld);const ot=$.distanceTo(nt),Lt=it.projectionMatrix.elements,Ut=xt.projectionMatrix.elements,Gt=Lt[14]/(Lt[10]-1),Me=Lt[14]/(Lt[10]+1),Zt=(Lt[9]+1)/Lt[5],Ae=(Lt[9]-1)/Lt[5],k=(Lt[8]-1)/Lt[0],cn=(Ut[8]+1)/Ut[0],Yt=Gt*k,Kt=Gt*cn,Dt=ot/(-k+cn),me=Dt*-k;if(it.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(me),Y.translateZ(Dt),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),Lt[10]===-1)Y.projectionMatrix.copy(it.projectionMatrix),Y.projectionMatrixInverse.copy(it.projectionMatrixInverse);else{const Pt=Gt+Dt,w=Me+Dt,M=Yt-me,z=Kt+(ot-me),J=Zt*Me/w*Pt,et=Ae*Me/w*Pt;Y.projectionMatrix.makePerspective(M,z,J,et,Pt,w),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function ct(Y,it){it===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(it.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(s===null)return;let it=Y.near,xt=Y.far;_.texture!==null&&(_.depthNear>0&&(it=_.depthNear),_.depthFar>0&&(xt=_.depthFar)),b.near=L.near=R.near=it,b.far=L.far=R.far=xt,(P!==b.near||K!==b.far)&&(s.updateRenderState({depthNear:b.near,depthFar:b.far}),P=b.near,K=b.far),R.layers.mask=Y.layers.mask|2,L.layers.mask=Y.layers.mask|4,b.layers.mask=R.layers.mask|L.layers.mask;const ot=Y.parent,Lt=b.cameras;ct(b,ot);for(let Ut=0;Ut<Lt.length;Ut++)ct(Lt[Ut],ot);Lt.length===2?W(b,R,L):b.projectionMatrix.copy(R.projectionMatrix),mt(Y,b,ot)};function mt(Y,it,xt){xt===null?Y.matrix.copy(it.matrixWorld):(Y.matrix.copy(xt.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(it.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(it.projectionMatrix),Y.projectionMatrixInverse.copy(it.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=Pl*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return b},this.getFoveation=function(){if(!(f===null&&d===null))return l},this.setFoveation=function(Y){l=Y,f!==null&&(f.fixedFoveation=Y),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=Y)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(b)};let At=null;function Ht(Y,it){if(h=it.getViewerPose(c||a),g=it,h!==null){const xt=h.views;d!==null&&(t.setRenderTargetFramebuffer(x,d.framebuffer),t.setRenderTarget(x));let ot=!1;xt.length!==b.cameras.length&&(b.cameras.length=0,ot=!0);for(let Ut=0;Ut<xt.length;Ut++){const Gt=xt[Ut];let Me=null;if(d!==null)Me=d.getViewport(Gt);else{const Ae=u.getViewSubImage(f,Gt);Me=Ae.viewport,Ut===0&&(t.setRenderTargetTextures(x,Ae.colorTexture,f.ignoreDepthValues?void 0:Ae.depthStencilTexture),t.setRenderTarget(x))}let Zt=T[Ut];Zt===void 0&&(Zt=new pn,Zt.layers.enable(Ut),Zt.viewport=new Re,T[Ut]=Zt),Zt.matrix.fromArray(Gt.transform.matrix),Zt.matrix.decompose(Zt.position,Zt.quaternion,Zt.scale),Zt.projectionMatrix.fromArray(Gt.projectionMatrix),Zt.projectionMatrixInverse.copy(Zt.projectionMatrix).invert(),Zt.viewport.set(Me.x,Me.y,Me.width,Me.height),Ut===0&&(b.matrix.copy(Zt.matrix),b.matrix.decompose(b.position,b.quaternion,b.scale)),ot===!0&&b.cameras.push(Zt)}const Lt=s.enabledFeatures;if(Lt&&Lt.includes("depth-sensing")){const Ut=u.getDepthInformation(xt[0]);Ut&&Ut.isValid&&Ut.texture&&_.init(t,Ut,s.renderState)}}for(let xt=0;xt<S.length;xt++){const ot=y[xt],Lt=S[xt];ot!==null&&Lt!==void 0&&Lt.update(ot,it,c||a)}At&&At(Y,it),it.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:it}),g=null}const ie=new $u;ie.setAnimationLoop(Ht),this.setAnimationLoop=function(Y){At=Y},this.dispose=function(){}}}const zi=new ni,tv=new Se;function ev(i,t){function e(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,Gu(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,x,S,y){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),u(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p)):p.isMeshStandardMaterial?(r(m,p),f(m,p),p.isMeshPhysicalMaterial&&d(m,p,y)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),_(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?l(m,p,x,S):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,e(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===je&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,e(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===je&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,e(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,e(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,e(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const x=t.get(p),S=x.envMap,y=x.envMapRotation;S&&(m.envMap.value=S,zi.copy(y),zi.x*=-1,zi.y*=-1,zi.z*=-1,S.isCubeTexture&&S.isRenderTargetTexture===!1&&(zi.y*=-1,zi.z*=-1),m.envMapRotation.value.setFromMatrix4(tv.makeRotationFromEuler(zi)),m.flipEnvMap.value=S.isCubeTexture&&S.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,e(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,e(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,x,S){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*x,m.scale.value=S*.5,p.map&&(m.map.value=p.map,e(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function u(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function f(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,e(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,e(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function d(m,p,x){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,e(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,e(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,e(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,e(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,e(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===je&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,e(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,e(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=x.texture,m.transmissionSamplerSize.value.set(x.width,x.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,e(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,e(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,e(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,e(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,e(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function _(m,p){const x=t.get(p).light;m.referencePosition.value.setFromMatrixPosition(x.matrixWorld),m.nearDistance.value=x.shadow.camera.near,m.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function nv(i,t,e,n){let s={},r={},a=[];const o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(x,S){const y=S.program;n.uniformBlockBinding(x,y)}function c(x,S){let y=s[x.id];y===void 0&&(g(x),y=h(x),s[x.id]=y,x.addEventListener("dispose",m));const C=S.program;n.updateUBOMapping(x,C);const A=t.render.frame;r[x.id]!==A&&(f(x),r[x.id]=A)}function h(x){const S=u();x.__bindingPointIndex=S;const y=i.createBuffer(),C=x.__size,A=x.usage;return i.bindBuffer(i.UNIFORM_BUFFER,y),i.bufferData(i.UNIFORM_BUFFER,C,A),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,S,y),y}function u(){for(let x=0;x<o;x++)if(a.indexOf(x)===-1)return a.push(x),x;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(x){const S=s[x.id],y=x.uniforms,C=x.__cache;i.bindBuffer(i.UNIFORM_BUFFER,S);for(let A=0,R=y.length;A<R;A++){const L=Array.isArray(y[A])?y[A]:[y[A]];for(let T=0,b=L.length;T<b;T++){const P=L[T];if(d(P,A,T,C)===!0){const K=P.__offset,B=Array.isArray(P.value)?P.value:[P.value];let q=0;for(let Z=0;Z<B.length;Z++){const $=B[Z],nt=_($);typeof $=="number"||typeof $=="boolean"?(P.__data[0]=$,i.bufferSubData(i.UNIFORM_BUFFER,K+q,P.__data)):$.isMatrix3?(P.__data[0]=$.elements[0],P.__data[1]=$.elements[1],P.__data[2]=$.elements[2],P.__data[3]=0,P.__data[4]=$.elements[3],P.__data[5]=$.elements[4],P.__data[6]=$.elements[5],P.__data[7]=0,P.__data[8]=$.elements[6],P.__data[9]=$.elements[7],P.__data[10]=$.elements[8],P.__data[11]=0):($.toArray(P.__data,q),q+=nt.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,K,P.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function d(x,S,y,C){const A=x.value,R=S+"_"+y;if(C[R]===void 0)return typeof A=="number"||typeof A=="boolean"?C[R]=A:C[R]=A.clone(),!0;{const L=C[R];if(typeof A=="number"||typeof A=="boolean"){if(L!==A)return C[R]=A,!0}else if(L.equals(A)===!1)return L.copy(A),!0}return!1}function g(x){const S=x.uniforms;let y=0;const C=16;for(let R=0,L=S.length;R<L;R++){const T=Array.isArray(S[R])?S[R]:[S[R]];for(let b=0,P=T.length;b<P;b++){const K=T[b],B=Array.isArray(K.value)?K.value:[K.value];for(let q=0,Z=B.length;q<Z;q++){const $=B[q],nt=_($),W=y%C,ct=W%nt.boundary,mt=W+ct;y+=ct,mt!==0&&C-mt<nt.storage&&(y+=C-mt),K.__data=new Float32Array(nt.storage/Float32Array.BYTES_PER_ELEMENT),K.__offset=y,y+=nt.storage}}}const A=y%C;return A>0&&(y+=C-A),x.__size=y,x.__cache={},this}function _(x){const S={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(S.boundary=4,S.storage=4):x.isVector2?(S.boundary=8,S.storage=8):x.isVector3||x.isColor?(S.boundary=16,S.storage=12):x.isVector4?(S.boundary=16,S.storage=16):x.isMatrix3?(S.boundary=48,S.storage=48):x.isMatrix4?(S.boundary=64,S.storage=64):x.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",x),S}function m(x){const S=x.target;S.removeEventListener("dispose",m);const y=a.indexOf(S.__bindingPointIndex);a.splice(y,1),i.deleteBuffer(s[S.id]),delete s[S.id],delete r[S.id]}function p(){for(const x in s)i.deleteBuffer(s[x]);a=[],s={},r={}}return{bind:l,update:c,dispose:p}}class iv{constructor(t={}){const{canvas:e=Wd(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:f=!1}=t;this.isWebGLRenderer=!0;let d;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=n.getContextAttributes().alpha}else d=a;const g=new Uint32Array(4),_=new Int32Array(4);let m=null,p=null;const x=[],S=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=dn,this.toneMapping=Si,this.toneMappingExposure=1;const y=this;let C=!1,A=0,R=0,L=null,T=-1,b=null;const P=new Re,K=new Re;let B=null;const q=new ee(0);let Z=0,$=e.width,nt=e.height,W=1,ct=null,mt=null;const At=new Re(0,0,$,nt),Ht=new Re(0,0,$,nt);let ie=!1;const Y=new Xu;let it=!1,xt=!1;const ot=new Se,Lt=new Se,Ut=new I,Gt=new Re,Me={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Zt=!1;function Ae(){return L===null?W:1}let k=n;function cn(E,N){return e.getContext(E,N)}try{const E={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${ql}`),e.addEventListener("webglcontextlost",Q,!1),e.addEventListener("webglcontextrestored",pt,!1),e.addEventListener("webglcontextcreationerror",ft,!1),k===null){const N="webgl2";if(k=cn(N,E),k===null)throw cn(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(E){throw console.error("THREE.WebGLRenderer: "+E.message),E}let Yt,Kt,Dt,me,Pt,w,M,z,J,et,j,wt,ut,gt,Jt,st,_t,It,Ot,vt,jt,Vt,de,D;function ht(){Yt=new lg(k),Yt.init(),Vt=new q_(k,Yt),Kt=new eg(k,Yt,t,Vt),Dt=new W_(k,Yt),Kt.reverseDepthBuffer&&f&&Dt.buffers.depth.setReversed(!0),me=new ug(k),Pt=new C_,w=new $_(k,Yt,Dt,Pt,Kt,Vt,me),M=new ig(y),z=new og(y),J=new _p(k),de=new Q0(k,J),et=new cg(k,J,me,de),j=new dg(k,et,J,me),Ot=new fg(k,Kt,w),st=new ng(Pt),wt=new R_(y,M,z,Yt,Kt,de,st),ut=new ev(y,Pt),gt=new P_,Jt=new k_(Yt),It=new J0(y,M,z,Dt,j,d,l),_t=new G_(y,j,Kt),D=new nv(k,me,Kt,Dt),vt=new tg(k,Yt,me),jt=new hg(k,Yt,me),me.programs=wt.programs,y.capabilities=Kt,y.extensions=Yt,y.properties=Pt,y.renderLists=gt,y.shadowMap=_t,y.state=Dt,y.info=me}ht();const X=new Q_(y,k);this.xr=X,this.getContext=function(){return k},this.getContextAttributes=function(){return k.getContextAttributes()},this.forceContextLoss=function(){const E=Yt.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){const E=Yt.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return W},this.setPixelRatio=function(E){E!==void 0&&(W=E,this.setSize($,nt,!1))},this.getSize=function(E){return E.set($,nt)},this.setSize=function(E,N,H=!0){if(X.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}$=E,nt=N,e.width=Math.floor(E*W),e.height=Math.floor(N*W),H===!0&&(e.style.width=E+"px",e.style.height=N+"px"),this.setViewport(0,0,E,N)},this.getDrawingBufferSize=function(E){return E.set($*W,nt*W).floor()},this.setDrawingBufferSize=function(E,N,H){$=E,nt=N,W=H,e.width=Math.floor(E*H),e.height=Math.floor(N*H),this.setViewport(0,0,E,N)},this.getCurrentViewport=function(E){return E.copy(P)},this.getViewport=function(E){return E.copy(At)},this.setViewport=function(E,N,H,G){E.isVector4?At.set(E.x,E.y,E.z,E.w):At.set(E,N,H,G),Dt.viewport(P.copy(At).multiplyScalar(W).round())},this.getScissor=function(E){return E.copy(Ht)},this.setScissor=function(E,N,H,G){E.isVector4?Ht.set(E.x,E.y,E.z,E.w):Ht.set(E,N,H,G),Dt.scissor(K.copy(Ht).multiplyScalar(W).round())},this.getScissorTest=function(){return ie},this.setScissorTest=function(E){Dt.setScissorTest(ie=E)},this.setOpaqueSort=function(E){ct=E},this.setTransparentSort=function(E){mt=E},this.getClearColor=function(E){return E.copy(It.getClearColor())},this.setClearColor=function(){It.setClearColor.apply(It,arguments)},this.getClearAlpha=function(){return It.getClearAlpha()},this.setClearAlpha=function(){It.setClearAlpha.apply(It,arguments)},this.clear=function(E=!0,N=!0,H=!0){let G=0;if(E){let U=!1;if(L!==null){const rt=L.texture.format;U=rt===Ql||rt===Jl||rt===Zl}if(U){const rt=L.texture.type,dt=rt===ei||rt===Zi||rt===Mr||rt===Ns||rt===Kl||rt===jl,St=It.getClearColor(),Et=It.getClearAlpha(),kt=St.r,zt=St.g,bt=St.b;dt?(g[0]=kt,g[1]=zt,g[2]=bt,g[3]=Et,k.clearBufferuiv(k.COLOR,0,g)):(_[0]=kt,_[1]=zt,_[2]=bt,_[3]=Et,k.clearBufferiv(k.COLOR,0,_))}else G|=k.COLOR_BUFFER_BIT}N&&(G|=k.DEPTH_BUFFER_BIT),H&&(G|=k.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),k.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",Q,!1),e.removeEventListener("webglcontextrestored",pt,!1),e.removeEventListener("webglcontextcreationerror",ft,!1),gt.dispose(),Jt.dispose(),Pt.dispose(),M.dispose(),z.dispose(),j.dispose(),de.dispose(),D.dispose(),wt.dispose(),X.dispose(),X.removeEventListener("sessionstart",pc),X.removeEventListener("sessionend",mc),Ii.stop()};function Q(E){E.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),C=!0}function pt(){console.log("THREE.WebGLRenderer: Context Restored."),C=!1;const E=me.autoReset,N=_t.enabled,H=_t.autoUpdate,G=_t.needsUpdate,U=_t.type;ht(),me.autoReset=E,_t.enabled=N,_t.autoUpdate=H,_t.needsUpdate=G,_t.type=U}function ft(E){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function Ft(E){const N=E.target;N.removeEventListener("dispose",Ft),Ee(N)}function Ee(E){ze(E),Pt.remove(E)}function ze(E){const N=Pt.get(E).programs;N!==void 0&&(N.forEach(function(H){wt.releaseProgram(H)}),E.isShaderMaterial&&wt.releaseShaderCache(E))}this.renderBufferDirect=function(E,N,H,G,U,rt){N===null&&(N=Me);const dt=U.isMesh&&U.matrixWorld.determinant()<0,St=Jf(E,N,H,G,U);Dt.setMaterial(G,dt);let Et=H.index,kt=1;if(G.wireframe===!0){if(Et=et.getWireframeAttribute(H),Et===void 0)return;kt=2}const zt=H.drawRange,bt=H.attributes.position;let te=zt.start*kt,pe=(zt.start+zt.count)*kt;rt!==null&&(te=Math.max(te,rt.start*kt),pe=Math.min(pe,(rt.start+rt.count)*kt)),Et!==null?(te=Math.max(te,0),pe=Math.min(pe,Et.count)):bt!=null&&(te=Math.max(te,0),pe=Math.min(pe,bt.count));const ge=pe-te;if(ge<0||ge===1/0)return;de.setup(U,G,St,H,Et);let Qe,se=vt;if(Et!==null&&(Qe=J.get(Et),se=jt,se.setIndex(Qe)),U.isMesh)G.wireframe===!0?(Dt.setLineWidth(G.wireframeLinewidth*Ae()),se.setMode(k.LINES)):se.setMode(k.TRIANGLES);else if(U.isLine){let Rt=G.linewidth;Rt===void 0&&(Rt=1),Dt.setLineWidth(Rt*Ae()),U.isLineSegments?se.setMode(k.LINES):U.isLineLoop?se.setMode(k.LINE_LOOP):se.setMode(k.LINE_STRIP)}else U.isPoints?se.setMode(k.POINTS):U.isSprite&&se.setMode(k.TRIANGLES);if(U.isBatchedMesh)if(U._multiDrawInstances!==null)se.renderMultiDrawInstances(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount,U._multiDrawInstances);else if(Yt.get("WEBGL_multi_draw"))se.renderMultiDraw(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount);else{const Rt=U._multiDrawStarts,zn=U._multiDrawCounts,re=U._multiDrawCount,yn=Et?J.get(Et).bytesPerElement:1,ns=Pt.get(G).currentProgram.getUniforms();for(let en=0;en<re;en++)ns.setValue(k,"_gl_DrawID",en),se.render(Rt[en]/yn,zn[en])}else if(U.isInstancedMesh)se.renderInstances(te,ge,U.count);else if(H.isInstancedBufferGeometry){const Rt=H._maxInstanceCount!==void 0?H._maxInstanceCount:1/0,zn=Math.min(H.instanceCount,Rt);se.renderInstances(te,ge,zn)}else se.render(te,ge)};function le(E,N,H){E.transparent===!0&&E.side===mn&&E.forceSinglePass===!1?(E.side=je,E.needsUpdate=!0,Br(E,N,H),E.side=ti,E.needsUpdate=!0,Br(E,N,H),E.side=mn):Br(E,N,H)}this.compile=function(E,N,H=null){H===null&&(H=E),p=Jt.get(H),p.init(N),S.push(p),H.traverseVisible(function(U){U.isLight&&U.layers.test(N.layers)&&(p.pushLight(U),U.castShadow&&p.pushShadow(U))}),E!==H&&E.traverseVisible(function(U){U.isLight&&U.layers.test(N.layers)&&(p.pushLight(U),U.castShadow&&p.pushShadow(U))}),p.setupLights();const G=new Set;return E.traverse(function(U){if(!(U.isMesh||U.isPoints||U.isLine||U.isSprite))return;const rt=U.material;if(rt)if(Array.isArray(rt))for(let dt=0;dt<rt.length;dt++){const St=rt[dt];le(St,H,U),G.add(St)}else le(rt,H,U),G.add(rt)}),S.pop(),p=null,G},this.compileAsync=function(E,N,H=null){const G=this.compile(E,N,H);return new Promise(U=>{function rt(){if(G.forEach(function(dt){Pt.get(dt).currentProgram.isReady()&&G.delete(dt)}),G.size===0){U(E);return}setTimeout(rt,10)}Yt.get("KHR_parallel_shader_compile")!==null?rt():setTimeout(rt,10)})};let Mn=null;function Fn(E){Mn&&Mn(E)}function pc(){Ii.stop()}function mc(){Ii.start()}const Ii=new $u;Ii.setAnimationLoop(Fn),typeof self<"u"&&Ii.setContext(self),this.setAnimationLoop=function(E){Mn=E,X.setAnimationLoop(E),E===null?Ii.stop():Ii.start()},X.addEventListener("sessionstart",pc),X.addEventListener("sessionend",mc),this.render=function(E,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(C===!0)return;if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),X.enabled===!0&&X.isPresenting===!0&&(X.cameraAutoUpdate===!0&&X.updateCamera(N),N=X.getCamera()),E.isScene===!0&&E.onBeforeRender(y,E,N,L),p=Jt.get(E,S.length),p.init(N),S.push(p),Lt.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),Y.setFromProjectionMatrix(Lt),xt=this.localClippingEnabled,it=st.init(this.clippingPlanes,xt),m=gt.get(E,x.length),m.init(),x.push(m),X.enabled===!0&&X.isPresenting===!0){const rt=y.xr.getDepthSensingMesh();rt!==null&&Qa(rt,N,-1/0,y.sortObjects)}Qa(E,N,0,y.sortObjects),m.finish(),y.sortObjects===!0&&m.sort(ct,mt),Zt=X.enabled===!1||X.isPresenting===!1||X.hasDepthSensing()===!1,Zt&&It.addToRenderList(m,E),this.info.render.frame++,it===!0&&st.beginShadows();const H=p.state.shadowsArray;_t.render(H,E,N),it===!0&&st.endShadows(),this.info.autoReset===!0&&this.info.reset();const G=m.opaque,U=m.transmissive;if(p.setupLights(),N.isArrayCamera){const rt=N.cameras;if(U.length>0)for(let dt=0,St=rt.length;dt<St;dt++){const Et=rt[dt];_c(G,U,E,Et)}Zt&&It.render(E);for(let dt=0,St=rt.length;dt<St;dt++){const Et=rt[dt];gc(m,E,Et,Et.viewport)}}else U.length>0&&_c(G,U,E,N),Zt&&It.render(E),gc(m,E,N);L!==null&&(w.updateMultisampleRenderTarget(L),w.updateRenderTargetMipmap(L)),E.isScene===!0&&E.onAfterRender(y,E,N),de.resetDefaultState(),T=-1,b=null,S.pop(),S.length>0?(p=S[S.length-1],it===!0&&st.setGlobalState(y.clippingPlanes,p.state.camera)):p=null,x.pop(),x.length>0?m=x[x.length-1]:m=null};function Qa(E,N,H,G){if(E.visible===!1)return;if(E.layers.test(N.layers)){if(E.isGroup)H=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(N);else if(E.isLight)p.pushLight(E),E.castShadow&&p.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||Y.intersectsSprite(E)){G&&Gt.setFromMatrixPosition(E.matrixWorld).applyMatrix4(Lt);const dt=j.update(E),St=E.material;St.visible&&m.push(E,dt,St,H,Gt.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||Y.intersectsObject(E))){const dt=j.update(E),St=E.material;if(G&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Gt.copy(E.boundingSphere.center)):(dt.boundingSphere===null&&dt.computeBoundingSphere(),Gt.copy(dt.boundingSphere.center)),Gt.applyMatrix4(E.matrixWorld).applyMatrix4(Lt)),Array.isArray(St)){const Et=dt.groups;for(let kt=0,zt=Et.length;kt<zt;kt++){const bt=Et[kt],te=St[bt.materialIndex];te&&te.visible&&m.push(E,dt,te,H,Gt.z,bt)}}else St.visible&&m.push(E,dt,St,H,Gt.z,null)}}const rt=E.children;for(let dt=0,St=rt.length;dt<St;dt++)Qa(rt[dt],N,H,G)}function gc(E,N,H,G){const U=E.opaque,rt=E.transmissive,dt=E.transparent;p.setupLightsView(H),it===!0&&st.setGlobalState(y.clippingPlanes,H),G&&Dt.viewport(P.copy(G)),U.length>0&&zr(U,N,H),rt.length>0&&zr(rt,N,H),dt.length>0&&zr(dt,N,H),Dt.buffers.depth.setTest(!0),Dt.buffers.depth.setMask(!0),Dt.buffers.color.setMask(!0),Dt.setPolygonOffset(!1)}function _c(E,N,H,G){if((H.isScene===!0?H.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[G.id]===void 0&&(p.state.transmissionRenderTarget[G.id]=new Ji(1,1,{generateMipmaps:!0,type:Yt.has("EXT_color_buffer_half_float")||Yt.has("EXT_color_buffer_float")?Lr:ei,minFilter:On,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Qt.workingColorSpace}));const rt=p.state.transmissionRenderTarget[G.id],dt=G.viewport||P;rt.setSize(dt.z,dt.w);const St=y.getRenderTarget();y.setRenderTarget(rt),y.getClearColor(q),Z=y.getClearAlpha(),Z<1&&y.setClearColor(16777215,.5),y.clear(),Zt&&It.render(H);const Et=y.toneMapping;y.toneMapping=Si;const kt=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),p.setupLightsView(G),it===!0&&st.setGlobalState(y.clippingPlanes,G),zr(E,H,G),w.updateMultisampleRenderTarget(rt),w.updateRenderTargetMipmap(rt),Yt.has("WEBGL_multisampled_render_to_texture")===!1){let zt=!1;for(let bt=0,te=N.length;bt<te;bt++){const pe=N[bt],ge=pe.object,Qe=pe.geometry,se=pe.material,Rt=pe.group;if(se.side===mn&&ge.layers.test(G.layers)){const zn=se.side;se.side=je,se.needsUpdate=!0,vc(ge,H,G,Qe,se,Rt),se.side=zn,se.needsUpdate=!0,zt=!0}}zt===!0&&(w.updateMultisampleRenderTarget(rt),w.updateRenderTargetMipmap(rt))}y.setRenderTarget(St),y.setClearColor(q,Z),kt!==void 0&&(G.viewport=kt),y.toneMapping=Et}function zr(E,N,H){const G=N.isScene===!0?N.overrideMaterial:null;for(let U=0,rt=E.length;U<rt;U++){const dt=E[U],St=dt.object,Et=dt.geometry,kt=G===null?dt.material:G,zt=dt.group;St.layers.test(H.layers)&&vc(St,N,H,Et,kt,zt)}}function vc(E,N,H,G,U,rt){E.onBeforeRender(y,N,H,G,U,rt),E.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),U.onBeforeRender(y,N,H,G,E,rt),U.transparent===!0&&U.side===mn&&U.forceSinglePass===!1?(U.side=je,U.needsUpdate=!0,y.renderBufferDirect(H,N,G,U,E,rt),U.side=ti,U.needsUpdate=!0,y.renderBufferDirect(H,N,G,U,E,rt),U.side=mn):y.renderBufferDirect(H,N,G,U,E,rt),E.onAfterRender(y,N,H,G,U,rt)}function Br(E,N,H){N.isScene!==!0&&(N=Me);const G=Pt.get(E),U=p.state.lights,rt=p.state.shadowsArray,dt=U.state.version,St=wt.getParameters(E,U.state,rt,N,H),Et=wt.getProgramCacheKey(St);let kt=G.programs;G.environment=E.isMeshStandardMaterial?N.environment:null,G.fog=N.fog,G.envMap=(E.isMeshStandardMaterial?z:M).get(E.envMap||G.environment),G.envMapRotation=G.environment!==null&&E.envMap===null?N.environmentRotation:E.envMapRotation,kt===void 0&&(E.addEventListener("dispose",Ft),kt=new Map,G.programs=kt);let zt=kt.get(Et);if(zt!==void 0){if(G.currentProgram===zt&&G.lightsStateVersion===dt)return Mc(E,St),zt}else St.uniforms=wt.getUniforms(E),E.onBeforeCompile(St,y),zt=wt.acquireProgram(St,Et),kt.set(Et,zt),G.uniforms=St.uniforms;const bt=G.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(bt.clippingPlanes=st.uniform),Mc(E,St),G.needsLights=td(E),G.lightsStateVersion=dt,G.needsLights&&(bt.ambientLightColor.value=U.state.ambient,bt.lightProbe.value=U.state.probe,bt.directionalLights.value=U.state.directional,bt.directionalLightShadows.value=U.state.directionalShadow,bt.spotLights.value=U.state.spot,bt.spotLightShadows.value=U.state.spotShadow,bt.rectAreaLights.value=U.state.rectArea,bt.ltc_1.value=U.state.rectAreaLTC1,bt.ltc_2.value=U.state.rectAreaLTC2,bt.pointLights.value=U.state.point,bt.pointLightShadows.value=U.state.pointShadow,bt.hemisphereLights.value=U.state.hemi,bt.directionalShadowMap.value=U.state.directionalShadowMap,bt.directionalShadowMatrix.value=U.state.directionalShadowMatrix,bt.spotShadowMap.value=U.state.spotShadowMap,bt.spotLightMatrix.value=U.state.spotLightMatrix,bt.spotLightMap.value=U.state.spotLightMap,bt.pointShadowMap.value=U.state.pointShadowMap,bt.pointShadowMatrix.value=U.state.pointShadowMatrix),G.currentProgram=zt,G.uniformsList=null,zt}function xc(E){if(E.uniformsList===null){const N=E.currentProgram.getUniforms();E.uniformsList=Ca.seqWithValue(N.seq,E.uniforms)}return E.uniformsList}function Mc(E,N){const H=Pt.get(E);H.outputColorSpace=N.outputColorSpace,H.batching=N.batching,H.batchingColor=N.batchingColor,H.instancing=N.instancing,H.instancingColor=N.instancingColor,H.instancingMorph=N.instancingMorph,H.skinning=N.skinning,H.morphTargets=N.morphTargets,H.morphNormals=N.morphNormals,H.morphColors=N.morphColors,H.morphTargetsCount=N.morphTargetsCount,H.numClippingPlanes=N.numClippingPlanes,H.numIntersection=N.numClipIntersection,H.vertexAlphas=N.vertexAlphas,H.vertexTangents=N.vertexTangents,H.toneMapping=N.toneMapping}function Jf(E,N,H,G,U){N.isScene!==!0&&(N=Me),w.resetTextureUnits();const rt=N.fog,dt=G.isMeshStandardMaterial?N.environment:null,St=L===null?y.outputColorSpace:L.isXRRenderTarget===!0?L.texture.colorSpace:zs,Et=(G.isMeshStandardMaterial?z:M).get(G.envMap||dt),kt=G.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,zt=!!H.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),bt=!!H.morphAttributes.position,te=!!H.morphAttributes.normal,pe=!!H.morphAttributes.color;let ge=Si;G.toneMapped&&(L===null||L.isXRRenderTarget===!0)&&(ge=y.toneMapping);const Qe=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,se=Qe!==void 0?Qe.length:0,Rt=Pt.get(G),zn=p.state.lights;if(it===!0&&(xt===!0||E!==b)){const hn=E===b&&G.id===T;st.setState(G,E,hn)}let re=!1;G.version===Rt.__version?(Rt.needsLights&&Rt.lightsStateVersion!==zn.state.version||Rt.outputColorSpace!==St||U.isBatchedMesh&&Rt.batching===!1||!U.isBatchedMesh&&Rt.batching===!0||U.isBatchedMesh&&Rt.batchingColor===!0&&U.colorTexture===null||U.isBatchedMesh&&Rt.batchingColor===!1&&U.colorTexture!==null||U.isInstancedMesh&&Rt.instancing===!1||!U.isInstancedMesh&&Rt.instancing===!0||U.isSkinnedMesh&&Rt.skinning===!1||!U.isSkinnedMesh&&Rt.skinning===!0||U.isInstancedMesh&&Rt.instancingColor===!0&&U.instanceColor===null||U.isInstancedMesh&&Rt.instancingColor===!1&&U.instanceColor!==null||U.isInstancedMesh&&Rt.instancingMorph===!0&&U.morphTexture===null||U.isInstancedMesh&&Rt.instancingMorph===!1&&U.morphTexture!==null||Rt.envMap!==Et||G.fog===!0&&Rt.fog!==rt||Rt.numClippingPlanes!==void 0&&(Rt.numClippingPlanes!==st.numPlanes||Rt.numIntersection!==st.numIntersection)||Rt.vertexAlphas!==kt||Rt.vertexTangents!==zt||Rt.morphTargets!==bt||Rt.morphNormals!==te||Rt.morphColors!==pe||Rt.toneMapping!==ge||Rt.morphTargetsCount!==se)&&(re=!0):(re=!0,Rt.__version=G.version);let yn=Rt.currentProgram;re===!0&&(yn=Br(G,N,U));let ns=!1,en=!1,Xs=!1;const _e=yn.getUniforms(),Dn=Rt.uniforms;if(Dt.useProgram(yn.program)&&(ns=!0,en=!0,Xs=!0),G.id!==T&&(T=G.id,en=!0),ns||b!==E){Dt.buffers.depth.getReversed()?(ot.copy(E.projectionMatrix),$d(ot),qd(ot),_e.setValue(k,"projectionMatrix",ot)):_e.setValue(k,"projectionMatrix",E.projectionMatrix),_e.setValue(k,"viewMatrix",E.matrixWorldInverse);const ri=_e.map.cameraPosition;ri!==void 0&&ri.setValue(k,Ut.setFromMatrixPosition(E.matrixWorld)),Kt.logarithmicDepthBuffer&&_e.setValue(k,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&_e.setValue(k,"isOrthographic",E.isOrthographicCamera===!0),b!==E&&(b=E,en=!0,Xs=!0)}if(U.isSkinnedMesh){_e.setOptional(k,U,"bindMatrix"),_e.setOptional(k,U,"bindMatrixInverse");const hn=U.skeleton;hn&&(hn.boneTexture===null&&hn.computeBoneTexture(),_e.setValue(k,"boneTexture",hn.boneTexture,w))}U.isBatchedMesh&&(_e.setOptional(k,U,"batchingTexture"),_e.setValue(k,"batchingTexture",U._matricesTexture,w),_e.setOptional(k,U,"batchingIdTexture"),_e.setValue(k,"batchingIdTexture",U._indirectTexture,w),_e.setOptional(k,U,"batchingColorTexture"),U._colorsTexture!==null&&_e.setValue(k,"batchingColorTexture",U._colorsTexture,w));const $s=H.morphAttributes;if(($s.position!==void 0||$s.normal!==void 0||$s.color!==void 0)&&Ot.update(U,H,yn),(en||Rt.receiveShadow!==U.receiveShadow)&&(Rt.receiveShadow=U.receiveShadow,_e.setValue(k,"receiveShadow",U.receiveShadow)),G.isMeshGouraudMaterial&&G.envMap!==null&&(Dn.envMap.value=Et,Dn.flipEnvMap.value=Et.isCubeTexture&&Et.isRenderTargetTexture===!1?-1:1),G.isMeshStandardMaterial&&G.envMap===null&&N.environment!==null&&(Dn.envMapIntensity.value=N.environmentIntensity),en&&(_e.setValue(k,"toneMappingExposure",y.toneMappingExposure),Rt.needsLights&&Qf(Dn,Xs),rt&&G.fog===!0&&ut.refreshFogUniforms(Dn,rt),ut.refreshMaterialUniforms(Dn,G,W,nt,p.state.transmissionRenderTarget[E.id]),Ca.upload(k,xc(Rt),Dn,w)),G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(Ca.upload(k,xc(Rt),Dn,w),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&_e.setValue(k,"center",U.center),_e.setValue(k,"modelViewMatrix",U.modelViewMatrix),_e.setValue(k,"normalMatrix",U.normalMatrix),_e.setValue(k,"modelMatrix",U.matrixWorld),G.isShaderMaterial||G.isRawShaderMaterial){const hn=G.uniformsGroups;for(let ri=0,ai=hn.length;ri<ai;ri++){const yc=hn[ri];D.update(yc,yn),D.bind(yc,yn)}}return yn}function Qf(E,N){E.ambientLightColor.needsUpdate=N,E.lightProbe.needsUpdate=N,E.directionalLights.needsUpdate=N,E.directionalLightShadows.needsUpdate=N,E.pointLights.needsUpdate=N,E.pointLightShadows.needsUpdate=N,E.spotLights.needsUpdate=N,E.spotLightShadows.needsUpdate=N,E.rectAreaLights.needsUpdate=N,E.hemisphereLights.needsUpdate=N}function td(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return A},this.getActiveMipmapLevel=function(){return R},this.getRenderTarget=function(){return L},this.setRenderTargetTextures=function(E,N,H){Pt.get(E.texture).__webglTexture=N,Pt.get(E.depthTexture).__webglTexture=H;const G=Pt.get(E);G.__hasExternalTextures=!0,G.__autoAllocateDepthBuffer=H===void 0,G.__autoAllocateDepthBuffer||Yt.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),G.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(E,N){const H=Pt.get(E);H.__webglFramebuffer=N,H.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(E,N=0,H=0){L=E,A=N,R=H;let G=!0,U=null,rt=!1,dt=!1;if(E){const Et=Pt.get(E);if(Et.__useDefaultFramebuffer!==void 0)Dt.bindFramebuffer(k.FRAMEBUFFER,null),G=!1;else if(Et.__webglFramebuffer===void 0)w.setupRenderTarget(E);else if(Et.__hasExternalTextures)w.rebindTextures(E,Pt.get(E.texture).__webglTexture,Pt.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){const bt=E.depthTexture;if(Et.__boundDepthTexture!==bt){if(bt!==null&&Pt.has(bt)&&(E.width!==bt.image.width||E.height!==bt.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");w.setupDepthRenderbuffer(E)}}const kt=E.texture;(kt.isData3DTexture||kt.isDataArrayTexture||kt.isCompressedArrayTexture)&&(dt=!0);const zt=Pt.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(zt[N])?U=zt[N][H]:U=zt[N],rt=!0):E.samples>0&&w.useMultisampledRTT(E)===!1?U=Pt.get(E).__webglMultisampledFramebuffer:Array.isArray(zt)?U=zt[H]:U=zt,P.copy(E.viewport),K.copy(E.scissor),B=E.scissorTest}else P.copy(At).multiplyScalar(W).floor(),K.copy(Ht).multiplyScalar(W).floor(),B=ie;if(Dt.bindFramebuffer(k.FRAMEBUFFER,U)&&G&&Dt.drawBuffers(E,U),Dt.viewport(P),Dt.scissor(K),Dt.setScissorTest(B),rt){const Et=Pt.get(E.texture);k.framebufferTexture2D(k.FRAMEBUFFER,k.COLOR_ATTACHMENT0,k.TEXTURE_CUBE_MAP_POSITIVE_X+N,Et.__webglTexture,H)}else if(dt){const Et=Pt.get(E.texture),kt=N||0;k.framebufferTextureLayer(k.FRAMEBUFFER,k.COLOR_ATTACHMENT0,Et.__webglTexture,H||0,kt)}T=-1},this.readRenderTargetPixels=function(E,N,H,G,U,rt,dt){if(!(E&&E.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let St=Pt.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&dt!==void 0&&(St=St[dt]),St){Dt.bindFramebuffer(k.FRAMEBUFFER,St);try{const Et=E.texture,kt=Et.format,zt=Et.type;if(!Kt.textureFormatReadable(kt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Kt.textureTypeReadable(zt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=E.width-G&&H>=0&&H<=E.height-U&&k.readPixels(N,H,G,U,Vt.convert(kt),Vt.convert(zt),rt)}finally{const Et=L!==null?Pt.get(L).__webglFramebuffer:null;Dt.bindFramebuffer(k.FRAMEBUFFER,Et)}}},this.readRenderTargetPixelsAsync=async function(E,N,H,G,U,rt,dt){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let St=Pt.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&dt!==void 0&&(St=St[dt]),St){const Et=E.texture,kt=Et.format,zt=Et.type;if(!Kt.textureFormatReadable(kt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Kt.textureTypeReadable(zt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(N>=0&&N<=E.width-G&&H>=0&&H<=E.height-U){Dt.bindFramebuffer(k.FRAMEBUFFER,St);const bt=k.createBuffer();k.bindBuffer(k.PIXEL_PACK_BUFFER,bt),k.bufferData(k.PIXEL_PACK_BUFFER,rt.byteLength,k.STREAM_READ),k.readPixels(N,H,G,U,Vt.convert(kt),Vt.convert(zt),0);const te=L!==null?Pt.get(L).__webglFramebuffer:null;Dt.bindFramebuffer(k.FRAMEBUFFER,te);const pe=k.fenceSync(k.SYNC_GPU_COMMANDS_COMPLETE,0);return k.flush(),await Xd(k,pe,4),k.bindBuffer(k.PIXEL_PACK_BUFFER,bt),k.getBufferSubData(k.PIXEL_PACK_BUFFER,0,rt),k.deleteBuffer(bt),k.deleteSync(pe),rt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(E,N=null,H=0){E.isTexture!==!0&&(lr("WebGLRenderer: copyFramebufferToTexture function signature has changed."),N=arguments[0]||null,E=arguments[1]);const G=Math.pow(2,-H),U=Math.floor(E.image.width*G),rt=Math.floor(E.image.height*G),dt=N!==null?N.x:0,St=N!==null?N.y:0;w.setTexture2D(E,0),k.copyTexSubImage2D(k.TEXTURE_2D,H,0,0,dt,St,U,rt),Dt.unbindTexture()},this.copyTextureToTexture=function(E,N,H=null,G=null,U=0){E.isTexture!==!0&&(lr("WebGLRenderer: copyTextureToTexture function signature has changed."),G=arguments[0]||null,E=arguments[1],N=arguments[2],U=arguments[3]||0,H=null);let rt,dt,St,Et,kt,zt,bt,te,pe;const ge=E.isCompressedTexture?E.mipmaps[U]:E.image;H!==null?(rt=H.max.x-H.min.x,dt=H.max.y-H.min.y,St=H.isBox3?H.max.z-H.min.z:1,Et=H.min.x,kt=H.min.y,zt=H.isBox3?H.min.z:0):(rt=ge.width,dt=ge.height,St=ge.depth||1,Et=0,kt=0,zt=0),G!==null?(bt=G.x,te=G.y,pe=G.z):(bt=0,te=0,pe=0);const Qe=Vt.convert(N.format),se=Vt.convert(N.type);let Rt;N.isData3DTexture?(w.setTexture3D(N,0),Rt=k.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(w.setTexture2DArray(N,0),Rt=k.TEXTURE_2D_ARRAY):(w.setTexture2D(N,0),Rt=k.TEXTURE_2D),k.pixelStorei(k.UNPACK_FLIP_Y_WEBGL,N.flipY),k.pixelStorei(k.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),k.pixelStorei(k.UNPACK_ALIGNMENT,N.unpackAlignment);const zn=k.getParameter(k.UNPACK_ROW_LENGTH),re=k.getParameter(k.UNPACK_IMAGE_HEIGHT),yn=k.getParameter(k.UNPACK_SKIP_PIXELS),ns=k.getParameter(k.UNPACK_SKIP_ROWS),en=k.getParameter(k.UNPACK_SKIP_IMAGES);k.pixelStorei(k.UNPACK_ROW_LENGTH,ge.width),k.pixelStorei(k.UNPACK_IMAGE_HEIGHT,ge.height),k.pixelStorei(k.UNPACK_SKIP_PIXELS,Et),k.pixelStorei(k.UNPACK_SKIP_ROWS,kt),k.pixelStorei(k.UNPACK_SKIP_IMAGES,zt);const Xs=E.isDataArrayTexture||E.isData3DTexture,_e=N.isDataArrayTexture||N.isData3DTexture;if(E.isRenderTargetTexture||E.isDepthTexture){const Dn=Pt.get(E),$s=Pt.get(N),hn=Pt.get(Dn.__renderTarget),ri=Pt.get($s.__renderTarget);Dt.bindFramebuffer(k.READ_FRAMEBUFFER,hn.__webglFramebuffer),Dt.bindFramebuffer(k.DRAW_FRAMEBUFFER,ri.__webglFramebuffer);for(let ai=0;ai<St;ai++)Xs&&k.framebufferTextureLayer(k.READ_FRAMEBUFFER,k.COLOR_ATTACHMENT0,Pt.get(E).__webglTexture,U,zt+ai),E.isDepthTexture?(_e&&k.framebufferTextureLayer(k.DRAW_FRAMEBUFFER,k.COLOR_ATTACHMENT0,Pt.get(N).__webglTexture,U,pe+ai),k.blitFramebuffer(Et,kt,rt,dt,bt,te,rt,dt,k.DEPTH_BUFFER_BIT,k.NEAREST)):_e?k.copyTexSubImage3D(Rt,U,bt,te,pe+ai,Et,kt,rt,dt):k.copyTexSubImage2D(Rt,U,bt,te,pe+ai,Et,kt,rt,dt);Dt.bindFramebuffer(k.READ_FRAMEBUFFER,null),Dt.bindFramebuffer(k.DRAW_FRAMEBUFFER,null)}else _e?E.isDataTexture||E.isData3DTexture?k.texSubImage3D(Rt,U,bt,te,pe,rt,dt,St,Qe,se,ge.data):N.isCompressedArrayTexture?k.compressedTexSubImage3D(Rt,U,bt,te,pe,rt,dt,St,Qe,ge.data):k.texSubImage3D(Rt,U,bt,te,pe,rt,dt,St,Qe,se,ge):E.isDataTexture?k.texSubImage2D(k.TEXTURE_2D,U,bt,te,rt,dt,Qe,se,ge.data):E.isCompressedTexture?k.compressedTexSubImage2D(k.TEXTURE_2D,U,bt,te,ge.width,ge.height,Qe,ge.data):k.texSubImage2D(k.TEXTURE_2D,U,bt,te,rt,dt,Qe,se,ge);k.pixelStorei(k.UNPACK_ROW_LENGTH,zn),k.pixelStorei(k.UNPACK_IMAGE_HEIGHT,re),k.pixelStorei(k.UNPACK_SKIP_PIXELS,yn),k.pixelStorei(k.UNPACK_SKIP_ROWS,ns),k.pixelStorei(k.UNPACK_SKIP_IMAGES,en),U===0&&N.generateMipmaps&&k.generateMipmap(Rt),Dt.unbindTexture()},this.copyTextureToTexture3D=function(E,N,H=null,G=null,U=0){return E.isTexture!==!0&&(lr("WebGLRenderer: copyTextureToTexture3D function signature has changed."),H=arguments[0]||null,G=arguments[1]||null,E=arguments[2],N=arguments[3],U=arguments[4]||0),lr('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(E,N,H,G,U)},this.initRenderTarget=function(E){Pt.get(E).__webglFramebuffer===void 0&&w.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?w.setTextureCube(E,0):E.isData3DTexture?w.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?w.setTexture2DArray(E,0):w.setTexture2D(E,0),Dt.unbindTexture()},this.resetState=function(){A=0,R=0,L=null,Dt.reset(),de.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return jn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorspace=Qt._getDrawingBufferColorSpace(t),e.unpackColorSpace=Qt._getUnpackColorSpace()}}class sv extends We{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ni,this.environmentIntensity=1,this.environmentRotation=new ni,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class rv{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=Ll,this.updateRanges=[],this.version=0,this.uuid=Ei()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let s=0,r=this.stride;s<r;s++)this.array[t+s]=e.array[n+s];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ei()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){return t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ei()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Xe=new I;class Fa{constructor(t,e,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)Xe.fromBufferAttribute(this,e),Xe.applyMatrix4(t),this.setXYZ(e,Xe.x,Xe.y,Xe.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Xe.fromBufferAttribute(this,e),Xe.applyNormalMatrix(t),this.setXYZ(e,Xe.x,Xe.y,Xe.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Xe.fromBufferAttribute(this,e),Xe.transformDirection(t),this.setXYZ(e,Xe.x,Xe.y,Xe.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=Un(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=ue(n,this.array)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=ue(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=ue(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=ue(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=ue(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=Un(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=Un(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=Un(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=Un(e,this.array)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=ue(e,this.array),n=ue(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,s){return t=t*this.data.stride+this.offset,this.normalized&&(e=ue(e,this.array),n=ue(n,this.array),s=ue(s,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=ue(e,this.array),n=ue(n,this.array),s=ue(s,this.array),r=ue(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this.data.array[t+3]=r,this}clone(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return new Pe(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new Fa(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class Ju extends Qi{static get type(){return"SpriteMaterial"}constructor(t){super(),this.isSpriteMaterial=!0,this.color=new ee(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}let _s;const Zs=new I,vs=new I,xs=new I,Ms=new Xt,Js=new Xt,Qu=new Se,la=new I,Qs=new I,ca=new I,xh=new Xt,Lo=new Xt,Mh=new Xt;class av extends We{constructor(t=new Ju){if(super(),this.isSprite=!0,this.type="Sprite",_s===void 0){_s=new De;const e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new rv(e,5);_s.setIndex([0,1,2,0,2,3]),_s.setAttribute("position",new Fa(n,3,0,!1)),_s.setAttribute("uv",new Fa(n,2,3,!1))}this.geometry=_s,this.material=t,this.center=new Xt(.5,.5)}raycast(t,e){t.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),vs.setFromMatrixScale(this.matrixWorld),Qu.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),xs.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&vs.multiplyScalar(-xs.z);const n=this.material.rotation;let s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));const a=this.center;ha(la.set(-.5,-.5,0),xs,a,vs,s,r),ha(Qs.set(.5,-.5,0),xs,a,vs,s,r),ha(ca.set(.5,.5,0),xs,a,vs,s,r),xh.set(0,0),Lo.set(1,0),Mh.set(1,1);let o=t.ray.intersectTriangle(la,Qs,ca,!1,Zs);if(o===null&&(ha(Qs.set(-.5,.5,0),xs,a,vs,s,r),Lo.set(0,1),o=t.ray.intersectTriangle(la,ca,Qs,!1,Zs),o===null))return;const l=t.ray.origin.distanceTo(Zs);l<t.near||l>t.far||e.push({distance:l,point:Zs.clone(),uv:rn.getInterpolation(Zs,la,Qs,ca,xh,Lo,Mh,new Xt),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}}function ha(i,t,e,n,s,r){Ms.subVectors(i,e).addScalar(.5).multiply(n),s!==void 0?(Js.x=r*Ms.x-s*Ms.y,Js.y=s*Ms.x+r*Ms.y):Js.copy(Ms),i.copy(t),i.x+=Js.x,i.y+=Js.y,i.applyMatrix4(Qu)}class ov extends Ve{constructor(t=null,e=1,n=1,s,r,a,o,l,c=Ze,h=Ze,u,f){super(null,a,o,l,c,h,s,r,u,f),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class hr extends Qi{static get type(){return"LineBasicMaterial"}constructor(t){super(),this.isLineBasicMaterial=!0,this.color=new ee(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const za=new I,Ba=new I,yh=new Se,tr=new tc,ua=new Hs,Po=new I,Sh=new I;class Il extends We{constructor(t=new De,e=new hr){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[0];for(let s=1,r=e.count;s<r;s++)za.fromBufferAttribute(e,s-1),Ba.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=za.distanceTo(Ba);t.setAttribute("lineDistance",new Je(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){const n=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ua.copy(n.boundingSphere),ua.applyMatrix4(s),ua.radius+=r,t.ray.intersectsSphere(ua)===!1)return;yh.copy(s).invert(),tr.copy(t.ray).applyMatrix4(yh);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=n.index,f=n.attributes.position;if(h!==null){const d=Math.max(0,a.start),g=Math.min(h.count,a.start+a.count);for(let _=d,m=g-1;_<m;_+=c){const p=h.getX(_),x=h.getX(_+1),S=fa(this,t,tr,l,p,x);S&&e.push(S)}if(this.isLineLoop){const _=h.getX(g-1),m=h.getX(d),p=fa(this,t,tr,l,_,m);p&&e.push(p)}}else{const d=Math.max(0,a.start),g=Math.min(f.count,a.start+a.count);for(let _=d,m=g-1;_<m;_+=c){const p=fa(this,t,tr,l,_,_+1);p&&e.push(p)}if(this.isLineLoop){const _=fa(this,t,tr,l,g-1,d);_&&e.push(_)}}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function fa(i,t,e,n,s,r){const a=i.geometry.attributes.position;if(za.fromBufferAttribute(a,s),Ba.fromBufferAttribute(a,r),e.distanceSqToSegment(za,Ba,Po,Sh)>n)return;Po.applyMatrix4(i.matrixWorld);const l=t.ray.origin.distanceTo(Po);if(!(l<t.near||l>t.far))return{distance:l,point:Sh.clone().applyMatrix4(i.matrixWorld),index:s,face:null,faceIndex:null,barycoord:null,object:i}}const Eh=new I,bh=new I;class Th extends Il{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[];for(let s=0,r=e.count;s<r;s+=2)Eh.fromBufferAttribute(e,s),bh.fromBufferAttribute(e,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Eh.distanceTo(bh);t.setAttribute("lineDistance",new Je(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class tf extends Qi{static get type(){return"PointsMaterial"}constructor(t){super(),this.isPointsMaterial=!0,this.color=new ee(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}const Ah=new Se,Nl=new tc,da=new Hs,pa=new I;class lv extends We{constructor(t=new De,e=new tf){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){const n=this.geometry,s=this.matrixWorld,r=t.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),da.copy(n.boundingSphere),da.applyMatrix4(s),da.radius+=r,t.ray.intersectsSphere(da)===!1)return;Ah.copy(s).invert(),Nl.copy(t.ray).applyMatrix4(Ah);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,u=n.attributes.position;if(c!==null){const f=Math.max(0,a.start),d=Math.min(c.count,a.start+a.count);for(let g=f,_=d;g<_;g++){const m=c.getX(g);pa.fromBufferAttribute(u,m),wh(pa,m,l,s,t,e,this)}}else{const f=Math.max(0,a.start),d=Math.min(u.count,a.start+a.count);for(let g=f,_=d;g<_;g++)pa.fromBufferAttribute(u,g),wh(pa,g,l,s,t,e,this)}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function wh(i,t,e,n,s,r,a){const o=Nl.distanceSqToPoint(i);if(o<e){const l=new I;Nl.closestPointToPoint(i,l),l.applyMatrix4(n);const c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:a})}}class La extends Ve{constructor(t,e,n,s,r,a,o,l,c){super(t,e,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}const ma=new I,ga=new I,Do=new I,_a=new rn;class cv extends De{constructor(t=null,e=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:t,thresholdAngle:e},t!==null){const s=Math.pow(10,4),r=Math.cos(Ra*e),a=t.getIndex(),o=t.getAttribute("position"),l=a?a.count:o.count,c=[0,0,0],h=["a","b","c"],u=new Array(3),f={},d=[];for(let g=0;g<l;g+=3){a?(c[0]=a.getX(g),c[1]=a.getX(g+1),c[2]=a.getX(g+2)):(c[0]=g,c[1]=g+1,c[2]=g+2);const{a:_,b:m,c:p}=_a;if(_.fromBufferAttribute(o,c[0]),m.fromBufferAttribute(o,c[1]),p.fromBufferAttribute(o,c[2]),_a.getNormal(Do),u[0]=`${Math.round(_.x*s)},${Math.round(_.y*s)},${Math.round(_.z*s)}`,u[1]=`${Math.round(m.x*s)},${Math.round(m.y*s)},${Math.round(m.z*s)}`,u[2]=`${Math.round(p.x*s)},${Math.round(p.y*s)},${Math.round(p.z*s)}`,!(u[0]===u[1]||u[1]===u[2]||u[2]===u[0]))for(let x=0;x<3;x++){const S=(x+1)%3,y=u[x],C=u[S],A=_a[h[x]],R=_a[h[S]],L=`${y}_${C}`,T=`${C}_${y}`;T in f&&f[T]?(Do.dot(f[T].normal)<=r&&(d.push(A.x,A.y,A.z),d.push(R.x,R.y,R.z)),f[T]=null):L in f||(f[L]={index0:c[x],index1:c[S],normal:Do.clone()})}}for(const g in f)if(f[g]){const{index0:_,index1:m}=f[g];ma.fromBufferAttribute(o,_),ga.fromBufferAttribute(o,m),d.push(ma.x,ma.y,ma.z),d.push(ga.x,ga.y,ga.z)}this.setAttribute("position",new Je(d,3))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}}class nc extends De{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const l=Math.min(a+o,Math.PI);let c=0;const h=[],u=new I,f=new I,d=[],g=[],_=[],m=[];for(let p=0;p<=n;p++){const x=[],S=p/n;let y=0;p===0&&a===0?y=.5/e:p===n&&l===Math.PI&&(y=-.5/e);for(let C=0;C<=e;C++){const A=C/e;u.x=-t*Math.cos(s+A*r)*Math.sin(a+S*o),u.y=t*Math.cos(a+S*o),u.z=t*Math.sin(s+A*r)*Math.sin(a+S*o),g.push(u.x,u.y,u.z),f.copy(u).normalize(),_.push(f.x,f.y,f.z),m.push(A+y,1-S),x.push(c++)}h.push(x)}for(let p=0;p<n;p++)for(let x=0;x<e;x++){const S=h[p][x+1],y=h[p][x],C=h[p+1][x],A=h[p+1][x+1];(p!==0||a>0)&&d.push(S,y,A),(p!==n-1||l<Math.PI)&&d.push(y,C,A)}this.setIndex(d),this.setAttribute("position",new Je(g,3)),this.setAttribute("normal",new Je(_,3)),this.setAttribute("uv",new Je(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new nc(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:ql}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=ql);const ii=11,ic=16,Ul=27,ef=11,hv=["RicoReWi","YourTime-FM","RapRadio 24","SchlagerPop 24","ChartRadio 24","ClubRadio 24","AnMaCha 24","RadioFloh!","RockRadio 24","ChristmasRadio","KultRadio 24","Zocker-FM","Special-Radio","AnMaChaCast","SenderWelt","RadioPortal"],uv=[{id:"natur",name:"Natur"},{id:"erz",name:"Erze & Steine"},{id:"bau",name:"Bauen"},{id:"licht",name:"Licht"},{id:"spezial",name:"Spezial"},{id:"technik",name:"Funktechnik"},{id:"funk",name:"Funk-Logos"}],sc=[[0,"AIR","Luft","",null,{solid:0,opaque:0,inv:0}],[1,"GRASS","Gras","natur",[0,1,2],{hard:.6,tool:"schaufel",color:5808188,map:[88,160,60],icon:1}],[2,"DIRT","Erde","natur",[2,2,2],{hard:.5,tool:"schaufel",color:8806463,map:[134,96,63],icon:2}],[3,"STONE","Stein","erz",[3,3,3],{hard:1.5,tool:"spitzhacke",color:8158336,map:[124,124,128],icon:3}],[4,"SAND","Sand","natur",[4,4,4],{hard:.5,tool:"schaufel",color:14404494,map:[219,203,142],icon:4}],[5,"WOOD","Holz","natur",[6,5,6],{hard:1,tool:"axt",color:6836270,map:[104,80,46],icon:5}],[6,"LEAVES","Blätter","natur",[7,7,7],{opaque:0,self:1,hard:.2,color:3833904,map:[46,120,44],icon:7}],[7,"PLANKS","Bretter","bau",[8,8,8],{hard:1,tool:"axt",color:11306578,map:[172,134,82],icon:8}],[8,"GLASS","Glas","bau",[9,9,9],{opaque:0,trans:1,hard:.3,color:13625584,map:[200,230,240],icon:9}],[9,"LAMP","Leuchtblock","licht",[10,10,10],{emit:1,hard:.3,color:16767098,map:[255,214,120],icon:10}],[10,"WATER","Wasser","",[11,11,11],{solid:0,opaque:0,trans:1,inv:0,map:[44,100,200]}],[27,"FEDER","Federblock","spezial",[12,13,13],{hard:.5,color:16738976,map:[255,100,160],icon:12}],[28,"TURBO","Turbo-Block","spezial",[14,15,15],{hard:.8,color:16766504,map:[255,214,40],icon:14}],[29,"WIND","Aufwind-Block","spezial",[16,17,17],{hard:.5,color:5294318,map:[80,200,235],icon:16}],[30,"RADIO","Radio-Block","spezial",[19,18,19],{hard:.5,color:3817034,map:[60,64,76],icon:18}],[31,"RAINBOW","Regenbogen-Block","licht",[20,20,20],{emit:2,hard:.5,color:14509823,map:[220,100,255],icon:20}],[32,"NEON_R","Neonrot","licht",[21,21,21],{emit:1,hard:.3,color:16721990,map:[255,40,70],icon:21}],[33,"NEON_B","Neonblau","licht",[22,22,22],{emit:1,hard:.3,color:2657535,map:[40,140,255],icon:22}],[34,"NEON_G","Neongrün","licht",[23,23,23],{emit:1,hard:.3,color:3342200,map:[50,255,120],icon:23}],[35,"NEON_P","Neonlila","licht",[24,24,24],{emit:1,hard:.3,color:12470015,map:[190,70,255],icon:24}],[36,"BRICK","Ziegel","bau",[25,25,25],{hard:1.5,tool:"spitzhacke",color:10111544,map:[154,74,56],icon:25}],[37,"MARBLE","Marmor","bau",[26,26,26],{hard:1.5,tool:"spitzhacke",color:15132398,map:[232,232,240],icon:26}],[38,"SNOW","Schnee","natur",[27,28,2],{hard:.4,tool:"schaufel",color:15922938,map:[240,246,250],icon:27}],[39,"ICE","Eis","natur",[29,29,29],{hard:.6,tool:"spitzhacke",color:11064560,map:[168,212,240],icon:29}],[40,"GRAVEL","Kies","erz",[30,30,30],{hard:.6,tool:"schaufel",color:9078402,map:[138,134,130],icon:30}],[41,"CLAY","Ton","natur",[31,31,31],{hard:.6,tool:"schaufel",color:10134708,map:[154,164,180],icon:31}],[42,"SPRUCE","Fichtenholz","natur",[33,32,33],{hard:1,tool:"axt",color:4863008,map:[74,52,32],icon:32}],[43,"NEEDLES","Fichtennadeln","natur",[34,34,34],{opaque:0,self:1,hard:.2,color:2775606,map:[36,84,50],icon:34}],[44,"CACTUS","Kaktus","natur",[36,35,36],{hard:.4,color:3967546,map:[60,138,58],icon:35}],[45,"COAL","Kohleerz","erz",[37,37,37],{hard:2,tool:"spitzhacke",color:3816e3,map:[70,70,78],icon:37,tier:1}],[46,"COPPER","Kupfererz","erz",[38,38,38],{hard:2.2,tool:"spitzhacke",color:13136956,map:[200,116,60],icon:38,tier:1}],[47,"IRON","Eisenerz","erz",[39,39,39],{hard:2.6,tool:"spitzhacke",color:13150344,map:[200,168,136],icon:39,tier:2}],[48,"CRYSTAL","Funkkristall","erz",[40,40,40],{emit:1,hard:2.4,tool:"spitzhacke",color:7006463,map:[106,232,255],icon:40,tier:2}],[49,"MUD","Schlamm","natur",[41,41,41],{hard:.5,tool:"schaufel",color:5128756,map:[78,66,52],icon:41}],[50,"FLOWERS","Blütenwiese","natur",[42,1,2],{hard:.6,tool:"schaufel",color:6991946,map:[150,170,90],icon:42}],[51,"BASALT","Basalt","erz",[43,43,43],{hard:1.8,tool:"spitzhacke",color:3421242,map:[52,52,58],icon:43}],[52,"MAGMA","Magma","erz",[44,44,44],{emit:1,hard:1.2,tool:"spitzhacke",color:16738842,map:[255,106,26],icon:44}],[53,"SHROOM","Pilzhut","natur",[45,45,45],{hard:.3,color:13122106,map:[200,58,58],icon:45}],[54,"MYCEL","Pilzboden","natur",[46,47,2],{hard:.6,tool:"schaufel",color:8022656,map:[122,106,128],icon:46}],[55,"SANDSTONE","Sandstein","bau",[48,48,48],{hard:1.2,tool:"spitzhacke",color:14205066,map:[216,192,138],icon:48}],[56,"STEM","Pilzstiel","natur",[49,49,49],{hard:.6,tool:"axt",color:15261904,map:[232,224,208],icon:49}],[57,"JLEAVES","Dschungelblätter","natur",[50,50,50],{opaque:0,self:1,hard:.2,color:3050020,map:[40,130,34],icon:50}],[58,"WORKBENCH","Werkbank","bau",[51,52,8],{hard:1.2,tool:"axt",color:10122308,map:[150,112,66],icon:51,station:"werkbank"}],[59,"FURNACE","Schmelzofen","bau",[54,53,54],{hard:2,tool:"spitzhacke",color:6974064,map:[110,110,116],icon:53,station:"ofen"}],[60,"WOOL","Wolle","bau",[55,55,55],{hard:.4,color:15657698,map:[236,232,224],icon:55}],[61,"FARMLAND","Ackerboden","natur",[56,2,2],{hard:.5,tool:"schaufel",color:5914150,map:[96,66,40],icon:56}],[62,"WHEAT0","Weizen (Keim)","",[57,57,57],{shape:"cross",solid:0,opaque:0,inv:0,hard:0,color:6991936,map:[100,150,60]}],[63,"WHEAT1","Weizen (jung)","",[58,58,58],{shape:"cross",solid:0,opaque:0,inv:0,hard:0,color:8041536,map:[110,160,60]}],[64,"WHEAT2","Weizen (grün)","",[59,59,59],{shape:"cross",solid:0,opaque:0,inv:0,hard:0,color:10530880,map:[150,170,60]}],[65,"WHEAT3","Weizen (reif)","",[60,60,60],{shape:"cross",solid:0,opaque:0,inv:0,hard:0,color:14202960,map:[216,184,80]}],[66,"PATH","Dorfweg","bau",[61,2,2],{hard:.5,tool:"schaufel",color:10126946,map:[150,132,100],icon:61}],[67,"COBBLE","Bruchstein","bau",[62,62,62],{hard:1.6,tool:"spitzhacke",color:8421510,map:[120,120,126],icon:62}],[68,"SWITCH","Schalter","technik",[63,63,63],{hard:.5,color:9079440,map:[140,140,146],icon:63}],[69,"SWITCH_ON","Schalter (an)","",[64,64,64],{hard:.5,color:9079440,map:[140,160,146],inv:0,drop:68}],[70,"WIRE","Signalleitung","technik",[65,65,65],{hard:.5,color:14188604,map:[200,120,60],icon:65}],[71,"SENDER","Funksender","technik",[66,67,62],{hard:.8,color:3817034,map:[80,200,240],icon:67}],[72,"RELAY","Funkrelais","technik",[68,68,68],{hard:.8,color:4869722,map:[110,200,230],icon:68}],[73,"RECEIVER","Empfänger","technik",[69,69,69],{hard:.8,color:3159102,map:[70,74,86],icon:69}],[74,"RECEIVER_ON","Empfänger (an)","",[70,70,70],{hard:.8,color:3159102,map:[90,230,140],inv:0,drop:73,emit:1}],[75,"SIGLAMP","Signallampe","technik",[71,71,71],{hard:.3,color:6969920,map:[110,92,66],icon:71}],[76,"SIGLAMP_ON","Signallampe (an)","",[72,72,72],{hard:.3,color:16767098,map:[255,220,120],inv:0,drop:75,emit:1}],[77,"GATE","Funktor","technik",[73,73,73],{hard:2,tool:"spitzhacke",color:11843262,map:[170,172,180],icon:73}],[78,"GATE_OPEN","Funktor (offen)","",[74,74,74],{solid:0,opaque:0,hard:2,tool:"spitzhacke",color:11843262,map:[130,132,140],inv:0,drop:77}],[79,"RAIL","Schiene","technik",[75,75,75],{shape:"flat",solid:0,opaque:0,hard:.4,color:9075306,map:[140,120,100],icon:75}]];for(let i=0;i<ic;i++)sc.push([ii+i,"LOGO"+(i+1),hv[i],"funk",null,{logo:1,hard:.5,color:1712192,map:[60,70,110]}]);sc.sort((i,t)=>i[0]-t[0]);const Pi=256,ne=[],v={},yr=[],Sr=new Uint8Array(Pi),pr=new Uint8Array(Pi),nf=new Uint8Array(Pi),rc=new Float32Array(Pi),Ol=new Uint8Array(Pi),sf=new Uint8Array(Pi),rf=new Uint8Array(Pi),af=new Uint8Array(Pi),mr={};for(const[i,t,e,n,s,r]of sc){if(ne[i])throw new Error("Block-Id doppelt: "+i);const a={id:i,key:t,name:e,cat:n,tiles:s,solid:1,opaque:1,trans:0,self:0,emit:0,hard:1,tool:null,color:14540253,map:[200,200,210],icon:0,inv:1,logo:0,station:null,tier:0,shape:null,drop:0,...r};a.trans&&(a.opaque=0),ne[i]=a,v[t]=i,yr[i]=e,Sr[i]=a.solid,pr[i]=a.opaque,Ol[i]=a.trans,sf[i]=a.self,rc[i]=a.emit,rf[i]=a.shape==="cross"?1:0,af[i]=a.shape==="flat"?1:0,nf[i]=a.opaque||a.self?1:0,s&&(mr[i]=s)}const qa=i=>i>=ii&&i<ii+ic;yr.slice(Ul,Ul+ef);const fv=ne.filter(i=>i&&i.inv).map(i=>i.id),Er=[v.WHEAT0,v.WHEAT1,v.WHEAT2,v.WHEAT3],V=16,ae=96,fe=24,dv=8,Rh=16;function qt(i,t,e){let n=Math.imul(i|0,668265261)^Math.imul(t|0,374761393)^Math.imul(e|0,2654435761);return n=Math.imul(n^n>>>15,2246822507),n=Math.imul(n^n>>>13,3266489909),n^=n>>>16,(n>>>0)/4294967296}function pv(i,t,e){const n=Math.floor(i),s=Math.floor(t),r=i-n,a=t-s,o=r*r*(3-2*r),l=a*a*(3-2*a),c=qt(n,s,e),h=qt(n+1,s,e),u=qt(n,s+1,e),f=qt(n+1,s+1,e);return c+(h-c)*o+(u-c)*l+(c-h-u+f)*o*l}function Ke(i,t,e,n){let s=0,r=.5,a=1,o=0;for(let l=0;l<n;l++)s+=r*pv(i*a,t*a,e+l*101),o+=r,r*=.5,a*=2;return s/o}const Ct={OCEAN:0,BEACH:1,PLAINS:2,FOREST:3,TAIGA:4,MOUNTAINS:5,SNOW:6,DESERT:7,SWAMP:8,JUNGLE:9,MEADOW:10,VOLCANO:11,MUSHROOM:12,CRYSTAL:13,COAST:14},mv=["Meer","Strand","Grüne Ebene","Laubwald","Nadelwald","Berge","Schneegebiet","Wüste","Sumpf","Dschungel","Blumenwiese","Vulkanregion","Pilzwald","Kristallgebiet","Felsküste"],gv=[Ct.PLAINS,Ct.FOREST,Ct.MEADOW],Bi=(i,t,e)=>{const n=Math.max(0,Math.min(1,(e-i)/(t-i)));return n*n*(3-2*n)},Io=i=>Math.max(0,Math.min(1,(i-.5)*2.4+.5)),Ch=fe-14,_v=6,vv=5,gr=5;function Ri(i,t,e,n){const s=Ke(t/640,e/640,i+1,4),r=Bi(.4,.5,s),a=Ke(t/52,e/52,i+3,3),o=Bi(.56,.72,Ke(t/300,e/300,i+2,3))*r,l=Io(Ke(t/520,e/520,i+11,3))+(qt(t,e,i+5)-.5)*.05,c=Io(Ke(t/480,e/480,i+23,3))+(qt(t,e,i+6)-.5)*.05,h=Io(Ke(t/360,e/360,i+37,2));let u=(fe-13+a*8)*(1-r)+(fe+2+a*12)*r;if(o>0){const S=1-Math.abs(Ke(t/80,e/80,i+4,2)*2-1);u+=o*(12+S*36)}const f=Bi(.74,.82,c)*Bi(.42,.5,l)*(1-Bi(0,.2,o))*r;f>0&&(u+=(fe+(a<.45?-1:1)-u)*f);const d=l>.6?Bi(.86,.98,h)*r*(1-f):0;d>0&&(u+=d*26-Bi(.8,.95,d)*5),u=Math.max(2,Math.min(ae-12,Math.floor(u)));const g=l-Math.max(0,u-(fe+18))*.012;let _;f>.5?_=Ct.SWAMP:u<fe?_=Ct.OCEAN:d>.05?_=Ct.VOLCANO:o>.3&&u>fe+18?_=Ct.MOUNTAINS:u<=fe+1?_=g<.32||o>.15?Ct.COAST:Ct.BEACH:h>.86?_=c>.5?Ct.MUSHROOM:Ct.CRYSTAL:g<.16?_=Ct.SNOW:g<.3?_=Ct.TAIGA:g>.7&&c<.4?_=Ct.DESERT:g>.66&&c>.62?_=Ct.JUNGLE:c>.56?_=Ct.FOREST:Ke(t/110,e/110,i+41,2)>.6?_=Ct.MEADOW:_=Ct.PLAINS,n.h=u,n.biome=_,n.t=g,n.u=c,n.d=a,n.volc=d;const m=u<fe+6,p=m?Math.min(u-5,Ch):u;n.t0lo=n.t1lo=n.cvlo=1e9,n.t0hi=n.t1hi=n.cvhi=-1,n.lake=!1,n.open=!1;for(let S=0;S<2;S++){const y=Math.abs(Ke(t/64,e/64,i+50+S*7,2)-.5);if(y>=.024)continue;const C=8+S*13+Ke(t/90,e/90,i+60+S,2)*16,A=1.4+(1-y/.024)*1.6,R=Math.max(_v,Math.ceil(C-A)),L=Math.min(p,Math.floor(C+A*.75));L<R||(S===0?(n.t0lo=R,n.t0hi=L):(n.t1lo=R,n.t1hi=L),L>=u&&(n.open=!0))}const x=Ke(t/36,e/36,i+70,2);if(x>.66){const S=Math.min(u-6,m?Ch:ae,gr+Math.floor((x-.66)*55));S>=gr&&(n.cvlo=gr,n.cvhi=S,n.lake=Ke(t/200,e/200,i+71,2)>.52)}return n}function Lh(i,t,e,n){const s=i.h,r=i.d;switch(i.biome){case Ct.OCEAN:return[r>.62?v.GRAVEL:r<.32?v.CLAY:v.SAND,v.SAND,3,v.STONE,0,v.STONE];case Ct.BEACH:return[v.SAND,v.SAND,4,v.SANDSTONE,3,v.STONE];case Ct.COAST:return[v.GRAVEL,v.STONE,2,v.STONE,0,v.STONE];case Ct.MEADOW:return[v.FLOWERS,v.DIRT,3,v.STONE,0,v.STONE];case Ct.SNOW:return[v.SNOW,v.DIRT,3,v.STONE,0,v.STONE];case Ct.MOUNTAINS:return s>fe+44?[v.SNOW,v.STONE,1,v.STONE,0,v.STONE]:s<fe+26?[v.GRASS,v.DIRT,2,v.STONE,0,v.STONE]:[r>.6?v.GRAVEL:v.STONE,v.STONE,1,v.STONE,0,v.STONE];case Ct.DESERT:return[v.SAND,v.SAND,4,v.SANDSTONE,3,v.STONE];case Ct.SWAMP:return[qt(e,n,t+8)<.4?v.MUD:v.GRASS,v.MUD,2,v.DIRT,2,v.STONE];case Ct.VOLCANO:return[r>.74||Ke(e/14,n/14,t+9,2)>.7?v.MAGMA:v.BASALT,v.BASALT,4,v.STONE,0,v.STONE];case Ct.MUSHROOM:return[v.MYCEL,v.DIRT,3,v.STONE,0,v.STONE];case Ct.CRYSTAL:return[r>.55?v.GRAVEL:v.STONE,v.STONE,1,v.STONE,0,v.STONE];default:return[v.GRASS,v.DIRT,3,v.STONE,0,v.STONE]}}const xn=[];xn[Ct.PLAINS]=["oak",.004];xn[Ct.FOREST]=["oak",.035];xn[Ct.MEADOW]=["oak",.002];xn[Ct.TAIGA]=["spruce",.03];xn[Ct.SNOW]=["spruce",.008];xn[Ct.MOUNTAINS]=["spruce",.006];xn[Ct.JUNGLE]=["jungle",.045];xn[Ct.SWAMP]=["oak",.012];xn[Ct.DESERT]=["cactus",.006];xn[Ct.MUSHROOM]=["mushroom",.012];xn[Ct.CRYSTAL]=["spire",.012];const xv=new Set([v.GRASS,v.DIRT,v.SNOW,v.FLOWERS,v.MUD,v.MYCEL,v.SAND,v.STONE,v.GRAVEL]),Tn=3,In=V+2*Tn,va=Array.from({length:In*In},()=>({}));function Mv(i,t,e,n){const s=t*V,r=e*V;for(let h=0;h<In;h++)for(let u=0;u<In;u++)Ri(i,s+u-Tn,r+h-Tn,va[h*In+u]);let a=fe;const o=(h,u,f)=>h+f*V+u*V*V;for(let h=0;h<V;h++)for(let u=0;u<V;u++){const f=va[(h+Tn)*In+u+Tn],d=f.h,g=s+u,_=r+h,[m,p,x,S,y,C]=Lh(f,i,g,_);for(let A=0;A<=d;A++){const R=d-A;n[o(u,A,h)]=A===0?v.STONE:R===0?m:R<=x?p:R<=x+y?S:C}for(let A=d+1;A<=fe;A++)n[o(u,A,h)]=A===fe&&f.t<.16&&f.biome!==Ct.SWAMP?v.ICE:v.WATER;d>a&&(a=d)}for(let h=0;h<V;h++)for(let u=0;u<V;u++){const f=va[(h+Tn)*In+u+Tn];for(let d=f.t0lo;d<=f.t0hi;d++)n[o(u,d,h)]=v.AIR;for(let d=f.t1lo;d<=f.t1hi;d++)n[o(u,d,h)]=v.AIR;if(f.cvhi>=0){for(let d=f.cvlo;d<=f.cvhi;d++)n[o(u,d,h)]=v.AIR;if(f.lake)n[o(u,vv,h)]=v.WATER;else if(qt(s+u,r+h,i+72)<(f.biome===Ct.CRYSTAL?.22:.04)){const d=1+Math.floor(qt(s+u,r+h,i+73)*3);for(let g=gr;g<gr+d&&g<=f.cvhi;g++)n[o(u,g,h)]=v.CRYSTAL}}}const l=(h,u,f,d,g,_)=>{for(let m=0;m<u;m++){const p=C=>qt(t*31+m*7+C,e*17-m,i+_);let x=Math.floor(p(1)*V),S=Math.floor(p(2)*V),y=f+Math.floor(p(3)*(d-f));for(let C=0;C<g;C++){const A=o(x,y,S);n[A]===v.STONE&&(n[A]=h);const R=Math.floor(p(4+C)*6),L=R&1?1:-1;R<2?x=Math.max(0,Math.min(V-1,x+L)):R<4?S=Math.max(0,Math.min(V-1,S+L)):y=Math.max(1,Math.min(ae-1,y+L))}}};l(v.COAL,16,6,70,6,80),l(v.COPPER,9,4,44,5,81),l(v.IRON,7,2,30,4,82),l(v.CRYSTAL,2,2,14,3,83);const c=(h,u,f,d,g)=>{if(h<0||h>=V||f<0||f>=V||u<1||u>=ae)return;const _=o(h,u,f);(g||n[_]===v.AIR)&&(n[_]=d,u>a&&(a=u))};for(let h=0;h<In;h++)for(let u=0;u<In;u++){const f=va[h*In+u],d=xn[f.biome];if(!d||f.open||f.h<=fe)continue;const g=s+u-Tn,_=r+h-Tn;if(qt(g,_,i+99)>=d[1])continue;const m=u-Tn,p=h-Tn,x=f.h,S=qt(g,_,i+7),y=Lh(f,i,g,_)[0];if(xv.has(y))if(d[0]==="cactus"){if(y!==v.SAND)continue;const C=1+Math.floor(S*3);for(let A=1;A<=C;A++)c(m,x+A,p,v.CACTUS)}else if(d[0]==="spire"){const C=2+Math.floor(S*4);for(let A=1;A<=C;A++)c(m,x+A,p,v.CRYSTAL);c(m+(S<.5?1:-1),x+1,p,v.CRYSTAL)}else if(d[0]==="mushroom"){const C=4+Math.floor(S*3);for(let A=1;A<=C;A++)c(m,x+A,p,v.STEM,!0);for(let A=-2;A<=2;A++)for(let R=-2;R<=2;R++){const L=Math.abs(R)===2&&Math.abs(A)===2;L||c(m+R,x+C+1,p+A,v.SHROOM),!L&&(Math.abs(R)===2||Math.abs(A)===2)&&c(m+R,x+C,p+A,v.SHROOM)}}else if(d[0]==="spruce"){const C=6+Math.floor(S*4),A=x+C+1;for(let R=1;R<=C;R++)c(m,x+R,p,v.SPRUCE,!0);for(let R=x+3;R<=A;R++){const L=Math.min(3,Math.floor((A-R)/2.2+(R%2?.4:0)));for(let T=-L;T<=L;T++)for(let b=-L;b<=L;b++)b*b+T*T<=L*L+.5&&c(m+b,R,p+T,v.NEEDLES)}}else if(d[0]==="jungle"){const C=8+Math.floor(S*5);for(let A=1;A<=C;A++)c(m,x+A,p,v.WOOD,!0);for(let A=-1;A<=1;A++){const R=A===1?2:3;for(let L=-R;L<=R;L++)for(let T=-R;T<=R;T++)T*T+L*L>R*R+1||R===3&&qt(g+T,_+L+A,i+3)<.25||c(m+T,x+C+A,p+L,v.JLEAVES)}}else{const C=4+Math.floor(S*3);for(let A=1;A<=C;A++)c(m,x+A,p,v.WOOD,!0);for(let A=C-2;A<=C+1;A++){const R=A>=C?1:2;for(let L=-R;L<=R;L++)for(let T=-R;T<=R;T++)R===2&&Math.abs(T)===2&&Math.abs(L)===2&&qt(g+T,_+L+A,i+3)<.5||c(m+T,x+A,p+L,v.LEAVES)}}}return Math.min(ae-1,a)}const Ph=24,Dh=4096,ur={[v.SWITCH]:"switch",[v.SWITCH_ON]:"switch",[v.WIRE]:"wire",[v.SENDER]:"sender",[v.RELAY]:"relay",[v.RECEIVER]:"receiver",[v.RECEIVER_ON]:"receiver",[v.SIGLAMP]:"machine",[v.SIGLAMP_ON]:"machine",[v.GATE]:"machine",[v.GATE_OPEN]:"machine"},No=new Set(Object.keys(ur).map(Number)),Ih={[v.RECEIVER]:v.RECEIVER_ON,[v.SIGLAMP]:v.SIGLAMP_ON,[v.GATE]:v.GATE_OPEN},yv={[v.RECEIVER_ON]:v.RECEIVER,[v.SIGLAMP_ON]:v.SIGLAMP,[v.GATE_OPEN]:v.GATE},Sv=(i,t,e)=>i+","+t+","+e,Ev=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];function bv(i){const t=new Set,e=new Set,n=new Set,s=new Map,r=[],a=[];for(const[g,_]of i){const m=ur[_[3]];(m==="relay"||m==="receiver")&&a.push(g),_[3]===v.SWITCH_ON&&(e.add(g),r.push(g))}let o=0,l=0,c=0,h=0,u=0;const f=Ph*Ph;let d=0;for(;d<r.length&&!(++o>Dh);){const g=r[d++],_=i.get(g),m=ur[_[3]];if(m==="sender"||m==="relay"){const p=s.get(g);for(const x of a){if(x===g)continue;const S=i.get(x),y=S[0]-_[0],C=S[1]-_[1],A=S[2]-_[2];if(y*y+C*C+A*A>f)continue;const R=ur[S[3]];R==="relay"&&!n.has(x)?(n.add(x),s.set(x,p),r.push(x)):R==="receiver"&&!e.has(x)&&(e.add(x),t.add(x),c++,r.push(x),l=Math.max(l,Math.hypot(S[0]-p[0],S[1]-p[1],S[2]-p[2])))}continue}for(const[p,x,S]of Ev){const y=Sv(_[0]+p,_[1]+x,_[2]+S),C=i.get(y);if(!C)continue;const A=ur[C[3]];A==="wire"&&!e.has(y)?(e.add(y),r.push(y)):A==="sender"&&!n.has(y)?(n.add(y),s.set(y,C),u++,r.push(y)):A==="machine"&&!t.has(y)&&(t.add(y),h++)}}return{on:t,receivers:c,machines:h,senders:u,reach:l,capped:o>Dh}}const br=160,wn=20,kl=4,Tv=new Set([Ct.PLAINS,Ct.FOREST,Ct.MEADOW,Ct.TAIGA,Ct.SNOW,Ct.DESERT]),Av=[{key:"bauer",name:"Bäuerin Frieda"},{key:"schmied",name:"Schmied Kalle"},{key:"funker",name:"Funkerin Lotte"},{key:"hirte",name:"Hirte Mats"}],wv=[[0,-1],[1,0],[0,1],[-1,0]],er=new Map;function of(i,t){if(er.has(i))return er.get(i);const e=t();return er.size>512&&er.clear(),er.set(i,e),e}const Ci=i=>Math.floor(i/br);function Ya(i,t,e){return of(`v${i},${t},${e}`,()=>{if(qt(t,e,i+500)>.75)return null;const n=t*br+40+Math.floor(qt(t,e,i+501)*80),s=e*br+40+Math.floor(qt(t,e,i+502)*80),r={};Ri(i,n,s,r);const a=r.h,o=r.biome;if(!Tv.has(o)||a<fe+2||a>fe+22)return null;let l=a,c=a;for(let g=-wn-2;g<=wn+2;g+=4)for(let _=-wn-2;_<=wn+2;_+=4)if(!(_*_+g*g>(wn+2)*(wn+2))){if(Ri(i,n+_,s+g,r),r.h<=fe+1||r.biome===Ct.SWAMP||r.biome===Ct.VOLCANO)return null;l=Math.min(l,r.h),c=Math.max(c,r.h)}if(c-l>9)return null;const h=3+(qt(t,e,i+503)<.5?1:0),u=[];for(let g=0;g<h;g++){const[_,m]=wv[g],p=n+_*11,x=s+m*11;u.push({x:p,z:x,dx:_,dz:m,door:{x:p-_*3,z:x-m*3},front:{x:p-_*5,z:x-m*5},role:Av[g]})}const f=o===Ct.DESERT,d=o===Ct.SNOW||o===Ct.TAIGA;return{id:t+","+e,x:n,z:s,y:a,biome:o,houses:u,field:{x0:n+6,z0:s-12,x1:n+12,z1:s-6},mast:{x:n-9,z:s+9},top:f?v.SAND:o===Ct.SNOW?v.SNOW:v.GRASS,wall:f?v.SANDSTONE:d?v.SPRUCE:v.PLANKS,roof:f?v.SANDSTONE:d?v.SPRUCE:v.BRICK,post:d?v.SPRUCE:v.WOOD}})}function Rv(i,t){switch(t.role.key){case"bauer":return{x:i.field.x0-1.5,z:(i.field.z0+i.field.z1)/2+.5};case"funker":return{x:i.mast.x+2.5,z:i.mast.z+.5};case"hirte":return{x:i.x-8.5,z:i.z-8.5};default:return{x:t.front.x+.5+t.dz*2,z:t.front.z+.5+t.dx*2}}}function Cv(i,t,e){return of(`m${i},${t},${e}`,()=>{if(qt(t,e,i+600)>.5)return null;const n=t*br+40+Math.floor(qt(t,e,i+601)*80),s=e*br+40+Math.floor(qt(t,e,i+602)*80),r=10+Math.floor(qt(t,e,i+603)*8),a=18+Math.floor(qt(t,e,i+604)*12);return Ri(i,n,s,{}).h<r+12?null:{x:n,y:r,z:s,L:a}})}function lf(i,t=0,e=0,n=2){const s=Ci(t),r=Ci(e);let a=null,o=1/0;for(let l=r-n;l<=r+n;l++)for(let c=s-n;c<=s+n;c++){const h=Ya(i,c,l);if(!h)continue;const u=Math.hypot(h.x-t,h.z-e);u<o&&(o=u,a=h)}return a}function Lv(i,t,e,n,s,r){const a=t*V,o=e*V,l=Ci(a),c=Ci(o);let h=s;const u=(S,y,C)=>S-a+(C-o)*V+y*V*V,f=(S,y)=>S>=a&&S<a+V&&y>=o&&y<o+V,d=(S,y,C,A)=>{!f(S,C)||y<1||y>=ae||(n[u(S,y,C)]=A,A&&y>h&&(h=y),A===v.RADIO&&r&&r(S,y,C,A))},g=(S,y,C)=>f(S,C)&&y>=0&&y<ae?n[u(S,y,C)]:v.AIR,_=(S,y,C,A)=>C>=a&&S<a+V&&A>=o&&y<o+V,m=Cv(i,l,c);m&&_(m.x-m.L-2,m.z-m.L-2,m.x+m.L+2,m.z+m.L+2)&&Pv(i,m,a,o,d,g);const p=Ya(i,l,c),x=wn+kl;return p&&_(p.x-x,p.z-x,p.x+x,p.z+x)&&Dv(i,p,a,o,d,g),h}function Pv(i,t,e,n,s,r){const a={},o=(c,h,u,f)=>{if(c<e||c>=e+V||h<n||h>=n+V||Ri(i,c,h,a).h<t.y+5)return;const d=f==="x"?h-t.z:c-t.x;for(let g=t.y;g<=t.y+2;g++)r(c,g,h)!==v.WATER&&s(c,g,h,v.AIR);r(c,t.y-1,h)===v.AIR&&s(c,t.y-1,h,v.PLANKS),u%5===0&&(d!==0&&(s(c,t.y,h,v.WOOD),s(c,t.y+1,h,v.WOOD)),s(c,t.y+2,h,d===0&&u%10===0&&qt(c,h,i+605)<.5?v.LAMP:v.PLANKS))},l=(c,h)=>{if(c<e||c>=e+V||h<n||h>=n+V||r(c,t.y+1,h)!==v.STONE)return;const u=qt(c,h,i+606);u<.07&&s(c,t.y+1,h,u<.035?v.COAL:u<.055?v.COPPER:v.IRON)};for(let c=-t.L;c<=t.L;c++){for(let h=-1;h<=1;h++)o(t.x+c,t.z+h,Math.abs(c),"x"),o(t.x+h,t.z+c,Math.abs(c),"z");l(t.x+c,t.z-2),l(t.x+c,t.z+2),l(t.x-2,t.z+c),l(t.x+2,t.z+c)}for(let c=-2;c<=2;c++)for(let h=-2;h<=2;h++){const u=t.x+h,f=t.z+c;if(!(u<e||u>=e+V||f<n||f>=n+V))for(let d=t.y;d<=t.y+3;d++)s(u,d,f,v.AIR)}s(t.x+2,t.y,t.z+2,v.FURNACE),s(t.x-2,t.y,t.z+2,v.WORKBENCH)}function Dv(i,t,e,n,s,r){const a={},o=t.y,l=wn+kl;for(let f=n;f<n+V;f++)for(let d=e;d<e+V;d++){const g=Math.hypot(d-t.x,f-t.z);if(g>l)continue;const _=Ri(i,d,f,a).h,m=g<=wn?o:Math.round(o+(_-o)*(g-wn)/kl);for(let p=Math.min(_+1,m-3);p<m;p++)s(d,p,f,v.DIRT);s(d,m,f,t.top);for(let p=m+1,x=Math.min(ae-1,Math.max(_,m)+18);p<=x;p++)r(d,p,f)!==v.AIR&&s(d,p,f,v.AIR)}const c=(f,d,g,_,m,p,x)=>{for(let S=d;S<=m;S++)for(let y=Math.max(g,n);y<=Math.min(p,n+V-1);y++)for(let C=Math.max(f,e);C<=Math.min(_,e+V-1);C++)s(C,S,y,x)};c(t.x-3,o,t.z-3,t.x+3,o,t.z+3,v.PATH);for(const f of t.houses){const d=Math.min(t.x,f.front.x),g=Math.max(t.x,f.front.x),_=Math.min(t.z,f.front.z),m=Math.max(t.z,f.front.z);c(d,o,_,g,o,m,v.PATH),c(f.front.x,o,f.front.z,f.door.x,o,f.door.z,v.PATH)}c(t.x-1,o,t.z-1,t.x+1,o+1,t.z+1,v.COBBLE),c(t.x,o-1,t.z,t.x,o,t.z,v.WATER),s(t.x,o+1,t.z,v.AIR);for(const[f,d]of[[-4,-4],[4,-4],[4,4],[-4,4]])c(t.x+f,o+1,t.z+d,t.x+f,o+2,t.z+d,t.post),s(t.x+f,o+3,t.z+d,v.LAMP);for(const f of t.houses){c(f.x-3,o,f.z-3,f.x+3,o,f.z+3,v.COBBLE),c(f.x-2,o,f.z-2,f.x+2,o,f.z+2,v.PLANKS);for(let m=-3;m<=3;m++)for(let p=-3;p<=3;p++){const x=Math.abs(p)===3||Math.abs(m)===3,S=Math.abs(p)===3&&Math.abs(m)===3;for(let C=o+1;C<=o+4;C++)s(f.x+p,C,f.z+m,S?t.post:x?t.wall:v.AIR);(Math.abs(p)===3&&m===0||Math.abs(m)===3&&p===0)&&!(p===-f.dx*3&&m===-f.dz*3)&&s(f.x+p,o+2,f.z+m,v.GLASS)}s(f.door.x,o+1,f.door.z,v.AIR),s(f.door.x,o+2,f.door.z,v.AIR);for(let m=0;m<=4;m++)c(f.x-4+m,o+5+m,f.z-4+m,f.x+4-m,o+5+m,f.z+4-m,t.roof);s(f.x,o+4,f.z,v.LAMP);const d=f.x+f.dx*2+(f.dz?2:0),g=f.z+f.dz*2+(f.dx?2:0),_={bauer:v.WORKBENCH,schmied:v.FURNACE,funker:v.RADIO,hirte:v.WOOL}[f.role.key];if(s(d,o+1,g,_),f.role.key==="schmied"){const m=f.front.x+f.dz*3,p=f.front.z+f.dx*3;s(m,o+1,p,v.FURNACE),s(m,o+2,p,v.COBBLE)}}const h=t.field,u=h.z0+h.z1>>1;for(let f=h.z0;f<=h.z1;f++)for(let d=h.x0;d<=h.x1;d++){if(f===u){s(d,o,f,v.WATER);continue}s(d,o,f,v.FARMLAND),s(d,o+1,f,qt(d,f,i+510)<.7?v.WHEAT3:v.WHEAT2)}c(t.mast.x,o+1,t.mast.z,t.mast.x,o+7,t.mast.z,t.post),s(t.mast.x,o+8,t.mast.z,v.LAMP),s(t.mast.x+1,o+1,t.mast.z,v.RADIO)}const cf=3,hf=i=>i===2||i===3?i:1,uf=52;function Uo(i,t,e){const n=Ke(t/110,e/110,i,4),s=Ke(t/24,e/24,i+5,2),r=Math.floor(10+n*44+(s-.5)*5);return Math.max(2,Math.min(uf,r))}function di(i,t){return(i+32768)*65536+(t+32768)}class Nh{constructor(t,e,n=1){this.seed=t|0,this.gen=hf(n),this.chunks=new Map,this.edits=e||new Map,this.dirty=new Set,this.radios=new Map,this.sig=new Map,this.sigDirty=!1,this.onSet=null}getChunk(t,e){return this.chunks.get(di(t,e))}ensure(t,e){const n=di(t,e);let s=this.chunks.get(n);return s||(s=this.generate(t,e,n),this.chunks.set(n,s)),s}generate(t,e,n){const s=new Uint8Array(V*V*ae);let r=this.gen>=2?Mv(this.seed,t,e,s):this.generate1(t,e,s);return this.gen===3&&(r=Lv(this.seed,t,e,s,r,(a,o,l)=>this.radios.set(`${a},${o},${l}`,[a,o,l]))),this.finish(t,e,n,s,r)}generate1(t,e,n){const s=this.seed;let r=0;for(let a=0;a<V;a++)for(let o=0;o<V;o++){const l=t*V+o,c=e*V+a,h=Uo(s,l,c),u=h<=fe+1;for(let d=0;d<=h;d++){let g;d===0||d<h-3?g=v.STONE:u?g=v.SAND:d<h?g=v.DIRT:g=h>=46?v.STONE:v.GRASS,n[o+a*V+d*V*V]=g}for(let d=h+1;d<=fe;d++)n[o+a*V+d*V*V]=v.WATER;const f=Math.max(h,h<fe?fe:0);f>r&&(r=f)}for(let a=2;a<V-2;a++)for(let o=2;o<V-2;o++){const l=t*V+o,c=e*V+a;if(qt(l,c,s+99)>=.012)continue;const h=Uo(s,l,c);if(h<=fe+1||h>=44||n[o+a*V+h*V*V]!==v.GRASS)continue;const u=4+Math.floor(qt(l,c,s+7)*3);for(let f=1;f<=u;f++)n[o+a*V+(h+f)*V*V]=v.WOOD;for(let f=u-2;f<=u+1;f++){const d=f>=u?1:2;for(let g=-d;g<=d;g++)for(let _=-d;_<=d;_++){if(d===2&&Math.abs(_)===2&&Math.abs(g)===2&&qt(l+_,c+g+f,s+3)<.5)continue;const m=o+_+(a+g)*V+(h+f)*V*V;n[m]===v.AIR&&(n[m]=v.LEAVES)}}h+u+1>r&&(r=h+u+1)}return r}finish(t,e,n,s,r){const a=this.edits.get(n);if(a)for(const[o,l]of a){const c=o/(V*V)|0;s[o]===v.RADIO&&l!==v.RADIO&&this.radios.delete(`${t*V+(o&15)},${c},${e*V+(o>>4&15)}`),s[o]=l,c>r&&(r=c);const h=t*V+(o&15),u=e*V+(o>>4&15);l===v.RADIO&&this.radios.set(`${h},${c},${u}`,[h,c,u]),No.has(l)?(this.sig.set(`${h},${c},${u}`,[h,c,u,l]),this.sigDirty=!0):this.sig.delete(`${h},${c},${u}`)&&(this.sigDirty=!0)}return{cx:t,cz:e,key:n,data:s,maxY:r,hm:null,opaque:null,trans:null,logo:null,meshed:!1}}getBlock(t,e,n){if(e<0)return v.STONE;if(e>=ae)return v.AIR;const s=this.chunks.get(di(t>>4,n>>4));return s?s.data[(t&15)+(n&15)*V+e*V*V]:v.AIR}isLoaded(t,e){return this.chunks.has(di(t>>4,e>>4))}isSolid(t,e,n){if(e<0)return!0;if(e>=ae)return!1;const s=this.chunks.get(di(t>>4,n>>4));return s?Sr[s.data[(t&15)+(n&15)*V+e*V*V]]===1:!0}setBlock(t,e,n,s){if(e<0||e>=ae)return!1;const r=t>>4,a=n>>4,o=this.chunks.get(di(r,a));if(!o)return!1;const l=t&15,c=n&15,h=l+c*V+e*V*V,u=o.data[h];if(u===s)return!1;o.data[h]=s,u===v.RADIO&&this.radios.delete(`${t},${e},${n}`),s===v.RADIO&&this.radios.set(`${t},${e},${n}`,[t,e,n]),No.has(s)?(this.sig.set(`${t},${e},${n}`,[t,e,n,s]),this.sigDirty=!0):No.has(u)&&(this.sig.delete(`${t},${e},${n}`),this.sigDirty=!0),e>o.maxY&&(o.maxY=e),o.hm=null;let f=this.edits.get(o.key);f||(f=new Map,this.edits.set(o.key,f)),f.set(h,s),this.dirty.add(o);const d=l===0?-1:l===V-1?1:0,g=c===0?-1:c===V-1?1:0;for(let _=Math.min(0,g);_<=Math.max(0,g);_++)for(let m=Math.min(0,d);m<=Math.max(0,d);m++)if(m||_){const p=this.chunks.get(di(r+m,a+_));p&&this.dirty.add(p)}return this.onSet&&this.onSet(t,e,n,s),!0}heightmap(t){if(t.hm)return t.hm;const e=new Uint8Array(V*V),n=t.data;for(let s=0;s<V*V;s++)for(let r=Math.min(ae-1,t.maxY);r>=0;r--)if(nf[n[s+r*V*V]]){e[s]=r+1;break}return t.hm=e}neighborhood(t){const e=new Array(9);for(let n=-1;n<=1;n++)for(let s=-1;s<=1;s++){const r=this.chunks.get(di(t.cx+s,t.cz+n));if(!r)return null;e[(n+1)*3+s+1]=r.data}return e}findSpawn(t=!0){if(this.gen===3&&t){const e=lf(this.seed);if(e)return this.ensure(e.x>>4,e.z+3>>4),{x:e.x+.5,y:e.y+1.01,z:e.z+3.5}}if(this.gen>=2){const e=this.findSpawn2();if(e)return e}for(let e=0;e<60;e++)for(let n=0;n<Math.max(1,e*8);n++){const s=n/Math.max(1,e*8)*Math.PI*2,r=Math.round(Math.cos(s)*e*4),a=Math.round(Math.sin(s)*e*4),o=Uo(this.seed,r,a);if(o<=fe+1||o>=44)continue;const l=this.ensure(r>>4,a>>4);let c=ae-1;for(;c>0&&l.data[(r&15)+(a&15)*V+c*V*V]===v.AIR;)c--;const h=l.data[(r&15)+(a&15)*V+c*V*V];if(!(h===v.WOOD||h===v.LEAVES||h===v.WATER))return{x:r+.5,y:c+1.01,z:a+.5}}return{x:.5,y:uf+2,z:.5}}findSpawn2(){const t={};for(let e=0;e<120;e++){const n=Math.max(1,e*8);for(let s=0;s<n;s++){const r=s/n*Math.PI*2,a=Math.round(Math.cos(r)*e*8),o=Math.round(Math.sin(r)*e*8);if(Ri(this.seed,a,o,t),!gv.includes(t.biome)||t.h<fe+2||t.h>fe+18)continue;const l=this.ensure(a>>4,o>>4);let c=ae-1;for(;c>0&&l.data[(a&15)+(o&15)*V+c*V*V]===v.AIR;)c--;const h=l.data[(a&15)+(o&15)*V+c*V*V];if(!(h!==v.GRASS&&h!==v.FLOWERS)&&!(l.data[(a&15)+(o&15)*V+(c+1)*V*V]!==v.AIR||l.data[(a&15)+(o&15)*V+(c+2)*V*V]!==v.AIR))return{x:a+.5,y:c+1.01,z:o+.5}}}return null}biomeAt(t,e){return this.gen<2?-1:Ri(this.seed,Math.floor(t),Math.floor(e),{}).biome}villageAt(t,e){if(this.gen!==3)return null;const n=Ya(this.seed,Ci(Math.floor(t)),Ci(Math.floor(e)));return n&&Math.hypot(n.x+.5-t,n.z+.5-e)<=wn+4?n:null}}const ac=3,ff=2,Iv=["survival","creative","story"],Ti=i=>"klotzfunk.world."+i,Ka=i=>"klotzfunk.meta."+i,Qn=i=>"klotzfunk-bak.world."+i,bs=i=>"klotzfunk-bak.time."+i,Nv=10*60*1e3,ja=()=>{try{return globalThis.localStorage||null}catch{return null}},si=i=>{try{return ja().getItem(i)}catch{return null}},Vs=i=>{try{return i?JSON.parse(i):null}catch{return null}};function df(i){const t={};for(const[e,n]of i){if(!n.size)continue;const s=new Uint8Array(n.size*3);let r=0;for(const[o,l]of n)s[r++]=o&255,s[r++]=o>>8,s[r++]=l;let a="";for(let o=0;o<s.length;o+=8192)a+=String.fromCharCode.apply(null,s.subarray(o,o+8192));t[e]=btoa(a)}return t}function Uv(i){const t=new Map;if(!i||typeof i!="object")return t;for(const e of Object.keys(i)){const n=i[e],s=new Map;if(Array.isArray(n))for(let a=0;a+1<n.length;a+=2)Number.isInteger(n[a])&&Number.isInteger(n[a+1])&&s.set(n[a],n[a+1]&255);else if(typeof n=="string"){let a="";try{a=atob(n)}catch{continue}for(let o=0;o+2<a.length;o+=3)s.set(a.charCodeAt(o)|a.charCodeAt(o+1)<<8,a.charCodeAt(o+2))}const r=Number(e);s.size&&Number.isFinite(r)&&t.set(r,s)}return t}function Ir(i){return!!i&&typeof i=="object"&&Number.isFinite(i.seed)&&Iv.includes(i.mode)&&typeof i.name=="string"&&(i.edits===void 0||typeof i.edits=="object"&&i.edits!==null)}function Ov(i){return Vs(si(Ka(i)))}function Uh(i){const t=Vs(si(Ti(i)));return Ir(t)?t:null}function Oh(i){const t=Vs(si(Qn(i)));return Ir(t)?t:null}function kv(i){return si(Qn(i))!==null}const pf=i=>({name:i.name,mode:i.mode,seed:i.seed,gen:i.gen||1,savedAt:i.savedAt,q:i.story?i.story.done?-1:i.story.i:void 0,qc:i.story?i.story.c:void 0});function mf(i,t){const e=ja();if(!e)return!1;let n;try{n=JSON.stringify(t)}catch{return!1}const s=si(Ti(i)),r=Date.now();if(s&&s!==n&&r-(Number(si(bs(i)))||0)>Nv&&Ir(Vs(s)))try{e.setItem(Qn(i),s),e.setItem(bs(i),String(r))}catch{try{e.removeItem(Qn(i)),e.removeItem(bs(i))}catch{}}try{e.setItem(Ti(i),n)}catch{try{for(let o=0;o<ac;o++)e.removeItem(Qn(o)),e.removeItem(bs(o));e.setItem(Ti(i),n)}catch{return!1}}try{e.setItem(Ka(i),JSON.stringify(pf(t)))}catch{}return!0}function Fv(i){const t=ja();if(t)for(const e of[Ti(i),Ka(i),Qn(i),bs(i)])try{t.removeItem(e)}catch{}}function kh(i){const t=ja(),e=si(Qn(i)),n=Vs(e);if(!t||!Ir(n))return!1;const s=si(Ti(i));try{t.setItem(Ti(i),e),s?t.setItem(Qn(i),s):t.removeItem(Qn(i)),t.setItem(bs(i),String(Date.now())),t.setItem(Ka(i),JSON.stringify(pf(n)))}catch{return!1}return!0}function zv(i){return JSON.stringify({format:"klotzfunk-world",version:ff,exportedAt:Date.now(),save:i})}function Bv(i){const t=Vs(i);if(!t)return null;const e=t.format==="klotzfunk-world"?t.save:t;return Ir(e)?(e.name=e.name.slice(0,40),e):null}function gf(){for(let i=0;i<ac;i++)if(si(Ti(i))===null)return i;return-1}const _f="klotzfunk.settings",Fl={eco:{name:"Eco",dpr:.75,view:3,clouds:!1,budget:3},mobile:{name:"Mobil",dpr:1.25,view:4,clouds:!0,budget:4},standard:{name:"Standard",dpr:1.5,view:6,clouds:!0,budget:6},high:{name:"Hoch",dpr:2,view:9,clouds:!0,budget:8}},Pa={quality:"auto",mouseSens:1,touchSens:1,joySens:1,btnScale:1,lefty:!1,invertY:!1,placeDelay:!0,sfxVol:.8,musicVol:.8,showFps:!1,deathLoss:"keep",enemies:!0,preview:!0,stun:!0,mpName:""};function Hv(){let i={};try{i=JSON.parse(globalThis.localStorage.getItem(_f))||{}}catch{i={}}const t={...Pa};for(const e of Object.keys(Pa))i[e]!==void 0&&typeof i[e]==typeof Pa[e]&&(t[e]=i[e]);return t.quality!=="auto"&&!Fl[t.quality]&&(t.quality="auto"),["keep","grave"].includes(t.deathLoss)||(t.deathLoss="keep"),t}function oc(i){try{return globalThis.localStorage.setItem(_f,JSON.stringify(i)),!0}catch{return!1}}function Gv(i){return i?"mobile":"standard"}const Di=1e3,Te=[],tt={},Ha=[],vn=[{key:"WOOD",name:"Holz",speed:2,dur:60,col:"#b48a52"},{key:"STONE",name:"Stein",speed:3,dur:140,col:"#8c8c94"},{key:"COPPER",name:"Kupfer",speed:4,dur:220,col:"#d8803c"},{key:"IRON",name:"Eisen",speed:6,dur:360,col:"#dcdce4"}],vf=[{key:"PICK",kind:"spitzhacke",name:"spitzhacke"},{key:"AXE",kind:"axt",name:"axt"},{key:"SHOVEL",kind:"schaufel",name:"schaufel"}];function Oe(i,t,e,n){if(Te[i])throw new Error("Item-Id doppelt: "+i);const s={id:i,key:t,name:e,cat:"items",icon:Ha.length,food:0,tool:null,...n};return Te[i]=s,tt[t]=i,Ha.push(i),s}Oe(1e3,"STICK","Stock",{draw:"stick"});Oe(1001,"COPPER_INGOT","Kupferbarren",{draw:"ingot",col:"#d8803c"});Oe(1002,"IRON_INGOT","Eisenbarren",{draw:"ingot",col:"#dcdce4"});Oe(1003,"APPLE","Apfel",{draw:"apple",food:4});Oe(1004,"MEAT_RAW","Rohes Fleisch",{draw:"meat",col:"#e0605a",food:2});Oe(1005,"MEAT_COOKED","Braten",{draw:"meat",col:"#9a5a2a",food:7});vn.forEach((i,t)=>vf.forEach((e,n)=>{Oe(1010+t*3+n,i.key+"_"+e.key,i.name+e.name,{draw:e.kind,col:i.col,tool:{kind:e.kind,tier:t+1,speed:i.speed,dur:i.dur}})}));Oe(1022,"WOOD_HOE","Holzhacke",{draw:"hacke",col:vn[0].col,tool:{kind:"hacke",tier:1,speed:1,dur:vn[0].dur}});Oe(1023,"STONE_HOE","Steinhacke",{draw:"hacke",col:vn[1].col,tool:{kind:"hacke",tier:2,speed:1,dur:vn[1].dur}});Oe(1024,"SEEDS","Weizensamen",{draw:"seeds",plant:v.WHEAT0});Oe(1025,"WHEAT","Weizen",{draw:"wheat"});Oe(1026,"BREAD","Brot",{draw:"bread",food:6});vn.forEach((i,t)=>Oe(1027+t,i.key+"_SWORD",i.name+"schwert",{draw:"schwert",col:i.col,tool:{kind:"schwert",tier:t+1,speed:1,dur:i.dur,dmg:3+t}}));Oe(1031,"COPPER_HELMET","Kupferhelm",{draw:"helm",col:vn[2].col,armor:{slot:"kopf",pts:2,dur:60}});Oe(1032,"COPPER_CHEST","Kupferharnisch",{draw:"harnisch",col:vn[2].col,armor:{slot:"brust",pts:3,dur:80}});Oe(1033,"IRON_HELMET","Eisenhelm",{draw:"helm",col:vn[3].col,armor:{slot:"kopf",pts:3,dur:110}});Oe(1034,"IRON_CHEST","Eisenharnisch",{draw:"harnisch",col:vn[3].col,armor:{slot:"brust",pts:5,dur:150}});Oe(1035,"BOAT","Boot",{draw:"boot",col:"#a87a46",vehicle:"boot"});Oe(1036,"MINECART","Lore",{draw:"lore",col:"#8a8c94",vehicle:"lore"});const _i=i=>i>=Di,nr=i=>i>=Di&&Te[i]&&Te[i].armor||null,Fh=i=>1-Math.min(.4,Math.max(0,i)*.05),zh=i=>i>=Di&&Te[i]&&Te[i].vehicle||null,Oo=i=>i>=Di&&Te[i]&&Te[i].plant||0,ve=i=>i>=Di?Te[i]?Te[i].name:"?":yr[i]||"?",$i=i=>i>=Di&&Te[i]?Te[i].tool:null,Bh=i=>i>=Di&&Te[i]?Te[i].food:0,Hh=i=>!!(i>=Di?Te[i]:ne[i]),Vv=.9;function Wv(i,t){const e=ne[i];if(!e)return .5;const n=$i(t),s=n&&e.tool===n.kind?n.speed:1;return Math.max(.12,e.hard*Vv/s)}function Xv(i,t){const e=ne[i];if(!e||!e.tier)return!0;const n=$i(t);return!!n&&n.kind==="spitzhacke"&&n.tier>=e.tier}function $v(i,t){const e=ne[i],n=$i(t);return!!(e&&n&&e.tool===n.kind)}const Ge=999,ln=[{id:"planks",give:[v.PLANKS,4],need:[[v.WOOD,1]]},{id:"planks2",give:[v.PLANKS,4],need:[[v.SPRUCE,1]]},{id:"glass",give:[v.GLASS,1],need:[[v.SAND,2]]},{id:"lamp",give:[v.LAMP,2],need:[[v.GLASS,2],[v.WOOD,1]]},{id:"lampCoal",give:[v.LAMP,2],need:[[v.COAL,1],[v.PLANKS,1]]},{id:"lampCrystal",give:[v.LAMP,4],need:[[v.CRYSTAL,1],[v.GLASS,1]]},{id:"feder",give:[v.FEDER,2],need:[[v.LEAVES,4],[v.PLANKS,1]]},{id:"turbo",give:[v.TURBO,2],need:[[v.STONE,2],[v.LAMP,1]]},{id:"turboIron",give:[v.TURBO,3],need:[[v.IRON,1],[v.STONE,2]]},{id:"wind",give:[v.WIND,2],need:[[v.GLASS,2],[v.LEAVES,2]]},{id:"radio",give:[v.RADIO,1],need:[[v.PLANKS,4],[v.LAMP,1]]},{id:"radioCopper",give:[v.RADIO,2],need:[[v.PLANKS,2],[v.COPPER,1],[v.LAMP,1]]},{id:"rainbow",give:[v.RAINBOW,2],need:[[v.GLASS,2],[v.LAMP,1]]},{id:"neonR",give:[v.NEON_R,3],need:[[v.LAMP,1],[v.SAND,1]]},{id:"neonB",give:[v.NEON_B,3],need:[[v.LAMP,1],[v.GLASS,1]]},{id:"neonG",give:[v.NEON_G,3],need:[[v.LAMP,1],[v.LEAVES,1]]},{id:"neonP",give:[v.NEON_P,3],need:[[v.LAMP,1],[v.DIRT,1]]},{id:"brick",give:[v.BRICK,4],need:[[v.DIRT,2],[v.SAND,1]]},{id:"brickClay",give:[v.BRICK,4],need:[[v.CLAY,2],[v.COAL,1]]},{id:"marble",give:[v.MARBLE,2],need:[[v.STONE,2],[v.SAND,1]]},{id:"sandstone",give:[v.SANDSTONE,2],need:[[v.SAND,4]]}];for(let i=0;i<ic;i++)ln.push({id:"logo"+(i+1),give:[ii+i,2],need:[[v.PLANKS,1]]});ln.push({id:"sticks",give:[tt.STICK,4],need:[[v.PLANKS,2]]},{id:"workbench",give:[v.WORKBENCH,1],need:[[v.PLANKS,4]]},{id:"furnace",give:[v.FURNACE,1],need:[[v.STONE,8]],st:"werkbank"});const xf=[v.PLANKS,v.STONE,tt.COPPER_INGOT,tt.IRON_INGOT],qv=[3,3,1];vn.forEach((i,t)=>vf.forEach((e,n)=>{const s=tt[i.key+"_"+e.key];ln.push({id:"tool"+s,give:[s,1],need:[[xf[t],qv[n]],[tt.STICK,2]],st:"werkbank"})}));const Yv=[v.PLANKS,v.STONE];["WOOD","STONE"].forEach((i,t)=>ln.push({id:"tool"+tt[i+"_HOE"],give:[tt[i+"_HOE"],1],need:[[Yv[t],2],[tt.STICK,2]],st:"werkbank"}));vn.forEach((i,t)=>ln.push({id:"tool"+tt[i.key+"_SWORD"],give:[tt[i.key+"_SWORD"],1],need:[[xf[t],2],[tt.STICK,1]],st:"werkbank"}));ln.push({id:"bread",give:[tt.BREAD,1],need:[[tt.WHEAT,3]]});ln.push({id:"copperHelmet",give:[tt.COPPER_HELMET,1],need:[[tt.COPPER_INGOT,5]],st:"werkbank"},{id:"copperChest",give:[tt.COPPER_CHEST,1],need:[[tt.COPPER_INGOT,8]],st:"werkbank"},{id:"ironHelmet",give:[tt.IRON_HELMET,1],need:[[tt.IRON_INGOT,5]],st:"werkbank"},{id:"ironChest",give:[tt.IRON_CHEST,1],need:[[tt.IRON_INGOT,8]],st:"werkbank"},{id:"cobble",give:[v.COBBLE,2],need:[[v.STONE,2]]},{id:"path",give:[v.PATH,2],need:[[v.GRAVEL,1],[v.DIRT,1]]});ln.push({id:"switch",give:[v.SWITCH,2],need:[[v.STONE,1],[tt.STICK,1]],st:"werkbank"},{id:"wire",give:[v.WIRE,8],need:[[tt.COPPER_INGOT,1],[v.STONE,1]],st:"werkbank"},{id:"sender",give:[v.SENDER,1],need:[[tt.COPPER_INGOT,2],[v.CRYSTAL,1],[v.RADIO,1]],st:"werkbank"},{id:"relay",give:[v.RELAY,1],need:[[tt.COPPER_INGOT,1],[v.CRYSTAL,1],[v.STONE,2]],st:"werkbank"},{id:"receiver",give:[v.RECEIVER,1],need:[[tt.COPPER_INGOT,1],[v.GLASS,1],[v.PLANKS,2]],st:"werkbank"},{id:"siglamp",give:[v.SIGLAMP,2],need:[[v.LAMP,1],[v.WIRE,1]],st:"werkbank"},{id:"gate",give:[v.GATE,2],need:[[tt.IRON_INGOT,1],[v.PLANKS,4]],st:"werkbank"});ln.push({id:"boat",give:[tt.BOAT,1],need:[[v.PLANKS,5],[tt.STICK,1]],st:"werkbank"},{id:"minecart",give:[tt.MINECART,1],need:[[tt.IRON_INGOT,3],[tt.COPPER_INGOT,2]],st:"werkbank"},{id:"rail",give:[v.RAIL,16],need:[[tt.COPPER_INGOT,3],[tt.STICK,2]],st:"werkbank"});ln.push({id:"ingotCopper",give:[tt.COPPER_INGOT,1],need:[[v.COPPER,1],[v.COAL,1]],st:"ofen"},{id:"ingotIron",give:[tt.IRON_INGOT,1],need:[[v.IRON,1],[v.COAL,1]],st:"ofen"},{id:"cook",give:[tt.MEAT_COOKED,1],need:[[tt.MEAT_RAW,1],[v.PLANKS,1]],st:"ofen"},{id:"cookCoal",give:[tt.MEAT_COOKED,4],need:[[tt.MEAT_RAW,4],[v.COAL,1]],st:"ofen"},{id:"glassOven",give:[v.GLASS,3],need:[[v.SAND,3],[v.COAL,1]],st:"ofen"});for(const i of ln)i.cat=(Te[i.give[0]]||ne[i.give[0]]).cat;const Gh={werkbank:"Werkbank",ofen:"Schmelzofen"},Kv={werkbank:"eine Werkbank",ofen:"einen Schmelzofen"},Yi=(i,t)=>i[t]||0;function lc(i,t,e=Ge,n=null){const s=t.need.filter(([o,l])=>Yi(i,o)<l).map(([o,l])=>[o,l-Yi(i,o)]),r=Yi(i,t.give[0])+t.give[1]>e,a=!!(t.st&&n&&!n.has(t.st));return{ok:!s.length&&!r&&!a,missing:s,full:r,noStation:a}}function Mf(i,t,e=Ge,n=null){const s=lc(i,t,e,n);if(!s.ok)return{ok:!1,msg:s.noStation?`Braucht ${Kv[t.st]} in der Nähe`:s.missing.length?"Es fehlt: "+s.missing.map(([a,o])=>`${o}× ${ve(a)}`).join(", "):`Vorrat voll: höchstens ${e}× ${ve(t.give[0])}`};for(const[r,a]of t.need)i[r]=Yi(i,r)-a;return i[t.give[0]]=Yi(i,t.give[0])+t.give[1],{ok:!0,msg:`+${t.give[1]} ${ve(t.give[0])}`}}function jv(i,t,e=Ge,n=null){if(t.st&&n&&!n.has(t.st))return 0;let s=Math.floor((e-Yi(i,t.give[0]))/t.give[1]);for(const[r,a]of t.need)s=Math.min(s,Math.floor(Yi(i,r)/a));return Math.max(0,s)}function Zv(i,t){return t?(t=t.toLowerCase(),ve(i.give[0]).toLowerCase().includes(t)||i.need.some(([e])=>ve(e).toLowerCase().includes(t))):!0}const cc=[{n:[1,0,0],o:[1,0,1],a:[0,0,-1],b:[0,1,0],k:1},{n:[-1,0,0],o:[0,0,0],a:[0,0,1],b:[0,1,0],k:1},{n:[0,0,1],o:[0,0,1],a:[1,0,0],b:[0,1,0],k:1},{n:[0,0,-1],o:[1,0,0],a:[-1,0,0],b:[0,1,0],k:1},{n:[0,1,0],o:[0,1,0],a:[0,0,1],b:[1,0,0],k:0},{n:[0,-1,0],o:[0,0,0],a:[1,0,0],b:[0,0,1],k:2}],Jv=[[0,0],[1,0],[1,1],[0,1]];for(const i of cc)i.c=Jv.map(([t,e])=>{const n=t?1:-1,s=e?1:-1,r=(a,o,l)=>[i.n[0]*a+i.a[0]*o+i.b[0]*l,i.n[1]*a+i.a[1]*o+i.b[1]*l,i.n[2]*a+i.a[2]*o+i.b[2]*l];return{i:t,j:e,p:[i.o[0]+t*i.a[0]+e*i.b[0],i.o[1]+t*i.a[1]+e*i.b[1],i.o[2]+t*i.a[2]+e*i.b[2]],s1:r(1,n,0),s2:r(1,0,s),cn:r(1,n,s)}});const Vh=[.45,.66,.84,1],Qv=[1,.62,.38,.18];function tx(i,t){return t===v.AIR?!0:pr[t]?!1:i===t?sf[i]===1:!0}class Da{constructor(){this.pos=[],this.uv=[],this.col=[],this.idx=[],this.n=0}finish(){return this.n?{pos:new Float32Array(this.pos),uv:new Float32Array(this.uv),col:new Float32Array(this.col),idx:this.n>16383?new Uint32Array(this.idx):new Uint16Array(this.idx)}:null}}function Za(i,t){const e=t?4:dv,n=t?4:Rh,s=1/e,r=1/n,a=(t?3:2)/512,o=t?a:2/(64*Rh);return[i%e*s+a,1-(Math.floor(i/e)+1)*r+o,s-2*a,r-2*o]}function yf(i,t){const e=i.neighborhood(t);if(!e)return null;const n=[];for(let s=-1;s<=1;s++)for(let r=-1;r<=1;r++)n.push(i.heightmap(i.getChunk(t.cx+r,t.cz+s)));return{nb:e,hms:n,maxY:t.maxY}}function ex(i,t){const e=yf(i,t);return e?nx(e.nb,e.hms,e.maxY):null}function nx(i,t,e){const n=i[4],s=(f,d)=>(d<0?0:d>=V?2:1)*3+(f<0?0:f>=V?2:1),r=(f,d,g)=>d<0?v.STONE:d>=ae?v.AIR:i[s(f,g)][(f&15)+((g&15)<<4)+(d<<8)],a=(f,d,g)=>{const _=t[s(f,g)][(f&15)+((g&15)<<4)];return d>=_?1:Qv[Math.min(3,_-d)]},o=new Da,l=new Da,c=new Da,h=[0,0,0,0],u=Math.min(ae-1,e+1);for(let f=0;f<=u;f++)for(let d=0;d<V;d++)for(let g=0;g<V;g++){const _=n[g+(d<<4)+(f<<8)];if(_===v.AIR)continue;if(rf[_]){sx(o,g,f,d,mr[_][0],a(g,f,d));continue}if(af[_]){const A=(R,L)=>r(g+R,f,d+L)===_||r(g+R,f+1,d+L)===_||r(g+R,f-1,d+L)===_;rx(o,g,f,d,mr[_][0],a(g,f,d),(A(1,0)||A(-1,0))&&!A(0,1)&&!A(0,-1));continue}const m=qa(_),p=m?c:Ol[_]?l:o,x=rc[_],S=_===v.WATER&&r(g,f+1,d)!==v.WATER,y=mr[_],C=x===0&&!Ol[_];for(let A=0;A<6;A++){const R=cc[A];if(!tx(_,r(g+R.n[0],f+R.n[1],d+R.n[2])))continue;const L=m?_-ii:y[R.k],[T,b,P,K]=Za(L,m);for(let q=0;q<4;q++){const Z=R.c[q],$=a(g+R.n[0],f+R.n[1],d+R.n[2]),nt=g+Z.s1[0],W=f+Z.s1[1],ct=d+Z.s1[2],mt=g+Z.s2[0],At=f+Z.s2[1],Ht=d+Z.s2[2],ie=g+Z.cn[0],Y=f+Z.cn[1],it=d+Z.cn[2],xt=pr[r(nt,W,ct)],ot=pr[r(mt,At,Ht)],Lt=pr[r(ie,Y,it)],Ut=C?xt&&ot?0:3-(xt+ot+Lt):3,Gt=($+(xt?$:a(nt,W,ct))+(ot?$:a(mt,At,Ht))+(Lt?$:a(ie,Y,it)))/4;h[q]=Vh[Ut]*(.5+.5*Gt),p.pos.push(g+Z.p[0],f+Z.p[1]-(S&&Z.p[1]===1?.12:0),d+Z.p[2]),p.uv.push(T+Z.i*P,b+Z.j*K),p.col.push(Vh[Ut],Gt,x,A)}const B=p.n*4;h[0]+h[2]<h[1]+h[3]?p.idx.push(B+1,B+2,B+3,B+1,B+3,B):p.idx.push(B,B+1,B+2,B,B+2,B+3),p.n++}}return{opaque:o.finish(),trans:l.finish(),logo:c.finish()}}const ix=[[[.15,.15],[.85,.85]],[[.85,.15],[.15,.85]]];function sx(i,t,e,n,s,r){const[a,o,l,c]=Za(s,!1);for(const[[h,u],[f,d]]of ix)for(const g of[0,1]){const _=i.n*4,m=g?[[f,d],[h,u]]:[[h,u],[f,d]];i.pos.push(t+m[0][0],e,n+m[0][1],t+m[1][0],e,n+m[1][1],t+m[1][0],e+1,n+m[1][1],t+m[0][0],e+1,n+m[0][1]),i.uv.push(a,o,a+l,o,a+l,o+c,a,o+c);for(let p=0;p<4;p++)i.col.push(.9,r,0,4);i.idx.push(_,_+1,_+2,_,_+2,_+3),i.n++}}function rx(i,t,e,n,s,r,a){const[o,l,c,h]=Za(s,!1),u=e+.0625,f=[o,l,o,l+h,o+c,l+h,o+c,l],d=[o,l,o+c,l,o+c,l+h,o,l+h],g=a?d:f;for(const _ of[0,1]){const m=i.n*4;_?(i.pos.push(t,u,n,t+1,u,n,t+1,u,n+1,t,u,n+1),i.uv.push(g[0],g[1],g[6],g[7],g[4],g[5],g[2],g[3])):(i.pos.push(t,u,n,t,u,n+1,t+1,u,n+1,t+1,u,n),i.uv.push(...g));for(let p=0;p<4;p++)i.col.push(.95,r,0,_?5:4);i.idx.push(m,m+1,m+2,m,m+2,m+3),i.n++}}function ax(i){const t=qa(i),e=mr[i],n=new Da;for(let s=0;s<6;s++){const r=cc[s],[a,o,l,c]=Za(t?i-ii:e[r.k],t);for(let u=0;u<4;u++){const f=r.c[u];n.pos.push(f.p[0]-.5,f.p[1]-.5,f.p[2]-.5),n.uv.push(a+f.i*l,o+f.j*c),n.col.push(1,1,rc[i],s)}const h=n.n*4;n.idx.push(h,h+1,h+2,h,h+2,h+3),n.n++}return n.finish()}const ye=64,ys=8,Wh=16,ir=128,ko=4,Xh=16;function Rn(i,t,e){let n=Math.imul(i|0,668265261)^Math.imul(t|0,374761393)^Math.imul(e|0,2654435761);return n=Math.imul(n^n>>>15,2246822507),n=Math.imul(n^n>>>13,3266489909),n^=n>>>16,(n>>>0)/4294967296}function we(i,t,e,n,s){const r=Math.floor(i),a=Math.floor(t),o=i-r,l=t-a,c=o*o*(3-2*o),h=l*l*(3-2*l),u=(r%e+e)%e,f=(u+1)%e,d=(a%n+n)%n,g=(d+1)%n,_=Rn(u,d,s),m=Rn(f,d,s),p=Rn(u,g,s),x=Rn(f,g,s);return _+(m-_)*c+(p-_)*h+(_-m-p+x)*c*h}function yt(i,t,e,n,s){let r=0,a=.5,o=0,l=e;for(let c=0;c<n;c++)r+=a*we(i*l,t*l,l,l,s+c*17),o+=a,a*=.5,l*=2;return r/o}const Mt=(i,t,e)=>[i[0]+(t[0]-i[0])*e,i[1]+(t[1]-i[1])*e,i[2]+(t[2]-i[2])*e],at=(i,t)=>[i[0]+t,i[1]+t,i[2]+t],Tt=(i,t,e,n)=>(Rn(i,t,e)-.5)*n,Fo=(i,t,e,n)=>{const s=yt(i,t,6,3,2),r=we(i*32,t*32,32,32,5);return[...at(Mt([58,122,38],[120,186,72],s*.65+r*.45),Tt(e,n,8,10)),255]},xa=(i,t,e,n)=>{const s=yt(i,t,4,4,1),r=yt(i,t,12,2,9);let a=Mt([108,76,50],[150,108,76],s);return r>.66?a=at(a,-26):r<.28&&(a=at(a,12)),[...at(a,Tt(e,n,3,10)),255]},zl=[Fo,(i,t,e,n)=>{const s=.17+.11*we(i*8,.5,8,1,4)+.05*we(i*24,.5,24,1,6);if(t<s){const o=Fo(i,t,e,n);return t>s-.035&&(o[0]*=.8,o[1]*=.85,o[2]*=.8),o}const r=xa(i,t,e,n),a=Math.max(0,1-(t-s)*7)*.28;return[r[0]*(1-a),r[1]*(1-a),r[2]*(1-a),255]},xa,(i,t,e,n)=>{const s=yt(i,t,4,4,3),r=Math.abs(yt(i,t,3,3,7)-.5);let a=Mt([92,94,100],[142,144,150],s);return r<.022?a=at(a,-34):yt(i,t,10,2,13)>.7&&(a=at(a,14)),[...at(a,Tt(e,n,4,9)),255]},(i,t,e,n)=>{const s=yt(i,t,5,3,21),r=Math.sin((t+s*.35)*Math.PI*8)*5;return[...at(Mt([212,194,136],[232,218,160],s),r+Tt(e,n,5,10)),255]},(i,t,e,n)=>{const s=we(i*10,t*3,10,3,31)*.6+we(i*20,t*6,20,6,32)*.4;let r=Mt([82,58,33],[132,98,58],s);return s<.3&&(r=at(r,-16)),[...at(r,Tt(e,n,6,8)),255]},(i,t,e,n)=>{const s=i-.5,r=t-.5,a=Math.max(Math.abs(s),Math.abs(r)),o=yt(i,t,6,2,41);if(a>.43)return[...at(Mt([80,56,32],[118,86,50],o),Tt(e,n,7,8)),255];const l=Math.hypot(s,r)*15+yt(i,t,3,2,42)*2.2,c=.5+.5*Math.sin(l*Math.PI*2);return[...at(Mt([186,148,94],[148,108,62],c),Tt(e,n,9,7)),255]},(i,t,e,n)=>{const s=yt(i,t,8,3,11),r=yt(i,t,9,2,12);let a=Mt([30,92,30],[92,168,58],s);return r>.64?[a[0],a[1],a[2],0]:(we(i*16,t*16,16,16,14)>.78&&(a=at(a,18)),[...at(a,Tt(e,n,10,10)),255])},(i,t,e,n)=>{const s=Math.floor(t*4),r=t*4%1,a=we(i*6,t*40,6,40,51+s)*.7+.3*we(i*24,t*4+s,24,4,55);let o=Mt([150,110,60],[200,156,96],a);(r<.045||r>.97)&&(o=at(o,-46));const l=s%2?.25:.75;return Math.abs(i-l)<.012&&(o=at(o,-40)),[...at(o,Tt(e,n,11,6)),255]},(i,t,e,n)=>{if(Math.min(e,n,ye-1-e,ye-1-n)<3)return[228,245,252,238];const r=(i+t)%.5;return r>.1&&r<.17&&i+t<1?[255,255,255,140]:[186,226,240,55]},(i,t,e,n)=>{const s=i*2%1,r=t*2%1;if(Math.min(s,1-s,r,1-r)<.055)return[150,98,38,255];const o=Math.max(0,1-Math.hypot(s-.5,r-.5)*1.5),l=yt(i,t,6,2,61);return[...Mt([255,196,96],[255,246,190],o*.9+l*.1),255]},(i,t,e,n)=>{const s=yt(i,t,4,3,15),a=yt(i+s*.2,t,8,2,16)>.62?26:0;return[...at(Mt([34,92,190],[62,134,220],s),a),172]},(i,t,e,n)=>{const s=Math.hypot(i-.5,t-.5),r=Math.min(e,n,ye-1-e,ye-1-n);let a=Mt([255,120,170],[255,70,130],Math.min(1,s*1.6));return Math.sin(s*Math.PI*14)>.7&&(a=at(a,22)),r<4&&(a=Mt(a,[150,30,80],.6)),[...a,255]},(i,t,e,n)=>{if(t<.17||t>.83){const r=Math.min(t,1-t);return[...Mt([255,80,140],[190,40,100],r<.04?.6:0),255]}const s=Math.sin((t*7+Math.abs(i-.5)*.8)*Math.PI*2);return s>-.1?[...at([176,182,194],s*24),255]:[52,54,64,255]},(i,t)=>{const e=(t+Math.abs(i-.5))*3%1;return Math.min(i,t,1-i,1-t)<.04?[30,30,36,255]:e<.5?[255,214,40,255]:[38,38,46,255]},(i,t)=>t>.35&&t<.65?[255,214,40,255]:[40,40,50,255],(i,t,e,n)=>{const s=Math.abs(i*2%1-.5),r=t*2%1,a=s<.07&&r>.4&&r<.88,o=r>.12&&r<.44&&s<(r-.12)*.75,l=Mt([40,170,215],[96,220,245],yt(i,t,4,2,71));return a||o?[255,255,255,255]:[...at(l,Tt(e,n,12,8)),255]},(i,t,e,n)=>[...Math.sin((t*5-i*.6)*Math.PI*2+Math.sin(i*9)*1.2)>.82?[235,250,255]:Mt([40,160,205],[80,205,235],t),255],(i,t,e,n)=>{const s=Math.min(i,t,1-i,1-t),r=Math.hypot(i-.5,t-.5);return s<.05?[28,30,38,255]:r<.34?e%6<3&&n%6<3?[18,20,26,255]:[96,102,116,255]:t<.14&&i>.7&&i<.84?[255,150,40,255]:[...at([58,62,74],Tt(e,n,13,8)),255]},(i,t,e,n)=>Math.min(i,t,1-i,1-t)<.05?[28,30,38,255]:Math.hypot(i-.3,t-.5)<.16?[255,150,40,255]:t>.42&&t<.58&&i>.55&&i<.9?[0,229,255,255]:[...at([58,62,74],Tt(e,n,14,8)),255],(i,t,e,n)=>{const s=.5+.5*Math.sin((i+t)*Math.PI*6+yt(i,t,4,2,81)*5),a=Math.min(i,t,1-i,1-t)<.04?.45:.7+.3*s;return[a*255,a*255,a*255,255]},...[[255,40,70],[40,140,255],[50,255,120],[190,70,255]].map(i=>(t,e)=>{const n=t*2%1,s=e*2%1;if(Math.min(n,1-n,s,1-s)<.06)return[i[0]*.3,i[1]*.3,i[2]*.3,255];const a=Math.max(0,1-Math.hypot(n-.5,s-.5)*1.3);return[...Mt(i,[255,255,255],a*a*.65),255]}),(i,t,e,n)=>{const s=Math.floor(t*8),r=t*8%1,a=s%2?.125:0,o=(i*4+a*4)%1;if(r<.1||o<.05)return[...at([176,170,160],Tt(e,n,15,10)),255];const l=yt(i,t,8,2,91+s);return[...at(Mt([150,62,46],[186,92,66],l),Tt(e,n,16,12)),255]},(i,t,e,n)=>{const s=yt(i,t,3,4,95),r=Math.abs(yt(i+s*.3,t,3,3,96)-.5);let a=Mt([236,236,242],[214,216,226],s);return r<.03?a=at(a,-52):r<.05&&(a=at(a,-22)),[...at(a,Tt(e,n,17,5)),255]},(i,t,e,n)=>[...at(Mt([226,234,244],[250,252,255],yt(i,t,5,3,101)),Tt(e,n,18,6)),255],(i,t,e,n)=>{const s=.2+.1*we(i*8,.5,8,1,102);if(t<s)return[...at([240,246,252],Tt(e,n,19,6)),255];const r=xa(i,t,e,n),a=Math.max(0,1-(t-s)*7)*.2;return[r[0]*(1-a),r[1]*(1-a),r[2]*(1-a),255]},(i,t,e,n)=>{const s=yt(i,t,4,3,103),r=Math.abs(yt(i,t,3,2,104)-.5)<.018;return[...at(Mt([150,196,236],[196,226,250],s),r?30:Tt(e,n,20,5)),255]},(i,t,e,n)=>{const s=we(i*10,t*10,10,10,105),r=yt(i,t,16,2,106),a=s>.6?[150,144,138]:s<.3?[96,92,90]:[124,120,116];return[...at(a,(r-.5)*40+Tt(e,n,21,10)),255]},(i,t,e,n)=>{const s=Math.sin((t+yt(i,t,3,2,107)*.2)*Math.PI*6)*6;return[...at(Mt([142,152,168],[168,176,190],yt(i,t,4,3,108)),s+Tt(e,n,22,6)),255]},(i,t,e,n)=>{const s=we(i*12,t*2,12,2,109)*.6+we(i*24,t*5,24,5,110)*.4;let r=Mt([52,36,22],[92,64,40],s);return s<.32&&(r=at(r,-12)),[...at(r,Tt(e,n,23,8)),255]},(i,t,e,n)=>{const s=i-.5,r=t-.5;if(Math.max(Math.abs(s),Math.abs(r))>.43)return[...at([66,46,28],Tt(e,n,24,8)),255];const o=.5+.5*Math.sin((Math.hypot(s,r)*18+yt(i,t,3,2,111)*2)*Math.PI*2);return[...at(Mt([170,128,80],[130,92,56],o),Tt(e,n,25,7)),255]},(i,t,e,n)=>{const s=yt(i,t,10,3,112),r=yt(i,t,11,2,113),a=Mt([22,58,34],[52,104,60],s);return r>.66?[a[0],a[1],a[2],0]:[...at(a,Tt(e,n,26,12)),255]},(i,t,e,n)=>{const s=Math.abs(i*4%1-.5)<.08;let r=Mt([44,120,44],[70,150,58],yt(i,t,4,2,114));return s&&(r=at(r,-24)),Rn(e>>2,n>>2,115)>.93&&(r=[230,226,190]),[...at(r,Tt(e,n,27,6)),255]},(i,t,e,n)=>{const s=Math.hypot(i-.5,t-.5);return[...at(Mt([92,168,70],[50,124,44],Math.min(1,s*2)),Tt(e,n,28,6)),255]},...[[[34,34,38],[58,58,64]],[[196,108,52],[236,150,84]],[[196,160,128],[232,204,176]]].map((i,t)=>(e,n,s,r)=>{const a=yt(e,n,4,4,3);let o=Mt([92,94,100],[142,144,150],a);return we(e*6,n*6,6,6,116+t)>.68&&(o=Mt(i[0],i[1],we(e*24,n*24,24,24,119+t))),[...at(o,Tt(s,r,29+t,9)),255]}),(i,t,e,n)=>{const s=Math.abs((i+t)*3%1-.5),r=Math.abs((i-t+1)*3%1-.5),a=Math.min(s,r),o=Mt([40,170,230],[170,250,255],1-a*2);return[...at(o,yt(i,t,6,2,120)*30-15),255]},(i,t,e,n)=>{const s=yt(i,t,5,3,121),r=yt(i,t,9,2,122)>.64;return[...at(Mt([60,50,38],[92,76,58],s),r?18:Tt(e,n,32,8)),255]},(i,t,e,n)=>{const s=Fo(i,t,e,n);if(Rn(e>>2,n>>2,123)>.88&&(e&3)>0&&(n&3)>0){const a=Math.floor(Rn(e>>2,n>>2,124)*4);return[...[[250,230,70],[240,80,110],[250,250,250],[150,110,240]][a],255]}return s},(i,t,e,n)=>{const s=Math.floor(i*4),r=Math.abs(i*4%1-.5)>.45;let a=Mt([38,38,44],[66,64,72],yt(i,t+s*.3,4,3,125));return r&&(a=at(a,-14)),[...at(a,Tt(e,n,33,8)),255]},(i,t,e,n)=>{const s=yt(i,t,4,3,126);return Math.abs(yt(i,t,5,2,127)-.5)<.06?[60,30,26,255]:[...Mt([230,70,20],[255,200,60],s),255]},(i,t,e,n)=>we(i*5,t*5,5,5,128)>.72?[...at([240,236,226],Tt(e,n,34,6)),255]:[...at(Mt([170,34,38],[214,60,56],yt(i,t,4,2,129)),Tt(e,n,35,8)),255],(i,t,e,n)=>[...at(Mt([98,82,108],[140,120,150],yt(i,t,6,3,130)),Tt(e,n,36,12)),255],(i,t,e,n)=>{const s=.16+.08*we(i*8,.5,8,1,131);return t<s?[...at([120,100,130],Tt(e,n,37,10)),255]:xa(i,t,e,n)},(i,t,e,n)=>{const s=Math.floor(t*4),r=t*4%1;let a=Mt([206,182,124],[226,204,150],yt(i,t,5,2,132+s));return r<.06&&(a=at(a,-22)),[...at(a,Tt(e,n,38,6)),255]},(i,t,e,n)=>[...at(Mt([214,206,188],[240,234,222],we(i*8,t*2,8,2,133)),Tt(e,n,39,6)),255],(i,t,e,n)=>{const s=yt(i,t,7,3,134),r=yt(i,t,8,2,135),a=Mt([24,100,22],[70,170,40],s);return r>.68?[a[0],a[1],a[2],0]:[...at(a,Tt(e,n,40,10)),255]},(i,t,e,n)=>{const s=Math.floor(t*4),r=t*4%1;let a=Mt([150,112,66],[182,140,88],yt(i*.5,t,6,2,140+s));return r<.05&&(a=at(a,-40)),(Math.abs(i-.5)<.03||Math.abs(t-.5)<.03)&&(a=[84,58,34]),Math.min(i,t,1-i,1-t)<.08&&(a=[104,76,44]),[...at(a,Tt(e,n,41,8)),255]},(i,t,e,n)=>{let s=Mt([150,112,66],[182,140,88],yt(i,t*.5,6,2,142));return t*4%1<.05&&(s=at(s,-36)),t<.14&&(s=[110,80,46]),i>.18&&i<.44&&t>.32&&t<.5&&(s=[186,190,198]),i>.4&&i<.48&&t>.3&&t<.52&&(s=[90,60,34]),i>.6&&i<.66&&t>.3&&t<.78&&(s=[96,66,38]),i>.54&&i<.74&&t>.26&&t<.36&&(s=[120,124,132]),[...at(s,Tt(e,n,42,8)),255]},(i,t,e,n)=>{const s=Math.floor(t*4),r=s&1?.25:0,a=(i*2+r)%1,o=t*4%1;let l=Mt([96,96,102],[132,132,138],yt(i,t,5,3,144));if((a<.05||o<.07)&&(l=at(l,-38)),i>.26&&i<.74&&t>.52&&t<.86){const c=1-Math.abs(i-.5)*3;l=t>.68?Mt([200,70,20],[255,190,60],c*we(i*8,t*8,8,8,145)):[26,22,22]}return[...at(l,Tt(e,n,43,8)),255]},(i,t,e,n)=>{let s=Mt([100,100,106],[136,136,142],yt(i,t,5,3,146));return Math.abs(i-.5)<.16&&Math.abs(t-.5)<.16&&(s=[30,26,26]),[...at(s,Tt(e,n,44,8)),255]},(i,t,e,n)=>{const s=yt(i,t,8,3,147),r=we(i*16,t*16,16,16,148);return[...at(Mt([214,210,202],[246,244,238],s*.5+r*.5),Tt(e,n,45,6)),255]},(i,t,e,n)=>{const s=t*5%1,r=s<.32;let a=Mt([74,50,30],[104,72,46],yt(i,t,6,3,150));return r&&(a=at(a,-22)),[...at(a,Tt(e,n,46,10)),255]},...[0,1,2,3].map(i=>(t,e,n,s)=>{const r=[.3,.52,.76,.92][i],a=[[70,170,50],[90,176,54],[150,176,60],[214,184,76]][i],o=Math.floor(t*8),l=t*8%1,c=r*(.8+.2*Rn(o,i,151));return 1-e>c||l<.3||l>.7?i===3&&1-e>c-.22&&1-e<c+.04&&l>.15&&l<.85&&Rn(n>>1,s>>1,152)>.3?[228,196,90,255]:[0,0,0,0]:[...at(a,Tt(n,s,47+i,16)-(1-e)*20),255]}),(i,t,e,n)=>{const s=yt(i,t,6,3,160),r=we(i*16,t*16,16,16,161);let a=Mt([128,110,84],[160,142,112],s);return r>.72?a=at(a,22):r<.22&&(a=at(a,-18)),[...at(a,Tt(e,n,50,10)),255]},(i,t,e,n)=>{const s=(h,u)=>Rn(Math.floor(h),Math.floor(u),162),r=i*4+(Math.floor(t*4)&1)*.5,a=t*4,o=r%1,l=a%1;let c=Mt([96,96,100],[150,150,156],s(r,a)*.6+yt(i,t,5,2,163)*.4);return(o<.08||l<.1)&&(c=[64,64,68]),[...at(c,Tt(e,n,51,8)),255]},...[0,1].map(i=>(t,e,n,s)=>{let r=Mt([110,110,116],[140,140,146],yt(t,e,5,2,164));Math.abs(t-.5)<.2&&Math.abs(e-.5)<.3&&(r=[70,70,76]);const a=.5+(i?.12:-.12)*(.5-e)*2;return Math.abs(t-a)<.05&&e>.25&&e<.6&&(r=[138,98,54]),Math.abs(t-(i?.62:.38))<.08&&e>.2&&e<.3&&(r=i?[80,240,120]:[200,60,60]),[...at(r,Tt(n,s,52,6)),255]}),(i,t,e,n)=>{let s=Mt([84,84,92],[112,112,120],yt(i,t,5,2,165));return(Math.abs(i-.5)<.07||Math.abs(t-.5)<.07)&&(s=[214,128,60]),Math.abs(i-.5)<.12&&Math.abs(t-.5)<.12&&(s=[240,160,80]),[...at(s,Tt(e,n,53,6)),255]},(i,t,e,n)=>{let s=Mt([60,64,76],[86,90,104],yt(i,t,5,2,166));const r=Math.hypot(i-.5,t-.5);return r<.18?s=Mt([60,200,240],[180,250,255],1-r/.18):r<.24&&(s=[200,120,60]),[...at(s,Tt(e,n,54,6)),255]},(i,t,e,n)=>{let s=Mt([56,60,72],[80,84,98],yt(i,t,5,2,167));const r=Math.hypot(i-.5,t-.15);return t>.15&&Math.abs(r*5%1-.5)<.09&&r<.75&&(s=[106,232,255]),t>.82&&(s=[200,120,60]),[...at(s,Tt(e,n,55,6)),255]},(i,t,e,n)=>{let s=Mt([70,74,86],[98,102,116],yt(i,t,5,2,168));return(i*6%1<.12||t*6%1<.12)&&(s=[180,110,56]),Math.hypot(i-.5,t-.5)<.12&&(s=[106,232,255]),[...at(s,Tt(e,n,56,6)),255]},...[0,1].map(i=>(t,e,n,s)=>{let r=Mt([48,52,62],[70,74,86],yt(t,e,5,2,169));const a=Math.hypot(t-.5,e-.58);return a<.26&&a*14%1<.5&&(r=[30,32,40]),e<.2&&Math.abs(t-.5)<.3&&(r=i?[90,255,140]:[90,40,40]),[...at(r,Tt(n,s,57,6)),255]}),...[0,1].map(i=>(t,e,n,s)=>{if(Math.min(t,e,1-t,1-e)<.1)return[...at([150,96,52],Tt(n,s,58,8)),255];const a=yt(t,e,4,2,170);return[...at(i?Mt([255,200,90],[255,240,170],a):Mt([86,70,50],[110,92,66],a),Tt(n,s,59,6)),255]}),(i,t,e,n)=>{let s=Mt([150,152,160],[188,190,198],yt(i,t,4,2,171));return(t*2%1<.05||i<.05||i>.95)&&(s=[96,98,106]),Math.hypot(i*4%1-.5,t*2%1-.2)<.09&&(s=[110,112,120]),[...at(s,Tt(e,n,60,6)),255]},(i,t,e,n)=>Math.min(i,t,1-i,1-t)>.1?[0,0,0,0]:[...at([120,122,130],Tt(e,n,61,8)),255],(i,t,e,n)=>Math.abs(i-.22)<.055||Math.abs(i-.78)<.055?[...at(Mt([150,150,158],[200,200,208],1-Math.abs(i-(i<.5?.22:.78))/.055),Tt(e,n,62,6)),255]:t*4%1<.42&&i>.08&&i<.92?[...at(Mt([104,72,42],[132,94,56],yt(i,t,6,2,172)),Tt(e,n,63,8)),255]:[0,0,0,0]];zl.length;const ox=new Set([0,1,2,3,4,5,6,8,14,15,18,19,25,26,27,28,29,30,31,32,33,35,37,38,39,41,42,43,45,46,47,48,49,52,53,54,55,61,63,64,65,66,67,68,69,70,73]);function lx(){const i=document.createElement("canvas");i.width=ye*ys,i.height=ye*Wh;const t=i.getContext("2d"),e=t.createImageData(ye,ye),n=e.data,s=ye*ys,r=ye*Wh,a=new Uint8Array(s*r*4);for(let o=0;o<zl.length;o++){for(let l=0;l<ye;l++)for(let c=0;c<ye;c++){const h=zl[o]((c+.5)/ye,(l+.5)/ye,c,l),u=(l*ye+c)*4;let f=0;if(ox.has(o)){const g=Math.min(c,l,ye-1-c,ye-1-l);g<3&&(f=(c<ye/2&&c<=l||l<ye/2&&l<c?16:-20)*(1-g/3))}n[u]=Math.max(0,Math.min(255,h[0]+f)),n[u+1]=Math.max(0,Math.min(255,h[1]+f)),n[u+2]=Math.max(0,Math.min(255,h[2]+f)),n[u+3]=Math.max(0,Math.min(255,h[3]));const d=((r-1-(Math.floor(o/ys)*ye+l))*s+o%ys*ye+c)*4;a[d]=n[u],a[d+1]=n[u+1],a[d+2]=n[u+2],a[d+3]=n[u+3]}t.putImageData(e,o%ys*ye,Math.floor(o/ys)*ye)}return i.raw=a,i}function cx(i,t){const e=document.createElement("canvas");e.width=e.height=ir*ko;const n=e.getContext("2d");n.fillStyle="#0e1224",n.fillRect(0,0,e.width,e.height);let s=Xh;for(let r=0;r<Xh;r++){const a=new Image,o=String(r+1).padStart(2,"0"),l=()=>{--s===0&&t&&t()};a.onload=()=>{n.drawImage(a,r%ko*ir,Math.floor(r/ko)*ir,ir,ir),i&&i(),l()},a.onerror=l,a.src=`logos/${o}.png`}return e}function hx(){const t=document.createElement("canvas");t.width=t.height=128;const e=t.getContext("2d"),n=e.createImageData(128,128);for(let s=0;s<128;s++)for(let r=0;r<128;r++){const a=yt((r+.5)/128,(s+.5)/128,4,4,77),o=Math.max(0,Math.min(1,(a-.5)/.18)),l=(s*128+r)*4;n.data[l]=n.data[l+1]=n.data[l+2]=255,n.data[l+3]=o*o*(3-2*o)*255}return e.putImageData(n,0,0),t}const fr=32,vi=8;function ux(i){const t=document.createElement("canvas");t.width=fr*vi,t.height=fr*Math.max(1,Math.ceil(i.length/vi));const e=t.getContext("2d");return i.forEach((n,s)=>{const r=s%vi*fr,a=Math.floor(s/vi)*fr,o=(d,g,_,m=1,p=1)=>{e.fillStyle=_,e.fillRect(r+d*2,a+g*2,m*2,p*2)},l=(d=2)=>{for(let g=d;g<14;g++)o(g,15-g,"#5a3a1e"),o(g,14-g,"#8a6034")},c=(d,g)=>{const _=parseInt(d.slice(1),16),m=p=>Math.max(0,Math.min(255,Math.round(p*g)));return`rgb(${m(_>>16)},${m(_>>8&255)},${m(_&255)})`},h=n.col||"#ccc",u=c(h,.62),f=c(h,1.18);switch(n.draw){case"stick":l(1);break;case"ingot":for(let d=0;d<5;d++)o(3+d,6+d,d?h:f,10-d,1);o(3,11,u,10,1),o(12,6,u,1,5);break;case"apple":o(5,5,"#c82a2a",7,8),o(4,6,"#c82a2a",9,6),o(6,6,"#f06a5a",2,2),o(5,12,"#8a1a1a",7,1),o(8,2,"#5a3a1e",1,3),o(9,2,"#3c8a2a",3,2);break;case"meat":o(3,5,h,9,7),o(2,6,h,11,5),o(4,6,f,3,2),o(3,11,u,9,1),o(12,9,"#efe6d2",2,2),o(13,8,"#efe6d2",2,1),o(13,11,"#efe6d2",2,1);break;case"spitzhacke":l(3);for(let d=0;d<10;d++){const g=3+d,_=2+Math.round(Math.abs(d-4.5)*.55);o(g,_,h),o(g,_+1,u)}o(3,4,f),o(12,4,f);break;case"axt":l(3),o(8,2,h,4,5),o(7,3,h,1,4),o(12,3,u,1,3),o(8,2,f,4,1),o(8,6,u,4,1);break;case"schaufel":l(5),o(10,2,h,4,4),o(9,3,h,1,3),o(14,3,u,1,3),o(10,2,f,4,1),o(11,6,u,2,1);break;case"hacke":l(3),o(9,2,h,5,2),o(12,4,h,2,2),o(9,2,f,5,1),o(13,4,u,1,2);break;case"schwert":for(let d=0;d<9;d++)o(5+d,10-d,h),o(6+d,10-d,f),o(5+d,11-d,u);o(3,10,"#5a3a1e",4,1),o(5,8,"#5a3a1e",1,5),o(2,13,"#8a6034",2,2),o(4,11,"#8a6034",1,2);break;case"seeds":[[4,6],[8,4],[10,8],[6,10],[11,11],[5,13],[9,12]].forEach(([d,g])=>{o(d,g,"#c8b060",2,1),o(d,g+1,"#8a7a3a",2,1)});break;case"wheat":for(let d=0;d<3;d++){const g=5+d*3;o(g,7,"#6a8a2a",1,8),o(g-1,2,"#e0c060",3,5),o(g,1,"#f0d880",1,2)}o(4,11,"#8a6a2a",9,1);break;case"bread":o(2,6,"#c8843c",12,6),o(3,5,"#d89848",10,1),o(2,12,"#8a5420",12,1);for(let d=0;d<3;d++)o(4+d*3,7,"#f0c070",2,1);break;case"helm":o(4,4,h,8,3),o(3,6,h,10,4),o(3,10,u,3,2),o(10,10,u,3,2),o(5,4,f,5,1),o(6,8,"#1a1a22",4,1);break;case"harnisch":o(3,3,h,3,3),o(10,3,h,3,3),o(4,5,h,8,8),o(5,5,f,2,6),o(4,12,u,8,1),o(7,3,u,2,3);break;case"boot":o(1,8,h,14,3),o(2,11,u,12,2),o(3,13,u,10,1),o(1,7,f,14,1),o(4,9,"#5a3a1e",8,1),o(7,2,"#5a3a1e",1,6),o(8,3,"#efe6d2",4,3);break;case"lore":o(2,5,h,12,6),o(2,5,f,12,1),o(3,6,u,10,1),o(2,10,u,12,1),o(3,11,"#2a2a30",3,3),o(10,11,"#2a2a30",3,3),o(4,12,"#6a6a72",1,1),o(11,12,"#6a6a72",1,1);break;default:o(4,4,h,8,8)}}),t}const $h=64,Ga={boot:{item:tt.BOAT,half:.6,h:.55,seat:.25,max:7,name:"Boot"},lore:{item:tt.MINECART,half:.45,h:.75,seat:.3,max:10,name:"Lore"}},Xn=[[1,0],[0,1],[-1,0],[0,-1]],fx=(i,t)=>Math.atan2(-i,-t),qh=.001;class Yh{constructor(t,e,n,s,r=0){this.kind=t,this.K=Ga[t],this.x=e,this.y=n,this.z=s,this.yaw=r,this.speed=0,this.vy=0,this.rider=!1,this.t=0,this.rail=null}}class dx{constructor(t,e){if(this.world=t,this.list=[],this.onAdd=()=>{},this.onRemove=()=>{},Array.isArray(e))for(const n of e)!Array.isArray(n)||!Ga[n[0]]||!n.slice(1,5).every(Number.isFinite)||this.list.length>=$h||this.list.push(new Yh(n[0],n[1],n[2],n[3],n[4]))}attach(){for(const t of this.list)this.onAdd(t)}add(t,e,n,s,r=0){if(!Ga[t]||this.list.length>=$h)return null;const a=new Yh(t,e,n,s,r);return t==="lore"&&!this.snapRail(a,r)?null:(this.list.push(a),this.onAdd(a),a)}remove(t){const e=this.list.indexOf(t);e<0||(this.list.splice(e,1),this.onRemove(t))}clear(){for(const t of this.list.slice())this.remove(t)}serialize(){return this.list.map(t=>[t.kind,+t.x.toFixed(2),+t.y.toFixed(2),+t.z.toFixed(2),+t.yaw.toFixed(2)])}raycast(t,e,n,s,r,a,o){let l=null;for(const c of this.list){const h=c.K.half,u=[c.x-h,c.y,c.z-h],f=[c.x+h,c.y+c.K.h,c.z+h],d=[t,e,n],g=[s,r,a];let _=0,m=o;for(let p=0;p<3&&_<=m;p++){if(Math.abs(g[p])<1e-9){(d[p]<u[p]||d[p]>f[p])&&(_=1/0);continue}let x=(u[p]-d[p])/g[p],S=(f[p]-d[p])/g[p];x>S&&([x,S]=[S,x]),_=Math.max(_,x),m=Math.min(m,S)}_<=m&&(!l||_<l.t)&&(l={veh:c,t:_})}return l}update(t,e,n){for(const s of this.list){const r=this.world;if(r.isLoaded&&!r.isLoaded(Math.floor(s.x),Math.floor(s.z)))continue;const a=Math.max(1,Math.ceil(t*60-1e-9)),o=t/a,l=s===e?n:null;for(let c=0;c<a;c++)s.kind==="boot"?this.stepBoat(s,o,l):this.stepCart(s,o,l);s.t+=t*Math.abs(s.speed)}}waterTop(t,e,n){const s=this.world,r=Math.floor(t),a=Math.floor(n);let o=Math.floor(e+.3);if(s.getBlock(r,o,a)!==v.WATER&&(o--,s.getBlock(r,o,a)!==v.WATER))return null;for(let l=0;l<4&&s.getBlock(r,o+1,a)===v.WATER;l++)o++;return o+1-.12}boxHits(t,e,n,s){const r=this.world,a=t.K.half;for(let o=Math.floor(n);o<=Math.floor(n+t.K.h-1e-7);o++)for(let l=Math.floor(s-a);l<=Math.floor(s+a-1e-7);l++)for(let c=Math.floor(e-a);c<=Math.floor(e+a-1e-7);c++)if(r.isSolid(c,o,l))return!0;return!1}stepBoat(t,e,n){const s=this.waterTop(t.x,t.y,t.z),r=s!==null;n&&(t.yaw-=n.r*1.9*e*(r?1:.3),t.speed+=n.f*(r?5:1.2)*e);const a=r?t.K.max:1.2;t.speed=Math.max(-a*.5,Math.min(a,t.speed)),t.speed-=t.speed*Math.min(1,(r?.6:4)*e),Math.abs(t.speed)<.01&&(t.speed=0),r?(t.vy+=(s-.3-t.y)*30*e,t.vy-=t.vy*Math.min(1,6*e)):t.vy=Math.max(-30,t.vy-25*e);const o=-Math.sin(t.yaw)*t.speed*e,l=-Math.cos(t.yaw)*t.speed*e;this.boxHits(t,t.x+o,t.y,t.z)?t.speed*=.2:t.x+=o,this.boxHits(t,t.x,t.y,t.z+l)?t.speed*=.2:t.z+=l;const c=t.y+t.vy*e;this.boxHits(t,t.x,c,t.z)?(t.vy<0&&(t.y=Math.floor(c)+1+qh),t.vy=0):t.y=c}isRail(t,e,n){return this.world.getBlock(t,e,n)===v.RAIL}nextRail(t,e,n,s){const[r,a]=Xn[s];for(const o of[0,1,-1])if(this.isRail(t+r,e+o,n+a))return[t+r,e+o,n+a];return null}snapRail(t,e){const n=Math.floor(t.x),s=Math.floor(t.z);let r=Math.floor(t.y+.5);if(!this.isRail(n,r,s)&&(r--,!this.isRail(n,r,s)))return!1;const a=-Math.sin(e),o=-Math.cos(e),l=[0,1,2,3].sort((h,u)=>Xn[u][0]*a+Xn[u][1]*o-(Xn[h][0]*a+Xn[h][1]*o)),c=l.find(h=>this.nextRail(n,r,s,h))??l[0];return t.rail={x:n,y:r,z:s,d:c,p:0},t.speed=0,t.vy=0,this.placeOnRail(t),!0}placeOnRail(t){const e=t.rail,[n,s]=Xn[e.d],r=this.nextRail(e.x,e.y,e.z,e.d),a=r?r[1]:e.y;t.x=e.x+.5+n*e.p,t.z=e.z+.5+s*e.p,t.y=e.y+.0625+(a-e.y)*e.p,t.yaw=fx(n,s)}stepCart(t,e,n){const s=t.rail;if(!s||!this.isRail(s.x,s.y,s.z)){t.rail=null,t.speed=0,t.vy=Math.max(-30,t.vy-25*e);const o=t.y+t.vy*e;this.boxHits(t,t.x,o,t.z)?(t.vy<0&&(t.y=Math.floor(o)+1+qh),t.vy=0):t.y=o,t.vy===0&&this.snapRail(t,t.yaw);return}if(n){const o=n.look||Xn[s.d];if(n.f>.2&&t.speed<.3&&o[0]*Xn[s.d][0]+o[1]*Xn[s.d][1]<-.2){const l=this.nextRail(s.x,s.y,s.z,s.d);s.d=(s.d+2)%4,l&&s.p>0&&(s.x=l[0],s.y=l[1],s.z=l[2],s.p=1-s.p)}t.speed+=(n.f>0?n.f*4:n.f*8)*e}const r=this.nextRail(s.x,s.y,s.z,s.d);r&&(t.speed-=(r[1]-s.y)*7*e),t.speed-=t.speed*Math.min(1,.25*e),t.speed=Math.max(0,Math.min(t.K.max,t.speed)),t.speed<.02&&(t.speed=0);let a=t.speed*e;for(let o=0;a>0&&o<4;o++){const l=this.nextRail(s.x,s.y,s.z,s.d);if(!l){s.p=0,t.speed=0;break}const c=1-s.p;if(a<c){s.p+=a,a=0;break}if(a-=c,s.x=l[0],s.y=l[1],s.z=l[2],s.p=0,!this.nextRail(s.x,s.y,s.z,s.d)){const h=[1,3].map(u=>(s.d+u)%4).find(u=>this.nextRail(s.x,s.y,s.z,u));h!==void 0&&(s.d=h,t.speed*=.85)}}this.placeOnRail(t)}exitSpot(t,e){const n=[[0,t.K.h+.05,0],[1.2,.1,0],[-1.2,.1,0],[0,.1,1.2],[0,.1,-1.2],[1.2,1.1,0],[-1.2,1.1,0],[0,1.1,1.2],[0,1.1,-1.2]];for(const[s,r,a]of n)if(!e(t.x+s,t.y+r,t.z+a))return[t.x+s,t.y+r,t.z+a];return[t.x,t.y+t.K.h+.05,t.z]}}const px=[[[-.2,.25,-.25,.2,.6,.27,16052972],[-.13,.5,-.42,.13,.82,-.18,16052972],[-.06,.6,-.52,.06,.68,-.42,15769632],[-.03,.82,-.36,.03,.9,-.24,14168112],[-.13,0,-.04,-.07,.25,.02,15249456],[.07,0,-.04,.13,.25,.02,15249456]],[[-.4,.45,-.6,.4,1.08,.6,15526626],[-.2,.72,-.95,.2,1.12,-.56,13154464],[-.21,1,-.9,.21,1.16,-.6,15526626],[-.32,0,-.5,-.14,.46,-.32,4867136],[.14,0,-.5,.32,.46,-.32,4867136],[-.32,0,.32,-.14,.46,.5,4867136],[.14,0,.32,.32,.46,.5,4867136]],[[-.42,.55,-.7,.42,1.22,.7,6964264],[-.43,.75,-.2,.43,1.12,.25,15920870],[-.25,.85,-1.08,.25,1.36,-.7,5913122],[-.16,.86,-1.13,.16,1.02,-1.06,15118496],[-.32,1.3,-.95,-.24,1.46,-.88,15262416],[.24,1.3,-.95,.32,1.46,-.88,15262416],[-.36,0,-.62,-.16,.56,-.42,3811354],[.16,0,-.62,.36,.56,-.42,3811354],[-.36,0,.42,-.16,.56,.62,3811354],[.16,0,.42,.36,.56,.62,3811354]],[[-.28,.75,-.16,.28,1.35,.16,2761792],[-.22,1.35,-.22,.22,1.75,.22,3419218],[-.15,1.52,-.24,-.05,1.6,-.21,7008511],[.05,1.52,-.24,.15,1.6,-.21,7008511],[-.02,1.75,-.02,.02,1.98,.02,9076912],[-.05,1.96,-.05,.05,2.04,.05,16727180],[-.42,.8,-.08,-.28,1.32,.08,2761792],[.28,.8,-.08,.42,1.32,.08,2761792],[-.22,0,-.1,-.04,.75,.1,2235446],[.04,0,-.1,.22,.75,.1,2235446]],[[-.42,.25,-.3,.42,.72,.5,3816004],[-.28,.3,-.62,.28,.66,-.3,2763314],[-.2,.5,-.64,-.08,.6,-.61,16724016],[.08,.5,-.64,.2,.6,-.61,16724016],...[-.2,.1,.35].flatMap(i=>[[-.82,0,i-.05,-.42,.4,i+.05,2368556],[.42,0,i-.05,.82,.4,i+.05,2368556]])],[[-.35,.15,-.35,.35,.42,.35,5265512],[-.2,.42,-.2,.2,.56,.2,2764344],[-.1,.2,-.38,.1,.34,-.35,16719952],[-.03,.56,-.03,.03,.7,.03,9079446],...[[-1,-1],[1,-1],[1,1],[-1,1]].map(([i,t])=>[i*.55-.13,.44,t*.55-.13,i*.55+.13,.48,t*.55+.13,10133676])],[[-.2,0,-.1,-.02,.7,.1,4864554],[.02,0,-.1,.2,.7,.1,4864554],[-.25,.7,-.15,.25,1.35,.15,3828384],[-.2,.75,-.17,.2,1.2,-.15,9071168],[-.36,.8,-.08,-.25,1.3,.08,3828384],[.25,.8,-.08,.36,1.3,.08,3828384],[-.2,1.35,-.2,.2,1.73,.2,15253658],[-.22,1.68,-.22,.22,1.82,.22,6965802],[-.12,1.52,-.22,-.05,1.58,-.2,2105376],[.05,1.52,-.22,.12,1.58,-.2,2105376]]],mx=[.8,.8,1,.5,.68,.68];function Ts(i){const t=[],e=[],n=[],s=new ee;for(const[a,o,l,c,h,u,f]of i){const d=new wi(c-a,h-o,u-l);d.translate((a+c)/2,(o+h)/2,(l+u)/2);const g=d.attributes.position.array,_=t.length/3;s.setHex(f);for(let m=0;m<g.length/3;m++){const p=mx[Math.floor(m/4)];t.push(g[m*3],g[m*3+1],g[m*3+2]),e.push(s.r*p,s.g*p,s.b*p)}for(const m of d.index.array)n.push(_+m);d.dispose()}const r=new De;return r.setAttribute("position",new Je(t,3)),r.setAttribute("color",new Je(e,3)),r.setIndex(n),r.computeBoundingSphere(),r}class gx{constructor(t){this.group=new Cn,t.add(this.group),this.geos=px.map(Ts),this.meshes=new Map}add(t){const e=new be(this.geos[t.type],new bi({vertexColors:!0}));e.matrixAutoUpdate=!0,this.group.add(e),this.meshes.set(t,e)}remove(t){const e=this.meshes.get(t);e&&(this.group.remove(e),e.material.dispose(),this.meshes.delete(t))}update(t,e,n,s,r){for(const[a,o]of this.meshes){const l=Math.hypot(a.x-t,a.z-e);if(o.visible=l<s,!o.visible)continue;const c=a.moving?Math.abs(Math.sin(r*9+a.x))*.05:0,h=a.hostile?Math.max(n,.7)*(.85+.15*Math.sin(r*23+a.z)):n;o.position.set(a.x,a.y+c,a.z),o.rotation.y=a.yaw,a.hurtT>0?o.material.color.setRGB(h*1.3,h*.45,h*.45):o.material.color.setRGB(h,h,h)}}clear(){for(const t of[...this.meshes.keys()])this.remove(t)}}const _x=[[-.6,0,-.75,.6,.12,.75,6965802],[-.6,.12,-.75,-.48,.5,.75,11041350],[.48,.12,-.75,.6,.5,.75,11041350],[-.48,.12,.63,.48,.5,.75,11041350],[-.48,.12,-.95,.48,.45,-.75,10120766],[-.48,.28,-.1,.48,.34,.12,8016944]],vx=[[-.03,-.05,-.03,.03,.75,.03,5913118],[-.08,-.32,-.02,.08,-.05,.02,9068596]],xx=[[-.45,.18,-.55,.45,.26,.55,5921892],[-.45,.26,-.55,-.37,.72,.55,9079956],[.37,.26,-.55,.45,.72,.55,9079956],[-.37,.26,-.55,.37,.72,-.47,8027268],[-.37,.26,.47,.37,.72,.55,8027268],[-.45,.66,-.55,.45,.72,-.5,12088364],[-.45,.66,.5,.45,.72,.55,12088364]],Mx=[[-.04,-.12,-.12,.04,.12,.12,2763312],[-.05,-.03,-.03,.05,.03,.03,10132130],[-.045,-.12,-.02,.045,.12,.02,4868690]];class yx{constructor(t){this.group=new Cn,t.add(this.group),this.geo={hull:Ts(_x),paddle:Ts(vx),cart:Ts(xx),wheel:Ts(Mx)},this.items=new Map}add(t){const e=new bi({vertexColors:!0}),n=new Cn,s=[];if(t.kind==="boot"){n.add(new be(this.geo.hull,e));for(const r of[-1,1]){const a=new be(this.geo.paddle,e);a.position.set(r*.62,.45,.05),n.add(a),s.push(a)}}else{n.add(new be(this.geo.cart,e));for(const[r,a]of[[-.48,-.35],[.48,-.35],[-.48,.35],[.48,.35]]){const o=new be(this.geo.wheel,e);o.position.set(r,.12,a),n.add(o),s.push(o)}}this.group.add(n),this.items.set(t,{root:n,parts:s,mat:e})}remove(t){const e=this.items.get(t);e&&(this.group.remove(e.root),e.mat.dispose(),this.items.delete(t))}clear(){for(const t of[...this.items.keys()])this.remove(t)}update(t,e,n,s,r){for(const[a,o]of this.items){const l=Math.hypot(a.x-t,a.z-e)<s;if(o.root.visible=l,!!l)if(o.root.position.set(a.x,a.y,a.z),o.root.rotation.y=a.yaw,o.mat.color.setRGB(n,n,n),a.kind==="boot")o.root.rotation.z=Math.sin(r*1.7+a.x)*.04,o.root.rotation.x=Math.sin(r*1.3+a.z)*.03,o.parts.forEach((c,h)=>{c.rotation.x=Math.sin(a.t*2.2+h*Math.PI)*.7,c.rotation.z=(h?-1:1)*.5});else{o.parts.forEach(u=>{u.rotation.x=-a.t/.12});const c=a.rail,h=c?a.y-(c.y+.0625):0;o.root.rotation.x=h>.01?Math.PI/4:h<-.01?-Math.PI/4:0}}}}const sr=[{key:"einzeln",name:"Einzeln",clicks:1},{key:"linie",name:"Linie",clicks:2},{key:"flaeche",name:"Fläche",clicks:2},{key:"wand",name:"Wand",clicks:2},{key:"saeule",name:"Säule",clicks:2},{key:"kopieren",name:"Kopieren",clicks:2,creative:!0},{key:"einfuegen",name:"Einfügen",clicks:1,creative:!0}],Bl={creative:8192,survival:512},Sx=32768,$n=(i,t)=>{const e=[],n=i<=t?1:-1;for(let s=i;s!==t+n;s+=n)e.push(s);return e};function Ex(i,t,e,n=Bl.creative){const s=[],r=(c,h,u)=>(h>=0&&h<ae&&s.push([c,h,u]),s.length<=n);if(i==="linie"){const c=Math.max(Math.abs(e[0]-t[0]),Math.abs(e[1]-t[1]),Math.abs(e[2]-t[2]));if(c+1>n)return null;for(let h=0;h<=c;h++){const u=c?h/c:0;r(Math.round(t[0]+(e[0]-t[0])*u),Math.round(t[1]+(e[1]-t[1])*u),Math.round(t[2]+(e[2]-t[2])*u))}return s}let a,o,l;if(i==="flaeche")a=$n(t[0],e[0]),o=[t[1]],l=$n(t[2],e[2]);else if(i==="saeule")a=[t[0]],o=$n(t[1],e[1]),l=[t[2]];else if(i==="wand")o=$n(t[1],e[1]),Math.abs(e[0]-t[0])>=Math.abs(e[2]-t[2])?(a=$n(t[0],e[0]),l=[t[2]]):(a=[t[0]],l=$n(t[2],e[2]));else if(i==="kopieren")a=$n(t[0],e[0]),o=$n(t[1],e[1]),l=$n(t[2],e[2]);else return[t.slice()];if(a.length*o.length*l.length>n)return null;for(const c of o)for(const h of l)for(const u of a)r(u,c,h);return s}function Hl(i,t){return[Math.min(i[0],t[0]),Math.min(i[1],t[1]),Math.min(i[2],t[2]),Math.max(i[0],t[0]),Math.max(i[1],t[1]),Math.max(i[2],t[2])]}function bx(i,t,e){const[n,s,r,a,o,l]=Hl(t,e),c=a-n+1,h=o-s+1,u=l-r+1;if(c*h*u>Sx)return null;const f=new Uint8Array(c*h*u);let d=0;for(let g=0;g<h;g++)for(let _=0;_<u;_++)for(let m=0;m<c;m++){const p=i.getBlock(n+m,s+g,r+_);f[m+_*c+g*c*u]=p===v.WATER?v.AIR:p,p&&p!==v.WATER&&d++}return{sx:c,sy:h,sz:u,data:f,n:d}}function Tx(i,t){const e=[];for(let n=0;n<i.sy;n++)for(let s=0;s<i.sz;s++)for(let r=0;r<i.sx;r++){const a=i.data[r+s*i.sx+n*i.sx*i.sz];a&&t[1]+n>=0&&t[1]+n<ae&&e.push([t[0]+r,t[1]+n,t[2]+s,a])}return e}const Ax=90,Kh=4096,wx=(i,t)=>Math.max(0,Math.min(Er.length-1,Math.floor((t-i)/Ax))),Sf=i=>Er.includes(i);function Rx(i,t=Math.random){return i===Er[Er.length-1]?[[tt.WHEAT,1],[tt.SEEDS,1+Math.floor(t()*2)]]:[[tt.SEEDS,1]]}const jh=(i,t,e)=>i+","+t+","+e;class Zh{constructor(t){if(this.plants=new Map,t&&typeof t=="object")for(const[e,n]of Object.entries(t)){const s=e.split(",").map(Number);s.length===3&&s.every(Number.isInteger)&&Number.isFinite(n)&&this.plants.size<Kh&&this.plants.set(e,n)}}plant(t,e,n,s){return this.plants.size>=Kh?!1:(this.plants.set(jh(t,e,n),s),!0)}remove(t,e,n){this.plants.delete(jh(t,e,n))}update(t,e){let n=0;for(const[s,r]of this.plants){const[a,o,l]=s.split(",").map(Number);if(!t.isLoaded(a,l))continue;const c=t.getBlock(a,o,l);if(!Sf(c)){this.plants.delete(s);continue}if(t.getBlock(a,o-1,l)!==v.FARMLAND){t.setBlock(a,o,l,v.AIR),this.plants.delete(s),n++;continue}const h=Er[wx(r,e)];h!==c&&t.setBlock(a,o,l,h)&&n++}return n}serialize(){return Object.fromEntries(this.plants)}}const Ss=20,dr=20,Ia=10,Jh=15.5;function Cx(i){return i>Jh?Math.floor((i-Jh)/2.5)+1:0}const zo={idle:.018,walk:.028,sprint:.06};class Qh{constructor(t={}){const e=(n,s,r)=>Number.isFinite(n)?Math.max(0,Math.min(r,n)):s;this.hp=e(t.hp,Ss,Ss),this.food=e(t.food,dr,dr),this.air=e(t.air,Ia,Ia),this.hp<=0&&(this.hp=Ss),this.regenT=0,this.starveT=0,this.drownT=0,this.magmaT=0,this.cause=""}hurt(t,e){return t<=0||this.hp<=0?!1:(this.hp=Math.max(0,this.hp-t),this.cause=e,this.hp<=0)}eat(t){return this.food>=dr?!1:(this.food=Math.min(dr,this.food+t),!0)}tick(t,e){const n=this.hp;return this.food=Math.max(0,this.food-t*(e.sprint&&e.moving?zo.sprint:e.moving?zo.walk:zo.idle)),this.food>=16&&this.hp<Ss?(this.regenT+=t,this.regenT>=3&&(this.regenT=0,this.hp=Math.min(Ss,this.hp+1),this.food=Math.max(0,this.food-.6))):this.regenT=0,this.food<=0&&this.hp>1?(this.starveT+=t,this.starveT>=4&&(this.starveT=0,this.hurt(1,"Hunger"))):this.starveT=0,e.eyeWater?(this.air=Math.max(0,this.air-t),this.air<=0&&(this.drownT+=t,this.drownT>=1&&(this.drownT=0,this.hurt(2,"Ertrunken")))):(this.air=Math.min(Ia,this.air+t*4),this.drownT=0),e.onMagma?(this.magmaT+=t,this.magmaT>=1&&(this.magmaT=0,this.hurt(1,"Magma"))):this.magmaT=.6,n-this.hp>0?n-this.hp:0}get dead(){return this.hp<=0}toJSON(){return{hp:Math.round(this.hp*10)/10,food:Math.round(this.food*10)/10,air:Math.round(this.air*10)/10}}}const Tr=[{key:"huhn",name:"Huhn",hp:3,half:.25,h:.8,speed:1.5,drops:[[tt.MEAT_RAW,1,1]]},{key:"schaf",name:"Schaf",hp:5,half:.42,h:1.2,speed:1.2,drops:[[tt.MEAT_RAW,1,2],[v.WOOL,1,2]]},{key:"kuh",name:"Kuh",hp:6,half:.45,h:1.4,speed:1.1,drops:[[tt.MEAT_RAW,2,3]]},{key:"rauschling",name:"Rauschling",hp:8,half:.3,h:1.7,speed:2.4,hostile:!0,dmg:2,drops:[[v.CRYSTAL,0,1]]},{key:"hoehlenwesen",name:"Höhlenwesen",hp:12,half:.45,h:.9,speed:1.9,hostile:!0,dmg:3,drops:[[v.COAL,1,2],[v.IRON,0,1]]},{key:"drohne",name:"Störsender-Drohne",hp:6,half:.35,h:.6,speed:3,hostile:!0,fly:!0,range:7,dmg:2,drops:[[tt.COPPER_INGOT,0,1],[v.CRYSTAL,0,1]]},{key:"dorfbewohner",name:"Dorfbewohner",hp:20,half:.3,h:1.8,speed:1.5,npc:!0,drops:[]}],tu=3,eu=3,Lx=4,nu=5,Px=6;function iu(i){return i<.03||i>=.5?"home":i<.22||i>=.32&&i<.47?"work":"plaza"}const Dx=4,Ix=18;function Nx(i,t,e,n,s,r,a){const o=Math.hypot(s-t,r-e,a-n),l=Math.ceil(o/.4);for(let c=1;c<l;c++){const h=c/l;if(i.isSolid(Math.floor(t+(s-t)*h),Math.floor(e+(r-e)*h),Math.floor(n+(a-n)*h)))return!1}return!0}const rr=3,su=40,Ux=24,Ox=new Set([v.GRASS,v.FLOWERS,v.SNOW,v.MYCEL]),ar=(i,t)=>(i+32768)*65536+(t+32768);let kx=1;class Bo{constructor(t,e,n,s,r){const a=Tr[t];this.id=kx++,this.target=0,this.type=t,this.T=a,this.x=e,this.y=n,this.z=s,this.hp=r??a.hp,this.vx=0,this.vy=0,this.vz=0,this.yaw=0,this.onGround=!1,this.walk=0,this.timer=0,this.flee=0,this.hurtT=0,this.acc=0,this.moving=!1,this.hostile=!!a.hostile,this.sees=!1,this.seeT=0,this.atkT=0,this.attack=!1,this.npc=!!a.npc,this.path=null,this.stuck=0,this.phase=null}warp(t,e,n){const s=Math.floor(this.y),r=a=>a>1&&a<ae-2&&Sr[t.getBlock(Math.floor(e),a-1,Math.floor(n))]&&!this.collides(t,e,a,n);for(let a=0;a<=8;a++)for(const o of[s-a,s+a])if(r(o))return this.x=e,this.y=o,this.z=n,this.vy=0,!0;return!1}collides(t,e,n,s){const r=this.T.half,a=Math.floor(e-r),o=Math.floor(e+r-1e-7),l=Math.floor(s-r),c=Math.floor(s+r-1e-7),h=Math.floor(n),u=Math.floor(n+this.T.h-1e-7);for(let f=h;f<=u;f++)for(let d=l;d<=c;d++)for(let g=a;g<=o;g++)if(t.isSolid(g,f,d))return!0;return!1}move(t,e,n){if(!n)return!1;const s=this[e];return this[e]+=n,this.collides(t,this.x,this.y,this.z)?(this[e]=s,e==="y"&&(n<0&&(this.onGround=!0),this.vy=0),!0):!1}update(t,e,n,s,r,a=this.y){if(!t.isLoaded(Math.floor(this.x),Math.floor(this.z)))return;const o=this.T;if(this.hurtT=Math.max(0,this.hurtT-e),this.timer-=e,this.hostile){this.atkT-=e,this.seeT-=e;const m=Math.hypot(s-this.x,r-this.z);this.seeT<=0&&(this.seeT=.5,this.sees=m<Ix&&Nx(t,this.x,this.y+1.5,this.z,s,a+1.6,r)),this.sees&&m>.8&&(this.walk=1,this.yaw=Math.atan2(-(s-this.x),-(r-this.z)),this.timer=.5),o.range?(this.sees&&m<4&&(this.walk=0),this.sees&&Math.hypot(m,a+1-this.y)<o.range&&this.atkT<=0&&(this.atkT=2,this.attack=!0)):this.sees&&m<1.5&&Math.abs(a-this.y)<1.8&&this.atkT<=0&&(this.atkT=1,this.attack=!0)}if(this.npc&&this.path&&this.path.length){const m=this.path[0],p=Math.hypot(m.x-this.x,m.z-this.z);p<.6?(this.path.shift(),this.walk=0,this.stuck=0,this.bestD=1/0,this.timer=1+n()*2):(this.walk=1,this.yaw=Math.atan2(-(m.x-this.x),-(m.z-this.z)),this.timer=.3,p<(this.bestD??1/0)-.3?(this.bestD=p,this.stuck=0):(this.stuck+=e)>5&&(this.path.shift(),this.warp(t,m.x,m.z),this.stuck=0,this.bestD=1/0))}this.hostile&&this.sees||this.npc&&this.path&&this.path.length||(this.npc?this.timer<=0&&(this.walk=0,this.yaw+=(n()-.5)*1.5,this.timer=2+n()*3):this.flee>0?(this.flee-=e,this.walk=1,this.yaw=Math.atan2(-(this.x-s),-(this.z-r))):this.timer<=0&&(n()<.55?(this.walk=1,this.yaw=n()*Math.PI*2,this.timer=1+n()*3):(this.walk=0,this.timer=2+n()*4)));const l=Math.floor(this.x),c=Math.floor(this.z),h=t.getBlock(l,Math.floor(this.y+.3),c)===v.WATER;let u=this.walk?o.speed*(this.flee>0?2.2:1):0,f=-Math.sin(this.yaw),d=-Math.cos(this.yaw);if(u&&this.onGround&&!this.sees&&!o.fly){const m=Math.floor(this.x+f*(o.half+.6)),p=Math.floor(this.z+d*(o.half+.6));let x=0;for(let S=Math.floor(this.y)-1;x<4&&S>0&&!Sr[t.getBlock(m,S,p)];S--)if(x++,t.getBlock(m,S,p)===v.WATER&&!this.flee){x=9;break}x>3&&(this.yaw+=Math.PI*(.5+n()),this.timer=.5+n(),f=-f,d=-d,u*=.3)}if(this.hostile&&this.sees&&Math.hypot(s-this.x,r-this.z)<.9&&(u=0),this.vx=f*u,this.vz=d*u,o.fly){const m=this.sees?a+2.5:this.y+Math.sin(this.timer*3)*.3;this.vy=Math.max(-3,Math.min(3,(m-this.y)*2))}else h?this.vy=Math.min(2,this.vy+20*e):this.vy=Math.max(-40,this.vy-28*e);const g=this.move(t,"x",this.vx*e),_=this.move(t,"z",this.vz*e);this.onGround=!1,this.move(t,"y",this.vy*e),(g||_)&&u&&!o.fly&&(this.onGround&&!this.collides(t,this.x,this.y+1.05,this.z)?this.vy=7.2:this.npc&&this.path&&this.path.length||this.onGround&&(this.yaw+=Math.PI*(.5+n()),this.timer=.5)),this.y<-10&&(this.y=ae),this.moving=u>0&&Math.abs(this.vx)+Math.abs(this.vz)>.1}hit(t,e,n){if(this.npc)return!1;this.hp-=t,this.hurtT=.35,this.hostile||(this.flee=3.5);const s=Math.hypot(this.x-e,this.z-n)||1;return this.x+=(this.x-e)/s*.15,this.z+=(this.z-n)/s*.15,this.vy=4.5,this.hp<=0}record(){return[this.type,+this.x.toFixed(2),+this.y.toFixed(2),+this.z.toFixed(2),this.hp]}}function Fx(i,t,e,n,s,r,a,o,l,c,h,u){let f=0,d=1/0;const g=[i,t,e],_=[n,s,r],m=[a,o,l],p=[c,h,u];for(let x=0;x<3;x++){if(Math.abs(_[x])<1e-9){if(g[x]<m[x]||g[x]>p[x])return 1/0;continue}let S=(m[x]-g[x])/_[x],y=(p[x]-g[x])/_[x];if(S>y){const C=S;S=y,y=C}if(f=Math.max(f,S),d=Math.min(d,y),f>d)return 1/0}return f}class zx{constructor(t,e,n,s=!0){if(this.world=t,this.seed=e|0,this.enabled=s,this.store=new Map,n&&typeof n=="object")for(const r of Object.keys(n)){const a=n[r],o=Number(r);!Array.isArray(a)||!Number.isFinite(o)||this.store.set(o,a.filter(l=>Array.isArray(l)&&Number.isInteger(l[0])&&l[0]>=0&&l[0]<tu&&l.slice(1,5).every(Number.isFinite)))}this.list=[],this.active=new Set,this.lastPC=null,this.rnd=Math.random,this.onAdd=()=>{},this.onRemove=()=>{},this.onAttack=()=>{},this.onPoof=()=>{},this.day=!0,this.spawnT=3,this.villages=new Map,this.findVillages=null,this.time=.2}spawnRecords(t,e){const n=this.seed+9001;if(qt(t,e,n)>.2)return null;const s=this.world.getChunk(t,e);if(!s)return null;const r=Math.floor(qt(t,e,n+1)*tu),a=2+Math.floor(qt(t,e,n+2)*3),o=[];for(let l=0;l<a*3&&o.length<a;l++){const c=Math.floor(qt(t*31+l,e,n+3)*V),h=Math.floor(qt(t,e*31+l,n+4)*V),u=c+h*V;let f=Math.min(ae-3,s.maxY+1);for(;f>0&&s.data[u+f*256]===v.AIR;)f--;const d=s.data[u+f*256];!Ox.has(d)||f<fe||s.data[u+(f+1)*256]!==v.AIR||s.data[u+(f+2)*256]!==v.AIR||o.push([r,t*V+c+.5,f+1,e*V+h+.5,Tr[r].hp])}return o.length?o:null}activate(t,e,n){this.active.add(t);let s=this.store.get(t);if(s?this.store.delete(t):s=this.spawnRecords(e,n),!!s){if(!s.length){this.store.set(t,s);return}for(const r of s){if(this.list.length>=su){this.stash(r);continue}const a=new Bo(r[0],r[1],r[2],r[3],r[4]);a.yaw=qt(Math.floor(r[1]),Math.floor(r[3]),5)*6.28,this.list.push(a),this.onAdd(a)}}}stash(t){const e=ar(Math.floor(t[1]/V),Math.floor(t[3]/V));let n=this.store.get(e);n||this.store.set(e,n=[]),n.push(t)}remove(t,e){const n=this.list.indexOf(t);if(!(n<0)&&(this.list.splice(n,1),this.onRemove(t),!(t.hostile||t.npc)))if(e)this.stash(t.record());else{const s=ar(Math.floor(t.x/V),Math.floor(t.z/V));!this.store.has(s)&&!this.active.has(s)&&this.store.set(s,[])}}hostile(t){return t.hostile}hostileCount(){let t=0;for(const e of this.list)e.hostile&&t++;return t}spawnHostile(t,e,n,s,r=this.rnd){if(this.hostileCount()>=Dx||this.list.length>=su)return null;for(let a=0;a<6;a++){const o=r()*Math.PI*2,l=14+r()*12,c=Math.floor(t+Math.cos(o)*l),h=Math.floor(n+Math.sin(o)*l),u=this.world.getChunk(c>>4,h>>4);if(!u)continue;const f=this.world.heightmap(u)[(c&15)+(h&15)*V];for(let d=Math.min(ae-3,Math.floor(e)+8);d>Math.max(1,Math.floor(e)-10);d--){if(!Sr[this.world.getBlock(c,d-1,h)]||this.world.getBlock(c,d-1,h)===v.WATER||this.world.getBlock(c,d,h)!==v.AIR||this.world.getBlock(c,d+1,h)!==v.AIR)continue;const g=d>=f,_=!g&&d<fe-4;if(g&&s||_){for(const{v:x}of this.villages.values())if(Math.hypot(x.x-c,x.z-h)<30)return null;const m=_?r()<.5?Lx:eu:r()<.3?nu:eu,p=new Bo(m,c+.5,m===nu?d+3:d,h+.5);return p.yaw=r()*6.28,this.list.push(p),this.onAdd(p),p}break}}return null}refresh(t,e){if(!this.enabled)return;const n=Math.floor(t/V),s=Math.floor(e/V);for(let r=-rr;r<=rr;r++)for(let a=-rr;a<=rr;a++){const o=n+a,l=s+r,c=ar(o,l);this.active.has(c)||!this.world.getChunk(o,l)||this.activate(c,o,l)}for(const r of this.active){const a=Math.floor(r/65536)-32768,o=r%65536-32768;Math.max(Math.abs(a-n),Math.abs(o-s))<=rr+1||this.active.delete(r)}for(const r of this.list.slice()){const a=ar(Math.floor(r.x/V),Math.floor(r.z/V));if(r.hostile){const o=Math.hypot(r.x-t,r.z-e)>40,l=this.world.getChunk(Math.floor(r.x)>>4,Math.floor(r.z)>>4),c=l&&Math.floor(r.y)>=this.world.heightmap(l)[(Math.floor(r.x)&15)+(Math.floor(r.z)&15)*V];(o||this.day&&c)&&(this.onPoof(r),this.remove(r,!1))}else!r.npc&&!this.active.has(a)&&this.remove(r,!0)}this.refreshVillages(t,e)}refreshVillages(t,e){for(const[n,s]of this.villages)if(!(Math.hypot(s.v.x-t,s.v.z-e)<112)){for(const r of s.list)this.remove(r,!1);this.villages.delete(n)}if(this.findVillages)for(const n of this.findVillages(t,e))this.villages.has(n.id)||Math.hypot(n.x-t,n.z-e)>96||!this.world.getChunk(n.x>>4,n.z>>4)||this.villages.set(n.id,{v:n,list:this.spawnVillagers(n)})}spawnVillagers(t){const e=[];return t.houses.forEach((n,s)=>{const r=new Bo(Px,n.x+.5,t.y+1,n.z+.5);r.name=n.role.name,r.role=n.role.key,r.vid=t.id,r.home={x:n.x+.5,z:n.z+.5},r.front={x:n.front.x+.5,z:n.front.z+.5},r.work=Rv(t,n),r.plaza={x:t.x+.5+(s&1?2.2:-2.2),z:t.z+.5+(s<2?-2.2:2.2)};const a=iu(this.time),o=a==="home"?r.home:a==="work"?r.work:r.plaza;r.phase=a,r.warp(this.world,o.x,o.z),this.list.push(r),this.onAdd(r),e.push(r)}),e}route(t,e){const n=Math.abs(t.x-t.home.x)<2.6&&Math.abs(t.z-t.home.z)<2.6;if(e==="home")return n?[t.home]:[t.front,t.home];const s=e==="work"?t.work:t.plaza;return n?[t.front,s]:[s]}update(t,e,n,s={}){if(!this.enabled)return;const r=s.py??0;this.day=!s.night,this.time=s.time??.2;const a=iu(this.time);if(s.hostiles)this.spawnT-=t,this.spawnT<=0&&(this.spawnT=3,this.spawnHostile(e,r,n,!!s.night));else if(this.hostileCount())for(const c of this.list.slice())c.hostile&&this.remove(c,!1);const o=Math.floor(e/V),l=Math.floor(n/V);(!this.lastPC||this.lastPC[0]!==o||this.lastPC[1]!==l||(this.refreshT=(this.refreshT||0)-t)<=0)&&(this.lastPC=[o,l],this.refreshT=1,this.refresh(e,n));for(const c of this.list){c.npc&&c.phase!==a&&(c.phase=a,c.path=this.route(c,a),c.bestD=1/0,c.stuck=0);const h=Math.hypot(c.x-e,c.z-n);if(c.hostile){let u=e,f=r,d=n,g=h;if(c.target=0,s.others)for(const _ of s.others){const m=Math.hypot(c.x-_.x,c.z-_.z);m<g&&(g=m,u=_.x,f=_.y,d=_.z,c.target=_.id)}c.update(this.world,t,this.rnd,u,d,f)}else h<Ux||c.flee>0?c.update(this.world,t,this.rnd,e,n,r):(c.acc+=t,c.acc>=.25&&(c.update(this.world,Math.min(c.acc,.25),this.rnd,e,n,r),c.acc=0));c.attack&&(c.attack=!1,this.onAttack(c))}}raycast(t,e,n,s,r,a,o){let l=null,c=o;for(const h of this.list){const u=h.T.half,f=Fx(t,e,n,s,r,a,h.x-u,h.y,h.z-u,h.x+u,h.y+h.T.h,h.z+u);f<c&&(c=f,l=h)}return l?{mob:l,t:c}:null}serialize(){const t={};for(const[e,n]of this.store)t[e]=n.slice();for(const e of this.active)t[e]||(t[e]=[]);for(const e of this.list){if(e.hostile||e.npc)continue;const n=ar(Math.floor(e.x/V),Math.floor(e.z/V));(t[n]||(t[n]=[])).push(e.record())}for(const e of this.active){if(t[e].length)continue;const n=Math.floor(e/65536)-32768,s=e%65536-32768;qt(n,s,this.seed+9001)>.2&&delete t[e]}return t}clear(){for(const t of this.list)this.onRemove(t);this.list=[],this.active.clear(),this.villages.clear()}}function Ef(i,t=Math.random){return Tr[i].drops.map(([e,n,s])=>[e,n+Math.floor(t()*(s-n+1))]).filter(([,e])=>e>0)}const pi=.3,Ho=1.8,Go=1.62,Ma=.001;class Bx{constructor(){this.x=0,this.y=0,this.z=0,this.vx=0,this.vy=0,this.vz=0,this.onGround=!1,this.inWater=!1,this.flying=!1,this.coyote=0,this.fallT=0,this.gliding=!1,this.hook=!1,this.lifted=!1,this.bounces=0,this.eyeWater=!1,this.impact=0}collides(t,e,n,s){const r=Math.floor(e-pi),a=Math.floor(e+pi-1e-7),o=Math.floor(s-pi),l=Math.floor(s+pi-1e-7),c=Math.floor(n),h=Math.floor(n+Ho-1e-7);for(let u=c;u<=h;u++)for(let f=o;f<=l;f++)for(let d=r;d<=a;d++)if(t.isSolid(d,u,f))return!0;return!1}move(t,e,n){for(;n!==0;){const s=Math.abs(n)>.2?Math.sign(n)*.2:n;if(n-=s,this[e]+=s,this.collides(t,this.x,this.y,this.z)){e==="y"?this.y=s>0?Math.floor(this.y+Ho)-Ho-Ma:Math.floor(this.y)+1+Ma:this[e]=s>0?Math.floor(this[e]+pi)-pi-Ma:Math.floor(this[e]-pi)+1+pi+Ma,this["v"+e]=0,e==="y"&&s<0&&(this.onGround=!0);return}}}update(t,e,n,s){if(t.isLoaded&&!t.isLoaded(Math.floor(this.x),Math.floor(this.z))){this.vx=this.vy=this.vz=0,this.waiting=!0;return}this.waiting=!1;for(let o=0;o<12&&this.collides(t,this.x,this.y,this.z);o++)this.y+=1;const r=Math.max(1,Math.ceil(e*120-1e-9)),a=e/r;for(let o=0;o<r;o++)this.step(t,a,n,s)}step(t,e,n,s){const r=Math.sin(s),a=Math.cos(s);let o=-n.f*r+n.r*a,l=-n.f*a-n.r*r;const c=Math.hypot(o,l);c>1&&(o/=c,l/=c);const h=Math.floor(this.x),u=Math.floor(this.z);this.inWater=t.getBlock(h,Math.floor(this.y+.4),u)===v.WATER;const f=this.eyeWater=t.getBlock(h,Math.floor(this.y+1.5),u)===v.WATER,d=this.onGround?t.getBlock(h,Math.floor(this.y-.05),u):v.AIR;if(this.lifted=!1,!this.flying)for(let m=0,p=Math.floor(this.y-.1);m<=11;m++,p--){const x=t.getBlock(h,p,u);if(x===v.WIND){this.lifted=!0;break}if(x!==v.AIR&&x!==v.WATER)break}const g=!this.onGround&&!this.inWater&&!this.flying;if(this.fallT=g&&this.vy<0?this.fallT+e:0,this.gliding=g&&n.jump&&this.fallT>.45&&!this.lifted&&!this.hook,!this.hook){let m;this.flying?m=n.sprint?16:10.5:this.gliding?(m=9.5,c<.1&&(o=-r,l=-a)):this.inWater?m=2.8:m=n.sprint?5.9:4.3,d===v.TURBO&&(m*=2.4);const p=Math.min(1,(this.flying?8:this.onGround?14:this.inWater?5:this.gliding?2.5:4)*e);if(this.vx+=(o*m-this.vx)*p,this.vz+=(l*m-this.vz)*p,this.flying){const x=((n.jump?1:0)-(n.down?1:0))*(n.sprint?12:8);this.vy+=(x-this.vy)*Math.min(1,8*e)}else this.inWater?(this.vy-=9*e,n.jump&&(f?this.vy+=24*e:this.vy=Math.max(this.vy,6.5)),this.vy-=this.vy*Math.min(1,3*e),this.vy=Math.max(-4,Math.min(this.vy,4))):(this.vy=Math.max(-55,this.vy-28*e),this.gliding&&(this.vy=Math.max(this.vy,-2.2)),this.lifted&&(this.vy=Math.min(7.5,this.vy+60*e)),n.jump&&(this.onGround||this.coyote>0)&&(this.vy=d===v.FEDER?15:8.8,this.onGround=!1,this.coyote=0))}const _=this.vy;this.move(t,"x",this.vx*e),this.move(t,"z",this.vz*e),this.onGround=!1,this.move(t,"y",this.vy*e),this.onGround&&_<-2&&t.getBlock(h,Math.floor(this.y-.05),u)===v.FEDER?(this.vy=Math.min(26,Math.max(10,-_*.92)),this.onGround=!1,this.bounces++):this.onGround&&_<0&&!this.hook&&!this.flying&&(this.impact=Math.max(this.impact,-_)),this.coyote=this.onGround?.1:this.coyote-e}}function ru(i,t,e,n,s,r,a,o){let l=Math.floor(t),c=Math.floor(e),h=Math.floor(n);const u=s>0?1:-1,f=r>0?1:-1,d=a>0?1:-1,g=s!==0?Math.abs(1/s):1/0,_=r!==0?Math.abs(1/r):1/0,m=a!==0?Math.abs(1/a):1/0;let p=s!==0?(s>0?l+1-t:t-l)*g:1/0,x=r!==0?(r>0?c+1-e:e-c)*_:1/0,S=a!==0?(a>0?h+1-n:n-h)*m:1/0;for(;;){let y=0,C=0,A=0,R;if(p<=x&&p<=S?(R=p,p+=g,l+=u,y=-u):x<=S?(R=x,x+=_,c+=f,C=-f):(R=S,S+=m,h+=d,A=-d),R>o)return null;const L=i.getBlock(l,c,h);if(L!==v.AIR&&L!==v.WATER)return{x:l,y:c,z:h,nx:y,ny:C,nz:A,type:L,t:R}}}let $t=null,xi=null;const _n={enabled:!0,vol:.8,music:.8};function Ki(){try{$t||($t=new(window.AudioContext||window.webkitAudioContext)),$t.state==="suspended"&&$t.resume()}catch{$t=null}}function hc(i,t,e){if(!$t||!_n.enabled||$t.state!=="running"||_n.vol<=0)return;if(!xi){xi=$t.createBuffer(1,Math.floor($t.sampleRate*.25),$t.sampleRate);const o=xi.getChannelData(0);for(let l=0;l<o.length;l++)o[l]=Math.random()*2-1}const n=$t.createBufferSource(),s=$t.createBiquadFilter(),r=$t.createGain(),a=$t.currentTime;n.buffer=xi,s.type="lowpass",s.frequency.value=i,r.gain.setValueAtTime(e*_n.vol,a),r.gain.exponentialRampToValueAtTime(.001,a+t),n.connect(s),s.connect(r),r.connect($t.destination),n.start(a),n.stop(a+t+.02)}const Vo=()=>hc(1100,.14,.5),$e=()=>hc(600,.09,.4),qe=()=>hc(220,.1,.3),he={on:!1,timer:0,next:0,step:0,master:null,seed:0},Hx=[[0,3,5,7,10],[0,2,4,7,9],[0,2,3,7,8]],au=i=>440*Math.pow(2,(i-69)/12);function ou(i,t,e,n,s,r){const a=$t.createOscillator(),o=$t.createGain();a.type=i,a.frequency.setValueAtTime(t,e),o.gain.setValueAtTime(s,e),o.gain.exponentialRampToValueAtTime(.001,e+n);let l=a;if(r){const c=$t.createBiquadFilter();c.type="lowpass",c.frequency.value=r,a.connect(c),l=c}l.connect(o),o.connect(he.master),a.start(e),a.stop(e+n+.02)}function lu(i,t,e,n,s){if(!xi){xi=$t.createBuffer(1,Math.floor($t.sampleRate*.25),$t.sampleRate);const l=xi.getChannelData(0);for(let c=0;c<l.length;c++)l[c]=Math.random()*2-1}const r=$t.createBufferSource(),a=$t.createBiquadFilter(),o=$t.createGain();r.buffer=xi,a.type=n,a.frequency.value=s,o.gain.setValueAtTime(e,i),o.gain.exponentialRampToValueAtTime(.001,i+t),r.connect(a),a.connect(o),o.connect(he.master),r.start(i),r.stop(i+t+.02)}function Gx(i,t){const e=Hx[he.seed%3],n=45+(he.seed>>2)%5,s=i%16,r=Math.floor(i/16)%4;if(s%4===0){const o=$t.createOscillator(),l=$t.createGain();o.frequency.setValueAtTime(150,t),o.frequency.exponentialRampToValueAtTime(42,t+.14),l.gain.setValueAtTime(.9,t),l.gain.exponentialRampToValueAtTime(.001,t+.2),o.connect(l),l.connect(he.master),o.start(t),o.stop(t+.22)}(s===4||s===12)&&lu(t,.12,.35,"bandpass",1800),s%2===0&&lu(t,.04,s%4===2?.22:.1,"highpass",7e3),(s%4===2||s===7||s===15)&&ou("sawtooth",au(n+e[(r+(s>>2))%5]-12),t,.2,.2,500);const a=(i*3+he.seed+r*2)%5;(s%2===1||s%4===0)&&ou("triangle",au(n+24+e[a]+(s>8?12:0)),t,.16,.12,3e3)}function Vx(){if(!$t||$t.state!=="running")return;const i=118+he.seed%3*6,t=60/i/4;for(he.next<$t.currentTime&&(he.next=$t.currentTime+.05);he.next<$t.currentTime+.25;)Gx(he.step++,he.next),he.next+=t}function cu(i,t){if(i*=_n.music,!$t||!_n.enabled||i<=.01){he.on&&(he.on=!1,clearInterval(he.timer),he.master&&he.master.gain.setTargetAtTime(0,$t.currentTime,.1));return}he.master||(he.master=$t.createGain(),he.master.gain.value=0,he.master.connect($t.destination)),he.on||(he.on=!0,he.seed=t,he.next=0,he.timer=setInterval(Vx,80)),he.master.gain.setTargetAtTime(Math.min(1,i)*.45,$t.currentTime,.15)}const Wx=[v.NEON_R,v.NEON_B,v.NEON_G,v.NEON_P],bf=[{t:"Holz sammeln",d:"Die Funkzentrale will wieder auf Sendung. Dafür braucht sie Material. Schlage 5 Holzblöcke an Bäumen ab.",k:"break",a:[v.WOOD],n:5,r:{[v.PLANKS]:4}},{t:"Bretter herstellen",d:"Öffne das Inventar (E oder 🎒) und stelle unter „Herstellen“ Bretter aus Holz her. Du brauchst 8 Bretter.",k:"craft",a:[v.PLANKS],n:8,r:{[v.DIRT]:10}},{t:"Fundament legen",d:"Setze 12 Bretter als Fundament für die Sendehütte.",k:"place",a:[v.PLANKS],n:12,r:{[v.STONE]:4}},{t:"Steinbruch",d:"Grabe nach Stein, unter Erde und in Hügeln. Sammle 12 Steinblöcke im Vorrat.",k:"have",a:[v.STONE],n:12,r:{[v.SAND]:4}},{t:"Strand und Glas",d:"Sand findest du am Wasser. Stelle 4 Glas her (2 Sand ergeben 1 Glas).",k:"craft",a:[v.GLASS],n:4,r:{[v.WOOD]:2,[v.GLASS]:2}},{t:"Leuchtfeuer",d:"Stelle 2 Leuchtblöcke her (Glas und Holz).",k:"craft",a:[v.LAMP],n:2,r:{[v.LEAVES]:4,[v.PLANKS]:2}},{t:"Licht an",d:"Setze beide Leuchtblöcke, damit die Hütte auch nachts zu sehen ist.",k:"place",a:[v.LAMP],n:2,r:{[v.LAMP]:2}},{t:"Hoch hinaus",d:"Der Funkmast muss hoch stehen. Erreiche eine Höhe von 14 Blöcken über dem Startpunkt, zum Beispiel mit einem Turm aus Blöcken.",k:"height",n:14,r:{[v.PLANKS]:6,[v.LEAVES]:4}},{t:"Der Funkmast",d:"Stelle einen Radio-Block her (4 Bretter und 1 Leuchtblock) und setze ihn. Hör zu, wie er spielt.",k:"place",a:[v.RADIO],n:1,r:{[v.PLANKS]:4,[v.LEAVES]:4}},{t:"Federn für die Landung",d:"Stelle 2 Federblöcke her (Blätter und Bretter).",k:"craft",a:[v.FEDER],n:2,r:{[v.STONE]:4}},{t:"Sprungtraining",d:"Setze einen Federblock und springe 3-mal darauf zurück in die Luft. Aufprall genügt, die Feder wirft dich hoch.",k:"bounce",n:3,r:{[v.LAMP]:1}},{t:"Seilhaken",d:"Ziele auf einen entfernten Block und benutze den Seilhaken (Q oder Taste Haken) 2-mal.",k:"hook",n:2,r:{[v.LEAVES]:4}},{t:"Gleitflug",d:"Springe von deinem Turm und halte im Fall die Sprungtaste gedrückt. Gleite insgesamt 5 Sekunden.",k:"glide",n:5,r:{[v.LAMP]:4,[v.SAND]:4}},{t:"Neon-Show",d:"Stelle Neonblöcke her (Leuchtblock mit Sand, Glas, Blättern oder Erde) und setze 4 davon.",k:"place",a:Wx,n:4,r:{[v.GLASS]:2,[v.LAMP]:1}},{t:"Regenbogen-Finale",d:"Setze als Krönung einen Regenbogen-Block (2 Glas und 1 Leuchtblock) auf deinen Sendeturm.",k:"place",a:[v.RAINBOW],n:1,r:{[v.RAINBOW]:2}}],Xx=5,$x=4,qx=[v.PLANKS,v.STONE,v.COBBLE,v.DIRT,v.WOOD,v.SPRUCE,v.BRICK,v.SANDSTONE,v.GLASS,v.MARBLE],Ar=[null,{t:"Das erste Signal",d:"Ein gewaltiges Funknetz verband einst alle Regionen. Dann kam das große Rauschen, und die Stationen verstummten. Du stehst allein in der Wildnis. Irgendwo knistert ein Signal."},{t:"Der vergessene Sender",d:"Aus deinem Radio dringt eine Stimme: „…Dorf … der Mast … hört uns jemand?“ Der Wegpunkt zeigt dir den Weg."},{t:"Stimmen aus der Tiefe",d:"Funkerin Lotte: „Der Mast braucht Funkkristalle. Sie wachsen tief unten, wo das Rauschen am lautesten ist.“"},{t:"Die zerbrochene Verbindung",d:"Aus Kupfer und Kristallen entsteht ein Funksender. Relais tragen das Signal weiter, Empfänger fangen es auf."},{t:"Das Herz des Rauschens",d:"Das Rauschen wird stärker. Drohnen stören die Leitungen, und in der Tiefe regt sich etwas."},{t:"Die letzte Frequenz",d:"Lotte: „Ein hoher Turm, drei Empfänger, und das Signal geht wieder um die ganze Welt.“"}],Tf=[{c:1,t:"Holz sammeln",d:"Schlage 6 Holzblöcke an Bäumen ab. Im Überleben dauert das etwas, mit einer Axt geht es schneller.",k:"break",a:[v.WOOD,v.SPRUCE],n:6,r:{[v.PLANKS]:4}},{c:1,t:"Werkbank",d:"Öffne das Inventar (E oder 🎒), stelle Bretter her und daraus eine Werkbank.",k:"craft",a:[v.WORKBENCH],n:1,r:{[tt.STICK]:4}},{c:1,t:"Erstes Werkzeug",d:"Setze die Werkbank, drücke Setzen auf sie und stelle eine Holzspitzhacke her.",k:"craft",a:[tt.WOOD_PICK],n:1,r:{[tt.APPLE]:3}},{c:1,t:"Unterschlupf",d:"Die erste Nacht kommt. Baue dir mit 20 Blöcken (Bretter, Stein, Erde …) einen Unterschlupf.",k:"place",a:qx,n:20,r:{[v.LAMP]:2}},{c:1,t:"Licht für die Nacht",d:"Setze einen Leuchtblock in deinen Unterschlupf.",k:"place",a:[v.LAMP],n:1,r:{[tt.BREAD]:2}},{c:1,t:"Das erste Signal",d:"Baue ein Radio (4 Bretter und 1 Leuchtblock) und setze es. Hör genau hin.",k:"place",a:[v.RADIO],n:1,r:{[tt.MEAT_COOKED]:2}},{c:2,t:"Das Dorf",d:"Folge dem Wegpunkt 📍 bis ins Dorf.",k:"visit",n:1,r:{[tt.BREAD]:2}},{c:2,t:"Erste Kontakte",d:"Sprich mit einem Dorfbewohner: Setzen-Taste auf ihn.",k:"talk",n:1,r:{[tt.SEEDS]:4}},{c:2,t:"Erntezeit",d:"Ernte reifen Weizen auf dem Dorffeld oder auf deinem eigenen. Sammle 6 Weizen.",k:"have",a:[tt.WHEAT],n:6,r:{[tt.BREAD]:1}},{c:2,t:"Tauschhandel",d:"Tausche etwas mit einem Dorfbewohner.",k:"trade",n:1,r:{[tt.COPPER_INGOT]:1}},{c:3,t:"Steinwerkzeug",d:"Stelle an der Werkbank eine Steinspitzhacke her. Ohne sie gibt Eisen und Funkkristall nichts her.",k:"craft",a:[tt.STONE_PICK],n:1,r:{[v.LAMP]:4}},{c:3,t:"Abstieg",d:"Steige in eine Höhle, bis unter Höhe 18 (Y-Wert oben links). Vorsicht, dort unten ist es nie ganz ruhig.",k:"depth",y:18,n:1,r:{[tt.MEAT_COOKED]:2}},{c:3,t:"Kupfer schmelzen",d:"Baue einen Schmelzofen (8 Stein, an der Werkbank) und schmelze 3 Kupferbarren aus Kupfererz und Kohle.",k:"craft",a:[tt.COPPER_INGOT],n:3,r:{[v.COAL]:4}},{c:3,t:"Funkkristalle",d:"Funkkristalle leuchten tief unter der Erde. Sammle 3 Stück.",k:"have",a:[v.CRYSTAL],n:3,r:{[tt.IRON_INGOT]:2}},{c:4,t:"Der Funksender",d:"Baue an der Werkbank einen Funksender (2 Kupferbarren, 1 Funkkristall, 1 Radio) und setze ihn.",k:"place",a:[v.SENDER],n:1,r:{[v.WIRE]:8}},{c:4,t:"Strom drauf",d:"Setze einen Schalter direkt neben den Sender (oder verbinde beide mit Signalleitungen) und schalte ihn mit der Setzen-Taste ein.",k:"place",a:[v.SWITCH],n:1,r:{[tt.COPPER_INGOT]:2}},{c:4,t:"Relais",d:"Ein Funkrelais trägt das Signal 24 Blöcke weiter. Baue eins (Kupfer, Kristall, 2 Stein) und setze es höchstens 24 Blöcke vom Sender entfernt.",k:"place",a:[v.RELAY],n:1,r:{[v.CRYSTAL]:1,[tt.COPPER_INGOT]:1}},{c:4,t:"Die Verbindung",d:"Bringe einen Empfänger zum Leuchten, der mindestens 40 Blöcke vom eingeschalteten Sender entfernt steht (über das Relais).",k:"reach",n:40,r:{[tt.IRON_INGOT]:3}},{c:5,t:"Gerüstet",d:"Stelle an der Werkbank einen Helm oder Harnisch her und lege ihn an (wählen, Setzen drücken).",k:"craft",a:[tt.COPPER_HELMET,tt.COPPER_CHEST,tt.IRON_HELMET,tt.IRON_CHEST],n:1,r:{[tt.BREAD]:3}},{c:5,t:"Störsender",d:"Nachts fliegen Störsender-Drohnen. Hol eine vom Himmel.",k:"kill",a:[Xx],n:1,r:{[v.CRYSTAL]:1}},{c:5,t:"Wesen der Tiefe",d:"In tiefen Höhlen hausen Höhlenwesen. Besiege 2 davon.",k:"kill",a:[$x],n:2,r:{[tt.IRON_INGOT]:2}},{c:5,t:"Maschinen",d:"Schalte mit deinem Netz 3 Maschinen gleichzeitig ein: Signallampen oder Funktore neben Leitungen oder Empfängern.",k:"powered",n:3,r:{[v.RAINBOW]:1}},{c:6,t:"Der Funkturm",d:"Baue einen Turm: Erreiche 20 Blöcke über deinem Startpunkt.",k:"height",n:20,r:{[v.RELAY]:1}},{c:6,t:"Großes Netz",d:"Lass 3 Empfänger gleichzeitig leuchten.",k:"net",n:3,r:{[v.RAINBOW]:1}},{c:6,t:"Die letzte Frequenz",d:"Setze einen Regenbogen-Block auf deinen Funkturm. Das Netz steht, das Rauschen verstummt.",k:"place",a:[v.RAINBOW],n:1,r:{[v.RAINBOW]:2}}],Ls=i=>i&&i.c==="rauschen"?Tf:bf;function Af(i,t){const e=i.story,n=i.sigStats||{receivers:0,machines:0,reach:0};if(t.k==="have"){let s=0;for(const r of t.a)s+=i.inv[r]||0;return[s,t.n]}return t.k==="height"?[Math.max(0,Math.floor(e.max)),t.n]:t.k==="net"?[n.receivers,t.n]:t.k==="powered"?[n.machines,t.n]:t.k==="reach"?[Math.floor(n.reach),t.n]:[Math.floor(e.p),t.n]}const Yx=480,or=6,Kx=`
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
}`,jx=`
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
}`,Zx="varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }",Jx=`
uniform vec3 uHor; uniform vec3 uZen; uniform vec3 uSunN; uniform vec3 uGlow; varying vec3 vDir;
void main(){
  float h = clamp(vDir.y, 0.0, 1.0);
  vec3 c = mix(uHor, uZen, pow(h, 0.5));
  c += uGlow * pow(max(dot(normalize(vDir), uSunN), 0.0), 6.0);
  gl_FragColor = vec4(c, 1.0);
}`,Qx=`
uniform vec2 uOff; varying vec2 vUv; varying float vD;
void main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vUv = (wp.xz + uOff) / 520.0; vD = length(position.xy) / 1200.0; gl_Position = projectionMatrix * viewMatrix * wp; }`,tM=`
uniform sampler2D uTex; uniform vec3 uCol; varying vec2 vUv; varying float vD;
void main(){ float a = texture2D(uTex, vUv).a * (1.0 - smoothstep(0.45, 0.95, vD)) * 0.9; gl_FragColor = vec4(uCol, a); }`,Wo=(i,t,e)=>i+(t-i)*e,mi=(i,t,e)=>[Wo(i[0],t[0],e),Wo(i[1],t[1],e),Wo(i[2],t[2],e)],ya=(i,t,e)=>{const n=Math.max(0,Math.min(1,(e-i)/(t-i)));return n*n*(3-2*n)};class eM{constructor(t,e,n="auto"){this.coarse=e;const s=window.devicePixelRatio||1;this.renderer=new iv({canvas:t,antialias:n!=="eco"&&!(e&&s>=2.5),powerPreference:"high-performance"}),this.maxDpr=e?1.75:2,this.dprScale=1,this.budget=e?4:6,this.maxView=e?4:7,this.autoQ=!1,this.cloudsOn=!0,this.perf={acc:0,n:0,good:0},this.fps=0,this.placeDelay=!0,this.scene=new sv,this.camera=new pn(e?70:75,1,.08,1500),this.camera.rotation.order="YXZ",this.scene.add(this.camera),this.group=new Cn,this.scene.add(this.group);const r=Math.min(8,this.renderer.capabilities.getMaxAnisotropy()),a=p=>{const x=new La(p);return x.magFilter=an,x.minFilter=On,x.anisotropy=r,x.generateMipmaps=!0,x};this.atlasCanvas=lx(),this.atlasTex=new ov(this.atlasCanvas.raw,this.atlasCanvas.width,this.atlasCanvas.height,gn),this.atlasTex.magFilter=an,this.atlasTex.minFilter=On,this.atlasTex.anisotropy=r,this.atlasTex.generateMipmaps=!0,this.atlasTex.needsUpdate=!0,this.logoCanvas=cx(()=>{this.logoTex.needsUpdate=!0,!this.running&&this.world&&this.render()},()=>this.onLogos()),this.logoTex=a(this.logoCanvas),this.onLogos=()=>{},this.uni={uAmb:{value:new I(.44,.5,.62)},uSunCol:{value:new I(.6,.57,.5)},uSunDir:{value:new I(0,1,.25).normalize()},uFog:{value:new I(.68,.84,.95)},uFogRange:{value:new Xt(40,90)},uTime:{value:0}};const o=(p,x,S,y)=>new Ln({vertexShader:Kx,fragmentShader:jx,transparent:S,depthWrite:!S,side:S?mn:ti,uniforms:{...y,uMap:{value:p},uCut:{value:x}}});this.matO=o(this.atlasTex,.5,!1,this.uni),this.matT=o(this.atlasTex,.02,!0,this.uni),this.matL=o(this.logoTex,.5,!1,this.uni),this.sky=new Cn,this.scene.add(this.sky),this.domeU={uHor:{value:new I},uZen:{value:new I},uSunN:{value:new I(1,0,0)},uGlow:{value:new I}};const l=new be(new nc(700,20,12),new Ln({vertexShader:Zx,fragmentShader:Jx,uniforms:this.domeU,side:je,depthWrite:!1,depthTest:!1}));l.renderOrder=-20,l.frustumCulled=!1,this.sky.add(l);const c=(p,x)=>{const S=new be(new qi(p,p),new bi({color:x,fog:!1,depthWrite:!1}));return S.renderOrder=-10,this.sky.add(S),S};this.sun=c(80,16773808),this.moon=c(52,14674175);const h=new Float32Array(300*3);for(let p=0;p<300;p++){const x=Math.random()*2-1,S=Math.random()*Math.PI*2,y=Math.sqrt(1-x*x);h[p*3]=Math.cos(S)*y*600,h[p*3+1]=x*600,h[p*3+2]=Math.sin(S)*y*600}const u=new De;u.setAttribute("position",new Pe(h,3)),this.starMat=new tf({color:16777215,size:2,sizeAttenuation:!1,transparent:!0,opacity:0,fog:!1,depthWrite:!1}),this.stars=new lv(u,this.starMat),this.stars.renderOrder=-15,this.sky.add(this.stars);const f=new La(hx());f.wrapS=f.wrapT=Ua,f.minFilter=On,f.magFilter=an,this.cloudU={uTex:{value:f},uCol:{value:new I(1,1,1)},uOff:{value:new Xt}},this.clouds=new be(new qi(2400,2400),new Ln({vertexShader:Qx,fragmentShader:tM,uniforms:this.cloudU,transparent:!0,depthWrite:!1,side:mn})),this.clouds.rotation.x=-Math.PI/2,this.clouds.frustumCulled=!1,this.chunkSphereR=Math.hypot(V/2,ae/2,V/2)+1,this.scene.add(this.clouds);const d=new cv(new wi(1.004,1.004,1.004));this.hl=new Th(d,new hr({color:0,transparent:!0,opacity:.75})),this.hl.visible=!1,this.scene.add(this.hl),this.ghost=new Th(d,new hr({color:16777215,transparent:!0,opacity:.55,depthTest:!1})),this.ghost.visible=!1,this.ghost.renderOrder=40,this.scene.add(this.ghost),this.buildMode=0,this.anchor=null,this.clip=null,this.batch=null,this.preview=!0,this.beam=new Il(new De().setFromPoints([new I,new I]),new hr({color:16722538})),this.beam.frustumCulled=!1,this.beam.visible=!1,this.beamT=0,this.scene.add(this.beam);const g={uAmb:{value:new I(.62,.64,.7)},uSunCol:{value:new I(.5,.46,.38)},uSunDir:{value:new I(.35,.8,.5).normalize()},uFog:{value:new I},uFogRange:{value:new Xt(1e5,2e5)},uTime:this.uni.uTime},_=p=>{const x=o(p,.5,!1,g);return x.depthTest=!1,x};this.handMatO=_(this.atlasTex),this.handMatL=_(this.logoTex),this.hand=new be(new De,this.handMatO),this.hand.frustumCulled=!1,this.hand.renderOrder=50,this.hand.visible=!1,this.camera.add(this.hand),this.itemCanvas=ux(Ha.map(p=>Te[p]));const m=new La(this.itemCanvas);if(m.magFilter=Ze,m.minFilter=Ze,m.generateMipmaps=!1,this.itemHand=new be(new qi(1,1),new bi({map:m,transparent:!0,alphaTest:.5,depthTest:!1,side:mn})),this.itemHand.frustumCulled=!1,this.itemHand.renderOrder=50,this.itemHand.visible=!1,this.camera.add(this.itemHand),this.mobView=new gx(this.scene),this.mobs=null,this.light=1,this.vehView=new yx(this.scene),this.vehicles=null,this.ride=null,this.prevJump=!1,this.meshSeq=0,this.mwJobs=0,this.mw=null,typeof Worker<"u")try{this.mw=new Worker(new URL(""+new URL("meshworker-D6QDB5xl.js",import.meta.url).href,import.meta.url),{type:"module"}),this.mw.onmessage=p=>this.onMeshed(p.data),this.mw.onerror=()=>{this.mw=null,this.mwJobs=0,this.scanDirty=!0}}catch{this.mw=null}this.handType=-1,this.swing=0,this.bob=0,this.parts=[],this.partCount=0,this.rope=new Il(new De().setFromPoints([new I,new I]),new hr({color:16769162})),this.rope.frustumCulled=!1,this.rope.visible=!1,this.scene.add(this.rope),this.hookT=0,this.hookTarget=new I,this.wp=null,this.timeFrozen=!1,this.radioT=0,this.player=new Bx,this.input={f:0,r:0,jump:!1,down:!1,sprint:!1},this.breakHeld=!1,this.placeHeld=!1,this.actCool=0,this.world=null,this.running=!1,this.raf=0,this.last=0,this.viewDist=e?4:7,this.offsets=[],this.setViewDist(this.viewDist),this.onChange=()=>{},this.onToast=()=>{},this.story=null,this.onQuest=()=>{},this.onQuestDone=()=>{},this.vitals=null,this.dead=!1,this.mine=null,this.deathLoss="keep",this.enemies=!0,this.farm=new Zh,this.age=0,this.history=[],this.redoList=[],this.onVitals=()=>{},this.onHurt=()=>{},this.onDeath=()=>{},this.onMine=()=>{},this.onStation=()=>{},this.onTrade=()=>{},this.onBuildMode=()=>{},this.onRide=()=>{},this.mp=null,this.net=null,this.armor={kopf:0,brust:0},this.armWear={kopf:0,brust:0},this.resize()}setQuality(t,e){const n=Fl[t]||Fl.standard;this.qName=t,this.autoQ=!!e,this.maxDpr=n.dpr,this.dprScale=1,this.budget=n.budget,this.cloudsOn=n.clouds,this.maxView=n.view,this.perf.acc=this.perf.n=this.perf.good=0,this.menuMode?this.savedView=n.view:this.setViewDist(n.view),this.resize()}measure(t){const e=this.perf;if(t>250||(e.acc+=t,e.n++,e.acc<2e3))return;const n=e.acc/e.n;e.acc=e.n=0,this.fps=Math.round(1e3/n),!(!this.autoQ||this.menuMode)&&(n>26?(e.good=0,this.dprScale>.6?(this.dprScale=Math.max(.6,this.dprScale-.15),this.resize()):this.viewDist>3&&this.setViewDist(this.viewDist-1)):n<18&&++e.good>=3&&(e.good=0,this.dprScale<1?(this.dprScale=Math.min(1,this.dprScale+.1),this.resize()):this.viewDist<this.maxView&&this.setViewDist(this.viewDist+1)))}setViewDist(t){this.viewDist=t;const e=t+2,n=[];for(let s=-e-1;s<=e+1;s++)for(let r=-e-1;r<=e+1;r++){const a=Math.hypot(r,s);a<=e&&n.push([r,s,a])}n.sort((s,r)=>s[2]-r[2]),this.offsets=n,this.scanDirty=!0}resize(){const t=window.innerWidth,e=window.innerHeight;this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,this.maxDpr)*this.dprScale),this.renderer.setSize(t,e,!1),this.camera.aspect=t/e,this.camera.updateProjectionMatrix(),!this.running&&this.world&&this.render()}start(t){if(this.stop(),this.clearWorld(),this.leaveMenu(),this.gen=hf(t.gen),this.world=new Nh(t.seed,Uv(t.edits),this.gen),this.name=t.name,this.seed=t.seed,this.mode=t.mode,this.time=t.time??.08,this.hotbar=Array.isArray(t.hotbar)&&t.hotbar.length===9?t.hotbar.map(s=>Number.isInteger(s)&&Hh(s)?s:0):[1,2,3,4,5,6,7,8,9],this.sel=t.sel??0,this.inv=t.inv?{...t.inv}:{[v.DIRT]:20,[v.PLANKS]:10,[v.GLASS]:4},this.story=t.mode==="story"?t.story?{...t.story}:{i:0,p:0,max:0,done:!1,c:this.gen===3?"rauschen":void 0}:null,this.story&&!this.story.c&&delete this.story.c,this.sigStats={receivers:0,machines:0,reach:0,senders:0},this.sigRetry=!1,!t.inv&&t.mode==="survival"){for(let s=0;s<16;s++)this.inv[ii+s]=4;for(let s=0;s<ef;s++)this.inv[Ul+s]=8}if(this.wp=t.wp||null,this.hookT=0,this.rope.visible=!1,this.timeFrozen=!1,this.handType=-1,this.survival=t.mode==="survival"||t.mode==="story"&&this.gen===3,this.vitals=this.survival?new Qh(t.vit||{}):null,this.dead=!1,this.mine=null,this.player.impact=0,this.dur={},t.dur&&typeof t.dur=="object")for(const[s,r]of Object.entries(t.dur))$i(Number(s))&&Number.isFinite(r)&&(this.dur[s]=r);this.armor={kopf:0,brust:0},this.armWear={kopf:0,brust:0},Array.isArray(t.arm)&&["kopf","brust"].forEach((s,r)=>{const a=nr(t.arm[r]);a&&a.slot===s&&(this.armor[s]=t.arm[r],this.armWear[s]=Math.max(0,Math.min(a.dur-1,t.arm[r+2]|0)))}),this.buildMode=0,this.anchor=null,this.clip=null,this.batch=null;const e=t.grave;this.grave=e&&[e.x,e.y,e.z].every(Number.isFinite)&&e.inv&&typeof e.inv=="object"?e:null,this.mobs=new zx(this.world,t.seed,t.mobs,t.mode!=="story"||this.gen===3),this.gen===3&&(this.mobs.findVillages=(s,r)=>{const a=[],o=Ci(s),l=Ci(r);for(let c=-1;c<=1;c++)for(let h=-1;h<=1;h++){const u=Ya(this.seed,o+h,l+c);u&&a.push(u)}return a}),this.mobs.onAdd=s=>this.mobView.add(s),this.mobs.onRemove=s=>this.mobView.remove(s),this.vehicles=new dx(this.world,t.veh),this.ride=null,this.prevJump=!1,this.vehicles.onAdd=s=>this.vehView.add(s),this.vehicles.onRemove=s=>this.vehView.remove(s),this.vehicles.attach(),this.mobs.onAttack=s=>this.mobHits(s),this.mobs.onPoof=s=>this.spawnBreak(s.x-.5,s.y+.5,s.z-.5,v.BASALT),this.age=Number.isFinite(t.age)&&t.age>=0?t.age:0,this.farm=new Zh(t.farm),this.farmT=0,this.history=[],this.redoList=[],this.spawn=this.world.findSpawn(t.mode!=="story"),this.spawnY=this.spawn.y;const n=this.player;t.px!==void 0?(n.x=t.px,n.y=t.py,n.z=t.pz,this.yaw=t.yaw||0,this.pitch=t.pitch||0):(n.x=this.spawn.x,n.y=this.spawn.y,n.z=this.spawn.z,this.yaw=0,this.pitch=-.1),n.vx=n.vy=n.vz=0,n.flying=!1,n.onGround=!1,this.target=null,this.unsaved=!1,this.loadAround(2,1),this.scanDirty=!0,this.lastPC=null,this.applyCamera(),this.updateSky(),this.resume()}startMenu(){this.stop(),this.clearWorld(),this.menuMode=!0,this.savedView=this.savedView??this.viewDist,this.setViewDist(Math.min(this.viewDist,4)),this.world=new Nh(20241,new Map,1),this.mode="creative",this.time=.06,this.menuT=0,this.hotbar=new Array(9).fill(0),this.sel=0,this.inv={};const t=this.world.findSpawn(),e=this.player,n=this.world;e.x=t.x,e.z=t.z,e.y=t.y,e.flying=!1,e.vx=e.vy=e.vz=0,e.hook=!1,this.loadAround(3,2);const s=Math.floor(t.x),r=Math.floor(t.z),a=Math.floor(t.y)-1;for(let l=s-5;l<=s+5;l++)for(let c=r-5;c<=r+5;c++){for(let h=a+1;h<=a+9;h++)n.setBlock(l,h,c,v.AIR);n.setBlock(l,a,c,l+c&1?v.MARBLE:v.STONE)}for(let l=0;l<16;l++)n.setBlock(s-2+l%4,a+1,r-2+(l>>2),ii+l);const o=[v.NEON_R,v.NEON_B,v.NEON_G,v.NEON_P];[[-3,-3],[3,-3],[3,3],[-3,3]].forEach(([l,c],h)=>{for(let u=1;u<=4;u++)n.setBlock(s+l,a+u,r+c,o[h]);n.setBlock(s+l,a+5,r+c,v.RAINBOW)}),n.setBlock(s,a+2,r,v.RADIO);for(let l=3;l<=5;l++)n.setBlock(s,a+l,r,v.FEDER);n.setBlock(s,a+6,r,v.RAINBOW),this.menuC={x:s+.5,y:a+3,z:r+.5},this.flushDirty(),this.hand.visible=!1,this.hl.visible=!1,this.rope.visible=!1,this.scanDirty=!0,this.lastPC=null,this.menuStep(0),this.resume()}leaveMenu(){this.menuMode&&(this.menuMode=!1,this.savedView!=null&&(this.setViewDist(this.savedView),this.savedView=null))}menuStep(t){this.menuT+=t,this.time=(this.time+t/150)%1;const e=this.menuC,n=this.menuT*.07,s=15+Math.sin(this.menuT*.05)*2.5,r=4.5+Math.sin(this.menuT*.11)*1.5;this.camera.position.set(e.x+Math.cos(n)*s,e.y+r,e.z+Math.sin(n)*s),this.camera.lookAt(e.x,e.y-3.2,e.z),this.stream(),this.flushDirty(),this.uni.uTime.value=performance.now()/1e3,this.updateSky(),this.cloudU.uOff.value.x+=t*2.5}clearWorld(){for(const t of this.group.children.slice())t.geometry.dispose(),this.group.remove(t);this.mobs&&(this.mobs.clear(),this.mobs=null),this.mobView.clear(),this.vehicles&&(this.vehicles.clear(),this.vehicles=null),this.vehView.clear(),this.ride=null,this.vitals=null,this.dead=!1,this.world=null,this.mwJobs=0}loadAround(t,e){const n=Math.floor(this.player.x/V),s=Math.floor(this.player.z/V);for(let r=-t;r<=t;r++)for(let a=-t;a<=t;a++)this.world.ensure(n+a,s+r);for(let r=-e;r<=e;r++)for(let a=-e;a<=e;a++)this.applyMesh(this.world.getChunk(n+a,s+r))}serialize(){const t=this.player,e=df(this.world.edits);return{v:ff,gen:this.gen,name:this.name,seed:this.seed,mode:this.mode,time:this.time,savedAt:Date.now(),px:t.x,py:t.y,pz:t.z,yaw:this.yaw,pitch:this.pitch,hotbar:this.hotbar,sel:this.sel,inv:this.inv,wp:this.wp,story:this.story,edits:e,vit:this.vitals?this.vitals.toJSON():void 0,dur:this.dur,grave:this.grave||void 0,mobs:this.mobs?this.mobs.serialize():void 0,age:Math.round(this.age),farm:this.farm.plants.size?this.farm.serialize():void 0,arm:this.armor.kopf||this.armor.brust?[this.armor.kopf,this.armor.brust,this.armWear.kopf,this.armWear.brust]:void 0,veh:this.vehicles&&this.vehicles.list.length?this.vehicles.serialize():void 0}}respawn(){const t=this.player;this.world.ensure(Math.floor(this.spawn.x/V),Math.floor(this.spawn.z/V)),t.x=this.spawn.x,t.y=this.spawn.y,t.z=this.spawn.z,t.vx=t.vy=t.vz=0,t.flying=!1,t.impact=0,this.hookT=0,this.rope.visible=!1,this.loadAround(1,0),this.scanDirty=!0,this.applyCamera(),this.running||this.render()}resume(){this.running||(this.running=!0,this.last=performance.now(),this.raf=requestAnimationFrame(t=>this.frame(t)))}stop(){this.running=!1,cancelAnimationFrame(this.raf),cu(0,0)}frame(t){if(!this.running||(this.raf=requestAnimationFrame(n=>this.frame(n)),this.menuMode&&t-this.last<32))return;this.measure(t-this.last);const e=Math.max(0,Math.min(.05,(t-this.last)/1e3));this.last=t,this.menuMode?this.menuStep(e):this.step(e),this.render()}step(t){const e=this.world,n=this.player;if(this.timeFrozen||(this.time=(this.time+t/Yx)%1),this.uni.uTime.value=performance.now()/1e3,this.dead||(this.ride?this.rideStep():(this.updateHook(t),n.update(e,t,this.input,this.yaw)),n.bounces&&(this.questEvent("bounce",0,n.bounces),n.bounces=0),this.story&&n.gliding&&(this.glideAcc=(this.glideAcc||0)+t),this.vitals&&!n.waiting&&this.updateVitals(t)),this.vehicles&&this.vehicles.list.length){const o=-Math.sin(this.yaw),l=-Math.cos(this.yaw),c=Math.hypot(o,l)||1;this.vehicles.update(t,this.ride,this.ride&&!this.dead?{f:this.input.f,r:this.input.r,look:[o/c,l/c]}:null),this.ride&&this.seatPlayer(),this.vehView.update(n.x,n.z,this.light,this.viewDist*V,this.uni.uTime.value)}this.applyCamera(),this.stream();const s=this.time>.52&&this.time<.98;this.mobs&&(this.mobs.update(t,n.x,n.z,{py:n.y,night:s,time:this.time,hostiles:this.survival&&this.enemies&&!this.dead,others:this.mp?this.mp.others():null}),this.mobView.update(n.x,n.z,this.light,this.viewDist*V,this.uni.uTime.value)),this.mp&&this.mp.tick(t),this.dead||(this.age+=t),this.farmT-=t,this.farmT<=0&&(this.farmT=2,!this.net&&this.farm.update(this.world,this.age)&&(this.unsaved=!0));const r=this.camera,a=this.lookDir||(this.lookDir=new I);a.set(0,0,-1).applyEuler(r.rotation),this.target=this.dead?null:ru(e,r.position.x,r.position.y,r.position.z,a.x,a.y,a.z,or),this.target?(this.hl.position.set(this.target.x+.5,this.target.y+.5,this.target.z+.5),this.hl.visible=!0):this.hl.visible=!1,this.updateGhost(),this.beamT>0&&(this.beamT-=t)<=0&&(this.beam.visible=!1),this.actCool-=t,this.placeHeld&&!this.prevPlace&&(this.placeFirst=!0),this.prevPlace=this.placeHeld,this.breakHeld&&!this.dead?this.useBreak(t,a):(this.setMine(null),this.actCool<=0&&this.placeHeld&&!this.dead&&this.placeBlock()&&(this.actCool=this.placeFirst&&this.placeDelay?.45:.25,this.placeFirst=!1)),this.flushDirty(),this.updateSky(),this.cloudU.uOff.value.x+=t*2.5,this.radioT-=t,(this.world.sigDirty||this.sigRetry&&this.radioT<=0)&&this.updateSignals(),this.radioT<=0&&(this.radioT=.3,this.updateRadio(),this.questTick(),this.checkGrave()),this.updateHand(t),this.partCount&&this.updateParticles(t)}updateVitals(t){const e=this.vitals,n=this.player,s=[Math.ceil(e.hp),Math.ceil(e.food),Math.ceil(e.air)];let r=0;if(n.impact){const o=Cx(n.impact);n.impact=0,o&&!n.inWater&&(e.hurt(o,"Sturz"),r+=o)}const a=n.onGround&&this.world.getBlock(Math.floor(n.x),Math.floor(n.y-.05),Math.floor(n.z))===v.MAGMA;if(r+=e.tick(t,{moving:Math.hypot(n.vx,n.vz)>.5,sprint:this.input.sprint,eyeWater:n.eyeWater,onMagma:a}),r>0&&(this.onHurt(r,e.cause),this.unsaved=!0),e.dead){this.die(e.cause);return}(s[0]!==Math.ceil(e.hp)||s[1]!==Math.ceil(e.food)||s[2]!==Math.ceil(e.air))&&this.onVitals()}die(t){const e=this.player;this.ride&&this.dismount(),this.dead=!0,this.breakHeld=this.placeHeld=!1,this.hookT=0,this.rope.visible=!1,this.setMine(null),e.vx=e.vy=e.vz=0;const n={x:Math.round(e.x),y:Math.round(e.y),z:Math.round(e.z)};let s=!1;if(this.deathLoss==="grave"){const r={};for(const[a,o]of Object.entries(this.inv))o>0&&(r[a]=o);if(Object.keys(r).length){if(this.grave)for(const[a,o]of Object.entries(this.grave.inv))r[a]=Math.min(Ge,(r[a]||0)+o);this.grave={...n,inv:r},this.inv={},s=!0}}this.wp=n,this.unsaved=!0,this.onDeath(t,s)}revive(){this.dead&&(this.vitals=new Qh,this.dead=!1,this.player.impact=0,this.respawn(),this.onVitals(),this.onChange())}checkGrave(){const t=this.grave,e=this.player;if(!(!t||this.dead||Math.hypot(t.x-e.x,t.y-e.y,t.z-e.z)>2.5)){for(const[n,s]of Object.entries(t.inv))Hh(Number(n))&&(this.inv[n]=Math.min(Ge,(this.inv[n]||0)+s));this.wp&&this.wp.x===t.x&&this.wp.z===t.z&&(this.wp=null),this.grave=null,this.unsaved=!0,$e(),this.onToast("Deine Sachen sind wieder da"),this.onChange()}}held(){const t=this.hotbar[this.sel];return t&&(this.mode==="creative"||this.inv[t]>0)?t:0}setMine(t){const e=!!this.mine;this.mine=t,(e||t)&&this.onMine(t?Math.min(1,t.t/t.need):0)}useBreak(t,e){if(this.actCool>0)return;const n=this.camera.position,s=this.target,r=this.mobs?this.mobs.raycast(n.x,n.y,n.z,e.x,e.y,e.z,or):null,a=this.vehHit(e);if(a&&(!s||a.t<s.t)&&(!r||a.t<r.t)){this.pickVehicle(a.veh),this.actCool=.45,this.setMine(null);return}if(r&&(!s||r.t<s.t)){this.attack(r.mob),this.actCool=.45,this.setMine(null);return}if(!this.survival){this.setMine(null),this.breakBlock()&&(this.actCool=.22);return}if(!s||s.y===0){this.setMine(null);return}const o=this.held();if(!Xv(s.type,o)){qe(),this.onToast(`${yr[s.type]} braucht eine ${ne[s.type].tier>1?"Stein- oder bessere ":""}Spitzhacke`),this.actCool=.8,this.setMine(null);return}let l=this.mine;if((!l||l.x!==s.x||l.y!==s.y||l.z!==s.z||l.held!==o)&&(l={x:s.x,y:s.y,z:s.z,held:o,t:0,need:Wv(s.type,o),sw:0}),l.t+=t,l.sw-=t,l.sw<=0&&(l.sw=.25,this.swing=1),l.t>=l.need){this.setMine(null),this.breakBlock()&&(this.actCool=.1);return}this.setMine(l)}attack(t){if(t.npc){this.onToast(`${t.name}: „He, nicht hauen! Lass uns lieber tauschen.“`),this.actCool=.8;return}const e=this.held(),n=$i(e),s=this.player,r=this.mode==="creative"?99:n?n.kind==="schwert"?n.dmg:n.kind==="axt"?3:2:1;if(this.swing=1,Vo(),n&&n.kind==="schwert"&&this.wear(e),this.net){this.net.hit(t.id,Math.min(r,10)),t.hurtT=.35;return}if(!t.hit(r,s.x,s.z)||(this.spawnBreak(t.x-.5,t.y,t.z-.5,v.WOOL),this.mobs.remove(t,!1),this.unsaved=!0,this.questEvent("kill",t.type),this.mode==="creative"))return;const a=Ef(t.type).map(([o,l])=>(this.inv[o]=Math.min(Ge,(this.inv[o]||0)+l),`+${l} ${ve(o)}`));a.length&&this.onToast(a.join(" · ")),this.onChange()}mobHits(t){if(t.target&&this.mp){this.mp.hurtGuest(t);return}const e=this.vitals,n=this.player;if(!e||this.dead)return;const s=Math.hypot(n.x-t.x,n.z-t.z)||1;if(t.T.range){const a=this.beam.geometry.attributes.position;a.setXYZ(0,t.x,t.y+.3,t.z),a.setXYZ(1,n.x,n.y+1.2,n.z),a.needsUpdate=!0,this.beam.visible=!0,this.beamT=.15}else n.vx+=(n.x-t.x)/s*6,n.vz+=(n.z-t.z)/s*6,n.vy=Math.max(n.vy,5),n.onGround=!1;const r=t.T.dmg*Fh(this.armorPoints());this.wearArmor(),e.hurt(r,t.T.name),qe(),this.onHurt(r,t.T.name),this.onVitals(),this.unsaved=!0,e.dead&&this.die(t.T.name)}remoteHurt(t){const e=this.vitals,n=this.player;if(!e||this.dead)return;const s=Array.isArray(t.from)&&t.from.slice(0,3).every(Number.isFinite)?t.from:null;if(s&&s[3]){const o=this.beam.geometry.attributes.position;o.setXYZ(0,s[0],s[1],s[2]),o.setXYZ(1,n.x,n.y+1.2,n.z),o.needsUpdate=!0,this.beam.visible=!0,this.beamT=.15}else if(s){const o=Math.hypot(n.x-s[0],n.z-s[2])||1;n.vx+=(n.x-s[0])/o*6,n.vz+=(n.z-s[2])/o*6,n.vy=Math.max(n.vy,5),n.onGround=!1}const r=typeof t.cause=="string"?t.cause.slice(0,30):"Gegner",a=Math.min(10,t.dmg)*Fh(this.armorPoints());this.wearArmor(),e.hurt(a,r),qe(),this.onHurt(a,r),this.onVitals(),e.dead&&this.die(r)}record(t,e,n,s,r){if(this.net&&this.net.local(t,e,n,s,r),this.mode==="creative"){if(this.batch){this.batch.push([t,e,n,s,r]);return}this.history.push([[t,e,n,s,r]]),this.history.length>100&&this.history.shift(),this.redoList.length=0}}beginBatch(){this.batch=[]}endBatch(){const t=this.batch;this.batch=null,t&&t.length&&(this.history.push(t),this.history.length>100&&this.history.shift(),this.redoList.length=0)}undo(t=!1){if(this.mode!=="creative")return this.onToast("Rückgängig gibt es im Kreativmodus"),!1;const e=t?this.redoList:this.history,n=t?this.history:this.redoList,s=e.pop();if(!s)return this.onToast(t?"Nichts zum Wiederholen":"Nichts zum Rückgängigmachen"),!1;const r=t?s:s.slice().reverse();for(const[a,o,l,c,h]of r){this.world.ensure(a>>4,l>>4);const u=t?c:h,f=t?h:c;this.world.setBlock(a,o,l,f)&&this.net&&this.net.local(a,o,l,u,f)}return n.push(s),this.unsaved=!0,$e(),this.running||(this.flushDirty(),this.render()),!0}hoe(t){const e=this.target;return!e||![v.GRASS,v.DIRT,v.FLOWERS,v.MYCEL].includes(e.type)||this.world.getBlock(e.x,e.y+1,e.z)!==v.AIR||!this.world.setBlock(e.x,e.y,e.z,v.FARMLAND)?!1:(this.record(e.x,e.y,e.z,e.type,v.FARMLAND),this.wear(t),this.swing=1,$e(),this.unsaved=!0,this.onChange(),!0)}sow(t){const e=this.target;return!e||e.type!==v.FARMLAND||this.world.getBlock(e.x,e.y+1,e.z)!==v.AIR?(this.onToast("Samen brauchen Ackerboden (Hacke auf Gras oder Erde)"),this.actCool=.6,!1):this.mode!=="creative"&&!(this.inv[t]>0)?(qe(),this.onToast(`Keine ${ve(t)} im Vorrat`),this.actCool=.4,!1):this.farm.plant(e.x,e.y+1,e.z,this.age)?(this.world.setBlock(e.x,e.y+1,e.z,Oo(t)),this.record(e.x,e.y+1,e.z,v.AIR,Oo(t)),this.mode!=="creative"&&this.inv[t]--,this.swing=1,$e(),this.unsaved=!0,this.onChange(),!0):(this.onToast("Zu viele Pflanzen in dieser Welt"),!1)}eat(t){return this.vitals?this.inv[t]>0?this.vitals.eat(Bh(t))?(this.inv[t]--,this.swing=1,$e(),this.unsaved=!0,this.onChange(),this.onVitals(),!0):(this.onToast("Du bist satt"),this.actCool=.6,!1):(qe(),this.onToast(`Kein ${ve(t)} im Vorrat`),this.actCool=.4,!1):(this.onToast("Essen braucht man nur im Überlebensmodus"),this.actCool=.6,!1)}wear(t){const e=$i(t);if(!e||this.mode==="creative")return;const n=(this.dur[t]||0)+1;if(n<e.dur){this.dur[t]=n;return}delete this.dur[t],this.inv[t]=Math.max(0,(this.inv[t]||0)-1),qe(),this.onToast(`${ve(t)} ist zerbrochen`)}stationsNear(t=4){const e=new Set,n=this.player,s=this.world;if(!s)return e;const r=Math.floor(n.x),a=Math.floor(n.y),o=Math.floor(n.z);for(let l=a-2;l<=a+3;l++)for(let c=o-t;c<=o+t;c++)for(let h=r-t;h<=r+t;h++){const u=ne[s.getBlock(h,l,c)];u&&u.station&&e.add(u.station)}return e}updateSignals(){const t=this.world,e=this.player,n=bv(t.sig);this.sigStats=n,this.sigRetry=!1;for(const[s,r]of t.sig){const a=r[3],o=yv[a]??a;if(!Ih[o])continue;const l=n.on.has(s)?Ih[o]:o;if(l!==a){if(l===v.GATE&&e.x+.3>r[0]&&e.x-.3<r[0]+1&&e.z+.3>r[2]&&e.z-.3<r[2]+1&&e.y+1.8>r[1]&&e.y<r[1]+1){this.sigRetry=!0;continue}t.setBlock(r[0],r[1],r[2],l)}}t.sigDirty=!1,n.capped&&this.onToast("Signalnetz zu groß: nicht alles wird berechnet")}fireHook(){if(!this.running||this.ride)return;const t=this.camera,e=new I(0,0,-1).applyEuler(t.rotation),n=ru(this.world,t.position.x,t.position.y,t.position.z,e.x,e.y,e.z,40);if(!n){qe(),this.onToast("Seilhaken: kein Ziel in Reichweite");return}this.hookTarget.set(n.x+.5+n.nx*.9,n.y+.5+n.ny*.9,n.z+.5+n.nz*.9),this.hookT=1.6,$e(),this.questEvent("hook",0)}updateHook(t){const e=this.player;if(e.hook=!1,this.hookT<=0){this.rope.visible=!1;return}this.hookT-=t;const n=this.hookTarget,s=n.x-e.x,r=n.y-(e.y+Go),a=n.z-e.z,o=Math.hypot(s,r,a);if(o<2||this.hookT<=0){this.hookT=0,this.rope.visible=!1,e.vx*=.6,e.vz*=.6,e.vy=Math.max(e.vy*.6,3);return}const l=24/o;e.vx=s*l,e.vy=r*l,e.vz=a*l,e.hook=!0;const c=this.rope.geometry.attributes.position;c.setXYZ(0,e.x+.3,e.y+Go-.35,e.z),c.setXYZ(1,n.x,n.y,n.z),c.needsUpdate=!0,this.rope.visible=!0}toggleWaypoint(){const t=this.player;this.wp&&Math.hypot(this.wp.x-t.x,this.wp.z-t.z)<4?(this.wp=null,this.onToast("Wegpunkt entfernt")):(this.wp={x:Math.round(t.x),y:Math.round(t.y),z:Math.round(t.z)},this.onToast("Wegpunkt gesetzt")),this.unsaved=!0}updateRadio(){const t=this.player;let e=1e9,n=0;for(const s of this.world.radios.values()){const r=Math.hypot(s[0]+.5-t.x,s[1]+.5-(t.y+1),s[2]+.5-t.z);r<e&&(e=r,n=s[0]*7+s[2]*13+s[1]>>>0)}this.radioDist=e,cu(e<24?Math.pow(1-e/24,1.5):0,n)}questTick(){const t=this.story;if(!t||t.done)return;const e=Ls(t)[t.i];e.k==="height"&&(t.max=Math.max(t.max,this.player.y-this.spawnY)),e.k==="glide"&&this.glideAcc&&(t.p+=this.glideAcc),e.k==="depth"&&this.player.y<e.y&&(t.p=1),e.k==="visit"&&this.world.villageAt(this.player.x,this.player.z)&&(t.p=1),this.glideAcc=0,this.questCheck()}questEvent(t,e,n=1){const s=this.story;if(!s||s.done)return;const r=Ls(s)[s.i];if(r.k==="have"){this.questCheck();return}r.k!==t||r.a&&!r.a.includes(e)||(s.p+=n,this.questCheck())}questCheck(){const t=this.story,e=Ls(t);for(let n=0;t&&!t.done&&n<e.length;n++){const s=e[t.i],[r,a]=Af(this,s);if(r<a)break;for(const[o,l]of Object.entries(s.r||{}))this.inv[o]=Math.min(Ge,(this.inv[o]||0)+l);if(t.i++,t.p=0,t.max=0,t.i>=e.length)t.done=!0;else if(e[t.i].k==="visit"){const o=lf(this.seed,this.player.x,this.player.z);o&&(this.wp={x:o.x,y:o.y+1,z:o.z})}this.unsaved=!0,$e(),this.onQuestDone(s,t.done),this.onChange()}this.onQuest()}updateHand(t){const e=this.hotbar[this.sel];if(e!==this.handType){if(this.handType=e,this.hand.visible=e>0&&!_i(e),this.itemHand.visible=_i(e)&&!!Te[e],this.itemHand.visible){const a=Te[e].icon,o=this.itemCanvas.height/fr,l=a%vi/vi,c=l+1/vi,h=1-Math.floor(a/vi)/o,u=h-1/o,f=this.itemHand.geometry.attributes.uv;f.setXY(0,l,h),f.setXY(1,c,h),f.setXY(2,l,u),f.setXY(3,c,u),f.needsUpdate=!0}if(this.hand.visible){const a=ax(e),o=new De;o.setAttribute("position",new Pe(a.pos,3)),o.setAttribute("uv",new Pe(a.uv,2)),o.setAttribute("aCol",new Pe(a.col,4)),o.setIndex(new Pe(a.idx,1)),this.hand.geometry.dispose(),this.hand.geometry=o,this.hand.material=qa(e)?this.handMatL:this.handMatO}}const n=this.player,s=Math.hypot(n.vx,n.vz)>.5&&n.onGround;if(this.ride){this.hand.visible=this.itemHand.visible=!1,this.handType=-1;return}s&&(this.bob+=t*9),this.swing=Math.max(0,this.swing-t*4.5);const r=Math.sin(this.swing*Math.PI);this.hand.scale.setScalar(.12),this.hand.position.set(.34-r*.06,-.27+Math.sin(this.bob)*.008-r*.06,-.55-r*.04),this.hand.rotation.set(.25-r*.7,-.62,.06),this.itemHand.visible&&(this.itemHand.scale.setScalar(.3),this.itemHand.position.set(.36-r*.05,-.24+Math.sin(this.bob)*.008-r*.05,-.55),this.itemHand.rotation.set(-r*.9,-.35,.2+r*.4))}spawnBreak(t,e,n,s){const r=ne[s]?ne[s].color:14540253;for(let a=0;a<10;a++){this.partIdx=((this.partIdx||0)+1)%24;let o=this.parts[this.partIdx];o||(o=new be(this.partGeo||(this.partGeo=new wi(1,1,1)),new bi({color:r})),o.userData={life:0},this.scene.add(o),this.parts[this.partIdx]=o),o.userData.life||this.partCount++,o.material.color.setHex(r),o.position.set(t+.2+Math.random()*.6,e+.2+Math.random()*.6,n+.2+Math.random()*.6),o.userData={life:.55+Math.random()*.3,v:new I((Math.random()-.5)*3,Math.random()*3+1,(Math.random()-.5)*3)},o.scale.setScalar(.1+Math.random()*.08),o.visible=!0}}updateParticles(t){for(const e of this.parts){if(!e||!e.userData.life)continue;const n=e.userData;n.life-=t,n.v.y-=14*t,e.position.addScaledVector(n.v,t),n.life<=0&&(n.life=0,e.visible=!1,this.partCount--)}}applyCamera(){const t=this.player,e=this.camera;e.position.set(t.x,t.y+Go,t.z),e.rotation.set(this.pitch,this.yaw,0)}breakBlock(){const t=this.target;if(!t||t.y===0)return!1;if(this.world.setBlock(t.x,t.y,t.z,v.AIR)){this.record(t.x,t.y,t.z,t.type,v.AIR);const e=(n,s)=>{this.inv[n]=Math.min(Ge,(this.inv[n]||0)+s)};if(Sf(t.type)){if(this.farm.remove(t.x,t.y,t.z),this.mode!=="creative"){const n=Rx(t.type);n.forEach(([s,r])=>e(s,r)),this.onToast(n.map(([s,r])=>`+${r} ${ve(s)}`).join(" · "))}}else this.mode!=="creative"&&e(ne[t.type].drop||(t.type===v.FARMLAND?v.DIRT:t.type),1);if(this.mode!=="creative"&&(t.type===v.GRASS||t.type===v.FLOWERS)&&Math.random()<.12&&(e(tt.SEEDS,1),this.onToast("+1 Weizensamen")),this.survival){const n=this.held();$v(t.type,n)&&this.wear(n),(t.type===v.LEAVES||t.type===v.JLEAVES)&&Math.random()<.08&&(this.inv[tt.APPLE]=Math.min(Ge,(this.inv[tt.APPLE]||0)+1),this.onToast("+1 Apfel"))}return this.unsaved=!0,this.swing=1,this.spawnBreak(t.x,t.y,t.z,t.type),Vo(),this.onChange(),this.questEvent("break",t.type),!0}return!1}placeBlock(){const t=this.target,e=this.hotbar[this.sel],n=this.camera.position,s=this.lookDir,r=this.mobs&&s?this.mobs.raycast(n.x,n.y,n.z,s.x,s.y,s.z,or):null;if(r&&r.mob.npc&&(!t||r.t<t.t))return this.onTrade(r.mob),this.questEvent("talk",0),this.actCool=.5,!1;const a=s?this.vehHit(s):null;if(a&&(!t||a.t<t.t)&&!this.ride)return this.placeFirst&&this.mount(a.veh),!1;if(e&&zh(e))return this.placeVehicle(e);if(t&&(t.type===v.SWITCH||t.type===v.SWITCH_ON)){if(!this.placeFirst)return!1;const g=t.type===v.SWITCH?v.SWITCH_ON:v.SWITCH;return this.world.setBlock(t.x,t.y,t.z,g)&&(this.record(t.x,t.y,t.z,t.type,g),this.swing=1,$e(),this.unsaved=!0,this.onToast(g===v.SWITCH_ON?"Schalter an":"Schalter aus")),!0}if(t&&this.mode!=="creative"&&ne[t.type]&&ne[t.type].station)return this.onStation(ne[t.type].station),this.actCool=.5,!1;if(e&&nr(e))return this.equip(e);if(e&&_i(e)){const g=this.held(),_=$i(g);return _&&_.kind==="hacke"?this.hoe(g):Oo(e)?this.sow(e):Bh(e)?this.eat(e):!1}const o=sr[this.buildMode];if(o.key!=="einzeln")return this.buildClick(o,t,e);if(!t||!e)return!1;if(this.mode!=="creative"&&!(this.inv[e]>0))return qe(),this.onToast(`Kein ${yr[e]} im Vorrat`),this.actCool=.4,!1;const l=t.x+t.nx,c=t.y+t.ny,h=t.z+t.nz;if(c<0||c>=ae)return!1;const u=this.world.getBlock(l,c,h);if(u!==v.AIR&&u!==v.WATER)return!1;const f=this.player,d=.3;return f.x+d>l&&f.x-d<l+1&&f.z+d>h&&f.z-d<h+1&&f.y+1.8>c&&f.y<c+1||!this.world.setBlock(l,c,h,e)?!1:(this.record(l,c,h,u,e),this.mode!=="creative"&&this.inv[e]--,this.unsaved=!0,this.swing=1,$e(),this.onChange(),this.questEvent("place",e),!0)}selectSlot(t){this.sel=(t%9+9)%9,this.onChange()}cycleBuild(t=1){const e=sr.map((s,r)=>r).filter(s=>!sr[s].creative||this.mode==="creative"),n=Math.max(0,e.indexOf(this.buildMode));this.buildMode=e[(n+t+e.length)%e.length],this.anchor=null,this.onBuildMode(sr[this.buildMode])}buildClick(t,e,n){if(!this.placeFirst)return!1;if(t.creative&&this.mode!=="creative")return this.onToast(`${t.name} gibt es im Kreativmodus`),!0;if(t.key==="einfuegen")return this.clip?e?this.applyCells(Tx(this.clip,[e.x+e.nx,e.y+e.ny,e.z+e.nz]),"Eingefügt",!0):!1:(this.onToast("Erst mit „Kopieren“ zwei Ecken wählen"),!0);if(!e)return!1;const s=t.key==="kopieren"?[e.x,e.y,e.z]:[e.x+e.nx,e.y+e.ny,e.z+e.nz];if(!this.anchor)return this.anchor=s,this.onToast(`${t.name}: erste Ecke gesetzt, jetzt die zweite wählen`),$e(),!0;const r=this.anchor;if(this.anchor=null,t.key==="kopieren"){const l=bx(this.world,r,s);return l?(this.clip=l,$e(),this.onToast(`${l.n} Blöcke kopiert (${l.sx}×${l.sy}×${l.sz}), jetzt „Einfügen“ wählen`),!0):(qe(),this.onToast("Zu groß zum Kopieren (höchstens 32 768 Blöcke)"),!0)}if(!n||_i(n))return this.onToast("Wähle einen Block in der Hotbar"),!0;const a=this.mode==="creative"?Bl.creative:Bl.survival,o=Ex(t.key,r,s,a);return o?this.applyCells(o.map(l=>[l[0],l[1],l[2],n]),t.name,!1):(qe(),this.onToast(`Zu groß: höchstens ${a} Blöcke auf einmal`),!0)}applyCells(t,e,n){const s=this.mode==="creative",r=this.player,a=.3;let o=0,l=!1;this.beginBatch();for(const[c,h,u,f]of t){if(h<=0||h>=ae)continue;if(!s&&!(this.inv[f]>0)){l=!0;continue}const d=this.world.getBlock(c,h,u);d===f||!(n&&s)&&d!==v.AIR&&d!==v.WATER||ne[f].solid&&r.x+a>c&&r.x-a<c+1&&r.z+a>u&&r.z-a<u+1&&r.y+1.8>h&&r.y<h+1||this.world.setBlock(c,h,u,f)&&(this.record(c,h,u,d,f),s||this.inv[f]--,o++,this.questEvent("place",f))}return this.endBatch(),o&&(this.unsaved=!0,this.swing=1,$e(),this.onChange()),this.onToast(o?`${e}: ${o} Blöcke${l?" (Vorrat reichte nicht)":""}`:l?"Nicht genug im Vorrat":"Nichts zu setzen"),!0}updateGhost(){const t=this.ghost,e=this.target,n=sr[this.buildMode],s=this.hotbar[this.sel];let r=null;if(e&&!this.dead&&(this.preview||n.key!=="einzeln")){const a=[e.x+e.nx,e.y+e.ny,e.z+e.nz];if(n.key==="einfuegen")this.clip&&(r=[...a,a[0]+this.clip.sx-1,a[1]+this.clip.sy-1,a[2]+this.clip.sz-1]);else if(n.key==="kopieren"){const o=[e.x,e.y,e.z];r=this.anchor?Hl(this.anchor,o):[...o,...o]}else s&&!_i(s)&&!(this.mode!=="creative"&&ne[e.type]&&ne[e.type].station)&&(r=this.anchor?Hl(this.anchor,a):[...a,...a])}if(!r){t.visible=!1;return}t.position.set((r[0]+r[3]+1)/2,(r[1]+r[4]+1)/2,(r[2]+r[5]+1)/2),t.scale.set(r[3]-r[0]+1,r[4]-r[1]+1,r[5]-r[2]+1),t.visible=!0}vehHit(t){if(!this.vehicles||!this.vehicles.list.length)return null;const e=this.camera.position,n=this.vehicles.raycast(e.x,e.y,e.z,t.x,t.y,t.z,or);return n&&n.veh!==this.ride?n:null}placeVehicle(t){if(!this.placeFirst)return!1;const e=zh(t),n=Ga[e],s=this.target,r=this.lookDir,a=this.camera.position;if(this.mode!=="creative"&&!(this.inv[t]>0))return qe(),this.onToast(`Kein ${n.name} im Vorrat`),!1;let o=null;if(e==="boot"){for(let c=.5;c<=or&&!o;c+=.25){const h=Math.floor(a.x+r.x*c),u=Math.floor(a.y+r.y*c),f=Math.floor(a.z+r.z*c);if(s&&c>s.t)break;if(this.world.getBlock(h,u,f)===v.WATER){const d=this.vehicles.waterTop(h+.5,u,f+.5);d!==null&&(o=[h+.5,d-.3,f+.5])}}!o&&s&&s.ny===1&&(o=[s.x+.5,s.y+1.001,s.z+.5])}else s&&s.type===v.RAIL?o=[s.x+.5,s.y,s.z+.5]:s&&s.ny===1&&this.world.getBlock(s.x,s.y+1,s.z)===v.RAIL&&(o=[s.x+.5,s.y+1,s.z+.5]);return o?this.vehicles.boxHits({K:n},o[0],o[1]+.05,o[2])?(qe(),this.onToast("Kein Platz für das Fahrzeug"),!1):this.vehicles.add(e,o[0],o[1],o[2],this.yaw)?(this.mode!=="creative"&&this.inv[t]--,this.swing=1,$e(),this.unsaved=!0,this.onChange(),this.onToast(`${n.name} gesetzt · Setzen = einsteigen, Abbauen = einpacken`),!0):(qe(),this.onToast(e==="lore"?"Die Lore braucht eine Schiene":"Zu viele Fahrzeuge in dieser Welt"),!1):(qe(),this.onToast(e==="boot"?"Boot: aufs Wasser oder auf den Boden zielen":"Die Lore braucht eine Schiene"),this.actCool=.5,!1)}pickVehicle(t){this.vehicles.remove(t),this.spawnBreak(t.x-.5,t.y,t.z-.5,t.kind==="boot"?v.PLANKS:v.STONE),Vo(),this.mode!=="creative"&&(this.inv[t.K.item]=Math.min(Ge,(this.inv[t.K.item]||0)+1),this.onToast(`+1 ${t.K.name}`)),this.unsaved=!0,this.onChange()}mount(t){const e=this.player;this.ride=t,t.rider=!0,e.flying=!1,e.vx=e.vy=e.vz=0,e.eyeWater=!1,e.impact=0,this.hookT=0,this.rope.visible=!1,this.prevJump=!0,t.kind==="lore"&&(this.yaw=t.yaw),this.seatPlayer(),$e(),this.onToast(t.kind==="boot"?"Im Boot: vor/zurück = paddeln, links/rechts = lenken, Springen = aussteigen":"In der Lore: vor = anschieben (in Blickrichtung), zurück = bremsen, Springen = aussteigen"),this.onRide(!0)}dismount(){const t=this.ride,e=this.player;if(!t)return;this.ride=null,t.rider=!1;const[n,s,r]=this.vehicles.exitSpot(t,(a,o,l)=>e.collides(this.world,a,o,l));e.x=n,e.y=s,e.z=r,e.vx=e.vy=e.vz=0,e.onGround=!1,this.onRide(!1)}seatPlayer(){const t=this.ride,e=this.player;e.x=t.x,e.y=t.y+t.K.seat-.4,e.z=t.z}rideStep(){const t=this.input.jump;t&&!this.prevJump&&this.dismount(),this.prevJump=t}equip(t){const e=nr(t),n=this.mode==="creative";if(!n&&!(this.inv[t]>0))return qe(),this.onToast(`Kein ${ve(t)} im Vorrat`),this.actCool=.4,!1;const s=this.armor[e.slot];return s===t?(this.onToast(`${ve(t)} trägst du schon`),this.actCool=.6,!1):(n||(this.inv[t]--,s&&(this.inv[s]=Math.min(Ge,(this.inv[s]||0)+1))),this.armor[e.slot]=t,this.armWear[e.slot]=0,this.swing=1,$e(),this.unsaved=!0,this.onToast(`${ve(t)} angelegt · Schutz ${this.armorPoints()*5} %`),this.onChange(),this.onVitals(),!0)}armorPoints(){let t=0;for(const e of["kopf","brust"]){const n=nr(this.armor[e]);n&&(t+=n.pts)}return t}wearArmor(){if(this.mode!=="creative")for(const t of["kopf","brust"]){const e=this.armor[t],n=nr(e);n&&++this.armWear[t]>=n.dur&&(this.armor[t]=0,this.armWear[t]=0,this.onToast(`${ve(e)} ist zerbrochen`))}}stream(){const t=Math.floor(this.player.x/V),e=Math.floor(this.player.z/V);if(!this.lastPC||this.lastPC[0]!==t||this.lastPC[1]!==e){this.lastPC=[t,e],this.scanDirty=!0;const h=this.viewDist+3.5;for(const[u,f]of this.world.chunks)Math.hypot(f.cx-t,f.cz-e)>h&&(this.dropMesh(f),this.world.chunks.delete(u))}if(!this.scanDirty)return;const s=performance.now(),r=this.viewDist+.5,a=-Math.sin(this.yaw),o=-Math.cos(this.yaw);let l=!1,c=0;t:for(let h=0;h<2;h++)for(const[u,f,d]of this.offsets){const g=d<2.5||u*a+f*o>-.3*d;if(h===0!==g)continue;let _=this.world.getChunk(t+u,e+f);const m=d<=r&&(!_||!_.meshed);if(!(_&&!m)){if(c>0&&performance.now()-s>this.budget){l=!0;break t}if(_||(_=this.world.ensure(t+u,e+f),c++,l=!0),m){const p=this.requestMesh(_);p===!0?(c++,l=!0):p==="wait"&&(l=!0)}}}l||(this.scanDirty=!1)}flushDirty(){const t=this.world;if(t.dirty.size){for(const e of t.dirty)e.meshed&&t.chunks.get(e.key)===e&&this.applyMesh(e);t.dirty.clear()}}dropMesh(t){for(const e of["opaque","trans","logo"])t[e]&&(this.group.remove(t[e]),t[e].geometry.dispose(),t[e]=null)}requestMesh(t){if(!this.mw)return this.applyMesh(t);if(t.pending||this.mwJobs>=4)return"wait";const e=yf(this.world,t);if(!e)return!1;const n=e.nb.map(r=>r.slice()),s=e.hms.map(r=>r.slice());return t.pending=t.ver=++this.meshSeq,this.mwJobs++,this.mw.postMessage({key:t.key,ver:t.ver,nb:n,hms:s,maxY:e.maxY},n.map(r=>r.buffer)),!0}onMeshed({key:t,ver:e,r:n}){this.mwJobs=Math.max(0,this.mwJobs-1);const s=this.world&&this.world.chunks.get(t);!s||s.ver!==e||s.pending!==e||(s.pending=0,this.setPart(s,"opaque",n.opaque,this.matO),this.setPart(s,"trans",n.trans,this.matT),this.setPart(s,"logo",n.logo,this.matL),s.meshed=!0,this.scanDirty=!0,!this.running&&this.world&&this.render())}applyMesh(t){const e=ex(this.world,t);return e?(t.ver=++this.meshSeq,t.pending=0,this.setPart(t,"opaque",e.opaque,this.matO),this.setPart(t,"trans",e.trans,this.matT),this.setPart(t,"logo",e.logo,this.matL),t.meshed=!0,!0):!1}setPart(t,e,n,s){let r=t[e];if(!n){r&&(this.group.remove(r),r.geometry.dispose(),t[e]=null);return}const a=new De;if(a.setAttribute("position",new Pe(n.pos,3)),a.setAttribute("uv",new Pe(n.uv,2)),a.setAttribute("aCol",new Pe(n.col,4)),a.setIndex(new Pe(n.idx,1)),a.boundingSphere=new Hs(new I(V/2,ae/2,V/2),this.chunkSphereR),r){r.geometry.dispose(),r.geometry=a;return}r=new be(a,s),r.position.set(t.cx*V,0,t.cz*V),r.matrixAutoUpdate=!1,r.updateMatrix(),this.group.add(r),t[e]=r}updateSky(){const t=this.time*Math.PI*2,e=Math.sin(t),n=Math.cos(t),s=ya(-.12,.28,e),r=Math.max(0,1-Math.abs(e)/.3);let a=mi([.04,.06,.14],[.68,.84,.95],s);a=mi(a,[.97,.56,.36],r*.55);let o=mi([.012,.02,.07],[.24,.5,.88],s);o=mi(o,[.34,.3,.52],r*.4);const l=e>=0,c=l?ya(-.02,.3,e):ya(-.02,.3,-e)*.3,h=this.uni.uSunDir.value;l?h.set(n,e,.25):h.set(-n,-e,.25),h.normalize();const u=l?mi([1,.6,.36],[1,.96,.86],ya(0,.4,e)).map(x=>x*.62*c):[.42*c,.52*c,.85*c];this.uni.uSunCol.value.set(u[0],u[1],u[2]);const f=mi([.17,.21,.36],[.44,.5,.62],s);this.light=.38+.62*s,this.uni.uAmb.value.set(f[0]+r*.12,f[1]+r*.06,f[2]+r*.02);const d=this.camera.position,g=this.world.getBlock(Math.floor(d.x),Math.floor(d.y),Math.floor(d.z))===v.WATER;this.underwater=g;const _=this.viewDist*V-6;if(g){const x=mi([.04,.12,.26],[.12,.38,.66],s);this.uni.uFog.value.set(x[0],x[1],x[2]),this.uni.uFogRange.value.set(.5,24),this.domeU.uHor.value.set(x[0],x[1],x[2]),this.domeU.uZen.value.set(x[0],x[1],x[2]),this.domeU.uGlow.value.set(0,0,0)}else{this.uni.uFog.value.set(a[0],a[1],a[2]),this.uni.uFogRange.value.set(_*.4,_),this.domeU.uHor.value.set(a[0],a[1],a[2]),this.domeU.uZen.value.set(o[0],o[1],o[2]);const x=.9*r+.1*s;this.domeU.uGlow.value.set(.95*x,.62*x,.4*x)}this.domeU.uSunN.value.set(n,e,.25).normalize(),this.sky.position.copy(d);const m=this.domeU.uSunN.value;this.sun.position.copy(m).multiplyScalar(500),this.sun.lookAt(d),this.moon.position.copy(m).multiplyScalar(-500),this.moon.lookAt(d),this.sun.visible=e>-.25&&!g,this.moon.visible=e<.25&&!g,this.starMat.opacity=Math.max(0,Math.min(1,(.12-e)*3))*(g?0:1),this.stars.rotation.z=t,this.clouds.position.set(d.x,105,d.z),this.clouds.visible=!g&&this.cloudsOn;const p=mi([.2,.23,.36],[1,1,1],s);this.cloudU.uCol.value.set(p[0]+r*0,p[1]-r*.18,p[2]-r*.3)}render(){this.renderer.render(this.scene,this.camera)}biomeName(){const t=this.world?this.world.biomeAt(this.player.x,this.player.z):-1;return t>=0?mv[t]:""}clockText(){const t=Math.floor((this.time*24+6)%24*60);return String(Math.floor(t/60)).padStart(2,"0")+":"+String(t%60).padStart(2,"0")}}const wf={bauer:[{give:[tt.APPLE,4],need:[[tt.WHEAT,4]]},{give:[tt.SEEDS,6],need:[[tt.BREAD,1]]},{give:[tt.BREAD,2],need:[[v.WOOD,3]]},{give:[tt.COPPER_INGOT,1],need:[[tt.WHEAT,10]]}],schmied:[{give:[tt.IRON_INGOT,1],need:[[v.COAL,6]]},{give:[tt.STONE_PICK,1],need:[[tt.WHEAT,4]]},{give:[tt.COPPER_HELMET,1],need:[[tt.COPPER_INGOT,3],[tt.BREAD,2]]},{give:[tt.IRON_PICK,1],need:[[v.CRYSTAL,2],[tt.WHEAT,8]]}],funker:[{give:[v.RADIO,1],need:[[tt.COPPER_INGOT,2]]},{give:[v.LAMP,4],need:[[tt.WHEAT,6]]},{give:[v.SWITCH,2],need:[[tt.BREAD,1]]},{give:[v.CRYSTAL,1],need:[[tt.IRON_INGOT,3]]}],hirte:[{give:[v.WOOL,4],need:[[tt.WHEAT,4]]},{give:[tt.MEAT_COOKED,3],need:[[tt.WHEAT,5]]},{give:[tt.MEAT_RAW,4],need:[[tt.APPLE,3]]}]},nM={bauer:"Die Felder geben gut her. Weizen tausche ich gern!",schmied:"Kohle und Barren sind mir am liebsten. Ich mache dir gutes Werkzeug.",funker:"Seit dem großen Rauschen ist unser Mast stumm. Bring mir Kupfer, dann reden wir über Funk.",hirte:"Meine Schafe geben Wolle. Für Weizen bekommst du welche."},Rf=1,hu=4,iM=9,sM=16e3,rM=60,uu={survival:[64,32],creative:[8192,2e3]},aM=new Set([v.SWITCH_ON,v.WHEAT0,v.FARMLAND]),_r=i=>typeof i=="number"&&Number.isFinite(i),An=i=>Number.isInteger(i),Cf=i=>(typeof i=="string"?i.replace(/[^\p{L}\p{N} _.-]/gu,"").trim().slice(0,16):"")||"Gast";function Lf(i){if(typeof i!="string"||i.length>4e6)return null;try{const t=JSON.parse(i);return t&&typeof t=="object"&&typeof t.k=="string"?t:null}catch{return null}}function oM(i,t=sM){const e=[];for(let n=0;n<i.length;n+=t)e.push(i.slice(n,n+t));return e.length?e:[""]}const lM=i=>ne[i]&&ne[i].drop||i;class cM{constructor(t){this.env=t,this.peers=new Map,this.nextId=1,this.blocks=[],this.t=0,this.mobT=0}addPeer(t){return{id:0,name:"",send:t,token:null,pos:null,posT:0,bucket:0,bucketT:0,joined:!1}}get guests(){return[...this.peers.values()]}sendTo(t,e){try{t.send(JSON.stringify(e))}catch{}}broadcast(t,e){const n=JSON.stringify(t);for(const s of this.peers.values())if(s!==e)try{s.send(n)}catch{}}receive(t,e){const n=Lf(e);if(n){if(!t.joined){n.k==="hello"&&this.hello(t,n);return}if(n.tk===t.token){if(n.k==="pos")this.onPos(t,n);else if(n.k==="sets")this.onSets(t,n);else if(n.k==="hit"&&An(n.id)&&_r(n.dmg)){const s=this.env.onHit(t,n.id,Math.max(0,Math.min(10,n.dmg)));s&&s.length&&this.sendTo(t,{k:"drops",list:s})}}}}hello(t,e){if(e.v!==Rf){this.sendTo(t,{k:"bye",why:"Andere Spielversion – bitte beide die Seite neu laden."});return}if(this.peers.size>=hu){this.sendTo(t,{k:"bye",why:`Die Welt ist voll (höchstens ${hu} Gäste).`});return}t.id=this.nextId++,t.name=Cf(e.name),t.joined=!0,t.token=Math.random().toString(36).slice(2,12)+Date.now().toString(36);const n=this.env.info(),s=JSON.stringify(n.edits||{}),r=oM(s);t.pos={x:n.pos.x,y:n.pos.y,z:n.pos.z,yaw:0,pitch:0},t.posT=this.env.now(),t.bucket=uu[n.mode==="creative"?"creative":"survival"][0],t.bucketT=this.env.now(),this.sendTo(t,{k:"welcome",id:t.id,tk:t.token,seed:n.seed,gen:n.gen,mode:n.mode,time:n.time,pos:n.pos,host:n.name,parts:r.length}),r.forEach((a,o)=>this.sendTo(t,{k:"part",i:o,s:a})),this.sendTo(t,{k:"pp",id:0,name:n.name,...n.pos});for(const a of this.peers.values())this.sendTo(t,{k:"pp",id:a.id,name:a.name,...a.pos}),this.sendTo(a,{k:"pp",id:t.id,name:t.name,...t.pos});this.peers.set(t.id,t),this.env.onJoin(t)}close(t){this.peers.has(t.id)&&(this.peers.delete(t.id),this.broadcast({k:"left",id:t.id}),this.env.onLeave(t))}kick(t,e){this.sendTo(t,{k:"bye",why:e}),this.close(t)}onPos(t,e){if(![e.x,e.y,e.z,e.yaw,e.pitch].every(_r)||e.y<-10||e.y>ae+60)return;const n=this.env.now(),s=Math.max(.05,(n-t.posT)/1e3);Math.hypot(e.x-t.pos.x,e.y-t.pos.y,e.z-t.pos.z)>rM*s+4||(t.pos={x:e.x,y:e.y,z:e.z,yaw:e.yaw,pitch:e.pitch},t.posT=n,this.broadcast({k:"pp",id:t.id,x:e.x,y:e.y,z:e.z,yaw:e.yaw},t))}onSets(t,e){if(!Array.isArray(e.list)||!An(e.r))return;const n=this.env.world,s=this.env.info().mode,[r,a]=uu[s==="creative"?"creative":"survival"],o=this.env.now();t.bucket=Math.min(r,t.bucket+(o-t.bucketT)/1e3*a),t.bucketT=o;const l=[],c=t.pos;e.list.forEach((h,u)=>{if(!Array.isArray(h)||h.length!==5||!h.every(An)){l.push([u,-1]);return}const[f,d,g,_,m]=h;if(d<1||d>=ae||!ne[m]||!ne[_]){l.push([u,-1]);return}if(s!=="creative"&&m&&!ne[m].inv&&!aM.has(m)){l.push([u,-1]);return}n.ensure&&n.ensure(f>>4,g>>4);const p=n.getBlock(f,d,g);if(Math.hypot(f+.5-c.x,d+.5-(c.y+1.6),g+.5-c.z)>(s==="creative"?200:iM)||t.bucket<1||p!==_){l.push([u,p]);return}t.bucket--,n.setBlock(f,d,g,m),ne[m].shape==="cross"&&_===0&&this.env.onPlant(f,d,g)}),this.sendTo(t,{k:"ack",r:e.r,bad:l})}queueBlock(t,e,n,s){this.blocks.push([t,e,n,s])}hurt(t,e,n,s){const r=this.peers.get(t);r&&this.sendTo(r,{k:"hurt",dmg:e,cause:n,from:s})}tick(t,e,n,s){if(!this.peers.size){this.blocks.length=0;return}if(this.blocks.length&&(this.broadcast({k:"bs",list:this.blocks}),this.blocks=[]),this.t-=t,this.mobT-=t,this.t<=0&&(this.t=.1,this.broadcast({k:"pp",id:0,x:e.x,y:e.y,z:e.z,yaw:e.yaw}),(this.tt=(this.tt||0)+1)%10===0&&this.broadcast({k:"time",t:n})),this.mobT<=0&&s){this.mobT=.2;for(const r of this.peers.values()){const a=[];for(const o of s)Math.hypot(o.x-r.pos.x,o.z-r.pos.z)<64&&a.push(hM(o));this.sendTo(r,{k:"mobs",list:a})}}}}const hM=i=>[i.id,i.type,+i.x.toFixed(2),+i.y.toFixed(2),+i.z.toFixed(2),+i.yaw.toFixed(2),i.hurtT>0?1:0,i.moving?1:0,i.npc&&i.role||"",i.npc&&i.name||""];class uM{constructor(t,e,n){this.env=t,this.send=e,this.name=Cf(n),this.token=null,this.id=0,this.welcome=null,this.parts=null,this.r=0,this.pending=new Map,this.out=[]}hello(){this.send(JSON.stringify({k:"hello",v:Rf,name:this.name}))}post(t){this.token&&this.send(JSON.stringify({...t,tk:this.token}))}receive(t){const e=Lf(t);if(e)switch(e.k){case"welcome":if(this.token||!An(e.parts)||e.parts<1)return;this.welcome=e,this.parts=new Array(e.parts),this.got=0,this.token=e.tk,this.id=e.id;return;case"part":{if(!this.parts||!An(e.i)||e.i<0||e.i>=this.parts.length||this.parts[e.i]!==void 0||typeof e.s!="string"||(this.parts[e.i]=e.s,++this.got<this.parts.length))return;let n={};try{n=JSON.parse(this.parts.join(""))}catch{this.env.onBye("Weltdaten beschädigt");return}const s=this.welcome;this.parts=null,this.env.onWelcome({seed:s.seed,gen:s.gen,mode:s.mode,time:s.time,pos:s.pos,host:s.host,edits:n,id:s.id});return}case"bs":Array.isArray(e.list)&&this.env.onBlocks(e.list.filter(n=>Array.isArray(n)&&n.length===4&&n.every(An)));return;case"pp":An(e.id)&&e.id!==this.id&&[e.x,e.y,e.z].every(_r)&&this.env.onPlayer(e.id,e);return;case"left":An(e.id)&&this.env.onLeft(e.id);return;case"mobs":Array.isArray(e.list)&&this.env.onMobs(e.list);return;case"hurt":_r(e.dmg)&&this.env.onHurt(e);return;case"drops":Array.isArray(e.list)&&this.env.onDrops(e.list.filter(n=>Array.isArray(n)&&An(n[0])&&An(n[1])&&n[1]>0&&n[1]<100));return;case"time":_r(e.t)&&this.env.onTime(e.t);return;case"ack":{const n=this.pending.get(e.r);if(!n)return;this.pending.delete(e.r);const s=Array.isArray(e.bad)?e.bad.filter(r=>Array.isArray(r)&&An(r[0])&&n[r[0]]).map(r=>[...n[r[0]],r[1]]):[];s.length&&this.env.onReject(s);return}case"bye":this.env.onBye(typeof e.why=="string"?e.why.slice(0,120):"Verbindung beendet");return}}local(t,e,n,s,r){this.out.push([t,e,n,s,r])}flush(){if(!this.out.length||!this.token)return;const t=++this.r;for(let e=0;e<this.out.length;e+=4096){const n=this.out.slice(e,e+4096),s=e?++this.r:t;this.pending.set(s,n),this.post({k:"sets",r:s,list:n})}this.out=[]}pos(t){this.post({k:"pos",x:+t.x.toFixed(2),y:+t.y.toFixed(2),z:+t.z.toFixed(2),yaw:+t.yaw.toFixed(2),pitch:+t.pitch.toFixed(2)})}hit(t,e){this.post({k:"hit",id:t,dmg:e})}}const Pf=[{urls:"stun:stun.l.google.com:19302"}],vr="KF1.";function Df(i){return i.iceGatheringState==="complete"?Promise.resolve():new Promise(t=>{const e=setTimeout(t,5e3);i.addEventListener("icegatheringstatechange",()=>{i.iceGatheringState==="complete"&&(clearTimeout(e),t())})})}const fu=i=>{let t="";for(let e=0;e<i.length;e+=8192)t+=String.fromCharCode.apply(null,i.subarray(e,e+8192));return btoa(t).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")},fM=i=>{const t=atob(i.replace(/-/g,"+").replace(/_/g,"/")),e=new Uint8Array(t.length);for(let n=0;n<t.length;n++)e[n]=t.charCodeAt(n);return e};async function If(i,t){return new Uint8Array(await new Response(new Blob([i]).stream().pipeThrough(t)).arrayBuffer())}async function Nf(i){const t=new TextEncoder().encode(JSON.stringify(i));return typeof CompressionStream<"u"?vr+"z"+fu(await If(t,new CompressionStream("deflate-raw"))):vr+"j"+fu(t)}async function Uf(i){const t=String(i||"").replace(/\s+/g,"");if(!t.startsWith(vr))throw new Error("Das ist kein KlotzFunk-Code");let e=fM(t.slice(vr.length+1));if(t[vr.length]==="z"){if(typeof DecompressionStream>"u")throw new Error("Dieser Browser kann den Code nicht entpacken");e=await If(e,new DecompressionStream("deflate-raw"))}return JSON.parse(new TextDecoder().decode(e))}async function dM(i,t){const e=new RTCPeerConnection({iceServers:i?Pf:[]}),n=e.createDataChannel("klotzfunk",{ordered:!0});n.onopen=()=>t(n,e),await e.setLocalDescription(await e.createOffer()),await Df(e);const s=await Nf({t:"o",sdp:e.localDescription.sdp});return{pc:e,dc:n,code:s,async accept(r){const a=await Uf(r);if(a.t!=="a"||typeof a.sdp!="string")throw new Error("Das ist kein Antwort-Code");await e.setRemoteDescription({type:"answer",sdp:a.sdp})}}}async function pM(i,t,e){const n=await Uf(i);if(n.t!=="o"||typeof n.sdp!="string")throw new Error("Das ist kein Einladungs-Code");const s=new RTCPeerConnection({iceServers:t?Pf:[]});return s.ondatachannel=r=>{const a=r.channel;a.readyState==="open"?e(a,s):a.onopen=()=>e(a,s)},await s.setRemoteDescription({type:"offer",sdp:n.sdp}),await s.setLocalDescription(await s.createAnswer()),await Df(s),{pc:s,code:await Nf({t:"a",sdp:s.localDescription.sdp})}}const du=[3836632,14178874,3848298,13150266,10115800],mM=i=>[[-.22,0,-.12,-.02,.75,.12,2767450],[.02,0,-.12,.22,.75,.12,2767450],[-.28,.75,-.16,.28,1.4,.16,i],[-.4,.8,-.1,-.28,1.38,.1,i],[.28,.8,-.1,.4,1.38,.1,i],[-.22,1.4,-.22,.22,1.84,.22,15253658],[-.24,1.76,-.24,.24,1.9,.24,4863008],[-.13,1.6,-.24,-.05,1.66,-.22,2105376],[.05,1.6,-.24,.13,1.66,-.22,2105376]];function gM(i){const t=document.createElement("canvas");t.width=256,t.height=64;const e=t.getContext("2d");e.font="bold 34px system-ui, sans-serif",e.textAlign="center",e.textBaseline="middle";const n=Math.min(250,e.measureText(i).width+28);e.fillStyle="rgba(10,14,30,.62)",e.fillRect(128-n/2,6,n,52),e.fillStyle="#fff",e.fillText(i,128,33);const s=new La(t),r=new av(new Ju({map:s,depthTest:!1,transparent:!0}));return r.scale.set(1.6,.4,1),r.position.y=2.25,r.renderOrder=30,r}class _M{constructor(t){this.group=new Cn,t.add(this.group),this.list=new Map,this.geos=du.map(e=>Ts(mM(e)))}set(t,e){let n=this.list.get(t);if(!n){const s=new bi({vertexColors:!0}),r=new Cn;r.add(new be(this.geos[t%du.length],s)),n={root:r,mat:s,name:"",tag:null,x:e.x,y:e.y,z:e.z,yaw:e.yaw||0,tx:e.x,ty:e.y,tz:e.z,tyaw:e.yaw||0},this.group.add(r),this.list.set(t,n)}e.name&&e.name!==n.name&&(n.name=e.name,n.tag&&(n.root.remove(n.tag),n.tag.material.map.dispose(),n.tag.material.dispose()),n.tag=gM(e.name),n.root.add(n.tag)),n.tx=e.x,n.ty=e.y,n.tz=e.z,Number.isFinite(e.yaw)&&(n.tyaw=e.yaw)}remove(t){const e=this.list.get(t);e&&(this.group.remove(e.root),e.mat.dispose(),e.tag&&(e.tag.material.map.dispose(),e.tag.material.dispose()),this.list.delete(t))}clear(){for(const t of[...this.list.keys()])this.remove(t)}update(t,e){const n=Math.min(1,t*12);for(const s of this.list.values()){Math.hypot(s.tx-s.x,s.tz-s.z)>20&&(s.x=s.tx,s.y=s.ty,s.z=s.tz),s.x+=(s.tx-s.x)*n,s.y+=(s.ty-s.y)*n,s.z+=(s.tz-s.z)*n;let r=s.tyaw-s.yaw;r=Math.atan2(Math.sin(r),Math.cos(r)),s.yaw+=r*n,s.root.position.set(s.x,s.y,s.z),s.root.rotation.y=s.yaw,s.mat.color.setRGB(e,e,e)}}}class Xo{constructor(t){this.view=t,this.list=[],this.byId=new Map,this.enabled=!1}set(t){const e=new Set;for(const n of t){const[s,r,a,o,l,c,h,u,f,d]=n;if(!Number.isInteger(s)||!Tr[r]||![a,o,l,c].every(Number.isFinite))continue;e.add(s);let g=this.byId.get(s);if(!g){const _=Tr[r];g={id:s,type:r,T:_,x:a,y:o,z:l,yaw:c,hurtT:0,moving:!1,hostile:!!_.hostile,npc:!!_.npc,role:f||"",name:d||_.name},this.byId.set(s,g),this.list.push(g),this.view.add(g)}Object.assign(g,{x:a,y:o,z:l,yaw:c,moving:!!u}),h&&(g.hurtT=.2)}for(const n of this.list.slice())e.has(n.id)||this.removeMob(n)}removeMob(t){this.byId.delete(t.id),this.list.splice(this.list.indexOf(t),1),this.view.remove(t)}update(t){for(const e of this.list)e.hurtT=Math.max(0,e.hurtT-t)}raycast(t,e,n,s,r,a,o){let l=null,c=o;for(const h of this.list){const u=h.T.half,f=[h.x-u,h.y,h.z-u],d=[h.x+u,h.y+h.T.h,h.z+u],g=[t,e,n],_=[s,r,a];let m=0,p=c;for(let x=0;x<3&&m<=p;x++){if(Math.abs(_[x])<1e-9){(g[x]<f[x]||g[x]>d[x])&&(m=1/0);continue}let S=(f[x]-g[x])/_[x],y=(d[x]-g[x])/_[x];S>y&&([S,y]=[y,S]),m=Math.max(m,S),p=Math.min(p,y)}m<=p&&m<c&&(c=m,l=h)}return l?{mob:l,t:c}:null}remove(t){this.byId.has(t.id)&&this.removeMob(t)}clear(){for(const t of this.list.slice())this.removeMob(t)}serialize(){}hostileCount(){return 0}}class vM{constructor(t,e){this.game=t,this.ui=e,this.avatars=new _M(t.scene),this.host=null,this.guest=null,this.conns=new Set,this.posT=0,this.useStun=!0}get active(){return!!(this.host||this.guest)}open(){const t=this.game;this.host||(this.host=new cM({world:t.world,now:()=>performance.now(),info:()=>({seed:t.seed,gen:t.gen,mode:t.mode,time:t.time,edits:df(t.world.edits),pos:{x:t.player.x,y:t.player.y,z:t.player.z},name:this.myName||"Gastgeber"}),onPlant:(e,n,s)=>t.farm.plant(e,n,s,t.age),onHit:(e,n,s)=>this.hostHit(e,n,s),onJoin:e=>{this.ui.toast(`${e.name} ist in deiner Welt`),this.avatars.set(e.id,{...e.pos,name:e.name}),this.listPlayers()},onLeave:e=>{this.ui.toast(`${e.name} hat die Welt verlassen`),this.avatars.remove(e.id),this.listPlayers()}}),t.world.onSet=(e,n,s,r)=>this.host&&this.host.queueBlock(e,n,s,r),t.mp=this,t.running||t.resume())}async invite(){this.open();let t=null;const e=await dM(this.useStun,n=>{t=this.host.addPeer(s=>n.send(s)),t.dc=n,t.pc=e.pc,this.conns.add(e.pc),n.onmessage=s=>this.host.receive(t,s.data),n.onclose=()=>{this.host&&this.host.close(t),this.conns.delete(e.pc)}});return e.pc.onconnectionstatechange=()=>{["failed","closed"].includes(e.pc.connectionState)&&t&&this.host&&this.host.close(t)},e}hostHit(t,e,n){const s=this.game,r=s.mobs&&s.mobs.list.find(a=>a.id===e);return!r||r.npc||Math.hypot(r.x-t.pos.x,r.z-t.pos.z)>8||!r.hit(n,t.pos.x,t.pos.z)?null:(s.spawnBreak(r.x-.5,r.y,r.z-.5,60),s.mobs.remove(r,!1),s.unsaved=!0,s.mode==="creative"?null:Ef(r.type))}others(){return this.host?this.host.guests.map(t=>({id:t.id,x:t.pos.x,y:t.pos.y,z:t.pos.z})):null}hurtGuest(t){const e=this.host&&this.host.peers.get(t.target);e&&this.host.hurt(e.id,t.T.dmg,t.T.name,[t.x,t.y+.3,t.z,t.T.range?1:0])}kick(t){const e=this.host&&this.host.peers.get(t);if(e){this.host.kick(e,"Der Gastgeber hat dich aus der Welt genommen.");try{e.pc.close()}catch{}}}listPlayers(){const t=this.host?this.host.guests.map(e=>({id:e.id,name:e.name})):[...this.avatars.list.entries()].map(([e,n])=>({id:e,name:n.name}));this.ui.players(t)}async join(t,e){const n=this.game;this.myName=e,this.guest=new uM({onWelcome:r=>this.welcome(r),onBlocks:r=>{const a=n.world;if(a)for(const[o,l,c,h]of r)a.ensure&&a.ensure(o>>4,c>>4),a.setBlock(o,l,c,h)},onPlayer:(r,a)=>{this.avatars.set(r,a),a.name&&this.listPlayers()},onLeft:r=>{const a=this.avatars.list.get(r);a&&this.ui.toast(`${a.name||"Ein Spieler"} ist gegangen`),this.avatars.remove(r),this.listPlayers()},onMobs:r=>{n.mobs instanceof Xo&&n.mobs.set(r)},onHurt:r=>n.remoteHurt(r),onDrops:r=>{for(const[a,o]of r)n.inv[a]=Math.min(Ge,(n.inv[a]||0)+o);this.ui.toast(r.map(([a,o])=>`+${o} ${ve(a)}`).join(" · ")),n.onChange()},onTime:r=>{n.time=r},onReject:r=>this.reject(r),onBye:r=>this.end(r)},r=>this.dc&&this.dc.readyState==="open"&&this.dc.send(r),e);const s=await pM(t,this.useStun,(r,a)=>{this.dc=r,this.conns.add(a),r.onmessage=o=>this.guest&&this.guest.receive(o.data),r.onclose=()=>this.end("Die Verbindung zum Gastgeber ist getrennt."),this.guest.hello(),this.ui.status("Verbunden, Welt wird geladen …")});return s.pc.onconnectionstatechange=()=>{["failed","closed"].includes(s.pc.connectionState)&&this.end("Die Verbindung zum Gastgeber ist getrennt.")},s.code}welcome(t){const e=this.game;e.start({name:`Bei ${t.host}`,seed:t.seed,gen:t.gen,mode:t.mode,time:t.time,edits:t.edits,px:t.pos.x+1.5,py:t.pos.y,pz:t.pos.z,yaw:0,pitch:0}),e.mp=this,e.net=this.guest,e.mobs.clear(),e.mobs=new Xo(e.mobView),this.ui.joined(t)}reject(t){const e=this.game;for(const[n,s,r,a,o,l]of t)if(e.world.setBlock(n,s,r,l>=0?l:a),e.mode!=="creative")if(o)e.inv[o]=Math.min(Ge,(e.inv[o]||0)+1);else{const c=lM(a);e.inv[c]=Math.max(0,(e.inv[c]||0)-1)}e.onChange(),this.ui.toast("Der Gastgeber hat eine Änderung nicht übernommen")}tick(t){const e=this.game,n=e.player;if(this.avatars.update(t,e.light),this.host){this.host.tick(t,{x:n.x,y:n.y,z:n.z,yaw:e.yaw},e.time,e.mobs?e.mobs.list:null);for(const s of this.host.guests)this.avatars.set(s.id,s.pos)}this.guest&&this.guest.token&&(this.guest.flush(),(this.posT-=t)<=0&&(this.posT=.1,this.guest.pos({x:n.x,y:n.y,z:n.z,yaw:e.yaw,pitch:e.pitch})),e.mobs instanceof Xo&&e.mobs.update(t))}end(t){if(!this.active&&!this.conns.size)return;const e=!!this.guest;if(this.host)for(const s of this.host.guests)this.host.kick(s,"Der Gastgeber hat die Welt geschlossen.");for(const s of this.conns)try{s.close()}catch{}this.conns.clear(),this.host=null,this.guest=null,this.dc=null,this.avatars.clear();const n=this.game;n.world&&(n.world.onSet=null),n.mp=null,n.net=null,t&&this.ui.ended(t,e)}}const F=i=>document.getElementById(i),Nr=F("c"),uc=window.matchMedia("(pointer: coarse)").matches;let Nt=Hv();const O=new eM(Nr,uc,Nt.quality);window.__bv=O;let oe="menu",wr="menu",ks=-1,on=uc;const Fe=new Set;document.documentElement.style.setProperty("--atlas",`url(${O.atlasCanvas.toDataURL()})`);const Gl=O.itemCanvas.height/32;document.documentElement.style.setProperty("--items",`url(${O.itemCanvas.toDataURL()})`);document.documentElement.style.setProperty("--itemRows",Gl*100+"%");const Va=i=>{if(_i(i)){const e=Te[i]?Te[i].icon:0;return`<i class="ic it" style="background-position:${e%8*100/7}% ${Gl>1?Math.floor(e/8)*100/(Gl-1):0}%"></i>`}if(qa(i)){const e=i-ii;return`<i class="ic lg" style="background-position:${e%4*100/3}% ${Math.floor(e/4)*100/3}%"></i>`}if(i===v.RAINBOW)return'<i class="ic rb"></i>';const t=ne[i]?ne[i].icon:0;return`<i class="ic" style="background-position:${t%8*100/7}% ${Math.floor(t/8)*100/15}%"></i>`};O.onLogos=()=>{document.documentElement.style.setProperty("--logos",`url(${O.logoCanvas.toDataURL("image/png")})`)};let pu=0;function xe(i){const t=F("toast");t.textContent=i,t.classList.add("on"),clearTimeout(pu),pu=setTimeout(()=>t.classList.remove("on"),1800)}O.onToast=xe;function Ur(){const i=F("hotbar");if(!i.children.length)for(let t=0;t<9;t++){const e=document.createElement("div");e.className="slot",e.addEventListener("pointerdown",n=>{n.stopPropagation(),O.selectSlot(t)}),i.appendChild(e)}for(let t=0;t<9;t++){const e=i.children[t],n=O.hotbar[t],s=O.mode==="creative"?"∞":O.inv[n]||0;e.className="slot"+(t===O.sel?" sel":"")+(n&&s===0?" empty":""),e.title=n?ve(n):"",e.innerHTML=`<span class="k">${t+1}</span>${n?Va(n):""}<span class="n">${n?s:""}</span>`}}let Mi="all",Of="",kf=!1,Rr=new Set,Ai=null;const xM=[{id:"all",name:"Alle"},...uv,{id:"items",name:"Werkzeuge & Essen"}],MM=i=>i.tool?` · ${i.tool.speed}× schneller · hält ${i.tool.dur} Blöcke`:i.food?` · +${i.food} Hunger`:"";function Ff(){F("invTabs").innerHTML=xM.map(i=>`<button role="tab" data-cat="${i.id}" class="${i.id===Mi?"on":""}" aria-selected="${i.id===Mi}">${i.name}</button>`).join("")}function Or(){const i=O.mode==="creative",t=Of.trim().toLowerCase();F("invHint").textContent=i?"Kreativmodus: alle Blöcke sind unbegrenzt. Tippe einen Block, um ihn in den gewählten Hotbar-Platz zu legen.":"Tippe einen Block, um ihn in den gewählten Hotbar-Platz zu legen. Zahl = Vorrat.",F("invOwnedL").hidden=i,F("invSt").hidden=i||!Ai,Ai&&(F("invSt").textContent=Ai==="ofen"?"🔥 Am Schmelzofen: Barren schmelzen und Essen braten":"🪚 An der Werkbank: Werkzeuge und Schmelzofen bauen");let e="";for(const s of[...fv,...Ha]){const r=ne[s]&&!_i(s)?ne[s]:Te[s],a=i?"∞":O.inv[s]||0;if(Mi!=="all"&&r.cat!==Mi||t&&!r.name.toLowerCase().includes(t)||kf&&!i&&!a)continue;const o=_i(s)?MM(r):r.tool?" · am besten mit "+r.tool[0].toUpperCase()+r.tool.slice(1):"";e+=`<button class="cell ${a?"has":"dim"}" data-t="${s}" title="${r.name}${o}">${Va(s)}<span>${r.name}</span><b>${a}</b></button>`}if(F("invGrid").innerHTML=e||'<div class="empty-note">Nichts gefunden.</div>',F("recH").hidden=i,i){F("recipes").innerHTML="";return}const n=ln.map((s,r)=>[s,r]).filter(([s])=>(Mi==="all"||s.cat===Mi)&&Zv(s,t));F("recipes").innerHTML=n.length?n.map(([s,r])=>{const a=lc(O.inv,s,Ge,Rr),o=jv(O.inv,s,Ge,Rr),l=s.need.map(([u,f])=>{const d=O.inv[u]||0;return d>=f?`${f}× ${ve(u)}`:`<i>${f}× ${ve(u)} (${d})</i>`}).join(" + "),c=a.full?" · Vorrat voll":a.noStation?` · <i>${Gh[s.st]} nicht in der Nähe</i>`:"",h=s.st?`<span class="badge">${s.st==="ofen"?"🔥":"🪚"} ${Gh[s.st]}</span>`:"";return`<button data-r="${r}" ${a.ok?"":"disabled"}>${Va(s.give[0])}<span><b>${s.give[1]}× ${ve(s.give[0])}</b>${h}<small>aus ${l}${c}</small></span><span class="cnt">${o?o+"×":""}</span></button>`}).join(""):'<div class="empty-note">Kein passendes Rezept.</div>'}F("invTabs").addEventListener("click",i=>{const t=i.target.closest("[data-cat]");t&&(Mi=t.dataset.cat,Ff(),Or())});F("invSearch").addEventListener("input",i=>{Of=i.target.value,Or()});F("invOwned").addEventListener("change",i=>{kf=i.target.checked,Or()});F("invGrid").addEventListener("click",i=>{const t=i.target.closest("[data-t]");if(!t)return;const e=Number(t.dataset.t),n=O.hotbar.indexOf(e);n>=0&&(O.hotbar[n]=O.hotbar[O.sel]),O.hotbar[O.sel]=e,O.unsaved=!0,O.onChange()});F("recipes").addEventListener("click",i=>{const t=i.target.closest("[data-r]");if(!t)return;const e=ln[Number(t.dataset.r)];let n=0,s=null;for(let r=i.shiftKey?5:1;r>0&&(s=Mf(O.inv,e,Ge,Rr),!!s.ok);r--)n++;if(!n){xe(s.msg);return}O.unsaved=!0,O.onChange(),O.questEvent("craft",e.give[0],e.give[1]*n),xe(`+${e.give[1]*n} ${ve(e.give[0])}`)});O.onChange=()=>{Ur(),oe==="inventory"&&Or()};const Vl=F("vit").getContext("2d"),yM=[".##.##.","#######","#######",".#####.","..###..","...#..."],SM=["....##.","...####","..#####",".####..","##.....","#......"],EM=["..###..",".#...#.","#.....#","#.....#",".#...#.","..###.."],bM=["#######","#######","#######",".#####.","..###..","...#..."];function Sa(i,t,e,n,s,r){for(let a=0;a<6;a++)for(let o=0;o<7;o++)i[a][o]==="#"&&(Vl.fillStyle=o<3.5?n||s?n||s:r:n||r,Vl.fillRect(t+o*2,e+a*2,2,2))}function Fs(){const i=O.vitals,t=F("vit");if(t.hidden=!i||oe==="menu",!i)return;Vl.clearRect(0,0,200,34);const e=Math.ceil(i.hp),n=Math.ceil(i.food);for(let r=0;r<Ss/2;r++){const a=e-r*2;Sa(yM,r*10,18,a>=2?"#ff3b4a":null,a===1?"#ff3b4a":null,"#3a1a20")}for(let r=0;r<dr/2;r++){const a=n-r*2;Sa(SM,186-r*10,18,a>=2?"#d89048":null,a===1?"#d89048":null,"#3a2a1a")}if(i.air<Ia)for(let r=0;r<Math.ceil(i.air);r++)Sa(EM,186-r*10,2,"#9ad8ff",null,"#9ad8ff");const s=O.armorPoints();for(let r=0;r<s;r++)Sa(bM,r*10,2,"#cfd6e2",null,"#cfd6e2")}O.onVitals=Fs;let mu=0;O.onHurt=()=>{const i=F("hurt");if(i.classList.add("on"),Fs(),clearTimeout(mu),mu=setTimeout(()=>i.classList.remove("on"),120),navigator.vibrate&&on)try{navigator.vibrate(60)}catch{}};O.onMine=i=>{F("mine").classList.toggle("on",i>0),F("mine").firstChild.style.width=Math.round(i*100)+"%"};const TM={Sturz:"Zu tief gefallen.",Ertrunken:"Unter Wasser ging die Luft aus.",Magma:"Magma ist heiß.",Hunger:"Vor Hunger.",Rauschling:"Ein Rauschling hat dich erwischt.",Höhlenwesen:"Ein Höhlenwesen hat dich erwischt.","Störsender-Drohne":"Die Störimpulse einer Drohne waren zu viel."};O.onDeath=(i,t)=>{Ja(),Ie("dead"),F("deadWhy").textContent=(TM[i]||"")+(t?" Dein Vorrat liegt am Unglücksort, der Wegpunkt 📍 zeigt den Weg.":" Dein Vorrat bleibt erhalten. Der Wegpunkt 📍 markiert den Unglücksort."),kn()&&document.exitPointerLock(),es(!1)};F("dRevive").onclick=()=>{O.revive(),Ur(),Ie("playing"),ts()};F("dMenu").onclick=()=>{O.revive(),F("pMenu").onclick()};O.onStation=i=>{Ai=i,Mi="all",dc()};let ji=null;function zf(){const i=wf[ji.role]||[];F("trName").firstChild.textContent=ji.name+" ",F("trSay").textContent="„"+(nM[ji.role]||"Hallo!")+"“",F("trList").innerHTML=i.map((t,e)=>{const n=lc(O.inv,t),s=t.need.map(([r,a])=>{const o=O.inv[r]||0;return o>=a?`${a}× ${ve(r)}`:`<i>${a}× ${ve(r)} (${o})</i>`}).join(" + ");return`<button data-tr="${e}" ${n.ok?"":"disabled"}>${Va(t.give[0])}<span><b>${t.give[1]}× ${ve(t.give[0])}</b><small>für ${s}</small></span></button>`}).join("")}O.onTrade=i=>{if(oe==="playing"){if(O.mode==="creative"){xe(`${i.name}: „Im Kreativmodus hast du doch schon alles!“`);return}ji=i,Ja(),Ie("trade"),zf(),kn()&&document.exitPointerLock(),fc()}};F("trList").addEventListener("click",i=>{const t=i.target.closest("[data-tr]");if(!t||!ji)return;const e=wf[ji.role][Number(t.dataset.tr)],n=Mf(O.inv,e);xe(n.ok?`Getauscht: ${n.msg}`:n.msg),n.ok&&(O.unsaved=!0,zf(),Ur(),O.questEvent("trade",e.give[0]))});function Bf(){oe==="trade"&&(ji=null,Ie("playing"),O.resume(),ts(),on||setTimeout(()=>{oe==="playing"&&!kn()&&Ws()},250))}F("trClose").onclick=Bf;O.onBuildMode=i=>{const t=F("bmode");t.hidden=i.key==="einzeln",t.textContent=`▦ ${i.name}`+(i.clicks===2?" · zwei Ecken setzen":i.key==="einfuegen"?" · Setzen fügt ein":"")+" (G wechselt)",xe("Bauform: "+i.name)};F("bBuild").onclick=()=>O.cycleBuild(1);let Cr=!1,gu=0;function Li(){const i=F("quest"),t=O.story;if(!t||O.menuMode){i.hidden=!0;return}if(i.hidden=!1,i.classList.toggle("min",Cr),t.done){i.innerHTML='<b>🎉 Story abgeschlossen</b><small class="txt">Alle Aufträge erledigt. Baue frei weiter!</small>';return}const e=Ls(t),n=e[t.i],[s,r]=Af(O,n),a=Math.min(100,Math.round(s/r*100)),o=n.c?`Kapitel ${n.c} · ${n.t}`:`Auftrag ${t.i+1}/${e.length} · ${n.t}`;i.innerHTML=`<b>${o}</b><div class="bar"><i style="width:${a}%"></i></div><small>${Math.min(s,r)} / ${r}${n.c?` · Auftrag ${t.i+1}/${e.length}`:""}</small><small class="txt">${n.d}</small>`}function xr(i){const t=F("banner");t.innerHTML=i,t.classList.add("on"),clearTimeout(gu),gu=setTimeout(()=>t.classList.remove("on"),4200)}O.onQuest=Li;O.onQuestDone=(i,t)=>{const e=Object.entries(i.r||{}).map(([s,r])=>`+${r} ${ve(Number(s))}`).join(" · "),n=!t&&Ls(O.story)[O.story.i];t?xr(i.c?"🎉 Das Rauschen ist verstummt!<small>Das Funknetz steht wieder. Die Welt gehört dir, baue frei weiter.</small>":`🎉 Story abgeschlossen!<small>${i.t} geschafft. Die Funkzentrale sendet wieder. Baue frei weiter.</small>`):n&&n.c&&n.c!==i.c?xr(`📻 Kapitel ${n.c}: ${Ar[n.c].t}<small>${Ar[n.c].d}</small>`):xr(`✔ Auftrag erledigt: ${i.t}<small>${e}</small>`)};function AM(){const i=O.story;i&&(F("qlist").innerHTML=Ls(i).map((t,e,n)=>{const s=i.done||e<i.i,r=!i.done&&e===i.i;return`${t.c&&(e===0||n[e-1].c!==t.c)?`<h3 class="qch">Kapitel ${t.c} · ${Ar[t.c].t}</h3>`:""}<div class="qi ${s?"done":r?"cur":""}"><span class="st">${s?"✔":r?"➜":e+1}</span><div><b>${t.t}</b>${s||r?`<small>${t.d}</small>`:""}</div></div>`}).join(""),F("qlogT").textContent=i.c==="rauschen"?"Das große Rauschen":"Aufträge der Funkzentrale")}F("quest").addEventListener("click",()=>{Cr=!Cr,Li()});F("pQuests").onclick=()=>{AM(),fn("qlog",!0)};F("qlogClose").onclick=()=>fn("qlog",!1);const fn=(i,t)=>{F(i).hidden=!t};function Ie(i){oe=i,document.body.classList.toggle("playing",i==="playing"),fn("menu",i==="menu"),fn("pause",i==="paused"),fn("inv",i==="inventory"),fn("loading",i==="loading"),fn("set",i==="settings"),fn("dead",i==="dead"),fn("trade",i==="trade"),fn("mp",i==="mp"),fn("hud",i==="playing"||i==="paused"||i==="inventory"||i==="dead"||i==="trade"||(i==="settings"||i==="mp")&&wr==="paused"),i!=="playing"&&O.onMine(0),i!=="paused"&&fn("qlog",!1)}const kn=()=>document.pointerLockElement===Nr;function ts(){if(!(on||kn()))try{const i=Nr.requestPointerLock();i&&i.catch&&i.catch(()=>{})}catch{}}function Ja(){O.breakHeld=O.placeHeld=!1,Fe.clear(),kr(),Object.assign(O.input,{f:0,r:0,jump:!1,down:!1,sprint:!1})}function fc(){O.mp||O.stop()}function Ws(){oe==="playing"&&(fc(),Ja(),es(),F("pMp").hidden=!!O.story||!!(O.mp&&O.mp.guest),Ie("paused"),F("vd").value=O.viewDist,F("vdVal").textContent=O.viewDist,F("pQuests").hidden=!O.story,F("td").value=Math.round(O.time*100),F("tdVal").textContent=O.clockText(),kn()&&document.exitPointerLock())}function Hf(){Ie("playing"),O.resume(),ts()}function dc(){oe==="playing"&&(Rr=O.stationsNear(),Ai&&!Rr.has(Ai)&&(Ai=null),Ja(),Ie("inventory"),Ff(),Or(),kn()&&document.exitPointerLock(),fc())}function Wl(){oe==="inventory"&&(Ai=null,Ie("playing"),O.resume(),ts(),on||setTimeout(()=>{oe==="playing"&&!kn()&&Ws()},250))}document.addEventListener("pointerlockchange",()=>{!kn()&&oe==="playing"&&!on&&Ws()});document.addEventListener("pointerlockerror",()=>{oe==="playing"&&!on&&Ws()});function es(i){if(!O.world||ks<0||O.menuMode)return;const t=mf(ks,O.serialize());return t&&(O.unsaved=!1),(i||!t)&&xe(t?"Gespeichert ✔":"Speichern fehlgeschlagen (Speicher voll?)"),t}setInterval(()=>{oe==="playing"&&es(!1)},3e4);window.addEventListener("pagehide",()=>es(!1));document.addEventListener("visibilitychange",()=>{document.hidden&&oe==="playing"&&Ws()});function wM(i){if(i=(i||"").trim(),!i)return Math.floor(Math.random()*2147483647);if(/^-?\d{1,9}$/.test(i))return Number(i);let t=2166136261;for(let e=0;e<i.length;e++)t=Math.imul(t^i.charCodeAt(e),16777619);return t|0}const _u=i=>String(i).replace(/[&<>"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[t]);function Zn(){let i="";for(let t=0;t<ac;t++){const e=Ov(t);if(e){const n=new Date(e.savedAt).toLocaleString("de-DE",{dateStyle:"short",timeStyle:"short"}),s=e.mode==="creative",r=e.mode==="story",a=e.qc==="rauschen"?Tf:bf,o=e.q??0,l=r?`<span class="pill st">📜 Story · ${e.q===-1?"abgeschlossen":(a[o]&&a[o].c?"Kapitel "+a[o].c+" · ":"")+"Auftrag "+(o+1)+"/"+a.length}</span>`:`<span class="pill ${s?"cr":""}">${s?"Kreativ":"Überleben"}</span>`;i+=`<div class="card"><div class="top"><div class="ico">${r?"📜":s?"🕊":"⛏"}</div><div class="ttl"><b>${_u(e.name)}</b>${l}</div></div>
        <small>${r?"Feste Story-Welt":"Startwert "+_u(e.seed)}${(e.gen||1)<cf?" · klassische Welt":""} · zuletzt ${n}</small>
        <div class="row"><button class="go" data-act="load" data-i="${t}">▶ Weiterspielen</button><button data-act="exp" data-i="${t}" aria-label="Welt exportieren" title="Welt als Datei sichern">⤓</button>${kv(t)?`<button data-act="bak" data-i="${t}" aria-label="Sicherung laden" title="Ältere Sicherung wiederherstellen">↺</button>`:""}<button data-act="del" data-i="${t}" aria-label="Welt löschen" title="Welt löschen">🗑</button></div></div>`}else i+=`<div class="card new"><div class="top"><div class="ico">✨</div><div class="ttl"><b>Neue Welt ${t+1}</b><span class="pill">frei</span></div></div>
        <div class="seed"><input id="seed${t}" placeholder="Startwert (leer = Zufall)" maxlength="24" autocomplete="off"><button data-act="dice" data-i="${t}" aria-label="Zufälliger Startwert" title="Zufälliger Startwert">🎲</button></div>
        <div class="seg three" id="mode${t}"><button class="on" data-mode="survival">⛏ Überleben</button><button data-mode="creative">🕊 Kreativ</button><button data-mode="story">📜 Story</button></div>
        <button class="go" data-act="new" data-i="${t}">Welt erzeugen</button></div>`}F("slots").innerHTML=i}F("slots").addEventListener("click",i=>{const t=i.target.closest(".seg [data-mode]");if(t){for(const o of t.parentNode.children)o.classList.toggle("on",o===t);const s=t.closest(".card"),r=t.dataset.mode==="story",a=s.querySelector("input");a.disabled=r,a.placeholder=r?"feste Story-Welt":"Startwert (leer = Zufall)",s.querySelector("[data-act=dice]").disabled=r;return}const e=i.target.closest("[data-act]");if(!e)return;const n=Number(e.dataset.i);if(e.dataset.act==="dice")F("seed"+n).value=String(Math.floor(Math.random()*9e5)+1e5);else if(e.dataset.act==="del")confirm("Diese Welt wirklich löschen?")&&(Fv(n),Zn());else if(e.dataset.act==="load"){let s=Uh(n);if(!s){const r=Oh(n);if(r&&confirm("Dieser Speicherstand ist beschädigt. Die letzte Sicherung laden?"))kh(n),s=r;else{xe("Speicherstand nicht lesbar"),Zn();return}}vu(n,s)}else if(e.dataset.act==="exp"){const s=Uh(n);if(!s){xe("Speicherstand nicht lesbar");return}RM(`klotzfunk-${s.name.replace(/[^\w-]+/g,"_")}.json`,zv(s))}else if(e.dataset.act==="bak"){const s=Oh(n);if(!s){xe("Keine lesbare Sicherung"),Zn();return}const r=new Date(s.savedAt).toLocaleString("de-DE",{dateStyle:"short",timeStyle:"short"});confirm(`Sicherung vom ${r} wiederherstellen? Der aktuelle Stand wird dafür zur Sicherung.`)&&(xe(kh(n)?"Sicherung wiederhergestellt":"Wiederherstellen fehlgeschlagen"),Zn())}else{const s=F("mode"+n).querySelector(".on").dataset.mode;vu(n,{name:s==="story"?"Story "+(n+1):"Welt "+(n+1),seed:s==="story"?777:wM(F("seed"+n).value),mode:s,gen:cf})}});function RM(i,t){try{const e=URL.createObjectURL(new Blob([t],{type:"application/json"})),n=document.createElement("a");n.href=e,n.download=i,document.body.appendChild(n),n.click(),n.remove(),setTimeout(()=>URL.revokeObjectURL(e),2e3)}catch{xe("Export nicht möglich")}}F("mImport").onclick=()=>{if(gf()<0){xe("Kein freier Platz – lösche zuerst eine Welt");return}F("importFile").value="",F("importFile").click()};F("importFile").addEventListener("change",i=>{const t=i.target.files&&i.target.files[0];if(t){if(t.size>8*1024*1024){xe("Datei zu groß");return}t.text().then(e=>{const n=Bv(e),s=gf();if(!n){xe("Keine gültige KLOTZFUNK-Welt");return}if(s<0){xe("Kein freier Platz");return}xe(mf(s,n)?`„${n.name}“ importiert (Platz ${s+1})`:"Import fehlgeschlagen (Speicher voll?)"),Zn()}).catch(()=>xe("Datei nicht lesbar"))}});function vu(i,t){Ki(),ks=i,Ie("loading"),requestAnimationFrame(()=>setTimeout(()=>{try{O.start(t),t.mode==="creative"&&(O.player.flying=!1),F("bFly").hidden=!(on&&O.mode==="creative"),F("bUndo").hidden=O.mode!=="creative",F("bmode").hidden=!0,Ur(),Li(),Ie("playing"),Fs(),ts(),O.story&&O.story.i===0&&O.story.p===0&&t.px===void 0&&xr(O.story.c?`📻 Kapitel 1: ${Ar[1].t}<small>${Ar[1].d} Dein Auftrag steht links (J blendet ihn aus).</small>`:"📜 Willkommen in der Funkzentrale!<small>Dein erster Auftrag steht links. J blendet ihn ein oder aus.</small>"),!O.unsaved&&t.px===void 0&&es(!1)}catch(e){console.error(e),Ie("menu"),Zn(),alert("Die Welt konnte nicht gestartet werden.")}},30))}F("pResume").onclick=()=>{Ki(),Hf()};F("pSave").onclick=()=>es(!0);F("pRespawn").onclick=()=>{O.respawn(),Hf()};F("pSound").onclick=()=>{_n.enabled=!_n.enabled,F("pSound").textContent=_n.enabled?"🔊 Ton: an":"🔇 Ton: aus"};F("pFull").onclick=()=>{try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}catch{}};F("pMenu").onclick=()=>{O.mp&&Pn.end(null),es(!1),ks=-1,Zn(),Ie("menu"),O.startMenu(),Li(),Fs()};F("vd").oninput=i=>{const t=Number(i.target.value);O.maxView=t,O.setViewDist(t),F("vdVal").textContent=t};F("invClose").onclick=Wl;F("bInv").onclick=dc;F("bWp").onclick=()=>O.toggleWaypoint();F("bUndo").onclick=()=>O.undo(!1);F("bMap").onclick=Vf;F("td").oninput=i=>{O.time=Number(i.target.value)/100,F("tdVal").textContent=O.clockText(),O.updateSky(),O.render()};F("pFreeze").onclick=()=>{O.timeFrozen=!O.timeFrozen,F("pFreeze").textContent=O.timeFrozen?"⏸ Zeit steht still":"⏱ Zeit läuft"};F("bPause").onclick=Ws;function kr(){const i=O.input;if(Yn.joy)return;i.f=(Fe.has("KeyW")||Fe.has("ArrowUp")?1:0)-(Fe.has("KeyS")||Fe.has("ArrowDown")?1:0),i.r=(Fe.has("KeyD")||Fe.has("ArrowRight")?1:0)-(Fe.has("KeyA")||Fe.has("ArrowLeft")?1:0);const t=O.player.flying;i.sprint=Fe.has("ControlLeft")||!t&&Fe.has("ShiftLeft"),i.down=t&&Fe.has("ShiftLeft")||Yn.down,i.jump=Fe.has("Space")||Yn.jump}const Yn={joy:!1,jump:!1,down:!1};let xu=0;function Xl(){if(O.mode!=="creative"||O.ride)return;const i=O.player;i.flying=!i.flying,i.vy=0,xe(i.flying?"Fliegen an":"Fliegen aus"),F("bDown").hidden=!(on&&i.flying),F("bFly").classList.toggle("on",i.flying)}window.addEventListener("keydown",i=>{if(i.target&&/^(INPUT|SELECT|TEXTAREA)$/.test(i.target.tagName)){i.code==="Escape"&&(i.target.blur(),oe==="inventory"?Wl():oe==="settings"&&$l());return}if(oe==="settings"){i.code==="Escape"&&$l();return}if(oe==="mp"){i.code==="Escape"&&F("mpClose").onclick();return}if(oe==="trade"){(i.code==="Escape"||i.code==="KeyE")&&(i.preventDefault(),Bf());return}if(oe==="inventory"){(i.code==="KeyE"||i.code==="Escape")&&(i.preventDefault(),Wl());return}if(oe==="playing"&&((i.code==="Space"||i.code==="Tab"||i.code.startsWith("Arrow"))&&i.preventDefault(),!i.repeat)){if(/^Digit[1-9]$/.test(i.code)){O.selectSlot(Number(i.code[5])-1);return}if(i.code==="KeyE"){i.preventDefault(),dc();return}if(i.code==="KeyZ"&&(i.ctrlKey||i.metaKey)){i.preventDefault(),O.undo(i.shiftKey);return}if(i.code==="KeyY"&&(i.ctrlKey||i.metaKey)){i.preventDefault(),O.undo(!0);return}if(i.code==="KeyF"){Xl();return}if(i.code==="KeyG"){O.cycleBuild(i.shiftKey?-1:1);return}if(i.code==="KeyQ"){O.fireHook();return}if(i.code==="KeyB"){O.toggleWaypoint();return}if(i.code==="KeyM"){Vf();return}if(i.code==="KeyJ"){Cr=!Cr,Li();return}if(i.code==="Space"){const t=performance.now();t-xu<280&&Xl(),xu=t}Fe.add(i.code),kr()}});window.addEventListener("keyup",i=>{Fe.delete(i.code),oe==="playing"&&kr()});window.addEventListener("blur",()=>{Fe.clear(),kr()});const CM=.0022,LM=.0058;function Gf(i,t,e){O.yaw-=i*e,O.pitch=Math.max(-1.55,Math.min(1.55,O.pitch-t*e*(Nt.invertY?-1:1)))}window.addEventListener("mousemove",i=>{oe==="playing"&&kn()&&Gf(i.movementX,i.movementY,CM*Nt.mouseSens)});Nr.addEventListener("mousedown",i=>{if(!(oe!=="playing"||on&&i.sourceCapabilities&&i.sourceCapabilities.firesTouchEvents)){if(Ki(),!kn()){ts();return}i.button===0?O.breakHeld=!0:i.button===2&&(O.placeHeld=!0),i.preventDefault()}});window.addEventListener("mouseup",i=>{i.button===0?O.breakHeld=!1:i.button===2&&(O.placeHeld=!1)});Nr.addEventListener("contextmenu",i=>i.preventDefault());window.addEventListener("wheel",i=>{oe==="playing"&&O.selectSlot(O.sel+(i.deltaY>0?1:-1))},{passive:!0});function PM(){on&&document.body.classList.contains("touch")||(on=!0,document.body.classList.add("touch"),F("bFly").hidden=O.mode!=="creative")}on&&document.body.classList.add("touch");window.addEventListener("pointerdown",i=>{i.pointerType==="touch"&&PM()},{capture:!0});(function(){const t=F("zl"),e=F("zr"),n=F("joy"),s=F("thumb"),r=52;let a=null,o=null;t.addEventListener("pointerdown",u=>{a||(Ki(),a={id:u.pointerId,x:u.clientX,y:u.clientY},t.setPointerCapture(u.pointerId),n.style.display="block",n.style.left=u.clientX+"px",n.style.top=u.clientY+"px",s.style.transform="translate(0,0)",Yn.joy=!0)}),t.addEventListener("pointermove",u=>{if(!a||u.pointerId!==a.id)return;let f=u.clientX-a.x,d=u.clientY-a.y;const g=Math.hypot(f,d),_=g>r?r/g:1;s.style.transform=`translate(${f*_}px,${d*_}px)`;const m=Math.min(1,g*Nt.joySens/r),p=m<.14?0:(m-.14)/.86,x=g?f/g:0,S=g?d/g:0;O.input.r=x*p,O.input.f=-S*p,O.input.sprint=g>r*1.35});const l=u=>{!a||u.pointerId!==a.id||(a=null,n.style.display="none",Yn.joy=!1,O.input.f=O.input.r=0,O.input.sprint=!1,kr())};t.addEventListener("pointerup",l),t.addEventListener("pointercancel",l),e.addEventListener("pointerdown",u=>{o||(o={id:u.pointerId,x:u.clientX,y:u.clientY},e.setPointerCapture(u.pointerId))}),e.addEventListener("pointermove",u=>{!o||u.pointerId!==o.id||(Gf(u.clientX-o.x,u.clientY-o.y,LM*Nt.touchSens),o.x=u.clientX,o.y=u.clientY)});const c=u=>{o&&u.pointerId===o.id&&(o=null)};e.addEventListener("pointerup",c),e.addEventListener("pointercancel",c);const h=(u,f,d)=>{const g=F(u);g.addEventListener("pointerdown",m=>{m.preventDefault(),Ki(),g.setPointerCapture(m.pointerId),g.classList.add("on"),f()});const _=()=>{g.classList.remove("on"),d()};g.addEventListener("pointerup",_),g.addEventListener("pointercancel",_)};h("bBreak",()=>{O.breakHeld=!0},()=>{O.breakHeld=!1}),h("bPlace",()=>{O.placeHeld=!0},()=>{O.placeHeld=!1}),h("bJump",()=>{Yn.jump=!0,O.input.jump=!0},()=>{Yn.jump=!1,O.input.jump=Fe.has("Space")}),h("bDown",()=>{Yn.down=!0,O.input.down=!0},()=>{Yn.down=!1,O.input.down=!1}),F("bFly").addEventListener("click",Xl),F("bHook").addEventListener("pointerdown",u=>{u.preventDefault(),Ki(),O.fireHook()})})();window.addEventListener("resize",()=>O.resize());let Na=!0;function Vf(){Na=!Na,F("mm").classList.toggle("off",!Na)}const Le=F("mm").getContext("2d"),Mu=Le.createImageData(56,56);function DM(){const i=O.world,t=O.player,e=Mu.data,n=Math.floor(t.x)-28,s=Math.floor(t.z)-28,r=t.y;for(let a=0;a<56;a++)for(let o=0;o<56;o++){const l=n+o,c=s+a,h=i.getChunk(l>>4,c>>4),u=(a*56+o)*4;let f=14,d=18,g=32;if(h){const _=(l&15)+(c&15)*16;let m=Math.min(ae-1,h.maxY);for(;m>0&&h.data[_+m*256]===0;)m--;const p=h.data[_+m*256],x=ne[p]?ne[p].map:[200,200,210],S=p===v.WATER?1:Math.max(.55,Math.min(1.25,1+(m-r)*.025));f=x[0]*S,d=x[1]*S,g=x[2]*S}e[u]=f,e[u+1]=d,e[u+2]=g,e[u+3]=255}if(Le.putImageData(Mu,0,0),O.wp){let a=O.wp.x-t.x,o=O.wp.z-t.z;const l=Math.max(Math.abs(a),Math.abs(o)),c=l>25?25/l:1;a*=c,o*=c,Le.fillStyle="#ff2d95",Le.fillRect(28+a-2,28+o-2,5,5),Le.strokeStyle="#fff",Le.strokeRect(28+a-2.5,28+o-2.5,6,6)}Le.save(),Le.translate(28,28),Le.rotate(-O.yaw),Le.fillStyle="#fff",Le.strokeStyle="#000",Le.beginPath(),Le.moveTo(0,-5),Le.lineTo(3.5,4),Le.lineTo(0,2),Le.lineTo(-3.5,4),Le.closePath(),Le.fill(),Le.stroke(),Le.restore()}let IM=0;setInterval(()=>{if(oe!=="playing")return;const i=O.player;let t="";i.flying&&(t+=" · fliegt"),i.gliding&&(t+=" · gleitet"),O.hookT>0&&(t+=" · Haken"),O.wp&&(t+=` · 📍 ${Math.round(Math.hypot(O.wp.x-i.x,O.wp.z-i.z))} m`),O.radioDist<24&&(t+=" · ♪");const e=O.biomeName();e&&(t+=" · "+e),Nt.showFps&&(t+=` · ${O.fps} FPS`),F("info").textContent=`${O.clockText()} ${O.time<.5?"☀":"☾"} · X ${i.x.toFixed(0)} Y ${i.y.toFixed(0)} Z ${i.z.toFixed(0)}${t}`,F("uw").classList.toggle("on",!!O.underwater),Na&&!(IM++&1)&&DM(),O.story&&Li()},250);function Wf(){const i=Nt.quality==="auto";O.setQuality(i?Gv(uc):Nt.quality,i),O.placeDelay=Nt.placeDelay,O.deathLoss=Nt.deathLoss,O.enemies=Nt.enemies,O.preview=Nt.preview,_n.vol=Nt.sfxVol,_n.music=Nt.musicVol,document.documentElement.style.setProperty("--tbs",String(Nt.btnScale)),document.body.classList.toggle("lefty",Nt.lefty)}const Xf=[["sMouse","mouseSens",i=>i.toFixed(1)+"×"],["sTouch","touchSens",i=>i.toFixed(1)+"×"],["sJoy","joySens",i=>i.toFixed(1)+"×"],["sBtn","btnScale",i=>Math.round(i*100)+" %"],["sSfx","sfxVol",i=>Math.round(i*100)+" %"],["sMus","musicVol",i=>Math.round(i*100)+" %"]],$f=[["sLefty","lefty"],["sInvY","invertY"],["sPlace","placeDelay"],["sFps","showFps"],["sEnemy","enemies"],["sPreview","preview"]];function qf(){F("sQuality").value=Nt.quality,F("sDeath").value=Nt.deathLoss;for(const[i,t,e]of Xf)F(i).value=Nt[t],F(i+"V").textContent=e(Nt[t]);for(const[i,t]of $f)F(i).checked=Nt[t]}function Fr(i){oc(Nt),i?Wf():(O.placeDelay=Nt.placeDelay,O.deathLoss=Nt.deathLoss,O.enemies=Nt.enemies,O.preview=Nt.preview,_n.vol=Nt.sfxVol,_n.music=Nt.musicVol,document.documentElement.style.setProperty("--tbs",String(Nt.btnScale)),document.body.classList.toggle("lefty",Nt.lefty))}F("sQuality").onchange=i=>{Nt.quality=i.target.value,Fr(!0)};F("sDeath").onchange=i=>{Nt.deathLoss=i.target.value,Fr(!1)};for(const[i,t,e]of Xf)F(i).oninput=n=>{Nt[t]=Number(n.target.value),F(i+"V").textContent=e(Nt[t]),Fr(!1)};for(const[i,t]of $f)F(i).onchange=e=>{Nt[t]=e.target.checked,Fr(!1)};F("sReset").onclick=()=>{Nt={...Pa},Fr(!0),qf(),xe("Standard wiederhergestellt")};function Yf(){wr=oe,qf(),Ie("settings")}function $l(){oe==="settings"&&(Ie(wr),wr==="paused"&&(F("vd").value=O.viewDist,F("vdVal").textContent=O.viewDist))}F("pSettings").onclick=Yf;F("mSettings").onclick=Yf;F("setClose").onclick=$l;Wf();Zn();const Pn=new vM(O,{toast:i=>xe(i),status:i=>{F("mpStatus").textContent=i},players:i=>{F("mpPlayers").innerHTML=i.map(t=>`<li><span>👤 ${t.name.replace(/[<>&]/g,"")}</span>${Pn.host?`<button data-kick="${t.id}">Entfernen</button>`:""}</li>`).join("")},joined:i=>{ks=-1,F("bFly").hidden=!(on&&O.mode==="creative"),F("bUndo").hidden=O.mode!=="creative",F("bmode").hidden=!0,Ur(),Li(),Ie("playing"),Fs(),ts(),xr(`👥 Bei ${String(i.host).replace(/[<>&]/g,"")}<small>Du spielst in seiner Welt. Dein Vorrat gilt nur für diesen Besuch; gespeichert wird beim Gastgeber.</small>`)},ended:(i,t)=>{xe(i),t?(ks=-1,Zn(),Ie("menu"),O.startMenu(),Li(),Fs()):Pn.listPlayers()}});let As=null,Kf="menu";function jf(i){Kf=oe,wr=oe==="paused"?"paused":"menu",F("mpHost").hidden=!i,F("mpGuest").hidden=i,F("mpStun").checked=Nt.stun,F("mpName").value=Nt.mpName,F("mpStatus").textContent="",i&&Pn.listPlayers(),Ie("mp")}F("pMp").onclick=()=>jf(!0);F("mJoin").onclick=()=>{Ki(),F("mpAnswerBox").hidden=!0,jf(!1)};F("mpClose").onclick=()=>{Ie(Kf==="paused"?"paused":"menu")};F("mpStun").onchange=i=>{Nt.stun=i.target.checked,oc(Nt)};const Zf=i=>{const t=F(i);t.select(),(navigator.clipboard?navigator.clipboard.writeText(t.value):Promise.reject()).then(()=>xe("Kopiert ✔"),()=>{document.execCommand("copy"),xe("Kopiert")})};F("mpCopyO").onclick=()=>Zf("mpOffer");F("mpCopyA").onclick=()=>Zf("mpAnswer");F("mpInvite").onclick=async()=>{Pn.useStun=Nt.stun,Pn.myName=Nt.mpName||"Gastgeber",F("mpStatus").textContent="Einladung wird vorbereitet …",F("mpInvite").disabled=!0;try{As=await Pn.invite(),F("mpOffer").value=As.code,F("mpAnswerIn").value="",F("mpOfferBox").hidden=!1,F("mpStatus").textContent="Einladung kopieren und schicken, dann die Antwort einfügen."}catch(i){F("mpStatus").textContent="Einladung ging nicht: "+(i.message||i)}F("mpInvite").disabled=!1};F("mpConnect").onclick=async()=>{if(As)try{await As.accept(F("mpAnswerIn").value),F("mpStatus").textContent="Verbinde …";const i=As.pc;As=null,F("mpOfferBox").hidden=!0;const t=setTimeout(()=>{i.connectionState!=="connected"&&(F("mpStatus").textContent="Keine Verbindung. Tipp: „Über das Internet verbinden“ bei beiden einschalten oder im selben WLAN spielen.")},15e3);i.addEventListener("connectionstatechange",()=>{i.connectionState==="connected"&&(clearTimeout(t),F("mpStatus").textContent="Verbunden ✔")})}catch(i){F("mpStatus").textContent=i.message||"Antwort-Code passt nicht"}};F("mpPlayers").addEventListener("click",i=>{const t=i.target.closest("[data-kick]");t&&Pn.kick(Number(t.dataset.kick))});F("mpJoin").onclick=async()=>{const i=F("mpName").value.trim();Nt.mpName=i,Nt.stun=F("mpStun").checked,oc(Nt),O.mp&&Pn.end(null),Pn.useStun=Nt.stun,F("mpStatus").textContent="Antwort wird erstellt …",F("mpJoin").disabled=!0;try{const t=await Pn.join(F("mpInviteIn").value,i||"Gast");F("mpAnswer").value=t,F("mpAnswerBox").hidden=!1,F("mpStatus").textContent="Antwort kopieren und dem Gastgeber schicken. Sobald er sie einfügt, geht es los."}catch(t){F("mpStatus").textContent=t.message||"Einladungs-Code passt nicht"}F("mpJoin").disabled=!1};Ie("menu");O.startMenu();
