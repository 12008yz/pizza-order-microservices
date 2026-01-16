'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface AddressSuggestion {
  text: string;
  formatted: string;
  regionId?: number;
  cityId?: number;
  streetId?: number;
  buildingId?: number;
  apartmentId?: number;
}

interface Provider {
  id: number;
  name: string;
  slug: string;
  logo: string;
  rating: number;
  reviewsCount: number;
}

export default function AddressSearch() {
  const [addressQuery, setAddressQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null);
  const [availableProviders, setAvailableProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Автодополнение адреса
  useEffect(() => {
    if (addressQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/locations', {
          params: {
            endpoint: 'autocomplete',
            q: addressQuery,
            limit: 10,
          },
        });

        if (response.data.success) {
          setSuggestions(response.data.data || []);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Autocomplete error:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [addressQuery]);

  // Закрытие подсказок при клике вне
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

  // Поиск провайдеров по адресу
  const searchProviders = async (address: AddressSuggestion) => {
    setSelectedAddress(address);
    setShowSuggestions(false);
    setLoadingProviders(true);

    try {
      // Извлекаем город, улицу, дом из адреса
      const addressParts = address.formatted?.split(',') || address.text.split(',');
      const city = addressParts[0]?.trim();
      const street = addressParts[1]?.trim();
      const houseMatch = addressParts[2]?.match(/\d+/);
      const house = houseMatch ? parseInt(houseMatch[0]) : undefined;

      // Если есть buildingId - используем точную проверку через Availability Service
      if (address.buildingId) {
        const response = await axios.get('/api/providers/by-address', {
          params: {
            buildingId: address.buildingId,
            cityId: address.cityId,
            streetId: address.streetId,
          },
        });

        if (response.data.success) {
          setAvailableProviders(response.data.data || []);
        }
      } else if (city) {
        // Используем Coverage Service для проверки по городу/улице/дому
        const response = await axios.get('/api/coverage', {
          params: {
            city,
            street: street || undefined,
            house: house || undefined,
          },
        });

        if (response.data.success) {
          setAvailableProviders(response.data.data || []);
        }
      } else {
        // Если нет данных адреса, показываем всех провайдеров
        const response = await axios.get('/api/providers', {
          params: { active: true },
        });
        if (response.data.success) {
          setAvailableProviders(response.data.data || []);
        }
      }
    } catch (error) {
      console.error('Search providers error:', error);
      // В случае ошибки показываем всех провайдеров
      try {
        const response = await axios.get('/api/providers', {
          params: { active: true },
        });
        if (response.data.success) {
          setAvailableProviders(response.data.data || []);
        }
      } catch (fallbackError) {
        setAvailableProviders([]);
      }
    } finally {
      setLoadingProviders(false);
    }
  };

  const handleAddressSelect = (suggestion: AddressSuggestion) => {
    setAddressQuery(suggestion.formatted || suggestion.text);
    searchProviders(suggestion);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Поле ввода адреса с автодополнением */}
      <div className="relative mb-4">
        <input
          ref={inputRef}
          type="text"
          value={addressQuery}
          onChange={(e) => setAddressQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder="Введите адрес (например: Москва, ул. Ленина, д. 10)"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
        />

        {/* Список подсказок */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {loading ? (
              <div className="px-4 py-2 text-gray-500">Загрузка...</div>
            ) : (
              suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleAddressSelect(suggestion)}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">
                    {suggestion.formatted || suggestion.text}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Список доступных провайдеров */}
      {selectedAddress && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">
            Доступные провайдеры по адресу: {selectedAddress.formatted || selectedAddress.text}
          </h2>

          {loadingProviders ? (
            <div className="text-center py-8 text-gray-500">Поиск провайдеров...</div>
          ) : availableProviders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center mb-2">
                    {provider.logo && (
                      <img
                        src={provider.logo}
                        alt={provider.name}
                        className="w-12 h-12 mr-3 object-contain"
                      />
                    )}
                    <h3 className="font-bold text-lg">{provider.name}</h3>
                  </div>
                  {provider.rating > 0 && (
                    <div className="text-sm text-gray-600">
                      ⭐ {provider.rating.toFixed(1)} ({provider.reviewsCount} отзывов)
                    </div>
                  )}
                  <button
                    onClick={() => {
                      // Переход на страницу тарифов провайдера
                      window.location.href = `/providers/${provider.id}?address=${encodeURIComponent(
                        selectedAddress.formatted || selectedAddress.text
                      )}`;
                    }}
                    className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Посмотреть тарифы
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              По данному адресу провайдеры не найдены
            </div>
          )}
        </div>
      )}
    </div>
  );
}
