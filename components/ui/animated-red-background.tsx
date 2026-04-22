"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  getPreferredPixelRatio,
  getTargetFrameInterval,
  isLowEndDevice,
} from "@/lib/performance";

export default function AnimatedRedBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const lowEnd = isLowEndDevice();
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(getPreferredPixelRatio(lowEnd));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uNoiseOctaves: { value: lowEnd ? 3 : 5 },
      uLayerCount: { value: lowEnd ? 2 : 4 },
      uAnimationScale: { value: lowEnd ? 0.7 : 1.0 },
      uAlpha: { value: lowEnd ? 0.72 : 0.96 },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;

        uniform float uTime;
        uniform vec2 uResolution;
        uniform float uNoiseOctaves;
        uniform float uLayerCount;
        uniform float uAnimationScale;
        uniform float uAlpha;

        varying vec2 vUv;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);

          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));

          vec2 u = f * f * (3.0 - 2.0 * f);

          return mix(a, b, u.x) +
            (c - a) * u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
        }

        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.55;

          for (int i = 0; i < 5; i++) {
            if (float(i) >= uNoiseOctaves) {
              break;
            }
            value += amplitude * noise(p);
            p *= 2.02;
            amplitude *= 0.5;
          }

          return value;
        }

        void main() {
          vec2 uv = vUv;
          vec2 centered = uv - 0.5;
          centered.x *= uResolution.x / max(uResolution.y, 1.0);

          float iTime = uTime * uAnimationScale;
          vec2 flow = vec2(
            fbm(centered * 2.2 + vec2(iTime * 0.08, -iTime * 0.06)),
            fbm(centered * 2.0 + vec2(-iTime * 0.05, iTime * 0.09))
          );

          float field = fbm(centered * 3.4 + flow * 1.2);
          float glow = 0.0;

          for (int j = 0; j < 4; j++) {
            if (float(j) >= uLayerCount) {
              break;
            }
            float i = float(j) + 1.0;
            vec2 offset = vec2(
              sin(iTime * (0.12 + i * 0.02) + i * 1.7),
              cos(iTime * (0.1 + i * 0.025) + i * 2.3)
            ) * (0.16 + i * 0.045);

            vec2 warped = centered + flow * 0.16 - offset;
            float band = 1.0 - smoothstep(0.08, 0.72, length(warped) + field * 0.18);

            vec4 auroraColors = vec4(
              0.8 + 0.2 * sin(i * 0.2 + iTime * 0.4),
              0.05 + 0.1 * cos(i * 0.3 + iTime * 0.5),
              0.05 + 0.1 * sin(i * 0.4 + iTime * 0.3),
              1.0
            );

            glow += band * (0.22 + auroraColors.r * 0.32);
          }

          vec3 base = vec3(0.02, 0.0, 0.0);
          vec3 deep = vec3(0.14, 0.01, 0.01);
          vec3 mid = vec3(0.42, 0.03, 0.03);
          vec3 high = vec3(0.86, 0.08, 0.07);

          vec3 color = mix(base, deep, smoothstep(0.12, 0.5, field));
          color = mix(color, mid, smoothstep(0.28, 0.7, field + glow * 0.14));
          color = mix(color, high, smoothstep(0.5, 1.0, glow));

          float vignette = smoothstep(1.35, 0.22, length(centered));
          color *= vignette;

          gl_FragColor = vec4(color, uAlpha);
        }
      `,
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      renderer.setPixelRatio(getPreferredPixelRatio(lowEnd));
      renderer.setSize(bounds.width, bounds.height, false);
      uniforms.uResolution.value.set(bounds.width, bounds.height);
    };

    resize();
    window.addEventListener("resize", resize);

    const timer = new THREE.Timer();
    timer.connect(document);
    let frameId = 0;
    let lastTime = 0;
    const visible = { current: true };
    const running = { current: false };
    const frameInterval = getTargetFrameInterval(lowEnd);

    const stop = () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      }
      running.current = false;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry?.isIntersecting ?? true;

        if (visible.current) {
          timer.reset();
          lastTime = 0;
          if (!running.current) {
            running.current = true;
            frameId = requestAnimationFrame(animate);
          }
          return;
        }

        stop();
      },
      { threshold: 0.1 },
    );
    observer.observe(canvas);

    const animate = (time: number) => {
      if (!running.current || !visible.current) {
        return;
      }

      if (time - lastTime < frameInterval) {
        frameId = requestAnimationFrame(animate);
        return;
      }

      timer.update(time);
      uniforms.uTime.value = timer.getElapsed();
      renderer.render(scene, camera);
      lastTime = time;
      frameId = requestAnimationFrame(animate);
    };

    running.current = true;
    frameId = requestAnimationFrame(animate);

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("resize", resize);
      timer.dispose();
      material.dispose();
      mesh.geometry.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />;
}
