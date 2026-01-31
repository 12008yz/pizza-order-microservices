'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
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
import { AddressProvider, useAddress } from '../../../contexts/AddressContext';
import AnimatedHeartFilledIcon from '../../common/AnimatedHeartFilledIcon';
import { tariffsService } from '../../../services/tariffs.service';

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

// Интерфейс для данных из API
interface ApiTariff {
  id: number;
  name: string;
  description: string;
  providerId: number;
  speed: number;
  price: number | string;
  connectionPrice: number | string;
  technology: string;
  hasTV: boolean;
  tvChannels: number | null;
  hasMobile: boolean;
  mobileMinutes: number | null;
  mobileGB: number | null;
  mobileSMS: number | null;
  promoPrice: number | null;
  promoMonths: number | null;
  promoText: string | null;
  favoriteLabel: string | null;
  favoriteDesc: string | null;
  popularity: number;
  provider?: {
    id: number;
    name: string;
    slug: string;
    logo?: string;
  };
}

// Маппинг ID провайдеров на их slug (fallback если провайдер не загружен из API)
const providerIdToSlugMap: Record<number, string> = {
  1: 'rostelecom',
  2: 'mts',
  3: 'beeline',
  4: 'megafon',
  5: 'domru',
  6: 'ttk',
  7: 'akado',
  8: 'netbynet',
};

// Функция преобразования данных из API в формат компонента
function transformApiTariffToComponent(apiTariff: ApiTariff): Tariff {
  const priceValue = typeof apiTariff.price === 'string' ? parseFloat(apiTariff.price) : apiTariff.price;
  const connectionPriceValue = typeof apiTariff.connectionPrice === 'string'
    ? parseFloat(apiTariff.connectionPrice)
    : apiTariff.connectionPrice;

  // Определяем slug провайдера
  const providerSlug = apiTariff.provider?.slug || providerIdToSlugMap[apiTariff.providerId] || `provider_${apiTariff.providerId}`;

  // Определяем тип услуги
  let serviceType = 'internet';
  if (apiTariff.hasTV && apiTariff.hasMobile) {
    serviceType = 'internet_tv_mobile';
  } else if (apiTariff.hasTV) {
    serviceType = 'internet_tv';
  } else if (apiTariff.hasMobile) {
    serviceType = 'internet_mobile';
  }

  // Формируем строку для мобильной связи
  let mobile = '';
  if (apiTariff.hasMobile && apiTariff.mobileMinutes !== null) {
    const parts = [];
    if (apiTariff.mobileMinutes) parts.push(`${apiTariff.mobileMinutes} мин`);
    if (apiTariff.mobileGB !== null) {
      if (apiTariff.mobileGB >= 999) {
        parts.push('безлимит гигабайтов');
      } else {
        parts.push(`${apiTariff.mobileGB} гигабайтов`);
      }
    }
    if (apiTariff.mobileSMS) parts.push(`${apiTariff.mobileSMS} смс`);
    mobile = parts.join(' · ');
  }

  // Формируем строку для каналов
  const channels = apiTariff.hasTV && apiTariff.tvChannels
    ? `${apiTariff.tvChannels} каналов`
    : '';

  // Формируем строку для цены подключения
  const connectionPriceText = connectionPriceValue === 0
    ? 'Подключение от оператора за 0 р.'
    : `Подключение от оператора за ${connectionPriceValue} р.`;

  return {
    id: apiTariff.id,
    providerName: apiTariff.provider?.name || 'Неизвестный провайдер',
    providerId: providerSlug,
    tariffName: apiTariff.name,
    speed: `${apiTariff.speed} Мбит/сек`,
    speedValue: apiTariff.speed,
    speedDesc: 'Безлимитное соединение в квартире',
    channels,
    channelsDesc: apiTariff.hasTV ? 'Телевидение' : '',
    mobile,
    mobileDesc: apiTariff.hasMobile ? 'Мобильное соединение' : '',
    favoriteLabel: apiTariff.favoriteLabel || '',
    favoriteDesc: apiTariff.favoriteDesc || '',
    price: `${priceValue} р./мес.`,
    priceValue,
    connectionPrice: connectionPriceText,
    promoText: apiTariff.promoText || '',
    serviceType,
    popularity: apiTariff.popularity || 0,
  };
}

