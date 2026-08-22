'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Box3, PerspectiveCamera, SpotLight, Vector3, type Group, type Mesh } from 'three';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
import { resolveCharacterStillSrc } from '@dark-fantasy/content/portraits';

const readyModels = new Set<string>();

function CharacterModel({ src, rotate }: { src: string; rotate: boolean }) {
  const { scene } = useGLTF(src);
  const cloned = useMemo(() => cloneSkeleton(scene), [scene]);
  const ref = useRef<Group>(null);
  const timeRef = useRef(0);

  useLayoutEffect(() => {
    cloned.traverse((node) => {
      const mesh = node as Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [cloned]);

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

function SpotlightRig({ aim }: { aim: [number, number, number] }) {
  const keyRef = useRef<SpotLight>(null);
  const bounceRef = useRef<SpotLight>(null);
  const scene = useThree((state) => state.scene);

  useLayoutEffect(() => {
    const key = keyRef.current;
    const bounce = bounceRef.current;
    if (key) {
      key.target.position.set(aim[0], aim[1], aim[2]);
      scene.add(key.target);
      key.target.updateMatrixWorld();
    }
    if (bounce) {
      bounce.target.position.set(aim[0], aim[1] - 0.22, aim[2]);
      scene.add(bounce.target);
      bounce.target.updateMatrixWorld();
    }
  }, [aim, scene]);

  return (
    <>
      <spotLight
        ref={keyRef}
        position={[aim[0] + 0.28, aim[1] + 2.15, aim[2] + 1.55]}
        angle={0.38}
        penumbra={0.42}
        intensity={48}
        color="#f4f6fa"
        distance={9}
        decay={2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.00018}
        shadow-normalBias={0.035}
        shadow-radius={3.5}
        shadow-focus={0.85}
        shadow-camera-near={0.4}
        shadow-camera-far={8}
      />
      <spotLight
        ref={bounceRef}
        position={[aim[0] - 1.15, aim[1] + 0.35, aim[2] + 0.85]}
        angle={0.72}
        penumbra={0.95}
        intensity={4.2}
        color="#d8dee8"
        distance={6}
        decay={2}
      />
      <hemisphereLight args={['#8b97a8', '#121018', 0.22]} />
    </>
  );
}

function FittedScene({
  src,
  controls,
  onReady,
}: {
  src: string;
  controls: boolean;
  onReady: () => void;
}) {
  const groupRef = useRef<Group>(null);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const [target, setTarget] = useState<[number, number, number]>([0, 0.49, 0]);
  const [floorY, setFloorY] = useState(0);
  const [aim, setAim] = useState<[number, number, number]>([0, 0.62, 0]);

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
    setAim([center.x, center.y + boxSize.y * 0.12, center.z]);
    setFloorY(box.min.y);
    onReady();
  }, [camera, controls, onReady, size.height, size.width, src]);

  return (
    <>
      <SpotlightRig aim={aim} />
      <group ref={groupRef}>
        <CharacterModel src={src} rotate={!controls} />
      </group>
      <ContactShadows
        position={[target[0], floorY + 0.01, target[2]]}
        opacity={0.48}
        scale={2.8}
        blur={2.2}
        far={1.4}
        color="#05040a"
      />
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
}: {
  src: string;
  controls?: boolean;
  accent?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const stillSrc = resolveCharacterStillSrc(src);
  const [showStill, setShowStill] = useState(
    () => Boolean(stillSrc) && !readyModels.has(src),
  );

  useEffect(() => {
    setShowStill(Boolean(stillSrc) && !readyModels.has(src));
  }, [src, stillSrc]);

  const handleReady = useMemo(
    () => () => {
      readyModels.add(src);
      setShowStill(false);
    },
    [src],
  );

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
    <div ref={wrapRef} className="relative h-full w-full bg-transparent">
      {stillSrc && showStill ? (
        <img
          src={stillSrc}
          alt=""
          className="pointer-events-none absolute inset-0 z-[2] h-full w-full object-contain"
        />
      ) : null}
      <Canvas
        className={`${controls ? '' : 'pointer-events-none '}${stillSrc && showStill ? 'invisible ' : ''}h-full w-full`}
        camera={{ fov: 26, near: 0.1, far: 40 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          toneMappingExposure: 0.82,
        }}
        dpr={[1, 1.5]}
        shadows="soft"
        frameloop={visible ? 'always' : 'never'}
      >
        <Suspense fallback={null}>
          <FittedScene src={src} controls={controls} onReady={handleReady} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload('/characters/player.glb');
useGLTF.preload('/characters/player_woman.glb');
