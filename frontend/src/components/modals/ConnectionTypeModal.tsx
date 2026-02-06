'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, CaretLeft } from '@phosphor-icons/react';
import { useAddress, ConnectionType } from '../../contexts/AddressContext';

interface ConnectionTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
}

const connectionTypes: { value: ConnectionType; label: string }[] = [
  { value: 'apartment', label: 'Подключение квартиры' },
  { value: 'private', label: 'Подключение частного сектора' },
  { value: 'office', label: 'Подключение офиса' },
];

export default function ConnectionTypeModal({
  isOpen,
  onClose,
  onNext,
}: ConnectionTypeModalProps) {
  const { addressData, updateConnectionType } = useAddress();
  const [selectedType, setSelectedType] = useState<ConnectionType>(addressData.connectionType);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Если был запущен таймер закрытия – сбрасываем его при новом изменении isOpen
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    if (isOpen) {
      // Открываем модалку
      setShouldRender(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      // Запускаем анимацию закрытия и откладываем размонтирование
      setIsAnimating(false);
      closeTimeoutRef.current = setTimeout(() => {
        setShouldRender(false);
        closeTimeoutRef.current = null;
      }, 300);
    }

    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    };
  }, [isOpen]);

  if (!shouldRender) return null;

  const handleSelect = (type: ConnectionType) => {
    setSelectedType(type);
    updateConnectionType(type);
  };

  const handleNext = () => {
    if (selectedType) {
      updateConnectionType(selectedType);
      onNext();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Закрываем модалку только при клике по полупрозрачному фону
    if (e.target === e.currentTarget) {
      onClose(); // наружу, дальше эффект по isOpen сам доведёт анимацию до конца
    }
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Клик по пустому месту внутри "экрана" (мимо белого блока) тоже закрывает модалку
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex flex-col items-center overflow-hidden"
      style={{
        background: '#F5F5F5',
        backdropFilter: 'blur(12.5px)',
        paddingTop: 'var(--sat, 0px)',
        paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
        height: '100dvh',
        boxSizing: 'border-box',
        opacity: isAnimating ? 1 : 0,
        transition: 'opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      onClick={handleBackdropClick}
    >
      {/* Контейнер — header и карточка влезают в экран, карточка прижата вниз */}
      <div
        className="relative w-full max-w-[400px] flex flex-col h-full overflow-hidden bg-[#F5F5F5]"
        style={{
          transform: isAnimating ? 'translateY(0)' : 'translateY(100px)',
          opacity: isAnimating ? 1 : 0,
          transition: 'opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxSizing: 'border-box',
        }}
        onClick={handleContainerClick}
      >
        {/* Шапка: подсказка — клик по пустому месту закрывает модалку */}
        <div
          className="flex-shrink-0 cursor-pointer"
          style={{ minHeight: '105px' }}
          onClick={() => onClose()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onClose()}
          aria-label="Закрыть"
        >
          <div
            className="font-normal flex items-center justify-center text-center"
            style={{
              width: '240px',
              margin: '0 auto',
              paddingTop: '75px',
              height: '30px',
              fontFamily: 'TT Firs Neue, sans-serif',
              fontSize: '14px',
              lineHeight: '105%',
              color: 'rgba(16, 16, 16, 0.15)',
              letterSpacing: '0.5px',
            }}
          >
            Нажмите в открытое пустое место, чтобы выйти из этого режима
          </div>
        </div>

        {/* Карточка по макету: 20px отступы по бокам, 360px ширина, padding 20px, radius 20px */}
        <div
          className="flex flex-col frame-card flex-shrink-0"
          style={{
            width: '360px',
            maxWidth: 'calc(100% - 40px)',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: 'auto',
            marginBottom: 0,
            backdropFilter: 'blur(7.5px)',
            maxHeight: 'min(420px, calc(100dvh - 145px))',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-shrink-0">
            <div
              className="font-normal"
              style={{
                fontFamily: 'TT Firs Neue, sans-serif',
                fontSize: '20px',
                lineHeight: '125%',
                color: '#101010',
              }}
            >
              Проверка тех. доступа
            </div>
            <div
              className="font-normal"
              style={{
                marginTop: '12px',
                fontFamily: 'TT Firs Neue, sans-serif',
                fontSize: '14px',
                lineHeight: '105%',
                color: 'rgba(16, 16, 16, 0.5)',
              }}
            >
              Мы подготовили доступные тарифные планы. Пожалуйста, проверьте правильность
            </div>
          </div>

          {/* Опции типов подключения — gap 5px, поле 50px, padding 15/16 */}
          <div className="overflow-y-auto overflow-x-hidden" style={{ marginTop: '20px', WebkitOverflowScrolling: 'touch' }}>
            <div className="flex flex-col" style={{ gap: '5px' }}>
              {connectionTypes.map((type) => (
                <div
                  key={type.value}
                  onClick={() => handleSelect(type.value)}
                  className="rounded-[10px] flex items-center justify-between cursor-pointer"
                  style={{
                    boxSizing: 'border-box',
                    minHeight: '50px',
                    height: '50px',
                    paddingLeft: '15px',
                    paddingRight: '16px',
                    border: selectedType === type.value
                      ? '1px solid rgba(16, 16, 16, 0.5)'
                      : '1px solid rgba(16, 16, 16, 0.25)',
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'TT Firs Neue, sans-serif',
                      fontWeight: 400,
                      fontSize: '16px',
                      lineHeight: '125%',
                      color: selectedType === type.value ? '#101010' : 'rgba(16, 16, 16, 0.5)',
                    }}
                  >
                    {type.label}
                  </span>
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      boxSizing: 'border-box',
                      background: selectedType === type.value ? '#101010' : 'transparent',
                      border: selectedType === type.value ? 'none' : '1px solid rgba(16, 16, 16, 0.5)',
                    }}
                  >
                    {selectedType === type.value && (
                      <Check size={10} weight="bold" color="white" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Кнопки навигации — по макету: отступ сверху 20px, кнопки 50px, gap 10px */}
          <div className="flex-shrink-0 flex gap-[10px]" style={{ marginTop: '20px' }}>
            <button
              onClick={onClose}
              className="rounded-[10px] flex items-center justify-center flex-shrink-0"
              style={{
                boxSizing: 'border-box',
                width: '50px',
                height: '50px',
                border: '1px solid rgba(16, 16, 16, 0.25)',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              <CaretLeft size={20} weight="regular" color="#101010" />
            </button>
            <button
              onClick={handleNext}
              disabled={!selectedType}
              className="flex-1 rounded-[10px] flex items-center justify-center text-center text-white disabled:cursor-not-allowed"
              style={{
                boxSizing: 'border-box',
                height: '50px',
                background: selectedType ? '#101010' : 'rgba(16, 16, 16, 0.25)',
                border: 'none',
                fontFamily: 'TT Firs Neue, sans-serif',
                fontWeight: 400,
                fontSize: '16px',
                cursor: selectedType ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s ease',
              }}
            >
              Далее
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
