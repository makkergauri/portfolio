/* =============================================================
   HERO RENDER: a small progressive path tracer running in a shader.

   How it works (the same ideas as my C++ raytracer):
   - every frame traces a few more rays per pixel and averages them in,
     so the image starts noisy and converges within a couple of seconds
   - direct light sampling ("next event estimation") aims shadow rays at
     the key light, which is what makes it converge fast
   - drag on the hero to orbit the camera; the render restarts and
     converges again when you let go

   It publishes where each sphere lands on screen, so the vision layer
   (js/vision.js) can draw detection boxes around them.
   ============================================================= */
(function () {
  const canvas = document.getElementById('render');
  const hud = document.getElementById('samples');
  const hero = document.querySelector('.hero');
  if (!canvas) return;

  const root = document.documentElement;
  const MAX_SAMPLES = 1024;
  const small = Math.min(innerWidth, innerHeight) < 700;
  const SPP = small ? 2 : 4;                    // samples per pixel per frame

  function fail() { root.classList.add('no-webgl'); }
  if (!window.THREE) return fail();
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' }); }
  catch (e) { return fail(); }
  if (!renderer.getContext()) return fail();

  /* ---------- the scene (x, y, z, radius) ---------- */
  const SPHERES = [
    { p: [0.35, 0.80, 0.00], r: 0.80, label: 'glass_sphere' },
    { p: [1.85, 0.55, -0.90], r: 0.55, label: 'metal_sphere' },
    { p: [-0.95, 0.42, 0.80], r: 0.42, label: 'diffuse_sphere' },
    { p: [1.15, 0.25, 1.15], r: 0.25, label: 'sphere' }
  ];
  window.PT_SPHERES = SPHERES;

  const vert = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
  const sphDefs = SPHERES.map((s, i) => `const vec4 S${i} = vec4(${s.p.map(v => v.toFixed(3)).join(',')}, ${s.r.toFixed(3)});`).join('\n');

  const traceFrag = `
    #define SPP ${SPP}
    uniform sampler2D uPrev;
    uniform float uFrame;
    uniform vec2  uRes;
    uniform vec3  uCamPos;
    uniform vec3  uCamTarget;
    uniform float uFov;
    uniform float uTheme;      // 0 = night, 1 = day
    varying vec2 vUv;
    ${sphDefs}

    // ---- random numbers ----
    float cnt = 0.0;
    float h12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    float rnd(){ cnt += 1.0; return h12(gl_FragCoord.xy + vec2(cnt * 7.123 + mod(uFrame, 997.0) * 13.37, cnt * 3.917 + mod(uFrame, 991.0) * 1.713)); }
    vec3 randUnit(){ float z = rnd() * 2.0 - 1.0; float a = rnd() * 6.2831853; float r = sqrt(max(0.0, 1.0 - z * z)); return vec3(r * cos(a), r * sin(a), z); }

    // ---- lighting: one key light (a soft area light) + a sky ----
    vec3 keyDir(){ return normalize(vec3(-0.65, 0.62, 0.55)); }
    float keyCos(){ return uTheme < 0.5 ? 0.955 : 0.972; }
    vec3 keyRad(){ return uTheme < 0.5 ? vec3(7.5, 4.9, 2.5) : vec3(9.5, 8.6, 7.0); }
    vec3 sky(vec3 d){
      if (uTheme < 0.5) {
        vec3 s = mix(vec3(0.004, 0.004, 0.005), vec3(0.028, 0.024, 0.032), smoothstep(0.0, 0.7, d.y));
        float rim = smoothstep(0.975, 0.985, dot(d, normalize(vec3(0.9, 0.35, -0.8))));
        return s + rim * vec3(1.8, 0.35, 1.1);
      }
      return mix(vec3(0.36, 0.35, 0.33), vec3(0.24, 0.27, 0.34), smoothstep(0.0, 0.8, d.y));
    }

    bool hitSphere(vec3 ro, vec3 rd, vec4 s, inout float t, inout vec3 n){
      vec3 oc = ro - s.xyz; float b = dot(oc, rd); float c = dot(oc, oc) - s.w * s.w; float h = b * b - c;
      if (h < 0.0) return false; h = sqrt(h);
      float t0 = -b - h; if (t0 < 1e-3) t0 = -b + h;
      if (t0 < 1e-3 || t0 > t) return false;
      t = t0; n = (ro + rd * t0 - s.xyz) / s.w; return true;
    }
    bool occluded(vec3 ro, vec3 rd){
      float t = 1e9; vec3 n;
      // the glass sphere lets some light through, so it only half-blocks
      if (hitSphere(ro, rd, S1, t, n) || hitSphere(ro, rd, S2, t, n) || hitSphere(ro, rd, S3, t, n)) return true;
      return false;
    }
    float glassShadow(vec3 ro, vec3 rd){ float t = 1e9; vec3 n; return hitSphere(ro, rd, S0, t, n) ? 0.35 : 1.0; }

    float gridLine(vec2 q){ vec2 g = abs(fract(q) - 0.5); float d = 0.5 - max(g.x, g.y); return 1.0 - smoothstep(0.0, 0.012, d); }

    vec3 trace(vec3 ro, vec3 rd){
      vec3 acc = vec3(0.0), thr = vec3(1.0);
      bool afterDiffuse = false;
      vec3 kd = keyDir(); float kc = keyCos();
      for (int b = 0; b < 6; b++) {
        float t = 1e9; vec3 n = vec3(0.0); float mat = -1.0; vec3 col = vec3(1.0);
        if (hitSphere(ro, rd, S0, t, n)) { mat = 2.0; }
        if (hitSphere(ro, rd, S1, t, n)) { mat = 1.0; col = uTheme < 0.5 ? vec3(0.92, 0.88, 0.84) : vec3(0.62, 0.62, 0.64); }
        if (hitSphere(ro, rd, S2, t, n)) { mat = 0.0; col = vec3(0.96, 0.50, 0.08); }
        if (hitSphere(ro, rd, S3, t, n)) { mat = 0.0; col = vec3(0.90, 0.07, 0.38); }
        if (rd.y < 0.0) {
          float tg = -ro.y / rd.y;
          if (tg > 1e-3 && tg < t) {
            t = tg; n = vec3(0.0, 1.0, 0.0); mat = 0.0;
            vec3 p = ro + rd * tg;
            float g = gridLine(p.xz * 1.25);
            vec3 base = uTheme < 0.5 ? vec3(0.075, 0.07, 0.065) : vec3(0.62, 0.60, 0.57);
            vec3 line = uTheme < 0.5 ? vec3(0.22, 0.19, 0.16) : vec3(0.44, 0.42, 0.40);
            float fade = exp(-0.035 * dot(p.xz - vec2(0.4, 0.0), p.xz - vec2(0.4, 0.0)));
            col = mix(base, line, g) * mix(0.0, 1.0, fade) + (uTheme < 0.5 ? vec3(0.0) : vec3(0.62, 0.61, 0.58) * (1.0 - fade));
          }
        }
        if (mat < 0.0) {
          // hit the environment. After a diffuse bounce the key light was already
          // counted by direct sampling, so only add the sky.
          vec3 e = sky(rd);
          if (!afterDiffuse && dot(rd, kd) > kc) e += keyRad();
          acc += thr * e; break;
        }
        vec3 p = ro + rd * t;
        if (mat < 0.5) {
          // direct light: aim one shadow ray at a random point on the key light
          float ct = 1.0 - rnd() * (1.0 - kc); float st = sqrt(max(0.0, 1.0 - ct * ct)); float ph = rnd() * 6.2831853;
          vec3 u = normalize(cross(abs(kd.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0), kd)); vec3 v = cross(kd, u);
          vec3 l = normalize(u * cos(ph) * st + v * sin(ph) * st + kd * ct);
          float ndl = dot(n, l);
          if (ndl > 0.0 && !occluded(p + n * 1e-3, l)) {
            acc += thr * col * keyRad() * ndl * 2.0 * (1.0 - kc) * glassShadow(p + n * 1e-3, l);
          }
          thr *= col; rd = normalize(n + randUnit()); ro = p + n * 1e-3; afterDiffuse = true;
        } else if (mat < 1.5) {
          thr *= col; rd = normalize(reflect(rd, n) + 0.05 * randUnit()); ro = p + n * 1e-3; afterDiffuse = false;
          if (dot(rd, n) <= 0.0) break;
        } else {
          float ior = 1.5; vec3 nn = n; float eta = 1.0 / ior;
          if (dot(rd, n) > 0.0) { nn = -n; eta = ior; }
          float c = min(dot(-rd, nn), 1.0);
          float r0 = (1.0 - ior) / (1.0 + ior); r0 *= r0;
          float fr = r0 + (1.0 - r0) * pow(1.0 - c, 5.0);
          vec3 rf = refract(rd, nn, eta);
          if (dot(rf, rf) < 1e-6 || rnd() < fr) { rd = reflect(rd, nn); ro = p + nn * 1e-3; }
          else { rd = rf; ro = p - nn * 1e-3; }
          thr *= vec3(0.985, 0.99, 1.0); afterDiffuse = false;
        }
        if (b > 2) { float q = max(thr.r, max(thr.g, thr.b)); if (rnd() > q) break; thr /= q; }
      }
      return acc;
    }

    void main(){
      vec3 fw = normalize(uCamTarget - uCamPos);
      vec3 rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
      vec3 up = cross(rt, fw);
      float d = 0.5 / tan(radians(uFov) * 0.5);
      vec3 sum = vec3(0.0);
      for (int s = 0; s < SPP; s++) {
        vec2 jit = vec2(rnd(), rnd()) - 0.5;
        vec2 uv = (gl_FragCoord.xy + jit - 0.5 * uRes) / uRes.y;
        vec3 rd = normalize(uv.x * rt + uv.y * up + d * fw);
        sum += min(trace(uCamPos, rd), vec3(10.0));     // clamp fireflies
      }
      vec3 col = sum / float(SPP);
      vec3 prev = texture2D(uPrev, vUv).rgb;
      gl_FragColor = vec4(mix(prev, col, 1.0 / (uFrame + 1.0)), 1.0);
    }`;

  const showFrag = `
    uniform sampler2D uTex; uniform vec3 uBg; uniform float uExposure; varying vec2 vUv;
    vec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
    void main(){
      vec3 c = texture2D(uTex, vUv).rgb;
      c = pow(aces(c * uExposure), vec3(1.0 / 2.2));
      c = mix(c, uBg, smoothstep(0.78, 1.0, vUv.y) * 0.85);   // melt the top edge into the page
      gl_FragColor = vec4(c, 1.0);
    }`;

  const gl2 = renderer.capabilities.isWebGL2;
  const halfOK = gl2 || renderer.extensions.get('OES_texture_half_float');
  const rtOpts = { type: halfOK ? THREE.HalfFloatType : THREE.UnsignedByteType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, stencilBuffer: false };
  let rtA = new THREE.WebGLRenderTarget(2, 2, rtOpts), rtB = new THREE.WebGLRenderTarget(2, 2, rtOpts);
  const quad = new THREE.PlaneGeometry(2, 2), cam = new THREE.Camera();
  const traceMat = new THREE.ShaderMaterial({
    vertexShader: vert, fragmentShader: traceFrag,
    uniforms: { uPrev: { value: null }, uFrame: { value: 0 }, uRes: { value: new THREE.Vector2() }, uCamPos: { value: new THREE.Vector3() }, uCamTarget: { value: new THREE.Vector3() }, uFov: { value: 34 }, uTheme: { value: 0 } }
  });
  const showMat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: showFrag, uniforms: { uTex: { value: null }, uBg: { value: new THREE.Color() }, uExposure: { value: 1.1 } } });
  const traceScene = new THREE.Scene(); traceScene.add(new THREE.Mesh(quad, traceMat));
  const showScene = new THREE.Scene(); showScene.add(new THREE.Mesh(quad, showMat));

  /* ---------- camera: orbits around a target; drag to move ---------- */
  const target = new THREE.Vector3();
  const orbit = { yaw: 0, pitch: 0, dist: 0, baseYaw: 0, basePitch: 0 };
  const camPos = new THREE.Vector3();
  function frameCamera() {
    const portrait = canvas.clientHeight > canvas.clientWidth;
    let pos;
    if (portrait) { pos = new THREE.Vector3(0.45, 1.9, 8.6); target.set(0.45, 0.95, 0); traceMat.uniforms.uFov.value = 38; }
    else { pos = new THREE.Vector3(-0.2, 1.35, 5.6); target.set(0.25, 0.6, 0); traceMat.uniforms.uFov.value = 34; }
    const v = pos.clone().sub(target);
    orbit.dist = v.length(); orbit.baseYaw = orbit.yaw = Math.atan2(v.x, v.z); orbit.basePitch = orbit.pitch = Math.asin(v.y / orbit.dist);
    placeCamera();
  }
  function placeCamera() {
    camPos.set(Math.sin(orbit.yaw) * Math.cos(orbit.pitch), Math.sin(orbit.pitch), Math.cos(orbit.yaw) * Math.cos(orbit.pitch)).multiplyScalar(orbit.dist).add(target);
    frame = 0;
    window.dispatchEvent(new CustomEvent('pt:camera', { detail: camera() }));
  }
  function camera() { return { pos: camPos.clone(), target: target.clone(), fov: traceMat.uniforms.uFov.value, w: canvas.clientWidth, h: canvas.clientHeight }; }
  window.PT_camera = camera;

  let frame = 0, visible = true, lastShown = -1;

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    const scale = (small ? 0.5 : 0.6) * Math.min(devicePixelRatio, 1.5);
    renderer.setPixelRatio(1); renderer.setSize(w, h, false);
    const rw = Math.max(2, Math.round(w * scale)), rh = Math.max(2, Math.round(h * scale));
    rtA.setSize(rw, rh); rtB.setSize(rw, rh); traceMat.uniforms.uRes.value.set(rw, rh);
    frameCamera();
  }
  function setTheme() {
    const light = root.dataset.theme === 'light';
    traceMat.uniforms.uTheme.value = light ? 1 : 0;
    showMat.uniforms.uExposure.value = light ? 1.05 : 1.1;
    showMat.uniforms.uBg.value.set(getComputedStyle(root).getPropertyValue('--bg').trim() || '#121110');
    frame = 0;
  }

  // drag to orbit (desktop). Limited range so the scene always stays framed.
  let drag = null;
  if (hero && matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('a, button')) return;
      drag = { x: e.clientX, y: e.clientY, yaw: orbit.yaw, pitch: orbit.pitch };
      hero.classList.add('dragging'); hero.setPointerCapture(e.pointerId);
    });
    hero.addEventListener('pointermove', e => {
      if (!drag) return;
      orbit.yaw = Math.max(orbit.baseYaw - 0.7, Math.min(orbit.baseYaw + 0.7, drag.yaw - (e.clientX - drag.x) * 0.004));
      orbit.pitch = Math.max(0.08, Math.min(0.55, drag.pitch + (e.clientY - drag.y) * 0.003));
      placeCamera();
    });
    const end = () => { drag = null; hero.classList.remove('dragging'); };
    hero.addEventListener('pointerup', end); hero.addEventListener('pointercancel', end);
  }

  function tick() {
    requestAnimationFrame(tick);
    if (!visible) return;
    if (frame * SPP < MAX_SAMPLES) {
      traceMat.uniforms.uPrev.value = rtA.texture;
      traceMat.uniforms.uFrame.value = frame;
      traceMat.uniforms.uCamPos.value.copy(camPos);
      traceMat.uniforms.uCamTarget.value.copy(target);
      renderer.setRenderTarget(rtB); renderer.render(traceScene, cam);
      [rtA, rtB] = [rtB, rtA]; frame++;
    }
    if (frame !== lastShown) {
      showMat.uniforms.uTex.value = rtA.texture;
      renderer.setRenderTarget(null); renderer.render(showScene, cam);
      lastShown = frame;
      const samples = frame * SPP;
      if (hud) hud.textContent = samples;
      root.classList.toggle('converged', samples >= 96 && !drag);
      window.dispatchEvent(new CustomEvent('pt:samples', { detail: samples }));
    }
  }

  addEventListener('resize', resize);
  window.addEventListener('themechange', setTheme);
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(canvas);
  setTheme(); resize();
  requestAnimationFrame(tick);
})();
