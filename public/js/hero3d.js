
(() => {
  "use strict";

  const canvas = document.querySelector("#hero-canvas");

  if (!canvas || !window.THREE) {
    console.warn("Three.js or #hero-canvas was not found.");
    return;
  }

  const THREE = window.THREE;

  // --------------------------------------------------
  // SCENE
  // --------------------------------------------------

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    38,
    1,
    0.1,
    100
  );

  camera.position.set(0, 0, 7.5);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, 1.75)
  );

  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  // --------------------------------------------------
  // PROCEDURAL ENVIRONMENT FOR GLASS REFLECTIONS
  // --------------------------------------------------

  function createEnvironment() {
    const envCanvas = document.createElement("canvas");

    envCanvas.width = 1024;
    envCanvas.height = 512;

    const ctx = envCanvas.getContext("2d");

    const gradient = ctx.createLinearGradient(
      0, 0, 1024, 512
    );

    gradient.addColorStop(0, "#071323");
    gradient.addColorStop(0.25, "#31465d");
    gradient.addColorStop(0.48, "#080b12");
    gradient.addColorStop(0.7, "#182d48");
    gradient.addColorStop(1, "#020306");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 512);

    // Bright studio reflection strips
    ctx.save();
    ctx.filter = "blur(18px)";

    ctx.fillStyle = "#c9efff";
    ctx.fillRect(100, 35, 65, 340);

    ctx.fillStyle = "#527fff";
    ctx.fillRect(300, 80, 32, 260);

    ctx.fillStyle = "#ffb46a";
    ctx.fillRect(700, 60, 48, 320);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(890, 20, 22, 280);

    ctx.restore();

    // Sharper highlights create a studio-lit appearance
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(120, 40, 5, 300);

    ctx.fillStyle = "#8ccaff";
    ctx.fillRect(318, 90, 3, 230);

    ctx.fillStyle = "#ffc58b";
    ctx.fillRect(720, 70, 4, 290);

    const texture = new THREE.CanvasTexture(envCanvas);

    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.encoding = THREE.sRGBEncoding;

    return texture;
  }

  const environment = createEnvironment();

  scene.environment = environment;

  // --------------------------------------------------
  // LIGHTING
  // --------------------------------------------------

  scene.add(
    new THREE.AmbientLight(0xffffff, 0.65)
  );

  const keyLight = new THREE.PointLight(
    0xc9eaff,
    3.2,
    20
  );

  keyLight.position.set(-3, 3, 5);
  scene.add(keyLight);

  const blueLight = new THREE.PointLight(
    0x397bff,
    5,
    14
  );

  blueLight.position.set(3, -1, 2);
  scene.add(blueLight);

  const warmLight = new THREE.PointLight(
    0xff9b54,
    3.5,
    12
  );

  warmLight.position.set(-2, -3, 1);
  scene.add(warmLight);

  // --------------------------------------------------
  // MAIN GLASS SCULPTURE
  // --------------------------------------------------

  const sculpture = new THREE.Group();

  scene.add(sculpture);

  const glassGeometry = new THREE.IcosahedronGeometry(
    1.45,
    1
  );

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xd8edff,
    metalness: 0.12,
    roughness: 0.08,
    transmission: 0.95,
    thickness: 1.8,
    ior: 1.32,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.8,
    flatShading: true
  });

  const glassObject = new THREE.Mesh(
    glassGeometry,
    glassMaterial
  );

  sculpture.add(glassObject);

  // Chrome wireframe shell
  const wireGeometry = new THREE.IcosahedronGeometry(
    1.49,
    1
  );

  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0x9bcfff,
    wireframe: true,
    transparent: true,
    opacity: 0.23
  });

  const wireObject = new THREE.Mesh(
    wireGeometry,
    wireMaterial
  );

  sculpture.add(wireObject);

  // Inner glowing core
  const coreGeometry = new THREE.IcosahedronGeometry(
    0.57,
    1
  );

  const coreMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x6a9fff,
    emissive: 0x102e78,
    emissiveIntensity: 1.3,
    metalness: 0.45,
    roughness: 0.19,
    clearcoat: 1
  });

  const core = new THREE.Mesh(
    coreGeometry,
    coreMaterial
  );

  sculpture.add(core);

  // --------------------------------------------------
  // FLOATING ORBITAL RINGS
  // --------------------------------------------------

  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0xb8dfff,
    metalness: 0.9,
    roughness: 0.19,
    emissive: 0x112747,
    emissiveIntensity: 0.5
  });

  const ringOne = new THREE.Mesh(
    new THREE.TorusGeometry(1.9, 0.012, 8, 160),
    ringMaterial
  );

  ringOne.rotation.set(0.8, 0.3, 0.4);
  sculpture.add(ringOne);

  const ringTwo = new THREE.Mesh(
    new THREE.TorusGeometry(2.15, 0.008, 8, 160),
    new THREE.MeshStandardMaterial({
      color: 0xffb87b,
      metalness: 0.95,
      roughness: 0.23,
      emissive: 0x54270e,
      emissiveIntensity: 0.4
    })
  );

  ringTwo.rotation.set(1.3, 0.8, -0.45);
  sculpture.add(ringTwo);

  // --------------------------------------------------
  // SMALL FLOATING DETAILS
  // --------------------------------------------------

  const particles = [];

  const particleMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xd4e9ff,
    metalness: 0.75,
    roughness: 0.16,
    clearcoat: 1
  });

  for (let i = 0; i < 9; i++) {
    const size = i % 3 === 0 ? 0.065 : 0.035;

    const particle = new THREE.Mesh(
      new THREE.IcosahedronGeometry(size, 1),
      particleMaterial
    );

    const angle = (i / 9) * Math.PI * 2;
    const radius = 2.1 + (i % 3) * 0.28;

    particle.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      (i % 3 - 1) * 0.6
    );

    sculpture.add(particle);
    particles.push(particle);
  }

  // --------------------------------------------------
  // MOUSE MOVEMENT + SCROLL CONTROL
  // --------------------------------------------------

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const pointer = {
    x: 0,
    y: 0
  };

  const target = {
    x: 0,
    y: 0,
    scroll: 0
  };

  let currentScroll = 0;
  let frameId = null;
  let isVisible = true;

  window.addEventListener("pointermove", (event) => {
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  function setScrollProgress(progress) {
    target.scroll = THREE.MathUtils.clamp(progress, 0, 1);
  }

  // --------------------------------------------------
  // RESPONSIVE CANVAS
  // --------------------------------------------------

  function resize() {
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;

    renderer.setSize(width, height, false);

    camera.aspect = width / height;
    camera.position.z = width < 600 ? 8.8 : 7.5;
    camera.updateProjectionMatrix();
  }

  window.addEventListener("resize", resize);
  resize();

  // --------------------------------------------------
  // ANIMATION LOOP
  // --------------------------------------------------

  const clock = new THREE.Clock();

  function animate() {
    if (!isVisible) {
      frameId = null;
      return;
    }

    frameId = requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    currentScroll +=
      (target.scroll - currentScroll) * 0.045;

    const motionScale = reducedMotion.matches ? 0 : 1;

    // Slow floating motion
    sculpture.position.y =
      Math.sin(time * 0.7) * 0.12 * motionScale;

    // Gentle idle rotation
    sculpture.rotation.y += 0.002 * motionScale;
    sculpture.rotation.x += 0.0008 * motionScale;

    // Mouse tilt
    sculpture.rotation.y +=
      (pointer.x * 0.22 - sculpture.rotation.y) * 0.012 * motionScale;

    sculpture.rotation.x +=
      (-pointer.y * 0.16 - sculpture.rotation.x) * 0.012 * motionScale;

    // Scroll-linked movement: the sculpture travels and turns
    sculpture.rotation.y += currentScroll * 0.008;
    sculpture.rotation.z =
      currentScroll * Math.PI * 0.6;

    sculpture.position.x =
      currentScroll * 0.8;

    sculpture.position.z =
      -currentScroll * 0.7;

    const scale = 1 - currentScroll * 0.18;

    sculpture.scale.setScalar(scale);

    // Counter-rotation gives the rings a separate orbital feel
    ringOne.rotation.z += 0.002 * motionScale;
    ringTwo.rotation.x -= 0.0015 * motionScale;

    core.rotation.y -= 0.004 * motionScale;
    core.rotation.x += 0.002 * motionScale;

    particles.forEach((particle, index) => {
      particle.position.y +=
        Math.sin(time + index) * 0.0015 * motionScale;

      particle.rotation.x += 0.004 * motionScale;
      particle.rotation.y += 0.003 * motionScale;
    });

    renderer.render(scene, camera);
  }

  // Render only while the hero is visible
  const observer = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;

    if (isVisible && frameId === null) {
      clock.start();
      animate();
    }
  }, { threshold: 0 });

  observer.observe(canvas);

  // Expose controls for animation.js
  window.portfolio3D = {
    scene,
    camera,
    renderer,
    sculpture,
    glassObject,
    core,
    ringOne,
    ringTwo,
    setScrollProgress
  };
})();
