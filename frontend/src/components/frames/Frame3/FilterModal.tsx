'use client';

import { useState } from 'react';
import FilterProvidersModal from '../../modals/FilterProvidersModal';
import FilterServicesModal from '../../modals/FilterServicesModal';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterModal({ isOpen, onClose }: FilterModalProps) {
  const [showProvidersModal, setShowProvidersModal] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[10000] flex items-end justify-center"
        style={{
          background: '#F5F5F5',
          backdropFilter: 'blur(12.5px)',
        }}
        onClick={onClose}
      >
        <div
          className="bg-white rounded-[20px] p-6 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-normal mb-4">Просеивание</h2>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowProvidersModal(true)}
              className="px-4 py-3 border border-[rgba(16,16,16,0.25)] rounded-[10px] text-left hover:bg-gray-50 transition-colors"
            >
              Выбрать операторов
            </button>
            
            <button
              onClick={() => setShowServicesModal(true)}
              className="px-4 py-3 border border-[rgba(16,16,16,0.25)] rounded-[10px] text-left hover:bg-gray-50 transition-colors"
            >
              Выбрать услуги
            </button>
          </div>

          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-3 bg-[#101010] text-white rounded-[10px] hover:bg-gray-800 transition-colors"
          >
            Применить
          </button>
        </div>
      </div>

      {showProvidersModal && (
        <FilterProvidersModal
          isOpen={showProvidersModal}
          onClose={() => setShowProvidersModal(false)}
        />
      )}

      {showServicesModal && (
        <FilterServicesModal
          isOpen={showServicesModal}
          onClose={() => setShowServicesModal(false)}
        />
      )}
    </>
  );
}
