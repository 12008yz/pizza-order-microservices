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
export type CursorEffectMode = 'package' | 'off';

const applyCanvasStyle = (canvas: HTMLCanvasElement, visible: boolean, lowPower = false) => {
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = '10000';
  canvas.style.pointerEvents = 'none';
  canvas.style.display = visible ? 'block' : 'none';
  canvas.style.opacity = '0.9';
  canvas.style.mixBlendMode = 'normal';
  // On phones prioritize FPS over post-processing.
  canvas.style.filter = lowPower ? 'none' : 'blur(0.8px) saturate(1.05)';
};

const hidePackageCanvas = () => {
  const existingCanvas = window.__fluidCursorInstance?.canvas;
  if (existingCanvas) applyCanvasStyle(existingCanvas, false);
};

export default function CursorFluidEffect({ active, mode }: { active: boolean; mode: CursorEffectMode }) {
  useEffect(() => {
    if (!active || mode === 'off') {
      hidePackageCanvas();
      return;
    }

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
    const isMobile =
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
      (navigator.maxTouchPoints > 0 && Math.min(window.innerWidth, window.innerHeight) < 900);
    const shortSide = Math.min(window.innerWidth, window.innerHeight);
    // Prefer smoother frame pacing: run lighter profile on small/high-DPI devices.
    const shouldUseLowLatencyProfile = isMobile || dpr > 1.1 || shortSide < 1100;

    const options = {
      SIM_RESOLUTION: isMobile ? 24 : shouldUseLowLatencyProfile ? 36 : 48,
      DYE_RESOLUTION: isMobile ? 192 : shouldUseLowLatencyProfile ? 256 : 384,
      PRESSURE_ITERATIONS: isMobile ? 6 : shouldUseLowLatencyProfile ? 8 : 10,
      SPLAT_FORCE: isMobile ? 2100 : 2400,
      SPLAT_RADIUS: isMobile ? 0.22 : 0.2,
      DENSITY_DISSIPATION: isMobile ? 3.9 : 3.6,
      VELOCITY_DISSIPATION: isMobile ? 2.6 : 2.4,
      // Slightly faster color updates reduce visual stepping on low FPS.
      COLOR_UPDATE_SPEED: isMobile ? 3.2 : 2.8,
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
        applyCanvasStyle(canvas, true, isMobile);
      })
      .catch(() => {
        // Keep app usable even if effect fails.
      });

    return () => {
      cancelled = true;
      hidePackageCanvas();
    };
  }, [active, mode]);

  return null;
}
