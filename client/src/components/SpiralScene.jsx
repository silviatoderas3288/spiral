import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import ImageSpiral from './ImageSpiral'

function SpiralScene({ images }) {
  return (
    <Canvas
      camera={{ position: [0, 5, 10], fov: 60 }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />

      {/* Spiral with images */}
      <ImageSpiral images={images} />

      {/* Camera controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
      />
    </Canvas>
  )
}

export default SpiralScene
