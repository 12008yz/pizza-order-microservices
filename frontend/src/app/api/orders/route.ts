import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3004';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get('authorization');

    // Заявки можно создавать без авторизации, но если есть токен - передаем его
    const headers: any = {};
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const response = await axios.post(`${ORDER_SERVICE_URL}/api/orders`, body, {
      headers,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.response?.data || error.message },
      { status: error.response?.status || 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = queryString
      ? `${ORDER_SERVICE_URL}/api/orders?${queryString}`
      : `${ORDER_SERVICE_URL}/api/orders`;

    const response = await axios.get(url, {
      headers: {
        Authorization: authHeader,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.response?.data || error.message },
      { status: error.response?.status || 500 }
    );
  }
}
