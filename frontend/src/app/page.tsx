'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

// Используем API Gateway через Next.js API routes
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Array<{ productId: number; quantity: number }>>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      loadProducts();
    }
  }, []);

  const loadProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products`);
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
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
        loadProducts();
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
        loadProducts();
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
    setCart([]);
  };

  const addToCart = (productId: number) => {
    const existingItem = cart.find((item) => item.productId === productId);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { productId, quantity: 1 }]);
    }
  };

  const createOrder = async () => {
    if (!token || cart.length === 0) return;

    try {
      const response = await axios.post(
        `${API_URL}/api/orders`,
        { items: cart },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        alert('Заказ создан успешно!');
        setCart([]);
      }
    } catch (error) {
      console.error('Order error:', error);
      alert('Ошибка создания заказа');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
        <h1>Pizza Order App</h1>
        <div style={{ marginTop: '2rem' }}>
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
        <form onSubmit={isLogin ? handleLogin : handleRegister} style={{ marginTop: '2rem' }}>
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
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Pizza Order App</h1>
        <button onClick={handleLogout} style={{ padding: '0.5rem 1rem' }}>
          Выйти
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        <div>
          <h2>Меню</h2>
          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            {products.map((product) => (
              <div
                key={product.id}
                style={{
                  border: '1px solid #ccc',
                  padding: '1rem',
                  borderRadius: '8px',
                }}
              >
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p style={{ fontWeight: 'bold', marginTop: '0.5rem' }}>
                  {product.price} ₽
                </p>
                <button
                  onClick={() => addToCart(product.id)}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                  }}
                >
                  Добавить в корзину
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2>Корзина</h2>
          {cart.length === 0 ? (
            <p>Корзина пуста</p>
          ) : (
            <>
              <div style={{ marginTop: '1rem' }}>
                {cart.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  return (
                    <div key={item.productId} style={{ marginBottom: '0.5rem' }}>
                      {product?.name} x{item.quantity}
                    </div>
                  );
                })}
              </div>
              <button
                onClick={createOrder}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  width: '100%',
                  cursor: 'pointer',
                }}
              >
                Оформить заказ
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

