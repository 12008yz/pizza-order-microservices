'use client';

import { useState } from 'react';
import RadioOption from '../common/RadioOption';

type SortOption = 'price' | 'speed' | 'popularity';

interface SortingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (sort: SortOption) => void;
  currentSort?: SortOption;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'popularity', label: 'По популярности' },
  { value: 'price', label: 'По стоимости' },
  { value: 'speed', label: 'По скорости' },
];

export default function SortingModal({
  isOpen,
  onClose,
  onSelect,
  currentSort = 'popularity',
}: SortingModalProps) {
  const [selectedSort, setSelectedSort] = useState<SortOption>(currentSort);

  const handleSelect = (sort: SortOption) => {
    setSelectedSort(sort);
  };

  const handleApply = () => {
    onSelect(selectedSort);
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
        paddingBottom: 'max(20px, env(safe-area-inset-bottom, 0px))',
        height: '100dvh',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      {/* Контейнер — header и карточка, карточка прижата вниз */}
      <div
        className="relative w-full max-w-[400px] flex flex-col h-full overflow-hidden bg-[#F5F5F5]"
        style={{ boxSizing: 'border-box' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка: подсказка */}
        <div
          className="flex-shrink-0 cursor-pointer"
          style={{ minHeight: '105px' }}
          onClick={onClose}
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
            padding: '15px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="font-normal"
            style={{
              fontFamily: 'TT Firs Neue, sans-serif',
              fontSize: '20px',
              lineHeight: '125%',
              color: '#101010',
              marginBottom: '20px',
            }}
          >
            Сортировка
          </div>

          <div className="flex flex-col gap-[5px] mb-[15px]">
            {sortOptions.map((option) => (
              <RadioOption
                key={option.value}
                label={option.label}
                selected={selectedSort === option.value}
                onClick={() => handleSelect(option.value)}
              />
            ))}
          </div>

          <div className="flex gap-[10px]">
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
