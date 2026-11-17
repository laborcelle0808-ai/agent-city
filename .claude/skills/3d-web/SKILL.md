---
name: 3d-web
description: 3D и WebGL на сайтах: Three.js, React Three Fiber, шейдеры, оптимизация. Используй для 3D-сцен и визуальных эффектов.
---
# 3D для веба
- **Базовая сцена:** renderer (antialias, setPixelRatio(min(dpr,2))), PerspectiveCamera, свет (HDRI environment + directional), resize-обработчик, requestAnimationFrame.
- **R3F:** <Canvas>, drei (OrbitControls, Environment, Float, MeshTransmissionMaterial, Text3D), postprocessing (Bloom, DOF).
- **Модели:** GLB + Draco/meshopt, gltf-transform для оптимизации.
- **Шейдеры:** ShaderMaterial, uniforms (uTime, uMouse), шумы simplex/fbm.
- **Интеграция со скроллом:** GSAP ScrollTrigger управляет камерой/uniforms.
- **Производительность:** draw calls < 100, инстансинг, текстуры ≤ 2K, KTX2, пауза рендера вне экрана, фоллбэк-изображение для слабых устройств.
- Проверка: скриншот через Playwright (chromium с WebGL).
