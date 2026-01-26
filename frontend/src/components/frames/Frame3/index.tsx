'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  HomeIcon,
  HeartIcon,
  FunnelIcon,
  PlaneIcon,
  InfoIcon,
  CheckCircleIcon,
  PlusCircleIcon,
} from '../../common/icons';

// Динамический импорт ConsultationFlow для code splitting
const ConsultationFlow = dynamic(() => import('../Frame2/ConsultationFlow'), {
  loading: () => <div>Загрузка...</div>,
  ssr: false,
});

interface Tariff {
  id: number;
  providerName: string;
  tariffName: string;
  speed: string;
  speedDesc: string;
  channels: string;
  channelsDesc: string;
  mobile: string;
  mobileDesc: string;
  favoriteLabel: string;
  favoriteDesc: string;
  price: string;
  connectionPrice: string;
  promoText: string;
}

const tariffs: Tariff[] = [
  {
    id: 1,
    providerName: 'Ростелеком',
    tariffName: 'Технологии выгоды. Тест-драйв.',
    speed: '100 Мбит/сек',
    speedDesc: 'Безлимитное соединение',
    channels: '135 каналов · кинотеатр «Wink»',
    channelsDesc: 'Телевидение',
    mobile: '1000 мин · 40 гигабайтов · 50 смс',
    mobileDesc: 'Мобильное соединение',
    favoriteLabel: 'Добавить в «Избранное»',
    favoriteDesc: 'Кнопка выше и справа от «Гигапоиск»',
    price: '965 р./мес.',
    connectionPrice: 'Подключение от оператора за 500 р.',
    promoText: '90 дней за 0 р.',
  },
  {
    id: 2,
    providerName: 'МТС',
    tariffName: 'Домашний интернет + ТВ',
    speed: '200 Мбит/сек',
    speedDesc: 'Безлимитное соединение',
    channels: '180 каналов · KION',
    channelsDesc: 'Телевидение',
    mobile: '800 мин · 30 гигабайтов · 100 смс',
    mobileDesc: 'Мобильное соединение',
    favoriteLabel: 'Добавить в «Избранное»',
    favoriteDesc: 'Кнопка выше и справа от «Гигапоиск»',
    price: '890 р./мес.',
    connectionPrice: 'Подключение от оператора за 0 р.',
    promoText: '30 дней за 1 р.',
  },
  {
    id: 3,
    providerName: 'Билайн',
    tariffName: 'Всё в одном',
    speed: '300 Мбит/сек',
    speedDesc: 'Безлимитное соединение',
    channels: '200 каналов · Wink',
    channelsDesc: 'Телевидение',
    mobile: '1500 мин · 50 гигабайтов · 200 смс',
    mobileDesc: 'Мобильное соединение',
    favoriteLabel: 'Добавить в «Избранное»',
    favoriteDesc: 'Кнопка выше и справа от «Гигапоиск»',
    price: '1100 р./мес.',
    connectionPrice: 'Подключение от оператора за 300 р.',
    promoText: '60 дней за 0 р.',
  },
];

type ContactMethod = 'max' | 'telegram' | 'phone';

