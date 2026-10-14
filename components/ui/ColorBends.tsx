"use client";
/** React Bits ColorBends by David Haz.
 * Source: https://github.com/DavidHDev/react-bits/tree/main/src/ts-default/Backgrounds/ColorBends
 * License: /credits/REACT-BITS-LICENSE.txt
 * Original shaders; adapted lifecycle, palette, pointer scope, capped 30fps,
 * resolution budget, reduced motion, pause and context-loss fallback.
 */
import { useEffect, useRef } from "react";
import * as THREE from "three";

const MAX_COLORS = 8 as const;

const frag = `
#define MAX_COLORS ${MAX_COLORS}
uniform vec2 uCanvas;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uRot;
uniform int uColorCount;
uniform vec3 uColors[MAX_COLORS];
uniform int uTransparent;
uniform float uScale;
uniform float uFrequency;
uniform float uWarpStrength;
uniform vec2 uPointer; // in NDC [-1,1]
uniform float uMouseInfluence;
uniform float uParallax;
uniform float uNoise;
uniform int uIterations;
uniform float uIntensity;
uniform float uBandWidth;
varying vec2 vUv;

void main() {
  float t = uTime * uSpeed;
  vec2 p = vUv * 2.0 - 1.0;
  p += uPointer * uParallax * 0.1;
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
  vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);
  q /= max(uScale, 0.0001);
  q /= 0.5 + 0.2 * dot(q, q);
  q += 0.2 * cos(t) - 7.56;
  vec2 toward = (uPointer - rp);
  q += toward * uMouseInfluence * 0.2;

    for (int j = 0; j < 5; j++) {
      if (j >= uIterations - 1) break;
      vec2 rr = sin(1.5 * (q.yx * uFrequency) + 2.0 * cos(q * uFrequency));
      q += (rr - q) * 0.15;
    }

    vec3 col = vec3(0.0);
    float a = 1.0;

    if (uColorCount > 0) {
      vec2 s = q;
      vec3 sumCol = vec3(0.0);
      float cover = 0.0;
      for (int i = 0; i < MAX_COLORS; ++i) {
            if (i >= uColorCount) break;
            s -= 0.01;
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);
            float kMix = pow(kBelow, 0.3); // strong response across 0..1
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0); // allow >1 to amplify displacement
            vec2 disp = (r - s) * kBelow;
            vec2 warped = s + disp * gain;
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
            float m = mix(m0, m1, kMix);
            float w = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
            sumCol += uColors[i] * w;
            cover = max(cover, w);
      }
      col = clamp(sumCol, 0.0, 1.0);
      a = uTransparent > 0 ? cover : 1.0;
    } else {
        vec2 s = q;
        for (int k = 0; k < 3; ++k) {
            s -= 0.01;
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(k)) / 4.0);
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);
            float kMix = pow(kBelow, 0.3);
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
            vec2 disp = (r - s) * kBelow;
            vec2 warped = s + disp * gain;
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(k)) / 4.0);
            float m = mix(m0, m1, kMix);
            col[k] = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
        }
        a = uTransparent > 0 ? max(max(col.r, col.g), col.b) : 1.0;
    }

    col *= uIntensity;

    if (uNoise > 0.0001) {
      float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
      col += (n - 0.5) * uNoise;
      col = clamp(col, 0.0, 1.0);
    }

    vec3 rgb = (uTransparent > 0) ? col * a : col;
    gl_FragColor = vec4(rgb, a);
}
`;

const vert = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

type Props = { moving: boolean; onReady: () => void; onError: () => void };

