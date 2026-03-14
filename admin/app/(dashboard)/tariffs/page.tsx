"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { TariffCard } from "@/components/tariffs/TariffCard";
import { Carousel, type CarouselApi } from "@/components/ui/Carousel";
import { Pagination } from "@/components/ui/Pagination";
import { fetchTariffs } from "@/lib/api";
import { MOCK_TARIFFS } from "@/lib/mockTariffs";
import type { Tariff } from "@/types";

const CARD_WIDTH = 240;
const CARD_GAP_PX = 5;

function getCardsPerPage(viewportWidthPx: number): number {
  if (viewportWidthPx <= 0) return 1;
  const cardWithGap = CARD_WIDTH + CARD_GAP_PX;
  const reservePx = 60;
  const safeWidth = Math.max(0, viewportWidthPx - reservePx);
  return Math.max(1, Math.floor(safeWidth / cardWithGap));
}

export default function TariffsPage() {
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search") ?? "";
  const viewportRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<CarouselApi>(null);

  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setViewportWidth(w);
    };
    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0]?.contentRect ?? {};
      if (typeof width === "number" && width > 0) setViewportWidth(width);
    });
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, []);

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

  const filtered = useMemo(() => {
    if (!searchParam.trim()) return tariffs;
    const q = searchParam.trim().toLowerCase();
    return tariffs.filter((t) => {
      const name = (t.name ?? "").toLowerCase();
      const desc = (t.description ?? "").toLowerCase();
      const tech = (t.technology ?? "").toLowerCase();
      const providerName = ((t as Tariff & { provider?: { name: string } }).provider?.name ?? "").toLowerCase();
      return name.includes(q) || desc.includes(q) || tech.includes(q) || providerName.includes(q);
    });
  }, [tariffs, searchParam]);

  const effectiveWidth = viewportWidth > 0 ? viewportWidth : (typeof window !== "undefined" ? window.innerWidth : 1200);
  const cardsPerPage = getCardsPerPage(effectiveWidth);
  const totalPages = Math.max(1, Math.ceil(filtered.length / cardsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  const handleScrollIndexChange = useCallback(
    (index: number) => {
      const page = Math.min(totalPages, 1 + Math.floor(index / cardsPerPage));
      setCurrentPage(page);
    },
    [cardsPerPage, totalPages]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      const targetPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(targetPage);
      carouselRef.current?.scrollToSlide((targetPage - 1) * cardsPerPage);
    },
    [cardsPerPage, totalPages]
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
      </div>
    );
  }

  return (
    <div className="flex flex-col min-w-0">
      <div
        className="relative min-w-0 w-full"
        style={{ minHeight: 560, marginBottom: -50 }}
      >
        {filtered.length === 0 ? (
          <p className="text-center py-8" style={{ fontFamily: "'TT Firs Neue', sans-serif", color: "rgba(16,16,16,0.5)" }}>
            Тарифов не найдено
          </p>
        ) : (
          <>
            <div ref={viewportRef} className="min-w-0 w-full">
              <Carousel
                ref={carouselRef}
                options={{ axis: "x", dragFree: true, align: "start" }}
                gap={CARD_GAP_PX}
                viewportClassName="pb-6"
                containerClassName="pb-6"
                showArrows={false}
                overflowY="visible"
                onScrollIndexChange={handleScrollIndexChange}
              >
                {filtered.map((t) => (
                  <div key={t.id} className="shrink-0 flex-[0_0_auto]">
                    <TariffCard tariff={t} />
                  </div>
                ))}
              </Carousel>
            </div>
            {totalPages > 1 && (
              <div
                style={{
                  marginTop: 50,
                  width: "100vw",
                  position: "relative",
                  left: -305,
                  marginLeft: 0,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Pagination page={safePage} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            )}
            <div
              className="absolute top-0 bottom-2 right-0 w-[100px] pointer-events-none"
              style={{
                background: "linear-gradient(to right, rgba(245,245,245,0), #F5F5F5)",
              }}
            />
          </>
        )}
      </div>
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
