import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const AVAILABILITY_SERVICE_URL =
  process.env.AVAILABILITY_SERVICE_URL || 'http://localhost:3006';

/**
 * GET /api/availability/:address_id
 * Получение доступности по ID адреса (buildingId или apartmentId)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { address_id: string } }
) {
  try {
    const { address_id } = params;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'building' или 'apartment'

    let url = `${AVAILABILITY_SERVICE_URL}/api/availability/${address_id}`;
    if (type) {
      url += `?type=${type}`;
    }

    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.response?.data?.error || error.message || 'Availability service error',
      },
      { status: error.response?.status || 500 }
    );
  }
}
