const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'image-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(',');

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB default
  }
});

// POST /api/upload - Upload image with text
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const imageData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      text: req.body.text || '',
      timestamp: Date.now(),
      url: `/uploads/${req.file.filename}`
    };

    // Read existing images data
    const imagesJsonPath = path.join(__dirname, '../data/images.json');
    const data = JSON.parse(fs.readFileSync(imagesJsonPath, 'utf8'));

    // Add new image to the beginning (top of spiral)
    data.images.unshift(imageData);

    // Save updated data
    fs.writeFileSync(imagesJsonPath, JSON.stringify(data, null, 2));

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: imageData
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/images - Get all images
router.get('/images', (req, res) => {
  try {
    const imagesJsonPath = path.join(__dirname, '../data/images.json');
    const data = JSON.parse(fs.readFileSync(imagesJsonPath, 'utf8'));

    res.json({
      success: true,
      count: data.images.length,
      images: data.images
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/images/:filename - Delete an image (optional, for admin)
router.delete('/images/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const imagesJsonPath = path.join(__dirname, '../data/images.json');
    const imagePath = path.join(__dirname, '../uploads', filename);

    // Read existing images data
    const data = JSON.parse(fs.readFileSync(imagesJsonPath, 'utf8'));

    // Filter out the image
    data.images = data.images.filter(img => img.filename !== filename);

    // Save updated data
    fs.writeFileSync(imagesJsonPath, JSON.stringify(data, null, 2));

    // Delete the file
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
