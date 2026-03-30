import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass';
import { FaBrain, FaMicroscope, FaHeartbeat, FaSkull } from 'react-icons/fa';

// ============================================
// CRAZY ANIMATIONS
// ============================================

const glitch = keyframes`
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
`;

const scanline = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
`;

const pulseBeat = keyframes`
  0% { transform: scale(1); }
  25% { transform: scale(1.1); }
  40% { transform: scale(1); }
  60% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const floatParticles = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-100px) rotate(180deg); }
  100% { transform: translateY(0px) rotate(360deg); }
`;

const matrixRain = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
`;

// ============================================
// STYLED COMPONENTS
// ============================================

const RenderContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: #000;
  z-index: 9999;
  overflow: hidden;
`;

const Canvas3D = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%);
  pointer-events: none;
`;

const ScanLine = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    #00ffff 20%, 
    #ff00ff 50%, 
    #00ffff 80%, 
    transparent 100%
  );
  opacity: 0.5;
  animation: ${scanline} 3s linear infinite;
  z-index: 3;
  box-shadow: 0 0 20px #00ffff;
`;

const LoadingText = styled(motion.div)`
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 1.5rem;
  font-family: 'Courier New', monospace;
  z-index: 4;
  text-shadow: 0 0 10px cyan, 0 0 20px magenta;
  letter-spacing: 4px;
`;

const ProgressBar = styled(motion.div)`
  position: absolute;
  bottom: 50px;
  left: 10%;
  width: 80%;
  height: 4px;
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
  z-index: 4;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.progress}%;
    background: linear-gradient(90deg, #00ffff, #ff00ff, #00ffff);
    box-shadow: 0 0 20px #00ffff;
    transition: width 0.3s ease;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(255,255,255,0.3) 50%, 
      transparent 100%
    );
    animation: ${scanline} 2s linear infinite;
  }
`;

const StatusMessage = styled(motion.div)`
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  z-index: 4;
  text-shadow: 0 0 30px cyan, 0 0 60px magenta;
  white-space: nowrap;
`;

const ParticleOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
  overflow: hidden;
`;

const Particle = styled(motion.div)`
  position: absolute;
  width: 2px;
  height: 2px;
  background: ${props => props.color};
  border-radius: 50%;
  box-shadow: 0 0 10px ${props => props.color};
`;

const MatrixRain = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
  opacity: 0.1;
  font-family: 'Courier New', monospace;
  color: #00ff00;
  font-size: 14px;
  line-height: 14px;
  white-space: nowrap;
  animation: ${matrixRain} 20s linear infinite;
`;

const BrainStats = styled(motion.div)`
  position: absolute;
  top: 200px;
  right: 50px;
  color: white;
  font-family: 'Courier New', monospace;
  z-index: 4;
  text-align: right;
  background: rgba(0,0,0,0.7);
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #00ffff;
  box-shadow: 0 0 30px rgba(0,255,255,0.3);
`;

const StatItem = styled.div`
  margin: 10px 0;
  font-size: 1rem;
  color: #0f0;
  text-shadow: 0 0 5px #0f0;
  
  span {
    color: #fff;
    margin-left: 10px;
  }
