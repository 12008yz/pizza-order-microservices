'use client';

import { useState } from 'react';
import FilterProvidersModal from '../../modals/FilterProvidersModal';
import FilterServicesModal from '../../modals/FilterServicesModal';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterModal({ isOpen, onClose }: FilterModalProps) {
  const [showProvidersModal, setShowProvidersModal] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[10000] flex flex-col items-center overflow-hidden"
        style={{
          background: '#F5F5F5',
          backdropFilter: 'blur(12.5px)',
          paddingTop: 'var(--sat, 0px)',
          paddingBottom: 'calc(20px + var(--sab, 0px))',
          height: '100dvh',
          boxSizing: 'border-box',
        }}
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-[400px] flex flex-col h-full overflow-hidden bg-[#F5F5F5]"
          style={{ boxSizing: 'border-box' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Шапка: подсказка, всплывающие окна 75px от верха */}
          <div
            className="flex-shrink-0 cursor-pointer"
            style={{ minHeight: 105 }}
            onClick={onClose}
          >
            <div
              className="font-normal flex items-center justify-center text-center"
              style={{
                width: 240,
                margin: '0 auto',
                paddingTop: 75,
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
              width: '360px',
              maxWidth: '360px',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginTop: 'auto',
              marginBottom: 0,
              padding: '15px 15px 20px 15px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontFamily: 'TT Firs Neue, sans-serif',
                fontSize: '20px',
                lineHeight: '125%',
                color: '#101010',
                marginBottom: '15px',
              }}
            >
              Фильтрация
            </div>

            <div className="flex flex-col gap-[5px]" style={{ marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => setShowProvidersModal(true)}
                className="outline-none cursor-pointer rounded-[10px] text-left hover:bg-gray-50 transition-colors border border-[rgba(16,16,16,0.25)]"
                style={{
                  fontFamily: 'TT Firs Neue, sans-serif',
                  fontSize: '16px',
                  minHeight: '50px',
                  padding: '0 15px',
                }}
              >
                Выбрать операторов
              </button>

              <button
                type="button"
                onClick={() => setShowServicesModal(true)}
                className="outline-none cursor-pointer rounded-[10px] text-left hover:bg-gray-50 transition-colors border border-[rgba(16,16,16,0.25)]"
                style={{
                  fontFamily: 'TT Firs Neue, sans-serif',
                  fontSize: '16px',
                  minHeight: '50px',
                  padding: '0 15px',
                }}
              >
                Выбрать услуги
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-[10px] flex items-center justify-center text-white outline-none cursor-pointer"
              style={{
                background: '#101010',
                minHeight: '50px',
                fontFamily: 'TT Firs Neue, sans-serif',
                fontSize: '16px',
              }}
            >
              Применить
            </button>
          </div>
        </div>
      </div>

      {showProvidersModal && (
        <FilterProvidersModal
          isOpen={showProvidersModal}
          onClose={() => setShowProvidersModal(false)}
        />
      )}

      {showServicesModal && (
        <FilterServicesModal
          isOpen={showServicesModal}
          onClose={() => setShowServicesModal(false)}
        />
      )}
    </>
  );
}
