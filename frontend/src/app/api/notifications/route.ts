import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3008';

/**
 * POST /api/notifications
 * Отправить уведомление
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await axios.post(
      `${NOTIFICATION_SERVICE_URL}/api/notifications`,
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
        error: error.response?.data?.error || error.message || 'Notification service error',
      },
      { status: error.response?.status || 500 }
    );
  }
}
