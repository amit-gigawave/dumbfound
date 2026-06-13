"use client";

import { FC, Suspense, useRef, useLayoutEffect, useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import {
    useGLTF,
    Stage,
    Float,
    OrbitControls,
    PerspectiveCamera,
    ContactShadows,
    Html,
    useProgress
} from '@react-three/drei';
import * as THREE from 'three';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface SculptureSceneProps {
    url: string;
    offsetX?: number;
    offsetY?: number;
    defaultZoom?: number;
}

const Loader = () => {
    const { progress } = useProgress();
    return (
        <Html center>
            <div className="flex flex-col items-center justify-center space-y-4 whitespace-nowrap">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-white/60" />
                <div className="text-[9px] uppercase tracking-[0.4em] font-display text-black/30">
                    Loading {Math.round(progress)}%
                </div>
            </div>
        </Html>
    );
};

const SingleModel: FC<{ url: string; offsetX: number; offsetY: number; scrollContainerRef: React.RefObject<HTMLDivElement | null> }> = ({ url, offsetX, offsetY, scrollContainerRef }) => {
    const { scene } = useGLTF(url);
    const { invalidate } = useThree();
    const groupRef = useRef<THREE.Group>(null);


    const clonedScene = useMemo(() => scene.clone(), [scene]);

    useLayoutEffect(() => {
        if (!clonedScene) return;


        const box = new THREE.Box3().setFromObject(clonedScene);
        const sphere = box.getBoundingSphere(new THREE.Sphere());
        const scale = 1 / (sphere.radius * 2 || 1);

        clonedScene.position.set(-sphere.center.x * scale, -sphere.center.y * scale, -sphere.center.z * scale);
        clonedScene.scale.setScalar(scale);

        invalidate();
    }, [clonedScene, invalidate]);

    useEffect(() => {
        if (!scrollContainerRef.current || !groupRef.current) return;
        
        const ctx = gsap.context(() => {
            gsap.fromTo(groupRef.current!.rotation,
                { y: 0 },
                {
                    y: Math.PI * 2,
                    ease: "none",
                    scrollTrigger: {
                        trigger: scrollContainerRef.current,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true,
                    },
                    onUpdate: () => invalidate()
                }
            );
        });

        return () => ctx.revert();
    }, [scrollContainerRef, invalidate]);

    return (
        <group ref={groupRef} position={[offsetX, offsetY, 0]}>
            <primitive
                object={clonedScene}
                castShadow
                receiveShadow
            />
        </group>
    );
};

const SculptureScene: FC<SculptureSceneProps> = ({
    url,
    offsetX = 0,
    offsetY = 0,
    defaultZoom = 1
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const camZ = 4.0 / (defaultZoom <= 0 ? 1 : defaultZoom);

    return (
        <div ref={containerRef} className="w-full cursor-target! h-full relative cursor-grab active:cursor-grabbing group/sculpture bg-transparent">

            <Canvas
                shadows
                frameloop="demand"
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: true, stencil: false, depth: true }}
                className="w-full h-full cursor-target!"
            >
                <PerspectiveCamera makeDefault position={[0, 0, camZ]} fov={35} />
                <ambientLight intensity={0.6} />

                <Suspense fallback={<Loader />}>
                    <Stage
                        intensity={0.25}
                        environment="city"
                        adjustCamera={false}
                    >
                        <Float
                            speed={1.6}
                            rotationIntensity={0.6}
                            floatIntensity={0.5}
                        >
                            <SingleModel url={url} offsetX={offsetX} offsetY={offsetY} scrollContainerRef={containerRef} />
                        </Float>
                    </Stage>

                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        autoRotate={false}
                        maxPolarAngle={Math.PI / 1.6}
                        minPolarAngle={Math.PI / 3}
                    />

                    <ContactShadows
                        position={[0, -0.6, 0]}
                        opacity={0.3}
                        scale={5}
                        blur={2}
                        far={2}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
};

export default SculptureScene;
