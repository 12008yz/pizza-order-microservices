"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  value: string | number | null;
  options: SelectOption[];
  onChange: (value: string | number | null) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Стиль как у значения в карточке заявки */
  inline?: boolean;
  /** Открывать список вверх (для полей внизу колонки, напр. Компания) */
  placement?: "down" | "up";
  onOpenChange?: (open: boolean) => void;
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'TT Firs Neue', sans-serif",
  fontWeight: 400,
  fontSize: 16,
  lineHeight: "125%",
  color: "#101010",
};

/** Стиль значения в карточке: совпадает по высоте с <p style={valueStyle}> в OrderCard, чтобы ряд не «прыгал» при раскрытии. */
const inlineValueStyle: React.CSSProperties = {
  ...labelStyle,
  minHeight: 20,
  display: "flex",
  alignItems: "center",
  boxSizing: "border-box",
  margin: 0,
};

export function Select({
  value,
  options,
  onChange,
  placeholder = "—",
  disabled,
  inline,
  placement = "down",
  onOpenChange,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    minWidth: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const displayText = selectedOption?.label ?? (value != null && value !== "" ? String(value) : placeholder);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useLayoutEffect(() => {
    if (!open || !inline || !buttonRef.current) {
      setDropdownStyle(null);
      return;
    }
    const rect = buttonRef.current.getBoundingClientRect();
    const minWidth = Math.max(rect.width, 180);
    let left = rect.left;
    if (left + minWidth > window.innerWidth) left = window.innerWidth - minWidth;
    if (left < 0) left = 0;
    setDropdownStyle(
      placement === "up"
        ? { bottom: window.innerHeight - rect.top + 4, left, minWidth }
        : { top: rect.bottom + 4, left, minWidth }
    );
  }, [open, inline, placement]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSelect = (opt: SelectOption) => {
    onChange(opt.value);
    setOpen(false);
  };

  const dropdownContent = open && options.length > 0 && dropdownStyle && (
    <div
      ref={dropdownRef}
      role="listbox"
      className="fixed z-[9999] rounded-[10px] border border-[rgba(16,16,16,0.25)] bg-white shadow-lg overflow-hidden overflow-y-auto"
      style={{
        ...(dropdownStyle.top != null ? { top: dropdownStyle.top } : {}),
        ...(dropdownStyle.bottom != null ? { bottom: dropdownStyle.bottom } : {}),
        left: dropdownStyle.left,
        minWidth: dropdownStyle.minWidth,
        maxHeight: 240,
        boxSizing: "border-box",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <div
            key={opt.value}
            role="option"
            aria-selected={isSelected}
            onClick={() => handleSelect(opt)}
            className="flex items-center justify-between px-[12px] cursor-pointer w-full select-none hover:bg-[rgba(16,16,16,0.04)]"
            style={{
              minHeight: 40,
              boxSizing: "border-box",
              fontFamily: "'TT Firs Neue', sans-serif",
              fontWeight: 400,
              fontSize: 16,
              lineHeight: "125%",
              color: isSelected ? "#101010" : "rgba(16, 16, 16, 0.5)",
            }}
          >
            <span className="flex-1 truncate">{opt.label}</span>
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ml-2"
              style={{
                boxSizing: "border-box",
                background: isSelected ? "#101010" : "transparent",
                border: isSelected ? "none" : "1px solid rgba(16, 16, 16, 0.5)",
              }}
            >
              {isSelected && (
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                  <path
                    d="M1 3L3 5L7 1"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  if (inline) {
    return (
      <>
        <div ref={containerRef} className="relative" style={{ width: "100%" }}>
          <button
            ref={buttonRef}
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) setOpen((v) => !v);
            }}
            className={cn(
              "w-full text-left truncate outline-none cursor-pointer border-none bg-transparent p-0 m-0",
              disabled && "cursor-default opacity-70"
            )}
            style={inlineValueStyle}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label={displayText}
          >
            {displayText}
          </button>
        </div>
        {typeof document !== "undefined" && dropdownContent && createPortal(dropdownContent, document.body)}
      </>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={cn(
          "w-full rounded-[10px] border outline-none text-left px-[15px] cursor-pointer flex items-center justify-between min-h-[50px]",
          "border-[rgba(16,16,16,0.25)] hover:border-[rgba(16,16,16,0.5)]",
          disabled && "opacity-70 cursor-default"
        )}
        style={{ ...labelStyle, boxSizing: "border-box" }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{displayText}</span>
        <svg
          width="12"
          height="6"
          viewBox="0 0 12 6"
          fill="none"
          className="flex-shrink-0 ml-2 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path
            d="M0.11 5.34L5.7 0.11C5.78 0.04 5.89 0 6 0C6.11 0 6.22 0.04 6.3 0.11L11.89 5.34C11.96 5.42 12 5.51 12 5.61C12 5.72 11.96 5.81 11.88 5.89C11.8 5.96 11.7 6 11.59 6C11.48 6 11.37 5.96 11.29 5.89L6 0.95L0.71 5.89C0.63 5.96 0.52 6 0.41 6C0.3 6 0.19 5.96 0.11 5.89C0.04 5.81 0 5.72 0 5.61C0 5.51 0.04 5.42 0.11 5.34Z"
            fill="#101010"
          />
        </svg>
      </button>
      {open && options.length > 0 && (
        <div
          role="listbox"
          className="absolute left-0 right-0 z-[100] rounded-[10px] border border-[rgba(16,16,16,0.25)] bg-white overflow-hidden shadow-lg max-h-[240px] overflow-y-auto mt-1"
          style={{ boxSizing: "border-box" }}
          onClick={(e) => e.stopPropagation()}
        >
          {options.map((opt) => {
            const isSelected = value === opt.value;
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt)}
                className="flex items-center justify-between px-[15px] cursor-pointer w-full select-none hover:bg-[rgba(16,16,16,0.04)]"
                style={{
                  minHeight: 40,
                  boxSizing: "border-box",
                  fontFamily: "'TT Firs Neue', sans-serif",
                  fontWeight: 400,
                  fontSize: 16,
                  lineHeight: "125%",
                  color: isSelected ? "#101010" : "rgba(16, 16, 16, 0.5)",
                }}
              >
                <span className="flex-1 truncate">{opt.label}</span>
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ml-2"
                  style={{
                    boxSizing: "border-box",
                    background: isSelected ? "#101010" : "transparent",
                    border: isSelected ? "none" : "1px solid rgba(16, 16, 16, 0.5)",
                  }}
                >
                  {isSelected && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path
                        d="M1 3L3 5L7 1"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
