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
  uColor5: { value: unknown };
  uColor6: { value: unknown };
  uSpeed: { value: number };
  uIntensity: { value: number };
  uTouchTexture: { value: ThreeTextureLike };
  uGrainIntensity: { value: number };
  uDarkBase: { value: unknown };
  uGradientSize: { value: number };
  uGradientCount: { value: number };
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
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
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
      uColor3: { value: new THREE.Vector3(0.72, 0.02, 0.05) },
      uColor4: { value: new THREE.Vector3(0.12, 0.01, 0.01) },
      uColor5: { value: new THREE.Vector3(1.0, 0.16, 0.14) },
      uColor6: { value: new THREE.Vector3(0.02, 0.02, 0.02) },
      uSpeed: { value: this.lowEnd ? 0.82 : 1.2 },
      uIntensity: { value: this.lowEnd ? 1.28 : 1.8 },
      uTouchTexture: { value: this.touchTexture.texture },
      uGrainIntensity: { value: this.lowEnd ? 0.035 : 0.08 },
      uDarkBase: { value: new THREE.Vector3(0.0, 0.0, 0.0) },
      uGradientSize: { value: 0.45 },
      uGradientCount: { value: 12.0 },
      uColor1Weight: { value: 1.2 },
      uColor2Weight: { value: 0.9 },
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
        uniform float uTime, uSpeed, uIntensity, uGrainIntensity, uGradientSize, uGradientCount, uColor1Weight, uColor2Weight;
        uniform vec2 uResolution;
        uniform vec3 uColor1, uColor2, uColor3, uColor4, uColor5, uColor6, uDarkBase;
        uniform sampler2D uTouchTexture;
        varying vec2 vUv;

        float grain(vec2 uv, float t) {
          return fract(sin(dot(uv * uResolution * 0.5 + t, vec2(12.9898, 78.233))) * 43758.5453) * 2.0 - 1.0;
        }

        vec3 getGradientColor(vec2 uv, float time) {
          vec2 c1 = vec2(0.5 + sin(time * uSpeed * 0.4) * 0.4, 0.5 + cos(time * uSpeed * 0.5) * 0.4);
          vec2 c2 = vec2(0.5 + cos(time * uSpeed * 0.6) * 0.5, 0.5 + sin(time * uSpeed * 0.45) * 0.5);
          vec2 c3 = vec2(0.5 + sin(time * uSpeed * 0.35) * 0.45, 0.5 + cos(time * uSpeed * 0.55) * 0.45);
          vec2 c4 = vec2(0.5 + cos(time * uSpeed * 0.5) * 0.4, 0.5 + sin(time * uSpeed * 0.4) * 0.4);
          vec2 c5 = vec2(0.5 + sin(time * uSpeed * 0.7) * 0.35, 0.5 + cos(time * uSpeed * 0.6) * 0.35);
          vec2 c6 = vec2(0.5 + cos(time * uSpeed * 0.45) * 0.5, 0.5 + sin(time * uSpeed * 0.65) * 0.5);

          float i1 = 1.0 - smoothstep(0.0, uGradientSize, length(uv - c1));
          float i2 = 1.0 - smoothstep(0.0, uGradientSize, length(uv - c2));
          float i3 = 1.0 - smoothstep(0.0, uGradientSize, length(uv - c3));
          float i4 = 1.0 - smoothstep(0.0, uGradientSize, length(uv - c4));
          float i5 = 1.0 - smoothstep(0.0, uGradientSize, length(uv - c5));
          float i6 = 1.0 - smoothstep(0.0, uGradientSize, length(uv - c6));

          vec3 color = vec3(0.0);
          color += uColor1 * i1 * (0.55 + 0.45 * sin(time * uSpeed)) * uColor1Weight;
          color += uColor2 * i2 * (0.55 + 0.45 * cos(time * uSpeed * 1.2)) * uColor2Weight;
          color += uColor3 * i3 * (0.55 + 0.45 * sin(time * uSpeed * 0.8)) * uColor1Weight;
          color += uColor4 * i4 * (0.55 + 0.45 * cos(time * uSpeed * 1.3)) * uColor2Weight;
          color += uColor5 * i5 * (0.55 + 0.45 * sin(time * uSpeed * 1.1)) * uColor1Weight;
          color += uColor6 * i6 * (0.55 + 0.45 * cos(time * uSpeed * 0.9)) * uColor2Weight;

          color = clamp(color, vec3(0.0), vec3(1.0)) * uIntensity;
          float lum = dot(color, vec3(0.299, 0.587, 0.114));
          color = mix(vec3(lum), color, 1.2);
          color = pow(color, vec3(0.94));
          float brightness = length(color);
          color = mix(uDarkBase, color, max(brightness * 1.15, 0.18));
          return color;
        }

        void main() {
          vec2 uv = vUv;
          vec4 touchTex = texture2D(uTouchTexture, uv);
          uv.x -= (touchTex.r * 2.0 - 1.0) * 0.8 * touchTex.b;
          uv.y -= (touchTex.g * 2.0 - 1.0) * 0.8 * touchTex.b;

          vec2 center = vec2(0.5);
          float dist = length(uv - center);
          float ripple = sin(dist * 20.0 - uTime * 3.0) * 0.04 * touchTex.b;
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
  const sectionVisibleRef = useRef(true);
  const [isReady, setIsReady] = useState(false);
  const [showCursor, setShowCursor] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });

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
        sectionVisibleRef.current = isVisible;
        nextApp.setVisible(isVisible);
      },
      { threshold: 0.1 },
    );
    visibilityObserver.observe(section);
    let pointerFrame = 0;
    const pendingPointer = { x: 0, y: 0, dirty: false };

    const flushPointer = () => {
      pointerFrame = 0;

      if (!pendingPointer.dirty) {
        return;
      }

      pendingPointer.dirty = false;
      nextApp.handlePointerMove(pendingPointer.x, pendingPointer.y);
    };

    const queuePointerMove = (x: number, y: number) => {
      mousePos.current = { x, y };

      if (reducedMotion) {
        return;
      }

      pendingPointer.x = x;
      pendingPointer.y = y;
      pendingPointer.dirty = true;

      if (!pointerFrame) {
        pointerFrame = window.requestAnimationFrame(flushPointer);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      queuePointerMove(x, y);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const rect = section.getBoundingClientRect();
      const touch = event.touches[0];

      if (!touch) {
        return;
      }

      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      queuePointerMove(x, y);
    };

    const handleMouseEnter = () => {
      if (!reducedMotion) {
        setShowCursor(true);
      }
    };

    const handleMouseLeave = () => {
      setShowCursor(false);
    };

    section.addEventListener("mousemove", handleMouseMove);
    section.addEventListener("touchmove", handleTouchMove, { passive: true });
    section.addEventListener("mouseenter", handleMouseEnter);
    section.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.cancelAnimationFrame(revealFrame);
      section.removeEventListener("mousemove", handleMouseMove);
      section.removeEventListener("touchmove", handleTouchMove);
      section.removeEventListener("mouseenter", handleMouseEnter);
      section.removeEventListener("mouseleave", handleMouseLeave);
      window.cancelAnimationFrame(pointerFrame);
      visibilityObserver.disconnect();
      nextApp.cleanup();
      if (appRef.current === nextApp) {
        appRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;

    if (!cursor || !dot) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      return;
    }

    let cursorX = 0;
    let cursorY = 0;
    let dotX = 0;
    let dotY = 0;
    let frameId = 0;

    const animateCursor = () => {
      if (!sectionVisibleRef.current) {
        frameId = requestAnimationFrame(animateCursor);
        return;
      }

      cursorX += (mousePos.current.x - cursorX) * 0.12;
      cursorY += (mousePos.current.y - cursorY) * 0.12;
      dotX += (mousePos.current.x - dotX) * 0.3;
      dotY += (mousePos.current.y - dotY) * 0.3;

      cursor.style.transform = `translate(${cursorX - 20}px, ${cursorY - 20}px)`;
      dot.style.transform = `translate(${dotX - 4}px, ${dotY - 4}px)`;

      frameId = requestAnimationFrame(animateCursor);
    };

    animateCursor();

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        className="forge-hero"
      >
        <div className="hero-fallback-background" aria-hidden="true" />
        <div
          className={`hero-animation-layer ${isReady ? "is-visible" : ""}`}
          aria-hidden="true"
        >
          <div ref={backgroundRef} className="liquid-canvas-wrapper" />
        </div>

        <div className={`hero-ui-layer ${isReady ? "is-visible" : ""}`}>
          <div
            ref={cursorRef}
            className="cursor-ring"
            style={{ opacity: showCursor ? 1 : 0 }}
          />
          <div
            ref={cursorDotRef}
            className="cursor-dot-element"
            style={{ opacity: showCursor ? 1 : 0 }}
          />

          <div className="hero-copy">
            <h1 className="title-main">FORGE</h1>
            <p className="subtitle-main">
              Built for strength. Designed for performance.
            </p>
          </div>

          <Link href="/shop" className="cta-btn">
            Shop Now
          </Link>
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
        .hero-animation-layer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }

        .hero-fallback-background {
          background:
            radial-gradient(circle at 18% 22%, rgba(255, 58, 58, 0.24), transparent 34%),
            radial-gradient(circle at 82% 18%, rgba(153, 0, 0, 0.22), transparent 32%),
            radial-gradient(circle at 52% 78%, rgba(110, 0, 0, 0.18), transparent 40%),
            linear-gradient(135deg, #020202 0%, #120202 42%, #050505 72%, #000000 100%);
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
          transition: opacity 420ms ease;
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

        .hero-copy {
          position: relative;
          z-index: 20;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 0 1.5rem;
        }

        .title-main {
          position: relative;
          z-index: 20;
          margin: 0;
          text-align: center;
          font-size: clamp(4rem, 12vw, 8.5rem);
          line-height: 0.88;
          font-weight: 900;
          letter-spacing: -0.08em;
          color: rgba(255, 255, 255, 0.98);
          text-wrap: balance;
          pointer-events: none;
          will-change: transform, opacity;
          text-shadow:
            0 18px 60px rgba(0, 0, 0, 0.6),
            0 0 42px rgba(255, 34, 34, 0.28);
        }

        .subtitle-main {
          position: relative;
          z-index: 20;
          max-width: 40rem;
          margin: 0;
          text-align: center;
          font-size: clamp(1rem, 2.2vw, 1.5rem);
          line-height: 1.35;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.9);
          will-change: transform, opacity;
          text-shadow:
            0 10px 30px rgba(0, 0, 0, 0.45),
            0 0 26px rgba(255, 34, 34, 0.18);
          pointer-events: none;
        }

        .cta-btn {
          position: absolute;
          left: 50%;
          bottom: 4.5rem;
          z-index: 20;
          transform: translateX(-50%);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 999px;
          background: rgba(18, 0, 0, 0.58);
          color: rgba(255, 255, 255, 0.96);
          padding: 1rem 1.85rem;
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          text-decoration: none;
          backdrop-filter: blur(12px);
          will-change: transform, opacity;
          box-shadow:
            0 16px 40px rgba(0, 0, 0, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
          transition:
            transform 0.3s ease,
            background-color 0.3s ease,
            border-color 0.3s ease;
        }

        .cta-btn:hover {
          transform: translateX(-50%) translateY(-2px);
          border-color: rgba(255, 80, 80, 0.34);
          background: rgba(42, 0, 0, 0.76);
        }

        .cursor-ring,
        .cursor-dot-element {
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 30;
          transition: opacity 0.2s ease;
          will-change: transform, opacity;
        }

        .cursor-ring {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(8px);
        }

        .cursor-dot-element {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.9);
        }

        @media (max-width: 768px) {
          .forge-hero {
            min-height: calc(100vh - 4rem);
          }

          .hero-copy {
            padding: 0 1rem;
            gap: 0.75rem;
          }

          .title-main {
            font-size: clamp(3.25rem, 15vw, 5rem);
          }

          .subtitle-main {
            font-size: clamp(0.95rem, 4vw, 1.15rem);
          }

          .cta-btn {
            bottom: 3.25rem;
            width: calc(100% - 2rem);
            max-width: 20rem;
          }

          .cursor-ring,
          .cursor-dot-element {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-animation-layer,
          .hero-ui-layer,
          .cta-btn,
          .cursor-ring,
          .cursor-dot-element {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
