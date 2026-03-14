"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AddressCard } from "@/components/addresses/AddressCard";
import { Carousel, type CarouselApi } from "@/components/ui/Carousel";
import { Pagination } from "@/components/ui/Pagination";
import { fetchOrders } from "@/lib/api";
import { MOCK_ORDERS } from "@/lib/mockOrders";
import type { Order, OrderAddress } from "@/types";

const CARD_WIDTH = 240;
const CARD_GAP_PX = 5;

function getCardsPerPage(viewportWidthPx: number): number {
  if (viewportWidthPx <= 0) return 1;
  const cardWithGap = CARD_WIDTH + CARD_GAP_PX;
  const reservePx = 60;
  const safeWidth = Math.max(0, viewportWidthPx - reservePx);
  return Math.max(1, Math.floor(safeWidth / cardWithGap));
}

function parseAddressParts(s: string | null | undefined): { settlement: string; space: string; house: string } {
  if (!s?.trim()) return { settlement: "", space: "", house: "" };
  const raw = s.split(",").map((p) => p.trim());
  return {
    settlement: raw[0] ?? "",
    space: raw[1] ?? "",
    house: raw[2] ?? "",
  };
}

function orderToCategory(connectionType: string | null | undefined): string {
  if (connectionType === "private") return "Частный сектор";
  if (connectionType === "office") return "Офис";
  return "Жилое, кв.";
}

/** Форматирует номер дома: "9 к 6" → "д. 9 к 6", уже "д. 9" не дублируем. */
function formatHouseNumber(house: string): string {
  if (!house?.trim()) return "—";
  const t = house.trim();
  if (t.toLowerCase().startsWith("д.")) return t;
  return `д. ${t}`;
}

/** Уникальные адреса из списка заявок (по населённому пункту + пространство + дом; при наличии buildingId — по нему). Заявки без адреса и без buildingId не попадают в список. */
function uniqueAddressesFromOrders(orders: Order[]): OrderAddress[] {
  const seen = new Map<string, OrderAddress>();
  for (const o of orders) {
    const { settlement, space, house } = parseAddressParts(o.addressString);
    const hasAddress = o.buildingId != null || settlement || space || house;
    if (!hasAddress) continue;
    const key = o.buildingId != null
      ? `b_${o.buildingId}`
      : `a_${[settlement, space, house].join("\0").toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.set(key, {
      id: key,
      category: orderToCategory(o.connectionType),
      settlementName: settlement || "—",
      spaceName: space || "—",
      houseNumber: formatHouseNumber(house),
      entrances: o.entrance ?? null,
      floors: o.floor ?? null,
      apartments: null,
    });
  }
  return Array.from(seen.values());
}

export default function AddressesPage() {
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search") ?? "";
  const viewportRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<CarouselApi>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
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
    fetchOrders({})
      .then((res) => {
        if (cancelled) return;
        const raw = (res as { data?: Order[] }).data ?? (Array.isArray(res) ? res : []);
        const list = Array.isArray(raw) ? raw : [];
        setOrders(list);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const sourceOrders = orders.length > 0 ? orders : MOCK_ORDERS;
  const addresses = useMemo(() => uniqueAddressesFromOrders(sourceOrders), [sourceOrders]);

  const filtered = useMemo(() => {
    if (!searchParam.trim()) return addresses;
    const q = searchParam.trim().toLowerCase();
    return addresses.filter(
      (a) =>
        a.settlementName.toLowerCase().includes(q) ||
        a.spaceName.toLowerCase().includes(q) ||
        a.houseNumber.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }, [addresses, searchParam]);

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

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-0 min-w-0">
        <div className="flex-1 flex items-center justify-center py-12">
          <p className="text-muted-foreground">Загрузка адресов...</p>
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
            Адресов не найдено
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
                {filtered.map((addr) => (
                  <div key={addr.id} className="shrink-0 flex-[0_0_auto]">
                    <AddressCard address={addr} />
                  </div>
                ))}
              </Carousel>
            </div>
            {totalPages > 1 && (
              <div style={{ marginTop: 24 }}>
                <Pagination page={safePage} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            )}
          </>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-4" style={{ flexShrink: 0, marginTop: 16 }}>
        <Link
          href="/addresses/new"
          className="rounded-input bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          + Проникновение
        </Link>
      </div>
    </div>
  );
}
