'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    FluidCursor?: new (options?: Record<string, unknown>) => { canvas?: HTMLCanvasElement };
    __fluidCursorScriptPromise?: Promise<void>;
    __fluidCursorInstance?: { canvas?: HTMLCanvasElement };
  }
}

const SCRIPT_ID = 'fluid-cursor-local-script';
const SCRIPT_SRC = '/vendor/fluid-cursor.js';
const CUSTOM_CANVAS_ID = 'cursor-custom-effect-canvas';

export type CursorEffectMode =
  | 'package'
  | 'ink-water'
  | 'comet-engine'
  | 'off';

const applyCanvasStyle = (canvas: HTMLCanvasElement, visible: boolean) => {
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = '10000';
  canvas.style.pointerEvents = 'none';
  canvas.style.display = visible ? 'block' : 'none';
  canvas.style.opacity = '0.85';
  canvas.style.mixBlendMode = 'normal';
};

const hidePackageCanvas = () => {
  const existingCanvas = window.__fluidCursorInstance?.canvas;
  if (existingCanvas) applyCanvasStyle(existingCanvas, false);
};

export default function CursorFluidEffect({ active, mode }: { active: boolean; mode: CursorEffectMode }) {
  useEffect(() => {
    const existingCustom = document.getElementById(CUSTOM_CANVAS_ID);
    if (existingCustom?.parentNode) {
      existingCustom.parentNode.removeChild(existingCustom);
    }

    if (!active || mode === 'off') {
      hidePackageCanvas();
      return;
    }

    if (mode === 'package') {
      const getScriptPromise = () => {
        if (!window.__fluidCursorScriptPromise) {
          window.__fluidCursorScriptPromise = new Promise<void>((resolve, reject) => {
            let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
            if (!script) {
              script = document.createElement('script');
              script.id = SCRIPT_ID;
              script.src = SCRIPT_SRC;
              script.async = true;
              document.head.appendChild(script);
            }

            if (script.dataset.loaded === 'true') {
              resolve();
              return;
            }

            script.addEventListener(
              'load',
              () => {
                script!.dataset.loaded = 'true';
                resolve();
              },
              { once: true },
            );
            script.addEventListener('error', () => reject(new Error('Failed to load fluid cursor script')), { once: true });
          });
        }
        return window.__fluidCursorScriptPromise;
      };

      const resolveCtor = () =>
        window.FluidCursor ??
        (new Function('return typeof FluidCursor !== "undefined" ? FluidCursor : undefined;')() as
          | (new (options?: Record<string, unknown>) => { canvas?: HTMLCanvasElement })
          | undefined);

      const dpr = window.devicePixelRatio || 1;
      const shortSide = Math.min(window.innerWidth, window.innerHeight);
      const shouldUseBalancedProfile = dpr > 1.25 || shortSide < 900;

      const options = {
        SIM_RESOLUTION: shouldUseBalancedProfile ? 48 : 64,
        DYE_RESOLUTION: shouldUseBalancedProfile ? 384 : 512,
        PRESSURE_ITERATIONS: shouldUseBalancedProfile ? 10 : 12,
        SPLAT_FORCE: 2800,
        SPLAT_RADIUS: 0.16,
        DENSITY_DISSIPATION: 4.2,
        VELOCITY_DISSIPATION: 2.8,
        // Lower color update speed to avoid visible flicker on slow cursor movement.
        COLOR_UPDATE_SPEED: 2,
        TRANSPARENT: true,
        SHADING: false,
      };

      let cancelled = false;
      void getScriptPromise()
        .then(() => {
          if (cancelled) return;
          if (!window.__fluidCursorInstance) {
            const Ctor = resolveCtor();
            if (!Ctor) return;
            window.__fluidCursorInstance = new Ctor(options);
          }

          const canvas = window.__fluidCursorInstance?.canvas;
          if (!canvas) return;
          if (!canvas.parentNode) {
            document.body.appendChild(canvas);
          }
          applyCanvasStyle(canvas, true);
        })
        .catch(() => {
          // Keep app usable even if effect fails.
        });

      return () => {
        cancelled = true;
        hidePackageCanvas();
      };
    }

    hidePackageCanvas();
    const canvas = document.createElement('canvas');
    canvas.id = CUSTOM_CANVAS_ID;
    applyCanvasStyle(canvas, true);
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    type P = { x: number; y: number; vx: number; vy: number; life: number; size: number };
    type R = { x: number; y: number; radius: number; life: number };

    const particles: P[] = [];
    const ripples: R[] = [];
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let lastMoveTime = performance.now();
    let frame = 0;
    let rafId = 0;
    let running = true;

    const resize = () => {
      const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const palette = (() => {
      switch (mode) {
        case 'ink-water': return ['rgba(30,64,175,', 'rgba(15,23,42,'];
        case 'comet-engine': return ['rgba(255,255,255,', 'rgba(125,211,252,'];
        default: return ['rgba(59,130,246,', 'rgba(168,85,247,'];
      }
    })();

    const spawn = (x: number, y: number, speed: number) => {
      const power = Math.min(1, speed / 20);
      const count = 2;
      for (let i = 0; i < count; i += 1) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 1.6,
          vy: (Math.random() - 0.5) * 1.6,
          life: 1,
          size: 4 + power * 14,
        });
      }
      if (particles.length > 120) particles.splice(0, particles.length - 120);
    };

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - mouseX;
      const dy = e.clientY - mouseY;
      const speed = Math.hypot(dx, dy);
      mouseX = e.clientX;
      mouseY = e.clientY;
      lastMoveTime = performance.now();
      spawn(mouseX, mouseY, speed);
      if (mode === 'ink-water') {
        ripples.push({ x: mouseX, y: mouseY, radius: 4, life: 1 });
      }
    };

    const onClick = () => {
      if (mode === 'ink-water' || mode === 'comet-engine') {
        ripples.push({ x: mouseX, y: mouseY, radius: 8, life: 1 });
      }
    };

    const drawParticle = (p: P) => {
      const alpha = Math.max(0, p.life * 0.6);
      const radius = Math.max(1.5, p.size * p.life);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
      g.addColorStop(0, `${palette[0]}${alpha})`);
      g.addColorStop(1, `${palette[1]}0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const render = () => {
      if (!running) return;
      frame += 1;
      const isIdle = performance.now() - lastMoveTime > 140;
      const skip = isIdle ? 4 : 1;
      if (frame % skip !== 0) {
        rafId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.life -= isIdle ? 0.045 : 0.03;
        p.x += p.vx;
        p.y += p.vy;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        drawParticle(p);
      }

      for (let i = ripples.length - 1; i >= 0; i -= 1) {
        const r = ripples[i];
        r.life -= 0.03;
        r.radius += 5;
        if (r.life <= 0) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `${palette[0]}${r.life * 0.7})`;
        ctx.lineWidth = mode === 'ink-water' ? 1.5 : 2.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (mode === 'comet-engine') {
        const g = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 24);
        g.addColorStop(0, 'rgba(255,255,255,0.85)');
        g.addColorStop(0.45, 'rgba(125,211,252,0.55)');
        g.addColorStop(1, 'rgba(125,211,252,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 24, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('click', onClick, { passive: true });
    render();

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click', onClick);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [active, mode]);

  return null;
}
