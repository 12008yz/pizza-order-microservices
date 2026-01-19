'use client';

interface LoadingScreenProps {
  progress?: number; // 0-100
}

export default function LoadingScreen({ progress = 0 }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white overflow-hidden">
      {/* 400-1-1-1 - Main Container */}
      <div
        style={{
          position: 'relative',
          width: '400px',
          height: '870px',
          background: '#FFFFFF'
        }}
      >
        {/* Vector - точные CSS свойства из Figma */}
        <div
          style={{
            position: 'absolute',
            left: '0%',
            right: '0.06%',
            top: '0%',
            bottom: '0%',
            background: '#FFFFFF'
          }}
        />

        {/* гигапоиск 2 - точные CSS свойства из Figma с SVG */}
        <div
          style={{
            position: 'absolute',
            width: '230px',
            height: '14px',
            left: 'calc(50% - 230px/2 + 2px)',
            top: 'calc(50% - 14px/2 - 7px + 10px)'
          }}
        >
          <svg width="230" height="14" viewBox="0 0 230 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 13.8056V0.194444H22.5306V4.86111H5.93306V13.8056H0ZM49.0092 0.194444V13.8056H43.0761V6.02778L29.9708 13.8056H24.0377V0.194444H29.9708V7.97222L43.0761 0.194444H49.0092ZM50.5142 13.8056V0.194444H73.0448V4.86111H56.4473V13.8056H50.5142ZM84.0292 4.47222L81.288 7.97222H86.7705L84.0292 4.47222ZM80.6872 0.194444H87.3713L98.017 13.8056H91.3329L89.8121 11.8611H78.2464L76.7256 13.8056H70.0415L80.6872 0.194444ZM98.7731 13.8056V0.194444H123.744V13.8056H117.811V4.86111H104.706V13.8056H98.7731ZM131.454 0H145.16C148.784 0 151.732 3.24722 151.732 7C151.732 10.7528 148.784 14 145.16 14H131.454C127.831 14 124.883 10.7528 124.883 7C124.883 3.24722 127.831 0 131.454 0ZM143.94 5.05556H132.675C131.642 5.05556 130.797 5.93056 130.797 7C130.797 8.06944 131.642 8.94444 132.675 8.94444H143.94C144.973 8.94444 145.818 8.06944 145.818 7C145.818 5.93056 144.973 5.05556 143.94 5.05556ZM177.834 0.194444V13.8056H171.901V6.02778L158.796 13.8056H152.863V0.194444H158.796V7.97222L171.901 0.194444H177.834ZM203.38 8.75V13.8056H185.544C181.92 13.8056 178.972 10.7528 178.972 7C178.972 3.24722 181.92 0.194444 185.544 0.194444H203.38V5.25H186.764C185.732 5.25 184.887 5.93056 184.887 7C184.887 8.06944 185.732 8.75 186.764 8.75H203.38ZM204.88 13.8056V0.194444H210.813V7.66111L221.252 0.194444H229.852L220.332 7L229.852 13.8056H221.252L216.033 10.0722L210.813 13.8056H204.88Z" fill="#000000" />
          </svg>
        </div>
      </div>

      {/* Progress Bar - черная полоска по центру между текстом и низом */}
      <div
        style={{
          position: 'fixed',
          top: '90%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '280px',
          maxWidth: 'calc(100% - 80px)',
          height: '4px',
          background: '#E5E5E5',
          borderRadius: '2px',
          zIndex: 10000
        }}
      >
        <div
          style={{
            width: `${Math.min(100, Math.max(0, progress))}%`,
            height: '100%',
            background: '#000000',
            transition: 'width 0.2s ease-out',
            borderRadius: '2px'
          }}
        />
      </div>
    </div>
  );
}
