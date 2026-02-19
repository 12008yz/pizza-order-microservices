"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { OrderCard } from "@/components/orders/OrderCard";
import { Pagination } from "@/components/ui/Pagination";
import { fetchOrders } from "@/lib/api";
import type { Order } from "@/types";

const PAGE_SIZE = 12;

function OrdersPageContent() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") ?? "";
  const searchParam = searchParams.get("search") ?? "";
  const pageParam = parseInt(searchParams.get("page") ?? "1", 10);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(Math.max(1, pageParam));

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchOrders({ status: statusParam || undefined })
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray((res as { data?: Order[] }).data)
          ? (res as { data: Order[] }).data
          : [];
        setOrders(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "Ошибка загрузки заявок");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [statusParam]);

  const filtered = useMemo(() => {
    if (!searchParam.trim()) return orders;
    const q = searchParam.trim().toLowerCase();
    return orders.filter(
      (o) =>
        String(o.id).toLowerCase().includes(q) ||
        o.phone?.replace(/\D/g, "").includes(q.replace(/\D/g, "")) ||
        o.addressString?.toLowerCase().includes(q) ||
        o.fullName?.toLowerCase().includes(q)
    );
  }, [orders, searchParam]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const slice = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  );

  const handlePageChange = (p: number) => {
    setPage(p);
    const url = new URL(window.location.href);
    url.searchParams.set("page", String(p));
    window.history.pushState({}, "", url.toString());
  };

  if (error) {
    return (
      <div className="rounded-card border border-error bg-error/5 p-4 text-error">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Загрузка заявок...</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {slice.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-8">Заявок не найдено</p>
      )}
      {totalPages > 1 && (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </>
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
