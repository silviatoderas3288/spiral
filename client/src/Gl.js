import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import shaders from './shaders.js';

export default class {
  constructor(container) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({
      alpha: true
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(window.innerWidth * 0.75, window.innerHeight);
    this.renderer.setClearColor(0x000000, 1);
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      45,
      (window.innerWidth * 0.75) / window.innerHeight,
      1,
      1000
    );

    this.camera.position.z = 60;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.clock = new THREE.Clock();
    this.speed = 1; // Default speed multiplier
    this.opacity = 1; // Default opacity
  }

  init(thoughts) {
    console.log('Gl.init called with thoughts:', thoughts);
    // Create text from thoughts
    const thoughtText = thoughts.map(t => t.text).join(' ') || 'SPIRALING THOUGHTS';

    console.log('Creating text texture with:', thoughtText);
    // Create a simple canvas-based text texture since we don't have font files
    this.createTextTexture(thoughtText);
  }

  createTextTexture(text, color = '#ffffff', fontSize = 300, fontFamily = 'Arial') {
    // Create canvas for text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 2048;
    canvas.height = 512;

    // Fill with black background
    context.fillStyle = '#000000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Only draw text if there is text to display
    if (text && text.trim()) {
      context.fillStyle = color;
      context.font = `bold ${fontSize}px ${fontFamily}, sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      const displayText = text.toUpperCase().substring(0, 300);
      context.fillText(displayText, canvas.width / 2, canvas.height / 2);
    }

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    // If render target exists, just update the texture
    if (this.rt) {
      if (this.text && this.text.material) {
        this.text.material.map = texture;
        this.text.material.needsUpdate = true;
      }
      this.material.uniforms.uTexture.value = this.rt.texture;
    } else {
      this.createRenderTarget(texture);
      this.createMesh();
      this.animate();
      this.addEvents();
    }
  }

  createRenderTarget(texture) {
    // Render Target setup
    this.rt = new THREE.WebGLRenderTarget(
      window.innerWidth * 0.75,
      window.innerHeight
    );

    this.rtCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    this.rtCamera.position.z = 2.5;

    this.rtScene = new THREE.Scene();
    this.rtScene.background = new THREE.Color('#000000');

    // Create a simple plane with the text texture
    const geometry = new THREE.PlaneGeometry(2, 0.5);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true
    });

    this.text = new THREE.Mesh(geometry, material);
    this.rtScene.add(this.text);
  }

  createMesh() {
    this.geometry = new THREE.TorusKnotGeometry(9, 3, 768, 3, 4, 3);

    this.material = new THREE.ShaderMaterial({
      vertexShader: shaders.vert,
      fragmentShader: shaders.frag,
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: this.rt.texture },
        uOpacity: { value: 1.0 }
      },
      transparent: true
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.scene.add(this.mesh);
  }

  animate() {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    this.render();
  }

  render() {
    this.controls.update();

    // Update time with speed multiplier
    this.material.uniforms.uTime.value = this.clock.getElapsedTime() * this.speed;

    // Draw Render Target
    this.renderer.setRenderTarget(this.rt);
    this.renderer.render(this.rtScene, this.rtCamera);
    this.renderer.setRenderTarget(null);

    this.renderer.render(this.scene, this.camera);
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  setOpacity(opacity) {
    this.opacity = opacity;
    if (this.material && this.material.uniforms.uOpacity) {
      this.material.uniforms.uOpacity.value = opacity;
    }
  }

  setZoom(zoom) {
    if (this.camera) {
      this.camera.position.z = zoom;
    }
  }

  addEvents() {
    window.addEventListener('resize', this.resize.bind(this));
  }

  resize() {
    let width = window.innerWidth * 0.75;
    let height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    window.removeEventListener('resize', this.resize.bind(this));
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
