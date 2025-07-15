import React, { Suspense, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  SpotLight,
  AccumulativeShadows,
  RandomizedLight,
  Text,
} from "@react-three/drei";
import * as THREE from "three";
import "./App.css";

interface TerritoryNodeProps {
  position: [number, number, number];
  color?: string;
  occupied?: boolean;
  troops?: number;
}

function TerritoryNode({
  position,
  color = "#808080",
  occupied = false,
  troops = 0,
}: TerritoryNodeProps) {
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (glowRef.current) {
      glowRef.current.scale.setScalar(
        1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      );
    }
  });

  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Main ring */}
      <mesh ref={ringRef} renderOrder={1}>
        <ringGeometry args={[0.08, 0.1, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.9}
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
          opacity={0.2}
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
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {occupied && (
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          rotation={[Math.PI / 2, 0, 0]}
          renderOrder={2}
        >
          {troops}
        </Text>
      )}
    </group>
  );
}

function CoordinateHelper() {
  const [point, setPoint] = useState<THREE.Vector3 | null>(null);
  const { camera, raycaster, pointer } = useThree();

  useFrame(() => {
    // Update the raycaster with current mouse position
    raycaster.setFromCamera(pointer, camera);

    // Create a plane that matches the game board's orientation
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectionPoint = new THREE.Vector3();

    // Find intersection with the plane
    raycaster.ray.intersectPlane(plane, intersectionPoint);
    setPoint(intersectionPoint);
  });

  return (
    <>
      {point && (
        <group position={[0, 2, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.2}
            color="white"
            anchorX="left"
            anchorY="middle"
          >
            {`X: ${point.x.toFixed(2)}, Y: ${point.y.toFixed(
              2
            )}, Z: ${point.z.toFixed(2)}`}
          </Text>
        </group>
      )}
      {point && (
        <mesh position={point.toArray()}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color="red" />
        </mesh>
      )}
    </>
  );
}

function RiskTable() {
  const { scene } = useGLTF(process.env.PUBLIC_URL + "/models/risk-table.glb");
  return (
    <primitive
      object={scene}
      position={[0, 0, 1]}
      scale={1}
      receiveShadow
      castShadow
    />
  );
}

function Scene() {
  return (
    <>
      <RiskTable />

      {/* Territory node for Alaska */}
      <TerritoryNode position={[-1.35, 0.5, 2.58]} />

      {/* Coordinate helper - commented out for now */}
      {/* <CoordinateHelper /> */}

      {/* Very dim ambient light for minimal fill */}
      <ambientLight intensity={0.4} />

      {/* Main dramatic spotlight with increased intensity and focus */}
      <SpotLight
        position={[0, 8, 0]}
        angle={0.5}
        penumbra={0.2}
        intensity={80}
        castShadow
        shadow-mapSize={2048}
        color="#fff5e6"
        distance={20}
      />

      {/* Shadows */}
      <AccumulativeShadows
        temporal
        frames={100}
        scale={10}
        position={[0, -0.01, 0]}
      >
        <RandomizedLight amount={8} radius={4} position={[0, 8, 0]} />
      </AccumulativeShadows>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={15}
      />
    </>
  );
}

// Pre-load the model
useGLTF.preload(process.env.PUBLIC_URL + "/models/risk-table.glb");

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#1a1a1a" }}>
      <Canvas camera={{ position: [0, 5, 10], fov: 50 }} shadows>
        <color attach="background" args={["#1a1a1a"]} />
        <fog attach="fog" args={["#1a1a1a", 8, 30]} />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default App;
