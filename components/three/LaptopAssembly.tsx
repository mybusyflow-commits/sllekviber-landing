"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { MotionState } from "./Scene";
import { LAPTOP_URL, prepareLaptop } from "./models/CuratedAssets";

/** Exploded product view uses the artist's base and lid, never generated shards. */
export function LaptopAssembly({ motion }: { motion: RefObject<MotionState>; mobile: boolean }) {
  const { scene } = useGLTF(LAPTOP_URL, "/draco/");
  const { viewport, camera, size } = useThree();
  const group = useRef<THREE.Group>(null);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const asset = useMemo(() => {
    const prepared = prepareLaptop(scene);
    prepared.model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(prepared.model);
    const center = box.getCenter(new THREE.Vector3());
    const dimensions = box.getSize(new THREE.Vector3());
    const factor = 4.7 / Math.max(dimensions.x, dimensions.y, dimensions.z);
    const pieces: { geometry: THREE.BufferGeometry; material: THREE.Material | THREE.Material[]; home: THREE.Vector3; lid: boolean }[] = [];
    prepared.model.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      const geometry = object.geometry.clone().applyMatrix4(object.matrixWorld);
      geometry.translate(-center.x, -center.y, -center.z); geometry.scale(factor, factor, factor);
      geometry.computeBoundingBox();
      const home = geometry.boundingBox!.getCenter(new THREE.Vector3());
      geometry.translate(-home.x, -home.y, -home.z);
      let parent: THREE.Object3D | null = object;
      let lid = false;
      while (parent) { if (parent.name === "LidPivot") lid = true; parent = parent.parent; }
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach(material => { material.transparent = true; });
      pieces.push({ geometry, material: object.material, home, lid });
    });
    return { pieces, dispose: () => { pieces.forEach(piece => piece.geometry.dispose()); prepared.dispose(); } };
  }, [scene]);
  useEffect(() => () => asset.dispose(), [asset]);
  useFrame(() => {
    const m = motion.current;
    if (!group.current) return;
    group.current.visible = m.asset === 4 && m.assembly < .999 && m.visibility > .005;
    if (!group.current.visible) return;
    const view = viewport.getCurrentViewport(camera);
    const narrow = size.width < 768;
    group.current.position.set(view.width * (m.modelX ?? 0), view.height * (m.modelY ?? .24), m.travel ?? 0);
    group.current.rotation.set(.06 + (m.tilt ?? 0), Math.PI + m.turn, 0);
    const baseScale = narrow ? Math.min(.35, view.width * .73 / 4.7) : Math.min(1, view.width * .34 / 4.7, view.height * .65 / 4.7);
    group.current.scale.setScalar(baseScale * (m.modelScale ?? 1));
    const spread = 1 - m.assembly;
    meshes.current.forEach((mesh, index) => {
      if (!mesh) return;
      const { home, lid } = asset.pieces[index];
      mesh.position.set(home.x, home.y + spread * (lid ? 1.35 : -.8), home.z + spread * (lid ? -.35 : .35));
      mesh.rotation.set(spread * (lid ? -.18 : .04), spread * .06, 0);
      (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(material => { material.opacity = m.visibility; material.depthWrite = m.visibility > .95; });
    });
  });
  return <group ref={group} visible={false}>{asset.pieces.map((piece, index) => <mesh key={index} ref={mesh => { meshes.current[index] = mesh; }} geometry={piece.geometry} material={piece.material} />)}</group>;
}
