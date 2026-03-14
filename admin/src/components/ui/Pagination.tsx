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
/** Фон выделенной страницы (Ellipse 1 в макете) */
const PAGE_ACTIVE_BG = "#F0F0F0";
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
    width="6"
    height="10"
    viewBox="0 0 6 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ transform: left ? "scaleX(-1)" : undefined, flexShrink: 0 }}
    aria-hidden
  >
    <path
      d="M0.659175 0.0937862L5.88537 4.75306C5.95877 4.81858 6 4.9074 6 5C6 5.0926 5.95877 5.18142 5.88537 5.24694L0.659176 9.90621C0.584872 9.96794 0.486596 10.0015 0.38505 9.99995C0.283505 9.99835 0.186619 9.96167 0.114804 9.89765C0.0429895 9.83363 0.00185271 9.74725 6.10509e-05 9.65672C-0.00173061 9.56619 0.0359627 9.47857 0.105199 9.41233L5.05375 5L0.105199 0.58767C0.0359623 0.521427 -0.001731 0.433811 6.06438e-05 0.343281C0.00185229 0.252751 0.0429891 0.166375 0.114804 0.10235C0.186618 0.0383258 0.283504 0.00165165 0.38505 5.43426e-05C0.486595 -0.00154296 0.584872 0.0320602 0.659175 0.0937862Z"
      fill="#101010"
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
            background: p === page ? PAGE_ACTIVE_BG : "transparent",
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
