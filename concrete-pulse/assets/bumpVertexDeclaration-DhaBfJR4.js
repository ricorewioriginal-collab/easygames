import{S as d}from"./index-BjCaH47Q.js";const e="bumpVertexDeclaration",n=`#if defined(BUMP) || defined(BENTNORMAL) || defined(PARALLAX) || defined(CLEARCOAT_BUMP) || defined(ANISOTROPIC)
#if defined(TANGENT) && defined(NORMAL) 
varying mat3 vTBN;
#endif
#endif
`;d.IncludesShadersStore[e]||(d.IncludesShadersStore[e]=n);const r={name:e,shader:n};export{r as b};
