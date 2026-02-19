import Link from 'next/link';

export default function NotFound() {
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
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Страница не найдена</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>404</p>
      <Link
        href="/"
        style={{
          color: '#E30611',
          textDecoration: 'underline',
        }}
      >
        На главную
      </Link>
    </div>
  );
}
