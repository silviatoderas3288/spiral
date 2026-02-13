import { useState, useEffect } from 'react'
import axios from 'axios'
import KineticSpiral from './components/KineticSpiral'
import FontSelector from './components/FontSelector'

function App() {
  const [thoughts, setThoughts] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('spiraling thoughts')
  const [color, setColor] = useState('#ffffff')
  const [font, setFont] = useState('Brawler')
  const [fontSize, setFontSize] = useState(300)
  const [speed, setSpeed] = useState(1)
  const [opacity, setOpacity] = useState(1)
  const [zoom, setZoom] = useState(60)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const availableFonts = [
    'Brawler',
    'Arial',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Verdana',
    'Comic Sans MS',
    'Impact',
    'Trebuchet MS',
    'Lucida Console',
    'Palatino',
    'Brush Script MT',
    'Lucida Handwriting',
    'Copperplate',
    'Papyrus',
    'Garamond',
    'Bookman',
    'Arial Black',
    'Century Gothic',
    'Franklin Gothic Medium',
    'Gill Sans',
    'Helvetica',
    'Optima',
    'Rockwell',
    'Didot',
    'Bodoni MT',
    'Baskerville',
    'Futura',
    'Consolas',
    'Monaco',
    'Andale Mono',
    'Luminari',
    'Chalkduster',
    'Bradley Hand',
    'Marker Felt',
    'Zapfino',
    'American Typewriter',
    'Courier',
    'Herculanum',
    'Snell Roundhand',
    'Trattatello'
  ]

  // Fetch thoughts on mount
  useEffect(() => {
    fetchThoughts()
  }, [])

  const fetchThoughts = async () => {
    try {
      const response = await axios.get('/api/thoughts')
      if (response.data.success) {
        setThoughts(response.data.thoughts)
      }
    } catch (error) {
      console.error('Error fetching thoughts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!text.trim()) {
      setMessage('Please enter your thought')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      const response = await axios.post('/api/upload', {
        text: text.trim(),
        color: color,
        font: font,
        fontSize: fontSize
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success) {
        setThoughts(prevThoughts => [response.data.data, ...prevThoughts])
        setText('spiraling thoughts')
        setColor('#ffffff')
        setFont('Brawler')
        setFontSize(300)
        setMessage('Thought added successfully!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to add thought. Please try again.')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="app">
      {/* Left Side - Sidebar */}
      <div className="sidebar">
        <h1>Spiraling thoughts</h1>

        <form onSubmit={handleSubmit} className="upload-form-sidebar">
          <div className="form-group">
            <label htmlFor="text">Your Thought</label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your thought..."
              rows="2"
              disabled={uploading}
              maxLength="300"
            />
            <small>{text.length}/300 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="color">Text Color</label>
            <div className="color-picker-wrapper">
              <input
                type="color"
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={uploading}
              />
              <span className="color-value">{color}</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="font">Font Style</label>
            <FontSelector
              value={font}
              onChange={setFont}
              disabled={uploading}
              fonts={availableFonts}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fontSize">Font Size: {fontSize}px</label>
            <input
              type="range"
              id="fontSize"
              min="60"
              max="400"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              disabled={uploading}
              className="font-size-slider"
            />
            <div className="font-size-labels">
              <span>60</span>
              <span>400</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="speed">Animation Speed: {speed.toFixed(1)}x</label>
            <input
              type="range"
              id="speed"
              min="0.1"
              max="5"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="font-size-slider"
            />
            <div className="font-size-labels">
              <span>0.1x</span>
              <span>5x</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="opacity">Text Opacity: {Math.round(opacity * 100)}%</label>
            <input
              type="range"
              id="opacity"
              min="0"
              max="1"
              step="0.01"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="font-size-slider"
            />
            <div className="font-size-labels">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="zoom">Zoom Level: {zoom}</label>
            <input
              type="range"
              id="zoom"
              min="20"
              max="150"
              step="1"
              value={170 - zoom}
              onChange={(e) => setZoom(170 - Number(e.target.value))}
              className="font-size-slider"
            />
            <div className="font-size-labels">
              <span>Far</span>
              <span>Close</span>
            </div>
          </div>

          {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </form>
      </div>

      {/* Right Side - Kinetic Spiral */}
      <div className="spiral-scene-container">
        {loading ? (
          <div className="loading">Loading thoughts...</div>
        ) : (
          <KineticSpiral thoughts={thoughts} liveText={text} liveColor={color} liveFontSize={fontSize} liveFont={font} speed={speed} opacity={opacity} zoom={zoom} />
        )}
      </div>
    </div>
  )
}

export default App
