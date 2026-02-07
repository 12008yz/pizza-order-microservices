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
  HeartFilledIcon,
  HeartHeaderFilledIcon,
  HeartHeaderBlackFilledIcon,
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
    // Сохраняем полный тариф в sessionStorage для итоговой карточки (тариф + оборудование)
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

  // Скролл ровно на одну карточку (ширина карточки + зазор 5px)
  const CARD_GAP = 5;
  const handleScrollRight = () => {
    const el = scrollRef.current;
    if (!el) return;
    setArrowClicked(true);
    setTimeout(() => setArrowClicked(false), 400);
    const firstCard = el.firstElementChild;
    const step = firstCard
      ? (firstCard as HTMLElement).offsetWidth + CARD_GAP
      : 390; // fallback: minWidth 385 + gap 5
    el.scrollBy({
      left: step,
      behavior: 'smooth',
    });
  };

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
      {/* 400×viewport: высота по видимой области (100svh), карусель до 20px от браузерной строки */}
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: '400px',
          height: '100%',
          minHeight: 0,
          background: '#F5F5F5',
          boxSizing: 'border-box',
        }}
      >
        {showFavoritesMode ? (
          <div
            className="w-full flex justify-center cursor-pointer"
            style={{ position: 'absolute', left: 0, right: 0, top: '75px', zIndex: 10 }}
            onClick={() => setShowFavoritesMode(false)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setShowFavoritesMode(false)}
            aria-label="Выйти из режима избранного"
          >
            <div
              style={{
                width: '240px',
                fontFamily: 'TT Firs Neue, sans-serif',
                fontSize: '14px',
                lineHeight: '105%',
                textAlign: 'center',
                color: 'rgba(16, 16, 16, 0.15)',
              }}
            >
              Нажмите в открытое пустое место, чтобы выйти из этого режима
            </div>
          </div>
        ) : null}

        {/* Group 7545: absolute 360×40, left 20px, top 75px */}
        {!showFavoritesMode && (
          <div
            style={{
              position: 'absolute',
              width: '360px',
              height: '40px',
              left: '20px',
              top: '75px',
            }}
          >
            {/* Group 7510 — Home: 40×40 at left 0 (viewport 20px) */}
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

            {/* гигапоиск 2: 140×10, left 69px top 90px → in header left 49px top 15px */}
            <div
              style={{
                position: 'absolute',
                width: '140px',
                height: '10px',
                left: '49px',
                top: '15px',
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

            {/* Heart: 40×40 at left 250px viewport = 230px in header */}
            <div
              className="cursor-pointer"
              style={{
                position: 'absolute',
                width: '40px',
                height: '40px',
                left: '230px',
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

            {/* Group 7511 — Funnel: 40×40 at left 295px viewport = 275px in header */}
            <div
              className="cursor-pointer"
              style={{
                position: 'absolute',
                width: '40px',
                height: '40px',
                left: '275px',
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

            {/* Group 7509 — PaperPlane: 40×40 at left 340px viewport = 320px in header */}
            <div
              className="cursor-pointer"
              style={{
                position: 'absolute',
                width: '40px',
                height: '40px',
                left: '320px',
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

      {/* HintTooltip — Figma Group 7585: left 175px top 120px */}
      {hintStep !== 'none' && !showFavoritesMode && (
        <HintTooltip
          text={hintStep === 'consultation' ? 'Консультация, это здесь' : 'Фильтрация, это здесь'}
          position={hintStep}
          onAccept={handleHintAccept}
          onDecline={handleHintDecline}
        />
      )}

      <FavoriteToast
        isVisible={showFavoriteToast}
        onClose={() => setShowFavoriteToast(false)}
      />

      {/* Стрелка переключения тарифа — выше блока с карточкой: выравнивание по верху карточки минус высота кнопки и отступ */}
      {!showFavoritesMode && (
        <div
          className="cursor-pointer"
          style={{
            position: 'absolute',
            width: '40px',
            height: '40px',
            left: '340px',
            top: 230,
            zIndex: 5,
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
          {/* Скрин 2: 1) белый внешний круг, 2) чёрный внутренний, 3) белая стрелка вправо */}
          <div
            className="w-full h-full flex items-center justify-center relative overflow-hidden"
            style={{
              position: 'absolute',
              inset: 0,
              background: '#FFFFFF',
              borderRadius: "40px",
              boxShadow: '0 0 0 1px rgba(16, 16, 16, 0.06)',
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
            {/* Чёрный круг по центру — меньше, чтобы белого фона было больше */}
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
                }}
              >
                <ArrowCircleRightIcon color="#FFFFFF" isAnimating={arrowClicked} arrowOnly />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Кнопка сброса фильтра — слева, на одной линии со стрелкой (выше блока карточки) */}
      {isFilterActive && !showFavoritesMode && (
        <div
          className="cursor-pointer"
          style={{
            position: 'absolute',
            width: '40px',
            height: '40px',
            left: '20px',
            top: 230,
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

      {/* Контейнер карусели: 400px (на мобильных 397px через .carousel-wrapper для подглядывания 7px второй карточки) */}
      <div
        className="carousel-wrapper"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 280,
          bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
          zIndex: 1,
        }}
        onClick={(e) => {
          if (showFavoritesMode && e.target === e.currentTarget) {
            setShowFavoritesMode(false);
          } else {
            e.stopPropagation();
          }
        }}
      >
        {/* Горизонтальный скролл с карточками — 360×445, gap 5px */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide flex-nowrap carousel-container h-full"
          style={{
            gap: '5px',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          onClick={(e) => {
            if (showFavoritesMode && e.target === e.currentTarget) {
              setShowFavoritesMode(false);
            }
          }}
        >
          {tariffsLoading ? (
            <div
              className="flex-shrink-0"
              style={{
                width: '360px',
                minWidth: '360px',
                minHeight: '445px',
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
              className="flex-shrink-0"
              style={{
                width: '360px',
                minWidth: '360px',
                minHeight: '445px',
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
              className="flex-shrink-0"
              style={{
                width: '360px',
                minWidth: '360px',
                minHeight: '445px',
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
            <>
            <div className="carousel-spacer-left" aria-hidden="true" />
            {displayedTariffs.map((tariff, index) => (
              <div
                key={`tariff-${tariff.id}-${tariff.providerId}-${index}`}
                className="flex-shrink-0"
                style={{
                  position: 'relative',
                  width: '360px',
                  minWidth: '360px',
                  height: '100%',
                  minHeight: 0,
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  scrollSnapAlign: 'start',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Group 7572: left 35px top 295 viewport → 15px from card, 15px from card top */}
                <div style={{ padding: '15px 15px 0 15px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '5px' }}>
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
                    <div style={{ width: '16px', height: '16px', flexShrink: 0 }}>
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
                  {/* Line 8: top 75px from card → marginTop 18px (15+20+18≈53+22 line) */}
                  <div
                    style={{
                      marginTop: '18px',
                      height: '1px',
                      background: 'rgba(16, 16, 16, 0.1)',
                      width: '330px',
                    }}
                  />
                </div>

                {/* Контент: left 35px viewport = 15px padding, Group 7574/7573/7499/7575 — gap 5px */}
                <div style={{ padding: '10px 15px 0 15px', flex: 1, minHeight: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {/* Скорость — 16px 155%, подпись 14px 105% */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                      <div style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '2px' }}>
                        <CheckCircleIcon />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: 'TT Firs Neue, sans-serif',
                            fontWeight: 400,
                            fontSize: '16px',
                            lineHeight: '155%',
                            color: '#101010',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
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
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {tariff.speedDesc}
                        </div>
                      </div>
                    </div>

                    {/* Каналы — 16px 155%, 14px 105% */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                      <div style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '2px' }}>
                        <CheckCircleIcon />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: 'TT Firs Neue, sans-serif',
                            fontWeight: 400,
                            fontSize: '16px',
                            lineHeight: '155%',
                            color: tariff.channels ? '#101010' : 'rgba(16, 16, 16, 0.35)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {tariff.channels || '—'}
                        </div>
                        <div
                          style={{
                            fontFamily: 'TT Firs Neue, sans-serif',
                            fontWeight: 400,
                            fontSize: '14px',
                            lineHeight: '105%',
                            color: 'rgba(16, 16, 16, 0.5)',
                            marginTop: '2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {tariff.channelsDesc || ' '}
                        </div>
                      </div>
                    </div>

                    {/* Мобильная связь — 16px 155%, 14px 105% */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                      <div style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '2px' }}>
                        <CheckCircleIcon />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: 'TT Firs Neue, sans-serif',
                            fontWeight: 400,
                            fontSize: '16px',
                            lineHeight: '155%',
                            color: tariff.mobile ? '#101010' : 'rgba(16, 16, 16, 0.35)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {tariff.mobile || '—'}
                        </div>
                        <div
                          style={{
                            fontFamily: 'TT Firs Neue, sans-serif',
                            fontWeight: 400,
                            fontSize: '14px',
                            lineHeight: '105%',
                            color: 'rgba(16, 16, 16, 0.5)',
                            marginTop: '2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {tariff.mobileDesc || ' '}
                        </div>
                      </div>
                    </div>

                    {/* Кинотеатр / доп. приложение — 16px 155%, 14px 105% */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                      <div style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '2px' }}>
                        <CheckCircleIcon />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: 'TT Firs Neue, sans-serif',
                            fontWeight: 400,
                            fontSize: '16px',
                            lineHeight: '155%',
                            color: tariff.favoriteLabel ? '#101010' : 'rgba(16, 16, 16, 0.35)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {tariff.favoriteLabel || '—'}
                        </div>
                        <div
                          style={{
                            fontFamily: 'TT Firs Neue, sans-serif',
                            fontWeight: 400,
                            fontSize: '14px',
                            lineHeight: '105%',
                            color: 'rgba(16, 16, 16, 0.5)',
                            marginTop: '2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {tariff.favoriteDesc || ' '}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Футер с ценой и кнопками — отступы 20px */}
                <div style={{ padding: '0 20px 20px 20px', flexShrink: 0, position: 'relative' }}>
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
                      marginBottom: '4px',
                    }}
                  >
                    {tariff.price}
                  </div>

                  {/* Промо-акция и огонёк на одной линии */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '2px',
                      minHeight: '20px',
                    }}
                  >
                    {tariff.promoText ? (
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
                    ) : (
                      <span />
                    )}
                    {/* Красный огонёк справа, на уровне с промо-текстом */}
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        flexShrink: 0,
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

                  {/* Подключение */}
                  <div
                    style={{
                      fontFamily: 'TT Firs Neue, sans-serif',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '145%',
                      color: 'rgba(16, 16, 16, 0.5)',
                      marginBottom: '15px',
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
            <div className="carousel-spacer-right" aria-hidden="true" />
            </>
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
