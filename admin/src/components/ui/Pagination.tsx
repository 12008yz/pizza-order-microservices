"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PAGINATION_WIDTH_PX = 270;
const PAGINATION_HEIGHT_PX = 30;
const ARROW_SIZE_PX = 20;
const PAGE_CIRCLE_SIZE_PX = 30;
const NUMBER_STYLE: React.CSSProperties = {
  fontFamily: "'TT Firs Neue', sans-serif",
  fontStyle: "normal",
  fontWeight: 400,
  fontSize: 14,
  lineHeight: "145%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#101010",
};

const ArrowSvg = ({ left }: { left: boolean }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    style={{ transform: left ? "rotate(90deg)" : "rotate(-90deg)", flexShrink: 0 }}
    aria-hidden
  >
    <path
      d="M3 4L6 8L9 4"
      stroke="#101010"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function LeftArrow({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex items-center justify-center border-0 bg-transparent cursor-pointer disabled:cursor-not-allowed p-0 shrink-0 text-[#101010]"
      style={{
        width: ARROW_SIZE_PX,
        height: ARROW_SIZE_PX,
        minWidth: ARROW_SIZE_PX,
        minHeight: ARROW_SIZE_PX,
        opacity: disabled ? 0.25 : 1,
      }}
      aria-label="Предыдущая страница"
    >
      <ArrowSvg left />
    </button>
  );
}

function RightArrow({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex items-center justify-center border-0 bg-transparent cursor-pointer disabled:cursor-not-allowed p-0 shrink-0 text-[#101010]"
      style={{
        width: ARROW_SIZE_PX,
        height: ARROW_SIZE_PX,
        minWidth: ARROW_SIZE_PX,
        minHeight: ARROW_SIZE_PX,
        opacity: disabled ? 0.25 : 1,
      }}
      aria-label="Следующая страница"
    >
      <ArrowSvg left={false} />
    </button>
  );
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const show = 6;
  let start = Math.max(1, page - Math.floor(show / 2));
  const end = Math.min(totalPages, start + show - 1);
  if (end - start + 1 < show) start = Math.max(1, end - show + 1);
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav
      className="flex items-center justify-center"
      style={{
        width: PAGINATION_WIDTH_PX,
        height: PAGINATION_HEIGHT_PX,
        marginLeft: "auto",
        marginRight: "auto",
        gap: 10,
      }}
      aria-label="Переключение страниц"
    >
      <LeftArrow disabled={page <= 1} onClick={() => onPageChange(page - 1)} />
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className="rounded-full flex items-center justify-center border-0 cursor-pointer p-0 shrink-0"
          style={{
            width: PAGE_CIRCLE_SIZE_PX,
            height: PAGE_CIRCLE_SIZE_PX,
            ...NUMBER_STYLE,
            background: p === page ? "#F0F0F0" : "transparent",
          }}
          aria-label={p === page ? `Страница ${p}` : `Перейти на страницу ${p}`}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </button>
      ))}
      <RightArrow disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} />
    </nav>
  );
}
