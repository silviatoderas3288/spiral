import { useState, useEffect } from 'react'
import axios from 'axios'
import ThreeSpiral from './components/ThreeSpiral'
import UploadModal from './components/UploadModal'

function App() {
  const [thoughts, setThoughts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)

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

  const handleUploadSuccess = (newThought) => {
    setThoughts(prevThoughts => [newThought, ...prevThoughts])
    setShowUploadModal(false)
  }

  const handleDeleteThought = async (thoughtId) => {
    try {
      const response = await axios.delete(`/api/thoughts/${thoughtId}`)
      if (response.data.success) {
        setThoughts(prevThoughts => prevThoughts.filter(t => t.id !== thoughtId))
      }
    } catch (error) {
      console.error('Error deleting thought:', error)
      alert('Failed to delete thought')
    }
  }

  return (
    <div className="app">
      {/* Left Side - Three.js Spiral */}
      <div className="spiral-scene-container">
        {loading ? (
          <div className="loading">Loading thoughts...</div>
        ) : (
          <ThreeSpiral thoughts={thoughts} onDeleteThought={handleDeleteThought} />
        )}
      </div>

      {/* Right Side - Sidebar */}
      <div className="sidebar">
        <h1>Spiraling thoughts</h1>

        <button
          className="add-thought-button"
          onClick={() => setShowUploadModal(true)}
          aria-label="Add Thought"
        >
          + Add Thought
        </button>

        <div className="stats">
          <p className="stats-label">Thought count</p>
          <p className="stats-value">{thoughts.length} {thoughts.length === 1 ? 'thought' : 'thoughts'}</p>
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
