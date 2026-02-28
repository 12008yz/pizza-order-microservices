"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { AddressCard } from "@/components/addresses/AddressCard";
import { Pagination } from "@/components/ui/Pagination";
import { fetchOrders } from "@/lib/api";
import { MOCK_ORDERS } from "@/lib/mockOrders";
import type { Order, OrderAddress } from "@/types";

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

const CARDS_PER_PAGE = 8;

export default function AddressesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParam = searchParams.get("search") ?? "";
  const pageParam = parseInt(searchParams.get("page") ?? "1", 10);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(pageParam);

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / CARDS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const slice = useMemo(
    () => filtered.slice((currentPage - 1) * CARDS_PER_PAGE, currentPage * CARDS_PER_PAGE),
    [filtered, currentPage]
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

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-0 min-w-0">
        <div className="flex-1 flex items-center justify-center py-12">
          <p className="text-muted-foreground">Загрузка адресов...</p>
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
        {filtered.length === 0 ? (
          <p className="text-center py-8" style={{ fontFamily: "'TT Firs Neue', sans-serif", color: "rgba(16,16,16,0.5)" }}>
            Адресов не найдено
          </p>
        ) : (
          <div
            className="flex overflow-x-auto overflow-y-visible scrollbar-hide pb-6"
            style={{ gap: 5, alignItems: "flex-start" }}
          >
            {slice.map((addr) => (
              <AddressCard key={addr.id} address={addr} />
            ))}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0, marginTop: 50 }}>{paginationBlock}</div>
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
