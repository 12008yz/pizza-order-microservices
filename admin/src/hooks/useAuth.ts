"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, getAccessToken } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setUser(getUser());
    setLoading(false);
  }, [router]);

  return { user, loading, isAuthenticated: !!user };
}
