// ==============================================================
// FILE: three-spatial.js - 3D SPATIAL UNIVERSE & INTERACTIVE HUD
// Hệ Thống Đồ Họa 3D Toàn Diện Cho FinMaster Sử Dụng Three.js
// ==============================================================

(function initThreeSpatial() {
  if (typeof THREE === 'undefined') {
    console.warn("Three.js chưa được nạp, đang thử chờ...");
    window.addEventListener('load', () => {
      if (typeof THREE !== 'undefined') startThreeSpatial();
    });
    return;
  }
  startThreeSpatial();

  function startThreeSpatial() {
    let scene, camera, renderer;
    let particleSystem, coinGroup, gemMesh, waveGrid;
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;
    let isRunning = true;
    let currentMode = 'nebula'; // 'nebula', 'coins_gems', 'wave', 'off'

    // Tạo Canvas toàn màn hình phía sau ứng dụng
    let canvas = document.getElementById('three-spatial-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'three-spatial-canvas';
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '0';
      canvas.style.opacity = '0.75';
      canvas.style.transition = 'opacity 0.5s ease';
      document.body.prepend(canvas);
    }

    // Khởi tạo Scene, Camera, Renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 120;

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Ánh sáng Ambient & Point Lights đa màu sắc
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x6366f1, 1.2);
    dirLight1.position.set(50, 60, 50);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x10b981, 1.0);
    dirLight2.position.set(-50, -40, 30);
    scene.add(dirLight2);

    const goldPointLight = new THREE.PointLight(0xf59e0b, 2.0, 150);
    goldPointLight.position.set(0, 0, 40);
    scene.add(goldPointLight);

    // ==============================================================
    // 1. TẠO HỆ THỐNG VŨ TRỤ HẠT PHÁT SÁNG (PARTICLE NEBULA)
    // ==============================================================
    const particleCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const baseColor1 = new THREE.Color(0x6366f1); // Indigo
    const baseColor2 = new THREE.Color(0x10b981); // Emerald
    const baseColor3 = new THREE.Color(0xf59e0b); // Gold

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 350;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 350;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

      const mixedColor = i % 3 === 0 ? baseColor1 : (i % 3 === 1 ? baseColor2 : baseColor3);
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Material hạt tròn mềm
    const canvasPoint = document.createElement('canvas');
    canvasPoint.width = 16;
    canvasPoint.height = 16;
    const ctxPoint = canvasPoint.getContext('2d');
    const grad = ctxPoint.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctxPoint.fillStyle = grad;
    ctxPoint.fillRect(0, 0, 16, 16);

    const pointTexture = new THREE.CanvasTexture(canvasPoint);

    const pMaterial = new THREE.PointsMaterial({
      size: 4.5,
      vertexColors: true,
      map: pointTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    particleSystem = new THREE.Points(geometry, pMaterial);
    scene.add(particleSystem);

    // ==============================================================
    // 2. TẠO ĐỒ VẬT 3D: ĐỒNG XU VÀNG & KIM CƯƠNG KHÔNG GIAN
    // ==============================================================
    coinGroup = new THREE.Group();

    // Đồng xu vàng 3D (Cylinder có độ vát)
    const coinGeo = new THREE.CylinderGeometry(14, 14, 2.2, 36);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.22,
      emissive: 0x451a03,
      emissiveIntensity: 0.2
    });
    const coinMesh = new THREE.Mesh(coinGeo, coinMat);
    coinMesh.rotation.x = Math.PI / 2.5;
    coinGroup.add(coinMesh);

    // Viền phát sáng xung quanh đồng xu (Torus Ring)
    const ringGeo = new THREE.TorusGeometry(18, 0.7, 16, 60);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    coinGroup.add(ringMesh);

    // Kim Cương Không Gian 3D (Icosahedron)
    const gemGeo = new THREE.IcosahedronGeometry(9, 0);
    const gemMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.85,
      ior: 1.5,
      reflectivity: 0.9,
      clearcoat: 1.0,
      wireframe: true
    });
    gemMesh = new THREE.Mesh(gemGeo, gemMat);
    gemMesh.position.set(40, -25, 10);
    scene.add(gemMesh);

    // Đặt vị trí coinGroup ở góc trên bên phải trang nhã
    coinGroup.position.set(45, 30, 0);
    scene.add(coinGroup);

    // ==============================================================
    // 3. TẠO MẠNG LƯỚI KHÔNG GIAN CYBER WAVE (GRID)
    // ==============================================================
    const gridHelper = new THREE.GridHelper(300, 30, 0x6366f1, 0x1e293b);
    gridHelper.position.y = -60;
    gridHelper.position.z = -20;
    gridHelper.material.opacity = 0.25;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
    waveGrid = gridHelper;

    // ==============================================================
    // 4. BẮT SỰ KIỆN CHUỘT / CẢM ỨNG ĐỂ TẠO HIỆU ỨNG 3D PARALLAX
    // ==============================================================
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX - windowHalfX) * 0.08;
      mouseY = (e.clientY - windowHalfY) * 0.08;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        mouseX = (e.touches[0].clientX - windowHalfX) * 0.08;
        mouseY = (e.touches[0].clientY - windowHalfY) * 0.08;
      }
    }, { passive: true });

    // Xử lý Resize
    window.addEventListener('resize', () => {
      windowHalfX = window.innerWidth / 2;
      windowHalfY = window.innerHeight / 2;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Tự động tạm dừng animation khi người dùng chuyển tab để tiết kiệm pin
    document.addEventListener('visibilitychange', () => {
      isRunning = !document.hidden;
    });

    // ==============================================================
    // 5. VÒNG LẶP RENDER CHÍNH (60 FPS SMOOTH ANIMATION)
    // ==============================================================
    let clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      if (!isRunning) return;

      const elapsed = clock.getElapsedTime();

      // Camera di chuyển mềm theo con trỏ chuột
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;
      camera.position.x = targetX * 0.4;
      camera.position.y = -targetY * 0.4;
      camera.lookAt(scene.position);

      // Xoay nhẹ hệ thống hạt
      if (particleSystem) {
        particleSystem.rotation.y = elapsed * 0.035;
        particleSystem.rotation.x = Math.sin(elapsed * 0.02) * 0.05;
      }

      // Xoay đồng xu vàng 3D và nhấp nhô
      if (coinGroup) {
        coinGroup.rotation.y = elapsed * 0.6;
        coinGroup.rotation.z = Math.sin(elapsed * 0.5) * 0.2;
        coinGroup.position.y = 30 + Math.sin(elapsed * 1.2) * 4;
        ringMesh.rotation.x = elapsed * 0.4;
      }

      // Xoay kim cương
      if (gemMesh) {
        gemMesh.rotation.x = elapsed * 0.5;
        gemMesh.rotation.y = elapsed * 0.7;
        gemMesh.position.y = -25 + Math.cos(elapsed * 1.5) * 3;
      }

      // Sóng lưới
      if (waveGrid) {
        waveGrid.position.z = -20 + (elapsed * 4 % 10);
      }

      renderer.render(scene, camera);
    }
    animate();

    // ==============================================================
    // 6. TẠO 3D HUD CONTROLLER ĐỂ USER BẬT/TẮT/CHỈNH HIỆU ỨNG
    // ==============================================================
    window.toggleThreeSpatialMode = function(mode) {
      currentMode = mode || (currentMode === 'nebula' ? 'coins_gems' : (currentMode === 'coins_gems' ? 'off' : 'nebula'));
      if (currentMode === 'off') {
        canvas.style.opacity = '0';
        isRunning = false;
      } else {
        canvas.style.opacity = '0.75';
        isRunning = true;
        if (currentMode === 'nebula') {
          particleSystem.visible = true;
          coinGroup.visible = true;
          gemMesh.visible = true;
        } else if (currentMode === 'coins_gems') {
          particleSystem.visible = false;
          coinGroup.visible = true;
          gemMesh.visible = true;
        }
      }
      if (typeof playSound === 'function') playSound("pop");
    };

    window.burstThree3DParticles = function() {
      // Hiệu ứng tăng tốc xoay đồng xu & nổ hạt
      if (coinGroup) {
        coinGroup.rotation.y += 4.0;
      }
      if (typeof confetti === 'function') {
        confetti({ particleCount: 40, spread: 60, origin: { x: 0.85, y: 0.2 } });
      }
      if (typeof playSound === 'function') playSound("success");
    };

    // Tạo floating 3D badge ở góc màn hình
    let hudBadge = document.getElementById('three-hud-pill');
    if (!hudBadge) {
      hudBadge = document.createElement('div');
      hudBadge.id = 'three-hud-pill';
      hudBadge.className = 'fixed bottom-24 right-4 z-40 hidden sm:flex items-center gap-2 p-1.5 rounded-full custom-bg-card border custom-border custom-shadow-lg backdrop-blur-xl transition-all hover:scale-105 select-none';
      hudBadge.innerHTML = `
        <button onclick="burstThree3DParticles()" class="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center text-xs shadow-md shadow-orange-500/25 active:scale-90 transition-transform" title="Tương tác Đồng Xu 3D">
          🪙
        </button>
        <span class="text-[10px] font-black custom-text pr-2 flex items-center gap-1.5 cursor-pointer" onclick="toggleThreeSpatialMode()">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> 3D Engine
        </span>
      `;
      document.body.appendChild(hudBadge);
    }
  }
})();
