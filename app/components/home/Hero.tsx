"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  getPreferredPixelRatio,
  getTargetFrameInterval,
  isLowEndDevice,
} from "@/lib/performance";

interface TouchPoint {
  x: number;
  y: number;
  age: number;
  force: number;
  vx: number;
  vy: number;
}

interface ThreeVector2Like {
  set: (x: number, y: number) => void;
}

interface ThreeDisposableLike {
  dispose: () => void;
}

interface ThreeTextureLike extends ThreeDisposableLike {
  needsUpdate: boolean;
}

interface ThreeRendererLike extends ThreeDisposableLike {
  domElement: HTMLCanvasElement;
  setPixelRatio: (ratio: number) => void;
  setSize: (width: number, height: number) => void;
  render: (scene: unknown, camera: unknown) => void;
}

interface ThreeCameraLike {
  fov: number;
  aspect: number;
  position: { z: number };
  updateProjectionMatrix: () => void;
}

interface ThreeTimerLike extends ThreeDisposableLike {
  connect: (target: Document) => void;
  reset: () => void;
  update: (time?: number) => void;
  getDelta: () => number;
}

interface ThreeMeshLike {
  geometry: ThreeDisposableLike;
  material: ThreeDisposableLike;
}

interface HeroUniforms {
  uTime: { value: number };
  uResolution: { value: ThreeVector2Like };
  uColor1: { value: unknown };
  uColor2: { value: unknown };
  uColor3: { value: unknown };
  uColor4: { value: unknown };
  uSpeed: { value: number };
  uIntensity: { value: number };
  uTouchTexture: { value: ThreeTextureLike };
  uGrainIntensity: { value: number };
  uDarkBase: { value: unknown };
  uGradientSize: { value: number };
  uColor1Weight: { value: number };
  uColor2Weight: { value: number };
}

class TouchTexture {
  size = 64;
  width = 64;
  height = 64;
  maxAge = 64;
  radius = 0.1;
  speed = 1 / 64;
  trail: TouchPoint[] = [];
  last: { x: number; y: number } | null = null;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: ThreeTextureLike;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext("2d")!;
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.texture = new THREE.Texture(this.canvas);
  }

  update() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let index = this.trail.length - 1; index >= 0; index -= 1) {
      const point = this.trail[index];
      const force = point.force * this.speed * (1 - point.age / this.maxAge);

      point.x += point.vx * force;
      point.y += point.vy * force;
      point.age += 1;

      if (point.age > this.maxAge) {
        this.trail.splice(index, 1);
      } else {
        this.drawPoint(point);
      }
    }

    this.texture.needsUpdate = true;
  }

  addTouch(point: { x: number; y: number }) {
    let force = 0;
    let vx = 0;
    let vy = 0;

    if (this.last) {
      const dx = point.x - this.last.x;
      const dy = point.y - this.last.y;

      if (dx === 0 && dy === 0) {
        return;
      }

      const distance = Math.sqrt(dx * dx + dy * dy);
      vx = dx / distance;
      vy = dy / distance;
      force = Math.min((dx * dx + dy * dy) * 20000, 2.0);
    }

    this.last = { x: point.x, y: point.y };
    this.trail.push({ x: point.x, y: point.y, age: 0, force, vx, vy });
  }

  drawPoint(point: TouchPoint) {
    const position = {
      x: point.x * this.width,
      y: (1 - point.y) * this.height,
    };

    let intensity =
      point.age < this.maxAge * 0.3
        ? Math.sin((point.age / (this.maxAge * 0.3)) * (Math.PI / 2))
        : -(
            (1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7)) *
            ((1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7)) - 2)
          );

    intensity *= point.force;

    const color = `${((point.vx + 1) / 2) * 255}, ${((point.vy + 1) / 2) * 255}, ${
      intensity * 255
    }`;
    const radius = this.radius * this.width;

    this.ctx.shadowOffsetX = this.size * 5;
    this.ctx.shadowOffsetY = this.size * 5;
    this.ctx.shadowBlur = radius;
    this.ctx.shadowColor = `rgba(${color},${0.2 * intensity})`;
    this.ctx.beginPath();
    this.ctx.fillStyle = "rgba(255,0,0,1)";
    this.ctx.arc(
      position.x - this.size * 5,
      position.y - this.size * 5,
      radius,
      0,
      Math.PI * 2,
    );
    this.ctx.fill();
  }

  dispose() {
    this.texture.dispose();
  }
}

