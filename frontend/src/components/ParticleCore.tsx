import React, { useState, useEffect, useRef, startTransition } from 'react';

interface ParticleCoreProps {
  primaryColor?: string;
  secondaryColor?: string;
  shapeType?: 'icosahedron' | 'sphere' | 'octahedron' | 'tetrahedron';
  shapeDetail?: number;
  animationSpeed?: number;
  rotationSpeed?: number;
  particleSize?: number;
  noiseAmplitude?: number;
  noiseFrequency?: number;
  showWireframe?: boolean;
  wireframeOpacity?: number;
  showCore?: boolean;
  coreOpacity?: number;
  cameraDistance?: number;
  style?: React.CSSProperties;
}

export default function ParticleCore(props: ParticleCoreProps) {
  const {
    primaryColor = "#F18C8E", // Salmon
    secondaryColor = "#305F72", // Teal
    shapeType = "icosahedron",
    shapeDetail = 32,
    animationSpeed = 0.5,
    rotationSpeed = 0.1,
    particleSize = 2,
    noiseAmplitude = 0.3,
    noiseFrequency = 1.5,
    showWireframe = true,
    wireframeOpacity = 0.1,
    showCore = true,
    coreOpacity = 0.2,
    cameraDistance = 5.5
  } = props;

  const [time, setTime] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<any>(null);
  const wireMaterialRef = useRef<any>(null);
  const wireframeRef = useRef<any>(null);
  const coreRef = useRef<any>(null);
  const coreMaterialRef = useRef<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      startTransition(() => {
        setTime(t => t + 0.016);
      });
    }, 16);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let animationId: number;
    let resizeObserver: ResizeObserver | null = null;
    let renderer: any = null;
    let container: HTMLElement | null = null;

    // Dynamically import Three.js to avoid bundle bloat
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.async = true;
    script.onload = () => {
      const THREE = (window as any).THREE;
      if (!THREE) return;
      container = canvasRef.current;
      if (!container) return;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
      
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
      camera.position.z = cameraDistance;

      let geometry;
      switch (shapeType) {
        case "sphere": geometry = new THREE.SphereGeometry(1.5, shapeDetail, shapeDetail); break;
        case "octahedron": geometry = new THREE.OctahedronGeometry(1.5, shapeDetail); break;
        case "tetrahedron": geometry = new THREE.TetrahedronGeometry(1.5, shapeDetail); break;
        case "icosahedron":
        default: geometry = new THREE.IcosahedronGeometry(1.5, shapeDetail); break;
      }

      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color1: { value: new THREE.Color(primaryColor) },
          color2: { value: new THREE.Color(secondaryColor) },
          noiseAmp: { value: noiseAmplitude },
          noiseFreq: { value: noiseFrequency },
          particleSize: { value: particleSize }
        },
        vertexShader: `
          uniform float time;
          uniform float noiseAmp;
          uniform float noiseFreq;
          uniform float particleSize;
          varying vec2 vUv;
          varying vec3 vPosition;
          
          vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
          vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
          float snoise(vec3 v) { 
              const vec2 C = vec2(1.0/6.0, 1.0/3.0);
              const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
              vec3 i = floor(v + dot(v, C.yyy));
              vec3 x0 = v - i + dot(i, C.xxx);
              vec3 g = step(x0.yzx, x0.xyz);
              vec3 l = 1.0 - g;
              vec3 i1 = min(g.xyz, l.zxy);
              vec3 i2 = max(g.xyz, l.zxy);
              vec3 x1 = x0 - i1 + C.xxx;
              vec3 x2 = x0 - i2 + C.yyy;
              vec3 x3 = x0 - D.yyy;
              i = mod289(i);
              vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
              float n_ = 0.142857142857;
              vec3 ns = n_ * D.wyz - D.xzx;
              vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
              vec4 x_ = floor(j * ns.z);
              vec4 y_ = floor(j - 7.0 * x_);
              vec4 x = x_ * ns.x + ns.yyyy;
              vec4 y = y_ * ns.x + ns.yyyy;
              vec4 h = 1.0 - abs(x) - abs(y);
              vec4 b0 = vec4(x.xy, y.xy);
              vec4 b1 = vec4(x.zw, y.zw);
              vec4 s0 = floor(b0) * 2.0 + 1.0;
              vec4 s1 = floor(b1) * 2.0 + 1.0;
              vec4 sh = -step(h, vec4(0.0));
              vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
              vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
              vec3 p0 = vec3(a0.xy, h.x);
              vec3 p1 = vec3(a0.zw, h.y);
              vec3 p2 = vec3(a1.xy, h.z);
              vec3 p3 = vec3(a1.zw, h.w);
              vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
              p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
              vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
              m = m * m;
              return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
          }

          void main() {
              vUv = uv;
              vec3 pos = position;
              vec3 noisePos = vec3(pos.x * noiseFreq + time, pos.y * noiseFreq + time, pos.z * noiseFreq);
              float displacement = snoise(noisePos) * noiseAmp;
              pos += normal * displacement;
              vPosition = pos;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
              gl_PointSize = particleSize + (displacement * 5.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color1;
          uniform vec3 color2;
          varying vec3 vPosition;
          
          void main() {
              vec2 xy = gl_PointCoord.xy - vec2(0.5);
              float ll = length(xy);
              if(ll > 0.5) discard;
              
              float mixRatio = (vPosition.y + 1.5) / 3.0;
              vec3 finalColor = mix(color1, color2, mixRatio);
              
              float alpha = smoothstep(0.5, 0.1, ll) * 0.8;
              gl_FragColor = vec4(finalColor, alpha);
          }
        `,
        transparent: true,
        blending: THREE.NormalBlending,
        depthWrite: false
      });

      const mesh = new THREE.Points(geometry, material);
      const wireMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(primaryColor),
        transparent: true,
        opacity: wireframeOpacity
      });
      const wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), wireMaterial);
      wireframe.visible = showWireframe;

      materialRef.current = material;
      wireMaterialRef.current = wireMaterial;
      wireframeRef.current = wireframe;

      scene.add(mesh);
      scene.add(wireframe);

      const coreGeom = new THREE.SphereGeometry(0.8, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(secondaryColor),
        transparent: true,
        opacity: coreOpacity * 2, // slightly more visible core
        blending: THREE.NormalBlending
      });
      const core = new THREE.Mesh(coreGeom, coreMat);
      core.visible = showCore;
      scene.add(core);
      
      coreRef.current = core;
      coreMaterialRef.current = coreMat;

      resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          const width = entry.contentRect.width;
          const height = entry.contentRect.height;
          if (width > 0 && height > 0) {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
          }
        }
      });
      resizeObserver.observe(container);

      const clock = new THREE.Clock();
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();
        material.uniforms.time.value = t * animationSpeed;
        mesh.rotation.y = t * rotationSpeed;
        mesh.rotation.z = t * (rotationSpeed * 0.5);
        wireframe.rotation.y = t * rotationSpeed;
        wireframe.rotation.z = t * (rotationSpeed * 0.5);
        const scale = 1 + Math.sin(t * 2) * 0.1;
        core.scale.set(scale, scale, scale);
        renderer.render(scene, camera);
      };
      animate();
    };
    document.head.appendChild(script);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (resizeObserver) resizeObserver.disconnect();
      if (renderer) {
        renderer.dispose();
        if (container && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [shapeType, shapeDetail, animationSpeed, rotationSpeed, cameraDistance]);

  return (
    <div style={{ ...props.style, overflow: "hidden", position: "relative", width: "100%", height: "100%" }}>
      <div 
        ref={canvasRef} 
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      />
    </div>
  );
}