export default function ColorBends({ moving, onReady, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const movingRef = useRef(moving);
  const scheduleRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "low-power" });
    } catch {
      onError();
      return;
    }
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const palette = ["#e75036", "#aa3524", "#f0b29e"];
    const colors = Array.from({ length: MAX_COLORS }, (_, i) => {
      const hex = palette[i];
      return hex ? new THREE.Vector3(parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255) : new THREE.Vector3();
    });
    const angle = -35 * Math.PI / 180;
    const material = new THREE.ShaderMaterial({
      vertexShader: vert, fragmentShader: frag, premultipliedAlpha: true, transparent: true,
      uniforms: {
        uCanvas: { value: new THREE.Vector2(1, 1) }, uTime: { value: 2.8 }, uSpeed: { value: .13 },
        uRot: { value: new THREE.Vector2(Math.cos(angle), Math.sin(angle)) },
        uColorCount: { value: palette.length }, uColors: { value: colors }, uTransparent: { value: 0 },
        uScale: { value: 1 }, uFrequency: { value: 1 }, uWarpStrength: { value: 1 },
        uPointer: { value: new THREE.Vector2() }, uMouseInfluence: { value: .35 }, uParallax: { value: .2 },
        uNoise: { value: 0 }, uIterations: { value: 1 }, uIntensity: { value: 1.3 }, uBandWidth: { value: 6 },
      },
    });
    scene.add(new THREE.Mesh(geometry, material));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x0d0d0d, 0);
    container.appendChild(renderer.domElement);
    let frame = 0;
    let lastDraw = 0;
    let elapsed = 2.8;
    let lost = false;
    const pointer = new THREE.Vector2();
    const target = new THREE.Vector2();
    const draw = (now: number) => {
      frame = 0;
      if (lost) return;
      // Draw continuously while visible, capped at 30fps.
      if (movingRef.current && now - lastDraw < 1000 / 30) { frame = requestAnimationFrame(draw); return; }
      const dt = Math.min(.05, Math.max(0, (now - lastDraw) / 1000));
      lastDraw = now;
      if (movingRef.current) {
        elapsed += dt;
        pointer.lerp(target, 1 - Math.exp(-dt * 4));
      }
      material.uniforms.uTime.value = elapsed;
      material.uniforms.uPointer.value.copy(pointer);
      renderer.render(scene, camera);
      if (movingRef.current) frame = requestAnimationFrame(draw);
    };
    const schedule = () => { if (!frame && !lost) frame = requestAnimationFrame(draw); };
    scheduleRef.current = schedule;
    const resize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25, Math.sqrt(1_400_000 / (width * height))));
      renderer.setSize(width, height, false);
      material.uniforms.uCanvas.value.set(width, height);
      schedule();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    const section = container.closest("section");
    const pointerMove = (event: PointerEvent) => {
      if (!movingRef.current || (event.pointerType === "mouse" && event.buttons) || !section) return;
      const rect = section.getBoundingClientRect();
      target.set(((event.clientX - rect.left) / rect.width) * 2 - 1, 1 - ((event.clientY - rect.top) / rect.height) * 2);
    };
    const pointerLeave = () => target.set(0, 0);
    const pointerUp = (event: PointerEvent) => { if (event.pointerType !== "mouse") pointerLeave(); };
    const contextLost = () => { lost = true; cancelAnimationFrame(frame); frame = 0; onError(); };
    section?.addEventListener("pointermove", pointerMove, { passive: true });
    section?.addEventListener("pointerdown", pointerMove, { passive: true });
    section?.addEventListener("pointerup", pointerUp, { passive: true });
    section?.addEventListener("pointercancel", pointerLeave);
    section?.addEventListener("pointerleave", pointerLeave);
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    // Detect compile failure before reporting a usable animated surface.
    renderer.render(scene, camera);
    const gl = renderer.getContext();
    if (renderer.info.programs?.some(program => !gl.getProgramParameter(program.program, gl.LINK_STATUS))) { onError(); }
    else { onReady(); }
    return () => {
      cancelAnimationFrame(frame);
      scheduleRef.current = null;
      observer.disconnect();
      section?.removeEventListener("pointermove", pointerMove);
      section?.removeEventListener("pointerdown", pointerMove);
      section?.removeEventListener("pointerup", pointerUp);
      section?.removeEventListener("pointercancel", pointerLeave);
      section?.removeEventListener("pointerleave", pointerLeave);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      geometry.dispose(); material.dispose(); renderer.dispose(); renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [onReady, onError]);

  useEffect(() => {
    movingRef.current = moving;
    scheduleRef.current?.();
  }, [moving]);

  return <div ref={containerRef} className="hero-color-bends" />;
}

