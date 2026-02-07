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
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#F5F5F5] backdrop-blur-[12.5px] overflow-y-auto overflow-x-hidden"
      style={{ paddingTop: 'var(--sat, 0px)', paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div
className="bg-white rounded-[20px] p-6 w-full mx-4 overflow-y-auto"
      style={{ width: '360px', maxWidth: 'calc(100vw - 32px)', maxHeight: 'calc(100dvh - var(--sat, 0px) - var(--sab, 0px) - 80px)' }}
      >
        <h2 className="text-xl mb-4">Консультация</h2>
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
