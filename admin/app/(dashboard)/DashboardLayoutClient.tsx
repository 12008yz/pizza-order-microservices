"use client";

import { useCallback, useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const statusFromUrl = searchParams.get("status") ?? "";
  const searchFromUrl = searchParams.get("search") ?? "";
  const [status, setStatus] = useState(statusFromUrl);
  const [search, setSearch] = useState(searchFromUrl);
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
  }, [pathname, searchParams]);

  const handleStatusChange = useCallback((s: string) => {
    setStatus(s);
    const url = new URL(pathname, window.location.origin);
    if (s) url.searchParams.set("status", s);
    else url.searchParams.delete("status");
    if (searchParams.get("search")) url.searchParams.set("search", searchParams.get("search")!);
    if (searchParams.get("page")) url.searchParams.set("page", searchParams.get("page")!);
    window.history.replaceState({}, "", url.toString());
  }, [pathname, searchParams]);

  // Не скрываем layout при загрузке/проверке авторизации — сайдбар и шапка всегда на месте
  const showContent = !loading && isAuthenticated;

  return (
    <div
      className="flex h-screen flex-col bg-[#F5F5F5]"
      style={{ paddingLeft: 60, paddingTop: 40, paddingRight: 0, paddingBottom: 50, boxSizing: "border-box" }}
    >
      <div className="flex flex-1 min-h-0" style={{ gap: 5 }}>
        <Sidebar status={status} onStatusChange={handleStatusChange} pathname={pathname} />
        <div
          className={`flex-1 flex flex-col min-w-0 min-h-0 ${pathname.startsWith("/addresses") ? "overflow-y-auto" : ""}`}
          style={{ gap: 5 }}
        >
          <div className="shrink-0 min-w-0 w-full" style={{ paddingRight: 60 }}>
            <Header
              search={search}
              onSearchChange={setSearch}
              showSearch={pathname.startsWith("/orders") || pathname.startsWith("/addresses") || pathname.startsWith("/tariffs")}
              searchPlaceholder={pathname.startsWith("/addresses") ? "Искать по параметрам и тарифным планам..." : undefined}
            />
          </div>
          <main
            className={pathname.startsWith("/addresses") ? "flex flex-col flex-none min-h-0" : "flex-1 flex flex-col min-h-0 overflow-auto"}
            style={{
              paddingTop: 0,
              paddingRight: 0,
              paddingBottom: pathname.startsWith("/addresses") ? 24 : 5,
              paddingLeft: 0,
            }}
          >
            {showContent ? children : (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-muted-foreground">Загрузка...</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
