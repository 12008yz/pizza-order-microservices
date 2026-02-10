'use client';

import { useState, useEffect, useRef } from 'react';
import AnimatedCheck from '../common/AnimatedCheck';
import { useAddress } from '../../contexts/AddressContext';
import { locationsService } from '../../services/locations.service';
import type { AddressSuggestion } from '../../services/api/types';

type AddressStep = 'city' | 'street' | 'house' | 'entrance' | 'floor' | 'apartment';

interface AddressInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  initialStep?: AddressStep;
}

const stepConfig = {
  city: {
    title: 'Название населённого пункта',
    placeholder: 'Название населённого пункта',
  },
  street: {
    title: 'Улица',
    placeholder: 'Улица',
  },
  house: {
    title: 'Номер дома',
    placeholder: 'Номер дома, корпус',
  },
  entrance: {
    title: 'Подъезд',
    placeholder: 'Номер подъезда',
  },
  floor: {
    title: 'Этаж',
    placeholder: 'Номер этажа',
  },
  apartment: {
    title: 'Номер квартиры',
    placeholder: 'Номер квартиры',
  },
};

export default function AddressInputModal({
  isOpen,
  onClose,
  onComplete,
  initialStep = 'city',
}: AddressInputModalProps) {
  const { addressData, updateCity, updateStreet, updateHouseNumber, updateCorpusNumber, updateEntrance, updateFloor, updateApartmentNumber } = useAddress();
  const [currentStep, setCurrentStep] = useState<AddressStep>(initialStep);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0); // Позиция скролла в подсказках
  const [loading, setLoading] = useState(false);
  const [buildingStructure, setBuildingStructure] = useState<{ entrances?: number; floors?: number; apartmentsPerFloor?: number } | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Обработка появления клавиатуры на мобильных устройствах
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const keyboardH = windowHeight - viewportHeight;
        setKeyboardHeight(keyboardH > 0 ? keyboardH : 0);
      }
    };

    // Используем visualViewport API для определения высоты клавиатуры
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }

    // Fallback для устройств без visualViewport
    window.addEventListener('resize', handleResize);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Reset state when modal opens or step changes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(initialStep);
      setQuery('');
      setSuggestions([]);
      setSelectedIndex(null);
      setScrollOffset(0);
      setBuildingStructure(null);
      setKeyboardHeight(0);
      // Задержка для iOS: фокус только в поле ввода, курсор не уходит в кнопки/подсказки
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, initialStep]);


  // При выборе варианта - подставляем в поле ввода
  useEffect(() => {
    if (selectedIndex !== null && suggestions[selectedIndex]) {
      const selected = suggestions[selectedIndex];
      setQuery(selected.formatted || selected.text);
    }
  }, [selectedIndex, suggestions]);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.length < 1) {
      setSuggestions([]);
      return;
    }

    // Не делаем запрос если значение совпадает с выбранным
    if (selectedIndex !== null && suggestions[selectedIndex]) {
      const selected = suggestions[selectedIndex];
      if (query === (selected.formatted || selected.text)) {
        return;
      }
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        let response;

        if (currentStep === 'city') {
          response = await locationsService.autocomplete({
            q: query,
            limit: 10,
          });

          let citySuggestions: any[] = [];
          if (response?.success && response.data) {
            citySuggestions = response.data.map((item: any) => ({
              id: item.cityId,
              text: item.text || item.formatted,
              formatted: item.formatted,
              cityId: item.cityId,
              regionId: item.regionId,
              region: item.region,
            }));
          }

          // Добавляем опцию "Нет в списке моего адреса" в конец списка
          const notInListOption = {
            id: 'not-in-list-city',
            text: 'Нет в списке моего адреса',
            formatted: 'Нет в списке моего адреса',
            isNotInList: true,
          };
          setSuggestions([...citySuggestions, notInListOption]);
          setScrollOffset(0);
        } else if (currentStep === 'street') {
          let cityIdToUse = addressData.cityId;

          // Если cityId нет, но есть название города, пытаемся найти cityId
          if (!cityIdToUse && addressData.city) {
            try {
              const citySearchResponse = await locationsService.autocomplete({
                q: addressData.city,
                limit: 1,
              });

              if (citySearchResponse?.success && citySearchResponse.data && citySearchResponse.data.length > 0) {
                cityIdToUse = citySearchResponse.data[0].cityId;
              }
            } catch (error) {
              console.warn('Failed to find cityId by city name:', error);
            }
          }

          // Делаем запрос улиц, если есть cityId или хотя бы название города
          if (cityIdToUse || addressData.city) {
            response = await locationsService.autocomplete({
              q: query,
              ...(cityIdToUse && { cityId: cityIdToUse }),
              limit: 10,
            });
          }

          let streetSuggestions: any[] = [];
          if (response?.success && response.data) {
            streetSuggestions = response.data.map((item: any) => ({
              id: item.streetId,
              text: item.text || item.formatted,
              formatted: item.formatted,
              streetId: item.streetId,
            }));
          }

          // Добавляем опцию "Нет в списке моего адреса" в конец списка
          const notInListOption = {
            id: 'not-in-list-street',
            text: 'Нет в списке моего адреса',
            formatted: 'Нет в списке моего адреса',
            isNotInList: true,
          };
          setSuggestions([...streetSuggestions, notInListOption]);
          setScrollOffset(0);
        } else if (currentStep === 'house') {
          // Проверяем, содержит ли запрос пробел (формат "1 2" для дома и корпуса)
          const queryParts = query.trim().split(/\s+/);
          const hasCorpus = queryParts.length >= 2;
          const searchQuery = hasCorpus ? queryParts[0] : query;

          let dbSuggestions: any[] = [];

          // Определяем streetId для загрузки домов
          let streetIdToUse = addressData.streetId;

          // Если streetId не установлен, но есть название улицы, пытаемся найти streetId
          if (!streetIdToUse && addressData.street) {
            try {
              const streetSearchQuery = addressData.street.trim();
              let cityIdToUse = addressData.cityId;
              if (!cityIdToUse && addressData.city) {
                try {
                  const citySearchResponse = await locationsService.autocomplete({
                    q: addressData.city,
                    limit: 1,
                  });
                  if (citySearchResponse?.success && citySearchResponse.data && citySearchResponse.data.length > 0) {
                    cityIdToUse = citySearchResponse.data[0].cityId;
                  }
                } catch (error) {
                  console.warn('Failed to find cityId:', error);
                }
              }

              const streetSearchResponse = await locationsService.autocomplete({
                q: streetSearchQuery,
                ...(cityIdToUse && { cityId: cityIdToUse }),
                limit: 10,
              });

              if (streetSearchResponse?.success && streetSearchResponse.data && streetSearchResponse.data.length > 0) {
                const exactMatch = streetSearchResponse.data.find((item: any) =>
                  item.text?.toLowerCase().trim() === streetSearchQuery.toLowerCase() ||
                  item.formatted?.toLowerCase().trim() === streetSearchQuery.toLowerCase()
                );
                streetIdToUse = exactMatch?.streetId || streetSearchResponse.data[0].streetId;
              }
            } catch (error) {
              console.warn('Failed to find streetId by street name:', error);
            }
          }

          if (streetIdToUse) {
            const buildingsResponse = await locationsService.getBuildings({
              streetId: streetIdToUse,
              limit: 50,
            });

            if (buildingsResponse?.success && buildingsResponse.data) {
              const filteredBuildings = searchQuery.trim() === ''
                ? buildingsResponse.data
                : buildingsResponse.data.filter((building: any) => {
                  const buildingNum = (building.number?.toString() || '').toLowerCase();
                  const corpusPart = (building.building?.toString() || '').toLowerCase();
                  const queryLower = searchQuery.toLowerCase().trim();
                  if (queryLower.length === 1 && /^\d$/.test(queryLower)) {
                    return buildingNum.startsWith(queryLower) || corpusPart.startsWith(queryLower);
                  }
                  return buildingNum.includes(queryLower) || corpusPart.includes(queryLower);
                });

              // Подсказки: "д.9" или "д.9 к6" (корпус из building.building)
              dbSuggestions = filteredBuildings.map((building: any) => {
                const num = building.number?.toString() || '';
                const corpus = building.building?.toString()?.trim();
                const text = corpus ? `д. ${num} к ${corpus}` : `д. ${num}`;
                return {
                  id: building.id,
                  text,
                  formatted: text,
                  buildingId: building.id,
                  houseNumber: num,
                  corpusNumber: corpus,
                  entrances: building.entrances,
                  floors: building.floors,
                  apartmentsPerFloor: building.apartmentsPerFloor,
                };
              });
            }
          }

          const notInListOption = {
            id: 'not-in-list-house',
            text: 'Нет в списке моего адреса',
            formatted: 'Нет в списке моего адреса',
            isNotInList: true,
          };

          if (hasCorpus && queryParts.length >= 2) {
            const houseNum = queryParts[0].trim();
            const corpusNum = queryParts[1].trim();
            const combinedSuggestion = {
              id: `manual-${houseNum}-${corpusNum}`,
              text: `д. ${houseNum} к ${corpusNum}`,
              formatted: `д. ${houseNum} к ${corpusNum}`,
              buildingId: undefined,
              isManual: true,
            };
            setSuggestions([combinedSuggestion, ...dbSuggestions, notInListOption]);
          } else {
            setSuggestions([...dbSuggestions, notInListOption]);
          }
          setScrollOffset(0);
        } else if (currentStep === 'entrance') {
          // Генерируем список подъездов на основе структуры дома
          if (buildingStructure?.entrances) {
            const entrances = Array.from({ length: buildingStructure.entrances }, (_, i) => i + 1);
            setSuggestions(entrances.map((ent) => ({
              id: ent,
              text: `Подъезд ${ent}`,
              formatted: `Подъезд ${ent}`,
              entrance: ent,
            })));
          } else {
            setSuggestions([]);
          }
        } else if (currentStep === 'floor') {
          // Генерируем список этажей на основе структуры дома
          if (buildingStructure?.floors) {
            const floors = Array.from({ length: buildingStructure.floors }, (_, i) => i + 1);
            setSuggestions(floors.map((fl) => ({
              id: fl,
              text: `${fl} этаж`,
              formatted: `${fl} этаж`,
              floor: fl,
            })));
          } else {
            setSuggestions([]);
          }
        } else if (currentStep === 'apartment') {
          let dbSuggestions: any[] = [];

          if (addressData.buildingId) {
            const apartmentsResponse = await locationsService.getApartments({
              buildingId: addressData.buildingId,
              entrance: addressData.entrance,
              floor: addressData.floor,
              limit: 100,
            });

            if (apartmentsResponse?.success && apartmentsResponse.data) {
              // Если запрос пустой, показываем все квартиры, иначе фильтруем
              const filtered = query.trim() === ''
                ? apartmentsResponse.data
                : apartmentsResponse.data.filter((apartment: any) =>
                  apartment.number?.toString().toLowerCase().includes(query.toLowerCase())
                );
              dbSuggestions = filtered.map((apartment: any) => ({
                id: apartment.id || apartment.number,
                text: `кв. ${apartment.number}`,
                formatted: `кв. ${apartment.number}`,
                apartmentId: apartment.id,
                apartmentNumber: apartment.number,
              }));
            }
          }

          const notInListOption = {
            id: 'not-in-list-apartment',
            text: 'Нет в списке моего адреса',
            formatted: 'Нет в списке моего адреса',
            isNotInList: true,
          };

          // Если введен номер квартиры (например, "5"), создаем подсказку "кв. 5"
          // даже если данных нет в БД
          if (query.trim() && /^\d+$/.test(query.trim())) {
            const apartmentNum = query.trim();
            const manualSuggestion = {
              id: `manual-apt-${apartmentNum}`,
              text: `кв. ${apartmentNum}`,
              formatted: `кв. ${apartmentNum}`,
              apartmentId: undefined,
              apartmentNumber: apartmentNum,
              isManual: true,
            };
            setSuggestions([manualSuggestion, ...dbSuggestions, notInListOption]);
          } else {
            setSuggestions([...dbSuggestions, notInListOption]);
          }
        }
        setSelectedIndex(null);
        setScrollOffset(0);
      } catch (error) {
        console.error('Autocomplete error:', error);
        // При ошибке API просто очищаем подсказки - пользователь может ввести данные вручную
        setSuggestions([]);
        setSelectedIndex(null);
        setScrollOffset(0);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, currentStep, addressData.cityId, addressData.city, addressData.streetId, addressData.buildingId, addressData.entrance, addressData.floor]);

  const refocusInput = () => {
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSelect = (realIndex: number) => {
    if (realIndex < suggestions.length) {
      // iOS: сбрасываем выделение, чтобы оно не оставалось на экране после выбора подсказки
      if (typeof window !== 'undefined' && window.getSelection) {
        window.getSelection()?.removeAllRanges();
      }
      setSelectedIndex(realIndex);
      refocusInput();
    }
  };

  const handleScrollUp = () => {
    if (suggestions.length === 0) return;

    // Если ничего не выбрано, выбираем последнюю подсказку
    if (selectedIndex === null) {
      setSelectedIndex(suggestions.length - 1);
      // Если последняя подсказка не видна, скроллим к ней
      const lastIndex = suggestions.length - 1;
      const maxVisible = 3;
      if (lastIndex >= scrollOffset + maxVisible) {
        setScrollOffset(Math.max(0, lastIndex - maxVisible + 1));
      }
      refocusInput();
      return;
    }

    // Переходим к предыдущей подсказке
    const newIndex = Math.max(0, selectedIndex - 1);
    setSelectedIndex(newIndex);

    // Если новая выбранная подсказка не видна, скроллим к ней
    const maxVisible = 3;
    if (newIndex < scrollOffset) {
      setScrollOffset(newIndex);
    }
    refocusInput();
  };

  const handleScrollDown = () => {
    if (suggestions.length === 0) return;

    // Если ничего не выбрано, выбираем первую подсказку
    if (selectedIndex === null) {
      setSelectedIndex(0);
      setScrollOffset(0);
      refocusInput();
      return;
    }

    // Переходим к следующей подсказке
    const newIndex = Math.min(suggestions.length - 1, selectedIndex + 1);
    setSelectedIndex(newIndex);

    // Если новая выбранная подсказка не видна, скроллим к ней
    const maxVisible = 3;
    if (newIndex >= scrollOffset + maxVisible) {
      setScrollOffset(newIndex - maxVisible + 1);
    }
    refocusInput();
  };

  const handleNext = () => {
    if (selectedIndex === null && !query.trim()) return;

    const selected = selectedIndex !== null ? suggestions[selectedIndex] : null;
    const isNotInList = !!selected?.isNotInList;
    // Если выбрана опция "Нет в списке моего адреса", используем ровно то, что ввёл пользователь
    const value = isNotInList ? query.trim() : (selected?.formatted || selected?.text || query.trim());

    if (currentStep === 'city') {
      // Для "нет в списке" пишем только строку, без cityId/regionId
      updateCity(isNotInList ? undefined : (selected?.cityId || undefined), value, isNotInList ? undefined : selected?.regionId);
      // Всегда завершаем шаг, в т.ч. для "нет в списке"
      onComplete();
    } else if (currentStep === 'street') {
      // Для "нет в списке" пишем только строку, без streetId
      updateStreet(isNotInList ? undefined : (selected?.streetId || undefined), value);
      // Всегда завершаем шаг
      onComplete();
    } else if (currentStep === 'house') {
      // Парсим дом и корпус (форматы: "д.9 к6", "д. 5 корп. 2", "5 2", "5, 2")
      const parseHouseAndCorpus = (inputValue: string): { houseNum: string; corpusNum?: string } => {
        const formatK = inputValue.match(/д\.\s*([^\s]+)\s+к\s*([^\s]+)/i) || inputValue.match(/д\.([^\s]+)\s+к([^\s]+)/i);
        if (formatK) {
          return { houseNum: formatK[1].trim(), corpusNum: formatK[2].trim() };
        }
        const formatCorpus = inputValue.match(/д\.\s*([^\s]+(?:\s+[^\s]+)?)\s+корп\.?\s*([^\s]+)/i);
        if (formatCorpus) {
          return { houseNum: formatCorpus[1].trim(), corpusNum: formatCorpus[2].trim() };
        }
        if (inputValue.includes(',')) {
          const parts = inputValue.split(',').map(p => p.trim());
          const cleanHouse = parts[0].replace(/^(д\.?|дом)\s*/i, '').trim();
          const cleanCorpus = parts[1]?.replace(/^(к|корп\.?|корпус)\s*/i, '').trim();
          return { houseNum: cleanHouse, corpusNum: cleanCorpus || undefined };
        }
        const spaceParts = inputValue.trim().split(/\s+/);
        if (spaceParts.length >= 2) {
          const first = spaceParts[0].replace(/^(д\.?|дом)\s*/i, '').trim();
          const second = spaceParts[1].replace(/^(к|корп\.?|корпус)\s*/i, '').trim();
          if (first.length <= 10 && second.length <= 10) {
            return { houseNum: first, corpusNum: second };
          }
        }
        return { houseNum: inputValue.replace(/^(д\.?|дом)\s*/i, '').trim() };
      };

      if (isNotInList) {
        const { houseNum, corpusNum } = parseHouseAndCorpus(query.trim());
        updateHouseNumber(undefined, houseNum, undefined);
        updateCorpusNumber(corpusNum);
        onComplete();
        return;
      }

      // Выбрана подсказка из БД (дом или дом + корпус)
      const buildingId = selected?.buildingId || undefined;
      const houseNumberFromSuggestion = (selected as any)?.houseNumber;
      const corpusFromSuggestion = (selected as any)?.corpusNumber;

      let houseNum: string;
      let corpusNum: string | undefined;

      if (houseNumberFromSuggestion !== undefined || (buildingId && value)) {
        houseNum = houseNumberFromSuggestion ?? (value ? parseHouseAndCorpus(value).houseNum : value);
        corpusNum = corpusFromSuggestion ?? (value ? parseHouseAndCorpus(value).corpusNum : undefined);
      } else {
        const parsed = parseHouseAndCorpus(value);
        houseNum = parsed.houseNum;
        corpusNum = parsed.corpusNum;
      }

      updateHouseNumber(buildingId, houseNum, undefined);
      updateCorpusNumber(corpusNum);
      onComplete();
    } else if (currentStep === 'entrance') {
      const entrance = selected?.entrance || (selected as any)?.id || parseInt(query.trim(), 10);
      if (entrance) {
        updateEntrance(entrance);
        // Переходим к выбору этажа
        setCurrentStep('floor');
        setQuery('');
        setSuggestions([]);
        setSelectedIndex(null);
      }
    } else if (currentStep === 'floor') {
      const floor = selected?.floor || (selected as any)?.id || parseInt(query.trim(), 10);
      if (floor) {
        updateFloor(floor);
        // Переходим к выбору квартиры
        setCurrentStep('apartment');
        setQuery('');
        setSuggestions([]);
        setSelectedIndex(null);
      }
    } else if (currentStep === 'apartment') {
      if (isNotInList) {
        // "Нет в списке моего адреса" — берём введённый текст как номер квартиры
        const cleanApartment = value.replace(/^(кв\.?|квартира)\s*/i, '').trim();
        updateApartmentNumber(undefined, cleanApartment || value.trim());
        onComplete();
        return;
      }
      const cleanApartment = value.replace(/^(кв\.?|квартира)\s*/i, '').trim();
      updateApartmentNumber(selected?.apartmentId || undefined, cleanApartment);
      onComplete();
    }
    refocusInput();
  };

  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Если идёт отложенное закрытие — сбрасываем таймер при новом open
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    if (isOpen) {
      // Модалка открывается или переоткрывается
      setShouldRender(true);
      // Старт анимации появления по следующему кадру
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      // iOS: убираем фокус и выделение, чтобы голубая обводка и выделенный текст не оставались на экране
      inputRef.current?.blur();
      if (typeof window !== 'undefined' && window.getSelection) {
        window.getSelection()?.removeAllRanges();
      }
      // Запускаем анимацию закрытия и откладываем полное размонтирование
      setIsAnimating(false);
      closeTimeoutRef.current = setTimeout(() => {
        setShouldRender(false);
        closeTimeoutRef.current = null;
      }, 300);
    }

    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    };
  }, [isOpen, closeTimeoutRef]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Закрываем модалку ТОЛЬКО при клике по полупрозрачному фону
    if (e.target === e.currentTarget) {
      onClose(); // родитель переключит isOpen=false, а анимацию/shouldRender обработает useEffect выше
    }
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Клик по пустому месту внутри "экрана" (а не по внутренним элементам) тоже закрывает модалку
    if (e.target === e.currentTarget) {
      onClose(); // всё остальное делает эффект по isOpen
    }
  };

  if (!shouldRender) return null;

  const canProceed = selectedIndex !== null || query.trim().length > 0;
  const hasSuggestions = suggestions.length > 0;

  return (
    <div
      className="address-input-modal fixed inset-0 z-[10000] flex flex-col items-center overflow-hidden"
      style={{
        background: '#F5F5F5',
        backdropFilter: 'blur(12.5px)',
        opacity: isAnimating ? 1 : 0,
        transition: 'opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        paddingTop: 'var(--sat, 0px)',
        paddingBottom: 'calc(20px + var(--sab, 0px))',
        height: '100dvh',
        boxSizing: 'border-box',
      }}
      onClick={handleBackdropClick}
    >
      {/* Контейнер — header и карточка влезают в экран, прокрутка только внутри карточки */}
      <div
        onClick={handleContainerClick}
        className="relative w-full max-w-[360px] flex flex-col flex-1 min-h-0 overflow-hidden bg-[#F5F5F5]"
        style={{
          transform: isAnimating ? 'translateY(0)' : 'translateY(100px)',
          transition: 'opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxSizing: 'border-box',
        }}
      >
        {/* Шапка: подсказка */}
        <div className="flex-shrink-0" style={{ minHeight: '105px' }}>
          <div
            className="font-normal flex items-center justify-center text-center"
            style={{
              width: '240px',
              margin: '0 auto',
              paddingTop: 'var(--header-zone, 90px)',
              height: '30px',
              fontFamily: 'TT Firs Neue, sans-serif',
              fontSize: '14px',
              lineHeight: '105%',
              color: 'rgba(16, 16, 16, 0.15)',
              letterSpacing: '0.5px',
            }}
          >
            Нажмите в открытое пустое место, чтобы выйти из этого режима
          </div>
        </div>

        {/* Карточка — компактная, прижата вниз, список подсказок прокручивается внутри */}
        <div
          className="flex-shrink-0 flex flex-col rounded-[20px] bg-white overflow-hidden min-h-0"
          style={{
            width: '360px',
            maxWidth: 'min(360px, calc(100vw - 40px))',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: 'auto',
            marginBottom: 0,
            backdropFilter: 'blur(7.5px)',
            maxHeight: 'min(480px, calc(100dvh - 145px))',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-shrink-0 px-[15px] pt-[15px]">
            <div
              className="font-normal"
              style={{
                fontFamily: 'TT Firs Neue, sans-serif',
                fontSize: '20px',
                lineHeight: '125%',
                color: '#101010',
              }}
            >
              Проверка тех. доступа
            </div>
            <div
              className="font-normal pt-[10px]"
              style={{
                fontFamily: 'TT Firs Neue, sans-serif',
                fontSize: '14px',
                lineHeight: '105%',
                color: 'rgba(16, 16, 16, 0.25)',
              }}
            >
              Мы подготовили доступные тарифные планы. Пожалуйста, проверьте правильность
            </div>
          </div>

          {/* Список подсказок — прокручиваемая область, отступ 5px до поля ввода */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-[15px] pt-[15px]" style={{ WebkitOverflowScrolling: 'touch' }}>
            {hasSuggestions && (
              <div
                className="rounded-[10px] border border-[rgba(16,16,16,0.25)] overflow-hidden mb-[5px]"
                style={{ minHeight: '40px' }}
              >
                {suggestions.map((suggestion, index) => {
                  const isSelected = selectedIndex === index;
                  return (
                    <div
                      key={suggestion.id ?? index}
                      role="option"
                      tabIndex={-1}
                      onClick={() => handleSelect(index)}
                      onFocus={() => inputRef.current?.focus()}
                      className="flex items-center justify-between px-[15px] cursor-pointer w-full select-none"
                      style={{
                        boxSizing: 'border-box',
                        minHeight: suggestions.length === 1 ? 50 : 40,
                        transition: 'background-color 0.2s ease',
                        backgroundColor: 'transparent',
                        WebkitUserSelect: 'none',
                        userSelect: 'none',
                        WebkitTapHighlightColor: 'transparent',
                        caretColor: 'transparent',
                      }}
                    >
                      <span
                        className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap select-none flex items-center"
                        style={{
                          fontFamily: 'TT Firs Neue, sans-serif',
                          fontStyle: 'normal',
                          fontWeight: 400,
                          fontSize: '16px',
                          lineHeight: '125%',
                          color: isSelected ? '#101010' : 'rgba(16, 16, 16, 0.5)',
                          WebkitUserSelect: 'none',
                          userSelect: 'none',
                          caretColor: 'transparent',
                        }}
                      >
                        {suggestion.formatted || suggestion.text}
                      </span>
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ml-2"
                        style={{
                          boxSizing: 'border-box',
                          background: isSelected ? '#101010' : 'transparent',
                          border: isSelected ? 'none' : '1px solid rgba(16, 16, 16, 0.5)',
                        }}
                      >
                        {isSelected && <AnimatedCheck size={8} color="#FFFFFF" strokeWidth={1.5} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Поле ввода — всегда видно под списком подсказок */}
          <div className="flex-shrink-0 px-[15px] pb-[10px]">
            <input
              ref={inputRef}
              type="text"
              autoComplete="off"
              enterKeyHint="next"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(null);
              }}
              placeholder={stepConfig[currentStep].placeholder}
              onBlur={() => {
                if (typeof window !== 'undefined' && window.getSelection) {
                  window.getSelection()?.removeAllRanges();
                }
              }}
              className="address-input-modal-input w-full rounded-[10px] outline-none px-[15px]"
              style={{
                boxSizing: 'border-box',
                height: '50px',
                border: '1px solid #101010',
                fontFamily: 'TT Firs Neue, sans-serif',
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '125%',
                color: '#101010',
                WebkitTapHighlightColor: 'transparent',
              }}
            />
          </div>

          {/* Кнопки навигации — стрелочки выровнены по центру главной кнопки */}
          <div className="flex-shrink-0 flex items-center gap-[5px] px-[15px] pb-[15px] pt-[10px]">
            <button
              type="button"
              tabIndex={-1}
              onClick={handleScrollUp}
              onPointerDown={(e) => e.currentTarget.blur()}
              onFocus={(e) => { e.currentTarget.blur(); inputRef.current?.focus(); }}
              disabled={!hasSuggestions}
              className="rounded-[10px] flex items-center justify-center flex-shrink-0 w-[50px] h-[50px] border border-[rgba(16,16,16,0.15)] bg-transparent disabled:opacity-25 select-none"
              style={{
                cursor: hasSuggestions ? 'pointer' : 'default',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                caretColor: 'transparent',
              }}
            >
              <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(180deg)' }}>
                <path d="M0.112544 5.34082L5.70367 0.114631C5.7823 0.0412287 5.88888 -5.34251e-07 6 -5.24537e-07C6.11112 -5.14822e-07 6.2177 0.0412287 6.29633 0.114631L11.8875 5.34082C11.9615 5.41513 12.0019 5.5134 11.9999 5.61495C11.998 5.7165 11.954 5.81338 11.8772 5.8852C11.8004 5.95701 11.6967 5.99815 11.5881 5.99994C11.4794 6.00173 11.3743 5.96404 11.2948 5.8948L6 0.946249L0.705204 5.8948C0.625711 5.96404 0.520573 6.00173 0.411936 5.99994C0.3033 5.99815 0.199649 5.95701 0.12282 5.88519C0.04599 5.81338 0.00198176 5.71649 6.48835e-05 5.61495C-0.00185199 5.5134 0.0384722 5.41513 0.112544 5.34082Z" fill="#101010" />
              </svg>
            </button>
            <button
              type="button"
              tabIndex={-1}
              onClick={handleScrollDown}
              onPointerDown={(e) => e.currentTarget.blur()}
              onFocus={(e) => { e.currentTarget.blur(); inputRef.current?.focus(); }}
              disabled={!hasSuggestions}
              className="rounded-[10px] flex items-center justify-center flex-shrink-0 w-[50px] h-[50px] border border-[rgba(16,16,16,0.15)] bg-transparent disabled:opacity-25 select-none"
              style={{
                cursor: hasSuggestions ? 'pointer' : 'default',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                caretColor: 'transparent',
              }}
            >
              <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.112544 5.34082L5.70367 0.114631C5.7823 0.0412287 5.88888 -5.34251e-07 6 -5.24537e-07C6.11112 -5.14822e-07 6.2177 0.0412287 6.29633 0.114631L11.8875 5.34082C11.9615 5.41513 12.0019 5.5134 11.9999 5.61495C11.998 5.7165 11.954 5.81338 11.8772 5.8852C11.8004 5.95701 11.6967 5.99815 11.5881 5.99994C11.4794 6.00173 11.3743 5.96404 11.2948 5.8948L6 0.946249L0.705204 5.8948C0.625711 5.96404 0.520573 6.00173 0.411936 5.99994C0.3033 5.99815 0.199649 5.95701 0.12282 5.88519C0.04599 5.81338 0.00198176 5.71649 6.48835e-05 5.61495C-0.00185199 5.5134 0.0384722 5.41513 0.112544 5.34082Z" fill="#101010" />
              </svg>
            </button>
            <button
              type="button"
              tabIndex={-1}
              onClick={handleNext}
              onPointerDown={(e) => e.currentTarget.blur()}
              onFocus={(e) => { e.currentTarget.blur(); inputRef.current?.focus(); }}
              disabled={!canProceed}
              className="flex-1 rounded-[10px] flex items-center justify-center text-center text-white min-h-[50px] max-h-[50px] disabled:cursor-not-allowed select-none"
              style={{
                boxSizing: 'border-box',
                height: 50,
                minHeight: 50,
                maxHeight: 50,
                background: canProceed ? '#101010' : 'rgba(16, 16, 16, 0.25)',
                border: '1px solid rgba(16, 16, 16, 0.25)',
                fontFamily: 'TT Firs Neue, sans-serif',
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: 1,
                cursor: canProceed ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s ease',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                caretColor: 'transparent',
              }}
            >
              Далее
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
