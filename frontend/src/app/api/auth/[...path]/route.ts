import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Функция для получения URL сервиса (читаем переменную в runtime)
function getAuthServiceUrl(): string {
  // В Next.js переменные окружения доступны через process.env в runtime
  // Но они должны быть установлены до сборки или использоваться напрямую
  const url = process.env.AUTH_SERVICE_URL;
  console.log('[getAuthServiceUrl] process.env.AUTH_SERVICE_URL:', url);
  console.log('[getAuthServiceUrl] all SERVICE env vars:', Object.keys(process.env).filter(k => k.includes('SERVICE')));
  // Если переменная не установлена, используем значение по умолчанию
  return url || 'http://auth-service:3001';
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const AUTH_SERVICE_URL = getAuthServiceUrl();
    
    // Логируем переменные окружения
    console.log('[Auth API POST] AUTH_SERVICE_URL from env:', process.env.AUTH_SERVICE_URL);
    console.log('[Auth API POST] AUTH_SERVICE_URL resolved:', AUTH_SERVICE_URL);
    
    // Получаем путь из URL напрямую, так как params может быть проблематичным
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    // Убираем 'api' и 'auth' из начала пути
    const path = pathSegments.slice(2).join('/');
    
    console.log('[Auth API POST] Request URL:', req.url);
    console.log('[Auth API POST] Path segments:', pathSegments);
    console.log('[Auth API POST] Extracted path:', path);
    
    const body = await req.json();
    const authHeader = req.headers.get('authorization');

    const targetUrl = `${AUTH_SERVICE_URL}/api/auth/${path}`;
    console.log('[Auth API POST] Target URL:', targetUrl);
    console.log('[Auth API POST] Request body keys:', Object.keys(body));

    const response = await axios.post(
      targetUrl,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { Authorization: authHeader }),
        },
        timeout: 10000,
      }
    );

    console.log('[Auth API POST] Response status:', response.status);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('[Auth API POST] Error:', error.message);
    console.error('[Auth API POST] Error code:', error.code);
    console.error('[Auth API POST] Error response:', error.response?.data);
    console.error('[Auth API POST] Error status:', error.response?.status);
    console.error('[Auth API POST] Error config URL:', error.config?.url);
    console.error('[Auth API POST] AUTH_SERVICE_URL was:', getAuthServiceUrl());
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.message || error.message || 'Internal server error'
      },
      { status: error.response?.status || 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const AUTH_SERVICE_URL = getAuthServiceUrl();
    
    // Получаем путь из URL напрямую
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    // Убираем 'api' и 'auth' из начала пути
    const path = pathSegments.slice(2).join('/');
    
    const authHeader = req.headers.get('authorization');

    const targetUrl = `${AUTH_SERVICE_URL}/api/auth/${path}`;

    const response = await axios.get(targetUrl, {
      headers: {
        ...(authHeader && { Authorization: authHeader }),
      },
      timeout: 10000,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('[Auth API GET] Error:', error.message);
    console.error('[Auth API GET] Error details:', JSON.stringify({
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
    }));
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.message || error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
}

