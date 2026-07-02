import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { WikiImage } from '@/data/wikiImages';

interface ImagePortalProps {
  image: WikiImage;
  position: [number, number, number];
  rotation?: [number, number, number];
  onEnter: (image: WikiImage) => void;
  isNearby: boolean;
  isVisited?: boolean;
}

const ImagePortal = ({ image, position, rotation = [0, 0, 0], onEnter, isNearby, isVisited = false }: ImagePortalProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Load texture
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const tex = new THREE.Texture(img);
      tex.needsUpdate = true;
      tex.colorSpace = THREE.SRGBColorSpace;
      setTexture(tex);
      setLoading(false);
    };
    
    img.onerror = () => {
      setError(true);
      setLoading(false);
    };
    
    img.src = image.url;
    
    return () => {
      if (texture) {
        texture.dispose();
      }
    };
  }, [image.url]);
  
  const aspectRatio = useMemo(() => {
    if (texture?.image) {
      const img = texture.image as HTMLImageElement;
      return img.width / img.height;
    }
    return 16 / 9;
  }, [texture]);
  
  const width = 5;
  const height = width / aspectRatio;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.1;
    }
    if (glowRef.current) {
      const pulse = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.5;
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = isNearby ? 0.4 + pulse * 0.4 : 0.15 + pulse * 0.1;
    }
  });

  const getCategoryColor = () => {
    switch (image.category) {
      case 'Art': return '#8b5cf6';
      case 'Space': return '#0ea5e9';
      case 'Nature': return '#22c55e';
      case 'Wildlife': return '#f59e0b';
      default: return '#8b5cf6';
    }
  };

  const frameColor = isNearby ? "#00d4ff" : isVisited ? "#22c55e" : getCategoryColor();

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Outer glow ring */}
      <mesh ref={glowRef} position={[0, 0, -0.05]}>
        <ringGeometry args={[Math.max(width, height) / 2 + 0.3, Math.max(width, height) / 2 + 1, 64]} />
        <meshBasicMaterial 
          color={frameColor} 
          transparent 
          opacity={0.3}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Portal frame */}
      <RoundedBox 
        args={[width + 0.4, height + 0.4, 0.15]} 
        radius={0.1} 
        position={[0, 0, 0]}
      >
        <meshStandardMaterial 
          color={isNearby ? "#00d4ff" : isVisited ? "#166534" : "#1a1a2e"} 
          metalness={0.9}
          roughness={0.1}
          emissive={frameColor}
          emissiveIntensity={isNearby ? 0.8 : 0.3}
        />
      </RoundedBox>

      {/* The portal image - this is what you walk INTO */}
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[width, height]} />
        {loading ? (
          <meshBasicMaterial color="#1a1a2e" />
        ) : error ? (
          <meshBasicMaterial color={getCategoryColor()} />
        ) : (
          <meshBasicMaterial 
            map={texture} 
            side={THREE.FrontSide}
          />
        )}
      </mesh>

      {/* "Enter" indicator when nearby */}
      {isNearby && (
        <>
          {/* Pulsing border effect */}
          <mesh position={[0, 0, 0.09]}>
            <ringGeometry args={[Math.min(width, height) / 2 - 0.1, Math.min(width, height) / 2, 64]} />
            <meshBasicMaterial 
              color="#00d4ff"
              transparent
              opacity={0.6}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          
          <group position={[0, -height / 2 - 0.5, 0.1]}>
            <mesh>
              <planeGeometry args={[2.5, 0.4]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.85} />
            </mesh>
            <Text
              position={[0, 0, 0.01]}
              fontSize={0.16}
              color="#00d4ff"
              anchorX="center"
              anchorY="middle"
              font="/fonts/inter-bold.woff"
            >
              ▶ WALK INTO PORTAL
            </Text>
          </group>
        </>
      )}

      {/* Title above portal */}
      <group position={[0, height / 2 + 0.4, 0]}>
        <mesh>
          <planeGeometry args={[width, 0.5]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.7} />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={width - 0.2}
        >
          {image.title}
        </Text>
      </group>

      {/* Category badge */}
      <group position={[width / 2 - 0.6, -height / 2 + 0.2, 0.1]}>
        <RoundedBox args={[1.1, 0.26, 0.02]} radius={0.04}>
          <meshBasicMaterial color={getCategoryColor()} />
        </RoundedBox>
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.1}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {image.category}
        </Text>
      </group>

      {/* Visited checkmark */}
      {isVisited && (
        <group position={[-width / 2 + 0.3, height / 2 - 0.3, 0.1]}>
          <mesh>
            <circleGeometry args={[0.22, 32]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.14}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            ✓
          </Text>
        </group>
      )}
    </group>
  );
};

export default ImagePortal;