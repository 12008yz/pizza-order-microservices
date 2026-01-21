'use client';

import { useState, useEffect, useRef } from 'react';
import { useAddress } from '../contexts/AddressContext';
import { locationsService } from '../services/locations.service';
import { CaretLeft, CaretUp, CaretDown } from '@phosphor-icons/react';

type AddressStep = 'city' | 'street' | 'house';

interface AddressSuggestion {
  id?: number;
  text: string;
  formatted?: string;
  cityId?: number;
  streetId?: number;
  buildingId?: number;
  regionId?: number;
  region?: string;
}

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
};

export default function AddressInputModal({
  isOpen,
  onClose,
  onComplete,
  initialStep = 'city',
}: AddressInputModalProps) {
  const { addressData, updateCity, updateStreet, updateHouseNumber } = useAddress();
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
            const mockCities = [
              { id: 1, text: `гор. ${query}, Московская обл.`, formatted: `гор. ${query}, Московская обл.`, cityId: 1, regionId: 1 },
              { id: 2, text: `д. ${query}, Псковская обл.`, formatted: `д. ${query}, Псковская обл.`, cityId: 2, regionId: 2 },
              { id: 3, text: `д. ${query}, Тверская обл.`, formatted: `д. ${query}, Тверская обл.`, cityId: 3, regionId: 3 },
            ];
            setSuggestions(mockCities);
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
            const mockStreets = [
              { id: 1, text: `ул. ${query}менчугская`, formatted: `ул. ${query}менчугская`, streetId: 1 },
              { id: 2, text: `наб. ${query}млевская`, formatted: `наб. ${query}млевская`, streetId: 2 },
              { id: 3, text: `ул. ${query}нкеля`, formatted: `ул. ${query}нкеля`, streetId: 3 },
            ];
            setSuggestions(mockStreets);
          }
        } else if (currentStep === 'house') {
          if (addressData.streetId) {
            const buildingsResponse = await locationsService.getBuildings({
              streetId: addressData.streetId,
              limit: 50,
            });

            if (buildingsResponse?.success && buildingsResponse.data) {
              const filtered = buildingsResponse.data.filter((building: any) =>
                building.houseNumber?.toString().includes(query)
              );
              setSuggestions(filtered.map((building: any) => ({
                id: building.id,
                text: `д. ${building.houseNumber}`,
                formatted: `д. ${building.houseNumber}`,
                buildingId: building.id,
              })));
            } else {
              const mockHouses = [
                { id: 1, text: `д. ${query} к 5`, formatted: `д. ${query} к 5`, buildingId: 1 },
                { id: 2, text: `д. ${query} к 6`, formatted: `д. ${query} к 6`, buildingId: 2 },
                { id: 3, text: `д. ${query} к 9`, formatted: `д. ${query} к 9`, buildingId: 3 },
              ];
              setSuggestions(mockHouses);
            }
          } else {
            const mockHouses = [
              { id: 1, text: `д. ${query} к 5`, formatted: `д. ${query} к 5`, buildingId: 1 },
              { id: 2, text: `д. ${query} к 6`, formatted: `д. ${query} к 6`, buildingId: 2 },
              { id: 3, text: `д. ${query} к 9`, formatted: `д. ${query} к 9`, buildingId: 3 },
            ];
            setSuggestions(mockHouses);
          }
        }
        setSelectedIndex(null);
      } catch (error) {
        console.error('Autocomplete error:', error);
        if (currentStep === 'city') {
          setSuggestions([
            { id: 1, text: `гор. ${query}, Московская обл.`, formatted: `гор. ${query}, Московская обл.`, cityId: 1, regionId: 1 },
            { id: 2, text: `д. ${query}, Псковская обл.`, formatted: `д. ${query}, Псковская обл.`, cityId: 2, regionId: 2 },
            { id: 3, text: `д. ${query}, Тверская обл.`, formatted: `д. ${query}, Тверская обл.`, cityId: 3, regionId: 3 },
          ]);
        } else if (currentStep === 'street') {
          setSuggestions([
            { id: 1, text: `ул. ${query}менчугская`, formatted: `ул. ${query}менчугская`, streetId: 1 },
            { id: 2, text: `наб. ${query}млевская`, formatted: `наб. ${query}млевская`, streetId: 2 },
            { id: 3, text: `ул. ${query}нкеля`, formatted: `ул. ${query}нкеля`, streetId: 3 },
          ]);
        } else {
          setSuggestions([
            { id: 1, text: `д. ${query} к 5`, formatted: `д. ${query} к 5`, buildingId: 1 },
            { id: 2, text: `д. ${query} к 6`, formatted: `д. ${query} к 6`, buildingId: 2 },
            { id: 3, text: `д. ${query} к 9`, formatted: `д. ${query} к 9`, buildingId: 3 },
          ]);
        }
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
  }, [query, currentStep, addressData.cityId, addressData.streetId]);

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
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const canProceed = selectedIndex !== null || query.trim().length > 0;

  // Адаптивная высота: базовая высота + высота для каждого варианта (макс 3)
  const visibleSuggestions = suggestions.slice(0, 3);
  const suggestionHeight = 50;
  const baseHeight = 200; // заголовок + подзаголовок + инпут + кнопки
  const suggestionsBlockHeight = visibleSuggestions.length * (suggestionHeight + 10);
  const modalHeight = baseHeight + suggestionsBlockHeight + (visibleSuggestions.length > 0 ? 20 : 0);

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-end justify-center"
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12.5px)',
        paddingBottom: '155px',
      }}
      onClick={handleBackdropClick}
    >
      {/* Подсказка сверху */}
      <div
        style={{
          position: 'absolute',
          width: '240px',
          height: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
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
          position: 'relative',
          width: '360px',
          minHeight: `${modalHeight}px`,
          background: '#FFFFFF',
          border: '1px solid rgba(16, 16, 16, 0.15)',
          backdropFilter: 'blur(7.5px)',
          borderRadius: '20px',
          padding: '15px',
          transition: 'min-height 0.2s ease',
        }}
      >
        {/* Заголовок */}
        <div
          style={{
            width: '330px',
            height: '25px',
            fontFamily: 'TT Firs Neue, sans-serif',
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: '20px',
            lineHeight: '125%',
            display: 'flex',
            alignItems: 'center',
            color: '#101010',
          }}
        >
          Проверка тех. доступа
        </div>

        {/* Подзаголовок */}
        <div
          style={{
            width: '330px',
            height: '30px',
            marginTop: '15px',
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

        {/* Опции вариантов */}
        {visibleSuggestions.length > 0 && (
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {visibleSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.id || index}
                onClick={() => handleSelect(index)}
                style={{
                  boxSizing: 'border-box',
                  width: '330px',
                  height: '50px',
                  border: selectedIndex === index
                    ? '1px solid #101010'
                    : '1px solid rgba(16, 16, 16, 0.25)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 15px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease',
                }}
              >
                <span
                  style={{
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    fontSize: '16px',
                    lineHeight: '125%',
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

        {/* Поле ввода */}
        <div style={{ marginTop: '20px' }}>
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
              border: '1px solid rgba(16, 16, 16, 0.25)',
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

        {/* Кнопки навигации */}
        <div
          style={{
            marginTop: '15px',
            display: 'flex',
            gap: '10px',
          }}
        >
          {/* Кнопка "Назад" */}
          <button
            onClick={onClose}
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
              cursor: 'pointer',
            }}
          >
            <CaretLeft size={20} color="#101010" weight="bold" />
          </button>

          {/* Кнопка "Вверх" */}
          <button
            onClick={handleScrollUp}
            disabled={suggestions.length === 0}
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
              cursor: suggestions.length > 0 ? 'pointer' : 'not-allowed',
              opacity: suggestions.length > 0 ? 1 : 0.5,
            }}
          >
            <CaretUp size={20} color="#101010" weight="bold" />
          </button>

          {/* Кнопка "Вниз" */}
          <button
            onClick={handleScrollDown}
            disabled={suggestions.length === 0}
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
              cursor: suggestions.length > 0 ? 'pointer' : 'not-allowed',
              opacity: suggestions.length > 0 ? 1 : 0.5,
            }}
          >
            <CaretDown size={20} color="#101010" weight="bold" />
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
  );
}
