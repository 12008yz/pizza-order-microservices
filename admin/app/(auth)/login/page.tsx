"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
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
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-4 rounded-card border border-border bg-background p-6 shadow-card"
      >
        <h1 className="text-lg font-semibold text-center">Вход в админ-панель</h1>
        <Input
          type="text"
          placeholder="Первое слово (напр. А12)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          error={!!error}
        />
        <Input
          type="password"
          placeholder="Второе слово (напр. А13)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          error={!!error}
        />
        {error && <p className="text-sm text-error">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Вход..." : "Подтвердить"}
        </Button>
      </form>
    </div>
  );
}
