'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAddress } from '../contexts/AddressContext';
import { locationsService } from '../services/locations.service';

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

  // Fetch suggestions with debounce
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.length < 1) {
      setSuggestions([]);
      return;
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
            // Mock data for demo
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
            // Mock data for demo
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
              // Mock data for demo
              const mockHouses = [
                { id: 1, text: `д. ${query} к 5`, formatted: `д. ${query} к 5`, buildingId: 1 },
                { id: 2, text: `д. ${query} к 6`, formatted: `д. ${query} к 6`, buildingId: 2 },
                { id: 3, text: `д. ${query} к 9`, formatted: `д. ${query} к 9`, buildingId: 3 },
              ];
              setSuggestions(mockHouses);
            }
          } else {
            // Mock data for demo
            const mockHouses = [
              { id: 1, text: `д. ${query} к 5`, formatted: `д. ${query} к 5`, buildingId: 1 },
              { id: 2, text: `д. ${query} к 6`, formatted: `д. ${query} к 6`, buildingId: 2 },
              { id: 3, text: `д. ${query} к 9`, formatted: `д. ${query} к 9`, buildingId: 3 },
            ];
            setSuggestions(mockHouses);
          }
        }
      } catch (error) {
        console.error('Autocomplete error:', error);
        // Fallback to mock data
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

  const handleNext = () => {
    if (selectedIndex === null && !query.trim()) return;

    const selected = selectedIndex !== null ? suggestions[selectedIndex] : null;
    const value = selected?.formatted || selected?.text || query.trim();

    if (currentStep === 'city') {
      updateCity(selected?.cityId || undefined, value, selected?.regionId);
      setCurrentStep('street');
      setQuery('');
      setSuggestions([]);
      setSelectedIndex(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else if (currentStep === 'street') {
      updateStreet(selected?.streetId || undefined, value);
      setCurrentStep('house');
      setQuery('');
      setSuggestions([]);
      setSelectedIndex(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else if (currentStep === 'house') {
      updateHouseNumber(selected?.buildingId || undefined, value, undefined);
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep === 'street') {
      setCurrentStep('city');
      setQuery('');
      setSuggestions([]);
      setSelectedIndex(null);
    } else if (currentStep === 'house') {
      setCurrentStep('street');
      setQuery('');
      setSuggestions([]);
      setSelectedIndex(null);
    } else {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const canProceed = selectedIndex !== null || query.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-[90%] max-w-[360px] bg-white rounded-[20px] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <h2 className="text-2xl font-bold text-[#101010] mb-2">Проверка тех. доступа</h2>
        <p className="text-sm text-gray-500 mb-4">
          Мы подготовили доступные тарифные планы. Пожалуйста, проверьте правильность
        </p>

        {/* Suggestions list with radio buttons */}
        {suggestions.length > 0 && (
          <div className="space-y-2 mb-4 max-h-[180px] overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id || index}
                onClick={() => handleSelect(index)}
                className={`relative flex items-center justify-between p-3 border rounded-[10px] cursor-pointer transition-all ${selectedIndex === index
                    ? 'border-[#101010] bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <span className="text-[#101010] text-sm">{suggestion.formatted || suggestion.text}</span>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedIndex === index
                      ? 'border-[#101010] bg-[#101010]'
                      : 'border-gray-300'
                    }`}
                >
                  {selectedIndex === index && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6L5 9L10 3"
                        stroke="white"
                        strokeWidth="2"
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

        {/* Input field */}
        <div className="mb-4">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(null);
            }}
            placeholder={stepConfig[currentStep].placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-[10px] text-[#101010] placeholder:text-gray-400 focus:outline-none focus:border-[#101010] transition-colors"
          />
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-3">
          {/* Back button */}
          <button
            onClick={handlePrev}
            className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-[10px] hover:bg-gray-50 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="#101010"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Down arrow button */}
          <button
            onClick={() => {
              if (suggestions.length > 0 && selectedIndex !== null && selectedIndex < suggestions.length - 1) {
                setSelectedIndex(selectedIndex + 1);
              } else if (suggestions.length > 0 && selectedIndex === null) {
                setSelectedIndex(0);
              }
            }}
            className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-[10px] hover:bg-gray-50 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="#101010"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={`flex-1 h-12 rounded-[10px] text-white font-medium transition-colors ${canProceed
                ? 'bg-[#101010] hover:bg-gray-800'
                : 'bg-gray-300 cursor-not-allowed'
              }`}
          >
            Далее
          </button>
        </div>
      </div>
    </div>
  );
}
