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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-white/85 backdrop-blur-[12.5px]">
      <div className="bg-white rounded-[20px] p-6 max-w-md">
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
