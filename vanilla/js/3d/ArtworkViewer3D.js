// 3D Artwork Viewer
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class ArtworkViewer3D {
  constructor(container, imageUrl) {
    this.container = container;
    this.imageUrl = imageUrl;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.artwork = null;
    this.isActive = false;
    
    this.init();
  }
  
  init() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0A0612);
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.container.offsetWidth / this.container.offsetHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);
    
    // Add orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 10;
    
    // Add lights
    this.addLights();
    
    // Load artwork
    this.loadArtwork();
    
    // Add particles
    this.addParticles();
    
    // Handle resize
    window.addEventListener('resize', () => this.onResize());
    
    // Start animation
    this.animate();
  }
  
  addLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);
    
    // Directional lights for better depth
    const light1 = new THREE.DirectionalLight(0xFFD700, 0.8);
    light1.position.set(5, 5, 5);
    this.scene.add(light1);
    
    const light2 = new THREE.DirectionalLight(0x7C3AED, 0.5);
    light2.position.set(-5, -5, -5);
    this.scene.add(light2);
    
    // Point light for dramatic effect
    const pointLight = new THREE.PointLight(0xFFD700, 1, 100);
    pointLight.position.set(0, 0, 3);
    this.scene.add(pointLight);
  }
  
  loadArtwork() {
    const textureLoader = new THREE.TextureLoader();
    
    textureLoader.load(
      this.imageUrl,
      (texture) => {
        // Calculate aspect ratio
        const aspect = texture.image.width / texture.image.height;
        
        // Create geometry based on aspect ratio
        const geometry = new THREE.PlaneGeometry(3 * aspect, 3);
        
        // Create material with the texture
        const material = new THREE.MeshStandardMaterial({
          map: texture,
          metalness: 0.3,
          roughness: 0.4,
          emissive: 0x111111,
          emissiveIntensity: 0.2
        });
        
        // Create mesh
        this.artwork = new THREE.Mesh(geometry, material);
        this.scene.add(this.artwork);
        
        // Add frame
        this.addFrame(aspect);
        
        this.isActive = true;
      },
      undefined,
      (error) => {
        console.error('Error loading texture:', error);
      }
    );
  }
  
  addFrame(aspect) {
    const frameDepth = 0.1;
    const frameWidth = 0.15;
    
    // Frame material (gold)
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFD700,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xFFD700,
      emissiveIntensity: 0.1
    });
    
    const width = 3 * aspect + frameWidth * 2;
    const height = 3 + frameWidth * 2;
    
    // Top frame
    const topGeometry = new THREE.BoxGeometry(width, frameWidth, frameDepth);
    const topFrame = new THREE.Mesh(topGeometry, frameMaterial);
    topFrame.position.y = height / 2 - frameWidth / 2;
    topFrame.position.z = -frameDepth / 2;
    this.scene.add(topFrame);
    
    // Bottom frame
    const bottomFrame = new THREE.Mesh(topGeometry, frameMaterial);
    bottomFrame.position.y = -height / 2 + frameWidth / 2;
    bottomFrame.position.z = -frameDepth / 2;
    this.scene.add(bottomFrame);
    
    // Left frame
    const sideGeometry = new THREE.BoxGeometry(frameWidth, height, frameDepth);
    const leftFrame = new THREE.Mesh(sideGeometry, frameMaterial);
    leftFrame.position.x = -width / 2 + frameWidth / 2;
    leftFrame.position.z = -frameDepth / 2;
    this.scene.add(leftFrame);
    
    // Right frame
    const rightFrame = new THREE.Mesh(sideGeometry, frameMaterial);
    rightFrame.position.x = width / 2 - frameWidth / 2;
    rightFrame.position.z = -frameDepth / 2;
    this.scene.add(rightFrame);
  }
  
  addParticles() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const positions = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 20;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xFFD700,
      size: 0.02,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(particles);
    
    // Animate particles
    this.particles = particles;
  }
  
  animate() {
    if (!this.isActive) return;
    
    requestAnimationFrame(() => this.animate());
    
    // Update controls
    this.controls.update();
    
    // Rotate particles slowly
    if (this.particles) {
      this.particles.rotation.y += 0.0005;
      this.particles.rotation.x += 0.0003;
    }
    
    // Subtle artwork rotation
    if (this.artwork) {
      this.artwork.rotation.y = Math.sin(Date.now() * 0.0001) * 0.02;
    }
    
    // Render
    this.renderer.render(this.scene, this.camera);
  }
  
  onResize() {
    this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
  }
  
  destroy() {
    this.isActive = false;
    
    // Clean up
    if (this.controls) this.controls.dispose();
    if (this.renderer) {
      this.container.removeChild(this.renderer.domElement);
      this.renderer.dispose();
    }
    
    // Clean up scene
    this.scene?.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }
}
