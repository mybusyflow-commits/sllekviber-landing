"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, RoundedBox, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { makeScreenArtwork } from "./screenArtwork";
import { installStableEnvironmentSampling, restoreEnvironmentSampling } from "./stableEnvironmentSampling";

type Props = { inside: boolean; moving: boolean; reduced: boolean; pointer: RefObject<[number, number]>; onReady: () => void; onError: () => void };

// Local asset and hinge arrangement from Poimandres' MIT floating-laptop template.
// The loader cache owns geometry; this instance owns materials and screen textures.
function Laptop({ inside, moving, reduced, pointer, onReady }: Props) {
  const { scene } = useGLTF("/models/studio-laptop.glb", "/draco/");
  const root = useRef<THREE.Group>(null);
  const front = useRef<THREE.Group>(null);
  const back = useRef<THREE.Group>(null);
  const { invalidate, viewport } = useThree();
  const motion = useRef(0);
  const asset = useMemo(() => {
    const model = scene.clone(true);
    const artwork = makeScreenArtwork("preview");
    artwork.texture.flipY = false;
    const materials: THREE.Material[] = [];
    model.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      const copy = (original: THREE.Material) => {
        const material = original.name === "screen.001" ? new THREE.MeshBasicMaterial({ map: artwork.texture, toneMapped: false }) : original.clone();
        if (material instanceof THREE.MeshStandardMaterial && original.name === "aluminium") { material.color.set("#b6b3ae"); material.roughness = .3; }
        materials.push(material); return material;
      };
      object.material = Array.isArray(object.material) ? object.material.map(copy) : copy(object.material);
    });
    model.getObjectByName("screenflip")!.rotation.x = -.425;
    model.position.sub(new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3()));
    return { model, materials, artwork };
  }, [scene]);
  const panels = useMemo(() => [systemTexture("flow"), systemTexture("access")], []);
  useEffect(() => { onReady(); invalidate(); return () => { asset.materials.forEach(material => material.dispose()); asset.artwork.dispose(); panels.forEach(panel => panel.dispose()); }; }, [asset, panels, onReady, invalidate]);
  useEffect(() => { invalidate(); }, [inside, moving, reduced, invalidate]);
  const assemblyScale = Math.min(1, viewport.width / 10.5);
  useFrame((state, dt) => {
    if (!root.current || !front.current || !back.current) return;
    const target = inside ? 1 : 0;
    motion.current = reduced ? target : THREE.MathUtils.damp(motion.current, target, 6, Math.min(dt, .05));
    const t = motion.current;
    const px = moving ? pointer.current[0] : 0;
    const py = moving ? pointer.current[1] : 0;
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, -.24 + t * .3 + px * .07, 5, dt);
    root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, .12 + py * .025, 5, dt);
    root.current.rotation.z = -.045;
    root.current.position.set(t * .45, .15 - t * .12, -t * .55);
    front.current.position.set(-2.15 * t, 1.6 * t, .5 + 1.5 * t);
    back.current.position.set(2.05 * t, -1.15 * t, .45 + 2 * t);
    front.current.scale.setScalar(t); back.current.scale.setScalar(t);
    front.current.rotation.set(-.035, .12, -.035); back.current.rotation.set(.035, -.12, .035);
    if (Math.abs(t - target) > .001 || Math.abs(root.current.rotation.y - (-.24 + t * .3 + px * .07)) > .001) state.invalidate();
  });
  return <Float enabled={moving} speed={1.25} rotationIntensity={.08} floatIntensity={.18} floatingRange={[-.06, .06]} autoInvalidate>
    <group ref={root} scale={assemblyScale}><group scale={.76}><primitive object={asset.model} dispose={null} /></group>
      <group ref={front} scale={0}><SystemPanel texture={panels[0]} /></group>
      <group ref={back} scale={0}><SystemPanel texture={panels[1]} /></group>
    </group>
  </Float>;
}

function SystemPanel({ texture }: { texture: THREE.CanvasTexture }) {
  return <><RoundedBox args={[3.15, 1.6, .065]} radius={.08} smoothness={3}><meshStandardMaterial color="#34312d" roughness={.5} metalness={.3} /></RoundedBox><mesh position={[0, 0, .037]}><planeGeometry args={[3.02, 1.47]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh></>;
}

function systemTexture(kind: "flow" | "access") {
  const canvas = document.createElement("canvas"); canvas.width = 1000; canvas.height = 488;
  const ctx = canvas.getContext("2d")!;
  const font = getComputedStyle(document.body).fontFamily;
  ctx.fillStyle = "#232323"; ctx.fillRect(0, 0, 1000, 488);
  ctx.fillStyle = "#f0eee9"; ctx.font = `500 64px ${font}`; ctx.fillText(kind === "flow" ? "Route → Validate → Save" : "Every role, considered.", 45, 130);
  ctx.strokeStyle = "#68635c"; ctx.beginPath(); ctx.moveTo(45, 193); ctx.lineTo(955, 193); ctx.stroke();
  ctx.font = `400 34px ${font}`;
  const rows = kind === "flow" ? [["/contact", "POST → record"], ["/account", "session → permissions"]] : [["Public", "Open pages"], ["Member", "Protected areas"]];
  rows.forEach(([label, value], i) => { ctx.fillStyle = "#f0eee9"; ctx.fillText(label, 45, 284 + i * 97); ctx.fillStyle = "#ef715b"; ctx.fillText(value, 435, 284 + i * 97); });
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}

export default function HeroStudio(props: Props) {
  return <Canvas className="studio-canvas" frameloop="demand" dpr={[1, 1.4]} camera={{ position: [0, .1, 12], fov: 32 }} gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
    fallback={null} onCreated={({ gl }) => { installStableEnvironmentSampling(gl); }}>
    <ambientLight intensity={.55} /><directionalLight position={[-3, 5, 7]} intensity={3.2} color="#f0eee9" /><directionalLight position={[5, 1, -1]} intensity={4} color="#e75036" />
    <Suspense fallback={null}><Environment files="/environments/studio.hdr" environmentIntensity={.8} /><Laptop {...props} /></Suspense>
    <RendererCleanup onError={props.onError} />
  </Canvas>;
}
function RendererCleanup({ onError }: { onError: () => void }) {
  const gl = useThree(state => state.gl);
  useEffect(() => {
    gl.domElement.addEventListener("webglcontextlost", onError, { once: true });
    return () => { gl.domElement.removeEventListener("webglcontextlost", onError); restoreEnvironmentSampling(gl); };
  }, [gl, onError]);
  return null;
}
