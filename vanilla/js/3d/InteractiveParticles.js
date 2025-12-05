// Interactive Mouse-Following Particle System
import * as THREE from 'three';

export class InteractiveParticles {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = null;
    this.particleCount = 3000;
    this.mouse = { x: 0, y: 0 };
    this.targetMouse = { x: 0, y: 0 };
    this.isActive = false;
    
    this.init();
  }
  
  init() {
    // Create scene
    this.scene = new THREE.Scene();
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 50;
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.domElement.style.position = 'fixed';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';
    this.renderer.domElement.style.pointerEvents = 'none';
    this.renderer.domElement.style.zIndex = '1';
    
    document.body.prepend(this.renderer.domElement);
    
    // Create particles
    this.createParticles();
    
    // Event listeners
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('resize', () => this.onResize());
    
    this.isActive = true;
    this.animate();
  }
  
  createParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);
    const sizes = new Float32Array(this.particleCount);
    
    const color1 = new THREE.Color(0xFFD700);
    const color2 = new THREE.Color(0x7C3AED);
    
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      
      // Position
      positions[i3] = (Math.random() - 0.5) * 100;
      positions[i3 + 1] = (Math.random() - 0.5) * 100;
      positions[i3 + 2] = (Math.random() - 0.5) * 50;
      
      // Color (gradient between gold and purple)
      const mixColor = color1.clone().lerp(color2, Math.random());
      colors[i3] = mixColor.r;
      colors[i3 + 1] = mixColor.g;
      colors[i3 + 2] = mixColor.b;
      
      // Size
      sizes[i] = Math.random() * 2 + 0.5;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
    
    // Store original positions
    this.originalPositions = positions.slice();
  }
  
  onMouseMove(event) {
    this.targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
  
  animate() {
    if (!this.isActive) return;
    
    requestAnimationFrame(() => this.animate());
    
    // Smooth mouse follow
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;
    
    // Update particle positions
    const positions = this.particles.geometry.attributes.position.array;
    const time = Date.now() * 0.0005;
    
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      
      // Get original position
      const originalX = this.originalPositions[i3];
      const originalY = this.originalPositions[i3 + 1];
      const originalZ = this.originalPositions[i3 + 2];
      
      // Calculate distance from mouse
      const dx = (this.mouse.x * 50) - originalX;
      const dy = (this.mouse.y * 50) - originalY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Repulsion force
      const force = Math.max(0, 1 - distance / 30);
      const angle = Math.atan2(dy, dx);
      
      // Apply wave motion
      const wave = Math.sin(time + i * 0.1) * 0.5;
      
      // Update position
      positions[i3] = originalX - Math.cos(angle) * force * 10 + wave;
      positions[i3 + 1] = originalY - Math.sin(angle) * force * 10 + Math.cos(time + i * 0.05) * 0.5;
      positions[i3 + 2] = originalZ + Math.sin(time + i * 0.08) * 2;
    }
    
    this.particles.geometry.attributes.position.needsUpdate = true;
    
    // Rotate entire particle system slightly
    this.particles.rotation.y = this.mouse.x * 0.1;
    this.particles.rotation.x = -this.mouse.y * 0.1;
    
    this.renderer.render(this.scene, this.camera);
  }
  
  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  destroy() {
    this.isActive = false;
    
    if (this.renderer) {
      document.body.removeChild(this.renderer.domElement);
      this.renderer.dispose();
    }
    
    if (this.particles) {
      this.particles.geometry.dispose();
      this.particles.material.dispose();
    }
  }
}