class HeroAnimationApp {
  renderer: ThreeRendererLike;
  scene: { add: (object: unknown) => void; remove: (object: unknown) => void; background?: unknown };
  camera: ThreeCameraLike;
  timer: ThreeTimerLike;
  touchTexture: TouchTexture;
  container: HTMLElement;
  animationFrame: number | null = null;
  lowEnd: boolean;
  frameInterval: number;
  lastFrameTime = 0;
  isVisible = true;
  isRunning = false;
  mesh: ThreeMeshLike | null = null;
  resizeHandler: () => void;
  uniforms: HeroUniforms;

  constructor(container: HTMLElement) {
    this.container = container;
    this.lowEnd = isLowEndDevice();
    this.frameInterval = getTargetFrameInterval(this.lowEnd);
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: this.lowEnd ? "low-power" : "high-performance",
    });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      10000,
    );
    this.camera.position.z = 50;
    this.timer = new THREE.Timer();
    this.timer.connect(document);
    this.touchTexture = new TouchTexture();
    this.resizeHandler = () => {};

    this.uniforms = {
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(container.clientWidth, container.clientHeight),
      },
      uColor1: { value: new THREE.Vector3(0.93, 0.06, 0.08) },
      uColor2: { value: new THREE.Vector3(0.05, 0.01, 0.01) },
      uColor3: { value: new THREE.Vector3(0.58, 0.03, 0.05) },
      uColor4: { value: new THREE.Vector3(0.11, 0.02, 0.02) },
      uSpeed: { value: this.lowEnd ? 0.6 : 0.78 },
      uIntensity: { value: this.lowEnd ? 0.9 : 1.1 },
      uTouchTexture: { value: this.touchTexture.texture },
      uGrainIntensity: { value: this.lowEnd ? 0.015 : 0.03 },
      uDarkBase: { value: new THREE.Vector3(0.0, 0.0, 0.0) },
      uGradientSize: { value: this.lowEnd ? 0.58 : 0.5 },
      uColor1Weight: { value: 1.0 },
      uColor2Weight: { value: 0.72 },
    };

    this.scene.background = new THREE.Color(0x000000);
    this.renderer.setPixelRatio(getPreferredPixelRatio(this.lowEnd));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    this.init();
  }

  getViewSize() {
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = Math.abs(this.camera.position.z * Math.tan(fov / 2) * 2);

    return {
      width: height * this.camera.aspect,
      height,
    };
  }

  init() {
    const viewSize = this.getViewSize();
    const geometry = new THREE.PlaneGeometry(viewSize.width, viewSize.height, 1, 1);
    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          vUv = uv;
        }
      `,
      fragmentShader: `
        uniform float uTime, uSpeed, uIntensity, uGrainIntensity, uGradientSize, uColor1Weight, uColor2Weight;
        uniform vec2 uResolution;
        uniform vec3 uColor1, uColor2, uColor3, uColor4, uDarkBase;
        uniform sampler2D uTouchTexture;
        varying vec2 vUv;

        float grain(vec2 uv, float t) {
          return fract(sin(dot(uv * uResolution * 0.5 + t, vec2(12.9898, 78.233))) * 43758.5453) * 2.0 - 1.0;
        }

        vec3 getGradientColor(vec2 uv, float time) {
          vec2 c1 = vec2(0.5 + sin(time * uSpeed * 0.32) * 0.34, 0.5 + cos(time * uSpeed * 0.36) * 0.28);
          vec2 c2 = vec2(0.5 + cos(time * uSpeed * 0.42) * 0.4, 0.5 + sin(time * uSpeed * 0.3) * 0.34);
          vec2 c3 = vec2(0.5 + sin(time * uSpeed * 0.28) * 0.3, 0.5 + cos(time * uSpeed * 0.4) * 0.38);
          vec2 c4 = vec2(0.5 + cos(time * uSpeed * 0.34) * 0.3, 0.5 + sin(time * uSpeed * 0.38) * 0.28);

          float i1 = 1.0 - smoothstep(0.0, uGradientSize, length(uv - c1));
          float i2 = 1.0 - smoothstep(0.0, uGradientSize, length(uv - c2));
          float i3 = 1.0 - smoothstep(0.0, uGradientSize, length(uv - c3));
          float i4 = 1.0 - smoothstep(0.0, uGradientSize, length(uv - c4));

          vec3 color = vec3(0.0);
          color += uColor1 * i1 * (0.62 + 0.28 * sin(time * uSpeed)) * uColor1Weight;
          color += uColor2 * i2 * (0.58 + 0.24 * cos(time * uSpeed * 1.1)) * uColor2Weight;
          color += uColor3 * i3 * (0.6 + 0.22 * sin(time * uSpeed * 0.82)) * uColor1Weight;
          color += uColor4 * i4 * (0.56 + 0.2 * cos(time * uSpeed * 0.95)) * uColor2Weight;

          color = clamp(color, vec3(0.0), vec3(1.0)) * uIntensity;
          float brightness = dot(color, vec3(0.299, 0.587, 0.114));
          color = mix(uDarkBase, color, max(brightness * 1.08, 0.16));
          return color;
        }

        void main() {
          vec2 uv = vUv;
          vec4 touchTex = texture2D(uTouchTexture, uv);
          float touchInfluence = touchTex.b * 0.45;
          uv.x -= (touchTex.r * 2.0 - 1.0) * touchInfluence;
          uv.y -= (touchTex.g * 2.0 - 1.0) * touchInfluence;

          vec2 center = vec2(0.5);
          float dist = length(uv - center);
          float ripple = sin(dist * 14.0 - uTime * 2.2) * 0.016 * touchTex.b;
          uv += vec2(ripple);

          vec3 color = getGradientColor(uv, uTime);
          color += grain(uv, uTime) * uGrainIntensity;
          color = clamp(color, vec3(0.0), vec3(1.0));
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);

    this.resizeHandler = () => {
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setPixelRatio(getPreferredPixelRatio(this.lowEnd));
      this.renderer.setSize(width, height);
      this.uniforms.uResolution.value.set(width, height);

      if (this.mesh) {
        const nextViewSize = this.getViewSize();
        this.mesh.geometry.dispose();
        this.mesh.geometry = new THREE.PlaneGeometry(
          nextViewSize.width,
          nextViewSize.height,
          1,
          1,
        );
      }
    };

    window.addEventListener("resize", this.resizeHandler);

    this.start();
  }

  handlePointerMove(x: number, y: number) {
    if (!this.isVisible) {
      return;
    }

    this.touchTexture.addTouch({
      x: x / this.container.clientWidth,
      y: 1 - y / this.container.clientHeight,
    });
  }

  setVisible(isVisible: boolean) {
    if (this.isVisible === isVisible) {
      return;
    }

    this.isVisible = isVisible;

    if (isVisible) {
      this.lastFrameTime = 0;
      this.timer.reset();
      this.start();
      return;
    }

    this.stop();
  }

  start() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.animationFrame = requestAnimationFrame(this.tick);
  }

  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    this.isRunning = false;
  }

  tick = (time = 0) => {
    if (!this.isRunning || !this.isVisible) {
      return;
    }

    if (time - this.lastFrameTime < this.frameInterval) {
      this.animationFrame = requestAnimationFrame(this.tick);
      return;
    }

    this.timer.update(time);
    const delta = Math.min(this.timer.getDelta(), 0.1);
    this.touchTexture.update();
    this.uniforms.uTime.value += delta;
    this.renderer.render(this.scene, this.camera);
    this.lastFrameTime = time;
    this.animationFrame = requestAnimationFrame(this.tick);
  };

  cleanup() {
    this.stop();

    window.removeEventListener("resize", this.resizeHandler);

    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.mesh = null;
    }

    this.touchTexture.dispose();
    this.timer.dispose();
    this.renderer.dispose();

    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<HeroAnimationApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const container = backgroundRef.current;
    const revealFrame = window.requestAnimationFrame(() => {
      setIsReady(true);
    });

    if (!section || !container) {
      window.cancelAnimationFrame(revealFrame);
      return;
    }

    if (appRef.current) {
      appRef.current.cleanup();
      appRef.current = null;
    }

    const nextApp = new HeroAnimationApp(container);
    appRef.current = nextApp;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry?.isIntersecting ?? true;
        nextApp.setVisible(isVisible);
      },
      { threshold: 0.1 },
    );
    visibilityObserver.observe(section);
    let pointerFrame = 0;
    const pendingPointer = { x: 0, y: 0, dirty: false };
    let sectionBounds = section.getBoundingClientRect();

    const flushPointer = () => {
      pointerFrame = 0;

      if (!pendingPointer.dirty) {
        return;
      }

      pendingPointer.dirty = false;
      nextApp.handlePointerMove(pendingPointer.x, pendingPointer.y);
    };

    const queuePointerMove = (clientX: number, clientY: number) => {
      if (reducedMotion) {
        return;
      }

      pendingPointer.x = clientX - sectionBounds.left;
      pendingPointer.y = clientY - sectionBounds.top;
      pendingPointer.dirty = true;

      if (!pointerFrame) {
        pointerFrame = window.requestAnimationFrame(flushPointer);
      }
    };

    const updateBounds = () => {
      sectionBounds = section.getBoundingClientRect();
    };

    const handlePointerMove = (event: PointerEvent) => {
      queuePointerMove(event.clientX, event.clientY);
    };

    const handlePointerEnter = () => {
      updateBounds();
    };

    window.addEventListener("resize", updateBounds);
    window.addEventListener("scroll", updateBounds, { passive: true });
    section.addEventListener("pointermove", handlePointerMove, { passive: true });
    section.addEventListener("pointerenter", handlePointerEnter);

    return () => {
      window.cancelAnimationFrame(revealFrame);
      window.removeEventListener("resize", updateBounds);
      window.removeEventListener("scroll", updateBounds);
      section.removeEventListener("pointermove", handlePointerMove);
      section.removeEventListener("pointerenter", handlePointerEnter);
      window.cancelAnimationFrame(pointerFrame);
      visibilityObserver.disconnect();
      nextApp.cleanup();
      if (appRef.current === nextApp) {
        appRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        className="forge-hero"
      >
        <div className="hero-fallback-background" aria-hidden="true" />
        <div className="hero-atmosphere" aria-hidden="true" />
        <div className="hero-noise-overlay" aria-hidden="true" />
        <div
          className={`hero-animation-layer ${isReady ? "is-visible" : ""}`}
          aria-hidden="true"
        >
          <div ref={backgroundRef} className="liquid-canvas-wrapper" />
        </div>

        <div className={`hero-ui-layer ${isReady ? "is-visible" : ""}`}>
          <div className="hero-copy-shell">
            <div className="hero-copy">
              <h1 className="title-main">
                <span className="title-wordmark">
                  FORGE GYM
                  <sup className="title-trademark">™</sup>
                </span>
              </h1>
              <p className="subtitle-main">
                Built for strength. Designed for performance.
              </p>
              <Link href="/shop" className="cta-btn">
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .forge-hero {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          isolation: isolate;
          background: #000;
        }

        .hero-fallback-background,
        .hero-animation-layer,
        .hero-atmosphere,
        .hero-noise-overlay {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }

        .hero-fallback-background {
          background:
            radial-gradient(circle at 16% 22%, rgba(165, 18, 18, 0.24), transparent 34%),
            radial-gradient(circle at 78% 28%, rgba(104, 10, 10, 0.18), transparent 32%),
            linear-gradient(160deg, #010101 0%, #090202 42%, #020202 74%, #000000 100%);
        }

        .hero-atmosphere {
          background:
            radial-gradient(circle at 50% 18%, rgba(255, 255, 255, 0.035), transparent 30%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(0, 0, 0, 0.16) 36%, rgba(0, 0, 0, 0.4) 100%);
          opacity: 0.9;
          transform: translate3d(0, 0, 0) scale(1.02);
          animation: heroAtmosphereShift 18s ease-in-out infinite alternate;
          will-change: transform, opacity;
          pointer-events: none;
        }

        .hero-noise-overlay {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.018), rgba(255, 255, 255, 0.018)),
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.03) 0.6px, transparent 0.8px),
            radial-gradient(circle at 72% 64%, rgba(255, 255, 255, 0.02) 0.6px, transparent 0.8px);
          background-size: 100% 100%, 18px 18px, 22px 22px;
          background-position: center, 0 0, 11px 9px;
          mix-blend-mode: soft-light;
          opacity: 0.085;
          pointer-events: none;
        }

        .hero-animation-layer {
          pointer-events: none;
          opacity: 0;
          transition: opacity 420ms ease;
          will-change: opacity;
        }

        .hero-animation-layer.is-visible {
          opacity: 1;
        }

        .hero-ui-layer {
          position: absolute;
          inset: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 360ms ease;
          will-change: opacity;
        }

        .hero-ui-layer.is-visible {
          opacity: 1;
        }

        .liquid-canvas-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .liquid-canvas-wrapper canvas {
          width: 100% !important;
          height: 100% !important;
          display: block;
        }

        .hero-copy-shell {
          position: relative;
          z-index: 20;
          width: min(100%, 72rem);
          padding: clamp(6rem, 10vw, 8rem) 1.5rem 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-copy {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.25rem;
          max-width: min(92vw, 58rem);
          text-align: center;
          transform: translate3d(0, 18px, 0);
          opacity: 0;
          transition:
            transform 420ms ease,
            opacity 420ms ease;
          will-change: transform, opacity;
        }

        .hero-ui-layer.is-visible .hero-copy {
          transform: translate3d(0, 0, 0);
          opacity: 1;
        }

        .title-main {
          margin: 0;
          font-size: clamp(3.75rem, 8.6vw, 7.75rem);
          line-height: 0.9;
          font-weight: 900;
          letter-spacing: 0;
          color: rgba(255, 255, 255, 0.98);
          text-wrap: balance;
          pointer-events: none;
          text-shadow:
            0 10px 30px rgba(0, 0, 0, 0.34),
            0 0 24px rgba(142, 18, 18, 0.12);
        }

        .title-wordmark {
          position: relative;
          display: inline-block;
          padding-right: 0.18em;
          white-space: nowrap;
        }

        .title-trademark {
          position: absolute;
          top: 0.04em;
          right: 0;
          transform: translate(82%, -12%);
          font-size: clamp(0.78rem, 1.25vw, 1.08rem);
          line-height: 1;
          font-weight: 900;
          letter-spacing: 0;
        }

        .subtitle-main {
          margin: 0;
          max-width: 28rem;
          font-size: clamp(1rem, 1.6vw, 1.125rem);
          line-height: 1.5;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: rgba(255, 255, 255, 0.78);
          pointer-events: none;
        }

        .cta-btn {
          margin-top: 0.5rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 3.5rem;
          min-width: 11rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.075);
          color: rgba(255, 255, 255, 0.96);
          padding: 0.95rem 1.5rem;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none;
          backdrop-filter: blur(8px);
          will-change: transform, opacity;
          transition:
            transform 0.2s ease,
            opacity 0.2s ease,
            background-color 0.3s ease,
            border-color 0.3s ease,
            box-shadow 0.3s ease;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            0 0 0 1px rgba(150, 18, 18, 0.08);
        }

        .cta-btn:hover {
          transform: translate3d(0, -2px, 0);
          opacity: 0.98;
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            0 0 0 1px rgba(184, 26, 26, 0.16),
            0 0 18px rgba(128, 12, 12, 0.12);
        }

        .forge-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background:
            radial-gradient(circle at center, transparent 42%, rgba(0, 0, 0, 0.14) 72%, rgba(0, 0, 0, 0.34) 100%);
        }

        @keyframes heroAtmosphereShift {
          0% {
            transform: translate3d(-1.5%, -1%, 0) scale(1.02);
            opacity: 0.82;
          }
          100% {
            transform: translate3d(1.5%, 1%, 0) scale(1.06);
            opacity: 0.96;
          }
        }

        @media (max-width: 768px) {
          .forge-hero {
            min-height: calc(100vh - 4rem);
          }

          .hero-copy-shell {
            padding: 5.5rem 1rem 2.5rem;
          }

          .hero-copy {
            gap: 1rem;
          }

          .title-main {
            font-size: clamp(2.55rem, 12.5vw, 4.45rem);
          }

          .subtitle-main {
            font-size: clamp(0.95rem, 4vw, 1.05rem);
          }

          .cta-btn {
            width: calc(100% - 2rem);
            max-width: 20rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-atmosphere,
          .hero-animation-layer,
          .hero-ui-layer,
          .hero-copy,
          .cta-btn {
            transition: none;
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
