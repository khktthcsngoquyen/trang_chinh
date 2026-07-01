(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================= BOOT SEQUENCE INTRO ================= */
  (function boot() {
    const overlay = document.getElementById('bootOverlay');
    const linesEl = document.getElementById('bootLines');
    const barFill = document.getElementById('bootBarFill');
    const skipBtn = document.getElementById('bootSkip');
    if (!overlay) return;

    if (reduceMotion) {
      overlay.classList.add('hidden');
      return;
    }

    const script = [
      { text: '> khoi_tao_ket_noi_an_toan...', cls: '' },
      { text: '> nap_giao_thuc_phong_thu...', cls: '' },
      { text: '> quet_moi_de_doa... KHONG PHAT HIEN', cls: 'ok' },
      { text: '> ket_noi_hiep_si_mang... THANH CONG', cls: 'ok' },
    ];

    let li = 0, ci = 0;
    function typeNext() {
      if (li >= script.length) {
        barFill.style.width = '100%';
        setTimeout(finish, 400);
        return;
      }
      const row = script[li];
      if (ci === 0) {
        const div = document.createElement('div');
        div.className = 'line ' + row.cls;
        div.id = 'bootRow' + li;
        linesEl.appendChild(div);
      }
      const row_el = document.getElementById('bootRow' + li);
      ci++;
      row_el.textContent = row.text.slice(0, ci);
      barFill.style.width = Math.round(((li + ci / row.text.length) / script.length) * 100) + '%';
      if (ci < row.text.length) {
        setTimeout(typeNext, 14 + Math.random() * 18);
      } else {
        li++; ci = 0;
        setTimeout(typeNext, 220);
      }
    }
    function finish() {
      overlay.classList.add('hidden');
    }
    skipBtn && skipBtn.addEventListener('click', finish);
    setTimeout(typeNext, 350);
    // absolute safety net in case something stalls
    setTimeout(finish, 4200);
  })();

  /* ================= SCROLL PROGRESS BAR ================= */
  const progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    function updateProgress() {
      const h = document.documentElement;
      const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
      progressBar.style.transform = `scaleX(${Math.min(Math.max(scrolled, 0), 1)})`;
    }
    document.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* ================= CUSTOM CURSOR ================= */
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  if (cursorDot && cursorRing && !reduceMotion && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      cursorDot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
    function ringLoop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      cursorRing.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(ringLoop);
    }
    requestAnimationFrame(ringLoop);
    document.querySelectorAll('a, button, .tilt-card').forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
    });
  }

  /* ================= SPOTLIGHT GLOW (mouse-follow on dark sections) ================= */
  document.querySelectorAll('.spotlight').forEach(section => {
    section.addEventListener('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      section.style.setProperty('--mx', x + '%');
      section.style.setProperty('--my', y + '%');
    });
  });

  /* ================= MATRIX RAIN (reusable) ================= */
  function initMatrix(canvas, opts = {}) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const chars = '01アカサタナハマヤラワ0123456789<>/*+-=$#&%';
    let cols, drops, w, h;
    const fontSize = opts.fontSize || 15;
    const color = opts.color || '#3dffa0';

    function resize() {
      w = canvas.width = canvas.offsetWidth * devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      cols = Math.floor(canvas.offsetWidth / fontSize);
      drops = new Array(cols).fill(0).map(() => Math.random() * -50);
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      ctx.fillStyle = 'rgba(4,7,5,0.14)';
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      ctx.fillStyle = color;
      ctx.font = fontSize + 'px monospace';
      for (let i = 0; i < cols; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.offsetHeight && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    if (reduceMotion) {
      // draw a single static-ish frame, no loop
      for (let i = 0; i < 40; i++) draw();
      return;
    }
    let last = 0;
    function loop(ts) {
      if (ts - last > 55) { draw(); last = ts; }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  initMatrix(document.getElementById('matrix-bg'), { fontSize: 16, color: '#2fdc85' });
  initMatrix(document.getElementById('ctaMatrix'), { fontSize: 14, color: '#3dffa0' });

  /* ================= HERO — hạt sáng trôi dạt phủ trên ảnh gốc ================= */
  const heroParticles = document.getElementById('heroParticles');
  if (heroParticles && !reduceMotion) {
    const ctx = heroParticles.getContext('2d');
    let particles = [];
    function resizeParticles() {
      heroParticles.width = heroParticles.offsetWidth * devicePixelRatio;
      heroParticles.height = heroParticles.offsetHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      const count = Math.round((heroParticles.offsetWidth * heroParticles.offsetHeight) / 26000);
      particles = new Array(count).fill(0).map(makeParticle);
    }
    function makeParticle() {
      const colors = ['#3dffa0', '#5eeaf0', '#ffffff'];
      return {
        x: Math.random() * heroParticles.offsetWidth,
        y: Math.random() * heroParticles.offsetHeight,
        r: 0.6 + Math.random() * 1.6,
        vy: -0.15 - Math.random() * 0.35,
        vx: (Math.random() - 0.5) * 0.15,
        tw: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    }
    resizeParticles();
    window.addEventListener('resize', resizeParticles);

    function drawParticles() {
      ctx.clearRect(0, 0, heroParticles.offsetWidth, heroParticles.offsetHeight);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.tw += 0.05;
        if (p.y < -10) { p.y = heroParticles.offsetHeight + 10; p.x = Math.random() * heroParticles.offsetWidth; }
        const alpha = 0.35 + Math.sin(p.tw) * 0.3;
        ctx.globalAlpha = Math.max(alpha, 0.05);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(drawParticles);
    }
    requestAnimationFrame(drawParticles);
  }

  /* ================= HERO — nghiêng nhẹ ảnh gốc theo chuột (3D tilt) ================= */
  const heroFrame = document.getElementById('heroFrame');
  const heroBgImage = document.getElementById('heroBgImage');
  if (heroFrame && heroBgImage && !reduceMotion) {
    let targetX = 0, targetY = 0, curX = 0, curY = 0;
    heroFrame.addEventListener('mousemove', (e) => {
      const rect = heroFrame.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    });
    heroFrame.addEventListener('mouseleave', () => { targetX = 0; targetY = 0; });

    function animateTilt() {
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;
      const rotY = curX * 2.2;
      const rotX = -curY * 2.2;
      heroBgImage.style.transform = `scale(1.04) rotateY(${rotY}deg) rotateX(${rotX}deg)`;
      requestAnimationFrame(animateTilt);
    }
    requestAnimationFrame(animateTilt);
  }

  /* ================= HERO — ticker trạng thái hệ thống (kiểu bảng điều khiển hacker) ================= */
  const heroTickerText = document.getElementById('heroTickerText');
  if (heroTickerText) {
    const lines = [
      'QUÉT MỐI ĐE DỌA: 0 PHÁT HIỆN',
      'TƯỜNG LỬA: ĐANG HOẠT ĐỘNG',
      'MÃ HÓA: AES-256 BẬT',
      'GIÁM SÁT MẠNG: 24/7',
      'TRẠNG THÁI: AN TOÀN'
    ];

    if (reduceMotion) {
      heroTickerText.textContent = lines[0];
    } else {
      let li = 0, ci = 0, deleting = false;
      function tick() {
        const current = lines[li];
        if (!deleting) {
          ci++;
          heroTickerText.textContent = current.slice(0, ci);
          if (ci >= current.length) {
            setTimeout(() => { deleting = true; tick(); }, 1800);
            return;
          }
        } else {
          ci--;
          heroTickerText.textContent = current.slice(0, ci);
          if (ci <= 0) {
            deleting = false;
            li = (li + 1) % lines.length;
            setTimeout(tick, 300);
            return;
          }
        }
        setTimeout(tick, deleting ? 22 : 38);
      }
      tick();
    }
  }

  /* ================= WIREFRAME 3D OBJECTS (engine dùng chung: khối lập phương, bát diện, vòng halo...) ================= */
  function initWireObject(canvas, opts = {}) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const type = opts.type || 'cube';
    const color = opts.color || '#3dffa0';
    const color2 = opts.color2 || color;
    const baseSpeed = opts.speed != null ? opts.speed : 0.008;
    const size = opts.size || 1;

    let verts = [], edges = [];
    function buildCube(s) {
      verts = [];
      for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) verts.push([x * s, y * s, z * s]);
      edges = [];
      for (let i = 0; i < verts.length; i++) for (let j = i + 1; j < verts.length; j++) {
        const d = verts[i].reduce((a, v, k) => a + Math.abs(v - verts[j][k]), 0);
        if (Math.abs(d - 2 * s) < 0.001) edges.push([i, j]);
      }
    }
    function buildOcta(s) {
      verts = [[s, 0, 0], [-s, 0, 0], [0, s, 0], [0, -s, 0], [0, 0, s], [0, 0, -s]];
      edges = [];
      for (let i = 0; i < verts.length; i++) for (let j = i + 1; j < verts.length; j++) {
        const opposite = verts[i][0] === -verts[j][0] && verts[i][1] === -verts[j][1] && verts[i][2] === -verts[j][2];
        if (!opposite) edges.push([i, j]);
      }
    }
    function buildRing(s, n) {
      verts = [];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        verts.push([Math.cos(a) * s, 0, Math.sin(a) * s * 0.42]);
      }
      edges = [];
      for (let i = 0; i < n; i++) edges.push([i, (i + 1) % n]);
    }

    if (type === 'cube') buildCube(size);
    else if (type === 'octahedron') buildOcta(size);
    else if (type === 'ring') buildRing(size, opts.points || 22);

    let cw, ch, cx, cy, scale;
    function resize() {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      cw = canvas.offsetWidth; ch = canvas.offsetHeight;
      cx = cw / 2; cy = ch / 2;
      scale = Math.min(cw, ch) * (opts.scaleFactor || 0.34);
    }
    resize();
    window.addEventListener('resize', resize);

    let mx = 0, my = 0;
    if (opts.mouseReactive) {
      const el = opts.parallaxEl || canvas.parentElement;
      el && el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        mx = ((e.clientX - rect.left) / rect.width - 0.5) * 1.4;
        my = ((e.clientY - rect.top) / rect.height - 0.5) * 1.4;
      });
      el && el.addEventListener('mouseleave', () => { mx = 0; my = 0; });
    }

    function rotate(p, ry, rx) {
      const [x, y, z] = p;
      const cosY = Math.cos(ry), sinY = Math.sin(ry);
      const x1 = x * cosY - z * sinY, z1 = x * sinY + z * cosY;
      const cosX = Math.cos(rx), sinX = Math.sin(rx);
      const y1 = y * cosX - z1 * sinX, z2 = y * sinX + z1 * cosX;
      return [x1, y1, z2];
    }
    function project(p) {
      const perspective = 3.4;
      const f = perspective / (perspective + p[2]);
      return [cx + p[0] * scale * f, cy + p[1] * scale * f, f];
    }

    let rotY = Math.random() * Math.PI * 2;
    let tiltX = opts.tilt != null ? opts.tilt : 0.5;
    function draw() {
      ctx.clearRect(0, 0, cw, ch);
      rotY += baseSpeed;
      const targetTilt = (opts.tilt != null ? opts.tilt : 0.5) + my * 0.4;
      tiltX += (targetTilt - tiltX) * 0.04;
      const projected = verts.map(v => project(rotate(v, rotY + mx * 0.5, tiltX)));
      ctx.lineWidth = opts.lineWidth || 1.3;
      edges.forEach(([a, b]) => {
        const pa = projected[a], pb = projected[b];
        const avgF = (pa[2] + pb[2]) / 2;
        ctx.strokeStyle = color;
        ctx.globalAlpha = Math.max(0.22, Math.min(1, avgF));
        ctx.shadowBlur = 8; ctx.shadowColor = color;
        ctx.beginPath();
        ctx.moveTo(pa[0], pa[1]);
        ctx.lineTo(pb[0], pb[1]);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
      if (opts.showNodes !== false) {
        projected.forEach(p => {
          ctx.fillStyle = color2;
          ctx.shadowBlur = 10; ctx.shadowColor = color2;
          ctx.beginPath();
          ctx.arc(p[0], p[1], Math.max(1, 2.3 * p[2]), 0, Math.PI * 2);
          ctx.fill();
        });
      }
    }

    if (reduceMotion) { draw(); return; }
    let last = 0;
    function loop(ts) {
      if (ts - last > 30) { draw(); last = ts; }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  // hero: khối lập phương wireframe xoay, phản ứng theo chuột trong khung ảnh
  initWireObject(document.getElementById('heroCubeCanvas'), {
    type: 'cube', color: '#3dffa0', color2: '#eafaf0', size: 1,
    speed: 0.01, scaleFactor: 0.4, mouseReactive: true, parallaxEl: document.getElementById('heroFrame')
  });

  // threats: kim cương bát diện wireframe "cảnh báo" đỏ-xanh xoay chậm
  initWireObject(document.getElementById('threatWireCanvas'), {
    type: 'octahedron', color: '#e6394f', color2: '#3dffa0', size: 1,
    speed: 0.013, scaleFactor: 0.4, tilt: 0.7
  });

  // knights: vòng hào quang wireframe xoay quanh khiên trung tâm
  initWireObject(document.getElementById('knightHaloCanvas'), {
    type: 'ring', color: '#5eeaf0', color2: '#3dffa0', size: 1, points: 26,
    speed: 0.016, scaleFactor: 0.46, tilt: 1.15, showNodes: true, lineWidth: 1
  });

  // final CTA: khối lập phương wireframe nhỏ xoay ngược chiều, tạo điểm nhấn
  initWireObject(document.getElementById('ctaWireCanvas'), {
    type: 'cube', color: '#3dffa0', color2: '#5eeaf0', size: 0.9,
    speed: -0.011, scaleFactor: 0.38, tilt: 0.6
  });

  /* ================= SOC — QUẢ CẦU MẠNG LƯỚI 3D (wireframe globe) ================= */
  const globeCanvas = document.getElementById('globeCanvas');
  if (globeCanvas) {
    const gctx = globeCanvas.getContext('2d');
    let gw, gh, radius, points = [], links = [];

    function buildSphere() {
      points = [];
      const ringsCount = 9, perRing = 14;
      for (let r = 0; r < ringsCount; r++) {
        const lat = (Math.PI * (r + 0.5)) / ringsCount - Math.PI / 2;
        for (let a = 0; a < perRing; a++) {
          const lon = (Math.PI * 2 * a) / perRing;
          points.push({
            x: Math.cos(lat) * Math.cos(lon),
            y: Math.sin(lat),
            z: Math.cos(lat) * Math.sin(lon),
          });
        }
      }
      // a handful of glowing "node" indices with pulse offset
      links = [];
      for (let i = 0; i < 10; i++) {
        links.push({
          from: Math.floor(Math.random() * points.length),
          to: Math.floor(Math.random() * points.length),
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    function resizeGlobe() {
      gw = globeCanvas.width = globeCanvas.offsetWidth * devicePixelRatio;
      gh = globeCanvas.height = globeCanvas.offsetHeight * devicePixelRatio;
      gctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      radius = Math.min(globeCanvas.offsetWidth, globeCanvas.offsetHeight) * 0.36;
    }
    buildSphere();
    resizeGlobe();
    window.addEventListener('resize', resizeGlobe);

    let angleY = 0;
    let mxG = 0;
    globeCanvas.parentElement.addEventListener('mousemove', (e) => {
      const rect = globeCanvas.getBoundingClientRect();
      mxG = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    });

    function project(p, rotY, rotX) {
      // rotate around Y
      let x = p.x * Math.cos(rotY) - p.z * Math.sin(rotY);
      let z = p.x * Math.sin(rotY) + p.z * Math.cos(rotY);
      let y = p.y;
      // rotate around X (slight tilt)
      let y2 = y * Math.cos(rotX) - z * Math.sin(rotX);
      let z2 = y * Math.sin(rotX) + z * Math.cos(rotX);
      const persp = 2.4 / (2.4 - z2);
      return {
        x: x * radius * persp + globeCanvas.offsetWidth / 2,
        y: y2 * radius * persp + globeCanvas.offsetHeight / 2,
        z: z2,
        scale: persp
      };
    }

    function drawGlobe(ts) {
      gctx.clearRect(0, 0, globeCanvas.offsetWidth, globeCanvas.offsetHeight);
      angleY += reduceMotion ? 0 : 0.0022 + mxG * 0.0015;
      const rotX = 0.5;

      const projected = points.map(p => project(p, angleY, rotX));

      // faint latitude/longitude mesh lines
      gctx.strokeStyle = 'rgba(61,255,160,.12)';
      gctx.lineWidth = 1;
      const perRing = 14, ringsCount = 9;
      for (let r = 0; r < ringsCount; r++) {
        gctx.beginPath();
        for (let a = 0; a <= perRing; a++) {
          const idx = r * perRing + (a % perRing);
          const pt = projected[idx];
          if (a === 0) gctx.moveTo(pt.x, pt.y); else gctx.lineTo(pt.x, pt.y);
        }
        gctx.stroke();
      }

      // nodes
      projected.forEach((pt) => {
        const alpha = 0.25 + (pt.scale - 0.7) * 0.6;
        gctx.beginPath();
        gctx.fillStyle = `rgba(94,234,240,${Math.max(0.15, Math.min(alpha, 0.9))})`;
        gctx.arc(pt.x, pt.y, 1.4 * pt.scale, 0, Math.PI * 2);
        gctx.fill();
      });

      // pulsing data links (arcs between two "nodes")
      links.forEach(link => {
        const a = projected[link.from], b = projected[link.to];
        const t = (Math.sin((ts || 0) * 0.0015 + link.phase) + 1) / 2;
        gctx.beginPath();
        gctx.strokeStyle = `rgba(61,255,160,${0.15 + t * 0.35})`;
        gctx.lineWidth = 1.2;
        const midX = (a.x + b.x) / 2, midY = (a.y + b.y) / 2 - 26;
        gctx.moveTo(a.x, a.y);
        gctx.quadraticCurveTo(midX, midY, b.x, b.y);
        gctx.stroke();
      });

      // core glow
      const centerX = globeCanvas.offsetWidth / 2, centerY = globeCanvas.offsetHeight / 2;
      const grad = gctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.1);
      grad.addColorStop(0, 'rgba(61,255,160,.10)');
      grad.addColorStop(1, 'rgba(61,255,160,0)');
      gctx.fillStyle = grad;
      gctx.beginPath();
      gctx.arc(centerX, centerY, radius * 1.1, 0, Math.PI * 2);
      gctx.fill();

      requestAnimationFrame(drawGlobe);
    }
    requestAnimationFrame(drawGlobe);
  }

  /* ================= SOC — NHẬT KÝ TERMINAL MÔ PHỎNG ================= */
  const terminalBody = document.getElementById('terminalBody');
  if (terminalBody) {
    const logPool = [
      { t: '[OK] Quét thiết bị hoàn tất — không phát hiện mã độc', cls: 'ok' },
      { t: '[!] Phát hiện liên kết đáng ngờ → đã chặn tự động', cls: 'warn' },
      { t: '[i] 128 học sinh đang học an toàn trực tuyến', cls: 'info' },
      { t: '[OK] Cập nhật bộ lọc chống lừa đảo', cls: 'ok' },
      { t: '[!] Cảnh báo: mật khẩu yếu được phát hiện', cls: 'warn' },
      { t: '[OK] Xác thực 2 lớp đang hoạt động', cls: 'ok' },
      { t: '[i] Đồng bộ tài liệu khóa học mới nhất', cls: 'info' },
      { t: '[OK] Không có rò rỉ dữ liệu trong 24 giờ qua', cls: 'ok' },
    ];
    const MAX_LINES = 7;

    function addLine() {
      const item = logPool[Math.floor(Math.random() * logPool.length)];
      const div = document.createElement('div');
      div.className = 'line ' + item.cls;
      terminalBody.appendChild(div);

      if (reduceMotion) {
        div.textContent = item.t;
      } else {
        let i = 0;
        const typeChar = () => {
          div.textContent = item.t.slice(0, i);
          i++;
          if (i <= item.t.length) {
            setTimeout(typeChar, 16);
          } else {
            const caret = document.createElement('span');
            caret.className = 'term-caret';
            div.appendChild(caret);
            setTimeout(() => caret.remove(), 900);
          }
        };
        typeChar();
      }

      while (terminalBody.children.length > MAX_LINES) {
        terminalBody.removeChild(terminalBody.firstChild);
      }
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    addLine();
    setInterval(addLine, reduceMotion ? 2600 : 2600);
  }

  /* ================= STAT COUNTERS (đếm số + hiệu ứng) ================= */
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        obs.unobserve(el);
        if (reduceMotion) { el.textContent = target + suffix; return; }
        const duration = 1400;
        const start = performance.now();
        function step(now) {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = Math.round(target * eased);
          el.textContent = val + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    obs.observe(el);
  });

  /* ================= TILT CARDS (threats / knights) ================= */
  if (!reduceMotion) {
    document.querySelectorAll('.tilt-card').forEach(card => {
      const inner = card.querySelector('.tilt-inner');
      if (!inner) return;
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        inner.style.transform = `rotateY(${px * 14}deg) rotateX(${-py * 14}deg) translateZ(10px)`;
      });
      card.addEventListener('mouseleave', () => {
        inner.style.transform = 'rotateY(0deg) rotateX(0deg) translateZ(0)';
      });
    });
  }

  /* ================= SCROLL REVEAL ================= */
  document.querySelectorAll('.threat-card, .knight-card, .knight-center, .section-head, .soc-globe-wrap, .soc-terminal, .stat-item').forEach(el => {
    el.classList.add('reveal');
  });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  /* stagger threat cards / knight cards slightly */
  document.querySelectorAll('.threat-grid .reveal').forEach((el, i) => {
    el.style.transitionDelay = (i * 0.08) + 's';
  });
  document.querySelectorAll('.knight-grid .reveal').forEach((el, i) => {
    el.style.transitionDelay = (i * 0.12) + 's';
  });
  document.querySelectorAll('.stat-strip .reveal').forEach((el, i) => {
    el.style.transitionDelay = (i * 0.08) + 's';
  });

  /* ================= BUTTON RIPPLE / CLICK PULSE ================= */
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.style.transform = 'scale(0.94)';
      setTimeout(() => { btn.style.transform = ''; }, 140);
    });
  });
})();
