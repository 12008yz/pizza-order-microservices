'use client';

import { useRouter } from 'next/navigation';
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
          {/* HouseLine icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.5 7.5L10 1.875L17.5 7.5V16.25C17.5 16.5815 17.3683 16.8995 17.1339 17.1339C16.8995 17.3683 16.5815 17.5 16.25 17.5H3.75C3.41848 17.5 3.10054 17.3683 2.86612 17.1339C2.6317 16.8995 2.5 16.5815 2.5 16.25V7.5Z"
              stroke="#101010"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7.5 17.5V10H12.5V17.5"
              stroke="#101010"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Логотип */}
      <Logo />

      {/* Group 7509 - Кнопка самолет (справа) */}
      <div
        className="absolute w-10 h-10 left-[340px] top-[65px] cursor-pointer z-10"
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
          {/* PaperPlane icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.5 2.5L9.16667 10.8333M17.5 2.5L12.0833 17.5L9.16667 10.8333M17.5 2.5L2.5 7.91667L9.16667 10.8333"
              stroke="#101010"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </>
  );
}
