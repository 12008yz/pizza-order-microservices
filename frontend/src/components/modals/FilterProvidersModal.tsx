'use client';

import { useState } from 'react';
import CheckboxOption from '../common/CheckboxOption';
import { ClickOutsideHintContent, HINT_TOP } from '../common/ClickOutsideHint';

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
        paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
        height: '100dvh',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      {/* Контейнер — header и карточка, карточка прижата вниз */}
      <div
        className="relative w-full max-w-[360px] flex flex-col h-full overflow-hidden bg-[#F5F5F5]"
        style={{ boxSizing: 'border-box' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка: подсказка */}
        <div
          className="flex-shrink-0 cursor-pointer"
          style={{ minHeight: '105px' }}
          onClick={onClose}
        >
          <div className="flex justify-center" style={{ paddingTop: HINT_TOP }}>
            <ClickOutsideHintContent />
          </div>
        </div>

        {/* Карточка — компактная, прижата вниз с отступом 20px */}
        <div
          className="flex flex-col frame-card"
          style={{
            width: '360px',
            maxWidth: 'calc(100% - 40px)',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: 'auto',
            marginBottom: '20px',
            maxHeight: 'calc(100dvh - 145px)',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="font-normal flex-shrink-0"
            style={{
              fontFamily: 'TT Firs Neue, sans-serif',
              fontSize: '20px',
              lineHeight: '125%',
              color: '#101010',
              marginBottom: '20px',
            }}
          >
            Выбор операторов
          </div>

          <div className="overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="flex flex-col frame-fields-gap" style={{ paddingBottom: '10px' }}>
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

          <div className="flex-shrink-0 flex gap-[5px] pt-[10px]">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-[rgba(16,16,16,0.15)] rounded-[10px] hover:bg-gray-50 transition-colors"
              style={{
                fontFamily: 'TT Firs Neue, sans-serif',
                fontSize: '16px',
                minHeight: '50px',
              }}
            >
              Отмена
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-3 bg-[#101010] text-white rounded-[10px] hover:bg-gray-800 transition-colors"
              style={{
                fontFamily: 'TT Firs Neue, sans-serif',
                fontSize: '16px',
                minHeight: '50px',
              }}
            >
              Применить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
