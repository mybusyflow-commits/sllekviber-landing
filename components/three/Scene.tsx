"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Center, ContactShadows, Environment, Lightformer, useProgress } from "@react-three/drei";
import { Component, Suspense, useEffect, useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { StudioBackdrop } from "./StudioBackdrop";
import { EditorialLaptop, CircuitBoard, EditorialPhone } from "./models/CuratedAssets";
import { LaptopAssembly } from "./LaptopAssembly";
import { installStableEnvironmentSampling, restoreEnvironmentSampling } from "./stableEnvironmentSampling";

export type MotionState = {
  progress: number; velocity: number; reduced: boolean;
  stage: number; asset: number; visibility: number; turn: number; assembly: number;
  cameraX: number; cameraY: number; cameraZ: number;
  travel?: number; tilt?: number;
  hinge?: number; warmth?: number; fabricShift?: number; quiet?: number;
  modelX?: number; modelY?: number; modelScale?: number;
  invalidate?: () => void;
};
export const initialMotion = (): MotionState => ({ progress: 0, velocity: 0, reduced: false, stage: 0, asset: 0, visibility: 1, turn: -.28, assembly: 1, cameraX: 0, cameraY: .35, cameraZ: 8.8 });

const models = [EditorialLaptop, EditorialLaptop, CircuitBoard, EditorialPhone, EditorialLaptop];
const modelSizes = [4.7, 4.7, 4, 3.9, 4.7];

function ModelSlot({ index, motion }: { index: number; motion: RefObject<MotionState>; mobile: boolean }) {
  const { viewport, camera, size } = useThree();
  const narrow = size.width < 768;
  const group = useRef<THREE.Group>(null);
  const model = useRef<THREE.Group>(null);
  const materials = useRef<THREE.Material[]>([]);
  const Model = models[index];
  useLayoutEffect(() => {
    const found = new Set<THREE.Material>();
    model.current?.traverse(object => { if (object instanceof THREE.Mesh) { const list = Array.isArray(object.material) ? object.material : [object.material]; list.forEach(material => { material.transparent = true; found.add(material); }); } });
    materials.current = [...found];
  }, []);
  useFrame(() => {
    if (!group.current) return;
    const m = motion.current;
    const visible = m.asset === index && m.visibility > .005 && (index !== 4 || m.assembly >= .999);
    group.current.visible = visible;
    if (!visible) return;
    const view = viewport.getCurrentViewport(camera);
    const travel = m.travel ?? 0;
    group.current.position.set(view.width * (m.modelX ?? (narrow ? 0 : .28)), view.height * (m.modelY ?? (narrow ? -.26 : 0)), travel);
    const laptop = [0, 1, 4].includes(index);
    group.current.rotation.set((index === 2 ? 1.05 : laptop ? .06 : -.04) + (m.tilt ?? 0), m.turn + (laptop ? Math.PI : 0), index === 3 ? -.09 : 0);
    const baseScale = narrow ? Math.min(.35, view.width * .73 / modelSizes[index]) : Math.min(1, view.width * .34 / modelSizes[index], view.height * .65 / modelSizes[index]);
    group.current.scale.setScalar(baseScale * (m.modelScale ?? 1));
    materials.current.forEach(material => {
      material.opacity = m.visibility; material.depthWrite = m.visibility > .95;
      if (material instanceof THREE.ShaderMaterial && material.uniforms.uOpacity) material.uniforms.uOpacity.value = m.visibility;
    });
  });
  return <group ref={group} visible={index === 0}>
    <Center onCentered={({ container, width, height, depth }) => container.scale.setScalar(modelSizes[index] / Math.max(width, height, depth))}>
      <group ref={model}><Model {...(index === 0 ? { motion } : index === 1 ? { screenMode: "broken" as const } : {})} /></group>
    </Center>
  </group>;
}

function StudioClock() {
  const advance = useThree(state => state.advance);
  const gl = useThree(state => state.gl);
  // Lenis, the master choreography and the studio share GSAP's ticker. No second
  // requestAnimationFrame loop and no React updates per frame. Experience removes
  // the renderer entirely while the tab is hidden.
  useEffect(() => {
    // React development Strict Mode repeats effect setup/cleanup. Reinstall
    // after that rehearsal; onCreated handles the first environment capture.
    installStableEnvironmentSampling(gl);
    const tick = (time: number) => advance(time);
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); restoreEnvironmentSampling(gl); };
  }, [advance, gl]);
  return null;
}

