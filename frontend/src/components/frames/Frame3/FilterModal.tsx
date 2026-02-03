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
        className="fixed inset-0 z-[10000] flex flex-col items-center overflow-hidden"
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
          className="relative w-full max-w-[400px] flex flex-col flex-1 min-h-0 overflow-hidden bg-[#F5F5F5] px-4"
          style={{ boxSizing: 'border-box' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="flex-1 min-h-0 flex flex-col rounded-[20px] bg-white overflow-hidden"
            style={{ maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}
          >
            <div className="flex-shrink-0 p-6 pb-0">
              <h2 className="text-xl font-normal mb-4">Фильтрация</h2>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6 py-4" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setShowProvidersModal(true)}
                  className="outline-none cursor-pointer px-4 py-3 border border-[rgba(16,16,16,0.25)] rounded-[10px] text-left hover:bg-gray-50 transition-colors"
                >
                  Выбрать операторов
                </button>

                <button
                  type="button"
                  onClick={() => setShowServicesModal(true)}
                  className="outline-none cursor-pointer px-4 py-3 border border-[rgba(16,16,16,0.25)] rounded-[10px] text-left hover:bg-gray-50 transition-colors"
                >
                  Выбрать услуги
                </button>
              </div>
            </div>

            <div className="flex-shrink-0 p-6 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="outline-none cursor-pointer w-full px-4 py-3 bg-[#101010] text-white rounded-[10px] hover:bg-gray-800 transition-colors"
              >
                Применить
              </button>
            </div>
          </div>
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
