import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3004';

/**
 * GET /api/orders/:id/status-history
 * Получение истории статусов заявки
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const response = await axios.get(
      `${ORDER_SERVICE_URL}/api/orders/${id}/status-history`,
      {
        headers: {
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
