'use client';

// Заглушка для модального окна выбора способа связи: Max/Telegram/Звонок (Frame 2)
// TODO: Реализовать модальное окно для выбора способа связи

interface ContactMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (method: 'max' | 'telegram' | 'call') => void;
}

export default function ContactMethodModal({
  isOpen,
  onClose,
  onSelect,
}: ContactMethodModalProps) {
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
        <h2 className="text-xl mb-4">Выбор способа связи</h2>
        <div className="space-y-2 mb-4">
          <button
            onClick={() => onSelect('max')}
            className="w-full px-4 py-2 border border-gray-300 rounded-[10px] hover:bg-gray-50"
          >
            Max
          </button>
          <button
            onClick={() => onSelect('telegram')}
            className="w-full px-4 py-2 border border-gray-300 rounded-[10px] hover:bg-gray-50"
          >
            Telegram
          </button>
          <button
            onClick={() => onSelect('call')}
            className="w-full px-4 py-2 border border-gray-300 rounded-[10px] hover:bg-gray-50"
          >
            Звонок
          </button>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-[10px]"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}
