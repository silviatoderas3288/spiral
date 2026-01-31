import { useState } from 'react'
import axios from 'axios'

function UploadForm({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [text, setText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

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
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedFile) {
      setMessage('Please select an image')
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
        setMessage('Image uploaded successfully!')
        setSelectedFile(null)
        setText('')
        // Reset file input
        e.target.reset()
        // Notify parent component
        onUploadSuccess(response.data.data)
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'Upload failed. Please try again.')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="upload-form-container">
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="image">Choose Image</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {selectedFile && (
            <span className="file-name">{selectedFile.name}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="text">Caption (optional)</label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a caption for your image..."
            rows="3"
            disabled={uploading}
          />
        </div>

        <button type="submit" disabled={uploading || !selectedFile}>
          {uploading ? 'Uploading...' : 'Upload to Spiral'}
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
