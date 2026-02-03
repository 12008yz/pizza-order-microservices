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
      className="fixed inset-0 z-[10001] flex items-center justify-center overflow-y-auto overflow-x-hidden"
      style={{
        background: '#F5F5F5',
        backdropFilter: 'blur(12.5px)',
        paddingTop: 'var(--sat, 0px)',
        paddingBottom: 'var(--sab, 0px)',
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[20px] p-6 max-w-[400px] w-full mx-4 overflow-y-auto"
        style={{ maxHeight: 'calc(100dvh - var(--sat, 0px) - var(--sab, 0px) - 80px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-normal mb-4">Сортировка</h2>

        <div className="flex flex-col gap-3 mb-6">
          {sortOptions.map((option) => (
            <RadioOption
              key={option.value}
              label={option.label}
              selected={selectedSort === option.value}
              onClick={() => handleSelect(option.value)}
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
