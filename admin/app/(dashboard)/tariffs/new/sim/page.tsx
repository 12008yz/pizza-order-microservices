"use client";

import Link from "next/link";

const fontFamily = "'TT Firs Neue', sans-serif";

export default function SimPage() {
  return (
    <div
      style={{
        boxSizing: "border-box",
        width: 915,
        minHeight: 380,
        background: "#FFFFFF",
        borderRadius: 20,
        border: "1px solid rgba(16, 16, 16, 0.15)",
        padding: 20,
        fontFamily,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <h1 style={{ fontFamily, fontWeight: 400, fontSize: 16, lineHeight: "185%", color: "#101010", margin: 0 }}>
          SIM
        </h1>
        <Link
          href="/tariffs"
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            border: "1px solid rgba(16, 16, 16, 0.15)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#FFFFFF",
            textDecoration: "none",
          }}
          aria-label="Закрыть"
        />
      </div>
      <p style={{ color: "rgba(16,16,16,0.5)", marginBottom: 20 }}>Блок SIM — в разработке.</p>
      <Link
        href="/tariffs/new"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 50,
          height: 50,
          border: "1px solid rgba(16, 16, 16, 0.15)",
          borderRadius: 10,
          background: "#FFFFFF",
          color: "#101010",
          textDecoration: "none",
          fontFamily,
        }}
      >
        ← Назад
      </Link>
    </div>
  );
}
