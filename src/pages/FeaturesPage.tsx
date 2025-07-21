import { Suspense, useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, useScroll, Html, ScrollControls, Scroll } from '@react-three/drei';
import type { ScrollControlsState } from '@react-three/drei';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import logoDark from '../../public/logo-dark.png';

// --- TYPE DEFINITIONS ---
type Feature = {
  title: string;
  description: string;
  position: [number, number, number];
  side: 'left' | 'right';
  color: string;
};

// --- CONSTANTS ---
const features: Feature[] = [
  {
    title: "Real-time Debates",
    description: "Engage in live debates with participants from around the world.",
    position: [-5, 2, 0],
    side: 'left',
    color: '#ff6b6b'
  },
  {
    title: "AI-Powered Moderation",
    description: "Smart moderation ensures fair and productive discussions.",
    position: [5, -2, 0],
    side: 'right',
    color: '#4ecdc4'
  },
  {
    title: "Topic Suggestions",
    description: "Get intelligent topic recommendations based on current events.",
    position: [-5, -6, 0],
    side: 'left',
    color: '#45b7d1'
  },
  {
    title: "Skill Analytics",
    description: "Track your debating skills and improvement over time.",
    position: [5, -10, 0],
    side: 'right',
    color: '#96ceb4'
  },
  {
    title: "Community Voting",
    description: "Let the community vote on the most compelling arguments.",
    position: [-5, -14, 0],
    side: 'left',
    color: '#ffeead'
  },
  {
    title: "Expert Insights",
    description: "Learn from debate experts and improve your techniques.",
    position: [5, -18, 0],
    side: 'right',
    color: '#ffcc5c'
  }
];

// --- HELPER FUNCTION ---
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '182, 170, 255';
}

// --- COMPONENTS ---

interface FeatureCardProps {
  feature: Feature;
  index: number;
  isActive: boolean;
}

