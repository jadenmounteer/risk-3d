import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  SpotLight,
  AccumulativeShadows,
  RandomizedLight,
} from "@react-three/drei";
import "./App.css";

function RiskTable() {
  const { scene } = useGLTF("/models/risk-table.glb");
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

      {/* Brighter ambient light for better overall visibility */}
      <ambientLight intensity={0.4} />

      {/* Main dramatic spotlight with increased intensity and focus */}
      <SpotLight
        position={[0, 8, 0]}
        angle={0.5}
        penumbra={0.2}
        intensity={15}
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
useGLTF.preload("/models/risk-table.glb");

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
