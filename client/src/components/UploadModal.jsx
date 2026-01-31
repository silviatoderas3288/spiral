import { useState } from 'react'
import axios from 'axios'
import FontSelector from './FontSelector'

function UploadModal({ onUploadSuccess, onClose }) {
  const [text, setText] = useState('')
  const [color, setColor] = useState('#ffffff')
  const [font, setFont] = useState('Arial')
  const [fontSize, setFontSize] = useState(18)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const availableFonts = [
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
        // Notify parent component
        onUploadSuccess(response.data.data)
        // Modal will close automatically via parent
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to add thought. Please try again.')
      console.error('Upload error:', error)
      setUploading(false)
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <h2>Add Your Thought</h2>

        <form onSubmit={handleSubmit} className="upload-form-modal">
          <div className="form-group">
            <label htmlFor="text">Your Thought</label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your thought..."
              rows="4"
              disabled={uploading}
              maxLength="500"
            />
            <small>{text.length}/500 characters</small>
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
              min="10"
              max="30"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              disabled={uploading}
              className="font-size-slider"
            />
            <div className="font-size-labels">
              <span>10</span>
              <span>30</span>
            </div>
          </div>

          <div className="preview-group">
            <label>Preview</label>
            <div
              className="text-preview"
              style={{
                color: color,
                fontFamily: font,
                fontSize: `${fontSize}px`,
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                minHeight: '50px'
              }}
            >
              {text || 'Your thought will appear here...'}
            </div>
          </div>

          <button
            type="submit"
            className="upload-button"
            disabled={uploading || !text.trim()}
          >
            {uploading ? 'Adding...' : 'Add to Spiral'}
          </button>

          {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default UploadModal
