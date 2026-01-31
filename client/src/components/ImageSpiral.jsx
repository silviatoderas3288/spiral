import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'

function ImagePlane({ position, imageUrl, text, index }) {
  const meshRef = useRef()
  const texture = useLoader(TextureLoader, imageUrl)

  useFrame(({ camera }) => {
    if (meshRef.current) {
      // Billboard effect - make image face camera
      meshRef.current.quaternion.copy(camera.quaternion)
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[1.5, 1.5]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  )
}

function ImageSpiral({ images }) {
  const groupRef = useRef()
  const spiralLineRef = useRef()
  const scrollFactorRef = useRef(0)

  // Generate spiral positions
  const spiralPositions = useMemo(() => {
    const positions = []
    const totalImages = images.length
    const heightIncrement = 0.5 // Vertical spacing
    const rotationIncrement = Math.PI / 4 // 45 degrees per image

    for (let i = 0; i < totalImages; i++) {
      const t = i / Math.max(totalImages - 1, 1) // Normalized position (0 to 1)
      const height = i * heightIncrement
      const angle = i * rotationIncrement

      // Cone radius that varies with height and scroll
      // This will be updated in useFrame for morphing effect
      const baseRadius = 3 + Math.sin(height * 0.3) * 2

      const x = baseRadius * Math.cos(angle)
      const y = height
      const z = baseRadius * Math.sin(angle)

      positions.push({ x, y, z, angle, height, baseRadius })
    }

    return positions
  }, [images])

  // Generate smooth spiral path (more points for smoother line)
  const spiralPathPoints = useMemo(() => {
    const points = []
    const numPoints = 200 // Number of points for smooth spiral
    const maxHeight = images.length * 0.5
    const heightIncrement = maxHeight / numPoints
    const rotationIncrement = (Math.PI / 4) * (images.length / numPoints)

    for (let i = 0; i < numPoints; i++) {
      const height = i * heightIncrement
      const angle = i * rotationIncrement
      const baseRadius = 3 + Math.sin(height * 0.3) * 2

      const x = baseRadius * Math.cos(angle)
      const y = height
      const z = baseRadius * Math.sin(angle)

      points.push(new THREE.Vector3(x, y, z))
    }

    return points
  }, [images.length])

  // Continuous rotation and morphing
  useFrame((state) => {
    if (groupRef.current) {
      // Rotate the entire spiral
      groupRef.current.rotation.y += 0.005

      // Update scroll factor for morphing (simulating scroll with time for demo)
      scrollFactorRef.current = Math.sin(state.clock.elapsedTime * 0.2) * 0.5 + 0.5

      // Update individual image positions for morphing effect
      groupRef.current.children.forEach((child, i) => {
        // Skip the spiral line (it's the last child)
        if (i >= spiralPositions.length) return

        if (spiralPositions[i]) {
          const pos = spiralPositions[i]
          // Morph the radius: creates cone/inverse cone effect
          const morphFactor = Math.abs(Math.sin(pos.height * 0.3 + scrollFactorRef.current * Math.PI))
          const radius = pos.baseRadius * morphFactor

          child.position.x = radius * Math.cos(pos.angle)
          child.position.z = radius * Math.sin(pos.angle)
        }
      })

      // Update spiral line positions
      if (spiralLineRef.current) {
        const positions = spiralLineRef.current.geometry.attributes.position
        const points = spiralPathPoints

        for (let i = 0; i < points.length; i++) {
          const point = points[i]
          const height = point.y
          const angle = Math.atan2(point.z, point.x)

          // Apply same morphing to the spiral line
          const morphFactor = Math.abs(Math.sin(height * 0.3 + scrollFactorRef.current * Math.PI))
          const baseRadius = 3 + Math.sin(height * 0.3) * 2
          const radius = baseRadius * morphFactor

          positions.array[i * 3] = radius * Math.cos(angle)
          positions.array[i * 3 + 1] = height
          positions.array[i * 3 + 2] = radius * Math.sin(angle)
        }
        positions.needsUpdate = true
      }
    }
  })

  // Handle scroll events to control morphing
  useEffect(() => {
    const handleWheel = (e) => {
      scrollFactorRef.current = (scrollFactorRef.current + e.deltaY * 0.001) % 1
    }

    window.addEventListener('wheel', handleWheel)
    return () => window.removeEventListener('wheel', handleWheel)
  }, [])

  return (
    <group ref={groupRef}>
      {/* Spiral path line with metallic gradient */}
      <line ref={spiralLineRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={spiralPathPoints.length}
            array={new Float32Array(spiralPathPoints.flatMap(p => [p.x, p.y, p.z]))}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={spiralPathPoints.length}
            array={new Float32Array(spiralPathPoints.flatMap((_, i) => {
              // Create white to grey gradient along the spiral
              const t = i / spiralPathPoints.length
              const brightness = 1 - t * 0.5 // From 1 (white) to 0.5 (medium grey)
              return [brightness, brightness, brightness]
            }))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          linewidth={3}
          transparent
          opacity={0.8}
        />
      </line>

      {/* Images on the spiral */}
      {images.map((image, index) => (
        <ImagePlane
          key={image.filename}
          position={[
            spiralPositions[index]?.x || 0,
            spiralPositions[index]?.y || 0,
            spiralPositions[index]?.z || 0
          ]}
          imageUrl={image.url}
          text={image.text}
          index={index}
        />
      ))}
    </group>
  )
}

export default ImageSpiral
