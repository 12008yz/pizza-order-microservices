import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    // Получаем путь из URL напрямую, так как params может быть проблематичным
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    // Убираем 'api' и 'auth' из начала пути
    const path = pathSegments.slice(2).join('/');
    
    const body = await req.json();
    const authHeader = req.headers.get('authorization');

    const targetUrl = `${AUTH_SERVICE_URL}/api/auth/${path}`;

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

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('[Auth API POST] Error:', error.message);
    console.error('[Auth API POST] Error details:', JSON.stringify({
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
    }));
    
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
    const params = await context.params;
    const path = params.path.join('/');
    
    const authHeader = req.headers.get('authorization');

    const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/${path}`, {
      headers: {
        ...(authHeader && { Authorization: authHeader }),
      },
      timeout: 10000,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Auth API Error:', error.message);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.message || error.message 
      },
      { status: error.response?.status || 500 }
    );
  }
}