export default function Frame3() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHomePressed, setIsHomePressed] = useState(false);
  const [isHeartPressed, setIsHeartPressed] = useState(false);
  const [isFunnelPressed, setIsFunnelPressed] = useState(false);
  const [isPlanePressed, setIsPlanePressed] = useState(false);
  const [showConsultation, setShowConsultation] = useState(false);

  const handleConsultationClose = () => {
    setShowConsultation(false);
  };

  const handleConsultationSubmit = async (data: { phone?: string; method?: ContactMethod }) => {
    // Здесь можно добавить логику сохранения данных консультации
    console.log('Consultation data:', data);
    setShowConsultation(false);
  };

  const handleConsultationSkip = async () => {
    setShowConsultation(false);
  };

  const handlePlaneClick = () => {
    setShowConsultation(true);
  };

  return (
    <div
      className="relative w-full max-w-[400px] mx-auto bg-[#F5F5F5] overflow-hidden"
      style={{
        fontFamily: 'TT Firs Neue, sans-serif',
        height: '100vh',
        maxHeight: '870px',
      }}
    >
      {/* Header - Group 7545 */}
      <div
        className="absolute"
        style={{
          width: '360px',
          height: '41.61px',
          left: '20px',
          top: '73px',
        }}
      >
        {/* Group 7510 - Кнопка дом (слева) */}
        <div
          className="absolute cursor-pointer"
          style={{
            width: '40.8px',
            height: '40.8px',
            left: '0px',
            top: '0px',
          }}
          onClick={() => router.push('/')}
          onMouseDown={() => setIsHomePressed(true)}
          onMouseUp={() => setIsHomePressed(false)}
          onMouseLeave={() => setIsHomePressed(false)}
          onTouchStart={() => setIsHomePressed(true)}
          onTouchEnd={() => setIsHomePressed(false)}
        >
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: '#FFFFFF',
              borderRadius: '100px',
              transform: isHomePressed ? 'scale(0.92)' : 'scale(1)',
              transition: 'transform 0.15s ease-out',
            }}
          >
            <HomeIcon />
          </div>
        </div>

        {/* Логотип Гигапоиск - гигапоиск 2 */}
        <div
          className="absolute flex items-center"
          style={{
            width: '142.79px',
            height: '10.2px',
            left: '48.61px',
            top: '15.71px',
          }}
        >
          <svg
            width="143"
            height="11"
            viewBox="0 0 230 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <g clipPath="url(#clip0_frame3_logo)">
              <path
                d="M0 13.8056V0.194444H22.5306V4.86111H5.93306V13.8056H0ZM49.0092 0.194444V13.8056H43.0761V6.02778L29.9708 13.8056H24.0377V0.194444H29.9708V7.97222L43.0761 0.194444H49.0092ZM50.5142 13.8056V0.194444H73.0448V4.86111H56.4473V13.8056H50.5142ZM84.0292 4.47222L81.288 7.97222H86.7705L84.0292 4.47222ZM80.6872 0.194444H87.3713L98.017 13.8056H91.3329L89.8121 11.8611H78.2464L76.7256 13.8056H70.0415L80.6872 0.194444ZM98.7731 13.8056V0.194444H123.744V13.8056H117.811V4.86111H104.706V13.8056H98.7731ZM131.454 0H145.16C148.784 0 151.732 3.24722 151.732 7C151.732 10.7528 148.784 14 145.16 14H131.454C127.831 14 124.883 10.7528 124.883 7C124.883 3.24722 127.831 0 131.454 0ZM143.94 5.05556H132.675C131.642 5.05556 130.797 5.93056 130.797 7C130.797 8.06944 131.642 8.94444 132.675 8.94444H143.94C144.973 8.94444 145.818 8.06944 145.818 7C145.818 5.93056 144.973 5.05556 143.94 5.05556ZM177.834 0.194444V13.8056H171.901V6.02778L158.796 13.8056H152.863V0.194444H158.796V7.97222L171.901 0.194444H177.834ZM203.38 8.75V13.8056H185.544C181.92 13.8056 178.972 10.7528 178.972 7C178.972 3.24722 181.92 0.194444 185.544 0.194444H203.38V5.25H186.764C185.732 5.25 184.887 5.93056 184.887 7C184.887 8.06944 185.732 8.75 186.764 8.75H203.38ZM204.88 13.8056V0.194444H210.813V7.66111L221.252 0.194444H229.852L220.332 7L229.852 13.8056H221.252L216.033 10.0722L210.813 13.8056H204.88Z"
                fill="#101010"
              />
            </g>
            <defs>
              <clipPath id="clip0_frame3_logo">
                <rect width="230" height="14" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>

        {/* Group 7510 - Кнопка избранное (Heart) */}
        <div
          className="absolute cursor-pointer"
          style={{
            width: '40.8px',
            height: '40.8px',
            left: '229.6px',
            top: '0.41px',
          }}
          onMouseDown={() => setIsHeartPressed(true)}
          onMouseUp={() => setIsHeartPressed(false)}
          onMouseLeave={() => setIsHeartPressed(false)}
          onTouchStart={() => setIsHeartPressed(true)}
          onTouchEnd={() => setIsHeartPressed(false)}
        >
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: '#FFFFFF',
              borderRadius: '100px',
              transform: isHeartPressed ? 'scale(0.92)' : 'scale(1)',
              transition: 'transform 0.15s ease-out',
            }}
          >
            <HeartIcon />
          </div>
        </div>

        {/* Group 7511 - Кнопка фильтр (Funnel) */}
        <div
          className="absolute cursor-pointer"
          style={{
            width: '40.8px',
            height: '40.8px',
            left: '274.6px',
            top: '0.41px',
          }}
          onMouseDown={() => setIsFunnelPressed(true)}
          onMouseUp={() => setIsFunnelPressed(false)}
          onMouseLeave={() => setIsFunnelPressed(false)}
          onTouchStart={() => setIsFunnelPressed(true)}
          onTouchEnd={() => setIsFunnelPressed(false)}
        >
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: '#FFFFFF',
              borderRadius: '100px',
              transform: isFunnelPressed ? 'scale(0.92)' : 'scale(1)',
              transition: 'transform 0.15s ease-out',
            }}
          >
            <FunnelIcon />
          </div>
        </div>

        {/* Group 7509 - Кнопка самолёт (Plane) */}
        <div
          className="absolute cursor-pointer"
          style={{
            width: '40.8px',
            height: '40.8px',
            left: '319.2px',
            top: '0.81px',
          }}
          onClick={handlePlaneClick}
          onMouseDown={() => setIsPlanePressed(true)}
          onMouseUp={() => setIsPlanePressed(false)}
          onMouseLeave={() => setIsPlanePressed(false)}
          onTouchStart={() => setIsPlanePressed(true)}
          onTouchEnd={() => setIsPlanePressed(false)}
        >
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: '#FFFFFF',
              borderRadius: '100px',
              transform: isPlanePressed ? 'scale(0.92)' : 'scale(1)',
              transition: 'transform 0.15s ease-out',
            }}
          >
            <PlaneIcon />
          </div>
        </div>
      </div>

      {/* Контейнер для карточек - показывает 15px второй карточки справа */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: '20px',
          right: '5px', /* 20px - 15px = 5px, чтобы показать 15px второй карточки */
          top: '260px',
          bottom: '151px', /* 127px баннер + 24px отступ от баннера до низа карточки */
        }}
      >
        {/* Горизонтальный скролл с карточками */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide"
          style={{
            gap: '5px',
            height: '100%',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {tariffs.map((tariff) => (
            <div
              key={tariff.id}
              className="flex-shrink-0 flex flex-col"
              style={{
                width: '360px',
                background: '#FFFFFF',
                borderRadius: '20px',
                scrollSnapAlign: 'start',
                boxSizing: 'border-box',
              }}
            >
              {/* Group 7572 - Заголовок карточки */}
              <div
                style={{
                  padding: '15px 15px 10px 15px',
                }}
              >
                <div className="flex justify-between items-start">
                  <div style={{ flex: 1 }}>
                    {/* Ростелеком */}
                    <div
                      style={{
                        fontFamily: 'TT Firs Neue, sans-serif',
                        fontStyle: 'normal',
                        fontWeight: 400,
                        fontSize: '16px',
                        lineHeight: '125%',
                        color: 'rgba(16, 16, 16, 0.5)',
                      }}
                    >
                      {tariff.providerName}
                    </div>
                    {/* Технологии выгоды. Тест-драйв. */}
                    <div
                      style={{
                        fontFamily: 'TT Firs Neue, sans-serif',
                        fontStyle: 'normal',
                        fontWeight: 400,
                        fontSize: '18px',
                        lineHeight: '165%',
                        color: '#101010',
                        marginTop: '2px',
                      }}
                    >
                      {tariff.tariffName}
                    </div>
                  </div>
                  {/* Info icon */}
                  <div style={{ marginTop: '5px', marginLeft: '10px' }}>
                    <InfoIcon />
                  </div>
                </div>
              </div>

              {/* Line 8 - Разделитель */}
              <div
                style={{
                  width: '100%',
                  height: '1px',
                  background: 'rgba(16, 16, 16, 0.1)',
                }}
              />

              {/* Group 7448 - 100 Мбит/сек */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 15px 8px 15px',
                }}
              >
                <div
                  style={{
                    marginRight: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <CheckCircleIcon />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'TT Firs Neue, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      fontSize: '16px',
                      lineHeight: '155%',
                      color: '#101010',
                    }}
                  >
                    {tariff.speed}
                  </div>
                  <div
                    style={{
                      fontFamily: 'TT Firs Neue, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '105%',
                      color: 'rgba(16, 16, 16, 0.5)',
                      marginTop: '2px',
                    }}
                  >
                    {tariff.speedDesc}
                  </div>
                </div>
              </div>

              {/* Group 7498 - 135 каналов */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 15px',
                }}
              >
                <div
                  style={{
                    marginRight: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <CheckCircleIcon />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'TT Firs Neue, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      fontSize: '16px',
                      lineHeight: '155%',
                      color: '#101010',
                    }}
                  >
                    {tariff.channels}
                  </div>
                  <div
                    style={{
                      fontFamily: 'TT Firs Neue, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      fontSize: '13px',
                      lineHeight: '115%',
                      color: 'rgba(16, 16, 16, 0.5)',
                      marginTop: '2px',
                    }}
                  >
                    {tariff.channelsDesc}
                  </div>
                </div>
              </div>

              {/* Group 7499 - 1000 мин */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 15px',
                }}
              >
                <div
                  style={{
                    marginRight: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <CheckCircleIcon />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'TT Firs Neue, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      fontSize: '16px',
                      lineHeight: '155%',
                      color: '#101010',
                    }}
                  >
                    {tariff.mobile}
                  </div>
                  <div
                    style={{
                      fontFamily: 'TT Firs Neue, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '105%',
                      color: 'rgba(16, 16, 16, 0.5)',
                      marginTop: '2px',
                    }}
                  >
                    {tariff.mobileDesc}
                  </div>
                </div>
              </div>

              {/* Line 10 - Разделитель перед избранным */}
              <div
                style={{
                  width: '100%',
                  height: '1px',
                  background: 'rgba(16, 16, 16, 0.1)',
                  marginTop: '4px',
                }}
              />

              {/* Group 7565 - Добавить в избранное */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  padding: '12px 15px',
                }}
              >
                <div style={{ marginRight: '10px', marginTop: '2px' }}>
                  <PlusCircleIcon />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'TT Firs Neue, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      fontSize: '16px',
                      lineHeight: '155%',
                      color: '#101010',
                    }}
                  >
                    {tariff.favoriteLabel}
                  </div>
                  <div
                    style={{
                      fontFamily: 'TT Firs Neue, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '105%',
                      color: 'rgba(16, 16, 16, 0.5)',
                      marginTop: '2px',
                    }}
                  >
                    {tariff.favoriteDesc}
                  </div>
                </div>
              </div>

              {/* Line 9 - Разделитель перед ценой */}
              <div
                style={{
                  width: '100%',
                  height: '1px',
                  background: 'rgba(16, 16, 16, 0.1)',
                }}
              />

              {/* Цена - 965 р./мес. */}
              <div
                style={{
                  padding: '15px 15px 0 15px',
                }}
              >
                <div
                  style={{
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    fontSize: '22px',
                    lineHeight: '115%',
                    color: '#101010',
                  }}
                >
                  {tariff.price}
                </div>
                {/* Подключение от оператора за 500 р. */}
                <div
                  style={{
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '105%',
                    color: 'rgba(16, 16, 16, 0.5)',
                    marginTop: '6px',
                  }}
                >
                  {tariff.connectionPrice}
                </div>
              </div>

              {/* Group 7377 - Кнопка промо */}
              <div
                style={{
                  padding: '15.44px 15px 15px 15px',
                }}
              >
                <button
                  style={{
                    boxSizing: 'border-box',
                    width: '100%',
                    height: '50px',
                    background: '#101010',
                    border: '1px solid rgba(16, 16, 16, 0.1)',
                    borderRadius: '10px',
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    fontSize: '16px',
                    lineHeight: '315%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#2a2a2a')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#101010')}
                >
                  {tariff.promoText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Стили для скрытия скроллбара */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Модалка консультации */}
      {showConsultation && (
        <ConsultationFlow
          onClose={handleConsultationClose}
          onSubmit={handleConsultationSubmit}
          onSkip={handleConsultationSkip}
        />
      )}
    </div>
  );
}
