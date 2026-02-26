"use client";

import { Suspense, useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { OrderCard } from "@/components/orders/OrderCard";
import { Pagination } from "@/components/ui/Pagination";
import { fetchOrders, updateOrder as updateOrderApi } from "@/lib/api";
import { MOCK_ORDERS } from "@/lib/mockOrders";
import type { Order } from "@/types";

const PAGE_SIZE = 12;
const SCROLL_END_THRESHOLD_PX = 80;

function OrdersPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const statusParam = searchParams.get("status") ?? "";
  const searchParam = searchParams.get("search") ?? "";
  const pageParam = parseInt(searchParams.get("page") ?? "1", 10);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(pageParam);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSavesRef = useRef<Map<number, Order>>(new Map());

  useEffect(() => {
    setPage(Math.max(1, pageParam));
  }, [pageParam]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchOrders({ status: statusParam || undefined })
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray((res as { data?: Order[] }).data)
          ? (res as { data: Order[] }).data
          : [];
        setOrders(list);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [statusParam]);

  const sourceOrders = orders.length > 0 ? orders : MOCK_ORDERS;

  const filtered = useMemo(() => {
    if (!searchParam.trim()) return sourceOrders;
    const q = searchParam.trim();
    return sourceOrders.filter((o) =>
      String(o.id).includes(q)
    );
  }, [sourceOrders, searchParam]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const slice = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  );

  // При поиске по номеру сразу раскрывать первую найденную карточку (только при изменении поиска, не при обновлении заявки)
  const prevSearchRef = useRef(searchParam);
  useEffect(() => {
    if (prevSearchRef.current === searchParam) return;
    prevSearchRef.current = searchParam;
    if (searchParam.trim() && slice.length > 0) {
      setExpandedOrderId(slice[0].id);
    } else if (!searchParam.trim()) {
      setExpandedOrderId(null);
    }
  }, [searchParam, slice]);

  const handleOrderChange = useCallback((updated: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));

    pendingSavesRef.current.set(updated.id, updated);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null;
      const pending = new Map(pendingSavesRef.current);
      pendingSavesRef.current.clear();
      pending.forEach((order) => {
        const payload: Record<string, unknown> = { ...order };
        delete payload.tariff;
        delete payload.provider;
        updateOrderApi(order.id, payload).catch(() => {});
      });
    }, 600);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const handlePageChange = useCallback(
    (p: number) => {
      const safePage = Math.max(1, Math.min(p, totalPages));
      setPage(safePage);
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(safePage));
      router.push(`${pathname}?${params.toString()}`);
      if (scrollRef.current) scrollRef.current.scrollLeft = 0;
    },
    [router, pathname, searchParams, totalPages]
  );

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || slice.length === 0 || currentPage >= totalPages) return;
    const { scrollLeft, clientWidth, scrollWidth } = el;
    if (scrollLeft + clientWidth >= scrollWidth - SCROLL_END_THRESHOLD_PX) {
      handlePageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, slice.length, handlePageChange]);

  const paginationBlock = (
    <Pagination
      page={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  );

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 flex items-center justify-center py-12">
          <p className="text-muted-foreground">Загрузка заявок...</p>
        </div>
        <div style={{ flexShrink: 0, marginTop: 50 }}>{paginationBlock}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="relative shrink-0 overflow-x-auto overflow-y-hidden">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto overflow-y-hidden pb-2 scrollbar-hide"
          style={{ gap: 5 }}
        >
          {slice.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            return (
              <div
                key={order.id}
                role="button"
                tabIndex={0}
                onClick={() => setExpandedOrderId(order.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setExpandedOrderId(order.id);
                  }
                }}
                className="shrink-0 transition-[width] duration-200 ease-out"
                style={{ width: isExpanded ? 730 : 242 }}
              >
                <OrderCard order={order} isExpanded={isExpanded} onOrderChange={handleOrderChange} />
              </div>
            );
          })}
        </div>
        {slice.length > 0 && (
          <div
            className="absolute top-0 bottom-2 right-0 w-[60px] pointer-events-none"
            style={{
              background: "linear-gradient(to right, rgba(255,255,255,0), #ffffff)",
            }}
          />
        )}
        {filtered.length === 0 && (
          <p className="text-center py-8" style={{ fontFamily: "'TT Firs Neue', sans-serif", color: "rgba(16,16,16,0.5)" }}>
            Заявок не найдено
          </p>
        )}
      </div>
      <div style={{ flexShrink: 0, marginTop: 50 }}>{paginationBlock}</div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Загрузка заявок...
        </div>
      }
    >
      <OrdersPageContent />
    </Suspense>
  );
}
