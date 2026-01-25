'use client';

import { useRouter } from 'next/navigation';
import { House, NavigationArrow } from '@phosphor-icons/react';
import Logo from '../common/Logo';

export default function Header() {
  const router = useRouter();

  return (
    <>
      {/* Group 7510 - Кнопка дом (слева) */}
      <div
        className="absolute w-10 h-10 left-5 top-[65px] cursor-pointer z-10"
        onClick={() => router.push('/')}
      >
        <div
          style={{
            boxSizing: 'border-box',
            position: 'absolute',
            width: '40px',
            height: '40px',
            border: '1px solid rgba(16, 16, 16, 0.15)',
            backdropFilter: 'blur(5px)',
            borderRadius: '100px',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <House size={20} weight="fill" color="#101010" />
        </div>
      </div>

      {/* Логотип */}
      <Logo />

      {/* Group 7509 - Кнопка самолет (справа) */}
      <div
        className="absolute w-10 h-10 right-5 top-[65px] cursor-pointer z-10"
        onClick={() => console.log('Share clicked')}
      >
        <div
          style={{
            boxSizing: 'border-box',
            position: 'absolute',
            width: '40px',
            height: '40px',
            border: '1px solid rgba(16, 16, 16, 0.15)',
            backdropFilter: 'blur(5px)',
            borderRadius: '100px',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <NavigationArrow size={20} weight="fill" color="#101010" />
        </div>
      </div>
    </>
  );
}
