export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("7")) {
    return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
  }
  return phone;
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatPrice(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${value} р.`;
}

export function formatPriceMonthly(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${value} р./мес.`;
}

/** Из отображаемой строки телефона (+7 111 111-11-11) в сырой (71111111111). */
export function parsePhoneFromDisplay(display: string): string {
  const digits = display.replace(/\D/g, "");
  if (digits.length === 10) return "7" + digits;
  if (digits.length === 11 && digits.startsWith("7")) return digits;
  return digits || "";
}

/** Из отображаемой даты (DD.MM.YYYY или —) в ISO YYYY-MM-DD или null. */
export function parseDateFromDisplay(display: string): string | null {
  const s = display.trim();
  if (!s || s === "—") return null;
  const match = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return `${y}-${m!.padStart(2, "0")}-${d!.padStart(2, "0")}`;
  }
  const d = new Date(s);
  return !Number.isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : null;
}

/** Из отображаемой цены ("890 р./мес." / "890 р.") в число или null. */
export function parsePriceFromDisplay(display: string): number | null {
  const s = display.replace(/\s/g, "").replace(/[^\d.,\-]/g, "").replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isNaN(n) ? null : n;
}
