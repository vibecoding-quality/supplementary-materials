import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface PlayerProps {
  onPositionChange: (position: THREE.Vector3) => void;
  onInteract: () => void;
}

export interface PlayerHandle {
  resetPosition: () => void;
}

const Player = forwardRef<PlayerHandle, PlayerProps>(({ onPositionChange, onInteract }, ref) => {
  const { camera } = useThree();
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  });
  const mouseMovement = useRef({ x: 0, y: 0 });
  const isPointerLocked = useRef(false);

  const speed = 10;
  const mouseSensitivity = 0.002;

  // Expose reset function to parent
  useImperativeHandle(ref, () => ({
    resetPosition: () => {
      camera.position.set(0, 2, 0);
      camera.rotation.set(0, 0, 0);
    }
  }), [camera]);

  // Initialize camera
  useEffect(() => {
    camera.position.set(0, 2, 0);
  }, [camera]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        keys.current.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        keys.current.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        keys.current.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        keys.current.right = true;
        break;
      case 'Space':
        e.preventDefault();
        onInteract();
        break;
      case 'ShiftLeft':
        keys.current.down = true;
        break;
      case 'KeyQ':
        keys.current.up = true;
        break;
      case 'KeyE':
        keys.current.down = true;
        break;
    }
  }, [onInteract]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        keys.current.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        keys.current.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        keys.current.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        keys.current.right = false;
        break;
      case 'ShiftLeft':
        keys.current.down = false;
        break;
      case 'KeyQ':
        keys.current.up = false;
        break;
      case 'KeyE':
        keys.current.down = false;
        break;
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPointerLocked.current) {
      mouseMovement.current.x += e.movementX;
      mouseMovement.current.y += e.movementY;
    }
  }, []);

  const handlePointerLockChange = useCallback(() => {
    isPointerLocked.current = document.pointerLockElement !== null;
  }, []);

  const handleClick = useCallback(() => {
    if (!isPointerLocked.current) {
      document.body.requestPointerLock();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('click', handleClick);
    };
  }, [handleKeyDown, handleKeyUp, handleMouseMove, handlePointerLockChange, handleClick]);

  useFrame((_, delta) => {
    if (isPointerLocked.current) {
      const euler = new THREE.Euler(0, 0, 0, 'YXZ');
      euler.setFromQuaternion(camera.quaternion);
      
      euler.y -= mouseMovement.current.x * mouseSensitivity;
      euler.x -= mouseMovement.current.y * mouseSensitivity;
      euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
      
      camera.quaternion.setFromEuler(euler);
    }
    mouseMovement.current = { x: 0, y: 0 };

    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(0, 0, Number(keys.current.backward) - Number(keys.current.forward));
    const sideVector = new THREE.Vector3(Number(keys.current.left) - Number(keys.current.right), 0, 0);
    const upVector = new THREE.Vector3(0, Number(keys.current.up) - Number(keys.current.down), 0);

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(speed * delta)
      .applyEuler(new THREE.Euler(0, camera.rotation.y, 0));
    
    direction.add(upVector.multiplyScalar(speed * delta));

    camera.position.add(direction);
    onPositionChange(camera.position.clone());
  });

  return null;
});

Player.displayName = 'Player';

export default Player;