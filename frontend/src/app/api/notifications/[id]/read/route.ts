import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008';

/**
 * PUT /api/notifications/:id/read
 * Отметить уведомление как прочитанное
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const response = await axios.put(
      `${NOTIFICATION_SERVICE_URL}/api/notifications/${id}/read`,
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
