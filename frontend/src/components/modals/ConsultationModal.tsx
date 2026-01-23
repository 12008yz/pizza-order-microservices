'use client';

// Заглушка для модального окна "Бесплатная консультация" (Frame 2)
// TODO: Реализовать модальное окно для бесплатной консультации

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function ConsultationModal({
  isOpen,
  onClose,
  onComplete,
}: ConsultationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-white/85 backdrop-blur-[12.5px]">
      <div className="bg-white rounded-[20px] p-6 max-w-md">
        <h2 className="text-xl mb-4">Бесплатная консультация</h2>
        <p className="text-gray-600 mb-4">Модальное окно в разработке</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-[#101010] text-white rounded-[10px]"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
