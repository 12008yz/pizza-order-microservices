'use client';

import React, { useState, useEffect, useRef } from 'react';
import BaseModal from '../../../modals/BaseModal';
import AnimatedCheck from '../../../common/AnimatedCheck';
import type { ApartmentOption } from '../types';

interface ApartmentSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: ApartmentOption[];
  selectedId: string | null;
  onSelect: (apartmentId: string, apartmentNumber: string, floor?: number) => void;
  initialFloor?: number | null;
}

const ArrowUpSvg = () => (
  <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(180deg)' }}>
    <path d="M0.112544 5.34082L5.70367 0.114631C5.7823 0.0412287 5.88888 -5.34251e-07 6 -5.24537e-07C6.11112 -5.14822e-07 6.2177 0.0412287 6.29633 0.114631L11.8875 5.34082C11.9615 5.41513 12.0019 5.5134 11.9999 5.61495C11.998 5.7165 11.954 5.81338 11.8772 5.8852C11.8004 5.95701 11.6967 5.99815 11.5881 5.99994C11.4794 6.00173 11.3743 5.96404 11.2948 5.8948L6 0.946249L0.705204 5.8948C0.625711 5.96404 0.520573 6.00173 0.411936 5.99994C0.3033 5.99815 0.199649 5.95701 0.12282 5.88519C0.04599 5.81338 0.00198176 5.71649 6.48835e-05 5.61495C-0.00185199 5.5134 0.0384722 5.41513 0.112544 5.34082Z" fill="#101010" />
  </svg>
);

const ArrowDownSvg = () => (
  <svg width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.112544 5.34082L5.70367 0.114631C5.7823 0.0412287 5.88888 -5.34251e-07 6 -5.24537e-07C6.11112 -5.14822e-07 6.2177 0.0412287 6.29633 0.114631L11.8875 5.34082C11.9615 5.41513 12.0019 5.5134 11.9999 5.61495C11.998 5.7165 11.954 5.81338 11.8772 5.8852C11.8004 5.95701 11.6967 5.99815 11.5881 5.99994C11.4794 6.00173 11.3743 5.96404 11.2948 5.8948L6 0.946249L0.705204 5.8948C0.625711 5.96404 0.520573 6.00173 0.411936 5.99994C0.3033 5.99815 0.199649 5.95701 0.12282 5.88519C0.04599 5.81338 0.00198176 5.71649 6.48835e-05 5.61495C-0.00185199 5.5134 0.0384722 5.41513 0.112544 5.34082Z" fill="#101010" />
  </svg>
);

