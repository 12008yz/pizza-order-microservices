'use client';

import { useState } from 'react';
import CheckboxOption from '../common/CheckboxOption';

interface FilterProvidersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (selectedProviders: string[]) => void;
}

const providers = [
  { id: 'beeline', name: 'Билайн' },
  { id: 'mts', name: 'МТС' },
  { id: 'rostelecom', name: 'Ростелеком' },
  { id: 'tele2', name: 'Теле2' },
  { id: 'megafon', name: 'Мегафон' },
  { id: 'yota', name: 'Yota' },
];

export default function FilterProvidersModal({
  isOpen,
  onClose,
  onApply,
}: FilterProvidersModalProps) {
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);

  const handleToggleProvider = (providerId: string) => {
    setSelectedProviders((prev) =>
      prev.includes(providerId)
        ? prev.filter((id) => id !== providerId)
        : [...prev, providerId]
    );
  };

  const handleApply = () => {
    if (onApply) {
      onApply(selectedProviders);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center"
      style={{
        background: '#F5F5F5',
        backdropFilter: 'blur(12.5px)',
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[20px] p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-normal mb-4">Выбор операторов</h2>

        <div className="flex flex-col gap-3 mb-6">
          {providers.map((provider) => (
            <CheckboxOption
              key={provider.id}
              label={provider.name}
              checked={selectedProviders.includes(provider.id)}
              onChange={() => handleToggleProvider(provider.id)}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-[rgba(16,16,16,0.15)] rounded-[10px] hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-3 bg-[#101010] text-white rounded-[10px] hover:bg-gray-800 transition-colors"
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  );
}
