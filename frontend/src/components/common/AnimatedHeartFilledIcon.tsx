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
          d="M16.6865 4.25C18.0951 4.25159 19.4463 4.81157 20.4424 5.80762C21.3762 6.74144 21.9267 7.98708 21.9932 9.2998L22 9.56348C21.9995 12.6104 19.7234 15.4496 17.2539 17.6123C14.8105 19.7521 12.3114 21.1131 12.1211 21.2139L12.1182 21.2158C12.0818 21.2353 12.0413 21.2461 12 21.2461C11.9587 21.2461 11.9182 21.2353 11.8818 21.2158L11.8789 21.2148L11.3398 20.9102C10.4423 20.3843 8.57862 19.2171 6.74609 17.6123C4.27656 15.4496 2.00049 12.6104 2 9.56348C2.00159 8.15485 2.56157 6.80367 3.55762 5.80762C4.55353 4.8117 5.90408 4.25174 7.3125 4.25C9.10232 4.25 10.645 5.0173 11.6006 6.29004L12 6.82227L12.3994 6.29004C13.3549 5.01753 14.8971 4.25028 16.6865 4.25Z"
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
