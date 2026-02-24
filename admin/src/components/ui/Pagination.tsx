"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const textStyle = {
  fontFamily: "'TT Firs Neue', sans-serif",
  fontWeight: 400,
  fontSize: 14,
  lineHeight: "145%",
  color: "#101010",
};

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const pages: number[] = [];
  const show = 6;
  let start = Math.max(1, page - Math.floor(show / 2));
  const end = Math.min(totalPages, start + show - 1);
  if (end - start + 1 < show) start = Math.max(1, end - show + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav
      className="flex items-center justify-center gap-2 mt-[50px]"
      style={{ width: 270, marginLeft: "auto", marginRight: "auto" }}
      aria-label="Переключение страниц"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="w-5 h-5 flex items-center justify-center border-0 bg-transparent cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed p-0"
        aria-label="Предыдущая страница"
      >
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transform: "rotate(90deg)" }}>
          <path d="M1 1L5 5L9 1" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className="w-[30px] h-[30px] rounded-full flex items-center justify-center border-0 cursor-pointer p-0 shrink-0"
          style={{
            ...textStyle,
            background: p === page ? "#F0F0F0" : "transparent",
          }}
          aria-label={p === page ? `Страница ${p}` : `Перейти на страницу ${p}`}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="w-5 h-5 flex items-center justify-center border-0 bg-transparent cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed p-0"
        aria-label="Следующая страница"
      >
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transform: "rotate(-90deg)" }}>
          <path d="M1 1L5 5L9 1" stroke="#101010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </nav>
  );
}
