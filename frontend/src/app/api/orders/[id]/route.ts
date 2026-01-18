import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://order-service:3004';

/**
 * GET /api/orders/:id
 * Получение заявки по ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const authHeader = req.headers.get('authorization');

    // Заявки можно получать без авторизации, но если есть токен - передаем его
    const headers: any = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const response = await axios.get(`${ORDER_SERVICE_URL}/api/orders/${id}`, {
      headers,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.response?.data?.error || error.message || 'Order service error',
      },
      { status: error.response?.status || 500 }
    );
  }
}
