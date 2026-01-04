'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

// Отключаем статическую генерацию для этой страницы
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Используем API Gateway через Next.js API routes
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Tariff {
  id: number;
  name: string;
  description: string;
  speed: number;
  price: number;
  connectionPrice: number;
  technology: string;
  hasTV: boolean;
  tvChannels?: number;
  hasMobile: boolean;
  provider?: {
    id: number;
    name: string;
    logo: string;
    rating: number;
  };
}

interface Provider {
  id: number;
  name: string;
  slug: string;
  logo: string;
  rating: number;
  reviewsCount: number;
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [house, setHouse] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/providers`);
      if (response.data.success) {
        setProviders(response.data.data);
      }
    } catch (error) {
      console.error('Error loading providers:', error);
    }
  };

  const loadTariffs = async () => {
    try {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (street) params.append('street', street);
      if (house) params.append('house', house);

      const response = await axios.get(`${API_URL}/api/tariffs?${params.toString()}`);
      if (response.data.success) {
        setTariffs(response.data.data);
      }
    } catch (error) {
      console.error('Error loading tariffs:', error);
      alert('Ошибка загрузки тарифов');
    }
  };

  const handleCheckAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city) {
      alert('Введите город');
      return;
    }
    await loadTariffs();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });
      if (response.data.success) {
        const accessToken = response.data.data.accessToken;
        localStorage.setItem('token', accessToken);
        setToken(accessToken);
        setIsAuthenticated(true);
        setShowAuth(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Ошибка входа');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email,
        password,
        name,
      });
      if (response.data.success) {
        const accessToken = response.data.data.accessToken;
        localStorage.setItem('token', accessToken);
        setToken(accessToken);
        setIsAuthenticated(true);
        setShowAuth(false);
      }
    } catch (error) {
      console.error('Register error:', error);
      alert('Ошибка регистрации');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Агрегатор интернет-провайдеров</h1>
        <div>
          {isAuthenticated ? (
            <>
              <Link href="/my-applications" style={{ marginRight: '1rem', textDecoration: 'none' }}>
                Мои заявки
              </Link>
              <button onClick={handleLogout} style={{ padding: '0.5rem 1rem' }}>
                Выйти
              </button>
            </>
          ) : (
            <button onClick={() => setShowAuth(!showAuth)} style={{ padding: '0.5rem 1rem' }}>
              Войти / Регистрация
            </button>
          )}
        </div>
      </div>

      {showAuth && !isAuthenticated && (
        <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={() => setIsLogin(true)}
              style={{ marginRight: '1rem', padding: '0.5rem 1rem' }}
            >
              Вход
            </button>
            <button
              onClick={() => setIsLogin(false)}
              style={{ padding: '0.5rem 1rem' }}
            >
              Регистрация
            </button>
          </div>
          <form onSubmit={isLogin ? handleLogin : handleRegister}>
            {!isLogin && (
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </div>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            <button
              type="submit"
              style={{ width: '100%', padding: '0.5rem', marginTop: '1rem' }}
            >
              {isLogin ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </form>
        </div>
      )}

      {/* Hero-секция с формой проверки адреса */}
      <div style={{ marginBottom: '3rem', padding: '2rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2 style={{ marginBottom: '1rem' }}>Проверьте доступность интернета по вашему адресу</h2>
        <form onSubmit={handleCheckAddress}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Город *</label>
              <input
                type="text"
                placeholder="Москва"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Улица</label>
              <input
                type="text"
                placeholder="Тверская"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Дом</label>
              <input
                type="text"
                placeholder="10"
                value={house}
                onChange={(e) => setHouse(e.target.value)}
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            <button
              type="submit"
              style={{ padding: '0.5rem 2rem', height: 'fit-content' }}
            >
              Проверить
            </button>
          </div>
        </form>
      </div>

      {/* Список тарифов */}
      {tariffs.length > 0 && (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Доступные тарифы</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {tariffs.map((tariff) => (
              <div
                key={tariff.id}
                style={{
                  border: '1px solid #ccc',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3>{tariff.name}</h3>
                  <p>{tariff.description}</p>
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
                    <span>Скорость: {tariff.speed} Мбит/с</span>
                    <span>Технология: {tariff.technology}</span>
                    {tariff.hasTV && <span>ТВ: {tariff.tvChannels} каналов</span>}
                    {tariff.hasMobile && <span>Мобильная связь</span>}
                  </div>
                  {tariff.provider && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                      Провайдер: {tariff.provider.name} (⭐ {tariff.provider.rating})
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', marginLeft: '2rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {tariff.price} ₽/мес
                  </div>
                  {tariff.promoPrice && (
                    <div style={{ fontSize: '0.9rem', color: 'green' }}>
                      Акция: {tariff.promoPrice} ₽/мес
                    </div>
                  )}
                  {tariff.connectionPrice === 0 && (
                    <div style={{ fontSize: '0.9rem', color: 'green' }}>Бесплатное подключение</div>
                  )}
                  <Link
                    href={`/application?tariffId=${tariff.id}`}
                    style={{
                      display: 'inline-block',
                      marginTop: '0.5rem',
                      padding: '0.5rem 1rem',
                      background: '#0070f3',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '4px',
                    }}
                  >
                    Подключить
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Список провайдеров */}
      {providers.length > 0 && tariffs.length === 0 && (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Провайдеры</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {providers.map((provider) => (
              <Link
                key={provider.id}
                href={`/provider/${provider.id}`}
                style={{
                  border: '1px solid #ccc',
                  padding: '1rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <h3>{provider.name}</h3>
                <div style={{ marginTop: '0.5rem' }}>
                  ⭐ {provider.rating} ({provider.reviewsCount} отзывов)
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