function FeatureCard({ feature, index, isActive }: FeatureCardProps) {
  const { position, title, description, color, side } = feature;
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const glowMeshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Animated values for syncing HTML overlay
  const animatedScale = useRef(isActive ? 1.3 : 0.7);
  const animatedOpacity = useRef(isActive ? 0.9 : 0.15);

  // Create particle system for active cards
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(50 * 3);
  for (let i = 0; i < 50; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 8;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 4;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 2;
  }
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  // Enhanced animation targets with faster response
  const targetScale = isActive ? 1.3 : 0.7;
  const targetOpacity = isActive ? 0.9 : 0.15;
  const targetEmissive = isActive ? 1.2 : 0;
  const targetLightIntensity = isActive ? 4 : 0;
  const targetGlowScale = isActive ? 1.8 : 1;
  const targetParticleOpacity = isActive ? 0.8 : 0;

  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current || !lightRef.current) return;
    
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    const glowMaterial = glowMeshRef.current?.material as THREE.MeshBasicMaterial;
    const particleMaterial = particlesRef.current?.material as THREE.PointsMaterial;

    // Much faster interpolation for immediate response
    const lerpSpeed = 12;
    
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * lerpSpeed);
    material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, delta * lerpSpeed);
    material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, targetEmissive, delta * lerpSpeed);
    lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, targetLightIntensity, delta * lerpSpeed);

    // Sync animated values for HTML overlay
    animatedScale.current = THREE.MathUtils.lerp(animatedScale.current, targetScale, delta * lerpSpeed);
    animatedOpacity.current = THREE.MathUtils.lerp(animatedOpacity.current, targetOpacity, delta * lerpSpeed);

    // Glow effect
    if (glowMeshRef.current && glowMaterial) {
      glowMeshRef.current.scale.lerp(new THREE.Vector3(targetGlowScale, targetGlowScale, targetGlowScale), delta * lerpSpeed);
      glowMaterial.opacity = THREE.MathUtils.lerp(glowMaterial.opacity, isActive ? 0.3 : 0, delta * lerpSpeed);
    }

    // Particle effects
    if (particlesRef.current && particleMaterial) {
      particleMaterial.opacity = THREE.MathUtils.lerp(particleMaterial.opacity, targetParticleOpacity, delta * lerpSpeed);
      if (isActive) {
        particlesRef.current.rotation.z += delta * 0.5;
        const positions = particleGeometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += Math.sin(state.clock.elapsedTime * 2 + i) * 0.01;
        }
        particleGeometry.attributes.position.needsUpdate = true;
      }
    }

    // Enhanced floating animation
    const floatAmplitude = isActive ? 0.2 : 0.05;
    const floatSpeed = isActive ? 3 : 1;
    const targetY = position[1] + Math.sin(state.clock.elapsedTime * floatSpeed + index) * floatAmplitude;
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, delta * 6);
    
    // Smoother horizontal movement
    const targetX = position[0] + (isActive ? 0 : (side === 'left' ? -1.5 : 1.5));
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, delta * lerpSpeed);

    // Add rotation for active cards
    if (isActive) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    } else {
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, delta * 8);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main card mesh with enhanced materials */}
      <mesh ref={meshRef}>
        <boxGeometry args={[4.5, 2.5, 0.3]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.15}
          emissive={color}
          emissiveIntensity={0}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>
      
      {/* Glow effect mesh */}
      <mesh ref={glowMeshRef}>
        <boxGeometry args={[5, 3, 0.4]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Particle system */}
      <points ref={particlesRef} geometry={particleGeometry}>
        <pointsMaterial
          color={color}
          size={0.03}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* Enhanced lighting */}
      <pointLight ref={lightRef} color={color} intensity={0} distance={12} decay={1.8} />
      <spotLight
        color={color}
        intensity={isActive ? 2 : 0}
        distance={15}
        angle={Math.PI / 6}
        penumbra={0.8}
        position={[0, 0, 3]}
      />
      
      <Html
        center
        distanceFactor={10}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          // Remove scale and opacity from here
          filter: isActive ? 'blur(0px)' : 'blur(0.5px)',
        }}
      >
        <div
          style={{
            opacity: isActive ? 1 : animatedOpacity.current, // Fully opaque for active card
            transition: 'opacity 0.2s linear',
            background: 'rgba(20, 20, 30, 0.92)', // Always dark background
            backdropFilter: 'blur(20px)',
            border: `2px solid ${isActive ? color : 'rgba(255, 255, 255, 0.08)'}`,
            borderRadius: '20px',
            padding: '2.5rem',
            width: '350px',
            textAlign: side === 'left' ? 'left' : 'right',
            boxShadow: isActive 
              ? `0 12px 40px rgba(${hexToRgb(color)}, 0.4), 0 0 60px rgba(${hexToRgb(color)}, 0.15)` 
              : '0 6px 25px rgba(0, 0, 0, 0.6)',
            position: 'relative',
            overflow: 'hidden',
            transform: `translateZ(${isActive ? 10 : 0}px)`
          }}
        >
          {/* Enhanced background effects */}
          {isActive && (
            <>
              <div style={{
                position: 'absolute', 
                top: '-50%', 
                left: side === 'left' ? '-20%' : '120%',
                width: '200%',
                height: '200%',
                background: `radial-gradient(circle, rgba(${hexToRgb(color)}, 0.2), transparent 60%)`,
                animation: 'pulse 3s ease-in-out infinite alternate',
                borderRadius: '50%',
              }} />
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                height: '2px',
                background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                animation: 'shimmer 2s linear infinite',
              }} />
            </>
          )}
          
          <h3 style={{
            margin: '0 0 1.2rem 0', 
            fontSize: '1.6rem', 
            fontWeight: '700',
            color: isActive ? '#fff' : '#cccccc',
            zIndex: 1, 
            position: 'relative',
            textShadow: isActive ? `0 0 20px rgba(${hexToRgb(color)}, 0.5)` : 'none',
            letterSpacing: '0.5px',
          }}>
            {title}
          </h3>
          
          <p style={{
            margin: 0, 
            fontSize: '1.1rem', 
            color: isActive ? '#f5f5f5' : '#888888',
            lineHeight: '1.6', 
            zIndex: 1, 
            position: 'relative',
            fontWeight: '400',
          }}>
            {description}
          </p>
        </div>
      </Html>
    </group>
  );
}

