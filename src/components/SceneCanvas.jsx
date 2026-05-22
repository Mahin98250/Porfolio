import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';

function FloatingObject() {
  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <mesh>
        <icosahedronGeometry args={[2, 1]} />
        <meshStandardMaterial
          color='#22d3ee'
          emissive='#22d3ee'
          emissiveIntensity={1}
          wireframe={true}
        />
      </mesh>
    </Float>
  );
}

export default function SceneCanvas() {
  return (
    <div className='absolute inset-0'>
      <Canvas camera={{ position: [0, 0, 6] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 2, 2]} intensity={2} />

        <FloatingObject />

        <OrbitControls enableZoom={false} autoRotate={true} autoRotateSpeed={2} />
      </Canvas>
    </div>
  );
}