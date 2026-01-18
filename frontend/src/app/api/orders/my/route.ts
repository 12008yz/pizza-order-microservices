import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3004';

/**
 * GET /api/orders/my
 * Получение моих заявок (требует авторизации)
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const response = await axios.get(`${ORDER_SERVICE_URL}/api/orders/my`, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
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
