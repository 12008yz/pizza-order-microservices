'use client';

import { useState, useRef, useMemo } from 'react';
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
import FilterWizard from './FilterWizard';

// Динамический импорт ConsultationFlow для code splitting
const ConsultationFlow = dynamic(() => import('../Frame2/ConsultationFlow'), {
  loading: () => <div>Загрузка...</div>,
  ssr: false,
});

interface Tariff {
  id: number;
  providerName: string;
  providerId: string;
  tariffName: string;
  speed: string;
  speedValue: number;
  speedDesc: string;
  channels: string;
  channelsDesc: string;
  mobile: string;
  mobileDesc: string;
  favoriteLabel: string;
  favoriteDesc: string;
  price: string;
  priceValue: number;
  connectionPrice: string;
  promoText: string;
  serviceType: string;
  popularity: number;
}

const tariffs: Tariff[] = [
  {
    id: 1,
    providerName: 'Ростелеком',
    providerId: 'rostelecom',
    tariffName: 'Технологии выгоды. Тест-драйв.',
    speed: '100 Мбит/сек',
    speedValue: 100,
    speedDesc: 'Безлимитное соединение',
    channels: '135 каналов · кинотеатр «Wink»',
    channelsDesc: 'Телевидение',
    mobile: '1000 мин · 40 гигабайтов · 50 смс',
    mobileDesc: 'Мобильное соединение',
    favoriteLabel: 'Добавить в «Избранное»',
    favoriteDesc: 'Кнопка выше и справа от «Гигапоиск»',
    price: '965 р./мес.',
    priceValue: 965,
    connectionPrice: 'Подключение от оператора за 500 р.',
    promoText: '90 дней за 0 р.',
    serviceType: 'internet_tv_mobile',
    popularity: 95,
  },
  {
    id: 2,
    providerName: 'МТС',
    providerId: 'mts',
    tariffName: 'Домашний интернет + ТВ',
    speed: '200 Мбит/сек',
    speedValue: 200,
    speedDesc: 'Безлимитное соединение',
    channels: '180 каналов · KION',
    channelsDesc: 'Телевидение',
    mobile: '800 мин · 30 гигабайтов · 100 смс',
    mobileDesc: 'Мобильное соединение',
    favoriteLabel: 'Добавить в «Избранное»',
    favoriteDesc: 'Кнопка выше и справа от «Гигапоиск»',
    price: '890 р./мес.',
    priceValue: 890,
    connectionPrice: 'Подключение от оператора за 0 р.',
    promoText: '30 дней за 1 р.',
    serviceType: 'internet_tv_mobile',
    popularity: 90,
  },
  {
    id: 3,
    providerName: 'Билайн',
    providerId: 'beeline',
    tariffName: 'Всё в одном',
    speed: '300 Мбит/сек',
    speedValue: 300,
    speedDesc: 'Безлимитное соединение',
    channels: '200 каналов · Wink',
    channelsDesc: 'Телевидение',
    mobile: '1500 мин · 50 гигабайтов · 200 смс',
    mobileDesc: 'Мобильное соединение',
    favoriteLabel: 'Добавить в «Избранное»',
    favoriteDesc: 'Кнопка выше и справа от «Гигапоиск»',
    price: '1100 р./мес.',
    priceValue: 1100,
    connectionPrice: 'Подключение от оператора за 300 р.',
    promoText: '60 дней за 0 р.',
    serviceType: 'internet_tv_mobile',
    popularity: 85,
  },
  {
    id: 4,
    providerName: 'ДОМ.RU',
    providerId: 'domru',
    tariffName: 'Интернет + ТВ Стартовый',
    speed: '150 Мбит/сек',
    speedValue: 150,
    speedDesc: 'Безлимитное соединение',
    channels: '100 каналов',
    channelsDesc: 'Телевидение',
    mobile: '',
    mobileDesc: '',
    favoriteLabel: 'Добавить в «Избранное»',
    favoriteDesc: 'Кнопка выше и справа от «Гигапоиск»',
    price: '650 р./мес.',
    priceValue: 650,
    connectionPrice: 'Подключение от оператора за 0 р.',
    promoText: '14 дней за 0 р.',
    serviceType: 'internet_tv',
    popularity: 80,
  },
  {
    id: 5,
    providerName: 'Мегафон',
    providerId: 'megafon',
    tariffName: 'Объединяй! Максимум',
    speed: '500 Мбит/сек',
    speedValue: 500,
    speedDesc: 'Безлимитное соединение',
    channels: '250 каналов',
    channelsDesc: 'Телевидение',
    mobile: '2000 мин · безлимит гигабайтов · 500 смс',
    mobileDesc: 'Мобильное соединение',
    favoriteLabel: 'Добавить в «Избранное»',
    favoriteDesc: 'Кнопка выше и справа от «Гигапоиск»',
    price: '1500 р./мес.',
    priceValue: 1500,
    connectionPrice: 'Подключение от оператора за 0 р.',
    promoText: '30 дней за 0 р.',
    serviceType: 'internet_tv_mobile',
    popularity: 75,
  },
];

