import { useEffect, useRef, useCallback } from 'react'
import Gl from '../Gl'

const KineticSpiral = ({ thoughts, liveText, liveColor, liveFontSize, liveFont, speed, opacity, zoom, onZoomChange }) => {
  const containerRef = useRef(null)
  const glRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    const gl = new Gl(containerRef.current, onZoomChange)
    glRef.current = gl
    gl.init(thoughts)

    return () => {
      if (glRef.current) {
        glRef.current.destroy()
      }
    }
  }, [])

  useEffect(() => {
    // Update speed when it changes
    if (glRef.current) {
      glRef.current.setSpeed(speed)
    }
  }, [speed])

  useEffect(() => {
    // Update opacity when it changes
    if (glRef.current) {
      glRef.current.setOpacity(opacity)
    }
  }, [opacity])

  useEffect(() => {
    // Update zoom when it changes
    if (glRef.current) {
      glRef.current.setZoom(zoom)
    }
  }, [zoom])

  useEffect(() => {
    // Update when liveText, liveColor, liveFontSize, or liveFont changes (real-time updates)
    if (glRef.current) {
      glRef.current.createTextTexture(liveText, liveColor, liveFontSize, liveFont)
    }
  }, [liveText, liveColor, liveFontSize, liveFont])

  useEffect(() => {
    // Update when thoughts are added (after submission)
    if (glRef.current && thoughts.length > 0 && !liveText) {
      const thoughtText = thoughts.map(t => t.text).join(' ')
      glRef.current.createTextTexture(thoughtText)
    }
  }, [thoughts])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}

export default KineticSpiral
