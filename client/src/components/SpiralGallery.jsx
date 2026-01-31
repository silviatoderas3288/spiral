import { useEffect, useRef, useState } from 'react'

const RADIUS = 720
const SLICE_COUNT = 12
const ITEM_SHIFT = 80

const SpiralGallery = ({ images, onDeleteThought }) => {
  const el = useRef(null)
  const spiralLine = useRef(null)
  const animId = useRef(0)
  const [selectedThought, setSelectedThought] = useState(null)

  useEffect(() => {
    if (!el.current || images.length === 0) return

    // Reset parameters
    let angleUnit = 360 / SLICE_COUNT
    let sliceIndex = 0
    let currentAngle = 0
    let currentY = 0

    const items = el.current.children

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const itemAngle = angleUnit * sliceIndex
      const itemAngleRad = (itemAngle * Math.PI) / 180
      const xpos = Math.sin(itemAngleRad) * RADIUS
      const zpos = Math.cos(itemAngleRad) * RADIUS
      item.style.transform = `translateX(${xpos}px) translateZ(${zpos}px) translateY(${
        i * ITEM_SHIFT
      }px) rotateY(${itemAngle}deg)`
      if (++sliceIndex === SLICE_COUNT) sliceIndex = 0
    }

    const gallery = el.current

    // Rotate and animate the gallery with constant speed
    cancelAnimationFrame(animId.current)
    const updateFrame = () => {
      // Constant rotation speed - positive for counterclockwise when viewed from above
      currentAngle += 0.2

      // Constant upward movement (positive Y increases = moving up on screen)
      currentY += 1

      // Infinite scroll - loop the Y position
      // When all images have passed through and reached bottom of screen, reset
      // Adding extra height (2000px) to ensure images reach the very bottom
      const totalHeight = images.length * ITEM_SHIFT + 1300
      if (currentY > totalHeight) {
        currentY = 0
      }

      gallery.style.transform = `translateZ(-1500px) translateY(${currentY}px) rotateY(${currentAngle}deg)`

      // Update spiral line with same transform
      if (spiralLine.current) {
        spiralLine.current.style.transform = `translateZ(-1500px) translateY(${currentY}px) rotateY(${currentAngle}deg)`
      }

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

  // Generate spiral line points for the trajectory
  // Generate enough points to cover the entire spiral path plus extra behind for trail
  // Need points from negative Y (behind/above) to positive Y (ahead/below) to show complete trail
  const totalPoints = Math.max(images.length * 50, 1000)
  const spiralPoints = Array.from({ length: totalPoints }, (_, i) => {
    const angle = (i / SLICE_COUNT) * 360
    const angleRad = (angle * Math.PI) / 180
    const xpos = Math.sin(angleRad) * RADIUS
    const zpos = Math.cos(angleRad) * RADIUS
    // Start from negative Y to show trail behind the current position
    const ypos = (i - totalPoints / 4) * (ITEM_SHIFT / (SLICE_COUNT / 12))

    return { xpos, ypos, zpos }
  })

  return (
    <div className="spiral-container">
      {/* Spiral trajectory line */}
      <div className="spiral-line" ref={spiralLine}>
        {spiralPoints.map((point, index) => (
          <div
            key={`spiral-point-${index}`}
            className="spiral-line-dot"
            style={{
              transform: `translateX(${point.xpos}px) translateZ(${point.zpos}px) translateY(${point.ypos}px)`
            }}
          />
        ))}
      </div>

      <div className="spiral-gallery" ref={el}>
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
                fontFamily: thought.font
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
                fontFamily: selectedThought.font
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
