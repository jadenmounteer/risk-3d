import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { Territory } from "../../types/territory";
import { TEAM_COLORS } from "../../types/territory";

interface TerritoryNodeProps {
  territory: Territory;
  isCurrentPlayer: boolean;
  onTerritoryClick: (territoryId: string) => void;
}

/**
 * TerritoryNode Component
 *
 * Renders a territory node in the 3D space with:
 * - A glowing ring indicating territory control
 * - Troop count when territory is occupied
 * - Click interaction for territory management
 * - Visual feedback for current player's territories
 */
export const TerritoryNode: React.FC<TerritoryNodeProps> = ({
  territory,
  isCurrentPlayer,
  onTerritoryClick,
}) => {
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const color = TEAM_COLORS[territory.teamId];
  const isOccupied = territory.teamId !== "unoccupied";

  // Animate the glow effect - more pronounced for current player's territories
  useFrame((state) => {
    if (glowRef.current) {
      const pulseIntensity = isCurrentPlayer ? 0.2 : 0.1;
      glowRef.current.scale.setScalar(
        1 + Math.sin(state.clock.elapsedTime * 2) * pulseIntensity
      );
    }
  });

  // Handle click events
  const handleClick = (
    event: THREE.Event & { stopPropagation: () => void }
  ) => {
    event.stopPropagation();
    onTerritoryClick(territory.id);
  };

  return (
    <group
      position={territory.position}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={handleClick}
    >
      {/* Main ring */}
      <mesh ref={ringRef} renderOrder={1}>
        <ringGeometry args={[0.08, 0.1, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isCurrentPlayer ? 1 : 0.9}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner glow */}
      <mesh ref={glowRef} position={[0, 0, -0.005]} renderOrder={1}>
        <ringGeometry args={[0.07, 0.11, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isCurrentPlayer ? 0.3 : 0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outer glow */}
      <mesh position={[0, 0, -0.01]} renderOrder={1}>
        <ringGeometry args={[0.06, 0.12, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isCurrentPlayer ? 0.15 : 0.1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Troop count */}
      {isOccupied && (
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          rotation={[Math.PI / 2, 0, 0]}
          renderOrder={2}
        >
          {territory.troops}
        </Text>
      )}
    </group>
  );
};
