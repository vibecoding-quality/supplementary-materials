import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Stars } from '@react-three/drei';

interface SpaceEnvironmentProps {
  accentColor?: string;
}

const SpaceEnvironment = ({ accentColor = '#8b5cf6' }: SpaceEnvironmentProps) => {
  const nebulaRef = useRef<THREE.Points>(null);
  const dustRef = useRef<THREE.Points>(null);
  const aureolaRef = useRef<THREE.Points>(null);

  // Create nebula particles with dynamic colors based on dimension
  const nebulaParticles = useMemo(() => {
    const count = 500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    // Parse accent color to get base hue
    const tempColor = new THREE.Color(accentColor);
    const hsl = { h: 0, s: 0, l: 0 };
    tempColor.getHSL(hsl);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 50 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Use dimension's accent color with variations
      const variation = Math.random();
      const particleColor = new THREE.Color();
      particleColor.setHSL(
        hsl.h + (variation - 0.5) * 0.2,
        0.5 + Math.random() * 0.3,
        0.3 + Math.random() * 0.4
      );
      
      colors[i3] = particleColor.r;
      colors[i3 + 1] = particleColor.g;
      colors[i3 + 2] = particleColor.b;
    }
    
    return { positions, colors };
  }, [accentColor]);

  // Create floating dust particles
  const dustParticles = useMemo(() => {
    const count = 300;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 80;
      positions[i3 + 1] = (Math.random() - 0.5) * 40;
      positions[i3 + 2] = (Math.random() - 0.5) * 80;
    }
    
    return positions;
  }, []);

  // Create floating magical particles (aureola)
  const aureolaParticles = useMemo(() => {
    const count = 150;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    const tempColor = new THREE.Color(accentColor);
    const hsl = { h: 0, s: 0, l: 0 };
    tempColor.getHSL(hsl);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 60;
      positions[i3 + 1] = Math.random() * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 60;
      
      // Use accent color with golden tint
      const particleColor = new THREE.Color();
      particleColor.setHSL(
        hsl.h + 0.1,
        0.7 + Math.random() * 0.2,
        0.5 + Math.random() * 0.3
      );
      
      colors[i3] = particleColor.r;
      colors[i3 + 1] = particleColor.g;
      colors[i3 + 2] = particleColor.b;
    }
    
    return { positions, colors };
  }, [accentColor]);

  useFrame((state) => {
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
    if (dustRef.current) {
      dustRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      dustRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
    if (aureolaRef.current) {
      const positions = aureolaRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length / 3; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.01;
        
        if (positions[i3 + 1] > 25) {
          positions[i3 + 1] = 0;
        }
      }
      aureolaRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color={accentColor} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#8b5cf6" />
      <pointLight position={[0, 20, 0]} intensity={0.2} color="#f59e0b" />

      {/* Starfield */}
      <Stars 
        radius={200} 
        depth={100} 
        count={8000} 
        factor={4} 
        saturation={0.5} 
        fade 
        speed={0.5}
      />

      {/* Nebula particles */}
      <points ref={nebulaRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={nebulaParticles.positions.length / 3}
            array={nebulaParticles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={nebulaParticles.colors.length / 3}
            array={nebulaParticles.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={3}
          vertexColors
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Floating dust */}
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={dustParticles.length / 3}
            array={dustParticles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.15}
          color="#ffffff"
          transparent
          opacity={0.4}
          sizeAttenuation
        />
      </points>

      {/* Magical floating particles (aureola effect) */}
      <points ref={aureolaRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={aureolaParticles.positions.length / 3}
            array={aureolaParticles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={aureolaParticles.colors.length / 3}
            array={aureolaParticles.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.25}
          vertexColors
          transparent
          opacity={0.7}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
};

export default SpaceEnvironment;