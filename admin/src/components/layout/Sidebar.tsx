"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

const statusFilters = [
  { label: "Все", value: "" },
  { label: "Формирование", value: "new" },
  { label: "Наведение", value: "processing" },
  { label: "Подключение", value: "connected" },
  { label: "Конкретизирование", value: "contacted" },
  { label: "Вознаграждение", value: "scheduled" },
  { label: "Дублирование", value: "duplicate" },
  { label: "Архивированные", value: "archived" },
];

const navItems = [
  { href: "/orders", label: "Заявки" },
  { href: "/addresses", label: "База адресов" },
  { href: "/tariffs", label: "База планов" },
];

export function Sidebar({ status, onStatusChange }: { status: string; onStatusChange: (s: string) => void }) {
  const pathname = usePathname();
  const user = typeof window !== "undefined" ? getUser() : null;

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-muted/30 flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-medium">
            {user?.name?.charAt(0) ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name ?? "Пользователь"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {pathname === "/orders" && (
        <div className="p-3 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">Статусы</p>
          <div className="space-y-1">
            {statusFilters.map(({ label, value }) => (
              <label
                key={value || "all"}
                className={cn(
                  "flex items-center gap-2 py-1 px-2 rounded cursor-pointer text-sm",
                  status === value ? "bg-foreground text-background" : "hover:bg-border/50"
                )}
              >
                <input
                  type="radio"
                  name="status"
                  value={value}
                  checked={status === value}
                  onChange={() => onStatusChange(value)}
                  className="sr-only"
                />
                <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                {label}
              </label>
            ))}
          </div>
        </div>
      )}

      <nav className="p-3 flex-1">
        <p className="text-xs font-medium text-muted-foreground mb-2">Навигация</p>
        <ul className="space-y-0.5">
          {navItems.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "block py-2 px-3 rounded-input text-sm",
                  pathname.startsWith(href)
                    ? "bg-foreground text-background"
                    : "text-foreground hover:bg-border/50"
                )}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
