'use client';

import { useState } from 'react';
import { useAddress, ConnectionType } from '../contexts/AddressContext';

interface ConnectionTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
}

const connectionTypes: { value: ConnectionType; label: string }[] = [
  { value: 'apartment', label: 'Подключение квартиры' },
  { value: 'private', label: 'Подключение частного сектора' },
  { value: 'office', label: 'Подключение офиса' },
];

export default function ConnectionTypeModal({
  isOpen,
  onClose,
  onNext,
}: ConnectionTypeModalProps) {
  const { addressData, updateConnectionType } = useAddress();
  const [selectedType, setSelectedType] = useState<ConnectionType>(addressData.connectionType);

  if (!isOpen) return null;

  const handleSelect = (type: ConnectionType) => {
    setSelectedType(type);
    updateConnectionType(type);
  };

  const handleNext = () => {
    if (selectedType) {
      updateConnectionType(selectedType);
      onNext();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-[90%] max-w-[360px] bg-white rounded-[20px] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <h2 className="text-2xl font-bold text-[#101010] mb-2">Проверка тех. доступа</h2>
        <p className="text-sm text-gray-600 mb-6">
          Мы подготовили доступные тарифные планы. Пожалуйста, проверьте правильность
        </p>

        {/* Список типов подключения */}
        <div className="space-y-3 mb-6">
          {connectionTypes.map((type) => (
            <div
              key={type.value}
              onClick={() => handleSelect(type.value)}
              className={`relative flex items-center justify-between p-4 border rounded-[10px] cursor-pointer transition-all ${
                selectedType === type.value
                  ? 'border-[#101010] bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-medium text-[#101010]">{type.label}</span>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedType === type.value
                    ? 'border-[#101010] bg-[#101010]'
                    : 'border-gray-300'
                }`}
              >
                {selectedType === type.value && (
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

        {/* Кнопки навигации */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-[10px] text-[#101010] hover:bg-gray-50 transition-colors"
          >
            Назад
          </button>
          <button
            onClick={handleNext}
            disabled={!selectedType}
            className={`flex-1 px-4 py-3 rounded-[10px] text-white font-medium transition-colors ${
              selectedType
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
