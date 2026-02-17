'use client';

import { useState, useRef, useMemo, useEffect, useLayoutEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  HomeIcon,
  HeartIcon,
  FunnelIcon,
  PlaneIcon,
  CheckCircleIcon,
  PlusCircleIcon,
  ArrowCircleRightIcon,
  HeartFilledIcon,
  HeartHeaderFilledIcon,
  HeartHeaderBlackFilledIcon,
  ClearFilterIcon,
  InfoIcon,
} from '../../common/icons';
import FavoriteToast from './FavoriteToast';
import FilterWizard from './FilterWizard';
import HintTooltip from './HintTooltip';
import { ClickOutsideHintContent, HINT_TOP } from '../../common/ClickOutsideHint';
import Logo from '../../common/Logo';
import { AddressProvider, useAddress } from '../../../contexts/AddressContext';
import AnimatedHeartFilledIcon from '../../common/AnimatedHeartFilledIcon';
import { tariffsService } from '../../../services/tariffs.service';
import LoadingScreen from '../../LoadingScreen';

// Динамический импорт ConsultationFlow для code splitting
const ConsultationFlow = dynamic(() => import('../Frame2/ConsultationFlow'), {
  loading: () => <LoadingScreen />,
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

// Демо-тарифы, если API не вернул данные (provider-service не запущен или БД пустая)
const DEMO_TARIFFS: ApiTariff[] = [
  {
    id: 1,
    name: 'Технологии выгоды. Тест-драйв.',
    description: 'Интернет 100 Мбит/с + ТВ 135 каналов + мобильная связь',
    providerId: 1,
    speed: 100,
    price: 965,
    connectionPrice: 500,
    technology: 'fiber',
    hasTV: true,
    tvChannels: 135,
    hasMobile: true,
    mobileMinutes: 1000,
    mobileGB: 40,
    mobileSMS: 50,
    promoPrice: 0,
    promoMonths: 3,
    promoText: '90 дней за 0 р.',
    favoriteLabel: 'Кинотеатр «Wink»',
    favoriteDesc: 'Дополнительное приложение',
    popularity: 95,
    provider: { id: 1, name: 'Ростелеком', slug: 'rostelecom' },
  },
  {
    id: 2,
    name: 'Домашний интернет + ТВ',
    description: 'Интернет 200 Мбит/с + ТВ 180 каналов + мобильная связь',
    providerId: 2,
    speed: 200,
    price: 890,
    connectionPrice: 0,
    technology: 'fiber',
    hasTV: true,
    tvChannels: 180,
    hasMobile: true,
    mobileMinutes: 800,
    mobileGB: 30,
    mobileSMS: 100,
    promoPrice: 1,
    promoMonths: 1,
    promoText: '30 дней за 1 р.',
    favoriteLabel: 'KION',
    favoriteDesc: 'Дополнительное приложение',
    popularity: 90,
    provider: { id: 2, name: 'МТС', slug: 'mts' },
  },
  {
    id: 3,
    name: 'Всё в одном',
    description: 'Интернет 300 Мбит/с + ТВ 200 каналов + мобильная связь',
    providerId: 3,
    speed: 300,
    price: 1100,
    connectionPrice: 300,
    technology: 'fiber',
    hasTV: true,
    tvChannels: 200,
    hasMobile: true,
    mobileMinutes: 1500,
    mobileGB: 50,
    mobileSMS: 200,
    promoPrice: 0,
    promoMonths: 2,
    promoText: '60 дней за 0 р.',
    favoriteLabel: 'Wink',
    favoriteDesc: 'Дополнительное приложение',
    popularity: 85,
    provider: { id: 3, name: 'Билайн', slug: 'beeline' },
  },
  {
    id: 4,
    name: 'Интернет + ТВ Стартовый',
    description: 'Интернет 150 Мбит/с + ТВ 100 каналов',
    providerId: 5,
    speed: 150,
    price: 650,
    connectionPrice: 0,
    technology: 'fiber',
    hasTV: true,
    tvChannels: 100,
    hasMobile: false,
    mobileMinutes: null,
    mobileGB: null,
    mobileSMS: null,
    promoPrice: 0,
    promoMonths: 0,
    promoText: '14 дней за 0 р.',
    favoriteLabel: null,
    favoriteDesc: null,
    popularity: 80,
    provider: { id: 5, name: 'ДОМ.RU', slug: 'domru' },
  },
  {
    id: 5,
    name: 'Объединяй! Максимум',
    description: 'Интернет 500 Мбит/с + ТВ 250 каналов + мобильная связь безлимит',
    providerId: 4,
    speed: 500,
    price: 1500,
    connectionPrice: 0,
    technology: 'fiber',
    hasTV: true,
    tvChannels: 250,
    hasMobile: true,
    mobileMinutes: 2000,
    mobileGB: 999,
    mobileSMS: 500,
    promoPrice: 0,
    promoMonths: 1,
    promoText: '30 дней за 0 р.',
    favoriteLabel: null,
    favoriteDesc: null,
    popularity: 75,
    provider: { id: 4, name: 'Мегафон', slug: 'megafon' },
  },
];

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

// Зазор: иконки — 10px от карточек, карточки — 20px от низа экрана
const ICON_TO_CARD_GAP_PX = 10;
// В режиме избранного отступ стрелки от карточки (как и в обычном — 10px)
const FAVORITES_ICON_TO_CARD_GAP_PX = 10;
const CARD_TO_BOTTOM_GAP_PX = 20;

function Frame3Content() {
  const router = useRouter();
  const { addressData } = useAddress();
  const scrollRef = useRef<HTMLDivElement>(null);
  const frameInnerRef = useRef<HTMLDivElement>(null);
  const clickGuardRef = useRef(false);
  const [iconTopPx, setIconTopPx] = useState<number | null>(null);

  // Состояние для тарифов из API
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [tariffsLoading, setTariffsLoading] = useState(true);
  const [tariffsError, setTariffsError] = useState<string | null>(null);

  // Прелоад Frame4 и Frame5, чтобы при переходе на /equipment и /order контент показывался сразу
  useEffect(() => {
    import('../Frame4');
    import('../Frame5');
  }, []);

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
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isClearFilterPressed, setIsClearFilterPressed] = useState(false);
  const [showConsultation, setShowConsultation] = useState(false);
  const [showFilterWizard, setShowFilterWizard] = useState(false);
  const [hintStep, setHintStep] = useState<HintStep>('consultation');

  // Состояние для режима избранного
  const [showFavoritesMode, setShowFavoritesMode] = useState(false);

  // Универсальная защита от «дублей» кликов по кнопкам (без дженерика — SWC в .tsx путает < с JSX)
  const withClickGuard = (handler: (...args: any[]) => void) =>
    (...args: any[]) => {
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

        if (response.success && response.data !== undefined) {
          const rawTariffs: ApiTariff[] =
            response.data.length > 0 ? (response.data as ApiTariff[]) : DEMO_TARIFFS;
          const transformedTariffs = rawTariffs.map((apiTariff) =>
            transformApiTariffToComponent(apiTariff)
          );

          const uniqueTariffs = transformedTariffs.reduce((acc: Tariff[], current: Tariff) => {
            const existingTariff = acc.find(t => t.id === current.id);
            if (!existingTariff) acc.push(current);
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

  // Обработчик закрытия режима избранного (клик по пустому месту — везде, кроме карточки тарифа)
  const handleFavoritesModeBackgroundClick = (e: React.MouseEvent) => {
    if (!showFavoritesMode) return;
    // Не закрываем, если клик был по карточке тарифа (внутри можно листать, нажимать сердечко и т.д.)
    if ((e.target as HTMLElement).closest?.('.carousel-card')) return;
    setShowFavoritesMode(false);
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
        // Фильтр по типу услуги (при выборе «Телевидение» показываем тарифы с ТВ: internet_tv, internet_tv_mobile)
        const serviceMatch =
          filters.services.includes(tariff.serviceType) ||
          (filters.services.includes('tv') && (tariff.serviceType === 'internet_tv' || tariff.serviceType === 'internet_tv_mobile'));
        if (!serviceMatch) {
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
    router.push('/?consultation=1');
  };

  const handleFilterClick = () => {
    setShowFilterWizard(true);
  };

  const handleFilterApply = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  // Обработчик клика на кнопку тарифа - переходит на Frame4 (оборудование)
  const handleTariffSelect = (tariffId: number) => {
    // Сохраняем полный тариф в sessionStorage для итоговой карточки (тариф + оборудование)
    try {
      const selectedTariff = tariffs.find(t => t.id === tariffId);
      if (selectedTariff) {
        const hasTV = selectedTariff.serviceType === 'internet_tv' || selectedTariff.serviceType === 'internet_tv_mobile';
        const hasMobile = selectedTariff.serviceType === 'internet_mobile' || selectedTariff.serviceType === 'internet_tv_mobile';
        sessionStorage.setItem('selectedTariff', JSON.stringify({
          id: selectedTariff.id,
          providerName: selectedTariff.providerName,
          providerId: selectedTariff.providerId,
          tariffName: selectedTariff.tariffName,
          price: selectedTariff.price,
          priceValue: selectedTariff.priceValue,
          speed: selectedTariff.speed,
          speedValue: selectedTariff.speedValue,
          speedDesc: selectedTariff.speedDesc,
          channels: selectedTariff.channels,
          channelsDesc: selectedTariff.channelsDesc,
          mobile: selectedTariff.mobile,
          mobileDesc: selectedTariff.mobileDesc,
          favoriteLabel: selectedTariff.favoriteLabel,
          favoriteDesc: selectedTariff.favoriteDesc,
          connectionPrice: selectedTariff.connectionPrice,
          promoText: selectedTariff.promoText,
          hasTV,
          hasMobile,
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

  // Порог «конца» карусели (одно значение для поворота стрелки и для действия «в начало»)
  const SCROLL_END_THRESHOLD = 5;
  // Проверка: можно ли ещё листать вправо. На конце карусели — стрелка 180° и по клику скролл в начало.
  const updateCanScrollRight = useCallback(() => {
    const el = scrollRef.current;
    if (!el || displayedTariffs.length <= 1) {
      setCanScrollRight(false);
      return;
    }
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - SCROLL_END_THRESHOLD;
    setCanScrollRight(!atEnd);
  }, [displayedTariffs.length]);

  useEffect(() => {
    updateCanScrollRight();
  }, [displayedTariffs, updateCanScrollRight]);

  // По окончании скролла (в т.ч. плавного) обновить состояние — стрелка вернётся в 0° у первой карточки
  const scrollEndRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onScrollWithEnd = useCallback(() => {
    updateCanScrollRight();
    if (scrollEndRef.current) clearTimeout(scrollEndRef.current);
    scrollEndRef.current = setTimeout(() => {
      scrollEndRef.current = null;
      updateCanScrollRight();
    }, 150);
  }, [updateCanScrollRight]);
  useEffect(() => () => {
    if (scrollEndRef.current) clearTimeout(scrollEndRef.current);
  }, []);

  // Позиция иконок: 10px над верхним краем первой карточки (карточки прижаты к низу, отступ 20px)
  const updateIconTop = useCallback(() => {
    const scrollEl = scrollRef.current;
    const containerEl = frameInnerRef.current;
    if (!scrollEl || !containerEl) return;
    const firstCard = scrollEl.querySelector('.carousel-card') as HTMLElement | null;
    if (!firstCard) return;
    const cardRect = firstCard.getBoundingClientRect();
    const containerRect = containerEl.getBoundingClientRect();
    const top = cardRect.top - containerRect.top - 40 - ICON_TO_CARD_GAP_PX;
    setIconTopPx(top);
  }, []);

  useLayoutEffect(() => {
    updateIconTop();
    const ro = new ResizeObserver(updateIconTop);
    if (frameInnerRef.current) ro.observe(frameInnerRef.current);
    return () => ro.disconnect();
  }, [displayedTariffs.length, updateIconTop]);

  // Скролл ровно на одну карточку (ширина карточки + зазор 5px)
  const CARD_GAP = 5;
  const handleScrollRight = () => {
    const el = scrollRef.current;
    if (!el || displayedTariffs.length <= 1) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - SCROLL_END_THRESHOLD;
    setArrowClicked(true);
    setTimeout(() => setArrowClicked(false), 400);
    if (atEnd) {
      // Конец карусели — плавно в начало
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      const firstCard = el.querySelector('.carousel-card');
      const step = firstCard
        ? (firstCard as HTMLElement).offsetWidth + CARD_GAP
        : 390;
      el.scrollBy({ left: step, behavior: 'smooth' });
    }
  };

  // На конце карусели стрелка повёрнута на 180° и по клику плавно в начало (обычный режим и избранное)
  const isArrowAtEnd = displayedTariffs.length > 1 && !canScrollRight;

  return (
    <div
      className="fixed inset-0 flex justify-center overflow-hidden"
      style={{
        fontFamily: 'TT Firs Neue, sans-serif',
        paddingTop: 'var(--sat, 0px)',
        background: '#F5F5F5',
        height: '100svh',
        maxHeight: '100svh',
        boxSizing: 'border-box',
        alignItems: 'stretch',
      }}
      onClick={showFavoritesMode ? handleFavoritesModeBackgroundClick : undefined}
    >
      {/* Адаптивная ширина: 100% на малых экранах, макс 425px — ровно при 400px и 425px, без обрезанной полоски справа */}
      <div
        ref={frameInnerRef}
        className="relative flex flex-col overflow-hidden"
        style={{
          width: '100%',
          maxWidth: '425px',
          height: '100%',
          minHeight: 0,
          background: '#F5F5F5',
          boxSizing: 'border-box',
        }}
      >
        {showFavoritesMode ? (
          <div
            className="flex-shrink-0 cursor-pointer"
            style={{
              position: 'absolute',
              top: HINT_TOP,
              left: '20px',
              right: '20px',
              display: 'flex',
              justifyContent: 'center',
              zIndex: 10,
            }}
            onClick={() => setShowFavoritesMode(false)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setShowFavoritesMode(false)}
            aria-label="Выйти из режима избранного"
          >
            <ClickOutsideHintContent />
          </div>
        ) : null}

        {/* Логотип ГИГАПОИСК — тот же компонент и отступ, что в Frame1 (left 65px = 20+40+5 от домика) */}
        {!showFavoritesMode && <Logo />}

        {/* Header: как в Frame1 — иконка дома left 20px от левого края контента */}
        {!showFavoritesMode && (
          <div
            style={{
              position: 'absolute',
              left: '20px',
              right: '20px',
              height: '40px',
              top: 'var(--header-top, 50px)',
            }}
          >
            {/* Group 7510 — Home: 40×40 at left 0 ( = 20px от края контента, как в Frame1) */}
            <div
              className="cursor-pointer"
              style={{
                position: 'absolute',
                width: '40px',
                height: '40px',
                left: 0,
                top: 0,
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

            {/* Heart: 40×40, 5px между иконками → right 90 (45+40+5) */}
            <div
              className="cursor-pointer"
              style={{
                position: 'absolute',
                width: '40px',
                height: '40px',
                right: '90px',
                top: 0,
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
                      <HeartHeaderBlackFilledIcon />
                    )}
                  </div>
                </div>
              </div>

            {/* Funnel: 40×40, 5px перед самолётом → right 45 (40+5) */}
            <div
              className="cursor-pointer"
              style={{
                position: 'absolute',
                width: '40px',
                height: '40px',
                right: '45px',
                top: 0,
              }}
              onClick={withClickGuard(() => {
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

            {/* Group 7509 — PaperPlane: 40×40, привязка к правому краю header (ровно по краю) */}
            <div
              className="cursor-pointer"
              style={{
                position: 'absolute',
                width: '40px',
                height: '40px',
                right: 0,
                top: 0,
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
        </div>

      {/* Подсказки в том же контейнере, что и header — right: 20px от правого края блока (ровно по иконке самолёта) */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, pointerEvents: 'none' }}>
        {hintStep !== 'none' && !showFavoritesMode && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, pointerEvents: 'auto' }}>
            <HintTooltip
              text={hintStep === 'consultation' ? 'Консультация, это здесь' : 'Фильтрация, это здесь'}
              position={hintStep}
              onAccept={handleHintAccept}
              onDecline={handleHintDecline}
            />
          </div>
        )}
      </div>

      <FavoriteToast
        isVisible={showFavoriteToast}
        onClose={() => setShowFavoriteToast(false)}
      />

      {/* Стрелка переключения тарифа — 10px от верхнего края карточки, по правому краю карточки (19px от края контейнера на desktop) */}
      {/* В режиме избранного показываем блок с сердечком + стрелкой только если есть избранные; иначе — только стрелку (вне режима избранного) */}
      {showFavoritesMode && displayedTariffs.length > 0 ? (
        /* Блок с сердечком и стрелкой в режиме избранного. Отступ от карточки меньше (5px). Когда карточка одна — ещё на 2px ниже */
        <div
          className={displayedTariffs.length > 1 ? 'cursor-pointer' : ''}
          style={{
            position: 'absolute',
            width: '70px',
            height: '40px',
            right: '21px',
            top: iconTopPx !== null
              ? `${iconTopPx + (ICON_TO_CARD_GAP_PX - FAVORITES_ICON_TO_CARD_GAP_PX) + (displayedTariffs.length <= 1 ? 2 : 0)}px`
              : displayedTariffs.length <= 1
                ? `calc(var(--header-top, 50px) + 40px + 165px - 40px - ${FAVORITES_ICON_TO_CARD_GAP_PX}px + 2px)`
                : `calc(var(--header-top, 50px) + 40px + 165px - 40px - ${FAVORITES_ICON_TO_CARD_GAP_PX}px)`,
            zIndex: 5,
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (displayedTariffs.length > 1) {
              withClickGuard(() => handleScrollRight())();
            }
          }}
        >
          {/* Белый фон с закруглёнными краями */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#FFFFFF',
              borderRadius: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 10px',
              boxSizing: 'border-box',
            }}
          >
            {/* Красное сердечко слева */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M16.6865 4.25C18.0951 4.25159 19.4463 4.81157 20.4424 5.80762C21.3762 6.74144 21.9267 7.98708 21.9932 9.2998L22 9.56348C21.9995 12.6104 19.7234 15.4496 17.2539 17.6123C14.8105 19.7521 12.3114 21.1131 12.1211 21.2139L12.1182 21.2158C12.0818 21.2353 12.0413 21.2461 12 21.2461C11.9587 21.2461 11.9182 21.2353 11.8818 21.2158L11.8789 21.2148L11.3398 20.9102C10.4423 20.3843 8.57862 19.2171 6.74609 17.6123C4.27656 15.4496 2.00049 12.6104 2 9.56348C2.00159 8.15485 2.56157 6.80367 3.55762 5.80762C4.55353 4.8117 5.90408 4.25174 7.3125 4.25C9.10232 4.25 10.645 5.0173 11.6006 6.29004L12 6.82227L12.3994 6.29004C13.3549 5.01753 14.8971 4.25028 16.6865 4.25Z"
                fill="#FF1000"
              />
            </svg>

            {/* Чёрный круг со стрелкой. На конце карусели повёрнута на 180°, по клику — плавно в начало */}
            <div
              style={{
                width: '16.25px',
                height: '16.25px',
                borderRadius: '100px',
                background: '#101010',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: displayedTariffs.length > 1 ? 1 : 0.4,
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${15 / 20}) ${isArrowAtEnd ? 'rotate(180deg)' : 'rotate(0deg)'}`,
                  transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                <ArrowCircleRightIcon color="#FFFFFF" arrowOnly />
              </div>
            </div>
          </div>
        </div>
      ) : !showFavoritesMode ? (
        /* Обычная стрелка вне режима избранного. На конце карусели повёрнута на 180° и ведёт в начало */
        <div
          className={displayedTariffs.length > 1 ? 'cursor-pointer' : ''}
          style={{
            position: 'absolute',
            width: '40px',
            height: '40px',
            right: '19px',
            top: iconTopPx !== null ? `${iconTopPx}px` : `calc(var(--header-top, 50px) + 40px + 165px - 40px - ${ICON_TO_CARD_GAP_PX}px)`,
            zIndex: 5,
            opacity: displayedTariffs.length > 1 ? 1 : 0.4,
            pointerEvents: displayedTariffs.length > 1 ? 'auto' : 'none',
          }}
          onClick={withClickGuard((e) => {
            e.stopPropagation();
            if (displayedTariffs.length > 1) handleScrollRight();
          })}
          onMouseDown={() => setIsArrowPressed(true)}
          onMouseUp={() => setIsArrowPressed(false)}
          onMouseLeave={() => setIsArrowPressed(false)}
          onTouchStart={() => setIsArrowPressed(true)}
          onTouchEnd={() => setIsArrowPressed(false)}
        >
          {/* Белый внешний круг, чёрный внутренний, белая стрелка вправо */}
          <div
            className="w-full h-full flex items-center justify-center relative overflow-hidden"
            style={{
              position: 'absolute',
              inset: 0,
              background: '#FFFFFF',
              borderRadius: "40px",
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
                  background: 'rgba(16, 16, 16, 0.08)',
                  animation: 'ripple 0.4s ease-out',
                }}
              />
            )}
            {/* Чёрный круг по центру. На конце карусели стрелка плавно повёрнута на 180° */}
            <div
              style={{
                width: '16.25px',
                height: '16.25px',
                borderRadius: '100px',
                background: '#101010',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${15 / 20}) ${isArrowAtEnd ? 'rotate(180deg)' : 'rotate(0deg)'}`,
                  transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                <ArrowCircleRightIcon color="#FFFFFF" arrowOnly />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Кнопка сброса фильтра — слева, на одной линии со стрелкой (10px от карточки) */}
      {isFilterActive && !showFavoritesMode && (
        <div
          className="cursor-pointer"
          style={{
            position: 'absolute',
            width: '40px',
            height: '40px',
            left: '20px',
            top: iconTopPx !== null ? `${iconTopPx}px` : `calc(var(--header-top, 50px) + 40px + 165px - 40px - ${ICON_TO_CARD_GAP_PX}px)`,
            zIndex: 5,
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

      {/* Контейнер карусели: 165px от низа header; карточки прижаты к низу, отступ от низа 20px */}
      <div
        className="carousel-wrapper"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 'calc(var(--header-top, 50px) + 40px + 165px)',
          bottom: `calc(${CARD_TO_BOTTOM_GAP_PX}px + var(--sab, 0px))`,
          zIndex: 1,
          background: '#F5F5F5',
        }}
        onClick={(e) => {
          if (showFavoritesMode && e.target === e.currentTarget) {
            setShowFavoritesMode(false);
          } else {
            e.stopPropagation();
          }
        }}
      >
        {/* Горизонтальный скролл с карточками. Одна карточка — по центру без скролла; пустой список — блок не двигается. */}
        <div
          ref={scrollRef}
          onScroll={onScrollWithEnd}
          className={`flex scrollbar-hide flex-nowrap carousel-container h-full ${displayedTariffs.length > 1 ? 'overflow-x-auto' : 'overflow-x-hidden'} ${displayedTariffs.length === 1 ? 'carousel-container--single-card' : ''}`}
          style={{
            gap: '5px',
            alignItems: 'flex-end',
            scrollSnapType: displayedTariffs.length > 1 ? 'x mandatory' : 'none',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            touchAction: displayedTariffs.length > 1 ? undefined : 'pan-y',
          }}
          onClick={(e) => {
            if (showFavoritesMode && e.target === e.currentTarget) {
              setShowFavoritesMode(false);
            }
          }}
        >
          {tariffsLoading ? (
            <div
              className="flex-shrink-0 carousel-card"
              style={{
                height: 'auto',
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
              className="flex-shrink-0 carousel-card"
              style={{
                height: 'auto',
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
            showFavoritesMode ? (
              /* В режиме избранного — подсказка «Нажмите в открытое пустое место…» (та же высота, что header) */
              <div
                style={{
                  position: 'absolute',
                  top: HINT_TOP,
                  left: '20px',
                  right: '20px',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <ClickOutsideHintContent />
              </div>
            ) : (
              /* Обычный режим — белый блок с сообщением о фильтрах */
              <>
                <div className="carousel-spacer-left" aria-hidden="true" style={{ alignSelf: 'stretch' }} />
                <div
                  className="flex-shrink-0 carousel-card"
                  style={{
                    height: 'auto',
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
                <div className="carousel-spacer-right" aria-hidden="true" style={{ alignSelf: 'stretch' }} />
              </>
            )
          ) : (
            <>
            <div className="carousel-spacer-left" aria-hidden="true" style={{ alignSelf: 'stretch' }} />
            {displayedTariffs.map((tariff, index) => (
              <div
                key={`tariff-${tariff.id}-${tariff.providerId}-${index}`}
                className="flex-shrink-0 carousel-card carousel-card--shadow-top"
                style={{
                  position: 'relative',
                  height: '452px',
                  minHeight: '452px',
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  scrollSnapAlign: 'start',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Заголовок: отступ 15px от краёв карточки */}
                <div style={{ padding: '15px 15px 0 15px', flexShrink: 0 }}>
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
                    <div style={{ flexShrink: 0 }}>
                      <InfoIcon />
                    </div>
                  </div>
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
                  {/* Line 8: разделитель 330px по макету, border 1px solid rgba(16,16,16,0.1) */}
                  <div
                    style={{
                      marginTop: '10px',
                      height: '0',
                      borderTop: '1px solid rgba(16, 16, 16, 0.1)',
                      width: '100%',
                      maxWidth: '330px',
                    }}
                  />
                </div>

                {/* Контент: отступ 15px от краёв карточки; flex:1 — одинаковая высота всех карточек */}
                <div
                  className="features-section"
                  style={{
                    padding: '10px 15px 0 15px',
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'visible',
                  }}
                >
                  {/* Ряды фич с gap 5px только между ними; разделитель — отдельно, 10px от последнего ряда */}
                  <div className="features-container" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {/* Скорость — 16px 155%, подпись 14px 105%, высота строки 40px по макету */}
                    <div className="feature-row" style={{ display: 'flex', alignItems: 'center', minHeight: '40px' }}>
                      <div className="feature-icon" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', alignSelf: 'center' }}>
                        <CheckCircleIcon />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="feature-text">
                          {tariff.speed}
                        </div>
                        <div className="feature-desc">
                          {tariff.speedDesc}
                        </div>
                      </div>
                    </div>

                    {/* Каналы — 16px 155%, 14px 105% */}
                    <div className="feature-row" style={{ display: 'flex', alignItems: 'center', minHeight: '40px' }}>
                      <div className="feature-icon" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', alignSelf: 'center' }}>
                        <CheckCircleIcon />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          className="feature-text"
                          style={{ color: tariff.channels ? '#101010' : 'rgba(16, 16, 16, 0.35)' }}
                        >
                          {tariff.channels || '—'}
                        </div>
                        <div className="feature-desc">
                          {tariff.channelsDesc || ' '}
                        </div>
                      </div>
                    </div>

                    {/* Мобильная связь — 16px 155%, 14px 105% */}
                    <div className="feature-row" style={{ display: 'flex', alignItems: 'center', minHeight: '40px' }}>
                      <div className="feature-icon" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', alignSelf: 'center' }}>
                        <CheckCircleIcon />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          className="feature-text"
                          style={{ color: tariff.mobile ? '#101010' : 'rgba(16, 16, 16, 0.35)' }}
                        >
                          {tariff.mobile || '—'}
                        </div>
                        <div className="feature-desc">
                          {tariff.mobileDesc || ' '}
                        </div>
                      </div>
                    </div>

                    {/* Кинотеатр / доп. приложение — 16px 155%, 14px 105% */}
                    <div className="feature-row" style={{ display: 'flex', alignItems: 'center', minHeight: '40px' }}>
                      <div className="feature-icon" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', alignSelf: 'center' }}>
                        <CheckCircleIcon />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          className="feature-text"
                          style={{ color: tariff.favoriteLabel ? '#101010' : 'rgba(16, 16, 16, 0.35)' }}
                        >
                          {tariff.favoriteLabel || '—'}
                        </div>
                        <div className="feature-desc">
                          {tariff.favoriteDesc || ' '}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Вторая серая линия: 10px от последнего пункта фич (вне контейнера с gap) */}
                  <div
                    style={{
                      marginTop: '10px',
                      height: '0',
                      borderTop: '1px solid rgba(16, 16, 16, 0.1)',
                      width: '100%',
                      maxWidth: '330px',
                    }}
                  />
                </div>

                {/* Футер: 20px от второй серой линии сверху, 15px от краёв карточки */}
                <div style={{ padding: '20px 15px 15px 15px', flexShrink: 0, position: 'relative' }}>
                  {/* Цена: 22px, line-height 115%, 5px до промо по макету */}
                  <div
                    style={{
                      fontFamily: 'TT Firs Neue, sans-serif',
                      fontWeight: 400,
                      fontSize: '22px',
                      lineHeight: '115%',
                      color: '#101010',
                      marginBottom: '5px',
                    }}
                  >
                    {tariff.price}
                  </div>

                  {/* Промо-акция: только если есть текст — без лишнего пустого места */}
                  {tariff.promoText ? (
                    <div
                      style={{
                        position: 'relative',
                        marginBottom: '2px',
                        minHeight: '20px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: 'TT Firs Neue, sans-serif',
                          fontWeight: 400,
                          fontSize: '14px',
                          lineHeight: '145%',
                          color: 'rgba(16, 16, 16, 0.5)',
                        }}
                      >
                        {tariff.promoText}
                      </div>
                      <div
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '16px',
                          height: '16px',
                          background: '#FF1000',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg width="7" height="8" viewBox="0 0 7 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3.75927 0.0684591C3.72341 0.0380912 3.68091 0.0169502 3.63534 0.00681841C3.58978 -0.00331335 3.54249 -0.00213889 3.49746 0.0102428C3.45244 0.0226244 3.411 0.0458503 3.37663 0.0779624C3.34227 0.110074 3.31598 0.150131 3.3 0.194756L2.5 2.43218L1.62145 1.56514C1.59195 1.53599 1.55672 1.51354 1.51808 1.49927C1.47943 1.485 1.43826 1.47924 1.39727 1.48235C1.35629 1.48546 1.31641 1.49739 1.28028 1.51734C1.24414 1.53729 1.21257 1.56482 1.18764 1.5981C0.4 2.64922 0 3.70663 0 4.74072C0 5.60513 0.337142 6.43414 0.937258 7.04538C1.53737 7.65661 2.35131 8 3.2 8C4.04869 8 4.86263 7.65661 5.46274 7.04538C6.06286 6.43414 6.4 5.60513 6.4 4.74072C6.4 2.53885 4.55309 0.740686 3.75927 0.0684591Z" fill="white"/>
                        </svg>
                      </div>
                    </div>
                  ) : null}

                  {/* Подключение от оператора: 14px 145%, 20px до кнопок по макету */}
                  <div
                    style={{
                      fontFamily: 'TT Firs Neue, sans-serif',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '145%',
                      color: 'rgba(16, 16, 16, 0.5)',
                      marginBottom: '20px',
                    }}
                  >
                    {tariff.connectionPrice}
                  </div>

                  {/* Group 7571: 330×50, heart 50×50 left, gap 5px, Подключить flex:1 — Figma 8.75% 78.75% / 22.5% 8.75% */}
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {/* Кнопка избранное (сердечко) — 50×50, border 1px solid rgba(16,16,16,0.1) */}
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
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                            <path
                              d="M16.6865 4.25C18.0951 4.25159 19.4463 4.81157 20.4424 5.80762C21.3762 6.74144 21.9267 7.98708 21.9932 9.2998L22 9.56348C21.9995 12.6104 19.7234 15.4496 17.2539 17.6123C14.8105 19.7521 12.3114 21.1131 12.1211 21.2139L12.1182 21.2158C12.0818 21.2353 12.0413 21.2461 12 21.2461C11.9587 21.2461 11.9182 21.2353 11.8818 21.2158L11.8789 21.2148L11.3398 20.9102C10.4423 20.3843 8.57862 19.2171 6.74609 17.6123C4.27656 15.4496 2.00049 12.6104 2 9.56348C2.00159 8.15485 2.56157 6.80367 3.55762 5.80762C4.55353 4.8117 5.90408 4.25174 7.3125 4.25C9.10232 4.25 10.645 5.0173 11.6006 6.29004L12 6.82227L12.3994 6.29004C13.3549 5.01753 14.8971 4.25028 16.6865 4.25Z"
                              fill="#FF3030"
                            />
                          </svg>
                        )
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                          <path
                            d="M16.6865 4.25C18.0951 4.25159 19.4463 4.81157 20.4424 5.80762C21.3762 6.74144 21.9267 7.98708 21.9932 9.2998L22 9.56348C21.9995 12.6104 19.7234 15.4496 17.2539 17.6123C14.8105 19.7521 12.3114 21.1131 12.1211 21.2139L12.1182 21.2158C12.0818 21.2353 12.0413 21.2461 12 21.2461C11.9587 21.2461 11.9182 21.2353 11.8818 21.2158L11.8789 21.2148L11.3398 20.9102C10.4423 20.3843 8.57862 19.2171 6.74609 17.6123C4.27656 15.4496 2.00049 12.6104 2 9.56348C2.00159 8.15485 2.56157 6.80367 3.55762 5.80762C4.55353 4.8117 5.90408 4.25174 7.3125 4.25C9.10232 4.25 10.645 5.0173 11.6006 6.29004L12 6.82227L12.3994 6.29004C13.3549 5.01753 14.8971 4.25028 16.6865 4.25Z"
                            stroke="#101010"
                          />
                        </svg>
                      )}
                    </button>

                    {/* Кнопка "Подключить" — как во Frame1/Frame4: type="button" для надёжного клика */}
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
                      Подключить
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="carousel-spacer-right" aria-hidden="true" style={{ alignSelf: 'stretch' }} />
            </>
          )}
        </div>
      </div>

      {/* Стили для скрытия скроллбара, анимации ripple и адаптивных размеров текста */}
      <style jsx>{`
        /* Тень только у верхних 80% карточки тарифа */
        .carousel-card--shadow-top::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 80%;
          border-radius: 20px;
          background: #FFFFFF;
          box-shadow: 0 2px 12px rgba(16, 16, 16, 0.08);
          z-index: -1;
          pointer-events: none;
        }
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

        /* Скрытие скроллбара в секции фич */
        .features-section::-webkit-scrollbar {
          display: none;
        }
        .features-section {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Базовые стили для текста фич */
        .feature-text {
          font-family: 'TT Firs Neue', sans-serif;
          font-weight: 400;
          font-size: 16px;
          line-height: 155%;
          color: #101010;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .feature-desc {
          font-family: 'TT Firs Neue', sans-serif;
          font-weight: 400;
          font-size: 14px;
          line-height: 105%;
          color: rgba(16, 16, 16, 0.5);
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .features-container {
          gap: 5px;
        }
        .feature-row {
          gap: 9px;
        }
        .feature-icon {
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          align-self: center;
        }

        /* Адаптация для экранов с высотой < 750px */
        @media (max-height: 750px) {
          .feature-text {
            font-size: 15px;
            line-height: 145%;
          }
          .feature-desc {
            font-size: 13px;
            line-height: 100%;
          }
          .features-container {
            gap: 4px !important;
          }
          .features-section {
            padding-top: 8px !important;
          }
        }

        /* Адаптация для экранов с высотой < 700px */
        @media (max-height: 700px) {
          .feature-text {
            font-size: 14px;
            line-height: 135%;
          }
          .feature-desc {
            font-size: 12px;
            line-height: 95%;
            margin-top: 1px;
          }
          .features-container {
            gap: 3px !important;
          }
          .feature-row {
            gap: 7px !important;
          }
          .features-section {
            padding-top: 6px !important;
          }
        }

        /* Адаптация для экранов с высотой < 650px */
        @media (max-height: 650px) {
          .feature-text {
            font-size: 13px;
            line-height: 125%;
          }
          .feature-desc {
            font-size: 11px;
            line-height: 90%;
            margin-top: 0px;
          }
          .features-container {
            gap: 2px !important;
          }
          .feature-row {
            gap: 6px !important;
          }
          .feature-icon {
            width: 14px !important;
            height: 14px !important;
          }
          .features-section {
            padding-top: 4px !important;
          }
        }

        /* Адаптация для очень маленьких экранов < 600px */
        @media (max-height: 600px) {
          .feature-text {
            font-size: 12px;
            line-height: 120%;
          }
          .feature-desc {
            font-size: 10px;
            line-height: 85%;
          }
          .features-container {
            gap: 1px !important;
          }
          .feature-row {
            gap: 5px !important;
          }
          .feature-icon {
            width: 12px !important;
            height: 12px !important;
            margin-top: 1px !important;
          }
          .features-section {
            padding: 2px 15px 0 15px !important;
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
