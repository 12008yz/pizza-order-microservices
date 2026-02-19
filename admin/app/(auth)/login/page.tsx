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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginAdmin({ email, password });
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
          type="email"
          placeholder="Мое слово"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          error={!!error}
        />
        <Input
          type="password"
          placeholder="Чистое слово"
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
