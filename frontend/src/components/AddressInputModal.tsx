'use client';

import { useState, useEffect, useRef } from 'react';
import { useAddress } from '../contexts/AddressContext';
import { locationsService } from '../services/locations.service';
import type { AddressSuggestion } from '../services/api/types';

type AddressStep = 'city' | 'street' | 'house' | 'apartment';

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
    placeholder: 'Номер дома',
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
  const { addressData, updateCity, updateStreet, updateHouseNumber, updateApartmentNumber } = useAddress();
  const [currentStep, setCurrentStep] = useState<AddressStep>(initialStep);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state when modal opens or step changes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(initialStep);
      setQuery('');
      setSuggestions([]);
      setSelectedIndex(null);
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
          if (addressData.cityId) {
            response = await locationsService.autocomplete({
              q: query,
              cityId: addressData.cityId,
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
          if (addressData.streetId) {
            const buildingsResponse = await locationsService.getBuildings({
              streetId: addressData.streetId,
              limit: 50,
            });

            if (buildingsResponse?.success && buildingsResponse.data) {
              console.log('Buildings response:', buildingsResponse.data);
              // Если запрос пустой, показываем все дома, иначе фильтруем
              const filtered = query.trim() === '' 
                ? buildingsResponse.data 
                : buildingsResponse.data.filter((building: any) =>
                    building.number?.toString().toLowerCase().includes(query.toLowerCase())
                  );
              console.log('Filtered buildings:', filtered);
              setSuggestions(filtered.map((building: any) => {
                const houseNumber = building.number + (building.building ? ` ${building.building}` : '');
                return {
                  id: building.id,
                  text: `д. ${houseNumber}`,
                  formatted: `д. ${houseNumber}`,
                  buildingId: building.id,
                };
              }));
            } else {
              console.log('No buildings response or error:', buildingsResponse);
              // Нет данных в БД - позволяем ввести вручную
              setSuggestions([]);
            }
          } else {
            // Нет streetId - позволяем ввести вручную
            setSuggestions([]);
          }
        } else if (currentStep === 'apartment') {
          if (addressData.buildingId) {
            const apartmentsResponse = await locationsService.getApartments({
              buildingId: addressData.buildingId,
              limit: 100,
            });

            if (apartmentsResponse?.success && apartmentsResponse.data) {
              console.log('Apartments response:', apartmentsResponse.data);
              // Если запрос пустой, показываем все квартиры, иначе фильтруем
              const filtered = query.trim() === ''
                ? apartmentsResponse.data
                : apartmentsResponse.data.filter((apartment: any) =>
                    apartment.number?.toString().toLowerCase().includes(query.toLowerCase())
                  );
              console.log('Filtered apartments:', filtered);
              setSuggestions(filtered.map((apartment: any) => ({
                id: apartment.id,
                text: `кв. ${apartment.number}`,
                formatted: `кв. ${apartment.number}`,
                apartmentId: apartment.id,
              })));
            } else {
              console.log('No apartments response or error:', apartmentsResponse);
              // Нет данных в БД - позволяем ввести вручную
              setSuggestions([]);
            }
          } else {
            // Нет buildingId - позволяем ввести вручную
            setSuggestions([]);
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
  }, [query, currentStep, addressData.cityId, addressData.streetId, addressData.buildingId]);

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
      updateHouseNumber(selected?.buildingId || undefined, value, undefined);
      onComplete();
    } else if (currentStep === 'apartment') {
      updateApartmentNumber(selected?.apartmentId || undefined, value);
      onComplete();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const canProceed = selectedIndex !== null || query.trim().length > 0;
  const hasSuggestions = suggestions.length > 0;
  const visibleSuggestions = suggestions.slice(0, 3);

  // Высота одной подсказки и отступы
  const suggestionHeight = 40;
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

  // Базовая позиция top модалки (ИСХОДНОЕ положение)
  const baseTop = 242;
  // При появлении подсказок модалка расширяется ВВЕРХ (top уменьшается)
  const modalTop = baseTop - extraHeight;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      style={{
        background: '#FFFFFF',
        backdropFilter: 'blur(12.5px)',
      }}
      onClick={handleBackdropClick}
    >
      {/* Контейнер 400x870 */}
      <div
        style={{
          position: 'relative',
          width: '400px',
          height: '870px',
          background: '#FFFFFF',
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
            border: '1px solid rgba(16, 16, 16, 0.15)',
            backdropFilter: 'blur(7.5px)',
            borderRadius: '20px',
            transition: 'top 0.3s ease, height 0.3s ease',
            overflow: 'hidden',
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
                    backgroundColor: selectedIndex === index ? 'rgba(16, 16, 16, 0.05)' : 'transparent',
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
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Поле ввода - ФИКСИРОВАНО от низа модалки (240 - 105 - 50 = 85px) */}
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
              <svg width="12" height="6" viewBox="0 0 12 6" fill="none">
                <path
                  d="M1 5L6 1L11 5"
                  stroke="#101010"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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
              <svg width="12" height="6" viewBox="0 0 12 6" fill="none">
                <path
                  d="M1 1L6 5L11 1"
                  stroke="#101010"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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
