"use client";

import { useCallback, useState } from "react";
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

  const handleStatusChange = useCallback((s: string) => {
    setStatus(s);
    const url = new URL(pathname, window.location.origin);
    if (s) url.searchParams.set("status", s);
    else url.searchParams.delete("status");
    if (searchParams.get("search")) url.searchParams.set("search", searchParams.get("search")!);
    if (searchParams.get("page")) url.searchParams.set("page", searchParams.get("page")!);
    window.history.replaceState({}, "", url.toString());
  }, [pathname, searchParams]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen flex-col bg-white"
      style={{ paddingLeft: 60, paddingTop: 40, paddingBottom: 120, boxSizing: "border-box" }}
    >
      <div className="flex flex-1 min-h-0" style={{ gap: 5 }}>
        <Sidebar status={status} onStatusChange={handleStatusChange} pathname={pathname} />
        <div className="flex-1 flex flex-col min-w-0 min-h-0" style={{ gap: 5 }}>
          <Header
            search={search}
            onSearchChange={setSearch}
            showSearch={pathname.startsWith("/orders")}
          />
          <main className="flex-1 overflow-auto min-h-0 px-4 pb-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
