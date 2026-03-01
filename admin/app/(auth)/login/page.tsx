"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { loginAdmin } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (typeof window !== "undefined" && getAccessToken()) {
    router.replace("/orders");
    return null;
  }

  // Кириллические буквы-двойники в латиницу, чтобы «А12» и «A12» давали один логин
  const wordToLogin = (word: string) => {
    const s = word.trim();
    const cyrillicToLatin = (str: string) =>
      str.replace(/[А-Яа-я]/g, (ch) => {
        const map: Record<string, string> = {
          А: "A", а: "a", В: "B", в: "b", Е: "E", е: "e", К: "K", к: "k", М: "M", м: "m",
          Н: "H", н: "h", О: "O", о: "o", Р: "P", р: "p", С: "C", с: "c", Т: "T", т: "t",
          У: "y", у: "y", Х: "X", х: "x",
        };
        return map[ch] ?? ch;
      });
    return cyrillicToLatin(s).toLowerCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const loginEmail = email.includes("@")
        ? email.trim()
        : `${wordToLogin(email)}@admin.local`;
      await loginAdmin({ email: loginEmail, password });
      router.push("/orders");
      router.refresh();
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : "Ошибка входа";
      setError(String(message ?? "Неверный email или пароль"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] relative">
      {/* Форма: отступ слева 60px, снизу 120px */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 absolute w-[280px] max-w-[calc(100vw-120px)] p-5"
        style={{
          left: 60,
          bottom: 120,
          boxSizing: "border-box",
          background: "#FFFFFF",
          border: "1px solid rgba(16, 16, 16, 0.15)",
          backdropFilter: "blur(7.5px)",
          WebkitBackdropFilter: "blur(7.5px)",
          borderRadius: 20,
        }}
      >
        <Input
          type="text"
          placeholder="Мое слово"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          error={!!error}
          className="w-full placeholder:text-[rgba(16,16,16,0.25)]"
        />
        <Input
          type="password"
          placeholder="Чистое слово"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          error={!!error}
          className="w-full placeholder:text-[rgba(16,16,16,0.25)]"
        />
        {error && (
          <p className="text-sm text-[#ef4444]" style={{ fontFamily: "'TT Firs Neue', sans-serif" }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full outline-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          style={{
            boxSizing: "border-box",
            height: 50,
            minHeight: 50,
            background: "#101010",
            border: "1px solid rgba(16, 16, 16, 0.25)",
            borderRadius: 10,
            fontFamily: "'TT Firs Neue', sans-serif",
            fontStyle: "normal",
            fontWeight: 400,
            fontSize: 16,
            lineHeight: "315%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "#FFFFFF",
          }}
        >
          {loading ? "Вход..." : "Подтвердить"}
        </button>
      </form>
    </div>
  );
}
