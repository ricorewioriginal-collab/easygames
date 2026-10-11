(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function e(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=e(s);fetch(s.href,r)}})();/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Zo="170",fu=0,Al=1,du=2,ih=1,pu=2,Dn=3,zn=0,He=1,on=2,oi=0,Qi=1,wl=2,Rl=3,Cl=4,mu=5,Ei=100,gu=101,_u=102,vu=103,xu=104,Mu=200,Su=201,yu=202,Eu=203,Za=204,ja=205,Tu=206,bu=207,Au=208,wu=209,Ru=210,Cu=211,Lu=212,Pu=213,Du=214,Ja=0,Qa=1,to=2,as=3,eo=4,no=5,io=6,so=7,sh=0,Iu=1,Uu=2,li=0,Nu=1,Ou=2,Fu=3,Bu=4,zu=5,ku=6,Hu=7,rh=300,os=301,ls=302,ro=303,ao=304,ea=306,Yr=1e3,bi=1001,oo=1002,Ge=1003,Gu=1004,sr=1005,je=1006,ca=1007,Tn=1008,kn=1009,ah=1010,oh=1011,Hs=1012,jo=1013,Ci=1014,Nn=1015,Ws=1016,Jo=1017,Qo=1018,cs=1020,lh=35902,ch=1021,hh=1022,cn=1023,uh=1024,fh=1025,ts=1026,hs=1027,dh=1028,tl=1029,ph=1030,el=1031,nl=1033,Or=33776,Fr=33777,Br=33778,zr=33779,lo=35840,co=35841,ho=35842,uo=35843,fo=36196,po=37492,mo=37496,go=37808,_o=37809,vo=37810,xo=37811,Mo=37812,So=37813,yo=37814,Eo=37815,To=37816,bo=37817,Ao=37818,wo=37819,Ro=37820,Co=37821,kr=36492,Lo=36494,Po=36495,mh=36283,Do=36284,Io=36285,Uo=36286,Vu=3200,Wu=3201,Xu=0,qu=1,ei="",sn="srgb",ds="srgb-linear",na="linear",se="srgb",Ni=7680,Ll=519,Yu=512,$u=513,Ku=514,gh=515,Zu=516,ju=517,Ju=518,Qu=519,Pl=35044,Dl="300 es",On=2e3,$r=2001;class ps{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const s=this._listeners[t];if(s!==void 0){const r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const n=this._listeners[t.type];if(n!==void 0){t.target=this;const s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}}const Ne=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Hr=Math.PI/180,No=180/Math.PI;function Xs(){const i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ne[i&255]+Ne[i>>8&255]+Ne[i>>16&255]+Ne[i>>24&255]+"-"+Ne[t&255]+Ne[t>>8&255]+"-"+Ne[t>>16&15|64]+Ne[t>>24&255]+"-"+Ne[e&63|128]+Ne[e>>8&255]+"-"+Ne[e>>16&255]+Ne[e>>24&255]+Ne[n&255]+Ne[n>>8&255]+Ne[n>>16&255]+Ne[n>>24&255]).toLowerCase()}function Ye(i,t,e){return Math.max(t,Math.min(e,i))}function tf(i,t){return(i%t+t)%t}function ha(i,t,e){return(1-e)*i+e*t}function Es(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function qe(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}class ne{constructor(t=0,e=0){ne.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Ye(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*s+t.x,this.y=r*s+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Bt{constructor(t,e,n,s,r,a,o,l,c){Bt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c)}set(t,e,n,s,r,a,o,l,c){const u=this.elements;return u[0]=t,u[1]=s,u[2]=o,u[3]=e,u[4]=r,u[5]=l,u[6]=n,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],u=n[4],h=n[7],d=n[2],p=n[5],g=n[8],_=s[0],m=s[3],f=s[6],x=s[1],E=s[4],y=s[7],D=s[2],R=s[5],w=s[8];return r[0]=a*_+o*x+l*D,r[3]=a*m+o*E+l*R,r[6]=a*f+o*y+l*w,r[1]=c*_+u*x+h*D,r[4]=c*m+u*E+h*R,r[7]=c*f+u*y+h*w,r[2]=d*_+p*x+g*D,r[5]=d*m+p*E+g*R,r[8]=d*f+p*y+g*w,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8];return e*a*u-e*o*c-n*r*u+n*o*l+s*r*c-s*a*l}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8],h=u*a-o*c,d=o*l-u*r,p=c*r-a*l,g=e*h+n*d+s*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return t[0]=h*_,t[1]=(s*c-u*n)*_,t[2]=(o*n-s*a)*_,t[3]=d*_,t[4]=(u*e-s*l)*_,t[5]=(s*r-o*e)*_,t[6]=p*_,t[7]=(n*l-c*e)*_,t[8]=(a*e-n*r)*_,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+t,-s*c,s*l,-s*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return this.premultiply(ua.makeScale(t,e)),this}rotate(t){return this.premultiply(ua.makeRotation(-t)),this}translate(t,e){return this.premultiply(ua.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const ua=new Bt;function _h(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function Kr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function ef(){const i=Kr("canvas");return i.style.display="block",i}const Il={};function Us(i){i in Il||(Il[i]=!0,console.warn(i))}function nf(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}function sf(i){const t=i.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function rf(i){const t=i.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}const Kt={enabled:!0,workingColorSpace:ds,spaces:{},convert:function(i,t,e){return this.enabled===!1||t===e||!t||!e||(this.spaces[t].transfer===se&&(i.r=Fn(i.r),i.g=Fn(i.g),i.b=Fn(i.b)),this.spaces[t].primaries!==this.spaces[e].primaries&&(i.applyMatrix3(this.spaces[t].toXYZ),i.applyMatrix3(this.spaces[e].fromXYZ)),this.spaces[e].transfer===se&&(i.r=es(i.r),i.g=es(i.g),i.b=es(i.b))),i},fromWorkingColorSpace:function(i,t){return this.convert(i,this.workingColorSpace,t)},toWorkingColorSpace:function(i,t){return this.convert(i,t,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===ei?na:this.spaces[i].transfer},getLuminanceCoefficients:function(i,t=this.workingColorSpace){return i.fromArray(this.spaces[t].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,t,e){return i.copy(this.spaces[t].toXYZ).multiply(this.spaces[e].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}};function Fn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function es(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}const Ul=[.64,.33,.3,.6,.15,.06],Nl=[.2126,.7152,.0722],Ol=[.3127,.329],Fl=new Bt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Bl=new Bt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);Kt.define({[ds]:{primaries:Ul,whitePoint:Ol,transfer:na,toXYZ:Fl,fromXYZ:Bl,luminanceCoefficients:Nl,workingColorSpaceConfig:{unpackColorSpace:sn},outputColorSpaceConfig:{drawingBufferColorSpace:sn}},[sn]:{primaries:Ul,whitePoint:Ol,transfer:se,toXYZ:Fl,fromXYZ:Bl,luminanceCoefficients:Nl,outputColorSpaceConfig:{drawingBufferColorSpace:sn}}});let Oi;class af{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{Oi===void 0&&(Oi=Kr("canvas")),Oi.width=t.width,Oi.height=t.height;const n=Oi.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=Oi}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=Kr("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Fn(r[a]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Fn(e[n]/255)*255):e[n]=Fn(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let of=0;class vh{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:of++}),this.uuid=Xs(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(fa(s[a].image)):r.push(fa(s[a]))}else r=fa(s);n.url=r}return e||(t.images[this.uuid]=n),n}}function fa(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?af.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let lf=0;class Fe extends ps{constructor(t=Fe.DEFAULT_IMAGE,e=Fe.DEFAULT_MAPPING,n=bi,s=bi,r=je,a=Tn,o=cn,l=kn,c=Fe.DEFAULT_ANISOTROPY,u=ei){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:lf++}),this.uuid=Xs(),this.name="",this.source=new vh(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new ne(0,0),this.repeat=new ne(1,1),this.center=new ne(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Bt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==rh)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Yr:t.x=t.x-Math.floor(t.x);break;case bi:t.x=t.x<0?0:1;break;case oo:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Yr:t.y=t.y-Math.floor(t.y);break;case bi:t.y=t.y<0?0:1;break;case oo:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}Fe.DEFAULT_IMAGE=null;Fe.DEFAULT_MAPPING=rh;Fe.DEFAULT_ANISOTROPY=1;class Me{constructor(t=0,e=0,n=0,s=1){Me.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*s+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r;const l=t.elements,c=l[0],u=l[4],h=l[8],d=l[1],p=l[5],g=l[9],_=l[2],m=l[6],f=l[10];if(Math.abs(u-d)<.01&&Math.abs(h-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+p+f-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const E=(c+1)/2,y=(p+1)/2,D=(f+1)/2,R=(u+d)/4,w=(h+_)/4,C=(g+m)/4;return E>y&&E>D?E<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(E),s=R/n,r=w/n):y>D?y<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(y),n=R/s,r=C/s):D<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(D),n=w/r,s=C/r),this.set(n,s,r,e),this}let x=Math.sqrt((m-g)*(m-g)+(h-_)*(h-_)+(d-u)*(d-u));return Math.abs(x)<.001&&(x=1),this.x=(m-g)/x,this.y=(h-_)/x,this.z=(d-u)/x,this.w=Math.acos((c+p+f-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class cf extends ps{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new Me(0,0,t,e),this.scissorTest=!1,this.viewport=new Me(0,0,t,e);const s={width:t,height:e,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:je,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const r=new Fe(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];const a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,s=t.textures.length;n<s;n++)this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const e=Object.assign({},t.texture.image);return this.texture.source=new vh(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Li extends cf{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class xh extends Fe{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Ge,this.minFilter=Ge,this.wrapR=bi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class hf extends Fe{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Ge,this.minFilter=Ge,this.wrapR=bi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class qs{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,a,o){let l=n[s+0],c=n[s+1],u=n[s+2],h=n[s+3];const d=r[a+0],p=r[a+1],g=r[a+2],_=r[a+3];if(o===0){t[e+0]=l,t[e+1]=c,t[e+2]=u,t[e+3]=h;return}if(o===1){t[e+0]=d,t[e+1]=p,t[e+2]=g,t[e+3]=_;return}if(h!==_||l!==d||c!==p||u!==g){let m=1-o;const f=l*d+c*p+u*g+h*_,x=f>=0?1:-1,E=1-f*f;if(E>Number.EPSILON){const D=Math.sqrt(E),R=Math.atan2(D,f*x);m=Math.sin(m*R)/D,o=Math.sin(o*R)/D}const y=o*x;if(l=l*m+d*y,c=c*m+p*y,u=u*m+g*y,h=h*m+_*y,m===1-o){const D=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=D,c*=D,u*=D,h*=D}}t[e]=l,t[e+1]=c,t[e+2]=u,t[e+3]=h}static multiplyQuaternionsFlat(t,e,n,s,r,a){const o=n[s],l=n[s+1],c=n[s+2],u=n[s+3],h=r[a],d=r[a+1],p=r[a+2],g=r[a+3];return t[e]=o*g+u*h+l*p-c*d,t[e+1]=l*g+u*d+c*h-o*p,t[e+2]=c*g+u*p+o*d-l*h,t[e+3]=u*g-o*h-l*d-c*p,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(n/2),u=o(s/2),h=o(r/2),d=l(n/2),p=l(s/2),g=l(r/2);switch(a){case"XYZ":this._x=d*u*h+c*p*g,this._y=c*p*h-d*u*g,this._z=c*u*g+d*p*h,this._w=c*u*h-d*p*g;break;case"YXZ":this._x=d*u*h+c*p*g,this._y=c*p*h-d*u*g,this._z=c*u*g-d*p*h,this._w=c*u*h+d*p*g;break;case"ZXY":this._x=d*u*h-c*p*g,this._y=c*p*h+d*u*g,this._z=c*u*g+d*p*h,this._w=c*u*h-d*p*g;break;case"ZYX":this._x=d*u*h-c*p*g,this._y=c*p*h+d*u*g,this._z=c*u*g-d*p*h,this._w=c*u*h+d*p*g;break;case"YZX":this._x=d*u*h+c*p*g,this._y=c*p*h+d*u*g,this._z=c*u*g-d*p*h,this._w=c*u*h-d*p*g;break;case"XZY":this._x=d*u*h-c*p*g,this._y=c*p*h-d*u*g,this._z=c*u*g+d*p*h,this._w=c*u*h+d*p*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],s=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],u=e[6],h=e[10],d=n+o+h;if(d>0){const p=.5/Math.sqrt(d+1);this._w=.25/p,this._x=(u-l)*p,this._y=(r-c)*p,this._z=(a-s)*p}else if(n>o&&n>h){const p=2*Math.sqrt(1+n-o-h);this._w=(u-l)/p,this._x=.25*p,this._y=(s+a)/p,this._z=(r+c)/p}else if(o>h){const p=2*Math.sqrt(1+o-n-h);this._w=(r-c)/p,this._x=(s+a)/p,this._y=.25*p,this._z=(l+u)/p}else{const p=2*Math.sqrt(1+h-n-o);this._w=(a-s)/p,this._x=(r+c)/p,this._y=(l+u)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Ye(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,s=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,u=e._w;return this._x=n*u+a*o+s*c-r*l,this._y=s*u+a*l+r*o-n*c,this._z=r*u+a*c+n*l-s*o,this._w=a*u-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const n=this._x,s=this._y,r=this._z,a=this._w;let o=a*t._w+n*t._x+s*t._y+r*t._z;if(o<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,o=-o):this.copy(t),o>=1)return this._w=a,this._x=n,this._y=s,this._z=r,this;const l=1-o*o;if(l<=Number.EPSILON){const p=1-e;return this._w=p*a+e*this._w,this._x=p*n+e*this._x,this._y=p*s+e*this._y,this._z=p*r+e*this._z,this.normalize(),this}const c=Math.sqrt(l),u=Math.atan2(c,o),h=Math.sin((1-e)*u)/c,d=Math.sin(e*u)/c;return this._w=a*h+this._w*d,this._x=n*h+this._x*d,this._y=s*h+this._y*d,this._z=r*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class O{constructor(t=0,e=0,n=0){O.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(zl.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(zl.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(t){const e=this.x,n=this.y,s=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*s-o*n),u=2*(o*e-r*s),h=2*(r*n-a*e);return this.x=e+l*c+a*h-o*u,this.y=n+l*u+o*c-r*h,this.z=s+l*h+r*u-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,s=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return da.copy(this).projectOnVector(t),this.sub(da)}reflect(t){return this.sub(da.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Ye(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const da=new O,zl=new qs;class Ys{constructor(t=new O(1/0,1/0,1/0),e=new O(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(pn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(pn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=pn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,pn):pn.fromBufferAttribute(r,a),pn.applyMatrix4(t.matrixWorld),this.expandByPoint(pn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),rr.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),rr.copy(n.boundingBox)),rr.applyMatrix4(t.matrixWorld),this.union(rr)}const s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,pn),pn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ts),ar.subVectors(this.max,Ts),Fi.subVectors(t.a,Ts),Bi.subVectors(t.b,Ts),zi.subVectors(t.c,Ts),qn.subVectors(Bi,Fi),Yn.subVectors(zi,Bi),pi.subVectors(Fi,zi);let e=[0,-qn.z,qn.y,0,-Yn.z,Yn.y,0,-pi.z,pi.y,qn.z,0,-qn.x,Yn.z,0,-Yn.x,pi.z,0,-pi.x,-qn.y,qn.x,0,-Yn.y,Yn.x,0,-pi.y,pi.x,0];return!pa(e,Fi,Bi,zi,ar)||(e=[1,0,0,0,1,0,0,0,1],!pa(e,Fi,Bi,zi,ar))?!1:(or.crossVectors(qn,Yn),e=[or.x,or.y,or.z],pa(e,Fi,Bi,zi,ar))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,pn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(pn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(wn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),wn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),wn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),wn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),wn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),wn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),wn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),wn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(wn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const wn=[new O,new O,new O,new O,new O,new O,new O,new O],pn=new O,rr=new Ys,Fi=new O,Bi=new O,zi=new O,qn=new O,Yn=new O,pi=new O,Ts=new O,ar=new O,or=new O,mi=new O;function pa(i,t,e,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){mi.fromArray(i,r);const o=s.x*Math.abs(mi.x)+s.y*Math.abs(mi.y)+s.z*Math.abs(mi.z),l=t.dot(mi),c=e.dot(mi),u=n.dot(mi);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}const uf=new Ys,bs=new O,ma=new O;class ms{constructor(t=new O,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):uf.setFromPoints(t).getCenter(n);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;bs.subVectors(t,this.center);const e=bs.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(bs,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(ma.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(bs.copy(t.center).add(ma)),this.expandByPoint(bs.copy(t.center).sub(ma))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Rn=new O,ga=new O,lr=new O,$n=new O,_a=new O,cr=new O,va=new O;class il{constructor(t=new O,e=new O(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Rn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=Rn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Rn.copy(this.origin).addScaledVector(this.direction,e),Rn.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){ga.copy(t).add(e).multiplyScalar(.5),lr.copy(e).sub(t).normalize(),$n.copy(this.origin).sub(ga);const r=t.distanceTo(e)*.5,a=-this.direction.dot(lr),o=$n.dot(this.direction),l=-$n.dot(lr),c=$n.lengthSq(),u=Math.abs(1-a*a);let h,d,p,g;if(u>0)if(h=a*l-o,d=a*o-l,g=r*u,h>=0)if(d>=-g)if(d<=g){const _=1/u;h*=_,d*=_,p=h*(h+a*d+2*o)+d*(a*h+d+2*l)+c}else d=r,h=Math.max(0,-(a*d+o)),p=-h*h+d*(d+2*l)+c;else d=-r,h=Math.max(0,-(a*d+o)),p=-h*h+d*(d+2*l)+c;else d<=-g?(h=Math.max(0,-(-a*r+o)),d=h>0?-r:Math.min(Math.max(-r,-l),r),p=-h*h+d*(d+2*l)+c):d<=g?(h=0,d=Math.min(Math.max(-r,-l),r),p=d*(d+2*l)+c):(h=Math.max(0,-(a*r+o)),d=h>0?r:Math.min(Math.max(-r,-l),r),p=-h*h+d*(d+2*l)+c);else d=a>0?-r:r,h=Math.max(0,-(a*d+o)),p=-h*h+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(ga).addScaledVector(lr,d),p}intersectSphere(t,e){Rn.subVectors(t.center,this.origin);const n=Rn.dot(this.direction),s=Rn.dot(Rn)-n*n,r=t.radius*t.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,a,o,l;const c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return c>=0?(n=(t.min.x-d.x)*c,s=(t.max.x-d.x)*c):(n=(t.max.x-d.x)*c,s=(t.min.x-d.x)*c),u>=0?(r=(t.min.y-d.y)*u,a=(t.max.y-d.y)*u):(r=(t.max.y-d.y)*u,a=(t.min.y-d.y)*u),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),h>=0?(o=(t.min.z-d.z)*h,l=(t.max.z-d.z)*h):(o=(t.max.z-d.z)*h,l=(t.min.z-d.z)*h),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,Rn)!==null}intersectTriangle(t,e,n,s,r){_a.subVectors(e,t),cr.subVectors(n,t),va.crossVectors(_a,cr);let a=this.direction.dot(va),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;$n.subVectors(this.origin,t);const l=o*this.direction.dot(cr.crossVectors($n,cr));if(l<0)return null;const c=o*this.direction.dot(_a.cross($n));if(c<0||l+c>a)return null;const u=-o*$n.dot(va);return u<0?null:this.at(u/a,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class ge{constructor(t,e,n,s,r,a,o,l,c,u,h,d,p,g,_,m){ge.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c,u,h,d,p,g,_,m)}set(t,e,n,s,r,a,o,l,c,u,h,d,p,g,_,m){const f=this.elements;return f[0]=t,f[4]=e,f[8]=n,f[12]=s,f[1]=r,f[5]=a,f[9]=o,f[13]=l,f[2]=c,f[6]=u,f[10]=h,f[14]=d,f[3]=p,f[7]=g,f[11]=_,f[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new ge().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,n=t.elements,s=1/ki.setFromMatrixColumn(t,0).length(),r=1/ki.setFromMatrixColumn(t,1).length(),a=1/ki.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,s=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),h=Math.sin(r);if(t.order==="XYZ"){const d=a*u,p=a*h,g=o*u,_=o*h;e[0]=l*u,e[4]=-l*h,e[8]=c,e[1]=p+g*c,e[5]=d-_*c,e[9]=-o*l,e[2]=_-d*c,e[6]=g+p*c,e[10]=a*l}else if(t.order==="YXZ"){const d=l*u,p=l*h,g=c*u,_=c*h;e[0]=d+_*o,e[4]=g*o-p,e[8]=a*c,e[1]=a*h,e[5]=a*u,e[9]=-o,e[2]=p*o-g,e[6]=_+d*o,e[10]=a*l}else if(t.order==="ZXY"){const d=l*u,p=l*h,g=c*u,_=c*h;e[0]=d-_*o,e[4]=-a*h,e[8]=g+p*o,e[1]=p+g*o,e[5]=a*u,e[9]=_-d*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){const d=a*u,p=a*h,g=o*u,_=o*h;e[0]=l*u,e[4]=g*c-p,e[8]=d*c+_,e[1]=l*h,e[5]=_*c+d,e[9]=p*c-g,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){const d=a*l,p=a*c,g=o*l,_=o*c;e[0]=l*u,e[4]=_-d*h,e[8]=g*h+p,e[1]=h,e[5]=a*u,e[9]=-o*u,e[2]=-c*u,e[6]=p*h+g,e[10]=d-_*h}else if(t.order==="XZY"){const d=a*l,p=a*c,g=o*l,_=o*c;e[0]=l*u,e[4]=-h,e[8]=c*u,e[1]=d*h+_,e[5]=a*u,e[9]=p*h-g,e[2]=g*h-p,e[6]=o*u,e[10]=_*h+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(ff,t,df)}lookAt(t,e,n){const s=this.elements;return Ke.subVectors(t,e),Ke.lengthSq()===0&&(Ke.z=1),Ke.normalize(),Kn.crossVectors(n,Ke),Kn.lengthSq()===0&&(Math.abs(n.z)===1?Ke.x+=1e-4:Ke.z+=1e-4,Ke.normalize(),Kn.crossVectors(n,Ke)),Kn.normalize(),hr.crossVectors(Ke,Kn),s[0]=Kn.x,s[4]=hr.x,s[8]=Ke.x,s[1]=Kn.y,s[5]=hr.y,s[9]=Ke.y,s[2]=Kn.z,s[6]=hr.z,s[10]=Ke.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],u=n[1],h=n[5],d=n[9],p=n[13],g=n[2],_=n[6],m=n[10],f=n[14],x=n[3],E=n[7],y=n[11],D=n[15],R=s[0],w=s[4],C=s[8],T=s[12],S=s[1],L=s[5],q=s[9],B=s[13],Z=s[2],X=s[6],$=s[10],Q=s[14],G=s[3],ot=s[7],dt=s[11],yt=s[15];return r[0]=a*R+o*S+l*Z+c*G,r[4]=a*w+o*L+l*X+c*ot,r[8]=a*C+o*q+l*$+c*dt,r[12]=a*T+o*B+l*Q+c*yt,r[1]=u*R+h*S+d*Z+p*G,r[5]=u*w+h*L+d*X+p*ot,r[9]=u*C+h*q+d*$+p*dt,r[13]=u*T+h*B+d*Q+p*yt,r[2]=g*R+_*S+m*Z+f*G,r[6]=g*w+_*L+m*X+f*ot,r[10]=g*C+_*q+m*$+f*dt,r[14]=g*T+_*B+m*Q+f*yt,r[3]=x*R+E*S+y*Z+D*G,r[7]=x*w+E*L+y*X+D*ot,r[11]=x*C+E*q+y*$+D*dt,r[15]=x*T+E*B+y*Q+D*yt,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],u=t[2],h=t[6],d=t[10],p=t[14],g=t[3],_=t[7],m=t[11],f=t[15];return g*(+r*l*h-s*c*h-r*o*d+n*c*d+s*o*p-n*l*p)+_*(+e*l*p-e*c*d+r*a*d-s*a*p+s*c*u-r*l*u)+m*(+e*c*h-e*o*p-r*a*h+n*a*p+r*o*u-n*c*u)+f*(-s*o*u-e*l*h+e*o*d+s*a*h-n*a*d+n*l*u)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8],h=t[9],d=t[10],p=t[11],g=t[12],_=t[13],m=t[14],f=t[15],x=h*m*c-_*d*c+_*l*p-o*m*p-h*l*f+o*d*f,E=g*d*c-u*m*c-g*l*p+a*m*p+u*l*f-a*d*f,y=u*_*c-g*h*c+g*o*p-a*_*p-u*o*f+a*h*f,D=g*h*l-u*_*l-g*o*d+a*_*d+u*o*m-a*h*m,R=e*x+n*E+s*y+r*D;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const w=1/R;return t[0]=x*w,t[1]=(_*d*r-h*m*r-_*s*p+n*m*p+h*s*f-n*d*f)*w,t[2]=(o*m*r-_*l*r+_*s*c-n*m*c-o*s*f+n*l*f)*w,t[3]=(h*l*r-o*d*r-h*s*c+n*d*c+o*s*p-n*l*p)*w,t[4]=E*w,t[5]=(u*m*r-g*d*r+g*s*p-e*m*p-u*s*f+e*d*f)*w,t[6]=(g*l*r-a*m*r-g*s*c+e*m*c+a*s*f-e*l*f)*w,t[7]=(a*d*r-u*l*r+u*s*c-e*d*c-a*s*p+e*l*p)*w,t[8]=y*w,t[9]=(g*h*r-u*_*r-g*n*p+e*_*p+u*n*f-e*h*f)*w,t[10]=(a*_*r-g*o*r+g*n*c-e*_*c-a*n*f+e*o*f)*w,t[11]=(u*o*r-a*h*r-u*n*c+e*h*c+a*n*p-e*o*p)*w,t[12]=D*w,t[13]=(u*_*s-g*h*s+g*n*d-e*_*d-u*n*m+e*h*m)*w,t[14]=(g*o*s-a*_*s-g*n*l+e*_*l+a*n*m-e*o*m)*w,t[15]=(a*h*s-u*o*s+u*n*l-e*h*l-a*n*d+e*o*d)*w,this}scale(t){const e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),s=Math.sin(e),r=1-n,a=t.x,o=t.y,l=t.z,c=r*a,u=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,u*o+n,u*l-s*a,0,c*l-s*o,u*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,a){return this.set(1,n,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){const s=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,u=a+a,h=o+o,d=r*c,p=r*u,g=r*h,_=a*u,m=a*h,f=o*h,x=l*c,E=l*u,y=l*h,D=n.x,R=n.y,w=n.z;return s[0]=(1-(_+f))*D,s[1]=(p+y)*D,s[2]=(g-E)*D,s[3]=0,s[4]=(p-y)*R,s[5]=(1-(d+f))*R,s[6]=(m+x)*R,s[7]=0,s[8]=(g+E)*w,s[9]=(m-x)*w,s[10]=(1-(d+_))*w,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){const s=this.elements;let r=ki.set(s[0],s[1],s[2]).length();const a=ki.set(s[4],s[5],s[6]).length(),o=ki.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],mn.copy(this);const c=1/r,u=1/a,h=1/o;return mn.elements[0]*=c,mn.elements[1]*=c,mn.elements[2]*=c,mn.elements[4]*=u,mn.elements[5]*=u,mn.elements[6]*=u,mn.elements[8]*=h,mn.elements[9]*=h,mn.elements[10]*=h,e.setFromRotationMatrix(mn),n.x=r,n.y=a,n.z=o,this}makePerspective(t,e,n,s,r,a,o=On){const l=this.elements,c=2*r/(e-t),u=2*r/(n-s),h=(e+t)/(e-t),d=(n+s)/(n-s);let p,g;if(o===On)p=-(a+r)/(a-r),g=-2*a*r/(a-r);else if(o===$r)p=-a/(a-r),g=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=u,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,s,r,a,o=On){const l=this.elements,c=1/(e-t),u=1/(n-s),h=1/(a-r),d=(e+t)*c,p=(n+s)*u;let g,_;if(o===On)g=(a+r)*h,_=-2*h;else if(o===$r)g=r*h,_=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*u,l[9]=0,l[13]=-p,l[2]=0,l[6]=0,l[10]=_,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}const ki=new O,mn=new ge,ff=new O(0,0,0),df=new O(1,1,1),Kn=new O,hr=new O,Ke=new O,kl=new ge,Hl=new qs;class Hn{constructor(t=0,e=0,n=0,s=Hn.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const s=t.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],u=s[9],h=s[2],d=s[6],p=s[10];switch(e){case"XYZ":this._y=Math.asin(Ye(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ye(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(Ye(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,p),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Ye(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Ye(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-Ye(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return kl.makeRotationFromQuaternion(t),this.setFromRotationMatrix(kl,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Hl.setFromEuler(this),this.setFromQuaternion(Hl,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Hn.DEFAULT_ORDER="XYZ";class Mh{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let pf=0;const Gl=new O,Hi=new qs,Cn=new ge,ur=new O,As=new O,mf=new O,gf=new qs,Vl=new O(1,0,0),Wl=new O(0,1,0),Xl=new O(0,0,1),ql={type:"added"},_f={type:"removed"},Gi={type:"childadded",child:null},xa={type:"childremoved",child:null};class Ve extends ps{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:pf++}),this.uuid=Xs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Ve.DEFAULT_UP.clone();const t=new O,e=new Hn,n=new qs,s=new O(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ge},normalMatrix:{value:new Bt}}),this.matrix=new ge,this.matrixWorld=new ge,this.matrixAutoUpdate=Ve.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Ve.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Mh,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Hi.setFromAxisAngle(t,e),this.quaternion.multiply(Hi),this}rotateOnWorldAxis(t,e){return Hi.setFromAxisAngle(t,e),this.quaternion.premultiply(Hi),this}rotateX(t){return this.rotateOnAxis(Vl,t)}rotateY(t){return this.rotateOnAxis(Wl,t)}rotateZ(t){return this.rotateOnAxis(Xl,t)}translateOnAxis(t,e){return Gl.copy(t).applyQuaternion(this.quaternion),this.position.add(Gl.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Vl,t)}translateY(t){return this.translateOnAxis(Wl,t)}translateZ(t){return this.translateOnAxis(Xl,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Cn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?ur.copy(t):ur.set(t,e,n);const s=this.parent;this.updateWorldMatrix(!0,!1),As.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Cn.lookAt(As,ur,this.up):Cn.lookAt(ur,As,this.up),this.quaternion.setFromRotationMatrix(Cn),s&&(Cn.extractRotation(s.matrixWorld),Hi.setFromRotationMatrix(Cn),this.quaternion.premultiply(Hi.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(ql),Gi.child=t,this.dispatchEvent(Gi),Gi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(_f),xa.child=t,this.dispatchEvent(xa),xa.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Cn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Cn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Cn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(ql),Gi.child=t,this.dispatchEvent(Gi),Gi.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){const a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(As,t,mf),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(As,gf,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){const n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const h=l[c];r(t.shapes,h)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];s.animations.push(r(t.animations,l))}}if(e){const o=a(t.geometries),l=a(t.materials),c=a(t.textures),u=a(t.images),h=a(t.shapes),d=a(t.skeletons),p=a(t.animations),g=a(t.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),d.length>0&&(n.skeletons=d),p.length>0&&(n.animations=p),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){const l=[];for(const c in o){const u=o[c];delete u.metadata,l.push(u)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const s=t.children[n];this.add(s.clone())}return this}}Ve.DEFAULT_UP=new O(0,1,0);Ve.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ve.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const gn=new O,Ln=new O,Ma=new O,Pn=new O,Vi=new O,Wi=new O,Yl=new O,Sa=new O,ya=new O,Ea=new O,Ta=new Me,ba=new Me,Aa=new Me;class ln{constructor(t=new O,e=new O,n=new O){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),gn.subVectors(t,e),s.cross(gn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){gn.subVectors(s,e),Ln.subVectors(n,e),Ma.subVectors(t,e);const a=gn.dot(gn),o=gn.dot(Ln),l=gn.dot(Ma),c=Ln.dot(Ln),u=Ln.dot(Ma),h=a*c-o*o;if(h===0)return r.set(0,0,0),null;const d=1/h,p=(c*l-o*u)*d,g=(a*u-o*l)*d;return r.set(1-p-g,g,p)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,Pn)===null?!1:Pn.x>=0&&Pn.y>=0&&Pn.x+Pn.y<=1}static getInterpolation(t,e,n,s,r,a,o,l){return this.getBarycoord(t,e,n,s,Pn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Pn.x),l.addScaledVector(a,Pn.y),l.addScaledVector(o,Pn.z),l)}static getInterpolatedAttribute(t,e,n,s,r,a){return Ta.setScalar(0),ba.setScalar(0),Aa.setScalar(0),Ta.fromBufferAttribute(t,e),ba.fromBufferAttribute(t,n),Aa.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(Ta,r.x),a.addScaledVector(ba,r.y),a.addScaledVector(Aa,r.z),a}static isFrontFacing(t,e,n,s){return gn.subVectors(n,e),Ln.subVectors(t,e),gn.cross(Ln).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return gn.subVectors(this.c,this.b),Ln.subVectors(this.a,this.b),gn.cross(Ln).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return ln.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return ln.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return ln.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return ln.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return ln.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,s=this.b,r=this.c;let a,o;Vi.subVectors(s,n),Wi.subVectors(r,n),Sa.subVectors(t,n);const l=Vi.dot(Sa),c=Wi.dot(Sa);if(l<=0&&c<=0)return e.copy(n);ya.subVectors(t,s);const u=Vi.dot(ya),h=Wi.dot(ya);if(u>=0&&h<=u)return e.copy(s);const d=l*h-u*c;if(d<=0&&l>=0&&u<=0)return a=l/(l-u),e.copy(n).addScaledVector(Vi,a);Ea.subVectors(t,r);const p=Vi.dot(Ea),g=Wi.dot(Ea);if(g>=0&&p<=g)return e.copy(r);const _=p*c-l*g;if(_<=0&&c>=0&&g<=0)return o=c/(c-g),e.copy(n).addScaledVector(Wi,o);const m=u*g-p*h;if(m<=0&&h-u>=0&&p-g>=0)return Yl.subVectors(r,s),o=(h-u)/(h-u+(p-g)),e.copy(s).addScaledVector(Yl,o);const f=1/(m+_+d);return a=_*f,o=d*f,e.copy(n).addScaledVector(Vi,a).addScaledVector(Wi,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const Sh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Zn={h:0,s:0,l:0},fr={h:0,s:0,l:0};function wa(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}class Jt{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=sn){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Kt.toWorkingColorSpace(this,e),this}setRGB(t,e,n,s=Kt.workingColorSpace){return this.r=t,this.g=e,this.b=n,Kt.toWorkingColorSpace(this,s),this}setHSL(t,e,n,s=Kt.workingColorSpace){if(t=tf(t,1),e=Ye(e,0,1),n=Ye(n,0,1),e===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=wa(a,r,t+1/3),this.g=wa(a,r,t),this.b=wa(a,r,t-1/3)}return Kt.toWorkingColorSpace(this,s),this}setStyle(t,e=sn){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=sn){const n=Sh[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Fn(t.r),this.g=Fn(t.g),this.b=Fn(t.b),this}copyLinearToSRGB(t){return this.r=es(t.r),this.g=es(t.g),this.b=es(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=sn){return Kt.fromWorkingColorSpace(Oe.copy(this),t),Math.round(Ye(Oe.r*255,0,255))*65536+Math.round(Ye(Oe.g*255,0,255))*256+Math.round(Ye(Oe.b*255,0,255))}getHexString(t=sn){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=Kt.workingColorSpace){Kt.fromWorkingColorSpace(Oe.copy(this),e);const n=Oe.r,s=Oe.g,r=Oe.b,a=Math.max(n,s,r),o=Math.min(n,s,r);let l,c;const u=(o+a)/2;if(o===a)l=0,c=0;else{const h=a-o;switch(c=u<=.5?h/(a+o):h/(2-a-o),a){case n:l=(s-r)/h+(s<r?6:0);break;case s:l=(r-n)/h+2;break;case r:l=(n-s)/h+4;break}l/=6}return t.h=l,t.s=c,t.l=u,t}getRGB(t,e=Kt.workingColorSpace){return Kt.fromWorkingColorSpace(Oe.copy(this),e),t.r=Oe.r,t.g=Oe.g,t.b=Oe.b,t}getStyle(t=sn){Kt.fromWorkingColorSpace(Oe.copy(this),t);const e=Oe.r,n=Oe.g,s=Oe.b;return t!==sn?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(Zn),this.setHSL(Zn.h+t,Zn.s+e,Zn.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Zn),t.getHSL(fr);const n=ha(Zn.h,fr.h,e),s=ha(Zn.s,fr.s,e),r=ha(Zn.l,fr.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Oe=new Jt;Jt.NAMES=Sh;let vf=0;class gs extends ps{static get type(){return"Material"}get type(){return this.constructor.type}set type(t){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:vf++}),this.uuid=Xs(),this.name="",this.blending=Qi,this.side=zn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Za,this.blendDst=ja,this.blendEquation=Ei,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Jt(0,0,0),this.blendAlpha=0,this.depthFunc=as,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Ll,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ni,this.stencilZFail=Ni,this.stencilZPass=Ni,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Qi&&(n.blending=this.blending),this.side!==zn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Za&&(n.blendSrc=this.blendSrc),this.blendDst!==ja&&(n.blendDst=this.blendDst),this.blendEquation!==Ei&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==as&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Ll&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ni&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Ni&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Ni&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(e){const r=s(t.textures),a=s(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class ns extends gs{static get type(){return"MeshBasicMaterial"}constructor(t){super(),this.isMeshBasicMaterial=!0,this.color=new Jt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Hn,this.combine=sh,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const Se=new O,dr=new ne;class be{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=Pl,this.updateRanges=[],this.gpuType=Nn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)dr.fromBufferAttribute(this,e),dr.applyMatrix3(t),this.setXY(e,dr.x,dr.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Se.fromBufferAttribute(this,e),Se.applyMatrix3(t),this.setXYZ(e,Se.x,Se.y,Se.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Se.fromBufferAttribute(this,e),Se.applyMatrix4(t),this.setXYZ(e,Se.x,Se.y,Se.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Se.fromBufferAttribute(this,e),Se.applyNormalMatrix(t),this.setXYZ(e,Se.x,Se.y,Se.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Se.fromBufferAttribute(this,e),Se.transformDirection(t),this.setXYZ(e,Se.x,Se.y,Se.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=Es(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=qe(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Es(e,this.array)),e}setX(t,e){return this.normalized&&(e=qe(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Es(e,this.array)),e}setY(t,e){return this.normalized&&(e=qe(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Es(e,this.array)),e}setZ(t,e){return this.normalized&&(e=qe(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Es(e,this.array)),e}setW(t,e){return this.normalized&&(e=qe(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=qe(e,this.array),n=qe(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=qe(e,this.array),n=qe(n,this.array),s=qe(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=qe(e,this.array),n=qe(n,this.array),s=qe(s,this.array),r=qe(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==Pl&&(t.usage=this.usage),t}}class yh extends be{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class Eh extends be{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class We extends be{constructor(t,e,n){super(new Float32Array(t),e,n)}}let xf=0;const nn=new ge,Ra=new Ve,Xi=new O,Ze=new Ys,ws=new Ys,Re=new O;class De extends ps{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:xf++}),this.uuid=Xs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(_h(t)?Eh:yh)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Bt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return nn.makeRotationFromQuaternion(t),this.applyMatrix4(nn),this}rotateX(t){return nn.makeRotationX(t),this.applyMatrix4(nn),this}rotateY(t){return nn.makeRotationY(t),this.applyMatrix4(nn),this}rotateZ(t){return nn.makeRotationZ(t),this.applyMatrix4(nn),this}translate(t,e,n){return nn.makeTranslation(t,e,n),this.applyMatrix4(nn),this}scale(t,e,n){return nn.makeScale(t,e,n),this.applyMatrix4(nn),this}lookAt(t){return Ra.lookAt(t),Ra.updateMatrix(),this.applyMatrix4(Ra.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Xi).negate(),this.translate(Xi.x,Xi.y,Xi.z),this}setFromPoints(t){const e=this.getAttribute("position");if(e===void 0){const n=[];for(let s=0,r=t.length;s<r;s++){const a=t[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new We(n,3))}else{for(let n=0,s=e.count;n<s;n++){const r=t[n];e.setXYZ(n,r.x,r.y,r.z||0)}t.length>e.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ys);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new O(-1/0,-1/0,-1/0),new O(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){const r=e[n];Ze.setFromBufferAttribute(r),this.morphTargetsRelative?(Re.addVectors(this.boundingBox.min,Ze.min),this.boundingBox.expandByPoint(Re),Re.addVectors(this.boundingBox.max,Ze.max),this.boundingBox.expandByPoint(Re)):(this.boundingBox.expandByPoint(Ze.min),this.boundingBox.expandByPoint(Ze.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ms);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new O,1/0);return}if(t){const n=this.boundingSphere.center;if(Ze.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){const o=e[r];ws.setFromBufferAttribute(o),this.morphTargetsRelative?(Re.addVectors(Ze.min,ws.min),Ze.expandByPoint(Re),Re.addVectors(Ze.max,ws.max),Ze.expandByPoint(Re)):(Ze.expandByPoint(ws.min),Ze.expandByPoint(ws.max))}Ze.getCenter(n);let s=0;for(let r=0,a=t.count;r<a;r++)Re.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(Re));if(e)for(let r=0,a=e.length;r<a;r++){const o=e[r],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)Re.fromBufferAttribute(o,c),l&&(Xi.fromBufferAttribute(t,c),Re.add(Xi)),s=Math.max(s,n.distanceToSquared(Re))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new be(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let C=0;C<n.count;C++)o[C]=new O,l[C]=new O;const c=new O,u=new O,h=new O,d=new ne,p=new ne,g=new ne,_=new O,m=new O;function f(C,T,S){c.fromBufferAttribute(n,C),u.fromBufferAttribute(n,T),h.fromBufferAttribute(n,S),d.fromBufferAttribute(r,C),p.fromBufferAttribute(r,T),g.fromBufferAttribute(r,S),u.sub(c),h.sub(c),p.sub(d),g.sub(d);const L=1/(p.x*g.y-g.x*p.y);isFinite(L)&&(_.copy(u).multiplyScalar(g.y).addScaledVector(h,-p.y).multiplyScalar(L),m.copy(h).multiplyScalar(p.x).addScaledVector(u,-g.x).multiplyScalar(L),o[C].add(_),o[T].add(_),o[S].add(_),l[C].add(m),l[T].add(m),l[S].add(m))}let x=this.groups;x.length===0&&(x=[{start:0,count:t.count}]);for(let C=0,T=x.length;C<T;++C){const S=x[C],L=S.start,q=S.count;for(let B=L,Z=L+q;B<Z;B+=3)f(t.getX(B+0),t.getX(B+1),t.getX(B+2))}const E=new O,y=new O,D=new O,R=new O;function w(C){D.fromBufferAttribute(s,C),R.copy(D);const T=o[C];E.copy(T),E.sub(D.multiplyScalar(D.dot(T))).normalize(),y.crossVectors(R,T);const L=y.dot(l[C])<0?-1:1;a.setXYZW(C,E.x,E.y,E.z,L)}for(let C=0,T=x.length;C<T;++C){const S=x[C],L=S.start,q=S.count;for(let B=L,Z=L+q;B<Z;B+=3)w(t.getX(B+0)),w(t.getX(B+1)),w(t.getX(B+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new be(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let d=0,p=n.count;d<p;d++)n.setXYZ(d,0,0,0);const s=new O,r=new O,a=new O,o=new O,l=new O,c=new O,u=new O,h=new O;if(t)for(let d=0,p=t.count;d<p;d+=3){const g=t.getX(d+0),_=t.getX(d+1),m=t.getX(d+2);s.fromBufferAttribute(e,g),r.fromBufferAttribute(e,_),a.fromBufferAttribute(e,m),u.subVectors(a,r),h.subVectors(s,r),u.cross(h),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),o.add(u),l.add(u),c.add(u),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,p=e.count;d<p;d+=3)s.fromBufferAttribute(e,d+0),r.fromBufferAttribute(e,d+1),a.fromBufferAttribute(e,d+2),u.subVectors(a,r),h.subVectors(s,r),u.cross(h),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Re.fromBufferAttribute(t,e),Re.normalize(),t.setXYZ(e,Re.x,Re.y,Re.z)}toNonIndexed(){function t(o,l){const c=o.array,u=o.itemSize,h=o.normalized,d=new c.constructor(l.length*u);let p=0,g=0;for(let _=0,m=l.length;_<m;_++){o.isInterleavedBufferAttribute?p=l[_]*o.data.stride+o.offset:p=l[_]*u;for(let f=0;f<u;f++)d[g++]=c[p++]}return new be(d,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new De,n=this.index.array,s=this.attributes;for(const o in s){const l=s[o],c=t(l,n);e.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let u=0,h=c.length;u<h;u++){const d=c[u],p=t(d,n);l.push(p)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const l in n){const c=n[l];t.data.attributes[l]=c.toJSON(t.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let h=0,d=c.length;h<d;h++){const p=c[h];u.push(p.toJSON(t.data))}u.length>0&&(s[l]=u,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(t.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone(e));const s=t.attributes;for(const c in s){const u=s[c];this.setAttribute(c,u.clone(e))}const r=t.morphAttributes;for(const c in r){const u=[],h=r[c];for(let d=0,p=h.length;d<p;d++)u.push(h[d].clone(e));this.morphAttributes[c]=u}this.morphTargetsRelative=t.morphTargetsRelative;const a=t.groups;for(let c=0,u=a.length;c<u;c++){const h=a[c];this.addGroup(h.start,h.count,h.materialIndex)}const o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const $l=new ge,gi=new il,pr=new ms,Kl=new O,mr=new O,gr=new O,_r=new O,Ca=new O,vr=new O,Zl=new O,xr=new O;class Le extends Ve{constructor(t=new De,e=new ns){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(s,t);const o=this.morphTargetInfluences;if(r&&o){vr.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const u=o[l],h=r[l];u!==0&&(Ca.fromBufferAttribute(h,t),a?vr.addScaledVector(Ca,u):vr.addScaledVector(Ca.sub(e),u))}e.add(vr)}return e}raycast(t,e){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),pr.copy(n.boundingSphere),pr.applyMatrix4(r),gi.copy(t.ray).recast(t.near),!(pr.containsPoint(gi.origin)===!1&&(gi.intersectSphere(pr,Kl)===null||gi.origin.distanceToSquared(Kl)>(t.far-t.near)**2))&&($l.copy(r).invert(),gi.copy(t.ray).applyMatrix4($l),!(n.boundingBox!==null&&gi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,gi)))}_computeIntersections(t,e,n){let s;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,d=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,_=d.length;g<_;g++){const m=d[g],f=a[m.materialIndex],x=Math.max(m.start,p.start),E=Math.min(o.count,Math.min(m.start+m.count,p.start+p.count));for(let y=x,D=E;y<D;y+=3){const R=o.getX(y),w=o.getX(y+1),C=o.getX(y+2);s=Mr(this,f,t,n,c,u,h,R,w,C),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const g=Math.max(0,p.start),_=Math.min(o.count,p.start+p.count);for(let m=g,f=_;m<f;m+=3){const x=o.getX(m),E=o.getX(m+1),y=o.getX(m+2);s=Mr(this,a,t,n,c,u,h,x,E,y),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,_=d.length;g<_;g++){const m=d[g],f=a[m.materialIndex],x=Math.max(m.start,p.start),E=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let y=x,D=E;y<D;y+=3){const R=y,w=y+1,C=y+2;s=Mr(this,f,t,n,c,u,h,R,w,C),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const g=Math.max(0,p.start),_=Math.min(l.count,p.start+p.count);for(let m=g,f=_;m<f;m+=3){const x=m,E=m+1,y=m+2;s=Mr(this,a,t,n,c,u,h,x,E,y),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}}function Mf(i,t,e,n,s,r,a,o){let l;if(t.side===He?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,t.side===zn,o),l===null)return null;xr.copy(o),xr.applyMatrix4(i.matrixWorld);const c=e.ray.origin.distanceTo(xr);return c<e.near||c>e.far?null:{distance:c,point:xr.clone(),object:i}}function Mr(i,t,e,n,s,r,a,o,l,c){i.getVertexPosition(o,mr),i.getVertexPosition(l,gr),i.getVertexPosition(c,_r);const u=Mf(i,t,e,n,mr,gr,_r,Zl);if(u){const h=new O;ln.getBarycoord(Zl,mr,gr,_r,h),s&&(u.uv=ln.getInterpolatedAttribute(s,o,l,c,h,new ne)),r&&(u.uv1=ln.getInterpolatedAttribute(r,o,l,c,h,new ne)),a&&(u.normal=ln.getInterpolatedAttribute(a,o,l,c,h,new O),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const d={a:o,b:l,c,normal:new O,materialIndex:0};ln.getNormal(mr,gr,_r,d.normal),u.face=d,u.barycoord=h}return u}class ui extends De{constructor(t=1,e=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],u=[],h=[];let d=0,p=0;g("z","y","x",-1,-1,n,e,t,a,r,0),g("z","y","x",1,-1,n,e,-t,a,r,1),g("x","z","y",1,1,t,n,e,s,a,2),g("x","z","y",1,-1,t,n,-e,s,a,3),g("x","y","z",1,-1,t,e,n,s,r,4),g("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new We(c,3)),this.setAttribute("normal",new We(u,3)),this.setAttribute("uv",new We(h,2));function g(_,m,f,x,E,y,D,R,w,C,T){const S=y/w,L=D/C,q=y/2,B=D/2,Z=R/2,X=w+1,$=C+1;let Q=0,G=0;const ot=new O;for(let dt=0;dt<$;dt++){const yt=dt*L-B;for(let zt=0;zt<X;zt++){const Qt=zt*S-q;ot[_]=Qt*x,ot[m]=yt*E,ot[f]=Z,c.push(ot.x,ot.y,ot.z),ot[_]=0,ot[m]=0,ot[f]=R>0?1:-1,u.push(ot.x,ot.y,ot.z),h.push(zt/w),h.push(1-dt/C),Q+=1}}for(let dt=0;dt<C;dt++)for(let yt=0;yt<w;yt++){const zt=d+yt+X*dt,Qt=d+yt+X*(dt+1),Y=d+(yt+1)+X*(dt+1),nt=d+(yt+1)+X*dt;l.push(zt,Qt,nt),l.push(Qt,Y,nt),G+=6}o.addGroup(p,G,T),p+=G,d+=Q}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ui(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function us(i){const t={};for(const e in i){t[e]={};for(const n in i[e]){const s=i[e][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone():Array.isArray(s)?t[e][n]=s.slice():t[e][n]=s}}return t}function ze(i){const t={};for(let e=0;e<i.length;e++){const n=us(i[e]);for(const s in n)t[s]=n[s]}return t}function Sf(i){const t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Th(i){const t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Kt.workingColorSpace}const yf={clone:us,merge:ze};var Ef=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Tf=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class vn extends gs{static get type(){return"ShaderMaterial"}constructor(t){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Ef,this.fragmentShader=Tf,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=us(t.uniforms),this.uniformsGroups=Sf(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}}class bh extends Ve{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ge,this.projectionMatrix=new ge,this.projectionMatrixInverse=new ge,this.coordinateSystem=On}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const jn=new O,jl=new ne,Jl=new ne;class rn extends bh{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=No*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(Hr*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return No*2*Math.atan(Math.tan(Hr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){jn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(jn.x,jn.y).multiplyScalar(-t/jn.z),jn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(jn.x,jn.y).multiplyScalar(-t/jn.z)}getViewSize(t,e){return this.getViewBounds(t,jl,Jl),e.subVectors(Jl,jl)}setViewOffset(t,e,n,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(Hr*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,e-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const qi=-90,Yi=1;class bf extends Ve{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new rn(qi,Yi,t,e);s.layers=this.layers,this.add(s);const r=new rn(qi,Yi,t,e);r.layers=this.layers,this.add(r);const a=new rn(qi,Yi,t,e);a.layers=this.layers,this.add(a);const o=new rn(qi,Yi,t,e);o.layers=this.layers,this.add(o);const l=new rn(qi,Yi,t,e);l.layers=this.layers,this.add(l);const c=new rn(qi,Yi,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,s,r,a,o,l]=e;for(const c of e)this.remove(c);if(t===On)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===$r)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,u]=this.children,h=t.getRenderTarget(),d=t.getActiveCubeFace(),p=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;const _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,s),t.render(e,r),t.setRenderTarget(n,1,s),t.render(e,a),t.setRenderTarget(n,2,s),t.render(e,o),t.setRenderTarget(n,3,s),t.render(e,l),t.setRenderTarget(n,4,s),t.render(e,c),n.texture.generateMipmaps=_,t.setRenderTarget(n,5,s),t.render(e,u),t.setRenderTarget(h,d,p),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class Ah extends Fe{constructor(t,e,n,s,r,a,o,l,c,u){t=t!==void 0?t:[],e=e!==void 0?e:os,super(t,e,n,s,r,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class Af extends Li{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new Ah(s,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:je}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new ui(5,5,5),r=new vn({name:"CubemapFromEquirect",uniforms:us(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:He,blending:oi});r.uniforms.tEquirect.value=e;const a=new Le(s,r),o=e.minFilter;return e.minFilter===Tn&&(e.minFilter=je),new bf(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e,n,s){const r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,s);t.setRenderTarget(r)}}const La=new O,wf=new O,Rf=new Bt;class Si{constructor(t=new O(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const s=La.subVectors(n,e).cross(wf.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const n=t.delta(La),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||Rf.getNormalMatrix(t),s=this.coplanarPoint(La).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const _i=new ms,Sr=new O;class wh{constructor(t=new Si,e=new Si,n=new Si,s=new Si,r=new Si,a=new Si){this.planes=[t,e,n,s,r,a]}set(t,e,n,s,r,a){const o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=On){const n=this.planes,s=t.elements,r=s[0],a=s[1],o=s[2],l=s[3],c=s[4],u=s[5],h=s[6],d=s[7],p=s[8],g=s[9],_=s[10],m=s[11],f=s[12],x=s[13],E=s[14],y=s[15];if(n[0].setComponents(l-r,d-c,m-p,y-f).normalize(),n[1].setComponents(l+r,d+c,m+p,y+f).normalize(),n[2].setComponents(l+a,d+u,m+g,y+x).normalize(),n[3].setComponents(l-a,d-u,m-g,y-x).normalize(),n[4].setComponents(l-o,d-h,m-_,y-E).normalize(),e===On)n[5].setComponents(l+o,d+h,m+_,y+E).normalize();else if(e===$r)n[5].setComponents(o,h,_,E).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),_i.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),_i.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(_i)}intersectsSprite(t){return _i.center.set(0,0,0),_i.radius=.7071067811865476,_i.applyMatrix4(t.matrixWorld),this.intersectsSphere(_i)}intersectsSphere(t){const e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const s=e[n];if(Sr.x=s.normal.x>0?t.max.x:t.min.x,Sr.y=s.normal.y>0?t.max.y:t.min.y,Sr.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(Sr)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Rh(){let i=null,t=!1,e=null,n=null;function s(r,a){e(r,a),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Cf(i){const t=new WeakMap;function e(o,l){const c=o.array,u=o.usage,h=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,u),o.onUploadCallback();let p;if(c instanceof Float32Array)p=i.FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=i.SHORT;else if(c instanceof Uint32Array)p=i.UNSIGNED_INT;else if(c instanceof Int32Array)p=i.INT;else if(c instanceof Int8Array)p=i.BYTE;else if(c instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:h}}function n(o,l,c){const u=l.array,h=l.updateRanges;if(i.bindBuffer(c,o),h.length===0)i.bufferSubData(c,0,u);else{h.sort((p,g)=>p.start-g.start);let d=0;for(let p=1;p<h.length;p++){const g=h[d],_=h[p];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++d,h[d]=_)}h.length=d+1;for(let p=0,g=h.length;p<g;p++){const _=h[p];i.bufferSubData(c,_.start*u.BYTES_PER_ELEMENT,u,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=t.get(o);l&&(i.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const u=t.get(o);(!u||u.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}class wi extends De{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};const r=t/2,a=e/2,o=Math.floor(n),l=Math.floor(s),c=o+1,u=l+1,h=t/o,d=e/l,p=[],g=[],_=[],m=[];for(let f=0;f<u;f++){const x=f*d-a;for(let E=0;E<c;E++){const y=E*h-r;g.push(y,-x,0),_.push(0,0,1),m.push(E/o),m.push(1-f/l)}}for(let f=0;f<l;f++)for(let x=0;x<o;x++){const E=x+c*f,y=x+c*(f+1),D=x+1+c*(f+1),R=x+1+c*f;p.push(E,y,R),p.push(y,D,R)}this.setIndex(p),this.setAttribute("position",new We(g,3)),this.setAttribute("normal",new We(_,3)),this.setAttribute("uv",new We(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new wi(t.width,t.height,t.widthSegments,t.heightSegments)}}var Lf=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Pf=`#ifdef USE_ALPHAHASH
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
#endif`,Df=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,If=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Uf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Nf=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Of=`#ifdef USE_AOMAP
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
#endif`,Ff=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Bf=`#ifdef USE_BATCHING
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
#endif`,zf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,kf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Hf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Gf=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Vf=`#ifdef USE_IRIDESCENCE
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
#endif`,Wf=`#ifdef USE_BUMPMAP
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
#endif`,Xf=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,qf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Yf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,$f=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Kf=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Zf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,jf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Jf=`#if defined( USE_COLOR_ALPHA )
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
#endif`,Qf=`#define PI 3.141592653589793
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
} // validated`,td=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,ed=`vec3 transformedNormal = objectNormal;
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
#endif`,nd=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,id=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,sd=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,rd=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,ad="gl_FragColor = linearToOutputTexel( gl_FragColor );",od=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,ld=`#ifdef USE_ENVMAP
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
#endif`,cd=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,hd=`#ifdef USE_ENVMAP
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
#endif`,ud=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,fd=`#ifdef USE_ENVMAP
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
#endif`,dd=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,pd=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,md=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,gd=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,_d=`#ifdef USE_GRADIENTMAP
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
}`,vd=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,xd=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Md=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Sd=`uniform bool receiveShadow;
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
#endif`,yd=`#ifdef USE_ENVMAP
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
#endif`,Ed=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Td=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,bd=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Ad=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,wd=`PhysicalMaterial material;
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
#endif`,Rd=`struct PhysicalMaterial {
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
}`,Cd=`
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
#endif`,Ld=`#if defined( RE_IndirectDiffuse )
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
#endif`,Pd=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Dd=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Id=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ud=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Nd=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Od=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Fd=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Bd=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,zd=`#if defined( USE_POINTS_UV )
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
#endif`,kd=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Hd=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Gd=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Vd=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Wd=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Xd=`#ifdef USE_MORPHTARGETS
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
#endif`,qd=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Yd=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,$d=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Kd=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Zd=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,jd=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Jd=`#ifdef USE_NORMALMAP
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
#endif`,Qd=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,tp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,ep=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,np=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,ip=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,sp=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,rp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,ap=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,op=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,lp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,cp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,hp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,up=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,fp=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,dp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,pp=`float getShadowMask() {
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
}`,mp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,gp=`#ifdef USE_SKINNING
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
#endif`,_p=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,vp=`#ifdef USE_SKINNING
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
#endif`,xp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Mp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Sp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,yp=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Ep=`#ifdef USE_TRANSMISSION
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
#endif`,Tp=`#ifdef USE_TRANSMISSION
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
#endif`,bp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Ap=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,wp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Rp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Cp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Lp=`uniform sampler2D t2D;
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
}`,Pp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Dp=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Ip=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Up=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Np=`#include <common>
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
}`,Op=`#if DEPTH_PACKING == 3200
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
}`,Fp=`#define DISTANCE
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
}`,Bp=`#define DISTANCE
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
}`,zp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,kp=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Hp=`uniform float scale;
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
}`,Gp=`uniform vec3 diffuse;
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
}`,Vp=`#include <common>
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
}`,Wp=`uniform vec3 diffuse;
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
}`,Xp=`#define LAMBERT
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
}`,qp=`#define LAMBERT
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
}`,Yp=`#define MATCAP
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
}`,$p=`#define MATCAP
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
}`,Kp=`#define NORMAL
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
}`,Zp=`#define NORMAL
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
}`,jp=`#define PHONG
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
}`,Jp=`#define PHONG
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
}`,Qp=`#define STANDARD
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
}`,tm=`#define STANDARD
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
}`,em=`#define TOON
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
}`,nm=`#define TOON
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
}`,im=`uniform float size;
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
}`,sm=`uniform vec3 diffuse;
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
}`,rm=`#include <common>
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
}`,am=`uniform vec3 color;
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
}`,om=`uniform float rotation;
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
}`,lm=`uniform vec3 diffuse;
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
}`,Gt={alphahash_fragment:Lf,alphahash_pars_fragment:Pf,alphamap_fragment:Df,alphamap_pars_fragment:If,alphatest_fragment:Uf,alphatest_pars_fragment:Nf,aomap_fragment:Of,aomap_pars_fragment:Ff,batching_pars_vertex:Bf,batching_vertex:zf,begin_vertex:kf,beginnormal_vertex:Hf,bsdfs:Gf,iridescence_fragment:Vf,bumpmap_pars_fragment:Wf,clipping_planes_fragment:Xf,clipping_planes_pars_fragment:qf,clipping_planes_pars_vertex:Yf,clipping_planes_vertex:$f,color_fragment:Kf,color_pars_fragment:Zf,color_pars_vertex:jf,color_vertex:Jf,common:Qf,cube_uv_reflection_fragment:td,defaultnormal_vertex:ed,displacementmap_pars_vertex:nd,displacementmap_vertex:id,emissivemap_fragment:sd,emissivemap_pars_fragment:rd,colorspace_fragment:ad,colorspace_pars_fragment:od,envmap_fragment:ld,envmap_common_pars_fragment:cd,envmap_pars_fragment:hd,envmap_pars_vertex:ud,envmap_physical_pars_fragment:yd,envmap_vertex:fd,fog_vertex:dd,fog_pars_vertex:pd,fog_fragment:md,fog_pars_fragment:gd,gradientmap_pars_fragment:_d,lightmap_pars_fragment:vd,lights_lambert_fragment:xd,lights_lambert_pars_fragment:Md,lights_pars_begin:Sd,lights_toon_fragment:Ed,lights_toon_pars_fragment:Td,lights_phong_fragment:bd,lights_phong_pars_fragment:Ad,lights_physical_fragment:wd,lights_physical_pars_fragment:Rd,lights_fragment_begin:Cd,lights_fragment_maps:Ld,lights_fragment_end:Pd,logdepthbuf_fragment:Dd,logdepthbuf_pars_fragment:Id,logdepthbuf_pars_vertex:Ud,logdepthbuf_vertex:Nd,map_fragment:Od,map_pars_fragment:Fd,map_particle_fragment:Bd,map_particle_pars_fragment:zd,metalnessmap_fragment:kd,metalnessmap_pars_fragment:Hd,morphinstance_vertex:Gd,morphcolor_vertex:Vd,morphnormal_vertex:Wd,morphtarget_pars_vertex:Xd,morphtarget_vertex:qd,normal_fragment_begin:Yd,normal_fragment_maps:$d,normal_pars_fragment:Kd,normal_pars_vertex:Zd,normal_vertex:jd,normalmap_pars_fragment:Jd,clearcoat_normal_fragment_begin:Qd,clearcoat_normal_fragment_maps:tp,clearcoat_pars_fragment:ep,iridescence_pars_fragment:np,opaque_fragment:ip,packing:sp,premultiplied_alpha_fragment:rp,project_vertex:ap,dithering_fragment:op,dithering_pars_fragment:lp,roughnessmap_fragment:cp,roughnessmap_pars_fragment:hp,shadowmap_pars_fragment:up,shadowmap_pars_vertex:fp,shadowmap_vertex:dp,shadowmask_pars_fragment:pp,skinbase_vertex:mp,skinning_pars_vertex:gp,skinning_vertex:_p,skinnormal_vertex:vp,specularmap_fragment:xp,specularmap_pars_fragment:Mp,tonemapping_fragment:Sp,tonemapping_pars_fragment:yp,transmission_fragment:Ep,transmission_pars_fragment:Tp,uv_pars_fragment:bp,uv_pars_vertex:Ap,uv_vertex:wp,worldpos_vertex:Rp,background_vert:Cp,background_frag:Lp,backgroundCube_vert:Pp,backgroundCube_frag:Dp,cube_vert:Ip,cube_frag:Up,depth_vert:Np,depth_frag:Op,distanceRGBA_vert:Fp,distanceRGBA_frag:Bp,equirect_vert:zp,equirect_frag:kp,linedashed_vert:Hp,linedashed_frag:Gp,meshbasic_vert:Vp,meshbasic_frag:Wp,meshlambert_vert:Xp,meshlambert_frag:qp,meshmatcap_vert:Yp,meshmatcap_frag:$p,meshnormal_vert:Kp,meshnormal_frag:Zp,meshphong_vert:jp,meshphong_frag:Jp,meshphysical_vert:Qp,meshphysical_frag:tm,meshtoon_vert:em,meshtoon_frag:nm,points_vert:im,points_frag:sm,shadow_vert:rm,shadow_frag:am,sprite_vert:om,sprite_frag:lm},at={common:{diffuse:{value:new Jt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Bt},alphaMap:{value:null},alphaMapTransform:{value:new Bt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Bt}},envmap:{envMap:{value:null},envMapRotation:{value:new Bt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Bt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Bt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Bt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Bt},normalScale:{value:new ne(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Bt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Bt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Bt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Bt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Jt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Jt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Bt},alphaTest:{value:0},uvTransform:{value:new Bt}},sprite:{diffuse:{value:new Jt(16777215)},opacity:{value:1},center:{value:new ne(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Bt},alphaMap:{value:null},alphaMapTransform:{value:new Bt},alphaTest:{value:0}}},En={basic:{uniforms:ze([at.common,at.specularmap,at.envmap,at.aomap,at.lightmap,at.fog]),vertexShader:Gt.meshbasic_vert,fragmentShader:Gt.meshbasic_frag},lambert:{uniforms:ze([at.common,at.specularmap,at.envmap,at.aomap,at.lightmap,at.emissivemap,at.bumpmap,at.normalmap,at.displacementmap,at.fog,at.lights,{emissive:{value:new Jt(0)}}]),vertexShader:Gt.meshlambert_vert,fragmentShader:Gt.meshlambert_frag},phong:{uniforms:ze([at.common,at.specularmap,at.envmap,at.aomap,at.lightmap,at.emissivemap,at.bumpmap,at.normalmap,at.displacementmap,at.fog,at.lights,{emissive:{value:new Jt(0)},specular:{value:new Jt(1118481)},shininess:{value:30}}]),vertexShader:Gt.meshphong_vert,fragmentShader:Gt.meshphong_frag},standard:{uniforms:ze([at.common,at.envmap,at.aomap,at.lightmap,at.emissivemap,at.bumpmap,at.normalmap,at.displacementmap,at.roughnessmap,at.metalnessmap,at.fog,at.lights,{emissive:{value:new Jt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Gt.meshphysical_vert,fragmentShader:Gt.meshphysical_frag},toon:{uniforms:ze([at.common,at.aomap,at.lightmap,at.emissivemap,at.bumpmap,at.normalmap,at.displacementmap,at.gradientmap,at.fog,at.lights,{emissive:{value:new Jt(0)}}]),vertexShader:Gt.meshtoon_vert,fragmentShader:Gt.meshtoon_frag},matcap:{uniforms:ze([at.common,at.bumpmap,at.normalmap,at.displacementmap,at.fog,{matcap:{value:null}}]),vertexShader:Gt.meshmatcap_vert,fragmentShader:Gt.meshmatcap_frag},points:{uniforms:ze([at.points,at.fog]),vertexShader:Gt.points_vert,fragmentShader:Gt.points_frag},dashed:{uniforms:ze([at.common,at.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Gt.linedashed_vert,fragmentShader:Gt.linedashed_frag},depth:{uniforms:ze([at.common,at.displacementmap]),vertexShader:Gt.depth_vert,fragmentShader:Gt.depth_frag},normal:{uniforms:ze([at.common,at.bumpmap,at.normalmap,at.displacementmap,{opacity:{value:1}}]),vertexShader:Gt.meshnormal_vert,fragmentShader:Gt.meshnormal_frag},sprite:{uniforms:ze([at.sprite,at.fog]),vertexShader:Gt.sprite_vert,fragmentShader:Gt.sprite_frag},background:{uniforms:{uvTransform:{value:new Bt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Gt.background_vert,fragmentShader:Gt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Bt}},vertexShader:Gt.backgroundCube_vert,fragmentShader:Gt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Gt.cube_vert,fragmentShader:Gt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Gt.equirect_vert,fragmentShader:Gt.equirect_frag},distanceRGBA:{uniforms:ze([at.common,at.displacementmap,{referencePosition:{value:new O},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Gt.distanceRGBA_vert,fragmentShader:Gt.distanceRGBA_frag},shadow:{uniforms:ze([at.lights,at.fog,{color:{value:new Jt(0)},opacity:{value:1}}]),vertexShader:Gt.shadow_vert,fragmentShader:Gt.shadow_frag}};En.physical={uniforms:ze([En.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Bt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Bt},clearcoatNormalScale:{value:new ne(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Bt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Bt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Bt},sheen:{value:0},sheenColor:{value:new Jt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Bt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Bt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Bt},transmissionSamplerSize:{value:new ne},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Bt},attenuationDistance:{value:0},attenuationColor:{value:new Jt(0)},specularColor:{value:new Jt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Bt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Bt},anisotropyVector:{value:new ne},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Bt}}]),vertexShader:Gt.meshphysical_vert,fragmentShader:Gt.meshphysical_frag};const yr={r:0,b:0,g:0},vi=new Hn,cm=new ge;function hm(i,t,e,n,s,r,a){const o=new Jt(0);let l=r===!0?0:1,c,u,h=null,d=0,p=null;function g(x){let E=x.isScene===!0?x.background:null;return E&&E.isTexture&&(E=(x.backgroundBlurriness>0?e:t).get(E)),E}function _(x){let E=!1;const y=g(x);y===null?f(o,l):y&&y.isColor&&(f(y,1),E=!0);const D=i.xr.getEnvironmentBlendMode();D==="additive"?n.buffers.color.setClear(0,0,0,1,a):D==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||E)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(x,E){const y=g(E);y&&(y.isCubeTexture||y.mapping===ea)?(u===void 0&&(u=new Le(new ui(1,1,1),new vn({name:"BackgroundCubeMaterial",uniforms:us(En.backgroundCube.uniforms),vertexShader:En.backgroundCube.vertexShader,fragmentShader:En.backgroundCube.fragmentShader,side:He,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(D,R,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),vi.copy(E.backgroundRotation),vi.x*=-1,vi.y*=-1,vi.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(vi.y*=-1,vi.z*=-1),u.material.uniforms.envMap.value=y,u.material.uniforms.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=E.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(cm.makeRotationFromEuler(vi)),u.material.toneMapped=Kt.getTransfer(y.colorSpace)!==se,(h!==y||d!==y.version||p!==i.toneMapping)&&(u.material.needsUpdate=!0,h=y,d=y.version,p=i.toneMapping),u.layers.enableAll(),x.unshift(u,u.geometry,u.material,0,0,null)):y&&y.isTexture&&(c===void 0&&(c=new Le(new wi(2,2),new vn({name:"BackgroundMaterial",uniforms:us(En.background.uniforms),vertexShader:En.background.vertexShader,fragmentShader:En.background.fragmentShader,side:zn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=y,c.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,c.material.toneMapped=Kt.getTransfer(y.colorSpace)!==se,y.matrixAutoUpdate===!0&&y.updateMatrix(),c.material.uniforms.uvTransform.value.copy(y.matrix),(h!==y||d!==y.version||p!==i.toneMapping)&&(c.material.needsUpdate=!0,h=y,d=y.version,p=i.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null))}function f(x,E){x.getRGB(yr,Th(i)),n.buffers.color.setClear(yr.r,yr.g,yr.b,E,a)}return{getClearColor:function(){return o},setClearColor:function(x,E=1){o.set(x),l=E,f(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(x){l=x,f(o,l)},render:_,addToRenderList:m}}function um(i,t){const e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null);let r=s,a=!1;function o(S,L,q,B,Z){let X=!1;const $=h(B,q,L);r!==$&&(r=$,c(r.object)),X=p(S,B,q,Z),X&&g(S,B,q,Z),Z!==null&&t.update(Z,i.ELEMENT_ARRAY_BUFFER),(X||a)&&(a=!1,y(S,L,q,B),Z!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(Z).buffer))}function l(){return i.createVertexArray()}function c(S){return i.bindVertexArray(S)}function u(S){return i.deleteVertexArray(S)}function h(S,L,q){const B=q.wireframe===!0;let Z=n[S.id];Z===void 0&&(Z={},n[S.id]=Z);let X=Z[L.id];X===void 0&&(X={},Z[L.id]=X);let $=X[B];return $===void 0&&($=d(l()),X[B]=$),$}function d(S){const L=[],q=[],B=[];for(let Z=0;Z<e;Z++)L[Z]=0,q[Z]=0,B[Z]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:q,attributeDivisors:B,object:S,attributes:{},index:null}}function p(S,L,q,B){const Z=r.attributes,X=L.attributes;let $=0;const Q=q.getAttributes();for(const G in Q)if(Q[G].location>=0){const dt=Z[G];let yt=X[G];if(yt===void 0&&(G==="instanceMatrix"&&S.instanceMatrix&&(yt=S.instanceMatrix),G==="instanceColor"&&S.instanceColor&&(yt=S.instanceColor)),dt===void 0||dt.attribute!==yt||yt&&dt.data!==yt.data)return!0;$++}return r.attributesNum!==$||r.index!==B}function g(S,L,q,B){const Z={},X=L.attributes;let $=0;const Q=q.getAttributes();for(const G in Q)if(Q[G].location>=0){let dt=X[G];dt===void 0&&(G==="instanceMatrix"&&S.instanceMatrix&&(dt=S.instanceMatrix),G==="instanceColor"&&S.instanceColor&&(dt=S.instanceColor));const yt={};yt.attribute=dt,dt&&dt.data&&(yt.data=dt.data),Z[G]=yt,$++}r.attributes=Z,r.attributesNum=$,r.index=B}function _(){const S=r.newAttributes;for(let L=0,q=S.length;L<q;L++)S[L]=0}function m(S){f(S,0)}function f(S,L){const q=r.newAttributes,B=r.enabledAttributes,Z=r.attributeDivisors;q[S]=1,B[S]===0&&(i.enableVertexAttribArray(S),B[S]=1),Z[S]!==L&&(i.vertexAttribDivisor(S,L),Z[S]=L)}function x(){const S=r.newAttributes,L=r.enabledAttributes;for(let q=0,B=L.length;q<B;q++)L[q]!==S[q]&&(i.disableVertexAttribArray(q),L[q]=0)}function E(S,L,q,B,Z,X,$){$===!0?i.vertexAttribIPointer(S,L,q,Z,X):i.vertexAttribPointer(S,L,q,B,Z,X)}function y(S,L,q,B){_();const Z=B.attributes,X=q.getAttributes(),$=L.defaultAttributeValues;for(const Q in X){const G=X[Q];if(G.location>=0){let ot=Z[Q];if(ot===void 0&&(Q==="instanceMatrix"&&S.instanceMatrix&&(ot=S.instanceMatrix),Q==="instanceColor"&&S.instanceColor&&(ot=S.instanceColor)),ot!==void 0){const dt=ot.normalized,yt=ot.itemSize,zt=t.get(ot);if(zt===void 0)continue;const Qt=zt.buffer,Y=zt.type,nt=zt.bytesPerElement,vt=Y===i.INT||Y===i.UNSIGNED_INT||ot.gpuType===jo;if(ot.isInterleavedBufferAttribute){const rt=ot.data,bt=rt.stride,Lt=ot.offset;if(rt.isInstancedInterleavedBuffer){for(let kt=0;kt<G.locationSize;kt++)f(G.location+kt,rt.meshPerAttribute);S.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=rt.meshPerAttribute*rt.count)}else for(let kt=0;kt<G.locationSize;kt++)m(G.location+kt);i.bindBuffer(i.ARRAY_BUFFER,Qt);for(let kt=0;kt<G.locationSize;kt++)E(G.location+kt,yt/G.locationSize,Y,dt,bt*nt,(Lt+yt/G.locationSize*kt)*nt,vt)}else{if(ot.isInstancedBufferAttribute){for(let rt=0;rt<G.locationSize;rt++)f(G.location+rt,ot.meshPerAttribute);S.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=ot.meshPerAttribute*ot.count)}else for(let rt=0;rt<G.locationSize;rt++)m(G.location+rt);i.bindBuffer(i.ARRAY_BUFFER,Qt);for(let rt=0;rt<G.locationSize;rt++)E(G.location+rt,yt/G.locationSize,Y,dt,yt*nt,yt/G.locationSize*rt*nt,vt)}}else if($!==void 0){const dt=$[Q];if(dt!==void 0)switch(dt.length){case 2:i.vertexAttrib2fv(G.location,dt);break;case 3:i.vertexAttrib3fv(G.location,dt);break;case 4:i.vertexAttrib4fv(G.location,dt);break;default:i.vertexAttrib1fv(G.location,dt)}}}}x()}function D(){C();for(const S in n){const L=n[S];for(const q in L){const B=L[q];for(const Z in B)u(B[Z].object),delete B[Z];delete L[q]}delete n[S]}}function R(S){if(n[S.id]===void 0)return;const L=n[S.id];for(const q in L){const B=L[q];for(const Z in B)u(B[Z].object),delete B[Z];delete L[q]}delete n[S.id]}function w(S){for(const L in n){const q=n[L];if(q[S.id]===void 0)continue;const B=q[S.id];for(const Z in B)u(B[Z].object),delete B[Z];delete q[S.id]}}function C(){T(),a=!0,r!==s&&(r=s,c(r.object))}function T(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:C,resetDefaultState:T,dispose:D,releaseStatesOfGeometry:R,releaseStatesOfProgram:w,initAttributes:_,enableAttribute:m,disableUnusedAttributes:x}}function fm(i,t,e){let n;function s(c){n=c}function r(c,u){i.drawArrays(n,c,u),e.update(u,n,1)}function a(c,u,h){h!==0&&(i.drawArraysInstanced(n,c,u,h),e.update(u,n,h))}function o(c,u,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,u,0,h);let p=0;for(let g=0;g<h;g++)p+=u[g];e.update(p,n,1)}function l(c,u,h,d){if(h===0)return;const p=t.get("WEBGL_multi_draw");if(p===null)for(let g=0;g<c.length;g++)a(c[g],u[g],d[g]);else{p.multiDrawArraysInstancedWEBGL(n,c,0,u,0,d,0,h);let g=0;for(let _=0;_<h;_++)g+=u[_]*d[_];e.update(g,n,1)}}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function dm(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){const w=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(w){return!(w!==cn&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(w){const C=w===Ws&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(w!==kn&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&w!==Nn&&!C)}function l(w){if(w==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp";const u=l(c);u!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const h=e.logarithmicDepthBuffer===!0,d=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control"),p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),f=i.getParameter(i.MAX_VERTEX_ATTRIBS),x=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),E=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),D=g>0,R=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:h,reverseDepthBuffer:d,maxTextures:p,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:f,maxVertexUniforms:x,maxVaryings:E,maxFragmentUniforms:y,vertexTextures:D,maxSamples:R}}function pm(i){const t=this;let e=null,n=0,s=!1,r=!1;const a=new Si,o=new Bt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){const p=h.length!==0||d||n!==0||s;return s=d,n=h.length,p},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,d){e=u(h,d,0)},this.setState=function(h,d,p){const g=h.clippingPlanes,_=h.clipIntersection,m=h.clipShadows,f=i.get(h);if(!s||g===null||g.length===0||r&&!m)r?u(null):c();else{const x=r?0:n,E=x*4;let y=f.clippingState||null;l.value=y,y=u(g,d,E,p);for(let D=0;D!==E;++D)y[D]=e[D];f.clippingState=y,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=x}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function u(h,d,p,g){const _=h!==null?h.length:0;let m=null;if(_!==0){if(m=l.value,g!==!0||m===null){const f=p+_*4,x=d.matrixWorldInverse;o.getNormalMatrix(x),(m===null||m.length<f)&&(m=new Float32Array(f));for(let E=0,y=p;E!==_;++E,y+=4)a.copy(h[E]).applyMatrix4(x,o),a.normal.toArray(m,y),m[y+3]=a.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,m}}function mm(i){let t=new WeakMap;function e(a,o){return o===ro?a.mapping=os:o===ao&&(a.mapping=ls),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===ro||o===ao)if(t.has(a)){const l=t.get(a).texture;return e(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new Af(l.height);return c.fromEquirectangularTexture(i,a),t.set(a,c),a.addEventListener("dispose",s),e(c.texture,a.mapping)}else return null}}return a}function s(a){const o=a.target;o.removeEventListener("dispose",s);const l=t.get(o);l!==void 0&&(t.delete(o),l.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}class gm extends bh{constructor(t=-1,e=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-t,a=n+t,o=s+e,l=s-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}const ji=4,Ql=[.125,.215,.35,.446,.526,.582],Ti=20,Pa=new gm,tc=new Jt;let Da=null,Ia=0,Ua=0,Na=!1;const yi=(1+Math.sqrt(5))/2,$i=1/yi,ec=[new O(-yi,$i,0),new O(yi,$i,0),new O(-$i,0,yi),new O($i,0,yi),new O(0,yi,-$i),new O(0,yi,$i),new O(-1,1,-1),new O(1,1,-1),new O(-1,1,1),new O(1,1,1)];class nc{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,s=100){Da=this._renderer.getRenderTarget(),Ia=this._renderer.getActiveCubeFace(),Ua=this._renderer.getActiveMipmapLevel(),Na=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,n,s,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=rc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=sc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(Da,Ia,Ua),this._renderer.xr.enabled=Na,t.scissorTest=!1,Er(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===os||t.mapping===ls?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Da=this._renderer.getRenderTarget(),Ia=this._renderer.getActiveCubeFace(),Ua=this._renderer.getActiveMipmapLevel(),Na=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:je,minFilter:je,generateMipmaps:!1,type:Ws,format:cn,colorSpace:ds,depthBuffer:!1},s=ic(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ic(t,e,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=_m(r)),this._blurMaterial=vm(r,t,e)}return s}_compileMaterial(t){const e=new Le(this._lodPlanes[0],t);this._renderer.compile(e,Pa)}_sceneToCubeUV(t,e,n,s){const o=new rn(90,1,e,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,d=u.toneMapping;u.getClearColor(tc),u.toneMapping=li,u.autoClear=!1;const p=new ns({name:"PMREM.Background",side:He,depthWrite:!1,depthTest:!1}),g=new Le(new ui,p);let _=!1;const m=t.background;m?m.isColor&&(p.color.copy(m),t.background=null,_=!0):(p.color.copy(tc),_=!0);for(let f=0;f<6;f++){const x=f%3;x===0?(o.up.set(0,l[f],0),o.lookAt(c[f],0,0)):x===1?(o.up.set(0,0,l[f]),o.lookAt(0,c[f],0)):(o.up.set(0,l[f],0),o.lookAt(0,0,c[f]));const E=this._cubeSize;Er(s,x*E,f>2?E:0,E,E),u.setRenderTarget(s),_&&u.render(g,o),u.render(t,o)}g.geometry.dispose(),g.material.dispose(),u.toneMapping=d,u.autoClear=h,t.background=m}_textureToCubeUV(t,e){const n=this._renderer,s=t.mapping===os||t.mapping===ls;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=rc()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=sc());const r=s?this._cubemapMaterial:this._equirectMaterial,a=new Le(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=t;const l=this._cubeSize;Er(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(a,Pa)}_applyPMREM(t){const e=this._renderer,n=e.autoClear;e.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=ec[(s-r-1)%ec.length];this._blur(t,r-1,r,a,o)}e.autoClear=n}_blur(t,e,n,s,r){const a=this._pingPongRenderTarget;this._halfBlur(t,a,e,n,s,"latitudinal",r),this._halfBlur(a,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const u=3,h=new Le(this._lodPlanes[s],c),d=c.uniforms,p=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*Ti-1),_=r/g,m=isFinite(r)?1+Math.floor(u*_):Ti;m>Ti&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Ti}`);const f=[];let x=0;for(let w=0;w<Ti;++w){const C=w/_,T=Math.exp(-C*C/2);f.push(T),w===0?x+=T:w<m&&(x+=2*T)}for(let w=0;w<f.length;w++)f[w]=f[w]/x;d.envMap.value=t.texture,d.samples.value=m,d.weights.value=f,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);const{_lodMax:E}=this;d.dTheta.value=g,d.mipInt.value=E-n;const y=this._sizeLods[s],D=3*y*(s>E-ji?s-E+ji:0),R=4*(this._cubeSize-y);Er(e,D,R,3*y,2*y),l.setRenderTarget(e),l.render(h,Pa)}}function _m(i){const t=[],e=[],n=[];let s=i;const r=i-ji+1+Ql.length;for(let a=0;a<r;a++){const o=Math.pow(2,s);e.push(o);let l=1/o;a>i-ji?l=Ql[a-i+ji-1]:a===0&&(l=0),n.push(l);const c=1/(o-2),u=-c,h=1+c,d=[u,u,h,u,h,h,u,u,h,h,u,h],p=6,g=6,_=3,m=2,f=1,x=new Float32Array(_*g*p),E=new Float32Array(m*g*p),y=new Float32Array(f*g*p);for(let R=0;R<p;R++){const w=R%3*2/3-1,C=R>2?0:-1,T=[w,C,0,w+2/3,C,0,w+2/3,C+1,0,w,C,0,w+2/3,C+1,0,w,C+1,0];x.set(T,_*g*R),E.set(d,m*g*R);const S=[R,R,R,R,R,R];y.set(S,f*g*R)}const D=new De;D.setAttribute("position",new be(x,_)),D.setAttribute("uv",new be(E,m)),D.setAttribute("faceIndex",new be(y,f)),t.push(D),s>ji&&s--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function ic(i,t,e){const n=new Li(i,t,e);return n.texture.mapping=ea,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Er(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function vm(i,t,e){const n=new Float32Array(Ti),s=new O(0,1,0);return new vn({name:"SphericalGaussianBlur",defines:{n:Ti,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:sl(),fragmentShader:`

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
		`,blending:oi,depthTest:!1,depthWrite:!1})}function sc(){return new vn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:sl(),fragmentShader:`

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
		`,blending:oi,depthTest:!1,depthWrite:!1})}function rc(){return new vn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:sl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:oi,depthTest:!1,depthWrite:!1})}function sl(){return`

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
	`}function xm(i){let t=new WeakMap,e=null;function n(o){if(o&&o.isTexture){const l=o.mapping,c=l===ro||l===ao,u=l===os||l===ls;if(c||u){let h=t.get(o);const d=h!==void 0?h.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==d)return e===null&&(e=new nc(i)),h=c?e.fromEquirectangular(o,h):e.fromCubemap(o,h),h.texture.pmremVersion=o.pmremVersion,t.set(o,h),h.texture;if(h!==void 0)return h.texture;{const p=o.image;return c&&p&&p.height>0||u&&p&&s(p)?(e===null&&(e=new nc(i)),h=c?e.fromEquirectangular(o):e.fromCubemap(o),h.texture.pmremVersion=o.pmremVersion,t.set(o,h),o.addEventListener("dispose",r),h.texture):null}}}return o}function s(o){let l=0;const c=6;for(let u=0;u<c;u++)o[u]!==void 0&&l++;return l===c}function r(o){const l=o.target;l.removeEventListener("dispose",r);const c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function a(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:a}}function Mm(i){const t={};function e(n){if(t[n]!==void 0)return t[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const s=e(n);return s===null&&Us("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function Sm(i,t,e,n){const s={},r=new WeakMap;function a(h){const d=h.target;d.index!==null&&t.remove(d.index);for(const g in d.attributes)t.remove(d.attributes[g]);for(const g in d.morphAttributes){const _=d.morphAttributes[g];for(let m=0,f=_.length;m<f;m++)t.remove(_[m])}d.removeEventListener("dispose",a),delete s[d.id];const p=r.get(d);p&&(t.remove(p),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function o(h,d){return s[d.id]===!0||(d.addEventListener("dispose",a),s[d.id]=!0,e.memory.geometries++),d}function l(h){const d=h.attributes;for(const g in d)t.update(d[g],i.ARRAY_BUFFER);const p=h.morphAttributes;for(const g in p){const _=p[g];for(let m=0,f=_.length;m<f;m++)t.update(_[m],i.ARRAY_BUFFER)}}function c(h){const d=[],p=h.index,g=h.attributes.position;let _=0;if(p!==null){const x=p.array;_=p.version;for(let E=0,y=x.length;E<y;E+=3){const D=x[E+0],R=x[E+1],w=x[E+2];d.push(D,R,R,w,w,D)}}else if(g!==void 0){const x=g.array;_=g.version;for(let E=0,y=x.length/3-1;E<y;E+=3){const D=E+0,R=E+1,w=E+2;d.push(D,R,R,w,w,D)}}else return;const m=new(_h(d)?Eh:yh)(d,1);m.version=_;const f=r.get(h);f&&t.remove(f),r.set(h,m)}function u(h){const d=r.get(h);if(d){const p=h.index;p!==null&&d.version<p.version&&c(h)}else c(h);return r.get(h)}return{get:o,update:l,getWireframeAttribute:u}}function ym(i,t,e){let n;function s(d){n=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function l(d,p){i.drawElements(n,p,r,d*a),e.update(p,n,1)}function c(d,p,g){g!==0&&(i.drawElementsInstanced(n,p,r,d*a,g),e.update(p,n,g))}function u(d,p,g){if(g===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,p,0,r,d,0,g);let m=0;for(let f=0;f<g;f++)m+=p[f];e.update(m,n,1)}function h(d,p,g,_){if(g===0)return;const m=t.get("WEBGL_multi_draw");if(m===null)for(let f=0;f<d.length;f++)c(d[f]/a,p[f],_[f]);else{m.multiDrawElementsInstancedWEBGL(n,p,0,r,d,0,_,0,g);let f=0;for(let x=0;x<g;x++)f+=p[x]*_[x];e.update(f,n,1)}}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function Em(i){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case i.TRIANGLES:e.triangles+=o*(r/3);break;case i.LINES:e.lines+=o*(r/2);break;case i.LINE_STRIP:e.lines+=o*(r-1);break;case i.LINE_LOOP:e.lines+=o*r;break;case i.POINTS:e.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function Tm(i,t,e){const n=new WeakMap,s=new Me;function r(a,o,l){const c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,h=u!==void 0?u.length:0;let d=n.get(o);if(d===void 0||d.count!==h){let S=function(){C.dispose(),n.delete(o),o.removeEventListener("dispose",S)};var p=S;d!==void 0&&d.texture.dispose();const g=o.morphAttributes.position!==void 0,_=o.morphAttributes.normal!==void 0,m=o.morphAttributes.color!==void 0,f=o.morphAttributes.position||[],x=o.morphAttributes.normal||[],E=o.morphAttributes.color||[];let y=0;g===!0&&(y=1),_===!0&&(y=2),m===!0&&(y=3);let D=o.attributes.position.count*y,R=1;D>t.maxTextureSize&&(R=Math.ceil(D/t.maxTextureSize),D=t.maxTextureSize);const w=new Float32Array(D*R*4*h),C=new xh(w,D,R,h);C.type=Nn,C.needsUpdate=!0;const T=y*4;for(let L=0;L<h;L++){const q=f[L],B=x[L],Z=E[L],X=D*R*4*L;for(let $=0;$<q.count;$++){const Q=$*T;g===!0&&(s.fromBufferAttribute(q,$),w[X+Q+0]=s.x,w[X+Q+1]=s.y,w[X+Q+2]=s.z,w[X+Q+3]=0),_===!0&&(s.fromBufferAttribute(B,$),w[X+Q+4]=s.x,w[X+Q+5]=s.y,w[X+Q+6]=s.z,w[X+Q+7]=0),m===!0&&(s.fromBufferAttribute(Z,$),w[X+Q+8]=s.x,w[X+Q+9]=s.y,w[X+Q+10]=s.z,w[X+Q+11]=Z.itemSize===4?s.w:1)}}d={count:h,texture:C,size:new ne(D,R)},n.set(o,d),o.addEventListener("dispose",S)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,e);else{let g=0;for(let m=0;m<c.length;m++)g+=c[m];const _=o.morphTargetsRelative?1:1-g;l.getUniforms().setValue(i,"morphTargetBaseInfluence",_),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function bm(i,t,e,n){let s=new WeakMap;function r(l){const c=n.render.frame,u=l.geometry,h=t.get(l,u);if(s.get(h)!==c&&(t.update(h),s.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),s.get(l)!==c&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const d=l.skeleton;s.get(d)!==c&&(d.update(),s.set(d,c))}return h}function a(){s=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:a}}class Ch extends Fe{constructor(t,e,n,s,r,a,o,l,c,u=ts){if(u!==ts&&u!==hs)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&u===ts&&(n=Ci),n===void 0&&u===hs&&(n=cs),super(null,s,r,a,o,l,u,n,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=o!==void 0?o:Ge,this.minFilter=l!==void 0?l:Ge,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}const Lh=new Fe,ac=new Ch(1,1),Ph=new xh,Dh=new hf,Ih=new Ah,oc=[],lc=[],cc=new Float32Array(16),hc=new Float32Array(9),uc=new Float32Array(4);function _s(i,t,e){const n=i[0];if(n<=0||n>0)return i;const s=t*e;let r=oc[s];if(r===void 0&&(r=new Float32Array(s),oc[s]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,i[a].toArray(r,o)}return r}function Ae(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function we(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function ia(i,t){let e=lc[t];e===void 0&&(e=new Int32Array(t),lc[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function Am(i,t){const e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function wm(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ae(e,t))return;i.uniform2fv(this.addr,t),we(e,t)}}function Rm(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Ae(e,t))return;i.uniform3fv(this.addr,t),we(e,t)}}function Cm(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ae(e,t))return;i.uniform4fv(this.addr,t),we(e,t)}}function Lm(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ae(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),we(e,t)}else{if(Ae(e,n))return;uc.set(n),i.uniformMatrix2fv(this.addr,!1,uc),we(e,n)}}function Pm(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ae(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),we(e,t)}else{if(Ae(e,n))return;hc.set(n),i.uniformMatrix3fv(this.addr,!1,hc),we(e,n)}}function Dm(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ae(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),we(e,t)}else{if(Ae(e,n))return;cc.set(n),i.uniformMatrix4fv(this.addr,!1,cc),we(e,n)}}function Im(i,t){const e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function Um(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ae(e,t))return;i.uniform2iv(this.addr,t),we(e,t)}}function Nm(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ae(e,t))return;i.uniform3iv(this.addr,t),we(e,t)}}function Om(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ae(e,t))return;i.uniform4iv(this.addr,t),we(e,t)}}function Fm(i,t){const e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function Bm(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ae(e,t))return;i.uniform2uiv(this.addr,t),we(e,t)}}function zm(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ae(e,t))return;i.uniform3uiv(this.addr,t),we(e,t)}}function km(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ae(e,t))return;i.uniform4uiv(this.addr,t),we(e,t)}}function Hm(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(ac.compareFunction=gh,r=ac):r=Lh,e.setTexture2D(t||r,s)}function Gm(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||Dh,s)}function Vm(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||Ih,s)}function Wm(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||Ph,s)}function Xm(i){switch(i){case 5126:return Am;case 35664:return wm;case 35665:return Rm;case 35666:return Cm;case 35674:return Lm;case 35675:return Pm;case 35676:return Dm;case 5124:case 35670:return Im;case 35667:case 35671:return Um;case 35668:case 35672:return Nm;case 35669:case 35673:return Om;case 5125:return Fm;case 36294:return Bm;case 36295:return zm;case 36296:return km;case 35678:case 36198:case 36298:case 36306:case 35682:return Hm;case 35679:case 36299:case 36307:return Gm;case 35680:case 36300:case 36308:case 36293:return Vm;case 36289:case 36303:case 36311:case 36292:return Wm}}function qm(i,t){i.uniform1fv(this.addr,t)}function Ym(i,t){const e=_s(t,this.size,2);i.uniform2fv(this.addr,e)}function $m(i,t){const e=_s(t,this.size,3);i.uniform3fv(this.addr,e)}function Km(i,t){const e=_s(t,this.size,4);i.uniform4fv(this.addr,e)}function Zm(i,t){const e=_s(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function jm(i,t){const e=_s(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function Jm(i,t){const e=_s(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function Qm(i,t){i.uniform1iv(this.addr,t)}function t0(i,t){i.uniform2iv(this.addr,t)}function e0(i,t){i.uniform3iv(this.addr,t)}function n0(i,t){i.uniform4iv(this.addr,t)}function i0(i,t){i.uniform1uiv(this.addr,t)}function s0(i,t){i.uniform2uiv(this.addr,t)}function r0(i,t){i.uniform3uiv(this.addr,t)}function a0(i,t){i.uniform4uiv(this.addr,t)}function o0(i,t,e){const n=this.cache,s=t.length,r=ia(e,s);Ae(n,r)||(i.uniform1iv(this.addr,r),we(n,r));for(let a=0;a!==s;++a)e.setTexture2D(t[a]||Lh,r[a])}function l0(i,t,e){const n=this.cache,s=t.length,r=ia(e,s);Ae(n,r)||(i.uniform1iv(this.addr,r),we(n,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||Dh,r[a])}function c0(i,t,e){const n=this.cache,s=t.length,r=ia(e,s);Ae(n,r)||(i.uniform1iv(this.addr,r),we(n,r));for(let a=0;a!==s;++a)e.setTextureCube(t[a]||Ih,r[a])}function h0(i,t,e){const n=this.cache,s=t.length,r=ia(e,s);Ae(n,r)||(i.uniform1iv(this.addr,r),we(n,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||Ph,r[a])}function u0(i){switch(i){case 5126:return qm;case 35664:return Ym;case 35665:return $m;case 35666:return Km;case 35674:return Zm;case 35675:return jm;case 35676:return Jm;case 5124:case 35670:return Qm;case 35667:case 35671:return t0;case 35668:case 35672:return e0;case 35669:case 35673:return n0;case 5125:return i0;case 36294:return s0;case 36295:return r0;case 36296:return a0;case 35678:case 36198:case 36298:case 36306:case 35682:return o0;case 35679:case 36299:case 36307:return l0;case 35680:case 36300:case 36308:case 36293:return c0;case 36289:case 36303:case 36311:case 36292:return h0}}class f0{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=Xm(e.type)}}class d0{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=u0(e.type)}}class p0{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(t,e[o.id],n)}}}const Oa=/(\w+)(\])?(\[|\.)?/g;function fc(i,t){i.seq.push(t),i.map[t.id]=t}function m0(i,t,e){const n=i.name,s=n.length;for(Oa.lastIndex=0;;){const r=Oa.exec(n),a=Oa.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){fc(e,c===void 0?new f0(o,i,t):new d0(o,i,t));break}else{let h=e.map[o];h===void 0&&(h=new p0(o),fc(e,h)),e=h}}}class Gr{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=t.getActiveUniform(e,s),a=t.getUniformLocation(e,r.name);m0(r,a,this)}}setValue(t,e,n,s){const r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){const s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,a=e.length;r!==a;++r){const o=e[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,e){const n=[];for(let s=0,r=t.length;s!==r;++s){const a=t[s];a.id in e&&n.push(a)}return n}}function dc(i,t,e){const n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}const g0=37297;let _0=0;function v0(i,t){const e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){const o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}const pc=new Bt;function x0(i){Kt._getMatrix(pc,Kt.workingColorSpace,i);const t=`mat3( ${pc.elements.map(e=>e.toFixed(4))} )`;switch(Kt.getTransfer(i)){case na:return[t,"LinearTransferOETF"];case se:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function mc(i,t,e){const n=i.getShaderParameter(t,i.COMPILE_STATUS),s=i.getShaderInfoLog(t).trim();if(n&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const a=parseInt(r[1]);return e.toUpperCase()+`

`+s+`

`+v0(i.getShaderSource(t),a)}else return s}function M0(i,t){const e=x0(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}function S0(i,t){let e;switch(t){case Nu:e="Linear";break;case Ou:e="Reinhard";break;case Fu:e="Cineon";break;case Bu:e="ACESFilmic";break;case ku:e="AgX";break;case Hu:e="Neutral";break;case zu:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const Tr=new O;function y0(){Kt.getLuminanceCoefficients(Tr);const i=Tr.x.toFixed(4),t=Tr.y.toFixed(4),e=Tr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function E0(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ns).join(`
`)}function T0(i){const t=[];for(const e in i){const n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function b0(i,t){const e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(t,s),a=r.name;let o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:i.getAttribLocation(t,a),locationSize:o}}return e}function Ns(i){return i!==""}function gc(i,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function _c(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const A0=/^[ \t]*#include +<([\w\d./]+)>/gm;function Oo(i){return i.replace(A0,R0)}const w0=new Map;function R0(i,t){let e=Gt[t];if(e===void 0){const n=w0.get(t);if(n!==void 0)e=Gt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return Oo(e)}const C0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function vc(i){return i.replace(C0,L0)}function L0(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function xc(i){let t=`precision ${i.precision} float;
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
#define LOW_PRECISION`),t}function P0(i){let t="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===ih?t="SHADOWMAP_TYPE_PCF":i.shadowMapType===pu?t="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Dn&&(t="SHADOWMAP_TYPE_VSM"),t}function D0(i){let t="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case os:case ls:t="ENVMAP_TYPE_CUBE";break;case ea:t="ENVMAP_TYPE_CUBE_UV";break}return t}function I0(i){let t="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case ls:t="ENVMAP_MODE_REFRACTION";break}return t}function U0(i){let t="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case sh:t="ENVMAP_BLENDING_MULTIPLY";break;case Iu:t="ENVMAP_BLENDING_MIX";break;case Uu:t="ENVMAP_BLENDING_ADD";break}return t}function N0(i){const t=i.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:n,maxMip:e}}function O0(i,t,e,n){const s=i.getContext(),r=e.defines;let a=e.vertexShader,o=e.fragmentShader;const l=P0(e),c=D0(e),u=I0(e),h=U0(e),d=N0(e),p=E0(e),g=T0(r),_=s.createProgram();let m,f,x=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Ns).join(`
`),m.length>0&&(m+=`
`),f=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Ns).join(`
`),f.length>0&&(f+=`
`)):(m=[xc(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+u:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ns).join(`
`),f=[xc(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+u:"",e.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==li?"#define TONE_MAPPING":"",e.toneMapping!==li?Gt.tonemapping_pars_fragment:"",e.toneMapping!==li?S0("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Gt.colorspace_pars_fragment,M0("linearToOutputTexel",e.outputColorSpace),y0(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Ns).join(`
`)),a=Oo(a),a=gc(a,e),a=_c(a,e),o=Oo(o),o=gc(o,e),o=_c(o,e),a=vc(a),o=vc(o),e.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,f=["#define varying in",e.glslVersion===Dl?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Dl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);const E=x+m+a,y=x+f+o,D=dc(s,s.VERTEX_SHADER,E),R=dc(s,s.FRAGMENT_SHADER,y);s.attachShader(_,D),s.attachShader(_,R),e.index0AttributeName!==void 0?s.bindAttribLocation(_,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function w(L){if(i.debug.checkShaderErrors){const q=s.getProgramInfoLog(_).trim(),B=s.getShaderInfoLog(D).trim(),Z=s.getShaderInfoLog(R).trim();let X=!0,$=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(X=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,_,D,R);else{const Q=mc(s,D,"vertex"),G=mc(s,R,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+q+`
`+Q+`
`+G)}else q!==""?console.warn("THREE.WebGLProgram: Program Info Log:",q):(B===""||Z==="")&&($=!1);$&&(L.diagnostics={runnable:X,programLog:q,vertexShader:{log:B,prefix:m},fragmentShader:{log:Z,prefix:f}})}s.deleteShader(D),s.deleteShader(R),C=new Gr(s,_),T=b0(s,_)}let C;this.getUniforms=function(){return C===void 0&&w(this),C};let T;this.getAttributes=function(){return T===void 0&&w(this),T};let S=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return S===!1&&(S=s.getProgramParameter(_,g0)),S},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=_0++,this.cacheKey=t,this.usedTimes=1,this.program=_,this.vertexShader=D,this.fragmentShader=R,this}let F0=0;class B0{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,n=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(t);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new z0(t),e.set(t,n)),n}}class z0{constructor(t){this.id=F0++,this.code=t,this.usedTimes=0}}function k0(i,t,e,n,s,r,a){const o=new Mh,l=new B0,c=new Set,u=[],h=s.logarithmicDepthBuffer,d=s.vertexTextures;let p=s.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(T){return c.add(T),T===0?"uv":`uv${T}`}function m(T,S,L,q,B){const Z=q.fog,X=B.geometry,$=T.isMeshStandardMaterial?q.environment:null,Q=(T.isMeshStandardMaterial?e:t).get(T.envMap||$),G=Q&&Q.mapping===ea?Q.image.height:null,ot=g[T.type];T.precision!==null&&(p=s.getMaxPrecision(T.precision),p!==T.precision&&console.warn("THREE.WebGLProgram.getParameters:",T.precision,"not supported, using",p,"instead."));const dt=X.morphAttributes.position||X.morphAttributes.normal||X.morphAttributes.color,yt=dt!==void 0?dt.length:0;let zt=0;X.morphAttributes.position!==void 0&&(zt=1),X.morphAttributes.normal!==void 0&&(zt=2),X.morphAttributes.color!==void 0&&(zt=3);let Qt,Y,nt,vt;if(ot){const ie=En[ot];Qt=ie.vertexShader,Y=ie.fragmentShader}else Qt=T.vertexShader,Y=T.fragmentShader,l.update(T),nt=l.getVertexShaderID(T),vt=l.getFragmentShaderID(T);const rt=i.getRenderTarget(),bt=i.state.buffers.depth.getReversed(),Lt=B.isInstancedMesh===!0,kt=B.isBatchedMesh===!0,de=!!T.map,Yt=!!T.matcap,_e=!!Q,N=!!T.aoMap,tn=!!T.lightMap,Wt=!!T.bumpMap,Xt=!!T.normalMap,wt=!!T.displacementMap,le=!!T.emissiveMap,At=!!T.metalnessMap,A=!!T.roughnessMap,v=T.anisotropy>0,F=T.clearcoat>0,j=T.dispersion>0,tt=T.iridescence>0,K=T.sheen>0,Et=T.transmission>0,ct=v&&!!T.anisotropyMap,pt=F&&!!T.clearcoatMap,$t=F&&!!T.clearcoatNormalMap,it=F&&!!T.clearcoatRoughnessMap,mt=tt&&!!T.iridescenceMap,Rt=tt&&!!T.iridescenceThicknessMap,Pt=K&&!!T.sheenColorMap,gt=K&&!!T.sheenRoughnessMap,qt=!!T.specularMap,Ht=!!T.specularColorMap,ae=!!T.specularIntensityMap,P=Et&&!!T.transmissionMap,lt=Et&&!!T.thicknessMap,V=!!T.gradientMap,J=!!T.alphaMap,ft=T.alphaTest>0,ht=!!T.alphaHash,Nt=!!T.extensions;let me=li;T.toneMapped&&(rt===null||rt.isXRRenderTarget===!0)&&(me=i.toneMapping);const Ue={shaderID:ot,shaderType:T.type,shaderName:T.name,vertexShader:Qt,fragmentShader:Y,defines:T.defines,customVertexShaderID:nt,customFragmentShaderID:vt,isRawShaderMaterial:T.isRawShaderMaterial===!0,glslVersion:T.glslVersion,precision:p,batching:kt,batchingColor:kt&&B._colorsTexture!==null,instancing:Lt,instancingColor:Lt&&B.instanceColor!==null,instancingMorph:Lt&&B.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:rt===null?i.outputColorSpace:rt.isXRRenderTarget===!0?rt.texture.colorSpace:ds,alphaToCoverage:!!T.alphaToCoverage,map:de,matcap:Yt,envMap:_e,envMapMode:_e&&Q.mapping,envMapCubeUVHeight:G,aoMap:N,lightMap:tn,bumpMap:Wt,normalMap:Xt,displacementMap:d&&wt,emissiveMap:le,normalMapObjectSpace:Xt&&T.normalMapType===qu,normalMapTangentSpace:Xt&&T.normalMapType===Xu,metalnessMap:At,roughnessMap:A,anisotropy:v,anisotropyMap:ct,clearcoat:F,clearcoatMap:pt,clearcoatNormalMap:$t,clearcoatRoughnessMap:it,dispersion:j,iridescence:tt,iridescenceMap:mt,iridescenceThicknessMap:Rt,sheen:K,sheenColorMap:Pt,sheenRoughnessMap:gt,specularMap:qt,specularColorMap:Ht,specularIntensityMap:ae,transmission:Et,transmissionMap:P,thicknessMap:lt,gradientMap:V,opaque:T.transparent===!1&&T.blending===Qi&&T.alphaToCoverage===!1,alphaMap:J,alphaTest:ft,alphaHash:ht,combine:T.combine,mapUv:de&&_(T.map.channel),aoMapUv:N&&_(T.aoMap.channel),lightMapUv:tn&&_(T.lightMap.channel),bumpMapUv:Wt&&_(T.bumpMap.channel),normalMapUv:Xt&&_(T.normalMap.channel),displacementMapUv:wt&&_(T.displacementMap.channel),emissiveMapUv:le&&_(T.emissiveMap.channel),metalnessMapUv:At&&_(T.metalnessMap.channel),roughnessMapUv:A&&_(T.roughnessMap.channel),anisotropyMapUv:ct&&_(T.anisotropyMap.channel),clearcoatMapUv:pt&&_(T.clearcoatMap.channel),clearcoatNormalMapUv:$t&&_(T.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:it&&_(T.clearcoatRoughnessMap.channel),iridescenceMapUv:mt&&_(T.iridescenceMap.channel),iridescenceThicknessMapUv:Rt&&_(T.iridescenceThicknessMap.channel),sheenColorMapUv:Pt&&_(T.sheenColorMap.channel),sheenRoughnessMapUv:gt&&_(T.sheenRoughnessMap.channel),specularMapUv:qt&&_(T.specularMap.channel),specularColorMapUv:Ht&&_(T.specularColorMap.channel),specularIntensityMapUv:ae&&_(T.specularIntensityMap.channel),transmissionMapUv:P&&_(T.transmissionMap.channel),thicknessMapUv:lt&&_(T.thicknessMap.channel),alphaMapUv:J&&_(T.alphaMap.channel),vertexTangents:!!X.attributes.tangent&&(Xt||v),vertexColors:T.vertexColors,vertexAlphas:T.vertexColors===!0&&!!X.attributes.color&&X.attributes.color.itemSize===4,pointsUvs:B.isPoints===!0&&!!X.attributes.uv&&(de||J),fog:!!Z,useFog:T.fog===!0,fogExp2:!!Z&&Z.isFogExp2,flatShading:T.flatShading===!0,sizeAttenuation:T.sizeAttenuation===!0,logarithmicDepthBuffer:h,reverseDepthBuffer:bt,skinning:B.isSkinnedMesh===!0,morphTargets:X.morphAttributes.position!==void 0,morphNormals:X.morphAttributes.normal!==void 0,morphColors:X.morphAttributes.color!==void 0,morphTargetsCount:yt,morphTextureStride:zt,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:T.dithering,shadowMapEnabled:i.shadowMap.enabled&&L.length>0,shadowMapType:i.shadowMap.type,toneMapping:me,decodeVideoTexture:de&&T.map.isVideoTexture===!0&&Kt.getTransfer(T.map.colorSpace)===se,decodeVideoTextureEmissive:le&&T.emissiveMap.isVideoTexture===!0&&Kt.getTransfer(T.emissiveMap.colorSpace)===se,premultipliedAlpha:T.premultipliedAlpha,doubleSided:T.side===on,flipSided:T.side===He,useDepthPacking:T.depthPacking>=0,depthPacking:T.depthPacking||0,index0AttributeName:T.index0AttributeName,extensionClipCullDistance:Nt&&T.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Nt&&T.extensions.multiDraw===!0||kt)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:T.customProgramCacheKey()};return Ue.vertexUv1s=c.has(1),Ue.vertexUv2s=c.has(2),Ue.vertexUv3s=c.has(3),c.clear(),Ue}function f(T){const S=[];if(T.shaderID?S.push(T.shaderID):(S.push(T.customVertexShaderID),S.push(T.customFragmentShaderID)),T.defines!==void 0)for(const L in T.defines)S.push(L),S.push(T.defines[L]);return T.isRawShaderMaterial===!1&&(x(S,T),E(S,T),S.push(i.outputColorSpace)),S.push(T.customProgramCacheKey),S.join()}function x(T,S){T.push(S.precision),T.push(S.outputColorSpace),T.push(S.envMapMode),T.push(S.envMapCubeUVHeight),T.push(S.mapUv),T.push(S.alphaMapUv),T.push(S.lightMapUv),T.push(S.aoMapUv),T.push(S.bumpMapUv),T.push(S.normalMapUv),T.push(S.displacementMapUv),T.push(S.emissiveMapUv),T.push(S.metalnessMapUv),T.push(S.roughnessMapUv),T.push(S.anisotropyMapUv),T.push(S.clearcoatMapUv),T.push(S.clearcoatNormalMapUv),T.push(S.clearcoatRoughnessMapUv),T.push(S.iridescenceMapUv),T.push(S.iridescenceThicknessMapUv),T.push(S.sheenColorMapUv),T.push(S.sheenRoughnessMapUv),T.push(S.specularMapUv),T.push(S.specularColorMapUv),T.push(S.specularIntensityMapUv),T.push(S.transmissionMapUv),T.push(S.thicknessMapUv),T.push(S.combine),T.push(S.fogExp2),T.push(S.sizeAttenuation),T.push(S.morphTargetsCount),T.push(S.morphAttributeCount),T.push(S.numDirLights),T.push(S.numPointLights),T.push(S.numSpotLights),T.push(S.numSpotLightMaps),T.push(S.numHemiLights),T.push(S.numRectAreaLights),T.push(S.numDirLightShadows),T.push(S.numPointLightShadows),T.push(S.numSpotLightShadows),T.push(S.numSpotLightShadowsWithMaps),T.push(S.numLightProbes),T.push(S.shadowMapType),T.push(S.toneMapping),T.push(S.numClippingPlanes),T.push(S.numClipIntersection),T.push(S.depthPacking)}function E(T,S){o.disableAll(),S.supportsVertexTextures&&o.enable(0),S.instancing&&o.enable(1),S.instancingColor&&o.enable(2),S.instancingMorph&&o.enable(3),S.matcap&&o.enable(4),S.envMap&&o.enable(5),S.normalMapObjectSpace&&o.enable(6),S.normalMapTangentSpace&&o.enable(7),S.clearcoat&&o.enable(8),S.iridescence&&o.enable(9),S.alphaTest&&o.enable(10),S.vertexColors&&o.enable(11),S.vertexAlphas&&o.enable(12),S.vertexUv1s&&o.enable(13),S.vertexUv2s&&o.enable(14),S.vertexUv3s&&o.enable(15),S.vertexTangents&&o.enable(16),S.anisotropy&&o.enable(17),S.alphaHash&&o.enable(18),S.batching&&o.enable(19),S.dispersion&&o.enable(20),S.batchingColor&&o.enable(21),T.push(o.mask),o.disableAll(),S.fog&&o.enable(0),S.useFog&&o.enable(1),S.flatShading&&o.enable(2),S.logarithmicDepthBuffer&&o.enable(3),S.reverseDepthBuffer&&o.enable(4),S.skinning&&o.enable(5),S.morphTargets&&o.enable(6),S.morphNormals&&o.enable(7),S.morphColors&&o.enable(8),S.premultipliedAlpha&&o.enable(9),S.shadowMapEnabled&&o.enable(10),S.doubleSided&&o.enable(11),S.flipSided&&o.enable(12),S.useDepthPacking&&o.enable(13),S.dithering&&o.enable(14),S.transmission&&o.enable(15),S.sheen&&o.enable(16),S.opaque&&o.enable(17),S.pointsUvs&&o.enable(18),S.decodeVideoTexture&&o.enable(19),S.decodeVideoTextureEmissive&&o.enable(20),S.alphaToCoverage&&o.enable(21),T.push(o.mask)}function y(T){const S=g[T.type];let L;if(S){const q=En[S];L=yf.clone(q.uniforms)}else L=T.uniforms;return L}function D(T,S){let L;for(let q=0,B=u.length;q<B;q++){const Z=u[q];if(Z.cacheKey===S){L=Z,++L.usedTimes;break}}return L===void 0&&(L=new O0(i,S,T,r),u.push(L)),L}function R(T){if(--T.usedTimes===0){const S=u.indexOf(T);u[S]=u[u.length-1],u.pop(),T.destroy()}}function w(T){l.remove(T)}function C(){l.dispose()}return{getParameters:m,getProgramCacheKey:f,getUniforms:y,acquireProgram:D,releaseProgram:R,releaseShaderCache:w,programs:u,dispose:C}}function H0(){let i=new WeakMap;function t(a){return i.has(a)}function e(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function G0(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.z!==t.z?i.z-t.z:i.id-t.id}function Mc(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function Sc(){const i=[];let t=0;const e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function a(h,d,p,g,_,m){let f=i[t];return f===void 0?(f={id:h.id,object:h,geometry:d,material:p,groupOrder:g,renderOrder:h.renderOrder,z:_,group:m},i[t]=f):(f.id=h.id,f.object=h,f.geometry=d,f.material=p,f.groupOrder=g,f.renderOrder=h.renderOrder,f.z=_,f.group=m),t++,f}function o(h,d,p,g,_,m){const f=a(h,d,p,g,_,m);p.transmission>0?n.push(f):p.transparent===!0?s.push(f):e.push(f)}function l(h,d,p,g,_,m){const f=a(h,d,p,g,_,m);p.transmission>0?n.unshift(f):p.transparent===!0?s.unshift(f):e.unshift(f)}function c(h,d){e.length>1&&e.sort(h||G0),n.length>1&&n.sort(d||Mc),s.length>1&&s.sort(d||Mc)}function u(){for(let h=t,d=i.length;h<d;h++){const p=i[h];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:o,unshift:l,finish:u,sort:c}}function V0(){let i=new WeakMap;function t(n,s){const r=i.get(n);let a;return r===void 0?(a=new Sc,i.set(n,[a])):s>=r.length?(a=new Sc,r.push(a)):a=r[s],a}function e(){i=new WeakMap}return{get:t,dispose:e}}function W0(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new O,color:new Jt};break;case"SpotLight":e={position:new O,direction:new O,color:new Jt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new O,color:new Jt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new O,skyColor:new Jt,groundColor:new Jt};break;case"RectAreaLight":e={color:new Jt,position:new O,halfWidth:new O,halfHeight:new O};break}return i[t.id]=e,e}}}function X0(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ne};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ne};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ne,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}let q0=0;function Y0(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function $0(i){const t=new W0,e=X0(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new O);const s=new O,r=new ge,a=new ge;function o(c){let u=0,h=0,d=0;for(let T=0;T<9;T++)n.probe[T].set(0,0,0);let p=0,g=0,_=0,m=0,f=0,x=0,E=0,y=0,D=0,R=0,w=0;c.sort(Y0);for(let T=0,S=c.length;T<S;T++){const L=c[T],q=L.color,B=L.intensity,Z=L.distance,X=L.shadow&&L.shadow.map?L.shadow.map.texture:null;if(L.isAmbientLight)u+=q.r*B,h+=q.g*B,d+=q.b*B;else if(L.isLightProbe){for(let $=0;$<9;$++)n.probe[$].addScaledVector(L.sh.coefficients[$],B);w++}else if(L.isDirectionalLight){const $=t.get(L);if($.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){const Q=L.shadow,G=e.get(L);G.shadowIntensity=Q.intensity,G.shadowBias=Q.bias,G.shadowNormalBias=Q.normalBias,G.shadowRadius=Q.radius,G.shadowMapSize=Q.mapSize,n.directionalShadow[p]=G,n.directionalShadowMap[p]=X,n.directionalShadowMatrix[p]=L.shadow.matrix,x++}n.directional[p]=$,p++}else if(L.isSpotLight){const $=t.get(L);$.position.setFromMatrixPosition(L.matrixWorld),$.color.copy(q).multiplyScalar(B),$.distance=Z,$.coneCos=Math.cos(L.angle),$.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),$.decay=L.decay,n.spot[_]=$;const Q=L.shadow;if(L.map&&(n.spotLightMap[D]=L.map,D++,Q.updateMatrices(L),L.castShadow&&R++),n.spotLightMatrix[_]=Q.matrix,L.castShadow){const G=e.get(L);G.shadowIntensity=Q.intensity,G.shadowBias=Q.bias,G.shadowNormalBias=Q.normalBias,G.shadowRadius=Q.radius,G.shadowMapSize=Q.mapSize,n.spotShadow[_]=G,n.spotShadowMap[_]=X,y++}_++}else if(L.isRectAreaLight){const $=t.get(L);$.color.copy(q).multiplyScalar(B),$.halfWidth.set(L.width*.5,0,0),$.halfHeight.set(0,L.height*.5,0),n.rectArea[m]=$,m++}else if(L.isPointLight){const $=t.get(L);if($.color.copy(L.color).multiplyScalar(L.intensity),$.distance=L.distance,$.decay=L.decay,L.castShadow){const Q=L.shadow,G=e.get(L);G.shadowIntensity=Q.intensity,G.shadowBias=Q.bias,G.shadowNormalBias=Q.normalBias,G.shadowRadius=Q.radius,G.shadowMapSize=Q.mapSize,G.shadowCameraNear=Q.camera.near,G.shadowCameraFar=Q.camera.far,n.pointShadow[g]=G,n.pointShadowMap[g]=X,n.pointShadowMatrix[g]=L.shadow.matrix,E++}n.point[g]=$,g++}else if(L.isHemisphereLight){const $=t.get(L);$.skyColor.copy(L.color).multiplyScalar(B),$.groundColor.copy(L.groundColor).multiplyScalar(B),n.hemi[f]=$,f++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=at.LTC_FLOAT_1,n.rectAreaLTC2=at.LTC_FLOAT_2):(n.rectAreaLTC1=at.LTC_HALF_1,n.rectAreaLTC2=at.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=h,n.ambient[2]=d;const C=n.hash;(C.directionalLength!==p||C.pointLength!==g||C.spotLength!==_||C.rectAreaLength!==m||C.hemiLength!==f||C.numDirectionalShadows!==x||C.numPointShadows!==E||C.numSpotShadows!==y||C.numSpotMaps!==D||C.numLightProbes!==w)&&(n.directional.length=p,n.spot.length=_,n.rectArea.length=m,n.point.length=g,n.hemi.length=f,n.directionalShadow.length=x,n.directionalShadowMap.length=x,n.pointShadow.length=E,n.pointShadowMap.length=E,n.spotShadow.length=y,n.spotShadowMap.length=y,n.directionalShadowMatrix.length=x,n.pointShadowMatrix.length=E,n.spotLightMatrix.length=y+D-R,n.spotLightMap.length=D,n.numSpotLightShadowsWithMaps=R,n.numLightProbes=w,C.directionalLength=p,C.pointLength=g,C.spotLength=_,C.rectAreaLength=m,C.hemiLength=f,C.numDirectionalShadows=x,C.numPointShadows=E,C.numSpotShadows=y,C.numSpotMaps=D,C.numLightProbes=w,n.version=q0++)}function l(c,u){let h=0,d=0,p=0,g=0,_=0;const m=u.matrixWorldInverse;for(let f=0,x=c.length;f<x;f++){const E=c[f];if(E.isDirectionalLight){const y=n.directional[h];y.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),h++}else if(E.isSpotLight){const y=n.spot[p];y.position.setFromMatrixPosition(E.matrixWorld),y.position.applyMatrix4(m),y.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),p++}else if(E.isRectAreaLight){const y=n.rectArea[g];y.position.setFromMatrixPosition(E.matrixWorld),y.position.applyMatrix4(m),a.identity(),r.copy(E.matrixWorld),r.premultiply(m),a.extractRotation(r),y.halfWidth.set(E.width*.5,0,0),y.halfHeight.set(0,E.height*.5,0),y.halfWidth.applyMatrix4(a),y.halfHeight.applyMatrix4(a),g++}else if(E.isPointLight){const y=n.point[d];y.position.setFromMatrixPosition(E.matrixWorld),y.position.applyMatrix4(m),d++}else if(E.isHemisphereLight){const y=n.hemi[_];y.direction.setFromMatrixPosition(E.matrixWorld),y.direction.transformDirection(m),_++}}}return{setup:o,setupView:l,state:n}}function yc(i){const t=new $0(i),e=[],n=[];function s(u){c.camera=u,e.length=0,n.length=0}function r(u){e.push(u)}function a(u){n.push(u)}function o(){t.setup(e)}function l(u){t.setupView(e,u)}const c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function K0(i){let t=new WeakMap;function e(s,r=0){const a=t.get(s);let o;return a===void 0?(o=new yc(i),t.set(s,[o])):r>=a.length?(o=new yc(i),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}class Z0 extends gs{static get type(){return"MeshDepthMaterial"}constructor(t){super(),this.isMeshDepthMaterial=!0,this.depthPacking=Vu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class j0 extends gs{static get type(){return"MeshDistanceMaterial"}constructor(t){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const J0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Q0=`uniform sampler2D shadow_pass;
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
}`;function tg(i,t,e){let n=new wh;const s=new ne,r=new ne,a=new Me,o=new Z0({depthPacking:Wu}),l=new j0,c={},u=e.maxTextureSize,h={[zn]:He,[He]:zn,[on]:on},d=new vn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ne},radius:{value:4}},vertexShader:J0,fragmentShader:Q0}),p=d.clone();p.defines.HORIZONTAL_PASS=1;const g=new De;g.setAttribute("position",new be(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new Le(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ih;let f=this.type;this.render=function(R,w,C){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||R.length===0)return;const T=i.getRenderTarget(),S=i.getActiveCubeFace(),L=i.getActiveMipmapLevel(),q=i.state;q.setBlending(oi),q.buffers.color.setClear(1,1,1,1),q.buffers.depth.setTest(!0),q.setScissorTest(!1);const B=f!==Dn&&this.type===Dn,Z=f===Dn&&this.type!==Dn;for(let X=0,$=R.length;X<$;X++){const Q=R[X],G=Q.shadow;if(G===void 0){console.warn("THREE.WebGLShadowMap:",Q,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;s.copy(G.mapSize);const ot=G.getFrameExtents();if(s.multiply(ot),r.copy(G.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/ot.x),s.x=r.x*ot.x,G.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/ot.y),s.y=r.y*ot.y,G.mapSize.y=r.y)),G.map===null||B===!0||Z===!0){const yt=this.type!==Dn?{minFilter:Ge,magFilter:Ge}:{};G.map!==null&&G.map.dispose(),G.map=new Li(s.x,s.y,yt),G.map.texture.name=Q.name+".shadowMap",G.camera.updateProjectionMatrix()}i.setRenderTarget(G.map),i.clear();const dt=G.getViewportCount();for(let yt=0;yt<dt;yt++){const zt=G.getViewport(yt);a.set(r.x*zt.x,r.y*zt.y,r.x*zt.z,r.y*zt.w),q.viewport(a),G.updateMatrices(Q,yt),n=G.getFrustum(),y(w,C,G.camera,Q,this.type)}G.isPointLightShadow!==!0&&this.type===Dn&&x(G,C),G.needsUpdate=!1}f=this.type,m.needsUpdate=!1,i.setRenderTarget(T,S,L)};function x(R,w){const C=t.update(_);d.defines.VSM_SAMPLES!==R.blurSamples&&(d.defines.VSM_SAMPLES=R.blurSamples,p.defines.VSM_SAMPLES=R.blurSamples,d.needsUpdate=!0,p.needsUpdate=!0),R.mapPass===null&&(R.mapPass=new Li(s.x,s.y)),d.uniforms.shadow_pass.value=R.map.texture,d.uniforms.resolution.value=R.mapSize,d.uniforms.radius.value=R.radius,i.setRenderTarget(R.mapPass),i.clear(),i.renderBufferDirect(w,null,C,d,_,null),p.uniforms.shadow_pass.value=R.mapPass.texture,p.uniforms.resolution.value=R.mapSize,p.uniforms.radius.value=R.radius,i.setRenderTarget(R.map),i.clear(),i.renderBufferDirect(w,null,C,p,_,null)}function E(R,w,C,T){let S=null;const L=C.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(L!==void 0)S=L;else if(S=C.isPointLight===!0?l:o,i.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0){const q=S.uuid,B=w.uuid;let Z=c[q];Z===void 0&&(Z={},c[q]=Z);let X=Z[B];X===void 0&&(X=S.clone(),Z[B]=X,w.addEventListener("dispose",D)),S=X}if(S.visible=w.visible,S.wireframe=w.wireframe,T===Dn?S.side=w.shadowSide!==null?w.shadowSide:w.side:S.side=w.shadowSide!==null?w.shadowSide:h[w.side],S.alphaMap=w.alphaMap,S.alphaTest=w.alphaTest,S.map=w.map,S.clipShadows=w.clipShadows,S.clippingPlanes=w.clippingPlanes,S.clipIntersection=w.clipIntersection,S.displacementMap=w.displacementMap,S.displacementScale=w.displacementScale,S.displacementBias=w.displacementBias,S.wireframeLinewidth=w.wireframeLinewidth,S.linewidth=w.linewidth,C.isPointLight===!0&&S.isMeshDistanceMaterial===!0){const q=i.properties.get(S);q.light=C}return S}function y(R,w,C,T,S){if(R.visible===!1)return;if(R.layers.test(w.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&S===Dn)&&(!R.frustumCulled||n.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(C.matrixWorldInverse,R.matrixWorld);const B=t.update(R),Z=R.material;if(Array.isArray(Z)){const X=B.groups;for(let $=0,Q=X.length;$<Q;$++){const G=X[$],ot=Z[G.materialIndex];if(ot&&ot.visible){const dt=E(R,ot,T,S);R.onBeforeShadow(i,R,w,C,B,dt,G),i.renderBufferDirect(C,null,B,dt,R,G),R.onAfterShadow(i,R,w,C,B,dt,G)}}}else if(Z.visible){const X=E(R,Z,T,S);R.onBeforeShadow(i,R,w,C,B,X,null),i.renderBufferDirect(C,null,B,X,R,null),R.onAfterShadow(i,R,w,C,B,X,null)}}const q=R.children;for(let B=0,Z=q.length;B<Z;B++)y(q[B],w,C,T,S)}function D(R){R.target.removeEventListener("dispose",D);for(const C in c){const T=c[C],S=R.target.uuid;S in T&&(T[S].dispose(),delete T[S])}}}const eg={[Ja]:Qa,[to]:io,[eo]:so,[as]:no,[Qa]:Ja,[io]:to,[so]:eo,[no]:as};function ng(i,t){function e(){let P=!1;const lt=new Me;let V=null;const J=new Me(0,0,0,0);return{setMask:function(ft){V!==ft&&!P&&(i.colorMask(ft,ft,ft,ft),V=ft)},setLocked:function(ft){P=ft},setClear:function(ft,ht,Nt,me,Ue){Ue===!0&&(ft*=me,ht*=me,Nt*=me),lt.set(ft,ht,Nt,me),J.equals(lt)===!1&&(i.clearColor(ft,ht,Nt,me),J.copy(lt))},reset:function(){P=!1,V=null,J.set(-1,0,0,0)}}}function n(){let P=!1,lt=!1,V=null,J=null,ft=null;return{setReversed:function(ht){if(lt!==ht){const Nt=t.get("EXT_clip_control");lt?Nt.clipControlEXT(Nt.LOWER_LEFT_EXT,Nt.ZERO_TO_ONE_EXT):Nt.clipControlEXT(Nt.LOWER_LEFT_EXT,Nt.NEGATIVE_ONE_TO_ONE_EXT);const me=ft;ft=null,this.setClear(me)}lt=ht},getReversed:function(){return lt},setTest:function(ht){ht?rt(i.DEPTH_TEST):bt(i.DEPTH_TEST)},setMask:function(ht){V!==ht&&!P&&(i.depthMask(ht),V=ht)},setFunc:function(ht){if(lt&&(ht=eg[ht]),J!==ht){switch(ht){case Ja:i.depthFunc(i.NEVER);break;case Qa:i.depthFunc(i.ALWAYS);break;case to:i.depthFunc(i.LESS);break;case as:i.depthFunc(i.LEQUAL);break;case eo:i.depthFunc(i.EQUAL);break;case no:i.depthFunc(i.GEQUAL);break;case io:i.depthFunc(i.GREATER);break;case so:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}J=ht}},setLocked:function(ht){P=ht},setClear:function(ht){ft!==ht&&(lt&&(ht=1-ht),i.clearDepth(ht),ft=ht)},reset:function(){P=!1,V=null,J=null,ft=null,lt=!1}}}function s(){let P=!1,lt=null,V=null,J=null,ft=null,ht=null,Nt=null,me=null,Ue=null;return{setTest:function(ie){P||(ie?rt(i.STENCIL_TEST):bt(i.STENCIL_TEST))},setMask:function(ie){lt!==ie&&!P&&(i.stencilMask(ie),lt=ie)},setFunc:function(ie,fn,bn){(V!==ie||J!==fn||ft!==bn)&&(i.stencilFunc(ie,fn,bn),V=ie,J=fn,ft=bn)},setOp:function(ie,fn,bn){(ht!==ie||Nt!==fn||me!==bn)&&(i.stencilOp(ie,fn,bn),ht=ie,Nt=fn,me=bn)},setLocked:function(ie){P=ie},setClear:function(ie){Ue!==ie&&(i.clearStencil(ie),Ue=ie)},reset:function(){P=!1,lt=null,V=null,J=null,ft=null,ht=null,Nt=null,me=null,Ue=null}}}const r=new e,a=new n,o=new s,l=new WeakMap,c=new WeakMap;let u={},h={},d=new WeakMap,p=[],g=null,_=!1,m=null,f=null,x=null,E=null,y=null,D=null,R=null,w=new Jt(0,0,0),C=0,T=!1,S=null,L=null,q=null,B=null,Z=null;const X=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let $=!1,Q=0;const G=i.getParameter(i.VERSION);G.indexOf("WebGL")!==-1?(Q=parseFloat(/^WebGL (\d)/.exec(G)[1]),$=Q>=1):G.indexOf("OpenGL ES")!==-1&&(Q=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),$=Q>=2);let ot=null,dt={};const yt=i.getParameter(i.SCISSOR_BOX),zt=i.getParameter(i.VIEWPORT),Qt=new Me().fromArray(yt),Y=new Me().fromArray(zt);function nt(P,lt,V,J){const ft=new Uint8Array(4),ht=i.createTexture();i.bindTexture(P,ht),i.texParameteri(P,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(P,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Nt=0;Nt<V;Nt++)P===i.TEXTURE_3D||P===i.TEXTURE_2D_ARRAY?i.texImage3D(lt,0,i.RGBA,1,1,J,0,i.RGBA,i.UNSIGNED_BYTE,ft):i.texImage2D(lt+Nt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ft);return ht}const vt={};vt[i.TEXTURE_2D]=nt(i.TEXTURE_2D,i.TEXTURE_2D,1),vt[i.TEXTURE_CUBE_MAP]=nt(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),vt[i.TEXTURE_2D_ARRAY]=nt(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),vt[i.TEXTURE_3D]=nt(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),rt(i.DEPTH_TEST),a.setFunc(as),Wt(!1),Xt(Al),rt(i.CULL_FACE),N(oi);function rt(P){u[P]!==!0&&(i.enable(P),u[P]=!0)}function bt(P){u[P]!==!1&&(i.disable(P),u[P]=!1)}function Lt(P,lt){return h[P]!==lt?(i.bindFramebuffer(P,lt),h[P]=lt,P===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=lt),P===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=lt),!0):!1}function kt(P,lt){let V=p,J=!1;if(P){V=d.get(lt),V===void 0&&(V=[],d.set(lt,V));const ft=P.textures;if(V.length!==ft.length||V[0]!==i.COLOR_ATTACHMENT0){for(let ht=0,Nt=ft.length;ht<Nt;ht++)V[ht]=i.COLOR_ATTACHMENT0+ht;V.length=ft.length,J=!0}}else V[0]!==i.BACK&&(V[0]=i.BACK,J=!0);J&&i.drawBuffers(V)}function de(P){return g!==P?(i.useProgram(P),g=P,!0):!1}const Yt={[Ei]:i.FUNC_ADD,[gu]:i.FUNC_SUBTRACT,[_u]:i.FUNC_REVERSE_SUBTRACT};Yt[vu]=i.MIN,Yt[xu]=i.MAX;const _e={[Mu]:i.ZERO,[Su]:i.ONE,[yu]:i.SRC_COLOR,[Za]:i.SRC_ALPHA,[Ru]:i.SRC_ALPHA_SATURATE,[Au]:i.DST_COLOR,[Tu]:i.DST_ALPHA,[Eu]:i.ONE_MINUS_SRC_COLOR,[ja]:i.ONE_MINUS_SRC_ALPHA,[wu]:i.ONE_MINUS_DST_COLOR,[bu]:i.ONE_MINUS_DST_ALPHA,[Cu]:i.CONSTANT_COLOR,[Lu]:i.ONE_MINUS_CONSTANT_COLOR,[Pu]:i.CONSTANT_ALPHA,[Du]:i.ONE_MINUS_CONSTANT_ALPHA};function N(P,lt,V,J,ft,ht,Nt,me,Ue,ie){if(P===oi){_===!0&&(bt(i.BLEND),_=!1);return}if(_===!1&&(rt(i.BLEND),_=!0),P!==mu){if(P!==m||ie!==T){if((f!==Ei||y!==Ei)&&(i.blendEquation(i.FUNC_ADD),f=Ei,y=Ei),ie)switch(P){case Qi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case wl:i.blendFunc(i.ONE,i.ONE);break;case Rl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Cl:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",P);break}else switch(P){case Qi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case wl:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case Rl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Cl:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",P);break}x=null,E=null,D=null,R=null,w.set(0,0,0),C=0,m=P,T=ie}return}ft=ft||lt,ht=ht||V,Nt=Nt||J,(lt!==f||ft!==y)&&(i.blendEquationSeparate(Yt[lt],Yt[ft]),f=lt,y=ft),(V!==x||J!==E||ht!==D||Nt!==R)&&(i.blendFuncSeparate(_e[V],_e[J],_e[ht],_e[Nt]),x=V,E=J,D=ht,R=Nt),(me.equals(w)===!1||Ue!==C)&&(i.blendColor(me.r,me.g,me.b,Ue),w.copy(me),C=Ue),m=P,T=!1}function tn(P,lt){P.side===on?bt(i.CULL_FACE):rt(i.CULL_FACE);let V=P.side===He;lt&&(V=!V),Wt(V),P.blending===Qi&&P.transparent===!1?N(oi):N(P.blending,P.blendEquation,P.blendSrc,P.blendDst,P.blendEquationAlpha,P.blendSrcAlpha,P.blendDstAlpha,P.blendColor,P.blendAlpha,P.premultipliedAlpha),a.setFunc(P.depthFunc),a.setTest(P.depthTest),a.setMask(P.depthWrite),r.setMask(P.colorWrite);const J=P.stencilWrite;o.setTest(J),J&&(o.setMask(P.stencilWriteMask),o.setFunc(P.stencilFunc,P.stencilRef,P.stencilFuncMask),o.setOp(P.stencilFail,P.stencilZFail,P.stencilZPass)),le(P.polygonOffset,P.polygonOffsetFactor,P.polygonOffsetUnits),P.alphaToCoverage===!0?rt(i.SAMPLE_ALPHA_TO_COVERAGE):bt(i.SAMPLE_ALPHA_TO_COVERAGE)}function Wt(P){S!==P&&(P?i.frontFace(i.CW):i.frontFace(i.CCW),S=P)}function Xt(P){P!==fu?(rt(i.CULL_FACE),P!==L&&(P===Al?i.cullFace(i.BACK):P===du?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):bt(i.CULL_FACE),L=P}function wt(P){P!==q&&($&&i.lineWidth(P),q=P)}function le(P,lt,V){P?(rt(i.POLYGON_OFFSET_FILL),(B!==lt||Z!==V)&&(i.polygonOffset(lt,V),B=lt,Z=V)):bt(i.POLYGON_OFFSET_FILL)}function At(P){P?rt(i.SCISSOR_TEST):bt(i.SCISSOR_TEST)}function A(P){P===void 0&&(P=i.TEXTURE0+X-1),ot!==P&&(i.activeTexture(P),ot=P)}function v(P,lt,V){V===void 0&&(ot===null?V=i.TEXTURE0+X-1:V=ot);let J=dt[V];J===void 0&&(J={type:void 0,texture:void 0},dt[V]=J),(J.type!==P||J.texture!==lt)&&(ot!==V&&(i.activeTexture(V),ot=V),i.bindTexture(P,lt||vt[P]),J.type=P,J.texture=lt)}function F(){const P=dt[ot];P!==void 0&&P.type!==void 0&&(i.bindTexture(P.type,null),P.type=void 0,P.texture=void 0)}function j(){try{i.compressedTexImage2D.apply(i,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function tt(){try{i.compressedTexImage3D.apply(i,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function K(){try{i.texSubImage2D.apply(i,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function Et(){try{i.texSubImage3D.apply(i,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function ct(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function pt(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function $t(){try{i.texStorage2D.apply(i,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function it(){try{i.texStorage3D.apply(i,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function mt(){try{i.texImage2D.apply(i,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function Rt(){try{i.texImage3D.apply(i,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function Pt(P){Qt.equals(P)===!1&&(i.scissor(P.x,P.y,P.z,P.w),Qt.copy(P))}function gt(P){Y.equals(P)===!1&&(i.viewport(P.x,P.y,P.z,P.w),Y.copy(P))}function qt(P,lt){let V=c.get(lt);V===void 0&&(V=new WeakMap,c.set(lt,V));let J=V.get(P);J===void 0&&(J=i.getUniformBlockIndex(lt,P.name),V.set(P,J))}function Ht(P,lt){const J=c.get(lt).get(P);l.get(lt)!==J&&(i.uniformBlockBinding(lt,J,P.__bindingPointIndex),l.set(lt,J))}function ae(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),u={},ot=null,dt={},h={},d=new WeakMap,p=[],g=null,_=!1,m=null,f=null,x=null,E=null,y=null,D=null,R=null,w=new Jt(0,0,0),C=0,T=!1,S=null,L=null,q=null,B=null,Z=null,Qt.set(0,0,i.canvas.width,i.canvas.height),Y.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:rt,disable:bt,bindFramebuffer:Lt,drawBuffers:kt,useProgram:de,setBlending:N,setMaterial:tn,setFlipSided:Wt,setCullFace:Xt,setLineWidth:wt,setPolygonOffset:le,setScissorTest:At,activeTexture:A,bindTexture:v,unbindTexture:F,compressedTexImage2D:j,compressedTexImage3D:tt,texImage2D:mt,texImage3D:Rt,updateUBOMapping:qt,uniformBlockBinding:Ht,texStorage2D:$t,texStorage3D:it,texSubImage2D:K,texSubImage3D:Et,compressedTexSubImage2D:ct,compressedTexSubImage3D:pt,scissor:Pt,viewport:gt,reset:ae}}function Ec(i,t,e,n){const s=ig(n);switch(e){case ch:return i*t;case uh:return i*t;case fh:return i*t*2;case dh:return i*t/s.components*s.byteLength;case tl:return i*t/s.components*s.byteLength;case ph:return i*t*2/s.components*s.byteLength;case el:return i*t*2/s.components*s.byteLength;case hh:return i*t*3/s.components*s.byteLength;case cn:return i*t*4/s.components*s.byteLength;case nl:return i*t*4/s.components*s.byteLength;case Or:case Fr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Br:case zr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case co:case uo:return Math.max(i,16)*Math.max(t,8)/4;case lo:case ho:return Math.max(i,8)*Math.max(t,8)/2;case fo:case po:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case mo:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case go:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case _o:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case vo:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case xo:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case Mo:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case So:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case yo:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case Eo:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case To:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case bo:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case Ao:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case wo:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case Ro:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case Co:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case kr:case Lo:case Po:return Math.ceil(i/4)*Math.ceil(t/4)*16;case mh:case Do:return Math.ceil(i/4)*Math.ceil(t/4)*8;case Io:case Uo:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function ig(i){switch(i){case kn:case ah:return{byteLength:1,components:1};case Hs:case oh:case Ws:return{byteLength:2,components:1};case Jo:case Qo:return{byteLength:2,components:4};case Ci:case jo:case Nn:return{byteLength:4,components:1};case lh:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function sg(i,t,e,n,s,r,a){const o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new ne,u=new WeakMap;let h;const d=new WeakMap;let p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(A,v){return p?new OffscreenCanvas(A,v):Kr("canvas")}function _(A,v,F){let j=1;const tt=At(A);if((tt.width>F||tt.height>F)&&(j=F/Math.max(tt.width,tt.height)),j<1)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap||typeof VideoFrame<"u"&&A instanceof VideoFrame){const K=Math.floor(j*tt.width),Et=Math.floor(j*tt.height);h===void 0&&(h=g(K,Et));const ct=v?g(K,Et):h;return ct.width=K,ct.height=Et,ct.getContext("2d").drawImage(A,0,0,K,Et),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+tt.width+"x"+tt.height+") to ("+K+"x"+Et+")."),ct}else return"data"in A&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+tt.width+"x"+tt.height+")."),A;return A}function m(A){return A.generateMipmaps}function f(A){i.generateMipmap(A)}function x(A){return A.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:A.isWebGL3DRenderTarget?i.TEXTURE_3D:A.isWebGLArrayRenderTarget||A.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function E(A,v,F,j,tt=!1){if(A!==null){if(i[A]!==void 0)return i[A];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let K=v;if(v===i.RED&&(F===i.FLOAT&&(K=i.R32F),F===i.HALF_FLOAT&&(K=i.R16F),F===i.UNSIGNED_BYTE&&(K=i.R8)),v===i.RED_INTEGER&&(F===i.UNSIGNED_BYTE&&(K=i.R8UI),F===i.UNSIGNED_SHORT&&(K=i.R16UI),F===i.UNSIGNED_INT&&(K=i.R32UI),F===i.BYTE&&(K=i.R8I),F===i.SHORT&&(K=i.R16I),F===i.INT&&(K=i.R32I)),v===i.RG&&(F===i.FLOAT&&(K=i.RG32F),F===i.HALF_FLOAT&&(K=i.RG16F),F===i.UNSIGNED_BYTE&&(K=i.RG8)),v===i.RG_INTEGER&&(F===i.UNSIGNED_BYTE&&(K=i.RG8UI),F===i.UNSIGNED_SHORT&&(K=i.RG16UI),F===i.UNSIGNED_INT&&(K=i.RG32UI),F===i.BYTE&&(K=i.RG8I),F===i.SHORT&&(K=i.RG16I),F===i.INT&&(K=i.RG32I)),v===i.RGB_INTEGER&&(F===i.UNSIGNED_BYTE&&(K=i.RGB8UI),F===i.UNSIGNED_SHORT&&(K=i.RGB16UI),F===i.UNSIGNED_INT&&(K=i.RGB32UI),F===i.BYTE&&(K=i.RGB8I),F===i.SHORT&&(K=i.RGB16I),F===i.INT&&(K=i.RGB32I)),v===i.RGBA_INTEGER&&(F===i.UNSIGNED_BYTE&&(K=i.RGBA8UI),F===i.UNSIGNED_SHORT&&(K=i.RGBA16UI),F===i.UNSIGNED_INT&&(K=i.RGBA32UI),F===i.BYTE&&(K=i.RGBA8I),F===i.SHORT&&(K=i.RGBA16I),F===i.INT&&(K=i.RGBA32I)),v===i.RGB&&F===i.UNSIGNED_INT_5_9_9_9_REV&&(K=i.RGB9_E5),v===i.RGBA){const Et=tt?na:Kt.getTransfer(j);F===i.FLOAT&&(K=i.RGBA32F),F===i.HALF_FLOAT&&(K=i.RGBA16F),F===i.UNSIGNED_BYTE&&(K=Et===se?i.SRGB8_ALPHA8:i.RGBA8),F===i.UNSIGNED_SHORT_4_4_4_4&&(K=i.RGBA4),F===i.UNSIGNED_SHORT_5_5_5_1&&(K=i.RGB5_A1)}return(K===i.R16F||K===i.R32F||K===i.RG16F||K===i.RG32F||K===i.RGBA16F||K===i.RGBA32F)&&t.get("EXT_color_buffer_float"),K}function y(A,v){let F;return A?v===null||v===Ci||v===cs?F=i.DEPTH24_STENCIL8:v===Nn?F=i.DEPTH32F_STENCIL8:v===Hs&&(F=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):v===null||v===Ci||v===cs?F=i.DEPTH_COMPONENT24:v===Nn?F=i.DEPTH_COMPONENT32F:v===Hs&&(F=i.DEPTH_COMPONENT16),F}function D(A,v){return m(A)===!0||A.isFramebufferTexture&&A.minFilter!==Ge&&A.minFilter!==je?Math.log2(Math.max(v.width,v.height))+1:A.mipmaps!==void 0&&A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?v.mipmaps.length:1}function R(A){const v=A.target;v.removeEventListener("dispose",R),C(v),v.isVideoTexture&&u.delete(v)}function w(A){const v=A.target;v.removeEventListener("dispose",w),S(v)}function C(A){const v=n.get(A);if(v.__webglInit===void 0)return;const F=A.source,j=d.get(F);if(j){const tt=j[v.__cacheKey];tt.usedTimes--,tt.usedTimes===0&&T(A),Object.keys(j).length===0&&d.delete(F)}n.remove(A)}function T(A){const v=n.get(A);i.deleteTexture(v.__webglTexture);const F=A.source,j=d.get(F);delete j[v.__cacheKey],a.memory.textures--}function S(A){const v=n.get(A);if(A.depthTexture&&(A.depthTexture.dispose(),n.remove(A.depthTexture)),A.isWebGLCubeRenderTarget)for(let j=0;j<6;j++){if(Array.isArray(v.__webglFramebuffer[j]))for(let tt=0;tt<v.__webglFramebuffer[j].length;tt++)i.deleteFramebuffer(v.__webglFramebuffer[j][tt]);else i.deleteFramebuffer(v.__webglFramebuffer[j]);v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer[j])}else{if(Array.isArray(v.__webglFramebuffer))for(let j=0;j<v.__webglFramebuffer.length;j++)i.deleteFramebuffer(v.__webglFramebuffer[j]);else i.deleteFramebuffer(v.__webglFramebuffer);if(v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer),v.__webglMultisampledFramebuffer&&i.deleteFramebuffer(v.__webglMultisampledFramebuffer),v.__webglColorRenderbuffer)for(let j=0;j<v.__webglColorRenderbuffer.length;j++)v.__webglColorRenderbuffer[j]&&i.deleteRenderbuffer(v.__webglColorRenderbuffer[j]);v.__webglDepthRenderbuffer&&i.deleteRenderbuffer(v.__webglDepthRenderbuffer)}const F=A.textures;for(let j=0,tt=F.length;j<tt;j++){const K=n.get(F[j]);K.__webglTexture&&(i.deleteTexture(K.__webglTexture),a.memory.textures--),n.remove(F[j])}n.remove(A)}let L=0;function q(){L=0}function B(){const A=L;return A>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+A+" texture units while this GPU supports only "+s.maxTextures),L+=1,A}function Z(A){const v=[];return v.push(A.wrapS),v.push(A.wrapT),v.push(A.wrapR||0),v.push(A.magFilter),v.push(A.minFilter),v.push(A.anisotropy),v.push(A.internalFormat),v.push(A.format),v.push(A.type),v.push(A.generateMipmaps),v.push(A.premultiplyAlpha),v.push(A.flipY),v.push(A.unpackAlignment),v.push(A.colorSpace),v.join()}function X(A,v){const F=n.get(A);if(A.isVideoTexture&&wt(A),A.isRenderTargetTexture===!1&&A.version>0&&F.__version!==A.version){const j=A.image;if(j===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(j.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Y(F,A,v);return}}e.bindTexture(i.TEXTURE_2D,F.__webglTexture,i.TEXTURE0+v)}function $(A,v){const F=n.get(A);if(A.version>0&&F.__version!==A.version){Y(F,A,v);return}e.bindTexture(i.TEXTURE_2D_ARRAY,F.__webglTexture,i.TEXTURE0+v)}function Q(A,v){const F=n.get(A);if(A.version>0&&F.__version!==A.version){Y(F,A,v);return}e.bindTexture(i.TEXTURE_3D,F.__webglTexture,i.TEXTURE0+v)}function G(A,v){const F=n.get(A);if(A.version>0&&F.__version!==A.version){nt(F,A,v);return}e.bindTexture(i.TEXTURE_CUBE_MAP,F.__webglTexture,i.TEXTURE0+v)}const ot={[Yr]:i.REPEAT,[bi]:i.CLAMP_TO_EDGE,[oo]:i.MIRRORED_REPEAT},dt={[Ge]:i.NEAREST,[Gu]:i.NEAREST_MIPMAP_NEAREST,[sr]:i.NEAREST_MIPMAP_LINEAR,[je]:i.LINEAR,[ca]:i.LINEAR_MIPMAP_NEAREST,[Tn]:i.LINEAR_MIPMAP_LINEAR},yt={[Yu]:i.NEVER,[Qu]:i.ALWAYS,[$u]:i.LESS,[gh]:i.LEQUAL,[Ku]:i.EQUAL,[Ju]:i.GEQUAL,[Zu]:i.GREATER,[ju]:i.NOTEQUAL};function zt(A,v){if(v.type===Nn&&t.has("OES_texture_float_linear")===!1&&(v.magFilter===je||v.magFilter===ca||v.magFilter===sr||v.magFilter===Tn||v.minFilter===je||v.minFilter===ca||v.minFilter===sr||v.minFilter===Tn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(A,i.TEXTURE_WRAP_S,ot[v.wrapS]),i.texParameteri(A,i.TEXTURE_WRAP_T,ot[v.wrapT]),(A===i.TEXTURE_3D||A===i.TEXTURE_2D_ARRAY)&&i.texParameteri(A,i.TEXTURE_WRAP_R,ot[v.wrapR]),i.texParameteri(A,i.TEXTURE_MAG_FILTER,dt[v.magFilter]),i.texParameteri(A,i.TEXTURE_MIN_FILTER,dt[v.minFilter]),v.compareFunction&&(i.texParameteri(A,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(A,i.TEXTURE_COMPARE_FUNC,yt[v.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(v.magFilter===Ge||v.minFilter!==sr&&v.minFilter!==Tn||v.type===Nn&&t.has("OES_texture_float_linear")===!1)return;if(v.anisotropy>1||n.get(v).__currentAnisotropy){const F=t.get("EXT_texture_filter_anisotropic");i.texParameterf(A,F.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,s.getMaxAnisotropy())),n.get(v).__currentAnisotropy=v.anisotropy}}}function Qt(A,v){let F=!1;A.__webglInit===void 0&&(A.__webglInit=!0,v.addEventListener("dispose",R));const j=v.source;let tt=d.get(j);tt===void 0&&(tt={},d.set(j,tt));const K=Z(v);if(K!==A.__cacheKey){tt[K]===void 0&&(tt[K]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,F=!0),tt[K].usedTimes++;const Et=tt[A.__cacheKey];Et!==void 0&&(tt[A.__cacheKey].usedTimes--,Et.usedTimes===0&&T(v)),A.__cacheKey=K,A.__webglTexture=tt[K].texture}return F}function Y(A,v,F){let j=i.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(j=i.TEXTURE_2D_ARRAY),v.isData3DTexture&&(j=i.TEXTURE_3D);const tt=Qt(A,v),K=v.source;e.bindTexture(j,A.__webglTexture,i.TEXTURE0+F);const Et=n.get(K);if(K.version!==Et.__version||tt===!0){e.activeTexture(i.TEXTURE0+F);const ct=Kt.getPrimaries(Kt.workingColorSpace),pt=v.colorSpace===ei?null:Kt.getPrimaries(v.colorSpace),$t=v.colorSpace===ei||ct===pt?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,$t);let it=_(v.image,!1,s.maxTextureSize);it=le(v,it);const mt=r.convert(v.format,v.colorSpace),Rt=r.convert(v.type);let Pt=E(v.internalFormat,mt,Rt,v.colorSpace,v.isVideoTexture);zt(j,v);let gt;const qt=v.mipmaps,Ht=v.isVideoTexture!==!0,ae=Et.__version===void 0||tt===!0,P=K.dataReady,lt=D(v,it);if(v.isDepthTexture)Pt=y(v.format===hs,v.type),ae&&(Ht?e.texStorage2D(i.TEXTURE_2D,1,Pt,it.width,it.height):e.texImage2D(i.TEXTURE_2D,0,Pt,it.width,it.height,0,mt,Rt,null));else if(v.isDataTexture)if(qt.length>0){Ht&&ae&&e.texStorage2D(i.TEXTURE_2D,lt,Pt,qt[0].width,qt[0].height);for(let V=0,J=qt.length;V<J;V++)gt=qt[V],Ht?P&&e.texSubImage2D(i.TEXTURE_2D,V,0,0,gt.width,gt.height,mt,Rt,gt.data):e.texImage2D(i.TEXTURE_2D,V,Pt,gt.width,gt.height,0,mt,Rt,gt.data);v.generateMipmaps=!1}else Ht?(ae&&e.texStorage2D(i.TEXTURE_2D,lt,Pt,it.width,it.height),P&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,it.width,it.height,mt,Rt,it.data)):e.texImage2D(i.TEXTURE_2D,0,Pt,it.width,it.height,0,mt,Rt,it.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){Ht&&ae&&e.texStorage3D(i.TEXTURE_2D_ARRAY,lt,Pt,qt[0].width,qt[0].height,it.depth);for(let V=0,J=qt.length;V<J;V++)if(gt=qt[V],v.format!==cn)if(mt!==null)if(Ht){if(P)if(v.layerUpdates.size>0){const ft=Ec(gt.width,gt.height,v.format,v.type);for(const ht of v.layerUpdates){const Nt=gt.data.subarray(ht*ft/gt.data.BYTES_PER_ELEMENT,(ht+1)*ft/gt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,V,0,0,ht,gt.width,gt.height,1,mt,Nt)}v.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,V,0,0,0,gt.width,gt.height,it.depth,mt,gt.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,V,Pt,gt.width,gt.height,it.depth,0,gt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ht?P&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,V,0,0,0,gt.width,gt.height,it.depth,mt,Rt,gt.data):e.texImage3D(i.TEXTURE_2D_ARRAY,V,Pt,gt.width,gt.height,it.depth,0,mt,Rt,gt.data)}else{Ht&&ae&&e.texStorage2D(i.TEXTURE_2D,lt,Pt,qt[0].width,qt[0].height);for(let V=0,J=qt.length;V<J;V++)gt=qt[V],v.format!==cn?mt!==null?Ht?P&&e.compressedTexSubImage2D(i.TEXTURE_2D,V,0,0,gt.width,gt.height,mt,gt.data):e.compressedTexImage2D(i.TEXTURE_2D,V,Pt,gt.width,gt.height,0,gt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ht?P&&e.texSubImage2D(i.TEXTURE_2D,V,0,0,gt.width,gt.height,mt,Rt,gt.data):e.texImage2D(i.TEXTURE_2D,V,Pt,gt.width,gt.height,0,mt,Rt,gt.data)}else if(v.isDataArrayTexture)if(Ht){if(ae&&e.texStorage3D(i.TEXTURE_2D_ARRAY,lt,Pt,it.width,it.height,it.depth),P)if(v.layerUpdates.size>0){const V=Ec(it.width,it.height,v.format,v.type);for(const J of v.layerUpdates){const ft=it.data.subarray(J*V/it.data.BYTES_PER_ELEMENT,(J+1)*V/it.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,J,it.width,it.height,1,mt,Rt,ft)}v.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,it.width,it.height,it.depth,mt,Rt,it.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,Pt,it.width,it.height,it.depth,0,mt,Rt,it.data);else if(v.isData3DTexture)Ht?(ae&&e.texStorage3D(i.TEXTURE_3D,lt,Pt,it.width,it.height,it.depth),P&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,it.width,it.height,it.depth,mt,Rt,it.data)):e.texImage3D(i.TEXTURE_3D,0,Pt,it.width,it.height,it.depth,0,mt,Rt,it.data);else if(v.isFramebufferTexture){if(ae)if(Ht)e.texStorage2D(i.TEXTURE_2D,lt,Pt,it.width,it.height);else{let V=it.width,J=it.height;for(let ft=0;ft<lt;ft++)e.texImage2D(i.TEXTURE_2D,ft,Pt,V,J,0,mt,Rt,null),V>>=1,J>>=1}}else if(qt.length>0){if(Ht&&ae){const V=At(qt[0]);e.texStorage2D(i.TEXTURE_2D,lt,Pt,V.width,V.height)}for(let V=0,J=qt.length;V<J;V++)gt=qt[V],Ht?P&&e.texSubImage2D(i.TEXTURE_2D,V,0,0,mt,Rt,gt):e.texImage2D(i.TEXTURE_2D,V,Pt,mt,Rt,gt);v.generateMipmaps=!1}else if(Ht){if(ae){const V=At(it);e.texStorage2D(i.TEXTURE_2D,lt,Pt,V.width,V.height)}P&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,mt,Rt,it)}else e.texImage2D(i.TEXTURE_2D,0,Pt,mt,Rt,it);m(v)&&f(j),Et.__version=K.version,v.onUpdate&&v.onUpdate(v)}A.__version=v.version}function nt(A,v,F){if(v.image.length!==6)return;const j=Qt(A,v),tt=v.source;e.bindTexture(i.TEXTURE_CUBE_MAP,A.__webglTexture,i.TEXTURE0+F);const K=n.get(tt);if(tt.version!==K.__version||j===!0){e.activeTexture(i.TEXTURE0+F);const Et=Kt.getPrimaries(Kt.workingColorSpace),ct=v.colorSpace===ei?null:Kt.getPrimaries(v.colorSpace),pt=v.colorSpace===ei||Et===ct?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,pt);const $t=v.isCompressedTexture||v.image[0].isCompressedTexture,it=v.image[0]&&v.image[0].isDataTexture,mt=[];for(let J=0;J<6;J++)!$t&&!it?mt[J]=_(v.image[J],!0,s.maxCubemapSize):mt[J]=it?v.image[J].image:v.image[J],mt[J]=le(v,mt[J]);const Rt=mt[0],Pt=r.convert(v.format,v.colorSpace),gt=r.convert(v.type),qt=E(v.internalFormat,Pt,gt,v.colorSpace),Ht=v.isVideoTexture!==!0,ae=K.__version===void 0||j===!0,P=tt.dataReady;let lt=D(v,Rt);zt(i.TEXTURE_CUBE_MAP,v);let V;if($t){Ht&&ae&&e.texStorage2D(i.TEXTURE_CUBE_MAP,lt,qt,Rt.width,Rt.height);for(let J=0;J<6;J++){V=mt[J].mipmaps;for(let ft=0;ft<V.length;ft++){const ht=V[ft];v.format!==cn?Pt!==null?Ht?P&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,ft,0,0,ht.width,ht.height,Pt,ht.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,ft,qt,ht.width,ht.height,0,ht.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ht?P&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,ft,0,0,ht.width,ht.height,Pt,gt,ht.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,ft,qt,ht.width,ht.height,0,Pt,gt,ht.data)}}}else{if(V=v.mipmaps,Ht&&ae){V.length>0&&lt++;const J=At(mt[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,lt,qt,J.width,J.height)}for(let J=0;J<6;J++)if(it){Ht?P&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,mt[J].width,mt[J].height,Pt,gt,mt[J].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,qt,mt[J].width,mt[J].height,0,Pt,gt,mt[J].data);for(let ft=0;ft<V.length;ft++){const Nt=V[ft].image[J].image;Ht?P&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,ft+1,0,0,Nt.width,Nt.height,Pt,gt,Nt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,ft+1,qt,Nt.width,Nt.height,0,Pt,gt,Nt.data)}}else{Ht?P&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,Pt,gt,mt[J]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,qt,Pt,gt,mt[J]);for(let ft=0;ft<V.length;ft++){const ht=V[ft];Ht?P&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,ft+1,0,0,Pt,gt,ht.image[J]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,ft+1,qt,Pt,gt,ht.image[J])}}}m(v)&&f(i.TEXTURE_CUBE_MAP),K.__version=tt.version,v.onUpdate&&v.onUpdate(v)}A.__version=v.version}function vt(A,v,F,j,tt,K){const Et=r.convert(F.format,F.colorSpace),ct=r.convert(F.type),pt=E(F.internalFormat,Et,ct,F.colorSpace),$t=n.get(v),it=n.get(F);if(it.__renderTarget=v,!$t.__hasExternalTextures){const mt=Math.max(1,v.width>>K),Rt=Math.max(1,v.height>>K);tt===i.TEXTURE_3D||tt===i.TEXTURE_2D_ARRAY?e.texImage3D(tt,K,pt,mt,Rt,v.depth,0,Et,ct,null):e.texImage2D(tt,K,pt,mt,Rt,0,Et,ct,null)}e.bindFramebuffer(i.FRAMEBUFFER,A),Xt(v)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,j,tt,it.__webglTexture,0,Wt(v)):(tt===i.TEXTURE_2D||tt>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&tt<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,j,tt,it.__webglTexture,K),e.bindFramebuffer(i.FRAMEBUFFER,null)}function rt(A,v,F){if(i.bindRenderbuffer(i.RENDERBUFFER,A),v.depthBuffer){const j=v.depthTexture,tt=j&&j.isDepthTexture?j.type:null,K=y(v.stencilBuffer,tt),Et=v.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ct=Wt(v);Xt(v)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ct,K,v.width,v.height):F?i.renderbufferStorageMultisample(i.RENDERBUFFER,ct,K,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,K,v.width,v.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Et,i.RENDERBUFFER,A)}else{const j=v.textures;for(let tt=0;tt<j.length;tt++){const K=j[tt],Et=r.convert(K.format,K.colorSpace),ct=r.convert(K.type),pt=E(K.internalFormat,Et,ct,K.colorSpace),$t=Wt(v);F&&Xt(v)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,$t,pt,v.width,v.height):Xt(v)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,$t,pt,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,pt,v.width,v.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function bt(A,v){if(v&&v.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(i.FRAMEBUFFER,A),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const j=n.get(v.depthTexture);j.__renderTarget=v,(!j.__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),X(v.depthTexture,0);const tt=j.__webglTexture,K=Wt(v);if(v.depthTexture.format===ts)Xt(v)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,tt,0,K):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,tt,0);else if(v.depthTexture.format===hs)Xt(v)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,tt,0,K):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,tt,0);else throw new Error("Unknown depthTexture format")}function Lt(A){const v=n.get(A),F=A.isWebGLCubeRenderTarget===!0;if(v.__boundDepthTexture!==A.depthTexture){const j=A.depthTexture;if(v.__depthDisposeCallback&&v.__depthDisposeCallback(),j){const tt=()=>{delete v.__boundDepthTexture,delete v.__depthDisposeCallback,j.removeEventListener("dispose",tt)};j.addEventListener("dispose",tt),v.__depthDisposeCallback=tt}v.__boundDepthTexture=j}if(A.depthTexture&&!v.__autoAllocateDepthBuffer){if(F)throw new Error("target.depthTexture not supported in Cube render targets");bt(v.__webglFramebuffer,A)}else if(F){v.__webglDepthbuffer=[];for(let j=0;j<6;j++)if(e.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[j]),v.__webglDepthbuffer[j]===void 0)v.__webglDepthbuffer[j]=i.createRenderbuffer(),rt(v.__webglDepthbuffer[j],A,!1);else{const tt=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,K=v.__webglDepthbuffer[j];i.bindRenderbuffer(i.RENDERBUFFER,K),i.framebufferRenderbuffer(i.FRAMEBUFFER,tt,i.RENDERBUFFER,K)}}else if(e.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer===void 0)v.__webglDepthbuffer=i.createRenderbuffer(),rt(v.__webglDepthbuffer,A,!1);else{const j=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,tt=v.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,tt),i.framebufferRenderbuffer(i.FRAMEBUFFER,j,i.RENDERBUFFER,tt)}e.bindFramebuffer(i.FRAMEBUFFER,null)}function kt(A,v,F){const j=n.get(A);v!==void 0&&vt(j.__webglFramebuffer,A,A.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),F!==void 0&&Lt(A)}function de(A){const v=A.texture,F=n.get(A),j=n.get(v);A.addEventListener("dispose",w);const tt=A.textures,K=A.isWebGLCubeRenderTarget===!0,Et=tt.length>1;if(Et||(j.__webglTexture===void 0&&(j.__webglTexture=i.createTexture()),j.__version=v.version,a.memory.textures++),K){F.__webglFramebuffer=[];for(let ct=0;ct<6;ct++)if(v.mipmaps&&v.mipmaps.length>0){F.__webglFramebuffer[ct]=[];for(let pt=0;pt<v.mipmaps.length;pt++)F.__webglFramebuffer[ct][pt]=i.createFramebuffer()}else F.__webglFramebuffer[ct]=i.createFramebuffer()}else{if(v.mipmaps&&v.mipmaps.length>0){F.__webglFramebuffer=[];for(let ct=0;ct<v.mipmaps.length;ct++)F.__webglFramebuffer[ct]=i.createFramebuffer()}else F.__webglFramebuffer=i.createFramebuffer();if(Et)for(let ct=0,pt=tt.length;ct<pt;ct++){const $t=n.get(tt[ct]);$t.__webglTexture===void 0&&($t.__webglTexture=i.createTexture(),a.memory.textures++)}if(A.samples>0&&Xt(A)===!1){F.__webglMultisampledFramebuffer=i.createFramebuffer(),F.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,F.__webglMultisampledFramebuffer);for(let ct=0;ct<tt.length;ct++){const pt=tt[ct];F.__webglColorRenderbuffer[ct]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,F.__webglColorRenderbuffer[ct]);const $t=r.convert(pt.format,pt.colorSpace),it=r.convert(pt.type),mt=E(pt.internalFormat,$t,it,pt.colorSpace,A.isXRRenderTarget===!0),Rt=Wt(A);i.renderbufferStorageMultisample(i.RENDERBUFFER,Rt,mt,A.width,A.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ct,i.RENDERBUFFER,F.__webglColorRenderbuffer[ct])}i.bindRenderbuffer(i.RENDERBUFFER,null),A.depthBuffer&&(F.__webglDepthRenderbuffer=i.createRenderbuffer(),rt(F.__webglDepthRenderbuffer,A,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(K){e.bindTexture(i.TEXTURE_CUBE_MAP,j.__webglTexture),zt(i.TEXTURE_CUBE_MAP,v);for(let ct=0;ct<6;ct++)if(v.mipmaps&&v.mipmaps.length>0)for(let pt=0;pt<v.mipmaps.length;pt++)vt(F.__webglFramebuffer[ct][pt],A,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,pt);else vt(F.__webglFramebuffer[ct],A,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,0);m(v)&&f(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(Et){for(let ct=0,pt=tt.length;ct<pt;ct++){const $t=tt[ct],it=n.get($t);e.bindTexture(i.TEXTURE_2D,it.__webglTexture),zt(i.TEXTURE_2D,$t),vt(F.__webglFramebuffer,A,$t,i.COLOR_ATTACHMENT0+ct,i.TEXTURE_2D,0),m($t)&&f(i.TEXTURE_2D)}e.unbindTexture()}else{let ct=i.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(ct=A.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(ct,j.__webglTexture),zt(ct,v),v.mipmaps&&v.mipmaps.length>0)for(let pt=0;pt<v.mipmaps.length;pt++)vt(F.__webglFramebuffer[pt],A,v,i.COLOR_ATTACHMENT0,ct,pt);else vt(F.__webglFramebuffer,A,v,i.COLOR_ATTACHMENT0,ct,0);m(v)&&f(ct),e.unbindTexture()}A.depthBuffer&&Lt(A)}function Yt(A){const v=A.textures;for(let F=0,j=v.length;F<j;F++){const tt=v[F];if(m(tt)){const K=x(A),Et=n.get(tt).__webglTexture;e.bindTexture(K,Et),f(K),e.unbindTexture()}}}const _e=[],N=[];function tn(A){if(A.samples>0){if(Xt(A)===!1){const v=A.textures,F=A.width,j=A.height;let tt=i.COLOR_BUFFER_BIT;const K=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Et=n.get(A),ct=v.length>1;if(ct)for(let pt=0;pt<v.length;pt++)e.bindFramebuffer(i.FRAMEBUFFER,Et.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+pt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,Et.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+pt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,Et.__webglMultisampledFramebuffer),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Et.__webglFramebuffer);for(let pt=0;pt<v.length;pt++){if(A.resolveDepthBuffer&&(A.depthBuffer&&(tt|=i.DEPTH_BUFFER_BIT),A.stencilBuffer&&A.resolveStencilBuffer&&(tt|=i.STENCIL_BUFFER_BIT)),ct){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Et.__webglColorRenderbuffer[pt]);const $t=n.get(v[pt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,$t,0)}i.blitFramebuffer(0,0,F,j,0,0,F,j,tt,i.NEAREST),l===!0&&(_e.length=0,N.length=0,_e.push(i.COLOR_ATTACHMENT0+pt),A.depthBuffer&&A.resolveDepthBuffer===!1&&(_e.push(K),N.push(K),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,N)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,_e))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ct)for(let pt=0;pt<v.length;pt++){e.bindFramebuffer(i.FRAMEBUFFER,Et.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+pt,i.RENDERBUFFER,Et.__webglColorRenderbuffer[pt]);const $t=n.get(v[pt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,Et.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+pt,i.TEXTURE_2D,$t,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Et.__webglMultisampledFramebuffer)}else if(A.depthBuffer&&A.resolveDepthBuffer===!1&&l){const v=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[v])}}}function Wt(A){return Math.min(s.maxSamples,A.samples)}function Xt(A){const v=n.get(A);return A.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function wt(A){const v=a.render.frame;u.get(A)!==v&&(u.set(A,v),A.update())}function le(A,v){const F=A.colorSpace,j=A.format,tt=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||F!==ds&&F!==ei&&(Kt.getTransfer(F)===se?(j!==cn||tt!==kn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",F)),v}function At(A){return typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement?(c.width=A.naturalWidth||A.width,c.height=A.naturalHeight||A.height):typeof VideoFrame<"u"&&A instanceof VideoFrame?(c.width=A.displayWidth,c.height=A.displayHeight):(c.width=A.width,c.height=A.height),c}this.allocateTextureUnit=B,this.resetTextureUnits=q,this.setTexture2D=X,this.setTexture2DArray=$,this.setTexture3D=Q,this.setTextureCube=G,this.rebindTextures=kt,this.setupRenderTarget=de,this.updateRenderTargetMipmap=Yt,this.updateMultisampleRenderTarget=tn,this.setupDepthRenderbuffer=Lt,this.setupFrameBufferTexture=vt,this.useMultisampledRTT=Xt}function rg(i,t){function e(n,s=ei){let r;const a=Kt.getTransfer(s);if(n===kn)return i.UNSIGNED_BYTE;if(n===Jo)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Qo)return i.UNSIGNED_SHORT_5_5_5_1;if(n===lh)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===ah)return i.BYTE;if(n===oh)return i.SHORT;if(n===Hs)return i.UNSIGNED_SHORT;if(n===jo)return i.INT;if(n===Ci)return i.UNSIGNED_INT;if(n===Nn)return i.FLOAT;if(n===Ws)return i.HALF_FLOAT;if(n===ch)return i.ALPHA;if(n===hh)return i.RGB;if(n===cn)return i.RGBA;if(n===uh)return i.LUMINANCE;if(n===fh)return i.LUMINANCE_ALPHA;if(n===ts)return i.DEPTH_COMPONENT;if(n===hs)return i.DEPTH_STENCIL;if(n===dh)return i.RED;if(n===tl)return i.RED_INTEGER;if(n===ph)return i.RG;if(n===el)return i.RG_INTEGER;if(n===nl)return i.RGBA_INTEGER;if(n===Or||n===Fr||n===Br||n===zr)if(a===se)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Or)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Fr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Br)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===zr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Or)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Fr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Br)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===zr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===lo||n===co||n===ho||n===uo)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===lo)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===co)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===ho)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===uo)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===fo||n===po||n===mo)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===fo||n===po)return a===se?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===mo)return a===se?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===go||n===_o||n===vo||n===xo||n===Mo||n===So||n===yo||n===Eo||n===To||n===bo||n===Ao||n===wo||n===Ro||n===Co)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===go)return a===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===_o)return a===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===vo)return a===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===xo)return a===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Mo)return a===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===So)return a===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===yo)return a===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Eo)return a===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===To)return a===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===bo)return a===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Ao)return a===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===wo)return a===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Ro)return a===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Co)return a===se?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===kr||n===Lo||n===Po)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===kr)return a===se?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Lo)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Po)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===mh||n===Do||n===Io||n===Uo)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===kr)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Do)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Io)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Uo)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===cs?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}class ag extends rn{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}class Ai extends Ve{constructor(){super(),this.isGroup=!0,this.type="Group"}}const og={type:"move"};class Fa{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ai,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ai,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new O,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new O),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ai,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new O,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new O),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(const _ of t.hand.values()){const m=e.getJointPose(_,n),f=this._getHandJoint(c,_);m!==null&&(f.matrix.fromArray(m.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=m.radius),f.visible=m!==null}const u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],d=u.position.distanceTo(h.position),p=.02,g=.005;c.inputState.pinching&&d>p+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&d<=p-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(og)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new Ai;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}const lg=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,cg=`
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

}`;class hg{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){const s=new Fe,r=t.properties.get(s);r.__webglTexture=e.texture,(e.depthNear!=n.depthNear||e.depthFar!=n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=s}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new vn({vertexShader:lg,fragmentShader:cg,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Le(new wi(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class ug extends ps{constructor(t,e){super();const n=this;let s=null,r=1,a=null,o="local-floor",l=1,c=null,u=null,h=null,d=null,p=null,g=null;const _=new hg,m=e.getContextAttributes();let f=null,x=null;const E=[],y=[],D=new ne;let R=null;const w=new rn;w.viewport=new Me;const C=new rn;C.viewport=new Me;const T=[w,C],S=new ag;let L=null,q=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let nt=E[Y];return nt===void 0&&(nt=new Fa,E[Y]=nt),nt.getTargetRaySpace()},this.getControllerGrip=function(Y){let nt=E[Y];return nt===void 0&&(nt=new Fa,E[Y]=nt),nt.getGripSpace()},this.getHand=function(Y){let nt=E[Y];return nt===void 0&&(nt=new Fa,E[Y]=nt),nt.getHandSpace()};function B(Y){const nt=y.indexOf(Y.inputSource);if(nt===-1)return;const vt=E[nt];vt!==void 0&&(vt.update(Y.inputSource,Y.frame,c||a),vt.dispatchEvent({type:Y.type,data:Y.inputSource}))}function Z(){s.removeEventListener("select",B),s.removeEventListener("selectstart",B),s.removeEventListener("selectend",B),s.removeEventListener("squeeze",B),s.removeEventListener("squeezestart",B),s.removeEventListener("squeezeend",B),s.removeEventListener("end",Z),s.removeEventListener("inputsourceschange",X);for(let Y=0;Y<E.length;Y++){const nt=y[Y];nt!==null&&(y[Y]=null,E[Y].disconnect(nt))}L=null,q=null,_.reset(),t.setRenderTarget(f),p=null,d=null,h=null,s=null,x=null,Qt.stop(),n.isPresenting=!1,t.setPixelRatio(R),t.setSize(D.width,D.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){r=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){o=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(Y){c=Y},this.getBaseLayer=function(){return d!==null?d:p},this.getBinding=function(){return h},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(Y){if(s=Y,s!==null){if(f=t.getRenderTarget(),s.addEventListener("select",B),s.addEventListener("selectstart",B),s.addEventListener("selectend",B),s.addEventListener("squeeze",B),s.addEventListener("squeezestart",B),s.addEventListener("squeezeend",B),s.addEventListener("end",Z),s.addEventListener("inputsourceschange",X),m.xrCompatible!==!0&&await e.makeXRCompatible(),R=t.getPixelRatio(),t.getSize(D),s.renderState.layers===void 0){const nt={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,e,nt),s.updateRenderState({baseLayer:p}),t.setPixelRatio(1),t.setSize(p.framebufferWidth,p.framebufferHeight,!1),x=new Li(p.framebufferWidth,p.framebufferHeight,{format:cn,type:kn,colorSpace:t.outputColorSpace,stencilBuffer:m.stencil})}else{let nt=null,vt=null,rt=null;m.depth&&(rt=m.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,nt=m.stencil?hs:ts,vt=m.stencil?cs:Ci);const bt={colorFormat:e.RGBA8,depthFormat:rt,scaleFactor:r};h=new XRWebGLBinding(s,e),d=h.createProjectionLayer(bt),s.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),x=new Li(d.textureWidth,d.textureHeight,{format:cn,type:kn,depthTexture:new Ch(d.textureWidth,d.textureHeight,vt,void 0,void 0,void 0,void 0,void 0,void 0,nt),stencilBuffer:m.stencil,colorSpace:t.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),Qt.setContext(s),Qt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function X(Y){for(let nt=0;nt<Y.removed.length;nt++){const vt=Y.removed[nt],rt=y.indexOf(vt);rt>=0&&(y[rt]=null,E[rt].disconnect(vt))}for(let nt=0;nt<Y.added.length;nt++){const vt=Y.added[nt];let rt=y.indexOf(vt);if(rt===-1){for(let Lt=0;Lt<E.length;Lt++)if(Lt>=y.length){y.push(vt),rt=Lt;break}else if(y[Lt]===null){y[Lt]=vt,rt=Lt;break}if(rt===-1)break}const bt=E[rt];bt&&bt.connect(vt)}}const $=new O,Q=new O;function G(Y,nt,vt){$.setFromMatrixPosition(nt.matrixWorld),Q.setFromMatrixPosition(vt.matrixWorld);const rt=$.distanceTo(Q),bt=nt.projectionMatrix.elements,Lt=vt.projectionMatrix.elements,kt=bt[14]/(bt[10]-1),de=bt[14]/(bt[10]+1),Yt=(bt[9]+1)/bt[5],_e=(bt[9]-1)/bt[5],N=(bt[8]-1)/bt[0],tn=(Lt[8]+1)/Lt[0],Wt=kt*N,Xt=kt*tn,wt=rt/(-N+tn),le=wt*-N;if(nt.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(le),Y.translateZ(wt),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),bt[10]===-1)Y.projectionMatrix.copy(nt.projectionMatrix),Y.projectionMatrixInverse.copy(nt.projectionMatrixInverse);else{const At=kt+wt,A=de+wt,v=Wt-le,F=Xt+(rt-le),j=Yt*de/A*At,tt=_e*de/A*At;Y.projectionMatrix.makePerspective(v,F,j,tt,At,A),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function ot(Y,nt){nt===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(nt.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(s===null)return;let nt=Y.near,vt=Y.far;_.texture!==null&&(_.depthNear>0&&(nt=_.depthNear),_.depthFar>0&&(vt=_.depthFar)),S.near=C.near=w.near=nt,S.far=C.far=w.far=vt,(L!==S.near||q!==S.far)&&(s.updateRenderState({depthNear:S.near,depthFar:S.far}),L=S.near,q=S.far),w.layers.mask=Y.layers.mask|2,C.layers.mask=Y.layers.mask|4,S.layers.mask=w.layers.mask|C.layers.mask;const rt=Y.parent,bt=S.cameras;ot(S,rt);for(let Lt=0;Lt<bt.length;Lt++)ot(bt[Lt],rt);bt.length===2?G(S,w,C):S.projectionMatrix.copy(w.projectionMatrix),dt(Y,S,rt)};function dt(Y,nt,vt){vt===null?Y.matrix.copy(nt.matrixWorld):(Y.matrix.copy(vt.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(nt.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(nt.projectionMatrix),Y.projectionMatrixInverse.copy(nt.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=No*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return S},this.getFoveation=function(){if(!(d===null&&p===null))return l},this.setFoveation=function(Y){l=Y,d!==null&&(d.fixedFoveation=Y),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=Y)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(S)};let yt=null;function zt(Y,nt){if(u=nt.getViewerPose(c||a),g=nt,u!==null){const vt=u.views;p!==null&&(t.setRenderTargetFramebuffer(x,p.framebuffer),t.setRenderTarget(x));let rt=!1;vt.length!==S.cameras.length&&(S.cameras.length=0,rt=!0);for(let Lt=0;Lt<vt.length;Lt++){const kt=vt[Lt];let de=null;if(p!==null)de=p.getViewport(kt);else{const _e=h.getViewSubImage(d,kt);de=_e.viewport,Lt===0&&(t.setRenderTargetTextures(x,_e.colorTexture,d.ignoreDepthValues?void 0:_e.depthStencilTexture),t.setRenderTarget(x))}let Yt=T[Lt];Yt===void 0&&(Yt=new rn,Yt.layers.enable(Lt),Yt.viewport=new Me,T[Lt]=Yt),Yt.matrix.fromArray(kt.transform.matrix),Yt.matrix.decompose(Yt.position,Yt.quaternion,Yt.scale),Yt.projectionMatrix.fromArray(kt.projectionMatrix),Yt.projectionMatrixInverse.copy(Yt.projectionMatrix).invert(),Yt.viewport.set(de.x,de.y,de.width,de.height),Lt===0&&(S.matrix.copy(Yt.matrix),S.matrix.decompose(S.position,S.quaternion,S.scale)),rt===!0&&S.cameras.push(Yt)}const bt=s.enabledFeatures;if(bt&&bt.includes("depth-sensing")){const Lt=h.getDepthInformation(vt[0]);Lt&&Lt.isValid&&Lt.texture&&_.init(t,Lt,s.renderState)}}for(let vt=0;vt<E.length;vt++){const rt=y[vt],bt=E[vt];rt!==null&&bt!==void 0&&bt.update(rt,nt,c||a)}yt&&yt(Y,nt),nt.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:nt}),g=null}const Qt=new Rh;Qt.setAnimationLoop(zt),this.setAnimationLoop=function(Y){yt=Y},this.dispose=function(){}}}const xi=new Hn,fg=new ge;function dg(i,t){function e(m,f){m.matrixAutoUpdate===!0&&m.updateMatrix(),f.value.copy(m.matrix)}function n(m,f){f.color.getRGB(m.fogColor.value,Th(i)),f.isFog?(m.fogNear.value=f.near,m.fogFar.value=f.far):f.isFogExp2&&(m.fogDensity.value=f.density)}function s(m,f,x,E,y){f.isMeshBasicMaterial||f.isMeshLambertMaterial?r(m,f):f.isMeshToonMaterial?(r(m,f),h(m,f)):f.isMeshPhongMaterial?(r(m,f),u(m,f)):f.isMeshStandardMaterial?(r(m,f),d(m,f),f.isMeshPhysicalMaterial&&p(m,f,y)):f.isMeshMatcapMaterial?(r(m,f),g(m,f)):f.isMeshDepthMaterial?r(m,f):f.isMeshDistanceMaterial?(r(m,f),_(m,f)):f.isMeshNormalMaterial?r(m,f):f.isLineBasicMaterial?(a(m,f),f.isLineDashedMaterial&&o(m,f)):f.isPointsMaterial?l(m,f,x,E):f.isSpriteMaterial?c(m,f):f.isShadowMaterial?(m.color.value.copy(f.color),m.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function r(m,f){m.opacity.value=f.opacity,f.color&&m.diffuse.value.copy(f.color),f.emissive&&m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(m.map.value=f.map,e(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,e(f.alphaMap,m.alphaMapTransform)),f.bumpMap&&(m.bumpMap.value=f.bumpMap,e(f.bumpMap,m.bumpMapTransform),m.bumpScale.value=f.bumpScale,f.side===He&&(m.bumpScale.value*=-1)),f.normalMap&&(m.normalMap.value=f.normalMap,e(f.normalMap,m.normalMapTransform),m.normalScale.value.copy(f.normalScale),f.side===He&&m.normalScale.value.negate()),f.displacementMap&&(m.displacementMap.value=f.displacementMap,e(f.displacementMap,m.displacementMapTransform),m.displacementScale.value=f.displacementScale,m.displacementBias.value=f.displacementBias),f.emissiveMap&&(m.emissiveMap.value=f.emissiveMap,e(f.emissiveMap,m.emissiveMapTransform)),f.specularMap&&(m.specularMap.value=f.specularMap,e(f.specularMap,m.specularMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);const x=t.get(f),E=x.envMap,y=x.envMapRotation;E&&(m.envMap.value=E,xi.copy(y),xi.x*=-1,xi.y*=-1,xi.z*=-1,E.isCubeTexture&&E.isRenderTargetTexture===!1&&(xi.y*=-1,xi.z*=-1),m.envMapRotation.value.setFromMatrix4(fg.makeRotationFromEuler(xi)),m.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=f.reflectivity,m.ior.value=f.ior,m.refractionRatio.value=f.refractionRatio),f.lightMap&&(m.lightMap.value=f.lightMap,m.lightMapIntensity.value=f.lightMapIntensity,e(f.lightMap,m.lightMapTransform)),f.aoMap&&(m.aoMap.value=f.aoMap,m.aoMapIntensity.value=f.aoMapIntensity,e(f.aoMap,m.aoMapTransform))}function a(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,f.map&&(m.map.value=f.map,e(f.map,m.mapTransform))}function o(m,f){m.dashSize.value=f.dashSize,m.totalSize.value=f.dashSize+f.gapSize,m.scale.value=f.scale}function l(m,f,x,E){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.size.value=f.size*x,m.scale.value=E*.5,f.map&&(m.map.value=f.map,e(f.map,m.uvTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,e(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function c(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.rotation.value=f.rotation,f.map&&(m.map.value=f.map,e(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,e(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function u(m,f){m.specular.value.copy(f.specular),m.shininess.value=Math.max(f.shininess,1e-4)}function h(m,f){f.gradientMap&&(m.gradientMap.value=f.gradientMap)}function d(m,f){m.metalness.value=f.metalness,f.metalnessMap&&(m.metalnessMap.value=f.metalnessMap,e(f.metalnessMap,m.metalnessMapTransform)),m.roughness.value=f.roughness,f.roughnessMap&&(m.roughnessMap.value=f.roughnessMap,e(f.roughnessMap,m.roughnessMapTransform)),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)}function p(m,f,x){m.ior.value=f.ior,f.sheen>0&&(m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),m.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(m.sheenColorMap.value=f.sheenColorMap,e(f.sheenColorMap,m.sheenColorMapTransform)),f.sheenRoughnessMap&&(m.sheenRoughnessMap.value=f.sheenRoughnessMap,e(f.sheenRoughnessMap,m.sheenRoughnessMapTransform))),f.clearcoat>0&&(m.clearcoat.value=f.clearcoat,m.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(m.clearcoatMap.value=f.clearcoatMap,e(f.clearcoatMap,m.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,e(f.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(m.clearcoatNormalMap.value=f.clearcoatNormalMap,e(f.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===He&&m.clearcoatNormalScale.value.negate())),f.dispersion>0&&(m.dispersion.value=f.dispersion),f.iridescence>0&&(m.iridescence.value=f.iridescence,m.iridescenceIOR.value=f.iridescenceIOR,m.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(m.iridescenceMap.value=f.iridescenceMap,e(f.iridescenceMap,m.iridescenceMapTransform)),f.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=f.iridescenceThicknessMap,e(f.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),f.transmission>0&&(m.transmission.value=f.transmission,m.transmissionSamplerMap.value=x.texture,m.transmissionSamplerSize.value.set(x.width,x.height),f.transmissionMap&&(m.transmissionMap.value=f.transmissionMap,e(f.transmissionMap,m.transmissionMapTransform)),m.thickness.value=f.thickness,f.thicknessMap&&(m.thicknessMap.value=f.thicknessMap,e(f.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=f.attenuationDistance,m.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(m.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(m.anisotropyMap.value=f.anisotropyMap,e(f.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=f.specularIntensity,m.specularColor.value.copy(f.specularColor),f.specularColorMap&&(m.specularColorMap.value=f.specularColorMap,e(f.specularColorMap,m.specularColorMapTransform)),f.specularIntensityMap&&(m.specularIntensityMap.value=f.specularIntensityMap,e(f.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,f){f.matcap&&(m.matcap.value=f.matcap)}function _(m,f){const x=t.get(f).light;m.referencePosition.value.setFromMatrixPosition(x.matrixWorld),m.nearDistance.value=x.shadow.camera.near,m.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function pg(i,t,e,n){let s={},r={},a=[];const o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(x,E){const y=E.program;n.uniformBlockBinding(x,y)}function c(x,E){let y=s[x.id];y===void 0&&(g(x),y=u(x),s[x.id]=y,x.addEventListener("dispose",m));const D=E.program;n.updateUBOMapping(x,D);const R=t.render.frame;r[x.id]!==R&&(d(x),r[x.id]=R)}function u(x){const E=h();x.__bindingPointIndex=E;const y=i.createBuffer(),D=x.__size,R=x.usage;return i.bindBuffer(i.UNIFORM_BUFFER,y),i.bufferData(i.UNIFORM_BUFFER,D,R),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,E,y),y}function h(){for(let x=0;x<o;x++)if(a.indexOf(x)===-1)return a.push(x),x;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(x){const E=s[x.id],y=x.uniforms,D=x.__cache;i.bindBuffer(i.UNIFORM_BUFFER,E);for(let R=0,w=y.length;R<w;R++){const C=Array.isArray(y[R])?y[R]:[y[R]];for(let T=0,S=C.length;T<S;T++){const L=C[T];if(p(L,R,T,D)===!0){const q=L.__offset,B=Array.isArray(L.value)?L.value:[L.value];let Z=0;for(let X=0;X<B.length;X++){const $=B[X],Q=_($);typeof $=="number"||typeof $=="boolean"?(L.__data[0]=$,i.bufferSubData(i.UNIFORM_BUFFER,q+Z,L.__data)):$.isMatrix3?(L.__data[0]=$.elements[0],L.__data[1]=$.elements[1],L.__data[2]=$.elements[2],L.__data[3]=0,L.__data[4]=$.elements[3],L.__data[5]=$.elements[4],L.__data[6]=$.elements[5],L.__data[7]=0,L.__data[8]=$.elements[6],L.__data[9]=$.elements[7],L.__data[10]=$.elements[8],L.__data[11]=0):($.toArray(L.__data,Z),Z+=Q.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,q,L.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(x,E,y,D){const R=x.value,w=E+"_"+y;if(D[w]===void 0)return typeof R=="number"||typeof R=="boolean"?D[w]=R:D[w]=R.clone(),!0;{const C=D[w];if(typeof R=="number"||typeof R=="boolean"){if(C!==R)return D[w]=R,!0}else if(C.equals(R)===!1)return C.copy(R),!0}return!1}function g(x){const E=x.uniforms;let y=0;const D=16;for(let w=0,C=E.length;w<C;w++){const T=Array.isArray(E[w])?E[w]:[E[w]];for(let S=0,L=T.length;S<L;S++){const q=T[S],B=Array.isArray(q.value)?q.value:[q.value];for(let Z=0,X=B.length;Z<X;Z++){const $=B[Z],Q=_($),G=y%D,ot=G%Q.boundary,dt=G+ot;y+=ot,dt!==0&&D-dt<Q.storage&&(y+=D-dt),q.__data=new Float32Array(Q.storage/Float32Array.BYTES_PER_ELEMENT),q.__offset=y,y+=Q.storage}}}const R=y%D;return R>0&&(y+=D-R),x.__size=y,x.__cache={},this}function _(x){const E={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(E.boundary=4,E.storage=4):x.isVector2?(E.boundary=8,E.storage=8):x.isVector3||x.isColor?(E.boundary=16,E.storage=12):x.isVector4?(E.boundary=16,E.storage=16):x.isMatrix3?(E.boundary=48,E.storage=48):x.isMatrix4?(E.boundary=64,E.storage=64):x.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",x),E}function m(x){const E=x.target;E.removeEventListener("dispose",m);const y=a.indexOf(E.__bindingPointIndex);a.splice(y,1),i.deleteBuffer(s[E.id]),delete s[E.id],delete r[E.id]}function f(){for(const x in s)i.deleteBuffer(s[x]);a=[],s={},r={}}return{bind:l,update:c,dispose:f}}class mg{constructor(t={}){const{canvas:e=ef(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reverseDepthBuffer:d=!1}=t;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=a;const g=new Uint32Array(4),_=new Int32Array(4);let m=null,f=null;const x=[],E=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=sn,this.toneMapping=li,this.toneMappingExposure=1;const y=this;let D=!1,R=0,w=0,C=null,T=-1,S=null;const L=new Me,q=new Me;let B=null;const Z=new Jt(0);let X=0,$=e.width,Q=e.height,G=1,ot=null,dt=null;const yt=new Me(0,0,$,Q),zt=new Me(0,0,$,Q);let Qt=!1;const Y=new wh;let nt=!1,vt=!1;const rt=new ge,bt=new ge,Lt=new O,kt=new Me,de={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Yt=!1;function _e(){return C===null?G:1}let N=n;function tn(M,I){return e.getContext(M,I)}try{const M={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Zo}`),e.addEventListener("webglcontextlost",J,!1),e.addEventListener("webglcontextrestored",ft,!1),e.addEventListener("webglcontextcreationerror",ht,!1),N===null){const I="webgl2";if(N=tn(I,M),N===null)throw tn(I)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(M){throw console.error("THREE.WebGLRenderer: "+M.message),M}let Wt,Xt,wt,le,At,A,v,F,j,tt,K,Et,ct,pt,$t,it,mt,Rt,Pt,gt,qt,Ht,ae,P;function lt(){Wt=new Mm(N),Wt.init(),Ht=new rg(N,Wt),Xt=new dm(N,Wt,t,Ht),wt=new ng(N,Wt),Xt.reverseDepthBuffer&&d&&wt.buffers.depth.setReversed(!0),le=new Em(N),At=new H0,A=new sg(N,Wt,wt,At,Xt,Ht,le),v=new mm(y),F=new xm(y),j=new Cf(N),ae=new um(N,j),tt=new Sm(N,j,le,ae),K=new bm(N,tt,j,le),Pt=new Tm(N,Xt,A),it=new pm(At),Et=new k0(y,v,F,Wt,Xt,ae,it),ct=new dg(y,At),pt=new V0,$t=new K0(Wt),Rt=new hm(y,v,F,wt,K,p,l),mt=new tg(y,K,Xt),P=new pg(N,le,Xt,wt),gt=new fm(N,Wt,le),qt=new ym(N,Wt,le),le.programs=Et.programs,y.capabilities=Xt,y.extensions=Wt,y.properties=At,y.renderLists=pt,y.shadowMap=mt,y.state=wt,y.info=le}lt();const V=new ug(y,N);this.xr=V,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){const M=Wt.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){const M=Wt.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return G},this.setPixelRatio=function(M){M!==void 0&&(G=M,this.setSize($,Q,!1))},this.getSize=function(M){return M.set($,Q)},this.setSize=function(M,I,z=!0){if(V.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}$=M,Q=I,e.width=Math.floor(M*G),e.height=Math.floor(I*G),z===!0&&(e.style.width=M+"px",e.style.height=I+"px"),this.setViewport(0,0,M,I)},this.getDrawingBufferSize=function(M){return M.set($*G,Q*G).floor()},this.setDrawingBufferSize=function(M,I,z){$=M,Q=I,G=z,e.width=Math.floor(M*z),e.height=Math.floor(I*z),this.setViewport(0,0,M,I)},this.getCurrentViewport=function(M){return M.copy(L)},this.getViewport=function(M){return M.copy(yt)},this.setViewport=function(M,I,z,k){M.isVector4?yt.set(M.x,M.y,M.z,M.w):yt.set(M,I,z,k),wt.viewport(L.copy(yt).multiplyScalar(G).round())},this.getScissor=function(M){return M.copy(zt)},this.setScissor=function(M,I,z,k){M.isVector4?zt.set(M.x,M.y,M.z,M.w):zt.set(M,I,z,k),wt.scissor(q.copy(zt).multiplyScalar(G).round())},this.getScissorTest=function(){return Qt},this.setScissorTest=function(M){wt.setScissorTest(Qt=M)},this.setOpaqueSort=function(M){ot=M},this.setTransparentSort=function(M){dt=M},this.getClearColor=function(M){return M.copy(Rt.getClearColor())},this.setClearColor=function(){Rt.setClearColor.apply(Rt,arguments)},this.getClearAlpha=function(){return Rt.getClearAlpha()},this.setClearAlpha=function(){Rt.setClearAlpha.apply(Rt,arguments)},this.clear=function(M=!0,I=!0,z=!0){let k=0;if(M){let U=!1;if(C!==null){const st=C.texture.format;U=st===nl||st===el||st===tl}if(U){const st=C.texture.type,ut=st===kn||st===Ci||st===Hs||st===cs||st===Jo||st===Qo,xt=Rt.getClearColor(),Mt=Rt.getClearAlpha(),Dt=xt.r,Ot=xt.g,St=xt.b;ut?(g[0]=Dt,g[1]=Ot,g[2]=St,g[3]=Mt,N.clearBufferuiv(N.COLOR,0,g)):(_[0]=Dt,_[1]=Ot,_[2]=St,_[3]=Mt,N.clearBufferiv(N.COLOR,0,_))}else k|=N.COLOR_BUFFER_BIT}I&&(k|=N.DEPTH_BUFFER_BIT),z&&(k|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),N.clear(k)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",J,!1),e.removeEventListener("webglcontextrestored",ft,!1),e.removeEventListener("webglcontextcreationerror",ht,!1),pt.dispose(),$t.dispose(),At.dispose(),v.dispose(),F.dispose(),K.dispose(),ae.dispose(),P.dispose(),Et.dispose(),V.dispose(),V.removeEventListener("sessionstart",vl),V.removeEventListener("sessionend",xl),di.stop()};function J(M){M.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),D=!0}function ft(){console.log("THREE.WebGLRenderer: Context Restored."),D=!1;const M=le.autoReset,I=mt.enabled,z=mt.autoUpdate,k=mt.needsUpdate,U=mt.type;lt(),le.autoReset=M,mt.enabled=I,mt.autoUpdate=z,mt.needsUpdate=k,mt.type=U}function ht(M){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function Nt(M){const I=M.target;I.removeEventListener("dispose",Nt),me(I)}function me(M){Ue(M),At.remove(M)}function Ue(M){const I=At.get(M).programs;I!==void 0&&(I.forEach(function(z){Et.releaseProgram(z)}),M.isShaderMaterial&&Et.releaseShaderCache(M))}this.renderBufferDirect=function(M,I,z,k,U,st){I===null&&(I=de);const ut=U.isMesh&&U.matrixWorld.determinant()<0,xt=cu(M,I,z,k,U);wt.setMaterial(k,ut);let Mt=z.index,Dt=1;if(k.wireframe===!0){if(Mt=tt.getWireframeAttribute(z),Mt===void 0)return;Dt=2}const Ot=z.drawRange,St=z.attributes.position;let Zt=Ot.start*Dt,oe=(Ot.start+Ot.count)*Dt;st!==null&&(Zt=Math.max(Zt,st.start*Dt),oe=Math.min(oe,(st.start+st.count)*Dt)),Mt!==null?(Zt=Math.max(Zt,0),oe=Math.min(oe,Mt.count)):St!=null&&(Zt=Math.max(Zt,0),oe=Math.min(oe,St.count));const ce=oe-Zt;if(ce<0||ce===1/0)return;ae.setup(U,k,xt,z,Mt);let Xe,te=gt;if(Mt!==null&&(Xe=j.get(Mt),te=qt,te.setIndex(Xe)),U.isMesh)k.wireframe===!0?(wt.setLineWidth(k.wireframeLinewidth*_e()),te.setMode(N.LINES)):te.setMode(N.TRIANGLES);else if(U.isLine){let Tt=k.linewidth;Tt===void 0&&(Tt=1),wt.setLineWidth(Tt*_e()),U.isLineSegments?te.setMode(N.LINES):U.isLineLoop?te.setMode(N.LINE_LOOP):te.setMode(N.LINE_STRIP)}else U.isPoints?te.setMode(N.POINTS):U.isSprite&&te.setMode(N.TRIANGLES);if(U.isBatchedMesh)if(U._multiDrawInstances!==null)te.renderMultiDrawInstances(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount,U._multiDrawInstances);else if(Wt.get("WEBGL_multi_draw"))te.renderMultiDraw(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount);else{const Tt=U._multiDrawStarts,An=U._multiDrawCounts,ee=U._multiDrawCount,dn=Mt?j.get(Mt).bytesPerElement:1,Ui=At.get(k).currentProgram.getUniforms();for(let $e=0;$e<ee;$e++)Ui.setValue(N,"_gl_DrawID",$e),te.render(Tt[$e]/dn,An[$e])}else if(U.isInstancedMesh)te.renderInstances(Zt,ce,U.count);else if(z.isInstancedBufferGeometry){const Tt=z._maxInstanceCount!==void 0?z._maxInstanceCount:1/0,An=Math.min(z.instanceCount,Tt);te.renderInstances(Zt,ce,An)}else te.render(Zt,ce)};function ie(M,I,z){M.transparent===!0&&M.side===on&&M.forceSinglePass===!1?(M.side=He,M.needsUpdate=!0,ir(M,I,z),M.side=zn,M.needsUpdate=!0,ir(M,I,z),M.side=on):ir(M,I,z)}this.compile=function(M,I,z=null){z===null&&(z=M),f=$t.get(z),f.init(I),E.push(f),z.traverseVisible(function(U){U.isLight&&U.layers.test(I.layers)&&(f.pushLight(U),U.castShadow&&f.pushShadow(U))}),M!==z&&M.traverseVisible(function(U){U.isLight&&U.layers.test(I.layers)&&(f.pushLight(U),U.castShadow&&f.pushShadow(U))}),f.setupLights();const k=new Set;return M.traverse(function(U){if(!(U.isMesh||U.isPoints||U.isLine||U.isSprite))return;const st=U.material;if(st)if(Array.isArray(st))for(let ut=0;ut<st.length;ut++){const xt=st[ut];ie(xt,z,U),k.add(xt)}else ie(st,z,U),k.add(st)}),E.pop(),f=null,k},this.compileAsync=function(M,I,z=null){const k=this.compile(M,I,z);return new Promise(U=>{function st(){if(k.forEach(function(ut){At.get(ut).currentProgram.isReady()&&k.delete(ut)}),k.size===0){U(M);return}setTimeout(st,10)}Wt.get("KHR_parallel_shader_compile")!==null?st():setTimeout(st,10)})};let fn=null;function bn(M){fn&&fn(M)}function vl(){di.stop()}function xl(){di.start()}const di=new Rh;di.setAnimationLoop(bn),typeof self<"u"&&di.setContext(self),this.setAnimationLoop=function(M){fn=M,V.setAnimationLoop(M),M===null?di.stop():di.start()},V.addEventListener("sessionstart",vl),V.addEventListener("sessionend",xl),this.render=function(M,I){if(I!==void 0&&I.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(D===!0)return;if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),I.parent===null&&I.matrixWorldAutoUpdate===!0&&I.updateMatrixWorld(),V.enabled===!0&&V.isPresenting===!0&&(V.cameraAutoUpdate===!0&&V.updateCamera(I),I=V.getCamera()),M.isScene===!0&&M.onBeforeRender(y,M,I,C),f=$t.get(M,E.length),f.init(I),E.push(f),bt.multiplyMatrices(I.projectionMatrix,I.matrixWorldInverse),Y.setFromProjectionMatrix(bt),vt=this.localClippingEnabled,nt=it.init(this.clippingPlanes,vt),m=pt.get(M,x.length),m.init(),x.push(m),V.enabled===!0&&V.isPresenting===!0){const st=y.xr.getDepthSensingMesh();st!==null&&la(st,I,-1/0,y.sortObjects)}la(M,I,0,y.sortObjects),m.finish(),y.sortObjects===!0&&m.sort(ot,dt),Yt=V.enabled===!1||V.isPresenting===!1||V.hasDepthSensing()===!1,Yt&&Rt.addToRenderList(m,M),this.info.render.frame++,nt===!0&&it.beginShadows();const z=f.state.shadowsArray;mt.render(z,M,I),nt===!0&&it.endShadows(),this.info.autoReset===!0&&this.info.reset();const k=m.opaque,U=m.transmissive;if(f.setupLights(),I.isArrayCamera){const st=I.cameras;if(U.length>0)for(let ut=0,xt=st.length;ut<xt;ut++){const Mt=st[ut];Sl(k,U,M,Mt)}Yt&&Rt.render(M);for(let ut=0,xt=st.length;ut<xt;ut++){const Mt=st[ut];Ml(m,M,Mt,Mt.viewport)}}else U.length>0&&Sl(k,U,M,I),Yt&&Rt.render(M),Ml(m,M,I);C!==null&&(A.updateMultisampleRenderTarget(C),A.updateRenderTargetMipmap(C)),M.isScene===!0&&M.onAfterRender(y,M,I),ae.resetDefaultState(),T=-1,S=null,E.pop(),E.length>0?(f=E[E.length-1],nt===!0&&it.setGlobalState(y.clippingPlanes,f.state.camera)):f=null,x.pop(),x.length>0?m=x[x.length-1]:m=null};function la(M,I,z,k){if(M.visible===!1)return;if(M.layers.test(I.layers)){if(M.isGroup)z=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(I);else if(M.isLight)f.pushLight(M),M.castShadow&&f.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||Y.intersectsSprite(M)){k&&kt.setFromMatrixPosition(M.matrixWorld).applyMatrix4(bt);const ut=K.update(M),xt=M.material;xt.visible&&m.push(M,ut,xt,z,kt.z,null)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||Y.intersectsObject(M))){const ut=K.update(M),xt=M.material;if(k&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),kt.copy(M.boundingSphere.center)):(ut.boundingSphere===null&&ut.computeBoundingSphere(),kt.copy(ut.boundingSphere.center)),kt.applyMatrix4(M.matrixWorld).applyMatrix4(bt)),Array.isArray(xt)){const Mt=ut.groups;for(let Dt=0,Ot=Mt.length;Dt<Ot;Dt++){const St=Mt[Dt],Zt=xt[St.materialIndex];Zt&&Zt.visible&&m.push(M,ut,Zt,z,kt.z,St)}}else xt.visible&&m.push(M,ut,xt,z,kt.z,null)}}const st=M.children;for(let ut=0,xt=st.length;ut<xt;ut++)la(st[ut],I,z,k)}function Ml(M,I,z,k){const U=M.opaque,st=M.transmissive,ut=M.transparent;f.setupLightsView(z),nt===!0&&it.setGlobalState(y.clippingPlanes,z),k&&wt.viewport(L.copy(k)),U.length>0&&nr(U,I,z),st.length>0&&nr(st,I,z),ut.length>0&&nr(ut,I,z),wt.buffers.depth.setTest(!0),wt.buffers.depth.setMask(!0),wt.buffers.color.setMask(!0),wt.setPolygonOffset(!1)}function Sl(M,I,z,k){if((z.isScene===!0?z.overrideMaterial:null)!==null)return;f.state.transmissionRenderTarget[k.id]===void 0&&(f.state.transmissionRenderTarget[k.id]=new Li(1,1,{generateMipmaps:!0,type:Wt.has("EXT_color_buffer_half_float")||Wt.has("EXT_color_buffer_float")?Ws:kn,minFilter:Tn,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Kt.workingColorSpace}));const st=f.state.transmissionRenderTarget[k.id],ut=k.viewport||L;st.setSize(ut.z,ut.w);const xt=y.getRenderTarget();y.setRenderTarget(st),y.getClearColor(Z),X=y.getClearAlpha(),X<1&&y.setClearColor(16777215,.5),y.clear(),Yt&&Rt.render(z);const Mt=y.toneMapping;y.toneMapping=li;const Dt=k.viewport;if(k.viewport!==void 0&&(k.viewport=void 0),f.setupLightsView(k),nt===!0&&it.setGlobalState(y.clippingPlanes,k),nr(M,z,k),A.updateMultisampleRenderTarget(st),A.updateRenderTargetMipmap(st),Wt.has("WEBGL_multisampled_render_to_texture")===!1){let Ot=!1;for(let St=0,Zt=I.length;St<Zt;St++){const oe=I[St],ce=oe.object,Xe=oe.geometry,te=oe.material,Tt=oe.group;if(te.side===on&&ce.layers.test(k.layers)){const An=te.side;te.side=He,te.needsUpdate=!0,yl(ce,z,k,Xe,te,Tt),te.side=An,te.needsUpdate=!0,Ot=!0}}Ot===!0&&(A.updateMultisampleRenderTarget(st),A.updateRenderTargetMipmap(st))}y.setRenderTarget(xt),y.setClearColor(Z,X),Dt!==void 0&&(k.viewport=Dt),y.toneMapping=Mt}function nr(M,I,z){const k=I.isScene===!0?I.overrideMaterial:null;for(let U=0,st=M.length;U<st;U++){const ut=M[U],xt=ut.object,Mt=ut.geometry,Dt=k===null?ut.material:k,Ot=ut.group;xt.layers.test(z.layers)&&yl(xt,I,z,Mt,Dt,Ot)}}function yl(M,I,z,k,U,st){M.onBeforeRender(y,I,z,k,U,st),M.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),U.onBeforeRender(y,I,z,k,M,st),U.transparent===!0&&U.side===on&&U.forceSinglePass===!1?(U.side=He,U.needsUpdate=!0,y.renderBufferDirect(z,I,k,U,M,st),U.side=zn,U.needsUpdate=!0,y.renderBufferDirect(z,I,k,U,M,st),U.side=on):y.renderBufferDirect(z,I,k,U,M,st),M.onAfterRender(y,I,z,k,U,st)}function ir(M,I,z){I.isScene!==!0&&(I=de);const k=At.get(M),U=f.state.lights,st=f.state.shadowsArray,ut=U.state.version,xt=Et.getParameters(M,U.state,st,I,z),Mt=Et.getProgramCacheKey(xt);let Dt=k.programs;k.environment=M.isMeshStandardMaterial?I.environment:null,k.fog=I.fog,k.envMap=(M.isMeshStandardMaterial?F:v).get(M.envMap||k.environment),k.envMapRotation=k.environment!==null&&M.envMap===null?I.environmentRotation:M.envMapRotation,Dt===void 0&&(M.addEventListener("dispose",Nt),Dt=new Map,k.programs=Dt);let Ot=Dt.get(Mt);if(Ot!==void 0){if(k.currentProgram===Ot&&k.lightsStateVersion===ut)return Tl(M,xt),Ot}else xt.uniforms=Et.getUniforms(M),M.onBeforeCompile(xt,y),Ot=Et.acquireProgram(xt,Mt),Dt.set(Mt,Ot),k.uniforms=xt.uniforms;const St=k.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(St.clippingPlanes=it.uniform),Tl(M,xt),k.needsLights=uu(M),k.lightsStateVersion=ut,k.needsLights&&(St.ambientLightColor.value=U.state.ambient,St.lightProbe.value=U.state.probe,St.directionalLights.value=U.state.directional,St.directionalLightShadows.value=U.state.directionalShadow,St.spotLights.value=U.state.spot,St.spotLightShadows.value=U.state.spotShadow,St.rectAreaLights.value=U.state.rectArea,St.ltc_1.value=U.state.rectAreaLTC1,St.ltc_2.value=U.state.rectAreaLTC2,St.pointLights.value=U.state.point,St.pointLightShadows.value=U.state.pointShadow,St.hemisphereLights.value=U.state.hemi,St.directionalShadowMap.value=U.state.directionalShadowMap,St.directionalShadowMatrix.value=U.state.directionalShadowMatrix,St.spotShadowMap.value=U.state.spotShadowMap,St.spotLightMatrix.value=U.state.spotLightMatrix,St.spotLightMap.value=U.state.spotLightMap,St.pointShadowMap.value=U.state.pointShadowMap,St.pointShadowMatrix.value=U.state.pointShadowMatrix),k.currentProgram=Ot,k.uniformsList=null,Ot}function El(M){if(M.uniformsList===null){const I=M.currentProgram.getUniforms();M.uniformsList=Gr.seqWithValue(I.seq,M.uniforms)}return M.uniformsList}function Tl(M,I){const z=At.get(M);z.outputColorSpace=I.outputColorSpace,z.batching=I.batching,z.batchingColor=I.batchingColor,z.instancing=I.instancing,z.instancingColor=I.instancingColor,z.instancingMorph=I.instancingMorph,z.skinning=I.skinning,z.morphTargets=I.morphTargets,z.morphNormals=I.morphNormals,z.morphColors=I.morphColors,z.morphTargetsCount=I.morphTargetsCount,z.numClippingPlanes=I.numClippingPlanes,z.numIntersection=I.numClipIntersection,z.vertexAlphas=I.vertexAlphas,z.vertexTangents=I.vertexTangents,z.toneMapping=I.toneMapping}function cu(M,I,z,k,U){I.isScene!==!0&&(I=de),A.resetTextureUnits();const st=I.fog,ut=k.isMeshStandardMaterial?I.environment:null,xt=C===null?y.outputColorSpace:C.isXRRenderTarget===!0?C.texture.colorSpace:ds,Mt=(k.isMeshStandardMaterial?F:v).get(k.envMap||ut),Dt=k.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,Ot=!!z.attributes.tangent&&(!!k.normalMap||k.anisotropy>0),St=!!z.morphAttributes.position,Zt=!!z.morphAttributes.normal,oe=!!z.morphAttributes.color;let ce=li;k.toneMapped&&(C===null||C.isXRRenderTarget===!0)&&(ce=y.toneMapping);const Xe=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,te=Xe!==void 0?Xe.length:0,Tt=At.get(k),An=f.state.lights;if(nt===!0&&(vt===!0||M!==S)){const en=M===S&&k.id===T;it.setState(k,M,en)}let ee=!1;k.version===Tt.__version?(Tt.needsLights&&Tt.lightsStateVersion!==An.state.version||Tt.outputColorSpace!==xt||U.isBatchedMesh&&Tt.batching===!1||!U.isBatchedMesh&&Tt.batching===!0||U.isBatchedMesh&&Tt.batchingColor===!0&&U.colorTexture===null||U.isBatchedMesh&&Tt.batchingColor===!1&&U.colorTexture!==null||U.isInstancedMesh&&Tt.instancing===!1||!U.isInstancedMesh&&Tt.instancing===!0||U.isSkinnedMesh&&Tt.skinning===!1||!U.isSkinnedMesh&&Tt.skinning===!0||U.isInstancedMesh&&Tt.instancingColor===!0&&U.instanceColor===null||U.isInstancedMesh&&Tt.instancingColor===!1&&U.instanceColor!==null||U.isInstancedMesh&&Tt.instancingMorph===!0&&U.morphTexture===null||U.isInstancedMesh&&Tt.instancingMorph===!1&&U.morphTexture!==null||Tt.envMap!==Mt||k.fog===!0&&Tt.fog!==st||Tt.numClippingPlanes!==void 0&&(Tt.numClippingPlanes!==it.numPlanes||Tt.numIntersection!==it.numIntersection)||Tt.vertexAlphas!==Dt||Tt.vertexTangents!==Ot||Tt.morphTargets!==St||Tt.morphNormals!==Zt||Tt.morphColors!==oe||Tt.toneMapping!==ce||Tt.morphTargetsCount!==te)&&(ee=!0):(ee=!0,Tt.__version=k.version);let dn=Tt.currentProgram;ee===!0&&(dn=ir(k,I,U));let Ui=!1,$e=!1,Ss=!1;const he=dn.getUniforms(),Mn=Tt.uniforms;if(wt.useProgram(dn.program)&&(Ui=!0,$e=!0,Ss=!0),k.id!==T&&(T=k.id,$e=!0),Ui||S!==M){wt.buffers.depth.getReversed()?(rt.copy(M.projectionMatrix),sf(rt),rf(rt),he.setValue(N,"projectionMatrix",rt)):he.setValue(N,"projectionMatrix",M.projectionMatrix),he.setValue(N,"viewMatrix",M.matrixWorldInverse);const Wn=he.map.cameraPosition;Wn!==void 0&&Wn.setValue(N,Lt.setFromMatrixPosition(M.matrixWorld)),Xt.logarithmicDepthBuffer&&he.setValue(N,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(k.isMeshPhongMaterial||k.isMeshToonMaterial||k.isMeshLambertMaterial||k.isMeshBasicMaterial||k.isMeshStandardMaterial||k.isShaderMaterial)&&he.setValue(N,"isOrthographic",M.isOrthographicCamera===!0),S!==M&&(S=M,$e=!0,Ss=!0)}if(U.isSkinnedMesh){he.setOptional(N,U,"bindMatrix"),he.setOptional(N,U,"bindMatrixInverse");const en=U.skeleton;en&&(en.boneTexture===null&&en.computeBoneTexture(),he.setValue(N,"boneTexture",en.boneTexture,A))}U.isBatchedMesh&&(he.setOptional(N,U,"batchingTexture"),he.setValue(N,"batchingTexture",U._matricesTexture,A),he.setOptional(N,U,"batchingIdTexture"),he.setValue(N,"batchingIdTexture",U._indirectTexture,A),he.setOptional(N,U,"batchingColorTexture"),U._colorsTexture!==null&&he.setValue(N,"batchingColorTexture",U._colorsTexture,A));const ys=z.morphAttributes;if((ys.position!==void 0||ys.normal!==void 0||ys.color!==void 0)&&Pt.update(U,z,dn),($e||Tt.receiveShadow!==U.receiveShadow)&&(Tt.receiveShadow=U.receiveShadow,he.setValue(N,"receiveShadow",U.receiveShadow)),k.isMeshGouraudMaterial&&k.envMap!==null&&(Mn.envMap.value=Mt,Mn.flipEnvMap.value=Mt.isCubeTexture&&Mt.isRenderTargetTexture===!1?-1:1),k.isMeshStandardMaterial&&k.envMap===null&&I.environment!==null&&(Mn.envMapIntensity.value=I.environmentIntensity),$e&&(he.setValue(N,"toneMappingExposure",y.toneMappingExposure),Tt.needsLights&&hu(Mn,Ss),st&&k.fog===!0&&ct.refreshFogUniforms(Mn,st),ct.refreshMaterialUniforms(Mn,k,G,Q,f.state.transmissionRenderTarget[M.id]),Gr.upload(N,El(Tt),Mn,A)),k.isShaderMaterial&&k.uniformsNeedUpdate===!0&&(Gr.upload(N,El(Tt),Mn,A),k.uniformsNeedUpdate=!1),k.isSpriteMaterial&&he.setValue(N,"center",U.center),he.setValue(N,"modelViewMatrix",U.modelViewMatrix),he.setValue(N,"normalMatrix",U.normalMatrix),he.setValue(N,"modelMatrix",U.matrixWorld),k.isShaderMaterial||k.isRawShaderMaterial){const en=k.uniformsGroups;for(let Wn=0,Xn=en.length;Wn<Xn;Wn++){const bl=en[Wn];P.update(bl,dn),P.bind(bl,dn)}}return dn}function hu(M,I){M.ambientLightColor.needsUpdate=I,M.lightProbe.needsUpdate=I,M.directionalLights.needsUpdate=I,M.directionalLightShadows.needsUpdate=I,M.pointLights.needsUpdate=I,M.pointLightShadows.needsUpdate=I,M.spotLights.needsUpdate=I,M.spotLightShadows.needsUpdate=I,M.rectAreaLights.needsUpdate=I,M.hemisphereLights.needsUpdate=I}function uu(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return w},this.getRenderTarget=function(){return C},this.setRenderTargetTextures=function(M,I,z){At.get(M.texture).__webglTexture=I,At.get(M.depthTexture).__webglTexture=z;const k=At.get(M);k.__hasExternalTextures=!0,k.__autoAllocateDepthBuffer=z===void 0,k.__autoAllocateDepthBuffer||Wt.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),k.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(M,I){const z=At.get(M);z.__webglFramebuffer=I,z.__useDefaultFramebuffer=I===void 0},this.setRenderTarget=function(M,I=0,z=0){C=M,R=I,w=z;let k=!0,U=null,st=!1,ut=!1;if(M){const Mt=At.get(M);if(Mt.__useDefaultFramebuffer!==void 0)wt.bindFramebuffer(N.FRAMEBUFFER,null),k=!1;else if(Mt.__webglFramebuffer===void 0)A.setupRenderTarget(M);else if(Mt.__hasExternalTextures)A.rebindTextures(M,At.get(M.texture).__webglTexture,At.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){const St=M.depthTexture;if(Mt.__boundDepthTexture!==St){if(St!==null&&At.has(St)&&(M.width!==St.image.width||M.height!==St.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");A.setupDepthRenderbuffer(M)}}const Dt=M.texture;(Dt.isData3DTexture||Dt.isDataArrayTexture||Dt.isCompressedArrayTexture)&&(ut=!0);const Ot=At.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(Ot[I])?U=Ot[I][z]:U=Ot[I],st=!0):M.samples>0&&A.useMultisampledRTT(M)===!1?U=At.get(M).__webglMultisampledFramebuffer:Array.isArray(Ot)?U=Ot[z]:U=Ot,L.copy(M.viewport),q.copy(M.scissor),B=M.scissorTest}else L.copy(yt).multiplyScalar(G).floor(),q.copy(zt).multiplyScalar(G).floor(),B=Qt;if(wt.bindFramebuffer(N.FRAMEBUFFER,U)&&k&&wt.drawBuffers(M,U),wt.viewport(L),wt.scissor(q),wt.setScissorTest(B),st){const Mt=At.get(M.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+I,Mt.__webglTexture,z)}else if(ut){const Mt=At.get(M.texture),Dt=I||0;N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,Mt.__webglTexture,z||0,Dt)}T=-1},this.readRenderTargetPixels=function(M,I,z,k,U,st,ut){if(!(M&&M.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let xt=At.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&ut!==void 0&&(xt=xt[ut]),xt){wt.bindFramebuffer(N.FRAMEBUFFER,xt);try{const Mt=M.texture,Dt=Mt.format,Ot=Mt.type;if(!Xt.textureFormatReadable(Dt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Xt.textureTypeReadable(Ot)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}I>=0&&I<=M.width-k&&z>=0&&z<=M.height-U&&N.readPixels(I,z,k,U,Ht.convert(Dt),Ht.convert(Ot),st)}finally{const Mt=C!==null?At.get(C).__webglFramebuffer:null;wt.bindFramebuffer(N.FRAMEBUFFER,Mt)}}},this.readRenderTargetPixelsAsync=async function(M,I,z,k,U,st,ut){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let xt=At.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&ut!==void 0&&(xt=xt[ut]),xt){const Mt=M.texture,Dt=Mt.format,Ot=Mt.type;if(!Xt.textureFormatReadable(Dt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Xt.textureTypeReadable(Ot))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(I>=0&&I<=M.width-k&&z>=0&&z<=M.height-U){wt.bindFramebuffer(N.FRAMEBUFFER,xt);const St=N.createBuffer();N.bindBuffer(N.PIXEL_PACK_BUFFER,St),N.bufferData(N.PIXEL_PACK_BUFFER,st.byteLength,N.STREAM_READ),N.readPixels(I,z,k,U,Ht.convert(Dt),Ht.convert(Ot),0);const Zt=C!==null?At.get(C).__webglFramebuffer:null;wt.bindFramebuffer(N.FRAMEBUFFER,Zt);const oe=N.fenceSync(N.SYNC_GPU_COMMANDS_COMPLETE,0);return N.flush(),await nf(N,oe,4),N.bindBuffer(N.PIXEL_PACK_BUFFER,St),N.getBufferSubData(N.PIXEL_PACK_BUFFER,0,st),N.deleteBuffer(St),N.deleteSync(oe),st}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(M,I=null,z=0){M.isTexture!==!0&&(Us("WebGLRenderer: copyFramebufferToTexture function signature has changed."),I=arguments[0]||null,M=arguments[1]);const k=Math.pow(2,-z),U=Math.floor(M.image.width*k),st=Math.floor(M.image.height*k),ut=I!==null?I.x:0,xt=I!==null?I.y:0;A.setTexture2D(M,0),N.copyTexSubImage2D(N.TEXTURE_2D,z,0,0,ut,xt,U,st),wt.unbindTexture()},this.copyTextureToTexture=function(M,I,z=null,k=null,U=0){M.isTexture!==!0&&(Us("WebGLRenderer: copyTextureToTexture function signature has changed."),k=arguments[0]||null,M=arguments[1],I=arguments[2],U=arguments[3]||0,z=null);let st,ut,xt,Mt,Dt,Ot,St,Zt,oe;const ce=M.isCompressedTexture?M.mipmaps[U]:M.image;z!==null?(st=z.max.x-z.min.x,ut=z.max.y-z.min.y,xt=z.isBox3?z.max.z-z.min.z:1,Mt=z.min.x,Dt=z.min.y,Ot=z.isBox3?z.min.z:0):(st=ce.width,ut=ce.height,xt=ce.depth||1,Mt=0,Dt=0,Ot=0),k!==null?(St=k.x,Zt=k.y,oe=k.z):(St=0,Zt=0,oe=0);const Xe=Ht.convert(I.format),te=Ht.convert(I.type);let Tt;I.isData3DTexture?(A.setTexture3D(I,0),Tt=N.TEXTURE_3D):I.isDataArrayTexture||I.isCompressedArrayTexture?(A.setTexture2DArray(I,0),Tt=N.TEXTURE_2D_ARRAY):(A.setTexture2D(I,0),Tt=N.TEXTURE_2D),N.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,I.flipY),N.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,I.premultiplyAlpha),N.pixelStorei(N.UNPACK_ALIGNMENT,I.unpackAlignment);const An=N.getParameter(N.UNPACK_ROW_LENGTH),ee=N.getParameter(N.UNPACK_IMAGE_HEIGHT),dn=N.getParameter(N.UNPACK_SKIP_PIXELS),Ui=N.getParameter(N.UNPACK_SKIP_ROWS),$e=N.getParameter(N.UNPACK_SKIP_IMAGES);N.pixelStorei(N.UNPACK_ROW_LENGTH,ce.width),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,ce.height),N.pixelStorei(N.UNPACK_SKIP_PIXELS,Mt),N.pixelStorei(N.UNPACK_SKIP_ROWS,Dt),N.pixelStorei(N.UNPACK_SKIP_IMAGES,Ot);const Ss=M.isDataArrayTexture||M.isData3DTexture,he=I.isDataArrayTexture||I.isData3DTexture;if(M.isRenderTargetTexture||M.isDepthTexture){const Mn=At.get(M),ys=At.get(I),en=At.get(Mn.__renderTarget),Wn=At.get(ys.__renderTarget);wt.bindFramebuffer(N.READ_FRAMEBUFFER,en.__webglFramebuffer),wt.bindFramebuffer(N.DRAW_FRAMEBUFFER,Wn.__webglFramebuffer);for(let Xn=0;Xn<xt;Xn++)Ss&&N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,At.get(M).__webglTexture,U,Ot+Xn),M.isDepthTexture?(he&&N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,At.get(I).__webglTexture,U,oe+Xn),N.blitFramebuffer(Mt,Dt,st,ut,St,Zt,st,ut,N.DEPTH_BUFFER_BIT,N.NEAREST)):he?N.copyTexSubImage3D(Tt,U,St,Zt,oe+Xn,Mt,Dt,st,ut):N.copyTexSubImage2D(Tt,U,St,Zt,oe+Xn,Mt,Dt,st,ut);wt.bindFramebuffer(N.READ_FRAMEBUFFER,null),wt.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else he?M.isDataTexture||M.isData3DTexture?N.texSubImage3D(Tt,U,St,Zt,oe,st,ut,xt,Xe,te,ce.data):I.isCompressedArrayTexture?N.compressedTexSubImage3D(Tt,U,St,Zt,oe,st,ut,xt,Xe,ce.data):N.texSubImage3D(Tt,U,St,Zt,oe,st,ut,xt,Xe,te,ce):M.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,U,St,Zt,st,ut,Xe,te,ce.data):M.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,U,St,Zt,ce.width,ce.height,Xe,ce.data):N.texSubImage2D(N.TEXTURE_2D,U,St,Zt,st,ut,Xe,te,ce);N.pixelStorei(N.UNPACK_ROW_LENGTH,An),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,ee),N.pixelStorei(N.UNPACK_SKIP_PIXELS,dn),N.pixelStorei(N.UNPACK_SKIP_ROWS,Ui),N.pixelStorei(N.UNPACK_SKIP_IMAGES,$e),U===0&&I.generateMipmaps&&N.generateMipmap(Tt),wt.unbindTexture()},this.copyTextureToTexture3D=function(M,I,z=null,k=null,U=0){return M.isTexture!==!0&&(Us("WebGLRenderer: copyTextureToTexture3D function signature has changed."),z=arguments[0]||null,k=arguments[1]||null,M=arguments[2],I=arguments[3],U=arguments[4]||0),Us('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(M,I,z,k,U)},this.initRenderTarget=function(M){At.get(M).__webglFramebuffer===void 0&&A.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?A.setTextureCube(M,0):M.isData3DTexture?A.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?A.setTexture2DArray(M,0):A.setTexture2D(M,0),wt.unbindTexture()},this.resetState=function(){R=0,w=0,C=null,wt.reset(),ae.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return On}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorspace=Kt._getDrawingBufferColorSpace(t),e.unpackColorSpace=Kt._getUnpackColorSpace()}}class gg extends Ve{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Hn,this.environmentIntensity=1,this.environmentRotation=new Hn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class _g extends Fe{constructor(t=null,e=1,n=1,s,r,a,o,l,c=Ge,u=Ge,h,d){super(null,a,o,l,c,u,s,r,h,d),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Fo extends gs{static get type(){return"LineBasicMaterial"}constructor(t){super(),this.isLineBasicMaterial=!0,this.color=new Jt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const Zr=new O,jr=new O,Tc=new ge,Rs=new il,br=new ms,Ba=new O,bc=new O;class Uh extends Ve{constructor(t=new De,e=new Fo){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[0];for(let s=1,r=e.count;s<r;s++)Zr.fromBufferAttribute(e,s-1),jr.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=Zr.distanceTo(jr);t.setAttribute("lineDistance",new We(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){const n=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),br.copy(n.boundingSphere),br.applyMatrix4(s),br.radius+=r,t.ray.intersectsSphere(br)===!1)return;Tc.copy(s).invert(),Rs.copy(t.ray).applyMatrix4(Tc);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,u=n.index,d=n.attributes.position;if(u!==null){const p=Math.max(0,a.start),g=Math.min(u.count,a.start+a.count);for(let _=p,m=g-1;_<m;_+=c){const f=u.getX(_),x=u.getX(_+1),E=Ar(this,t,Rs,l,f,x);E&&e.push(E)}if(this.isLineLoop){const _=u.getX(g-1),m=u.getX(p),f=Ar(this,t,Rs,l,_,m);f&&e.push(f)}}else{const p=Math.max(0,a.start),g=Math.min(d.count,a.start+a.count);for(let _=p,m=g-1;_<m;_+=c){const f=Ar(this,t,Rs,l,_,_+1);f&&e.push(f)}if(this.isLineLoop){const _=Ar(this,t,Rs,l,g-1,p);_&&e.push(_)}}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function Ar(i,t,e,n,s,r){const a=i.geometry.attributes.position;if(Zr.fromBufferAttribute(a,s),jr.fromBufferAttribute(a,r),e.distanceSqToSegment(Zr,jr,Ba,bc)>n)return;Ba.applyMatrix4(i.matrixWorld);const l=t.ray.origin.distanceTo(Ba);if(!(l<t.near||l>t.far))return{distance:l,point:bc.clone().applyMatrix4(i.matrixWorld),index:s,face:null,faceIndex:null,barycoord:null,object:i}}const Ac=new O,wc=new O;class vg extends Uh{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[];for(let s=0,r=e.count;s<r;s+=2)Ac.fromBufferAttribute(e,s),wc.fromBufferAttribute(e,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Ac.distanceTo(wc);t.setAttribute("lineDistance",new We(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Nh extends gs{static get type(){return"PointsMaterial"}constructor(t){super(),this.isPointsMaterial=!0,this.color=new Jt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}const Rc=new ge,Bo=new il,wr=new ms,Rr=new O;class xg extends Ve{constructor(t=new De,e=new Nh){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){const n=this.geometry,s=this.matrixWorld,r=t.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),wr.copy(n.boundingSphere),wr.applyMatrix4(s),wr.radius+=r,t.ray.intersectsSphere(wr)===!1)return;Rc.copy(s).invert(),Bo.copy(t.ray).applyMatrix4(Rc);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,h=n.attributes.position;if(c!==null){const d=Math.max(0,a.start),p=Math.min(c.count,a.start+a.count);for(let g=d,_=p;g<_;g++){const m=c.getX(g);Rr.fromBufferAttribute(h,m),Cc(Rr,m,l,s,t,e,this)}}else{const d=Math.max(0,a.start),p=Math.min(h.count,a.start+a.count);for(let g=d,_=p;g<_;g++)Rr.fromBufferAttribute(h,g),Cc(Rr,g,l,s,t,e,this)}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function Cc(i,t,e,n,s,r,a){const o=Bo.distanceSqToPoint(i);if(o<e){const l=new O;Bo.closestPointToPoint(i,l),l.applyMatrix4(n);const c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:a})}}class za extends Fe{constructor(t,e,n,s,r,a,o,l,c){super(t,e,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}const Cr=new O,Lr=new O,ka=new O,Pr=new ln;class Mg extends De{constructor(t=null,e=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:t,thresholdAngle:e},t!==null){const s=Math.pow(10,4),r=Math.cos(Hr*e),a=t.getIndex(),o=t.getAttribute("position"),l=a?a.count:o.count,c=[0,0,0],u=["a","b","c"],h=new Array(3),d={},p=[];for(let g=0;g<l;g+=3){a?(c[0]=a.getX(g),c[1]=a.getX(g+1),c[2]=a.getX(g+2)):(c[0]=g,c[1]=g+1,c[2]=g+2);const{a:_,b:m,c:f}=Pr;if(_.fromBufferAttribute(o,c[0]),m.fromBufferAttribute(o,c[1]),f.fromBufferAttribute(o,c[2]),Pr.getNormal(ka),h[0]=`${Math.round(_.x*s)},${Math.round(_.y*s)},${Math.round(_.z*s)}`,h[1]=`${Math.round(m.x*s)},${Math.round(m.y*s)},${Math.round(m.z*s)}`,h[2]=`${Math.round(f.x*s)},${Math.round(f.y*s)},${Math.round(f.z*s)}`,!(h[0]===h[1]||h[1]===h[2]||h[2]===h[0]))for(let x=0;x<3;x++){const E=(x+1)%3,y=h[x],D=h[E],R=Pr[u[x]],w=Pr[u[E]],C=`${y}_${D}`,T=`${D}_${y}`;T in d&&d[T]?(ka.dot(d[T].normal)<=r&&(p.push(R.x,R.y,R.z),p.push(w.x,w.y,w.z)),d[T]=null):C in d||(d[C]={index0:c[x],index1:c[E],normal:ka.clone()})}}for(const g in d)if(d[g]){const{index0:_,index1:m}=d[g];Cr.fromBufferAttribute(o,_),Lr.fromBufferAttribute(o,m),p.push(Cr.x,Cr.y,Cr.z),p.push(Lr.x,Lr.y,Lr.z)}this.setAttribute("position",new We(p,3))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}}class rl extends De{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const l=Math.min(a+o,Math.PI);let c=0;const u=[],h=new O,d=new O,p=[],g=[],_=[],m=[];for(let f=0;f<=n;f++){const x=[],E=f/n;let y=0;f===0&&a===0?y=.5/e:f===n&&l===Math.PI&&(y=-.5/e);for(let D=0;D<=e;D++){const R=D/e;h.x=-t*Math.cos(s+R*r)*Math.sin(a+E*o),h.y=t*Math.cos(a+E*o),h.z=t*Math.sin(s+R*r)*Math.sin(a+E*o),g.push(h.x,h.y,h.z),d.copy(h).normalize(),_.push(d.x,d.y,d.z),m.push(R+y,1-E),x.push(c++)}u.push(x)}for(let f=0;f<n;f++)for(let x=0;x<e;x++){const E=u[f][x+1],y=u[f][x],D=u[f+1][x],R=u[f+1][x+1];(f!==0||a>0)&&p.push(E,y,R),(f!==n-1||l<Math.PI)&&p.push(y,D,R)}this.setIndex(p),this.setAttribute("position",new We(g,3)),this.setAttribute("normal",new We(_,3)),this.setAttribute("uv",new We(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new rl(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Zo}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Zo);const Gn=11,al=16,zo=27,Oh=11,Sg=["RicoReWi","YourTime-FM","RapRadio 24","SchlagerPop 24","ChartRadio 24","ClubRadio 24","AnMaCha 24","RadioFloh!","RockRadio 24","ChristmasRadio","KultRadio 24","Zocker-FM","Special-Radio","AnMaChaCast","SenderWelt","RadioPortal"],yg=[{id:"natur",name:"Natur"},{id:"erz",name:"Erze & Steine"},{id:"bau",name:"Bauen"},{id:"licht",name:"Licht"},{id:"spezial",name:"Spezial"},{id:"funk",name:"Funk-Logos"}],ol=[[0,"AIR","Luft","",null,{solid:0,opaque:0,inv:0}],[1,"GRASS","Gras","natur",[0,1,2],{hard:.6,tool:"schaufel",color:5808188,map:[88,160,60],icon:1}],[2,"DIRT","Erde","natur",[2,2,2],{hard:.5,tool:"schaufel",color:8806463,map:[134,96,63],icon:2}],[3,"STONE","Stein","erz",[3,3,3],{hard:1.5,tool:"spitzhacke",color:8158336,map:[124,124,128],icon:3}],[4,"SAND","Sand","natur",[4,4,4],{hard:.5,tool:"schaufel",color:14404494,map:[219,203,142],icon:4}],[5,"WOOD","Holz","natur",[6,5,6],{hard:1,tool:"axt",color:6836270,map:[104,80,46],icon:5}],[6,"LEAVES","Blätter","natur",[7,7,7],{opaque:0,self:1,hard:.2,color:3833904,map:[46,120,44],icon:7}],[7,"PLANKS","Bretter","bau",[8,8,8],{hard:1,tool:"axt",color:11306578,map:[172,134,82],icon:8}],[8,"GLASS","Glas","bau",[9,9,9],{opaque:0,trans:1,hard:.3,color:13625584,map:[200,230,240],icon:9}],[9,"LAMP","Leuchtblock","licht",[10,10,10],{emit:1,hard:.3,color:16767098,map:[255,214,120],icon:10}],[10,"WATER","Wasser","",[11,11,11],{solid:0,opaque:0,trans:1,inv:0,map:[44,100,200]}],[27,"FEDER","Federblock","spezial",[12,13,13],{hard:.5,color:16738976,map:[255,100,160],icon:12}],[28,"TURBO","Turbo-Block","spezial",[14,15,15],{hard:.8,color:16766504,map:[255,214,40],icon:14}],[29,"WIND","Aufwind-Block","spezial",[16,17,17],{hard:.5,color:5294318,map:[80,200,235],icon:16}],[30,"RADIO","Radio-Block","spezial",[19,18,19],{hard:.5,color:3817034,map:[60,64,76],icon:18}],[31,"RAINBOW","Regenbogen-Block","licht",[20,20,20],{emit:2,hard:.5,color:14509823,map:[220,100,255],icon:20}],[32,"NEON_R","Neonrot","licht",[21,21,21],{emit:1,hard:.3,color:16721990,map:[255,40,70],icon:21}],[33,"NEON_B","Neonblau","licht",[22,22,22],{emit:1,hard:.3,color:2657535,map:[40,140,255],icon:22}],[34,"NEON_G","Neongrün","licht",[23,23,23],{emit:1,hard:.3,color:3342200,map:[50,255,120],icon:23}],[35,"NEON_P","Neonlila","licht",[24,24,24],{emit:1,hard:.3,color:12470015,map:[190,70,255],icon:24}],[36,"BRICK","Ziegel","bau",[25,25,25],{hard:1.5,tool:"spitzhacke",color:10111544,map:[154,74,56],icon:25}],[37,"MARBLE","Marmor","bau",[26,26,26],{hard:1.5,tool:"spitzhacke",color:15132398,map:[232,232,240],icon:26}],[38,"SNOW","Schnee","natur",[27,28,2],{hard:.4,tool:"schaufel",color:15922938,map:[240,246,250],icon:27}],[39,"ICE","Eis","natur",[29,29,29],{hard:.6,tool:"spitzhacke",color:11064560,map:[168,212,240],icon:29}],[40,"GRAVEL","Kies","erz",[30,30,30],{hard:.6,tool:"schaufel",color:9078402,map:[138,134,130],icon:30}],[41,"CLAY","Ton","natur",[31,31,31],{hard:.6,tool:"schaufel",color:10134708,map:[154,164,180],icon:31}],[42,"SPRUCE","Fichtenholz","natur",[33,32,33],{hard:1,tool:"axt",color:4863008,map:[74,52,32],icon:32}],[43,"NEEDLES","Fichtennadeln","natur",[34,34,34],{opaque:0,self:1,hard:.2,color:2775606,map:[36,84,50],icon:34}],[44,"CACTUS","Kaktus","natur",[36,35,36],{hard:.4,color:3967546,map:[60,138,58],icon:35}],[45,"COAL","Kohleerz","erz",[37,37,37],{hard:2,tool:"spitzhacke",color:3816e3,map:[70,70,78],icon:37,tier:1}],[46,"COPPER","Kupfererz","erz",[38,38,38],{hard:2.2,tool:"spitzhacke",color:13136956,map:[200,116,60],icon:38,tier:1}],[47,"IRON","Eisenerz","erz",[39,39,39],{hard:2.6,tool:"spitzhacke",color:13150344,map:[200,168,136],icon:39,tier:2}],[48,"CRYSTAL","Funkkristall","erz",[40,40,40],{emit:1,hard:2.4,tool:"spitzhacke",color:7006463,map:[106,232,255],icon:40,tier:2}],[49,"MUD","Schlamm","natur",[41,41,41],{hard:.5,tool:"schaufel",color:5128756,map:[78,66,52],icon:41}],[50,"FLOWERS","Blütenwiese","natur",[42,1,2],{hard:.6,tool:"schaufel",color:6991946,map:[150,170,90],icon:42}],[51,"BASALT","Basalt","erz",[43,43,43],{hard:1.8,tool:"spitzhacke",color:3421242,map:[52,52,58],icon:43}],[52,"MAGMA","Magma","erz",[44,44,44],{emit:1,hard:1.2,tool:"spitzhacke",color:16738842,map:[255,106,26],icon:44}],[53,"SHROOM","Pilzhut","natur",[45,45,45],{hard:.3,color:13122106,map:[200,58,58],icon:45}],[54,"MYCEL","Pilzboden","natur",[46,47,2],{hard:.6,tool:"schaufel",color:8022656,map:[122,106,128],icon:46}],[55,"SANDSTONE","Sandstein","bau",[48,48,48],{hard:1.2,tool:"spitzhacke",color:14205066,map:[216,192,138],icon:48}],[56,"STEM","Pilzstiel","natur",[49,49,49],{hard:.6,tool:"axt",color:15261904,map:[232,224,208],icon:49}],[57,"JLEAVES","Dschungelblätter","natur",[50,50,50],{opaque:0,self:1,hard:.2,color:3050020,map:[40,130,34],icon:50}],[58,"WORKBENCH","Werkbank","bau",[51,52,8],{hard:1.2,tool:"axt",color:10122308,map:[150,112,66],icon:51,station:"werkbank"}],[59,"FURNACE","Schmelzofen","bau",[54,53,54],{hard:2,tool:"spitzhacke",color:6974064,map:[110,110,116],icon:53,station:"ofen"}],[60,"WOOL","Wolle","bau",[55,55,55],{hard:.4,color:15657698,map:[236,232,224],icon:55}]];for(let i=0;i<al;i++)ol.push([Gn+i,"LOGO"+(i+1),Sg[i],"funk",null,{logo:1,hard:.5,color:1712192,map:[60,70,110]}]);ol.sort((i,t)=>i[0]-t[0]);const vs=256,xe=[],b={},fs=[],ll=new Uint8Array(vs),Bs=new Uint8Array(vs),Fh=new Uint8Array(vs),cl=new Float32Array(vs),ko=new Uint8Array(vs),Bh=new Uint8Array(vs),hl={};for(const[i,t,e,n,s,r]of ol){if(xe[i])throw new Error("Block-Id doppelt: "+i);const a={id:i,key:t,name:e,cat:n,tiles:s,solid:1,opaque:1,trans:0,self:0,emit:0,hard:1,tool:null,color:14540253,map:[200,200,210],icon:0,inv:1,logo:0,station:null,tier:0,...r};a.trans&&(a.opaque=0),xe[i]=a,b[t]=i,fs[i]=e,ll[i]=a.solid,Bs[i]=a.opaque,ko[i]=a.trans,Bh[i]=a.self,cl[i]=a.emit,Fh[i]=a.opaque||a.self?1:0,s&&(hl[i]=s)}const sa=i=>i>=Gn&&i<Gn+al;fs.slice(zo,zo+Oh);const Eg=xe.filter(i=>i&&i.inv).map(i=>i.id),W=16,Te=96,ue=24;function fe(i,t,e){let n=Math.imul(i|0,668265261)^Math.imul(t|0,374761393)^Math.imul(e|0,2654435761);return n=Math.imul(n^n>>>15,2246822507),n=Math.imul(n^n>>>13,3266489909),n^=n>>>16,(n>>>0)/4294967296}function Tg(i,t,e){const n=Math.floor(i),s=Math.floor(t),r=i-n,a=t-s,o=r*r*(3-2*r),l=a*a*(3-2*a),c=fe(n,s,e),u=fe(n+1,s,e),h=fe(n,s+1,e),d=fe(n+1,s+1,e);return c+(u-c)*o+(h-c)*l+(c-u-h+d)*o*l}function ke(i,t,e,n){let s=0,r=.5,a=1,o=0;for(let l=0;l<n;l++)s+=r*Tg(i*a,t*a,e+l*101),o+=r,r*=.5,a*=2;return s/o}const Ut={OCEAN:0,BEACH:1,PLAINS:2,FOREST:3,TAIGA:4,MOUNTAINS:5,SNOW:6,DESERT:7,SWAMP:8,JUNGLE:9,MEADOW:10,VOLCANO:11,MUSHROOM:12,CRYSTAL:13,COAST:14},bg=["Meer","Strand","Grüne Ebene","Laubwald","Nadelwald","Berge","Schneegebiet","Wüste","Sumpf","Dschungel","Blumenwiese","Vulkanregion","Pilzwald","Kristallgebiet","Felsküste"],Ag=[Ut.PLAINS,Ut.FOREST,Ut.MEADOW],Mi=(i,t,e)=>{const n=Math.max(0,Math.min(1,(e-i)/(t-i)));return n*n*(3-2*n)},Ha=i=>Math.max(0,Math.min(1,(i-.5)*2.4+.5)),Lc=ue-14,wg=6,Rg=5,zs=5;function Ho(i,t,e,n){const s=ke(t/640,e/640,i+1,4),r=Mi(.4,.5,s),a=ke(t/52,e/52,i+3,3),o=Mi(.56,.72,ke(t/300,e/300,i+2,3))*r,l=Ha(ke(t/520,e/520,i+11,3))+(fe(t,e,i+5)-.5)*.05,c=Ha(ke(t/480,e/480,i+23,3))+(fe(t,e,i+6)-.5)*.05,u=Ha(ke(t/360,e/360,i+37,2));let h=(ue-13+a*8)*(1-r)+(ue+2+a*12)*r;if(o>0){const E=1-Math.abs(ke(t/80,e/80,i+4,2)*2-1);h+=o*(12+E*36)}const d=Mi(.74,.82,c)*Mi(.42,.5,l)*(1-Mi(0,.2,o))*r;d>0&&(h+=(ue+(a<.45?-1:1)-h)*d);const p=l>.6?Mi(.86,.98,u)*r*(1-d):0;p>0&&(h+=p*26-Mi(.8,.95,p)*5),h=Math.max(2,Math.min(Te-12,Math.floor(h)));const g=l-Math.max(0,h-(ue+18))*.012;let _;d>.5?_=Ut.SWAMP:h<ue?_=Ut.OCEAN:p>.05?_=Ut.VOLCANO:o>.3&&h>ue+18?_=Ut.MOUNTAINS:h<=ue+1?_=g<.32||o>.15?Ut.COAST:Ut.BEACH:u>.86?_=c>.5?Ut.MUSHROOM:Ut.CRYSTAL:g<.16?_=Ut.SNOW:g<.3?_=Ut.TAIGA:g>.7&&c<.4?_=Ut.DESERT:g>.66&&c>.62?_=Ut.JUNGLE:c>.56?_=Ut.FOREST:ke(t/110,e/110,i+41,2)>.6?_=Ut.MEADOW:_=Ut.PLAINS,n.h=h,n.biome=_,n.t=g,n.u=c,n.d=a,n.volc=p;const m=h<ue+6,f=m?Math.min(h-5,Lc):h;n.t0lo=n.t1lo=n.cvlo=1e9,n.t0hi=n.t1hi=n.cvhi=-1,n.lake=!1,n.open=!1;for(let E=0;E<2;E++){const y=Math.abs(ke(t/64,e/64,i+50+E*7,2)-.5);if(y>=.024)continue;const D=8+E*13+ke(t/90,e/90,i+60+E,2)*16,R=1.4+(1-y/.024)*1.6,w=Math.max(wg,Math.ceil(D-R)),C=Math.min(f,Math.floor(D+R*.75));C<w||(E===0?(n.t0lo=w,n.t0hi=C):(n.t1lo=w,n.t1hi=C),C>=h&&(n.open=!0))}const x=ke(t/36,e/36,i+70,2);if(x>.66){const E=Math.min(h-6,m?Lc:Te,zs+Math.floor((x-.66)*55));E>=zs&&(n.cvlo=zs,n.cvhi=E,n.lake=ke(t/200,e/200,i+71,2)>.52)}return n}function Pc(i,t,e,n){const s=i.h,r=i.d;switch(i.biome){case Ut.OCEAN:return[r>.62?b.GRAVEL:r<.32?b.CLAY:b.SAND,b.SAND,3,b.STONE,0,b.STONE];case Ut.BEACH:return[b.SAND,b.SAND,4,b.SANDSTONE,3,b.STONE];case Ut.COAST:return[b.GRAVEL,b.STONE,2,b.STONE,0,b.STONE];case Ut.MEADOW:return[b.FLOWERS,b.DIRT,3,b.STONE,0,b.STONE];case Ut.SNOW:return[b.SNOW,b.DIRT,3,b.STONE,0,b.STONE];case Ut.MOUNTAINS:return s>ue+44?[b.SNOW,b.STONE,1,b.STONE,0,b.STONE]:s<ue+26?[b.GRASS,b.DIRT,2,b.STONE,0,b.STONE]:[r>.6?b.GRAVEL:b.STONE,b.STONE,1,b.STONE,0,b.STONE];case Ut.DESERT:return[b.SAND,b.SAND,4,b.SANDSTONE,3,b.STONE];case Ut.SWAMP:return[fe(e,n,t+8)<.4?b.MUD:b.GRASS,b.MUD,2,b.DIRT,2,b.STONE];case Ut.VOLCANO:return[r>.74||ke(e/14,n/14,t+9,2)>.7?b.MAGMA:b.BASALT,b.BASALT,4,b.STONE,0,b.STONE];case Ut.MUSHROOM:return[b.MYCEL,b.DIRT,3,b.STONE,0,b.STONE];case Ut.CRYSTAL:return[r>.55?b.GRAVEL:b.STONE,b.STONE,1,b.STONE,0,b.STONE];default:return[b.GRASS,b.DIRT,3,b.STONE,0,b.STONE]}}const un=[];un[Ut.PLAINS]=["oak",.004];un[Ut.FOREST]=["oak",.035];un[Ut.MEADOW]=["oak",.002];un[Ut.TAIGA]=["spruce",.03];un[Ut.SNOW]=["spruce",.008];un[Ut.MOUNTAINS]=["spruce",.006];un[Ut.JUNGLE]=["jungle",.045];un[Ut.SWAMP]=["oak",.012];un[Ut.DESERT]=["cactus",.006];un[Ut.MUSHROOM]=["mushroom",.012];un[Ut.CRYSTAL]=["spire",.012];const Cg=new Set([b.GRASS,b.DIRT,b.SNOW,b.FLOWERS,b.MUD,b.MYCEL,b.SAND,b.STONE,b.GRAVEL]),_n=3,Sn=W+2*_n,Dr=Array.from({length:Sn*Sn},()=>({}));function Lg(i,t,e,n){const s=t*W,r=e*W;for(let u=0;u<Sn;u++)for(let h=0;h<Sn;h++)Ho(i,s+h-_n,r+u-_n,Dr[u*Sn+h]);let a=ue;const o=(u,h,d)=>u+d*W+h*W*W;for(let u=0;u<W;u++)for(let h=0;h<W;h++){const d=Dr[(u+_n)*Sn+h+_n],p=d.h,g=s+h,_=r+u,[m,f,x,E,y,D]=Pc(d,i,g,_);for(let R=0;R<=p;R++){const w=p-R;n[o(h,R,u)]=R===0?b.STONE:w===0?m:w<=x?f:w<=x+y?E:D}for(let R=p+1;R<=ue;R++)n[o(h,R,u)]=R===ue&&d.t<.16&&d.biome!==Ut.SWAMP?b.ICE:b.WATER;p>a&&(a=p)}for(let u=0;u<W;u++)for(let h=0;h<W;h++){const d=Dr[(u+_n)*Sn+h+_n];for(let p=d.t0lo;p<=d.t0hi;p++)n[o(h,p,u)]=b.AIR;for(let p=d.t1lo;p<=d.t1hi;p++)n[o(h,p,u)]=b.AIR;if(d.cvhi>=0){for(let p=d.cvlo;p<=d.cvhi;p++)n[o(h,p,u)]=b.AIR;if(d.lake)n[o(h,Rg,u)]=b.WATER;else if(fe(s+h,r+u,i+72)<(d.biome===Ut.CRYSTAL?.22:.04)){const p=1+Math.floor(fe(s+h,r+u,i+73)*3);for(let g=zs;g<zs+p&&g<=d.cvhi;g++)n[o(h,g,u)]=b.CRYSTAL}}}const l=(u,h,d,p,g,_)=>{for(let m=0;m<h;m++){const f=D=>fe(t*31+m*7+D,e*17-m,i+_);let x=Math.floor(f(1)*W),E=Math.floor(f(2)*W),y=d+Math.floor(f(3)*(p-d));for(let D=0;D<g;D++){const R=o(x,y,E);n[R]===b.STONE&&(n[R]=u);const w=Math.floor(f(4+D)*6),C=w&1?1:-1;w<2?x=Math.max(0,Math.min(W-1,x+C)):w<4?E=Math.max(0,Math.min(W-1,E+C)):y=Math.max(1,Math.min(Te-1,y+C))}}};l(b.COAL,16,6,70,6,80),l(b.COPPER,9,4,44,5,81),l(b.IRON,7,2,30,4,82),l(b.CRYSTAL,2,2,14,3,83);const c=(u,h,d,p,g)=>{if(u<0||u>=W||d<0||d>=W||h<1||h>=Te)return;const _=o(u,h,d);(g||n[_]===b.AIR)&&(n[_]=p,h>a&&(a=h))};for(let u=0;u<Sn;u++)for(let h=0;h<Sn;h++){const d=Dr[u*Sn+h],p=un[d.biome];if(!p||d.open||d.h<=ue)continue;const g=s+h-_n,_=r+u-_n;if(fe(g,_,i+99)>=p[1])continue;const m=h-_n,f=u-_n,x=d.h,E=fe(g,_,i+7),y=Pc(d,i,g,_)[0];if(Cg.has(y))if(p[0]==="cactus"){if(y!==b.SAND)continue;const D=1+Math.floor(E*3);for(let R=1;R<=D;R++)c(m,x+R,f,b.CACTUS)}else if(p[0]==="spire"){const D=2+Math.floor(E*4);for(let R=1;R<=D;R++)c(m,x+R,f,b.CRYSTAL);c(m+(E<.5?1:-1),x+1,f,b.CRYSTAL)}else if(p[0]==="mushroom"){const D=4+Math.floor(E*3);for(let R=1;R<=D;R++)c(m,x+R,f,b.STEM,!0);for(let R=-2;R<=2;R++)for(let w=-2;w<=2;w++){const C=Math.abs(w)===2&&Math.abs(R)===2;C||c(m+w,x+D+1,f+R,b.SHROOM),!C&&(Math.abs(w)===2||Math.abs(R)===2)&&c(m+w,x+D,f+R,b.SHROOM)}}else if(p[0]==="spruce"){const D=6+Math.floor(E*4),R=x+D+1;for(let w=1;w<=D;w++)c(m,x+w,f,b.SPRUCE,!0);for(let w=x+3;w<=R;w++){const C=Math.min(3,Math.floor((R-w)/2.2+(w%2?.4:0)));for(let T=-C;T<=C;T++)for(let S=-C;S<=C;S++)S*S+T*T<=C*C+.5&&c(m+S,w,f+T,b.NEEDLES)}}else if(p[0]==="jungle"){const D=8+Math.floor(E*5);for(let R=1;R<=D;R++)c(m,x+R,f,b.WOOD,!0);for(let R=-1;R<=1;R++){const w=R===1?2:3;for(let C=-w;C<=w;C++)for(let T=-w;T<=w;T++)T*T+C*C>w*w+1||w===3&&fe(g+T,_+C+R,i+3)<.25||c(m+T,x+D+R,f+C,b.JLEAVES)}}else{const D=4+Math.floor(E*3);for(let R=1;R<=D;R++)c(m,x+R,f,b.WOOD,!0);for(let R=D-2;R<=D+1;R++){const w=R>=D?1:2;for(let C=-w;C<=w;C++)for(let T=-w;T<=w;T++)w===2&&Math.abs(T)===2&&Math.abs(C)===2&&fe(g+T,_+C+R,i+3)<.5||c(m+T,x+R,f+C,b.LEAVES)}}}return Math.min(Te-1,a)}const zh=2,kh=52;function Ga(i,t,e){const n=ke(t/110,e/110,i,4),s=ke(t/24,e/24,i+5,2),r=Math.floor(10+n*44+(s-.5)*5);return Math.max(2,Math.min(kh,r))}function Jn(i,t){return(i+32768)*65536+(t+32768)}class Dc{constructor(t,e,n=1){this.seed=t|0,this.gen=n===2?2:1,this.chunks=new Map,this.edits=e||new Map,this.dirty=new Set,this.radios=new Map}getChunk(t,e){return this.chunks.get(Jn(t,e))}ensure(t,e){const n=Jn(t,e);let s=this.chunks.get(n);return s||(s=this.generate(t,e,n),this.chunks.set(n,s)),s}generate(t,e,n){const s=new Uint8Array(W*W*Te),r=this.gen===2?Lg(this.seed,t,e,s):this.generate1(t,e,s);return this.finish(t,e,n,s,r)}generate1(t,e,n){const s=this.seed;let r=0;for(let a=0;a<W;a++)for(let o=0;o<W;o++){const l=t*W+o,c=e*W+a,u=Ga(s,l,c),h=u<=ue+1;for(let p=0;p<=u;p++){let g;p===0||p<u-3?g=b.STONE:h?g=b.SAND:p<u?g=b.DIRT:g=u>=46?b.STONE:b.GRASS,n[o+a*W+p*W*W]=g}for(let p=u+1;p<=ue;p++)n[o+a*W+p*W*W]=b.WATER;const d=Math.max(u,u<ue?ue:0);d>r&&(r=d)}for(let a=2;a<W-2;a++)for(let o=2;o<W-2;o++){const l=t*W+o,c=e*W+a;if(fe(l,c,s+99)>=.012)continue;const u=Ga(s,l,c);if(u<=ue+1||u>=44||n[o+a*W+u*W*W]!==b.GRASS)continue;const h=4+Math.floor(fe(l,c,s+7)*3);for(let d=1;d<=h;d++)n[o+a*W+(u+d)*W*W]=b.WOOD;for(let d=h-2;d<=h+1;d++){const p=d>=h?1:2;for(let g=-p;g<=p;g++)for(let _=-p;_<=p;_++){if(p===2&&Math.abs(_)===2&&Math.abs(g)===2&&fe(l+_,c+g+d,s+3)<.5)continue;const m=o+_+(a+g)*W+(u+d)*W*W;n[m]===b.AIR&&(n[m]=b.LEAVES)}}u+h+1>r&&(r=u+h+1)}return r}finish(t,e,n,s,r){const a=this.edits.get(n);if(a)for(const[o,l]of a){s[o]=l;const c=o/(W*W)|0;c>r&&(r=c),l===b.RADIO&&this.radios.set(`${t*W+(o&15)},${c},${e*W+(o>>4&15)}`,[t*W+(o&15),c,e*W+(o>>4&15)])}return{cx:t,cz:e,key:n,data:s,maxY:r,hm:null,opaque:null,trans:null,logo:null,meshed:!1}}getBlock(t,e,n){if(e<0)return b.STONE;if(e>=Te)return b.AIR;const s=this.chunks.get(Jn(t>>4,n>>4));return s?s.data[(t&15)+(n&15)*W+e*W*W]:b.AIR}isLoaded(t,e){return this.chunks.has(Jn(t>>4,e>>4))}isSolid(t,e,n){if(e<0)return!0;if(e>=Te)return!1;const s=this.chunks.get(Jn(t>>4,n>>4));return s?ll[s.data[(t&15)+(n&15)*W+e*W*W]]===1:!0}setBlock(t,e,n,s){if(e<0||e>=Te)return!1;const r=t>>4,a=n>>4,o=this.chunks.get(Jn(r,a));if(!o)return!1;const l=t&15,c=n&15,u=l+c*W+e*W*W,h=o.data[u];if(h===s)return!1;o.data[u]=s,h===b.RADIO&&this.radios.delete(`${t},${e},${n}`),s===b.RADIO&&this.radios.set(`${t},${e},${n}`,[t,e,n]),e>o.maxY&&(o.maxY=e),o.hm=null;let d=this.edits.get(o.key);d||(d=new Map,this.edits.set(o.key,d)),d.set(u,s),this.dirty.add(o);const p=l===0?-1:l===W-1?1:0,g=c===0?-1:c===W-1?1:0;for(let _=Math.min(0,g);_<=Math.max(0,g);_++)for(let m=Math.min(0,p);m<=Math.max(0,p);m++)if(m||_){const f=this.chunks.get(Jn(r+m,a+_));f&&this.dirty.add(f)}return!0}heightmap(t){if(t.hm)return t.hm;const e=new Uint8Array(W*W),n=t.data;for(let s=0;s<W*W;s++)for(let r=Math.min(Te-1,t.maxY);r>=0;r--)if(Fh[n[s+r*W*W]]){e[s]=r+1;break}return t.hm=e}neighborhood(t){const e=new Array(9);for(let n=-1;n<=1;n++)for(let s=-1;s<=1;s++){const r=this.chunks.get(Jn(t.cx+s,t.cz+n));if(!r)return null;e[(n+1)*3+s+1]=r.data}return e}findSpawn(){if(this.gen===2){const t=this.findSpawn2();if(t)return t}for(let t=0;t<60;t++)for(let e=0;e<Math.max(1,t*8);e++){const n=e/Math.max(1,t*8)*Math.PI*2,s=Math.round(Math.cos(n)*t*4),r=Math.round(Math.sin(n)*t*4),a=Ga(this.seed,s,r);if(a<=ue+1||a>=44)continue;const o=this.ensure(s>>4,r>>4);let l=Te-1;for(;l>0&&o.data[(s&15)+(r&15)*W+l*W*W]===b.AIR;)l--;const c=o.data[(s&15)+(r&15)*W+l*W*W];if(!(c===b.WOOD||c===b.LEAVES||c===b.WATER))return{x:s+.5,y:l+1.01,z:r+.5}}return{x:.5,y:kh+2,z:.5}}findSpawn2(){const t={};for(let e=0;e<120;e++){const n=Math.max(1,e*8);for(let s=0;s<n;s++){const r=s/n*Math.PI*2,a=Math.round(Math.cos(r)*e*8),o=Math.round(Math.sin(r)*e*8);if(Ho(this.seed,a,o,t),!Ag.includes(t.biome)||t.h<ue+2||t.h>ue+18)continue;const l=this.ensure(a>>4,o>>4);let c=Te-1;for(;c>0&&l.data[(a&15)+(o&15)*W+c*W*W]===b.AIR;)c--;const u=l.data[(a&15)+(o&15)*W+c*W*W];if(!(u!==b.GRASS&&u!==b.FLOWERS)&&!(l.data[(a&15)+(o&15)*W+(c+1)*W*W]!==b.AIR||l.data[(a&15)+(o&15)*W+(c+2)*W*W]!==b.AIR))return{x:a+.5,y:c+1.01,z:o+.5}}}return null}biomeAt(t,e){return this.gen!==2?-1:Ho(this.seed,Math.floor(t),Math.floor(e),{}).biome}}const ul=3,Hh=2,Pg=["survival","creative","story"],ci=i=>"klotzfunk.world."+i,ra=i=>"klotzfunk.meta."+i,Bn=i=>"klotzfunk-bak.world."+i,Ji=i=>"klotzfunk-bak.time."+i,Dg=10*60*1e3,aa=()=>{try{return globalThis.localStorage||null}catch{return null}},Vn=i=>{try{return aa().getItem(i)}catch{return null}},xs=i=>{try{return i?JSON.parse(i):null}catch{return null}};function Ig(i){const t={};for(const[e,n]of i){if(!n.size)continue;const s=new Uint8Array(n.size*3);let r=0;for(const[o,l]of n)s[r++]=o&255,s[r++]=o>>8,s[r++]=l;let a="";for(let o=0;o<s.length;o+=8192)a+=String.fromCharCode.apply(null,s.subarray(o,o+8192));t[e]=btoa(a)}return t}function Ug(i){const t=new Map;if(!i||typeof i!="object")return t;for(const e of Object.keys(i)){const n=i[e],s=new Map;if(Array.isArray(n))for(let a=0;a+1<n.length;a+=2)Number.isInteger(n[a])&&Number.isInteger(n[a+1])&&s.set(n[a],n[a+1]&255);else if(typeof n=="string"){let a="";try{a=atob(n)}catch{continue}for(let o=0;o+2<a.length;o+=3)s.set(a.charCodeAt(o)|a.charCodeAt(o+1)<<8,a.charCodeAt(o+2))}const r=Number(e);s.size&&Number.isFinite(r)&&t.set(r,s)}return t}function $s(i){return!!i&&typeof i=="object"&&Number.isFinite(i.seed)&&Pg.includes(i.mode)&&typeof i.name=="string"&&(i.edits===void 0||typeof i.edits=="object"&&i.edits!==null)}function Ng(i){return xs(Vn(ra(i)))}function Ic(i){const t=xs(Vn(ci(i)));return $s(t)?t:null}function Uc(i){const t=xs(Vn(Bn(i)));return $s(t)?t:null}function Og(i){return Vn(Bn(i))!==null}const Gh=i=>({name:i.name,mode:i.mode,seed:i.seed,gen:i.gen||1,savedAt:i.savedAt,q:i.story?i.story.done?-1:i.story.i:void 0});function Vh(i,t){const e=aa();if(!e)return!1;let n;try{n=JSON.stringify(t)}catch{return!1}const s=Vn(ci(i)),r=Date.now();if(s&&s!==n&&r-(Number(Vn(Ji(i)))||0)>Dg&&$s(xs(s)))try{e.setItem(Bn(i),s),e.setItem(Ji(i),String(r))}catch{try{e.removeItem(Bn(i)),e.removeItem(Ji(i))}catch{}}try{e.setItem(ci(i),n)}catch{try{for(let o=0;o<ul;o++)e.removeItem(Bn(o)),e.removeItem(Ji(o));e.setItem(ci(i),n)}catch{return!1}}try{e.setItem(ra(i),JSON.stringify(Gh(t)))}catch{}return!0}function Fg(i){const t=aa();if(t)for(const e of[ci(i),ra(i),Bn(i),Ji(i)])try{t.removeItem(e)}catch{}}function Nc(i){const t=aa(),e=Vn(Bn(i)),n=xs(e);if(!t||!$s(n))return!1;const s=Vn(ci(i));try{t.setItem(ci(i),e),s?t.setItem(Bn(i),s):t.removeItem(Bn(i)),t.setItem(Ji(i),String(Date.now())),t.setItem(ra(i),JSON.stringify(Gh(n)))}catch{return!1}return!0}function Bg(i){return JSON.stringify({format:"klotzfunk-world",version:Hh,exportedAt:Date.now(),save:i})}function zg(i){const t=xs(i);if(!t)return null;const e=t.format==="klotzfunk-world"?t.save:t;return $s(e)?(e.name=e.name.slice(0,40),e):null}function Wh(){for(let i=0;i<ul;i++)if(Vn(ci(i))===null)return i;return-1}const Xh="klotzfunk.settings",Go={eco:{name:"Eco",dpr:.75,view:3,clouds:!1,budget:3},mobile:{name:"Mobil",dpr:1.25,view:4,clouds:!0,budget:4},standard:{name:"Standard",dpr:1.5,view:6,clouds:!0,budget:6},high:{name:"Hoch",dpr:2,view:9,clouds:!0,budget:8}},Vr={quality:"auto",mouseSens:1,touchSens:1,joySens:1,btnScale:1,lefty:!1,invertY:!1,placeDelay:!0,sfxVol:.8,musicVol:.8,showFps:!1,deathLoss:"keep"};function kg(){let i={};try{i=JSON.parse(globalThis.localStorage.getItem(Xh))||{}}catch{i={}}const t={...Vr};for(const e of Object.keys(Vr))i[e]!==void 0&&typeof i[e]==typeof Vr[e]&&(t[e]=i[e]);return t.quality!=="auto"&&!Go[t.quality]&&(t.quality="auto"),["keep","grave"].includes(t.deathLoss)||(t.deathLoss="keep"),t}function Hg(i){try{return globalThis.localStorage.setItem(Xh,JSON.stringify(i)),!0}catch{return!1}}function Gg(i){return i?"mobile":"standard"}const Ks=1e3,Be=[],Pe={},Jr=[],qh=[{key:"WOOD",name:"Holz",speed:2,dur:60,col:"#b48a52"},{key:"STONE",name:"Stein",speed:3,dur:140,col:"#8c8c94"},{key:"COPPER",name:"Kupfer",speed:4,dur:220,col:"#d8803c"},{key:"IRON",name:"Eisen",speed:6,dur:360,col:"#dcdce4"}],Yh=[{key:"PICK",kind:"spitzhacke",name:"spitzhacke"},{key:"AXE",kind:"axt",name:"axt"},{key:"SHOVEL",kind:"schaufel",name:"schaufel"}];function Pi(i,t,e,n){if(Be[i])throw new Error("Item-Id doppelt: "+i);const s={id:i,key:t,name:e,cat:"items",icon:Jr.length,food:0,tool:null,...n};return Be[i]=s,Pe[t]=i,Jr.push(i),s}Pi(1e3,"STICK","Stock",{draw:"stick"});Pi(1001,"COPPER_INGOT","Kupferbarren",{draw:"ingot",col:"#d8803c"});Pi(1002,"IRON_INGOT","Eisenbarren",{draw:"ingot",col:"#dcdce4"});Pi(1003,"APPLE","Apfel",{draw:"apple",food:4});Pi(1004,"MEAT_RAW","Rohes Fleisch",{draw:"meat",col:"#e0605a",food:2});Pi(1005,"MEAT_COOKED","Braten",{draw:"meat",col:"#9a5a2a",food:7});qh.forEach((i,t)=>Yh.forEach((e,n)=>{Pi(1010+t*3+n,i.key+"_"+e.key,i.name+e.name,{draw:e.kind,col:i.col,tool:{kind:e.kind,tier:t+1,speed:i.speed,dur:i.dur}})}));const is=i=>i>=Ks,Je=i=>i>=Ks?Be[i]?Be[i].name:"?":fs[i]||"?",ss=i=>i>=Ks&&Be[i]?Be[i].tool:null,Oc=i=>i>=Ks&&Be[i]?Be[i].food:0,Fc=i=>!!(i>=Ks?Be[i]:xe[i]),Vg=.9;function Wg(i,t){const e=xe[i];if(!e)return .5;const n=ss(t),s=n&&e.tool===n.kind?n.speed:1;return Math.max(.12,e.hard*Vg/s)}function Xg(i,t){const e=xe[i];if(!e||!e.tier)return!0;const n=ss(t);return!!n&&n.kind==="spitzhacke"&&n.tier>=e.tier}function qg(i,t){const e=xe[i],n=ss(t);return!!(e&&n&&e.tool===n.kind)}const an=999,Di=[{id:"planks",give:[b.PLANKS,4],need:[[b.WOOD,1]]},{id:"planks2",give:[b.PLANKS,4],need:[[b.SPRUCE,1]]},{id:"glass",give:[b.GLASS,1],need:[[b.SAND,2]]},{id:"lamp",give:[b.LAMP,2],need:[[b.GLASS,2],[b.WOOD,1]]},{id:"lampCoal",give:[b.LAMP,2],need:[[b.COAL,1],[b.PLANKS,1]]},{id:"lampCrystal",give:[b.LAMP,4],need:[[b.CRYSTAL,1],[b.GLASS,1]]},{id:"feder",give:[b.FEDER,2],need:[[b.LEAVES,4],[b.PLANKS,1]]},{id:"turbo",give:[b.TURBO,2],need:[[b.STONE,2],[b.LAMP,1]]},{id:"turboIron",give:[b.TURBO,3],need:[[b.IRON,1],[b.STONE,2]]},{id:"wind",give:[b.WIND,2],need:[[b.GLASS,2],[b.LEAVES,2]]},{id:"radio",give:[b.RADIO,1],need:[[b.PLANKS,4],[b.LAMP,1]]},{id:"radioCopper",give:[b.RADIO,2],need:[[b.PLANKS,2],[b.COPPER,1],[b.LAMP,1]]},{id:"rainbow",give:[b.RAINBOW,2],need:[[b.GLASS,2],[b.LAMP,1]]},{id:"neonR",give:[b.NEON_R,3],need:[[b.LAMP,1],[b.SAND,1]]},{id:"neonB",give:[b.NEON_B,3],need:[[b.LAMP,1],[b.GLASS,1]]},{id:"neonG",give:[b.NEON_G,3],need:[[b.LAMP,1],[b.LEAVES,1]]},{id:"neonP",give:[b.NEON_P,3],need:[[b.LAMP,1],[b.DIRT,1]]},{id:"brick",give:[b.BRICK,4],need:[[b.DIRT,2],[b.SAND,1]]},{id:"brickClay",give:[b.BRICK,4],need:[[b.CLAY,2],[b.COAL,1]]},{id:"marble",give:[b.MARBLE,2],need:[[b.STONE,2],[b.SAND,1]]},{id:"sandstone",give:[b.SANDSTONE,2],need:[[b.SAND,4]]}];for(let i=0;i<al;i++)Di.push({id:"logo"+(i+1),give:[Gn+i,2],need:[[b.PLANKS,1]]});Di.push({id:"sticks",give:[Pe.STICK,4],need:[[b.PLANKS,2]]},{id:"workbench",give:[b.WORKBENCH,1],need:[[b.PLANKS,4]]},{id:"furnace",give:[b.FURNACE,1],need:[[b.STONE,8]],st:"werkbank"});const Yg=[b.PLANKS,b.STONE,Pe.COPPER_INGOT,Pe.IRON_INGOT],$g=[3,3,1];qh.forEach((i,t)=>Yh.forEach((e,n)=>{const s=Pe[i.key+"_"+e.key];Di.push({id:"tool"+s,give:[s,1],need:[[Yg[t],$g[n]],[Pe.STICK,2]],st:"werkbank"})}));Di.push({id:"ingotCopper",give:[Pe.COPPER_INGOT,1],need:[[b.COPPER,1],[b.COAL,1]],st:"ofen"},{id:"ingotIron",give:[Pe.IRON_INGOT,1],need:[[b.IRON,1],[b.COAL,1]],st:"ofen"},{id:"cook",give:[Pe.MEAT_COOKED,1],need:[[Pe.MEAT_RAW,1],[b.PLANKS,1]],st:"ofen"},{id:"cookCoal",give:[Pe.MEAT_COOKED,4],need:[[Pe.MEAT_RAW,4],[b.COAL,1]],st:"ofen"},{id:"glassOven",give:[b.GLASS,3],need:[[b.SAND,3],[b.COAL,1]],st:"ofen"});for(const i of Di)i.cat=(Be[i.give[0]]||xe[i.give[0]]).cat;const Bc={werkbank:"Werkbank",ofen:"Schmelzofen"},Kg={werkbank:"eine Werkbank",ofen:"einen Schmelzofen"},Ri=(i,t)=>i[t]||0;function $h(i,t,e=an,n=null){const s=t.need.filter(([o,l])=>Ri(i,o)<l).map(([o,l])=>[o,l-Ri(i,o)]),r=Ri(i,t.give[0])+t.give[1]>e,a=!!(t.st&&n&&!n.has(t.st));return{ok:!s.length&&!r&&!a,missing:s,full:r,noStation:a}}function Zg(i,t,e=an,n=null){const s=$h(i,t,e,n);if(!s.ok)return{ok:!1,msg:s.noStation?`Braucht ${Kg[t.st]} in der Nähe`:s.missing.length?"Es fehlt: "+s.missing.map(([a,o])=>`${o}× ${Je(a)}`).join(", "):`Vorrat voll: höchstens ${e}× ${Je(t.give[0])}`};for(const[r,a]of t.need)i[r]=Ri(i,r)-a;return i[t.give[0]]=Ri(i,t.give[0])+t.give[1],{ok:!0,msg:`+${t.give[1]} ${Je(t.give[0])}`}}function jg(i,t,e=an,n=null){if(t.st&&n&&!n.has(t.st))return 0;let s=Math.floor((e-Ri(i,t.give[0]))/t.give[1]);for(const[r,a]of t.need)s=Math.min(s,Math.floor(Ri(i,r)/a));return Math.max(0,s)}function Jg(i,t){return t?(t=t.toLowerCase(),Je(i.give[0]).toLowerCase().includes(t)||i.need.some(([e])=>Je(e).toLowerCase().includes(t))):!0}const fl=[{n:[1,0,0],o:[1,0,1],a:[0,0,-1],b:[0,1,0],k:1},{n:[-1,0,0],o:[0,0,0],a:[0,0,1],b:[0,1,0],k:1},{n:[0,0,1],o:[0,0,1],a:[1,0,0],b:[0,1,0],k:1},{n:[0,0,-1],o:[1,0,0],a:[-1,0,0],b:[0,1,0],k:1},{n:[0,1,0],o:[0,1,0],a:[0,0,1],b:[1,0,0],k:0},{n:[0,-1,0],o:[0,0,0],a:[1,0,0],b:[0,0,1],k:2}],Qg=[[0,0],[1,0],[1,1],[0,1]];for(const i of fl)i.c=Qg.map(([t,e])=>{const n=t?1:-1,s=e?1:-1,r=(a,o,l)=>[i.n[0]*a+i.a[0]*o+i.b[0]*l,i.n[1]*a+i.a[1]*o+i.b[1]*l,i.n[2]*a+i.a[2]*o+i.b[2]*l];return{i:t,j:e,p:[i.o[0]+t*i.a[0]+e*i.b[0],i.o[1]+t*i.a[1]+e*i.b[1],i.o[2]+t*i.a[2]+e*i.b[2]],s1:r(1,n,0),s2:r(1,0,s),cn:r(1,n,s)}});const zc=[.45,.66,.84,1],t_=[1,.62,.38,.18];function e_(i,t){return t===b.AIR?!0:Bs[t]?!1:i===t?Bh[i]===1:!0}class Wr{constructor(){this.pos=[],this.uv=[],this.col=[],this.idx=[],this.n=0}finish(){return this.n?{pos:new Float32Array(this.pos),uv:new Float32Array(this.uv),col:new Float32Array(this.col),idx:this.n>16383?new Uint32Array(this.idx):new Uint16Array(this.idx)}:null}}function Kh(i,t){const e=t?4:8,n=1/e,s=(t?3:2)/512;return[i%e*n+s,1-(Math.floor(i/e)+1)*n+s,n-2*s]}function n_(i,t){const e=i.neighborhood(t);if(!e)return null;const n=[];for(let p=-1;p<=1;p++)for(let g=-1;g<=1;g++)n.push(i.heightmap(i.getChunk(t.cx+g,t.cz+p)));const s=t.data,r=(p,g)=>(g<0?0:g>=W?2:1)*3+(p<0?0:p>=W?2:1),a=(p,g,_)=>g<0?b.STONE:g>=Te?b.AIR:e[r(p,_)][(p&15)+((_&15)<<4)+(g<<8)],o=(p,g,_)=>{const m=n[r(p,_)][(p&15)+((_&15)<<4)];return g>=m?1:t_[Math.min(3,m-g)]},l=new Wr,c=new Wr,u=new Wr,h=[0,0,0,0],d=Math.min(Te-1,t.maxY+1);for(let p=0;p<=d;p++)for(let g=0;g<W;g++)for(let _=0;_<W;_++){const m=s[_+(g<<4)+(p<<8)];if(m===b.AIR)continue;const f=sa(m),x=f?u:ko[m]?c:l,E=cl[m],y=m===b.WATER&&a(_,p+1,g)!==b.WATER,D=hl[m],R=E===0&&!ko[m];for(let w=0;w<6;w++){const C=fl[w];if(!e_(m,a(_+C.n[0],p+C.n[1],g+C.n[2])))continue;const T=f?m-Gn:D[C.k],[S,L,q]=Kh(T,f);for(let Z=0;Z<4;Z++){const X=C.c[Z],$=o(_+C.n[0],p+C.n[1],g+C.n[2]),Q=_+X.s1[0],G=p+X.s1[1],ot=g+X.s1[2],dt=_+X.s2[0],yt=p+X.s2[1],zt=g+X.s2[2],Qt=_+X.cn[0],Y=p+X.cn[1],nt=g+X.cn[2],vt=Bs[a(Q,G,ot)],rt=Bs[a(dt,yt,zt)],bt=Bs[a(Qt,Y,nt)],Lt=R?vt&&rt?0:3-(vt+rt+bt):3,kt=($+(vt?$:o(Q,G,ot))+(rt?$:o(dt,yt,zt))+(bt?$:o(Qt,Y,nt)))/4;h[Z]=zc[Lt]*(.5+.5*kt),x.pos.push(_+X.p[0],p+X.p[1]-(y&&X.p[1]===1?.12:0),g+X.p[2]),x.uv.push(S+X.i*q,L+X.j*q),x.col.push(zc[Lt],kt,E,w)}const B=x.n*4;h[0]+h[2]<h[1]+h[3]?x.idx.push(B+1,B+2,B+3,B+1,B+3,B):x.idx.push(B,B+1,B+2,B,B+2,B+3),x.n++}}return{opaque:l.finish(),trans:c.finish(),logo:u.finish()}}function i_(i){const t=sa(i),e=hl[i],n=new Wr;for(let s=0;s<6;s++){const r=fl[s],[a,o,l]=Kh(t?i-Gn:e[r.k],t);for(let u=0;u<4;u++){const h=r.c[u];n.pos.push(h.p[0]-.5,h.p[1]-.5,h.p[2]-.5),n.uv.push(a+h.i*l,o+h.j*l),n.col.push(1,1,cl[i],s)}const c=n.n*4;n.idx.push(c,c+1,c+2,c,c+2,c+3),n.n++}return n.finish()}const ve=64,Ki=8,Cs=128,Va=4,kc=16;function ni(i,t,e){let n=Math.imul(i|0,668265261)^Math.imul(t|0,374761393)^Math.imul(e|0,2654435761);return n=Math.imul(n^n>>>15,2246822507),n=Math.imul(n^n>>>13,3266489909),n^=n>>>16,(n>>>0)/4294967296}function Ee(i,t,e,n,s){const r=Math.floor(i),a=Math.floor(t),o=i-r,l=t-a,c=o*o*(3-2*o),u=l*l*(3-2*l),h=(r%e+e)%e,d=(h+1)%e,p=(a%n+n)%n,g=(p+1)%n,_=ni(h,p,s),m=ni(d,p,s),f=ni(h,g,s),x=ni(d,g,s);return _+(m-_)*c+(f-_)*u+(_-m-f+x)*c*u}function Ct(i,t,e,n,s){let r=0,a=.5,o=0,l=e;for(let c=0;c<n;c++)r+=a*Ee(i*l,t*l,l,l,s+c*17),o+=a,a*=.5,l*=2;return r/o}const It=(i,t,e)=>[i[0]+(t[0]-i[0])*e,i[1]+(t[1]-i[1])*e,i[2]+(t[2]-i[2])*e],_t=(i,t)=>[i[0]+t,i[1]+t,i[2]+t],Ft=(i,t,e,n)=>(ni(i,t,e)-.5)*n,Wa=(i,t,e,n)=>{const s=Ct(i,t,6,3,2),r=Ee(i*32,t*32,32,32,5);return[..._t(It([58,122,38],[120,186,72],s*.65+r*.45),Ft(e,n,8,10)),255]},Ir=(i,t,e,n)=>{const s=Ct(i,t,4,4,1),r=Ct(i,t,12,2,9);let a=It([108,76,50],[150,108,76],s);return r>.66?a=_t(a,-26):r<.28&&(a=_t(a,12)),[..._t(a,Ft(e,n,3,10)),255]},Vo=[Wa,(i,t,e,n)=>{const s=.17+.11*Ee(i*8,.5,8,1,4)+.05*Ee(i*24,.5,24,1,6);if(t<s){const o=Wa(i,t,e,n);return t>s-.035&&(o[0]*=.8,o[1]*=.85,o[2]*=.8),o}const r=Ir(i,t,e,n),a=Math.max(0,1-(t-s)*7)*.28;return[r[0]*(1-a),r[1]*(1-a),r[2]*(1-a),255]},Ir,(i,t,e,n)=>{const s=Ct(i,t,4,4,3),r=Math.abs(Ct(i,t,3,3,7)-.5);let a=It([92,94,100],[142,144,150],s);return r<.022?a=_t(a,-34):Ct(i,t,10,2,13)>.7&&(a=_t(a,14)),[..._t(a,Ft(e,n,4,9)),255]},(i,t,e,n)=>{const s=Ct(i,t,5,3,21),r=Math.sin((t+s*.35)*Math.PI*8)*5;return[..._t(It([212,194,136],[232,218,160],s),r+Ft(e,n,5,10)),255]},(i,t,e,n)=>{const s=Ee(i*10,t*3,10,3,31)*.6+Ee(i*20,t*6,20,6,32)*.4;let r=It([82,58,33],[132,98,58],s);return s<.3&&(r=_t(r,-16)),[..._t(r,Ft(e,n,6,8)),255]},(i,t,e,n)=>{const s=i-.5,r=t-.5,a=Math.max(Math.abs(s),Math.abs(r)),o=Ct(i,t,6,2,41);if(a>.43)return[..._t(It([80,56,32],[118,86,50],o),Ft(e,n,7,8)),255];const l=Math.hypot(s,r)*15+Ct(i,t,3,2,42)*2.2,c=.5+.5*Math.sin(l*Math.PI*2);return[..._t(It([186,148,94],[148,108,62],c),Ft(e,n,9,7)),255]},(i,t,e,n)=>{const s=Ct(i,t,8,3,11),r=Ct(i,t,9,2,12);let a=It([30,92,30],[92,168,58],s);return r>.64?[a[0],a[1],a[2],0]:(Ee(i*16,t*16,16,16,14)>.78&&(a=_t(a,18)),[..._t(a,Ft(e,n,10,10)),255])},(i,t,e,n)=>{const s=Math.floor(t*4),r=t*4%1,a=Ee(i*6,t*40,6,40,51+s)*.7+.3*Ee(i*24,t*4+s,24,4,55);let o=It([150,110,60],[200,156,96],a);(r<.045||r>.97)&&(o=_t(o,-46));const l=s%2?.25:.75;return Math.abs(i-l)<.012&&(o=_t(o,-40)),[..._t(o,Ft(e,n,11,6)),255]},(i,t,e,n)=>{if(Math.min(e,n,ve-1-e,ve-1-n)<3)return[228,245,252,238];const r=(i+t)%.5;return r>.1&&r<.17&&i+t<1?[255,255,255,140]:[186,226,240,55]},(i,t,e,n)=>{const s=i*2%1,r=t*2%1;if(Math.min(s,1-s,r,1-r)<.055)return[150,98,38,255];const o=Math.max(0,1-Math.hypot(s-.5,r-.5)*1.5),l=Ct(i,t,6,2,61);return[...It([255,196,96],[255,246,190],o*.9+l*.1),255]},(i,t,e,n)=>{const s=Ct(i,t,4,3,15),a=Ct(i+s*.2,t,8,2,16)>.62?26:0;return[..._t(It([34,92,190],[62,134,220],s),a),172]},(i,t,e,n)=>{const s=Math.hypot(i-.5,t-.5),r=Math.min(e,n,ve-1-e,ve-1-n);let a=It([255,120,170],[255,70,130],Math.min(1,s*1.6));return Math.sin(s*Math.PI*14)>.7&&(a=_t(a,22)),r<4&&(a=It(a,[150,30,80],.6)),[...a,255]},(i,t,e,n)=>{if(t<.17||t>.83){const r=Math.min(t,1-t);return[...It([255,80,140],[190,40,100],r<.04?.6:0),255]}const s=Math.sin((t*7+Math.abs(i-.5)*.8)*Math.PI*2);return s>-.1?[..._t([176,182,194],s*24),255]:[52,54,64,255]},(i,t)=>{const e=(t+Math.abs(i-.5))*3%1;return Math.min(i,t,1-i,1-t)<.04?[30,30,36,255]:e<.5?[255,214,40,255]:[38,38,46,255]},(i,t)=>t>.35&&t<.65?[255,214,40,255]:[40,40,50,255],(i,t,e,n)=>{const s=Math.abs(i*2%1-.5),r=t*2%1,a=s<.07&&r>.4&&r<.88,o=r>.12&&r<.44&&s<(r-.12)*.75,l=It([40,170,215],[96,220,245],Ct(i,t,4,2,71));return a||o?[255,255,255,255]:[..._t(l,Ft(e,n,12,8)),255]},(i,t,e,n)=>[...Math.sin((t*5-i*.6)*Math.PI*2+Math.sin(i*9)*1.2)>.82?[235,250,255]:It([40,160,205],[80,205,235],t),255],(i,t,e,n)=>{const s=Math.min(i,t,1-i,1-t),r=Math.hypot(i-.5,t-.5);return s<.05?[28,30,38,255]:r<.34?e%6<3&&n%6<3?[18,20,26,255]:[96,102,116,255]:t<.14&&i>.7&&i<.84?[255,150,40,255]:[..._t([58,62,74],Ft(e,n,13,8)),255]},(i,t,e,n)=>Math.min(i,t,1-i,1-t)<.05?[28,30,38,255]:Math.hypot(i-.3,t-.5)<.16?[255,150,40,255]:t>.42&&t<.58&&i>.55&&i<.9?[0,229,255,255]:[..._t([58,62,74],Ft(e,n,14,8)),255],(i,t,e,n)=>{const s=.5+.5*Math.sin((i+t)*Math.PI*6+Ct(i,t,4,2,81)*5),a=Math.min(i,t,1-i,1-t)<.04?.45:.7+.3*s;return[a*255,a*255,a*255,255]},...[[255,40,70],[40,140,255],[50,255,120],[190,70,255]].map(i=>(t,e)=>{const n=t*2%1,s=e*2%1;if(Math.min(n,1-n,s,1-s)<.06)return[i[0]*.3,i[1]*.3,i[2]*.3,255];const a=Math.max(0,1-Math.hypot(n-.5,s-.5)*1.3);return[...It(i,[255,255,255],a*a*.65),255]}),(i,t,e,n)=>{const s=Math.floor(t*8),r=t*8%1,a=s%2?.125:0,o=(i*4+a*4)%1;if(r<.1||o<.05)return[..._t([176,170,160],Ft(e,n,15,10)),255];const l=Ct(i,t,8,2,91+s);return[..._t(It([150,62,46],[186,92,66],l),Ft(e,n,16,12)),255]},(i,t,e,n)=>{const s=Ct(i,t,3,4,95),r=Math.abs(Ct(i+s*.3,t,3,3,96)-.5);let a=It([236,236,242],[214,216,226],s);return r<.03?a=_t(a,-52):r<.05&&(a=_t(a,-22)),[..._t(a,Ft(e,n,17,5)),255]},(i,t,e,n)=>[..._t(It([226,234,244],[250,252,255],Ct(i,t,5,3,101)),Ft(e,n,18,6)),255],(i,t,e,n)=>{const s=.2+.1*Ee(i*8,.5,8,1,102);if(t<s)return[..._t([240,246,252],Ft(e,n,19,6)),255];const r=Ir(i,t,e,n),a=Math.max(0,1-(t-s)*7)*.2;return[r[0]*(1-a),r[1]*(1-a),r[2]*(1-a),255]},(i,t,e,n)=>{const s=Ct(i,t,4,3,103),r=Math.abs(Ct(i,t,3,2,104)-.5)<.018;return[..._t(It([150,196,236],[196,226,250],s),r?30:Ft(e,n,20,5)),255]},(i,t,e,n)=>{const s=Ee(i*10,t*10,10,10,105),r=Ct(i,t,16,2,106),a=s>.6?[150,144,138]:s<.3?[96,92,90]:[124,120,116];return[..._t(a,(r-.5)*40+Ft(e,n,21,10)),255]},(i,t,e,n)=>{const s=Math.sin((t+Ct(i,t,3,2,107)*.2)*Math.PI*6)*6;return[..._t(It([142,152,168],[168,176,190],Ct(i,t,4,3,108)),s+Ft(e,n,22,6)),255]},(i,t,e,n)=>{const s=Ee(i*12,t*2,12,2,109)*.6+Ee(i*24,t*5,24,5,110)*.4;let r=It([52,36,22],[92,64,40],s);return s<.32&&(r=_t(r,-12)),[..._t(r,Ft(e,n,23,8)),255]},(i,t,e,n)=>{const s=i-.5,r=t-.5;if(Math.max(Math.abs(s),Math.abs(r))>.43)return[..._t([66,46,28],Ft(e,n,24,8)),255];const o=.5+.5*Math.sin((Math.hypot(s,r)*18+Ct(i,t,3,2,111)*2)*Math.PI*2);return[..._t(It([170,128,80],[130,92,56],o),Ft(e,n,25,7)),255]},(i,t,e,n)=>{const s=Ct(i,t,10,3,112),r=Ct(i,t,11,2,113),a=It([22,58,34],[52,104,60],s);return r>.66?[a[0],a[1],a[2],0]:[..._t(a,Ft(e,n,26,12)),255]},(i,t,e,n)=>{const s=Math.abs(i*4%1-.5)<.08;let r=It([44,120,44],[70,150,58],Ct(i,t,4,2,114));return s&&(r=_t(r,-24)),ni(e>>2,n>>2,115)>.93&&(r=[230,226,190]),[..._t(r,Ft(e,n,27,6)),255]},(i,t,e,n)=>{const s=Math.hypot(i-.5,t-.5);return[..._t(It([92,168,70],[50,124,44],Math.min(1,s*2)),Ft(e,n,28,6)),255]},...[[[34,34,38],[58,58,64]],[[196,108,52],[236,150,84]],[[196,160,128],[232,204,176]]].map((i,t)=>(e,n,s,r)=>{const a=Ct(e,n,4,4,3);let o=It([92,94,100],[142,144,150],a);return Ee(e*6,n*6,6,6,116+t)>.68&&(o=It(i[0],i[1],Ee(e*24,n*24,24,24,119+t))),[..._t(o,Ft(s,r,29+t,9)),255]}),(i,t,e,n)=>{const s=Math.abs((i+t)*3%1-.5),r=Math.abs((i-t+1)*3%1-.5),a=Math.min(s,r),o=It([40,170,230],[170,250,255],1-a*2);return[..._t(o,Ct(i,t,6,2,120)*30-15),255]},(i,t,e,n)=>{const s=Ct(i,t,5,3,121),r=Ct(i,t,9,2,122)>.64;return[..._t(It([60,50,38],[92,76,58],s),r?18:Ft(e,n,32,8)),255]},(i,t,e,n)=>{const s=Wa(i,t,e,n);if(ni(e>>2,n>>2,123)>.88&&(e&3)>0&&(n&3)>0){const a=Math.floor(ni(e>>2,n>>2,124)*4);return[...[[250,230,70],[240,80,110],[250,250,250],[150,110,240]][a],255]}return s},(i,t,e,n)=>{const s=Math.floor(i*4),r=Math.abs(i*4%1-.5)>.45;let a=It([38,38,44],[66,64,72],Ct(i,t+s*.3,4,3,125));return r&&(a=_t(a,-14)),[..._t(a,Ft(e,n,33,8)),255]},(i,t,e,n)=>{const s=Ct(i,t,4,3,126);return Math.abs(Ct(i,t,5,2,127)-.5)<.06?[60,30,26,255]:[...It([230,70,20],[255,200,60],s),255]},(i,t,e,n)=>Ee(i*5,t*5,5,5,128)>.72?[..._t([240,236,226],Ft(e,n,34,6)),255]:[..._t(It([170,34,38],[214,60,56],Ct(i,t,4,2,129)),Ft(e,n,35,8)),255],(i,t,e,n)=>[..._t(It([98,82,108],[140,120,150],Ct(i,t,6,3,130)),Ft(e,n,36,12)),255],(i,t,e,n)=>{const s=.16+.08*Ee(i*8,.5,8,1,131);return t<s?[..._t([120,100,130],Ft(e,n,37,10)),255]:Ir(i,t,e,n)},(i,t,e,n)=>{const s=Math.floor(t*4),r=t*4%1;let a=It([206,182,124],[226,204,150],Ct(i,t,5,2,132+s));return r<.06&&(a=_t(a,-22)),[..._t(a,Ft(e,n,38,6)),255]},(i,t,e,n)=>[..._t(It([214,206,188],[240,234,222],Ee(i*8,t*2,8,2,133)),Ft(e,n,39,6)),255],(i,t,e,n)=>{const s=Ct(i,t,7,3,134),r=Ct(i,t,8,2,135),a=It([24,100,22],[70,170,40],s);return r>.68?[a[0],a[1],a[2],0]:[..._t(a,Ft(e,n,40,10)),255]},(i,t,e,n)=>{const s=Math.floor(t*4),r=t*4%1;let a=It([150,112,66],[182,140,88],Ct(i*.5,t,6,2,140+s));return r<.05&&(a=_t(a,-40)),(Math.abs(i-.5)<.03||Math.abs(t-.5)<.03)&&(a=[84,58,34]),Math.min(i,t,1-i,1-t)<.08&&(a=[104,76,44]),[..._t(a,Ft(e,n,41,8)),255]},(i,t,e,n)=>{let s=It([150,112,66],[182,140,88],Ct(i,t*.5,6,2,142));return t*4%1<.05&&(s=_t(s,-36)),t<.14&&(s=[110,80,46]),i>.18&&i<.44&&t>.32&&t<.5&&(s=[186,190,198]),i>.4&&i<.48&&t>.3&&t<.52&&(s=[90,60,34]),i>.6&&i<.66&&t>.3&&t<.78&&(s=[96,66,38]),i>.54&&i<.74&&t>.26&&t<.36&&(s=[120,124,132]),[..._t(s,Ft(e,n,42,8)),255]},(i,t,e,n)=>{const s=Math.floor(t*4),r=s&1?.25:0,a=(i*2+r)%1,o=t*4%1;let l=It([96,96,102],[132,132,138],Ct(i,t,5,3,144));if((a<.05||o<.07)&&(l=_t(l,-38)),i>.26&&i<.74&&t>.52&&t<.86){const c=1-Math.abs(i-.5)*3;l=t>.68?It([200,70,20],[255,190,60],c*Ee(i*8,t*8,8,8,145)):[26,22,22]}return[..._t(l,Ft(e,n,43,8)),255]},(i,t,e,n)=>{let s=It([100,100,106],[136,136,142],Ct(i,t,5,3,146));return Math.abs(i-.5)<.16&&Math.abs(t-.5)<.16&&(s=[30,26,26]),[..._t(s,Ft(e,n,44,8)),255]},(i,t,e,n)=>{const s=Ct(i,t,8,3,147),r=Ee(i*16,t*16,16,16,148);return[..._t(It([214,210,202],[246,244,238],s*.5+r*.5),Ft(e,n,45,6)),255]}];Vo.length;const s_=new Set([0,1,2,3,4,5,6,8,14,15,18,19,25,26,27,28,29,30,31,32,33,35,37,38,39,41,42,43,45,46,47,48,49,52,53,54,55]);function r_(){const i=document.createElement("canvas");i.width=i.height=ve*Ki;const t=i.getContext("2d"),e=t.createImageData(ve,ve),n=e.data,s=ve*Ki,r=new Uint8Array(s*s*4);for(let a=0;a<Vo.length;a++){for(let o=0;o<ve;o++)for(let l=0;l<ve;l++){const c=Vo[a]((l+.5)/ve,(o+.5)/ve,l,o),u=(o*ve+l)*4;let h=0;if(s_.has(a)){const p=Math.min(l,o,ve-1-l,ve-1-o);p<3&&(h=(l<ve/2&&l<=o||o<ve/2&&o<l?16:-20)*(1-p/3))}n[u]=Math.max(0,Math.min(255,c[0]+h)),n[u+1]=Math.max(0,Math.min(255,c[1]+h)),n[u+2]=Math.max(0,Math.min(255,c[2]+h)),n[u+3]=Math.max(0,Math.min(255,c[3]));const d=((s-1-(Math.floor(a/Ki)*ve+o))*s+a%Ki*ve+l)*4;r[d]=n[u],r[d+1]=n[u+1],r[d+2]=n[u+2],r[d+3]=n[u+3]}t.putImageData(e,a%Ki*ve,Math.floor(a/Ki)*ve)}return i.raw=r,i}function a_(i,t){const e=document.createElement("canvas");e.width=e.height=Cs*Va;const n=e.getContext("2d");n.fillStyle="#0e1224",n.fillRect(0,0,e.width,e.height);let s=kc;for(let r=0;r<kc;r++){const a=new Image,o=String(r+1).padStart(2,"0"),l=()=>{--s===0&&t&&t()};a.onload=()=>{n.drawImage(a,r%Va*Cs,Math.floor(r/Va)*Cs,Cs,Cs),i&&i(),l()},a.onerror=l,a.src=`logos/${o}.png`}return e}function o_(){const t=document.createElement("canvas");t.width=t.height=128;const e=t.getContext("2d"),n=e.createImageData(128,128);for(let s=0;s<128;s++)for(let r=0;r<128;r++){const a=Ct((r+.5)/128,(s+.5)/128,4,4,77),o=Math.max(0,Math.min(1,(a-.5)/.18)),l=(s*128+r)*4;n.data[l]=n.data[l+1]=n.data[l+2]=255,n.data[l+3]=o*o*(3-2*o)*255}return e.putImageData(n,0,0),t}const Os=32,ii=8;function l_(i){const t=document.createElement("canvas");t.width=Os*ii,t.height=Os*Math.max(1,Math.ceil(i.length/ii));const e=t.getContext("2d");return i.forEach((n,s)=>{const r=s%ii*Os,a=Math.floor(s/ii)*Os,o=(p,g,_,m=1,f=1)=>{e.fillStyle=_,e.fillRect(r+p*2,a+g*2,m*2,f*2)},l=(p=2)=>{for(let g=p;g<14;g++)o(g,15-g,"#5a3a1e"),o(g,14-g,"#8a6034")},c=(p,g)=>{const _=parseInt(p.slice(1),16),m=f=>Math.max(0,Math.min(255,Math.round(f*g)));return`rgb(${m(_>>16)},${m(_>>8&255)},${m(_&255)})`},u=n.col||"#ccc",h=c(u,.62),d=c(u,1.18);switch(n.draw){case"stick":l(1);break;case"ingot":for(let p=0;p<5;p++)o(3+p,6+p,p?u:d,10-p,1);o(3,11,h,10,1),o(12,6,h,1,5);break;case"apple":o(5,5,"#c82a2a",7,8),o(4,6,"#c82a2a",9,6),o(6,6,"#f06a5a",2,2),o(5,12,"#8a1a1a",7,1),o(8,2,"#5a3a1e",1,3),o(9,2,"#3c8a2a",3,2);break;case"meat":o(3,5,u,9,7),o(2,6,u,11,5),o(4,6,d,3,2),o(3,11,h,9,1),o(12,9,"#efe6d2",2,2),o(13,8,"#efe6d2",2,1),o(13,11,"#efe6d2",2,1);break;case"spitzhacke":l(3);for(let p=0;p<10;p++){const g=3+p,_=2+Math.round(Math.abs(p-4.5)*.55);o(g,_,u),o(g,_+1,h)}o(3,4,d),o(12,4,d);break;case"axt":l(3),o(8,2,u,4,5),o(7,3,u,1,4),o(12,3,h,1,3),o(8,2,d,4,1),o(8,6,h,4,1);break;case"schaufel":l(5),o(10,2,u,4,4),o(9,3,u,1,3),o(14,3,h,1,3),o(10,2,d,4,1),o(11,6,h,2,1);break;default:o(4,4,u,8,8)}}),t}const Zi=20,Fs=20,Xr=10,Hc=15.5;function c_(i){return i>Hc?Math.floor((i-Hc)/2.5)+1:0}const Xa={idle:.018,walk:.028,sprint:.06};class Gc{constructor(t={}){const e=(n,s,r)=>Number.isFinite(n)?Math.max(0,Math.min(r,n)):s;this.hp=e(t.hp,Zi,Zi),this.food=e(t.food,Fs,Fs),this.air=e(t.air,Xr,Xr),this.hp<=0&&(this.hp=Zi),this.regenT=0,this.starveT=0,this.drownT=0,this.magmaT=0,this.cause=""}hurt(t,e){return t<=0||this.hp<=0?!1:(this.hp=Math.max(0,this.hp-t),this.cause=e,this.hp<=0)}eat(t){return this.food>=Fs?!1:(this.food=Math.min(Fs,this.food+t),!0)}tick(t,e){const n=this.hp;return this.food=Math.max(0,this.food-t*(e.sprint&&e.moving?Xa.sprint:e.moving?Xa.walk:Xa.idle)),this.food>=16&&this.hp<Zi?(this.regenT+=t,this.regenT>=3&&(this.regenT=0,this.hp=Math.min(Zi,this.hp+1),this.food=Math.max(0,this.food-.6))):this.regenT=0,this.food<=0&&this.hp>1?(this.starveT+=t,this.starveT>=4&&(this.starveT=0,this.hurt(1,"Hunger"))):this.starveT=0,e.eyeWater?(this.air=Math.max(0,this.air-t),this.air<=0&&(this.drownT+=t,this.drownT>=1&&(this.drownT=0,this.hurt(2,"Ertrunken")))):(this.air=Math.min(Xr,this.air+t*4),this.drownT=0),e.onMagma?(this.magmaT+=t,this.magmaT>=1&&(this.magmaT=0,this.hurt(1,"Magma"))):this.magmaT=.6,n-this.hp>0?n-this.hp:0}get dead(){return this.hp<=0}toJSON(){return{hp:Math.round(this.hp*10)/10,food:Math.round(this.food*10)/10,air:Math.round(this.air*10)/10}}}const ks=[{key:"huhn",name:"Huhn",hp:3,half:.25,h:.8,speed:1.5,drops:[[Pe.MEAT_RAW,1,1]]},{key:"schaf",name:"Schaf",hp:5,half:.42,h:1.2,speed:1.2,drops:[[Pe.MEAT_RAW,1,2],[b.WOOL,1,2]]},{key:"kuh",name:"Kuh",hp:6,half:.45,h:1.4,speed:1.1,drops:[[Pe.MEAT_RAW,2,3]]}],Ls=3,h_=40,u_=24,f_=new Set([b.GRASS,b.FLOWERS,b.SNOW,b.MYCEL]),Ps=(i,t)=>(i+32768)*65536+(t+32768);class d_{constructor(t,e,n,s,r){const a=ks[t];this.type=t,this.T=a,this.x=e,this.y=n,this.z=s,this.hp=r??a.hp,this.vx=0,this.vy=0,this.vz=0,this.yaw=0,this.onGround=!1,this.walk=0,this.timer=0,this.flee=0,this.hurtT=0,this.acc=0,this.moving=!1}collides(t,e,n,s){const r=this.T.half,a=Math.floor(e-r),o=Math.floor(e+r-1e-7),l=Math.floor(s-r),c=Math.floor(s+r-1e-7),u=Math.floor(n),h=Math.floor(n+this.T.h-1e-7);for(let d=u;d<=h;d++)for(let p=l;p<=c;p++)for(let g=a;g<=o;g++)if(t.isSolid(g,d,p))return!0;return!1}move(t,e,n){if(!n)return!1;const s=this[e];return this[e]+=n,this.collides(t,this.x,this.y,this.z)?(this[e]=s,e==="y"&&(n<0&&(this.onGround=!0),this.vy=0),!0):!1}update(t,e,n,s,r){if(!t.isLoaded(Math.floor(this.x),Math.floor(this.z)))return;const a=this.T;this.hurtT=Math.max(0,this.hurtT-e),this.timer-=e,this.flee>0?(this.flee-=e,this.walk=1,this.yaw=Math.atan2(-(this.x-s),-(this.z-r))):this.timer<=0&&(n()<.55?(this.walk=1,this.yaw=n()*Math.PI*2,this.timer=1+n()*3):(this.walk=0,this.timer=2+n()*4));const o=Math.floor(this.x),l=Math.floor(this.z),c=t.getBlock(o,Math.floor(this.y+.3),l)===b.WATER;let u=this.walk?a.speed*(this.flee>0?2.2:1):0,h=-Math.sin(this.yaw),d=-Math.cos(this.yaw);if(u&&this.onGround){const _=Math.floor(this.x+h*(a.half+.6)),m=Math.floor(this.z+d*(a.half+.6));let f=0;for(let x=Math.floor(this.y)-1;f<4&&x>0&&!ll[t.getBlock(_,x,m)];x--)if(f++,t.getBlock(_,x,m)===b.WATER&&!this.flee){f=9;break}f>3&&(this.yaw+=Math.PI*(.5+n()),this.timer=.5+n(),h=-h,d=-d,u*=.3)}this.vx=h*u,this.vz=d*u,c?this.vy=Math.min(2,this.vy+20*e):this.vy=Math.max(-40,this.vy-28*e);const p=this.move(t,"x",this.vx*e),g=this.move(t,"z",this.vz*e);this.onGround=!1,this.move(t,"y",this.vy*e),(p||g)&&u&&(this.onGround&&!this.collides(t,this.x,this.y+1.05,this.z)?this.vy=7.2:this.onGround&&(this.yaw+=Math.PI*(.5+n()),this.timer=.5)),this.y<-10&&(this.y=Te),this.moving=u>0&&Math.abs(this.vx)+Math.abs(this.vz)>.1}hit(t,e,n){this.hp-=t,this.hurtT=.35,this.flee=3.5;const s=Math.hypot(this.x-e,this.z-n)||1;return this.x+=(this.x-e)/s*.15,this.z+=(this.z-n)/s*.15,this.vy=4.5,this.hp<=0}record(){return[this.type,+this.x.toFixed(2),+this.y.toFixed(2),+this.z.toFixed(2),this.hp]}}function p_(i,t,e,n,s,r,a,o,l,c,u,h){let d=0,p=1/0;const g=[i,t,e],_=[n,s,r],m=[a,o,l],f=[c,u,h];for(let x=0;x<3;x++){if(Math.abs(_[x])<1e-9){if(g[x]<m[x]||g[x]>f[x])return 1/0;continue}let E=(m[x]-g[x])/_[x],y=(f[x]-g[x])/_[x];if(E>y){const D=E;E=y,y=D}if(d=Math.max(d,E),p=Math.min(p,y),d>p)return 1/0}return d}class m_{constructor(t,e,n,s=!0){if(this.world=t,this.seed=e|0,this.enabled=s,this.store=new Map,n&&typeof n=="object")for(const r of Object.keys(n)){const a=n[r],o=Number(r);!Array.isArray(a)||!Number.isFinite(o)||this.store.set(o,a.filter(l=>Array.isArray(l)&&ks[l[0]]&&l.slice(1,5).every(Number.isFinite)))}this.list=[],this.active=new Set,this.lastPC=null,this.rnd=Math.random,this.onAdd=()=>{},this.onRemove=()=>{}}spawnRecords(t,e){const n=this.seed+9001;if(fe(t,e,n)>.2)return null;const s=this.world.getChunk(t,e);if(!s)return null;const r=Math.floor(fe(t,e,n+1)*ks.length),a=2+Math.floor(fe(t,e,n+2)*3),o=[];for(let l=0;l<a*3&&o.length<a;l++){const c=Math.floor(fe(t*31+l,e,n+3)*W),u=Math.floor(fe(t,e*31+l,n+4)*W),h=c+u*W;let d=Math.min(Te-3,s.maxY+1);for(;d>0&&s.data[h+d*256]===b.AIR;)d--;const p=s.data[h+d*256];!f_.has(p)||d<ue||s.data[h+(d+1)*256]!==b.AIR||s.data[h+(d+2)*256]!==b.AIR||o.push([r,t*W+c+.5,d+1,e*W+u+.5,ks[r].hp])}return o.length?o:null}activate(t,e,n){this.active.add(t);let s=this.store.get(t);if(s?this.store.delete(t):s=this.spawnRecords(e,n),!!s){if(!s.length){this.store.set(t,s);return}for(const r of s){if(this.list.length>=h_){this.stash(r);continue}const a=new d_(r[0],r[1],r[2],r[3],r[4]);a.yaw=fe(Math.floor(r[1]),Math.floor(r[3]),5)*6.28,this.list.push(a),this.onAdd(a)}}}stash(t){const e=Ps(Math.floor(t[1]/W),Math.floor(t[3]/W));let n=this.store.get(e);n||this.store.set(e,n=[]),n.push(t)}remove(t,e){const n=this.list.indexOf(t);if(!(n<0))if(this.list.splice(n,1),this.onRemove(t),e)this.stash(t.record());else{const s=Ps(Math.floor(t.x/W),Math.floor(t.z/W));!this.store.has(s)&&!this.active.has(s)&&this.store.set(s,[])}}refresh(t,e){if(!this.enabled)return;const n=Math.floor(t/W),s=Math.floor(e/W);for(let r=-Ls;r<=Ls;r++)for(let a=-Ls;a<=Ls;a++){const o=n+a,l=s+r,c=Ps(o,l);this.active.has(c)||!this.world.getChunk(o,l)||this.activate(c,o,l)}for(const r of this.active){const a=Math.floor(r/65536)-32768,o=r%65536-32768;Math.max(Math.abs(a-n),Math.abs(o-s))<=Ls+1||this.active.delete(r)}for(const r of this.list.slice()){const a=Ps(Math.floor(r.x/W),Math.floor(r.z/W));this.active.has(a)||this.remove(r,!0)}}update(t,e,n){if(!this.enabled)return;const s=Math.floor(e/W),r=Math.floor(n/W);(!this.lastPC||this.lastPC[0]!==s||this.lastPC[1]!==r||(this.refreshT=(this.refreshT||0)-t)<=0)&&(this.lastPC=[s,r],this.refreshT=1,this.refresh(e,n));for(const a of this.list)Math.hypot(a.x-e,a.z-n)<u_||a.flee>0?a.update(this.world,t,this.rnd,e,n):(a.acc+=t,a.acc>=.25&&(a.update(this.world,Math.min(a.acc,.25),this.rnd,e,n),a.acc=0))}raycast(t,e,n,s,r,a,o){let l=null,c=o;for(const u of this.list){const h=u.T.half,d=p_(t,e,n,s,r,a,u.x-h,u.y,u.z-h,u.x+h,u.y+u.T.h,u.z+h);d<c&&(c=d,l=u)}return l?{mob:l,t:c}:null}serialize(){const t={};for(const[e,n]of this.store)t[e]=n.slice();for(const e of this.active)t[e]||(t[e]=[]);for(const e of this.list){const n=Ps(Math.floor(e.x/W),Math.floor(e.z/W));(t[n]||(t[n]=[])).push(e.record())}for(const e of this.active){if(t[e].length)continue;const n=Math.floor(e/65536)-32768,s=e%65536-32768;fe(n,s,this.seed+9001)>.2&&delete t[e]}return t}clear(){for(const t of this.list)this.onRemove(t);this.list=[],this.active.clear()}}function g_(i,t=Math.random){return ks[i].drops.map(([e,n,s])=>[e,n+Math.floor(t()*(s-n+1))]).filter(([,e])=>e>0)}const __=[[[-.2,.25,-.25,.2,.6,.27,16052972],[-.13,.5,-.42,.13,.82,-.18,16052972],[-.06,.6,-.52,.06,.68,-.42,15769632],[-.03,.82,-.36,.03,.9,-.24,14168112],[-.13,0,-.04,-.07,.25,.02,15249456],[.07,0,-.04,.13,.25,.02,15249456]],[[-.4,.45,-.6,.4,1.08,.6,15526626],[-.2,.72,-.95,.2,1.12,-.56,13154464],[-.21,1,-.9,.21,1.16,-.6,15526626],[-.32,0,-.5,-.14,.46,-.32,4867136],[.14,0,-.5,.32,.46,-.32,4867136],[-.32,0,.32,-.14,.46,.5,4867136],[.14,0,.32,.32,.46,.5,4867136]],[[-.42,.55,-.7,.42,1.22,.7,6964264],[-.43,.75,-.2,.43,1.12,.25,15920870],[-.25,.85,-1.08,.25,1.36,-.7,5913122],[-.16,.86,-1.13,.16,1.02,-1.06,15118496],[-.32,1.3,-.95,-.24,1.46,-.88,15262416],[.24,1.3,-.95,.32,1.46,-.88,15262416],[-.36,0,-.62,-.16,.56,-.42,3811354],[.16,0,-.62,.36,.56,-.42,3811354],[-.36,0,.42,-.16,.56,.62,3811354],[.16,0,.42,.36,.56,.62,3811354]]],v_=[.8,.8,1,.5,.68,.68];function x_(i){const t=[],e=[],n=[],s=new Jt;for(const[a,o,l,c,u,h,d]of i){const p=new ui(c-a,u-o,h-l);p.translate((a+c)/2,(o+u)/2,(l+h)/2);const g=p.attributes.position.array,_=t.length/3;s.setHex(d);for(let m=0;m<g.length/3;m++){const f=v_[Math.floor(m/4)];t.push(g[m*3],g[m*3+1],g[m*3+2]),e.push(s.r*f,s.g*f,s.b*f)}for(const m of p.index.array)n.push(_+m);p.dispose()}const r=new De;return r.setAttribute("position",new We(t,3)),r.setAttribute("color",new We(e,3)),r.setIndex(n),r.computeBoundingSphere(),r}class M_{constructor(t){this.group=new Ai,t.add(this.group),this.geos=__.map(x_),this.meshes=new Map}add(t){const e=new Le(this.geos[t.type],new ns({vertexColors:!0}));e.matrixAutoUpdate=!0,this.group.add(e),this.meshes.set(t,e)}remove(t){const e=this.meshes.get(t);e&&(this.group.remove(e),e.material.dispose(),this.meshes.delete(t))}update(t,e,n,s,r){for(const[a,o]of this.meshes){const l=Math.hypot(a.x-t,a.z-e);if(o.visible=l<s,!o.visible)continue;const c=a.moving?Math.abs(Math.sin(r*9+a.x))*.05:0;o.position.set(a.x,a.y+c,a.z),o.rotation.y=a.yaw,a.hurtT>0?o.material.color.setRGB(n*1.3,n*.45,n*.45):o.material.color.setRGB(n,n,n)}}clear(){for(const t of[...this.meshes.keys()])this.remove(t)}}const Qn=.3,qa=1.8,Ya=1.62,Ur=.001;class S_{constructor(){this.x=0,this.y=0,this.z=0,this.vx=0,this.vy=0,this.vz=0,this.onGround=!1,this.inWater=!1,this.flying=!1,this.coyote=0,this.fallT=0,this.gliding=!1,this.hook=!1,this.lifted=!1,this.bounces=0,this.eyeWater=!1,this.impact=0}collides(t,e,n,s){const r=Math.floor(e-Qn),a=Math.floor(e+Qn-1e-7),o=Math.floor(s-Qn),l=Math.floor(s+Qn-1e-7),c=Math.floor(n),u=Math.floor(n+qa-1e-7);for(let h=c;h<=u;h++)for(let d=o;d<=l;d++)for(let p=r;p<=a;p++)if(t.isSolid(p,h,d))return!0;return!1}move(t,e,n){for(;n!==0;){const s=Math.abs(n)>.2?Math.sign(n)*.2:n;if(n-=s,this[e]+=s,this.collides(t,this.x,this.y,this.z)){e==="y"?this.y=s>0?Math.floor(this.y+qa)-qa-Ur:Math.floor(this.y)+1+Ur:this[e]=s>0?Math.floor(this[e]+Qn)-Qn-Ur:Math.floor(this[e]-Qn)+1+Qn+Ur,this["v"+e]=0,e==="y"&&s<0&&(this.onGround=!0);return}}}update(t,e,n,s){if(t.isLoaded&&!t.isLoaded(Math.floor(this.x),Math.floor(this.z))){this.vx=this.vy=this.vz=0,this.waiting=!0;return}this.waiting=!1;for(let o=0;o<12&&this.collides(t,this.x,this.y,this.z);o++)this.y+=1;const r=Math.max(1,Math.ceil(e*120-1e-9)),a=e/r;for(let o=0;o<r;o++)this.step(t,a,n,s)}step(t,e,n,s){const r=Math.sin(s),a=Math.cos(s);let o=-n.f*r+n.r*a,l=-n.f*a-n.r*r;const c=Math.hypot(o,l);c>1&&(o/=c,l/=c);const u=Math.floor(this.x),h=Math.floor(this.z);this.inWater=t.getBlock(u,Math.floor(this.y+.4),h)===b.WATER;const d=this.eyeWater=t.getBlock(u,Math.floor(this.y+1.5),h)===b.WATER,p=this.onGround?t.getBlock(u,Math.floor(this.y-.05),h):b.AIR;if(this.lifted=!1,!this.flying)for(let m=0,f=Math.floor(this.y-.1);m<=11;m++,f--){const x=t.getBlock(u,f,h);if(x===b.WIND){this.lifted=!0;break}if(x!==b.AIR&&x!==b.WATER)break}const g=!this.onGround&&!this.inWater&&!this.flying;if(this.fallT=g&&this.vy<0?this.fallT+e:0,this.gliding=g&&n.jump&&this.fallT>.45&&!this.lifted&&!this.hook,!this.hook){let m;this.flying?m=n.sprint?16:10.5:this.gliding?(m=9.5,c<.1&&(o=-r,l=-a)):this.inWater?m=2.8:m=n.sprint?5.9:4.3,p===b.TURBO&&(m*=2.4);const f=Math.min(1,(this.flying?8:this.onGround?14:this.inWater?5:this.gliding?2.5:4)*e);if(this.vx+=(o*m-this.vx)*f,this.vz+=(l*m-this.vz)*f,this.flying){const x=((n.jump?1:0)-(n.down?1:0))*(n.sprint?12:8);this.vy+=(x-this.vy)*Math.min(1,8*e)}else this.inWater?(this.vy-=9*e,n.jump&&(d?this.vy+=24*e:this.vy=Math.max(this.vy,6.5)),this.vy-=this.vy*Math.min(1,3*e),this.vy=Math.max(-4,Math.min(this.vy,4))):(this.vy=Math.max(-55,this.vy-28*e),this.gliding&&(this.vy=Math.max(this.vy,-2.2)),this.lifted&&(this.vy=Math.min(7.5,this.vy+60*e)),n.jump&&(this.onGround||this.coyote>0)&&(this.vy=p===b.FEDER?15:8.8,this.onGround=!1,this.coyote=0))}const _=this.vy;this.move(t,"x",this.vx*e),this.move(t,"z",this.vz*e),this.onGround=!1,this.move(t,"y",this.vy*e),this.onGround&&_<-2&&t.getBlock(u,Math.floor(this.y-.05),h)===b.FEDER?(this.vy=Math.min(26,Math.max(10,-_*.92)),this.onGround=!1,this.bounces++):this.onGround&&_<0&&!this.hook&&!this.flying&&(this.impact=Math.max(this.impact,-_)),this.coyote=this.onGround?.1:this.coyote-e}}function Vc(i,t,e,n,s,r,a,o){let l=Math.floor(t),c=Math.floor(e),u=Math.floor(n);const h=s>0?1:-1,d=r>0?1:-1,p=a>0?1:-1,g=s!==0?Math.abs(1/s):1/0,_=r!==0?Math.abs(1/r):1/0,m=a!==0?Math.abs(1/a):1/0;let f=s!==0?(s>0?l+1-t:t-l)*g:1/0,x=r!==0?(r>0?c+1-e:e-c)*_:1/0,E=a!==0?(a>0?u+1-n:n-u)*m:1/0;for(;;){let y=0,D=0,R=0,w;if(f<=x&&f<=E?(w=f,f+=g,l+=h,y=-h):x<=E?(w=x,x+=_,c+=d,D=-d):(w=E,E+=m,u+=p,R=-p),w>o)return null;const C=i.getBlock(l,c,u);if(C!==b.AIR&&C!==b.WATER)return{x:l,y:c,z:u,nx:y,ny:D,nz:R,type:C,t:w}}}let Vt=null,si=null;const hn={enabled:!0,vol:.8,music:.8};function rs(){try{Vt||(Vt=new(window.AudioContext||window.webkitAudioContext)),Vt.state==="suspended"&&Vt.resume()}catch{Vt=null}}function dl(i,t,e){if(!Vt||!hn.enabled||Vt.state!=="running"||hn.vol<=0)return;if(!si){si=Vt.createBuffer(1,Math.floor(Vt.sampleRate*.25),Vt.sampleRate);const o=si.getChannelData(0);for(let l=0;l<o.length;l++)o[l]=Math.random()*2-1}const n=Vt.createBufferSource(),s=Vt.createBiquadFilter(),r=Vt.createGain(),a=Vt.currentTime;n.buffer=si,s.type="lowpass",s.frequency.value=i,r.gain.setValueAtTime(e*hn.vol,a),r.gain.exponentialRampToValueAtTime(.001,a+t),n.connect(s),s.connect(r),r.connect(Vt.destination),n.start(a),n.stop(a+t+.02)}const Wc=()=>dl(1100,.14,.5),Ds=()=>dl(600,.09,.4),Is=()=>dl(220,.1,.3),re={on:!1,timer:0,next:0,step:0,master:null,seed:0},y_=[[0,3,5,7,10],[0,2,4,7,9],[0,2,3,7,8]],Xc=i=>440*Math.pow(2,(i-69)/12);function qc(i,t,e,n,s,r){const a=Vt.createOscillator(),o=Vt.createGain();a.type=i,a.frequency.setValueAtTime(t,e),o.gain.setValueAtTime(s,e),o.gain.exponentialRampToValueAtTime(.001,e+n);let l=a;if(r){const c=Vt.createBiquadFilter();c.type="lowpass",c.frequency.value=r,a.connect(c),l=c}l.connect(o),o.connect(re.master),a.start(e),a.stop(e+n+.02)}function Yc(i,t,e,n,s){if(!si){si=Vt.createBuffer(1,Math.floor(Vt.sampleRate*.25),Vt.sampleRate);const l=si.getChannelData(0);for(let c=0;c<l.length;c++)l[c]=Math.random()*2-1}const r=Vt.createBufferSource(),a=Vt.createBiquadFilter(),o=Vt.createGain();r.buffer=si,a.type=n,a.frequency.value=s,o.gain.setValueAtTime(e,i),o.gain.exponentialRampToValueAtTime(.001,i+t),r.connect(a),a.connect(o),o.connect(re.master),r.start(i),r.stop(i+t+.02)}function E_(i,t){const e=y_[re.seed%3],n=45+(re.seed>>2)%5,s=i%16,r=Math.floor(i/16)%4;if(s%4===0){const o=Vt.createOscillator(),l=Vt.createGain();o.frequency.setValueAtTime(150,t),o.frequency.exponentialRampToValueAtTime(42,t+.14),l.gain.setValueAtTime(.9,t),l.gain.exponentialRampToValueAtTime(.001,t+.2),o.connect(l),l.connect(re.master),o.start(t),o.stop(t+.22)}(s===4||s===12)&&Yc(t,.12,.35,"bandpass",1800),s%2===0&&Yc(t,.04,s%4===2?.22:.1,"highpass",7e3),(s%4===2||s===7||s===15)&&qc("sawtooth",Xc(n+e[(r+(s>>2))%5]-12),t,.2,.2,500);const a=(i*3+re.seed+r*2)%5;(s%2===1||s%4===0)&&qc("triangle",Xc(n+24+e[a]+(s>8?12:0)),t,.16,.12,3e3)}function T_(){if(!Vt||Vt.state!=="running")return;const i=118+re.seed%3*6,t=60/i/4;for(re.next<Vt.currentTime&&(re.next=Vt.currentTime+.05);re.next<Vt.currentTime+.25;)E_(re.step++,re.next),re.next+=t}function $c(i,t){if(i*=hn.music,!Vt||!hn.enabled||i<=.01){re.on&&(re.on=!1,clearInterval(re.timer),re.master&&re.master.gain.setTargetAtTime(0,Vt.currentTime,.1));return}re.master||(re.master=Vt.createGain(),re.master.gain.value=0,re.master.connect(Vt.destination)),re.on||(re.on=!0,re.seed=t,re.next=0,re.timer=setInterval(T_,80)),re.master.gain.setTargetAtTime(Math.min(1,i)*.45,Vt.currentTime,.15)}const b_=[b.NEON_R,b.NEON_B,b.NEON_G,b.NEON_P],Un=[{t:"Holz sammeln",d:"Die Funkzentrale will wieder auf Sendung. Dafür braucht sie Material. Schlage 5 Holzblöcke an Bäumen ab.",k:"break",a:[b.WOOD],n:5,r:{[b.PLANKS]:4}},{t:"Bretter herstellen",d:"Öffne das Inventar (E oder 🎒) und stelle unter „Herstellen“ Bretter aus Holz her. Du brauchst 8 Bretter.",k:"craft",a:[b.PLANKS],n:8,r:{[b.DIRT]:10}},{t:"Fundament legen",d:"Setze 12 Bretter als Fundament für die Sendehütte.",k:"place",a:[b.PLANKS],n:12,r:{[b.STONE]:4}},{t:"Steinbruch",d:"Grabe nach Stein, unter Erde und in Hügeln. Sammle 12 Steinblöcke im Vorrat.",k:"have",a:[b.STONE],n:12,r:{[b.SAND]:4}},{t:"Strand und Glas",d:"Sand findest du am Wasser. Stelle 4 Glas her (2 Sand ergeben 1 Glas).",k:"craft",a:[b.GLASS],n:4,r:{[b.WOOD]:2,[b.GLASS]:2}},{t:"Leuchtfeuer",d:"Stelle 2 Leuchtblöcke her (Glas und Holz).",k:"craft",a:[b.LAMP],n:2,r:{[b.LEAVES]:4,[b.PLANKS]:2}},{t:"Licht an",d:"Setze beide Leuchtblöcke, damit die Hütte auch nachts zu sehen ist.",k:"place",a:[b.LAMP],n:2,r:{[b.LAMP]:2}},{t:"Hoch hinaus",d:"Der Funkmast muss hoch stehen. Erreiche eine Höhe von 14 Blöcken über dem Startpunkt, zum Beispiel mit einem Turm aus Blöcken.",k:"height",n:14,r:{[b.PLANKS]:6,[b.LEAVES]:4}},{t:"Der Funkmast",d:"Stelle einen Radio-Block her (4 Bretter und 1 Leuchtblock) und setze ihn. Hör zu, wie er spielt.",k:"place",a:[b.RADIO],n:1,r:{[b.PLANKS]:4,[b.LEAVES]:4}},{t:"Federn für die Landung",d:"Stelle 2 Federblöcke her (Blätter und Bretter).",k:"craft",a:[b.FEDER],n:2,r:{[b.STONE]:4}},{t:"Sprungtraining",d:"Setze einen Federblock und springe 3-mal darauf zurück in die Luft. Aufprall genügt, die Feder wirft dich hoch.",k:"bounce",n:3,r:{[b.LAMP]:1}},{t:"Seilhaken",d:"Ziele auf einen entfernten Block und benutze den Seilhaken (Q oder Taste Haken) 2-mal.",k:"hook",n:2,r:{[b.LEAVES]:4}},{t:"Gleitflug",d:"Springe von deinem Turm und halte im Fall die Sprungtaste gedrückt. Gleite insgesamt 5 Sekunden.",k:"glide",n:5,r:{[b.LAMP]:4,[b.SAND]:4}},{t:"Neon-Show",d:"Stelle Neonblöcke her (Leuchtblock mit Sand, Glas, Blättern oder Erde) und setze 4 davon.",k:"place",a:b_,n:4,r:{[b.GLASS]:2,[b.LAMP]:1}},{t:"Regenbogen-Finale",d:"Setze als Krönung einen Regenbogen-Block (2 Glas und 1 Leuchtblock) auf deinen Sendeturm.",k:"place",a:[b.RAINBOW],n:1,r:{[b.RAINBOW]:2}}];function Zh(i,t){const e=i.story;if(t.k==="have"){let n=0;for(const s of t.a)n+=i.inv[s]||0;return[n,t.n]}return t.k==="height"?[Math.max(0,Math.floor(e.max)),t.n]:[Math.floor(e.p),t.n]}const A_=480,Kc=6,w_=`
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
}`,R_=`
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
}`,C_="varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }",L_=`
uniform vec3 uHor; uniform vec3 uZen; uniform vec3 uSunN; uniform vec3 uGlow; varying vec3 vDir;
void main(){
  float h = clamp(vDir.y, 0.0, 1.0);
  vec3 c = mix(uHor, uZen, pow(h, 0.5));
  c += uGlow * pow(max(dot(normalize(vDir), uSunN), 0.0), 6.0);
  gl_FragColor = vec4(c, 1.0);
}`,P_=`
uniform vec2 uOff; varying vec2 vUv; varying float vD;
void main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vUv = (wp.xz + uOff) / 520.0; vD = length(position.xy) / 1200.0; gl_Position = projectionMatrix * viewMatrix * wp; }`,D_=`
uniform sampler2D uTex; uniform vec3 uCol; varying vec2 vUv; varying float vD;
void main(){ float a = texture2D(uTex, vUv).a * (1.0 - smoothstep(0.45, 0.95, vD)) * 0.9; gl_FragColor = vec4(uCol, a); }`,$a=(i,t,e)=>i+(t-i)*e,ti=(i,t,e)=>[$a(i[0],t[0],e),$a(i[1],t[1],e),$a(i[2],t[2],e)],Nr=(i,t,e)=>{const n=Math.max(0,Math.min(1,(e-i)/(t-i)));return n*n*(3-2*n)};class I_{constructor(t,e,n="auto"){this.coarse=e;const s=window.devicePixelRatio||1;this.renderer=new mg({canvas:t,antialias:n!=="eco"&&!(e&&s>=2.5),powerPreference:"high-performance"}),this.maxDpr=e?1.75:2,this.dprScale=1,this.budget=e?4:6,this.maxView=e?4:7,this.autoQ=!1,this.cloudsOn=!0,this.perf={acc:0,n:0,good:0},this.fps=0,this.placeDelay=!0,this.scene=new gg,this.camera=new rn(e?70:75,1,.08,1500),this.camera.rotation.order="YXZ",this.scene.add(this.camera),this.group=new Ai,this.scene.add(this.group);const r=Math.min(8,this.renderer.capabilities.getMaxAnisotropy()),a=f=>{const x=new za(f);return x.magFilter=je,x.minFilter=Tn,x.anisotropy=r,x.generateMipmaps=!0,x};this.atlasCanvas=r_(),this.atlasTex=new _g(this.atlasCanvas.raw,this.atlasCanvas.width,this.atlasCanvas.height,cn),this.atlasTex.magFilter=je,this.atlasTex.minFilter=Tn,this.atlasTex.anisotropy=r,this.atlasTex.generateMipmaps=!0,this.atlasTex.needsUpdate=!0,this.logoCanvas=a_(()=>{this.logoTex.needsUpdate=!0,!this.running&&this.world&&this.render()},()=>this.onLogos()),this.logoTex=a(this.logoCanvas),this.onLogos=()=>{},this.uni={uAmb:{value:new O(.44,.5,.62)},uSunCol:{value:new O(.6,.57,.5)},uSunDir:{value:new O(0,1,.25).normalize()},uFog:{value:new O(.68,.84,.95)},uFogRange:{value:new ne(40,90)},uTime:{value:0}};const o=(f,x,E,y)=>new vn({vertexShader:w_,fragmentShader:R_,transparent:E,depthWrite:!E,side:E?on:zn,uniforms:{...y,uMap:{value:f},uCut:{value:x}}});this.matO=o(this.atlasTex,.5,!1,this.uni),this.matT=o(this.atlasTex,.02,!0,this.uni),this.matL=o(this.logoTex,.5,!1,this.uni),this.sky=new Ai,this.scene.add(this.sky),this.domeU={uHor:{value:new O},uZen:{value:new O},uSunN:{value:new O(1,0,0)},uGlow:{value:new O}};const l=new Le(new rl(700,20,12),new vn({vertexShader:C_,fragmentShader:L_,uniforms:this.domeU,side:He,depthWrite:!1,depthTest:!1}));l.renderOrder=-20,l.frustumCulled=!1,this.sky.add(l);const c=(f,x)=>{const E=new Le(new wi(f,f),new ns({color:x,fog:!1,depthWrite:!1}));return E.renderOrder=-10,this.sky.add(E),E};this.sun=c(80,16773808),this.moon=c(52,14674175);const u=new Float32Array(300*3);for(let f=0;f<300;f++){const x=Math.random()*2-1,E=Math.random()*Math.PI*2,y=Math.sqrt(1-x*x);u[f*3]=Math.cos(E)*y*600,u[f*3+1]=x*600,u[f*3+2]=Math.sin(E)*y*600}const h=new De;h.setAttribute("position",new be(u,3)),this.starMat=new Nh({color:16777215,size:2,sizeAttenuation:!1,transparent:!0,opacity:0,fog:!1,depthWrite:!1}),this.stars=new xg(h,this.starMat),this.stars.renderOrder=-15,this.sky.add(this.stars);const d=new za(o_());d.wrapS=d.wrapT=Yr,d.minFilter=Tn,d.magFilter=je,this.cloudU={uTex:{value:d},uCol:{value:new O(1,1,1)},uOff:{value:new ne}},this.clouds=new Le(new wi(2400,2400),new vn({vertexShader:P_,fragmentShader:D_,uniforms:this.cloudU,transparent:!0,depthWrite:!1,side:on})),this.clouds.rotation.x=-Math.PI/2,this.clouds.frustumCulled=!1,this.chunkSphereR=Math.hypot(W/2,Te/2,W/2)+1,this.scene.add(this.clouds);const p=new Mg(new ui(1.004,1.004,1.004));this.hl=new vg(p,new Fo({color:0,transparent:!0,opacity:.75})),this.hl.visible=!1,this.scene.add(this.hl);const g={uAmb:{value:new O(.62,.64,.7)},uSunCol:{value:new O(.5,.46,.38)},uSunDir:{value:new O(.35,.8,.5).normalize()},uFog:{value:new O},uFogRange:{value:new ne(1e5,2e5)},uTime:this.uni.uTime},_=f=>{const x=o(f,.5,!1,g);return x.depthTest=!1,x};this.handMatO=_(this.atlasTex),this.handMatL=_(this.logoTex),this.hand=new Le(new De,this.handMatO),this.hand.frustumCulled=!1,this.hand.renderOrder=50,this.hand.visible=!1,this.camera.add(this.hand),this.itemCanvas=l_(Jr.map(f=>Be[f]));const m=new za(this.itemCanvas);m.magFilter=Ge,m.minFilter=Ge,m.generateMipmaps=!1,this.itemHand=new Le(new wi(1,1),new ns({map:m,transparent:!0,alphaTest:.5,depthTest:!1,side:on})),this.itemHand.frustumCulled=!1,this.itemHand.renderOrder=50,this.itemHand.visible=!1,this.camera.add(this.itemHand),this.mobView=new M_(this.scene),this.mobs=null,this.light=1,this.handType=-1,this.swing=0,this.bob=0,this.parts=[],this.partCount=0,this.rope=new Uh(new De().setFromPoints([new O,new O]),new Fo({color:16769162})),this.rope.frustumCulled=!1,this.rope.visible=!1,this.scene.add(this.rope),this.hookT=0,this.hookTarget=new O,this.wp=null,this.timeFrozen=!1,this.radioT=0,this.player=new S_,this.input={f:0,r:0,jump:!1,down:!1,sprint:!1},this.breakHeld=!1,this.placeHeld=!1,this.actCool=0,this.world=null,this.running=!1,this.raf=0,this.last=0,this.viewDist=e?4:7,this.offsets=[],this.setViewDist(this.viewDist),this.onChange=()=>{},this.onToast=()=>{},this.story=null,this.onQuest=()=>{},this.onQuestDone=()=>{},this.vitals=null,this.dead=!1,this.mine=null,this.deathLoss="keep",this.onVitals=()=>{},this.onHurt=()=>{},this.onDeath=()=>{},this.onMine=()=>{},this.onStation=()=>{},this.resize()}setQuality(t,e){const n=Go[t]||Go.standard;this.qName=t,this.autoQ=!!e,this.maxDpr=n.dpr,this.dprScale=1,this.budget=n.budget,this.cloudsOn=n.clouds,this.maxView=n.view,this.perf.acc=this.perf.n=this.perf.good=0,this.menuMode?this.savedView=n.view:this.setViewDist(n.view),this.resize()}measure(t){const e=this.perf;if(t>250||(e.acc+=t,e.n++,e.acc<2e3))return;const n=e.acc/e.n;e.acc=e.n=0,this.fps=Math.round(1e3/n),!(!this.autoQ||this.menuMode)&&(n>26?(e.good=0,this.dprScale>.6?(this.dprScale=Math.max(.6,this.dprScale-.15),this.resize()):this.viewDist>3&&this.setViewDist(this.viewDist-1)):n<18&&++e.good>=3&&(e.good=0,this.dprScale<1?(this.dprScale=Math.min(1,this.dprScale+.1),this.resize()):this.viewDist<this.maxView&&this.setViewDist(this.viewDist+1)))}setViewDist(t){this.viewDist=t;const e=t+2,n=[];for(let s=-e-1;s<=e+1;s++)for(let r=-e-1;r<=e+1;r++){const a=Math.hypot(r,s);a<=e&&n.push([r,s,a])}n.sort((s,r)=>s[2]-r[2]),this.offsets=n,this.scanDirty=!0}resize(){const t=window.innerWidth,e=window.innerHeight;this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,this.maxDpr)*this.dprScale),this.renderer.setSize(t,e,!1),this.camera.aspect=t/e,this.camera.updateProjectionMatrix(),!this.running&&this.world&&this.render()}start(t){if(this.stop(),this.clearWorld(),this.leaveMenu(),this.gen=t.gen===2?2:1,this.world=new Dc(t.seed,Ug(t.edits),this.gen),this.name=t.name,this.seed=t.seed,this.mode=t.mode,this.time=t.time??.08,this.hotbar=Array.isArray(t.hotbar)&&t.hotbar.length===9?t.hotbar.map(s=>Number.isInteger(s)&&Fc(s)?s:0):[1,2,3,4,5,6,7,8,9],this.sel=t.sel??0,this.inv=t.inv?{...t.inv}:{[b.DIRT]:20,[b.PLANKS]:10,[b.GLASS]:4},this.story=t.mode==="story"?t.story?{...t.story}:{i:0,p:0,max:0,done:!1}:null,!t.inv&&t.mode==="survival"){for(let s=0;s<16;s++)this.inv[Gn+s]=4;for(let s=0;s<Oh;s++)this.inv[zo+s]=8}if(this.wp=t.wp||null,this.hookT=0,this.rope.visible=!1,this.timeFrozen=!1,this.handType=-1,this.survival=t.mode==="survival",this.vitals=this.survival?new Gc(t.vit||{}):null,this.dead=!1,this.mine=null,this.player.impact=0,this.dur={},t.dur&&typeof t.dur=="object")for(const[s,r]of Object.entries(t.dur))ss(Number(s))&&Number.isFinite(r)&&(this.dur[s]=r);const e=t.grave;this.grave=e&&[e.x,e.y,e.z].every(Number.isFinite)&&e.inv&&typeof e.inv=="object"?e:null,this.mobs=new m_(this.world,t.seed,t.mobs,t.mode!=="story"),this.mobs.onAdd=s=>this.mobView.add(s),this.mobs.onRemove=s=>this.mobView.remove(s),this.spawn=this.world.findSpawn(),this.spawnY=this.spawn.y;const n=this.player;t.px!==void 0?(n.x=t.px,n.y=t.py,n.z=t.pz,this.yaw=t.yaw||0,this.pitch=t.pitch||0):(n.x=this.spawn.x,n.y=this.spawn.y,n.z=this.spawn.z,this.yaw=0,this.pitch=-.1),n.vx=n.vy=n.vz=0,n.flying=!1,n.onGround=!1,this.target=null,this.unsaved=!1,this.loadAround(2,1),this.scanDirty=!0,this.lastPC=null,this.applyCamera(),this.updateSky(),this.resume()}startMenu(){this.stop(),this.clearWorld(),this.menuMode=!0,this.savedView=this.savedView??this.viewDist,this.setViewDist(Math.min(this.viewDist,4)),this.world=new Dc(20241,new Map,1),this.mode="creative",this.time=.06,this.menuT=0,this.hotbar=new Array(9).fill(0),this.sel=0,this.inv={};const t=this.world.findSpawn(),e=this.player,n=this.world;e.x=t.x,e.z=t.z,e.y=t.y,e.flying=!1,e.vx=e.vy=e.vz=0,e.hook=!1,this.loadAround(3,2);const s=Math.floor(t.x),r=Math.floor(t.z),a=Math.floor(t.y)-1;for(let l=s-5;l<=s+5;l++)for(let c=r-5;c<=r+5;c++){for(let u=a+1;u<=a+9;u++)n.setBlock(l,u,c,b.AIR);n.setBlock(l,a,c,l+c&1?b.MARBLE:b.STONE)}for(let l=0;l<16;l++)n.setBlock(s-2+l%4,a+1,r-2+(l>>2),Gn+l);const o=[b.NEON_R,b.NEON_B,b.NEON_G,b.NEON_P];[[-3,-3],[3,-3],[3,3],[-3,3]].forEach(([l,c],u)=>{for(let h=1;h<=4;h++)n.setBlock(s+l,a+h,r+c,o[u]);n.setBlock(s+l,a+5,r+c,b.RAINBOW)}),n.setBlock(s,a+2,r,b.RADIO);for(let l=3;l<=5;l++)n.setBlock(s,a+l,r,b.FEDER);n.setBlock(s,a+6,r,b.RAINBOW),this.menuC={x:s+.5,y:a+3,z:r+.5},this.flushDirty(),this.hand.visible=!1,this.hl.visible=!1,this.rope.visible=!1,this.scanDirty=!0,this.lastPC=null,this.menuStep(0),this.resume()}leaveMenu(){this.menuMode&&(this.menuMode=!1,this.savedView!=null&&(this.setViewDist(this.savedView),this.savedView=null))}menuStep(t){this.menuT+=t,this.time=(this.time+t/150)%1;const e=this.menuC,n=this.menuT*.07,s=15+Math.sin(this.menuT*.05)*2.5,r=4.5+Math.sin(this.menuT*.11)*1.5;this.camera.position.set(e.x+Math.cos(n)*s,e.y+r,e.z+Math.sin(n)*s),this.camera.lookAt(e.x,e.y-3.2,e.z),this.stream(),this.flushDirty(),this.uni.uTime.value=performance.now()/1e3,this.updateSky(),this.cloudU.uOff.value.x+=t*2.5}clearWorld(){for(const t of this.group.children.slice())t.geometry.dispose(),this.group.remove(t);this.mobs&&(this.mobs.clear(),this.mobs=null),this.mobView.clear(),this.vitals=null,this.dead=!1,this.world=null}loadAround(t,e){const n=Math.floor(this.player.x/W),s=Math.floor(this.player.z/W);for(let r=-t;r<=t;r++)for(let a=-t;a<=t;a++)this.world.ensure(n+a,s+r);for(let r=-e;r<=e;r++)for(let a=-e;a<=e;a++)this.applyMesh(this.world.getChunk(n+a,s+r))}serialize(){const t=this.player,e=Ig(this.world.edits);return{v:Hh,gen:this.gen,name:this.name,seed:this.seed,mode:this.mode,time:this.time,savedAt:Date.now(),px:t.x,py:t.y,pz:t.z,yaw:this.yaw,pitch:this.pitch,hotbar:this.hotbar,sel:this.sel,inv:this.inv,wp:this.wp,story:this.story,edits:e,vit:this.vitals?this.vitals.toJSON():void 0,dur:this.dur,grave:this.grave||void 0,mobs:this.mobs?this.mobs.serialize():void 0}}respawn(){const t=this.player;this.world.ensure(Math.floor(this.spawn.x/W),Math.floor(this.spawn.z/W)),t.x=this.spawn.x,t.y=this.spawn.y,t.z=this.spawn.z,t.vx=t.vy=t.vz=0,t.flying=!1,t.impact=0,this.hookT=0,this.rope.visible=!1,this.loadAround(1,0),this.scanDirty=!0,this.applyCamera(),this.running||this.render()}resume(){this.running||(this.running=!0,this.last=performance.now(),this.raf=requestAnimationFrame(t=>this.frame(t)))}stop(){this.running=!1,cancelAnimationFrame(this.raf),$c(0,0)}frame(t){if(!this.running||(this.raf=requestAnimationFrame(n=>this.frame(n)),this.menuMode&&t-this.last<32))return;this.measure(t-this.last);const e=Math.min(.05,(t-this.last)/1e3);this.last=t,this.menuMode?this.menuStep(e):this.step(e),this.render()}step(t){const e=this.world,n=this.player;this.timeFrozen||(this.time=(this.time+t/A_)%1),this.uni.uTime.value=performance.now()/1e3,this.dead||(this.updateHook(t),n.update(e,t,this.input,this.yaw),n.bounces&&(this.questEvent("bounce",0,n.bounces),n.bounces=0),this.story&&n.gliding&&(this.glideAcc=(this.glideAcc||0)+t),this.vitals&&!n.waiting&&this.updateVitals(t)),this.applyCamera(),this.stream(),this.mobs&&(this.mobs.update(t,n.x,n.z),this.mobView.update(n.x,n.z,this.light,this.viewDist*W,this.uni.uTime.value));const s=this.camera,r=this.lookDir||(this.lookDir=new O);r.set(0,0,-1).applyEuler(s.rotation),this.target=this.dead?null:Vc(e,s.position.x,s.position.y,s.position.z,r.x,r.y,r.z,Kc),this.target?(this.hl.position.set(this.target.x+.5,this.target.y+.5,this.target.z+.5),this.hl.visible=!0):this.hl.visible=!1,this.actCool-=t,this.placeHeld&&!this.prevPlace&&(this.placeFirst=!0),this.prevPlace=this.placeHeld,this.breakHeld&&!this.dead?this.useBreak(t,r):(this.setMine(null),this.actCool<=0&&this.placeHeld&&!this.dead&&this.placeBlock()&&(this.actCool=this.placeFirst&&this.placeDelay?.45:.25,this.placeFirst=!1)),this.flushDirty(),this.updateSky(),this.cloudU.uOff.value.x+=t*2.5,this.radioT-=t,this.radioT<=0&&(this.radioT=.3,this.updateRadio(),this.questTick(),this.checkGrave()),this.updateHand(t),this.partCount&&this.updateParticles(t)}updateVitals(t){const e=this.vitals,n=this.player,s=[Math.ceil(e.hp),Math.ceil(e.food),Math.ceil(e.air)];let r=0;if(n.impact){const o=c_(n.impact);n.impact=0,o&&!n.inWater&&(e.hurt(o,"Sturz"),r+=o)}const a=n.onGround&&this.world.getBlock(Math.floor(n.x),Math.floor(n.y-.05),Math.floor(n.z))===b.MAGMA;if(r+=e.tick(t,{moving:Math.hypot(n.vx,n.vz)>.5,sprint:this.input.sprint,eyeWater:n.eyeWater,onMagma:a}),r>0&&(this.onHurt(r,e.cause),this.unsaved=!0),e.dead){this.die(e.cause);return}(s[0]!==Math.ceil(e.hp)||s[1]!==Math.ceil(e.food)||s[2]!==Math.ceil(e.air))&&this.onVitals()}die(t){const e=this.player;this.dead=!0,this.breakHeld=this.placeHeld=!1,this.hookT=0,this.rope.visible=!1,this.setMine(null),e.vx=e.vy=e.vz=0;const n={x:Math.round(e.x),y:Math.round(e.y),z:Math.round(e.z)};let s=!1;if(this.deathLoss==="grave"){const r={};for(const[a,o]of Object.entries(this.inv))o>0&&(r[a]=o);if(Object.keys(r).length){if(this.grave)for(const[a,o]of Object.entries(this.grave.inv))r[a]=Math.min(an,(r[a]||0)+o);this.grave={...n,inv:r},this.inv={},s=!0}}this.wp=n,this.unsaved=!0,this.onDeath(t,s)}revive(){this.dead&&(this.vitals=new Gc,this.dead=!1,this.player.impact=0,this.respawn(),this.onVitals(),this.onChange())}checkGrave(){const t=this.grave,e=this.player;if(!(!t||this.dead||Math.hypot(t.x-e.x,t.y-e.y,t.z-e.z)>2.5)){for(const[n,s]of Object.entries(t.inv))Fc(Number(n))&&(this.inv[n]=Math.min(an,(this.inv[n]||0)+s));this.wp&&this.wp.x===t.x&&this.wp.z===t.z&&(this.wp=null),this.grave=null,this.unsaved=!0,Ds(),this.onToast("Deine Sachen sind wieder da"),this.onChange()}}held(){const t=this.hotbar[this.sel];return t&&(this.mode==="creative"||this.inv[t]>0)?t:0}setMine(t){const e=!!this.mine;this.mine=t,(e||t)&&this.onMine(t?Math.min(1,t.t/t.need):0)}useBreak(t,e){if(this.actCool>0)return;const n=this.camera.position,s=this.target,r=this.mobs?this.mobs.raycast(n.x,n.y,n.z,e.x,e.y,e.z,Kc):null;if(r&&(!s||r.t<s.t)){this.attack(r.mob),this.actCool=.45,this.setMine(null);return}if(!this.survival){this.setMine(null),this.breakBlock()&&(this.actCool=.22);return}if(!s||s.y===0){this.setMine(null);return}const a=this.held();if(!Xg(s.type,a)){Is(),this.onToast(`${fs[s.type]} braucht eine ${xe[s.type].tier>1?"Stein- oder bessere ":""}Spitzhacke`),this.actCool=.8,this.setMine(null);return}let o=this.mine;if((!o||o.x!==s.x||o.y!==s.y||o.z!==s.z||o.held!==a)&&(o={x:s.x,y:s.y,z:s.z,held:a,t:0,need:Wg(s.type,a),sw:0}),o.t+=t,o.sw-=t,o.sw<=0&&(o.sw=.25,this.swing=1),o.t>=o.need){this.setMine(null),this.breakBlock()&&(this.actCool=.1);return}this.setMine(o)}attack(t){const e=this.held(),n=ss(e),s=this.player,r=this.mode==="creative"?99:n?(n.kind==="axt"?3:2)+(n.tier>=3?1:0):1;if(this.swing=1,Wc(),!t.hit(r,s.x,s.z)||(this.spawnBreak(t.x-.5,t.y,t.z-.5,b.WOOL),this.mobs.remove(t,!1),this.unsaved=!0,this.mode==="creative"))return;const a=g_(t.type).map(([o,l])=>(this.inv[o]=Math.min(an,(this.inv[o]||0)+l),`+${l} ${Je(o)}`));a.length&&this.onToast(a.join(" · ")),this.onChange()}eat(t){return this.vitals?this.inv[t]>0?this.vitals.eat(Oc(t))?(this.inv[t]--,this.swing=1,Ds(),this.unsaved=!0,this.onChange(),this.onVitals(),!0):(this.onToast("Du bist satt"),this.actCool=.6,!1):(Is(),this.onToast(`Kein ${Je(t)} im Vorrat`),this.actCool=.4,!1):(this.onToast("Essen braucht man nur im Überlebensmodus"),this.actCool=.6,!1)}wear(t){const e=ss(t);if(!e||this.mode==="creative")return;const n=(this.dur[t]||0)+1;if(n<e.dur){this.dur[t]=n;return}delete this.dur[t],this.inv[t]=Math.max(0,(this.inv[t]||0)-1),Is(),this.onToast(`${Je(t)} ist zerbrochen`)}stationsNear(t=4){const e=new Set,n=this.player,s=this.world;if(!s)return e;const r=Math.floor(n.x),a=Math.floor(n.y),o=Math.floor(n.z);for(let l=a-2;l<=a+3;l++)for(let c=o-t;c<=o+t;c++)for(let u=r-t;u<=r+t;u++){const h=xe[s.getBlock(u,l,c)];h&&h.station&&e.add(h.station)}return e}fireHook(){if(!this.running)return;const t=this.camera,e=new O(0,0,-1).applyEuler(t.rotation),n=Vc(this.world,t.position.x,t.position.y,t.position.z,e.x,e.y,e.z,40);if(!n){Is(),this.onToast("Seilhaken: kein Ziel in Reichweite");return}this.hookTarget.set(n.x+.5+n.nx*.9,n.y+.5+n.ny*.9,n.z+.5+n.nz*.9),this.hookT=1.6,Ds(),this.questEvent("hook",0)}updateHook(t){const e=this.player;if(e.hook=!1,this.hookT<=0){this.rope.visible=!1;return}this.hookT-=t;const n=this.hookTarget,s=n.x-e.x,r=n.y-(e.y+Ya),a=n.z-e.z,o=Math.hypot(s,r,a);if(o<2||this.hookT<=0){this.hookT=0,this.rope.visible=!1,e.vx*=.6,e.vz*=.6,e.vy=Math.max(e.vy*.6,3);return}const l=24/o;e.vx=s*l,e.vy=r*l,e.vz=a*l,e.hook=!0;const c=this.rope.geometry.attributes.position;c.setXYZ(0,e.x+.3,e.y+Ya-.35,e.z),c.setXYZ(1,n.x,n.y,n.z),c.needsUpdate=!0,this.rope.visible=!0}toggleWaypoint(){const t=this.player;this.wp&&Math.hypot(this.wp.x-t.x,this.wp.z-t.z)<4?(this.wp=null,this.onToast("Wegpunkt entfernt")):(this.wp={x:Math.round(t.x),y:Math.round(t.y),z:Math.round(t.z)},this.onToast("Wegpunkt gesetzt")),this.unsaved=!0}updateRadio(){const t=this.player;let e=1e9,n=0;for(const s of this.world.radios.values()){const r=Math.hypot(s[0]+.5-t.x,s[1]+.5-(t.y+1),s[2]+.5-t.z);r<e&&(e=r,n=s[0]*7+s[2]*13+s[1]>>>0)}this.radioDist=e,$c(e<24?Math.pow(1-e/24,1.5):0,n)}questTick(){const t=this.story;if(!t||t.done)return;const e=Un[t.i];e.k==="height"&&(t.max=Math.max(t.max,this.player.y-this.spawnY)),e.k==="glide"&&this.glideAcc&&(t.p+=this.glideAcc),this.glideAcc=0,this.questCheck()}questEvent(t,e,n=1){const s=this.story;if(!s||s.done)return;const r=Un[s.i];if(r.k==="have"){this.questCheck();return}r.k!==t||r.a&&!r.a.includes(e)||(s.p+=n,this.questCheck())}questCheck(){const t=this.story;for(let e=0;t&&!t.done&&e<Un.length;e++){const n=Un[t.i],[s,r]=Zh(this,n);if(s<r)break;for(const[a,o]of Object.entries(n.r||{}))this.inv[a]=Math.min(an,(this.inv[a]||0)+o);t.i++,t.p=0,t.max=0,t.i>=Un.length&&(t.done=!0),this.unsaved=!0,Ds(),this.onQuestDone(n,t.done),this.onChange()}this.onQuest()}updateHand(t){const e=this.hotbar[this.sel];if(e!==this.handType){if(this.handType=e,this.hand.visible=e>0&&!is(e),this.itemHand.visible=is(e)&&!!Be[e],this.itemHand.visible){const a=Be[e].icon,o=this.itemCanvas.height/Os,l=a%ii/ii,c=l+1/ii,u=1-Math.floor(a/ii)/o,h=u-1/o,d=this.itemHand.geometry.attributes.uv;d.setXY(0,l,u),d.setXY(1,c,u),d.setXY(2,l,h),d.setXY(3,c,h),d.needsUpdate=!0}if(this.hand.visible){const a=i_(e),o=new De;o.setAttribute("position",new be(a.pos,3)),o.setAttribute("uv",new be(a.uv,2)),o.setAttribute("aCol",new be(a.col,4)),o.setIndex(new be(a.idx,1)),this.hand.geometry.dispose(),this.hand.geometry=o,this.hand.material=sa(e)?this.handMatL:this.handMatO}}const n=this.player;Math.hypot(n.vx,n.vz)>.5&&n.onGround&&(this.bob+=t*9),this.swing=Math.max(0,this.swing-t*4.5);const r=Math.sin(this.swing*Math.PI);this.hand.scale.setScalar(.12),this.hand.position.set(.34-r*.06,-.27+Math.sin(this.bob)*.008-r*.06,-.55-r*.04),this.hand.rotation.set(.25-r*.7,-.62,.06),this.itemHand.visible&&(this.itemHand.scale.setScalar(.3),this.itemHand.position.set(.36-r*.05,-.24+Math.sin(this.bob)*.008-r*.05,-.55),this.itemHand.rotation.set(-r*.9,-.35,.2+r*.4))}spawnBreak(t,e,n,s){const r=xe[s]?xe[s].color:14540253;for(let a=0;a<10;a++){this.partIdx=((this.partIdx||0)+1)%24;let o=this.parts[this.partIdx];o||(o=new Le(this.partGeo||(this.partGeo=new ui(1,1,1)),new ns({color:r})),o.userData={life:0},this.scene.add(o),this.parts[this.partIdx]=o),o.userData.life||this.partCount++,o.material.color.setHex(r),o.position.set(t+.2+Math.random()*.6,e+.2+Math.random()*.6,n+.2+Math.random()*.6),o.userData={life:.55+Math.random()*.3,v:new O((Math.random()-.5)*3,Math.random()*3+1,(Math.random()-.5)*3)},o.scale.setScalar(.1+Math.random()*.08),o.visible=!0}}updateParticles(t){for(const e of this.parts){if(!e||!e.userData.life)continue;const n=e.userData;n.life-=t,n.v.y-=14*t,e.position.addScaledVector(n.v,t),n.life<=0&&(n.life=0,e.visible=!1,this.partCount--)}}applyCamera(){const t=this.player,e=this.camera;e.position.set(t.x,t.y+Ya,t.z),e.rotation.set(this.pitch,this.yaw,0)}breakBlock(){const t=this.target;if(!t||t.y===0)return!1;if(this.world.setBlock(t.x,t.y,t.z,b.AIR)){if(this.mode!=="creative"&&(this.inv[t.type]=Math.min(an,(this.inv[t.type]||0)+1)),this.survival){const e=this.held();qg(t.type,e)&&this.wear(e),(t.type===b.LEAVES||t.type===b.JLEAVES)&&Math.random()<.08&&(this.inv[Pe.APPLE]=Math.min(an,(this.inv[Pe.APPLE]||0)+1),this.onToast("+1 Apfel"))}return this.unsaved=!0,this.swing=1,this.spawnBreak(t.x,t.y,t.z,t.type),Wc(),this.onChange(),this.questEvent("break",t.type),!0}return!1}placeBlock(){const t=this.target,e=this.hotbar[this.sel];if(t&&this.mode!=="creative"&&xe[t.type]&&xe[t.type].station)return this.onStation(xe[t.type].station),this.actCool=.5,!1;if(e&&is(e))return Oc(e)?this.eat(e):!1;if(!t||!e)return!1;if(this.mode!=="creative"&&!(this.inv[e]>0))return Is(),this.onToast(`Kein ${fs[e]} im Vorrat`),this.actCool=.4,!1;const n=t.x+t.nx,s=t.y+t.ny,r=t.z+t.nz;if(s<0||s>=Te)return!1;const a=this.world.getBlock(n,s,r);if(a!==b.AIR&&a!==b.WATER)return!1;const o=this.player,l=.3;return o.x+l>n&&o.x-l<n+1&&o.z+l>r&&o.z-l<r+1&&o.y+1.8>s&&o.y<s+1||!this.world.setBlock(n,s,r,e)?!1:(this.mode!=="creative"&&this.inv[e]--,this.unsaved=!0,this.swing=1,Ds(),this.onChange(),this.questEvent("place",e),!0)}selectSlot(t){this.sel=(t%9+9)%9,this.onChange()}stream(){const t=Math.floor(this.player.x/W),e=Math.floor(this.player.z/W);if(!this.lastPC||this.lastPC[0]!==t||this.lastPC[1]!==e){this.lastPC=[t,e],this.scanDirty=!0;const u=this.viewDist+3.5;for(const[h,d]of this.world.chunks)Math.hypot(d.cx-t,d.cz-e)>u&&(this.dropMesh(d),this.world.chunks.delete(h))}if(!this.scanDirty)return;const s=performance.now(),r=this.viewDist+.5,a=-Math.sin(this.yaw),o=-Math.cos(this.yaw);let l=!1,c=0;t:for(let u=0;u<2;u++)for(const[h,d,p]of this.offsets){const g=p<2.5||h*a+d*o>-.3*p;if(u===0!==g)continue;let _=this.world.getChunk(t+h,e+d);const m=p<=r&&(!_||!_.meshed);if(!(_&&!m)){if(c>0&&performance.now()-s>this.budget){l=!0;break t}_||(_=this.world.ensure(t+h,e+d),c++,l=!0),m&&this.applyMesh(_)&&(c++,l=!0)}}l||(this.scanDirty=!1)}flushDirty(){const t=this.world;if(t.dirty.size){for(const e of t.dirty)e.meshed&&t.chunks.get(e.key)===e&&this.applyMesh(e);t.dirty.clear()}}dropMesh(t){for(const e of["opaque","trans","logo"])t[e]&&(this.group.remove(t[e]),t[e].geometry.dispose(),t[e]=null)}applyMesh(t){const e=n_(this.world,t);return e?(this.setPart(t,"opaque",e.opaque,this.matO),this.setPart(t,"trans",e.trans,this.matT),this.setPart(t,"logo",e.logo,this.matL),t.meshed=!0,!0):!1}setPart(t,e,n,s){let r=t[e];if(!n){r&&(this.group.remove(r),r.geometry.dispose(),t[e]=null);return}const a=new De;if(a.setAttribute("position",new be(n.pos,3)),a.setAttribute("uv",new be(n.uv,2)),a.setAttribute("aCol",new be(n.col,4)),a.setIndex(new be(n.idx,1)),a.boundingSphere=new ms(new O(W/2,Te/2,W/2),this.chunkSphereR),r){r.geometry.dispose(),r.geometry=a;return}r=new Le(a,s),r.position.set(t.cx*W,0,t.cz*W),r.matrixAutoUpdate=!1,r.updateMatrix(),this.group.add(r),t[e]=r}updateSky(){const t=this.time*Math.PI*2,e=Math.sin(t),n=Math.cos(t),s=Nr(-.12,.28,e),r=Math.max(0,1-Math.abs(e)/.3);let a=ti([.04,.06,.14],[.68,.84,.95],s);a=ti(a,[.97,.56,.36],r*.55);let o=ti([.012,.02,.07],[.24,.5,.88],s);o=ti(o,[.34,.3,.52],r*.4);const l=e>=0,c=l?Nr(-.02,.3,e):Nr(-.02,.3,-e)*.3,u=this.uni.uSunDir.value;l?u.set(n,e,.25):u.set(-n,-e,.25),u.normalize();const h=l?ti([1,.6,.36],[1,.96,.86],Nr(0,.4,e)).map(x=>x*.62*c):[.42*c,.52*c,.85*c];this.uni.uSunCol.value.set(h[0],h[1],h[2]);const d=ti([.17,.21,.36],[.44,.5,.62],s);this.light=.38+.62*s,this.uni.uAmb.value.set(d[0]+r*.12,d[1]+r*.06,d[2]+r*.02);const p=this.camera.position,g=this.world.getBlock(Math.floor(p.x),Math.floor(p.y),Math.floor(p.z))===b.WATER;this.underwater=g;const _=this.viewDist*W-6;if(g){const x=ti([.04,.12,.26],[.12,.38,.66],s);this.uni.uFog.value.set(x[0],x[1],x[2]),this.uni.uFogRange.value.set(.5,24),this.domeU.uHor.value.set(x[0],x[1],x[2]),this.domeU.uZen.value.set(x[0],x[1],x[2]),this.domeU.uGlow.value.set(0,0,0)}else{this.uni.uFog.value.set(a[0],a[1],a[2]),this.uni.uFogRange.value.set(_*.4,_),this.domeU.uHor.value.set(a[0],a[1],a[2]),this.domeU.uZen.value.set(o[0],o[1],o[2]);const x=.9*r+.1*s;this.domeU.uGlow.value.set(.95*x,.62*x,.4*x)}this.domeU.uSunN.value.set(n,e,.25).normalize(),this.sky.position.copy(p);const m=this.domeU.uSunN.value;this.sun.position.copy(m).multiplyScalar(500),this.sun.lookAt(p),this.moon.position.copy(m).multiplyScalar(-500),this.moon.lookAt(p),this.sun.visible=e>-.25&&!g,this.moon.visible=e<.25&&!g,this.starMat.opacity=Math.max(0,Math.min(1,(.12-e)*3))*(g?0:1),this.stars.rotation.z=t,this.clouds.position.set(p.x,105,p.z),this.clouds.visible=!g&&this.cloudsOn;const f=ti([.2,.23,.36],[1,1,1],s);this.cloudU.uCol.value.set(f[0]+r*0,f[1]-r*.18,f[2]-r*.3)}render(){this.renderer.render(this.scene,this.camera)}biomeName(){const t=this.world?this.world.biomeAt(this.player.x,this.player.z):-1;return t>=0?bg[t]:""}clockText(){const t=Math.floor((this.time*24+6)%24*60);return String(Math.floor(t/60)).padStart(2,"0")+":"+String(t%60).padStart(2,"0")}}const et=i=>document.getElementById(i),Zs=et("c"),pl=window.matchMedia("(pointer: coarse)").matches;let jt=kg();const H=new I_(Zs,pl,jt.quality);window.__bv=H;let pe="menu",Qr="menu",ta=-1,xn=pl;const Ce=new Set;document.documentElement.style.setProperty("--atlas",`url(${H.atlasCanvas.toDataURL()})`);const Wo=H.itemCanvas.height/32;document.documentElement.style.setProperty("--items",`url(${H.itemCanvas.toDataURL()})`);document.documentElement.style.setProperty("--itemRows",Wo*100+"%");const Xo=i=>{if(is(i)){const e=Be[i]?Be[i].icon:0;return`<i class="ic it" style="background-position:${e%8*100/7}% ${Wo>1?Math.floor(e/8)*100/(Wo-1):0}%"></i>`}if(sa(i)){const e=i-Gn;return`<i class="ic lg" style="background-position:${e%4*100/3}% ${Math.floor(e/4)*100/3}%"></i>`}if(i===b.RAINBOW)return'<i class="ic rb"></i>';const t=xe[i]?xe[i].icon:0;return`<i class="ic" style="background-position:${t%8*100/7}% ${Math.floor(t/8)*100/7}%"></i>`};H.onLogos=()=>{document.documentElement.style.setProperty("--logos",`url(${H.logoCanvas.toDataURL("image/png")})`)};let Zc=0;function Ie(i){const t=et("toast");t.textContent=i,t.classList.add("on"),clearTimeout(Zc),Zc=setTimeout(()=>t.classList.remove("on"),1800)}H.onToast=Ie;function ml(){const i=et("hotbar");if(!i.children.length)for(let t=0;t<9;t++){const e=document.createElement("div");e.className="slot",e.addEventListener("pointerdown",n=>{n.stopPropagation(),H.selectSlot(t)}),i.appendChild(e)}for(let t=0;t<9;t++){const e=i.children[t],n=H.hotbar[t],s=H.mode==="creative"?"∞":H.inv[n]||0;e.className="slot"+(t===H.sel?" sel":"")+(n&&s===0?" empty":""),e.title=n?Je(n):"",e.innerHTML=`<span class="k">${t+1}</span>${n?Xo(n):""}<span class="n">${n?s:""}</span>`}}let ri="all",jh="",Jh=!1,Gs=new Set,hi=null;const U_=[{id:"all",name:"Alle"},...yg,{id:"items",name:"Werkzeuge & Essen"}],N_=i=>i.tool?` · ${i.tool.speed}× schneller · hält ${i.tool.dur} Blöcke`:i.food?` · +${i.food} Hunger`:"";function Qh(){et("invTabs").innerHTML=U_.map(i=>`<button role="tab" data-cat="${i.id}" class="${i.id===ri?"on":""}" aria-selected="${i.id===ri}">${i.name}</button>`).join("")}function js(){const i=H.mode==="creative",t=jh.trim().toLowerCase();et("invHint").textContent=i?"Kreativmodus: alle Blöcke sind unbegrenzt. Tippe einen Block, um ihn in den gewählten Hotbar-Platz zu legen.":"Tippe einen Block, um ihn in den gewählten Hotbar-Platz zu legen. Zahl = Vorrat.",et("invOwnedL").hidden=i,et("invSt").hidden=i||!hi,hi&&(et("invSt").textContent=hi==="ofen"?"🔥 Am Schmelzofen: Barren schmelzen und Essen braten":"🪚 An der Werkbank: Werkzeuge und Schmelzofen bauen");let e="";for(const s of[...Eg,...Jr]){const r=xe[s]&&!is(s)?xe[s]:Be[s],a=i?"∞":H.inv[s]||0;if(ri!=="all"&&r.cat!==ri||t&&!r.name.toLowerCase().includes(t)||Jh&&!i&&!a)continue;const o=is(s)?N_(r):r.tool?" · am besten mit "+r.tool[0].toUpperCase()+r.tool.slice(1):"";e+=`<button class="cell ${a?"has":"dim"}" data-t="${s}" title="${r.name}${o}">${Xo(s)}<span>${r.name}</span><b>${a}</b></button>`}if(et("invGrid").innerHTML=e||'<div class="empty-note">Nichts gefunden.</div>',et("recH").hidden=i,i){et("recipes").innerHTML="";return}const n=Di.map((s,r)=>[s,r]).filter(([s])=>(ri==="all"||s.cat===ri)&&Jg(s,t));et("recipes").innerHTML=n.length?n.map(([s,r])=>{const a=$h(H.inv,s,an,Gs),o=jg(H.inv,s,an,Gs),l=s.need.map(([h,d])=>{const p=H.inv[h]||0;return p>=d?`${d}× ${Je(h)}`:`<i>${d}× ${Je(h)} (${p})</i>`}).join(" + "),c=a.full?" · Vorrat voll":a.noStation?` · <i>${Bc[s.st]} nicht in der Nähe</i>`:"",u=s.st?`<span class="badge">${s.st==="ofen"?"🔥":"🪚"} ${Bc[s.st]}</span>`:"";return`<button data-r="${r}" ${a.ok?"":"disabled"}>${Xo(s.give[0])}<span><b>${s.give[1]}× ${Je(s.give[0])}</b>${u}<small>aus ${l}${c}</small></span><span class="cnt">${o?o+"×":""}</span></button>`}).join(""):'<div class="empty-note">Kein passendes Rezept.</div>'}et("invTabs").addEventListener("click",i=>{const t=i.target.closest("[data-cat]");t&&(ri=t.dataset.cat,Qh(),js())});et("invSearch").addEventListener("input",i=>{jh=i.target.value,js()});et("invOwned").addEventListener("change",i=>{Jh=i.target.checked,js()});et("invGrid").addEventListener("click",i=>{const t=i.target.closest("[data-t]");if(!t)return;const e=Number(t.dataset.t),n=H.hotbar.indexOf(e);n>=0&&(H.hotbar[n]=H.hotbar[H.sel]),H.hotbar[H.sel]=e,H.unsaved=!0,H.onChange()});et("recipes").addEventListener("click",i=>{const t=i.target.closest("[data-r]");if(!t)return;const e=Di[Number(t.dataset.r)];let n=0,s=null;for(let r=i.shiftKey?5:1;r>0&&(s=Zg(H.inv,e,an,Gs),!!s.ok);r--)n++;if(!n){Ie(s.msg);return}H.unsaved=!0,H.onChange(),H.questEvent("craft",e.give[0],e.give[1]*n),Ie(`+${e.give[1]*n} ${Je(e.give[0])}`)});H.onChange=()=>{ml(),pe==="inventory"&&js()};const qo=et("vit").getContext("2d"),O_=[".##.##.","#######","#######",".#####.","..###..","...#..."],F_=["....##.","...####","..#####",".####..","##.....","#......"],B_=["..###..",".#...#.","#.....#","#.....#",".#...#.","..###.."];function Ka(i,t,e,n,s,r){for(let a=0;a<6;a++)for(let o=0;o<7;o++)i[a][o]==="#"&&(qo.fillStyle=o<3.5?n||s?n||s:r:n||r,qo.fillRect(t+o*2,e+a*2,2,2))}function oa(){const i=H.vitals,t=et("vit");if(t.hidden=!i||pe==="menu",!i)return;qo.clearRect(0,0,200,34);const e=Math.ceil(i.hp),n=Math.ceil(i.food);for(let s=0;s<Zi/2;s++){const r=e-s*2;Ka(O_,s*10,18,r>=2?"#ff3b4a":null,r===1?"#ff3b4a":null,"#3a1a20")}for(let s=0;s<Fs/2;s++){const r=n-s*2;Ka(F_,186-s*10,18,r>=2?"#d89048":null,r===1?"#d89048":null,"#3a2a1a")}if(i.air<Xr)for(let s=0;s<Math.ceil(i.air);s++)Ka(B_,186-s*10,2,"#9ad8ff",null,"#9ad8ff")}H.onVitals=oa;let jc=0;H.onHurt=()=>{const i=et("hurt");if(i.classList.add("on"),oa(),clearTimeout(jc),jc=setTimeout(()=>i.classList.remove("on"),120),navigator.vibrate&&xn)try{navigator.vibrate(60)}catch{}};H.onMine=i=>{et("mine").classList.toggle("on",i>0),et("mine").firstChild.style.width=Math.round(i*100)+"%"};const z_={Sturz:"Zu tief gefallen.",Ertrunken:"Unter Wasser ging die Luft aus.",Magma:"Magma ist heiß.",Hunger:"Vor Hunger."};H.onDeath=(i,t)=>{gl(),Qe("dead"),et("deadWhy").textContent=(z_[i]||"")+(t?" Dein Vorrat liegt am Unglücksort, der Wegpunkt 📍 zeigt den Weg.":" Dein Vorrat bleibt erhalten. Der Wegpunkt 📍 markiert den Unglücksort."),fi()&&document.exitPointerLock(),Ii(!1)};et("dRevive").onclick=()=>{H.revive(),ml(),Qe("playing"),Js()};et("dMenu").onclick=()=>{H.revive(),et("pMenu").onclick()};H.onStation=i=>{hi=i,ri="all",_l()};let Vs=!1,Jc=0;function Ms(){const i=et("quest"),t=H.story;if(!t||H.menuMode){i.hidden=!0;return}if(i.hidden=!1,i.classList.toggle("min",Vs),t.done){i.innerHTML='<b>🎉 Story abgeschlossen</b><small class="txt">Alle Aufträge erledigt. Baue frei weiter!</small>';return}const e=Un[t.i],[n,s]=Zh(H,e),r=Math.min(100,Math.round(n/s*100));i.innerHTML=`<b>Auftrag ${t.i+1}/${Un.length} · ${e.t}</b><div class="bar"><i style="width:${r}%"></i></div><small>${Math.min(n,s)} / ${s}</small><small class="txt">${e.d}</small>`}function tu(i){const t=et("banner");t.innerHTML=i,t.classList.add("on"),clearTimeout(Jc),Jc=setTimeout(()=>t.classList.remove("on"),4200)}H.onQuest=Ms;H.onQuestDone=(i,t)=>{const e=Object.entries(i.r||{}).map(([n,s])=>`+${s} ${fs[n]}`).join(" · ");tu(t?`🎉 Story abgeschlossen!<small>${i.t} geschafft. Die Funkzentrale sendet wieder. Baue frei weiter.</small>`:`✔ Auftrag erledigt: ${i.t}<small>${e}</small>`)};function k_(){const i=H.story;i&&(et("qlist").innerHTML=Un.map((t,e)=>{const n=i.done||e<i.i,s=!i.done&&e===i.i;return`<div class="qi ${n?"done":s?"cur":""}"><span class="st">${n?"✔":s?"➜":e+1}</span><div><b>${t.t}</b>${n||s?`<small>${t.d}</small>`:""}</div></div>`}).join(""))}et("quest").addEventListener("click",()=>{Vs=!Vs,Ms()});et("pQuests").onclick=()=>{k_(),yn("qlog",!0)};et("qlogClose").onclick=()=>yn("qlog",!1);const yn=(i,t)=>{et(i).hidden=!t};function Qe(i){pe=i,document.body.classList.toggle("playing",i==="playing"),yn("menu",i==="menu"),yn("pause",i==="paused"),yn("inv",i==="inventory"),yn("loading",i==="loading"),yn("set",i==="settings"),yn("dead",i==="dead"),yn("hud",i==="playing"||i==="paused"||i==="inventory"||i==="dead"||i==="settings"&&Qr==="paused"),i!=="playing"&&H.onMine(0),i!=="paused"&&yn("qlog",!1)}const fi=()=>document.pointerLockElement===Zs;function Js(){if(!(xn||fi()))try{const i=Zs.requestPointerLock();i&&i.catch&&i.catch(()=>{})}catch{}}function gl(){H.breakHeld=H.placeHeld=!1,Ce.clear(),tr(),Object.assign(H.input,{f:0,r:0,jump:!1,down:!1,sprint:!1})}function Qs(){pe==="playing"&&(H.stop(),gl(),Ii(),Qe("paused"),et("vd").value=H.viewDist,et("vdVal").textContent=H.viewDist,et("pQuests").hidden=!H.story,et("td").value=Math.round(H.time*100),et("tdVal").textContent=H.clockText(),fi()&&document.exitPointerLock())}function eu(){Qe("playing"),H.resume(),Js()}function _l(){pe==="playing"&&(Gs=H.stationsNear(),hi&&!Gs.has(hi)&&(hi=null),gl(),Qe("inventory"),Qh(),js(),fi()&&document.exitPointerLock(),H.stop())}function Yo(){pe==="inventory"&&(hi=null,Qe("playing"),H.resume(),Js(),xn||setTimeout(()=>{pe==="playing"&&!fi()&&Qs()},250))}document.addEventListener("pointerlockchange",()=>{!fi()&&pe==="playing"&&!xn&&Qs()});document.addEventListener("pointerlockerror",()=>{pe==="playing"&&!xn&&Qs()});function Ii(i){if(!H.world||ta<0||H.menuMode)return;const t=Vh(ta,H.serialize());return t&&(H.unsaved=!1),(i||!t)&&Ie(t?"Gespeichert ✔":"Speichern fehlgeschlagen (Speicher voll?)"),t}setInterval(()=>{pe==="playing"&&Ii(!1)},3e4);window.addEventListener("pagehide",()=>Ii(!1));document.addEventListener("visibilitychange",()=>{document.hidden&&pe==="playing"&&Qs()});function H_(i){if(i=(i||"").trim(),!i)return Math.floor(Math.random()*2147483647);if(/^-?\d{1,9}$/.test(i))return Number(i);let t=2166136261;for(let e=0;e<i.length;e++)t=Math.imul(t^i.charCodeAt(e),16777619);return t|0}const Qc=i=>String(i).replace(/[&<>"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[t]);function ai(){let i="";for(let t=0;t<ul;t++){const e=Ng(t);if(e){const n=new Date(e.savedAt).toLocaleString("de-DE",{dateStyle:"short",timeStyle:"short"}),s=e.mode==="creative",r=e.mode==="story",a=r?`<span class="pill st">📜 Story · ${e.q===-1?"abgeschlossen":"Auftrag "+((e.q??0)+1)+"/"+Un.length}</span>`:`<span class="pill ${s?"cr":""}">${s?"Kreativ":"Überleben"}</span>`;i+=`<div class="card"><div class="top"><div class="ico">${r?"📜":s?"🕊":"⛏"}</div><div class="ttl"><b>${Qc(e.name)}</b>${a}</div></div>
        <small>${r?"Feste Story-Welt":"Startwert "+Qc(e.seed)}${(e.gen||1)<zh?" · klassische Welt":""} · zuletzt ${n}</small>
        <div class="row"><button class="go" data-act="load" data-i="${t}">▶ Weiterspielen</button><button data-act="exp" data-i="${t}" aria-label="Welt exportieren" title="Welt als Datei sichern">⤓</button>${Og(t)?`<button data-act="bak" data-i="${t}" aria-label="Sicherung laden" title="Ältere Sicherung wiederherstellen">↺</button>`:""}<button data-act="del" data-i="${t}" aria-label="Welt löschen" title="Welt löschen">🗑</button></div></div>`}else i+=`<div class="card new"><div class="top"><div class="ico">✨</div><div class="ttl"><b>Neue Welt ${t+1}</b><span class="pill">frei</span></div></div>
        <div class="seed"><input id="seed${t}" placeholder="Startwert (leer = Zufall)" maxlength="24" autocomplete="off"><button data-act="dice" data-i="${t}" aria-label="Zufälliger Startwert" title="Zufälliger Startwert">🎲</button></div>
        <div class="seg three" id="mode${t}"><button class="on" data-mode="survival">⛏ Überleben</button><button data-mode="creative">🕊 Kreativ</button><button data-mode="story">📜 Story</button></div>
        <button class="go" data-act="new" data-i="${t}">Welt erzeugen</button></div>`}et("slots").innerHTML=i}et("slots").addEventListener("click",i=>{const t=i.target.closest(".seg [data-mode]");if(t){for(const o of t.parentNode.children)o.classList.toggle("on",o===t);const s=t.closest(".card"),r=t.dataset.mode==="story",a=s.querySelector("input");a.disabled=r,a.placeholder=r?"feste Story-Welt":"Startwert (leer = Zufall)",s.querySelector("[data-act=dice]").disabled=r;return}const e=i.target.closest("[data-act]");if(!e)return;const n=Number(e.dataset.i);if(e.dataset.act==="dice")et("seed"+n).value=String(Math.floor(Math.random()*9e5)+1e5);else if(e.dataset.act==="del")confirm("Diese Welt wirklich löschen?")&&(Fg(n),ai());else if(e.dataset.act==="load"){let s=Ic(n);if(!s){const r=Uc(n);if(r&&confirm("Dieser Speicherstand ist beschädigt. Die letzte Sicherung laden?"))Nc(n),s=r;else{Ie("Speicherstand nicht lesbar"),ai();return}}th(n,s)}else if(e.dataset.act==="exp"){const s=Ic(n);if(!s){Ie("Speicherstand nicht lesbar");return}G_(`klotzfunk-${s.name.replace(/[^\w-]+/g,"_")}.json`,Bg(s))}else if(e.dataset.act==="bak"){const s=Uc(n);if(!s){Ie("Keine lesbare Sicherung"),ai();return}const r=new Date(s.savedAt).toLocaleString("de-DE",{dateStyle:"short",timeStyle:"short"});confirm(`Sicherung vom ${r} wiederherstellen? Der aktuelle Stand wird dafür zur Sicherung.`)&&(Ie(Nc(n)?"Sicherung wiederhergestellt":"Wiederherstellen fehlgeschlagen"),ai())}else{const s=et("mode"+n).querySelector(".on").dataset.mode;th(n,{name:s==="story"?"Story "+(n+1):"Welt "+(n+1),seed:s==="story"?777:H_(et("seed"+n).value),mode:s,gen:s==="story"?1:zh})}});function G_(i,t){try{const e=URL.createObjectURL(new Blob([t],{type:"application/json"})),n=document.createElement("a");n.href=e,n.download=i,document.body.appendChild(n),n.click(),n.remove(),setTimeout(()=>URL.revokeObjectURL(e),2e3)}catch{Ie("Export nicht möglich")}}et("mImport").onclick=()=>{if(Wh()<0){Ie("Kein freier Platz – lösche zuerst eine Welt");return}et("importFile").value="",et("importFile").click()};et("importFile").addEventListener("change",i=>{const t=i.target.files&&i.target.files[0];if(t){if(t.size>8*1024*1024){Ie("Datei zu groß");return}t.text().then(e=>{const n=zg(e),s=Wh();if(!n){Ie("Keine gültige KLOTZFUNK-Welt");return}if(s<0){Ie("Kein freier Platz");return}Ie(Vh(s,n)?`„${n.name}“ importiert (Platz ${s+1})`:"Import fehlgeschlagen (Speicher voll?)"),ai()}).catch(()=>Ie("Datei nicht lesbar"))}});function th(i,t){rs(),ta=i,Qe("loading"),requestAnimationFrame(()=>setTimeout(()=>{try{H.start(t),t.mode==="creative"&&(H.player.flying=!1),et("bFly").hidden=!(xn&&H.mode==="creative"),ml(),Ms(),Qe("playing"),oa(),Js(),H.story&&H.story.i===0&&H.story.p===0&&t.px===void 0&&tu("📜 Willkommen in der Funkzentrale!<small>Dein erster Auftrag steht links. J blendet ihn ein oder aus.</small>"),!H.unsaved&&t.px===void 0&&Ii(!1)}catch(e){console.error(e),Qe("menu"),ai(),alert("Die Welt konnte nicht gestartet werden.")}},30))}et("pResume").onclick=()=>{rs(),eu()};et("pSave").onclick=()=>Ii(!0);et("pRespawn").onclick=()=>{H.respawn(),eu()};et("pSound").onclick=()=>{hn.enabled=!hn.enabled,et("pSound").textContent=hn.enabled?"🔊 Ton: an":"🔇 Ton: aus"};et("pFull").onclick=()=>{try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}catch{}};et("pMenu").onclick=()=>{Ii(!1),ta=-1,ai(),Qe("menu"),H.startMenu(),Ms(),oa()};et("vd").oninput=i=>{const t=Number(i.target.value);H.maxView=t,H.setViewDist(t),et("vdVal").textContent=t};et("invClose").onclick=Yo;et("bInv").onclick=_l;et("bWp").onclick=()=>H.toggleWaypoint();et("bMap").onclick=iu;et("td").oninput=i=>{H.time=Number(i.target.value)/100,et("tdVal").textContent=H.clockText(),H.updateSky(),H.render()};et("pFreeze").onclick=()=>{H.timeFrozen=!H.timeFrozen,et("pFreeze").textContent=H.timeFrozen?"⏸ Zeit steht still":"⏱ Zeit läuft"};et("bPause").onclick=Qs;function tr(){const i=H.input;if(In.joy)return;i.f=(Ce.has("KeyW")||Ce.has("ArrowUp")?1:0)-(Ce.has("KeyS")||Ce.has("ArrowDown")?1:0),i.r=(Ce.has("KeyD")||Ce.has("ArrowRight")?1:0)-(Ce.has("KeyA")||Ce.has("ArrowLeft")?1:0);const t=H.player.flying;i.sprint=Ce.has("ControlLeft")||!t&&Ce.has("ShiftLeft"),i.down=t&&Ce.has("ShiftLeft")||In.down,i.jump=Ce.has("Space")||In.jump}const In={joy:!1,jump:!1,down:!1};let eh=0;function $o(){if(H.mode!=="creative")return;const i=H.player;i.flying=!i.flying,i.vy=0,Ie(i.flying?"Fliegen an":"Fliegen aus"),et("bDown").hidden=!(xn&&i.flying),et("bFly").classList.toggle("on",i.flying)}window.addEventListener("keydown",i=>{if(i.target&&/^(INPUT|SELECT|TEXTAREA)$/.test(i.target.tagName)){i.code==="Escape"&&(i.target.blur(),pe==="inventory"?Yo():pe==="settings"&&Ko());return}if(pe==="settings"){i.code==="Escape"&&Ko();return}if(pe==="inventory"){(i.code==="KeyE"||i.code==="Escape")&&(i.preventDefault(),Yo());return}if(pe==="playing"&&((i.code==="Space"||i.code==="Tab"||i.code.startsWith("Arrow"))&&i.preventDefault(),!i.repeat)){if(/^Digit[1-9]$/.test(i.code)){H.selectSlot(Number(i.code[5])-1);return}if(i.code==="KeyE"){i.preventDefault(),_l();return}if(i.code==="KeyF"){$o();return}if(i.code==="KeyQ"){H.fireHook();return}if(i.code==="KeyB"){H.toggleWaypoint();return}if(i.code==="KeyM"){iu();return}if(i.code==="KeyJ"){Vs=!Vs,Ms();return}if(i.code==="Space"){const t=performance.now();t-eh<280&&$o(),eh=t}Ce.add(i.code),tr()}});window.addEventListener("keyup",i=>{Ce.delete(i.code),pe==="playing"&&tr()});window.addEventListener("blur",()=>{Ce.clear(),tr()});const V_=.0022,W_=.0058;function nu(i,t,e){H.yaw-=i*e,H.pitch=Math.max(-1.55,Math.min(1.55,H.pitch-t*e*(jt.invertY?-1:1)))}window.addEventListener("mousemove",i=>{pe==="playing"&&fi()&&nu(i.movementX,i.movementY,V_*jt.mouseSens)});Zs.addEventListener("mousedown",i=>{if(!(pe!=="playing"||xn&&i.sourceCapabilities&&i.sourceCapabilities.firesTouchEvents)){if(rs(),!fi()){Js();return}i.button===0?H.breakHeld=!0:i.button===2&&(H.placeHeld=!0),i.preventDefault()}});window.addEventListener("mouseup",i=>{i.button===0?H.breakHeld=!1:i.button===2&&(H.placeHeld=!1)});Zs.addEventListener("contextmenu",i=>i.preventDefault());window.addEventListener("wheel",i=>{pe==="playing"&&H.selectSlot(H.sel+(i.deltaY>0?1:-1))},{passive:!0});function X_(){xn&&document.body.classList.contains("touch")||(xn=!0,document.body.classList.add("touch"),et("bFly").hidden=H.mode!=="creative")}xn&&document.body.classList.add("touch");window.addEventListener("pointerdown",i=>{i.pointerType==="touch"&&X_()},{capture:!0});(function(){const t=et("zl"),e=et("zr"),n=et("joy"),s=et("thumb"),r=52;let a=null,o=null;t.addEventListener("pointerdown",h=>{a||(rs(),a={id:h.pointerId,x:h.clientX,y:h.clientY},t.setPointerCapture(h.pointerId),n.style.display="block",n.style.left=h.clientX+"px",n.style.top=h.clientY+"px",s.style.transform="translate(0,0)",In.joy=!0)}),t.addEventListener("pointermove",h=>{if(!a||h.pointerId!==a.id)return;let d=h.clientX-a.x,p=h.clientY-a.y;const g=Math.hypot(d,p),_=g>r?r/g:1;s.style.transform=`translate(${d*_}px,${p*_}px)`;const m=Math.min(1,g*jt.joySens/r),f=m<.14?0:(m-.14)/.86,x=g?d/g:0,E=g?p/g:0;H.input.r=x*f,H.input.f=-E*f,H.input.sprint=g>r*1.35});const l=h=>{!a||h.pointerId!==a.id||(a=null,n.style.display="none",In.joy=!1,H.input.f=H.input.r=0,H.input.sprint=!1,tr())};t.addEventListener("pointerup",l),t.addEventListener("pointercancel",l),e.addEventListener("pointerdown",h=>{o||(o={id:h.pointerId,x:h.clientX,y:h.clientY},e.setPointerCapture(h.pointerId))}),e.addEventListener("pointermove",h=>{!o||h.pointerId!==o.id||(nu(h.clientX-o.x,h.clientY-o.y,W_*jt.touchSens),o.x=h.clientX,o.y=h.clientY)});const c=h=>{o&&h.pointerId===o.id&&(o=null)};e.addEventListener("pointerup",c),e.addEventListener("pointercancel",c);const u=(h,d,p)=>{const g=et(h);g.addEventListener("pointerdown",m=>{m.preventDefault(),rs(),g.setPointerCapture(m.pointerId),g.classList.add("on"),d()});const _=()=>{g.classList.remove("on"),p()};g.addEventListener("pointerup",_),g.addEventListener("pointercancel",_)};u("bBreak",()=>{H.breakHeld=!0},()=>{H.breakHeld=!1}),u("bPlace",()=>{H.placeHeld=!0},()=>{H.placeHeld=!1}),u("bJump",()=>{In.jump=!0,H.input.jump=!0},()=>{In.jump=!1,H.input.jump=Ce.has("Space")}),u("bDown",()=>{In.down=!0,H.input.down=!0},()=>{In.down=!1,H.input.down=!1}),et("bFly").addEventListener("click",$o),et("bHook").addEventListener("pointerdown",h=>{h.preventDefault(),rs(),H.fireHook()})})();window.addEventListener("resize",()=>H.resize());let qr=!0;function iu(){qr=!qr,et("mm").classList.toggle("off",!qr)}const ye=et("mm").getContext("2d"),nh=ye.createImageData(56,56);function q_(){const i=H.world,t=H.player,e=nh.data,n=Math.floor(t.x)-28,s=Math.floor(t.z)-28,r=t.y;for(let a=0;a<56;a++)for(let o=0;o<56;o++){const l=n+o,c=s+a,u=i.getChunk(l>>4,c>>4),h=(a*56+o)*4;let d=14,p=18,g=32;if(u){const _=(l&15)+(c&15)*16;let m=Math.min(Te-1,u.maxY);for(;m>0&&u.data[_+m*256]===0;)m--;const f=u.data[_+m*256],x=xe[f]?xe[f].map:[200,200,210],E=f===b.WATER?1:Math.max(.55,Math.min(1.25,1+(m-r)*.025));d=x[0]*E,p=x[1]*E,g=x[2]*E}e[h]=d,e[h+1]=p,e[h+2]=g,e[h+3]=255}if(ye.putImageData(nh,0,0),H.wp){let a=H.wp.x-t.x,o=H.wp.z-t.z;const l=Math.max(Math.abs(a),Math.abs(o)),c=l>25?25/l:1;a*=c,o*=c,ye.fillStyle="#ff2d95",ye.fillRect(28+a-2,28+o-2,5,5),ye.strokeStyle="#fff",ye.strokeRect(28+a-2.5,28+o-2.5,6,6)}ye.save(),ye.translate(28,28),ye.rotate(-H.yaw),ye.fillStyle="#fff",ye.strokeStyle="#000",ye.beginPath(),ye.moveTo(0,-5),ye.lineTo(3.5,4),ye.lineTo(0,2),ye.lineTo(-3.5,4),ye.closePath(),ye.fill(),ye.stroke(),ye.restore()}let Y_=0;setInterval(()=>{if(pe!=="playing")return;const i=H.player;let t="";i.flying&&(t+=" · fliegt"),i.gliding&&(t+=" · gleitet"),H.hookT>0&&(t+=" · Haken"),H.wp&&(t+=` · 📍 ${Math.round(Math.hypot(H.wp.x-i.x,H.wp.z-i.z))} m`),H.radioDist<24&&(t+=" · ♪");const e=H.biomeName();e&&(t+=" · "+e),jt.showFps&&(t+=` · ${H.fps} FPS`),et("info").textContent=`${H.clockText()} ${H.time<.5?"☀":"☾"} · X ${i.x.toFixed(0)} Y ${i.y.toFixed(0)} Z ${i.z.toFixed(0)}${t}`,et("uw").classList.toggle("on",!!H.underwater),qr&&!(Y_++&1)&&q_(),H.story&&Ms()},250);function su(){const i=jt.quality==="auto";H.setQuality(i?Gg(pl):jt.quality,i),H.placeDelay=jt.placeDelay,H.deathLoss=jt.deathLoss,hn.vol=jt.sfxVol,hn.music=jt.musicVol,document.documentElement.style.setProperty("--tbs",String(jt.btnScale)),document.body.classList.toggle("lefty",jt.lefty)}const ru=[["sMouse","mouseSens",i=>i.toFixed(1)+"×"],["sTouch","touchSens",i=>i.toFixed(1)+"×"],["sJoy","joySens",i=>i.toFixed(1)+"×"],["sBtn","btnScale",i=>Math.round(i*100)+" %"],["sSfx","sfxVol",i=>Math.round(i*100)+" %"],["sMus","musicVol",i=>Math.round(i*100)+" %"]],au=[["sLefty","lefty"],["sInvY","invertY"],["sPlace","placeDelay"],["sFps","showFps"]];function ou(){et("sQuality").value=jt.quality,et("sDeath").value=jt.deathLoss;for(const[i,t,e]of ru)et(i).value=jt[t],et(i+"V").textContent=e(jt[t]);for(const[i,t]of au)et(i).checked=jt[t]}function er(i){Hg(jt),i?su():(H.placeDelay=jt.placeDelay,H.deathLoss=jt.deathLoss,hn.vol=jt.sfxVol,hn.music=jt.musicVol,document.documentElement.style.setProperty("--tbs",String(jt.btnScale)),document.body.classList.toggle("lefty",jt.lefty))}et("sQuality").onchange=i=>{jt.quality=i.target.value,er(!0)};et("sDeath").onchange=i=>{jt.deathLoss=i.target.value,er(!1)};for(const[i,t,e]of ru)et(i).oninput=n=>{jt[t]=Number(n.target.value),et(i+"V").textContent=e(jt[t]),er(!1)};for(const[i,t]of au)et(i).onchange=e=>{jt[t]=e.target.checked,er(!1)};et("sReset").onclick=()=>{jt={...Vr},er(!0),ou(),Ie("Standard wiederhergestellt")};function lu(){Qr=pe,ou(),Qe("settings")}function Ko(){pe==="settings"&&(Qe(Qr),Qr==="paused"&&(et("vd").value=H.viewDist,et("vdVal").textContent=H.viewDist))}et("pSettings").onclick=lu;et("mSettings").onclick=lu;et("setClose").onclick=Ko;su();ai();Qe("menu");H.startMenu();
