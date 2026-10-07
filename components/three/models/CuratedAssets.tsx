"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { MotionState } from "../Scene";
import { makeScreenArtwork, type ScreenMode } from "../screenArtwork";

export const LAPTOP_URL = "/models/editorial-laptop.glb";
export const OPEN_LID = 103 * Math.PI / 180;

// Artist geometry and PBR maps are preserved. Instances own their materials,
// while the glTF cache owns the reusable geometry and texture resources.
export function cloneStudioAsset(source: THREE.Group) {
  const model = source.clone(true);
  const materials = new Map<THREE.Material, THREE.Material>();
  model.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    const clone = (original: THREE.Material) => {
      if (!materials.has(original)) {
        const material = original.clone();
        if (material instanceof THREE.MeshStandardMaterial) {
          material.envMapIntensity = 1.2;
          // Preserve the artist's albedo detail, normal and ARM maps while
          // translating their palette into the monochrome product studio.
          if (material.map) {
            material.onBeforeCompile = shader => {
              shader.fragmentShader = shader.fragmentShader.replace("#include <map_fragment>", `#include <map_fragment>
                float studioLuminance = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
                diffuseColor.rgb = vec3(studioLuminance);`);
            };
            material.customProgramCacheKey = () => "sv-metallic-albedo-v1";
          }
          if (material.name === "aluminium") { material.roughness = .38; material.metalness = .85; }
          for (const texture of [material.map, material.normalMap, material.roughnessMap]) {
            if (texture) texture.anisotropy = 4;
          }
          if (material instanceof THREE.MeshPhysicalMaterial) material.specularIntensity = 1;
        }
        materials.set(original, material);
      }
      return materials.get(original)!;
    };
    object.material = Array.isArray(object.material) ? object.material.map(clone) : clone(object.material);
  });
  return { model, materials: [...materials.values()] };
}

// Screen placement and hinge measurements are from the MIT React Widgets
// template; the actual model is Nicholas-3D's CC BY 4.0 asset. See /credits.
export function prepareLaptop(source: THREE.Group, screenMode: ScreenMode = "preview") {
  const asset = cloneStudioAsset(source);
  const lid = asset.model.getObjectByName("LidPivot")!;
  lid.rotation.x = OPEN_LID;
  const artwork = makeScreenArtwork(screenMode);
  const texture = artwork.texture;
  const screenGeometry = new THREE.PlaneGeometry(.38988, .26361);
  const screenMaterial = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
  const screen = new THREE.Mesh(screenGeometry, screenMaterial);
  screen.name = "SleekViber display";
  screen.position.set(0, .0002, -.14376); screen.rotation.set(Math.PI / 2, 0, Math.PI);
  lid.add(screen);
  return { ...asset, lid, dispose: () => { asset.materials.forEach(m => m.dispose()); artwork.dispose(); screenGeometry.dispose(); screenMaterial.dispose(); } };
}

type Props = ThreeElements["group"] & { mobile?: boolean; motion?: RefObject<MotionState>; screenMode?: ScreenMode };
export function EditorialLaptop({ motion, screenMode = "preview", ...props }: Props) {
  const { scene } = useGLTF(LAPTOP_URL, "/draco/");
  const asset = useMemo(() => prepareLaptop(scene, screenMode), [scene, screenMode]);
  const lid = useRef<THREE.Object3D | null>(null);
  useEffect(() => { lid.current = asset.lid; return () => { lid.current = null; asset.dispose(); }; }, [asset]);
  useFrame(() => { if (lid.current) lid.current.rotation.x = motion?.current.hinge ?? OPEN_LID; });
  return <group {...props} dispose={null}><primitive object={asset.model} /></group>;
}

export function CircuitBoard(props: Props) {
  const { scene } = useGLTF("/models/circuit-board.glb", "/draco/");
  const asset = useMemo(() => cloneStudioAsset(scene), [scene]);
  useEffect(() => () => asset.materials.forEach(m => m.dispose()), [asset]);
  return <group {...props} dispose={null}><primitive object={asset.model} /></group>;
}

export function EditorialPhone(props: Props) {
  const { scene } = useGLTF("/models/editorial-phone.glb", "/draco/");
  const asset = useMemo(() => {
    const result = cloneStudioAsset(scene);
    result.materials.forEach(m => {
      if (m instanceof THREE.MeshStandardMaterial && /chassis/.test(m.name)) { m.color.set("#92979B"); m.metalness = .75; }
    });
    const artwork = makeScreenArtwork("phone");
    const texture = artwork.texture;
    const geometry = new THREE.PlaneGeometry(.32231, .69755);
    const material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
    material.onBeforeCompile = shader => {
      shader.fragmentShader = shader.fragmentShader.replace("#include <map_fragment>", `#include <map_fragment>
        vec2 panelSize = vec2(.32231, .69755);
        vec2 q = abs((vMapUv - .5) * panelSize) - (panelSize * .5 - vec2(.04246));
        if (length(max(q, 0.)) + min(max(q.x, q.y), 0.) > .04246) discard;`);
    };
    material.customProgramCacheKey = () => "sv-phone-display-v1";
    const screen = new THREE.Mesh(geometry, material);
    screen.position.set(-.00075, .00011, .03092); result.model.add(screen);
    return { ...result, texture, geometry, material, artwork };
  }, [scene]);
  useEffect(() => () => { asset.materials.forEach(m => m.dispose()); asset.material.dispose(); asset.artwork.dispose(); asset.geometry.dispose(); }, [asset]);
  return <group {...props} dispose={null}><primitive object={asset.model} /></group>;
}

useGLTF.preload(LAPTOP_URL, "/draco/");
useGLTF.preload("/models/circuit-board.glb", "/draco/");
useGLTF.preload("/models/editorial-phone.glb", "/draco/");



