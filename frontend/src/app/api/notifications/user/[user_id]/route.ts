import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3008';

/**
 * GET /api/notifications/user/:user_id
 * Получить уведомления пользователя
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { user_id: string } }
) {
  try {
    const { user_id } = params;

    const response = await axios.get(
      `${NOTIFICATION_SERVICE_URL}/api/notifications/user/${user_id}`,
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
