'use client';

import React from 'react';

/** Стили по макету: 240×30, 14px, line-height 105%, цвет 0.25, всегда 2 строки */
const HINT_STYLE: React.CSSProperties = {
  width: '240px',
  minHeight: '30px',
  fontFamily: 'TT Firs Neue, sans-serif',
  fontStyle: 'normal',
  fontWeight: 400,
  fontSize: '14px',
  lineHeight: '105%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  color: 'rgba(16, 16, 16, 0.25)',
};

export interface ClickOutsideHintProps {
  /** Стили для обёртки (position, top, left и т.д.). По умолчанию: position absolute, left 50%, transform translateX(-50%), top 75px */
  wrapperStyle?: React.CSSProperties;
}

const DEFAULT_WRAPPER_STYLE: React.CSSProperties = {
  position: 'absolute',
  width: '240px',
  left: 'calc(50% - 240px / 2)',
  top: '75px',
};

export default function ClickOutsideHint({ wrapperStyle }: ClickOutsideHintProps) {
  return (
    <div style={{ ...DEFAULT_WRAPPER_STYLE, ...wrapperStyle }}>
      <div style={HINT_STYLE}>
        Нажмите в открытое пустое место,
        <br />
        чтобы выйти из этого режима
      </div>
    </div>
  );
}

/** Только контент подсказки (без обёртки) — когда позиция задаётся родителем */
export function ClickOutsideHintContent() {
  return (
    <div style={HINT_STYLE}>
      Нажмите в открытое пустое место,
      <br />
      чтобы выйти из этого режима
    </div>
  );
}
