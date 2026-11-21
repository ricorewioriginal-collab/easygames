import{S as e}from"./index-BjCaH47Q.js";import{b as o,a as d,i as s,c,d as l}from"./bakedVertexAnimation-Dujw63aC.js";import{m as f,a as u,b as p,c as V}from"./morphTargetsVertex-DZ11a88t.js";import{c as m,a as v}from"./clipPlaneVertex-t0I6RDQ2.js";import{i as x}from"./instancesDeclaration-CPX6I2pa.js";import{p as h}from"./pointCloudVertex-CJKTOpnY.js";const t="pointCloudVertexDeclaration",r=`#ifdef POINTSIZE
uniform float pointSize;
#endif
`;e.IncludesShadersStore[t]||(e.IncludesShadersStore[t]=r);const S={name:t,shader:r},a="depthVertexShader",n=`attribute vec3 position;
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<morphTargetsVertexGlobalDeclaration>
#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]
#include<clipPlaneVertexDeclaration>
#include<instancesDeclaration>
uniform mat4 viewProjection;uniform vec2 depthValues;
#if defined(ALPHATEST) || defined(NEED_UV)
varying vec2 vUV;uniform mat4 diffuseMatrix;
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#endif
#ifdef STORE_CAMERASPACE_Z
uniform mat4 view;varying vec4 vViewPos;
#endif
#include<pointCloudVertexDeclaration>
varying float vDepthMetric;
#define CUSTOM_VERTEX_DEFINITIONS
void main(void)
{vec3 positionUpdated=position;
#ifdef UV1
vec2 uvUpdated=uv;
#endif
#ifdef UV2
vec2 uv2Updated=uv2;
#endif
#include<morphTargetsVertexGlobal>
#include<morphTargetsVertex>[0..maxSimultaneousMorphTargets]
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=finalWorld*vec4(positionUpdated,1.0);
#include<clipPlaneVertex>
gl_Position=viewProjection*worldPos;
#ifdef STORE_CAMERASPACE_Z
vViewPos=view*worldPos;
#else
#ifdef USE_REVERSE_DEPTHBUFFER
vDepthMetric=((-gl_Position.z+depthValues.x)/(depthValues.y));
#else
vDepthMetric=((gl_Position.z+depthValues.x)/(depthValues.y));
#endif
#endif
#if defined(ALPHATEST) || defined(BASIC_RENDER)
#ifdef UV1
vUV=vec2(diffuseMatrix*vec4(uvUpdated,1.0,0.0));
#endif
#ifdef UV2
vUV=vec2(diffuseMatrix*vec4(uv2Updated,1.0,0.0));
#endif
#endif
#include<pointCloudVertex>
}
`;e.ShadersStore[a]||(e.ShadersStore[a]=n);const D=[o,d,f,u,m,x,S,p,V,s,c,l,v,h];for(const i of D)e.IncludesShadersStore[i.name]||(e.IncludesShadersStore[i.name]=i.shader);const A={name:a,shader:n};export{A as depthVertexShader};
