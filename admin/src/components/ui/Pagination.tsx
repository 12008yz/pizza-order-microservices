"use client";

import { Button } from "./Button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const pages: number[] = [];
  const show = 5;
  let start = Math.max(1, page - Math.floor(show / 2));
  const end = Math.min(totalPages, start + show - 1);
  if (end - start + 1 < show) start = Math.max(1, end - show + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav className="flex items-center justify-center gap-1 mt-6">
      <Button
        variant="secondary"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        ◀
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          variant={p === page ? "primary" : "secondary"}
          onClick={() => onPageChange(p)}
        >
          {p}
        </Button>
      ))}
      <Button
        variant="secondary"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        ▶
      </Button>
    </nav>
  );
}
