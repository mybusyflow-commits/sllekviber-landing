import type { WebGLRenderer } from "three";

const restores = new WeakMap<WebGLRenderer, () => void>();

/**
 * Three r182's PMREM always samples with tangent-space V=(0,0,1). ANGLE
 * evaluates the unused zero-denominator branch of its general VNDF sampler
 * while constant folding, producing X4008/X4122 driver warnings. Specialize
 * only that internal sampler to the equivalent normal-view GGX expression.
 * Derivation: Heitz 2018, sections 3–4, with Vh=(0,0,1):
 * https://jcgt.org/published/0007/04/01/paper.pdf
 * Artist materials, regular shaders and diagnostic reporting are untouched.
 */
export function installStableEnvironmentSampling(renderer: WebGLRenderer) {
  if (restores.has(renderer)) return;
  const context = renderer.getContext();
  const original = context.shaderSource;
  const patched: typeof original = function (shader, source) {
    if (source.includes("importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness)")) {
      source = source.replace(/vec3 importanceSampleGGX_VNDF\(vec2 Xi, vec3 V, float roughness\)\s*\{[\s\S]*?\n\s*\}/, `
        vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
          float alpha = roughness * roughness;
          float phi = 2.0 * PI * Xi.y;
          float denominator = max(1.0 - Xi.x + alpha * alpha * Xi.x, 0.000001);
          float cosTheta = sqrt(max(0.0, (1.0 - Xi.x) / denominator));
          float sinTheta = sqrt(max(0.0, 1.0 - cosTheta * cosTheta));
          return vec3(cos(phi) * sinTheta, sin(phi) * sinTheta, cosTheta);
        }
      `);
    }
    original.call(context, shader, source);
  };
  context.shaderSource = patched;
  restores.set(renderer, () => { if (context.shaderSource === patched) context.shaderSource = original; });
}

export function restoreEnvironmentSampling(renderer: WebGLRenderer) {
  restores.get(renderer)?.();
  restores.delete(renderer);
}
