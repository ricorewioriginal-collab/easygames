// Stick y is negative when pushed towards the top of the screen.
// Camera forward is (sin(yaw), cos(yaw)) on the ground plane.
export function cameraRelative(x,y,yaw){const c=Math.cos(yaw),s=Math.sin(yaw);return {x:x*c-y*s,z:-x*s-y*c}}
