import { useState, useCallback, useMemo, Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Player from './Player';
import ImagePortal from './ImagePortal';
import SpaceEnvironment from './SpaceEnvironment';
import GameHUD from './GameHUD';
import Spirits from './Spirits';
import VisitedGallery from './VisitedGallery';
import DimensionTransition from './DimensionTransition';
import { WikiImage, getConnectedImages, getRandomStartingImage, wikiImages } from '@/data/wikiImages';
import { useGameProgress } from '@/hooks/useGameProgress';

// Generate unique environment colors for each dimension
const getDimensionColors = (imageId: string) => {
  const hash = imageId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = (hash * 137) % 360;
  return {
    background: `hsl(${hue}, 30%, 3%)`,
    accent: `hsl(${(hue + 180) % 360}, 70%, 50%)`,
  };
};

const GameScene = () => {
  const [currentImage, setCurrentImage] = useState<WikiImage>(() => getRandomStartingImage());
  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(0, 2, 0));
  const [nearbyPortal, setNearbyPortal] = useState<WikiImage | null>(null);
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<WikiImage | null>(null);
  const hasEnteredRef = useRef(false);
  const playerRef = useRef<{ resetPosition: () => void } | null>(null);
  
  const { visitedImages, saveVisit, resetProgress, totalVisited } = useGameProgress();

  const dimensionColors = useMemo(() => getDimensionColors(currentImage.id), [currentImage.id]);

  // Mark starting image as visited
  useEffect(() => {
    saveVisit(currentImage.id);
  }, []);

  // Get connected images for portals
  const connectedImages = useMemo(() => {
    return getConnectedImages(currentImage.id);
  }, [currentImage.id]);

  // Generate portal positions in a circle around the player
  const portalPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const count = connectedImages.length;
    const radius = 20;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      positions.push([
        Math.sin(angle) * radius,
        2 + Math.sin(i * 0.8) * 0.5,
        Math.cos(angle) * radius
      ]);
    }
    return positions;
  }, [connectedImages.length]);

  // Check proximity to portals
  useEffect(() => {
    if (isTransitioning) return;
    
    let closest: WikiImage | null = null;
    let closestDist = Infinity;

    connectedImages.forEach((img, index) => {
      const portalPos = new THREE.Vector3(...portalPositions[index]);
      const dist = playerPosition.distanceTo(portalPos);
      if (dist < closestDist) {
        closestDist = dist;
        closest = img;
      }
    });

    if (closestDist < 8) {
      setNearbyPortal(closest);
      
      if (closestDist < 2.5 && closest && !hasEnteredRef.current) {
        hasEnteredRef.current = true;
        handleEnterPortal(closest);
      }
    } else {
      setNearbyPortal(null);
      hasEnteredRef.current = false;
    }
  }, [playerPosition, connectedImages, portalPositions, isTransitioning]);

  const handleEnterPortal = useCallback((image: WikiImage) => {
    if (isTransitioning) return;
    setTransitionTarget(image);
    setIsTransitioning(true);
  }, [isTransitioning]);

  // Complete transition - update state WITHOUT recreating Canvas
  const handleTransitionComplete = useCallback(() => {
    if (transitionTarget) {
      setCurrentImage(transitionTarget);
      saveVisit(transitionTarget.id);
      setPlayerPosition(new THREE.Vector3(0, 2, 0));
      setNearbyPortal(null);
      hasEnteredRef.current = false;
      
      // Reset player position via ref
      if (playerRef.current) {
        playerRef.current.resetPosition();
      }
    }
    setIsTransitioning(false);
    setTransitionTarget(null);
  }, [transitionTarget, saveVisit]);

  const handleInteract = useCallback(() => {
    if (nearbyPortal && !isTransitioning) {
      handleEnterPortal(nearbyPortal);
    }
  }, [nearbyPortal, handleEnterPortal, isTransitioning]);

  useEffect(() => {
    const handleLockChange = () => {
      setIsPointerLocked(document.pointerLockElement !== null);
    };
    document.addEventListener('pointerlockchange', handleLockChange);
    return () => document.removeEventListener('pointerlockchange', handleLockChange);
  }, []);

  const handleGalleryNavigate = useCallback((image: WikiImage) => {
    setShowGallery(false);
    setTransitionTarget(image);
    setIsTransitioning(true);
  }, []);

  return (
    <div className="game-container">
      <Canvas
        camera={{ fov: 75, near: 0.1, far: 500, position: [0, 2, 0] }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={[dimensionColors.background]} />
        <fog attach="fog" args={[dimensionColors.background, 15, 100]} />
        
        <Suspense fallback={null}>
          <SpaceEnvironment accentColor={dimensionColors.accent} />
          <Spirits />
          
          {/* Portals - keyed by current dimension to force reload */}
          {connectedImages.map((img, index) => (
            <ImagePortal
              key={`${currentImage.id}-${img.id}`}
              image={img}
              position={portalPositions[index]}
              rotation={[0, Math.atan2(
                -portalPositions[index][0],
                -portalPositions[index][2]
              ), 0]}
              onEnter={handleEnterPortal}
              isNearby={nearbyPortal?.id === img.id}
              isVisited={visitedImages.has(img.id)}
            />
          ))}
          
          <Player 
            ref={playerRef}
            onPositionChange={setPlayerPosition}
            onInteract={handleInteract}
          />
        </Suspense>
      </Canvas>

      <DimensionTransition 
        isTransitioning={isTransitioning}
        imageName={transitionTarget?.title || ''}
        onComplete={handleTransitionComplete}
      />

      {showGallery && (
        <VisitedGallery
          visitedImageIds={visitedImages}
          onClose={() => setShowGallery(false)}
          onNavigate={handleGalleryNavigate}
        />
      )}

      <GameHUD
        currentImage={currentImage}
        visitedCount={totalVisited}
        totalImages={wikiImages.length}
        isLocked={isPointerLocked}
        onResetProgress={resetProgress}
        onOpenGallery={() => setShowGallery(true)}
      />
    </div>
  );
};

export default GameScene;