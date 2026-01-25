'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { CaretRight } from '@phosphor-icons/react';
import { locationsService } from '../services/locations.service';
import type { AddressSuggestion } from '../services/api/types';
import { useAddress } from '../contexts/AddressContext';

interface AddressAutocompleteProps {
  type: 'city' | 'street' | 'house' | 'apartment';
  placeholder: string;
  disabled?: boolean;
  value?: string;
  onSelect?: (suggestion: AddressSuggestion | any) => void;
}

export default function AddressAutocomplete({
  type,
  placeholder,
  disabled = false,
  value,
  onSelect,
}: AddressAutocompleteProps) {
  const { addressData, updateCity, updateStreet, updateHouseNumber, updateApartmentNumber } = useAddress();
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AddressSuggestion | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Обновляем query при изменении value извне
  useEffect(() => {
    if (value !== undefined) {
      setQuery(value);
    }
  }, [value]);

  // Автодополнение с debounce
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Если поле пустое или меньше 2 символов, очищаем подсказки
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Если уже выбрано значение, не делаем запрос
    if (selectedSuggestion && query === (selectedSuggestion.formatted || selectedSuggestion.text)) {
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        let response;

        if (type === 'city') {
          // Для города используем автодополнение
          response = await locationsService.autocomplete({
            q: query,
            limit: 10,
          });
        } else if (type === 'street') {
          // Для улицы нужен cityId или city (если город введен вручную)
          if (!addressData.cityId && !addressData.city) {
            setSuggestions([]);
            setLoading(false);
            return;
          }
          // Если есть cityId, используем его, иначе ищем по названию города
          response = await locationsService.autocomplete({
            q: query,
            ...(addressData.cityId ? { cityId: addressData.cityId } : {}),
            limit: 10,
          });
        } else if (type === 'house') {
          // Для дома нужен streetId или street (если улица введена вручную)
          if (!addressData.streetId && !addressData.street) {
            setSuggestions([]);
            setLoading(false);
            return;
          }
          // Если streetId нет, не можем получить список домов из БД
          // В этом случае пользователь должен ввести номер дома вручную
          if (!addressData.streetId) {
            setSuggestions([]);
            setLoading(false);
            return;
          }
          // Получаем список домов по улице
          const buildingsResponse = await locationsService.getBuildings({
            streetId: addressData.streetId,
            limit: 50,
          });
          if (buildingsResponse.success && buildingsResponse.data) {
            // Фильтруем дома по введенному запросу
            const filtered = buildingsResponse.data.filter((building: any) =>
              building.number?.toString().toLowerCase().includes(query.toLowerCase())
            );
            setSuggestions(
              filtered.map((building: any) => {
                const houseNumber = building.number + (building.building ? ` ${building.building}` : '');
                return {
                  text: houseNumber,
                  formatted: houseNumber,
                  buildingId: building.id,
                };
              })
            );
            setShowSuggestions(true);
            setLoading(false);
            return;
          }
          setSuggestions([]);
          setLoading(false);
          return;
        } else if (type === 'apartment') {
          // Для квартиры нужен buildingId
          if (!addressData.buildingId) {
            setSuggestions([]);
            setLoading(false);
            return;
          }
          // Получаем список квартир по дому
          const apartmentsResponse = await locationsService.getApartments({
            buildingId: addressData.buildingId,
            limit: 100,
          });
          if (apartmentsResponse.success && apartmentsResponse.data) {
            // Фильтруем квартиры по введенному запросу
            const filtered = apartmentsResponse.data.filter((apartment: any) =>
              apartment.number?.toString().toLowerCase().includes(query.toLowerCase())
            );
            setSuggestions(
              filtered.map((apartment: any) => ({
                text: apartment.number || '',
                formatted: apartment.number || '',
                apartmentId: apartment.id,
              }))
            );
            setShowSuggestions(true);
            setLoading(false);
            return;
          }
          setSuggestions([]);
          setLoading(false);
          return;
        }

        if (response?.success && response.data) {
          setSuggestions(response.data);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Autocomplete error:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300); // Debounce 300ms

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, type, addressData.cityId, addressData.streetId, addressData.buildingId, selectedSuggestion]);

  // Закрытие подсказок при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (suggestion: AddressSuggestion) => {
      setQuery(suggestion.formatted || suggestion.text);
      setSelectedSuggestion(suggestion);
      setShowSuggestions(false);

      // Обновляем контекст в зависимости от типа поля
      if (type === 'city') {
        updateCity(suggestion.cityId, suggestion.formatted || suggestion.text, suggestion.regionId);
      } else if (type === 'street') {
        updateStreet(suggestion.streetId, suggestion.formatted || suggestion.text);
      } else if (type === 'house') {
        updateHouseNumber(
          suggestion.buildingId,
          suggestion.formatted || suggestion.text,
          suggestion.apartmentId
        );
      } else if (type === 'apartment') {
        updateApartmentNumber(
          suggestion.apartmentId,
          suggestion.formatted || suggestion.text
        );
      }

      // Вызываем внешний callback если есть
      if (onSelect) {
        onSelect(suggestion);
      }
    },
    [type, updateCity, updateStreet, updateHouseNumber, updateApartmentNumber, onSelect]
  );

  // Обработка blur - сохраняем введенное значение, даже если оно не из списка
  const handleBlur = useCallback(() => {
    // Небольшая задержка, чтобы onClick из списка успел сработать
    setTimeout(() => {
      const currentValue = query.trim();
      if (currentValue && !selectedSuggestion) {
        // Пользователь ввел произвольный текст, сохраняем его
        if (type === 'city') {
          updateCity(undefined, currentValue, undefined);
        } else if (type === 'street') {
          updateStreet(undefined, currentValue);
        } else if (type === 'house') {
          updateHouseNumber(undefined, currentValue, undefined);
        } else if (type === 'apartment') {
          updateApartmentNumber(undefined, currentValue);
        }
      }
      setShowSuggestions(false);
    }, 200);
  }, [query, selectedSuggestion, type, updateCity, updateStreet, updateHouseNumber, updateApartmentNumber]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setSelectedSuggestion(null);

    // Обновляем контекст при вводе (для произвольного ввода)
    // Это позволяет пользователю вводить адрес, даже если его нет в БД
    if (newValue === '') {
      // Очищаем контекст при очистке поля
      if (type === 'city') {
        updateCity(undefined, undefined, undefined);
      } else if (type === 'street') {
        updateStreet(undefined, undefined);
      } else if (type === 'house') {
        updateHouseNumber(undefined, undefined, undefined);
      } else if (type === 'apartment') {
        updateApartmentNumber(undefined, undefined);
      }
    } else {
      // Сохраняем введенное значение в контекст (без ID, так как адреса еще нет в БД)
      // ID будет создан при отправке формы
      if (type === 'city') {
        // Обновляем только если значение изменилось
        // updateCity автоматически очистит зависимые поля (улица, дом, квартира)
        if (addressData.city !== newValue) {
          updateCity(undefined, newValue, undefined);
        }
      } else if (type === 'street') {
        // updateStreet автоматически очистит зависимые поля (дом, квартира)
        if (addressData.street !== newValue) {
          updateStreet(undefined, newValue);
        }
      } else if (type === 'house') {
        // updateHouseNumber автоматически очистит квартиру
        if (addressData.houseNumber !== newValue) {
          updateHouseNumber(undefined, newValue, undefined);
        }
      } else if (type === 'apartment') {
        if (addressData.apartmentNumber !== newValue) {
          updateApartmentNumber(undefined, newValue);
        }
      }
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Определяем отображаемое значение
  const displayValue =
    query ||
    (type === 'city' && addressData.city) ||
    (type === 'street' && addressData.street) ||
    (type === 'house' && addressData.houseNumber) ||
    (type === 'apartment' && addressData.apartmentNumber) ||
    '';

  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative w-full">
      <div
        className={`relative w-full rounded-[10px] bg-white ${disabled
          ? 'opacity-50 cursor-not-allowed'
          : ''
          }`}
        style={{
          border: disabled
            ? '0.5px solid rgba(229, 231, 235, 1)'
            : isFocused
              ? '0.5px solid #101010'
              : '0.5px solid rgba(209, 213, 219, 1)',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={(e) => {
            setIsFocused(true);
            handleInputFocus();
          }}
          onBlur={(e) => {
            setIsFocused(false);
            handleBlur();
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full h-full px-[15px] border-none rounded-[10px] bg-transparent outline-none text-base leading-[125%] text-[#101010] placeholder:text-[rgba(16,16,16,0.5)] disabled:cursor-not-allowed"
          style={{ paddingTop: '15.5px', paddingBottom: '15.5px' }}
        />
        <div className="absolute right-[15px] top-1/2 -translate-y-1/2 pointer-events-none">
          {loading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-[#101010] rounded-full animate-spin" />
          ) : (
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center ${displayValue && !disabled
                ? 'bg-[#101010]'
                : 'border border-[rgba(16,16,16,0.25)]'
                }`}
              style={{
                borderWidth: '0.5px',
              }}
            >
              <CaretRight 
                size={8} 
                weight="regular" 
                color={displayValue && !disabled ? '#FFFFFF' : 'rgba(16, 16, 16, 0.25)'} 
              />
            </div>
          )}
        </div>
      </div>

      {/* Список подсказок */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-white border border-[rgba(16,16,16,0.15)] rounded-[10px] shadow-lg max-h-60 overflow-y-auto"
          style={{
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          {suggestions.map((suggestion, index) => {
            // Если подсказка только одна, её высота должна быть такой же, как у поля ввода
            // Поле ввода имеет paddingTop: 15.5px + paddingBottom: 15.5px + высота текста ≈ 45-50px
            const isSingleSuggestion = suggestions.length === 1;
            const suggestionPadding = isSingleSuggestion ? '15.5px 15px' : '12px 15px';
            
            return (
            <div
              key={index}
              onClick={() => handleSelect(suggestion)}
              className="hover:bg-gray-50 cursor-pointer border-b border-[rgba(16,16,16,0.05)] last:border-b-0 transition-colors"
              style={{
                padding: suggestionPadding,
                borderBottom: index < suggestions.length - 1 ? '0.5px solid rgba(16, 16, 16, 0.05)' : 'none',
                minHeight: isSingleSuggestion ? '50px' : 'auto',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div className="text-base leading-[125%] text-[#101010] font-normal">
                {suggestion.formatted || suggestion.text}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
