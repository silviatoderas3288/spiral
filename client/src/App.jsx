import { useState, useEffect } from 'react'
import axios from 'axios'
import UploadModal from './components/UploadModal'
import SpiralGallery from './components/SpiralGallery'

function App() {
  const [thoughts, setThoughts] = useState([])
  const [filteredThoughts, setFilteredThoughts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch thoughts on mount
  useEffect(() => {
    fetchThoughts()
  }, [])

  // Filter thoughts based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredThoughts(thoughts)
    } else {
      const filtered = thoughts.filter(thought =>
        thought.text?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredThoughts(filtered)
    }
  }, [searchQuery, thoughts])

  const fetchThoughts = async () => {
    try {
      const response = await axios.get('/api/thoughts')
      if (response.data.success) {
        setThoughts(response.data.thoughts)
        setFilteredThoughts(response.data.thoughts)
      }
    } catch (error) {
      console.error('Error fetching thoughts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSuccess = (newThought) => {
    // Add new thought to the top of the list
    setThoughts(prevThoughts => [newThought, ...prevThoughts])
    // Close modal after successful upload
    setShowUploadModal(false)
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleDeleteThought = async (thoughtId) => {
    try {
      const response = await axios.delete(`/api/thoughts/${thoughtId}`)
      if (response.data.success) {
        // Remove the thought from state
        setThoughts(prevThoughts => prevThoughts.filter(t => t.id !== thoughtId))
      }
    } catch (error) {
      console.error('Error deleting thought:', error)
      alert('Failed to delete thought')
    }
  }

  return (
    <div className="app">
      {/* Left Side - Spiral Gallery */}
      <div className="spiral-scene-container">
        {loading ? (
          <div className="loading">Loading thoughts...</div>
        ) : (
          <SpiralGallery images={filteredThoughts} onDeleteThought={handleDeleteThought} />
        )}
      </div>

      {/* Right Side - Controls */}
      <div className="controls-panel">
        <h1>Spiraling thoughts</h1>

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
          <p>{filteredThoughts.length} {filteredThoughts.length === 1 ? 'thought' : 'thoughts'}</p>
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
