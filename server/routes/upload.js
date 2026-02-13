const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// POST /api/upload - Add a thought with text, color, and font
router.post('/upload', express.json(), (req, res) => {
  try {
    const { text, color, font, fontSize } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    if (text.trim().length > 300) {
      return res.status(400).json({ success: false, error: 'Text must be 300 characters or less' });
    }

    if (!color) {
      return res.status(400).json({ success: false, error: 'Color is required' });
    }

    if (!font) {
      return res.status(400).json({ success: false, error: 'Font is required' });
    }

    const thoughtData = {
      id: Date.now() + '-' + Math.round(Math.random() * 1E9),
      text: text.trim(),
      color: color,
      font: font,
      fontSize: fontSize || 18,
      timestamp: Date.now()
    };

    // Read existing thoughts data
    const thoughtsJsonPath = path.join(__dirname, '../data/thoughts.json');
    const data = JSON.parse(fs.readFileSync(thoughtsJsonPath, 'utf8'));

    // Add new thought to the beginning (top of spiral)
    data.thoughts.unshift(thoughtData);

    // Save updated data
    fs.writeFileSync(thoughtsJsonPath, JSON.stringify(data, null, 2));

    res.json({
      success: true,
      message: 'Thought added successfully',
      data: thoughtData
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/thoughts - Get all thoughts
router.get('/thoughts', (req, res) => {
  try {
    const thoughtsJsonPath = path.join(__dirname, '../data/thoughts.json');
    const data = JSON.parse(fs.readFileSync(thoughtsJsonPath, 'utf8'));

    res.json({
      success: true,
      count: data.thoughts.length,
      thoughts: data.thoughts
    });
  } catch (error) {
    console.error('Error fetching thoughts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/thoughts/:id - Delete a thought
router.delete('/thoughts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const thoughtsJsonPath = path.join(__dirname, '../data/thoughts.json');

    // Read existing thoughts data
    const data = JSON.parse(fs.readFileSync(thoughtsJsonPath, 'utf8'));

    // Filter out the thought
    data.thoughts = data.thoughts.filter(thought => thought.id !== id);

    // Save updated data
    fs.writeFileSync(thoughtsJsonPath, JSON.stringify(data, null, 2));

    res.json({ success: true, message: 'Thought deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
