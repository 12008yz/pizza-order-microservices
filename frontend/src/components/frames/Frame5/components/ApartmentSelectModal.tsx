'use client';

import React, { useState, useEffect, useRef } from 'react';
import BaseModal from '../../../modals/BaseModal';
import type { ApartmentOption } from '../types';

interface ApartmentSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: ApartmentOption[];
  selectedId: string | null;
  onSelect: (apartmentId: string, apartmentNumber: string, floor?: number) => void;
  initialFloor?: number | null;
}

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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalSelectedId(selectedId);
      const selected = options.find((o) => o.id === selectedId);
      setInputValue(selected ? selected.number : '');
      setShowSuggestions(false);
    }
  }, [isOpen, selectedId, options]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filteredOptions = inputValue.trim()
    ? options.filter((opt) => opt.number.toLowerCase().includes(inputValue.trim().toLowerCase()))
    : [];

  const handleSelectOption = (opt: ApartmentOption) => {
    setLocalSelectedId(opt.id);
    setInputValue(opt.number);
    setShowSuggestions(false);
  };

  const handleNext = () => {
    const selected = options.find((o) => o.id === localSelectedId);
    if (selected) {
      onSelect(selected.id, selected.number, initialFloor ?? undefined);
    }
    onClose();
  };

  const canSubmit = Boolean(localSelectedId);

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} backdropBlur hideHint>
      <div
        ref={containerRef}
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

        <div className="relative mb-[15px]">
          <input
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
            onFocus={() => {
              if (inputValue.trim()) setShowSuggestions(true);
            }}
            placeholder="Номер квартиры"
            className="w-full rounded-[10px] outline-none border box-border bg-white"
            style={{
              height: 50,
              paddingLeft: 15,
              paddingRight: 16,
              border: '1px solid rgba(16, 16, 16, 0.5)',
              fontFamily: 'TT Firs Neue, sans-serif',
              fontSize: '16px',
              lineHeight: '125%',
              color: '#101010',
            }}
            aria-autocomplete="list"
            aria-expanded={showSuggestions && filteredOptions.length > 0}
          />
          {showSuggestions && filteredOptions.length > 0 && (
            <div
              className="absolute left-0 right-0 top-full z-10 mt-1 rounded-[10px] overflow-hidden border border-[rgba(16,16,16,0.25)] bg-white shadow-lg"
              style={{ maxHeight: 200, overflowY: 'auto' }}
            >
              {filteredOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  className="w-full text-left flex items-center justify-between cursor-pointer border-0 outline-none bg-transparent hover:bg-[rgba(16,16,16,0.05)]"
                  style={{
                    height: 44,
                    padding: '12px 15px',
                    borderBottom: '1px solid rgba(16, 16, 16, 0.1)',
                    fontFamily: 'TT Firs Neue, sans-serif',
                    fontSize: '16px',
                    color: '#101010',
                  }}
                >
                  кв. {opt.number}
                  {localSelectedId === opt.id && (
                    <div
                      className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: '#101010' }}
                    >
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3L3 5L7 1" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={!canSubmit}
          className="w-full rounded-[10px] flex items-center justify-center text-white outline-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          style={{
            height: 50,
            background: canSubmit ? '#101010' : 'rgba(16, 16, 16, 0.25)',
            border: '1px solid rgba(16, 16, 16, 0.25)',
            fontFamily: 'TT Firs Neue, sans-serif',
            fontSize: '16px',
          }}
        >
          Далее
        </button>
      </div>
    </BaseModal>
  );
}
