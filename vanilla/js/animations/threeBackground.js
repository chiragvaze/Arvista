import * as THREE from 'three';
import { gsap } from 'gsap';

/**
 * Premium 3D Background with Three.js
 * Creates a stunning particle field with depth and interactive movement
 */
export class ThreeBackground {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.particles = null;
    this.mouse = { x: 0, y: 0 };
    this.targetRotation = { x: 0, y: 0 };
    
    this.init();
  }

  init() {
    // Setup renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // Position camera
    this.camera.position.z = 50;

    // Create particle system
    this.createParticles();

    // Create geometric shapes
    this.createFloatingShapes();

    // Add lights
    this.addLights();

    // Event listeners
    this.setupEvents();

    // Start animation loop
    this.animate();
  }

  createParticles() {
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const color1 = new THREE.Color(0xD4AF37); // Gold
    const color2 = new THREE.Color(0x7C3AED); // Amethyst

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Random positions
      positions[i3] = (Math.random() - 0.5) * 200;
      positions[i3 + 1] = (Math.random() - 0.5) * 200;
      positions[i3 + 2] = (Math.random() - 0.5) * 100;

      // Gradient colors
      const mixColor = color1.clone().lerp(color2, Math.random());
      colors[i3] = mixColor.r;
      colors[i3 + 1] = mixColor.g;
      colors[i3 + 2] = mixColor.b;

      // Random sizes
      sizes[i] = Math.random() * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  createFloatingShapes() {
    // Create torus
    const torusGeometry = new THREE.TorusGeometry(10, 3, 16, 100);
    const torusMaterial = new THREE.MeshStandardMaterial({
      color: 0xD4AF37,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.3,
      wireframe: true,
    });
    this.torus = new THREE.Mesh(torusGeometry, torusMaterial);
    this.torus.position.set(-30, 20, -20);
    this.scene.add(this.torus);

    // Create icosahedron
    const icoGeometry = new THREE.IcosahedronGeometry(8, 0);
    const icoMaterial = new THREE.MeshStandardMaterial({
      color: 0x7C3AED,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.3,
      wireframe: true,
    });
    this.icosahedron = new THREE.Mesh(icoGeometry, icoMaterial);
    this.icosahedron.position.set(30, -20, -30);
    this.scene.add(this.icosahedron);

    // Create octahedron
    const octaGeometry = new THREE.OctahedronGeometry(6, 0);
    const octaMaterial = new THREE.MeshStandardMaterial({
      color: 0xD4AF37,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.4,
    });
    this.octahedron = new THREE.Mesh(octaGeometry, octaMaterial);
    this.octahedron.position.set(0, 0, -40);
    this.scene.add(this.octahedron);
  }

  addLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Point lights
    const light1 = new THREE.PointLight(0xD4AF37, 1, 100);
    light1.position.set(50, 50, 50);
    this.scene.add(light1);

    const light2 = new THREE.PointLight(0x7C3AED, 1, 100);
    light2.position.set(-50, -50, 50);
    this.scene.add(light2);
  }

  setupEvents() {
    // Mouse move for parallax
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.targetRotation.x = this.mouse.y * 0.5;
      this.targetRotation.y = this.mouse.x * 0.5;
    });

    // Window resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.0001;

    // Rotate particles
    if (this.particles) {
      this.particles.rotation.y += 0.0005;
      
      // Smooth camera movement
      this.camera.rotation.x += (this.targetRotation.x - this.camera.rotation.x) * 0.05;
      this.camera.rotation.y += (this.targetRotation.y - this.camera.rotation.y) * 0.05;
    }

    // Animate shapes
    if (this.torus) {
      this.torus.rotation.x += 0.01;
      this.torus.rotation.y += 0.01;
      this.torus.position.y = Math.sin(time * 2) * 5;
    }

    if (this.icosahedron) {
      this.icosahedron.rotation.x -= 0.005;
      this.icosahedron.rotation.z += 0.01;
      this.icosahedron.position.y = Math.cos(time * 2) * 5;
    }

    if (this.octahedron) {
      this.octahedron.rotation.y += 0.02;
      this.octahedron.position.z = -40 + Math.sin(time * 3) * 10;
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