`;

// ============================================
// 3D BRAIN WITH CRAZY EFFECTS
// ============================================

const Crazy3DBrain = ({ onLoadingComplete }) => {
  const canvasRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('INITIALIZING NEURAL NETWORK...');
  const [brainStats, setBrainStats] = useState({
    neurons: '0',
    synapses: '0',
    activity: '0%',
    consciousness: '0%'
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(8, 4, 12);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Controls with auto-rotate
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;
    controls.enableZoom = false;
    controls.enablePan = false;

    // Post-processing for bloom effect
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0;
    bloomPass.strength = 1.5;
    bloomPass.radius = 0.5;

    const glitchPass = new GlitchPass();
    glitchPass.goWild = true;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    // Uncomment for crazy glitch effects every few seconds
    // if (Math.random() > 0.7) composer.addPass(glitchPass);

    // Lights - lots of them for dramatic effect
    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);

    const lights = [
      { color: 0x00ffff, intensity: 2, pos: [5, 5, 5] },
      { color: 0xff00ff, intensity: 2, pos: [-5, -5, 5] },
      { color: 0xffff00, intensity: 1, pos: [5, -5, -5] },
      { color: 0x00ff00, intensity: 1, pos: [-5, 5, -5] }
    ];

    lights.forEach(light => {
      const pointLight = new THREE.PointLight(light.color, light.intensity, 20);
      pointLight.position.set(...light.pos);
      scene.add(pointLight);
      
      // Add light spheres for visual effect
      const sphereGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({ color: light.color });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(...light.pos);
      scene.add(sphere);
    });

    // Create main brain structure
    const brainGroup = new THREE.Group();

    // Particle system for brain
    const particleCount = 15000;
    const particles = new THREE.BufferGeometry();
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Complex brain-like shape using multiple mathematical functions
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      
      let r = 3.0;
      
      // Add gyri and sulci (folds)
      r += Math.sin(p * 8) * 0.5;
      r += Math.cos(t * 6) * 0.3;
      r += Math.sin(p * 12) * Math.cos(t * 8) * 0.4;
      
      // Split into hemispheres
      const hemisphere = Math.sin(t) > 0 ? 0.2 : -0.2;
      
      const x = r * Math.sin(p) * Math.cos(t) + hemisphere;
      const y = r * Math.sin(p) * Math.sin(t) * 1.2;
      const z = r * Math.cos(p) * 0.8;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      // Dynamic colors based on position
      const color = new THREE.Color();
      const hue = 0.7 + (y * 0.1) + (Math.sin(x * 2) * 0.1);
      const saturation = 0.9;
      const lightness = 0.6 + (Math.sin(z * 3) * 0.2);
      
      color.setHSL(hue, saturation, lightness);
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      sizes[i] = Math.random() * 0.15 + 0.05;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 3));
    
    // Custom shader material for glowing particles
    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pointTexture: { value: createParticleTexture() }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 + sin(time * 2.0 + position.x) * 0.2);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        uniform sampler2D pointTexture;
        
        void main() {
          vec4 texColor = texture2D(pointTexture, gl_PointCoord);
          vec3 finalColor = vColor * texColor.rgb;
          gl_FragColor = vec4(finalColor, texColor.a * 0.8);
          if (gl_FragColor.a < 0.1) discard;
        }
      `,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    brainGroup.add(particleSystem);

    // Add neural connections (lines)
    const lineCount = 3000;
    const linePositions = [];
    const lineColors = [];

    for (let i = 0; i < lineCount; i++) {
      const startIdx = Math.floor(Math.random() * particleCount);
      const endIdx = Math.floor(Math.random() * particleCount);
      
      const startX = positions[startIdx * 3];
      const startY = positions[startIdx * 3 + 1];
      const startZ = positions[startIdx * 3 + 2];
      
      const endX = positions[endIdx * 3];
      const endY = positions[endIdx * 3 + 1];
      const endZ = positions[endIdx * 3 + 2];
      
      // Only connect points that are relatively close
      const dist = Math.sqrt(
        Math.pow(startX - endX, 2) + 
        Math.pow(startY - endY, 2) + 
        Math.pow(startZ - endZ, 2)
      );
      
      if (dist < 2.5) {
        linePositions.push(startX, startY, startZ);
        linePositions.push(endX, endY, endZ);
        
        const color = new THREE.Color().setHSL(0.7 + dist * 0.1, 0.9, 0.6);
        lineColors.push(color.r, color.g, color.b);
        lineColors.push(color.r, color.g, color.b);
      }
    }
    
    const lines = new THREE.BufferGeometry();
    lines.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lines.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
    
    const lineMaterial = new THREE.LineBasicMaterial({ 
      vertexColors: true,
      transparent: true,
      opacity: 0.15
    });
    
    const lineSegments = new THREE.LineSegments(lines, lineMaterial);
    brainGroup.add(lineSegments);

    // Add glowing outer shell
    const shellGeo = new THREE.SphereGeometry(3.5, 64, 64);
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0x3366ff,
      wireframe: true,
      transparent: true,
      opacity: 0.1
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    brainGroup.add(shell);

    // Add floating particles around brain
    const outerParticlesGeo = new THREE.BufferGeometry();
    const outerPositions = new Float32Array(2000 * 3);
    
    for (let i = 0; i < 2000; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 4.5 + Math.random() * 1.5;
      
      outerPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      outerPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      outerPositions[i * 3 + 2] = r * Math.cos(phi);
    }
    
    outerParticlesGeo.setAttribute('position', new THREE.BufferAttribute(outerPositions, 3));
    
    const outerParticlesMat = new THREE.PointsMaterial({
      color: 0x88aaff,
      size: 0.05,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    
    const outerParticles = new THREE.Points(outerParticlesGeo, outerParticlesMat);
    brainGroup.add(outerParticles);

    scene.add(brainGroup);

    // Add stars background
    const starsGeo = new THREE.BufferGeometry();
    const starsPositions = new Float32Array(5000 * 3);
    
    for (let i = 0; i < 5000; i++) {
      starsPositions[i * 3] = (Math.random() - 0.5) * 200;
      starsPositions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      starsPositions[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
    
    const starsMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.5
    });
    
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);

    // Helper function to create particle texture
    function createParticleTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      
      ctx.clearRect(0, 0, 32, 32);
      
      // Draw gradient circle
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.5, 'rgba(200,200,255,0.8)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(16, 16, 16, 0, Math.PI * 2);
      ctx.fill();
      
      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    }

    // Animation variables
    let clock = new THREE.Clock();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      const delta = clock.getDelta();
      const elapsedTime = performance.now() / 1000;
      
      // Update brain rotation
      brainGroup.rotation.y += 0.001;
      brainGroup.rotation.x += 0.0005;
      
      // Update stars rotation
      stars.rotation.y += 0.0001;
      
      // Update shader uniform
      if (particleMaterial.uniforms) {
        particleMaterial.uniforms.time.value = elapsedTime;
      }
      
      // Update controls
      controls.update();
      
      // Render with composer
      composer.render();
    };
    
    animate();

    // ========== CHANGED: 5-6 SECOND LOADING ==========
    const loadingInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(loadingInterval);
          setTimeout(() => onLoadingComplete(), 600); // Slightly longer for smooth transition
          return 100;
        }
        
        // Update status messages
        if (prev < 20) setStatus('SCANNING NEURAL PATHWAYS...');
        else if (prev < 40) setStatus('ANALYZING BRAIN ACTIVITY...');
        else if (prev < 60) setStatus('DETECTING STROKE PATTERNS...');
        else if (prev < 80) setStatus('CONSULTING AI ENSEMBLE...');
        else if (prev < 95) setStatus('GENERATING 3D RECONSTRUCTION...');
        else setStatus('PREPARING RESULTS...');
        
        // Update stats
        setBrainStats({
          neurons: Math.floor(86000000000 * (prev / 100)).toLocaleString(),
          synapses: Math.floor(1000000000000 * (prev / 100)).toLocaleString(),
          activity: `${Math.floor(prev * 0.8)}%`,
          consciousness: `${Math.floor(prev * 0.3)}%`
        });
        
        return prev + 1; // Changed back to +1 for slower progression (5-6 seconds)
      });
    }, 55); // 55ms × 100 = 5.5 seconds (perfect middle ground)

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(loadingInterval);
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <Canvas3D ref={canvasRef} />
      <Overlay />
      <ScanLine />
      
      <StatusMessage
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {status}
      </StatusMessage>
      
      <BrainStats
        initial={{ x: 100 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 style={{ color: '#00ffff', marginBottom: '15px', borderBottom: '1px solid #00ffff', paddingBottom: '5px' }}>BRAIN ACTIVITY</h3>
        <StatItem>NEURONS: <span>{brainStats.neurons}</span></StatItem>
        <StatItem>SYNAPSES: <span>{brainStats.synapses}</span></StatItem>
        <StatItem>ACTIVITY: <span>{brainStats.activity}</span></StatItem>
        <StatItem>CONSCIOUSNESS: <span>{brainStats.consciousness}</span></StatItem>
        <div style={{ marginTop: '15px', color: '#ff00ff', fontSize: '0.8rem' }}>
          STROKE PROBABILITY: <span style={{ color: '#fff' }}>CALCULATING...</span>
        </div>
      </BrainStats>
      
      <ProgressBar progress={progress} />
      
      <LoadingText>
        {`[${progress}%] LOADING_`}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >_</motion.span>
      </LoadingText>
      
      <ParticleOverlay>
        {[...Array(50)].map((_, i) => (
          <Particle
            key={i}
            color={i % 2 === 0 ? '#00ffff' : '#ff00ff'}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </ParticleOverlay>
    </>
  );
};

// ============================================
// MAIN RENDER PAGE COMPONENT
// ============================================

const RenderPage = ({ onComplete }) => {
  const [isComplete, setIsComplete] = useState(false);

  const handleLoadingComplete = () => {
    setIsComplete(true);
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  return (
    <AnimatePresence>
      {!isComplete ? (
        <RenderContainer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <Crazy3DBrain onLoadingComplete={handleLoadingComplete} />
        </RenderContainer>
      ) : (
        // ========== CHANGED: WELCOME TO NEUROGUARDIAN ==========
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            background: 'radial-gradient(circle at center, #000, #1a0033)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <motion.div style={{ textAlign: 'center' }}>
            <motion.h1
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.8 }}
              style={{
                fontSize: '4rem',
                background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 50px rgba(0,255,255,0.5)',
                marginBottom: '1rem'
              }}
            >
    
            </motion.h1>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{
                fontSize: '3.5rem',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #ff00ff, #00ffff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px #ff00ff'
              }}
            >
             WELCOME TO NEUROGUARDIAN
            </motion.h2>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{
                marginTop: '2rem',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '1.2rem'
              }}
            >
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RenderPage;