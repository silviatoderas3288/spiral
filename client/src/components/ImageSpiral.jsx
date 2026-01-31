import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

function TextThought({ position, thought, index, onClick }) {
  const meshRef = useRef()
  const [isHovered, setIsHovered] = useState(false)

  useFrame(({ camera }) => {
    if (meshRef.current) {
      // Billboard effect - make text face camera
      meshRef.current.quaternion.copy(camera.quaternion)
    }
  })

  // Create preview text (max 15 chars + ...)
  const previewText = thought.text.length > 15
    ? thought.text.substring(0, 15) + '...'
    : thought.text

  return (
    <group
      ref={meshRef}
      position={position}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      onClick={() => onClick(thought)}
    >
      {/* Background plane */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[2, 1.5]} />
        <meshBasicMaterial
          color={isHovered ? '#f0f0f0' : '#ffffff'}
          side={THREE.DoubleSide}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Text */}
      <Text
        fontSize={0.2}
        color={thought.color}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
        font={`/${thought.font.replace(/ /g, '+')}`}
        outlineWidth={0.01}
        outlineColor="#ffffff"
      >
        {previewText}
      </Text>

      {/* Hover indicator */}
      {isHovered && (
        <Text
          position={[0, -0.6, 0]}
          fontSize={0.1}
          color="#666666"
          anchorX="center"
          anchorY="middle"
        >
          Click to view full
        </Text>
      )}
    </group>
  )
}

function TextSpiral({ thoughts, onThoughtClick }) {
  const groupRef = useRef()
  const spiralLineRef = useRef()
  const scrollFactorRef = useRef(0)

  // Generate spiral positions
  const spiralPositions = useMemo(() => {
    const positions = []
    const totalThoughts = thoughts.length
    const heightIncrement = 0.5 // Vertical spacing
    const rotationIncrement = Math.PI / 4 // 45 degrees per thought

    for (let i = 0; i < totalThoughts; i++) {
      const t = i / Math.max(totalThoughts - 1, 1) // Normalized position (0 to 1)
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
  }, [thoughts])

  // Generate smooth spiral path (more points for smoother line)
  const spiralPathPoints = useMemo(() => {
    const points = []
    const numPoints = 200 // Number of points for smooth spiral
    const maxHeight = thoughts.length * 0.5
    const heightIncrement = maxHeight / numPoints
    const rotationIncrement = (Math.PI / 4) * (thoughts.length / numPoints)

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
  }, [thoughts.length])

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

      {/* Text thoughts on the spiral */}
      {thoughts.map((thought, index) => (
        <TextThought
          key={thought.id}
          position={[
            spiralPositions[index]?.x || 0,
            spiralPositions[index]?.y || 0,
            spiralPositions[index]?.z || 0
          ]}
          thought={thought}
          index={index}
          onClick={onThoughtClick}
        />
      ))}
    </group>
  )
}

export default TextSpiral