type ContactMethod = 'max' | 'telegram' | 'phone';

interface FilterState {
  services: string[];
  providers: string[];
  sortBy: string;
}

type HintStep = 'none' | 'consultation' | 'filter';

// Константа для ключа localStorage
const FAVORITES_STORAGE_KEY = 'favorites_tariffs';

function Frame3Content() {
  const router = useRouter();
  const { addressData } = useAddress();
  const scrollRef = useRef<HTMLDivElement>(null);
  const clickGuardRef = useRef(false);

  // Состояние для тарифов из API
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [tariffsLoading, setTariffsLoading] = useState(true);
  const [tariffsError, setTariffsError] = useState<string | null>(null);

  // Проверка заполненности всех обязательных полей при монтировании
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Проверяем данные из sessionStorage
    try {
      const storedData = sessionStorage.getItem('addressData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // Проверяем обязательные поля
        const hasConnectionType = parsedData.connectionType;
        const hasCity = parsedData.cityId || parsedData.city;
        const hasStreet = parsedData.streetId || parsedData.street;
        const hasHouseNumber = parsedData.buildingId || parsedData.houseNumber;
        const hasPrivacyConsent = parsedData.privacyConsent;

        // Если хотя бы одно обязательное поле не заполнено, редиректим на главную
        if (!hasConnectionType || !hasCity || !hasStreet || !hasHouseNumber || !hasPrivacyConsent) {
          router.push('/');
          return;
        }
      } else {
        // Если данных нет в sessionStorage, проверяем addressData из контекста
        const hasConnectionType = addressData.connectionType;
        const hasCity = addressData.cityId || addressData.city;
        const hasStreet = addressData.streetId || addressData.street;
        const hasHouseNumber = addressData.buildingId || addressData.houseNumber;
        const hasPrivacyConsent = addressData.privacyConsent;

        // Если хотя бы одно обязательное поле не заполнено, редиректим на главную
        if (!hasConnectionType || !hasCity || !hasStreet || !hasHouseNumber || !hasPrivacyConsent) {
          router.push('/');
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to check address data:', error);
      // В случае ошибки редиректим на главную для безопасности
      router.push('/');
    }
  }, [router, addressData]);
  const [isHomePressed, setIsHomePressed] = useState(false);
  const [isHeartPressed, setIsHeartPressed] = useState(false);
  const [isFunnelPressed, setIsFunnelPressed] = useState(false);
  const [isPlanePressed, setIsPlanePressed] = useState(false);
  const [clickedButton, setClickedButton] = useState<string | null>(null);
  const [isArrowPressed, setIsArrowPressed] = useState(false);
  const [arrowClicked, setArrowClicked] = useState(false);
  const [isClearFilterPressed, setIsClearFilterPressed] = useState(false);
  const [showConsultation, setShowConsultation] = useState(false);
  const [showFilterWizard, setShowFilterWizard] = useState(false);
  const [hintStep, setHintStep] = useState<HintStep>('consultation');

  // Состояние для режима избранного
  const [showFavoritesMode, setShowFavoritesMode] = useState(false);

  // Универсальная защита от «дублей» кликов по кнопкам
  const withClickGuard = <T extends any[]>(handler: (...args: T) => void) =>
    (...args: T) => {
      if (clickGuardRef.current) return;
      clickGuardRef.current = true;
      try {
        handler(...args);
      } finally {
        setTimeout(() => {
          clickGuardRef.current = false;
        }, 400);
      }
    };

  // Начальные значения фильтров
  const defaultFilters: FilterState = {
    services: ['internet', 'internet_mobile', 'internet_tv', 'internet_tv_mobile'],
    providers: ['beeline', 'domru', 'megafon', 'mts', 'rostelecom'],
    sortBy: 'price',
  };

  const [filters, setFilters] = useState<FilterState>(defaultFilters);

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

  // Загрузка избранных из localStorage при монтировании
  const [favorites, setFavorites] = useState<Set<number>>(() => {
    // Инициализация из localStorage при первом рендере (только на клиенте)
    if (typeof window !== 'undefined') {
      try {
        const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (storedFavorites) {
          const parsedFavorites = JSON.parse(storedFavorites);
          if (Array.isArray(parsedFavorites)) {
            return new Set(parsedFavorites);
          }
        }
      } catch (error) {
        console.warn('Failed to load favorites from localStorage:', error);
      }
    }
    return new Set();
  });
  const [showFavoriteToast, setShowFavoriteToast] = useState(false);
  const [hasShownFavoriteToast, setHasShownFavoriteToast] = useState(false);
  const [favoritesInitialized, setFavoritesInitialized] = useState(false);
  const [recentlyAddedFavorites, setRecentlyAddedFavorites] = useState<Set<number>>(new Set());

  // Загрузка тарифов из API
  useEffect(() => {
    const loadTariffs = async () => {
      try {
        setTariffsLoading(true);
        setTariffsError(null);
        const response = await tariffsService.getTariffs();

        if (response.success && response.data) {
          const transformedTariffs = response.data.map((apiTariff: any) =>
            transformApiTariffToComponent(apiTariff as ApiTariff)
          );

          // Удаляем дубликаты по ID (на случай если API вернет дубликаты)
          const uniqueTariffs = transformedTariffs.reduce((acc: Tariff[], current: Tariff) => {
            const existingTariff = acc.find(t => t.id === current.id);
            if (!existingTariff) {
              acc.push(current);
            }
            return acc;
          }, []);

          setTariffs(uniqueTariffs);
        } else {
          setTariffsError(response.error || 'Не удалось загрузить тарифы');
        }
      } catch (error: any) {
        console.error('Failed to load tariffs:', error);
        setTariffsError(error.message || 'Ошибка при загрузке тарифов');
      } finally {
        setTariffsLoading(false);
      }
    };

    loadTariffs();
  }, []);

  // Помечаем, что избранные инициализированы после первого рендера на клиенте
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Если тарифы ещё не загружены, просто помечаем, что инициализация завершена,
    // и используем значения, которые уже пришли из initialState выше
    if (tariffs.length === 0) {
      setFavoritesInitialized(true);
      return;
    }

    try {
      const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        const parsedFavorites = JSON.parse(storedFavorites);
        if (Array.isArray(parsedFavorites)) {
          // Фильтруем только те ID, которые существуют в текущих тарифах
          const validFavorites = parsedFavorites.filter((id: number) =>
            tariffs.some(t => t.id === id)
          );

          // Обновляем localStorage и состояние, но больше не затираем всё при пустом массиве
          localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(validFavorites));
          setFavorites(new Set(validFavorites));
        }
      }
    } catch (error) {
      console.warn('Failed to load favorites from localStorage:', error);
    }

    setFavoritesInitialized(true);
  }, [tariffs.length]); // Зависимость от количества тарифов, чтобы очистить невалидные ID после загрузки

  // Сохранение избранных в localStorage при изменении (только после инициализации)
  useEffect(() => {
    // Не сохраняем до инициализации, чтобы не перезаписать данные пустым массивом
    if (!favoritesInitialized) return;

    try {
      const favoritesArray = Array.from(favorites);
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoritesArray));
    } catch (error) {
      console.warn('Failed to save favorites to localStorage:', error);
    }
  }, [favorites, favoritesInitialized]);

  // Обработчик добавления/удаления из избранного
  const handleFavoriteClick = (tariffId: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(tariffId)) {
        newFavorites.delete(tariffId);
        // Убираем из недавно добавленных при удалении
        setRecentlyAddedFavorites((prevRecent) => {
          const newRecent = new Set(prevRecent);
          newRecent.delete(tariffId);
          return newRecent;
        });
      } else {
        newFavorites.add(tariffId);
        // Добавляем в недавно добавленные для анимации
        setRecentlyAddedFavorites((prevRecent) => {
          const newRecent = new Set(prevRecent);
          newRecent.add(tariffId);
          return newRecent;
        });
        // Убираем из недавно добавленных через 1 секунду
        setTimeout(() => {
          setRecentlyAddedFavorites((prevRecent) => {
            const newRecent = new Set(prevRecent);
            newRecent.delete(tariffId);
            return newRecent;
          });
        }, 1000);
        // Показываем уведомление только 1 раз
        if (!hasShownFavoriteToast) {
          setShowFavoriteToast(true);
          setHasShownFavoriteToast(true);
        }
      }
      return newFavorites;
    });
  };

  // Вычисляем наличие избранных тарифов (только валидные ID, которые есть в текущих тарифах)
  const hasFavorites = useMemo(() => {
    const validFavorites = Array.from(favorites).filter(id => tariffs.some(t => t.id === id));
    return validFavorites.length > 0;
  }, [favorites.size, tariffs.length]);

  // Обработчик открытия режима избранного
  const handleHeartClick = () => {
    if (hasFavorites) {
      setShowFavoritesMode(true);
    }
  };

  // Обработчик закрытия режима избранного (клик на пустое место)
  const handleFavoritesModeBackgroundClick = (e: React.MouseEvent) => {
    // Закрываем только если клик был именно на фон, а не на дочерний элемент
    if (e.target === e.currentTarget) {
      setShowFavoritesMode(false);
    }
  };

  // Тарифы для отображения в зависимости от режима
  const displayedTariffs = useMemo(() => {
    // Если тарифы еще загружаются, возвращаем пустой массив (показывается индикатор загрузки)
    if (tariffsLoading) {
      return [];
    }

    let result = tariffs;

    // В режиме избранного показываем только избранные тарифы
    if (showFavoritesMode) {
      result = tariffs.filter((tariff) => favorites.has(tariff.id));
    } else {
      // Обычный режим - фильтруем по настройкам
      result = tariffs.filter((tariff) => {
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
    }

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

    // Удаляем дубликаты по ID на всякий случай (защита от дубликатов после фильтрации)
    const uniqueResult = result.reduce((acc: Tariff[], current: Tariff) => {
      const existingTariff = acc.find(t => t.id === current.id);
      if (!existingTariff) {
        acc.push(current);
      }
      return acc;
    }, []);

    return uniqueResult;
  }, [filters, showFavoritesMode, favorites, tariffs, tariffsLoading]);

  // Сброс скролла в начало при изменении фильтров или режима избранного
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: 0,
        behavior: 'smooth',
      });
    }
  }, [filters, showFavoritesMode]);

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

  // Обработчик клика на кнопку тарифа - переходит на Frame4 (оборудование)
  const handleTariffSelect = (tariffId: number) => {
    // Сохраняем выбранный тариф в sessionStorage
    try {
      const selectedTariff = tariffs.find(t => t.id === tariffId);
      if (selectedTariff) {
        sessionStorage.setItem('selectedTariff', JSON.stringify({
          id: selectedTariff.id,
          providerName: selectedTariff.providerName,
          providerId: selectedTariff.providerId,
          tariffName: selectedTariff.tariffName,
          price: selectedTariff.price,
          priceValue: selectedTariff.priceValue,
        }));
      }
    } catch (error) {
      console.warn('Failed to save selected tariff:', error);
    }

    // Переходим на страницу выбора оборудования
    router.push('/equipment');
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
      // Анимация клика
      setArrowClicked(true);
      setTimeout(() => setArrowClicked(false), 400);

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
      onClick={showFavoritesMode ? handleFavoritesModeBackgroundClick : undefined}
    >
      {/* Режим избранного: текст вместо Header */}
      {showFavoritesMode ? (
        <div
          className="absolute"
          style={{
            width: '240px',
            height: '30px',
            left: 'calc(50% - 240px/2)',
            top: '75px',
          }}
        >
          <div
            style={{
              fontFamily: 'TT Firs Neue, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '105%',
              display: 'flex',
              alignItems: 'center',
              textAlign: 'center',
              justifyContent: 'center',
              color: 'rgba(16, 16, 16, 0.25)',
            }}
          >
            Нажмите в открытое пустое место, чтобы выйти из этого режима
          </div>
        </div>
      ) : (
        /* Header - Group 7545 */
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
            onClick={withClickGuard(() => {
              setClickedButton('home');
              setTimeout(() => setClickedButton(null), 300);
              router.push('/');
            })}
            onMouseDown={() => setIsHomePressed(true)}
            onMouseUp={() => setIsHomePressed(false)}
            onMouseLeave={() => setIsHomePressed(false)}
            onTouchStart={() => setIsHomePressed(true)}
            onTouchEnd={() => setIsHomePressed(false)}
          >
            <div
              className="w-full h-full flex items-center justify-center relative overflow-hidden"
              style={{
                background: '#FFFFFF',
                borderRadius: '100px',
                transform: isHomePressed ? 'scale(0.85)' : 'scale(1)',
                transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
                  transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: isHomePressed ? 'rotate(-5deg) scale(0.95)' : 'rotate(0deg) scale(1)',
                }}
              >
                <HomeIcon color={clickedButton === 'home' ? '#4A90E2' : '#101010'} />
              </div>
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
            onClick={withClickGuard(() => {
              setClickedButton('heart');
              setTimeout(() => setClickedButton(null), 300);
              handleHeartClick();
            })}
            onMouseDown={() => setIsHeartPressed(true)}
            onMouseUp={() => setIsHeartPressed(false)}
            onMouseLeave={() => setIsHeartPressed(false)}
            onTouchStart={() => setIsHeartPressed(true)}
            onTouchEnd={() => setIsHeartPressed(false)}
          >
            <div
              className="w-full h-full flex items-center justify-center relative overflow-hidden"
              style={{
                background: '#FFFFFF',
                borderRadius: '100px',
                transform: isHeartPressed ? 'scale(0.85)' : 'scale(1)',
                transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              suppressHydrationWarning
            >
              {/* Ripple эффект */}
              {clickedButton === 'heart' && (
                <div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '100px',
                    background: 'rgba(255, 48, 48, 0.15)',
                    animation: 'ripple 0.4s ease-out',
                  }}
                />
              )}
              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: isHeartPressed ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
                }}
              >
                {favoritesInitialized && hasFavorites ? (
                  <HeartHeaderFilledIcon />
                ) : (
                  <HeartIcon />
                )}
              </div>
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
            onClick={withClickGuard(() => {
              // Если мастер фильтра уже открыт, игнорируем клики,
              // чтобы не ломать иконку и состояние
              if (showFilterWizard) return;

              setClickedButton('funnel');
              setTimeout(() => setClickedButton(null), 300);
              handleFilterClick();
            })}
            onMouseDown={() => setIsFunnelPressed(true)}
            onMouseUp={() => setIsFunnelPressed(false)}
            onMouseLeave={() => setIsFunnelPressed(false)}
            onTouchStart={() => setIsFunnelPressed(true)}
            onTouchEnd={() => setIsFunnelPressed(false)}
          >
            <div
              className="w-full h-full flex items-center justify-center relative overflow-hidden"
              style={{
                background: '#FFFFFF',
                borderRadius: '100px',
                transform: isFunnelPressed ? 'scale(0.85)' : 'scale(1)',
                transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {/* Ripple эффект */}
              {clickedButton === 'funnel' && (
                <div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '100px',
                    background: 'rgba(139, 69, 19, 0.15)',
                    animation: 'ripple 0.4s ease-out',
                  }}
                />
              )}
              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: isFunnelPressed ? 'scale(1.1) rotate(-10deg)' : 'scale(1) rotate(0deg)',
                }}
              >
                <FunnelIcon />
              </div>
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
            onClick={withClickGuard(() => {
              setClickedButton('plane');
              setTimeout(() => setClickedButton(null), 300);
              handlePlaneClick();
            })}
            onMouseDown={() => setIsPlanePressed(true)}
            onMouseUp={() => setIsPlanePressed(false)}
            onMouseLeave={() => setIsPlanePressed(false)}
            onTouchStart={() => setIsPlanePressed(true)}
            onTouchEnd={() => setIsPlanePressed(false)}
          >
            <div
              className="w-full h-full flex items-center justify-center relative overflow-hidden"
              style={{
                background: '#FFFFFF',
                borderRadius: '100px',
                transform: isPlanePressed ? 'scale(0.85)' : 'scale(1)',
                transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
                  transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: isPlanePressed ? 'scale(1.1) rotate(15deg)' : 'scale(1) rotate(0deg)',
                }}
              >
                <PlaneIcon color={clickedButton === 'plane' ? '#228B22' : '#101010'} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HintTooltip - модальное окно подсказки */}
      {hintStep !== 'none' && !showFavoritesMode && (
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

      {/* Кнопка отмены фильтрации - слева от карточки, показывается только когда фильтр активен и не в режиме избранного */}
      {isFilterActive && !showFavoritesMode && (
        <div
          className="absolute cursor-pointer"
          style={{
            width: '40px',
            height: '40px',
            left: '20px',
            top: '255px',
          }}
          onClick={withClickGuard(handleClearFilters)}
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

      {/* Контейнер для кнопок управления справа - Group 7509 */}
      <div
        className="absolute"
        style={{
          right: '20px',
          top: '255px',
        }}
      >
        {showFavoritesMode ? (
          // Общий "пилюлеобразный" контейнер для избранного + стрелки
          <div
            className="flex items-center"
            style={{
              width: '76px',
              height: '40px',
              background: '#FFFFFF',
              borderRadius: '100px',
              padding: '0 8px',
              boxSizing: 'border-box',
              justifyContent: 'space-between',
              // Чуть уменьшаем расстояние между сердцем и стрелкой
              gap: '2px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Сердечко избранного */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
              }}
            >
              <HeartFilledIcon />
            </div>

            {/* Кнопка скролла вправо внутри общей "таблетки" */}
            <div
              className="cursor-pointer"
              style={{
                width: '28px',
                height: '28px',
              }}
              onClick={withClickGuard((e) => {
                e.stopPropagation();
                handleScrollRight();
              })}
              onMouseDown={() => setIsArrowPressed(true)}
              onMouseUp={() => setIsArrowPressed(false)}
              onMouseLeave={() => setIsArrowPressed(false)}
              onTouchStart={() => setIsArrowPressed(true)}
              onTouchEnd={() => setIsArrowPressed(false)}
            >
              <div
                className="w-full h-full flex items-center justify-center relative overflow-hidden"
                style={{
                  // Анимация как в обычном режиме стрелки
                  background: '#FFFFFF',
                  borderRadius: '100px',
                  transform: isArrowPressed ? 'scale(0.85)' : 'scale(1)',
                  transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                {/* Ripple эффект */}
                {arrowClicked && (
                  <div
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: '999px',
                      background: 'rgba(16, 16, 16, 0.1)',
                      animation: 'ripple 0.4s ease-out',
                    }}
                  />
                )}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: isArrowPressed
                      ? 'scale(1.1) rotate(-5deg)'
                      : arrowClicked
                        ? 'scale(1.15)'
                        : 'scale(1)',
                  }}
                >
                  {/* Те же цвета и поведение, что и у обычной стрелки */}
                  <ArrowCircleRightIcon
                    color={arrowClicked ? '#4A90E2' : '#101010'}
                    isAnimating={arrowClicked}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Обычная одиночная круглая стрелка
          <div
            className="cursor-pointer"
            style={{
              width: '40px',
              height: '40px',
            }}
            onClick={withClickGuard((e) => {
              e.stopPropagation();
              handleScrollRight();
            })}
            onMouseDown={() => setIsArrowPressed(true)}
            onMouseUp={() => setIsArrowPressed(false)}
            onMouseLeave={() => setIsArrowPressed(false)}
            onTouchStart={() => setIsArrowPressed(true)}
            onTouchEnd={() => setIsArrowPressed(false)}
          >
            <div
              className="w-full h-full flex items-center justify-center relative overflow-hidden"
              style={{
                background: '#FFFFFF',
                borderRadius: '100px',
                transform: isArrowPressed ? 'scale(0.85)' : 'scale(1)',
                transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {arrowClicked && (
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
                  transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: isArrowPressed ? 'scale(1.1) rotate(-5deg)' : arrowClicked ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                <ArrowCircleRightIcon color={arrowClicked ? '#4A90E2' : '#101010'} isAnimating={arrowClicked} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Контейнер для карточек - показывает 15px второй карточки справа */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: '20px',
          right: '5px',
          top: '305px',
        }}
        onClick={(e) => e.stopPropagation()}
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
          {tariffsLoading ? (
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
              <p style={{ color: 'rgba(16, 16, 16, 0.5)', fontSize: '16px' }}>
                Загрузка тарифов...
              </p>
            </div>
          ) : tariffsError ? (
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
              <p style={{ color: 'rgba(255, 0, 0, 0.7)', fontSize: '16px' }}>
                {tariffsError}
              </p>
            </div>
          ) : !tariffsLoading && displayedTariffs.length === 0 ? (
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
                {showFavoritesMode
                  ? 'Нет избранных тарифов. Добавьте тарифы в избранное.'
                  : 'Нет тарифов по выбранным фильтрам. Попробуйте изменить параметры фильтрации.'}
              </div>
            </div>
          ) : (
            displayedTariffs.map((tariff, index) => (
              <div
                key={`tariff-${tariff.id}-${tariff.providerId}-${index}`}
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

                    {/* Дополнительное приложение (Кинотеатр) */}
                    {tariff.favoriteLabel && (
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
                            {tariff.favoriteLabel}
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
                            {tariff.favoriteDesc}
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
                    {/* Кнопка избранное (сердечко) — как во Frame1/Frame4: type="button" для надёжного клика */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavoriteClick(tariff.id);
                      }}
                      className="outline-none cursor-pointer"
                      style={{
                        width: '50px',
                        height: '50px',
                        background: 'transparent',
                        border: '1px solid rgba(16, 16, 16, 0.1)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxSizing: 'border-box',
                        transition: 'transform 0.15s ease-out',
                        flexShrink: 0,
                      }}
                      suppressHydrationWarning
                    >
                      {favorites.has(tariff.id) ? (
                        recentlyAddedFavorites.has(tariff.id) ? (
                          <AnimatedHeartFilledIcon />
                        ) : (
                          <HeartFilledIcon />
                        )
                      ) : (
                        <HeartOutlineIcon />
                      )}
                    </button>

                    {/* Кнопка промо (главная) — как во Frame1/Frame4: type="button" для надёжного клика */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTariffSelect(tariff.id);
                      }}
                      className="outline-none cursor-pointer"
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

      {/* Стили для скрытия скроллбара и анимации ripple */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
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
        onClose={() => {
          setShowFilterWizard(false);
          // На всякий случай сбрасываем визуальное "нажатие" фильтра
          setIsFunnelPressed(false);
          setClickedButton(prev => (prev === 'funnel' ? null : prev));
        }}
        onApply={handleFilterApply}
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
