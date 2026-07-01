import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const canvas = document.getElementById('heroCanvas');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canvas && !prefersReducedMotion && window.WebGLRenderingContext) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.z = 9;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Circular golden sprite drawn on a small canvas
  const spriteCanvas = document.createElement('canvas');
  spriteCanvas.width = spriteCanvas.height = 64;
  const ctx = spriteCanvas.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 224, 158, 1)');
  grad.addColorStop(0.4, 'rgba(201, 162, 75, 0.8)');
  grad.addColorStop(1, 'rgba(201, 162, 75, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const spriteTexture = new THREE.CanvasTexture(spriteCanvas);

  const COUNT = 220;
  const positions = new Float32Array(COUNT * 3);
  const speeds = new Float32Array(COUNT);
  const drift = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 18;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 11;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 9;
    speeds[i] = 0.15 + Math.random() * 0.35;
    drift[i] = Math.random() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size: 0.11,
    map: spriteTexture,
    transparent: true,
    depthWrite: false,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  let mouseX = 0;
  let mouseY = 0;
  const hero = canvas.closest('.hero');

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    mouseY = (e.clientY - rect.top) / rect.height - 0.5;
  });

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  const clock = new THREE.Clock();
  let rafId;

  function animate() {
    rafId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    const pos = geometry.attributes.position;

    for (let i = 0; i < COUNT; i++) {
      let y = pos.getY(i) + speeds[i] * 0.006;
      if (y > 5.5) y = -5.5;
      const x = pos.getX(i) + Math.sin(t * 0.3 + drift[i]) * 0.0015;
      pos.setY(i, y);
      pos.setX(i, x);
    }
    pos.needsUpdate = true;

    camera.position.x += (mouseX * 1.4 - camera.position.x) * 0.03;
    camera.position.y += (-mouseY * 1.4 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      animate();
    }
  });
}

// Subtle parallax on the hero photo while scrolling
const heroBg = document.getElementById('heroBg');
const heroEl = document.querySelector('.hero');

if (heroBg && heroEl && !prefersReducedMotion) {
  window.addEventListener('scroll', () => {
    const rect = heroEl.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const offset = rect.top * -0.15;
    heroBg.style.transform = `translateY(${offset}px) scale(1.08)`;
  }, { passive: true });
}
