import { useEffect, useRef, useState } from 'react'

const RADIUS = 720
const SLICE_COUNT = 12
const ITEM_SHIFT = 80

const SpiralGallery = ({ images, onDeleteThought }) => {
  const spiralLine = useRef(null)
  const animId = useRef(0)
  const [selectedThought, setSelectedThought] = useState(null)

  useEffect(() => {
    cancelAnimationFrame(animId.current)
    if (!spiralLine.current || images.length === 0) return

    const angleUnit = 360 / SLICE_COUNT
    const thoughtItems = spiralLine.current.querySelectorAll('.thought-item')
    const count = thoughtItems.length

    // Screen boundaries - thoughts spawn way above visible area
    const spawnY = -5000 // Far above screen (completely invisible)
    const disappearY = 4000 // Below screen (invisible)
    const travelDistance = disappearY - spawnY

    // Initialize each thought's position spread across the travel distance
    const positions = Array.from({ length: count }, (_, i) =>
      spawnY + (travelDistance / count) * i
    )

    let currentAngle = 0
    const scrollSpeed = 1.5

    const updateFrame = () => {
      currentAngle += 0.2

      if (spiralLine.current) {
        spiralLine.current.style.transform = `translateZ(-1500px) rotateY(${currentAngle}deg)`
      }

      thoughtItems.forEach((item, i) => {
        // Move down
        positions[i] += scrollSpeed

        // When reaching bottom (invisible), teleport to top (also invisible)
        if (positions[i] >= disappearY) {
          positions[i] = spawnY
        }

        // Calculate spiral position
        const spiralIndex = positions[i] / ITEM_SHIFT
        const angle = angleUnit * spiralIndex
        const angleRad = (angle * Math.PI) / 180
        const xpos = Math.sin(angleRad) * RADIUS
        const zpos = Math.cos(angleRad) * RADIUS
        const ypos = positions[i]

        item.style.transform = `translateX(${xpos}px) translateZ(${zpos}px) translateY(${ypos}px)`
      })

      animId.current = requestAnimationFrame(updateFrame)
    }
    updateFrame()

    return () => {
      cancelAnimationFrame(animId.current)
    }
  }, [images])

  // Display the selected thought
  const pickThought = (thought) => {
    setSelectedThought(thought)
  }

  const closeThought = () => {
    setSelectedThought(null)
  }

  const handleDelete = async (thoughtId) => {
    if (onDeleteThought) {
      await onDeleteThought(thoughtId)
      closeThought()
    }
  }

  // Generate sparse spiral line segments (not very continuous)
  // Use the same spiral calculation for both line and thoughts
  const generateSpiralPoints = () => {
    const points = []
    const angleUnit = 360 / SLICE_COUNT
    const stepsPerItem = 6 // Few steps = visible gaps between segments
    const startY = -5000 // Match thought spawn point
    const totalHeight = 9000
    const totalSteps = Math.ceil(totalHeight / ITEM_SHIFT) * stepsPerItem

    for (let s = 0; s < totalSteps; s++) {
      const i = s / stepsPerItem
      const angle = angleUnit * i
      const angleRad = (angle * Math.PI) / 180
      const xpos = Math.sin(angleRad) * RADIUS
      const zpos = Math.cos(angleRad) * RADIUS
      const ypos = startY + (i * ITEM_SHIFT)

      points.push({ xpos, ypos, zpos })
    }

    return points
  }

  const spiralPoints = generateSpiralPoints()

  return (
    <div className="spiral-container">
      {/* Spiral container */}
      <div className="spiral-line" ref={spiralLine}>
        {/* Sparse spiral line segments */}
        {spiralPoints.map((point, index) => {
          if (index === spiralPoints.length - 1) return null

          const next = spiralPoints[index + 1]
          const dx = next.xpos - point.xpos
          const dy = next.ypos - point.ypos
          const dz = next.zpos - point.zpos
          const length = Math.sqrt(dx * dx + dy * dy + dz * dz)

          const angleY = Math.atan2(dx, dz) * (180 / Math.PI)
          const horizontal = Math.sqrt(dx * dx + dz * dz)
          const angleX = Math.atan2(-dy, horizontal) * (180 / Math.PI)

          return (
            <div
              key={`seg-${index}`}
              className="spiral-line-segment"
              style={{
                width: `${length}px`,
                transform: `translateX(${point.xpos}px) translateZ(${point.zpos}px) translateY(${point.ypos}px) rotateY(${angleY}deg) rotateX(${angleX}deg)`
              }}
            />
          )
        })}

        {/* Thought items */}
        {images.map((thought, index) => {
          const previewText = thought.text.length > 15
            ? thought.text.substring(0, 15) + '...'
            : thought.text

          return (
            <div
              onClick={() => pickThought(thought)}
              key={thought.id || index}
              className="spiral-gallery-item thought-item"
              style={{
                color: thought.color,
                fontFamily: thought.font,
                fontSize: `${thought.fontSize || 18}px`
              }}
            >
              <span className="thought-preview">{previewText}</span>
            </div>
          )
        })}
      </div>

      {/* Thought display modal */}
      {selectedThought && (
        <div onClick={closeThought} className="thought-display">
          <div className="thought-display-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeThought}>×</button>
            <div
              className="thought-full-text"
              style={{
                color: selectedThought.color,
                fontFamily: selectedThought.font,
                fontSize: `${selectedThought.fontSize || 18}px`
              }}
            >
              {selectedThought.text}
            </div>
            <button
              className="delete-thought-button"
              onClick={() => handleDelete(selectedThought.id)}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SpiralGallery
