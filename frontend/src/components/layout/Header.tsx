'use client';

import { useState, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '../common/Logo';
import { HomeIcon, PlaneIcon } from '../common/icons';

interface HeaderProps {
  onConsultationClick?: () => void;
}

function Header({ onConsultationClick }: HeaderProps) {
  const router = useRouter();
  const [isPlanePressed, setIsPlanePressed] = useState(false);
  const [isHomePressed, setIsHomePressed] = useState(false);
  const [clickedButton, setClickedButton] = useState<string | null>(null);

  const handlePlaneClick = useCallback(() => {
    if (onConsultationClick) {
      onConsultationClick();
    }
  }, [onConsultationClick]);

  return (
    <>
      {/* Group 7510 - Кнопка дом (слева) */}
      <div
        className="absolute w-10 h-10 left-5 top-[65px] cursor-pointer z-10"
        onClick={() => {
          setClickedButton('home');
          setTimeout(() => setClickedButton(null), 300);
          router.push('/');
        }}
        onMouseDown={() => setIsHomePressed(true)}
        onMouseUp={() => setIsHomePressed(false)}
        onMouseLeave={() => setIsHomePressed(false)}
        onTouchStart={() => setIsHomePressed(true)}
        onTouchEnd={() => setIsHomePressed(false)}
      >
        <div
          style={{
            boxSizing: 'border-box',
            position: 'absolute',
            width: '40px',
            height: '40px',
            backdropFilter: 'blur(5px)',
            borderRadius: '100px',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: isHomePressed ? 'scale(0.85)' : 'scale(1)',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            overflow: 'hidden',
          }}
        >
          {/* Ripple эффект */}
          {clickedButton === 'home' && (
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '100px',
                background: 'rgba(16, 16, 16, 0.1)',
                animation: 'ripple 0.4s ease-out',
              }}
            />
          )}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              transform: isHomePressed ? 'rotate(-5deg) scale(0.95)' : 'rotate(0deg) scale(1)',
              transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <HomeIcon color={clickedButton === 'home' ? '#4A90E2' : '#101010'} />
          </div>
        </div>
      </div>

      {/* Логотип */}
      <Logo />

      {/* Group 7509 - Кнопка самолет (справа) */}
      <div
        className="absolute w-10 h-10 right-5 top-[65px] cursor-pointer z-10"
        onClick={() => {
          setClickedButton('plane');
          setTimeout(() => setClickedButton(null), 300);
          handlePlaneClick();
        }}
        onMouseDown={() => setIsPlanePressed(true)}
        onMouseUp={() => setIsPlanePressed(false)}
        onMouseLeave={() => setIsPlanePressed(false)}
        onTouchStart={() => setIsPlanePressed(true)}
        onTouchEnd={() => setIsPlanePressed(false)}
      >
        <div
          style={{
            boxSizing: 'border-box',
            position: 'absolute',
            width: '40px',
            height: '40px',
            backdropFilter: 'blur(5px)',
            borderRadius: '100px',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: isPlanePressed ? 'scale(0.85)' : 'scale(1)',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            overflow: 'hidden',
          }}
        >
          {/* Ripple эффект */}
          {clickedButton === 'plane' && (
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '100px',
                background: 'rgba(34, 139, 34, 0.15)',
                animation: 'ripple 0.4s ease-out',
              }}
            />
          )}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              transform: isPlanePressed ? 'scale(1.1) rotate(15deg)' : 'scale(1) rotate(0deg)',
              transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <PlaneIcon color={clickedButton === 'plane' ? '#228B22' : '#101010'} />
          </div>
        </div>
      </div>
      {/* Стили для анимации ripple */}
      <style jsx>{`
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}

export default memo(Header);
