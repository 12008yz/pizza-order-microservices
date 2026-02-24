"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

  const barStyle: React.CSSProperties = {
    height: 70,
    minHeight: 70,
    background: "#FFFFFF",
    border: "1px solid rgba(16, 16, 16, 0.15)",
    backdropFilter: "blur(7.5px)",
    WebkitBackdropFilter: "blur(7.5px)",
    borderRadius: 20,
    boxSizing: "border-box",
  };

  const circleStyle: React.CSSProperties = {
    width: 30,
    height: 30,
    border: "1px solid rgba(16, 16, 16, 0.15)",
    borderRadius: 15,
    boxSizing: "border-box",
  };

  const CIRCLE_GAP_PX = 5;
  const circles = [
    "blue",
    "empty",
    "empty",
    "empty",
    "empty",
    "red",
    "empty",
    "empty",
    "empty",
  ] as const;

  return (
    <header
      className="flex items-center shrink-0"
      style={{
        ...barStyle,
        paddingLeft: 20,
        paddingRight: 20,
        gap: 12,
      }}
    >
      {showSearch && (
        <form onSubmit={handleSubmit} className="flex-1 flex items-center min-w-0" style={{ gap: 12 }}>
          <svg className="shrink-0 text-[#101010]" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M7 12A5 5 0 1 0 7 2a5 5 0 0 0 0 10zm4.5-1.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="Искать по номерам и адресам ..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="flex-1 min-w-0 bg-transparent border-0 outline-none placeholder:text-[rgba(16,16,16,0.25)]"
            style={{
              fontFamily: "'TT Firs Neue', sans-serif",
              fontSize: 14,
              lineHeight: "145%",
              color: "#101010",
            }}
          />
        </form>
      )}
      <div className="flex items-center shrink-0" style={{ gap: CIRCLE_GAP_PX }}>
        {circles.map((fill, i) => (
          <span
            key={i}
            className="shrink-0 rounded-[15px]"
            style={{
              ...circleStyle,
              background: fill === "blue" ? "#8091FF" : fill === "red" ? "#E53935" : "#FFFFFF",
            }}
            aria-hidden
          />
        ))}
        <Link
          href="/orders"
          className="flex items-center justify-center shrink-0 text-[rgba(16,16,16,0.5)] no-underline hover:text-[#101010]"
          style={{ ...circleStyle, fontFamily: "'TT Firs Neue', sans-serif", fontSize: 14, lineHeight: "215%" }}
        >
          +77
        </Link>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="shrink-0 text-sm text-[#101010] hover:opacity-70 border-0 bg-transparent cursor-pointer"
        style={{ fontFamily: "'TT Firs Neue', sans-serif" }}
      >
        Выход
      </button>
    </header>
  );
}
