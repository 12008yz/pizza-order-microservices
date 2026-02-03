'use client';

import { useState } from 'react';
import NumberInput from '../common/NumberInput';

interface ApartmentSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (entrance: number, apartment: number) => void;
}

export default function ApartmentSelectModal({
  isOpen,
  onClose,
  onComplete,
}: ApartmentSelectModalProps) {
  const [entrance, setEntrance] = useState<number>(1);
  const [apartment, setApartment] = useState<number>(1);

  const handleComplete = () => {
    if (onComplete) {
      onComplete(entrance, apartment);
    }
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
        <h2 className="text-xl font-normal mb-2">Выбор квартиры</h2>
        
        <p className="text-sm text-[rgba(16,16,16,0.25)] mb-4">
          Укажите подъезд и номер квартиры
        </p>

        <div className="flex flex-col gap-4 mb-6">
          <div>
            <label className="block text-sm text-[rgba(16,16,16,0.5)] mb-2">
              Подъезд
            </label>
            <NumberInput
              value={entrance}
              onChange={setEntrance}
              min={1}
              max={20}
            />
          </div>

          <div>
            <label className="block text-sm text-[rgba(16,16,16,0.5)] mb-2">
              Номер квартиры
            </label>
            <NumberInput
              value={apartment}
              onChange={setApartment}
              min={1}
              max={999}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-[rgba(16,16,16,0.15)] rounded-[10px] hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 px-4 py-3 bg-[#101010] text-white rounded-[10px] hover:bg-gray-800 transition-colors"
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  );
}