// Enhanced card with multiple layers for depth
function CardMeshes({ meshRef, glowMeshRef, color }: { 
  meshRef: React.RefObject<THREE.Mesh>, 
  glowMeshRef: React.RefObject<THREE.Mesh>, 
  color: string 
}) {
  return (
    <>
      {/* Main card mesh with enhanced materials */}
      <mesh ref={meshRef}>
        <boxGeometry args={[4.5, 2.5, 0.3]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.15}
          emissive={color}
          emissiveIntensity={0}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>
      
      {/* Border frame for card outline */}
      <mesh>
        <boxGeometry args={[4.6, 2.6, 0.1]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.3}
          emissive={color}
          emissiveIntensity={0.2}
          metalness={0.8}
          roughness={0.1}
        />
      </mesh>
      
      {/* Glow effect mesh */}
      <mesh ref={glowMeshRef}>
        <boxGeometry args={[5, 3, 0.4]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          side={THREE.BackSide}
        />
      </mesh>
    </>
  );
}

function Scene({ activeIndex }: { activeIndex: number }) {
  const logoTexture = useLoader(THREE.TextureLoader, logoDark);
  const contentGroupRef = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const totalFeatures = features.length;

  useFrame((state, delta) => {
    if (!contentGroupRef.current || !sphereRef.current) return;

    // Smooth content group movement
    const targetGroupY = -features[activeIndex].position[1];
    contentGroupRef.current.position.y = THREE.MathUtils.lerp(
      contentGroupRef.current.position.y,
      targetGroupY,
      delta * 6 // Increased speed
    );

    // Enhanced central sphere animation
    const activeFeature = features[activeIndex];
    const targetSphereY = activeFeature.position[1];
    const targetSphereX = activeFeature.position[0] * 0.1; // Subtle horizontal movement

    sphereRef.current.position.y = THREE.MathUtils.lerp(
      sphereRef.current.position.y,
      targetSphereY,
      delta * 6
    );

    sphereRef.current.position.x = THREE.MathUtils.lerp(
      sphereRef.current.position.x,
      targetSphereX,
      delta * 4
    );

    // Enhanced sphere rotation and pulsing
    sphereRef.current.rotation.y += delta * 0.3;
    sphereRef.current.rotation.x += delta * 0.15;

    const pulseScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    sphereRef.current.scale.setScalar(pulseScale);

    // Animate ring
    if (ringRef.current) {
      ringRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      ringRef.current.rotation.z = state.clock.elapsedTime * -0.3;
    }

    // Enhanced camera movement
    const mouseInfluence = 0.5;
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.mouse.x * mouseInfluence, 0.03);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, -state.mouse.y * mouseInfluence, 0.03);
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={contentGroupRef}>
      {/* Enhanced central sphere with more visual impact */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[1.4, 128, 128]} />
        <meshStandardMaterial
          map={logoTexture}
          emissive="#b6aaff"
          emissiveIntensity={1.5}
          metalness={0.9}
          roughness={0.1}
          toneMapped={false}
        />
      </mesh>

      {/* Rotating ring around sphere */}
      <mesh ref={ringRef}>
        <torusGeometry args={[2.2, 0.1, 16, 100]} />
        <meshStandardMaterial
          color="#b6aaff"
          emissive="#b6aaff"
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Central lighting */}
      <pointLight color="#b6aaff" intensity={4} distance={12} decay={1.5} />
      <spotLight
        color="#b6aaff"
        intensity={3}
        distance={20}
        angle={Math.PI / 4}
        penumbra={0.5}
        position={[0, 0, 8]}
      />
      
      {features.map((feature, index) => (
        <FeatureCard
          key={feature.title}
          feature={feature}
          index={index}
          isActive={index === activeIndex}
        />
      ))}
      
      {/* Enhanced lighting setup */}
      <ambientLight intensity={0.15} color="#1a1a3e" />
      <directionalLight position={[15, 15, 5]} intensity={0.4} color="#b6aaff" />
      <pointLight position={[-10, 5, -5]} intensity={0.8} color="#ff6b6b" />
      <pointLight position={[10, -5, -5]} intensity={0.8} color="#4ecdc4" />
      
      <Environment preset="night" />
      <fog attach="fog" args={['#000000', 20, 45]} />
    </group>
  );
}

