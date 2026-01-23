'use client';

import { useState } from 'react';
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

  if (!isOpen) return null;

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
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-end justify-center"
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12.5px)',
        paddingBottom: '155px',
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
          transform: 'translateX(-50%)',
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
        }}
      >
        Нажмите в открытое пустое место, чтобы выйти из этого режима
      </div>

      {/* Основной контейнер модалки */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          boxSizing: 'border-box',
          position: 'relative',
          width: '360px',
          height: '350px',
          background: '#FFFFFF',
          border: '1px solid rgba(16, 16, 16, 0.15)',
          backdropFilter: 'blur(7.5px)',
          borderRadius: '20px',
          padding: '15px',
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
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
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
            <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
              <path
                d="M10 2L2 10L10 18"
                stroke="#101010"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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
