"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { TariffCard } from "@/components/tariffs/TariffCard";
import { Pagination } from "@/components/ui/Pagination";
import { fetchTariffs } from "@/lib/api";
import { MOCK_TARIFFS } from "@/lib/mockTariffs";
import type { Tariff } from "@/types";

const CARDS_PER_PAGE = 8;

export default function TariffsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const pageParam = parseInt(searchParams.get("page") ?? "1", 10);

  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(pageParam);

  useEffect(() => {
    let cancelled = false;
    fetchTariffs()
      .then((res: unknown) => {
        if (cancelled) return;
        const data = res as { success?: boolean; data?: Tariff[] };
        setTariffs(Array.isArray(data?.data) ? data.data : []);
      })
      .catch(() => {
        if (!cancelled) {
          setTariffs(MOCK_TARIFFS);
          setError(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const totalPages = Math.max(1, Math.ceil(tariffs.length / CARDS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const slice = useMemo(
    () => tariffs.slice((currentPage - 1) * CARDS_PER_PAGE, currentPage * CARDS_PER_PAGE),
    [tariffs, currentPage]
  );

  useEffect(() => {
    setPage(Math.max(1, Math.min(pageParam, totalPages || 1)));
  }, [pageParam, totalPages]);

  useEffect(() => {
    if (totalPages >= 1 && page > totalPages) {
      setPage(totalPages);
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(totalPages));
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [totalPages, page, router, pathname, searchParams]);

  const handlePageChange = useCallback(
    (p: number) => {
      const safePage = Math.max(1, Math.min(p, totalPages));
      setPage(safePage);
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(safePage));
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams, totalPages]
  );

  const paginationBlock = (
    <Pagination
      page={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  );

  if (error) {
    return (
      <div className="flex flex-col flex-1 min-h-0 min-w-0">
        <p className="text-error">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-0 min-w-0">
        <div className="flex-1 flex items-center justify-center py-12">
          <p className="text-muted-foreground">Загрузка тарифов...</p>
        </div>
        <div style={{ flexShrink: 0, marginTop: 50 }}>{paginationBlock}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-w-0">
      <div
        className="relative min-w-0 w-full overflow-x-auto overflow-y-visible"
        style={{ minHeight: 560, marginBottom: -50 }}
      >
        {tariffs.length === 0 ? (
          <p className="text-center py-8" style={{ fontFamily: "'TT Firs Neue', sans-serif", color: "rgba(16,16,16,0.5)" }}>
            Тарифов не найдено
          </p>
        ) : (
          <>
            <div
              className="flex overflow-x-auto overflow-y-visible scrollbar-hide pb-6"
              style={{ gap: 5, alignItems: "flex-start" }}
            >
              {slice.map((t) => (
                <TariffCard key={t.id} tariff={t} />
              ))}
            </div>
            <div
              className="absolute top-0 bottom-2 right-0 w-[100px] pointer-events-none"
              style={{
                background: "linear-gradient(to right, rgba(245,245,245,0), #F5F5F5)",
              }}
            />
          </>
        )}
      </div>
      <div style={{ flexShrink: 0, marginTop: 50 }}>{paginationBlock}</div>
      <div className="flex flex-wrap items-center justify-end gap-4" style={{ flexShrink: 0, marginTop: 16 }}>
        <Link
          href="/tariffs/new"
          className="rounded-input bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          + Предложение
        </Link>
      </div>
    </div>
  );
}
