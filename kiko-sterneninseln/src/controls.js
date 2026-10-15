// The camera looks along +z at yaw 0. Its screen-right vector then points to -x.
// Combine camera right (-cos, sin) with camera forward (sin, cos).
export function cameraRelative(x,y,yaw){const c=Math.cos(yaw),s=Math.sin(yaw);return {x:-x*c-y*s,z:x*s-y*c}}
