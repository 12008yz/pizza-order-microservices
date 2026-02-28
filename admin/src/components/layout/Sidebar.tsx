"use client";

import { useState, useEffect } from "react";
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
];

const secondPanelItems = [
  { label: "Дублирование", value: "duplicate" },
  { label: "Архивирование", value: "archived" },
];

const navItems = [
  { href: "/addresses", label: "База адресов" },
  { href: "/tariffs", label: "База планов" },
];

/* Пиксельные константы из макета (без %) */
const SIDEBAR_WIDTH_PX = 240;
const PANEL_PADDING_PX = 20;
const ROW_HEIGHT_PX = 30;
const CIRCLE_SIZE_PX = 20;
const GAP_CIRCLE_TEXT_PX = 8;
const GAP_BETWEEN_ITEMS_PX = 10;
const GAP_BETWEEN_SECTIONS_PX = 5;
const PANEL_BORDER_RADIUS_PX = 20;
const PANEL_BORDER = "1px solid rgba(16, 16, 16, 0.15)";

/** Стиль текста пунктов левого меню (как в макете: И. Ивановых и др.) */
const menuTextStyle: React.CSSProperties = {
  fontFamily: "'TT Firs Neue', sans-serif",
  fontStyle: "normal",
  fontWeight: 400,
  fontSize: 16,
  lineHeight: "125%",
  display: "flex",
  alignItems: "center",
  color: "#101010",
};

const panelStyle: React.CSSProperties = {
  boxSizing: "border-box",
  background: "#FFFFFF",
  border: PANEL_BORDER,
  backdropFilter: "blur(7.5px)",
  WebkitBackdropFilter: "blur(7.5px)",
  borderRadius: PANEL_BORDER_RADIUS_PX,
  padding: PANEL_PADDING_PX,
};

/** Круг 20×20 как в макете (Rectangle 70/90/89) — без обводки строки */
function HollowCircle() {
  return (
    <span
      className="shrink-0 rounded-full bg-white"
      style={{
        width: CIRCLE_SIZE_PX,
        height: CIRCLE_SIZE_PX,
        minWidth: CIRCLE_SIZE_PX,
        minHeight: CIRCLE_SIZE_PX,
        border: PANEL_BORDER,
        borderRadius: 100,
        boxSizing: "border-box",
      }}
      aria-hidden
    />
  );
}

/** Круг для «Все» — такой же как у всех (opacity 0.5 задаётся на строке), без синей точки */
function GrayCircle() {
  return <HollowCircle />;
}

/** Строка пункта: только круг 20px слева + текст, без рамки (пиксели) */
function MenuRow({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn("flex items-center", className)}
      style={{
        minHeight: ROW_HEIGHT_PX,
        height: ROW_HEIGHT_PX,
        gap: GAP_CIRCLE_TEXT_PX,
        ...menuTextStyle,
        ...style,
      }}
    >
      <HollowCircle />
      <span className="flex-1 min-w-0 truncate" style={{ width: 160 }}>
        {children}
      </span>
    </div>
  );
}

/** Строка с двумя кругами: круг слева + текст + круг справа (И. Ивановых) */
function UserRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        minHeight: ROW_HEIGHT_PX,
        height: ROW_HEIGHT_PX,
        gap: GAP_CIRCLE_TEXT_PX,
        ...menuTextStyle,
      }}
    >
      <div className="flex items-center gap-[8px] flex-1 min-w-0">
        <HollowCircle />
        <span className="truncate" style={{ width: 160 }}>
          {children}
        </span>
      </div>
      <HollowCircle />
    </div>
  );
}

export function Sidebar({
  status,
  onStatusChange,
  pathname,
}: {
  status: string;
  onStatusChange: (s: string) => void;
  pathname?: string;
}) {
  const currentPathname = usePathname();
  const path = pathname ?? currentPathname;
  const [initials, setInitials] = useState("И. Ивановых");

  useEffect(() => {
    const user = getUser();
    const value = user?.name?.split(/\s+/).map((n) => n.charAt(0)).join(". ") ?? "И. Ивановых";
    setInitials(value);
  }, []);

  return (
    <aside
      className="shrink-0 flex flex-col"
      style={{
        width: SIDEBAR_WIDTH_PX,
        marginLeft: 0,
        gap: GAP_BETWEEN_SECTIONS_PX,
      }}
    >
      {/* Верхняя панель: всегда одна и та же — И. Ивановых + Все + статусы (на всех страницах) */}
      <div
        className="flex flex-col"
        style={{
          ...panelStyle,
          gap: GAP_BETWEEN_ITEMS_PX,
        }}
      >
        <UserRow>{initials}</UserRow>

        {path === "/orders" ? (
          <>
            {statusFilters.map(({ label, value }) => {
              const isActive = status === value;
              return (
                <label
                  key={value || "all"}
                  className="flex items-center cursor-pointer"
                  style={{
                    minHeight: ROW_HEIGHT_PX,
                    height: ROW_HEIGHT_PX,
                    gap: GAP_CIRCLE_TEXT_PX,
                    opacity: isActive ? 0.5 : 1,
                    ...menuTextStyle,
                  }}
                >
                  <input
                    type="radio"
                    name="status"
                    value={value}
                    checked={isActive}
                    onChange={() => onStatusChange(value)}
                    className="sr-only"
                  />
                  <span
                    className="shrink-0 flex items-center justify-center"
                    style={{ width: CIRCLE_SIZE_PX, height: CIRCLE_SIZE_PX }}
                  >
                    {isActive ? <GrayCircle /> : <HollowCircle />}
                  </span>
                  <span style={{ width: 160 }}>{label}</span>
                </label>
              );
            })}
          </>
        ) : (
          <>
            {statusFilters.map(({ label, value }) => (
              <Link
                key={value || "all"}
                href={value ? `/orders?status=${value}` : "/orders"}
                className="flex items-center no-underline hover:opacity-80"
                style={{
                  minHeight: ROW_HEIGHT_PX,
                  height: ROW_HEIGHT_PX,
                  gap: GAP_CIRCLE_TEXT_PX,
                  ...menuTextStyle,
                }}
              >
                <span
                  className="shrink-0 flex items-center justify-center"
                  style={{ width: CIRCLE_SIZE_PX, height: CIRCLE_SIZE_PX }}
                >
                  <HollowCircle />
                </span>
                <span style={{ width: 160 }}>{label}</span>
              </Link>
            ))}
          </>
        )}
      </div>

      {/* Вторая панель: Дублирование, Архивирование */}
      <div
        className="flex flex-col"
        style={{
          ...panelStyle,
          gap: GAP_BETWEEN_ITEMS_PX,
        }}
      >
        {secondPanelItems.map(({ label }) => (
          <MenuRow key={label}>{label}</MenuRow>
        ))}
      </div>

      {/* Третья панель: База адресов, База планов */}
      <div
        className="flex flex-col"
        style={{
          ...panelStyle,
          gap: GAP_BETWEEN_ITEMS_PX,
        }}
      >
        {navItems.map(({ href, label }) => {
          const isActive = path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center no-underline hover:opacity-80"
              style={{
                minHeight: ROW_HEIGHT_PX,
                height: ROW_HEIGHT_PX,
                gap: GAP_CIRCLE_TEXT_PX,
                opacity: isActive ? 0.5 : 1,
                ...menuTextStyle,
              }}
            >
              <span
                className="shrink-0 flex items-center justify-center"
                style={{ width: CIRCLE_SIZE_PX, height: CIRCLE_SIZE_PX }}
              >
                {isActive ? <GrayCircle /> : <HollowCircle />}
              </span>
              <span style={{ width: 160 }}>{label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