export default function ApartmentSelectModal({
  isOpen,
  onClose,
  options,
  selectedId,
  onSelect,
  initialFloor = null,
}: ApartmentSelectModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(selectedId);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevIsOpenRef = useRef(false);

  // Сброс только при открытии модалки. Не при каждом изменении options (родитель часто передаёт новый массив при ре-рендере).
  useEffect(() => {
    if (isOpen) {
      if (!prevIsOpenRef.current) {
        prevIsOpenRef.current = true;
        setLocalSelectedId(selectedId);
        const selected = options.find((o) => o.id === selectedId);
        setInputValue(selected ? selected.number : '');
        setShowSuggestions(false);
        setSelectedIndex(0);
      }
    } else {
      prevIsOpenRef.current = false;
    }
  }, [isOpen, selectedId, options]);

  const filteredOptions = inputValue.trim()
    ? options.filter((opt) => opt.number.toLowerCase().includes(inputValue.trim().toLowerCase()))
    : options;

  // Синхронизация selectedIndex с localSelectedId при изменении ввода или выбора
  useEffect(() => {
    if (filteredOptions.length === 0) return;
    const idx = localSelectedId
      ? filteredOptions.findIndex((o) => o.id === localSelectedId)
      : -1;
    setSelectedIndex(idx >= 0 ? idx : 0);
  }, [inputValue, localSelectedId, options]);

  const handleSelectOption = (opt: ApartmentOption) => {
    setShowSuggestions(false);
    onSelect(opt.id, opt.number, initialFloor ?? undefined);
    onClose();
  };

  const handleScrollUp = () => {
    if (filteredOptions.length === 0) return;
    const newIndex = selectedIndex <= 0 ? filteredOptions.length - 1 : selectedIndex - 1;
    setSelectedIndex(newIndex);
    const opt = filteredOptions[newIndex];
    setLocalSelectedId(opt.id);
    setInputValue(opt.number);
  };

  const handleScrollDown = () => {
    if (filteredOptions.length === 0) return;
    const newIndex = selectedIndex >= filteredOptions.length - 1 ? 0 : selectedIndex + 1;
    setSelectedIndex(newIndex);
    const opt = filteredOptions[newIndex];
    setLocalSelectedId(opt.id);
    setInputValue(opt.number);
  };

  const handleNext = () => {
    const selected = options.find((o) => o.id === localSelectedId);
    if (selected) {
      onSelect(selected.id, selected.number, initialFloor ?? undefined);
    }
    onClose();
  };

  const canSubmit = Boolean(localSelectedId);
  const hasSuggestions = filteredOptions.length > 0;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} backdropBlur hideHint>
      <div
        className="flex flex-col rounded-[20px] bg-white"
        style={{
          width: 360,
          maxWidth: 'calc(100vw - 40px)',
          padding: 15,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '20px',
            lineHeight: '125%',
            color: '#101010',
            marginBottom: 10,
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
            marginBottom: 15,
          }}
        >
          Мы подготовили доступные тарифные планы. Пожалуйста, проверьте правильность
        </p>

        {/* Список подсказок сверху, поле ввода снизу — как в AddressInputModal */}
        {showSuggestions && filteredOptions.length > 0 && (
          <div
            className="rounded-[10px] border border-[rgba(16,16,16,0.25)] overflow-hidden mb-[5px]"
            style={{
              minHeight: '40px',
              maxHeight: 200,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {filteredOptions.map((opt) => {
              const isSelected = localSelectedId === opt.id;
              return (
                <div
                  key={opt.id}
                  role="option"
                  tabIndex={-1}
                  onClick={() => handleSelectOption(opt)}
                  className="flex items-center justify-between px-[15px] cursor-pointer w-full select-none"
                  style={{
                    boxSizing: 'border-box',
                    minHeight: filteredOptions.length === 1 ? 50 : 40,
                    transition: 'background-color 0.2s ease',
                    backgroundColor: 'transparent',
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                    WebkitTapHighlightColor: 'transparent',
                    caretColor: 'transparent',
                  }}
                >
                  <span
                    className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap select-none"
                    style={{
                      fontFamily: 'TT Firs Neue, sans-serif',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '125%',
                      letterSpacing: '1.2px',
                      color: isSelected ? '#101010' : 'rgba(16, 16, 16, 0.5)',
                      WebkitUserSelect: 'none',
                      userSelect: 'none',
                      caretColor: 'transparent',
                    }}
                  >
                    кв. {opt.number}
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
        )}

        <div className="flex-shrink-0 mb-[10px]">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
              const val = e.target.value.trim();
              const match = options.find((o) => o.number === val);
              setLocalSelectedId(match ? match.id : null);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Номер квартиры"
            className="w-full rounded-[10px] outline-none box-border bg-white px-[15px]"
            style={{
              boxSizing: 'border-box',
              height: '50px',
              border: '1px solid #101010',
              fontFamily: 'TT Firs Neue, sans-serif',
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '125%',
              color: '#101010',
            }}
            aria-autocomplete="list"
            aria-expanded={showSuggestions && filteredOptions.length > 0}
          />
        </div>

        {/* Кнопки навигации — стрелки + Далее (клик по ним не закрывает подсказки) */}
        <div className="flex items-center gap-[5px]">
          <button
            type="button"
            tabIndex={-1}
            onClick={handleScrollUp}
            onPointerDown={(e) => e.currentTarget.blur()}
            onFocus={(e) => { e.currentTarget.blur(); inputRef.current?.focus(); }}
            disabled={!hasSuggestions}
            className="rounded-[10px] flex items-center justify-center flex-shrink-0 w-[50px] h-[50px] border border-[rgba(16,16,16,0.15)] bg-transparent disabled:opacity-25 select-none"
            style={{
              cursor: hasSuggestions ? 'pointer' : 'default',
              WebkitUserSelect: 'none',
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent',
              caretColor: 'transparent',
            }}
          >
            <ArrowUpSvg />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onClick={handleScrollDown}
            onPointerDown={(e) => e.currentTarget.blur()}
            onFocus={(e) => { e.currentTarget.blur(); inputRef.current?.focus(); }}
            disabled={!hasSuggestions}
            className="rounded-[10px] flex items-center justify-center flex-shrink-0 w-[50px] h-[50px] border border-[rgba(16,16,16,0.15)] bg-transparent disabled:opacity-25 select-none"
            style={{
              cursor: hasSuggestions ? 'pointer' : 'default',
              WebkitUserSelect: 'none',
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent',
              caretColor: 'transparent',
            }}
          >
            <ArrowDownSvg />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onClick={handleNext}
            onPointerDown={(e) => e.currentTarget.blur()}
            onFocus={(e) => { e.currentTarget.blur(); inputRef.current?.focus(); }}
            disabled={!canSubmit}
            className="flex-1 rounded-[10px] flex items-center justify-center text-center text-white min-h-[50px] max-h-[50px] disabled:cursor-not-allowed disabled:opacity-70 select-none"
            style={{
              boxSizing: 'border-box',
              height: 50,
              minHeight: 50,
              maxHeight: 50,
              background: canSubmit ? '#101010' : 'rgba(16, 16, 16, 0.25)',
              border: '1px solid rgba(16, 16, 16, 0.25)',
              fontFamily: 'TT Firs Neue, sans-serif',
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: 1,
              WebkitUserSelect: 'none',
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent',
              caretColor: 'transparent',
            }}
          >
            Далее
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
