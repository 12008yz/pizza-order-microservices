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
  /** Макет фрейма: заголовок в списке (placeholder + стрелка вверх), опции 20px, border 0.5, круг 16px с галочкой */
  frameStyle?: boolean;
  /** Красная обводка при невалидной форме */
  invalid?: boolean;
  /** Показать внизу списка «Новое вкл...» с синим + */
  showAddNew?: boolean;
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'TT Firs Neue', sans-serif",
  fontWeight: 400,
  fontSize: 16,
  lineHeight: "125%",
  color: "#101010",
};

/** Стрелка: закрыт — вниз, открыт — вверх */
const ArrowIcon = ({ open }: { open: boolean }) => (
  <svg
    width="10"
    height="6"
    viewBox="0 0 10 6"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0 ml-2 transition-transform"
    style={{ transform: open ? "rotate(0deg)" : "rotate(180deg)" }}
    aria-hidden
  >
    <path
      d="M0.133303 5.14631L4.67843 0.146634C4.72064 0.100149 4.77077 0.063271 4.82595 0.0381107C4.88113 0.0129504 4.94027 4.42336e-07 5 4.37114e-07C5.05973 4.31892e-07 5.11887 0.0129504 5.17405 0.0381107C5.22923 0.063271 5.27936 0.100149 5.32157 0.146634L9.8667 5.14631C9.93033 5.21623 9.97368 5.30535 9.99125 5.40239C10.0088 5.49942 9.99981 5.60001 9.96538 5.69142C9.93095 5.78282 9.87264 5.86093 9.79783 5.91587C9.72302 5.9708 9.63508 6.00008 9.54513 6L0.454871 6C0.364925 6.00008 0.27698 5.9708 0.20217 5.91587C0.12736 5.86093 0.0690489 5.78282 0.0346184 5.69142C0.000187839 5.60001 -0.0088139 5.49942 0.00875372 5.40239C0.0263204 5.30535 0.0696658 5.21623 0.133303 5.14631Z"
      fill="#101010"
    />
  </svg>
);

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
  frameStyle = false,
  invalid = false,
  showAddNew = false,
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
      className="fixed z-[9999] rounded-[10px] border border-[rgba(16,16,16,0.25)] bg-white overflow-hidden overflow-y-auto"
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

  const triggerButton = (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && setOpen((v) => !v)}
      className={cn(
        "w-full border outline-none text-left cursor-pointer flex items-center justify-between min-h-[50px]",
        frameStyle && open ? "rounded-t-[10px] rounded-b-none" : "rounded-[10px]",
        !frameStyle && "border-[rgba(16,16,16,0.25)] hover:border-[rgba(16,16,16,0.5)]",
        disabled && "opacity-70 cursor-default",
        invalid && "invalid-select"
      )}
      style={{
        ...labelStyle,
        boxSizing: "border-box",
        paddingLeft: frameStyle ? 10 : 15,
        paddingRight: frameStyle ? 10 : 15,
        border:
          invalid
            ? "1px solid #FF3030"
            : frameStyle
              ? "1px solid rgba(16, 16, 16, 0.5)"
              : undefined,
        ...(frameStyle && open ? { height: 50, flexShrink: 0 } : {}),
      }}
      aria-haspopup="listbox"
      aria-expanded={open}
    >
      <span
        className="truncate"
        style={
          frameStyle && (open || value == null || value === "" || !selectedOption)
            ? { color: "rgba(16, 16, 16, 0.25)" }
            : undefined
        }
      >
        {frameStyle && open ? placeholder : displayText}
      </span>
      <ArrowIcon open={open} />
    </button>
  );

  const dropdownList = (
    <>
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <div
            key={opt.value}
            role="option"
            aria-selected={isSelected}
            onClick={() => handleSelect(opt)}
            className="flex items-center justify-between cursor-pointer w-full select-none hover:bg-[rgba(16,16,16,0.04)]"
            style={{
              minHeight: frameStyle ? 20 : 40,
              paddingLeft: frameStyle ? 0 : 15,
              paddingRight: frameStyle ? 0 : 15,
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
              className="rounded-full flex items-center justify-center flex-shrink-0 ml-2"
              style={{
                width: 16,
                height: 16,
                boxSizing: "border-box",
                background: isSelected ? "#101010" : "transparent",
                border: "1px solid rgba(16, 16, 16, 0.5)",
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
      {frameStyle && showAddNew && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 8,
            minHeight: 20,
            flexShrink: 0,
            boxSizing: "border-box",
            fontFamily: "'TT Firs Neue', sans-serif",
            fontWeight: 400,
            fontSize: 16,
            lineHeight: "125%",
            color: "#3b82f6",
            cursor: "pointer",
          }}
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") e.preventDefault(); }}
        >
          <span>Новое вкл...</span>
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#3b82f6",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v12M2 8h12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
        </div>
      )}
    </>
  );

  if (frameStyle && open && (options.length > 0 || showAddNew)) {
    return (
      <div ref={containerRef} className="relative" style={{ width: 155, height: 140 }}>
        <div
          className="flex flex-col rounded-[10px] border border-[rgba(16,16,16,0.5)] overflow-hidden bg-white"
          style={{ width: 155, height: 140, boxSizing: "border-box" }}
          onClick={(e) => e.stopPropagation()}
        >
          {triggerButton}
          <div
            role="listbox"
            className="overflow-y-auto scrollbar-hide flex flex-col flex-1 min-h-0"
            style={{ paddingTop: 0, paddingRight: 10, paddingBottom: 10, paddingLeft: 10, gap: 10 }}
          >
            {dropdownList}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {triggerButton}
      {open && (options.length > 0 || frameStyle || showAddNew) && !frameStyle && (
        <div
          role="listbox"
          className="absolute left-0 right-0 z-[100] bg-white rounded-[10px] overflow-y-auto mt-1 border border-[rgba(16,16,16,0.25)]"
          style={{
            boxSizing: "border-box",
            maxHeight: 240,
            padding: 15,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {dropdownList}
        </div>
      )}
    </div>
  );
}
