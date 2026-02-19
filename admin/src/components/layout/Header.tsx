"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { clearAuth } from "@/lib/auth";

interface HeaderProps {
  search?: string;
  onSearchChange?: (v: string) => void;
  showSearch?: boolean;
}

export function Header({ search = "", onSearchChange, showSearch = true }: HeaderProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange?.(localSearch.trim());
    if (localSearch.trim()) {
      router.push(`/orders?search=${encodeURIComponent(localSearch.trim())}`);
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="h-14 border-b border-border bg-foreground text-background flex items-center px-4 gap-4 shrink-0">
      {showSearch && (
        <form onSubmit={handleSubmit} className="flex-1 max-w-xl flex gap-2">
          <Input
            type="search"
            placeholder="Искать по номерам и адресам..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="bg-background text-foreground border-background/20 placeholder:text-muted-foreground"
          />
          <Button type="submit" variant="secondary" className="!bg-background/20 !text-background border-background/30">
            Найти
          </Button>
        </form>
      )}
      <div className="flex items-center gap-2">
        <Link href="/orders/new" className="text-sm font-medium hover:underline">
          +77
        </Link>
        <Button variant="ghost" className="!text-background hover:!bg-white/20" onClick={handleLogout}>
          Выход
        </Button>
      </div>
    </header>
  );
}
