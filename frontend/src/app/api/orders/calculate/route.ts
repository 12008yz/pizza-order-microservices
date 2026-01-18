import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3004';

/**
 * POST /api/orders/calculate
 * Расчет стоимости заявки
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await axios.post(
      `${ORDER_SERVICE_URL}/api/orders/calculate`,
      body,
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
