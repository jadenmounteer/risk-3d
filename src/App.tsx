import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import "./App.css";

function RiskTable() {
  const { scene } = useGLTF("/models/risk-table.glb");
  return <primitive object={scene} position={[0, 0, 1]} scale={1} />;
}

function Scene() {
  return (
    <>
      <RiskTable />

      {/* Add ambient and directional light */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* OrbitControls allows us to navigate the scene */}
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
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 5, 10], fov: 50 }} shadows>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default App;
