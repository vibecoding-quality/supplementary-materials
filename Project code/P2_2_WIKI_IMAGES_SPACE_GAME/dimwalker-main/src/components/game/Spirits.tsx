import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SpiritProps {
  startPosition: [number, number, number];
  color: string;
  speed?: number;
}

const Spirit = ({ startPosition, color, speed = 1 }: SpiritProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const timeOffset = useMemo(() => Math.random() * 100, []);
  
  // Create trail particles
  const trailGeometry = useMemo(() => {
    const count = 20;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      sizes[i] = (1 - i / count) * 0.3;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geometry;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const t = state.clock.elapsedTime * speed + timeOffset;
    
    // Wandering movement pattern
    const x = startPosition[0] + Math.sin(t * 0.5) * 8 + Math.cos(t * 0.3) * 4;
    const y = startPosition[1] + Math.sin(t * 0.7) * 3 + 2;
    const z = startPosition[2] + Math.cos(t * 0.4) * 8 + Math.sin(t * 0.6) * 4;
    
    groupRef.current.position.set(x, y, z);
    
    // Rotate to face movement direction
    groupRef.current.rotation.y = Math.atan2(
      Math.cos(t * 0.5) * 0.5 - Math.sin(t * 0.3) * 0.3,
      -Math.sin(t * 0.4) * 0.4 + Math.cos(t * 0.6) * 0.6
    );
  });

  return (
    <group ref={groupRef}>
      {/* Core glow */}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.3}
        />
      </mesh>
      
      {/* Aura ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.8, 32]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Trail particles */}
      <points ref={particlesRef} geometry={trailGeometry}>
        <pointsMaterial 
          color={color}
          size={0.2}
          transparent
          opacity={0.5}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

const Spirits = () => {
  const spirits = useMemo(() => [
    { position: [10, 3, 10] as [number, number, number], color: '#00d4ff', speed: 0.8 },
    { position: [-15, 5, -10] as [number, number, number], color: '#8b5cf6', speed: 1.2 },
    { position: [20, 2, -15] as [number, number, number], color: '#22c55e', speed: 0.6 },
    { position: [-10, 4, 20] as [number, number, number], color: '#f59e0b', speed: 1.0 },
    { position: [0, 6, -25] as [number, number, number], color: '#ec4899', speed: 0.9 },
    { position: [25, 3, 5] as [number, number, number], color: '#06b6d4', speed: 1.1 },
  ], []);

  return (
    <>
      {spirits.map((spirit, index) => (
        <Spirit
          key={index}
          startPosition={spirit.position}
          color={spirit.color}
          speed={spirit.speed}
        />
      ))}
    </>
  );
};

export default Spirits;
