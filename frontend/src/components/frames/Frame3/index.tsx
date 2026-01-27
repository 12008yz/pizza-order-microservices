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
  ArrowCircleRightIcon,
  HeartOutlineIcon,
  HeartFilledIcon,
  HeartHeaderFilledIcon,
  ClearFilterIcon,
} from '../../common/icons';
import FavoriteToast from './FavoriteToast';
import FilterWizard from './FilterWizard';
import HintTooltip from './HintTooltip';
import AddressInputModal from '../../modals/AddressInputModal';
import { AddressProvider, useAddress } from '../../../contexts/AddressContext';

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

type HintStep = 'none' | 'consultation' | 'filter';

function Frame3Content() {
  const router = useRouter();
  const { addressData, updateApartmentNumber } = useAddress();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHomePressed, setIsHomePressed] = useState(false);
  const [isHeartPressed, setIsHeartPressed] = useState(false);
  const [isFunnelPressed, setIsFunnelPressed] = useState(false);
  const [isPlanePressed, setIsPlanePressed] = useState(false);
  const [isArrowPressed, setIsArrowPressed] = useState(false);
  const [isClearFilterPressed, setIsClearFilterPressed] = useState(false);
  const [showConsultation, setShowConsultation] = useState(false);
  const [showFilterWizard, setShowFilterWizard] = useState(false);
  const [hintStep, setHintStep] = useState<HintStep>('consultation');

  // Начальные значения фильтров
  const defaultFilters: FilterState = {
    services: ['internet', 'internet_mobile', 'internet_tv', 'internet_tv_mobile'],
    providers: ['beeline', 'domru', 'megafon', 'mts', 'rostelecom'],
    sortBy: 'price',
  };

  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  // Состояние для модалки выбора квартиры
  const [showApartmentModal, setShowApartmentModal] = useState(false);
  const [selectedTariffId, setSelectedTariffId] = useState<number | null>(null);

  // Проверка, активен ли фильтр (отличается от начальных значений)
  const isFilterActive =
    filters.services.length !== defaultFilters.services.length ||
    filters.providers.length !== defaultFilters.providers.length ||
    !filters.services.every(s => defaultFilters.services.includes(s)) ||
    !filters.providers.every(p => defaultFilters.providers.includes(p));

  // Сброс фильтров к начальным значениям
  const handleClearFilters = () => {
    setFilters(defaultFilters);
  };
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showFavoriteToast, setShowFavoriteToast] = useState(false);
  const [hasShownFavoriteToast, setHasShownFavoriteToast] = useState(false);

  // Обработчик добавления/удаления из избранного
  const handleFavoriteClick = (tariffId: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(tariffId)) {
        newFavorites.delete(tariffId);
      } else {
        newFavorites.add(tariffId);
        // Показываем уведомление только 1 раз
        if (!hasShownFavoriteToast) {
          setShowFavoriteToast(true);
          setHasShownFavoriteToast(true);
        }
      }
      return newFavorites;
    });
  };

  const hasFavorites = favorites.size > 0;

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

  // Обработчик клика на кнопку тарифа - открывает модалку выбора квартиры
  const handleTariffSelect = (tariffId: number) => {
    setSelectedTariffId(tariffId);
    setShowApartmentModal(true);
  };

  // Функция санитизации строковых данных для защиты от XSS
  const sanitizeString = (str: string | undefined, maxLength: number = 200): string | undefined => {
    if (!str) return undefined;
    // Удаляем потенциально опасные символы и ограничиваем длину
    const sanitized = str
      .trim()
      .replace(/[<>"']/g, '') // Удаляем HTML-символы
      .slice(0, maxLength);
    return sanitized || undefined;
  };

  // Обработчик выбора квартиры
  const handleApartmentComplete = async () => {
    // Сохраняем квартиру в базу данных
    try {
      // Получаем данные из sessionStorage для отправки на сервер
      const addressDataStr = sessionStorage.getItem('addressData');
      let userData: any = {};

      if (addressDataStr) {
        const storedData = JSON.parse(addressDataStr);
        userData = {
          city: sanitizeString(storedData.city, 100),
          street: sanitizeString(storedData.street, 200),
          house: sanitizeString(storedData.houseNumber, 20),
          apartment: sanitizeString(addressData.apartmentNumber, 20) || undefined,
          connectionType: storedData.connectionType || undefined,
        };
      } else {
        // Если нет данных в sessionStorage, отправляем только квартиру
        userData = {
          apartment: sanitizeString(addressData.apartmentNumber, 20) || undefined,
        };
      }

      // Отправляем данные на сервер для сохранения в базе данных
      const response = await fetch('/api/users/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        console.error('Failed to save apartment data:', await response.text());
      }
    } catch (error) {
      console.error('Error saving apartment data:', error);
      // Продолжаем даже если сохранение не удалось
    }

    // Сохраняем квартиру в sessionStorage
    try {
      const addressDataStr = sessionStorage.getItem('addressData');
      if (addressDataStr) {
        const storedData = JSON.parse(addressDataStr);
        storedData.apartmentNumber = addressData.apartmentNumber;
        storedData.apartmentId = addressData.apartmentId;
        sessionStorage.setItem('addressData', JSON.stringify(storedData));
      }
    } catch (error) {
      console.warn('Failed to save apartment to sessionStorage:', error);
    }

    setShowApartmentModal(false);
    // Здесь можно добавить логику оформления заказа
    console.log('Selected tariff:', selectedTariffId, 'Apartment:', addressData.apartmentNumber);
  };

  // Обработчики подсказок
  const handleHintAccept = () => {
    if (hintStep === 'consultation') {
      setHintStep('filter');
    } else if (hintStep === 'filter') {
      setHintStep('none');
    }
  };

  const handleHintDecline = () => {
    setHintStep('none');
  };

  // Скролл к следующей карточке
  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: 365,
        behavior: 'smooth',
      });
    }
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
            {hasFavorites ? <HeartHeaderFilledIcon /> : <HeartIcon />}
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

      {/* HintTooltip - модальное окно подсказки */}
      {hintStep !== 'none' && (
        <HintTooltip
          text={hintStep === 'consultation' ? 'Консультация, это здесь' : 'Фильтрация, это здесь'}
          position={hintStep}
          onAccept={handleHintAccept}
          onDecline={handleHintDecline}
        />
      )}

      {/* Toast уведомление для избранного */}
      <FavoriteToast
        isVisible={showFavoriteToast}
        onClose={() => setShowFavoriteToast(false)}
      />

      {/* Кнопка отмены фильтрации - слева от карточки, показывается только когда фильтр активен */}
      {isFilterActive && (
        <div
          className="absolute cursor-pointer"
          style={{
            width: '40px',
            height: '40px',
            left: '20px',
            top: '255px',
          }}
          onClick={handleClearFilters}
          onMouseDown={() => setIsClearFilterPressed(true)}
          onMouseUp={() => setIsClearFilterPressed(false)}
          onMouseLeave={() => setIsClearFilterPressed(false)}
          onTouchStart={() => setIsClearFilterPressed(true)}
          onTouchEnd={() => setIsClearFilterPressed(false)}
        >
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: '#FFFFFF',
              borderRadius: '100px',
              transform: isClearFilterPressed ? 'scale(0.92)' : 'scale(1)',
              transition: 'transform 0.15s ease-out',
            }}
          >
            <ClearFilterIcon />
          </div>
        </div>
      )}

      {/* Кнопка скролла вправо - Group 7509 */}
      <div
        className="absolute cursor-pointer"
        style={{
          width: '40px',
          height: '40px',
          right: '20px',
          top: '255px',
        }}
        onClick={handleScrollRight}
        onMouseDown={() => setIsArrowPressed(true)}
        onMouseUp={() => setIsArrowPressed(false)}
        onMouseLeave={() => setIsArrowPressed(false)}
        onTouchStart={() => setIsArrowPressed(true)}
        onTouchEnd={() => setIsArrowPressed(false)}
      >
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            background: '#FFFFFF',
            borderRadius: '100px',
            transform: isArrowPressed ? 'scale(0.92)' : 'scale(1)',
            transition: 'transform 0.15s ease-out',
          }}
        >
          <ArrowCircleRightIcon />
        </div>
      </div>

      {/* Контейнер для карточек - показывает 15px второй карточки справа */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: '20px',
          right: '5px',
          top: '305px',
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
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Заголовок */}
                <div style={{ padding: '15px 15px 0 15px', flexShrink: 0 }}>
                  {/* Провайдер с Info icon */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <div
                      style={{
                        fontFamily: 'TT Firs Neue, sans-serif',
                        fontWeight: 400,
                        fontSize: '16px',
                        lineHeight: '125%',
                        color: 'rgba(16, 16, 16, 0.5)',
                      }}
                    >
                      {tariff.providerName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <InfoIcon />
                    </div>
                  </div>

                  {/* Название тарифа */}
                  <div
                    style={{
                      fontFamily: 'TT Firs Neue, sans-serif',
                      fontWeight: 400,
                      fontSize: '18px',
                      lineHeight: '165%',
                      color: '#101010',
                    }}
                  >
                    {tariff.tariffName}
                  </div>

                  {/* Line 8 - Разделитель после заголовка */}
                  <div
                    style={{
                      marginTop: '15px',
                      height: '1px',
                      background: 'rgba(16, 16, 16, 0.1)',
                    }}
                  />
                </div>

                {/* Контентная область - заполняет оставшееся пространство */}
                <div style={{ flex: 1, padding: '10px 15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 0 }}>

                  {/* Список услуг */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: '10px' }}>
                    {/* Скорость */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, marginTop: '2px' }}>
                        <CheckCircleIcon />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
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
                            fontFamily: 'TT Firs Neue, sans-serif',
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

                    {/* Каналы */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, marginTop: '2px' }}>
                        <CheckCircleIcon />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
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
                            fontFamily: 'TT Firs Neue, sans-serif',
                            fontWeight: 400,
                            fontSize: '14px',
                            lineHeight: '105%',
                            color: 'rgba(16, 16, 16, 0.5)',
                            marginTop: '2px',
                          }}
                        >
                          {tariff.channelsDesc}
                        </div>
                      </div>
                    </div>

                    {/* Мобильная связь */}
                    {tariff.mobile && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, marginTop: '2px' }}>
                          <CheckCircleIcon />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
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
                              fontFamily: 'TT Firs Neue, sans-serif',
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
                    )}
                  </div>
                </div>

                {/* Футер с ценой и кнопками */}
                <div style={{ padding: '15px', flexShrink: 0 }}>
                  {/* Line 9 - Разделитель перед ценой */}
                  <div
                    style={{
                      marginBottom: '15px',
                      height: '1px',
                      background: 'rgba(16, 16, 16, 0.1)',
                    }}
                  />

                  {/* Цена */}
                  <div
                    style={{
                      fontFamily: 'TT Firs Neue, sans-serif',
                      fontWeight: 400,
                      fontSize: '22px',
                      lineHeight: '115%',
                      color: '#101010',
                      marginBottom: '8px',
                    }}
                  >
                    {tariff.price}
                  </div>

                  {/* Подключение */}
                  <div
                    style={{
                      fontFamily: 'TT Firs Neue, sans-serif',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '105%',
                      color: 'rgba(16, 16, 16, 0.5)',
                      marginBottom: '15px',
                    }}
                  >
                    {tariff.connectionPrice}
                  </div>

                  {/* Кнопки */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {/* Кнопка избранное (сердечко) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavoriteClick(tariff.id);
                      }}
                      style={{
                        width: '50px',
                        height: '50px',
                        background: 'transparent',
                        border: '1px solid rgba(16, 16, 16, 0.1)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                        transition: 'transform 0.15s ease-out',
                        flexShrink: 0,
                      }}
                    >
                      {favorites.has(tariff.id) ? <HeartFilledIcon /> : <HeartOutlineIcon />}
                    </button>

                    {/* Кнопка промо */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTariffSelect(tariff.id);
                      }}
                      style={{
                        flex: 1,
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
                </div>
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

      {/* Модалка выбора квартиры */}
      <AddressInputModal
        isOpen={showApartmentModal}
        onClose={() => setShowApartmentModal(false)}
        onComplete={handleApartmentComplete}
        initialStep="apartment"
      />
    </div>
  );
}

export default function Frame3() {
  return (
    <AddressProvider>
      <Frame3Content />
    </AddressProvider>
  );
}
