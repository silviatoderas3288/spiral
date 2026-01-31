import { useState, useRef } from 'react'
import axios from 'axios'

function UploadModal({ onUploadSuccess, onClose }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [text, setText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setMessage('Please select an image file')
        return
      }
      // Check file size (5MB)
      if (file.size > 5242880) {
        setMessage('File size must be less than 5MB')
        return
      }
      setSelectedFile(file)
      setMessage('')

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedFile) {
      setMessage('Please select an image')
      return
    }

    if (!text.trim()) {
      setMessage('Please add a caption for your thought')
      return
    }

    setUploading(true)
    setMessage('')

    const formData = new FormData()
    formData.append('image', selectedFile)
    formData.append('text', text)

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        // Notify parent component
        onUploadSuccess(response.data.data)
        // Modal will close automatically via parent
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'Upload failed. Please try again.')
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
          <div className="image-upload-area">
            {previewUrl ? (
              <div className="image-preview">
                <img src={previewUrl} alt="Preview" />
                <button
                  type="button"
                  className="change-image-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change Image
                </button>
              </div>
            ) : (
              <div
                className="upload-placeholder"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="upload-icon">📷</div>
                <p>Click to select an image</p>
                <p className="upload-hint">or drag and drop</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              id="image"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="text">Caption (required) *</label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your thought..."
              rows="3"
              disabled={uploading}
              required
            />
          </div>

          <button
            type="submit"
            className="upload-button"
            disabled={uploading || !selectedFile || !text.trim()}
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
