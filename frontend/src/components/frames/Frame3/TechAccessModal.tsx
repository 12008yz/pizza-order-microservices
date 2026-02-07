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
        className="fixed inset-0 z-[10000] flex flex-col items-center overflow-hidden"
        style={{
          background: '#F5F5F5',
          backdropFilter: 'blur(12.5px)',
          paddingTop: 'var(--sat, 0px)',
          paddingBottom: 'var(--sab, 0px)',
          height: '100dvh',
          boxSizing: 'border-box',
        }}
        onClick={onClose}
      >
        {/* Контейнер — header и карточка, карточка прижата вниз */}
        <div
          className="relative w-full max-w-[400px] flex flex-col h-full overflow-hidden bg-[#F5F5F5]"
          style={{ boxSizing: 'border-box' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Шапка: подсказка, всплывающие окна 120px от верха */}
          <div
            className="flex-shrink-0 cursor-pointer"
            style={{ minHeight: 150 }}
            onClick={onClose}
          >
            <div
              className="font-normal flex items-center justify-center text-center"
              style={{
                width: 240,
                margin: '0 auto',
                paddingTop: 120,
                height: 30,
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

          {/* Карточка — прижата вниз, 20px от низа за счёт paddingBottom оверлея (как в Frame2) */}
          <div
            className="flex flex-col rounded-[20px] bg-white mx-[5%]"
            style={{
              maxWidth: '360px',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginTop: 'auto',
              marginBottom: 0,
              padding: '15px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="font-normal"
              style={{
                fontFamily: 'TT Firs Neue, sans-serif',
                fontSize: '20px',
                lineHeight: '125%',
                color: '#101010',
                marginBottom: '15px',
              }}
            >
              Проверка тех. доступа
            </div>

            <p
              style={{
                fontFamily: 'TT Firs Neue, sans-serif',
                fontSize: '14px',
                lineHeight: '105%',
                color: 'rgba(16, 16, 16, 0.25)',
                marginBottom: '20px',
              }}
            >
              Мы подготовили доступные тарифные планы. Пожалуйста, проверьте правильность
            </p>

            <button
              type="button"
              onClick={() => setShowApartmentModal(true)}
              className="outline-none cursor-pointer w-full px-4 py-3 border border-[rgba(16,16,16,0.25)] rounded-[10px] text-left hover:bg-gray-50 transition-colors mb-[15px]"
              style={{
                fontFamily: 'TT Firs Neue, sans-serif',
                fontSize: '16px',
                minHeight: '50px',
              }}
            >
              Выбрать квартиру
            </button>

            <div className="flex gap-[10px]">
              <button
                type="button"
                onClick={onClose}
                className="outline-none cursor-pointer flex-1 px-4 py-3 border border-[rgba(16,16,16,0.15)] rounded-[10px] hover:bg-gray-50 transition-colors"
                style={{
                  fontFamily: 'TT Firs Neue, sans-serif',
                  fontSize: '16px',
                  minHeight: '50px',
                }}
              >
                Назад
              </button>
              <button
                type="button"
                onClick={onClose}
                className="outline-none cursor-pointer flex-1 px-4 py-3 bg-[#101010] text-white rounded-[10px] hover:bg-gray-800 transition-colors"
                style={{
                  fontFamily: 'TT Firs Neue, sans-serif',
                  fontSize: '16px',
                  minHeight: '50px',
                }}
              >
                Далее
              </button>
            </div>
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
