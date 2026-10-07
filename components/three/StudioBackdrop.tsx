"use client";

/**
 * React Bits Silk (David Haz), MIT + Commons Clause.
 * Original fold/noise shader preserved; adapted to the existing Canvas, a
 * a graphite/silver finish and a quiet left reading area. No second renderer.
 * Source + full license: /credits/REACT-BITS-LICENSE.txt
 */
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import { ShaderMaterial } from "three";
import type { MotionState } from "./Scene";

const fragmentShader = `
varying vec2 vUv;
uniform float uTime, uSpeed, uScale, uRotation, uNoiseIntensity, uQuiet, uContrast, uCompact;
const float e = 2.71828182845904523536;
float noise(vec2 texCoord) {
  vec2 r = e * sin(e * texCoord);
  return fract(r.x * r.y * (1.0 + texCoord.x));
}
vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle), s = sin(angle);
  return mat2(c, -s, s, c) * uv;
}
void main() {
  float rnd = noise(gl_FragCoord.xy);
  vec2 uv = rotateUvs(vUv * uScale, uRotation);
  vec2 tex = uv * uScale;
  float tOffset = uSpeed * uTime;
  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);
  float pattern = 0.6 + 0.4 * sin(5.0 * (tex.x + tex.y +
    cos(3.0 * tex.x + 5.0 * tex.y) + 0.02 * tOffset) +
    sin(9.0 * (tex.x + tex.y - 0.1 * tOffset)));
  float fold = smoothstep(0.28, 0.9, pattern);
  float specular = smoothstep(0.72, 0.98, pattern);
  // Wide softbox reflections roll over the source's continuous folds. These
  // are tonal surfaces, with no neon emission or decorative line geometry.
  float body = mix(0.018, 0.115, fold);
  float highlight = pow(specular, 1.8) * (0.19 + uContrast * 0.06);
  vec3 result = vec3(body + highlight);
  float fineNoise = noise(gl_FragCoord.xy * 0.63 + vec2(17.0, 41.0));
  result += (rnd + fineNoise - 1.0) * uNoiseIntensity * 0.012;
  // Keep ink legible; the folds remain most expressive in the model's half.
  float reading = (0.08 + 0.86 * smoothstep(0.25, 0.82, vUv.x)) * (1.0 - uQuiet * 0.82) * (1.0 - uCompact * 0.45);
  result = mix(vec3(0.0392), result, reading);
  gl_FragColor = vec4(clamp(result, 0.0, 1.0), 1.0);
}`;
export function StudioBackdrop({ motion }: { motion: RefObject<MotionState> }) {
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uSpeed: { value: 3 }, uScale: { value: .65 },
    uRotation: { value: -.4 }, uNoiseIntensity: { value: .25 }, uQuiet: { value: 0 }, uContrast: { value: 0 }, uCompact: { value: 0 },
  }), []);
  useFrame(({ clock, size }) => {
    if (!material.current) return;
    const m = motion.current;
    const u = material.current.uniforms;
    u.uTime.value = clock.elapsedTime * .24;
    u.uRotation.value = -.4 + (m.fabricShift ?? 0) * .36;
    u.uQuiet.value = m.quiet ?? 0;
    // Body copy spans the full viewport on phones. Cap the moving highlight's
    // intensity there so contrast holds even when a fold passes beneath it.
    u.uCompact.value = size.width < 768 ? 1 : 0;
    u.uContrast.value = m.warmth ?? 0;
  });
  return <mesh frustumCulled={false} renderOrder={-100}>
    <planeGeometry args={[2, 2]} />
    <shaderMaterial ref={material} uniforms={uniforms} depthTest={false} depthWrite={false} toneMapped={false}
      vertexShader="varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,1.0,1.0); }"
      fragmentShader={fragmentShader} />
  </mesh>;
}

