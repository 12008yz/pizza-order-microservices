'use client';

import { useState } from 'react';
import SortingModal from '../../modals/SortingModal';

type SortOption = 'price' | 'speed' | 'popularity';

export default function SortingOptions() {
  const [showSortingModal, setShowSortingModal] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortOption>('popularity');

  const getSortLabel = (sort: SortOption): string => {
    switch (sort) {
      case 'price':
        return 'По стоимости';
      case 'speed':
        return 'По скорости';
      case 'popularity':
        return 'По популярности';
      default:
        return 'Сортировка';
    }
  };

  return (
    <>
      <div
        className="absolute flex items-center gap-2"
        style={{
          left: '20px',
          top: 120,
        }}
      >
        <button
          onClick={() => setShowSortingModal(true)}
          className="px-4 py-2 border border-[rgba(16,16,16,0.25)] rounded-[10px] text-sm hover:bg-gray-50 transition-colors"
        >
          {getSortLabel(selectedSort)}
        </button>
      </div>

      {showSortingModal && (
        <SortingModal
          isOpen={showSortingModal}
          onClose={() => setShowSortingModal(false)}
          onSelect={(sort) => {
            setSelectedSort(sort);
            setShowSortingModal(false);
          }}
        />
      )}
    </>
  );
}
