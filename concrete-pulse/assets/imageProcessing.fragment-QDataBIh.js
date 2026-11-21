import{S as e}from"./index-DMMX9trZ.js";import{i as n,a}from"./imageProcessingFunctions-xyNIO6J9.js";import{helperFunctions as o}from"./helperFunctions-gpzJj64g.js";const s="imageProcessingPixelShader",i=`varying vec2 vUV;uniform sampler2D textureSampler;
#include<imageProcessingDeclaration>
#include<helperFunctions>
#include<imageProcessingFunctions>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void)
{vec4 result=texture2D(textureSampler,vUV);result.rgb=max(result.rgb,vec3(0.));
#ifdef IMAGEPROCESSING
#ifndef FROMLINEARSPACE
result.rgb=toLinearSpace(result.rgb);
#endif
result=applyImageProcessing(result);
#else
#ifdef FROMLINEARSPACE
result=applyImageProcessing(result);
#endif
#endif
gl_FragColor=result;}`;e.ShadersStore[s]||(e.ShadersStore[s]=i);const t=[n,o,a];for(const r of t)e.IncludesShadersStore[r.name]||(e.IncludesShadersStore[r.name]=r.shader);const u={name:s,shader:i};export{u as imageProcessingPixelShader};