const FeaturesPage = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const totalFeatures = features.length;
  const debounceRef = useRef(false);

  // Debounced navigation
  const goToIndex = useCallback((newIndex: number) => {
    setActiveIndex((prev) => {
      let idx = newIndex;
      if (idx < 0) idx = 0;
      if (idx > totalFeatures - 1) idx = totalFeatures - 1;
      return idx;
    });
    debounceRef.current = true;
    setTimeout(() => { debounceRef.current = false; }, 350); // debounce duration
  }, [totalFeatures]);

  // Mouse wheel navigation
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (debounceRef.current) return;
      if (e.deltaY > 0) goToIndex(activeIndex + 1);
      else if (e.deltaY < 0) goToIndex(activeIndex - 1);
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [activeIndex, goToIndex]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (debounceRef.current) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goToIndex(activeIndex + 1);
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') goToIndex(activeIndex - 1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, goToIndex]);

  // On-screen button navigation
  const handlePrev = () => {
    if (!debounceRef.current) goToIndex(activeIndex - 1);
  };
  const handleNext = () => {
    if (!debounceRef.current) goToIndex(activeIndex + 1);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#000000']} />
        <Suspense fallback={null}>
          <Scene activeIndex={activeIndex} />
        </Suspense>
      </Canvas>
      {/* On-screen navigation buttons */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pointerEvents: 'none',
        zIndex: 10,
        width: '100vw',
        transform: 'translateY(-50%)',
      }}>
        <button
          onClick={handlePrev}
          style={{
            pointerEvents: 'auto',
            background: 'rgba(30,30,40,0.7)',
            border: 'none',
            color: '#fff',
            fontSize: '2.2rem',
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            marginLeft: '2vw',
            cursor: activeIndex === 0 ? 'not-allowed' : 'pointer',
            opacity: activeIndex === 0 ? 0.3 : 1,
            transition: 'opacity 0.2s',
            boxShadow: '0 2px 12px rgba(0,0,0,0.25)'
          }}
          disabled={activeIndex === 0}
          aria-label="Previous Feature"
        >
          &#8592;
        </button>
        <button
          onClick={handleNext}
          style={{
            pointerEvents: 'auto',
            background: 'rgba(30,30,40,0.7)',
            border: 'none',
            color: '#fff',
            fontSize: '2.2rem',
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            marginRight: '2vw',
            cursor: activeIndex === totalFeatures - 1 ? 'not-allowed' : 'pointer',
            opacity: activeIndex === totalFeatures - 1 ? 0.3 : 1,
            transition: 'opacity 0.2s',
            boxShadow: '0 2px 12px rgba(0,0,0,0.25)'
          }}
          disabled={activeIndex === totalFeatures - 1}
          aria-label="Next Feature"
        >
          &#8594;
        </button>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scroll-indicator { 
          0%, 100% { transform: translateY(0); opacity: 1; } 
          50% { transform: translateY(15px); opacity: 0.3; } 
        }
        @keyframes pulse { 
          0%, 100% { opacity: 0.6; transform: scale(1); } 
          50% { opacity: 1; transform: scale(1.05); } 
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { 
          margin: 0; 
          padding: 0; 
          overflow: hidden; 
          font-family: 'Inter', sans-serif; 
          background: #000000; 
        }
        * { 
          box-sizing: border-box; 
        }
        ::-webkit-scrollbar { 
          width: 0px; 
          background: transparent; 
        }
      `}} />
    </div>
  );
};

export default FeaturesPage;