'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: 'system-ui, sans-serif',
        backgroundColor: '#F5F5F5',
      }}
    >
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Что-то пошло не так</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>Попробуйте обновить страницу</p>
      <div style={{ display: 'flex', gap: 16 }}>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: '8px 16px',
            background: '#E30611',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Повторить
        </button>
        <Link
          href="/"
          style={{
            padding: '8px 16px',
            color: '#E30611',
            textDecoration: 'underline',
          }}
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
