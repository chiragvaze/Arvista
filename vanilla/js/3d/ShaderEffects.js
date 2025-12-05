// Advanced WebGL Shader Effects
import * as THREE from 'three';

export class ShaderEffects {
  static rippleShader = {
    uniforms: {
      tDiffuse: { value: null },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uRipple: { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uRipple;
      varying vec2 vUv;
      
      void main() {
        vec2 uv = vUv;
        
        // Distance from mouse
        float dist = distance(uv, uMouse);
        
        // Ripple effect
        float ripple = sin(dist * 30.0 - uTime * 3.0) * 0.01 * uRipple;
        ripple *= smoothstep(0.5, 0.0, dist);
        
        // Distort UVs
        uv += ripple;
        
        // Sample texture
        vec4 color = texture2D(tDiffuse, uv);
        
        // Add glow at ripple center
        float glow = smoothstep(0.3, 0.0, dist) * uRipple * 0.5;
        color.rgb += vec3(1.0, 0.843, 0.0) * glow;
        
        gl_FragColor = color;
      }
    `
  };
  
  static glowShader = {
    uniforms: {
      tDiffuse: { value: null },
      uTime: { value: 0 },
      uIntensity: { value: 1.0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float uTime;
      uniform float uIntensity;
      varying vec2 vUv;
      
      void main() {
        vec4 color = texture2D(tDiffuse, vUv);
        
        // Edge detection for glow
        float edge = 0.0;
        vec2 offset = vec2(0.002);
        
        edge += texture2D(tDiffuse, vUv + vec2(-offset.x, -offset.y)).r;
        edge += texture2D(tDiffuse, vUv + vec2(0.0, -offset.y)).r;
        edge += texture2D(tDiffuse, vUv + vec2(offset.x, -offset.y)).r;
        edge += texture2D(tDiffuse, vUv + vec2(-offset.x, 0.0)).r;
        edge += texture2D(tDiffuse, vUv + vec2(offset.x, 0.0)).r;
        edge += texture2D(tDiffuse, vUv + vec2(-offset.x, offset.y)).r;
        edge += texture2D(tDiffuse, vUv + vec2(0.0, offset.y)).r;
        edge += texture2D(tDiffuse, vUv + vec2(offset.x, offset.y)).r;
        edge = abs(edge - color.r * 8.0);
        
        // Gold glow color
        vec3 glowColor = vec3(1.0, 0.843, 0.0);
        
        // Pulsing glow
        float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
        
        // Add glow
        color.rgb += glowColor * edge * uIntensity * pulse;
        
        gl_FragColor = color;
      }
    `
  };
  
  static chromaticAberrationShader = {
    uniforms: {
      tDiffuse: { value: null },
      uAmount: { value: 0.003 },
      uAngle: { value: 0.0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float uAmount;
      uniform float uAngle;
      varying vec2 vUv;
      
      void main() {
        vec2 offset = vec2(cos(uAngle), sin(uAngle)) * uAmount;
        
        float r = texture2D(tDiffuse, vUv + offset).r;
        float g = texture2D(tDiffuse, vUv).g;
        float b = texture2D(tDiffuse, vUv - offset).b;
        
        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `
  };
  
  static holographicShader = {
    uniforms: {
      tDiffuse: { value: null },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float uTime;
      uniform vec2 uMouse;
      varying vec2 vUv;
      
      void main() {
        vec2 uv = vUv;
        
        // Holographic scan lines
        float scanline = sin(uv.y * 800.0 + uTime * 5.0) * 0.04;
        
        // Rainbow gradient
        vec3 rainbow = vec3(
          sin(uv.y * 10.0 + uTime) * 0.5 + 0.5,
          sin(uv.y * 10.0 + uTime + 2.0) * 0.5 + 0.5,
          sin(uv.y * 10.0 + uTime + 4.0) * 0.5 + 0.5
        );
        
        // Angle from mouse
        vec2 toMouse = uv - uMouse;
        float angle = atan(toMouse.y, toMouse.x);
        float dist = length(toMouse);
        
        // Iridescent effect
        vec3 iridescent = vec3(
          sin(angle * 3.0 + uTime) * 0.5 + 0.5,
          sin(angle * 3.0 + uTime + 2.0) * 0.5 + 0.5,
          sin(angle * 3.0 + uTime + 4.0) * 0.5 + 0.5
        );
        
        vec4 color = texture2D(tDiffuse, uv);
        
        // Mix holographic effects
        color.rgb += scanline;
        color.rgb += rainbow * 0.1 * (1.0 - dist);
        color.rgb += iridescent * 0.15 * smoothstep(1.0, 0.0, dist);
        
        gl_FragColor = color;
      }
    `
  };
  
  static pixelateShader = {
    uniforms: {
      tDiffuse: { value: null },
      uPixelSize: { value: 4.0 },
      uResolution: { value: new THREE.Vector2(800, 600) }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float uPixelSize;
      uniform vec2 uResolution;
      varying vec2 vUv;
      
      void main() {
        vec2 dxy = uPixelSize / uResolution;
        vec2 coord = dxy * floor(vUv / dxy);
        
        gl_FragColor = texture2D(tDiffuse, coord);
      }
    `
  };
}

// Shader Effect Manager
export class ShaderEffectManager {
  constructor(element) {
    this.element = element;
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.mesh = null;
    this.activeShader = null;
    
    this.init();
  }
  
  init() {
    const rect = this.element.getBoundingClientRect();
    this.renderer.setSize(rect.width, rect.height);
    this.element.appendChild(this.renderer.domElement);
    
    // Create plane for shader
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.mesh = new THREE.Mesh(geometry);
    this.scene.add(this.mesh);
  }
  
  applyShader(shaderType, imageTexture) {
    let shader;
    
    switch(shaderType) {
      case 'ripple':
        shader = ShaderEffects.rippleShader;
        break;
      case 'glow':
        shader = ShaderEffects.glowShader;
        break;
      case 'chromatic':
        shader = ShaderEffects.chromaticAberrationShader;
        break;
      case 'holographic':
        shader = ShaderEffects.holographicShader;
        break;
      case 'pixelate':
        shader = ShaderEffects.pixelateShader;
        break;
      default:
        return;
    }
    
    const material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(shader.uniforms),
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      transparent: true
    });
    
    material.uniforms.tDiffuse.value = imageTexture;
    this.mesh.material = material;
    this.activeShader = shader;
  }
  
  update(time, mouseX, mouseY) {
    if (!this.mesh.material.uniforms) return;
    
    const uniforms = this.mesh.material.uniforms;
    
    if (uniforms.uTime) uniforms.uTime.value = time;
    if (uniforms.uMouse) uniforms.uMouse.value.set(mouseX, mouseY);
    
    this.renderer.render(this.scene, this.camera);
  }
  
  destroy() {
    if (this.renderer) {
      this.element.removeChild(this.renderer.domElement);
      this.renderer.dispose();
    }
    
    if (this.mesh) {
      this.mesh.geometry.dispose();
      if (this.mesh.material) this.mesh.material.dispose();
    }
  }
}
