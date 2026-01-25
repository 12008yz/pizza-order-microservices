'use client';

import { useState } from 'react';
import CheckboxOption from '../common/CheckboxOption';

interface FilterServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (selectedServices: string[]) => void;
}

const services = [
  { id: 'internet', name: 'Интернет' },
  { id: 'tv', name: 'ТВ' },
  { id: 'phone', name: 'Связь' },
  { id: 'mobile', name: 'Мобильная связь' },
  { id: 'iptv', name: 'IPTV' },
];

export default function FilterServicesModal({
  isOpen,
  onClose,
  onApply,
}: FilterServicesModalProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const handleToggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleApply = () => {
    if (onApply) {
      onApply(selectedServices);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center"
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12.5px)',
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[20px] p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-normal mb-4">Выбор услуг</h2>

        <div className="flex flex-col gap-3 mb-6">
          {services.map((service) => (
            <CheckboxOption
              key={service.id}
              label={service.name}
              checked={selectedServices.includes(service.id)}
              onChange={() => handleToggleService(service.id)}
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
