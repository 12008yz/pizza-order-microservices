'use client';

import { useState, useEffect, useMemo } from 'react';
import AnimatedCheck from '../common/AnimatedCheck';

interface ApartmentSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (entrance: number, apartment: number) => void;
}

type Step = 'entrance' | 'apartment';

const ENTRANCE_MIN = 1;
const ENTRANCE_MAX = 20;
const APARTMENT_MIN = 1;
const APARTMENT_MAX = 999;

export default function ApartmentSelectModal({
  isOpen,
  onClose,
  onComplete,
}: ApartmentSelectModalProps) {
  const [step, setStep] = useState<Step>('entrance');
  const [entrance, setEntrance] = useState<number>(ENTRANCE_MIN);
  const [apartment, setApartment] = useState<number>(APARTMENT_MIN);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [scrollOffset, setScrollOffset] = useState(0);

  const entranceSuggestions = useMemo(
    () =>
      Array.from({ length: ENTRANCE_MAX - ENTRANCE_MIN + 1 }, (_, i) => ({
        id: i + ENTRANCE_MIN,
        text: `Подъезд ${i + ENTRANCE_MIN}`,
        value: i + ENTRANCE_MIN,
      })),
    []
  );

  const apartmentSuggestions = useMemo(
    () =>
      Array.from({ length: APARTMENT_MAX - APARTMENT_MIN + 1 }, (_, i) => ({
        id: i + APARTMENT_MIN,
        text: `Кв. ${i + APARTMENT_MIN}`,
        value: i + APARTMENT_MIN,
      })),
    []
  );

  const suggestions = step === 'entrance' ? entranceSuggestions : apartmentSuggestions;
  const hasSuggestions = suggestions.length > 0;
  const maxVisible = 3;

  // Сброс при открытии модалки
  useEffect(() => {
    if (isOpen) {
      setStep('entrance');
      setEntrance(ENTRANCE_MIN);
      setApartment(APARTMENT_MIN);
      setSelectedIndex(0);
      setScrollOffset(0);
    }
  }, [isOpen]);

  // Синхронизация selectedIndex с entrance/apartment при смене шага
  useEffect(() => {
    if (step === 'entrance') {
      setSelectedIndex(entrance - ENTRANCE_MIN);
      setScrollOffset(0);
    } else {
      const idx = apartment - APARTMENT_MIN;
      setSelectedIndex(idx);
      setScrollOffset(Math.max(0, Math.min(idx - maxVisible + 1, suggestions.length - maxVisible)));
    }
  }, [step, entrance, apartment, suggestions.length]);

  const handleScrollUp = () => {
    if (suggestions.length === 0) return;

    if (selectedIndex <= 0) return;

    const newIndex = selectedIndex - 1;
    setSelectedIndex(newIndex);

    if (step === 'entrance') {
      setEntrance(entranceSuggestions[newIndex].value);
    } else {
      setApartment(apartmentSuggestions[newIndex].value);
    }

    if (newIndex < scrollOffset) {
      setScrollOffset(newIndex);
    }
  };

  const handleScrollDown = () => {
    if (suggestions.length === 0) return;

    if (selectedIndex >= suggestions.length - 1) return;

    const newIndex = selectedIndex + 1;
    setSelectedIndex(newIndex);

    if (step === 'entrance') {
      setEntrance(entranceSuggestions[newIndex].value);
    } else {
      setApartment(apartmentSuggestions[newIndex].value);
    }

    if (newIndex >= scrollOffset + maxVisible) {
      setScrollOffset(newIndex - maxVisible + 1);
    }
  };

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    if (step === 'entrance') {
      setEntrance(entranceSuggestions[index].value);
    } else {
      setApartment(apartmentSuggestions[index].value);
    }
  };

  const handleNext = () => {
    if (step === 'entrance') {
      setStep('apartment');
      setSelectedIndex(apartment - APARTMENT_MIN);
      const idx = apartment - APARTMENT_MIN;
      if (idx >= maxVisible) {
        setScrollOffset(idx - maxVisible + 1);
      } else {
        setScrollOffset(0);
      }
    } else {
      if (onComplete) {
        onComplete(entrance, apartment);
      }
      onClose();
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete(entrance, apartment);
    }
    onClose();
  };

  const visibleSuggestions = suggestions.slice(scrollOffset, scrollOffset + maxVisible);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[10001] flex flex-col items-center overflow-hidden"
      style={{
        background: '#F5F5F5',
        backdropFilter: 'blur(12.5px)',
        paddingTop: 'var(--sat, 0px)',
        paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
        height: '100dvh',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[360px] flex flex-col h-full overflow-hidden bg-[#F5F5F5]"
        style={{ boxSizing: 'border-box' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка: подсказка */}
        <div
          className="flex-shrink-0 cursor-pointer"
          style={{ minHeight: '105px' }}
          onClick={onClose}
        >
          <div
            className="font-normal flex items-center justify-center text-center"
            style={{
              width: '240px',
              margin: '0 auto',
              paddingTop: 'var(--header-zone, 90px)',
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

        {/* Карточка */}
        <div
          className="flex flex-col rounded-[20px] bg-white overflow-hidden"
          style={{
            width: '360px',
            maxWidth: 'calc(100% - 40px)',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: 'auto',
            marginBottom: '20px',
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
              marginBottom: '4px',
            }}
          >
            Выбор квартиры
          </div>

          <p
            style={{
              fontFamily: 'TT Firs Neue, sans-serif',
              fontSize: '14px',
              lineHeight: '105%',
              color: 'rgba(16, 16, 16, 0.25)',
              marginBottom: '15px',
            }}
          >
            {step === 'entrance'
              ? 'Выберите подъезд'
              : 'Выберите номер квартиры'}
          </p>

          {/* Список подсказок — как в AddressInputModal */}
          <div
            className="rounded-[10px] border border-[rgba(16,16,16,0.25)] overflow-hidden mb-[15px]"
            style={{ minHeight: '40px' }}
          >
            {visibleSuggestions.map((suggestion, localIndex) => {
              const realIndex = scrollOffset + localIndex;
              const isSelected = selectedIndex === realIndex;
              return (
                <div
                  key={suggestion.id}
                  role="option"
                  tabIndex={-1}
                  onClick={() => handleSelect(realIndex)}
                  className="flex items-center justify-between px-[15px] cursor-pointer w-full select-none"
                  style={{
                    boxSizing: 'border-box',
                    minHeight: visibleSuggestions.length === 1 ? 50 : 40,
                    transition: 'background-color 0.2s ease',
                    backgroundColor: 'transparent',
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                    WebkitTapHighlightColor: 'transparent',
                    caretColor: 'transparent',
                  }}
                >
                  <span
                    className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap select-none flex items-center"
                    style={{
                      fontFamily: 'TT Firs Neue, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      fontSize: '16px',
                      lineHeight: '125%',
                      color: isSelected ? '#101010' : 'rgba(16, 16, 16, 0.5)',
                      WebkitUserSelect: 'none',
                      userSelect: 'none',
                      caretColor: 'transparent',
                    }}
                  >
                    {suggestion.text}
                  </span>
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ml-2"
                    style={{
                      boxSizing: 'border-box',
                      background: isSelected ? '#101010' : 'transparent',
                      border: isSelected ? 'none' : '1px solid rgba(16, 16, 16, 0.5)',
                    }}
                  >
                    {isSelected && <AnimatedCheck size={8} color="#FFFFFF" strokeWidth={1.5} />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Кнопки навигации — стрелки + основная кнопка как в AddressInputModal */}
          <div className="flex items-center gap-[5px]">
            <button
              type="button"
              tabIndex={-1}
              onClick={handleScrollUp}
              onPointerDown={(e) => e.currentTarget.blur()}
              disabled={!hasSuggestions || selectedIndex <= 0}
              className="rounded-[10px] flex items-center justify-center flex-shrink-0 w-[50px] h-[50px] border border-[rgba(16,16,16,0.15)] bg-transparent disabled:opacity-25 select-none"
              style={{
                cursor: hasSuggestions && selectedIndex > 0 ? 'pointer' : 'default',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                caretColor: 'transparent',
              }}
            >
              <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(180deg)' }}>
                <path d="M0.112544 5.34082L5.70367 0.114631C5.7823 0.0412287 5.88888 -5.34251e-07 6 -5.24537e-07C6.11112 -5.14822e-07 6.2177 0.0412287 6.29633 0.114631L11.8875 5.34082C11.9615 5.41513 12.0019 5.5134 11.9999 5.61495C11.998 5.7165 11.954 5.81338 11.8772 5.8852C11.8004 5.95701 11.6967 5.99815 11.5881 5.99994C11.4794 6.00173 11.3743 5.96404 11.2948 5.8948L6 0.946249L0.705204 5.8948C0.625711 5.96404 0.520573 6.00173 0.411936 5.99994C0.3033 5.99815 0.199649 5.95701 0.12282 5.88519C0.04599 5.81338 0.00198176 5.71649 6.48835e-05 5.61495C-0.00185199 5.5134 0.0384722 5.41513 0.112544 5.34082Z" fill="#101010" />
              </svg>
            </button>
            <button
              type="button"
              tabIndex={-1}
              onClick={handleScrollDown}
              onPointerDown={(e) => e.currentTarget.blur()}
              disabled={!hasSuggestions || selectedIndex >= suggestions.length - 1}
              className="rounded-[10px] flex items-center justify-center flex-shrink-0 w-[50px] h-[50px] border border-[rgba(16,16,16,0.15)] bg-transparent disabled:opacity-25 select-none"
              style={{
                cursor: hasSuggestions && selectedIndex < suggestions.length - 1 ? 'pointer' : 'default',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                caretColor: 'transparent',
              }}
            >
              <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.112544 5.34082L5.70367 0.114631C5.7823 0.0412287 5.88888 -5.34251e-07 6 -5.24537e-07C6.11112 -5.14822e-07 6.2177 0.0412287 6.29633 0.114631L11.8875 5.34082C11.9615 5.41513 12.0019 5.5134 11.9999 5.61495C11.998 5.7165 11.954 5.81338 11.8772 5.8852C11.8004 5.95701 11.6967 5.99815 11.5881 5.99994C11.4794 6.00173 11.3743 5.96404 11.2948 5.8948L6 0.946249L0.705204 5.8948C0.625711 5.96404 0.520573 6.00173 0.411936 5.99994C0.3033 5.99815 0.199649 5.95701 0.12282 5.88519C0.04599 5.81338 0.00198176 5.71649 6.48835e-05 5.61495C-0.00185199 5.5134 0.0384722 5.41513 0.112544 5.34082Z" fill="#101010" />
              </svg>
            </button>
            <button
              type="button"
              tabIndex={-1}
              onClick={handleNext}
              onPointerDown={(e) => e.currentTarget.blur()}
              className="flex-1 rounded-[10px] flex items-center justify-center text-center text-white min-h-[50px] max-h-[50px] select-none"
              style={{
                boxSizing: 'border-box',
                height: 50,
                minHeight: 50,
                maxHeight: 50,
                background: '#101010',
                border: '1px solid rgba(16, 16, 16, 0.25)',
                fontFamily: 'TT Firs Neue, sans-serif',
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: 1,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                caretColor: 'transparent',
              }}
            >
              {step === 'entrance' ? 'Далее' : 'Применить'}
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-[10px] px-4 py-3 border border-[rgba(16,16,16,0.15)] rounded-[10px] hover:bg-gray-50 transition-colors"
            style={{
              fontFamily: 'TT Firs Neue, sans-serif',
              fontSize: '16px',
              minHeight: '50px',
            }}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
