# Spiral Image Gallery

An interactive 3D visualization where user-uploaded images flow along a dynamic conical spiral that continuously rotates and morphs between cone and inverse cone shapes.

## Project Overview

This web application allows visitors to:
- Upload images to the gallery
- Submit text content along with images
- View all submissions arranged on a rotating 3D conical spiral
- Experience smooth scrolling that morphs the spiral shape (cone → inverse cone → cone)

## Architecture

### Frontend
- **Technology**: React 18 with Vite
- **3D Rendering**: Three.js with @react-three/fiber and @react-three/drei
- **Key Features**:
  - Image upload form with text input
  - 3D canvas for spiral visualization
  - Responsive design
  - Real-time spiral animation
  - Component-based architecture

### Backend
- **Technology**: Node.js with Express.js
- **Storage**: File system for images + JSON for metadata
- **API Endpoints**:
  - `POST /api/upload` - Upload image with text
  - `GET /api/images` - Retrieve all images and metadata
  - `GET /uploads/:filename` - Serve uploaded images

### Server
- **Web Server**: Express.js
- **File Upload**: Multer middleware
- **CORS**: Enabled for development

## Directory Structure

```
spiral/
├── README.md
├── package.json            # Root package.json for scripts
├── server/
│   ├── package.json        # Server dependencies
│   ├── server.js           # Express server
│   ├── routes/
│   │   └── upload.js       # Upload routes
│   ├── uploads/            # Uploaded images storage
│   └── data/
│       └── images.json     # Image metadata
└── client/
    ├── package.json        # Client dependencies
    ├── vite.config.js      # Vite configuration
    ├── index.html          # Entry HTML
    ├── public/             # Static assets
    └── src/
        ├── App.jsx         # Main App component
        ├── main.jsx        # React entry point
        ├── components/
        │   ├── UploadForm.jsx      # Image upload form
        │   ├── SpiralScene.jsx     # Three.js spiral scene
        │   └── ImageSpiral.jsx     # Spiral visualization logic
        └── styles/
            └── App.css     # Global styles
```

## Spiral Visualization Concept

### Mathematical Model
- **Base Shape**: Conical helix (spiral wrapped around a cone)
- **Dynamic Morphing**: Cone radius varies with scroll position
  - `r(t) = r_base × |sin(scroll_factor × t)|`
  - Creates alternating cone/inverse cone pattern
- **Rotation**: Continuous rotation around Y-axis
- **Image Placement**: New images added at the top of the spiral

### Technical Implementation
1. **Parametric Equations** for spiral path:
   - `x(t) = r(t) × cos(θ(t))`
   - `y(t) = height × t` (vertical position)
   - `z(t) = r(t) × sin(θ(t))`

2. **Image Rendering**:
   - Each image as a texture-mapped plane
   - Billboard effect (always faces camera)
   - Fade in/out based on visibility

3. **Scroll Interaction**:
   - Scroll controls cone morphing factor
   - Smooth interpolation between states
   - New images appear at spiral apex

## Installation

```bash
# Install all dependencies (root, server, and client)
npm install

# Development mode (runs both server and client)
npm run dev

# Production mode
npm run build
npm start
```

## Dependencies

### Backend
- `express` - Web framework
- `multer` - File upload handling
- `cors` - CORS middleware
- `dotenv` - Environment configuration

### Frontend
- `react` - UI library
- `react-dom` - React DOM rendering
- `@react-three/fiber` - React renderer for Three.js
- `@react-three/drei` - Useful helpers for R3F
- `three` - 3D graphics library
- `axios` - HTTP client

## API Documentation

### Upload Image
```
POST /api/upload
Content-Type: multipart/form-data

Body:
  - image: File (required)
  - text: String (optional)

Response:
  {
    "success": true,
    "filename": "image_1234567890.jpg",
    "text": "User submitted text",
    "timestamp": 1234567890
  }
```

### Get All Images
```
GET /api/images

Response:
  {
    "images": [
      {
        "filename": "image_1234567890.jpg",
        "text": "User text",
        "timestamp": 1234567890,
        "url": "/uploads/image_1234567890.jpg"
      }
    ]
  }
```

## Configuration

Environment variables (`.env`):
```
PORT=3000
MAX_FILE_SIZE=5242880  # 5MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
```

## Development Roadmap

### Phase 1: Basic Setup ✓
- Project structure
- Basic frontend and backend
- File upload functionality

### Phase 2: 3D Visualization
- Three.js scene setup
- Basic spiral generation
- Image texture loading

### Phase 3: Advanced Features
- Scroll-based morphing animation
- Smooth transitions
- Performance optimization

### Phase 4: Polish
- Responsive design
- Error handling
- Loading states
- User feedback

## Technical Considerations

### Performance
- Lazy loading for images
- Texture optimization
- Efficient geometry updates
- RequestAnimationFrame for smooth animation

### Browser Compatibility
- WebGL support required
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Fallback UI for unsupported browsers

### Security
- File type validation
- File size limits
- Sanitize user input
- Rate limiting on uploads

## Future Enhancements
- User authentication
- Image moderation
- Social sharing
- Multiple spiral themes
- VR/AR support
- Real-time collaborative viewing
- Image search and filtering
- Database integration (MongoDB/PostgreSQL)
