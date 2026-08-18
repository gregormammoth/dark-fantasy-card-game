'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Box3, PerspectiveCamera, Vector3, type Group } from 'three';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
import { classThemes } from '@/lib/cardTheme';

function CharacterModel({ src, rotate }: { src: string; rotate: boolean }) {
  const { scene } = useGLTF(src);
  const cloned = useMemo(() => cloneSkeleton(scene), [scene]);
  const ref = useRef<Group>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (!rotate || !ref.current) {
      return;
    }
    timeRef.current += delta;
    ref.current.rotation.y = Math.sin(timeRef.current * 0.65) * 0.32;
  });

  return (
    <group ref={ref}>
      <primitive object={cloned} />
    </group>
  );
}

function FittedScene({ src, controls }: { src: string; controls: boolean }) {
  const groupRef = useRef<Group>(null);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const [target, setTarget] = useState<[number, number, number]>([0, 0.49, 0]);

  useLayoutEffect(() => {
    const group = groupRef.current;
    const perspective = camera as PerspectiveCamera;
    if (!group) {
      return;
    }
    group.updateWorldMatrix(true, true);
    const box = new Box3().setFromObject(group);
    if (box.isEmpty()) {
      return;
    }
    const center = box.getCenter(new Vector3());
    const boxSize = box.getSize(new Vector3());
    const vFov = (perspective.fov * Math.PI) / 180;
    const aspect = Math.max(perspective.aspect || size.width / Math.max(size.height, 1), 0.0001);
    const distForHeight = boxSize.y / 2 / Math.tan(vFov / 2);
    const distForWidth = boxSize.x / 2 / (Math.tan(vFov / 2) * aspect);
    const padding = controls ? 1.02 : 1.08;
    const distance = Math.max(distForHeight, distForWidth) * padding;
    perspective.position.set(center.x, center.y, center.z + distance);
    perspective.lookAt(center);
    perspective.near = Math.max(0.05, distance / 80);
    perspective.far = Math.max(40, distance * 40);
    perspective.updateProjectionMatrix();
    setTarget([center.x, center.y, center.z]);
  }, [camera, controls, size.height, size.width, src]);

  return (
    <>
      <group ref={groupRef}>
        <CharacterModel src={src} rotate={!controls} />
      </group>
      {controls ? (
        <OrbitControls
          target={target}
          enablePan={false}
          enableDamping
          autoRotate
          autoRotateSpeed={0.7}
          minPolarAngle={Math.PI * 0.28}
          maxPolarAngle={Math.PI * 0.58}
          minDistance={0.6}
          maxDistance={3.2}
        />
      ) : null}
    </>
  );
}

export function CharacterModelCanvas({
  src,
  controls = false,
  accent = classThemes.seeker.accent,
}: {
  src: string;
  controls?: boolean;
  accent?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '200px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="h-full w-full bg-transparent">
      <Canvas
        className={`${controls ? '' : 'pointer-events-none '}h-full w-full`}
        camera={{ fov: 26, near: 0.1, far: 40 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        frameloop={visible ? 'always' : 'never'}
      >
        <hemisphereLight args={['#fff6ea', accent, 0.82]} />
        <ambientLight intensity={0.38} color="#fff8ee" />
        <directionalLight position={[2.2, 3.2, 2.4]} intensity={1.12} color="#fff4e4" />
        <directionalLight position={[-2.4, 1.2, 0.8]} intensity={0.34} color={accent} />
        <directionalLight position={[0.2, 2.1, -2.2]} intensity={0.48} color={accent} />
        <Suspense fallback={null}>
          <FittedScene src={src} controls={controls} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload('/characters/player.glb');
useGLTF.preload('/characters/enemy.glb');
useGLTF.preload('/characters/npc.glb');
