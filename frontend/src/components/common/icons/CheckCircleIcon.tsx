/** Галочка в карточке тарифа (Frame3 и др.): белый фон, чёрный border, чёрная галочка */
export default function CheckCircleIcon() {
  return (
    <span className="relative inline-flex items-center justify-center" style={{ width: 16, height: 16 }}>
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#FFFFFF',
          border: '1px solid #101010',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden>
          <path d="M1 3L3 5L7 1" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </span>
  );
}