function CameraRig({ motion }: { motion: RefObject<MotionState> }) {
  const { camera, invalidate, gl, scene } = useThree();
  const baseFov = useRef(camera instanceof THREE.PerspectiveCamera ? camera.fov : 40);
  useEffect(() => { const state = motion.current; Object.assign(state, { invalidate }); return () => { Object.assign(state, { invalidate: undefined }); }; }, [motion, invalidate]);
  // Prepare every sourced material, including hidden chapters, before its first
  // scroll appearance. Parallel shader compilation avoids mid-story stalls.
  useEffect(() => { let mounted = true; void gl.compileAsync(scene, camera).then(() => { if (mounted) invalidate(); }).catch(() => { /* The renderer can compile synchronously on older GPUs. */ }); return () => { mounted = false; }; }, [camera, gl, scene, invalidate]);
  useFrame(({ camera: liveCamera }) => {
    const m = motion.current;
    liveCamera.position.set(m.cameraX, m.cameraY, m.cameraZ);
    liveCamera.lookAt(0, 0, 0);
    if (liveCamera instanceof THREE.PerspectiveCamera) {
      const target = baseFov.current + Math.min(Math.abs(m.velocity) / 6000, 1) * .3;
      const next = THREE.MathUtils.lerp(liveCamera.fov, target, .08);
      if (Math.abs(next - liveCamera.fov) > .002) { liveCamera.fov = next; liveCamera.updateProjectionMatrix(); }
    }
  });
  return null;
}

function StudioKeyLight() {
  const light = useRef<THREE.DirectionalLight>(null);
  useFrame(({ clock }) => {
    // A slow physical key-light sweep keeps idle surfaces alive without
    // regenerating the expensive environment map or changing object poses.
    const phase = clock.elapsedTime * .16;
    light.current?.position.set(-3 + Math.sin(phase) * 2, 6, 7 + Math.cos(phase) * .6);
  });
  return <directionalLight ref={light} position={[-3, 6, 7]} intensity={2.2} color="#FFFFFF" />;
}

function World({ motion, mobile }: { motion: RefObject<MotionState>; mobile: boolean }) {
  return <>
    {/* The sourced product template uses studio softboxes. A baked reflection
        map and one slow key-light sweep reveal the artist's material detail. */}
    <Environment files="/environments/studio.hdr" resolution={mobile ? 128 : 256} frames={1} environmentIntensity={.7}>
      <Lightformer form="rect" intensity={4} position={[-3, 5, 4]} scale={[4, 2, 1]} rotation={[-Math.PI / 4, -.4, 0]} color="#FFFFFF" />
      <Lightformer form="rect" intensity={3.5} position={[5, 2, -3]} scale={[2, 4, 1]} rotation={[0, -Math.PI / 2, 0]} color="#E1E3E5" />
      <Lightformer form="rect" intensity={1.4} position={[-4, 0, -2]} scale={[2, 5, 1]} rotation={[0, Math.PI / 2, 0]} color="#EEEEEE" />
    </Environment>
    <ambientLight intensity={.22} />
    <StudioKeyLight />
    <directionalLight position={[5, 2, -3]} intensity={1.4} color="#E1E3E5" />
    {!mobile && <ContactShadows position={[2.6, -1.5, 0]} scale={8} opacity={.3} blur={3} far={4} resolution={256} frames={1} color="#000000" />}
    <CameraRig motion={motion} />
    {models.map((_, index) => <ModelSlot key={index} index={index} motion={motion} mobile={mobile} />)}
    <LaptopAssembly motion={motion} mobile={mobile} />
  </>;
}

class StudioBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <StudioFallback message="The studio is taking a moment. The story continues below." /> : this.props.children; }
}

function StudioFallback({ message }: { message: string }) {
  return <div className="pointer-events-none absolute right-6 bottom-8 max-w-64 text-right md:right-12 lg:right-24"><p className="text-sm leading-relaxed text-muted">{message}</p></div>;
}

function StudioLoading() {
  const { active, errors } = useProgress();
  if (!active && !errors.length) return null;
  return <StudioFallback message={errors.length ? "The visual couldn't load. Every idea and action is still here." : "Preparing the studio"} />;
}

export default function Scene({ motion, mobile }: { motion: RefObject<MotionState>; mobile: boolean; active?: boolean }) {
  return <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
    <StudioBoundary>
      <Canvas dpr={[1, mobile ? 1.25 : 1.5]} frameloop="never" gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} camera={{ fov: mobile ? 43 : 40, position: [0, .35, 8.8] }} onCreated={({ gl }) => { installStableEnvironmentSampling(gl); gl.setClearColor("#0A0A0B", 0); gl.outputColorSpace = THREE.SRGBColorSpace; gl.toneMapping = THREE.ACESFilmicToneMapping; }}>
        <StudioClock />
        <StudioBackdrop motion={motion} />
        <Suspense fallback={null}><World motion={motion} mobile={mobile} /></Suspense>
      </Canvas>
      <StudioLoading />
    </StudioBoundary>
  </div>;
}