type ContactMethod = 'max' | 'telegram' | 'phone';

interface FilterState {
  services: string[];
  providers: string[];
  sortBy: string;
}

export default function Frame3() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHomePressed, setIsHomePressed] = useState(false);
  const [isHeartPressed, setIsHeartPressed] = useState(false);
  const [isFunnelPressed, setIsFunnelPressed] = useState(false);
  const [isPlanePressed, setIsPlanePressed] = useState(false);
  const [showConsultation, setShowConsultation] = useState(false);
  const [showFilterWizard, setShowFilterWizard] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    services: ['internet', 'internet_mobile', 'internet_tv', 'internet_tv_mobile'],
    providers: ['beeline', 'domru', 'megafon', 'mts', 'rostelecom'],
    sortBy: 'price',
  });

  // Фильтрация и сортировка тарифов
  const filteredTariffs = useMemo(() => {
    const result = tariffs.filter((tariff) => {
      // Фильтр по провайдерам
      if (!filters.providers.includes(tariff.providerId)) {
        return false;
      }
      // Фильтр по типу услуги
      if (!filters.services.includes(tariff.serviceType)) {
        return false;
      }
      return true;
    });

    // Сортировка
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price':
          return a.priceValue - b.priceValue;
        case 'speed':
          return b.speedValue - a.speedValue;
        case 'popularity':
          return b.popularity - a.popularity;
        default:
          return 0;
      }
    });

    return result;
  }, [filters]);

  const handleConsultationClose = () => {
    setShowConsultation(false);
  };

  const handleConsultationSubmit = async (data: { phone?: string; method?: ContactMethod }) => {
    console.log('Consultation data:', data);
    setShowConsultation(false);
  };

  const handleConsultationSkip = async () => {
    setShowConsultation(false);
  };

  const handlePlaneClick = () => {
    setShowConsultation(true);
  };

  const handleFilterClick = () => {
    setShowFilterWizard(true);
  };

  const handleFilterApply = (newFilters: FilterState) => {
    setFilters(newFilters);
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
          onClick={handleFilterClick}
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
          right: '5px',
          top: '260px',
          bottom: '151px',
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
          {filteredTariffs.length === 0 ? (
            <div
              style={{
                width: '360px',
                background: '#FFFFFF',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'TT Firs Neue, sans-serif',
                  fontSize: '16px',
                  color: 'rgba(16, 16, 16, 0.5)',
                }}
              >
                Нет тарифов по выбранным фильтрам. Попробуйте изменить параметры фильтрации.
              </div>
            </div>
          ) : (
            filteredTariffs.map((tariff) => (
              <div
                key={tariff.id}
                className="flex-shrink-0"
                style={{
                  position: 'relative',
                  width: '360px',
                  height: '420px',
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  scrollSnapAlign: 'start',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {/* Провайдер */}
                <div
                  style={{
                    position: 'absolute',
                    left: '15px',
                    top: '15px',
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontWeight: 400,
                    fontSize: '16px',
                    lineHeight: '125%',
                    color: 'rgba(16, 16, 16, 0.5)',
                  }}
                >
                  {tariff.providerName}
                </div>

                {/* Название тарифа */}
                <div
                  style={{
                    position: 'absolute',
                    left: '15px',
                    right: '45px',
                    top: '35px',
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontWeight: 400,
                    fontSize: '18px',
                    lineHeight: '165%',
                    color: '#101010',
                  }}
                >
                  {tariff.tariffName}
                </div>

                {/* Info icon */}
                <div
                  style={{
                    position: 'absolute',
                    right: '15px',
                    top: '35px',
                  }}
                >
                  <InfoIcon />
                </div>

                {/* Line 8 - Разделитель после заголовка */}
                <div
                  style={{
                    position: 'absolute',
                    left: '15px',
                    right: '15px',
                    top: '75px',
                    height: '1px',
                    background: 'rgba(16, 16, 16, 0.1)',
                  }}
                />

                {/* Скорость - иконка */}
                <div
                  style={{
                    position: 'absolute',
                    left: '15px',
                    top: '89px',
                  }}
                >
                  <CheckCircleIcon />
                </div>
                {/* Скорость - текст */}
                <div
                  style={{
                    position: 'absolute',
                    left: '45px',
                    right: '15px',
                    top: '85px',
                    fontFamily: 'TT Firs Neue, sans-serif',
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
                    position: 'absolute',
                    left: '45px',
                    right: '15px',
                    top: '110px',
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '105%',
                    color: 'rgba(16, 16, 16, 0.5)',
                  }}
                >
                  {tariff.speedDesc}
                </div>

                {/* Каналы - иконка */}
                <div
                  style={{
                    position: 'absolute',
                    left: '15px',
                    top: '134px',
                  }}
                >
                  <CheckCircleIcon />
                </div>
                {/* Каналы - текст */}
                <div
                  style={{
                    position: 'absolute',
                    left: '45px',
                    right: '15px',
                    top: '130px',
                    fontFamily: 'TT Firs Neue, sans-serif',
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
                    position: 'absolute',
                    left: '45px',
                    right: '15px',
                    top: '155px',
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '105%',
                    color: 'rgba(16, 16, 16, 0.5)',
                  }}
                >
                  {tariff.channelsDesc}
                </div>

                {/* Мобильная связь - иконка */}
                {tariff.mobile && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '15px',
                      top: '179px',
                    }}
                  >
                    <CheckCircleIcon />
                  </div>
                )}
                {/* Мобильная связь - текст */}
                {tariff.mobile && (
                  <>
                    <div
                      style={{
                        position: 'absolute',
                        left: '45px',
                        right: '15px',
                        top: '175px',
                        fontFamily: 'TT Firs Neue, sans-serif',
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
                        position: 'absolute',
                        left: '45px',
                        right: '15px',
                        top: '200px',
                        fontFamily: 'TT Firs Neue, sans-serif',
                        fontWeight: 400,
                        fontSize: '14px',
                        lineHeight: '105%',
                        color: 'rgba(16, 16, 16, 0.5)',
                      }}
                    >
                      {tariff.mobileDesc}
                    </div>
                  </>
                )}

                {/* Line 10 - Разделитель перед избранным */}
                <div
                  style={{
                    position: 'absolute',
                    left: '15px',
                    right: '15px',
                    top: '225px',
                    height: '1px',
                    background: 'rgba(16, 16, 16, 0.1)',
                  }}
                />

                {/* Избранное - иконка */}
                <div
                  style={{
                    position: 'absolute',
                    left: '15px',
                    top: '239px',
                  }}
                >
                  <PlusCircleIcon />
                </div>
                {/* Избранное - текст */}
                <div
                  style={{
                    position: 'absolute',
                    left: '45px',
                    right: '15px',
                    top: '235px',
                    fontFamily: 'TT Firs Neue, sans-serif',
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
                    position: 'absolute',
                    left: '45px',
                    right: '15px',
                    top: '260px',
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '105%',
                    color: 'rgba(16, 16, 16, 0.5)',
                  }}
                >
                  {tariff.favoriteDesc}
                </div>

                {/* Line 9 - Разделитель перед ценой */}
                <div
                  style={{
                    position: 'absolute',
                    left: '15px',
                    right: '15px',
                    top: '285px',
                    height: '1px',
                    background: 'rgba(16, 16, 16, 0.1)',
                  }}
                />

                {/* Цена */}
                <div
                  style={{
                    position: 'absolute',
                    left: '15px',
                    top: '297px',
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontWeight: 400,
                    fontSize: '22px',
                    lineHeight: '115%',
                    color: '#101010',
                  }}
                >
                  {tariff.price}
                </div>

                {/* Подключение */}
                <div
                  style={{
                    position: 'absolute',
                    left: '15px',
                    right: '15px',
                    top: '325px',
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '105%',
                    color: 'rgba(16, 16, 16, 0.5)',
                  }}
                >
                  {tariff.connectionPrice}
                </div>

                {/* Кнопка промо */}
                <button
                  style={{
                    position: 'absolute',
                    left: '15px',
                    right: '15px',
                    top: '355px',
                    height: '50px',
                    background: '#101010',
                    border: '1px solid rgba(16, 16, 16, 0.25)',
                    borderRadius: '10px',
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontWeight: 400,
                    fontSize: '16px',
                    lineHeight: '315%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  {tariff.promoText}
                </button>
              </div>
            ))
          )}
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

      {/* Мастер фильтрации */}
      <FilterWizard
        isOpen={showFilterWizard}
        onClose={() => setShowFilterWizard(false)}
        onApply={handleFilterApply}
      />
    </div>
  );
}
