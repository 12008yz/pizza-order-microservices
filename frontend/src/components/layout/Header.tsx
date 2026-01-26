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
        onClick={() => router.push('/')}
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
            transform: isHomePressed ? 'scale(0.92)' : 'scale(1)',
            transition: 'transform 0.15s ease-out',
          }}
        >
          <div
            style={{
              transform: isHomePressed ? 'scale(0.9)' : 'scale(1)',
              transition: 'transform 0.15s ease-out',
            }}
          >
            <HomeIcon />
          </div>
        </div>
      </div>

      {/* Логотип */}
      <Logo />

      {/* Group 7509 - Кнопка самолет (справа) */}
      <div
        className="absolute w-10 h-10 right-5 top-[65px] cursor-pointer z-10"
        onClick={handlePlaneClick}
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
            transform: isPlanePressed ? 'scale(0.92)' : 'scale(1)',
            transition: 'transform 0.15s ease-out',
          }}
        >
          <div
            style={{
              transform: isPlanePressed ? 'scale(0.9)' : 'scale(1)',
              transition: 'transform 0.15s ease-out',
            }}
          >
            <PlaneIcon />
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(Header);
