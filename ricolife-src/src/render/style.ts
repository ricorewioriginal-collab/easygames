// Konsolen-Look: weiches Comic-Licht (Licht „umwickelt“ die Formen, sanfte Hell-Dunkel-Kante), helle Lichtkante am Rand und
// etwas kräftigere Farben – wie bei bunten Lebens-/Abenteuerspielen auf Handheld-Konsolen. Kostet praktisch nichts:
// nur ein paar Rechenschritte im vorhandenen Lambert-Shader, keine Nachbearbeitung, keine zusätzlichen Durchgänge.
import * as THREE from 'three';

/** gemeinsamer Schalter (0 = schlicht, 1 = Konsolen-Look) */
export const TOON = { value: 1 };

const DOT = 'float dotNL = saturate( dot( geometryNormal, directLight.direction ) );';
const TOON_DOT = `float ndlRaw = dot( geometryNormal, directLight.direction );
	float ndlWrap = saturate( ( ndlRaw + 0.3 ) / 1.3 );
	float dotNL = mix( saturate( ndlRaw ), smoothstep( 0.18, 0.62, ndlWrap ) * 0.82 + ndlWrap * 0.18, uToon );`;
const RIM = `
	{
		vec3 vd = normalize( vViewPosition );
		float rim = pow( 1.0 - saturate( dot( normal, vd ) ), 3.0 );
		outgoingLight += uToon * rim * 0.22 * ( diffuseColor.rgb + 0.25 );
		float lum = dot( outgoingLight, vec3( 0.299, 0.587, 0.114 ) );
		outgoingLight = mix( vec3( lum ), outgoingLight, 1.0 + 0.14 * uToon );
	}
	#include <opaque_fragment>`;

/** Lambert-Material auf den Konsolen-Look umstellen (verträgt vorhandenes onBeforeCompile) */
export function stylize<M extends THREE.MeshLambertMaterial>(m: M): M {
  const prev = m.onBeforeCompile.bind(m);
  const prevKey = m.customProgramCacheKey.bind(m);
  m.onBeforeCompile = (sh, r) => {
    prev(sh, r);
    sh.uniforms.uToon = TOON;
    // Fehlt die Stelle in einer anderen three-Fassung, bleibt das Licht einfach schlicht (replace ändert dann nichts)
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uToon;')
      .replace('#include <lights_lambert_pars_fragment>', THREE.ShaderChunk.lights_lambert_pars_fragment.replace(DOT, TOON_DOT))
      .replace('#include <opaque_fragment>', RIM);
  };
  m.customProgramCacheKey = () => `${prevKey()}|toon`;
  m.needsUpdate = true;
  return m;
}
