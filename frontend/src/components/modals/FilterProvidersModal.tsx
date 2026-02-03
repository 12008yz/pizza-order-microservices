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
      className="fixed inset-0 z-[10001] flex flex-col items-center overflow-hidden"
      style={{
        background: '#F5F5F5',
        backdropFilter: 'blur(12.5px)',
        paddingTop: 'var(--sat, 0px)',
        paddingBottom: 'var(--sab, 0px)',
        height: '100dvh',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[400px] flex flex-col flex-1 min-h-0 overflow-hidden bg-[#F5F5F5]"
        style={{ boxSizing: 'border-box' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex-1 min-h-0 flex flex-col rounded-[20px] bg-white overflow-hidden"
          style={{ maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}
        >
          <div className="flex-shrink-0 p-6 pb-0">
            <h2 className="text-xl font-normal mb-4">Выбор операторов</h2>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6 py-2" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="flex flex-col gap-3 pb-4">
              {providers.map((provider) => (
                <CheckboxOption
                  key={provider.id}
                  label={provider.name}
                  checked={selectedProviders.includes(provider.id)}
                  onChange={() => handleToggleProvider(provider.id)}
                />
              ))}
            </div>
          </div>

          <div className="flex-shrink-0 p-6 pt-4 flex gap-3">
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
    </div>
  );
}
