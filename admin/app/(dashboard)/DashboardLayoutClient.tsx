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
    <div className="flex h-screen flex-col">
      <Header
        search={search}
        onSearchChange={setSearch}
        showSearch={pathname.startsWith("/orders")}
      />
      <div className="flex flex-1 min-h-0">
        <Sidebar status={status} onStatusChange={handleStatusChange} />
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
}
