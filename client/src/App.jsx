import { useState, useEffect } from 'react'
import axios from 'axios'
import UploadModal from './components/UploadModal'
import SpiralGallery from './components/SpiralGallery'

function App() {
  const [images, setImages] = useState([])
  const [filteredImages, setFilteredImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch images on mount
  useEffect(() => {
    fetchImages()
  }, [])

  // Filter images based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredImages(images)
    } else {
      const filtered = images.filter(img =>
        img.text?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredImages(filtered)
    }
  }, [searchQuery, images])

  const fetchImages = async () => {
    try {
      const response = await axios.get('/api/images')
      if (response.data.success) {
        setImages(response.data.images)
        setFilteredImages(response.data.images)
      }
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSuccess = (newImage) => {
    // Add new image to the top of the list
    setImages(prevImages => [newImage, ...prevImages])
    // Close modal after successful upload
    setShowUploadModal(false)
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className="app">
      {/* Left Side - Spiral Gallery */}
      <div className="spiral-scene-container">
        {loading ? (
          <div className="loading">Loading thoughts...</div>
        ) : (
          <SpiralGallery images={filteredImages} />
        )}
      </div>

      {/* Right Side - Controls */}
      <div className="controls-panel">
        <h1>Thought Spiral</h1>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search thoughts..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        <button
          className="add-thought-button"
          onClick={() => setShowUploadModal(true)}
          aria-label="Add Thought"
        >
          + Add Thought
        </button>

        <div className="stats">
          <p>{filteredImages.length} {filteredImages.length === 1 ? 'thought' : 'thoughts'}</p>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onUploadSuccess={handleUploadSuccess}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </div>
  )
}

export default App
