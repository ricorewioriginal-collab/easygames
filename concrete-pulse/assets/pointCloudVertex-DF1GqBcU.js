import{S as o}from"./index-C_cWVlBs.js";const e="pointCloudVertex",t=`#if defined(POINTSIZE) && !defined(WEBGPU)
gl_PointSize=pointSize;
#endif
`;o.IncludesShadersStore[e]||(o.IncludesShadersStore[e]=t);const n={name:e,shader:t};export{n as p};
