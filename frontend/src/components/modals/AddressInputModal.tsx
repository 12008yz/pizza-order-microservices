'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, CaretUp, CaretDown } from '@phosphor-icons/react';
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
    placeholder: 'Номер дома, квартира',
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
  const { addressData, updateCity, updateStreet, updateHouseNumber, updateEntrance, updateFloor, updateApartmentNumber } = useAddress();
  const [currentStep, setCurrentStep] = useState<AddressStep>(initialStep);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [buildingStructure, setBuildingStructure] = useState<{ entrances?: number; floors?: number; apartmentsPerFloor?: number } | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      setBuildingStructure(null);
      setKeyboardHeight(0);
      setTimeout(() => inputRef.current?.focus(), 100);
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

          if (response?.success && response.data) {
            setSuggestions(response.data.map((item: any) => ({
              id: item.cityId,
              text: item.text || item.formatted,
              formatted: item.formatted,
              cityId: item.cityId,
              regionId: item.regionId,
              region: item.region,
            })));
          } else {
            // Нет данных в БД - позволяем ввести вручную
            setSuggestions([]);
          }
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

          if (response?.success && response.data) {
            setSuggestions(response.data.map((item: any) => ({
              id: item.streetId,
              text: item.text || item.formatted,
              formatted: item.formatted,
              streetId: item.streetId,
            })));
          } else {
            // Нет данных в БД - позволяем ввести вручную
            setSuggestions([]);
          }
        } else if (currentStep === 'house') {
          // Проверяем, содержит ли запрос пробел (формат "1 2" для дома и квартиры)
          const queryParts = query.trim().split(/\s+/);
          const hasApartment = queryParts.length >= 2;
          const searchQuery = hasApartment ? queryParts[0] : query;

          let dbSuggestions: any[] = [];
          let apartmentSuggestions: any[] = [];

          // Определяем streetId для загрузки домов
          let streetIdToUse = addressData.streetId;

          // Если streetId не установлен, но есть название улицы, пытаемся найти streetId
          if (!streetIdToUse && addressData.street) {
            try {
              // Ищем улицу через autocomplete
              const streetSearchQuery = addressData.street.trim();

              // Если есть cityId, используем его для более точного поиска
              let cityIdToUse = addressData.cityId;
              if (!cityIdToUse && addressData.city) {
                // Пытаемся найти cityId по названию города
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
                // Ищем точное совпадение или первое подходящее
                const exactMatch = streetSearchResponse.data.find((item: any) =>
                  item.text?.toLowerCase().trim() === streetSearchQuery.toLowerCase() ||
                  item.formatted?.toLowerCase().trim() === streetSearchQuery.toLowerCase()
                );

                streetIdToUse = exactMatch?.streetId || streetSearchResponse.data[0].streetId;
                console.log(`Found streetId: ${streetIdToUse} for street: "${addressData.street}"`, {
                  exactMatch: !!exactMatch,
                  totalResults: streetSearchResponse.data.length,
                  cityId: cityIdToUse
                });
              } else {
                console.warn(`No street found for: "${streetSearchQuery}"`, {
                  hasCityId: !!cityIdToUse,
                  city: addressData.city
                });
              }
            } catch (error) {
              console.warn('Failed to find streetId by street name:', error);
            }
          }

          if (!streetIdToUse) {
            // Если streetId не установлен и не удалось найти, не можем загрузить дома из БД
            console.warn('streetId is not set and cannot be found, cannot load buildings from DB');
          } else {
            const buildingsResponse = await locationsService.getBuildings({
              streetId: streetIdToUse,
              limit: 50,
            });

            if (buildingsResponse?.success && buildingsResponse.data) {
              // Фильтруем дома по номеру
              // Если введена только одна цифра, ищем дома, которые начинаются с этой цифры
              const filteredBuildings = searchQuery.trim() === ''
                ? buildingsResponse.data
                : buildingsResponse.data.filter((building: any) => {
                  const buildingNum = (building.number?.toString() || '').toLowerCase();
                  const queryLower = searchQuery.toLowerCase().trim();
                  // Если запрос - одна цифра, ищем дома, начинающиеся с этой цифры
                  if (queryLower.length === 1 && /^\d$/.test(queryLower)) {
                    return buildingNum.startsWith(queryLower);
                  }
                  // Иначе ищем вхождение
                  return buildingNum.includes(queryLower);
                });

              console.log(`Found ${filteredBuildings.length} buildings for query "${searchQuery}"`);

              // Если введен только номер дома (без квартиры), запрашиваем квартиры для всех найденных домов
              if (!hasApartment && filteredBuildings.length > 0) {
                // Если введена только одна цифра, увеличиваем лимит домов для загрузки квартир
                const buildingsLimit = searchQuery.trim().length === 1 && /^\d$/.test(searchQuery.trim())
                  ? 20  // Для одной цифры загружаем квартиры для большего количества домов
                  : 10; // Для обычного запроса ограничиваем до 10 домов

                // Запрашиваем квартиры для каждого найденного дома
                for (const building of filteredBuildings.slice(0, buildingsLimit)) {
                  try {
                    const apartmentsResponse = await locationsService.getApartments({
                      buildingId: building.id,
                      limit: 100,
                    });

                    if (apartmentsResponse?.success && apartmentsResponse.data) {
                      const houseNumber = building.number + (building.building ? ` ${building.building}` : '');
                      // Формируем подсказки в формате "д. 5 кв. 1" (с точками)
                      const aptSuggestions = apartmentsResponse.data.map((apt: any) => ({
                        id: `building-${building.id}-apt-${apt.number}`,
                        text: `д. ${houseNumber} кв. ${apt.number}`,
                        formatted: `д. ${houseNumber} кв. ${apt.number}`,
                        buildingId: building.id,
                        apartmentId: apt.id,
                        apartmentNumber: apt.number,
                        isApartmentSuggestion: true,
                      }));
                      apartmentSuggestions.push(...aptSuggestions);
                    }
                  } catch (error) {
                    console.warn(`Failed to load apartments for building ${building.id}:`, error);
                  }
                }

                console.log(`Loaded ${apartmentSuggestions.length} apartment suggestions`);
              }

              // Если не нашли квартиры, показываем просто дома
              if (apartmentSuggestions.length === 0) {
                dbSuggestions = filteredBuildings.map((building: any) => {
                  const houseNumber = building.number + (building.building ? ` ${building.building}` : '');
                  return {
                    id: building.id,
                    text: `д. ${houseNumber}`,
                    formatted: `д. ${houseNumber}`,
                    buildingId: building.id,
                    entrances: building.entrances,
                    floors: building.floors,
                    apartmentsPerFloor: building.apartmentsPerFloor,
                  };
                });
              }
            } else {
              console.warn('Failed to load buildings or no buildings found');
            }
          }

          // Если введен формат "1 2", создаем подсказку "д. 1 кв. 2"
          if (hasApartment && queryParts.length >= 2) {
            const houseNum = queryParts[0].trim();
            const apartmentNum = queryParts[1].trim();

            // Создаем подсказку в формате "д. 1 кв. 2" (без запятой, с точкой после "кв")
            const combinedSuggestion = {
              id: `manual-${houseNum}-${apartmentNum}`,
              text: `д. ${houseNum} кв. ${apartmentNum}`,
              formatted: `д. ${houseNum} кв. ${apartmentNum}`,
              buildingId: undefined,
              isManual: true, // Флаг для ручного ввода
            };

            // Добавляем подсказку в начало списка
            setSuggestions([combinedSuggestion, ...apartmentSuggestions, ...dbSuggestions]);
          } else {
            // Показываем подсказки квартир (если есть) или дома
            setSuggestions([...apartmentSuggestions, ...dbSuggestions]);
          }
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

            // Добавляем ручную подсказку в начало списка
            setSuggestions([manualSuggestion, ...dbSuggestions]);
          } else {
            // Показываем только подсказки из БД
            setSuggestions(dbSuggestions);
          }
        }
        setSelectedIndex(null);
      } catch (error) {
        console.error('Autocomplete error:', error);
        // При ошибке API просто очищаем подсказки - пользователь может ввести данные вручную
        setSuggestions([]);
        setSelectedIndex(null);
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

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
  };

  const handleScrollUp = () => {
    if (suggestions.length > 0) {
      if (selectedIndex === null || selectedIndex === 0) {
        setSelectedIndex(suggestions.length - 1);
      } else {
        setSelectedIndex(selectedIndex - 1);
      }
    }
  };

  const handleScrollDown = () => {
    if (suggestions.length > 0) {
      if (selectedIndex === null || selectedIndex === suggestions.length - 1) {
        setSelectedIndex(0);
      } else {
        setSelectedIndex(selectedIndex + 1);
      }
    }
  };

  const handleNext = () => {
    if (selectedIndex === null && !query.trim()) return;

    const selected = selectedIndex !== null ? suggestions[selectedIndex] : null;
    const value = selected?.formatted || selected?.text || query.trim();

    if (currentStep === 'city') {
      updateCity(selected?.cityId || undefined, value, selected?.regionId);
      onComplete();
    } else if (currentStep === 'street') {
      updateStreet(selected?.streetId || undefined, value);
      onComplete();
    } else if (currentStep === 'house') {
      // Если выбрана подсказка с квартирой из БД
      if (selected?.isApartmentSuggestion && selected.buildingId && selected.apartmentNumber) {
        const buildingId = selected.buildingId;
        const apartmentId = selected.apartmentId;
        const apartmentNum = selected.apartmentNumber;

        // Получаем номер дома из подсказки (формат "д. 5 кв. 9")
        const houseMatch = value.match(/д\.\s*([^\s]+(?:\s+[^\s]+)?)\s+кв\./);
        const houseNum = houseMatch ? houseMatch[1].trim() : value.replace(/\s+кв\.\s+\d+.*$/, '').replace(/^д\.\s*/, '').trim();

        updateHouseNumber(buildingId, houseNum, undefined);
        updateApartmentNumber(apartmentId, apartmentNum);
        onComplete();
        return;
      }

      const buildingId = selected?.buildingId || undefined;
      // Парсим ввод: "дом квартира" или "дом, квартира" или просто "дом"
      // Поддерживаем форматы: "д. 5 кв. 9", "д. 5, кв 10", "5, 10", "д. 5, 10", "5, кв 10", "50 2", "д. 50, кв 2"
      const inputValue = value;
      let houseNum = inputValue;
      let apartmentNum: string | undefined = undefined;

      // Проверяем формат "д. 5 кв. 9" (без запятой, с точкой после "кв")
      const formatWithKv = inputValue.match(/д\.\s*([^\s]+(?:\s+[^\s]+)?)\s+кв\.\s*(\d+)/i);
      if (formatWithKv) {
        houseNum = formatWithKv[1].trim();
        apartmentNum = formatWithKv[2].trim();
      } else if (inputValue.includes(',')) {
        // Проверяем формат с запятой: "д. 50, кв 2" или "50, 2"
        const parts = inputValue.split(',').map(p => p.trim());
        // Убираем префиксы "д.", "дом", "кв", "квартира" и оставляем только номер
        const cleanHouse = parts[0].replace(/^(д\.?|дом)\s*/i, '').trim();
        const cleanApartment = parts[1]?.replace(/^(кв\.?|квартира)\s*/i, '').trim();

        houseNum = cleanHouse;
        apartmentNum = cleanApartment || undefined;
      } else {
        // Проверяем формат с пробелом: "50 2" или "д. 50 кв. 2" или "д. 50 кв 2"
        // Проверяем формат "д. X кв. Y" или "д. X кв Y"
        const formatKvDot = inputValue.match(/д\.\s*([^\s]+(?:\s+[^\s]+)?)\s+кв\.?\s*(\d+)/i);
        if (formatKvDot) {
          houseNum = formatKvDot[1].trim();
          apartmentNum = formatKvDot[2].trim();
        } else {
          const spaceParts = inputValue.trim().split(/\s+/);
          if (spaceParts.length >= 2) {
            // Если есть минимум 2 части через пробел, считаем что это дом и квартира
            const firstPart = spaceParts[0].replace(/^(д\.?|дом)\s*/i, '').trim();
            const secondPart = spaceParts[1].replace(/^(кв\.?|квартира)\s*/i, '').trim();

            // Проверяем, что обе части похожи на числа (не слишком длинные и содержат цифры)
            if (firstPart.length <= 10 && secondPart.length <= 10 &&
              /\d/.test(firstPart) && /\d/.test(secondPart)) {
              houseNum = firstPart;
              apartmentNum = secondPart;
            } else {
              // Если не похоже на дом и квартиру, обрабатываем как обычный дом
              houseNum = inputValue.replace(/^(д\.?|дом)\s*/i, '').trim();
            }
          } else {
            // Если нет пробела и запятой, убираем префикс "д." если есть
            houseNum = inputValue.replace(/^(д\.?|дом)\s*/i, '').trim();
          }
        }
      }

      updateHouseNumber(buildingId, houseNum, undefined);

      // Если введена квартира, сохраняем её тоже
      if (apartmentNum) {
        updateApartmentNumber(undefined, apartmentNum);
      }

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
      // Убираем префикс "кв" или "квартира" если есть, оставляем только номер (без точки после "кв")
      const cleanApartment = value.replace(/^(кв\.?|квартира)\s*/i, '').trim();
      updateApartmentNumber(selected?.apartmentId || undefined, cleanApartment);
      onComplete();
    }
  };

  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Анимация появления
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      // Анимация исчезновения
      setIsAnimating(false);
      setTimeout(() => {
        setShouldRender(false);
      }, 300);
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      // Анимация исчезновения
      setIsAnimating(false);
      setTimeout(() => {
        setShouldRender(false);
        onClose();
      }, 300);
    }
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Закрываем модалку при клике на пустое место внутри контейнера
    if (e.target === e.currentTarget) {
      // Анимация исчезновения
      setIsAnimating(false);
      setTimeout(() => {
        setShouldRender(false);
        onClose();
      }, 300);
    }
  };

  if (!shouldRender) return null;

  const canProceed = selectedIndex !== null || query.trim().length > 0;
  const hasSuggestions = suggestions.length > 0;
  const visibleSuggestions = suggestions.slice(0, 3);

  // Высота одной подсказки и отступы
  // Если подсказка только одна, её высота равна высоте поля ввода (50px)
  const suggestionHeight = visibleSuggestions.length === 1 ? 50 : 40;
  const suggestionGap = 0;

  // Высота блока подсказок
  const suggestionsBlockHeight = visibleSuggestions.length > 0
    ? visibleSuggestions.length * suggestionHeight + (visibleSuggestions.length - 1) * suggestionGap
    : 0;

  // Базовая высота модалки (без подсказок)
  const baseHeight = 240;
  // Дополнительная высота для подсказок
  const extraHeight = hasSuggestions ? suggestionsBlockHeight + 5 : 0;
  // Полная высота модалки с подсказками
  const modalHeight = baseHeight + extraHeight;

  // Базовая позиция top модалки - ВНИЗУ экрана (485px от верха в контейнере 870px)
  const baseTop = 485;
  // При появлении подсказок модалка расширяется ВВЕРХ (top уменьшается)
  const modalTop = baseTop - extraHeight - keyboardHeight;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      style={{
        background: '#F5F5F5',
        backdropFilter: 'blur(12.5px)',
        opacity: isAnimating ? 1 : 0,
        transition: 'opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      onClick={handleBackdropClick}
    >
      {/* Контейнер 400x870 */}
      <div
        onClick={handleContainerClick}
        style={{
          position: 'relative',
          width: '400px',
          height: '870px',
          background: '#F5F5F5',
        }}
      >
        {/* Подсказка сверху */}
        <div
          style={{
            position: 'absolute',
            width: '240px',
            height: '30px',
            left: 'calc(50% - 240px/2)',
            top: '75px',
            fontFamily: 'TT Firs Neue, sans-serif',
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '105%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: 'rgba(16, 16, 16, 0.15)',
            opacity: isAnimating ? 1 : 0,
            transform: isAnimating ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          Нажмите в открытое пустое место, чтобы выйти из этого режима
        </div>

        {/* Основной контейнер модалки */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            boxSizing: 'border-box',
            position: 'absolute',
            width: '360px',
            height: `${modalHeight}px`,
            left: '20px',
            top: `${modalTop}px`,
            background: '#FFFFFF',
            backdropFilter: 'blur(7.5px)',
            borderRadius: '20px',
            transition: 'top 0.3s ease, height 0.3s ease, opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            overflow: 'hidden',
            opacity: isAnimating ? 1 : 0,
            transform: isAnimating ? 'translateY(0)' : 'translateY(100px)',
          }}
        >
          {/* Заголовок - фиксирован сверху */}
          <div
            style={{
              position: 'absolute',
              width: '330px',
              left: '15px',
              top: '15px',
              fontFamily: 'TT Firs Neue, sans-serif',
              fontStyle: 'normal',
              fontWeight: 400,
              fontSize: '20px',
              lineHeight: '125%',
              color: '#101010',
            }}
          >
            Проверка тех. доступа
          </div>

          {/* Подзаголовок - фиксирован сверху */}
          <div
            style={{
              position: 'absolute',
              width: '330px',
              left: '15px',
              top: '50px',
              fontFamily: 'TT Firs Neue, sans-serif',
              fontStyle: 'normal',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '105%',
              color: 'rgba(16, 16, 16, 0.25)',
            }}
          >
            Мы подготовили доступные тарифные планы. Пожалуйста, проверьте правильность
          </div>

          {/* Подсказки - появляются между заголовком и полем ввода */}
          {hasSuggestions && (
            <div
              style={{
                position: 'absolute',
                left: '15px',
                bottom: '139px',
                width: '330px',
                boxSizing: 'border-box',
                border: '1px solid rgba(16, 16, 16, 0.25)',
                borderRadius: '10px',
                overflow: 'hidden',
              }}
            >
              {visibleSuggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id || index}
                  onClick={() => handleSelect(index)}
                  style={{
                    boxSizing: 'border-box',
                    width: '100%',
                    height: `${suggestionHeight}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 15px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    backgroundColor: 'transparent',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'TT Firs Neue, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '125%',
                      letterSpacing: '1.2px',
                      color: selectedIndex === index ? '#101010' : 'rgba(16, 16, 16, 0.5)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {suggestion.formatted || suggestion.text}
                  </span>

                  {/* Radio кнопка */}
                  <div
                    style={{
                      boxSizing: 'border-box',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: selectedIndex === index ? '#101010' : 'transparent',
                      border: selectedIndex === index
                        ? 'none'
                        : '1px solid rgba(16, 16, 16, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {selectedIndex === index && (
                      <Check size={10} weight="bold" color="white" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Поле ввода - ФИКСИРОВАНО от низа модалки */}
          <div
            style={{
              position: 'absolute',
              left: '15px',
              bottom: '85px',
              width: '330px',
              height: '50px',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(null);
              }}
              placeholder={stepConfig[currentStep].placeholder}
              style={{
                boxSizing: 'border-box',
                width: '330px',
                height: '50px',
                border: '1px solid #101010',
                borderRadius: '10px',
                padding: '0 15px',
                fontFamily: 'TT Firs Neue, sans-serif',
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '125%',
                color: '#101010',
                outline: 'none',
              }}
            />
          </div>

          {/* Кнопки навигации - ФИКСИРОВАНЫ от низа модалки */}
          <div
            style={{
              position: 'absolute',
              width: '330px',
              height: '50px',
              left: '15px',
              bottom: '15px',
              display: 'flex',
              gap: '5px',
            }}
          >
            {/* Кнопка "Вверх" */}
            <button
              onClick={handleScrollUp}
              disabled={!hasSuggestions}
              style={{
                boxSizing: 'border-box',
                width: '50px',
                height: '50px',
                border: '1px solid rgba(16, 16, 16, 0.15)',
                borderRadius: '10px',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: hasSuggestions ? 'pointer' : 'default',
                opacity: 0.25,
              }}
            >
              <CaretUp size={12} weight="regular" color="#101010" />
            </button>

            {/* Кнопка "Вниз" */}
            <button
              onClick={handleScrollDown}
              disabled={!hasSuggestions}
              style={{
                boxSizing: 'border-box',
                width: '50px',
                height: '50px',
                border: '1px solid rgba(16, 16, 16, 0.15)',
                borderRadius: '10px',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: hasSuggestions ? 'pointer' : 'default',
                opacity: 0.25,
              }}
            >
              <CaretDown size={12} weight="regular" color="#101010" />
            </button>

            {/* Кнопка "Далее" */}
            <button
              onClick={handleNext}
              disabled={!canProceed}
              style={{
                boxSizing: 'border-box',
                flex: 1,
                height: '50px',
                background: canProceed ? '#101010' : 'rgba(16, 16, 16, 0.25)',
                border: '1px solid rgba(16, 16, 16, 0.25)',
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
                cursor: canProceed ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s ease',
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
