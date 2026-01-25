'use client';

import { useState } from 'react';
import ApartmentSelectModal from '../../modals/ApartmentSelectModal';

interface TechAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TechAccessModal({ isOpen, onClose }: TechAccessModalProps) {
  const [showApartmentModal, setShowApartmentModal] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[10000] flex items-center justify-center"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12.5px)',
        }}
        onClick={onClose}
      >
        <div
          className="bg-white rounded-[20px] p-6 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-normal mb-2">Проверка тех. доступа</h2>
          
          <p className="text-sm text-[rgba(16,16,16,0.25)] mb-4">
            Мы подготовили доступные тарифные планы. Пожалуйста, проверьте правильность
          </p>

          <button
            onClick={() => setShowApartmentModal(true)}
            className="w-full px-4 py-3 border border-[rgba(16,16,16,0.25)] rounded-[10px] text-left hover:bg-gray-50 transition-colors mb-4"
          >
            Выбрать квартиру
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-[rgba(16,16,16,0.15)] rounded-[10px] hover:bg-gray-50 transition-colors"
            >
              Назад
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-[#101010] text-white rounded-[10px] hover:bg-gray-800 transition-colors"
            >
              Далее
            </button>
          </div>
        </div>
      </div>

      {showApartmentModal && (
        <ApartmentSelectModal
          isOpen={showApartmentModal}
          onClose={() => setShowApartmentModal(false)}
        />
      )}
    </>
  );
}
