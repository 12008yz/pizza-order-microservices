'use client';

import React from 'react';

/** Высота зоны подсказки = как у header (одна линия по вертикали). Использовать в обёртках для top. */
export const HINT_TOP = 'var(--header-top, 50px)';

/** Стили по макету: 240×30, 14px, line-height 105%, цвет 0.25, всегда 2 строки */
const HINT_STYLE: React.CSSProperties = {
  width: '240px',
  minHeight: '40px',
  fontFamily: "'TT Firs Neue', sans-serif",
  fontStyle: 'normal',
  fontWeight: 400,
  fontSize: '14px',
  lineHeight: '105%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  color: 'rgba(16, 16, 16, 0.25)',
};

export interface ClickOutsideHintProps {
  /** Стили для обёртки (position, top, left и т.д.). По умолчанию: position absolute, left 50%, transform translateX(-50%), top 50px */
  wrapperStyle?: React.CSSProperties;
}

const DEFAULT_WRAPPER_STYLE: React.CSSProperties = {
  position: 'absolute',
  width: '240px',
  left: 'calc(50% - 240px / 2)',
  top: HINT_TOP,
};

export default function ClickOutsideHint({ wrapperStyle }: ClickOutsideHintProps) {
  return (
    <div style={{ ...DEFAULT_WRAPPER_STYLE, ...wrapperStyle }}>
      <div style={HINT_STYLE}>
        <span>Нажмите в открытое пустое место,</span>
        <span>чтобы выйти из этого режима</span>
      </div>
    </div>
  );
}

/** Только контент подсказки (без обёртки) — когда позиция задаётся родителем. Для выравнивания по header используйте top: HINT_TOP, left: 20, right: 20. */
export function ClickOutsideHintContent() {
  return (
    <div style={HINT_STYLE}>
      <span>Нажмите в открытое пустое место,</span>
      <span>чтобы выйти из этого режима</span>
    </div>
  );
}
