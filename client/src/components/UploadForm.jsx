import { useState } from 'react'
import axios from 'axios'

function UploadForm({ onUploadSuccess }) {
  const [text, setText] = useState('')
  const [color, setColor] = useState('#000000')
  const [font, setFont] = useState('Arial')
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
    'Palatino'
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
        font: font
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success) {
        setMessage('Thought added successfully!')
        setText('')
        setColor('#000000')
        setFont('Arial')
        // Notify parent component
        onUploadSuccess(response.data.data)
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to add thought. Please try again.')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="upload-form-container">
      <form onSubmit={handleSubmit} className="upload-form">
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
          <select
            id="font"
            value={font}
            onChange={(e) => setFont(e.target.value)}
            disabled={uploading}
          >
            {availableFonts.map(fontName => (
              <option key={fontName} value={fontName} style={{ fontFamily: fontName }}>
                {fontName}
              </option>
            ))}
          </select>
        </div>

        <div className="preview-group">
          <label>Preview</label>
          <div
            className="text-preview"
            style={{
              color: color,
              fontFamily: font,
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              minHeight: '50px'
            }}
          >
            {text || 'Your thought will appear here...'}
          </div>
        </div>

        <button type="submit" disabled={uploading || !text.trim()}>
          {uploading ? 'Adding...' : 'Add to Spiral'}
        </button>

        {message && (
          <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  )
}

export default UploadForm
