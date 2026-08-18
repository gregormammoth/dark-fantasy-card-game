'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Box3, PerspectiveCamera, Sphere, Vector3, type Group } from 'three';

function CharacterModel({ src, rotate }: { src: string; rotate: boolean }) {
  const { scene } = useGLTF(src);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const ref = useRef<Group>(null);

  useFrame((_, delta) => {
    if (rotate && ref.current) {
      ref.current.rotation.y += delta * 0.22;
    }
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
    const sphere = box.getBoundingSphere(new Sphere());
    if (sphere.radius <= 0) {
      return;
    }
    const vFov = (perspective.fov * Math.PI) / 180;
    const aspect = Math.max(perspective.aspect || size.width / Math.max(size.height, 1), 0.0001);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    const distance =
      Math.max(sphere.radius / Math.sin(vFov / 2), sphere.radius / Math.sin(hFov / 2)) * 1.18;
    perspective.position.set(center.x, center.y, center.z + distance);
    perspective.lookAt(center);
    perspective.near = Math.max(0.05, distance / 80);
    perspective.far = Math.max(40, distance * 40);
    perspective.updateProjectionMatrix();
    setTarget([center.x, center.y, center.z]);
  }, [camera, size.height, size.width, src]);

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
        />
      ) : null}
    </>
  );
}

export function CharacterModelCanvas({
  src,
  controls = false,
}: {
  src: string;
  controls?: boolean;
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
      { rootMargin: '80px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="h-full w-full">
      <Canvas
        className={`${controls ? '' : 'pointer-events-none '}h-full w-full`}
        camera={{ fov: 28, near: 0.1, far: 40 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        frameloop={visible ? 'always' : 'never'}
      >
        <ambientLight intensity={0.58} color="#f0e6d8" />
        <directionalLight position={[2.2, 3.2, 2.1]} intensity={1.35} color="#f3e2c8" />
        <directionalLight position={[-2.2, 1.1, 0.6]} intensity={0.38} color="#8a9bb8" />
        <directionalLight position={[0.15, 1.7, -2.1]} intensity={0.55} color="#c9a24a" />
        <Suspense fallback={null}>
          <FittedScene src={src} controls={controls} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload('/characters/player.glb');
