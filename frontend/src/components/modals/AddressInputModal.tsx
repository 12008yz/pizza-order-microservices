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
          // Проверяем, содержит ли запрос пробел (формат "1 2" для дома и квартиры)
          const queryParts = query.trim().split(/\s+/);
          const hasApartment = queryParts.length >= 2;
          const searchQuery = hasApartment ? queryParts[0] : query;

          let dbSuggestions: any[] = [];
          const apartmentSuggestions: any[] = [];

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

            // Добавляем опцию "Нет в списке моего адреса" в конец списка
            const notInListOption = {
              id: 'not-in-list-house',
              text: 'Нет в списке моего адреса',
              formatted: 'Нет в списке моего адреса',
              isNotInList: true,
            };
            setSuggestions([combinedSuggestion, ...apartmentSuggestions, ...dbSuggestions, notInListOption]);
            setScrollOffset(0);
          } else {
            // Добавляем опцию "Нет в списке моего адреса" в конец списка
            const notInListOption = {
              id: 'not-in-list-house',
              text: 'Нет в списке моего адреса',
              formatted: 'Нет в списке моего адреса',
              isNotInList: true,
            };
            // Показываем подсказки квартир (если есть) или дома, затем опцию "Нет в списке"
            setSuggestions([...apartmentSuggestions, ...dbSuggestions, notInListOption]);
            setScrollOffset(0);
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

  const handleSelect = (realIndex: number) => {
    if (realIndex < suggestions.length) {
      setSelectedIndex(realIndex);
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
  };

  const handleScrollDown = () => {
    if (suggestions.length === 0) return;

    // Если ничего не выбрано, выбираем первую подсказку
    if (selectedIndex === null) {
      setSelectedIndex(0);
      setScrollOffset(0);
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
      // Если выбрана опция "Нет в списке моего адреса", используем введённый текст
      if (isNotInList) {
        const inputValue = query.trim();
        let houseNum = inputValue;
        let apartmentNum: string | undefined = undefined;

        // Парсим ввод для определения дома и квартиры
        const formatWithKv = inputValue.match(/д\.\s*([^\s]+(?:\s+[^\s]+)?)\s+кв\.\s*(\d+)/i);
        if (formatWithKv) {
          houseNum = formatWithKv[1].trim();
          apartmentNum = formatWithKv[2].trim();
        } else if (inputValue.includes(',')) {
          const parts = inputValue.split(',').map(p => p.trim());
          const cleanHouse = parts[0].replace(/^(д\.?|дом)\s*/i, '').trim();
          const cleanApartment = parts[1]?.replace(/^(кв\.?|квартира)\s*/i, '').trim();
          houseNum = cleanHouse;
          apartmentNum = cleanApartment || undefined;
        } else {
          const spaceParts = inputValue.trim().split(/\s+/);
          if (spaceParts.length >= 2) {
            const firstPart = spaceParts[0].replace(/^(д\.?|дом)\s*/i, '').trim();
            const secondPart = spaceParts[1].replace(/^(кв\.?|квартира)\s*/i, '').trim();
            if (firstPart.length <= 10 && secondPart.length <= 10 &&
              /\d/.test(firstPart) && /\d/.test(secondPart)) {
              houseNum = firstPart;
              apartmentNum = secondPart;
            } else {
              houseNum = inputValue.replace(/^(д\.?|дом)\s*/i, '').trim();
            }
          } else {
            houseNum = inputValue.replace(/^(д\.?|дом)\s*/i, '').trim();
          }
        }

        updateHouseNumber(undefined, houseNum, undefined);
        if (apartmentNum) {
          updateApartmentNumber(undefined, apartmentNum);
        }
        // Завершаем шаг, модалка закрывается
        onComplete();
        return;
      }

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
      className="fixed inset-0 z-[10000] flex flex-col items-center overflow-hidden"
      style={{
        background: '#F5F5F5',
        backdropFilter: 'blur(12.5px)',
        opacity: isAnimating ? 1 : 0,
        transition: 'opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        paddingTop: 'var(--sat, 0px)',
        paddingBottom: 'var(--sab, 0px)',
        height: '100dvh',
        boxSizing: 'border-box',
      }}
      onClick={handleBackdropClick}
    >
      {/* Контейнер — header и карточка влезают в экран, карточка прижата вниз */}
      <div
        onClick={handleContainerClick}
        className="relative w-full max-w-[400px] flex flex-col h-full overflow-hidden bg-[#F5F5F5]"
        style={{
          transform: isAnimating ? 'translateY(0)' : 'translateY(100px)',
          transition: 'opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxSizing: 'border-box',
        }}
      >
        {/* Шапка: подсказка — клик по пустому месту закрывает модалку */}
        <div
          className="flex-shrink-0 cursor-pointer"
          style={{ minHeight: '105px' }}
          onClick={() => onClose()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onClose()}
          aria-label="Закрыть"
        >
          <div
            className="font-normal flex items-center justify-center text-center"
            style={{
              width: '240px',
              margin: '0 auto',
              paddingTop: '75px',
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

        {/* Карточка — компактная, прижата вниз с отступом 20px */}
        <div
          className="flex flex-col rounded-[20px] bg-white mx-[5%]"
          style={{
            maxWidth: '360px',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: 'auto',
            marginBottom: '20px',
            backdropFilter: 'blur(7.5px)',
            maxHeight: 'calc(100dvh - 145px)',
            overflow: 'hidden',
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

          {/* Список подсказок */}
          <div className="overflow-y-auto overflow-x-hidden px-[15px] pt-[15px]" style={{ WebkitOverflowScrolling: 'touch', maxHeight: '200px' }}>
            {hasSuggestions && (
              <div
                className="rounded-[10px] border border-[rgba(16,16,16,0.25)] overflow-hidden mb-[10px]"
                style={{ minHeight: '40px' }}
              >
                {suggestions.map((suggestion, index) => {
                  const isSelected = selectedIndex === index;
                  return (
                    <div
                      key={suggestion.id ?? index}
                      onClick={() => handleSelect(index)}
                      className="flex items-center justify-between px-[15px] cursor-pointer w-full"
                      style={{
                        boxSizing: 'border-box',
                        minHeight: suggestions.length === 1 ? 50 : 40,
                        transition: 'background-color 0.2s ease',
                        backgroundColor: 'transparent',
                      }}
                    >
                      <span
                        className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
                        style={{
                          fontFamily: 'TT Firs Neue, sans-serif',
                          fontWeight: 400,
                          fontSize: '14px',
                          lineHeight: '125%',
                          letterSpacing: '1.2px',
                          color: isSelected ? '#101010' : 'rgba(16, 16, 16, 0.5)',
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
                        {isSelected && <Check size={10} weight="bold" color="white" />}
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
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(null);
              }}
              placeholder={stepConfig[currentStep].placeholder}
              className="w-full rounded-[10px] outline-none px-[15px]"
              style={{
                boxSizing: 'border-box',
                height: '50px',
                border: '1px solid #101010',
                fontFamily: 'TT Firs Neue, sans-serif',
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '125%',
                color: '#101010',
              }}
            />
          </div>

          {/* Кнопки навигации */}
          <div className="flex-shrink-0 flex gap-[5px] px-[15px] pb-[15px] pt-[10px]">
            <button
              onClick={handleScrollUp}
              disabled={!hasSuggestions}
              className="rounded-[10px] flex items-center justify-center flex-shrink-0 w-[50px] h-[50px] border border-[rgba(16,16,16,0.15)] bg-transparent disabled:opacity-25"
              style={{ cursor: hasSuggestions ? 'pointer' : 'default' }}
            >
              <CaretUp size={12} weight="regular" color="#101010" />
            </button>
            <button
              onClick={handleScrollDown}
              disabled={!hasSuggestions}
              className="rounded-[10px] flex items-center justify-center flex-shrink-0 w-[50px] h-[50px] border border-[rgba(16,16,16,0.15)] bg-transparent disabled:opacity-25"
              style={{ cursor: hasSuggestions ? 'pointer' : 'default' }}
            >
              <CaretDown size={12} weight="regular" color="#101010" />
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex-1 rounded-[10px] flex items-center justify-center text-center text-white min-h-[50px] disabled:cursor-not-allowed"
              style={{
                boxSizing: 'border-box',
                background: canProceed ? '#101010' : 'rgba(16, 16, 16, 0.25)',
                border: '1px solid rgba(16, 16, 16, 0.25)',
                fontFamily: 'TT Firs Neue, sans-serif',
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '315%',
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
