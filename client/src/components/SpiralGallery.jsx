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

    // Total length of the spiral loop in "item units"
    // Each word travels this many units before wrapping back to the top
    const loopLength = count * ITEM_SHIFT + 2000

    // Each thought starts evenly spaced along the spiral
    // t represents how far down the spiral each thought has traveled
    const t = thoughtItems.length > 0
      ? Array.from({ length: count }, (_, i) => i * ITEM_SHIFT)
      : []

    let currentAngle = 0
    const speed = 1

    const updateFrame = () => {
      currentAngle += 0.2

      if (spiralLine.current) {
        spiralLine.current.style.transform = `translateZ(-1500px) rotateY(${currentAngle}deg)`
      }

      thoughtItems.forEach((item, i) => {
        // Advance position along the spiral
        t[i] += speed
        // Wrap back to the top when it exits the bottom
        if (t[i] > loopLength) {
          t[i] -= loopLength
        }

        // Convert t (distance along spiral) to 3D position
        // t / ITEM_SHIFT gives us the continuous spiral index
        const spiralIndex = t[i] / ITEM_SHIFT
        const angle = angleUnit * spiralIndex
        const angleRad = (angle * Math.PI) / 180
        const xpos = Math.sin(angleRad) * RADIUS
        const zpos = Math.cos(angleRad) * RADIUS
        const ypos = t[i]

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

  // Generate a long static spiral that covers the full scroll range.
  // The spiral stays still (no Y scroll) so the trail is always visible.
  // We extend well beyond the thought range to fill the visible area.
  const generateSpiralPoints = () => {
    const points = []
    const angleUnit = 360 / SLICE_COUNT
    const stepsPerItem = 12
    // Extend the spiral far beyond the actual thoughts so it fills the screen
    const totalHeight = images.length * ITEM_SHIFT + 2600
    const totalSteps = Math.ceil(totalHeight / ITEM_SHIFT) * stepsPerItem

    for (let s = 0; s < totalSteps; s++) {
      const i = s / stepsPerItem
      const angle = angleUnit * i
      const angleRad = (angle * Math.PI) / 180
      const xpos = Math.sin(angleRad) * RADIUS
      const zpos = Math.cos(angleRad) * RADIUS
      const ypos = i * ITEM_SHIFT

      points.push({ xpos, ypos, zpos })
    }

    return points
  }

  const spiralPoints = generateSpiralPoints()

  return (
    <div className="spiral-container">
      {/* Spiral trajectory line - continuous 3D line using connected segments */}
      <div className="spiral-line" ref={spiralLine}>
        {/* Spiral line segments */}
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

        {/* Thought items — same container so they share the spiral's coordinate space */}
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
