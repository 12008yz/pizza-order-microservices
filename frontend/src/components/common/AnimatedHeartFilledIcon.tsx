'use client';

import { useEffect, useState, useRef } from 'react';

export default function AnimatedHeartFilledIcon() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showWave, setShowWave] = useState(false);
  const [pulseScale, setPulseScale] = useState(1);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      setIsAnimating(true);
      setShowWave(true);

      // Пульсация сердечка
      setPulseScale(1.3);
      setTimeout(() => setPulseScale(1), 200);
      setTimeout(() => setPulseScale(1.15), 400);
      setTimeout(() => setPulseScale(1), 600);

      // Убираем волну через 0.8 секунды
      setTimeout(() => {
        setShowWave(false);
      }, 800);
    }
  }, []);

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}>
      {/* Эффект волны */}
      {showWave && (
        <>
          <div
            style={{
              position: 'absolute',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'rgba(255, 48, 48, 0.4)',
              animation: 'heartWave1 0.8s ease-out',
              pointerEvents: 'none',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'rgba(255, 48, 48, 0.25)',
              animation: 'heartWave2 0.8s ease-out 0.2s',
              pointerEvents: 'none',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'rgba(255, 48, 48, 0.15)',
              animation: 'heartWave3 0.8s ease-out 0.4s',
              pointerEvents: 'none',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </>
      )}

      {/* Само сердечко */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'relative',
          zIndex: 1,
          opacity: isAnimating ? 1 : 0,
          transform: `scale(${isAnimating ? pulseScale : 0.2})`,
          transition: 'opacity 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <path
          d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
          fill="#FF3030"
        />
      </svg>

      {/* CSS анимации */}
      <style jsx>{`
        @keyframes heartWave1 {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(3);
            opacity: 0;
          }
        }
        @keyframes heartWave2 {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) scale(3.5);
            opacity: 0;
          }
        }
        @keyframes heartWave3 {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0.4;
          }
          100% {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
