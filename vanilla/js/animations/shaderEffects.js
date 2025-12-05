import * as THREE from 'three';
import { gsap } from 'gsap';

/**
 * WebGL Image Distortion Effects
 * Creates stunning shader-based image transitions and hover effects
 */

// Custom vertex shader
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float uTime;
  uniform vec2 uMouse;
  
  void main() {
    vUv = uv;
    vPosition = position;
    
    vec3 pos = position;
    
    // Wave distortion on hover
    float dist = distance(uMouse, uv);
    float wave = sin(dist * 10.0 - uTime * 2.0) * 0.05;
    pos.z += wave * (1.0 - dist);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Custom fragment shader with RGB shift and distortion
const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;
  varying vec2 vUv;
  
  // Noise function
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  
  void main() {
    vec2 uv = vUv;
    
    // Distance from mouse
    float dist = distance(uMouse, uv);
    
    // Hover distortion
    vec2 distortion = vec2(0.0);
    if (uHover > 0.1) {
      float noise = snoise(uv * 5.0 + uTime * 0.5);
      distortion = vec2(
        noise * 0.02 * uHover,
        noise * 0.02 * uHover
      );
      
      // Circular wave from mouse
      float wave = sin(dist * 20.0 - uTime * 3.0) * 0.01 * uHover;
      distortion += wave;
    }
    
    // RGB split effect
    float rgbShift = uHover * 0.02;
    vec2 uvR = uv + distortion + vec2(rgbShift, 0.0);
    vec2 uvG = uv + distortion;
    vec2 uvB = uv + distortion - vec2(rgbShift, 0.0);
    
    float r = texture2D(uTexture, uvR).r;
    float g = texture2D(uTexture, uvG).g;
    float b = texture2D(uTexture, uvB).b;
    
    vec3 color = vec3(r, g, b);
    
    // Brightness boost on hover
    color += uHover * 0.15;
    
    // Vignette effect
    float vignette = 1.0 - dist * 0.5;
    color *= vignette;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

/**
 * WebGL Image Renderer with shader effects
 */
export class ShaderImage {
  constructor(imageElement) {
    this.imageElement = imageElement;
    this.canvas = document.createElement('canvas');
    this.imageElement.parentNode.insertBefore(this.canvas, this.imageElement);
    this.imageElement.style.display = 'none';

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
    });

    this.mouse = { x: 0.5, y: 0.5 };
    this.hover = 0;
    this.time = 0;

    this.init();
  }

  init() {
    // Set canvas size
    const rect = this.imageElement.getBoundingClientRect();
    this.renderer.setSize(rect.width, rect.height);
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';

    // Load texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(this.imageElement.src);

    // Create plane with custom shader
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: texture },
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uHover: { value: 0 },
      },
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);

    // Events
    this.setupEvents();

    // Start animation
    this.animate();
  }

  setupEvents() {
    this.canvas.addEventListener('mouseenter', () => {
      gsap.to(this, {
        hover: 1,
        duration: 0.8,
        ease: 'power2.out',
      });
    });

    this.canvas.addEventListener('mouseleave', () => {
      gsap.to(this, {
        hover: 0,
        duration: 1,
        ease: 'power2.out',
      });
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - rect.left) / rect.width;
      this.mouse.y = 1.0 - (e.clientY - rect.top) / rect.height;
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.time += 0.016;

    // Update shader uniforms
    this.mesh.material.uniforms.uTime.value = this.time;
    this.mesh.material.uniforms.uMouse.value.set(this.mouse.x, this.mouse.y);
    this.mesh.material.uniforms.uHover.value = this.hover;

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    this.renderer.dispose();
    this.canvas.remove();
    this.imageElement.style.display = '';
  }
}

/**
 * Initialize WebGL effects on all gallery images
 */
export function initShaderEffects() {
  const images = document.querySelectorAll('.gallery-item img');
  const shaderImages = [];

  images.forEach((img) => {
    // Wait for image to load
    if (img.complete) {
      shaderImages.push(new ShaderImage(img));
    } else {
      img.addEventListener('load', () => {
        shaderImages.push(new ShaderImage(img));
      });
    }
  });

  return shaderImages;
}

/**
 * Liquid distortion effect for page transitions
 */
export class LiquidTransition {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '9999';
    document.body.appendChild(this.canvas);

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.progress = 0;
  }

  transition(duration = 1.5) {
    return new Promise((resolve) => {
      const liquidShader = `
        uniform float uProgress;
        varying vec2 vUv;
        
        void main() {
          vec2 uv = vUv;
          float dist = length(uv - vec2(0.5));
          float liquid = sin(dist * 20.0 - uProgress * 10.0) * 0.5 + 0.5;
          
          float alpha = smoothstep(0.0, 1.0, uProgress) * (1.0 - liquid);
          gl_FragColor = vec4(0.082, 0.075, 0.11, alpha);
        }
      `;

      // Animate transition
      gsap.to(this, {
        progress: 1,
        duration,
        ease: 'power2.inOut',
        onComplete: () => {
          this.progress = 0;
          resolve();
        },
      });
    });
  }

  destroy() {
    this.canvas.remove();
  }
}
