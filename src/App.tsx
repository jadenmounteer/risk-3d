import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  SpotLight,
  AccumulativeShadows,
  RandomizedLight,
} from "@react-three/drei";
import { TerritoryContainer } from "./components/territory/TerritoryContainer";
import "./App.css";

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
  const handleTerritoryClick = (territoryId: string) => {
    console.log(`Clicked territory: ${territoryId}`);
    // We'll implement game logic here later
  };

  return (
    <>
      <RiskTable />

      {/* Render all territory nodes */}
      <TerritoryContainer onTerritoryClick={handleTerritoryClick} />

      {/* Lighting setup */}
      <ambientLight intensity={0.4} />
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

      {/* Controls */}
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
