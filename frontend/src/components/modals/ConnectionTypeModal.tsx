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
      className="fixed inset-0 z-[10000] flex items-end justify-center"
      style={{
        background: '#F5F5F5',
        backdropFilter: 'blur(12.5px)',
        paddingBottom: '155px',
        opacity: isAnimating ? 1 : 0,
        transition: 'opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      onClick={handleBackdropClick}
    >
      {/* Подсказка сверху */}
      <div
        style={{
          position: 'absolute',
          width: '240px',
          height: '30px',
          left: '50%',
          transform: isAnimating ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-10px)',
          top: '75px',
          fontFamily: 'TT Firs Neue, sans-serif',
          fontStyle: 'normal',
          fontWeight: 400,
          fontSize: '14px',
          lineHeight: '105%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: 'rgba(16, 16, 16, 0.15)',
          opacity: isAnimating ? 1 : 0,
          transition: 'opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        Нажмите в открытое пустое место, чтобы выйти из этого режима
      </div>

      {/* Основной контейнер модалки */}
      <div
        onClick={handleContainerClick}
        style={{
          boxSizing: 'border-box',
          position: 'relative',
          width: '360px',
          height: '350px',
          background: '#FFFFFF',
          backdropFilter: 'blur(7.5px)',
          borderRadius: '20px',
          padding: '15px',
          overflow: 'hidden',
          transform: isAnimating ? 'translateY(0)' : 'translateY(100px)',
          opacity: isAnimating ? 1 : 0,
          transition: 'opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Заголовок */}
        <div
          style={{
            width: '330px',
            height: '25px',
            fontFamily: 'TT Firs Neue, sans-serif',
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: '20px',
            lineHeight: '125%',
            display: 'flex',
            alignItems: 'center',
            color: '#101010',
          }}
        >
          Проверка тех. доступа
        </div>

        {/* Подзаголовок */}
        <div
          style={{
            width: '330px',
            height: '30px',
            marginTop: '15px',
            fontFamily: 'TT Firs Neue, sans-serif',
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '105%',
            color: 'rgba(16, 16, 16, 0.25)',
          }}
        >
          Мы подготовили доступные тарифные планы. Пожалуйста, проверьте правильность
        </div>

        {/* Опции типов подключения */}
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {connectionTypes.map((type) => (
            <div
              key={type.value}
              onClick={() => handleSelect(type.value)}
              style={{
                boxSizing: 'border-box',
                width: '330px',
                height: '50px',
                border: selectedType === type.value
                  ? '1px solid #101010'
                  : '1px solid rgba(16, 16, 16, 0.25)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 15px',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease',
                position: 'relative',
                top: type.value === 'private' ? '-3px' : type.value === 'office' ? '-7px' : '0px',
              }}
            >
              <span
                style={{
                  fontFamily: 'TT Firs Neue, sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  fontSize: '16px',
                  lineHeight: '125%',
                  color: selectedType === type.value ? '#101010' : 'rgba(16, 16, 16, 0.5)',
                }}
              >
                {type.label}
              </span>

              {/* Radio кнопка */}
              <div
                style={{
                  boxSizing: 'border-box',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: selectedType === type.value ? '#101010' : 'transparent',
                  border: selectedType === type.value
                    ? 'none'
                    : '1px solid rgba(16, 16, 16, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {selectedType === type.value && (
                  <Check size={10} weight="bold" color="white" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Кнопки навигации */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '15px',
            right: '15px',
            display: 'flex',
            gap: '10px',
          }}
        >
          {/* Кнопка "Назад" */}
          <button
            onClick={onClose}
            style={{
              boxSizing: 'border-box',
              width: '48px',
              height: '48px',
              border: '1px solid rgba(16, 16, 16, 0.15)',
              borderRadius: '10px',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <CaretLeft size={20} weight="regular" color="#101010" />
          </button>

          {/* Кнопка "Далее" */}
          <button
            onClick={handleNext}
            disabled={!selectedType}
            style={{
              boxSizing: 'border-box',
              flex: 1,
              height: '51px',
              marginRight: '-3px',
              position: 'relative',
              background: selectedType ? '#101010' : 'rgba(16, 16, 16, 0.25)',
              border: '1px solid rgba(16, 16, 16, 0.25)',
              borderRadius: '10px',
              fontFamily: 'TT Firs Neue, sans-serif',
              fontStyle: 'normal',
              fontWeight: 400,
              fontSize: '17px',
              lineHeight: '315%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: '#FFFFFF',
              cursor: selectedType ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s ease',
            }}
          >
            Далее
          </button>
        </div>
      </div>
    </div>
  );
}
