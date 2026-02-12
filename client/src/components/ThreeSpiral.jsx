import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const ThreeSpiral = ({ thoughts }) => {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const spiralGroupRef = useRef(null)
  const animationIdRef = useRef(null)

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      (window.innerWidth * 0.7) / window.innerHeight,
      1,
      10000
    )
    camera.position.set(0, 0, 1500)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(window.innerWidth * 0.7, window.innerHeight)
    renderer.setClearColor(0x000000, 1)
    rendererRef.current = renderer

    mountRef.current.appendChild(renderer.domElement)

    // Create spiral group
    const spiralGroup = new THREE.Group()
    scene.add(spiralGroup)
    spiralGroupRef.current = spiralGroup

    // Create spiral line
    createSpiralLine(spiralGroup)

    // Animation loop
    let time = 0
    const animate = () => {
      time += 0.005

      // Rotate the entire spiral
      spiralGroup.rotation.y = time

      renderer.render(scene, camera)
      animationIdRef.current = requestAnimationFrame(animate)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      const width = window.innerWidth * 0.7
      const height = window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  // Update thoughts when they change
  useEffect(() => {
    if (!spiralGroupRef.current) return

    // Clear existing thought meshes (keep the spiral line)
    const children = [...spiralGroupRef.current.children]
    children.forEach(child => {
      if (child.userData.isThought) {
        spiralGroupRef.current.remove(child)
        if (child.geometry) child.geometry.dispose()
        if (child.material) child.material.dispose()
      }
    })

    // Add new thought texts
    thoughts.forEach((thought, index) => {
      createTextMesh(thought, index, spiralGroupRef.current)
    })
  }, [thoughts])

  const createSpiralLine = (group) => {
    const points = []
    const radius = 600
    const height = 4000
    const coils = 10
    const segments = 500

    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const angle = t * Math.PI * 2 * coils
      const y = -height / 2 + t * height
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      points.push(new THREE.Vector3(x, y, z))
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 2,
      opacity: 0.6,
      transparent: true
    })

    const line = new THREE.Line(geometry, material)
    line.userData.isSpiral = true
    group.add(line)
  }

  const createTextMesh = (thought, index, group) => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    // Set canvas size
    canvas.width = 512
    canvas.height = 128

    // Configure text
    context.fillStyle = thought.color || '#ffffff'
    context.font = `${thought.fontSize || 24}px ${thought.font || 'Arial'}`
    context.textAlign = 'center'
    context.textBaseline = 'middle'

    // Draw text
    const text = thought.text.length > 20 ? thought.text.substring(0, 20) + '...' : thought.text
    context.fillText(text, canvas.width / 2, canvas.height / 2)

    // Create texture
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true

    // Create sprite material
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 1
    })

    // Create sprite
    const sprite = new THREE.Sprite(material)
    sprite.userData.isThought = true
    sprite.userData.thoughtId = thought.id

    // Position on spiral
    const radius = 600
    const height = 4000
    const coils = 10
    const totalThoughts = thoughts.length || 1
    const t = index / totalThoughts
    const angle = t * Math.PI * 2 * coils
    const y = -height / 2 + t * height

    sprite.position.set(
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius
    )

    sprite.scale.set(200, 50, 1)

    group.add(sprite)
  }

  return <div ref={mountRef} style={{ width: '70vw', height: '100vh' }} />
}

export default ThreeSpiral
