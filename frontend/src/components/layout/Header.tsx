'use client';

import { useState, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '../common/Logo';

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
          <svg
            width="19"
            height="16"
            viewBox="0 0 19 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              transform: isHomePressed ? 'scale(0.9)' : 'scale(1)',
              transition: 'transform 0.15s ease-out',
            }}
          >
            <path d="M18.125 14.3752H16.875V8.7502L17.0578 8.93301C17.1753 9.05029 17.3346 9.11609 17.5006 9.11595C17.6666 9.1158 17.8257 9.04972 17.943 8.93223C18.0602 8.81475 18.126 8.65549 18.1259 8.48949C18.1258 8.32349 18.0597 8.16435 17.9422 8.04708L10.2586 0.365827C10.0242 0.131584 9.70638 0 9.375 0C9.04362 0 8.7258 0.131584 8.49141 0.365827L0.807813 8.04708C0.690641 8.16435 0.624855 8.32337 0.624929 8.48915C0.625002 8.65493 0.690928 8.81389 0.808203 8.93106C0.925478 9.04823 1.0845 9.11402 1.25028 9.11395C1.41606 9.11387 1.57502 9.04795 1.69219 8.93067L1.875 8.7502V14.3752H0.625C0.45924 14.3752 0.300268 14.441 0.183058 14.5583C0.065848 14.6755 0 14.8344 0 15.0002C0 15.166 0.065848 15.3249 0.183058 15.4421C0.300268 15.5594 0.45924 15.6252 0.625 15.6252H18.125C18.2908 15.6252 18.4497 15.5594 18.5669 15.4421C18.6842 15.3249 18.75 15.166 18.75 15.0002C18.75 14.8344 18.6842 14.6755 18.5669 14.5583C18.4497 14.441 18.2908 14.3752 18.125 14.3752ZM11.25 14.3752H7.5V10.6252C7.5 10.5423 7.53292 10.4628 7.59153 10.4042C7.65013 10.3456 7.72962 10.3127 7.8125 10.3127H10.9375C11.0204 10.3127 11.0999 10.3456 11.1585 10.4042C11.2171 10.4628 11.25 10.5423 11.25 10.6252V14.3752Z" fill="#101010" />
          </svg>
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
          <svg
            width="18"
            height="16"
            viewBox="0 0 18 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              transform: isPlanePressed ? 'scale(0.9)' : 'scale(1)',
              transition: 'transform 0.15s ease-out',
            }}
          >
            <path d="M17.2042 15.1825C17.0876 15.3218 16.9418 15.4339 16.7771 15.5107C16.6124 15.5875 16.4328 15.6272 16.2511 15.627C16.1082 15.6269 15.9663 15.6026 15.8316 15.5551L9.58546 13.4457C9.52351 13.4248 9.46969 13.385 9.43157 13.3319C9.39345 13.2788 9.37295 13.215 9.37296 13.1496V7.50199C9.37315 7.41631 9.35571 7.33151 9.32175 7.25285C9.28778 7.17419 9.23801 7.10335 9.17551 7.04474C9.11302 6.98613 9.03914 6.94099 8.95846 6.91213C8.87779 6.88327 8.79204 6.87131 8.70655 6.87699C8.54584 6.89116 8.39641 6.96552 8.28819 7.08519C8.17997 7.20485 8.12095 7.36097 8.12296 7.5223V13.1473C8.12296 13.2127 8.10246 13.2764 8.06434 13.3295C8.02622 13.3827 7.9724 13.4225 7.91046 13.4434L1.66436 15.5528C1.42474 15.637 1.16515 15.6462 0.92016 15.5791C0.675174 15.5121 0.456417 15.3721 0.293018 15.1776C0.129619 14.9832 0.0293321 14.7436 0.00551085 14.4907C-0.0183104 14.2378 0.0354645 13.9837 0.159675 13.7621L7.65733 0.637145C7.76607 0.44384 7.92429 0.282948 8.11574 0.17098C8.3072 0.0590119 8.52499 0 8.74679 0C8.96858 0 9.18637 0.0590119 9.37783 0.17098C9.56928 0.282948 9.7275 0.44384 9.83624 0.637145L17.337 13.7598C17.4641 13.9817 17.5196 14.2375 17.4958 14.4922C17.472 14.7468 17.3702 14.9879 17.2042 15.1825Z" fill="#101010" />
          </svg>
        </div>
      </div>
    </>
  );
}

export default memo(Header);
