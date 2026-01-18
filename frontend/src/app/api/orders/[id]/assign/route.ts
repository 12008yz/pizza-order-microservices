import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://order-service:3004';

/**
 * PUT /api/orders/:id/assign
 * Назначение менеджера на заявку
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const authHeader = req.headers.get('authorization');

    // Назначение менеджера требует авторизации
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const response = await axios.put(
      `${ORDER_SERVICE_URL}/api/orders/${id}/assign`,
      body,
      {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
      }
    );

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
