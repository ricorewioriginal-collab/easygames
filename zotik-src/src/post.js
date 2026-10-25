/* Nachbearbeitung: Glühen (Bloom), Kantenglättung, Farbabstimmung.
   Stufen: 0 = alles (MSAA + Bloom), 1 = Bloom in halber Auflösung + FXAA, 2+ = direkt rendern (Handy mit schwacher Bildrate). */
import * as T from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

const GRADE = {
  uniforms: { tDiffuse: { value: null }, sat: { value: 1.08 }, con: { value: 1.07 }, vig: { value: .3 }, warm: { value: new T.Vector3(1.02, 1.0, .97) } },
  vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader: 'uniform sampler2D tDiffuse;uniform float sat,con,vig;uniform vec3 warm;varying vec2 vUv;'
    + 'void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;float l=dot(c,vec3(.299,.587,.114));c=mix(vec3(l),c,sat);'
    + 'c=(c-.5)*con+.5;c*=warm;'
    + 'vec2 d=vUv-.5;float v=1.-dot(d,d)*vig*2.2;c*=clamp(v,0.,1.);'
    + 'gl_FragColor=vec4(max(c,0.),1.);}'
};

export function createPost(renderer, scene, camera, opt) {
  opt = opt || {};
  const gl2 = renderer.capabilities.isWebGL2;
  const size = renderer.getDrawingBufferSize(new T.Vector2());
  const msaa = gl2 && !opt.touch;
  const mkRT = (s) => msaa
    ? new T.WebGLMultisampleRenderTarget(s.x, s.y, { format: T.RGBAFormat })
    : new T.WebGLRenderTarget(s.x, s.y, { format: T.RGBAFormat });
  const rt = mkRT(size);
  if (msaa) rt.samples = 4;
  const composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new T.Vector2(size.x / 2, size.y / 2), opt.touch ? .4 : .5, .7, .88);
  composer.addPass(bloom);
  const fxaa = new ShaderPass(FXAAShader);
  composer.addPass(fxaa);
  const grade = new ShaderPass(GRADE);
  composer.addPass(grade);
  let level = 0;
  fxaa.enabled = !msaa;
  function resize() {
    const pr = renderer.getPixelRatio(), w = innerWidth, h = innerHeight;
    composer.setPixelRatio(pr);
    composer.setSize(w, h);
    bloom.setSize(Math.max(2, w * pr * (level >= 1 ? .35 : .5)), Math.max(2, h * pr * (level >= 1 ? .35 : .5)));
    fxaa.material.uniforms.resolution.value.set(1 / (w * pr), 1 / (h * pr));
  }
  return {
    get on() { return level < 2 },
    setLevel(l) { if (l === level) return; level = l; fxaa.enabled = !msaa; resize() },
    resize,
    render(dt) { if (level >= 2) renderer.render(scene, camera); else composer.render(dt) }
  };
}
